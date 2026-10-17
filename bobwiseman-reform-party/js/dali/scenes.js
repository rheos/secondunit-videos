// Reform Party, Dali look: scenes out in the city that the drone flies to (draft 9). Built by b8.
// Seven real Black Rock City sights, each at a fixed world spot (SC_SPOTS, for camera.js):
//  1 intro 0-16.4: a sound camp on the 9:00 Esplanade at sunrise, the last dancers, bikes streaming out to the playa
//  2 instrumental 1, 60.5-65: Von Ulrich's sky painter rolls a sky-blue canvas beige, then turns to the sax rider
//  3 "build more" 89.9-92.4: a hard-hat crew on a scissor lift bolts a cell onto stilts; on "more" it multiplies
//  4 instrumental 2, 117-123.3: a column of burners carries a giant ballot across the road (Dali: ants and a crumb)
//  5 "wars / bets" 137.6-140.3: the bungee dome, two suits bashing with foam bats, a suit with a slate taking bets
//  6 refrain 3 "spin" 190.98: forty bike lights swarm in a spiral round the board
//  7 sunset 196.5-200.5: sixteen burners howl at the sun; their joined shadow is one howling head (Nakamura)
// Every name here starts with sc / SC_ so nothing clashes with the other files. All of it is a pure function of t.

const SC_SPOTS = { camp: [-462, 30], painter: [78, -28], crew: [103.7, 27], ants: [165, 0], dome: [200, -32], howl: [280.5, -12.8], howlHead: [286, -22] };
const SC_BEAT = .604; // the song's beat (99.4 bpm), measured from the no-vocals stem; phases below are local downbeats
const scBeat = (t, ph) => { const n = (t - ph) / SC_BEAT; return n - Math.floor(n); };
const scNear = (X, Z, R) => Math.hypot(C.x - X, C.z - Z) < R; // is the drone anywhere near this spot
const scScreen = (p, m) => p[2] > 1 && p[0] > -m && p[0] < W + m && p[1] > -m && p[1] < H + m * 1.5;
const scLED = ['120,220,255', '255,90,200', '140,255,120', '255,200,80', '200,120,255', '255,120,80'];

// ---------- figures ----------
// A standing costumed burner (the playa.js rider's costume: bmCostume), feet at screen (x, y), k px per metre.
// o: view 'front' | 'back' | 'side', d (side: +1 faces right), step (walk phase, radians), bob (m), hands [[x, y], [x, y]]
// in metres from the feet (left, right as seen), tip (head dropped back, 0..1), alpha.
function scFig(x, y, k, c, o) {
  if (k < .7) return; const side = o.view === 'side', b = o.bob || 0, hipY = .92 + b, shY = 1.43 + b, tip = o.tip || 0;
  const hd = [side ? .05 : 0, 1.66 + b - .07 * tip];
  bmBegin(x, y, k, side ? (o.d || 1) : 1); if (o.alpha != null && o.alpha < 1) g.globalAlpha *= o.alpha;
  const hands = o.hands || [[-.24, .8 + b], [.24, .8 + b]], st = o.step || 0;
  if (k < 4.5) { // far: a coloured stick figure
    bmLine([[-.09 - .1 * Math.sin(st), 0], [0, hipY], [.09 + .1 * Math.sin(st), 0]], .13, c.legs);
    bmFill([[-.21, shY], [.21, shY], [.24, hipY - .25], [-.24, hipY - .25]], c.coat[0]);
    bmLine([[-.17, shY - .05], hands[0]], .1, c.coat[0]); bmLine([[.17, shY - .05], hands[1]], .1, c.coat[0]);
    bmDot(hd[0], hd[1], .14, c.skin); if (c.hat === 'top') bmFill([[-.1, hd[1] + .08], [.1, hd[1] + .08], [.1, hd[1] + .34], [-.1, hd[1] + .34]], '#1c1a1e');
    g.restore(); return; }
  const det = k > 14, ink = '#1b1714';
  // legs: side view scissors, front and back view step out
  const H0 = [0, hipY], legs = side ? [[.3 * Math.sin(st), .1 * Math.max(0, Math.cos(st))], [-.3 * Math.sin(st), .1 * Math.max(0, -Math.cos(st))]]
    : [[-.15 - .06 * Math.max(0, Math.sin(st)), .08 * Math.max(0, Math.sin(st))], [.15 + .06 * Math.max(0, -Math.sin(st)), .08 * Math.max(0, -Math.sin(st))]];
  legs.forEach((F, i) => { const hp = side ? H0 : [i ? .08 : -.08, hipY], K = bmJoint(hp, F, .47, .47, side ? 1 : (i ? 1 : -1), side ? 0 : -.2);
    bmLine([hp, K, F], .13, i === 0 && side ? bmShade(c.legs, .7) : c.legs); bmOval(F[0] + (side ? .05 : 0), F[1] + .03, side ? .12 : .09, .06, c.fur ? c.trim : ink); });
  // the far arm (side view) behind the coat
  const SL = [-.17, shY - .05], SR = [.17, shY - .05], arm = (S, Hn, col, sx) => { const E = bmJoint(S, Hn, .31, .31, sx, -.6); bmLine([S, E, Hn], .1, col); bmDot(Hn[0], Hn[1], .045, c.skin); };
  if (side) arm([0, shY - .05], hands[0], bmShade(c.coat[1], .75), -1);
  // the coat: fur breaks the edge into tufts, light from the left
  const coat = [[-.2, shY + .02], [.2, shY + .02], [.27, .62 + b], [.1, .55 + b], [-.1, .55 + b], [-.27, .62 + b]];
  bmPath(c.fur && det ? bmFur(coat, .035, c.seed) : coat); g.closePath(); g.fillStyle = bmLG(-.3, 0, .3, 0, [c.coat[0], c.coat[0], c.coat[1]]); g.fill();
  if (det && c.spots) for (let i = 0; i < 7; i++) bmOval(-.18 + rnd(c.seed, i, 1) * .36, .7 + b + rnd(c.seed, i, 2) * .65, .03, .022, 'rgba(40,24,14,.7)');
  bmOval(0, shY - .01, .19, .07, c.fur ? c.trim : bmShade(c.coat[1], .8)); // collar
  if (side) arm([0, shY - .05], hands[1], c.coat[0], 1);
  else { arm(SL, hands[0], c.coat[0], -1); arm(SR, hands[1], c.coat[1], 1); }
  // head: goggles (a strap from behind), a hat
  bmLine([[0, shY], [hd[0], hd[1] - .05]], .07, c.skin);
  bmOval(hd[0], hd[1], .11, .125, bmLG(hd[0] - .1, hd[1] + .1, hd[0] + .12, hd[1] - .1, ['#fff3e0', c.skin, bmShade(c.skin, .7)]));
  if (o.view === 'back') { bmOval(hd[0], hd[1] + .02, .11, .1, bmShade(c.legs, .85)); bmLine([[-.11, hd[1] + .01], [.11, hd[1] + .01]], .03, '#2a2420'); } // hair or a hood, the goggle strap
  else if (side) { bmLine([[hd[0] - .11, hd[1] + .01], [hd[0] + .1, hd[1] + .02]], .035, '#2a2420'); bmDot(hd[0] + .075, hd[1] + .02, .05, c.lens); }
  else { bmLine([[-.11, hd[1] + .02], [.11, hd[1] + .02]], .035, '#2a2420'); bmDot(-.05, hd[1] + .02, .045, c.lens); bmDot(.05, hd[1] + .02, .045, c.lens); }
  const hx = hd[0], hy = hd[1];
  if (c.hat === 'top') { bmFill([[hx - .1, hy + .08], [hx + .1, hy + .08], [hx + .11, hy + .38], [hx - .09, hy + .38]], '#1c1a1e'); bmFill([[hx - .1, hy + .1], [hx + .1, hy + .1], [hx + .1, hy + .15], [hx - .1, hy + .15]], c.coat[0]); bmOval(hx, hy + .08, .19, .03, '#1c1a1e'); }
  else if (c.hat === 'fluff') { bmPath(bmFur([[hx - .16, hy + .02], [hx - .1, hy + .22], [hx + .12, hy + .22], [hx + .17, hy + .02]], .03, c.seed + 3)); g.closePath(); g.fillStyle = c.trim; g.fill(); }
  else if (c.hat === 'sun') { bmOval(hx, hy + .09, .3, .045, '#e2c88a'); bmFill([[hx - .1, hy + .09], [hx + .1, hy + .09], [hx + .08, hy + .22], [hx - .08, hy + .22]], '#d4b670'); }
  else if (c.hat === 'bopper') for (const s2 of [-1, 1]) { const tip2 = [hx + s2 * .12 + Math.sin((o.t || 0) * 6 + s2) * .03, hy + .42]; bmLine([[hx + s2 * .05, hy + .1], tip2], .018, '#2a2420'); bmDot(tip2[0], tip2[1], .05, c.lens); }
  g.restore();
}
// a stick shadow for a standing figure (with its raised hands)
function scFigShadow(X, Z, t, top, hands) { const pts = [[X - .25, 0, Z], [X + .25, 0, Z], [X - .12, top || 1.85, Z], [X + .12, top || 1.85, Z]]; if (hands) for (const h of hands) pts.push([X + h[0], h[1], Z]); shadowOf(pts, t); }

