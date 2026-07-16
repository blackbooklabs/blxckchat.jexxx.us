import { NextResponse } from 'next/server';
import { getServerUserIdFromRequest } from '@/lib/serverAuth';
import { loadUserByokSettings, resolveActiveByok } from '@/lib/byok-server';
import { miniCorsHeaders, miniOptionsResponse } from '@/lib/mini-cors';
import { runWithAccountSessionResolver } from '@/lib/kingdom-agent/request-session';
import {
  resolveWebAccountSession,
  resolveWebAccountSessionFromRequest,
} from '@/lib/kingdom-agent/web-session';
import {
  runKingdomAgent,
  runKingdomAgentStreamResponse,
} from '@/lib/kingdom-agent/run-kingdom-agent';
import type { IncomingChatMessage } from '@/lib/chat-message-normalizer';
import type { AgentProvider } from '@/lib/kingdom-agent/providers';
import {
  estimateJsonBytes,
  MAX_API_PAYLOAD_BYTES,
  trimProjectInstructionsForApi,
} from '@/lib/chat-payload-limits';
import { normalizeMessagesForApiPayload } from '@/lib/normalize-agent-payload';

export const runtime = 'nodejs';
export const maxDuration = 120;

type MiniMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function OPTIONS(req: Request) {
  return miniOptionsResponse(req);
}

/**
 * Kingdom Agent for Mini widget — same tool stack as /api/agent (VEIL, TV, vault CRUD, Law, Docs).
 * Server-side BYOK + Bearer Clerk JWT from mini.blxckchat.jexxx.us.
 */
export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const cors = miniCorsHeaders(origin);

  const userId = await getServerUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Sign in with the same Clerk account as BLXCKCHAT.' },
      { status: 401, headers: cors },
    );
  }

  let body: {
    messages?: MiniMessage[];
    systemPrompt?: string;
    mode?: 'venus' | 'innocent';
    stream?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: cors });
  }

  const settings = await loadUserByokSettings(userId);
  const byok = resolveActiveByok(settings);
  if (!byok) {
    return NextResponse.json(
      {
        error: 'BYOK_NOT_CONFIGURED',
        message: 'Set up your API key at blxckchat.jexxx.us/chat (⚙️ settings), then try again.',
      },
      { status: 403, headers: cors },
    );
  }

  if (estimateJsonBytes(body) > MAX_API_PAYLOAD_BYTES) {
    return NextResponse.json(
      {
        error: 'Payload Too Large',
        message:
          'This conversation is too large. Start a new conversation (+) or delete the oversized chat.',
      },
      { status: 413, headers: cors },
    );
  }

  const incomingMessages: IncomingChatMessage[] = normalizeMessagesForApiPayload(
    (body.messages ?? []).map((m) => ({
      role: m.role,
      content: m.content,
    })),
  );

  try {
    const agentBase = {
      messages: incomingMessages,
      provider: byok.activeProvider as AgentProvider,
      apiKey: byok.apiKey,
      model: byok.model,
      mode: body.mode ?? 'venus',
      projectInstructions: trimProjectInstructionsForApi(body.systemPrompt?.trim() ?? ''),
    };

    const wantStream = body.stream !== false;

    if (wantStream) {
      return await runWithAccountSessionResolver(
        () => resolveWebAccountSessionFromRequest(req),
        async () => {
          const sessionResult = await resolveWebAccountSession();
          if (!sessionResult.ok) {
            throw new Error(sessionResult.message);
          }
          return await runKingdomAgentStreamResponse(
            {
              ...agentBase,
              session: sessionResult.session,
            },
            { ...cors, 'X-BLXCKCHAT-Agent': 'kingdom-mini' },
          );
        },
      );
    }

    const result = await runWithAccountSessionResolver(
      () => resolveWebAccountSessionFromRequest(req),
      async () => {
        const sessionResult = await resolveWebAccountSession();
        if (!sessionResult.ok) {
          throw new Error(sessionResult.message);
        }

        return runKingdomAgent({
          ...agentBase,
          session: sessionResult.session,
        });
      },
    );

    return NextResponse.json(
      {
        text: result.text,
        provider: result.provider,
        model: result.model,
        agent: true,
        steps: result.steps,
        signature: '♡💦 BLXCKCHAT Kingdom Agent',
      },
      { headers: cors },
    );
  } catch (error) {
    console.error('[Mini Kingdom Agent] error:', error);
    return NextResponse.json(
      {
        error: 'COMPLETION_FAILED',
        message: error instanceof Error ? error.message : 'AI request failed',
      },
      { status: 500, headers: cors },
    );
  }
}