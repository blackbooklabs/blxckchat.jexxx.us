import * as fs from "fs";
import * as os from "os";
import * as path from "path";
const AUDIT_LOG_PATH = path.join(os.homedir(), ".jexxxus", "blxckchat-audit.log");
/** Redact PII from tool arguments before logging (file paths, vault terms, user IDs). */
function redactArguments(toolName, args) {
    const redacted = { ...args };
    if (toolName === "account_query") {
        if (redacted.contactName)
            redacted.contactName = "[REDACTED]";
        if (redacted.asUserId)
            redacted.asUserId = "[REDACTED]";
        if (redacted.playlistName)
            redacted.playlistName = "[REDACTED]";
    }
    if (toolName === "bible_query" && redacted.query) {
        redacted.query = "[REDACTED]";
    }
    if (toolName === "run_shell" && redacted.command) {
        redacted.command = "[REDACTED]";
    }
    return redacted;
}
/** Append-only JSONL audit trail of every tool call BLXCKCHAT attempts. */
export function recordAudit(entry) {
    const dir = path.dirname(AUDIT_LOG_PATH);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    const redactedArgs = redactArguments(entry.toolName, entry.arguments);
    const fullEntry = {
        timestamp: new Date().toISOString(),
        ...entry,
        arguments: redactedArgs,
    };
    fs.appendFileSync(AUDIT_LOG_PATH, JSON.stringify(fullEntry) + "\n", {
        mode: 0o600,
    });
}
//# sourceMappingURL=audit.js.map