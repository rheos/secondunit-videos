"""Build the call's audio and cue file from script.json.

Each line is spoken on its own (placeholder: macOS `say`), laid on the clock with the script's gaps,
one stem per speaker so each mouth follows only its own voice. Writes:

  assets/voice_artist.wav, assets/voice_agent.wav   stems, same length (gitignored)
  assets/call.wav                                    the mix the page plays (gitignored)
  cues.js                                            window.CUES: lines with word times, per-frame levels

Word times come from faster-whisper on each line's own audio; the words themselves come from the
script (Whisper is timing only). Run with the viralvision venv python (numpy + faster-whisper):

  ~/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python tools/build_audio.py
"""

import json
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 48000


def run(*args):
    subprocess.run(args, check=True, capture_output=True)


def say_line(text, voice, rate, out_wav):
    with tempfile.TemporaryDirectory() as td:
        aiff = Path(td) / "l.aiff"
        run("say", "-v", voice, "-r", str(rate), "-o", str(aiff), text)
        run("ffmpeg", "-y", "-v", "error", "-i", str(aiff), "-ac", "1", "-ar", str(SR),
            "-af", "silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
                   "silenceremove=start_periods=1:start_threshold=-50dB,areverse",
            str(out_wav))


def read_wav(p):
    with wave.open(str(p)) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def write_wav(p, x):
    x = np.clip(x, -1, 1)
    with wave.open(str(p), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def word_times(wav_path, words):
    """Map the script's words onto Whisper's word timings for this line, by order."""
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        return None
    model = word_times.model = getattr(word_times, "model", None) or WhisperModel("base.en", compute_type="int8")
    segs, _ = model.transcribe(str(wav_path), word_timestamps=True, language="en")
    heard = [w for s in segs for w in s.words]
    if not heard:
        return None
    # Spread the script's words over the heard words by position; counts often differ by one or two
    # ("seventy thirty" vs "70-30"), so map by fraction of the way through the line.
    out = []
    for i, _ in enumerate(words):
        j = min(len(heard) - 1, round(i * (len(heard) - 1) / max(1, len(words) - 1)))
        out.append(round(heard[j].start, 3))
    return out


def main():
    spec = json.loads((ROOT / "script.json").read_text())
    fps = spec["fps"]
    assets = ROOT / "assets"
    assets.mkdir(exist_ok=True)

    placed = []
    t = spec["lead_in"]
    with tempfile.TemporaryDirectory() as td:
        for i, line in enumerate(spec["lines"]):
            v = spec["voices"][line["who"]]
            p = Path(td) / f"line{i:02d}.wav"
            say_line(line["text"], v["say"], v["rate"], p)
            audio = read_wav(p)
            dur = len(audio) / SR
            words = line["text"].split()
            wt = word_times(p, words) or [round(dur * k / len(words), 3) for k in range(len(words))]
            placed.append({"who": line["who"], "text": line["text"], "start": round(t, 3),
                           "end": round(t + dur, 3), "words": words, "word_starts": [round(t + w, 3) for w in wt],
                           "_audio": audio})
            # overlap_next starts the next line before this one ends (talk-over)
            t += dur - line["overlap_next"] if line.get("overlap_next") else dur + spec["gap"]

    total = max(p["end"] for p in placed) + spec["tail"]
    n = int(round(total * SR))
    stems = {who: np.zeros(n, np.float32) for who in spec["voices"]}
    for p in placed:
        a = p.pop("_audio")
        s = int(round(p["start"] * SR))
        stems[p["who"]][s:s + len(a)] += a
    for who, x in stems.items():
        write_wav(assets / f"voice_{who}.wav", x * 0.9)
    write_wav(assets / "call.wav", sum(stems.values()) * 0.9)

    # Per-frame loudness per speaker, 0..1, from 40 ms RMS windows centred on each frame.
    nf = int(np.ceil(total * fps))
    win = int(0.04 * SR)
    levels = {}
    for who, x in stems.items():
        lv = []
        for f in range(nf):
            c = int(f / fps * SR)
            seg = x[max(0, c - win // 2): c + win // 2]
            lv.append(float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0.0)
        lv = np.array(lv)
        peak = np.percentile(lv[lv > 1e-4], 95) if np.any(lv > 1e-4) else 1
        levels[who] = [round(min(1.0, v / peak), 3) for v in lv]

    cues = {"fps": fps, "duration": round(total, 3), "voices": {k: v["name"] for k, v in spec["voices"].items()},
            "lines": placed, "levels": levels}
    (ROOT / "cues.js").write_text("window.CUES = " + json.dumps(cues, separators=(",", ":")) + ";\n")
    print(f"duration {total:.2f}s, {len(placed)} lines, {nf} frames")
    for p in placed:
        print(f"  {p['start']:6.2f}-{p['end']:6.2f} {p['who']:6s} {p['text']}")


if __name__ == "__main__":
    sys.exit(main())
