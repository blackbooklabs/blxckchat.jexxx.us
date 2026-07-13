import blessed from "blessed";
export interface TopBarHandle {
    element: blessed.Widgets.BoxElement;
    setSubtitle: (text: string) => void;
    getSubtitle: () => string;
    getPlainText: () => string;
    tickGlitch: () => void;
}
export interface TopBarOptions {
    onUpdate?: () => void;
}
export declare function createTopBar(screen: blessed.Widgets.Screen, options?: TopBarOptions): TopBarHandle;
//# sourceMappingURL=top-bar.d.ts.map