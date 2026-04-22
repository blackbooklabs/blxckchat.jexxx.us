import { Langfuse } from "langfuse-node";

// ==========================================
// 👁️ JEXXXUS SOVEREIGN TELEMETRY (Langfuse)
// ==========================================

export const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com"
});

/**
 * Custom wrapper strictly for tracking JEXXXUS Persona executions.
 * Hardwired to mathematically log Luna Verde v6.0 interactions.
 */
export const traceDivinity = (userId: string, personaId: string = "luna_verde_v6", sessionId?: string) => {
  return langfuse.trace({
    name: "divine_invocation",
    userId: userId,
    sessionId: sessionId,
    tags: ["jexxxus", personaId, "v6.0_triangulation"],
    metadata: {
      empire_state: "active",
      frequency: personaId === "luna_verde_v6" ? "7.5Hz" : "neutral",
      arch_version: "6.0"
    }
  });
};
