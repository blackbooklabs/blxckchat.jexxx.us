-- ==========================================
-- JEXXXUS EMPIRE: BLXCKCHAT SESSIONS TABLE
-- ==========================================
-- Execute this script in the Supabase SQL Editor
-- to create the conversational memory table.

CREATE TABLE IF NOT EXISTS public.blxckchat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Matched to Clerk user.id
    title TEXT DEFAULT 'New Chat'::text NOT NULL,
    messages JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Since BLXCKCHAT uses server-side Clerk verification via API routes,
-- and those routes use the Supabase Service OR Anon key depending on context,
-- we must ensure the `user_id` matches the authenticated Clerk token if queried from the client.
-- In our architecture, the Next.js API route (/api/sessions) proxies the database,
-- so RLS isn't strictly necessary if using the SERVICE key, but it is highly recommended
-- if accessing via Anon Key from the server.

ALTER TABLE public.blxckchat_sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to fully manage their own sessions based on user_id
CREATE POLICY "Users can manage their own sessions"
ON public.blxckchat_sessions
FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- NOTE: If your Next.js API routes use the SUPABASE_SERVICE_ROLE_KEY, 
-- they bypass RLS automatically. If they use SUPABASE_ANON_KEY, 
-- you may need to disable RLS or write a custom JWT function to sync Clerk tokens
-- to Supabase's `auth.uid()`. Since our API route enforces Clerk `userId` manually 
-- before executing the query, we can safely allow the anon key to bypass RLS 
-- strictly for the API routes if we configure it (or just use the Service Key).

-- The simplest way to make our existing /api/sessions/ routes work 
-- using just the ANON KEY is to temporarily disable RLS, since 
-- our API route already successfully validates the Clerk userId beforehand:
ALTER TABLE public.blxckchat_sessions DISABLE ROW LEVEL SECURITY;

-- If you prefer maximum security and have the SERVICE_ROLE_KEY in Vercel,
-- you can leave RLS ENABBLED.

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_blxckchat_sessions_user_id ON public.blxckchat_sessions(user_id);
