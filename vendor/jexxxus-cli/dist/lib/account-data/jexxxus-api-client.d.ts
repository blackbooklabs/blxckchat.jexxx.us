import type { AccountQueryArgs, AccountSummary } from "./account-query.js";
import type { AuthenticatedAccountSession } from "./session.js";
export type AccountExportTarget = "blxckbook" | "nxt" | "all";
export interface AccountExportPayload {
    exported_at?: string;
    live?: boolean;
    source?: string;
    user?: {
        id: string;
        email: string;
    };
    elevated?: boolean;
    blxckbook?: unknown;
    nxt?: unknown;
    tv?: unknown;
}
export declare function getJexxxusApiBaseUrl(): string | null;
export declare function fetchAccountSummaryViaApi(session: AuthenticatedAccountSession, asUserId?: string): Promise<AccountSummary>;
export declare function executeAccountQueryViaApi(session: AuthenticatedAccountSession, args: AccountQueryArgs): Promise<string>;
export declare function fetchAccountExportViaApi(session: AuthenticatedAccountSession, options: {
    target: AccountExportTarget;
    includeTv?: boolean;
    asUserId?: string;
}): Promise<AccountExportPayload>;
//# sourceMappingURL=jexxxus-api-client.d.ts.map