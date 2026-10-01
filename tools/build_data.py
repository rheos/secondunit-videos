"""Build js/data.js (window.LYRICS + window.FEAT) for the Clap Hands player.

Inputs live in _in/ (gitignored; the performance is Gemma Luna's, the recording Radio Free Winlove's,
the song Tom Waits'): the 186 s master, its Demucs vocal stem, and _in/words.json (tools/words.py).

FEAT: 30 fps band energies, onset strength, percussive energy, the vocal stem's RMS (`voc`) and its
onsets (`vonsets`, seconds), normalised so ~1 is loud. Beats from librosa.

Run: uv run --python 3.11 --with 'librosa==0.10.2.post1' --with 'numba==0.60.0' --with 'llvmlite==0.43.0' --with 'numpy<2' python tools/build_data.py
(librosa 0.11's numba pulls llvmlite 0.50, which won't build on this Intel Mac)
"""
import json
from pathlib import Path

import librosa
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SONG = ROOT / "_in/gemmaluna-tomwaits_master.wav"
VOX = ROOT / "_in/stems/htdemucs/gemmaluna-tomwaits_master/vocals.wav"
WORDS = ROOT / "_in/words.json"

sr, hop = 22050, 735  # 30 fps
y, _ = librosa.load(str(SONG), sr=sr, mono=True)
v, _ = librosa.load(str(VOX), sr=sr, mono=True)
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)


def unit(a):
    return a / (np.percentile(a, 99) + 1e-9)


def band(lo, hi):
    return unit(S[(freqs >= lo) & (freqs < hi)].mean(0))


rms = unit(librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0])
voc = unit(librosa.feature.rms(y=v, frame_length=2048, hop_length=hop)[0])
onset = unit(librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop))
_, perc_s = librosa.decompose.hpss(S)
perc = unit(perc_s.mean(0))
cent = unit(librosa.feature.spectral_centroid(S=S, sr=sr)[0])
tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr, hop_length=hop)
beats = librosa.frames_to_time(beat_frames, sr=sr, hop_length=hop)
von = librosa.onset.onset_detect(y=v, sr=sr, hop_length=hop, units="time", backtrack=False, delta=.12)

r3 = lambda a: [round(float(x), 3) for x in np.clip(a, 0, 1.5)]
feat = dict(fps=sr / hop, beats=[round(float(b), 3) for b in beats], vonsets=[round(float(b), 3) for b in von],
            rms=r3(rms), voc=r3(voc), onset=r3(onset), low=r3(band(20, 150)), mid=r3(band(150, 2000)),
            high=r3(band(2000, 11000)), perc=r3(perc), cent=r3(cent))
lines = json.loads(WORDS.read_text())["lines"]
(ROOT / "js").mkdir(exist_ok=True)
(ROOT / "js/data.js").write_text("window.LYRICS=" + json.dumps(lines, separators=(",", ":")) + ";\n"
                                 "window.FEAT=" + json.dumps(feat, separators=(",", ":")) + ";\n")
print(f"tempo {float(np.atleast_1d(tempo)[0]):.1f} bpm, {len(beats)} beats, {len(von)} vocal onsets, {len(rms)} frames")
