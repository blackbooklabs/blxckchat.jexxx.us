/**
 * Append a full stack trace (not just err.message) to ~/.jexxxus/crash.log.
 * The TUI's top-level catch only ever showed err.message to the user —
 * useful for expected errors, but it silently discards the stack for
 * anything unexpected (e.g. a genuine bug like a stack overflow), making
 * those effectively undiagnosable after the fact. Call this alongside
 * (not instead of) the existing user-facing error message.
 */
export declare function logCrash(context: string, err: unknown): void;
export declare function getCrashLogPath(): string;
//# sourceMappingURL=crash-log.d.ts.map