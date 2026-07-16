import type { Message } from '@/store/useChatStore';
import {
  estimateJsonBytes,
  MAX_API_PAYLOAD_BYTES,
  sanitizeMessageTextForApi,
  trimMessagesForApi,
} from '@/lib/chat-payload-limits';

export interface ApiChatMessage {
  role: 'user' | 'assistant';
  content: string | Array<{ type: 'text' | 'image'; text?: string; image?: string; mimeType?: string }>;
}

export function messageToApiContent(m: Message): ApiChatMessage['content'] {
  const images =
    m.attachments?.filter((a) => a.type === 'image' && a.url) ?? [];

  if (images.length === 0) {
    return m.text;
  }

  return [
    { type: 'text' as const, text: m.text || ' ' },
    ...images.map((img) => ({
      type: 'image' as const,
      image: img.url!,
      mimeType: img.mimeType,
    })),
  ];
}

export function buildApiMessagesFromHistory(
  history: Message[],
  pendingUser?: { text: string; images: { name: string; data: string; mimeType?: string }[] },
): ApiChatMessage[] {
  const trimmedHistory = trimMessagesForApi(history);
  const apiMessages: ApiChatMessage[] = trimmedHistory.map((m) => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: messageToApiContent(m),
  }));

  if (pendingUser) {
    const safeText = sanitizeMessageTextForApi(pendingUser.text);
    const content =
      pendingUser.images.length > 0
        ? [
            { type: 'text' as const, text: safeText },
            ...pendingUser.images.map((img) => ({
              type: 'image' as const,
              image: img.data,
              mimeType: img.mimeType || 'image/jpeg',
            })),
          ]
        : safeText;

    apiMessages.push({ role: 'user', content });
  }

  while (
    apiMessages.length > 2 &&
    estimateJsonBytes(apiMessages) > MAX_API_PAYLOAD_BYTES
  ) {
    apiMessages.shift();
  }

  return apiMessages;
}

export function collectPriorModelLabels(messages: Message[]): string[] {
  const labels = new Set<string>();
  for (const m of messages) {
    if (m.sender === 'other' && (m.providerUsed || m.modelUsed)) {
      labels.add(
        [m.providerUsed, m.modelUsed].filter(Boolean).join(' / '),
      );
    }
  }
  return [...labels];
}