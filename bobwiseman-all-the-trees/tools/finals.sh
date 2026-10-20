#!/bin/zsh
# All The Trees finals with lyrics (Bob signed off draft 4b, 2026-10-19: "1080, 740, 9x16 and 3 sections no more than
# 30 secs with lyrics"). Run from the project folder after source/lines.json holds Bob's aligned lyric:
#   zsh tools/finals.sh <seqdir> <tallbase dir>
# seqdir: the cut's 1920x1080 frames (f_%06d.jpg, 3674 of them); tallbase: the same cut as lyric-free emblem pages
# (node tools/finals.mjs tallbase ...). Writes out/finals/: 1080p (crf 18), 720p, the full 9:16 (720x1280) and three
# 9:16 clips of 30 s or less. The song is never re-timed or re-encoded beyond the AAC mux; clips get short audio fades.
set -e -o pipefail
SEQ=$1; TB=$2; N=3674; DUR=153.0833333; SONG=assets/song.wav
[[ -d $SEQ && -d $TB && -f source/lines.json ]] || { echo "usage: zsh tools/finals.sh <seqdir> <tallbase dir> (needs source/lines.json)"; exit 2; }
NAME=att_alchemy-d4b-lyrics-final_f00000-f03674_24fps
mkdir -p out/finals
node tools/finals.mjs wide $SEQ out/frames_final_wide 0 $N 4
node tools/finals.mjs tallcap $TB out/frames_final_tall 0 $N 4
enc() { # frames dir, scale filter, crf, out
  nice -n 15 ffmpeg -y -loglevel error -framerate 24 -i $1/f_%06d.jpg -i $SONG -vf $2 -c:v libx264 -preset slow -crf $3 \
    -pix_fmt yuv420p -c:a aac -b:a 256k -t $DUR -movflags +faststart $4
}
enc out/frames_final_wide "scale=1920:1080" 18 out/finals/${NAME}_1080p.mp4
enc out/frames_final_wide "scale=1280:720:flags=lanczos" 20 out/finals/${NAME}_720p.mp4
enc out/frames_final_tall "scale=720:1280:flags=lanczos" 20 out/finals/${NAME}_9x16.mp4
# Three 9:16 clips: the spoken idea and chorus 1, the love bridge from its downbeat, the Python ending with the curtain call.
clip() { # n f0 f1
  local a=$(( $2 / 24.0 )) d=$(( ($3 - $2) / 24.0 )) out=out/finals/att_alchemy-d4b-lyrics-final-clip$1_f$(printf %05d $2)-f$(printf %05d $3)_24fps_9x16.mp4
  nice -n 15 ffmpeg -y -loglevel error -framerate 24 -start_number $2 -i out/frames_final_tall/f_%06d.jpg -ss $a -t $d -i $SONG \
    -frames:v $(( $3 - $2 )) -vf "scale=720:1280:flags=lanczos" -af "afade=t=in:d=0.25,afade=t=out:st=$(( d - 0.6 )):d=0.6" \
    -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -c:a aac -b:a 256k -t $d -movflags +faststart $out
  echo $out
}
clip 1 780 1500     # 0:32.5-1:02.5  the spoken idea, the gear machine and chorus 1
clip 2 2292 3000    # 1:35.5-2:05.0  the love bridge, cut on the 1:36 downbeat, heart-sun, cherub, snow
clip 3 3000 3674    # 2:05.0-2:33.1  the plate shrinks, the giants take over, curtain call
ls -la out/finals/
