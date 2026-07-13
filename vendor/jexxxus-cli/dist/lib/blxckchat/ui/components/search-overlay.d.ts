import blessed from "blessed";
export interface SearchOverlayHandle {
    open: () => void;
    close: () => void;
    isVisible: () => boolean;
    getQuery: () => string;
}
export declare function createSearchOverlay(screen: blessed.Widgets.Screen, onSearch: (query: string) => void): SearchOverlayHandle;
//# sourceMappingURL=search-overlay.d.ts.map