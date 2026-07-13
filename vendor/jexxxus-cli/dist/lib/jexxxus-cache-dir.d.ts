/** Writable JEXXXUS state directory — ~/.jexxxus locally, /tmp on serverless. */
export declare function resolveJexxxusDir(): string;
/** Best-effort mkdir; returns false when the filesystem is read-only. */
export declare function ensureJexxxusDir(dir?: string): boolean;
export declare function jexxxusFile(...segments: string[]): string;
//# sourceMappingURL=jexxxus-cache-dir.d.ts.map