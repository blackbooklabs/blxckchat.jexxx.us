import { NextResponse } from 'next/server';
import { getServerUserIdFromRequest } from '@/lib/serverAuth';
import { loadUserByokSettings, resolveActiveByok } from '@/lib/byok-server';
import { miniCorsHeaders, miniOptionsResponse } from '@/lib/mini-cors';

export const runtime = 'nodejs';

export async function OPTIONS(req: Request) {
  return miniOptionsResponse(req);
}

/** Lightweight BYOK + auth probe for Mini widget (no API keys in response). */
export async function GET(req: Request) {
  const origin = req.headers.get('origin');
  const userId = await getServerUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json(
      { authenticated: false, byokConfigured: false },
      { status: 401, headers: miniCorsHeaders(origin) },
    );
  }

  const settings = await loadUserByokSettings(userId);
  const resolved = resolveActiveByok(settings);

  return NextResponse.json(
    {
      authenticated: true,
      userId,
      byokConfigured: !!resolved,
      activeProvider: resolved?.activeProvider ?? settings?.activeProvider ?? null,
      model: resolved?.model ?? null,
    },
    { headers: miniCorsHeaders(origin) },
  );
}