import type { ToolResult, ToolStatus } from "../session/session-store.js";
/** Compact tool output for the TUI — full result still goes to the model. */
export declare function summarizeToolResultForDisplay(result: string, status: ToolStatus, toolName?: string): string;
export declare function formatToolLinePlain(toolName: string, result: string, status: ToolStatus): string;
export declare function formatToolLine(toolName: string, result: string, status: ToolStatus): string;
export declare function formatToolResult(entry: ToolResult): string;
export declare function formatToolResults(entries: ToolResult[]): string;
export declare function formatToolResultsPlain(entries: ToolResult[]): string;
//# sourceMappingURL=tool-box.d.ts.map