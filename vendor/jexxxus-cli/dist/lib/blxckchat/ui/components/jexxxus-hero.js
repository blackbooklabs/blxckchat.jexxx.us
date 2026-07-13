import { TAG } from "../theme.js";
/** 5-row geometric block glyphs — OpenCode-style uniform width. */
export const GLYPHS = {
    J: ["     █", "     █", "     █", " █   █", "  ███ "],
    E: [" █████", " █    ", " ████ ", " █    ", " █████"],
    X: [" █   █", "  █ █ ", "   █  ", "  █ █ ", " █   █"],
    U: [" █   █", " █   █", " █   █", " █   █", "  ███ "],
    S: ["  ███ ", " █    ", "  ███ ", "    █ ", " ███  "],
};
export const WORD = ["J", "E", "X", "X", "X", "U", "S"];
export const ROWS = 5;
export const LETTER_GAP = 1;
/** Indices of X letters — brand emphasis (OpenCode keeps logo uniform; we pink the XXX). */
export const PINK_LETTER_INDEX = new Set([2, 3, 4]);
function truncateAuthLabel(authLabel) {
    return authLabel.length > 28 ? `${authLabel.slice(0, 25)}…` : authLabel;
}
/** Hero subtitle line (model · auth · tool count)—copy-paste friendly, no block glyphs. */
export function formatHeroSubtitle(meta) {
    const label = truncateAuthLabel(meta.authLabel);
    return `${meta.providerLabel}  ·  ${label}  ·  ${meta.toolCount} tools`;
}
/** Hero hint line under the JEXXXUS wordmark. */
export function formatHeroHint() {
    return "Type a message to begin  ·  /help  ·  ? hotkeys";
}
function composeRow(letters, row) {
    return letters
        .map((ch) => GLYPHS[ch]?.[row] ?? "      ")
        .join(" ".repeat(LETTER_GAP));
}
function colorizeRow(row) {
    const parts = [];
    for (let li = 0; li < WORD.length; li++) {
        const ch = WORD[li];
        const glyph = GLYPHS[ch]?.[row] ?? "";
        if (PINK_LETTER_INDEX.has(li)) {
            parts.push(`${TAG.pinkBold}${glyph}${TAG.pinkBoldEnd}`);
        }
        else {
            parts.push(`${TAG.white}${glyph}${TAG.whiteEnd}`);
        }
    }
    return parts.join(" ".repeat(LETTER_GAP));
}
/** Plain block logo lines (no blessed tags). */
export function renderJexxxusHeroPlain(width, meta) {
    const logoLines = Array.from({ length: ROWS }, (_, r) => composeRow(WORD, r));
    const logoWidth = logoLines[0]?.length ?? 0;
    const left = Math.max(0, Math.floor((width - logoWidth) / 2));
    const subtitle = formatHeroSubtitle(meta);
    const hint = formatHeroHint();
    const lines = [];
    for (const row of logoLines) {
        lines.push(`${" ".repeat(left)}${row}`);
    }
    const subPad = Math.max(0, Math.floor((width - subtitle.length) / 2));
    const hintPad = Math.max(0, Math.floor((width - hint.length) / 2));
    lines.push("");
    lines.push(`${" ".repeat(subPad)}${subtitle}`);
    lines.push(`${" ".repeat(hintPad)}${hint}`);
    return lines.join("\n");
}
/** Blessed-tagged static hero (OpenCode-style standstill wordmark). */
export function renderJexxxusHeroBlessed(width, meta) {
    const logoLines = Array.from({ length: ROWS }, (_, r) => colorizeRow(r));
    const logoWidth = composeRow(WORD, 0).length;
    const left = Math.max(0, Math.floor((width - logoWidth) / 2));
    const subtitle = formatHeroSubtitle(meta);
    const hint = formatHeroHint();
    const lines = [];
    for (const row of logoLines) {
        lines.push(`${" ".repeat(left)}${row}`);
    }
    const subPad = Math.max(0, Math.floor((width - subtitle.length) / 2));
    const hintPad = Math.max(0, Math.floor((width - hint.length) / 2));
    lines.push("");
    lines.push(`${" ".repeat(subPad)}${TAG.muted}${subtitle}${TAG.mutedEnd}`);
    lines.push(`${" ".repeat(hintPad)}${TAG.dim}${hint}${TAG.dimEnd}`);
    return lines.join("\n");
}
/** Vertical centering padding for empty-state hero (OpenCode centers in chat pane). */
export function centerHeroVertically(heroContent, viewportLines) {
    const heroLines = heroContent.split("\n").length;
    const padTop = Math.max(1, Math.floor((viewportLines - heroLines) / 2) - 1);
    return `${"\n".repeat(padTop)}${heroContent}`;
}
//# sourceMappingURL=jexxxus-hero.js.map