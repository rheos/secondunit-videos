#!/bin/zsh
# regress-built.sh: sections 5 to 7 must not change when anything else does. Renders f1800 to f3396 again (SKIN=1, N=12,
# JPEG, as delivered) and compares each file byte for byte with the delivered frames (frames04/ and frames-s67/).
#   zsh tools/regress-built.sh        every 16th frame (100 frames, about 20 s)
#   zsh tools/regress-built.sh 1      every frame (1,597 frames, about 4 minutes)
# Run it after any change to the engine, and after the seven sections' skins are in (a piece or a light that is not
# hidden or at zero outside its own frames shows up here). Exit 1 if any frame differs.
set -e -o pipefail
cd "$(dirname "$0")/.."
STEP=${1:-16}; ROOT=../../out/paper-world; OUT=$ROOT/wip/regress-built; rm -rf $OUT; mkdir -p $OUT
SKIN=1 FRAMES=1800-3396:$STEP N=12 OUT=$OUT nice -n 15 node tools/render.mjs | grep -E "SECTION|PAGEERROR|done"
same=0; bad=()
for f in {1800..3396..$STEP}; do if (( f < 2544 )); then ref=$ROOT/frames04/f$f.jpg; else ref=$ROOT/frames-s67/f$f.jpg; fi
  if cmp -s $OUT/f$f.jpg $ref; then same=$((same + 1)); else bad+=(f$f); fi; done
echo "$same frames byte-identical to the delivered ones, ${#bad} differ ${bad[1,30]}"
rm -rf $OUT
(( ${#bad} == 0 ))
