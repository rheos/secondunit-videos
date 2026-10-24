#!/bin/zsh
# ./mix.sh [sfx_db]  ->  assets/mix.wav
# The score (assets/song.wav) at its own level plus the event sound stem (assets/sfx_bank.wav, from
# tools/sfx-bank/bank.py on assets/cues.json) at sfx_db (default 0). A plain sum: no limiter, so nothing shifts or
# squeezes the score. It stops if the sum's true peak goes over -1 dBTP; lower sfx_db or the map's peaks then.
# Then: AUDIO=assets/mix.wav node render.mjs ...
set -e -o pipefail
cd "${0:A:h}"
sfx_db=${1:-0}
ffmpeg -y -loglevel error -i assets/song.wav -i assets/sfx_bank.wav -filter_complex \
  "[0:a]aresample=48000[s];[1:a]volume=${sfx_db}dB[f];[s][f]amix=inputs=2:duration=first:normalize=0[o]" \
  -map '[o]' -ar 48000 -c:a pcm_s24le assets/mix.wav
report=$(ffmpeg -hide_banner -i assets/mix.wav -af ebur128=peak=true -f null - 2>&1 | grep -E '^\s+(I:|Peak:)')
print -r -- "$report"
tp=$(print -r -- "$report" | awk '/Peak:/ {print $2}')
if (( tp > -1.0 )); then print "true peak $tp dBTP is over -1: lower the sfx" >&2; exit 1; fi
