import type { PickerItemDef } from "./dye-types.js";
/** Filter picker rows by label, id, or description (case-insensitive). */
export declare function filterPickerItems(items: readonly PickerItemDef[], query: string): PickerItemDef[];
/** Resolve the highlighted row for Enter — filter query must match what the UI shows. */
export declare function resolvePickerSelection(items: readonly PickerItemDef[], filterQuery: string, selectedIndex: number): PickerItemDef | null;
//# sourceMappingURL=picker-filter.d.ts.map