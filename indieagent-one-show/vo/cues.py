#!/usr/bin/env python3
"""Snap each word's Whisper start to the nearest strong onset in the TTS audio itself
(video-production rule 2), and find where speech really starts and ends in each segment.
Writes vo/cues.json: {plate: {"speech": [first, last], "words": [[word, t], ...]}} in segment seconds."""
import json, pathlib, numpy as np, librosa
HERE = pathlib.Path(__file__).parent
words = json.loads((HERE / "words.json").read_text())
segs = json.loads((HERE / "segments.json").read_text())
out = {}
for s in segs:
    y, sr = librosa.load(str(HERE / s["file"]), sr=22050, mono=True)
    hop = 220  # 10 ms
    rms = librosa.feature.rms(y=y, frame_length=882, hop_length=hop)[0]
    db = 20 * np.log10(rms + 1e-9)
    loud = np.where(db > db.max() - 35)[0]
    first, last = loud[0] * hop / sr, (loud[-1] + 1) * hop / sr
    # onset strength = rise in log energy over 40 ms
    rise = np.concatenate([np.zeros(4), db[4:] - db[:-4]])
    times = np.arange(len(db)) * hop / sr
    thr = np.percentile(rise[rise > 0], 75)
    snapped = []
    for w, a, b in words[s["plate"]]:
        win = np.where((times >= a - 0.12) & (times <= a + 0.3))[0]
        t = a
        if len(win):
            k = win[np.argmax(rise[win])]
            if rise[k] >= thr:
                t = times[k] - 0.02  # the rise window ends 20 ms into the attack
        snapped.append([w.strip(",.\"'"), round(max(t, first), 2)])
    out[s["plate"]] = {"speech": [round(first, 2), round(last, 2)], "words": snapped}
    print(s["plate"], out[s["plate"]]["speech"], " ".join(f"{w}@{t}" for w, t in snapped))
(HERE / "cues.json").write_text(json.dumps(out) + "\n")
