import * as fs from "fs";
import * as path from "path";
import { getCredentialsDir } from "../../../auth.js";
import { exportSessionToFile } from "./session-store.js";
const AUTOSAVE_INTERVAL = 30;
export function getAutosavePath() {
    return path.join(getCredentialsDir(), "session-autosave.json");
}
export function shouldAutosave(messageCount) {
    return messageCount > 0 && messageCount % AUTOSAVE_INTERVAL === 0;
}
export function autosaveSession(session) {
    return exportSessionToFile(session, getAutosavePath());
}
export function loadAutosaveSession() {
    const target = getAutosavePath();
    if (!fs.existsSync(target))
        return null;
    try {
        const raw = fs.readFileSync(target, "utf-8");
        const data = JSON.parse(raw);
        return {
            messages: data.messages ?? [],
            toolResults: (data.toolResults ?? []).map((t) => ({
                id: t.id,
                toolName: t.toolName,
                result: t.result,
                status: t.status,
                timestamp: new Date(t.timestamp),
            })),
            thinkingBlocks: data.thinkingBlocks ?? [],
            conversationHistory: data.conversationHistory ?? [],
            activeDivinity: data.activeDivinity ?? null,
        };
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=autosave.js.map