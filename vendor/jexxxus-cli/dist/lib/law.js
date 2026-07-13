import { assertAllowedLawPublicBaseUrl } from "./law-security.js";
/**
 * Read-only access to **public** legal policies published on law.jexxx.us
 * (Terms, Privacy, Refunds, DMCA). Unlike VEIL/Docs, law.jexxx.us policy pages
 * are rendered from component templates rather than a flat markdown content
 * tree, so the public RSS feed (full-content via <content:encoded>) is the
 * canonical source here — no local-checkout fast path needed. The feed's
 * AEO/SEO posture is already solid (structured metadata, canonical URLs),
 * so fetching is a direct, low-maintenance integration.
 */
export const LAW_DEFAULT_BASE_URL = "https://law.jexxx.us";
let rssCache = null;
const RSS_CACHE_MS = 5 * 60 * 1000;
export function getLawPublicBaseUrl() {
    const raw = process.env.LAW_PUBLIC_BASE_URL?.trim();
    const candidate = raw && raw.startsWith("http") ? raw : LAW_DEFAULT_BASE_URL;
    return assertAllowedLawPublicBaseUrl(candidate);
}
export function getLawPublicEndpoints(baseUrl = getLawPublicBaseUrl()) {
    return {
        site: baseUrl,
        feed: `${baseUrl}/feed.xml`,
        sitemap: `${baseUrl}/sitemap.xml`,
        robots: `${baseUrl}/robots.txt`,
        llms: `${baseUrl}/llms.txt`,
    };
}
export function slugifyLaw(text) {
    return text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .trim()
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
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
function slugFromPolicyUrl(url, baseUrl) {
    const prefix = `${baseUrl.replace(/\/$/, "")}/`;
    if (url.startsWith(prefix)) {
        const rest = url.slice(prefix.length).replace(/\/$/, "");
        return rest || "home";
    }
    const parts = url.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? slugifyLaw(url);
}
/** Parse the public Law RSS feed (used by fetch and tests). */
export function parseLawRssFeed(xml, baseUrl = getLawPublicBaseUrl()) {
    const items = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
    const policies = [];
    for (const item of items) {
        const title = extractXmlTag(item, "title");
        const link = extractXmlTag(item, "link");
        if (!title || !link)
            continue;
        const slug = slugFromPolicyUrl(link, baseUrl);
        const description = extractXmlTag(item, "description") ?? "";
        const pubDate = extractXmlTag(item, "pubDate") ?? "";
        const category = extractXmlTag(item, "category");
        const encoded = extractXmlTag(item, "content:encoded");
        const entry = {
            slug,
            title,
            description,
            publishedAt: pubDate,
            url: link,
            body: encoded ?? description,
            bodyFormat: "html",
        };
        if (category)
            entry.category = category;
        policies.push(entry);
    }
    return policies;
}
async function fetchPublicRssPolicies(force = false) {
    const now = Date.now();
    if (!force && rssCache && now - rssCache.fetchedAt < RSS_CACHE_MS) {
        return rssCache.policies;
    }
    const baseUrl = getLawPublicBaseUrl();
    const feedUrl = `${baseUrl}/feed.xml`;
    const response = await fetch(feedUrl, {
        headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!response.ok) {
        throw new Error(`[Law] Failed to fetch public feed (${response.status}): ${feedUrl}`);
    }
    const xml = await response.text();
    const policies = parseLawRssFeed(xml, baseUrl);
    rssCache = { fetchedAt: now, policies };
    return policies;
}
export async function listLawPolicies() {
    const policies = await fetchPublicRssPolicies();
    return policies.map(({ body: _body, bodyFormat: _fmt, ...meta }) => meta);
}
function normalizeSearchText(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, " ");
}
function policyMatchesQuery(policy, query) {
    const needle = normalizeSearchText(query);
    const haystack = normalizeSearchText([policy.title, policy.description, policy.slug, policy.category].filter(Boolean).join(" "));
    return haystack.includes(needle);
}
export function searchLawPolicies(policies, query, limit = 10) {
    const trimmed = query.trim();
    if (!trimmed)
        return policies.slice(0, limit);
    const exactSlug = slugifyLaw(trimmed);
    const exact = policies.find((p) => p.slug === exactSlug);
    if (exact)
        return [exact];
    return policies.filter((p) => policyMatchesQuery(p, trimmed)).slice(0, limit);
}
export async function getLawPolicy(slugOrQuery) {
    const policies = await fetchPublicRssPolicies();
    const slug = slugifyLaw(slugOrQuery);
    const direct = policies.find((p) => p.slug === slug);
    if (direct)
        return direct;
    const matches = searchLawPolicies(policies, slugOrQuery, 1);
    return policies.find((p) => p.slug === matches[0]?.slug) ?? null;
}
export async function getLawPolicyMeta(slugOrQuery) {
    const policy = await getLawPolicy(slugOrQuery);
    if (!policy)
        return null;
    const { body: _body, bodyFormat: _fmt, ...meta } = policy;
    return meta;
}
/** Reset RSS cache — for tests only. */
export function resetLawRssCacheForTests() {
    rssCache = null;
}
//# sourceMappingURL=law.js.map