// A standing suit (the board's egg head and rosette), feet at (x, y). o: front, hands [[x, y], [x, y]] in metres from the
// feet as seen, hat ('hard' a white hard hat), sq (-1..1: squashes x for a turn), step (walk phase), bob.
function scSuit(x, y, k, o) {
  if (k < .7) return; const b = o.bob || 0, hipY = .9 + b, shY = 1.62 + b, front = o.front, sq = o.sq == null ? 1 : o.sq;
  bmBegin(x, y, k, Math.abs(sq) < .08 ? .08 : sq); const hands = o.hands || [[-.22, .85 + b], [.22, .85 + b]], st = o.step || 0;
  if (k < 4.5) { bmLine([[-.1, 0], [0, hipY], [.1, 0]], .14, PAL.suit); bmFill([[-.24, shY], [.24, shY], [.22, hipY - .1], [-.22, hipY - .1]], PAL.suit);
    bmLine([[-.2, shY - .06], hands[0]], .11, PAL.suit); bmLine([[.2, shY - .06], hands[1]], .11, PAL.suit); bmOval(0, shY + .2, .125, .155, PAL.egg);
    if (o.hat === 'hard') bmOval(0, shY + .3, .15, .07, '#f4f1ea'); g.restore(); return; }
  // legs
  for (const i of [0, 1]) { const F = [(i ? .13 : -.13) + (i ? 1 : -1) * .05 * Math.sin(st), .06 * Math.max(0, (i ? 1 : -1) * Math.sin(st))], hp = [i ? .08 : -.08, hipY];
    bmLine([hp, [lerp(hp[0], F[0], .5), lerp(hp[1], F[1], .5)], F], .15, i ? PAL.suit : PAL.suitLit); bmOval(F[0], F[1] + .03, .1, .05, '#141216'); }
  // jacket
  bmFill([[-.22, hipY - .1], [-.27, shY - .05], [-.16, shY + .02], [.16, shY + .02], [.27, shY - .05], [.22, hipY - .1]], bmLG(-.27, 0, .27, 0, [PAL.suitLit, PAL.suit]));
  if (front) { bmFill([[-.08, shY + .01], [0, shY - .3], [.08, shY + .01]], '#f4efe6'); bmFill([[-.02, shY - .03], [.02, shY - .03], [.03, shY - .25], [0, shY - .29], [-.03, shY - .25]], '#8f1d1d'); rosette(-.15, -(shY - .12), .035); }
  else bmLine([[0, shY - .05], [0, hipY - .06]], .012, 'rgba(0,0,0,.35)');
  // arms
  for (const i of [0, 1]) { const S = [i ? .24 : -.24, shY - .06], Hn = hands[i], E = bmJoint(S, Hn, .33, .33, i ? 1 : -1, -.5); bmLine([S, E, Hn], .13, i ? PAL.suit : PAL.suitLit); bmDot(Hn[0], Hn[1], .05, PAL.egg); }
  // neck, egg, hat
  bmFill([[-.045, shY - .01], [.045, shY - .01], [.045, shY + .07], [-.045, shY + .07]], '#d7c3a3');
  egg(0, -(shY + .19), 1, front, 0);
  if (o.hat === 'hard') { g.beginPath(); g.ellipse(0, -(shY + .27), .15, .12, 0, Math.PI, TAU); g.fillStyle = '#f4f1ea'; g.fill(); bmOval(0, shY + .265, .19, .028, '#e2ddd2'); bmLine([[0, shY + .27], [0, shY + .38]], .025, '#d9d4c8'); }
  if (o.prop) o.prop();
  g.restore();
}
// a box in world metres, back faces culled; cols = [x-, x+, y+ (top), z-, z+]
function scBox(x0, x1, y0, y1, z0, z1, cols) {
  const F = (a, b, c, d, col) => { if (!col) return; const q = [P(...a), P(...b), P(...c), P(...d)]; if (!ok(q)) return; let ar = 0; for (let i = 0; i < 4; i++) { const p = q[i], n = q[(i + 1) % 4]; ar += p[0] * n[1] - n[0] * p[1]; } if (ar < 0) poly(q, col); };
  const [xa, xb, top, za, zb] = cols;
  F([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], xa); F([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], xb);
  F([x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], top);
  F([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], za); F([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], zb);
}
const scSeg = (a, b, w, col) => { const p = P(...a), q = P(...b); if (p[2] < .3 || q[2] < .3) return; seg(p, q, w * Math.min(kAt(p), kAt(q)), col); };

// ---------- 1. intro: the sound camp at sunrise on the 9:00 Esplanade ----------
// Real: the big sound camps sit on the Esplanade with their speakers facing out to the open playa (+x here), under a
// shade-cloth canopy; at dawn the last dancers are still going and the bikes start streaming out to the open playa.
const SC_CAMP = { x: -462, z: 30, ph: 2.443 };
const SC_DANCE = (() => { const R = mulberry(8101), out = []; for (let i = 0; i < 30; i++) { const X = -457.5 + R() * 13, Z = 22.5 + R() * 15.5;
  out.push({ X, Z, c: bmCostume(8000 + i * 13), mv: i % 4, ph: R() * .4, i }); } return out; })();
