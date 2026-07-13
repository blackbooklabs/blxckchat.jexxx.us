export declare function isPickerSlashCommand(commandName: string): boolean;
/**
 * Picker commands with no typed argument should not populate the slash popup;
 * the user presses Enter to open the modal picker instead.
 */
export declare function shouldSuppressSlashArgumentSuggestions(commandName: string, argFilter: string): boolean;
//# sourceMappingURL=picker-commands.d.ts.map