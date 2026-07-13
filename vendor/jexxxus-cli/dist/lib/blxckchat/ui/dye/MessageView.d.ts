import React from "react";
import type { MessageStore } from "./message-store.js";
interface MessageViewProps {
    store: MessageStore;
    scrollOffset: number;
    onScroll: (offset: number) => void;
    terminalWidth: number;
    terminalHeight: number;
    /**
     * Real measured height (rows) of this component's flexGrow container,
     * from `measureElement` in DyeApp.tsx. The sibling chrome (TopBar,
     * StatusBar, InputView) doesn't add up to a fixed number of rows across
     * every render — falls back to a `terminalHeight - 6` guess only before
     * the first post-layout measurement lands.
     */
    viewportHeight?: number | undefined;
}
export declare const MessageView: React.FC<MessageViewProps>;
export {};
//# sourceMappingURL=MessageView.d.ts.map