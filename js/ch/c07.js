// c07 · CHORUS 3 (SEC.c3 127.967 - SEC.v3b 142.48) · the starry sky. No hands: the sky claps.
// CLAPS[8] stars burst into lilies of light; CLAPS[9] the moon clock's hands meet at the top;
// CLAPS[10] a constellation snaps into a giant lily; CLAPS[11] the oars slap the Milky Way.
// Ends drifting down the falling Milky Way into the lantern of a theatre dome (c08 opens inside it).
(() => {
  // ---- private helpers ----
  const lighter = (fn) => { f.save(); f.globalCompositeOperation = 'lighter'; fn(); f.restore(); };
  const fDot = (x, y, r, col) => lighter(() => { f.fillStyle = col; f.beginPath(); f.arc(x, y, Math.max(.3, r), 0, TAU); f.fill(); });
  const fLine = (pts, w, col) => lighter(() => { f.lineCap = 'round'; f.lineJoin = 'round'; f.lineWidth = w; f.strokeStyle = col; P(f, pts); f.stroke(); });
  // radial rays of light on f
  function rays(x, y, n, r0, r1, a, rot = 0, col = '255,225,160', wid = .06) {
    if (a <= .01) return;
    lighter(() => {
      const g = f.createRadialGradient(x, y, r0, x, y, r1); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); f.fillStyle = g;
      for (let i = 0; i < n; i++) { const an = rot + i / n * TAU, w = wid * (i % 2 ? .6 : 1); f.beginPath(); f.moveTo(x + Math.cos(an - w) * r0, y + Math.sin(an - w) * r0); f.lineTo(x + Math.cos(an) * r1, y + Math.sin(an) * r1); f.lineTo(x + Math.cos(an + w) * r0, y + Math.sin(an + w) * r0); f.closePath(); f.fill(); }
    });
  }
  // a four-point star with concave sides
  function starPts(x, y, r, rot = 0) {
    const o = [];
    for (let i = 0; i < 4; i++) { const a0 = rot + i / 4 * TAU, a1 = rot + (i + 1) / 4 * TAU, am = (a0 + a1) / 2;
      const p0 = [x + Math.cos(a0) * r, y + Math.sin(a0) * r], p3 = [x + Math.cos(a1) * r, y + Math.sin(a1) * r], c = [x + Math.cos(am) * r * .16, y + Math.sin(am) * r * .16];
      o.push(...cub(p0, c, c, p3, 8).slice(0, -1)); }
    return o;
  }
  function star(x, y, r, rot, col = C.gold, lit = .6) {
    shape(s, starPts(x, y, r, rot), col, C.umber, Math.max(8, r * .2));
    if (lit > 0) { glowAt(x, y, r * 3.2, `rgba(255,228,170,${.45 * lit})`); glowAt(x, y, r * .9, `rgba(255,250,230,${.7 * lit})`); }
  }
  // the night sky: gradient, painted wisps, far stars on the light layer (parallax by camera point)
  function sky(t, cx, cy, y0, y1, { seed = 3, nf = 170, ns = 22, wisps = 1 } = {}) {
    s.fillStyle = vgrad(y0, y1, [[0, '#18223a'], [.5, C.night], [1, C.dusk]]); s.fillRect(-W * 2, y0 - H * 2, W * 5, (y1 - y0) + H * 4);
    // whiplash cloud wisps, slowly drifting
    if (wisps) for (let i = 0; i < 5; i++) {
      const r = rng(seed * 31 + i), wx = r() * 1400 - 160 + Math.sin(t * .2 + i) * 40, wy = lerp(y0, y1, .2 + r() * .75), dir = i % 2 ? 1 : -1, L = 380 + r() * 300;
      vine(s, whip([wx - dir * L, wy + 40], [wx - dir * L * .3, wy - 60], [wx + dir * L * .2, wy + 50], [wx + dir * L * .45, wy - 30], .8, dir, 34), 64, 16, i % 2 ? '#5a4a6e' : C.dusk, 1);
    }
    const r = rng(seed);
    lighter(() => {
      for (let i = 0; i < nf; i++) {
        const par = .55 + r() * .35, x = r() * 1500 - 210 + (cx - 540) * (1 - par), y = lerp(y0, y1, r()) + (cy - 960) * (1 - par), rr = 1.6 + r() * 3.4;
        const tw = .45 + .55 * (.5 + .5 * Math.sin(t * (1.5 + r() * 3) + r() * 9)); f.fillStyle = `rgba(230,236,255,${.85 * tw})`; f.beginPath(); f.arc(x, y, rr, 0, TAU); f.fill();
      }
    });
    for (let i = 0; i < ns; i++) { const x = r() * 1300 - 110, y = lerp(y0, y1, r()), rr = 16 + r() * 18, tw = .5 + .5 * Math.sin(t * 2.3 + i * 1.7); star(x, y, rr * (.9 + .1 * tw), t * .1 + i, i % 3 ? C.cream : C.gold, .3 + .4 * tw); }
  }
  // the row stroke from the beat grid: pull on even beats, recover (blade lifted) on odd ones
  function rowPhase(t) {
    const b = FEAT.beats, i = Math.max(0, lastBeat(t)), t0 = b[i], t1 = b[i + 1] || t0 + .5, u = clamp((t - t0) / (t1 - t0));
    return i % 2 === 0 ? { sweep: lerp(1, -1, ease.out(u)), lift: 0, dip: hit(t, t0, 5) } : { sweep: lerp(-1, 1, ease.inOut(u)), lift: Math.sin(Math.PI * u) * .7, dip: 0 };
  }
  // an empty wooden rowboat, side view, bow to +x; its oars row by themselves; a lantern hangs at the bow
  function boat(t, x, y, sc, { rot = 0, row = rowPhase(t), lamp = 1 } = {}) {
    const c = Math.cos(rot), sn = Math.sin(rot), R = ([px, py]) => [x + (px * c - py * sn) * sc, y + (px * sn + py * c) * sc];
    const lw = Math.max(10, sc * .045);
    const oar = (side) => { // side 1 = near, -1 = far
      const lock = [.04 - side * .02, -.12 - (side < 0 ? .05 : 0)], a = Math.PI / 2 - row.sweep * .75;
      let end = [lock[0] + Math.cos(a) * .66, lock[1] + Math.sin(a) * .66 - row.lift * .3], hdl = [lock[0] - Math.cos(a) * .2, lock[1] - Math.sin(a) * .2 + row.lift * .08];
      const shaft = [R(hdl), R(lock), R(end)], ang = Math.atan2(shaft[2][1] - shaft[1][1], shaft[2][0] - shaft[1][0]);
      vine(s, shaft, lw * .9, lw * .8, side > 0 ? C.parch : C.ochre);
      petal(s, ...shaft[2], ang, sc * .2, sc * .06, side > 0 ? C.gold : C.ochre, C.umber, lw * .8);
      return [shaft[2][0] + Math.cos(ang) * sc * .2, shaft[2][1] + Math.sin(ang) * sc * .2];
    };
    oar(-1);
    // interior (far side of the hull seen from a little above)
    shape(s, [R([-.5, -.03]), ...cub(R([-.5, -.03]), R([-.2, -.15]), R([.25, -.2]), R([.52, -.2]), 16), ...cub(R([.52, -.2]), R([.25, -.1]), R([-.2, -.04]), R([-.5, -.03]), 16)], '#6b4a2c', C.umber, lw);
    // hull side
    const hull = [...cub(R([-.5, -.03]), R([-.15, -.06]), R([.3, -.1]), R([.55, -.21]), 18), ...cub(R([.55, -.21]), R([.5, .1]), R([-.1, .2]), R([-.46, .1]), 18), R([-.5, -.03])];
    shape(s, hull, C.ochre, C.umber, lw * 1.2);
    vine(s, cub(R([-.48, .04]), R([-.1, .03]), R([.3, -.02]), R([.52, -.12]), 20), lw * .9, lw * .6, C.gold);
    // the prow scroll and the lantern on a hooked pole
    vine(s, whip(R([.55, -.21]), R([.6, -.3]), R([.66, -.36]), R([.62, -.44]), .5, -1, 20), lw * .9, lw * .5, C.ochre);
    const pole = cub(R([.4, -.17]), R([.42, -.5]), R([.62, -.62]), R([.72, -.56]), 20); vine(s, pole, lw * .6, lw * .5, C.umber, 1, null);
    const lx = pole[pole.length - 1][0], ly = pole[pole.length - 1][1] + sc * .1, sw = Math.sin(t * 2.4) * sc * .02;
    shape(s, blobPts(lx + sw, ly, sc * .045, sc * .07, 4, .02, 20), C.amber, C.umber, lw * .7);
    if (lamp > 0) { glowAt(lx + sw, ly, sc * .9, `rgba(255,170,80,${.4 * lamp})`); glowAt(lx + sw, ly, sc * .14, `rgba(255,240,200,${.9 * lamp})`); }
    const tip = oar(1);
    if (row.dip > .05) { glowAt(tip[0], tip[1], sc * .35 * row.dip + 10, `rgba(220,235,255,${.6 * row.dip})`); }
    return tip;
  }

  // ---- shots ----
  // CLAP 9 (127.967): following the little rowboat up into the stars; the stars burst open into lilies of light
  function bloom(t, lt, dur) {
    const k = CLAPS[8], k2 = HANDS[8];
    const cx = 540 + Math.sin(t * .4) * 20, cy = kf(lt, [[0, 1180], [dur, 820]], ease.out), z = kf(lt, [[0, 1.08], [dur, 1.0]], ease.out);
    cam(cx, cy, z, Math.sin(t * .3) * .015);
    sky(t, cx, cy, -300, 2200, { seed: 5 });
    // the great halo moon, the same one the next shot pushes into
    halo(700, 420, 300, t * .05, .3 + .2 * hit(t, k, 1.5));
    rays(700, 420, 24, 320, 560, .1 + .12 * beatPulse(t, 4), t * .05);
    // two waves of star-lilies: the clap opens the near ring, the sung "hands" the outer one
    const r = rng(77);
    for (let i = 0; i < 18; i++) {
      const wave = i < 9 ? 0 : 1, a = r() * TAU, d = wave ? 420 + r() * 320 : 210 + r() * 220;
      const x = 540 + Math.cos(a) * d * 1.1, y = 1000 + Math.sin(a) * d * 1.35 - lt * 40, t0 = (wave ? k2 : k) + r() * .18;
      const op = ease.back(inv(t0, t0 + .55, t)), sz = lerp(28, wave ? 150 : 185, op), rot = -Math.PI / 2 + Math.cos(a) * .5 + Math.sin(t * .7 + i) * .08;
      if (op <= .02) { star(x, y, 26, t * .2 + i, C.cream, .5); continue; }
      glowAt(x, y, sz * 1.7, `rgba(255,224,160,${.1 + .28 * hit(t, t0, 2.5)})`);
      lily(s, x, y, rot, sz, op, wave ? [C.cream, C.blush] : [C.gold, C.cream]);
      glowAt(x, y, sz * .35, `rgba(255,248,225,${.3 + .4 * hit(t, t0, 4)})`);
      rays(x, y, 8, sz * .5, sz * 1.7, .4 * hit(t, t0, 3), rot);
    }
    boat(t, 520 + Math.sin(t * .6) * 30, kf(lt, [[0, 1300], [dur, 1040]], ease.out), 520, { rot: -.05 + Math.sin(t * 1.3) * .04 });
    glowAt(540, 1000, 700, `rgba(255,230,180,${.15 * hit(t, k, 2)})`);
    border(t, 1);
  }
  // CLAP 10 (131.867): push into the moon: it is a clock face with no numerals; its two hands swing up and meet at the top
  function moonclock(t, lt, dur) {
    const k = CLAPS[9], k2 = HANDS[9], cx = 540, cy = 880;
    cam(cx, kf(lt, [[0, 960], [dur, 860]]), kf(lt, [[0, .96], [.95, 1.04], [dur, 1.16]], ease.inOut), Math.sin(t * .25) * .012);
    sky(t, cx, 900, -400, 2300, { seed: 9, ns: 14 });
    const R = 470, rot = t * .06, flash = hit(t, k, 3.5), flare = hit(t, k2, 2.5);
    halo(cx, cy, R, rot, .45 + .5 * flash + .3 * flare);
    rays(cx, cy, 28, R * 1.02, R * 1.75, .14 + .45 * flash + .25 * flare, rot);
    // twelve gem studs (no numerals), lighting one by one after the hands meet
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU - Math.PI / 2, gx = cx + Math.cos(a) * R * .6, gy = cy + Math.sin(a) * R * .6, big = i % 3 === 0;
      petal(s, gx - Math.cos(a) * (big ? 34 : 24), gy - Math.sin(a) * (big ? 34 : 24), a, big ? 68 : 48, big ? 22 : 15, big ? C.rose : C.sage, C.umber, 9);
      const on = clamp(inv(k2 + i * .06, k2 + i * .06 + .15, t)) * (.5 + .5 * flare) + .25 * flash;
      if (on > .02) glowAt(gx, gy, 80, `rgba(255,220,170,${.5 * on})`);
    }
    // the hands: they start apart and accelerate together into the top; a spring bounce; then they turn as one
    const sw = ease.in(inv(k - .95, k, t)), bounce = t > k ? Math.sin((t - k) * 22) * .12 * Math.exp(-(t - k) * 6) : 0, turn = Math.max(0, t - (k2 + .5)) * .35;
    const aMin = lerp(-1.25, 0, sw) + bounce + turn, aHr = lerp(1.6, 0, sw) - bounce * .8 + turn;
    clockHand(cx, cy, aHr, R * .48, C.gold); clockHand(cx, cy, aMin, R * .62, C.parch);
    shape(s, circle(cx, cy, 34, 28), C.ruby, C.umber, 12); shape(s, circle(cx, cy, 12, 16), C.amber, null);
    // the meeting flash at the top
    const tipX = cx + Math.sin(aMin) * R * .62, tipY = cy - Math.cos(aMin) * R * .62;
    glowAt(tipX, tipY, 560 * flash + 60 * flare + 1, `rgba(255,245,210,${.95 * flash + .4 * flare})`);
    rays(tipX, tipY, 12, 20, 520 * flash + 40, .8 * flash, .2);
    glowAt(cx, cy, R * 1.4, `rgba(255,220,160,${.25 * flash})`);
    // the rowboat crosses the lower rim of the moon after the clap
    if (t > k2) boat(t, kf(t, [[k2, -260], [k2 + 3.0, 1300]], ease.sine), 1330 + Math.sin(t * 1.4) * 10, 190, { rot: -.04 });
    border(t, 1);
  }
  function clockHand(cx, cy, ang, len, col) {
    const prof = [[-.18, .06], [-.06, .11], [.08, .07], [.42, .045], [.6, .06], [.68, .15], [.79, .16], [.88, .09], [.94, .03], [1, 0]];
    const p = (al, sd) => [cx + Math.sin(ang) * al * len + Math.cos(ang) * sd * len, cy - Math.cos(ang) * al * len + Math.sin(ang) * sd * len];
    shape(s, [...prof.map(([a, w]) => p(a, w)), ...prof.slice().reverse().map(([a, w]) => p(a, -w))], col, C.umber, 13);
    shape(s, circle(...p(.78, 0), len * .04, 16), C.deep, C.umber, 8);
    shape(s, circle(...p(-.12, 0), len * .05, 16), C.deep, C.umber, 8);
  }
  // CLAP 11 (135.9): scattered stars rush in and the constellation lines snap into place: a giant lily
  const LILY = (() => {
    const base = [540, 1180], nodes = [base], loops = [];
    [[-1.05, 430], [-.52, 560], [0, 660], [.52, 560], [1.05, 430]].forEach(([a, L]) => {
      const an = -Math.PI / 2 + a, d = [Math.cos(an), Math.sin(an)], nn = [-d[1], d[0]], w = L * .2;
      const i = nodes.length;
      nodes.push([base[0] + d[0] * L * .5 + nn[0] * w, base[1] + d[1] * L * .5 + nn[1] * w], [base[0] + d[0] * L, base[1] + d[1] * L], [base[0] + d[0] * L * .5 - nn[0] * w, base[1] + d[1] * L * .5 - nn[1] * w]);
      loops.push([0, i, i + 1, i + 2, 0]);
    });
    const s0 = nodes.length; nodes.push([525, 1420], [535, 1640], [560, 1860], [650, 1370], [800, 1420], [665, 1470], [430, 1590], [290, 1650], [420, 1690]);
    const stem = [0, s0, s0 + 1, s0 + 2], leafR = [s0, s0 + 3, s0 + 4, s0 + 5, s0], leafL = [s0 + 1, s0 + 6, s0 + 7, s0 + 8, s0 + 1];
    return { nodes, loops: [...loops, leafR, leafL], lines: [...loops, stem, leafR, leafL] };
  })();
  function constellation(t, lt, dur) {
    const k = CLAPS[10], k2 = HANDS[10];
    cam(540, kf(lt, [[0, 1220], [dur, 1150]]), kf(lt, [[0, 1.12], [1.1, 1.0], [dur, .94]], ease.inOut), kf(lt, [[0, .05], [dur, -.03]]));
    sky(t, 540, 960, -400, 2400, { seed: 21, ns: 10 });
    const snap = ease.in(inv(k - .5, k, t)), fillK = ease.out(inv(k2 - .05, k2 + .6, t)), acc = beatPulse(t, 5) * (t > k2 ? 1 : 0);
    const vocP = Math.max(hit(t, 137.45, 4), hit(t, 138.3, 4));
    const bloomK = 1 + .06 * ease.inOut(inv(k2, k2 + 2.5, t));
    const r = rng(404);
    const pos = LILY.nodes.map(([x, y], i) => {
      const ox = (r() - .5) * 900, oy = (r() - .5) * 1100, dr = Math.sin(t * .8 + i) * 30;
      const bx = 540 + (x - 540) * bloomK, by = 1180 + (y - 1180) * bloomK;
      return [lerp(bx + ox + dr, bx, snap), lerp(by + oy - dr, by, snap)];
    });
    // the petals fill with painted light on the sung "hands"
    if (fillK > 0) LILY.loops.forEach((lp, j) => {
      const pts = lp.map((i) => pos[i]);
      s.save(); s.globalAlpha = fillK; shape(s, pts, j > 4 ? C.olive : j % 2 ? C.teal : C.glass, null); s.restore();
      const m = pts.slice(1, Math.min(4, pts.length - 1)).reduce((a, p) => [a[0] + p[0] / 3, a[1] + p[1] / 3], [0, 0]);
      glowAt(m[0], m[1], 260, `rgba(200,235,220,${.22 * fillK + .2 * vocP})`);
    });
    // the lines, snapping in segment by segment just after the clap
    let seg = 0;
    for (const ln of LILY.lines) for (let j = 1; j < ln.length; j++, seg++) {
      const g = ease.out(inv(k + seg * .012, k + seg * .012 + .07, t)); if (g <= 0) continue;
      const a = pos[ln[j - 1]], b = pos[ln[j]], e = [lerp(a[0], b[0], g), lerp(a[1], b[1], g)];
      line([a, e], C.umber, 24); line([a, e], C.gold, 10);
      fLine([a, e], 22, `rgba(255,214,140,${.22 + .3 * hit(t, k, 3) + .2 * acc + .25 * vocP})`); fLine([a, e], 6, `rgba(255,246,220,${.75 + .25 * hit(t, k, 3)})`);
    }
    pos.forEach(([x, y], i) => star(x, y, i === 0 ? 40 : 28 + (i % 3) * 4, t * .3 + i, i % 4 ? C.cream : C.gold, .5 + .5 * hit(t, k, 3) + .3 * vocP));
    rays(540, 950, 16, 300, 1100, .4 * hit(t, k, 3), t * .05);
    // the boat glides in below, toward the Milky Way
    if (lt > dur - 1.6) boat(t, kf(lt, [[dur - 1.6, -200], [dur, 380]], ease.out), 1990, 230, { rot: -.08 });
    border(t, 1);
  }
  // CLAP 12 (139.967): the boat on the Milky Way; the oars rise and slap it, light splashes;
  // then drift down the falling ribbon of stars to a theatre dome and push into its lantern
  const RIVER = cub([-500, 1350], [150, 640], [760, 1420], [1600, 760], 70);
  const riverAt = (x) => RIVER.reduce((b, p) => Math.abs(p[0] - x) < Math.abs(b[0] - x) ? p : b);
  const FALL = cub([880, 1150], [1060, 1460], [240, 1640], [540, 1990], 60);
  function band(pts, w0, w1, col, line = C.umber, lw = 18, t = 0, wob = .12) {
    const L = [], Rr = [];
    pts.forEach((p, i) => { const q = pts[Math.min(i + 1, pts.length - 1)], o = pts[Math.max(i - 1, 0)], a = Math.atan2(q[1] - o[1], q[0] - o[0]), w = lerp(w0, w1, i / (pts.length - 1)) * (1 + wob * Math.sin(i * .22 + t * 1.2) + wob * .4 * Math.sin(i * .5 - t)); L.push([p[0] - Math.sin(a) * w, p[1] + Math.cos(a) * w]); Rr.push([p[0] + Math.sin(a) * w, p[1] - Math.cos(a) * w]); });
    shape(s, [...L, ...Rr.reverse()], col, line, lw);
  }
  function milky(t, lt, dur) {
    const k = CLAPS[11], dk = t - k;
    const cy = kf(t, [[140.4, 1000], [142.3, 1985]], ease.inOut), z = kf(t, [[139.0, 1.04], [140.4, 1.0], [141.4, .9], [142.48, 2.2]], ease.inOut);
    cam(540, cy, z, kf(t, [[139.0, -.02], [142.48, 0]]));
    sky(t, 540, cy, -500, 3000, { seed: 33, ns: 18 });
    // the Milky Way spills down in a falling ribbon into the lantern of a theatre dome far below
    band(FALL, 130, 50, '#4d5c80', C.umber, 18, t); band(FALL, 62, 22, C.glass, C.umber, 12, t + 2); band(FALL, 22, 8, C.cream, C.umber, 8, t + 4);
    dome(t, 540, 2480);
    band(RIVER, 270, 230, '#4d5c80', C.umber, 20, t); band(RIVER, 170, 130, C.dusk, C.umber, 14, t + 1.3, .14); band(RIVER, 105, 80, C.glass, C.umber, 14, t + 3, .14); band(RIVER, 40, 30, C.cream, C.umber, 10, t + 5, .2);
    // star clusters curling off the river like Nouveau eddies
    for (let i = 0; i < 4; i++) { const p = RIVER[10 + i * 15], dir = i % 2 ? 1 : -1; vine(s, whip([p[0], p[1] - dir * 120], [p[0] + 60, p[1] - dir * 220], [p[0] + 150, p[1] - dir * 260], [p[0] + 200, p[1] - dir * 220], .7, dir, 30), 22, 8, i % 2 ? C.gold : C.sage, 1); }
    const r = rng(55);
    lighter(() => {
      for (let i = 0; i < 260; i++) { const fall = i % 3 === 0, pts = fall ? FALL : RIVER, u = (r() + t * (fall ? .22 : .04)) % 1, p = pts[Math.floor(u * (pts.length - 1))], sp = (r() - .5) * (fall ? 160 : 300);
        const tw = .5 + .5 * Math.sin(t * 3 + i); f.fillStyle = `rgba(235,240,255,${.8 * tw})`; f.beginPath(); f.arc(p[0] + sp * .3, p[1] + sp * .5, 2 + r() * 4, 0, TAU); f.fill(); }
    });
    // the boat: the oars climb high just before the clap, then slam down onto the river
    const up = ease.out(inv(k - .55, k - .1, t)), slam = ease.in(inv(k - .1, k, t));
    const row = t < k - .55 ? rowPhase(t) : t < k ? { sweep: lerp(.2, .6, up), lift: lerp(.3, 1.6, up) * (1 - slam) - .15 * slam, dip: 0 } : { sweep: lerp(.6, -.4, ease.out(clamp(dk / .6))), lift: -.15 * Math.exp(-dk * 4), dip: hit(t, k, 3) };
    const bx = 470 + lt * 40, rp = riverAt(bx), rq = riverAt(bx + 120), slope = Math.atan2(rq[1] - rp[1], rq[0] - rp[0]) * .5;
    const by = rp[1] - 110 + Math.sin(t * 1.6) * 8 - 30 * hit(t, k, 5);
    const tip = boat(t, bx, by, 470, { rot: slope + Math.sin(t * 1.2) * .03 - .06 * hit(t, k, 4), row });
    // the splash: a crown of light-petals and a spray of star drops
    if (dk > 0) {
      const crown = ease.out(clamp(dk / .35)) * Math.exp(-Math.max(0, dk - .4) * 2.2);
      for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .32; petal(s, tip[0], tip[1] + 10, a, 150 * crown + 1, 30 * crown + 1, i % 2 ? C.cream : C.parch, C.umber, 9); }
      glowAt(tip[0], tip[1], 320 * hit(t, k, 2) + 40, `rgba(230,240,255,${.5 * hit(t, k, 2.6)})`);
      const pr = rng(808);
      lighter(() => {
        for (let i = 0; i < 46; i++) { const vx = (pr() - .5) * 900, vy = -500 - pr() * 900, d = dk, x = tip[0] + vx * d, y = tip[1] + vy * d + 1100 * d * d, a = clamp(1 - d / (1 + pr() * .8));
          if (a <= 0) continue; f.fillStyle = `rgba(255,${230 + (i % 2) * 20},${190 + (i % 3) * 25},${a})`; f.beginPath(); f.arc(x, y, 4 + pr() * 7, 0, TAU); f.fill(); }
      });
      lighter(() => { for (let j = 0; j < 3; j++) { const rr = (dk - j * .12) * 520; if (rr <= 0) continue; f.strokeStyle = `rgba(210,230,255,${.5 * clamp(1 - dk / 1.4)})`; f.lineWidth = 6; f.beginPath(); f.ellipse(tip[0], tip[1] + 10, rr, rr * .22, 0, 0, TAU); f.stroke(); } });
    }
    border(t, 1);
  }
  // an Art Nouveau theatre dome: copper-green dome with gold ribs, lit arched drum windows, a glass lantern on top
  function dome(t, x, y) {
    // rooftops either side
    for (const sx of [-1, 1]) shape(s, [[x + sx * 420, y + 900], [x + sx * 420, y + 120], [x + sx * 520, y + 60], [x + sx * 640, y + 140], [x + sx * 760, y + 20], [x + sx * 980, y + 90], [x + sx * 980, y + 900]], C.plum, C.umber, 16);
    shape(s, [[x - 440, y + 900], [x - 440, y + 40], [x + 440, y + 40], [x + 440, y + 900]], '#4a3040', C.umber, 18);
    for (let i = 0; i < 4; i++) { const wx = x - 330 + i * 220, on = .7 + .3 * Math.sin(t * 5 + i * 2);
      shape(s, [[wx - 60, y + 380], [wx - 60, y + 200], ...circle(wx, y + 200, 60, 30).filter(([, py]) => py <= y + 200.1).sort((a, b) => a[0] - b[0]), [wx + 60, y + 200], [wx + 60, y + 380]], C.amber, C.umber, 14);
      glowAt(wx, y + 280, 170, `rgba(255,180,90,${.45 * on})`); }
    shape(s, [[x - 470, y + 60], [x + 470, y + 60], [x + 450, y], [x - 450, y]], C.gold, C.umber, 14);
    const domePts = [...cub([x - 400, y], [x - 400, y - 330], [x - 120, y - 430], [x, y - 440], 24), ...cub([x, y - 440], [x + 120, y - 430], [x + 400, y - 330], [x + 400, y], 24)];
    shape(s, domePts, C.teal, C.umber, 18);
    for (let i = 1; i < 6; i++) { const u = i / 6, bx = lerp(x - 400, x + 400, u), bend = (u - .5) * 260; vine(s, cub([bx, y], [bx - bend * .2, y - 220], [x + bend * .5, y - 400], [x + (u - .5) * 120, y - 435], 24), 16, 8, C.gold); }
    // the lantern and its round glass window
    shape(s, [[x - 90, y - 430], [x - 90, y - 560], [x + 90, y - 560], [x + 90, y - 430]], C.olive, C.umber, 14);
    shape(s, circle(x, y - 495, 58, 40), C.amber, C.umber, 12);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; line([[x, y - 495], [x + Math.cos(a) * 58, y - 495 + Math.sin(a) * 58]], C.umber, 7); }
    shape(s, [[x - 120, y - 560], [x + 120, y - 560], [x + 100, y - 590], [x - 100, y - 590]], C.gold, C.umber, 12);
    for (let i = 0; i < 3; i++) petal(s, x, y - 600, -Math.PI / 2 + (i - 1) * .7, 110, 34, C.olive, C.umber, 10);
    shape(s, blobPts(x, y - 636, 30, 46, 7, .03, 30), C.ruby, C.umber, 12); glowAt(x, y - 636, 100, 'rgba(255,120,60,.35)');
    glowAt(x, y - 495, 260, 'rgba(255,200,120,.55)'); glowAt(x, y - 495, 70, 'rgba(255,245,220,.9)');
  }
  chapter('c07', SEC.c3, SEC.v3b, [
    [SEC.c3, bloom],
    [130.9, moonclock],
    [134.9, constellation],
    [139.0, milky],
  ], { fx: PAINT });
})();
