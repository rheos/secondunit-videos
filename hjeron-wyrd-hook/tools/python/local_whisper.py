"""Local Whisper transcript in fal-ai/whisper's output shape (last stdout line is JSON).

usage: local_whisper.py AUDIO [--model small] [--language en] [--words]
  --words  one chunk per word (Fal chunk_level "word"); otherwise one chunk per segment.
Sung words are often missed or merged; correct timings by listening, as with Fal's Whisper.
"""
import argparse
import json

from faster_whisper import WhisperModel


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--model", default="small")
    ap.add_argument("--language", default="en")
    ap.add_argument("--words", action="store_true")
    a = ap.parse_args()

    model = WhisperModel(a.model, device="cpu", compute_type="int8")
    segments, _info = model.transcribe(a.audio, language=a.language, word_timestamps=a.words, vad_filter=False)
    chunks, text = [], []
    for seg in segments:
        text.append(seg.text.strip())
        if a.words:
            for w in seg.words or []:
                chunks.append({"text": w.word.strip(), "timestamp": [round(w.start, 3), round(w.end, 3)]})
        else:
            chunks.append({"text": seg.text.strip(), "timestamp": [round(seg.start, 3), round(seg.end, 3)]})
    print(json.dumps({"text": " ".join(text), "chunks": chunks, "model": "faster-whisper-" + a.model}))


if __name__ == "__main__":
    main()
