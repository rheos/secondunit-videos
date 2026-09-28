// Hjeron (solo), "Dream of Fire": the instrumental intro, 0.00 to 25.84 s (first sung word "The").
// One continuous shot of a night desert that paints itself. Every cue is a real onset or downbeat
// from tools/analyze.py; docs/PLAN.md has the table. Downbeats are beat-phase 2 (D0 = 1.08 s).

const D = (n) => BEATS[2 + 4 * n];   // bar downbeats: 1.08, 2.69, 4.32, 5.91, 7.56, 9.18, 10.82, 12.45, 14.08, 15.66, 17.25, 18.84, 20.46, 22.04, 23.64, 25.24
const B = (n) => BEATS[n];
const CUE = {
  pick: [B(0), B(1)],                 // 0.27, 0.67 pickups: two sparks
  sky: D(0),                          // 1.08 sky paints in
  meteor: D(1),                       // 2.69 (onset .98) a meteor
  mesas: D(2),                        // 4.32 (onset 1.12) far mesas
  skull: 5.12,                        // strongest onset of the intro (1.27): ram skull
  tree: D(3),                         // 5.91 dead juniper on the ridge
  fuse: D(4),                         // 7.56 fuse lights, fire ring draws itself
  pyre: 8.371,                        // onset 1.32: the pyre ignites
  torches: [D(5), B(24), D(6), B(28)],// 9.18 10.00 10.82 11.63: four torch pairs
  inkStart: D(6),                     // 10.82 the ouroboros starts inking in the smoke
  swell: D(7),                        // 12.45 bass enters and swells
  bite: D(8),                         // 14.08 kick (onset 1.27): the serpent bites its tail
  pour: D(9),                         // 15.66 bronze pours inside the ring
  rim: [B(42), B(43), B(44), B(45)],  // 17.25 17.66 18.04 18.45 rim quarters lock
  runes: [D(11), B(47), B(48), B(49)],// 18.84 (1.28) 19.25 19.64 20.06: rune groups stamp
  antler: D(12),                      // 20.46 antler tree grows
  tines: [B(51), B(52), B(53)],       // 20.85 21.24 21.64
  diamond: D(13),                     // 22.04 the diamond ignites
  peak: B(56),                        // 22.84 last full hit before the break
  breath: B(56) + .12,                // pull back into the breakdown
  scorch: D(14),                      // 23.64 the fire ring flares in the breakdown
  ignite: B(60),                      // 24.43 the sigil rekindles; smoke begins to rise through it
  gold: D(15),                        // 25.24 big low hit: the pyre surges and the smoke bends across frame
};

// ---- world layout (world coords, zoom 1 = the final wide frame) ----
const HOR = 622;                                     // horizon
const RING = { x: 960, y: 905, rx: 480, ry: 92 };    // fire circle on the ground
const EMB = { x: 960, y: 360, R: 250, Rm: 205 };     // ouroboros centreline radius, medallion radius
const PAL = {
  bone: [226, 208, 172], gold: [246, 188, 64], goldHi: [255, 226, 150], ember: [255, 110, 30], oxblood: [92, 24, 18],
  rust: [140, 52, 26], umber: [40, 20, 14], char: [16, 9, 7], bronze: [120, 78, 38], bronzeD: [58, 36, 18], verd: [52, 70, 56],
};

// ---- global light levels ----
function fireLevel(t) {
  let v = 0;
  v += .22 * smooth(inv(CUE.fuse, CUE.pyre, t));                 // ring line
  v += .78 * ease.out(inv(CUE.pyre, CUE.pyre + .5, t));          // pyre
  v += .5 * hit(t, CUE.pyre, 3) + .45 * hit(t, CUE.bite, 2.5) + .25 * hit(t, CUE.peak, 3);
  v *= 1 - .38 * smooth(inv(CUE.breath, CUE.scorch, t)) + .38 * smooth(inv(CUE.ignite, CUE.gold, t));
  v += .35 * hit(t, CUE.gold, 2.2);
  return v * (1 + .06 * snoise(t * 6, 3) + .04 * snoise(t * 13, 5));
}
let FIRE = 0;

// ---- camera ----
function camera(t) {
  const [cx, cy, z] = kf(t, [
    [0, [960, 170, 1.8]],
    [CUE.sky, [960, 185, 1.78]],
    [CUE.mesas, [960, 470, 1.32], ease.inOut],
    [CUE.tree, [960, 640, 1.3], ease.inOut],
    [CUE.fuse, [960, 700, 1.3], ease.sine],
    [CUE.inkStart, [960, 745, 1.42], ease.sine],
    [CUE.bite - .05, [960, 385, 1.12], (x) => ease.inOut(x)],
    [CUE.runes[0], [960, 372, 1.42], ease.out2],
    [CUE.peak, [960, 362, 1.72], ease.sine],
    [CUE.scorch + .3, [960, 540, 1.0], ease.inOut],
    [NFRAMES / FPS, [960, 505, 1.1], ease.inOut],
  ]);
  const punch = .06 * hit(t, CUE.pyre, 5) + .09 * hit(t, CUE.bite, 4) + .02 * hits(t, CUE.rim, 9) + .03 * hits(t, CUE.runes, 8) + .03 * hit(t, CUE.peak, 5) + .025 * hit(t, CUE.gold, 4);
  const sh = 9 * hit(t, CUE.bite, 5) + 3 * hit(t, CUE.pyre, 6) + 3 * hit(t, CUE.peak, 6);
  const kk = Math.floor(t * 24);
  const hand = [snoise(t * .35, 21) * 5, snoise(t * .3, 22) * 4];   // slow handheld drift, not a locked-off camera
  const rot = kf(t, [[CUE.bite, 0], [CUE.runes[0], -.018], [CUE.peak, .012], [CUE.scorch + .3, 0]], ease.sine) + snoise(t * .2, 23) * .004;
  CAM = { cx: cx + hand[0] + (hash(kk * 3 + 1) - .5) * 2 * sh, cy: cy + hand[1] + (hash(kk * 3 + 2) - .5) * 2 * sh, zoom: z * (1 + punch), rot };
}

