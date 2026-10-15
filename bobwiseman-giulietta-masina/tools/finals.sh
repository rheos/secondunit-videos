#!/bin/zsh
# Giulietta Masina final deliverables with lyrics (#117), after Bob's sign-off on 2026-10-14 ("1080, 740, and 9x16").
# Run from the project folder: zsh tools/finals.sh [render|build|all] [wide|tall]  (the second word encodes one aspect only)
#   render  draws only the 9:16 spans the verse clips never covered (kite f0-109, the whole dream f1440-2220, the leader
#           tail f3108-3337) with the extended pan-and-scan plan; the dream is redrawn whole so no seam lands mid-shot.
#   build   lays every finished frame out on the song grid and encodes the three finals into out/finals/.
# No 16:9 frame is redrawn: the page always draws at 1920x1080, so the v4 master's own frames (out/frames_looks_*) and
# the caption spans (out/frames_cap/*-cap_*) are already native 1080p. The 720p final is the same frames scaled down
# once (the v1 lyric cut was an overlay on the 720p master, two encodes deep). Frame sequences are hard links in
# work/finals/, so a later render that clears an out/frames_* folder can't change them.
set -e -o pipefail
WK=${WK:-2}
SONG=source/giulietta-masina.wav
pad() { printf %05d $1; }

r() { # page name f0 f1: render a 9:16 span into out/frames_cap/<name>_f<f0>-f<f1> (skipped when complete)
  local page=$1 name=$2 a=$3 b=$4
  local t0=$(node -e "console.log($a/24)") t1=$(node -e "console.log($b/24)")
  local fd=out/frames_cap/${name}_f$(pad $a)-f$(pad $b)
  if [[ -f $fd/f_$(printf %06d $(($b - $a - 1))).jpg ]]; then echo "have $fd"; return; fi
  mkdir -p out/9x16/parts out/frames_cap
  PAGE=looks/$page.html nice -n 15 node render.mjs $t0 $t1 out/9x16/parts/gm_${name}-final_f$(pad $a)-f$(pad $b)_24fps_draft.mp4 $WK 24 1 | tail -2
  rm -rf $fd; mv out/frames_looks_${page//-/_}_html_${t0}_${t1} $fd
}

seq_link() { # seqdir then (dir, its first song frame, f0, f1) quads, in order; links song frames f0..f1-1
  local sq=$1; shift
  while (( $# )); do
    local dir=$1 s0=$2 a=$3 b=$4; shift 4
    for ((f = a; f < b; f++)); do
      local src=$dir/f_$(printf %06d $((f - s0))).jpg
      [[ -f $src ]] || { echo "missing $src"; exit 1; }
      ln -f $src $sq/$(printf %06d $f).jpg
    done
  done
}

if [[ ${1:-all} != build ]]; then
  r kite-9x16-cap kite-9x16cap 0 109
  r dream-9x16-cap dream-9x16cap 1440 2220
  r leader-9x16-cap leader-9x16cap 3108 3337
fi
[[ ${1:-all} == render ]] && exit 0

N=3337; D=$(awk -v n=$N 'BEGIN { printf "%.6f", n / 24 }')
mkdir -p out/finals; rm -rf work/finals; mkdir -p work/finals/wide work/finals/tall

# ---- 16:9: the v4 master's frames, the caption spans on top of them ----
C=out/frames_cap
seq_link work/finals/wide \
  out/frames_looks_kite_html_0_34 0 0 136            $C/kite-cap_f00136-f00816 136 136 816 \
  $C/poster-cap_f00816-f01427 816 816 1427           out/frames_looks_poster_html_34_60 816 1427 1440 \
  out/frames_looks_dream_html_60_92.5 1440 1440 1456 $C/dream-cap_f01456-f01851 1456 1456 1851 \
  out/frames_looks_dream_html_77.08333333333333_92.5 1850 1851 2148  $C/dream-cap_f02148-f02220 2148 2148 2220 \
  $C/leader-cap_f02220-f03087 2220 2220 3087         out/frames_looks_leader_html_92.5_139.04166666666666 2220 3087 3337

# ---- 9:16, 720x1280: the delivered verse spans plus the new ones ----
seq_link work/finals/tall \
  $C/kite-9x16cap_f00000-f00109 0 0 109              $C/kite-9x16cap_f00109-f00816 109 109 816 \
  $C/poster-9x16cap_f00816-f01440 816 816 1440       $C/dream-9x16cap_f01440-f02220 1440 1440 2220 \
  $C/leader-9x16cap_f02220-f03108 2220 2220 3108     $C/leader-9x16cap_f03108-f03337 3108 3108 3337

for s in wide tall; do n=$(ls work/finals/$s | wc -l | tr -d ' '); (( n == N )) || { echo "$s: $n frames, want $N"; exit 1; }; done

O=out/finals/gm_looks-v4-lyrics-final
enc() { # seqdir out vf x264-args...
  local sq=$1 o=$2 vf=$3; shift 3
  nice -n 15 ffmpeg -y -loglevel error -framerate 24 -i $sq/%06d.jpg -i $SONG -map 0:v -map 1:a -vf "$vf" \
    -c:v libx264 -preset slow "$@" -pix_fmt yuv420p -c:a aac -b:a 320k -t $D -movflags +faststart $o
  echo wrote $o
}
[[ ${2:-both} == tall ]] || enc work/finals/wide ${O}_f00000-f03337_24fps_1080p.mp4 "null" -crf 17 -threads 4
[[ ${2:-both} == tall ]] || enc work/finals/wide ${O}_f00000-f03337_24fps_720p.mp4 "scale=1280:720:flags=lanczos" -crf 18 -threads 4
[[ ${2:-both} == wide ]] || enc work/finals/tall ${O}_f00000-f03337_24fps_9x16.mp4 "null" -crf 23 -maxrate 4.5M -bufsize 9M -threads 4
