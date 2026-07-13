import type { DocFile } from "./docs-source.js";
export interface DocChunk {
    source: string;
    heading: string;
    text: string;
}
/**
 * Splits a doc file on `## ` (H2) heading boundaries — matches the
 * consistent H2 sectioning confirmed across docs.jexxx.us content
 * (architecture.md, jexxxus-cli.md, etc.). Keeps everything between one
 * H2 and the next as a single chunk, so tables/code blocks stay intact.
 */
export declare function chunkDocFile(file: DocFile): DocChunk[];
export declare function chunkAllDocs(files: DocFile[]): DocChunk[];
//# sourceMappingURL=chunker.d.ts.map