// ---------------- sky ----------------
const STARS = (() => { const r = rng(7), o = []; for (let i = 0; i < 520; i++) { const x = r() * 2600 - 340, y = r() * 760 - 160; o.push([x, y, Math.pow(r(), 3) * 2.4 + .5, r()]); } return o; })();
function sky(t) {
  const p = inv(CUE.sky - .15, CUE.sky + 1.5, t);
  layer(.5, () => {
    // pre-dawn nothing: near black. The sky paints in with broad horizontal dabs from the horizon up.
    s.fillStyle = '#050407'; s.fillRect(-900, -700, 3700, 2600);
    reveal(s, 'sky', [-500, -300, 2420, 760], p, [0, -1], () => {
      s.fillStyle = vgrad(s, -300, 700, [[0, '#040409'], [.4, '#0b0913'], [.64, '#1d0d16'], [.82, '#3e1512'], [.93, '#6e2814'], [1, '#93401a']]);
      s.fillRect(-900, -700, 3700, 2600);
      // milky way: a faint diagonal river of dust
      s.save(); s.translate(960, 180); s.rotate(-.42); s.globalAlpha = .55 + .2 * hit(t, CUE.meteor, 1.2);
      for (let i = 0; i < 40; i++) { const x = (i / 40 - .5) * 2600, y = snoise(i * .4, 3) * 60; s.fillStyle = rgba([70, 52, 70], .12); s.beginPath(); s.ellipse(x, y, 180, 50 + 30 * noise1(i, 4), 0, 0, TAU); s.fill(); }
      s.restore();
    }, 170, 320);
    // clouds: long banks, undersides lit by the fire once it burns
    clouds(t, p);
    // stars on the light layer so the brush never smears them
    const sa = smooth(inv(CUE.sky - .3, CUE.sky + 1.2, t)) * (1 - .5 * FIRE / 1.4);
    for (const [x, y, r, ph] of STARS) {
      const tw = .55 + .45 * Math.sin(t * (1.5 + ph * 3) + ph * 40) * (ph > .7 ? 1 : .3);
      if (y > HOR - 40) continue;
      dot(f, x, y, r * .9, rgba([255, 236, 210], sa * tw * (.35 + .65 * (1 - y / HOR))));
    }
    // two pickup sparks before anything else exists
    CUE.pick.forEach((c, i) => glow(900 + i * 140, 190 - i * 30, 26, 'rgba(255,190,120,1)', hit(t, c, 3.2) * .9));
    // meteor on D1
    const mp = inv(CUE.meteor, CUE.meteor + .55, t);
    if (mp > 0 && mp < 1) {
      const x0 = 1500, y0 = -40, x1 = 780, y1 = 330, u = ease.out(mp);
      const hx = lerp(x0, x1, u), hy = lerp(y0, y1, u), tx = lerp(x0, x1, Math.max(0, u - .28)), ty = lerp(y0, y1, Math.max(0, u - .28));
      f.save(); f.globalCompositeOperation = 'lighter'; const gr = f.createLinearGradient(tx, ty, hx, hy); gr.addColorStop(0, 'rgba(255,200,150,0)'); gr.addColorStop(1, `rgba(255,236,200,${.9 * (1 - mp)})`);
      f.strokeStyle = gr; f.lineWidth = 3; f.lineCap = 'round'; f.beginPath(); f.moveTo(tx, ty); f.lineTo(hx, hy); f.stroke(); f.restore();
      glow(hx, hy, 30, 'rgba(255,230,190,1)', .8 * (1 - mp));
    }
  });
}
const CLOUDS = (() => { const r = rng(31), o = []; for (let b = 0; b < 3; b++) { const y = 20 + b * 105 + r() * 30, x0 = -700 + r() * 300; let x = x0; while (x < 2700) { const len = 260 + r() * 520; const puffs = []; for (let i = 0; i < 9; i++) puffs.push([(i / 8 - .5) * len, -Math.pow(Math.sin(i / 8 * Math.PI), 1.3) * (30 + r() * 40), 40 + r() * 50]); o.push({ b, x: x + len / 2, y: y + (r() - .5) * 40, puffs }); x += len + 220 + r() * 520; } } return o; })();
function clouds(t, p) {
  const lit = clamp(FIRE / 1.2);
  reveal(s, 'clouds', [-700, -120, 2700, 560], p, [1, -.2], () => {
    for (const c of CLOUDS) {
      const x = c.x + t * (5 + c.b * 3), y = c.y, depth = c.b / 3;
      const body = mixc([12, 9, 16], [22, 12, 17], depth);
      s.fillStyle = rgba(body, .92);
      for (const [dx, dy, r] of c.puffs) { s.beginPath(); s.ellipse(x + dx, y + dy, r * 1.25, r * .8, 0, 0, TAU); s.fill(); }
      s.beginPath(); s.ellipse(x, y + 6, Math.abs(c.puffs[0][0]) + 40, 26, 0, 0, TAU); s.fill();
      // underside: dusk ember, then firelight
      const warm = mixc([110, 38, 24], [230, 110, 44], lit), a = (.2 + .15 * depth) * (.4 + .8 * lit);
      k.save(); k.globalAlpha = a * .5; inkLine(k, c.puffs.map(([dx, dy, r]) => [x + dx, y + 26 + dy * .08]), rgba(warm, 1), 2.2, (c.x | 0) + c.b, { wob: 1.2, dry: .35 }); k.restore();
    }
  }, 140, 300);
}

// ---------------- land ----------------
function mesaPath(g, pts, bottom) { g.beginPath(); g.moveTo(pts[0][0], bottom); for (const [x, y] of pts) g.lineTo(x, y); g.lineTo(pts[pts.length - 1][0], bottom); g.closePath(); }
function butte(x, w, h, seed, jag = 1) {   // flat top, steep cliffs, talus skirts
  const r = rng(seed), top = HOR - h, o = [[x - w * .9, HOR + 4]];
  o.push([x - w * .62, HOR - h * .28]); o.push([x - w * .5, top + h * .18 * r()]); o.push([x - w * .47, top]);
  for (let i = 1; i < 6; i++) o.push([x - w * .47 + i * w * .94 / 6, top + (r() - .5) * 8 * jag]);
  o.push([x + w * .47, top]); o.push([x + w * .52, top + h * .25]); o.push([x + w * .66, HOR - h * .3]); o.push([x + w * .95, HOR + 4]);
  return o;
}
const FAR = [butte(250, 380, 190, 3), butte(720, 200, 95, 5), butte(1290, 470, 235, 7), butte(1830, 280, 140, 9)];
const MID = [butte(-40, 520, 60, 11, 2), butte(1560, 640, 48, 13, 2)];
function land(t) {
  const lit = clamp(FIRE / 1.2);
  const pm = inv(CUE.mesas - .1, CUE.mesas + 1.1, t);
  layer(.55, () => {
    reveal(s, 'far', [-400, HOR - 180, 2300, HOR + 20], pm, [1, 0], () => {
      for (const m of FAR) {
        mesaPath(s, m, HOR + 40); s.fillStyle = vgrad(s, HOR - 240, HOR, [[0, '#4a1a12'], [.5, '#2e100c'], [1, '#160908']]); s.fill();
        // the west faces hold the last of the dusk; fire picks out the east ones later
        s.save(); mesaPath(s, m, HOR + 40); s.clip();
        const x0 = m[0][0], x1 = m[m.length - 1][0], top = m[3][1];
        s.fillStyle = rgba([150, 58, 30], .45 + .25 * lit); s.beginPath(); s.moveTo(x0, HOR); s.lineTo(m[3][0], top); s.lineTo(m[3][0] + 40, top); s.lineTo(x0 + 90, HOR); s.fill();
        for (let q = 0; q < 12; q++) { const xx = lerp(m[3][0], m[m.length - 4][0], q / 11); s.fillStyle = rgba([12, 5, 4], .35); s.fillRect(xx, top + 10 + 12 * hash(q + x0 | 0), 4 + 6 * hash(q * 3 + x0 | 0), HOR - top); }
        s.fillStyle = rgba([60, 20, 12], .6); s.fillRect(x0, top + (HOR - top) * .42, x1 - x0, 5);
        s.restore();
      }
      // dusk rim on the flat tops
      for (const m of FAR) { k.save(); k.globalAlpha = .5 * pm; inkLine(k, m.slice(2, -2), 'rgba(200,90,50,.55)', 2.2, m[3][0] | 0, { wob: .6 }); k.restore(); }
    }, 70, 150);
  });
  layer(.8, () => {
    reveal(s, 'mid', [-500, HOR - 90, 2400, HOR + 80], inv(CUE.mesas + .3, CUE.mesas + 1.4, t), [-1, 0], () => {
      for (const m of MID) { mesaPath(s, m, HOR + 120); s.fillStyle = vgrad(s, HOR - 60, HOR + 60, [[0, '#2c110b'], [1, '#170806']]); s.fill(); }
    }, 60, 150);
  });
  layer(1, () => {
    const gb = smooth(inv(CUE.mesas - .1, CUE.mesas + .9, t)); if (gb > 0) { s.fillStyle = vgrad(s, HOR - 10, HOR + 160, [[0, rgba([20, 8, 7], 0)], [.35, rgba([20, 8, 7], gb)], [1, rgba([20, 8, 7], gb)]]); s.fillRect(-900, HOR - 10, 3700, 910); }
    // desert floor: painted in on the mesa cue, lit from the pyre
    reveal(s, 'ground', [-300, HOR - 10, 2300, 1400], inv(CUE.mesas + .2, CUE.skull + .5, t), [0, 1], () => {
      s.fillStyle = vgrad(s, HOR, 1250, [[0, '#2a110c'], [.3, '#34160e'], [1, '#1a0a07']]); s.fillRect(-900, HOR, 3700, 900);
      // strata of sand and stone in long strokes
      const r = rng(41); for (let i = 0; i < 90; i++) { const y = HOR + 8 + Math.pow(r(), 1.5) * 520, x = r() * 2600 - 300, d = (y - HOR) / 300; s.fillStyle = rgba(r() < .5 ? [58, 26, 15] : [20, 9, 7], .35); s.beginPath(); s.ellipse(x, y, 40 + r() * 160 * d, 3 + 7 * d, 0, 0, TAU); s.fill(); }
      // sage and rock tufts, silhouettes against the lit sand
      for (let i = 0; i < 26; i++) { const y = HOR + 30 + Math.pow(r(), 1.2) * 460, x = r() * 2400 - 250, d = .4 + (y - HOR) / 400; if (Math.abs(x - RING.x) < RING.rx + 60 && Math.abs(y - RING.y) < RING.ry + 40) continue; for (let q = 0; q < 5; q++) { s.fillStyle = rgba([14, 7, 5], .9); s.beginPath(); s.ellipse(x + (q - 2) * 9 * d, y - 6 * d * Math.sin(q), 12 * d, 9 * d, 0, 0, TAU); s.fill(); } }
      // firelight pool on the ground
      if (lit > 0) { s.fillStyle = rgrad(s, RING.x, RING.y - 10, 20, 900, [[0, rgba([190, 90, 36], .75 * lit)], [.35, rgba([130, 50, 22], .45 * lit)], [1, 'rgba(0,0,0,0)']]); s.fillRect(-400, HOR, 2800, 900); }
    }, 80, 220);
  });
}

