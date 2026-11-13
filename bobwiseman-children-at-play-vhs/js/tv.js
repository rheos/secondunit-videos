// tv.js · stage 3: the taped home video played back on a CRT television, 1920 x 1080.
// Reads the ntsc-rs tape frames (work/tape_<preset>/f_000001.png ...), adds what the VCR itself puts on the screen
// (blue screen, PLAY, snow while the heads find the tape, the tracking band rolling through as it locks), then the
// tube (the house CRT shader) set into a photographed 1990s den (assets/tvroom_1990s.png, GPT Image, its chroma-green
// screen keyed out), the screen's light spilling on the room, and a slow push-in from the room to the screen.
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
  const crt = makeCRT(TUBE.w, TUBE.h, 240, SIG_W, SIG_H);
  const avgC = document.createElement('canvas'); avgC.width = avgC.height = 1;
  const avgG = avgC.getContext('2d', { willReadFrequently: true });

  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  async function loadFrame(f) {
    const img = new Image();
    img.src = `work/tape_${preset}/f_${String(f + 1).padStart(6, '0')}.jpg`;
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
    if (T.vcrStop && t >= T.vcrStop) {          // the VCR stops: its blue screen and STOP
      sg.fillStyle = '#1a33c4'; sg.fillRect(0, 0, SIG_W, SIG_H);
      osd(sg, 'STOP');
      return { snow: 0.004, jit: 0.2 };
    }
    if (T.tapeEnd && t >= T.tapeEnd) {          // past the end of the recording: blank tape, snow
      sg.fillStyle = '#202020'; sg.fillRect(0, 0, SIG_W, SIG_H);
      snow(sg, f, 1);
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
    const rw = T.rewind;                          // the brother's tape rewinding: the VCR's own REW, then PLAY again
    if (rw && t >= rw[0] && t < rw[1]) osd(sg, '<< REW');
    if (rw && t >= rw[1] && t < rw[1] + 1.6) osd(sg, 'PLAY >');
    return { snow: 0.022, jit: roll < 1 ? 1.4 : (rw && t >= rw[0] && t < rw[1] ? 2.2 : 0.55) };
  }
  function rounded(g, r) { g.beginPath(); g.roundRect(r.x, r.y, r.w, r.h, r.r); }

  async function draw(t) {
    const s = await buildSignal(t);
    const f = Math.round(t * FPS);
    // switching the set off: the picture collapses to a bright line, then a dot, which fades
    let rx = 0.965, ry = 0.965, bright = 0.98, dot = 0, on = 1;
    if (T.powerOff && t >= T.powerOff) {
      const u = (t - T.powerOff) / 0.42;
      ry = u < 0.5 ? 0.965 + (0.006 - 0.965) * smooth01(u / 0.5) : 0.006;
      rx = u < 0.5 ? 0.965 : 0.965 + (0.006 - 0.965) * smooth01((u - 0.5) / 0.5);
      bright = 0.98 + 1.4 * smooth01(u / 0.5);
      dot = u < 0.5 ? 0 : u < 1 ? smooth01((u - 0.5) / 0.5) : Math.max(0, 1 - (t - T.powerOff - 0.42) / 0.7);
      on = Math.max(0, 1 - smooth01(u));
    }
    crt.render(sig, { frame: f, snow: s.snow, jit: s.jit, chroma: 1.0, raster: [rx, ry], bright, dot, over: 1.0 });
    avgG.drawImage(sig, 0, 0, 1, 1); let [ar, ag, ab] = avgG.getImageData(0, 0, 1, 1).data;
    ar *= on; ag *= on; ab *= on;
    // the room: a photographic plate (GPT Image, assets/tvroom_1990s.png) with its chroma-green screen keyed out
    // the slow push-in, wide room to near full screen over verse 1; held close; pulled back out at the end
    const S = T.scenes || {};
    const back = S.outro ? smooth01((t - S.outro) / ((T.vcrStop || S.outro + 5) + 0.6 - S.outro)) : 0;
    const k = smooth01((t - 0.8) / 23.2) * (1 - back);
    const z = 1 + (ZMAX - 1) * k;
    let cx = 960 + (SCR_C[0] - 960) * k, cy = 540 + (SCR_C[1] - 540) * k;
    cx = Math.min(W - W / (2 * z), Math.max(W / (2 * z), cx)); cy = Math.min(H - H / (2 * z), Math.max(H / (2 * z), cy));
    o.setTransform(1, 0, 0, 1, 0, 0); o.fillStyle = '#000'; o.fillRect(0, 0, W, H);
    o.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z);
    o.imageSmoothingEnabled = true; o.imageSmoothingQuality = 'high';
    // the tube under the plate, overscanned a little past the glass the way a TV crops its picture
    const dh = SCR.h * 1.05, dw = dh * 4 / 3 * 0.93;
    o.drawImage(crt.canvas, SCR_C[0] - dw / 2, SCR.y + SCR.h / 2 - dh / 2, dw, dh);
    // glass: the lamp's reflection and a soft sheen, only on the screen
    o.save(); o.beginPath(); o.roundRect(SCR.x, SCR.y, SCR.w, SCR.h, 34); o.clip();
    const rf = o.createRadialGradient(SCR.x + SCR.w * 0.2, SCR.y + SCR.h * 0.18, 4, SCR.x + SCR.w * 0.2, SCR.y + SCR.h * 0.18, SCR.w * 0.32);
    rf.addColorStop(0, 'rgba(255,214,160,.10)'); rf.addColorStop(1, 'rgba(255,214,160,0)');
    o.fillStyle = rf; o.fillRect(SCR.x, SCR.y, SCR.w, SCR.h);
    const sh = o.createLinearGradient(SCR.x, SCR.y, SCR.x + SCR.w * 0.7, SCR.y + SCR.h);
    sh.addColorStop(0, 'rgba(255,255,255,.05)'); sh.addColorStop(0.4, 'rgba(255,255,255,.015)'); sh.addColorStop(0.41, 'rgba(255,255,255,0)');
    o.fillStyle = sh; o.fillRect(SCR.x, SCR.y, SCR.w, SCR.h);
    o.restore();
    o.drawImage(keyed, 0, 0, W, H);
    // the screen's own light on the room, everywhere but the glass, following the picture's colour and brightness
    const lum = (0.299 * ar + 0.587 * ag + 0.114 * ab) / 255;
    o.save(); o.beginPath(); o.rect(0, 0, W, H); o.roundRect(SCR.x + 6, SCR.y + 6, SCR.w - 12, SCR.h - 12, 30); o.clip('evenodd');
    o.globalCompositeOperation = 'screen';
    const sp = o.createRadialGradient(SCR_C[0], SCR_C[1], SCR.h * 0.45, SCR_C[0], SCR_C[1], 760);
    sp.addColorStop(0, `rgba(${ar},${ag},${ab},${(0.10 + 0.32 * lum).toFixed(3)})`); sp.addColorStop(0.35, `rgba(${ar},${ag},${ab},${(0.04 + 0.12 * lum).toFixed(3)})`); sp.addColorStop(1, `rgba(${ar},${ag},${ab},0)`);
    o.fillStyle = sp; o.fillRect(0, 0, W, H);
    o.restore();
  }
  // key the plate's green screen to transparent once, with despill on its edge
  const ZMAX = 2.25, SCR = { x: 731, y: 165, w: 464, h: 406 }, SCR_C = [963, 368];
  const smooth01 = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  const keyed = document.createElement('canvas'); keyed.width = W; keyed.height = H;
  async function buildKey() {
    const img = new Image(); img.src = 'assets/tvroom_1990s.png'; await img.decode();
    const kg = keyed.getContext('2d', { willReadFrequently: true });
    kg.imageSmoothingQuality = 'high'; kg.drawImage(img, 0, 0, W, H);
    const pad = 14, x0 = SCR.x - pad, y0 = SCR.y - pad, w = SCR.w + 2 * pad, h = SCR.h + 2 * pad;
    const id = kg.getImageData(x0, y0, w, h), d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2], m = Math.max(r, b), gn = g - m;
      if (gn > 0) {
        const a = 1 - smooth01((gn - 25) / 70);
        d[i + 1] = Math.min(g, m + 6);                            // despill the green fringe
        d[i + 3] = Math.round(255 * a);
      }
    }
    kg.putImageData(id, x0, y0);
  }
  let ready = (async () => { await buildKey(); await loadFrame(48); })();
  window.__ready = ready;
  window.__frameJPEG = async (t, q = 0.92) => { await draw(t); return out.toDataURL('image/jpeg', q); };
  if (!qs.has('offline')) draw(Number(qs.get('t') || 8));
})();
