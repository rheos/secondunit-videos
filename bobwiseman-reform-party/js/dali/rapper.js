// Reform Party, Dali look, draft 13: the playa's diva, a duet partner for the fast bridge (lines 14 to 26).
// Bob asked for a female rapper, a surreal creature: a woman in a long Dali gown with a horse's head whose mane is live
// fire. She rides a little drawer plinth bolted to the near front corner of the boardroom car, mic up, and answers the
// board. She drops onto the corner from the sky before the bridge and leaves the same way after it, riding her own fire
// straight up (never a fade or a scale). Alpha is used on the flames only.
// Hooked from drawCar (car.js): rapperCar(t, 0) before the table body (when she is on the far side of it) and
// rapperCar(t, 1) after the near seats (when she is on our side).
// draft 13: moved to our side of the table, behind the near row's left end (RAP_AT in camera.js), so the drone can hold on her
const RAP = { lx: RAP_AT.lx, lz: RAP_AT.lz, land: 122.7, go: 150.75, plH: .85, first: 14, last: 26 };
// her words: every word onset of the bridge, and the key words she throws an arm on (each line's first word, long words)
const RAP_W = (() => { const out = []; for (let li = RAP.first; li <= RAP.last; li++) LINES[li].words.forEach((w, j) => out.push({ s: w.s, e: w.e, key: j === 0 || w.w.length >= 6, n: out.length })); return out; })();
function rapJaw(t) { let m = 0; for (const w of RAP_W) { if (t < w.s - .02 || t > w.e + .15) continue; const d = Math.max(.12, Math.min(.22, w.e - w.s)), u = (t - w.s) / d;
  m = Math.max(m, u < 1 ? Math.sin(Math.PI * clamp(u)) : 0, t < w.e ? .25 : 0); } return m; }
function rapBob(t) { let m = 0; for (const w of RAP_W) { const d = t - w.s; if (d >= 0 && d < .4) m = Math.max(m, Math.exp(-d * 9)); } return m; }
function rapGesture(t) { let best = 0, kind = 0; for (const w of RAP_W) { if (!w.key) continue; const g = ease(t, w.s - .18, w.s + .02) * (1 - ease(t, w.s + .45, w.s + .75)); if (g > best) { best = g; kind = w.n % 3; } } return [best, kind]; }
// height above the corner: dropping in (dropY from car.js), standing, then riding her fire up and away
function rapLift(t) {
  if (t >= RAP.go) { const u = t - RAP.go; return .6 * u * u + 2.2 * u * u * u; }
  const H = dropHeight('rap:diva', RAP.land, RAP.lx, 1.2, RAP.lz), y = dropY(t, RAP.land, H); return y; }
// the last frame she is drawn after the bridge: the first moment the lens loses her on the way up (sampled, pure in t)
let RAP_GONE = null;
function rapGone() { if (RAP_GONE != null) return RAP_GONE; for (let u = RAP.go; u < RAP.go + 8; u += .04) { const y = rapLift(u), [X, Z] = carLocalToWorld(u, RAP.lx, RAP.lz); if (!camSees(u, X, y + 1.2, Z, 1.4)) return (RAP_GONE = u); } return (RAP_GONE = RAP.go + 8); }
function rapperCar(t, pass) {
  if (t < RAP.land - 6 || t > RAP.go + 8) return; const lift = rapLift(t); if (lift == null || t > rapGone()) return;
  const far = PL(RAP.lx, SEAT, RAP.lz)[2] > PL(0, SEAT, 0)[2]; if ((pass === 0) !== far) return;
  const [X, Z] = carLocalToWorld(t, RAP.lx, RAP.lz); ACT.note('rap:diva:0', X, Z, .45, { h: 2.3, group: 'rap' });
  const top = lift + RAP.plH, foot = PL(RAP.lx, top, RAP.lz); if (foot[2] < .3) return;
  rapShadow(t, lift, X, Z); rapPlinth(lift); rapFigure(t, foot, kAt(foot), lift > .05 ? clamp(lift / 3) : 0);
}
// a hard drawn shadow on the sand, thrown long like the suits' (it shrinks away as she rises)
function rapShadow(t, lift, X, Z) {
  if (lift > 6) return; const a = .3 * (1 - lift / 6), L = 2.6 + lift * .2, dx = .62, dz = -.78;
  const q = [P(X - .35, 0, Z - .3), P(X + .35, 0, Z + .3), P(X + .3 + dx * L, 0, Z + .3 + dz * L), P(X - .1 + dx * L * 1.05, 0, Z - .2 + dz * L * 1.05)];
  if (q.some((p) => p[2] < .3)) return; g.save(); g.fillStyle = `rgba(70,40,30,${a})`; g.beginPath(); q.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); g.restore(); }
