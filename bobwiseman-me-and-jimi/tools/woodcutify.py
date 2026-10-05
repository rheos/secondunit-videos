"""Turn a photo of a real person into a woodcut piece: cut out (rembg), then carved values.
  solid ink where it's dark, bare paper where it's light, and in the mid-tones parallel gouge lines whose
  width grows with darkness; edges (Sobel) printed as ink so the features hold. Output: black ink on
  transparent (the woodcut look prints it), optional red plate from a mask colour range.
Usage: python tools/woodcutify.py <in> <out.png> [--crop x0,y0,x1,y1] [--ang deg] [--gap px] [--lo .3 --hi .7] [--size 1400]
Run: uv run --python 3.11 --with 'rembg[cpu]==2.0.59' --with 'numba==0.60.0' --with 'llvmlite==0.43.0' --with 'numpy<2' --with pillow --with scipy --with scikit-image python tools/woodcutify.py ...  (--local .12 for dark photos)
"""
import argparse, numpy as np
from PIL import Image, ImageFilter, ImageOps
from scipy import ndimage
ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('out')
ap.add_argument('--crop'); ap.add_argument('--ang', type=float, default=30); ap.add_argument('--gap', type=float, default=9)
ap.add_argument('--lo', type=float, default=.32); ap.add_argument('--hi', type=float, default=.72); ap.add_argument('--size', type=int, default=1400)
ap.add_argument('--edge', type=float, default=.18); ap.add_argument('--local', type=float, default=0); ap.add_argument('--blur', type=float, default=1.2); ap.add_argument('--redpoly', help='print the ink inside this path (crop px) on the RED plate, e.g. her hair'); ap.add_argument('--redhole', help='cx,cy,rx,ry ellipse kept black inside the red path (the face)')
ap.add_argument('--poly', help='scissor path in crop px, "x,y;x,y;..." (overrides rembg)'); ap.add_argument('--nocut', action='store_true')
a = ap.parse_args()
src_im = Image.open(a.src)
has_alpha = src_im.mode in ('RGBA', 'LA', 'P') and (src_im.mode != 'P' or 'transparency' in src_im.info)
im = src_im.convert('RGBA') if has_alpha else src_im.convert('RGB')
if a.crop: im = im.crop(tuple(int(v) for v in a.crop.split(',')))
im.thumbnail((a.size, a.size), Image.LANCZOS)
im_rgb = Image.alpha_composite(Image.new('RGBA', im.size, (255, 255, 255, 255)), im).convert('RGB') if has_alpha else im
sc = min(1, a.size / max(Image.open(a.src).crop(tuple(int(v) for v in a.crop.split(','))).size if a.crop else Image.open(a.src).size))
if a.poly:
    from PIL import ImageDraw
    m = Image.new('L', (im.width, im.height), 0); pts = [tuple(float(v) * sc for v in q.split(',')) for q in a.poly.split(';')]
    ImageDraw.Draw(m).polygon(pts, fill=255); alpha = np.asarray(m, np.float32) / 255
elif has_alpha: alpha = np.asarray(im.split()[-1], np.float32) / 255     # the source is already cut out
elif a.nocut: alpha = np.ones((im.height, im.width), np.float32)
else:
    from rembg import remove, new_session
    alpha = np.asarray(remove(im_rgb, session=new_session('isnet-general-use'), post_process_mask=True).split()[-1], np.float32) / 255
g = np.asarray(ImageOps.autocontrast(im_rgb.convert('L'), cutoff=1).filter(ImageFilter.GaussianBlur(a.blur)), np.float32) / 255
if a.local > 0:   # local contrast (CLAHE) so a dark face in a dark photo still carves into features
    from skimage import exposure
    g = exposure.equalize_adapthist(g, kernel_size=max(16, int(min(g.shape) * a.local)), clip_limit=.02).astype(np.float32)
H, W = g.shape
yy, xx = np.mgrid[0:H, 0:W]
th = np.deg2rad(a.ang)
# distance across the hatch direction; the lines bend a little with the tone so they read as carved, not ruled
u = (xx * np.cos(th) + yy * np.sin(th)) + ndimage.gaussian_filter(g, 6) * a.gap * 2.5
phase = np.abs(((u / a.gap) % 1) - .5) * 2            # 0 at a line centre, 1 between lines
dark = np.clip((a.hi - g) / (a.hi - a.lo), 0, 1)       # 0 light .. 1 dark
ink = (g < a.lo) | ((g < a.hi) & (phase < dark))
# edges as ink so eyes, nose, mouth and the hairline hold
sx, sy = ndimage.sobel(ndimage.gaussian_filter(g, 1.4), 1), ndimage.sobel(ndimage.gaussian_filter(g, 1.4), 0)
ink |= np.hypot(sx, sy) > a.edge * 4
ink = ndimage.binary_opening(ink, iterations=1)
out = np.zeros((H, W, 4), np.uint8); out[..., 3] = (ink * (alpha > .5) * 255).astype(np.uint8)
# a cream "paper" silhouette under it so the figure is cut out of the background as a block
base = np.zeros((H, W, 4), np.uint8); base[..., :3] = 255; base[..., 3] = ((alpha > .5) * 255).astype(np.uint8)
if a.redpoly:
    from PIL import ImageDraw
    rm = Image.new('L', (W, H), 0); ImageDraw.Draw(rm).polygon([tuple(float(v) * sc for v in q.split(',')) for q in a.redpoly.split(';')], fill=255)
    red = np.asarray(rm) > 0
    if a.redhole:
        cx, cy, rx, ry = (float(v) * sc for v in a.redhole.split(','))
        red &= ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 > 1
    rr = red & (out[..., 3] > 0); out[rr, 0] = 255     # ink pixels there print red (#f00) instead of black
comp = Image.alpha_composite(Image.fromarray(base), Image.fromarray(out))
bb = Image.fromarray(base[..., 3]).getbbox(); comp = comp.crop(bb) if bb else comp
comp.save(a.out); print('wrote', a.out, comp.size)
