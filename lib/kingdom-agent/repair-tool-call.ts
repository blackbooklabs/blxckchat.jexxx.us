import type { LanguageModelV3ToolCall } from "@ai-sdk/provider";
import type { ModelMessage } from "@ai-sdk/provider-utils";
import type { ToolCallRepairFunction } from "ai";
import type { ToolSet } from "ai";

const CONTACT_NAMED_IN_TEXT =
  /\b(?:named|called)\s+([A-Za-z][A-Za-z0-9' -]{1,40})(?:\s*[.?!]|$)/i;
const CONTACT_CREATE_IN_TEXT =
  /\b(?:create|add|beget|make)\s+(?:a\s+)?(?:new\s+)?(?:test\s+)?contact\s+(?:named\s+|called\s+)?([A-Za-z][A-Za-z0-9' -]{1,40})/i;

function lastUserText(messages: ModelMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "user") continue;
    if (typeof message.content === "string") return message.content;
    if (Array.isArray(message.content)) {
      return message.content
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join(" ");
    }
  }
  return "";
}

function extractContactNameFromText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const createMatch = CONTACT_CREATE_IN_TEXT.exec(trimmed);
  if (createMatch?.[1]) return createMatch[1].trim();

  const namedMatch = CONTACT_NAMED_IN_TEXT.exec(trimmed);
  if (namedMatch?.[1]) return namedMatch[1].trim();

  return null;
}

function parseToolInput(input: string): Record<string, unknown> {
  const trimmed = input.trim();
  if (!trimmed) return {};
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function resolveNameFromArgs(args: Record<string, unknown>): string {
  for (const key of ["name", "contactName", "displayName", "fullName", "contact_name"]) {
    const value = args[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

/**
 * Repair flaky provider tool calls — especially add_contact missing `name`
 * (common with MiniMax-M3 and similar models).
 */
export const repairKingdomToolCall: ToolCallRepairFunction<ToolSet> = async ({
  toolCall,
  messages,
}) => {
  if (toolCall.toolName !== "add_contact") return null;

  const args = parseToolInput(toolCall.input);
  const existing = resolveNameFromArgs(args);
  if (existing) return null;

  const fromUser = extractContactNameFromText(lastUserText(messages));
  if (!fromUser) return null;

  return {
    ...toolCall,
    input: JSON.stringify({ ...args, name: fromUser }),
  };
};