// the plinth: an ochre box with one drawer half open (a Dali cabinet), bolted to the car's corner
function rapPlinth(lift) {
  const { lx, lz, plH } = RAP, s = .32, c = [[-s, -s], [s, -s], [s, s], [-s, s]].map(([a, b]) => [lx + a, lz + b]);
  const faces = []; for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4]; const pts = [PL(a[0], lift, a[1]), PL(b[0], lift, b[1]), PL(b[0], lift + plH, b[1]), PL(a[0], lift + plH, a[1])];
    if (pts.some((p) => p[2] < .3)) return; faces.push({ pts, d: (pts[0][2] + pts[1][2]) / 2, i }); }
  faces.sort((a, b) => b.d - a.d);
  for (const f of faces) { g.fillStyle = ['#b9822f', '#a06c24', '#c99441', '#8f5f1f'][f.i]; g.strokeStyle = '#3a2412'; g.lineWidth = 1.5; g.beginPath(); f.pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); g.stroke();
    if (f.i === 2) { const m = (u, v) => [lerp(lerp(f.pts[0][0], f.pts[1][0], u), lerp(f.pts[3][0], f.pts[2][0], u), v), lerp(lerp(f.pts[0][1], f.pts[1][1], u), lerp(f.pts[3][1], f.pts[2][1], u), v)];
      const r = [m(.25, .35), m(.75, .35), m(.75, .65), m(.25, .65)]; g.fillStyle = '#5a3816'; g.beginPath(); r.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.fill();
      const kn = m(.5, .5); g.fillStyle = '#e8c070'; g.beginPath(); g.arc(kn[0], kn[1], Math.max(1.5, Math.hypot(r[1][0] - r[0][0], r[1][1] - r[0][1]) * .06), 0, TAU); g.fill(); } }
  const tp = c.map(([a, b]) => PL(a, lift + plH, b)); g.fillStyle = '#d8a656'; g.beginPath(); tp.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); g.stroke(); }
// one tongue of fire from (x, y) up to height h (px), width w, leaning lean; alpha only here
function rapFlame(x, y, w, h, lean, a) {
  const gr = g.createLinearGradient(x, y, x + lean, y - h); gr.addColorStop(0, `rgba(255,90,20,${a})`); gr.addColorStop(.45, `rgba(255,170,40,${a * .9})`); gr.addColorStop(1, `rgba(255,240,150,${a * .5})`);
  g.fillStyle = gr; g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(x - w * .8, y - h * .55, x + lean, y - h); g.quadraticCurveTo(x + w * .9, y - h * .5, x + w, y); g.closePath(); g.fill(); }
