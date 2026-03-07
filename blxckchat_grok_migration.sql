-- ==========================================
-- JEXXXUS EMPIRE: BLXCKCHAT GROK ARCHITECTURE MIGRATION
-- ==========================================
-- This script migrates the old flat 'sessions' table into a hierarchical
-- 'projects' and 'chats' structure, reflecting xAI's grok.com architecture.

-- 1. Create Projects Table (The Parent Domains)
CREATE TABLE IF NOT EXISTS public.blxckchat_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Matched to Clerk user.id
    title TEXT DEFAULT 'New Project'::text NOT NULL,
    custom_instructions TEXT DEFAULT ''::text, -- Global instructions for all chats in this project
    context_json JSONB DEFAULT '{}'::jsonb, -- Isolated memory/facts storage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Chats Table (The Nested Threads)
CREATE TABLE IF NOT EXISTS public.blxckchat_chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.blxckchat_projects(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Chat'::text NOT NULL,
    messages JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Migration Logic (Optional: Only if you already had data in blxckchat_sessions)
-- If you created the blxckchat_sessions table previously and want to keep the data:
DO $$
DECLARE
    session_row RECORD;
    default_project_id UUID;
BEGIN
    -- Only run if the old table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blxckchat_sessions') THEN
        FOR session_row IN SELECT DISTINCT user_id FROM public.blxckchat_sessions LOOP
            -- Create a default project for each user who had sessions
            INSERT INTO public.blxckchat_projects (user_id, title, custom_instructions)
            VALUES (session_row.user_id, 'Default Project', '')
            RETURNING id INTO default_project_id;

            -- Move all their sessions into chats belonging to this default project
            INSERT INTO public.blxckchat_chats (id, project_id, title, messages, created_at, updated_at)
            SELECT id, default_project_id, title, messages, created_at, updated_at
            FROM public.blxckchat_sessions
            WHERE user_id = session_row.user_id;
        END LOOP;
        
        -- After migration is verified, you can drop the old table:
        -- DROP TABLE public.blxckchat_sessions;
    END IF;
END $$;

-- 4. Create Indexes for rapid lookup
CREATE INDEX IF NOT EXISTS idx_blxckchat_projects_user_id ON public.blxckchat_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_blxckchat_chats_project_id ON public.blxckchat_chats(project_id);

-- 5. Disable RLS (Since Next.js API Routes manually secure via Clerk Verification)
ALTER TABLE public.blxckchat_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blxckchat_chats DISABLE ROW LEVEL SECURITY;
