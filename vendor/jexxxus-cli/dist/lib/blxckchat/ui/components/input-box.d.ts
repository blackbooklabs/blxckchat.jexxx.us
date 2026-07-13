import blessed from "blessed";
import type { SlashPopupHandle } from "./slash-popup.js";
import { type SlashSuggestion } from "../slash/autocomplete.js";
export interface InputBoxHandle {
    element: blessed.Widgets.BoxElement;
    focus: () => void;
    clear: () => void;
    setValue: (value: string) => void;
    getValue: () => string;
    getHistory: () => string[];
    getPlainText: () => string;
    hideSlashPopup: () => void;
}
export interface InputShortcutHandlers {
    onSave?: () => void;
    onCopyTui?: () => void;
    onCopyChrome?: () => void;
    onCopyLastReply?: () => void;
    onModelList?: () => void;
    onModelNext?: () => void;
    onModelPrev?: () => void;
    onToggleAllThinking?: () => void;
    onNewSession?: () => void;
    onFocusMessages?: () => void;
}
export interface InputBoxOptions {
    onUpdate?: () => void;
    onExit?: () => void;
    onShowHotkeys?: () => void;
    onCopied?: () => void;
    onCopyFailed?: () => void;
    onQueueIfProcessing?: () => boolean;
    onOpenExternalEditor?: () => void;
    shortcuts?: InputShortcutHandlers;
    slashPopup?: SlashPopupHandle;
    getSlashSuggestions?: (value: string) => Promise<SlashSuggestion[]>;
    /** Start provider BYOK setup immediately (slash catalog pick). */
    onSetupProvider?: (catalogId: string) => void | Promise<void>;
}
export declare function createInputBox(screen: blessed.Widgets.Screen, onSubmit: (line: string) => void, options?: InputBoxOptions): InputBoxHandle;
//# sourceMappingURL=input-box.d.ts.map