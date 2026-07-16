/**
 * Read-only access to public JEXXXUS Music surfaces — music.jexxx.us (Crucifly
 * Records), docs.jexxx.us/music, Traktrain beat store, and artist link hubs.
 * No private catalog API exists; beats/kits are embedded via Traktrain widgets.
 */
export declare const MUSIC_DEFAULT_BASE_URL = "https://music.jexxx.us";
export declare const MUSIC_DOCS_URL = "https://docs.jexxx.us/music";
export interface MusicPublicEndpoints {
    site: string;
    docs: string;
    feed: string;
    sitemap: string;
    robots: string;
    llms: string;
}
export interface MusicCatalogEntry {
    slug: string;
    title: string;
    description: string;
    category: string;
    url: string;
    tags?: string[];
}
/** Curated catalog from music.jexxx.us, public llms.txt, and docs.jexxx.us/music. */
export declare const MUSIC_CATALOG: readonly MusicCatalogEntry[];
export declare function getMusicPublicBaseUrl(): string;
export declare function getMusicPublicEndpoints(baseUrl?: string): MusicPublicEndpoints;
export declare function listMusicCatalog(limit?: number): MusicCatalogEntry[];
export declare function getMusicEntry(slugOrQuery: string): MusicCatalogEntry | null;
export declare function searchMusicCatalog(query: string, limit?: number): MusicCatalogEntry[];
export declare function fetchMusicLlmsTxt(): Promise<string | null>;
export declare function getMusicDocsSummary(): string;
//# sourceMappingURL=music.d.ts.map