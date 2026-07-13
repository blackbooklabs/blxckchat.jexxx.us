export function isPrintableKey(ch, key) {
    return (Boolean(ch) &&
        ch.length === 1 &&
        !key.ctrl &&
        !key.meta &&
        !/^[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]$/.test(ch));
}
/** Capture keystrokes at the program level while an overlay is open. */
export function createModalKeypress(screen) {
    let listener = null;
    const program = screen.program;
    return {
        start(handler) {
            this.stop();
            listener = (ch, key) => {
                handler(String(ch ?? ""), (key ?? {}));
            };
            program.on("keypress", listener);
            screen.grabKeys = true;
        },
        stop() {
            if (listener) {
                program.removeListener("keypress", listener);
                listener = null;
            }
            screen.grabKeys = false;
        },
    };
}
//# sourceMappingURL=modal-keypress.js.map