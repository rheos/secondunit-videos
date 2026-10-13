#!/bin/zsh
# Giulietta Masina with on-screen lyrics (#117): lay the captioned spans over the v4 master frame for frame, and cut the
# three 9:16 verse clips. Run from the project folder after zsh tools/lyrics_render.sh (frames in out/frames_cap/).
# The master is read, never written; every output is a new versioned file. Adapted from bobwiseman-me-and-jimi.
set -e -o pipefail
M=out/gm_looks-v4_f00000-f03337_24fps_draft.mp4
O169=out/gm_looks-v4-lyrics-v1_f00000-f03337_24fps_draft.mp4
SONG=source/giulietta-masina.wav
pad() { printf %05d $1; }

# ---- 16:9 (1280x720, as the v4 draft): the caption spans over the master ----
spans=("kite-cap 136 816" "poster-cap 816 1427" "dream-cap 1456 1851" "dream-cap 2148 2220" "leader-cap 2220 3087")
ins=(); flt=""; last="0:v"; k=1
for sp in $spans; do
  set -- ${=sp}
  ins+=(-framerate 24 -i "out/frames_cap/$1_f$(pad $2)-f$(pad $3)/f_%06d.jpg")
  flt+="[$k:v]scale=1280:720:flags=lanczos,setpts=PTS-STARTPTS+$2/(24*TB)[p$k];[$last][p$k]overlay=eof_action=pass:enable='between(n,$2,$(($3 - 1)))'[v$k];"
  last="v$k"; k=$((k + 1))
done
ffmpeg -y -loglevel error -i $M ${ins[@]} -filter_complex "${flt%;}" -map "[$last]" -map 0:a -c:v libx264 -preset medium -crf 20 \
  -pix_fmt yuv420p -c:a copy -movflags +faststart $O169
echo wrote $O169

# ---- 9:16 verse clips, 720x1280: the tall renders, renumbered into one run per clip ----
mkdir -p out/9x16/verses work/clipseq
clip() { # name f0 f1 fadeIn fadeOut  then (frames dir, its first song frame) pairs, in order
  local name=$1 f0=$2 f1=$3 fi=$4 fo=$5; shift 5
  local sq=work/clipseq/$name; rm -rf $sq; mkdir -p $sq; local n=0
  while (( $# )); do
    local dir=$1 s0=$2; shift 2
    for ((f = f0 + n; f < f1; f++)); do
      local src=$dir/f_$(printf %06d $((f - s0))).jpg
      [[ -f $src ]] || break
      ln -s $PWD/$src $sq/$(printf %06d $n).jpg; n=$((n + 1))
    done
  done
  (( n == f1 - f0 )) || { echo "$name: $n frames, want $((f1 - f0))"; exit 1; }
  local dur=$(awk -v a=$f0 -v b=$f1 'BEGIN { printf "%.6f", (b - a) / 24 }') ss=$(awk -v a=$f0 'BEGIN { printf "%.6f", a / 24 }')
  local o=out/9x16/verses/gm_${name}-lyrics-v1_f$(pad $f0)-f$(pad $f1)_24fps_9x16.mp4
  ffmpeg -y -loglevel error -framerate 24 -i $sq/%06d.jpg -ss $ss -t $dur -i $SONG -map 0:v -map 1:a \
    -af "afade=t=in:st=0:d=$fi,afade=t=out:st=$(awk -v d=$dur -v f=$fo 'BEGIN { printf "%.4f", d - f }'):d=$fo" \
    -c:v libx264 -preset slow -crf 23 -maxrate 4.5M -bufsize 9M -pix_fmt yuv420p -c:a aac -b:a 256k -t $dur -movflags +faststart $o
  echo wrote $o
}
K=out/frames_cap/kite-9x16cap_f00109-f00816; PO=out/frames_cap/poster-9x16cap_f00816-f01440
D=out/frames_cap/dream-9x16cap_f02150-f02220; L=out/frames_cap/leader-9x16cap_f02220-f03108
clip verse1 109 786 0.05 0.25 $K 109              # on the cut at 4.54 (guitar pulse); ends in the breath after the long last note (32.55)
clip verse2 786 1440 0.12 0.4 $K 109 $PO 816      # 0.15 s before "Giulietta"; the poster tears open, ends as the dream begins (60.0)
clip verse3 2150 3108 0.12 0.5 $D 2150 $L 2220    # 0.17 s before "Giulietta" on the beach; the count, ends after the voice (129.5)
