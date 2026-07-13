import { listProvidersRedacted } from "../../config.js";
import { listCatalogEntries } from "../../providers/catalog.js";
import { listModelOptions } from "../../providers/models.js";
import { BUILTIN_SLASH_COMMANDS, resolveExactCommandToken, resolveSlashCommandName, } from "./registry.js";
import { listDivinityPersonas } from "../../divinities/source.js";
import { fuzzyFilter } from "./fuzzy.js";
import { shouldSuppressSlashArgumentSuggestions } from "./picker-commands.js";
export function getCommandSuggestions(filter) {
    const normalized = filter.replace(/^\//, "");
    if (!normalized.trim()) {
        return BUILTIN_SLASH_COMMANDS.map((cmd) => {
            const hint = cmd.argumentHint ? ` ${cmd.argumentHint}` : "";
            return {
                value: `/${cmd.name}`,
                label: `/${cmd.name}`,
                description: cmd.description + (hint ? ` ${hint}` : ""),
            };
        });
    }
    const items = BUILTIN_SLASH_COMMANDS.flatMap((cmd) => {
        const entries = [
            { cmd, name: cmd.name },
        ];
        for (const alias of cmd.aliases ?? []) {
            entries.push({ cmd, name: alias });
        }
        return entries;
    });
    const filtered = fuzzyFilter(items, filter.replace(/^\//, ""), (e) => e.name, 12);
    const seen = new Set();
    const results = [];
    for (const entry of filtered) {
        if (seen.has(entry.cmd.name))
            continue;
        seen.add(entry.cmd.name);
        const hint = entry.cmd.argumentHint ? ` ${entry.cmd.argumentHint}` : "";
        results.push({
            value: `/${entry.cmd.name}${hint ? "" : ""}`,
            label: `/${entry.cmd.name}`,
            description: entry.cmd.description + (hint ? ` ${hint}` : ""),
        });
    }
    return results;
}
export async function getArgumentSuggestions(commandName, argFilter, ctx) {
    if (shouldSuppressSlashArgumentSuggestions(commandName, argFilter)) {
        return [];
    }
    if (commandName === "model" || commandName === "models" || commandName === "mo") {
        const options = ctx.modelOptions ?? (await listModelOptions(ctx.activeConfig));
        const filtered = fuzzyFilter(options, argFilter, (o) => `${o.label} ${o.id} ${o.provider}`, 12);
        return filtered.map((o) => ({
            value: o.id.includes("/") ? o.id : `${o.provider}/${o.id}`,
            label: o.id,
            description: o.label,
        }));
    }
    if (commandName === "provider" || commandName === "providers") {
        const providers = listProvidersRedacted();
        const saved = fuzzyFilter(providers, argFilter, (p) => `${p.name} ${p.provider} ${p.model}`, 8);
        const savedSuggestions = saved.map((p) => ({
            value: p.name,
            label: p.name,
            description: `${p.provider}/${p.model}${p.isDefault ? " · default" : ""}`,
        }));
        const entries = listCatalogEntries();
        const catalog = fuzzyFilter([...entries], argFilter, (e) => `${e.id} ${e.label}`, 8);
        const connectSuggestions = catalog.map((e) => ({
            value: e.id,
            label: `+ Connect ${e.label}`,
            description: e.hint ?? `Add API key · ${e.id}`,
            connectProvider: e.id,
        }));
        return [...savedSuggestions, ...connectSuggestions];
    }
    if (commandName === "divinities" ||
        commandName === "divinity" ||
        commandName === "persona" ||
        commandName === "personas") {
        const personas = listDivinityPersonas();
        const base = [
            { value: "clear", label: "clear", description: "Return to BLXCKCHAT default agent" },
        ];
        const filtered = fuzzyFilter(personas, argFilter, (p) => `${p.name} ${p.id} ${p.role ?? ""} ${p.pillar ?? ""}`, 12);
        return [
            ...base,
            ...filtered.map((p) => ({
                value: p.name,
                label: p.name,
                description: [p.role, p.pillar].filter(Boolean).join(" · ") || p.id,
            })),
        ];
    }
    return [];
}
export function detectSlashInputMode(value) {
    if (!value.startsWith("/")) {
        return { mode: "none", commandName: "", commandFilter: "", argFilter: "" };
    }
    const rest = value.slice(1);
    const spaceIdx = rest.indexOf(" ");
    if (spaceIdx === -1) {
        const exact = resolveExactCommandToken(rest);
        if (exact) {
            return {
                mode: "argument",
                commandName: exact,
                commandFilter: "",
                argFilter: "",
            };
        }
        return {
            mode: "command",
            commandName: "",
            commandFilter: rest,
            argFilter: "",
        };
    }
    const cmdToken = rest.slice(0, spaceIdx);
    const argPart = rest.slice(spaceIdx + 1);
    const resolved = resolveSlashCommandName(cmdToken);
    return {
        mode: "argument",
        commandName: resolved ?? cmdToken,
        commandFilter: "",
        argFilter: argPart,
    };
}
export async function getSlashSuggestions(value, ctx) {
    const { mode, commandName, commandFilter, argFilter } = detectSlashInputMode(value);
    if (mode === "command") {
        return getCommandSuggestions(commandFilter);
    }
    if (mode === "argument") {
        return getArgumentSuggestions(commandName, argFilter, ctx);
    }
    return [];
}
//# sourceMappingURL=autocomplete.js.map