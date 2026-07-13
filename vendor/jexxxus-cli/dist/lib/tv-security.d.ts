/**
 * Validates a public base URL before any outbound fetch. HTTPS required except
 * localhost dev. Host must be tv.jexxx.us or loopback — blocks SSRF via
 * TV_PUBLIC_BASE_URL.
 */
export declare function assertAllowedTvPublicBaseUrl(rawUrl: string): string;
/** Read a single approved JSON catalog file — no traversal. */
export declare function readPublicJsonCatalog(filePath: string): string;
/** Read llms-full.txt or llms.txt from an approved public/ directory. */
export declare function readPublicLlmsFile(publicDir: string, filename: "llms-full.txt" | "llms.txt"): string;
//# sourceMappingURL=tv-security.d.ts.map