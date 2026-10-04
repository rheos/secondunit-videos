// DRAWING STYLE PROBE: the line and figures of 1970s pinball-machine cel animation (Robin, 2026-10-02:
// "the figure, the kinds of lines, not so much the colours"). Same palette, drawn differently:
//  - fine outlines in a darker shade of each fill instead of heavy black ink
//  - soft airbrushed shading (light from the upper left) instead of flat fills and hatching
//  - rounded, fleshed-out cartoon figures with weight: tapered limbs, mitten hands, a nose, shoes
//  - glossy highlights on round things; coloured-pencil grain in the finish
// Loaded after kit.js. On with ?style=pnc (or window.PNC = true); it replaces kit drawing primitives.
const PNC = window.PNC || new URLSearchParams(location.search).get('style') === 'pnc';
if (PNC) window.PNC_ON = true;
if (PNC) (() => {
  const rgb = (c) => { if (typeof c !== 'string' || c[0] !== '#') return null; const h = c.length === 4 ? c.slice(1).split('').map((x) => x + x).join('') : c.slice(1, 7); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
  const mix = (c, to, k) => { const a = rgb(c); if (!a) return c; const b = rgb(to); return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`; };
  const dark = (c, k = .45) => mix(c, '#1a1210', k), light = (c, k = .22) => mix(c, '#fff8ec', k);
  const LINE = '#4a3c34';
  const bbox = (pts) => { const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
  const path = (pts) => { s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); };
  // airbrushed fill of the current path over a box: highlight upper left, shade lower right
  function soft(c, x0, y0, x1, y1) {
    if (!rgb(c)) { s.fillStyle = c; s.fill(); return; }
    const g = s.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, light(c, .28)); g.addColorStop(.45, c); g.addColorStop(1, dark(c, .28));
    s.fillStyle = g; s.fill();
  }
  shape = function (pts, c, w = 2.5) {
    path(pts); const [x0, y0, x1, y1] = bbox(pts); soft(c, x0, y0, x1, y1);
    s.lineJoin = 'round'; s.lineWidth = Math.max(.8, w * .42); s.strokeStyle = rgb(c) ? dark(c, .55) : LINE; s.stroke();
  };
  ink = function (pts, w = 2.5) { line(pts, LINE, Math.max(.8, w * .45)); };
  // no hatching: a soft airbrushed shadow across the region instead
  hatch = function (pts, ang = .8, gap = 9, w = 1.4, a = .55) {
    withT(() => { path(pts); s.clip(); const [x0, y0, x1, y1] = bbox(pts);
      const g = s.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, 'rgba(40,24,30,0)'); g.addColorStop(1, `rgba(40,24,30,${.42 * a})`);
      s.fillStyle = g; s.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4); });
  };

  // ---- figures, drawn in local units (1 = a metre at his depth), feet at the origin, facing +x ----
  function fig(b, k, face, fn) { withT(() => { s.translate(b[0], b[1]); s.scale(face * k, k); fn(1 / k); }); }
  function blob(pts, c, lw, curve = true) { // a closed shape through pts, smoothed with quadratic curves
    s.beginPath(); const n = pts.length;
    if (!curve) path(pts); else { const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; let p = m(pts[n - 1], pts[0]); s.moveTo(...p);
      for (let i = 0; i < n; i++) { const q = m(pts[i], pts[(i + 1) % n]); s.quadraticCurveTo(pts[i][0], pts[i][1], q[0], q[1]); } s.closePath(); }
    const [x0, y0, x1, y1] = bbox(pts); soft(c, x0, y0, x1, y1); s.lineWidth = lw; s.lineJoin = 'round'; s.strokeStyle = dark(c, .6); s.stroke();
  }
  function tube(a, b, c, w0, w1, col, lw) { // a smooth limb a -> b -> c: outline stroke, then the fill stroke over it
    const pts = [a, b, c];
    const g = s.createLinearGradient(Math.min(a[0], c[0]) - w0, Math.min(a[1], c[1]), Math.max(a[0], c[0]) + w0, Math.max(a[1], c[1]));
    if (rgb(col)) { g.addColorStop(0, light(col, .22)); g.addColorStop(1, dark(col, .22)); }
    s.lineCap = 'round'; s.lineJoin = 'round'; s.beginPath(); s.moveTo(...a); s.quadraticCurveTo(...b, ...c);
    s.lineWidth = (w0 + w1) + lw * 2; s.strokeStyle = rgb(col) ? dark(col, .6) : LINE; s.stroke();
    s.lineWidth = (w0 + w1); s.strokeStyle = rgb(col) ? g : col; s.stroke();
  }
  function ball(x, y, r, c, lw) { // a glossy round thing: shaded sphere with a hot highlight
    s.beginPath(); s.arc(x, y, r, 0, TAU); const g = s.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
    g.addColorStop(0, light(c, .45)); g.addColorStop(.6, c); g.addColorStop(1, dark(c, .35)); s.fillStyle = g; s.fill();
    s.lineWidth = lw; s.strokeStyle = dark(c, .6); s.stroke();
    s.globalAlpha = .7; s.beginPath(); s.ellipse(x - r * .38, y - r * .42, r * .22, r * .13, -.6, 0, TAU); s.fillStyle = '#fffaf0'; s.fill(); s.globalAlpha = 1;
  }
  const TROUSER = '#4f4b42', SHOE = '#2c2621', CASE = '#3a2f28';
  function head(hx, hy, lw, { hat = true, back = false } = {}) {
    if (!back) {
      blob([[hx - .1, hy - .12], [hx + .1, hy - .13], [hx + .14, hy], [hx + .1, hy + .13], [hx - .06, hy + .14], [hx - .13, hy + .02]], SKIN, lw);
      ball(hx + .145, hy + .01, .05, mix(SKIN, '#c0605a', .25), lw);                        // the nose
      s.beginPath(); s.ellipse(hx + .07, hy - .035, .018, .026, 0, 0, TAU); s.fillStyle = '#2a1f1a'; s.fill();   // eye
      s.beginPath(); s.arc(hx + .05, hy + .07, .05, .2, 1.3); s.lineWidth = lw; s.strokeStyle = dark(SKIN, .55); s.stroke(); // smile line
      blob([[hx - .07, hy - .03], [hx - .03, hy - .04], [hx - .03, hy + .04], [hx - .07, hy + .03]], mix(SKIN, '#c0605a', .12), lw); // ear
    } else blob([[hx - .12, hy - .1], [hx + .12, hy - .1], [hx + .13, hy + .06], [hx, hy + .14], [hx - .13, hy + .06]], SKIN, lw);
    if (!hat) return;
    blob([[hx - .25, hy - .09], [hx + .25, hy - .1], [hx + .27, hy - .06], [hx, hy - .04], [hx - .27, hy - .05]], HAT, lw);       // brim
    blob([[hx - .14, hy - .1], [hx + .14, hy - .1], [hx + .13, hy - .27], [hx + .03, hy - .24], [hx - .03, hy - .28], [hx - .13, hy - .26]], HAT, lw); // dented crown
    s.fillStyle = dark(HAT, .5); s.fillRect(hx - .135, hy - .15, .27, .04);                  // band
  }

  man = function (x, z, { ph = 0, walk = 0, face = 1, arm = 0, ticket = false } = {}) {
    const b = P(x, FL, z), k = b[2], sw = Math.sin(ph * TAU) * .32 * walk, bob = Math.abs(Math.sin(ph * TAU)) * .03 * walk;
    carriedCase(b, k, face, sw); // behind him: drawn first, in screen space
    fig(b, k, face, (u) => {
      const lw = 1.3 * u, hip = [0, -.95];
      // far arm with the guitar case, behind everything
      // legs: tapered trouser tubes with shoes; the far leg darker
      for (const [a, far] of [[-sw, true], [sw, false]]) {
        const kn = [hip[0] + Math.sin(a) * .5, hip[1] + .5], ft = [hip[0] + Math.sin(a) * .9 + .05, -.05];
        tube(hip, kn, ft, .1, .07, far ? dark(TROUSER, .2) : TROUSER, lw);
        blob([[ft[0] - .07, -.07], [ft[0] + .12, -.08], [ft[0] + .17, -.01], [ft[0] - .08, 0]], SHOE, lw);
      }
      // the coat: a bell from the shoulders to the knee, lapel and buttons
      const sh = -1.45 + bob;
      blob([[-.15, sh - .02], [.13, sh - .02], [.2, sh + .1], [.18, sh + .5], [.3, -.45], [0, -.43], [-.3, -.45], [-.2, sh + .5], [-.21, sh + .1]], COAT, lw);
      line([[.13, sh + .03], [.05, sh + .45]], dark(COAT, .55), lw);
      for (const yy of [sh + .52, sh + .74]) ball(.09, yy, .025, dark(COAT, .3), lw * .6);
      head(.04, -1.64 + bob, lw);
      // near arm: a tapered sleeve and a mitten hand, on the same joints as before (props line up)
      const shp = [.02, sh + .12], ang = lerp(sw * .8, 1.9, arm);
      const el = [shp[0] + Math.sin(ang) * .36, shp[1] + Math.cos(ang) * .36], hd = [el[0] + Math.sin(ang * 1.1) * .34, el[1] + Math.cos(ang * 1.1) * .34];
      tube(shp, el, hd, .075, .055, COAT, lw);
      ball(hd[0], hd[1], .06, SKIN, lw);
      if (ticket) blob([[hd[0], hd[1] - .03], [hd[0] + .15, hd[1] - .06], [hd[0] + .16, hd[1] + .04], [hd[0] + .01, hd[1] + .06]], CREAM, lw, false);
    });
  };

  // a seated man from behind, hat on (or an empty chair)
  seat = function (x, z, sitter, mine = false) {
    const b = P(x, FL, z), k = b[2], sy = P(x, .95, z)[1];
    fig([b[0], b[1]], k, 1, (u) => {
      const lw = 1.2 * u, top = (sy - b[1]) / k;
      for (const lx of [-.34, .34]) line([[lx, 0], [lx, top]], LINE, 2 * u);
      blob([[-.42, top - .06], [.42, top - .06], [.42, top + .02], [-.42, top + .02]], '#5d5a4c', lw, false);
      if (!sitter) { blob([[-.4, top - .7], [.4, top - .7], [.42, top - .1], [-.42, top - .1]], '#6e6a5a', lw); return; }
      const sh = top - .78;
      blob([[-.44, top], [.44, top], [.4, sh + .2], [.25, sh], [-.25, sh], [-.4, sh + .2]], mine ? '#4f4c40' : COAT, lw);
      head(0, sh - .1, lw, { back: true });
    });
    if (mine) restingCase(x + .55, z - .1);
  };

  // ---- her, in the same cartoon hand. Joints computed exactly as the kit's woman() so props still land ----
  woman = function (x, z, { ph = 0, walk = 0, face = -1, seated = false, arm = 0, rose = 0, look = 0 } = {}) {
    const b = P(x, FL, z), k = b[2], sw = Math.sin(ph * TAU) * .28 * walk, bob = Math.abs(Math.sin(ph * TAU)) * .03 * k * walk;
    const hipY = seated ? b[1] - .52 * k : b[1] - .92 * k, sh = hipY - .55 * k;
    const shp = [b[0] + .02 * k * face, sh + .08 * k + bob], ang = lerp(sw * .8, -1.5, arm) * face;
    const el = [shp[0] + Math.sin(ang) * .3 * k, shp[1] + Math.cos(ang) * .3 * k], hand = [el[0] + Math.sin(ang * 1.1 + (seated ? .9 * face : 0)) * .28 * k, el[1] + Math.cos(ang * 1.1) * .28 * k];
    const hx = b[0] + .03 * k * face + look * .02 * k * face, hy = sh - .2 * k + bob;
    const L = ([X, Y]) => [(X - b[0]) / (k * face), (Y - b[1]) / k]; // screen -> her local units
    const DRESS = '#77756a', HAIR = '#2d2a24';
    fig(b, k, face, (u) => {
      const lw = 1.3 * u, hp = [0, (hipY - b[1]) / k], sY = (sh - b[1]) / k + bob / k;
      if (seated) { tube(hp, [.45, hp[1]], [.48, -.04], .09, .065, '#3a3631', lw); blob([[.42, -.07], [.6, -.08], [.63, -.01], [.42, 0]], SHOE, lw); }
      else for (const [a, far] of [[-sw, true], [sw, false]]) {
        const kn = [Math.sin(a) * .5, hp[1] + .48], ft = [Math.sin(a) * .85, -.04];
        tube(hp, kn, ft, .075, .055, far ? '#4a4540' : '#5a554e', lw); blob([[ft[0] - .05, -.06], [ft[0] + .11, -.07], [ft[0] + .14, -.01], [ft[0] - .06, 0]], SHOE, lw);
      }
      // dress: fitted bodice, a skirt that bells to the knee (or over the lap)
      const skirt = seated ? [[.16, hp[1] - .02], [.55, hp[1] + .02], [.52, hp[1] + .12], [-.3, hp[1] + .12], [-.2, hp[1]]] : [[.15, hp[1]], [.32, hp[1] + .4], [0, hp[1] + .42], [-.32, hp[1] + .4], [-.17, hp[1]]];
      blob(skirt, DRESS, lw);
      blob([[-.16, sY], [.14, sY], [.17, sY + .2], [.13, hp[1] + .02], [-.15, hp[1] + .02], [-.19, sY + .2]], DRESS, lw);
      if (rose > 0) { s.globalAlpha = rose; blob([[-.1, sY], [.12, sY], [0, sY + .12]], ROSE, lw, false); s.globalAlpha = 1; }
      const [lx, ly] = L([hx, hy]);
      line([[0, sY], [lx, ly + .08]], SKIN, .09); // neck
      blob([[lx - .1, ly - .1], [lx + .09, ly - .12], [lx + .13, ly], [lx + .09, ly + .12], [lx - .05, ly + .13], [lx - .12, ly + .02]], SKIN, lw);
      ball(lx + .125, ly + .015, .035, mix(SKIN, '#c0605a', .2), lw);
      s.beginPath(); s.ellipse(lx + .06, ly - .03, .016, .024, 0, 0, TAU); s.fillStyle = '#2a1f1a'; s.fill();
      for (const dx of [.02, .045, .07]) line([[lx + dx, ly - .055], [lx + dx + .008, ly - .072]], '#2a1f1a', .008); // lashes
      if (rose > 0) { s.globalAlpha = rose * .55; s.beginPath(); s.arc(lx + .05, ly + .04, .035, 0, TAU); s.fillStyle = ROSE; s.fill(); s.globalAlpha = 1; }
      blob([[lx - .13, ly - .02], [lx - .1, ly - .13], [lx + .02, ly - .15], [lx + .11, ly - .1], [lx + .04, ly - .06], [lx - .06, ly - .03]], HAIR, lw); // hair
      ball(lx - .13, ly - .1, .07, HAIR, lw); // bun
      const [sx, sy2] = L(shp), [ex, ey] = L(el), [hx2, hy2] = L(hand);
      tube([sx, sy2], [ex, ey], [hx2, hy2], .06, .045, DRESS, lw); ball(hx2, hy2, .045, SKIN, lw);
    });
    return { hand, head: [hx, hy] };
  };

  // ---- flourishes: deco ornament and chrome, as in the 70s pinball-cabinet look ----
  const _board = board, _clock = clock, _duct = duct, _room = room, _horn = horn, _ticketBox = ticketBox;
  function fan(cx, cy, r, n, a0, a1, cols, lw) { // a scalloped sunburst fan: n petals between angles a0..a1
    for (let i = n - 1; i >= 0; i--) for (let ring = 0; ring < 3; ring++) {
      const rr = r * (1 - ring * .28), a = lerp(a0, a1, (i + .5) / n), half = (a1 - a0) / n * .5;
      s.beginPath(); s.moveTo(cx, cy); s.arc(cx, cy, rr, a - half, a + half); s.closePath();
      soft(cols[(i + ring) % cols.length], cx - rr, cy - rr, cx + rr, cy + rr); s.lineWidth = lw; s.strokeStyle = dark(cols[(i + ring) % cols.length], .55); s.stroke();
      if (ring === 0) { s.beginPath(); s.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, rr * Math.sin(half) * .55, a - Math.PI / 2, a + Math.PI / 2); s.fillStyle = cols[i % cols.length]; s.fill(); s.stroke(); } // scalloped rim
    }
  }
  function star(x, y, r, c, lw) { s.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; s[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } s.closePath(); soft(c, x - r, y - r, x + r, y + r); s.lineWidth = lw; s.strokeStyle = dark(c, .5); s.stroke(); }
  board = function (t, num = '0002', z = 52) {
    const a = P(-3, -2.25, z), b = P(3, -.95, z), k = a[2], cx = (a[0] + b[0]) / 2, w = b[0] - a[0];
    fan(cx, a[1], w * .32, 9, Math.PI, TAU, [BRASS, AMBER, CREAM], Math.max(.6, k * .01));                  // sunburst crest
    shape([[a[0] - w * .06, a[1] + w * .02], [a[0] + w * .02, a[1] - w * .05], [b[0] - w * .02, a[1] - w * .05], [b[0] + w * .06, a[1] + w * .02], [b[0] + w * .06, b[1] + w * .03], [a[0] - w * .06, b[1] + w * .03]], BRASS, 2); // stepped deco frame
    _board(t, num, z);
    for (const sx of [a[0] + w * .07, b[0] - w * .07]) star(sx, a[1] + (b[1] - a[1]) * .3, k * .09, CREAM, Math.max(.6, k * .01));
    for (const [px, py] of [[a[0], a[1]], [b[0], a[1]], [a[0], b[1]], [b[0], b[1]]]) ball(px, py, k * .05, BRASS, Math.max(.6, k * .01)); // bolts
  };
  clock = function (t, x, y, z) {
    const c = P(x, y, z), r = .45 * c[2];
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, a2 = a + TAU / 24; s.beginPath(); s.moveTo(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r); s.lineTo(c[0] + Math.cos(a2 - .13) * r * 1.38, c[1] + Math.sin(a2 - .13) * r * 1.38); s.lineTo(c[0] + Math.cos(a2 + .13) * r * 1.38, c[1] + Math.sin(a2 + .13) * r * 1.38); s.closePath(); soft(i % 2 ? BRASS : CREAM, c[0] - r * 1.4, c[1] - r * 1.4, c[0] + r * 1.4, c[1] + r * 1.4); s.lineWidth = .8; s.strokeStyle = LINE; s.stroke(); }
    _clock(t, x, y, z);
    for (let i = 1; i <= 12; i++) { const a = -Math.PI / 2 + i / 12 * TAU; text(String(i), c[0] + Math.cos(a) * r * .66, c[1] + Math.sin(a) * r * .66 + r * .08, r * .2, { font: 'sign', color: LINE }); }
    ball(c[0], c[1], r * .07, BRASS, .8);
  };
  duct = function (x, y, r, z0, z1, c = STEEL) {
    _duct(x, y, r, z0, z1, c);
    // a chrome highlight running along the top of the duct
    const pts = []; for (let z = Math.max(z0, C.z + .8); z <= z1; z += .9) pts.push(P(x - r * .25, y - r * .55, z));
    for (let i = 1; i < pts.length; i++) line([[pts[i - 1][0], pts[i - 1][1]], [pts[i][0], pts[i][1]]], 'rgba(255,250,235,.55)', Math.max(1, r * pts[i][2] * .14));
  };
  room = function (t) {
    _room(t);
    // a scalloped deco frieze along the top of both walls, and stepped pilasters on the drawer wall
    for (const wx of [-WX, WX]) for (let z = Math.max(2, Math.ceil((C.z + .6) / 1.3) * 1.3); z < 46; z += 1.3) {
      const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push(P(wx, CE + .05 + Math.sin(u * Math.PI) * .2, z + u * 1.3)); }
      const top = [P(wx, CE + .02, z + 1.3), P(wx, CE + .02, z)];
      shape([...pts.map((p) => [p[0], p[1]]), ...top.map((p) => [p[0], p[1]])], wx < 0 ? BRASS : '#8c8770', 1);
    }
    for (let z = 7.8; z < 44; z += 7.8) { const q = [P(-WX, CE + .3, z), P(-WX, CE + .3, z + .4), P(-WX, FL, z + .4), P(-WX, FL, z)].map((p) => [p[0], p[1]]); shape(q, '#9aa290', 1); }
  };
  horn = function (t, z = 9) { _horn(t, z); const m = P(-WX + .1, -1.9, z), k = m[2]; ball(m[0] + .1 * k, m[1] - .05 * k, .09 * k, BRASS, 1); };
  ticketBox = function (x = 3.6, z = 5.6) { const top = P(x, -.1, z), k = top[2]; fan(top[0], top[1] - .72 * k, .25 * k, 5, Math.PI, TAU, [BRASS, CREAM], .8); _ticketBox(x, z); ball(top[0], top[1] - .72 * k, .05 * k, AMBER, .8); };

  cloud = function (cx, cy, r, seed) {
    const R = rng(seed); const puffs = [];
    for (let i = 0; i < 6; i++) { const u = i / 5 - .5, rr = r * (.42 + .5 * (1 - Math.abs(u) * 1.4) + R() * .15); puffs.push([cx + u * r * 2.6, cy - rr * .55, rr]); }
    puffs.push([cx - r * .3, cy - r * .95, r * .55], [cx + r * .4, cy - r * 1.0, r * .5]);
    withT(() => { s.beginPath(); s.rect(cx - r * 4, cy - r * 4, r * 8, r * 4.02); s.clip();
      s.lineWidth = Math.max(1, r * .025); s.strokeStyle = '#8a9aa8'; for (const [x, y, rr] of puffs) { s.beginPath(); s.arc(x, y, rr, 0, TAU); s.stroke(); }
      for (const [x, y, rr] of puffs) { s.beginPath(); s.arc(x, y, rr - s.lineWidth / 2, 0, TAU); const g = s.createRadialGradient(x - rr * .35, y - rr * .45, rr * .1, x, y, rr); g.addColorStop(0, '#ffffff'); g.addColorStop(.7, '#f1f1ea'); g.addColorStop(1, '#c9d4dc'); s.fillStyle = g; s.fill(); }
      s.globalAlpha = .35; const g2 = s.createLinearGradient(0, cy - r * .6, 0, cy); g2.addColorStop(0, 'rgba(150,170,190,0)'); g2.addColorStop(1, 'rgba(150,170,190,1)'); s.fillStyle = g2; s.fillRect(cx - r * 2, cy - r * .6, r * 4, r * .6); s.globalAlpha = 1; });
  };
  // the style's helpers, for chapters that draw their own close-ups: use them only when window.PNC_ON
  window.PNCK = { soft, blob, tube, ball, fan, star, head, fig, mix, dark, light, LINE, path, bbox };
})();
