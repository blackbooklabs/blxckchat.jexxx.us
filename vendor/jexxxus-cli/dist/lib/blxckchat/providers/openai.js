import OpenAI from "openai";
function resolveStreamCallbacks(callbacks) {
    return typeof callbacks === "function"
        ? { onChunk: callbacks }
        : callbacks;
}
function readReasoningDelta(delta) {
    if (!delta)
        return "";
    const candidates = [
        delta.reasoning_content,
        delta.reasoning,
        delta.reasoning_text,
    ];
    for (const value of candidates) {
        if (typeof value === "string" && value.length > 0) {
            return value;
        }
    }
    return "";
}
import { accumulateStreamingToolCalls, finalizeStreamingToolCalls, } from "./openai-stream.js";
/**
 * OpenAI Chat Completions adapter (function calling). Also used for Ollama,
 * which exposes an OpenAI-compatible /v1/chat/completions endpoint — see
 * createOllamaProvider() in ollama.ts, which just points baseURL here.
 */
export function createOpenAIProvider(config) {
    const client = new OpenAI({
        apiKey: config.apiKey || "unused",
        baseURL: config.baseUrl,
    });
    const buildMessages = (messages) => messages.map((m) => {
        if (m.role === "tool") {
            return {
                role: "tool",
                tool_call_id: m.toolCallId ?? "",
                content: m.content,
            };
        }
        if (m.role === "system") {
            return { role: "system", content: m.content };
        }
        if (m.role === "assistant") {
            if (m.toolCalls?.length) {
                return {
                    role: "assistant",
                    content: m.content || null,
                    tool_calls: m.toolCalls.map((tc) => ({
                        id: tc.id,
                        type: "function",
                        function: {
                            name: tc.name,
                            arguments: JSON.stringify(tc.arguments),
                        },
                    })),
                };
            }
            return { role: "assistant", content: m.content };
        }
        return { role: "user", content: m.content };
    });
    const buildTools = (tools) => tools.length
        ? tools.map((t) => ({
            type: "function",
            function: {
                name: t.name,
                description: t.description,
                parameters: t.parameters,
            },
        }))
        : undefined;
    const chat = async (messages, tools) => {
        const response = await (tools.length > 0
            ? client.chat.completions.create({
                model: config.model,
                messages: buildMessages(messages),
                tools: buildTools(tools),
            })
            : client.chat.completions.create({
                model: config.model,
                messages: buildMessages(messages),
            }));
        const choice = response.choices[0];
        const message = choice?.message;
        const toolCalls = (message?.tool_calls ?? [])
            .filter((tc) => tc.type === "function")
            .map((tc) => ({
            id: tc.id,
            name: tc.function.name,
            arguments: JSON.parse(tc.function.arguments || "{}"),
        }));
        return {
            message: { role: "assistant", content: message?.content ?? "" },
            toolCalls,
            stopReason: toolCalls.length > 0 ? "tool_calls" : "stop",
        };
    };
    return {
        id: config.provider,
        chat,
        async chatStream(messages, tools, callbacks) {
            const { onChunk, onThinkingChunk } = resolveStreamCallbacks(callbacks);
            const stream = await (tools.length > 0
                ? client.chat.completions.create({
                    model: config.model,
                    messages: buildMessages(messages),
                    tools: buildTools(tools),
                    stream: true,
                })
                : client.chat.completions.create({
                    model: config.model,
                    messages: buildMessages(messages),
                    stream: true,
                }));
            let fullContent = "";
            let finishReason = null;
            const toolCallAcc = new Map();
            try {
                for await (const event of stream) {
                    const choice = event.choices[0];
                    const delta = choice?.delta;
                    if (choice?.finish_reason) {
                        finishReason = choice.finish_reason;
                    }
                    const reasoning = readReasoningDelta(delta);
                    if (reasoning) {
                        onThinkingChunk?.(reasoning);
                    }
                    if (delta?.content) {
                        fullContent += delta.content;
                        onChunk(delta.content);
                    }
                    accumulateStreamingToolCalls(toolCallAcc, delta?.tool_calls);
                }
            }
            catch (err) {
                // Ignore stream errors after content has been received (Ollama may close prematurely)
                if (!fullContent && toolCallAcc.size === 0) {
                    throw err;
                }
            }
            let toolCalls = finalizeStreamingToolCalls(toolCallAcc);
            // Some OpenAI-compatible backends set finish_reason without streaming deltas.
            if (toolCalls.length === 0 &&
                finishReason === "tool_calls" &&
                tools.length > 0) {
                return chat(messages, tools);
            }
            return {
                message: { role: "assistant", content: fullContent },
                toolCalls,
                stopReason: toolCalls.length > 0 ? "tool_calls" : "stop",
            };
        },
    };
}
//# sourceMappingURL=openai.js.map