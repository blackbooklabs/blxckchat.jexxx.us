/**
 * BLXCKCHAT – Divinity Analytics Event Emitter
 *
 * Fire-and-forget event logging to Supabase.
 * Never throws — failures are silent (non-blocking to the empire's pipeline).
 */
import { getSupabase } from './supabase';

export type PersonaEventType = 'persona_selected' | 'message_sent';

export interface PersonaEventPayload {
  userId: string;
  projectId: string | null;
  personaId: string;
  eventType: PersonaEventType;
  metadata?: Record<string, unknown>;
}

/**
 * Emit a persona tracking event to Supabase.
 * Fire-and-forget: resolves immediately, errors logged but not re-thrown.
 */
export async function emitPersonaEvent(payload: PersonaEventPayload): Promise<void> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('blxckchat_persona_events').insert({
      user_id: payload.userId,
      project_id: payload.projectId ?? null,
      persona_id: payload.personaId,
      event_type: payload.eventType,
      metadata: payload.metadata ?? {},
    });
    if (error) {
      console.warn('[Analytics] Failed to emit persona event:', error.message);
    }
  } catch (e) {
    console.warn('[Analytics] Unexpected analytics error:', e);
  }
}

/**
 * Fetch the Divinity Leaderboard from the analytics view.
 * Returns sorted array of persona stats for the admin dashboard.
 */
export interface DivinityStats {
  persona_id: string;
  total_selections: number;
  total_messages: number;
  unique_seekers: number;
  avg_messages_per_session: number;
  last_seen: string | null;
}

export async function fetchDivinityLeaderboard(): Promise<DivinityStats[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('divinity_leaderboard')
      .select('*');
    if (error) {
      console.error('[Analytics] Failed to fetch leaderboard:', error.message);
      return [];
    }
    return (data ?? []) as DivinityStats[];
  } catch (e) {
    console.error('[Analytics] Unexpected leaderboard fetch error:', e);
    return [];
  }
}

/**
 * Fetch per-week conversion data for the bar chart.
 */
export interface DivinityWeeklyStats {
  persona_id: string;
  week: string;
  weekly_selections: number;
  weekly_messages: number;
}

export async function fetchDivinityWeekly(): Promise<DivinityWeeklyStats[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('divinity_weekly')
      .select('*')
      .limit(50);
    if (error) {
      console.error('[Analytics] Failed to fetch weekly stats:', error.message);
      return [];
    }
    return (data ?? []) as DivinityWeeklyStats[];
  } catch (e) {
    console.error('[Analytics] Unexpected weekly fetch error:', e);
    return [];
  }
}
