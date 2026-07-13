import type { SupabaseClient } from "@supabase/supabase-js";

export interface AuthenticatedAccountSession {
  creds: {
    userId: string;
    email: string;
    fullName?: string;
    username?: string | null;
    imageUrl?: string | null;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    refreshedAt: string;
  };
  blxckbook: SupabaseClient;
  nxt: SupabaseClient;
  tv: SupabaseClient;
  isSuperAdmin: boolean;
  operator?: {
    blxckbook: SupabaseClient;
    nxt: SupabaseClient;
    tv: SupabaseClient;
  };
}

export type AccountSessionResult =
  | { ok: true; session: AuthenticatedAccountSession }
  | { ok: false; reason: string; message: string };