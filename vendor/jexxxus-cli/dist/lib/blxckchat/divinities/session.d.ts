import type { TerminalSession } from "../ui/session/session-store.js";
import type { DivinityPersona } from "./source.js";
export interface ActiveDivinity {
    id: string;
    name: string;
    role?: string;
    pillar?: string;
}
export declare function getActiveDivinity(session: TerminalSession): ActiveDivinity | null;
/** Switch persona — clears chat history so the new voice starts fresh. */
export declare function activateDivinityPersona(session: TerminalSession, persona: DivinityPersona): void;
export declare function clearActiveDivinity(session: TerminalSession): void;
export declare function formatDivinityActivationMessage(persona: DivinityPersona): string;
export declare function formatDivinityClearedMessage(): string;
//# sourceMappingURL=session.d.ts.map