const SC_FLAGS = [[-460.6, 11.6, 7.4, '#d8452f'], [-460.8, 18.5, 6.6, '#e8b23a'], [-461, 25.2, 7.8, '#2f6fb5'], [-461, 34.8, 7.2, '#9a68dc'], [-460.8, 41.2, 6.8, '#3c8c5a'], [-460.6, 48.4, 7.6, '#f4b0cf']];
const SC_OUT = [...Array(30)].map((_, i) => { const R = mulberry(8600 + i * 7); return { ts: -28 + i * 1.45 + R() * .8, v: 3.4 + R() * 1.4, z0: [11, 15, 45.5, 49.5, 13, 47.5][i % 6] + R(), zl: -5 + R() * 11, c: bmCostume(8600 + i * 7), i }; });
function scCampInto(t, list) {
  if (t > 17.2 || !scNear(SC_CAMP.x, SC_CAMP.z, 300)) return;
  const fx = SC_CAMP.x, bt = scBeat(t, SC_CAMP.ph), pulse = Math.pow(1 - bt, 3);
  // the shade structure: a frame of poles under a silver shade-cloth roof, a scalloped valance along the front
  const p0 = P(fx - 8, 0, SC_CAMP.z); if (p0[2] > 1) list.push({ z: p0[2], draw: () => scShade(t, pulse), shadow: () => shadowOf([[fx - 15, 4.6, 17], [fx - 2, 5.2, 17], [fx - 15, 4.6, 43], [fx - 2, 5.2, 43]], t) });
  // speaker stacks facing the open playa
  for (const z of [14.6, 45.4]) { const p = P(fx - .4, 0, z); if (p[2] > 1) list.push({ z: p[2], draw: () => scStack(fx - .9, z, pulse), shadow: () => shadowOf([[fx - 1.6, 0, z - .8], [fx - .1, 0, z + .8], [fx - 1.6, 3.4, z - .8], [fx - .1, 3.4, z + .8]], t) }); } // either side of the canopy, bracketing the dance floor
  // feather flags along the frontage
  for (const [X, Z, h, col] of SC_FLAGS) { const p = P(X, 0, Z); if (scScreen(p, 300)) list.push({ z: p[2], draw: () => scFlag(X, Z, h, col, t), shadow: () => shadowStick(X, 0, h, Z, .5, t) }); }
  // the last dancers, facing the speakers (we see their backs from the playa side)
  for (const d of SC_DANCE) { const p = P(d.X, 0, d.Z); if (!scScreen(p, 100)) continue;
    list.push({ z: p[2], draw: () => { const q = P(d.X, 0, d.Z), k = kAt(q), u = scBeat(t + d.ph * SC_BEAT, SC_CAMP.ph), bob = .06 * Math.abs(Math.sin(Math.PI * u)), sw = Math.sin((t - SC_CAMP.ph) / SC_BEAT * Math.PI + d.i);
      const hands = d.mv === 0 ? [[-.38 + .08 * sw, 1.9 + bob + .15 * Math.abs(sw)], [.38 + .08 * sw, 1.9 + bob + .15 * Math.abs(sw)]]           // both up, waving
        : d.mv === 1 ? [[-.25, .85 + bob], [.3, lerp(1.5, 2.15, Math.pow(1 - u, 2)) + bob]]                                                      // a fist pumping on the beat
        : d.mv === 2 ? [[-.45 + .1 * sw, 1.25 + bob], [.45 + .1 * sw, 1.25 + bob - .1 * sw]] : [[-.2 + .05 * sw, 1.15 + bob], [.2 + .05 * sw, 1.15 + bob]];
      scFig(q[0] + sw * .05 * k, q[1], k, d.c, { view: C.x > d.X ? 'back' : 'front', bob, hands, step: sw * .6, t }); }, shadow: () => scFigShadow(d.X, d.Z, t, 1.9) }); }
  // bikes streaming out of the camp gaps onto the open playa, toward the car's lane
  for (const r of SC_OUT) { const s = r.v * (t - r.ts); if (s < 0 || s > 220) continue; const X = fx - 1 + s, Z = lerp(r.z0, r.zl, smooth(s / 95)), d = Math.sign(P(X + 1, 0, Z)[0] - P(X, 0, Z)[0]) || 1;
    bmRiderEntry(X, Z, d, s, t, r.c, list); }
}
function scShade(t, pulse) {
  const fx = SC_CAMP.x, x0 = fx - 15, x1 = fx - 2, zs = [17, 30, 43], yb = 4.6, yf = 5.2, sag = (z) => .4 * Math.sin(((z - 17) / 13 % 1) * Math.PI);
  // back camp behind the canopy: a shipping container and a dome tent
  scBox(x0 - 7, x0 - 1, 0, 2.6, 19, 21.4, ['#8a4a2c', '#a85a34', '#9a5232', '#7a4026', '#8f4c2e']);
  const dm = P(x0 - 5, 0, 37); if (dm[2] > 1) { const k = kAt(dm); g.fillStyle = '#d9d2c2'; g.beginPath(); g.ellipse(dm[0], dm[1], 2.6 * k, 2.4 * k, 0, Math.PI, TAU); g.fill(); g.strokeStyle = 'rgba(90,80,70,.5)'; g.lineWidth = Math.max(1, .05 * k); for (const a of [.3, .5, .7]) { g.beginPath(); g.ellipse(dm[0], dm[1], 2.6 * k * Math.abs(Math.cos(a * Math.PI)), 2.4 * k, 0, Math.PI, TAU); g.stroke(); } }
  // poles
  for (const z of zs) for (const [x, y] of [[x0, yb], [x1, yf]]) scSeg([x, 0, z], [x, y, z], .14, '#5d5650');
  // the DJ booth under the front edge, a DJ in a fur hat behind it, string lights still on from the night
  scBox(x1 - 2.2, x1 - .8, 0, 1.15, 27.6, 32.4, ['#2a2622', '#3a342e', '#4a423a', '#2f2a26', '#2f2a26']);
  const dj = P(x1 - 2.6, 0, 30); if (dj[2] > 1) scFig(dj[0], dj[1], kAt(dj), SC_DJ, { view: C.x > x1 - 2.6 ? 'front' : 'back', bob: .04 * pulse, hands: [[-.3, 1.15], [.32, 1.2 + .25 * pulse]], t });
  // the roof: shade cloth in strips so it sags between the poles
  const under = C.y < yf; const cloth = under ? '#8f8e88' : '#cfcec6';
  for (let i = 0; i < 8; i++) { const za = lerp(17, 43, i / 8), zb = lerp(17, 43, (i + 1) / 8);
    poly([P(x0, yb - sag(za), za), P(x1, yf - sag(za), za), P(x1, yf - sag(zb), zb), P(x0, yb - sag(zb), zb)], i % 2 ? cloth : (under ? '#878680' : '#c6c5bd')); }
  // the valance: scallops hanging off the front edge
  const val = []; for (let i = 0; i <= 26; i++) { const z = lerp(17, 43, i / 26); val.push(P(x1 + .05, yf - sag(z), z)); }
  for (let i = 26; i >= 0; i--) { const z = lerp(17, 43, i / 26); val.push(P(x1 + .05, yf - sag(z) - .55 - (i % 2 ? .22 : 0), z)); }
  poly(val, '#b8452f');
  // string lights along the valance: warm dots, fading out as the sun climbs
  const la = .9 * (1 - ease(t, 4, 15)); if (la > .05) { g.fillStyle = `rgba(255,214,140,${la})`; for (let i = 0; i < 30; i++) { const z = lerp(17.4, 42.6, i / 29), q = P(x1 + .1, yf - sag(z) - .62 - .12 * Math.sin(i * 1.3), z); if (q[2] < 1) continue; const r = Math.max(1.2, .08 * kAt(q)); g.beginPath(); g.arc(q[0], q[1], r, 0, TAU); g.fill(); } }
}
const SC_DJ = bmCostume(8091, { hat: 'fluff', fur: true, coat: ['#f6f0e2', '#b3a690'], trim: '#f6f0e2' });
function scStack(x, z, pulse) { // two subs and a top box, cones facing +x (the open playa)
  const boxes = [[0, 1.05, 1.4], [1.08, 2.13, 1.4], [2.16, 2.86, 1.1], [2.89, 3.45, 1.1]];
  for (const [y0, y1, w] of boxes) {
    scBox(x - .7, x + .5, y0, y1, z - w / 2, z + w / 2, ['#1a181c', '#222026', '#34323a', '#1e1c22', '#1e1c22']);
    if (C.x <= x + .5) continue; // the cones only show from the playa side
    const cones = y1 - y0 > .8 ? [[(y0 + y1) / 2, 0, .4]] : [[(y0 + y1) / 2, -.22, .2], [(y0 + y1) / 2, .22, .2]];
    for (const [cy, cz, r] of cones) { const pr = r * (1 + .05 * pulse), pts = [], pin = []; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; pts.push(P(x + .51, cy + Math.sin(a) * pr, z + cz + Math.cos(a) * pr)); pin.push(P(x + .51, cy + Math.sin(a) * pr * .35, z + cz + Math.cos(a) * pr * .35)); }
      poly(pts, '#3a3840'); poly(pin, '#121014'); }
  }
}
function scFlag(X, Z, h, col, t) { // a feather flag on a bent pole, flapping
  const b = P(X, 0, Z), top = P(X, h, Z); if (b[2] < 1) return; const k = kAt(b); seg(b, top, .05 * k, '#3a3028');
  const n = 8, L = [], R = []; for (let i = 0; i <= n; i++) { const u = i / n, y = lerp(h * .45, h, u), q = P(X, y, Z), wv = .2 * n1(31 + X, t * 1.6 + u * 2) * u, w = (.85 - .35 * (1 - Math.sin(u * Math.PI * .9))) * kAt(q);
    L.push([q[0], q[1], 9]); R.push([q[0] + (w + wv * kAt(q)), q[1] + .25 * kAt(q) * u * u, 9]); }
  g.fillStyle = col; g.beginPath(); L.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); for (let i = 0; i < L.length; i++) { const m = [lerp(L[i][0], R[i][0], .55), lerp(L[i][1], R[i][1], .55)]; i ? g.lineTo(m[0], m[1]) : g.moveTo(m[0], m[1]); } for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath(); g.fill();
}

