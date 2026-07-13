import blessed from "blessed";
import type { ThinkingBlock } from "../session/session-store.js";
import type { ToolResult, TerminalSession } from "../session/session-store.js";
export interface MessageBlock {
    type: "hero" | "welcome" | "user" | "assistant" | "tool" | "error" | "system";
    content: string;
    /** Blessed-rendered hero (standstill logo). */
    blessedContent?: string;
    thinkingBlocks?: ThinkingBlock[];
    assistantRaw?: string;
    streamThinkingRaw?: string;
    /** True while tokens are streaming — use plain stream renderer, not markdown. */
    isStreaming?: boolean;
    toolEntries?: ToolResult[];
}
export interface ScrollState {
    pinnedToBottom: boolean;
    /** 0 = top, 100 = bottom */
    percent: number;
}
export interface MessageBoxHandle {
    element: blessed.Widgets.BoxElement;
    showHero: (plain: string, blessed: string) => void;
    dismissHero: () => boolean;
    hasHero: () => boolean;
    appendWelcome: (plainContent: string) => void;
    appendUser: (text: string) => void;
    appendAssistantStart: () => number;
    updateAssistantStream: (blockIndex: number, partial: string, rawPlain?: string, rawThinking?: string) => void;
    finalizeAssistant: (blockIndex: number, content: string, thinkingBlocks: ThinkingBlock[]) => void;
    appendTools: (tools: ToolResult[]) => void;
    appendError: (message: string) => void;
    appendSystem: (message: string) => void;
    scrollUp: () => void;
    scrollDown: () => void;
    scrollPageUp: () => void;
    scrollPageDown: () => void;
    scrollHalfPageUp: () => void;
    scrollHalfPageDown: () => void;
    scrollToTop: () => void;
    scrollToBottom: () => void;
    getScrollState: () => ScrollState;
    isPinnedToBottom: () => boolean;
    getThinkingBlocks: () => ThinkingBlock[];
    toggleFocusedThinking: () => void;
    toggleAllThinking: () => void;
    getLastAssistantPlainText: () => string | null;
    getPlainText: () => string;
    popLastExchange: () => void;
    cancelInFlightAssistant: () => void;
    setSearchQuery: (query: string) => void;
    replaySession: (session: TerminalSession) => void;
    clearChat: () => void;
    rebuild: () => void;
}
export interface MessageBoxOptions {
    onUpdate?: () => void;
    onScrollChange?: (state: ScrollState) => void;
    onCopied?: () => void;
    onCopyFailed?: () => void;
}
export declare function createMessageBox(screen: blessed.Widgets.Screen, options?: MessageBoxOptions): MessageBoxHandle;
//# sourceMappingURL=message-box.d.ts.map