// ---------------- ram skull (foreground, left) ----------------
function ramSkull(t) {
  const p = inv(CUE.skull - .05, CUE.skull + .7, t); if (p <= 0) return;
  const lit = clamp(FIRE / 1.2);
  layer(1.12, () => {
    const X = 470, Y = 950, S = 175;
    reveal(s, 'skullrock', [X - 360, Y - 120, X + 380, Y + 260], p, [1, -1], () => {
      // the rock it rests on
      poly(s, [[X - 380, Y + 300], [X - 330, Y + 40], [X - 150, Y - 10], [X + 120, Y + 10], [X + 330, Y + 80], [X + 400, Y + 300]], '#1c0c08');
      s.fillStyle = rgba([150, 64, 28], .55 * lit); s.beginPath(); s.moveTo(X - 150, Y - 8); s.lineTo(X + 120, Y + 12); s.lineTo(X + 330, Y + 82); s.lineTo(X + 300, Y + 110); s.lineTo(X - 120, Y + 30); s.closePath(); s.fill();
    }, 40, 160);
    reveal(s, 'skull', [X - 260, Y - 280, X + 260, Y + 80], inv(CUE.skull, CUE.skull + .75, t), [0, 1], () => {
      s.save(); s.translate(X, Y - 70); s.rotate(-.12);
      const bone = mixc([24, 17, 14], [104, 68, 44], .15 + .45 * lit), shade = mixc([16, 10, 8], [48, 26, 16], lit);
      // horns: thick ridged spirals curling back and down on each side
      for (const sd of [-1, 1]) {
        const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60, a = -1.2 + u * 4.2, r = (1 - u * .62) * S * .55; pts.push([sd * (S * .28 + Math.cos(a) * r * .9) + sd * u * S * .12, -S * .45 + Math.sin(a) * r * .8 + u * S * .2]); }
        for (let i = 0; i < pts.length - 1; i++) { const u = i / 60; s.strokeStyle = rgba(mixc(shade, bone, .5 + .12 * Math.sin(i * .9)), 1); s.lineWidth = S * (.24 - u * .17); s.lineCap = 'round'; s.beginPath(); s.moveTo(...pts[i]); s.lineTo(...pts[i + 1]); s.stroke(); }
      }
      // cranium and long snout
      s.fillStyle = rgba(bone, 1); s.beginPath();
      s.moveTo(-S * .34, -S * .5); s.bezierCurveTo(-S * .3, -S * .78, S * .3, -S * .78, S * .34, -S * .5);
      s.bezierCurveTo(S * .36, -S * .2, S * .22, S * .1, S * .13, S * .45); s.bezierCurveTo(S * .1, S * .6, -S * .1, S * .6, -S * .13, S * .45);
      s.bezierCurveTo(-S * .22, S * .1, -S * .36, -S * .2, -S * .34, -S * .5); s.fill();
      // shading on the side away from the fire (fire is to the right)
      s.fillStyle = rgba(shade, .75); s.beginPath(); s.moveTo(-S * .34, -S * .5); s.bezierCurveTo(-S * .36, -S * .2, -S * .22, S * .1, -S * .13, S * .45); s.lineTo(-S * .02, S * .45); s.bezierCurveTo(-S * .1, 0, -S * .2, -S * .3, -S * .1, -S * .7); s.closePath(); s.fill();
      // eye sockets, nasal opening
      for (const sd of [-1, 1]) { s.fillStyle = '#0c0605'; s.beginPath(); s.ellipse(sd * S * .17, -S * .34, S * .085, S * .07, sd * .5, 0, TAU); s.fill(); }
      s.fillStyle = '#140907'; s.beginPath(); s.ellipse(0, S * .38, S * .06, S * .1, 0, 0, TAU); s.fill();
      s.restore();
      // firelight rim on the right-hand edges (the pyre is to the right)
      k.save(); k.translate(X, Y - 70); k.rotate(-.12); k.globalAlpha = .4 + .5 * lit;
      inkLine(k, bez([S * .3, -S * .66], [S * .38, -S * .4], [S * .26, S * .05], [S * .13, S * .47], 30), rgba(mixc([170, 170, 190], [255, 150, 70], lit), .9), 4, 3, { taper: .2, wob: .6 });
      const hp = []; for (let i = 8; i <= 56; i++) { const u = i / 60, a = -1.2 + u * 4.2, r = (1 - u * .62) * S * .55; hp.push([(S * .28 + Math.cos(a) * r * .9) + u * S * .12 + Math.cos(a) * S * (.12 - u * .085), -S * .45 + Math.sin(a) * r * .8 + u * S * .2 + Math.sin(a) * S * (.12 - u * .085)]); }
      inkLine(k, hp.filter(([x, y], i) => Math.cos(-1.2 + (i + 8) / 60 * 4.2) > -.2), rgba(mixc([160, 160, 180], [255, 140, 60], lit), .85), 3.4, 5, { taper: .2, wob: .5 });
      k.restore();
      // ink: cracks and horn ridges
      k.save(); k.translate(X, Y - 70); k.rotate(-.12); k.globalAlpha = .75 * inv(CUE.skull + .3, CUE.skull + 1, t);
      for (const sd of [-1, 1]) for (let i = 4; i < 56; i += 4) { const u = i / 60, a = -1.2 + u * 4.2, r = (1 - u * .62) * S * .55; const cx = sd * (S * .28 + Math.cos(a) * r * .9) + sd * u * S * .12, cy = -S * .45 + Math.sin(a) * r * .8 + u * S * .2; const nx = Math.cos(a), ny = Math.sin(a), w = S * (.12 - u * .085); line(k, [[cx - sd * nx * w, cy - ny * w], [cx + sd * nx * w, cy + ny * w]], 'rgba(8,4,3,.45)', 1.4); }
      inkLine(k, [[0, -S * .7], [S * .03, -S * .5], [-S * .02, -S * .3], [S * .02, -S * .05]], 'rgba(40,20,12,.8)', 2, 9);
      k.restore();
      // a spark of firelight in the right eye socket
      glow(X + S * .17, Y - 70 - S * .34, 18, 'rgba(255,120,40,1)', .5 * lit * (0.7 + .3 * snoise(t * 5, 8)));
    }, 60, 90);
  });
}

