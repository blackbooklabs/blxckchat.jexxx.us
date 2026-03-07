-- ============================================================
-- BLXCKCHAT – Projects & Chats schema
-- Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.blxckchat_projects (
  id               uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          text          NOT NULL,
  title            text          NOT NULL DEFAULT 'New Project',
  custom_instructions text       DEFAULT '',
  context_json     jsonb         DEFAULT '{}',
  created_at       timestamptz   DEFAULT now() NOT NULL,
  updated_at       timestamptz   DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blxckchat_projects_user_id
  ON public.blxckchat_projects (user_id);

ALTER TABLE public.blxckchat_projects DISABLE ROW LEVEL SECURITY;

-- ============================================================

CREATE TABLE IF NOT EXISTS public.blxckchat_chats (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  uuid        NOT NULL REFERENCES public.blxckchat_projects(id) ON DELETE CASCADE,
  title       text        NOT NULL DEFAULT 'New Chat',
  messages    jsonb       DEFAULT '[]'::jsonb NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blxckchat_chats_project_id
  ON public.blxckchat_chats (project_id);

ALTER TABLE public.blxckchat_chats DISABLE ROW LEVEL SECURITY;
