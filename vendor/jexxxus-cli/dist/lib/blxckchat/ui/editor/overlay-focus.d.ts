import type blessed from "blessed";
/** Pause transmit readInput without submit/cancel, then focus an overlay widget. */
export declare function takeOverlayFocus(screen: blessed.Widgets.Screen, target: blessed.Widgets.Node): void;
/** Restore focus after an overlay closes (e.g. back to transmit). */
export declare function releaseOverlayFocus(screen: blessed.Widgets.Screen): void;
//# sourceMappingURL=overlay-focus.d.ts.map