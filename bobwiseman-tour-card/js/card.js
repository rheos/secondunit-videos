// card.js · Bob Wiseman's next shows as a drawn end card, 9:16 (1080x1920 plate units, rendered at 720x1280).
//
// Bob's own phone reels are what his followers like; this card goes on the END of one, so the reel carries the
// attention and the card carries the dates. It is drawn with the Fifty-three Nights pen, pencil, paper and lettering
// (js/hand.js and the helpers below come from indieagent-diagram-plate): one admission stub per show, the date on
// the torn-off end, venue, city and billing on the rest, and the plate's strip from the sea to the mountains along
// the foot. The shows come from data/shows.js, which tools/next-shows.mjs builds from the tour DB, so a moved or
// cancelled show is one rerun.
(function () {
  'use strict';
  const { W, H, stroke, spread, lane, h32, rng } = window.HAND;
  const T = window.TOUR;
  const INK = '#2b2320';
  const C = {
    October: '#5f8aa6', November: '#bf7444', December: '#8a7fae', January: '#5e9a6a', February: '#6aa3c8', March: '#c99a2e',
    wood: '#a07850', post: '#8a6040', red: '#c0503a', sea: '#5f8aa6', hill: '#8aa76a', mtn: '#7088a6', pine: '#4f7a52',
    van: '#4f8f88', road: '#a89a86', blue: '#4f7fd0', tag: '#d9c48a',
  };
  const QS = new URLSearchParams(location.search);
  const STROKES = [], WORDS = [];

  // ---- small geometry helpers -------------------------------------------------------------------------------
  const lerp = (a, b, u) => a + (b - a) * u;
  const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
  const circlePts = (cx, cy, r, n = 28, a0 = 0) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  const inBox = ([x, y], [x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
  // Split a polyline wherever it enters one of the boxes (so background lines break around what stands in front).
  function breakAround(P, boxes, step = 2) {
    const R = window.HAND.resample(P, step), out = []; let cur = [];
    for (const p of R) { if (boxes.some((b) => inBox(p, b))) { if (cur.length > 1) out.push(cur); cur = []; } else cur.push(p); }
    if (cur.length > 1) out.push(cur);
    return out;
  }
  // Parallel hatching clipped to a polygon: lines at `angle` (radians), `gap` apart. Returns segments.
  function hatch(poly, angle, gap, { jitter = 0.25, seed = 1, inset = 0 } = {}) {
    const ca = Math.cos(-angle), sa = Math.sin(-angle), R = poly.map(([x, y]) => [x * ca - y * sa, x * sa + y * ca]);
    let y0 = Infinity, y1 = -Infinity; for (const [, y] of R) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const r = rng(seed), segs = [], cb = Math.cos(angle), sb = Math.sin(angle);
    for (let y = y0 + gap * (0.3 + 0.4 * r()); y < y1; y += gap * (1 + (r() - 0.5) * jitter)) {
      const xs = [];
      for (let i = 0; i < R.length - 1; i++) {
        const [ax, ay] = R[i], [bx, by] = R[i + 1];
        if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + ((y - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const a = xs[i] + inset, b = xs[i + 1] - inset; if (b - a < 2) continue;
        segs.push([[a * cb - y * sb, a * sb + y * cb], [b * cb - y * sb, b * sb + y * cb]]);
      }
    }
    return segs;
  }
  const G = {};
  const add = (group, st) => { if (!st.P[0] || st.P.some((q) => !q || !isFinite(q[0]) || !isFinite(q[1]))) throw new Error(`bad stroke in ${group}: ${JSON.stringify(st.P).slice(0, 200)}`); (G[group] ||= []).push(st); STROKES.push(st); return st; };
  const ink = (group, P, o = {}) => add(group, stroke(P, { kind: 'ink', w: 1.4, color: INK, ...o }));
  const pencil = (group, P, color, o = {}) => add(group, stroke(P, { kind: 'pencil', w: 2.2, color, alpha: 0.32, amp: 1.0, ...o }));
  const blue = (P, o = {}) => add('construct', stroke(P, { kind: 'blue', w: 1.1, color: C.blue, alpha: 0.38, amp: 0.5, ...o }));
  // Construction line with a draughtsman's overshoot past both ends.
  function blueLine(a, b, over = 9) { const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / d, uy = (b[1] - a[1]) / d; blue([[a[0] - ux * over, a[1] - uy * over], [b[0] + ux * over, b[1] + uy * over]]); }
  function blueRect(x, y, w, h) { blueLine([x, y], [x + w, y]); blueLine([x + w, y], [x + w, y + h]); blueLine([x + w, y + h], [x, y + h]); blueLine([x, y + h], [x, y]); }

  // ---- lettering ------------------------------------------------------------------------------------------
  // A line of hand lettering: Hershey strokes with a nudge of baseline, tilt and spacing per letter.
  // Records the word box and its container for the checks.
  function words(group, str, x, y, size, { face = 'serif', anchor = 'start', track = 0, w = null, container = null, role = '' } = {}) {
    const letters = BPD.letter(str, x, y, size, { face, anchor, track });
    const pen = w || (face === 'italic' ? 0.9 + size * 0.018 : 0.9 + size * 0.022);
    const out = []; let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
    letters.forEach((L, i) => {
      const k = h32(str.length * 131 + i, Math.round(x), Math.round(y));
      const dy = (k - 0.5) * size * 0.035, rot = (h32(i, 7, Math.round(y)) - 0.5) * 0.05, cx = L.x + L.w / 2;
      for (const S of L.strokes) {
        const P = S.map(([px, py]) => { const ox = px - cx, oy = py - y; return [cx + ox * Math.cos(rot) - oy * Math.sin(rot), y + dy + ox * Math.sin(rot) + oy * Math.cos(rot)]; });
        for (const [px, py] of P) { bx0 = Math.min(bx0, px); by0 = Math.min(by0, py); bx1 = Math.max(bx1, px); by1 = Math.max(by1, py); }
        out.push(add(group, stroke(P, { kind: 'ink', w: pen, color: INK, amp: 0.28, spacing: 1.2, text: true })));
      }
    });
    WORDS.push({ str, role, size, face, box: [bx0 - pen, by0 - pen, bx1 + pen, by1 + pen], container, color: INK });
    return out;
  }

  // ---- accents: the Hershey faces are ASCII, so an accented letter is set as its base letter plus a pen mark ----
  const ACUTE = /[éÉ]/;
  const words0 = words;
  function wordsA(group, str, x, y, size, o = {}) {
    const base = str.normalize('NFD').replace(/[̀-ͯ]/g, '');
    const out = words0(group, base, x, y, size, o);
    if (!ACUTE.test(str)) return out;
    const letters = BPD.letter(base, x, y, size, { face: o.face || 'serif', anchor: o.anchor || 'start', track: o.track || 0 });
    let li = 0;
    for (const ch of str) {
      if (ch === ' ') continue;
      const L = letters[li++];
      if (L && ACUTE.test(ch)) {
        const top = ch === 'É' ? y - size * 0.86 : y - size * 0.6, cx = L.x + L.w * 0.5 + (o.face === 'italic' ? size * 0.06 : 0);
        out.push(add(group, stroke([[cx - size * 0.05, top + size * 0.02], [cx + size * 0.09, top - size * 0.13]], { kind: 'ink', w: 0.9 + size * 0.02, color: INK, amp: 0.2, text: true })));
        const wb = WORDS[WORDS.length - 1].box; wb[1] = Math.min(wb[1], top - size * 0.15);
      }
    }
    return out;
  }

  // ---- 1. layout (1080x1920 units, rendered at 720x1280) ------------------------------------------------------
  // Every word sits between y 300 and 1580 (the feed's 4:5 band, above the Reels caption) and left of x 950 below
  // the middle (clear of the Reels buttons).
  const S0 = window.SHOWS, SH = S0.shows;
  const FRAME = { outer: 34, inner: 44 };
  // stubs share the space from y0 to y 1490 (the footer goes under them, above the caption line), up to 228 tall
  const STUB = { x: 110, w: 840, gap: 32, perf: 204, notch: 13 };
  const y0 = 484; STUB.h = Math.min(228, Math.floor((1490 - y0 - STUB.gap * (SH.length - 1)) / SH.length));
  const stubs = SH.map((s, i) => ({ s, x: STUB.x + (h32(i, 3) - 0.5) * 10, y: y0 + i * (STUB.h + STUB.gap), w: STUB.w, h: STUB.h }));
  if (stubs.length > 5) throw new Error('at most five stubs fit');
  const MCOL = { Jan: '#5e9a6a', Feb: '#6aa3c8', Mar: '#c99a2e', Apr: '#8aa76a', May: '#c0503a', Jun: '#4f8f88', Jul: '#c99a2e', Aug: '#bf7444', Sep: '#a07850', Oct: '#5f8aa6', Nov: '#bf7444', Dec: '#8a7fae' };
  const TITLE = { size: 76, y: 368 }, SUB = { size: 30, y: 432 };
  blueLine([200, TITLE.y], [880, TITLE.y]); blueLine([200, TITLE.y - TITLE.size * 0.7], [880, TITLE.y - TITLE.size * 0.7]);

  // ---- 2. the frame ---------------------------------------------------------------------------------------
  for (const [inset, w] of [[FRAME.outer, 2.3], [FRAME.inner, 1.0]]) {
    const P = rectPts(inset, inset, W - 2 * inset, H - 2 * inset);
    for (let i = 0; i < 4; i++) ink('frame', [P[i], P[i + 1]], { w, amp: 0.6 });
  }

  // ---- 3. the stubs: an admission ticket per show, torn-off end on the left with the date --------------------
  const wrap = (str, size, face, maxW) => { const out = []; let cur = '';
    for (const wd of str.split(' ')) { const t = cur ? cur + ' ' + wd : wd; if (cur && BPD.measure(t.normalize('NFD').replace(/[̀-ͯ]/g, ''), size, face) > maxW) { out.push(cur); cur = wd; } else cur = t; }
    if (cur) out.push(cur); return out; };
  stubs.forEach((t, i) => {
    const { x, y, w, h, s } = t, x1 = x + w, y1 = y + h, px = x + STUB.perf, r = STUB.notch, col = MCOL[s.mon] || C.tag;
    blueRect(x, y, w, h); blueLine([px, y], [px, y1]);
    // outline with a half-round notch top and bottom at the perforation
    const arc = (cy, dir) => Array.from({ length: 13 }, (_, k) => { const a = Math.PI * (1 - k / 12); return [px + Math.cos(a) * r, cy + dir * Math.sin(a) * r]; });
    ink('stubs', [[x, y], [px - r, y]], { w: 1.4, amp: 0.4 }); ink('stubs', arc(y, 1), { w: 1.2, spacing: 1.2 }); ink('stubs', [[px + r, y], [x1, y], [x1, y1], [px + r, y1]], { w: 1.4, amp: 0.4 });
    ink('stubs', arc(y1, -1).reverse(), { w: 1.2, spacing: 1.2 }); ink('stubs', [[px - r, y1], [x, y1], [x, y]], { w: 1.4, amp: 0.4 });
    ink('stubs', [[x1 + 2.6, y + 3], [x1 + 2.6, y1 + 2.6], [px + r + 2, y1 + 2.6]], { w: 0.6, amp: 0.25 });
    for (let yy = y + r + 6; yy < y1 - r - 6; yy += 9) ink('stubs', [[px, yy], [px, yy + 4]], { w: 0.8, amp: 0.1 });
    // the date end in the month's colour, the rest in a pale card tint
    const notches = [[px - r - 2, y - 2, px + r + 2, y + r + 3], [px - r - 2, y1 - r - 3, px + r + 2, y1 + 2]];
    const left = [[x + 2, y + 2], [px - 3, y + 2], [px - 3, y1 - 2], [x + 2, y1 - 2], [x + 2, y + 2]];
    for (const sg of hatch(left, -1.05, 3.2, { seed: 200 + i, inset: 2 })) for (const P of breakAround(sg, notches, 1.5)) pencil('tint', P, col, { w: 2.0, alpha: 0.3, amp: 0.4 });
    const right = [[px + 3, y + 2], [x1 - 2, y + 2], [x1 - 2, y1 - 2], [px + 3, y1 - 2], [px + 3, y + 2]];
    for (const sg of hatch(right, 0.02, 3.6, { seed: 300 + i, inset: 2 })) for (const P of breakAround(sg, notches, 1.5)) pencil('tint', P, C.tag, { w: 2.0, alpha: 0.18, amp: 0.4 });
    // the words of this stub, kept for the schedule
    const dc = (x + px) / 2, box = [x + 6, y + 4, px - 10, y1 - 6], tx = px + 30, rbox = [px + 18, y + 6, x1 - 14, y1 - 6], maxW = x1 - 14 - tx - 8;
    const main = s.venue || s.city, sub = s.venue ? `${s.city}${s.region ? ', ' + s.region : ''}` : (s.region ? { ON: 'Ontario', QC: 'Quebec', BC: 'British Columbia' }[s.region] || s.region : '');
    // billing breaks before an "&" first ("with Michelle McAdorey" / "& special guest ..."), so no name is split
    const plain = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const amp = s.billing && s.billing.includes(' & ') ? [s.billing.slice(0, s.billing.indexOf(' & ')), s.billing.slice(s.billing.indexOf(' & ') + 1)] : null;
    const bill = !s.billing ? [] : BPD.measure(plain(s.billing), 21, 'italic') <= maxW ? [s.billing]
      : amp && amp.every((l) => BPD.measure(plain(l), 21, 'italic') <= maxW) ? amp : wrap(s.billing, 21, 'italic', maxW).slice(0, 2);
    const lines = [[main, 44, 'serif'], ...(sub ? [[sub, 28, 'italic']] : []), ...bill.map((b) => [b, 21, 'italic'])];
    const leads = { 44: 0, 28: 44, 21: 32 };
    const blockH = lines.slice(1).reduce((a, [, sz]) => a + leads[sz], 0);
    let yy = y + Math.round((h - blockH) / 2 + 14); const W_ = [];
    lines.forEach(([str, size, face], j) => { if (j) yy += leads[size]; W_.push(...wordsA('w_stub', str, tx, yy, size, { face, container: rbox, role: 'stub' })); });
    if (yy > y1 - 20) throw new Error(`stub ${s.date} text runs to ${yy}`);
    const dy = (h - 196) / 2;
    t.words = [
      ...wordsA('w_date', s.dow, dc, y + dy + 46, 26, { face: 'italic', anchor: 'middle', container: box, role: 'date' }),
      ...wordsA('w_date', String(s.day), dc, y + dy + 138, 92, { anchor: 'middle', container: box, role: 'date' }),
      ...wordsA('w_date', s.mon.toUpperCase(), dc, y + dy + 180, 30, { anchor: 'middle', track: 0.12, container: box, role: 'date' }),
      ...W_,
    ];
  });

  // ---- 4. the country along the foot, the plate's strip: sea (east) to mountains (west) --------------------------
  const ink0 = ink, pencil0 = pencil;
  {
    const S = 0.53, OX = (W - 1776 * S) / 2 - 74 * S, OY = 1858 - 314 * S;
    const tf = (P) => P.map(([x, y]) => [x * S + OX, y * S + OY]);
    const ink = (g, P, o = {}) => ink0(g, tf(P), { ...o, w: (o.w ?? 1.4) * 0.8 });
    const pencil = (g, P, color, o = {}) => pencil0(g, tf(P), color, { ...o, w: (o.w ?? 2.2) * 0.7, alpha: (o.alpha ?? 0.32) * 0.85 });
    // ---- 5. the country, far to near: the sea, the farms, the mountains ------------------------------------------
    const HZ = 276, STRIP_BOT = 314;
    // lighthouse and the things that stand in front, as boxes the far lines break around
    const LH = { cx: 226 };
    const VAN = { x: 1010, y: 286 };
    const POLES = [560, 680, 800, 920, 1110, 1200].map((x) => ({ x, top: 262, base: 294 }));
    const BARN = { x: 760, y: 279, w: 30, h: 14 };
    const blockers = [
      [LH.cx - 16, 176, LH.cx + 16, 300], [140, 288, 304, STRIP_BOT], [VAN.x - 4, VAN.y - 3, VAN.x + 48, VAN.y + 19],
      [BARN.x - 4, BARN.y - 12, BARN.x + BARN.w + 4, BARN.y + BARN.h + 3],
      ...POLES.map((p) => [p.x - 10, p.top - 3, p.x + 10, p.base + 2]),
    ];
    // far: the sea's horizon and haze, a pale far range
    for (const P of breakAround([[74, HZ], [480, HZ]], blockers)) ink('far', P, { w: 1.1 });
    { const r = rng(11); for (let i = 0; i < 9; i++) { const y = HZ - 4 - i * 1.7 - r() * 1.5, x0 = 76 + r() * 300, x1 = x0 + 120 + r() * 380;
      for (const P of breakAround([[x0, y], [Math.min(x1, 1170), y]], blockers)) pencil('far', P, C.sea, { w: 1.6, alpha: 0.2 }); } }
    const NEAR = [[1236, HZ], [1262, 268], [1290, 256], [1312, 262], [1336, 252], [1390, 226], [1412, 236], [1430, 232], [1452, 214], [1480, 200], [1500, 214], [1525, 230], [1548, 222], [1575, 212], [1600, 198], [1640, 180], [1668, 196], [1700, 222], [1722, 214], [1745, 204], [1772, 226], [1800, 244], [1826, 258], [1850, HZ]];
    const ridgeY = (x) => { for (let j = 1; j < NEAR.length; j++) if (NEAR[j][0] >= x) return lerp(NEAR[j - 1][1], NEAR[j][1], (x - NEAR[j - 1][0]) / (NEAR[j][0] - NEAR[j - 1][0])); return HZ; };
    { const FAR = []; for (let x = 1180; x <= 1846; x += 6) FAR.push([x, 246 - 34 * Math.sin((x - 1180) / 95) * Math.sin((x - 1180) / 37 + 0.7) - 18 * Math.sin(((x - 1180) / 666) * Math.PI)]);
      let cur = []; for (const p of FAR) { if (p[1] < ridgeY(p[0]) - 4 && p[1] < HZ - 3) cur.push(p); else { if (cur.length > 1) pencil('far', cur, C.mtn, { w: 1.6, alpha: 0.45 }); cur = []; } }
      if (cur.length > 1) pencil('far', cur, C.mtn, { w: 1.6, alpha: 0.45 }); }
    // the near range, its snow and its shadow faces
    const ridge = []; { const r = rng(5); for (let j = 0; j < NEAR.length - 1; j++) { ridge.push(NEAR[j]); const [ax, ay] = NEAR[j], [bx, by] = NEAR[j + 1]; ridge.push([(ax + bx) / 2 + (r() - 0.5) * 3, (ay + by) / 2 + (r() - 0.5) * 4]); } ridge.push(NEAR[NEAR.length - 1]); }
    ink('far', ridge, { w: 1.5, amp: 0.5, spacing: 2 });
    const peaks = [5, 9, 15, 19]; // indices into NEAR whose peaks hold snow
    const SNOW = [];
    // where a slope crosses height y, walking the ridge from peak j in direction d
    const slopeX = (j, y, d) => { for (let i = j; i + d >= 0 && i + d < NEAR.length; i += d) { const [ax, ay] = NEAR[i], [bx, by] = NEAR[i + d]; if (by >= y) return lerp(ax, bx, (y - ay) / (by - ay)); } return NEAR[j][0]; };
    const valley = (j, d) => { let i = j + d; while (i + d >= 0 && i + d < NEAR.length && NEAR[i + d][1] > NEAR[i][1]) i += d; return i; };
    for (let j = 1; j < NEAR.length - 1; j++) {
      const [px, py] = NEAR[j];
      if (!(py < NEAR[j - 1][1] && py < NEAR[j + 1][1])) continue;
      const vl = valley(j, -1), vr = valley(j, 1), snowy = peaks.includes(j);
      const sy = snowy ? py + (Math.min(NEAR[vl][1], NEAR[vr][1]) - py) * 0.42 : py, xl = slopeX(j, sy, -1), xr = slopeX(j, sy, 1);
      if (snowy) {
        SNOW.push([xl, sy, xr]);
        const P = [], teeth = 4;
        for (let i = 0; i <= teeth * 2; i++) P.push([lerp(xl + 1, xr - 1, i / (teeth * 2)), sy + (i % 2 ? 4.5 : 0)]);
        ink('far', P, { w: 0.9, amp: 0.3, spacing: 2 });
      }
    }
    // Contour hatching: lines that follow the ridge, offset downward. Shadow slopes (falling to the right, light from
    // the upper left) get ink close in under the ridge and pencil further down; lit slopes a few far-apart pencil lines.
    // Snow is left bare.
    {
      const inSnow = (x, y) => SNOW.some(([xl, sy, xr]) => x > xl - 1 && x < xr + 1 && y < sy + 6);
      const rY = (x) => { for (let j = 1; j < ridge.length; j++) if (ridge[j][0] >= x) return lerp(ridge[j - 1][1], ridge[j][1], (x - ridge[j - 1][0]) / (ridge[j][0] - ridge[j - 1][0])); return HZ; };
      const slopeAt = (x) => (rY(x + 5) - rY(x - 5)) / 10;
      for (let d = 3.2, i = 0; d < 60; d += 2.6 + i * 0.22, i++) {
        for (const shadow of [true, false]) {
          if (!shadow && i % 3) continue;
          let run = [];
          const flush = () => { if (run.length > 2) { if (shadow && d < 26) ink('far', run, { w: 0.55, amp: 0.25, alpha: Math.max(0.35, 1 - d / 30) }); pencil('far', run, C.mtn, { w: 1.8, alpha: shadow ? 0.28 : 0.13 }); } run = []; };
          for (let x = 1238; x <= 1848; x += 3) {
            const y = rY(x) + d, ok = y < HZ - 2 && (slopeAt(x) > 0.08) === shadow && !inSnow(x, y) && !blockers.some((bx) => inBox([x, y], bx));
            if (ok) run.push([x, y]); else flush();
          }
          flush();
        }
      }
    }
    // farmland hills between the coast and the mountains
    const HILL = []; for (let x = 486; x <= 1230; x += 5) { const e = Math.sin(((x - 486) / 744) * Math.PI); HILL.push([x, HZ - e * (6 + 5 * Math.sin((x - 486) / 61) + 3 * Math.sin((x - 486) / 23 + 1))]); }
    for (const P of breakAround(HILL, blockers)) ink('far', P, { w: 1.1, amp: 0.4 });
    for (const s of hatch([...HILL, [1230, HZ + 14], [486, HZ + 14], HILL[0]], 0, 3.2, { seed: 3 })) for (const P of breakAround(s, blockers)) pencil('mid', P, C.hill, { w: 2.0, alpha: 0.22 });
    // clumps of trees on the hills
    for (const [x, rad] of [[600, 7], [612, 5], [868, 6], [1062, 8], [1074, 5], [1150, 6]]) {
      const y = HILL[Math.round((x - 486) / 5)][1] - rad + 1, r = rng(x);
      const P = Array.from({ length: 23 }, (_, i) => { const a = Math.PI * (1 - i / 22), rr = rad * (0.85 + 0.25 * r()); return [x + Math.cos(a) * rr * 1.15, y - Math.sin(a) * rr]; });
      if (blockers.some((b) => P.some((p) => inBox(p, b)))) continue;
      ink('mid', P, { w: 1.0, amp: 0.4, spacing: 2 });
      for (const s of hatch([...P, P[0]], 0.9, 2.2, { seed: x })) pencil('mid', s, C.pine, { w: 1.8, alpha: 0.3 });
      for (const s of hatch([...P.slice(11), P[0]], -0.7, 2.4, { seed: x + 1 })) ink('mid', s, { w: 0.55, amp: 0.2 });
    }
    // the sea: level strokes that widen toward us, broken around the rocks
    { const r = rng(21); for (let i = 0; i < 16; i++) { const y = HZ + 3 + i * 1.3 + i * i * 0.1; let x = 76 + r() * 30;
      while (x < 470) { const len = 6 + r() * (18 + i * 3); for (const P of breakAround([[x, y], [Math.min(x + len, 476), y]], blockers)) (r() < 0.55 ? ink('mid', P, { w: 0.6, amp: 0.2 }) : pencil('mid', P, C.sea, { w: 1.8, alpha: 0.35 })); x += len + 8 + r() * 20; } } }
    // the lighthouse on its rocks
    {
      const cx = LH.cx, rock = [[150, STRIP_BOT], [158, 302], [172, 296], [190, 298], [206, 292], [224, 294], [246, 291], [266, 296], [284, 300], [298, STRIP_BOT]];
      ink('mid', rock, { w: 1.3, amp: 0.4, spacing: 2 });
      for (const s of hatch([...rock, rock[0]], 2.3, 3, { seed: 9, inset: 1 })) if (s[0][0] > 236 || s[1][0] > 236) ink('mid', s, { w: 0.6, amp: 0.2 });
      for (const s of hatch([...rock, rock[0]], 0.4, 3, { seed: 10 })) pencil('mid', s, '#8c7f70', { w: 1.8, alpha: 0.25 });
      const tw = (y) => lerp(13, 8, (292 - y) / (292 - 214));
      ink('mid', [[cx - 13, 292], [cx - 8, 214]], { w: 1.4 }); ink('mid', [[cx + 13, 292], [cx + 8, 214]], { w: 1.4 });
      ink('mid', [[cx - 12, 214], [cx + 12, 214]], { w: 1.2 }); ink('mid', [[cx - 11, 207], [cx + 11, 207]], { w: 0.8 });
      for (const x of [-10, 0, 10]) ink('mid', [[cx + x, 207], [cx + x, 213]], { w: 0.7 });
      ink('mid', rectPts(cx - 6, 195, 12, 12), { w: 1.0 }); ink('mid', [[cx, 195], [cx, 207]], { w: 0.6 });
      ink('mid', [[cx - 9, 195], [cx, 185], [cx + 9, 195]], { w: 1.2 }); ink('mid', [[cx, 185], [cx, 179]], { w: 0.9 });
      for (const [y0, y1] of [[226, 238], [252, 264]]) {
        ink('mid', [[cx - tw(y0), y0], [cx + tw(y0), y0]], { w: 0.7 }); ink('mid', [[cx - tw(y1), y1], [cx + tw(y1), y1]], { w: 0.7 });
        for (let y = y0 + 1; y < y1; y += 1.6) pencil('mid', [[cx - tw(y) + 1, y], [cx + tw(y) - 1, y]], C.red, { w: 1.8, alpha: 0.4, amp: 0.3 });
      }
      for (const f of [0.55, 0.72, 0.86]) ink('mid', [[cx + 8 * f, 216], [cx + 13 * f, 290]], { w: 0.55, amp: 0.2 });
      ink('mid', [[cx - 3, 292], [cx - 3, 284], [cx, 281], [cx + 3, 284], [cx + 3, 292]], { w: 0.8 });
      for (const [dx, dy] of [[-1, -0.25], [-1, 0.2], [1, -0.25], [1, 0.2]]) for (const [a, b] of [[14, 22], [27, 36]]) ink('mid', [[cx + dx * a, 201 + dy * a], [cx + dx * b, 201 + dy * b]], { w: 0.8, amp: 0.2 });
    }
    // a barn
    { const { x, y, w, h } = BARN; ink('mid', [[x, y + h], [x, y], [x + w / 2, y - 8], [x + w, y], [x + w, y + h]], { w: 1.0 }); ink('mid', [[x + 11, y + h], [x + 11, y + 6], [x + 19, y + 6], [x + 19, y + h]], { w: 0.7 });
      for (let yy = y + 1; yy < y + h; yy += 1.7) pencil('mid', [[x + 1, yy], [x + w - 1, yy]], C.red, { w: 1.6, alpha: 0.35, amp: 0.2 }); }
    // near: the road west, telegraph poles, pines, the van
    const ROAD = { y0: 299, y1: 306 };
    for (const y of [ROAD.y0, ROAD.y1]) for (const P of breakAround([[320, y], [1846, y]], blockers)) ink('near', P, { w: y === ROAD.y1 ? 1.3 : 1.0 });
    for (let x = 330; x < 1840; x += 24) for (const P of breakAround([[x, (ROAD.y0 + ROAD.y1) / 2], [x + 9, (ROAD.y0 + ROAD.y1) / 2]], blockers)) ink('near', P, { w: 0.7, amp: 0.2 });
    for (let y = ROAD.y0 + 1.2; y < ROAD.y1; y += 1.4) for (const P of breakAround([[322, y], [1844, y]], blockers)) pencil('near', P, C.road, { w: 1.6, alpha: 0.18 });
    POLES.forEach((p, i) => {
      ink('near', [[p.x, p.base], [p.x, p.top]], { w: 1.2 }); ink('near', [[p.x - 7, p.top + 4], [p.x + 7, p.top + 4]], { w: 0.9 });
      const q = POLES[i + 1]; if (!q) return;
      for (const dx of [-6, 6]) { const P = []; for (let u = 0; u <= 1.001; u += 0.05) P.push([lerp(p.x + dx + 2, q.x + dx - 2, u), p.top + 3 + 5 * Math.sin(Math.PI * u)]); ink('near', P, { w: 0.5, amp: 0.15 }); }
    });
    for (const x of [1262, 1290, 1318, 1384, 1412, 1530, 1556, 1660, 1688, 1716, 1790, 1818]) {
      const base = 296, top = Math.round(base - 14 - h32(x) * 6), P = [[x, top]];
      for (let i = 1; i <= 6; i++) P.push([x - lerp(1, 6, i / 6) * (i % 2 ? 0.55 : 1), lerp(top, base - 3, i / 6)]);
      const Q = P.slice(1).map(([px, py]) => [2 * x - px, py]).reverse();
      ink('near', [...P, ...Q, [x, top]], { w: 0.8, amp: 0.25, spacing: 1.5 });
      ink('near', [[x, base - 3], [x, base]], { w: 0.9 });
      for (let y = top + 3; y < base - 3; y += 2) pencil('near', [[x - lerp(1, 5, (y - top) / 14) * 0.8, y], [x + lerp(1, 5, (y - top) / 14) * 0.8, y]], C.pine, { w: 1.6, alpha: 0.35, amp: 0.2 });
    }
    { const { x, y } = VAN;
      ink('near', [[x, y + 12], [x, y + 1], [x + 2, y - 1], [x + 30, y - 1], [x + 38, y + 5], [x + 44, y + 6], [x + 44, y + 12], [x + 41, y + 12]], { w: 1.2, spacing: 1.5 });
      ink('near', [[x + 33, y + 12], [x + 13, y + 12]], { w: 1.2 }); ink('near', [[x + 5, y + 12], [x, y + 12]], { w: 1.2 });
      ink('near', [[x + 30, y + 1], [x + 36, y + 5.5], [x + 30, y + 5.5], [x + 30, y + 1]], { w: 0.8, spacing: 1.2 });
      ink('near', circlePts(x + 9, y + 13, 3.6, 16), { w: 1.0, spacing: 1 }); ink('near', circlePts(x + 37, y + 13, 3.6, 16), { w: 1.0, spacing: 1 });
      for (let yy = y + 1; yy < y + 11; yy += 1.6) pencil('near', [[x + 1, yy], [x + Math.min(43, 29 + (yy - y) * 1.4), yy]], C.van, { w: 1.6, alpha: 0.4, amp: 0.2 });
      for (const [dx, dy] of [[-16, 4], [-22, 8], [-14, 10]]) ink('near', [[x + dx, y + dy], [x + dx + 8, y + dy]], { w: 0.6, amp: 0.15 });
    }
  }

  // ---- 5. title and footer ----------------------------------------------------------------------------------
  const first = SH[0], last = SH[SH.length - 1];
  const span = first.mon === last.mon ? `${first.mon} ${first.day} to ${last.day}` : `${first.mon} ${first.day} to ${last.mon} ${last.day}`;
  const W_TITLE = wordsA('w_title', 'Bob Wiseman', W / 2, TITLE.y, TITLE.size, { anchor: 'middle', track: 0.03, container: [90, 292, 990, 400], role: 'title' });
  const W_SUB = wordsA('w_sub', `next shows, ${span}`, W / 2, SUB.y, SUB.size, { face: 'italic', anchor: 'middle', container: [90, 402, 990, 452], role: 'subtitle' });
  const yF = stubs[stubs.length - 1].y + STUB.h + 70;
  const W_FOOT = wordsA('w_foot', 'tickets at bobwiseman.ca', W / 2, yF, 26, { face: 'italic', anchor: 'middle', container: [260, yF - 30, 820, yF + 14], role: 'footer' });
  if (yF > 1570) throw new Error('footer below the caption line');
  blueLine([330, yF], [750, yF]);

  // ---- 6. the schedule (seconds): drawn in by 2.8 s, then held so every word can be read --------------------
  const END = Number(QS.get('end')) || 6;
  const SCHEDULE = [['construct', 0.0, 0.6, 7], ['frame', 0.1, 0.7, 2], ['far', 0.4, 1.2, 7], ['mid', 0.5, 1.3, 7], ['near', 0.6, 1.4, 6],
    ['stubs', 0.3, 1.3, 10], ['tint', 0.7, 1.7, 12]];
  for (const [g, t0, t1, hands] of SCHEDULE) { const end = spread(G[g], t0, t1, hands); if (end > t1 + 0.05) throw new Error(`${g} ends at ${end.toFixed(2)}, past ${t1}`); }
  const block = (strokes, t0, t1, lift = 0.002, min = 0.004) => {
    const dur = (v) => strokes.reduce((s, st) => s + Math.max(min, st.len / v) + lift, 0);
    let lo = 10, hi = 1e6; for (let i = 0; i < 60; i++) { const v = Math.sqrt(lo * hi); if (dur(v) > t1 - t0) lo = v; else hi = v; }
    const end = lane(strokes, t0, hi, lift, min);
    if (end > t1 + 0.05) throw new Error(`lettering block ends at ${end.toFixed(2)}, past ${t1}`);
  };
  block(W_TITLE, 0.9, 1.7); block(W_SUB, 1.4, 2.2);
  // a stub carries up to ~300 letter strokes, so its pen runs with a shorter lift and floor than the title's
  stubs.forEach((t, i) => block(t.words, 1.2 + i * 0.15, 2.5 + i * 0.08, 0.0008, 0.0015));
  block(W_FOOT, 2.0, 2.8);

  window.PLATE = { strokes: STROKES, words: WORDS, groups: G, stubs, END };
})();
