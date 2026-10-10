// S4 [1785,1824) "the flames reveal": head-on into the fire; on "reveal" it splits like a curtain and the wolf walks out.
// Shared engraving toolkit for the dream of fire hook. Prepended to every shot's 05_overlay.js by tools/hook/build.py.
// Everything is drawn white-on-black and the whole frame is forced to two tones at the end (twoTone), so plates, sprites
// and graphics read as one scratchboard.
const W = 1920, H = 1080;
const DOWNBEATS = [1572, 1610, 1648, 1687, 1725, 1763, 1801, 1839, 1876];
const BEAT = 9.57; // frames per beat at 150.5 bpm
const sf = (f) => START + f; // section frame -> song frame
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
const easeOut = (u) => 1 - Math.pow(1 - clamp(u), 3);

// 0..1 kick that fires on each downbeat and decays over ~5 frames: the heavy "hit" of the groove.
function punch(f, tau = 5) {
  const s = sf(f); let k = 0;
  for (const d of DOWNBEATS) if (s >= d) k = Math.max(k, Math.exp(-(s - d) / tau));
  return k;
}
// The same, on every beat (quieter).
function pulse(f) {
  const s = sf(f), ph = ((s - DOWNBEATS[0]) % BEAT + BEAT) % BEAT;
  return Math.exp(-ph / 3);
}

// Draw an image covering the canvas, zoomed by s, centred on (cx, cy) in image fractions.
function cover(img, s = 1, cx = 0.5, cy = 0.5) {
  const k = Math.max(W / img.width, H / img.height) * s;
  imageMode(CORNER);
  image(img, W / 2 - cx * img.width * k, H / 2 - cy * img.height * k, img.width * k, img.height * k);
  return { k, x0: W / 2 - cx * img.width * k, y0: H / 2 - cy * img.height * k };
}
// A point given in image fractions, after cover().
const toScreen = (cv, img, u, v) => [cv.x0 + u * img.width * cv.k, cv.y0 + v * img.height * cv.k];

// Sprite with its feet (bottom of the cut-out) at (x, bottom), h tall.
function standAt(clip, img, x, bottom, h) {
  clip.draw(img, x, bottom - h / 2, h);
}

// Engraved fire: a field of flowing white strokes, densest and longest at the core, converging to licking tips,
// over two black logs. split (0..1) parts it down the middle like a curtain; power scales its height.
function fire(x, y, w, h, t, { n = 90, seed = 1, split = 0, power = 1, logs = true } = {}) {
  const r = Anim.rng(seed);
  // logs: black, edged with scratched light
  if (logs && split < 0.5) {
    push(); stroke(255); strokeWeight(2.2); fill(0);
    for (const [rot, dx] of [[0.32, -0.05], [-0.28, 0.05]]) {
      push(); translate(x + dx * w, y + 6); rotate(rot); rectMode(CENTER); rect(0, 0, w * 0.6, h * 0.05, 8);
      for (let k = -3; k <= 3; k++) line(k * w * 0.08, -h * 0.018, k * w * 0.08 + 10, h * 0.018);
      pop();
    }
    pop();
  }
  noFill(); stroke(255);
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1, core = 1 - Math.pow(Math.abs(u), 1.4), side = Math.sign(u) || 1, ph = r() * 10;
    const bx = x + u * w * 0.5 + side * split * w * 0.85, by = y + (r() - 0.3) * h * 0.08 * (0.4 + Math.abs(u));
    const len = h * power * (0.12 + 0.88 * core * core) * (0.45 + 0.75 * noise(i * 0.37, t * 3.2));
    strokeWeight(0.9 + 2.6 * core * (0.4 + 0.6 * r()));
    beginShape();
    for (let k = 0; k <= 16; k++) {
      const v = k / 16, conv = 0.85 * (1 - split);
      const cx = lerp(bx, x + side * split * w * 0.85, Math.pow(v, 0.8) * conv);
      const wav = Math.sin(v * 7 + t * 11 + ph) * (3 + 44 * v * v) * (0.4 + core) + (noise(ph, t * 2.5, v * 2) - 0.5) * 90 * v * v;
      vertex(cx + wav + side * split * w * 0.25 * v, by - v * len);
    }
    endShape();
  }
  // embers glowing in the bed
  stroke(255); strokeWeight(2);
  for (let i = 0; i < 26; i++) {
    const eu = (r() - 0.5), es = Math.sign(eu) || 1, ex = x + eu * w * 0.7 + es * split * w * 0.85, ey = y + (r() - 0.2) * h * 0.06;
    if (noise(i, t * 4) > 0.45) point(ex, ey);
  }
}

