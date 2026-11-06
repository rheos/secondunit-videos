// The lesson's on-screen words: fat, rounded, hand-lettered display letters (each letter tilted and
// set a hair off the baseline, inked with a brown-black outline and a drop shadow), on cut cream
// paper strips at the bottom of the frame. Every word POPS ON at its sung onset with a squash-and-stretch
// overshoot (on 2s). Like everything else on the cel, the lettering BOILS: three inked drawings of
// each word, cycled every 2 frames. Key words are painted in colour.
//
// Stacking: the newest line's strip sits at the bottom; when a new line starts, older strips jump up
// (and shrink to 88%) and stay until their read time is up: max(next line start, last word end + 1.2 s).

const CAPT = { cap: 52, held: .88, fs: 0, maxRow: 1660, bottom: 1046, gap: 16, lead: 1 / 48 };
const KEY = { // line -> word index -> colour
  50: { 4: '#1f86cf' },
  52: { 2: '#e8762c', 3: '#e8762c' },
  55: { 7: '#e9a81e' },
  57: { 1: '#d8452f', 2: '#d8452f' },
  58: { 7: '#18938c' },
  59: { 9: '#4fa236' },
  63: { 5: '#d8452f' },
};
const WORD_FILL = '#2f3561', WORD_SHADOW = '#e9a24a', KEY_SHADOW = '#2a1810';
const capFont = (s) => `${s}px "SchoolRound"`;
const CAP_LINES = [];

function makeWord(g, text, colour, seed) {
  const fs = CAPT.fs, track = fs * .035;
  g.font = capFont(fs);
  const xs = []; for (let i = 0; i < text.length; i++) xs.push(g.measureText(text.slice(0, i)).width + track * i);
  const width = g.measureText(text).width + track * (text.length - 1);
  const pad = Math.round(fs * .42), cw = Math.ceil(width + pad * 2), ch = Math.ceil(fs * 1.75), base = Math.round(pad + CAPT.cap * 1.12);
  const lw = fs * .13, sh = [fs * .055, fs * .07];
  const vars = [];
  for (let v = 0; v < 3; v++) {
    const c = mkCanvas(cw, ch), x = c.getContext('2d');
    x.font = capFont(fs); x.textBaseline = 'alphabetic'; x.lineJoin = 'round'; x.lineCap = 'round';
    const L = [...text].map((chr, i) => ({
      chr, x: pad + xs[i] + (rnd(seed, i, v + 9) - .5) * 1.6, y: base + (rnd(seed, i, 2) - .5) * CAPT.cap * .08 + (rnd(seed, i, v + 19) - .5) * 1.4,
      a: (rnd(seed, i, 1) - .5) * .13 + (rnd(seed, i, v + 29) - .5) * .022, s: .97 + rnd(seed, i, 3) * .07,
      lw: lw * (1 + (rnd(seed, i, v + 39) - .5) * .25),
    }));
    const each = (fn) => L.forEach(l => { x.save(); x.translate(l.x, l.y); x.rotate(l.a); x.scale(l.s, l.s); fn(l); x.restore(); });
    // drop shadow, then the ink outline, then the paint (sitting a hair off the line, like the cels)
    x.fillStyle = colour ? KEY_SHADOW : WORD_SHADOW; x.strokeStyle = x.fillStyle;
    each(l => { x.lineWidth = l.lw; x.strokeText(l.chr, sh[0], sh[1]); x.fillText(l.chr, sh[0], sh[1]); });
    x.strokeStyle = INK; each(l => { x.lineWidth = l.lw; x.strokeText(l.chr, 0, 0); });
    x.fillStyle = colour || WORD_FILL; each(l => { x.fillText(l.chr, fs * .012, fs * .01); });
    if (colour) { // a painted highlight dab on the key words
      x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(255,250,230,.28)';
      each(l => { x.beginPath(); x.ellipse(fs * .12, -CAPT.cap * .72, fs * .07, fs * .035, -.5, 0, TAU); x.fill(); });
      x.globalCompositeOperation = 'source-over';
    }
    vars.push(c);
  }
  return { vars, width, pad, base, cw, ch };
}

