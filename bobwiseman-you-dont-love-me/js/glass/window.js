// The window: four pointed lancets in a stone wall, a sill, and a stone floor below. World units.
const NL = 4, LW = 800, GAP = 100, MARG = 150, YS = 780, YB = 2150, AR = LW * .85, BORD = 46;
const WIN_W = MARG * 2 + NL * LW + (NL - 1) * GAP; // 3800
const FLOOR_Y = 2560;
const lx = (i) => MARG + i * (LW + GAP);           // lancet left edge
const lcx = (i) => lx(i) + LW / 2;                  // lancet centre x

// Outline of lancet i inset by d, sampled with fixed counts so two insets pair up point for point.
const OCNT = [24, 14, 14, 24, 14];
function outline(i, d) {
  const a = lx(i) + d, b = lx(i) + LW - d, mid = lcx(i), yb = YB - d, r = AR - d, pts = [];
  const cL = lx(i) + AR, c = (mid - cL) / r, phA = TAU - Math.acos(clamp(c, -1, 1));
  for (let k = 0; k < OCNT[0]; k++) pts.push([a, lerp(yb, YS, k / OCNT[0])]);
  for (let k = 0; k < OCNT[1]; k++) { const ph = lerp(Math.PI, phA, k / OCNT[1]); pts.push([cL + r * Math.cos(ph), YS + r * Math.sin(ph)]); }
  const left = pts.slice(OCNT[0]);
  pts.push([mid, YS + r * Math.sin(phA)]);
  for (let k = OCNT[2] - 1; k >= 1; k--) { const [x, y] = left[k]; pts.push([2 * mid - x, y]); }
  pts.push([b, YS]);
  for (let k = 1; k <= OCNT[3]; k++) pts.push([b, lerp(YS, yb, k / OCNT[3])]);
  for (let k = 1; k < OCNT[4]; k++) pts.push([lerp(b, a, k / OCNT[4]), yb]);
  return pts;
}
const GEO = []; // per lancet: opening path, field path, border segments, quarries
function buildGeo() {
  for (let i = 0; i < NL; i++) {
    const o0 = outline(i, 0), o1 = outline(i, BORD), n = o0.length;
    const segs = [];
    for (let k = 0; k < n; k++) {
      const k2 = (k + 1) % n, q = [o0[k], o0[k2], o1[k2], o1[k]];
      const cx = (q[0][0] + q[2][0]) / 2, cy = (q[0][1] + q[2][1]) / 2;
      segs.push({ path: polyPath(q), cx, cy, seed: 1000 * i + k, k, q });
    }
    const quarries = [], fx0 = lx(i) + BORD, fx1 = lx(i) + LW - BORD;
    const qw = 56, qh = 82;
    for (let row = 0, cy = 140; cy < YB + qh; row++, cy += qh) {
      for (let cx = fx0 - qw * 2 + (row % 2) * qw; cx < fx1 + qw * 2; cx += qw * 2) {
        quarries.push({ path: polyPath([[cx - qw, cy], [cx, cy - qh], [cx + qw, cy], [cx, cy + qh]]), cx, cy, seed: 5000 + 700 * i + row * 31 + Math.round(cx), r: qh });
      }
    }
    GEO.push({ open: polyPath(o0), field: polyPath(o1), o0, o1, segs, quarries });
  }
}

