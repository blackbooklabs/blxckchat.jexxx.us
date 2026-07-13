import type blessed from "blessed";
import { type StoredProviderConfig } from "../../config.js";
import type { Provider } from "../../providers/types.js";
export interface ProviderOverlayHandle {
    open: () => void;
    setup: (catalogId: string) => Promise<void>;
    close: () => void;
    isVisible: () => boolean;
}
export interface ProviderOverlayOptions {
    getActiveConfig: () => StoredProviderConfig;
    setActiveConfig: (config: StoredProviderConfig, provider: Provider) => void;
    onMessage: (message: string) => void;
    onError: (message: string) => void;
}
export declare function createProviderOverlay(screen: blessed.Widgets.Screen, opts: ProviderOverlayOptions): ProviderOverlayHandle;
//# sourceMappingURL=provider-overlay.d.ts.map