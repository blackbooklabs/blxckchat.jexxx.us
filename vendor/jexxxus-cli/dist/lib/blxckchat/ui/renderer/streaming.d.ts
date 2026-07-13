/** Accumulates streamed tokens for incremental UI updates. */
export declare class StreamBuffer {
    private buffer;
    append(chunk: string): string;
    getContent(): string;
    reset(): void;
    get length(): number;
}
/**
 * Format a partial stream buffer for live display in the blessed TUI.
 * Plain escaped text only — partial markdown (links, emphasis) corrupts mid-stream.
 * Full markdown runs once in finalizeAssistant / finalizeStreamedContent.
 */
export declare function formatStreamingChunk(buffer: string): string;
/** Finalize streamed assistant text with markdown rendering. */
export declare function finalizeStreamedContent(raw: string): string;
/**
 * Simulate token-by-token streaming for tests or replay.
 * Calls onUpdate after each chunk with the formatted partial content.
 */
export declare function streamTokens(fullResponse: string, onUpdate: (partialFormatted: string) => void, chunkSize?: number, delayMs?: number): Promise<string>;
//# sourceMappingURL=streaming.d.ts.map