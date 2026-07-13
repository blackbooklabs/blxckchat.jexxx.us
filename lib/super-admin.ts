/** Mirrors jexxx.us-cli/src/lib/super-admin.ts — env-only allowlist. */
export function isSuperAdminClerkUser(userId: string): boolean {
  const raw = process.env.JEXXXUS_SUPER_ADMIN_CLERK_IDS?.trim();
  if (!raw) return false;
  const allowlist = new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
  return allowlist.has(userId);
}