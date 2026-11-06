// Mark-making on the master paste-up: fineliner strokes that draw themselves on, typewriter strikes,
// rub-down transfer lettering, a felt marker. Everything is black on white; the copier does the rest.
const TYPE_FONT = '{s}px "Courier New", Courier, monospace';
const LETRA_FONT = '{s}px "LetraBC", "Helvetica Neue", Helvetica, sans-serif';
const HAND_FONT = '{s}px "Marker Felt", "Chalkboard SE", sans-serif';

const pr = (t, t0, d) => clamp((t - t0) / d);

// --- fineliner -------------------------------------------------------------------------------------
function wob(pts, seed, amp = 1.6, freq = .045) { // hand wobble along the path (deterministic)
  let L = 0; return pts.map((p, i) => { if (i) L += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]); return [p[0] + n1(seed, L * freq) * amp, p[1] + n1(seed + 9.1, L * freq) * amp]; });
}
function seg(x0, y0, x1, y1, n = 8) { const a = []; for (let i = 0; i <= n; i++) a.push([lerp(x0, x1, i / n), lerp(y0, y1, i / n)]); return a; }
function ell(cx, cy, rx, ry = rx, a0 = 0, a1 = TAU, n = 0) { n = n || Math.max(10, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) / 10)); const a = []; for (let i = 0; i <= n; i++) { const u = lerp(a0, a1, i / n); a.push([cx + Math.cos(u) * rx, cy + Math.sin(u) * ry]); } return a; }
function quad(p0, p1, p2, n = 16) { const a = []; for (let i = 0; i <= n; i++) { const u = i / n, v = 1 - u; a.push([v * v * p0[0] + 2 * v * u * p1[0] + u * u * p2[0], v * v * p0[1] + 2 * v * u * p1[1] + u * u * p2[1]]); } return a; }
function poly(pts, closed = false) { const a = []; for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) { const p = pts[i], q = pts[(i + 1) % pts.length], n = Math.max(2, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / 12)); for (let k = 0; k < n; k++) a.push([lerp(p[0], q[0], k / n), lerp(p[1], q[1], k / n)]); } a.push(closed ? pts[0] : pts[pts.length - 1]); return a; }

// draw a polyline up to fraction prog of its length
function pen(g, pts, prog = 1, w = 5, seed = 0, amp = 1.6) {
  if (prog <= 0 || pts.length < 2) return;
  const q = seed === null ? pts : wob(pts, seed, amp);
  let L = 0; const cum = [0]; for (let i = 1; i < q.length; i++) { L += Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]); cum.push(L); }
  const stop = L * clamp(prog);
  g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#000';
  g.beginPath(); g.moveTo(q[0][0], q[0][1]);
  for (let i = 1; i < q.length; i++) {
    if (cum[i] <= stop) g.lineTo(q[i][0], q[i][1]);
    else { const u = (stop - cum[i - 1]) / (cum[i] - cum[i - 1] || 1); g.lineTo(lerp(q[i - 1][0], q[i][0], u), lerp(q[i - 1][1], q[i][1], u)); break; }
  }
  g.stroke();
}
// parallel hatching inside a polygon (clip), drawn on from one side
function hatch(g, outline, ang, gap, prog = 1, w = 3, seed = 0) {
  if (prog <= 0) return;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of outline) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  g.save(); g.beginPath(); outline.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.clip();
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 4, c = Math.cos(ang), s = Math.sin(ang);
  const n = Math.ceil(2 * R / gap), m = Math.ceil(n * clamp(prog));
  for (let i = 0; i < m; i++) { const o = -R + i * gap + rnd(seed, i) * gap * .3; pen(g, seg(cx - c * R - s * o, cy - s * R + c * o, cx + c * R - s * o, cy + s * R + c * o, 6), 1, w, seed + i * 3.3, 1.2); }
  g.restore();
}
function fillPoly(g, pts) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); }

