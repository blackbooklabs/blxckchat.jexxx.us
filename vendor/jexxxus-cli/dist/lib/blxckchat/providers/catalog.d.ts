/** Inference provider catalog — aligned with Pi Agent / OpenCode core gateways. */
export type ProviderAdapter = "anthropic" | "openai" | "ollama";
export interface ProviderCatalogEntry {
    /** Stable provider id (stored in credentials). */
    id: string;
    /** Human label in pickers. */
    label: string;
    adapter: ProviderAdapter;
    /** Default OpenAI-compatible base URL (hosted gateways). */
    baseUrl?: string;
    /** User must supply a base URL (Azure, custom compatible). */
    requiresBaseUrl?: boolean;
    requiresApiKey: boolean;
    /** Environment variables checked for BYOK (first match wins). */
    envKeys?: readonly string[];
    suggestedModels: readonly string[];
    /** Short hint in connect flow. */
    hint?: string;
}
/** Pi / OpenCode–parity provider set (hosted gateways + local). */
export declare const PROVIDER_CATALOG: readonly ProviderCatalogEntry[];
export declare function getCatalogEntry(id: string): ProviderCatalogEntry | undefined;
export declare function listCatalogEntries(): readonly ProviderCatalogEntry[];
/** Legacy configs used provider as adapter id only. */
export declare function normalizeProviderId(id: string): string;
export declare function resolveEnvApiKey(entry: ProviderCatalogEntry): string | undefined;
export declare function defaultModelFor(entry: ProviderCatalogEntry): string;
export declare function resolveBaseUrl(entry: ProviderCatalogEntry, override?: string): string | undefined;
//# sourceMappingURL=catalog.d.ts.map