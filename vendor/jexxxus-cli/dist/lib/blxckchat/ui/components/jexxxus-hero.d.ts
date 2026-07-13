/** 5-row geometric block glyphs — OpenCode-style uniform width. */
export declare const GLYPHS: Record<string, readonly string[]>;
export declare const WORD: readonly ["J", "E", "X", "X", "X", "U", "S"];
export declare const ROWS = 5;
export declare const LETTER_GAP = 1;
/** Indices of X letters — brand emphasis (OpenCode keeps logo uniform; we pink the XXX). */
export declare const PINK_LETTER_INDEX: Set<number>;
export interface JexxxusHeroMeta {
    /** Signed-in operator label (name + email, or auth status). */
    authLabel: string;
    toolCount: number;
    providerLabel: string;
}
/** Hero subtitle line (model · auth · tool count)—copy-paste friendly, no block glyphs. */
export declare function formatHeroSubtitle(meta: JexxxusHeroMeta): string;
/** Hero hint line under the JEXXXUS wordmark. */
export declare function formatHeroHint(): string;
/** Plain block logo lines (no blessed tags). */
export declare function renderJexxxusHeroPlain(width: number, meta: JexxxusHeroMeta): string;
/** Blessed-tagged static hero (OpenCode-style standstill wordmark). */
export declare function renderJexxxusHeroBlessed(width: number, meta: JexxxusHeroMeta): string;
/** Vertical centering padding for empty-state hero (OpenCode centers in chat pane). */
export declare function centerHeroVertically(heroContent: string, viewportLines: number): string;
//# sourceMappingURL=jexxxus-hero.d.ts.map