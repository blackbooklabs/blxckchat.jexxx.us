import type { Provider, ProviderConfig } from "./types.js";
/**
 * Ollama exposes an OpenAI-compatible /v1/chat/completions endpoint
 * (including the `tools` param on recent versions), so we reuse the OpenAI
 * adapter with baseUrl pointed at the local Ollama server. No API key
 * required — Ollama ignores the Authorization header entirely.
 */
export declare function createOllamaProvider(config: ProviderConfig): Provider;
//# sourceMappingURL=ollama.d.ts.map