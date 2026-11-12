#!/bin/zsh
# make-section.sh: one section of the film, end to end, in the painted skin. Run from anywhere:
#   zsh tools/make-section.sh 03              the whole section: frames, the review file with the voice, stills, sheet, scans
#   zsh tools/make-section.sh 03 560 640      a range [f0, f1) inside it: frames and a muxed mp4 in out/paper-world/wip/ only
# Writes only under out/paper-world/: frames-sNN/, check-sNN/, wip/sNN_*, and the review file
#   andre_paper-world-sNN-test01_f<F0>-f<F1>_24fps_720x1280.mp4
# A whole-section render takes a machine-wide lock (one at a time on this Mac; the others wait their turn). A range and
# single stills (FRAMES=... node tools/render.mjs) never wait. N=12 sub-renders a frame unless N is set. Everything heavy
# runs under nice -n 15. It stops if this section's module or skin fails to load (render.mjs SECTION=NN).
set -e -o pipefail
cd "$(dirname "$0")/.."
PY=/Users/robin/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python
[[ -n $1 ]] || { echo "usage: zsh tools/make-section.sh NN [f0 f1]"; exit 1; }
SEC=$((10#$1)); NN=$(printf '%02d' $SEC)
STARTS=(0 196 504 1196 1800 2544 3130 3397 3840 4315); ENDS=(196 504 1196 1800 2544 3130 3397 3840 4315 4761)
(( SEC >= 1 && SEC <= 10 )) || { echo "section 1 to 10"; exit 1; }
S0=$STARTS[$SEC]; S1=$ENDS[$SEC]; A=${2:-$S0}; B=${3:-$S1}; LAST=$((B - 1)); NF=$((B - A))
(( A >= S0 && B <= S1 && A < B )) || { echo "section $NN is f$S0 to f$S1: the range [$A, $B) is not inside it"; exit 1; }
ROOT=../../out/paper-world; FR=$ROOT/frames-s$NN; CK=$ROOT/check-s$NN
WHOLE=0; [[ $A == $S0 && $B == $S1 ]] && WHOLE=1
if (( WHOLE )); then REVIEW=$ROOT/andre_paper-world-s$NN-test01_f$S0-f${S1}_24fps_720x1280.mp4; else REVIEW=$ROOT/wip/s${NN}_f$A-f${B}_24fps_720x1280.mp4; fi
mkdir -p $FR $CK $ROOT/wip
export SKIN=1 SECTION=$SEC

# the cues: this section's own list (tools/cues/sNN.json -> js/cues/sNN.js); sections 5 to 7 keep js/cues.js as it is.
# Any generated cue file that is missing (a fresh checkout) is made, because every section's module loads on every render.
if [[ -f tools/cues/s$NN.json ]]; then nice -n 15 $PY tools/onsets.py $NN > $CK/cues.txt; fi
[[ -f js/cues.js ]] || nice -n 15 $PY tools/onsets.py > /dev/null
for j in tools/cues/s??.json; do k=${${j:t}:r}; [[ -f js/cues/$k.js ]] || nice -n 15 $PY tools/onsets.py ${k#s} > /dev/null; done

# the camera: cm a frame, dead stops, jumps
FRAMES=$A-$LAST SPEED=12 nice -n 15 node tools/render.mjs > $CK/camera-speed_f$A-f$B.txt || { cat $CK/camera-speed_f$A-f$B.txt; exit 2; }
tail -1 $CK/camera-speed_f$A-f$B.txt

# the frames. A whole section waits for the machine-wide lock; the lock goes when this script ends, however it ends.
if (( WHOLE )); then
  zmodload zsh/system; LOCK=${PAPER_LOCK:-/tmp/paper-world-render.lock}; : >> $LOCK
  until zsystem flock -f lockfd -t 60 $LOCK 2> /dev/null; do echo "$(date '+%H:%M:%S') section $NN is waiting for the render lock, held by: $(cat $LOCK.who 2> /dev/null)"; done
  echo "section $NN, pid $$, since $(date '+%H:%M:%S')" > $LOCK.who
fi
FRAMES=$A-$LAST N=${N:-12} OUT=$FR nice -n 15 node tools/render.mjs
if (( WHOLE )); then zsystem flock -u $lockfd; fi
have=0; for f in {$A..$LAST}; do [[ -f $FR/f$(printf '%04d' $f).jpg ]] && have=$((have + 1)); done; [[ $have == $NF ]] || { echo "expected $NF frames, have $have"; exit 1; }

# the voice: the master cut to [f0 / 24, f1 / 24), never re-encoded in place
nice -n 15 ffmpeg -y -loglevel error -framerate 24 -start_number $A -i $FR/f%04d.jpg -ss $(printf '%.4f' $((A / 24.0))) -to $(printf '%.4f' $((B / 24.0))) -i ../../_in/andre.wav -map 0:v -map 1:a \
  -frames:v $NF -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart $REVIEW
ffprobe -v error -show_entries stream=codec_type,duration,nb_frames -of compact $REVIEW
echo $REVIEW
(( WHOLE )) || exit 0

# stills, full size: the section's first and last frame, every snapped cue frame and the cue list's `stills`. A still
# outside the section (a piece of yours that acts later) is rendered on its own.
STILLS=($(nice -n 15 $PY tools/onsets.py stills $NN)); extra=()
for f in $STILLS; do n4=$(printf '%04d' $f); if (( f >= S0 && f < S1 )); then cp $FR/f$n4.jpg $CK/f$n4.jpg; else extra+=($f); fi; done
if (( ${#extra} )); then FRAMES=${(j:,:)extra} N=${N:-12} OUT=$CK nice -n 15 node tools/render.mjs > /dev/null; fi
inputs=(); for f in $STILLS; do inputs+=(-i $CK/f$(printf '%04d' $f).jpg); done
cols=8; rows=$(( (${#STILLS} + cols - 1) / cols ))
nice -n 15 ffmpeg -y -loglevel error ${inputs[@]} -filter_complex "concat=n=${#STILLS}:v=1:a=0,scale=300:-2,tile=${cols}x${rows}" -frames:v 1 $CK/sheet.jpg
echo "$CK/sheet.jpg (${#STILLS} stills: $STILLS)"

# how bright each frame is, then the two scans. A scan that flags is reported, not fatal: say in your report which
# frames it flagged and why (a frame that is meant to be dark, for one).
nice -n 15 $PY tools/luma.py $REVIEW $S0 | tee $CK/luma.txt | tail -1
nice -n 15 $PY ../../../tools/cloud-render/badframes.py $REVIEW > $CK/badframes.txt 2>&1 && echo "badframes: pass" || echo "badframes: FLAGGED, see $CK/badframes.txt"
tail -2 $CK/badframes.txt
nice -n 15 $PY ../../../tools/motion-lab/flashcheck.py $REVIEW > $CK/flashcheck.txt 2>&1 && echo "flashcheck: pass" || echo "flashcheck: FLAGGED, see $CK/flashcheck.txt"
tail -2 $CK/flashcheck.txt
