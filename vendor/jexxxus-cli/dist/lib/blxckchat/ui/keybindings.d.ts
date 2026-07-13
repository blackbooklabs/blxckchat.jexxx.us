/** Keyboard shortcuts — aligned with pi / opencode / codex TUI conventions. */
export interface HotkeyDef {
    keys: string;
    action: string;
    source?: "pi" | "opencode" | "codex" | "blxckchat";
}
export declare const BLXCKCHAT_HOTKEYS: readonly HotkeyDef[];
export declare function formatHotkeysOverlay(): string;
//# sourceMappingURL=keybindings.d.ts.map