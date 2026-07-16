import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createXai } from '@ai-sdk/xai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { getServerUserIdFromRequest } from '@/lib/serverAuth';
import { loadUserByokSettings, resolveActiveByok } from '@/lib/byok-server';
import { HF_INFERENCE_ROUTER_BASE } from '@/lib/provider-models';
import { miniCorsHeaders, miniOptionsResponse } from '@/lib/mini-cors';
import type { ByokProviderId } from '@/lib/byok-settings-types';

export const runtime = 'nodejs';
export const maxDuration = 60;

type MiniMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

function buildModel(provider: ByokProviderId, apiKey: string, model: string) {
  switch (provider) {
    case 'grok':
      return createXai({ apiKey })(model);
    case 'anthropic':
      return createAnthropic({ apiKey })(model);
    case 'gemini':
      return createGoogleGenerativeAI({ apiKey })(model);
    case 'groq':
      return createGroq({ apiKey })(model);
    case 'kimi':
      return createOpenAI({ apiKey, baseURL: 'https://api.moonshot.ai/v1' })(model);
    case 'openrouter':
      return createOpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' })(model);
    case 'ollama': {
      let host = apiKey?.trim() || 'http://localhost:11434';
      if (!host.endsWith('/v1')) {
        host = host.replace(/\/$/, '');
        host = host.endsWith('/api') ? host.replace(/\/api$/, '/v1') : `${host}/v1`;
      }
      return createOpenAI({ apiKey: 'ollama', baseURL: host })(model);
    }
    case 'bonsai':
      return createOpenAI({ apiKey: 'bonsai', baseURL: 'http://localhost:8080/v1' })(model);
    case 'kingdom':
      return createOpenAI({
        apiKey: apiKey || process.env.HF_TOKEN || '',
        baseURL: HF_INFERENCE_ROUTER_BASE,
      })(model);
    case 'openai':
    default:
      return createOpenAI({ apiKey })(model);
  }
}

export async function OPTIONS(req: Request) {
  return miniOptionsResponse(req);
}

/**
 * Server-side BYOK completion for Mini widget.
 * Loads encrypted settings from Supabase — same path as blxckchat.jexxx.us/chat.
 */
export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const userId = await getServerUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Sign in with the same Clerk account as BLXCKCHAT.' },
      { status: 401, headers: miniCorsHeaders(origin) },
    );
  }

  let body: { messages?: MiniMessage[]; systemPrompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400, headers: miniCorsHeaders(origin) },
    );
  }

  const settings = await loadUserByokSettings(userId);
  const byok = resolveActiveByok(settings);
  if (!byok) {
    return NextResponse.json(
      {
        error: 'BYOK_NOT_CONFIGURED',
        message:
          'Set up your API key at blxckchat.jexxx.us/chat (⚙️ settings), then try again.',
      },
      { status: 403, headers: miniCorsHeaders(origin) },
    );
  }

  const messages = (body.messages ?? []).map((m) => ({
    role: m.role === 'system' ? 'system' as const : m.role === 'user' ? 'user' as const : 'assistant' as const,
    content: m.content,
  }));

  const systemPrompt = body.systemPrompt?.trim();
  const aiMessages = systemPrompt
    ? [{ role: 'system' as const, content: systemPrompt }, ...messages.filter((m) => m.role !== 'system')]
    : messages;

  try {
    const { text } = await generateText({
      model: buildModel(byok.activeProvider, byok.apiKey, byok.model),
      messages: aiMessages,
    });

    return NextResponse.json(
      {
        text,
        provider: byok.activeProvider,
        model: byok.model,
      },
      { headers: miniCorsHeaders(origin) },
    );
  } catch (error) {
    console.error('[Mini Agent] completion error:', error);
    return NextResponse.json(
      {
        error: 'COMPLETION_FAILED',
        message: error instanceof Error ? error.message : 'AI request failed',
      },
      { status: 500, headers: miniCorsHeaders(origin) },
    );
  }
}