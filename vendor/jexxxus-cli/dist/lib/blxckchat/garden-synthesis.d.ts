import type { ChatMessage } from "./providers/types.js";
export interface GardenToolResultSummary {
    tool: "veil_query" | "tv_query" | "bible_query";
    result: string;
}
export declare const GARDEN_SYNTHESIS_NUDGE: string;
/** Remove generic meta continuation offers from persona replies. */
export declare function stripMetaContinuationPrompts(content: string): string;
/** Successful veil/tv/bible tool payloads since the latest user message. */
export declare function collectGardenToolResultsSinceUser(messages: ChatMessage[]): GardenToolResultSummary[];
/** True when garden tools returned data but the assistant reply ignored them. */
export declare function needsGardenSynthesis(assistantContent: string, toolResults: GardenToolResultSummary[]): boolean;
//# sourceMappingURL=garden-synthesis.d.ts.map