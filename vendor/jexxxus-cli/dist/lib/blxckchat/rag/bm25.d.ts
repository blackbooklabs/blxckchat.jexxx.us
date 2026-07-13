import type { DocChunk } from "./chunker.js";
export interface Bm25Index {
    chunks: DocChunk[];
    docTokens: string[][];
    docFreq: Map<string, number>;
    avgDocLength: number;
}
export declare function buildBm25Index(chunks: DocChunk[]): Bm25Index;
export declare function searchBm25(index: Bm25Index, query: string, k?: number): DocChunk[];
//# sourceMappingURL=bm25.d.ts.map