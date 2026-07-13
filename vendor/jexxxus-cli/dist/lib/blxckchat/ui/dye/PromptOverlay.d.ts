import React from "react";
import type { PromptOverlayOptions } from "./dye-types.js";
export interface PromptDisplayState {
    options: PromptOverlayOptions;
    input: string;
    /** 0-based cursor position within input. Defaults to input.length. */
    cursorPos?: number;
    /** Start of selection in input (<= cursorPos). Undefined = no selection. */
    selectionStart?: number | undefined;
}
interface PromptOverlayProps {
    state: PromptDisplayState | null;
}
export declare const PromptOverlay: React.FC<PromptOverlayProps>;
export {};
//# sourceMappingURL=PromptOverlay.d.ts.map