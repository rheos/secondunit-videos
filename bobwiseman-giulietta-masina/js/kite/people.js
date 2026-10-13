// The kite dream's people, painted in tone with soft modelling (light: a high sun up and to the left).
// Every figure is a stylised stand-in: no likeness of any real person.

// ---------- her face: the woman in white (Masina stand-in), three-quarter turned to the viewer's left ----------
// Unit space: the head is about 2 units tall, face centre at 0. r = px per unit. o: up (0..1 the face tipped to the sky),
// look ([x, y] -1..1 the eyes), blink (0 open .. 1 shut), tear (0..1 progress of the first tear), tear2 (second),
// wet (0..1 the eyes brimming), brows (0 calm .. 1 lifted in the middle), mouth (0 closed .. 1 parted), soft (blur px),
// hairT (time, for the breeze in the curls)
function herFace(g, x, y, r, o = {}) {
  const up = o.up || 0, look = o.look || [-.3, -.2], blink = o.blink || 0, sk = .8, hairT = o.hairT || 0;
  const sf = (b, fn) => { g.save(); g.filter = `blur(${Math.max(.1, b * r * RS).toFixed(2)}px)`; fn(); g.restore(); };
  // a smooth closed curve through points (midpoint quadratics)
  const blob = (pts) => { g.beginPath(); const n = pts.length; g.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } g.closePath(); };
  g.save(); g.translate(x, y); g.scale(r, r);
  // neck (upright, not tipped with the head), the jaw's shadow on it, the coat's round collar if asked
  g.fillStyle = linG(g, -.25, 0, .45, 0, [[0, sk - .04], [.6, sk - .16], [1, sk - .3]]);
  g.beginPath(); g.moveTo(-.2, .55); g.quadraticCurveTo(-.21, .9, -.27, 1.15); g.lineTo(.44, 1.15); g.quadraticCurveTo(.36, .85, .42, .4); g.closePath(); g.fill();
  sf(.07, () => { g.fillStyle = gv(0, .34); ell(g, .1, .78 - up * .1, .36, .15, -.25); g.fill(); });
  if (o.collar) {
    g.fillStyle = radG(g, -.3, 1.4, .1, 1.6, [[0, 1], [.7, .9], [1, .7]]);
    g.beginPath(); g.moveTo(-1.9, 2.6); g.bezierCurveTo(-1.6, 1.45, -.8, 1.12, -.3, 1.08); g.lineTo(.5, 1.08); g.bezierCurveTo(1.0, 1.12, 1.7, 1.5, 2.0, 2.6); g.closePath(); g.fill();
    g.fillStyle = gv(1); g.beginPath(); g.moveTo(-.55, 1.0); g.quadraticCurveTo(.08, .92, .7, 1.02); g.quadraticCurveTo(.75, 1.3, .1, 1.32); g.quadraticCurveTo(-.55, 1.3, -.55, 1.0); g.fill();
    sf(.03, () => { g.strokeStyle = gv(.6, .5); g.lineWidth = .02; g.beginPath(); g.moveTo(-.5, 1.2); g.quadraticCurveTo(.1, 1.36, .68, 1.16); g.stroke(); });
    sf(.05, () => { g.fillStyle = gv(.4, .35); ell(g, .1, 1.05, .45, .05); g.fill(); }); // the collar's shadow on the neck
  }
  // the head tips back and to the left as she looks up; a face tipped back foreshortens a little
  g.rotate(-.06 - up * .3); g.scale(1, 1 - .1 * up);
  // hair, the back mass: short platinum curls (Bob 2026-10-12: she is not dark haired), close at the nape, a soft bumpy outline
  const HP = [];
  for (let i = 0; i < 30; i++) {
    const a = Math.PI * (.75 + i / 29 * 1.55), rr = 1.0 + .045 * Math.sin(i * 2.7 + .5) + .015 * Math.sin(hairT * 2 + i);
    HP.push([.12 + Math.cos(a) * rr * .96, -.24 + Math.sin(a) * rr * .9]);
  }
  HP.push([.62, .42], [.44, .5], [.3, .1], [-.4, -.5]);
  blob(HP); g.fillStyle = radG(g, -.25, -.75, .05, 1.35, [[0, .98], [.4, .88], [1, .72]]); g.fill();
  sf(.02, () => { g.strokeStyle = gv(.5, .45); g.lineWidth = .025; blob(HP); g.stroke(); }); // pale hair: a soft darker rim
  g.save(); blob(HP); g.clip();
  sf(.06, () => { const R = mulberry(31); for (let i = 0; i < 26; i++) { const a = Math.PI * (.9 + R() * 1.3), rr = .55 + R() * .42; g.fillStyle = gv(.5, .12 + .16 * R() * (Math.sin(a) < -.3 ? .6 : 1.6)); ell(g, .12 + Math.cos(a) * rr, -.24 + Math.sin(a) * rr * .9, .07, .05, a); g.fill(); } });
  g.restore();
  // ear, half under the hair
  g.fillStyle = radG(g, .5, .08, .01, .17, [[0, sk - .04], [1, sk - .3]], -.05, -.04); ell(g, .5, .1, .095, .16, .15); g.fill();
  sf(.02, () => { g.strokeStyle = gv(sk - .38, .55); g.lineWidth = .02; g.beginPath(); g.arc(.5, .09, .06, -1.2, 1.4); g.stroke(); });
  // the face
  const face = () => {
    g.beginPath(); g.moveTo(-.2, -.82);
    g.bezierCurveTo(-.5, -.8, -.68, -.55, -.68, -.28);   // forehead to the far temple
    g.quadraticCurveTo(-.67, -.14, -.62, -.08);           // far brow ridge, the eye socket
    g.quadraticCurveTo(-.7, .06, -.67, .2);               // far cheekbone
    g.bezierCurveTo(-.63, .46, -.52, .68, -.34, .84);     // far cheek to the jaw
    g.quadraticCurveTo(-.2, .96, -.05, .93);              // chin
    g.bezierCurveTo(.18, .87, .36, .72, .44, .52);        // near jaw
    g.lineTo(.48, .1); g.bezierCurveTo(.5, -.3, .4, -.7, .1, -.84); g.closePath();
  };
  face(); g.fillStyle = radG(g, -.32, -.2, .05, 1.2, [[0, sk + .14], [.45, sk + .05], [.8, sk - .08], [1, sk - .2]]); g.fill();
  g.save(); face(); g.clip();
  sf(.24, () => { g.fillStyle = gv(0, .28); ell(g, .5, .3, .3, .7, -.1); g.fill(); });       // the near cheek turns from the sun
  sf(.12, () => { g.fillStyle = gv(0, .2); ell(g, .18, .8, .38, .13, -.4); g.fill(); });       // under the jaw
  sf(.14, () => { g.fillStyle = gv(1, .32); ell(g, -.32, -.5, .26, .15, -.2); g.fill(); ell(g, -.52, .2, .09, .14, .2); g.fill(); ell(g, -.02, .24, .15, .1); g.fill(); ell(g, -.18, .8, .1, .06); g.fill(); });
  sf(.06, () => { g.fillStyle = gv(.25, .1); ell(g, -.02, .3, .13, .08); g.fill(); });          // a little colour in the near cheek
  sf(.08, () => { g.fillStyle = gv(0, .15); ell(g, -.47, -.1, .13, .12); g.fill(); ell(g, .06, -.1, .2, .13); g.fill(); }); // eye sockets
  // the nose: no outline, only its shadow on the near side and under the tip, a soft light down the bridge
  sf(.04, () => {
    g.fillStyle = gv(0, .3); g.beginPath(); g.moveTo(-.3, -.1); g.quadraticCurveTo(-.22, .1, -.24, .3); g.quadraticCurveTo(-.18, .36, -.12, .3); g.quadraticCurveTo(-.15, .08, -.26, -.12); g.closePath(); g.fill();
    ell(g, -.33, .4, .12, .035); g.fill();
  });
  sf(.035, () => { g.fillStyle = gv(1, .32); g.beginPath(); g.moveTo(-.36, -.08); g.quadraticCurveTo(-.41, .1, -.42, .25); g.lineTo(-.37, .25); g.quadraticCurveTo(-.35, .08, -.32, -.08); g.closePath(); g.fill(); ell(g, -.42, .3, .04, .03); g.fill(); });
  sf(.03, () => { g.fillStyle = gv(0, .18); ell(g, -.28, .66, .1, .035); g.fill(); ell(g, -.3, .45, .03, .045); g.fill(); }); // under the lip, the philtrum
  g.restore();
  // the far side of the nose against the far cheek: a soft edge, and the nostril
  sf(.02, () => { g.strokeStyle = gv(sk - .25, .4); g.lineWidth = .02; g.lineCap = 'round'; g.beginPath(); g.moveTo(-.46, .1); g.quadraticCurveTo(-.5, .26, -.44, .33); g.quadraticCurveTo(-.38, .36, -.32, .34); g.stroke();
    g.fillStyle = gv(.25, .7); ell(g, -.3, .35, .035, .018, .2); g.fill(); });
  // eyes: big and dark, the far one foreshortened
  const eye = (cx, cy, w, h, far) => {
    const op = 1 - blink, oh = h * op;
    g.save();
    if (op > .08) {
      g.beginPath(); g.moveTo(cx - w, cy + h * .1); g.bezierCurveTo(cx - w * .5, cy - oh * 1.15, cx + w * .45, cy - oh * 1.2, cx + w, cy - h * .05);
      g.bezierCurveTo(cx + w * .5, cy + oh * .75, cx - w * .4, cy + oh * .8, cx - w, cy + h * .1); g.closePath();
      g.fillStyle = gv(far ? .8 : .86); g.fill(); g.save(); g.clip();
      const ix = cx + look[0] * w * .5, iy = cy - h * .1 + look[1] * oh * .55, ir = h * .78;
      g.fillStyle = radG(g, ix, iy, ir * .1, ir, [[0, .3], [.65, .22], [.9, .1], [1, .05]], 0, ir * .25); ell(g, ix, iy, ir * (far ? .8 : 1), ir); g.fill();
      g.fillStyle = gv(.03); ell(g, ix, iy, ir * .42 * (far ? .8 : 1), ir * .42); g.fill();
      g.fillStyle = gv(1, .95); ell(g, ix - ir * .3, iy - ir * .32, ir * .2, ir * .2); g.fill();
      g.fillStyle = gv(1, .5); ell(g, ix + ir * .3, iy + ir * .35, ir * .09, ir * .09); g.fill();
      g.fillStyle = gv(0, .3); g.fillRect(cx - w * 1.2, cy - oh * 1.3, w * 2.4, oh * .55);
      if (o.wet) { g.fillStyle = gv(1, .5 * o.wet); ell(g, cx, cy + oh * .6, w * .8, h * .1); g.fill(); }
      g.restore();
      g.strokeStyle = gv(.06); g.lineCap = 'round'; g.lineWidth = .035;
      g.beginPath(); g.moveTo(cx - w * 1.04, cy + h * .1); g.bezierCurveTo(cx - w * .5, cy - oh * 1.2, cx + w * .45, cy - oh * 1.25, cx + w * 1.06, cy - h * .08); g.stroke();
      g.lineWidth = .02; g.beginPath(); g.moveTo(cx + w * .95, cy - h * .1); g.lineTo(cx + w * 1.25, cy - h * .35); g.moveTo(cx + w * .75, cy - oh * .75); g.lineTo(cx + w * .98, cy - oh * 1.1); g.stroke();
      g.strokeStyle = gv(.35, .5); g.lineWidth = .014; g.beginPath(); g.moveTo(cx - w * .9, cy + h * .2); g.bezierCurveTo(cx - w * .3, cy + oh * .85, cx + w * .4, cy + oh * .8, cx + w * .95, cy + h * .05); g.stroke();
      if (o.wet) { g.strokeStyle = gv(1, .7 * o.wet); g.lineWidth = .014; g.beginPath(); g.moveTo(cx - w * .6, cy + oh * .62); g.quadraticCurveTo(cx, cy + oh * .85, cx + w * .6, cy + oh * .55); g.stroke(); }
    } else {
      g.strokeStyle = gv(.08); g.lineWidth = .03; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - w, cy + h * .1); g.quadraticCurveTo(cx, cy + h * .75, cx + w, cy); g.stroke();
    }
    sf(.015, () => { g.strokeStyle = gv(.3, .35); g.lineWidth = .014; g.beginPath(); g.moveTo(cx - w * .8, cy - h * 1.1); g.quadraticCurveTo(cx, cy - h * 1.75, cx + w * .9, cy - h * 1.2); g.stroke(); });
    g.restore();
  };
  eye(-.47, -.1, .12, .1, true);
  eye(.05, -.1, .19, .11, false);
  // brows: thin, arched, the inner ends lifted (sad)
  const br = o.brows || 0;
  g.strokeStyle = gv(.12, .9); g.lineCap = 'round';
  g.lineWidth = .03; g.beginPath(); g.moveTo(-.6, -.27); g.quadraticCurveTo(-.5, -.37 - br * .03, -.36, -.32 - br * .07); g.stroke();
  g.lineWidth = .034; g.beginPath(); g.moveTo(-.16, -.34 - br * .08); g.quadraticCurveTo(.05, -.42 - br * .03, .28, -.3); g.stroke();
  // mouth: small, soft, the corners a little down
  const mo = clamp(o.mouth || 0), mx = -.27, my = .56;
  g.fillStyle = gv(.4); g.beginPath(); g.moveTo(mx - .14, my + .01); g.quadraticCurveTo(mx - .06, my - .05, mx, my - .03); g.quadraticCurveTo(mx + .08, my - .06, mx + .19, my + .015);
  g.quadraticCurveTo(mx + .05, my + .02 + mo * .02, mx - .14, my + .01); g.fill();
  g.fillStyle = radG(g, mx + .02, my + .06, .005, .14, [[0, .62], [1, .44]], -.02, -.02);
  g.beginPath(); g.moveTo(mx - .13, my + .02 + mo * .03); g.quadraticCurveTo(mx + .02, my + .13 + mo * .04, mx + .18, my + .025 + mo * .03); g.quadraticCurveTo(mx + .03, my + .04 + mo * .04, mx - .13, my + .02 + mo * .03); g.fill();
  g.strokeStyle = gv(.12, .85); g.lineWidth = .016 + mo * .02; g.beginPath(); g.moveTo(mx - .14, my + .015); g.quadraticCurveTo(mx + .02, my + .025 + mo * .03, mx + .19, my + .02); g.stroke();
  g.fillStyle = gv(1, .3); ell(g, mx + .03, my + .075 + mo * .03, .05, .014); g.fill();
  // front hair: a short curled fringe swept off the forehead
  const FP = [[-.7, -.3], [-.74, -.62], [-.6, -.92], [-.3, -1.1], [.05, -1.12], [.32, -1.02], [.5, -.8], [.5, -.58], [.36, -.66], [.24, -.58], [.08, -.7], [-.08, -.62], [-.24, -.72], [-.4, -.6], [-.55, -.66], [-.62, -.46]];
  FP.forEach((p, i) => { p[1] += .012 * Math.sin(hairT * 2.3 + i); });
  blob(FP); g.fillStyle = radG(g, -.3, -.9, .02, .75, [[0, 1], [.6, .92], [1, .76]]); g.fill();
  g.save(); blob(FP); g.clip();
  sf(.02, () => { g.strokeStyle = gv(.5, .45); g.lineWidth = .025; blob(FP); g.stroke(); }); // light hair: a soft rim where the fringe meets the forehead
  sf(.05, () => { const R = mulberry(57); for (let i = 0; i < 14; i++) { const cx = -.62 + R() * 1.05, cy = -1.05 + R() * .4; g.fillStyle = gv(.52, .16 + .14 * R()); ell(g, cx, cy, .08, .05, R() * 3); g.fill(); } });
  g.restore();
  // tears: a thin glistening track down the near cheek, a small bead at its front
  const tear = (p, path) => {
    if (p <= 0) return;
    const N = 24, pts = [];
    for (let i = 0; i <= N; i++) pts.push(path(i / N * p));
    g.lineCap = 'round';
    sf(.008, () => { g.strokeStyle = gv(.3, .16); g.lineWidth = .02; g.beginPath(); pts.forEach(([px, py], i) => i ? g.lineTo(px + .01, py + .005) : g.moveTo(px + .01, py + .005)); g.stroke(); });
    g.strokeStyle = linG(g, 0, pts[0][1], 0, pts[N][1], [[0, 1, .25], [1, 1, .7]]); g.lineWidth = .011; g.beginPath(); pts.forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py)); g.stroke();
    const [hx, hy] = pts[N], d = .018 + .008 * Math.min(1, p * 3);
    g.fillStyle = gv(.45, .35); ell(g, hx + .005, hy + .007, d, d * 1.2); g.fill();
    g.fillStyle = radG(g, hx, hy, .001, d, [[0, 1, .95], [.6, .92, .7], [1, .8, .2]], -d * .3, -d * .4); ell(g, hx, hy, d * .85, d * 1.1); g.fill();
  };
  tear(o.tear || 0, (u) => [.03 + .07 * Math.sin(u * 2.2), -.02 + u * .7]);
  tear(o.tear2 || 0, (u) => [-.44 + .03 * u, -.03 + u * .5]);
  g.restore();
}

