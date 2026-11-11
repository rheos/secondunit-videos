#!/bin/zsh
# In Her Dream finals (Bob signed off draft 4 on 2026-10-20: "let's render it up, export it as per the usual").
# The usual for Bob = 1080p + 720p + the full song in 9:16, no lyrics on screen (this film never had them), no clips.
#   1. the 1080p master comes from GitHub (run from a cloud-render checkout):
#      tools/cloud-render/cloud-render.sh bobwiseman-in-her-dream film.html 0 300.083333 <out>/..._1080p.mp4 20 1080
#   2. zsh tools/finals.sh out/finals/ihd_film-v4-final_f00000-f07202_24fps_1080p.mp4
# The 720p is a downscale of the master. The 9:16 is the whole film laid onto the cut-paper page (page-9x16.html,
# drawn once by tools/page-png.mjs) in its card window at 45,700 990x557 on the 1080x1920 page, then 720x1280 at the
# house phone encode. The film is never cropped or redrawn; the song is stream-copied from the master.
set -e -o pipefail
M=$1; [[ -f $M ]] || { echo "usage: zsh tools/finals.sh <1080p master>"; exit 2; }
base=${M:t:r}; base=${base%_1080p}
mkdir -p out/finals out/9x16
[[ -f out/9x16/page-9x16-bg.png ]] || node tools/page-png.mjs $PWD/page-9x16.html $PWD/out/9x16/page-9x16-bg.png
nice -n 15 ffmpeg -y -loglevel error -i $M -map 0 -vf "scale=1280:720:flags=lanczos" -c:v libx264 -preset slow -crf 20 \
  -pix_fmt yuv420p -c:a copy -movflags +faststart out/finals/${base}_720p.mp4
nice -n 15 ffmpeg -y -loglevel error -loop 1 -framerate 24 -i out/9x16/page-9x16-bg.png -i $M \
  -filter_complex "[1:v]scale=990:557:flags=lanczos[f];[0:v][f]overlay=45:700:shortest=1,scale=720:1280:flags=lanczos,format=yuv420p[v]" \
  -map "[v]" -map 1:a -c:v libx264 -preset slow -crf 23 -maxrate 4.5M -bufsize 9M -c:a copy -movflags +faststart \
  out/finals/${base}_9x16.mp4
for f in out/finals/${base}_{1080p,720p,9x16}.mp4; do
  echo "$f $(ffprobe -v error -count_packets -select_streams v -show_entries stream=width,height,nb_read_packets -of csv=p=0 $f)"
done
