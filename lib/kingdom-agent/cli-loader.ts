import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleCache = new Map<string, Promise<unknown>>();

function cliDistRoot(): string {
  return path.resolve(process.cwd(), "..", "jexxx.us-cli", "dist");
}

/** Load a built jexxx.us-cli dist module (monorepo sibling). */
export function loadCliModule<T>(relativePath: string): Promise<T> {
  const cached = moduleCache.get(relativePath);
  if (cached) return cached as Promise<T>;

  const href = pathToFileURL(path.join(cliDistRoot(), relativePath)).href;
  const promise = import(href) as Promise<T>;
  moduleCache.set(relativePath, promise);
  return promise;
}