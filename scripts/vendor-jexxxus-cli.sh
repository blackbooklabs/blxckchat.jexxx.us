#!/usr/bin/env bash
# Ensures jexxx.us-cli dist is available for prebuild (monorepo sibling or committed vendor).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SIBLING="$ROOT/../jexxx.us-cli"
VENDOR_DIST="$ROOT/vendor/jexxxus-cli/dist"

build_cli() {
  local dir="$1"
  echo "Building jexxx.us-cli in ${dir}"
  cd "$dir"
  if [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
  npm run build
}

if [ -f "$SIBLING/package.json" ]; then
  build_cli "$SIBLING"
  exit 0
fi

if [ -f "$VENDOR_DIST/index.js" ]; then
  REV=""
  if [ -f "$ROOT/vendor/jexxxus-cli/VENDOR_REV" ]; then
    REV="$(head -c 7 "$ROOT/vendor/jexxxus-cli/VENDOR_REV")"
  fi
  echo "Using committed vendor/jexxxus-cli dist${REV:+ @ ${REV}}"
  exit 0
fi

echo "jexxx.us-cli dist missing. From the monorepo run: bash scripts/sync-vendor-cli.sh" >&2
exit 1