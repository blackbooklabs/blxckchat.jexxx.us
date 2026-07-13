import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { Box, Text } from "@sauerapple/dye";
import { glitchNoise, crtCorner } from "../theme.js";
const PINK = "#ec4899";
const TEXT = "#f5f5f5";
const TEXT_MUTED = "#a3a3a3";
const BG = "#050505";
export const TopBar = ({ subtitle, glitchSeed }) => {
    const noise = glitchNoise(64, glitchSeed);
    const model = subtitle.length > 40 ? `${subtitle.slice(0, 37)}…` : subtitle;
    return (_jsxs(Box, { flexDirection: "column", height: 2, marginTop: 1, backgroundColor: BG, children: [_jsxs(Text, { bold: true, color: TEXT, children: [_jsxs(Text, { color: PINK, children: [crtCorner("tl"), " "] }), _jsx(Text, { bold: true, color: PINK, children: "BLXCKCHAT" }), _jsx(Text, { color: "gray", children: " \u2502 " }), _jsx(Text, { color: TEXT_MUTED, children: model }), _jsx(Text, { color: PINK, children: " \u25AE LIVE" }), _jsxs(Text, { color: PINK, children: [" ", crtCorner("tr")] })] }), _jsx(Text, { color: PINK, children: noise })] }));
};
//# sourceMappingURL=TopBar.js.map