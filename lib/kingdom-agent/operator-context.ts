import type { AuthenticatedAccountSession } from "@/lib/kingdom-agent/types";
import { loadCliModule } from "@/lib/kingdom-agent/cli-loader";

export async function buildOperatorIdentityContextWeb(
  session: AuthenticatedAccountSession,
): Promise<string> {
  const operatorIdentity = await loadCliModule<{
    buildOperatorIdentityContext: (s: AuthenticatedAccountSession) => Promise<string>;
  }>("lib/operator-identity.js");

  return operatorIdentity.buildOperatorIdentityContext(session);
}