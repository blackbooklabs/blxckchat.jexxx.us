import { type SupabaseClient } from "@supabase/supabase-js";
import type { OperatorEnv } from "./env.js";
export type DashboardTarget = "blxckbook" | "nxt";
export declare function createOperatorClient(env: OperatorEnv, target?: DashboardTarget): SupabaseClient;
export declare function createEcosystemClient(env: OperatorEnv): {
    blxckbook: SupabaseClient;
    nxt: SupabaseClient;
};
//# sourceMappingURL=supabase.d.ts.map