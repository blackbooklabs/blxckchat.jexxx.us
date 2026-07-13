import type { ChatMessage } from "../../providers/types.js";
export type ToolStatus = "pending" | "success" | "error" | "declined" | "blocked";
export interface TerminalMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
}
export interface ToolResult {
    id: string;
    toolName: string;
    result: string;
    status: ToolStatus;
    timestamp: Date;
}
export interface ThinkingBlock {
    id: string;
    content: string;
    collapsed: boolean;
}
export interface ActiveDivinityRef {
    id: string;
    name: string;
    role?: string;
    pillar?: string;
}
export interface TerminalSession {
    messages: TerminalMessage[];
    toolResults: ToolResult[];
    thinkingBlocks: ThinkingBlock[];
    conversationHistory: ChatMessage[];
    /** Active Obsidian Divinities persona, when /divinities is engaged. */
    activeDivinity?: ActiveDivinityRef | null;
}
export declare function createSession(): TerminalSession;
export declare function addUserMessage(session: TerminalSession, content: string): TerminalMessage;
export declare function addAssistantMessage(session: TerminalSession, content: string): TerminalMessage;
export declare function addToolResult(session: TerminalSession, toolName: string, result: string, status: ToolStatus): ToolResult;
export declare function updateToolResult(session: TerminalSession, toolName: string, result: string, status: ToolStatus): ToolResult | undefined;
/** Filesystem-safe ISO timestamp for default /save export filenames. */
export declare function formatSessionExportTimestamp(date?: Date): string;
export declare function getDefaultSessionExportPath(now?: Date): string;
export declare function exportSessionToFile(session: TerminalSession, filePath?: string): string;
//# sourceMappingURL=session-store.d.ts.map