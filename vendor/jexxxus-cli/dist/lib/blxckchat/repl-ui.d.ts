import type { Provider } from "./providers/types.js";
import type { BlxckchatTool } from "./tools/types.js";
import { type StoredProviderConfig } from "./config.js";
export interface InteractiveChatOptions {
    providerLabel?: string;
    storedConfig: StoredProviderConfig;
    resume?: boolean;
    allowShell?: boolean;
}
/**
 * Start the blessed-based interactive BLXCKCHAT terminal UI.
 * Falls back to readline when the terminal cannot host blessed.
 */
export declare function startInteractiveChat(provider: Provider, tools: BlxckchatTool[], options: InteractiveChatOptions): Promise<void>;
//# sourceMappingURL=repl-ui.d.ts.map