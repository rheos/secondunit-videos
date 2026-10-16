// Reform Party, Dali look: lyric installations on the playa.
// ---------- lyric installations on the playa ----------
// Von Ulrich: give the idea a body. A monumental ear on crutches listens from "every tape recorder" on; the recorders stack on its lobe.
function bigEar(t, list) { const s = wt(2, 'every'); if (t < s - .3) return; const X = carX(s) + 14, Z = 24, grow = easeOutBack(clamp((t - s + .3) / 1.1));
  list.push({ z: P(X, 0, Z)[2], draw: () => { const p = P(X, 0, Z); if (p[2] < 1) return; const k = kAt(p) * grow, x = p[0], y = p[1], h = 9 * k;
    for (const d of [-1, 1]) { g.strokeStyle = PAL.crutch; g.lineWidth = Math.max(1, .25 * k); g.beginPath(); g.moveTo(x + d * 2.6 * k, y); g.lineTo(x + d * 1.4 * k, y - h * .55); g.stroke(); g.lineWidth = Math.max(1, .4 * k); g.strokeStyle = '#e9dcc2'; g.beginPath(); g.moveTo(x + d * 1.4 * k - .7 * k, y - h * .55); g.lineTo(x + d * 1.4 * k + .7 * k, y - h * .55); g.stroke(); }
    const eg = g.createRadialGradient(x - 1.2 * k, y - h * .78, .3 * k, x, y - h * .6, 5 * k); eg.addColorStop(0, '#f6d7bd'); eg.addColorStop(1, '#c58a6a'); g.fillStyle = eg;
    g.beginPath(); g.moveTo(x - .4 * k, y - h * .3); g.bezierCurveTo(x - 3.4 * k, y - h * .45, x - 3.2 * k, y - h * 1.08, x, y - h); g.bezierCurveTo(x + 2.6 * k, y - h * .95, x + 2.4 * k, y - h * .62, x + 1 * k, y - h * .52); g.bezierCurveTo(x + .2 * k, y - h * .45, x + 1 * k, y - h * .3, x - .4 * k, y - h * .3); g.fill();
    g.strokeStyle = '#9c5f45'; g.lineWidth = Math.max(1, .3 * k); g.beginPath(); g.moveTo(x - 1.6 * k, y - h * .5); g.bezierCurveTo(x - 2.1 * k, y - h * .9, x + 1.6 * k, y - h * 1.0, x + 1 * k, y - h * .7); g.bezierCurveTo(x + .4 * k, y - h * .6, x - .6 * k, y - h * .7, x - .3 * k, y - h * .55); g.stroke();
    const n = Math.floor(clamp((t - s) / 2.5) * 6); for (let i = 0; i < n; i++) { g.fillStyle = '#3a3a40'; g.fillRect(x - 1.3 * k + (i % 3) * .8 * k, y - h * .3 - (1 + Math.floor(i / 3)) * .45 * k, .7 * k, .42 * k); g.fillStyle = '#d8d0bc'; g.beginPath(); g.arc(x - 1.1 * k + (i % 3) * .8 * k, y - h * .3 - (.8 + Math.floor(i / 3)) * .45 * k, .1 * k, 0, TAU); g.arc(x - .8 * k + (i % 3) * .8 * k, y - h * .3 - (.8 + Math.floor(i / 3)) * .45 * k, .1 * k, 0, TAU); g.fill(); } },
    shadow: () => shadowStick(X, 0, 9 * grow, Z, 3 * grow, t) }); }
// a mouth sculpture with a padlock through its lips, on "gag order"
function gagMouth(t, list) { const s = L_(2).s; if (t < s - .2) return; const X = carX(s) - 12, Z = 30, grow = easeOutBack(clamp((t - s + .2) / .9));
  list.push({ z: P(X, 0, Z)[2], draw: () => { const p = P(X, 0, Z); if (p[2] < 1) return; const k = kAt(p) * grow, x = p[0], y = p[1] - 5 * k;
    g.strokeStyle = '#6b4a2a'; g.lineWidth = Math.max(1, .3 * k); g.beginPath(); g.moveTo(x, p[1]); g.lineTo(x, y + 1.2 * k); g.stroke();
    g.fillStyle = '#c0322a'; g.beginPath(); g.moveTo(x - 3 * k, y); g.bezierCurveTo(x - 1.5 * k, y - 1.6 * k, x - .3 * k, y - .9 * k, x, y - .6 * k); g.bezierCurveTo(x + .3 * k, y - .9 * k, x + 1.5 * k, y - 1.6 * k, x + 3 * k, y); g.bezierCurveTo(x + 1.5 * k, y + 1.7 * k, x - 1.5 * k, y + 1.7 * k, x - 3 * k, y); g.fill();
    g.strokeStyle = '#6a1712'; g.lineWidth = Math.max(1, .12 * k); g.beginPath(); g.moveTo(x - 3 * k, y); g.quadraticCurveTo(x, y + .35 * k, x + 3 * k, y); g.stroke();
    g.strokeStyle = '#b8b4aa'; g.lineWidth = Math.max(1, .18 * k); g.beginPath(); g.arc(x, y + .1 * k, .45 * k, Math.PI, TAU); g.stroke(); g.fillStyle = '#c9a43a'; g.fillRect(x - .6 * k, y + .1 * k, 1.2 * k, .9 * k); },
    shadow: () => shadowStick(X, 0, 6.5 * grow, Z, 4 * grow, t) }); }
