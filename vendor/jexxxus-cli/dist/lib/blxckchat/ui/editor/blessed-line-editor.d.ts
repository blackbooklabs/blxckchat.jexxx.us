import type blessed from "blessed";
import { type LineEditorState } from "./line-editor.js";
export interface BlessedLineEditorHandle {
    getText: () => string;
    setText: (text: string) => void;
    clear: () => void;
    getState: () => LineEditorState;
}
export interface BlessedLineEditorOptions {
    onChange?: (text: string) => void;
    /** `?` on an empty field — show hotkeys instead of inserting. */
    onHotkeyHelp?: () => void;
    onCopied?: () => void;
    onCopyFailed?: () => void;
}
/**
 * Transmit row editor — plain box + program-level key capture.
 * Avoids blessed textbox/textarea (typing `e` or Ctrl+E spawns `$EDITOR` / vi).
 */
export declare function attachBlessedLineEditor(input: blessed.Widgets.BoxElement, screen: blessed.Widgets.Screen, options?: BlessedLineEditorOptions): BlessedLineEditorHandle;
//# sourceMappingURL=blessed-line-editor.d.ts.map