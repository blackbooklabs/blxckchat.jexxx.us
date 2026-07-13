import { NextResponse } from 'next/server';
import { getServerUserId } from '@/lib/serverAuth';
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

export async function GET() {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('blxckchat_user_settings')
    .select('settings_encrypted, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ settings: null, source: 'dev-fallback' });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data?.settings_encrypted) {
    return NextResponse.json({ settings: null });
  }

  try {
    const plain = decryptSettingsPayload(data.settings_encrypted);
    const settings = unwrapSettings(plain);
    return NextResponse.json({
      settings,
      updatedAt: data.updated_at,
    });
  } catch (e) {
    console.error('Failed to decrypt BYOK settings:', e);
    return NextResponse.json({ error: 'Failed to decrypt settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { settings?: UserByokSettings };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.settings?.activeProvider || !body.settings.providersConfig) {
    return NextResponse.json({ error: 'Missing settings payload' }, { status: 400 });
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
    return NextResponse.json({ error: 'Encryption failed' }, { status: 500 });
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
      return NextResponse.json({ ok: true, source: 'dev-fallback' });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}