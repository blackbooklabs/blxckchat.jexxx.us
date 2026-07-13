import { isDuplicateError, sanitizeDbError } from './errors.js';
import { createOperatorClient } from './supabase.js';
export async function insertOne(supabase, contact) {
    const { error } = await supabase.from('contacts').insert(contact);
    if (!error)
        return 'ok';
    if (isDuplicateError(error))
        return 'duplicate';
    console.error(`[ERROR] ${sanitizeDbError(error)}`);
    return 'failed';
}
export async function importContacts(supabase, payload, force) {
    if (payload.length === 0) {
        return 0;
    }
    const { error, data } = await supabase.from('contacts').insert(payload).select();
    if (!error) {
        return data?.length ?? payload.length;
    }
    if (!isDuplicateError(error)) {
        console.error(`[ERROR] Import failed: ${sanitizeDbError(error)}`);
        return 0;
    }
    if (!force) {
        return 0;
    }
    let imported = 0;
    for (const contact of payload) {
        const result = await insertOne(supabase, contact);
        if (result === 'ok')
            imported += 1;
        else if (result === 'failed')
            return imported;
    }
    return imported;
}
//# sourceMappingURL=contacts.js.map