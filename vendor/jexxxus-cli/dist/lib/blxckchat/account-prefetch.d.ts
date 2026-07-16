import type { AuthenticatedAccountSession } from "../account-data/session.js";
export interface AccountPrefetchResult {
    text: string;
    /** True when executeAccountQuery ran — caller may skip tool loop for read-only vault turns. */
    liveQuery: boolean;
}
/**
 * Pre-load vault data when the user is signed in and the prompt matches account routing.
 * For read-only vault turns, runs account_query server-side so Divinity personas can answer
 * without a provider tool loop (avoids Bad Request on some BYOK models).
 */
export declare function prefetchAccountContext(userPrompt: string, session?: AuthenticatedAccountSession | null): Promise<AccountPrefetchResult | null>;
//# sourceMappingURL=account-prefetch.d.ts.map