import { createClient } from '@supabase/supabase-js';

export function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Missing Supabase environment variables in BLXCKCHAT.');
  }

  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-key',
    { db: { schema: 'api' } }
  );
}

/**
 * Server-only Admin Client
 * Uses SERVICE_ROLE_KEY to bypass RLS.
 * Use ONLY in server-side routes after verifying the user via Clerk.
 */
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SERVICE_KEY || 
    process.env.SUPABASE_BLXCKBOOK_LEGACY_SERVICE_ROLE_SECRET || '';

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase SERVICE_ROLE_KEY. RLS bypass will fail.');
  }

  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-key',
    { 
      db: { schema: 'api' },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
