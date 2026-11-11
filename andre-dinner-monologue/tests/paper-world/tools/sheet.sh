#!/bin/zsh
# sheet.sh: quick look. Renders the listed frames at low sample count and tiles them: zsh tools/sheet.sh <name> <cols> <frame> [frame ...]
cd "$(dirname "$0")/.."
name=$1; cols=$2; shift 2
OUT=../../out/paper-world/wip/$name; mkdir -p $OUT
FRAMES=${(j:,:)@} N=${N:-5} OUT=$OUT nice -n 15 node tools/render.mjs | grep -E "PAGEERROR|CONSOLE|done"
inputs=(); for f in $@; do inputs+=(-i $OUT/f$f.jpg); done
rows=$(( ($# + cols - 1) / cols ))
nice -n 15 ffmpeg -y -loglevel error ${inputs[@]} -filter_complex "concat=n=$#:v=1:a=0,scale=${SW:-360}:-2,tile=${cols}x${rows}" -frames:v 1 ../../out/paper-world/wip/$name.jpg
echo ../../out/paper-world/wip/$name.jpg
