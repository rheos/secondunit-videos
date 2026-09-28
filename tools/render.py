"""Render the free real-footage rough cut of Hjeron's "dream of fire" (hjeron_dark_blues).

Zero paid generation: only Hjeron's own clips, graded locally, cut to the song.

  python tools/render.py --preview            # 540x960 preview of the whole song
  python tools/render.py --preview --range 1400 1700
  python tools/render.py                      # full 1080x1920 master cut
  python tools/render.py --edl                # rewrite docs/EDL.md from SHOTS
  python tools/render.py --sheet              # contact sheet (one frame per shot)

The song is the clock: 24 fps song frames, half-open [start, end). A shot starts at
round(t * 24) of its song time and runs to the next shot's start. Source clips are 30 fps;
a song frame k inside a shot maps to source time in + (k / 24) * speed.
Source clips are read only.
"""
import argparse
import json
import os
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from grade import grade  # noqa: E402

FOOT = "/Users/robin/Code/novadiem/indieagent/viralvision/viralvision-worker/artists/mythmaker/footage/"
SONG = "/Users/robin/Code/novadiem/indieagent/secondunit/mv-projects/_hjeron-dream-of-fire/dream-of-fire.wav"
FPS = 24
TOTAL = 2342  # song frames, 97.583 s grid covering the 97.567 s master
W, H = 1080, 1920
OUT = os.path.join(PROJ, "output", "dream-of-fire_realcut_f0000-f2342_24fps_9x16.mp4")

CLIPS = [c["path"] for c in json.load(open(FOOT + "manifest.json"))["clips"]]

# Shot list. t = song seconds where the shot starts (beat grid or vocal-stem onset).
# clip = manifest index. inp = source in (s). sp = speed. z/z1 = zoom start/end (>=1.08 hides
# the torn-photo borders). cx, cy = crop centre (0-1). g = grade preset. fi/fo = fade frames.
S = lambda t, clip, inp, sp, g, why, z=1.08, z1=None, cx=0.5, cy=0.5, fi=0, fo=0, lyric="": dict(  # noqa: E731
    t=t, clip=clip, inp=inp, sp=sp, g=g, why=why, z=z, z1=z1 if z1 else z, cx=cx, cy=cy, fi=fi, fo=fo, lyric=lyric)

