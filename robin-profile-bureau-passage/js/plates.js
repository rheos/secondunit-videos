// The Bureau passage, 19.2083 s (70.5 to 89.7083 on the current cut). Every plate is a pure function of t.
// 0 door (flat vector), 1 the Bureau (chart-world isometric cutaway), 2 requirements (banknote engraving),
// 3 implementation (voxels), 4 review (woodcut), 5 all three at once, 6 fresh context, ending on the gold figure
// exactly as the administrator beat (AdminB) opens.
'use strict';
const END = 19.2083;
const wt = (w, n = 0) => WORDS.filter((x) => x.w.toLowerCase().replace(/[^a-z']/g, '') === w)[n].s;
const T = {
  agents: wt('agents'), framework: wt('framework'), bureau: wt('bureau'), organize: wt('organize'), work: wt('work'),
  req: wt('requirements'), impl: wt('implementation'), review: wt('review'), different: wt('different'), parts: wt('parts'),
  reviewer: wt('reviewer'), fresh: wt('fresh'), examine: wt('examine'), change: wt('change'), without: wt('without'),
  conversation: wt('conversation'), produced: wt('produced'),
};
let WOOD = null, FLASH = 0, GRAIN = 1, WMIX = 1;
const bounceOut = (x) => { x = cl(x); const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375; return n * (x -= 2.625 / d) * x + .984375; };
const backOut = (x) => { x = cl(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
function kfv(t, keys, e = eio) { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i]; return lerp(va, vb, e((t - a) / (b - a))); } return keys[keys.length - 1][1]; }
function clipRect(x, y, w, h) { X.beginPath(); X.rect(x, y, w, h); X.clip(); }
function box(x, y, w, h, col, a = 1) { X.globalAlpha = a; X.fillStyle = col; X.fillRect(x, y, w, h); X.globalAlpha = 1; }
// streaks for a whip pan
function streaks(k, col, a) { if (k <= 0) return; const r = M32(777); X.globalAlpha = a * k; X.fillStyle = col; for (let i = 0; i < 40; i++) X.fillRect(r() * W - 200, r() * H, 300 + r() * 900, 2 + r() * 3); X.globalAlpha = 1; }

// =============================================================== 0. THE DOOR (flat vector living room)
const DOOR = { x: 1330, y: 330, w: 240, h: 530 }, FLOOR = 860;
const walkX = (t) => kfv(t, [[0, 560], [.15, 560], [1.85, 1236], [2.72, 1236], [3.3, 1470]], (u) => u);
function blueprintInside(x, y, w, h, t, glow = 1) {
  X.save(); clipRect(x, y, w, h);
  box(x, y, w, h, C.navy);
  lattice(x + w / 2, y + h * .55, 38, 9, C.lav, .16);
  gc(x + w / 2, y + h * .5, h * .42, C.cyan, .25, 1, [4, 7]); ticks(x + w / 2, y + h * .5, h * .42, 90, 7, C.lav, .25);
  const g = X.createRadialGradient(x + w / 2, y + h * .55, 10, x + w / 2, y + h * .55, h * .7);
  g.addColorStop(0, `rgba(143,227,255,${.55 * glow})`); g.addColorStop(1, 'rgba(143,227,255,0)'); X.fillStyle = g; X.fillRect(x, y, w, h);
  X.restore();
}
function room(t) {
  // wall, a window onto the lake, the desk he started at
  box(-W, -H, 3 * W, 3 * H, '#f1e2c4');
  box(-W, 600, 3 * W, FLOOR - 600, '#e9d5b0'); box(-W, 596, 3 * W, 8, '#d8bd8d');
  box(-W, FLOOR, 3 * W, H * 2, '#b47c4b'); X.strokeStyle = '#9c6a3e'; X.lineWidth = 2; X.beginPath();
  for (let i = 0; i < 6; i++) { const y = FLOOR + 18 + i * i * 14; X.moveTo(-W, y); X.lineTo(2 * W, y); } X.stroke();
  box(-W, FLOOR - 16, 3 * W, 16, '#7d5332');
  // window: Kootenay Lake, mountains, a boat that drifts
  const wx = 110, wy = 180, ww = 360, wh = 330;
  const sky = X.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, '#9fd3e6'); sky.addColorStop(1, '#e8f1e4'); X.fillStyle = sky; X.fillRect(wx, wy, ww, wh);
  face([[wx, wy + 220], [wx + 80, wy + 120], [wx + 150, wy + 190], [wx + 240, wy + 90], [wx + 360, wy + 210], [wx + 360, wy + 250], [wx, wy + 250]], '#5f7f86');
  face([[wx, wy + 240], [wx + 120, wy + 170], [wx + 230, wy + 230], [wx + 360, wy + 180], [wx + 360, wy + 260], [wx, wy + 260]], '#40626a');
  box(wx, wy + 258, ww, wh - 258, '#4f8fa6'); X.fillStyle = '#f4f6ee'; X.beginPath(); const bx = wx + 60 + (t * 22) % 260; X.moveTo(bx, wy + 282); X.lineTo(bx + 34, wy + 282); X.lineTo(bx + 28, wy + 290); X.lineTo(bx + 6, wy + 290); X.fill();
  X.strokeStyle = '#fff8ea'; X.lineWidth = 16; X.strokeRect(wx, wy, ww, wh); X.lineWidth = 8; X.beginPath(); X.moveTo(wx + ww / 2, wy); X.lineTo(wx + ww / 2, wy + wh); X.moveTo(wx, wy + wh / 2); X.lineTo(wx + ww, wy + wh / 2); X.stroke();
  box(wx - 20, wy + wh + 6, ww + 40, 16, '#fff8ea');
  // plant, swaying
  X.save(); X.translate(820, FLOOR); X.fillStyle = '#c4673f'; X.beginPath(); X.moveTo(-50, -110); X.lineTo(50, -110); X.lineTo(38, 0); X.lineTo(-38, 0); X.fill();
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .32 + Math.sin(t * 2.2 + i) * .06; X.save(); X.translate(0, -110); X.rotate(a); X.fillStyle = i % 2 ? '#4f8a52' : '#3f7444'; X.beginPath(); X.ellipse(80, 0, 85, 22, 0, 0, TAU); X.fill(); X.restore(); }
  X.restore();
  // desk + monitor with code scrolling
  box(220, 700, 470, 22, '#6b4a33'); box(240, 722, 16, FLOOR - 722, '#5a3e2b'); box(654, 722, 16, FLOOR - 722, '#5a3e2b');
  box(330, 520, 260, 165, '#1d2433'); box(342, 532, 236, 141, '#0c1430'); box(445, 685, 30, 15, '#1d2433');
  X.save(); clipRect(342, 532, 236, 141); for (let i = 0; i < 9; i++) { const y = 548 + i * 17 - (t * 40) % 17; const r = M32(i + Math.floor(t * 40 / 17)); X.fillStyle = [C.cyan, C.lav, P.gold, C.grn][i % 4]; X.globalAlpha = .8; X.fillRect(356 + (i % 3) * 14, y, 40 + r() * 140, 6); } X.restore(); X.globalAlpha = 1;
  // the door, its frame, and what is behind it
  const open = eio(seg(t, 1.95, 2.45));
  box(DOOR.x - 22, DOOR.y - 22, DOOR.w + 44, DOOR.h + 22, '#8a5a3a');
  blueprintInside(DOOR.x, DOOR.y, DOOR.w, DOOR.h, t, open);
  // agents behind the door, curious
  if (open > .05) {
    X.save(); clipRect(DOOR.x, DOOR.y, DOOR.w, DOOR.h);
    const peek = backOut(seg(t, 2.3, 2.75));
    bot(DOOR.x + 70, FLOOR + 20 - 0 * peek, .9, t, { seed: 1, col: P.mint, hop: peek });
    bot(DOOR.x + 170, FLOOR + 70 - 60 * peek, .75, t, { seed: 3, col: P.coral, hop: peek, bulb: C.cyan });
    X.restore();
    // light spill on the floor and wall
    X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = .35 * open;
    const sp = X.createLinearGradient(DOOR.x + DOOR.w / 2, FLOOR, DOOR.x - 300, H); sp.addColorStop(0, 'rgba(143,227,255,.9)'); sp.addColorStop(1, 'rgba(143,227,255,0)');
    X.fillStyle = sp; X.beginPath(); X.moveTo(DOOR.x, FLOOR); X.lineTo(DOOR.x + DOOR.w, FLOOR); X.lineTo(DOOR.x + DOOR.w + 120, H + 40); X.lineTo(DOOR.x - 420, H + 40); X.fill(); X.restore();
  }
}
// the door panel swings toward us on its right-hand hinge as the agents pull it open
function doorPanel(t) {
  const open = eio(seg(t, 1.95, 2.45));
  const pw = DOOR.w * Math.cos(open * 1.35), px = DOOR.x + DOOR.w - pw;
  if (pw > 2) {
    const skew = open * 40;
    face([[px, DOOR.y - skew], [DOOR.x + DOOR.w, DOOR.y], [DOOR.x + DOOR.w, FLOOR], [px, FLOOR + skew]], open > .5 ? '#285f63' : '#2f6f73');
    if (pw > 60) { X.strokeStyle = 'rgba(0,0,0,.15)'; X.lineWidth = 4; X.strokeRect(px + pw * .15, DOOR.y + 50, pw * .7, 180); X.strokeRect(px + pw * .15, DOOR.y + 280, pw * .7, 190); }
    X.fillStyle = '#e9b949'; X.beginPath(); X.arc(px + Math.max(14, pw * .1), 610, 11, 0, TAU); X.fill();
  }
}
function plate0(t) {
  GRAIN = .6;
  // No drawn Robin: the camera is his point of view. It walks up to the door (a slow dolly with a light step
  // bob), the agents pull the door open from inside, and the camera goes through.
  const walk = eio(seg(t, 0, 2.0)), bob = Math.sin(t * TAU * 1.7) * 5 * (1 - seg(t, 1.7, 2.0)) + Math.sin((t - 2.72) * TAU * 1.9) * 4 * seg(t, 2.72, 2.85);
  const z0 = lerp(1, 1.32, walk), ax = lerp(W / 2, DOOR.x + DOOR.w / 2 - 150, walk), ay = lerp(H / 2, H / 2 + 20, walk) + bob;
  const push = eio(seg(t, 2.92, 3.3)), z = z0 * Math.exp(lerp(0, Math.log(8.5 / 1.32), push)), cx = lerp(ax, DOOR.x + DOOR.w / 2, Math.min(1, push * 1.4)), cy = lerp(ay, DOOR.y + 120, Math.min(1, push * 1.4));
  X.save(); cam(cx, cy, z);
  room(t);
  doorPanel(t);
  X.restore();
  // AGENTS lands on the wall as they appear
  if (t > T.agents - .05) {
    kin('AGENTS', 500, 330, t, T.agents - .05, { size: fit('AGENTS', 720, 190, { fam: FT.d, weight: 900, stretch: '115%' }), weight: 900, stretch: '115%', color: '#16203d', stag: .045, dur: .22, align: 'center', alpha: 1 - push, hot: [0, 6, '#16203d'] });
    caption('several of them, each with a job', 150, 392, t, T.agents + .25, { fam: FT.m, size: 24, color: '#16203d', alpha: (1 - push) * .8 });
  }
  caption('FIG. 1   THE OFFICE (LIVING ROOM)', 60, 70, t, .15, { fam: FT.m, size: 18, color: '#16203d', alpha: .7 * (1 - push) });
}

// =============================================================== 1. THE BUREAU (isometric cutaway, chart-world)
const ROOMS = [
  { name: 'REQUIREMENTS', sub: 'agent writes the spec', floor: '#e9dfc2', wall: '#c8bb94', back: '#b3a67d', z: 3.5, land: 4.2, bot: '#f6e7b8', bulb: '#2e4a3c' },
  { name: 'IMPLEMENTATION', sub: 'agents build it', floor: '#2a4f86', wall: '#1d3a66', back: '#16304f', z: 1.75, land: 3.98, bot: P.mint, bulb: P.gold },
  { name: 'REVIEW', sub: 'agent checks the change', floor: '#efe9dc', wall: '#d5ccb8', back: '#c0b59e', z: 0, land: 3.76, bot: '#ff8a6d', bulb: '#1b1b1b' },
];
function bureauPlate(t, camZ = 1, camX = W / 2, camY = H / 2) {
  schBG(C.navy);
  X.save(); cam(camX, camY, camZ);
  const p = isoP(1150, 610, 80);
  // ground grid drawing in from the middle
  const g = eo(seg(t, 3.3, 3.85));
  X.beginPath(); for (let i = -5; i <= 10; i++) { X.moveTo(...p(i, -5 + 7.5 - 7.5 * g, 0)); X.lineTo(...p(i, 2.5 + 7.5 * g, 0)); X.moveTo(...p(-5 + 7.5 - 7.5 * g, i, 0)); X.lineTo(...p(2.5 + 7.5 * g, i, 0)); } stroke(C.lav, 1, .22);
  // work tickets, flowing in along a dashed route to the door
  const route = [[-8, 6.5], [-2, 6.5], [-2, 3.6], [1.6, 3.6]];
  X.beginPath(); route.forEach((q, i) => { const s = p(q[0], q[1], 0); i ? X.lineTo(...s) : X.moveTo(...s); }); X.setLineDash([10, 9]); X.lineDashOffset = -t * 60; stroke(P.gold, 2, .55 * eo(seg(t, 4.9, 5.3))); X.setLineDash([]);
  const L = [6, 2.9, 3.6], tot = 12.5;
  for (let i = 0; i < 18; i++) {
    const s0 = T.organize - .3 + i * .17, u = (t - s0) / 1.5; if (u < 0 || u > 1) continue;
    let d = u * tot, q = route[0], k = 0; for (; k < 3 && d > L[k]; k++) d -= L[k];
    if (k >= 3) continue; const a = route[k], b = route[k + 1], f = d / L[k], wx = lerp(a[0], b[0], f), wy = lerp(a[1], b[1], f);
    const s = p(wx, wy, .25 + Math.abs(Math.sin(t * 9 + i)) * .12); X.save(); X.translate(...s); X.rotate(-.5); X.fillStyle = P.gold; X.globalAlpha = .95; X.fillRect(-15, -10, 30, 20); X.fillStyle = C.navy; X.fillRect(-10, -5, 18, 3); X.fillRect(-10, 1, 12, 3); X.restore(); X.globalAlpha = 1;
  }
  // floors drop in, bottom first, and bounce
  ROOMS.slice().reverse().forEach((r, i) => {
    const dz = (1 - bounceOut(seg(t, r.land - .42, r.land))) * 8; if (t < r.land - .42) return;
    const z = r.z + dz;
    isoBox(p, 0, 0, z - .15, 4, 3, .15, ['#cfd8ff', '#7d86c9', '#5c64a6'], C.white, 1.2);
    face([p(0, 0, z), p(4, 0, z), p(4, 3, z), p(0, 3, z)], r.floor, C.lav, 1);
    face([p(0, 0, z), p(0, 3, z), p(0, 3, z + 1.6), p(0, 0, z + 1.6)], r.wall, C.lav, 1);
    face([p(0, 0, z), p(4, 0, z), p(4, 0, z + 1.6), p(0, 0, z + 1.6)], r.back, C.lav, 1);
    // what each room holds
    const j = ROOMS.indexOf(r);
    if (j === 0) { for (let k = 0; k < 4; k++) face([p(.4, .5 + k * .5, z + .9 + Math.sin(t * 3 + k) * .03), p(.4, .9 + k * .5, z + .9), p(.4, .9 + k * .5, z + 1.3), p(.4, .5 + k * .5, z + 1.3)], '#f8f1dc', '#2e4a3c', 1); }
    if (j === 1) { for (let k = 0; k < 5; k++) { const kz = z + (k > 2 ? .5 : 0); isoBox(p, 2.6 + (k % 3) * .38, .3, kz, .36, .36, .36 + (k === 4 ? .3 * Math.abs(Math.sin(t * 5)) : 0), [VOX.top, VOX.left, VOX.right], VOX.edge, 1); } }
    if (j === 2) { const m = p(2.8, 1.2, z + .9 + Math.sin(t * 4) * .1); gc(m[0], m[1], 22, '#1b1b1b', 1, 5); gl(m[0] + 15, m[1] + 15, m[0] + 34, m[1] + 34, '#1b1b1b', 1, 6); }
    const bp = p(1.7 + Math.sin(t * 1.7 + j) * .5, 1.7, z);
    bot(bp[0], bp[1], .55, t, { seed: j * 2, col: r.bot, bulb: r.bulb, hop: .6 });
    // glass front edges
    X.beginPath(); for (const [a, b] of [[[0, 3, z + 1.6], [4, 3, z + 1.6]], [[4, 0, z + 1.6], [4, 3, z + 1.6]], [[4, 3, z], [4, 3, z + 1.6]]]) { X.moveTo(...p(...a)); X.lineTo(...p(...b)); } stroke(C.cyan, 2, .8);
    // leader label, typed
    const anchor = p(4, 1.5, z + .8), lt = 4.65 + (2 - j) * .2;
    if (t > lt) {
      const lx = 1580, ly = anchor[1] - 10, k = eo(seg(t, lt, lt + .25));
      gl(anchor[0], anchor[1], lerp(anchor[0], lx - 14, k), lerp(anchor[1], ly, k), C.white, .7, 1.5); gc(anchor[0], anchor[1], 5, C.white, .9, 2);
      caption(`0${j + 1}  ${r.name}`, lx, ly + 6, t, lt + .15, { fam: FT.m, size: 22, weight: 700, color: C.white });
      caption(r.sub, lx, ly + 34, t, lt + .35, { fam: FT.m, size: 16, color: C.lav, alpha: .8 });
    }
  });
  // the brief arrives from off frame (from Robin, who stays the camera) and lands at the front door
  const door = p(1.6, 3, 0);
  if (t > 5.2) { const k = eio(seg(t, 5.25, 6.1)); changeCardSmall(lerp(-60, door[0], k), lerp(820, door[1] - 30, k) - Math.sin(k * Math.PI) * 160, k); }
  X.restore();
  schFrame('2', 'THE BUREAU', 'AGENT FRAMEWORK · REQUIREMENTS → IMPLEMENTATION → REVIEW');
  kin('THE', 120, 300, t, T.bureau - .12, { size: 70, weight: 800, color: C.lav, stag: .03 });
  kin('BUREAU', 120, 430, t, T.bureau, { size: 160, weight: 900, stretch: '112%', color: C.white, stag: .05, dur: .24, hot: [0, 6, C.white] });
  caption('organizes the work', 126, 490, t, T.organize, { fam: FT.m, size: 26, color: P.gold });
}
function changeCardSmall(x, y, k) { X.save(); X.translate(x, y); X.rotate(-.2 + k * .2); X.fillStyle = P.cream; X.fillRect(-26, -18, 52, 36); X.fillStyle = '#2e4a3c'; for (let i = 0; i < 3; i++) X.fillRect(-18, -10 + i * 9, 30 - i * 6, 4); X.restore(); }
function plate1(t) {
  GRAIN = 1;
  const dive = eio(seg(t, 6.25, 6.8));
  const p = isoP(1150, 610, 80), target = p(2, 1.5, 4.3);
  const z = Math.exp(lerp(0, Math.log(5), dive)) * (1 + .04 * seg(t, 3.3, 6.25));
  bureauPlate(t, z, lerp(W / 2, target[0], dive), lerp(H / 2, target[1], dive));
  // the requirements plate opens out of the room
  if (t > 6.55) { const k = eio(seg(t, 6.55, 6.8)), w = lerp(260, W, k), h = lerp(146, H, k); X.save(); clipRect(W / 2 - w / 2, H / 2 - h / 2, w, h); plate2(Math.max(t, 6.8)); X.restore(); }
}

// =============================================================== 2. REQUIREMENTS (banknote engraving)
const INK = '#2e4a3c', RED = '#b8322a', BILL = '#ece3cc';
function guilloche(cx, cy, R, A, n, k, ph, col, a, w = 1, trim = 1) {
  for (let j = 0; j < k; j++) {
    X.beginPath(); const N = 360, off = j * TAU / k / n;
    for (let i = 0; i <= N * trim; i++) { const th = i / N * TAU, r = R + A * Math.sin(n * th + ph + off * n) + A * .35 * Math.sin((n + 3) * th - ph * .7); const x = cx + Math.cos(th) * r, y = cy + Math.sin(th) * r; i ? X.lineTo(x, y) : X.moveTo(x, y); }
    stroke(col, w, a);
  }
}
// an agent engraved as a portrait: tone made only of lines
function engravedBot(cx, cy, s, t) {
  X.save(); X.translate(cx, cy); X.scale(s, s);
  const head = rr(-130, -120, 260, 220, 60), screen = rr(-96, -88, 192, 120, 30);
  X.fillStyle = BILL; X.fill(head);
  hatch(head, 0, -10, 200, .15, 7, INK, 1.1, .8, [-30, -24]);
  hatch(head, 0, -10, 200, 1.3, 9, INK, .9, .5, [-60, -50]);
  X.save(); X.clip(head); for (let y = -120; y < 100; y += 6) gl(-140, y, 140, y + 8, INK, .25, .8); X.restore();
  X.fillStyle = '#d9cfb4'; X.fill(screen); hatch(screen, 0, -28, 140, 0, 4, INK, 1, .85);
  const blink = ((t * 1.2) % 2.4) < .1 ? .15 : 1;
  X.fillStyle = BILL; for (const ex of [-40, 40]) { X.beginPath(); X.ellipse(ex, -30, 15, 24 * blink, 0, 0, TAU); X.fill(); }
  iP(dens([[-130, -60], [-130, 40]], 20), false, INK, 2, .9); X.lineWidth = 3; X.strokeStyle = INK; X.stroke(head); X.lineWidth = 2; X.stroke(screen);
  // antenna and collar
  const sw = Math.sin(t * 3) * .2; iline(0, -120, Math.sin(sw) * 70, -120 - Math.cos(sw) * 70, INK, 3); gc(Math.sin(sw) * 70, -120 - Math.cos(sw) * 70, 12, INK, 1, 3);
  const body = PP([[-170, 100], [170, 100], [210, 260], [-210, 260]]); X.fillStyle = BILL; X.fill(body); hatch(body, 0, 180, 260, -.4, 6, INK, 1, .7, [40, -10]); X.lineWidth = 2.5; X.strokeStyle = INK; X.stroke(body);
  X.restore();
}
function plate2(t) {
  GRAIN = .5;
  X.save();
  const out = eio(seg(t, 8.3, 8.42)); X.translate(-W * out, 0);
  box(-W, -H, 3 * W, 3 * H, BILL);
  // fine engraved ground: wavy hairlines
  X.beginPath(); for (let y = 0; y < H; y += 9) { for (let x = 0; x <= W; x += 24) { const yy = y + Math.sin(x * .012 + y * .03 + t * .8) * 3; x ? X.lineTo(x, yy) : X.moveTo(x, yy); } } stroke(INK, .7, .14);
  // border: double rule, a guilloche band, corner rosettes
  const draw = eo(seg(t, 6.8, 7.3));
  X.strokeStyle = INK; X.lineWidth = 3; X.globalAlpha = .9; X.strokeRect(60, 60, W - 120, H - 120); X.lineWidth = 1; X.strokeRect(78, 78, W - 156, H - 156); X.globalAlpha = 1;
  X.beginPath(); for (const yb of [69, H - 69]) for (let x = 90; x <= W - 90; x += 3) { const y = yb + Math.sin(x * .09 + t * 4) * 5; x === 90 ? X.moveTo(x, y) : X.lineTo(x, y); } stroke(INK, 1, .6);
  for (const [x, y] of [[130, 130], [W - 130, 130], [130, H - 130], [W - 130, H - 130]]) guilloche(x, y, 38, 10, 9, 6, t * 1.4, INK, .7, 1, draw);
  // the big rosette behind the text, turning
  guilloche(1500, 700, 230, 34, 13, 12, t * .9, INK, .28, 1, draw); guilloche(1500, 700, 120, 20, 8, 8, -t * 1.3, INK, .35, 1, draw);
  // cameo: the requirements agent
  X.save(); X.beginPath(); X.ellipse(470, 560, 250, 310, 0, 0, TAU); X.clip();
  box(200, 230, 560, 640, '#e4d9bd'); for (let y = 240; y < 880; y += 6) gl(200, y, 760, y, INK, .3, .9);
  engravedBot(470, 560 + Math.sin(t * 2.4) * 6, 1, t);
  X.restore();
  iE(470, 560, 250, 310, 0, INK, 3, 1, true, .6); iE(470, 560, 268, 328, 0, INK, 1.5, .8, false, .6);
  ticks(470, 560, 284, 120, 8, INK, .5); X.save(); X.translate(470, 560); for (let i = 0; i < 26; i++) { const a = -Math.PI * .92 + i * .072; X.save(); X.rotate(a + Math.PI / 2); txt('AGENT·SPEC·'[i % 11], 0, -300, { fam: FT.s, size: 24, color: INK, align: 'center' }); X.restore(); } X.restore();
  // the brief, written as it is spoken, a nib at the end of the line
  const lines = ['One administrator manages the team.', 'Members keep their own projects.', 'First milestone in two weeks.'];
  let tt = 6.86; const cps = 30;
  lines.forEach((ln, i) => {
    const s = typed(ln, t, tt, cps), y = 560 + i * 84, w = txt(s, 840, y, { fam: FT.s, size: 56, italic: true, color: INK });
    txt(`${['i', 'ii', 'iii'][i]}.`, 790, y, { fam: FT.s, size: 40, color: INK, alpha: s.length ? .8 : 0, align: 'right' });
    if (s.length && s.length < ln.length) { X.save(); X.translate(840 + w + 6, y - 6); X.rotate(-.6); face([[0, 0], [10, -46], [0, -60], [-10, -46]], INK); X.restore(); }
    tt += ln.length / cps;
  });
  gl(840, 590, lerp(840, 1720, eo(seg(t, 6.9, 7.3))), 590, INK, .35, 1);
  kin('REQUIREMENTS', 840, 400, t, T.req, { fam: FT.s, size: 120, weight: 400, color: INK, ls: 6, stag: .03, dur: .2 });
  // serial and seal in the red plate
  caption('REQ 0001 A', 1520, 196, t, T.req + .1, { fam: FT.m, size: 30, weight: 700, color: RED, cps: 60 });
  if (t > 7.85) {
    const k = backOut(seg(t, 7.85, 8.05)); X.save(); X.translate(1660, 880); X.rotate(-.22); X.scale(lerp(1.8, 1, k), lerp(1.8, 1, k)); X.globalAlpha = cl(seg(t, 7.85, 7.92));
    gc(0, 0, 92, RED, .95, 6); gc(0, 0, 76, RED, .95, 2); ticks(0, 0, 80, 60, 6, RED, .9, 1.5);
    txt('APPROVED', 0, -8, { fam: FT.d, size: 30, weight: 900, color: RED, align: 'center' }); txt('ROBIN', 0, 30, { fam: FT.s, size: 38, color: RED, align: 'center' });
    X.restore();
  }
  X.restore();
  streaks(Math.sin(Math.PI * out), INK, .25);
  if (out > 0) { X.save(); X.translate(W * (1 - out), 0); clipRect(0, 0, W, H); plate3(Math.max(t, 8.42), true); X.restore(); }
}

// =============================================================== 3. IMPLEMENTATION (voxels)
const TOWER = (() => { const hs = [[3, 2, 4, 1], [2, 4, 3, 2], [1, 3, 5, 3], [2, 1, 2, 4]], o = []; hs.forEach((row, x) => row.forEach((h, y) => { for (let z = 0; z < h; z++) o.push([x, y, z]); })); o.sort((a, b) => (a[2] - b[2]) || ((a[0] + a[1]) - (b[0] + b[1]))); return o; })();
function voxelScene(t, t0, p, spd = 1, gold = 0) {
  // drop order by height so the tower grows upward; draw order by depth
  const land = TOWER.map((b, i) => t0 + i * .028 / spd);
  const order = TOWER.map((b, i) => i).sort((a, b) => (TOWER[a][0] + TOWER[a][1] + TOWER[a][2] * .01) - (TOWER[b][0] + TOWER[b][1] + TOWER[b][2] * .01));
  for (const i of order) {
    const [x, y, z] = TOWER[i], u = seg(t, land[i] - .22, land[i]); if (u <= 0) continue;
    const dz = (1 - bounceOut(u)) * 6, g = gold && z >= 3;
    isoBox(p, x, y, z + dz, 1, 1, 1, g ? [VOX.gtop, VOX.gleft, VOX.gright] : [VOX.top, VOX.left, VOX.right], g ? '#fff3c4' : VOX.edge, 1.5);
  }
}
function plate3(t, inPush) {
  GRAIN = 1;
  schBG(C.navy2);
  X.save(); cam(W / 2, H / 2, 1 + .06 * seg(t, 8.42, 9.6));
  const p = isoP(930, 640, 74);
  X.beginPath(); for (let i = -6; i <= 10; i++) { X.moveTo(...p(i, -6, 0)); X.lineTo(...p(i, 10, 0)); X.moveTo(...p(-6, i, 0)); X.lineTo(...p(10, i, 0)); } stroke(C.lav, 1, .18);
  voxelScene(t, 8.36, p, 1, seg(t, 9.25, 9.3));
  voxBot(p, 5.2, 1.0, 0, t, 0); voxBot(p, -1.4, 4.6, 0, t, 2);
  // a bot carries a block in
  const k = (t * 1.6) % 1, cx = lerp(6.5, 4.2, k); voxBot(p, cx, 3.2, 0, t, 4); isoBox(p, cx + .1, 3.3, 1 + Math.abs(Math.sin(t * 8 + 4)) * .5, .7, .7, .7, [VOX.top, VOX.left, VOX.right], VOX.edge, 1.2);
  X.restore();
  schFrame('3', 'IMPLEMENTATION', 'AGENTS BUILD IT, BLOCK BY BLOCK');
  kin('IMPLEMENTATION', W / 2, 1000, t, T.impl, { size: fit('IMPLEMENTATION', 1500, 170, { fam: FT.d, weight: 900 }), weight: 900, color: C.white, align: 'center', stag: .022, dur: .16, hot: [0, 4, P.gold] });
}

// =============================================================== 4. REVIEW (woodcut, through the GL print pass)
function sunburst(cx, cy, n, rot, R = 2400) { X.fillStyle = '#000'; for (let i = 0; i < n; i++) { const a = rot + i * TAU / n; X.beginPath(); X.moveTo(cx, cy); X.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); X.lineTo(cx + Math.cos(a + TAU / n / 2) * R, cy + Math.sin(a + TAU / n / 2) * R); X.fill(); } }
// the reviewer, cut in the block: solid black, highlights gouged out in white
function woodBot(cx, cy, s, t, lensX = 0) {
  X.save(); X.translate(cx, cy); X.scale(s, s);
  const bob = Math.sin(t * 5) * 6;
  X.fillStyle = '#000'; X.beginPath(); X.roundRect(-160, -200 + bob, 320, 260, 70); X.fill();
  X.strokeStyle = '#fff'; X.lineWidth = 6; X.lineCap = 'round'; X.beginPath(); for (let i = 0; i < 6; i++) { X.moveTo(-130 + i * 10, -150 + bob + i * 22); X.lineTo(-100 + i * 8, -165 + bob + i * 22); } X.stroke();
  X.fillStyle = '#fff'; X.beginPath(); X.roundRect(-110, -160 + bob, 220, 130, 36); X.fill();
  X.fillStyle = '#000'; const lk = lensX * 14; for (const ex of [-45, 45]) { X.beginPath(); X.ellipse(ex + lk, -96 + bob, 18, 26, 0, 0, TAU); X.fill(); }
  X.lineWidth = 10; X.strokeStyle = '#000'; X.beginPath(); X.moveTo(0, -200 + bob); X.lineTo(0, -270 + bob); X.stroke(); X.fillStyle = '#ff0000'; X.beginPath(); X.arc(0, -282 + bob, 20, 0, TAU); X.fill();
  X.fillStyle = '#000'; X.beginPath(); X.roundRect(-220, 60, 440, 200, 30); X.fill();
  X.strokeStyle = '#fff'; X.lineWidth = 5; X.beginPath(); for (let i = 0; i < 9; i++) { X.moveTo(-200 + i * 48, 80); X.lineTo(-180 + i * 48, 240); } X.stroke();
  X.restore();
}
function lens(x, y, r, a = 1) { X.save(); X.globalAlpha = a; X.fillStyle = '#fff'; X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill(); X.lineWidth = r * .22; X.strokeStyle = '#000'; X.stroke(); X.lineWidth = r * .26; X.lineCap = 'round'; X.beginPath(); X.moveTo(x + r * .8, y + r * .8); X.lineTo(x + r * 1.7, y + r * 1.7); X.stroke(); X.restore(); }
function woodCard(x, y, sc = 1, mark = 0) {
  X.save(); X.translate(x, y); X.scale(sc, sc);
  X.fillStyle = '#fff'; X.fillRect(-130, -90, 260, 180); X.lineWidth = 8; X.strokeStyle = '#000'; X.strokeRect(-130, -90, 260, 180);
  X.fillStyle = '#000'; X.fillRect(-110, -70, 120, 22); [150, 110, 160, 90].forEach((w, i) => X.fillRect(-110, -30 + i * 28, w, 12));
  if (mark) { X.strokeStyle = '#ff0000'; X.lineWidth = 9; X.beginPath(); X.ellipse(-30, 12, 110 * mark, 26 * mark, -.05, 0, TAU); X.stroke(); }
  X.restore();
}
function plate4(t) {
  GRAIN = 0; WOOD = [0, 0, W, H]; FLASH = Math.max(0, 1 - seg(t, 9.52, 9.66));
  box(-W, -H, 3 * W, 3 * H, '#fff');
  sunburst(960, 620, 44, t * .25);
  X.fillStyle = '#fff'; X.beginPath(); X.arc(960, 620, 360, 0, TAU); X.fill(); X.lineWidth = 12; X.strokeStyle = '#000'; X.stroke();
  const sweep = Math.sin((t - 9.5) * 5);
  woodBot(780, 650, 1, t, sweep);
  woodCard(1190, 760, 1);
  lens(1170 + sweep * 70, 740, 80);
  // REVIEW, carved out of a black slab
  box(0, 70, W, 200, '#000');
  kin('REVIEW', W / 2, 230, t, T.review - .02, { size: 180, weight: 900, stretch: '118%', color: '#fff', align: 'center', stag: .04, dur: .18 });
  if (t > 9.98) { const k = backOut(seg(t, 9.98, 10.16)); X.save(); X.translate(1330, 740); X.scale(lerp(2, 1, k), lerp(2, 1, k)); X.globalAlpha = cl(seg(t, 9.98, 10.03)); X.strokeStyle = '#ff0000'; X.lineWidth = 34; X.lineCap = 'round'; X.lineJoin = 'round'; X.beginPath(); X.moveTo(-80, 0); X.lineTo(-20, 70); X.lineTo(110, -90); X.stroke(); X.restore(); }
}