// ---------- 2. instrumental 1: the sky painter (Von Ulrich) ----------
// A 10 x 6 m canvas flat on poles, painted in the sky's own colours (it is filled with the very gradient the sky behind it
// is drawn with, so at first it is all but invisible), and a suit on a 4 m stepladder rolling it beige, a stroke on
// every second beat, the last band done just as the sax comes in; on 65.0 he turns to look at the sax rider.
const SC_PNT = { c: [78, -28], n: [-.944, .328], w: 10, y0: 1.2, y1: 7.2, bands: 8, done0: 4, ph: 56.111, lad: 2.5 }; // faces the drone's 62.4 framing
const scPW = (s, y, d) => [SC_PNT.c[0] - SC_PNT.n[1] * s + SC_PNT.n[0] * d, y, SC_PNT.c[1] + SC_PNT.n[0] * s + SC_PNT.n[1] * d]; // canvas frame: s across, d out of its face
const scStrokeT = (j) => SC_PNT.ph + 7 * SC_BEAT + (j - SC_PNT.done0) * 2 * SC_BEAT; // band j starts on a beat (60.34, 61.54, 62.75, 63.96)
function scPaintAt(t, j) { if (j < SC_PNT.done0) return 1; return ease(t, scStrokeT(j), scStrokeT(j) + 1.15); } // how far down band j is painted
function scRoller(t) { // where the roller is: [s, y] on the canvas
  const { y0, y1, bands } = SC_PNT, bw = SC_PNT.w / bands, s0 = -SC_PNT.w / 2; let j = SC_PNT.done0; while (j < bands - 1 && t > scStrokeT(j) + 1.15) j++;
  const st = scStrokeT(j), u = (t - st) / 1.15;
  if (u < 0) { const jp = j - 1, v = jp < SC_PNT.done0 ? 1 : clamp((t - scStrokeT(jp) - 1.15) / (st - scStrokeT(jp) - 1.15)); return [s0 + (jp + .5 + v) * bw, lerp(y0 + .3, y1 - .2, smooth(v)) + .3 * Math.sin(v * Math.PI)]; }
  if (u <= 1) return [s0 + (j + .5) * bw, lerp(y1 - .2, y0 + .3, smooth(u))];
  return [s0 + (j + .5) * bw, y0 + .3 + Math.min(1, (u - 1) * .6) * .4];
}
const SC_TURN = 65.0;
function scPainterInto(t, list) {
  if (t < 40 || t > 112 || !scNear(SC_PNT.c[0], SC_PNT.c[1], 160)) return; const { y0, y1, w } = SC_PNT;
  const p = P(SC_PNT.c[0], 0, SC_PNT.c[1]); if (!scScreen(p, 1600)) return;
  list.push({ z: p[2], draw: () => scPainter(t), shadow: () => { shadowOf([scPW(-w / 2, y0, 0), scPW(w / 2, y0, 0), scPW(-w / 2, y1, 0), scPW(w / 2, y1, 0)], t);
    for (const s of [-w / 2 + .2, 0, w / 2 - .2]) { const q = scPW(s, 0, -.2); shadowStick(q[0], 0, y0, q[2], .12, t); } shadowOf([scPW(SC_PNT.lad - .5, 0, 1.3), scPW(SC_PNT.lad + .5, 0, 1.3), scPW(SC_PNT.lad, 6.3, 1.1)], t); } });
}
function scPainter(t) {
  const { y0, y1, bands, w } = SC_PNT, bw = w / bands, s0 = -w / 2, behind = (C.x - SC_PNT.c[0]) * SC_PNT.n[0] + (C.z - SC_PNT.c[1]) * SC_PNT.n[1] < 0; // seen from behind: plain canvas back
  const hy = H / 2 - C.f * Math.tan(C.p), [top, low] = skyCols(t), W3 = (s, y, d) => P(...scPW(s, y, d));
  // the poles behind the flat, and its guy lines to capped rebar stakes (yellow caps: real playa practice)
  for (const s of [s0 + .2, 0, -s0 - .2]) scSeg(scPW(s, 0, -.15), scPW(s, y1 + .4, -.15), .12, '#7b5a3a');
  for (const s of [s0 + .2, -s0 - .2]) { scSeg(scPW(s, y1 - .3, -.15), scPW(s, 0, -4.5), .02, '#4a4038'); const st = W3(s, 0, -4.5); if (st[2] > 1) { const k = kAt(st); g.fillStyle = '#e8c23a'; g.beginPath(); g.arc(st[0], st[1] - .1 * k, Math.max(1.5, .09 * k), 0, TAU); g.fill(); } }
  const quad = (sa, sb, ya, yb) => [W3(sa, ya, 0), W3(sb, ya, 0), W3(sb, yb, 0), W3(sa, yb, 0)];
  if (behind) { poly(quad(s0, -s0, y0, y1), '#d9cfbd'); return; }
  // the canvas: the sky's own gradient, in screen space, so it lines up with the sky behind it
  const sg = g.createLinearGradient(0, Math.min(hy - 900, 0), 0, hy); sg.addColorStop(0, rgb(top)); sg.addColorStop(.75, rgb(mix(top, low, .55))); sg.addColorStop(1, rgb(low));
  poly(quad(s0, -s0, y0, y1), sg);
  // beige bands, each painted top down on its stroke; the roller leaves a slightly darker edge and the odd drip
  for (let j = 0; j < bands; j++) { const a = scPaintAt(t, j); if (a <= 0) continue; const sa = s0 + j * bw, sb = sa + bw + (j < bands - 1 ? .02 : 0), yb = lerp(y1, y0, a);
    poly(quad(sa, sb, yb, y1), '#e2c48e'); const e1 = W3(sa + .03, yb, 0), e2 = W3(sa + .03, y1, 0); seg(e1, e2, .05 * kAt(e1), 'rgba(170,130,80,.35)');
    if (a >= 1 && j % 3 !== 1) { const dx = sa + bw * (.3 + .4 * rnd(j, 7)), dl = .25 + .5 * rnd(j, 8) * ease(t, scStrokeT(j) + 1, scStrokeT(j) + 3), d1 = W3(dx, y0 + .02, 0), d2 = W3(dx, y0 - dl, 0); seg(d1, d2, .07 * kAt(d1), '#e2c48e'); } }
  // a thin frame edge so the flat is just there
  const fr = quad(s0, -s0, y0, y1); if (ok(fr)) { g.strokeStyle = 'rgba(120,96,70,.55)'; g.lineWidth = Math.max(1, .04 * kAt(fr[0])); g.beginPath(); fr.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.stroke(); }
  // the stepladder (4 m A-frame): back legs, then the painter, then the front legs
  const L = SC_PNT.lad, lt = 4, rails = (dd) => { for (const ds of [-.42, .42]) scSeg(scPW(L + ds * 1.25, 0, dd), scPW(L + ds * .7, lt, 1.02), .07, '#bfc3c8'); };
  rails(.45); for (let i = 1; i <= 4; i++) { const u = i / 4.6, dd = lerp(.45, 1.02, u), hw = .42 * lerp(1.25, .7, u); scSeg(scPW(L - hw, lt * u, dd), scPW(L + hw, lt * u, dd), .04, '#9ea3a8'); }
  // the roller on its long pole
  const [rs, ry] = scRoller(t), turn = clamp((t - SC_TURN) / .45), sq = Math.cos(turn * Math.PI), front = turn > .5;
  const feet = W3(L, 3.05, 1.15); if (feet[2] < 1) return; const k = kAt(feet), hands = front ? [[-.32, 1.15], [.28, 1.45]] : [[-.12, 2.0 + .1 * Math.sin(t * 3)], [.14, 1.75 + .1 * Math.sin(t * 3)]];
  const hw = [feet[0] + hands[1][0] * k * sq, feet[1] - hands[1][1] * k], rp = W3(rs, ry, .12);
  const rl = front ? [feet[0] + .2 * k, feet[1] - 3.3 * k] : [rp[0], rp[1]]; // turned: he holds the pole upright beside him
  g.strokeStyle = '#8f6d48'; g.lineWidth = Math.max(1, .045 * k); g.lineCap = 'round'; g.beginPath(); g.moveTo(hw[0], hw[1] + .2 * k); g.lineTo(rl[0], rl[1]); g.stroke();
  const rr = front ? null : [W3(rs - .6, ry, .12), W3(rs + .6, ry, .12)]; if (rr && ok(rr)) { seg(rr[0], rr[1], .2 * kAt(rr[0]), '#d9b880'); seg(rr[0], rr[1], .1 * kAt(rr[0]), '#e2c48e'); }
  else if (front) { g.fillStyle = '#d9b880'; g.fillRect(rl[0] - .6 * k, rl[1] - .1 * k, 1.2 * k, .2 * k); }
  scSuit(feet[0], feet[1], k, { front, sq, hands });
  rails(1.6); scSeg(scPW(L - .4, 3.0, 1.0), scPW(L + .4, 3.0, 1.0), .08, '#9ea3a8'); // the top step under his feet
}

