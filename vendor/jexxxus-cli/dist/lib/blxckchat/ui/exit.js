import { teardownBlessedScreen } from "./tty.js";
let exiting = false;
/** Tear down blessed and leave the terminal — safe to call multiple times. */
export function gracefulTuiExit(screen, code = 0) {
    if (exiting)
        return;
    exiting = true;
    teardownBlessedScreen(screen);
    process.exit(code);
}
/** Bind Ctrl+C / Ctrl+D / Esc exit to every focusable widget. */
export function bindExitKeys(screen, elements, onEscape, options = {}) {
    const deferMs = options.deferSignalMs ?? 400;
    let signalsArmed = false;
    const exit = () => {
        options.onBeforeExit?.();
        gracefulTuiExit(screen, 0);
    };
    const handleEscape = () => {
        if (onEscape?.())
            return;
        exit();
    };
    for (const el of elements) {
        el.key(["C-c", "C-d"], exit);
        el.key(["escape"], handleEscape);
    }
    const armTimer = setTimeout(() => {
        signalsArmed = true;
    }, deferMs);
    const onSigint = () => {
        if (!signalsArmed)
            return;
        exit();
    };
    const onSigterm = () => {
        if (!signalsArmed)
            return;
        gracefulTuiExit(screen, 0);
    };
    process.on("SIGINT", onSigint);
    process.on("SIGTERM", onSigterm);
    const cleanup = () => {
        clearTimeout(armTimer);
        process.off("SIGINT", onSigint);
        process.off("SIGTERM", onSigterm);
    };
    process.once("exit", cleanup);
    return exit;
}
/** Reset module exit guard (tests only). */
export function resetExitGuardForTests() {
    exiting = false;
}
//# sourceMappingURL=exit.js.map