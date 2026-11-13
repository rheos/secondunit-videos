#!/bin/zsh
# Full render of verse 1: scene -> clean 1080p picture in parallel chunks -> song 0-39 s muxed -> VFX finish -> 720p review.
# Sound is the song only (no added effects). Run from anywhere; renders go to out/ (gitignored).
#   scene/render.sh            all steps
#   JOBS=4 SS=2 scene/render.sh
set -euo pipefail
cd "${0:A:h}/.."
jobs_n=${JOBS:-4}
ss=${SS:-2}
frames=938                     # 39 s at 24 fps plus one spare frame; trimmed to 39.0 s at the mux
ruby_bin=/usr/local/opt/ruby/bin/ruby
mg=work/mv/tools/graphics/.build/release/mgraphics
mvfx=work/mv/tools/vfx/.build/release/mvfx
mkdir -p out/full

nice -n 15 $ruby_bin scene/cap.rb

# 1. picture, chunked (each frame is a pure function of its time, so chunks match a single pass)
rm -rf out/full/parts && mkdir -p out/full/parts
for i in $(seq 0 $((jobs_n - 1))); do
  from=$(( frames * i / jobs_n )); to=$(( frames * (i + 1) / jobs_n ))
  nice -n 15 $mg work/mv/scenes/cap.json --out out/full/parts/$(printf %03d $i).mp4 --frames $frames --fps 24 \
    --width 1920 --height 1080 --supersample $ss --bitrate 20000000 --from $from --to $to > out/full/parts/$i.log &
done
wait
for f in out/full/parts/*.mp4; do echo "file '${f:A}'"; done > out/full/parts/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/full/parts/list.txt -c copy out/full/cap-line_picture.mp4

# 2. the song, 0 to 39 s, under the picture
ffmpeg -v error -y -i out/full/cap-line_picture.mp4 -i _in/children-at-play.mp3 -map 0:v:0 -map 1:a:0 -t 39 \
  -c:v copy -c:a aac -b:a 256k out/full/cap-line_clean.mp4

# 3. VFX from the scene's own events
nice -n 15 $ruby_bin scene/finish.rb out/full/cap-line_clean.mp4 out/full/vfx.json
rm -f out/full/cap-line_finished.mp4
nice -n 15 $mvfx --in out/full/cap-line_clean.mp4 --cues out/full/vfx.json --out out/full/cap-line_finished.mp4 --bitrate 16000000

# 4. 720p review cut
ffmpeg -v error -y -i out/full/cap-line_finished.mp4 -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slow -crf 20 \
  -pix_fmt yuv420p -c:a aac -b:a 192k -t 39 -movflags +faststart out/full/cap-line_verse1_720p.mp4
rm -rf out/full/parts
ls -la out/full