// ---- falling glass and spreading cracks (the end of the song) ----
// Panes marked fallable crack after the heart, then drop out one by one; the lead stays.
function crackT(cx, cy) { const d = Math.hypot(cx - lcx(1), cy - 1240); return B.last2 + 1.2 + d / 4200 * 7; }
function fallT(seed) { return rnd(seed, 9) < .5 ? B.lastLove + .2 + rnd(seed, 10) * 7.2 : Infinity; }
// Returns null if the pane is in place, 'gone' once fallen, or a transform for a falling pane.
function fallState(seed, t) {
  const ft = fallT(seed); if (t < ft) return null;
  const dt = t - ft; if (dt > 1.1) return 'gone';
  return { dy: 1400 * dt * dt + 40 * dt, rot: (rnd(seed, 11) - .5) * 2.2 * dt, dx: (rnd(seed, 12) - .5) * 160 * dt, a: 1 - smooth(dt / 1.1) };
}
// Draw a fallable pane honouring its fall state; cracks drawn on it once its crack time passes.
function fpane(g, P, col, t, o = {}) {
  const fs = fallState(P.seed, t);
  if (fs === 'gone') { if (o.leadHole !== 0) lead(g, P.path, 7); return; }
  if (fs) {
    g.save(); g.globalAlpha = fs.a; g.translate(P.cx + fs.dx, P.cy + fs.dy); g.rotate(fs.rot); g.translate(-P.cx, -P.cy);
    pane(g, P.path, col, P.seed, o); g.restore(); if (o.leadHole !== 0) lead(g, P.path, 7); return;
  }
  pane(g, P.path, col, P.seed, o);
  const ct = crackT(P.cx, P.cy);
  if (t > ct) { // a crack line across the pane
    const u = clamp((t - ct) / .25), a = rnd(P.seed, 13) * Math.PI, L = (P.r || 40) * .8 * u;
    const x0 = P.cx - Math.cos(a) * L, y0 = P.cy - Math.sin(a) * L, x1 = P.cx + Math.cos(a) * L * .7, y1 = P.cy + Math.sin(a) * L * .7;
    g.lineCap = 'round'; g.strokeStyle = 'rgba(255,250,235,.75)'; g.lineWidth = 2.2;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(P.cx + 4, P.cy - 3); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = 'rgba(20,10,10,.6)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x0 + 2, y0 + 2); g.lineTo(P.cx + 6, P.cy - 1); g.lineTo(x1 + 2, y1 + 2); g.stroke();
  }
}

// Quarry background (a diamond lattice, each with a small painted ring and dot).
function drawQuarries(g, i, col, t, view, motif = true) {
  for (const Q of GEO[i].quarries) {
    if (Q.cx < view.x0 - 80 || Q.cx > view.x1 + 80 || Q.cy < view.y0 - 100 || Q.cy > view.y1 + 100) continue;
    fpane(g, Q, col, t, { ew: 22, shade: .34 });
    if (motif && !fallState(Q.seed, t)) {
      paint(g, 3, .55); g.beginPath(); g.arc(Q.cx, Q.cy, 15, 0, TAU); g.stroke();
      g.fillStyle = 'rgba(42,24,12,.6)'; g.beginPath(); g.arc(Q.cx, Q.cy, 4.5, 0, TAU); g.fill();
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; g.beginPath(); g.arc(Q.cx + Math.cos(a) * 30, Q.cy + Math.sin(a) * 44, 3, 0, TAU); g.fill(); }
    }
  }
}
// Border band: alternating ruby / gold / blue / gold pieces, a white pearl on every blue one.
const BCOL = [C.ruby, C.gold, C.blue, C.gold];
function drawBorder(g, i, t, view) {
  for (const S of GEO[i].segs) {
    if (S.cx < view.x0 - 80 || S.cx > view.x1 + 80 || S.cy < view.y0 - 80 || S.cy > view.y1 + 80) continue;
    const col = BCOL[S.k % 4];
    fpane(g, S, col, t, { ew: 14, shade: .3, lw: 8 });
    if (S.k % 4 === 2 && !fallState(S.seed, t)) { const p = circPath(S.cx, S.cy, 11); pane(g, p, C.white, S.seed + 3, { ew: 8, lw: 5 }); }
  }
}
// Arch-top rosette for the figure lancets.
function drawRosette(g, i, t, cols) {
  const cx = lcx(i), cy = 470, R = 120;
  pane(g, circPath(cx, cy, R), cols[0], 70 + i, { ew: 30 });
  for (let k = 0; k < 8; k++) {
    const a = k * TAU / 8 + Math.PI / 8, p = new Path2D();
    p.ellipse(cx + Math.cos(a) * 66, cy + Math.sin(a) * 66, 46, 24, a, 0, TAU);
    pane(g, p, k % 2 ? cols[1] : cols[2], 80 + i * 10 + k, { ew: 14 });
  }
  pane(g, circPath(cx, cy, 30), C.gold, 99 + i, { ew: 12 });
}