// ---------- 3. "build more" jails: the playa build crew ----------
// A yellow scissor lift (2 x 1 m base, its platform up to 4 m) with two suits in white hard hats bolting a cell onto its
// stilts, four more on the ground; on "more" the whole unit is stamped out again and again in a row toward the city.
const SC_CREW = (() => { const j = wt(9, 'jails'); return { X: carX(j) - 4, Z: 27, more: wt(9, 'more'), jail: j, ph: 84.553, n: 9, gap: 5.4 }; })();
const scLiftH = (t) => lerp(1.2, 3.45, ease(t, 89.9, 90.85)); // the platform tops out just under the cell floor (5.6 m)
function scCrewInto(t, list) {
  if (t < 30 || !scNear(SC_CREW.X, SC_CREW.Z, 170)) return; const { X, Z, n, gap, more } = SC_CREW; // the site is there all day; the lift goes up on "build"
  for (let i = 0; i <= n; i++) { const u = i ? easeOutBack(clamp((t - more - (i - 1) * .085) / .38), 1.3) : 1; if (u <= .001) continue;
    const XX = X - i * gap, ZZ = Z + i * .35, p = P(XX, 0, ZZ); if (!scScreen(p, 260)) continue;
    list.push({ z: p[2], draw: () => scUnit(XX, ZZ, t, u, i), shadow: () => { shadowStick(XX, 0, 5.6 * u + 2.8, ZZ, 2.6 * u, t); shadowOf([[XX - 1, 0, ZZ - 1.6], [XX + 1, 0, ZZ - 1.6], [XX - 1, scLiftH(t) * u, ZZ - 1.6], [XX + 1, scLiftH(t) * u, ZZ - 1.6]], t); } }); }
  // the ground crew at the first cell: two steady the stilts, one reads the plan, one points the row out toward the city
  const G = [[-1.6, -2.3, 'leg'], [1.6, -2.3, 'leg'], [-3.6, -4.6, 'plan'], [3.3, -5.2, 'point']];
  G.forEach(([dx, dz, job], i) => { const XX = X + dx, ZZ = Z + dz, p = P(XX, 0, ZZ); if (!scScreen(p, 150)) return;
    list.push({ z: p[2], draw: () => { const q = P(XX, 0, ZZ), k = kAt(q); scSuit(q[0], q[1], k, scCrewPose(job, t, i, C.z < ZZ)); }, shadow: () => scFigShadow(XX, ZZ, t, 2.05) }); });
}
function scCrewPose(job, t, i, front) {
  const bt = Math.pow(1 - scBeat(t, SC_CREW.ph), 2), mo = ease(t, SC_CREW.more - .2, SC_CREW.more + .25);
  if (job === 'leg') return { front, hat: 'hard', hands: [[i ? .05 : -.25, 1.65], [i ? .25 : -.05, 1.15]] };
  if (job === 'plan') return { front, hat: 'hard', hands: [[-.3, 1.2], [.3, 1.2]], prop: () => { const tilt = .1 * Math.sin(t * .8); bmFill([[-.42, 1.08 + tilt], [.42, 1.08 - tilt], [.42, 1.48 - tilt], [-.42, 1.48 + tilt]], '#3f6fa8'); bmLine([[-.3, 1.2], [.25, 1.36]], .015, '#e8eef4'); bmLine([[-.3, 1.36], [.1, 1.36]], .015, '#e8eef4'); } };
  // the foreman: points up at the cell, then on "more" sweeps his arm out along the row
  const up = [.42, 2.15 + .05 * bt], out = [-.75, 1.75];
  return { front, hat: 'hard', hands: [[-.25, .85], [lerp(up[0], out[0], mo), lerp(up[1], out[1], mo)]] };
}
function scUnit(X, Z, t, u, i) { // one cell on stilts, the scissor lift under it and its two bolting suits (i > 0: a stamped copy)
  const p = P(X, 0, Z); if (p[2] < 1) return; const k = kAt(p);
  cage(p, k * u, .8);
  const lh = scLiftH(t) * u, bz = Z - 1.7, yel = '#e8b51e', yelD = '#b88a12', yelL = '#f4cf4a';
  // base and wheels
  scBox(X - 1, X + 1, .15, .65 * u, bz - .5, bz + .5, [yelD, yelD, yelL, yel, yel]);
  for (const wx of [-.75, .75]) { const w = P(X + wx, .15, bz - .52); if (w[2] > 1) { g.fillStyle = '#1c1a1e'; g.beginPath(); g.arc(w[0], w[1], Math.max(1, .15 * kAt(w)), 0, TAU); g.fill(); } }
  // the scissor arms: three stages of crossed bars on the near face
  const zf = C.z < bz ? bz - .45 : bz + .45, y0 = .65 * u, st = 3;
  for (let s = 0; s < st; s++) { const ya = lerp(y0, lh, s / st), yb = lerp(y0, lh, (s + 1) / st); scSeg([X - .9, ya, zf], [X + .9, yb, zf], .09, '#3a3836'); scSeg([X + .9, ya, zf], [X - .9, yb, zf], .09, '#3a3836'); }
  // the platform and its railing
  scBox(X - 1.1, X + 1.1, lh, lh + .18, bz - .55, bz + .55, [yelD, yelD, yelL, yel, yel]);
  for (const [a, b] of [[[-1.1, -.55], [1.1, -.55]], [[-1.1, .55], [1.1, .55]], [[-1.1, -.55], [-1.1, .55]], [[1.1, -.55], [1.1, .55]]]) scSeg([X + a[0], lh + 1.05, bz + a[1]], [X + b[0], lh + 1.05, bz + b[1]], .05, yelD);
  for (const [a, b] of [[-1.1, -.55], [1.1, -.55], [-1.1, .55], [1.1, .55]]) scSeg([X + a, lh + .18, bz + b], [X + a, lh + 1.05, bz + b], .05, yelD);
  // two suits on the platform, wrenches up at the cell floor; they turn the bolts on every beat, all copies in step
  const bt = scBeat(t, SC_CREW.ph), crank = Math.sin(bt * Math.PI) * .12;
  for (const dx of [-.5, .5]) { const f = P(X + dx, lh + .18, bz), fk = kAt(f) * u, front = C.z < bz;
    scSuit(f[0], f[1], fk, { front, hat: 'hard', hands: [[dx < 0 ? -.3 : .05, 2.1 + crank], [dx < 0 ? -.05 : .3, 2.2 - crank]],
      prop: () => { const hx = dx < 0 ? -.05 : .05; bmLine([[hx, 2.2 - crank], [hx + (dx < 0 ? .25 : -.25), 2.35 + crank]], .05, '#8f949c'); } }); }
}

