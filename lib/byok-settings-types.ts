export type ByokProviderId =
  | 'openai'
  | 'anthropic'
  | 'grok'
  | 'gemini'
  | 'kimi'
  | 'groq'
  | 'openrouter'
  | 'ollama'
  | 'bonsai'
  | 'kingdom';

export interface ByokProviderConfig {
  apiKey: string;
  model: string;
  availableModels: string[];
}

export interface UserByokSettings {
  activeProvider: ByokProviderId;
  providersConfig: Record<ByokProviderId, ByokProviderConfig>;
  globalContext: string;
  autoPatternVisions: boolean;
  isSpicy: boolean;
  webSearchEnabled: boolean;
  updatedAt?: string;
}

export const BYOK_SETTINGS_VERSION = 1;