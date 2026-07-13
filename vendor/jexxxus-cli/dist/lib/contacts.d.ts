import { createOperatorClient } from './supabase.js';
import type { ContactInsert } from './types.js';
type InsertResult = 'ok' | 'duplicate' | 'failed';
type OperatorSupabase = ReturnType<typeof createOperatorClient>;
export declare function insertOne(supabase: OperatorSupabase, contact: ContactInsert): Promise<InsertResult>;
export declare function importContacts(supabase: OperatorSupabase, payload: ContactInsert[], force: boolean): Promise<number>;
export {};
//# sourceMappingURL=contacts.d.ts.map