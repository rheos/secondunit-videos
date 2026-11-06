// Look 4: courtroom sketch (the case to the verdict), 261.5-302.75. Pure function of song time t.
const out = document.getElementById('c'); out.width = W; out.height = H;
const g = out.getContext('2d');
// T0, T1 live in shots.js (the shot list needs them)

const SHOT_CACHE = new Map();
function staticList(i) {
  if (!SHOT_CACHE.has(i)) { const sh = SHOTS[i], s = new Sk(100 + i); sh.build(s, sh); s.end(); SHOT_CACHE.set(i, s.list); }
  return SHOT_CACHE.get(i);
}

function renderFrame(t) {
  const [sh, lt, i] = shotAt(SHOTS, t);
  const nx = (SHOTS[i + 1] || { t: T1 }).t;
  const lists = [staticList(i)];
  if (sh.dyn) { const s = new Sk(500 + i); sh.dyn(s, t, sh); s.end(); lists.push(s.list); }
  const sk = renderSketch(lists, t, { vig: sh.vig || [960, 380, 420, 1150, .55, .8] });
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  // camera: a slow push across the sketch, centred on the shot's focus
  const cam = sh.cam || [1, 1.035, 960, 400];
  const u = ease(t, sh.t, nx), z = lerp(cam[0], cam[1], u);
  g.fillStyle = '#7d8893'; g.fillRect(0, 0, W, H);
  g.save(); g.translate(cam[2], cam[3]); g.scale(z, z); g.translate(-cam[2], -cam[3]);
  // a camera shake on a hit (gavel, stamp): decays over 6 frames, seeded by frame number
  const hit = (sh.hits || []).find(h => t >= h && t < h + .25);
  if (hit) { const f = Math.round(t * 24), k = 1 - (t - hit) / .25; g.translate((rnd(f, 1) - .5) * 14 * k, (rnd(f, 2) - .5) * 14 * k); }
  g.drawImage(sk, 0, 0);
  g.restore();
  drawTranscript(g, t);
  if (typeof drawStamp === 'function') drawStamp(g, t);
  drawGrain(g, t, .07, 'overlay');
}

const FONTS = ['bold 82px "Courier New"', 'bold 60px Georgia', 'bold 190px "Arial Black"'];
startPage(out, renderFrame, T0, T1, Promise.all(FONTS.map(f => document.fonts.load(f))).then(() => document.fonts.ready).then(() => { bakePaper(); layoutTranscript(); return true; }));
