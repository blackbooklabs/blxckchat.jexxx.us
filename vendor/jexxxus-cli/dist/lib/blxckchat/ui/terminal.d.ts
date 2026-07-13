import type { Provider } from "../providers/types.js";
import type { BlxckchatTool } from "../tools/types.js";
import type { StoredProviderConfig } from "../config.js";
export interface TerminalChatOptions {
    providerLabel?: string;
    toolCount?: number;
    storedConfig: StoredProviderConfig;
    resume?: boolean;
    allowShell?: boolean;
}
export declare function startTerminalChat(provider: Provider, tools: BlxckchatTool[], options: TerminalChatOptions): Promise<void>;
//# sourceMappingURL=terminal.d.ts.map