// ---------------- dead juniper on the right ridge ----------------
const TREE = (() => { const segs = []; const r = rng(77);
  function br(x, y, a, len, w, d) { const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len; segs.push([x, y, x2, y2, w, d]); if (d > 6 || len < 8) return; const n = d < 2 ? 2 : (r() < .6 ? 2 : 3); for (let i = 0; i < n; i++) br(x2, y2, a + (r() - .5) * 1.3 + (i - (n - 1) / 2) * .35, len * (.62 + r() * .2), w * .64, d + 1); }
  br(1640, 690, -1.75, 110, 16, 0); return segs; })();
function deadTree(t) {
  const p = inv(CUE.tree, CUE.tree + 1.2, t); if (p <= 0) return;
  const lit = clamp(FIRE / 1.2);
  layer(.92, () => {
    poly(s, [[1440, 760], [1560, 690], [1720, 680], [1860, 720], [1960, 800]], '#1a0b08');
    for (const [x1, y1, x2, y2, w, d] of TREE) {
      const u = clamp((p * 8 - d) / 1.2); if (u <= 0) continue;
      const xe = lerp(x1, x2, u), ye = lerp(y1, y2, u);
      const g = w > 3 ? s : k; line(g, [[x1, y1], [xe, ye]], w > 3 ? '#140806' : 'rgba(20,9,6,.95)', Math.max(1.2, w), 'round');
      if (w > 5 && lit > 0) line(s, [[x1 - 2, y1], [xe - 2, ye]], rgba([170, 70, 30], .5 * lit), w * .3);
    }
  });
}

// ---------------- the fire circle ----------------
const ringPt = (a, rx = RING.rx, ry = RING.ry) => [RING.x + Math.cos(a) * rx, RING.y + Math.sin(a) * ry];
const TORCH_A = [-2.25, -.89, -2.8, -.34, 2.75, .39, 2.05, 1.09];     // back pair first, working forward; alternating sides
function fireCircle(t) {
  if (t < CUE.fuse - .5) return;
  const lit = clamp(FIRE / 1.2);
  layer(1, () => {
    // stones ring the circle (visible once the land is painted)
    for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, [x, y] = ringPt(a, RING.rx + 26, RING.ry + 8), sc = .6 + .5 * (y - RING.y + RING.ry) / (2 * RING.ry); s.fillStyle = rgba(mixc([24, 12, 9], [120, 60, 32], lit * (Math.sin(a) > 0 ? .6 : .9)), 1); s.beginPath(); s.ellipse(x, y, 16 * sc, 9 * sc, 0, 0, TAU); s.fill(); }
    // fuse: two sparks race from the front of the ring round to the back, leaving a low line of fire
    const fp = ease.inOut(inv(CUE.fuse, CUE.pyre, t));
    const a0 = Math.PI / 2;
    for (const sd of [-1, 1]) {
      const N = 60, pts = [];
      for (let i = 0; i <= N; i++) { const u = i / N; if (u > fp) break; pts.push(ringPt(a0 + sd * u * Math.PI)); }
      if (fp > 0) pts.push(ringPt(a0 + sd * fp * Math.PI));
      if (pts.length > 1) {
        line(s, pts, '#6a1e0a', 9); line(s, pts, '#c2481a', 4);
        f.save(); f.globalCompositeOperation = 'lighter'; f.filter = 'blur(4px)'; line(f, pts, 'rgba(255,110,30,.8)', 10); f.filter = 'none'; line(f, pts, 'rgba(255,190,110,.55)', 2.5); f.restore();
      }
      const LICK = 18;
      for (let i = 0; i <= LICK; i++) {
        const u = (i + .5 * hash(i * 7 + (sd > 0 ? 3 : 0))) / LICK; if (u > fp) break;
        const a = a0 + sd * u * Math.PI, [x, y] = ringPt(a), sc = .6 + .4 * (Math.sin(a) * .5 + .5);
        const age = (fp - u) * (CUE.pyre - CUE.fuse);
        const hh = (26 + 22 * noise1(i * 1.7 + t * 2.5, sd + 3)) * sc * (1 + .5 * FIRE + 2.4 * hit(t, CUE.scorch, 2.4)) * clamp(age * 3 + .15);
        flame(x, y, hh, 12 * sc, t, i * 13 + (sd > 0 ? 500 : 0), .9, { lightK: .75, srcK: .9, n: 3 });
      }
      if (fp > 0 && fp < 1) { const [x, y] = ringPt(a0 + sd * fp * Math.PI); glow(x, y - 6, 40, 'rgba(255,220,160,1)', .95); glow(x, y, 110, 'rgba(255,120,40,1)', .35); }
    }
    // torches: charred posts, lit in pairs on half-bars
    const order = TORCH_A.map((a, i) => ({ a, i, y: ringPt(a)[1] })).sort((p, q) => p.y - q.y);
    for (const { a, i } of order) {
      const [x, y] = ringPt(a, RING.rx + 40, RING.ry + 14), sc = .7 + .45 * (y - (RING.y - RING.ry)) / (2 * RING.ry);
      const h = 150 * sc;
      if (lit > .05) { const dx = x - RING.x, dy = y - RING.y, L = Math.hypot(dx, dy * 3) || 1; s.save(); s.globalAlpha = .5 * lit; line(s, [[x, y], [x + dx / L * 420, y + dy / L * 140]], '#120604', 10 * sc); s.restore(); }
      line(s, [[x, y], [x + 2, y - h]], '#140906', 12 * sc); line(s, [[x - 3 * sc, y], [x - 1, y - h]], rgba([130, 60, 28], .6 * lit), 3 * sc);
      k.save(); k.globalAlpha = .7; for (let q = 0; q < 3; q++) line(k, [[x - 6 * sc, y - h * .6 - q * 9 * sc], [x + 7 * sc, y - h * .62 - q * 9 * sc]], 'rgba(22,12,8,.9)', 2 * sc); k.restore();
      const c = CUE.torches[i >> 1]; const on = ease.out(inv(c, c + .25, t));
      if (on > 0) { flame(x + 1, y - h + 4, (54 + 30 * hit(t, c, 5) + 18 * hit(t, CUE.bite, 3)) * sc * on, 13 * sc, t, 900 + i * 37, 1, { lightK: 1.1 }); glow(x, y - h, 60 * sc, 'rgba(255,240,200,1)', .5 * hit(t, c, 6)); }
    }
    // the pyre: a teepee of charred logs at the centre
    const px = RING.x, py = RING.y - 4;
    const logs = [[-60, 0, -8, -110], [60, 0, 8, -110], [-30, 6, 12, -118], [34, 6, -10, -116], [-78, -4, 20, -96], [80, -4, -22, -98]];
    for (const [x1, y1, x2, y2] of logs) { line(s, [[px + x1, py + y1], [px + x2, py + y2]], '#120705', 15); line(s, [[px + x1 + 3, py + y1], [px + x2 + 2, py + y2]], rgba([180, 70, 24], .7 * lit), 4); }
    const pp = ease.out(inv(CUE.pyre - .05, CUE.pyre + .6, t));
    if (pp > 0) {
      const big = 1 + .45 * hit(t, CUE.pyre, 3) + .5 * hit(t, CUE.bite, 3) + .2 * hits(t, CUE.rim, 8) + .3 * hit(t, CUE.peak, 4) + .4 * hit(t, CUE.gold, 3);
      const breath = 1 - .3 * smooth(inv(CUE.breath, CUE.scorch, t)) + .3 * smooth(inv(CUE.ignite, CUE.gold, t));
      const h = 200 * pp * big * breath * (1 + .25 * F('low', t));
      flame(px - 34, py - 30, h * .72, 42, t, 71, 1, { lean: -.08, lightK: .5 });
      flame(px + 30, py - 30, h * .78, 44, t, 72, 1, { lean: .08, lightK: .5 });
      flame(px, py - 20, h, 58, t, 73, 1, { n: 7, lightK: .55, coreK: .5 });
      glow(px, py - h * .4, 420, 'rgba(255,100,36,1)', .2 * pp * breath);
      glow(px, py - 60, 90, 'rgba(255,190,110,1)', .5 * hit(t, CUE.pyre, 4));
      // a few embers, restrained
      for (let i = 0; i < 18; i++) {
        const life = 2.2 + hash(i * 7) * 1.6, t0 = CUE.pyre + hash(i * 3) * life, age = ((t - t0) % life + life) % life;
        if (t < t0) continue;
        const u = age / life, ex = px + (hash(i * 11) - .5) * 80 + snoise(t * .9 + i, 60 + i) * 60 * u, ey = py - 80 - u * (380 + hash(i * 5) * 300);
        dot(f, ex, ey, 1.6 + hash(i) * 1.6, rgba([255, 170, 80], (1 - u) * .9 * pp));
      }
    }
  });
}

