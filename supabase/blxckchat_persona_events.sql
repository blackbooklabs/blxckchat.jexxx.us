-- ============================================================
-- BLXCKCHAT – Persona Events (Divinity Analytics)
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.blxckchat_persona_events (
  id            uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       text          NOT NULL,               -- Clerk user_id
  project_id    text,                                  -- which project persona was invoked on
  persona_id    text          NOT NULL,               -- e.g. 'DRIZL', 'Lil_Bible'
  event_type    text          NOT NULL,               -- 'persona_selected' | 'message_sent'
  metadata      jsonb         DEFAULT '{}',            -- arbitrary payload (model used, message count, etc.)
  created_at    timestamptz   DEFAULT now() NOT NULL
);

-- Index for fast per-persona aggregation
CREATE INDEX IF NOT EXISTS idx_persona_events_persona_id
  ON public.blxckchat_persona_events (persona_id);

-- Index for per-user lookups
CREATE INDEX IF NOT EXISTS idx_persona_events_user_id
  ON public.blxckchat_persona_events (user_id);

-- Index for time-range queries (weekly/monthly dashboards)
CREATE INDEX IF NOT EXISTS idx_persona_events_created_at
  ON public.blxckchat_persona_events (created_at DESC);

-- ============================================================
-- Analytics View – Divinity Leaderboard
-- ============================================================
CREATE OR REPLACE VIEW public.divinity_leaderboard AS
SELECT
  persona_id,
  COUNT(*) FILTER (WHERE event_type = 'persona_selected')  AS total_selections,
  COUNT(*) FILTER (WHERE event_type = 'message_sent')       AS total_messages,
  COUNT(DISTINCT user_id)                                   AS unique_seekers,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'message_sent')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'persona_selected'), 0),
    2
  )                                                         AS avg_messages_per_session,
  MAX(created_at)                                           AS last_seen
FROM public.blxckchat_persona_events
GROUP BY persona_id
ORDER BY total_selections DESC;

-- ============================================================
-- Analytics View – Weekly Conversion Funnel
-- ============================================================
CREATE OR REPLACE VIEW public.divinity_weekly AS
SELECT
  persona_id,
  date_trunc('week', created_at) AS week,
  COUNT(*) FILTER (WHERE event_type = 'persona_selected')  AS weekly_selections,
  COUNT(*) FILTER (WHERE event_type = 'message_sent')       AS weekly_messages
FROM public.blxckchat_persona_events
GROUP BY persona_id, date_trunc('week', created_at)
ORDER BY week DESC, weekly_selections DESC;

-- ============================================================
-- NOTES:
-- No RLS enabled — security enforced at Clerk admin level.
-- persona_id values map to: 'DRIZL', 'Lil_Bible', 'Luna_Verde',
--   'Solomon_AI', 'Xena_Venus_Azul'
-- future: add 'subscription_created', 'ppv_purchased', 'whale_threshold_crossed'
--   events and join via user_id for full LTV attribution.
-- ============================================================
