// DRAWING STYLE PROBE: the line and figures of 1970s pinball-machine cel animation (Robin, 2026-10-02:
// "the figure, the kinds of lines, not so much the colours"). Same palette, drawn differently:
//  - fine outlines in a darker shade of each fill instead of heavy black ink
//  - soft airbrushed shading (light from the upper left) instead of flat fills and hatching
//  - rounded, fleshed-out cartoon figures with weight: tapered limbs, mitten hands, a nose, shoes
//  - glossy highlights on round things; coloured-pencil grain in the finish
// Loaded after kit.js. On with ?style=pnc (or window.PNC = true); it replaces kit drawing primitives.
const PNC = window.PNC || new URLSearchParams(location.search).get('style') === 'pnc';
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
})();