// ---------------- smoke column ----------------
function smoke(t) {
  const a = smooth(inv(CUE.pyre + .4, CUE.inkStart + .8, t)) * (1 - .4 * smooth(inv(CUE.breath, CUE.scorch, t)));
  if (a <= 0) return;
  layer(.97, () => {
    for (let i = 0; i < 46; i++) {
      const life = 5 + hash(i * 17) * 3, t0 = CUE.pyre + hash(i * 29) * life, age = ((t - t0) % life + life) % life;
      if (t < t0) continue;
      const u = age / life, y = RING.y - 180 - u * 820, x = RING.x + snoise(u * 2 + i * .3, 90 + i) * (40 + 260 * u) + (hash(i) - .5) * 60;
      const r = 50 + u * 170, al = a * Math.sin(u * Math.PI) * .12;
      s.fillStyle = rgba(mixc([34, 24, 24], [90, 48, 32], clamp(FIRE / 1.3) * (1 - u)), al); s.beginPath(); s.ellipse(x, y, r, r * .7, snoise(i, 3), 0, TAU); s.fill();
    }
  });
}

// ---------------- the ouroboros ----------------
// It is inked tail first, clockwise, around a circle in the smoke. The head arrives last and bites on the kick at 14.08.
const OB = { a0: -Math.PI / 2 + .34, span: TAU - .5 };
function obWidth(u) { return 36 * Math.min(1, .25 + u * 3.2) * (1 - .1 * u); }  // tail tapers in
function obPt(u, off = 0) { const a = OB.a0 + u * OB.span, R = EMB.R + off; return [EMB.x + Math.cos(a) * R, EMB.y + Math.sin(a) * R]; }
function ouroboros(t, em) {
  const pen = kf(t, [[CUE.inkStart, 0], [CUE.swell, .38, ease.in2], [CUE.bite - .42, 1, ease.inOut]]);  // accelerates into the swell
  if (pen <= 0) return;
  const headP = ease.out(inv(CUE.bite - .5, CUE.bite - .08, t));
  const bite = ease.back(inv(CUE.bite - .08, CUE.bite + .06, t));
  const wave = inv(CUE.bite, CUE.pour, t);  // gold runs round the scales from the head
  const { sc = 1, dy = 0, dim = 0 } = em;
  const glowK = 1 - dim;
  layer(1, () => {
    for (const g of [s, f, k]) { g.translate(EMB.x, EMB.y + dy); g.scale(sc, sc); g.translate(-EMB.x, -EMB.y); }
    const N = 180, n = Math.floor(N * pen);
    // body underpainting (brushed): dark bronze with firelight on the lower edge
    for (let i = 0; i < n; i++) {
      const u = i / N, w = obWidth(u), [x, y] = obPt(u), [x2, y2] = obPt((i + 1.4) / N);
      line(s, [[x, y], [x2, y2]], rgba(mixc(PAL.bronzeD, PAL.bronze, .3 + .4 * Math.max(0, Math.sin(OB.a0 + u * OB.span))), 1), w * 2, 'butt');
    }
    // contours: two hand-inked lines, outer and inner
    for (const sd of [1, -1]) {
      const pts = []; for (let i = 0; i <= n; i++) { const u = i / N; pts.push(obPt(u, sd * obWidth(u))); }
      inkLine(k, pts, 'rgba(232,206,160,.95)', 4.2, sd > 0 ? 3 : 4, { taper: .05, wob: .7 });
      inkLine(k, pts.map(([x, y]) => [x + 1.5, y + 1.5]), 'rgba(18,9,6,.8)', 2.2, sd > 0 ? 5 : 6, { taper: .05, wob: .5 });
    }
    // scales: overlapping arcs laid a beat behind the pen, three per row; they light gold in a wave after the bite
    const rows = Math.floor(n * .82);
    for (let i = 3; i < rows; i += 2) {
      const u = i / N, w = obWidth(u), a = OB.a0 + u * OB.span;
      const gw = clamp((wave * 1.15 - (1 - u)) * 6);   // wave travels from the head (u=1) back to the tail
      const col = gw > 0 ? rgba(mixc(PAL.bone, PAL.goldHi, gw), .95) : 'rgba(222,196,150,.8)';
      for (let j = -1; j <= 1; j++) {
        const off = j * w * .55 * (i % 4 === 1 ? 1 : .9) + (i % 4 === 1 ? w * .25 : -w * .1);
        if (Math.abs(off) > w * .9) continue;
        const [cx, cy] = obPt(u, off);
        k.strokeStyle = col; k.lineWidth = 2.1; k.lineCap = 'round';
        k.beginPath(); k.arc(cx, cy, w * .36, a + Math.PI * .5 - 1.1 + Math.PI, a + Math.PI * .5 + 1.1 + Math.PI); k.stroke();
      }
      // dorsal spines on the outer edge
      if (i % 6 === 3 && u > .12) { const [bx, by] = obPt(u, w), [tx, ty] = obPt(u - .012, w + 14 + 6 * Math.sin(i)); inkLine(k, [[bx, by], [tx, ty]], 'rgba(232,206,160,.9)', 3, i); }
      if (gw > 0 && gw < 1) glow(...obPt(u), 36, 'rgba(255,190,90,1)', .5 * (1 - gw) * glowK);
    }
    // the pen tip: a hot point of light where the ink is being laid
    if (pen < 1) { const [x, y] = obPt(pen); glow(x, y, 26, 'rgba(255,240,210,1)', .9); glow(x, y, 90, 'rgba(255,140,50,1)', .35); }
    // the head: inked in the last half second, jaws closing on the tail
    if (headP > 0) head(t, headP, bite, glowK);
    // bite flash: a ring of light runs round the body
    const bf = hit(t, CUE.bite, 3.5);
    if (bf > .01) for (let i = 0; i < 36; i++) { const [x, y] = obPt(i / 36); glow(x, y, 70, 'rgba(255,170,70,1)', .35 * bf * glowK); }
  });
}
function head(t, hp, bite, glowK) {
  // local frame: at the end of the body, facing along the tangent (clockwise)
  const u = 1, [x, y] = obPt(u), a = OB.a0 + u * OB.span + Math.PI / 2 + .12;
  const HL = 118, jaw = lerp(.62, .1, bite);
  for (const g of [s, k, f]) { g.save(); g.translate(x, y); g.rotate(a); }
  // skull and upper jaw (underpainting), lower jaw hinged
  s.globalAlpha = hp;
  poly(s, [[-18, -42], [40, -40], [HL, -12], [HL + 4, -2], [40, -6], [-20, 8]], rgba(PAL.bronze, 1));
  s.save(); s.rotate(jaw * .5); poly(s, [[-10, 10], [40, 12], [HL - 12, 24], [HL - 16, 32], [30, 36], [-14, 38]], rgba(PAL.bronzeD, 1)); s.restore();
  s.globalAlpha = 1;
  // ink: the drawn head, stroke by stroke in hp order
  const strokes = [
    [[-24, -40], [10, -52], [44, -44], [HL, -14], [HL + 6, -2]],        // brow and snout
    [[HL + 6, -2], [70, -4], [30, -2], [-14, 6]],                        // upper lip
    [[34, -46], [18, -78], [4, -60]],                                    // horn
    [[4, -44], [-26, -72], [-18, -46]],                                  // back horn
  ];
  strokes.forEach((p, i) => { const q = clamp(hp * strokes.length - i); if (q > 0) inkLine(k, partial(p, q), 'rgba(236,210,164,.97)', 4.4, 40 + i, { taper: .12, wob: .5 }); });
  k.save(); k.rotate(jaw * .5);
  const jawP = clamp(hp * 1.4 - .4);
  if (jawP > 0) inkLine(k, partial([[-12, 12], [30, 34], [HL - 14, 30], [HL - 10, 20]], jawP), 'rgba(236,210,164,.97)', 4.2, 50, { taper: .12, wob: .5 });
  for (let i = 0; i < 6; i++) { const tx = 50 + i * 11; if (jawP > .5) line(k, [[tx, 22], [tx + 3, 12]], 'rgba(240,230,210,.9)', 2.4); }
  k.restore();
  for (let i = 0; i < 6; i++) { const tx = 52 + i * 11; if (hp > .7) line(k, [[tx, -4], [tx + 3, 7]], 'rgba(240,230,210,.9)', 2.4); }
  // the eye: an ember
  if (hp > .5) { dot(k, 34, -26, 6, 'rgba(30,10,4,1)'); glow(34, -26, 16, 'rgba(255,120,30,1)', (.9 + .5 * hit(t, CUE.bite, 3)) * glowK); dot(f, 34, -26, 3.2, 'rgba(255,200,120,1)'); }
  for (const g of [s, k, f]) g.restore();
}

