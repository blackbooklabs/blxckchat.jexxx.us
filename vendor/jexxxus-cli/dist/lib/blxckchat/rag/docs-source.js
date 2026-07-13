import * as fs from "fs";
import * as path from "path";
import { resolveDocsSourcePath } from "../../path-resolver.js";
import { htmlToMarkdownish } from "./html-to-markdown.js";
/**
 * Locates docs.jexxx.us content for the RAG index. Local checkout
 * (src/content/*.md) is used when available via JEXXXUS_DOCS_SOURCE_PATH —
 * fastest, no network dependency. Otherwise falls back to the public RSS
 * feed (https://docs.jexxx.us/feed.xml), which carries full page content via
 * <content:encoded> and is already solid for AEO/SEO, making it a clean,
 * low-maintenance source for anyone without a local clone.
 *
 * Obsidian vault content (internal incident writeups, unreleased plans) is
 * intentionally never referenced here; see jexxx.us-obsidian/JEXXXUS
 * CLI/BLXCKCHAT-Agent.md for the documented security rationale.
 */
const DOCS_DEFAULT_BASE_URL = "https://docs.jexxx.us";
const ALLOWED_DOCS_HOSTS = new Set(["docs.jexxx.us", "localhost", "127.0.0.1"]);
function getDocsPublicBaseUrl() {
    const raw = process.env.DOCS_PUBLIC_BASE_URL?.trim();
    const candidate = raw && raw.startsWith("http") ? raw : DOCS_DEFAULT_BASE_URL;
    const parsed = new URL(candidate);
    const isLoopback = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (!isLoopback && parsed.protocol !== "https:") {
        throw new Error("[Docs] Public Docs base URL must use HTTPS.");
    }
    if (!ALLOWED_DOCS_HOSTS.has(parsed.hostname)) {
        throw new Error(`[Docs] Public base URL host not allowed: ${parsed.hostname}. ` +
            "Only docs.jexxx.us (or localhost for dev) is permitted.");
    }
    return candidate.replace(/\/$/, "");
}
function decodeXmlEntities(value) {
    return value
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
}
function extractXmlTag(block, tag) {
    const patterns = [
        new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i"),
        new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"),
    ];
    for (const pattern of patterns) {
        const match = block.match(pattern);
        if (match?.[1]) {
            return decodeXmlEntities(match[1].trim());
        }
    }
    return undefined;
}
function slugFromDocUrl(url, baseUrl) {
    const prefix = `${baseUrl.replace(/\/$/, "")}/`;
    if (url.startsWith(prefix)) {
        const rest = url.slice(prefix.length).replace(/\/$/, "");
        return rest || "index";
    }
    const parts = url.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "index";
}
/** Parse the public Docs RSS feed into DocFile-shaped chunks (markdown-ish text). */
export function parseDocsRssFeed(xml, baseUrl = getDocsPublicBaseUrl()) {
    const items = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
    const files = [];
    for (const item of items) {
        const title = extractXmlTag(item, "title");
        const link = extractXmlTag(item, "link");
        const encoded = extractXmlTag(item, "content:encoded");
        if (!title || !link || !encoded)
            continue;
        const slug = slugFromDocUrl(link, baseUrl);
        const body = htmlToMarkdownish(encoded);
        files.push({
            filename: `${slug}.md`,
            content: `# ${title}\n\n${body}`,
        });
    }
    return files;
}
let rssCache = null;
const RSS_CACHE_MS = 5 * 60 * 1000;
async function fetchDocsRssContent(force = false) {
    const now = Date.now();
    if (!force && rssCache && now - rssCache.fetchedAt < RSS_CACHE_MS) {
        return rssCache.files;
    }
    const baseUrl = getDocsPublicBaseUrl();
    const feedUrl = `${baseUrl}/feed.xml`;
    const response = await fetch(feedUrl, {
        headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!response.ok) {
        throw new Error(`[Docs] Failed to fetch public feed (${response.status}): ${feedUrl}`);
    }
    const xml = await response.text();
    const files = parseDocsRssFeed(xml, baseUrl);
    rssCache = { fetchedAt: now, files };
    return files;
}
function loadLocalDocsContent() {
    const basePath = resolveDocsSourcePath();
    if (!basePath)
        return null;
    const contentPath = path.join(basePath, "src", "content");
    if (!fs.existsSync(contentPath))
        return null;
    const entries = fs.readdirSync(contentPath);
    return entries
        .filter((e) => e.endsWith(".md"))
        .map((filename) => ({
        filename,
        content: fs.readFileSync(path.join(contentPath, filename), "utf-8"),
    }));
}
/** Local checkout when available (JEXXXUS_DOCS_SOURCE_PATH), else public RSS feed. */
export async function loadDocsContent() {
    const local = loadLocalDocsContent();
    if (local)
        return local;
    return fetchDocsRssContent();
}
/** Content hash used to invalidate the cached index when docs change. */
export function docsContentHash(files) {
    const combined = files
        .map((f) => `${f.filename}:${f.content.length}`)
        .sort()
        .join("|");
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash = (hash * 31 + combined.charCodeAt(i)) | 0;
    }
    return hash.toString(16);
}
/** Reset RSS cache — for tests only. */
export function resetDocsRssCacheForTests() {
    rssCache = null;
}
//# sourceMappingURL=docs-source.js.map