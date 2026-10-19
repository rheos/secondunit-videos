// Act 4, refrain 2 (105.8-125.5): he gets up from the heap and walks away with the banana, through dusk into night.
// He always travels left to right. Background scenery has no outlines and lives in jungle's land layer; from dusk on
// he is drawn in the land layer too, so the palette's wash lights him. Every top-level name starts with a4_.
'use strict';
const a4_SIL = INK, a4_STR = .7; // silhouette ink; ground covered per walk cycle (two steps), in body units

// camera: zoom z with world point (fx, fy) at the frame centre, clamped so the frame never leaves the painted world
function a4_cam(g, z, fx, fy) {
  const hw = W / (2 * z), hh = H / (2 * z);
  g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-cl(fx, hw, W - hw), -cl(fy, hh, H - hh));
}
// a tube in the current units: ink stroke under a colour stroke, bent sideways by `bend` (same units)
function a4_tube(g, p0, p1, bend, w, col) {
  const lws = LW / sc(g), mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1;
  const cx = mx - dy / L * bend, cy = my + dx / L * bend;
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [c, lw] of [[INK, w + lws * 2], [col, w]]) { g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(cx, cy, p1[0], p1[1]); g.strokeStyle = c; g.lineWidth = lw; g.stroke(); }
}
// the walk as a pose cycle: ph in cycles (one cycle = two steps), amp 0 standing .. 1 full stride.
// bob: body rises at the passing pose; sway: weight shifts onto the planted foot; feet [x, lift]; hands swing against the feet
function a4_gait(ph, amp = 1) {
  const a = ph * TAU, c = Math.cos(a) * amp, s = Math.sin(a) * amp;
  return { bob: .045 * Math.abs(s), sway: -.05 * s,
    fL: [-.17 + .12 * c, Math.max(0, -s) * .11], fR: [.17 - .12 * c, Math.max(0, s) * .11],
    hL: [-.46 - .1 * c, -.27 + .04 * Math.abs(s)], hR: [.46 + .1 * c, -.3 + .04 * Math.abs(s)] };
}
// the gorilla with legs of our own: cast.js draws him with fixed standing legs, so they are clipped away under the pear
// and drawn here as two bendy tubes with big flat feet. L = { lift (body rise), fL/fR [x, lift], slope (ground dy/dx) }
function a4_body(g, x, y, s, L, P) {
  P = Object.assign({ lean: 0, squash: 0, fur: FUR, fur2: FUR2 }, P);
  const yb = y - L.lift * s, sl = L.slope || 0;
  g.save(); g.translate(x, y); g.scale(s, s);
  if (!P.noShadow) { g.save(); g.globalAlpha = .22 * cl(1 - L.lift * 2.5); g.fillStyle = '#20301c'; g.beginPath(); g.ellipse(0, .013, .55 * (1 - L.lift), .07, Math.atan(sl), 0, TAU); g.fill(); g.restore(); }
  for (const [hx, f, sg] of [[-.13, L.fL, -1], [.13, L.fR, 1]]) {
    const fy = -.05 - f[1] + sl * f[0];
    a4_tube(g, [hx, -.22 - L.lift], [f[0], fy], sg * .025, .15, P.fur);
    ol(g, ell(g, f[0] + .035, fy + .02, .12, .055, -f[1] * 2.2 + Math.atan(sl) * .6), P.fur2);
  }
  g.restore();
  g.save(); g.translate(x, yb); g.scale(s, s * (1 - P.squash)); g.rotate(P.lean);
  const e = (LW / 2 + 1.5) / s;
  g.beginPath(); g.moveTo(-4, -4); g.lineTo(4, -4); g.lineTo(4, -.1 + e); g.lineTo(.27, -.1 + e); g.quadraticCurveTo(0, -.04 + e, -.27, -.1 + e); g.lineTo(-4, -.1 + e); g.closePath(); g.clip();
  g.rotate(-P.lean); g.scale(1 / s, 1 / (s * (1 - P.squash))); g.translate(-x, -yb);
  gorilla(g, x, yb, s, Object.assign({}, P, { sit: false, lie: false }));
  g.restore();
  // world position of a body point (for things that must follow a hand, like a firefly on the banana)
  return (px, py) => { const c = Math.cos(P.lean), sn = Math.sin(P.lean); return [x + (px * c - py * sn) * s, yb + (px * sn + py * c) * s * (1 - P.squash)]; };
}
// a silhouetted banana with a warm rim where the sun catches its back
function a4_banSil(g, x, y, L, a = 0) {
  g.save(); g.translate(x, y); g.rotate(a); const h = L * .17;
  g.fillStyle = a4_SIL; g.beginPath(); g.moveTo(-L / 2, 0); g.quadraticCurveTo(0, -h * 2.2, L / 2, -h * .2); g.quadraticCurveTo(L * .08, h * .4, -L / 2, 0); g.fill();
  g.beginPath(); g.moveTo(-L / 2, 0); g.lineTo(-L / 2 - L * .1, -L * .06); g.lineTo(-L / 2 - L * .07, L * .02); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-L * .4, -h * .35); g.quadraticCurveTo(0, -h * 2.0, L * .42, -h * .35); g.strokeStyle = '#ffc27a'; g.lineWidth = L * .05; g.lineCap = 'round'; g.stroke();
  g.restore();
}
// walking gorilla at x on ground y. o: { hL, hR (override hands), banA (banana angle), slope, sil (flat silhouette) }
function a4_walker(g, x, y, s, ph, amp, P = {}, o = {}) {
  const k = a4_gait(ph, amp), hR = o.hR || k.hR, hL = o.hL || k.hL;
  const banA = o.banA ?? (-.35 + (hR[0] - .46) * 1.6), bx = hR[0] + .03, by = hR[1] - .06;
  const Q = Object.assign({ lean: .05 * amp + k.sway, handL: hL, handR: hR, bendL: 25, bendR: -25, look: [.9, 0], eyes: 'half', brow: -.6, mouth: 'frown' }, P);
  if (o.sil) Object.assign(Q, { fur: a4_SIL, fur2: a4_SIL, face: a4_SIL, bellyCol: a4_SIL, muzzle: a4_SIL, eyes: 'shut', mouth: 'flat', noShadow: true });
  if (o.banana !== false && !Q.after) Q.after = (gg) => (o.sil ? a4_banSil : banana)(gg, bx, by, o.sil ? .42 : .34, banA);
  const at = a4_body(g, x, y, s, { lift: k.bob + (o.lift || 0), fL: o.fL || k.fL, fR: o.fR || k.fR, slope: o.slope }, Q);
  return { at, tip: at(bx + Math.cos(banA) * .17, by + Math.sin(banA) * .17 - .02) };
}
// distance walked from t0 to t at speed v, with the stride amplitude amp(t) easing him to a stop and off again
function a4_travel(t0, t, v, amp) { let d = 0; const n = 80, dt = (t - t0) / n; for (let i = 0; i < n; i++) d += amp(t0 + (i + .5) * dt) * v * dt; return d; }
function a4_fern(g, x, y, s, a, col) { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = col; for (let i = 0; i < 7; i++) { g.save(); g.rotate((i - 3) * .28); g.beginPath(); g.ellipse(0, -s * .55, s * .12, s * .55, 0, 0, TAU); g.fill(); g.restore(); } g.restore(); }
function a4_mist(g, x, y, rx, ry, a, rgb = '255,238,240') {
  g.save(); g.translate(x, y); g.scale(1, ry / rx); const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
  gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(.6, `rgba(${rgb},${a * .5})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, TAU); g.fill(); g.restore();
}
function a4_fly(g, x, y, a, r = 26) {
  if (a <= .01) return;
  g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(240,255,170,${a})`); gr.addColorStop(.2, `rgba(200,250,120,${a * .45})`); gr.addColorStop(1, 'rgba(150,220,90,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.fillStyle = `rgba(255,255,225,${a})`; g.beginPath(); g.arc(x, y, r * .12, 0, TAU); g.fill(); g.restore();
}
// a wipe of the land layer, for shots that paint their own world over the clearing
function a4_wipe(L) { L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.clearRect(0, 0, W, H); L.restore(); }
// tall framing trees for the wide shots: trunk, canopy blobs, vines
function a4_bigTree(L, t, x, w, seed, side) {
  L.fillStyle = vgrad(L, 0, 1000, [[0, '#55402f'], [1, '#3e2c20']]);
  L.beginPath(); L.moveTo(x - w * .5, 1000); L.quadraticCurveTo(x - w * .32, 500, x - w * .3, -40); L.lineTo(x + w * .3, -40); L.quadraticCurveTo(x + w * .34, 500, x + w * .62, 1000); L.closePath(); L.fill();
  L.fillStyle = 'rgba(255,220,180,.12)'; L.beginPath(); L.moveTo(x + w * .05 * side, 1000); L.lineTo(x + w * .05 * side, -40); L.lineTo(x + w * .3 * side, -40); L.lineTo(x + w * .62 * side, 1000); L.closePath(); L.fill();
  const r = M32(seed);
  blobs(L, [...Array(12)].map(() => [x - 380 + r() * 760, -60 + r() * 230, 110 + r() * 80]), '#2f6540');
  blobs(L, [...Array(9)].map(() => [x - 320 + r() * 640, -80 + r() * 170, 80 + r() * 60]), '#3f7a4c');
  blobs(L, [...Array(6)].map(() => [x - 260 + r() * 520, -90 + r() * 120, 60 + r() * 40]), '#4f8f57');
  L.strokeStyle = '#2e5636'; L.lineWidth = 6; L.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const vx = x - 260 + i * 170 + r() * 60, len = 260 + r() * 260; L.beginPath(); L.moveTo(vx, 140); L.quadraticCurveTo(vx + 26 * Math.sin(t * .7 + i * 2), 140 + len * .6, vx + 8, 140 + len); L.stroke(); }
}

