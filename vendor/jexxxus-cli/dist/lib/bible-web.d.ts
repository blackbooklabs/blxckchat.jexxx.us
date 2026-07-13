import type { BibleVerse } from "./bible.js";
/** Fetch a single verse via bible.jexxx.us (or JEXXXUS_BIBLE_API_BASE_URL). */
export declare function fetchVerseFromWeb(bookName: string, chapter: number, verse: number, translation?: string): Promise<BibleVerse | null>;
//# sourceMappingURL=bible-web.d.ts.map