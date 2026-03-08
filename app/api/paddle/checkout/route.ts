import { NextResponse } from 'next/server';
import { getServerUserId } from '@/lib/serverAuth';

export const runtime = 'nodejs';

const PRICE_ID_TO_TIER: Record<string, string> = {
  [process.env.PADDLE_PRICE_ID_DEVOTEE ?? '']: 'devotee',
  [process.env.PADDLE_PRICE_ID_WHALE ?? '']: 'whale',
  [process.env.PADDLE_PRICE_ID_MELCHIZEDEK ?? '']: 'melchizedek',
};

const ALLOWED_TIERS = new Set(['devotee', 'whale', 'melchizedek']);

function getPaddleApiBase(): string {
  return process.env.NEXT_PUBLIC_PADDLE_ENV === 'production'
    ? 'https://api.paddle.com'
    : 'https://sandbox-api.paddle.com';
}

function getPriceIdForTier(tierId: string): string | null {
  if (!ALLOWED_TIERS.has(tierId)) return null;
  if (tierId === 'devotee') return process.env.PADDLE_PRICE_ID_DEVOTEE ?? null;
  if (tierId === 'whale') return process.env.PADDLE_PRICE_ID_WHALE ?? null;
  if (tierId === 'melchizedek') return process.env.PADDLE_PRICE_ID_MELCHIZEDEK ?? null;
  return null;
}

export async function POST(request: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paddleApiKey = process.env.PADDLE_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!paddleApiKey || !appUrl) {
      return NextResponse.json(
        { error: 'Paddle not configured: missing PADDLE_API_KEY or NEXT_PUBLIC_APP_URL' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const tierId = String(body?.tierId ?? '').trim();
    const quantity = Math.max(1, Number(body?.quantity ?? 1));

    const priceId = getPriceIdForTier(tierId);
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid or unconfigured tier' }, { status: 400 });
    }

    const apiUrl = `${getPaddleApiBase()}/transactions`;

    const payload = {
      items: [{ price_id: priceId, quantity }],
      custom_data: {
        user_id: userId,
        tier_id: tierId,
        source: 'blxckchat',
      },
      checkout: {
        url: `${appUrl}/subscription/success`,
      },
    };

    const paddleRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paddleApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const paddleJson = await paddleRes.json();

    if (!paddleRes.ok) {
      return NextResponse.json(
        { error: 'Paddle transaction create failed', details: paddleJson },
        { status: paddleRes.status }
      );
    }

    const checkoutUrl = paddleJson?.data?.checkout?.url;
    const transactionId = paddleJson?.data?.id;

    if (!checkoutUrl || !transactionId) {
      return NextResponse.json(
        { error: 'Unexpected Paddle response', details: paddleJson },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      checkoutUrl,
      transactionId,
      tierId,
      provider: 'paddle',
    });
  } catch (error) {
    console.error('[Paddle Checkout] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Paddle checkout endpoint active',
    requiredEnv: [
      'PADDLE_API_KEY',
      'PADDLE_PRICE_ID_DEVOTEE',
      'PADDLE_PRICE_ID_WHALE',
      'PADDLE_PRICE_ID_MELCHIZEDEK',
      'NEXT_PUBLIC_APP_URL',
      'NEXT_PUBLIC_PADDLE_ENV',
    ],
  });
}
