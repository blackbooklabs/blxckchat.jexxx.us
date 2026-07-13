/**
 * Kingdom Agent — JEXXXUS | CLI parity for blxckchat.jexxx.us
 * Clerk-scoped vault CRUD + VEIL/TV/Bible/Law tools via jexxxus-cli registry.
 */
export const runtime = "nodejs";
export const maxDuration = 120;

import { ToolLoopAgent, stepCountIs } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createXai } from "@ai-sdk/xai";
import { HF_INFERENCE_ROUTER_BASE } from "@/lib/provider-models";
import {
  normalizeMessagesForAiSdk,
  type IncomingChatMessage,
} from "@/lib/chat-message-normalizer";
import { buildKingdomAiTools } from "@/lib/kingdom-agent/ai-tools";
import {
  buildKingdomSystemPrompt,
  extractHistoryContext,
} from "@/lib/kingdom-agent/build-prompt";
import { resolveWebAccountSession } from "@/lib/kingdom-agent/web-session";
import { stripSpicyCanon } from "@/lib/spicy-mode";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Provider, x-openai-key, x-grok-key, x-gemini-key, x-kimi-key, x-groq-key, x-openrouter-key, x-kingdom-key, x-anthropic-key, x-ollama-url",
};

type AgentProvider =
  | "openai"
  | "anthropic"
  | "grok"
  | "gemini"
  | "kimi"
  | "groq"
  | "openrouter"
  | "ollama"
  | "bonsai"
  | "kingdom";

const PROVIDERS: Record<
  AgentProvider,
  {
    name: string;
    keyHeader: string;
    createProvider: (apiKey: string) => ReturnType<typeof createOpenAI>;
    defaultModel: string;
  }
> = {
  openai: {
    name: "GPT (OpenAI)",
    keyHeader: "x-openai-key",
    createProvider: (apiKey) => createOpenAI({ apiKey }),
    defaultModel: "gpt-4.1",
  },
  anthropic: {
    name: "Claude (Anthropic)",
    keyHeader: "x-anthropic-key",
    createProvider: (apiKey) => createAnthropic({ apiKey }) as never,
    defaultModel: "claude-sonnet-4-6",
  },
  grok: {
    name: "Grok (xAI)",
    keyHeader: "x-grok-key",
    createProvider: (apiKey) => createXai({ apiKey }) as never,
    defaultModel: "grok-3",
  },
  gemini: {
    name: "Gemini (Google)",
    keyHeader: "x-gemini-key",
    createProvider: (apiKey) => createGoogleGenerativeAI({ apiKey }) as never,
    defaultModel: "gemini-2.5-flash",
  },
  kimi: {
    name: "Kimi (Moonshot)",
    keyHeader: "x-kimi-key",
    createProvider: (apiKey) =>
      createOpenAI({
        apiKey,
        baseURL: "https://api.moonshot.ai/v1",
        compatibility: "compatible",
      } as never),
    defaultModel: "kimi-k2-0711",
  },
  groq: {
    name: "Groq",
    keyHeader: "x-groq-key",
    createProvider: (apiKey) => createGroq({ apiKey }) as never,
    defaultModel: "llama-3.3-70b-versatile",
  },
  openrouter: {
    name: "OpenRouter",
    keyHeader: "x-openrouter-key",
    createProvider: (apiKey) => createOpenRouter({ apiKey }) as never,
    defaultModel: "openrouter/auto",
  },
  ollama: {
    name: "Ollama",
    keyHeader: "x-ollama-url",
    createProvider: (url) => {
      let host = url?.trim() || "http://localhost:11434";
      if (!host.endsWith("/v1")) {
        host = host.replace(/\/$/, "");
        host = host.endsWith("/api") ? host.replace(/\/api$/, "/v1") : `${host}/v1`;
      }
      return createOpenAI({ apiKey: "ollama", baseURL: host, compatibility: "compatible" } as never);
    },
    defaultModel: "llama3",
  },
  bonsai: {
    name: "Bonsai 1-bit",
    keyHeader: "x-bonsai-key",
    createProvider: () =>
      createOpenAI({
        apiKey: "bonsai",
        baseURL: "http://localhost:8080/v1",
        compatibility: "compatible",
      } as never),
    defaultModel: "Bonsai-8B.gguf",
  },
  kingdom: {
    name: "Hugging Face",
    keyHeader: "x-kingdom-key",
    createProvider: (apiKey) =>
      createOpenAI({
        apiKey: apiKey || process.env.HF_TOKEN || "",
        baseURL: HF_INFERENCE_ROUTER_BASE,
        compatibility: "compatible",
      } as never),
    defaultModel: "google/gemma-4-26B-A4B-it",
  },
};

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

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const sessionResult = await resolveWebAccountSession();
    if (!sessionResult.ok) {
      return new Response(
        JSON.stringify({
          error: "Authentication Required",
          message: sessionResult.message,
          signature: "♡ BLXCKCHAT Kingdom Agent",
        }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const body = await req.json();
    const {
      messages = [],
      provider = "openai",
      model,
      mode = "venus",
      projectInstructions = "",
      globalInstructions = "",
    } = body;

    const providerKey = provider as AgentProvider;
    const providerConfig = PROVIDERS[providerKey];
    if (!providerConfig) {
      return new Response(
        JSON.stringify({ error: "Invalid provider", message: `Unknown provider: ${provider}` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const apiKey = req.headers.get(providerConfig.keyHeader);
    if (!apiKey && providerKey !== "bonsai" && providerKey !== "ollama") {
      return new Response(
        JSON.stringify({
          error: "API Key Required",
          message: `Provide ${providerConfig.name} key in ${providerConfig.keyHeader}`,
        }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const selectedModel = model || providerConfig.defaultModel;
    const aiProvider = providerConfig.createProvider(apiKey ?? "");

    let personaPrompt = projectInstructions as string;
    if (mode === "innocent") {
      personaPrompt = stripSpicyCanon(personaPrompt);
    }
    if (globalInstructions) {
      personaPrompt = `[GLOBAL EMPIRE RULES]\n${globalInstructions}\n\n${personaPrompt}`;
    }

    const userPrompt = lastUserText(messages as IncomingChatMessage[]);
    const systemPrompt = await buildKingdomSystemPrompt({
      userPrompt,
      personaSystemPrompt: personaPrompt || undefined,
      conversationHistory: await extractHistoryContext(messages),
      session: sessionResult.session,
    });

    const aiMessages = normalizeMessagesForAiSdk(
      messages as IncomingChatMessage[],
      providerKey,
      selectedModel,
    );

    const tools = await buildKingdomAiTools();
    const agent = new ToolLoopAgent({
      model: aiProvider(selectedModel),
      tools,
      instructions: systemPrompt,
      stopWhen: stepCountIs(8),
    });

    const result = await agent.generate({
      messages: aiMessages as never,
    });

    return new Response(
      JSON.stringify({
        text: result.text || "♡ Task complete.",
        provider: providerConfig.name,
        model: selectedModel,
        agent: true,
        steps: result.steps?.length ?? 0,
        signature: "♡💦 BLXCKCHAT Kingdom Agent",
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error) {
    console.error("[Kingdom Agent] Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        error: "Agent Failed",
        message,
        signature: "♡ BLXCKCHAT Kingdom Agent",
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
}