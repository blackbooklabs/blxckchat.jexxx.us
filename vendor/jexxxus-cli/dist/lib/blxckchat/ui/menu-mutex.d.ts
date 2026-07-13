/**
 * Ensures only one transient menu is active (slash suggestions OR modal overlay).
 * Picker overlays call dismissSlashMenuBeforeOverlay() on open; transmit blocks
 * slash refresh while any modal overlay is visible.
 */
export declare function registerSlashMenuDismiss(handler: () => void): void;
export declare function registerOverlayActiveCheck(check: () => boolean): void;
/** Hide slash /commands suggestions before showing a modal picker or prompt. */
export declare function dismissSlashMenuBeforeOverlay(): void;
export declare function isModalOverlayActive(): boolean;
//# sourceMappingURL=menu-mutex.d.ts.map