// Draft 17 (2026-10-20): Bob on draft 16 (round 35): "I like little bobby at the end. i do not see how you are
// repairing violin or displaying mary." His note on draft 13 asked for the violin to be shown "or something that pairs
// with the sound", so "repairing" reads as "pairing": in draft 16 the violin floated on its own and Mary Margaret
// O'Hara was only a faint rose thread. Both now get a body:
// 1. The violin: both entries sit in gaps between his sung lines (124-131, 239-247), so the traveller plays it
//    himself. 126.3: a new close shot on the record, the violin pops into his hands and he plays, bow turning on the
//    notes (V1); the groove schematic picks up at 129.4 on its own timeline. 242.35: he stops on the boarding stairs,
//    sets the case down and plays while the plane leaves (V2). The later schematic violins are unchanged.
// 2. Mary: wherever her thread runs (HER_THREAD, draft15.js), she is on display: a small framed portrait of a woman
//    singing, eyes closed, with a plaque, and her thread pours from her mouth. On blueprints she is drawn in her rose
//    line with a VOICE label. An invented singer, not a likeness.
// Little Bob at the end is untouched. Loaded after draft15.js and before ohara-echo.js.
'use strict';
var D17 = true;

// ---------- the traveller playing the violin ----------
// Traveller-local units (feet at 0,0, ~360 tall). The violin rests on his shoulder on the screen-left side, its scroll
// out to the left in his back hand; the bow is in his front hand and crosses the strings by the bridge.
const FID = { A: [18, -248], vs: .29, rot: -1.30, neck: -440, bowL: 200, bowDir: [.64, .77] };
function fidPt(vx, vy) { const c = Math.cos(FID.rot), s = Math.sin(FID.rot); return [FID.A[0] + (vx * c - vy * s) * FID.vs, FID.A[1] + (vx * s + vy * c) * FID.vs]; }
// u: bow travel -0.8..0.8 (bowU); e: 0..1 the violin popping into his hands
function fiddler(x, y, s, T, u, e = 1, o = {}) {
  const neck = fidPt(0, FID.neck), C0 = fidPt(0, -160), d = FID.bowDir, f = .5 + .38 * (u / .8);
  // draft 21: on a blueprint (o.sch) everything is drawn in o.col on navy, as the schematic traveller is
  const SCH = !!o.sch, CO = o.col || C.lav, INK = SCH ? CO : C.ink, HAIR = SCH ? CO : '#f2ead6', SKIN = SCH ? C.navy : '#efd9b9', FROG = SCH ? C.navy : '#2a2320', NOTE = SCH ? CO : C.teal;
  const frog = [C0[0] + d[0] * FID.bowL * f, C0[1] + d[1] * FID.bowL * f], tip = [frog[0] - d[0] * FID.bowL, frog[1] - d[1] * FID.bowL];
  const play = e > .5;
  traveller(x, y, s, Object.assign({ look: -1, case: false, mouth: 0 }, o, play ? { handToL: neck, handTo: [frog[0] - 4, frog[1] - 8] } : {}));
  if (e <= 0) return;
  X.save(); X.translate(x, y); X.scale(s, s); const k = 1 / s;
  violin(FID.A[0], FID.A[1], FID.vs * e, FID.rot, SCH ? { bow: u, noBow: 1, sch: 1, col: CO } : { bow: u, noBow: 1 });
  if (play) {
    // the bow: hair, then the stick bowed slightly away from it, the frog in his hand, a small tip
    const nx = -d[1], ny = d[0];
    X.beginPath(); X.moveTo(frog[0], frog[1]); X.lineTo(tip[0], tip[1]); stroke(HAIR, 2.4 * k + 1.2, .95);
    X.beginPath(); X.moveTo(frog[0] + nx * 5, frog[1] + ny * 5); X.quadraticCurveTo((frog[0] + tip[0]) / 2 + nx * 2, (frog[1] + tip[1]) / 2 + ny * 2, tip[0] + nx * 4, tip[1] + ny * 4); stroke(INK, 2.6, 1);
    X.beginPath(); X.moveTo(tip[0] + nx * 4, tip[1] + ny * 4); X.lineTo(tip[0], tip[1]); stroke(INK, 2, 1);
    const fr = PP([[frog[0] - d[0] * 6, frog[1] - d[1] * 6], [frog[0] - d[0] * 18, frog[1] - d[1] * 18], [frog[0] - d[0] * 18 + nx * 7, frog[1] - d[1] * 18 + ny * 7], [frog[0] - d[0] * 6 + nx * 7, frog[1] - d[1] * 6 + ny * 7]]);
    fillP(fr, FROG); if (SCH) iP([[frog[0] - d[0] * 6, frog[1] - d[1] * 6], [frog[0] - d[0] * 18, frog[1] - d[1] * 18], [frog[0] - d[0] * 18 + nx * 7, frog[1] - d[1] * 18 + ny * 7], [frog[0] - d[0] * 6 + nx * 7, frog[1] - d[1] * 6 + ny * 7]], true, INK, 1.2 * k, .9, false);
    // his hands over it: the back hand round the neck, the front hand on the frog
    for (const [hx, hy] of [neck, [frog[0] - 4, frog[1] - 4]]) { fillP(PE(hx, hy + 2, 8, 9), SKIN); iE(hx, hy + 2, 8, 9, 0, INK, 1.6 * k + .4, 1, false); }
    // the notes he plays drift up off the strings
    for (let i = 0; i < 4; i++) { const ph = (T * .7 + i / 4) % 1, nxp = C0[0] - 20 - ph * 60 + Math.sin(ph * 6 + i) * 14, nyp = C0[1] - 30 - ph * 190;
      X.save(); X.translate(nxp, nyp); X.rotate(-.3); fillP(PE(0, 0, 7, 5.5, -.4), NOTE, 1 - ph); X.restore(); iline(nxp + 6, nyp - 1, nxp + 6, nyp - 26, NOTE, 2, 1 - ph, false); }
  }
  X.restore();
}
// it comes out of nowhere: the violin pops in, ink rings round it
function fidPop(x, y, s, T, t0) { const [vx, vy] = fidPt(0, -200); popRings(x + vx * s, y + vy * s, T, t0, C.ink, s * .9); return eo(seg(T, t0, t0 + .18)); }