// ---------------- the medallion ----------------
const RUNES = [
  [[[0, 0], [0, 1]], [[0, .15], [.45, 0]], [[0, .42], [.45, .27]]],                               // fehu
  [[[0, 1], [0, 0], [.45, .3], [.45, 1]]],                                                         // uruz
  [[[0, 0], [0, 1]], [[0, .28], [.4, .5], [0, .72]]],                                              // thurisaz
  [[[0, 0], [0, 1]], [[0, 0], [.4, .25]], [[0, .3], [.4, .55]]],                                   // ansuz
  [[[0, 1], [0, 0], [.4, .25], [0, .5], [.45, 1]]],                                                // raidho
  [[[.4, .2], [0, .5], [.4, .8]]],                                                                 // kaunan
  [[[0, 0], [.5, 1]], [[.5, 0], [0, 1]]],                                                          // gebo
  [[[0, 1], [0, 0], [.4, .2], [0, .45]]],                                                          // wunjo
  [[[0, 0], [0, 1]], [[.45, 0], [.45, 1]], [[0, .35], [.45, .6]]],                                 // hagalaz
  [[[.22, 0], [.22, 1]], [[0, .35], [.45, .6]]],                                                   // naudiz
  [[[.22, 0], [.22, 1]]],                                                                          // isa
  [[[.28, .05], [.05, .3], [.28, .55]], [[.18, .45], [.42, .7], [.18, .95]]],                      // jera
  [[[.22, 0], [.22, 1]], [[.22, 0], [.45, .18]], [[.22, 1], [0, .82]]],                            // eihwaz
  [[[.4, .2], [0, 0], [0, 1], [.4, .8]], [[.4, .2], [.4, .32]], [[.4, .8], [.4, .68]]],            // perth
  [[[.25, 0], [.25, 1]], [[.25, .42], [0, 0]], [[.25, .42], [.5, 0]]],                             // algiz
  [[[.42, 0], [0, .38], [.45, .62], [.03, 1]]],                                                    // sowilo
  [[[.25, 0], [.25, 1]], [[0, .3], [.25, 0], [.5, .3]]],                                           // tiwaz
  [[[0, 0], [0, 1]], [[0, 0], [.4, .25], [0, .5], [.4, .75], [0, 1]]],                             // berkanan
  [[[0, 1], [0, 0], [.25, .3], [.5, 0], [.5, 1]]],                                                 // ehwaz
  [[[0, 1], [0, 0], [.5, .42]], [[.5, 1], [.5, 0], [0, .42]]],                                     // mannaz
  [[[0, 1], [0, 0], [.4, .3]]],                                                                    // laguz
  [[[.25, .2], [.5, .5], [.25, .8], [0, .5], [.25, .2]]],                                          // ingwaz
  [[[0, 0], [0, 1], [.5, 0], [.5, 1], [0, 0]]],                                                    // dagaz
  [[[.1, 1], [.4, .45], [.25, .15], [.1, .45], [.4, 1]]],                                          // othala
];
function medallion(t, em) {
  const pour = ease.out(inv(CUE.pour, CUE.rim[0] - .1, t));
  if (pour <= 0) return;
  const { sc = 1, dy = 0, dim = 0 } = em, glowK = 1 - dim;
  const cx = EMB.x, cy = EMB.y, R = EMB.Rm;
  layer(1, () => {
    for (const g of [s, f, k]) { g.translate(cx, cy + dy); g.scale(sc, sc); g.translate(-cx, -cy); }
    // molten bronze spreads from the centre with a ragged, glowing edge
    const rr = R * pour;
    s.save(); s.beginPath();
    for (let i = 0; i <= 90; i++) { const a = i / 90 * TAU, r = rr * (1 + (pour < 1 ? .06 * snoise(a * 3 + t * 2, 7) : 0)); i ? s.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : s.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    s.closePath(); s.clip();
    s.fillStyle = rgrad(s, cx - 60, cy - 70, 10, R * 1.1, [[0, '#8e6232'], [.55, '#5e3c1c'], [1, '#2c1a0c']]); s.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    const r2 = rng(5); for (let i = 0; i < 40; i++) { s.fillStyle = rgba(r2() < .5 ? PAL.verd : [30, 18, 10], .25); s.beginPath(); s.ellipse(cx + (r2() - .5) * 2 * R, cy + (r2() - .5) * 2 * R, 10 + r2() * 30, 6 + r2() * 16, r2() * 3, 0, TAU); s.fill(); }
    s.restore();
    if (pour < 1) { k.save(); k.globalAlpha = .9; k.strokeStyle = 'rgba(255,180,90,.8)'; k.lineWidth = 3; k.beginPath(); k.arc(cx, cy, rr, 0, TAU); k.stroke(); k.restore(); glow(cx, cy, rr * 1.1, 'rgba(255,150,60,1)', .25 * glowK); }
    // rim: four quarters fly in and lock on the beat
    CUE.rim.forEach((c, q) => {
      const p = ease.out(inv(c - .32, c, t)); if (p <= 0) return;
      const a0 = q * TAU / 4 - Math.PI / 4 + (1 - p) * .9, off = (1 - p) * 260, dirA = a0 + TAU / 8;
      const ox = Math.cos(dirA) * off, oy = Math.sin(dirA) * off;
      k.save(); k.translate(ox, oy); k.globalAlpha = clamp(p * 1.5);
      k.lineCap = 'butt';
      k.strokeStyle = 'rgba(40,24,12,.95)'; k.lineWidth = 34; k.beginPath(); k.arc(cx, cy, R - 16, a0 + .01, a0 + TAU / 4 - .01); k.stroke();
      k.strokeStyle = 'rgba(176,124,58,.95)'; k.lineWidth = 28; k.beginPath(); k.arc(cx, cy, R - 16, a0 + .015, a0 + TAU / 4 - .015); k.stroke();
      k.strokeStyle = 'rgba(250,214,140,.85)'; k.lineWidth = 2.4; k.beginPath(); k.arc(cx, cy, R - 2, a0 + .02, a0 + TAU / 4 - .02); k.stroke(); k.beginPath(); k.arc(cx, cy, R - 30, a0 + .02, a0 + TAU / 4 - .02); k.stroke();
      k.restore();
      const lock = hit(t, c, 9); if (lock > .01) { const am = a0 + TAU / 4; glow(cx + Math.cos(am) * (R - 16), cy + Math.sin(am) * (R - 16), 60, 'rgba(255,220,160,1)', lock * glowK); }
    });
    // runes: stamped into the rim in four groups of six, glowing hot then cooling to gold
    RUNES.forEach((rn, i) => {
      const grp = i % 4, c = CUE.runes[grp]; const st = t - c; if (st < -0.02) return;
      const a = -Math.PI / 2 + (i / 24) * TAU + TAU / 48, rr2 = R - 16;
      const heat = Math.exp(-st * 2.4), sz = 23 * (1 + .5 * Math.exp(-st * 14));
      k.save(); k.translate(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2); k.rotate(a + Math.PI / 2);
      const col = rgba(mixc([255, 214, 140], [255, 250, 230], heat), 1);
      for (const seg of rn) { const pts = seg.map(([x, y]) => [(x - .25) * sz, (y - .5) * sz]); line(k, pts.map(([x, y]) => [x + 1, y + 1.2]), 'rgba(30,16,8,.9)', 3.2); line(k, pts, col, 2.4); }
      k.restore();
      if (heat > .05) glow(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2, 30, 'rgba(255,170,70,1)', .8 * heat * glowK);
    });
    // antler tree: grows from the base of the field, tines sprouting on beats
    const gp = ease.inOut(inv(CUE.antler, CUE.diamond - .1, t));
    if (gp > 0) antlers(t, cx, cy, gp, glowK);
    // the diamond between the antlers ignites, and a glint sweeps the metal
    const dp = ease.out(inv(CUE.diamond - .05, CUE.diamond + .3, t));
    if (dp > 0) {
      const dx = cx, dy2 = cy - 96, ds = 24 * dp;
      const pts = [[dx, dy2 - ds], [dx + ds * .8, dy2], [dx, dy2 + ds], [dx - ds * .8, dy2], [dx, dy2 - ds]];
      line(k, pts.map(([x, y]) => [x + 1.5, y + 1.5]), 'rgba(30,16,8,.9)', 7); line(k, pts, 'rgba(255,222,150,1)', 5);
      glow(dx, dy2, 80, 'rgba(255,200,110,1)', (.4 + 1.2 * hit(t, CUE.diamond, 3) + .8 * hit(t, CUE.peak, 3)) * glowK);
      const sw = inv(CUE.diamond, CUE.peak + .3, t);
      if (sw > 0 && sw < 1) { const ga = -2.4 + sw * 3.2; f.save(); f.globalCompositeOperation = 'lighter'; f.beginPath(); f.arc(cx, cy, R, 0, TAU); f.clip(); f.translate(cx, cy); f.rotate(ga); const gr = f.createLinearGradient(-60, 0, 60, 0); gr.addColorStop(0, 'rgba(255,220,160,0)'); gr.addColorStop(.5, `rgba(255,230,180,${.35 * glowK})`); gr.addColorStop(1, 'rgba(255,220,160,0)'); f.fillStyle = gr; f.fillRect(-60, -R, 120, 2 * R); f.restore(); }
    }
    // firelight wash on the whole disc
    glow(cx, cy + R * .7, R * 1.3, 'rgba(255,120,40,1)', .12 * FIRE * glowK);
  });
}
const ANTLER = (() => {
  const beams = [], tines = [];
  for (const sd of [-1, 1]) {
    const beam = bez([sd * 6, 138], [sd * 18, 60], [sd * 108, 20], [sd * 74, -128], 40); beams.push(beam);
    [[.34, 0], [.56, 1], [.78, 2]].forEach(([u, bi]) => { const [x, y] = beam[Math.round(u * 40)]; const len = [52, 48, 38][bi]; tines.push({ bi, pts: bez([x, y], [x - sd * len * .3, y - len * .2], [x - sd * len * .55, y - len * .6], [x - sd * len * .5, y - len], 16) }); });
    const [ox, oy] = beam[26]; tines.push({ bi: 1, pts: bez([ox, oy], [ox + sd * 20, oy - 6], [ox + sd * 34, oy - 20], [ox + sd * 36, oy - 38], 12) });
  }
  return { beams, tines };
})();
function antlers(t, cx, cy, gp, glowK) {
  const draw = (pts, w0, w1) => {
    const P = pts.map(([x, y]) => [cx + x, cy + y]);
    for (let i = 0; i < P.length - 1; i++) { const u = i / (P.length - 1), w = lerp(w0, w1, u); line(k, [[P[i][0] + 2, P[i][1] + 2], [P[i + 1][0] + 2, P[i + 1][1] + 2]], 'rgba(26,14,6,.9)', w + 2); }
    for (let i = 0; i < P.length - 1; i++) { const u = i / (P.length - 1), w = lerp(w0, w1, u); line(k, [P[i], P[i + 1]], 'rgba(192,140,66,1)', w); }
    for (let i = 0; i < P.length - 1; i++) { const u = i / (P.length - 1), w = lerp(w0, w1, u); line(k, [[P[i][0] - w * .22, P[i][1] - w * .22], [P[i + 1][0] - w * .22, P[i + 1][1] - w * .22]], 'rgba(255,226,160,.8)', Math.max(1, w * .22)); }
  };
  for (const b of ANTLER.beams) { const p = partial(b, gp); if (p.length > 1) draw(p, 15, lerp(15, 5, gp)); }
  for (const tn of ANTLER.tines) {
    const c = CUE.tines[tn.bi]; const q = ease.out(inv(c - .05, c + .3, t)); if (q <= 0) continue;
    const p = partial(tn.pts, q); if (p.length > 1) draw(p, 8, 3.5);
    const tip = p[p.length - 1]; glow(cx + tip[0], cy + tip[1], 24, 'rgba(255,200,120,1)', .8 * hit(t, c, 6) * glowK);
  }
}

// ---------------- finale: "the air it bends, the smoke twists" ----------------
// From 24.43 a twisted column of smoke rises from the pyre through the sigil; on the 25.24 hit the
// air bends it across the frame, still twisting as the first line starts at 25.84.
function smokeBend(t) {
  if (t < CUE.ignite - .05) return;
  const rise = ease.out(inv(CUE.ignite, CUE.ignite + 1.3, t));
  const bend = ease.inOut(inv(CUE.gold - .04, CUE.gold + .75, t));
  const surge = hit(t, CUE.gold, 2.5);
  const lit = clamp(FIRE / 1.2);
  layer(1, () => {
    const baseY = RING.y - 150, L = 1080 * rise;
    const ribbons = 7;
    for (let r = 0; r < ribbons; r++) {
      const ph = r / ribbons * TAU, pts = [];
      const N = 46;
      for (let i = 0; i <= N; i++) {
        const u = i / N; if (u * 1080 > L) break;
        const y = baseY - u * 1080;
        const twist = Math.sin(u * 5.2 + t * 2.4 + ph) * (34 + 150 * u);
        const lean = bend * (1050 * Math.pow(u, 1.4) - 220 * Math.sin(u * Math.PI));   // the column bows left, then the top swings right across frame
        const drift = snoise(u * 2 + t * .5, 200 + r) * 30 * u;
        pts.push([RING.x + twist + lean + drift, y + bend * (520 * Math.pow(u, 1.8) + 60 * Math.sin(ph) * u)]);   // and flattens toward horizontal
      }
      if (pts.length < 2) continue;
      const front = Math.cos(ph + t * 2.1) > 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const u = i / N, w = 24 + 110 * u + 40 * bend * u;
        const col = mixc([160, 74, 34], [64, 50, 50], clamp(u * 1.6 + .1));
        const a = (front ? .42 : .28) * Math.min(1, u * 8) * (1 - .5 * u) * (.8 + .4 * lit);
        line(s, [pts[i], pts[i + 1]], rgba(col, a), w);
      }
      // wispy inked edge on the near ribbons so the twist reads
      if (front) { k.save(); k.globalAlpha = .38 * rise; inkLine(k, pts.map(([x, y], i) => [x + (10 + 30 * i / N), y]), 'rgba(226,190,150,.8)', 2, 300 + r, { taper: .3, wob: 1.4, dry: .35 }); k.restore(); }
    }
    // firelight catching the underside of the column
    glow(RING.x, baseY - 120, 320, 'rgba(255,120,40,1)', (.12 + .25 * surge) * rise);
  });
}

