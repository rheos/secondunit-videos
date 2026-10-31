// Reform Party, Dali look, draft 13: the playa's diva, a duet partner for the fast bridge (lines 14 to 26).
// Bob asked for a female rapper, a surreal creature: a woman in a long Dali gown with a horse's head whose mane is live
// fire. She rides a little drawer plinth bolted to the near front corner of the boardroom car, mic up, and answers the
// board. She drops onto the corner from the sky before the bridge and leaves the same way after it, riding her own fire
// straight up (never a fade or a scale). Alpha is used on the flames only.
// Hooked from drawCar (car.js): rapperCar(t, 0) before the table body (when she is on the far side of it) and
// rapperCar(t, 1) after the near seats (when she is on our side).
// draft 13: moved to our side of the table, behind the near row's left end (RAP_AT in camera.js), so the drone can hold on her
const RAP = { lx: RAP_AT.lx, lz: RAP_AT.lz, land: 121.9, go: 150.75, plH: .85, first: 14, last: 26 };
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
function rapFigure(t, f, k, rocket, o = {}) { // o (draft 37's spin singers): s, jaw, bob, gest, kind and gown override her own
  const tab = PL(0, TOP, 0), s = o.s || (tab[2] > .3 && tab[0] < f[0] ? -1 : 1); // she faces the board
  const jaw = o.jaw ?? rapJaw(t), bob = o.bob ?? rapBob(t), [gest, kind] = o.gest != null ? [o.gest, o.kind || 0] : rapGesture(t), sway = n1(41 + (o.seed || 0), t * .9) * .03;
  const gown = o.gown || ['#22398c', '#101a44'];
  // pt: her own metres (x toward the board, y up) to screen
  const pt = (x, y) => [f[0] + s * x * k, f[1] - y * k];
  const poly = (pts, fill, stroke) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = Math.max(1, .012 * k); g.stroke(); } };
  const limb = (a, b, c, wd, col) => { g.strokeStyle = col; g.lineWidth = wd * k; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.lineTo(...c); g.stroke(); };
  g.save();
  if (rocket > 0) for (let i = 0; i < 5; i++) { const fl = n1(60 + i, t * 9); rapFlame(...pt((i - 2) * .09, 0), .1 * k, (.7 + .5 * fl + rocket * 1.4) * k, -fl * .1 * k, .85); g.save(); g.scale(1, -1); g.restore(); }
  // the gown: ultramarine, long, the hem melting into drips over the plinth edge
  const hem = []; for (let i = 0; i <= 8; i++) { const u = i / 8, x = lerp(-.4, .36, u), drip = (i % 2 ? .02 : -.06 - .05 * rnd(i, 7)) + n1(70 + i, t * .6) * .015; hem.push(pt(x, drip)); }
  const by = -bob * .02; // the body dips a touch on each word
  poly([pt(-.13 + sway, 1.42 + by), pt(.13 + sway, 1.42 + by), pt(.1, 1.0), pt(.36, .05), ...hem.reverse(), pt(-.4, .05), pt(-.12, 1.0)], gown[0], gown[1]);
  poly([pt(-.12, 1.02), pt(.11, 1.02), pt(.12, .94), pt(-.13, .94)], '#d9a73c'); // a gold sash
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = Math.max(1, .02 * k); g.beginPath(); g.moveTo(...pt(.04, .95)); g.quadraticCurveTo(...pt(.18, .5), ...pt(.26, .06)); g.stroke(); // a fold of light
  const shF = pt(.15 + sway, 1.38 + by), shB = pt(-.15 + sway, 1.38 + by);
  // free arm (behind the gown edge): a raised fist, a point at the board, or a sweep out to the playa on key words
  { const rest = [pt(-.2, 1.12), pt(-.2, .88)]; let el = rest[0], hd = rest[1];
    if (gest > 0) { const tgt = kind === 0 ? [pt(-.38, 1.62), pt(-.3, 1.95)] : kind === 1 ? [pt(.05, 1.3), pt(.45, 1.5)] : [pt(-.45, 1.3), pt(-.72, 1.42)];
      el = [lerp(rest[0][0], tgt[0][0], gest), lerp(rest[0][1], tgt[0][1], gest)]; hd = [lerp(rest[1][0], tgt[1][0], gest), lerp(rest[1][1], tgt[1][1], gest)]; }
    limb(shB, el, hd, .075, gown[0]); g.fillStyle = '#141414'; g.beginPath(); g.arc(hd[0], hd[1], .05 * k, 0, TAU); g.fill(); }
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
  limb(shF, me, mh, .075, gown[0]);
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

