// Reform Party, Dali look: the burn (the Man, the fire, the dusk crowd, spinners, embers). Split from playa.js for draft 3.
// Draft 3: the dusk crowd walks a lantern spiral from the table to the Man's base, carrying little scenes along it
// (Nakamura's route); at night they ring the Man and lift ballots on every "vote", and each wave catches fire
// (Gilliam's crowd of witnesses). The effigy's figure stays visible inside the fire and goes soft like a Dali watch,
// propped on crutches, until it falls. The four outro refrains escalate: more fire, more ballots, closer each time.

// ---------- how much is burning ----------
const VOTES = [35, 36, 37, 38].map((li) => wt(li, 'vote'));
// each "vote" adds fire: refrain 1 the base, 2 the whole figure behind the voting board, 3 the melt, 4 the peak and the fall
const burnAmt = (t) => (.4 * ease(t, VOTES[0] - 2, VOTES[0] + 4) + .26 * ease(t, VOTES[1] - .6, VOTES[1] + 3) + .19 * ease(t, VOTES[2] - .6, VOTES[2] + 4) + .15 * ease(t, VOTES[3] - .6, VOTES[3] + 2.5)) * (1 - ease(t, 254, 266) * .75);
const fallAmt = (t) => ease(t, 248.5, 252.5);
function flameAmt(t) { return burnAmt(t) * (1 - .78 * ease(t, 251.5, 259)); } // the standing fire drops to the heap after the fall
function heapAmt(t) { return ease(t, 250.5, 254.5) * (1 - .5 * ease(t, 262, 268.6)); } // the ember heap left for Little Bob
function fireGlow(t) { return Math.max(flameAmt(t), .5 * heapAmt(t)); } // what the grade lights the playa with
const manMelt = (t) => ease(t, 224, 247); // the heat softens the effigy (Dali)
const plinthH = (t) => 6 * (1 - .62 * ease(t, 251, 256.5));
const flameTop = (t) => 4 + 32 * Math.pow(flameAmt(t), 1.15); // metres above the ground

// ---------- the party's effigy ----------
function manGeom() { const p = P(MAN.x, 0, MAN.z); return { p, k: kAt(p) }; }
// the effigy's local frame: metres, y up, origin at the top of the plinth; it rotates about its feet as it falls
const manBase = (t) => lerp(plinthH(t), .9, fallAmt(t)); // it falls onto the heap and lies there, half buried
function manFrame(x, y, k, t) { const f = fallAmt(t); g.beginPath(); g.rect(-W, -H, 3 * W, y + H + .2 * k); g.clip(); g.translate(x, y - manBase(t) * k); g.rotate(f * 1.52); g.scale(k, -k); }
function manPt(lx, ly, t) { const { p, k } = manGeom(), f = fallAmt(t), a = f * 1.52, c = Math.cos(a), s = Math.sin(a), X = lx * k, Y = -ly * k;
  return [p[0] + X * c - Y * s, p[1] - manBase(t) * k + X * s + Y * c]; }
// the point the film's last ember sits on (the rosette on the fallen effigy), in screen pixels, for the ember-contract ending
function lastEmber(t) { return manPt(-1.15, 11.6 - manMelt(t) * .3, t); }

