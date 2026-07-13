/**
 * Live model discovery for BYOK cloud providers.
 * Endpoints aligned with jexxx.us-cli catalog, Bolt DIY, and Open WebUI.
 */

export type ModelsProvider =
  | 'openai'
  | 'anthropic'
  | 'grok'
  | 'gemini'
  | 'kimi'
  | 'groq'
  | 'openrouter'
  | 'ollama'
  | 'kingdom';

const FETCH_TIMEOUT_MS = 12_000;

const HF_KINGDOM_ENDPOINT =
  'https://kcx3mijtq0pfkvtc.us-east-1.aws.endpoints.huggingface.cloud/v1';

const STATIC_FALLBACKS: Partial<Record<ModelsProvider, string[]>> = {
  grok: ['grok-4', 'grok-3', 'grok-3-mini', 'grok-2-1212', 'grok-2-vision-1212'],
  kimi: [
    'kimi-latest',
    'kimi-k2-0711-preview',
    'kimi-k2-turbo-preview',
    'moonshot-v1-128k',
    'moonshot-v1-32k',
    'moonshot-v1-8k',
  ],
};

export function resolveModelsEndpoint(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/$/, '');
  if (trimmed.endsWith('/v1')) return `${trimmed}/models`;
  return `${trimmed}/v1/models`;
}

function uniqueSorted(ids: readonly string[]): string[] {
  return [...new Set(ids.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function mergeWithFallback(provider: ModelsProvider, live: string[]): string[] {
  const fallback = STATIC_FALLBACKS[provider] ?? [];
  return uniqueSorted([...live, ...fallback]);
}

async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Invalid response from provider (${res.status})`);
  }
  if (!res.ok) {
    const err = data as {
      error?: { message?: string } | string;
      message?: string;
    };
    const msg =
      (typeof err?.error === 'object' ? err.error?.message : err?.error) ||
      err?.message ||
      text.slice(0, 240);
    throw new Error(`${res.status}: ${msg}`);
  }
  return data;
}

/** OpenAI-compatible GET /v1/models */
export async function fetchOpenAiCompatibleModels(
  baseUrl: string,
  apiKey?: string,
): Promise<string[]> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (apiKey?.trim()) {
    headers.Authorization = `Bearer ${apiKey.trim()}`;
  }

  const data = (await fetchJson(resolveModelsEndpoint(baseUrl), {
    headers,
  })) as {
    data?: Array<{ id?: string }>;
    models?: Array<{ id?: string; name?: string }>;
  };

  const fromData = (data.data ?? [])
    .map((m) => m.id)
    .filter((id): id is string => Boolean(id));
  if (fromData.length > 0) return fromData;

  return (data.models ?? [])
    .map((m) => m.id ?? m.name)
    .filter((id): id is string => Boolean(id));
}

async function fetchOpenAiModels(key: string): Promise<string[]> {
  const data = (await fetchJson('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${key}` },
  })) as { data?: Array<{ id?: string }> };

  const allowed = ['gpt', 'o1', 'o3', 'o4', 'chatgpt'];
  const ids = (data.data ?? [])
    .map((m) => m.id)
    .filter((id): id is string => Boolean(id))
    .filter((id) => allowed.some((sub) => id.includes(sub)));

  return uniqueSorted(ids);
}

async function fetchAnthropicModels(key: string): Promise<string[]> {
  const data = (await fetchJson('https://api.anthropic.com/v1/models', {
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
  })) as { data?: Array<{ id?: string; type?: string }> };

  const ids = (data.data ?? [])
    .filter((m) => !m.type || m.type === 'model')
    .map((m) => m.id)
    .filter((id): id is string => Boolean(id));

  return uniqueSorted(ids);
}

