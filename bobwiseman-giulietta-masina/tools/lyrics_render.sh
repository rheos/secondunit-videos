#!/bin/zsh
# Renders only the spans where a lyric shows (16:9) and the three 9:16 verse spans, for tools/lyrics_deliver.sh.
# Run from the project folder: zsh tools/lyrics_render.sh [wide|tall|all]. Frames land in out/frames_cap/<name>/,
# review encodes in out/parts/ and out/9x16/parts/. The v4 master is never touched. 2 workers, niced: the Mac is shared.
set -e -o pipefail
WK=${WK:-2}
r() { # page name f0 f1 scale outdir
  local page=$1 name=$2 a=$3 b=$4 sc=$5 od=$6
  local t0=$(node -e "console.log($a/24)") t1=$(node -e "console.log($b/24)")
  local fd=out/frames_cap/${name}_f$(printf %05d $a)-f$(printf %05d $b)
  if [[ -f $fd/f_$(printf %06d $(($b - $a - 1))).jpg ]]; then echo "have $fd"; return; fi
  mkdir -p $od out/frames_cap
  PAGE=looks/$page.html nice -n 10 node render.mjs $t0 $t1 $od/gm_${name}-v1_f$(printf %05d $a)-f$(printf %05d $b)_24fps_draft.mp4 $WK 24 $sc | tail -2
  rm -rf $fd; mv out/frames_looks_${page//-/_}_html_${t0}_${t1} $fd
}
if [[ ${1:-all} != tall ]]; then
  r kite-cap kite-cap 136 816 0.6667 out/parts
  r poster-cap poster-cap 816 1427 0.6667 out/parts
  r dream-cap dream-cap 1456 1851 0.6667 out/parts
  r dream-cap dream-cap 2148 2220 0.6667 out/parts
  r leader-cap leader-cap 2220 3087 0.6667 out/parts
fi
if [[ ${1:-all} != wide ]]; then
  r kite-9x16-cap kite-9x16cap 109 816 1 out/9x16/parts
  r poster-9x16-cap poster-9x16cap 816 1440 1 out/9x16/parts
  r dream-9x16-cap dream-9x16cap 2150 2220 1 out/9x16/parts
  r leader-9x16-cap leader-9x16cap 2220 3108 1 out/9x16/parts
fi
