import type { SupabaseClient } from "@supabase/supabase-js";
/**
 * Row shapes mirror the mapped (camelCase) types dxsh.blxckbook.jexxx.us
 * exports client-side — see dxsh.blxckbook.jexxx.us/src/types/vault.ts
 * (mapContactRow, mapTimelineRow) and useVaultData.ts's inline journal
 * mapping. Parity matters here: BLXCKCHAT TUI exports must be
 * indistinguishable from a dashboard "Export Vault" download.
 */
export interface BlxckbookContact {
    id: string;
    name: string;
    photo: string;
    lastActive: string;
    createdAt: string;
    tags: string[];
    notes: string;
    phone?: string;
    email?: string;
    socialLinks: Array<{
        platform: string;
        url: string;
    }>;
    isDiscoverable: boolean;
    linkedEcosystemId: string | null;
    visibility: "private" | "shared" | "ecosystem";
    relationshipStatus: string | null;
}
export interface BlxckbookJournalEntry {
    id: string;
    title: string;
    content: string;
    date: string;
    createdAt: string;
    tags: string[];
    linkedContacts: string[];
}
export interface BlxckbookTimelineEvent {
    id: string;
    title: string;
    date: string;
    happensAt: string;
    kind: string;
    contactId: string | null;
}
export interface BlxckbookExport {
    $schema: string;
    format_version: string;
    exported_at: string;
    exported_by: string;
    description: string;
    user: {
        id: string;
        email: string;
    };
    _context: Record<string, string>;
    contacts: BlxckbookContact[];
    journal_entries: BlxckbookJournalEntry[];
    timeline_events: BlxckbookTimelineEvent[];
    _statistics: {
        total_contacts: number;
        total_journal_entries: number;
        total_timeline_events: number;
        relationship_status_distribution: Record<string, number>;
    };
}
export declare function mapContactRow(c: any): BlxckbookContact;
/**
 * Fetches and assembles a BLXCKBOOK vault export for the given user,
 * schema-identical to dxsh.blxckbook.jexxx.us's SettingsView.tsx
 * `handleExport()` output (same $schema URL, same field names/order).
 *
 * `supabase` must be a user-scoped client from createUserSupabaseClient()
 * (schema: "api") — RLS already restricts every query to this user's own
 * rows, but the explicit `.eq("user_id", userId)` on each query is kept as
 * defense-in-depth, mirroring the leak-fix pattern documented in
 * dxsh.nxt.jexxx.us's Cross-User-Data-Leak-Fix-2026-07-07.md: never rely on
 * RLS as the *only* thing standing between one user's data and another's.
 */
export declare function fetchBlxckbookExport(supabase: SupabaseClient, userId: string, email: string): Promise<BlxckbookExport>;
//# sourceMappingURL=blxckbook-export.d.ts.map