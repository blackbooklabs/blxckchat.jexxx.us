/** Pause transmit readInput without submit/cancel, then focus an overlay widget. */
export function takeOverlayFocus(screen, target) {
    const focused = screen.focused;
    if (focused?._done) {
        focused._done("stop");
    }
    screen.saveFocus();
    target.focus();
}
/** Restore focus after an overlay closes (e.g. back to transmit). */
export function releaseOverlayFocus(screen) {
    screen.restoreFocus();
}
//# sourceMappingURL=overlay-focus.js.map