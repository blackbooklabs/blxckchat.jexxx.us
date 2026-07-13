import blessed from "blessed";
export interface PickerItem {
    id: string;
    label: string;
    description?: string;
}
/** Filter picker rows by label, id, or description (case-insensitive). */
export declare function filterPickerItems(items: readonly PickerItem[], query: string): PickerItem[];
export interface PickerOpenOptions {
    title?: string;
    selectedIndex?: number;
    /** Hide the filter row (compact menus such as /auth). */
    hideFilter?: boolean;
    /** Status lines shown above the list when hideFilter is true. */
    statusHeader?: string;
}
export interface PickerOverlayHandle {
    open: (items: PickerItem[], options?: PickerOpenOptions) => void;
    close: () => void;
    isVisible: () => boolean;
    setOnPick: (handler: ((item: PickerItem) => void) | undefined) => void;
    setOnCancel: (handler: (() => void) | undefined) => void;
}
export declare function createPickerOverlay(screen: blessed.Widgets.Screen): PickerOverlayHandle;
//# sourceMappingURL=picker-overlay.d.ts.map