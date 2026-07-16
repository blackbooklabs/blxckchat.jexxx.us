// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapContactRow(c) {
    return {
        id: c.id,
        name: c.name,
        photo: c.photo || "",
        lastActive: c.last_active || "Just now",
        createdAt: c.created_at || new Date().toISOString(),
        tags: c.tags || [],
        notes: c.notes || "",
        phone: c.phone || undefined,
        email: c.email || undefined,
        socialLinks: (c.social_links || []),
        isDiscoverable: c.is_discoverable || false,
        linkedEcosystemId: c.linked_ecosystem_id || null,
        visibility: c.visibility || "private",
        relationshipStatus: c.relationship_status || null,
    };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTimelineRow(t) {
    return {
        id: t.id,
        title: t.title,
        kind: t.kind || "milestone",
        happensAt: t.happens_at,
        contactId: t.contact_id || null,
        date: new Date(t.happens_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }),
    };
}
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
export async function fetchBlxckbookExport(supabase, userId, email) {
    const [contactsRes, journalsRes, linksRes, timelineRes] = await Promise.all([
        supabase
            .from("contacts")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
        supabase
            .from("journal_entries")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
        supabase.from("journal_contact_links").select("journal_id, contact_id").eq("user_id", userId),
        supabase
            .from("timeline_events")
            .select("*")
            .eq("user_id", userId)
            .order("happens_at", { ascending: true }),
    ]);
    if (contactsRes.error) {
        throw new Error(`Failed to fetch contacts: ${contactsRes.error.message}`);
    }
    if (journalsRes.error) {
        throw new Error(`Failed to fetch journal entries: ${journalsRes.error.message}`);
    }
    if (linksRes.error) {
        throw new Error(`Failed to fetch journal-contact links: ${linksRes.error.message}`);
    }
    if (timelineRes.error) {
        throw new Error(`Failed to fetch timeline events: ${timelineRes.error.message}`);
    }
    const contacts = (contactsRes.data ?? []).map(mapContactRow);
    const links = linksRes.data ?? [];
    const journal_entries = (journalsRes.data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (j) => ({
        id: j.id,
        title: j.title || "Untitled",
        content: j.content || "",
        date: new Date(j.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
        createdAt: j.created_at,
        tags: j.tags || [],
        linkedContacts: links
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((l) => l.journal_id === j.id)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((l) => l.contact_id),
    }));
    const timeline_events = (timelineRes.data ?? []).map(mapTimelineRow);
    return {
        $schema: "https://jexxx.us/schemas/blxckbook-export.schema.json",
        format_version: "1.0",
        exported_at: new Date().toISOString(),
        exported_by: "BLXCKCHAT TUI",
        description: "Complete relationship management and journal data export with AI-agent-friendly semantic metadata",
        user: { id: userId, email },
        _context: {
            contacts_description: "Relationship profiles with metadata about connections, status, and personal notes",
            journal_entries_description: "Personal journal entries linked to specific contacts with timestamps and tags",
            timeline_events_description: "Complete audit trail of all CRUD operations and status changes across the platform",
            relationships: "Contacts can be linked to journal entries and timeline events; timeline tracks all changes",
        },
        contacts,
        journal_entries,
        timeline_events,
        _statistics: {
            total_contacts: contacts.length,
            total_journal_entries: journal_entries.length,
            total_timeline_events: timeline_events.length,
            relationship_status_distribution: contacts.reduce((acc, c) => {
                const status = c.relationshipStatus || "unknown";
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {}),
        },
    };
}
//# sourceMappingURL=blxckbook-export.js.map