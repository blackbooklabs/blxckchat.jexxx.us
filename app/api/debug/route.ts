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

  // Raw probe — bypass supabase-js to see the exact PostgREST response
  let supabaseProbe: unknown = null;
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    if (url && key) {
      // PROBE — specifically check the 'api' schema and 'custom_personas' table
      const res = await fetch(`${url}/rest/v1/custom_personas?limit=1`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Accept-Profile': 'api',
        },
      });
      const body = await res.text();
      supabaseProbe = { 
        status: res.status, 
        tableName: 'custom_personas',
        schema: 'api',
        body: body.includes('PGRST106') ? 'SCHEMA_CACHE_MISS' : body
      };
    } else {
      supabaseProbe = { error: 'Missing URL or key' };
    }
  } catch (e: unknown) {
    supabaseProbe = { fetchError: String(e) };
  }

  return NextResponse.json({
    userId,
    authenticated: !!userId,
    hasClerkDefault: !!process.env.CLERK_SECRET_DEFAULT,
    supabase: {
      resolvedUrl: (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'MISSING'),
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      allSupabaseVarNames: Object.keys(process.env).filter(k => k.includes('SUPABASE')),
      probe: supabaseProbe,
    },
    env: process.env.NODE_ENV,
  });
}