// The back of her head and shoulder, for the over-the-shoulder shot (she looks up into the sky, away from us).
function herBack(g, x, y, r, o = {}) {
  const sf = (b, fn) => { g.save(); g.filter = `blur(${Math.max(.1, b * r * RS + (o.soft || 0)).toFixed(2)}px)`; fn(); g.restore(); };
  const blob = (pts) => { g.beginPath(); const n = pts.length; g.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } g.closePath(); };
  g.save(); g.translate(x, y); g.scale(r, r);
  if (o.soft) g.filter = `blur(${o.soft.toFixed(2)}px)`;
  // coat shoulders and the round collar, from behind
  g.fillStyle = radG(g, -.5, 1.6, .1, 2.4, [[0, .97], [.6, .88], [1, .68]]);
  g.beginPath(); g.moveTo(-2.6, 3.4); g.bezierCurveTo(-2.3, 1.7, -1.2, 1.25, -.4, 1.1); g.lineTo(.6, 1.1); g.bezierCurveTo(1.4, 1.25, 2.3, 1.8, 2.6, 3.4); g.closePath(); g.fill();
  g.fillStyle = gv(.99); g.beginPath(); g.moveTo(-.8, 1.12); g.quadraticCurveTo(.05, .9, .9, 1.12); g.quadraticCurveTo(.05, 1.45, -.8, 1.12); g.fill();
  g.strokeStyle = gv(.65, .5); g.lineWidth = .02; g.beginPath(); g.moveTo(-.75, 1.15); g.quadraticCurveTo(.05, 1.42, .85, 1.15); g.stroke();
  // nape, then the head tipped back, turned away to the upper right
  g.fillStyle = linG(g, -.4, 0, .5, 0, [[0, .8], [1, .58]]); g.beginPath(); g.moveTo(-.38, .35); g.lineTo(-.42, 1.08); g.lineTo(.45, 1.08); g.lineTo(.42, .35); g.closePath(); g.fill();
  g.rotate(.25);
  // lost profile: the plane of her cheek and jaw past the hair on the right, the tip of the nose and her lashes beyond it
  g.fillStyle = radG(g, .8, 0, .02, .55, [[0, .88], [.7, .78], [1, .62]], -.15, -.15);
  g.beginPath(); g.moveTo(.5, -.55); g.quadraticCurveTo(.92, -.5, 1.0, -.22); g.quadraticCurveTo(1.04, -.05, 1.1, .02); g.quadraticCurveTo(1.08, .09, 1.02, .1);
  g.quadraticCurveTo(1.0, .35, .86, .55); g.quadraticCurveTo(.7, .72, .45, .7); g.lineTo(.35, .1); g.closePath(); g.fill();
  g.strokeStyle = gv(.1, .9); g.lineWidth = .025; g.lineCap = 'round'; g.beginPath(); g.moveTo(.97, -.27); g.lineTo(1.04, -.33); g.moveTo(.98, -.24); g.lineTo(1.06, -.27); g.stroke(); // lashes
  sf(.04, () => { g.fillStyle = gv(0, .25); ell(g, .7, .5, .25, .1, -.5); g.fill(); });
  // hair: short platinum curls, the crown lit by the sky
  const HP = [];
  for (let i = 0; i < 34; i++) { const a = Math.PI * (.62 + i / 34 * 2), rr = .98 + .045 * Math.sin(i * 2.9); HP.push([Math.cos(a) * rr * .92, -.12 + Math.sin(a) * rr * (Math.sin(a) > 0 ? .7 : 1)]); }
  blob(HP); g.fillStyle = radG(g, -.15, -.75, .05, 1.3, [[0, 1], [.45, .89], [1, .72]]); g.fill();
  sf(.02, () => { g.strokeStyle = gv(.52, .45); g.lineWidth = .025; blob(HP); g.stroke(); }); // pale hair: a soft darker rim
  g.save(); blob(HP); g.clip();
  sf(.05, () => { const R = mulberry(77); for (let i = 0; i < 44; i++) { const a = R() * TAU, rr = R() * .9; g.fillStyle = gv(.5, .1 + .18 * R() * (Math.sin(a) < 0 ? .5 : 1.5)); ell(g, Math.cos(a) * rr, -.12 + Math.sin(a) * rr, .08, .055, a); g.fill(); } });
  g.restore();
  g.fillStyle = radG(g, .55, .1, .01, .16, [[0, .74], [1, .48]], -.03, -.03); ell(g, .56, .12, .085, .15, .25); g.fill(); // ear
  g.strokeStyle = gv(.4, .5); g.lineWidth = .018; g.beginPath(); g.arc(.56, .1, .05, -1.4, 1.3); g.stroke();
  g.restore();
}

