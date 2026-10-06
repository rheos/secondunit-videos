#!/bin/zsh
# tools/assemble.sh <out.mp4> <part.mp4>...   parts in song order, each named ..._f<start>-f<end>_24fps_...
# Joins the parts' VIDEO with the concat filter (not the demuxer: it froze a section on Airplane v4),
# checks every part starts where the last ended on the 24 fps song grid, muxes the untouched master
# audio once over the whole span, then checks the frame count and that each part actually moves.
set -e -o pipefail
out=$1; shift
prev=""; ins=(); filt=""; i=0
for p in "$@"; do
  r=$(echo $p:t | sed -E 's/.*_f([0-9]+)-f([0-9]+)_24fps.*/\1 \2/'); a=${r% *}; b=${r#* }
  [[ -z $prev ]] && first=$a
  [[ -n $prev && $a != $prev ]] && { echo "gap/overlap: $prev -> $a at $p"; exit 1; }
  n=$(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of default=nw=1:nk=1 $p)
  (( n == b - a )) || { echo "$p has $n frames, expected $((b - a))"; exit 1; }
  ins+=(-i $p); filt+="[$i:v]fps=24,setsar=1[v$i];"; prev=$b; i=$((i + 1))
done
labels=$(for k in $(seq 0 $((i - 1))); do printf "[v$k]"; done)
ffmpeg -v error -y ${ins[@]} -ss $((first / 24.0)) -t $(((prev - first) / 24.0)) -i assets/song.wav \
  -filter_complex "${filt}${labels}concat=n=$i:v=1:a=0[v]" -map "[v]" -map ${i}:a \
  -c:v libx264 -preset medium -crf 23 -maxrate 4.5M -bufsize 9M -pix_fmt yuv420p -c:a aac -b:a 256k \
  -t $(((prev - first) / 24.0)) -movflags +faststart $out
n=$(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of default=nw=1:nk=1 $out)
echo "$out: $n frames (expected $((prev - first)))"
for p in "$@"; do  # each part must change frame to frame somewhere in its middle
  r=$(echo $p:t | sed -E 's/.*_f([0-9]+)-f([0-9]+)_24fps.*/\1 \2/'); a=${r% *}; b=${r#* }
  m=$(( (a + b) / 2 - first )); h1=$(ffmpeg -v error -ss $((m / 24.0)) -i $out -frames:v 1 -f rawvideo -pix_fmt gray -s 64x36 - | md5)
  h2=$(ffmpeg -v error -ss $(((m + 12) / 24.0)) -i $out -frames:v 1 -f rawvideo -pix_fmt gray -s 64x36 - | md5)
  [[ $h1 != $h2 ]] && echo "ok moving: $p:t" || echo "FROZEN?: $p:t"
done
