import { createClient } from "@supabase/supabase-js";
/**
 * system_notifications lives in the `public` schema on the shared Supabase
 * project regardless of which dashboard the recipient signs into (mirrors
 * contact_notifications) — so this client is deliberately not scoped via
 * createOperatorClient()'s per-dashboard schema map.
 */
export function createNotificationsClient(env) {
    return createClient(env.supabaseUrl, env.supabaseKey, {
        db: { schema: "public" },
    });
}
export async function sendSystemNotification(client, params) {
    const { error } = await client.from("system_notifications").insert({
        recipient_user_id: params.recipientUserId,
        message: params.message,
        type: params.type ?? "info",
        source: "cli",
    });
    if (error) {
        return { ok: false, error: error.message };
    }
    return { ok: true };
}
//# sourceMappingURL=notifications.js.map