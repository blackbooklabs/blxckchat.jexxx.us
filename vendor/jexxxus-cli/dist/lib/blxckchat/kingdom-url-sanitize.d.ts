/** Canonical kingdom surface URLs collected from tool/prefetch output. */
export interface KingdomUrlEntry {
    url: string;
    slug: string;
    title?: string;
    surface: "tv" | "veil";
}
/** Split URLs glued without separators (common small-model failure). */
export declare function splitGluedKingdomUrls(text: string): string;
/** Pull canonical TV/VEIL URLs from tool results or prefetch blocks. */
export declare function extractKingdomUrlsFromText(text: string): KingdomUrlEntry[];
/** `• Title [https://veil...]` → `• [Title](https://veil...)` for shorter TUI wraps. */
export declare function compactKingdomBulletLinks(text: string): string;
/** Turn `[url1\nurl2]` blobs into one bullet per URL. */
export declare function repairMarkdownUrlBlobs(text: string): string;
/**
 * Repair model-hallucinated kingdom URLs (wv host, spaced/glued slugs) using
 * canonical URLs from the same turn's tool/prefetch output. URLs with no
 * plausible match in that catalog are treated as fabricated and stripped,
 * not passed through — see UNVERIFIED_LINK.
 */
export declare function sanitizeKingdomUrls(response: string, catalog: KingdomUrlEntry[]): string;
//# sourceMappingURL=kingdom-url-sanitize.d.ts.map