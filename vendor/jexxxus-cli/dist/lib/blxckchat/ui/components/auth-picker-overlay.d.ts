import type blessed from "blessed";
import type { AuthTuiActions } from "../auth-tui.js";
export interface AuthPickerOverlayHandle {
    open: () => void;
    close: () => void;
    isVisible: () => boolean;
}
export interface AuthPickerOverlayOptions {
    authActions: AuthTuiActions;
    onMessage: (message: string) => void;
    onFocusInput: () => void;
}
export declare function createAuthPickerOverlay(screen: blessed.Widgets.Screen, opts: AuthPickerOverlayOptions): AuthPickerOverlayHandle;
//# sourceMappingURL=auth-picker-overlay.d.ts.map