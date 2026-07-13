import { readClipboard } from "../session/tui-snapshot.js";
/** Wire Cmd/Ctrl+V (and Shift+Insert) to insert clipboard text into a blessed textbox. */
export function attachBlessedPaste(input, screen) {
    input.on("keypress", (_ch, key) => {
        const isPaste = ((key.meta || key.ctrl) && key.name === "v") ||
            (key.name === "insert" && Boolean(key.shift));
        if (!isPaste)
            return;
        void readClipboard().then((clip) => {
            const normalized = clip.replace(/\r?\n/g, " ").replace(/\t/g, " ");
            if (!normalized)
                return;
            const current = input.getValue() ?? "";
            input.setValue(current + normalized);
            screen.render();
        });
    });
}
//# sourceMappingURL=blessed-paste.js.map