// ---------------- emblem state across the breath ----------------
function emblemState(t) {
  const b = ease.inOut(inv(CUE.breath, CUE.scorch + .4, t));
  const rek = ease.out(inv(CUE.ignite, CUE.ignite + .45, t));   // the sigil relights on 24.43
  return { sc: lerp(1, .56, b), dy: lerp(0, -118, b), dim: .55 * b * (1 - .85 * rek) };
}

// ---------------- frame ----------------
function renderFrame(t, frame) {
  bindCtx(); resetCtx();
  fill(s, '#050407'); fill(f, '#000'); k.save(); k.setTransform(1, 0, 0, 1, 0, 0); k.clearRect(0, 0, W, H); k.restore();
  FIRE = fireLevel(t);
  camera(t);
  sky(t);
  land(t);
  deadTree(t);
  smoke(t);
  const em = emblemState(t);
  ouroboros(t, em);
  medallion(t, em);
  if (t >= CUE.scorch) layer(1, () => { const e = emblemState(t); glow(EMB.x, EMB.y + e.dy, 300 * e.sc, 'rgba(255,170,80,1)', .85 * hit(t, CUE.ignite, 2.6)); glow(RING.x, RING.y - 20, 640, 'rgba(255,110,40,1)', .35 * hit(t, CUE.scorch, 2.4)); });
  fireCircle(t);
  smokeBend(t);
  ramSkull(t);
  // black open: nothing painted until the pickups
  const open = 1 - smooth(inv(0, CUE.sky + .3, t));
  if (open > 0) screen(() => { s.fillStyle = rgba([5, 4, 7], open * .85); s.fillRect(0, 0, W, H); });
  const kk = Math.floor(t * 24);
  Paint.present(t, frame, {
    boil: 8, grain: .055, vig: .62, bloom: 1.05 + .4 * hit(t, CUE.bite, 3), hal: .55, dust: .55, torn: 20 + 6 * snoise(t * .3, 2),
    expo: 1 + .25 * hit(t, CUE.bite, 4) + .15 * hit(t, CUE.pyre, 4) + .12 * hit(t, CUE.gold, 3),
    weave: [(hash(kk * 5 + 1) - .5) * .9, (hash(kk * 5 + 2) - .5) * .9],
  });
}
