import type { AuthenticatedAccountSession } from "@/lib/kingdom-agent/types";
import { loadCliModule } from "@/lib/kingdom-agent/cli-loader";
import { buildOperatorIdentityContextWeb } from "@/lib/kingdom-agent/operator-context";

export interface KingdomPromptOptions {
  userPrompt: string;
  personaSystemPrompt?: string;
  conversationHistory?: string;
  session: AuthenticatedAccountSession;
}

const WEB_SURFACE_BRIDGE = `## BLXCKCHAT web surface (blxckchat.jexxx.us)

You are the **holistic JEXXXUS ecosystem agent** in the browser — same vault CRUD and kingdom tools as JEXXXUS | CLI, scoped to the signed-in Clerk user.

- **Vault reads** (account_query, export flows) route **API-first** to JEXXXUS | API (JEXXXUS_API_URL, default https://api.jexxx.us) with Clerk JWT, then **fall back** to direct Supabase RLS if the API is unreachable.
- Use **account_query** before answering about contacts, journal, NXT dates, or private TV playlists.
- Use **add_contact**, **update_contact**, **delete_contact**, **manage_contact_event**, **manage_playlist**, and journal tools for writes — only when the user clearly requested the change.
- Use **veil_query** / **tv_query** / **music_query** / **bible_query** / **law_query** for public kingdom content (articles, TV catalog, Crucifly beats/kits, scripture, policies).
- **JEXXXUS | Docs** (docs.jexxx.us) — public reference library (architecture, CLI, platform). Summarize from injected RAG documentation context; never treat "Docs" as a BLXCKBOOK contact name.
- **JEXXXUS | Law** (law.jexxx.us) — Terms, Privacy, Refunds, DMCA via **law_query**; never fabricate policy text.
- Never fabricate vault rows, playlist names, or policy text — tool output is authoritative.
- You are not a general coding agent; stay within available tools and the user's JEXXXUS vault.`;

const PERSONA_BRIDGE = `Retain your persona voice above. You still have BLXCKCHAT kingdom tools (Bible, VEIL, TV, Law, Docs, signed-in vault CRUD).

When the user asks about empire platforms — **JEXXXUS | TV** (tv.jexxx.us video streaming, NOT household television), **VEIL** (veil.jexxx.us), **JEXXXUS Music** (music.jexxx.us — Crucifly Records beats/kits), **BLXCKBOOK**, **NXT**, **Law**, **Docs**, or their vault — call the appropriate tool (**tv_query**, **veil_query**, **music_query**, **account_query**, **law_query**, **docs_query**, etc.) before answering. Tool output is authoritative; never guess catalog titles or vault rows.

For **BLXCKBOOK contacts**, journal, timeline, or NXT dates: never refuse as "not your role" or "cannot access ledgers". The signed-in user's vault is always yours to read via **account_query**.

Stay in character when presenting tool results — not when declining vault access.`;

export async function buildKingdomSystemPrompt(
  options: KingdomPromptOptions,
): Promise<string> {
  const { userPrompt, personaSystemPrompt, conversationHistory, session } = options;

  const [
    agentLoop,
    accountRouting,
    kingdomRouting,
    accountPrefetchMod,
    gardenPrefetchMod,
  ] = await Promise.all([
    loadCliModule<{ EMPIRE_AGENT_SYSTEM_PROMPT: string }>(
      "lib/blxckchat/agent-loop.js",
    ),
    loadCliModule<{
      formatAccountRoutingHint: (p: string) => string | null;
      isVaultPrimaryPrompt: (p: string) => boolean;
      ACCOUNT_VAULT_PERSONA_OVERRIDE: string;
    }>("lib/blxckchat/account-routing.js"),
    loadCliModule<{
      formatKingdomRoutingHint: (
        p: string,
        o?: { conversationContext?: string },
      ) => string | null;
    }>("lib/blxckchat/kingdom-routing.js"),
    loadCliModule<{
      prefetchAccountContext: (p: string) => Promise<string | null>;
    }>("lib/blxckchat/account-prefetch.js"),
    loadCliModule<{
      prefetchGardenContext: (
        p: string,
        o?: { conversationContext?: string },
      ) => Promise<string | null>;
    }>("lib/blxckchat/garden-prefetch.js"),
  ]);

  let prompt = personaSystemPrompt
    ? `${personaSystemPrompt.trim()}\n\n---\n\n${PERSONA_BRIDGE}\n\n${WEB_SURFACE_BRIDGE}`
    : `${agentLoop.EMPIRE_AGENT_SYSTEM_PROMPT}\n\n${WEB_SURFACE_BRIDGE}`;

  const routingOptions = {
    conversationContext: conversationHistory ?? "",
  };

  const vaultPrimary = accountRouting.isVaultPrimaryPrompt(userPrompt);
  const routingHint = vaultPrimary
    ? null
    : kingdomRouting.formatKingdomRoutingHint(userPrompt, routingOptions);
  const accountHint = accountRouting.formatAccountRoutingHint(userPrompt);

  if (routingHint) prompt = `${prompt}\n\n${routingHint}`;
  if (accountHint) prompt = `${prompt}\n\n${accountHint}`;
  if (vaultPrimary && personaSystemPrompt) {
    prompt = `${prompt}\n\n${accountRouting.ACCOUNT_VAULT_PERSONA_OVERRIDE}`;
  }

  const gardenPrefetchText = vaultPrimary
    ? null
    : await gardenPrefetchMod.prefetchGardenContext(userPrompt, routingOptions);
  if (gardenPrefetchText) prompt = `${prompt}\n\n${gardenPrefetchText}`;

  const accountPrefetchText = await accountPrefetchMod.prefetchAccountContext(userPrompt);
  if (accountPrefetchText) prompt = `${prompt}\n\n${accountPrefetchText}`;

  const operatorContext = await buildOperatorIdentityContextWeb(session);
  prompt = `${prompt}\n\n${operatorContext}`;

  return appendDocContext(prompt, userPrompt);
}

async function appendDocContext(
  prompt: string,
  userPrompt: string,
): Promise<string> {
  const rag = await loadCliModule<{
    searchDocs: (
      query: string,
      k?: number,
    ) => Promise<Array<{ source: string; heading: string; text: string }>>;
  }>("lib/blxckchat/rag/index.js");

  const docChunks = await rag.searchDocs(userPrompt, 5);
  if (docChunks.length === 0) return prompt;

  const context = docChunks
    .map((c) => `### ${c.source} — ${c.heading}\n${c.text}`)
    .join("\n\n");

  return `${prompt}\n\nRelevant JEXXXUS documentation context:\n\n${context}`;
}

export async function extractHistoryContext(
  messages: Array<{ role: string; content: unknown }>,
): Promise<string> {
  const kingdomRouting = await loadCliModule<{
    extractRoutingContextFromHistory: (
      messages: Array<{ role: string; content: string }>,
    ) => string;
  }>("lib/blxckchat/kingdom-routing.js");

  const simplified = messages.map((m) => ({
    role: m.role,
    content:
      typeof m.content === "string"
        ? m.content
        : Array.isArray(m.content)
          ? m.content
              .filter((p: { type?: string }) => p.type === "text")
              .map((p: { text?: string }) => p.text)
              .join(" ")
          : String(m.content ?? ""),
  }));
  return kingdomRouting.extractRoutingContextFromHistory(simplified);
}