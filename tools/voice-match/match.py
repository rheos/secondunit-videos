#!/usr/bin/env python3
"""Pick a voice by measurement: median pitch (pyin) and mean MFCC against a reference narrator.

Every measurement is kept in voices.jsonl (voices) and refs.jsonl (reference narrators), one line per item, written as
soon as it is measured. A voice already in the catalogue is never downloaded or measured again, so an interrupted run
resumes where it stopped. Comparing a new reference costs one measurement of the reference, nothing else.

  match.py sync                      # add any ElevenLabs voices not yet in the catalogue (previews are free)
  match.py ref <name> <audio...>     # measure a reference narrator and keep it
  match.py rank <name> [--top N] [--account] [--measure file...]

Run with viralvision-worker/.venv/bin/python -I (needs librosa). The key comes from keys/elevenlabs/api.txt.
Pitch distance is in semitones. Timbre is the distance between mean MFCCs 1-13, z-scored over the catalogue.
Score = semitones/2 + timbre/median timbre. Lower is closer. A preview is text-to-speech, so measure the converted audio too.
"""
import sys, os, json, glob, argparse, subprocess, tempfile, datetime, urllib.request, urllib.parse
from multiprocessing import Pool
import numpy as np, librosa

HERE = os.path.dirname(os.path.abspath(__file__))
VOICES, REFS = os.path.join(HERE, 'voices.jsonl'), os.path.join(HERE, 'refs.jsonl')
KEY_FILE = os.path.expanduser('~/Documents/novadiem/keys/elevenlabs/api.txt')
SR = 22050
API = 'https://api.elevenlabs.io/v1'
SEARCHES = [dict(gender='male', language='en', age=a, use_cases=u) for a in ('young', 'middle_aged', 'old') for u in ('narrative_story', 'conversational', 'characters_animation', 'social_media')] \
         + [dict(gender='female', language='en', age=a, use_cases=u) for a in ('young', 'middle_aged') for u in ('narrative_story', 'conversational')] \
         + [dict(gender='neutral', language='en')]
SKIP_NAMES = ('Instant Robin', 'Robin Pro')  # Robin's own clones stay out of the catalogue

