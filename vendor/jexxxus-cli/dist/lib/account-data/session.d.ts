import { type Credentials } from "../auth.js";
import { type DashboardTarget } from "../supabase.js";
import type { SupabaseClient } from "@supabase/supabase-js";
export interface OperatorClients {
    blxckbook: SupabaseClient;
    nxt: SupabaseClient;
    /** api schema — JEXXXUS | TV playlists */
    tv: SupabaseClient;
}
export interface AuthenticatedAccountSession {
    creds: Credentials;
    blxckbook: SupabaseClient;
    nxt: SupabaseClient;
    /** api schema — private TV custom playlists (RLS-scoped) */
    tv: SupabaseClient;
    isSuperAdmin: boolean;
    /** Service-role clients — only when super-admin + SUPABASE_KEY in .env */
    operator?: OperatorClients;
    /** Fresh Clerk JWT for JEXXXUS | API Bearer auth (web cookie / CLI refresh). */
    resolveAccessToken?: () => Promise<string | null>;
}
export type AccountSessionFailure = "not_signed_in" | "missing_user_env" | "token_invalid";
export type AccountSessionResult = {
    ok: true;
    session: AuthenticatedAccountSession;
} | {
    ok: false;
    reason: AccountSessionFailure;
    message: string;
};
export declare function setAccountSessionResolver(resolver: (() => Promise<AccountSessionResult>) | null): void;
/**
 * Resolve a signed-in user's RLS-scoped Supabase clients for both dashboards.
 */
export declare function resolveAuthenticatedAccountSession(): Promise<AccountSessionResult>;
/** @deprecated Prefer resolveAuthenticatedAccountSession for actionable errors. */
export declare function createAuthenticatedAccountSession(): Promise<AuthenticatedAccountSession | null>;
export declare function clientForTarget(session: AuthenticatedAccountSession, target: DashboardTarget): SupabaseClient;
/**
 * Resolve the Supabase client for vault reads. Defaults to RLS-scoped user
 * clients; super-admins may pass asUserId to read another user's rows via
 * service-role operator clients (still filtered by user_id).
 */
export declare function resolveVaultClient(session: AuthenticatedAccountSession, target: DashboardTarget, asUserId?: string): {
    client: SupabaseClient;
    effectiveUserId: string;
    elevated: boolean;
};
export declare function resolveTvClient(session: AuthenticatedAccountSession, asUserId?: string): {
    client: SupabaseClient;
    effectiveUserId: string;
    elevated: boolean;
};
//# sourceMappingURL=session.d.ts.map