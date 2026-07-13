import type { TvVideoMeta } from "./tv.js";
export declare function calculateDevotionScore(video: TvVideoMeta): number;
/**
 * Mixes high-authority (DevotionScore) videos with randomized discovery —
 * a fresh, varied order every call, instead of always surfacing whatever
 * happens to sort first/alphabetically in the source catalog.
 */
export declare function heavyRankerShuffle(videos: TvVideoMeta[]): TvVideoMeta[];
/** Recommendation slice for tv_query action=list with no search query. */
export declare function recommendTvVideos(videos: TvVideoMeta[], limit: number): TvVideoMeta[];
//# sourceMappingURL=tv-algorithm.d.ts.map