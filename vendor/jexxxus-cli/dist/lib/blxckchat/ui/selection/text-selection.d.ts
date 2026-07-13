export interface TextCell {
    line: number;
    col: number;
}
export interface TextSelectionState {
    anchor: TextCell;
    focus: TextCell;
    dragging: boolean;
}
export declare function normalizeSelectionRange(anchor: TextCell, focus: TextCell): {
    start: TextCell;
    end: TextCell;
};
export declare function clampCell(cell: TextCell, lines: string[]): TextCell;
export declare function getSelectedText(lines: string[], anchor: TextCell, focus: TextCell): string;
export declare function selectionHasText(lines: string[], anchor: TextCell, focus: TextCell): boolean;
/** Apply blessed inverse highlight to a plain-text line grid. */
export declare function applySelectionHighlight(lines: string[], anchor: TextCell, focus: TextCell, escape: (line: string) => string): string;
export declare function mouseToTextCell(element: {
    aleft: number | string;
    atop: number | string;
    padding?: {
        left?: number;
        top?: number;
    };
}, data: {
    x: number;
    y: number;
}, scrollLine: number): TextCell;
/** OpenCode-style: copy on mouse-up for macOS/Linux; Windows uses right-click. */
export declare function shouldCopyOnMouseUp(): boolean;
export declare function shouldCopyOnRightMouseDown(): boolean;
//# sourceMappingURL=text-selection.d.ts.map