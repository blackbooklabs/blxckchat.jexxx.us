import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Box, Text } from "@sauerapple/dye";
import { renderUserMessageBox } from "../renderer/markdown.js";
import { formatThinkingBlock } from "../components/thinking-block.js";
import { stripBlessedTags } from "../renderer/plain-text.js";
import { WORD, ROWS, PINK_LETTER_INDEX } from "../components/jexxxus-hero.js";
import { GLYPHS } from "../components/jexxxus-hero.js";
const PINK = "#ec4899";
const TEXT = "#f5f5f5";
const TEXT_MUTED = "#a3a3a3";
const ERROR = "#f87171";
const LETTER_GAP = 1;
function stripTags(text) {
    return stripBlessedTags(text);
}
function normalizeText(text) {
    return text
        .replace(/[▌]/g, "|")
        .replace(/[◇]/g, "*")
        .replace(/[▶]/g, ">")
        .replace(/[▼]/g, "v")
        .replace(/[⋯…]/g, "...");
}
/**
 * The hero (idle-screen ASCII logo + subtitle) is handled by its own
 * dedicated centered component, not this line array — see
 * `HeroCentered` below. `dismissHero()` always runs before any other
 * block is appended (message-store.ts#appendUser), so a hero block can
 * only ever appear alone; this function is never called while one is
 * present.
 */
function buildRenderLines(store, termWidth) {
    const lines = [];
    let thinkIdx = 0;
    for (let i = 0; i < store.blocks.length; i++) {
        const block = store.blocks[i];
        if (!block)
            continue;
        if (i > 0 && (block.type === "user" || block.type === "welcome")) {
            lines.push({
                key: `sep-${i}`,
                text: "· ".repeat(6),
                color: "gray",
                dim: true,
            });
        }
        switch (block.type) {
            case "hero":
                break;
            case "user": {
                const plain = stripTags(renderUserMessageBox(block.content));
                for (const [li, line] of plain.split("\n").entries()) {
                    lines.push({
                        key: `user-${i}-${li}`,
                        text: line,
                        color: PINK,
                        dim: false,
                    });
                }
                break;
            }
            case "assistant": {
                lines.push({
                    key: `assist-hdr-${i}`,
                    text: "╭─ blxckchat ───────────────────",
                    color: "gray",
                    dim: true,
                });
                if (block.thinkingBlocks) {
                    for (const tb of block.thinkingBlocks) {
                        const marker = thinkIdx === store.focusedThinkingIndex ? "▸ " : "  ";
                        const plain = marker + stripTags(formatThinkingBlock(tb));
                        lines.push({
                            key: `think-${i}-${thinkIdx}`,
                            text: tb.collapsed ? `${marker}[▼ think] ...` : plain,
                            color: "gray",
                            dim: true,
                        });
                        thinkIdx++;
                    }
                }
                const body = normalizeText(stripTags(block.content));
                for (const [li, line] of body.split("\n").entries()) {
                    lines.push({
                        key: `assist-${i}-${li}`,
                        text: line,
                        color: TEXT,
                        dim: false,
                    });
                }
                lines.push({
                    key: `assist-foot-${i}`,
                    text: "╰────────────────────────",
                    color: "gray",
                    dim: true,
                });
                break;
            }
            case "tool": {
                if (block.toolEntries) {
                    for (const te of block.toolEntries) {
                        const preview = te.result.slice(0, 200).replace(/\n/g, " ");
                        lines.push({
                            key: `tool-${i}-${te.toolName}`,
                            text: `  ${te.toolName}: ${preview}`,
                            color: "gray",
                            dim: true,
                        });
                    }
                }
                break;
            }
            case "error": {
                const plain = stripTags(block.content);
                for (const [li, line] of plain.split("\n").entries()) {
                    lines.push({
                        key: `err-${i}-${li}`,
                        text: `⚡ ${line}`,
                        color: ERROR,
                        dim: false,
                    });
                }
                break;
            }
            case "system": {
                const plain = stripTags(block.content);
                lines.push({
                    key: `sys-${i}`,
                    text: `┌ ${plain} ┐`,
                    color: "gray",
                    dim: true,
                });
                break;
            }
        }
    }
    return lines;
}
/**
 * Renders the idle-screen hero (ASCII logo + subtitle) inside its own
 * `flexGrow`/`justifyContent="center"`/`alignItems="center"` container so
 * Ink/Dye's real flexbox layout — which already knows the true available
 * height inside the parent's `flexGrow` box (see DyeApp.tsx) — does the
 * vertical AND horizontal centering. No terminal-height arithmetic here;
 * that's what kept undershooting/overshooting across terminal sizes when
 * this was hand-computed as blank leading lines mixed into the scrollable
 * line array. `alignItems="center"` on the outer Box centers each row
 * horizontally on its own, so rows are built at their natural width with
 * no manual left-padding.
 */
