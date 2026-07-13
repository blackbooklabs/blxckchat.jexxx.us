import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthenticatedAccountSession } from "./session.js";
import type { DashboardTarget } from "../supabase.js";
/**
 * Vault write path — mirrors account-query.ts's read path exactly:
 * resolveVaultClient()/resolveTvClient() with NO asUserId. Mutations never
 * accept asUserId, even for super-admins — reading another user's data is
 * one thing, writing to it on their behalf is a different risk class this
 * tool surface deliberately does not take on. Every mutation re-checks
 * `.eq("user_id", userId)` alongside RLS, same defense-in-depth rationale
 * as the export fetchers.
 */
declare const CONTACT_UPDATABLE_FIELDS: readonly ["name", "notes", "tags", "relationship_status", "visibility", "is_discoverable"];
type ContactUpdatableField = (typeof CONTACT_UPDATABLE_FIELDS)[number];
export interface UpdateContactResult {
    ok: boolean;
    message: string;
}
export interface AddContactResult {
    ok: boolean;
    message: string;
    contactId?: string;
}
/**
 * Create a brand-new contact. Always inserts into `api.contacts`
 * (BLXCKBOOK) only — `public.vessels` (NXT) is NOT written to separately.
 * `trg_sync_contact_to_vessel` (Postgres trigger, confirmed live: insert /
 * update / delete on api.contacts) mirrors the row into public.vessels
 * automatically, same id, in both directions. Writing to both tables from
 * here would race the trigger and risk two divergent rows — the exact bug
 * class this session already fixed once (a manual-merge bug that left two
 * rows for one person). One insert, one schema, the trigger keeps both
 * dashboards synchronized — hence "very synchronistic" without doing
 * anything explicit for NXT at all.
 */
export declare function addContact(session: AuthenticatedAccountSession, name: string, options?: {
    notes?: string;
    tags?: string[];
    relationshipStatus?: string;
    visibility?: string;
}): Promise<AddContactResult>;
/**
 * Update one BLXCKBOOK contact or NXT vessel by fuzzy name match.
 * `target` must be "blxckbook" or "nxt" — no "auto" here, since the same
 * name could exist as a contact on one side and a vessel on the other and
 * silently updating the wrong one is worse than requiring the caller to
 * be explicit (the read-only account_query tool can disambiguate first).
 */
export declare function updateContact(session: AuthenticatedAccountSession, target: DashboardTarget, contactName: string, updates: Record<string, unknown>): Promise<UpdateContactResult>;
export interface AddJournalEntryResult {
    ok: boolean;
    message: string;
    entryId?: string;
}
/**
 * Create a BLXCKBOOK journal entry, optionally linked to existing contacts
 * by name (fuzzy-matched, same as updateContact). NXT has no journal
 * concept today — journal entries are BLXCKBOOK-only.
 */
export declare function addJournalEntry(session: AuthenticatedAccountSession, title: string, content: string, options?: {
    tags?: string[];
    linkedContactNames?: string[];
}): Promise<AddJournalEntryResult>;
export interface JournalEntryMutationResult {
    ok: boolean;
    message: string;
}
/** Update an existing BLXCKBOOK journal entry's title/content/tags, matched by id or title. */
export declare function updateJournalEntry(session: AuthenticatedAccountSession, entryIdOrTitle: string, updates: {
    title?: string;
    content?: string;
    tags?: string[];
}): Promise<JournalEntryMutationResult>;
/** Delete a BLXCKBOOK journal entry (and its contact links), matched by id or title. */
export declare function deleteJournalEntry(session: AuthenticatedAccountSession, entryIdOrTitle: string): Promise<JournalEntryMutationResult>;
/** Delete a BLXCKBOOK contact or NXT vessel by fuzzy name match. */
export declare function deleteContact(session: AuthenticatedAccountSession, target: DashboardTarget, contactName: string): Promise<UpdateContactResult>;
export interface ContactEventMutationResult {
    ok: boolean;
    message: string;
    eventId?: string;
}
/**
 * Create an NXT contact_events row (a logged date/event), linked to a
 * vessel by name. Column names verified live against a real (throwaway
 * test) row after the schema (public.contact_events: id, user_id,
 * vessel_id, event_date, event_type, title, location, notes, created_at,
 * updated_at — see supabase/supabase/migrations/20260708223504_remote_schema.sql
 * line ~1289) turned out to differ from the initial assumption (vessel_id,
 * not contact_id; event_type, not kind).
 */
export declare function addContactEvent(session: AuthenticatedAccountSession, contactName: string, fields: {
    title: string;
    eventDate: string;
    eventType?: string;
    location?: string;
    notes?: string;
}): Promise<ContactEventMutationResult>;
/** Update an NXT contact_events row, matched by id. */
export declare function updateContactEvent(session: AuthenticatedAccountSession, eventId: string, updates: {
    title?: string;
    eventDate?: string;
    eventType?: string;
    location?: string;
    notes?: string;
}): Promise<ContactEventMutationResult>;
/** Delete an NXT contact_events row, matched by id. */
export declare function deleteContactEvent(session: AuthenticatedAccountSession, eventId: string): Promise<ContactEventMutationResult>;
export type PlaylistAction = "create" | "rename" | "delete" | "add_video" | "remove_video";
export interface ManagePlaylistResult {
    ok: boolean;
    message: string;
}
/** JEXXXUS | TV custom playlist mutations — always the signed-in user's own. */
export declare function managePlaylist(session: AuthenticatedAccountSession, action: PlaylistAction, playlistName: string, options?: {
    newName?: string;
    videoId?: string;
    isPrivate?: boolean;
}): Promise<ManagePlaylistResult>;
interface SyncableContact {
    id?: string;
    name?: string;
    [key: string]: unknown;
}
interface SyncableJournalEntry {
    id?: string;
    title?: string;
    content?: string;
    tags?: string[];
    [key: string]: unknown;
}
/**
 * Re-apply a (possibly hand-edited) BLXCKBOOK export back to Supabase.
 * Rows with an `id` matching an existing row are updated; rows without an
 * `id` (or whose `id` doesn't match anything) are treated as new and
 * inserted. Never deletes — a row missing from the file is left untouched,
 * since inferring "the user deleted this" from absence is too easy to get
 * wrong (e.g. a truncated/partial export).
 */
export declare function syncBlxckbookExport(session: AuthenticatedAccountSession, payload: {
    contacts?: SyncableContact[];
    journal_entries?: SyncableJournalEntry[];
}): Promise<string>;
export type { SupabaseClient };
export { CONTACT_UPDATABLE_FIELDS };
export type { ContactUpdatableField };
//# sourceMappingURL=mutations.d.ts.map