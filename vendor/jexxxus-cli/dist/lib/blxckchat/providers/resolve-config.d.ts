import type { StoredProviderConfig } from "../config.js";
import { type ProviderAdapter } from "./catalog.js";
import type { ProviderConfig } from "./types.js";
export interface ResolvedProviderConfig extends ProviderConfig {
    adapter: ProviderAdapter;
    catalogId: string;
}
export declare function resolveStoredProvider(stored: StoredProviderConfig): ResolvedProviderConfig;
//# sourceMappingURL=resolve-config.d.ts.map