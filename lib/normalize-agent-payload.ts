import type { IncomingChatMessage } from "@/lib/chat-message-normalizer";
import {
  MAX_API_HISTORY_MESSAGES,
  MAX_API_PAYLOAD_BYTES,
  sanitizeMessageTextForApi,
  estimateJsonBytes,
} from "@/lib/chat-payload-limits";

function messageText(content: IncomingChatMessage["content"]): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join(" ");
}

function stripInlineImages(msg: IncomingChatMessage): IncomingChatMessage {
  if (!Array.isArray(msg.content)) return msg;
  const textParts = msg.content.filter((p) => p.type === "text");
  const joined = textParts.map((p) => p.text ?? "").join(" ").trim();
  return { ...msg, content: joined || " " };
}

export function normalizeMessagesForApiPayload(
  messages: IncomingChatMessage[],
): IncomingChatMessage[] {
  let next = messages
    .slice(-MAX_API_HISTORY_MESSAGES)
    .map((m) => {
      if (typeof m.content === "string") {
        return { ...m, content: sanitizeMessageTextForApi(m.content) };
      }
      const text = sanitizeMessageTextForApi(messageText(m.content));
      const hasImage = Array.isArray(m.content) && m.content.some((p) => p.type === "image");
      if (hasImage) {
        return stripInlineImages(m);
      }
      return { ...m, content: text };
    });

  while (next.length > 2 && estimateJsonBytes(next) > MAX_API_PAYLOAD_BYTES) {
    next = next.slice(1);
  }

  return next;
}