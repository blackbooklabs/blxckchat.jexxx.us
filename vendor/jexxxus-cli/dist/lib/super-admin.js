/**
 * Super-admin Clerk IDs are env-only (JEXXXUS_SUPER_ADMIN_CLERK_IDS).
 * No defaults — operators must explicitly grant elevation via env var.
 * This prevents hardcoded IDs from leaking who has super-admin access.
 */
const DEFAULT_SUPER_ADMIN_CLERK_IDS = [];
function parseEnvSuperAdminIds() {
    const raw = process.env.JEXXXUS_SUPER_ADMIN_CLERK_IDS?.trim();
    if (!raw)
        return [];
    return raw
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
}
/** True when this Clerk user is a JEXXXUS super-admin (elevated operator DB access). */
export function isSuperAdminClerkUser(userId) {
    const allowlist = new Set([
        ...DEFAULT_SUPER_ADMIN_CLERK_IDS,
        ...parseEnvSuperAdminIds(),
    ]);
    return allowlist.has(userId);
}
//# sourceMappingURL=super-admin.js.map