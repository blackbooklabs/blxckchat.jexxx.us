import type { ToolCallRepairFunction, ToolSet } from "ai";

const CONTACT_NAMED_IN_TEXT =
  /\b(?:named|called)\s+"?([A-Za-z][A-Za-z0-9' -]+?)"?(?:\s+and\b|\s+with\b|\s+to\b|\s*[.?!]|$)/i;
const CONTACT_DELETE_IN_TEXT =
  /\b(?:delete|remove|purge|dissolve|sever)\s+(?:contact\s+)?"?([A-Za-z][A-Za-z0-9' -]+?)"?(?:\s+from\b|\s*[.?!]|$)/i;
const CONTACT_CREATE_IN_TEXT =
  /\b(?:create|add|beget|make)\s+(?:a\s+)?(?:new\s+)?(?:test\s+)?contact\s+(?:named\s+|called\s+)?([A-Za-z][A-Za-z0-9' -]{1,40})/i;
const CONTACT_PHONE_UPDATE_IN_TEXT =
  /\b(?:set|update)\s+([A-Za-z][A-Za-z0-9' -]{1,40})'?s?\s+phone(?:\s+number)?\s+to\s+([+\d][\d\s().-]{6,})/i;
const PHONE_NUMBER_TO_IN_TEXT =
  /\bphone(?:\s+number)?\s+to\s+([+\d][\d\s().-]{6,})/i;

type RepairMessage = {
  role: string;
  content: string | Array<{ type: string; text?: string }>;
};

function lastUserText(messages: RepairMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "user") continue;
    if (typeof message.content === "string") return message.content;
    if (Array.isArray(message.content)) {
      return message.content
        .filter((part) => part.type === "text")
        .map((part) => part.text ?? "")
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

function extractContactDeleteFromText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const deleteMatch = CONTACT_DELETE_IN_TEXT.exec(trimmed);
  return deleteMatch?.[1]?.trim() ?? null;
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

function extractPhoneUpdateFromText(
  text: string,
): { contactName: string; phone: string } | { phone: string } | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const namedMatch = CONTACT_PHONE_UPDATE_IN_TEXT.exec(trimmed);
  if (namedMatch?.[1] && namedMatch[2]) {
    return { contactName: namedMatch[1].trim(), phone: namedMatch[2].trim() };
  }

  const phoneOnly = PHONE_NUMBER_TO_IN_TEXT.exec(trimmed);
  if (phoneOnly?.[1]) return { phone: phoneOnly[1].trim() };

  return null;
}

function resolveUpdatesFromArgs(args: Record<string, unknown>): Record<string, unknown> {
  const updates =
    typeof args.updates === "object" && args.updates !== null
      ? { ...(args.updates as Record<string, unknown>) }
      : {};
  if (typeof args.phone === "string" && updates.phone === undefined) {
    updates.phone = args.phone;
  }
  if (typeof args.phoneNumber === "string" && updates.phone === undefined) {
    updates.phone = args.phoneNumber;
  }
  if (typeof args.email === "string" && updates.email === undefined) {
    updates.email = args.email;
  }
  if (typeof args.notes === "string" && updates.notes === undefined) {
    updates.notes = args.notes;
  }
  return updates;
}

/**
 * Repair flaky provider tool calls — especially add_contact missing `name`
 * (common with HuggingFace-routed MiniMax and similar models).
 */
export const repairKingdomToolCall: ToolCallRepairFunction<ToolSet> = async ({
  toolCall,
  messages,
}) => {
  const userText = lastUserText(messages as RepairMessage[]);
  const args = parseToolInput(toolCall.input);

  if (toolCall.toolName === "add_contact") {
    const existing = resolveNameFromArgs(args);
    if (existing) return null;

    const fromUser = extractContactNameFromText(userText);
    if (!fromUser) return null;

    return {
      ...toolCall,
      input: JSON.stringify({ ...args, name: fromUser }),
    };
  }

  if (toolCall.toolName === "delete_contact") {
    const contactName = resolveNameFromArgs(args);
    const fromUser = extractContactDeleteFromText(userText);
    const patched: Record<string, unknown> = { ...args };
    if (!patched.target) patched.target = "blxckbook";
    if (!contactName && fromUser) patched.contactName = fromUser;

    const changed =
      patched.target !== args.target || patched.contactName !== args.contactName;
    if (!changed) return null;

    return {
      ...toolCall,
      input: JSON.stringify(patched),
    };
  }

  if (toolCall.toolName === "update_contact") {
    const updates = resolveUpdatesFromArgs(args);
    const hasPhone =
      typeof updates.phone === "string" && String(updates.phone).trim().length > 0;
    const contactName = resolveNameFromArgs(args);
    const phoneHint = extractPhoneUpdateFromText(userText);

    const patched: Record<string, unknown> = { ...args };
    if (!patched.target) patched.target = "blxckbook";
    if (!contactName && phoneHint && "contactName" in phoneHint) {
      patched.contactName = phoneHint.contactName;
    }
    if (!hasPhone && phoneHint) {
      updates.phone = phoneHint.phone;
    }

    const nextUpdates = Object.keys(updates).length > 0 ? updates : undefined;
    if (nextUpdates) patched.updates = nextUpdates;
    if (typeof patched.phone === "string" && nextUpdates?.phone) {
      delete patched.phone;
      delete patched.phoneNumber;
    }

    const changed =
      patched.target !== args.target ||
      patched.contactName !== args.contactName ||
      JSON.stringify(patched.updates ?? {}) !== JSON.stringify(args.updates ?? {});
    if (!changed) return null;

    return {
      ...toolCall,
      input: JSON.stringify(patched),
    };
  }

  return null;
};