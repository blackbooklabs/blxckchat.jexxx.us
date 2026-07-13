/**
 * Blessed registers element.key() on the shared program — every handler
 * fires unless gated. Only run when this element owns focus.
 */
export function bindFocusedKey(screen, element, keys, handler) {
    const target = element;
    target.key(keys, () => {
        if (screen.focused !== element)
            return;
        handler();
    });
}
//# sourceMappingURL=focused-key.js.map