// Sparks: small white flecks thrown up from (x, y), drifting and curling as they cool. A trickle on every beat,
// a burst on every downbeat.
function sparks(f, x, y, { spread = 160, rate = 4, burst = 18, life = 42, speed = 9, seed = 9 } = {}) {
  stroke(255);
  const s = sf(f);
  const emit = (born, count, salt) => {
    const r = Anim.rng(born * 131 + salt + seed);
    for (let i = 0; i < count; i++) {
      const vx = (r() - 0.5) * speed * 0.6, vy = -(0.6 + r()) * speed, l = life * (0.5 + r()), ox = (r() - 0.5) * spread, ph = r() * 6;
      const a = s - born; if (a < 0 || a > l) continue;
      const k = a / l, drag = 1 - 0.5 * k;
      const px = x + ox + vx * a * drag + Math.sin(a * 0.25 + ph) * 14 * k, py = y + vy * a * drag;
      strokeWeight(3.2 * (1 - k) + 1);
      line(px, py, px - vx * 0.5, py - vy * 0.5);
    }
  };
  for (let b = Math.floor((s - 60 - DOWNBEATS[0]) / BEAT); b <= Math.floor((s - DOWNBEATS[0]) / BEAT); b++) emit(Math.round(DOWNBEATS[0] + b * BEAT), rate, 1);
  for (const d of DOWNBEATS) if (s >= d && s - d < life * 1.6) emit(d, burst, 2);
}

// Lettering cut into the board: Big Caslon capitals, white, carved on with a ragged wipe and slammed in on the word.
function carve(font, word, x, y, size, f, onF, offF = 1e9) {
  const a = f - onF; if (a < 0) return;
  const inU = easeOut(a / 7), outU = clamp((f - offF) / 8);
  push();
  textFont(font); textSize(size); textAlign(CENTER, CENTER);
  const tw = textWidth(word) + 40, s = lerp(1.18, 1, inU);
  translate(x, y); scale(s); rotate((Anim.rng(onF)() - 0.5) * 0.04);
  drawingContext.save();
  drawingContext.beginPath();
  // reveal left-to-right with a jagged scratch edge, then scratch away the same way
  const L = -tw / 2 + tw * outU, R = -tw / 2 + tw * inU;
  drawingContext.moveTo(L, -size);
  for (let k = 0; k <= 12; k++) drawingContext.lineTo(R + Math.sin(k * 2.7 + f) * 14, -size + (2 * size * k) / 12);
  drawingContext.lineTo(L, size);
  drawingContext.closePath(); drawingContext.clip();
  stroke(0); strokeWeight(size * 0.06); fill(255); text(word, 0, -size * 0.1);
  // engraved hatching across the letters
  stroke(0); strokeWeight(2);
  for (let yy = -size * 0.55; yy < size * 0.35; yy += 7) line(-tw / 2, yy, tw / 2, yy + 3);
  drawingContext.restore();
  pop();
}

// Final pass: everything to two tones (a narrow ramp keeps edges from stair-stepping).
function twoTone(lo = 92, hi = 128) {
  loadPixels();
  const p = pixels, d = 255 / (hi - lo);
  for (let i = 0; i < p.length; i += 4) {
    // magenta marker (the amulet, painted by tools/hook/amulet.py) becomes the sheet's jade green, its only colour
    if (p[i] > 150 && p[i + 2] > 150 && p[i + 1] < 90) { p[i] = 136; p[i + 1] = 244; p[i + 2] = 188; p[i + 3] = 255; continue; }
    const l = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
    const v = l <= lo ? 0 : l >= hi ? 255 : (l - lo) * d;
    p[i] = p[i + 1] = p[i + 2] = v; p[i + 3] = 255;
  }
  updatePixels();
}

