#!/bin/zsh
# Join the section drafts (video only, concat filter) and mux the untouched master audio.
# usage: tools/assemble.sh <out.mp4> seg1.mp4 seg2.mp4 ...   (segments in song order, each on the 24 fps grid)
set -e -o pipefail
out=$1; shift
n=$#; ins=(); f=""
for s in "$@"; do ins+=(-i "$s"); done
for i in $(seq 0 $((n-1))); do f="${f}[${i}:v]"; done
ffmpeg -y -loglevel error "${ins[@]}" -i assets/song.wav -filter_complex "${f}concat=n=${n}:v=1:a=0[v]" \
  -map "[v]" -map ${n}:a -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -r 24 -c:a aac -b:a 256k -shortest -movflags +faststart "$out"
ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 "$out"
