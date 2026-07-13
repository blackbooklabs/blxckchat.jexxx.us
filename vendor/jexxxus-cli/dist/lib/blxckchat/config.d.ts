import type { ProviderName } from "./providers/types.js";
export declare const CREDENTIALS_PATH: string;
export interface StoredProviderConfig {
    name: string;
    provider: ProviderName;
    model: string;
    apiKey?: string;
    baseUrl?: string;
    isDefault?: boolean;
}
/** Last LLM profile active when the TUI closed or the user switched models. */
export interface LastUsedProvider {
    name: string;
    provider: ProviderName;
    model: string;
    savedAt: string;
}
export interface BlxckchatCredentialsFile {
    providers: StoredProviderConfig[];
    lastUsed?: LastUsedProvider;
}
export declare function loadCredentials(): BlxckchatCredentialsFile;
export declare function saveCredentials(file: BlxckchatCredentialsFile): void;
export declare function getDefaultProvider(): StoredProviderConfig | null;
/**
 * Resolve which provider profile BLXCKCHAT should start with.
 *
 * 1. `--provider <name>` when given (explicit override)
 * 2. Pinned default (`isDefault` from "set as default? y") — always this profile;
 *    model comes from `lastUsed` when it matches the same profile name
 * 3. `lastUsed` from the previous TUI session (most recently active LLM)
 * 4. First configured provider
 */
export declare function resolveStartupProvider(explicitName?: string): StoredProviderConfig | null;
/** Persist the active LLM for the next TUI launch (does not change pinned default). */
export declare function saveLastUsedProvider(config: StoredProviderConfig): void;
export declare function getProviderByName(name: string): StoredProviderConfig | null;
export declare function upsertProvider(config: StoredProviderConfig): void;
export declare function deleteProvider(name: string): boolean;
export declare function listProvidersRedacted(): Array<{
    name: string;
    provider: ProviderName;
    model: string;
    isDefault: boolean;
    hasKey: boolean;
    label: string;
}>;
export interface ConnectProviderInput {
    catalogId: string;
    apiKey?: string;
    baseUrl?: string;
    model: string;
    name: string;
    isDefault?: boolean;
}
/** Build a stored config from catalog + user input (TUI or CLI). */
export declare function buildProviderConfig(input: ConnectProviderInput): StoredProviderConfig;
export declare function runConfigureFlow(): Promise<void>;
//# sourceMappingURL=config.d.ts.map