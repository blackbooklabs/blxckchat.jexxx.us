import type { ThinkingBlock } from "../session/session-store.js";
export interface ParsedThinking {
    visibleContent: string;
    blocks: ThinkingBlock[];
}
/** Extract thinking sections from assistant content. */
export declare function extractThinkingBlocks(content: string): ParsedThinking;
export declare function formatThinkingBlockPlain(block: ThinkingBlock): string;
export declare function formatThinkingBlock(block: ThinkingBlock, expanded?: boolean): string;
export declare function toggleThinkingBlock(block: ThinkingBlock): void;
//# sourceMappingURL=thinking-block.d.ts.map