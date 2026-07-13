#!/usr/bin/env bash
# Copy a fresh jexxx.us-cli dist into vendor/ for solo-repo Vercel deploys.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SIBLING="$ROOT/../jexxx.us-cli"
VENDOR_ROOT="$ROOT/vendor/jexxxus-cli"
VENDOR_DIST="$VENDOR_ROOT/dist"

if [ ! -f "$SIBLING/package.json" ]; then
  echo "Expected monorepo sibling at ${SIBLING}" >&2
  exit 1
fi

echo "Building jexxx.us-cli in ${SIBLING}"
(cd "$SIBLING" && npm run build)

mkdir -p "$VENDOR_ROOT"
rm -rf "$VENDOR_DIST"
rsync -a --delete "$SIBLING/dist/" "$VENDOR_DIST/"

VENDOR_SYNC_ROOT="$VENDOR_ROOT" VENDOR_SYNC_SIBLING="$SIBLING" node -e "
const fs = require('fs');
const path = require('path');
const root = process.env.VENDOR_SYNC_ROOT;
const sibling = process.env.VENDOR_SYNC_SIBLING;
const siblingPkg = JSON.parse(fs.readFileSync(path.join(sibling, 'package.json'), 'utf8'));
const vendorPkg = {
  name: 'jexxxus-cli-vendor',
  private: true,
  type: 'module',
  scripts: { postinstall: 'patch-package' },
  dependencies: { ...siblingPkg.dependencies, 'patch-package': '^8.0.1' },
};
fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(vendorPkg, null, 2) + '\n');
"

cp "$SIBLING/package-lock.json" "$VENDOR_ROOT/package-lock.json"
rm -rf "$VENDOR_ROOT/patches"
if [ -d "$SIBLING/patches" ]; then
  cp -R "$SIBLING/patches" "$VENDOR_ROOT/patches"
fi

find "$VENDOR_ROOT" -mindepth 1 -maxdepth 1 \
  ! -name dist \
  ! -name VENDOR_REV \
  ! -name package.json \
  ! -name package-lock.json \
  ! -name patches \
  -exec rm -rf {} +

echo "Installing vendored jexxx.us-cli runtime dependencies"
(cd "$VENDOR_ROOT" && npm ci --omit=dev)

REV="$(git -C "$SIBLING" rev-parse HEAD)"
echo "$REV" > "$VENDOR_ROOT/VENDOR_REV"
echo "Synced vendor/jexxxus-cli/dist @ ${REV:0:7}"
echo ""
echo "Commit from blxckchat.jexxx.us:"
echo "  git add vendor/jexxxus-cli"
echo "  git commit -m \"chore: sync vendored jexxx.us-cli dist\""
echo "  git push"