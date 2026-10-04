// Shared kit for the black-box sections A (0-71) and K (341.29-366.83): playback chrome, waveforms,
// transcripts, captions, the garage with the plane in it, sleep traces, cream paper.
// Word text lives in js/lyrics.js (gitignored); times there are already snapped to vocal onsets.
const KIT = (() => {
  const voc = (t) => clamp(F('voc', t, 1) * 1.5);
  const slam = (t, t0, d = .14) => ease.back(inv(t0, t0 + d, t));
  const wrap = (x, m) => ((x % m) + m) % m;
  const lines = (sec) => LYR[sec].lines;
  // words of a line already spoken at t: [{w, t, a}] (a = 0..1 entrance)
  function said(L, t, lead = .03) { return L.words.filter(([, wt]) => t >= wt - lead).map(([w, wt]) => ({ w, t: wt, a: slam(t, wt - lead, .12) })); }
  const hitsNear = (list, t, decay = 6) => list.reduce((m, [h]) => Math.max(m, hit(t, h, decay)), 0);
  const inUnk = (sec, t) => LYR[sec].unk.some(([a, b]) => t >= a && t < b);
  const counter = (x) => { x = Math.max(0, x); const m = Math.floor(x / 60), sc = x - m * 60; return `${String(m).padStart(2, '0')}:${sc.toFixed(3).padStart(6, '0')}`; };

  // black-box chrome: brackets, header, tape counter, play state, beat light
  function cvr(t, code, o = {}) {
    const c = o.color || C.dim, t0 = o.t0 || 0;
    brackets(36, 36, W - 72, H - 72, 30, c, 2);
    text(o.head || 'CVR · AOH-1953 · PLAYBACK', 70, 76, { size: 16, color: c, ls: 2 });
    const st = o.state || '▶ PLAY';
    text(st, W - 330, 76, { size: 16, color: C.hot, weight: 700, ls: 2, alpha: st.startsWith('■') || blink(t, 1.2) ? 1 : .55 });
    text(counter(t - t0), W - 70, 76, { size: 16, color: c, align: 'right', ls: 1 });
    text(code, 70, H - 62, { size: 16, color: c, ls: 2 });
    dot(W - 82, H - 68, 6, beatPulse(t, 9) > .3 ? C.hot : c);
    text('CH1 VOICE · CH2 CABIN', W - 100, H - 62, { size: 16, color: c, align: 'right', ls: 1 });
  }

  // scrolling waveform of the real vocal envelope; future part dimmer (it's a recording, the future is known)
  function wave(x, y, w, h, t, o = {}) {
    const span = o.span || 4, ph = o.ph ?? .7, bw = o.bar || 6, rate = w / bw / span;
    const sec = o.sec || 'A', ch = o.ch || 'voc';
    withT(() => {
      s.beginPath(); s.rect(x, y - h / 2, w, h); s.clip();
      line([[x, y], [x + w, y]], '#2a2622', 1);
      for (const [a, b] of LYR[sec].unk) { // hatch the unintelligible spans
        const xa = x + (a - t) / span * w + ph * w, xb = x + (b - t) / span * w + ph * w;
        if (xb < x || xa > x + w) continue;
        frect(xa, y - h / 2, xb - xa, h, 'rgba(255,74,28,.07)');
        s.strokeStyle = 'rgba(255,74,28,.25)'; s.lineWidth = 1; s.beginPath();
        for (let k = xa - h; k < xb; k += 18) { s.moveTo(Math.max(k, xa), y - h / 2 + Math.max(0, xa - k)); s.lineTo(Math.min(k + h, xb), y + h / 2 - Math.max(0, k + h - xb)); }
        s.stroke();
        if (xa > x - 200 && h > 120) text('[UNINTELLIGIBLE]', Math.max(xa, x) + 8, y - h / 2 + 22, { size: 14, color: C.hot, ls: 1 });
      }
      const i0 = Math.floor((t - ph * span) * rate), i1 = Math.ceil((t + (1 - ph) * span) * rate);
      for (let i = i0; i <= i1; i++) {
        const tt = i / rate, xx = x + (tt - t) / span * w + ph * w;
        const v = clamp(F(ch, tt) * (ch === 'voc' ? 1.7 : 2.2)) * (.55 + .45 * hash(i * 31 + 7)), hh = 2 + v * h * .48;
        frect(xx, y - hh, bw - 2, hh * 2, tt > t ? '#3b3732' : (t - tt < .06 ? C.hot : (o.ink || C.ink)));
      }
      for (const [ht, lab] of LYR[sec].hits) {
        const xx = x + (ht - t) / span * w + ph * w; if (xx < x || xx > x + w) continue;
        line([[xx, y - h / 2 + 4], [xx, y + h / 2 - 4]], C.hot, 2); if (h > 100) text(lab, xx + 6, y + h / 2 - 10, { size: 13, color: C.hot });
      }
    });
    const px = x + ph * w; line([[px, y - h / 2 - 10], [px, y + h / 2 + 10]], C.hot, 2);
    poly([[px - 8, y - h / 2 - 18], [px + 8, y - h / 2 - 18], [px, y - h / 2 - 8]], C.hot);
  }

  // live transcript: words appear as spoken, wrapping inside maxW; newest word hot until the next one
  function transcript(L, t, x, y, o = {}) {
    const sz = o.size || 80, lh = o.lh || sz * 1.15, maxW = o.maxW || 1700, sp = measure(' ', { size: sz, weight: 700 });
    const ws = said(L, t); let cx = x, cy = y;
    ws.forEach((it, i) => {
      const str = o.lower ? it.w : it.w.toUpperCase(), wd = measure(str, { size: sz, weight: 700 });
      if (cx + wd > x + maxW && cx > x) { cx = x; cy += lh; }
      const last = i === ws.length - 1 && t - it.t < .5;
      text(str, cx, cy + (1 - it.a) * 18, { size: sz, weight: 700, color: last ? C.hot : (o.color || C.ink), alpha: clamp(it.a * 2) });
      cx += wd + sp;
      if (o.breakComma && /,$/.test(it.w) && i < L.words.length - 1) { cx = x; cy += lh; }
    });
    if (o.cursor !== false && blink(t)) frect(cx, cy - sz * .78, sz * .5, sz * .9, C.hot);
    return { x: cx, y: cy };
  }

  // closed-caption box
  function caption(str, x, y, o = {}) {
    const sz = o.size || 34, w = measure(str, { size: sz, weight: 700 }) + sz;
    const bx = o.align === 'center' ? x - w / 2 : x;
    s.globalAlpha = o.alpha ?? 1; frect(bx, y - sz * 1.1, w, sz * 1.5, o.bg || '#000'); s.globalAlpha = 1;
    text(str, bx + sz / 2, y, { size: sz, weight: 700, color: o.color || C.ink, alpha: o.alpha ?? 1 });
  }

  // scrambled decode: seeded letters that change every 1/14 s
  const GLY = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&?!';
  const scramble = (n, t, seed = 1) => { const f = Math.floor(t * 14); let r = ''; for (let i = 0; i < n; i++) r += hash(f * 131 + i * 17 + seed * 7919) < .13 ? ' ' : GLY[Math.floor(hash(f * 977 + i * 53 + seed) * GLY.length)]; return r; };

  // the garage, front-on. The plane's wingtips go through holes in the side walls.
  // o: {cx, gy, k, door 0 closed..1 open (exterior only), ext, lid, look, mouth, spin, bulb, px (plane offset), pk (plane scale mult)}
  function garage(t, o = {}) {
    const cx = o.cx ?? 960, gy = o.gy ?? 880, k = o.k ?? 1;
    const P = (x, y) => [cx + x * k, gy + y * k];
    const WL = 430, RF = -470, PK = -590, lw = 3;
    withT(() => {
      // ground
      line([P(-1400, 0), P(1400, 0)], C.dim, 2);
      for (let x = -1400; x < 1400; x += 34) line([P(x, 2), P(x - 18, 22)], '#25221e', 1.5);
      if (!o.ext) { // interior: back wall pegboard, shelf, spare prop, bulb
        s.globalAlpha = .9;
        for (let x = -380; x <= 380; x += 40) for (let y = -430; y < -150; y += 40) dot(...P(x, y), 2 * k, '#2b2824');
        s.globalAlpha = 1;
        line([P(-400, -300), P(-250, -300)], C.dim, 3);
        for (let i = 0; i < 4; i++) { const [x0, y0] = P(-390 + i * 38, -300); s.strokeStyle = C.dim; s.lineWidth = 2; s.strokeRect(x0, y0 - 40 * k - i * 6 * k, 26 * k, 40 * k + i * 6 * k); }
        withT(() => { const [px, py] = P(330, -330); s.translate(px, py); s.rotate(.6); line([[-90 * k, 0], [90 * k, 0]], C.dim, 7 * k); dot(0, 0, 10 * k, C.dim); }); // spare propeller on the wall
        text('NO SMOKING · NO FLYING', ...P(0, -395), { size: 14 * k, color: '#4a453e', align: 'center', ls: 3 });
        const bl = o.bulb ?? .5; line([P(0, RF), P(0, -420)], C.dim, 1.5);
        dot(...P(0, -410), 12 * k, bl > .3 ? C.ink : C.dim);
        if (bl > 0) { s.globalAlpha = .07 * bl; poly([P(-20, -405), P(20, -405), P(300, 0), P(-300, 0)], C.ink); s.globalAlpha = 1; }
      }
      // plane (behind the walls' front faces, so wings appear to pass through)
      const pk = .92 * (o.pk ?? 1), [ppx, ppy] = P(o.px || 0, 0);
      PL.front(ppx, ppy, k * pk, t, { lid: o.lid ?? 0, look: o.look || [0, .2], mouth: o.mouth || 0, spin: o.spin ?? 0, smile: o.smile ?? .2, brow: o.brow || 0 });
      // walls with a wing hole each
      const wingY = -110 * pk;
      for (const sx of [-1, 1]) {
        const x0 = sx * WL;
        // wall slab (filled so it occludes, hole cut where the wing passes)
        withT(() => {
          s.beginPath(); const a = P(x0 - 16, PK + 120), b = P(x0 + 16, 0); s.rect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
          s.fillStyle = C.bg; s.fill(); s.lineWidth = lw; s.strokeStyle = C.ink; s.stroke();
        });
        const hole = []; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r = 1 + .35 * hash(i * 13 + (sx > 0 ? 3 : 9)); hole.push(P(x0 + Math.cos(a) * 26 * r, wingY + Math.sin(a) * 24 * r)); }
        poly(hole, C.bg); line([...hole, hole[0]], C.dim, 2);
        // the wing visible through the hole
        line([P(x0 - 30, wingY - 6), P(x0 + 30, wingY - 6)], C.ink, 2.5); line([P(x0 - 30, wingY + 6), P(x0 + 30, wingY + 6)], C.ink, 2.5);
        // cracks
        for (let i = 0; i < 4; i++) { const a = hash(i * 7 + sx * 3 + 50) * TAU; line([P(x0 + Math.cos(a) * 30, wingY + Math.sin(a) * 28), P(x0 + Math.cos(a) * 62, wingY + Math.sin(a) * 58)], C.dim, 1.5); }
      }
      // roof gable
      line([P(-WL - 60, RF + 30), P(0, PK), P(WL + 60, RF + 30)], C.ink, lw);
      line([P(-WL, RF + 10), P(WL, RF + 10)], C.ink, lw);
      if (o.ext) { // facade + roll-up door
        const D = 330, DT = -410, open = clamp(o.door ?? 0);
        rect(...P(-D - 10, DT - 12), (2 * D + 20) * k, (-DT + 12) * k, C.ink, lw);
        const bottom = DT + (-DT) * (1 - open);
        for (let y = DT; y < bottom - 1; y += 34) {
          const y2 = Math.min(y + 34, bottom); const a = P(-D, y), b = P(D, y2);
          frect(a[0], a[1], b[0] - a[0], b[1] - a[1], '#0e0d0b'); line([P(-D, y2), P(D, y2)], C.dim, 2);
        }
        if (open < 1) { line([P(-D, bottom), P(D, bottom)], C.ink, 3); frect(...P(-30, bottom - 22), 60 * k, 8 * k, C.hot); }
        text('AOH-1953', ...P(0, DT - 30), { size: 18 * k, color: C.dim, align: 'center', ls: 6 });
      }
    });
  }

  // polysomnograph channel: seeded noise scaled by audio, scrolling left
  function trace(x, y, w, h, t, o = {}) {
    const span = o.span || 6, n = 320, seed = o.seed || 1, sec = o.sec || 'A';
    s.beginPath();
    for (let i = 0; i <= n; i++) {
      const u = i / n, tt = t - span * (1 - u);
      let v = snoise(tt * (o.hz || 9), seed) * .45 + snoise(tt * (o.hz || 9) * 3.1, seed + 5) * .25;
      v *= (o.base ?? .25) + (o.gain ?? 1.2) * clamp(F(o.ch || 'voc', tt) * 1.6);
      v += hitsNear(LYR[sec].hits, tt, 9) * (o.spike ?? 1) * Math.sin(tt * 90 + seed) * 1.2;
      s.lineTo(x + u * w, y + clamp(v, -1, 1) * h / 2);
    }
    s.lineWidth = o.lw || 2; s.strokeStyle = o.color || C.ink; s.stroke();
    text(o.label || '', x - 16, y + 6, { size: 15, color: C.dim, align: 'right', ls: 1 });
  }

  // cream paper sheet transform helper
  function paper(t, lt, fn, o = {}) {
    fill('#141210'); fx({ paper: 1 });
    withT(() => {
      const sh = o.shake || 0;
      s.translate(960 + snoise(t * 50, 5) * sh, 540 + snoise(t * 50, 6) * sh); s.rotate(o.rot ?? -.015); s.scale(1 + lt * (o.zoom ?? .012), 1 + lt * (o.zoom ?? .012));
      frect(-760 + 14, -505 + 18, 1520, 1010, 'rgba(0,0,0,.5)'); frect(-760, -505, 1520, 1010, C.paper);
      s.translate(-760, -505); fn();
    });
  }
  function stamp(t, t0, x0, y0, rot, w, h, rows, seed = 1) {
    if (t < t0) return; const p = ease.out(inv(t0, t0 + .07, t)), sc = lerp(2.3, 1, p), red = C.pink;
    // size the box to the text: inner border sits 14 px in, so keep 44 px clear of the outer edge each side
    const tw = Math.max(...rows.map(([str, sz]) => measure(str, { fam: FAM.g, weight: 900, size: sz, ls: 3 }) - 3));
    const cap = Math.max(...rows.map(([, sz]) => sz * .74));
    w = Math.max(w, tw + 2 * 56); h = Math.max(h, cap + 2 * 46);
    withT(() => {
      s.translate(x0, y0); s.rotate(rot); s.scale(sc, sc); s.globalAlpha = .9 * p;
      s.lineWidth = 8; s.strokeStyle = red; s.strokeRect(-w / 2, -h / 2, w, h); s.lineWidth = 3; s.strokeRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28);
      rows.forEach(([str, sz, dy]) => text(str, 1.5, dy, { fam: FAM.g, weight: 900, size: sz, color: red, align: 'center', ls: 3 }));
      s.fillStyle = C.paper; for (let i = 0; i < 220; i++) { const r = rng(i * 97 + seed); s.globalAlpha = .55 * p; s.fillRect((r() - .5) * w, (r() - .5) * h, 2 + r() * 7, 2 + r() * 4); }
      s.globalAlpha = 1;
    });
  }
  // the technical log page shared by A (rooms) and K (wings)
  function logPage(t, rowsDone, live) {
    const ink = C.pencil, grey = '#6b6357', rule = '#b9ae98';
    frect(60, 50, 300, 76, ink); text('TECH LOG', 210, 103, { fam: FAM.g, weight: 900, size: 46, color: C.paper, align: 'center' });
    text('AIRCRAFT TECHNICAL LOG · AOH-1953', 390, 88, { fam: FAM.g, weight: 800, size: 40, color: ink });
    text('Defects reported by crew · Action taken by engineer · Sheet 7', 392, 118, { size: 15, color: grey });
    line([[60, 150], [1460, 150]], ink, 3);
    const cols = [[60, 'DATE'], [210, 'DEFECT REPORTED'], [930, 'ACTION TAKEN'], [1360, 'SIGN']];
    cols.forEach(([x, l]) => text(l, x, 185, { size: 16, color: grey, ls: 2 }));
    for (const [x] of cols.slice(1)) line([[x - 16, 160], [x - 16, 960]], rule, 1.5);
    for (let y = 205; y < 960; y += 95) line([[60, y], [1460, y]], rule, 1.5);
    rowsDone.forEach(([d, def, act], i) => {
      const y = 265 + i * 95;
      text(d, 70, y, { size: 22, color: ink }); text(def, 210, y, { size: 24, color: ink }); text(act, 930, y, { size: 22, color: '#2b3a6b' });
      s.beginPath(); for (let j = 0; j <= 30; j++) { const u = j / 30; s.lineTo(1370 + u * 70, y - 6 - 10 * Math.sin(u * 12 + i)); } s.lineWidth = 2; s.strokeStyle = '#2b3a6b'; s.stroke();
    });
    if (live) live(265 + rowsDone.length * 95);
  }

  return { voc, slam, wrap, lines, said, hitsNear, inUnk, counter, cvr, wave, transcript, caption, scramble, garage, trace, paper, stamp, logPage };
})();