// =============================================================== 5. DIFFERENT AGENTS, DIFFERENT PARTS
const PAN = [[70, 190, 573, 700], [673, 190, 573, 700], [1276, 190, 573, 700]];
function panelReq(t, w, h) {
  box(0, 0, w, h, BILL); X.beginPath(); for (let y = 0; y < h; y += 9) { X.moveTo(0, y); X.lineTo(w, y + Math.sin(y + t) * 2); } stroke(INK, .7, .14);
  guilloche(w / 2, h * .42, 210, 26, 11, 10, t * 1.1, INK, .3); guilloche(w / 2, h * .42, 110, 16, 7, 7, -t * 1.5, INK, .4);
  X.save(); X.beginPath(); X.ellipse(w / 2, h * .42, 150, 185, 0, 0, TAU); X.clip(); box(0, 0, w, h, '#e4d9bd'); for (let y = 0; y < h; y += 6) gl(0, y, w, y, INK, .3, .9); engravedBot(w / 2, h * .42 + 20, .55, t); X.restore();
  iE(w / 2, h * .42, 150, 185, 0, INK, 3, 1, true, .5);
  const ln = typed('Members keep their own projects.', t, 10.9, 26); txt(ln, 40, h - 130, { fam: FT.s, size: 30, italic: true, color: INK });
  X.strokeStyle = INK; X.lineWidth = 2; X.strokeRect(14, 14, w - 28, h - 28);
  txt('AGENT 01 · REQUIREMENTS', 34, h - 46, { fam: FT.m, size: 18, weight: 700, color: INK });
}
function panelImpl(t, w, h) {
  box(0, 0, w, h, C.navy2); const p = isoP(w / 2 - 20, h * .55, 46);
  X.beginPath(); for (let i = -4; i <= 8; i++) { X.moveTo(...p(i, -4, 0)); X.lineTo(...p(i, 8, 0)); X.moveTo(...p(-4, i, 0)); X.lineTo(...p(8, i, 0)); } stroke(C.lav, 1, .2);
  const loop = 10.4 + Math.floor((t - 10.4) / 1.6) * 1.6; voxelScene(t, loop, p, 1.2, 0);
  voxBot(p, 5, .5, 0, t, 1); voxBot(p, -1, 4.5, 0, t, 5);
  X.strokeStyle = C.lav; X.lineWidth = 2; X.strokeRect(14, 14, w - 28, h - 28);
  txt('AGENT 02 · IMPLEMENTATION', 34, h - 46, { fam: FT.m, size: 18, weight: 700, color: C.white });
}
function panelReview(t, w, h, cardIn = 1) {
  box(-2000, -2000, 5000, 5000, '#fff'); sunburst(w / 2, h * .5, 30, t * .3);
  X.fillStyle = '#fff'; X.beginPath(); X.arc(w / 2, h * .5, 230, 0, TAU); X.fill(); X.lineWidth = 9; X.strokeStyle = '#000'; X.stroke();
  const sw = Math.sin(t * 4.5); woodBot(w / 2 - 70, h * .56, .58, t, sw); if (cardIn) { woodCard(w / 2 + 110, h * .66, .6); lens(w / 2 + 100 + sw * 40, h * .62, 48); }
  txt('AGENT 03 · REVIEW', 34, h - 46, { fam: FT.m, size: 18, weight: 700, color: '#000' });
}
function plate5(t) {
  GRAIN = 1;
  schBG(C.navy);
  const kin1 = eio(seg(t, 10.52, 10.95));
  const exit = eio(seg(t, 12.5, 12.78));
  // the woodcut shrinks into the third panel, the other two slide in behind it
  const c = PAN[2], rC = [lerp(0, c[0], kin1), lerp(0, c[1], kin1), lerp(W, c[2], kin1), lerp(H, c[3], kin1)];
  // on exit, panel three becomes the reviewer's room of plate 6
  const R6 = ROOM6; const rE = [lerp(rC[0], R6[0], exit), lerp(rC[1], R6[1], exit), lerp(rC[2], R6[2] - R6[0], exit), lerp(rC[3], R6[3] - R6[1], exit)];
  [[panelReq, 0, .08], [panelImpl, 1, 0]].forEach(([fn, i, d]) => {
    const k = eio(seg(t, 10.62 + d, 11.0 + d)), q = PAN[i], x = q[0] - (1 - k) * 800 - exit * 1400, y = q[1] + exit * (i ? 200 : -200);
    X.save(); X.translate(x, y); X.rotate(exit * (i ? .2 : -.2)); clipRect(0, 0, q[2], q[3]); fn(t, q[2], q[3]); X.restore();
  });
  X.save(); X.translate(rE[0], rE[1]); clipRect(0, 0, rE[2], rE[3]); if (kin1 < 1) { X.scale(rE[2] / W, rE[3] / H); plate4Body(t); } else panelReview(t, rE[2], rE[3]); X.restore();
  WOOD = [rE[0], rE[1], rE[0] + rE[2], rE[1] + rE[3]];
  schFrame('4', 'DIVISION OF LABOUR', 'ONE AGENT PER PART, EACH WITH ITS OWN CONTEXT');
  kin('DIFFERENT AGENTS', W / 2, 150, t, T.different, { size: 92, weight: 900, color: C.white, align: 'center', stag: .025, dur: .18, out: 12.55, hot: [10, 16, P.gold] });
  kin('DIFFERENT PARTS', W / 2, 1000, t, wt('different', 1), { size: 92, weight: 900, color: C.white, align: 'center', stag: .025, dur: .18, out: 12.55, hot: [10, 15, P.gold] });
}
// plate 4 without its own WOOD/FLASH, for drawing it inside another plate
function plate4Body(t) { const w = WOOD, f = FLASH, g = GRAIN; plate4(t); WOOD = w; FLASH = f; GRAIN = g; }

