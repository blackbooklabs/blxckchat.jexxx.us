export type DbErrorLike = {
    code?: string | null;
    message: string;
};
export declare function isDuplicateError(error: DbErrorLike): boolean;
export declare function sanitizeDbError(error: DbErrorLike): string;
//# sourceMappingURL=errors.d.ts.map