// ---------- the woman in white, full figure (the same costume as in js/dream: a belted white coat, round collar,
// dark stockings), facing the viewer's left. Origin at her feet, k = px per metre. o: up, hand (0..1 shading her eyes),
// gust, tt, look, tear ----------
function herFigure(g, x, y, k, o = {}) {
  const up = o.up || 0, hand = o.hand || 0, gust = o.gust || 0, tt = o.tt || 0;
  g.save(); g.translate(x, y); g.scale(k, k);
  const sf = (b, fn) => { g.save(); g.filter = `blur(${Math.max(.1, b * k * RS).toFixed(2)}px)`; fn(); g.restore(); };
  // her shadow on the sand, long to the right
  sf(.03, () => { g.fillStyle = gv(.3, .3); g.beginPath(); g.moveTo(-.12, 0); g.lineTo(.12, 0); g.lineTo(1.25, .18); g.lineTo(1.1, .24); g.closePath(); g.fill(); });
  // legs: dark stockings, lit edge on the left, small heeled shoes
  for (const [lx, v] of [[.055, .2], [-.045, .14]]) {
    g.fillStyle = linG(g, lx - .045, 0, lx + .045, 0, [[0, v + .2], [.4, v + .06], [1, v - .05]]);
    g.beginPath(); g.moveTo(lx - .05, -.46); g.quadraticCurveTo(lx - .062, -.3, lx - .03, -.17); g.quadraticCurveTo(lx - .03, -.1, lx - .022, -.06);
    g.lineTo(lx + .02, -.06); g.quadraticCurveTo(lx + .03, -.14, lx + .04, -.2); g.quadraticCurveTo(lx + .055, -.32, lx + .045, -.46); g.closePath(); g.fill();
    g.fillStyle = linG(g, 0, -.07, 0, 0, [[0, .2], [1, .03]]); g.beginPath(); g.moveTo(lx - .085, -.004); g.quadraticCurveTo(lx - .08, -.06, lx - .025, -.072); g.lineTo(lx + .028, -.065); g.lineTo(lx + .03, 0); g.closePath(); g.fill();
    g.fillStyle = gv(.8, .5); ell(g, lx - .05, -.045, .018, .006, -.3); g.fill();
  }
  // the coat: skirt flaring from the belt, hem lifting in the wind; modelled with soft shade on the right
  const hw = .02 * Math.sin(tt * 4.5) + gust * .09;
  const skirt = () => { g.beginPath(); g.moveTo(-.135, -1.0); g.lineTo(.135, -1.0); g.bezierCurveTo(.2, -.82, .25, -.62, .28 + hw, -.42 - gust * .05);
    g.quadraticCurveTo(.15, -.38 + .012 * Math.sin(tt * 6), .02, -.39); g.quadraticCurveTo(-.12, -.38, -.26 + hw * .4, -.43); g.bezierCurveTo(-.23, -.62, -.19, -.82, -.135, -1.0); g.closePath(); };
  skirt(); g.fillStyle = gv(.93); g.fill();
  g.save(); skirt(); g.clip();
  g.fillStyle = linG(g, -.26, 0, .3, 0, [[0, 1, .9], [.4, .95, .2], [.75, .68, .45], [1, .48, .75]]); g.fillRect(-.4, -1.1, .8, .8);
  sf(.02, () => { // folds falling from the belt: soft shadow troughs, lit ridges
    for (const [fx, d] of [[-.08, 1], [.05, .8], [.16, 1.2]]) { g.strokeStyle = gv(.45, .28 * d); g.lineWidth = .028; g.beginPath(); g.moveTo(fx * .6, -.98); g.quadraticCurveTo(fx * .9, -.7, fx * 1.4 + hw * .8, -.42); g.stroke(); }
    g.strokeStyle = gv(1, .7); g.lineWidth = .02; g.beginPath(); g.moveTo(-.04, -.98); g.quadraticCurveTo(-.08, -.7, -.12, -.42); g.stroke();
  });
  g.fillStyle = gv(.5, .25); g.fillRect(-.3, -.46, .7, .06); // under the hem
  g.restore();
  // bodice and shoulders
  const bod = () => { g.beginPath(); g.moveTo(-.04, -1.37); g.quadraticCurveTo(-.17, -1.35, -.185, -1.26); g.quadraticCurveTo(-.16, -1.1, -.135, -.98); g.lineTo(.135, -.98); g.quadraticCurveTo(.16, -1.1, .175, -1.26); g.quadraticCurveTo(.16, -1.35, .04, -1.37); g.closePath(); };
  bod(); g.fillStyle = gv(.95); g.fill();
  g.save(); bod(); g.clip(); g.fillStyle = linG(g, -.18, 0, .18, 0, [[0, 1, .8], [.5, .9, .2], [1, .6, .6]]); g.fillRect(-.2, -1.4, .4, .45);
  sf(.015, () => { g.fillStyle = gv(.5, .3); ell(g, .02, -1.12, .03, .1); g.fill(); }); g.restore();
  // belt with a covered buckle, three dark buttons
  g.fillStyle = linG(g, 0, -1.04, 0, -.99, [[0, .98], [1, .72]]); g.fillRect(-.14, -1.04, .28, .045);
  g.fillStyle = gv(.55); g.fillRect(-.022, -1.045, .044, .05);
  g.fillStyle = gv(.12); for (const by of [-1.25, -1.16, -.9, -.76]) { ell(g, .005, by, .011, .011); g.fill(); }
  // round white collar
  g.fillStyle = gv(1); g.beginPath(); g.moveTo(-.1, -1.37); g.quadraticCurveTo(-.09, -1.3, 0, -1.29); g.quadraticCurveTo(.09, -1.3, .1, -1.37); g.quadraticCurveTo(0, -1.41, -.1, -1.37); g.fill();
  g.strokeStyle = gv(.55, .5); g.lineWidth = .006; g.stroke();
  // far arm hanging along the coat
  g.strokeStyle = linG(g, .12, -1.3, .22, -.8, [[0, .82], [1, .6]]); g.lineWidth = .07; g.lineCap = 'round';
  g.beginPath(); g.moveTo(.14, -1.3); g.quadraticCurveTo(.2, -1.05, .18, -.84); g.stroke();
  g.fillStyle = gv(.78); ell(g, .18, -.8, .028, .04); g.fill();
  // head: the face, tipped back to the sky (she faces left)
  herFace(g, -.02 - up * .02, -1.5, .108, { up: up * .9, look: o.look || [-.4, -.9 * up - .1], brows: .6, tear: o.tear || 0, wet: o.wet || 0, hairT: tt, mouth: o.mouth || 0 });
  // the collar again over the base of her neck
  g.fillStyle = gv(1); g.beginPath(); g.moveTo(-.1, -1.37); g.quadraticCurveTo(-.09, -1.3, 0, -1.29); g.quadraticCurveTo(.09, -1.3, .1, -1.37); g.quadraticCurveTo(0, -1.41, -.1, -1.37); g.fill();
  g.strokeStyle = gv(.55, .5); g.lineWidth = .006; g.stroke();
  // near arm: down by her side, rising to shade her eyes (a mitten hand, palm down, its edge on the brow)
  const sx = -.15, sy = -1.3, ex = lerp(-.2, -.27, hand), ey = lerp(-1.05, -1.4, hand), hx = lerp(-.17, -.085, hand), hy = lerp(-.82, -1.565 - up * .01, hand);
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = gv(.5, .5); g.lineWidth = .08; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke();
  g.strokeStyle = linG(g, -.3, -1.5, -.1, -.9, [[0, .97], [1, .8]]); g.lineWidth = .068;
  g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke();
  g.fillStyle = gv(.84); g.save(); g.translate(hx, hy); g.rotate(lerp(0, -1.45, hand)); ell(g, 0, .015, .028, .05); g.fill(); g.fillStyle = gv(.5, .5); ell(g, .014, .015, .01, .042); g.fill(); g.restore();
  g.restore();
}

