export type VaultExportTarget = "blxckbook" | "nxt" | "all";
export declare function exportVaultToDisk(target: VaultExportTarget, destinationDir?: string): Promise<{
    paths: string[];
    error?: string;
}>;
//# sourceMappingURL=export-to-disk.d.ts.map