SHOTS = [
    # ---- intro, instrumental (bars on 0.28, 3.51, 6.73, 10.01, 13.28, 16.46, 19.64, 22.85)
    S(0.000, 44, 0.3, 0.6, "smoke", "smoke drifting on black, opens the night", z=1.0, z1=1.1, fi=24),
    S(3.506, 0, 1.2, 0.55, "night", "ram skull on rocks under storm sky, slow push", z=1.12, z1=1.24, cy=0.45),
    S(6.734, 37, 0.5, 0.8, "night", "the wanderer, tiny on a dune, night sky"),
    S(10.008, 39, 0.3, 0.8, "night", "his shadow on the rock: hat, coat, fringe"),
    S(13.282, 3, 0.4, 0.9, "dark", "torn-dark reveal: him and the dog walking into smoke (band enters)"),
    S(16.463, 47, 0.5, 1.0, "night", "Les Paul on the red rock, tight on the figure", z=1.7, z1=1.9, cy=0.22),
    S(18.042, 48, 1.0, 1.0, "night", "same rock, wide"),
    S(19.644, 12, 1.3, 0.8, "night", "animal skull on a rock cairn", z=1.2, cy=0.4),
    S(21.246, 13, 0.0, 0.8, "night", "fretboard over dry ground, his shadow"),
    S(22.848, 10, 0.95, 0.4, "ember", "hat silhouette against a burning sky (vocal pickup 23.0)", z=1.1),
    # ---- verse (line starts from vocal-stem onsets)
    S(25.844, 46, 0.0, 0.8, "smoke", "smoke curling on black", lyric="L1", z=1.0),
    S(27.632, 36, 0.0, 0.9, "night", "him walking close over the dune"),
    S(29.280, 45, 0.5, 0.8, "smoke", "storm clouds", lyric="L2", z=1.0, z1=1.1),
    S(32.740, 28, 0.5, 1.0, "night", "him with the Les Paul and the dog on the bridge", lyric="L3", z=1.5, z1=1.6, cx=0.45, cy=0.36),
    S(36.293, 43, 2.0, 0.9, "smoke", "dark sky", lyric="L4", z=1.0),
    S(37.965, 6, 0.8, 0.8, "night", "ghosted double-exposure guitar"),
    S(39.126, 0, 3.0, 0.7, "night", "HERO ram skull, tight, the bones line", lyric="L5", z=1.6, z1=1.75, cx=0.62, cy=0.36),
    S(40.960, 35, 0.2, 0.8, "night", "sand ripples", lyric="L6"),
    S(42.307, 2, 1.3, 0.95, "dark", "torn-dark reveal", lyric="L7", z=1.0),
    S(43.907, 3, 0.8, 0.8, "dark", "him and the dog in the smoke, tighter", z=1.4, cy=0.45),
    S(45.534, 15, 1.1, 0.8, "night", "real rattlesnake in the grass", lyric="L8", z=1.3),
    S(47.415, 17, 0.3, 1.0, "fire", "fire over the rocks", lyric="L8"),
    S(49.017, 18, 1.0, 1.0, "fire", "him with the guitar inside the flames", lyric="L9"),
    S(50.805, 21, 1.0, 1.0, "fire", "flaming rocks, on the beat", lyric="L9"),
    S(51.850, 31, 0.5, 1.0, "night", "scorpion by an obsidian point", lyric="L10", z=1.2),
    S(53.243, 15, 1.5, 0.6, "night", "rattlesnake, tight on the coils", z=1.8, cx=0.42, cy=0.52),
    S(54.822, 32, 1.0, 1.0, "night", "scorpion again, closer", lyric="L11", z=1.3),
    S(56.448, 29, 1.0, 1.0, "night", "him and the dog on the bridge, the pair", z=1.35, cx=0.5, cy=0.35),
    S(58.305, 15, 1.1, 0.5, "night", "HERO rattlesnake held slow, the serpent line (no sunrise in the tape)", lyric="L12", z=1.2, z1=1.45),
    S(60.418, 16, 0.0, 0.5, "dusk", "wolfdog with the sun on the horizon", lyric="L12"),
    S(61.904, 11, 0.95, 0.4, "dusk", "wolfdog looks up, slowed", lyric="L13"),
    S(64.342, 9, 0.3, 1.0, "flash", "overexposed guitar flash into the chorus", z=1.0),
    # ---- chorus
    S(65.039, 25, 0.5, 1.0, "fire", "HERO hat silhouette in the flames, first chorus line", lyric="L14"),
    S(66.595, 47, 1.5, 1.0, "dusk", "him on the red rock", lyric="L14", z=1.35, cy=0.25),
    S(67.895, 23, 1.0, 1.0, "fire", "silhouette in fire", lyric="L15"),
    S(69.915, 10, 0.1, 0.25, "ember", "burning-sky silhouette, its one bright frame then dark", z=1.1),
    S(70.891, 15, 1.1, 1.0, "night", "rattlesnake moving, wider", lyric="L16", z=1.1),
    S(72.307, 44, 1.5, 0.8, "smoke", "smoke dissolving", lyric="L17", z=1.0, z1=1.15),
    S(74.095, 19, 0.8, 1.0, "fire", "him in the flames", lyric="L18"),
    S(76.022, 26, 1.0, 1.0, "fire", "guitarist silhouette, fire", lyric="L19"),
    S(79.134, 27, 1.5, 1.0, "night", "him walking out onto the bridge", lyric="L20", z=1.3, cy=0.4),
    S(82.315, 24, 0.5, 1.0, "fire", "silhouette engulfed in fire", lyric="L21"),
    S(84.242, 20, 2.0, 1.0, "fire", "guitarist blazing"),
    S(85.496, 30, 0.0, 0.8, "night", "him on the bridge, tight", lyric="L22", z=1.6, cx=0.47, cy=0.33),
    S(87.191, 22, 1.0, 1.0, "fire", "silhouette in flames", lyric="L23"),
    S(90.186, 10, 1.1, 0.6, "ember", "dark silhouette", lyric="L24", z=1.1),
    S(91.417, 43, 2.0, 0.8, "smoke", "night clouds", z=1.0),
    S(93.367, 17, 0.0, 0.75, "fire", "HERO fire rising over the rocks, last line, fade out", lyric="L25", fo=30),
]


def frames_of(shots):
    out = []
    for i, s in enumerate(shots):
        a = round(s["t"] * FPS)
        b = round(shots[i + 1]["t"] * FPS) if i + 1 < len(shots) else TOTAL
        out.append((a, b))
    return out


def crop(img, z, cx, cy, ow, oh):
    h, w = img.shape[:2]
    cw, ch = w / z, h / z
    x0 = min(max(cx * w - cw / 2, 0), w - cw)
    y0 = min(max(cy * h - ch / 2, 0), h - ch)
    m = np.float32([[ow / cw, 0, -x0 * ow / cw], [0, oh / ch, -y0 * oh / ch]])
    return cv2.warpAffine(img, m, (ow, oh), flags=cv2.INTER_AREA if z < 1.3 else cv2.INTER_CUBIC)


