// 31.5-44.9 "(table) In her dream nobody's hungry, babies are rocking in cradles".
// The table top rises into view (rise transition): a still life on the dream cloth. Empty bowls at first;
// oranges, loaves and plates drop in one after another on the beat until it is plenty. "nobody's": the soup
// fills; "hungry": steam ribbons rise from everything. The camera follows the steam up into a night band
// where three crescent-moon cradles hold sleeping babies; on "rocking" they rock in time with the band.
// "cradles": the middle cradle swings toward us in front of a paper sun halo, the image 04 slides over.
(() => {
const BEATS = [31.83, 32.23, 32.62, 33.02, 33.39, 33.79, 34.18, 34.57, 34.97, 35.39, 35.78, 36.18, 36.55, 36.94, 37.34, 37.73,
  38.1, 38.48, 38.85, 39.22, 39.59, 39.98, 40.38, 40.75, 41.12, 41.52, 41.91, 42.28, 42.66, 43.03, 43.37, 43.75, 44.12, 44.54, 44.91];
const W_ = (w, n = 0) => wordAt(w, n, 31);
const T = { nobody: W_("nobody's"), hungry: W_('hungry'), babies: W_('babies'), rocking: W_('rocking'), cradles: W_('cradles') };
const BAND = 728, FRONT = 838;            // the table top band (naive perspective) and its front edge
const SIT = 792;                          // things stand on this line in the band

// ---- local paper props ----
// a bowl: rim at y, half-disc body below; the foot is a small flat strip
function bowlAt(x, y, r, col) {
  const p = new Path2D(); p.moveTo(x - r, y); p.bezierCurveTo(x - r, y + r * .62, x - r * .45, y + r * .7, x, y + r * .7);
  p.bezierCurveTo(x + r * .45, y + r * .7, x + r, y + r * .62, x + r, y); p.closePath();
  cut(cutRect(x - r * .32, y + r * .64, r * .64, r * .12, x, 1), col, { sh: .5 });
  cut(p, col, { sh: .8, lift: .3 });
  cut(rect(x - r - 4, y - 7, 2 * r + 8, 12), col, { sh: .4, grain: .15 });
}
function orangeAt(x, y, r, rot = 0) {
  cut(circle(x, y, r), C.orange, { sh: .6, lift: .2 });
  g.save(); g.translate(x, y); g.rotate(rot);
  cut(ellipse(r * .22, -r * .96, r * .32, r * .13, -.45), C.sky1, { sh: .25, grain: .1 });
  g.restore();
}
function loafAt(x, y, w, h, rot = 0, long = false) {
  g.save(); g.translate(x, y); g.rotate(rot);
  const p = new Path2D(); p.moveTo(-w / 2, 0);
  p.bezierCurveTo(-w / 2, -h * (long ? .9 : .75), -w * (long ? .38 : .3), -h, 0, -h);
  p.bezierCurveTo(w * (long ? .38 : .3), -h, w / 2, -h * (long ? .9 : .75), w / 2, 0); p.closePath();
  cut(p, C.goldPale, { sh: .7, lift: .2 });
  g.strokeStyle = 'rgba(196,111,105,.6)'; g.lineWidth = 5; g.lineCap = 'round';
  const n = long ? 4 : 3;
  for (let i = 0; i < n; i++) { const u = (i + .5) / n - .5, cx = u * w * .78, cy = -h * (long ? .62 : .6) + Math.abs(u) * h * .25;
    g.beginPath(); g.moveTo(cx - w * .05, cy - h * .1); g.quadraticCurveTo(cx, cy - h * .02, cx + w * .05, cy + h * .1); g.stroke(); }
  g.restore();
}
function plateAt(x, y, w) {
  cut(ellipse(x, y - 6, w / 2, 9), C.cream, { sh: .55, lift: .1 });
  g.save(); g.strokeStyle = C.sky1; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y - 6, w / 2 - 3, 6, 0, Math.PI * .04, Math.PI * .96); g.stroke(); g.restore();
}
// steam: short wavy paper wisps that keep leaving (x, y) from t0, rise and fade; reach = how far they climb
function steam(t, t0, x, y, i, { every = .4, life = 2.4, speed = 330, w = 16, len = 220 } = {}) {
  if (t < t0) return;
  const n0 = Math.floor((t - t0 - life) / every), n1 = Math.floor((t - t0) / every);
  for (let n = Math.max(0, n0); n <= n1; n++) {
    const born = t0 + n * every, a = t - born; if (a < 0 || a > life) continue;
    const yy = y - a * speed, al = ss(0, .25, a) * (1 - ss(life * .45, life, a));
    const pts = []; const m = 12;
    for (let j = 0; j <= m; j++) { const u = j / m; pts.push([x + Math.sin(u * 3.6 + a * 2.2 + n * 1.3 + i) * (10 + a * 12) + Math.sin(a * 1.4 + n) * 18, yy - u * len * (.7 + .3 * ss(0, .6, a))]); }
    cut(ribbonAlong(pts, w * (1 + a * .25)), C.white, { sh: .3, grain: .12, alpha: .92 * al * (1 - ss(40.4, 41.8, t)) });
  }
}
// a sleeping baby in a crescent-moon cradle, cradle centre at (0,0), radius r, horns up
function moonCradle(r) {
  const dy = .45 * r, r2 = .9 * r, h = .452;
  const p = new Path2D(); p.arc(0, 0, r, -h, Math.PI + h, false); p.arc(0, -dy, r2, Math.PI - .016, .016, true); p.closePath();
  return p;
}
function cradle(r, eye = 0) {
  cut(moonCradle(r), C.gold, { sh: .9, lift: .5, grain: .25 });
  // the baby: a small navy child's head in profile, lying face up with the crown toward the right horn,
  // eyes closed; its neck and body are under the blanket
  const sc = .00086 * r;
  g.save(); g.translate(.17 * r, .1 * r); g.transform(0, -sc, -sc, 0, 0, 0); g.translate(-580, -800);
  g.save(); g.strokeStyle = C.cream; g.lineWidth = 44; g.lineJoin = 'round'; g.stroke(HEADS.child); g.restore();   // a cut edge so it reads on the night
  cut(HEADS.child, C.navy, { sh: .7, grain: .22 });
  if (eye > 0) { g.globalAlpha *= eye; g.strokeStyle = C.cream; g.lineWidth = 16; g.lineCap = 'round';
    g.beginPath(); g.arc(676, 470, 32, Math.PI * .12, Math.PI * .88); g.stroke(); }
  g.restore();
  // the blanket: cream, tucked under the chin; its scalloped lace edge runs parallel to the moon's inner rim,
  // draping over it
  const inner = (x) => -.45 * r + Math.sqrt(Math.max(0, .81 * r * r - x * x));
  const sr = r * .05, x0 = -.8 * r, x1 = .24 * r, hem = (x) => inner(x) + .12 * r;
  const p = new Path2D();
  p.moveTo(x0, inner(x0) - .06 * r);
  p.bezierCurveTo(-.6 * r, -.1 * r, -.3 * r, -.06 * r, -.08 * r, -.05 * r);    // over the feet and the body
  p.bezierCurveTo(.06 * r, -.04 * r, .14 * r, .0, .19 * r, .08 * r);            // up under the chin
  p.bezierCurveTo(.22 * r, .16 * r, .24 * r, .26 * r, x1, hem(x1));            // down over the rim
  for (let x = x1; x > x0 + sr; x -= 2 * sr) { const xm = x - sr; p.arc(xm, hem(xm), sr, Math.atan2(hem(x) - hem(xm), sr), Math.PI + Math.atan2(hem(x - 2 * sr) - hem(xm), -sr) - Math.PI, false); }
  p.lineTo(x0, inner(x0) - .06 * r); p.closePath();
  for (let x = x1 - 2 * sr; x > x0 + 2 * sr; x -= 2 * sr) { const hy = hem(x) - sr * 1.15; p.moveTo(x + sr * .3, hy); p.arc(x, hy, sr * .3, 0, Math.PI * 2); }
  cut(p, C.white, { sh: .9, lift: .4, grain: .18, rule: 'evenodd' });
  g.save(); g.strokeStyle = C.gold; g.globalAlpha *= .75; g.lineWidth = r * .016; g.lineCap = 'round'; g.setLineDash([r * .035, r * .03]);
  g.beginPath(); g.moveTo(x0 + .1 * r, inner(x0) - .01 * r); g.bezierCurveTo(-.58 * r, -.05 * r, -.3 * r, -.02 * r, -.08 * r, -.01 * r);
  g.bezierCurveTo(.04 * r, 0, .1 * r, .03 * r, .14 * r, .08 * r); g.stroke(); g.restore();
}

SHOT(31.5, 44.9, 'hungry', (t, k, d) => {
  const A0 = g.globalAlpha;
  // ---- the camera follows the steam up into the night ----
  const camY = 1240 * eio(ss(38.75, 40.6, t));
  sheet(C.sky0);
  g.save(); g.translate(0, camY);

  // the night band above the wall: a deep gradient (sky), stars
  const sg = g.createLinearGradient(0, -1250, 0, 200); sg.addColorStop(0, C.sky0); sg.addColorStop(.7, C.sky1); sg.addColorStop(1, '#3a3a78');
  g.fillStyle = sg; g.fillRect(-20, -1300, W + 40, 1700);
  for (let i = 0; i < 40; i++) {
    const sx = hash(i * 4.7) * W, sy = -1180 + hash(i * 9.3) * 1290;
    const tw = .7 + .3 * Math.sin(t * 2.6 + i * 1.9), on = sy > -120 ? 1 : ss(38.6 + hash(i) * 1.6, 39.2 + hash(i) * 1.6, t);
    if (on > 0) cut(star4(sx, sy, (hash(i * 2.1) > .82 ? 15 : 7) * tw), hash(i * 1.3) > .7 ? C.goldPale : C.cream, { sh: 0, grain: 0, alpha: on });
  }
  // the rose wall, torn along its top edge
  const tear = []; tear.push([-40, 1200]); for (let x = -40; x <= W + 40; x += 48) tear.push([x, -120 + (hash(x * .37) - .5) * 26 + Math.sin(x / 210) * 14]); tear.push([W + 40, 1200]);
  cut(poly(tear), C.rose, { sh: 1, lift: .6 });

  // ---- the table: a close still life, scaled up from the table line ----
  g.save(); g.translate(960, 598); g.scale(1.4, 1.4); g.translate(-960, -SIT);
  cut(poly([[-40, BAND], [W + 40, BAND], [W + 40, FRONT], [-40, FRONT]]), C.creamDeep, { sh: .6, grain: .2 });
  // the cloth front, with the scallops and lace holes of 02 just showing at the bottom
  const cl = new Path2D(); const hem = 1150, r = 26;
  cl.moveTo(-40, FRONT - 2); cl.lineTo(W + 40, FRONT - 2); cl.lineTo(W + 40, hem);
  for (let x = W + 40; x > -40; x -= 2 * r) cl.arc(x - r, hem, r, 0, Math.PI, false);
  cl.closePath(); for (let x = -40 + r; x < W + 40; x += 2 * r) { cl.moveTo(x + 7, hem - 26); cl.arc(x, hem - 26, 7, 0, Math.PI * 2); }
  cut(cl, C.cream, { sh: .9, lift: .3, rule: 'evenodd' });

  // a drop: 0 before it falls, falls for .3 s and lands ON the beat with a little paper bounce
  const drop = (tb, fromY = -260) => { const f = (t - (tb - .3)) / .3; if (f < 0) return null; if (f < 1) return { y: lerp(fromY, 0, ei(f)), sq: 1 };
    const b = t - tb; return { y: -Math.sin(Math.min(b, .22) / .22 * Math.PI) * 12 * Math.exp(-b * 3), sq: 1 - bump(t, tb, .16) * .12 }; };
  const B = (i) => BEATS[i];

  // plates, stacking on the left
  const PX = 512;
  for (let i = 0; i < 5; i++) {
    const at = [0, B(4), B(6), B(10), B(13)][i];
    const dd = i === 0 ? { y: 0 } : drop(at); if (!dd) continue;
    plateAt(PX + (hash(i * 3) - .5) * 8, SIT + 2 - i * 13 + dd.y, 190);
  }
  // bowl 1 heaped with oranges
  const B1 = { x: 731, r: 148 }, rim1 = SIT - B1.r * .7 + 6;
  const ORS1 = [[-70, -18, B(1)], [10, -22, B(2)], [84, -14, B(5)], [-34, -78, B(7)], [46, -80, B(9)], [8, -138, B(11)]];
  ORS1.forEach(([ox, oy, at], i) => { const dd = drop(at); if (!dd) return; orangeAt(B1.x + ox, rim1 + oy + dd.y, 40, (hash(i) - .5)); });
  bowlAt(B1.x, rim1, B1.r, C.sky1);
  // a round loaf
  { const dd = drop(B(3)); if (dd) { g.save(); g.translate(935, SIT + 2 + dd.y); g.scale(1 / dd.sq, dd.sq); loafAt(0, 0, 230, 150); g.restore(); } }
  // the soup bowl: fills on "nobody's"
  const B2 = { x: 1135, r: 118 }, rim2 = SIT - B2.r * .7 + 6;
  const fill = eo(ss(T.nobody - .05, T.nobody + .7, t));
  if (fill > 0) { cut(ellipse(B2.x, rim2 - 2 + (1 - fill) * 50, B2.r * .96, 16 + fill * 8), C.orange, { sh: .3, grain: .2 }); }
  bowlAt(B2.x, rim2, B2.r, C.sky1);
  // a long loaf leaning, and bowl 2 of oranges
  { const dd = drop(B(8)); if (dd) loafAt(1318, SIT + dd.y, 230, 84, 0, true); }
  const B3 = { x: 1488, r: 104 }, rim3 = SIT - B3.r * .7 + 6;
  const ORS3 = [[-46, -16, B(12)], [34, -18, B(14)], [-6, -66, B(15)]];
  ORS3.forEach(([ox, oy, at], i) => { const dd = drop(at); if (!dd) return; orangeAt(B3.x + ox, rim3 + oy + dd.y, 36, (hash(i + 9) - .5)); });
  bowlAt(B3.x, rim3, B3.r, C.sky1);
  // a last orange lands on "nobody's" in front of everything, rolling to a stop
  { const dd = drop(T.nobody); if (dd) { const roll = eo(clamp((t - T.nobody) / 1.2)); orangeAt(1020 + roll * 26, SIT + 30 - 34 + dd.y, 34, roll * 2.4); } }

  // ---- "hungry": steam rises from everything and leads the eye up ----
  const H0 = T.hungry - .12;
  steam(t, H0, B2.x - 34, rim2 - 14, 0, { w: 17 }); steam(t, H0 + .27, B2.x + 36, rim2 - 14, 1, { w: 17 });
  steam(t, H0 + .14, 912, SIT - 156, 2); steam(t, H0 + .36, B1.x + 8, rim1 - 186, 3, { w: 13 });
  steam(t, H0 + .22, B3.x - 6, rim3 - 110, 4, { w: 13 }); steam(t, H0 + .45, PX, SIT - 80, 5, { w: 12 });
  g.restore();
  g.restore();

  // ---- the night: crescent-moon cradles (drawn in screen space; they arrive as the camera reaches them) ----
  const rockAmp = lerp(.07, .3, ss(T.rocking - .15, T.rocking + .3, t));
  const rockPh = (t - T.rocking) / (2 * .3935) * Math.PI;          // one swing every two beats
  const CR = [
    { x: 470, y: 330, r: 120, at: T.babies, ph: 0 },
    { x: 1450, y: 300, r: 130, at: T.babies + .38, ph: Math.PI },
    { x: 960, y: 560, r: 160, at: T.babies + .76, ph: .0, hero: true },
  ];
  const forward = ss(T.cradles - .05, T.cradles + 1.5, t);           // "cradles": the middle one swings toward us
  // the paper sun halo grows behind it (04 opens on this halo)
  const HX = 1080, HY = 462;
  if (forward > 0) {
    const hr = 470 * back(forward / .55) * lerp(.2, 1, ss(0, .2, forward));
    cut(circle(HX, HY, hr + 34), C.goldPale, { sh: .5, grain: .25 });
    cut(circle(HX, HY, hr), C.sun, { sh: .6, grain: .25 });
  }
  CR.forEach((c, i) => {
    const a = pop(t, c.at, .55); if (a <= 0) return;
    const comeIn = (1 - eo(ss(c.at - .3, c.at + .5, t))) * 260;     // they rise into place with the camera
    let x = c.x, y = c.y + comeIn, s = a;
    let rot = Math.sin(rockPh + c.ph) * rockAmp + Math.sin(t * 1.3 + i) * .03;
    let alpha = 1;
    if (c.hero) { const e = eio(forward); x = lerp(c.x, HX, e); y = lerp(c.y, HY + 40, e); s *= lerp(1, 2.3, e); rot *= lerp(1, .55, e); }
    else { s *= 1 - eio(ss(.1, .6, forward)); y -= forward * 120; x += (c.x - 960) * forward * .5; }   // they shrink away into the stars
    if (s <= .01) return;
    g.save(); g.globalAlpha *= alpha; g.translate(x, y); g.rotate(rot); g.scale(s, s);
    cradle(c.r, c.hero ? ss(.3, .8, forward) : 0);
    g.restore();
  });
}, { xin: .8, tr: 'rise' });
})();
