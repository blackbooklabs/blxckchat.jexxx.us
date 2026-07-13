/**
 * Validates a public base URL before any outbound fetch. HTTPS required except
 * localhost dev. Host must be veil.jexxx.us or loopback — blocks SSRF to
 * internal networks via VEIL_PUBLIC_BASE_URL.
 */
export declare function assertAllowedVeilPublicBaseUrl(rawUrl: string): string;
/** Read a single markdown file from an approved directory — no traversal. */
export declare function readPublicMarkdownFile(dir: string, filename: string): string;
/** Posts/articles directory must be a real directory with only flat .md files. */
export declare function assertSafeArticlePostsDir(postsDir: string): void;
//# sourceMappingURL=veil-security.d.ts.map