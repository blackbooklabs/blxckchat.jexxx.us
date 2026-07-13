import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { extractPersonaPrompt, parsePersonaMetadata, } from "./prompt.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/** jexxx.us-cli package root (dist/.../divinities → four levels up). */
const CLI_PACKAGE_ROOT = path.resolve(__dirname, "..", "..", "..", "..");
/**
 * Divinities resolution strategy (priority order):
 * 1. JEXXXUS_OBSIDIAN_PERSONAS_PATH or DIVINITIES_VAULT_PATH (explicit override)
 * 2. Bundled data/ in the CLI package (if Personas/ exists)
 * 3. Monorepo sibling jexxx.us-obsidian/Divinities (walk up from cwd + CLI root)
 */
function discoverMonorepoDivinitiesPaths() {
    const candidates = [
        path.join(CLI_PACKAGE_ROOT, "..", "jexxx.us-obsidian", "Divinities"),
        path.join(CLI_PACKAGE_ROOT, "jexxx.us-obsidian", "Divinities"),
    ];
    let dir = process.cwd();
    for (let depth = 0; depth < 8; depth++) {
        candidates.push(path.join(dir, "jexxx.us-obsidian", "Divinities"));
        const parent = path.dirname(dir);
        if (parent === dir)
            break;
        dir = parent;
    }
    return candidates;
}
export function getDivinitiesSearchPaths() {
    const seen = new Set();
    const paths = [];
    const add = (raw) => {
        const resolved = path.resolve(raw);
        if (!resolved || seen.has(resolved))
            return;
        seen.add(resolved);
        paths.push(resolved);
    };
    const envPath = process.env.JEXXXUS_OBSIDIAN_PERSONAS_PATH?.trim() ||
        process.env.DIVINITIES_VAULT_PATH?.trim();
    if (envPath)
        add(envPath);
    add(path.resolve(__dirname, "data"));
    for (const candidate of discoverMonorepoDivinitiesPaths()) {
        add(candidate);
    }
    return paths;
}
let cachedPersonas = null;
let cachedRoot = null;
function slugify(segment) {
    return segment
        .toLowerCase()
        .replace(/['']/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
export function resolveDivinitiesRoot() {
    for (const base of getDivinitiesSearchPaths()) {
        const personasDir = path.join(base, "Personas");
        if (fs.existsSync(personasDir)) {
            return base;
        }
    }
    return null;
}
function walkMarkdownFiles(dir, out) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        if (ent.name.startsWith("."))
            continue;
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            walkMarkdownFiles(full, out);
        }
        else if (ent.name.endsWith(".md")) {
            out.push(full);
        }
    }
}
function inferPillar(personasRoot, filePath) {
    const rel = path.relative(personasRoot, filePath);
    const parts = rel.split(path.sep);
    if (parts.length < 2)
        return undefined;
    const top = parts[0];
    if (top === "Biblical")
        return undefined;
    return top;
}
function loadPersonaFile(personasRoot, filePath) {
    const markdown = fs.readFileSync(filePath, "utf-8");
    const meta = parsePersonaMetadata(markdown);
    const relFromPersonas = path.relative(personasRoot, filePath);
    const id = slugify(relFromPersonas.replace(/\.md$/i, "").replace(/[/\\]/g, "/"));
    const pillar = inferPillar(personasRoot, filePath);
    const persona = {
        id,
        name: meta.name,
        relativePath: relFromPersonas,
        systemPrompt: extractPersonaPrompt(markdown),
    };
    if (meta.role)
        persona.role = meta.role;
    if (meta.type)
        persona.type = meta.type;
    if (pillar)
        persona.pillar = pillar;
    return persona;
}
/** Load all persona entries from the Obsidian Divinities vault. */
export function listDivinityPersonas(forceReload = false) {
    if (!forceReload && cachedPersonas && cachedRoot) {
        return cachedPersonas;
    }
    const root = resolveDivinitiesRoot();
    if (!root) {
        cachedPersonas = [];
        cachedRoot = null;
        return [];
    }
    const personasRoot = path.join(root, "Personas");
    const files = [];
    walkMarkdownFiles(personasRoot, files);
    const personas = files
        .map((file) => loadPersonaFile(personasRoot, file))
        .filter((p) => p.systemPrompt.trim().length > 0)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    cachedPersonas = personas;
    cachedRoot = root;
    return personas;
}
export function findDivinityPersona(query) {
    const q = query.trim().toLowerCase();
    if (!q)
        return null;
    const personas = listDivinityPersonas();
    const byId = personas.find((p) => p.id === q || p.id.endsWith(`/${q}`));
    if (byId)
        return byId;
    const byName = personas.find((p) => p.name.toLowerCase() === q);
    if (byName)
        return byName;
    const partial = personas.filter((p) => p.name.toLowerCase().includes(q) ||
        p.id.includes(q) ||
        (p.pillar?.toLowerCase().includes(q) ?? false));
    if (partial.length === 1)
        return partial[0];
    return null;
}
export function getDivinityPersonaById(id) {
    return listDivinityPersonas().find((p) => p.id === id) ?? null;
}
/** Reset cached persona index (for tests). */
export function clearDivinityPersonaCache() {
    cachedPersonas = null;
    cachedRoot = null;
}
//# sourceMappingURL=source.js.map