const HeroCentered = ({ content }) => {
    const rows = [];
    for (let r = 0; r < ROWS; r++) {
        const segments = [];
        for (let li = 0; li < WORD.length; li++) {
            const ch = WORD[li];
            const glyph = GLYPHS[ch]?.[r] ?? "";
            segments.push({ text: glyph, color: PINK_LETTER_INDEX.has(li) ? PINK : TEXT });
            if (li < WORD.length - 1)
                segments.push({ text: " ".repeat(LETTER_GAP), color: TEXT });
        }
        rows.push({ key: `hero-logo-${r}`, segments });
    }
    const plain = stripTags(content);
    const extraLines = plain.split("\n").slice(ROWS).filter((l) => l.length > 0);
    return (_jsxs(Box, { flexGrow: 1, flexDirection: "column", justifyContent: "center", children: [rows.map((row) => (_jsx(Box, { width: "100%", justifyContent: "center", children: _jsx(Text, { children: row.segments.map((seg, si) => (_jsx(Text, { color: seg.color, children: seg.text }, si))) }) }, row.key))), _jsx(Box, { height: 1 }), extraLines.map((line, li) => (_jsx(Box, { width: "100%", justifyContent: "center", children: _jsx(Text, { color: TEXT_MUTED, dimColor: true, children: line.trim() }) }, `hero-extra-${li}`)))] }));
};
export const MessageView = ({ store, scrollOffset, onScroll, terminalWidth, terminalHeight, viewportHeight, }) => {
    const soleHero = store.blocks.length === 1 && store.blocks[0]?.type === "hero"
        ? store.blocks[0]
        : null;
    const viewHeight = viewportHeight ?? terminalHeight - 6;
    const renderLines = React.useMemo(() => buildRenderLines(store, terminalWidth), [
        store.blocks,
        store.focusedThinkingIndex,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        store.blocks
            .map((b) => b.content + (b.isStreaming ? "(stream)" : ""))
            .join(""),
    ]);
    if (soleHero) {
        return _jsx(HeroCentered, { content: soleHero.content });
    }
    const totalLines = renderLines.length;
    // scrollOffset can exceed the scrollable range (e.g. after new content
    // shrinks totalLines, or a fast wheel/key burst overshoots the top).
    // Clamping here — rather than in message-store's scrollUp/scrollPageUp,
    // which don't know the current viewport height — keeps this the single
    // place that reconciles offset against the live render. Unclamped, a
    // large scrollOffset drives visibleEnd negative and Array.slice's
    // negative-end semantics (offset from the *end* of the array) silently
    // eat lines off the bottom of the window instead of clamping at the top.
    const maxScrollOffset = Math.max(0, totalLines - viewHeight);
    const clampedScrollOffset = Math.min(scrollOffset, maxScrollOffset);
    const visibleEnd = totalLines - clampedScrollOffset;
    const visibleStart = Math.max(0, visibleEnd - viewHeight);
    const visibleLines = renderLines.slice(visibleStart, Math.min(renderLines.length, visibleEnd));
    return (_jsx(Box, { flexDirection: "column", flexGrow: 1, paddingLeft: 1, paddingRight: 1, children: visibleLines.map((line) => line.segments ? (_jsx(Text, { dimColor: line.dim, children: line.segments.map((seg, si) => (_jsx(Text, { color: seg.color, children: seg.text }, si))) }, line.key)) : (_jsx(Text, { color: line.color, dimColor: line.dim, children: line.text }, line.key))) }));
};
//# sourceMappingURL=MessageView.js.map