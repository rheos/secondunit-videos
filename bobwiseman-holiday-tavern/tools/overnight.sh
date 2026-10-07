#!/bin/zsh
# Overnight: render draft-2 parts, assemble, scan, upload; then the aliens look test.
# usage: tools/overnight.sh   (run from the project folder)
set -o pipefail
cd ${0:A:h}/..
py=~/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python
log=out/overnight.log; exec >>$log 2>&1
echo "== start $(date)"
PAGE=looks/charcoal.html nice -n 10 node render.mjs 24 130 out/charcoal_draft2.mp4 6 24 0.6667 || { echo "charcoal render FAILED"; exit 1; }
PAGE=looks/flash.html nice -n 10 node render.mjs 130 177 out/flash_draft2.mp4 6 24 0.6667 || { echo "flash render FAILED"; exit 1; }
$py tools/badframes.py out/charcoal_draft2.mp4 out/flash_draft2.mp4
sed -e 's#out/diary_draft.mp4    576  1284#out/charcoal_draft2.mp4 576 2544#' \
    -e '/charcoal_head_77.5-120/d' -e '/charcoal_tail_120-130_merged/d' \
    -e 's#out/flash_draft.mp4 #out/flash_draft2.mp4#' tools/assemble.sh > tools/assemble2.sh && chmod +x tools/assemble2.sh
grep -n "out/" tools/assemble2.sh
cut=out/holiday-tavern_draft2_f00000-f05011_24fps_draft.mp4
nice -n 10 ./tools/assemble2.sh $cut || { echo "assemble FAILED"; exit 1; }
[ -s $cut ] || { echo "no cut"; exit 1; }
$py tools/badframes.py $cut
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $cut)
echo "duration $dur"
if [[ ${dur%.*} -ge 208 ]]; then
  (cd ~/Code/novadiem/indieagent/secondunit && uv run --with google-api-python-client --with google-auth-oauthlib python secondunit-worker/yt_upload.py mv-projects/bobwiseman-holiday-tavern/$cut --title "Bob Wiseman - After The Holiday Tavern (draft 2)" --note "Holiday Tavern draft 2 (overnight): charcoal 0:24-2:10 with the new cast and the broken keyboard, flash photos recast with Greg Keelor as Gregory, neon intro and ending.")
else echo "cut too short, not uploading"; fi
if [ -f looks/aliens.html ]; then
  PAGE=looks/aliens.html nice -n 10 node render.mjs 130 169.5 out/aliens_draft.mp4 6 24 0.6667 && $py tools/badframes.py out/aliens_draft.mp4
fi
echo "== end $(date)"
