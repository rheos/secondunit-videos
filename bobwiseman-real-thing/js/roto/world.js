// Real Thing world kit: the lake, the canoe, the cast, and the rule that carries the whole film.
// THE RULE: real things are rotoscoped (they breathe, their fills slide under their lines); fake things are
// drawn dead still and flat, in brochure colours, with an even line (fake(fn)). The eye reads the difference
// without being told, so every "settle for less" image is a flat thing laid over a living one.
const env = (t, a, b, r = .3) => smooth(inv(a, a + r, t)) * (1 - smooth(inv(b - r, b, t)));
const q01 = (t, a, b) => smooth(inv(a, b, t));
function fake(fn) { const w = WOBK, r = REGK, h = HUE; WOBK = 0; REGK = 0; HUE = 0; try { fn(); } finally { WOBK = w; REGK = r; HUE = h; } }
function rect(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }

// ---- cast (anonymous invented people, not Bob, no likeness) ----
CAST.lead = { ...BASE, hairType: 'short', beard: true, build: 1.04,      // the man in the canoe: red toque, red jacket
  skin: [24, 34, 60], skinSh: [14, 30, 47], hair: [28, 30, 22], hairSh: [24, 30, 14],
  top: [6, 52, 40], topSh: [2, 50, 29], shirt: [40, 22, 80], shirtSh: [36, 18, 66], pants: [215, 20, 30], pantsSh: [218, 22, 20] };
CAST.slick = { ...BASE, hairType: 'short', build: 1.0,                   // the fake man: pale blue suit, slick dark hair
  skin: [18, 44, 70], skinSh: [10, 40, 58], hair: [230, 20, 14], hairSh: [230, 24, 8],
  top: [198, 36, 70], topSh: [204, 34, 56], shirt: [50, 20, 94], shirtSh: [45, 16, 80], pants: [200, 30, 62], pantsSh: [205, 30, 48] };
CAST.her = { ...BASE, hairType: 'long', build: .94,                      // the woman: yellow-green raincoat, auburn hair
  skin: [26, 40, 66], skinSh: [16, 34, 52], hair: [14, 52, 32], hairSh: [10, 52, 22],
  top: [62, 48, 52], topSh: [70, 44, 40], shirt: [200, 20, 80], shirtSh: [205, 18, 66] };
CAST.folk = { ...BASE, hairType: 'curly', build: .98, skin: [22, 36, 50], skinSh: [16, 36, 38], hair: [20, 25, 14], hairSh: [20, 25, 8],
  top: [160, 30, 38], topSh: [165, 30, 28], shirt: [45, 30, 80], shirtSh: [40, 26, 66] };
CAST.folk2 = { ...CAST.folk, hairType: 'long', skin: [26, 40, 64], skinSh: [16, 34, 50], hair: [40, 30, 70], hairSh: [36, 26, 56], top: [280, 22, 44], topSh: [276, 22, 32] };
CAST.folk3 = { ...CAST.folk, hairType: 'bald', beard: true, skin: [24, 30, 58], skinSh: [14, 28, 44], hair: [0, 0, 70], hairSh: [0, 0, 56], top: [30, 50, 46], topSh: [26, 48, 34] };
const who = (style, o) => ({ style, seed: 100, light: [12, -6], breath: 0, lean: 0, twist: 0, shrug: 0, turn: 0, tilt: 0, nod: 0, mouth: 0, blink: 0, brow: 0, ...o });
const breath = (t, sd = 0) => Math.sin(t * 1.6 + sd) * .5 + .5;
function blinkAt(t, seed) { const p = 3.2 + hash(seed) * 1.6, ph = ((t + hash(seed + 3) * 5) % p) / p; return ph < .05 ? Math.sin(ph / .05 * Math.PI) : 0; }

