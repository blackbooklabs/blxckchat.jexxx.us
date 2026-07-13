import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type DashboardTarget = "blxckbook" | "nxt";

const SCHEMA_MAP: Record<DashboardTarget, string> = {
  blxckbook: "api",
  nxt: "public",
};

/**
 * RLS-scoped Supabase client — same pattern as jexxx.us-cli and dxsh dashboards.
 */
export function createUserSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
  getAccessToken: () => Promise<string>,
  target: DashboardTarget = "blxckbook",
): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: SCHEMA_MAP[target] },
    accessToken: getAccessToken,
  }) as SupabaseClient;
}

export function loadWebSupabaseEnv(): {
  supabaseUrl: string;
  supabaseAnonKey: string;
} | null {
  const supabaseUrl =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    "";
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    "";

  if (!supabaseUrl || !supabaseAnonKey) return null;
  return { supabaseUrl, supabaseAnonKey };
}