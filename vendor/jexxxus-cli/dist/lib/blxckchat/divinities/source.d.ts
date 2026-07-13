export declare function getDivinitiesSearchPaths(): string[];
export interface DivinityPersona {
    id: string;
    name: string;
    role?: string;
    type?: string;
    pillar?: string;
    relativePath: string;
    systemPrompt: string;
}
export declare function resolveDivinitiesRoot(): string | null;
/** Load all persona entries from the Obsidian Divinities vault. */
export declare function listDivinityPersonas(forceReload?: boolean): DivinityPersona[];
export declare function findDivinityPersona(query: string): DivinityPersona | null;
export declare function getDivinityPersonaById(id: string): DivinityPersona | null;
/** Reset cached persona index (for tests). */
export declare function clearDivinityPersonaCache(): void;
//# sourceMappingURL=source.d.ts.map