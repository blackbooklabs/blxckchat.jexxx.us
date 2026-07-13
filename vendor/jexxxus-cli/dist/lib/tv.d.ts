/**
 * Read-only access to **public** JEXXXUS | TV videos — the same catalog on
 * tv.jexxx.us. Never reads internal Obsidian TV docs, Supabase credentials,
 * or raw stream/embed URLs. Operators with a local clone use videos.json;
 * remote users use public llms-full.txt / feed.xml.
 */
export declare const TV_DEFAULT_BASE_URL = "https://tv.jexxx.us";
export interface TvPublicEndpoints {
    site: string;
    feed: string;
    sitemap: string;
    sitemapVideo: string;
    robots: string;
    llms: string;
    llmsFull: string;
    playlists: string;
    subscription: string;
}
export interface TvVideoInteractions {
    likes: number;
    saves: number;
    shares: number;
}
export interface TvVideoMeta {
    slug: string;
    title: string;
    description: string;
    url: string;
    duration?: string;
    uploadDate?: string;
    channel?: string;
    categories: string[];
    tags: string[];
    thumbnail?: string;
    source: "local" | "llms-full" | "llms" | "rss";
    /**
     * Ranking signals for the DevotionRank shuffle (see tv-algorithm.ts).
     * Only present when parsed from the local videos.json catalog — remote
     * llms-full/RSS sources don't carry them, so ranking degrades gracefully
     * to recency + randomness for those (still much better than static
     * catalog-order slicing, just without the engagement weighting).
     */
    id?: string;
    views?: number;
    interactions?: TvVideoInteractions;
}
export interface TvVideo extends TvVideoMeta {
    body: string;
}
export type TvContentSource = "tv-repo" | "tv-llms-full" | "public-llms-full" | "public-llms" | "public-rss";
export interface TvContentSourceInfo {
    source: TvContentSource;
    detail: string;
}
export declare function getTvPublicBaseUrl(): string;
export declare function getTvPublicEndpoints(baseUrl?: string): TvPublicEndpoints;
export declare function slugifyTv(text: string): string;
/** Parse public llms-full.txt (prebuild artifact on tv.jexxx.us). */
export declare function parseTvLlmsFullText(text: string, baseUrl?: string, source?: TvVideoMeta["source"]): TvVideo[];
/** Parse compact llms.txt (edge or static prebuild). */
export declare function parseTvLlmsText(text: string, baseUrl?: string): TvVideo[];
/** Parse public TV RSS feed (latest videos). */
export declare function parseTvRssFeed(xml: string, baseUrl?: string): TvVideo[];
export declare function getTvContentSourceInfo(): TvContentSourceInfo;
/** Load all public TV videos (local catalog when available, else public llms/RSS). */
export declare function listTvVideos(): Promise<TvVideoMeta[]>;
export declare function searchTvVideos(videos: TvVideoMeta[], query: string, limit?: number): TvVideoMeta[];
export declare function getTvVideo(slugOrQuery: string): Promise<TvVideo | null>;
export declare function getTvVideoMeta(slugOrQuery: string): Promise<TvVideoMeta | null>;
/** List distinct categories across the catalog. */
export declare function listTvCategories(videos: TvVideoMeta[]): string[];
/** Reset remote cache — for tests only. */
export declare function resetTvRemoteCacheForTests(): void;
//# sourceMappingURL=tv.d.ts.map