def load(p, seconds=None):
    a = ['ffmpeg', '-v', 'error', '-i', p] + (['-t', str(seconds)] if seconds else [])
    return np.frombuffer(subprocess.run(a + ['-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, dtype=np.float32)

def measure(y):
    iv = librosa.effects.split(y, top_db=32)
    y = np.concatenate([y[a:b] for a, b in iv]) if len(iv) else y
    f0, ok, _ = librosa.pyin(y, fmin=60, fmax=400, sr=SR, frame_length=2048, hop_length=512)
    f = f0[ok & ~np.isnan(f0)]
    if not len(f): return None
    return dict(f0=round(float(np.median(f)), 1), spread=round(float(np.std(12*np.log2(f/np.median(f)))), 2),
                mfcc=[round(float(q), 2) for q in librosa.feature.mfcc(y=y, sr=SR, n_mfcc=14, hop_length=512)[1:].mean(axis=1)], secs=round(len(y)/SR, 1))

def read(path):
    if not os.path.exists(path): return {}
    out = {}
    for line in open(path):
        if line.strip(): r = json.loads(line); out[r['id']] = r
    return out

def get(url, key):
    req = urllib.request.Request(url, headers={'xi-api-key': key})
    with urllib.request.urlopen(req, timeout=40) as r: return json.load(r)

def list_voices(key):
    out = {}
    for v in get(API + '/voices', key)['voices']:
        if v.get('preview_url') and not v['name'].startswith(SKIP_NAMES):
            out[v['voice_id']] = dict(id=v['voice_id'], name=v['name'], src='account', labels=v.get('labels') or {}, url=v['preview_url'])
    for q in SEARCHES:
        for page in range(3):
            d = get(f"{API}/shared-voices?{urllib.parse.urlencode(dict(q, page_size=100, page=page))}", key)
            for v in d.get('voices', []):
                if v.get('preview_url') and v['voice_id'] not in out:
                    out[v['voice_id']] = dict(id=v['voice_id'], name=v['name'], src='library', owner=v.get('public_owner_id'), labels={k: v.get(k) for k in ('gender', 'age', 'accent', 'use_case', 'descriptive')}, url=v['preview_url'])
            if not d.get('has_more'): break
    return list(out.values())

def one(v):
    try:
        with tempfile.NamedTemporaryFile(suffix='.mp3') as t:
            with urllib.request.urlopen(v['url'], timeout=40) as r: t.write(r.read())
            t.flush(); m = measure(load(t.name, 15))
    except Exception:
        return None
    return dict({k: x for k, x in v.items() if k != 'url'}, **m, measured=datetime.date.today().isoformat()) if m else None

def sync(_):
    key = open(KEY_FILE).read().strip(); have = read(VOICES); todo = [v for v in list_voices(key) if v['id'] not in have]
    print(f'{len(have)} in catalogue, {len(todo)} new', flush=True)
    with Pool(3) as pool, open(VOICES, 'a') as out:
        for i, r in enumerate(pool.imap_unordered(one, todo, chunksize=4)):
            if r: out.write(json.dumps(r, ensure_ascii=False) + '\n'); out.flush()
            if i % 50 == 0: print(i, 'done', flush=True)
    print(len(read(VOICES)), 'in catalogue')

def ref(a):
    ms = [measure(load(p, 120)) for p in a.audio]
    r = dict(id=a.name, f0=round(float(np.median([m['f0'] for m in ms])), 1), spread=round(float(np.median([m['spread'] for m in ms])), 2), mfcc=[round(float(q), 2) for q in np.mean([m['mfcc'] for m in ms], axis=0)],
             per_file=[{'file': os.path.basename(p), 'f0': m['f0'], 'secs': m['secs']} for p, m in zip(a.audio, ms)], note=a.note, measured=datetime.date.today().isoformat())
    have = read(REFS); have[a.name] = r
    with open(REFS, 'w') as out:
        for x in have.values(): out.write(json.dumps(x, ensure_ascii=False) + '\n')
    print(a.name, r['f0'], 'Hz', r['per_file'])

def rank(a):
    R = read(REFS)[a.name]; rows = [r for r in read(VOICES).values() if (not a.account or r['src'] == 'account') and (not a.gender or (r.get('labels') or {}).get('gender') == a.gender)]
    M = np.array([r['mfcc'] for r in read(VOICES).values()]); sd = M.std(0) + 1e-6; rm = np.array(R['mfcc'])
    st = lambda f: abs(12*np.log2(f/R['f0'])); tim = lambda m: float(np.linalg.norm((np.array(m) - rm)/sd))
    medt = float(np.median([tim(r['mfcc']) for r in rows]))
    for r in rows: r['st'], r['tim'] = st(r['f0']), tim(r['mfcc']); r['score'] = r['st']/2 + r['tim']/medt
    rows.sort(key=lambda r: r['score'])
    print(f"Reference {a.name}: {R['f0']} Hz, pitch spread {R['spread']} st. {len(rows)} voices.\n")
    for i, r in enumerate(rows[:a.top]):
        l = r.get('labels') or {}
        print(f"{i+1:3d} {r['score']:.2f}  {r['f0']:5.1f} Hz {r['st']:4.1f} st  timbre {r['tim']:5.1f}  {r['src']:7s} {l.get('gender') or '':6s} {l.get('age') or '':11s} {l.get('accent') or '':10s} {r['name'][:34]:34s} {r['id']}")
    for p in a.measure or []:
        m = measure(load(p)); print(f"\n{os.path.basename(p)}: {m['f0']} Hz, {st(m['f0']):.1f} st from reference, timbre {tim(m['mfcc']):.1f}")

ap = argparse.ArgumentParser(); sub = ap.add_subparsers(required=True)
p = sub.add_parser('sync'); p.set_defaults(fn=sync)
p = sub.add_parser('ref'); p.add_argument('name'); p.add_argument('audio', nargs='+'); p.add_argument('--note', default=''); p.set_defaults(fn=ref)
p = sub.add_parser('rank'); p.add_argument('name'); p.add_argument('--top', type=int, default=20); p.add_argument('--account', action='store_true'); p.add_argument('--gender'); p.add_argument('--measure', nargs='*'); p.set_defaults(fn=rank)
if __name__ == '__main__':
    a = ap.parse_args(); a.fn(a)