// newspapers tumble across the playa on every "news"
function tumblePapers(t, list) { for (const li of [4, 11, 32]) { const s = L_(li).s; if (t < s - .5 || t > L_(li).e + 3) continue; const base = carX(s);
  for (let i = 0; i < 6; i++) { const X = base - 30 + (t - s) * 7 + i * 6, Z = 6 + i * 5, Y = Math.abs(Math.sin((t - s) * 3 + i)) * 1.2;
    const p = P(X, Y + .4, Z); if (p[2] < 1) continue; list.push({ z: p[2], draw: () => { const k = kAt(p); g.save(); g.translate(p[0], p[1]); g.rotate((t - s) * 4 + i); g.fillStyle = '#ece6d6'; g.fillRect(-.45 * k, -.3 * k, .9 * k, .6 * k); g.fillStyle = 'rgba(120,110,95,.5)'; for (let c = 0; c < 3; c++) g.fillRect((-.38 + c * .27) * k, -.2 * k, .2 * k, .4 * k); g.restore(); }, shadow: () => {} }); } } }
// a dust devil rises on every "spin"
function spinDevils(t) { for (const li of [6, 13, 19, 34]) { const s = wt(li, 'spin'); const amt = ease(t, s - .3, s + 1) * (1 - ease(t, s + 5, s + 7)); if (amt > 0) dustDevil(carX(s) + 16, 28, t, amt, li); } dustDevil(carX(clamp(t, 14, 238)) - 45 + ((t * 3) % 90), 95, t, .6 * (1 - nightAmt(t)), 3); }
// Gilliam, crowds of copies: a column of identical suits rolls across on wheels in each refrain and nods as one on "rehearsed"
function suitColumn(t, list) { const wins = [[L_(4).s, L_(6).e], [L_(11).s, L_(13).e], [L_(30).s - .5, L_(34).e]];
  for (const [s, e] of wins) { if (t < s || t > e) continue; const base = carX(s), v = 2.6;
    for (let i = 0; i < 16; i++) { const X = base - 40 + (t - s) * (v + 1.6) - i * 2.2, Z = 13; const p = P(X, 0, Z); if (p[2] < 1.5 || p[0] < -80 || p[0] > W + 80) continue;
      list.push({ z: p[2], draw: () => { const k = kAt(p), x = p[0], y = p[1], hop = (Math.floor((t - s) * 4) % 2) * .08 * k, nod = t > L_(30).s && t < L_(30).e ? Math.abs(Math.sin((t - L_(30).s) * 1.6 * Math.PI)) * .06 * k : 0;
        g.fillStyle = '#141216'; g.beginPath(); g.arc(x - .2 * k, y - .15 * k, .15 * k, 0, TAU); g.arc(x + .2 * k, y - .15 * k, .15 * k, 0, TAU); g.fill();
        g.fillStyle = PAL.suit; g.fillRect(x - .22 * k, y - 1.05 * k - hop, .44 * k, .8 * k); g.fillRect(x - .26 * k, y - 1.75 * k - hop, .52 * k, .72 * k);
        g.fillStyle = '#f4efe6'; g.beginPath(); g.moveTo(x - .08 * k, y - 1.75 * k - hop); g.lineTo(x, y - 1.45 * k - hop); g.lineTo(x + .08 * k, y - 1.75 * k - hop); g.fill(); rosette(x - .15 * k, y - 1.62 * k - hop, .04 * k);
        egg(x, y - 1.95 * k - hop + nod, k, true, 0); }, shadow: () => shadowStick(X, 0, 2, Z, .5, t) }); } } }
