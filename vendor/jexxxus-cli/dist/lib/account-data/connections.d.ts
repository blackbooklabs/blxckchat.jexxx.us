import type { AuthenticatedAccountSession } from "./session.js";
/**
 * Cross-user connections, notifications, and relationship tier/points —
 * mirrors dxsh.blxckbook.jexxx.us's handleAddBack() (App.tsx) and
 * relationship-tiers.ts exactly, so a connection made from the CLI behaves
 * identically to one made from the web dashboard (same merge-aware insert,
 * same restore_relationship call, same reciprocal notification).
 *
 * Schema note (confirmed live against a real query, not just the migration
 * file): `contacts` lives in the `api` schema (target "blxckbook"), but
 * `contact_notifications`, `event_invites`, `relationship_tiers`,
 * `point_transactions`, and the RPC functions
 * (fn_user_tier_with_contact/restore_relationship/cancel_relationship) all
 * live in `public` (target "nxt" — same schema resolveVaultClient() maps
 * "nxt" to). Mixing these up produces a real runtime error
 * ("Could not find the function api.fn_user_tier_with_contact ... in the
 * schema cache"), not a silent failure, which is how this was caught.
 */
export interface ContactNotificationRow {
    id: string;
    actor_user_id: string;
    actor_name: string;
    actor_avatar_url: string | null;
    read: boolean;
    created_at: string;
    /**
     * True when the signed-in user already has a contact linked to this
     * actor_user_id — computed here, not stored, since the notification row
     * itself doesn't know whether connect_contact_back already ran (from the
     * CLI, the web dashboard, or a prior CLI session). Lets callers report
     * "already connected" up front instead of offering to reconnect and only
     * finding out it's a no-op after asking.
     */
    alreadyConnected: boolean;
}
export interface EventInviteRow {
    id: string;
    organizer_user_id: string;
    organizer_name: string;
    title: string;
    event_date: string;
    event_type: string;
    location: string | null;
    notes: string | null;
    status: string;
}
export interface NotificationSummary {
    contactNotifications: ContactNotificationRow[];
    pendingInvites: EventInviteRow[];
}
/**
 * List unread/recent contact-connection notifications and pending event
 * invites. Each contact notification is cross-referenced against the
 * signed-in user's own contacts to flag `alreadyConnected` — a
 * "someone added you" notification persists after connecting back (nothing
 * deletes or marks it resolved), so without this check the same
 * already-linked notification would surface as actionable forever.
 */
export declare function listNotifications(session: AuthenticatedAccountSession): Promise<NotificationSummary>;
export interface ConnectContactBackResult {
    ok: boolean;
    message: string;
}
/**
 * Connect back with a Clerk user who added the signed-in user as a contact
 * — the "Connect back" button's exact behavior (NotificationCenter.tsx /
 * App.tsx#handleAddBack): merge-aware insert (never a duplicate row if an
 * unlinked dummy contact with the same name already exists — this is the
 * exact bug class fixed in dxsh.blxckbook.jexxx.us's manual merge path),
 * restore any archived relationship points, and notify the other user back.
 */
export declare function connectContactBack(session: AuthenticatedAccountSession, actorUserId: string, actorName: string, actorAvatarUrl?: string | null): Promise<ConnectContactBackResult>;
export interface RelationshipTierResult {
    ok: boolean;
    message: string;
    tier?: number;
    totalPoints?: number;
}
/** Current relationship tier + points for the signed-in user and a Clerk-linked contact. */
export declare function getRelationshipTier(session: AuthenticatedAccountSession, contactName: string): Promise<RelationshipTierResult>;
//# sourceMappingURL=connections.d.ts.map