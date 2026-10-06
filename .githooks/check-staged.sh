#!/bin/sh
# Refuse commits that would put local data into git. Born of the 2026-10-06 Me and Jimi loss: four committed
# symlinks replaced ignored data folders on pull and git deleted their contents.
# Usage: check-staged.sh            (pre-commit: checks the index)
#        check-staged.sh <base-ref> (CI: checks everything added since base)
if [ -n "$1" ]; then LIST=$(git diff --name-status --diff-filter=ACMRT "$1"...HEAD | cut -f2-); MODES=$(git diff --raw --diff-filter=ACMRT "$1"...HEAD | awk '{print $2" "$NF}')
else LIST=$(git diff --cached --name-only --diff-filter=ACMRT); MODES=$(git diff --cached --raw --diff-filter=ACMRT | awk '{print $2" "$NF}'); fi
bad=0
echo "$MODES" | while read -r mode path; do [ "$mode" = "120000" ] && echo "REFUSED symlink: $path"; done | grep . && bad=1
echo "$LIST" | grep -E '(^|/)(out|_in|source|work|output|tmp)(/|$)' | sed 's/^/REFUSED data folder: /' | grep . && bad=1
echo "$LIST" | grep -iE '\.(wav|mp3|m4a|flac|aif|aiff|mp4|mov|webm|mkv)$' | sed 's/^/REFUSED media file: /' | grep . && bad=1
if [ $bad = 1 ]; then echo "Data, media and symlinks stay out of git (see .githooks/check-staged.sh). Unstage them: git restore --staged <path>"; exit 1; fi
exit 0
