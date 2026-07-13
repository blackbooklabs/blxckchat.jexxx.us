import { type Token } from "marked";
/** Pink streaming cursor (ANSI — blessed wrap counts visible width correctly). */
export declare const STREAM_CURSOR: string;
/** Strip ANSI escape sequences for plain-text comparisons. */
export declare function stripAnsi(text: string): string;
/**
 * Models sometimes echo blessed tag syntax. Normalize to markdown before parse.
 */
export declare function normalizeAgentMarkup(text: string): string;
/** Pi-style: trim partial closing fences so streamed code blocks do not flicker. */
export declare function trimPartialClosingFences(tokens: readonly Token[]): void;
/**
 * Convert markdown to ANSI-styled terminal text (Pi / OpenCode pattern).
 * Blessed's built-in wrap skips ANSI codes for width — prose stays readable.
 */
export declare function markdownToAnsi(markdown: string): string;
//# sourceMappingURL=markdown-ansi.d.ts.map