#!/bin/zsh
# paint.sh <medium> <scene>: one board plate through GPT Image via Codex (plan, no credits) into out/
set -e
cd ${0:A:h}
m=$1; s=$2
p=$(python3 -c "import json,sys;d=json.load(open('prompts.json'));print(d['mediums'][sys.argv[1]]['prompt']+' '+d['scenes'][sys.argv[2]]+' '+d['tail'])" $m $s)
mkdir -p out
GPTIMG_CROP169=1 ~/.claude/skills/video-production/bin/gptimg -o out/${m}_${s}.png "$p"
