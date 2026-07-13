/** Single-line editor state for transmit input (Google Docs–style shortcuts). */
export interface LineEditorState {
    text: string;
    cursor: number;
    /** When non-null, selection spans [min(anchor,cursor), max(anchor,cursor)). */
    selectionAnchor: number | null;
}
export declare function createLineEditorState(text?: string): LineEditorState;
export declare function getSelectionRange(state: LineEditorState): {
    start: number;
    end: number;
} | null;
export declare function clearSelection(state: LineEditorState): LineEditorState;
export declare function wordLeft(text: string, pos: number): number;
export declare function wordRight(text: string, pos: number): number;
/** Inclusive start, exclusive end for the word at a click/caret index. */
export declare function wordBoundsAt(text: string, index: number): {
    start: number;
    end: number;
};
/** Double-click word selection (Google Docs style). */
export declare function selectWordAt(state: LineEditorState, index: number): LineEditorState;
/** Horizontal scroll offset for a single-line viewport (matches renderLineEditorView). */
export declare function lineEditorViewScrollStart(state: LineEditorState, viewWidth: number): number;
/** Map blessed mouse column inside transmit box to a text index. */
export declare function charIndexFromMouseX(mouseX: number, state: LineEditorState, viewWidth: number): number;
export declare function moveCharLeft(state: LineEditorState, extend?: boolean): LineEditorState;
export declare function moveCharRight(state: LineEditorState, extend?: boolean): LineEditorState;
export declare function moveWordLeft(state: LineEditorState, extend?: boolean): LineEditorState;
export declare function moveWordRight(state: LineEditorState, extend?: boolean): LineEditorState;
export declare function moveLineStart(state: LineEditorState, extend?: boolean): LineEditorState;
export declare function moveLineEnd(state: LineEditorState, extend?: boolean): LineEditorState;
export declare function selectAll(state: LineEditorState): LineEditorState;
export declare function insertText(state: LineEditorState, ch: string): LineEditorState;
export declare function deleteBackward(state: LineEditorState): LineEditorState;
export declare function deleteForward(state: LineEditorState): LineEditorState;
export declare function deleteWordBackward(state: LineEditorState): LineEditorState;
export declare function deleteWordForward(state: LineEditorState): LineEditorState;
export declare function killToEnd(state: LineEditorState): LineEditorState;
/** Delete from line start through cursor (macOS ⌘⌫). */
export declare function killToStart(state: LineEditorState): LineEditorState;
/** Clear the entire field (readline Ctrl+U). */
export declare function killLine(state: LineEditorState): LineEditorState;
export interface LineEditorKeyAction {
    readonly type: "noop" | "insert" | "delete-backward" | "delete-forward" | "delete-word-backward" | "delete-word-forward" | "kill-to-end" | "kill-to-start" | "kill-line" | "move-char-left" | "move-char-right" | "move-word-left" | "move-word-right" | "move-line-start" | "move-line-end" | "select-all" | "paste" | "submit";
    readonly char?: string;
    readonly extend?: boolean;
}
export interface LineEditorKey {
    name?: string;
    shift?: boolean;
    meta?: boolean;
    ctrl?: boolean;
    ch?: string;
    full?: string;
}
/** Drop legacy/SGR mouse tracking bytes that leak into transmit when TTY modes desync. */
export declare function isSpuriousTerminalInput(ch: string, key: LineEditorKey): boolean;
/** Resolve a single printable character from a key event (incl. punctuation). */
export declare function resolveInsertChar(key: LineEditorKey): string | null;
/** Map terminal key events to editor actions (macOS + cross-platform). */
export declare function resolveLineEditorKey(key: LineEditorKey): LineEditorKeyAction;
export declare function applyLineEditorAction(state: LineEditorState, action: LineEditorKeyAction): LineEditorState;
export interface LineEditorView {
    content: string;
    cursorColumn: number;
}
export interface RenderLineEditorOptions {
    selectionTag?: string;
    selectionEndTag?: string;
    /** Draw a block cursor at the caret (for box widgets without readInput). */
    showCursor?: boolean;
    cursorChar?: string;
}
/** Render visible slice with optional pink inverse selection. */
export declare function renderLineEditorView(state: LineEditorState, viewWidth: number, selectionTagOrOptions?: string | RenderLineEditorOptions, selectionEndTag?: string): LineEditorView;
//# sourceMappingURL=line-editor.d.ts.map