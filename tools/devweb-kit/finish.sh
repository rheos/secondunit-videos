#!/usr/bin/env bash
# The devweb finish: 1080x1920 at 60 fps with motion blur, then QA (Robin, 2026-10-29: devweb shorts finish like
# cinetic's gallery films; memory feedback-devweb-finish-1080p60).
#   tools/devweb-kit/finish.sh <project-folder> <name>        -> <project>/renders/<name>_1080p60.mp4
# Renders at 120 fps under the shared render lock, blends frame pairs into 60 fps (a 180-degree shutter) and puts the
# BT.709 tags back after the blend (tmix drops them; probe catches it), then runs cinetic's probe and forensics (with the
# short's cues declared, so typed characters don't count as pops) and the flash check. The composition must be
# authored at 1080x1920: HyperFrames' --resolution only upsamples by whole numbers.
# Needs CINETIC=<cinetic clone>/skills/cinetic/scripts (probe.py, forensics.py). PY defaults to the viralvision venv.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
repo="$(cd "$here/../.." && pwd)"
proj="$repo/${1:?usage: finish.sh <project-folder> <name>}"
name="${2:?usage: finish.sh <project-folder> <name>}"
PY="${PY:-$HOME/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python}"
CINETIC="${CINETIC:?set CINETIC to <cinetic clone>/skills/cinetic/scripts}"
cd "$proj"
mkdir -p renders qa
dur="$(python3 -I -c "import json;print(json.load(open('vo/words.json'))['end'])")"
raw="renders/${name}_1080p120-raw.mp4"
out="renders/${name}_1080p60.mp4"

until mkdir ~/.cache/hf-render.lock 2>/dev/null; do find ~/.cache/hf-render.lock -maxdepth 0 -mmin +120 -exec rmdir {} \; ; sleep 20; done
trap 'rmdir ~/.cache/hf-render.lock 2>/dev/null || true' EXIT
start=$(date +%s)
nice -n 10 npx --yes hyperframes@0.8.162 render -f 120 -q looks --quiet -o "$raw" > qa/finish-render.log 2>&1
rmdir ~/.cache/hf-render.lock; trap - EXIT
echo "render: $(( ($(date +%s) - start) / 60 )) min"
test -s "$raw"

ffmpeg -v error -y -i "$raw" \
  -vf "tmix=frames=2:weights='1 1',select='not(mod(n\,2))',setpts=N/(60*TB),format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv" \
  -r 60 -c:v libx264 -crf 17 -preset slow -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$out"
test -s "$out"

python3 -I -c "
import json
c = json.load(open('cues.json'))
json.dump({'fps': 60, 'events': [{'f': round(x['t'] * 60), 'kind': x['k'], 'weight': 1} for x in c if x['k'] != 'draw']}, open('qa/cues-60.json', 'w'))"
uv run -q --with numpy --with soundfile --with pyloudnorm --with scipy python -I "$CINETIC/probe.py" "$out" \
  --spec 1080x1920@60 --dur "$dur" --lufs -14 --tp-max -1 --json qa/probe.json > /dev/null 2>&1 || true
nice -n 10 "$PY" -I "$CINETIC/forensics.py" "$out" --pace calm --cues qa/cues-60.json --json qa/forensics.json > /dev/null 2>&1 || true
python3 -I -c "
import json
p = json.load(open('qa/probe.json')); print('probe', 'PASS' if p['pass'] else 'FAIL', p.get('loudness'))
[print('  ', c) for c in p['checks'] if not c['ok']]
r = json.load(open('qa/forensics.json')); print('forensics fails', r['fails'], 'warnings', r['warnings'])
[print('  ', f['check'], f['frame'], f.get('t'), f.get('cls'), f.get('mad')) for f in r['flags'] if f.get('severity') == 'fail']"
nice -n 10 "$PY" -I "$repo/tools/motion-lab/flashcheck.py" "$out" 2>&1 | tail -1
echo "-> $proj/$out"
