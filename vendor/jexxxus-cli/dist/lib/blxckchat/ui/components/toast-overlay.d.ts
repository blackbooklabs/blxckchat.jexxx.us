import blessed from "blessed";
export type ToastVariant = "info" | "error";
export interface ToastOverlayHandle {
    show: (message: string, variant?: ToastVariant) => void;
    hide: () => void;
    isVisible: () => boolean;
}
export declare function createToastOverlay(screen: blessed.Widgets.Screen): ToastOverlayHandle;
//# sourceMappingURL=toast-overlay.d.ts.map