#!/bin/zsh
# paint.sh <plate>...: paint pieces through GPT Image via Codex (ChatGPT plan, no credits) into work/plates/<plate>.png
# All plates named in one call are painted in parallel (six at a time has worked). Never overwrites: an existing
# plate is kept; to repaint, add a new key (guard_v2) to plates.json.
# plates.json: "full": true = the prompt stands alone (no style prefix or style image); "ref": "<plate>" = an edit
# of that painted plate, attached as image 1.
set -e
cd ${0:A:h}
mkdir -p work/plates
for k in "$@"; do
  [[ -f work/plates/$k.png ]] && { echo "$k: exists, skipped"; continue; }
  IFS=$'\t' read -r size ref prompt < <(python3 -I -c "
import json,sys
d=json.load(open('plates.json')); p=d['plates'][sys.argv[1]]
if p.get('ref'): print(p['size'], 'work/plates/'+p['ref']+'.png', p['prompt'], sep='\t')
elif p.get('full'): print(p['size'], '-', p['prompt'], sep='\t')
else: print(p['size'], 'work/style_ref.png', d['style']+' '+p['prompt'], sep='\t')" $k)
  rflag=(); [[ $ref != - ]] && rflag=(-r $ref)
  ( ~/.claude/skills/video-production/bin/gptimg -s $size -o work/plates/$k.png ${rflag[@]} "$prompt" > work/plates/$k.log 2>&1 && echo "$k: ok" || echo "$k: FAILED (see work/plates/$k.log)" ) &
done
wait
