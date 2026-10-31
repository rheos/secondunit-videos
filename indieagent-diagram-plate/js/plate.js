// plate.js · "Fifty-three Nights": Bob Wiseman's tour as a pen-and-pencil plate.
//
// pele lays out the sankey (months on the left, provinces on the right, a band per month and province, its width
// the nights played there). The plate then draws that layout as objects from a touring musician's world:
//   month node     a spindle of ticket stubs, one stub per night, with a hanging tag for its name
//   province node  a fence post with a tally notch for every night, and a signboard on a rope
//   band           one pen line for every night, over coloured-pencil strokes laid along the band
// The positions and sizes of nodes and bands are pele's, unchanged; only tags, signs and ropes are placed by us.
// Draw order is far to near: construction pencil, frame, the strip of country from the sea to the mountains,
// bands, nodes, objects, and the words last of all.
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

  // ---- 1. the chart, laid out by pele ---------------------------------------------------------------------
  const FRAME = { outer: 34, inner: 44 };
  const TAG = { name: 30, note: 22, h: 78, padL: 24, eyelet: 34 };
  const SIGN = { name: 26, note: 20, h: 70, padL: 20, point: 24 };
  const nightsWord = (n) => `${n} night${n === 1 ? '' : 's'}`;
  const tagW = Math.ceil(Math.max(...T.months.map((m) => Math.max(BPD.measure(m.name, TAG.name), BPD.measure(nightsWord(m.nights), TAG.note, 'italic')))) + TAG.padL + TAG.eyelet + 8);
  const provinceNights = {};
  for (const [, p, n] of T.links) provinceNights[p] = (provinceNights[p] || 0) + n;
  const signW = Math.ceil(Math.max(...Object.entries(provinceNights).map(([p, n]) => Math.max(BPD.measure(p, SIGN.name), BPD.measure(nightsWord(n), SIGN.note, 'italic')))) + SIGN.padL + SIGN.point + 14);
  const TAGX = 86, ROPE = 64;
  const chartBox = { x: TAGX + tagW + ROPE, y: 352, w: 0, h: 600 };
  chartBox.w = W - 86 - signW - ROPE - chartBox.x;
  const D = BPD.diagram(T.mmd, chartBox, {
    fontSize: 24,
    config: { sankey: { width: chartBox.w - 16, height: chartBox.h - 16, nodeWidth: 34, nodePadding: 32, showValues: true } },
  });
  const nodes = D.sel('.pele-sankey-node').map((m) => ({ id: m.id, ...m.rect }));
  const midX = chartBox.x + chartBox.w / 2;
  const left = nodes.filter((n) => n.x < midX).sort((a, b) => a.y - b.y), right = nodes.filter((n) => n.x >= midX).sort((a, b) => a.y - b.y);
  if (left.map((n) => n.id).join() !== T.months.map((m) => m.name).join()) throw new Error('pele did not put the months in calendar order: ' + left.map((n) => n.id));
  const nightsOf = (id) => (T.months.find((m) => m.name === id) || {}).nights || provinceNights[id];
  for (const n of [...left, ...right]) n.nights = nightsOf(n.id);
  // the numbers must stay true: every node's height is its nights at one scale
  const k0 = left[0].h / left[0].nights;
  for (const n of [...left, ...right]) if (Math.abs(n.h / n.nights - k0) > 0.02 * k0) throw new Error(`node ${n.id} is not to scale`);
  const links = D.sel('.pele-sankey-link').map((m) => {
    const [from, to] = m.id.split('->'), value = Number(m.title.split(':').pop());
    return { from, to, value, ...edges(m.P) };
  });
  // A link polygon runs along its top edge left to right, down the right end, then back along the bottom edge.
  function edges(P) {
    let x0 = Infinity, x1 = -Infinity; for (const [x] of P) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
    let i = 0; const top = [], bot = [];
    while (i < P.length && P[i][0] < x1 - 0.5) top.push(P[i++]);
    top.push([x1, P[i][1]]);
    while (i < P.length && P[i][0] > x1 - 0.5) i++;
    bot.push([x1, P[i - 1][1]]);
    while (i < P.length && P[i][0] > x0 + 0.5) bot.push(P[i++]);
    bot.push([x0, P[Math.min(i, P.length - 1)][1]]);
    bot.reverse();
    const at = (E, x) => { for (let j = 1; j < E.length; j++) if (E[j][0] >= x) { const u = (x - E[j - 1][0]) / Math.max(1e-6, E[j][0] - E[j - 1][0]); return lerp(E[j - 1][1], E[j][1], u); } return E[E.length - 1][1]; };
    return { x0, x1, top: (x) => at(top, x), bot: (x) => at(bot, x) };
  }
  const bandPath = (L, f, x0 = L.x0, x1 = L.x1, step = 6) => { const P = []; for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / Math.ceil((x1 - x0) / step)) P.push([x, lerp(L.top(x), L.bot(x), f)]); return P; };

  // ---- 2. where tags and signs hang (they move, nodes never do) --------------------------------------------
  function hang(items, lo, hi, gap) {
    items.forEach((it) => (it.y = it.want - it.h / 2));
    for (let i = 1; i < items.length; i++) items[i].y = Math.max(items[i].y, items[i - 1].y + items[i - 1].h + gap);
    const over = items[items.length - 1].y + items[items.length - 1].h - hi;
    if (over > 0) { items[items.length - 1].y -= over; for (let i = items.length - 2; i >= 0; i--) items[i].y = Math.min(items[i].y, items[i + 1].y - items[i].h - gap); }
    if (items[0].y < lo) { items[0].y = lo; for (let i = 1; i < items.length; i++) items[i].y = Math.max(items[i].y, items[i - 1].y + items[i - 1].h + gap); }
    items.forEach((it) => (it.cy = it.y + it.h / 2));
    return items;
  }
  const lo = chartBox.y, hi = chartBox.y + chartBox.h;
  const tags = hang(left.map((n) => ({ node: n, want: n.y + n.h / 2, h: TAG.h, x: TAGX, w: tagW })), lo, hi, 14);
  const signs = hang(right.map((n) => ({ node: n, want: n.y + n.h / 2, h: SIGN.h, x: W - 86 - signW, w: signW })), lo, hi, 14);

  // ---- 3. construction pencil: pele's layout, ruled in blue ---------------------------------------------------
  for (const n of nodes) blueRect(n.x, n.y, n.w, n.h);
  for (const L of links) { blue(bandPath(L, 0, L.x0, L.x1, 12)); blue(bandPath(L, 1, L.x0, L.x1, 12)); }
  for (const it of [...tags, ...signs]) blueRect(it.x, it.y, it.w, it.h);
  blueLine([70, 276], [1850, 276], 14);
  const TITLE = { size: 54, y: 112 }, SUB = { size: 26, y: 164 };
  blueLine([700, TITLE.y], [1220, TITLE.y]); blueLine([700, TITLE.y - TITLE.size * 0.7], [1220, TITLE.y - TITLE.size * 0.7]);

  // ---- 4. the frame ---------------------------------------------------------------------------------------
  for (const [inset, w] of [[FRAME.outer, 2.3], [FRAME.inner, 1.0]]) {
    const P = rectPts(inset, inset, W - 2 * inset, H - 2 * inset);
    for (let i = 0; i < 4; i++) ink('frame', [P[i], P[i + 1]], { w, amp: 0.6 });
  }

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

  // ---- 6. the bands: pencil along the form, then one pen line per night --------------------------------------
  const bandOrder = links.slice().sort((a, b) => a.top(a.x0) - b.top(b.x0));
  bandOrder.forEach((L, li) => {
    const col = C[L.from], r = rng(100 + li), n = L.value * 3;
    for (let i = 0; i < n; i++) { const f = (i + 0.5 + (r() - 0.5) * 0.6) / n; pencil('bandTint', bandPath(L, f, L.x0 + 1, L.x1 - 1, 10), col, { w: 2.6, alpha: 0.24 + 0.14 * f, amp: 0.9 }); }
  });
  bandOrder.forEach((L) => {
    ink('bandInk', bandPath(L, 0), { w: 1.4 });
    const shared = links.some((M) => M !== L && Math.abs(M.top(M.x0) - L.bot(L.x0)) < 0.5 && Math.abs(M.top(M.x1) - L.bot(L.x1)) < 0.5);
    if (!shared) ink('bandInk', bandPath(L, 1), { w: 1.4 });
    for (let j = 0; j < L.value; j++) ink('bandInk', bandPath(L, (j + 0.5) / L.value), { w: 0.85, alpha: 0.9, amp: 0.55 });
  });

  // ---- 7. the nodes: spindles of ticket stubs, tally posts --------------------------------------------------
  for (const n of left) {
    const col = C[n.id], hi1 = n.h / n.nights, cx = n.x + n.w / 2;
    ink('nodes', [[cx, n.y - 17], [cx, n.y]], { w: 1.3 }); ink('nodes', [[cx - 1.5, n.y - 14], [cx, n.y - 19], [cx + 1.5, n.y - 14]], { w: 0.7 });
    for (let i = 0; i < n.nights; i++) {
      const y = n.y + i * hi1, sk = (h32(i, n.nights) - 0.5) * 1.6;
      ink('nodes', [[n.x + sk + 0.8, y + 0.9], [n.x + n.w + sk - 0.8, y + 0.9], [n.x + n.w + sk - 0.8, y + hi1 - 0.9], [n.x + sk + 0.8, y + hi1 - 0.9], [n.x + sk + 0.8, y + 0.9]], { w: 1.0, amp: 0.25, spacing: 1.5 });
      ink('nodes', [[n.x + n.w + sk - 9, y + 2.4], [n.x + n.w + sk - 9, y + hi1 - 2.4]], { w: 0.5, amp: 0.1 });
      for (let yy = y + 2; yy < y + hi1 - 1.5; yy += 1.8) pencil('nodes', [[n.x + sk + 2, yy], [n.x + n.w + sk - 2, yy]], col, { w: 1.6, alpha: 0.5, amp: 0.2 });
    }
    ink('nodes', [[n.x - 5, n.y + n.h + 2.5], [n.x + n.w + 5, n.y + n.h + 2.5], [n.x + n.w + 5, n.y + n.h + 7], [n.x - 5, n.y + n.h + 7], [n.x - 5, n.y + n.h + 2.5]], { w: 0.9, spacing: 1.5 });
    for (let x = n.x - 3; x < n.x + n.w + 4; x += 2.4) ink('nodes', [[x, n.y + n.h + 6.5], [x + 2, n.y + n.h + 3]], { w: 0.45, amp: 0.1 });
  }
  for (const n of right) {
    const step = n.h / n.nights, x0 = n.x, x1 = n.x + n.w, cx = (x0 + x1) / 2;
    ink('nodes', [[x0, n.y], [x0, n.y + n.h]], { w: 1.5 }); ink('nodes', [[x1, n.y], [x1, n.y + n.h]], { w: 1.5 });
    ink('nodes', [[x0 - 3, n.y], [cx, n.y - 8], [x1 + 3, n.y], [x0 - 3, n.y]], { w: 1.1 });
    ink('nodes', [[x0, n.y + n.h], [x0 + 6, n.y + n.h + 4], [cx, n.y + n.h + 10], [x1 - 6, n.y + n.h + 4], [x1, n.y + n.h]], { w: 1.0 });
    for (let x = x0 + 2.5; x < x1 - 1; x += 2.6) pencil('nodes', [[x, n.y + 1], [x, n.y + n.h - 1]], C.post, { w: 1.8, alpha: 0.32, amp: 0.4 });
    if (n.h > 40) for (const f of [0.22, 0.8]) { const P = []; for (let y = n.y + 4; y < n.y + n.h - 4; y += 4) P.push([lerp(x0, x1, f) + 1.2 * Math.sin(y / 9 + f * 9), y]); ink('nodes', P, { w: 0.45, amp: 0.15, alpha: 0.7 }); }
    for (let i = 0; i < n.nights; i++) {
      const y = n.y + (i + 0.5) * step;
      if (i % 5 === 4) ink('nodes', [[x0 + 4, n.y + (i - 3.5) * step - 1], [x1 - 4, y + 1]], { w: 1.2, amp: 0.2 });
      else ink('nodes', [[x0 + 6, y], [x1 - 6, y]], { w: 1.1, amp: 0.2 });
    }
  }

  // ---- 8. tags and signs on their ropes ------------------------------------------------------------------------
  const rope = (a, b, sag) => { const P = []; for (let u = 0; u <= 1.0001; u += 0.04) P.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u) + sag * Math.sin(Math.PI * u)]); return P; };
  tags.forEach((t, i) => {
    const { x, y, w, h, cy, node: n } = t, x1 = x + w, col = C[n.id];
    const shape = [[x + 14, y], [x1, y], [x1, y + h], [x + 14, y + h], [x, y + h - 14], [x, y + 14], [x + 14, y]];
    for (let j = 0; j < shape.length - 1; j++) ink('objects', [shape[j], shape[j + 1]], { w: 1.4, amp: 0.4 });
    ink('objects', [[x + 15, y + h + 2.6], [x1 + 1, y + h + 2.6], [x1 + 1, y + 2]], { w: 0.6, amp: 0.25 });
    const ex = x1 - 16;
    ink('objects', circlePts(ex, cy, 5, 20), { w: 0.9, spacing: 1 }); ink('objects', circlePts(ex, cy, 8.5, 26), { w: 0.7, spacing: 1 });
    const eyeBox = [ex - 11, cy - 11, ex + 11, cy + 11];
    for (const s of hatch(shape, -1.05, 3.4, { seed: 40 + i, inset: 2.5 })) for (const P of breakAround(s, [eyeBox], 1.5)) pencil('objects', P, col, { w: 2.0, alpha: 0.3, amp: 0.4 });
    // the string: through the eyelet, a loop, then across to the spindle
    ink('objects', [[ex + 3, cy - 4], [ex + 9, cy - 9], [ex + 13, cy - 3], [ex + 10, cy + 3], [x1 + 4, cy]], { w: 0.9, spacing: 1.2 });
    ink('objects', rope([x1 + 4, cy], [n.x - 1.5, n.y + n.h / 2], 7 + Math.abs(cy - (n.y + n.h / 2)) * 0.05), { w: 0.95, amp: 0.4 });
    t.text = { box: [x + 14, y, ex - 9, y + h] }; // inside the outline, left of the eyelet ring
  });
  signs.forEach((s, i) => {
    const { x, y, w, h, cy, node: n } = s, x1 = x + w, xp = x1 - SIGN.point;
    const shape = [[x, y], [xp, y], [x1, cy], [xp, y + h], [x, y + h], [x, y]];
    for (let j = 0; j < shape.length - 1; j++) ink('objects', [shape[j], shape[j + 1]], { w: 1.4, amp: 0.4 });
    ink('objects', [[x + 1, y + h + 2.6], [xp + 1, y + h + 2.6], [x1 + 1.5, cy + 2]], { w: 0.6, amp: 0.25 });
    for (const yy of [y + 5, y + h - 5]) ink('objects', circlePts(x + 8, yy, 1.8, 10), { w: 0.7, spacing: 0.8 });
    for (const sg of hatch(shape, 0.02, 3.2, { seed: 60 + i, inset: 2 })) pencil('objects', sg, C.wood, { w: 2.0, alpha: 0.28, amp: 0.4 });
    for (const sg of hatch([[xp - 2, y + 3], [x1 - 3, cy], [xp - 2, y + h - 3], [xp - 2, y + 3]], -0.9, 2.6, { seed: 80 + i })) ink('objects', sg, { w: 0.5, amp: 0.15 });
    const a = [n.x + n.w + 1.5, n.y + n.h / 2], b = [x - 1, cy];
    ink('objects', [[x - 1, cy - 3], [x - 6, cy], [x - 1, cy + 3]], { w: 0.8 });
    ink('objects', rope(a, b, 6 + Math.abs(b[1] - a[1]) * 0.05), { w: 0.95, amp: 0.4 });
    s.text = { box: [x + 10, y, xp, y + h] }; // inside the outline, right of the bolts, left of the point
  });

  // ---- 9. words, last of all --------------------------------------------------------------------------------
  const W_TITLE = words('w_title', 'Fifty-three Nights', W / 2, TITLE.y, TITLE.size, { anchor: 'middle', track: 0.03, container: [480, 48, 1440, 136], role: 'title' });
  const W_SUB = words('w_sub', 'Bob Wiseman, from the sea to the mountains', W / 2, SUB.y, SUB.size, { face: 'italic', anchor: 'middle', container: [480, 136, 1440, 182], role: 'subtitle' });
  const W_CORNERS = [
    ...words('w_corner', 'Plate I.', 86, 96, 22, { face: 'italic', container: [76, 66, 300, 112], role: 'corner' }),
    ...words('w_corner', 'October 2026 to March 2027', W - 86, 96, 22, { face: 'italic', anchor: 'end', container: [W - 480, 66, W - 76, 112], role: 'corner' }),
  ];
  const W_TAGS = tags.map((t) => [
    ...words('w_tags', t.node.id, t.x + TAG.padL, t.cy - 5, TAG.name, { container: t.text.box, role: 'tag' }),
    ...words('w_tags', nightsWord(t.node.nights), t.x + TAG.padL + 2, t.cy + 23, TAG.note, { face: 'italic', container: t.text.box, role: 'tag' }),
  ]);
  const W_SIGNS = signs.map((s) => [
    ...words('w_signs', s.node.id, s.x + SIGN.padL, s.cy - 3, SIGN.name, { container: s.text.box, role: 'sign' }),
    ...words('w_signs', nightsWord(s.node.nights), s.x + SIGN.padL + 2, s.cy + 21, SIGN.note, { face: 'italic', container: s.text.box, role: 'sign' }),
  ]);
  const W_NOTE = words('w_note', 'one pen line for every night', W / 2, 1012, 24, { face: 'italic', anchor: 'middle', container: [700, 984, 1220, 1028], role: 'note' });
  blueLine([760, 1012], [1160, 1012]);

  // ---- 10. the schedule (seconds) -----------------------------------------------------------------------------
  // Words are done by 12 s; the finished plate then holds 20 s (draft 2, Bob: "wish it would stay longer at the end")
  const END = Number(QS.get('end')) || 32;
  const SCHEDULE = [['construct', 0.35, 2.0, 7], ['frame', 1.1, 2.4, 2], ['far', 2.1, 3.9, 7], ['mid', 3.0, 4.6, 7], ['near', 3.9, 5.2, 6],
    ['bandTint', 4.5, 6.0, 9], ['bandInk', 5.3, 8.0, 12], ['nodes', 7.1, 8.9, 8], ['objects', 7.9, 9.5, 14]];
  for (const [g, t0, t1, hands] of SCHEDULE) { const end = spread(G[g], t0, t1, hands); if (end > t1 + 0.05) throw new Error(`${g} ends at ${end.toFixed(2)}, past ${t1}`); }
  // letters: one hand per block, each block at its own pace, all done by 12.0 so the plate holds 2 s
  // pen speed found by bisection so the block, short strokes and lifts included, ends exactly at t1
  const block = (strokes, t0, t1, lift = 0.002, min = 0.004) => {
    const dur = (v) => strokes.reduce((s, st) => s + Math.max(min, st.len / v) + lift, 0);
    let lo = 10, hi = 1e6; for (let i = 0; i < 60; i++) { const v = Math.sqrt(lo * hi); if (dur(v) > t1 - t0) lo = v; else hi = v; }
    const end = lane(strokes, t0, hi, lift, min);
    if (end > t1 + 0.05) throw new Error(`lettering block ends at ${end.toFixed(2)}, past ${t1}`);
  };

  block(W_TITLE, 9.5, 10.9); block(W_SUB, 10.3, 12.0);
  W_TAGS.forEach((b, i) => block(b, 9.8 + i * 0.16, 11.0 + i * 0.16));
  W_SIGNS.forEach((b, i) => block(b, 9.9 + i * 0.16, 11.1 + i * 0.16));
  block(W_CORNERS, 10.4, 11.9); block(W_NOTE, 10.6, 12.0);

  window.PLATE = { strokes: STROKES, words: WORDS, groups: G, diagram: D, tags, signs, links, nodes, END, chartBox };
})();
