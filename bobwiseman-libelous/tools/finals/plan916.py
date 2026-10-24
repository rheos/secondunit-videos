# 9:16 window plan: a 1200x1080 window of the 1080p frame centred on the teleprinter strip (work/finals/strip.json).
# The window holds still while the strip centre stays within 24 px of it and pans with the strip when the camera moves.
# Frames with no strip take the nearest strip's centre. Writes work/finals/cx.json (window centre per frame, 1080p px).
import json, numpy as np
W = 1200; r = json.load(open('work/finals/strip.json')); N = 8171
ok = lambda x: x and x[1] - x[0] < 1150
c = np.full(N, np.nan)
for k, x in r.items():
    if ok(x): c[int(k)] = (x[0] + x[1]) / 2
idx = np.where(~np.isnan(c))[0]
for f in range(N):
    if np.isnan(c[f]): c[f] = c[idx[np.argmin(abs(idx - f))]]
m = np.array([np.median(c[max(0, f - 3):f + 4]) for f in range(N)])
s = np.convolve(np.pad(m, 3, mode='edge'), np.ones(7) / 7, mode='valid')
cx = np.zeros(N); h = s[0]
for f in range(N):
    if abs(s[f] - h) > 24: h = s[f] - np.sign(s[f] - h) * 24
    cx[f] = min(max(h, W / 2), 1920 - W / 2)
cx = np.round(cx)
bad = [int(k) for k, x in r.items() if ok(x) and (x[0] < cx[int(k)] - W / 2 + 20 or x[1] > cx[int(k)] + W / 2 - 20)]
moving = int((np.diff(cx) != 0).sum())
print('frames where the window moves:', moving, '; max step px:', int(abs(np.diff(cx)).max()))
print('strip outside window (20 px margin):', len(bad), bad[:20])
json.dump([int(x) for x in cx], open('work/finals/cx.json', 'w'))
