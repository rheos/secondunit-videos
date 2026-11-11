#!/bin/zsh
# paint.sh <plate>...: paint pieces through GPT Image via Codex (ChatGPT plan, no credits) into work/plates/<plate>.png
# Never overwrites: an existing plate is kept; pass a new key (guard_v2) or delete the file yourself to repaint.
set -e
cd ${0:A:h}
mkdir -p work/plates
for k in "$@"; do
  [[ -f work/plates/$k.png ]] && { echo "$k: exists, skipped"; continue; }
  read -r size prompt < <(python3 -I -c "import json,sys;d=json.load(open('plates.json'));p=d['plates'][sys.argv[1]];print(p['size'], d['style']+' '+p['prompt'])" $k)
  ( ~/.claude/skills/video-production/bin/gptimg -s $size -o work/plates/$k.png -r work/style_ref.png "$prompt" > work/plates/$k.log 2>&1 && echo "$k: ok" || echo "$k: FAILED (see work/plates/$k.log)" ) &
done
wait
