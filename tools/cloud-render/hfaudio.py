"""python3 hfaudio.py <page>
For a HyperFrames composition without assets/song.wav: print its one <audio> clip as
"<src> <start> <media-start> <duration|-> <volume>", the ffmpeg inputs cloud-render.sh needs to rebuild the
film's sound on the composition clock. Exits 1 unless the page has exactly one unmuted <audio> clip with a local src.
"""
import re, sys

src = open(sys.argv[1], encoding='utf-8', errors='replace').read()
clips = [t for t in re.findall(r'<audio\b[^>]*>', src, re.I) if not re.search(r'\smuted\b', t, re.I)]
if len(clips) != 1:
    print(f'{len(clips)} <audio> clips', file=sys.stderr)
    sys.exit(1)
attr = lambda n, d: (re.search(rf'\s{n}\s*=\s*["\']([^"\']*)["\']', clips[0], re.I) or [None, d])[1]
path = attr('src', '')
num = lambda v: v if re.fullmatch(r'\d+(\.\d+)?', v or '') else None
start, mstart, dur, vol = num(attr('data-start', '0')), num(attr('data-media-start', '0')), attr('data-duration', '-'), num(attr('data-volume', '1'))
if not path or '://' in path or '..' in path or ' ' in path or None in (start, mstart, vol) or (dur != '-' and not num(dur)):
    print('cannot read the <audio> clip: ' + clips[0], file=sys.stderr)
    sys.exit(1)
print(path, start, mstart, dur, vol)
