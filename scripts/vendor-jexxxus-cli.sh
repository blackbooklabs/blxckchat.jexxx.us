#!/usr/bin/env bash
# Vendors jexxx.us-cli for solo-repo Vercel deploys (no monorepo sibling).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SIBLING="$ROOT/../jexxx.us-cli"
VENDOR_DIR="$ROOT/vendor/jexxxus-cli"
REPO="${JEXXXUS_CLI_VENDOR_REPO:-https://github.com/blxckbooklabs/jexxx.us-cli.git}"
REF="${JEXXXUS_CLI_VENDOR_REF:-main}"

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

if [ -f "$VENDOR_DIR/dist/index.js" ] && [ "${JEXXXUS_CLI_VENDOR_FORCE:-}" != "1" ]; then
  echo "Using cached vendor/jexxxus-cli dist"
  exit 0
fi

mkdir -p "$(dirname "$VENDOR_DIR")"

if [ ! -d "$VENDOR_DIR/.git" ]; then
  echo "Cloning jexxx.us-cli (${REF}) into vendor/jexxxus-cli"
  git clone --depth 1 --branch "$REF" "$REPO" "$VENDOR_DIR"
else
  echo "Updating vendor/jexxxus-cli (${REF})"
  git -C "$VENDOR_DIR" fetch origin "$REF" --depth 1
  git -C "$VENDOR_DIR" checkout FETCH_HEAD
fi

build_cli "$VENDOR_DIR"