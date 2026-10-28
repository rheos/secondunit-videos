# track.py: turn MediaPipe landmarks (pose.py) into a motion track for the paper-depth musician rig.
#   uv run --python 3.11 --with numpy python tools/track.py assets/pose_raw.json assets/track.json [--f0 12 --f1 120]
# Writes two tracks in rig units (ground at y 0, up negative, the figure about 420 tall, facing right):
#   clean  leg identity fixed by continuity, camera pan removed, smoothed, feet locked while planted
#   raw    the same retarget with none of that cleanup, to show what the tracker alone gives
# Also writes the same as <out>.js (window.TRACK) for the page. Per frame: hip, lean, ankles N/F (x, y, foot angle, planted), case-arm angles, head angle, case swing, speed.
import json, argparse
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('out'); ap.add_argument('--f0', type=int, default=12); ap.add_argument('--f1', type=int, default=120)
a = ap.parse_args()
D = json.load(open(a.src)); FPS = D['fps']
fr = D['frames'][a.f0:a.f1 + 1]
# fill missed frames by linear interpolation between their neighbours
idx = [i for i, f in enumerate(fr) if f is not None]
P = np.zeros((len(fr), 33, 2))
for j in range(33):
    for c in range(2):
        P[:, j, c] = np.interp(range(len(fr)), idx, [fr[i][j][c] for i in idx])
N = len(P)

L1, L2, ANK = 106, 102, 16                     # rig thigh, shin, ankle height (musician.js)
LEG = {'L': [23, 25, 27, 29, 31], 'R': [24, 26, 28, 30, 32]}

def fix_identity(P):
    """MediaPipe labels left and right by appearance, which flips in profile. Keep each leg the one nearest
    where that leg was a frame ago (ankle, knee, heel, toe), swapping labels when that is cheaper."""
    Q = P.copy(); swaps = []
    for k in range(1, N):
        A, B = LEG['L'][1:], LEG['R'][1:]
        keep = sum(np.linalg.norm(Q[k, i] - Q[k - 1, i]) for i in A + B)
        swap = sum(np.linalg.norm(Q[k, A[n]] - Q[k - 1, B[n]]) + np.linalg.norm(Q[k, B[n]] - Q[k - 1, A[n]]) for n in range(len(A)))
        if swap < keep * .7:
            swaps.append(k + a.f0)
            for i, j in zip(LEG['L'], LEG['R']):
                Q[k, [i, j]] = Q[k, [j, i]]
    return Q, swaps

def smooth(x, w=5):
    """Savitzky-Golay (window 5, order 2) along time, ends held."""
    c = np.array([-3, 12, 17, 12, -3]) / 35.
    pad = np.concatenate([np.repeat(x[:1], 2, 0), x, np.repeat(x[-1:], 2, 0)])
    return sum(c[i] * pad[i:i + len(x)] for i in range(5))

