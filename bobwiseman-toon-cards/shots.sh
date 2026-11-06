#!/bin/zsh
# Contact sheet of frames: ./shots.sh <name> <frame,frame,...> [columns]
here=${0:A:h}; name=$1; frames=$2; cols=${3:-7}
export PW_FROM=${PW_FROM:-/Users/robin/Code/novadiem/indieagent/secondunit/_wt-atom/achbar-atom-reel/package.json}
rm -rf $here/out/$name; OUT=$here/out/$name FRAMES=$frames node $here/render.mjs | grep -vE '^renderer|404' 
n=$(ls $here/out/$name/f*.jpg | wc -l); rows=$(( (n + cols - 1) / cols ))
ffmpeg -v error -y -pattern_type glob -i "$here/out/$name/f*.jpg" -vf "scale=270:-1,tile=${cols}x${rows}" -frames:v 1 $here/out/$name/sheet.jpg
