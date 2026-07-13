/**
 * Interactive y/n confirmation gate. Every tool marked requiresConfirmation
 * routes through here before execute() runs — the agent loop never
 * bypasses this, regardless of how confident the model's tool call looks.
 */
export declare function confirmToolCall(toolName: string, args: Record<string, unknown>): Promise<boolean>;
//# sourceMappingURL=confirm.d.ts.map