function rapFigure(t, f, k, rocket) {
  const tab = PL(0, TOP, 0), s = tab[2] > .3 && tab[0] < f[0] ? -1 : 1; // she faces the board
  const jaw = rapJaw(t), bob = rapBob(t), [gest, kind] = rapGesture(t), sway = n1(41, t * .9) * .03;
  // pt: her own metres (x toward the board, y up) to screen
  const pt = (x, y) => [f[0] + s * x * k, f[1] - y * k];
  const poly = (pts, fill, stroke) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = Math.max(1, .012 * k); g.stroke(); } };
  const limb = (a, b, c, wd, col) => { g.strokeStyle = col; g.lineWidth = wd * k; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.lineTo(...c); g.stroke(); };
  g.save();
  if (rocket > 0) for (let i = 0; i < 5; i++) { const fl = n1(60 + i, t * 9); rapFlame(...pt((i - 2) * .09, 0), .1 * k, (.7 + .5 * fl + rocket * 1.4) * k, -fl * .1 * k, .85); g.save(); g.scale(1, -1); g.restore(); }
  // the gown: ultramarine, long, the hem melting into drips over the plinth edge
  const hem = []; for (let i = 0; i <= 8; i++) { const u = i / 8, x = lerp(-.4, .36, u), drip = (i % 2 ? .02 : -.06 - .05 * rnd(i, 7)) + n1(70 + i, t * .6) * .015; hem.push(pt(x, drip)); }
  const by = -bob * .02; // the body dips a touch on each word
  poly([pt(-.13 + sway, 1.42 + by), pt(.13 + sway, 1.42 + by), pt(.1, 1.0), pt(.36, .05), ...hem.reverse(), pt(-.4, .05), pt(-.12, 1.0)], '#22398c', '#101a44');
  poly([pt(-.12, 1.02), pt(.11, 1.02), pt(.12, .94), pt(-.13, .94)], '#d9a73c'); // a gold sash
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = Math.max(1, .02 * k); g.beginPath(); g.moveTo(...pt(.04, .95)); g.quadraticCurveTo(...pt(.18, .5), ...pt(.26, .06)); g.stroke(); // a fold of light
  const shF = pt(.15 + sway, 1.38 + by), shB = pt(-.15 + sway, 1.38 + by);
  // free arm (behind the gown edge): a raised fist, a point at the board, or a sweep out to the playa on key words
  { const rest = [pt(-.2, 1.12), pt(-.2, .88)]; let el = rest[0], hd = rest[1];
    if (gest > 0) { const tgt = kind === 0 ? [pt(-.38, 1.62), pt(-.3, 1.95)] : kind === 1 ? [pt(.05, 1.3), pt(.45, 1.5)] : [pt(-.45, 1.3), pt(-.72, 1.42)];
      el = [lerp(rest[0][0], tgt[0][0], gest), lerp(rest[0][1], tgt[0][1], gest)]; hd = [lerp(rest[1][0], tgt[1][0], gest), lerp(rest[1][1], tgt[1][1], gest)]; }
    limb(shB, el, hd, .075, '#22398c'); g.fillStyle = '#141414'; g.beginPath(); g.arc(hd[0], hd[1], .05 * k, 0, TAU); g.fill(); }
  // neck and the horse's head, bobbing on the words, the lower jaw dropping on each onset
  const nk = pt(.02 + sway, 1.42 + by), hb = -bob * .045, hp = pt(.06 + sway * 1.5, 1.66 + by + hb), tilt = s * (.15 * bob - .05);
  poly([pt(-.06 + sway, 1.4 + by), pt(.08 + sway, 1.4 + by), [hp[0] + s * .07 * k, hp[1] + .02 * k], [hp[0] - s * .09 * k, hp[1] - .02 * k]], '#7d3f22', '#2e160c');
  // the mane: live fire down the back of the head and neck
  for (let i = 0; i < 7; i++) { const u = i / 6, bx = lerp(hp[0] - s * .08 * k, nk[0] - s * .07 * k, u), byy = lerp(hp[1] - .12 * k, nk[1], u), fl = n1(90 + i, t * 7 + i);
    rapFlame(bx, byy, (.05 + .02 * fl) * k, (.34 + .14 * fl - .1 * u) * k, -s * (.12 + .05 * fl) * k, .9); }
  g.save(); g.translate(hp[0], hp[1]); g.rotate(tilt); g.scale(s * k, k); g.lineWidth = .012;
  // skull and upper muzzle (metres, x toward the board)
  g.fillStyle = '#8a4a2a'; g.strokeStyle = '#2e160c'; g.beginPath(); g.moveTo(-.1, -.02); g.quadraticCurveTo(-.08, -.17, .04, -.16); g.quadraticCurveTo(.22, -.13, .33, -.06); g.quadraticCurveTo(.36, -.03, .34, .0); g.lineTo(.02, .02); g.closePath(); g.fill(); g.stroke();
  // lower jaw, hinged at the cheek
  g.save(); g.translate(.0, .01); g.rotate(jaw * .38); g.fillStyle = '#6e341a'; g.beginPath(); g.moveTo(-.08, -.01); g.lineTo(.31, -.01); g.quadraticCurveTo(.3, .05, .2, .06); g.quadraticCurveTo(.0, .07, -.08, .04); g.closePath(); g.fill(); g.stroke(); g.restore();
  if (jaw > .2) { g.fillStyle = '#2b0f0a'; g.beginPath(); g.moveTo(.06, .0); g.lineTo(.31, .0); g.lineTo(.29, .0 + jaw * .1); g.closePath(); g.fill(); }
  g.fillStyle = '#f2e6cf'; g.beginPath(); g.moveTo(.02, -.155); g.quadraticCurveTo(.2, -.13, .3, -.065); g.lineTo(.27, -.05); g.quadraticCurveTo(.16, -.1, .03, -.13); g.closePath(); g.fill(); // the blaze
  g.fillStyle = '#8a4a2a'; g.beginPath(); g.moveTo(-.06, -.14); g.lineTo(-.03, -.27); g.lineTo(.01, -.15); g.closePath(); g.fill(); g.stroke(); // ear
  g.fillStyle = '#120806'; g.beginPath(); g.ellipse(.07, -.09, .022, .015, -.2, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(.075, -.094, .006, 0, TAU); g.fill(); // eye, half-lidded attitude
  g.strokeStyle = '#120806'; g.beginPath(); g.moveTo(.035, -.115); g.lineTo(.105, -.105); g.stroke(); // the lid line
  g.fillStyle = '#2e160c'; g.beginPath(); g.ellipse(.31, -.045, .014, .009, 0, 0, TAU); g.fill(); // nostril
  g.fillStyle = '#e9c24a'; g.beginPath(); g.arc(-.02, -.03, .018, 0, TAU); g.fill(); // a gold hoop earring
  g.restore();
  // the mic arm stays up: shoulder, elbow out, the gloved hand holding the mic at her muzzle
  const mh = [hp[0] + s * (.24 + .02 * bob) * k, hp[1] + (.08 + .02 * jaw) * k], me = pt(.3, 1.24 + by);
  // draft 17 (Robin: "the horse lady rapper should be holding a cordless microphone"): a handheld cordless mic, big enough
  // to read in the close shots: a black handle with a silver collar and a ball grille at her muzzle, no cable
  limb(shF, me, mh, .075, '#22398c');
  const mb = [mh[0] + s * .05 * k, mh[1] - .09 * k], mhb = [mh[0] - s * .035 * k, mh[1] + .13 * k], mr = .068 * k;
  g.lineCap = 'round'; g.strokeStyle = '#000'; g.lineWidth = .075 * k; g.beginPath(); g.moveTo(...mhb); g.lineTo(...mb); g.stroke(); // the handle's dark edge
  g.strokeStyle = '#1e1e22'; g.lineWidth = .055 * k; g.stroke(); g.strokeStyle = '#4a4a52'; g.lineWidth = .012 * k; g.beginPath(); g.moveTo(mhb[0] + s * .012 * k, mhb[1]); g.lineTo(mb[0] + s * .012 * k, mb[1]); g.stroke(); // a sheen down it
  const cl = [lerp(mhb[0], mb[0], .78), lerp(mhb[1], mb[1], .78)]; g.strokeStyle = '#c9ccd2'; g.lineWidth = .07 * k; g.lineCap = 'butt'; g.beginPath(); g.moveTo(...cl); g.lineTo(lerp(mhb[0], mb[0], .86), lerp(mhb[1], mb[1], .86)); g.stroke(); // the silver collar
  const mg = g.createRadialGradient(mb[0] - .022 * k, mb[1] - .022 * k, 1, mb[0], mb[1], mr); mg.addColorStop(0, '#ffffff'); mg.addColorStop(.45, '#d4d7dc'); mg.addColorStop(1, '#6a6d74');
  g.fillStyle = mg; g.beginPath(); g.arc(mb[0], mb[1], mr, 0, TAU); g.fill(); g.strokeStyle = '#2a2a30'; g.lineWidth = Math.max(1, .01 * k); g.stroke();
  g.save(); g.beginPath(); g.arc(mb[0], mb[1], mr, 0, TAU); g.clip(); g.strokeStyle = 'rgba(60,62,70,.55)'; g.lineWidth = Math.max(.6, .005 * k); g.beginPath(); // the grille mesh
  for (let i = -3; i <= 3; i++) { g.moveTo(mb[0] + i * mr / 3.5, mb[1] - mr); g.lineTo(mb[0] + i * mr / 3.5, mb[1] + mr); g.moveTo(mb[0] - mr, mb[1] + i * mr / 3.5); g.lineTo(mb[0] + mr, mb[1] + i * mr / 3.5); } g.stroke(); g.restore();
  g.fillStyle = '#141414'; g.beginPath(); g.arc(mh[0], mh[1], .05 * k, 0, TAU); g.fill(); // the gloved hand round the handle
  g.restore();
}
