#!/bin/zsh
# make.sh: the paper-world test 02 end to end. Run from tests/paper-world/:  zsh tools/make.sh
# Steps: snap cues, camera speed print, frames, mp4 with the voice, stills, contact sheet, blocking.json, scans.
set -e -o pipefail
cd "$(dirname "$0")/.."
PY=/Users/robin/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python
OUT=../../out/paper-world
REVIEW=$OUT/andre_paper-world-test02_f1800-f2544_24fps_720x1280.mp4
mkdir -p $OUT/check $OUT/frames

nice -n 15 $PY tools/onsets.py > $OUT/check/cues.txt
FRAMES=1800-2543 SPEED=12 nice -n 15 node tools/render.mjs > $OUT/check/camera-speed.txt; tail -1 $OUT/check/camera-speed.txt
FRAMES=1800-2543 N=${N:-10} OUT=$OUT/frames nice -n 15 node tools/render.mjs
n=$(ls $OUT/frames/f*.jpg | wc -l | tr -d ' '); [[ $n == 744 ]] || { echo "expected 744 frames, have $n"; exit 1; }
nice -n 15 ffmpeg -y -loglevel error -framerate 24 -start_number 1800 -i $OUT/frames/f%04d.jpg -ss 75.0 -to 106.0 -i ../../_in/andre.wav -map 0:v -map 1:a \
  -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart $REVIEW
ffprobe -v error -show_entries stream=codec_type,duration,nb_frames -of compact $REVIEW

# stills: every row start of the camera table, every event, f2400 and the last frame (straight from the rendered frames)
STILLS=(1800 1874 1930 1998 2009 2022 2071 2106 2110 2196 2215 2236 2262 2300 2349 2367 2400 2406 2426 2466 2522 2543)
for f in $STILLS; do cp $OUT/frames/f$f.jpg $OUT/check/f$f.jpg; done
SHEET=(1800 1874 1930 1998 2009 2022 2071 2106 2196 2215 2236 2262 2300 2349 2367 2400 2406 2426 2466 2543)
inputs=(); for f in $SHEET; do inputs+=(-i $OUT/check/f$f.jpg); done
nice -n 15 ffmpeg -y -loglevel error ${inputs[@]} -filter_complex "concat=n=${#SHEET}:v=1:a=0,scale=360:-2,tile=5x4" -frames:v 1 $OUT/check/sheet.jpg
# before and after: the wide and the street beside the test 01 stills they replace; the figure line-up
nice -n 15 ffmpeg -y -loglevel error -i ../../out/table-city/check/f2543.jpg -i $OUT/frames/f2543.jpg -filter_complex hstack $OUT/check/compare_wide_test01-f2543_vs_test02-f2543.jpg
nice -n 15 ffmpeg -y -loglevel error -i ../../out/table-city/check/f2426.jpg -i $OUT/frames/f2400.jpg -filter_complex hstack $OUT/check/compare_street_test01-f2426_vs_test02-f2400.jpg
LINEUP=1 W=1400 H=900 N=16 FRAMES=1800 OUT=$OUT/wip/lineup nice -n 15 node tools/render.mjs > /dev/null && cp $OUT/wip/lineup/f1800.jpg $OUT/check/lineup-figures.jpg
FRAMES=1874,2022,2196,2349,2367,2406,2426,2543 PX=1 nice -n 15 node tools/render.mjs > $OUT/check/figure-heights-px.txt
# the first 17 seconds, one frame a second, and how much each differs from the one before
FIRST=(); for f in {1800..2215..24}; do FIRST+=(-i $OUT/frames/f$f.jpg); done
nice -n 15 ffmpeg -y -loglevel error ${FIRST[@]} -filter_complex "concat=n=18:v=1:a=0,scale=240:-2,tile=6x3" -frames:v 1 $OUT/check/first17s_every24.jpg
nice -n 15 $PY tools/motioncheck.py $OUT/frames 1800 2215 24 | tee $OUT/check/first17s_change.txt

BLOCKING=$OUT/blocking.json nice -n 15 node tools/render.mjs
nice -n 15 $PY ../../../tools/cloud-render/badframes.py $REVIEW
nice -n 15 $PY ../../../tools/motion-lab/flashcheck.py $REVIEW