function effigy(t, mode) { // mode 'lit' (graded, normal colours), 'glow' (a fat orange outline), 'char' (black, burnt)
  const m = manMelt(t), arms = ease(t, VOTES[0] - 1.6, VOTES[0] + 1.2), ex = mode === 'glow' ? .24 : 0, lit = mode === 'lit';
  const col = (c) => lit ? c : mode === 'glow' ? 'rgba(255,140,50,.9)' : '#170c09';
  const fillP = (build, c) => { g.beginPath(); build(); g.fillStyle = col(c); g.fill(); if (ex) { g.strokeStyle = col(c); g.lineWidth = ex * 2; g.lineJoin = 'round'; g.stroke(); } };
  const line = (pts, w, c) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); if (pts.length === 3) g.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]); else g.lineTo(pts[1][0], pts[1][1]); g.strokeStyle = col(c); g.lineWidth = w + ex * 2; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); };
  // timber legs and their braces, bowing as they soften
  const bow = m * .9;
  line([[-1.7, 0], [-1.15 - bow, 3.6], [-.75, 7.2]], .6, '#6e5232'); line([[1.7, 0], [1.15 + bow * .5, 3.6], [.75, 7.2]], .6, '#6e5232');
  line([[-1.45, .9], [1.05, 5.7]], .22, '#5a4228'); line([[1.45, .9], [-1.05, 5.7]], .22, '#5a4228');
  // the arms: up on the vote, then they go soft and hang like melting watches
  const sl = m * .9, sh = [[-2.05, 12.5 - sl * .3], [2.05, 12.5 - sl]];
  const arm = (d) => { const S = sh[d < 0 ? 0 : 1], rest = [d * 2.7, 8.2], up = [d * 3.5, 16.2], H0 = [lerp(rest[0], up[0], arms), lerp(rest[1], up[1], arms)];
    const C0 = [(S[0] + H0[0]) / 2 + d * .3, (S[1] + H0[1]) / 2], Cm = [d * 4.7, 16.6], Hm = [d * 5.4, 10.4 + (d > 0 ? -.8 : 0)];
    return { S, C: [lerp(C0[0], Cm[0], m), lerp(C0[1], Cm[1], m)], H: [lerp(H0[0], Hm[0], m), lerp(H0[1], Hm[1], m)] }; };
  const AL = arm(-1), AR = arm(1);
  // crutches prop the soft arms and the sliding head; they burn through when it falls
  const fall = fallAmt(t), cr = clamp((m - .18) / .22) * (1 - clamp(fall * 4)), crH = clamp((m - .45) / .22) * (1 - clamp(fall * 4));
  const crutchL = (top, foot, a) => { if (a <= .02) return; const T = [lerp(foot[0], top[0], a), lerp(foot[1], top[1], a)]; line([foot, T], .24, '#c9a46a');
    line([[T[0] - .32, T[1] - .55], [T[0], T[1] - .1]], .14, '#c9a46a'); line([[T[0] + .32, T[1] - .55], [T[0], T[1] - .1]], .14, '#c9a46a'); line([[T[0] - .5, T[1]], [T[0] + .5, T[1]]], .3, '#e9dcc2'); };
  const bend = (A) => [.25 * A.S[0] + .5 * A.C[0] + .25 * A.H[0], .25 * A.S[1] + .5 * A.C[1] + .25 * A.H[1] - .45];
  crutchL(bend(AL), [-5.1, -1.3], cr); crutchL(bend(AR), [5.3, -1.3], cr);
  // the jacket, its hem dripping, the shoulders slumping right
  fillP(() => { g.moveTo(-1.55, 7.0); g.lineTo(-2.25, 12.7 - sl * .3); g.quadraticCurveTo(0, 13.15 - sl * .55, 2.25, 12.7 - sl); g.lineTo(1.55, 7.0);
    for (const [dx, dl] of [[1.15, 1.4], [.6, .7], [0, 2.2], [-.55, .9], [-1.1, 1.8]]) { const L = dl * m * 1.5; g.lineTo(dx + .24, 7.0); g.quadraticCurveTo(dx + .22, 7 - L, dx, 7 - L - .22); g.quadraticCurveTo(dx - .22, 7 - L, dx - .24, 7.0); }
    g.closePath(); }, PAL.suit);
  if (lit) { fillP(() => { g.moveTo(-.65, 12.8 - sl * .35); g.lineTo(0, 10.1 - sl * .45); g.lineTo(.65, 12.8 - sl * .62); g.closePath(); }, '#f4efe6');
    fillP(() => { g.moveTo(-.16, 12.4 - sl * .45); g.lineTo(.16, 12.4 - sl * .5); g.lineTo(.05, 10.5 - sl * .5); g.lineTo(-.05, 10.5 - sl * .5); g.closePath(); }, '#b52a22'); }
  for (const A of [AL, AR]) { line([A.S, A.C, A.H], .62, PAL.suit); if (lit) { g.fillStyle = PAL.egg; g.beginPath(); g.ellipse(A.H[0], A.H[1] - .1 - m * .4, .32, .32 + m * .45, 0, 0, TAU); g.fill(); } }
  // the egg head, sliding off its neck and dripping (the party's face: none)
  const hx = .1 + m * 1.35, hy = 14.9 - m * 1.15, rx = 1.15 + m * .12, ry = 1.5, dr = m * 2.7;
  line([[0, 12.9 - sl * .5], [hx * .6, hy - ry * .8]], .45, '#6e5232');
  crutchL([hx + rx * .35, hy - ry - dr * .55], [2.6, -1.3], crH);
  g.save(); g.translate(0, 13); g.rotate(-m * .38); g.translate(0, -13);
  fillP(() => { g.moveTo(hx, hy + ry); g.bezierCurveTo(hx + rx * 1.1, hy + ry, hx + rx * 1.12, hy - ry * .3, hx + rx * .8, hy - ry * .62 - dr * .45);
    g.quadraticCurveTo(hx + rx * .78, hy - ry - dr, hx + rx * .46, hy - ry - dr); g.quadraticCurveTo(hx + rx * .2, hy - ry * .9 - dr * .4, hx - rx * .1, hy - ry * .96);
    g.bezierCurveTo(hx - rx * 1.12, hy - ry * .96, hx - rx * 1.1, hy + ry, hx, hy + ry); g.closePath(); }, PAL.egg);
  if (lit) { g.fillStyle = 'rgba(120,90,60,.18)'; g.beginPath(); g.ellipse(hx + rx * .35, hy - ry * .2, rx * .45, ry * .7, .2, 0, TAU); g.fill(); }
  g.restore();
  // the rosette
  if (mode !== 'glow') { const rx0 = -1.15, ry0 = 11.6 - sl * .3; g.fillStyle = lit ? PAL.rosette : '#2a0d08'; g.beginPath(); g.moveTo(rx0 - .12, ry0); g.lineTo(rx0 - .26, ry0 - .8); g.lineTo(rx0 - .02, ry0 - .68); g.lineTo(rx0, ry0); g.fill();
    g.beginPath(); g.moveTo(rx0 + .12, ry0); g.lineTo(rx0 + .26, ry0 - .8); g.lineTo(rx0 + .02, ry0 - .68); g.lineTo(rx0, ry0); g.fill(); g.beginPath(); g.arc(rx0, ry0, .34, 0, TAU); g.fill(); }
}
function softClock(x, y, k, t) { // a melting clock draped over the plinth's front corner
  g.save(); g.translate(x, y); g.scale(k, k);
  g.fillStyle = '#efe2bf'; g.strokeStyle = '#b8903c'; g.lineWidth = .1;
  g.beginPath(); g.moveTo(-.2, -.1); g.bezierCurveTo(.6, -.5, 2.4, -.45, 2.5, -.05); g.bezierCurveTo(2.5, .25, 1.0, .3, .5, .2); g.bezierCurveTo(.2, .9, -.1, 2.4, -.65, 2.5); g.bezierCurveTo(-1.1, 2.55, -1.15, 1.1, -.9, .2); g.bezierCurveTo(-.8, -.05, -.5, -.05, -.2, -.1); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = '#2a2226'; g.lineWidth = .08; g.beginPath(); g.moveTo(1.0, -.08); g.lineTo(1.9, -.22); g.moveTo(1.0, -.08); g.quadraticCurveTo(.4, .6, -.35, 1.4); g.stroke();
  g.fillStyle = '#2a2226'; for (let i = 0; i < 7; i++) { const u = i / 6; g.fillRect(lerp(-.6, 2.2, u) - .04, lerp(1.9, -.25, u * u) - .04, .08, .08); }
  g.restore();
}
function theMan(t) {
  const { p, k } = manGeom(); if (p[2] < 1) return; const x = p[0], y = p[1], ph = plinthH(t), w0 = 9, w1 = 4 + (1 - ph / 6) * 3;
  // the plinth: a stepped timber pyramid, which slumps into the heap after the fall
  g.fillStyle = '#8a6a44'; g.beginPath(); g.moveTo(x - w0 * k, y); g.lineTo(x + w0 * k, y); g.lineTo(x + w1 * k, y - ph * k); g.lineTo(x - w1 * k, y - ph * k); g.fill();
  g.fillStyle = 'rgba(40,24,12,.25)'; g.beginPath(); g.moveTo(x + 1.5 * k, y); g.lineTo(x + w0 * k, y); g.lineTo(x + w1 * k, y - ph * k); g.lineTo(x + .7 * k, y - ph * k); g.fill();
  g.strokeStyle = 'rgba(60,40,20,.5)'; g.lineWidth = Math.max(1, .15 * k); for (let i = 1; i < 4; i++) { const u = i / 4, yy = y - u * ph * k, hw = lerp(w0, w1, u); g.beginPath(); g.moveTo(x - hw * k, yy); g.lineTo(x + hw * k, yy); g.stroke(); }
  const hp = heapAmt(t);
  if (hp > 0) { // charred beams and a black mound, glowing coals are added after the grade
    g.fillStyle = `rgba(34,20,16,${clamp(hp * 1.5)})`; g.beginPath(); g.moveTo(x - 13 * k, y);
    for (let i = 0; i <= 16; i++) { const u = i / 16, X = lerp(-13, 19, u), hh = (2.8 + .9 * n1(31, u * 6)) * Math.sin(u * Math.PI) ** .7; g.lineTo(x + X * k, y - hh * hp * k); }
    g.lineTo(x + 19 * k, y); g.fill();
    g.strokeStyle = '#1c110d'; g.lineCap = 'round'; for (let i = 0; i < 7; i++) { const a = -.5 + rnd(i, 51) * 1, X0 = lerp(-11, 16, rnd(i, 52)), L = 3 + rnd(i, 53) * 4; g.lineWidth = Math.max(1, .35 * k); g.beginPath(); g.moveTo(x + X0 * k, y - .3 * k); g.lineTo(x + (X0 + Math.cos(a) * L) * k, y - (.3 + Math.abs(Math.sin(a)) * L * .6) * hp * k); g.stroke(); }
  }
  if (t < 252) softClock(x - 5.6 * k, y - 4.2 * k, k, t);
  if (fallAmt(t) < 1) { g.save(); manFrame(x, y, k, t); effigy(t, 'lit'); g.restore(); }
}

