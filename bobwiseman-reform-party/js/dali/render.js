// Reform Party, Dali look: grade, captions and the frame. Loads last.
// ---------- captions ----------
// Draft 35 (Bob, note 56 on d34: "The font. Just bugs me. Could you give me something wilder? or weirder?"; Robin: try
// the typical Instagram font). Instagram Sans is Meta's own brand face and not licensed for other people's videos, so
// the Instagram looks are drawn with free OFL lookalikes that ship in fonts/ (the Mac and the cloud runners draw the
// same captions). CAP_STYLE picks one; ?cap=<name> overrides it for still sheets.
//   gochi      draft 11-34: Gochi Hand, upright hand lettering, each word with its own small tilt and lift
//   classic    Instagram Stories "Classic": Figtree Bold, white, straight
//   reel       the Reels caption: Figtree Bold, black on a white rounded box that grows word by word
//   strong     Stories "Strong": Anton caps, slanted, white with a dark edge, the word being sung in amber (Robin)
//   typewriter Stories "Typewriter": Courier Prime Bold on a paper strip, each word typed letter by letter
//   vv         ViralVision's caption (MythMaker's first project, viralvision-worker/assembler.py): Anton caps, white
//              with a heavy black stroke and a hard soft-black drop shadow, the whole line up at once, the word being
//              sung in amber (255,176,59)
//   melt       Rubik Wet Paint caps, dripping like the Dali watches, cream with a dark edge (a weirder one for Bob)
//   ransom     a ransom note: every letter cut from a different face onto its own paper chip, tilted (Gilliam cut-outs)
//   neon       Stories "Neon": Yellowtail script, white core, pink tube glow that flickers on each word
// A line too long to sit on one row at 80% of the style's size wraps onto two rows (the lower row on CAP.y), the way
// Instagram wraps its text, so no style has to shrink the long outro lines.
const CAP_STYLE = new URLSearchParams(location.search).get('cap') || 'strong'; // Robin's pick for draft 35 (2026-10-30)
const CAP_FACES = [['Gochi Hand', 'GochiHand-Regular.ttf'], ['Figtree', 'Figtree-VF.ttf', { weight: '300 900' }], ['Anton', 'Anton-Regular.ttf'],
  ['Courier Prime', 'CourierPrime-Bold.ttf', { weight: '700' }], ['Yellowtail', 'Yellowtail-Regular.ttf'], ['Rubik Wet Paint', 'RubikWetPaint-Regular.ttf']];
const FONT_READY = Promise.all(CAP_FACES.map(([n, f, d]) => new FontFace(n, `url(../fonts/${f})`, d || {}).load().then((ff) => document.fonts.add(ff)).catch(() => 0))).then(() => true);
const CAPS = {
  gochi: { font: '{s}px "Gochi Hand", "Marker Felt", sans-serif', size: 50, gap: .27, band: 1, wob: 1 },
  classic: { font: '700 {s}px Figtree, Helvetica, sans-serif', size: 52, gap: .26, band: .8 },
  reel: { font: '700 {s}px Figtree, Helvetica, sans-serif', size: 48, gap: .26, box: { fill: '#ffffff', ink: '#111111', padX: .42, padY: .3, r: .32, whole: 1 } },
  strong: { font: '{s}px Anton, Impact, sans-serif', size: 62, gap: .22, caps: 1, skew: -.2, edge: 1, band: .7, accent: 'rgb(255,176,59)' }, // the sung word in ViralVision's amber (Robin)
  typewriter: { font: '700 {s}px "Courier Prime", Courier, monospace', size: 46, gap: .6, type: 1, box: { fill: '#f6f1e4', ink: '#1a1612', padX: .4, padY: .28, r: .08, whole: 1 } },
  vv: { font: '{s}px Anton, Impact, sans-serif', size: 60, gap: .25, caps: 1, full: 1, stroke: 1 / 6, drop: 1, accent: 'rgb(255,176,59)' },
  melt: { font: '{s}px "Rubik Wet Paint", Impact, sans-serif', size: 60, gap: .3, caps: 1, edge: 1, fill: '#fbeed0', band: .7 },
  ransom: { font: '700 {s}px Figtree, sans-serif', size: 52, gap: .45, ransom: 1 },
  neon: { font: '{s}px Yellowtail, cursive', size: 64, gap: .28, neon: '#ff3fb4', band: .9 },
};
const capWob = (li, wi, k) => { const v = Math.sin(li * 127.1 + wi * 311.7 + k * 74.7) * 43758.5453; return (v - Math.floor(v)) * 2 - 1; };
// outro: the repeated last line stays uncaptioned until its final time (Bob's note on draft 11)
const CAP_HIDE = new Set([35, 36, 37]);
const CAP = { y: 1014, maxW: 1500 }; // baseline inside the title-safe area; 210 px side margin at full size
// a soft dark band behind the caption line: feathered on all four sides, built once, stretched to the line
const CAP_BAND = (() => { const c = mkCanvas(512, 96), b = c.getContext('2d');
  const v = b.createLinearGradient(0, 0, 0, 96); v.addColorStop(0, 'rgba(16,9,7,0)'); v.addColorStop(.32, 'rgba(16,9,7,.85)'); v.addColorStop(.62, 'rgba(16,9,7,1)'); v.addColorStop(1, 'rgba(16,9,7,0)');
  b.fillStyle = v; b.fillRect(0, 0, 512, 96);
  const hz = b.createLinearGradient(0, 0, 512, 0); hz.addColorStop(0, 'rgba(0,0,0,0)'); hz.addColorStop(.14, 'rgba(0,0,0,1)'); hz.addColorStop(.86, 'rgba(0,0,0,1)'); hz.addColorStop(1, 'rgba(0,0,0,0)');
  b.globalCompositeOperation = 'destination-in'; b.fillStyle = hz; b.fillRect(0, 0, 512, 96); return c; })();