def shot_frames(s, a, b, ow, oh, lo=None, hi=None, rng=None):
    """Yield (song_frame, image) for the shot's frames within [lo, hi)."""
    lo = a if lo is None else max(a, lo)
    hi = b if hi is None else min(b, hi)
    if lo >= hi:
        return
    cap = cv2.VideoCapture(FOOT + CLIPS[s["clip"]])
    sfps = cap.get(cv2.CAP_PROP_FPS)
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    want = [min(n - 1, round((s["inp"] + (k - a) / FPS * s["sp"]) * sfps)) for k in range(lo, hi)]
    cap.set(cv2.CAP_PROP_POS_FRAMES, want[0])
    pos, last = want[0], None
    ok, last = cap.read()
    for k, wf in zip(range(lo, hi), want):
        while pos < wf:
            ok, img = cap.read()
            if not ok:
                break
            last, pos = img, pos + 1
        u = (k - a) / max(1, b - a - 1)
        z = s["z"] + (s["z1"] - s["z"]) * u
        img = crop(last, z, s["cx"], s["cy"], ow, oh)
        img = grade(img, s["g"], rng=rng)
        f = 1.0
        if s["fi"] and k - a < s["fi"]:
            f = (k - a + 1) / s["fi"]
        if s["fo"] and b - k <= s["fo"]:
            f = min(f, (b - k - 1) / s["fo"])
        if f < 1.0:
            img = (img.astype(np.float32) * max(f, 0)).astype(np.uint8)
        yield k, img
    cap.release()


def render(preview, lo, hi):
    ow, oh = (540, 960) if preview else (W, H)
    fr = frames_of(SHOTS)
    lo, hi = lo or 0, hi or TOTAL
    if preview:
        out = os.path.join(PROJ, "work", f"preview_f{lo:04d}-f{hi:04d}.mp4")
    else:
        out = OUT
        assert (lo, hi) == (0, TOTAL), "master renders the whole song"
    t0, dur = lo / FPS, (hi - lo) / FPS
    cmd = ["nice", "ffmpeg", "-loglevel", "error", "-y",
           "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{ow}x{oh}", "-r", str(FPS), "-i", "-",
           "-ss", f"{t0:.4f}", "-t", f"{dur:.4f}", "-i", SONG,
           "-map", "0:v", "-map", "1:a",
           "-c:v", "libx264", "-preset", "veryfast" if preview else "medium", "-crf", "24" if preview else "17",
           "-pix_fmt", "yuv420p", "-r", str(FPS), "-threads", "4",
           "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    rng = np.random.default_rng(7)
    count = 0
    for s, (a, b) in zip(SHOTS, fr):
        for k, img in shot_frames(s, a, b, ow, oh, lo, hi, rng):
            p.stdin.write(img.tobytes())
            count += 1
    p.stdin.close()
    p.wait()
    print(f"wrote {count} frames -> {out}")


def sheet():
    fr = frames_of(SHOTS)
    tw, th, cols = 216, 384, 10
    rows = (len(SHOTS) + cols - 1) // cols
    im = Image.new("RGB", (tw * cols, (th + 34) * rows), (10, 12, 18))
    d = ImageDraw.Draw(im)
    for i, (s, (a, b)) in enumerate(zip(SHOTS, fr)):
        k = (a + b) // 2
        for _, img in shot_frames(s, a, b, tw, th, k, k + 1):
            x, y = (i % cols) * tw, (i // cols) * (th + 34)
            im.paste(Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)), (x, y))
            d.text((x + 4, y + th + 3), f"{i + 1:02d} f{a:04d}-{b:04d} #{s['clip']}", fill=(220, 220, 220))
            d.text((x + 4, y + th + 17), s["g"], fill=(140, 170, 230))
    p = os.path.join(PROJ, "output", "dream-of-fire_realcut_f0000-f2342_24fps_contact.jpg")
    im.save(p, quality=86)
    print("sheet ->", p)


