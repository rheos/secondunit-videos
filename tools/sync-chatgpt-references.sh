#!/usr/bin/env bash
# Bring reference profiles built by ChatGPT into references/ so every agent working in secondunit/ can find them.
# Source: ~/Documents/ChatGPT/IndieAgent/references/<first-last>/   Target: references/<first-last>/
#
#   tools/sync-chatgpt-references.sh            dry run: list what would change, copy nothing
#   tools/sync-chatgpt-references.sh --apply    copy, then review with git status and commit on a branch
#
# Compares by content (checksums), not timestamps. Never deletes anything in the repo and never overwrites an
# existing profile's README.md (it says so instead). PDFs, .DS_Store, files over 25 MB and anything the profile's own
# .gitignore lists stay local; large sources belong in that profile's sources/*manifest.json with URL and SHA-256.
set -euo pipefail
src_root="${CHATGPT_REFERENCES:-$HOME/Documents/ChatGPT/IndieAgent/references}"
repo_root="$(git rev-parse --show-toplevel)"
dst_root="$repo_root/references"
mode="dry"; [ "${1:-}" = "--apply" ] && mode="apply"
[ -d "$src_root" ] || { echo "No ChatGPT references folder at $src_root"; exit 1; }

new_profiles=()
for src in "$src_root"/*/; do
  name="$(basename "$src")"
  dst="$dst_root/$name"
  opts=(-rl --exclude='*.pdf' --exclude='.DS_Store' --max-size=25m)
  [ -f "$dst/.gitignore" ] && opts+=(--exclude-from="$dst/.gitignore")
  if [ ! -d "$dst" ]; then new_profiles+=("$name")
  else
    # The repo copy of README.md carries a "Where this copy lives" section; merge it by hand, never overwrite.
    opts+=(--exclude='/README.md')
    cmp -s "$src/README.md" "$dst/README.md" 2>/dev/null || echo "== $name: README.md differs from the ChatGPT copy; merge by hand"
  fi
  if [ "$mode" = "dry" ]; then
    changes="$(rsync "${opts[@]}" -n -i -c "$src" "$dst/" | grep '^[<>ch]' || true)"
    if [ -n "$changes" ]; then echo "== $name"; echo "$changes"; else echo "== $name: up to date"; fi
  else
    mkdir -p "$dst"
    rsync "${opts[@]}" -c "$src" "$dst/"
    if [ ! -f "$dst/.gitignore" ]; then
      printf '%s\n' '# Large source files stay local; record URL and SHA-256 in sources/*manifest.json.' '*.pdf' > "$dst/.gitignore"
    fi
    echo "== $name: synced"
  fi
done

skipped="$(cd "$src_root" && find . -type f -size +25M ! -name '*.pdf' | sed 's|^\./||' || true)"
[ -n "$skipped" ] && { echo; echo "Left out (over 25 MB, not a PDF): add them to a manifest or shrink them:"; echo "$skipped"; }
if [ ${#new_profiles[@]} -gt 0 ]; then
  echo; echo "New profiles: ${new_profiles[*]}"
  echo "Add each to the table in references/README.md and a card in references/index.html."
fi
[ "$mode" = "dry" ] && echo && echo "Dry run. Re-run with --apply to copy."
exit 0
