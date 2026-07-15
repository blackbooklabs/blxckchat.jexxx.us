export declare function getSnapshotPath(): string;
export declare function getChromeDigestPath(): string;
/** Persist the latest plain-text TUI snapshot for debugging. */
export declare function writeSnapshot(text: string): string;
/** Persist the latest chrome digest (text indicators only). */
export declare function writeChromeDigest(text: string): string;
/** Normalize clipboard text for single-line secret inputs (API keys). */
export declare function normalizeSecretClipboardPaste(text: string): string;
/** macOS pasteboard — explicit path; spawn('pbpaste') can fail in some PATH contexts. */
export declare function readClipboardRobust(): Promise<string>;
/** Read plain text from the system clipboard (best-effort). */
export declare function readClipboard(): Promise<string>;
/** OSC 52 — clipboard over SSH/tmux (OpenCode parity). */
export declare function writeClipboardOsc52(text: string): void;
/** Copy plain text to the system clipboard (best-effort). */
export declare function copyToClipboard(text: string): Promise<boolean>;
//# sourceMappingURL=tui-snapshot.d.ts.map