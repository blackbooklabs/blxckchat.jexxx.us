import { ensureValidToken, loadCredentials, refreshAccessTokenViaServer, } from "../auth.js";
import { describeMissingUserEnv, loadOperatorEnv, loadUserEnv } from "../env.js";
import { isSuperAdminClerkUser } from "../super-admin.js";
import { createUserSupabaseClient } from "../user-supabase.js";
import { createOperatorClient } from "../supabase.js";
/**
 * Optional host override (e.g. blxckchat.jexxx.us Clerk cookie session).
 * When set, resolveAuthenticatedAccountSession() delegates here instead of ~/.jexxxus creds.
 */
let accountSessionResolverOverride = null;
export function setAccountSessionResolver(resolver) {
    accountSessionResolverOverride = resolver;
}
/**
 * Resolve a signed-in user's RLS-scoped Supabase clients for both dashboards.
 */
export async function resolveAuthenticatedAccountSession() {
    if (accountSessionResolverOverride) {
        return accountSessionResolverOverride();
    }
    if (!loadCredentials({ quiet: true })) {
        return {
            ok: false,
            reason: "not_signed_in",
            message: "Not signed in to JEXXXUS. Run /auth login or `jexxxus auth login` " +
                "(secure.jexxx.us device flow), then retry.",
        };
    }
    const env = loadUserEnv();
    if (!env) {
        return {
            ok: false,
            reason: "missing_user_env",
            message: describeMissingUserEnv(),
        };
    }
    try {
        const quiet = { quiet: true };
        const creds = await ensureValidToken(refreshAccessTokenViaServer, quiet);
        const getAccessToken = async () => {
            const fresh = await ensureValidToken(refreshAccessTokenViaServer, quiet);
            return fresh.accessToken;
        };
        const isSuperAdmin = isSuperAdminClerkUser(creds.userId);
        const operatorEnv = isSuperAdmin ? loadOperatorEnv() : null;
        const session = {
            creds,
            blxckbook: createUserSupabaseClient(env, getAccessToken, "blxckbook"),
            nxt: createUserSupabaseClient(env, getAccessToken, "nxt"),
            tv: createUserSupabaseClient(env, getAccessToken, "blxckbook"),
            isSuperAdmin,
            resolveAccessToken: getAccessToken,
        };
        if (isSuperAdmin && operatorEnv) {
            session.operator = {
                blxckbook: createOperatorClient(operatorEnv, "blxckbook"),
                nxt: createOperatorClient(operatorEnv, "nxt"),
                tv: createOperatorClient(operatorEnv, "blxckbook"),
            };
        }
        return { ok: true, session };
    }
    catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        return {
            ok: false,
            reason: "token_invalid",
            message: `Clerk session could not be refreshed: ${detail}. Try /auth refresh or /auth login.`,
        };
    }
}
/** @deprecated Prefer resolveAuthenticatedAccountSession for actionable errors. */
export async function createAuthenticatedAccountSession() {
    const result = await resolveAuthenticatedAccountSession();
    return result.ok ? result.session : null;
}
export function clientForTarget(session, target) {
    return target === "nxt" ? session.nxt : session.blxckbook;
}
/**
 * Resolve the Supabase client for vault reads. Defaults to RLS-scoped user
 * clients; super-admins may pass asUserId to read another user's rows via
 * service-role operator clients (still filtered by user_id).
 */
export function resolveVaultClient(session, target, asUserId) {
    const effectiveUserId = asUserId?.trim() || session.creds.userId;
    const wantsElevation = Boolean(asUserId?.trim()) && asUserId.trim() !== session.creds.userId;
    if (wantsElevation) {
        if (!session.isSuperAdmin || !session.operator) {
            throw new Error("Cross-user vault access requires JEXXXUS super-admin credentials and SUPABASE_KEY in .env.");
        }
        const client = target === "nxt" ? session.operator.nxt : session.operator.blxckbook;
        return { client, effectiveUserId, elevated: true };
    }
    return {
        client: clientForTarget(session, target),
        effectiveUserId,
        elevated: false,
    };
}
export function resolveTvClient(session, asUserId) {
    const effectiveUserId = asUserId?.trim() || session.creds.userId;
    const wantsElevation = Boolean(asUserId?.trim()) && asUserId.trim() !== session.creds.userId;
    if (wantsElevation) {
        if (!session.isSuperAdmin || !session.operator) {
            throw new Error("Cross-user TV playlist access requires JEXXXUS super-admin credentials and SUPABASE_KEY in .env.");
        }
        return {
            client: session.operator.tv,
            effectiveUserId,
            elevated: true,
        };
    }
    return { client: session.tv, effectiveUserId, elevated: false };
}
//# sourceMappingURL=session.js.map