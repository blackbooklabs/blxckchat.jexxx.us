import type { TvContentSourceInfo, TvPublicEndpoints, TvVideo, TvVideoMeta } from "../../tv.js";
export declare function formatTvVideoList(videos: TvVideoMeta[], total: number, source?: TvContentSourceInfo): string;
export declare function formatTvVideoMeta(meta: TvVideoMeta, endpoints: TvPublicEndpoints): string;
export declare function formatTvDiscover(endpoints: TvPublicEndpoints, videoCount: number, samples: TvVideoMeta[], categories: string[], source?: TvContentSourceInfo): string;
export declare function formatTvVideoFull(video: TvVideo): string;
//# sourceMappingURL=tv-format.d.ts.map