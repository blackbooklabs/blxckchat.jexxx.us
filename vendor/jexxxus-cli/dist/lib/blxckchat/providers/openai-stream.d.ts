import type { ToolCall } from "./types.js";
/** Partial tool call state while merging streamed OpenAI deltas. */
export interface StreamingToolCallAcc {
    id?: string;
    name?: string;
    arguments: string;
}
export interface StreamingToolCallDelta {
    index?: number;
    id?: string;
    function?: {
        name?: string;
        arguments?: string;
    };
}
/** Merge one chunk of streamed tool_call deltas into the accumulator map. */
export declare function accumulateStreamingToolCalls(acc: Map<number, StreamingToolCallAcc>, deltas: StreamingToolCallDelta[] | undefined): void;
/** Convert accumulated streamed tool calls into parsed ToolCall objects. */
export declare function finalizeStreamingToolCalls(acc: Map<number, StreamingToolCallAcc>): ToolCall[];
//# sourceMappingURL=openai-stream.d.ts.map