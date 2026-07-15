/**
 * Resolve Bible vault path.
 * Priority: JEXXXUS_BIBLE_VAULT_PATH env var → falls back to web queries if not set
 */
export declare function resolveBibleVaultPath(): string | null;
/**
 * Resolve VEIL repo path (for local article parsing).
 * Priority: JEXXXUS_VEIL_REPO_PATH → VEIL_CONTENT_PATH → web-only if not set
 */
export declare function resolveVeilRepoPath(): string | null;
/**
 * Resolve local VEIL article mirror (public posts only — not internal Obsidian ops docs).
 * Priority: JEXXXUS_VEIL_ARTICLES_PATH → VEIL_ARTICLES_PATH → web-only if not set
 */
export declare function resolveVeilArticlesPath(): string | null;
/**
 * Resolve TradingView repo path (for local chart scraping).
 * Priority: JEXXXUS_TV_REPO_PATH env var → web-only if not set
 */
export declare function resolveTvRepoPath(): string | null;
/**
 * Resolve docs RAG source path.
 * Priority: JEXXXUS_DOCS_SOURCE_PATH env var → fetch from web if not set
 */
export declare function resolveDocsSourcePath(): string | null;
/**
 * Resolve Obsidian vault path (Personas for LLM divinities).
 * Priority: JEXXXUS_OBSIDIAN_PERSONAS_PATH env var → built-in defaults if not set
 * NOTE: This is private-operator-only content; not for public distribution
 */
export declare function resolveObsidianPersonasPath(): string | null;
/**
 * Validate a path is within a vault directory (prevents ../../../ traversal into /etc).
 * Used by Bible tool to ensure section names can't escape the vault.
 */
export declare function validateVaultPath(basePath: string, requestedPath: string): boolean;
//# sourceMappingURL=path-resolver.d.ts.map