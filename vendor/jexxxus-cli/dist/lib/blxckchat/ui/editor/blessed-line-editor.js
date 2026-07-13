import { readClipboard } from "../session/tui-snapshot.js";
import { createModalKeypress } from "./modal-keypress.js";
import { applyLineEditorAction, charIndexFromMouseX, createLineEditorState, getSelectionRange, insertText, renderLineEditorView, resolveInsertChar, resolveLineEditorKey, selectWordAt, } from "./line-editor.js";
import { copyToClipboard } from "../session/tui-snapshot.js";
import { isBlessedMouseEnabled } from "../tty.js";
/**
 * Transmit row editor — plain box + program-level key capture.
 * Avoids blessed textbox/textarea (typing `e` or Ctrl+E spawns `$EDITOR` / vi).
 */
export function attachBlessedLineEditor(input, screen, options = {}) {
    const box = input;
    let state = createLineEditorState("");
    let captureActive = false;
    let focused = false;
    const modalKeys = createModalKeypress(screen);
    const innerWidth = () => Math.max(8, (box.width || 80) - 4);
    const render = () => {
        const view = renderLineEditorView(state, innerWidth(), { showCursor: focused });
        box.setContent(view.content.length > 0 ? ` ${view.content}` : " ");
        screen.render();
        options.onChange?.(state.text);
    };
    const handleKeypress = (ch, key) => {
        if (!captureActive || !focused)
            return;
        // History / slash / exit layers handle these on the transmit element.
        if (key.name === "escape" || key.name === "up" || key.name === "down") {
            return;
        }
        const insertChar = resolveInsertChar({ ...key, ch });
        if (insertChar === "?" &&
            state.text.length === 0 &&
            options.onHotkeyHelp) {
            options.onHotkeyHelp();
            return;
        }
        const action = resolveLineEditorKey({ ...key, ch });
        if (action.type === "submit") {
            box.emit("submit", state.text);
            return;
        }
        if (action.type === "paste") {
            void readClipboard().then((clip) => {
                const normalized = clip.replace(/\r?\n/g, " ").replace(/\t/g, " ");
                if (!normalized)
                    return;
                state = insertText(state, normalized);
                render();
            });
            return;
        }
        if (action.type === "noop")
            return;
        state = applyLineEditorAction(state, action);
        render();
    };
    const startCapture = () => {
        if (captureActive)
            return;
        captureActive = true;
        modalKeys.start(handleKeypress);
        screen.grabKeys = true;
    };
    const stopCapture = () => {
        if (!captureActive)
            return;
        captureActive = false;
        modalKeys.stop();
    };
    box.on("focus", () => {
        focused = true;
        startCapture();
        render();
    });
    box.on("blur", () => {
        focused = false;
        stopCapture();
        render();
    });
    if (isBlessedMouseEnabled()) {
        let lastClick = { at: 0, x: -1, y: -1 };
        let mouseDragging = false;
        let mouseMoved = false;
        const DOUBLE_CLICK_MS = 450;
        const copyEditorSelection = async () => {
            const range = getSelectionRange(state);
            if (!range || range.start >= range.end)
                return;
            const text = state.text.slice(range.start, range.end).trim();
            if (!text)
                return;
            const copied = await copyToClipboard(text);
            if (copied)
                options.onCopied?.();
            else
                options.onCopyFailed?.();
            state = { ...state, selectionAnchor: null };
            render();
        };
        box.on("mousedown", (data) => {
            if (data.button && data.button !== "left")
                return;
            if (!focused)
                box.focus();
            const index = charIndexFromMouseX(data.x ?? 0, state, innerWidth());
            mouseDragging = true;
            mouseMoved = false;
            state = { ...state, cursor: index, selectionAnchor: index };
            render();
        });
        box.on("mousemove", (data) => {
            if (!mouseDragging || !focused)
                return;
            mouseMoved = true;
            const index = charIndexFromMouseX(data.x ?? 0, state, innerWidth());
            state = { ...state, cursor: index };
            render();
        });
        box.on("mouseup", () => {
            if (!mouseDragging)
                return;
            mouseDragging = false;
            if (mouseMoved)
                void copyEditorSelection();
        });
        box.on("click", (data) => {
            const x = data.x ?? 0;
            const y = data.y ?? 0;
            if (!focused) {
                box.focus();
            }
            const now = Date.now();
            const isDouble = now - lastClick.at <= DOUBLE_CLICK_MS &&
                lastClick.x === x &&
                lastClick.y === y;
            lastClick = { at: now, x, y };
            const index = charIndexFromMouseX(x, state, innerWidth());
            if (isDouble) {
                state = selectWordAt(state, index);
                void copyEditorSelection();
            }
            else {
                state = { ...state, cursor: index, selectionAnchor: null };
            }
            render();
        });
    }
    return {
        getText: () => state.text,
        setText(text) {
            state = createLineEditorState(text);
            render();
        },
        clear() {
            state = createLineEditorState("");
            render();
        },
        getState: () => state,
    };
}
//# sourceMappingURL=blessed-line-editor.js.map