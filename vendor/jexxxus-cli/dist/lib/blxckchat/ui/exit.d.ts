import type blessed from "blessed";
/** Tear down blessed and leave the terminal — safe to call multiple times. */
export declare function gracefulTuiExit(screen: blessed.Widgets.Screen, code?: number): void;
type KeyableElement = {
    key: (keys: string | string[], listener: () => void) => void;
};
export interface BindExitKeysOptions {
    /** Delay SIGINT/SIGTERM exit until the TUI has finished its first render. */
    deferSignalMs?: number;
    /** Called before the terminal tears down (e.g. persist last-used LLM). */
    onBeforeExit?: () => void;
}
/** Bind Ctrl+C / Ctrl+D / Esc exit to every focusable widget. */
export declare function bindExitKeys(screen: blessed.Widgets.Screen, elements: KeyableElement[], onEscape?: () => boolean, options?: BindExitKeysOptions): () => void;
/** Reset module exit guard (tests only). */
export declare function resetExitGuardForTests(): void;
export {};
//# sourceMappingURL=exit.d.ts.map