def edl():
    fr = frames_of(SHOTS)
    L = ["# EDL: dream of fire, real-footage rough cut (hjeron_dark_blues)", "",
         "Generated by `tools/render.py --edl` from the SHOTS table. Do not hand-edit; edit SHOTS.", "",
         "Song frames are 24 fps, half-open [in, out). Source clips are 30 fps ViralVision scene splits in",
         "`viralvision-worker/artists/mythmaker/footage/clips/` (read only). Source in/out are seconds",
         "into that clip. Zoom is the crop factor (1.08 and up hides the torn-photo borders); a range",
         "means a slow push. Lyric cues are line numbers (L1-L25) into the local-only lyrics file", "`_hjeron-dream-of-fire/dream-of-fire.lyrics.txt`; no lyric text lives in this repo.", "",
         "| # | song frames | len | source clip | src in-out (s) | speed | crop (zoom @ cx,cy) | grade | why |",
         "|---|---|---|---|---|---|---|---|---|"]
    for i, (s, (a, b)) in enumerate(zip(SHOTS, fr)):
        n = b - a
        so = s["inp"] + n / FPS * s["sp"]
        name = os.path.basename(CLIPS[s["clip"]])
        zz = f"{s['z']:.2f}" if s["z"] == s["z1"] else f"{s['z']:.2f}-{s['z1']:.2f}"
        cue = f" (cut on lyric line {s['lyric']})" if s["lyric"] else " (beat cut)"
        L.append(f"| {i + 1} | f{a:04d}-f{b:04d} | {n} | #{s['clip']} `{name}` | {s['inp']:.2f}-{so:.2f} | {s['sp']:.2f}x | {zz} @ {s['cx']:.2f},{s['cy']:.2f} | {s['g']} | {s['why']}{cue} |")
    used = sorted(set(s["clip"] for s in SHOTS))
    L += ["", f"Total: {len(SHOTS)} shots, {fr[-1][1]} frames. Fades: in over f0000-f0024, out over the last 30 frames.",
          f"Clips used: {len(used)} of 51 ({', '.join('#' + str(c) for c in used)}).", ""]
    L += AUDIT
    open(os.path.join(PROJ, "docs", "EDL.md"), "w").write("\n".join(L) + "\n")
    print("EDL ->", os.path.join(PROJ, "docs", "EDL.md"))


AUDIT = """## Footage audit (every clip viewed, 8 frames each, 2026-09-28)

**The manifest descriptors are wrong for most of source video 4a9621 and 004923.** They are
ViralVision's auto-captions and several are hallucinated. None of the stock subjects the captions
name appear in the frames:

| # | caption says | frames actually show |
|---|---|---|
| 0 | astronaut lunar crater | ram skull on a rock pile under storm sky (sepia); first 0.8 s is glitched ground |
| 1 | rocky landscape, helicopters | same ram skull, fading to black; the "helicopters" are cloud wisps |
| 8 | underwater wreck | his Les Paul and pendant double-exposed over a lantern-lit forest path |
| 11, 16 | bear silhouette / bear walking | the wolfdog, walking toward camera, sun on the horizon |
| 12 | shark silhouette | animal skull on a rock cairn (strobing edit), then fretboard |
| 14 | woman seated on rocks | skull cairn, him on the red rock, his shadow, dry grass (a fast montage) |
| 15 | golden dappled shadows | his shadow, then a real rattlesnake in dry grass |
| 28 | cowboy with rifle on bridge | Hjeron with the Les Paul and the wolfdog on the stone bridge (same scene as 27, 29, 30) |
| 36 | outlaw silhouette | Hjeron walking the dune, the wolfdog behind him |

**Excluded (3 clips):**

- **#5, #7**: the lantern-lit forest path with iron gates is a stock or AI background that is not
  his desert. He is only a faint ghost overlay in #5 and absent from most of #7.
- **#8**: same forest backdrop dominates; his guitar is a double exposure over it with blown flares.
  The guitar-and-pendant moment (about 1.1 to 1.3 s) is his, but the backdrop is not.

Kept, with a note: the neon-pink fire clips (#17 to #26) are his own edits with stock flame
overlays composited on him. Fire is in scope, so they stay, magenta pulled to blue.
#31 to #33 (scorpion with an obsidian point), #43 to #46 (clouds and smoke shot on black) are
fauna and sky elements.

**Unused but clean (11):** #1, #4, #14, #33, #34, #38, #40, #41, #42, #49, #50. #4 is a
murky grey double exposure; the rest are near-duplicates of shots already in the cut
(rock, shadow, dune, scorpion) and are the first place to look for replacement angles.

## Grade

One pass per frame (`tools/grade.py`): luminance to a blue-black to moonlit-blue ramp, crushed black
point, vignette, light grain. Warm hues survive only as fire: in `fire` shots orange and yellow flame
pixels keep their colour and magenta is pushed dark blue; in `dusk` only the hottest sun pixels stay
warm; `ember` keeps his burning red sky and leaves his silhouette blue-black. A 1.08 minimum crop
hides the torn-photo borders on the sepia clips.

Where the grade is honest about losing: the sepia clips are day-for-night, so skies read as pale
overcast, not a true night (no moon, no stars except the ones already printed in #35 to #38).
The flame overlays in the fire clips leave pale-blue holes where the pink sky showed through, and
his silhouette under the flames is often hard to find. #47 in `dusk` keeps orange patches on the
red rock that read more like a posterised grade than light. #10 and #12 strobe (his original edit),
and 30 to 24 fps resampling makes the strobe uneven.
""".split("\n")



if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--range", nargs=2, type=int)
    ap.add_argument("--sheet", action="store_true")
    ap.add_argument("--edl", action="store_true")
    a = ap.parse_args()
    if a.sheet:
        sheet()
    elif a.edl:
        edl()
    else:
        lo, hi = (a.range or (None, None))
        render(a.preview, lo, hi)