// ---------- horse and rider, side view, facing right; origin on the ground under the girth; k = px per metre ----------
// A dark bay horse modelled by a high sun: lit back, crest and quarters, sheen on the shoulder and the round of the
// hindquarter, dark belly and legs. o: yank (0..1 rope arm hauled back), toss (0..1 head up), step (0..1 a fore and a
// hind leg lifting), tail (sway), rope (true: returns the hand point), lift (0..1 rope hand reaching up)
function horseRider(g, x, y, k, o = {}) {
  g.save(); g.translate(x, y); g.scale(k, k);
  const yank = o.yank || 0, toss = o.toss || 0, st = o.step || 0, tt = o.tt || 0;
  const sf = (b, fn) => { g.save(); g.filter = `blur(${Math.max(.1, b * k * RS).toFixed(2)}px)`; fn(); g.restore(); };
  const HC = .2;           // coat value
  // shadow on the sand, down and to the right
  sf(.05, () => { g.fillStyle = gv(.2, .35); ell(g, .35, .02, 1.25, .1, .03); g.fill(); });
  // ---- legs: [hip/elbow x, y], knee/hock, fetlock, hoof; far pair darker and drawn first ----
  // a leg as a chain of [x, y, width] points (smoothed outline), ending in a hoof
  const leg = (pts, v, lit) => {
    const L = [], R = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[Math.max(0, i - 1)], q = pts[Math.min(pts.length - 1, i + 1)], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1;
      const nx = -dy / l, ny = dx / l, w = pts[i][2] / 2; L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
    }
    const ring = L.concat(R.reverse());
    g.beginPath(); g.moveTo(ring[0][0], ring[0][1]);
    for (let i = 1; i < ring.length - 1; i++) { const m = [(ring[i][0] + ring[i + 1][0]) / 2, (ring[i][1] + ring[i + 1][1]) / 2]; g.quadraticCurveTo(ring[i][0], ring[i][1], m[0], m[1]); }
    g.lineTo(ring[ring.length - 1][0], ring[ring.length - 1][1]); g.closePath();
    const top = pts[0], w0 = top[2];
    g.fillStyle = linG(g, top[0] - w0, 0, top[0] + w0, 0, [[0, v + (lit ? .2 : .06)], [.45, v], [1, v - .06]]); g.fill();
    const h = pts[pts.length - 1], f = pts[pts.length - 2], ang = Math.atan2(h[1] - f[1], h[0] - f[0]);
    g.save(); g.translate(h[0], h[1]); g.rotate(ang - Math.PI / 2 - .25);
    g.fillStyle = gv(.05); g.beginPath(); g.moveTo(-.05, -.07); g.lineTo(.045, -.07); g.lineTo(.07, .02); g.lineTo(-.065, .02); g.closePath(); g.fill(); g.restore();
    if (lit) { g.strokeStyle = gv(.6, .35); g.lineWidth = .012; g.beginPath(); g.moveTo(pts[1][0] - pts[1][2] * .4, pts[1][1]); for (let i = 2; i < pts.length - 1; i++) g.lineTo(pts[i][0] - pts[i][2] * .4, pts[i][1]); g.stroke(); }
  };
  // foreleg: forearm, knee, cannon, fetlock, pastern; lift folds it at the knee
  const fore = (bx, lift, v, lit) => {
    const kx = bx + .03 + lift * .1, ky = -.52 + lift * .14, c = -lift * 1.9;
    const seg = (d, a) => [kx + Math.sin(a) * d, ky + Math.cos(a) * d];
    const p2 = seg(.22, c), p3 = seg(.39, c), p4 = [p3[0] + Math.sin(c + .45) * .13, p3[1] + Math.cos(c + .45) * .13];
    leg([[bx, -1.0, .2], [bx + .02, -.78, .15], [kx, ky, .11], [p2[0], p2[1], .066], [p3[0], p3[1], .09], [p4[0], p4[1], .075]], v, lit);
  };
  // hind leg: gaskin back to the hock, cannon down, fetlock, pastern
  const hind = (bx, lift, v, lit) => {
    const hx = bx - .2 + lift * .02, hy = -.52 + lift * .1, c = lift * .9;
    const seg = (d, a) => [hx + Math.sin(a) * d, hy + Math.cos(a) * d];
    const p2 = seg(.22, c), p3 = seg(.39, c), p4 = [p3[0] + Math.sin(c + .45) * .13, p3[1] + Math.cos(c + .45) * .13];
    leg([[bx, -1.02, .28], [bx - .12, -.74, .15], [hx, hy, .1], [p2[0], p2[1], .066], [p3[0], p3[1], .09], [p4[0], p4[1], .075]], v, lit);
  };
  fore(.62, st * .0, HC - .08, false); hind(-.5, st * .7, HC - .08, false);
  // ---- tail: a dark fall of hair from the croup, swinging ----
  const sw = .06 * Math.sin(tt * 2.1) + (o.tail || 0);
  g.fillStyle = linG(g, -.9, -1.5, -1.1, -.5, [[0, .14], [1, .04]]);
  g.beginPath(); g.moveTo(-.84, -1.48); g.bezierCurveTo(-1.02, -1.3, -1.02 + sw, -.95, -.98 + sw * 1.6, -.58); g.lineTo(-.9 + sw * 1.5, -.6);
  g.bezierCurveTo(-.9 + sw, -.95, -.86, -1.25, -.76, -1.42); g.closePath(); g.fill();
  g.strokeStyle = gv(.4, .3); g.lineWidth = .01; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-.86 - i * .02, -1.4); g.quadraticCurveTo(-.97 - i * .01 + sw * .5, -1.0, -.94 + sw * 1.5 - i * .015, -.62); g.stroke(); }
  // ---- neck and head, turning about the withers on the toss ----
  g.save(); g.translate(.42, -1.45); g.rotate(-toss * .3); g.translate(-.42, 1.45);
  const neck = () => { g.beginPath(); g.moveTo(.22, -1.58); g.bezierCurveTo(.55, -1.72, .8, -2.0, 1.02, -2.17); // crest
    g.quadraticCurveTo(1.12, -2.24, 1.2, -2.18);                                                         // poll
    g.bezierCurveTo(1.32, -2.1, 1.48, -1.9, 1.6, -1.74); g.quadraticCurveTo(1.66, -1.66, 1.6, -1.6);     // face, muzzle
    g.quadraticCurveTo(1.5, -1.55, 1.38, -1.62); g.bezierCurveTo(1.3, -1.66, 1.22, -1.72, 1.15, -1.82);  // chin, jaw
    g.quadraticCurveTo(1.06, -1.82, 1.0, -1.72); g.bezierCurveTo(.92, -1.5, .9, -1.3, .84, -1.12);       // throat to chest
    g.lineTo(.3, -1.1); g.closePath(); };
  neck(); g.fillStyle = gv(HC); g.fill();
  g.save(); neck(); g.clip();
  g.fillStyle = linG(g, .75, -2.15, 1.0, -1.4, [[0, .55], [.3, .3], [.7, .16], [1, .08]]); g.fillRect(0, -2.4, 1.8, 1.4);
  sf(.04, () => { g.fillStyle = gv(.6, .32); ell(g, 1.33, -1.98, .07, .16, -.6); g.fill(); ell(g, .8, -1.72, .2, .07, -.8); g.fill(); }); // forehead plane, neck muscle
  sf(.03, () => { g.fillStyle = gv(0, .35); ell(g, 1.2, -1.74, .12, .07, -.3); g.fill(); }); // the hollow under the cheek
  g.fillStyle = gv(.3, .7); ell(g, 1.25, -1.82, .09, .07, -.4); g.fill(); g.fillStyle = gv(.12, .6); ell(g, 1.28, -1.8, .06, .045, -.4); g.fill(); // cheek
  g.restore();
  // ears, eye, nostril, mouth, forelock
  g.fillStyle = gv(.14); g.beginPath(); g.moveTo(1.08, -2.18); g.quadraticCurveTo(1.1, -2.34, 1.15, -2.38); g.quadraticCurveTo(1.19, -2.28, 1.18, -2.18); g.closePath(); g.fill();
  g.fillStyle = gv(.08); g.beginPath(); g.moveTo(1.03, -2.17); g.quadraticCurveTo(1.03, -2.3, 1.07, -2.34); g.quadraticCurveTo(1.1, -2.25, 1.1, -2.17); g.closePath(); g.fill();
  g.fillStyle = gv(.03); ell(g, 1.27, -2.0, .03, .022, -.5); g.fill(); g.fillStyle = gv(.9); ell(g, 1.262, -2.008, .008, .006); g.fill();
  g.fillStyle = gv(.04); ell(g, 1.57, -1.69, .025, .016, -.7); g.fill();
  g.strokeStyle = gv(.06); g.lineWidth = .012; g.beginPath(); g.moveTo(1.6, -1.61); g.quadraticCurveTo(1.53, -1.6, 1.5, -1.63); g.stroke();
  g.fillStyle = gv(.06); g.beginPath(); g.moveTo(1.15, -2.2); g.quadraticCurveTo(1.25, -2.18, 1.28, -2.08); g.quadraticCurveTo(1.2, -2.12, 1.14, -2.12); g.closePath(); g.fill();
  // mane along the crest
  g.fillStyle = gv(.05); g.beginPath(); g.moveTo(.22, -1.6); g.bezierCurveTo(.55, -1.76, .82, -2.03, 1.06, -2.2); g.lineTo(1.02, -2.12);
  for (let i = 0; i <= 8; i++) { const u = 1 - i / 8, px = lerp(.24, 1.0, u), py = lerp(-1.53, -2.07, u) + .02 * Math.sin(tt * 3 + i); g.lineTo(px - .04 - (i % 2) * .03, py + .06 + (i % 2) * .03); }
  g.closePath(); g.fill();
  // bridle: cheek strap, noseband, browband
  g.strokeStyle = gv(.04); g.lineWidth = .02; g.beginPath(); g.moveTo(1.16, -2.16); g.lineTo(1.4, -1.7); g.moveTo(1.38, -1.82); g.lineTo(1.58, -1.82); g.moveTo(1.15, -2.12); g.lineTo(1.3, -2.12); g.stroke();
  const bit = [1.47, -1.66];
  g.restore();
  // ---- body: barrel, withers, croup, the round of the hindquarter ----
  const body = () => { g.beginPath(); g.moveTo(.82, -1.15);
    g.bezierCurveTo(.8, -1.42, .55, -1.6, .3, -1.6);                 // chest, shoulder up to the withers
    g.bezierCurveTo(.05, -1.56, -.25, -1.54, -.45, -1.6);            // back, loins
    g.bezierCurveTo(-.65, -1.66, -.82, -1.6, -.9, -1.46);            // croup
    g.bezierCurveTo(-.96, -1.3, -.9, -1.12, -.74, -1.02);            // buttock, back of the thigh
    g.quadraticCurveTo(-.66, -.82, -.62, -.62);                      // gaskin
    g.lineTo(-.44, -.66); g.quadraticCurveTo(-.42, -.88, -.4, -.98);  // stifle
    g.bezierCurveTo(-.1, -.92, .2, -.92, .48, -.96);                 // belly
    g.quadraticCurveTo(.56, -.8, .55, -.62); g.lineTo(.72, -.62); g.quadraticCurveTo(.76, -.84, .82, -1.15); g.closePath(); };
  body(); g.fillStyle = gv(HC); g.fill();
  g.save(); body(); g.clip();
  g.fillStyle = linG(g, 0, -1.68, 0, -.9, [[0, .6], [.2, .32], [.65, .14], [1, .05]]); g.fillRect(-1.1, -1.8, 2.1, 1.3);
  sf(.06, () => {
    g.fillStyle = gv(.7, .5); ell(g, -.64, -1.38, .19, .16); g.fill();  // the round of the quarter
    g.fillStyle = gv(.66, .42); ell(g, .56, -1.32, .13, .19, .3); g.fill(); // shoulder
    g.fillStyle = gv(.62, .3); ell(g, .66, -1.12, .07, .1); g.fill();   // forearm top
    g.fillStyle = gv(.5, .22); ell(g, 0, -1.42, .4, .07); g.fill();      // ribs catching the light
  });
  sf(.04, () => { g.strokeStyle = gv(0, .35); g.lineWidth = .05; g.beginPath(); g.moveTo(.38, -1.48); g.quadraticCurveTo(.3, -1.2, .4, -.98); g.stroke(); // behind the shoulder
    g.beginPath(); g.moveTo(-.38, -1.45); g.quadraticCurveTo(-.45, -1.15, -.42, -.98); g.stroke(); }); // the flank line
  g.restore();
  // near legs over the body
  fore(.66, st * .8, HC, true); hind(-.56, 0, HC, true);
  // saddle and girth
  g.fillStyle = linG(g, 0, -1.7, 0, -1.48, [[0, .3], [1, .08]]); g.beginPath(); g.moveTo(-.22, -1.57); g.quadraticCurveTo(-.25, -1.7, -.17, -1.69); g.quadraticCurveTo(0, -1.6, .22, -1.66); g.quadraticCurveTo(.3, -1.66, .27, -1.56); g.quadraticCurveTo(0, -1.52, -.22, -1.57); g.fill();
  g.fillStyle = gv(.1); g.beginPath(); g.moveTo(-.15, -1.56); g.lineTo(.18, -1.56); g.lineTo(.15, -1.3); g.lineTo(-.1, -1.3); g.closePath(); g.fill(); // flap
  g.fillStyle = gv(.07); g.fillRect(.04, -1.32, .05, .36); // girth
  // ---- rider: seated, dark coat and trousers, boots, a hat ----
  const hipX = 0, hipY = -1.62, lean = -yank * .12;
  // near leg: thigh forward to the knee, shin down to the stirrup, boot
  g.fillStyle = linG(g, 0, -1.6, 0, -1.0, [[0, .2], [1, .06]]);
  g.beginPath(); g.moveTo(hipX - .1, hipY + .02); g.quadraticCurveTo(.12, -1.58, .28, -1.42); g.lineTo(.27, -1.3); g.lineTo(.2, -1.04); g.lineTo(.08, -1.04); g.lineTo(.15, -1.32); g.quadraticCurveTo(.0, -1.42, -.1, -1.45); g.closePath(); g.fill();
  g.fillStyle = gv(.04); g.beginPath(); g.moveTo(.07, -1.1); g.lineTo(.22, -1.1); g.lineTo(.3, -.98); g.lineTo(.05, -.98); g.closePath(); g.fill(); g.fillStyle = gv(.7, .6); g.fillRect(.08, -1.09, .1, .012);
  g.save(); g.translate(hipX, hipY); g.rotate(lean);
  // torso: coat, lit on the left
  g.fillStyle = linG(g, -.2, 0, .2, 0, [[0, .34], [.4, .16], [1, .05]]);
  g.beginPath(); g.moveTo(-.16, .02); g.quadraticCurveTo(-.2, -.3, -.15, -.62); g.quadraticCurveTo(0, -.7, .15, -.62); g.quadraticCurveTo(.2, -.3, .16, .02); g.quadraticCurveTo(0, .06, -.16, .02); g.fill();
  g.fillStyle = gv(.85); poly(g, [[.02, -.66], [.1, -.64], [.06, -.52]]); g.fill(); // collar
  // head: three-quarter right, hat brim shading the face
  g.fillStyle = radG(g, .03, -.76, .01, .1, [[0, .82], [1, .55]], -.03, -.02); ell(g, .03, -.76, .075, .095); g.fill();
  g.fillStyle = gv(.2, .5); ell(g, .07, -.72, .035, .02); g.fill();
  g.fillStyle = gv(.05); ell(g, .03, -.84, .16, .03); g.fill(); g.beginPath(); g.moveTo(-.07, -.85); g.lineTo(-.06, -.97); g.quadraticCurveTo(.03, -1.0, .12, -.97); g.lineTo(.13, -.85); g.closePath(); g.fill();
  g.fillStyle = gv(.3); g.fillRect(-.07, -.88, .2, .02);
  // the rein hand low in front, the rope hand up (hauled back and down on the yank)
  const sh = [.06, -.58], rein = [.34, -.12];
  g.strokeStyle = linG(g, 0, -.6, 0, 0, [[0, .16], [1, .08]]); g.lineWidth = .085; g.lineCap = 'round';
  g.beginPath(); g.moveTo(sh[0], sh[1]); g.quadraticCurveTo(.2, -.35, rein[0], rein[1]); g.stroke();
  g.fillStyle = gv(.8); ell(g, rein[0] + .02, rein[1], .045, .035); g.fill();
  const hx = lerp(.32, -.38, yank) + (o.lift || 0) * .05, hy = lerp(-1.22, -.62, yank) - (o.lift || 0) * .1, elx = lerp(.2, -.18, yank), ely = lerp(-.88, -.4, yank);
  g.strokeStyle = linG(g, 0, -1.2, 0, -.5, [[0, .3], [1, .1]]); g.lineWidth = .09;
  g.beginPath(); g.moveTo(-.05, -.58); g.quadraticCurveTo(elx, ely, hx, hy); g.stroke();
  g.fillStyle = gv(.82); ell(g, hx, hy, .05, .045); g.fill();
  g.restore();
  // reins from the bit to the rein hand
  const rot = (px, py) => [hipX + Math.cos(lean) * px - Math.sin(lean) * py, hipY + Math.sin(lean) * px + Math.cos(lean) * py];
  const rh = rot(rein[0], rein[1]), ta = -toss * .3;
  const tb = [.42 + (bit[0] - .42) * Math.cos(ta) - (bit[1] + 1.45) * Math.sin(ta), -1.45 + (bit[0] - .42) * Math.sin(ta) + (bit[1] + 1.45) * Math.cos(ta)];
  g.strokeStyle = gv(.05); g.lineWidth = .012; g.beginPath(); g.moveTo(rh[0], rh[1]);
  g.quadraticCurveTo((rh[0] + tb[0]) / 2, Math.max(rh[1], tb[1]) + .12, tb[0], tb[1]); g.stroke();
  g.restore();
  const hp = rot(hx, hy);
  return [x + hp[0] * k, y + hp[1] * k]; // where the rope leaves his hand, frame units
}

