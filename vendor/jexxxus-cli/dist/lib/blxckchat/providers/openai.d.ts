import type { Provider, ProviderConfig } from "./types.js";
/**
 * OpenAI Chat Completions adapter (function calling). Also used for Ollama,
 * which exposes an OpenAI-compatible /v1/chat/completions endpoint — see
 * createOllamaProvider() in ollama.ts, which just points baseURL here.
 */
export declare function createOpenAIProvider(config: ProviderConfig): Provider;
//# sourceMappingURL=openai.d.ts.map