function rrect(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
// the ransom note: each letter's face, scale, chip colour and tilt come from a fixed hash of (line, word, letter)
const RANSOM_FACES = ['{s}px Anton', '700 {s}px "Courier Prime"', '800 {s}px Figtree', '{s}px "Gochi Hand"', '{s}px Yellowtail', '{s}px "Rubik Wet Paint"'];
const RANSOM_CHIPS = [['#efe6d2', '#1b1714'], ['#1b1714', '#f7f1e3'], ['#c8342c', '#fff4e6'], ['#f2c531', '#1b1714'], ['#e9e2f0', '#2b2350'], ['#fffaf0', '#c8342c']];
const ransomPick = (li, wi, ci, k) => Math.floor((capWob(li, wi * 37 + ci, k) * .5 + .5) * 5.999);
function ransomLetters(word, size, li, wi) { // [{ch, font, w, chipW, chip, ink, rot, dy}] and the word's total width
  let x = 0; const out = [];
  for (let ci = 0; ci < word.length; ci++) { const ch = word[ci], sc = .86 + .26 * (capWob(li, wi * 37 + ci, 5) * .5 + .5), sz = Math.round(size * sc);
    const font = RANSOM_FACES[ransomPick(li, wi, ci, 3)].replace('{s}', sz); g.font = font; const w = g.measureText(ch).width, pad = size * .1;
    const [chip, ink] = RANSOM_CHIPS[ransomPick(li, wi, ci, 4)]; const cw = w + 2 * pad;
    out.push({ ch, font, w, cw, chip, ink, x, sz, rot: capWob(li, wi * 37 + ci, 6) * .13, dy: capWob(li, wi * 37 + ci, 7) * size * .07 }); x += cw + size * .03; }
  return { letters: out, w: Math.max(0, x - size * .03) };
}
function drawRansom(word, cx, y, size, li, wi, al) {
  const R = ransomLetters(word, size, li, wi); let x0 = cx - R.w / 2;
  for (const L of R.letters) { g.save(); g.globalAlpha = al; g.translate(x0 + L.x + L.cw / 2, y - size * .34 + L.dy); g.rotate(L.rot);
    const h = size * 1.12; g.fillStyle = L.chip; g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 6; g.shadowOffsetY = 2; g.fillRect(-L.cw / 2, -h / 2, L.cw, h);
    g.shadowColor = 'transparent'; g.font = L.font; g.fillStyle = L.ink; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(L.ch, 0, size * .04); g.restore(); }
}
function captions(t) {
  const S = CAPS[CAP_STYLE] || CAPS.gochi;
  let L = null, end = 0; for (let i = 0; i < LINES.length; i++) { const l = LINES[i], nx = LINES[i + 1]; const e = Math.min(l.e + .6, nx ? nx.s - .05 : 1e9); if (t >= l.s - .05 && t < e) { L = l; end = e; } }
  if (!L || CAP_HIDE.has(L.i)) return; const n = wordsShown(L, t + .05); if (!n) return;
  // lay the line out: one row, or two rows split at the word nearest the middle; then fit the widest row (its words, the
  // gaps we draw, the slant and any box padding) inside CAP.maxW, so every word and its box sit inside the frame
  const words = L.text.split(/\s+/).map((w) => S.caps ? w.toUpperCase() : w); g.font = S.font.replace('{s}', S.size);
  const w1 = words.map((w, i) => S.ransom ? ransomLetters(w, S.size, L.i, i).w : g.measureText(w).width), rowW = (a, b, s) => (w1.slice(a, b).reduce((x, y) => x + y, 0) + S.size * S.gap * (b - a - 1)) * s / S.size + (S.skew ? Math.abs(S.skew) * s : 0) + 2 * (S.box ? S.box.padX : 0) * s + (S.stroke ? (S.stroke + .05) * s : 0);
  let rows = [[0, words.length]];
  if (words.length > 2 && rowW(0, words.length, S.size) * .8 > CAP.maxW) { let best = 1, bd = 1e9; for (let k = 1; k < words.length; k++) { const d = Math.abs(rowW(0, k, S.size) - rowW(k, words.length, S.size)); if (d < bd) { bd = d; best = k; } } rows = [[0, best], [best, words.length]]; }
  const size = Math.max(18, Math.floor(S.size * Math.min(1, ...rows.map(([a, b]) => CAP.maxW / rowW(a, b, S.size))))); g.font = S.font.replace('{s}', size); g.textBaseline = 'alphabetic';
  g.font = S.font.replace('{s}', size); const gap = size * S.gap, widths = words.map((w, i) => S.ransom ? ransomLetters(w, size, L.i, i).w : (g.font = S.font.replace('{s}', size), g.measureText(w).width)), lead = size * (S.box ? 1.5 : 1.22);
  g.font = S.font.replace('{s}', size); const m = g.measureText('Hgjy'), asc = m.actualBoundingBoxAscent, dsc = m.actualBoundingBoxDescent;
  const fadeIn = clamp((t - L.s + .05) / .2), fadeOut = clamp((end - t) / .25);
  rows.forEach(([a, b], r) => {
    const tw = widths.slice(a, b).reduce((x, y) => x + y, 0) + gap * (b - a - 1), y = CAP.y - (rows.length - 1 - r) * lead; let x = W / 2 - tw / 2;
    // the band covers the full row from the line's first word, fades in and out with the line, and eases off at night
    const ba = S.band ? fadeIn * fadeOut * (.48 - .16 * nightAmt(t)) * S.band : 0;
    if (ba > 0 && (r === 0 || n > a)) { const pad = size * 1.6; g.save(); g.globalAlpha = ba; g.drawImage(CAP_BAND, x - pad, y - size * 1.42, tw + 2 * pad, size * 2.15); g.restore(); }
    // a box style: one rounded box round the row's words shown so far, from the font's own ascent and descent
    if (S.box && n > a) { let shownW = 0; for (let i = a; i < Math.min(n, b); i++) shownW += widths[i] + (i > a ? gap : 0);
      const bx = x - S.box.padX * size, bw = shownW + 2 * S.box.padX * size, by = y - asc - S.box.padY * size, bh = asc + dsc + 2 * S.box.padY * size;
      g.save(); g.globalAlpha = fadeOut; g.fillStyle = S.box.fill; g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = 10; g.shadowOffsetY = 2; rrect(bx, by, bw, bh, S.box.r * size); g.fill(); g.restore(); }
    for (let i = a; i < b; i++) { if (i < (S.full ? words.length : n)) { const ws = L.words[i] ? L.words[i].s : L.s, age = t - ws, al = S.full ? fadeIn * fadeOut : clamp(age / .12 + .2) * fadeOut;
      let txt = words[i]; if (S.type) txt = txt.slice(0, Math.max(1, Math.ceil(clamp((age + .02) / Math.min(.3, .06 * txt.length)) * txt.length)));
      g.save(); g.globalAlpha = al; g.translate(x + widths[i] / 2, y);
      if (S.wob) { g.translate(0, capWob(L.i, i, 1) * size * .05); g.rotate(capWob(L.i, i, 0) * .045); }
      if (S.skew) g.transform(1, 0, S.skew, 1, 0, 0);
      const lx = -widths[i] / 2;
      if (S.ransom) { g.restore(); drawRansom(txt, x + widths[i] / 2, y, size, L.i, i, al); g.save();
      } else if (S.box) { g.fillStyle = S.box.ink; g.fillText(txt, lx, 0);
      } else if (S.neon) { // tube glow: wide soft pink, tight pink, white core; a quick flicker as each word lights
        const fl = age < .25 ? (Math.sin(age * 90) > -.2 ? 1 : .35) : 1; g.globalAlpha = al * fl;
        g.fillStyle = S.neon; g.shadowColor = S.neon; g.shadowBlur = size * .5; g.fillText(txt, lx, 0); g.shadowBlur = size * .18; g.fillText(txt, lx, 0);
        g.shadowBlur = size * .06; g.shadowColor = '#ffd0ee'; g.fillStyle = '#fff6fb'; g.fillText(txt, lx, 0);
      } else if (S.stroke) { // ViralVision: drop shadow first, then a heavy black stroke under the fill
        g.fillStyle = 'rgba(0,0,0,.43)'; g.fillText(txt, lx + .05 * size, .06 * size);
        g.lineJoin = 'round'; g.strokeStyle = 'rgba(0,0,0,.94)'; g.lineWidth = size * S.stroke; g.strokeText(txt, lx, 0);
        g.fillStyle = S.accent && i === n - 1 ? S.accent : '#ffffff'; g.fillText(txt, lx, 0);
      } else {
        if (S.edge) { g.lineJoin = 'round'; g.strokeStyle = 'rgba(20,10,5,.9)'; g.lineWidth = size * .09; g.strokeText(txt, lx, 0); }
        g.shadowColor = 'rgba(20,10,5,.85)'; g.shadowBlur = 14; g.shadowOffsetY = 3; g.fillStyle = S.accent && i === n - 1 ? S.accent : S.fill || (S.wob ? '#f7ecd3' : '#ffffff'); g.fillText(txt, lx, 0); }
      g.restore();
      probeWord(t, L.i, i, (tt) => i < wordsShown(L, tt + .05)); }
      x += widths[i] + gap; }
  });
}

// ---------- a world inside the table (guest pick 5, N27) ----------
// After "dime" the camera seems to drop through the driver's hole into a storybook playa inside the table, "once upon a
// time": burners stream through a gate turnstile for free, and on "poor" a poor man at the front holds his bowl up and a
// burner drops a coin in it. Then, on "dared", we pull back out through the same hole, wherever it now sits in frame,
// onto the full-size poor person outside, who carries "dared to ask you to share". Screen-space iris: it starts as the hole's own outline and ends there.
const TW = { o0: wt(16, 'nobody') + .07, o1: wt(16, 'nobody') + .72, c0: wt(17, 'dared') - .16, c1: wt(17, 'dared') + .44, R: 1060 };
const TWC = mkCanvas(); const twg = TWC.getContext('2d');
function holeOutline() { // the hole's ring in screen space, its centre, mean radius; null when it can't be seen
  const pts = []; for (let i = 0; i < 32; i++) { const a = i / 32 * TAU, p = PL(Math.cos(a) * .55, TOP, Math.sin(a) * .45); if (p[2] < .3) return null; pts.push(p); }
  const h = PL(0, TOP, 0); const r = pts.reduce((s, p) => s + Math.hypot(p[0] - h[0], p[1] - h[1]), 0) / pts.length;
  if (h[0] < -r || h[0] > W + r || h[1] < -r || h[1] > H + r) return null; return { pts, h, r: Math.max(r, 3) };
}
function tableWorld(t) {
  if (t < TW.o0 || t > TW.c1) return;
  const d = t < TW.c0 ? smooth(lin(t, TW.o0, TW.o1)) : 1 - smooth(lin(t, TW.c0, TW.c1)); if (d <= 0) return;
  let ho = holeOutline(); if (!ho) { const pts = []; for (let i = 0; i < 32; i++) { const a = i / 32 * TAU; pts.push([W / 2 + Math.cos(a) * 40, H / 2 + Math.sin(a) * 18]); } ho = { pts, h: [W / 2, H / 2], r: 30 }; }
  const R = ho.r * Math.pow(TW.R / ho.r, d), Z = R / ho.r, round = smooth(d * 1.4), c = [lerp(ho.h[0], W / 2, smooth(d)), lerp(ho.h[1], H / 2, smooth(d))];
  // 1. the push: the frame itself grows about the hole while the hole slides to the centre
  twg.setTransform(1, 0, 0, 1, 0, 0); twg.clearRect(0, 0, W, H); g.imageSmoothingQuality = 'high'; twg.drawImage(g.canvas, 0, 0);
  g.save(); g.setTransform(Z, 0, 0, Z, c[0] - Z * ho.h[0], c[1] - Z * ho.h[1]); g.drawImage(TWC, 0, 0); g.restore();
  // 2. the iris: the zoomed hole outline, rounding out into a circle as we drop in
  // the circle keeps the ring's own orientation (its local +x and +z axes on screen), so an edge-on hole still opens cleanly
  const ax = ho.pts[0], az = ho.pts[8], ux = Math.atan2(ax[1] - ho.h[1], ax[0] - ho.h[0]), cr = (ax[0] - ho.h[0]) * (az[1] - ho.h[1]) - (ax[1] - ho.h[1]) * (az[0] - ho.h[0]), wnd = cr < 0 ? -1 : 1;
  const iris = ho.pts.map((p, i) => { const q = [c[0] + Z * (p[0] - ho.h[0]), c[1] + Z * (p[1] - ho.h[1])], a = ux + wnd * i / ho.pts.length * TAU; return [lerp(q[0], c[0] + Math.cos(a) * R, round), lerp(q[1], c[1] + Math.sin(a) * R, round)]; });
  const path = () => { g.beginPath(); iris.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
  g.save(); path(); g.clip();
  const sc = Math.pow(R / TW.R, .3); g.translate(c[0], c[1]); g.scale(sc, sc); g.translate(-W / 2, -H / 2); miniPlaya(t); g.setTransform(1, 0, 0, 1, 0, 0);
  const sh = g.createRadialGradient(c[0], c[1], R * .7, c[0], c[1], R * 1.02); sh.addColorStop(0, 'rgba(20,6,2,0)'); sh.addColorStop(1, 'rgba(20,6,2,.55)'); g.fillStyle = sh; g.fillRect(0, 0, W, H);
  g.restore();
  // 3. the hole's rim: dark cut wood and the gold inlay, so we always know we are looking through the table
  g.save(); g.lineJoin = 'round'; path(); g.strokeStyle = '#2a0f08'; g.lineWidth = Math.max(3, R * .07); g.stroke(); path(); g.strokeStyle = '#c9a24a'; g.lineWidth = Math.max(1.5, R * .008); g.stroke(); g.restore();
}
// The storybook playa, drawn in a 1920x1080 frame of its own (tableWorld places and scales it).
const MINI_COST = [['#d8452f', 'tutu'], ['#2f6fb5', 'wings'], ['#e8b23a', 'tophat'], ['#3c8c5a', 'fur'], ['#7a3c8c', 'tutu'], ['#f2ede0', 'wings'], ['#d8452f', 'tophat'], ['#2f6fb5', 'fur'], ['#e8b23a', 'wings']];
function miniPlaya(t) {
  const hy = 610, [top, low] = skyCols(t), sep = [236, 196, 140];
  const sg = g.createLinearGradient(0, 0, 0, hy); sg.addColorStop(0, rgb(mix(top, sep, .3))); sg.addColorStop(1, rgb(mix(low, sep, .35))); g.fillStyle = sg; g.fillRect(-200, -200, W + 400, hy + 202);
  g.fillStyle = '#c8392b'; g.beginPath(); g.arc(1500, 250, 70, 0, TAU); g.fill(); // a red sun, the driver's hat over his own little world
  g.fillStyle = 'rgba(200,57,43,.18)'; g.beginPath(); g.arc(1500, 250, 110, 0, TAU); g.fill();
  const gg = g.createLinearGradient(0, hy, 0, H); gg.addColorStop(0, rgb(mix(PAL.groundFar, low, .3))); gg.addColorStop(1, rgb(PAL.groundNear)); g.fillStyle = gg; g.fillRect(-200, hy, W + 400, H - hy + 200);
  g.strokeStyle = 'rgba(110,72,40,.35)'; g.lineWidth = 2; for (let j = 1; j < 9; j++) { const y = hy + 470 * (j / 8) ** 2; g.beginPath(); for (let x = -200; x <= W + 200; x += 60) { const yy = y + 6 * n1(70 + j, x / 140) * (j / 8); x === -200 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); }
  for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(960 + i * 40, hy); g.lineTo(960 + i * 420, H + 200); g.stroke(); }
  // the far camps and the plain Man, before anyone put a suit on him
  for (let i = 0; i < 9; i++) { const x = 120 + i * 210 + 40 * rnd(i, 61), r = 26 + 16 * rnd(i, 62); g.fillStyle = ['#e9e1cf', '#d8452f', '#2f6fb5', '#e8b23a'][i % 4]; g.beginPath(); g.arc(x, hy + 2, r, Math.PI, TAU); g.fill(); }
  g.strokeStyle = '#6e5232'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(940, hy); g.lineTo(950, hy - 60); g.lineTo(960, hy); g.moveTo(950, hy - 60); g.lineTo(950, hy - 100); g.moveTo(950, hy - 92); g.lineTo(932, hy - 66); g.moveTo(950, hy - 92); g.lineTo(968, hy - 66); g.stroke();
  g.beginPath(); g.arc(950, hy - 108, 8, 0, TAU); g.stroke();
  // the gate: two poles, bunting, and a turnstile that turns a third for every burner who walks through
  const gx = 700, gy = 820, P0 = TW.o0 - .4, per = .5, n = (t - P0) / per, step = Math.floor(n), frac = n - step;
  for (const px of [gx - 150, gx + 150]) { g.fillStyle = 'rgba(52,34,58,.3)'; g.beginPath(); g.moveTo(px - 6, gy); g.lineTo(px + 6, gy); g.lineTo(px + 260, gy + 120); g.lineTo(px + 246, gy + 124); g.fill(); g.fillStyle = '#7b5a3a'; g.fillRect(px - 7, gy - 330, 14, 330); }
  for (let i = 0; i < 12; i++) { const u0 = i / 12, u1 = (i + 1) / 12, sag = (u) => gy - 320 + 40 * Math.sin(u * Math.PI), x0 = gx - 150 + 300 * u0, x1 = gx - 150 + 300 * u1;
    g.fillStyle = ['#d8452f', '#e8b23a', '#2f6fb5', '#3c8c5a'][i % 4]; g.beginPath(); g.moveTo(x0, sag(u0)); g.lineTo(x1, sag(u1)); g.lineTo((x0 + x1) / 2, sag((u0 + u1) / 2) + 34); g.fill(); }
  // queue from the right toward the gate; whoever is at the front steps through and walks off toward the Man
  const qx = (q) => gx + 40 + q * 120, people = [];
  for (let i = 0; i < 12; i++) { const q = i - step - smooth(clamp(frac / .6)); if (q > 7) continue; let x, y, s, walk = frac < .6 ? 1 : 0;
    if (q >= 0) { x = qx(q); y = gy + 30 - q * 4; s = 1 - q * .015; }
    else { const a = -q; x = gx - 30 - a * 90; y = gy + 30 - a * 70; s = Math.max(.15, 1 - a * .3); walk = 1; if (s <= .16) continue; }
    people.push({ x, y, s, i, walk }); }
  people.sort((a, b) => a.y - b.y).forEach((p) => burner(p.x, p.y, 230 * p.s, MINI_COST[p.i % MINI_COST.length], t, p.walk, p.i));
  const ang = (step + smooth(clamp((frac - .15) / .4))) * TAU / 3; g.fillStyle = '#8f949c'; g.fillRect(gx - 9, gy - 150, 18, 150); g.fillStyle = '#5e636b'; g.beginPath(); g.arc(gx, gy - 150, 18, 0, TAU); g.fill();
  g.strokeStyle = '#b8bdc4'; g.lineWidth = 12; for (let a = 0; a < 3; a++) { const th = ang + a * TAU / 3, ex = gx + Math.cos(th) * 110, ey = gy - 150 + Math.sin(th) * 34 + 30; g.beginPath(); g.moveTo(gx, gy - 150); g.lineTo(ex, ey); g.stroke(); }
  bobby(t); poorMan(t);
}
// draft 9: on "crime" a storybook bobby (1.8 m, blue tunic, tall helmet) beside the poor man tips his helmet, then
// drops the coin into the bowl (the coin's own flight and its landing at 130.0 are the protected ones in poorMan)
const BOBBY = { x: 1035, y: 1058, k: 2.75 };
function bobbyHand(t) { // his right hand, screen px: by his side, then out over the bowl as the coin goes
  const { x, y, k } = BOBBY, out = ease(t, wt(17, 'poor') - .45, wt(17, 'poor') - .05) * (1 - ease(t, wt(17, 'poor') + .6, wt(17, 'poor') + 1.1));
  return [x + lerp(30, 150, out) * k, y - lerp(80, 150, out) * k]; }
function bobby(t) {
  const { x, y, k } = BOBBY, cr = wt(16, 'crime'), tip = ease(t, cr - .12, cr + .15) * (1 - ease(t, cr + .55, cr + .85)), sw = Math.sin(t * 1.7) * .015;
  g.fillStyle = 'rgba(52,34,58,.32)'; g.beginPath(); g.moveTo(x - 30 * k, y); g.lineTo(x + 30 * k, y); g.lineTo(x + 230 * k, y + 80 * k); g.lineTo(x + 180 * k, y + 90 * k); g.fill(); // his long hard shadow
  g.strokeStyle = '#1d2240'; g.lineWidth = 15 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 13 * k, y - 100 * k); g.lineTo(x - 17 * k, y - 4 * k); g.moveTo(x + 13 * k, y - 100 * k); g.lineTo(x + 16 * k, y - 4 * k); g.stroke();
  g.fillStyle = '#121420'; g.fillRect(x - 30 * k, y - 10 * k, 24 * k, 10 * k); g.fillRect(x + 4 * k, y - 10 * k, 26 * k, 10 * k); // boots
  g.save(); g.translate(x, y - 100 * k); g.rotate(sw);
  g.fillStyle = '#26347a'; g.beginPath(); g.moveTo(-32 * k, -112 * k); g.lineTo(32 * k, -112 * k); g.lineTo(38 * k, 8 * k); g.lineTo(-38 * k, 8 * k); g.closePath(); g.fill(); // the tunic
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(6 * k, -112 * k, 32 * k, 120 * k);
  g.fillStyle = '#15182c'; g.fillRect(-38 * k, -22 * k, 76 * k, 9 * k); g.fillStyle = '#c9ccd4'; g.fillRect(-5 * k, -23 * k, 10 * k, 11 * k); // belt and buckle
  g.fillStyle = '#d9dce4'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(0, (-98 + i * 22) * k, 3.2 * k, 0, TAU); g.fill(); } // silver buttons
  g.fillStyle = '#e8d4b4'; g.beginPath(); g.arc(0, -134 * k, 23 * k, 0, TAU); g.fill(); // a round faceless head
  // his left arm goes up to the helmet on "crime"; the helmet lifts off his head and settles back
  const hand = [lerp(-28, -20, tip) * k, lerp(-20, -190, tip) * k]; g.strokeStyle = '#26347a'; g.lineWidth = 12 * k; g.beginPath(); g.moveTo(-26 * k, -102 * k); g.lineTo(hand[0], hand[1]); g.stroke();
  g.save(); g.translate(0, -150 * k - 34 * k * tip); g.rotate(-.18 * tip);
  g.fillStyle = '#161a33'; g.beginPath(); g.moveTo(-27 * k, 6 * k); g.lineTo(27 * k, 6 * k); g.lineTo(22 * k, -40 * k); g.quadraticCurveTo(0, -78 * k, -22 * k, -40 * k); g.closePath(); g.fill(); // the tall helmet
  g.fillRect(-30 * k, 2 * k, 60 * k, 6 * k); g.fillStyle = '#c9ccd4'; g.beginPath(); g.moveTo(0, -36 * k); g.lineTo(9 * k, -22 * k); g.lineTo(0, -10 * k); g.lineTo(-9 * k, -22 * k); g.closePath(); g.fill(); // the silver star
  g.beginPath(); g.arc(0, -64 * k, 4 * k, 0, TAU); g.fill(); g.restore();
  g.fillStyle = '#e8d4b4'; g.beginPath(); g.arc(hand[0], hand[1], 7 * k, 0, TAU); g.fill();
  g.restore();
  const h = bobbyHand(t); g.strokeStyle = '#26347a'; g.lineWidth = 12 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 24 * k, y - 202 * k); g.lineTo(h[0], h[1]); g.stroke(); // his right arm, out to the bowl
  g.fillStyle = '#e8d4b4'; g.beginPath(); g.arc(h[0], h[1], 7 * k, 0, TAU); g.fill();
}
function burner(x, y, h, cost, t, walk, seed) { // a small costumed burner: feet at (x, y), h tall, facing left
  const [col, kind] = cost, k = h / 230, sw = walk ? Math.sin(t * 9 + seed) * .35 : 0;
  g.fillStyle = 'rgba(52,34,58,.3)'; g.beginPath(); g.moveTo(x - 10 * k, y); g.lineTo(x + 10 * k, y); g.lineTo(x + 170 * k, y + 70 * k); g.lineTo(x + 150 * k, y + 76 * k); g.fill(); // a long hard shadow
  g.strokeStyle = '#3a3040'; g.lineWidth = 11 * k; g.lineCap = 'round';
  for (const d of [-1, 1]) { g.beginPath(); g.moveTo(x, y - 95 * k); g.lineTo(x + Math.sin(d * sw) * 50 * k, y); g.stroke(); }
  if (kind === 'wings') { g.fillStyle = 'rgba(240,230,250,.8)'; for (const d of [-1, 1]) { g.beginPath(); g.ellipse(x + 26 * k, y - 160 * k + d * 22 * k, 46 * k, 20 * k, d * .5, 0, TAU); g.fill(); } }
  g.fillStyle = col; g.beginPath(); g.moveTo(x - 22 * k, y - 190 * k); g.lineTo(x + 22 * k, y - 190 * k);
  if (kind === 'tutu') { g.lineTo(x + 18 * k, y - 120 * k); g.lineTo(x + 50 * k, y - 92 * k); g.lineTo(x - 50 * k, y - 92 * k); g.lineTo(x - 18 * k, y - 120 * k); }
  else if (kind === 'fur') { g.lineTo(x + 40 * k, y - 120 * k); g.lineTo(x + 34 * k, y - 80 * k); g.lineTo(x - 34 * k, y - 80 * k); g.lineTo(x - 40 * k, y - 120 * k); }
  else { g.lineTo(x + 24 * k, y - 95 * k); g.lineTo(x - 24 * k, y - 95 * k); }
  g.closePath(); g.fill(); g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(x + 4 * k, y - 190 * k, 20 * k, 98 * k);
  g.strokeStyle = col; g.lineWidth = 9 * k; g.beginPath(); g.moveTo(x - 14 * k, y - 180 * k); g.lineTo(x - 30 * k - sw * 20 * k, y - 120 * k); g.stroke();
  g.fillStyle = '#e8d4b4'; g.beginPath(); g.arc(x, y - 212 * k, 20 * k, 0, TAU); g.fill();
  g.fillStyle = '#1e1a22'; g.fillRect(x - 22 * k, y - 220 * k, 26 * k, 7 * k); // goggles
  if (kind === 'tophat') { g.fillStyle = '#1e1a22'; g.fillRect(x - 26 * k, y - 234 * k, 52 * k, 6 * k); g.fillRect(x - 16 * k, y - 272 * k, 32 * k, 40 * k); g.fillStyle = col; g.fillRect(x - 16 * k, y - 242 * k, 32 * k, 6 * k); }
}
function poorMan(t) { // foreground right: a poor man in a patched coat holds his bowl up on "poor", and a burner tosses a coin into it
  const ask = ease(t, wt(17, 'poor') - .25, wt(17, 'poor') + .2), x = 1370, y = 1060, k = 2.6, sw = Math.sin(t * 2) * .02;
  g.fillStyle = 'rgba(52,34,58,.32)'; g.beginPath(); g.moveTo(x - 40 * k, y); g.lineTo(x + 40 * k, y); g.lineTo(x + 260 * k, y + 90 * k); g.lineTo(x + 200 * k, y + 100 * k); g.fill();
  g.strokeStyle = '#4b4a5a'; g.lineWidth = 15 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 14 * k, y - 100 * k); g.lineTo(x - 20 * k, y); g.moveTo(x + 14 * k, y - 100 * k); g.lineTo(x + 18 * k, y); g.stroke();
  g.save(); g.translate(x, y - 100 * k); g.rotate(sw - .06 * (1 - ask));
  g.fillStyle = '#6b6a78'; g.beginPath(); g.moveTo(-34 * k, -110 * k); g.lineTo(34 * k, -110 * k); g.lineTo(44 * k, 10 * k); g.lineTo(-44 * k, 10 * k); g.closePath(); g.fill();
  g.fillStyle = '#8a7a5c'; g.fillRect(-26 * k, -60 * k, 18 * k, 16 * k); g.fillStyle = '#5a6a7a'; g.fillRect(12 * k, -30 * k, 16 * k, 18 * k); // patches
  g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(6 * k, -110 * k, 28 * k, 120 * k);
  const by = lerp(-40, -150, ask) * k, bx = lerp(-30, -54, ask) * k;
  g.strokeStyle = '#6b6a78'; g.lineWidth = 12 * k; g.beginPath(); g.moveTo(-26 * k, -100 * k); g.lineTo(bx - 8 * k, by + 12 * k); g.moveTo(24 * k, -100 * k); g.lineTo(bx + 30 * k, by + 12 * k); g.stroke();
  g.fillStyle = '#e8d4b4'; g.beginPath(); g.arc(0, -134 * k, 24 * k, 0, TAU); g.fill(); g.fillStyle = '#3d3c48'; g.beginPath(); g.ellipse(2 * k, -152 * k, 28 * k, 10 * k, 0, Math.PI, TAU); g.fill(); g.fillRect(-26 * k, -154 * k, 56 * k, 6 * k);
  g.fillStyle = '#2a2420'; g.beginPath(); g.arc(-10 * k, -138 * k, 2.6 * k, 0, TAU); g.fill();
  // the bowl, wooden, held out in both hands
  g.fillStyle = '#8a5a30'; g.beginPath(); g.ellipse(bx + 10 * k, by, 36 * k, 26 * k, 0, 0, Math.PI); g.fill(); g.fillStyle = '#5a3418'; g.beginPath(); g.ellipse(bx + 10 * k, by, 36 * k, 8 * k, 0, 0, TAU); g.fill();
  g.strokeStyle = '#c99a62'; g.lineWidth = 2.5 * k; g.beginPath(); g.ellipse(bx + 10 * k, by, 36 * k, 8 * k, 0, 0, TAU); g.stroke();
  // the coin: tossed from the queue on "poor", lands in the bowl with a glint as we pull out
  const cs = wt(17, 'poor'), cu = clamp((t - cs) / .45);
  if (cu > 0) { const hb = bobbyHand(cs), sx = hb[0] - x, sy = hb[1] - (y - 100 * k), cx = lerp(sx, bx + 10 * k, cu), cy = lerp(sy, by - 4 * k, cu) - Math.sin(cu * Math.PI) * 60, sp = Math.abs(Math.cos(t * 18)); // draft 9: dropped from the bobby's hand
    g.fillStyle = '#e8c04a'; g.beginPath(); g.ellipse(cx, cy, 13 * k * (cu < 1 ? sp * .8 + .2 : 1), 13 * k, 0, 0, TAU); g.fill(); g.strokeStyle = '#a07a1e'; g.lineWidth = 2 * k; g.stroke();
    if (cu >= 1) { const gl = 1 - clamp((t - cs - .45) / .5); if (gl > 0) { g.strokeStyle = `rgba(255,240,190,${.4 * gl})`; g.lineWidth = 3 * k; for (let a = 0; a < 4; a++) { const th = a * Math.PI / 2 + .4; g.beginPath(); g.moveTo(cx + Math.cos(th) * 16 * k, cy + Math.sin(th) * 16 * k); g.lineTo(cx + Math.cos(th) * 30 * k, cy + Math.sin(th) * 30 * k); g.stroke(); } } } }
  g.restore();
}

