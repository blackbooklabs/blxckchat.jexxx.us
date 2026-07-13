import blessed from "blessed";
import { type DeviceLoginOverlayHandle } from "./components/device-login-overlay.js";
export declare function promptBlessedYesNo(screen: blessed.Widgets.Screen, message: string): Promise<boolean>;
export interface AuthTuiActions {
    status: () => Promise<string[]>;
    login: () => Promise<string[]>;
    logout: () => Promise<string[]>;
    refresh: () => Promise<string[]>;
}
export interface CreateAuthTuiActionsOptions {
    screen: blessed.Widgets.Screen;
    onAuthChanged: () => void;
    deviceLoginOverlay: DeviceLoginOverlayHandle;
}
export declare function createAuthTuiActions(options: CreateAuthTuiActionsOptions): AuthTuiActions;
//# sourceMappingURL=auth-tui.d.ts.map