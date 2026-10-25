// diagram.js · Mermaid text in, marks out. Window global BPD; load vendor/pele.global.js and vendor/hershey.js first.
//
// pele (MIT, obsidianmd/pele) lays a diagram out from a few lines of Mermaid. It measures every word with the
// Hershey letters the plate will actually draw (BPD.measurer), so boxes and gaps are sized for the hand lettering
// and every label fits first time. Then the SVG is flattened to marks: one record per drawn element, its points in
// page pixels, tagged with pele's classes and ids, so a shot restyles marks by class instead of drawing pele's SVG.
//
//   const D = BPD.diagram(mmd, { x: 300, y: 320, w: 1300, h: 680 }, { fontSize: 26, config: { sankey: { ... } } });
//   D.sel('.pele-sankey-node')                  every node rect
//   D.sel('.pele-sankey-link', '#October->Quebec')  args are ANDed; '.a, .b' inside one string is OR
//   D.sel('<text', '.pele-label')               tag, then class on the element or any ancestor
//
// A mark: { tag, cls, id, P, closed, box, fill, stroke, title, rect?, text? }. P is a polyline [[x, y], ...] in page
// px (curves sampled, then thinned); a path with several subpaths gives one mark per subpath (part 0, 1, ...).
// id is the element's data-id (pele's node and link ids) or the nearest ancestor's. Text marks carry
// text: { str, x, y, anchor, size, spans: [{ str, cls }] } with x, y on the baseline in page px.
// Ids containing '.', '#', '<' or ',' can't go in a selector string: use D.where(m => m.id === 'P.E.I.').
(function () {
  'use strict';

  // ---- Hershey letters ----------------------------------------------------------------------------
  // Units: cap top y=1, baseline y=22 (21 units of cap height). A size of S px puts the cap height at 0.7 S.
  const UNITS_PER_SIZE = 30, BASELINE = 22, SPACE = 10;
  const faces = {};
  function face(name) {
    if (faces[name]) return faces[name];
    const src = window.HERSHEY && window.HERSHEY[name];
    if (!src) throw new Error(`BPD: no Hershey face "${name}" (load vendor/hershey.js)`);
    const glyphs = src.chars.map(([d, o]) => ({ adv: 2 * o, strokes: parseML(d) }));
    return (faces[name] = { name, glyph: (ch) => glyphs[ch.charCodeAt(0) - 33] || null });
  }
  // Hershey path data is only M and L, with implicit L pairs: "M5,1 L4,3 5,15 M5,20 L4,21".
  function parseML(d) {
    const out = []; let cur = null;
    for (const tok of d.match(/[ML]|-?[\d.]+,-?[\d.]+/g) || []) {
      if (tok === 'M') { cur = []; out.push(cur); } else if (tok !== 'L') { const [x, y] = tok.split(',').map(Number); cur.push([x, y]); }
    }
    return out.filter((s) => s.length > 1);
  }
  // Width in px of text set at size in a face, with track (extra space per letter, as a fraction of size).
  function measure(str, size, faceName = 'serif', track = 0) {
    const f = face(faceName), u = size / UNITS_PER_SIZE; let w = 0;
    for (const ch of str) w += (ch === ' ' ? SPACE : (f.glyph(ch) || { adv: SPACE }).adv) * u + track * size;
    return Math.max(0, w - track * size);
  }
  // The strokes of a line of lettering, laid out from (x, y) on the baseline. anchor: start | middle | end.
  // Returns [{ ch, x, w, strokes: [[[x, y], ...], ...] }], one entry per letter (spaces left out).
  function letter(str, x, y, size, { face: faceName = 'serif', anchor = 'start', track = 0 } = {}) {
    const f = face(faceName), u = size / UNITS_PER_SIZE, w = measure(str, size, faceName, track);
    let pen = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
    const out = [];
    for (const ch of str) {
      const g = ch === ' ' ? null : f.glyph(ch), adv = (g ? g.adv : SPACE) * u;
      if (g) out.push({ ch, x: pen, w: adv, strokes: g.strokes.map((s) => s.map(([gx, gy]) => [pen + gx * u, y + (gy - BASELINE) * u])) });
      pen += adv + track * size;
    }
    return out;
  }
  // pele's TextMeasurer: italic text (style bit 2) measures in the italic face, everything else in serif.
  const measurer = (faceNames = { serif: 'serif', italic: 'italic' }, track = 0) => ({
    width: (text, size, style) => measure(String(text), size, style & 2 ? faceNames.italic : faceNames.serif, track),
  });

  // ---- the marks layer ---------------------------------------------------------------------------------
  function diagram(mmd, box, { fontSize = 24, config, measurer: m, step = 1.5, tolerance = 0.2 } = {}) {
    if (!window.pele) throw new Error('BPD: load vendor/pele.global.js first');
    const r = window.pele.render(mmd, { measurer: m || measurer(), fontSize, config, responsive: false });
    // Mounted hidden so the browser's own geometry (getPointAtLength, getCTM) does the sampling.
    const host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:-100000px;top:0;visibility:hidden;pointer-events:none';
    host.innerHTML = r.svg;
    document.body.appendChild(host);
    const svg = host.querySelector('svg');
    svg.style.maxWidth = 'none'; svg.setAttribute('width', r.width); svg.setAttribute('height', r.height);
    const s = Math.min(box.w / r.width, box.h / r.height);
    const ox = box.x + (box.w - r.width * s) / 2, oy = box.y + (box.h - r.height * s) / 2;
    const rootInv = svg.getScreenCTM().inverse();
    const marks = [];
    for (const el of svg.querySelectorAll('*')) {
      const tag = el.tagName.toLowerCase();
      if (tag === 'title' || tag === 'tspan' || tag === 'defs' || el.closest('defs')) continue;
      const geom = typeof el.getTotalLength === 'function' && tag !== 'text';
      if (!geom && tag !== 'text') continue;
      const ctm = rootInv.multiply(el.getScreenCTM());
      const page = ([x, y]) => { const p = new DOMPoint(x, y).matrixTransform(ctm); return [ox + p.x * s, oy + p.y * s]; };
      const base = {
        tag, cls: classesOf(el), own: [...el.classList], id: idOf(el), fill: attrUp(el, 'fill'), stroke: attrUp(el, 'stroke'),
        title: el.querySelector(':scope > title')?.textContent ?? null,
      };
      if (tag === 'text') { marks.push(textMark(el, base, page, s)); continue; }
      const parts = sample(el, tag, step).map((pts) => thin(pts.map(page), tolerance));
      parts.forEach((P, part) => {
        if (P.length < 2) return;
        const mk = { ...base, part, P, closed: closedOf(el, tag, P), box: bbox(P) };
        if (tag === 'rect') mk.rect = rectOf(el, page);
        marks.push(mk);
      });
    }
    host.remove();
    const where = (fn) => marks.filter(fn);
    return { type: r.type, marks, sel: (...q) => select(marks, q), where, scale: s, box: { x: ox, y: oy, w: r.width * s, h: r.height * s }, svg: r.svg };
  }

  function classesOf(el) { const c = new Set(); for (let e = el; e && e.classList; e = e.parentElement) e.classList.forEach((k) => c.add(k)); return [...c]; }
  function idOf(el) { const e = el.closest('[data-id]'); return e ? e.getAttribute('data-id') : (el.id || null); }
  function attrUp(el, a) { const e = el.closest(`[${a}]`); return e ? e.getAttribute(a) : null; }
  function bbox(P) { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const [x, y] of P) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return [x0, y0, x1, y1]; }
  function closedOf(el, tag, P) {
    if (tag === 'rect' || tag === 'circle' || tag === 'ellipse' || tag === 'polygon') return true;
    if (tag === 'path' && /z\s*$/i.test(el.getAttribute('d') || '')) return true;
    const a = P[0], b = P[P.length - 1]; return Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.5;
  }
  function rectOf(el, page) {
    const n = (k) => Number(el.getAttribute(k) || 0);
    const a = page([n('x'), n('y')]), b = page([n('x') + n('width'), n('y') + n('height')]);
    return { x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), w: Math.abs(b[0] - a[0]), h: Math.abs(b[1] - a[1]) };
  }
  // Element-local polylines. Straight-edged shapes give their exact corners; curves are sampled every `step`
  // user units, and a jump in space larger than the step between two samples marks a new subpath (a moveto).
  function sample(el, tag, step) {
    const n = (k) => Number(el.getAttribute(k) || 0);
    if (tag === 'line') return [[[n('x1'), n('y1')], [n('x2'), n('y2')]]];
    if (tag === 'polyline' || tag === 'polygon') {
      const pts = (el.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number), P = [];
      for (let i = 0; i + 1 < pts.length; i += 2) P.push([pts[i], pts[i + 1]]);
      if (tag === 'polygon' && P.length) P.push(P[0]);
      return [P];
    }
    if (tag === 'rect' && !n('rx') && !n('ry')) {
      const x = n('x'), y = n('y'), w = n('width'), h = n('height');
      return [[[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]];
    }
    const L = el.getTotalLength(); if (!(L > 0)) return [];
    const k = Math.max(8, Math.ceil(L / step)), out = []; let cur = [], prev = null;
    for (let i = 0; i <= k; i++) {
      const p = el.getPointAtLength((L * i) / k), q = [p.x, p.y];
      if (prev && Math.hypot(q[0] - prev[0], q[1] - prev[1]) > 1.5 * (L / k) + 0.01) { if (cur.length > 1) out.push(cur); cur = []; }
      cur.push(q); prev = q;
    }
    if (cur.length > 1) out.push(cur);
    return out;
  }
  // Ramer-Douglas-Peucker in page px: keeps corners, drops the samples a straight run doesn't need.
  function thin(P, tol) {
    if (P.length < 3) return P;
    const keep = new Uint8Array(P.length); keep[0] = keep[P.length - 1] = 1;
    const stack = [[0, P.length - 1]];
    while (stack.length) {
      const [a, b] = stack.pop(); const [ax, ay] = P[a], [bx, by] = P[b]; const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
      let best = -1, bi = -1;
      // a closed outline starts and ends on one point: measure from that point instead of from a line
      for (let i = a + 1; i < b; i++) {
        const d = len < 1e-6 ? Math.hypot(P[i][0] - ax, P[i][1] - ay) : Math.abs((P[i][0] - ax) * dy - (P[i][1] - ay) * dx) / len;
        if (d > best) { best = d; bi = i; }
      }
      if (best > tol) { keep[bi] = 1; stack.push([a, bi], [bi, b]); }
    }
    return P.filter((_, i) => keep[i]);
  }
  function textMark(el, base, page, s) {
    const n = (k) => Number(el.getAttribute(k) || 0);
    const fs = Number(attrUp(el, 'font-size') || 16);
    const [x, y] = page([n('x'), n('y')]);
    const spans = [];
    for (const node of el.childNodes) {
      if (node.nodeType === 3) { if (node.textContent) spans.push({ str: node.textContent, cls: [] }); }
      else spans.push({ str: node.textContent, cls: [...(node.classList || [])] });
    }
    const str = el.textContent;
    return { ...base, P: [[x, y]], closed: false, box: [x, y - fs * s, x, y],
      text: { str, x, y, anchor: el.getAttribute('text-anchor') || 'start', size: fs * s, spans } };
  }
  // Selector: each arg is a list of alternatives split by ','; an alternative is tokens like .class #id <tag,
  // all of which must match. Args are ANDed.
  function select(marks, q) {
    const tests = q.map((arg) => String(arg).split(',').map((alt) => {
      const toks = [...alt.matchAll(/([.#<])([^.#<]+)/g)].map((m) => [m[1], m[2].trim()]);
      return (mk) => toks.every(([k, v]) => (k === '.' ? mk.cls.includes(v) : k === '#' ? mk.id === v : mk.tag === v));
    }));
    return marks.filter((mk) => tests.every((alts) => alts.some((t) => t(mk))));
  }

  window.BPD = { diagram, measurer, measure, letter, face, UNITS_PER_SIZE };
})();