// ---------- 4. instrumental 2: the ballot ants (Dali) ----------
// A column of burners in dark coats and head-bopper antennae carries a 4 m paper ballot overhead across the car's road.
// From the ground it is a playa procession; from 10 m up it is ants carrying off a crumb.
const SC_ANT = { X: 165, n: 26, gap: 1.1, v: 1.3, t0: 117, z0: 5.4, ahead: 9, carry: 8 }; // the ballot crosses z -6 at 117.8, 0 at 122.4: under the drone's 118.6-121.6 framings
const SC_ANTC = [...Array(26)].map((_, i) => bmCostume(9300 + i * 11, { coat: [['#2a2420', '#141210'], ['#1c1a1e', '#0e0d10'], ['#3a3048', '#1e1828'], ['#4a2a1e', '#241208']][i % 4], hat: 'bopper', lens: ['#e05a3a', '#f0b030', '#e05a3a'][i % 3], legs: '#1c1a1e', para: null, flag: null, trim: '#2a2420', spots: false }));
const scAntX = (z) => SC_ANT.X + 1.1 * Math.sin(z * .3 + 1); // the trail wanders like an ant trail
function scAntHead(t) { return SC_ANT.z0 + SC_ANT.v * (t - SC_ANT.t0); }
function scAntBallot(t) { const z = scAntHead(t) - (SC_ANT.ahead - 1) * SC_ANT.gap - 2.5; return [scAntX(z), z]; }
function scAntPos(t, i) { // a file in front, eight carriers in pairs under the ballot, a file behind
  const { ahead, carry, gap } = SC_ANT, head = scAntHead(t);
  if (i < ahead) { const z = head - i * gap; return [scAntX(z) + .2 * Math.sin(i * 2.1), z]; }
  const [bx, bz] = scAntBallot(t);
  if (i < ahead + carry) { const j = i - ahead, z = bz + [-1.05, -.35, .35, 1.05][j >> 1] + .08 * Math.sin(j); return [bx + (j % 2 ? 1.25 : -1.25), z]; }
  const z = bz - 2.5 - (i - ahead - carry) * gap; return [scAntX(z) + .2 * Math.sin(i * 2.1), z];
}
function scAntsInto(t, list) {
  if (t < 112 || t > 128 || !scNear(SC_ANT.X, 0, 140)) return; const { ahead, carry } = SC_ANT;
  for (let i = 0; i < SC_ANT.n; i++) { const [X, Z] = scAntPos(t, i), p = P(X, 0, Z); if (!scScreen(p, 120)) continue; const cr = i >= ahead && i < ahead + carry;
    list.push({ z: p[2], draw: () => { const q = P(X, 0, Z), k = kAt(q), st = (t * SC_ANT.v / .7 + i * .9) * Math.PI, d = Math.sign(P(X, 0, Z + 1)[0] - q[0]) || 1;
      scFig(q[0], q[1], k, SC_ANTC[i], { view: 'side', d, step: st, bob: .03 * Math.abs(Math.sin(st)), hands: cr ? [[-.08, 2.1], [.14, 2.12]] : [[-.2 + .12 * Math.sin(st), .85], [.2 - .12 * Math.sin(st), .85]], t }); },
      shadow: () => scFigShadow(X, Z, t, cr ? 2.15 : 1.85) }); }
  // the ballot: flat overhead, tipped a little toward a low camera, rocking with the carriers' steps
  const [cx, cz] = scAntBallot(t), rock = .06 * Math.sin(t * 4.3), dn = Math.hypot(C.x - cx, C.z - cz) || 1, dx = (C.x - cx) / dn, dz = (C.z - cz) / dn, tip = lerp(.42, .1, clamp((C.y - 3) / 6));
  const corner = (a, b) => [cx + a * 2, 2.18 + rock * a - (a * 2 * dx + b * 1.3 * dz) * tip, cz + b * 1.3]; // the far edge lifted toward a low camera
  const p = P(cx, 0, cz); if (scScreen(p, 400)) list.push({ z: p[2] - 1.4, draw: () => scBallot(corner), shadow: () => shadowOf([[cx - 2, 2.18, cz - 1.3], [cx + 2, 2.18, cz - 1.3], [cx - 2, 2.18, cz + 1.3], [cx + 2, 2.18, cz + 1.3]], t) });
}
function scBallot(corner) {
  const q = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)].map((c) => P(...c)); if (!ok(q)) return;
  poly(q, '#f6f1e4', 'rgba(60,50,40,.5)', Math.max(1, .03 * kAt(q[0])));
  const at = (a, b) => P(...corner(a, b)), k = kAt(at(0, 0));
  // the box and the X, the same mark as the ballots at the burn
  const bx = [at(-.55, -.62), at(.55, -.62), at(.55, .62), at(-.55, .62)]; poly(bx, null, '#2a2420', Math.max(1.5, .07 * k));
  seg(at(-.42, -.47), at(.42, .47), .2 * k, '#1d1a18'); seg(at(.42, -.47), at(-.42, .47), .2 * k, '#1d1a18');
}

// ---------- 5. "wars / bets": the bungee dome ----------
// The real thing: a geodesic dome of dark steel, burners clinging all over the outside, two fighters in harnesses on
// bungees bashing each other with foam bats. Here the fighters are suits; on "bets" a suit with a chalk slate takes bets.
const SC_DOME = { x: 200, z: -32, r: 6 };
const SC_DOME_GEO = (() => { // a 3-frequency geodesic hemisphere: points and struts
  const f = (1 + Math.sqrt(5)) / 2, V = [[-1, f, 0], [1, f, 0], [-1, -f, 0], [1, -f, 0], [0, -1, f], [0, 1, f], [0, -1, -f], [0, 1, -f], [f, 0, -1], [f, 0, 1], [-f, 0, -1], [-f, 0, 1]];
  const F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  const th = -Math.atan2(1, f), rot = ([x, y, z]) => [x, y * Math.cos(th) - z * Math.sin(th), y * Math.sin(th) + z * Math.cos(th)]; // a vertex straight up
  const nrm = (v) => { const n = Math.hypot(...v); return v.map((c) => c / n); }, pts = [], key = (v) => v.map((c) => Math.round(c * 1e4)).join(','), idx = new Map(), edges = new Set();
  const add = (v) => { v = nrm(v); const kk = key(v); if (!idx.has(kk)) { idx.set(kk, pts.length); pts.push(v); } return idx.get(kk); };
  const N = 3; for (const [a, b, c] of F) { const A = V[a], B = V[b], Cc = V[c], id = [];
    for (let i = 0; i <= N; i++) { id.push([]); for (let j = 0; j <= N - i; j++) { const u = i / N, w = j / N, v = [0, 1, 2].map((d) => A[d] * (1 - u - w) + B[d] * u + Cc[d] * w); id[i].push(add(rot(v))); } }
    for (let i = 0; i <= N; i++) for (let j = 0; j <= N - i; j++) { const e = (p, q) => edges.add(p < q ? p + '_' + q : q + '_' + p); if (j < N - i) e(id[i][j], id[i][j + 1]); if (i < N && j < N - i) e(id[i][j], id[i + 1][j]); if (i < N && j > 0) e(id[i][j], id[i + 1][j - 1]); } }
  const keep = (p) => p[1] > -.08, E = [...edges].map((s) => s.split('_').map(Number)).filter(([a, b]) => keep(pts[a]) && keep(pts[b]));
  return { pts: pts.map((p) => [p[0], Math.max(0, p[1]), p[2]]), E };
})();
const SC_CLING = (() => { const R = mulberry(9501), out = []; // on the steep sides, leaving the side the drone comes from (-x) open so the fight shows
  for (let i = 0; i < 30; i++) { const win = i < 3, az = win ? Math.PI + (i - 1) * .5 : Math.PI + .8 + (i - 3) / 27 * (TAU - 1.6) + R() * .12, el = win ? .06 + R() * .08 : .1 + R() * .5;
    out.push({ az, el, c: bmCostume(9600 + i * 5), i }); } return out; })();
