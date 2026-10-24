"""The chattering teeth's clack times (draft 29), from the song's 16th-note grid snapped to onsets in the stems.

Bob on draft 28: the teeth chatter slower than the "buh buh buh". The buhs run on 16th notes (0.15 s at 99.4 bpm):
the onset envelope of the stems repeats at 0.15 s far more strongly inside the three runs than anywhere else, and
that periodicity dies at about 0:55, 1:53 and 3:00, where Robin heard each run end. Demucs filed most of the buh
attack in the no_vocals stem, so both stems are read. Detection alone can't tell the backing voice from a hi-hat on
the same grid, so every 16th from a run's start to its end is a clack, moved onto the strongest onset within 20 ms (under half a frame, so the chatter stays even)
of the slot when there is one.

If Robin holds a key through the buhs on BUH-TAP.html, pass its marks with --marks: the clacks are then the 16ths
inside his held spans only (still snapped to onsets), so a gap he hears is a gap in the chatter.

Usage: buh_onsets.py <song.wav> <vocals.wav> <no_vocals.wav> <out.js> [--marks marks.json]
"""
import sys, json, numpy as np, librosa

song, voc, nov, out_js = sys.argv[1:5]
marks = json.load(open(sys.argv[sys.argv.index('--marks') + 1])) if '--marks' in sys.argv else None
# draft 31b: --taps <json> is Robin's tap pass on BUH-TAP.html (2026-10-20, one tap per buh he hears, tools/buh-taps-robin.json).
# Taps under PHRASE s apart are one phrase, filled with every 16th from its first tap to its last (he can't tap 16ths,
# and Bob wants the chatter as fast as the buhs); a tap on its own is one clack.
taps = [m[0] for m in json.load(open(sys.argv[sys.argv.index('--taps') + 1]))] if '--taps' in sys.argv else None
PHRASE = .5
BURSTS_FROM = [46.5, 104.5, 181.5]
SR, HOP = 22050, 64
FR = SR / HOP
# run starts (the draft 25 times) and ends (Robin by ear: draft 28, and the 2:52 run on to 3:05 in draft 30)
RUNS = [(37.57, 46.4), (95.47, 113.9), (171.97, 185.6)]  # runs 2 and 3 end on a whole phrase (Robin heard about 1:53 and 3:05)
# draft 31 (Bob on d29: "the buh buh buh finishes each time prior to the chatter. finish @39 and @41 and @43 and @46"):
# the buhs are phrases, one per bar: 11 sixteenths on (Bob's "11 times"), then 5 off. The run 1 phrases end at 39.1,
# 41.5, 44.0 and 46.4 on that grid, which is where Bob hears them finish; the stems' 16th-note periodicity drops out in
# the same places. Bob's four finishes also end run 1 at 0:46 (draft 28's 0:55 was a guess).
ON, BAR = 11, 16
SNAP = .02

def env_of(path):
    y, _ = librosa.load(path, sr=SR, mono=True)
    S = np.abs(librosa.stft(y, n_fft=1024, hop_length=HOP)); f = librosa.fft_frequencies(sr=SR, n_fft=1024)
    L = np.log1p(S[(f > 150) & (f < 2500)] * 10); e = np.maximum(0, np.diff(L, axis=1)).mean(0)
    e = np.convolve(e, np.ones(3) / 3, 'same'); return e / np.median(e)

y, _ = librosa.load(song, sr=SR, mono=True)
_, beats = librosa.beat.beat_track(y=y, sr=SR, hop_length=256, units='time', start_bpm=100, tightness=400)
env = env_of(voc); e2 = env_of(nov); n = min(len(env), len(e2)); env = np.maximum(env[:n], e2[:n])
slots = np.array([b + (beats[i + 1] - b) * q / 4 for i, b in enumerate(beats[:-1]) for q in range(4)])

def snap(t):
    i0, i1 = int((t - SNAP) * FR), int((t + SNAP) * FR) + 1; j = i0 + int(np.argmax(env[i0:i1]))
    return j / FR if env[j] >= 1.6 else t