// ---------- the end: the last embers drift together into one spark, and it goes out as the frame lands on black at 268.9 ----------
const END = { s: 265.3, dark: 268.0, merge: 268.15, out: 268.88 };
function lastEmbers(t) {
  if (t < END.s || t >= END.out) return; const m = manGeom(); let tx = m.p[0], ty = m.p[1] - 4 * m.k;
  if (m.p[2] < 1 || tx < 0 || tx > W || ty < 0 || ty > H) { tx = W / 2; ty = H * .55; }
  const con = Math.pow(smooth(lin(t, END.s + .3, END.merge)), 1.25), dieU = lin(t, END.merge, END.out), life = 1 - smooth(dieU);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 64; i++) { const ox = (rnd(i, 81) - .5) * W * .62, oy = -(rnd(i, 82) * H * .42) + 30, rise = (t - END.s) * (14 + 20 * rnd(i, 83)), a0 = (1 - con) * (1.6 + rnd(i, 84)) * (i % 2 ? 1 : -1);
    const rx = ox * Math.cos(a0) - (oy - rise) * Math.sin(a0) * .4, ry = ox * Math.sin(a0) * .4 + (oy - rise) * Math.cos(a0), x = tx + rx * (1 - con), y = ty + ry * (1 - con);
    const al = ease(t, END.s, END.s + .7) * (.45 + .55 * con) * (.6 + .4 * Math.sin(t * 7 + i)) * life, r = (2.6 + 2.4 * rnd(i, 85)) * (1 - .45 * con);
    g.fillStyle = `rgba(255,${150 + 60 * con | 0},${70 + 40 * con | 0},${al * .8})`; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  const core = smooth(lin(t, END.s + 1.2, END.merge)) * life; // the merged spark: warm, never white, its glow at most .38
  if (core > 0) { const R = 70 * core + 6; const rg = g.createRadialGradient(tx, ty, 0, tx, ty, R); rg.addColorStop(0, `rgba(255,190,110,${.38 * core})`); rg.addColorStop(.25, `rgba(255,130,50,${.2 * core})`); rg.addColorStop(1, 'rgba(255,90,20,0)'); g.fillStyle = rg; g.fillRect(tx - R, ty - R, 2 * R, 2 * R);
    g.fillStyle = `rgba(255,214,150,${.9 * core})`; g.beginPath(); g.arc(tx, ty, 2 + 5 * core, 0, TAU); g.fill(); }
  g.restore();
}

