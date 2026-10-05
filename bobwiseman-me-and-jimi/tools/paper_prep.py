# Cut the Kobe paper-theatre pieces out of the public-domain scans in _in/paper-sources (see its
# SOURCES.md) and the Midjourney pieces in _in/mj, into assets/paper/ (all gitignored).
#   plates: jpg, used whole or cut with scissor polygons in the page code
#   pieces: png with alpha, background removed by rembg (isnet-general-use), trimmed
# Run from the project root (pass names to redo only those):
#   uv run --python 3.11 --with 'rembg[cpu]==2.0.59' --with 'numba==0.60.0' --with 'llvmlite==0.43.0' --with 'numpy<2' --with pillow python tools/paper_prep.py
import os, sys, shutil
import numpy as np
from PIL import Image

SRC, MJ, OUT = '_in/paper-sources', '_in/mj', 'assets/paper'
os.makedirs(OUT, exist_ok=True)
only = set(sys.argv[1:])
_sess = None
want = lambda n: not only or n in only

def trim(im, pad=6):
    a = np.array(im.split()[-1]); ys, xs = np.where(a > 8)
    return im if not len(xs) else im.crop((max(0, xs.min() - pad), max(0, ys.min() - pad), min(im.width, xs.max() + pad), min(im.height, ys.max() + pad)))

def cut(name, path, maxside=1600, crop=None):
    global _sess
    if not want(name): return
    from rembg import remove, new_session
    if _sess is None: _sess = new_session('isnet-general-use')
    im = Image.open(path).convert('RGB')
    if crop: im = im.crop(crop)
    im.thumbnail((maxside, maxside), Image.LANCZOS)
    out = trim(remove(im, session=_sess, post_process_mask=True)); out.save(f'{OUT}/{name}.png'); print('piece', name, out.size)

def plate(name, src):
    if want(name): shutil.copy(f'{SRC}/{src}', f'{OUT}/{name}.jpg'); print('plate', name)

plate('great-wave', 'hokusai-great-wave-met.jpg')
plate('ajikawa', 'hiroshige-ajikawa-met.jpg')
plate('kobe-town', 'kobe-kusakabe-1203.jpg')
plate('peking', 'steamship-city-of-peking-met.jpg')
plate('stencil', 'stencil-met.jpg')
plate('sunrise', 'hiroshige-sunrise-susaki-met.jpg')
plate('geese-moon', 'hiroshige-geese-moon-met.jpg')
plate('blues-p3', 'st-louis-blues-1914-p3.jpg')
plate('blues-p4', 'st-louis-blues-1914-p4.jpg')
cut('piano', f'{SRC}/piano-loud-1831-met.jpg', 1800)
cut('guitar', f'{SRC}/guitar-martin-1838-met.jpg', 1800)
cut('radio', f'{MJ}/radio-u1.png', 1232)
if os.path.exists(f'{MJ}/girl-u1.png'): cut('girl', f'{MJ}/girl-u1.png', 1400)
