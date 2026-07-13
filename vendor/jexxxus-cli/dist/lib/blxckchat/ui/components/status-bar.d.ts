import blessed from "blessed";
export interface StatusBarHandle {
    element: blessed.Widgets.BoxElement;
    setMessage: (text: string) => void;
    getMessage: () => string;
    getPlainText: () => string;
}
export interface StatusBarOptions {
    onUpdate?: () => void;
}
export declare function createStatusBar(screen: blessed.Widgets.Screen, options?: StatusBarOptions): StatusBarHandle;
//# sourceMappingURL=status-bar.d.ts.map