/** Unwrap AI SDK / provider errors into a user-visible message with HTTP context. */
export function formatKingdomAgentError(
  err: unknown,
  provider?: string,
  model?: string,
): string {
  const prefix =
    provider && model ? `${provider} (${model}): ` : "";

  if (err instanceof Error) {
    const extended = err as Error & {
      statusCode?: number;
      responseBody?: string;
      data?: { error?: { message?: string } };
    };
    let message = extended.message || "AI request failed";
    if (extended.data?.error?.message) {
      message = extended.data.error.message;
    }
    const status =
      typeof extended.statusCode === "number" ? extended.statusCode : undefined;
    const body =
      typeof extended.responseBody === "string"
        ? extended.responseBody.slice(0, 280)
        : undefined;
    if (status || body) {
      return `${prefix}${message}${status ? ` [HTTP ${status}]` : ""}${body ? ` — ${body}` : ""}`;
    }
    return `${prefix}${message}`;
  }

  return `${prefix}${String(err)}`;
}