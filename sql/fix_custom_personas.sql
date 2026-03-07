-- 🚀 BLXCKCHAT: Custom Personas Schema Migration
-- Run this in your Supabase SQL Editor (MAMAbase)

-- Ensure the api schema exists
CREATE SCHEMA IF NOT EXISTS api;

-- Create the custom_personas table in the api schema
CREATE TABLE IF NOT EXISTS api.custom_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🪽',
  tagline TEXT,
  safe_content TEXT NOT NULL,
  spicy_content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE api.custom_personas ENABLE ROW LEVEL SECURITY;

-- 🛡️ RLS Policies (Clerk User ID Mapping)
-- Note: Assuming user_id matches the 'sub' claim in your JWT or is passed directly

CREATE POLICY "Users can view their own personas" 
ON api.custom_personas FOR SELECT 
TO authenticated
USING (user_id = auth.jwt() ->> 'sub' OR user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own personas" 
ON api.custom_personas FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.jwt() ->> 'sub' OR user_id = auth.uid()::text);

CREATE POLICY "Users can update their own personas" 
ON api.custom_personas FOR UPDATE 
TO authenticated
USING (user_id = auth.jwt() ->> 'sub' OR user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own personas" 
ON api.custom_personas FOR DELETE 
TO authenticated
USING (user_id = auth.jwt() ->> 'sub' OR user_id = auth.uid()::text);

-- 🔑 Permissions
GRANT ALL ON api.custom_personas TO anon, authenticated, service_role;

-- 🌀 Trigger Schema Reload
NOTIFY pgrst, 'reload schema';
