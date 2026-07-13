import blessed from "blessed";
import { buildTopBarPlain } from "../renderer/plain-text.js";
import { THEME, TAG, glitchNoise, crtCorner } from "../theme.js";
export function createTopBar(screen, options = {}) {
    let subtitle = "Welcome to the kingdom.";
    let glitchSeed = 0;
    const bar = blessed.box({
        parent: screen,
        top: 0,
        left: 0,
        width: "100%",
        height: 2,
        tags: true,
        style: {
            fg: THEME.text,
            bg: THEME.bg,
            bold: true,
        },
        content: "",
    });
    const getPlainText = () => buildTopBarPlain(screen.width || 80, subtitle, glitchSeed);
    const render = () => {
        const cols = screen.width;
        const noise = glitchNoise(Math.min(cols - 2, 64), glitchSeed);
        const model = subtitle.length > cols - 28
            ? `${subtitle.slice(0, Math.max(8, cols - 31))}…`
            : subtitle;
        const line1Left = `${crtCorner("tl")} ${TAG.pinkBold}BLXCKCHAT${TAG.pinkBoldEnd} ${TAG.dim}│${TAG.dimEnd} ${TAG.muted}${model}${TAG.mutedEnd}`;
        const line1PlainLen = `BLXCKCHAT │ ${model}`.length;
        const livePad = Math.max(2, cols - line1PlainLen - 6);
        const line1 = `${line1Left}${" ".repeat(livePad)}${TAG.pink}▮ LIVE${TAG.pinkEnd} ${crtCorner("tr")}`;
        const line2 = `${TAG.pink}${noise}${TAG.pinkEnd}`;
        bar.setContent(`${line1}\n${line2}`);
        screen.render();
        options.onUpdate?.();
    };
    render();
    return {
        element: bar,
        setSubtitle(text) {
            subtitle = text;
            render();
        },
        getSubtitle() {
            return subtitle;
        },
        getPlainText,
        tickGlitch() {
            glitchSeed = (glitchSeed + 1) % 9;
            render();
        },
    };
}
//# sourceMappingURL=top-bar.js.map