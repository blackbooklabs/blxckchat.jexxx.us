import { NextResponse } from 'next/server';
import { getServerAuthContext, getServerUserId } from '@/lib/serverAuth';
import { emitPersonaEvent, fetchAnalyticsOverview, fetchDivinityLeaderboard, fetchDivinityWeekly, type PersonaEventType } from '@/lib/analytics';

export const runtime = 'nodejs';

/**
 * POST /api/admin/divinity-analytics
 * Emit a persona event. Called from client-side useChatStore (fire-and-forget).
 */
export async function POST(req: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { personaId, projectId, eventType, metadata } = body;

    if (!personaId || !eventType) {
      return NextResponse.json({ error: 'Missing personaId or eventType' }, { status: 400 });
    }

    await emitPersonaEvent({
      userId,
      projectId: projectId ?? null,
      personaId,
      eventType: eventType as PersonaEventType,
      metadata: metadata ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Analytics API Bypass]', error);
      return NextResponse.json({ ok: true });
    }
    console.error('[Analytics API] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/admin/divinity-analytics
 * Fetch the leaderboard + weekly data. Admin-only.
 */
export async function GET() {
  try {
    const { userId, isAdmin } = await getServerAuthContext();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [leaderboard, weekly, overview] = await Promise.all([
      fetchDivinityLeaderboard(),
      fetchDivinityWeekly(),
      fetchAnalyticsOverview(30),
    ]);

    return NextResponse.json({ leaderboard, weekly, overview });
  } catch (error) {
    console.error('[Analytics API] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
