import type { LawPolicy, LawPolicyMeta, LawPublicEndpoints } from "../../law.js";
export declare function formatLawPolicyList(policies: LawPolicyMeta[], total: number): string;
export declare function formatLawPolicyMeta(meta: LawPolicyMeta, endpoints: LawPublicEndpoints): string;
export declare function formatLawDiscover(endpoints: LawPublicEndpoints, policyCount: number, samples: LawPolicyMeta[]): string;
export declare function formatLawPolicyFull(policy: LawPolicy): string;
//# sourceMappingURL=law-format.d.ts.map