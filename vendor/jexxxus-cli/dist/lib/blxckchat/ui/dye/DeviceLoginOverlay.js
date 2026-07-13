import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Box, Text } from "@sauerapple/dye";
import { THEME } from "../theme.js";
import { OverlayCenter } from "./OverlayCenter.js";
export const DeviceLoginOverlay = ({ state, }) => {
    if (!state)
        return null;
    return (_jsx(OverlayCenter, { children: _jsxs(Box, { width: "82%", height: 16, borderStyle: "round", borderColor: THEME.pink, backgroundColor: THEME.bgElevated, paddingLeft: 1, paddingRight: 1, flexDirection: "column", children: [_jsx(Text, { color: "#67e8f9", children: "\u2591 device authorization \u2591" }), _jsx(Box, { height: 1 }), _jsx(Text, { children: state.status }), _jsx(Box, { height: 1 }), _jsx(Text, { color: "#525252", children: "Esc cancel" })] }) }));
};
//# sourceMappingURL=DeviceLoginOverlay.js.map