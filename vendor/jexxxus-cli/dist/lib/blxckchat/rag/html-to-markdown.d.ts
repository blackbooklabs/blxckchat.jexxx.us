/**
 * Converts RSS content:encoded HTML (rendered from markdown at build time)
 * back into a markdown-ish text the existing H2-boundary chunker can split
 * consistently, whether the source is a local .md file or a remote feed.
 */
export declare function htmlToMarkdownish(html: string): string;
//# sourceMappingURL=html-to-markdown.d.ts.map