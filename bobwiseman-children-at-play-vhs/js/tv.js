// tv.js · stage 3: the taped home video played back on a CRT television, 1920 x 1080.
// Reads the ntsc-rs tape frames (work/tape_<preset>/f_000001.png ...), adds what the VCR itself puts on the screen
// (blue screen, PLAY, snow while the heads find the tape, the tracking band rolling through as it locks), then the
// tube: the house CRT shader, a rounded glass face, a plastic bezel, and the screen's light on the dark room.
// Page params: ?preset=medium (folder work/tape_medium), &fps=24. Pure in t: the same t always draws the same frame.
(function () {
  const W = 1920, H = 1080, SIG_W = 960, SIG_H = 720, FPS = 24;
  const T = window.TIMING;
  const qs = new URLSearchParams(location.search);
  const preset = qs.get('preset') || 'medium';
  const out = document.getElementById('c'), o = out.getContext('2d');
  const sig = document.createElement('canvas'); sig.width = SIG_W; sig.height = SIG_H;
  const sg = sig.getContext('2d');
  // tube geometry: a 4:3 face centred in the 16:9 frame
  const TUBE = { x: 400, y: 112, w: 1120, h: 840, r: 64 };
  const BEZEL = { x: 334, y: 46, w: 1252, h: 1000, r: 46 };
  const crt = makeCRT(TUBE.w, TUBE.h, 240, SIG_W, SIG_H);
  const avgC = document.createElement('canvas'); avgC.width = avgC.height = 1;
  const avgG = avgC.getContext('2d', { willReadFrequently: true });

  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  async function loadFrame(f) {
    const img = new Image();
    img.src = `work/tape_${preset}/f_${String(f + 1).padStart(6, '0')}.png`;
    try { await img.decode(); return img; } catch { return null; }
  }
  function snow(g, f, k) {
    const id = g.getImageData(0, 0, SIG_W, SIG_H), d = id.data;
    for (let y = 0; y < SIG_H; y += 2) {
      const line = 0.75 + 0.25 * hash(y, f);
      for (let x = 0; x < SIG_W; x += 2) {
        const v = 255 * line * Math.pow(hash(x * 1.3 + y * 0.7, f * 3.1 + y), 2) * k;
        for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const i = ((y + dy) * SIG_W + x + dx) * 4; d[i] = d[i] * (1 - k) + v; d[i + 1] = d[i + 1] * (1 - k) + v; d[i + 2] = d[i + 2] * (1 - k) + v; }
      }
    }
    g.putImageData(id, 0, 0);
  }
  // the tracking band: a strip of torn lines and snow rolling bottom to top while the VCR locks on
  function trackingBand(g, f, yc, hgt, src) {
    const y0 = Math.max(0, Math.floor(yc - hgt / 2)), y1 = Math.min(SIG_H, Math.ceil(yc + hgt / 2));
    for (let y = y0; y < y1; y += 2) {
      const k = 1 - Math.abs((y - yc) / (hgt / 2));
      const sh = (hash(y, f) - 0.3) * 120 * k;
      g.drawImage(src, 0, y, SIG_W, 2, sh, y, SIG_W, 2);
    }
    const id = g.getImageData(0, y0, SIG_W, Math.max(1, y1 - y0)), d = id.data;
    for (let y = 0; y < y1 - y0; y++) {
      const k = 1 - Math.abs((y0 + y - yc) / (hgt / 2));
      for (let x = 0; x < SIG_W; x++) {
        const n = hash(x + y * 0.37, f + y), i = (y * SIG_W + x) * 4;
        if (n > 1 - 0.32 * k) { d[i] = d[i + 1] = d[i + 2] = 230; }
        else { d[i] *= 1 - 0.35 * k; d[i + 1] *= 1 - 0.35 * k; d[i + 2] *= 1 - 0.35 * k; }
      }
    }
    g.putImageData(id, 0, y0);
  }
  function osd(g, label) {
    PIXFONT.text(g, label, 64, 54, 5, '#f2f2f2', 'rgba(0,0,0,.55)');
  }
  const copy = document.createElement('canvas'); copy.width = SIG_W; copy.height = SIG_H;
  const cg = copy.getContext('2d');

  async function buildSignal(t) {
    const f = Math.round(t * FPS);
    sg.setTransform(1, 0, 0, 1, 0, 0); sg.globalAlpha = 1; sg.filter = 'none';
    if (t < T.tapeBlue[1]) {
      sg.fillStyle = '#1a33c4'; sg.fillRect(0, 0, SIG_W, SIG_H);
      osd(sg, 'PLAY >');
      return { snow: 0.004, jit: 0.2 };
    }
    if (t < T.tapeSnow[1]) {
      sg.fillStyle = '#202020'; sg.fillRect(0, 0, SIG_W, SIG_H);
      snow(sg, f, 1);
      osd(sg, 'PLAY >');
      return { snow: 0.08, jit: 2.5 };
    }
    const img = await loadFrame(f);
    if (img) sg.drawImage(img, 0, 0, SIG_W, SIG_H); else { sg.fillStyle = '#000'; sg.fillRect(0, 0, SIG_W, SIG_H); }
    const roll = (t - T.pictureIn) / 1.15;
    if (roll < 1) {
      cg.drawImage(sig, 0, 0);
      const yc = SIG_H + 80 - roll * (SIG_H + 220);
      trackingBand(sg, f, yc, 150 - 60 * roll, copy);
      if (roll < 0.12) { sg.globalAlpha = 0.5 * (1 - roll / 0.12); snow(sg, f, 0.6); sg.globalAlpha = 1; }
    }
    if (t < T.osdOff) osd(sg, 'PLAY >');
    return { snow: 0.022, jit: roll < 1 ? 1.4 : 0.55 };
  }
  function rounded(g, r) { g.beginPath(); g.roundRect(r.x, r.y, r.w, r.h, r.r); }

  async function draw(t) {
    const s = await buildSignal(t);
    const f = Math.round(t * FPS);
    crt.render(sig, { frame: f, snow: s.snow, jit: s.jit, chroma: 1.0, raster: [0.965, 0.965], bright: 0.98, dot: 0, over: 1.0 });
    avgG.drawImage(sig, 0, 0, 1, 1); const [ar, ag, ab] = avgG.getImageData(0, 0, 1, 1).data;
    // the room: dark, lit only by the screen
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.fillStyle = '#050403'; o.fillRect(0, 0, W, H);
    const spill = o.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 1150);
    spill.addColorStop(0, `rgba(${ar},${ag},${ab},.26)`); spill.addColorStop(1, `rgba(${ar},${ag},${ab},0)`);
    o.fillStyle = spill; o.fillRect(0, 0, W, H);
    // bezel: dark plastic with a soft top light from the screen and a small power light
    rounded(o, BEZEL);
    const bz = o.createLinearGradient(0, BEZEL.y, 0, BEZEL.y + BEZEL.h);
    bz.addColorStop(0, '#1d1b1a'); bz.addColorStop(0.5, '#141312'); bz.addColorStop(1, '#0c0b0b');
    o.fillStyle = bz; o.fill();
    o.strokeStyle = 'rgba(255,255,255,.05)'; o.lineWidth = 2; o.stroke();
    // inner bevel round the glass
    const bev = { x: TUBE.x - 16, y: TUBE.y - 16, w: TUBE.w + 32, h: TUBE.h + 32, r: TUBE.r + 14 };
    rounded(o, bev); o.fillStyle = '#070707'; o.fill();
    o.strokeStyle = `rgba(${ar},${ag},${ab},.16)`; o.lineWidth = 3; o.stroke();
    o.fillStyle = '#7a1410'; o.beginPath(); o.arc(BEZEL.x + BEZEL.w - 70, BEZEL.y + BEZEL.h - 26, 4.5, 0, Math.PI * 2); o.fill();
    o.fillStyle = 'rgba(255,60,40,.35)'; o.beginPath(); o.arc(BEZEL.x + BEZEL.w - 70, BEZEL.y + BEZEL.h - 26, 9, 0, Math.PI * 2); o.fill();
    // the tube
    o.save(); rounded(o, TUBE); o.clip();
    o.drawImage(crt.canvas, TUBE.x, TUBE.y, TUBE.w, TUBE.h);
    // glass: a faint reflection band up top-left and the darker curved edges
    const gl = o.createLinearGradient(TUBE.x, TUBE.y, TUBE.x + TUBE.w * 0.6, TUBE.y + TUBE.h * 0.7);
    gl.addColorStop(0, 'rgba(255,255,255,.07)'); gl.addColorStop(0.35, 'rgba(255,255,255,.025)'); gl.addColorStop(0.36, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    o.fillStyle = gl; o.fillRect(TUBE.x, TUBE.y, TUBE.w, TUBE.h);
    const edge = o.createRadialGradient(W / 2, TUBE.y + TUBE.h / 2, TUBE.h * 0.45, W / 2, TUBE.y + TUBE.h / 2, TUBE.w * 0.72);
    edge.addColorStop(0, 'rgba(0,0,0,0)'); edge.addColorStop(1, 'rgba(0,0,0,.42)');
    o.fillStyle = edge; o.fillRect(TUBE.x, TUBE.y, TUBE.w, TUBE.h);
    o.restore();
  }
  let ready = (async () => { await loadFrame(48); })();
  window.__ready = ready;
  window.__frameJPEG = async (t, q = 0.92) => { await draw(t); return out.toDataURL('image/jpeg', q); };
  if (!qs.has('offline')) draw(Number(qs.get('t') || 8));
})();
