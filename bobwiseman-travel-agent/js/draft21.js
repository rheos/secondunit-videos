// Draft 21 (2026-10-25): Bob's note 48 on draft 18 (round 66), the part marked "later" after the poster line:
// 1. Mary first enters at 0:22-0:26, and again at 1:01 and 1:13 (1:13 was already there, draft 17). Timed on the vocal
//    stem: her quiet C5 line 23.5-24.6 and B4 25.4-27.2 (her portrait on the hall wall, then on the plan); her voice
//    under his "I hear" 60.94-62.75 (the beach, then the horn).
// 2. Mary a second earlier at 1:30, not 1:31: her held note starts at 89.05 on the stem, so her portrait is on the
//    footpath schematic from there, and the payphone thread starts on the cut (draft15.js HER_THREAD, 90.8).
// 3. SPRING GREEN for VILLAGE on the PERMITTED list (act-a.js a_sNoCar).
// 4. Two little aliens on the moon's horizon, watching him get out of the car and hop off (hook in act-a.js a_carMoon).
// 5. 1:49: the string under "quick" (guitar stem, A3, 109.0-111.5) gets one slow long bow: on the ticket schematic he
//    plays, drawn in the blueprint line, the bow following the string.
// 6. 4:03: the bow follows the held notes of the violin ('other' stem: A3 A3 G3, then G5 held 1 s, G4 held 1.4 s,
//    A4-B4 slurring into D5 held to 247.3), not eleven quick turns (draft14.js V2, rewritten in place).
// Loaded after draft19.js and before ohara-echo.js.
'use strict';

// ---------- 1 + 2: Mary's new entries ----------
// [set-up, from, to, portrait centre and scale]; the thread is a short line from the portrait toward the middle
const D21_MARY = [
  ['a_doorBell', 23.4, 25.29, [230, 330, .78]],     // the hall wall, left of the door
  ['sPlan', 25.29, 27.2, [1710, 680, .62]],          // beside the plan, VOICE
  ['a_beach', 60.94, 61.7, [1700, 240, .7]],         // top right, over the far palm
  ['a_sunHorn', 61.7, 62.75, [1700, 240, .7]],       // same corner across the cut
  ['a_sFootpath', 89.05, 90.8, [1720, 870, .66]],    // bottom right of the footpath sheet, VOICE
];
for (const [key, ta, tb, at] of D21_MARY) {
  MARY_AT[key] = at; const sch = SU[key].mode === 'sch', P = herAuto(at);
  d14post(key, (q, p, a, T) => {
    const al = maryAlpha(T, ta, tb);
    if (al > 0) P[0] = maryCameo(at[0], at[1] + (1 - al) * 20, at[2], T, al, sch);
    herThread(T, ta, tb, P, sch); herMore(T, ta, tb, P, sch);
  });
}

