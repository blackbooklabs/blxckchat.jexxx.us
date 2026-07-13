import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "node:crypto";
import { getCredentialsDir } from "../../../auth.js";
export function createSession() {
    return {
        messages: [],
        toolResults: [],
        thinkingBlocks: [],
        conversationHistory: [],
        activeDivinity: null,
    };
}
export function addUserMessage(session, content) {
    const message = {
        id: randomUUID(),
        role: "user",
        content,
    };
    session.messages.push(message);
    return message;
}
export function addAssistantMessage(session, content) {
    const message = {
        id: randomUUID(),
        role: "assistant",
        content,
    };
    session.messages.push(message);
    return message;
}
export function addToolResult(session, toolName, result, status) {
    const entry = {
        id: randomUUID(),
        toolName,
        result,
        status,
        timestamp: new Date(),
    };
    session.toolResults.push(entry);
    return entry;
}
export function updateToolResult(session, toolName, result, status) {
    const pending = [...session.toolResults]
        .reverse()
        .find((t) => t.toolName === toolName && t.status === "pending");
    if (pending) {
        pending.result = result;
        pending.status = status;
        pending.timestamp = new Date();
        return pending;
    }
    return addToolResult(session, toolName, result, status);
}
/** Filesystem-safe ISO timestamp for default /save export filenames. */
export function formatSessionExportTimestamp(date = new Date()) {
    return date.toISOString().replace(/:/g, "-").replace(/\.\d{3}Z$/, "Z");
}
export function getDefaultSessionExportPath(now = new Date()) {
    const stamp = formatSessionExportTimestamp(now);
    return path.join(getCredentialsDir(), `session-export-${stamp}.json`);
}
export function exportSessionToFile(session, filePath) {
    const target = filePath ?? getDefaultSessionExportPath();
    const dir = path.dirname(target);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    }
    const payload = {
        exportedAt: new Date().toISOString(),
        messages: session.messages,
        toolResults: session.toolResults.map((t) => ({
            ...t,
            timestamp: t.timestamp.toISOString(),
        })),
        thinkingBlocks: session.thinkingBlocks,
        conversationHistory: session.conversationHistory,
        activeDivinity: session.activeDivinity ?? null,
    };
    fs.writeFileSync(target, JSON.stringify(payload, null, 2), { mode: 0o600 });
    return target;
}
//# sourceMappingURL=session-store.js.map