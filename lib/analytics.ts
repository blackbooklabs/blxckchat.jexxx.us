/**
 * BLXCKCHAT – Divinity Analytics Event Emitter
 *
 * Fire-and-forget event logging to Supabase.
 * Never throws — failures are silent (non-blocking to the empire's pipeline).
 */
import { getSupabaseAdmin } from './supabase';

export type PersonaEventType = 
  | 'persona_selected' 
  | 'message_sent'
  | 'image_attached'
  | 'file_attached'
  | 'branch_switch'
  | 'tts_play'
  | 'persona_creation'
  | 'vision_pattern_executed'
  | 'subscription_signal';

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
    const supabase = getSupabaseAdmin();
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
    const supabase = getSupabaseAdmin();
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
    const supabase = getSupabaseAdmin();
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

export interface EventVelocityPoint {
  day: string;
  total: number;
}

export interface PersonaCreationPoint {
  week: string;
  count: number;
}

export interface WhaleSignalPoint {
  persona_id: string;
  total: number;
  weightedScore: number;
}

export interface AnalyticsOverview {
  velocity: EventVelocityPoint[];
  personaCreation: PersonaCreationPoint[];
  whaleSignals: WhaleSignalPoint[];
}

const EVENT_WEIGHTS: Record<string, number> = {
  image_attached: 3,
  tts_play: 2,
  branch_switch: 1.5,
  persona_creation: 5,
  message_sent: 1,
  persona_selected: 0.5,
  vision_pattern_executed: 4,
  subscription_signal: 6,
};

function toISOWeek(date: Date): string {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export async function fetchAnalyticsOverview(days = 30): Promise<AnalyticsOverview> {
  try {
    const supabase = getSupabaseAdmin();
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('blxckchat_persona_events')
      .select('persona_id,event_type,created_at,metadata')
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .limit(5000);

    if (error) {
      console.error('[Analytics] Failed to fetch analytics overview:', error.message);
      return { velocity: [], personaCreation: [], whaleSignals: [] };
    }

    const rows = data ?? [];
    const velocityMap = new Map<string, number>();
    const personaCreationMap = new Map<string, number>();
    const whaleMap = new Map<string, { total: number; weightedScore: number }>();

    for (const row of rows) {
      const createdAt = typeof row.created_at === 'string' ? new Date(row.created_at) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) continue;

      const day = createdAt.toISOString().slice(0, 10);
      velocityMap.set(day, (velocityMap.get(day) ?? 0) + 1);

      if (row.event_type === 'persona_creation') {
        const week = toISOWeek(createdAt);
        personaCreationMap.set(week, (personaCreationMap.get(week) ?? 0) + 1);
      }

      const personaId = row.persona_id ?? 'unknown';
      const current = whaleMap.get(personaId) ?? { total: 0, weightedScore: 0 };
      const eventWeight = EVENT_WEIGHTS[row.event_type] ?? 1;
      current.total += 1;
      current.weightedScore += eventWeight;
      whaleMap.set(personaId, current);
    }

    const velocity: EventVelocityPoint[] = Array.from(velocityMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, total]) => ({ day, total }));

    const personaCreation: PersonaCreationPoint[] = Array.from(personaCreationMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, count]) => ({ week, count }));

    const whaleSignals: WhaleSignalPoint[] = Array.from(whaleMap.entries())
      .map(([persona_id, stats]) => ({ persona_id, total: stats.total, weightedScore: Number(stats.weightedScore.toFixed(2)) }))
      .sort((a, b) => b.weightedScore - a.weightedScore)
      .slice(0, 20);

    return { velocity, personaCreation, whaleSignals };
  } catch (e) {
    console.error('[Analytics] Unexpected overview fetch error:', e);
    return { velocity: [], personaCreation: [], whaleSignals: [] };
  }
}