// a soft clock art car: its face droops over its cart; on "once upon a time" its hands run backward
function clockCar(t, list) { const X = -10 + t * 1.42, Z = 42; const p = P(X, 0, Z); if (p[2] < 2 || p[0] < -300 || p[0] > W + 300) return;
  list.push({ z: p[2], draw: () => { const k = kAt(p), x = p[0], y = p[1], m = .4 + melt(t) * .8, back = wt(15, 'time'), hands = t < back ? t * .2 : back * .2 - ease(t, back, back + 3) * 25;
    g.fillStyle = '#4a3a2c'; g.fillRect(x - 3 * k, y - 1.6 * k, 6 * k, 1.2 * k); g.fillStyle = '#17120f'; g.beginPath(); g.arc(x - 2 * k, y - .4 * k, .4 * k, 0, TAU); g.arc(x + 2 * k, y - .4 * k, .4 * k, 0, TAU); g.fill();
    const cy = y - 4.2 * k, R = 2.6 * k; g.fillStyle = '#e8d9a8'; g.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU, sag = Math.max(0, Math.sin(a)) * m * 2.2 * k * (.5 + .5 * Math.cos(a * 2)); const px = x + Math.cos(a) * R, py = cy + Math.sin(a) * R + sag; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); g.fill(); g.strokeStyle = '#b08a3a'; g.lineWidth = .18 * k; g.stroke();
    g.fillStyle = '#3a2a1a'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.fillRect(x + Math.cos(a) * R * .8 - .08 * k, cy + Math.sin(a) * R * .8 - .08 * k + Math.max(0, Math.sin(a)) * m * 1.2 * k, .16 * k, .16 * k); }
    g.strokeStyle = '#1a1412'; g.lineCap = 'round'; for (const [len, sp, w] of [[1.5, 1, .18], [2.1, 12, .1]]) { const a = hands * sp - Math.PI / 2; g.lineWidth = w * k; g.beginPath(); g.moveTo(x, cy); g.lineTo(x + Math.cos(a) * len * k, cy + Math.sin(a) * len * k); g.stroke(); } },
    shadow: () => shadowStick(X, 0, 7, Z, 5, t) }); }
// Gilliam, lie about scale: chess pieces the size of art cars on "knight to queen's rook"
function giantChess(t, list) { const s = L_(26).s, e = L_(27).e + .3; if (t < s - .3 || t > e) return; const base = carX(s), up = easeOutBack(clamp((t - s + .3) / .7)) * (1 - ease(t, e - .6, e)), foul = ease(t, wt(27, 'foul'), wt(27, 'foul') + .6);
  const pieces = [{ X: base + 16, Z: 20, kind: 'knight', col: '#1d1a1a' }, { X: base - 14, Z: 26, kind: 'rook', col: '#efe6cf' }, { X: base + 4, Z: 34, kind: 'rook', col: '#1d1a1a' }];
  for (const pc of pieces) { const p = P(pc.X, 0, pc.Z); if (p[2] < 1.5) continue; list.push({ z: p[2], draw: () => { const k = kAt(p) * up, x = p[0], y = p[1]; g.save(); g.translate(x, y); if (pc.kind === 'rook' && pc.col === '#efe6cf') g.rotate(foul * 1.4); g.fillStyle = pc.col;
    if (pc.kind === 'rook') { g.fillRect(-1.6 * k, -6 * k, 3.2 * k, 6 * k); g.fillRect(-2 * k, -7 * k, 4 * k, 1.2 * k); for (let i = 0; i < 3; i++) g.fillRect((-2 + i * 1.5) * k, -8 * k, 1 * k, 1 * k); g.fillRect(-2.2 * k, -.8 * k, 4.4 * k, .8 * k); }
    else { g.beginPath(); g.moveTo(-2.2 * k, 0); g.lineTo(2.2 * k, 0); g.lineTo(1.3 * k, -3 * k); g.quadraticCurveTo(3 * k, -5 * k, .5 * k, -8 * k); g.lineTo(-2.4 * k, -5.6 * k); g.lineTo(-.2 * k, -5 * k); g.lineTo(-1.3 * k, -3 * k); g.fill(); }
    g.restore(); }, shadow: () => shadowStick(pc.X, 0, 8 * up, pc.Z, 3 * up, t) }); } }
