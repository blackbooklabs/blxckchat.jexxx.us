import type blessed from "blessed";
export type BlessedKey = {
    name?: string;
    full?: string;
    meta?: boolean;
    ctrl?: boolean;
    shift?: boolean;
    ch?: string;
};
export declare function isPrintableKey(ch: string, key: BlessedKey): boolean;
export interface ModalKeypressController {
    start: (handler: (ch: string, key: BlessedKey) => void) => void;
    stop: () => void;
}
/** Capture keystrokes at the program level while an overlay is open. */
export declare function createModalKeypress(screen: blessed.Widgets.Screen): ModalKeypressController;
//# sourceMappingURL=modal-keypress.d.ts.map