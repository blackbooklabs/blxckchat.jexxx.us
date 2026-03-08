import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

type PaddleWebhookEvent = {
  event_type: string;
  data?: {
    id?: string;
    status?: string;
    customer_id?: string;
    custom_data?: Record<string, unknown>;
    items?: Array<{ price?: { id?: string } }>;
  };
};

const PRICE_ID_TO_TIER: Record<string, 'devotee' | 'whale' | 'melchizedek'> = {
  [process.env.PADDLE_PRICE_ID_DEVOTEE ?? '']: 'devotee',
  [process.env.PADDLE_PRICE_ID_WHALE ?? '']: 'whale',
  [process.env.PADDLE_PRICE_ID_MELCHIZEDEK ?? '']: 'melchizedek',
};

function parsePaddleSignature(signatureHeader: string | null): { ts: string; h1: string } | null {
  if (!signatureHeader) return null;

  const parts = signatureHeader.split(';').map((p) => p.trim());
  let ts = '';
  let h1 = '';

  for (const part of parts) {
    const [k, v] = part.split('=');
    if (k === 'ts') ts = v ?? '';
    if (k === 'h1' && !h1) h1 = v ?? '';
  }

  if (!ts || !h1) return null;
  return { ts, h1 };
}

function verifyPaddleWebhook(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[Paddle Webhook] Missing PADDLE_NOTIFICATION_WEBHOOK_SECRET');
    return false;
  }

  const parsed = parsePaddleSignature(signatureHeader);
  if (!parsed) return false;

  const signedPayload = `${parsed.ts}:${rawBody}`;
  const expected = createHmac('sha256', secret).update(signedPayload).digest('hex');

  try {
    const expectedBuf = Buffer.from(expected, 'hex');
    const receivedBuf = Buffer.from(parsed.h1, 'hex');
    if (expectedBuf.length !== receivedBuf.length) return false;
    return timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    return false;
  }
}

function mapPriceIdToTier(priceId: string | undefined): 'devotee' | 'whale' | 'melchizedek' | 'free' {
  if (!priceId) return 'free';
  return PRICE_ID_TO_TIER[priceId] ?? 'free';
}

function mapStatusToSubscriptionStatus(status: string | undefined): 'active' | 'past_due' | 'canceled' | 'unknown' {
  if (!status) return 'unknown';
  if (status === 'active' || status === 'trialing') return 'active';
  if (status === 'past_due' || status === 'paused') return 'past_due';
  if (status === 'canceled') return 'canceled';
  return 'unknown';
}

async function updateUserSubscription(userId: string, payload: Record<string, unknown>) {
  await (await clerkClient()).users.updateUserMetadata(userId, {
    publicMetadata: payload,
  });
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('Paddle-Signature');
    const rawBody = await request.text();

    if (!verifyPaddleWebhook(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as PaddleWebhookEvent;
    const eventType = event.event_type;

    const userId = String(event.data?.custom_data?.user_id ?? '');
    const tierFromCustom = String(event.data?.custom_data?.tier_id ?? '');
    const firstPriceId = event.data?.items?.[0]?.price?.id;
    const mappedTier = mapPriceIdToTier(firstPriceId);
    const tier = (tierFromCustom || mappedTier) as string;

    if (!userId) {
      return NextResponse.json({ ok: true, message: 'No user_id in custom_data; ignored' });
    }

    if (eventType === 'transaction.completed' || eventType === 'subscription.created' || eventType === 'subscription.activated' || eventType === 'subscription.updated') {
      await updateUserSubscription(userId, {
        tier: tier || 'free',
        subscription: {
          status: mapStatusToSubscriptionStatus(event.data?.status),
          provider: 'paddle',
          tierName: tier || 'free',
          updatedAt: new Date().toISOString(),
          subscriptionId: event.data?.id ?? null,
          paddleCustomerId: event.data?.customer_id ?? null,
        },
      });
    }

    if (eventType === 'subscription.canceled' || eventType === 'subscription.paused' || eventType === 'subscription.past_due') {
      await updateUserSubscription(userId, {
        tier: 'free',
        subscription: {
          status: mapStatusToSubscriptionStatus(event.data?.status ?? 'canceled'),
          provider: 'paddle',
          updatedAt: new Date().toISOString(),
          subscriptionId: event.data?.id ?? null,
          paddleCustomerId: event.data?.customer_id ?? null,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Paddle Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Paddle webhook endpoint active',
    signatureHeader: 'Paddle-Signature',
  });
}
