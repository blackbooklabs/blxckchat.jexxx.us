import blessed from "blessed";
import { type Credentials } from "../../../auth.js";
export declare class DeviceLoginCancelledError extends Error {
    constructor();
}
export interface DeviceLoginOverlayHandle {
    run: () => Promise<Credentials>;
    cancel: () => void;
    isVisible: () => boolean;
}
export declare function formatDeviceLoginOverlayContent(input: {
    userCode: string;
    verificationUrl: string;
    expiresMinutes: number;
    status: string;
    browserOpened: boolean;
    copyHint: string;
}): string;
export interface DeviceLoginOverlayOptions {
    onCopied?: () => void;
    onCopyFailed?: () => void;
}
export declare function createDeviceLoginOverlay(screen: blessed.Widgets.Screen, options?: DeviceLoginOverlayOptions): DeviceLoginOverlayHandle;
//# sourceMappingURL=device-login-overlay.d.ts.map