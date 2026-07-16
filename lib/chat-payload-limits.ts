import type { Message } from "@/store/useChatStore";

/** Stay under Vercel ~4.5MB request body limit (leave room for instructions). */
export const MAX_API_PAYLOAD_BYTES = 3_500_000;
export const MAX_API_HISTORY_MESSAGES = 48;
export const MAX_API_MESSAGE_CHARS = 12_000;
export const MAX_API_PROJECT_INSTRUCTIONS_CHARS = 80_000;

/**
 * Repair text corrupted by the cumulative typewriter bug (full prefixes appended).
 * Returns the last clean copy when the tail repeats earlier in the string.
 */
export function repairTypewriterCorruptedText(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length < 2048) return trimmed;

  const maxLen = Math.min(trimmed.length, 400_000);
  for (let len = Math.floor(maxLen * 0.15); len <= maxLen; len += 256) {
    const tail = trimmed.slice(-len);
    if (tail.length < 256) continue;
    const first = trimmed.indexOf(tail);
    const last = trimmed.lastIndexOf(tail);
    if (last === trimmed.length - len && first >= 0 && first < last) {
      return tail;
    }
    if (first === last && last === trimmed.length - len) {
      return tail;
    }
  }

  return trimmed.slice(-MAX_API_MESSAGE_CHARS);
}

export function sanitizeMessageTextForApi(text: string): string {
  let next = text.trim();
  if (next.length > MAX_API_MESSAGE_CHARS * 2) {
    next = repairTypewriterCorruptedText(next);
  }
  if (next.length > MAX_API_MESSAGE_CHARS) {
    next = `… [message truncated]\n\n${next.slice(-MAX_API_MESSAGE_CHARS)}`;
  }
  return next;
}

export function trimProjectInstructionsForApi(instructions: string): string {
  const trimmed = instructions.trim();
  if (trimmed.length <= MAX_API_PROJECT_INSTRUCTIONS_CHARS) return trimmed;
  return `${trimmed.slice(0, MAX_API_PROJECT_INSTRUCTIONS_CHARS)}\n\n… [persona instructions truncated for request size]`;
}

export function trimMessagesForApi(history: Message[]): Message[] {
  const recent = history.slice(-MAX_API_HISTORY_MESSAGES);
  return recent.map((m) => ({
    ...m,
    text: sanitizeMessageTextForApi(m.text || ""),
    attachments: m.attachments?.filter((a) => a.type !== "image" || !a.url?.startsWith("data:")),
  }));
}

export function estimateJsonBytes(value: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).length;
  } catch {
    return MAX_API_PAYLOAD_BYTES + 1;
  }
}