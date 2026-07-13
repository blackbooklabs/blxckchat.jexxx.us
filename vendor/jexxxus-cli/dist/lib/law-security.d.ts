/**
 * Validates a public base URL before any outbound fetch. HTTPS required except
 * localhost dev. Host must be law.jexxx.us or loopback — blocks SSRF to
 * internal networks via LAW_PUBLIC_BASE_URL.
 */
export declare function assertAllowedLawPublicBaseUrl(rawUrl: string): string;
//# sourceMappingURL=law-security.d.ts.map