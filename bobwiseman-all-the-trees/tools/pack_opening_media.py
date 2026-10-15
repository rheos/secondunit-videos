"""Pack the opening's performer cut-outs (source/alchemy/opening/<name>-{open,closed}.png) into
assets/alchemy/opening-media.js as data URIs, so the page renders from file:// without a tainted canvas.
Each open/closed pair is cropped to ONE shared box so the mouth swap stays registered; the faint halo
(alpha < 40) is cleared and the body made opaque; the pair is scaled to 760 px tall."""
import base64, io, json, sys
from pathlib import Path
import numpy as np
from PIL import Image
src = Path('source/alchemy/opening'); out = Path('assets/alchemy/opening-media.js')
media, boxes, crops = {}, {}, {}
MOUTH = {'singer': (610, 165, 40, 28)}  # mouth centre and radii in the 1024x1536 source; others are found automatically
for name, kinds in [('herald', ['open', 'closed']), ('singer', ['open', 'closed']), ('searcher', ['peer', 'shrug', 'surprise', 'look', 'palms'])]:
    ims = {k: Image.open(src / f'{name}-{k}.png').convert('RGBA') for k in kinds if (src / f'{name}-{k}.png').exists()}
    if not ims: continue
    arrs = {k: np.asarray(v).copy() for k, v in ims.items()}
    # The edit redrew the whole engraving, so swapping whole images would make it shimmer: the closed
    # variant is the open image with only a feathered mouth patch taken from the closed one.
    if 'closed' in arrs and name not in MOUTH:
        # Find the mouth: the strongest open/closed difference in the top third of the figure, after blurring.
        from scipy import ndimage as ndi
        d = np.abs(arrs['open'][..., :3].astype(int) - arrs['closed'][..., :3].astype(int)).mean(-1)
        op = arrs['open'][..., 3] > 200; ys, xs = np.where(op); top = ys.min() + (ys.max() - ys.min()) // 3
        d[top:] = 0; d[~op] = 0; d = ndi.gaussian_filter(d, 9); cy, cx = np.unravel_index(np.argmax(d), d.shape)
        MOUTH[name] = (int(cx), int(cy), 46, 34); print(name, 'mouth found at', cx, cy)
    if 'closed' in arrs and name in MOUTH:
        cx, cy, rx, ry = MOUTH[name]; hgt, wid = arrs['open'].shape[:2]; yy, xx = np.mgrid[0:hgt, 0:wid]
        r = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2); m = np.clip((1.25 - r) / .25, 0, 1)[..., None]
        arrs['closed'] = (arrs['open'] * (1 - m) + arrs['closed'] * m).astype(np.uint8)
    for a in arrs.values():
        al = a[..., 3].astype(float); al[al < 40] = 0; al[al > 235] = 255; a[..., 3] = al.astype(np.uint8)
    union = np.zeros(next(iter(arrs.values())).shape[:2], bool)
    for a in arrs.values(): union |= a[..., 3] > 0
    ys, xs = np.where(union); x0, y0, x1, y1 = xs.min() - 6, ys.min() - 6, xs.max() + 7, ys.max() + 7
    crops[name] = (x0, y0, x1, y1, arrs)
    for k, a in arrs.items():
        im = Image.fromarray(a).crop((x0, y0, x1, y1)); s = 760 / im.height
        im = im.resize((round(im.width * s), 760), Image.LANCZOS); b = io.BytesIO(); im.save(b, 'PNG', optimize=True)
        media[f'{name}-{k}'] = 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
        boxes[name] = [0, 0, im.width, im.height]
    print(name, 'box', boxes[name], 'variants', list(arrs))
