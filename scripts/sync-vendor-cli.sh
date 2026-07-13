#!/usr/bin/env bash
# Copy a fresh jexxx.us-cli dist into vendor/ for solo-repo Vercel deploys.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SIBLING="$ROOT/../jexxx.us-cli"
VENDOR_DIST="$ROOT/vendor/jexxxus-cli/dist"

if [ ! -f "$SIBLING/package.json" ]; then
  echo "Expected monorepo sibling at ${SIBLING}" >&2
  exit 1
fi

echo "Building jexxx.us-cli in ${SIBLING}"
(cd "$SIBLING" && npm run build)

mkdir -p "$ROOT/vendor/jexxxus-cli"
rm -rf "$VENDOR_DIST"
rsync -a --delete "$SIBLING/dist/" "$VENDOR_DIST/"
find "$ROOT/vendor/jexxxus-cli" -mindepth 1 -maxdepth 1 ! -name dist ! -name VENDOR_REV -exec rm -rf {} +

REV="$(git -C "$SIBLING" rev-parse HEAD)"
echo "$REV" > "$ROOT/vendor/jexxxus-cli/VENDOR_REV"
echo "Synced vendor/jexxxus-cli/dist @ ${REV:0:7}"