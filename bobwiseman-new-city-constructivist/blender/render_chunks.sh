#!/bin/zsh
# Render the Blender take in short chunks with cool-down pauses (long EEVEE runs have crashed this Mac's GPU),
# then join the frames with the song into a 720p review cut. Run from the project folder:
#   blender/render_chunks.sh constructivist-blender-a [chunk=78] [pause=30]
set -euo pipefail
take=${1:?take id}; chunk=${2:-78}; pause=${3:-30}
blend=out/blender/$take.blend; frames=out/blender/frames_$take
mkdir -p $frames out/review
blender -b --factory-startup --python blender/newcity_blender.py -- --save $blend | grep -E "newcity|Error" || true
test -f $blend
for (( a = 0; a <= 467; a += chunk )); do
  b=$(( a + chunk - 1 )); (( b > 467 )) && b=467
  echo "chunk $a-$b $(date +%H:%M:%S)"
  blender -b $blend -o "//frames_$take/f####" -F PNG -s $a -e $b -a | grep -E "^Saved|Error" | tail -1
  (( b < 467 )) && sleep $pause
done
n=$(ls $frames/f*.png | wc -l | tr -d ' ')
test "$n" -eq 468 || { echo "expected 468 frames, got $n"; exit 1; }
out=out/review/new-city_${take}_f0-f468_24fps_review.mp4
ffmpeg -loglevel error -y -framerate 24 -start_number 0 -i $frames/f%04d.png -i _in/new-city.wav \
  -map 0:v -map 1:a -t 19.5 -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart $out
echo "wrote $out"
