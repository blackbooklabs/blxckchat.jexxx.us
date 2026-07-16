import { ToolLoopAgent, stepCountIs } from "ai";
import {
  normalizeMessagesForAiSdk,
  type IncomingChatMessage,
} from "@/lib/chat-message-normalizer";
import { buildKingdomAiTools } from "@/lib/kingdom-agent/ai-tools";
import {
  buildKingdomSystemPrompt,
  extractHistoryContext,
} from "@/lib/kingdom-agent/build-prompt";
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
  const systemPrompt = await buildKingdomSystemPrompt({
    userPrompt,
    personaSystemPrompt: personaPrompt || undefined,
    conversationHistory: await extractHistoryContext(messages),
    session,
  });

  const aiMessages = normalizeMessagesForAiSdk(messages, provider, selectedModel);
  const tools = await buildKingdomAiTools();

  const agent = new ToolLoopAgent({
    model: aiModel,
    tools,
    instructions: systemPrompt,
    stopWhen: stepCountIs(8),
  });

  return {
    agent,
    aiMessages,
    providerName,
    selectedModel,
  };
}

export async function runKingdomAgent(
  input: RunKingdomAgentInput,
): Promise<RunKingdomAgentResult> {
  const { agent, aiMessages, providerName, selectedModel } =
    await createKingdomToolLoopAgent(input);

  const result = await agent.generate({
    messages: aiMessages as never,
  });

  return {
    text: result.text || "♡ Task complete.",
    provider: providerName,
    model: selectedModel,
    steps: result.steps?.length ?? 0,
  };
}

/**
 * Run the full tool loop (generate), then stream the answer to the client in
 * small chunks for a typewriter effect. ToolLoopAgent.stream() often yields an
 * empty textStream after tool steps — generate is authoritative.
 */
export function buildKingdomAgentTypewriterStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const body = text.trim() || "♡ Task complete.";

  return new ReadableStream({
    async start(controller) {
      for (let end = TYPEWRITER_CHUNK; end <= body.length + TYPEWRITER_CHUNK; end += TYPEWRITER_CHUNK) {
        controller.enqueue(encoder.encode(body.slice(0, Math.min(end, body.length))));
        if (end < body.length) {
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