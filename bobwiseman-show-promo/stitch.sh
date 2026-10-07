#!/bin/zsh
# Join every rendered promo, in shows.json order, into one reel.
# Uses the concat FILTER, not the demuxer (the demuxer froze the Airplane v4 base on one frame).
set -euo pipefail
cd "${0:A:h}"

slugs=(${(f)"$(python3 -c "import json;[print(r['slug']) for r in json.load(open('shows.json'))]")"})
inputs=()
chain=""
i=0
for s in $slugs; do
  f="renders/$s.mp4"
  [[ -s $f ]] || { echo "missing $f" >&2; exit 1; }
  inputs+=(-i $f)
  chain+="[$i:v][$i:a]"
  i=$((i+1))
done

out="renders/reel_all-shows.mp4"
ffmpeg -v error -y $inputs -filter_complex "${chain}concat=n=$i:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k "$out"

# frame check: the reel must be exactly the sum of its parts
want=$(for s in $slugs; do ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 renders/$s.mp4; done | paste -sd+ - | bc)
got=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$out")
echo "$out: $got frames (parts sum to $want)"
[[ $got == $want ]]
