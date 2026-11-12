#!/bin/zsh
# make04.sh: test 04 end to end. Run from tests/paper-world/:  zsh tools/make04.sh
# Test 04 is test 03 (the painted skin) with two changes: the plate towers are real paper drums, and the foreground
# glass is moved to the frame's right edge. Everything else is the same code path (SKIN=1); SKIN=1 T3=1 is test 03.
set -e -o pipefail
cd "$(dirname "$0")/.."
PY=/Users/robin/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python
OUT=../../out/paper-world
REVIEW=$OUT/andre_paper-world-test04_f1800-f2544_24fps_720x1280.mp4
C=$OUT/check04
mkdir -p $C $OUT/frames04
export SKIN=1

FRAMES=1800-2543 SPEED=12 nice -n 15 node tools/render.mjs > $C/camera-speed.txt; tail -1 $C/camera-speed.txt
FRAMES=1800-2543 N=${N:-12} OUT=$OUT/frames04 nice -n 15 node tools/render.mjs
n=$(ls $OUT/frames04/f*.jpg | wc -l | tr -d ' '); [[ $n == 744 ]] || { echo "expected 744 frames, have $n"; exit 1; }
nice -n 15 ffmpeg -y -loglevel error -framerate 24 -start_number 1800 -i $OUT/frames04/f%04d.jpg -ss 75.0 -to 106.0 -i ../../_in/andre.wav -map 0:v -map 1:a \
  -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart $REVIEW
ffprobe -v error -show_entries stream=codec_type,duration,nb_frames -of compact $REVIEW

# the towers from three heights. The film never sees a risen plate tower from street height, so that still uses a
# check camera (CAM=) on the f2300 state; f2228 is the lowest the film itself gets (the far tower rising, lens 28 cm up).
CAM="-22,4.5,-22,-1,6,-43" FRAMES=2300 N=16 OUT=$OUT/wip/check04cam nice -n 15 node tools/render.mjs > /dev/null && cp $OUT/wip/check04cam/f2300.jpg $C/tower_street-height_checkcam_f2300.jpg
cp $OUT/frames04/f2228.jpg $C/tower_rising_f2228.jpg
cp $OUT/frames04/f2262.jpg $C/tower_mid-crane_f2262.jpg
cp $OUT/frames04/f2543.jpg $C/tower_wide_f2543.jpg
# the director's crop: the near plate tower in the wide, test 03 beside test 04
nice -n 15 ffmpeg -y -loglevel error -i $OUT/frames03/f2543.jpg -i $OUT/frames04/f2543.jpg -filter_complex "[0]crop=260:260:230:740,scale=780:780:flags=lanczos[a];[1]crop=260:260:230:740,scale=780:780:flags=lanczos[b];[a][b]hstack" $C/crop_near-tower_f2543_test03_vs_test04.jpg
nice -n 15 ffmpeg -y -loglevel error -i $OUT/frames03/f2543.jpg -i $OUT/frames04/f2543.jpg -filter_complex "[0]crop=260:260:330:330,scale=780:780:flags=lanczos[a];[1]crop=260:260:330:330,scale=780:780:flags=lanczos[b];[a][b]hstack" $C/crop_far-tower_f2543_test03_vs_test04.jpg
# before and after: test 03 above, test 04 below
BA=(1800 2215 2262 2300 2400 2543); inputs=(); for f in $BA; do inputs+=(-i $OUT/frames03/f$f.jpg); done; for f in $BA; do inputs+=(-i $OUT/frames04/f$f.jpg); done
nice -n 15 ffmpeg -y -loglevel error ${inputs[@]} -filter_complex "concat=n=12:v=1:a=0,scale=360:-2,tile=6x2" -frames:v 1 $C/before-after_test03-above_test04-below.jpg
# what changed, frame by frame, against test 03
nice -n 15 $PY tools/diff03.py $OUT/frames03 $OUT/frames04 | tee $C/changed-vs-test03.txt | tail -12

STILLS=(1800 1874 1930 1998 2010 2022 2071 2106 2196 2215 2236 2262 2300 2349 2367 2400 2406 2426 2466 2543)
for f in $STILLS; do cp $OUT/frames04/f$f.jpg $C/f$f.jpg; done
inputs=(); for f in $STILLS; do inputs+=(-i $C/f$f.jpg); done
nice -n 15 ffmpeg -y -loglevel error ${inputs[@]} -filter_complex "concat=n=${#STILLS}:v=1:a=0,scale=360:-2,tile=5x4" -frames:v 1 $C/sheet.jpg

FRAMES=1800-2543 BLOCKING=$OUT/blocking.json nice -n 15 node tools/render.mjs
nice -n 15 $PY ../../../tools/cloud-render/badframes.py $REVIEW
nice -n 15 $PY ../../../tools/motion-lab/flashcheck.py $REVIEW
