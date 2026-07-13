import { type LineEditorState } from "./line-editor.js";
import type { BlessedKey } from "./modal-keypress.js";
export type ModalLineInputResult = {
    action: "updated";
} | {
    action: "submit";
} | {
    action: "noop";
} | {
    action: "paste-request";
};
export interface ModalLineInputOptions {
    /** Mask characters (API keys). Selection still highlights. */
    mask?: boolean;
    maskChar?: string;
}
export interface ModalLineInputHandle {
    getText: () => string;
    setText: (text: string) => void;
    getState: () => LineEditorState;
    handleKey: (ch: string, key: BlessedKey) => ModalLineInputResult;
    formatDisplay: (viewWidth: number) => string;
    isEditingKey: (ch: string, key: BlessedKey) => boolean;
}
export declare function isPasteKey(key: BlessedKey): boolean;
/** Single-line field with Google Docs–style shortcuts for modal overlays. */
export declare function createModalLineInput(initial?: string, options?: ModalLineInputOptions): ModalLineInputHandle;
/** Insert clipboard text at cursor (replaces selection). */
export declare function insertModalLinePaste(handle: ModalLineInputHandle, text: string): void;
//# sourceMappingURL=modal-line-input.d.ts.map