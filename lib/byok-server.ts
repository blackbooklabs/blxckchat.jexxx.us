import { getSupabaseAdmin } from '@/lib/supabase';
import { decryptSettingsPayload } from '@/lib/byok-settings-crypto';
import {
  BYOK_SETTINGS_VERSION,
  type ByokProviderId,
  type UserByokSettings,
} from '@/lib/byok-settings-types';

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

const PROVIDERS_WITHOUT_KEY = new Set<ByokProviderId>(['kingdom']);

function hasUsableKey(provider: string, apiKey: unknown): boolean {
  if (PROVIDERS_WITHOUT_KEY.has(provider as ByokProviderId)) return true;
  if (typeof apiKey !== 'string') return false;
  const trimmed = apiKey.trim();
  if (!trimmed) return false;
  if (provider === 'ollama' || provider === 'bonsai') return trimmed.length >= 4;
  return trimmed.length >= 5;
}

export async function loadUserByokSettings(
  userId: string,
): Promise<UserByokSettings | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('blxckchat_user_settings')
    .select('settings_encrypted')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data?.settings_encrypted) return null;

  try {
    const plain = decryptSettingsPayload(data.settings_encrypted);
    return unwrapSettings(plain);
  } catch {
    return null;
  }
}

export function resolveActiveByok(settings: UserByokSettings | null): {
  activeProvider: ByokProviderId;
  apiKey: string;
  model: string;
} | null {
  if (!settings?.providersConfig) return null;

  const active = settings.activeProvider;
  const configs = settings.providersConfig;

  if (active && configs[active] && hasUsableKey(active, configs[active].apiKey)) {
    return {
      activeProvider: active,
      apiKey: configs[active].apiKey ?? '',
      model: configs[active].model,
    };
  }

  for (const [provider, cfg] of Object.entries(configs)) {
    if (hasUsableKey(provider, cfg?.apiKey)) {
      return {
        activeProvider: provider as ByokProviderId,
        apiKey: cfg.apiKey ?? '',
        model: cfg.model,
      };
    }
  }

  return null;
}