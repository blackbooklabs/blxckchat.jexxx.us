/** JEXXXUS BLXCKCHAT — pink retro TV / CRT glitch design tokens. */
export declare const THEME: {
    readonly pink: "#ec4899";
    readonly pinkDim: "#9d174d";
    readonly pinkGlow: "#f472b6";
    readonly magenta: "#d946ef";
    readonly bg: "#050505";
    readonly bgPanel: "#0a0a0a";
    readonly bgElevated: "#111111";
    readonly bgInset: "#080808";
    readonly text: "#f5f5f5";
    readonly textMuted: "#a3a3a3";
    readonly textDim: "#525252";
    readonly scanline: "#1a1a1a";
    readonly cyan: "#67e8f9";
    readonly success: "#4ade80";
    readonly warning: "#facc15";
    readonly error: "#f87171";
    readonly glitch: "░▒▓█▄▀▌▐";
};
/** Blessed inline color tags (hex fg). */
export declare const TAG: {
    readonly pink: "{#ec4899-fg}";
    readonly pinkEnd: "{/}";
    readonly pinkBold: "{#ec4899-fg}{bold}";
    readonly pinkBoldEnd: "{/bold}{/}";
    readonly muted: "{gray-fg}";
    readonly mutedEnd: "{/gray-fg}";
    readonly dim: "{#525252-fg}";
    readonly dimEnd: "{/}";
    readonly cyan: "{#67e8f9-fg}";
    readonly cyanEnd: "{/}";
    readonly white: "{white-fg}";
    readonly whiteEnd: "{/white-fg}";
};
/** Deterministic static noise strip (retro TV signal bar). */
export declare function glitchNoise(width: number, seed?: number): string;
/** Short corner ornament for CRT frames. */
export declare function crtCorner(which: "tl" | "tr" | "bl" | "br"): string;
/** Pi/Codex-style role pill label. */
export declare function rolePill(role: "you" | "blxckchat" | "system"): string;
/** Horizontal rule with glitch fade at edges. */
export declare function glitchRule(width: number): string;
//# sourceMappingURL=theme.d.ts.map