function splitRows(words, maxW) {
  const tot = words.reduce((a, w) => a + w.width, 0) + CAPT.space * (words.length - 1);
  if (tot <= maxW) return [words];
  let best = null;
  for (let k = 1; k < words.length; k++) {
    const a = words.slice(0, k).reduce((s, w) => s + w.width, 0) + CAPT.space * (k - 1);
    const b = words.slice(k).reduce((s, w) => s + w.width, 0) + CAPT.space * (words.length - k - 1);
    if (a > maxW || b > maxW) continue;
    const sc = Math.max(a, b) + Math.abs(a - b) * .2;
    if (!best || sc < best.sc) best = { k, sc };
  }
  if (!best) throw new Error('caption line does not fit in two rows: ' + words.map(w => w.text).join(' '));
  return [words.slice(0, best.k), words.slice(best.k)];
}

function initCaptions() {
  const c = mkCanvas(64, 64), g = c.getContext('2d');
  let fs = 40; for (; fs < 120; fs++) { g.font = capFont(fs); if (g.measureText('H').actualBoundingBoxAscent >= CAPT.cap) break; }
  CAPT.fs = fs; g.font = capFont(fs); CAPT.capReal = g.measureText('H').actualBoundingBoxAscent;
  CAPT.space = g.measureText(' ').width + fs * .12;
  CAPT.rowH = CAPT.cap * 1.38; CAPT.rowGap = CAPT.cap * .42; CAPT.padY = CAPT.cap * .58; CAPT.padX = fs * .55;
  for (const L of SC_LINES) {
    const key = KEY[L.i] || {};
    const words = L.words.map((w, k) => ({ text: w.w, s: w.s, k, ...makeWord(g, w.w, key[k], L.i * 100 + k) }));
    const rows = splitRows(words, CAPT.maxRow);
    const rowW = rows.map(r => r.reduce((a, w) => a + w.width, 0) + CAPT.space * (r.length - 1));
    // horizontal room for the widest pop (an edge word at 1.14x widens by 7% each side)
    const over = Math.max(...words.map(w => w.width)) * .08;
    const sw = Math.max(...rowW) + CAPT.padX * 2 + over * 2, sh = CAPT.padY * 2 + rows.length * CAPT.rowH + (rows.length - 1) * CAPT.rowGap;
    rows.forEach((r, ri) => { let x = -rowW[ri] / 2; r.forEach(w => { w.x = x; w.row = ri; x += w.width + CAPT.space; }); });
    CAP_LINES.push({ i: L.i, s: L.words[0].s, until: readUntil(L.i), words, rows: rows.length, w: sw, h: sh, rot: (rnd(L.i, 4) - .5) * .014, dx: (rnd(L.i, 5) - .5) * 40 });
  }
}

// pop-on: stretched tall on the onset frame, squashed wide 2 frames later, settling (on 2s)
const POP = [[.74, 1.28, -12], [1.13, .87, 4], [.97, 1.04, -2]];
function popAt(lt) { if (lt < 0) return null; const k = Math.round(lt * 12); return POP[k] || [1, 1, 0]; }

// where each visible strip is at time t (pure). Returns [{L, cx, cy, sc, a}]
function captionLayout(t) {
  const vis = CAP_LINES.filter(L => t >= L.s - CAPT.lead && t < L.until);
  const out = []; let y = CAPT.bottom;
  for (let k = vis.length - 1; k >= 0; k--) {
    const L = vis[k], newest = k === vis.length - 1;
    const sc = newest ? 1 : CAPT.held;
    // the jump up when the line under it arrived, with a little overshoot
    const under = vis[k + 1], jl = under ? since(t, under.s) : -1;
    const jump = jl < 0 ? 0 : [18, 6][Math.round(jl * 12)] || 0;
    // pop out after the read time is up (the line is no longer required)
    const ol = since(t, L.until), outK = ol < 0 ? 1 : [.82, .5][Math.round(ol * 12)] || 0;
    const h = L.h * sc;
    const cy = y - h / 2 - jump;
    if (outK > 0) out.push({ L, cx: 960 + L.dx, cy, sc: sc * (ol < 0 ? 1 : outK), a: ol < 0 ? 1 : outK, gone: ol >= 0 });
    y -= h + CAPT.gap;
  }
  return out;
}