// --- typewriter ------------------------------------------------------------------------------------
// One strike: the typebar lands a hair off (baseline and tilt), the ribbon gives uneven ink, worn
// slugs fill in. Drawn twice with a small offset for the ribbon's spread.
function strike(g, ch, x, y, fs, seed) {
  if (ch === ' ') return;
  const dy = (rnd(seed, 1) - .5) * fs * .045, dx = (rnd(seed, 2) - .5) * fs * .02, rot = (rnd(seed, 3) - .5) * .022;
  const ink = .9 + rnd(seed, 4) * .1;
  g.save(); g.translate(x + dx, y + dy); g.rotate(rot);
  g.font = TYPE_FONT.replace('{s}', fs);
  g.fillStyle = `rgba(0,0,0,${ink})`; g.fillText(ch, 0, 0);
  g.strokeStyle = `rgba(0,0,0,${ink * .9})`; g.lineWidth = fs * .03; g.strokeText(ch, 0, 0); // the ribbon's bleed
  g.fillText(ch, fs * .012, fs * .006);
  // uneven strike: one edge of the slug hits lighter
  const r = rnd(seed, 5);
  if (r < .35) { g.fillStyle = `rgba(255,255,255,${.12 + rnd(seed, 6) * .18})`; const top = rnd(seed, 7) < .5; g.fillRect(-fs * .1, top ? -fs * .8 : -fs * .25, fs * .8, fs * .45); }
  g.restore();
}

// --- rub-down transfer lettering ---------------------------------------------------------------------
// Letters go down one at a time by hand: uneven spacing, a slight lean, a hairline crack or a chip where
// the film didn't let go. rubbed: 0..1 per letter (half-rubbed letters are speckled grey).
function letraWord(g, str, x, y, fs, t, t0, dt, seed, opts = {}) {
  g.save(); g.font = LETRA_FONT.replace('{s}', fs); g.textBaseline = 'alphabetic';
  let cx = x; const out = [];
  for (let i = 0; i < str.length; i++) {
    const ch = str[i], w = g.measureText(ch).width, sp = opts.track || fs * .02;
    if (ch !== ' ') {
      const ta = t0 + i * dt, u = opts.rub === false ? (t >= ta ? 1 : 0) : clamp((t - ta) / .08);
      if (u > 0) {
        const s = seed + i * 7.7, oy = (rnd(s, 1) - .5) * fs * .035, ox = (rnd(s, 2) - .5) * fs * .03, rot = (rnd(s, 3) - .5) * .03;
        g.save(); g.translate(cx + ox + w / 2, y + oy); g.rotate(rot);
        g.fillStyle = '#000'; g.globalAlpha = u < 1 ? .35 + .5 * u : 1; g.fillText(ch, -w / 2, 0); g.globalAlpha = 1;
        // cracks and chips: knocked out in white (paint white: the master is opaque white paper)
        g.strokeStyle = g.fillStyle = '#fff'; g.lineWidth = Math.max(1.5, fs * .012);
        const nc = rnd(s, 4) < .55 ? 1 + Math.floor(rnd(s, 5) * 2) : 0;
        for (let k = 0; k < nc; k++) { const yy = -fs * (.15 + rnd(s, 10 + k) * .5), a = (rnd(s, 20 + k) - .5) * .6; g.beginPath(); g.moveTo(-w * .6, yy); g.lineTo(-w * .1, yy + Math.sin(a) * w * .3); g.lineTo(w * .6, yy + Math.sin(a) * w * .5); g.stroke(); }
        if (rnd(s, 6) < .3) { g.beginPath(); g.arc((rnd(s, 7) - .5) * w * .7, -fs * rnd(s, 8) * .7, fs * (.02 + rnd(s, 9) * .03), 0, TAU); g.fill(); }
        g.fillStyle = '#fff';
        if (u < 1) { const ns = 30; for (let k = 0; k < ns; k++) { g.beginPath(); g.arc((rnd(s, 40 + k) - .5) * w, -rnd(s, 80 + k) * fs * .75, fs * .025, 0, TAU); g.fill(); } }
        g.restore();
      }
    }
    out.push([cx, cx + w]); cx += w + sp + (rnd(seed + i, 11) - .5) * fs * .04;
  }
  g.restore(); return { x0: x, x1: cx, chars: out };
}
function letraWidth(g, str, fs, opts = {}) { g.save(); g.font = LETRA_FONT.replace('{s}', fs); let w = 0; for (const ch of str) w += g.measureText(ch).width + (opts.track || fs * .02); g.restore(); return w; }

// --- felt marker ----------------------------------------------------------------------------------
function marker(g, pts, prog, w = 10, seed = 0) {
  if (prog <= 0) return;
  pen(g, pts, prog, w, seed, 2.2);
  pen(g, pts.map(p => [p[0] + 1.5, p[1] + 2.5]), prog * .97, w * .55, seed + 3, 2.2); // the second pass of a dry marker
}
