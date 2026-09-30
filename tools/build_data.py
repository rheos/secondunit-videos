"""Build js/data.js (window.LYRICS + window.FEAT) for the painted dream-of-fire player.

Inputs live in ../_hjeron-dream-of-fire/ (never committed; Hjeron owns the song and lyrics):
  dream-of-fire.wav                       the 97.567 s "4a short" master
  stems/htdemucs/dream-of-fire/vocals.wav Demucs vocal stem
  dream-of-fire.aligned.json              Hjeron's own lyric sheet, force-aligned to the vocal stem
                                          (stable-ts small.en). NOT the old Whisper transcript, whose
                                          words were wrong.

Audio features follow functional-emotions-video's analysis/features.py (MIT): 30 fps band
energies, onset strength and percussive energy, normalised so ~1 is loud. `voc` is the vocal
stem's RMS, which drives the singer's head phrasing (he has no visible mouth).

Beats: librosa reads the song at ~147.7 BPM, and the bars start on beat phase 2 (first downbeat
1.08 s, see ../hjeron-painted-myth/docs/PLAN.md). FEAT.beats is the half-time grid (~73.9 BPM,
every other beat, in phase with that downbeat), which is the pulse the song actually walks at.
FEAT.fast keeps every librosa beat for quick hits.

Run: uv run --with librosa --with 'numpy<2' python tools/build_data.py
"""
import json
from pathlib import Path

import librosa
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT.parent / "_hjeron-dream-of-fire"
# Full-length mix (2026-09-30; unmastered, first 97.567 s sample-aligned to the short mix).
SONG = SRC / "full-mix/dream-of-fire-full.wav"
VOX = SRC / "full-mix/stems/htdemucs/dream-of-fire-full/vocals.wav"
ALIGNED = SRC / "dream-of-fire.aligned.json"                          # first half (short mix)
ALIGNED2 = SRC / "full-mix/dream-of-fire-full.aligned-second-half.json"  # second half (full mix)
DOWNBEAT = 1.08
# Forced alignment stretched the first word back into the intro; its onset in the vocal stem is
# 25.833 s (song frame 620). (line index, word index) -> corrected start.
START_FIX = {(0, 0): 25.833}

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

_, beat_frames = librosa.beat.beat_track(y=y, sr=sr, start_bpm=148)
fast = librosa.frames_to_time(beat_frames, sr=sr)
k = int(np.argmin(np.abs(fast - DOWNBEAT)))
beats = fast[k % 2::2]

r3 = lambda a: [round(float(x), 3) for x in np.clip(a, 0, 1.5)]
feat = dict(fps=sr / hop, beats=[round(float(b), 3) for b in beats], fast=[round(float(b), 3) for b in fast],
            rms=r3(rms), voc=r3(voc), onset=r3(onset), low=r3(band(20, 150)), mid=r3(band(150, 2000)),
            high=r3(band(2000, 11000)), perc=r3(perc), cent=r3(cent))

lines = []
for li, ln in enumerate(json.loads(ALIGNED.read_text())["lines"] + json.loads(ALIGNED2.read_text())["lines"]):
    words = [dict(t=w["word"], s=START_FIX.get((li, wi), w["start"]), e=w["end"]) for wi, w in enumerate(ln["words"])]
    lines.append(dict(text=ln["text"], s=words[0]["s"], e=ln["end"], words=words))

out = ("window.LYRICS=" + json.dumps(lines, separators=(",", ":")) + ";\n"
       "window.FEAT=" + json.dumps(feat, separators=(",", ":")) + ";\n")
(ROOT / "js" / "data.js").write_text(out)
print(f"wrote js/data.js: {len(lines)} lines, {len(feat['beats'])} half-time beats "
      f"(~{60 / np.median(np.diff(beats)):.1f} bpm), {len(rms)} feature frames")
