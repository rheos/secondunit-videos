// Canvas textures painted in code: flat base, soft blotches, dark strokes. All repeat-wrapped.
import * as THREE from "./lib/three.module.js";

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
export const canvasTex = (w, h, draw, { rep = true } = {}) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.wrapS = t.wrapT = rep ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  return t;
};
const blotch = (g, r, w, h, n, col, a, s0, s1) => {
  g.globalAlpha = a; g.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, rx = s0 + r() * (s1 - s0), ry = rx * (0.5 + r() * 0.6);
    for (const [ox, oy] of [[0, 0], [w, 0], [-w, 0], [0, h], [0, -h]]) { g.beginPath(); g.ellipse(x + ox, y + oy, rx, ry, r() * 3, 0, 7); g.fill(); }
  }
  g.globalAlpha = 1;
};
const strokes = (g, r, w, h, n, col, len, lw, a = 0.4) => {
  g.strokeStyle = col; g.lineWidth = lw; g.globalAlpha = a; g.lineCap = "round";
  for (let i = 0; i < n; i++) { const x = r() * w, y = r() * h, ang = r() * 6.3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); g.stroke(); }
  g.globalAlpha = 1;
};
const fill = (g, w, h, c) => { g.fillStyle = c; g.fillRect(0, 0, w, h); };

