import type { Credentials } from "./auth.js";
import type { AuthenticatedAccountSession } from "./account-data/session.js";
export declare function formatCredentialsDisplayName(creds: Credentials): string;
export declare function formatCredentialsShortLabel(creds: Credentials): string;
/**
 * Kingdom-wide operator block injected into every BLXCKCHAT system prompt when
 * the user is signed in — profile, access scope, and super-admin posture.
 */
export declare function buildOperatorIdentityContext(session: AuthenticatedAccountSession): Promise<string>;
/** Lightweight label when session resolution failed but creds exist on disk. */
export declare function buildOfflineOperatorIdentityContext(creds: Credentials): string;
//# sourceMappingURL=operator-identity.d.ts.map