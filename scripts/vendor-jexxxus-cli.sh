#!/usr/bin/env bash
# Ensures jexxx.us-cli dist is available for prebuild (monorepo sibling or committed vendor).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SIBLING="$ROOT/../jexxx.us-cli"
VENDOR_ROOT="$ROOT/vendor/jexxxus-cli"
VENDOR_DIST="$VENDOR_ROOT/dist"

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

install_vendor_deps() {
  if [ ! -f "$VENDOR_ROOT/package.json" ]; then
    echo "vendor/jexxxus-cli/package.json missing — run scripts/sync-vendor-cli.sh" >&2
    exit 1
  fi
  echo "Installing vendored jexxx.us-cli runtime dependencies"
  (cd "$VENDOR_ROOT" && npm ci --omit=dev)
}

if [ -f "$SIBLING/package.json" ]; then
  build_cli "$SIBLING"
  exit 0
fi

if [ ! -f "$VENDOR_DIST/index.js" ]; then
  echo "jexxx.us-cli dist missing. From the monorepo run: bash scripts/sync-vendor-cli.sh" >&2
  exit 1
fi

install_vendor_deps

REV=""
if [ -f "$VENDOR_ROOT/VENDOR_REV" ]; then
  REV="$(head -c 7 "$VENDOR_ROOT/VENDOR_REV")"
fi
echo "Using committed vendor/jexxxus-cli dist${REV:+ @ ${REV}}"