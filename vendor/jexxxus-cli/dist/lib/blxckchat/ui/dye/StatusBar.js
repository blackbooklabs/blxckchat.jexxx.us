import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { Box, Text } from "@sauerapple/dye";
import { glitchNoise } from "../theme.js";
const PINK = "#ec4899";
const TEXT_MUTED = "#a3a3a3";
const BG = "#050505";
export const StatusBar = ({ message, messageFocus, }) => {
    const noise = glitchNoise(4, message.length);
    return (_jsx(Box, { height: 1, backgroundColor: BG, children: _jsxs(Text, { color: TEXT_MUTED, children: [messageFocus ? (_jsxs(Text, { bold: true, color: PINK, children: ["\u2593 FOCUS \u2593", " "] })) : null, "\u2591 ", message, " ", _jsx(Text, { color: PINK, children: noise })] }) }));
};
//# sourceMappingURL=StatusBar.js.map