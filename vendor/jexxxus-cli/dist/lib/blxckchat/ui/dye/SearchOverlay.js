import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Box, Text } from "@sauerapple/dye";
import { THEME } from "../theme.js";
export const SearchOverlay = ({ query, cursorPos, selectionStart }) => {
    // If cursor/selection provided, render with cursor at exact position
    if (cursorPos != null) {
        const before = query.slice(0, cursorPos);
        const atCursor = query.slice(cursorPos, cursorPos + 1);
        const after = query.slice(cursorPos + 1);
        // Determine selection range
        const selStart = selectionStart ?? cursorPos;
        const selEnd = selectionStart != null ? (selectionStart < cursorPos ? cursorPos : selectionStart) : cursorPos;
        const hasSelection = selStart !== selEnd;
        if (!hasSelection) {
            return (_jsxs(Box, { position: "absolute", top: 2, left: 1, width: "100%-2", height: 3, borderStyle: "round", borderColor: THEME.cyan, paddingLeft: 1, paddingRight: 1, flexDirection: "row", alignItems: "center", children: [_jsx(Text, { color: THEME.cyan, children: "/" }), _jsx(Text, { children: before }), _jsx(Text, { inverse: true, children: "\u2588" }), _jsxs(Text, { children: [atCursor, after] })] }));
        }
        // Has selection - show selection highlight
        const selBefore = query.slice(0, selStart);
        const selText = query.slice(selStart, selEnd);
        const selAfter = query.slice(selEnd);
        return (_jsxs(Box, { position: "absolute", top: 2, left: 1, width: "100%-2", height: 3, borderStyle: "round", borderColor: THEME.cyan, paddingLeft: 1, paddingRight: 1, flexDirection: "row", alignItems: "center", children: [_jsx(Text, { color: THEME.cyan, children: "/" }), _jsx(Text, { children: selBefore }), _jsx(Text, { inverse: true, children: selText }), _jsx(Text, { children: selAfter })] }));
    }
    // Legacy rendering (cursor at end)
    return (_jsxs(Box, { position: "absolute", top: 2, left: 1, width: "100%-2", height: 3, borderStyle: "round", borderColor: THEME.cyan, paddingLeft: 1, paddingRight: 1, flexDirection: "row", alignItems: "center", children: [_jsx(Text, { color: THEME.cyan, children: "/" }), _jsx(Text, { children: query }), _jsx(Text, { color: THEME.textDim, children: "\u2588" })] }));
};
//# sourceMappingURL=SearchOverlay.js.map