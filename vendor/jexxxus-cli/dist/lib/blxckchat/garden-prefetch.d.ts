import { type KingdomRoutingOptions } from "./kingdom-routing.js";
/**
 * Pre-fetch companion scripture and TV/VEIL search hits for thematic garden asks.
 * Injected into the system prompt so smaller models can synthesize without
 * mis-calling bible_query (e.g. listing chapters) or tv_query list.
 */
export declare function prefetchGardenContext(userPrompt: string, options?: KingdomRoutingOptions): Promise<string | null>;
//# sourceMappingURL=garden-prefetch.d.ts.map