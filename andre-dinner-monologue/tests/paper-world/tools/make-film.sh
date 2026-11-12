#!/bin/zsh
# make-film.sh: the whole film, f0 to f4761, every section together, one render. Run from tests/paper-world/:
#   zsh tools/make-film.sh cut01            frames to out/paper-world/frames-film/, the film to out/paper-world/film/
#   zsh tools/make-film.sh cut02 2544 3397  re-render only that range into frames-film/, then mux the whole film again
# The voice is the master, never re-encoded in place: _in/andre.wav is 5 ms shorter than 4761 frames, so the tail is
# padded with silence and the picture keeps its last frame (no -shortest).
set -e -o pipefail
cd "$(dirname "$0")/.."
PY=/Users/robin/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python
OUT=../../out/paper-world
TAG=${1:?a tag for this cut, such as cut01}; A=${2:-0}; B=${3:-4761}; LAST=$((B - 1))
# FILM_FRAMES=<dir> keeps a variant's frames apart, e.g. NOSLOTS=1 FILM_FRAMES=$OUT/frames-film-no-tracks for the cut
# with the cloth tracks switched off (render.mjs reads NOSLOTS)
FR=${FILM_FRAMES:-$OUT/frames-film}; FILM=$OUT/film; CK=$OUT/check-film/$TAG
REVIEW=$FILM/andre_pop-up-table_${TAG}_f0-f4761_24fps_720x1280.mp4
[[ -e $REVIEW ]] && { echo "$REVIEW exists: pick a new tag, review files are never overwritten"; exit 1; }
mkdir -p $FR $FILM $CK
export SKIN=1
zmodload zsh/system; LOCK=${PAPER_LOCK:-/tmp/paper-world-render.lock}; : >> $LOCK
until zsystem flock -f lockfd -t 60 $LOCK 2> /dev/null; do echo "$(date '+%H:%M:%S') the film is waiting for the render lock"; done
echo "film $TAG" > $LOCK.who
FRAMES=$A-$LAST N=${N:-12} OUT=$FR nice -n 15 node tools/render.mjs | tail -3
zsystem flock -u $lockfd
n=0; for f in {0..4760}; do [[ -f $FR/f$(printf '%04d' $f).jpg ]] && n=$((n + 1)); done
[[ $n == 4761 ]] || { echo "expected 4761 frames in $FR, have $n"; exit 1; }
nice -n 15 ffmpeg -y -loglevel error -framerate 24 -start_number 0 -i $FR/f%04d.jpg -i ../../_in/andre.wav -map 0:v -map 1:a \
  -frames:v 4761 -af apad -t 198.375 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart $REVIEW
ffprobe -v error -show_entries stream=codec_type,duration,nb_frames -of compact $REVIEW
# the joins: three frames either side of each section boundary, one strip per join
for j in 196 504 1196 1800 2544 3130 3397 3840 4315; do
  inputs=(); for f in $((j - 3)) $((j - 2)) $((j - 1)) $j $((j + 1)) $((j + 2)); do inputs+=(-i $FR/f$(printf '%04d' $f).jpg); done
  nice -n 15 ffmpeg -y -loglevel error ${inputs[@]} -filter_complex "concat=n=6:v=1:a=0,scale=360:-2,tile=6x1" -frames:v 1 $CK/join_f$j.jpg
done
# the whole film at a glance: one frame every 2 s
inputs=(); for f in {0..4760..48}; do inputs+=(-i $FR/f$(printf '%04d' $f).jpg); done
nice -n 15 ffmpeg -y -loglevel error ${inputs[@]} -filter_complex "concat=n=${#inputs}/2:v=1:a=0,scale=180:-2,tile=20x5" -frames:v 1 $CK/film_every-2s.jpg
FRAMES=0-4760 SPEED=12 nice -n 15 node tools/render.mjs > $CK/camera-speed.txt; tail -2 $CK/camera-speed.txt
nice -n 15 $PY ../../../tools/cloud-render/badframes.py $REVIEW | tail -4 || true
nice -n 15 $PY ../../../tools/motion-lab/flashcheck.py $REVIEW | tail -4 || true
echo "DONE $REVIEW"
