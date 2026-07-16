import type { AuthenticatedAccountSession } from "../account-data/session.js";
export interface DeterministicVaultWriteResult {
    text: string;
    executed: boolean;
}
/**
 * Run delete_contact server-side when the user prompt is a contact deletion.
 * Models (especially MiniMax) often skip the tool or hallucinate success — this
 * guarantees the vault mutation happens before the persona reply is generated.
 */
export declare function executeDeterministicContactDeleteIfRequested(userPrompt: string, session: AuthenticatedAccountSession): Promise<DeterministicVaultWriteResult | null>;
//# sourceMappingURL=vault-deterministic-write.d.ts.map