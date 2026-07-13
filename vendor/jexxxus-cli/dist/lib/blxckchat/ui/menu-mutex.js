/**
 * Ensures only one transient menu is active (slash suggestions OR modal overlay).
 * Picker overlays call dismissSlashMenuBeforeOverlay() on open; transmit blocks
 * slash refresh while any modal overlay is visible.
 */
let dismissSlashMenu;
let isOverlayActive;
export function registerSlashMenuDismiss(handler) {
    dismissSlashMenu = handler;
}
export function registerOverlayActiveCheck(check) {
    isOverlayActive = check;
}
/** Hide slash /commands suggestions before showing a modal picker or prompt. */
export function dismissSlashMenuBeforeOverlay() {
    dismissSlashMenu?.();
}
export function isModalOverlayActive() {
    return isOverlayActive?.() ?? false;
}
//# sourceMappingURL=menu-mutex.js.map