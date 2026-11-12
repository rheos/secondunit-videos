"""Snap key words to onsets of _in/andre.wav. Method (docs/BRIEF.md): rise in log energy over 40 ms; the strongest
rise within +-0.25 s of the Whisper cue, then +-0.6 s; keep the cue when the rise is weak (under 6 dB).
Run from tests/paper-world/:
    $PY tools/onsets.py          sections 5 to 7 (f1800-f3397): the list below, written to js/cues.js, exactly as before
    $PY tools/onsets.py 03       one section: reads tools/cues/s03.json, writes js/cues/s03.js
    $PY tools/onsets.py all      every tools/cues/sNN.json, and js/cues.js
    $PY tools/onsets.py stills 03   prints the section's still frames: its first and last frame, every snapped cue frame, the stills list
A generated file is written under a temporary name and renamed, and left alone when nothing changed, so a render that
is loading the page at that moment never reads half a file.
tools/cues/sNN.json (tracked by git, so key words only, never the dialogue):
    { "section": 3, "words": [ { "key": "bored1", "word": "bored", "cue": 565 }, { "key": "no", "word": "no", "cue": 1172, "hand": 1174 } ],
      "stills": [504, 560] }
  key: the name the section module uses (C.bored1); word: the word as Whisper has it in _in/cues.json (case and
  punctuation ignored); cue: its Whisper frame (f0 there, within 3 frames); hand: your own pick, which wins over the
  snapper; stills: frames make-section.sh copies to check-sNN/ besides every snapped cue frame.
The generated files hold transcript words and are gitignored (js/cues.js, js/cues/). The list for sections 5 to 7 was
copied from tests/table-city/tools/onsets.py with its two hand picks, plus the words test 02 adds.
"""
import json, os, re, sys, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
FPS = 24
KEYS = [  # (key, word text, Whisper frame f0 from cues.json, segment id or None)
    ('findhorn1', 'Findhorn,', 1819), ('tree', 'tree', 1871), ('expert', 'expert', 1878), ('trees', 'trees.', 1934),
    ('back', 'back', 1956), ('redwoods', 'redwoods.', 2000), ('eighty4', '84', 2020), ('backpack', 'backpack,', 2070),
    ('tomorrow', 'tomorrow.', 2108), ('where', 'where', 2192), ('from', 'from?', 2198), ('newyork1', 'New', 2215),
    ('newyork2', 'New', 2235), ('leave1', 'leave', 2342), ('never', 'never', 2350), ('do', 'do?', 2355),
    ('yes', 'yes.', 2379), ('why', 'why', 2404), ('leave2', 'leave?', 2424), ('gave', 'gave', 2442),
    ('theories', 'theories.', 2462), ('oh', 'oh,', 2491), ('all', 'all.', 2520),
    # section 6, the camp
    ('think', 'think', 2560), ('camp', 'camp,', 2628), ('camp2', 'camp', 2655), ('built', 'built', 2668), ('themselves', 'themselves,', 2688),
    ('guards', 'guards,', 2736), ('pride', 'pride', 2760), ('prison1', 'prison.', 2819), ('schizophrenia', 'schizophrenia,', 2881),
    ('guards2', 'guards', 2908), ('prisoners', 'prisoners,', 2926), ('result', 'result,', 2953), ('lobotomized', 'lobotomized,', 3003),
    ('see', 'see', 3099), ('prison2', 'prison.', 3128),
    # section 7, the seed
    ('then', 'And', 3168), ('pocket', 'pocket,', 3187), ('took', 'took', 3200), ('seed', 'seed', 3211), ('pine', 'pine', 3260),
    ('hand', 'hand,', 3302), ('escape', 'escape', 3335), ('before', 'before', 3335), ('late', 'late.', 3363),
]
# hand picks from the envelope (tests/table-city/NOTES.md): the snapper takes a neighbouring word for these
HAND = {'newyork2': 2236, 'leave2': 2426, 'newyork1': 2215,
        # sections 6 and 7, read off the per-frame envelope and the 3.5 to 9 kHz band (sibilants): the snapper's +-0.25 s
        # window takes a neighbouring word in this fast stretch. The vowel of the word, or its stressed syllable.
        'camp': 2636, 'pride': 2761, 'guards2': 2911, 'prisoners': 2930, 'result': 2957, 'lobotomized': 3007,
        'see': 3107, 'prison2': 3128, 'seed': 3212, 'pine': 3260, 'before': 3346, 'late': 3365}

with wave.open(os.path.join(PROJ, '_in', 'andre.wav'), 'rb') as w:
    sr, n, ch = w.getframerate(), w.getnframes(), w.getnchannels()
    pcm = np.frombuffer(w.readframes(n), np.int16).reshape(-1, ch).mean(axis=1) / 32768.0
hop, win = int(sr * 0.005), int(sr * 0.040)
nf = (len(pcm) - win) // hop
e = np.array([np.log10(np.mean(pcm[i * hop:i * hop + win] ** 2) + 1e-9) * 10 for i in range(nf)])
rise = np.zeros_like(e); rise[8:] = e[8:] - e[:-8]      # rise over 40 ms (8 hops of 5 ms)

cues = json.load(open(os.path.join(PROJ, '_in', 'cues.json')))

