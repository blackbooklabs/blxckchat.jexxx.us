import React from "react";
import type { PickerItemDef } from "./dye-types.js";
export interface PickerDisplayState {
    items: PickerItemDef[];
    title?: string;
    selectedIndex: number;
    hideFilter?: boolean;
    statusHeader?: string;
    filterQuery: string;
    /** 0-based cursor position within filterQuery. Undefined = no cursor (not focused). */
    filterCursorPos?: number | undefined;
    /** Start of selection in filterQuery (<= filterCursorPos). Undefined = no selection. */
    filterSelectionStart?: number | undefined;
}
interface PickerOverlayProps {
    state: PickerDisplayState | null;
    filterFocused?: boolean;
}
export declare const PickerOverlay: React.FC<PickerOverlayProps>;
export {};
//# sourceMappingURL=PickerOverlay.d.ts.map