// ---------- the fire ----------
function flameTongue(bx, by, h, w, i, t, a, soft) { // one irregular tongue of flame, base (bx, by), h and w in px
  if (h < 2 || a <= 0) return; const lean = n1(400 + i, t * 1.25) * .3 * h + n1(410 + i, t * 3.1) * .06 * h, tx = bx + lean, ty = by - h;
  const fg = g.createLinearGradient(0, by, 0, ty); fg.addColorStop(0, `rgba(255,205,120,${soft ? 0 : .5 * a})`); if (soft) fg.addColorStop(.2, `rgba(255,205,120,${.5 * a})`); fg.addColorStop(.32, `rgba(255,150,45,${.6 * a})`); fg.addColorStop(.72, `rgba(236,72,16,${.32 * a})`); fg.addColorStop(1, 'rgba(200,40,10,0)');
  g.fillStyle = fg; g.beginPath(); g.moveTo(bx - w, by);
  g.bezierCurveTo(bx - w * 1.15, by - h * .42, tx - w * .4 + n1(500 + i, t * 2.7) * w * .5, by - h * .72, tx, ty);
  g.bezierCurveTo(tx + w * .3 + n1(520 + i, t * 2.3) * w * .4, by - h * .66, bx + w * 1.1, by - h * .38, bx + w, by); g.fill();
}
function manFire(t) {
  const f = flameAmt(t), hp = heapAmt(t); if (f <= .005 && hp <= .005) return; const { p, k } = manGeom(); if (p[2] < 1) return; const x = p[0], y = p[1];
  const Hc = flameTop(t), fall = fallAmt(t), wide = lerp(1, 1.6, fall);
  g.save(); g.globalCompositeOperation = 'lighter';
  // light pooled on the playa around the fire
  { const R = 34, q = P(MAN.x, 0, MAN.z - R), ry = Math.abs(y - q[1]) || 1, rx = R * k; g.save(); g.translate(x, y); g.scale(1, Math.min(1, ry / rx));
    const rg = g.createRadialGradient(0, 0, 0, 0, 0, rx); rg.addColorStop(0, `rgba(255,150,60,${.35 * fireGlow(t)})`); rg.addColorStop(1, 'rgba(255,90,30,0)'); g.fillStyle = rg; g.fillRect(-rx, -rx, 2 * rx, 2 * rx); g.restore(); }
  // the glow
  { const cy = y - Hc * .45 * k, R = (14 + Hc) * k; const gl = g.createRadialGradient(x, cy, 0, x, cy, R); gl.addColorStop(0, `rgba(255,170,80,${.36 * f})`); gl.addColorStop(.45, `rgba(255,100,30,${.2 * f})`); gl.addColorStop(1, 'rgba(255,60,10,0)'); g.fillStyle = gl; g.fillRect(x - R, cy - R, 2 * R, 2 * R); }
  // back tongues, from the ground and the plinth
  const N = Math.round(18 + 46 * f), Wb = (7 + 6 * f) * wide, ta = clamp(34 / N, .55, 1); // fewer stacked bases, so the core stays yellow, not white
  for (let i = 0; i < N; i += 2) { const u = rnd(i, 61) * 2 - 1, prof = Math.max(.12, 1 - .62 * u * u), h = Hc * prof * (.55 + .45 * (.5 + .5 * n1(600 + i, t * (1.6 + rnd(i, 62))))); flameTongue(x + u * Wb * k, y, h * k, (1 + 1.6 * f) * k * (1.2 - .4 * Math.abs(u)), i, t, clamp(f * 2) * ta); }
  g.restore();
  // the figure inside the fire: a black silhouette with a burning rim, once the flames reach the jacket
  const charA = Math.max(clamp((Hc - 9) / 8), fallAmt(t)) * (1 - ease(t, 253.5, 260.5) * .72); // once burnt it stays burnt, then crumbles into the heap
  if (charA > 0) {
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = charA * (.55 + .45 * clamp(f * 1.5)); manFrame(x, y, k, t); effigy(t, 'glow'); g.restore();
    g.save(); g.globalAlpha = clamp(charA * 1.8); manFrame(x, y, k, t); effigy(t, 'char'); g.restore();
    g.save(); g.globalCompositeOperation = 'lighter'; manFrame(x, y, k, t); g.lineCap = 'round'; // glowing cracks in the charred jacket
    for (let i = 0; i < 9; i++) { const yy = 7.6 + i * .55, a = charA * (.45 + .55 * (.5 + .5 * n1(700 + i, t * 2.2))); g.strokeStyle = `rgba(255,${120 + i * 8},40,${a})`; g.lineWidth = .1; g.beginPath(); g.moveTo(-1.3 + rnd(i, 71) * .6, yy); g.lineTo(rnd(i, 72) - .5, yy + .3); g.lineTo(.6 + rnd(i, 73) * .6, yy - .1); g.stroke(); }
    const re = 1 - charA * .2; g.fillStyle = `rgba(255,70,30,${.7 * charA * re})`; g.beginPath(); g.arc(-1.15, 11.6 - manMelt(t) * .27, .42, 0, TAU); g.fill(); // the rosette, the last thing to stop glowing
    g.restore();
  }
  g.save(); g.globalCompositeOperation = 'lighter';
  // front tongues, licking up the figure itself
  for (let i = 1; i < N; i += 2) { const u = rnd(i, 61) * 2 - 1, prof = Math.max(.12, 1 - .62 * u * u), h = Hc * prof * .8 * (.5 + .5 * (.5 + .5 * n1(600 + i, t * (1.8 + rnd(i, 62))))); flameTongue(x + u * Wb * .8 * k, y, h * k, (.9 + 1.3 * f) * k, i, t, clamp(f * 2) * .6 * ta); }
  const spots = [[-1.2, 1], [1.2, 1.2], [-.9, 4.5], [.9, 4], [0, 7.5], [-1.5, 9.5], [1.5, 9.5], [0, 12], [-3.2, 14], [3.4, 14], [.5, 15]];
  spots.forEach(([fx, fy], i) => { const climb = clamp((Hc - plinthH(t) - fy) / 4); if (climb <= 0 || fall > .8) return; const q = manPt(fx + .4 * n1(660 + i, t * 1.7), fy, t), h = (3.4 + 2 * n1(600 + i, t * 3)) * k * climb * (1 - fall), w = (1.3 + .4 * n1(650 + i, t * 2)) * k;
    flameTongue(q[0], q[1] + w * .6, h, w, 30 + i, t, .75 * clamp(f * 1.6), true); });
  // heap coals after the fall: each one a separate pulsing glow so the ember field reads, not mush
  if (hp > 0) for (let i = 0; i < 64; i++) { const u = rnd(i, 81), X = lerp(-12, 18, u), Y = (.2 + rnd(i, 82) * 2.4) * Math.sin(u * Math.PI) ** .7 * hp, q = [x + X * k, y - Y * k], r = (.3 + rnd(i, 83) * .45) * k, a = hp * (.4 + .6 * (.5 + .5 * n1(820 + i, t * (.8 + rnd(i, 84)))));
    const cg = g.createRadialGradient(q[0], q[1], 0, q[0], q[1], r); cg.addColorStop(0, `rgba(255,${170 + 60 * rnd(i, 85)},90,${.95 * a})`); cg.addColorStop(.3, `rgba(255,110,30,${.6 * a})`); cg.addColorStop(1, 'rgba(200,40,10,0)'); g.fillStyle = cg; g.fillRect(q[0] - r, q[1] - r, 2 * r, 2 * r); }
  // sparks
  const ns = Math.round(50 + 150 * f);
  for (let i = 0; i < ns; i++) { const sp = .25 + .2 * rnd(i, 9), ph = (t * sp + rnd(i, 91)) % 1, ex = x + ((rnd(i, 3) - .5) * 18 + n1(500 + i, t * .6) * 5 + ph * 6 * n1(530 + i, t * .2)) * k * wide, ey = y - (3 + ph * (Hc + 14)) * k, s = Math.max(2, .16 * k * (1 - ph * .5));
    g.fillStyle = `rgba(255,${210 - ph * 90},${120 - ph * 80},${(1 - ph) * .9 * Math.max(f, hp * .4)})`; g.fillRect(ex, ey, s, s); }
  g.restore();
}

