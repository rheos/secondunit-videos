// Reform Party, Dali look: lyric installations on the playa.
// Draft 3: escalating blinds, the padlocked ear, the spin whirl, the board-copy parade, the clock car's two visits,
// bigger news, the foul, and the giant gavel landing on the table.
// Anything that must sit in front of the table is drawn on the car layer (installsCar, called from pieBirds at the end
// of drawCar), because the car layer is laid over the whole scene; the rest goes through the depth-sorted list.

// ---------- helpers ----------
const nearCar = (X, Z) => P(X, 0, Z)[2] <= P(CX, 0, CZ)[2]; // nearer the camera than the table's centre
function hold(t, a, b, c, d) { return ease(t, a, b) * (1 - ease(t, c, d)); } // rise a..b, fall c..d
function newspaper(k, i) { // a broadsheet in metres-scaled px, centred on the origin: masthead, photo, columns, redaction bars
  const w = 1.7 * k, h = 1.15 * k;
  g.fillStyle = '#f1ebdc'; g.fillRect(-w / 2, -h / 2, w, h);
  g.fillStyle = '#d9d1bf'; g.fillRect(w / 2 - .05 * k, -h / 2, .05 * k, h); // the fold
  g.fillStyle = '#1d1a18'; g.fillRect(-w / 2 + .08 * k, -h / 2 + .07 * k, w - .16 * k, .17 * k); // masthead
  g.fillStyle = '#6f6a62'; g.fillRect(-w / 2 + .08 * k, -h / 2 + .31 * k, w * .55, .07 * k); // headline
  g.fillStyle = '#9d978c'; g.fillRect(-w / 2 + .08 * k, -h / 2 + .45 * k, w * .38, .5 * k); // photo
  g.fillStyle = 'rgba(90,84,76,.55)'; for (let c = 0; c < 3; c++) for (let r = 0; r < 6; r++) g.fillRect(-w / 2 + .1 * k + w * .42 + c * .32 * k, -h / 2 + .45 * k + r * .09 * k, .26 * k, .035 * k);
  g.fillStyle = '#121010'; g.fillRect(-w / 2 + .05 * k, -h / 2 + .6 * k + (i % 2) * .12 * k, w - .1 * k, .13 * k); // the story is blacked out
}

// ---------- the sky blind: three escalating blinds over the blue, each dropping on "blues" ----------
// refrain 1 a melting canvas roller blind; refrain 2 a venetian blind whose slats tilt shut; refrain 3 a red velvet drape
// that melts on its rail and slides off like a soft watch. Each holds under 2 s; nothing goes below y 975 (caption band).
function blind(t, hy) {
  const Y = Math.min(hy, H), maxY = Math.min(Y + 6, 975);
  for (let r = 0; r < 3; r++) { const b = wt(REFRAINS[r], 'blues'); if (t < b - .1 || t > b + 3.2) continue;
    if (r === 2) { if (!drapeHigh()) drapeBlind(t, b, drapeReach(hy)); continue; } if (maxY < 40) continue;
    if (r === 0) canvasBlind(t, b, maxY); else slatBlind(t, b, maxY); }
}
// draft 9: refrain 3 goes out over the city, so the drape hangs from the top of frame to below the horizon, over the far
// band of camps (more of the frame the higher the drone is), and still reads when the horizon is off the top of frame.
// The city under it is not touched: the drape is the fiction's object, laid over the view for three seconds.
function drapeReach(hy) { const high = clamp((C.y - 4) / 22); return clamp(Math.max(Math.min(hy, H) + 6 + high * 110, H * lerp(.3, .5, high)), 40, 975); }
// The sky pass is painted over by the ground, so when the drone is up over the city at "blues" the drape is drawn as a
// far item in the depth list instead (300 m out): it covers the sky and the band of camps under the horizon, and
// everything nearer (the board, the Man, the art) stands in front of it. Decided once from the flight at "blues", so it
// never switches mode mid-drop. If the drone looks so steeply down that the horizon is off the top of frame, it hangs
// 45 m beyond the board instead, its hem on that ground line.
let drapeMode = null;
function drapeHigh() { if (drapeMode !== null) return drapeMode; const c = camAt(wt(REFRAINS[2], 'blues') + .4, true); return (drapeMode = c.y > 6); }
function drapeInto(t, list) { const b = wt(REFRAINS[2], 'blues'); if (t < b - .1 || t > b + 3.2 || !drapeHigh()) return; const hy = H / 2 - C.f * Math.tan(C.p);
  let z = 300, maxY = (Math.min(hy, H) + 6 + clamp(C.y / 32) * 110) / .69; // the hem's highest point sits below the band of camps
  if (hy < 40) { const Dh = Math.hypot(C.x - CX, C.z - CZ) + 45; z = C.y * SP + Dh * CP; maxY = (H / 2 - C.f * (-C.y * CP + Dh * SP) / z) / .76; }
  list.push({ z, draw: () => drapeBlind(t, b, clamp(maxY, H * .24, 975), true), shadow: null }); }
