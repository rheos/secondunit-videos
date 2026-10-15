#!/usr/bin/env bash
# Flip a kit project's root between a 720p draft and a 1080p master.
# Drafts are the default (Robin, 2026-10-15: "these are all drafts"); render a master only after he signs off the cut.
#   tools/blueprint-kit/stage.sh novadiem-rheostream draft|master
# Expects index.html's slots inside <div class="stage">. Changes the html class, the root
# data-width/data-height and the viewport meta; plates are untouched (they always draw at 1920x1080).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
repo="$(cd "$here/../.." && pwd)"
proj="${1:?usage: stage.sh <project-folder> draft|master}"
mode="${2:?usage: stage.sh <project-folder> draft|master}"
f="$repo/$proj/index.html"
[ -f "$f" ] || { echo "no $f" >&2; exit 1; }
grep -q 'class="stage"' "$f" || { echo "$proj/index.html has no <div class=\"stage\">; wrap the slots in one first" >&2; exit 1; }
python3 - "$f" "$mode" <<'EOF'
import re, sys
path, mode = sys.argv[1], sys.argv[2]
if mode not in ("draft", "master"):
    sys.exit("mode must be draft or master")
w, h = (1280, 720) if mode == "draft" else (1920, 1080)
s = open(path).read()
s = re.sub(r'<html([^>]*?)\s+class="draft"', r'<html\1', s)
if mode == "draft":
    s = s.replace("<html", '<html class="draft"', 1)
s = re.sub(r'(<meta name="viewport" content=")width=\d+, height=\d+', rf'\g<1>width={w}, height={h}', s)
root = re.search(r'<div\b[^>]*\bid="root"[^>]*>', s, re.S).group(0)
new = re.sub(r'data-width="\d+"', f'data-width="{w}"', root)
new = re.sub(r'data-height="\d+"', f'data-height="{h}"', new)
s = s.replace(root, new)
open(path, "w").write(s)
print(f"{path}: {mode} ({w}x{h})")
EOF
