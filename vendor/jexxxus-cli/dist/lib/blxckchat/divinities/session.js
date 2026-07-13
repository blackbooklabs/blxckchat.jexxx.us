export function getActiveDivinity(session) {
    return session.activeDivinity ?? null;
}
/** Switch persona — clears chat history so the new voice starts fresh. */
export function activateDivinityPersona(session, persona) {
    session.conversationHistory = [];
    session.messages = [];
    session.toolResults = [];
    session.thinkingBlocks = [];
    const active = {
        id: persona.id,
        name: persona.name,
    };
    if (persona.role)
        active.role = persona.role;
    if (persona.pillar)
        active.pillar = persona.pillar;
    session.activeDivinity = active;
}
export function clearActiveDivinity(session) {
    session.activeDivinity = null;
    session.conversationHistory = [];
    session.messages = [];
    session.toolResults = [];
    session.thinkingBlocks = [];
}
export function formatDivinityActivationMessage(persona) {
    const role = persona.role ? ` · ${persona.role}` : "";
    const pillar = persona.pillar ? ` · ${persona.pillar}` : "";
    return [
        `Divinity active: ${persona.name}${role}${pillar}`,
        "Chat history cleared — speak as this persona. Tools remain available.",
        "Use /divinities to switch · /divinities clear to return to BLXCKCHAT",
    ].join("\n");
}
export function formatDivinityClearedMessage() {
    return "Divinity cleared — BLXCKCHAT default agent restored. Chat history cleared.";
}
//# sourceMappingURL=session.js.map