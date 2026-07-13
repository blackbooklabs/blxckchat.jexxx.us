import type { BlxckchatTool } from "./types.js";
export declare function isBlockedCommand(command: string): boolean;
/**
 * Shell execution tool. Only registered when the user passes --shell to
 * `jexxxus blxckchat` (see tools/registry.ts) — off by default. Every
 * invocation still requires interactive confirmation (see confirm.ts) on
 * top of the hard blocklist above, which cannot be overridden by confirming.
 */
export declare const shellTool: BlxckchatTool;
//# sourceMappingURL=shell-tool.d.ts.map