const SC_BETTOR = bmCostume(9690, {});
function scDomeInto(t, list) {
  if (t < 130 || t > 146 || !scNear(SC_DOME.x, SC_DOME.z, 150)) return; const p = P(SC_DOME.x, 0, SC_DOME.z); if (!scScreen(p, 900)) return;
  list.push({ z: p[2], draw: () => scDome(t), shadow: () => scDomeShadow(t) });
  // the bookie just outside the dome on the side the drone comes in from, a chalk slate, two burners handing him chips
  const bx = SC_DOME.x - 4.8, bz = SC_DOME.z + 7.4, pb = P(bx, 0, bz); if (scScreen(pb, 200)) list.push({ z: pb[2], draw: () => scBookie(t, bx, bz), shadow: () => { scFigShadow(bx, bz, t, 2.4); scFigShadow(bx + 1.1, bz + .4, t); scFigShadow(bx - 1.2, bz + .6, t); } });
}
function scDomeShadow(t) { // the dome throws a lattice, not a blob: every strut's own shadow, and the clingers'
  const a = shadowA(t); if (a < .01) return; const sv = sunVec(t), { x: cx, z: cz, r } = SC_DOME, G = SC_DOME_GEO, col = `rgba(52,34,58,${a})`;
  const sp = G.pts.map((q) => shadowPt(cx + q[0] * r, q[1] * r, cz + q[2] * r, sv)); if (!sp.every((q) => q[2] > 1)) return; const k = kAt(sp[0]);
  g.strokeStyle = col; g.lineWidth = Math.max(1, .1 * k); g.lineCap = 'round'; g.beginPath(); for (const [i, j] of G.E) { g.moveTo(sp[i][0], sp[i][1]); g.lineTo(sp[j][0], sp[j][1]); } g.stroke();
}
function scDome(t) {
  const { x: cx, z: cz, r } = SC_DOME, G = SC_DOME_GEO, W3 = (p) => [cx + p[0] * r, p[1] * r, cz + p[2] * r], toCam = [C.x - cx, C.z - cz];
  const isBack = (p) => p[0] * toCam[0] + p[2] * toCam[1] < 0, strut = (a, b) => scSeg(W3(G.pts[a]), W3(G.pts[b]), .09, '#6b6f78');
  const cl = (back) => { for (const m of SC_CLING) { const n = [Math.cos(m.az) * Math.cos(m.el), Math.sin(m.el), Math.sin(m.az) * Math.cos(m.el)]; if (isBack(n) !== back) continue;
    const q = P(cx + n[0] * (r + .3), n[1] * r - .9, cz + n[2] * (r + .3)); if (q[2] < 1) continue; const k = kAt(q), sw = Math.sin(t * 2.2 + m.i);
    scFig(q[0], q[1], k, m.c, { view: back ? 'front' : 'back', hands: [[-.35, 1.85 + .1 * sw], [.35, 1.95 - .1 * sw]], bob: 0, step: .5, t }); } };
  // back struts, the far clingers (seen through the dome), the fight, the near struts and clingers
  for (const [a, b] of G.E) if (isBack(G.pts[a]) && isBack(G.pts[b])) strut(a, b);
  cl(true);
  scFight(t);
  for (const [a, b] of G.E) if (!(isBack(G.pts[a]) && isBack(G.pts[b]))) strut(a, b);
  cl(false);
}
function scFight(t) { // two suits in harnesses on bungees from the top of the dome, foam bats; they meet on "wars"
  const { x: cx, z: cz, r } = SC_DOME, wars = wt(21, 'wars'), apex = [cx, r - .15, cz], hit2 = wars + 4 * SC_BEAT;
  const meet = Math.max(Math.exp(-(((t - wars) / .42) ** 2)), .8 * Math.exp(-(((t - hit2) / .42) ** 2)));
  // the dome's cross axis on screen: the fighters swing along whichever horizontal axis is most across the frame
  const ax = Math.abs(C.cy) > .5 ? [1, 0] : [0, 1], F = [-1, 1].map((s) => { const swing = Math.sin(t * 3.1 + (s > 0 ? 1.7 : 0)) * .9, off = s * lerp(2.3 + swing * .5, .55, meet), bounce = .45 * Math.sin(t * 4.2 + s) * (1 - meet * .7);
    return { s, hip: [cx + ax[0] * off, 2.9 + bounce, cz + ax[1] * off] }; });
  F.forEach((f) => { f.p = P(...f.hip); }); if (F.some((f) => f.p[2] < 1)) return;
  for (const f of F) {
    const { s, hip, p: hp } = f, k = kAt(hp), other = F.find((o) => o !== f).p, face = Math.sign(other[0] - hp[0]) || s;
    // the bungee: two cords from the top to the harness
    const ap = P(apex[0] + ax[0] * s * .4, apex[1], apex[2] + ax[1] * s * .4); g.strokeStyle = '#2a2622'; g.lineWidth = Math.max(1, .035 * k); g.beginPath(); g.moveTo(ap[0], ap[1]); g.lineTo(hp[0] - .1 * k, hp[1] - .85 * k); g.moveTo(ap[0], ap[1]); g.lineTo(hp[0] + .1 * k, hp[1] - .85 * k); g.stroke();
    // the bat: raised behind the head, then brought down over the top onto the other bat on the word
    const ba = lerp(2.0 + .25 * Math.sin(t * 5 + s), .35, meet), hand = [.3, 1.75], feetY = hp[1] + .9 * k;
    scSuit(hp[0], feetY, k, { front: true, sq: face * .85, hands: [[-.22, 1.0 + .1 * Math.sin(t * 6)], hand],
      prop: () => { const [hx, hy] = hand, cxA = Math.cos(ba), syA = Math.sin(ba); bmLine([[hx, hy], [hx + cxA * .28, hy + syA * .28]], .05, '#4a4a52'); bmLine([[hx + cxA * .28, hy + syA * .28], [hx + cxA * 1.15, hy + syA * 1.15]], .17, s > 0 ? '#e8b23a' : '#d8452f'); bmDot(hx + cxA * 1.15, hy + syA * 1.15, .085, s > 0 ? '#e8b23a' : '#d8452f'); } });
    // the harness straps over the jacket
    g.strokeStyle = '#1c1a1e'; g.lineWidth = Math.max(1, .05 * k); g.beginPath(); g.moveTo(hp[0] - .2 * k, hp[1] - .8 * k); g.lineTo(hp[0] + .2 * k, hp[1] - .1 * k); g.moveTo(hp[0] + .2 * k, hp[1] - .8 * k); g.lineTo(hp[0] - .2 * k, hp[1] - .1 * k); g.stroke();
  }
  // the bonk: a puff of playa dust and foam crumbs where the bats meet (never a flash)
  for (const th of [wars, hit2]) { const u = (t - th) / .7; if (u < 0 || u > 1) continue; const q = P(cx, 4.3, cz); if (q[2] < 1) continue; const k = kAt(q);
    g.fillStyle = `rgba(214,196,160,${.6 * (1 - u)})`; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; g.beginPath(); g.arc(q[0] + Math.cos(a) * u * 1.4 * k, q[1] + Math.sin(a) * u * .9 * k, (.3 + .3 * u) * k, 0, TAU); g.fill(); }
    g.fillStyle = `rgba(232,178,58,${.8 * (1 - u)})`; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + .3; g.fillRect(q[0] + Math.cos(a) * u * 2 * k, q[1] + Math.sin(a) * u * 1.4 * k - u * u * .8 * k, .12 * k, .12 * k); } } // foam crumbs fly
}
function scBookie(t, bx, bz) { // taking bets all through the fight (a tally mark a beat), the slate thrust up high on "bets"
  const bets = wt(22, 'bets'), t0 = wt(21, 'wars') - 1, up = .55 * ease(t, t0 - .4, t0) + .45 * ease(t, bets - .35, bets + .1), q = P(bx, 0, bz), k = kAt(q), front = C.z > bz;
  const marks = clamp(Math.floor((t - t0) / SC_BEAT) + 1, 0, 9), beat = Math.pow(1 - scBeat(t, 134.241), 3);
  const slate = () => { const sy = lerp(1.2, 2.35, up), w = .66, h = .48, x0 = -.05 - w / 2; bmFill([[x0, sy], [x0 + w, sy], [x0 + w, sy + h], [x0, sy + h]], '#8f6d48'); bmFill([[x0 + .04, sy + .04], [x0 + w - .04, sy + .04], [x0 + w - .04, sy + h - .04], [x0 + .04, sy + h - .04]], '#2c302e');
    for (let i = 0; i < marks; i++) { const grp = Math.floor(i / 5), j = i % 5, mx = x0 + .1 + grp * .3 + j * .055; if (j < 4) bmLine([[mx, sy + .12], [mx, sy + .34]], .022, '#ecebe4'); else bmLine([[mx - .24, sy + .14], [mx - .02, sy + .32]], .022, '#ecebe4'); } };
  scSuit(q[0], q[1], k, { front, hands: [[-.3, lerp(1.25, 2.4, up)], [.22, lerp(1.25, 2.4, up) - .05 * beat]], prop: slate });
  // two burners pushing chips at him, one on each beat
  for (const [dx, dz, sd] of [[1.1, .4, 9701], [-1.2, .6, 9702]]) { const p = P(bx + dx, 0, bz + dz); if (p[2] < 1) continue; const kk = kAt(p), reach = t < t0 - .4 ? 0 : .5 + .5 * beat, side = dx > 0 ? -1 : 1;
    scFig(p[0], p[1], kk, bmCostume(sd), { view: 'front', hands: [[-.25, .85], [side * (.2 + .45 * reach), lerp(.9, 1.45, reach)]], t });
    const hx = p[0] + side * (.2 + .45 * reach) * kk, hy = p[1] - lerp(.9, 1.45, reach) * kk; g.fillStyle = '#d8452f'; g.beginPath(); g.ellipse(hx, hy - .05 * kk, .07 * kk, .03 * kk, 0, 0, TAU); g.fill(); g.fillStyle = '#f2ede0'; g.fillRect(hx - .02 * kk, hy - .07 * kk, .04 * kk, .015 * kk); }
}

