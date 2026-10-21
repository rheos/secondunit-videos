// Draft 18 (2026-10-21): Mary Margaret O'Hara wherever Robin hears her (work/mary-marks-robin-2026-10-21.json, his
// MARY-MARK.html pass over draft 17; issue rheos/secondunit-videos#284).
// Robin's idea for the burnt last third: where the paper has burned through, she is behind it, singing on the
// blueprint sheet, and we see her through the holes. She lives on the one navy sheet under every hole (leak() in
// surreal.js calls leakBehind/leakAfter), so she shows only where the paper is gone. Before the holes are big enough
// she keeps draft 17's framed portrait. An invented singer, not a likeness (draft 17's face, in her rose line).
// Loaded after draft17.js and before ohara-echo.js.
'use strict';

// her marked spans that fall on burnt drawn shots (the blueprint shot d_sRib and the portrait in d_featherFall keep
// their own treatment); hard: the span ends on a cut, so she doesn't fade over into the next shot
const MARY_BEHIND = [[334.51, 343.98, 1], [346.6, 348.47, 0], [355.7, 358.4, 1], [385.18, 386.71, 0]];
function behindAlpha(T) {
  for (const [a, b, hard] of MARY_BEHIND) { if (T < a || T > b + .45) continue; if (hard && T >= b) return 0;
    return Math.min(eo(cl((T - a) / .35)), 1 - cl((T - b) / .4)); }
  return 0;
}
// the hole she sings in: the biggest one in this shot, judged once at the shot's start (or her entry), so she never
// hops between two holes of nearly the same size
function behindHole(T) {
  const sh = shotAt(T), span = MARY_BEHIND.find(([a, b]) => T >= a && T <= b + .45); if (!sh || !span) return null;
  const tr = Math.max(sh.t0, span[0]) + .05, a = leakProgress(tr), cz = typeof LEAK_CLEAR[sh.key] === 'function' ? LEAK_CLEAR[sh.key](tr) : LEAK_CLEAR[sh.key];
  let best = null, bestR = 0;
  LEAK_HOLES.forEach((h, i) => { const g = Math.max(0, (a - h.born) / (1 - h.born)), R0 = Math.min(h.Rmax * Math.pow(g, .8), leakRoom(h, cz)) * (1 - leakHeal(i, tr));
    // a hole hard against the frame edge would crop her face off-screen
    const inside = h.x > 140 && h.x < W - 140 && h.y > 110 && h.y < H - 110;
    if (inside && R0 > bestR) { bestR = R0; best = h; } });
  return best ? { h: best, Rref: bestR } : null;
}

