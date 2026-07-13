import type { BlxckchatTool } from "./types.js";
/**
 * Read-only wrapper around lib/bible.ts. Consolidated into a single tool
 * (rather than one-tool-per-function) to keep the tool surface small for
 * the model to reason about; the `action` param dispatches internally.
 */
export declare const bibleTool: BlxckchatTool;
//# sourceMappingURL=bible-tools.d.ts.map