async function fetchGrokModels(key: string): Promise<string[]> {
  try {
    const data = (await fetchJson('https://api.x.ai/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    })) as {
      data?: Array<{ id?: string }>;
      models?: Array<{ id?: string }>;
    };

    const list = data.data ?? data.models ?? [];
    const ids = list
      .map((m) => m.id)
      .filter((id): id is string => Boolean(id))
      .filter((id) => id.toLowerCase().includes('grok'));

    if (ids.length > 0) return uniqueSorted(ids);
  } catch {
    /* xAI model list may be unavailable — use static fallbacks */
  }
  return mergeWithFallback('grok', []);
}

async function fetchGeminiModels(key: string): Promise<string[]> {
  // Native Gemini API (AI SDK + Open WebUI pattern)
  try {
    const data = (await fetchJson(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
    )) as {
      models?: Array<{
        name?: string;
        displayName?: string;
        supportedGenerationMethods?: string[];
        inputTokenLimit?: number;
        outputTokenLimit?: number;
      }>;
    };

    const native = (data.models ?? [])
      .filter((m) => {
        const name = (m.name ?? '').replace('models/', '');
        if (!name.toLowerCase().includes('gemini')) return false;
        if (/embed|aqa|imagen|tts|live|computer-use|gemma/i.test(name)) {
          return false;
        }
        if (m.supportedGenerationMethods?.length) {
          return m.supportedGenerationMethods.includes('generateContent');
        }
        return true;
      })
      .map((m) => (m.name ?? '').replace('models/', ''))
      .filter(Boolean);

    if (native.length > 0) return uniqueSorted(native);
  } catch {
    /* fall through to OpenAI-compatible gateway */
  }

  // CLI / Bolt fallback: Gemini OpenAI-compatible surface
  const compatible = await fetchOpenAiCompatibleModels(
    'https://generativelanguage.googleapis.com/v1beta/openai',
    key,
  );
  const gemini = compatible.filter((id) => id.toLowerCase().includes('gemini'));
  if (gemini.length > 0) return uniqueSorted(gemini);

  throw new Error('No Gemini models returned — check your API key at aistudio.google.com');
}

async function fetchKimiModels(key: string): Promise<string[]> {
  const bases = ['https://api.moonshot.ai/v1', 'https://api.moonshot.cn/v1'];
  let lastError = 'Moonshot API unreachable';

  for (const base of bases) {
    try {
      const ids = await fetchOpenAiCompatibleModels(base, key);
      if (ids.length > 0) return uniqueSorted(ids);
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  const fallback = mergeWithFallback('kimi', []);
  if (fallback.length > 0) return fallback;
  throw new Error(lastError);
}

async function fetchGroqModels(key: string): Promise<string[]> {
  return uniqueSorted(
    await fetchOpenAiCompatibleModels('https://api.groq.com/openai/v1', key),
  );
}

async function fetchOpenRouterModels(key?: string): Promise<string[]> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (key && key.length > 5) {
    headers.Authorization = `Bearer ${key}`;
  }

  const data = (await fetchJson('https://openrouter.ai/api/v1/models', {
    headers,
  })) as { data?: Array<{ id?: string }> };

  const ids = (data.data ?? [])
    .map((m) => m.id)
    .filter((id): id is string => Boolean(id));

  return uniqueSorted(['openrouter/auto', ...ids]);
}

async function fetchOllamaModels(url: string): Promise<string[]> {
  const root = url
    .trim()
    .replace(/\/api$/, '')
    .replace(/\/v1$/, '')
    .replace(/\/$/, '');

  const data = (await fetchJson(`${root}/api/tags`)) as {
    models?: Array<{ name?: string }>;
  };

  const names = (data.models ?? [])
    .map((m) => m.name)
    .filter((name): name is string => Boolean(name));

  if (names.length === 0) {
    throw new Error('Ollama returned no models — pull a model with `ollama pull`');
  }
  return uniqueSorted(names);
}

async function fetchKingdomModels(key?: string): Promise<string[]> {
  if (key && key.length > 5) {
    try {
      const endpointModels = await fetchOpenAiCompatibleModels(
        HF_KINGDOM_ENDPOINT,
        key,
      );
      if (endpointModels.length > 0) return uniqueSorted(endpointModels);
    } catch {
      /* try Hub with token */
    }

    const hub = (await fetchJson(
      'https://huggingface.co/api/models?pipeline_tag=text-generation&sort=downloads&direction=-1&limit=80',
      { headers: { Authorization: `Bearer ${key}` } },
    )) as Array<{ modelId?: string; id?: string }>;

    if (Array.isArray(hub) && hub.length > 0) {
      return uniqueSorted(
        hub.map((m) => m.modelId ?? m.id).filter((id): id is string => Boolean(id)),
      );
    }
  }

  const publicHub = (await fetchJson(
    'https://huggingface.co/api/models?filter=text-generation&sort=downloads&direction=-1&limit=80',
  )) as Array<{ modelId?: string }>;

  if (!Array.isArray(publicHub) || publicHub.length === 0) {
    throw new Error('Hugging Face Hub connection failed');
  }

  return uniqueSorted(
    publicHub.map((m) => m.modelId).filter((id): id is string => Boolean(id)),
  );
}

export interface FetchProviderModelsInput {
  provider: ModelsProvider;
  openaiKey?: string | null;
  anthropicKey?: string | null;
  grokKey?: string | null;
  geminiKey?: string | null;
  kimiKey?: string | null;
  groqKey?: string | null;
  openrouterKey?: string | null;
  ollamaUrl?: string | null;
  kingdomKey?: string | null;
}

export async function fetchProviderModels(
  input: FetchProviderModelsInput,
): Promise<string[]> {
  const { provider } = input;

  switch (provider) {
    case 'openai': {
      const key = input.openaiKey?.trim();
      if (!key) throw new Error('Missing OpenAI API key');
      return fetchOpenAiModels(key);
    }
    case 'anthropic': {
      const key = input.anthropicKey?.trim();
      if (!key) throw new Error('Missing Anthropic API key');
      return fetchAnthropicModels(key);
    }
    case 'grok': {
      const key = input.grokKey?.trim();
      if (!key) throw new Error('Missing xAI API key');
      return fetchGrokModels(key);
    }
    case 'gemini': {
      const key = input.geminiKey?.trim();
      if (!key) throw new Error('Missing Gemini API key');
      return fetchGeminiModels(key);
    }
    case 'kimi': {
      const key = input.kimiKey?.trim();
      if (!key) throw new Error('Missing Kimi (Moonshot) API key');
      return fetchKimiModels(key);
    }
    case 'groq': {
      const key = input.groqKey?.trim();
      if (!key) throw new Error('Missing Groq API key');
      return fetchGroqModels(key);
    }
    case 'openrouter':
      return fetchOpenRouterModels(input.openrouterKey?.trim());
    case 'ollama':
      return fetchOllamaModels(input.ollamaUrl || 'http://localhost:11434');
    case 'kingdom':
      return fetchKingdomModels(input.kingdomKey?.trim());
    default:
      throw new Error(`Invalid provider: ${provider}`);
  }
}