/** Remove lines that are only a stray closing paren (streaming/markdown artifact). */
export declare function stripOrphanParenLines(text: string): string;
/** Drop lines that look like scattered single-letter streaming garbage. */
export declare function stripSpacedLetterGarbageLines(text: string): string;
export declare function sanitizeRoleplayProse(text: string): string;
//# sourceMappingURL=prose-sanitize.d.ts.map