export const TEX = {
  grass: () => canvasTex(1024, 1024, (g, w, h) => { const r = rng(3); fill(g, w, h, "#b39f45"); blotch(g, r, w, h, 60, "#c2ad50", 0.5, 30, 110); blotch(g, r, w, h, 50, "#9c8f3e", 0.45, 24, 90); strokes(g, r, w, h, 1100, "#7f7732", 13, 2.4, 0.55); strokes(g, r, w, h, 300, "#d6c267", 9, 2.2, 0.6); }),
  soil: () => canvasTex(1024, 1024, (g, w, h) => { const r = rng(5); fill(g, w, h, "#a8532b"); blotch(g, r, w, h, 70, "#944726", 0.5, 26, 90); blotch(g, r, w, h, 50, "#bc6636", 0.5, 20, 70); strokes(g, r, w, h, 500, "#74361d", 12, 3.4, 0.5); strokes(g, r, w, h, 260, "#cf8452", 7, 3, 0.55); }),
  road: () => canvasTex(512, 512, (g, w, h) => { const r = rng(7); fill(g, w, h, "#d9b878"); blotch(g, r, w, h, 26, "#c8a260", 0.5, 20, 60); strokes(g, r, w, h, 200, "#a07c45", 16, 2, 0.4); }),
  stone: () => canvasTex(1024, 1024, (g, w, h) => {
    const r = rng(9); fill(g, w, h, "#d8b98c"); blotch(g, r, w, h, 40, "#c6a475", 0.5, 30, 90);
    g.strokeStyle = "#7a5a3a"; g.lineWidth = 5; g.globalAlpha = 0.75;
    for (let row = 0; row < 8; row++) { const y = row * 128; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let c = 0; c < 6; c++) { const x = c * 171 + (row % 2) * 85; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 128); g.stroke(); } }
    g.globalAlpha = 1;
  }),
  gold: () => canvasTex(512, 512, (g, w, h) => { const r = rng(11); fill(g, w, h, "#eebd3c"); blotch(g, r, w, h, 12, "#f4cb58", 0.5, 50, 130); blotch(g, r, w, h, 10, "#e2ad30", 0.4, 40, 110); }),
  marble: () => canvasTex(1024, 1024, (g, w, h) => { const r = rng(13); fill(g, w, h, "#efe6d6"); blotch(g, r, w, h, 26, "#e0d3bf", 0.6, 30, 110); strokes(g, r, w, h, 60, "#a89a86", 60, 3, 0.35); g.strokeStyle = "#b39f7c"; g.lineWidth = 6; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 256, 0); g.lineTo(i * 256, h); g.moveTo(0, i * 256); g.lineTo(w, i * 256); g.stroke(); } }),
  wood: () => canvasTex(512, 512, (g, w, h) => { const r = rng(15); fill(g, w, h, "#a56f3e"); for (let i = 0; i < 90; i++) { const y = r() * h; g.strokeStyle = r() > 0.5 ? "#7e522a" : "#bd8650"; g.lineWidth = 1 + r() * 4; g.globalAlpha = 0.6; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + r() * 12 - 6, w * 0.7, y + r() * 12 - 6, w, y); g.stroke(); } g.globalAlpha = 1; for (let x = 0; x < w; x += 128) { g.fillStyle = "#4b2f18"; g.fillRect(x, 0, 6, h); } }),
  plaster: () => canvasTex(512, 512, (g, w, h) => { const r = rng(17); fill(g, w, h, "#f0dcae"); blotch(g, r, w, h, 26, "#e3cb97", 0.55, 20, 70); strokes(g, r, w, h, 40, "#b49a68", 22, 2.4, 0.35); }),
  thatch: () => canvasTex(512, 512, (g, w, h) => { const r = rng(19); fill(g, w, h, "#c4923f"); strokes(g, r, w, h, 700, "#9a6e2a", 22, 3, 0.5); strokes(g, r, w, h, 400, "#deb35c", 18, 2.4, 0.6); }),
  slate: () => canvasTex(512, 512, (g, w, h) => { const r = rng(21); fill(g, w, h, "#8c4a33"); blotch(g, r, w, h, 20, "#a05a3e", 0.6, 18, 50); g.strokeStyle = "#54281c"; g.lineWidth = 4; for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }),
  bark: () => canvasTex(256, 256, (g, w, h) => { const r = rng(23); fill(g, w, h, "#7a5532"); strokes(g, r, w, h, 200, "#4f361f", 22, 3, 0.5); }),
  leaf: () => canvasTex(512, 512, (g, w, h) => { const r = rng(25); fill(g, w, h, "#cfcfa8"); blotch(g, r, w, h, 50, "#e6e4bc", 0.6, 18, 50); blotch(g, r, w, h, 40, "#a8ac88", 0.55, 14, 40); }),
  wall: () => canvasTex(512, 512, (g, w, h) => { const r = rng(27); fill(g, w, h, "#7d2f38"); for (let x = 0; x < w; x += 64) { g.fillStyle = "#6f2831"; g.fillRect(x, 0, 30, h); } blotch(g, r, w, h, 16, "#8a3842", 0.3, 20, 60); }),
  carpet: () => canvasTex(512, 512, (g, w, h) => { const r = rng(29); fill(g, w, h, "#3b4d6e"); blotch(g, r, w, h, 26, "#465a7d", 0.5, 18, 60); strokes(g, r, w, h, 240, "#2a3752", 10, 2, 0.5); }),
  table: () => canvasTex(512, 512, (g, w, h) => { const r = rng(31); fill(g, w, h, "#6b3a22"); for (let i = 0; i < 70; i++) { const y = r() * h; g.strokeStyle = r() > 0.5 ? "#522a18" : "#84492b"; g.lineWidth = 1 + r() * 3; g.globalAlpha = 0.6; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 8, w * 0.7, y - 8, w, y); g.stroke(); } g.globalAlpha = 1; }),
};

export const puff = (col, inkCol) => canvasTex(256, 256, (g, w, h) => {
  const r = rng(41); g.clearRect(0, 0, w, h);
  const blobs = []; for (let i = 0; i < 7; i++) blobs.push([128 + (r() - 0.5) * 110, 128 + (r() - 0.5) * 90, 34 + r() * 34]);
  g.fillStyle = inkCol; for (const [x, y, s] of blobs) { g.beginPath(); g.arc(x, y, s + 6, 0, 7); g.fill(); }
  g.fillStyle = col; for (const [x, y, s] of blobs) { g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); }
}, { rep: false });

export const softBlob = () => canvasTex(128, 128, (g, w, h) => {
  const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  gr.addColorStop(0, "rgba(28,16,30,.62)"); gr.addColorStop(0.65, "rgba(28,16,30,.34)"); gr.addColorStop(1, "rgba(28,16,30,0)");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}, { rep: false });
