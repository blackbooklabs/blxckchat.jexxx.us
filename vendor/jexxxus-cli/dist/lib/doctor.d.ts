import { createOperatorClient } from "./supabase.js";
import type { DashboardTarget } from "./supabase.js";
export type DoctorCheck = {
    name: string;
    ok: boolean;
    detail: string;
};
export type DoctorReport = {
    ok: boolean;
    checks: DoctorCheck[];
};
type DoctorClient = ReturnType<typeof createOperatorClient>;
export declare function probeMamabase(supabase: DoctorClient, schema: string): Promise<DoctorCheck>;
export declare function probeNxtVessels(supabase: DoctorClient): Promise<DoctorCheck>;
export declare function probeNxtEvents(supabase: DoctorClient): Promise<DoctorCheck>;
export declare function runDoctorFromEnv(target?: DashboardTarget): Promise<DoctorReport>;
export {};
//# sourceMappingURL=doctor.d.ts.map