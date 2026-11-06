// inked3d kit, plate marks (opt-in, under test, rheos/secondunit-videos#417). Tools that build a plate out of many small
// flat hard-edged dabs at several scales, clumped into light and shadow shapes, the way The Moss Keeper's plates are
// built. Nothing loads this unless a page asks for it. A project's marks page repaints its plates with these at bake time.
const MARKSTAT = { dabs: 0 };
window.__marks = MARKSTAT;
const dabOn = (P, x, y, a, L, wd) => { const c = Math.cos(a), s = Math.sin(a), ax = c * L * .5, ay = s * L * .5, bx = -s * wd * .5, by = c * wd * .5; P.moveTo(x - ax, y - ay); P.lineTo(x - ax * .15 + bx, y - ay * .15 + by); P.lineTo(x + ax, y + ay); P.lineTo(x - ax * .15 - bx, y - ay * .15 - by); P.closePath(); MARKSTAT.dabs++; };
const flushDabs = (g, pal, paths) => { paths.forEach((P, i) => { g.fillStyle = css(pal[i]); g.fill(P); }); };
// One mass (a tree crown, a bush, a drift): dabs at several scales, large and dark first, fine and light last. Tone comes
// from the form (lit side) plus a low-frequency clump noise, so dabs gather into shapes rather than an even texture.
// o: { sq, lx, ly, seed, scales: [[len, wid, cover]], clump (px), clumpAmp, jit, lift, ang, angJ, rag }
function crown(g, cx, cy, R, pal, R0, o = {}) {
  const sq = o.sq ?? .8, lx = o.lx ?? .5, ly = o.ly ?? .9, seed = o.seed ?? 7, cs = 1 / (o.clump ?? Math.max(9, R * .42)), amp = o.clumpAmp ?? 1, jit = o.jit ?? .14, ang = o.ang ?? -.9, angJ = o.angJ ?? 1.5, rag = o.rag ?? .42, lift = o.lift ?? 0;
  const scales = o.scales ?? [[9, 5.5, .9], [5, 3, 1], [2.8, 1.8, .55]], area = Math.PI * R * R * sq;
  scales.forEach(([L, Wd, cover], si) => {
    const P = pal.map(() => new Path2D()), n = Math.round(cover * area / (L * Wd * .5)), fine = si / Math.max(1, scales.length - 1);
    for (let i = 0; i < n; i++) {
      const a = R0() * TAU, r = Math.sqrt(R0());
      if (r > (1 - rag) + rag * 1.3 * vn2(Math.cos(a) * 1.9 + cx * .03, Math.sin(a) * 1.9 + cy * .03, seed)) continue;
      const nx = Math.cos(a) * r, ny = Math.sin(a) * r, x = cx + nx * R, y = cy + ny * R * sq;
      const cl = fbm2(x * cs, y * cs, seed + 1) - .5, v = .47 - ly * .42 * ny + lx * .26 * nx + cl * 1.5 * amp + (R0() - .5) * jit * 2 + lift - (1 - fine) * .16;
      const t = Math.min(pal.length - 1, Math.floor(clamp(v) * pal.length));
      dabOn(P[t], x, y, ang + (R0() - .5) * angJ, L * (.7 + R0() * .6), Wd * (.7 + R0() * .6));
    }
    flushDabs(g, pal, P);
  });
}
// A trunk from the kit's barkTrunk with short vertical bark marks laid only on its own painted pixels.
// o: barkTrunk's options, plus bark (3 to 5 tones, dark to light), cover, patches (growth clumps), patchPal and edge (ink px)
function markedTrunk(g, x, y0, y1, w, lean, tones, R0, o = {}) {
  const [tc, t] = plateCanvas(); barkTrunk(t, x, y0, y1, w, lean, tones, R0, { ...o, ivy: 0 });
  t.globalCompositeOperation = 'source-atop';
  const pal = o.bark, P = pal.map(() => new Path2D()), side = o.litSide ?? .7, n = Math.round((o.cover ?? 1.3) * (y1 - y0) * w * 1.25 / 11);
  for (let i = 0; i < n; i++) {
    const y = lerp(y0, y1, R0()), u = R0() - .5, cx = x + lean * (y1 - y) + u * w * 1.25, v = .44 + u * side * 1.05 + (fbm2(cx * .05, y * .012, 151) - .5) * 1.35 + (R0() - .5) * .14;
    dabOn(P[Math.min(pal.length - 1, Math.floor(clamp(v) * pal.length))], cx, y, Math.PI / 2 + (R0() - .5) * .16, 6 + R0() * 11, 1.5 + R0() * 1.3);
  }
  flushDabs(t, pal, P); t.globalCompositeOperation = 'source-over';
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (o.edge) { const k = canvas(tc.width, tc.height), q = k.getContext('2d'); q.drawImage(tc, 0, 0); q.globalCompositeOperation = 'source-in'; q.fillStyle = '#080a0c'; q.fillRect(0, 0, k.width, k.height); g.drawImage(k, side > 0 ? -o.edge : o.edge, 0); } // a ragged ink edge down the shade side
  g.drawImage(tc, 0, 0); g.restore();
  // growth climbing the trunk: irregular runs of small clumps that hug it, not round balls
  if (o.patches) for (let i = 0; i < o.patches; i++) { let y = lerp(y0 + (y1 - y0) * .16, y1 - 20, R0()), ux = x + lean * (y1 - y) + (R0() - .5) * w * .8; if (fbm2(ux * .02, y * .007, 153) < .47) continue; const run = 2 + Math.floor(R0() * 5);
    for (let k = 0; k < run; k++) { crown(g, ux, y, 5 + R0() * 8, o.patchPal, R0, { sq: 1.15, seed: 155, rag: .7, ly: .5, lx: side * .5, clump: 6, clumpAmp: 1.2, jit: .2, lift: -.08, scales: [[4.6, 3, 1], [2.6, 1.8, .8]] }); y += 6 + R0() * 12; ux += (R0() - .5) * 11; } }
}
// A long hanging strand: many small leaf pairs, varied tone.
function fineFrond(g, x, y, len, sw, pal, R0, o = {}) {
  const P = pal.map(() => new Path2D()), n = Math.round(len / (o.step ?? 5.2));
  for (let i = 0; i < n; i++) { const k = i / n, cx = x + sw * k * k, cy = y + len * k, s = lerp(o.s0 ?? 13, o.s1 ?? 7, k) * (.8 + R0() * .4), t = Math.min(pal.length - 1, Math.floor(R0() * R0() * pal.length));
    for (const dir of [-1, 1]) { const a = Math.PI / 2 - dir * (1.0 + (R0() - .5) * .35); dabOn(P[t], cx + Math.cos(a) * s * .5, cy + Math.sin(a) * s * .5, a, s, s * .42); } }
  flushDabs(g, pal, P);
}
