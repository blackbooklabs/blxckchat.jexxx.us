export interface FuzzyMatch<T> {
    item: T;
    score: number;
}
/** Subsequence fuzzy match — chars of query must appear in order in target. */
export declare function fuzzyScore(query: string, target: string): number;
export declare function fuzzyFilter<T>(items: T[], query: string, getSearchText: (item: T) => string, limit?: number): T[];
//# sourceMappingURL=fuzzy.d.ts.map