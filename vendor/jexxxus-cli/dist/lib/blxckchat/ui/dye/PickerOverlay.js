import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Box, Text } from "@sauerapple/dye";
import { THEME } from "../theme.js";
import { OverlayCenter } from "./OverlayCenter.js";
/**
 * Render the filter query with an editor-style cursor at cursorPos and
 * an optional word selection highlighted in pink inverse (matching the
 * main chat input's selection rendering).
 */
function FilterInput({ query, cursorPos, selectionStart, }) {
    const cp = Math.max(0, Math.min(cursorPos, query.length));
    const sel = selectionStart ?? -1;
    if (sel >= 0 && sel !== cp) {
        // Selection active
        const a = Math.min(sel, cp);
        const b = Math.max(sel, cp);
        if (a === cp) {
            // Cursor is at the start of selection (backward selection)
            const cursorCh = query[a] ?? " ";
            return (_jsxs(Text, { color: THEME.pink, children: ["> ", query.slice(0, a), _jsx(Text, { inverse: true, children: cursorCh }), _jsx(Text, { inverse: true, color: THEME.pink, children: query.slice(a + 1, b) }), query.slice(b)] }));
        }
        // Forward selection (cursor at b)
        const cursorCh = query[b] ?? " ";
        return (_jsxs(Text, { color: THEME.pink, children: ["> ", query.slice(0, a), _jsx(Text, { inverse: true, color: THEME.pink, children: query.slice(a, b) }), query.slice(b, cp), _jsx(Text, { inverse: true, children: cursorCh }), query.slice(cp + 1)] }));
    }
    // No selection — just show cursor
    const ch = query[cp] ?? " ";
    return (_jsxs(Text, { color: THEME.pink, children: ["> ", query.slice(0, cp), _jsx(Text, { inverse: true, children: ch }), query.slice(cp + 1)] }));
}
function filterItems(items, query) {
    const q = query.trim().toLowerCase();
    if (!q)
        return items;
    return items.filter((item) => item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false));
}
const VISIBLE_ITEMS = 10;
/**
 * Resolve which item should appear selected. `state.selectedIndex` is an
 * index into the *filtered* list (keyboard navigation maintains it within
 * 0..filtered.length-1, wrapping). Return the id that should be highlighted,
 * or null if the filtered list is empty / the index is out of range.
 */
function selectedItemId(state) {
    const filtered = filterItems(state.items, state.filterQuery);
    if (state.selectedIndex < 0 || state.selectedIndex >= filtered.length) {
        return null;
    }
    return filtered[state.selectedIndex]?.id ?? null;
}
export const PickerOverlay = ({ state, filterFocused, }) => {
    if (!state)
        return null;
    const label = state.title ?? "picker";
    const filtered = filterItems(state.items, state.filterQuery);
    const hideFilter = state.hideFilter === true;
    // Highlight is identity-based on the filtered list so it survives
    // filtering — selectedIndex moves as a filtered-list position, so we
    // look up the selected item by id rather than comparing raw indices.
    const activeId = selectedItemId(state);
    const scrollOffsetRef = React.useRef(0);
    if (filtered.length <= VISIBLE_ITEMS) {
        scrollOffsetRef.current = 0;
    }
    else {
        const maxOffset = filtered.length - VISIBLE_ITEMS;
        if (state.selectedIndex < scrollOffsetRef.current) {
            scrollOffsetRef.current = state.selectedIndex;
        }
        else if (state.selectedIndex >= scrollOffsetRef.current + VISIBLE_ITEMS) {
            scrollOffsetRef.current = state.selectedIndex - VISIBLE_ITEMS + 1;
        }
        scrollOffsetRef.current = Math.max(0, Math.min(scrollOffsetRef.current, maxOffset));
    }
    const scrollOffset = scrollOffsetRef.current;
    const shownItems = filtered.slice(scrollOffset, scrollOffset + VISIBLE_ITEMS);
    const hasMoreAbove = scrollOffset > 0;
    const hasMoreBelow = scrollOffset + VISIBLE_ITEMS < filtered.length;
    const extraRows = (hasMoreAbove ? 1 : 0) + (hasMoreBelow ? 1 : 0);
    const bodyHeight = Math.min(shownItems.length, VISIBLE_ITEMS) + extraRows;
    const headerHeight = state.statusHeader ? 2 : 0;
    const filterHeight = hideFilter ? 0 : 2;
    const height = 2 + 1 + headerHeight + filterHeight + bodyHeight + 1;
    return (_jsx(OverlayCenter, { children: _jsxs(Box, { width: "78%", height: height, borderStyle: "round", borderColor: THEME.pink, backgroundColor: THEME.bgElevated, flexDirection: "column", children: [_jsxs(Text, { color: THEME.pink, children: [" ", label, " "] }), state.statusHeader ? (_jsx(Box, { height: 2, paddingLeft: 1, paddingRight: 1, children: _jsx(Text, { color: THEME.textDim, children: state.statusHeader }) })) : null, !hideFilter ? (_jsx(Box, { height: 2, paddingLeft: 1, paddingRight: 1, children: filterFocused ? (_jsx(FilterInput, { query: state.filterQuery, cursorPos: state.filterCursorPos ?? state.filterQuery.length, selectionStart: state.filterSelectionStart })) : (_jsx(Text, { color: THEME.textMuted, children: "type to filter" })) })) : null, _jsxs(Box, { flexGrow: 1, flexDirection: "column", children: [hasMoreAbove ? _jsx(Text, { color: THEME.textDim, children: " \u25B4" }) : null, shownItems.length === 0 ? (_jsx(Text, { color: THEME.textMuted, children: " No matches" })) : (shownItems.map((item, vi) => {
                            const isSel = item.id === activeId;
                            const desc = item.description
                                ? item.description.length > 48
                                    ? `${item.description.slice(0, 45)}...`
                                    : item.description
                                : "";
                            return (_jsxs(Box, { width: "100%", flexDirection: "row", backgroundColor: isSel ? THEME.pink : undefined, paddingLeft: 1, height: 1, children: [_jsxs(Text, { bold: true, color: isSel ? THEME.bg : THEME.text, children: [isSel ? "▸ " : "  ", item.label] }), desc ? (_jsxs(Text, { color: isSel ? THEME.bg : THEME.textMuted, children: [" ", desc] })) : null] }, item.id));
                        })), hasMoreBelow ? _jsx(Text, { color: THEME.textDim, children: " \u25BE" }) : null] }), _jsx(Box, { paddingLeft: 1, paddingRight: 1, children: _jsx(Text, { color: THEME.textDim, children: hideFilter
                            ? `↑↓ navigate · Enter select · Esc cancel`
                            : `↑↓ · Enter · Tab → filter · Esc` }) })] }) }));
};
//# sourceMappingURL=PickerOverlay.js.map