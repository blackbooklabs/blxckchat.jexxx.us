import * as fs from "fs";
import * as path from "path";
import { resolveTvRepoPath } from "./path-resolver.js";
import { assertAllowedTvPublicBaseUrl, readPublicJsonCatalog, readPublicLlmsFile, } from "./tv-security.js";
/**
 * Read-only access to **public** JEXXXUS | TV videos — the same catalog on
 * tv.jexxx.us. Never reads internal Obsidian TV docs, Supabase credentials,
 * or raw stream/embed URLs. Operators with a local clone use videos.json;
 * remote users use public llms-full.txt / feed.xml.
 */
export const TV_DEFAULT_BASE_URL = "https://tv.jexxx.us";
let remoteCache = null;
const REMOTE_CACHE_MS = 5 * 60 * 1000;
function getRepoRootPath() {
    const resolved = resolveTvRepoPath();
    if (!resolved) {
        // Log helpful message for users without local TV repo
        console.debug("[TV] Local TV repo not configured. Set JEXXXUS_TV_REPO_PATH env var for local catalog, or use remote endpoints.");
    }
    return resolved;
}
export function getTvPublicBaseUrl() {
    const raw = process.env.TV_PUBLIC_BASE_URL?.trim();
    const candidate = raw && raw.startsWith("http") ? raw : TV_DEFAULT_BASE_URL;
    return assertAllowedTvPublicBaseUrl(candidate);
}
export function getTvPublicEndpoints(baseUrl = getTvPublicBaseUrl()) {
    return {
        site: baseUrl,
        feed: `${baseUrl}/feed.xml`,
        sitemap: `${baseUrl}/sitemap.xml`,
        sitemapVideo: `${baseUrl}/sitemap-video.xml`,
        robots: `${baseUrl}/robots.txt`,
        llms: `${baseUrl}/llms.txt`,
        llmsFull: `${baseUrl}/llms-full.txt`,
        playlists: `${baseUrl}/playlists`,
        subscription: `${baseUrl}/subscription`,
    };
}
export function slugifyTv(text) {
    return text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .trim()
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}
function videoUrl(slug, baseUrl) {
    return `${baseUrl}/video/${slug}`;
}
function normalizeCategories(value) {
    if (!value)
        return [];
    return Array.isArray(value) ? value.filter(Boolean) : [value];
}
/** Mirrors tv.jexxx.us/src/lib/algorithm.ts's parseViewCount (K/M suffixes). */
function parseViewCount(value) {
    if (value === undefined || value === null)
        return undefined;
    if (typeof value === "number")
        return Number.isFinite(value) ? Math.round(value) : undefined;
    const str = value.trim();
    const num = Number.parseFloat(str.replace(/,/g, ""));
    if (Number.isNaN(num))
        return undefined;
    if (str.toLowerCase().endsWith("m"))
        return Math.round(num * 1_000_000);
    if (str.toLowerCase().endsWith("k"))
        return Math.round(num * 1_000);
    return Math.round(num);
}
function rowToMeta(row, baseUrl, source) {
    const slug = row.slug ? slugifyTv(row.slug) : row.id ? slugifyTv(row.id) : "";
    const title = row.title?.trim();
    if (!slug || !title)
        return null;
    const meta = {
        slug,
        title,
        description: row.description?.trim() || title,
        url: videoUrl(slug, baseUrl),
        categories: normalizeCategories(row.category),
        tags: row.tags ?? [],
        source,
    };
    if (row.duration)
        meta.duration = row.duration;
    if (row.uploadDate)
        meta.uploadDate = row.uploadDate;
    if (row.channel)
        meta.channel = row.channel;
    if (row.thumbnail)
        meta.thumbnail = row.thumbnail;
    if (row.id)
        meta.id = row.id;
    const views = parseViewCount(row.views);
    if (views !== undefined)
        meta.views = views;
    if (row.interactions) {
        meta.interactions = {
            likes: row.interactions.likes ?? 0,
            saves: row.interactions.saves ?? 0,
            shares: row.interactions.shares ?? 0,
        };
    }
    return meta;
}
function resolveLocalVideosJsonPath() {
    const root = getRepoRootPath();
    if (!root)
        return null;
    const jsonPath = path.join(root, "src", "data", "videos.json");
    return fs.existsSync(jsonPath) ? jsonPath : null;
}
function resolveLocalLlmsFullPath() {
    const root = getRepoRootPath();
    if (!root)
        return null;
    const llmsPath = path.join(root, "public", "llms-full.txt");
    return fs.existsSync(llmsPath) ? llmsPath : null;
}
function loadLocalVideosJson() {
    const jsonPath = resolveLocalVideosJsonPath();
    if (!jsonPath)
        return null;
    const baseUrl = getTvPublicBaseUrl();
    const raw = JSON.parse(readPublicJsonCatalog(jsonPath));
    if (!Array.isArray(raw))
        return null;
    const videos = [];
    for (const row of raw) {
        const meta = rowToMeta(row, baseUrl, "local");
        if (!meta)
            continue;
        videos.push({ ...meta, body: meta.description });
    }
    videos.sort((a, b) => new Date(b.uploadDate || 0).getTime() - new Date(a.uploadDate || 0).getTime());
    return videos;
}
function loadLocalLlmsFull() {
    const root = getRepoRootPath();
    if (!root)
        return null;
    const publicDir = path.join(root, "public");
    const llmsPath = path.join(publicDir, "llms-full.txt");
    if (!fs.existsSync(llmsPath))
        return null;
    const text = readPublicLlmsFile(publicDir, "llms-full.txt");
    return parseTvLlmsFullText(text, getTvPublicBaseUrl(), "llms-full");
}
/** Parse public llms-full.txt (prebuild artifact on tv.jexxx.us). */
export function parseTvLlmsFullText(text, baseUrl = getTvPublicBaseUrl(), source = "llms-full") {
    const videos = [];
    const blocks = text.includes("\n### ")
        ? text.split(/\n### /).slice(1)
        : text.trimStart().startsWith("### ")
            ? [text.trimStart().slice(4)]
            : [];
    for (const block of blocks) {
        const lines = block.split("\n");
        const title = lines[0]?.trim();
        if (!title)
            continue;
        let url = "";
        let duration = "";
        let uploadDate = "";
        let description = title;
        const categories = [];
        const tags = [];
        for (const line of lines.slice(1)) {
            const trimmed = line.trim();
            if (trimmed.startsWith("- URL:")) {
                url = trimmed.slice(6).trim();
            }
            else if (trimmed.startsWith("- Duration:")) {
                duration = trimmed.slice(11).trim();
            }
            else if (trimmed.startsWith("- Upload Date:")) {
                uploadDate = trimmed.slice(14).trim();
            }
            else if (trimmed.startsWith("- Categories:")) {
                categories.push(...trimmed
                    .slice(13)
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean));
            }
            else if (trimmed.startsWith("- Tags:")) {
                tags.push(...trimmed
                    .slice(7)
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean));
            }
            else if (trimmed.startsWith("- Description:")) {
                description = trimmed.slice(14).trim();
            }
        }
        const slug = slugFromVideoUrl(url, baseUrl) ?? slugifyTv(title);
        if (!slug)
            continue;
        const meta = {
            slug,
            title,
            description,
            url: url || videoUrl(slug, baseUrl),
            categories,
            tags,
            source,
        };
        if (duration)
            meta.duration = duration;
        if (uploadDate)
            meta.uploadDate = uploadDate;
        videos.push({ ...meta, body: description });
    }
    return videos;
}
/** Parse compact llms.txt (edge or static prebuild). */
export function parseTvLlmsText(text, baseUrl = getTvPublicBaseUrl()) {
    const videos = [];
    const lines = text.split("\n");
    let pending = null;
    for (const line of lines) {
        const trimmed = line.trim();
        const bullet = trimmed.match(/^- (.+): (https?:\/\/.+)$/);
        if (bullet) {
            if (pending)
                videos.push(pending);
            const titlePart = bullet[1];
            const url = bullet[2];
            const bracket = titlePart.match(/^(.+?) \[(.+)\]$/);
            const title = bracket ? bracket[1].trim() : titlePart.trim();
            const categories = bracket ? [bracket[2].trim()] : [];
            const slug = slugFromVideoUrl(url, baseUrl) ?? slugifyTv(title);
            pending = {
                slug,
                title,
                description: title,
                url,
                categories,
                tags: [],
                source: "llms",
                body: title,
            };
            continue;
        }
        if (pending) {
            if (trimmed.startsWith("- Categories:")) {
                pending.categories = trimmed
                    .slice(13)
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean);
            }
            else if (trimmed.startsWith("- Tags:")) {
                pending.tags = trimmed
                    .slice(7)
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
            }
        }
    }
    if (pending)
        videos.push(pending);
    return videos;
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
        if (match?.[1])
            return decodeXmlEntities(match[1].trim());
    }
    return undefined;
}
function slugFromVideoUrl(url, baseUrl) {
    const prefix = `${baseUrl.replace(/\/$/, "")}/video/`;
    if (url.startsWith(prefix)) {
        return url.slice(prefix.length).replace(/\/$/, "");
    }
    const parts = url.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last ? slugifyTv(last) : undefined;
}
/** Parse public TV RSS feed (latest videos). */
export function parseTvRssFeed(xml, baseUrl = getTvPublicBaseUrl()) {
    const items = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
    const videos = [];
    for (const item of items) {
        const title = extractXmlTag(item, "title");
        const link = extractXmlTag(item, "link");
        if (!title || !link)
            continue;
        const slug = slugFromVideoUrl(link, baseUrl) ?? slugifyTv(title);
        const description = extractXmlTag(item, "description") ?? title;
        const pubDate = extractXmlTag(item, "pubDate") ?? "";
        videos.push({
            slug,
            title,
            description,
            url: link,
            uploadDate: pubDate,
            categories: [],
            tags: [],
            source: "rss",
            body: description,
        });
    }
    return videos;
}
async function fetchRemoteText(url) {
    const response = await fetch(url, {
        headers: { Accept: "text/plain, application/xml, application/rss+xml, */*" },
    });
    if (!response.ok) {
        throw new Error(`[TV] Failed to fetch ${url} (${response.status})`);
    }
    return response.text();
}
async function fetchPublicRemoteVideos(force = false) {
    const now = Date.now();
    if (!force && remoteCache && now - remoteCache.fetchedAt < REMOTE_CACHE_MS) {
        return remoteCache.videos;
    }
    const baseUrl = getTvPublicBaseUrl();
    const endpoints = getTvPublicEndpoints(baseUrl);
    try {
        const full = await fetchRemoteText(endpoints.llmsFull);
        const parsed = parseTvLlmsFullText(full, baseUrl, "llms-full");
        if (parsed.length > 0) {
            remoteCache = { fetchedAt: now, videos: parsed };
            return parsed;
        }
    }
    catch {
        // fall through
    }
    try {
        const llms = await fetchRemoteText(endpoints.llms);
        const parsed = parseTvLlmsText(llms, baseUrl);
        if (parsed.length > 0) {
            remoteCache = { fetchedAt: now, videos: parsed };
            return parsed;
        }
    }
    catch {
        // fall through
    }
    const xml = await fetchRemoteText(endpoints.feed);
    const parsed = parseTvRssFeed(xml, baseUrl);
    remoteCache = { fetchedAt: now, videos: parsed };
    return parsed;
}
export function getTvContentSourceInfo() {
    if (resolveLocalVideosJsonPath()) {
        return {
            source: "tv-repo",
            detail: `${resolveLocalVideosJsonPath()} (official tv.jexxx.us prebuild catalog)`,
        };
    }
    if (resolveLocalLlmsFullPath()) {
        return {
            source: "tv-llms-full",
            detail: `${resolveLocalLlmsFullPath()} (public llms-full.txt mirror)`,
        };
    }
    return {
        source: "public-llms-full",
        detail: `${getTvPublicEndpoints().llmsFull} (remote public catalog)`,
    };
}
async function loadAllVideos() {
    const local = loadLocalVideosJson();
    if (local && local.length > 0)
        return local;
    const localLlms = loadLocalLlmsFull();
    if (localLlms && localLlms.length > 0)
        return localLlms;
    return fetchPublicRemoteVideos();
}
/** Load all public TV videos (local catalog when available, else public llms/RSS). */
export async function listTvVideos() {
    const videos = await loadAllVideos();
    return videos.map(({ body: _body, ...meta }) => meta);
}
function normalizeSearchText(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, " ");
}
function videoMatchesQuery(video, query) {
    const needle = normalizeSearchText(query);
    const haystack = normalizeSearchText([
        video.title,
        video.description,
        video.slug,
        video.channel,
        ...video.categories,
        ...video.tags,
    ]
        .filter(Boolean)
        .join(" "));
    return haystack.includes(needle);
}
export function searchTvVideos(videos, query, limit = 10) {
    const trimmed = query.trim();
    if (!trimmed)
        return videos.slice(0, limit);
    const exactSlug = slugifyTv(trimmed);
    const exact = videos.find((v) => v.slug === exactSlug);
    if (exact)
        return [exact];
    return videos.filter((v) => videoMatchesQuery(v, trimmed)).slice(0, limit);
}
export async function getTvVideo(slugOrQuery) {
    const videos = await loadAllVideos();
    const slug = slugifyTv(slugOrQuery);
    const direct = videos.find((v) => v.slug === slug);
    if (direct)
        return direct;
    const matches = searchTvVideos(videos, slugOrQuery, 1);
    if (!matches[0])
        return null;
    return videos.find((v) => v.slug === matches[0].slug) ?? null;
}
export async function getTvVideoMeta(slugOrQuery) {
    const video = await getTvVideo(slugOrQuery);
    if (!video)
        return null;
    const { body: _body, ...meta } = video;
    return meta;
}
/** List distinct categories across the catalog. */
export function listTvCategories(videos) {
    const set = new Set();
    for (const video of videos) {
        for (const cat of video.categories)
            set.add(cat);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
}
/** Reset remote cache — for tests only. */
export function resetTvRemoteCacheForTests() {
    remoteCache = null;
}
//# sourceMappingURL=tv.js.map