// Camera: every shot is drawn inside cam(scale, dx, dy) around the centre, with the downbeat punch added.
function cam(f, s, dx = 0, dy = 0, kick = 0.025, fn) {
  push();
  const k = s * (1 + kick * punch(f));
  translate(W / 2 + dx, H / 2 + dy); scale(k); translate(-W / 2, -H / 2);
  fn();
  pop();
}

// Fonts through the browser's FontFace API (p5 2.x loadFont fails on this font in headless Chrome); returns CSS family names.
async function hookFonts(map) {
  const out = {};
  for (const [name, file] of Object.entries(map)) {
    const res = await fetch(`/tools/p5/fonts/${encodeURIComponent(file)}`);
    const buf = await res.arrayBuffer();
    if (!res.ok || buf.byteLength < 1000) throw new Error(`font ${file}: HTTP ${res.status}, ${buf.byteLength} bytes`);
    const face = new FontFace(`hook-${name}`, buf);
    await face.load(); document.fonts.add(face);
    out[name] = `hook-${name}`;
  }
  return out;
}

// The generated engraved campfire (s04 "fire" clip, cut out), looped. Its logs sit near the bottom of its frame:
// (x, y) is the base of the fire, h the full sprite height. split (0..1) cuts it down the middle and slides the halves apart.
function fireSprite(clip, f, x, y, h, { split = 0, alpha = 1 } = {}) {
  const img = clip.frame(f, { loop: true }), w = (h * img.width) / img.height, top = y - h * 0.94;
  push(); drawingContext.globalAlpha = alpha; imageMode(CORNER);
  if (split <= 0) image(img, x - w / 2, top, w, h);
  else {
    // two whole fires (mirrored so they don't repeat) start overlapped as one blaze and slide apart: no cut edges
    const dx = split * w * 0.42, k = 1 - 0.18 * split;
    image(img, x - dx - (w * k) / 2, y - h * k * 0.94, w * k, h * k);
    push(); translate(x + dx, 0); scale(-1, 1); image(img, -(w * k) / 2, y - h * k * 0.94, w * k, h * k); pop();
  }
  pop();
}

const START = 1785;
Anim.sketch({
  async load() {
    this.plate = await new Promise((r) => loadImage("/output/s04/02_kf_fire_ground.png", r));
    this.wolf = await Anim.clip("wolf_walk_k");
    this.fire = await Anim.clip("fire");
  },
  draw(t, f) {
    background(0);
    const open = smooth((f - 12) / 10); // "reveal" 74.94 s -> f14
    cam(f, lerp(1.0, 1.12, smooth(f / 39)), 0, 0, 0.05, () => {
      const cv = cover(this.plate, 1.05, 0.5, 0.6);
      const [fx, fy] = toScreen(cv, this.plate, 0.5, 0.66);
      // back flames, then the wolf between the halves, then the front flames
      fireSprite(this.fire, f, fx, fy + 20, 980, { split: open * 1.1 });
      if (open > 0.05) {
        // the wolf steps out of the fire: feet at the fire bed, growing as it walks at us
        const u = smooth((f - 12) / 27), i = 6 + f * 0.7;
        push(); drawingContext.globalAlpha = smooth(open * 1.6);
        // the clip crops its paws at the frame edge: keep that edge below the screen
        standAt(this.wolf, this.wolf.frame(i), fx, H + 20 + 70 * u, lerp(760, 1020, u));
        pop();
      }
      sparks(f, fx, fy - 250, { spread: 600, rate: 6, burst: 60, speed: 15, life: 40, seed: 23 });
    });
    twoTone();
  }
});