// Gilliam, stop it from above, once: a giant gavel drops out of the sky at the end of the last refrain
function bigGavel(t) { const s = L_(34).e - .5; if (t < s - .6 || t > s + 2.5) return; const X = carX(s) + 12, Z = 14, drop = t < s ? 1 - ((t - s + .6) / .6) ** 2 : 0, lift = ease(t, s + 1.1, s + 2.4);
  const yAir = (drop + lift) * 40, p = P(X, yAir, Z), pg = P(X, 0, Z); if (p[2] < 1) return; const k = kAt(p);
  g.save(); g.translate(p[0], p[1]); g.rotate(-.15); g.fillStyle = '#5a3418'; g.fillRect(-.6 * k, -12 * k, 1.2 * k, 12 * k); const hg = g.createLinearGradient(-4 * k, 0, 4 * k, 0); hg.addColorStop(0, '#9a5a2a'); hg.addColorStop(1, '#4a2410'); g.fillStyle = hg; g.fillRect(-4.5 * k, -2.6 * k, 9 * k, 2.6 * k); g.fillStyle = '#c9a43a'; g.fillRect(-4.5 * k, -1.8 * k, .5 * k, 1 * k); g.fillRect(4 * k, -1.8 * k, .5 * k, 1 * k); g.restore();
  const puff = t > s ? ease(t, s, s + .2) * (1 - ease(t, s + .4, s + 1.6)) : 0; if (puff > 0) { const kg = kAt(pg); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI, r = (4 + (t - s) * 10) * kg; g.fillStyle = `rgba(220,190,140,${.35 * puff})`; g.beginPath(); g.ellipse(pg[0] + Math.cos(a + Math.PI) * r, pg[1] - Math.sin(a) * r * .25, 2.5 * kg, 1 * kg, 0, 0, TAU); g.fill(); } } }
// the pie of lies: blackbirds burst out on "pie" (four and twenty, near enough)
function pieBirds(t) { const s = wt(23, 'pie'); if (t < s || t > s + 2.4) return;
  for (let i = 0; i < 9; i++) { const u = clamp((t - s - i * .06) / 2); if (u <= 0) continue; const p = PL(-.15 + (rnd(i, 31) - .5) * .4 + u * (rnd(i, 32) - .5) * 8, TOP + .1 + u * 4, -.95 - u * 2); if (p[2] < .3) continue; const k = kAt(p), f = Math.sin(t * 30 + i) * .25 * k;
    g.fillStyle = '#16131a'; g.beginPath(); g.ellipse(p[0], p[1], .14 * k, .07 * k, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] - .3 * k, p[1] - f); g.lineTo(p[0] - .1 * k, p[1] + .02 * k); g.lineTo(p[0] + .3 * k, p[1] - f); g.lineTo(p[0] + .1 * k, p[1] + .02 * k); g.fill(); } }
// Nakamura, inhabit the object: tiny burners climb the line chart on the whiteboard (drawn in board units)
function chartClimbers(t) { const pts = [[.58, .8], [.66, .72], [.73, .76], [.8, .58], [.87, .5], [.93, .34]];
  for (let i = 0; i < 3; i++) { const u = ((t * .05 + i / 3) % 1) * 5, j = Math.floor(u), f = u - j, a = pts[j], b = pts[j + 1]; const x = lerp(a[0], b[0], f), y = lerp(a[1], b[1], f) - .012;
    g.fillStyle = ['#d8452f', '#2f6fb5', '#3c8c5a'][i]; g.fillRect(x - .006, y - .03, .012, .03); g.fillStyle = '#e8d4b4'; g.beginPath(); g.arc(x, y - .036, .007, 0, TAU); g.fill(); } }
// the sky blind on "blues" (moved from world.js for draft 3; world.js skyAndGround calls it)
  function blind(t, hy) { // "they want to control the blues": a beige blind rolls down over the blue sky, then snaps back up
    let u = 0; for (const li of REFRAINS) { const c = wt(li, 'control'); u = Math.max(u, ease(t, c - .2, c + .9) * (1 - ease(t, L_(li).e + .1, L_(li).e + .6))); }
    if (u <= 0) return; const y = (hy + 8) * u;
    g.fillStyle = '#cdbf9f'; g.fillRect(0, 0, W, y);
    g.fillStyle = 'rgba(120,95,60,.18)'; for (let x = 0; x < W; x += 90) g.fillRect(x, 0, 2, y);
    const rg = g.createLinearGradient(0, y - 14, 0, y + 10); rg.addColorStop(0, '#6d5a3a'); rg.addColorStop(.5, '#c8a970'); rg.addColorStop(1, '#4b3b25'); g.fillStyle = rg; g.fillRect(0, y - 12, W, 22);
    g.strokeStyle = '#5a4a32'; g.lineWidth = 3; g.beginPath(); g.moveTo(W * .62, y + 10); g.lineTo(W * .62, y + 120); g.stroke();
    g.beginPath(); g.arc(W * .62, y + 134, 14, 0, TAU); g.stroke();
  }
