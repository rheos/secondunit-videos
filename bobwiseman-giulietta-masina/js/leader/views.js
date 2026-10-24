// Three framings of one place, the projection: TIGHT (the projected frame on the screen), STRIP (the film in
// the projector gate, sprocket holes and soundtrack at the edges), ROOM (dark cinema, the beam through smoke).

// ---------- projected frame (tight) ----------
function weave(f, tc) { return [n1(31, tc * 2.1) * 3 + (rnd(f, 32) - .5) * 2.6, n1(33, tc * 1.7) * 3.5 + (rnd(f, 34) - .5) * 3]; }
// Draw the projected picture `src` (LW x LH) into rect cx,cy,w,h with gate edge, hotspot and lamp flicker.
function projected(g, src, cx, cy, w, h, f, tc, bright = 1) {
  const [dx, dy] = weave(f, tc);
  const x = cx - w / 2 + dx * w / LW, y = cy - h / 2 + dy * h / LH;
  g.save();
  g.beginPath(); g.roundRect(x, y, w, h, w * .012); g.clip();
  g.globalAlpha = 1; g.drawImage(src, x, y, w, h);
  // lamp hotspot + corner falloff
  const rg = g.createRadialGradient(x + w / 2, y + h / 2, h * .1, x + w / 2, y + h / 2, w * .62);
  rg.addColorStop(0, `rgba(255,255,250,${.06 * bright})`); rg.addColorStop(.6, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,.5)');
  g.fillStyle = rg; g.fillRect(x, y, w, h);
  // the soft gate edge
  const e = w * .018;
  for (const [x0, y0, x1, y1, rx, ry, rw, rh] of [[x, 0, x + e, 0, x, y, e, h], [x + w, 0, x + w - e, 0, x + w - e, y, e, h], [0, y, 0, y + e, x, y, w, e], [0, y + h, 0, y + h - e, x, y + h - e, w, e]]) {
    const lg = g.createLinearGradient(x0, y0, x1, y1); lg.addColorStop(0, 'rgba(0,0,0,.75)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lg; g.fillRect(rx, ry, rw, rh);
  }
  g.restore();
}
function lampFlicker(f, tc) { return 1 + (rnd(f, 21) - .5) * .09 + n1(22, tc * 6) * .025; }

// ---------- strip in the gate ----------
const MM = 36.6; // px per mm at strip scale 1 (Academy aperture 20.96 mm wide = 767 px)
function soundtrack(g, x, y0, y1, tc, s) { // variable-area track: a white wavy band on black
  g.fillStyle = '#0c0c0c'; g.fillRect(x - 1.3 * MM * s, y0, 2.6 * MM * s, y1 - y0);
  g.beginPath();
  for (let y = y0; y <= y1; y += 3) { const a = .5 + .45 * Math.abs(Math.sin(y * .05 + tc * 9) * Math.sin(y * .013 + tc * 2.3)); g.lineTo(x + a * MM * s * 1.1, y); }
  for (let y = y1; y >= y0; y -= 3) { const a = .5 + .45 * Math.abs(Math.sin(y * .05 + tc * 9) * Math.sin(y * .013 + tc * 2.3)); g.lineTo(x - a * MM * s * 1.1, y); }
  g.closePath(); g.fillStyle = 'rgba(232,232,226,.92)'; g.fill();
}
// frames: function(slot) -> {canvas} or null for missing film (past the tail). phase = scroll position in frames.
function stripView(g, tc, f, s, phase, frameFor, opt = {}) {
  const pitch = 19 * MM * s, fw = 20.96 * MM * s, fh = 15.29 * MM * s, half = 17.5 * MM * s;
  const cx = W / 2 + (opt.x || 0), cy = H / 2;
  // back light: the lamp behind the gate
  g.fillStyle = '#050505'; g.fillRect(0, 0, W, H);
  const fl = lampFlicker(f, tc);
  const rg = g.createRadialGradient(cx, cy, 30, cx, cy, W * .55); rg.addColorStop(0, `rgba(255,252,240,${.95 * fl})`); rg.addColorStop(.45, `rgba(200,196,186,${.55 * fl})`); rg.addColorStop(1, 'rgba(20,20,20,.0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  const [dx, dy] = weave(f, tc);
  const top = opt.tailY === undefined ? -1e9 : opt.tailY; // film exists only below tailY (screen y), above is bare light
  g.save(); g.translate(cx + dx * .6, cy + dy * .6);
  g.save(); g.beginPath(); g.rect(-half, Math.max(top - cy, -H), half * 2, 3 * H); g.clip();
  // film base (dark grey-black on a leader), then frames
  g.fillStyle = '#1b1b1a'; g.fillRect(-half, -H, half * 2, H * 2);
  const ph = phase - Math.floor(phase);
  for (let j = -2; j <= 2; j++) {
    const yc = (j + ph) * pitch, slot = Math.floor(phase) - j;
    const fr = frameFor(slot, j);
    if (fr) g.drawImage(fr, -fw / 2 + .6 * MM * s, yc - fh / 2, fw, fh);
    soundtrack(g, -fw / 2 - 1.6 * MM * s, yc - pitch / 2, yc + pitch / 2, tc + slot * .05, s);
    // 4 perforations each side per frame
    for (let p = 0; p < 4; p++) {
      const py = yc - pitch / 2 + (p + .5) * pitch / 4;
      for (const sx of [-1, 1]) { g.beginPath(); g.roundRect(sx * 14.1 * MM * s - 1.4 * MM * s, py - .99 * MM * s, 2.8 * MM * s, 1.98 * MM * s, .5 * MM * s); g.fillStyle = `rgba(255,253,244,${.96 * fl})`; g.fill(); }
    }
  }
  // edge darkening + base scratches running the full strip
  const eg = g.createLinearGradient(-half, 0, half, 0); eg.addColorStop(0, 'rgba(0,0,0,.55)'); eg.addColorStop(.08, 'rgba(0,0,0,0)'); eg.addColorStop(.92, 'rgba(0,0,0,0)'); eg.addColorStop(1, 'rgba(0,0,0,.55)');
  g.fillStyle = eg; g.fillRect(-half, -H, half * 2, H * 2);
  g.restore();
  // ragged tail end of the film
  if (opt.tailY !== undefined) {
    g.fillStyle = '#1b1b1a'; g.beginPath(); g.moveTo(-half, top - cy);
    for (let k = 0; k <= 12; k++) g.lineTo(-half + k / 12 * half * 2, top - cy + (rnd(k, 7) - .5) * 14 + (k % 2) * 6);
    g.lineTo(half, top - cy + 30); g.lineTo(-half, top - cy + 30); g.closePath(); g.fill();
  }
  g.restore();
  // the gate plate over everything except the aperture
  if (!opt.noGate) {
    g.save(); g.fillStyle = 'rgba(8,8,8,.62)';
    const ax = cx - fw / 2 + .6 * MM * s - 4, ay = cy - fh / 2 - 4, aw = fw + 8, ah = fh + 8;
    g.beginPath(); g.rect(0, 0, W, H); g.roundRect(ax, ay, aw, ah, 10); g.fill('evenodd');
    g.strokeStyle = 'rgba(0,0,0,.9)'; g.lineWidth = 6; g.beginPath(); g.roundRect(ax, ay, aw, ah, 10); g.stroke();
    // gate rails
    g.fillStyle = 'rgba(30,30,30,.7)'; g.fillRect(cx - half - 40, 0, 26, H); g.fillRect(cx + half + 14, 0, 26, H);
    g.restore();
  }
}

// ---------- the room: dark cinema, beam over the seats, screen ----------
let SMOKE = null, BEAM = null;
function buildSmoke() {
  SMOKE = [];
  for (let k = 0; k < 2; k++) {
    const c = mkCanvas(960, 540), g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, 960, 540);
    for (const [cells, amp] of [[6, .55], [12, .35], [26, .2], [54, .12]]) {
      const sm = mkCanvas(cells * 2, cells + 2), sg = sm.getContext('2d'), d = sg.createImageData(sm.width, sm.height);
      for (let i = 0; i < sm.width * sm.height; i++) { const v = Math.pow(rnd(k * 17 + cells, i), 1.6) * 255; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
      sg.putImageData(d, 0, 0);
      g.globalAlpha = amp; g.globalCompositeOperation = 'lighter'; g.imageSmoothingQuality = 'high'; g.drawImage(sm, 0, 0, 960, 540);
    }
    SMOKE.push(c);
  }
}
// Screen rect in room coordinates (before camera): centred, a little high.
const SCREEN = { x: 960, y: 470, w: 1000, h: 730 };
function roomView(g, tc, f, cam, screenSrc, screenBright, opt = {}) {
  if (!SMOKE) buildSmoke();
  g.fillStyle = '#030303'; g.fillRect(0, 0, W, H);
  g.save();
  g.translate(W / 2, H / 2); g.scale(cam.s, cam.s); g.translate(-cam.x, -cam.y);
  const S = SCREEN, sx = S.x - S.w / 2, sy = S.y - S.h / 2;
  const L = screenBright; // 0..1.2 how much light comes off the screen / through the beam
  // wall + proscenium lit by the screen spill
  const wg = g.createRadialGradient(S.x, S.y, S.w * .4, S.x, S.y, S.w * 1.4);
  wg.addColorStop(0, `rgba(70,70,68,${.55 * L})`); wg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = wg; g.fillRect(-600, -400, W + 1200, H + 800);
  // curtains at the sides of the screen
  for (const side of [-1, 1]) {
    const x0 = S.x + side * (S.w / 2 + 20);
    for (let k = 0; k < 7; k++) {
      const x = x0 + side * k * 34, lit = Math.max(0, .5 - k * .06) * L;
      const lg = g.createLinearGradient(x, 0, x + side * 34, 0); lg.addColorStop(0, `rgba(${40 + 60 * lit},${40 + 60 * lit},${40 + 58 * lit},1)`); lg.addColorStop(1, 'rgba(10,10,10,1)');
      g.fillStyle = lg; g.fillRect(Math.min(x, x + side * 34), sy - 120, 34, S.h + 260);
    }
  }
  // screen masking border + the picture
  g.fillStyle = '#0a0a0a'; g.fillRect(sx - 18, sy - 18, S.w + 36, S.h + 36);
  if (screenSrc) projected(g, screenSrc, S.x, S.y, S.w, S.h, f, tc, L);
  else { g.fillStyle = `rgba(232,232,228,${clamp(L)})`; g.fillRect(sx, sy, S.w, S.h); }
  if (opt.screenFx) opt.screenFx(g, sx, sy, S.w, S.h);
  // beam: the booth port is up and to the left behind us, so the beam crosses the dark at a slant.
  // Drawn at half size into its own layer, softened, then added on.
  if (L > 0.01) {
    BEAM = mkCanvas(960, 540); // fresh each frame: a reused layer leaked a few pixel levels between frames
    const bg = BEAM.getContext('2d'); bg.setTransform(1, 0, 0, 1, 0, 0); bg.globalAlpha = 1; bg.globalCompositeOperation = 'source-over';
    bg.clearRect(0, 0, 960, 540);
    bg.setTransform(.5 * cam.s, 0, 0, .5 * cam.s, .5 * (W / 2 - cam.x * cam.s), .5 * (H / 2 - cam.y * cam.s));
    const P = [-700, -900];
    bg.save();
    bg.beginPath(); bg.moveTo(P[0], P[1] - 300); bg.lineTo(sx + S.w, sy); bg.lineTo(sx + S.w, sy + S.h); bg.lineTo(sx, sy + S.h); bg.lineTo(P[0], P[1] + 500); bg.closePath(); bg.rect(sx - 18, sy - 18, S.w + 36, S.h + 36); bg.clip('evenodd');
    bg.globalCompositeOperation = 'lighter';
    // haze, brighter toward the lamp
    const hg = bg.createLinearGradient(P[0], P[1], S.x, S.y); hg.addColorStop(0, `rgba(230,230,225,${.34 * L})`); hg.addColorStop(.6, `rgba(230,230,225,${.12 * L})`); hg.addColorStop(1, `rgba(230,230,225,${.05 * L})`);
    bg.fillStyle = hg; bg.fillRect(-1600, -1600, W + 3200, H + 3200);
    // smoke drifting through the beam: billows that catch the light
    for (let k = 0; k < 2; k++) {
      const ox = (tc * (16 + k * 11)) % (1920 * 1.25), oy = n1(70 + k, tc * .1) * 40;
      bg.globalAlpha = (.55 - k * .2) * L;
      for (const ix of [-1, 0, 1]) bg.drawImage(SMOKE[k], -300 + ix * 1920 * 1.25 + ox * (k ? -1 : 1), -800 + oy, 1920 * 1.25, 1080 * 1.8);
    }
    // light shafts from the port, flickering together with the film, each a little on its own
    const fk = .75 + .5 * rnd(f, 88);
    for (let k = 0; k < 44; k++) {
      const u = rnd(k, 3), v = rnd(k, 6), thin = k % 3 === 0;
      const a = (thin ? .14 : .05) * (.5 + rnd(k, 4)) * L * fk * (.8 + .4 * rnd(f, k));
      const x1 = sx + u * S.w, y1 = sy + v * S.h;
      const lg = bg.createLinearGradient(P[0], P[1], x1, y1); lg.addColorStop(0, `rgba(255,255,248,${a})`); lg.addColorStop(1, `rgba(255,255,248,${a * .25})`);
      bg.globalAlpha = 1; bg.strokeStyle = lg; bg.lineWidth = thin ? 2 + rnd(k, 5) * 4 : 16 + rnd(k, 5) * 50;
      bg.beginPath(); bg.moveTo(P[0], P[1] + (v - .3) * 700); bg.lineTo(x1, y1); bg.stroke();
    }
    // dust motes turning in the light
    for (let k = 0; k < 60; k++) {
      const u = rnd(k, 11), x = lerp(P[0], S.x, .45 + .5 * u) + n1(k, tc * .3) * 120, y = lerp(P[1], S.y, .45 + .5 * u) + (rnd(k, 12) - .5) * 600 + n1(k + 9, tc * .25) * 80;
      bg.fillStyle = `rgba(255,255,250,${(.25 + .5 * rnd(k, 13)) * L * (.6 + .4 * Math.sin(tc * 3 + k))})`; bg.fillRect(x, y, 3, 3);
    }
    bg.restore();
    g.restore(); // drop the camera; composite the soft layer in screen space
    g.save(); g.globalCompositeOperation = 'lighter'; g.filter = 'blur(3px)'; g.drawImage(BEAM, 0, 0, W, H); g.filter = 'none'; g.restore();
    g.save(); g.translate(W / 2, H / 2); g.scale(cam.s, cam.s); g.translate(-cam.x, -cam.y);
  }
  // empty seats in silhouette, rim-lit by the screen
  for (let row = 0; row < 3; row++) {
    const y = 1000 + row * 70, n = 16 + row * 2, sw = 150 + row * 20;
    for (let k = -1; k < n; k++) {
      const x = -260 + k * sw + (row % 2) * sw / 2;
      g.fillStyle = '#060606'; g.beginPath(); g.roundRect(x, y - 90, sw - 18, 180, 26); g.fill();
      g.strokeStyle = `rgba(150,150,146,${.35 * L / (1 + row)})`; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 22, y - 88); g.lineTo(x + sw - 40, y - 88); g.stroke();
    }
  }
  g.restore();
}
