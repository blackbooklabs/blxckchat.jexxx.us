import type { SupabaseClient } from "@supabase/supabase-js";
/**
 * NXT has no unified export schema yet (unlike BLXCKBOOK's
 * blxckbook-export.schema.json) — this mirrors dxsh.nxt.jexxx.us's
 * workspace.tsx `exportJSON()`, which just dumps raw grid rows per table.
 * Unifying this with the BLXCKBOOK schema (a `$schema` + `_context` wrapper)
 * is tracked as an open question in the TUI Account Data Access Plan
 * ("Phase 2: unified NXT export schema").
 */
export interface NxtExport {
    exported_at: string;
    exported_by: string;
    format_version: string;
    /** Raw public.vessels rows for this user. */
    contacts: Record<string, unknown>[];
    /** Raw public.contact_events rows for this user. */
    events: Record<string, unknown>[];
}
/**
 * Fetches vessels + contact_events for the given user via a user-scoped
 * (RLS-enforced) Supabase client — see createUserSupabaseClient() in
 * ../user-supabase.js. Explicit `.eq("user_id", userId)` kept as
 * defense-in-depth alongside RLS, same rationale as fetchBlxckbookExport().
 */
export declare function fetchNxtExport(supabase: SupabaseClient, userId: string): Promise<NxtExport>;
//# sourceMappingURL=nxt-export.d.ts.map