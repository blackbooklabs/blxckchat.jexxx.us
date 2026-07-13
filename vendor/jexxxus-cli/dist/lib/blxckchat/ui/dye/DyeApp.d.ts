import React from "react";
import type { MessageStore } from "./message-store.js";
import type { DyeActionCallbacks, PickerItemDef } from "./dye-types.js";
export interface DyeAppOverlayHandles {
    showPicker: (items: PickerItemDef[], options?: {
        title?: string;
        selectedIndex?: number;
        hideFilter?: boolean;
        statusHeader?: string;
    }) => Promise<PickerItemDef | null>;
    showPrompt: (options: import("./dye-types.js").PromptOverlayOptions) => Promise<string | null>;
    startDeviceLogin: () => Promise<import("../../../auth.js").Credentials>;
}
interface DyeAppProps {
    store: MessageStore;
    callbacks: DyeActionCallbacks;
    initialInputValue?: string;
    overlayRef?: React.MutableRefObject<DyeAppOverlayHandles | null>;
}
export declare const DyeApp: React.FC<DyeAppProps>;
export {};
//# sourceMappingURL=DyeApp.d.ts.map