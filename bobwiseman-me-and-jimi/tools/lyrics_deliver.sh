#!/bin/zsh
# Me and Jimi with on-screen lyrics: splice the captioned spans into the 16:9 master, and cut the three 9:16 verse clips.
# Run from the project folder after the renders in docs/LYRICS.md (frames stay in out/frames_*). The masters are read,
# never written. ARCH = where the renders live (Robin's external drive since 2026-10-12).
set -e -o pipefail
ARCH=${ARCH:-/Volumes/Bertha/secondunit-archive/mv-projects/bobwiseman-me-and-jimi/out}
M169=$ARCH/maj_woodcut-v12_f0-f6780_24fps_master1080.mp4
OUT169=$ARCH/maj_woodcut-v13-lyrics_f0-f6780_24fps_master1080.mp4
fr() { node -e "console.log(Number(($1 / 24).toFixed(6)))"; }   # as render.mjs names its frames dirs

# ---- 16:9: the master with the three caption spans laid over it, frame for frame ----
spans=("0 816" "1856 2661" "3688 4508")
ins=(); flt=""; last="0:v"; k=1
for sp in $spans; do
  set -- ${=sp}; t0=$(fr $1)
  ins+=(-framerate 24 -i "out/frames_wood-cap_${t0}_$(fr $2)/f_%06d.jpg")
  flt+="[$k:v]setpts=PTS-STARTPTS+$1/(24*TB)[p$k];[$last][p$k]overlay=eof_action=pass:enable='between(n,$1,$(($2 - 1)))'[v$k];"
  last="v$k"; k=$((k + 1))
done
ffmpeg -y -loglevel error -i $M169 ${ins[@]} -filter_complex "${flt%;}" -map "[$last]" -map 0:a -c:v libx264 -preset medium -crf 17 \
  -pix_fmt yuv420p -c:a copy -movflags +faststart $OUT169
ffmpeg -y -loglevel error -i $OUT169 -vf scale=1280:720:flags=lanczos -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -c:a copy \
  -movflags +faststart ${OUT169/master1080/720p}
echo wrote $OUT169

# ---- 9:16 verse clips, 720x1280: the captioned tall render; verse 1's booth (frames 105-239) is pan-and-scan ----
mkdir -p $ARCH/9x16/verses
clip() { # name f0 f1 fadeIn fadeOut
  local name=$1 f0=$2 f1=$3 t0=$(fr $2) dur=$(awk -v a=$2 -v b=$3 'BEGIN { printf "%.6f", (b - a) / 24 }')
  local src="out/frames_wood-9x16-cap_${t0}_$(fr $3)/f_%06d.jpg" o=$ARCH/9x16/verses/maj_${name}-lyrics-v1_f$2-f$3_24fps_9x16.mp4
  local af="afade=t=in:st=0:d=$4,afade=t=out:st=$(awk -v d=$dur -v f=$5 'BEGIN { printf "%.4f", d - f }'):d=$5"
  if [[ $name == verse1 ]]; then
    ffmpeg -y -loglevel error -framerate 24 -i $src -i out/booth_pan_f105-f240.mp4 -ss $t0 -t $dur -i assets/song.wav \
      -filter_complex "[1:v]scale=720:1280:flags=lanczos,setpts=PTS-STARTPTS+105/(24*TB)[b];[0:v][b]overlay=eof_action=pass:enable='between(n,105,239)'[v]" \
      -map "[v]" -map 2:a -af $af -c:v libx264 -preset slow -crf 23 -maxrate 4.5M -bufsize 9M -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart $o
  else
    ffmpeg -y -loglevel error -framerate 24 -i $src -ss $t0 -t $dur -i assets/song.wav -map 0:v -map 1:a -af $af \
      -c:v libx264 -preset slow -crf 23 -maxrate 4.5M -bufsize 9M -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart $o
  fi
  echo wrote $o
}
clip verse1 0 823 0.02 0.45      # song starts on the first word: no lead-in to fade; ends on the downbeat at 34.30
clip verse2 1847 2678 0.15 0.45  # lead-in from the stage shot on the beat at 76.97; ends on the downbeat at 111.60
clip verse3 3675 4488 0.15 0.35  # lead-in on the beat at 153.13; ends on the cut to the outro at 187.0
