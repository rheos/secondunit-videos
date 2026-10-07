#!/bin/zsh
# Sew the look drafts into one cut on the untouched master audio.
# Each part is trimmed by FRAME COUNT from its own start (a file's frame 0 is its start frame),
# joined with the concat filter (never the concat demuxer), then muxed with assets/song.wav.
# usage: tools/assemble.sh <out.mp4>
set -e -o pipefail
out=$1
# file  start_frame  n_frames   (song frames, 24 fps, half-open)
parts=(
  out/neon_intro.mp4     0    576
  out/diary_draft.mp4    576  1284
  out/charcoal_head_77.5-120.mp4 1860 1020
  out/charcoal_tail_120-130_merged.mp4 2880 240
  out/flash_draft.mp4    3120 948
  out/neon_draft.mp4     4068 384
  out/neon_end.mp4       4452 559
)
ins=(); filt=""; k=0
for ((i=1; i<=${#parts}; i+=3)); do
  f=${parts[i]}; n=${parts[i+2]}
  have=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 $f | tr -d ",")
  (( have >= n )) || { echo "$f has $have frames, needs $n"; exit 1; }
  ins+=(-i $f)
  filt+="[$k:v]trim=end_frame=$n,setpts=PTS-STARTPTS,fps=24,scale=1280:720,setsar=1[v$k];"
  k=$((k+1))
done
cat=""; for ((j=0; j<k; j++)); do cat+="[v$j]"; done
filt+="${cat}concat=n=$k:v=1:a=0[v]"
ffmpeg -y -loglevel error ${ins[@]} -i assets/song.wav -filter_complex "$filt" -map "[v]" -map "${k}:a" \
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart $out
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 $out