ACTS.push(...[
  // 1. day, the clearing: the heap stirs, sits up, stands with the banana, sighs, looks away to the right and walks off
  { t0: 105.8, t1: 108.4, draw(g, t, lt) {
    cam(g, lt, 2.6, 1.16, 1.0, 1000, 700);
    jungle(g, t, { treeX: 420 });
    const S = 300, X = 900, sitT = 106.2, upT = 106.75, turnT = 107.15, goT = 107.45, blink = (t % 3.1) < .1;
    if (t < sitT) {
      const sigh = Math.max(0, Math.sin(cl((t - 105.85) / .35) * Math.PI));
      gorilla(g, 1010, GROUND - 10, S, { lie: true, squash: -sigh * .03, handL: [-.35, -.3], handR: [.6, -.68], bendR: -20, eyes: t < 106.0 ? 'shut' : 'half', brow: -.8, mouth: 'frown', look: [1, 0],
        after: (gg) => banana(gg, .67, -.77, .42, 1.2) });
    } else if (t < upT) {
      gorilla(g, X, GROUND, S, { sit: true, squash: ring(t - sitT, 14, 6) * .07, handL: [-.14, -.3], handR: [.14, -.3], bendL: 30, bendR: -30, eyes: 'half', brow: -.9, mouth: 'frown', look: [0, 1], tilt: .08,
        after: (gg) => banana(gg, 0, -.34, .4, .05) });
    } else if (t < goT) {
      const turn = eo(seg(t, turnT, turnT + .25));
      gorilla(g, X, GROUND, S, { squash: -ring(t - upT, 12, 6) * .07, handL: [-.16, -.5], handR: [.18, -.5], bendL: 30, bendR: -30, eyes: blink ? 'shut' : 'half', brow: -.9, mouth: 'frown',
        look: [lerp(0, .9, turn), lerp(.8, 0, turn)], tilt: lerp(.1, -.05, turn), after: (gg) => banana(gg, .01, -.55, .4, .08) });
    } else {
      const v = a4_STR * S / .95, x = X + (t - goT) * v, amp = eo(seg(t, goT, goT + .3));
      a4_walker(g, x, GROUND, S, (x - X) / (a4_STR * S) + .25, amp, { eyes: blink ? 'shut' : 'half', brow: -.8, mouth: 'frown', look: [.9, .1] });
    }
    // a puff of dust as he sits up and as he stands; the long sigh after he looks at the banana
    for (const pt of [sitT, upT]) if (t >= pt && t < pt + .45) { const u = eo(seg(t, pt, pt + .45)); g.save(); g.globalAlpha = (1 - u) * .85; g.fillStyle = '#efe4cc';
      for (let i = 0; i < 6; i++) { const sd = i < 3 ? -1 : 1, j = i % 3; g.beginPath(); g.arc(X + sd * (140 + j * 55 + u * 90), GROUND - 12 - j * 16 - u * 20, (28 - j * 5) * (1 - u * .4), 0, TAU); g.fill(); } g.restore(); }
    const sigh = Math.max(0, Math.sin(cl((t - 106.95) / .55) * Math.PI));
    if (sigh > .05 && t < goT) { g.save(); g.globalAlpha = sigh * .8; for (let i = 0; i < 3; i++) { g.fillStyle = '#f4efe0'; g.beginPath(); g.arc(X + 50 + i * 30 + sigh * 50, GROUND - 270 - i * 22 - sigh * 30, 15 - i * 3, 0, TAU); g.fill(); } g.restore(); }
    // the last feather from the parrot's scene drifts down past him
    const fu = seg(t, 105.8, 107.3);
    if (fu < 1) { g.save(); g.translate(1150 + Math.sin(fu * 8) * 60, lerp(480, 880, eio(fu))); g.rotate(Math.sin(fu * 8) * .8); ol(g, () => { g.moveTo(-26, 0); g.quadraticCurveTo(0, -14, 26, 0); g.quadraticCurveTo(0, 12, -26, 0); }, '#e45b4a', 3.5); g.restore(); }
  } },
  // 2. dusk coming on: wide, small under giant trees; he crosses a river on stepping stones, the banana held high
  { t0: 108.4, t1: 112.4, draw(g, t, lt) {
    const u = lt / 4;
    a4_cam(g, lerp(1.08, 1.13, eio(u)), lerp(870, 1030, eio(u)), 600);
    const S = 135, RY = 880, v = a4_STR * S / .9;
    const hops = [[108.95, 109.24, 560, 700], [109.6, 109.9, 700, 860], [110.25, 110.55, 860, 1020], [111.0, 111.3, 1020, 1150], [111.6, 111.92, 1150, 1300]];
    // the river winds towards us, narrow at the horizon: centre line and half-width by screen y
    const fr = (y) => cl((y - 600) / 480), cx = (y) => 940 + 150 * Math.sin(fr(y) * 5.2 + .3) * Math.min(1, fr(y) * 2), hw = (y) => 34 + fr(y) * 480;
    const xL = (y) => cx(y) - hw(y), xR = (y) => cx(y) + hw(y);
    const riv = (L, pad) => { L.beginPath(); for (let y = 600; y <= H; y += 20) L.lineTo(xL(y) - pad * (.2 + fr(y)), y); for (let y = H; y >= 600; y -= 20) L.lineTo(xR(y) + pad * (.2 + fr(y)), y); L.closePath(); L.fill(); };
    const land = (L) => {
      L.fillStyle = '#527f40'; riv(L, 34);
      L.fillStyle = vgrad(L, 600, H, [[0, '#d7e6d6'], [.35, '#9cc8c8'], [1, '#4e8d9e']]); riv(L, 0);
      L.fillStyle = 'rgba(255,240,215,.18)'; L.beginPath(); for (let y = 600; y <= H; y += 20) L.lineTo(cx(y) - hw(y) * .25, y); for (let y = H; y >= 600; y -= 20) L.lineTo(cx(y) + hw(y) * .05, y); L.closePath(); L.fill();
      const r = M32(41); L.lineCap = 'round';
      for (let i = 0; i < 80; i++) { const q = r(), sp = .07 + r() * .06, f0 = (r() + t * sp) % 1, y = 600 + Math.pow(f0, 1.6) * 480, len = 8 + fr(y) * 70;
        const x = lerp(xL(y), xR(y), .06 + q * .88); L.strokeStyle = `rgba(255,255,250,${.5 * Math.sin(f0 * Math.PI)})`; L.lineWidth = 1.5 + fr(y) * 4; L.beginPath(); L.moveTo(x - len / 2, y); L.lineTo(x + len / 2, y); L.stroke(); }
      // stepping stones, each with a foam collar and a splash ring when he lands on it
      [700, 860, 1020, 1150].forEach((sx, i) => {
        L.fillStyle = 'rgba(30,60,70,.3)'; L.beginPath(); L.ellipse(sx, RY + 8, 70, 18, 0, 0, TAU); L.fill();
        L.strokeStyle = `rgba(255,255,255,${.45 + .15 * Math.sin(t * 5 + i)})`; L.lineWidth = 4; L.beginPath(); L.ellipse(sx - 6, RY + 6, 66 + 4 * Math.sin(t * 4 + i * 2), 16, 0, 0, Math.PI); L.stroke();
        L.fillStyle = '#8b8781'; L.beginPath(); L.ellipse(sx, RY + 4, 56, 20, 0, Math.PI, TAU); L.lineTo(sx + 56, RY + 8); L.quadraticCurveTo(sx, RY + 18, sx - 56, RY + 8); L.closePath(); L.fill();
        L.fillStyle = '#aaa69e'; L.beginPath(); L.ellipse(sx - 6, RY - 2, 40, 11, 0, 0, TAU); L.fill();
        const tl = hops[i][1]; if (t >= tl && t < tl + .7) { const k = seg(t, tl, tl + .7); L.strokeStyle = `rgba(255,255,255,${(1 - k) * .8})`; L.lineWidth = 4; L.beginPath(); L.ellipse(sx, RY + 8, 70 + k * 110, 18 + k * 26, 0, 0, TAU); L.stroke(); }
      });
      a4_bigTree(L, t, 150, 230, 61, 1); a4_bigTree(L, t, 1790, 210, 62, -1);
      // him: walking up to the bank, hopping stone to stone, wobbling once, walking on
      let x, P = { look: [.9, .2], eyes: 'open', brow: .3, mouth: 'flat' }, o = {}, ph = 0, amp = 1, hopU = -1, yOff = 0;
      if (t < hops[0][0]) { x = hops[0][2] - (hops[0][0] - t) * v; ph = (x - 560) / (a4_STR * S); amp = 1 - eo(seg(t, hops[0][0] - .25, hops[0][0])); }
      else if (t >= hops[4][1]) { x = 1300 + (t - hops[4][1]) * v; ph = (x - 1300) / (a4_STR * S) + .25; amp = eo(seg(t, hops[4][1] + .1, hops[4][1] + .35)); P.eyes = 'half'; P.brow = -.5; P.mouth = 'frown'; }
      else {
        const hi = hops.findIndex((h) => t < h[1]), h = hops[hi];
        if (hi >= 0 && t >= h[0]) { hopU = seg(t, h[0], h[1]); x = lerp(h[2], h[3], eio(hopU)); yOff = Math.sin(hopU * Math.PI) * 60; }
        else { const prev = hops[hi - 1]; x = prev[3]; }
        amp = 0;
      }
      const land0 = hops.reduce((a, h) => (t >= h[1] ? h[1] : a), -9), sq = t >= land0 && hopU < 0 ? ring(t - land0, 16, 7) * .1 : 0;
      const nextT = (hops.find((h) => t < h[0]) || [99])[0], crouch = hopU < 0 ? eo(seg(t, nextT - .14, nextT)) * .1 : 0;
      const wob = t > 110.55 && t < 111.0 ? Math.sin((t - 110.55) * 26) * (1 - seg(t, 110.55, 111.0)) : 0;
      if (hopU >= 0) Object.assign(o, { lift: yOff / S, fL: [-.12, yOff / S + .06], fR: [.15, yOff / S + .09], hL: [-.56, -.82], hR: [.5, -1.0], banA: -.8 }), Object.assign(P, { eyes: 'open', mouth: 'o', brow: .2 });
      else if (t >= hops[0][0] && t < hops[4][1]) {
        Object.assign(o, { hL: [-.62, -.5 + wob * .3], hR: [.58, -.85 - wob * .3], banA: -.8 + wob * .4 });
        Object.assign(P, { squash: sq + crouch, lean: wob * .22, eyes: Math.abs(wob) > .2 ? 'open' : 'open', mouth: Math.abs(wob) > .1 ? 'o' : 'flat', brow: wob ? -.4 : .4, look: wob ? [Math.sign(wob), 1] : [.9, .3], sweat: Math.abs(wob) > .1 ? .9 : 0 });
      }
      a4_walker(L, x, RY + 6, S, ph, amp, P, o);
      a4_fern(L, -10, H + 40, 300, .25, '#3a6a3c'); a4_fern(L, W + 10, H + 40, 320, -.25, '#36633a');
    };
    jungle(g, t, { sky: ['day', 'dusk', lerp(.25, .6, u)], hz: 600, tree: false, ferns: false, sunX: 1250, sunY: 330, sunR: 72, raysX: 520, land });
  } },
  // 3. a waterfall at dusk: he walks the near bank, stops in its spray on 113.49, hugs the banana dry, walks on
  { t0: 112.4, t1: 116.2, draw(g, t, lt) {
    const S = 215, Y = 975, v = a4_STR * S / .95, stopT = 113.49, goT = 114.6;
    const amp = (tt) => cl(1 - eo(seg(tt, stopT - .3, stopT)) + eo(seg(tt, goT, goT + .35)));
    const x = 590 + a4_travel(112.4, t, v, amp);
    a4_cam(g, 1.13, lerp(860, 1010, eio(lt / 3.8)), 560);
    const lip = 150, wx0 = 980, wx1 = 1100, pool = 715;
    const land = (L) => {
      // the cliff, lit on its left faces, with jungle on its brow
      L.fillStyle = vgrad(L, 100, 730, [[0, '#8b879a'], [1, '#5f5b70']]);
      L.beginPath(); L.moveTo(700, 730); L.lineTo(760, 470); L.lineTo(820, 300); L.lineTo(900, 170); L.lineTo(wx0, lip); L.lineTo(wx1, lip); L.lineTo(1220, 130); L.lineTo(1350, 190); L.lineTo(1450, 360); L.lineTo(1520, 560); L.lineTo(1580, 730); L.closePath(); L.fill();
      L.fillStyle = 'rgba(255,226,205,.16)'; L.beginPath(); L.moveTo(700, 730); L.lineTo(760, 470); L.lineTo(820, 300); L.lineTo(900, 170); L.lineTo(940, 250); L.lineTo(880, 450); L.lineTo(860, 730); L.closePath(); L.fill();
      L.fillStyle = 'rgba(40,30,60,.18)'; L.beginPath(); L.moveTo(1350, 190); L.lineTo(1450, 360); L.lineTo(1520, 560); L.lineTo(1580, 730); L.lineTo(1380, 730); L.lineTo(1330, 420); L.closePath(); L.fill();
      const cr = M32(71);
      blobs(L, [...Array(12)].map(() => [820 + cr() * 600, 130 + cr() * 40, 40 + cr() * 40]), '#3f7a4c');
      blobs(L, [...Array(8)].map(() => [860 + cr() * 520, 120 + cr() * 30, 30 + cr() * 26]), '#5a9a5c');
      // the fall: a pale sheet with streaks running down, flaring at the foot
      L.fillStyle = vgrad(L, lip, pool, [[0, '#f4f8f2'], [1, '#cfe7ea']]);
      L.beginPath(); L.moveTo(wx0, lip); L.lineTo(wx1, lip); L.quadraticCurveTo(wx1 + 6, 420, wx1 + 30, pool); L.lineTo(wx0 - 30, pool); L.quadraticCurveTo(wx0 - 6, 420, wx0, lip); L.closePath(); L.fill();
      L.fillStyle = 'rgba(110,150,175,.28)'; for (const [e0, e1] of [[wx0, wx0 + 16], [wx1 - 16, wx1]]) { L.beginPath(); L.moveTo(e0, lip); L.lineTo(e1, lip); L.lineTo(e1 + (e1 > 1040 ? 30 : -30) * .9, pool); L.lineTo(e0 + (e0 > 1040 ? 30 : -30), pool); L.closePath(); L.fill(); }
      const r = M32(72); L.lineCap = 'round';
      for (let i = 0; i < 26; i++) { const q = r(), f0 = (r() + t * (1.1 + r() * .5)) % 1, y = lip + f0 * (pool - lip), len = 40 + r() * 90, x0 = lerp(wx0 - 30 * f0, wx1 + 30 * f0, q);
        L.strokeStyle = i % 3 ? 'rgba(255,255,255,.75)' : 'rgba(120,170,190,.35)'; L.lineWidth = 3 + r() * 4; L.beginPath(); L.moveTo(x0, y); L.lineTo(x0, Math.min(pool, y + len)); L.stroke(); }
      // the pool and its foam
      L.fillStyle = vgrad(L, pool - 40, pool + 170, [[0, '#a9d3d4'], [1, '#5f9aa6']]); L.beginPath(); L.ellipse(1040, pool + 60, 600, 105, 0, 0, TAU); L.fill();
      L.fillStyle = 'rgba(255,236,220,.22)'; L.beginPath(); L.ellipse(1040, pool + 40, 120, 60, 0, 0, TAU); L.fill();
      L.strokeStyle = 'rgba(255,255,255,.45)'; L.lineWidth = 3; for (let i = 0; i < 4; i++) { const k = (t * .5 + i * .25) % 1; L.globalAlpha = 1 - k; L.beginPath(); L.ellipse(1040, pool + 14, 90 + k * 420, 14 + k * 70, 0, 0, TAU); L.stroke(); } L.globalAlpha = 1;
      blobs(L, [...Array(9)].map((_, i) => [wx0 - 40 + i * 25, pool + 4 + Math.sin(t * 7 + i * 1.7) * 5, 24 + 8 * Math.sin(t * 5 + i)]), '#f6faf6');
      for (let i = 0; i < 5; i++) { const k = (t * .35 + i * .2) % 1; a4_mist(L, 1040 + (i - 2) * 90, pool - 30 - k * 220, 150 + k * 120, 90 + k * 60, .32 * Math.sin(k * Math.PI)); }
      // the near bank
      L.fillStyle = vgrad(L, 800, H, [[0, '#79a95a'], [1, '#5a8c44']]);
      L.beginPath(); L.moveTo(0, 872); for (let xx = 0; xx <= W; xx += 120) L.quadraticCurveTo(xx + 60, 856 + Math.sin(xx) * 8, xx + 120, 870); L.lineTo(W, H); L.lineTo(0, H); L.closePath(); L.fill();
      tufts(L, 51, 70, 890, H, '#4c7d3a'); flowers(L, 52, 60, 900, H, ['#f6c7d8', '#fff1a8', '#ffffff', '#cdb8ef']);
      // him
      const blink = (t % 2.9) < .1, wet = seg(t, stopT, stopT + .25) * (1 - seg(t, goT + .2, goT + .5));
      const hug = eo(seg(t, 113.85, 114.1)) * (1 - eo(seg(t, goT - .05, goT + .2)));
      const P = { eyes: blink ? 'shut' : 'half', brow: -.6, mouth: 'frown', look: [.9, 0] }, o = {};
      if (t >= stopT - .1 && t < goT + .2) {
        Object.assign(P, { look: [.5, -1], tilt: -.14, eyes: t > 113.8 && t < 114.15 ? 'squint' : 'open', mouth: t < 113.8 ? 'o' : (hug > .5 ? 'smile' : 'flat'), brow: .1 });
        if (hug > 0) Object.assign(o, { hL: [lerp(-.46, -.12, hug), lerp(-.27, -.48, hug)], hR: [lerp(.46, .16, hug), lerp(-.3, -.46, hug)], banA: lerp(-.35, .1, hug) });
      }
      a4_walker(L, x, Y, S, (x - 590) / (a4_STR * S) + .25, amp(t), P, o);
      const sp = seg(t, stopT - .2, stopT + .3) * (1 - seg(t, goT, goT + .8));
      for (let i = 0; i < 3; i++) { const k = (t * .4 + i / 3) % 1; a4_mist(L, lerp(1000, x - 60, k), Y - 250 - i * 40, 200, 110, .3 * sp * Math.sin(k * Math.PI)); }
      a4_fern(L, -20, H + 50, 330, .25, '#3a6a3c'); a4_fern(L, W + 10, H + 50, 300, -.3, '#3e7140');
    };
    jungle(g, t, { sky: ['day', 'dusk', lerp(.6, .85, lt / 3.8)], hz: 650, tree: false, ferns: false, sunX: 420, sunY: 300, sunR: 80, raysX: 200, rays: .8, land });
    // spray drifting over him, cool sparkles on the fur
    const sp = seg(t, stopT, stopT + .3) * (1 - seg(t, goT, goT + .5));
    if (sp > 0) { const r = M32(73); for (let i = 0; i < 9; i++) { const ph = (t * .9 + r()) % 1; sparkle(g, x - 140 + r() * 300, Y - S * 1.3 + r() * S * .9 + ph * 40, 9 + r() * 8, sp * Math.sin(ph * Math.PI), '#f2fbff'); } }
  } },
  // 4. up a misty hill: a path slanting up its face, the sun low and big on the right, mist sliding past in front and behind
  { t0: 116.2, t1: 119.4, draw(g, t, lt) {
    const S = 160, v = a4_STR * S / 1.0, x = 420 + lt * v;
    const f = (xx) => 1010 - 440 * Math.sin(cl(xx / 1750) * Math.PI / 2), path = (xx) => f(xx) + 140, dp = (xx) => (path(xx + 2) - path(xx - 2)) / 4;
    a4_cam(g, lerp(1.2, 1.26, eio(lt / 3.2)), x + 190, path(x) - 200);
    const rY = (xx, y0, amp, fq, ph) => y0 + Math.sin(xx * fq + ph) * amp + Math.sin(xx * fq * 2.7 + ph * 2) * amp * .35;
    const ridgeL = (L, y0, amp, fq, ph, col) => { L.fillStyle = col; L.beginPath(); L.moveTo(-10, H); for (let xx = -10; xx <= W + 10; xx += 20) L.lineTo(xx, rY(xx, y0, amp, fq, ph)); L.lineTo(W + 10, H); L.closePath(); L.fill();
      blobs(L, [...Array(10)].map((_, i) => { const bx = 60 + i * 205 + (i % 3) * 30, br = 18 + ((i * 7) % 4) * 6; return [bx, rY(bx, y0, amp, fq, ph) + br * .45, br]; }), col); };
    const land = (L) => {
      a4_wipe(L);
      // far ridges, paler with distance, each with a few round treetops, and mist pooled in the valleys between them
      ridgeL(L, 470, 26, .006, 1, '#d6a6b6');
      for (let i = 0; i < 5; i++) a4_mist(L, ((i * 520 + t * 22) % 2600) - 300, 515, 460, 60, .6);
      ridgeL(L, 560, 34, .005, 3, '#ab86a9');
      for (let i = 0; i < 5; i++) a4_mist(L, ((i * 560 + 260 - t * 16) % 2800) - 300, 610, 520, 70, .55);
      // the jungle down in the valley, treetops poking up through the mist
      const vr = M32(83);
      for (const [vy, col, n] of [[700, '#8f7aa0', 24], [840, '#76668e', 18]]) { L.fillStyle = col; L.fillRect(0, vy, W, H - vy); blobs(L, [...Array(n)].map((_, i) => [i * (W / (n - 1)) + (vr() - .5) * 40, vy - vr() * 30, 40 + vr() * 34]), col); }
      for (let i = 0; i < 6; i++) a4_mist(L, ((i * 470 + 120 + t * 20) % 2800) - 300, 760 + (i % 3) * 90, 420, 60, .6);
      // the hill: green, a warm rim of light along its brow, a worn path slanting up its face
      L.fillStyle = vgrad(L, 550, H, [[0, '#86ad69'], [1, '#527e43']]);
      L.beginPath(); L.moveTo(0, f(0)); for (let xx = 0; xx <= W; xx += 30) L.lineTo(xx, f(xx)); L.lineTo(W, H + 10); L.lineTo(0, H + 10); L.closePath(); L.fill();
      L.fillStyle = 'rgba(255,214,160,.4)'; L.beginPath(); L.moveTo(0, f(0)); for (let xx = 0; xx <= W; xx += 30) L.lineTo(xx, f(xx)); for (let xx = W; xx >= 0; xx -= 30) L.lineTo(xx, f(xx) + 10 + xx * .008); L.closePath(); L.fill();
      L.fillStyle = 'rgba(205,180,130,.55)'; L.beginPath(); for (let xx = 0; xx <= W; xx += 30) L.lineTo(xx, path(xx) - 18); for (let xx = W; xx >= 0; xx -= 30) L.lineTo(xx, path(xx) + 22); L.closePath(); L.fill();
      const r = M32(81); L.strokeStyle = '#47703b'; L.lineWidth = 2; L.lineCap = 'round';
      for (let i = 0; i < 140; i++) { const xx = r() * W, yy = f(xx) + 16 + r() * 460, h = 8 + r() * 12; if (Math.abs(yy - path(xx)) < 28) continue; L.beginPath(); L.moveTo(xx - 4, yy); L.lineTo(xx - 6, yy - h * .7); L.moveTo(xx, yy); L.lineTo(xx + 1, yy - h); L.moveTo(xx + 4, yy); L.lineTo(xx + 7, yy - h * .6); L.stroke(); }
      const cols = ['#f6c7d8', '#fff1a8', '#ffffff', '#f2a65a']; for (let i = 0; i < 80; i++) { const xx = r() * W, yy = f(xx) + 20 + r() * 440, s2 = 4 + r() * 4; L.fillStyle = cols[i % 4]; L.beginPath(); for (let j = 0; j < 10; j++) { const a2 = j * Math.PI / 5, rr = j % 2 ? s2 * .4 : s2; L.lineTo(xx + Math.cos(a2) * rr, yy + Math.sin(a2) * rr); } L.closePath(); L.fill(); }
      // a lone tree on the brow ahead
      L.fillStyle = '#4a3527'; L.beginPath(); L.moveTo(1392, f(1400) + 10); L.lineTo(1396, f(1400) - 150); L.lineTo(1410, f(1400) - 150); L.lineTo(1418, f(1400) + 10); L.closePath(); L.fill();
      blobs(L, [[1404, f(1400) - 190, 70], [1350, f(1400) - 160, 50], [1460, f(1400) - 165, 55], [1410, f(1400) - 250, 46]], '#3f7a4c');
      blobs(L, [[1380, f(1400) - 215, 34], [1430, f(1400) - 260, 26]], '#5a9a5c');
      for (let i = 0; i < 3; i++) a4_mist(L, ((i * 700 + t * 30) % 2400) - 200, f(800) + 160 + i * 70, 560, 80, .35);
      const blink = (t % 3.3) < .1, tired = seg(t, 117.0, 117.5) * (1 - seg(t, 118.6, 119.0)), cyc = lt * v / (a4_STR * S);
      a4_walker(L, x, path(x), S, cyc + .25, 1, { lean: .14 - Math.sin((cyc + .25) * TAU) * .05, eyes: blink ? 'shut' : (tired > .5 ? 'squint' : 'half'), brow: -.7, mouth: tired > .5 ? 'grit' : 'frown', look: [1, -.4], tilt: -.06, sweat: tired }, { slope: dp(x) });
      // mist sliding across in front of him
      for (let i = 0; i < 3; i++) a4_mist(L, ((i * 800 + 300 + t * 55) % 2600) - 400, path(x) - 60 + i * 80, 460, 66, .38);
    };
    jungle(g, t, { sky: ['day', 'dusk', lerp(.85, 1, lt / 1.5)], hz: 560, tree: false, ferns: false, sunX: 1440, sunY: 300, sunR: 150, raysX: 900, rays: .5, land });
  } },
  // 5. the sunset: a tiny silhouette crests the ridge into the middle of an enormous setting sun on 120.41,
  //    holds the banana up to it on 120.75; the sun sinks and night begins to come down
  { t0: 119.4, t1: 121.98, draw(g, t, lt) {
    cam(g, lt, 2.58, 1.0, 1.08, 960, 600);
    const S = 100, v = a4_STR * S / 1.0, arr = 120.41, nk = eio(seg(t, 121.0, 121.98)) * .45;
    const amp = (tt) => 1 - eo(seg(tt, arr - .3, arr));
    const x = 960 - a4_travel(t, arr, v, amp) * (t < arr ? 1 : 0), ridge = (xx) => 662 + Math.pow((xx - 960) / 900, 2) * 300;
    const land = (L) => {
      a4_wipe(L);
      // long thin clouds laid across the sun
      for (const [cy, cx, w2, a] of [[420, 760, 520, .5], [470, 1180, 640, .55], [530, 880, 760, .45], [585, 1300, 420, .4]]) {
        const xx = cx + Math.sin(t * .2 + cy) * 20; L.fillStyle = `rgba(255,214,190,${a})`; L.beginPath(); L.ellipse(xx, cy, w2 / 2, 9, 0, 0, TAU); L.fill();
        L.fillStyle = `rgba(190,90,120,${a * .5})`; L.beginPath(); L.ellipse(xx + 30, cy + 7, w2 / 2.2, 5, 0, 0, TAU); L.fill();
      }
      // birds crossing the sun
      L.strokeStyle = a4_SIL; L.lineWidth = 4; L.lineCap = 'round'; L.lineJoin = 'round';
      for (let i = 0; i < 3; i++) { const bx = 560 + (t - 119.4) * 150 + i * 70, by = 380 - i * 26 + Math.sin(t * 3 + i) * 6, fl = Math.sin(t * 14 + i * 2) * 8; L.beginPath(); L.moveTo(bx - 16, by - fl); L.quadraticCurveTo(bx - 7, by - 4, bx, by + 2); L.quadraticCurveTo(bx + 7, by - 4, bx + 16, by - fl); L.stroke(); }
      // ridges: far and pink, mid and plum, and the dark one he walks along
      L.fillStyle = '#b8708f'; L.beginPath(); L.moveTo(0, 690); for (let xx = 0; xx <= W; xx += 140) L.quadraticCurveTo(xx + 70, 660 + Math.sin(xx * .017) * 22, xx + 140, 690 + Math.sin(xx * .03) * 14); L.lineTo(W, H); L.lineTo(0, H); L.closePath(); L.fill();
      L.fillStyle = '#6d3f66'; L.beginPath(); L.moveTo(0, 735); for (let xx = 0; xx <= W; xx += 180) L.quadraticCurveTo(xx + 90, 700 + Math.sin(xx * .013 + 2) * 26, xx + 180, 740); L.lineTo(W, H); L.lineTo(0, H); L.closePath(); L.fill();
      L.fillStyle = a4_SIL; L.beginPath(); L.moveTo(0, ridge(0)); for (let xx = 0; xx <= W; xx += 20) L.lineTo(xx, ridge(xx)); L.lineTo(W, H); L.lineTo(0, H); L.closePath(); L.fill();
      L.strokeStyle = 'rgba(255,175,110,.45)'; L.lineWidth = 3; L.beginPath(); for (let xx = 360; xx <= 1560; xx += 20) L.lineTo(xx, ridge(xx) + 1.5); L.stroke();
      // a few grass blades and a lone tree on the ridge, in silhouette
      L.strokeStyle = a4_SIL; L.lineWidth = 3; const r = M32(91); for (let i = 0; i < 60; i++) { const xx = r() * W, yy = ridge(xx) + 2, h = 6 + r() * 12; L.beginPath(); L.moveTo(xx, yy); L.lineTo(xx + (r() - .5) * 6, yy - h); L.stroke(); }
      L.fillStyle = a4_SIL; L.beginPath(); L.moveTo(1586, ridge(1590)); L.lineTo(1596, ridge(1590) - 120); L.lineTo(1608, ridge(1590) - 120); L.lineTo(1616, ridge(1590)); L.closePath(); L.fill();
      blobs(L, [[1600, ridge(1590) - 150, 46], [1560, ridge(1590) - 128, 32], [1642, ridge(1590) - 130, 36], [1604, ridge(1590) - 190, 30]], a4_SIL);
      // him, tiny: walks in, stops on the crest, raises the banana to the sun
      const raise = eo(seg(t, 120.75, 121.05)), lower = eio(seg(t, 121.5, 121.9));
      const up = raise * (1 - lower * .6);
      const o = { sil: true, slope: (ridge(x + 2) - ridge(x - 2)) / 4 };
      if (up > 0) Object.assign(o, { hR: [lerp(.46, .66, up), lerp(-.3, -1.02, up)], banA: lerp(-.35, -.75, up) });
      a4_walker(L, x, ridge(x) + 2, S, (x - 960) / (a4_STR * S) + .75, amp(t), { tilt: -.2 * up, bendR: lerp(-25, 10, up) }, o);
    };
    jungle(g, t, { sky: nk > 0 ? ['dusk', 'night', nk] : 'dusk', hz: 720, tree: false, ferns: false, sunX: 960, sunY: lerp(585, 680, eio(seg(t, 120.6, 121.98))), sunR: 300, raysX: 700, rays: .25, land });
  } },
  // 6. night: stars, the moon, fireflies; he walks on in the dark, the fireflies gather round him and one settles on
  //    the banana; ahead on the right, between the bushes, water catches the moon
  { t0: 121.98, t1: 125.5, draw(g, t, lt) {
    const S = 225, Y = 935, v = a4_STR * S / 1.05, x0 = 600, x = x0 + lt * v, nk = lerp(.6, 1, eo(seg(t, 121.98, 123.2)));
    a4_cam(g, 1.16, x + 130, 640);
    let tip = [0, 0];
    const land = (L) => {
      // dark trunks behind, a pale moonlit path, his walk, black bushes in front
      for (const [tx, w2] of [[260, 70], [1180, 90], [1700, 60]]) { L.fillStyle = '#3d2c24'; L.beginPath(); L.moveTo(tx - w2 * .6, 760); L.lineTo(tx - w2 * .4, -40); L.lineTo(tx + w2 * .4, -40); L.lineTo(tx + w2 * .7, 760); L.closePath(); L.fill(); }
      const cr = M32(101), off = (b) => Math.hypot(b[0] - 1540, b[1] - 165) > b[2] + 120;
      blobs(L, [...Array(22)].map(() => [cr() * W, -40 + cr() * 180, 90 + cr() * 70]).filter(off), '#2c5a3a'); blobs(L, [...Array(14)].map(() => [cr() * W, -60 + cr() * 120, 70 + cr() * 50]).filter(off), '#3a6e48');
      L.fillStyle = 'rgba(210,230,190,.35)'; L.beginPath(); L.ellipse(980, Y + 6, 1100, 60, 0, 0, TAU); L.fill();
      // water ahead, glinting
      L.fillStyle = '#6f8fc8'; L.beginPath(); L.ellipse(1860, 806, 500, 46, 0, 0, TAU); L.fill();
      L.strokeStyle = '#1f3a2a'; L.lineWidth = 5; L.lineCap = 'round'; for (let i = 0; i < 9; i++) { const rx = 1400 + i * 22 + (i % 3) * 7, rh = 50 + (i % 4) * 22; L.beginPath(); L.moveTo(rx, 820); L.quadraticCurveTo(rx + 4, 820 - rh * .6, rx + 10 + Math.sin(t * 1.5 + i) * 4, 820 - rh); L.stroke(); }
      const blink = (t % 3.0) < .1, look = eo(seg(t, 122.52, 122.8)), see = eo(seg(t, 123.48, 123.75)), ahead = eo(seg(t, 124.5, 124.8));
      let P = { eyes: blink ? 'shut' : 'half', brow: -.7, mouth: 'frown', look: [.9, .1] };
      if (ahead > 0) P = { eyes: blink ? 'shut' : 'open', brow: lerp(-.3, .1, ahead), mouth: 'flat', look: [1, 0], tilt: -.04 * ahead };
      else if (see > 0) P = { eyes: 'half', brow: -.3, mouth: 'smile', look: [1, .7], tilt: .1 * see };
      else if (look > 0) P = { eyes: 'open', brow: -.2, mouth: 'flat', look: [.5, -1], tilt: -.12 * look };
      const w = a4_walker(L, x, Y, S, lt * v / (a4_STR * S) + .25, 1, P); tip = w.tip;
      blobs(L, [...Array(12)].map((_, i) => [i * 180 + cr() * 60, H + 30 + cr() * 30, 90 + cr() * 50]), '#24442c');
    };
    jungle(g, t, { sky: ['dusk', 'night', nk], hz: 640, tree: false, ferns: false, sunX: 1540, sunY: 165, sunR: 44, rays: 0, land });
    // moonlight on the water ahead
    g.save(); g.globalCompositeOperation = 'lighter'; const r0 = M32(111);
    for (let i = 0; i < 16; i++) { const xx = 1540 + r0() * 520, yy = 784 + r0() * 32, a = .25 + .25 * Math.sin(t * 3 + i * 1.3); g.strokeStyle = `rgba(200,215,255,${a})`; g.lineWidth = 3; g.beginPath(); g.moveTo(xx - 22, yy); g.lineTo(xx + 22, yy); g.stroke(); }
    g.restore();
    // fireflies: a few at first, more on 122.34, one drifts down to sit on the banana's tip on 123.48
    const r = M32(112), more = eo(seg(t, 122.2, 122.6));
    for (let i = 0; i < 30; i++) {
      const bx = r() * W, by = 420 + r() * 520, f1 = .3 + r() * .5, f2 = .4 + r() * .6, p = r() * TAU, gate = i < 9 ? 1 : more;
      const fx = bx + Math.sin(t * f1 + p) * 60, fy = by + Math.sin(t * f2 + p * 2) * 40, a = gate * (.35 + .65 * Math.pow(Math.max(0, Math.sin(t * (1.5 + r()) + p)), 2));
      a4_fly(g, fx, fy, a);
    }
    // the gathering round him from 122.34 and the one that lands
    for (let i = 0; i < 6; i++) { const a0 = i / 6 * TAU + t * .7, R = 190 + 30 * Math.sin(t * 1.3 + i); a4_fly(g, x + Math.cos(a0) * R * 1.2, Y - S * .8 + Math.sin(a0) * R * .7, more * (.5 + .5 * Math.sin(t * 2.3 + i * 2))); }
    const k = eio(seg(t, 122.9, 123.48)), sx = x + 260 - k * 0, fx = lerp(sx, tip[0], k), fy = lerp(Y - S * 1.6, tip[1], k) - Math.sin(k * Math.PI) * 40;
    a4_fly(g, fx, fy, seg(t, 122.4, 122.7) * (t > 123.48 ? .8 + .2 * Math.sin(t * 4) : 1), t > 123.48 ? 40 : 30);
    if (t > 123.48) { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(tip[0], tip[1], 0, tip[0], tip[1], 180); gr.addColorStop(0, 'rgba(190,230,120,.22)'); gr.addColorStop(1, 'rgba(190,230,120,0)'); g.fillStyle = gr; g.beginPath(); g.arc(tip[0], tip[1], 180, 0, TAU); g.fill(); g.restore(); }
  } },
]);
