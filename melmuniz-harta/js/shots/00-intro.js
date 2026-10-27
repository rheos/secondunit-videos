// 00-intro (0 - 25.0): brass intro, then the "Ah" vocalise (18.8-25).
// A grey-blue paper world under a pale paper sun. A cream title card rises on its stick from behind the
// front hill (2 s) and sinks away (9 s). Far off at upper left a small storm cloud gathers: it grows a new
// puff on every brass hit. On the "Ah" her big navy profile rises into the sun (In Her Dream 04-sky framing),
// and the storm cloud rolls in from the left, puffing on the brass stabs, darkening the world, and settles
// over the back of her head by 25.0 (01-bronca opens on that frame).
(() => {
const T = { cardUp: 2.0, cardDown: 9.0, rise: 18.45, ah1: 18.8, ah2: 21.95, roll0: 18.8, roll1: 24.4, end: 25.0 };
// brass hits found in the instrumental stem (600-3000 Hz contrast peaks)
const HITS_EARLY = [1.89, 4.61, 5.77, 6.77, 9.87, 13.59, 14.41, 16.67];
const HITS_LATE = [19.21, 20.77, 21.35, 22.35, 22.89, 23.47, 24.05];
const HITS = HITS_EARLY.concat(HITS_LATE);
const CL = { dark: '#4a4458', mid: '#5c566b' };

// the storm cloud, in its own units: centre (0,0), flat dark underside near y +110
// [x, y, r, born] born = index into HITS (-1 = there from the start)
const LOBES = [
  [-90, -60, 170, -1], [80, -50, 160, -1], [0, 20, 150, -1], [-220, 0, 130, -1], [220, 10, 130, -1],
  // one more puff on each early brass hit
  [-330, 30, 100, 0], [330, 30, 100, 1], [-150, -150, 120, 2], [150, -140, 120, 3],
  [-420, 60, 80, 4], [420, 55, 85, 5], [0, -190, 110, 6], [-280, -90, 110, 7],
  // and on each stab under the "Ah" as it rolls in
  [410, -40, 105, 8], [-470, 50, 85, 9], [270, -170, 115, 10], [-330, -170, 105, 11],
  [60, -265, 115, 12], [470, 45, 80, 13], [-200, -260, 95, 14],
];

// a puff swell after each hit (multiplies the cloud's scale a little)
function hitSwell(t) { let s = 0; for (const h of HITS) { const d = t - h; if (d >= 0 && d < .55) s += Math.pow(1 - d / .55, 2) * .075; } return s; }

function cloudPath(t, grow = 0, dy = 0, minY = -1e9) {
  const p = new Path2D();
  LOBES.forEach(([x, y, r, born], i) => {
    let k = 1;
    if (born >= 0) { const h = HITS[born]; if (t < h) return; k = clamp(back((t - h) / .38), 0, 1.25); }
    const cx = x + Math.sin(t * .55 + i * 1.7) * 7, cy = y + Math.cos(t * .5 + i * 2.3) * 5 + dy;
    if (cy < minY) return;
    const rr = (r + grow) * k; p.moveTo(cx + rr, cy); p.arc(cx, cy, Math.max(.1, rr), 0, Math.PI * 2);
  });
  return p;
}
function stormCloud(t) {
  // the flat, dark underside: a slab spanning the lobes that are already there
  let x0 = -230, x1 = 230;
  LOBES.forEach(([x, y, r, born]) => { if (born < 0 || t >= HITS[born] + .1) { if (y > -20) { x0 = Math.min(x0, x - r * .8); x1 = Math.max(x1, x + r * .8); } } });
  const slab = rrect(x0 + 20, 22, x1 - x0 - 40, 100, 50);
  const back = cloudPath(t, 14, 10); back.addPath(slab);
  cut(back, CL.dark, { sh: 1.1, lift: 1.2, grain: .28, rule: 'nonzero' });
  // the lit upper body, kept off the underside so the bottom stays dark
  g.save(); g.beginPath(); g.rect(-900, -700, 1800, 700 + 58); g.clip();
  cut(cloudPath(t, 0, -6), CL.mid, { sh: .5, lift: .3, grain: .26 });
  g.restore();
  // billows along the underside, cut from the dark paper, so the base reads as heavy rolls not a bar
  const n = Math.max(2, Math.round((x1 - x0) / 230)); const under = new Path2D();
  for (let i = 0; i < n; i++) { const u = (i + .5) / n, bw = (x1 - x0) / n * (1.15 + hash(i * 4.7) * .35), bh = 88 + hash(i * 2.9) * 40;
    const bx = lerp(x0 + 40, x1 - 40, u) + (hash(i * 6.1) - .5) * 40 + Math.sin(t * .6 + i * 2.1) * 5, by = 78 + (i % 2) * 14;
    under.addPath(cloud(bx, by, bw, bh, i * 11 + 3)); }
  cut(under, CL.dark, { sh: .7, lift: .3, grain: .26 });
}

// a paper gull seen side-on, flying right: a body and two wings that flap from the shoulder
function gull(x, y, s, ph) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const f = Math.sin(ph), ya = -30 * f, yb = -12 * f;
  // the classic flattened-M bird: two wings off a small body, tips rising and falling
  cut(poly([[-66, ya], [-34, yb - 8], [-8, -4], [0, -8], [8, -4], [34, yb - 8], [66, ya],
    [36, yb + 3], [10, 9], [0, 12], [-10, 9], [-36, yb + 3]]), C.w1, { sh: .55, grain: .15 });
  g.restore();
}
// a gabled roof line for the far town, on the back hill (left half, under where the cloud will hang)
const TOWN = (() => { const p = new Path2D(); let x = 40;
  const hs = [[110, 120], [80, 170], [130, 110], [90, 200], [120, 140], [70, 120], [140, 180], [100, 130]];
  hs.forEach(([w, h], i) => { const y = 905; p.moveTo(x, y); p.lineTo(x, y - h); p.lineTo(x + w / 2, y - h - w * .42); p.lineTo(x + w, y - h); p.lineTo(x + w, y); p.closePath();
    if (i % 3 === 1) p.rect(x + w * .66, y - h - w * .42, 16, 46);
    x += w + 8 + hash(i * 3.3) * 30; });
  return p; })();

const hillPath = (y, amp, ph) => { const p = new Path2D(); p.moveTo(-20, H + 20); p.lineTo(-20, y);
  for (let x = 0; x <= W + 40; x += 40) p.lineTo(x, y + Math.sin(x / 260 + ph) * amp); p.lineTo(W + 40, H + 20); p.closePath(); return p; };
const HILL_BACK = hillPath(905, 24, 1.2), HILL_FRONT = hillPath(975, 18, 3.4);

// the title card: cream paper, navy letters drawn crisp (no paper grain over the letters)
const CARD = { w: 860, h: 430 };
function titleCard(cx, cy, rot) {
  g.save(); g.translate(cx, cy); g.rotate(rot);
  // the stick it rides up on
  cut(cutRect(-11, CARD.h / 2 - 4, 22, 900, 41, 1.5), C.w0, { sh: .6, grain: .2 });
  const card = cutRect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 17, 3);
  cut(card, C.cream, { sh: 1.2, lift: .7, grain: .14 });
  // a printed double rule inset in the card
  g.strokeStyle = C.navy; g.lineJoin = 'round';
  g.lineWidth = 4; g.strokeRect(-CARD.w / 2 + 26, -CARD.h / 2 + 26, CARD.w - 52, CARD.h - 52);
  g.lineWidth = 1.6; g.strokeRect(-CARD.w / 2 + 36, -CARD.h / 2 + 36, CARD.w - 72, CARD.h - 72);
  // letters: fit inside the inner rule with a generous margin
  const font = (s) => `600 ${s}px "Avenir Next", "Avenir", "Helvetica Neue", sans-serif`;
  const maxW = CARD.w - 2 * 110;
  let big = 210; g.font = font(big); while (g.measureText('Harta').width > maxW && big > 80) { big -= 4; g.font = font(big); }
  const mb = g.measureText('Harta');
  let small = 84; g.font = font(small); while (g.measureText('Mel Muñiz').width > maxW && small > 30) { small -= 2; g.font = font(small); }
  const ms = g.measureText('Mel Muñiz');
  const gap = 64;
  const hBig = mb.actualBoundingBoxAscent + mb.actualBoundingBoxDescent;
  const hSmall = ms.actualBoundingBoxAscent + ms.actualBoundingBoxDescent;
  const top = -(hBig + gap + hSmall) / 2 - 6;
  g.fillStyle = C.navy; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.font = font(big); g.fillText('Harta', 0, top + mb.actualBoundingBoxAscent);
  // a short ink rule between title and name
  g.fillRect(-60, top + hBig + gap / 2 - 2, 120, 4);
  g.font = font(small); g.fillText('Mel Muñiz', 0, top + hBig + gap + ms.actualBoundingBoxAscent);
  g.restore();
}

