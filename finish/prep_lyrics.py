"""Build lyric cues for the p5 layer: text from Hjeron's lyric sheet, word times from the stable-ts
alignment, line starts snapped to Demucs vocal-stem onsets where the onset is strong.
Writes work/lyric_cues.json and work/lyrics.js (both gitignored: they quote the lyrics)."""
import json, re, subprocess, difflib, sys
from pathlib import Path
import numpy as np

SONG = Path(__file__).resolve().parents[2] / "_hjeron-dream-of-fire"
HERE = Path(__file__).resolve().parents[1]
STRONG = 12.0      # onset strength (dB rise over 40 ms) we trust over the alignment
HOOK = re.compile(r"^i dream of", re.I)

def onsets_db():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(SONG / "stems/htdemucs/dream-of-fire/vocals.wav"),
                          "-ac", "1", "-ar", "24000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.float32); hop = 240
    e = np.sqrt(np.convolve(a ** 2, np.ones(hop * 3) / (hop * 3), "same")[::hop]); db = 20 * np.log10(e + 1e-9)
    return np.concatenate([np.zeros(4), np.maximum(0, db[4:] - db[:-4])])

norm = lambda s: re.sub(r"[^a-z' ]", "", s.lower()).split()

def main():
    lines = json.loads((SONG / "dream-of-fire.aligned.json").read_text())["lines"]
    sheet = [l.strip() for l in (SONG / "dream-of-fire.lyrics.txt").read_text().splitlines() if l.strip()]
    flux = onsets_db(); cues = []
    for i, l in enumerate(lines):
        # sheet line with the closest words gives the casing and punctuation
        best = max(sheet, key=lambda s: difflib.SequenceMatcher(None, norm(s), norm(l["text"])).ratio())
        ratio = difflib.SequenceMatcher(None, norm(best), norm(l["text"])).ratio()
        words = [dict(w) for w in l["words"]]
        guess = l["start"] if i else words[1]["start"] - 0.8   # line 1's first word is stretched by 2 s
        lo, hi = int((guess - 0.7) * 100), int((guess + 0.5) * 100)
        j = lo + int(np.argmax(flux[lo:hi])); onset = (j - 2) / 100
        start = onset if flux[j] >= STRONG or i == 0 else l["start"]
        words[0]["start"] = start
        for a, b in zip(words, words[1:]):
            b["start"] = max(b["start"], a["start"] + 0.04)
        shown = best.split()
        if len(shown) != len(words):
            print(f"line {i}: sheet has {len(shown)} words, alignment {len(words)}; using alignment text", file=sys.stderr)
            shown = [w["word"] for w in words]
        cues.append({"i": i, "s": round(start, 3), "e": round(l["end"], 3), "hook": bool(HOOK.match(l["text"])),
                     "match": round(ratio, 2), "moved": round(start - l["start"], 2),
                     "words": [{"w": t, "s": round(w["start"], 3), "e": round(w["end"], 3)} for t, w in zip(shown, words)]})
    for a, b in zip(cues, cues[1:]):
        a["out"] = round(min(a["e"] + 0.45, b["s"] - 0.05), 3)
    cues[-1]["out"] = round(cues[-1]["e"] + 0.6, 3)
    (HERE / "work/lyric_cues.json").write_text(json.dumps(cues, indent=1))
    js = (HERE / "finish/lyrics.template.js").read_text().replace("/*CUES*/[]", json.dumps(cues))
    (HERE / "work/lyrics.js").write_text(js)
    for c in cues:
        print(f'{c["i"]:02d} {c["s"]:6.2f}-{c["out"]:6.2f} moved {c["moved"]:+.2f} match {c["match"]:.2f} words {len(c["words"])}{" HOOK" if c["hook"] else ""}')

if __name__ == "__main__":
    main()
