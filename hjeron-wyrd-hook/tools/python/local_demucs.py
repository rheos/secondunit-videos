"""Local Demucs stem separation; prints {"stem": "/abs/path.wav", ...} as the last stdout line.

usage: local_demucs.py AUDIO OUT_DIR [--model htdemucs] [--stems vocals,drums,...]
Only "vocals" requested -> two-stem mode (vocals + no_vocals), which is faster.
"""
import argparse
import json
import os
import subprocess
import sys


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("out_dir")
    ap.add_argument("--model", default="htdemucs")
    ap.add_argument("--stems", default="vocals")
    a = ap.parse_args()

    stems = [s for s in a.stems.split(",") if s]
    cmd = [sys.executable, "-m", "demucs", "-n", a.model, "-o", a.out_dir]
    if stems == ["vocals"]:
        cmd += ["--two-stems", "vocals"]
    cmd.append(a.audio)
    subprocess.run(cmd, check=True, stdout=sys.stderr)

    track = os.path.splitext(os.path.basename(a.audio))[0]
    folder = os.path.abspath(os.path.join(a.out_dir, a.model, track))
    found = {}
    for stem in stems:
        path = os.path.join(folder, stem + ".wav")
        if not os.path.isfile(path):
            sys.exit("demucs produced no %s stem in %s" % (stem, folder))
        found[stem] = path
    print(json.dumps(found))


if __name__ == "__main__":
    main()
