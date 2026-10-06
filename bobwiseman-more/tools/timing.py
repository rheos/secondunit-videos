"""Build js/data.js (gitignored: it quotes the lyrics) from the pinned song, its stems,
Whisper word times and Bob's lyric sheet.

Words come from the sheet, times from the audio: each sheet word takes the time of the Whisper
word it aligns to (difflib on normalised tokens), gaps are interpolated, and every line start is
snapped to the strongest vocal-stem onset within +-0.6 s of the aligned time.
Run with the viralvision-worker venv (librosa 0.11):
  ~/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python tools/timing.py
"""
import difflib, json, re, hashlib
import numpy as np, librosa

SONG = 'source/more-2026.wav'
SHA = 'e5ef4185c81983f777ad5adeb79a3f3c1936b7a7f76a0fe46fc5ab95d6970a94'
STEMS = 'source/stems/htdemucs_6s/more-2026/'
FPS = 30
# sung order: verse 1, verse 2, chorus, verse 3, chorus (sheet blocks 0, 1, 2, 3, 2)
ORDER = [0, 1, 2, 3, 2]
SECTION = ['verse1', 'verse2', 'chorus1', 'verse3', 'chorus2']
# hand-checked against the vocal stem: Whisper hears one "more" where Bob sings
# "...I want more / more stars" across the verse 3 -> chorus 2 seam. (line, word) -> seconds
OVERRIDES = {(15, 5): 186.5, (16, 0): 188.9}

assert hashlib.sha256(open(SONG, 'rb').read()).hexdigest() == SHA, 'song changed'
norm = lambda w: re.sub(r"[^a-z']", '', w.lower().replace('’', "'"))

blocks, cur = [], []
for ln in open('source/more.lyrics.txt'):
    ln = ln.strip()
    if ln.startswith('#'): continue
    if not ln:
        if cur: blocks.append(cur); cur = []
        continue
    cur.append(ln)
if cur: blocks.append(cur)

lines = []  # (section, text)
for k, b in enumerate(ORDER):
    for ln in blocks[b]: lines.append((SECTION[k], ln))
sheet = [(i, w) for i, (_, ln) in enumerate(lines) for w in ln.replace('-', ' ').split()]

ww = [w for s in json.load(open('source/words-whisper-medium.json')) for w in s['words']]
A = [norm(w) for _, w in sheet]; B = [norm(w['w']) for w in ww]
t = [None] * len(sheet); match = [None] * len(sheet)
for a, b, n in difflib.SequenceMatcher(None, A, B, autojunk=False).get_matching_blocks():
    for k in range(n): t[a + k] = ww[b + k]['s']; match[a + k] = b + k
known = [i for i, v in enumerate(t) if v is not None]
for i in range(len(t)):  # interpolate gaps between matched words
    if t[i] is None:
        lo = max([k for k in known if k < i], default=None); hi = min([k for k in known if k > i], default=None)
        if lo is None: t[i] = t[hi] - .3 * (hi - i)
        elif hi is None: t[i] = t[lo] + .3 * (i - lo)
        else: t[i] = t[lo] + (t[hi] - t[lo]) * (i - lo) / (hi - lo)
        if lo is not None: t[i] = min(t[i], t[lo] + .6 * (i - lo))  # never drift into an instrumental

# vocal onsets: rise in log energy over 40 ms
v, sr = librosa.load(STEMS + 'vocals.wav', sr=22050, mono=True)
hop = 220  # 10 ms
e = np.log(librosa.feature.rms(y=v, frame_length=882, hop_length=hop)[0] + 1e-5)
rise = np.maximum(0, e[4:] - e[:-4]); rise = np.concatenate([np.zeros(4), rise])
def snap(t0):
    a, b = int((t0 - .6) * 100), int((t0 + .6) * 100)
    seg = rise[max(0, a):b]
    if len(seg) == 0 or seg.max() < 1.0: return t0, False
    return (max(0, a) + int(seg.argmax())) / 100, True

out_lines = []
for i, (sec, text) in enumerate(lines):
    idx = [k for k, (li, _) in enumerate(sheet) if li == i]
    ws = [{'w': sheet[k][1], 't': round(t[k], 3)} for k in idx]
    # pickups Bob sings that the sheet leaves out ("I don't want evening"): unmatched Whisper
    # words just before the line's first matched word start the line
    first = next((match[k] for k in idx if match[k] is not None), None)
    if first is not None and match[idx[0]] is not None:
        b = first
        while b > 0 and b - 1 not in match and ww[first]['s'] - ww[b - 1]['s'] < 1.2: b -= 1
        if b < first: ws[0]['t'] = ww[b]['s']
    for (li, wi), tv in OVERRIDES.items():
        if li == i: ws[wi]['t'] = tv
    s0, snapped = snap(ws[0]['t'])
    if len(ws) > 1 and s0 >= ws[1]['t']: s0, snapped = ws[0]['t'], False  # never past the 2nd word
    shift = s0 - ws[0]['t']; ws[0]['t'] = round(s0, 3)
    out_lines.append({'sec': sec, 'text': text, 't0': round(s0, 3), 'snapped': snapped, 'words': ws})
for i, L in enumerate(out_lines):
    nxt = out_lines[i + 1]['t0'] if i + 1 < len(out_lines) else L['words'][-1]['t'] + 2
    L['t1'] = round(min(nxt, L['words'][-1]['t'] + 2.5), 3)

# features at 30 fps: vocal / drums / bass / other loudness 0..1, beats from the drums stem
feat = {'fps': FPS}
for name in ['vocals', 'drums', 'bass', 'other', 'piano']:
    y, _ = librosa.load(STEMS + name + '.wav', sr=22050, mono=True)
    r = librosa.feature.rms(y=y, frame_length=2048, hop_length=22050 // FPS)[0]
    d = 20 * np.log10(r + 1e-6); d = np.clip((d + 60) / 50, 0, 1)
    feat[name] = [round(float(x), 3) for x in d]
y, _ = librosa.load(SONG, sr=22050, mono=True)
tempo, beats = librosa.beat.beat_track(y=y, sr=22050, units='time')
feat['tempo'] = float(np.atleast_1d(tempo)[0]); feat['beats'] = [round(float(b), 3) for b in beats]

js = 'window.FEAT = ' + json.dumps(feat, separators=(',', ':')) + ';\nwindow.LINES = ' + json.dumps(out_lines, indent=0) + ';\n'
open('js/data.js', 'w').write(js)
print(f"tempo {feat['tempo']:.1f} bpm, {len(feat['beats'])} beats")
for L in out_lines: print(f"{L['t0']:7.2f}-{L['t1']:7.2f} {'*' if L['snapped'] else ' '} {L['sec']:8s} {L['text']}")