// ---------- the dusk spiral (Nakamura N20): a lantern path from the table to the Man's base ----------
const SPIRAL = (() => { const R0 = 42.6, R1 = 11.5, TURNS = 2, a0 = Math.atan2(4 - MAN.z, 288.5 - MAN.x), pts = [], len = [0];
  for (let i = 0; i <= 480; i++) { const s = i / 480, r = lerp(R0, R1, Math.pow(s, .85)), a = a0 + s * TURNS * TAU; pts.push([MAN.x + Math.cos(a) * r, MAN.z + Math.sin(a) * r, a, r]); if (i) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); }
  return { pts, len, L: len[len.length - 1] }; })();
function spiralAt(d) { const { pts, len } = SPIRAL; d = clamp(d, 0, SPIRAL.L); let lo = 0, hi = len.length - 1; while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (len[mid] < d) lo = mid; else hi = mid; }
  const u = (d - len[lo]) / (len[hi] - len[lo] || 1), A = pts[lo], B = pts[hi]; return [lerp(A[0], B[0], u), lerp(A[1], B[1], u), lerp(A[2], B[2], u), lerp(A[3], B[3], u)]; }
const POSTS = []; for (let d = 1.5; d < SPIRAL.L; d += 5.4) { const [X, Z, a, r] = spiralAt(d); POSTS.push({ X: MAN.x + Math.cos(a) * (r + 1.7), Z: MAN.z + Math.sin(a) * (r + 1.7), s: d / SPIRAL.L, i: POSTS.length }); }
// the crowd: 60 walkers on the spiral (three of them are inhabited props), 110 witnesses who gather at nightfall
const COLS = ['#d8452f', '#2f6fb5', '#e8b23a', '#3c8c5a', '#f2ede0', '#7a3c8c', '#e07a2f'];
const WALK_V = 1.15;
const MEMBERS = [
  ...[...Array(60)].map((_, i) => ({ type: 'walk', kind: i === 22 ? 'box' : i === 30 ? 'kite' : i === 58 ? 'rec' : 'person', d0: SPIRAL.L - 8 - i * (SPIRAL.L - 12) / 60, cap: SPIRAL.L - 1.5 - i * .95, side: (rnd(i, 13) - .5) * 1.1, lantern: i % 2 === 0, i })),
  ...[...Array(110)].map((_, j) => { const i = 60 + j, front = j < 72, a = front ? -Math.PI / 2 + (rnd(i, 31) - .5) * 2.3 : rnd(i, 31) * TAU, r = front && j < 36 ? 20 + rnd(i, 32) * 10 : 12.5 + rnd(i, 32) * 20;
    return { type: 'ring', kind: 'person', a, r, ts: 206.5 + rnd(i, 33) * 6, lantern: j % 9 === 0, i }; }),
];
for (const m of MEMBERS) { m.col = COLS[m.i % 7]; m.hat = m.i % 6; m.cape = m.i % 4 === 1; m.skin = ['#e8d4b4', '#c99a74', '#8c6448', '#f0dcc4'][m.i % 4]; }
const CROWD = MEMBERS; // draft-2 name
// keep a clear aisle where the climax camera stands and moves (so nobody is drawn through the lens)
const AISLES = [[[300, 7], [300, 28]], [[300, 17], [310, 2]], [[310, 2], [320, 0]], [[320, 0], [321, 6]], [[321, 6], [305, 21]], [[305, 21], [306, 12]], [[306, 12], [305, 15]], [[296, 4], [300, 15.5]]];
function aisle(X, Z) { for (const [a, b] of AISLES) { const dx = b[0] - a[0], dz = b[1] - a[1], u = clamp(((X - a[0]) * dx + (Z - a[1]) * dz) / (dx * dx + dz * dz)), cx = a[0] + dx * u, cz = a[1] + dz * u, ex = X - cx, ez = Z - cz, d = Math.hypot(ex, ez);
  if (d < 2.6) { const n = d > .01 ? 2.6 / d : 0; X = cx + (n ? ex * n : 2.6); Z = cz + (n ? ez * n : 0); } } return [X, Z]; }