// ---------- 126.3 he plays it on the record (new set-up) ----------
// Close on him standing on the spinning record of the blues: the grooves sweep under his shoes, the label's edge
// behind him, the tonearm's head waiting at the right. The violin pops into his hands on the first note.
SU.b_fiddle = { mode: 'ill', f(q, p, a, T) {
  stripes('#e6dcc6', '#d9cbae', 130, -.62, 0, C.plum); cam(960, 560, lerp(1, 1.06, eo(p)));
  const cx = 1120, cy = 1500, RX = 2300, k = .3, spin = -T * 3.5;
  const pl = PR(-200, 560, W + 400, 700); fillP(pl, '#8a5530'); iline(-200, 560, W + 200, 560, C.ink, 2.4);
  const rec = PE(cx, cy, RX, RX * k * 1.55); fillP(rec, '#2a2320');
  X.save(); X.clip(rec);
  for (let r0 = 420; r0 < RX; r0 += 26) iE(cx, cy, r0, r0 * k * 1.55, 0, '#8a7a66', 1.2, .5, false, .6);
  for (const w0 of [0, Math.PI]) { const a0 = -2.2 + w0 + spin * .02; const wedge = PP([[cx, cy], [cx + Math.cos(a0) * 2600, cy + Math.sin(a0) * 2600 * k * 1.55], [cx + Math.cos(a0 + .3) * 2600, cy + Math.sin(a0 + .3) * 2600 * k * 1.55]]); hatch(wedge, cx, cy, 2600, a0 + .2, 8, C.cream, 1.3, .4); }
  // the orange label rim, low behind him
  const lb = PE(cx, cy, 420, 420 * k * 1.55); fillP(lb, C.orange); hatch(lb, cx, cy, 440, .8, 6, C.ink, .9, .45, [40, -10]); iE(cx, cy, 420, 420 * k * 1.55, 0, C.ink, 2.6);
  X.save(); X.translate(cx, cy); X.scale(1, k * 1.55); X.rotate(spin * .25); lab(0, -330, 'THE BLUES', C.ink, .9, 46, 'center', 'middle', 'bold'); X.restore();
  X.restore();
  iE(cx, cy, RX, RX * k * 1.55, 0, C.ink, 3);
  // the tonearm's head, waiting in the groove behind him
  const sx = 1660, sy = 780; X.beginPath(); X.moveTo(W + 60, 380); X.quadraticCurveTo(1820, 520, sx + 20, sy - 90); stroke(C.ink, 16, 1); X.beginPath(); X.moveTo(W + 60, 380); X.quadraticCurveTo(1820, 520, sx + 20, sy - 90); stroke('#c7c9cc', 9, 1);
  const hd = PP([[sx - 50, sy - 130], [sx + 60, sy - 120], [sx + 46, sy - 70], [sx - 42, sy - 76]]); fillP(hd, '#5b5f66'); shade(hd, sx, sy - 100, 70, [8, -8], .5, 4); iP([[sx - 50, sy - 130], [sx + 60, sy - 120], [sx + 46, sy - 70], [sx - 42, sy - 76]], true, C.ink, 2.4);
  iline(sx, sy - 74, sx, sy - 6, C.ink, 3); for (let i = 0; i < 3; i++) gc(sx, sy, 26 + i * 22 + ((FD * 4) % 22), C.teal, .7, 2, null, Math.PI, TAU);
  // him, his case set down by his feet, the cloud over him
  const mx = 800, my = 930, s = 1.55;
  suitcase(mx + 190, my - 96, 1.1, {});
  const e = fidPop(mx, my, s, T, 126.3);
  fiddler(mx, my, s, T, bowU(T, V1), e);
  cloud(mx - 10, my - 470 * s, .62, { rain: true });
  consL([[0, my, W, my], [mx, 0, mx, H]]);
} };
// the cut list: b_groove holds until 126.3, he plays on the record until 129.4, then the groove schematic. Both old
// set-ups keep their draft 16 timelines (p from their original cut times), so nothing in them moves differently.
{
  const i = CUTS_B.findIndex((c) => c[1] === 'b_sGroove');
  CUTS_B[i] = [129.4, 'b_sGroove', CUTS_B[i][2]];
  CUTS_B.push([126.3, 'b_fiddle', {}]); CUTS_B.sort((x, y) => x[0] - y[0]);
  const keepP = (key, t0, t1) => { const su = SU[key], f0 = su.f; SU[key] = { mode: su.mode, f(q, p, a, T) { f0.call(su, q, cl((T - t0) / (t1 - t0)), a, T); } }; };
  keepP('b_groove', 121.96, 127.0); keepP('b_sGroove', 127.0, 131.16);
}

