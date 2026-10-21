// Shared kit for the No One's Coming to the Rescue look tests. 1920x1080, drawn per song time t (pure).
const W = 1920, H = 1080;
const out = document.getElementById('c'); out.width = W; out.height = H;
const X = out.getContext('2d');
const C = { ox: '#5c161c', oxd: '#3e0e13', gilt: '#c49848', giltL: '#f0cc80', giltD: '#6e4c1c', ink: '#181214',
  cream: '#ece0c4', teal: '#267074', must: '#ce9828', vio: '#624080', red: '#ce241e', black: '#0b0708' };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => (k = clamp(k), k * k * (3 - 2 * k));
const eOut = k => 1 - Math.pow(1 - clamp(k), 3);
const ramp = (t, a, b) => clamp((t - a) / (b - a));
// cue times (s): word starts from faster-whisper word timestamps (snap to the vocal stem before a draft)
const CUE = { escape: 34.68, once: 39.0, twice: 40.74, never: 42.76, stops: 44.86, calling: 48.0,
  no1: 51.96, coming1: 53.06, rescue1: 57.12, no2: 60.78, coming2: 61.82, rescue2: 66.54, end: 69.5 };
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// halftone: paint a grayscale draw fn (white paper, black = full ink) into dots of one ink
function halftone(w, h, cell, ink, paper, drawGray) {
  const g = document.createElement('canvas'); g.width = Math.ceil(w / cell); g.height = Math.ceil(h / cell);
  const gx = g.getContext('2d'); gx.fillStyle = '#fff'; gx.fillRect(0, 0, g.width, g.height);
  gx.save(); gx.scale(1 / cell, 1 / cell); drawGray(gx); gx.restore();
  const px = gx.getImageData(0, 0, g.width, g.height).data;
  const o = document.createElement('canvas'); o.width = w; o.height = h; const ox = o.getContext('2d');
  ox.fillStyle = paper; ox.fillRect(0, 0, w, h); ox.fillStyle = ink;
  for (let y = 0; y < g.height; y++) for (let x = 0; x < g.width; x++) {
    const v = 1 - px[(y * g.width + x) * 4] / 255; const r = cell * 0.74 * Math.sqrt(v);
    if (r > 0.35) { ox.beginPath(); ox.arc(x * cell + cell / 2, y * cell + cell / 2, r, 0, 7); ox.fill(); }
  }
  return o;
}
function softBlob(g, x, y, r, a = 1) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function glow(ctx, x, y, r, col, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
}

// Side-view running woman, faceless silhouette, bun and A-line dress. (x,y)=feet, s=height px, ph=run phase (cycles), dir=+1 right
function woman(ctx, x, y, s, ph, dir = 1, run = 1, col = C.ink) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s / 100, s / 100); ctx.fillStyle = col; ctx.strokeStyle = col;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const a = Math.sin(ph * Math.PI * 2) * run, bob = Math.abs(Math.cos(ph * Math.PI * 2)) * 3 * run;
  ctx.translate(0, -bob);
  const hipY = -44, lean = 7 * run;
  for (const k of [1, -1]) {
    const sw = a * k; ctx.lineWidth = 6.5;
    const kx = Math.sin(sw) * 15, ky = hipY + 21;
    const back = sw < 0 ? -sw : 0;
    const fx = kx - 4 - back * 12, fy = Math.min(0, ky + 22 - back * 12);
    ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(fx + 4, fy - 1, 6, 2.6, 0, 0, 7); ctx.fill();
  }
  const fl = 13 + Math.abs(a) * 7;
  ctx.beginPath(); ctx.moveTo(lean - 7, -78); ctx.lineTo(lean + 7, -78);
  ctx.quadraticCurveTo(fl + 2, -50, fl + 4, -34); ctx.quadraticCurveTo(0, -29, -fl - 6, -37);
  ctx.quadraticCurveTo(-10, -52, lean - 7, -78); ctx.fill();
  ctx.lineWidth = 5.5;
  for (const k of [1, -1]) { const sw = -a * k; ctx.beginPath(); ctx.moveTo(lean, -76);
    const ex = lean + Math.sin(sw) * 15, ey = -62; ctx.lineTo(ex, ey); ctx.lineTo(ex + 11, ey - 5 - 7 * Math.max(0, sw)); ctx.stroke(); }
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(lean, -78); ctx.lineTo(lean + 2, -84); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(lean + 3, -92, 8, 9.5, 0.15, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(lean - 5, -97, 5.5, 0, 7); ctx.fill();
  ctx.restore();
}
// Standing back view (turned away)
function womanBack(ctx, x, y, s, col = C.ink, sway = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100); ctx.rotate(sway); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round';
  ctx.lineWidth = 6.5; for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 4, -40); ctx.lineTo(k * 5, 0); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-8, -78); ctx.lineTo(8, -78); ctx.quadraticCurveTo(16, -52, 18, -34); ctx.lineTo(-18, -34); ctx.quadraticCurveTo(-16, -52, -8, -78); ctx.fill();
  ctx.lineWidth = 5.5; for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 8, -76); ctx.lineTo(k * 12, -54); ctx.lineTo(k * 11, -44); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, -90, 8.5, 9.5, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(0, -99, 5.5, 0, 7); ctx.fill();
  ctx.restore();
}
function frameJPEG(render) {
  window.__frameJPEG = (t, q = .93) => { render(t); return out.toDataURL('image/jpeg', q); };
  window.__ready = (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => true);
  const a = document.getElementById('a'); const t0 = CUE.escape - 0.7;
  const loop = () => { render(a && !a.paused ? a.currentTime : t0); requestAnimationFrame(loop); };
  if (!location.search.includes('offline')) { out.onclick = () => { if (a.paused) { if (a.currentTime < t0 || a.currentTime > CUE.end) a.currentTime = t0; a.play(); } else a.pause(); }; loop(); }
}