// Stone wall with the four openings cut out, hood mouldings, mullions and the sill.
function drawWall(g, view, L) {
  const p = new Path2D(); p.rect(view.x0 - 50, view.y0 - 50, view.x1 - view.x0 + 100, Math.min(view.y1, FLOOR_Y) - view.y0 + 100);
  for (let i = 0; i < NL; i++) p.addPath(GEO[i].open);
  const base = mix([18, 16, 15], [64, 58, 52], L);
  g.fillStyle = rgb(base); g.fill(p, 'evenodd');
  // ashlar courses
  g.save(); g.clip(p, 'evenodd');
  g.strokeStyle = `rgba(0,0,0,${.35})`; g.lineWidth = 4;
  const ch = 130;
  for (let y = Math.floor(view.y0 / ch) * ch; y < Math.min(view.y1, FLOOR_Y); y += ch) {
    g.beginPath(); g.moveTo(view.x0 - 50, y); g.lineTo(view.x1 + 50, y); g.stroke();
    const off = (Math.round(y / ch) % 2) * 170;
    for (let x = Math.floor((view.x0 - off) / 340) * 340 + off; x < view.x1 + 50; x += 340) {
      g.beginPath(); g.moveTo(x + (rnd(x, y) - .5) * 30, y); g.lineTo(x + (rnd(x, y) - .5) * 30, y + ch); g.stroke();
    }
  }
  // light spill around the window: the reveal glows faintly with the colour coming through
  g.globalCompositeOperation = 'screen';
  for (let i = 0; i < NL; i++) {
    const rg = g.createRadialGradient(lcx(i), 1300, 300, lcx(i), 1300, 1150);
    rg.addColorStop(0, `rgba(150,120,110,${.22 * L})`); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.fillRect(lcx(i) - 1200, 100, 2400, 2500);
  }
  g.restore();
  // hood moulding and chamfer around each opening
  for (let i = 0; i < NL; i++) {
    g.lineJoin = 'round';
    g.lineWidth = 34; g.strokeStyle = rgb(mix(base, [150, 140, 128], .35)); g.stroke(GEO[i].open);
    g.lineWidth = 10; g.strokeStyle = 'rgba(0,0,0,.5)'; g.stroke(GEO[i].open);
  }
  // sill
  const sc = mix(base, [170, 160, 146], .3);
  g.fillStyle = rgb(sc); g.fillRect(view.x0 - 50, YB + 16, view.x1 - view.x0 + 100, 60);
  g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(view.x0 - 50, YB + 70, view.x1 - view.x0 + 100, 14);
}

// Stone floor in front of the wall (a frontal view, flags converging on a vanishing point at window height).
function drawFloor(g, view, L, tod) {
  if (view.y1 < FLOOR_Y) return;
  const y0 = FLOOR_Y, y1 = view.y1 + 50, vx = WIN_W / 2, vy = 900;
  g.fillStyle = rgb(mix([14, 12, 12], [58, 52, 47], L)); g.fillRect(view.x0 - 50, y0, view.x1 - view.x0 + 100, y1 - y0);
  g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(view.x0 - 50, y0, view.x1 - view.x0 + 100, 10);
  g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 5;
  for (let k = -24; k <= 24; k++) { // joints running toward us
    const xa = vx + k * 380, ya = y0, s = (y1 - vy) / (ya - vy);
    g.beginPath(); g.moveTo(xa, ya); g.lineTo(vx + (xa - vx) * s, y1); g.stroke();
  }
  for (let k = 1; k < 12; k++) { const y = y0 + (Math.pow(1.45, k) - 1) * 90; if (y > y1) break; g.beginPath(); g.moveTo(view.x0 - 50, y); g.lineTo(view.x1 + 50, y); g.stroke(); }
}
