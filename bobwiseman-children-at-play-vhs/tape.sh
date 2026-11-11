#!/bin/zsh
# tape.sh · stage 2: put the home video on VHS with ntsc-rs and an NTSCRT preset, then hand frames to the TV page.
#   ./tape.sh render            render stage 1 (home.html) to work/home.mp4 (960x720, 24 fps, no sound)
#   ./tape.sh tape <preset>     run the preset's VHS stage: work/tape_<slug>.mp4 and work/tape_<slug>/f_*.png
#                               presets: "Mild VHS" "Medium VHS" "Clean VHS" (any file in NTSCRT's presets folder)
#   ./tape.sh tv <slug> [h]     render stage 3 (tv.html) with that tape and mux the song: out/<slug>_<h>p.mp4
# Section: song 0 to 39.5 s (TIMING in js/timing.js). Heavy steps run nice -n 15 (shared Mac).
set -e -o pipefail
cd "${0:A:h}"
T0=0; T1=39.5
SONG=_in/children-at-play.mp3
PRESETS=/Applications/NTSCRT.app/Contents/Resources/presets
slugof() { echo "${1:l}" | sed 's/ vhs$//; s/ /-/g'; }
case "$1" in
  render)
    nice -n 15 node tools/render.mjs home.html $T0 $T1 work/home.mp4 --width 960 --height 720 --workers 2 ;;
  tape)
    p="$2"; s=$(slugof "$p")
    python3 -I -c "import json,sys;print(json.dumps(json.load(open(sys.argv[1]))['ntsc']['settings']))" "$PRESETS/$p.json" > work/$s.ntsc.json
    nice -n 15 ntsc-rs-cli -i work/home.mp4 -o work/tape_$s.mp4 -p work/$s.ntsc.json -y --scale 480 --quality 44
    rm -rf work/tape_$s; mkdir -p work/tape_$s
    ffmpeg -v error -i work/tape_$s.mp4 -start_number 1 work/tape_$s/f_%06d.png
    echo "tape_$s: $(ls work/tape_$s | wc -l) frames" ;;
  tv)
    s="$2"; h="${3:-720}"
    nice -n 15 node tools/render.mjs "tv.html?preset=$s" $T0 $T1 work/tv_$s.mp4 --workers 2
    mkdir -p out
    ffmpeg -v error -y -i work/tv_$s.mp4 -ss $T0 -t $((T1 - T0)) -i $SONG -map 0:v -map 1:a \
      -vf "scale=-2:${h}:flags=lanczos" -c:v libx264 -crf 19 -maxrate 6M -bufsize 12M -preset medium -pix_fmt yuv420p \
      -c:a aac -b:a 192k -shortest -movflags +faststart \
      out/children-at-play_vhs-${s}_f0-f948_24fps_${h}p.mp4
    echo out/children-at-play_vhs-${s}_f0-f948_24fps_${h}p.mp4 ;;
  *) sed -n 2,8p "$0" ;;
esac