// ---------- a beach-goer, small, facing us (three-quarter), applauding. Origin at the feet, k = px per metre. ----------
// o: kind ('man' suit + hat | 'woman' light dress | 'girl' pale dress), tone (garment value), clap (time for the clap
// phase, or null = hands down), turn (-1..1), hat
function beachGoer(g, x, y, k, o = {}) {
  g.save(); g.translate(x, y); g.scale(k, k);
  const man = o.kind === 'man', tone = o.tone ?? (man ? .12 : .9), turn = o.turn || 0, sf = (b, fn) => { g.save(); g.filter = `blur(${Math.max(.1, b * k * RS).toFixed(2)}px)`; fn(); g.restore(); };
  sf(.03, () => { g.fillStyle = gv(.3, .3); ell(g, .35, .02, .45, .06, .05); g.fill(); }); // shadow to the right
  // legs
  if (man) { g.fillStyle = linG(g, -.15, 0, .15, 0, [[0, tone + .14], [1, tone - .04]]); g.fillRect(-.14, -.85, .12, .85); g.fillRect(.02, -.85, .12, .85); g.fillStyle = gv(.04); g.fillRect(-.16, -.05, .15, .05); g.fillRect(.01, -.05, .15, .05); }
  else { g.fillStyle = gv(.6); g.fillRect(-.1, -.5, .06, .5); g.fillRect(.04, -.5, .06, .5); g.fillStyle = gv(.1); g.fillRect(-.12, -.04, .1, .04); g.fillRect(.03, -.04, .1, .04); }
  // body: jacket / dress, lit on the left
  g.fillStyle = linG(g, -.25, 0, .25, 0, [[0, clamp(tone + .2)], [.5, tone], [1, clamp(tone - .18)]]);
  g.beginPath();
  if (man) { g.moveTo(-.2, -.8); g.lineTo(-.22, -1.36); g.quadraticCurveTo(0, -1.44, .22, -1.36); g.lineTo(.2, -.8); g.closePath(); }
  else { g.moveTo(-.3, -.48); g.quadraticCurveTo(-.18, -.9, -.15, -1.0); g.lineTo(-.17, -1.33); g.quadraticCurveTo(0, -1.4, .17, -1.33); g.lineTo(.15, -1.0); g.quadraticCurveTo(.18, -.9, .3, -.48); g.quadraticCurveTo(0, -.44, -.3, -.48); }
  g.fill();
  if (man) { g.fillStyle = gv(.9); poly(g, [[-.05, -1.38], [.05, -1.38], [0, -1.2]]); g.fill(); g.fillStyle = gv(.05); g.fillRect(-.012, -1.36, .024, .14); }
  // arms: applauding, hands meeting in front of the chest, palm to palm (or down)
  const ph = o.clap == null ? -1 : o.clap;
  const open = ph < 0 ? 0 : .5 + .5 * Math.cos(ph * TAU);
  for (const s of [-1, 1]) {
    const shx = s * .2, shy = -1.3;
    const hx = ph < 0 ? s * .24 : s * (.025 + .085 * open) + turn * .05, hy = ph < 0 ? -.8 : -1.15 - .02 * open;
    const elx = s * .26, ely = ph < 0 ? -1.05 : -1.02;
    g.strokeStyle = gv(clamp(tone + (s < 0 ? .15 : -.08))); g.lineWidth = .085; g.lineCap = 'round';
    g.beginPath(); g.moveTo(shx, shy); g.quadraticCurveTo(elx, ely, hx, hy); g.stroke();
    g.fillStyle = gv(s < 0 ? .86 : .72); g.save(); g.translate(hx, hy); g.rotate(ph < 0 ? 0 : -s * .15); ell(g, 0, -.02, .028, .055); g.fill(); g.restore();
  }
  // head
  g.fillStyle = gv(.66); g.fillRect(-.035, -1.48, .07, .08);
  g.fillStyle = radG(g, turn * .03, -1.56, .01, .12, [[0, .88], [.7, .7], [1, .5]], -.04, -.04); ell(g, turn * .03, -1.56, .085, .105); g.fill();
  g.fillStyle = gv(.2, .5); ell(g, turn * .05 - .02, -1.56, .012, .01); g.fill(); ell(g, turn * .05 + .03, -1.56, .012, .01); g.fill();
  if (man && o.hat !== false) { g.fillStyle = gv(.06); ell(g, turn * .03, -1.64, .14, .028); g.fill(); g.fillRect(turn * .03 - .085, -1.76, .17, .12); g.fillStyle = gv(.4); g.fillRect(turn * .03 - .085, -1.67, .17, .02); }
  else if (man) { g.fillStyle = gv(.1); g.beginPath(); g.arc(turn * .03, -1.58, .09, Math.PI * 1.05, Math.PI * 1.95); g.fill(); }
  else { g.fillStyle = gv(.08); g.beginPath(); g.arc(turn * .03, -1.58, .1, Math.PI * .9, Math.PI * 2.1); g.fill(); ell(g, turn * .03 + .06, -1.5, .05, .07); g.fill(); }
  g.restore();
}

