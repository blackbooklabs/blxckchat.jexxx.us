import type blessed from "blessed";
export interface AttachBlessedTextSelectionOptions {
    element: blessed.Widgets.BoxElement;
    screen: blessed.Widgets.Screen;
    getScroll: () => number;
    getSourceLines: () => string[];
    restoreRichContent: () => void;
    onCopied: () => void;
    onCopyFailed?: () => void;
    shouldIgnoreMouse?: (data: {
        x: number;
        y: number;
    }) => boolean;
    enabled?: () => boolean;
}
export interface BlessedTextSelectionHandle {
    clear: () => void;
    hasSelection: () => boolean;
    isDragging: () => boolean;
}
export declare function attachBlessedTextSelection(options: AttachBlessedTextSelectionOptions): BlessedTextSelectionHandle;
//# sourceMappingURL=attach-blessed-text-selection.d.ts.map