let CS = { t: NaN, list: null };
function crowdState(t) { // every member's place and pose at song time t (a pure function, cached for this frame only)
  if (CS.t === t) return CS.list; const out = [];
  if (t >= 150) for (const m of MEMBERS) {
    let X, Z, alpha = 1, step = 0, moving = false;
    if (m.type === 'walk') { const d = Math.min(m.cap, m.d0 + WALK_V * (t - 200)); if (d < 0) continue; alpha = clamp(d / 3); moving = d < m.cap; const s = spiralAt(d), r = s[3] + m.side; X = MAN.x + Math.cos(s[2]) * r; Z = MAN.z + Math.sin(s[2]) * r; }
    else { if (t < m.ts - 3) continue; alpha = ease(t, m.ts - 3, m.ts); const r = m.r + 18 * (1 - ease(t, m.ts, m.ts + 6)); moving = t < m.ts + 6; X = MAN.x + Math.cos(m.a) * r; Z = MAN.z + Math.sin(m.a) * r; }
    const go = ease(t, 253 + rnd(m.i, 34) * 1.5, 258.5 + rnd(m.i, 34) * 1.5); // after the burn they drift off into the dark
    if (go > 0) { const dx = X - MAN.x, dz = Z - MAN.z, fr = Z < MAN.z - 5, ux = fr ? (Math.sign(dx) || 1) : dx, uz = fr ? .25 : dz, n = Math.hypot(ux, uz) || 1; X += ux / n * 24 * go; Z += uz / n * 24 * go; moving = moving || go < 1; alpha *= 1 - ease(t, 255.5 + rnd(m.i, 35) * 1.5, 259 + rnd(m.i, 35) * 1.5); }
    if (alpha <= .01) continue;
    if (t > 230) [X, Z] = aisle(X, Z);
    if (moving) step = Math.sin(t * 6.5 + m.i) * .18;
    out.push({ m, X, Z, alpha, step, lift: voteLift(m, t) });
  }
  CS = { t, list: out }; return out;
}
// ---------- the ballots: four waves, one per "vote", each bigger, each catching fire ----------
function inWave(m, w) { if (m.kind !== 'person') return false; return w === 0 ? m.i % 3 === 0 : w === 1 ? m.i % 2 === 0 : true; }
function waveTimes(m, w, extra) { const tv = VOTES[w], st = rnd(m.i, w, 41) * .45 + (extra ? 1.3 : 0); return { up: tv + st - .3, rel: tv + .55 + st + rnd(m.i, w + 9, 42) * .5 }; }
function voteLift(m, t) { let l = 0; for (let w = 0; w < 4; w++) { if (!inWave(m, w)) continue; const { up, rel } = waveTimes(m, w, false), rel2 = w === 3 && m.i % 2 ? waveTimes(m, w, true).rel : rel; l = Math.max(l, ease(t, up, up + .35) * (1 - ease(t, rel2 + .4, rel2 + 1.6))); } return l; }

