/** Strip blessed inline tags, restoring {open}/{close} escapes. */
export declare function stripBlessedTags(text: string): string;
/** Compact welcome card shown after the JEXXXUS splash animation. */
export declare function buildWelcomeBannerPlain(authEmail: string, toolCount: number): string;
export declare function wrapWelcomeBannerBlessed(plain: string): string;
export interface TuISnapshotParts {
    width: number;
    topBar: string;
    messages: string;
    statusBar: string;
    input: string;
}
/** CRT-framed panel matching the blessed chat pane border. */
export declare function framePanel(content: string, width: number): string;
/** Labeled input frame matching the transmit box. */
export declare function frameTransmitInput(value: string, width: number): string;
/** Top chrome as plain CRT header (two lines). */
export declare function buildTopBarPlain(width: number, model: string, seed?: number): string;
/** Status strip with glitch ornaments. */
export declare function buildStatusBarPlain(width: number, message: string): string;
/** Assemble the full TUI as plain, copy-paste-friendly text. */
export declare function buildTuISnapshot(parts: TuISnapshotParts): string;
/** Live chrome strings for debugging (no block glyphs, glitch noise, or borders). */
export interface ChromeDigestInput {
    topBarModel: string;
    authEmail: string;
    toolCount: number;
    heroSubtitle: string;
    heroHint: string;
    statusBar: string;
    inputValue: string;
    divinity?: string | null;
}
/** One line per indicator—paste into tickets, Cursor, or logs. */
export declare function buildChromeDigestPlain(input: ChromeDigestInput): string;
/** Chrome digest + visual snapshot for Ctrl+Y / /copy. */
export declare function buildTuISnapshotWithChrome(chrome: string, parts: TuISnapshotParts): string;
//# sourceMappingURL=plain-text.d.ts.map