/**
 * Bible lookup library for verse-level retrieval from the obsidian-bible vault.
 * Supports hierarchical queries: section → book → chapter → verse.
 * Vault location resolved via JEXXXUS_BIBLE_VAULT_PATH env var; returns null if unavailable
 * (caller handles graceful fallback to web queries).
 */
export interface BibleVerse {
    id: string;
    book: string;
    chapter: number;
    verse: number;
    text: string;
    canon?: string | undefined;
    sourceType?: string | undefined;
}
export interface BibleChapter {
    book: string;
    chapter: number;
    verseCount: number;
}
export declare function hasLocalBibleVault(): boolean;
export declare function getBibleSections(): string[];
export declare function getBibleBooks(section: string): string[];
export declare function getBibleChapters(section: string, book: string): string[];
export declare function getBibleVerses(section: string, book: string, chapter: string): string[];
export declare function getVerse(section: string, book: string, chapter: string, verseFile: string): BibleVerse;
export declare function getChapter(section: string, book: string, chapter: string): BibleVerse[];
/** Normalize book names for vault folder lookup ("1 Samuel" → "1samuel", "1Samuel" → "1samuel"). */
export declare function normalizeBookLookupKey(bookName: string): string;
export declare function findBook(bookName: string): {
    section: string;
    book: string;
} | null;
/** True when query looks like "Genesis 1:1" / "1 John 1 9" — not a video title or series name. */
export declare function looksLikeVerseReference(query: string): boolean;
/** Parse Book Chapter:Verse references including numbered books (1 John, 2 Peter). */
export declare function parseVerseReference(query: string): {
    bookName: string;
    chapter: number;
    verse: number;
} | null;
export declare function findVerse(query: string): BibleVerse | null;
/** Local obsidian vault first, then bible.jexxx.us web API when vault is absent. */
export declare function findVerseWithFallback(query: string): Promise<BibleVerse | null>;
//# sourceMappingURL=bible.d.ts.map