import type { StoredProviderConfig } from "../../config.js";
import { type ModelOption } from "../../providers/models.js";
export interface SlashSuggestion {
    value: string;
    label: string;
    description: string;
    /** Start BYOK setup for this catalog id (does not fill input). */
    connectProvider?: string;
}
export interface SlashAutocompleteContext {
    activeConfig: StoredProviderConfig;
    modelOptions?: ModelOption[];
}
export declare function getCommandSuggestions(filter: string): SlashSuggestion[];
export declare function getArgumentSuggestions(commandName: string, argFilter: string, ctx: SlashAutocompleteContext): Promise<SlashSuggestion[]>;
export type SlashInputMode = "none" | "command" | "argument";
export declare function detectSlashInputMode(value: string): {
    mode: SlashInputMode;
    commandName: string;
    commandFilter: string;
    argFilter: string;
};
export declare function getSlashSuggestions(value: string, ctx: SlashAutocompleteContext): Promise<SlashSuggestion[]>;
//# sourceMappingURL=autocomplete.d.ts.map