// ---------- 4: two little aliens on the moon ----------
// Local units: feet at (0,0), about 150 tall at s = 1 for the tall one. o: {tall, look: [ux, uy] toward him, eyes: 2|3,
// point: 0..1 an arm raised toward him, shade: 0..1 a hand over the eyes}
function d21alien(x, y, s, T, o = {}) {
  X.save(); X.translate(x, y); X.scale(s, s); const k = 1 / s;
  const col = o.col || C.sage, hb = o.tall ? 1.2 : .9, lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  const bob = Math.sin(T * 3.1 + (o.tall ? 0 : 1.9)) * 2, hy = -104 * hb - 44 + bob;
  // legs and feet
  for (const sx of [-1, 1]) { limb([[sx * 12, -42 * hb], [sx * 18, -20 * hb], [sx * 22, 0]], 7, {}, k, col); fillP(PE(sx * 24, 0, 15, 6), C.ink); }
  // the body: a pear, hatched
  const body = [[-34, -40 * hb], [-38, -80 * hb], [-24, -104 * hb + bob], [24, -104 * hb + bob], [38, -80 * hb], [34, -40 * hb]], bp = PP(body);
  fillP(bp, col); hatch(bp, 0, -72 * hb, 70, .8, 6 * k, C.ink, .9 * k, .45, [12, -12]); iP(dens(body, 16, true), true, C.ink, 2.4 * k, 1, true, .8 * k);
  // arms: one hangs; the other points at him, or shades the eyes
  const sh = [[-36, -88 * hb], [36, -88 * hb]];
  limb([sh[0], [-50, -66 * hb], [-46, -44 * hb]], 7, {}, k, col); fillP(PE(-46, -42 * hb, 8, 7), col); iE(-46, -42 * hb, 8, 7, 0, C.ink, 1.6 * k, 1, false);
  if (o.shade > 0) { const u = o.shade, hx = lerp(50, 20 + lx * 10, u), hy2 = lerp(-44 * hb, hy - 18, u); limb([sh[1], [lerp(50, 60, u), lerp(-66 * hb, hy + 10, u)], [hx, hy2]], 7, {}, k, col); fillP(PE(hx, hy2, 11, 6), col); iE(hx, hy2, 11, 6, 0, C.ink, 1.6 * k, 1, false); }
  else { const u = o.point || 0, hx = lerp(50, 36 + lx * 60, u), hy2 = lerp(-44 * hb, -92 * hb + ly * 50, u); limb([sh[1], [lerp(50, 54, u), lerp(-66 * hb, -80 * hb, u)], [hx, hy2]], 7, {}, k, col); fillP(PE(hx, hy2, 8, 7), col); iE(hx, hy2, 8, 7, 0, C.ink, 1.6 * k, 1, false);
    if (u > .5) iline(hx, hy2, hx + lx * 16, hy2 + ly * 12, C.ink, 3 * k, 1, false); }
  // the head, big, tilted a little toward him
  X.save(); X.translate(0, hy); X.rotate(lx * .08);
  const head = PE(0, 0, 46, 40); fillP(head, col); hatch(head, 0, 0, 48, .8, 6 * k, C.ink, .9 * k, .4, [14, -14]); iE(0, 0, 46, 40, 0, C.ink, 2.6 * k, 1, true, .8 * k);
  // antennae with little orange balls, swaying
  for (const sx of [-1, 1]) { const ax = sx * 18, sw = Math.sin(T * 2.2 + sx + (o.tall ? 0 : 2)) * 5; X.beginPath(); X.moveTo(ax, -36); X.quadraticCurveTo(ax * 1.6 + sw, -70, ax * 2 + sw * 1.5, -86); stroke(C.ink, 2.2 * k, 1);
    fillP(PE(ax * 2 + sw * 1.5, -89, 6, 6), C.orange); iE(ax * 2 + sw * 1.5, -89, 6, 6, 0, C.ink, 1.6 * k, 1, false); }
  // eyes that follow him
  const n = o.eyes || 2, ex = n === 3 ? [-22, 0, 22] : [-16, 16];
  ex.forEach((e, i) => { const ey = -4 + (n === 3 && i === 1 ? -14 : 0); fillP(PE(e, ey, 12, 14), C.cream); iE(e, ey, 12, 14, 0, C.ink, 1.8 * k, 1, false); fillP(PE(e + lx * 5, ey + ly * 6, 5, 5.5), C.ink); });
  iE(0, 24, 5, 4, 0, C.ink, 1.6 * k, 1, false); // a small round mouth
  X.restore(); X.restore();
}
// called from SU.a_carMoon (act-a.js) after the ground and the sign, before him: tx, ty = where he is
function d21aliens(T, tx, ty) {
  const dt = T - 80.13, out = eo(cl((dt - 1.0) / .6)); // he is out of the car from about 81.1
  for (const [ax, ay, s, tall, eyes] of [[1235, 800, .62, 1, 2], [1318, 792, .54, 0, 3]]) {
    const hx = tx, hy2 = ty - 160, dx = hx - ax, dy = hy2 - (ay - 150 * s), d = Math.hypot(dx, dy) || 1;
    d21alien(ax, ay, s, T, { tall, eyes, look: [cl(dx / d * 1.3, -1, 1), cl(dy / d * 1.3, -1, 1)], point: tall ? 0 : out, shade: tall ? out : 0 });
  }
}

// ---------- 5: one slow long bow under "quick" (1:49) ----------
// The string in the guitar stem rises at 109.0, holds A3 and dies by 111.5; on the ticket schematic (109.95-112.25) he
// stands at the left in the blueprint line and draws one bow down its length, so when we cut to him he is mid-stroke.
const D21_BOW = [109.0, 111.5];
d14post('a_sTicket', (q, p, a, T) => {
  const u = lerp(-.8, .8, eio(seg(T, D21_BOW[0], D21_BOW[1])));
  fiddler(250, 985, .7, T, u, 1, { sch: 1, col: C.lav });
  lab(250, 1024, 'VIOLIN · ONE BOW', C.cyan, .9, 13, 'center');
});

// ---------- 6: 4:03 the bow follows the held notes ----------
// Note onsets off the 6-stem 'other' stem (pyin): A3 241.87, A3 242.48, G3 242.99, G5 243.26 (held to 244.3),
// G4 244.38 (held to 245.8), A4 246.24 slurring up through B4 into D5 246.52 (held to 247.3). One bow per note, so the
// held notes get the slow long bows; the slur rides one bow.
V2.splice(0, V2.length, 241.87, 242.48, 242.99, 243.26, 244.38, 246.24, 247.3);
