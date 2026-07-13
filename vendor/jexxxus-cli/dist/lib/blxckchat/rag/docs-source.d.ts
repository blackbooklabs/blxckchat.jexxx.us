export interface DocFile {
    filename: string;
    content: string;
}
/** Parse the public Docs RSS feed into DocFile-shaped chunks (markdown-ish text). */
export declare function parseDocsRssFeed(xml: string, baseUrl?: string): DocFile[];
/** Local checkout when available (JEXXXUS_DOCS_SOURCE_PATH), else public RSS feed. */
export declare function loadDocsContent(): Promise<DocFile[]>;
/** Content hash used to invalidate the cached index when docs change. */
export declare function docsContentHash(files: DocFile[]): string;
/** Reset RSS cache — for tests only. */
export declare function resetDocsRssCacheForTests(): void;
//# sourceMappingURL=docs-source.d.ts.map