// ---------- draft 9: the drone's roll, as a post pass ----------
// The finished frame turns about its centre, scaled just enough that its corners never show (1.78x at 90 degrees, 1x
// upside down), so the playa hangs overhead and the board drives on upside down against the sky.
function rollFrame(a) { const ph = Math.abs(a) % Math.PI, fo = Math.min(ph, Math.PI - ph), s = 1.004 * Math.max((W * Math.cos(fo) + H * Math.sin(fo)) / W, (W * Math.sin(fo) + H * Math.cos(fo)) / H);
  twg.setTransform(1, 0, 0, 1, 0, 0); twg.clearRect(0, 0, W, H); twg.drawImage(g.canvas, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingQuality = 'high'; g.translate(W / 2, H / 2); g.rotate(a); g.scale(s, s); g.translate(-W / 2, -H / 2); g.drawImage(TWC, 0, 0); g.restore(); }

// ---------- frame ----------
// Optional front hooks: any builder file may declare function burnFront(t) / playaFront(t) / installsFront(t) / carFront(t)
// to draw over the car layer and the fire (before Little Bob, the insert, the vignette and the captions).
const FRONT_HOOKS = ['carFront', 'burnFront', 'playaFront', 'installsFront', 'instrumentsFront', 'scenesFront', 'artcarsFront', 'artpiecesFront'];
function render(t) {
  DRESS_T = t; if (ACT.on) ACT.reset(); // the check tools read what each actor reports this frame
  C = camAt(t); CP = Math.cos(C.p); SP = Math.sin(C.p); CX = carX(t); CZ = carZ(t); YAW = yaw(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  skyAndGround(t);
  const list = [];
  list.push({ z: P(MAN.x, 0, MAN.z)[2], draw: () => theMan(t), shadow: () => shadowStick(MAN.x, 0, 22, MAN.z, 6, t) });
  elephantsInto(t, list); jails(t, list); poorPerson(t, list); cops(t, list);
  for (const c of CAMPS) { const z = P(c.X, 0, c.Z)[2]; if (z > 2) list.push({ z, draw: () => camp(c, t), shadow: () => shadowOf([[c.X - c.r, 0, c.Z], [c.X + c.r, 0, c.Z], [c.X, c.r, c.Z]], t) }); }
  for (const l of LAMPS) { const z = P(l.X, 0, l.Z)[2]; if (z > 2) list.push({ z, draw: () => lamp(l, t, false), shadow: () => shadowStick(l.X, 0, 5, l.Z, .15, t) }); }
  for (const b of BIKES) { const o = bike(b, t); if (o) list.push(o); }
  crowdInto(t, list); bigEar(t, list); gagMouth(t, list); tumblePapers(t, list); suitColumn(t, list); teeth(t, list); clockCar(t, list); giantChess(t, list);
  carInto(t, list); tableInto(t, list); playaInto(t, list); burnInto(t, list); installsInto(t, list); instrumentsInto(t, list); scenesInto(t, list); // one scene hook per builder file (draft 3; instruments and scenes draft 9)
  if (typeof artcarsInto === 'function') artcarsInto(t, list); if (typeof artpiecesInto === 'function') artpiecesInto(t, list); // Robin's art cars and installations (artcars.js, artpieces.js)
  for (const o of list) if (o.z > .5 && o.shadow) o.shadow();
  tableShadow(t);
  list.sort((a, b) => b.z - a.z); for (const o of list) if (o.z > .3) o.draw();
  spinDevils(t); bigGavel(t);
  installsOver(t); burnOver(t); // screen-space overlays before the grade
  grade(t);
  for (const l of LAMPS) lamp(l, t, true); spinners(t); if (typeof drumGlow === 'function') drumGlow(t); if (typeof artcarsGlow === 'function') artcarsGlow(t); // the art cars' own night lights (artcars.js)
  if (typeof carUnderglowGround === 'function') carUnderglowGround(t); // draft 23: the boardroom car's blue underglow on the playa (car.js)
  // the car layer: drawn, graded, lit by its own emissive props, masked to its own pixels, then laid over the fire
  g = gc; gc.setTransform(1, 0, 0, 1, 0, 0); gc.globalCompositeOperation = 'source-over'; gc.globalAlpha = 1; gc.clearRect(0, 0, W, H);
  drawCar(t); gm.clearRect(0, 0, W, H); gm.drawImage(CARC, 0, 0); grade(t, true); gc.globalCompositeOperation = 'destination-in'; gc.drawImage(MASK, 0, 0); gc.globalCompositeOperation = 'source-over';
  whiteboard(t, true); truth(t, true); if (typeof carGlow === 'function') carGlow(t); g = g0; // firelight rim on the night suits (car.js)
  const carBehind = P(CX, 0, CZ)[2] > P(MAN.x, 0, MAN.z)[2];
  if (carBehind) g.drawImage(CARC, 0, 0);
  manFire(t); ballotEmbers(t);
  if (!carBehind) g.drawImage(CARC, 0, 0);
  for (const f of FRONT_HOOKS) if (typeof window[f] === 'function') { g.save(); window[f](t); g.restore(); }
  bobWalk(t);
  tableWorld(t);
  if (C.roll) rollFrame(C.roll); // draft 9: the "perverse" roll (camera.js camRoll)
  vignette();
  drawGrain(g, t, .1);
  const fin = ease(t, END.s + .1, END.dark), fo = 1 - ease(t, 0, 1.2), blk = Math.max(fin, fo); if (blk > 0) { g.fillStyle = `rgba(0,0,0,${blk})`; g.fillRect(0, 0, W, H); }
  lastEmbers(t);
  if (t >= END.out) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); }
  if (typeof buhTeeth === "function" && t < END.out) buhTeeth(t); // draft 25: the chattering teeth on the eleven "buh"s
  captions(t);
}

startPage(out, render, 0, 268.99, FONT_READY);
