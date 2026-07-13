import blessed from "blessed";
import type { SlashSuggestion } from "../slash/autocomplete.js";
export interface SlashPopupHandle {
    show: (suggestions: SlashSuggestion[], selectedIndex: number) => void;
    hide: () => void;
    isVisible: () => boolean;
    moveSelection: (delta: number, total: number) => number;
    getSelectedIndex: () => number;
    setSelectedIndex: (index: number) => void;
    setOnPick: (handler: ((index: number) => void) | undefined) => void;
}
/** Step list index with wrap-around at both ends. */
export declare function stepListIndex(current: number, delta: number, total: number): number;
export declare function createSlashPopup(screen: blessed.Widgets.Screen): SlashPopupHandle;
export declare function applySuggestion(currentValue: string, suggestion: SlashSuggestion, mode: "command" | "argument"): string;
//# sourceMappingURL=slash-popup.d.ts.map