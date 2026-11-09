#!/bin/zsh
# paint.sh <plate>: one layer through GPT Image via Codex (ChatGPT plan, no credits) into work/plates/<plate>.png
set -e
cd ${0:A:h}
k=$1
read -r size prompt < <(python3 -c "import json,sys;d=json.load(open('plates.json'));p=d['plates'][sys.argv[1]];print(p['size'], d['style']+' '+p['prompt'])" $k)
mkdir -p work/plates
~/.claude/skills/video-production/bin/gptimg -s $size -o work/plates/$k.png -r work/style_ref.png "$prompt"
