import { MessageStore } from "./message-store.js";
import { type DyeAppOverlayHandles } from "./DyeApp.js";
import type { DyeActionCallbacks, ScrollState, JexxxusHeroMeta } from "./dye-types.js";
import type { ThinkingBlock, ToolResult, TerminalSession } from "../session/session-store.js";
export interface DyeMessageBoxHandle {
    showHero: (plain: string, meta?: JexxxusHeroMeta) => void;
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
    popLastExchange: () => void;
    cancelInFlightAssistant: () => void;
    setSearchQuery: (query: string) => void;
    replaySession: (session: TerminalSession) => void;
    clearChat: () => void;
}
export interface DyeInputBoxHandle {
    focus: () => void;
    clear: () => void;
    setValue: (value: string) => void;
    getValue: () => string;
}
export interface DyeTopBarHandle {
    setSubtitle: (text: string) => void;
    getSubtitle: () => string;
    tickGlitch: () => void;
}
export interface DyeStatusBarHandle {
    setMessage: (text: string) => void;
    getMessage: () => string;
}
export interface DyeTuiHandles {
    messageBox: DyeMessageBoxHandle;
    inputBox: DyeInputBoxHandle;
    topBar: DyeTopBarHandle;
    statusBar: DyeStatusBarHandle;
    store: MessageStore;
    overlay: DyeAppOverlayHandles | null;
    callbacks: DyeActionCallbacks;
    waitUntilExit: () => Promise<void>;
    ready: () => Promise<void>;
}
export interface DyeAdapterOptions {
    callbacks: DyeActionCallbacks;
    initialInputValue?: string;
    subtitle?: string;
}
export declare function createDyeTui(options: DyeAdapterOptions): DyeTuiHandles;
//# sourceMappingURL=dye-adapter.d.ts.map