// ---------- Draft 37e: the stilt women, drawn close up ----------
// Robin on 37d: "those characters are terrible and all out of proportion... upgrade them to horse quality... make them
// the same size as the horses were". playa.js's bmStilter is a far-off crowd sketch (a 0.26 m head on 2.4 m of body);
// this is a close-up drawing at the diva's scale and finish, from his photo (robin-2026-10-18/27-28): real proportions
// on 1 m stilts (hips 1.95 m above the playa, shoulders 2.45, head 2.64), flat shapes with a thin dark outline, a fold of
// light, faces that sing. j 0: the rainbow walker (flower crown on short blonde hair, rainbow-striped bodysuit, a cream
// vest with an orange ruffle and a ruffled tail, bare arms, purple and pink fin cuffs over the stilt feet, black poles
// with coloured tape). j 1: the purple walker (spiky purple hair, a purple sequin crop top under a purple jacket piped in
// pink with tattered hems, long pink gloves, purple hot pants, and the big purple diamond stilt covers edged in pink).
// (x0, y0): the screen point of the playa under her; k px per metre; s 1 faces right, -1 left; mouth 0..1; wave 0..1
// lifts the free arm; t drives small motion only.
function stiltWoman(j, x0, y0, k, s, t, mouth, wave) {
  const pt = (x, y) => [x0 + s * x * k, y0 - y * k];
  const ink = 'rgba(34,16,30,.9)', lw = Math.max(1, .011 * k);
  const poly = (pts, fill, stroke) => { g.beginPath(); pts.forEach((p, i) => { const q = pt(p[0], p[1]); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); g.fillStyle = fill; g.fill(); if (stroke !== false) { g.strokeStyle = stroke || ink; g.lineWidth = lw; g.stroke(); } };
  const lg = (x1, y1, x2, y2, cols) => { const a = pt(x1, y1), b = pt(x2, y2), gr = g.createLinearGradient(a[0], a[1], b[0], b[1]); cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1), c)); return gr; };
  const limb = (pts, w, col, outline = true) => { const q = pts.map((p) => pt(p[0], p[1])); g.lineCap = 'round'; g.lineJoin = 'round';
    if (outline) { g.strokeStyle = ink; g.lineWidth = w * k + 2 * lw; g.beginPath(); q.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); }
    g.strokeStyle = col; g.lineWidth = w * k; g.beginPath(); q.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); };
  const dot = (x, y, r, fill, stroke) => { const q = pt(x, y); g.beginPath(); g.arc(q[0], q[1], r * k, 0, TAU); g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
  const oval = (x, y, rx, ry, fill, rot = 0, stroke) => { const q = pt(x, y); g.beginPath(); g.ellipse(q[0], q[1], rx * k, ry * k, s * rot, 0, TAU); g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
  const band = (a, b, wa, wb) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    return [[a[0] + nx * wa, a[1] + ny * wa], [b[0] + nx * wb, b[1] + ny * wb], [b[0] - nx * wb, b[1] - ny * wb], [a[0] - nx * wa, a[1] - ny * wa]]; };
  const skin = j ? '#f0d2bc' : '#f2d8c2', skinD = j ? '#d9ae96' : '#dcb79e';
  const sway = Math.sin(t * 2.1 + j) * .012, bob = Math.sin(t * 4.2 + j * 2) * .006;
  const HIP = 1.95 + bob, SH = 2.45 + bob, HD = [ .01 + sway * 1.4, 2.66 + bob];
  // ---- legs below the hips ----
  if (j === 0) {
    const RAIN = ['#e8452f', '#ee9a42', '#f2d040', '#5fbf4a', '#3f86d8', '#7a52c8'];
    for (const [lx, ph] of [[-.1, 0], [.1, 1]]) { // two legs, the far one first
      const knee = [lx * 1.05 + sway, 1.47], foot = [lx * 1.15, 1.0], hip = [lx * .7 + sway, HIP - .04];
      // black poles from the foot plate down past the frame, with tape bands
      for (const px of [-.035, .035]) { limb([[foot[0] + px, 1.0], [foot[0] + px * 2.4, -.2]], .03, '#1c1a1e', false);
        for (const by of [.62, .35]) poly(band([foot[0] + px * (1 + 1.4 * (1 - by)), by + .03], [foot[0] + px * (1 + 1.4 * (1 - by)), by - .03], .028, .028), ['#e8452f', '#f2d040', '#3f86d8'][Math.round(by * 10) % 3], false); }
      // thigh and calf as tapered shapes, striped across
      for (const [a, b, wa, wb] of [[hip, knee, .085, .06], [knee, foot, .06, .045]]) { const n = 7;
        poly(band(a, b, wa, wb), RAIN[0]); for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n, A = [lerp(a[0], b[0], u0), lerp(a[1], b[1], u0)], B = [lerp(a[0], b[0], u1), lerp(a[1], b[1], u1)];
          poly(band(A, B, lerp(wa, wb, u0), lerp(wa, wb, u1)), RAIN[(i + ph * 3) % 6], false); }
        poly(band(a, b, wa, wb), 'rgba(0,0,0,0)'); }
      // the fin cuff over the stilt foot: purple with a pink inner fin, pointed
      poly([[foot[0] - .1, 1.16], [foot[0] + .1, 1.16], [foot[0] + .2, .86], [foot[0] + .02, .98], [foot[0] - .03, .82], [foot[0] - .16, .9]], ph ? '#8a3cc0' : '#b04ad0');
      poly([[foot[0] - .02, 1.12], [foot[0] + .07, 1.12], [foot[0] + .02, .9]], '#ff6ec0', false);
    }
    // the bodysuit: rainbow on the diagonal from hips to shoulders
    const torso = [[-.13 + sway, HIP + .02], [.13 + sway, HIP + .02], [.15 + sway, HIP + .22], [.12 + sway, SH - .14], [.17 + sway, SH - .02], [-.17 + sway, SH - .02], [-.12 + sway, SH - .14], [-.15 + sway, HIP + .22]];
    g.save(); poly(torso, RAIN[2]); g.clip(); for (let i = -6; i < 10; i++) poly([[-.4, HIP + i * .08], [.4, HIP + i * .08 + .25], [.4, HIP + i * .08 + .33], [-.4, HIP + i * .08 + .08]], RAIN[(i + 60) % 6], false); g.restore(); poly(torso, 'rgba(0,0,0,0)');
    // the ruffled tail hanging from the back of the vest
    const tail = []; for (let i = 0; i <= 10; i++) { const u = i / 10; tail.push([-.16 - .06 * u + Math.sin(u * 7 + t * 3) * .015, SH - .1 - u * .62]); }
    for (let i = 10; i >= 0; i--) { const u = i / 10; tail.push([-.08 - .05 * u + Math.sin(u * 7 + t * 3) * .015 + (i % 2 ? .03 : 0), SH - .1 - u * .62]); }
    poly(tail, '#ee8a2a');
    // the vest: cream panels open over the front, orange ruffle down both edges, a stand-up ruffled collar
    poly([[-.17 + sway, SH - .01], [-.05 + sway, SH - .03], [-.07 + sway, HIP + .3], [-.16 + sway, HIP + .22]], '#f6eedc');
    poly([[.17 + sway, SH - .01], [.06 + sway, SH - .03], [.08 + sway, HIP + .3], [.16 + sway, HIP + .22]], '#efe4cc');
    for (const ex of [-.055, .065]) for (let i = 0; i < 6; i++) { const yy = SH - .06 - i * .07; dot(ex + sway + (ex < 0 ? -.012 : .012) * (i % 2), yy, .026, i % 2 ? '#ee8a2a' : '#f2b040', ink); }
    for (let i = 0; i < 7; i++) { const a = Math.PI * (.15 + i * .117); dot(Math.cos(a) * .15 + sway, SH + .02 + Math.sin(a) * .06, .03, i % 2 ? '#ee8a2a' : '#e8452f', ink); }
  } else {
    // the diamond stilt covers, from just under the knee to a point at the stilt foot, widest low down
    for (const lx of [-.11, .11]) { const cx = lx * 1.15, top = 1.5, wid = .55, bot = .1, sh2 = lx < 0 ? .78 : 1;
      const cov = [[cx - .085, top], [cx + .085, top], [cx + .27, wid], [cx + .03, bot], [cx - .03, bot], [cx - .27, wid]];
      poly(cov, lg(cx - .27, 0, cx + .27, 0, [sh2 < 1 ? '#6a2a98' : '#7e34b4', '#b45ae0', '#8a3cc0', '#5a2484']));
      poly([[cx - .02, top - .02], [cx + .02, top - .02], [cx + .015, bot + .04], [cx - .015, bot + .04]], 'rgba(255,110,192,.85)', false); // the pink seam down the front
      g.save(); poly(cov, 'rgba(0,0,0,0)', false); g.clip(); for (let i = 0; i < 26; i++) dot(cx - .22 + rnd(j * 50 + i, 1, lx > 0 ? 3 : 4) * .44, bot + rnd(j * 50 + i, 2, lx > 0 ? 3 : 4) * (top - bot), .012, 'rgba(255,230,255,.55)'); g.restore(); // sequins
      g.strokeStyle = '#ff6ec0'; g.lineWidth = .028 * k; g.lineJoin = 'round'; g.beginPath(); cov.forEach((p, i) => { const q = pt(p[0], p[1]); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); g.stroke(); // pink piping
      poly([[cx - .1, top + .04], [cx + .1, top + .04], [cx + .09, top - .03], [cx - .09, top - .03]], '#ff6ec0'); // the pink cuff at the knee
      // the bare thigh from the cover to the hot pants
      poly(band([lx * .75 + sway, HIP - .02], [cx, top + .03], .085, .07), lg(cx - .1, 0, cx + .1, 0, [skinD, skin, skin, skinD]));
    }
    // purple hot pants with a pink waistband and leg trim
    poly([[-.16 + sway, HIP + .05], [.16 + sway, HIP + .05], [.18 + sway, HIP - .1], [.04 + sway, HIP - .13], [-.04 + sway, HIP - .13], [-.18 + sway, HIP - .1]], '#7e34b4');
    poly([[-.16 + sway, HIP + .07], [.16 + sway, HIP + .07], [.16 + sway, HIP + .03], [-.16 + sway, HIP + .03]], '#ff6ec0', false);
    // midriff, then the sequin crop top
    poly([[-.13 + sway, HIP + .05], [.13 + sway, HIP + .05], [.135 + sway, HIP + .24], [-.135 + sway, HIP + .24]], lg(-.13, 0, .13, 0, [skinD, skin, skin, skinD]));
    oval(.01 + sway, HIP + .12, .008, .012, skinD);
    poly([[-.15 + sway, HIP + .22], [.15 + sway, HIP + .22], [.17 + sway, SH - .02], [-.17 + sway, SH - .02]], lg(-.15, 0, .15, 0, ['#5a2484', '#9a48d0', '#7e34b4']));
    for (let i = 0; i < 18; i++) dot(-.13 + sway + rnd(j, i, 7) * .26, HIP + .25 + rnd(j, i, 8) * .22, .011, 'rgba(255,230,255,.6)');
    // the jacket: purple panels hanging open, pink piping on the front edges, tattered hems
    for (const sd of [-1, 1]) { const pts = [[sd * .17 + sway, SH], [sd * .07 + sway, SH - .02], [sd * .1 + sway, HIP + .3], [sd * .14 + sway, HIP + .18], [sd * .17 + sway, HIP + .24], [sd * .2 + sway, HIP + .14], [sd * .22 + sway, HIP + .26], [sd * .21 + sway, SH - .1]];
      poly(pts, sd < 0 ? '#6a2a98' : '#7e34b4'); limb([[sd * .07 + sway, SH - .02], [sd * .1 + sway, HIP + .3], [sd * .14 + sway, HIP + .18]], .025, '#ff6ec0', false); }
  }
  // ---- arms: the far one out to the side, the near one up (waving on the held note) ----
  const shF = [.15 + sway, SH - .05], shB = [-.15 + sway, SH - .05], glove = j ? '#ff6ec0' : skin;
  { const el = [-.32 + sway, SH - .26], hd = [-.5 + sway, SH - .2 - .05 * Math.sin(t * 3)]; limb([shB, el], .07, j ? '#ff6ec0' : skin); limb([el, hd], .062, glove); dot(hd[0], hd[1], .042, j ? '#ff6ec0' : skin, ink); }
  { const up = wave, el = [lerp(.3, .3, up) + sway, lerp(SH - .25, SH + .12, up)], hd = [lerp(.42, .36, up) + sway + Math.sin(t * 6) * .03 * up, lerp(SH - .42, SH + .42, up)];
    limb([shF, el], .07, j ? '#ff6ec0' : skin); limb([el, hd], .062, glove); dot(hd[0], hd[1], .042, j ? '#ff6ec0' : skin, ink);
    if (j) for (const yy of [.3, .55]) { const q = [lerp(el[0], hd[0], yy), lerp(el[1], hd[1], yy)]; dot(q[0], q[1], .014, 'rgba(255,255,255,.45)'); } }
  // ---- neck, head, face ----
  poly(band([HD[0] - .005, SH - .04], [HD[0], HD[1] - .1], .045, .04), skinD);
  if (j === 0) { // short blonde hair behind the face
    oval(HD[0] - .005, HD[1] + .02, .125, .135, '#e8c868', 0, ink); }
  else { for (let i = 0; i < 11; i++) { const a = Math.PI * (-.05 + i * .11), r0 = .09, r1 = .2 + .04 * (i % 2) + .02 * Math.sin(t * 5 + i);
      poly([[HD[0] + Math.cos(a - .14) * r0, HD[1] + .02 + Math.sin(a - .14) * r0], [HD[0] + Math.cos(a) * r1, HD[1] + .02 + Math.sin(a) * r1], [HD[0] + Math.cos(a + .14) * r0, HD[1] + .02 + Math.sin(a + .14) * r0]], i % 2 ? '#a64dff' : '#7a2ab0'); } }
  oval(HD[0], HD[1], .1, .122, lg(HD[0] - .1, HD[1], HD[0] + .1, HD[1], [skinD, skin, '#fff2e6']), 0, ink);
  // the face, three-quarter toward s: eyes shut and happy, rosy cheeks, a singing mouth
  const fx = HD[0] + .025, eyeY = HD[1] + .015;
  for (const ex of [-.035, .045]) { const q = pt(fx + ex, eyeY); g.strokeStyle = '#2a1712'; g.lineWidth = Math.max(1, .012 * k); g.lineCap = 'round'; g.beginPath(); g.arc(q[0], q[1], .02 * k, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
  oval(fx - .05, HD[1] - .03, .025, .016, 'rgba(240,110,120,.45)'); oval(fx + .06, HD[1] - .03, .022, .015, 'rgba(240,110,120,.45)');
  { const q = pt(fx + .012, HD[1] - .015); g.strokeStyle = skinD; g.lineWidth = Math.max(1, .008 * k); g.beginPath(); g.moveTo(q[0], q[1] - .02 * k); g.lineTo(q[0] + s * .008 * k, q[1]); g.stroke(); } // the nose
  const mo = clamp(mouth); if (mo > .05) { oval(fx + .01, HD[1] - .06, .024, .012 + .024 * mo, '#7a1f2a', 0, '#4a1018'); oval(fx + .01, HD[1] - .06 - .012 * mo, .014, .006 * mo, '#e8828a'); }
  else { const q = pt(fx + .01, HD[1] - .06); g.strokeStyle = '#a8424e'; g.lineWidth = Math.max(1, .01 * k); g.beginPath(); g.arc(q[0], q[1] - .012 * k, .022 * k, Math.PI * .2, Math.PI * .8); g.stroke(); }
  if (j === 0) { // fringe and the flower crown
    poly([[HD[0] - .1, HD[1] + .06], [HD[0] + .09, HD[1] + .08], [HD[0] + .1, HD[1] + .03], [HD[0] + .02, HD[1] + .05], [HD[0] - .06, HD[1] + .02]], '#e8c868');
    const FL = ['#f2d040', '#e85aa8', '#ee9a42', '#5fbf4a', '#e8452f', '#f6efe0', '#f2d040'];
    for (let i = 0; i < 7; i++) { const a = Math.PI * (.12 + i * .127), cx = HD[0] + Math.cos(a) * .12, cy = HD[1] + .04 + Math.sin(a) * .1;
      for (let p = 0; p < 5; p++) { const b = p / 5 * TAU + i; dot(cx + Math.cos(b) * .02, cy + Math.sin(b) * .02, .017, FL[i], 'rgba(60,30,20,.5)'); } dot(cx, cy, .012, i % 2 ? '#f2d040' : '#e8452f'); } }
  else oval(HD[0] - .07, HD[1] - .01, .012, .022, '#d9ae96'); // an ear under the spikes
}

// ---------- Draft 37: the stilt women on "without spin" at the end of each refrain ----------
// Bob (note 59 and Messenger, 2026-10-31): "it would send things over the top if some female or females appeared at the
// end of each chorus just for the final lyrics 'without spin'". d37 used the horse diva and a sister with mics; Robin:
// "i don't think it looks right with the microphones in their hands like that.. they are not the lead", so d37d brought
// in the stilt walkers from his photos, and d37e draws them close up (stiltWoman, above) at the diva's size: k = H / 3.3
// and the playa 1.15 m below the frame's bottom edge, so they show from about the knee up and their heads sit where the
// diva's did. The rainbow walker comes in from the left edge and the purple one from the right on "without", they sing
// it (backing vocals, no mics), each turns a full twirl on "spin", waves through the held note and walks back out as
// the line ends. Screen-space, so every framing of the three refrains keeps them whole and clear of the captions.
const SPIN_LINES = [6, 13, 34];
const SPIN_STILTS = [{ j: 0, x: .1, side: -1, lag: 0 }, { j: 1, x: .9, side: 1, lag: .1 }];
function spinDivas(t) {
  for (const li of SPIN_LINES) {
    const w0 = wt(li, 'without'), sp = wt(li, 'spin'), wo = LINES[li].words.find((w) => w.w === 'without'), end = LINES[li].e;
    if (t < w0 - 1 || t > end + 1.2) continue;
    for (const D of SPIN_STILTS) {
      // the purple walker comes in on the teeth's side, so in the first two refrains she waits till they have hopped out
      const clear = D.side > 0 ? Math.max(0, ...BUH_RUNS.map((r) => r[r.length - 1] + BOW.hold + BUH.outT).filter((e) => e < end)) : 0;
      const tt = t - D.lag, t0 = Math.max(w0 - .55, clear), k = H / 3.3, inU = ease(tt, t0, t0 + .7), outU = ease(tt, end - .05, end + .8);
      if (inU <= 0 || outU >= 1) continue;
      const off = D.side < 0 ? -.8 * k : W + .8 * k, tgt = W * D.x, x = outU > 0 ? lerp(tgt, off, outU) : lerp(off, tgt, inU);
      const walking = inU < 1 || outU > 0, y = H + 1.15 * k - (walking ? Math.abs(Math.sin(tt * 6.5)) * .04 * k : 0); // a stilt bob while they stride
      let mouth = 0; if (tt >= w0 && tt < wo.e) mouth = .4 + .5 * Math.abs(Math.sin(Math.PI * (tt - w0) / ((wo.e - w0) / 2)));
      else if (tt >= sp) mouth = .85 * (1 - ease(tt, end - .35, end - .05)) * ease(tt, sp, sp + .06);
      const wave = ease(tt, sp + .6, sp + 1) * (1 - ease(tt, end - .3, end + .1));
      const tw = clamp((tt - sp) / .75), turn = tw > 0 && tw < 1 ? Math.cos(TAU * smooth(tw)) : 1;
      g.save(); g.translate(x, 0); g.scale(turn, 1); g.translate(-x, 0);
      stiltWoman(D.j, x, y, k, -D.side, tt, mouth, wave); g.restore();
    }
  }
}
