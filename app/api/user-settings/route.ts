import { NextResponse } from 'next/server';
import { getServerUserIdFromRequest } from '@/lib/serverAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  decryptSettingsPayload,
  encryptSettingsPayload,
} from '@/lib/byok-settings-crypto';
import {
  BYOK_SETTINGS_VERSION,
  type UserByokSettings,
} from '@/lib/byok-settings-types';

export const runtime = 'nodejs';

// Subdomains allowed to fetch settings cross-origin with credentials
const ALLOWED_ORIGINS = new Set([
  'https://mini.blxckchat.jexxx.us',
  'https://blxckchat.jexxx.us',
  'https://blxckbook.jexxx.us',
  'https://dxsh.blxckbook.jexxx.us',
]);

function corsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://blxckchat.jexxx.us';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
}

function wrapSettings(settings: UserByokSettings) {
  return JSON.stringify({ v: BYOK_SETTINGS_VERSION, settings });
}

function unwrapSettings(raw: string): UserByokSettings | null {
  try {
    const parsed = JSON.parse(raw) as {
      v?: number;
      settings?: UserByokSettings;
    };
    if (parsed.settings) return parsed.settings;
    return parsed as unknown as UserByokSettings;
  } catch {
    return null;
  }
}

// Handle CORS preflight
export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function GET(req: Request) {
  const origin = req.headers.get('origin');
  const userId = await getServerUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders(origin) });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('blxckchat_user_settings')
    .select('settings_encrypted, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ settings: null, source: 'dev-fallback' }, { headers: corsHeaders(origin) });
    }
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders(origin) });
  }

  if (!data?.settings_encrypted) {
    return NextResponse.json({ settings: null }, { headers: corsHeaders(origin) });
  }

  try {
    const plain = decryptSettingsPayload(data.settings_encrypted);
    const settings = unwrapSettings(plain);
    return NextResponse.json(
      { settings, updatedAt: data.updated_at },
      { headers: corsHeaders(origin) },
    );
  } catch (e) {
    console.error('Failed to decrypt BYOK settings:', e);
    return NextResponse.json({ error: 'Failed to decrypt settings' }, { status: 500, headers: corsHeaders(origin) });
  }
}

export async function PUT(req: Request) {
  const origin = req.headers.get('origin');
  const userId = await getServerUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders(origin) });
  }

  let body: { settings?: UserByokSettings };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders(origin) });
  }

  if (!body.settings?.activeProvider || !body.settings.providersConfig) {
    return NextResponse.json({ error: 'Missing settings payload' }, { status: 400, headers: corsHeaders(origin) });
  }

  const payload = wrapSettings({
    ...body.settings,
    updatedAt: new Date().toISOString(),
  });

  let encrypted: string;
  try {
    encrypted = encryptSettingsPayload(payload);
  } catch (e) {
    console.error('Encrypt failed:', e);
    return NextResponse.json({ error: 'Encryption failed' }, { status: 500, headers: corsHeaders(origin) });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('blxckchat_user_settings').upsert(
    {
      user_id: userId,
      settings_encrypted: encrypted,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ ok: true, source: 'dev-fallback' }, { headers: corsHeaders(origin) });
    }
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders(origin) });
  }

  return NextResponse.json({ ok: true }, { headers: corsHeaders(origin) });
}