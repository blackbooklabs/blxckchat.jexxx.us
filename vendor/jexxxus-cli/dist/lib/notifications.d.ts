import { type SupabaseClient } from "@supabase/supabase-js";
import type { OperatorEnv } from "./env.js";
export type NotificationType = "info" | "success" | "warning" | "error";
/**
 * system_notifications lives in the `public` schema on the shared Supabase
 * project regardless of which dashboard the recipient signs into (mirrors
 * contact_notifications) — so this client is deliberately not scoped via
 * createOperatorClient()'s per-dashboard schema map.
 */
export declare function createNotificationsClient(env: OperatorEnv): SupabaseClient;
export declare function sendSystemNotification(client: SupabaseClient, params: {
    recipientUserId: string;
    message: string;
    type?: NotificationType;
}): Promise<{
    ok: boolean;
    error?: string;
}>;
//# sourceMappingURL=notifications.d.ts.map