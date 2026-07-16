import { generateText, ToolLoopAgent, stepCountIs } from "ai";
import {
  normalizeMessagesForAiSdk,
  type IncomingChatMessage,
} from "@/lib/chat-message-normalizer";
import { buildKingdomAiTools } from "@/lib/kingdom-agent/ai-tools";
import {
  buildKingdomSystemPrompt,
  extractHistoryContext,
} from "@/lib/kingdom-agent/build-prompt";
import { formatKingdomAgentError } from "@/lib/kingdom-agent/format-agent-error";
import { loadCliModule } from "@/lib/kingdom-agent/cli-loader";
import { createKingdomModel, type AgentProvider } from "@/lib/kingdom-agent/providers";
import type { AuthenticatedAccountSession } from "@/lib/kingdom-agent/types";
import { stripSpicyCanon } from "@/lib/spicy-mode";

export interface RunKingdomAgentInput {
  session: AuthenticatedAccountSession;
  messages: IncomingChatMessage[];
  provider: AgentProvider;
  apiKey: string;
  model?: string;
  mode?: "venus" | "innocent";
  projectInstructions?: string;
  globalInstructions?: string;
}

export interface RunKingdomAgentResult {
  text: string;
  provider: string;
  model: string;
  steps: number;
}

const TYPEWRITER_CHUNK = 4;
const TYPEWRITER_DELAY_MS = 6;

function lastUserText(messages: IncomingChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role !== "user") continue;
    const c = messages[i].content;
    if (typeof c === "string") return c;
    if (Array.isArray(c)) {
      return c
        .filter((p) => p.type === "text")
        .map((p) => p.text)
        .join(" ");
    }
  }
  return "";
}

async function createKingdomToolLoopAgent(input: RunKingdomAgentInput) {
  const {
    session,
    messages,
    provider,
    apiKey,
    model,
    mode = "venus",
    projectInstructions = "",
    globalInstructions = "",
  } = input;

  const { model: aiModel, providerName, selectedModel } = createKingdomModel(
    provider,
    apiKey,
    model ?? "",
  );

  let personaPrompt = projectInstructions;
  if (mode === "innocent") {
    personaPrompt = stripSpicyCanon(personaPrompt);
  }
  if (globalInstructions) {
    personaPrompt = `[GLOBAL EMPIRE RULES]\n${globalInstructions}\n\n${personaPrompt}`;
  }

  const userPrompt = lastUserText(messages);
  const accountRouting = await loadCliModule<{
    isVaultReadOnlyPrompt: (p: string) => boolean;
  }>("lib/blxckchat/account-routing.js");

  const useTextOnlyVault = accountRouting.isVaultReadOnlyPrompt(userPrompt);

  const systemPrompt = await buildKingdomSystemPrompt({
    userPrompt,
    personaSystemPrompt: personaPrompt || undefined,
    conversationHistory: await extractHistoryContext(messages),
    session,
  });

  const aiMessages = normalizeMessagesForAiSdk(messages, provider, selectedModel);
  const tools = useTextOnlyVault ? undefined : await buildKingdomAiTools();

  if (useTextOnlyVault) {
    return {
      mode: "text-only" as const,
      aiModel,
      aiMessages,
      systemPrompt,
      providerName,
      selectedModel,
    };
  }

  const agent = new ToolLoopAgent({
    model: aiModel,
    tools: tools ?? {},
    instructions: systemPrompt,
    stopWhen: stepCountIs(8),
  });

  return {
    mode: "tool-loop" as const,
    agent,
    aiMessages,
    providerName,
    selectedModel,
  };
}

export async function runKingdomAgent(
  input: RunKingdomAgentInput,
): Promise<RunKingdomAgentResult> {
  const prepared = await createKingdomToolLoopAgent(input);
  const { providerName, selectedModel } = prepared;

  try {
    if (prepared.mode === "text-only") {
      const result = await generateText({
        model: prepared.aiModel,
        system: prepared.systemPrompt,
        messages: prepared.aiMessages as never,
      });
      return {
        text: result.text || "♡ Task complete.",
        provider: providerName,
        model: selectedModel,
        steps: 1,
      };
    }

    const result = await prepared.agent.generate({
      messages: prepared.aiMessages as never,
    });

    return {
      text: result.text || "♡ Task complete.",
      provider: providerName,
      model: selectedModel,
      steps: result.steps?.length ?? 0,
    };
  } catch (err) {
    throw new Error(formatKingdomAgentError(err, providerName, selectedModel));
  }
}

/**
 * Run the full tool loop (generate), then stream the answer to the client in
 * small chunks for a typewriter effect. ToolLoopAgent.stream() often yields an
 * empty textStream after tool steps — generate is authoritative.
 */
/** Emit incremental deltas — clients append chunks (consumeTextStream). */
export function buildKingdomAgentTypewriterStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const body = text.trim() || "♡ Task complete.";

  return new ReadableStream({
    async start(controller) {
      let cursor = 0;
      while (cursor < body.length) {
        const next = Math.min(cursor + TYPEWRITER_CHUNK, body.length);
        controller.enqueue(encoder.encode(body.slice(cursor, next)));
        cursor = next;
        if (cursor < body.length) {
          await new Promise((resolve) => setTimeout(resolve, TYPEWRITER_DELAY_MS));
        }
      }
      controller.close();
    },
  });
}

export async function runKingdomAgentStreamResponse(
  input: RunKingdomAgentInput,
  headers: Record<string, string> = {},
): Promise<Response> {
  const result = await runKingdomAgent(input);

  return new Response(buildKingdomAgentTypewriterStream(result.text), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Provider": result.provider,
      "X-Model": result.model,
      "X-BLXCKCHAT-Agent": "kingdom",
      ...headers,
    },
  });
}