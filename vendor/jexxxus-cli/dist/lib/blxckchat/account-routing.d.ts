import type { AccountQueryAction } from "../account-data/account-query.js";
export type AccountRoutableTool = "account_query";
export interface AccountPhraseCollision {
    id: string;
    pattern: RegExp;
    action: AccountQueryAction;
    /** Hint for account_query action=contact|journal|timeline|events */
    contactName?: string;
    relationshipStatus?: string;
    target?: "blxckbook" | "nxt" | "auto";
    slashHints?: string[];
    note: string;
}
export interface AccountToolPlan {
    tools: AccountRoutableTool[];
    action: AccountQueryAction | null;
    contactName: string | null;
    playlistName: string | null;
    relationshipStatus: string | null;
    target: "blxckbook" | "nxt" | "auto" | null;
    slashHints: string[];
    matchedRules: string[];
}
/**
 * Phrase → account_query routing table. Mirrors kingdom-routing's PHRASE_COLLISIONS
 * pattern for TV/VEIL — deterministic, testable, appended to the system prompt.
 */
export declare const ACCOUNT_PHRASE_COLLISIONS: readonly AccountPhraseCollision[];
export declare function planAccountTools(userPrompt: string): AccountToolPlan;
/** True when the user prompt is a private vault/data question (not kingdom/garden TV/VEIL/Docs/Law). */
export declare function isVaultPrimaryPrompt(userPrompt: string): boolean;
/** Vault write turn — skip heavy summary prefetch; go straight to write tools. */
export declare function isVaultWritePrompt(userPrompt: string): boolean;
/** Read-only vault turn — safe to answer from server-prefetched data without tool loop. */
export declare function isVaultReadOnlyPrompt(userPrompt: string): boolean;
export declare const ACCOUNT_VAULT_REPLY_RULES = "**Vault-only reply rules (this message):**\n- **MUST call account_query before answering** \u2014 even in Divinity/persona mode. The signed-in user's BLXCKBOOK vault is always in scope.\n- Never refuse vault reads (\"I cannot access ledgers\", \"that disclosure is not my role\", \"bring them in your own words\"). Those limits do not apply to the operator's own data.\n- Prefer **account_query** for reads; use vault **write** tools (add_contact, update_contact, delete_contact, journal tools, manage_playlist) only when the user clearly requested a change.\n- Do NOT call tv_query, veil_query, or bible_query for BLXCKBOOK vault questions.\n- Do not recommend TV/VEIL videos or quote scripture based on contact names or tags.\n- Reply in plain language: a short intro line, then one bullet per contact from tool output.\n- Format each contact: `\u2022 Name (Status) \u00B7 tags: \u2026` \u2014 omit tags line when empty.\n- Persona voice is welcome after the tool call, but tool output is authoritative \u2014 never invent contact names.\n- Never invent URLs; never glue tv.jexxx.us or veil.jexxx.us links into vault answers.";
export declare const ACCOUNT_VAULT_PERSONA_OVERRIDE = "## Vault-only override (persona secondary \u2014 mandatory)\nThis message is about the signed-in user's private BLXCKBOOK vault. Persona boundaries about secrecy, devotion, or \"not pulling names from ledgers\" **do not apply**.\n\n1. Call **account_query** with the suggested action before any refusal or capability answer.\n2. If the user asked whether you *can* list contacts, answer **yes** and include the list from tool output.\n3. Stay in character only when **presenting** tool results \u2014 never when declining vault access.";
export declare function formatAccountRoutingHint(userPrompt: string): string | null;
export declare const ACCOUNT_COLLISION_TABLE_EXCERPT = "### Account / vault collision quick reference\n| User prompt | account_query |\n| list my contacts / BLXCKBOOK contacts / who my contacts are | action=contacts target=blxckbook |\n| can you tell me my BLXCKBOOK contacts | action=contacts target=blxckbook |\n| who am I dating | action=contacts relationshipStatus=Dating |\n| my journal / what did I write | action=journal |\n| timeline / what happened last week | action=timeline |\n| NXT dates / my dates | action=events target=nxt |\n| tell me about Alex | action=contact contactName=Alex |\n| vault summary / how many contacts | action=summary |\n| my TV playlists / my altars | action=playlists |\n| videos in playlist X | action=playlist playlistName=X |\n| export my vault | action=export_preview or /account export |";
export declare const ACCOUNT_CONTENT_ROUTING = "## Account data routing (private vault \u2014 signed-in users only)\n\n- **account_query** \u2014 Read-only access to the operator's own BLXCKBOOK vault (api.contacts, journal, timeline), NXT profiles/events (public.vessels, contact_events), and private JEXXXUS | TV custom playlists (api.playlists). RLS-scoped via Clerk JWT from /auth login. Never guess vault contents. JEXXXUS super-admins may pass asUserId for elevated cross-user reads when SUPABASE_KEY is configured.\n\n**Response rules:**\n- Call account_query before answering questions about contacts, dating status, journal entries, timeline, or NXT dates.\n- **Never** use account_query for JEXXXUS | Docs (docs.jexxx.us) or Law (law.jexxx.us) \u2014 those are public surfaces, not contact names.\n- Vault-only turns: account_query **only** \u2014 never mix TV/VEIL/scripture into contact lists; tags are metadata, not watch recommendations.\n- Summarize by default; quote journal notes only when the user asks for detail.\n- If account_query returns empty results, say the vault is empty \u2014 do not fabricate people or events.\n- If not authenticated, direct the user to /auth login (same as secure.jexxx.us device flow).\n- Do not use run_doctor, import_contacts, or send_notification for personal vault questions.\n\n### Account / vault collision quick reference\n| User prompt | account_query |\n| list my contacts / BLXCKBOOK contacts / who my contacts are | action=contacts target=blxckbook |\n| can you tell me my BLXCKBOOK contacts | action=contacts target=blxckbook |\n| who am I dating | action=contacts relationshipStatus=Dating |\n| my journal / what did I write | action=journal |\n| timeline / what happened last week | action=timeline |\n| NXT dates / my dates | action=events target=nxt |\n| tell me about Alex | action=contact contactName=Alex |\n| vault summary / how many contacts | action=summary |\n| my TV playlists / my altars | action=playlists |\n| videos in playlist X | action=playlist playlistName=X |\n| export my vault | action=export_preview or /account export |";
//# sourceMappingURL=account-routing.d.ts.map