// ---------- 242.35 he plays it on the boarding stairs ----------
// Called from SU.c_stairs (act-c.js): he stops on the step, the case beside him, and plays while the plane climbs away.
function d17stairs(P, ti, T) {
  const [mx, my] = P[ti];
  const e = fidPop(mx + 14, my, 1.1, T, 242.35);
  fiddler(mx + 14, my, 1.1, T, bowU(T, V2), e, { look: e > .5 ? -1 : 1 });
  suitcase(mx + 30, my - 66, .68, {}); // set down at his feet
  cloud(mx + 14, my - 500, .6, { rain: true });
}

// ---------- Mary on display ----------
// A framed portrait, ~240 x 300 px at R=1: an oval frame on a nail, a plaque under it, and inside it a woman singing
// (long dark hair, eyes closed, brows lifted, mouth open, a rose dress). Returns her mouth in screen space.
function maryCameo(cx, cy, R, T, al, sch, o = {}) {
  const mo = .55 + .45 * Math.abs(Math.sin(T * 4.2)) * (.7 + .3 * Math.sin(T * 1.3)), ink = sch ? '#f2b8b0' : C.ink, k = 1 / R;
  X.save(); X.translate(cx, cy); X.scale(R, R); X.rotate(Math.sin(T * 1.1) * .03);
  X.globalAlpha = 1;
  const rx = 104, ry = 128, fr = PE(0, 0, rx + 18, ry + 18), win = PE(0, 0, rx, ry);
  // the nail and the cord it hangs on
  if (!sch) { X.beginPath(); X.moveTo(-40, -ry - 14); X.lineTo(0, -ry - 52); X.lineTo(40, -ry - 14); stroke(C.ink, 2, al); fillP(PE(0, -ry - 52, 5, 5), C.ink, al); }
  // the frame
  if (!sch) { fillP(fr, C.ochre, al); hatch(fr, 0, 0, rx + 20, .9, 6, C.ink, 1, .4 * al, [30, -30]); }
  else fillP(fr, C.navy, .93 * al);
  iE(0, 0, rx + 18, ry + 18, 0, ink, (sch ? 1.4 : 2.6) * k, al, !sch); iE(0, 0, rx, ry, 0, ink, (sch ? 1.2 : 2.2) * k, al, !sch);
  X.save(); X.clip(win);
  fillP(win, sch ? C.navy : '#f3e2d6', al);
  if (!sch) hatch(win, 0, 0, rx, -.7, 9, C.rose, 1, .35 * al);
  // shoulders in a rose dress
  const sh = [[-100, 140], [-92, 92], [-56, 66], [-20, 58], [20, 58], [56, 66], [92, 92], [100, 140]];
  if (!sch) { fillP(PP(sh), '#c4675a', al); hatch(PP(sh), 0, 100, 100, .8, 6, C.ink, 1, .5 * al, [20, -10]); }
  iP(dens(sh, 20), false, ink, (sch ? 1.2 : 2.4) * k, al, !sch);
  // her hair behind, falling past her shoulders, a little wild
  const hair = []; for (let i = 0; i <= 24; i++) { const an = Math.PI * (.95 + i / 24 * 1.1) - Math.PI * .5, wob = 1 + .07 * Math.sin(i * 2.7 + T * 2); hair.push([Math.cos(an) * 66 * wob, -18 + Math.sin(an) * 70 * wob]); }
  const hairPts = [[-74, 96], ...hair, [74, 96], [44, 70], [38, 20], [-38, 20], [-44, 70]];
  if (!sch) fillP(PP(hairPts), '#3a2a22', al); else fillP(PP(hairPts), C.navy, al);
  iP(dens(hairPts, 18, true), true, ink, (sch ? 1.2 : 2.2) * k, al, !sch);
  // neck and head
  if (!sch) fillP(PR(-11, 20, 22, 44), '#efd9b9', al);
  const hp = PE(0, -12, 42, 50); fillP(hp, sch ? C.navy : '#efd9b9', al); if (!sch) shade(hp, 0, -12, 52, [10, -6], .6, 4.6, C.ink, .5 * al);
  iE(0, -12, 42, 50, 0, ink, (sch ? 1.2 : 2.2) * k, al, !sch);
  // a fringe of hair over the brow
  X.beginPath(); X.moveTo(-42, -22); X.quadraticCurveTo(-30, -66, 4, -62); X.quadraticCurveTo(30, -66, 42, -26); X.quadraticCurveTo(22, -44, 0, -44); X.quadraticCurveTo(-24, -46, -42, -22); X.closePath();
  X.globalAlpha = al; X.fillStyle = sch ? C.navy : '#3a2a22'; X.fill(); X.globalAlpha = 1; stroke(ink, (sch ? 1.2 : 2) * k, al);
  // eyes closed in the song, brows lifted, rose cheeks, mouth open on the note
  for (const sx of [-1, 1]) {
    X.beginPath(); X.arc(sx * 16, -16, 8, .15 * Math.PI, .85 * Math.PI); stroke(ink, 2.2 * k, al);
    X.beginPath(); X.arc(sx * 17, -24, 11, 1.15 * Math.PI + (sx > 0 ? .2 : 0), 1.65 * Math.PI + (sx > 0 ? .2 : 0)); stroke(ink, 1.8 * k, al);
    if (!sch) fillP(PE(sx * 25, 4, 8, 5), C.rose, .55 * al);
  }
  X.beginPath(); X.moveTo(2, -6); X.lineTo(5, 6); X.lineTo(0, 8); stroke(ink, 1.4 * k, .8 * al);
  const mh = 4 + mo * 10; fillP(PE(0, 22, 8 + mo * 2, mh), sch ? '#f2b8b0' : '#5a2a22', al); iE(0, 22, 8 + mo * 2, mh, 0, ink, 1.6 * k, al, false);
  X.restore();
  // the plaque (drawn shots) or the voice label (blueprints)
  // draft 18 (Bob on draft 17: "I don't think we need to see the name"): no plaque; the blueprints just say VOICE
  if (sch) lab(0, ry + 44, 'VOICE', '#f2b8b0', al * .95, 16, 'center', 'middle', 'bold');
  X.restore();
  // her mouth on screen
  const a = Math.sin(T * 1.1) * .03; return [cx - Math.sin(a) * 22 * R, cy + Math.cos(a) * 22 * R];
}
// she arrives a little before her line and stays while it lingers (the thread fades 0.25-0.85 s after tb)
function maryAlpha(T, ta, tb) { return Math.min(eo(cl((T - (ta - .3)) / .3)), 1 - cl((T - tb - .5) / .4)); }
// [set-up, portrait centre, scale]: placed where her thread used to come in from the frame edge, clear of his face
const MARY_AT = {
  a_noCarVillage: [1730, 240, .82],
  a_payphone: [1740, 300, .82], a_sWire: [1740, 640, .82], a_poleDesk: [1740, 300, .82],
  c_corridorLoop: [200, 250, .78], c_sQueue: [190, 880, .78], c_holdSpiral: [200, 250, .78],
  d_heartGiant: [1730, 830, .78], d_mirror: [300, 300, .78],
  d_featherFall: [1730, 830, .78], d_sFeather: [250, 740, .78], e_appInside: [500, 700, .62], e_sPhoneCage: [230, 830, .78],
  // draft 18: the rest of Robin's marks, each in a corner clear of the action (kept in one corner across a mark where it fits)
  a_sHold: [1640, 880, .78], a_stampWorld: [1250, 790, .7],
  b_balloons: [1730, 420, .7], muleCircle: [1770, 200, .62], b_grab: [1730, 260, .7], b_whisper: [1740, 250, .7],
  b_peas: [220, 230, .7], b_order: [1750, 240, .7], sHead: [1690, 600, .7], c_pills: [180, 330, .62], c_sDose: [230, 430, .7],
  c_bellFar: [230, 250, .7], sSeesaw: [1680, 330, .7], d_appTower: [430, 280, .62], d_sApp: [1690, 300, .7], d_bigButton: [190, 640, .62],
  sPassport: [230, 520, .7], c_holdSky: [330, 560, .62], c_lifebuoy: [1730, 870, .62], // draft 19
  phoneApp: [1760, 340, .66], d_ticketPrint: [220, 230, .66], d_sDose: [160, 560, .6], d_casePlane: [230, 760, .66],
  d_coatMap: [210, 230, .66], treadmill: [210, 230, .66], d_dolls: [210, 230, .66], d_sRib: [280, 560, .7], e_sTyping: [1720, 330, .7],
};
// draft 18: a short thread from a portrait toward the middle of the frame, for the shots with no drawn path of their own
function herAuto([x, y, R]) { const dx = x < W / 2 ? 1 : -1, dy = y < H / 2 ? 1 : -1, u = 1.4 - R * .6;
  return [[x, y], [x + dx * 150 * u, y + dy * 20], [x + dx * 290 * u, y - dy * 40], [x + dx * 430 * u, y + dy * 30], [x + dx * 560 * u, y - dy * 10]]; }
// her portrait first, then the thread (draft15's herThread) pouring out of her mouth over it
for (const [key, ta, tb, P0] of HER_THREAD) {
  const at = MARY_AT[key], sch = SU[key].mode === 'sch', P = P0 ? P0.slice() : herAuto(at);
  d14post(key, (q, p, a, T) => {
    const al = maryAlpha(T, ta, tb);
    if (at && al > 0) P[0] = maryCameo(at[0], at[1] + (1 - al) * 20, at[2], T, al, sch);
    herThread(T, ta, tb, P, sch);
    if (typeof herMore === 'function') herMore(T, ta, tb, P, sch); // draft 19: more lines as she gets wilder
  });
}
// the burn-through must not eat her portrait in the two burnt shots she is in
// draft 18: e_appInside no longer has her portrait, so its burn is back to draft 16's
LEAK_CLEAR.d_featherFall.push(['rect', 1600, 650, 1860, 1050]);
