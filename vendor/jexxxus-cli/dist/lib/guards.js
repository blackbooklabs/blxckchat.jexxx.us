export function getImportOwnerError(userId, allowSystemUser) {
    if (userId === 'SYSTEM' && !allowSystemUser) {
        return 'Refusing import with default SYSTEM owner. Pass --user <clerk_user_id> or --allow-system-user for dev.';
    }
    return null;
}
//# sourceMappingURL=guards.js.map