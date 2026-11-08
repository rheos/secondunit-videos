// cleanline frame driver. Load it last: it builds the shot list, starts the looks and draws.
//
// The film provides buildShots() -> [{ t0, t1, mode, draw(p, lt, shot) }, ...] in time order, half-open [t0, t1):
// p runs 0..1 across the shot, lt is seconds into it. mode picks the look (FILM.looks).
//
// drawFrame(t) draws song time t and is pure: the picture depends only on t, so frames can render in any order.
// Drawings are held on twos: the drawing for frame f is made at the even frame f - (f % 2), seeded by that frame
// and the shot, so lines boil between drawings and hold across a pair. A held drawing never crosses a cut.
// The grain overlay changes every frame, so a held drawing still breathes.
//
// window.__frameJPEG(t, q) -> JPEG data URL (render.mjs, check.mjs), window.__ready, window.__film() -> shots + cues.
// Opened in a browser without ?offline=1 it is a preview player: click or space plays with the song, the bar
// at the bottom scrubs, arrows step a second (shift: 10 s, , and . step one frame), ?t=SECONDS starts there.
'use strict';
const HOLD = (FILM_CFG.hold || 2);  // frames per drawing: 2 = on twos
filmPalette();
const SHOTS = buildShots();
const CANVAS = document.getElementById('c') || document.body.appendChild(document.createElement('canvas'));
CANVAS.width = W; CANVAS.height = H; const OUT = CANVAS.getContext('2d');
const BUF = document.createElement('canvas'); BUF.width = W; BUF.height = H; X = BUF.getContext('2d');
const PARAMS = new URLSearchParams(location.search);
// every look in use: init once (it may wrap primitives), then build its grain frames
const GRAIN = {};
for (const [mode, look] of Object.entries(LOOK_FOR)) {
  if (look.def.init) look.def.init(X, PARAMS);
  const g = look.grain; if (g) GRAIN[mode] = g.seeds.map((s) => grainCanvas(s, g.tone === 'dark'));
}
for (const mode of new Set(SHOTS.map((s) => s.mode))) if (!LOOK_FOR[mode]) console.error(`frame: no look draws mode "${mode}" (film.config.js looks)`);
let lastFD = -1, lastShot = null;

function shotAt(t) { for (const s of SHOTS) if (t >= s.t0 && t < s.t1) return s; return SHOTS[SHOTS.length - 1]; }
function drawFrame(t) {
  const f = Math.floor(t * FPS + 1e-6), fd = f - (f % HOLD), td = fd / FPS;
  const sh = shotAt(Math.max(td, shotAt(t).t0)); // a held drawing never crosses a cut
  const look = LOOK_FOR[sh.mode];
  if (fd !== lastFD || sh !== lastShot) {
    lastFD = fd; lastShot = sh; FD = fd; DSEED = Math.round(sh.t0 * 97) + 1; R = M32((fd * 9301 + DSEED) >>> 0);
    MODE = sh.mode; LW = look ? look.lineWeight : 1; TNOW = Math.max(td, sh.t0);
    X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.setLineDash([]);
    const lt = Math.max(0, td - sh.t0), p = cl(lt / (sh.t1 - sh.t0));
    if (look && look.def.pre) look.def.pre(X, sh);
    X.save(); try { sh.draw(p, lt, sh); } catch (e) { console.error(e && e.stack || e); } X.restore();
    X.setTransform(1, 0, 0, 1, 0, 0);
    if (look && look.def.post) look.def.post(X, sh);
  }
  OUT.globalAlpha = 1; OUT.drawImage(BUF, 0, 0);
  const G = GRAIN[sh.mode]; if (G) OUT.drawImage(G[f % G.length], ((f * 3) % 5) - 6, ((f * 7) % 5) - 6, W + 12, H + 12);
}
const renderFrame = drawFrame; // older films' name for it
window.__frameJPEG = (t, q = .93) => { drawFrame(t); return CANVAS.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
// what the review tools need to pick event frames: the cuts, and the clock's timed lists
window.__film = () => ({
  shots: SHOTS.map((s) => ({ t0: s.t0, t1: s.t1, mode: s.mode, key: s.key })),
  lines: typeof CLOCK === 'object' ? CLOCK.lines : [], words: typeof CLOCK === 'object' ? CLOCK.words : [],
  beats: typeof CLOCK === 'object' ? CLOCK.beats : [], looks: Object.fromEntries(Object.entries(LOOK_FOR).map(([m, l]) => [m, l.name])),
});

// ---------- preview player (not used by render.mjs / check.mjs, which pass ?offline=1) ----------
if (!PARAMS.has('offline')) {
  const dur = (typeof CLOCK === 'object' && CLOCK.duration) || SHOTS[SHOTS.length - 1].t1;
  const au = new Audio((typeof CLOCK === 'object' && CLOCK.audio.file) || ''); au.preload = 'auto';
  let t = Number(PARAMS.get('t') || 0);
  const bar = document.createElement('div'), fill = document.createElement('div'), tc = document.createElement('div');
  bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:22px;background:rgba(0,0,0,.55);cursor:ew-resize;z-index:9';
  fill.style.cssText = 'position:absolute;left:0;top:0;bottom:0;background:rgba(255,255,255,.28);pointer-events:none';
  tc.style.cssText = 'position:absolute;right:8px;top:3px;font:12px ui-monospace,Menlo,monospace;color:#eee;pointer-events:none';
  // cut marks on the bar
  for (const s of SHOTS) { const m = document.createElement('div'); m.style.cssText = `position:absolute;top:0;width:1px;height:6px;background:rgba(255,255,255,.5);left:${(100 * s.t0 / dur).toFixed(3)}%;pointer-events:none`; bar.appendChild(m); }
  bar.append(fill, tc); document.body.appendChild(bar);
  const show = () => {
    drawFrame(t); fill.style.width = (100 * t / dur).toFixed(3) + '%';
    const f = Math.floor(t * FPS + 1e-6); tc.textContent = `${t.toFixed(2)} s  f${f}  ${shotAt(t).key || ''}`;
  };
  const seek = (nt) => { t = Math.max(0, Math.min(dur - 1 / FPS, nt)); if (!au.paused) au.currentTime = t; show(); };
  let drag = false;
  const fromX = (e) => seek(dur * (e.clientX - bar.getBoundingClientRect().left) / bar.clientWidth);
  bar.onpointerdown = (e) => { drag = true; bar.setPointerCapture(e.pointerId); fromX(e); };
  bar.onpointermove = (e) => { if (drag) fromX(e); };
  bar.onpointerup = () => { drag = false; };
  const toggle = () => { if (au.paused) { au.currentTime = t; au.play(); } else au.pause(); };
  CANVAS.onclick = toggle;
  addEventListener('keydown', (e) => {
    if (e.key === ' ') { e.preventDefault(); toggle(); return; }
    if (e.key === 'ArrowRight') seek(t + (e.shiftKey ? 10 : 1));
    if (e.key === 'ArrowLeft') seek(t - (e.shiftKey ? 10 : 1));
    if (e.key === '.') seek((Math.floor(t * FPS + 1e-6) + 1) / FPS);
    if (e.key === ',') seek((Math.floor(t * FPS + 1e-6) - 1) / FPS);
  });
  const tick = () => { if (!au.paused) { t = au.currentTime; show(); } requestAnimationFrame(tick); };
  show(); tick();
}
