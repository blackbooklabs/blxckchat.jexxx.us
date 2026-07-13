import Anthropic from "@anthropic-ai/sdk";
/**
 * Anthropic Messages API tool-calling adapter. Maps our provider-agnostic
 * ChatMessage/ToolDefinition shape onto Anthropic's tool_use content blocks.
 */
export function createAnthropicProvider(config) {
    if (!config.apiKey) {
        throw new Error("[BLXCKCHAT] Anthropic provider requires an API key.");
    }
    const client = new Anthropic({ apiKey: config.apiKey });
    return {
        id: "anthropic",
        async chat(messages, tools) {
            const systemMessage = messages.find((m) => m.role === "system");
            const conversation = messages.filter((m) => m.role !== "system");
            const anthropicMessages = conversation.map((m) => {
                if (m.role === "tool") {
                    return {
                        role: "user",
                        content: [
                            {
                                type: "tool_result",
                                tool_use_id: m.toolCallId ?? "",
                                content: m.content,
                            },
                        ],
                    };
                }
                return {
                    role: m.role === "assistant" ? "assistant" : "user",
                    content: m.content,
                };
            });
            const response = await client.messages.create({
                model: config.model,
                max_tokens: 4096,
                ...(systemMessage ? { system: systemMessage.content } : {}),
                messages: anthropicMessages,
                tools: tools.map((t) => ({
                    name: t.name,
                    description: t.description,
                    input_schema: t.parameters,
                })),
            });
            const toolCalls = [];
            let textContent = "";
            for (const block of response.content) {
                if (block.type === "text") {
                    textContent += block.text;
                }
                else if (block.type === "tool_use") {
                    toolCalls.push({
                        id: block.id,
                        name: block.name,
                        arguments: block.input,
                    });
                }
            }
            return {
                message: { role: "assistant", content: textContent },
                toolCalls,
                stopReason: response.stop_reason === "tool_use" ? "tool_calls" : "stop",
            };
        },
    };
}
//# sourceMappingURL=anthropic.js.map