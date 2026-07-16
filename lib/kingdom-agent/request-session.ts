import type { AccountSessionResult } from "@/lib/kingdom-agent/types";
import { AsyncLocalStorage } from "node:async_hooks";

type SessionResolver = () => Promise<AccountSessionResult>;

const requestSessionAls = new AsyncLocalStorage<SessionResolver>();

/** Per-request vault session for Mini Bearer auth (avoids global resolver races). */
export function runWithAccountSessionResolver<T>(
  resolver: SessionResolver,
  fn: () => Promise<T>,
): Promise<T> {
  return requestSessionAls.run(resolver, fn);
}

export function getRequestSessionResolver(): SessionResolver | undefined {
  return requestSessionAls.getStore();
}