import { createClient } from "@supabase/supabase-js";
const SCHEMA_MAP = {
    blxckbook: "api",
    nxt: "public",
};
export function createOperatorClient(env, target = "blxckbook") {
    return createClient(env.supabaseUrl, env.supabaseKey, {
        db: { schema: SCHEMA_MAP[target] },
    });
}
export function createEcosystemClient(env) {
    return {
        blxckbook: createOperatorClient(env, "blxckbook"),
        nxt: createOperatorClient(env, "nxt"),
    };
}
//# sourceMappingURL=supabase.js.map