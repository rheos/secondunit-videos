#!/bin/zsh
# make03.sh: test 03, the painted skin, end to end. Run from tests/paper-world/:  zsh tools/make03.sh
# Same camera, cues and audio as test 02 (tools/make.sh); SKIN=1 swaps every object for its painted card.
set -e -o pipefail
cd "$(dirname "$0")/.."
PY=/Users/robin/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python
OUT=../../out/paper-world
REVIEW=$OUT/andre_paper-world-test03_f1800-f2544_24fps_720x1280.mp4
TARGET=$OUT/styleboard/target-table-city_v1.png
mkdir -p $OUT/check03 $OUT/frames03
export SKIN=1

nice -n 15 $PY tools/onsets.py > $OUT/check03/cues.txt
FRAMES=1800-2543 SPEED=12 nice -n 15 node tools/render.mjs > $OUT/check03/camera-speed.txt; tail -1 $OUT/check03/camera-speed.txt
FRAMES=1800-2543 N=${N:-12} OUT=$OUT/frames03 nice -n 15 node tools/render.mjs
n=$(ls $OUT/frames03/f*.jpg | wc -l | tr -d ' '); [[ $n == 744 ]] || { echo "expected 744 frames, have $n"; exit 1; }
nice -n 15 ffmpeg -y -loglevel error -framerate 24 -start_number 1800 -i $OUT/frames03/f%04d.jpg -ss 75.0 -to 106.0 -i ../../_in/andre.wav -map 0:v -map 1:a \
  -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart $REVIEW
ffprobe -v error -show_entries stream=codec_type,duration,nb_frames -of compact $REVIEW

STILLS=(1800 1874 1930 1998 2010 2022 2071 2106 2110 2196 2215 2236 2262 2300 2349 2367 2400 2406 2426 2466 2522 2543)
for f in $STILLS; do cp $OUT/frames03/f$f.jpg $OUT/check03/f$f.jpg; done
SHEET=(1800 1874 1930 1998 2010 2022 2071 2106 2196 2215 2236 2262 2300 2349 2367 2400 2406 2426 2466 2543)
inputs=(); for f in $SHEET; do inputs+=(-i $OUT/check03/f$f.jpg); done
nice -n 15 ffmpeg -y -loglevel error ${inputs[@]} -filter_complex "concat=n=${#SHEET}:v=1:a=0,scale=360:-2,tile=5x4" -frames:v 1 $OUT/check03/sheet.jpg
# beside the target still: the wide, and the best street-level frame
for pair in "wide 2543" "street ${STREET:-2400}"; do set -- ${=pair}
  nice -n 15 ffmpeg -y -loglevel error -i $TARGET -i $OUT/frames03/f$2.jpg -filter_complex "[0]scale=-2:1280[a];[a][1]hstack" $OUT/check03/compare_$1_target_vs_test03-f$2.jpg; done
FRAMES=1874,2010,2022,2196,2349,2367,2406,2426,2543 PX=1 nice -n 15 node tools/render.mjs > $OUT/check03/figure-heights-px.txt
FIRST=(); for f in {1800..2215..24}; do FIRST+=(-i $OUT/frames03/f$f.jpg); done
nice -n 15 ffmpeg -y -loglevel error ${FIRST[@]} -filter_complex "concat=n=18:v=1:a=0,scale=240:-2,tile=6x3" -frames:v 1 $OUT/check03/first17s_every24.jpg
nice -n 15 $PY tools/motioncheck.py $OUT/frames03 1800 2215 24 | tee $OUT/check03/first17s_change.txt

FRAMES=1800-2543 BLOCKING=$OUT/blocking.json nice -n 15 node tools/render.mjs
nice -n 15 $PY ../../../tools/cloud-render/badframes.py $REVIEW
nice -n 15 $PY ../../../tools/motion-lab/flashcheck.py $REVIEW