function canvasBlind(t, b, maxY) {
  const ext = ease(t, b - .05, b + .5) * (1 - ease(t, b + 1.75, b + 2.45)); if (ext <= 0) return;
  const melt = ease(t, b + .25, b + 1.75), D = maxY * .8 * ext, R = mulberry(311);
  const drips = [...Array(13)].map((_, i) => ({ x: (i + .3 + R() * .5) / 13 * W, w: 30 + R() * 50, L: (40 + R() * 150) * melt * ext }));
  const edge = (x) => { let y = D + Math.sin(x * .006 + t * .9) * 12 * ext + Math.sin(x * .017 - t * .5) * 5; for (const d of drips) { const u = (x - d.x) / d.w; if (u > -1 && u < 1) y += d.L * (1 - u * u) ** 2; } return Math.min(y, maxY - 4); };
  // the canvas, a touch translucent so the blue tints it
  g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); for (let x = W; x >= 0; x -= 12) g.lineTo(x, edge(x)); g.closePath();
  const cg = g.createLinearGradient(0, 0, 0, D + 80); cg.addColorStop(0, 'rgba(196,178,140,.94)'); cg.addColorStop(.7, 'rgba(214,196,156,.9)'); cg.addColorStop(1, 'rgba(232,214,170,.82)');
  g.fillStyle = cg; g.fill(); g.clip();
  g.fillStyle = 'rgba(110,86,52,.1)'; for (let x = 70; x < W; x += 150) g.fillRect(x + Math.sin(x) * 8, 0, 3, maxY); // seams
  g.fillStyle = 'rgba(255,248,225,.13)'; for (let x = 0; x < W; x += 150) g.fillRect(x + 30, 0, 50, maxY); // light through the weave
  g.restore();
  g.strokeStyle = 'rgba(120,92,56,.55)'; g.lineWidth = 5; g.beginPath(); for (let x = 0; x <= W; x += 12) x ? g.lineTo(x, edge(x)) : g.moveTo(x, edge(x)); g.stroke(); // the soft wet edge
  g.strokeStyle = 'rgba(120,92,56,.2)'; g.lineWidth = 14; g.stroke();
  g.fillStyle = 'rgba(214,196,156,.9)'; for (const d of drips) if (d.L > 30) { g.beginPath(); g.arc(d.x, Math.min(edge(d.x) + 6, maxY - 2), 9 + d.w * .08, 0, TAU); g.fill(); } // drip tips
  const rg = g.createLinearGradient(0, 0, 0, 30); rg.addColorStop(0, '#5a4630'); rg.addColorStop(.5, '#a8875a'); rg.addColorStop(1, '#4b3b25'); g.fillStyle = rg; g.fillRect(0, 0, W, 28); // the roller
  const cx = W * .62, cy = edge(cx); g.strokeStyle = '#5a4a32'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy - 4); g.quadraticCurveTo(cx + 8 * melt, cy + 60, cx + 14 * melt, Math.min(cy + 110 + 40 * melt, maxY - 30)); g.stroke(); // the pull cord, stretching
  g.beginPath(); g.ellipse(cx + 14 * melt, Math.min(cy + 124 + 40 * melt, maxY - 16), 13, 13 + 6 * melt, 0, 0, TAU); g.stroke();
}
function slatBlind(t, b, maxY) {
  // slow, overlapping drop and tilt so the sky darkens once, not in three quick swaps (flash check, draft 3)
  const drop = ease(t, b - .05, b + .85), raise = ease(t, b + 2.25, b + 3.0), shut = ease(t, b + .45, b + 1.35) * (1 - ease(t, b + 1.6, b + 2.25));
  const D = maxY * .93 * drop * (1 - raise); if (D <= 4) return;
  const N = 17, pitch = maxY * .93 / N, n = Math.min(N, Math.floor(D / pitch)), cords = [W * .12, W * .37, W * .63, W * .88];
  g.fillStyle = 'rgba(70,62,52,.45)'; for (const x of cords) g.fillRect(x - 2, 0, 4, D); // ladder strings
  for (let i = 0; i < n; i++) { const yc = (i + .5) * pitch, hs = pitch * lerp(.3, 1.06, shut), sag = 9 + 6 * Math.sin(i * 1.7), y0 = yc - hs / 2;
    const sg = g.createLinearGradient(0, y0, 0, y0 + hs); sg.addColorStop(0, '#f6efdc'); sg.addColorStop(.45, '#ddd2b6'); sg.addColorStop(1, '#a8987a'); g.fillStyle = sg;
    g.beginPath(); g.moveTo(0, y0); g.quadraticCurveTo(W / 2, y0 + sag, W, y0); g.lineTo(W, y0 + hs); g.quadraticCurveTo(W / 2, y0 + hs + sag, 0, y0 + hs); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(90,76,56,.35)'; g.lineWidth = 1.5; g.stroke(); }
  // the sun still finds the cracks while the slats are open
  if (shut < .9) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,236,190,${.12 * (1 - shut)})`; for (let i = 0; i < n; i++) g.fillRect(0, (i + 1) * pitch - pitch * .2, W, pitch * .12); g.restore(); }
  const by = D; const bg = g.createLinearGradient(0, by - 8, 0, by + 16); bg.addColorStop(0, '#cdbf9f'); bg.addColorStop(1, '#6d5a3a'); g.fillStyle = bg;
  g.beginPath(); g.moveTo(0, by - 6); g.quadraticCurveTo(W / 2, by + 10, W, by - 6); g.lineTo(W, by + 12); g.quadraticCurveTo(W / 2, by + 28, 0, by + 12); g.fill(); // the bottom rail, sagging
  g.fillStyle = '#8a7656'; g.fillRect(0, 0, W, 24); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, 4, W, 4); // head rail
  g.strokeStyle = '#4a3c2a'; g.lineWidth = 3; g.beginPath(); g.moveTo(W * .9, 24); g.lineTo(W * .9, Math.min(by + 140, maxY - 30)); g.stroke(); // the tilt wand
  g.fillStyle = '#4a3c2a'; g.fillRect(W * .9 - 6, Math.min(by + 140, maxY - 30), 12, 26);
}
function drapeBlind(t, b, maxY, hauled) { // hauled: it goes back up into the sky instead of sliding off down the horizon
  const drop = ease(t, b - .05, b + .6), melt = ease(t, b + .3, b + 1.9), slide = ease(t, b + 1.75, b + 3.0), fade = 1 - ease(t, b + 2.7, b + 3.0); if (drop <= 0 || slide >= 1 || fade <= 0) return; // fades over its last .3 s, so it never vanishes half on screen (2:57.08)
  const D = maxY * .84 * drop, R = mulberry(733), drips = [...Array(9)].map((_, i) => ({ x: (i + .2 + R() * .6) / 9 * W, w: 40 + R() * 60, L: (60 + R() * 170) * melt }));
  // the hem: lowest left of centre like a soft watch over a branch, with drips that lengthen as it melts
  const hem = (x) => { const u = x / W; let y = D * (.82 + .18 * Math.sin(u * Math.PI)) + melt * 90 * Math.exp(-((u - .38) ** 2) / .03) + Math.sin(u * 23 + t * 1.2) * 10; for (const d of drips) { const v = (x - d.x) / d.w; if (v > -1 && v < 1) y += d.L * (1 - v * v) ** 2; } return Math.min(y, maxY - 4); };
  g.save(); g.globalAlpha = fade; if (hauled) g.translate(0, -slide * slide * (D + 260)); else { g.translate(W, 0); g.rotate(slide * slide * .5); g.translate(-W + slide * slide * W * .25, slide * slide * maxY * .9); } // it slides off to the right and down behind the horizon
  g.beginPath(); g.moveTo(-20, 0); g.lineTo(W + 20, 0); for (let x = W + 20; x >= -20; x -= 12) g.lineTo(x, hem(x)); g.closePath();
  const fg = g.createLinearGradient(0, 0, W, 0); for (let i = 0; i <= 28; i++) { const u = i / 28, l = .5 + .5 * Math.sin(u * 13 * Math.PI + Math.sin(u * 7) * 1.5); fg.addColorStop(u, rgb(mix([84, 10, 16], [196, 44, 40], l))); }
  g.fillStyle = fg; g.fill();
  const vg = g.createLinearGradient(0, 0, 0, D + 200); vg.addColorStop(0, 'rgba(20,0,0,.45)'); vg.addColorStop(.3, 'rgba(20,0,0,0)'); vg.addColorStop(1, 'rgba(255,170,90,.18)'); g.fillStyle = vg; g.fill();
  g.strokeStyle = '#d6a632'; g.lineWidth = 3; g.beginPath(); for (let x = -20; x <= W + 20; x += 9) { const y = hem(x); g.moveTo(x, y - 2); g.lineTo(x + 1, y + 16); } g.stroke(); // gold fringe
  g.lineWidth = 6; g.beginPath(); for (let x = -20; x <= W + 20; x += 12) x > -20 ? g.lineTo(x, hem(x)) : g.moveTo(x, hem(x)); g.stroke();
  const rg = g.createLinearGradient(0, 0, 0, 30); rg.addColorStop(0, '#7a5a1e'); rg.addColorStop(.5, '#e8c45a'); rg.addColorStop(1, '#7a5a1e'); g.fillStyle = rg; g.fillRect(-20, 2, W + 40, 22); // the gold rail
  for (const x of [8, W - 8]) { g.beginPath(); g.arc(x, 13, 20, 0, TAU); g.fill(); }
  g.restore();
}

// ---------- Von Ulrich: the monumental ear on crutches, its tape lines, the drawer in its canal and the padlock ----------
const EAR = { s: () => wt(2, 'every'), X: () => carX(wt(2, 'every')) + 14, Z: 24 };
function bigEar(t, list) { const s = EAR.s(); if (t < s - .3) return; const X = EAR.X(), Z = EAR.Z, grow = easeOutBack(clamp((t - s + .3) / 1.1));
  list.push({ z: P(X, 0, Z)[2], draw: () => { const p = P(X, 0, Z); if (p[2] < 1) return; const k = kAt(p) * grow, x = p[0], y = p[1], h = 9 * k;
    for (const d of [-1, 1]) { g.strokeStyle = PAL.crutch; g.lineWidth = Math.max(1, .25 * k); g.beginPath(); g.moveTo(x + d * 2.6 * k, y); g.lineTo(x + d * 1.4 * k, y - h * .55); g.stroke(); g.lineWidth = Math.max(1, .4 * k); g.strokeStyle = '#e9dcc2'; g.beginPath(); g.moveTo(x + d * 1.4 * k - .7 * k, y - h * .55); g.lineTo(x + d * 1.4 * k + .7 * k, y - h * .55); g.stroke(); }
    const eg = g.createRadialGradient(x - 1.2 * k, y - h * .78, .3 * k, x, y - h * .6, 5 * k); eg.addColorStop(0, '#f6d7bd'); eg.addColorStop(1, '#c58a6a'); g.fillStyle = eg;
    g.beginPath(); g.moveTo(x - .4 * k, y - h * .3); g.bezierCurveTo(x - 3.4 * k, y - h * .45, x - 3.2 * k, y - h * 1.08, x, y - h); g.bezierCurveTo(x + 2.6 * k, y - h * .95, x + 2.4 * k, y - h * .62, x + 1 * k, y - h * .52); g.bezierCurveTo(x + .2 * k, y - h * .45, x + 1 * k, y - h * .3, x - .4 * k, y - h * .3); g.fill();
    // the canal, and the drawer that slides out of it to take the tapes, then shuts
    const cx = x - .25 * k, cy = y - h * .56, open = hold(t, s - .1, s + .5, wt(3, 'want') - .1, wt(3, 'want') + .35);
    const cg = g.createRadialGradient(cx, cy, .05 * k, cx, cy, .75 * k); cg.addColorStop(0, '#3a160e'); cg.addColorStop(1, '#a05a40'); g.fillStyle = cg; g.beginPath(); g.ellipse(cx, cy, .62 * k, .78 * k, -.2, 0, TAU); g.fill();
    const dw = 1.0 * k, dh = .62 * k, dx = open * 1.3 * k;
    if (open > .02) { g.fillStyle = '#5a3a1c'; g.beginPath(); g.moveTo(cx - dw / 2, cy - dh / 2); g.lineTo(cx - dw / 2 + dx, cy - dh / 2 - dx * .25); g.lineTo(cx - dw / 2 + dx, cy + dh / 2 - dx * .25); g.lineTo(cx - dw / 2, cy + dh / 2); g.fill(); g.fillStyle = '#2a1608'; g.fillRect(cx - dw / 2 + dx * .2, cy - dh / 2 - dx * .25, dw * .9, .12 * k); }
    g.fillStyle = '#8c6338'; g.fillRect(cx - dw / 2 + dx, cy - dh / 2 - dx * .25, dw, dh); g.strokeStyle = '#3a2412'; g.lineWidth = Math.max(1, .05 * k); g.strokeRect(cx - dw / 2 + dx, cy - dh / 2 - dx * .25, dw, dh);
    g.fillStyle = '#d9b45a'; g.beginPath(); g.arc(cx + dx, cy - dx * .25, .08 * k, 0, TAU); g.fill();
    g.strokeStyle = '#9c5f45'; g.lineWidth = Math.max(1, .3 * k); g.beginPath(); g.moveTo(x - 1.6 * k, y - h * .5); g.bezierCurveTo(x - 2.1 * k, y - h * .9, x + 1.6 * k, y - h * 1.0, x + 1 * k, y - h * .7); g.bezierCurveTo(x + .4 * k, y - h * .6, x - .6 * k, y - h * .7, x - .3 * k, y - h * .55); g.stroke();
    const n = Math.floor(clamp((t - s) / 2.5) * 6); for (let i = 0; i < n; i++) { g.fillStyle = '#3a3a40'; g.fillRect(x - 1.3 * k + (i % 3) * .8 * k, y - h * .3 - (1 + Math.floor(i / 3)) * .45 * k, .7 * k, .42 * k); g.fillStyle = '#d8d0bc'; g.beginPath(); g.arc(x - 1.1 * k + (i % 3) * .8 * k, y - h * .3 - (.8 + Math.floor(i / 3)) * .45 * k, .1 * k, 0, TAU); g.arc(x - .8 * k + (i % 3) * .8 * k, y - h * .3 - (.8 + Math.floor(i / 3)) * .45 * k, .1 * k, 0, TAU); g.fill(); }
    earTapes(t, s, cx + dx, cy - dx * .25, k);
    earLock(t, cx + dx, cy - dx * .25 + dh / 2, k); },
    shadow: () => shadowStick(X, 0, 9 * grow, Z, 3 * grow, t) }); }
function earTapes(t, s, ex, ey, k) { // brown tape lines from the board's table run into the ear's drawer, then snap in when it shuts
  const shutT = wt(3, 'want') + .2, reach = ease(t, s, s + .6), suck = ease(t, shutT - .1, shutT + .35); if (reach <= 0 || suck >= 1) return;
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const src = PL(-2.6 + i * 1.1, TOP + .12, 1.0 + (i % 2) * .3); if (src[2] < .3) continue; const N = 26, a0 = suck, a1 = reach;
    g.strokeStyle = '#3f2614'; g.lineWidth = Math.max(1.5, .07 * Math.min(kAt(src), k * 3)); g.beginPath(); let first = true;
    for (let j = 0; j <= N; j++) { const u = lerp(a0, a1, j / N), sx = lerp(src[0], ex, u), sy = lerp(src[1], ey, u) - Math.sin(u * Math.PI) * (90 + i * 30) + Math.sin(u * 14 - t * 9 + i) * 10 * (1 - u); first ? g.moveTo(sx, sy) : g.lineTo(sx, sy); first = false; }
    g.stroke(); g.strokeStyle = 'rgba(190,150,110,.55)'; g.lineWidth = Math.max(1, g.lineWidth * .35); g.setLineDash([10, 18]); g.lineDashOffset = -t * 160; g.stroke(); g.setLineDash([]); }
  g.restore();
}
function earLock(t, hx, hy, k) { // on "restrict" a padlock drops out of the sky onto the drawer's hasp and swings
  const t0 = wt(4, 'restrict'), r = t0 + .85; if (t < t0) return; const u = clamp((t - t0) / .85), fall = (1 - u * u) * 26 * k, sw = t > r ? Math.exp(-(t - r) * 2.6) * Math.sin((t - r) * 9) * .45 : 0; // falls from the word, lands as the camera pulls back off the whiteboard
  g.save(); g.translate(hx, hy - fall); g.rotate(sw);
  g.strokeStyle = '#a9a69e'; g.lineWidth = Math.max(2, .28 * k); g.beginPath(); g.arc(0, .55 * k, .55 * k, Math.PI, TAU); g.lineTo(.55 * k, .9 * k); g.moveTo(-.55 * k, .55 * k); g.lineTo(-.55 * k, .9 * k); g.stroke();
  const bg = g.createLinearGradient(-1.1 * k, 0, 1.1 * k, 0); bg.addColorStop(0, '#f0cf6a'); bg.addColorStop(1, '#8a6a1e'); g.fillStyle = bg; g.beginPath(); g.roundRect(-1.1 * k, .85 * k, 2.2 * k, 1.8 * k, .25 * k); g.fill();
  g.fillStyle = '#2a1e0c'; g.beginPath(); g.arc(0, 1.55 * k, .2 * k, 0, TAU); g.fill(); g.fillRect(-.08 * k, 1.55 * k, .16 * k, .5 * k);
  g.restore();
}
// a mouth sculpture with a padlock through its lips, on "gag order". Draft 9: twice the size, and placed from the camera's
// own pose at "order" so it sits on the left third of that framing and the frame edge never cuts it (30-31.5) whatever
// the flight does; the padlock hangs open from "gag" and its shackle snaps shut on "order", the lips pinch, the lock shudders.
const GAG = { S: 2, D: 31.6, SX: 480, H: 2.8 }; // scale, metres ahead of the lens at "order", screen x of its centre there, lips height (scaled units)
let gagAt = null; // a constant (worked out once from the flight, which is itself a pure function of t), not frame state
function gagWhere() { if (gagAt) return gagAt; const c = camAt(wt(2, 'order'), true), fx = Math.sin(c.yaw), fz = Math.cos(c.yaw), lat = (GAG.SX - W / 2) / c.f * GAG.D;
  return (gagAt = { X: c.x + fx * GAG.D + fz * lat, Z: c.z + fz * GAG.D - fx * lat, rx: fz, rz: -fx }); }
function gagMouth(t, list) { const s = L_(2).s; if (t < s - .2) return; const { X, Z } = gagWhere(), grow = easeOutBack(clamp((t - s + .2) / .9)), o = wt(2, 'order');
  const shut = ease(t, o - .1, o + .02), snap = t > o ? Math.exp(-(t - o) * 8) * Math.sin((t - o) * 38) : 0, pinch = shut * (1 - .4 * Math.exp(-Math.max(0, t - o) * 4));
  list.push({ z: P(X, 0, Z)[2], draw: () => { const p = P(X, 0, Z); if (p[2] < 1) return; const k = kAt(p) * grow * GAG.S, x = p[0], y = p[1] - GAG.H * k, hz = 1 - .14 * pinch + .04 * snap;
    g.strokeStyle = '#6b4a2a'; g.lineWidth = Math.max(1, .22 * k); g.beginPath(); g.moveTo(x, p[1]); g.lineTo(x, y + 1.2 * k); g.stroke();
    g.fillStyle = '#c0322a'; g.beginPath(); g.moveTo(x - 3 * k, y); g.bezierCurveTo(x - 1.5 * k, y - 1.6 * k * hz, x - .3 * k, y - .9 * k * hz, x, y - .6 * k * hz); g.bezierCurveTo(x + .3 * k, y - .9 * k * hz, x + 1.5 * k, y - 1.6 * k * hz, x + 3 * k, y); g.bezierCurveTo(x + 1.5 * k, y + 1.7 * k * hz, x - 1.5 * k, y + 1.7 * k * hz, x - 3 * k, y); g.fill();
    g.strokeStyle = 'rgba(255,190,170,.45)'; g.lineWidth = Math.max(1, .14 * k); g.beginPath(); g.moveTo(x - 1.9 * k, y - .62 * k * hz); g.quadraticCurveTo(x - 1.2 * k, y - 1.05 * k * hz, x - .55 * k, y - .78 * k * hz); g.stroke(); // a shine on the top lip
    g.strokeStyle = '#6a1712'; g.lineWidth = Math.max(1, .12 * k); g.beginPath(); g.moveTo(x - 3 * k, y); g.quadraticCurveTo(x, y + .35 * k * hz, x + 3 * k, y); g.stroke();
    // the padlock through the lips: open, its shackle up and swung out, until "order" drops it home
    const by = y + .1 * k + snap * .06 * k, lift = (1 - shut) * .5 * k;
    g.save(); g.translate(x - .45 * k, by - lift); g.rotate(-(1 - shut) * .75); g.strokeStyle = '#b8b4aa'; g.lineWidth = Math.max(1, .18 * k); g.beginPath(); g.moveTo(0, .15 * k); g.lineTo(0, 0); g.arc(.45 * k, 0, .45 * k, Math.PI, TAU); g.lineTo(.9 * k, .15 * k); g.stroke(); g.restore();
    g.fillStyle = '#c9a43a'; g.fillRect(x - .6 * k, by, 1.2 * k, .9 * k); g.fillStyle = 'rgba(255,240,190,.35)'; g.fillRect(x - .52 * k, by + .06 * k, .3 * k, .78 * k);
    g.fillStyle = '#2a1e0c'; g.beginPath(); g.arc(x, by + .4 * k, .11 * k, 0, TAU); g.fill(); g.fillRect(x - .04 * k, by + .4 * k, .08 * k, .28 * k); },
    shadow: () => { const { rx, rz } = gagWhere(), S = GAG.S * grow, Y = GAG.H * S; shadowStick(X, 0, Y, Z, .22 * S, t); // the post, then the lips as a flat cut-out facing the lens
      shadowOf([[-3, 0], [-1.6, 1.3], [0, .9], [1.6, 1.3], [3, 0], [1.5, -1.2], [-1.5, -1.2]].map(([u, v]) => [X + rx * u * S, Y + v * S, Z + rz * u * S]), t); } }); }

// ---------- newspapers on every "news": big broadsheets tumbling through on the wind, blacked out ----------
function paperItems(t) { const out = [];
  for (const [r, li] of [[0, 4], [1, 11], [2, 32]]) { const s = L_(li).s, e = L_(li).e + 2.5; if (t < s - .4 || t > e) continue; const n = 7 + r * 3, wind = 6 + r * 1.5;
    for (let i = 0; i < n; i++) { const d = t - s + .4 - i * .22; if (d < 0) continue; const X = carX(t) - 20 + d * wind + (rnd(i, r, 1) - .5) * 6, Z = -7 + rnd(i, r, 2) * 22, Y = 1 + 3.2 * rnd(i, r, 3) + Math.sin(d * 2.4 + i) * .8 + d * .25;
      if (Math.abs(Z) < 2.6) continue; out.push({ X, Y, Z, rot: d * (1.5 + rnd(i, r, 4) * 2) + i, flip: Math.cos(d * 3.1 + i * 1.3), i, sz: 1 + r * .15 }); } }
  return out; }
function drawPaper(o) { const p = P(o.X, o.Y, o.Z); if (p[2] < 1) return; const k = kAt(p) * o.sz; if (k * 1.7 < 3) return;
  g.save(); g.translate(p[0], p[1]); g.rotate(o.rot); g.scale(Math.max(.08, Math.abs(o.flip)), 1); if (o.flip < 0) { g.fillStyle = '#e4dcc8'; g.fillRect(-.85 * k, -.575 * k, 1.7 * k, 1.15 * k); g.fillStyle = 'rgba(90,84,76,.4)'; for (let r = 0; r < 7; r++) g.fillRect(-.75 * k, (-.45 + r * .13) * k, 1.5 * k, .04 * k); } else newspaper(k, o.i); g.restore(); }
function tumblePapers(t, list) { for (const o of paperItems(t)) { if (nearCar(o.X, o.Z)) continue; const z = P(o.X, o.Y, o.Z)[2]; list.push({ z, draw: () => drawPaper(o), shadow: () => {} }); } }

// ---------- the spin refrains: dust devils and art cars whirl round the table, bigger each time ----------
const WHIRLS = [{ li: 6, n: 3, cars: 2, R: 15, amt: .85, w: .5 }, { li: 13, n: 5, cars: 4, R: 14, amt: 1.1, w: .7 }, { li: 34, n: 7, cars: 6, R: 13, amt: 1.4, w: .95 }];
const KINDS = ['copy', 'fish', 'drawer'];
function whirlItems(t) { const out = [];
  WHIRLS.forEach((wh, r) => { const s = L_(wh.li).s, e = L_(wh.li).e, gs = gavelT(); if (t < s - .3 || t > e + 1.5) return;
    let env = ease(t, s - .3, s + 1.6) * (1 - ease(t, e - .4, e + .8)), blow = 0;
    if (r === 2) { env = ease(t, s - .3, s + 1.6) * (1 - ease(t, gs, gs + .5)); blow = ease(t, gs, gs + 1.2); }
    if (env <= 0 && blow <= 0) return; const ang = wh.w * (t - s) + wh.w * .6 * ease(t, wt(wh.li, 'spin') - .3, wt(wh.li, 'spin') + 1.5) * 3;
    const dcam = Math.hypot(C.x - CX, C.z - CZ), Rr = Math.min(wh.R, Math.max(9.5, dcam * .6)) * lerp(1.5, 1, ease(t, s - .3, s + 1.6)) + blow * 30;
    for (let j = 0; j < wh.n; j++) { const a = -(j / wh.n * TAU + ang); out.push({ kind: 'devil', X: CX + Math.cos(a) * Rr, Z: CZ + Math.sin(a) * Rr * .8, amt: wh.amt * env, seed: r * 10 + j }); }
    for (let j = 0; j < wh.cars; j++) { const a = -((j + .5) / wh.cars * TAU + ang * 1.15), R2 = Rr * .82 + (j % 2) * 2.5; const X = CX + Math.cos(a) * R2, Z = CZ + Math.sin(a) * R2 * .8;
      const ah = a - .05, dir = Math.sign(P(CX + Math.cos(ah) * R2, 0, CZ + Math.sin(ah) * R2 * .8)[0] - P(X, 0, Z)[0]) || 1;
      out.push({ kind: KINDS[(j + r) % 3], X, Z, dir, up: clamp(env * 1.4 + blow), tilt: blow * (j % 2 ? 1 : -1) * 1.2, i: j + r * 7, nod: 0 }); } });
  return out; }
function drawWhirl(o, t) { if (P(o.X, 0, o.Z)[2] < 5) return; if (o.kind === 'devil') { dustDevil(o.X, o.Z, t, o.amt, o.seed); dustDevil(o.X + .6, o.Z + .4, t, o.amt * .9, o.seed + 50); return; } const p = P(o.X, 0, o.Z); if (p[2] < 8 || o.up <= 0) return; artCar(o.kind, p[0], p[1], kAt(p) * o.up, o.dir, t, o.i, o.tilt); }
function artCar(kind, x, y, k, dir, t, i, tilt) {
  g.save(); g.translate(x, y); if (tilt) g.rotate(tilt); g.scale(dir, 1);
  const wheel = (wx, r) => { g.fillStyle = '#17120f'; g.beginPath(); g.arc(wx * k, -r * k, r * k, 0, TAU); g.fill(); g.strokeStyle = '#8a7a60'; g.lineWidth = Math.max(1, .05 * k); const a = -t * 6; g.beginPath(); g.moveTo(wx * k + Math.cos(a) * r * k, -r * k + Math.sin(a) * r * k); g.lineTo(wx * k - Math.cos(a) * r * k, -r * k - Math.sin(a) * r * k); g.stroke(); };
  if (kind === 'copy') boardCopy(0, 0, k, t, 0, i);
  else if (kind === 'fish') { // a fish mutant vehicle with a costumed rider
    const fg = g.createLinearGradient(0, -2.6 * k, 0, -.4 * k); fg.addColorStop(0, '#3fa7a0'); fg.addColorStop(1, '#1f5e72'); g.fillStyle = fg;
    g.beginPath(); g.ellipse(0, -1.5 * k, 2.1 * k, 1.05 * k, 0, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(-1.8 * k, -1.5 * k); g.lineTo(-3.2 * k, -2.6 * k + Math.sin(t * 7 + i) * .3 * k); g.lineTo(-3 * k, -1.5 * k); g.lineTo(-3.2 * k, -.5 * k - Math.sin(t * 7 + i) * .3 * k); g.fill();
    g.strokeStyle = 'rgba(240,200,120,.6)'; g.lineWidth = Math.max(1, .07 * k); for (let a = 0; a < 4; a++) { g.beginPath(); g.arc((-1 + a * .6) * k, -1.5 * k, .45 * k, -1, 1); g.stroke(); }
    g.fillStyle = '#f4efe6'; g.beginPath(); g.arc(1.3 * k, -1.75 * k, .28 * k, 0, TAU); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(1.36 * k, -1.75 * k, .13 * k, 0, TAU); g.fill();
    g.fillStyle = '#e8b23a'; g.beginPath(); g.moveTo(-.3 * k, -2.5 * k); g.lineTo(.5 * k, -3.2 * k); g.lineTo(.6 * k, -2.45 * k); g.fill();
    g.fillStyle = '#d8452f'; g.fillRect(-.2 * k, -3.25 * k, .38 * k, .7 * k); g.fillStyle = '#e8d4b4'; g.beginPath(); g.arc(0, -3.45 * k, .16 * k, 0, TAU); g.fill();
    g.strokeStyle = '#5a4a3a'; g.lineWidth = Math.max(1, .05 * k); g.beginPath(); g.moveTo(.1 * k, -3.2 * k); g.lineTo(.1 * k, -4.4 * k); g.stroke(); g.fillStyle = '#7a3c8c'; g.beginPath(); g.arc(.1 * k, -4.4 * k, .7 * k, Math.PI, TAU); g.fill(); // parasol
    wheel(-1.2, .32); wheel(1.1, .32);
  } else { // a chest of drawers on wheels, its middle drawer gaping, propped on a crutch
    const sag = Math.sin(t * .8 + i) * .08 * k; g.fillStyle = '#7b5530'; g.beginPath(); g.moveTo(-1.1 * k, -.45 * k); g.lineTo(1.1 * k, -.45 * k); g.lineTo(1.05 * k, -3.1 * k); g.quadraticCurveTo(0, -3.25 * k + sag, -1.05 * k, -3.1 * k); g.fill();
    for (let d = 0; d < 3; d++) { const dy = -(1.0 + d * .75) * k, o = d === 1 ? (.5 + .5 * Math.sin(t * 2 + i)) * .9 * k : 0; g.fillStyle = '#2a1608'; g.fillRect(-.95 * k, dy - .3 * k, 1.9 * k, .6 * k); g.fillStyle = '#9a6c3c'; g.fillRect(-.95 * k + o, dy - .3 * k, 1.9 * k, .6 * k); g.strokeStyle = '#3a2412'; g.lineWidth = Math.max(1, .04 * k); g.strokeRect(-.95 * k + o, dy - .3 * k, 1.9 * k, .6 * k); g.fillStyle = '#d9b45a'; g.beginPath(); g.arc(o, dy, .07 * k, 0, TAU); g.fill();
      if (o > .3 * k) { g.fillStyle = '#efe9da'; g.fillRect(.2 * k + o, dy - .5 * k, .6 * k, .3 * k); } }
    g.strokeStyle = PAL.crutch; g.lineWidth = Math.max(1, .07 * k); g.beginPath(); g.moveTo(1.6 * k, -.05 * k); g.lineTo(1.2 * k, -1.65 * k); g.stroke();
    wheel(-.8, .3); wheel(.8, .3);
  }
  g.restore();
}

// ---------- Gilliam, crowds of copies: the board's copies parade past on wheels, nodding as one ----------
function boardCopy(x, y, k, t, nod, i) { // a small replica of the table car: three suits facing us behind it, three on low chairs in front, red skirt, red hat
  const torso = (bx, by, front) => { g.fillStyle = front ? PAL.suit : '#22222a'; g.beginPath(); g.moveTo(bx - .24 * k, by); g.lineTo(bx - .29 * k, by - .5 * k); g.quadraticCurveTo(bx, by - .58 * k, bx + .29 * k, by - .5 * k); g.lineTo(bx + .24 * k, by); g.fill();
    if (front) { g.fillStyle = '#f4efe6'; g.beginPath(); g.moveTo(bx - .08 * k, by - .53 * k); g.lineTo(bx, by - .28 * k); g.lineTo(bx + .08 * k, by - .53 * k); g.fill(); rosette(bx - .15 * k, by - .42 * k, .045 * k); }
    egg(bx, by - .7 * k + nod * k, k * 1.2, front, 0); };
  for (const sx of [-1.3, 0, 1.3]) torso(x + sx * k, y - 1.08 * k, true); // the far row, facing us
  g.fillStyle = '#b52c22'; g.fillRect(x - .12 * k, y - 1.3 * k, .24 * k, .16 * k); g.fillRect(x - .2 * k, y - 1.16 * k, .4 * k, .05 * k);
  g.fillStyle = PAL.mahoganyLit; g.fillRect(x - 2 * k, y - 1.12 * k, 4 * k, .14 * k); g.fillStyle = '#3d170c'; g.fillRect(x - 2 * k, y - .99 * k, 4 * k, .06 * k);
  const sg = g.createLinearGradient(0, y - k, 0, y - .1 * k); sg.addColorStop(0, '#5a0e16'); sg.addColorStop(1, PAL.skirt); g.fillStyle = sg; g.beginPath(); g.moveTo(x - 1.95 * k, y - .94 * k); g.lineTo(x + 1.95 * k, y - .94 * k);
  for (let j = 8; j >= 0; j--) g.lineTo(x - 1.95 * k + j * .4875 * k, y - (.2 + .04 * Math.sin(j * 2 + t * 2 + i)) * k); g.fill();
  g.strokeStyle = '#d6a632'; g.lineWidth = Math.max(1, .05 * k); g.beginPath(); for (let j = 0; j <= 8; j++) { const yy = y - (.2 + .04 * Math.sin(j * 2 + t * 2 + i)) * k; j ? g.lineTo(x - 1.95 * k + j * .4875 * k, yy) : g.moveTo(x - 1.95 * k, yy); } g.stroke();
  g.fillStyle = '#17120f'; for (const wx of [-1.4, 1.4]) { g.beginPath(); g.arc(x + wx * k, y - .14 * k, .14 * k, 0, TAU); g.fill(); }
  for (const sx of [-.65, .65]) { const bx = x + sx * k, seat = y - .5 * k; // the near row on low chairs, backs to us, feet near the sand
    g.fillStyle = '#1a1a20'; g.fillRect(bx - .16 * k, seat, .12 * k, .42 * k); g.fillRect(bx + .04 * k, seat, .12 * k, .42 * k);
    g.fillStyle = '#5c3a1c'; g.fillRect(bx - .3 * k, seat - .02 * k, .6 * k, .06 * k); torso(bx, seat, false); g.fillStyle = PAL.wood; g.fillRect(bx - .27 * k, seat - .64 * k, .54 * k, .07 * k); g.fillRect(bx - .25 * k, seat - .6 * k, .05 * k, .6 * k); g.fillRect(bx + .2 * k, seat - .6 * k, .05 * k, .6 * k); }
}
function suitColumn(t, list) { // during news and grin a column of copies rolls past the other way (refrains 1 and 2, draft 7)
  const wins = [[L_(4).s - .5, L_(5).e + .4, 5], [L_(11).s - .5, L_(12).e + .4, 6]];
  for (const [s, e, n] of wins) { if (t < s || t > e) continue; const vis = hold(t, s, s + .3, e - .3, e), nodOne = Math.abs(Math.sin(t * 2.2)) * .05;
    for (let i = 0; i < n; i++) { const X = carX(t) + 34 - (t - s) * 7.5 + i * 6.2, Z = 15 + (i % 2) * 1.2; const p = P(X, 0, Z); if (p[2] < 1.5 || p[0] < -200 || p[0] > W + 200) continue;
      list.push({ z: p[2], draw: () => { const k = kAt(p) * vis; if (k < .5) return; boardCopy(p[0], p[1] - (Math.floor(t * 5 + i) % 2) * .03 * k, k, t, nodOne, i); }, shadow: () => shadowOf([[X - 1.7, 0, Z - .6], [X + 1.7, 0, Z - .6], [X + 1.7, 2, Z], [X - 1.7, 2, Z]], t) }); } }
  rehearsedRow(t, list); }
// draft 9, "rehearsed": five copies roll in to about 8 m beyond the far row, pace the board in a line, and nod on exactly
// the main row's beat (car.js: |sin(1.6 pi (t - line start))| from the line's start to its end + .3); then they roll off
// the other way before refrain 3 climbs out over the city
function rehearsedRow(t, list) { const reh = L_(30), s = reh.s - .5, e = reh.e + 2.6; if (t < s || t > e) return;
  const nod = t > reh.s && t < reh.e + .3 ? Math.abs(Math.sin((t - reh.s) * 1.6 * Math.PI)) * .14 : 0, inn = 1 - ease(t, s, reh.s + 1.1), out = ease(t, reh.e + .4, e), vis = hold(t, s, s + .25, e - .35, e);
  for (let i = 0; i < 5; i++) { const X = carX(t) - 9.4 + i * 4.3 + inn * (16 + i * 2.5) - out * out * (34 + i * 3), Z = 7.2 + (i % 2) * .5, p = P(X, 0, Z); if (p[2] < 1.5 || p[0] < -260 || p[0] > W + 260) continue;
    const roll = inn > .02 || out > .02 ? (Math.floor(t * 5 + i) % 2) * .03 : 0; // the wheels only bump while rolling, so the nod reads as one
    list.push({ z: p[2], draw: () => { const k = kAt(p) * vis; if (k < .5) return; boardCopy(p[0], p[1] - roll * k, k, t, nod, i); }, shadow: () => shadowOf([[X - 1.7, 0, Z - .6], [X + 1.7, 0, Z - .6], [X + 1.7, 2, Z], [X - 1.7, 2, Z]], t) }); } }

// ---------- the soft clock car: two visits only, drooping more each time; on "once upon a time" its hands run backward ----------
// visit 1: dawn, nearly round, drives through the intro push. Visit 2: midday-soft, rolls in behind the vogue poses and parks on
// the right third for "once upon a time" (needs the camera to hold VOGUE through 126.7, see the report), then leaves during the dime.
// Draft 9, visit 3 (Dali DI-1): smaller, it paces the board's far side as the face's left eye, with the eyeball car (eyeCar) as
// the right eye. Through the grin close-up both pace well out to the sides, clear of that frame; as the drone rises off the
// grin they close in to either side of the far row, so from above the table is the mouth and these two are the eyes; after
// "facts" they peel off and drop behind.
const EYES = { a: L_(33).s, in0: L_(33).s + 2.75, in1: L_(33).s + 4.2, out0: L_(34).s + .3, b: L_(34).s + 1.9, x: 3.2, far: 11.5 };
// They only close in if the flight really rises over the board for DI-1 (camera above 7 m at the face hold); otherwise they
// stay wide, clear of the protected grin close-up (a constant, worked out once from the flight)
let eyesUp = null; const eyesRise = () => (eyesUp !== null ? eyesUp : (eyesUp = camAt(EYES.in1 + .5, true).y > 7 ? 1 : 0));
const eyeX = (t, side) => side * (lerp(EYES.far, EYES.x, ease(t, EYES.in0, EYES.in1) * eyesRise()) + 30 * (1 - ease(t, EYES.a, EYES.a + 2.2))) - 28 * ease(t, EYES.out0, EYES.b) ** 2; // in from either side, out by dropping behind
const eyeZ = (t, z) => z + 12 * ease(t, EYES.out0, EYES.b);
const CLOCK_VISITS = [{ a: 0, b: 17, dx: (t) => lerp(46, 4, t / 17), Z: 34 }, { a: L_(14).s, b: 127.9, dx: (t) => lerp(24, 9, ease(t, L_(14).s, 125.7)) - Math.max(0, t - 125.7) * .7, Z: 16 },
  { a: EYES.a, b: EYES.b, dx: (t) => eyeX(t, -1), Z: (t) => eyeZ(t, 3.7), s: .6 }];
function clockCar(t, list) { const v = CLOCK_VISITS.find((v) => t >= v.a && t <= v.b); if (!v) return; const X = carX(t) + v.dx(t), Z = typeof v.Z === 'function' ? v.Z(t) : v.Z, sc = v.s || 1; const p = P(X, 0, Z); if (p[2] < 2 || p[0] < -400 || p[0] > W + 400) return;
  list.push({ z: p[2], draw: () => { const k = kAt(p) * sc, x = p[0], y = p[1], m = lerp(.15, 1.25, clamp(t / 130)), back = wt(15, 'time'), hands = t < back ? t * .2 : back * .2 - ease(t, back - .05, back + 2.5) * 30, rock = Math.sin(t * 9) * .03 * k;
    g.fillStyle = '#4a3a2c'; g.fillRect(x - 3 * k, y - 1.6 * k + rock, 6 * k, 1.2 * k); g.fillStyle = '#17120f'; g.beginPath(); g.arc(x - 2 * k, y - .4 * k, .4 * k, 0, TAU); g.arc(x + 2 * k, y - .4 * k, .4 * k, 0, TAU); g.fill();
    g.strokeStyle = PAL.crutch; g.lineWidth = Math.max(1, .14 * k); g.beginPath(); g.moveTo(x + 2.6 * k, y - 1.6 * k); g.lineTo(x + 3.4 * k, y - 4.4 * k - m * k); g.stroke(); // a crutch props the sagging side
    const cy = y - 4.2 * k + rock, R = 2.6 * k; g.fillStyle = '#e8d9a8'; g.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU, sag = Math.max(0, Math.sin(a)) * m * 2.2 * k * (.5 + .5 * Math.cos(a * 2)); const px = x + Math.cos(a) * R, py = cy + Math.sin(a) * R + sag; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); g.fill(); g.strokeStyle = '#b08a3a'; g.lineWidth = .18 * k; g.stroke();
    g.fillStyle = '#3a2a1a'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.fillRect(x + Math.cos(a) * R * .8 - .08 * k, cy + Math.sin(a) * R * .8 - .08 * k + Math.max(0, Math.sin(a)) * m * 1.2 * k, .16 * k, .16 * k); }
    const spinning = t > back - .05 && t < back + 2.5; if (spinning) { g.strokeStyle = 'rgba(26,20,18,.25)'; g.lineWidth = .4 * k; g.beginPath(); g.arc(x, cy, 1.9 * k, -hands * 12 - Math.PI / 2, -hands * 12 - Math.PI / 2 + 1.2); g.stroke(); }
    g.strokeStyle = '#1a1412'; g.lineCap = 'round'; for (const [len, sp, w] of [[1.5, 1, .2], [2.1, 12, .12]]) { const a = hands * sp - Math.PI / 2; g.lineWidth = w * k; g.beginPath(); g.moveTo(x, cy); g.lineTo(x + Math.cos(a) * len * k, cy + Math.sin(a) * len * k); g.stroke(); } },
    shadow: () => shadowStick(X, 0, 7 * sc, Z, 5 * sc, t) }); }
// the eyeball car (Dali DI-1, the face's right eye): a 2.5 m eyeball on a low wooden cart, white with red veins and a blue
// iris; it looks across at the board while it paces, and up into the lens while the drone hangs over the face
function eyeCar(t, list) { if (t < EYES.a || t > EYES.b) return; const X = carX(t) + eyeX(t, 1), Z = eyeZ(t, 4.4), p = P(X, 0, Z); if (p[2] < 2 || p[0] < -400 || p[0] > W + 400) return;
  list.push({ z: p[2], draw: () => { const k = kAt(p), x = p[0], y = p[1], R = 1.25 * k, cy = y - 1.85 * k, wob = Math.sin(t * 7) * .02 * k;
    g.fillStyle = '#6b4a2a'; g.fillRect(x - 1.5 * k, y - .62 * k, 3 * k, .3 * k); g.fillStyle = '#4a3220'; g.fillRect(x - 1.5 * k, y - .36 * k, 3 * k, .06 * k); // the cart bed
    g.fillStyle = '#17120f'; for (const wx of [-1.05, 1.05]) { g.beginPath(); g.arc(x + wx * k, y - .28 * k, .28 * k, 0, TAU); g.fill(); g.strokeStyle = '#8a7a60'; g.lineWidth = Math.max(1, .05 * k); const a = -t * 6; g.beginPath(); g.moveTo(x + wx * k + Math.cos(a) * .28 * k, y - .28 * k + Math.sin(a) * .28 * k); g.lineTo(x + wx * k - Math.cos(a) * .28 * k, y - .28 * k - Math.sin(a) * .28 * k); g.stroke(); }
    g.strokeStyle = PAL.crutch; g.lineWidth = Math.max(1, .1 * k); g.beginPath(); g.moveTo(x - 1.25 * k, y - .62 * k); g.lineTo(x - .7 * k, cy + .4 * k); g.moveTo(x + 1.25 * k, y - .62 * k); g.lineTo(x + .7 * k, cy + .4 * k); g.stroke(); // two crutches cradle the ball
    const eg = g.createRadialGradient(x - R * .35, cy - R * .4 + wob, R * .08, x, cy + wob, R); eg.addColorStop(0, '#fffdf6'); eg.addColorStop(.6, '#f4efe4'); eg.addColorStop(1, '#cfc4ae'); g.fillStyle = eg; g.beginPath(); g.arc(x, cy + wob, R, 0, TAU); g.fill();
    const up = ease(t, EYES.in0, EYES.in1) * eyesRise() * (1 - ease(t, EYES.out0, EYES.out0 + .8)), side = clamp((CX - X) / 8, -1, 1), lx = x + side * (1 - up) * R * .42, ly = cy + wob - (1 - up) * R * .05; // iris: toward the board, then into the lens
    g.strokeStyle = 'rgba(184,40,36,.75)'; g.lineWidth = Math.max(1, .045 * k); g.lineCap = 'round'; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + .3, r0 = R * .97, r1 = R * (.58 + .12 * rnd(i, 71)); g.beginPath(); g.moveTo(x + Math.cos(a) * r0, cy + wob + Math.sin(a) * r0); g.quadraticCurveTo(x + Math.cos(a + .25) * (r0 + r1) / 2, cy + wob + Math.sin(a + .25) * (r0 + r1) / 2, x + Math.cos(a - .1) * r1, cy + wob + Math.sin(a - .1) * r1); g.stroke(); } // red veins
    g.fillStyle = '#43699a'; g.beginPath(); g.arc(lx, ly, R * .42, 0, TAU); g.fill(); g.strokeStyle = '#2c4a72'; g.lineWidth = Math.max(1, .05 * k); g.stroke();
    g.fillStyle = '#16131a'; g.beginPath(); g.arc(lx, ly, R * .19, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(lx - R * .13, ly - R * .13, R * .07, 0, TAU); g.fill(); },
    shadow: () => shadowStick(X, 0, 3.1, Z, 2.4, t) }); }

// ---------- Gilliam, lie about scale: chess pieces the size of art cars on "knight to queen's rook"; on "foul" the knight kicks the rook over ----------
// Draft 9: the white rook topples TOWARD the lens (a 3D cylinder from "foul"), so it lands with its crenellated top facing
// us, and a referee in stripes jogs in and holds a 1.2 m yellow card up on "play". The upright pieces are draft 7's.
let rookDir = null; // the fall heading on the ground: toward where the drone is when the rook lands (a constant, worked out once)
function rookHeading(X, Z) { if (rookDir) return rookDir; const c = camAt(wt(27, 'foul') + .45, true), dx = c.x - X, dz = c.z - Z, l = Math.hypot(dx, dz) || 1, a = .55; // toward the lens, turned a little to the lens's left (the knight kicked from the right) so the shaft shows behind the top
  const hx = dx / l, hz = dz / l, lx = -Math.cos(c.yaw), lz = Math.sin(c.yaw); return (rookDir = [hx * Math.cos(a) + lx * Math.sin(a), hz * Math.cos(a) + lz * Math.sin(a)]); }
function giantChess(t, list) { const s = L_(26).s, e = L_(28).s; if (t < s - .3 || t > e) return; const base = carX(s), up = easeOutBack(clamp((t - s + .3) / .7)) * (1 - ease(t, e - .6, e));
  const rook = wt(26, 'rook'), foul = wt(27, 'foul'), ku = ease(t, s, rook + .2), hop = Math.abs(Math.sin(ku * Math.PI * 2)) * 5 * (ku < 1 ? 1 : 0), kick = ease(t, foul - .35, foul), fall = clamp((t - foul) / .45) ** 2;
  const pieces = [{ X: lerp(base + 30, base + 13, ku) - kick * 2.5, Z: 22, kind: 'knight', col: '#1d1a1a', Y: hop + Math.sin(kick * Math.PI) * 2.5 }, { X: base + 6, Z: 22.5, kind: 'rook', col: '#efe6cf', fall }, { X: base - 8, Z: 32, kind: 'rook', col: '#1d1a1a' }];
  for (const pc of pieces) { const p = P(pc.X, 0, pc.Z); if (p[2] < 1.5) continue;
    if (pc.fall > 0) { list.push({ z: p[2], draw: () => rookFallen(pc.X, pc.Z, pc.fall, up, t - foul), shadow: () => { const [hx, hz] = rookHeading(pc.X, pc.Z), th = pc.fall * Math.PI / 2; shadowStick(pc.X + hx * 4 * Math.sin(th) * up, 0, 8 * up * Math.cos(th) + 2 * up, pc.Z + hz * 4 * Math.sin(th) * up, 3 * up, t); } }); continue; }
    list.push({ z: p[2], draw: () => { const k = kAt(p) * up, x = p[0], y = p[1] - (pc.Y || 0) * k; g.save(); g.translate(x, y); if (pc.kind === 'knight') g.scale(-1, 1); g.fillStyle = pc.col; g.strokeStyle = pc.col === '#efe6cf' ? '#8a8070' : '#4a4444'; g.lineWidth = Math.max(1, .1 * k);
    if (pc.kind === 'rook') { g.fillRect(-1.6 * k, -6 * k, 3.2 * k, 6 * k); g.fillRect(-2 * k, -7 * k, 4 * k, 1.2 * k); for (let i = 0; i < 3; i++) g.fillRect((-2 + i * 1.5) * k, -8 * k, 1 * k, 1 * k); g.fillRect(-2.2 * k, -.8 * k, 4.4 * k, .8 * k); g.strokeRect(-1.6 * k, -6 * k, 3.2 * k, 6 * k); }
    else { g.beginPath(); g.moveTo(-2.2 * k, 0); g.lineTo(2.2 * k, 0); g.lineTo(1.3 * k, -3 * k); g.quadraticCurveTo(3 * k, -5 * k, .5 * k, -8 * k); g.lineTo(-2.4 * k, -5.6 * k); g.lineTo(-.2 * k, -5 * k); g.lineTo(-1.3 * k, -3 * k); g.fill(); g.fillStyle = '#efe6cf'; g.beginPath(); g.arc(.1 * k, -6.4 * k, .3 * k, 0, TAU); g.fill(); }
    g.restore(); },
    shadow: () => shadowStick(pc.X, 0, 8 * up, pc.Z, 3 * up, t) }); }
  referee(t, list, up); }
// the white rook as a solid: plinth, shaft, collar and a ring of eight merlons round a hollow top, tipping about the edge
// of its plinth toward the lens; d = seconds since "foul"
function rookFallen(X, Z, fall, up, d) {
  const [hx, hz] = rookHeading(X, Z), th = fall * Math.PI / 2 * .98, ct = Math.cos(th), st = Math.sin(th), R0 = 2.2 * up, vx = -hz, vz = hx;
  const wp = (a, b, c) => { a *= up; b *= up; c *= up; const ar = a - R0, A = ar * ct + b * st + R0, B = -ar * st + b * ct; return P(X + A * hx + c * vx, B, Z + A * hz + c * vz); }; // (along the fall, up the rook, across)
  const ring = (b, r, n = 28) => { const o = []; for (let i = 0; i < n; i++) { const f = i / n * TAU; o.push(wp(Math.cos(f) * r, b, Math.sin(f) * r)); } return o; };
  const cyl = (b0, b1, r, fill) => { const pts = ring(b0, r).concat(ring(b1, r)); if (!ok(pts)) return; poly(hull(pts), fill, '#8a8070', 1.5); };
  // the axis points at the camera once it is down, so the top is the near end: draw base to top
  cyl(0, .8, 2.2, '#e2d8bf'); cyl(.8, 6, 1.6, '#efe6cf'); cyl(6, 7.2, 2.0, '#f3ebd6');
  const top = wp(0, 7.2, 0), ax = wp(0, 8.2, 0), facing = ax[2] < top[2]; // the top end faces us when the axis runs toward the lens
  const merlons = []; for (let i = 0; i < 8; i++) { const f0 = (i + .25) / 8 * TAU, f1 = (i + .75) / 8 * TAU, pts = []; for (const f of [f0, (f0 + f1) / 2, f1]) for (const r of [1.3, 2.0]) for (const b of [7.2, 8.2]) pts.push(wp(Math.cos(f) * r, b, Math.sin(f) * r)); if (ok(pts)) merlons.push({ z: wp(Math.cos((f0 + f1) / 2) * 1.65, 8.2, Math.sin((f0 + f1) / 2) * 1.65)[2], pts }); }
  merlons.sort((a, b) => b.z - a.z);
  if (facing) { const rim = ring(7.2, 2.0); if (ok(rim)) poly(rim, '#e6dcc2', '#8a8070', 1.5); const hole = ring(7.2, 1.3); if (ok(hole)) poly(hole, '#4f473c'); } // the top's deck and its dark hollow
  for (const m of merlons) poly(hull(m.pts), '#f3ebd6', '#8a8070', 1.5);
  if (d > .45) { const u = d - .45, a = clamp(1 - u / 1.4); if (a > 0) { const c = wp(0, 8, 0), k = kAt(c); if (c[2] > 1) for (let i = 0; i < 11; i++) { const ang = i / 11 * Math.PI, r = (2.4 + u * 8) * k; g.fillStyle = `rgba(222,192,140,${.42 * a})`; g.beginPath(); g.ellipse(c[0] + Math.cos(ang + Math.PI) * r, c[1] + 2 * k - Math.sin(ang) * r * .35, 2 * k * (1 + u), .9 * k * (1 + u), 0, 0, TAU); g.fill(); } } } // the dust where the top lands
}
// the referee: black and white stripes, faceless, jogs in from the right and holds a 1.2 m yellow card high on "play"
let refAt = null;
function refWhere() { if (refAt) return refAt; const c = camAt(wt(27, 'play'), true), fx = Math.sin(c.yaw), fz = Math.cos(c.yaw), D = 15, lat = (.78 * W - W / 2) / c.f * D;
  return (refAt = { X: c.x + fx * D + fz * lat, Z: c.z + fz * D - fx * lat, rx: fz, rz: -fx }); }
function referee(t, list, up) { const play = wt(27, 'play'); if (t < play - 1.6) return; const { X: X0, Z: Z0, rx, rz } = refWhere(), run = 1 - ease(t, play - 1.6, play - .35), X = X0 + rx * 7 * run, Z = Z0 + rz * 7 * run;
  const raise = ease(t, play - .14, play + .02), jog = run > .01 ? Math.sin(t * 15) : 0;
  list.push({ z: P(X, 0, Z)[2], draw: () => { const p = P(X, 0, Z); if (p[2] < 1) return; const k = kAt(p) * up, x = p[0], y = p[1] - Math.abs(jog) * .05 * k;
    g.fillStyle = '#1d1a18'; for (const sd of [-1, 1]) { g.save(); g.translate(x + sd * .09 * k, y - .95 * k); g.rotate(sd * jog * .35); g.fillRect(-.07 * k, 0, .14 * k, .92 * k); g.restore(); } // black trousers
    g.fillStyle = '#141216'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(x + sd * .1 * k + sd * jog * .1 * k, y - .03 * k, .12 * k, .05 * k, 0, 0, TAU); g.fill(); }
    g.save(); g.beginPath(); g.moveTo(x - .2 * k, y - .9 * k); g.lineTo(x - .25 * k, y - 1.5 * k); g.lineTo(x + .25 * k, y - 1.5 * k); g.lineTo(x + .2 * k, y - .9 * k); g.closePath(); g.fillStyle = '#f4f1ea'; g.fill(); g.clip();
    g.fillStyle = '#1d1a18'; for (let i = -3; i <= 3; i++) g.fillRect(x + (i * .085 - .022) * k, y - 1.55 * k, .045 * k, .7 * k); g.restore(); // the stripes
    g.fillStyle = '#d7c3a3'; g.fillRect(x - .04 * k, y - 1.58 * k, .08 * k, .09 * k); g.fillStyle = '#ead9bd'; g.beginPath(); g.arc(x, y - 1.7 * k, .13 * k, 0, TAU); g.fill(); // neck, faceless head
    g.strokeStyle = '#f4f1ea'; g.lineCap = 'round'; g.lineWidth = Math.max(1, .09 * k); g.beginPath(); g.moveTo(x - .22 * k, y - 1.45 * k); g.lineTo(x - .3 * k - jog * .1 * k, y - 1.0 * k); g.stroke(); // the free arm
    const hx = lerp(x + .32 * k, x + .3 * k, raise), hy = lerp(y - 1.0 * k, y - 2.12 * k, raise); g.beginPath(); g.moveTo(x + .22 * k, y - 1.45 * k); g.lineTo(hx, hy); g.stroke(); // the card arm
    const cw = .8 * k, ch = 1.2 * k, cx = hx - cw * .3, cy = hy - lerp(.3, 1.08, raise) * ch; g.save(); g.translate(cx, cy + ch / 2); g.rotate(lerp(.9, -.06, raise)); g.fillStyle = '#f2c81e'; g.fillRect(-cw / 2, -ch / 2, cw, ch); g.strokeStyle = '#8a6a10'; g.lineWidth = Math.max(1, .04 * k); g.strokeRect(-cw / 2, -ch / 2, cw, ch); g.restore();
    g.fillStyle = '#ead9bd'; g.beginPath(); g.arc(hx, hy, .06 * k, 0, TAU); g.fill(); },
    shadow: () => shadowStick(X, 0, 1.75 * up, Z, .45 * up, t) }); }

// ---------- Gilliam, stop it from above, once: the giant gavel lands ON the table at the end of refrain 3 ----------
const gavelT = () => L_(34).e - .5; // the moment it hits (after refrain 3's grin teeth have climbed out)
function bigGavel(t) {} // draft 3: drawn on the car layer (gavelCar) so it can sit on top of the table
function toCam(pl, dl) { const w = Lw(...pl), yc = Math.cos(YAW), ys = Math.sin(YAW), dw = [dl[0] * yc - dl[2] * ys, dl[1], dl[0] * ys + dl[2] * yc]; return (C.x - w[0]) * dw[0] + (C.y - w[1]) * dw[1] + (C.z - w[2]) * dw[2]; } // camera side of a car-local direction
function gavelCar(t) { const s = gavelT(); if (t < s - 1.4 || t > s + 2.3) return;
  // draft 9: a real gavel struck face down. The head stands on its striking face in the hat hole (axis straight up); the
  // handle runs out level from its waist, away and to the left, so from GBIG it climbs out of the frame's upper left at
  // about 30 degrees (it read as a barrel on a pole when the handle stood straight up). The head swings down out of the
  // sky on the handle's arc, the hand off frame, hits, holds, and swings back up the same way.
  const HH = 1.45, HR = 1.15, AR = 40, TH = 50 * Math.PI / 180, hh = [-Math.cos(TH), 0, Math.sin(TH)], up = [0, 1, 0], nn = [-hh[2], 0, hh[0]]; // half height, radius, handle length; the handle's heading; across it
  const fallU = clamp((t - (s - .65)) / .65), be = t < s ? -(1 - fallU * fallU) * .9 : -ease(t, s + .9, s + 2.1) * 1.05; // the handle's angle below level (negative: the head is up in the air)
  const sh = ease(t, s - 1.4, s) * (1 - ease(t, s + .9, s + 1.6)); if (sh > 0) { const r = lerp(2.2, 1, ease(t, s - 1.4, s)), pts = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; pts.push(PL(Math.cos(a) * (HR + .35) * r, TOP + .01, Math.sin(a) * (HR + .35) * r * .9)); } g.save(); g.globalAlpha = .5 * sh; poly(pts, '#1a0c06'); g.restore(); } // its shadow comes first
  if (t >= s) gavelBurst(t - s, true); // dust and papers first, so the head reads clean over them
  if (be < -.95) return; const squash = t >= s ? 1 - .12 * Math.exp(-(t - s) * 14) : 1;
  const EL = .2, cb = Math.cos(be), sb = Math.sin(be), ce = Math.cos(be + EL), se = Math.sin(be + EL), d = [ce * hh[0], se, ce * hh[2]], ax = [-sb * hh[0], cb, -sb * hh[2]]; // d: head to hand along the handle (rising EL so it leaves the top of frame); ax: the head's axis, straight up at the strike
  const hand = [AR * Math.cos(EL) * hh[0], TOP + HH + AR * Math.sin(EL), AR * Math.cos(EL) * hh[2]], c = [hand[0] - AR * d[0], hand[1] - AR * d[1], hand[2] - AR * d[2]]; // the head's centre (local)
  const at = (u, r, f) => PL(c[0] + ax[0] * u * squash + r * (Math.cos(f) * d[0] + Math.sin(f) * nn[0]), c[1] + ax[1] * u * squash + r * Math.cos(f) * d[1], c[2] + ax[2] * u * squash + r * (Math.cos(f) * d[2] + Math.sin(f) * nn[2]));
  const ring = (u, r) => { const o = []; for (let i = 0; i < 28; i++) o.push(at(u, r, i / 28 * TAU)); return o; };
  const A = ring(-HH, HR), B = ring(HH, HR); if (![A, B].every(ok)) return;
  // the handle first (its far end is out of frame), tapering toward the head and fat toward the lens's hand side
  const h0 = PL(c[0] + d[0] * HR * .8, c[1] + d[1] * HR * .8, c[2] + d[2] * HR * .8), h1 = PL(...hand);
  if (h0[2] > .3 && h1[2] > .3) { const k0 = kAt(h0), k1 = kAt(h1), ux = -(h1[1] - h0[1]), uy = h1[0] - h0[0], ul = Math.hypot(ux, uy) || 1, w0 = .22 * k0, w1 = .34 * k1;
    const hg = g.createLinearGradient(h0[0] + ux / ul * w0, h0[1] + uy / ul * w0, h0[0] - ux / ul * w0, h0[1] - uy / ul * w0); hg.addColorStop(0, '#c07a44'); hg.addColorStop(1, '#3a1c0c'); g.fillStyle = hg;
    g.beginPath(); g.moveTo(h0[0] + ux / ul * w0, h0[1] + uy / ul * w0); g.lineTo(h1[0] + ux / ul * w1, h1[1] + uy / ul * w1); g.lineTo(h1[0] - ux / ul * w1, h1[1] - uy / ul * w1); g.lineTo(h0[0] - ux / ul * w0, h0[1] - uy / ul * w0); g.fill(); }
  // the head: a turned drum on its striking face, lit from the left, two brass bands, its top face toward the lens
  const body = hull(A.concat(B)), xs = body.map((p) => p[0]); const bg = g.createLinearGradient(Math.min(...xs), 0, Math.max(...xs), 0);
  bg.addColorStop(0, '#d8945a'); bg.addColorStop(.35, '#a45c2c'); bg.addColorStop(.8, '#5e2c12'); bg.addColorStop(1, '#2e1206');
  const drum = (u0, u1, r) => poly(hull(ring(u0, r).concat(ring(u1, r))), bg);
  const capsFirst = !(toCam(c, ax) > 0); // a turned gavel head: two flared ends and a waist; draw from the end away from the lens
  const parts = [[-HH, -HH + .55, HR], [-HH + .5, HH - .5, HR * .8], [HH - .55, HH, HR]]; for (const [u0, u1, r] of capsFirst ? parts.reverse() : parts) drum(u0, u1, r);
  const cw = PL(...c), cam = [C.x, C.y, C.z], cwW = Lw(...c), toC = [cam[0] - cwW[0], cam[1] - cwW[1], cam[2] - cwW[2]];
  const yawc = Math.cos(YAW), yaws = Math.sin(YAW), wv = (v) => [v[0] * yawc - v[2] * yaws, v[1], v[0] * yaws + v[2] * yawc]; // a car-local direction in world axes
  const dW = wv(d), nW = wv(nn), aW = wv(ax), fc = Math.atan2(toC[0] * nW[0] + toC[1] * nW[1] + toC[2] * nW[2], toC[0] * dW[0] + toC[1] * dW[1] + toC[2] * dW[2]); // the side facing the lens
  for (const u of [-HH + .3, HH - .3]) { const w = .1, band = []; for (let i = 0; i <= 14; i++) band.push(at(u - w, HR * 1.03, fc - Math.PI / 2 + i / 14 * Math.PI)); for (let i = 14; i >= 0; i--) band.push(at(u + w, HR * 1.03, fc - Math.PI / 2 + i / 14 * Math.PI)); if (ok(band)) poly(band, '#d9a83a'); }
  const topSeen = toC[0] * aW[0] + toC[1] * aW[1] + toC[2] * aW[2] > 0;
  if (topSeen) { poly(B, '#b87a44', '#e8c050', Math.max(2, .06 * kAt(cw))); const inner = []; for (let i = 0; i < 28; i++) inner.push(at(HH, HR * .62, i / 28 * TAU)); poly(inner, 'rgba(90,40,14,.35)'); } // the end grain, a ring turned in it
  else poly(A, '#b87a44', '#e8c050', 2); // the striking face, seen while it swings up
}
function gavelBurst(d, nearPass) { // on impact: a ring of playa dust and the board's papers blown out over the table
  const fade = clamp(1 - d / 1.8); if (fade <= 0) return;
  // a low, dense, mottled dust cloud rolling out along the sand round the table's base
  for (let i = 0; i < 46; i++) { const a = i / 46 * TAU + rnd(i, 50) * .2, r = (4.8 + rnd(i, 52) * 1.4) * (1 + d * .35), y = .05 + rnd(i, 53) * .25 + d * .12, w = Lw(Math.cos(a) * r, y, Math.sin(a) * r * .55), p = P(...w); if (p[2] < .5) continue; if (nearCar(w[0], w[2]) !== nearPass) continue;
    const k = kAt(p), sz = (.42 + rnd(i, 54) * .38) * (1 + d * .5), ga = clamp(1 - d / 1.4) * clamp(d * 8); g.fillStyle = `rgba(${176 + rnd(i, 55) * 30 | 0},${146 + rnd(i, 55) * 26 | 0},${104 + rnd(i, 55) * 20 | 0},${.82 * ga})`; g.beginPath(); g.ellipse(p[0], p[1], sz * 1.5 * k, sz * k, 0, 0, TAU); g.fill();
    g.fillStyle = `rgba(232,208,160,${.6 * ga})`; g.beginPath(); g.ellipse(p[0] - sz * .35 * k, p[1] - sz * .35 * k, sz * .8 * k, sz * .5 * k, 0, 0, TAU); g.fill(); }
  if (!nearPass) return; // the papers are thrown out from under the head's ends and sides, so the head stays clear
  for (let i = 0; i < 18; i++) { const a = rnd(i, 61) * TAU, v = 5 + rnd(i, 62) * 8, x = Math.cos(a) * (3.4 + v * d), z = Math.sin(a) * (1.6 + v * d * .6), y = TOP + .3 + (6 + rnd(i, 63) * 6) * d - 4.9 * d * d * .5; const p = PL(x, Math.max(.2, y), z); if (p[2] < .5) continue; const k = kAt(p);
    g.save(); g.translate(p[0], p[1]); g.rotate(d * (3 + i) + i); g.scale(Math.cos(d * 6 + i), 1); g.globalAlpha = fade; g.fillStyle = '#f1ebdc'; g.fillRect(-.6 * k, -.42 * k, 1.2 * k, .84 * k); g.fillStyle = '#1d1a18'; g.fillRect(-.52 * k, -.36 * k, 1.04 * k, .14 * k); g.fillStyle = 'rgba(90,84,76,.55)'; for (let r = 0; r < 4; r++) g.fillRect(-.5 * k, (-.14 + r * .12) * k, 1 * k, .05 * k); g.restore(); }
}

// ---------- refrain 3, "control": a giant marionette control bar over the board (critic C, draft 9) ----------
// Two crossed wooden bars come down out of the sky on "control" with a string to every suit's head; each beat the bar
// yanks and the suits jerk upright (car.js reads marionetteJerk); as the drape drops on "blues" it is hauled back up.
// Sized to read from 30 m up: a 10 m bar, 0.7 m thick, hanging 9.5 m over the table.
const MARI = { Y: 9.5, L: 10, CR: 4.6, TH: .9, beat: .625, headY: SEAT + .03 + TORSO + .19 };
// It needs the drone to frame the board at "control" (strings to the heads, the jerk). If the flight is looking past the
// board there, the bar is left out rather than drawn as a stray rope across the sky (a constant, worked out once).
let mariOn = null;
function mariSeen() { if (mariOn !== null) return mariOn; const c = camAt(wt(31, 'control') + .3, true), X = carX(wt(31, 'control') + .3), cp = Math.cos(c.p), sp = Math.sin(c.p);
  let dx = X - c.x, dz = -c.z; const dy = TOP - c.y, a = dx * c.cy - dz * c.sy; dz = dx * c.sy + dz * c.cy; dx = a; const z = -dy * sp + dz * cp, y = dy * cp + dz * sp, sx = W / 2 + c.f * dx / z, sy = H / 2 - c.f * y / z;
  return (mariOn = z > 1 && sx > 0 && sx < W && sy > 80 && sy < H - 80); }
function mariState(t) { const c = wt(31, 'control'), b = wt(31, 'blues'); if (t < c - 1.9 || t > b + 2.4 || !mariSeen()) return null;
  const down = ease(t, c - 1.9, c), gone = ease(t, b + .35, b + 2.4), n = t >= c ? Math.floor((t - c) / MARI.beat) : -1, ph = t >= c ? t - c - n * MARI.beat : 0, yank = t >= c && t < b + .35 ? Math.exp(-ph / .1) : 0;
  return { y: MARI.Y + 46 * (1 - down) ** 2 + 46 * gone * gone + .7 * yank, yank, tilt: (n % 2 ? 1 : -1) * .07 * yank, taut: down * (1 - gone) }; }
function marionetteJerk(t, i) { const m = mariState(t); if (!m || m.taut < .4) return 0; return m.taut * (.35 + 1.5 * m.yank); } // car.js: an upward jolt in its bounce units (x 0.09 m)
function marionette(t) { const m = mariState(t); if (!m) return;
  const rot = (x, z) => [x * Math.cos(m.tilt), m.y + x * Math.sin(m.tilt), z]; // the bar rocks a little on each yank
  const strings = [];
  for (const st of SEATS) { const ax = clamp(st.x * .92, -MARI.L / 2 + .3, MARI.L / 2 - .3), az = st.z ? Math.sign(st.z) * .25 : 0, a = rot(ax, az), hy = MARI.headY + m.taut * (.35 + 1.5 * m.yank) * .09;
    const top = PL(...a), bot = PL(st.x, lerp(a[1] - 2, hy + .12, m.taut), st.z); if (top[2] > .3 && bot[2] > .3) strings.push([top, bot]); }
  g.save(); g.lineCap = 'round';
  for (const [a, b] of strings) { const k = kAt(b); g.strokeStyle = 'rgba(38,28,22,.85)'; g.lineWidth = Math.max(1.3, .045 * k); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  const r0 = PL(0, m.y + .3, 0), r1 = PL(0, m.y + 80, 0); if (r0[2] > .3 && r1[2] > .3) { g.strokeStyle = 'rgba(38,28,22,.9)'; g.lineWidth = Math.max(1.5, .07 * kAt(r0)); g.beginPath(); g.moveTo(r0[0], r0[1]); g.lineTo(r1[0], r1[1]); g.stroke(); } // the line up out of the sky
  const beam = (a, b) => { const p = PL(...a), q = PL(...b); if (p[2] < .3 || q[2] < .3) return; const kp = kAt(p) * MARI.TH / 2, kq = kAt(q) * MARI.TH / 2, ux = -(q[1] - p[1]), uy = q[0] - p[0], ul = Math.hypot(ux, uy) || 1, nx = ux / ul, ny = uy / ul;
    g.fillStyle = '#6b4a2a'; g.beginPath(); g.moveTo(p[0] + nx * kp, p[1] + ny * kp); g.lineTo(q[0] + nx * kq, q[1] + ny * kq); g.lineTo(q[0] - nx * kq, q[1] - ny * kq); g.lineTo(p[0] - nx * kp, p[1] - ny * kp); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,214,160,.28)'; g.beginPath(); g.moveTo(p[0] - nx * kp, p[1] - ny * kp); g.lineTo(q[0] - nx * kq, q[1] - ny * kq); g.lineTo(q[0] - nx * kq * .3, q[1] - ny * kq * .3); g.lineTo(p[0] - nx * kp * .3, p[1] - ny * kp * .3); g.closePath(); g.fill(); // the lit edge
    g.fillStyle = '#4a3018'; for (const [e, ke] of [[p, kp], [q, kq]]) { g.beginPath(); g.arc(e[0], e[1], ke, 0, TAU); g.fill(); } };
  const bars = [[rot(-MARI.L / 2, 0), rot(MARI.L / 2, 0)], [rot(0, -MARI.CR / 2), rot(0, MARI.CR / 2)]].map(([a, b]) => ({ a, b, z: PL(...a)[2] + PL(...b)[2] })).sort((u, v) => v.z - u.z);
  for (const bb of bars) beam(bb.a, bb.b);
  g.restore(); }

// ---------- the pie of lies: blackbirds burst out on "pie" (four and twenty, near enough) ----------
// Also the car-layer hook for this file: drawCar calls pieBirds last, so installsCar draws over the table.
function pieBirds(t) { const s = wt(23, 'pie'); if (t >= s && t <= s + 2.4)
  for (let i = 0; i < 9; i++) { const u = clamp((t - s - i * .06) / 2); if (u <= 0) continue; const p = PL(-.15 + (rnd(i, 31) - .5) * .4 + u * (rnd(i, 32) - .5) * 8, TOP + .1 + u * 4, -.95 - u * 2); if (p[2] < .3) continue; const k = kAt(p), f = Math.sin(t * 30 + i) * .25 * k;
    g.fillStyle = '#16131a'; g.beginPath(); g.ellipse(p[0], p[1], .14 * k, .07 * k, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] - .3 * k, p[1] - f); g.lineTo(p[0] - .1 * k, p[1] + .02 * k); g.lineTo(p[0] + .3 * k, p[1] - f); g.lineTo(p[0] + .1 * k, p[1] + .02 * k); g.fill(); }
  } // draft 9: installsCar is called by drawCar (car.js) right after pieBirds; calling it here too drew it twice
// Nakamura, inhabit the object: tiny burners climb the line chart on the whiteboard (drawn in board units)
function chartClimbers(t) { const pts = [[.58, .8], [.66, .72], [.73, .76], [.8, .58], [.87, .5], [.93, .34]];
  for (let i = 0; i < 3; i++) { const u = ((t * .05 + i / 3) % 1) * 5, j = Math.floor(u), f = u - j, a = pts[j], b = pts[j + 1]; const x = lerp(a[0], b[0], f), y = lerp(a[1], b[1], f) - .012;
    g.fillStyle = ['#d8452f', '#2f6fb5', '#3c8c5a'][i]; g.fillRect(x - .006, y - .03, .012, .03); g.fillStyle = '#e8d4b4'; g.beginPath(); g.arc(x, y - .036, .007, 0, TAU); g.fill(); } }

// a dust devil rises on the bridge's "spin" too; one drifts across the background all day (the refrain whirls are in installsInto / installsCar)
function spinDevils(t) { const s = wt(19, 'spin'); const amt = ease(t, s - .3, s + 1) * (1 - ease(t, s + 5, s + 7)); if (amt > 0) dustDevil(carX(s) + 16, 28, t, amt, 19); dustDevil(carX(clamp(t, 14, 238)) - 45 + ((t * 3) % 90), 95, t, .6 * (1 - nightAmt(t)), 3); }

// scene hook (draft 3): pushes {z, draw, shadow} into list. The far half of the spin whirl and of the gavel's dust ring.
function installsInto(t, list) {
  eyeCar(t, list); drapeInto(t, list);
  for (const o of whirlItems(t)) { if (nearCar(o.X, o.Z)) continue; list.push({ z: P(o.X, 0, o.Z)[2], draw: () => drawWhirl(o, t), shadow: o.kind === 'devil' ? null : () => shadowStick(o.X, 0, 3, o.Z, 2.5, t) }); }
  const gs = gavelT(); if (t > gs && t < gs + 1.8) list.push({ z: P(CX, 0, CZ)[2] + .01, draw: () => gavelBurst(t - gs, false), shadow: null });
}
// car-layer hook: things in front of the table (near half of the whirl, near papers), then the gavel over everything
function installsCar(t) {
  const near = whirlItems(t).filter((o) => nearCar(o.X, o.Z)).map((o) => [P(o.X, 0, o.Z)[2], () => drawWhirl(o, t)]);
  for (const o of paperItems(t)) if (nearCar(o.X, o.Z)) near.push([P(o.X, o.Y, o.Z)[2], () => drawPaper(o)]);
  near.sort((a, b) => b[0] - a[0]); for (const [, d] of near) d();
  marionette(t); gavelCar(t);
}
// overlay hook (draft 3): drawn after the scene, before the grade.
function installsOver(t) {}
