// Reform Party, Dali look: the playa (elephants, poor person, cops, camps, lamps, bikes, dust devils).
// ---------- the playa's other figures ----------
const ELEPHANTS = [{ x: -60, z: 85, v: 1.25, s: 1 }, { x: 40, z: 120, v: 1.0, s: .9, load: 'papers' }, { x: 150, z: 70, v: 1.4, s: 1.1 }, { x: 260, z: 140, v: 1.2, s: .8, load: 'ballot' }, { x: -20, z: 160, v: 1.5, s: .8 }, { x: 10, z: 64, v: 1.7, s: .9, load: 'papers' }, { x: 90, z: 100, v: 1.1, s: 1, load: 'ballot' }, { x: 200, z: 58, v: 1.5, s: .9 }];
function elephant(X, Z, t, s, ph, load) { // a stilt-legged elephant: a small body high on four long spindly legs
  const p = P(X, 0, Z); if (p[2] < 1) return; const k = kAt(p) * s, x = p[0], y = p[1], legH = 10.5, bodyY = y - legH * k, w = Math.sin(t * 1.4 + ph);
  g.strokeStyle = PAL.elephant; g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const hx = x + (-1.3 + (i % 2) * 2.6 + (i > 1 ? .3 : 0)) * k, fx = hx + ((i === 0 || i === 3) ? w : -w) * 1.3 * k; g.lineWidth = Math.max(1, .2 * k);
    g.beginPath(); g.moveTo(hx, bodyY + .6 * k); g.quadraticCurveTo((hx + fx) / 2 + .4 * k, bodyY + legH * .5 * k, fx, y); g.stroke(); }
  const eg = g.createLinearGradient(x - 2.4 * k, 0, x + 2.4 * k, 0); eg.addColorStop(0, PAL.elephantLit); eg.addColorStop(1, PAL.elephant); g.fillStyle = eg;
  g.beginPath(); g.ellipse(x, bodyY - .4 * k, 2.4 * k, 1.35 * k, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(x + 2.4 * k, bodyY - .9 * k, .95 * k, .9 * k, 0, 0, TAU); g.fill();
  g.fillStyle = PAL.elephant; g.beginPath(); g.ellipse(x + 2 * k, bodyY - .7 * k, .55 * k, .85 * k, .3, 0, TAU); g.fill();
  g.strokeStyle = PAL.elephant; g.lineWidth = Math.max(1, .3 * k); g.beginPath(); g.moveTo(x + 3.1 * k, bodyY - .6 * k); g.quadraticCurveTo(x + 3.8 * k, bodyY + .8 * k + w * .3 * k, x + 3.4 * k, bodyY + 2.2 * k); g.stroke();
  if (load === 'papers') { for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#ece6d6' : '#d9d1bd'; g.fillRect(x - 1.1 * k + Math.sin(i * 2.3) * .2 * k, bodyY - (1.75 + i * .38) * k, 2.2 * k, .36 * k); } }
  else if (load === 'ballot') { g.fillStyle = '#efe7d4'; g.fillRect(x - 1.2 * k, bodyY - 4.2 * k, 2.4 * k, 2.4 * k); g.fillStyle = '#1a1a1a'; g.fillRect(x - .7 * k, bodyY - 4.2 * k, 1.4 * k, .18 * k); g.fillStyle = '#fbf7ec'; g.fillRect(x - .35 * k, bodyY - (4.9 - Math.abs(Math.sin(t * 2 + ph)) * .5) * k, .7 * k, .9 * k); }
  else { g.fillStyle = '#e8d9b5'; g.beginPath(); g.moveTo(x - 1 * k, bodyY - 1.6 * k); g.lineTo(x + 1 * k, bodyY - 1.6 * k); g.lineTo(x + .25 * k, bodyY - 5.5 * k); g.lineTo(x - .25 * k, bodyY - 5.5 * k); g.fill(); } // an obelisk on its back
  g.fillStyle = '#c7362b'; g.fillRect(x - 1.2 * k, bodyY - 1.75 * k, 2.4 * k, .3 * k);
}
function elephantsInto(t, list) { for (const e of ELEPHANTS) { const X = e.x + e.v * t; list.push({ z: P(X, 0, e.z)[2], draw: () => elephant(X, e.z, t, e.s, e.x, e.load), shadow: () => { shadowStick(X, 10.5 * e.s, 16 * e.s, e.z, 3 * e.s, t); for (const d of [-1.3, 1.3]) shadowStick(X + d * e.s, 0, 10.5 * e.s, e.z, .35, t); } }); } }
function poorPerson(t, list) { // "when a poor person dared to ask you to share"
  const s = L_(17).s - .4, e = L_(18).e + .5; if (t < s || t > e) return; const X = carX(s) + 9 - (t - s) * .8, Z = -5.5;
  list.push({ z: P(X, 0, Z)[2], draw: () => { const p = P(X, 0, Z), k = kAt(p), x = p[0], y = p[1], st = Math.sin((t - s) * 5), ask = ease(t, L_(17).s, L_(17).s + .5) * (1 - ease(t, L_(18).s + .2, L_(18).s + .6));
    g.strokeStyle = '#4b4a5a'; g.lineWidth = .14 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y - .85 * k); g.lineTo(x - st * .2 * k, y); g.moveTo(x, y - .85 * k); g.lineTo(x + st * .2 * k, y); g.stroke();
    g.fillStyle = '#6b6a78'; g.fillRect(x - .2 * k, y - 1.5 * k, .4 * k, .7 * k); g.fillStyle = '#e8d4b4'; g.beginPath(); g.arc(x, y - 1.65 * k, .13 * k, 0, TAU); g.fill(); g.fillStyle = '#3d3c48'; g.fillRect(x - .16 * k, y - 1.82 * k, .32 * k, .08 * k);
    const hx = x - .45 * k, hy = y - lerp(1.1, 1.75, ask) * k; g.strokeStyle = '#6b6a78'; g.lineWidth = .09 * k; g.beginPath(); g.moveTo(x - .15 * k, y - 1.4 * k); g.lineTo(hx, hy); g.stroke();
    g.fillStyle = '#9a9692'; g.beginPath(); g.ellipse(hx, hy - .03 * k, .14 * k, .06 * k, 0, 0, Math.PI); g.fill(); }, shadow: () => shadowStick(X, 0, 1.8, Z, .4, t) });
}
function cops(t, list) { // "every little G20 cop got paid": a row of riot shields behind the car; coins arc down to them
  const s = L_(28).s; if (t < s - .6) return; const base = carX(s);
  for (let i = 0; i < 7; i++) { const X = base - 7 + i * 2.3, Z = 16 + (i % 2) * 1.5;
    list.push({ z: P(X, 0, Z)[2], draw: () => { const p = P(X, 0, Z), k = kAt(p), x = p[0], y = p[1], up = ease(t, s - .6 + i * .08, s + i * .08); if (up <= 0) return;
      g.save(); g.globalAlpha = up; g.fillStyle = '#1e2026'; g.fillRect(x - .25 * k, y - 1.5 * k, .5 * k, 1.5 * k); g.beginPath(); g.arc(x, y - 1.7 * k, .2 * k, Math.PI, TAU); g.fill(); g.fillRect(x - .22 * k, y - 1.7 * k, .44 * k, .1 * k);
      g.fillStyle = 'rgba(190,200,210,.55)'; g.beginPath(); g.ellipse(x - .1 * k, y - .9 * k, .42 * k, .6 * k, 0, 0, TAU); g.fill(); g.restore();
      const cu = clamp((t - (s + .4 + i * .25)) / .9); if (cu > 0 && cu < 1 && t < s + 6) { const a = PL(-1 + i * .3, TOP + .3, 1.2), q = [lerp(a[0], x, cu), lerp(a[1], y - 1.6 * k, cu) - Math.sin(cu * Math.PI) * 120]; g.fillStyle = '#e8c04a'; g.beginPath(); g.arc(q[0], q[1], Math.max(3, .1 * k), 0, TAU); g.fill(); } },
      shadow: () => { if (t > s) shadowStick(X, 0, 1.9, Z, .5, t); } }); }
}
// ---------- Burning Man: camps, lamps, bikes, crowd (draft 2) ----------
const CAMPS = []; { const R = mulberry(77); for (let X = -90; X < 420; X += 14 + R() * 12) CAMPS.push({ X, Z: 50 + R() * 34, kind: R() < .55 ? 'dome' : 'tent', r: 4 + R() * 4, col: ['#d8452f', '#2f6fb5', '#e8b23a', '#7a3c8c', '#f2ede0'][Math.floor(R() * 5)], flag: R() < .7, seed: Math.floor(R() * 1e4) }); }
function camp(c, t) {
  const p = P(c.X, 0, c.Z); if (p[2] < 2 || p[0] < -600 || p[0] > W + 600) return; const k = kAt(p), x = p[0], y = p[1], r = c.r * k;
  if (c.kind === 'dome') { // a geodesic dome: a half disc with its struts
    const dg = g.createLinearGradient(x - r, 0, x + r, 0); dg.addColorStop(0, '#f4ecdc'); dg.addColorStop(1, '#b9ad98'); g.fillStyle = dg; g.beginPath(); g.arc(x, y, r, Math.PI, TAU); g.fill();
    g.strokeStyle = 'rgba(90,70,50,.55)'; g.lineWidth = Math.max(.6, .06 * k);
    for (let ring = 1; ring <= 3; ring++) { const a = ring / 4 * Math.PI / 2, ry = y - Math.sin(a) * r, rx = Math.cos(a) * r; g.beginPath(); g.moveTo(x - rx, ry); g.lineTo(x + rx, ry); g.stroke(); }
    for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI; g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke(); }
    g.fillStyle = c.col; g.globalAlpha = .55; g.beginPath(); g.arc(x, y, r, Math.PI * 1.15, Math.PI * 1.45); g.lineTo(x, y); g.fill(); g.globalAlpha = 1;
  } else { // a shade tent: poles and a sagging cloth
    g.strokeStyle = '#6d5a44'; g.lineWidth = Math.max(1, .1 * k); for (const d of [-1, 1]) { g.beginPath(); g.moveTo(x + d * r, y); g.lineTo(x + d * r, y - .6 * r); g.stroke(); }
    g.fillStyle = c.col; g.beginPath(); g.moveTo(x - r * 1.1, y - .6 * r); g.quadraticCurveTo(x, y - .45 * r + Math.sin(t + c.seed) * .03 * r, x + r * 1.1, y - .6 * r); g.lineTo(x + r * .9, y - .75 * r); g.quadraticCurveTo(x, y - .6 * r, x - r * .9, y - .75 * r); g.fill();
  }
  if (c.flag) { const fx = x + r * .3, top = y - r * 1.6; g.strokeStyle = '#5a4a3a'; g.lineWidth = Math.max(1, .05 * k); g.beginPath(); g.moveTo(fx, y - r * .8); g.lineTo(fx, top); g.stroke();
    g.fillStyle = ['#d8452f', '#e8b23a', '#2f6fb5'][c.seed % 3]; g.beginPath(); g.moveTo(fx, top); for (let i = 0; i <= 6; i++) { const u = i / 6; g.lineTo(fx + u * 1.6 * k, top + Math.sin(u * 5 - t * 4 + c.seed) * .15 * k + u * .1 * k); } for (let i = 6; i >= 0; i--) { const u = i / 6; g.lineTo(fx + u * 1.6 * k, top + .7 * k + Math.sin(u * 5 - t * 4 + c.seed) * .15 * k - u * .2 * k); } g.fill(); }
}
const LAMPS = []; for (let X = -80; X < 420; X += 20) LAMPS.push({ X, Z: 26 + (X % 40 ? 2 : 0) });
function lamp(l, t, emissive) {
  const p = P(l.X, 0, l.Z); if (p[2] < 2 || p[0] < -200 || p[0] > W + 200) return; const k = kAt(p), x = p[0], y = p[1], top = y - 5 * k;
  if (!emissive) { g.strokeStyle = '#4a3a2c'; g.lineWidth = Math.max(1, .14 * k); g.beginPath(); g.moveTo(x, y); g.lineTo(x, top); g.lineTo(x + .5 * k, top); g.stroke(); g.fillStyle = '#e9dcb8'; g.fillRect(x + .3 * k, top, .45 * k, .6 * k); return; }
  const n = nightAmt(t); if (n <= .1) return; g.save(); g.globalCompositeOperation = 'lighter'; const R = 1.1 * k; const rg = g.createRadialGradient(x + .52 * k, top + .3 * k, 0, x + .52 * k, top + .3 * k, R); rg.addColorStop(0, `rgba(255,214,140,${.6 * n})`); rg.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = rg; g.fillRect(x + .52 * k - R, top + .3 * k - R, 2 * R, 2 * R); g.restore();
}
// bikes: people on wheels (Gilliam's cheat), crossing all day; positions wrap relative to the car so the playa always has traffic
const BIKES = [...Array(14)].map((_, i) => ({ Z: [-16, 14, 20, 32, 40, -19, 9][i % 7] + (i > 6 ? 3 : 0), v: (i % 2 ? 1 : -1) * (2.2 + (i % 5) * .7), off: i * 23, col: ['#d8452f', '#2f6fb5', '#e8b23a', '#3c8c5a', '#f2ede0', '#7a3c8c', '#e07a2f'][i % 7], i }));
function bike(b, t) {
  const X = carX(clamp(t, 14, 238)) + ((((b.v * t + b.off) % 180) + 180) % 180) - 90, p = P(X, 0, b.Z); if (p[2] < 1.5 || p[0] < -150 || p[0] > W + 150) return null;
  return { z: p[2], draw: () => { const k = kAt(p), x = p[0], y = p[1], d = Math.sign(b.v), wr = .34 * k, bob = (Math.floor(t * 8 + b.i) % 2) * .03 * k;
    g.strokeStyle = '#2a2420'; g.lineWidth = Math.max(1, .05 * k); for (const w of [-.55, .55]) { g.beginPath(); g.arc(x + w * k, y - wr, wr, 0, TAU); g.stroke(); }
    g.beginPath(); g.moveTo(x - .55 * k, y - wr); g.lineTo(x, y - .75 * k); g.lineTo(x + .55 * k, y - wr); g.moveTo(x, y - .75 * k); g.lineTo(x + d * .45 * k, y - 1.05 * k); g.stroke();
    g.fillStyle = b.col; g.fillRect(x - .17 * k, y - 1.55 * k - bob, .34 * k, .65 * k); g.fillStyle = '#e8d4b4'; g.beginPath(); g.arc(x + d * .05 * k, y - 1.72 * k - bob, .13 * k, 0, TAU); g.fill();
    g.strokeStyle = b.col; g.lineWidth = .08 * k; g.beginPath(); g.moveTo(x, y - 1.4 * k - bob); g.lineTo(x + d * .45 * k, y - 1.05 * k); g.stroke();
    if (b.i % 3 === 0) { g.fillStyle = '#f2ede0'; g.beginPath(); g.ellipse(x - d * .1 * k, y - 1.86 * k - bob, .28 * k, .06 * k, 0, 0, TAU); g.fill(); } }, shadow: () => shadowStick(X, 0, 1.8, b.Z, .5, t) };
}
function dustDevil(X, Z, t, amt, seed) { // a spinning column of playa dust
  const p = P(X, 0, Z); if (p[2] < 2 || amt <= 0) return; const k = kAt(p), H2 = 14 * amt;
  g.save(); for (let i = 0; i < 26; i++) { const u = i / 26, y = p[1] - u * H2 * k, w = (.6 + u * u * 4) * k, a = t * 6 + u * 9 + seed; g.fillStyle = `rgba(214,182,130,${.16 * amt * (1 - u * .6)})`; g.beginPath(); g.ellipse(p[0] + Math.sin(a) * w * .35 + n1(seed, t + u) * k, y, w, .5 * k, 0, 0, TAU); g.fill(); } g.restore();
}