function stripPts(w, h, seed) {
  const pts = [], nx = Math.max(3, Math.round(w / 170)), j = (k, a) => (rnd(seed, k, a) - .5) * 7;
  for (let i = 0; i <= nx; i++) pts.push([-w / 2 + w * i / nx + j(i, 1), -h / 2 + j(i, 2)]);
  pts.push([w / 2 + j(50, 1), 0]);
  for (let i = nx; i >= 0; i--) pts.push([-w / 2 + w * i / nx + j(i, 3), h / 2 + j(i, 4)]);
  pts.push([-w / 2 + j(51, 1), 0]);
  return pts;
}
let CAP_DEBUG = {};
function drawCaptions(g, t) {
  const lay = captionLayout(t), b = boilOf(t);
  CAP_DEBUG = {};
  for (const { L, cx, cy, sc, a, gone } of lay) {
    g.save(); g.translate(cx, cy); g.rotate(L.rot); g.scale(sc, sc); g.globalAlpha = a;
    const pts = stripPts(L.w, L.h, L.i * 13);
    // shadow, paper, paper grain, boiling ink edge
    g.fillStyle = 'rgba(40,20,10,.35)'; g.save(); g.translate(9, 11); polyFill(g, crPath(pts, true, 3)); g.restore();
    g.fillStyle = '#f6eacb'; polyFill(g, crPath(pts, true, 3));
    g.save(); polyFill(g, crPath(pts, true, 3)); g.clip(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = a * .35;
    g.fillStyle = g.createPattern(paperTile(), 'repeat'); g.fillRect(-L.w / 2 - 10, -L.h / 2 - 10, L.w + 20, L.h + 20); g.restore();
    g.fillStyle = INK; ribbon(g, crPath(boilPts(pts, L.i * 13, b, 1.6), true, 3), true, 5.5, L.i * 13, b);
    // the words
    const shown = [];
    // audit: the strip on screen, and each word (pop included) inside its strip
    let SB = null;
    if (PROBE.on) {
      if (!gone) PROBE.box(g, 'caption strip', -L.w / 2, -L.h / 2, L.w, L.h, { keep: true });
      const b4 = ML.screenBox(g, -L.w / 2, -L.h / 2, L.w, L.h); SB = [b4[0], b4[1], b4[2] - b4[0], b4[3] - b4[1]];
    }
    for (const w of L.words) {
      const p = popAt(since(t, w.s - CAPT.lead));
      if (!p) continue;
      shown.push(w.text);
      const by = -L.h / 2 + CAPT.padY + w.row * (CAPT.rowH + CAPT.rowGap) + CAPT.cap * 1.08; // baseline
      const ax = w.x + w.width / 2, ay = by - CAPT.cap * .5;
      g.save(); g.translate(ax, ay + p[2]); g.scale(p[0], p[1]);
      g.drawImage(w.vars[b], -w.width / 2 - w.pad, CAPT.cap * .5 - w.base, w.cw, w.ch);
      if (PROBE.on) {
        probeWord(t, L.i, w.k, (tt) => !!popAt(since(tt, w.s - CAPT.lead)) && tt >= L.s - CAPT.lead);
        PROBE.box(g, 'caption word', -w.width / 2, -CAPT.cap * .5, w.width, CAPT.cap * 1.25, { inScreen: SB, margin: 2 });
      }
      g.restore();
    }
    g.restore();
    if (!gone) {
      const hw = L.w * sc / 2 + 6, hh = L.h * sc / 2 + 6;
      CAP_DEBUG[L.i] = { shown, cap: CAPT.capReal * sc, top: cy - hh, bottom: cy + hh, left: cx - hw, right: cx + hw, vis: (cy - hh >= 0 && cy + hh <= H && cx - hw >= 0 && cx + hw <= W) ? 1 : 0 };
    }
  }
  window.__capDebug = CAP_DEBUG;
}
// the top of the caption stack at time t (scenes keep their action above it)
function captionTop(t) { const lay = captionLayout(t); return lay.length ? Math.min(...lay.map(o => o.cy - o.L.h * o.sc / 2)) : H; }
