#!/usr/bin/env python3
"""Voice a film's animation cues with earshot's code-made sound bank.

    <viralvision venv python> -I tools/sfx-bank/bank.py <cues.json> <map.json>
        [--film film.mp4 | --end 172.0] [-o sfx_bank.wav] [--cache DIR] [--image earshot:0.4.0] [--jobs 3]

Same contract as the films' sfx.py: cues.json is a list of {"k": kind, "t": seconds, "size": px, ...} written
by a film's cues.mjs; every sound lands one frame after its event; cues are thinned to one per frame per kind.
The difference is the sound itself: instead of synthesising each hit in numpy, each (kind, knobs) gets one take
rendered by `earshot sfx render` in the earshot Docker image (see Dockerfile), and the take is placed so its
measured onset (earshot's onset_s), not its first sample, lands on the frame.

Takes are cached in --cache by id + knobs + seed + image, so a take is rendered once and reused by every later
run and every film. The mix is written at the film's length (ffprobe of --film, or --end, or last cue + 3 s),
48 kHz stereo, 24-bit, peak held under -0.2 dBFS. Keep the output out of git (the pre-commit hook refuses wav).
"""
import argparse, hashlib, json, pathlib, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor
import numpy as np
import soundfile as sf

KNOBS = ("dur", "apex", "pitch", "peak", "weight")


def args():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("cues", help="cues.json written by the film's cues.mjs")
    ap.add_argument("map", help="mapping file: cue kind -> bank id and knobs (see maps/)")
    ap.add_argument("--film", help="the film; its length sets the mix length")
    ap.add_argument("--end", type=float, help="mix length in seconds (default: --film's, else last cue + 3 s)")
    ap.add_argument("-o", "--out", help="output wav (default: sfx_bank.wav next to cues.json)")
    ap.add_argument("--cache", default=str(pathlib.Path.home() / ".cache" / "sfx-bank"), help="rendered takes")
    ap.add_argument("--image", default="earshot:0.4.0")
    ap.add_argument("--jobs", type=int, default=3, help="Docker renders at once (keep it at 3 or less)")
    ap.add_argument("--sr", type=int, default=48000)
    ap.add_argument("--seed", type=int, default=7, help="seed for pan and take choice")
    ap.add_argument("--log", help="also write every placed sound (kind, cue time, onset time, take) to this json")
    return ap.parse_args()


def film_length(a, cues):
    if a.end: return a.end
    if a.film:
        r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.film],
                           capture_output=True, text=True, check=True)
        return float(r.stdout.strip())
    return max(c["t"] for c in cues) + 3


def bands_of(rule):
    """A kind's rule -> its bands, each a dict of id + knobs (+ size_max). A rule with no bands is one band."""
    base = {k: v for k, v in rule.items() if k in KNOBS or k == "id"}
    return [{**base, **b} for b in rule.get("bands", [base])]


def take_spec(band, seed, image, sr):
    spec = {"id": band["id"], "seed": seed, "image": image, "sr": sr}
    spec.update({k: band[k] for k in KNOBS if band.get(k) is not None})
    key = hashlib.sha1(json.dumps(spec, sort_keys=True).encode()).hexdigest()[:12]
    return spec, f'{band["id"].replace("/", "_")}__{key}'


def render(spec, name, cache):
    """One take through Docker, unless the cache already holds it. Returns (name, rendered_now, seconds)."""
    wav, meta = cache / f"{name}.wav", cache / f"{name}.json"
    if wav.exists() and meta.exists(): return name, False, 0.0
    cmd = ["docker", "run", "--rm", "-e", "EARSHOT_OFFLINE=1", "-v", f"{cache}:/work", spec["image"],
           "sfx", "render", spec["id"], "-o", f"{name}.wav", "--out", f"{name}.json", "--sr", str(spec["sr"])]
    if spec["seed"] is not None: cmd += ["--seed", str(spec["seed"])]
    for k in KNOBS:
        if k in spec: cmd += [f"--{k}", str(spec[k])]
    t0 = time.time()
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode or not meta.exists():
        wav.unlink(missing_ok=True); meta.unlink(missing_ok=True)
        sys.exit(f"earshot failed on {spec['id']} {spec}:\n{r.stdout}{r.stderr}")
    return name, True, time.time() - t0