# v25: the engraved pointing hand from the cloud ("Oh, it's true"), and the bare hand (cut below the cuff) that the
# sun man taps his temple with ("I know"). Half size; tip and wrist recorded in packed pixels.
hp = src / 'cloud-hand.png'
if hp.exists():
    a = np.asarray(Image.open(hp).convert('RGBA')).copy(); al = a[..., 3].astype(float); al[al < 40] = 0; al[al > 235] = 255; a[..., 3] = al.astype(np.uint8)
    TIP, WRIST, CUT = (603, 1426), (570, 700), 675
    for key, y0 in (('cloudhand', 0), ('pointhand', CUT)):
        b = a.copy(); b[:y0, :, 3] = 0
        if y0: b[y0:y0 + 14, :, 3] = (b[y0:y0 + 14, :, 3] * np.linspace(0, 1, 14)[:, None]).astype(np.uint8)
        ys, xs = np.where(b[..., 3] > 0); x0, yt, x1, yb = xs.min() - 4, ys.min(), xs.max() + 5, ys.max() + 5
        im = Image.fromarray(b).crop((x0, yt, x1, yb)); im = im.resize((round(im.width / 2), round(im.height / 2)), Image.LANCZOS)
        bb = io.BytesIO(); im.save(bb, 'PNG', optimize=True); media[key] = 'data:image/png;base64,' + base64.b64encode(bb.getvalue()).decode()
        boxes[key] = {'w': im.width, 'h': im.height, 'tip': [(TIP[0] - x0) / 2, (TIP[1] - yt) / 2], 'wrist': [(WRIST[0] - x0) / 2, (WRIST[1] - yt) / 2]}
        print(key, boxes[key])
# Draft 2 (Bob's note at 2:16): the heart tree's carved wooden hand pointing straight out at the viewer, end of its
# right branch on the last "so are you". Half size; wrist = the branch stump, tip = the end-on fingertip.
tp = src / 'tree-hand-at-you.png'
if tp.exists():
    a = np.asarray(Image.open(tp).convert('RGBA')).copy(); al = a[..., 3].astype(float); al[al < 90] = 0; al[al > 235] = 255; a[..., 3] = al.astype(np.uint8)
    TIP, WRIST = (585, 640), (865, 190)
    ys, xs = np.where(a[..., 3] > 0); x0, yt, x1, yb = xs.min() - 4, ys.min(), xs.max() + 5, ys.max() + 5
    im = Image.fromarray(a).crop((x0, yt, x1, yb)); im = im.resize((round(im.width / 2), round(im.height / 2)), Image.LANCZOS)
    bb = io.BytesIO(); im.save(bb, 'PNG', optimize=True); media['treehand'] = 'data:image/png;base64,' + base64.b64encode(bb.getvalue()).decode()
    boxes['treehand'] = {'w': im.width, 'h': im.height, 'tip': [(TIP[0] - x0) / 2, (TIP[1] - yt) / 2], 'wrist': [(WRIST[0] - x0) / 2, (WRIST[1] - yt) / 2]}
    print('treehand', boxes['treehand'])
# v26: extra troubadour poses (startled hop, nervous glance, scuttle off) in the singer's own crop box, so they swap in at
# the same scale; each is shifted so its feet land where the singing pose's feet are.
def feet(a):
    # x: the torso's centre (hands and capes vary by pose); y: the lowest boot
    op = a[..., 3] > 200; ys, xs = np.where(op); yt, yb = ys.min(), ys.max(); sel = (ys > yt + .25 * (yb - yt)) & (ys < yt + .5 * (yb - yt))
    return np.median(xs[sel]), yb
if 'singer' in crops:
    x0, y0, x1, y1, arrs = crops['singer']; fx, fy = feet(arrs['open'])
    for k in ('startled', 'glance', 'scuttle'):
        q = src / f'singer-{k}.png'
        if not q.exists(): continue
        a = np.asarray(Image.open(q).convert('RGBA')).copy(); al = a[..., 3].astype(float); al[al < 40] = 0; al[al > 235] = 255; a[..., 3] = al.astype(np.uint8)
        gx, gy = feet(a); dx, dy = int(round(fx - gx)), int(round(fy - gy))
        im = Image.new('RGBA', (a.shape[1], a.shape[0])); im.paste(Image.fromarray(a), (dx, dy))
        PAD = 80  # wider than the singing pose (hands up, flying cape), padded evenly so it stays centred on the same feet
        im = im.crop((x0 - PAD, y0, x1 + PAD, y1)); s = 760 / im.height; im = im.resize((round(im.width * s), 760), Image.LANCZOS)
        b = io.BytesIO(); im.save(b, 'PNG', optimize=True); media[f'singer-{k}'] = 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
        print('singer', k, 'feet shift', dx, dy)
out.write_text('// Generated by tools/pack_opening_media.py (local media, not committed).\nwindow.ALCHEMY_OPENING_MEDIA=' + json.dumps(media) + ';\nwindow.ALCHEMY_OPENING_BOX=' + json.dumps(boxes) + ';\n')
print('wrote', out, round(out.stat().st_size / 1e6, 1), 'MB')
