/**
 * Temporary debug endpoint — returns auth state, cookie names, and env var presence.
 * Visit: /api/debug to see what the server sees.
 * REMOVE after debugging.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerUserId } from '@/lib/serverAuth';

export const runtime = 'nodejs';

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const userId = await getServerUserId();

  return NextResponse.json({
    userId,
    authenticated: !!userId,
    cookieNames: allCookies.map(c => c.name),
    hasClerkSession: allCookies.some(c => c.name === '__session'),
    hasClerkDbJwt: allCookies.some(c => c.name === '__clerk_db_jwt'),
    hasClerkKey: !!process.env.CLERK_SECRET_KEY,
    hasClerkDefault: !!process.env.CLERK_SECRET_DEFAULT,
    hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    supabase: {
      hasNextPublicUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      resolvedUrl: (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'MISSING'),
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      // Show all env var names containing SUPABASE
      allSupabaseVarNames: Object.keys(process.env).filter(k => k.includes('SUPABASE')),
    },
    env: process.env.NODE_ENV,
  });
}
