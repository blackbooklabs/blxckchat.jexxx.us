/** Merge one chunk of streamed tool_call deltas into the accumulator map. */
export function accumulateStreamingToolCalls(acc, deltas) {
    if (!deltas?.length)
        return;
    for (const delta of deltas) {
        const index = delta.index ?? 0;
        let entry = acc.get(index);
        if (!entry) {
            entry = { arguments: "" };
            acc.set(index, entry);
        }
        if (delta.id)
            entry.id = delta.id;
        if (delta.function?.name)
            entry.name = delta.function.name;
        if (delta.function?.arguments) {
            entry.arguments += delta.function.arguments;
        }
    }
}
/** Convert accumulated streamed tool calls into parsed ToolCall objects. */
export function finalizeStreamingToolCalls(acc) {
    const result = [];
    for (const index of [...acc.keys()].sort((a, b) => a - b)) {
        const entry = acc.get(index);
        if (!entry?.id || !entry.name)
            continue;
        let args = {};
        try {
            args = JSON.parse(entry.arguments || "{}");
        }
        catch {
            args = {};
        }
        result.push({
            id: entry.id,
            name: entry.name,
            arguments: args,
        });
    }
    return result;
}
//# sourceMappingURL=openai-stream.js.map