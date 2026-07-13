import type { PersonaPreset, Project } from "@/store/useChatStore";

const SPICY_BLOCK_RE =
  /\n*---\n<!-- 🌶️ SPICY-REVEALED[\s\S]*$/;

/** Remove appended SPICY-REVEALED canon block from stored project instructions. */
export function stripSpicyCanon(instructions: string): string {
  return instructions.replace(SPICY_BLOCK_RE, "").trim();
}

export function findPersonaForProject(
  personas: PersonaPreset[],
  project: Project | undefined | null,
  invokingPersonaId: string | null,
): PersonaPreset | undefined {
  if (invokingPersonaId) {
    const byId = personas.find((p) => p.id === invokingPersonaId);
    if (byId) return byId;
  }
  if (!project?.title) return undefined;
  const title = project.title.trim().toLowerCase();
  return personas.find((p) => p.name.trim().toLowerCase() === title);
}

/**
 * Build project instructions sent to the model for the current spicy toggle.
 * Safe canon is always the base; spicy append only when signed in and toggle is on.
 */
export function resolveProjectInstructionsForMode(
  storedInstructions: string,
  persona: PersonaPreset | undefined,
  isSpicy: boolean,
  isSignedIn: boolean,
): string {
  const stripped = stripSpicyCanon(storedInstructions);

  if (!isSpicy || !isSignedIn) {
    return stripped;
  }

  if (persona?.spicy_content && persona.spicy_content !== persona.safe_content) {
    const base = persona.safe_content || stripped;
    return `${base}\n\n---\n<!-- 🌶️ SPICY-REVEALED — Authenticated & Unlocked -->\n\n${persona.spicy_content}`;
  }

  if (stripped !== storedInstructions.trim()) {
    return storedInstructions.trim();
  }

  return stripped;
}