SHOT(0, 25.0, '00-intro', (t) => {
  const A0 = g.globalAlpha;
  const roll = eio(ss(T.roll0, T.roll1, t));
  const dark = ss(T.ah1, T.roll1 + .2, t);

  // ---- the world ----
  sheet(C.w3);
  // the big pale paper sun, fixed where 04-sky's halo sits; she will rise into it
  const ox = 470 + jit(t, 3), oy = -150 + jit(t, 4);
  const zoom = 1.26;
  const toHalo = () => { g.translate(ox, oy); g.scale(zoom, zoom); };
  g.save(); toHalo();
  cut(circle(470, 470, 438), '#c3c8d3', { sh: .4, grain: .25 });
  cut(circle(470, 470, 404), C.w4, { sh: .5, grain: .25 });
  g.restore();
  cut(TOWN, C.w2, { sh: .5, grain: .2 });
  cut(HILL_BACK, C.w2, { sh: .6 });

  // birds leaving before the storm (10-17 s), grey paper, flying right and up, away from the cloud
  for (let i = 0; i < 3; i++) {
    const t0 = 10.2 + i * 1.1, d = t - t0; if (d < 0 || d > 8) continue;
    const bx = -120 + d * (300 + i * 40) + i * 90, by = 330 + i * 70 - d * (22 + i * 6) + Math.sin(d * 2 + i) * 10;
    gull(bx, by, 1 - i * .12, t * 8 + i * 2);
  }

  // the title card, between the hills (it rises from behind the front hill)
  if (t > T.cardUp - .05 && t < T.cardDown + 1.2) {
    const up = back((t - T.cardUp) / 1.0), down = ei((t - T.cardDown) / .8);
    const cy = lerp(1340, 440, up) + lerp(0, 900, down);
    const rot = (1 - clamp(up)) * .05 + jit(t, 5, .004) + down * -.04;
    titleCard(960, cy, rot);
  }
  cut(HILL_FRONT, C.w1, { sh: .7, lift: .2 });

  // the storm takes the light: the whole world dims as the cloud rolls in
  if (dark > 0) {
    sheet(C.w0, .42 * dark);
    // the cloud's own shadow falls from the upper left
    g.save(); g.globalAlpha *= dark * .55; const sg = g.createRadialGradient(640, 120, 80, 640, 120, 1100);
    sg.addColorStop(0, 'rgba(26,24,40,.85)'); sg.addColorStop(1, 'rgba(26,24,40,0)'); g.fillStyle = sg; g.fillRect(0, 0, W, H); g.restore();
  }

  // ---- HER: the big close profile, 04-sky framing, rising from below on the "Ah" ----
  const rise = eo((t - T.rise) / 2.2);
  if (rise > 0) {
    let tilt = -.055 * ss(T.ah1 + .1, T.ah1 + 1.3, t) * (1 - ss(21.0, 21.8, t))
               - .06 * ss(T.ah2, T.ah2 + 1.0, t) * (1 - ss(24.0, 24.85, t));
    const toHer = () => { g.translate(ox, oy + (1 - rise) * 1060); g.scale(zoom, zoom); g.translate(560, 900); g.rotate(tilt); g.translate(-560, -900); };
    g.save(); toHer(); cut(HEADS.her, C.navy, { sh: 1.2, lift: 1, grain: .3 }); g.restore();
    // her closed eye, cut out of the silhouette (singing)
    g.save(); toHer();
    g.strokeStyle = C.w3; g.globalAlpha = A0 * lerp(1, .8, dark); g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.arc(706, 452, 14, Math.PI * .12, Math.PI * .88); g.stroke();
    g.restore();
    // her voice: pale rings ride out from her mouth on each "Ah", away from the cloud
    for (const [w, n] of [[T.ah1 + .15, 3], [T.ah2, 4]]) {
      for (let r = 0; r < n; r++) {
        const d = t - w - r * .28; if (d < 0 || d > 2.6) continue;
        const k = d / 2.6;
        g.save(); toHer(); g.translate(800, 640); g.rotate(-.3);
        g.globalAlpha = A0 * (1 - k) * .8; g.strokeStyle = r % 2 ? C.cream : C.w4; g.lineWidth = lerp(13, 3, k); g.lineCap = 'round';
        g.beginPath(); g.arc(0, 0, 40 + k * 460, -.7, .7); g.stroke();
        g.restore();
      }
    }
  }

  // ---- the storm cloud: far off at upper left, then it rolls in over her head ----
  const sw = hitSwell(t);
  const cx = lerp(300, 650, roll) + Math.sin(t * .4) * 6 * (1 - roll);
  const cy = lerp(170, 215, roll) + Math.sin(t * .7) * 4;
  const cs = lerp(.3, .9, roll) * (1 + sw);
  // rolling: the cloud tips forward a little while it travels, and settles level
  const lean = Math.sin(roll * Math.PI) * .05;
  g.save(); g.translate(cx, cy); g.rotate(lean); g.scale(cs, cs);
  stormCloud(t);
  g.restore();
  g.globalAlpha = A0;
}, {});
})();