// a red toque on the lead's head (hc = head centre in screen units, k = person scale)
function toque(hc, k, tilt = 0, seed = 500) {
  withT(() => { s.translate(hc[0], hc[1]); s.rotate(tilt); s.scale(k * 1.12, k * 1.12);
    part([[-54, -24], [-50, -54], [-30, -78], [0, -86], [30, -78], [50, -54], [54, -24]], { fill: hsl(356, 62, 44), shade: hsl(350, 60, 32), shadeShift: [10, -6], seed, inkW: .9 });
    part([[-58, -34], [58, -34], [60, -18], [-60, -18]], { fill: hsl(356, 50, 36), seed: seed + 1, inkW: .8, sharp: 20 });
    part(ellipse(0, -92, 15, 13, 9), { fill: hsl(40, 30, 88), shade: hsl(30, 20, 70), shadeShift: [4, -3], seed: seed + 2, inkW: .7, tone2: false });
  });
}

// ---- the lake ----
function lakeSky(o = {}) {
  const hz = o.hz ?? 520, d = o.dawn ?? .4;
  s.fillStyle = vgrad(hz - 900, hz + 40, [[0, hsl(lerp(212, 220, d), 26, lerp(62, 66, d))], [.7, hsl(lerp(200, 28, d), 30, lerp(78, 80, d))], [1, hsl(lerp(190, 36, d), 40, lerp(86, 86, d))]]);
  s.fillRect(-2000, hz - 3000, 6000, 3040);
  if (d > .3) { s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(o.sunX ?? 1300, hz - 30, 10, 620, [[0, hsl(38, 80, 80, .6 * d)], [1, hsl(30, 80, 70, 0)]]); s.fillRect(-2000, hz - 3000, 6000, 3040); s.restore(); }
  const r = rng(o.seed || 3);
  for (let i = 0; i < 5; i++) { const cx = -300 + ((r() * 2600 + T * 9 * (.6 + r())) % 2600), cy = hz - 400 + r() * 260, rx = 140 + r() * 140;
    part(lump(cx, cy, rx, rx * .34, 70 + i), { fill: hsl(30, 30, 94, .85), shade: hsl(230, 18, 80, .8), shadeShift: [0, -rx * .2], seed: 70 + i, ink: false, wob: 1.5, hatch: false }); }
}
function hills(hz, seed = 10, o = {}) {
  part([[-1600, hz + 4], [-600, hz - 110], [-200, hz - 70], [300, hz - 170], [700, hz - 90], [1100, hz - 150], [1600, hz - 60], [2100, hz - 130], [3400, hz - 40], [3400, hz + 6]], { fill: hsl(222, 18, 56), shade: hsl(226, 20, 48), shadeShift: [0, -30], seed, ink: false, wob: 3 });
  const T0 = [[-1600, hz + 8]]; const r = rng(seed + 1);
  for (let x = -1600; x <= 3400; x += 46) T0.push([x, hz - 26 - r() * 34 - (r() < .25 ? 40 : 0)]);
  T0.push([3400, hz + 8]);
  part(T0, { fill: hsl(160, 26, 24), shade: hsl(165, 28, 17), shadeShift: [0, -16], seed: seed + 2, inkW: .7, dense: true, wob: 1.2 });
  if (o.billboards) for (const [x, h, sd] of o.billboards) billboard(x, hz - 10, h, sd, o.peel ? o.peel(sd) : 0);
}
// a shore billboard: its picture is the fake lake, flat and still. peel 0..1 blows it away.
function billboard(x, base, h, seed, peel = 0) {
  const w = h * 1.7;
  stroke([[x - w * .3, base], [x - w * .3, base - h * .9]], seed, .8); stroke([[x + w * .3, base], [x + w * .3, base - h * .9]], seed + 1, .8);
  if (peel >= 1) return;
  withT(() => {
    s.translate(x, base - h * .9 - h * .5); s.translate(peel * w * 3, -peel * h * 4); s.rotate(peel * 1.4); s.scale(1 - peel * .5, 1 - peel * .3);
    fake(() => brochurePic(-w / 2, -h / 2, w, h, seed, { frame: true }));
  });
}
// THE FAKE LAKE: the glossy brochure picture (sun, mountains, impossible blue, a leaping fish). Always inside fake().
function brochurePic(x, y, w, h, seed, o = {}) {
  withT(() => {
    s.translate(x, y); s.scale(w / 400, h / 240);
    if (o.frame) { s.fillStyle = '#fbf6ea'; s.fillRect(-10, -10, 420, 260); }
    s.save(); s.beginPath(); s.rect(0, 0, 400, 240); s.clip();
    s.fillStyle = vgrad(0, 140, [[0, '#3fb6e0'], [1, '#bdf0f2']]); s.fillRect(0, 0, 400, 140);
    poly([[0, 140], [90, 50], [150, 110], [220, 30], [310, 120], [400, 70], [400, 140]], '#8a7ad0');
    poly([[78, 62], [90, 50], [102, 64]], '#fff'); poly([[208, 44], [220, 30], [232, 46]], '#fff');
    dot(330, 48, 26, '#ffd23a');
    s.fillStyle = vgrad(140, 240, [[0, '#0aa0e6'], [1, '#0d6fd0']]); s.fillRect(0, 140, 400, 100);
    if (!o.noFish) { withT(() => { s.translate(150, 170); s.rotate(-.5); poly([[-30, 0], [-10, -12], [20, -10], [34, 0], [20, 10], [-10, 12]], '#ff7a4a'); poly([[-30, 0], [-46, -14], [-44, 14]], '#ff7a4a'); dot(22, -3, 2.5, '#222'); }); }
    s.restore();
    s.strokeStyle = '#1e2a40'; s.lineWidth = 2.2 * 400 / w; s.strokeRect(0, 0, 400, 240);
  });
}
// a flat brochure fish (fake): k = edge-on squash (1 face, 0 gone)
function flatFish(x, y, sc, ang, k = 1) {
  if (k <= .01) return;
  withT(() => { s.translate(x, y); s.rotate(ang); s.scale(sc, sc * k);
    poly([[-30, 0], [-10, -12], [20, -10], [34, 0], [20, 10], [-10, 12]], '#ff7a4a'); poly([[-30, 0], [-46, -14], [-44, 14]], '#ff7a4a'); dot(22, -3, 2.5, '#222');
    s.strokeStyle = '#1e2a40'; s.lineWidth = 1.2; s.beginPath(); s.moveTo(-30, 0); s.lineTo(-10, -12); s.lineTo(20, -10); s.lineTo(34, 0); s.lineTo(20, 10); s.lineTo(-10, 12); s.closePath(); s.stroke(); });
}
function water(hz, o = {}) {
  const g = o.grey ?? 0, live = 1 - g;
  part([[-1600, hz], [3400, hz], [3400, 2400], [-1600, 2400]], { fill: hsl(lerp(204, 210, g), lerp(32, 6, g), lerp(46, 52, g)), shade: hsl(210, lerp(30, 6, g), lerp(36, 44, g)), shadeShift: [0, -260], seed: 20, ink: false, wob: 4, sharp: 200 });
  s.save(); s.globalAlpha = .35 * live + .1; s.fillStyle = vgrad(hz, hz + 160, [[0, hsl(36, 50, 84)], [1, hsl(36, 50, 84, 0)]]); s.fillRect(-1600, hz, 5000, 160); s.restore();
  const n = o.n ?? 60, r = rng(o.seed || 21), fl = o.flow ?? 1;
  for (let i = 0; i < n; i++) { const yy = hz + 8 + Math.pow(r(), 1.6) * (1500 - hz), k = (yy - hz) / 600, xx = -1600 + ((r() * 5000 + T * 30 * fl * (.5 + k)) % 5000), L = 30 + k * 90;
    stroke([[xx, yy], [xx + L * .5, yy - 2 * k], [xx + L, yy]], 30 + i, .35 + k * .5, { col: hsl(200, 20 * live, lerp(80, 70, g), .55), alpha: .8 }); }
}
function mist(hz, amt, seed = 40) {
  if (amt <= .01) return;
  const r = rng(seed);
  for (let i = 0; i < 9; i++) { const cx = -400 + ((r() * 2900 + T * 16 * (.4 + r())) % 2900), cy = hz - 30 + r() * 120, rx = 260 + r() * 260;
    part(lump(cx, cy, rx, rx * .16, seed + i), { fill: hsl(40, 20, 94, .5 * amt), seed: seed + i, ink: false, wob: 2, tone2: false, hatch: false }); }
}
// ---- the canoe (side view, bow to +x), about 720 units long at sc 1 (CK: 1.2x long, 1.4x deep, so a seated
// paddler sits down in it with only chest, arms and head above the gunwale).
const CK = [1.2, 1.4]; // paddler goes between hull and front
function canoeHull(x, y, sc, rot, seed = 60) {
  withT(() => { s.translate(x, y); s.rotate(rot); s.scale(sc * CK[0], sc * CK[1]);
    part([[-300, -40], [-250, -10], [-120, 18], [0, 24], [120, 18], [250, -10], [306, -46], [290, -20], [200, 4], [0, 10], [-200, 4], [-286, -20]], { fill: hsl(14, 54, 32), shade: hsl(10, 52, 24), shadeShift: [0, -10], seed, inkW: 1 });
  });
}
function canoeFront(x, y, sc, rot, seed = 60) {
  withT(() => { s.translate(x, y); s.rotate(rot); s.scale(sc * CK[0], sc * CK[1]);
    part([[-306, -46], [-250, -14], [-120, 12], [0, 18], [120, 12], [250, -14], [310, -50], [292, 0], [200, 34], [0, 50], [-200, 34], [-292, 0]], { fill: hsl(14, 56, 46), shade: hsl(10, 54, 32), shadeShift: [0, -18], seed: seed + 1, inkW: 1.1 });
    stroke([[-300, -42], [-120, 14], [0, 20], [120, 14], [304, -46]], seed + 2, .9, { col: hsl(30, 40, 78) });
  });
  stroke([[x - 400 * sc, y + 64 * sc], [x, y + 78 * sc], [x + 400 * sc, y + 64 * sc]], seed + 3, .6, { col: hsl(200, 30, 86, .7) });
}
function paddlerPose(t, x, y, sc, o = {}) {
  const per = o.per ?? 2.4, ph = ((t + (o.ph || 0)) / per) % 1, k = o.still ? 0 : 1;
  const sw = Math.sin(ph * TAU) * k, dip = Math.cos(ph * TAU) * k;
  return who(CAST.lead, { x, y, sc, seed: 120, breath: breath(t), lean: .06 + sw * .06, twist: sw * .3, turn: o.turn ?? .3, tilt: o.tilt ?? 0, blink: blinkAt(t, 3),
    armL: [lerp(-1.0, -.5, sw * .5 + .5), lerp(1.7, 1.2, sw * .5 + .5), 0, .3, .9], armR: [lerp(.6, .2, sw * .5 + .5), lerp(-.3, -.9, dip * .5 + .5), 0, .3, .9], flipR: true, ...(o.pose || {}) });
}
function paddle(J, P, seed = 80) {
  if (!J.armL || !J.armR) return;
  const sp = (w) => [P.x + w[0] * P.sc, P.y + w[1] * P.sc];
  const a = sp(J.armL.wr), b = sp(J.armR.wr), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, u = [dx / L, dy / L];
  const top = [a[0] - u[0] * 40 * P.sc, a[1] - u[1] * 40 * P.sc], end = [b[0] + u[0] * 300 * P.sc, b[1] + u[1] * 300 * P.sc];
  stroke([top, end], seed, 7 * P.sc, { col: hsl(30, 45, 34), force: true });
  const n = [-u[1], u[0]], bw = 26 * P.sc, bl = 120 * P.sc, c = [end[0] + u[0] * bl * .5, end[1] + u[1] * bl * .5];
  part([[c[0] + n[0] * bw - u[0] * bl * .5, c[1] + n[1] * bw - u[1] * bl * .5], [c[0] + n[0] * bw * .9 + u[0] * bl * .4, c[1] + n[1] * bw * .9 + u[1] * bl * .4], [c[0] + u[0] * bl * .55, c[1] + u[1] * bl * .55], [c[0] - n[0] * bw * .9 + u[0] * bl * .4, c[1] - n[1] * bw * .9 + u[1] * bl * .4], [c[0] - n[0] * bw - u[0] * bl * .5, c[1] - n[1] * bw - u[1] * bl * .5]], { fill: hsl(32, 45, 50), shade: hsl(30, 45, 36), shadeShift: [4, -4], seed: seed + 1, inkW: .8, seg: 3 });
}
// one man paddling his canoe (side view). Returns the person pose and joints.
function paddler(t, x, y, sc, o = {}) {
  const P = paddlerPose(t, x - 40 * sc, y + 30 * sc, sc * .62, o);
  canoeHull(x, y, sc, o.rot || 0);
  const J = person({ ...P, parts: 'body' }); toque(J.hc, P.sc, (P.lean || 0) + (P.tilt || 0));
  const J2 = person({ ...P, parts: 'arms' });
  canoeFront(x, y, sc, o.rot || 0); if (!o.noPaddle) paddle(J2, P); // near-side paddle, in front of the hull
  return { P, J: J2 };
}
// a real fish (rotoscoped, alive)
function fish(x, y, sc, ang, t, seed = 90, o = {}) {
  const fl = Math.sin(t * 9 + seed) * .25;
  withT(() => { s.translate(x, y); s.rotate(ang); s.scale(sc, sc * (o.flip ? -1 : 1));
    part([[-60, 0], [-30, -20], [10, -26], [50, -14], [70, 0], [50, 14], [10, 22], [-30, 18]], { fill: hsl(o.h ?? 32, 36, 56), shade: hsl(o.h ?? 30, 34, 40), shadeShift: [0, -10], seed, inkW: .9 });
    part([[-56, 0], [-96, -30 + fl * 40], [-88, 0], [-96, 30 + fl * 40]], { fill: hsl(o.h ?? 30, 30, 48), seed: seed + 1, inkW: .8, seg: 3 });
    dot(48, -4, 4, hsl(0, 0, 12)); stroke([[0, -18], [16, -2], [0, 16]], seed + 2, .5);
  });
}
// a placard with a drawn symbol (no words): fish, drop, tree, heart
function placard(x, y, sc, rot, sym, seed) {
  withT(() => { s.translate(x, y); s.rotate(rot); s.scale(sc, sc);
    stroke([[0, -10], [0, 220]], seed, 1.4, { col: hsl(30, 40, 40) });
    part(rect(-90, -130, 180, 130), { fill: hsl(36, 40, 74), shade: hsl(30, 36, 62), shadeShift: [10, -8], seed: seed + 1, inkW: 1, sharp: 30 });
    const c = hsl(0, 0, 14);
    if (sym === 'fish') { part([[-40, -65], [-14, -86], [22, -84], [46, -65], [22, -46], [-14, -44]], { fill: hsl(200, 50, 50), seed: seed + 2, inkW: .9 }); part([[-38, -65], [-66, -88], [-64, -42]], { fill: hsl(200, 50, 50), seed: seed + 3, inkW: .8, seg: 2 }); }
    if (sym === 'drop') part([[0, -112], [26, -70], [24, -46], [0, -32], [-24, -46], [-26, -70]], { fill: hsl(205, 60, 52), seed: seed + 2, inkW: .9 });
    if (sym === 'tree') { part([[0, -118], [40, -56], [-40, -56]], { fill: hsl(140, 40, 34), seed: seed + 2, inkW: .9, seg: 2 }); stroke([[0, -56], [0, -24]], seed + 3, 1.2, { col: c }); }
    if (sym === 'heart') part([[0, -32], [-40, -70], [-34, -100], [-10, -104], [0, -86], [10, -104], [34, -100], [40, -70]], { fill: hsl(356, 60, 50), seed: seed + 2, inkW: .9 });
  });
}
// a crowd member holding a placard up with both hands
function marcher(t, x, y, sc, sym, seed, style) {
  const bob = Math.abs(Math.sin(t * 3.4 + seed)) * 10 * sc;
  const P = who(style || CAST.folk, { x, y: y - bob, sc, seed, breath: breath(t, seed), turn: snoise(t * .3, seed) * .4, blink: blinkAt(t, seed),
    armL: [-2.75, -.5, 0, .4, 1], armR: [2.75, .5, 0, .4, 1], flipR: true, legs: [0, 0, 0, 0], footDown: true });
  person({ ...P, parts: 'body' });
  placard(x, y - bob - 560 * sc, sc * 1.2, snoise(t * .6, seed) * .1, sym, seed + 5);
  person({ ...P, parts: 'arms' });
}
