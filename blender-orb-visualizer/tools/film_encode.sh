#!/bin/zsh
# Encode a film take's frames (named by song frame, 1280x720, the pixel look already in them) and mux the song
# under them from the same song time: frame f sits at f / 24 s. Drafts: crf 20, AAC 192k.
#   tools/film_encode.sh <take dir> <song.wav> [name]
set -e -o pipefail
dir=$1; song=$2; name=${3:-${dir:t}}
frames=$dir/frames
first=$(ls $frames | head -1 | sed 's/\.png//'); n=$(ls $frames/*.png | wc -l | tr -d ' ')
last=$(( 10#$first + n - 1 ))
ss=$(python3 -c "print(${first#0*} / 24)" 2>/dev/null || python3 -c "print(int('$first') / 24)")
out=$dir/${name}_f$(printf %05d $((10#$first)))-f$(printf %05d $last)_24fps_draft.mp4
ffmpeg -nostdin -loglevel error -y -framerate 24 -start_number $((10#$first)) -i $frames/%04d.png -ss $ss -t $(python3 -c "print($n/24)") -i $song \
  -map 0:v -map 1:a -vf format=yuv420p -c:v libx264 -preset slow -crf 20 -c:a aac -b:a 192k -shortest -movflags +faststart $out
echo "$out ($n frames, song from ${ss}s)"
