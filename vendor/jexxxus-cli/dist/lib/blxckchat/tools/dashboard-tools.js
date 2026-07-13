import { runDoctorFromEnv } from "../../doctor.js";
import { loadOperatorEnv } from "../../env.js";
import { createOperatorClient } from "../../supabase.js";
import { createNotificationsClient, sendSystemNotification, } from "../../notifications.js";
import { parseCsvFile, rowsToContacts } from "../../csv.js";
import { importContacts } from "../../contacts.js";
import { getImportOwnerError } from "../../guards.js";
export const doctorTool = {
    name: "run_doctor",
    description: "Verify JEXXXUS operator credentials and MAMAbase connectivity. Read-only diagnostic.",
    parameters: {
        type: "object",
        properties: {
            target: {
                type: "string",
                enum: ["blxckbook", "nxt"],
                description: "Which dashboard schema to check. Omit to check both.",
            },
        },
    },
    requiresConfirmation: false,
    async execute(args) {
        const target = args.target;
        const report = await runDoctorFromEnv(target);
        return JSON.stringify(report);
    },
};
export const notifyTool = {
    name: "send_notification",
    description: "Push a system notification to a JEXXXUS user's bell in both dashboards (BLXCKBOOK + NXT), " +
        "delivered in real-time. This writes to production data — confirm the recipient and message " +
        "with the user before calling.",
    parameters: {
        type: "object",
        properties: {
            recipientUserId: {
                type: "string",
                description: "Clerk user ID of the notification recipient",
            },
            message: { type: "string", description: "Notification message text" },
            type: {
                type: "string",
                enum: ["info", "success", "warning", "error"],
                description: "Notification type (default: info)",
            },
        },
        required: ["recipientUserId", "message"],
    },
    requiresConfirmation: true,
    async execute(args) {
        const env = loadOperatorEnv();
        if (!env)
            return "Error: missing operator credentials (.env not configured).";
        const client = createNotificationsClient(env);
        const notificationType = args.type;
        const result = await sendSystemNotification(client, {
            recipientUserId: args.recipientUserId,
            message: args.message,
            ...(notificationType ? { type: notificationType } : {}),
        });
        return result.ok
            ? `Notification sent to ${String(args.recipientUserId)}.`
            : `Error sending notification: ${result.error}`;
    },
};
export const importContactsTool = {
    name: "import_contacts",
    description: "Bulk-import contacts from a local CSV file into a JEXXXUS dashboard (api.contacts for " +
        "BLXCKBOOK or public.vessels for NXT). This writes to production data — confirm the file " +
        "path, target dashboard, and owning user with the user before calling.",
    parameters: {
        type: "object",
        properties: {
            filePath: { type: "string", description: "Absolute path to the CSV file" },
            userId: {
                type: "string",
                description: "Clerk user ID that will own the imported contacts",
            },
            target: {
                type: "string",
                enum: ["blxckbook", "nxt"],
                description: "Target dashboard (default: blxckbook)",
            },
            force: {
                type: "boolean",
                description: "Skip duplicate rows and import the rest (default: false)",
            },
        },
        required: ["filePath", "userId"],
    },
    requiresConfirmation: true,
    async execute(args) {
        const userId = args.userId;
        const ownerError = getImportOwnerError(userId, false);
        if (ownerError)
            return `Error: ${ownerError}`;
        const env = loadOperatorEnv();
        if (!env)
            return "Error: missing operator credentials (.env not configured).";
        const rows = await parseCsvFile(args.filePath);
        const { contacts, skippedInvalid } = rowsToContacts(rows, userId);
        if (contacts.length === 0)
            return "No valid contacts found in CSV.";
        const target = args.target ?? "blxckbook";
        const client = createOperatorClient(env, target);
        const imported = await importContacts(client, contacts, Boolean(args.force));
        return `Imported ${imported} contact(s) into ${target} (${skippedInvalid} row(s) skipped for missing Name).`;
    },
};
//# sourceMappingURL=dashboard-tools.js.map