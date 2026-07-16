/**
 * Consume a plain-text streaming HTTP response (AI SDK toTextStreamResponse).
 */
export async function consumeTextStream(
  response: Response,
  onPartial: (text: string) => void,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response stream available");
  }

  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    onPartial(full);
  }

  full += decoder.decode();
  onPartial(full);
  return full;
}

/** Parse JSON error bodies when a stream request failed before streaming. */
export async function parseAgentErrorResponse(
  response: Response,
): Promise<never> {
  const raw = await response.text();
  let message = raw || `Request failed (${response.status})`;
  try {
    const data = JSON.parse(raw) as { message?: string; error?: string };
    message = data.message || data.error || message;
  } catch {
    // keep raw text
  }
  throw new Error(message);
}