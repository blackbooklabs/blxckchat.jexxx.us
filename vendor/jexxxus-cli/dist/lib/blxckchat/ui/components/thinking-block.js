import { randomUUID } from "node:crypto";
import { escapeBlessed } from "../renderer/markdown.js";
const THINKING_PATTERNS = [
    /<think>([\s\S]*?)<\/think>/gi,
    /\[thinking\]([\s\S]*?)\[\/thinking\]/gi,
    /```thinking\n([\s\S]*?)```/gi,
];
/** Extract thinking sections from assistant content. */
export function extractThinkingBlocks(content) {
    const blocks = [];
    let visible = content;
    for (const pattern of THINKING_PATTERNS) {
        visible = visible.replace(pattern, (_match, inner) => {
            blocks.push({
                id: randomUUID(),
                content: inner.trim(),
                collapsed: true,
            });
            return "";
        });
    }
    return {
        visibleContent: visible.trim(),
        blocks,
    };
}
export function formatThinkingBlockPlain(block) {
    const indicator = block.collapsed ? "▶" : "▼";
    const label = `[${indicator} Thinking]`;
    if (block.collapsed) {
        const preview = block.content.length > 80
            ? `${block.content.slice(0, 77)}…`
            : block.content;
        return `${label} (${block.content.length} chars) ${preview}\n`;
    }
    const body = block.content
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n");
    return `${label}\n${body}\n`;
}
export function formatThinkingBlock(block, expanded = false) {
    const indicator = expanded || !block.collapsed ? "▼" : "▶";
    const label = `{#525252-fg}[${indicator}{/}{#ec4899-fg} think{/}{#525252-fg}]{/}`;
    if (block.collapsed && !expanded) {
        const preview = block.content.length > 80
            ? `${block.content.slice(0, 77)}…`
            : block.content;
        return `${label} {gray-fg}(${block.content.length} chars) ${escapeBlessed(preview)}{/gray-fg}\n`;
    }
    const body = block.content
        .split("\n")
        .map((line) => `  {gray-fg}${escapeBlessed(line)}{/gray-fg}`)
        .join("\n");
    return `${label}\n${body}\n`;
}
export function toggleThinkingBlock(block) {
    block.collapsed = !block.collapsed;
}
//# sourceMappingURL=thinking-block.js.map