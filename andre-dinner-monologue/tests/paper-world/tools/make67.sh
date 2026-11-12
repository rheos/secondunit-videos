#!/bin/zsh
# make67.sh: sections 6 and 7 (the camp, the seed), f2544 to f3397, end to end. Run from tests/paper-world/:
#   zsh tools/make67.sh              the whole range
#   zsh tools/make67.sh 2737 2830    any frame range [f0, f1) of the film so far (f1800 to f3397): frames and a muxed mp4 only
# The painted skin only (SKIN=1). Section 5 is still tools/make04.sh; its frames are the regression baseline here.
set -e -o pipefail
cd "$(dirname "$0")/.."
PY=/Users/robin/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python
OUT=../../out/paper-world
F0=${1:-2544}; F1=${2:-3397}; LAST=$((F1 - 1)); NF=$((F1 - F0))
FR=$OUT/frames-s67; C=$OUT/check-s67
if [[ $F0 == 2544 && $F1 == 3397 ]]; then REVIEW=$OUT/andre_paper-world-s06-s07-test01_f2544-f3397_24fps_720x1280.mp4; else REVIEW=$OUT/wip/andre_paper-world_f$F0-f${F1}_24fps_720x1280.mp4; fi
mkdir -p $FR $C/regress $OUT/wip
export SKIN=1

nice -n 15 $PY tools/onsets.py > $C/cues.txt
FRAMES=$F0-$LAST SPEED=12 nice -n 15 node tools/render.mjs > $C/camera-speed_f$F0-f$F1.txt; tail -1 $C/camera-speed_f$F0-f$F1.txt
FRAMES=$F0-$LAST N=${N:-12} OUT=$FR nice -n 15 node tools/render.mjs
n=0; for f in {$F0..$LAST}; do [[ -f $FR/f$f.jpg ]] && n=$((n + 1)); done; [[ $n == $NF ]] || { echo "expected $NF frames, have $n"; exit 1; }
# the voice: the master cut to [f0 / 24, f1 / 24), never re-encoded in place
nice -n 15 ffmpeg -y -loglevel error -framerate 24 -start_number $F0 -i $FR/f%04d.jpg -ss $(printf '%.4f' $((F0 / 24.0))) -to $(printf '%.4f' $((F1 / 24.0))) -i ../../_in/andre.wav -map 0:v -map 1:a \
  -frames:v $NF -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart $REVIEW
ffprobe -v error -show_entries stream=codec_type,duration,nb_frames -of compact $REVIEW
[[ $F0 == 2544 && $F1 == 3397 ]] || exit 0

# stills: every row's first frame and every cue frame, full size, and a contact sheet
STILLS=(2544 2600 2636 2650 2667 2691 2737 2745 2761 2769 2800 2823 2836 2850 2878 2893 2911 2930 2957 3007 3037 3107 3118 3128 3164 3171 3188 3205 3212 3221 3240 3260 3304 3331 3339 3346 3365 3396)
for f in $STILLS; do cp $FR/f$f.jpg $C/f$f.jpg; done
inputs=(); for f in $STILLS; do inputs+=(-i $C/f$f.jpg); done
nice -n 15 ffmpeg -y -loglevel error ${inputs[@]} -filter_complex "concat=n=${#STILLS}:v=1:a=0,scale=300:-2,tile=8x5" -frames:v 1 $C/sheet.jpg
# the hero frame (guards on the wall) beside the target still
nice -n 15 ffmpeg -y -loglevel error -i $OUT/styleboard/target-camp-wall_v1.png -i $FR/f2800.jpg -filter_complex "[0]scale=-2:1280[a];[a][1]hstack" $C/compare_hero_target_vs_f2800.jpg
# the open hand with the seed at 1:1: the frame as rendered, and the palm cut out of it without scaling
cp $FR/f3250.jpg $C/hand-seed_1to1_f3250.jpg
nice -n 15 ffmpeg -y -loglevel error -i $FR/f3250.jpg -vf "crop=560:480:80:400" $C/hand-seed_1to1_crop_f3250.png
# how tall the figures stand on screen at the figure beats
FRAMES=2737,2761,2800,2823 PX=1 node tools/render.mjs > $C/figure-heights-px.txt
# section 5 must not have changed: five frames again, against the frames rendered before the engine change and test 04's own
FRAMES=1800,2215,2300,2400,2543 PNG=1 N=12 OUT=$C/regress/after nice -n 15 node tools/render.mjs > /dev/null
FRAMES=1800,2215,2300,2400,2543 N=12 OUT=$C/regress/after-jpg nice -n 15 node tools/render.mjs > /dev/null
{ nice -n 15 $PY tools/regress.py $C/regress/before $C/regress/after; echo "the same frames as JPEG against test 04's delivered frames:"; nice -n 15 $PY tools/regress.py $OUT/frames04 $C/regress/after-jpg; } | tee $C/regress/regress.txt
inputs=(); for f in 1800 2215 2300 2400 2543; do inputs+=(-i $C/regress/before/f$f.png); done; for f in 1800 2215 2300 2400 2543; do inputs+=(-i $C/regress/after/f$f.png); done
nice -n 15 ffmpeg -y -loglevel error ${inputs[@]} -filter_complex "concat=n=10:v=1:a=0,scale=360:-2,tile=5x2" -frames:v 1 $C/regress/before-above_after-below.jpg
# how bright each frame is (the darkest stretch, the brightest frame), then the blocking export and the scans
nice -n 15 $PY tools/luma.py $REVIEW $F0 | tee $C/luma.txt | tail -6
FRAMES=$F0-$LAST BLOCKING=$OUT/blocking-s06-s07.json nice -n 15 node tools/render.mjs
nice -n 15 $PY ../../../tools/cloud-render/badframes.py $REVIEW
nice -n 15 $PY ../../../tools/motion-lab/flashcheck.py $REVIEW
