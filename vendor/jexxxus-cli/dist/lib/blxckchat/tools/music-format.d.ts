import type { MusicCatalogEntry, MusicPublicEndpoints } from "../../music.js";
export declare function formatMusicCatalogList(entries: MusicCatalogEntry[], total: number): string;
export declare function formatMusicEntryFull(entry: MusicCatalogEntry): string;
export declare function formatMusicEntryMeta(entry: MusicCatalogEntry, endpoints: MusicPublicEndpoints): string;
export declare function formatMusicDiscover(endpoints: MusicPublicEndpoints, catalogCount: number, samples: MusicCatalogEntry[], llmsExcerpt?: string | null): string;
//# sourceMappingURL=music-format.d.ts.map