#!/bin/zsh
# tools/assemble.sh <out.mp4> <part.mp4>...  parts are contiguous song-frame spans named ..._f<start>-f<end>_...
# Joins the video with the concat FILTER (the concat demuxer froze a past cut on one frame), checks every part's
# frame count against its name, then muxes the untouched master audio for the whole span.
set -e -o pipefail
out=$1; shift
expect=0; inputs=(); filt=""; i=0
for p in "$@"; do
  span=$(echo $p | grep -o '_f[0-9]*-f[0-9]*_' | tr -d '_f'); s=${span%-*}; e=${span#*-}
  [[ $((10#$s)) -eq $expect ]] || { echo "gap/overlap at $p (starts $s, expected $expect)"; exit 1; }
  n=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 $p | tr -dc 0-9)
  [[ $n -eq $((10#$e - 10#$s)) ]] || { echo "$p has $n frames, expected $((10#$e - 10#$s))"; exit 1; }
  echo "ok $p ($n frames)"
  inputs+=(-i $p); filt+="[${i}:v]setpts=PTS-STARTPTS,fps=24[v$i];"; i=$((i+1)); expect=$((10#$e))
done
cat=""; for k in $(seq 0 $((i-1))); do cat+="[v$k]"; done
ffmpeg -y -v error ${inputs[@]} -i source/giulietta-masina.wav -filter_complex "${filt}${cat}concat=n=$i:v=1:a=0[v]" -map "[v]" -map ${i}:a \
  -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -c:a aac -b:a 256k -t $(echo "$expect/24" | bc -l) -movflags +faststart $out
n=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 $out | tr -dc 0-9)
echo "wrote $out: $n frames (expected $expect)"; [[ $n -eq $expect ]]
