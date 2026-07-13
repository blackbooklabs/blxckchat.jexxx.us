export interface StreamThinkingState {
    thinking: string;
    visible: string;
    inThinking: boolean;
    hasThinking: boolean;
}
/**
 * Incrementally splits streamed LLM output into thinking vs visible answer
 * (Pi / OpenCode style). Handles partial tags across chunk boundaries.
 */
export declare class StreamThinkingParser {
    private pending;
    private closeTag;
    private state;
    reset(): void;
    getState(): StreamThinkingState;
    /** Flush held partial bytes when the provider stream ends. */
    flush(): void;
    /** Native API reasoning channel (OpenAI reasoning_content, OpenRouter reasoning, etc.). */
    appendThinking(chunk: string): void;
    /** Main model output — may include <think>…</think> wrappers. */
    append(chunk: string): void;
    private drain;
}
/** Dim placeholder before the first streamed token (Pi-style). */
export declare function formatThinkingWaitState(): string;
/**
 * Live blessed render — minimal tag nesting to avoid blessed wrap corruption.
 * Thinking: one muted wrapper. Answer: plain escaped stream (formatStreamingChunk).
 */
export declare function formatLiveStreamDisplay(state: StreamThinkingState): string;
//# sourceMappingURL=stream-thinking.d.ts.map