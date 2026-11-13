// The composite: the generated plate scrolls left to sell the drive; the generated character, keyed off its
// chroma green, rides over it and bobs on the beat; torn white lane dashes rush past under its tyres.
// A port of the look's p5 overlay to a plain 2D canvas (same layout and motion), so the segment needs no toolkit.
//
// STAND-IN: the look's character is a 10 s MiniMax H3 Max lip-sync clip (paid). Until that clip exists, the
// character is the green still from assets/, animated here in code (bob, squash and a little rock on the beat).
// Drop the clip's frames in assets/clip/0000.png ... and set CLIP.frames to use them instead (prompts/03_clip.yml).
'use strict';
const W = 1920, H = 1080, DUR = 15, FPS = 24;
const BEAT = 60 / 120 * FPS;                 // frames per beat: no song here, a 120 bpm grid stands in
const LEAD_H = 0.5 * H;                      // the character's height on screen
const ROAD_Y = 0.93 * H;                     // where the tyres meet the road on the plate (its near lane)
const CLIP = { dir: 'assets/clip/', frames: 0 };   // 0 = use the still stand-in

const canvas = document.getElementById('c'); canvas.width = W; canvas.height = H;
const X = canvas.getContext('2d');
const load = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('missing ' + src)); i.src = src; });

// Chroma key: pull the green out to alpha with a soft edge, and take the green spill off what stays.
// Returns the keyed canvas and the box the character fills inside it.
function chromaKey(img) {
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
  let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
  for (let i = 0; i < p.length; i += 4) {
    const r = p[i], gg = p[i + 1], b = p[i + 2], k = gg - Math.max(r, b);         // how much greener than it is anything else
    const a = 1 - Math.min(1, Math.max(0, (k - 28) / 60));
    if (k > 0) p[i + 1] = Math.max(r, b) + (gg - Math.max(r, b)) * .25;          // despill
    p[i + 3] = Math.round(255 * a);
    if (a > .5) { const n = i / 4, x = n % c.width, y = (n / c.width) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  g.putImageData(d, 0, 0);
  return { c, box: [x0, y0, x1 - x0 + 1, y1 - y0 + 1] };
}

let plate = null, still = null, frames = [];
function drawPlate(f) {
  const k = Math.max(W / plate.width, H / plate.height) * 1.18;
  const pw = plate.width * k, ph = plate.height * k, travel = pw - W;   // pan across the whole extra width
  X.drawImage(plate, -travel * (f / (DUR * FPS)), (H - ph) / 2, pw, ph);
}
function drawDashes(f) {
  X.fillStyle = 'rgb(242,234,212)';
  for (let i = 0; i < 9; i++) {
    const x = ((i * 300 - f * 26) % (W + 300) + W + 300) % (W + 300) - 150;
    X.save(); X.translate(x, ROAD_Y + 18); X.rotate(((i * 37) % 7 - 3) * 0.01);
    X.beginPath(); X.moveTo(-70, -9); X.lineTo(72, -11); X.lineTo(70, 9); X.lineTo(-68, 11); X.closePath(); X.fill();
    X.restore();
  }
}
function drawCharacter(img, box, f, standIn) {
  const ph = (f % BEAT) / BEAT, bob = Math.abs(Math.sin(Math.PI * f / BEAT)) * 10;
  const k = LEAD_H / box[3];
  // stand-in only: land on each beat with a squash, and rock a little, since a still can't act
  const sq = standIn ? Math.exp(-ph * 9) * .06 : 0, rock = standIn ? Math.sin(Math.PI * 2 * f / (BEAT * 4)) * .02 : 0;
  X.save();
  X.translate(W * 0.56, ROAD_Y - bob); X.rotate(rock); X.scale(1 + sq, 1 - sq);
  X.drawImage(img, -(box[0] + box[2] / 2) * k, -(box[1] + box[3]) * k, img.width * k, img.height * k);
  X.restore();
}
function drawFrame(t) {
  const f = Math.floor(t * FPS + 1e-6);
  drawPlate(f);
  drawDashes(f);
  if (frames.length) { const fr = frames[Math.min(f, frames.length - 1)]; drawCharacter(fr.c, fr.box, f, false); }
  else drawCharacter(still.c, still.box, f, true);
}

window.__ready = (async () => {
  plate = await load('assets/plate.jpg');
  still = chromaKey(await load('assets/character-green.png'));
  for (let i = 0; i < CLIP.frames; i++) frames.push(chromaKey(await load(CLIP.dir + String(i).padStart(4, '0') + '.png')));
  return true;
})();
window.__seg = { dur: DUR, fps: FPS, size: [W, H], shots: [{ name: 'drive', t0: 0, t1: DUR }] };
window.__frame = (t, q = .93) => { drawFrame(t); return canvas.toDataURL('image/jpeg', q); };
if (!new URLSearchParams(location.search).has('offline')) window.__ready.then(() => {
  const t0 = performance.now() / 1000; (function loop() { drawFrame((performance.now() / 1000 - t0) % DUR); requestAnimationFrame(loop); })();
});
