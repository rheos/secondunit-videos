"""Render the free real-footage rough cut of Hjeron's "dream of fire" (hjeron_dark_blues).

Zero paid generation: only Hjeron's own clips, cut to the song. No grade, no LUT, no
border masking: every clip keeps its own baked-in look (sepia, grain, torn-photo borders,
neon fire). Only trim, speed and order change. Generated coverage must match these looks,
not the other way round.

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

FOOT = "/Users/robin/Code/novadiem/indieagent/viralvision/viralvision-worker/artists/mythmaker/footage/"
SONG = "/Users/robin/Code/novadiem/indieagent/secondunit/mv-projects/_hjeron-dream-of-fire/dream-of-fire.wav"
FPS = 24
TOTAL = 2342  # song frames, 97.583 s grid covering the 97.567 s master
W, H = 1080, 1920
OUT = os.path.join(PROJ, "output", "dream-of-fire_realcut_f0000-f2342_24fps_9x16.mp4")

CLIPS = [c["path"] for c in json.load(open(FOOT + "manifest.json"))["clips"]]

# Shot list. t = song seconds where the shot starts (beat grid or vocal-stem onset).
# clip = manifest index. inp = source in (s). sp = speed. z/z1 = reframe zoom (1.0 = full frame; the
# clips are already 1080x1920 so every shot runs full frame). cx, cy = crop centre.
# g = the clip's own look, a label only (nothing is applied). fi/fo = fade frames.
S = lambda t, clip, inp, sp, g, why, z=1.0, z1=None, cx=0.5, cy=0.5, fi=0, fo=0, lyric="": dict(  # noqa: E731
    t=t, clip=clip, inp=inp, sp=sp, g=g, why=why, z=z, z1=z1 if z1 else z, cx=cx, cy=cy, fi=fi, fo=fo, lyric=lyric)

SHOTS = [
    # Looks are the clip's own baked-in look, untouched: sepia (torn-photo desert), neon (his pink-sky
    # fire composites), black (smoke/clouds or torn-mask reveals on black), red (burning-sky
    # silhouette, strobing), flash (overexposed). Neon and sepia are kept in separate phrase blocks,
    # with black or red clips as the hinge between them.
    # ---- intro, instrumental (bars on 0.28, 3.51, 6.73, 10.01, 13.28, 16.46, 19.64, 22.85)
    S(0.000, 44, 0.3, 0.6, "black", "smoke drifting on black, fades up from nothing", fi=24),
    S(3.506, 0, 1.2, 0.55, "sepia", "ram skull on rocks under storm sky, slowed"),
    S(6.734, 37, 0.5, 0.8, "sepia", "the wanderer, tiny on a dune under the printed star field"),
    S(10.008, 39, 0.3, 0.8, "sepia", "his shadow on the rock: hat, coat, fringe"),
    S(13.282, 3, 0.4, 0.9, "black", "torn-mask reveal: him and the dog walking into smoke (band enters)"),
    S(16.463, 14, 0.25, 1.0, "sepia", "his own quick montage: skull cairn, him on the red rock, his shadow"),
    S(18.042, 47, 0.5, 1.0, "sepia", "him with the Les Paul on the red rock, wide"),
    S(19.644, 12, 1.3, 0.8, "sepia", "animal skull on a rock cairn (his strobe edit)"),
    S(21.246, 13, 0.0, 0.8, "sepia", "fretboard over dry ground, his shadow"),
    S(22.848, 10, 0.95, 0.4, "red", "hat silhouette against a burning sky (vocal pickup 23.0)"),
    # ---- verse (line starts from vocal-stem onsets)
    S(25.844, 46, 0.0, 0.8, "black", "smoke curling on black", lyric="L1"),
    S(27.632, 36, 0.0, 0.9, "sepia", "him walking close over the dune"),
    S(29.280, 45, 0.5, 0.8, "black", "storm clouds on black", lyric="L2"),
    S(32.740, 28, 0.5, 1.0, "sepia", "him with the Les Paul and the dog on the stone bridge", lyric="L3"),
    S(36.293, 1, 0.0, 0.8, "sepia", "storm sky over the ram skull, before it fades", lyric="L4"),
    S(37.965, 6, 0.8, 0.8, "sepia", "ghosted grey double-exposure guitar"),
    S(39.126, 0, 3.0, 0.7, "sepia", "HERO ram skull held slow, the bones line", lyric="L5"),
    S(40.960, 35, 0.2, 0.8, "sepia", "sand ripples", lyric="L6"),
    S(42.307, 2, 1.3, 0.95, "black", "torn-mask reveal opening", lyric="L7"),
    S(43.907, 3, 0.8, 0.8, "black", "him and the dog in the smoke"),
    S(45.534, 15, 1.1, 0.8, "sepia", "real rattlesnake in the grass", lyric="L8"),
    S(47.415, 17, 0.3, 1.0, "neon", "fire over the rocks: first neon block", lyric="L8"),
    S(49.017, 18, 1.0, 1.0, "neon", "him with the guitar inside the flames", lyric="L9"),
    S(50.805, 21, 1.0, 1.0, "neon", "flaming rocks, on the beat", lyric="L9"),
    S(51.850, 31, 0.5, 1.0, "sepia", "scorpion by an obsidian point", lyric="L10"),
    S(53.243, 15, 1.9, 0.45, "sepia", "rattlesnake coils, slower"),
    S(54.822, 32, 1.0, 1.0, "sepia", "scorpion again", lyric="L11"),
    S(56.448, 29, 1.0, 1.0, "sepia", "him and the dog on the bridge, the pair"),
    S(58.305, 15, 1.1, 0.5, "sepia", "HERO rattlesnake held slow, the serpent line (no sunrise in the tape)", lyric="L12"),
    S(60.418, 16, 0.0, 0.5, "sepia", "wolfdog with the sun on the horizon", lyric="L12"),
    S(61.904, 11, 0.95, 0.4, "sepia", "wolfdog looks up, slowed", lyric="L13"),
    S(64.342, 9, 0.3, 1.0, "flash", "overexposed guitar flash, the hinge into the neon chorus"),
    # ---- chorus: neon block, black/red hinges, sepia only on the two wake-up lines
    S(65.039, 25, 0.5, 1.0, "neon", "HERO hat silhouette in the flames, first chorus line", lyric="L14"),
    S(66.595, 20, 0.5, 1.0, "neon", "guitarist blazing", lyric="L14"),
    S(67.895, 23, 1.0, 1.0, "neon", "silhouette in fire", lyric="L15"),
    S(69.915, 10, 0.1, 0.25, "red", "burning-sky silhouette: one bright frame then dark, hinge out of neon"),
    S(70.891, 15, 1.1, 1.0, "sepia", "rattlesnake moving, full speed", lyric="L16"),
    S(72.307, 44, 1.5, 0.8, "black", "smoke dissolving, hinge back to neon", lyric="L17"),
    S(74.095, 19, 0.8, 1.0, "neon", "him in the flames", lyric="L18"),
    S(76.022, 26, 1.0, 1.0, "neon", "guitarist silhouette, fire", lyric="L19"),
    S(79.134, 27, 1.5, 1.0, "sepia", "him walking out onto the bridge", lyric="L20"),
    S(82.315, 24, 0.5, 1.0, "neon", "silhouette engulfed in fire", lyric="L21"),
    S(84.242, 21, 2.5, 1.0, "neon", "flaming rocks, later in the clip"),
    S(85.496, 30, 0.0, 0.8, "sepia", "him on the bridge with the dog", lyric="L22"),
    S(87.191, 22, 1.0, 1.0, "neon", "silhouette in flames", lyric="L23"),
    S(90.186, 10, 1.1, 0.6, "red", "dark silhouette, strobing", lyric="L24"),
    S(91.417, 45, 2.2, 0.8, "black", "storm clouds on black"),
    S(93.367, 17, 0.0, 0.75, "neon", "HERO fire rising over the rocks, last line, fade out", lyric="L25", fo=30),
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
         "into that clip. No grade, LUT or border mask is applied: every clip keeps its own look, and",
         "`look` is only a label for that look. All shots run full frame (the clips are already 9:16). Lyric cues are line numbers (L1-L25) into the local-only lyrics file", "`_hjeron-dream-of-fire/dream-of-fire.lyrics.txt`; no lyric text lives in this repo.", "",
         "| # | song frames | len | source clip | src in-out (s) | speed | crop | look | why |",
         "|---|---|---|---|---|---|---|---|---|"]
    for i, (s, (a, b)) in enumerate(zip(SHOTS, fr)):
        n = b - a
        so = s["inp"] + n / FPS * s["sp"]
        name = os.path.basename(CLIPS[s["clip"]])
        zz = "full frame" if s["z"] == s["z1"] == 1.0 else f"{s['z']:.2f}" if s["z"] == s["z1"] else f"{s['z']:.2f}-{s['z1']:.2f}"
        cue = f" (cut on lyric line {s['lyric']})" if s["lyric"] else " (beat cut)"
        L.append(f"| {i + 1} | f{a:04d}-f{b:04d} | {n} | #{s['clip']} `{name}` | {s['inp']:.2f}-{so:.2f} | {s['sp']:.2f}x | {zz} | {s['g']} | {s['why']}{cue} |")
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
overlays composited on him. Fire is in scope, so they stay exactly as he edited them.
#31 to #33 (scorpion with an obsidian point), #43 to #46 (clouds and smoke shot on black) are
fauna and sky elements.

**Unused but clean (11):** #4, #33, #34, #38, #40, #41, #42, #43, #48, #49, #50. #4 is a
murky grey double exposure and #43 is almost entirely black; the rest are near-duplicates of shots
already in the cut (rock, shadow, dune, scorpion) and are the first place to look for replacement angles.

## Looks (untouched)

Nothing is regraded (Robin, 2026-09-28: the original already has the right stylised effect; the
generated shots get made to match it, not the other way round). Each clip keeps its sepia, grain,
torn-photo border or neon fire exactly as Hjeron edited it. The clash between the neon-pink fire
composites and the sepia desert clips is handled by sequencing: neon plays in phrase blocks
(L8-L9 in the verse, then the chorus), and black-background smoke, the red burning-sky
silhouette (#10) and the overexposed flash (#9) sit at the seams as hinges. The sepia bridge
shots return only on the two wake-up lines, as a deliberate contrast.

What that costs: the neon-to-sepia seams at L20 and L22 are still hard switches, the black
smoke clips (#43 to #46) are genuinely dark and read as near-black on a phone, #10 and #12 strobe
(his original edit) and 30 to 24 fps resampling makes that strobe uneven, and the torn-photo
borders stay visible on every sepia shot.
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
