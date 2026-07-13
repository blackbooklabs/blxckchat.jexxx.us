/** Max persona prompt chars injected into the system message. */
export declare const MAX_PERSONA_PROMPT_CHARS = 24000;
/** Pull ```md fenced blocks from the ## Extracts section (canon persona prompts). */
export declare function extractPersonaPrompt(markdown: string): string;
export declare function parsePersonaMetadata(markdown: string): {
    name: string;
    role?: string;
    type?: string;
};
//# sourceMappingURL=prompt.d.ts.map