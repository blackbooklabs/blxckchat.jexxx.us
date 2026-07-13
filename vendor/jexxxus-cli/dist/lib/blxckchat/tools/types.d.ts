export interface BlxckchatTool {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    requiresConfirmation: boolean;
    execute(args: Record<string, unknown>): Promise<string>;
}
//# sourceMappingURL=types.d.ts.map