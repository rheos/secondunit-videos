#!/bin/zsh
# Onsets for the scene's timing: the vocal stem and the full mix, 0 to 40 s, through the kit's beats.py (numpy only).
# Writes work/audio/{voc40,mix40}.wav and .beats.json (gitignored). Run from the project folder.
set -euo pipefail
cd "${0:A:h}/.."
mkdir -p work/audio
ffmpeg -v error -y -i work/stems/vocals.wav -t 40 -ac 1 -c:a pcm_s16le work/audio/voc40.wav
ffmpeg -v error -y -i _in/children-at-play.mp3 -t 40 -ac 1 -ar 44100 -c:a pcm_s16le work/audio/mix40.wav
for name in voc40 mix40; do
  nice -n 15 uv run -q --with numpy python -I work/mv/tools/python/beats.py work/audio/$name.wav 24 > work/audio/$name.beats.json
done
echo "onsets written to work/audio"
