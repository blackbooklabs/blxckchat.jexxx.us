import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Box, Text } from "@sauerapple/dye";
import { THEME } from "../theme.js";
import { OverlayCenter } from "./OverlayCenter.js";
export const ConfirmModal = ({ dialog }) => {
    if (!dialog)
        return null;
    return (_jsx(OverlayCenter, { children: _jsxs(Box, { width: "80%", height: 12, borderStyle: "round", borderColor: THEME.pink, backgroundColor: THEME.bgElevated, paddingLeft: 1, paddingRight: 1, flexDirection: "column", children: [_jsx(Text, { color: THEME.pink, children: "\u2591\u2591 tool confirm \u2591\u2591" }), _jsx(Box, { height: 1 }), _jsx(Text, { bold: true, children: dialog.title }), _jsx(Text, { color: THEME.textMuted, children: dialog.message }), _jsx(Box, { height: 1 }), _jsxs(Text, { children: [_jsx(Text, { color: "#67e8f9", children: "Y" }), " allow ", _jsx(Text, { color: "#f87171", children: "N" }), " ", "decline"] })] }) }));
};
//# sourceMappingURL=ConfirmModal.js.map