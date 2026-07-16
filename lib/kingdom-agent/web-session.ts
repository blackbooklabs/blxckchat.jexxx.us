import { clerkClient, verifyToken } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import {
  getServerAuthSession,
  getServerAuthSessionFromRequest,
  getServerSessionToken,
  CLERK_AUTHORIZED_PARTIES,
} from "@/lib/serverAuth";
import { createUserSupabaseClient, loadWebSupabaseEnv } from "@/lib/user-supabase";
import { getRequestSessionResolver } from "@/lib/kingdom-agent/request-session";
import type {
  AccountSessionResult,
  AuthenticatedAccountSession,
} from "@/lib/kingdom-agent/types";
import { isSuperAdminClerkUser } from "@/lib/super-admin";

type Credentials = AuthenticatedAccountSession["creds"];

function loadOperatorEnv(): { supabaseUrl: string; supabaseKey: string } | null {
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || "";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_KEY?.trim() ||
    process.env.SUPABASE_KEY?.trim() ||
    "";
  if (!supabaseUrl || !supabaseKey) return null;
  return { supabaseUrl, supabaseKey };
}

function createOperatorSchemaClient(
  env: { supabaseUrl: string; supabaseKey: string },
  schema: "api" | "public",
) {
  return createClient(env.supabaseUrl, env.supabaseKey, {
    db: { schema },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function buildAuthenticatedSession(
  userId: string,
  accessToken: string,
  getAccessToken: () => Promise<string>,
): Promise<AccountSessionResult> {
  const env = loadWebSupabaseEnv();
  if (!env) {
    return {
      ok: false,
      reason: "missing_user_env",
      message:
        "Supabase anon credentials are not configured on blxckchat.jexxx.us (SUPABASE_URL + SUPABASE_ANON_KEY).",
    };
  }

  let creds: Credentials;
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress ?? "";
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    creds = {
      userId,
      email,
      fullName: fullName || undefined,
      username: user.username,
      imageUrl: user.imageUrl,
      accessToken,
      refreshToken: "",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      refreshedAt: new Date().toISOString(),
    };
  } catch {
    creds = {
      userId,
      email: "",
      accessToken,
      refreshToken: "",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      refreshedAt: new Date().toISOString(),
    };
  }

  const isSuperAdmin = isSuperAdminClerkUser(userId);
  const operatorEnv = isSuperAdmin ? loadOperatorEnv() : null;

  const session: AuthenticatedAccountSession = {
    creds,
    resolveAccessToken: getAccessToken,
    blxckbook: createUserSupabaseClient(
      env.supabaseUrl,
      env.supabaseAnonKey,
      getAccessToken,
      "blxckbook",
    ),
    nxt: createUserSupabaseClient(
      env.supabaseUrl,
      env.supabaseAnonKey,
      getAccessToken,
      "nxt",
    ),
    tv: createUserSupabaseClient(
      env.supabaseUrl,
      env.supabaseAnonKey,
      getAccessToken,
      "blxckbook",
    ),
    isSuperAdmin,
  };

  if (isSuperAdmin && operatorEnv) {
    session.operator = {
      blxckbook: createOperatorSchemaClient(operatorEnv, "api") as AuthenticatedAccountSession["blxckbook"],
      nxt: createOperatorSchemaClient(operatorEnv, "public") as AuthenticatedAccountSession["nxt"],
      tv: createOperatorSchemaClient(operatorEnv, "api") as AuthenticatedAccountSession["tv"],
    };
  }

  return { ok: true, session };
}

/**
 * Resolve Clerk cookie session → RLS-scoped Supabase clients (CLI parity).
 * When inside runWithAccountSessionResolver (Mini Bearer), uses per-request resolver.
 */
export async function resolveWebAccountSession(): Promise<AccountSessionResult> {
  const requestResolver = getRequestSessionResolver();
  if (requestResolver) {
    return requestResolver();
  }

  const authSession = await getServerAuthSession();
  if (!authSession) {
    return {
      ok: false,
      reason: "not_signed_in",
      message: "Sign in to BLXCKCHAT to access your vault, playlists, and empire tools.",
    };
  }

  const { userId, sessionToken: accessToken } = authSession;
  const getAccessToken = async () =>
    (await getServerSessionToken()) ?? accessToken;

  return buildAuthenticatedSession(userId, accessToken, getAccessToken);
}

/** Bearer JWT from Mini widget (no shared cookie with blxckchat.jexxx.us). */
export async function resolveWebAccountSessionFromRequest(
  req: Request,
): Promise<AccountSessionResult> {
  const authSession = await getServerAuthSessionFromRequest(req);
  if (!authSession) {
    return {
      ok: false,
      reason: "not_signed_in",
      message: "Sign in to access your vault, playlists, and empire tools.",
    };
  }

  const { userId, sessionToken: storedToken } = authSession;
  const secretKey = process.env.CLERK_SECRET_KEY ?? process.env.CLERK_SECRET_DEFAULT;

  const getAccessToken = async () => {
    if (!storedToken.trim()) return "";

    if (secretKey) {
      try {
        const verified = await verifyToken(storedToken, {
          secretKey,
          authorizedParties: CLERK_AUTHORIZED_PARTIES,
          clockSkewInMs: 60_000,
        });
        if (verified?.sub) return storedToken;
      } catch (err) {
        console.warn(
          "[web-session] Bearer token re-verify failed — using request-scoped token:",
          err instanceof Error ? err.message : err,
        );
      }
    }

    // Request auth already validated this JWT; do not send an empty Authorization header to Supabase.
    return storedToken;
  };

  return buildAuthenticatedSession(userId, storedToken, getAccessToken);
}