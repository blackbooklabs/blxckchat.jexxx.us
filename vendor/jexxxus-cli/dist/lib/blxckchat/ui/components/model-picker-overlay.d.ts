import type blessed from "blessed";
import type { StoredProviderConfig } from "../../config.js";
import type { Provider } from "../../providers/types.js";
export interface ModelPickerOverlayHandle {
    open: () => Promise<void>;
    close: () => void;
    isVisible: () => boolean;
}
export interface ModelPickerOverlayOptions {
    getActiveConfig: () => StoredProviderConfig;
    setActiveConfig: (config: StoredProviderConfig, provider: Provider) => void;
    onApplied: (message: string) => void;
}
export declare function createModelPickerOverlay(screen: blessed.Widgets.Screen, opts: ModelPickerOverlayOptions): ModelPickerOverlayHandle;
//# sourceMappingURL=model-picker-overlay.d.ts.map