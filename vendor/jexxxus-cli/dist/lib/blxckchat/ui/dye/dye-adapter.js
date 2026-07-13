import { render } from "@sauerapple/dye";
import React from "react";
import { MessageStore } from "./message-store.js";
import { DyeApp } from "./DyeApp.js";
function getViewportHeight() {
    try {
        return process.stdout.rows ?? 24;
    }
    catch {
        return 24;
    }
}
export function createDyeTui(options) {
    const store = new MessageStore();
    const termHeight = getViewportHeight();
    if (options.subtitle)
        store.subtitle = options.subtitle;
    const overlayRef = {
        current: null,
    };
    const callbacks = {
        ...options.callbacks,
        onConfirmTool: async (toolName, args) => {
            return new Promise((resolve) => {
                store.setConfirmDialog({
                    title: toolName,
                    message: JSON.stringify(args, null, 2).slice(0, 400),
                    resolve,
                });
            });
        },
    };
    const messageBox = {
        showHero(plain, meta) {
            store.showHero(plain, meta);
        },
        dismissHero() {
            return store.dismissHero();
        },
        hasHero() {
            return store.hasHero();
        },
        appendWelcome(plainContent) {
            store.blocks.push({ type: "welcome", content: plainContent });
            store.pinnedToBottom = true;
            store.notify();
        },
        appendUser(text) {
            store.appendUser(text);
        },
        appendAssistantStart() {
            return store.appendAssistantStart();
        },
        updateAssistantStream(blockIndex, partial, rawPlain, rawThinking) {
            store.updateAssistantStream(blockIndex, partial, rawPlain, rawThinking);
        },
        finalizeAssistant(blockIndex, content, thinkingBlocks) {
            store.finalizeAssistant(blockIndex, content, thinkingBlocks);
        },
        appendTools(tools) {
            store.appendTools(tools);
        },
        appendError(message) {
            store.appendError(message);
        },
        appendSystem(message) {
            store.appendSystem(message);
        },
        scrollUp() {
            store.scrollUp();
        },
        scrollDown() {
            store.scrollDown();
        },
        scrollPageUp() {
            store.scrollPageUp(termHeight);
        },
        scrollPageDown() {
            store.scrollPageDown(termHeight);
        },
        scrollHalfPageUp() {
            store.setScrollOffset(store.scrollOffset + Math.floor(termHeight / 2));
        },
        scrollHalfPageDown() {
            store.setScrollOffset(Math.max(0, store.scrollOffset - Math.floor(termHeight / 2)));
        },
        scrollToTop() {
            store.scrollToTop();
        },
        scrollToBottom() {
            store.setScrollOffset(0);
            store.pinnedToBottom = true;
        },
        getScrollState() {
            return {
                pinnedToBottom: store.pinnedToBottom,
                percent: store.pinnedToBottom ? 100 : 50,
            };
        },
        isPinnedToBottom() {
            return store.pinnedToBottom;
        },
        getThinkingBlocks() {
            return store.blocks.flatMap((b) => b.thinkingBlocks ?? []);
        },
        toggleFocusedThinking() {
            store.toggleFocusedThinking();
        },
        toggleAllThinking() {
            store.toggleAllThinking();
        },
        getLastAssistantPlainText() {
            return store.getLastAssistantPlainText();
        },
        popLastExchange() {
            store.popLastExchange();
        },
        cancelInFlightAssistant() {
            store.cancelInFlightAssistant();
        },
        setSearchQuery(query) {
            store.setSearchQuery(query);
        },
        replaySession(session) {
            store.replaySession(session);
        },
        clearChat() {
            store.clearChat();
        },
    };
    const inputBox = {
        focus() { },
        clear() {
            store.inputValue = "";
        },
        setValue(value) {
            store.inputValue = value;
        },
        getValue() {
            return store.inputValue;
        },
    };
    const topBar = {
        setSubtitle(text) {
            store.setSubtitle(text);
        },
        getSubtitle() {
            return store.subtitle;
        },
        tickGlitch() {
            store.tickGlitch();
        },
    };
    const statusBar = {
        setMessage(text) {
            store.setStatusMessage(text);
        },
        getMessage() {
            return store.statusMessage;
        },
    };
    const app = React.createElement(DyeApp, {
        store,
        callbacks,
        initialInputValue: options.initialInputValue ?? "",
        overlayRef,
    });
    const instance = render(app);
    let readyResolve;
    const readyPromise = new Promise((resolve) => {
        readyResolve = resolve;
    });
    setImmediate(() => {
        readyResolve?.();
    });
    const handles = {
        messageBox,
        inputBox,
        topBar,
        statusBar,
        store,
        overlay: null,
        callbacks,
        waitUntilExit: () => instance.waitUntilExit(),
        ready: () => readyPromise,
    };
    Object.defineProperty(handles, "overlay", {
        get() {
            return overlayRef.current;
        },
        enumerable: true,
        configurable: true,
    });
    return handles;
}
//# sourceMappingURL=dye-adapter.js.map