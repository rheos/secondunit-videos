"""Analyse the instrumental intro (0 to 25.84 s) of no_vocals.wav and write js/data.js.

Run with the viralvision-worker venv (it has librosa):
  ../../../viralvision/viralvision-worker/.venv/bin/python tools/analyze.py [--report]

Writes window.FEAT = { fps, beats, onsets, rms, low, mid, high, perc, onset } at 24 fps,
so every frame of the video has exactly one feature sample.
"""
import json
import sys
from pathlib import Path

import librosa
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
STEM = ROOT / "assets" / "no_vocals.wav"
END = 25.84
SR = 22050
HOP = 1225 // 1  # not used directly; features below are resampled to 24 fps

y, sr = librosa.load(str(STEM), sr=SR, mono=True, duration=END + 2.0)
hop = 256
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
ft = librosa.frames_to_time(np.arange(S.shape[1]), sr=sr, hop_length=hop)


def unit(a):
    return a / (np.percentile(a, 99) + 1e-9)


def band(lo, hi):
    return S[(freqs >= lo) & (freqs < hi)].mean(0)


rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0]
onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
H, Pc = librosa.decompose.hpss(S)
perc = Pc.mean(0)
low, mid, high = band(20, 150), band(150, 2000), band(2000, 11000)

# percussive onset envelope, for hits
perc_on = librosa.onset.onset_strength(S=librosa.amplitude_to_db(Pc, ref=np.max), sr=sr, hop_length=hop)
low_on = np.maximum(0, np.diff(np.log1p(low * 50), prepend=0))

tempo, beat_frames = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr, hop_length=hop)
beats = librosa.frames_to_time(beat_frames, sr=sr, hop_length=hop)
onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr, hop_length=hop, backtrack=False, units="time")
on_str = np.interp(onsets, ft, unit(onset_env))
low_peaks = librosa.util.peak_pick(unit(low_on), pre_max=6, post_max=6, pre_avg=20, post_avg=20, delta=0.15, wait=20)
low_hits = ft[low_peaks]

# resample continuous features to 24 fps
FPS = 24
tt = np.arange(0, END + 1.0, 1 / FPS)
rs = lambda a: np.interp(tt, ft, unit(a))
r3 = lambda a: [round(float(v), 3) for v in np.clip(a, 0, 1.5)]
feat = dict(
    fps=FPS,
    tempo=float(np.atleast_1d(tempo)[0]),
    beats=[round(float(b), 3) for b in beats if b < END + 1],
    onsets=[[round(float(t), 3), round(float(s), 3)] for t, s in zip(onsets, on_str) if t < END + 1],
    lowHits=[round(float(t), 3) for t in low_hits if t < END + 1],
    rms=r3(rs(rms)), low=r3(rs(low)), mid=r3(rs(mid)), high=r3(rs(high)), perc=r3(rs(perc)),
    onset=r3(rs(onset_env)),
)
(ROOT / "js" / "data.js").write_text("window.FEAT=" + json.dumps(feat, separators=(",", ":")) + ";\n")

if "--report" in sys.argv:
    print("tempo", feat["tempo"])
    print("beats", [round(b, 2) for b in feat["beats"]])
    print("strong onsets (>.35)", [(t, s) for t, s in feat["onsets"] if s > 0.35])
    print("low hits", feat["lowHits"])
    # per-second energy profile
    for s in range(0, 27):
        i0, i1 = s * FPS, (s + 1) * FPS
        seg = lambda k: np.mean(feat[k][i0:i1]) if i0 < len(feat[k]) else 0
        print(f"{s:2d}s rms {seg('rms'):.2f} low {seg('low'):.2f} mid {seg('mid'):.2f} high {seg('high'):.2f} perc {seg('perc'):.2f} " + "#" * int(seg("rms") * 40))
print("wrote js/data.js")