// Mary on the sheet: head and shoulders in her rose line on navy, eyes closed, singing; a soft rose light behind her
// so she reads through a small opening. Local units as draft 17's maryCameo (face radius ~45 at R = 1).
function maryBack(cx, cy, R, T, al) {
  const ink = '#f2b8b0', k = 1 / R, mo = .55 + .45 * Math.abs(Math.sin(T * 4.2)) * (.7 + .3 * Math.sin(T * 1.3));
  X.save(); X.translate(cx, cy); X.scale(R, R); X.rotate(Math.sin(T * .9) * .05);
  // her light: rose, soft, breathing with the phrase
  const gl = X.createRadialGradient(0, -10, 10, 0, -10, 190); gl.addColorStop(0, `rgba(228,143,160,${.42 * al})`); gl.addColorStop(.55, `rgba(201,132,120,${.16 * al})`); gl.addColorStop(1, 'rgba(201,132,120,0)');
  X.fillStyle = gl; X.fillRect(-220, -230, 440, 460);
  // shoulders, then the hair behind the head, then the head
  // long hair, a lifted navy so it separates from the sheet, drawn as strands that fall past her shoulders and move
  // a little with the song (a hard outline here read as a hood)
  const HAIR = '#26346a', hair = []; for (let i = 0; i <= 28; i++) { const an = Math.PI * (.9 + i / 28 * 1.2) - Math.PI * .5, wob = 1 + .07 * Math.sin(i * 2.3 + T * 2); hair.push([Math.cos(an) * 70 * wob, -16 + Math.sin(an) * 74 * wob]); }
  const hairPts = [[-86, 124], [-80, 60], ...hair, [80, 60], [86, 124], [56, 116], [40, 30], [-40, 30], [-56, 116]];
  fillP(PP(hairPts), HAIR, al);
  for (let i = 0; i < 16; i++) { const sx = i < 8 ? -1 : 1, j = i % 8, x0 = sx * (10 + j * 8), y0 = -78 + j * 3, sw = Math.sin(T * 1.8 + i) * 5;
    X.beginPath(); X.moveTo(x0 * .4, y0); X.bezierCurveTo(sx * (52 + j * 4), -60 + j * 4, sx * (62 + j * 3) + sw, 30, sx * (46 + j * 5) + sw * 1.4, 112 + (j % 3) * 8); stroke(ink, (.9 + (j % 2) * .5) * k, (.35 + (j % 3) * .15) * al); }
  // her dress in front of the hair, a neckline, her neck
  const sh = [[-112, 176], [-100, 98], [-62, 74], [-24, 64], [24, 64], [62, 74], [100, 98], [112, 176]];
  fillP(PP(sh), C.navy, al); stip(PP(sh), 0, 130, 110, 240, ink, .45 * al, 1.3, [0, -1], .4); iP(dens(sh, 20), false, ink, 1.6 * k, al, false);
  X.beginPath(); X.moveTo(-30, 66); X.quadraticCurveTo(0, 104, 30, 66); stroke(ink, 1.5 * k, .9 * al);
  fillP(PP([[-13, 22], [13, 22], [15, 70], [-15, 70]]), C.navy, al); iline(-13, 26, -15, 68, ink, 1.4 * k, al, false); iline(13, 26, 15, 68, ink, 1.4 * k, al, false);
  const hp = PE(0, -12, 42, 50); fillP(hp, C.navy, al); iE(0, -12, 42, 50, 0, ink, 1.8 * k, al, false);
  // the fringe: soft strands across the brow, no closed outline
  X.beginPath(); X.moveTo(-42, -22); X.quadraticCurveTo(-30, -66, 4, -62); X.quadraticCurveTo(30, -66, 42, -26); X.quadraticCurveTo(22, -44, 0, -44); X.quadraticCurveTo(-24, -46, -42, -22); X.closePath();
  X.globalAlpha = al; X.fillStyle = HAIR; X.fill(); X.globalAlpha = 1;
  for (let i = 0; i < 7; i++) { const x0 = -34 + i * 11; X.beginPath(); X.moveTo(x0 * .3, -64); X.quadraticCurveTo(x0 * .9, -58, x0, -40 + Math.abs(x0) * .35); stroke(ink, 1 * k, .6 * al); }
  for (const sx of [-1, 1]) {
    X.beginPath(); X.arc(sx * 16, -16, 8, .15 * Math.PI, .85 * Math.PI); stroke(ink, 2.4 * k, al);
    X.beginPath(); X.arc(sx * 17, -24, 11, 1.15 * Math.PI + (sx > 0 ? .2 : 0), 1.65 * Math.PI + (sx > 0 ? .2 : 0)); stroke(ink, 1.8 * k, al);
  }
  X.beginPath(); X.moveTo(2, -6); X.lineTo(5, 6); X.lineTo(0, 8); stroke(ink, 1.4 * k, .8 * al);
  const mh = 4 + mo * 10; fillP(PE(0, 22, 8 + mo * 2, mh), ink, al); iE(0, 22, 8 + mo * 2, mh, 0, '#fbeee9', 1.4 * k, al, false);
  // her voice on the sheet: rings drawn out from her mouth, the blueprint's way of showing sound
  for (let i = 0; i < 3; i++) { const u = ((T * 1.4 + i / 3) % 1); gc(0, 22, 30 + u * 150, ink, (1 - u) * .55 * al, 1.4 * k, [5, 7], -.9, .9); gc(0, 22, 30 + u * 150, ink, (1 - u) * .55 * al, 1.4 * k, [5, 7], Math.PI - .9, Math.PI + .9); }
  X.restore();
}
function leakBehind(T, edges) {
  const al = behindAlpha(T); if (al <= 0) return; const c = behindHole(T); if (!c) return;
  const e = edges.find((x) => x.h === c.h), R0 = e ? e.R0 : c.Rref;
  // her face fills a little over half the hole at her entry; she stays that size while the hole keeps growing
  const R = cl(c.Rref / 92, .55, 1.7), rise = (1 - al) * 30;
  maryBack(c.h.x, c.h.y + 6 * R + rise, R, T, al);
}
// her notes come up out of the hole and drift onto the paper, rose, on twos
function leakAfter(T, edges) {
  const al = behindAlpha(T); if (al <= 0) return; const c = behindHole(T); if (!c) return;
  const e = edges.find((x) => x.h === c.h); if (!e) return; const R0 = e.R0, td = Math.floor(T * 12) / 12;
  for (let i = 0; i < 5; i++) { const u = ((td * .55 + i / 5) % 1), side = (i % 2 ? 1 : -1), an = -Math.PI / 2 + side * (.35 + .1 * i);
    const x = c.h.x + Math.cos(an) * R0 * .9 + side * u * 60, y = c.h.y + Math.sin(an) * R0 * .9 - u * 150, f = Math.sin(u * Math.PI) * al;
    if (f > .05) { X.save(); X.globalAlpha = 1; a_noteGlyph(x, y, .9 + .3 * (1 - u), `rgba(196,103,90,${f})`, .15 * side); X.restore(); } }
}
