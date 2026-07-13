import type { BlxckchatTool } from "./types.js";
export interface BuildToolRegistryOptions {
    allowShell?: boolean;
    /** Include account_query when user has ~/.jexxxus credentials (vault perks). */
    includeAccountQuery?: boolean;
}
export declare function buildToolRegistry(allowShellOrOptions?: boolean | BuildToolRegistryOptions): BlxckchatTool[];
/** Fresh registry each call — picks up /auth login mid-session. */
export declare function resolveBlxckchatTools(options?: Omit<BuildToolRegistryOptions, "includeAccountQuery">): BlxckchatTool[];
export declare function findTool(tools: BlxckchatTool[], name: string): BlxckchatTool | undefined;
//# sourceMappingURL=registry.d.ts.map