import type blessed from "blessed";
export interface TtyCheckResult {
    ok: boolean;
    reason?: string;
}
/** Blessed requires both stdin and stdout attached to a real terminal. */
export declare function canRunBlessedTui(): TtyCheckResult;
/**
 * Mouse for chat scrollbar drag, wheel scroll, and overlays.
 * On by default (accessibility). Set BLXCKCHAT_MOUSE=0 to disable all tracking.
 */
export declare function isBlessedMouseEnabled(): boolean;
/** Alias — slash popup and chat history share the same mouse policy. */
export declare function isSlashPopupMouseEnabled(): boolean;
/**
 * Blessed's Screen._listenMouse() calls program.enableMouse(), which for
 * plain xterm-like TERM values (the common case: xterm-256color, screen,
 * or anything with a terminfo key_mouse string — i.e. what iTerm2, Terminal.app,
 * Warp, Kitty, and VS Code's integrated terminal all report) picks legacy
 * UTF-8 mouse mode (`\x1b[?1005h`), not SGR extended mode (`\x1b[?1006h`).
 * UTF-8 mouse mode's coordinate encoding is fragile and most modern terminal
 * emulators don't reliably deliver motion (drag) reports under it — clicks
 * limp through but click-drag text selection silently never fires
 * `mousemove`, so nothing highlights and nothing copies. SGR mode has none
 * of these limits and is universally supported. Call this once, right after
 * screen construction, to override blessed's default choice.
 */
export declare function forceSgrMouseMode(screen: blessed.Widgets.Screen): void;
export declare function prepareStdinForTui(): void;
/**
 * Release the alternate screen and cooked TTY so console.log / readline can run.
 * Returns a function that restores the blessed session (call in finally).
 */
export declare function pauseBlessedForConsole(screen: blessed.Widgets.Screen): () => void;
/** Ctrl+Z style suspend — uses blessed program.sigtstp when available. */
export declare function suspendBlessedToShell(screen: blessed.Widgets.Screen, onResume?: () => void): void;
/** ANSI belt-and-suspenders when blessed teardown is partial or unavailable. */
export declare function writeTerminalResetSequences(): void;
/** Tear down a blessed screen and restore a normal cooked TTY for readline / shell. */
export declare function teardownBlessedScreen(screen?: blessed.Widgets.Screen): void;
/** Prepare stdin/stdout after a failed or skipped blessed session. */
export declare function restoreTerminalForReadline(screen?: blessed.Widgets.Screen): void;
//# sourceMappingURL=tty.d.ts.map