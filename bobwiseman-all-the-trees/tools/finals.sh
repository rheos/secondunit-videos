#!/bin/zsh
# All The Trees finals with lyrics (Bob signed off draft 4b, 2026-10-19: "1080, 740, 9x16 and 3 sections no more than
# 30 secs with lyrics"). Run from the project folder after source/lines.json holds Bob's aligned lyric:
#   zsh tools/finals.sh <seqdir> <tallbase dir>
# Without lyrics (Robin, 2026-10-19: Bob's finals ship clean): LYRICS=0 zsh tools/finals.sh <seqdir> <tallplain dir>
# (node tools/finals.mjs tallplain ...); the frames are encoded as they are and nothing reads source/lines.json.
# seqdir: the cut's 1920x1080 frames (f_%06d.jpg, 3674 of them); tallbase: the same cut as lyric-free emblem pages
# (node tools/finals.mjs tallbase ...). Writes out/finals/: 1080p (crf 18), 720p, the full 9:16 (720x1280) and three
# 9:16 clips of 30 s or less. The song is never re-timed or re-encoded beyond the AAC mux; clips get short audio fades.
set -e -o pipefail
SEQ=$1; TB=$2; N=3674; DUR=153.0833333; SONG=assets/song.wav
LY=${LYRICS:-1}
[[ -d $SEQ && -d $TB && ( $LY == 0 || -f source/lines.json ) ]] || { echo "usage: [LYRICS=0] zsh tools/finals.sh <seqdir> <tallbase|tallplain dir>"; exit 2; }
mkdir -p out/finals
if [[ $LY == 0 ]]; then KIND=final; WIDE=$SEQ; TALL=$TB
else KIND=lyrics-final; WIDE=out/frames_final_wide; TALL=out/frames_final_tall
  node tools/finals.mjs wide $SEQ $WIDE 0 $N 4
  node tools/finals.mjs tallcap $TB $TALL 0 $N 4
fi
NAME=att_alchemy-d4b-${KIND}_f00000-f03674_24fps
enc() { # frames dir, scale filter, crf, out
  nice -n 15 ffmpeg -y -loglevel error -framerate 24 -i $1/f_%06d.jpg -i $SONG -vf $2 -c:v libx264 -preset slow -crf $3 \
    -pix_fmt yuv420p -c:a aac -b:a 256k -t $DUR -movflags +faststart $4
}
enc $WIDE "scale=1920:1080" 18 out/finals/${NAME}_1080p.mp4
enc $WIDE "scale=1280:720:flags=lanczos" 20 out/finals/${NAME}_720p.mp4
enc $TALL "scale=720:1280:flags=lanczos" 20 out/finals/${NAME}_9x16.mp4
# Three 9:16 excerpts under 30 s each, Bob's pick on round 44 (2026-10-19): verse 1, verse 2, the bridge.
clip() { # n f0 f1
  local a=$(( $2 / 24.0 )) d=$(( ($3 - $2) / 24.0 )) out=out/finals/att_alchemy-d4b-${KIND}-clip$1_f$(printf %05d $2)-f$(printf %05d $3)_24fps_9x16.mp4
  nice -n 15 ffmpeg -y -loglevel error -framerate 24 -start_number $2 -i $TALL/f_%06d.jpg -ss $a -t $d -i $SONG \
    -frames:v $(( $3 - $2 )) -vf "scale=720:1280:flags=lanczos" -af "afade=t=in:d=0.25,afade=t=out:st=$(( d - 0.6 )):d=0.6" \
    -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -c:a aac -b:a 256k -t $d -movflags +faststart $out
  echo $out
}
clip 1 792 1500     # 0:33.0-1:02.5  verse 1: the spoken idea, the gear machine and its chorus (29.5 s)
clip 2 1524 2232    # 1:03.5-1:33.0  verse 2: the birds and its chorus (29.5 s)
clip 3 2292 3000    # 1:35.5-2:05.0  the bridge, cut on the 1:36 downbeat, heart-sun, cherub, snow (29.5 s)
ls -la out/finals/
