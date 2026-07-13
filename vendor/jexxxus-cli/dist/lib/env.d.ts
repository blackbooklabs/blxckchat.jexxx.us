export type OperatorEnv = {
    supabaseUrl: string;
    supabaseKey: string;
};
export declare function loadOperatorEnv(envPath?: string): OperatorEnv | null;
export type UserEnv = {
    supabaseUrl: string;
    supabaseAnonKey: string;
};
export declare function loadUserEnv(envPath?: string): UserEnv | null;
/** Human-readable reason when loadUserEnv() returns null (for TUI / account_query). */
export declare function describeMissingUserEnv(): string;
//# sourceMappingURL=env.d.ts.map