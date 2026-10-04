"""Build js/data.js (window.LYRICS + window.FEAT) for the painted player.

Lyric timing comes from ViralVision's aligned transcript (Paul's own lyric sheet,
timed by Whisper, see viralvision-worker/lyrics_align.py). Audio features follow
functional-emotions-video's analysis/features.py (MIT): 30 fps band energies, onset
strength and percussive energy, normalised so ~1 is loud.

Beats: librosa reads this track at 161.5 BPM, which is double time. The song moves at
~80.7 BPM, one sung "sheep" per beat, so FEAT.beats keeps every other librosa beat,
in phase with the hook's first beat.

Run with the viralvision-worker venv (it has librosa):
  ../../../viralvision/viralvision-worker/.venv/bin/python tools/build_data.py
"""
import json
from pathlib import Path

import librosa
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SONG = ROOT / "assets" / "song.mp3"
WORDS = Path(SONG.resolve()).with_suffix(".words.json")
HOOK_BEAT = 22.918   # a true downbeat under the first sung "SHEEP" (22.78 in the vocal stem)

y, sr = librosa.load(str(SONG), sr=22050, mono=True)
hop = 735                                    # 30 fps at 22050
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)


def unit(a):
    return a / (np.percentile(a, 99) + 1e-9)


def band(lo, hi):
    return unit(S[(freqs >= lo) & (freqs < hi)].mean(0))


rms = unit(librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0])
onset = unit(librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop))
_, perc_s = librosa.decompose.hpss(S)
perc = unit(perc_s.mean(0))
cent = unit(librosa.feature.spectral_centroid(S=S, sr=sr)[0])

_, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
fast = librosa.frames_to_time(beat_frames, sr=sr)
k = int(np.argmin(np.abs(fast - HOOK_BEAT)))
beats = fast[k % 2::2]

r3 = lambda a: [round(float(v), 3) for v in np.clip(a, 0, 1.5)]
feat = dict(fps=sr / hop, beats=[round(float(b), 3) for b in beats], rms=r3(rms), onset=r3(onset),
            low=r3(band(20, 150)), mid=r3(band(150, 2000)), high=r3(band(2000, 11000)),
            perc=r3(perc), cent=r3(cent))

lines = [dict(text=ln["text"], s=ln["start"], e=ln["end"],
              words=[dict(t=w["word"], s=w["start"], e=w["end"]) for w in ln["words"]])
         for ln in json.loads(WORDS.read_text())["lines"]]

out = ("window.LYRICS=" + json.dumps(lines, separators=(",", ":")) + ";\n"
       "window.FEAT=" + json.dumps(feat, separators=(",", ":")) + ";\n")
(ROOT / "js" / "data.js").write_text(out)
bi = [round(b, 2) for b in beats if 14 < b < 30]
print(f"wrote js/data.js: {len(lines)} lyric lines, {len(beats)} beats; beats 14-30s: {bi}")
