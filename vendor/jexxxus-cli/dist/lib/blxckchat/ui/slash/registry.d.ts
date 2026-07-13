export interface SlashCommandDef {
    name: string;
    aliases?: string[];
    description: string;
    argumentHint?: string;
}
export declare const BUILTIN_SLASH_COMMANDS: readonly SlashCommandDef[];
export declare function resolveSlashCommandName(token: string): string | null;
/** True when the typed token is an exact command name or alias (e.g. "providers" → connect). */
export declare function resolveExactCommandToken(token: string): string | null;
export declare function getSlashCommand(name: string): SlashCommandDef | undefined;
export declare function formatSlashHelp(): string;
//# sourceMappingURL=registry.d.ts.map