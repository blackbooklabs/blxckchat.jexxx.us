/**
 * Read-only access to **public** VEIL articles — the same content published on
 * veil.jexxx.us. Never reads internal Obsidian VEIL docs (architecture, AEO
 * playbooks, deployment guides). Operators with a local clone use
 * content/posts; everyone else falls back to the public RSS feed.
 */
export declare const VEIL_DEFAULT_BASE_URL = "https://veil.jexxx.us";
export interface VeilPublicEndpoints {
    site: string;
    articlesIndex: string;
    feed: string;
    sitemap: string;
    robots: string;
    llms: string;
    rssChannelTitle: string;
    rssChannelDescription: string;
}
export interface VeilArticleMeta {
    slug: string;
    title: string;
    description: string;
    publishedAt: string;
    author?: string;
    authorSlug?: string;
    category?: string;
    categorySlug?: string;
    url: string;
    source: "local" | "rss";
}
export interface VeilArticle extends VeilArticleMeta {
    body: string;
    bodyFormat: "markdown" | "html";
}
export type VeilContentSource = "veil-repo" | "obsidian-mirror" | "public-rss";
export interface VeilContentSourceInfo {
    source: VeilContentSource;
    detail: string;
}
export declare function getVeilPublicBaseUrl(): string;
/** Reports which public-only source BLXCKCHAT is reading (for operator transparency). */
export declare function getVeilContentSourceInfo(): VeilContentSourceInfo;
export declare function getVeilPublicEndpoints(baseUrl?: string): VeilPublicEndpoints;
export declare function slugifyVeil(text: string): string;
/** Parse a public VEIL RSS feed (used by remote fallback and tests). */
export declare function parseVeilRssFeed(xml: string, baseUrl?: string): VeilArticle[];
/** Load all public VEIL articles (local posts when available, else RSS). */
export declare function listVeilArticles(): Promise<VeilArticleMeta[]>;
export declare function searchVeilArticles(articles: VeilArticleMeta[], query: string, limit?: number): VeilArticleMeta[];
export declare function getVeilArticle(slugOrQuery: string): Promise<VeilArticle | null>;
export declare function getVeilArticleMeta(slugOrQuery: string): Promise<VeilArticleMeta | null>;
/** Reset RSS cache — for tests only. */
export declare function resetVeilRssCacheForTests(): void;
//# sourceMappingURL=veil.d.ts.map