// ---------- 6. refrain 3 "spin": the bike-light spiral ----------
// Bikes really do follow art cars. Forty riders with lights on their wheels trail the board, and on "spin" they swing out
// round it in a spiral arm; inner riders lap faster, so the arm winds up like a galaxy. After the giant gavel they scatter.
const SC_SPIN = { s: wt(34, "spin"), n: 40, v: 6.6 };
const SC_SPINR = [...Array(40)].map((_, i) => ({ c: bmCostume(9800 + i * 3, { para: null, flag: i % 5 === 0 ? { h: 3.2, col: ['#d8452f', '#e8b23a', '#2f6fb5'][i % 3], col2: '#1c1a1e' } : null }), led: scLED[i % scLED.length], r: 6.5 + i * .42, th: Math.PI + i * .12, i }));
function scSpinPos(t, b) { // polar round the car: from the trailing pack each rider rides off round it at the same speed, so
  // the inner ones lap faster and the pack winds itself into a spiral arm (no rider ever jumps or cuts across)
  const cx = carX(t), gv = (typeof gavelT === 'function' ? gavelT() : 195.02);
  const j = b.i >> 1, side = b.i % 2 ? 1 : -1, fx = side * (7.5 + j * 2.1 + 45 * (1 - ease(t, 184.5, 189))), fz = side * (2.4 + .4 * Math.sin(t * .9 + b.i)); // one file trailing the car, one riding ahead of it (they catch up with it first)
  const rf = Math.hypot(fx, fz), tf = Math.atan2(fz, fx), dt = t - (SC_SPIN.s - 3.2), ramp = 1.2;
  const sDist = dt <= 0 ? 0 : dt < ramp ? SC_SPIN.v * dt * dt / (2 * ramp) : SC_SPIN.v * (dt - ramp / 2), pull = smooth(dt / 2.4);
  const ro = lerp(rf, 7.8 + (rf - 7.5) * .33, pull), rr = ro + Math.pow(Math.max(0, t - gv), 1.6) * 7, th = tf - sDist / ro; // the files wind into two spiral arms, never closer than the chairs
  return [cx + Math.cos(th) * rr, Math.sin(th) * rr];
}
const scSpinA = (t) => ease(t, 184.5, 185.5) * (1 - ease(t, 196.2, 197.6));
function scSpinInto(t, list) {
  const a = scSpinA(t); if (a <= 0) return;
  for (const b of SC_SPINR) { const [X, Z] = scSpinPos(t, b), [X2, Z2] = scSpinPos(t + .05, b), p = P(X, 0, Z); if (!scScreen(p, 120)) continue; const d = Math.sign(P(X2, 0, Z2)[0] - p[0]) || 1;
    list.push({ z: p[2], draw: () => { const q = P(X, 0, Z); bmRider(q[0], q[1], kAt(q), d, t * SC_SPIN.v, t, b.c, a * bmFade(q)); }, shadow: () => bmRiderShadow(X, Z, b.c, t) }); }
}
function scSpinFront(t) { // after the grade: the wheel lights and their light trails, so the spiral reads from up high
  const a = scSpinA(t); if (a <= 0) return; g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round';
  for (const b of SC_SPINR) { const pts = []; for (let j = 0; j < 9; j++) { const [X, Z] = scSpinPos(t - j * .09, b), q = P(X, .35, Z); if (q[2] < 1) break; pts.push(q); } if (pts.length < 2 || !scScreen(pts[0], 80)) continue;
    const k = kAt(pts[0]); g.strokeStyle = `rgba(${b.led},${.32 * a})`; g.lineWidth = Math.max(1.5, .16 * k); g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke();
    g.fillStyle = `rgba(${b.led},${.55 * a})`; for (const off of [-.55, .55]) { g.beginPath(); g.arc(pts[0][0] + off * k * .9, pts[0][1] - .1 * k, Math.max(1.5, .2 * k), 0, TAU); g.fill(); } }
  g.restore();
}

// ---------- 7. sunset: the howl (Nakamura) ----------
// Burners howl at the sunset (a real playa habit). Sixteen stop, tip their heads back and spread their arms; the sun is
// so low that their shadows run 11 m toward the camera, and together they draw one 22 m howling head on the playa:
// neck at their feet, ears back, muzzle up (away from them), mouth open. The voice the board gagged comes back.
const SC_HOWL = (() => { const sd = sunDir(198), u = [sd[0], sd[1]], v = [-u[1], u[0]], F0 = [280.5, -12.8]; // the head lies round (286, -22), down the drone's 198.9-201 golden wide
  const ppl = [...Array(16)].map((_, j) => { const s = -3.4 + j * .45, a = .7 * Math.sin(j * 1.7); return { X: F0[0] + v[0] * s + u[0] * a, Z: F0[1] + v[1] * s + u[1] * a, c: bmCostume(9900 + j * 7), j }; });
  // the head's outline in shadow coordinates: s along the shadow (m from their feet), w across it
  // a howling wolf's head, drawn as the low drone sees it down the shadows (across, up), then stretched 2.5x along the
  // shadow to undo the foreshortening: neck at their feet, ear laid back, muzzle thrown up, jaws open. 22 m long.
  const prof = [[3.4, 0], [3.2, 3.0], [3.6, 5.2], [4.6, 6.4], [6.0, 8.8], [2.9, 6.9], [1.6, 7.1], [.2, 7.1], [-2.6, 8.6], [-3.6, 9.2], [-4.0, 8.6],
    [-.7, 6.3], [-4.1, 6.9], [-4.3, 6.4], [-2.3, 5.4], [-1.3, 4.2], [-2.0, 2.0], [-3.4, 0]];
  const head = prof.map(([X, Y]) => [Y * 2.4, -X]); // s along the shadow, w across it (+w is screen left from the golden wide)
  return { u, v, F0, ppl, head };
})();
const scHowlAmt = (t) => ease(t, 196.4, 197.3) * (1 - ease(t, 202.5, 203.6));
function scHowlInto(t, list) {
  if (t < 186 || t > 206 || !scNear(SC_HOWL.F0[0], SC_HOWL.F0[1], 200)) return; const h = scHowlAmt(t);
  for (const m of SC_HOWL.ppl) { const p = P(m.X, 0, m.Z); if (!scScreen(p, 100)) continue;
    list.push({ z: p[2], draw: () => { const q = P(m.X, 0, m.Z), k = kAt(q), hu = h * (1 - .15 * Math.sin(t * 2 + m.j)), sw = Math.sin(t * 1.3 + m.j * 2);
      const hands = [[lerp(-.24, -.78, hu), lerp(.82, 1.62, hu) + .04 * sw], [lerp(.24, .78, hu), lerp(.82, 1.62, hu) - .04 * sw]];
      scFig(q[0], q[1], k, m.c, { view: C.z < m.Z ? 'back' : 'front', hands, tip: hu, bob: .02 * sw * (1 - hu), t, alpha: ease(t, 186, 187.5) * (1 - ease(t, 204.5, 206)) }); }, shadow: () => {} }); }
  // one list item carries every shadow, filled as one path so the head and the sixteen stick shadows join without seams
  const c = P(SC_HOWL.F0[0], 0, SC_HOWL.F0[1]); list.push({ z: c[2] + 30, draw: () => {}, shadow: () => scHowlShadow(t, h) });
}
function scHowlShadow(t, h) {
  // Dali: the howl's shadow outlasts the sun by a second, so it still reads as the light goes
  const a = Math.max(shadowA(t), .3 * h * (1 - ease(t, 200.1, 201.3))); if (a < .01) return; const sv = sunVec(t), { u, v, F0, ppl, head } = SC_HOWL, polys = [];
  for (const m of ppl) { const hu = h * (1 - .15 * Math.sin(t * 2 + m.j)), arm = lerp(.25, .8, hu), ay = lerp(.85, 1.62, hu);
    const pts = [[m.X - .25, 0, m.Z], [m.X + .25, 0, m.Z], [m.X - .12, 1.85 - .07 * hu, m.Z], [m.X + .12, 1.85 - .07 * hu, m.Z], [m.X - arm, ay, m.Z], [m.X + arm, ay, m.Z]];
    polys.push(hull(pts.map(([X, Y, Z]) => shadowPt(X, Y, Z, sv)))); }
  if (h > .02) { const L = .5 + .5 * h, Wd = Math.sqrt(h); polys.push(head.map(([s, w]) => P(F0[0] + u[0] * s * L + v[0] * w * Wd, 0, F0[1] + u[1] * s * L + v[1] * w * Wd))); }
  g.beginPath(); let ref = 0;
  for (const ps of polys) { if (!ok(ps)) continue; let ar = 0; for (let i = 0; i < ps.length; i++) { const p = ps[i], n = ps[(i + 1) % ps.length]; ar += p[0] * n[1] - n[0] * p[1]; } if (!ref) ref = Math.sign(ar) || 1;
    const seq = Math.sign(ar) === ref ? ps : ps.slice().reverse(); seq.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); }
  g.fillStyle = `rgba(52,34,58,${Math.min(.62, a * 1.3)})`; g.fill('nonzero');
}

// ---------- hooks (render.js) ----------
function scenesInto(t, list) { scCampInto(t, list); scPainterInto(t, list); scCrewInto(t, list); scAntsInto(t, list); scDomeInto(t, list); scSpinInto(t, list); scHowlInto(t, list); }
function scenesFront(t) { scSpinFront(t); }
