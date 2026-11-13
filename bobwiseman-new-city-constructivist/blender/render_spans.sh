#!/bin/zsh
# Re-render spans of song frames from a saved .blend on the Mac, in short chunks with cool-down pauses (long EEVEE runs
# have crashed this Mac's GPU). Frames land as <out>/f####.png, ready to splice over a full render.
#   blender/render_spans.sh <scene.blend> <outdir> "708-862 1087-1294 ..." [chunk=78] [pause=30]
set -euo pipefail
blend=${1:?scene.blend}; outdir=${2:?outdir}; spans=${3:?spans}; chunk=${4:-78}; pause=${5:-30}
mkdir -p "$outdir"
for span in ${=spans}; do
  a=${span%-*}; e=${span#*-}
  for (( s = a; s < e; s += chunk )); do
    t=$(( s + chunk - 1 )); (( t > e - 1 )) && t=$(( e - 1 ))
    echo "frames $s-$t $(date +%H:%M:%S)"
    blender -b "$blend" -o "$PWD/$outdir/f####" -F PNG -s $s -e $t -a | grep -E "Error" || true
    sleep $pause
  done
done
echo "done $(ls $outdir/f*.png | wc -l | tr -d ' ') frames"
