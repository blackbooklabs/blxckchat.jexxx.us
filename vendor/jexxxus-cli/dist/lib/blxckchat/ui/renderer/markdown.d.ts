/** Pink streaming cursor for blessed TUI (ANSI breaks blessed wrap). */
export declare const BLESSED_STREAM_CURSOR: string;
/** Escape blessed tag delimiters in plain text segments. */
export declare function escapeBlessed(text: string): string;
/** Short kingdom/garden href for TUI — avoids mid-slug line wraps on long URLs. */
export declare function formatHrefForDisplay(href: string): string;
export declare function markdownToBlessed(markdown: string): string;
/** Render a user message — Pi-style compact pill (plain text). */
export declare function renderUserMessageBoxPlain(text: string): string;
/** Render a user message — pink retro TV pill. */
export declare function renderUserMessageBox(text: string): string;
//# sourceMappingURL=markdown.d.ts.map