ons = []
if '--slots' in sys.argv:
    taps = None; RUNS = []
    ons = [snap(slots[i]) for i in json.load(open(sys.argv[sys.argv.index('--slots') + 1]))]
if taps:
    # draft 31c (Robin: "i might be a bit off.. are you able to align it?"): his taps sit +-1-2 sixteenths either side of
    # the grid, with no constant lag, and the stems can't pick the edges (every 16th has a drum onset as strong as a buh).
    # The song's own structure can: phrases start on the downbeat and run 11 sixteenths (Bob's "11 times"), and his lone
    # taps fall on the beats. So a phrase starts on the nearest downbeat (the nearest beat if no downbeat is within 3
    # sixteenths), a phrase he tapped 8+ sixteenths long runs the full 11, a shorter one ends on his last tap, and a
    # lone tap moves to the nearest beat. Bar phase: the run-1 first buh (37.616) is a downbeat.
    ref = int(np.argmin(abs(slots - 37.616)))
    near = lambda t: int(np.argmin(abs(slots - t)))
    def snap_to(k, every, reach):
        best = min(range(k - reach, k + reach + 1), key=lambda j: (((j - ref) % every) != 0, abs(j - k)))
        return best if (best - ref) % every == 0 else k
    phrases = [[taps[0]]]
    for x in taps[1:]:
        if x - phrases[-1][-1] < PHRASE: phrases[-1].append(x)
        else: phrases.append([x])
    K = set()
    for ph in phrases:
        k0, k1 = near(ph[0]), near(ph[-1])
        if len(ph) == 1: K.add(snap_to(k0, 4, 2)); continue
        a0 = snap_to(k0, 16, 3); a0 = a0 if (a0 - ref) % 16 == 0 else snap_to(k0, 4, 2)
        a1 = a0 + ON - 1 if k1 - k0 + 1 >= 8 else max(a0 + 1, k1)
        K.update(range(a0, a1 + 1))
    # draft 31d (Robin: "from about 0:46 it should be doing the same pace as where i have it more spaced out bursts"):
    # where he tapped lone buhs (one per beat) the backing goes on in bursts, so from these times every bar that has
    # any buh becomes a full 11-sixteenth burst on its downbeat
    for f in BURSTS_FROM:
        e = f + 12
        for b in sorted({(k - ref) // 16 for k in K if f <= slots[k] <= e}):
            k0 = ref + 16 * b; K -= set(range(k0, k0 + 16)); K.update(range(k0, k0 + ON))
    if '--grid' in sys.argv:  # the 16th grid and these slots for BUH-SYNC.html's editor
        open(sys.argv[sys.argv.index('--grid') + 1], 'w').write('// Generated by tools/buh_onsets.py: the song\'s 16th-note grid (s) and the bar phase, for BUH-SYNC.html.\n'
            f'const BUH_GRID = {json.dumps([round(float(x), 3) for x in slots])}, BUH_REF = {ref};\n')
    ons += [snap(slots[i]) for i in sorted(K)]
    RUNS = []
for a, z in RUNS:
    if marks:  # Robin's held spans; a hold starts a touch late, so a slot up to 0.1 s before it counts
        ons += [snap(s) for s in slots if any(m0 - .1 <= s <= m1 for m0, m1 in marks) and a - 3 <= s <= z + 3]
    else:
        i0 = int(np.argmin(abs(slots - a))); i1 = int(np.argmin(abs(slots - z)))
        ons += [snap(slots[i]) for i in range(i0, i1 + 1) if (i - i0) % BAR < ON]
ons = sorted(round(t, 3) for t in ons)
d = np.diff(ons); d = d[d < 1]
print(f'{len(ons)} clacks, spacing median {np.median(d):.3f} s, min {d.min():.3f} s')
open(out_js, 'w').write('// Generated by tools/buh_onsets.py: the chattering teeth clack times (s). Edit the runs or the taps, not this file.\n'
                        f'const BUH_ONSETS = {json.dumps(ons)};\n')
