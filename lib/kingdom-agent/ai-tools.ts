import { jsonSchema, tool, type ToolSet } from "ai";
import { loadCliModule } from "@/lib/kingdom-agent/cli-loader";
import { resolveWebAccountSession } from "@/lib/kingdom-agent/web-session";

/** Never hard-fail add_contact at schema validation — execute() returns a retry hint. */
function permissiveObjectSchema(parameters: Record<string, unknown>) {
  return jsonSchema(parameters as never, {
    validate: (value) => ({
      success: true,
      value:
        typeof value === "object" && value !== null
          ? (value as Record<string, unknown>)
          : {},
    }),
  });
}

type BlxckchatTool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  requiresConfirmation: boolean;
  execute(args: Record<string, unknown>): Promise<string>;
};

let sessionResolverInstalled = false;

async function ensureWebSessionResolver(): Promise<void> {
  if (sessionResolverInstalled) return;

  const sessionMod = await loadCliModule<{
    setAccountSessionResolver: (
      resolver: (() => Promise<unknown>) | null,
    ) => void;
  }>("lib/account-data/session.js");

  sessionMod.setAccountSessionResolver(() => resolveWebAccountSession());
  sessionResolverInstalled = true;
}

/**
 * Map jexxx.us-cli tool registry → Vercel AI SDK ToolSet (signed-in vault CRUD enabled).
 */
export async function buildKingdomAiTools(): Promise<ToolSet> {
  await ensureWebSessionResolver();

  const registryMod = await loadCliModule<{
    buildToolRegistry: (options?: {
      allowShell?: boolean;
      includeAccountQuery?: boolean;
    }) => BlxckchatTool[];
  }>("lib/blxckchat/tools/registry.js");

  const registry = registryMod.buildToolRegistry({
    includeAccountQuery: true,
    allowShell: false,
  });

  const tools: ToolSet = {};

  for (const t of registry) {
    const inputSchema =
      t.name === "add_contact" || t.name === "update_contact"
        ? permissiveObjectSchema(t.parameters)
        : jsonSchema(t.parameters as never);

    tools[t.name] = tool({
      description: t.description,
      inputSchema: inputSchema as never,
      execute: async (args: Record<string, unknown>) => {
        try {
          return await t.execute(args);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return `Error executing ${t.name}: ${msg}`;
        }
      },
    });
  }

  return tools;
}