import blessed from "blessed";
export interface HotkeysOverlayHandle {
    toggle: () => void;
    hide: () => void;
    isVisible: () => boolean;
}
export declare function createHotkeysOverlay(screen: blessed.Widgets.Screen): HotkeysOverlayHandle;
//# sourceMappingURL=hotkeys-overlay.d.ts.map