/**
 * Server-side auth helper — works WITHOUT Clerk middleware.
 * Reads the Clerk session token from cookies and verifies it directly.
 */
import { cookies } from 'next/headers';
import { verifyToken } from '@clerk/nextjs/server';

export async function getServerUserId(): Promise<string | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.warn('[Auth] CLERK_SECRET_KEY not set — cannot verify session.');
    return null;
  }

  try {
    const cookieStore = await cookies();

    // Clerk stores the active session as __session (production) or __clerk_db_jwt (dev)
    const sessionToken =
      cookieStore.get('__session')?.value ??
      cookieStore.get('__clerk_db_jwt')?.value;

    if (!sessionToken) return null;

    const payload = await verifyToken(sessionToken, { secretKey });
    return payload.sub ?? null; // sub = Clerk user_id
  } catch {
    // Token invalid / expired — treat as unauthenticated
    return null;
  }
}
