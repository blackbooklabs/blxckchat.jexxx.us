import { randomUUID } from "node:crypto";
import { extractThinkingBlocks } from "../components/thinking-block.js";
import { markdownToBlessed } from "../renderer/markdown.js";
import { renderUserMessageBox } from "../renderer/markdown.js";
export class MessageStore {
    listeners = new Set();
    blocks = [];
    searchQuery = "";
    pinnedToBottom = true;
    statusMessage = "? hotkeys · / commands · esc abort";
    subtitle = "Welcome to the kingdom.";
    inputValue = "";
    isProcessing = false;
    focusedThinkingIndex = null;
    glitchSeed = 0;
    toast = null;
    confirmDialog = null;
    searchVisible = false;
    hotkeysVisible = false;
    heroMeta = null;
    scrollOffset = 0;
    _version = 0;
    subscribe(l) {
        this.listeners.add(l);
        return () => this.listeners.delete(l);
    }
    notify() {
        this._version++;
        for (const l of this.listeners)
            l();
    }
    getSnapshot() {
        return this._version;
    }
    // --- Message box API ---
    showHero(plain, meta) {
        this.blocks.push({ type: "hero", content: plain });
        if (meta)
            this.heroMeta = meta;
        this.pinnedToBottom = true;
        this.notify();
    }
    dismissHero() {
        const idx = this.blocks.findIndex((b) => b.type === "hero");
        if (idx < 0)
            return false;
        this.blocks.splice(idx, 1);
        this.notify();
        return true;
    }
    hasHero() {
        return this.blocks.some((b) => b.type === "hero");
    }
    appendUser(text) {
        this.dismissHero();
        this.blocks.push({ type: "user", content: text });
        this.pinnedToBottom = true;
        this.notify();
    }
    appendAssistantStart() {
        this.blocks.push({
            type: "assistant",
            content: "",
            assistantRaw: "",
            streamThinkingRaw: "",
            isStreaming: true,
            thinkingBlocks: [],
        });
        this.notify();
        return this.blocks.length - 1;
    }
    updateAssistantStream(blockIndex, partial, rawPlain, rawThinking) {
        const block = this.blocks[blockIndex];
        if (block?.type === "assistant") {
            block.content = partial;
            if (rawPlain !== undefined)
                block.assistantRaw = rawPlain;
            if (rawThinking !== undefined)
                block.streamThinkingRaw = rawThinking;
            block.isStreaming = true;
            this.pinnedToBottom = true;
            this.notify();
        }
    }
    finalizeAssistant(blockIndex, content, thinkingBlocks) {
        const block = this.blocks[blockIndex];
        if (block?.type === "assistant") {
            block.assistantRaw = content;
            block.content = markdownToBlessed(content);
            block.thinkingBlocks = thinkingBlocks;
            block.streamThinkingRaw = "";
            block.isStreaming = false;
            this.pinnedToBottom = true;
            this.notify();
        }
    }
    appendTools(tools) {
        if (tools.length === 0)
            return;
        this.blocks.push({
            type: "tool",
            content: tools.map((t) => `${t.toolName}: ${t.result}`).join("\n"),
            toolEntries: tools,
        });
        this.notify();
    }
    appendError(message) {
        this.blocks.push({ type: "error", content: message });
        this.notify();
    }
    appendSystem(message) {
        this.blocks.push({ type: "system", content: message });
        this.notify();
    }
    popLastExchange() {
        while (this.blocks.length > 0) {
            const last = this.blocks[this.blocks.length - 1];
            if (!last)
                break;
            this.blocks.pop();
            if (last.type === "user")
                break;
        }
        this.notify();
    }
    cancelInFlightAssistant() {
        if (this.blocks[this.blocks.length - 1]?.type === "assistant") {
            this.blocks.pop();
            this.notify();
        }
    }
    clearChat() {
        this.blocks.length = 0;
        this.focusedThinkingIndex = null;
        this.searchQuery = "";
        this.pinnedToBottom = true;
        this.notify();
    }
    replaySession(session) {
        this.blocks.length = 0;
        this.focusedThinkingIndex = null;
        for (const m of session.messages) {
            if (m.role === "user") {
                this.blocks.push({ type: "user", content: m.content });
            }
            else if (m.role === "assistant") {
                const parsed = extractThinkingBlocks(m.content);
                this.blocks.push({
                    type: "assistant",
                    content: markdownToBlessed(parsed.visibleContent || m.content),
                    assistantRaw: parsed.visibleContent || m.content,
                    thinkingBlocks: parsed.blocks,
                });
            }
        }
        for (const t of session.toolResults) {
            this.blocks.push({
                type: "tool",
                content: t.result,
                toolEntries: [t],
            });
        }
        this.notify();
    }
    getLastAssistantPlainText() {
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const block = this.blocks[i];
            if (block?.type === "assistant") {
                return block.assistantRaw ?? block.content;
            }
        }
        return null;
    }
    toggleFocusedThinking() {
        const tbs = this.allThinkingBlocks();
        if (tbs.length === 0)
            return;
        if (this.focusedThinkingIndex === null) {
            this.focusedThinkingIndex = 0;
        }
        else {
            const tb = tbs[this.focusedThinkingIndex];
            if (tb)
                tb.collapsed = !tb.collapsed;
        }
        this.notify();
    }
    toggleAllThinking() {
        const tbs = this.allThinkingBlocks();
        if (tbs.length === 0)
            return;
        const anyExpanded = tbs.some((tb) => !tb.collapsed);
        for (const tb of tbs)
            tb.collapsed = anyExpanded;
        this.notify();
    }
    setSearchQuery(query) {
        this.searchQuery = query;
        this.notify();
    }
    setStatusMessage(msg) {
        this.statusMessage = msg;
        this.notify();
    }
    setSubtitle(text) {
        this.subtitle = text;
        this.notify();
    }
    // --- Scroll methods ---
    setScrollOffset(offset) {
        this.scrollOffset = offset;
        this.pinnedToBottom = false;
        this.notify();
    }
    scrollUp() {
        this.scrollOffset += 1;
        this.pinnedToBottom = false;
        this.notify();
    }
    scrollDown() {
        this.scrollOffset = Math.max(0, this.scrollOffset - 1);
        if (this.scrollOffset === 0)
            this.pinnedToBottom = true;
        this.notify();
    }
    scrollPageUp(viewportHeight) {
        this.scrollOffset += viewportHeight;
        this.pinnedToBottom = false;
        this.notify();
    }
    scrollPageDown(viewportHeight) {
        this.scrollOffset = Math.max(0, this.scrollOffset - viewportHeight);
        if (this.scrollOffset === 0)
            this.pinnedToBottom = true;
        this.notify();
    }
    scrollToTop() {
        // The store doesn't know the current render-line count or viewport
        // height (that's computed in MessageView.tsx from formatted output,
        // not raw block content) — go past any possible max and let
        // MessageView's clamp resolve it to the true top on next render.
        this.scrollOffset = Number.MAX_SAFE_INTEGER;
        this.pinnedToBottom = false;
        this.notify();
    }
    getScrollState() {
        return {
            pinnedToBottom: this.pinnedToBottom,
            percent: this.pinnedToBottom ? 100 : this.scrollOffset > 0 ? 50 : 100,
        };
    }
    tickGlitch() {
        this.glitchSeed = (this.glitchSeed + 1) % 9;
        this.notify();
    }
    showToast(msg, variant = "info") {
        this.toast = { message: msg, variant };
        this.notify();
    }
    dismissToast() {
        this.toast = null;
        this.notify();
    }
    setConfirmDialog(dialog) {
        this.confirmDialog = dialog;
        this.notify();
    }
    setSearchVisible(v) {
        this.searchVisible = v;
        this.notify();
    }
    setHotkeysVisible(v) {
        this.hotkeysVisible = v;
        this.notify();
    }
    getThinkingBlockCount() {
        return this.blocks.reduce((sum, b) => sum + (b.thinkingBlocks?.length ?? 0), 0);
    }
    moveFocusedThinking(delta) {
        const tbs = this.allThinkingBlocks();
        if (tbs.length === 0)
            return;
        if (this.focusedThinkingIndex === null) {
            this.focusedThinkingIndex = delta === 1 ? 0 : tbs.length - 1;
        }
        else {
            this.focusedThinkingIndex =
                (this.focusedThinkingIndex + delta + tbs.length) % tbs.length;
        }
        this.notify();
    }
    allThinkingBlocks() {
        return this.blocks.flatMap((b) => b.thinkingBlocks ?? []);
    }
}
//# sourceMappingURL=message-store.js.map