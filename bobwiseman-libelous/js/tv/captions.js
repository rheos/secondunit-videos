// Captions, both drawn into the broadcast signal (960x720) so the tube renders them like everything else.
// 1. Closed captions (the decoder box): 5x7 dot-matrix capitals, white on black boxes, roll-up rows of at most
//    27 characters, each word painted on its onset. Bottom of the picture on the puppet show; moved to the top
//    once the commercial starts (it has its own sing-along at the bottom), and for the living-room lines.
// 2. The commercial's sing-along: a bright band, the current line in two big rows, each word printed as the
//    bouncing ball lands on it. The previous line shrinks into a tab above the band until its read time is up.
//    The ball keeps to lanes between rows so it never crosses a word.
const CC_GLYPHS = {
  A: '01110100011000111111100011000110001', B: '11110100011000111110100011000111110', C: '01110100011000010000100001000101110',
  D: '11110100011000110001100011000111110', E: '11111100001000011110100001000011111', F: '11111100001000011110100001000010000',
  G: '01110100011000010111100011000101111', H: '10001100011000111111100011000110001', I: '01110001000010000100001000010001110',
  J: '00111000100001000010000101001001100', K: '10001100101010011000101001001010001', L: '10000100001000010000100001000011111',
  M: '10001110111010110101100011000110001', N: '10001100011100110101100111000110001', O: '01110100011000110001100011000101110',
  P: '11110100011000111110100001000010000', Q: '01110100011000110001101011001001101', R: '11110100011000111110101001001010001',
  S: '01111100001000001110000010000111110', T: '11111001000010000100001000010000100', U: '10001100011000110001100011000101110',
  V: '10001100011000110001100010101000100', W: '10001100011000110101101011010101010', X: '10001100010101000100010101000110001',
  Y: '10001100010101000100001000010000100', Z: '11111000010001000100010001000011111',
  0: '01110100011001110101110011000101110', 1: '00100011000010000100001000010001110', 2: '01110100010000100010001000100011111',
  3: '11111000100010000010000011000101110', 4: '00010001100101010010111110001000010', 5: '11111100001111000001000011000101110',
  6: '00110010001000011110100011000101110', 7: '11111000010001000100010000100001000', 8: '01110100011000101110100011000101110',
  9: '01110100011000101111000010001001100', '?': '01110100010000100010001000000000100', "'": '00100001000100000000000000000000000',
  '.': '00000000000000000000000000110001100', ',': '00000000000000000000011000010001000', '-': '00000000000000011111000000000000000',
};
const CC = { dotW: 4.6, dotH: 6, cell: 27.6, rowH: 54, x0: 92, maxCh: 27, yBottom: 486, yTop: 42 };

function splitBalanced(words, measure, maxW) {
  const full = measure(words.map(w => w.w).join(' '));
  if (full <= maxW) return [words];
  let best = null;
  for (let k = 1; k < words.length; k++) {
    const a = measure(words.slice(0, k).map(w => w.w).join(' ')), b = measure(words.slice(k).map(w => w.w).join(' '));
    if (a > maxW || b > maxW) continue;
    const score = Math.max(a, b) + Math.abs(a - b) * 0.15;
    if (!best || score < best.score) best = { k, score };
  }
  if (!best) throw new Error('line does not fit in two rows: ' + words.map(w => w.w).join(' '));
  return [words.slice(0, best.k), words.slice(best.k)];
}

