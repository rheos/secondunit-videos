// Reform Party, Dali look: the burn (the Man, the fire, the dusk crowd, spinners, embers). Split from playa.js for draft 3.
// the party's effigy
const burnAmt = (t) => ease(t, L_(35).s - .8, L_(35).s + 9) * (1 - ease(t, 254, 266) * .75);
const fallAmt = (t) => ease(t, 248.5, 252.5);
function manGeom() { const p = P(MAN.x, 0, MAN.z); return { p, k: kAt(p) }; }
function theMan(t) {
  const { p, k } = manGeom(); if (p[2] < 1) return; const x = p[0], y = p[1], fall = fallAmt(t), arms = ease(t, L_(35).s - 1, L_(35).s + 3);
  g.fillStyle = '#8a6a44'; g.beginPath(); g.moveTo(x - 9 * k, y); g.lineTo(x + 9 * k, y); g.lineTo(x + 4 * k, y - 6 * k); g.lineTo(x - 4 * k, y - 6 * k); g.fill();
  g.strokeStyle = 'rgba(60,40,20,.5)'; g.lineWidth = Math.max(1, .15 * k); for (let i = 1; i < 4; i++) { const yy = y - i * 1.5 * k, hw = 9 - i * 1.25; g.beginPath(); g.moveTo(x - hw * k, yy); g.lineTo(x + hw * k, yy); g.stroke(); }
  g.save(); g.translate(x, y - 6 * k); g.rotate(fall * 1.3); g.translate(0, fall * 4 * k); g.globalAlpha = 1 - ease(t, 252, 254);
  g.strokeStyle = '#6e5232'; g.lineWidth = Math.max(1.5, .45 * k); g.lineCap = 'round';
  g.beginPath(); g.moveTo(-1.6 * k, 0); g.lineTo(-.7 * k, -7 * k); g.moveTo(1.6 * k, 0); g.lineTo(.7 * k, -7 * k); g.stroke();
  // a suit jacket on the effigy, a rosette, arms up on the burn
  g.fillStyle = PAL.suit; g.beginPath(); g.moveTo(-1.5 * k, -7 * k); g.lineTo(-2.2 * k, -12.6 * k); g.lineTo(2.2 * k, -12.6 * k); g.lineTo(1.5 * k, -7 * k); g.fill();
  g.fillStyle = '#f4efe6'; g.beginPath(); g.moveTo(-.6 * k, -12.6 * k); g.lineTo(0, -10.2 * k); g.lineTo(.6 * k, -12.6 * k); g.fill();
  rosette(-1.1 * k, -11.6 * k, .27 * k);
  g.strokeStyle = '#6e5232'; for (const d of [-1, 1]) { const ax = d * lerp(2.6, 3.4, arms) * k, ay = lerp(-8 * k, -16 * k, arms); g.beginPath(); g.moveTo(d * 2 * k, -12.4 * k); g.lineTo(ax, ay); g.stroke(); }
  g.lineWidth = Math.max(1, .3 * k); g.beginPath(); g.moveTo(0, -12.6 * k); g.lineTo(0, -13.4 * k); g.moveTo(0, -13.4 * k); g.lineTo(-1.1 * k, -14.9 * k); g.lineTo(0, -16.6 * k); g.lineTo(1.1 * k, -14.9 * k); g.closePath(); g.stroke();
  g.restore();
}
function manFire(t) {
  const b = burnAmt(t); if (b <= 0) return; const { p, k } = manGeom(); if (p[2] < 1) return; const x = p[0], y = p[1], fall = fallAmt(t);
  g.save(); g.globalCompositeOperation = 'lighter';
  const R = 34 * k * (.6 + .4 * b); const gl = g.createRadialGradient(x, y - 8 * k, 0, x, y - 8 * k, R); gl.addColorStop(0, `rgba(255,170,70,${.55 * b})`); gl.addColorStop(.4, `rgba(255,100,30,${.25 * b})`); gl.addColorStop(1, 'rgba(255,60,10,0)'); g.fillStyle = gl; g.fillRect(x - R, y - 8 * k - R, 2 * R, 2 * R);
  const top = lerp(6, 21, clamp(b * 1.3)) * (1 - fall * .55);
  for (let i = 0; i < 22; i++) { const fx = x + (-7 + i * 14 / 21) * k * (1 - .4 * (1 - clamp(b * 2))), h = (top * (1 - Math.abs(i - 10.5) / 13) + 2) * (.6 + .4 * n1(200 + i, t * 2.6)) * k * clamp(b * 1.5);
    const fg = g.createLinearGradient(0, y, 0, y - h); fg.addColorStop(0, 'rgba(255,230,150,.85)'); fg.addColorStop(.4, 'rgba(255,140,40,.6)'); fg.addColorStop(1, 'rgba(255,60,10,0)'); g.fillStyle = fg;
    g.beginPath(); g.moveTo(fx - 1 * k, y); g.quadraticCurveTo(fx - .5 * k + n1(300 + i, t * 3) * k, y - h * .6, fx + n1(400 + i, t * 2) * 1.2 * k, y - h); g.quadraticCurveTo(fx + .8 * k, y - h * .4, fx + 1 * k, y); g.fill(); }
  const up = clamp((b - .35) / .5); if (up > 0) { g.save(); g.translate(x, y - 6 * k); g.rotate(fall * 1.3); g.translate(0, fall * 4 * k); g.globalAlpha = 1 - ease(t, 252, 254);
    const spots = [[-1.2, -2], [1.2, -2], [-.9, -5], [.9, -5], [0, -8], [-1.5, -10], [1.5, -10], [0, -12], [-2.9, -14], [2.9, -14], [0, -15.5]];
    g.filter = `blur(${Math.max(1, .5 * k).toFixed(1)}px)`; spots.forEach(([fx, fy], i) => { if (-fy / 16 > up * 1.05) return; const h = (3.6 + 1.8 * n1(600 + i, t * 3)) * k, w = (1.7 + .4 * n1(650 + i, t * 2)) * k, X = (fx + .5 * n1(660 + i, t * 1.7)) * k, Y = fy * k;
      const fg = g.createLinearGradient(0, Y + w, 0, Y - h); fg.addColorStop(0, 'rgba(255,220,140,.55)'); fg.addColorStop(.5, 'rgba(255,120,40,.4)'); fg.addColorStop(1, 'rgba(255,60,10,0)'); g.fillStyle = fg;
      g.beginPath(); g.moveTo(X - w, Y + w); g.quadraticCurveTo(X - w * .4 + n1(700 + i, t * 4) * w, Y - h * .5, X + n1(800 + i, t * 3) * w * .8, Y - h); g.quadraticCurveTo(X + w * .6, Y - h * .4, X + w, Y + w); g.fill(); });
    g.restore(); }
  for (let i = 0; i < 40; i++) { const ph = (t * .35 + rnd(i, 9)) % 1, ex = x + (rnd(i, 3) - .5) * 16 * k + n1(500 + i, t) * 3 * k, ey = y - (4 + ph * 30) * k; g.fillStyle = `rgba(255,200,110,${(1 - ph) * .8 * b})`; g.fillRect(ex, ey, Math.max(1.5, .15 * k), Math.max(1.5, .15 * k)); }
  g.restore();
}

