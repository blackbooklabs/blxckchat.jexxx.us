/** BLXCKCHAT tools + slash commands surfaced in routing hints. */
export type RoutableTool = "tv_query" | "veil_query" | "bible_query" | "run_doctor" | "import_contacts" | "send_notification";
/** Thematic scripture to pair with TV/VEIL results (explicit Book Ch:V refs). */
export declare const COMPANION_VERSE_SETS: {
    readonly forgiveness: readonly ["1 John 1:9", "Luke 23:34", "Psalm 51:1"];
    readonly confession: readonly ["1 John 1:9", "James 5:16"];
    readonly clergy: readonly ["1 Timothy 3:2", "Hebrews 13:17"];
    readonly jezebel: readonly ["1 Kings 21:25", "Revelation 2:20"];
    readonly crucifixion: readonly ["Luke 23:34", "Matthew 27:46"];
    readonly adultery: readonly ["Proverbs 6:32", "Hebrews 13:4"];
    readonly church: readonly ["1 Corinthians 6:19", "Ephesians 5:23"];
    readonly proverbs31: readonly ["Proverbs 31:10", "Proverbs 31:30", "Proverbs 5:3"];
    readonly rachelLeah: readonly ["Genesis 29:16", "Genesis 29:17", "Genesis 29:25"];
};
export declare const MAX_COMPANION_VERSES = 4;
export type LawQueryHint = {
    action: "list" | "get" | "search";
    query?: string;
};
export interface PhraseCollision {
    id: string;
    pattern: RegExp;
    tools: RoutableTool[];
    exclude?: RoutableTool[];
    slashHints?: string[];
    /** Fitting bible_query refs to fetch alongside TV/VEIL (not instead of them). */
    companionVerses?: readonly string[];
    /** Explicit tv_query search string (series, tag, category). */
    tvSearchQuery?: string;
    /** Explicit veil_query search string (topic, title fragment). */
    veilSearchQuery?: string;
    /** Summarize docs.jexxx.us from RAG context — not a vault contact. */
    docsHint?: boolean;
    /** Suggested law_query call for law.jexxx.us policies. */
    lawQuery?: LawQueryHint;
    note: string;
}
export interface KingdomRoutingOptions {
    /** Recent user/assistant turns — used when the latest message is a short follow-up. */
    conversationContext?: string;
}
export interface KingdomToolPlan {
    tools: RoutableTool[];
    exclude: RoutableTool[];
    slashHints: string[];
    /** Distinct verse refs for separate bible_query action=query calls. */
    companionVerses: string[];
    /** Best tv_query search string for this prompt, if any. */
    tvSearchQuery: string | null;
    /** Best veil_query search string for this prompt, if any. */
    veilSearchQuery: string | null;
    docsHint: boolean;
    lawQuery: LawQueryHint | null;
    matchedRules: string[];
}
export declare const PHRASE_COLLISIONS: readonly PhraseCollision[];
/** Merge latest user message with recent transcript for routing/prefetch. */
export declare function buildKingdomRoutingText(userPrompt: string, options?: KingdomRoutingOptions): string;
/** Last N user/assistant lines for kingdom phrase detection on short follow-ups. */
export declare function extractRoutingContextFromHistory(messages: Array<{
    role: string;
    content: string;
}>, maxMessages?: number): string;
/** Resolve tv_query search text from routing plan + prompt. */
export declare function inferTvSearchQuery(prompt: string, plan: KingdomToolPlan): string | null;
/** Infer fitting companions when TV/VEIL matched but no row supplied verses. */
export declare function inferThemeCompanionVerses(prompt: string): string[];
/** Resolve veil_query search text from routing plan + prompt. */
export declare function inferVeilSearchQuery(prompt: string, plan: KingdomToolPlan): string | null;
/** Plan which kingdom tools fit a user message (deterministic, testable). */
export declare function planKingdomTools(userPrompt: string, options?: KingdomRoutingOptions): KingdomToolPlan;
/** Divinity names requested for multi-persona roleplay. */
export declare function detectNamedDivinities(text: string): string[];
/** Human-readable block appended to the system prompt for the current user turn. */
export declare function formatKingdomRoutingHint(userPrompt: string, options?: KingdomRoutingOptions): string | null;
export declare const KINGDOM_COLLISION_TABLE_EXCERPT = "### Phrase collision quick reference\n| Phrase | Tools + companions |\n| Forgive Me Father, Deviante | tv_query search + bible_query (1 John 1:9, Luke 23:34, Psalm 51:1) |\n| Pastor's Wife, Nuns, In Church | tv_query + fitting bible_query verses |\n| corruption, confession (VEIL) | veil_query + bible_query (1 John 1:9, James 5:16) |\n| Jezebel, Hannah, Bathsheba | veil_query + /divinities + bible_query companions |\n| 1 John 1:9 alone | bible_query only |\n| latest VEIL and TV (catalog) | veil_query list + tv_query list (no scripture unless themed) |\n| database up / doctor | run_doctor |";
export declare const KINGDOM_CONTENT_ROUTING = "## Kingdom/Garden content routing (pick every relevant tool)\n\n- **Docs (docs.jexxx.us)** \u2014 Public reference library (architecture, CLI, platform). Use the RAG documentation context injected below; **never** treat \"Docs\" as a BLXCKBOOK contact name.\n- **law_query** \u2014 Public legal policies on law.jexxx.us (Terms, Privacy, Refunds, DMCA). Never fabricate policy text.\n- **tv_query** \u2014 JEXXXUS | TV videos on tv.jexxx.us. Channels, series, tags, titles (Forgive Me Father, Deviante, categories).\n- **veil_query** \u2014 VEIL articles on veil.jexxx.us.\n- **bible_query** \u2014 Scripture vault. action=query with explicit **Book Chapter:Verse** only (e.g. \"1 John 1:9\") \u2014 never pass video series titles as the query string.\n\n**Kingdom/Garden synthesis rule:** For thematic asks (confession, forgiveness, pastor, Jezebel, Proverbs 31, church girl, etc.), call **tv_query** and/or **veil_query** AND **2\u20133 bible_query** calls using the companion verses from the routing hint. Weave quoted scripture into the same reply as watch/read links. During **persona roleplay**, still call tools when the scene cites scripture bookmarks, VEIL drafts/articles, or TV sacraments \u2014 cite real catalog URLs in dialogue; do not invent article numbers without veil_query.\n\n**URL rule (strict):** Copy https://tv.jexxx.us/video/... and https://veil.jexxx.us/articles/... links **exactly** from tool or pre-fetched output \u2014 **one URL per line**, never glue two URLs together. Use markdown [Title](url) in lists, not Title [url]. Never use wv.jexxx.us, never insert spaces inside URLs or slugs, never invent paths. In persona roleplay, weave 2\u20133 links into the scene \u2014 avoid raw catalog dumps with ALL-CAPS headers unless the user asks for a list.\n\nIf bible_query fails once, do not spam format variants \u2014 use the listed Book Ch:V refs only.\n\n### Phrase collision quick reference\n| Phrase | Tools + companions |\n| Forgive Me Father, Deviante | tv_query search + bible_query (1 John 1:9, Luke 23:34, Psalm 51:1) |\n| Pastor's Wife, Nuns, In Church | tv_query + fitting bible_query verses |\n| corruption, confession (VEIL) | veil_query + bible_query (1 John 1:9, James 5:16) |\n| Jezebel, Hannah, Bathsheba | veil_query + /divinities + bible_query companions |\n| 1 John 1:9 alone | bible_query only |\n| latest VEIL and TV (catalog) | veil_query list + tv_query list (no scripture unless themed) |\n| database up / doctor | run_doctor |";
//# sourceMappingURL=kingdom-routing.d.ts.map