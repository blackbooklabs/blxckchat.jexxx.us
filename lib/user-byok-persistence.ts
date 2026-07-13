import type { UserByokSettings } from '@/lib/byok-settings-types';

export function localByokStorageKey(userId: string) {
  return `blxckchat-byok-${userId}`;
}

export function readLocalByokSettings(userId: string): UserByokSettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(localByokStorageKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as UserByokSettings;
  } catch {
    return null;
  }
}

export function writeLocalByokSettings(userId: string, settings: UserByokSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(localByokStorageKey(userId), JSON.stringify(settings));
  } catch {
    /* quota */
  }
}

export async function fetchRemoteByokSettings(): Promise<UserByokSettings | null> {
  const res = await fetch('/api/user-settings', { method: 'GET' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.settings ?? null;
}

export async function saveRemoteByokSettings(settings: UserByokSettings): Promise<boolean> {
  const res = await fetch('/api/user-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings }),
  });
  return res.ok;
}