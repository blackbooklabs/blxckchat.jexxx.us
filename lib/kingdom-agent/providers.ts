import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createXai } from "@ai-sdk/xai";
import { HF_INFERENCE_ROUTER_BASE } from "@/lib/provider-models";
import type { ByokProviderId } from "@/lib/byok-settings-types";

export type AgentProvider = ByokProviderId;

export const KINGDOM_PROVIDERS: Record<
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

export function createKingdomModel(
  provider: AgentProvider,
  apiKey: string,
  model: string,
) {
  const config = KINGDOM_PROVIDERS[provider];
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  const selectedModel = model || config.defaultModel;
  const aiProvider = config.createProvider(apiKey ?? "");
  return { model: aiProvider(selectedModel), providerName: config.name, selectedModel };
}