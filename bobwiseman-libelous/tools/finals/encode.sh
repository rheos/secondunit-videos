#!/bin/zsh
# Libelous TV news v3 finals (#118/#164): 1080p and 720p from the pages' own 1080p frames, 9:16 at 720x1280.
set -e -o pipefail
SONG=source/libelous.wav; D=$(awk 'BEGIN{printf "%.6f", 8171/24}'); O=out/finals/lib_tvnews-v3-final_f00000-f08171_24fps
mkdir -p out/finals
X=(-c:v libx264 -preset slow -pix_fmt yuv420p -c:a aac -b:a 320k -t $D -movflags +faststart -threads 4)
nice -n 15 ffmpeg -y -v error -framerate 24 -i work/finals/wide/%06d.jpg -i $SONG -map 0:v -map 1:a -crf 17 $X ${O}_1080p.mp4
nice -n 15 ffmpeg -y -v error -framerate 24 -i work/finals/wide/%06d.jpg -i $SONG -map 0:v -map 1:a -vf scale=1280:720:flags=lanczos -crf 18 $X ${O}_720p.mp4
nice -n 15 ~/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python tools/finals/tall.py | \
  nice -n 15 ffmpeg -y -v error -f rawvideo -pix_fmt rgb24 -s 720x1280 -framerate 24 -i - -i $SONG -map 0:v -map 1:a -crf 21 -maxrate 4.5M -bufsize 9M $X ${O}_9x16.mp4
ls -la out/finals