def snap(t, f0):
    """the frame of the strongest rise near time t, and that rise in dB; the Whisper frame f0 when the rise is weak"""
    snapped, r = f0, 0.0
    for half in (0.25, 0.6):
        a, b = int((t - half) / 0.005), int((t + half) / 0.005)
        k = a + int(np.argmax(rise[a:b])); r = rise[k]
        if r >= 6: snapped = round((k * 0.005 + 0.020) * FPS); break   # the rise window's centre
    return int(snapped), float(r)

def film():
    """sections 5 to 7: KEYS and HAND above -> js/cues.js"""
    out, report = {}, []
    for key, text, f0 in KEYS:
        w = next((x for x in cues['words'] if x['f0'] == f0 and x['w'] == text), None)
        assert w, (key, text, f0)
        snapped, r = snap(w['t0'], w['f0'])
        how = 'onset'
        if key in HAND: snapped, how = HAND[key], 'hand'
        out[key] = {'cue': w['f0'], 'f': int(snapped), 'rise_db': round(float(r), 1), 'how': how}
        report.append(f"{key:10s} {text:12s} cue f{w['f0']}  -> f{snapped} ({snapped - w['f0']:+d})  rise {r:.1f} dB  {how}")
    print('\n'.join(report))
    write(os.path.join(HERE, '..', 'js', 'cues.js'), '// generated by tools/onsets.py from _in/cues.json and onsets of _in/andre.wav; frames at 24 fps\n'
          + 'export const CUES = ' + json.dumps(out, indent=1) + ';\n')

def write(path, text):
    if os.path.exists(path) and open(path).read() == text: return
    with open(path + '.part', 'w') as f: f.write(text)
    os.replace(path + '.part', path)

RANGES = {1: (0, 196), 2: (196, 504), 3: (504, 1196), 4: (1196, 1800), 5: (1800, 2544), 6: (2544, 3130), 7: (3130, 3397), 8: (3397, 3840), 9: (3840, 4315), 10: (4315, 4761)}
def stills(nn):
    """the frames make-section.sh keeps as stills"""
    n = int(nn); f0, f1 = RANGES[n]; own = os.path.join(HERE, '..', 'js', 'cues', f's{nn}.js'); spec = os.path.join(HERE, 'cues', f's{nn}.json')
    src = open(own if os.path.exists(spec) else os.path.join(HERE, '..', 'js', 'cues.js')).read()
    found = json.loads(src[src.index('{'):src.index(';\n')])
    fr = {f0, f1 - 1} | {v['f'] for v in found.values() if os.path.exists(spec) or f0 <= v['f'] < f1}
    if os.path.exists(spec): fr |= {int(v) for v in json.load(open(spec)).get('stills', [])}
    print(' '.join(str(v) for v in sorted(fr) if 0 <= v < 4761))

norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
def section(nn):
    """one section: tools/cues/sNN.json -> js/cues/sNN.js"""
    src = os.path.join(HERE, 'cues', f's{nn}.json'); spec = json.load(open(src))
    out, report = {}, []
    for item in spec.get('words', []):
        key, text, f0 = item['key'], item['word'], int(item['cue'])
        near = sorted((x for x in cues['words'] if abs(x['f0'] - f0) <= 3 and norm(x['w']) == norm(text)), key=lambda x: abs(x['f0'] - f0))
        if not near:
            around = ', '.join(f"{x['w']} f{x['f0']}" for x in cues['words'] if abs(x['f0'] - f0) <= 12)
            sys.exit(f"s{nn}.json: no word '{text}' within 3 frames of f{f0} in _in/cues.json (key {key}). Words near it: {around}")
        if key in out: sys.exit(f"s{nn}.json: the key '{key}' is used twice")
        w = near[0]; snapped, r = snap(w['t0'], w['f0']); how = 'onset'
        if item.get('hand') is not None: snapped, how = int(item['hand']), 'hand'
        out[key] = {'cue': w['f0'], 'f': snapped, 'rise_db': round(r, 1), 'how': how}
        report.append(f"{key:14s} {text:14s} cue f{w['f0']}  -> f{snapped} ({snapped - w['f0']:+d})  rise {r:.1f} dB  {how}")
    print('\n'.join(report) if report else f's{nn}: no words yet')
    os.makedirs(os.path.join(HERE, '..', 'js', 'cues'), exist_ok=True)
    write(os.path.join(HERE, '..', 'js', 'cues', f's{nn}.js'), f'// generated by tools/onsets.py {nn} from tools/cues/s{nn}.json, _in/cues.json and onsets of _in/andre.wav; frames at 24 fps\n'
          + 'export const CUES = ' + json.dumps(out, indent=1) + ';\n'
          + 'export const STILLS = ' + json.dumps(sorted(set(int(v) for v in spec.get('stills', [])))) + ';\n')

args = sys.argv[1:]
if not args: film()
if args[:1] == ['stills']: stills(f'{int(args[1]):02d}'); args = []
for a in args:
    if a == 'all':
        film()
        for name in sorted(os.listdir(os.path.join(HERE, 'cues'))):
            if re.fullmatch(r's\d\d\.json', name): section(name[1:3])
    else: section(f'{int(a):02d}')
