import type { AuthenticatedAccountSession } from "./session.js";
import type { DashboardTarget } from "../supabase.js";
export type AccountQueryAction = "summary" | "contacts" | "contact" | "journal" | "timeline" | "events" | "profiles" | "playlists" | "playlist" | "export_preview";
export type AccountQueryTarget = DashboardTarget | "auto";
export interface AccountQueryArgs {
    action: AccountQueryAction;
    target?: AccountQueryTarget;
    contactName?: string;
    relationshipStatus?: string;
    playlistName?: string;
    /** Super-admin only: read another Clerk user's vault/TV data */
    asUserId?: string;
    limit?: number;
}
export interface AccountSummary {
    signedInAs: string;
    userId: string;
    isSuperAdmin: boolean;
    elevated: boolean;
    tv: {
        playlists: number;
        savedVideos: number;
    };
    blxckbook: {
        contacts: number;
        journalEntries: number;
        timelineEvents: number;
        relationshipStatusDistribution: Record<string, number>;
        recentContacts: Array<{
            name: string;
            status: string | null;
        }>;
    };
    nxt: {
        profiles: number;
        events: number;
        recentProfiles: Array<{
            name: string;
            status: string | null;
        }>;
    };
}
export declare function normalizeName(value: string): string;
export declare function fuzzyMatchContact<T extends {
    name: string;
}>(rows: T[], contactName: string): T | undefined;
export declare function fetchAccountSummary(session: AuthenticatedAccountSession, asUserId?: string): Promise<AccountSummary>;
export declare function executeAccountQuery(session: AuthenticatedAccountSession, args: AccountQueryArgs): Promise<string>;
//# sourceMappingURL=account-query.d.ts.map