// A press photographer: dark suit and hat, a box camera at his face, the round flash reflector held up beside it.
// flash 0..1 (the bulb firing). Returns the reflector centre in frame units.
function photographer(g, x, y, k, flash = 0, face = 1) {
  g.save(); g.translate(x, y); g.scale(k, k);
  g.fillStyle = gv(.3, .3); ell(g, .3, .02, .4, .05); g.fill();
  g.fillStyle = gv(.1); g.fillRect(-.14, -.85, .12, .85); g.fillRect(.02, -.85, .12, .85);
  g.fillStyle = linG(g, -.25, 0, .25, 0, [[0, .3], [.5, .12], [1, .05]]); g.beginPath(); g.moveTo(-.21, -.8); g.lineTo(-.23, -1.36); g.quadraticCurveTo(0, -1.44, .23, -1.36); g.lineTo(.21, -.8); g.closePath(); g.fill();
  g.fillStyle = radG(g, 0, -1.56, .01, .12, [[0, .84], [1, .5]], -.04, -.04); ell(g, 0, -1.56, .085, .105); g.fill();
  g.fillStyle = gv(.06); ell(g, 0, -1.64, .14, .028); g.fill(); g.fillRect(-.085, -1.76, .17, .12);
  // camera block at the face, bellows front facing us
  const cx = face * .02, cy = -1.5;
  g.fillStyle = gv(.08); g.fillRect(cx - .12, cy - .09, .24, .18); g.fillStyle = gv(.3); g.fillRect(cx - .08, cy - .06, .16, .12);
  g.fillStyle = radG(g, cx, cy, .005, .05, [[0, .7], [1, .05]], -.01, -.01); ell(g, cx, cy, .045, .045); g.fill();
  g.strokeStyle = gv(.15); g.lineWidth = .07; g.lineCap = 'round'; g.beginPath(); g.moveTo(-.2, -1.32); g.lineTo(cx - .12, cy + .05); g.moveTo(.2, -1.32); g.lineTo(.28, -1.55); g.stroke();
  // reflector dish up to the right of the camera, the bulb at its centre
  const rx = .3, ry = -1.68;
  g.fillStyle = radG(g, rx, ry, .01, .14, [[0, .98], [.6, .82], [1, .55]], -.03, -.03); ell(g, rx, ry, .14, .14); g.fill();
  g.strokeStyle = gv(.4); g.lineWidth = .012; ell(g, rx, ry, .14, .14); g.stroke();
  if (flash > 0) { g.fillStyle = gv(1, flash); ell(g, rx, ry, .13, .13); g.fill(); }
  g.restore();
  return [x + rx * k, y + ry * k];
}
