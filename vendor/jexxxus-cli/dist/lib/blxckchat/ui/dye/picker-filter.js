/** Filter picker rows by label, id, or description (case-insensitive). */
export function filterPickerItems(items, query) {
    const q = query.trim().toLowerCase();
    if (!q)
        return [...items];
    return items.filter((item) => item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false));
}
/** Resolve the highlighted row for Enter — filter query must match what the UI shows. */
export function resolvePickerSelection(items, filterQuery, selectedIndex) {
    const filtered = filterPickerItems(items, filterQuery);
    if (selectedIndex < 0 || selectedIndex >= filtered.length)
        return null;
    return filtered[selectedIndex] ?? null;
}
//# sourceMappingURL=picker-filter.js.map