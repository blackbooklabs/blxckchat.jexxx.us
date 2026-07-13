import type { Provider, ProviderConfig } from "./types.js";
/**
 * Anthropic Messages API tool-calling adapter. Maps our provider-agnostic
 * ChatMessage/ToolDefinition shape onto Anthropic's tool_use content blocks.
 */
export declare function createAnthropicProvider(config: ProviderConfig): Provider;
//# sourceMappingURL=anthropic.d.ts.map