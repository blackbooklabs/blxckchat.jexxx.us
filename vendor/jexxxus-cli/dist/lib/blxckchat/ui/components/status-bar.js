import blessed from "blessed";
import { buildStatusBarPlain } from "../renderer/plain-text.js";
import { THEME, TAG, glitchNoise } from "../theme.js";
export function createStatusBar(screen, options = {}) {
    let message = "? hotkeys · / commands · esc abort";
    const bar = blessed.box({
        parent: screen,
        bottom: 3,
        left: 0,
        width: "100%",
        height: 1,
        tags: true,
        style: {
            fg: THEME.textMuted,
            bg: THEME.bg,
        },
        content: "",
    });
    const render = () => {
        const cols = Math.max(40, screen.width || 80);
        const noise = glitchNoise(4, message.length);
        const pad = Math.max(0, cols - message.length - noise.length - 4);
        bar.setContent(`${TAG.dim}░${TAG.dimEnd} ${TAG.muted}${message}${TAG.mutedEnd}${" ".repeat(pad)}${TAG.pink}${noise}${TAG.pinkEnd}`);
        screen.render();
        options.onUpdate?.();
    };
    render();
    return {
        element: bar,
        setMessage(text) {
            message = text;
            render();
        },
        getMessage() {
            return message;
        },
        getPlainText() {
            return buildStatusBarPlain(screen.width || 80, message);
        },
    };
}
//# sourceMappingURL=status-bar.js.map