const nightAmt = (t) => ease(t, 199, 216);
// the crowd that walks a spiral to the Man at dusk, then rings it; on "we didn't vote" they hold up ballots (Nakamura's route)
const CROWD = [...Array(90)].map((_, i) => ({ a: rnd(i, 11) * TAU, r: 22 + rnd(i, 12) * 14, col: ['#d8452f', '#2f6fb5', '#e8b23a', '#3c8c5a', '#f2ede0', '#7a3c8c'][i % 6], i }));
function crowdInto(t, list) {
  if (t < 192) return; const arrive = ease(t, 194, 214);
  for (const c of CROWD) { const spin = (1 - arrive) * 2.4, a = c.a + spin, r = c.r + (1 - arrive) * 40, X = MAN.x + Math.cos(a) * r, Z = MAN.z + Math.sin(a) * r * .7; if (Z < -20) continue;
    const p = P(X, 0, Z); if (p[2] < 1.5 || p[0] < -100 || p[0] > W + 100) continue;
    list.push({ z: p[2], draw: () => { const k = kAt(p), x = p[0], y = p[1], step = Math.floor(t * 6 + c.i) % 2 * (1 - arrive) * .05 * k, vote = t > L_(35).s ? ease(t, L_(35).s + c.i * .03, L_(35).s + .6 + c.i * .03) : 0;
      g.fillStyle = '#3a3040'; g.fillRect(x - .12 * k, y - .85 * k, .1 * k, .85 * k); g.fillRect(x + .02 * k, y - .85 * k + step, .1 * k, .85 * k - step);
      g.fillStyle = c.col; g.fillRect(x - .2 * k, y - 1.5 * k, .4 * k, .68 * k); g.fillStyle = '#e8d4b4'; g.beginPath(); g.arc(x, y - 1.65 * k, .13 * k, 0, TAU); g.fill();
      if (vote > 0) { const hx = x + .25 * k, hy = y - lerp(1.3, 2.15, vote) * k; g.strokeStyle = c.col; g.lineWidth = .09 * k; g.beginPath(); g.moveTo(x + .15 * k, y - 1.4 * k); g.lineTo(hx, hy); g.stroke(); g.fillStyle = '#fbf7ec'; g.fillRect(hx - .12 * k, hy - .32 * k, .24 * k, .3 * k); g.fillStyle = '#1a1a1a'; g.fillRect(hx - .07 * k, hy - .22 * k, .14 * k, .02 * k); } } });
  }
}
function spinners(t) { // fire spinners in the crowd at night: rings of light on chains
  const n = nightAmt(t); if (n < .3) return; g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) { const c = CROWD[i * 13], a = c.a, X = MAN.x + Math.cos(a) * (c.r - 4), Z = MAN.z + Math.sin(a) * (c.r - 4) * .7, p = P(X, 1.3, Z); if (p[2] < 2) continue; const k = kAt(p);
    for (let j = 0; j < 2; j++) { const ang = t * 9 + j * Math.PI + i, fx = p[0] + Math.cos(ang) * .9 * k, fy = p[1] + Math.sin(ang) * .9 * k; const rg = g.createRadialGradient(fx, fy, 0, fx, fy, .5 * k); rg.addColorStop(0, `rgba(255,210,120,${n})`); rg.addColorStop(1, 'rgba(255,90,20,0)'); g.fillStyle = rg; g.fillRect(fx - .5 * k, fy - .5 * k, k, k);
      g.strokeStyle = `rgba(255,150,60,${.5 * n})`; g.lineWidth = Math.max(1, .12 * k); g.beginPath(); g.arc(p[0], p[1], .9 * k, ang - .9, ang); g.stroke(); } }
  g.restore();
}
function ballotEmbers(t) { // the raised ballots burn and rise in the heat over the Man
  const s = L_(35).s + 2; if (t < s) return; g.save();
  for (let i = 0; i < 46; i++) { const ph = ((t - s) * .12 + rnd(i, 21)) % 1, X = MAN.x + (rnd(i, 22) - .5) * 30, Z = MAN.z + (rnd(i, 23) - .5) * 14, p = P(X + n1(900 + i, t * .4) * 3, 2 + ph * 26, Z); if (p[2] < 2) continue; const k = kAt(p);
    g.translate(p[0], p[1]); g.rotate(t * 1.5 + i); g.fillStyle = `rgba(255,${200 - ph * 120},${140 - ph * 120},${(1 - ph) * .9 * (1 - ease(t, 262, 267))})`; g.fillRect(-.22 * k, -.15 * k, .44 * k, .3 * k); g.setTransform(1, 0, 0, 1, 0, 0); }
  g.restore();
}
