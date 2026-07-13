import type blessed from "blessed";
import type { TerminalSession } from "../session/session-store.js";
export interface DivinityPickerOverlayHandle {
    open: () => void;
    close: () => void;
    isVisible: () => boolean;
}
export interface DivinityPickerOverlayOptions {
    session: TerminalSession;
    getActiveDivinityId: () => string | null;
    onActivated: (message: string) => void;
    onChatCleared: () => void;
}
export declare function createDivinityPickerOverlay(screen: blessed.Widgets.Screen, opts: DivinityPickerOverlayOptions): DivinityPickerOverlayHandle;
//# sourceMappingURL=divinity-picker-overlay.d.ts.map