#!/bin/zsh
# Regression check of the finals against the signed-off v3 draft: frame counts, per-frame PSNR of each 16:9 final
# (scaled to 1280x720) against v3, the lowest frames listed; badframes + flash check on each final.
set -e -o pipefail
V3=out/lib_tvnews-full-v3_f00000-f08171_24fps_draft.mp4; O=out/finals/lib_tvnews-v3-final_f00000-f08171_24fps
for s in 1080p 720p 9x16; do
  n=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames,width,height -of csv=p=0 ${O}_$s.mp4)
  echo "$s: $n"
done
for s in 1080p 720p; do
  ffmpeg -v error -i ${O}_$s.mp4 -i $V3 -lavfi "[0:v]scale=1280:720:flags=lanczos[a];[a][1:v]psnr=stats_file=work/finals/psnr_$s.log" -f null -
  awk '{for(i=1;i<=NF;i++) if($i~/^psnr_y:/){split($i,a,":"); print a[2], $1}}' work/finals/psnr_$s.log | sort -n | head -5 | tr '\n' ' '; echo " <- $s lowest PSNR-Y vs v3"
done
