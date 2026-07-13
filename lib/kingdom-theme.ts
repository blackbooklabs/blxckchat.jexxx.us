/**
 * JEXXXUS Empire Theme Sync (July 2026 canonical implementation)
 */

export type Theme = 'light' | 'dark' | 'system';

export const COOKIE_NAME = 'jexxxus-theme';
export const LOCAL_STORAGE_KEY = 'jexxxus-theme';
export const BROADCAST_CHANNEL = 'jexxxus-theme';
export const THEME_CHANGE_EVENT = 'jexxxus:themechange';
export const LOCAL_THEME_WRITE_GRACE_MS = 3000;

let lastLocalWrite = 0;

export function readEmpireTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  
  try {
    // Check cookie first (cross-subdomain source of truth)
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const [k, v] = c.trim().split('=');
      if (k === COOKIE_NAME && (v === 'light' || v === 'dark' || v === 'system')) {
        return v as Theme;
      }
    }

    // Fallback to localStorage
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local === 'light' || local === 'dark' || local === 'system') return local;
  } catch (e) {
    // ignore
  }
  return 'system';
}

export function isJexxxusDomain(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'jexxx.us' || host.endsWith('.jexxx.us');
}

function cookieDomain(): string | undefined {
  return isJexxxusDomain() ? '.jexxx.us' : undefined;
}

export function writeEmpireTheme(theme: Theme, options?: { origin?: 'sync' | 'user' }) {
  if (typeof window === 'undefined') return;
  const isUserWrite = options?.origin !== 'sync';
  
  if (isUserWrite) {
    lastLocalWrite = Date.now();
  } else {
    // If we're in the grace period, ignore remote sync writes
    if (Date.now() - lastLocalWrite < LOCAL_THEME_WRITE_GRACE_MS) return;
  }
  
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, theme);
    
    const parts = [
      `${COOKIE_NAME}=${theme}`,
      'path=/',
      'max-age=31536000',
      'SameSite=Lax'
    ];
    const domain = cookieDomain();
    if (domain) {
      parts.push(`domain=${domain}`);
    }
    document.cookie = parts.join('; ');
    
    if (isUserWrite) {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL);
      bc.postMessage(theme);
      bc.close();
      window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
    }
  } catch (e) {
    // ignore
  }
}

export function subscribeEmpireTheme(callback: (theme: Theme) => void) {
  if (typeof window === 'undefined') return () => {};
  
  const bc = new BroadcastChannel(BROADCAST_CHANNEL);
  let last = readEmpireTheme();

  const applyIfChanged = (next: Theme) => {
    if (next !== last) {
      last = next;
      callback(next);
    }
  };

  const handleMessage = (e: MessageEvent) => {
    if (e.data === 'light' || e.data === 'dark' || e.data === 'system') {
      writeEmpireTheme(e.data, { origin: 'sync' });
      applyIfChanged(e.data);
    }
  };
  
  const handleCustomEvent = (e: Event) => {
    const ce = e as CustomEvent;
    if (ce.detail === 'light' || ce.detail === 'dark' || ce.detail === 'system') {
      applyIfChanged(ce.detail);
    }
  };
  
  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
      writeEmpireTheme(e.newValue as Theme, { origin: 'sync' });
      applyIfChanged(e.newValue as Theme);
    }
  };
  
  bc.addEventListener('message', handleMessage);
  window.addEventListener(THEME_CHANGE_EVENT, handleCustomEvent);
  window.addEventListener('storage', handleStorage);
  
  // Cookie poll cross-subdomain
  const interval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      const current = readEmpireTheme();
      applyIfChanged(current);
    }
  }, 150);
  
  return () => {
    bc.removeEventListener('message', handleMessage);
    bc.close();
    window.removeEventListener(THEME_CHANGE_EVENT, handleCustomEvent);
    window.removeEventListener('storage', handleStorage);
    clearInterval(interval);
  };
}

export function nextEmpireTheme(current: Theme): Theme {
  if (current === 'light') return 'dark';
  if (current === 'dark') return 'system';
  return 'light';
}
