-- BLXCKCHAT per-user BYOK settings (encrypted blob, Clerk user_id)
CREATE TABLE IF NOT EXISTS public.blxckchat_user_settings (
  user_id TEXT PRIMARY KEY,
  settings_encrypted TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blxckchat_user_settings_updated
  ON public.blxckchat_user_settings(updated_at DESC);

ALTER TABLE public.blxckchat_user_settings DISABLE ROW LEVEL SECURITY;