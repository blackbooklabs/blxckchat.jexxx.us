import type { AccountQueryArgs, AccountSummary } from "./account-query.js";
import type { AuthenticatedAccountSession } from "./session.js";
export declare function getJexxxusApiBaseUrl(): string | null;
export declare function fetchAccountSummaryViaApi(session: AuthenticatedAccountSession, asUserId?: string): Promise<AccountSummary>;
export declare function executeAccountQueryViaApi(session: AuthenticatedAccountSession, args: AccountQueryArgs): Promise<string>;
//# sourceMappingURL=jexxxus-api-client.d.ts.map