// =============================================================== 6. FRESH CONTEXT
const ROOM6 = [1150, 170, 1850, 900];
const TRACK = 470;
const cardX = (t) => kfv(t, [[12.6, 330], [13.1, 380], [15.3, 1000], [16.15, 1080], [16.5, 1300], [17.25, 1620]], (u) => eio(u));
const BUB = ['one admin, right?', 'try it again', 'hmm, that broke', 'reuse the old login?', 'ok, ship it', 'wait, why?', 'is it fixed?'];
const CUT = T.without + .1;
function bubblePose(i, t) {
  const tc = Math.min(t, CUT), lag = .06 * (i + 1);
  const x = cardX(tc - lag) - 210 - i * 175, y = TRACK + 40 + (i % 2 ? -52 : 46) + Math.sin(tc * 4.5 + i * 1.3) * 10;
  let r = Math.sin(tc * 3 + i) * .05, px = x, py = y;
  if (t > CUT) {
    // cut loose: they fall to the floor, bounce and settle in a heap
    const d = t - CUT, rg = M32(50 + i), vx = (rg() - .5) * 180, floor = 945 - (i % 3) * 46 - (i % 2) * 18, fall = Math.min(1, d / .55);
    px = x + vx * Math.min(d, .8);
    const yLin = lerp(y, floor, fall * fall); py = fall < 1 ? yLin : floor - Math.abs(Math.sin((d - .55) * 9)) * 40 * Math.exp(-(d - .55) * 6);
    r = lerp(r, (rg() - .5) * .9, Math.min(1, d / .7));
  }
  return [px, py, r];
}
function plate6(t) {
  GRAIN = 1;
  schBG(C.navy);
  const endK = eio(seg(t, 18.42, 18.98));
  // the track and the door between the rooms
  gl(140, TRACK + 80, ROOM6[0], TRACK + 80, C.lav, .35, 2, [8, 8]);
  // implementation agent hands the change over
  bot(215, TRACK + 250, 1.15, t, { seed: 2, col: P.mint, arms: -30 + 40 * eo(seg(t, 12.9, 13.2)) });
  txt('AGENT 02 · IMPLEMENTATION', 95, TRACK + 305, { fam: FT.m, size: 17, weight: 700, color: C.lav, alpha: .8 });
  // the conversation, strung behind the change
  const cx = cardX(t), cy = TRACK - 10 + Math.sin(t * 6) * 6 - Math.sin(Math.PI * seg(t, 12.75, 13.1)) * 40;
  const poses = BUB.map((s, i) => bubblePose(i, t));
  const pop = (i) => backOut(seg(t, 12.68 + i * .07, 12.9 + i * .07));
  if (t < CUT) { X.beginPath(); X.moveTo(cx - 120, cy + 20); poses.forEach(([x, y]) => X.lineTo(x, y)); stroke(C.lav, 2, .6); }
  else { const k = 1 - seg(t, CUT, CUT + .4); X.beginPath(); X.moveTo(poses[0][0], poses[0][1]); X.lineTo(poses[0][0] + 80 * k, poses[0][1] - 30 * k); stroke(C.lav, 2, .6 * k); }
  poses.forEach(([x, y, r], i) => { if (x < -200) return; const s = pop(i); X.save(); X.translate(x, y); X.scale(s, s); bubble(0, 0, meas(BUB[i], { fam: FT.m, size: 21 }) + 44, BUB[i], r, 1 - endK); X.restore(); });
  // the reviewer's room, cut in wood
  const R = ROOM6, rw = R[2] - R[0], rh = R[3] - R[1];
  X.save(); X.translate(R[0], R[1]); clipRect(0, 0, rw, rh);
  box(0, 0, rw, rh, '#fff'); sunburst(rw / 2, rh * .62, 30, t * .3);
  X.fillStyle = '#fff'; X.beginPath(); X.arc(rw / 2 + 40, rh * .62, 250, 0, TAU); X.fill(); X.lineWidth = 9; X.strokeStyle = '#000'; X.stroke();
  // a fresh sheet: the reviewer's whole context
  const sheet = backOut(seg(t, T.fresh - .05, T.fresh + .25));
  if (t > T.fresh - .05) { X.save(); X.translate(rw / 2 + 120, rh * .7 - (1 - sheet) * 300); X.rotate((1 - sheet) * .5); X.fillStyle = '#fff'; X.fillRect(-150, -100, 300, 200); X.lineWidth = 8; X.strokeStyle = '#000'; X.strokeRect(-150, -100, 300, 200); X.restore(); }
  const sw = t > 17.2 ? Math.sin((t - 17.2) * 5) : 0;
  woodBot(rw / 2 - 110, rh * .66, .7, t, t > 16.6 ? sw : -.6);
  X.fillStyle = '#000'; X.fillRect(0, 0, rw, 150);
  kin('FRESH CONTEXT', rw / 2, 112, t, T.fresh, { size: fit('FRESH CONTEXT', rw - 90, 110, { fam: FT.d, weight: 900 }), weight: 900, color: '#fff', align: 'center', stag: .03, dur: .18 });
  box(0, 150, rw, 66, '#fff'); X.fillStyle = '#000'; X.fillRect(0, 214, rw, 6);
  caption('context: this change, nothing else', 40, 194, t, T.fresh + .45, { fam: FT.m, size: 22, weight: 700, color: '#000', cps: 50 });
  // the change, once it is through the door, cut in the block too
  if (cx + 130 > R[0]) { const lx = cx - R[0], ly = cy - R[1] + kfv(t, [[16.5, 0], [17.25, 200]]); woodCard(lx, ly, .9, t > 17.95 ? backOut(seg(t, 17.95, 18.2)) : 0); if (t > 17.2) lens(lx - 20 + sw * 60, ly - 20, 62); }
  // the door between the rooms: a red blade that drops as the change passes
  const drop = bounceOut(seg(t, T.without - .08, T.without + .14));
  X.fillStyle = '#ff0000'; X.fillRect(4, -30, 44, lerp(0, rh + 30, drop)); X.beginPath(); X.moveTo(4, lerp(-30, rh, drop)); X.lineTo(48, lerp(-30, rh, drop)); X.lineTo(4, lerp(-30, rh, drop) + 40); X.fill();
  X.restore();
  WOOD = [R[0], R[1], R[2], R[3]];
  if (cx - 125 < R[0]) { X.save(); clipRect(0, 0, R[0], H); changeCard(cx, cy, 1, Math.sin(t * 3) * .05, 1, t); X.restore(); }
  // what stays behind
  if (t > T.conversation - .1) { const a = 1 - endK; bracket(150, 1000, 1000, 1000, C.lav, .8 * a); caption('THE CONVERSATION · NOT INHERITED', 170, 1040, t, T.conversation - .1, { fam: FT.m, size: 20, weight: 700, color: P.gold, alpha: a, cps: 60 }); }
  schFrame('5', 'FRESH CONTEXT', 'THE REVIEWER SEES THE CHANGE, NOT HOW IT WAS ARGUED INTO BEING');
  kin('FRESH', 150, 225, t, T.fresh, { size: 100, weight: 900, color: C.white, stag: .04, dur: .2, out: 16.2 });
  kin('CONTEXT', 150, 325, t, T.fresh + .2, { size: 100, weight: 900, color: P.gold, stag: .04, dur: .2, out: 16.2 });
  kin('NOT INHERITED', 150, 290, t, T.without + .25, { size: 96, weight: 900, color: C.white, stag: .03, dur: .2, out: 18.3, hot: [0, 3, P.gold] });

  // ---- hand over to the administrator beat: everything clears to its night and its gold figure rises in
  if (endK > 0) {
    X.fillStyle = `rgba(11,14,33,${endK})`; X.fillRect(0, 0, W, H);
    X.beginPath(); for (const x of [440, 960, 1480]) { X.moveTo(x, 0); X.lineTo(x, H); } for (const y of [202, 722]) { X.moveTo(0, y); X.lineTo(W, y); } stroke('#8fa0ff', 2, .07 * endK);
  }
  WMIX = 1 - endK; if (endK > .98) WOOD = null;
  const fade = seg(t, 18.62, 19.0);
  if (fade > 0) { const k = lerp(2.25, GOLD_END.k, eo(fade)); goldFig(GOLD_END.cx, lerp(GOLD_END.oy + 30, GOLD_END.oy, eo(fade)), k, fade); }
  GRAIN = 1 - endK;
}

const PLATES = [[0, plate0], [3.3, plate1], [6.8, plate2], [8.42, plate3], [9.52, plate4], [10.52, plate5], [12.78, plate6]];
function drawAt(t) { let f = PLATES[0][1]; for (const [a, fn] of PLATES) if (t >= a) f = fn; f(t); }
