/** Scroll math shared by message-box and tests (blessed line units). */
/** Pi TUI coalesces rapid stream renders (~60fps). */
export declare const STREAM_RENDER_INTERVAL_MS = 16;
/** OpenCode defers sticky-bottom until layout settles. */
export declare const SCROLL_LAYOUT_DEFER_MS = 50;
export declare function scrollPercent(scroll: number, viewport: number, contentHeight: number): number;
export declare function isNearBottom(scroll: number, viewport: number, contentHeight: number, threshold?: number): boolean;
/** After setContent: only follow the tail when the user was already pinned. */
export declare function scrollPercentAfterContent(pinnedToBottom: boolean, savedPercent: number): number;
/** OpenCode restores absolute scrollTop; clamp when content height changes. */
export declare function restoreScrollOffset(savedScroll: number, viewport: number, contentHeight: number): number;
/** OpenCode page up/down: half the message viewport. */
export declare function pageScrollDelta(viewport: number): number;
/** OpenCode half-page: quarter of the message viewport. */
export declare function halfPageScrollDelta(viewport: number): number;
/** OpenCode line scroll is ±1; override with BLXCKCHAT_SCROLL_LINES. */
export declare function lineScrollStep(): number;
//# sourceMappingURL=scroll-state.d.ts.map