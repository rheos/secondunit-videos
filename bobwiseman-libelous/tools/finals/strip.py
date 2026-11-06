# Per frame: x/y extent of the teleprinter paper (pale yellow) at 1/4 scale -> work/finals/strip.json (1080p px)
import sys, json, numpy as np
from PIL import Image
from concurrent.futures import ProcessPoolExecutor
def one(f):
    im = Image.open(f'work/finals/wide/{f:06d}.jpg'); im.draft('RGB', (480, 270)); a = np.asarray(im.convert('RGB')).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = (r > 200) & (g > 190) & (b > 90) & (b < 200) & (r - b > 50) & (abs(r - g) < 30)
    k = im.size[0] / 1920
    cols = np.where(m.sum(0) > 6)[0]; rows = np.where(m.sum(1) > 30)[0]
    if len(cols) < 20 or len(rows) < 4: return f, None
    return f, [int(cols[0] / k), int((cols[-1] + 1) / k), int(rows[0] / k), int((rows[-1] + 1) / k)]
if __name__ == "__main__":
  with ProcessPoolExecutor(4) as ex: res = dict(ex.map(one, range(8171), chunksize=64))
  json.dump(res, open('work/finals/strip.json', 'w'))
  v = [x for x in res.values() if x]
  print(len(v), 'frames with strip; x0 min', min(x[0] for x in v), 'x1 max', max(x[1] for x in v), 'max width', max(x[1]-x[0] for x in v))
