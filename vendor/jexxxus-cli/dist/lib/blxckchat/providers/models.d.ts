import { type ProviderCatalogEntry } from "./catalog.js";
import type { ProviderName } from "./types.js";
import { type StoredProviderConfig } from "../config.js";
export interface ModelOption {
    id: string;
    label: string;
    provider: ProviderName;
    source: "configured" | "suggested" | "ollama" | "catalog" | "live";
}
/** Normalize catalog base URL to an OpenAI-compatible `/models` endpoint. */
export declare function resolveModelsEndpoint(baseUrl: string): string;
/** Whether live model discovery is supported for this catalog entry. */
export declare function supportsLiveModelDiscovery(entry: ProviderCatalogEntry): boolean;
/** Fetch model ids from an OpenAI-compatible `GET /v1/models` endpoint. */
export declare function fetchOpenAiCompatibleModels(baseUrl: string, apiKey?: string): Promise<string[]>;
/** Fetch locally installed Ollama model tags (best-effort). */
export declare function listOllamaModels(baseUrl?: string): Promise<string[]>;
/** Live + static model ids for a catalog provider (used in setup and /model). */
export declare function listModelsForProvider(catalogId: string, opts?: {
    apiKey?: string;
    baseUrl?: string;
}): Promise<string[]>;
/** Build deduplicated model suggestions for autocomplete and /model. */
export declare function listModelOptions(activeConfig?: StoredProviderConfig): Promise<ModelOption[]>;
export declare function findModelMatch(query: string, options: ModelOption[]): ModelOption | null;
/** Cycle to next/previous model within the active provider's option list. */
export declare function cycleModelOption(options: ModelOption[], current: StoredProviderConfig, direction: 1 | -1): ModelOption | null;
//# sourceMappingURL=models.d.ts.map