def load_take(cache, name, sr):
    x, xsr = sf.read(cache / f"{name}.wav", always_2d=True)
    assert xsr == sr, f"{name}: {xsr} Hz, wanted {sr}"
    meta = json.loads((cache / f"{name}.json").read_text())
    m = meta.get("meta", meta)
    return x.mean(1), float(m["onset_s"])


def main():
    a = args()
    cues = json.loads(pathlib.Path(a.cues).read_text())
    mp = json.loads(pathlib.Path(a.map).read_text())
    fr = 1 / mp.get("fps", 24)
    sr = a.sr
    cache = pathlib.Path(a.cache).expanduser().resolve(); cache.mkdir(parents=True, exist_ok=True)
    out_path = pathlib.Path(a.out) if a.out else pathlib.Path(a.cues).resolve().parent / "sfx_bank.wav"
    end = film_length(a, cues)
    rng = np.random.default_rng(a.seed)

    # every take the map can ask for: (kind, band index, seed) -> cache name
    rules = mp["kinds"]
    takes, specs = {}, {}
    for kind, rule in rules.items():
        for bi, band in enumerate(bands_of(rule)):
            for seed in rule.get("seeds", [band.get("seed")]):
                spec, name = take_spec(band, seed, a.image, sr)
                takes[(kind, bi, seed)] = name; specs[name] = spec

    t0 = time.time()
    with ThreadPoolExecutor(max_workers=max(1, min(a.jobs, 3))) as ex:
        done = list(ex.map(lambda n: render(specs[n], n, cache), specs))
    fresh = [d for d in done if d[1]]
    print(f"takes: {len(specs)} in the map, {len(fresh)} rendered now in {time.time() - t0:.1f} s wall"
          + (f" ({sum(d[2] for d in fresh) / len(fresh):.1f} s each)" if fresh else "") + f", cache {cache}")
    audio = {n: load_take(cache, n, sr) for n in specs}

    n_out = int(round(end * sr))
    out = np.zeros((n_out, 2))
    last, prev_seed, placed, skipped = {}, {}, {}, {}
    log = []
    for c in sorted(cues, key=lambda c: c["t"]):
        k, t = c["k"], float(c["t"])
        if k not in rules: skipped[k] = skipped.get(k, 0) + 1; continue
        if k in last and t - last[k] < fr - 1e-6: continue          # one per frame per kind, as sfx.py
        last[k] = t
        rule, bands = rules[k], bands_of(rules[k])
        size = c.get("size") or 0
        bi = next(i for i, b in enumerate(bands) if b.get("size_max") is None or size <= b["size_max"])
        seeds = rule.get("seeds", [bands[bi].get("seed")])
        pick = [s for s in seeds if s != prev_seed.get(k)] or seeds
        seed = pick[int(rng.integers(len(pick)))]; prev_seed[k] = seed
        x, onset = audio[takes[(k, bi, seed)]]
        start = int(round((t + fr) * sr)) - int(round(onset * sr))   # the onset lands one frame after the event
        lo = max(0, -start); x = x[lo:]; start = max(0, start)
        x = x[: max(0, n_out - start)]
        if not len(x): continue
        spread = rule.get("pan", 0.0)
        pan = float(rng.uniform(-spread, spread)) if spread else 0.0
        out[start:start + len(x), 0] += x * (1 - max(0, pan))
        out[start:start + len(x), 1] += x * (1 + min(0, pan))
        placed[k] = placed.get(k, 0) + 1
        log.append({"k": k, "t": t, "onset_at": round(t + fr, 4), "take": takes[(k, bi, seed)]})

    peak = np.abs(out).max()
    if peak > 0.977: out *= 0.977 / peak                              # hold the sum under -0.2 dBFS
    out_path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(out_path, out, sr, subtype="PCM_24")
    if a.log: pathlib.Path(a.log).write_text(json.dumps(log))
    total = {k: sum(1 for c in cues if c["k"] == k) for k in sorted({c["k"] for c in cues})}
    print(f"wrote {out_path}: {end:.3f} s, placed {placed} of {total}, peak {20 * np.log10(max(peak, 1e-9)):.1f} dBFS"
          + (f", no mapping for {skipped}" if skipped else ""))


if __name__ == "__main__":
    main()