// ---------- closed captions ----------
const CC_BLOCKS = [];
function initCC() {
  const mk = (lines, until, top) => {
    const rows = [];
    for (const li of lines) for (const r of splitBalanced(LN[li].words.map(w => ({ w: w.w.toUpperCase(), s: w.s })), s => s.length, CC.maxCh)) rows.push({ words: r, s: r[0].s, line: li });
    return { rows, until, top };
  };
  CC_BLOCKS.push(mk([41, 42, 43], readUntil(43) + 0.05, (t) => t >= B.adStart));
  CC_BLOCKS.push(mk([48, 49], 1e9, () => true));
}
function ccText(g, txt, x, y) {
  for (let i = 0; i < txt.length; i++) {
    const gl = CC_GLYPHS[txt[i]]; if (!gl) continue;
    for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (gl[r * 5 + c] === '1') g.fillRect(x + i * CC.cell + c * CC.dotW, y + r * CC.dotH, CC.dotW + 0.01, CC.dotH + 0.01);
  }
}
// Rows on screen at time t, with their y. Exposed for the overlap checks.
function ccLayout(t) {
  const out = [];
  for (const bl of CC_BLOCKS) {
    if (t < bl.rows[0].s - 0.25 || t >= bl.until) continue;
    const yTop = bl.top(t) ? CC.yTop : CC.yBottom;
    const started = bl.rows.filter(r => r.s <= t + 0.021);
    const next = bl.rows.find(r => r.s > t + 0.021);
    const scroll = next && started.length ? CC.rowH * smooth(clamp((t - (next.s - 0.2)) / 0.2)) : 0;
    const vis = started.slice(-4);
    vis.forEach((r, k) => {
      const slot = 2 - (vis.length - 1 - k);
      const y = yTop + slot * CC.rowH - scroll;
      const txt = r.words.filter(w => w.s <= t + 0.021).map(w => w.w).join(' ');
      out.push({ y, txt, yTop, clip: [yTop, yTop + 3 * CC.rowH] });
    });
  }
  return out;
}
function drawCC(g, t) {
  for (const r of ccLayout(t)) {
    if (!r.txt) continue;
    g.save(); g.beginPath(); g.rect(0, r.clip[0], SIG_W, r.clip[1] - r.clip[0]); g.clip();
    const w = (r.txt.length + 2) * CC.cell;
    g.fillStyle = '#000'; g.fillRect(CC.x0 - CC.cell, r.y, w, CC.rowH);
    g.fillStyle = '#f4f4ee'; ccText(g, r.txt, CC.x0, r.y + CC.dotH);
    g.restore();
  }
}

// ---------- the sing-along ----------
const SA = { lines: [44, 45, 46, 47], font: '', fs: 0, cap: 34, desc: 0, R: 14,
  band: { x: 64, y: 500, w: 832, h: 192 }, b1: 566, b2: 664, tab: { y: 330, h: 140, b1: 376, b2: 446, k: 0.7 },
  rows: [], hops: [], twins: [], L: {} };
