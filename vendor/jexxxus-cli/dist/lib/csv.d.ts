import type { ContactInsert, CsvRow } from './types.js';
export declare function splitList(value: unknown): string[];
export declare function rowToContact(row: CsvRow, userId: string): ContactInsert | null;
export declare function rowsToContacts(rows: CsvRow[], userId: string): {
    contacts: ContactInsert[];
    skippedInvalid: number;
};
export declare function parseCsvFile(filePath: string): Promise<CsvRow[]>;
//# sourceMappingURL=csv.d.ts.map