#!/usr/bin/env bash
# Copy the devweb world kit into a short as <project>/kit/, stamped with the commit it came from.
# Each project keeps its own copy so renders (local and cloud) only ever read inside the project folder.
#   tools/devweb-kit/sync.sh devweb-ep01-oner
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
repo="$(cd "$here/../.." && pwd)"
proj="${1:?usage: sync.sh <project-folder>}"
dest="$repo/$proj/kit"
[ -d "$repo/$proj" ] || { echo "no project folder: $proj" >&2; exit 1; }
rm -rf "$dest"
mkdir -p "$dest"
cp "$here/blink-geo.js" "$here/blink3d.js" "$here/world.js" "$dest/"
rev="$(git -C "$repo" log -1 --format=%h -- tools/devweb-kit 2>/dev/null || true)"
[ -n "$rev" ] || rev="uncommitted"
[ -z "$(git -C "$repo" status --porcelain -- tools/devweb-kit 2>/dev/null)" ] || rev="$rev+local-edits"
printf 'Copied from tools/devweb-kit at %s on %s. Edit the kit there and re-run sync.sh, not this copy.\n' \
  "$rev" "$(date +%Y-%m-%d)" > "$dest/VERSION"
echo "kit -> $proj/kit ($rev)"
