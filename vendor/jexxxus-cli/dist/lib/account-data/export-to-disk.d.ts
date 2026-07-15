import { type AccountExportTarget } from "./jexxxus-api-client.js";
export type VaultExportTarget = AccountExportTarget;
export declare function exportVaultToDisk(target: VaultExportTarget, destinationDir?: string): Promise<{
    paths: string[];
    error?: string;
}>;
//# sourceMappingURL=export-to-disk.d.ts.map