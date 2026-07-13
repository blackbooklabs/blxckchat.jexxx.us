import { type DocChunk } from "./chunker.js";
import { type Bm25Index } from "./bm25.js";
/**
 * Builds (or loads from cache) the BM25 index over docs.jexxx.us + law.jexxx.us
 * content. Rebuilds automatically when content changes (content-hash check),
 * so operators never need a manual "reindex" step.
 */
export declare function buildOrLoadIndex(): Promise<Bm25Index>;
export declare function searchDocs(query: string, k?: number): Promise<DocChunk[]>;
//# sourceMappingURL=index.d.ts.map