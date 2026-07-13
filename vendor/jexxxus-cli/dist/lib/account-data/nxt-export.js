/**
 * Fetches vessels + contact_events for the given user via a user-scoped
 * (RLS-enforced) Supabase client — see createUserSupabaseClient() in
 * ../user-supabase.js. Explicit `.eq("user_id", userId)` kept as
 * defense-in-depth alongside RLS, same rationale as fetchBlxckbookExport().
 */
export async function fetchNxtExport(supabase, userId) {
    const [vesselsRes, eventsRes] = await Promise.all([
        supabase
            .from("vessels")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
        supabase
            .from("contact_events")
            .select("*")
            .eq("user_id", userId)
            .order("event_date", { ascending: false }),
    ]);
    if (vesselsRes.error) {
        throw new Error(`Failed to fetch vessels: ${vesselsRes.error.message}`);
    }
    if (eventsRes.error) {
        throw new Error(`Failed to fetch contact events: ${eventsRes.error.message}`);
    }
    return {
        exported_at: new Date().toISOString(),
        exported_by: "BLXCKCHAT TUI",
        format_version: "1.0",
        contacts: vesselsRes.data ?? [],
        events: eventsRes.data ?? [],
    };
}
//# sourceMappingURL=nxt-export.js.map