// ---------- drawing people ----------
function person(x, y, k, o, c) { // c = {body, skin, dark, lamp}; o = {step, lift, lantern, hat, cape}
  g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = c.dark; g.lineWidth = Math.max(1, .12 * k);
  g.beginPath(); g.moveTo(x - .08 * k, y - .84 * k); g.lineTo(x - (.1 + o.step) * k, y - .03 * k); g.moveTo(x + .08 * k, y - .84 * k); g.lineTo(x + (.1 + o.step) * k, y - .03 * k); g.stroke();
  const fl = o.cape ? .38 : .2; g.fillStyle = c.body; g.beginPath(); g.moveTo(x - fl * k, y - .78 * k); g.lineTo(x - .23 * k, y - 1.34 * k); g.quadraticCurveTo(x - .24 * k, y - 1.5 * k, x - .09 * k, y - 1.52 * k);
  g.lineTo(x + .09 * k, y - 1.52 * k); g.quadraticCurveTo(x + .24 * k, y - 1.5 * k, x + .23 * k, y - 1.34 * k); g.lineTo(x + fl * k, y - .78 * k); g.closePath(); g.fill();
  g.strokeStyle = c.body; g.lineWidth = Math.max(1, .085 * k); g.beginPath(); g.moveTo(x - .21 * k, y - 1.4 * k); g.quadraticCurveTo(x - .31 * k, y - 1.15 * k, x - .27 * k, y - .92 * k); g.stroke(); // the arm that hangs
  g.fillStyle = c.skin; g.fillRect(x - .05 * k, y - 1.6 * k, .1 * k, .1 * k); g.beginPath(); g.ellipse(x, y - 1.69 * k, .12 * k, .145 * k, 0, 0, TAU); g.fill();
  if (o.hat === 1) { g.fillStyle = c.dark; g.fillRect(x - .1 * k, y - 2.08 * k, .2 * k, .3 * k); g.fillRect(x - .17 * k, y - 1.81 * k, .34 * k, .05 * k); }
  else if (o.hat === 2) { g.fillStyle = c.hatc || c.body; g.beginPath(); g.ellipse(x, y - 1.8 * k, .3 * k, .06 * k, 0, 0, TAU); g.fill(); g.fillRect(x - .11 * k, y - 1.95 * k, .22 * k, .15 * k); }
  else if (o.hat === 3) { g.fillStyle = c.hatc || c.body; g.beginPath(); g.moveTo(x - .11 * k, y - 1.76 * k); g.lineTo(x - .2 * k, y - 2.04 * k); g.lineTo(x - .03 * k, y - 1.82 * k); g.moveTo(x + .11 * k, y - 1.76 * k); g.lineTo(x + .2 * k, y - 2.04 * k); g.lineTo(x + .03 * k, y - 1.82 * k); g.fill(); }
  if (o.lift > 0) { g.strokeStyle = c.body; g.lineWidth = Math.max(1, .085 * k); g.beginPath(); g.moveTo(x + .19 * k, y - 1.42 * k); g.lineTo(x + .3 * k, y - lerp(1.3, 2.25, o.lift) * k); g.stroke(); }
  if (o.lantern) { g.strokeStyle = c.dark; g.lineWidth = Math.max(1, .04 * k); g.beginPath(); g.moveTo(x - .26 * k, y - 1.0 * k); g.lineTo(x - .42 * k, y - 2.6 * k); g.stroke(); g.fillStyle = c.lamp; g.fillRect(x - .53 * k, y - 2.62 * k, .22 * k, .3 * k); }
}
function propOnSpiral(m, X, Z, t, alpha) { // Nakamura's little scenes along the route
  const p = P(X, 0, Z); if (p[2] < 1.2) return; const k = kAt(p) * (m.kind === 'kite' ? 1 : m.kind === 'box' ? 1.35 : 1.7), x = p[0], y = p[1], w = Math.sin(t * 2.2 + m.i); // the props are a size bigger so they read in the wides
  g.save(); g.globalAlpha = alpha; g.lineCap = 'round';
  if (m.kind === 'box') { // a ballot box walking on stilts
    g.strokeStyle = '#5c4a3a'; g.lineWidth = Math.max(1, .12 * k); for (let i = 0; i < 4; i++) { const hx = x + (-.55 + (i % 2) * 1.1 + (i > 1 ? .15 : 0)) * k, fx = hx + ((i === 0 || i === 3) ? w : -w) * .5 * k; g.beginPath(); g.moveTo(hx, y - 3 * k); g.quadraticCurveTo((hx + fx) / 2 + .2 * k, y - 1.5 * k, fx, y); g.stroke(); }
    g.fillStyle = '#e9e0cb'; g.fillRect(x - .8 * k, y - 4.4 * k, 1.6 * k, 1.4 * k); g.fillStyle = '#cbbf9f'; g.fillRect(x + .5 * k, y - 4.4 * k, .3 * k, 1.4 * k);
    g.fillStyle = '#1a1a1a'; g.fillRect(x - .5 * k, y - 4.46 * k, 1 * k, .12 * k); g.fillStyle = '#fbf7ec'; g.fillRect(x - .25 * k, y - (4.95 - Math.abs(w) * .25) * k, .5 * k, .55 * k);
    g.strokeStyle = '#2a2226'; g.lineWidth = Math.max(1, .05 * k); g.strokeRect(x - .8 * k, y - 4.4 * k, 1.6 * k, 1.4 * k);
  } else if (m.kind === 'kite') { // a walker flying a kite made of a newspaper, its tail of torn strips
    person(x, y, k, { step: Math.sin(t * 6.5 + m.i) * .18, lift: .85, lantern: false, hat: 0 }, { body: '#2f6fb5', skin: '#e8d4b4', dark: '#3a3040' });
    const kx = x + (2.6 + .4 * w) * k, ky = y - (8.2 + .5 * Math.sin(t * 1.3)) * k; g.strokeStyle = 'rgba(240,235,220,.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + .3 * k, y - 2.2 * k); g.quadraticCurveTo(x + 2 * k, y - 4 * k, kx, ky + 1.3 * k); g.stroke();
    g.save(); g.translate(kx, ky); g.rotate(.25 * Math.sin(t * 1.7)); g.fillStyle = '#ece5d2'; g.beginPath(); g.moveTo(0, -1.4 * k); g.lineTo(1.1 * k, 0); g.lineTo(0, 1.4 * k); g.lineTo(-1.1 * k, 0); g.closePath(); g.fill();
    g.fillStyle = '#1e1e22'; g.fillRect(-.55 * k, -.6 * k, 1.1 * k, .2 * k); g.fillStyle = 'rgba(60,60,66,.55)'; for (let i = 0; i < 5; i++) g.fillRect(-(.5 - Math.abs(i - 2) * .12) * k, (-.25 + i * .22) * k, (1 - Math.abs(i - 2) * .24) * k, .06 * k);
    g.strokeStyle = '#ece5d2'; g.lineWidth = Math.max(1, .1 * k); g.beginPath(); g.moveTo(0, 1.4 * k); for (let i = 1; i < 6; i++) g.lineTo(Math.sin(t * 3 + i) * .3 * k, (1.4 + i * .5) * k); g.stroke(); g.restore();
  } else if (m.kind === 'rec') { // a reel-to-reel tape recorder hobbling on two crutches
    const hop = Math.abs(Math.sin(t * 3.2)) * .2 * k;
    g.strokeStyle = PAL.crutch; g.lineWidth = Math.max(1, .1 * k); for (const d of [-1, 1]) { g.beginPath(); g.moveTo(x + d * .5 * k, y - 1.1 * k - hop); g.lineTo(x + d * (.75 + .15 * w * d) * k, y); g.stroke(); g.lineWidth = Math.max(1, .14 * k); g.strokeStyle = '#e9dcc2'; g.beginPath(); g.moveTo(x + (d * .5 - .2) * k, y - 1.12 * k - hop); g.lineTo(x + (d * .5 + .2) * k, y - 1.12 * k - hop); g.stroke(); g.strokeStyle = PAL.crutch; g.lineWidth = Math.max(1, .1 * k); }
    g.fillStyle = '#3a3a40'; g.fillRect(x - .8 * k, y - 2.0 * k - hop, 1.6 * k, .9 * k);
    for (const d of [-1, 1]) { const cx = x + d * .4 * k, cy = y - 1.55 * k - hop; g.fillStyle = '#d8d0bc'; g.beginPath(); g.arc(cx, cy, .3 * k, 0, TAU); g.fill(); g.strokeStyle = '#3a3a40'; g.lineWidth = Math.max(1, .05 * k); g.beginPath(); for (let s = 0; s < 3; s++) { const a = t * 4 * d + s * TAU / 3; g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * .26 * k, cy + Math.sin(a) * .26 * k); } g.stroke(); }
  }
  g.restore();
}
function crowdInto(t, list) {
  const cs = crowdState(t); if (!cs.length) return; const night = t >= 218.5, manZ = P(MAN.x, 0, MAN.z)[2];
  const zmin = t > 252 ? 7 : t > 236 ? 3.2 : 1.2;
  for (const c of cs) { const p = P(c.X, 0, c.Z); if (p[2] < zmin || p[0] < -150 || p[0] > W + 150) continue;
    if (night && p[2] < manZ && c.m.kind === 'person') continue; // in front of the fire: drawn after the fire, as silhouettes (ballotEmbers)
    const m = c.m, big = m.kind === 'box' ? 4.6 : m.kind === 'kite' ? 2 : m.kind === 'rec' ? 2 : 1.9;
    list.push({ z: p[2], draw: () => { if (m.kind !== 'person') return propOnSpiral(m, c.X, c.Z, t, c.alpha); const k = kAt(p); if (k < .6) return; g.save(); g.globalAlpha = c.alpha;
      person(p[0], p[1], k, { step: c.step, lift: c.lift, lantern: m.lantern, hat: m.hat, cape: m.cape }, { body: m.col, skin: m.skin, dark: '#3a3040', lamp: '#f0d49a', hatc: COLS[(m.i + 3) % 7] }); g.restore(); },
      shadow: () => shadowStick(c.X, 0, big, c.Z, .45 * (big > 2 ? 2 : 1), t) });
  }
}
// ---------- the playa around the Man: the spiral path, its lantern posts, the table's tracks ----------
function groundBand(pts, half, fill) { // a flat band on the ground along a polyline of [X, Z]
  g.beginPath(); let any = false;
  for (let i = 0; i + 1 < pts.length; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], dx = x1 - x0, dz = z1 - z0, n = Math.hypot(dx, dz) || 1, nx = -dz / n * half, nz = dx / n * half;
    const q = [P(x0 + nx, 0, z0 + nz), P(x1 + nx, 0, z1 + nz), P(x1 - nx, 0, z1 - nz), P(x0 - nx, 0, z0 - nz)]; if (!ok(q)) continue; if (q.every((v) => v[0] < -50) || q.every((v) => v[0] > W + 50)) continue;
    g.moveTo(q[0][0], q[0][1]); for (let j = 1; j < 4; j++) g.lineTo(q[j][0], q[j][1]); g.closePath(); any = true; }
  if (any) { g.fillStyle = fill; g.fill(); }
}
function burnInto(t, list) {
  if (P(MAN.x, 0, MAN.z)[2] > 400) return;
  const path = []; for (let i = 0; i < SPIRAL.pts.length; i += 4) path.push(SPIRAL.pts[i]);
  list.push({ z: 1e6, draw: () => { groundBand(path, 1.1, 'rgba(246,226,186,.30)'); groundBand(path, .35, 'rgba(120,84,52,.16)'); } });
  // (the table's wheel tracks and dust behind it are drawn by car.js)
  const pmin = t > 236 ? 6 : 1.2; // no lantern post right in the lens during the climax
  for (const q of POSTS) { const p = P(q.X, 0, q.Z); if (p[2] < pmin || p[0] < -100 || p[0] > W + 100) continue;
    list.push({ z: p[2], draw: () => { const k = kAt(p); g.strokeStyle = '#4a3a2c'; g.lineWidth = Math.max(1, .1 * k); g.lineCap = 'round'; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0], p[1] - 2.3 * k); g.stroke();
      g.fillStyle = '#f1d9a6'; g.beginPath(); g.ellipse(p[0], p[1] - 2.55 * k, .24 * k, .32 * k, 0, 0, TAU); g.fill(); g.fillStyle = '#c7362b'; g.fillRect(p[0] - .24 * k, p[1] - 2.62 * k, .48 * k, .07 * k); },
      shadow: () => shadowStick(q.X, 0, 2.6, q.Z, .12, t) }); }
}
// overlay hook (draft 3): drawn after the scene, before the grade.
function burnOver(t) {}

