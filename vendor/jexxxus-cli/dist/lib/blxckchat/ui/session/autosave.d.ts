import type { TerminalSession } from "./session-store.js";
export declare function getAutosavePath(): string;
export declare function shouldAutosave(messageCount: number): boolean;
export declare function autosaveSession(session: TerminalSession): string;
export interface PersistedSessionPayload {
    exportedAt: string;
    messages: TerminalSession["messages"];
    toolResults: Array<{
        id: string;
        toolName: string;
        result: string;
        status: string;
        timestamp: string;
    }>;
    thinkingBlocks: TerminalSession["thinkingBlocks"];
    conversationHistory: TerminalSession["conversationHistory"];
    activeDivinity?: TerminalSession["activeDivinity"];
}
export declare function loadAutosaveSession(): TerminalSession | null;
//# sourceMappingURL=autosave.d.ts.map