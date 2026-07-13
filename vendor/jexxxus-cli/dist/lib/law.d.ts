/**
 * Read-only access to **public** legal policies published on law.jexxx.us
 * (Terms, Privacy, Refunds, DMCA). Unlike VEIL/Docs, law.jexxx.us policy pages
 * are rendered from component templates rather than a flat markdown content
 * tree, so the public RSS feed (full-content via <content:encoded>) is the
 * canonical source here — no local-checkout fast path needed. The feed's
 * AEO/SEO posture is already solid (structured metadata, canonical URLs),
 * so fetching is a direct, low-maintenance integration.
 */
export declare const LAW_DEFAULT_BASE_URL = "https://law.jexxx.us";
export interface LawPublicEndpoints {
    site: string;
    feed: string;
    sitemap: string;
    robots: string;
    llms: string;
}
export interface LawPolicyMeta {
    slug: string;
    title: string;
    description: string;
    publishedAt: string;
    category?: string;
    url: string;
}
export interface LawPolicy extends LawPolicyMeta {
    body: string;
    bodyFormat: "html";
}
export declare function getLawPublicBaseUrl(): string;
export declare function getLawPublicEndpoints(baseUrl?: string): LawPublicEndpoints;
export declare function slugifyLaw(text: string): string;
/** Parse the public Law RSS feed (used by fetch and tests). */
export declare function parseLawRssFeed(xml: string, baseUrl?: string): LawPolicy[];
export declare function listLawPolicies(): Promise<LawPolicyMeta[]>;
export declare function searchLawPolicies(policies: LawPolicyMeta[], query: string, limit?: number): LawPolicyMeta[];
export declare function getLawPolicy(slugOrQuery: string): Promise<LawPolicy | null>;
export declare function getLawPolicyMeta(slugOrQuery: string): Promise<LawPolicyMeta | null>;
/** Reset RSS cache — for tests only. */
export declare function resetLawRssCacheForTests(): void;
//# sourceMappingURL=law.d.ts.map