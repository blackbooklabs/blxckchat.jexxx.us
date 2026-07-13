import type blessed from "blessed";
/**
 * Blessed registers element.key() on the shared program — every handler
 * fires unless gated. Only run when this element owns focus.
 */
export declare function bindFocusedKey(screen: blessed.Widgets.Screen, element: blessed.Widgets.Node, keys: string | string[], handler: () => void): void;
//# sourceMappingURL=focused-key.d.ts.map