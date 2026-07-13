import { type StoredProviderConfig } from "../../config.js";
import type { Provider } from "../../providers/types.js";
import type { TerminalSession } from "../session/session-store.js";
import type { AuthTuiActions } from "../auth-tui.js";
export interface SlashHandlerState {
    session: TerminalSession;
    activeConfig: StoredProviderConfig;
    toolCount: number;
    setActiveConfig: (config: StoredProviderConfig, provider: Provider) => void;
    copySnapshot: () => Promise<{
        path: string;
        copied: boolean;
    }>;
    copyChromeDigest?: () => Promise<{
        path: string;
        copied: boolean;
    }>;
    authActions?: AuthTuiActions;
    openModelPicker?: () => void | Promise<void>;
    openProviderPicker?: () => void | Promise<void>;
    openDivinityPicker?: () => void | Promise<void>;
    openAuthPicker?: () => void | Promise<void>;
    setupProvider?: (catalogId: string) => Promise<void>;
    onDivinityActivated?: () => void;
}
export interface SlashResult {
    handled: boolean;
    messages: string[];
    exit?: boolean;
    deferInputFocus?: boolean;
}
export declare function parseSlashInput(line: string): {
    command: string | null;
    args: string;
};
export declare function isSlashCommand(line: string): boolean;
export declare function dispatchSlashCommand(line: string, state: SlashHandlerState): Promise<SlashResult>;
//# sourceMappingURL=handler.d.ts.map