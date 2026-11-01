// Reform Party, Dali look, draft 37: the two stilt walkers from Robin's photo (source/refs/robin-2026-10-18/27-28.jpg),
// drawn whole and close up for the "without spin" cameo (rapper.js spinDivas). playa.js's bmStilter is the far-off
// crowd sketch of the same pair; this is the near drawing, at the horse diva's finish: rounded flat shapes with a thin
// dark outline, a light side, faces that sing. Measured off the photo, in metres above the playa (each stands about
// 2.8 m tall on her stilts, knees near half height):
// j 0, the rainbow walker: short black peg stilts splayed in an A, taped, under black boots (foot plate 0.86); bell-
//   bottom tights in bold rainbow stripes with dark seams; a big purple fin curling round the outside of each lower leg
//   and a pink fin pointing down off the right shin, white polka dots; an asymmetric top: a panel of rainbow stripes
//   that curve with its S-shaped hem, from her right shoulder across the chest to a tail flicking out at the left hip,
//   silver piping along the hem and an orange fringe outside it; navy lining with an orange fringe down her left side
//   above the waist; an orange fringe epaulette with hanging silver tubes on the right shoulder; bare arms; short blonde
//   hair under a crown of big yellow, green, orange and red flowers.
// j 1, the purple walker: grey stilt pegs in pink socks; one big kite-shaped stilt cover from the knees, widest two
//   thirds of the way down with a pink hoop round it, pink piping on its edges and a pink seam down the front, closing
//   to the two socks; bare thighs; purple hot pants with a thick pink waistband; bare midriff; a cropped purple sequin
//   jacket: puffed cap sleeves with ragged hems, pink piping from the collar down a deep V to a pink tie under the bust,
//   then on along the open fronts, which flare out and down into long pointed tails curling up at the hips, tattered
//   strips at the back hem; long pink gloves, a fringe hanging off the raised one; a messy shock of magenta hair.
// (x0, y0): the screen point of the playa under her; k px per metre; s 1 as in the photo, -1 mirrored; mouth 0..1;
// wave 0..1 raises the arm on the photo's right; t drives the small motion only.
function stiltWoman(j, x0, y0, k, s, t, mouth = 0, wave = 0) {
  const pt = (p) => [x0 + s * p[0] * k, y0 - p[1] * k];
  const ink = 'rgba(34,16,30,.9)', lw = Math.max(1, .008 * k);
  // a closed shape through pts, rounded at every point except those marked sharp ([x, y, 1])
  const shape = (pts) => { const n = pts.length, q = pts.map(pt), mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; g.beginPath();
    const st = pts[0][2] ? q[0] : mid(q[n - 1], q[0]); g.moveTo(st[0], st[1]);
    for (let i = 0; i < n; i++) { const c = q[i], nx = mid(c, q[(i + 1) % n]); if (pts[i][2]) { g.lineTo(c[0], c[1]); if (!pts[(i + 1) % n][2]) g.lineTo(nx[0], nx[1]); } else g.quadraticCurveTo(c[0], c[1], nx[0], nx[1]); } g.closePath(); };
  const fillS = (pts, fill, stroke) => { shape(pts); g.fillStyle = fill; g.fill(); if (stroke !== false) { g.strokeStyle = stroke || ink; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } };
  const lg = (a, b, cols) => { const A = pt(a), B = pt(b), gr = g.createLinearGradient(A[0], A[1], B[0], B[1]); cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1), c)); return gr; };
  const line = (pts, w, col, cap = 'round') => { const q = pts.map(pt); g.lineCap = cap; g.lineJoin = 'round'; g.strokeStyle = col; g.lineWidth = Math.max(1, w * k); g.beginPath(); q.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); };
  const dot = (p, r, fill, stroke) => { const q = pt(p); g.beginPath(); g.arc(q[0], q[1], Math.max(.6, r * k), 0, TAU); g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
  const oval = (p, rx, ry, fill, stroke) => { const q = pt(p); g.beginPath(); g.ellipse(q[0], q[1], rx * k, ry * k, 0, 0, TAU); g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
  const clipTo = (pts, f) => { g.save(); shape(pts); g.clip(); f(); g.restore(); };
  const qd = (a, c, b, n = 8) => { const o = []; for (let i = 0; i <= n; i++) { const u = i / n; o.push([(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]]); } return o; };
  // tongues of fringe hanging off a polyline on its side sd (+1 left of the walking direction, -1 right)
  const fringe = (pts, len, cols, sd, droop = .5) => { let n = 0; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      let nx = -dy / L * sd, ny = dx / L * sd; nx = lerp(nx, 0, droop); ny = lerp(ny, -1, droop); const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      for (let m = 0; m < 3; m++, n++) { const u = (m + .5) / 3, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u), w = L / 3 * .75, sw = Math.sin(t * 6 + n * 1.3) * .006, l = len * (.75 + .5 * rnd(n, j, 9));
        fillS([[x - dx / L * w, y - dy / L * w], [x + nx * l + sw, y + ny * l, 1], [x + dx / L * w, y + dy / L * w]], cols[n % cols.length], false); } } };
  // a tapered limb: shoulder, elbow, wrist, widths at each
  const limb = (a, b, c, wa, wb, wc, fill) => { const side = (p, q, w, sd) => { const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1; return [p[0] - dy / L * w * sd, p[1] + dx / L * w * sd]; };
    fillS([side(a, b, wa, 1), side(b, c, wb, 1), side(c, b, wc, -1), [c[0] + (c[0] - b[0]) * .08, c[1] + (c[1] - b[1]) * .08], side(c, b, wc, 1), side(b, c, wb, -1), side(a, b, wa, -1)], fill); };
  const hand = (c, b, fill) => { const dx = c[0] - b[0], dy = c[1] - b[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, h = [c[0] + ux * .045, c[1] + uy * .045];
    fillS([[c[0] - uy * .025, c[1] + ux * .025], [h[0] - uy * .03 + ux * .03, h[1] + ux * .03 + uy * .03], [h[0] + ux * .04, h[1] + uy * .04], [h[0] + uy * .03 + ux * .02, h[1] - ux * .03 + uy * .02], [c[0] + uy * .025, c[1] - ux * .025]], fill); };
  const skin = j ? '#f0d2bc' : '#f2d8c2', skinD = j ? '#d4a68e' : '#d9b49a', skinG = (a, b) => lg(a, b, [skinD, skin, '#fbe8da']);
  const sway = Math.sin(t * 2.1 + j) * .008;
  const face = (h) => { // the head, front on: eyes shut and happy, cheeks, nose, a singing mouth
    oval(h, .085, .108, lg([h[0] - .09, h[1]], [h[0] + .09, h[1]], [skinD, skin, '#fff2e6']), ink);
    for (const ex of [-.032, .034]) { const q = pt([h[0] + ex, h[1] + .012]); g.strokeStyle = '#2a1712'; g.lineWidth = Math.max(1, .009 * k); g.lineCap = 'round'; g.beginPath(); g.arc(q[0], q[1], .016 * k, Math.PI * 1.12, Math.PI * 1.88); g.stroke(); }
    oval([h[0] - .046, h[1] - .024], .019, .012, 'rgba(240,110,120,.45)'); oval([h[0] + .048, h[1] - .024], .018, .012, 'rgba(240,110,120,.45)');
    line([[h[0] + .003, h[1]], [h[0] + .011, h[1] - .024], [h[0], h[1] - .029]], .006, skinD);
    const mo = clamp(mouth); if (mo > .05) { oval([h[0] + .003, h[1] - .06], .019, .009 + .019 * mo, '#7a1f2a', '#4a1018'); oval([h[0] + .003, h[1] - .06 - .009 * mo], .011, .005 * mo, '#e8828a'); }
    else line(qd([h[0] - .017, h[1] - .056], [h[0] + .003, h[1] - .068], [h[0] + .023, h[1] - .056], 4), .007, '#a8424e'); };
  if (j === 0) {
    const RAIN = ['#e8452f', '#f2d040', '#5fbf4a', '#3f86d8', '#8a52d0', '#e85aa8', '#ee9a42'], SEAM = '#16162a', NAVY = '#1c2248';
    const mir = (L) => L.map(([x, y, f]) => [-x, y, f]);
    // stilts: straight black poles, taped near the foot, rubber feet, under black boots
    for (const sd of [-1, 1]) { const a = [sd * .075, .88], b = [sd * .1, 0]; line([a, b], .032, '#141216', 'butt');
      for (const [u, c] of [[.8, '#ff5fb8'], [.85, '#f2d040'], [.9, '#5fbf4a']]) line([[lerp(a[0], b[0], u), lerp(a[1], b[1], u)], [lerp(a[0], b[0], u + .04), lerp(a[1], b[1], u + .04)]], .04, c, 'butt');
      oval([b[0], .014], .026, .014, '#f2efe8', ink); fillS([[sd * .02, .95], [sd * .14, .94], [sd * .15, .86, 1], [sd * .02, .86, 1]], '#18161a'); }
    // tights in bold stripes, straight legs with a little flare at the cuff
    const legL = [[-.17, 1.96], [-.008, 1.93], [-.025, 1.5], [-.03, 1.12], [-.02, .92, 1], [-.2, .92, 1], [-.16, 1.12], [-.15, 1.5], [-.17, 1.78]];
    for (const L of [legL, mir(legL)]) { fillS(L, SEAM); clipTo(L, () => { for (let i = 0; i < 26; i++) { const y = .9 + i * .037; fillS([[-.4, y + .007, 1], [.4, y + .007, 1], [.4, y + .03, 1], [-.4, y + .03, 1]], RAIN[i % 7], false); } }); fillS(L, 'rgba(0,0,0,0)'); }
    // the fins, mirrored on both legs: a big purple one out to the side from the knee, a pink one below it, white dots on their edges
    for (const sd of [-1, 1]) {
      fillS([[sd * .14, 1.4], [sd * .24, 1.24], [sd * .35, 1.0, 1], [sd * .21, 1.05], [sd * .15, 1.16]], lg([sd * .14, 1.3], [sd * .35, 1.0], ['#7a34b8', '#9a48dc', '#6a2aa8']));
      fillS([[sd * .14, 1.08], [sd * .22, .98], [sd * .31, .78, 1], [sd * .19, .88], [sd * .13, .97]], lg([sd * .13, 1.0], [sd * .31, .78], ['#ff7cc8', '#ff3fa4']));
      for (const p of qd([sd * .2, 1.31], [sd * .29, 1.16], [sd * .34, 1.03], 4).slice(0, 4)) dot(p, .011, '#fff6fa');
      for (const p of qd([sd * .19, 1.02], [sd * .26, .92], [sd * .3, .82], 3).slice(0, 3)) dot(p, .01, '#fff6fa'); }
    // the bodysuit under the vest: the same stripes up to the shoulders
    const body = [[-.18, 1.8], [.18, 1.8], [.185, 1.96], [.135, 2.08], [.16, 2.24], [.22, 2.37], [.13, 2.45], [-.13, 2.45], [-.22, 2.37], [-.16, 2.24], [-.135, 2.08], [-.185, 1.96]];
    fillS(body, SEAM); clipTo(body, () => { for (let i = 0; i < 18; i++) { const y = 1.82 + i * .037; fillS([[-.4, y + .007, 1], [.4, y + .007, 1], [.4, y + .03, 1], [-.4, y + .03, 1]], RAIN[(i + 4) % 7], false); } }); fillS(body, 'rgba(0,0,0,0)');
    // bare arms out of the armholes: her right out and down, her left toward her partner or up on the cue
    { const a = [-.19 + sway, 2.34], b = [-.35, 2.15], c = [-.47, 1.99]; limb(a, b, c, .042, .033, .025, skinG([-.4, 2.1], [-.3, 2.2])); hand(c, b, skin); line([[-.27, 2.25], [-.25, 2.2]], .01, 'rgba(60,70,90,.5)'); } // a tattoo
    { const a = [.19 + sway, 2.34], b = [lerp(.33, .3, wave), lerp(2.18, 2.56, wave)], c = [lerp(.43, .35, wave) + Math.sin(t * 6) * .03 * wave, lerp(2.27, 2.83, wave)]; limb(a, b, c, .042, .033, .025, skinG([.2, 2.2], [.35, 2.3])); hand(c, b, skin); }
    // the collar's navy back and lining, showing only inside the upper V round the neck
    fillS([[-.13, 2.44], [-.1, 2.52], [.1, 2.52], [.13, 2.44], [.03, 2.27, 1], [-.03, 2.27, 1]], NAVY);
    // the vest: two panels whose front edges are arcs, bowing in to touch at the middle, flaring out above into the collar
    // and below into a pointed tail past each hip, so the opening is an hourglass; the rainbow stripes nest along each arc, silver piping and
    // orange fringe on the arcs and round the collar, silver chimes off the collar tips
    const offset = (pts, o) => pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [p[0] + dy / L * o, p[1] - dx / L * o]; });
    for (const sd of [-1, 1]) {
      const arc = [...qd([sd * .28, 2.52], [sd * -.03, 2.38], [sd * .006, 2.1], 10), ...qd([sd * .006, 2.1], [sd * .03, 1.92], [sd * .35, 1.77], 10).slice(1)]; // from the collar tip in to the middle and out to the tail's tip
      const panel = [[sd * .28, 2.52, 1], [sd * .27, 2.43], [sd * .2, 2.36], [sd * .19, 2.27], [sd * .155, 2.08], [sd * .185, 1.98], [sd * .27, 1.86], [sd * .35, 1.77, 1], ...arc.slice(1, -1).reverse()];
      fillS(panel, SEAM); clipTo(panel, () => { for (let i = 0; i < 12; i++) line(offset(arc, -sd * (.014 + i * .029)), .022, RAIN[(i + (sd > 0 ? 3 : 0)) % 7], 'butt'); }); fillS(panel, 'rgba(0,0,0,0)');
      fringe(arc, .042, ['#ee8a2a', '#f39a3a', '#e8642a', '#f2b040'], -sd, .3); // along the arc, into the opening
      fringe([[sd * .28, 2.52], [sd * .27, 2.43], [sd * .22, 2.38]], .04, ['#ee8a2a', '#e8452f'], sd, .2); // round the collar tip
      line(arc, .02, '#c9ced6'); line(offset(arc, sd * .004), .007, '#ffffff');
      const n = sd < 0 ? 4 : 3; for (let i = 0; i < n; i++) { const x = sd * (.29 - i * .026), y = 2.47 - i * .012, sw = Math.sin(t * 3 + i + sd) * .01, L = .11 + .02 * i;
        line([[x, y], [x + sw, y - L]], .015, '#d4d8de', 'butt'); line([[x - .004, y], [x - .004 + sw, y - L]], .005, '#ffffff', 'butt'); dot([x + sw, y - L - .006], .013, '#3a5a9a', ink); } }
    // neck, head, hair, flowers
    fillS([[-.03, 2.4], [.03, 2.4], [.028, 2.49], [-.028, 2.49]], skinD);
    const h = [.004 + sway, 2.57];
    oval([h[0], h[1] + .03], .096, .095, '#e2be5a', ink); face(h);
    fillS([[h[0] - .092, h[1] + .05], [h[0] - .05, h[1] + .11], [h[0] + .04, h[1] + .115], [h[0] + .095, h[1] + .05], [h[0] + .05, h[1] + .07], [h[0] - .01, h[1] + .055], [h[0] - .06, h[1] + .065]], '#e8c868');
    const FL = [[-.085, 2.67, '#e8452f', .03], [-.04, 2.72, '#f2d040', .034], [.01, 2.74, '#a8d84a', .034], [.06, 2.72, '#f2d040', .034], [.1, 2.67, '#e8452f', .03], [-.11, 2.63, '#ee6a2a', .026], [.125, 2.63, '#ee6a2a', .026]];
    for (const [fx, fy, c, r] of FL) { for (let p = 0; p < 6; p++) { const b = p / 6 * TAU + fx * 9; dot([h[0] + fx + Math.cos(b) * r * .65, fy + Math.sin(b) * r * .6], r * .6, c, 'rgba(70,30,20,.45)'); } dot([h[0] + fx, fy], r * .35, '#fff3b0'); }
  } else {
    const PUR = '#7e34b4', PINK = '#ff5fb8';
    // grey pegs in pink socks, under two kite-shaped covers, one per leg: from a pink cuff at the knee out to a pink hoop at
    // the widest and in to the sock; pink piping on the edges; the right one has a pink panel down its inner half
    for (const sd of [-1, 1]) { const cx = sd * .135, bx = sd * .105;
      fillS([[bx - .022, 0, 1], [bx + .022, 0, 1], [bx + .018, .13], [bx - .018, .13]], '#8a8d93'); fillS([[bx - .026, .12, 1], [bx + .026, .12, 1], [bx + .022, .28], [bx - .022, .28]], PINK);
      const W2 = .2, up = [[cx - .062, 1.42, 1], [cx + .062, 1.42, 1], [cx + W2, .75, 1], [cx - W2, .75, 1]], lo = [[cx - W2, .75, 1], [cx + W2, .75, 1], [bx + .028, .27, 1], [bx - .028, .27, 1]];
      fillS(up, lg([cx - .18, 1], [cx + .18, 1], ['#5a2484', '#a24ad8', '#7e34b4', '#4a1c74']));
      clipTo(up, () => { for (let i = 0; i < 26; i++) dot([cx - .15 + rnd(i, sd + 3, 37) * .3, .78 + rnd(i, 2, 37) * .6], .008, 'rgba(255,225,255,.6)'); }); fillS(up, 'rgba(0,0,0,0)');
      fillS(lo, lg([cx - .18, .6], [cx + .18, .6], ['#4a1c74', '#8a3cc0', '#6a2a98', '#3e1764']));
      if (sd > 0) { fillS([[cx - .062, 1.42, 1], [cx - .005, 1.42, 1], [cx - .01, .75, 1], [cx - W2, .75, 1]], 'rgba(255,95,184,.92)'); fillS([[cx - W2, .75, 1], [cx - .01, .75, 1], [bx, .27, 1], [bx - .028, .27, 1]], 'rgba(255,95,184,.92)'); }
      else line([[cx + .03, 1.42], [cx + .09, .75], [bx + .015, .3]], .022, PINK);
      line([[cx - .062, 1.42], [cx - W2, .75], [bx - .028, .27]], .022, PINK); line([[cx + .062, 1.42], [cx + W2, .75], [bx + .028, .27]], .022, PINK);
      const hoop = pt([cx, .75]); g.strokeStyle = PINK; g.lineWidth = Math.max(1, .03 * k); g.beginPath(); g.ellipse(hoop[0], hoop[1], (W2 + .01) * k, .038 * k, 0, 0, Math.PI); g.stroke();
      fillS([[cx - .07, 1.38, 1], [cx + .07, 1.38, 1], [cx + .07, 1.46, 1], [cx - .07, 1.46, 1]], PINK); }
    // the jacket's back: across the shoulders, ragged strips hanging off its short sides
    fillS([[-.21, 2.39], [.21, 2.39], [.22, 2.22], [.19, 2.13], [-.19, 2.13], [-.22, 2.22]], '#4e1f78');
    // bare thighs, the hot pants, the waistband, the midriff
    for (const sd of [-1, 1]) fillS([[sd * .005, 1.78], [sd * .155, 1.8], [sd * .19, 1.6], [sd * .2, 1.44, 1], [sd * .07, 1.44, 1], [sd * .05, 1.62]], skinG([sd * .14, 1.6], [0, 1.6]));
    fillS([[-.16, 1.9, 1], [.16, 1.9, 1], [.16, 1.8, 1], [.035, 1.72, 1], [-.035, 1.72, 1], [-.16, 1.8, 1]], lg([-.16, 1.8], [.16, 1.8], ['#6a2a98', '#9a48d0', '#7e34b4']));
    fillS([[-.155, 1.96, 1], [.155, 1.96, 1], [.16, 1.885, 1], [-.16, 1.885, 1]], PINK);
    fillS([[-.15, 1.95], [.15, 1.95], [.125, 2.04], [.14, 2.16], [-.14, 2.16], [-.125, 2.04]], skinG([-.14, 2.05], [.14, 2.05])); oval([0, 2.03], .007, .011, skinD);
    // a tattered peplum at the back of the hips, hanging behind the flaps
    for (const sd of [-1, 1]) for (let i = 0; i < 8; i++) { const x = sd * (.12 + i * .018), sw = Math.sin(t * 5 + i + sd) * .008; line([[x, 1.98], [x + sw, 1.7 - .05 * (i % 2) - .03 * (i % 3)]], .022, i % 2 ? '#6a2a98' : '#4e1f78', 'butt'); }
    // the bust inside the V
    fillS([[-.12, 2.42], [.12, 2.42], [.06, 2.27], [.0, 2.17, 1], [-.06, 2.27]], skinG([-.07, 2.3], [.07, 2.3]));
    // the fronts: each lapel comes down from its side of the collar and crosses the other just under the bust (no tie);
    // below the cross the piping carries on down the far side into a long pointed flap that hangs over the hip to mid
    // thigh, rounds its tip and runs back up the flap's outer edge to the waist. The midriff and the hot pants show in
    // the open diamond between the flaps. Each pink tube is one continuous line, so the two cross like an X.
    const X = [0, 2.17];
    for (const sd of [-1, 1]) {
      const lapel = qd([sd * .11, 2.42], [sd * .05, 2.27], X, 6); // this side of the collar down to the cross
      const inner = qd(X, [sd * .1, 1.97], [sd * .19, 1.6], 9); // from the cross down the inner edge of this side's flap
      const outer = qd([sd * .19, 1.6], [sd * .33, 1.86], [sd * .155, 2.08], 9); // round the tip and back up its outer edge
      const panel = [[sd * .11, 2.42, 1], [sd * .19, 2.41], [sd * .21, 2.3], [sd * .165, 2.14], ...outer.slice().reverse().slice(1, -1), [sd * .19, 1.6, 1], ...inner.slice(1, -1).reverse(), [X[0], X[1], 1], ...qd([-sd * .06, 2.42], [-sd * .015, 2.27], X, 5).slice(0, -1).reverse().slice(0, 0), ...lapel.slice(1, -1).reverse()];
      fillS(panel, lg([sd * .26, 2.0], [sd * .04, 2.0], sd < 0 ? ['#5a2484', '#9a48d0'] : ['#4e1f78', '#8a3cc0']));
      clipTo(panel, () => { for (let i = 0; i < 24; i++) dot([sd * (.03 + rnd(i, sd + 2, 41) * .25), 1.62 + rnd(i, 3, 41) * .8], .008, 'rgba(255,225,255,.55)'); }); fillS(panel, 'rgba(0,0,0,0)');
      for (const p of qd([sd * .27, 1.86], [sd * .27, 1.74], [sd * .21, 1.64], 4)) { const sw = Math.sin(t * 5 + p[1] * 40) * .006; line([p, [p[0] + sd * .03 + sw, p[1] - .05]], .016, '#4e1f78', 'butt'); } // ragged bits off the flap
    }
    // the two pink tubes, each one line from a collar side across the X and round the opposite flap
    for (const sd of [-1, 1]) {
      const tube = [...qd([sd * .11, 2.42], [sd * .05, 2.27], X, 6), ...qd(X, [-sd * .1, 1.97], [-sd * .19, 1.6], 9).slice(1), ...qd([-sd * .19, 1.6], [-sd * .33, 1.86], [-sd * .155, 2.08], 9).slice(1)];
      line(tube, .042, PINK); line(tube.map(([x, y]) => [x - .006, y + .006]), .013, 'rgba(255,210,240,.85)'); }
    // arms in long pink gloves under the puffed cap sleeves
    const arm = (sd, b, c, fr) => { const a = [sd * .2 + sway, 2.34]; limb(a, b, c, .046, .036, .027, skinG([sd * .2, 2.3], [b[0], b[1]]));
      const u = [lerp(a[0], b[0], .55), lerp(a[1], b[1], .55)]; limb(u, b, c, .038, .037, .028, lg(u, c, ['#ff4aa8', '#ff7cc8', '#ff4aa8'])); hand(c, b, skin);
      if (fr) for (let i = 0; i < 6; i++) { const p = [lerp(b[0], c[0], .2 + i * .12), lerp(b[1], c[1], .2 + i * .12)], sw = Math.sin(t * 5 + i) * .01; line([p, [p[0] - .02 + sw, p[1] - .09 - .02 * (i % 2)]], .014, i % 2 ? '#6a2a98' : '#4e1f78', 'butt'); }
      fillS([[sd * .15, 2.42, 1], [sd * .25, 2.42], [sd * .285, 2.33], [sd * .265, 2.26, 1], [sd * .18, 2.27, 1]], lg([sd * .28, 2.3], [sd * .15, 2.36], ['#5a2484', '#9a48d0']));
      for (let i = 0; i < 5; i++) { const x = sd * (.19 + i * .022), sw = Math.sin(t * 6 + i) * .007; line([[x, 2.27], [x + sw, 2.21 - .02 * (i % 2)]], .015, '#6a2a98', 'butt'); } };
    arm(-1, [-.35, 2.17], [-.5, 2.04], true);
    arm(1, [lerp(.35, .31, wave), lerp(2.2, 2.56, wave)], [lerp(.47, .36, wave) + Math.sin(t * 6) * .03 * wave, lerp(2.1, 2.84, wave)], true);
    // neck, head, the messy magenta shock
    fillS([[-.03, 2.37], [.03, 2.37], [.028, 2.47], [-.028, 2.47]], skinD);
    const h = [.004 + sway, 2.56];
    fillS([[h[0] - .1, h[1] + .02], [h[0] - .08, h[1] + .1], [h[0], h[1] + .13], [h[0] + .08, h[1] + .1], [h[0] + .1, h[1] + .02]], '#8a2ab8');
    face(h);
    for (let i = 0; i < 14; i++) { const a = Math.PI * (.04 + i * .068 + .02 * rnd(i, 5, 51)), r0 = .06, r1 = .1 + .06 * rnd(i, 4, 51) * Math.sin(Math.PI * (.04 + i * .068)) + .006 * Math.sin(t * 5 + i), w = .24, c = [h[0], h[1] + .07];
      fillS([[c[0] + Math.cos(a - w) * r0, c[1] + Math.sin(a - w) * r0], [c[0] + Math.cos(a + .04) * r1, c[1] + Math.sin(a + .04) * r1, 1], [c[0] + Math.cos(a + w) * r0, c[1] + Math.sin(a + w) * r0]], i % 3 === 1 ? '#c04ae0' : i % 2 ? '#a234d0' : '#7e26aa', 'rgba(60,10,60,.5)'); }
    for (const [dx, l] of [[-.07, .05], [-.03, .065], [.02, .06], [.065, .045]]) fillS([[h[0] + dx - .03, h[1] + .1], [h[0] + dx + .028, h[1] + .1], [h[0] + dx + .012, h[1] + .1 - l, 1]], '#9a30c8', false); // wisps over the brow
  }
}
