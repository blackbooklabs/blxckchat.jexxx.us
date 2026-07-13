import { crtCorner, glitchNoise } from "../theme.js";
/** Strip blessed inline tags, restoring {open}/{close} escapes. */
export function stripBlessedTags(text) {
    return text
        .replace(/\{open\}/g, "{")
        .replace(/\{close\}/g, "}")
        .replace(/\{[^}]*\}/g, "");
}
/** Compact welcome card shown after the JEXXXUS splash animation. */
export function buildWelcomeBannerPlain(authEmail, toolCount) {
    const email = authEmail.length > 28 ? `${authEmail.slice(0, 25)}…` : authEmail || "operator";
    const width = 44;
    const innerW = width - 2;
    const inner = [
        "  Kingdom feed online",
        "",
        `  ${email}  ·  ${toolCount} tools`,
        "",
        "  › message below  ·  /help  ·  ? hotkeys",
        `  ${glitchNoise(innerW - 2, 5)}`,
    ];
    const lines = [
        `╭${"─".repeat(innerW)}╮`,
        ...inner.map((line) => {
            const padded = line.padEnd(innerW);
            return `│${padded}│`;
        }),
        `╰${"─".repeat(innerW)}╯`,
    ];
    return lines.join("\n");
}
export function wrapWelcomeBannerBlessed(plain) {
    return `{#ec4899-fg}${plain.replace(/\n/g, "{/}\n{#ec4899-fg}")}{/}`;
}
/** CRT-framed panel matching the blessed chat pane border. */
export function framePanel(content, width) {
    const innerW = Math.max(20, width - 2);
    const lines = content.split("\n");
    const top = `┌${"─".repeat(innerW)}┐`;
    const body = lines.map((line) => {
        const clipped = line.length > innerW ? `${line.slice(0, Math.max(0, innerW - 1))}…` : line;
        return `│${clipped.padEnd(innerW)}│`;
    });
    const bottom = `└${"─".repeat(innerW)}┘`;
    return [top, ...body, bottom].join("\n");
}
/** Labeled input frame matching the transmit box. */
export function frameTransmitInput(value, width) {
    const innerW = Math.max(20, width - 2);
    const label = "─ transmit ";
    const top = `┌${label}${"─".repeat(Math.max(0, innerW - label.length))}┐`;
    const body = `│${value.padEnd(innerW)}│`;
    const bottom = `└${"─".repeat(innerW)}┘`;
    return [top, body, bottom].join("\n");
}
/** Top chrome as plain CRT header (two lines). */
export function buildTopBarPlain(width, model, seed = 0) {
    const cols = Math.max(40, width);
    const line1Left = `${crtCorner("tl")} BLXCKCHAT │ ${model}`;
    const liveSuffix = `▮ LIVE ${crtCorner("tr")}`;
    const livePad = Math.max(2, cols - line1Left.length - liveSuffix.length);
    const line1 = `${line1Left}${" ".repeat(livePad)}${liveSuffix}`;
    const line2 = glitchNoise(Math.min(cols - 2, 64), seed);
    return `${line1}\n${line2}`;
}
/** Status strip with glitch ornaments. */
export function buildStatusBarPlain(width, message) {
    const cols = Math.max(40, width);
    const noise = glitchNoise(4, message.length);
    const pad = Math.max(0, cols - message.length - noise.length - 4);
    return `░ ${message}${" ".repeat(pad)}${noise}`;
}
/** Assemble the full TUI as plain, copy-paste-friendly text. */
export function buildTuISnapshot(parts) {
    return [parts.topBar, parts.messages, parts.statusBar, parts.input]
        .filter((section) => section.length > 0)
        .join("\n");
}
/** One line per indicator—paste into tickets, Cursor, or logs. */
export function buildChromeDigestPlain(input) {
    const lines = [
        "BLXCKCHAT chrome digest",
        `top_bar: ${input.topBarModel}`,
        `auth: ${input.authEmail}`,
        `tools: ${input.toolCount}`,
        `hero_subtitle: ${input.heroSubtitle}`,
        `hero_hint: ${input.heroHint}`,
        `status_bar: ${input.statusBar}`,
        `input: ${input.inputValue}`,
    ];
    if (input.divinity) {
        lines.push(`divinity: ${input.divinity}`);
    }
    return lines.join("\n");
}
/** Chrome digest + visual snapshot for Ctrl+Y / /copy. */
export function buildTuISnapshotWithChrome(chrome, parts) {
    const visual = buildTuISnapshot(parts);
    return `${chrome}\n\n---\n\n${visual}`;
}
//# sourceMappingURL=plain-text.js.map