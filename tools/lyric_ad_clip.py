# Cuts a <=30 s 9:16 ad clip out of a finished 9:16 render and burns in the lyric, Giulietta's "film" subtitle style
# (bobwiseman-giulietta-masina/js/lyrics/cap.js + js/dream/film.js drawSubs): white Helvetica Neue Medium with a dark
# edge and a faint glow, the whole line laid out at once, each word printing on its onset. Used for Bob's social ads
# (rheos/secondunit-videos, 2026-10-15) on songs whose look pages have no caption layer.
#
# lines.json: the aligner output (bobwiseman-giulietta-masina/tools/align_lyrics.py): lines[].words[] with w, s, e.
# It quotes the lyric, so it stays local. A line shows from 0.25 s before its first word until the next line comes up,
# or 6 s after its last word starts, whichever is first.
#
# Run: uv run --with pillow --with 'numpy<2' python tools/lyric_ad_clip.py SRC_9x16.mp4 lines.json T0 T1 OUT.mp4 \
#        [--fi 0.15] [--fo 0.5] [--y bottom|top|<px>]
# T0/T1 are seconds on the song clock (the 9:16 render starts at song 0). Refuses anything longer than 30.0 s.
import argparse, json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('lines'); ap.add_argument('t0', type=float); ap.add_argument('t1', type=float); ap.add_argument('out')
ap.add_argument('--fi', type=float, default=.15); ap.add_argument('--fo', type=float, default=.5); ap.add_argument('--y', default='bottom')
A = ap.parse_args()
FPS, W, H = 24, 720, 1280
n = round((A.t1 - A.t0) * FPS); dur = n / FPS
if dur > 30.0: sys.exit(f'{dur:.3f} s is over the 30.0 s cap')

# tall film style (cap.js CAP_STYLE.film.tall): size 40 at maxW 590, narrower layouts with more rows if needed
SIZE, MAXW, LEAD, BOTTOM, TOP, PADY = 40, 590, 1.18, 980, 150, 6
FONT = ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', SIZE, index=10)
EDGE = max(2, round(SIZE * .07))                                  # canvas lineWidth .14*size is half outside the glyph
sp = FONT.getlength(' ')

L = json.load(open(A.lines))['lines']
for i, l in enumerate(L):
    l['a'] = l['words'][0]['s'] - .25
    l['b'] = min(L[i + 1]['words'][0]['s'] - .25 if i + 1 < len(L) else 1e9, l['words'][-1]['s'] + 6)

def layout(words):
    ww = [FONT.getlength(w['w']) for w in words]
    row = lambda a, b: sum(ww[a:b]) + sp * (b - a - 1)
    for r in range(1, len(ww) + 1):
        tgt = row(0, len(ww)) / r
        while tgt <= MAXW + 1:
            rows, a = [], 0
            for i in range(1, len(ww) + 1):
                if i == len(ww) or row(a, i + 1) > tgt: rows.append((a, i)); a = i
            if len(rows) == r and all(row(x, y) <= MAXW for x, y in rows): return rows, ww, row
            tgt += 8
    sys.exit('line does not fit: ' + ' '.join(w['w'] for w in words))

lh = SIZE * LEAD; worst = [W, 0]
def frame_img(t):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    li = next((l for l in L if l['a'] <= t < l['b']), None)
    if not li: return im, False
    rows, ww, row = layout(li['words'])
    hgt = lh * len(rows) + PADY * 2
    y0 = BOTTOM - hgt if A.y == 'bottom' else TOP if A.y == 'top' else int(A.y)
    on = [(k, w) for k, w in enumerate(li['words']) if t >= w['s']]
    if not on: return im, False
    mask = Image.new('L', (W, H), 0); edge = Image.new('L', (W, H), 0)
    dm, de = ImageDraw.Draw(mask), ImageDraw.Draw(edge)
    for r, (a, b) in enumerate(rows):
        x = W / 2 - row(a, b) / 2; y = y0 + PADY + r * lh
        for k in range(a, b):
            worst[0] = min(worst[0], x); worst[1] = max(worst[1], x + ww[k])
            if t >= li['words'][k]['s']:
                dm.text((x, y), li['words'][k]['w'], font=FONT, fill=255)
                de.text((x, y), li['words'][k]['w'], font=FONT, fill=255, stroke_width=EDGE, stroke_fill=255)
            x += ww[k] + sp
    glow = mask.filter(ImageFilter.GaussianBlur(3.5)).point(lambda v: int(v * .45))
    im.paste((255, 255, 255, 255), (0, 0), glow)
    im.paste((8, 8, 8, 255), (0, 0), edge.point(lambda v: int(v * .85)))
    im.paste((246, 246, 244, 255), (0, 0), mask)
    return im, True

with tempfile.TemporaryDirectory() as td:
    blank = os.path.join(td, 'blank.png'); Image.new('RGBA', (W, H), (0, 0, 0, 0)).save(blank)
    last_key = None
    for f in range(n):
        t = A.t0 + f / FPS
        li = next((l for l in L if l['a'] <= t < l['b']), None)
        key = (id(li), sum(t >= w['s'] for w in li['words'])) if li else None
        p = os.path.join(td, f'{f:06d}.png')
        if key == last_key and f: os.link(os.path.join(td, f'{f - 1:06d}.png'), p); continue
        last_key = key
        im, _ = frame_img(t); im.save(p)
    if worst[0] < 16 or worst[1] > W - 16: sys.exit(f'caption runs past the 16 px margin: x {worst[0]:.0f}-{worst[1]:.0f}')
    fo0 = dur - A.fo
    flt = (f"[0:v][1:v]overlay=0:0:format=auto,fade=t=in:st=0:d={A.fi},fade=t=out:st={fo0:.4f}:d={A.fo},format=yuv420p[v];"
           f"[0:a]afade=t=in:st=0:d={A.fi},afade=t=out:st={fo0:.4f}:d={A.fo}[a]")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{A.t0:.4f}', '-t', f'{dur:.4f}', '-i', A.src,
                    '-framerate', str(FPS), '-i', os.path.join(td, '%06d.png'), '-filter_complex', flt, '-map', '[v]', '-map', '[a]',
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-maxrate', '4.5M', '-bufsize', '9M', '-c:a', 'aac', '-b:a', '256k',
                    '-t', f'{dur:.4f}', '-movflags', '+faststart', A.out], check=True)
print(f'wrote {A.out}  {dur:.3f} s  caption x {worst[0]:.0f}-{worst[1]:.0f}')