// ---------- after the grade: lights ----------
const nightAmt = (t) => ease(t, 199, 216);
function glowAt(x, y, r, col, a) { const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, `rgba(${col},${a})`); rg.addColorStop(1, `rgba(${col},0)`); g.fillStyle = rg; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
function spinners(t) { // the lanterns come on one by one along the spiral at dusk; walkers' lanterns; fire spinners in the night crowd
  if (t < 196) return; g.save(); g.globalCompositeOperation = 'lighter';
  for (const q of POSTS) { const on = ease(t, 198.5 + 8 * q.s, 199.6 + 8 * q.s); if (on <= 0) continue; const p = P(q.X, 0, q.Z); if (p[2] < (t > 236 ? 6 : 1.2) || p[0] < -200 || p[0] > W + 200) continue; const k = kAt(p), fl = .85 + .15 * n1(950 + q.i, t * 3);
    const zq = P(q.X, 0, q.Z + 2.6), ry = Math.max(1, Math.abs(zq[1] - p[1])), rx = 2.6 * k; g.save(); g.translate(p[0], p[1]); g.scale(1, Math.min(1, ry / rx)); glowAt(0, 0, Math.min(rx, 170), '255,190,110', .3 * on * fl); g.restore(); // a pool of light on the ground
    glowAt(p[0], p[1] - 2.55 * k, Math.min(1.5 * k, 70), '255,205,130', .55 * on * fl); g.fillStyle = `rgba(255,222,165,${.7 * on})`; g.beginPath(); g.ellipse(p[0], p[1] - 2.55 * k, Math.min(.2 * k, 9), Math.min(.27 * k, 12), 0, 0, TAU); g.fill(); }
  const cs = crowdState(t);
  for (const c of cs) { if (!c.m.lantern || c.m.kind !== 'person') continue; const on = ease(t, 200 + rnd(c.m.i, 37) * 5, 201 + rnd(c.m.i, 37) * 5) * c.alpha; if (on <= 0) continue; const p = P(c.X, 0, c.Z); if (p[2] < (t > 252 ? 7 : t > 236 ? 3.2 : 1.2) || p[0] < -100 || p[0] > W + 100) continue; const k = kAt(p);
    const lx = p[0] - .42 * k, ly = p[1] - 2.47 * k; glowAt(lx, ly, Math.min(1.3 * k, 60), '255,200,120', .5 * on); g.fillStyle = `rgba(255,226,170,${.75 * on})`; g.fillRect(lx - .1 * k, ly - .14 * k, .2 * k, .28 * k); }
  const n = ease(t, 219, 224) * (1 - ease(t, 255, 260));
  if (n > 0) for (const c of cs) { if (c.m.type !== 'ring' || c.m.i % 15 !== 4) continue; const p = P(c.X, 1.4, c.Z); if (p[2] < 2) continue; const k = kAt(p);
    for (let j = 0; j < 2; j++) { const ang = t * 9 + j * Math.PI + c.m.i, fx = p[0] + Math.cos(ang) * .9 * k, fy = p[1] + Math.sin(ang) * .9 * k; glowAt(fx, fy, .5 * k, '255,200,110', n);
      g.strokeStyle = `rgba(255,150,60,${.5 * n})`; g.lineWidth = Math.max(1, .12 * k); g.beginPath(); g.arc(p[0], p[1], .9 * k, ang - .9, ang); g.stroke(); } }
  g.restore();
}
function ballotEmbers(t) { // after the fire: the witnesses in front of it as silhouettes, their ballots, and the ballots burning in the air
  if (t < VOTES[0] - 2) return; const cs = crowdState(t), manZ = P(MAN.x, 0, MAN.z)[2], glow = fireGlow(t);
  const near = []; for (const c of cs) { const p = P(c.X, 0, c.Z); if (p[2] < (t > 252 ? 7 : t > 236 ? 3.2 : 1.2) || p[2] >= manZ || c.m.kind !== 'person' || p[0] < -200 || p[0] > W + 200) continue; near.push([p, c]); }
  near.sort((a, b) => b[0][2] - a[0][2]);
  const sil = { body: '#1d1520', skin: '#1d1520', dark: '#1d1520', lamp: '#1d1520', hatc: '#1d1520' }, rimA = .35 + .55 * glow, rim = { body: `rgba(255,140,60,${rimA})`, skin: `rgba(255,150,70,${rimA})`, dark: `rgba(255,130,50,${rimA * .7})`, lamp: `rgba(255,200,120,${rimA})`, hatc: `rgba(255,140,60,${rimA})` };
  for (const [p, c] of near) { const k = kAt(p); if (k < .6) continue; const o = { step: c.step, lift: c.lift, lantern: c.m.lantern, hat: c.m.hat, cape: c.m.cape };
    g.save(); g.globalAlpha = c.alpha; g.globalCompositeOperation = 'lighter'; person(p[0] + .02 * k, p[1] - .05 * k, k, o, rim); g.globalCompositeOperation = 'source-over'; person(p[0], p[1], k, o, sil); g.restore(); }
  // the ballots: held up on the word, let go into the heat, catching fire, then embers
  for (const c of cs) { const m = c.m; for (let w = 0; w < 4; w++) { if (!inWave(m, w)) continue; for (const extra of (w === 3 && m.i % 2 ? [false, true] : [false])) {
    const { up, rel } = waveTimes(m, w, extra); if (t < up || t > rel + 9) continue;
    const hy = lerp(1.3, 2.25, c.lift) + .2, Xh = c.X + .3, Zh = c.Z, j = m.i * 7 + w * 3 + (extra ? 1 : 0);
    if (t < rel) { if (!extra || t > rel - 1) ballot(Xh, hy, Zh, t, j, 0, glow, c.alpha * ease(t, up, up + .2)); continue; }
    const a = t - rel, f = .55 * (1 - Math.exp(-.22 * a)), X = lerp(Xh, MAN.x, f) + n1(1000 + j, a * .7) * 1.6, Z = lerp(Zh, MAN.z, f * .8) + n1(1100 + j, a * .6) * 1.2, Y = hy + 1.3 * a + .32 * a * a;
    const ac = .8 + 1.4 * rnd(j, 43); ballot(X, Y, Z, t, j, clamp((a - ac) / 1.3), glow, c.alpha * (1 - clamp((a - ac - 1.3) / 4)));
  } } }
}
function ballot(X, Y, Z, t, j, q, glow, alpha) { // a paper ballot with its box and X; q = how much of it has burnt (0..1)
  if (alpha <= .01) return; const p = P(X, Y, Z); if (p[2] < 1.6 || p[0] < -150 || p[0] > W + 150 || p[1] < -150 || p[1] > H + 150) return; const k = kAt(p);
  if (q >= 1) { const s = Math.max(2, .08 * k); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,${150 + 50 * n1(1200 + j, t * 3)},60,${.85 * alpha})`; g.fillRect(p[0] - s / 2, p[1] - s / 2, s, s); g.restore(); return; }
  const w = .44 * k, h = .58 * k, lt = clamp(.45 + glow * .7 - Math.hypot(X - MAN.x, Z - MAN.z) / 120), col = mix([96, 86, 110], [255, 234, 196], lt);
  g.save(); g.translate(p[0], p[1]); g.rotate(n1(1300 + j, t * .9) * .9 + (j % 2 ? .2 : -.2)); g.scale(1, .75 + .25 * Math.cos(t * 2.1 + j)); g.globalAlpha = alpha;
  const top = -h / 2, bot = h / 2 - q * h; // it burns from the bottom up
  g.fillStyle = rgb(col); g.fillRect(-w / 2, top, w, bot - top);
  if (q < .85) { g.strokeStyle = 'rgba(30,24,30,.85)'; g.lineWidth = Math.max(1, .025 * k); g.strokeRect(-w * .3, top + h * .2, w * .22, w * .22); g.beginPath(); g.moveTo(-w * .3, top + h * .2); g.lineTo(-w * .08, top + h * .2 + w * .22); g.moveTo(-w * .08, top + h * .2); g.lineTo(-w * .3, top + h * .2 + w * .22); g.stroke();
    g.fillStyle = 'rgba(30,24,30,.55)'; g.fillRect(w * .02, top + h * .24, w * .32, Math.max(1, .02 * k)); g.fillRect(-w * .3, top + h * .52, w * .62, Math.max(1, .02 * k)); }
  if (q > 0) { g.fillStyle = 'rgba(30,14,10,.9)'; g.fillRect(-w / 2, bot - h * .08, w, h * .08); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,150,50,.9)'; g.fillRect(-w / 2, bot - Math.max(1, .03 * k), w, Math.max(1.5, .04 * k));
    flameTongue(0, bot, h * (.5 + .4 * n1(1400 + j, t * 4)), w * .45, 1500 + j, t, .9, true); }
  g.restore();
}
