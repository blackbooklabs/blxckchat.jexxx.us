/** Whether a key event should paste from the system clipboard in secret prompts. */
export function isSecretPromptPasteKey(input, key) {
    if ((key.meta || key.ctrl) && key.name === "v")
        return true;
    // macOS terminals often intercept Cmd+V — press P to paste from pbpaste instead.
    if (!key.ctrl && !key.meta && key.name === "p")
        return true;
    if (!key.ctrl && !key.meta && input.toLowerCase() === "p")
        return true;
    return false;
}
//# sourceMappingURL=secret-prompt-input.js.map