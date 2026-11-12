#!/bin/zsh
# make.sh: render the table-city look test end to end. Run from tests/table-city/:  bash tools/make.sh
# Steps: snap cues, render silent, mux the voice from the master, stills, contact sheet, badframes, flashcheck.
set -e -o pipefail
cd "$(dirname "$0")/.."
PY=/Users/robin/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python
ML=../../../tools/motion-lab
OUT=../../out/table-city
REVIEW=$OUT/andre_table-city-test01_f1800-f2544_24fps_720x1280.mp4
mkdir -p $OUT/check

nice -n 15 $PY tools/onsets.py
nice -n 15 node $ML/render.mjs index.html 75.0 106.0 $OUT/table-city_silent.mp4 --width 720 --height 1280 --workers 3
nice -n 15 ffmpeg -y -loglevel error -i $OUT/table-city_silent.mp4 -ss 75.0 -to 106.0 -i ../../_in/andre.wav -map 0:v -map 1:a \
  -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart $REVIEW
rm -f $OUT/table-city_silent.mp4
ffprobe -v error -show_entries stream=codec_type,duration,nb_frames -of compact $REVIEW

# stills: shot starts, line starts, the events, the last frame
STILLS=(1800 1807 1930 1950 1998 2071 2110 2131 2215 2232 2236 2262 2300 2342 2366 2426 2522 2543)
nice -n 15 node tools/still.mjs index.html $OUT/check ${STILLS[@]}
SHEET=(1800 1807 1930 1950 1998 2071 2110 2131 2215 2236 2262 2300 2342 2366 2426 2543)
inputs=(); for f in ${SHEET[@]}; do inputs+=(-i $OUT/check/f$f.jpg); done
nice -n 15 ffmpeg -y -loglevel error ${inputs[@]} -filter_complex \
  "[0][1][2][3][4][5][6][7][8][9][10][11][12][13][14][15]xstack=inputs=16:layout=0_0|w0_0|w0+w1_0|w0+w1+w2_0|0_h0|w0_h0|w0+w1_h0|w0+w1+w2_h0|0_h0+h4|w0_h0+h4|w0+w1_h0+h4|w0+w1+w2_h0+h4|0_h0+h4+h8|w0_h0+h4+h8|w0+w1_h0+h4+h8|w0+w1+w2_h0+h4+h8,scale=1440:-2" \
  $OUT/check/sheet.jpg

nice -n 15 $PY ../../../tools/cloud-render/badframes.py $REVIEW
nice -n 15 $PY $ML/flashcheck.py $REVIEW
