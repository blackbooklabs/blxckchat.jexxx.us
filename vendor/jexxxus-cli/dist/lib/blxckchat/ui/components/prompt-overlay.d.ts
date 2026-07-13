import blessed from "blessed";
export interface PromptOverlayOptions {
    title: string;
    label: string;
    defaultValue?: string;
    hint?: string;
    secret?: boolean;
    height?: number;
}
export interface PromptOverlayHandle {
    ask: (options: PromptOverlayOptions) => Promise<string | null>;
    isVisible: () => boolean;
    cancel: () => void;
}
/**
 * Modal prompt — captures keys at the program level while open so paste/typing
 * never falls through to the transmit row underneath.
 */
export declare function createPromptOverlay(screen: blessed.Widgets.Screen): PromptOverlayHandle;
//# sourceMappingURL=prompt-overlay.d.ts.map