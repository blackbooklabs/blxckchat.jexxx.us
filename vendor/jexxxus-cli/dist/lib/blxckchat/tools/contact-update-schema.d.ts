/** JSON-schema fragment for update_contact.updates — mirrors dashboard columns. */
export declare const CONTACT_UPDATE_PROPERTIES: {
    readonly name: {
        readonly type: "string";
        readonly description: "Display name";
    };
    readonly photo: {
        readonly type: "string";
        readonly description: "Photo URL";
    };
    readonly notes: {
        readonly type: "string";
        readonly description: "Free-form notes (not for phone/email)";
    };
    readonly tags: {
        readonly type: "array";
        readonly items: {
            readonly type: "string";
        };
        readonly description: "Tags";
    };
    readonly phone: {
        readonly type: "string";
        readonly description: "Phone number — dedicated column shown in BLXCKBOOK/NXT dashboards";
    };
    readonly email: {
        readonly type: "string";
        readonly description: "Email address — dedicated column";
    };
    readonly social_links: {
        readonly type: "array";
        readonly description: "Social links, e.g. [{\"platform\":\"instagram\",\"url\":\"https://...\"}]";
        readonly items: {
            readonly type: "object";
            readonly properties: {
                readonly platform: {
                    readonly type: "string";
                };
                readonly url: {
                    readonly type: "string";
                };
            };
        };
    };
    readonly relationship_status: {
        readonly type: "string";
        readonly description: "Talking | Dating | Committed | Ended";
    };
    readonly visibility: {
        readonly type: "string";
        readonly enum: readonly ["private", "shared", "ecosystem"];
    };
    readonly is_discoverable: {
        readonly type: "boolean";
    };
    readonly linked_ecosystem_id: {
        readonly type: "string";
        readonly description: "Linked JEXXXUS user id";
    };
    readonly priority_level: {
        readonly type: "string";
        readonly description: "NXT priority: MAXIMUM | High | Medium | Low";
    };
    readonly primary_platform: {
        readonly type: "string";
        readonly description: "NXT primary platform";
    };
    readonly personality_traits: {
        readonly type: "array";
        readonly items: {
            readonly type: "string";
        };
        readonly description: "NXT personality traits";
    };
    readonly urls: {
        readonly type: "array";
        readonly items: {
            readonly type: "string";
        };
        readonly description: "NXT profile URLs";
    };
    readonly vibe: {
        readonly type: "string";
        readonly description: "NXT vibe label";
    };
    readonly engagement_style: {
        readonly type: "string";
        readonly description: "NXT engagement style";
    };
    readonly chemistry_notes: {
        readonly type: "string";
        readonly description: "NXT chemistry notes";
    };
    readonly last_interaction_date: {
        readonly type: "string";
        readonly description: "ISO timestamp of last interaction";
    };
    readonly metadata: {
        readonly type: "object";
        readonly description: "Arbitrary JSON metadata object";
    };
};
export declare const CONTACT_UPDATABLE_FIELD_LIST: string;
//# sourceMappingURL=contact-update-schema.d.ts.map