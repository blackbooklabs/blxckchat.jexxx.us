import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleCache = new Map<string, Promise<unknown>>();

/** Resolve built jexxx.us-cli dist: monorepo sibling first, then vendored copy. */
export function cliDistRoot(): string {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, "..", "jexxx.us-cli", "dist"),
    path.resolve(cwd, "vendor", "jexxxus-cli", "dist"),
  ];

  for (const root of candidates) {
    if (fs.existsSync(path.join(root, "index.js"))) {
      return root;
    }
  }

  throw new Error(
    "jexxx.us-cli dist not found. Run `bash scripts/vendor-jexxxus-cli.sh` (prebuild) or keep ../jexxx.us-cli built in the monorepo.",
  );
}

/** Load a built jexxx.us-cli dist module. */
export function loadCliModule<T>(relativePath: string): Promise<T> {
  const cached = moduleCache.get(relativePath);
  if (cached) return cached as Promise<T>;

  const href = pathToFileURL(path.join(cliDistRoot(), relativePath)).href;
  const promise = import(href) as Promise<T>;
  moduleCache.set(relativePath, promise);
  return promise;
}