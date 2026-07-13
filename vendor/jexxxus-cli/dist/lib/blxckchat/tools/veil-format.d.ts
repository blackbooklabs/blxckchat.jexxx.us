import type { VeilArticle, VeilArticleMeta, VeilContentSourceInfo, VeilPublicEndpoints } from "../../veil.js";
export declare function formatVeilArticleList(articles: VeilArticleMeta[], total: number, source?: VeilContentSourceInfo): string;
export declare function formatVeilArticleMeta(meta: VeilArticleMeta, endpoints: VeilPublicEndpoints): string;
export declare function formatVeilDiscover(endpoints: VeilPublicEndpoints, articleCount: number, samples: VeilArticleMeta[], source?: VeilContentSourceInfo): string;
export declare function formatVeilArticleFull(article: VeilArticle): string;
//# sourceMappingURL=veil-format.d.ts.map