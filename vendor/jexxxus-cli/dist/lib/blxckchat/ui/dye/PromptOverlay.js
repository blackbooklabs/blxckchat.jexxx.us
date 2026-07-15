import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
import { Box, Text } from "@sauerapple/dye";
import { THEME } from "../theme.js";
import { OverlayCenter } from "./OverlayCenter.js";
export const PromptOverlay = ({ state }) => {
    if (!state)
        return null;
    const masked = state.options.secret ?? false;
    const cursorPos = state.cursorPos ?? state.input.length;
    const selectionStart = state.selectionStart ?? null;
    const hasValue = state.input.length > 0;
    // For secret mode, show dots with cursor at end only
    if (masked) {
        return (_jsx(OverlayCenter, { children: _jsxs(Box, { width: "72%", height: 11, borderStyle: "round", borderColor: THEME.pink, backgroundColor: THEME.bgElevated, flexDirection: "column", children: [_jsxs(Text, { color: THEME.pink, children: [" ", state.options.title, " "] }), _jsx(Box, { height: 1, paddingLeft: 1, paddingRight: 1, children: _jsx(Text, { color: THEME.textMuted, children: state.options.label }) }), state.options.hint ? (_jsx(Box, { height: 1, paddingLeft: 1, paddingRight: 1, children: _jsx(Text, { color: THEME.textDim, children: state.options.hint }) })) : null, _jsx(Box, { height: 3, borderStyle: "round", borderColor: hasValue ? THEME.pinkGlow : THEME.textDim, marginTop: 1, marginBottom: 1, marginLeft: 1, marginRight: 1, paddingLeft: 1, paddingRight: 1, children: _jsxs(Text, { color: THEME.text, children: ["\u2022", state.input.length > 0 ? _jsx(Text, { color: THEME.pink, children: "\u2588" }) : null] }) }), _jsx(Box, { paddingLeft: 1, paddingRight: 1, children: _jsx(Text, { color: THEME.textDim, children: "\u2318V or P paste \u00B7 Enter confirm \u00B7 Esc cancel" }) })] }) }));
    }
    // Non-secret: render with cursor/selection support
    const selStart = selectionStart ?? cursorPos;
    const selEnd = selectionStart != null ? (selectionStart < cursorPos ? cursorPos : selectionStart) : cursorPos;
    const hasSelection = selStart !== selEnd;
    return (_jsx(OverlayCenter, { children: _jsxs(Box, { width: "72%", height: 11, borderStyle: "round", borderColor: THEME.pink, backgroundColor: THEME.bgElevated, flexDirection: "column", children: [_jsxs(Text, { color: THEME.pink, children: [" ", state.options.title, " "] }), _jsx(Box, { height: 1, paddingLeft: 1, paddingRight: 1, children: _jsx(Text, { color: THEME.textMuted, children: state.options.label }) }), state.options.hint ? (_jsx(Box, { height: 1, paddingLeft: 1, paddingRight: 1, children: _jsx(Text, { color: THEME.textDim, children: state.options.hint }) })) : null, _jsx(Box, { height: 3, borderStyle: "round", borderColor: hasValue ? THEME.pinkGlow : THEME.textDim, marginTop: 1, marginBottom: 1, marginLeft: 1, marginRight: 1, paddingLeft: 1, paddingRight: 1, children: _jsx(Text, { color: THEME.text, children: state.input.length === 0 ? (_jsx(Text, { color: THEME.textDim, children: "type here" })) : hasSelection ? (_jsxs(_Fragment, { children: [_jsx(Text, { color: THEME.text, children: state.input.slice(0, selStart) }), _jsx(Text, { inverse: true, color: THEME.pink, children: state.input.slice(selStart, selEnd) }), _jsx(Text, { color: THEME.text, children: state.input.slice(selEnd, cursorPos) }), _jsx(Text, { inverse: true, children: "\u2588" }), _jsx(Text, { color: THEME.text, children: state.input.slice(cursorPos) })] })) : (_jsxs(_Fragment, { children: [_jsx(Text, { color: THEME.text, children: state.input.slice(0, cursorPos) }), _jsx(Text, { inverse: true, children: "\u2588" }), _jsx(Text, { color: THEME.text, children: state.input.slice(cursorPos) })] })) }) }), _jsx(Box, { paddingLeft: 1, paddingRight: 1, children: _jsx(Text, { color: THEME.textDim, children: "Enter confirm \u00B7 Esc cancel" }) })] }) }));
};
//# sourceMappingURL=PromptOverlay.js.map