export interface AuditEntry {
    timestamp: string;
    toolName: string;
    arguments: Record<string, unknown>;
    confirmed: boolean;
    outcome: "executed" | "declined" | "blocked" | "error";
    elevated?: boolean;
    resultPreview?: string;
}
/** Append-only JSONL audit trail of every tool call BLXCKCHAT attempts. */
export declare function recordAudit(entry: Omit<AuditEntry, "timestamp">): void;
//# sourceMappingURL=audit.d.ts.map