function saFont(s) { return `bold ${s}px "Cooper Lt BT", "Cooper Black", Georgia, serif`; }
function initSA(g) {
  // font size for a 34 px cap height (about 49 px at 1080 once the tube's overscan and the camera are applied)
  let fs = 40; g.font = saFont(fs);
  for (; fs < 90; fs++) { g.font = saFont(fs); if (g.measureText('H').actualBoundingBoxAscent >= SA.cap) break; }
  SA.fs = fs; SA.font = saFont(fs); g.font = SA.font;
  SA.cap = g.measureText('H').actualBoundingBoxAscent;
  SA.desc = Math.max(...['g', 'y', 'p', ','].map(c => g.measureText(c).actualBoundingBoxDescent));
  const maxW = 800, measure = s => { g.font = SA.font; return g.measureText(s).width; };
  for (const li of SA.lines) {
    const rows = splitBalanced(LN[li].words.map(w => ({ w: w.w, s: w.s })), measure, maxW);
    const L = { li, rows: [], s: LN[li].s, rd: readUntil(li) };
    rows.forEach((ws, ri) => {
      const txt = ws.map(w => w.w).join(' '), rw = measure(txt), x0 = 480 - rw / 2;
      let acc = '';
      const words = ws.map((w, k) => { const pre = acc + (k ? ' ' : ''); const x = x0 + measure(pre); acc = pre + w.w; return { ...w, x, w_: measure(w.w), ri }; });
      L.rows.push({ words, x0, w: rw, base: ri ? SA.b2 : SA.b1 });
    });
    SA.L[li] = L;
  }
  // when each line leaves the band for the tab
  SA.lines.forEach((li, j) => {
    const L = SA.L[li], nx = SA.L[SA.lines[j + 1]];
    const last = L.rows[L.rows.length - 1].words.slice(-1)[0];
    L.mv = nx ? Math.max(last.s + 0.06, nx.s - 0.22) : 1e9;
  });
  buildHops();
}
const yLand = (ri) => (ri ? SA.b2 : SA.b1) - SA.cap - 2 - SA.R;
function tabVisible(t0, t1) { return SA.lines.some(li => { const L = SA.L[li]; return L.mv < t1 && L.rd + 0.2 > t0; }); }
function fitH(y0, y1, yMin, h) {
  for (; h > 0; h -= 1) { let m = 1e9; for (let u = 0; u <= 1; u += 0.05) m = Math.min(m, lerp(y0, y1, u) - 4 * h * u * (1 - u)); if (m >= yMin) return h; }
  return 0;
}
function buildHops() {
  const H = SA.hops, R = SA.R;
  const yMinRow0 = (t0, t1) => tabVisible(t0, t1) ? SA.tab.y + SA.tab.h + 3 + R : 300;
  const yMinRow1 = SA.b1 + SA.desc + 2 + R;
  const yC = Math.round((yMinRow1 + yLand(1)) / 2);
  const add = (t0, t1, x0, y0, x1, y1, h) => H.push({ t0, t1, x0, y0, x1, y1, h });
  const land = (w) => [w.x + Math.min(w.w_ * 0.42, 70), yLand(w.ri)];
  const lines = SA.lines.map(li => SA.L[li]);
  const first = lines[0].rows[0].words[0];
  let [px, py] = land(first);
  add(B.bandIn + 0.1, first.s, -40, py - 30, px, py, 0);
  lines.forEach((L, j) => {
    const all = L.rows.flatMap(r => r.words);
    for (let k = 0; k + 1 < all.length; k++) {
      const a = all[k], b = all[k + 1], [ax, ay] = land(a), [bx, by] = land(b), dt = b.s - a.s;
      if (a.ri === b.ri) {
        const yMin = a.ri ? yMinRow1 : yMinRow0(a.s, b.s);
        add(a.s, b.s, ax, ay, bx, by, fitH(ay, by, yMin, Math.min(80, 12 + 140 * dt)));
      } else { // row 0 -> row 1: hop clear of the row's end, drop into the lane, skim back along it
        const r0 = L.rows[0], Ax = Math.max(r0.x0 + r0.w + R + 10, ax + 30);
        const t1 = a.s + dt * 0.35, t2 = a.s + dt * 0.5;
        add(a.s, t1, ax, ay, Ax, ay, fitH(ay, ay, yMinRow0(a.s, t1), Math.min(30, 10 + 80 * dt)));
        add(t1, t2, Ax, ay, Ax, yC, 0);
        add(t2, b.s, Ax, yC, bx, by, fitH(yC, by, yMinRow1, 8));
      }
    }
    const last = all[all.length - 1], [lx, ly] = land(last), r1 = L.rows[L.rows.length - 1];
    const Ax = Math.max(r1.x0 + r1.w + R + 10, lx + 30);
    const nx = lines[j + 1];
    if (nx) {
      const nf = nx.rows[0].words[0], [nx_, ny] = land(nf);
      add(last.s, L.mv, lx, ly, Ax, ly, fitH(ly, ly, yMinRow1, 14));
      add(L.mv, nf.s, Ax, ly, nx_, ny, fitH(ly, ny, yMinRow0(L.mv, nf.s), 70));
    } else {
      add(last.s, last.s + 0.14, lx, ly, Ax, ly, fitH(ly, ly, yMinRow1, 14));
      add(last.s + 0.14, last.s + 0.5, Ax, ly, 1010, ly - 10, fitH(ly, ly - 10, yMinRow1, 16));
    }
  });
  // "mama mama" and "daddy daddy": the ball doubles for the repeated word
  SA.twins = [[B.mama1, B.mama2, B.now], [B.daddy1, B.daddy2, B.too]];
  SA.onsets = SA.lines.flatMap(li => LN[li].words.map(w => w.s));
}
function ballAt(t) {
  const H = SA.hops;
  if (t < H[0].t0 || t > H[H.length - 1].t1) return null;
  let h = H.find(x => t >= x.t0 && t < x.t1) || H[H.length - 1];
  const u = clamp((t - h.t0) / (h.t1 - h.t0));
  const x = lerp(h.x0, h.x1, u), y = lerp(h.y0, h.y1, u) - 4 * h.h * u * (1 - u);
  // squash for two frames after landing on a word
  const sq = SA.onsets.some(s => t >= s && t - s < 0.07) ? 1 : 0;
  let tw = 0;
  for (const [a, b, c] of SA.twins) { if (t >= a && t < b) tw = smooth((t - a) / (b - a)); else if (t >= b && t < c) tw = 1 - smooth((t - b) / (c - b)); }
  return { x, y, sq, tw };
}
function ballsAt(t) {
  const b = ballAt(t); if (!b) return [];
  if (b.tw <= 0.001) return [{ x: b.x, y: b.y, sq: b.sq }];
  const d = 18 * b.tw;
  return [{ x: b.x - d, y: b.y, sq: b.sq }, { x: b.x + d, y: b.y, sq: b.sq }];
}
// What text boxes are on screen (sig coords) and the band's position, for drawing and for the overlap check.
function saLayout(t) {
  const out = { bandY: 0, boxes: [], rows: [], tabs: [] };
  const inU = smooth(clamp((t - B.bandIn) / 0.25)), outU = smooth(clamp((t - B.bandOut) / 0.2));
  out.bandY = (1 - inU) * 240 + outU * 240;
  if (t < B.bandIn || t > B.bandOut + 0.2) return out;
  for (const li of SA.lines) {
    const L = SA.L[li];
    if (t >= L.s - 0.021 && t < L.mv) {
      for (const r of L.rows) {
        const ws = r.words.filter(w => w.s <= t + 0.021);
        if (ws.length) out.rows.push({ L, r, ws, k: 1, dx: 0, base: r.base + out.bandY });
        for (const w of ws) out.boxes.push([w.x - 2, r.base - SA.cap - 1 + out.bandY, w.x + w.w_ + 2, r.base + SA.desc + 2 + out.bandY]);
      }
    } else if (t >= L.mv && t < L.rd + 0.2) {
      const a = 1 - smooth(clamp((t - L.rd) / 0.2));
      out.tabs.push({ L, a });
      const k = SA.tab.k;
      L.rows.forEach((r, ri) => {
        const base = ri ? SA.tab.b2 : SA.tab.b1, x0 = 480 - r.w * k / 2;
        out.rows.push({ L, r, ws: r.words, k, x0, base, a });
        out.boxes.push([x0 - 3, base - SA.cap * k - 5, x0 + r.w * k + 3, base + SA.desc * k + 3]);
      });
    }
  }
  return out;
}
function drawSA(g, t) {
  const lay = saLayout(t);
  if (t < B.bandIn || t > B.bandOut + 0.2) return;
  const bd = SA.band, by = bd.y + lay.bandY;
  g.save();
  // the band: cream card, ink outline, a three-colour 70s stripe along its foot
  g.lineJoin = 'round';
  g.fillStyle = '#fff3cf'; rrect(g, bd.x, by, bd.w, bd.h, 22); g.fill();
  g.save(); rrect(g, bd.x, by, bd.w, bd.h, 22); g.clip();
  [['#f08a24', 0], ['#e8b630', 5], ['#6b3f1e', 10]].forEach(([c, o]) => { g.fillStyle = c; g.fillRect(bd.x, by + bd.h - 15 + o, bd.w, 4); });
  g.restore();
  g.strokeStyle = '#1b1530'; g.lineWidth = 6; rrect(g, bd.x, by, bd.w, bd.h, 22); g.stroke();
  // tabs for the previous line
  for (const tb of lay.tabs) {
    const k = SA.tab.k, wmax = Math.max(...tb.L.rows.map(r => r.w)) * k + 44;
    g.globalAlpha = tb.a;
    g.fillStyle = '#fff3cf'; rrect(g, 480 - wmax / 2, SA.tab.y, wmax, SA.tab.h, 16); g.fill();
    g.strokeStyle = '#1b1530'; g.lineWidth = 4; g.stroke();
    g.globalAlpha = 1;
  }
  // words
  g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  for (const row of lay.rows) {
    if (row.k === 1) {
      const cur = row.ws[row.ws.length - 1];
      for (const w of row.ws) {
        // the landing ball presses the word down a little (it never grows upward into the ball's lane)
        const k = 1 - smooth(clamp((t - w.s) / 0.16)), popX = 1 + 0.05 * k, popY = 1 - 0.12 * k;
        const nextS = nextOnset(row.L, w);
        const isCur = t < nextS + 0.02 && w === cur;
        g.save(); g.translate(w.x + w.w_ / 2, row.base); g.scale(popX, popY);
        g.font = SA.font; g.fillStyle = isCur ? '#b0154f' : '#1b1530'; g.fillText(w.w, -w.w_ / 2, 0);
        g.restore();
      }
    } else {
      g.save(); g.globalAlpha = row.a; g.translate(row.x0, row.base); g.scale(row.k, row.k);
      g.font = SA.font; g.fillStyle = '#1b1530'; g.fillText(row.ws.map(w => w.w).join(' '), 0, 0);
      g.restore();
    }
  }
  // the bouncing ball(s)
  for (const b of ballsAt(t)) {
    const R = SA.R, sx = b.sq ? 1.28 : 1, sy = b.sq ? 0.74 : 1;
    g.save(); g.translate(b.x, b.y + lay.bandY + R * (1 - sy)); g.scale(sx, sy);
    g.fillStyle = '#ffffff'; g.strokeStyle = '#1b1530'; g.lineWidth = 3.5;
    g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = '#ff3d7f'; g.beginPath(); g.arc(0, 0, R * .45, 0, TAU); g.fill();
    g.restore();
  }
  g.restore();
}
function nextOnset(L, w) { const all = L.rows.flatMap(r => r.words); const i = all.indexOf(w); return i + 1 < all.length ? all[i + 1].s : L.s + 99; }
function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
// Self-check: the ball must never overlap a word or a tab while they are on screen.
function checkBall() {
  const bad = [];
  for (let f = Math.ceil(B.bandIn * 24); f <= Math.floor((B.bandOut + 0.2) * 24); f++) {
    const t = f / 24, lay = saLayout(t);
    for (const b of ballsAt(t)) {
      const R = SA.R, by = b.y + lay.bandY;
      for (const [x0, y0, x1, y1] of lay.boxes) if (b.x + R > x0 && b.x - R < x1 && by + R > y0 && by - R < y1) { bad.push(f + ':' + Math.round(b.x) + ',' + Math.round(by) + ' box ' + [x0, y0, x1, y1].map(Math.round)); break; }
      for (const tb of lay.tabs) if (by - R < SA.tab.y + SA.tab.h && by + R > SA.tab.y && Math.abs(b.x - 480) < Math.max(...tb.L.rows.map(r => r.w)) * SA.tab.k / 2 + 22) bad.push(f);
    }
  }
  if (bad.length) console.error('ball crosses text at frames ' + [...new Set(bad)].join(' | '));
  return bad;
}