def build(P, clean):
    swaps = []
    if clean: P, swaps = fix_identity(P)
    ankL, ankR = P[:, 27], P[:, 28]
    G = np.percentile(np.maximum(ankL[:, 1], ankR[:, 1]), 75)         # planted ankle height on screen
    # The base clip's camera is locked: planted feet move 0-1 px a frame on screen (checked 2026-10-28), so
    # screen x is world x. A pan estimate from "the slower foot" was tried and dropped: the tracker's leg swaps
    # (90 px jumps at f29) fooled it into a 200 px pan that never happened.
    camx = np.zeros(N)
    W = P.copy(); W[:, :, 0] += camx[:, None]
    if clean: W = smooth(W.reshape(N, -1)).reshape(N, 33, 2)
    # planted: still in the world (under 2 px a frame) and not far off the ground. A walker always has a foot
    # down, so the slower foot counts as planted too when it is near the ground; runs under 3 frames are dropped
    vwL, vwR = np.abs(np.gradient(W[:, 27, 0])), np.abs(np.gradient(W[:, 28, 0]))
    low = lambda j: W[:, j, 1] > G - 30
    pL = low(27) & ((vwL < 2.) | (vwL <= vwR))
    pR = low(28) & ((vwR < 2.) | (vwR < vwL))
    if clean:
        # standing (from here to the end the feet are side by side and the root under 100 rig units a second, the settling sway): both feet are down. Behind the case
        # the tracker invents a lifted, bent leg when he stands (f98-f116); the root says otherwise
        hv = np.abs(np.gradient(smooth(smooth(((W[:, 23, 0] + W[:, 24, 0]) / 2)[:, None]))[:, 0])) * FPS * (L1 + L2) / np.median(
            np.linalg.norm(W[:, 23] - W[:, 25], axis=1) + np.linalg.norm(W[:, 25] - W[:, 27], axis=1))
        stand = np.zeros(N, bool)
        k = N - 1
        while k > 0 and hv[k] < 100 and abs(W[k, 27, 0] - W[k, 28, 0]) < 25: stand[k] = True; k -= 1
        pL |= stand; pR |= stand
        for p in (pL, pR):
            i = 0
            while i < N:
                if p[i]:
                    j = i
                    while j + 1 < N and p[j + 1]: j += 1
                    if j - i < 2: p[i:j + 1] = False
                    i = j + 1
                else: i += 1
    legpx = np.median(np.linalg.norm(W[:, 23] - W[:, 25], axis=1) + np.linalg.norm(W[:, 25] - W[:, 27], axis=1))
    s = (L1 + L2) / legpx
    hipW = (W[:, 23] + W[:, 24]) / 2
    X0 = hipW[0, 0]
    R = lambda p: np.stack([(p[..., 0] - X0) * s, (p[..., 1] - G) * s - ANK], -1)
    hip, shm = R(hipW), R((W[:, 11] + W[:, 12]) / 2)
    if clean:
        for _ in range(2): hip = smooth(hip)                           # the root carries no tracker jitter
    lean = np.arctan2(shm[:, 0] - hip[:, 0], -(shm[:, 1] - hip[:, 1]))
    lean = lean - np.median(lean) + .05                               # keep the drawing's posture, take the motion
    feet = {}
    for k, (side, pl) in enumerate([('L', pL), ('R', pR)]):
        an, he, to = R(W[:, LEG[side][2]]), R(W[:, LEG[side][3]]), R(W[:, LEG[side][4]])
        fa = np.arctan2(to[:, 1] - he[:, 1], to[:, 0] - he[:, 0])
        fa = fa - np.median(fa[pl]) if pl.any() else fa                  # flat when planted
        an = an.copy()
        if clean:
            # lock each planted run to its median spot, blending 2 frames in and out so the foot never pops
            runs, i = [], 0
            while i < N:
                if pl[i]:
                    j = i
                    while j + 1 < N and pl[j + 1]: j += 1
                    runs.append((i, j)); i = j + 1
                else: i += 1
            tgt = an.copy(); wgt = np.zeros(N)
            for i, j in runs:
                spot = [np.median(an[i:j + 1, 0]), -ANK]
                for f in range(max(0, i - 2), min(N, j + 3)):
                    w = 1 if i <= f <= j else 1 - (min(abs(f - i), abs(f - j))) / 3
                    if w > wgt[f]: wgt[f] = w; tgt[f] = spot
            an = an * (1 - wgt[:, None]) + tgt * wgt[:, None]
            fa = fa * (1 - wgt * .85)
        feet[side] = {'ank': an, 'a': fa, 'planted': pl}
    # the near leg in the rig is the subject's left (we see his left side, he faces right)
    # case arm = the subject's left arm (he carries it in the near hand; the rig carries it in the far hand)
    sh, el, wr = R(W[:, 11]), R(W[:, 13]), R(W[:, 15])
    th = np.arctan2(el[:, 0] - sh[:, 0], el[:, 1] - sh[:, 1])
    th2 = np.arctan2(wr[:, 0] - el[:, 0], wr[:, 1] - el[:, 1])
    # head: ear to nose against its median
    hd = np.arctan2(R(W[:, 0])[:, 1] - R(W[:, 7])[:, 1], R(W[:, 0])[:, 0] - R(W[:, 7])[:, 0])
    head = (hd - np.median(hd)) * .6 - (lean - .05) * .6
    # the case rocks about its handle like a pendulum (centre of mass 40 below the hand), driven by the traced
    # body's acceleration (the hand is hidden behind the case too often to differentiate twice);
    # g is 9.8 m/s2 in rig units (the 208 leg is about 0.9 m)
    g, l, zeta, grip = 9.8 * 208 / .9, 40., .3, 90.   # grip: the hand resists the case turning
    dt = 1 / FPS; sub = 20; phi = 0.; om = 0.; case = []
    body = hip.copy()
    for _ in range(3 if clean else 0): body = smooth(body)
    acc = np.clip(np.gradient(np.gradient(body, dt, axis=0), dt, axis=0), -.6 * g, .6 * g)
    w0 = np.sqrt(g / l)
    for k in range(N):
        ax, ay = acc[k]
        for _ in range(sub):
            al = (ax * np.cos(phi) - (g - ay) * np.sin(phi)) / l - grip * phi - 2 * zeta * w0 * om
            om += al * dt / sub; phi += om * dt / sub
        case.append(phi)
    speed = np.gradient(hip[:, 0], dt)
    if clean: speed = smooth(smooth(speed[:, None]))[:, 0]
    out = []
    for k in range(N):
        out.append({
            'hip': hip[k].round(2).tolist(), 'lean': round(float(lean[k]), 4),
            'N': feet['L']['ank'][k].round(2).tolist() + [round(float(feet['L']['a'][k]), 4), bool(feet['L']['planted'][k])],
            'F': feet['R']['ank'][k].round(2).tolist() + [round(float(feet['R']['a'][k]), 4), bool(feet['R']['planted'][k])],
            'th': round(float(th[k]), 4), 'th2': round(float(th2[k]), 4), 'head': round(float(head[k]), 4),
            'case': round(float(case[k]), 4), 'speed': round(float(speed[k]), 1)})
    # foot slide while planted, in rig units per frame (the number a foot lock fixes)
    slide = []
    for side in 'LR':
        an, pl = feet[side]['ank'], feet[side]['planted']
        d = np.abs(np.diff(an[:, 0]))[pl[1:] & pl[:-1]]
        slide.append(float(np.mean(d)) if len(d) else 0.)
    stats = {'scale_px_to_rig': round(float(s), 3), 'ground_px': round(float(G), 1), 'identity_swaps_at_src_frame': swaps,
             'walked_rig_units': round(float(hip[-1, 0] - hip[0, 0]), 1),
             'planted_slide_rig_per_frame': [round(x, 2) for x in slide], 'case_swing_range': [round(float(min(case)), 3), round(float(max(case)), 3)]}
    return out, stats

clean, cs = build(P, True)
raw, rs = build(P, False)
doc = {'fps': FPS, 'src_frames': [a.f0, a.f1], 'clean': clean, 'raw': raw, 'stats': {'clean': cs, 'raw': rs}}
json.dump(doc, open(a.out, 'w'))
open(a.out.replace('.json', '.js'), 'w').write('window.TRACK = ' + json.dumps(doc) + ';\n')   # pages open from file://, no fetch
print(json.dumps({'clean': cs, 'raw': rs}, indent=1))
