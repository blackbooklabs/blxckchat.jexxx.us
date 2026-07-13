/**
 * Server-side auth helper — works WITHOUT Clerk middleware.
 * Reads the Clerk session token from cookies and verifies it directly.
 */
import { cookies } from 'next/headers';
import { verifyToken } from '@clerk/nextjs/server';

type ClerkMetadataRecord = Record<string, unknown> | null | undefined;

function isTruthy(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['1', 'true', 'yes', 'admin'].includes(value.trim().toLowerCase());
  return false;
}

function parseAdminAllowlist(): Set<string> {
  const raw = process.env.BLXCKCHAT_ADMIN_USER_IDS ?? process.env.ADMIN_USER_IDS ?? '';
  return new Set(
    raw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  );
}

function hasAdminRole(metadata: ClerkMetadataRecord): boolean {
  if (!metadata || typeof metadata !== 'object') return false;
  const role = (metadata as Record<string, unknown>).role;
  return typeof role === 'string' && ['admin', 'owner', 'superadmin'].includes(role.toLowerCase());
}

function hasAdminFlag(metadata: ClerkMetadataRecord): boolean {
  if (!metadata || typeof metadata !== 'object') return false;
  const rec = metadata as Record<string, unknown>;
  return isTruthy(rec.admin) || isTruthy(rec.isAdmin) || isTruthy(rec.superAdmin);
}

/** Clerk session JWT from cookies — works without clerkMiddleware(). */
export async function getServerSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return (
    cookieStore.get('__session')?.value ??
    cookieStore.get('__clerk_db_jwt')?.value ??
    null
  );
}

export async function getServerUserId(): Promise<string | null> {
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) return 'sovereign_admin';

  const secretKey = process.env.CLERK_SECRET_KEY ?? process.env.CLERK_SECRET_DEFAULT;
  if (!secretKey) {
    console.warn('[Auth] CLERK_SECRET_KEY not set — cannot verify session.');
    return null;
  }

  try {
    const sessionToken = await getServerSessionToken();
    if (!sessionToken) return null;

    const payload = await verifyToken(sessionToken, { secretKey });
    return payload.sub ?? null; // sub = Clerk user_id
  } catch {
    // Token invalid / expired — treat as unauthenticated
    return null;
  }
}

/** Verified Clerk session for API routes that need user id + JWT (e.g. Supabase RLS). */
export async function getServerAuthSession(): Promise<{
  userId: string;
  sessionToken: string;
} | null> {
  const secretKey = process.env.CLERK_SECRET_KEY ?? process.env.CLERK_SECRET_DEFAULT;
  if (!secretKey) {
    console.warn('[Auth] CLERK_SECRET_KEY not set — cannot verify session.');
    return null;
  }

  const sessionToken = await getServerSessionToken();
  if (!sessionToken) return null;

  try {
    const payload = await verifyToken(sessionToken, { secretKey });
    const userId = payload.sub;
    if (!userId) return null;
    return { userId, sessionToken };
  } catch {
    return null;
  }
}

/**
 * Server-side admin check.
 * Priority:
 *  1) Explicit allowlist via BLXCKCHAT_ADMIN_USER_IDS / ADMIN_USER_IDS
 *  2) Clerk metadata role/flags (public/private/unsafe)
 */
export async function isServerAdminUser(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  
  if (process.env.NODE_ENV === 'development' && userId === 'sovereign_admin') return true;

  const allowlist = parseAdminAllowlist();
  if (allowlist.has(userId)) return true;

  try {
    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    return (
      hasAdminRole(user.publicMetadata as ClerkMetadataRecord) ||
      hasAdminRole(user.privateMetadata as ClerkMetadataRecord) ||
      hasAdminRole(user.unsafeMetadata as ClerkMetadataRecord) ||
      hasAdminFlag(user.publicMetadata as ClerkMetadataRecord) ||
      hasAdminFlag(user.privateMetadata as ClerkMetadataRecord) ||
      hasAdminFlag(user.unsafeMetadata as ClerkMetadataRecord)
    );
  } catch (error) {
    console.warn('[Auth] Admin metadata lookup failed:', error);
    return false;
  }
}

export async function getServerAuthContext(): Promise<{ userId: string | null; isAdmin: boolean }> {
  const userId = await getServerUserId();
  const isAdmin = await isServerAdminUser(userId);
  return { userId, isAdmin };
}
