import React from "react";
/**
 * Centers a modal/overlay panel over the whole screen using real flexbox
 * centering (`justifyContent`/`alignItems`), not `top="50%" left="50%"`.
 *
 * Dye (an Ink fork, Yoga-backed) resolves `top`/`left` percentages via
 * `node.setPositionPercent()` — a raw offset of that edge from the parent's
 * edge, with no auto-subtraction of the child's own size (no CSS
 * `transform: translate(-50%,-50%)` equivalent exists here). So
 * `top="50%" left="50%"` places the panel's TOP-LEFT corner at the
 * screen's midpoint, not its center — the panel ends up pushed into the
 * bottom-right quadrant. Every modal overlay in this app had this bug.
 * Wrapping the (non-positioned) panel in this full-screen absolutely
 * positioned flex container fixes it everywhere at once.
 */
export declare const OverlayCenter: React.FC<{
    children: React.ReactNode;
}>;
//# sourceMappingURL=OverlayCenter.d.ts.map