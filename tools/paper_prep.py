# Cut the paper-theatre pieces out of the public-domain scans in _in/paper-sources (see its SOURCES.md)
# and the Midjourney pieces in _in/mj, into assets/paper/ (both gitignored).
#   plates: jpg, used whole (or torn in code)
#   pieces: png with alpha, trimmed to their content
# Background removal is rembg (isnet-general-use); bright-on-dark pieces (lightning, the egret photos)
# and dark-on-light ones (funnel smoke) are keyed on luminance instead.
# Run from the project root:
#   uv run --python 3.11 --with 'rembg[cpu]==2.0.59' --with 'numba==0.60.0' --with 'llvmlite==0.43.0' --with 'numpy<2' --with pillow python tools/paper_prep.py
import os, sys
import numpy as np
from PIL import Image, ImageFilter

SRC, MJ, OUT = '_in/paper-sources', '_in/mj', 'assets/paper'
os.makedirs(OUT, exist_ok=True)
only = set(sys.argv[1:])
_sess = None

def want(name): return not only or name in only

def load(path, crop=None, maxside=None):
    im = Image.open(path).convert('RGB')
    if crop: im = im.crop(crop)
    if maxside: im.thumbnail((maxside, maxside), Image.LANCZOS)
    return im

def trim(im, pad=6):
    a = np.array(im.split()[-1]); ys, xs = np.where(a > 8)
    if not len(xs): return im
    return im.crop((max(0, xs.min() - pad), max(0, ys.min() - pad), min(im.width, xs.max() + pad), min(im.height, ys.max() + pad)))

def rembg_cut(im):
    global _sess
    from rembg import remove, new_session
    if _sess is None: _sess = new_session('isnet-general-use')
    return trim(remove(im, session=_sess, post_process_mask=True))

def lum_key(im, lo, hi, invert=False, tint=None, blur=0, keep=False):
    a = np.asarray(im.convert('L'), dtype=np.float32) / 255
    if invert: a = 1 - a
    k = np.clip((a - lo) / (hi - lo), 0, 1); k = k * k * (3 - 2 * k)
    rgb = np.asarray(im, dtype=np.float32)
    if tint is not None: rgb = rgb * 0 + np.array(tint, dtype=np.float32)
    out = Image.fromarray(np.dstack([rgb, k * 255]).astype(np.uint8), 'RGBA')
    if blur: out = Image.fromarray(np.dstack([np.asarray(out)[..., :3], np.asarray(out.split()[-1].filter(ImageFilter.GaussianBlur(blur)))]).astype(np.uint8), 'RGBA')
    return out if keep else trim(out)

def plate(name, src, crop=None, maxside=2400):
    if want(name): load(f'{SRC}/{src}', crop, maxside).save(f'{OUT}/{name}.jpg', quality=92); print('plate', name)

def piece(name, im):
    im.save(f'{OUT}/{name}.png'); print('piece', name, im.size)

# ---- plates ----
plate('sky-storm', '01-storm-sky-b.jpg')              # Ruisdael, storm clouds over the sea
plate('sea-storm', '02-sea-b.jpg')                    # Aivazovsky, ship on stormy seas
plate('sky-dusk', '01-storm-sky-c.jpg')               # Levitan, before the storm
plate('sea-mezzo', '02-sea-c.jpg')                    # Watson after Kobell, mezzotint storm at sea
plate('dancehouse', '06-warehouse-b.jpg', (76, 38, 2292, 3705))   # Whistler, Nocturne: Dance-House (the plate, without the margin)
plate('stokehold', '09-stokers-a.jpg', (0, 0, 1758, 1880))       # Staniland, stokehold engraving, caption cropped off

# ---- pieces: rembg ----
for name, src, crop in [
    ('steamer-erie', '04-steamer-a.jpg', None), ('steamer-mayflower', '04-steamer-c.jpg', None),
    ('schooner-iroquois', '05-schooner-a.jpg', None), ('clipper', '05-schooner-b.jpg', None),
    ('gent', '11-gent-c.jpg', None), ('heron-blue', '08-heron-a.jpg', None),
]:
    if want(name): piece(name, rembg_cut(load(f'{SRC}/{src}', crop, 2400)))
if want('shovel') and os.path.exists(f'{MJ}/shovel.png'): piece('shovel', rembg_cut(load(f'{MJ}/shovel.png', None, 2000)))
if want('coal') and os.path.exists(f'{MJ}/coal.png'): piece('coal', rembg_cut(load(f'{MJ}/coal.png', None, 2000)))
if want('lamp') and os.path.exists(f'{MJ}/lamp.png'): piece('lamp', rembg_cut(load(f'{MJ}/lamp.png', None, 2000)))

# ---- pieces: luminance keys ----
L = f'{SRC}/03-lightning-a.jpg'                       # Loppe 1902: the bolts only, never the tower
if want('bolt'):
    for i, c in enumerate([(470, 0, 840, 590), (0, 360, 490, 720), (200, 1060, 470, 1390)]):
        piece(f'bolt-{i}', lum_key(load(L, c), .5, .78, tint=(250, 246, 236)))
E = f'{SRC}/08-heron-c.jpg'                           # 1887 chronophotograph of an egret in flight (faces right)
if want('egret'):
    for i, c in enumerate([(55, 700, 700, 1320), (720, 820, 1350, 1240), (1320, 820, 2140, 1320), (2130, 790, 2970, 1110), (3040, 470, 3730, 1150)]):
        piece(f'egret-{i}', lum_key(load(E, c), .4, .62, blur=1))
if want('smoke'):
    piece('smoke', lum_key(load(f'{SRC}/12-smoke-b.jpg', (1515, 875, 2160, 1175)), .45, .85, invert=True, tint=(28, 26, 26), blur=2))
# the lit windows of the dance-house, as a light layer (bright etched areas only)
if want('dancehouse'):
    im = load(f'{SRC}/06-warehouse-b.jpg', (76, 38, 2292, 3705), 2400)
    lum_key(im, .42, .62, tint=(255, 196, 120), keep=True).save(f'{OUT}/dancehouse-light.png'); print('light dancehouse')
