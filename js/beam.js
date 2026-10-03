// BEAM: a single-electron-beam vector display. Scenes emit polylines (screen space, or 3D through a camera);
// the beam strokes them on black. Intensity is written into the red channel for the green P31 phosphor and
// the green channel for the amber one, so look.js can colour, bloom and mix the two.
//   - strokes use 'lighten', so crossing lines don't double up but a bright dot beats a dim line
//   - corners and line ends get a brighter dot (the beam dwells there while it changes direction)
//   - each path wobbles a hair, per path, per instant (beam jitter)
//   - afterglow: the last K sub-frames are redrawn, each dimmer. A pure function of t: nothing carries
//     over between frames, so frames can still render in parallel and out of order.
//   - morph: every point can be pulled onto one Lissajous figure (the display losing sync)
const Beam = (() => {
  const B = { K: 9, DT: 1 / 105, DEC: .6, I: 1, ph: 0, jit: 1, morph: 0, liss: null, tk: 0 };
  let pid = 0, sAcc = 0;
  const rgb = (i, m) => { i = clamp(i); m = clamp(m); return `rgb(${(255 * i * (1 - m)) | 0},${(255 * i * m) | 0},0)`; };
  function resample(pts, step) {
    const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
      for (let k = 1; k <= n; k++) out.push([lerp(x0, x1, k / n), lerp(y0, y1, k / n)]);
    }
    return out;
  }
  B.path = (pts, o = {}) => {
    if (!pts || pts.length < 2) return;
    const m = o.ph ?? B.ph, bi = (o.b ?? 1) * B.I;
    if (bi < .01) return;
    pid++;
    const jx = snoise(B.tk * 27 + pid * 1.73, 3) * B.jit * 1.1, jy = snoise(B.tk * 27 + pid * 1.73, 4) * B.jit * 1.1;
    let Q = pts;
    if (o.closed) Q = pts.concat([pts[0]]);
    if (B.morph > 0 && B.liss) {
      Q = resample(Q, 10);
      const out = [];
      for (let i = 0; i < Q.length; i++) {
        if (i) sAcc += Math.hypot(Q[i][0] - Q[i - 1][0], Q[i][1] - Q[i - 1][1]);
        const l = B.liss(sAcc, B.tk);
        out.push([lerp(Q[i][0], l[0], B.morph), lerp(Q[i][1], l[1], B.morph)]);
      }
      Q = out; sAcc += 140;
    }
    s.beginPath();
    for (let i = 0; i < Q.length; i++) { const x = Q[i][0] + jx, y = Q[i][1] + jy; i ? s.lineTo(x, y) : s.moveTo(x, y); }
    s.lineCap = 'round'; s.lineJoin = 'round';
    s.lineWidth = o.w ? o.w * 2.8 : 7; s.strokeStyle = rgb(bi * .26, m); s.stroke();
    s.lineWidth = o.w || 2.3; s.strokeStyle = rgb(bi * .82, m); s.stroke();
    if (o.dots === false) return;
    s.fillStyle = rgb(Math.min(1, bi * 1.15), m);
    const n = Q.length, dr = (o.w || 2.3) * 1.15;
    const D = (x, y) => { s.beginPath(); s.arc(x + jx, y + jy, dr, 0, TAU); s.fill(); };
    if (!o.closed) { D(Q[0][0], Q[0][1]); D(Q[n - 1][0], Q[n - 1][1]); }
    for (let i = 1; i < n - 1; i++) {
      const ax = Q[i][0] - Q[i - 1][0], ay = Q[i][1] - Q[i - 1][1], bx = Q[i + 1][0] - Q[i][0], by = Q[i + 1][1] - Q[i][1];
      const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by); if (la < .5 || lb < .5) continue;
      if ((ax * bx + ay * by) / (la * lb) < .72) D(Q[i][0], Q[i][1]);
    }
  };
  B.dot = (x, y, r = 3, b = 1, ph) => {
    s.fillStyle = rgb(b * B.I, ph ?? B.ph); s.beginPath(); s.arc(x, y, r, 0, TAU); s.fill();
    s.fillStyle = rgb(b * B.I * .3, ph ?? B.ph); s.beginPath(); s.arc(x, y, r * 2.4, 0, TAU); s.fill();
  };
  // ---- 3D: a pinhole camera. pos, yaw (+ looks toward +x), pitch (+ looks down), focal length in px ----
  B.cam = (o) => {
    const [px, py, pz] = o.pos, cy = Math.cos(o.yaw || 0), sy = Math.sin(o.yaw || 0), cp = Math.cos(o.pitch || 0), sp = Math.sin(o.pitch || 0);
    const f = o.f || 1000, X = o.cx ?? W / 2, Y = o.cy ?? H / 2;
    return {
      f,
      toCam(p) { const x = p[0] - px, y = p[1] - py, z = p[2] - pz; const x1 = x * cy - z * sy, z1 = x * sy + z * cy; return [x1, y * cp + z1 * sp, z1 * cp - y * sp]; },
      proj(c) { return [X + f * c[0] / c[2], Y - f * c[1] / c[2]]; },
    };
  };
  const NEAR = .35;
  B.path3 = (cam, pts, o = {}) => {
    const C = pts.map((p) => cam.toCam(p)); if (o.closed) C.push(C[0]);
    const runs = []; let cur = [];
    for (let i = 0; i < C.length; i++) {
      const c = C[i], cin = c[2] > NEAR;
      if (i === 0) { if (cin) cur.push(cam.proj(c)); continue; }
      const p = C[i - 1], pin = p[2] > NEAR;
      const cut = () => { const k = (p[2] - NEAR) / (p[2] - c[2]); return cam.proj([lerp(p[0], c[0], k), lerp(p[1], c[1], k), NEAR]); };
      if (pin && cin) cur.push(cam.proj(c));
      else if (pin) { cur.push(cut()); runs.push(cur); cur = []; }
      else if (cin) cur = [cut(), cam.proj(c)];
    }
    if (cur.length > 1) runs.push(cur);
    const oo = { ...o, closed: false };
    runs.forEach((r) => B.path(r, oo));
  };
  // ---- afterglow render: the shot's scene at t, plus K earlier instants, each dimmer ----
  B.render = (t) => {
    s.fillStyle = '#000'; s.fillRect(-W, -H, W * 3, H * 3);
    s.globalCompositeOperation = 'lighten';
    for (let k = B.K; k >= 0; k--) {
      const tk = t - k * B.DT;
      const sh = SHOTS.find((x) => tk >= x.a && tk < x.b) || (tk < SHOTS[0].a ? SHOTS[0] : SHOTS[SHOTS.length - 1]);
      B.I = k ? .78 * Math.pow(B.DEC, k) : 1; B.tk = tk; pid = 0; sAcc = 0; B.ph = 0; B.jit = 1; B.morph = 0; B.liss = null;
      if (k === 0) { FX = {}; Object.assign(FX, sh.fx); }
      s.save(); try { sh.fn.scene(tk, tk - sh.a, sh.b - sh.a); } catch (e) { console.error(sh.name, e); } s.restore();
    }
    s.globalCompositeOperation = 'source-over';
  };
  B.shot = (scene) => { const fn = (t) => B.render(t); fn.scene = scene; Object.defineProperty(fn, 'name', { value: scene.name }); return fn; };
  return B;
})();
