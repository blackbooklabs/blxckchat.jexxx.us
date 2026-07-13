/** Remove the last user/assistant exchange from session state (branch undo). */
export function branchUndo(session) {
    if (session.messages.length === 0)
        return false;
    let removed = 0;
    while (session.messages.length > 0) {
        const last = session.messages[session.messages.length - 1];
        if (!last)
            break;
        session.messages.pop();
        removed++;
        if (last.role === "user")
            break;
    }
    while (session.conversationHistory.length > 0) {
        const last = session.conversationHistory[session.conversationHistory.length - 1];
        if (!last)
            break;
        session.conversationHistory.pop();
        if (last.role === "user")
            break;
    }
    return removed > 0;
}
//# sourceMappingURL=branch.js.map