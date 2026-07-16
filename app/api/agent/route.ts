/**
 * Kingdom Agent — JEXXXUS | CLI parity for blxckchat.jexxx.us
 * Clerk-scoped vault CRUD + VEIL/TV/Bible/Law tools via jexxxus-cli registry.
 */
export const runtime = "nodejs";
export const maxDuration = 120;

import type { IncomingChatMessage } from "@/lib/chat-message-normalizer";
import { KINGDOM_PROVIDERS, type AgentProvider } from "@/lib/kingdom-agent/providers";
import { runKingdomAgent } from "@/lib/kingdom-agent/run-kingdom-agent";
import { resolveWebAccountSession } from "@/lib/kingdom-agent/web-session";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Provider, x-openai-key, x-grok-key, x-gemini-key, x-kimi-key, x-groq-key, x-openrouter-key, x-kingdom-key, x-anthropic-key, x-ollama-url",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const sessionResult = await resolveWebAccountSession();
    if (!sessionResult.ok) {
      return new Response(
        JSON.stringify({
          error: "Authentication Required",
          message: sessionResult.message,
          signature: "♡ BLXCKCHAT Kingdom Agent",
        }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const body = await req.json();
    const {
      messages = [],
      provider = "openai",
      model,
      mode = "venus",
      projectInstructions = "",
      globalInstructions = "",
    } = body;

    const providerKey = provider as AgentProvider;
    const providerConfig = KINGDOM_PROVIDERS[providerKey];
    if (!providerConfig) {
      return new Response(
        JSON.stringify({ error: "Invalid provider", message: `Unknown provider: ${provider}` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const apiKey = req.headers.get(providerConfig.keyHeader);
    if (!apiKey && providerKey !== "bonsai" && providerKey !== "ollama") {
      return new Response(
        JSON.stringify({
          error: "API Key Required",
          message: `Provide ${providerConfig.name} key in ${providerConfig.keyHeader}`,
        }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const result = await runKingdomAgent({
      session: sessionResult.session,
      messages: messages as IncomingChatMessage[],
      provider: providerKey,
      apiKey: apiKey ?? "",
      model: model || providerConfig.defaultModel,
      mode,
      projectInstructions,
      globalInstructions,
    });

    return new Response(
      JSON.stringify({
        text: result.text,
        provider: result.provider,
        model: result.model,
        agent: true,
        steps: result.steps,
        signature: "♡💦 BLXCKCHAT Kingdom Agent",
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error) {
    console.error("[Kingdom Agent] Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        error: "Agent Failed",
        message,
        signature: "♡ BLXCKCHAT Kingdom Agent",
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
}