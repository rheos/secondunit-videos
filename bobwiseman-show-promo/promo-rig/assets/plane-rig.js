// The Airplane-type plane rig (bobwiseman-airplane-type/js/plane.js, unchanged below the line),
// plus the few drawing helpers it uses. Call PL.use(ctx) once, set PL.C colours per scene, then
// PL.side(x, y, scale, t, {mouth, look, lid, frown, spiral, rot, spin, smile, lw}).
const TAU = Math.PI * 2;
const C = { bg: '#f3ead7', ink: '#1d1a33', dim: '#8a8398', hot: '#e6477d' };
let s = null;
function dot(x, y, r, c) { s.fillStyle = c; s.beginPath(); s.arc(x, y, Math.max(.1, r), 0, TAU); s.fill(); }
function line(pts, c, w, cap = 'round') { s.lineCap = cap; s.lineJoin = 'round'; s.lineWidth = w; s.strokeStyle = c; s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.stroke(); }
function withT(fn) { s.save(); fn(); s.restore(); }
// ------------------------------------------------------------------------------------------------
// The plane as a technical drawing: a stubby 1950s four-wheel prop airliner, line-drawn, filled with the
// ground colour so he occludes the type behind him. Big eyes in the windscreen, a mouth that opens with
// the vocal. Local units, origin on the road under his middle; side view faces +x.
// o: { lw px, ink, mouth 0..1, look [dx,dy], lid 0..1, frown -1..1, spin (wheel/prop angle), wire (no fill), spiral }
const PL = (() => {
  function eye(x, y, rx, ry, o, lw) {
    s.beginPath(); s.ellipse(x, y, rx, ry, 0, 0, TAU); s.fillStyle = o.ink; s.fill();
    const [lx, ly] = o.look || [0, 0];
    if (o.spiral) {
      s.beginPath(); for (let a = 0; a < 14; a += .2) { const r = (a / 14) * rx * .85; s.lineTo(x + Math.cos(a + o.spiral) * r, y + Math.sin(a + o.spiral) * r * ry / rx); }
      s.lineWidth = lw * .8; s.strokeStyle = C.bg; s.stroke();
    } else {
      dot(x + lx * rx * .42, y + ly * ry * .42, rx * .46, C.bg);
      dot(x + lx * rx * .42 - rx * .14, y + ly * ry * .42 - ry * .16, rx * .12, o.ink);
    }
    if (o.lid > 0) { // a flat lid coming down over the top of the eye
      s.save(); s.beginPath(); s.ellipse(x, y, rx + lw, ry + lw, 0, 0, TAU); s.clip();
      const ly0 = y - ry - lw + (ry * 2 + lw) * o.lid * .6, tilt = (o.frown || 0) * ry * .35 * Math.sign(x);
      s.beginPath(); s.moveTo(x - rx * 1.3, y - ry * 2); s.lineTo(x + rx * 1.3, y - ry * 2); s.lineTo(x + rx * 1.3, ly0 + tilt); s.lineTo(x - rx * 1.3, ly0 - tilt); s.closePath();
      s.fillStyle = C.bg; s.fill(); s.restore();
      line([[x - rx * 1.1, y - ry - lw + (ry * 2 + lw) * o.lid * .6 - (o.frown || 0) * ry * .35 * Math.sign(x)], [x + rx * 1.1, y - ry - lw + (ry * 2 + lw) * o.lid * .6 + (o.frown || 0) * ry * .35 * Math.sign(x)]], o.ink, lw);
    }
    s.beginPath(); s.ellipse(x, y, rx, ry, 0, 0, TAU); s.lineWidth = lw; s.strokeStyle = o.ink; s.stroke();
  }
  function mouth(x, y, w, open, smile, lw, o) {
    const h = 3 + open * w * .9;
    s.beginPath(); s.moveTo(x - w / 2, y); s.quadraticCurveTo(x, y - smile * w * .25, x + w / 2, y);
    s.quadraticCurveTo(x, y + h - smile * w * .1, x - w / 2, y); s.closePath();
    s.fillStyle = open > .08 ? C.hot : C.bg; s.fill(); s.lineWidth = lw; s.strokeStyle = o.ink; s.stroke();
  }
  function shape(path, o, lw, fill = true) { path(); if (fill && !o.wire) { s.fillStyle = C.bg; s.fill(); } s.lineWidth = lw; s.strokeStyle = o.ink; s.stroke(); }
  function wheel(cx, cy, r, ang, lw, o) {
    s.beginPath(); s.arc(cx, cy, r, 0, TAU); s.fillStyle = C.bg; s.fill(); s.lineWidth = lw; s.strokeStyle = o.ink; s.stroke();
    s.beginPath(); s.arc(cx, cy, r * .62, 0, TAU); s.lineWidth = lw * .6; s.strokeStyle = C.dim; s.stroke();
    for (let i = 0; i < 5; i++) { const a = ang + i * TAU / 5; line([[cx + Math.cos(a) * r * .2, cy + Math.sin(a) * r * .2], [cx + Math.cos(a) * r * .6, cy + Math.sin(a) * r * .6]], o.ink, lw * .55); }
    dot(cx, cy, r * .18, C.hot);
  }
  function prop(cx, cy, R, ang, lw, o, flat = true) {
    s.setLineDash([6, 8]); s.beginPath(); flat ? s.ellipse(cx, cy, R * .14, R, 0, 0, TAU) : s.arc(cx, cy, R, 0, TAU); s.lineWidth = lw * .5; s.strokeStyle = C.dim; s.stroke(); s.setLineDash([]);
    for (let i = 0; i < 3; i++) {
      const a = ang + i * TAU / 3, ex = flat ? Math.sin(a) * R * .14 : Math.cos(a) * R, ey = flat ? Math.cos(a) * R : Math.sin(a) * R;
      line([[cx, cy], [cx + ex, cy + ey]], o.ink, lw * 1.3); dot(cx + ex, cy + ey, lw * 1.2, C.hot);
    }
    dot(cx, cy, R * .12, C.hot);
  }
  function side(x, y, k, t, o = {}) {
    o = { ink: C.ink, lw: 3, mouth: 0, look: [.6, 0], lid: 0, frown: 0, spin: t * 14, smile: .3, ...o };
    const lw = o.lw / k;
    withT(() => {
      s.translate(x, y); s.rotate(o.rot || 0); s.scale(k * (o.flip ? -1 : 1), k); s.lineJoin = 'round'; s.lineCap = 'round';
      // far wheel struts, tailplane, fin (behind the body)
      shape(() => { s.beginPath(); s.moveTo(-222, -205); s.lineTo(-290, -335); s.lineTo(-326, -335); s.lineTo(-304, -186); s.closePath(); }, o, lw);
      line([[-300, -260], [-240, -230]], C.dim, lw * .5);
      // fuselage
      const body = () => { s.beginPath(); s.moveTo(-305, -186); s.lineTo(130, -224); s.quadraticCurveTo(300, -226, 306, -150); s.quadraticCurveTo(300, -80, 130, -80); s.lineTo(-190, -92); s.quadraticCurveTo(-272, -112, -305, -176); s.closePath(); };
      line([[-150, -88], [-150, -38]], o.ink, lw); line([[150, -82], [150, -38]], o.ink, lw);
      shape(body, o, lw);
      withT(() => { // construction: station lines, cheat line, portholes
        body(); s.clip();
        s.setLineDash([5, 9]); for (const sx of [-220, -120, -20, 80]) line([[sx, -240], [sx, -70]], C.dim, lw * .5); s.setLineDash([]);
        line([[-310, -150], [310, -146]], C.hot, lw * 1.2);
        for (let px = -200; px <= 100; px += 50) { s.beginPath(); s.arc(px, -178, 9, 0, TAU); s.lineWidth = lw * .7; s.strokeStyle = o.ink; s.stroke(); }
      });
      shape(() => { s.beginPath(); s.ellipse(-300, -190, 62, 7, 0, 0, TAU); }, o, lw);
      // windscreen + eyes
      shape(() => { s.beginPath(); s.moveTo(176, -214); s.lineTo(258, -214); s.quadraticCurveTo(290, -196, 293, -164); s.lineTo(182, -164); s.closePath(); }, o, lw);
      eye(208, -189, 19, 21, o, lw); eye(252, -188, 17, 20, o, lw);
      if (o.brow) for (const [bx, d] of [[208, 1], [252, -1]]) line([[bx - 18, -222 - o.brow * 8 * d], [bx + 18, -222 + o.brow * 8 * d]], o.ink, lw * 1.2);
      mouth(280, -118, 40, o.mouth, o.smile, lw, o);
      // wing seen edge-on, level with the lower body; engine nacelle and prop
      shape(() => { s.beginPath(); s.moveTo(-110, -104); s.quadraticCurveTo(0, -126, 112, -110); s.quadraticCurveTo(0, -94, -110, -104); s.closePath(); }, o, lw);
      shape(() => { s.beginPath(); s.ellipse(52, -112, 64, 21, 0, 0, TAU); }, o, lw);
      line([[112, -130], [112, -94]], C.hot, lw * 1.4);
      prop(120, -112, 56, o.spin * 2.3, lw, o);
      wheel(-150, -36, 36, o.spin, lw, o); wheel(150, -36, 36, o.spin, lw, o);
    });
  }
  // front elevation: span 1240 local, fuselage r 78
  function front(x, y, k, t, o = {}) {
    o = { ink: C.ink, lw: 3, mouth: 0, look: [0, .2], lid: 0, frown: 0, spin: t * 30, smile: .3, ...o };
    const lw = o.lw / k;
    withT(() => {
      s.translate(x, y); s.rotate(o.rot || 0); s.scale(k, k); s.lineJoin = 'round'; s.lineCap = 'round';
      shape(() => { s.beginPath(); s.rect(-170, -212, 340, 12); }, o, lw);
      shape(() => { s.beginPath(); s.moveTo(-5, -225); s.lineTo(-7, -340); s.lineTo(7, -340); s.lineTo(5, -225); s.closePath(); }, o, lw);
      for (const sx of [-1, 1]) {
        shape(() => { s.beginPath(); s.moveTo(sx * 60, -128); s.lineTo(sx * 620, -116); s.lineTo(sx * 620, -106); s.lineTo(sx * 60, -98); s.closePath(); }, o, lw);
        line([[sx * 72, -84], [sx * 72, -60]], o.ink, lw);
        shape(() => { s.beginPath(); s.roundRect(sx * 72 - 15, -68, 30, 68, 10); }, o, lw);
        line([[sx * 72 - 15, -34], [sx * 72 + 15, -34]], C.hot, lw);
        shape(() => { s.beginPath(); s.arc(sx * 250, -110, 26, 0, TAU); }, o, lw);
        prop(sx * 250, -110, 62, o.spin * sx, lw, o, false);
      }
      shape(() => { s.beginPath(); s.arc(0, -150, 80, 0, TAU); }, o, lw);
      line([[-80, -150], [80, -150]], C.hot, lw * 1.2);
      shape(() => { s.beginPath(); s.ellipse(0, -186, 64, 30, 0, Math.PI, TAU); s.lineTo(64, -170); s.lineTo(-64, -170); s.closePath(); }, o, lw);
      eye(-28, -184, 21, 23, o, lw); eye(28, -184, 21, 23, o, lw);
      if (o.brow) for (const d of [-1, 1]) line([[d * 28 - 20, -218 + o.brow * 9 * -d], [d * 28 + 20, -218 + o.brow * 9 * d]], o.ink, lw * 1.2);
      mouth(0, -118, 46, o.mouth, o.smile, lw, o);
    });
  }
  // plan view, nose toward -y. wings unfilled so traffic shows under them.
  function top(x, y, k, t, o = {}) {
    o = { ink: C.ink, lw: 3, spin: t * 30, ...o };
    const lw = o.lw / k;
    withT(() => {
      s.translate(x, y); s.rotate(o.rot || 0); s.scale(k, k); s.lineJoin = 'round';
      const wing = (sx) => { s.beginPath(); s.moveTo(sx * 40, -50); s.lineTo(sx * 620, -6); s.lineTo(sx * 620, 26); s.lineTo(sx * 40, 50); s.closePath(); };
      for (const sx of [-1, 1]) {
        wing(sx); s.lineWidth = lw; s.strokeStyle = o.ink; s.stroke();
        s.setLineDash([6, 10]); line([[sx * 60, 0], [sx * 610, 10]], C.dim, lw * .5); s.setLineDash([]);
        shape(() => { s.beginPath(); s.roundRect(sx * 250 - 18, -80, 36, 110, 16); }, o, lw);
        const pr = 70 * Math.abs(Math.cos(o.spin)) + 10; line([[sx * 250 - pr, -88], [sx * 250 + pr, -88]], o.ink, lw * 1.2);
        shape(() => { s.beginPath(); s.moveTo(sx * 18, 250); s.lineTo(sx * 170, 280); s.lineTo(sx * 170, 296); s.lineTo(sx * 14, 292); s.closePath(); }, o, lw);
      }
      shape(() => { s.beginPath(); s.moveTo(0, -310); s.quadraticCurveTo(48, -300, 46, -200); s.lineTo(30, 300); s.lineTo(-30, 300); s.lineTo(-46, -200); s.quadraticCurveTo(-48, -300, 0, -310); s.closePath(); }, o, lw);
      line([[0, -300], [0, 300]], C.hot, lw);
      shape(() => { s.beginPath(); s.moveTo(-30, -250); s.quadraticCurveTo(0, -275, 30, -250); s.lineTo(26, -228); s.lineTo(-26, -228); s.closePath(); }, o, lw);
    });
  }
  return { side, front, top };
})();
PL.use = (ctx) => { s = ctx; }; PL.C = C; window.PL = PL;
