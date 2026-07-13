/** Human-readable verse block for BLXCKCHAT replies (not raw JSON). */
export function formatBibleVerseForChat(verse) {
    const ref = `${verse.book} ${verse.chapter}:${verse.verse}`;
    const canon = verse.canon ? ` (${verse.canon})` : "";
    const text = verse.text.trim() || "(text unavailable)";
    return `${ref}${canon}\n${text}`;
}
//# sourceMappingURL=bible-format.js.map