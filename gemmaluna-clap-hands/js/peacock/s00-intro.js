// 11.0-26.04 INTRO: rooftops in the rain under the moon-halo, a slow tilt down the facades to a Guimard Metro
// entrance. Its lily-bud lamps flicker on (~23 to 24); push into the right one: its glow becomes the tram's hanging
// lily lamp (the tram opens zoomed into it).
// Draft 4: the film opens on motion (the tilt starts at once, the halo ring ticks on every beat, the cloud cards are
// slid across on the beats, the chimneys puff on the downbeats); a real Guimard entourage (crook-necked lamp stems
// off an openwork balustrade, an iron crest arch, the lettered METROPOLITAIN plate); the bud ends in light, not plum.

// the beat clock (js/data.js): steps that land on the beats, like paper moved by hand. One global object so the
// names can't collide with other files (shots.js uses it too)
const beatClock = (() => {
  const beats = (window.FEAT && FEAT.beats) || [];
  const down0 = beats.findIndex((b) => Math.abs(b - 41.6) < .05); // clap 1 sits on a downbeat; bars count from it
  const index = (t) => { let i = -1; for (let j = 0; j < beats.length && beats[j] <= t; j++) i = j; return i; };
  // a counter that steps by 1 on every beat, easing (with a small overshoot) over dur; between beats it holds
  const step = (t, dur = .16) => { const i = index(t); return i < 0 ? 0 : i + back(clamp((t - beats[i]) / dur)) - 1; };
  const isDown = (i) => down0 >= 0 && ((i - down0) % 4 + 4) % 4 === 0;
  // how long since the last beat (or downbeat) at or before t
  const since = (t, downOnly = false) => { for (let i = index(t); i >= 0; i--) if (!downOnly || isDown(i)) return t - beats[i]; return 99; };
  // a smooth phase that is a whole number on every beat (a pendulum on cos(PI * phase) swings to a side on each beat)
  const phase = (t) => { const i = index(t); if (i < 0 || i >= beats.length - 1) return t / .52; return i + (t - beats[i]) / (beats[i + 1] - beats[i]); };
  return { beats, down0, index, step, isDown, since, phase };
})();

// The calyx hand's bud of light (nouveau.js calyxHand, palm 'bud'), drawn on its own for the conductor's lantern
// (shots.js) so the lamp rhyme carries from the Metro and the tram into his heart: base at (x,y), pointing up, s tall.
// lit 0..1 (below .5 it is a plum bud). The core is white, so a push into it ends in light, not plum.
function metroBud(x, y, s, lit, open = .5) {
  const u = s / .62, k = clamp(open), on = lit > .5;
  if (lit > 0) glow(x, y - .3 * u, 3 * u, '240,190,110', .45 * lit);
  g.save(); g.translate(x, y); g.scale(u, u);
  const pet = [[0, 0], [-.14, -.18], [-.1, -.46], [0, -.62], [.1, -.46], [.14, -.18]];
  for (const a of [-.42, .42]) { g.save(); g.rotate(a * lerp(.5, 1, k)); g.scale(.8, .82); cut(blob(pet, .6), on ? C.goldPale : C.plum, { sh: .4, grain: .15 }); g.restore(); }
  cut(blob(pet, .6), on ? C.white : C.plumLight, { sh: .4, grain: .1 });
  g.restore();
  if (lit > 0) glow(x, y - .3 * u, .9 * u, '255,240,200', .5 * lit);
}

(() => {
  function waterTower(x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s);
    for (const lx of [-70, -24, 24, 70]) cut(rect(lx - 5, -150, 10, 150), C.plumDeep, { sh: .3, grain: 0 });
    cut(rect(-80, -110, 160, 8), C.plumDeep, { sh: .2, grain: 0 });
    cut(cutRect(-90, -330, 180, 180, 7), C.plum, { sh: .8, lift: .3 });
    for (let i = 0; i < 3; i++) cut(rect(-92, -300 + i * 55, 184, 7), C.goldDeep, { sh: .2, grain: 0 });
    cut(poly([[-104, -326], [0, -420], [104, -326]]), C.plumDeep, { sh: .6 });
    cut(circle(0, -426, 8), C.gold, { sh: .2 });
    g.restore();
  }
  // the chimneys puff a cloud of smoke on the downbeats, taking turns (the hook: something moves on the beat at once)
  function chimney(x, y, w, h, t, seed, which) {
    cut(cutRect(x - w / 2, y - h, w, h, seed), C.plumDeep, { sh: .6 });
    cut(cutRect(x - w / 2 - 8, y - h - 14, w + 16, 16, seed + 1), C.plum, { sh: .4 });
    // whiplash smoke curling off to the right
    for (let j = 0; j < 2; j++) {
      const ph = t * .6 + seed + j * 1.7, sx = x + 10 * j, sy = y - h - 10;
      const v = whipPts([sx, sy], [sx - 30 + Math.sin(ph) * 20, sy - 120], [sx + 90, sy - 200 + Math.cos(ph) * 20], [sx + 200, sy - 230], 36, 1);
      tendril(v, 24 - j * 8, j ? C.creamDeep : C.cream, { sh: .3, alpha: .4 - j * .12, grain: .3 });
    }
    const BC = beatClock, i0 = BC.index(t);
    for (let i = i0; i > i0 - 8 && i >= 0; i--) {
      if (!BC.isDown(i) || ((i - BC.down0) / 4 + 400) % 2 !== which) continue;
      const d = t - BC.beats[i]; if (d > 3.2) continue;
      const k = d / 3.2, px = x + 60 * eo(k) + 40 * k, py = y - h - 30 - 330 * eo(k), r = lerp(20, 70, eo(Math.min(1, d / .35)));
      cut(cloud(px, py, r * 2.2, r * 1.3, i), C.cream, { sh: .3, alpha: .7 * (1 - k), grain: .2 });
    }
  }
  // the skyline: back row plumDeep (taller), front row plum with arched windows down to the street
  const BACK = [[-40, 300, -760], [260, 220, -820], [480, 260, -700], [740, 240, -860], [980, 200, -720]];
  const FRONT = [[-40, 330, -540], [290, 260, -640], [550, 240, -480], [790, 330, -600]];
  function skyline(t) {
    for (const [x, w, top] of BACK) cut(cutRect(x, top, w, 2600, x + 3), C.plumDeep, { sh: .7, lift: .3 });
    waterTower(380, -820, 1.0); waterTower(900, -860, .8);
    chimney(560, -700, 46, 120, t, 3, 0); chimney(120, -760, 40, 90, t, 9, 1);
    for (const [x, w, top] of FRONT) {
      cut(cutRect(x, top, w, 2600, x + 11), C.plum, { sh: 1, lift: .4 });
      cut(cutRect(x - 6, top, w + 12, 18, x + 12), C.gold, { sh: .5 });
      const cols = Math.max(1, Math.floor(w / 110));
      for (let r = 0; top + 90 + r * 260 < 1160; r++) for (let c = 0; c < cols; c++) {
        const wx = x + (c + .5) * w / cols - 34, wy = top + 90 + r * 260;
        const lit = hash(x + r * 7 + c * 3) > .62 && !(wy > 520 && [352, 728].some((lx) => Math.abs(wx + 34 - lx) < 150)); // dark behind the lamps
        cut(archPath(wx, wy, 68, 130), lit ? C.goldPale : C.tealInk, { sh: .3, grain: .25 });
        if (lit) glow(wx + 34, wy + 70, 120, '250,215,140', .25);
        cut(rect(wx - 8, wy + 128, 84, 10), C.cream, { sh: .3, grain: .1, alpha: .85 });
      }
    }
  }

  // ---- the Guimard entourage ----
  // Guimard lettering, drawn not typed: each glyph is a few smooth strokes in a box one unit tall (y down), stems
  // swelling toward the foot as in his Metro signs. The plate reads METROPOLITAIN.
  const GLYPH = {
    M: [.96, [[[.05, 1], [.07, .45], [.17, .05], [.31, .1], [.48, .64]], [[.48, .64], [.65, .1], [.79, .05], [.89, .45], [.91, 1]]]],
    E: [.6, [[[.56, .1], [.36, .01], [.12, .12], [.1, .46], [.1, .8], [.26, 1], [.58, .92]], [[.11, .5], [.45, .47]]]],
    T: [.72, [[[.02, .17], [.2, .04], [.5, .08], [.8, .04], [.98, .17]], [[.5, .08], [.47, .55], [.5, 1]]]],
    R: [.66, [[[.12, .04], [.13, .5], [.11, 1]], [[.12, .06], [.46, .02], [.6, .22], [.46, .45], [.14, .5]], [[.32, .5], [.48, .68], [.58, .93], [.7, .98]]]],
    O: [.66, [[[.33, .02], [.07, .2], [.06, .62], [.33, .99], [.6, .62], [.59, .2], [.33, .02], [.07, .2]]]],
    P: [.62, [[[.12, .04], [.13, .5], [.11, 1]], [[.12, .06], [.45, .02], [.58, .25], [.44, .5], [.14, .55]]]],
    L: [.56, [[[.15, .02], [.13, .5], [.15, .9], [.32, 1], [.56, .88]]]],
    I: [.26, [[[.13, .02], [.11, .5], [.13, 1]]]],
    A: [.72, [[[.04, 1], [.16, .5], [.36, .03], [.56, .5], [.68, 1]], [[.15, .66], [.36, .59], [.57, .66]]]],
    N: [.7, [[[.09, 1], [.1, .5], [.09, .04]], [[.09, .04], [.36, .5], [.61, .96]], [[.61, .96], [.6, .5], [.61, .02]]]],
  };
  // Catmull-Rom through the points, sampled
  function smooth(pts, n = 7) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < n; k++) { const u = k / n, u2 = u * u, u3 = u2 * u;
        out.push([0, 1].map((d) => .5 * (2 * p1[d] + (-p0[d] + p2[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * u3))); }
    }
    out.push(pts[pts.length - 1]); return out;
  }
  // a stroke whose width swells with depth (thin at the head of the letter, full at its foot)
  function letterStroke(pts, h, col) {
    const L = [], R = [], wAt = (y) => h * lerp(.085, .175, clamp(y / h));
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const w = wAt(pts[i][1]) / 2; L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
    }
    g.fillStyle = col; g.fill(poly(L.concat(R.reverse())));
    for (const p of [pts[0], pts[pts.length - 1]]) g.fill(circle(p[0], p[1], wAt(p[1]) / 2));
  }
  function lettering(word, x, y, h, col, gap = .1) {
    const total = [...word].reduce((s, c) => s + GLYPH[c][0], 0) + gap * (word.length - 1);
    let cx = x - total * h / 2;
    for (const c of word) {
      const [wd, strokes] = GLYPH[c];
      for (const s of strokes) letterStroke(smooth(s.map(([px, py]) => [cx + px * h, y - h / 2 + py * h])), h, col);
      cx += (wd + gap) * h;
    }
  }
  // the lamps: crook-necked iron stems rising off the balustrade's end posts; the hand rises from the crook's end
  // and holds the bud up. dir +1 = the stem curls to the right (the left lamp)
  const BASE = 1660, ST_H = 760, CROOK = .2;
  const LAMPS = [[200, 1, 23.23], [880, -1, 23.77]]; // x, dir, the beat it comes on
  const lampEnd = (x, dir, sway = 0) => [x + dir * ST_H * CROOK + sway, BASE - ST_H];
  // the calyx hand (nouveau.js, b1) holds the bud of light in its palm; the palm centre sits 120 px above the crook's
  // end, where draft 3's bud glowed, so the push into the right lamp lands on the light
  const HAND_SC = typeof CALYX_LAMP_SC === 'number' ? CALYX_LAMP_SC : 150, BUD_UP = 120;
  const BUD = (() => { const [ex, ey] = lampEnd(880, -1); return { x: ex, y: ey - BUD_UP }; })(); // the push target: the right lamp's bud
  // lit: 0 dark .. 1 on. Before it comes on it catches on the beats (a filament warming), then it stays on with one
  // half-beat stutter. Never a frame-filling flash.
  function lampLit(t, t0, side) {
    if (t >= t0) return (t > t0 + .22 && t < t0 + .3) ? .35 : 1;
    let m = 0; const B = beatClock.beats, i0 = beatClock.index(t);
    for (let i = i0; i > i0 - 3 && i >= 0; i--) { const d = t - B[i]; if (B[i] > t0 - 2.3 && (i + side) % 2 === 0) m = Math.max(m, .55 * Math.exp(-9 * d)); } // the two lamps catch on alternate beats
    return m;
  }
  function lampStem(x, dir, sway) {
    const [ex, ey] = lampEnd(x, dir, sway);
    const stem = whipPts([x, BASE - 20], [x - dir * ST_H * .05, BASE - ST_H * .6], [x + dir * ST_H * .02 + sway, BASE - ST_H * 1.12], [ex, ey], 0);
    tendril(stem, 30, C.tealDeep, { sh: .8, lift: .3 });
    tendril(stem.map(([px, py]) => [px - dir * 6, py]), 7, C.gold, { sh: 0, grain: 0 }); // cast iron: teal with a gold highlight
    // the leaf collar where the stem leaves the post, and a bud-knot halfway up (Guimard's plant-stalk lamp posts)
    for (const sx of [-1, 1]) tendril(whipPts([x, BASE - 30], [x + sx * 30, BASE - 70], [x + sx * 34, BASE - 130], [x + sx * 12, BASE - 170], 10, -sx), 12, C.tealDeep, { sh: 0, grain: 0 });
    const [kx, ky] = stem[Math.floor(stem.length * .42)];
    cut(ellipse(kx, ky, 22, 34), C.tealDeep, { sh: .4, grain: 0 }); cut(ellipse(kx - dir * 4, ky, 6, 22), C.gold, { sh: 0, grain: 0 });
    return [ex, ey];
  }
  function lamp(ex, ey, dir, lit, open) {
    if (lit > 0) glow(ex, ey - BUD_UP, 380, '240,190,110', .3 * lit);
    if (typeof calyxHand === 'function') calyxHand(ex, ey - BUD_UP + .5 * HAND_SC, HAND_SC, open, { skin: 'iron', palm: 'bud', lit, thumb: -dir }); // thumbs outward
    else { nouveauHand(ex, ey, 100, open * .8, { fill: C.tealDeep, edge: C.gold }); metroBud(ex, ey - 75, 90, lit, open); }
  }
  // the balustrade: openwork cast iron, posts with knob finials, an escutcheon shield in each panel tied to the posts
  // by whiplash scrolls (draft 3's solid humps read as tombstones)
  function balustrade(x0, x1, yTop, yBot) {
    const n = 4, pw = (x1 - x0) / n;
    for (let i = 0; i < n; i++) {
      const cx = x0 + pw * (i + .5), cy = (yTop + yBot) / 2 + 4, sx = i % 2 ? 1 : -1;
      for (const s of [-1, 1]) {
        tendril(whipPts([cx + s * 30, cy - 34], [cx + s * pw * .3, yTop + 6], [cx + s * pw * .46, yTop + 30], [cx + s * pw * .36, cy + 6], 16, s * sx), 9, C.tealDeep, { sh: 0, grain: 0 });
        tendril(whipPts([cx + s * 26, cy + 34], [cx + s * pw * .28, yBot - 4], [cx + s * pw * .44, yBot - 30], [cx + s * pw * .4, cy + 20], 12, -s * sx), 7, C.gold, { sh: 0, grain: 0 });
      }
      const sh = blob([[cx, cy - 52], [cx + 34, cy - 40], [cx + 40, cy], [cx + 22, cy + 40], [cx, cy + 56], [cx - 22, cy + 40], [cx - 40, cy], [cx - 34, cy - 40]], .6);
      cut(sh, C.gold, { sh: .6, lift: .2, grain: 0 });
      const inner = blob([[cx, cy - 42], [cx + 26, cy - 32], [cx + 31, cy], [cx + 16, cy + 31], [cx, cy + 44], [cx - 16, cy + 31], [cx - 31, cy], [cx - 26, cy - 32]], .6);
      for (const a of [-.42, 0, .42]) inner.addPath(ellipse(cx + Math.sin(a) * 18, cy + 18 - Math.cos(a) * 18, 5.5, 17, a)); // three slits fanned up from the foot: a calyx
      cut(inner, C.tealDeep, { sh: 0, grain: 0, rule: 'evenodd' });
    }
    cut(cutRect(x0 - 10, yTop - 6, x1 - x0 + 20, 16, 61), C.tealDeep, { sh: .7, lift: .2, grain: 0 });
    cut(rect(x0 - 6, yTop - 4, x1 - x0 + 12, 4), C.gold, { sh: 0, grain: 0 });
    cut(cutRect(x0 - 10, yBot - 8, x1 - x0 + 20, 14, 62), C.tealDeep, { sh: .5, grain: 0 });
    for (let i = 0; i <= n; i++) { const px = x0 + pw * i;
      cut(rect(px - 8, yTop - 4, 16, yBot - yTop), C.tealDeep, { sh: .5, grain: 0 });
      if (i > 0 && i < n) { cut(ellipse(px, yTop - 22, 13, 20), C.tealDeep, { sh: .3, grain: 0 }); cut(ellipse(px - 3, yTop - 25, 4, 9), C.gold, { sh: 0, grain: 0 }); } }
  }
  // the enamel plate in its iron frame, slung between the two stems under a whiplash crest arch
  function sign(t) {
    const x0 = 236, x1 = 844, y0 = 1036, y1 = 1150, cx = (x0 + x1) / 2;
    // brackets tying the frame's ends to the stems
    for (const s of [-1, 1]) {
      const ex = s < 0 ? x0 : x1;
      tendril(whipPts([ex, y0 + 20], [ex + s * 30, y0 - 20], [ex + s * 4, y0 - 70], [ex - s * 40, y0 - 52], 18, s), 12, C.tealDeep, { sh: .5, grain: 0 });
      tendril(whipPts([ex, y1 - 16], [ex + s * 34, y1 + 20], [ex + s * 2, y1 + 70], [ex - s * 34, y1 + 56], 16, -s), 10, C.tealDeep, { sh: .5, grain: 0 });
    }
    // the crest: a low whiplash arch over the plate, its two halves curling back at the crown
    for (const s of [-1, 1]) {
      const v = whipPts([cx + s * (x1 - x0) * .5, y0 - 4], [cx + s * 220, y0 - 50], [cx + s * 90, y0 - 92], [cx + s * 16, y0 - 64], 22, s);
      tendril(v, 16, C.tealDeep, { sh: .6, lift: .2 }); tendril(v.map(([px, py]) => [px, py - 4]), 4, C.gold, { sh: 0, grain: 0 });
    }
    cut(ellipse(cx, y0 - 92, 16, 26), C.tealDeep, { sh: .4, grain: 0 }); cut(ellipse(cx, y0 - 94, 6, 14), C.gold, { sh: 0, grain: 0 });
    cut(rrect(x0, y0, x1 - x0, y1 - y0, 40), C.tealDeep, { sh: 1, lift: .4 });
    cut(rrect(x0 + 10, y0 + 10, x1 - x0 - 20, y1 - y0 - 20, 32), C.gold, { sh: 0, grain: .1 });
    cut(rrect(x0 + 16, y0 + 16, x1 - x0 - 32, y1 - y0 - 32, 28), C.cream, { sh: 0, grain: .25 });
    lettering('METROPOLITAIN', cx, (y0 + y1) / 2 + 2, 62, C.tealInk);
  }
  function metro(t) {
    cut(cutRect(-60, 1640, W + 120, 400, 31), C.tealDeep, { sh: .6 });
    for (let i = 0; i < 5; i++) cut(ribbon(-40, W + 40, 1700 + i * 44, 8, i * 1.7 + t * .5, 6), C.teal, { sh: 0, grain: .2, alpha: .6 });
    // the stair going down
    cut(poly([[280, 1660], [800, 1660], [710, 1900], [370, 1900]]), C.tealInk, { sh: .4 });
    for (let i = 0; i < 5; i++) cut(rect(318 + i * 8, 1700 + i * 40, 444 - i * 16, 8), C.tealDeep, { sh: 0, grain: 0 });
    // the lamps' light on the wet pavement: stacked slivers, narrowing away (a reflection, not a squiggle)
    for (const [x, dir, t0] of LAMPS) { const l = lampLit(t, t0, x < 540 ? 0 : 1), lx = x - dir * 30; if (l > 0) for (let i = 0; i < 7; i++) { const w = 70 - i * 8 + Math.sin(t * 5 + i * 2.1 + x) * 8, y = 1696 + i * 30;
      cut(rrect(lx - w / 2 + Math.sin(t * 3 + i) * 5, y, w, 7, 3.5), C.goldPale, { sh: 0, grain: 0, alpha: .38 * l * (1 - i / 8) }); } }
    balustrade(200, 880, 1530, 1660);
    const ends = LAMPS.map(([x, dir]) => lampStem(x, dir, Math.sin(t * 1.2 + x) * 4));
    sign(t);
    LAMPS.forEach(([, dir, t0], i) => lamp(ends[i][0], ends[i][1], dir, lampLit(t, t0, i), ss(t0 - .45, t0 + .4, t))); // the iron hands open round the light
  }
  SHOT(START, 26.04, 'intro', (t, k, d) => {
    // the tilt (draft 4): draft 3's tilt (protected: it reaches the water towers and the lamps at the same moments),
    // but it no longer holds still for the first 1.5 s: an extra drift starts on the first frame and hands over to
    // the tilt by 18.5. The moon opens on the left third and drifts to the centre.
    let cy = kf3(t, [[11.0, -1480], [12.5, -1450], [22.9, 1280]]) + 130 * eo(clamp((t - 11.0) / 3)) * (1 - ss(14.5, 18.5, t));
    let cx = lerp(700, 540, eo(clamp((t - 11.0) / 6.5))), z = 1; // moving from the first frame
    // the Metro hold: from the right lamp's flicker a slow push that sets that lamp on the right third, then the
    // push into its bud (25.33 downbeat to the cut)
    const dr = eio(clamp((t - 23.4) / 1.95));
    cy = lerp(cy, 1190, dr); cx = lerp(cx, 600, dr); z = lerp(1, 1.22, dr);
    const u = ei(clamp((t - 25.3) / .74)), e = eio(clamp((t - 25.3) / .6));
    z = z * Math.pow(9 / z, u); cx = lerp(cx, BUD.x, e); cy = lerp(cy, BUD.y, e);
    g.save(); cam(cx, cy, z);
    sheet(C.tealInk);
    rays(540, -1560, 300, 1300, 28, t * .02, C.tealDeep);
    // the halo's rose ring ticks round half a petal on every beat
    const tick = beatClock.step(t) * TAU / 24;
    halo(540, -1560, 270, tick, 1, [C.goldDeep, C.creamDeep, C.tealDeep, C.gold], 'rose'); haloMoon(540, -1560, 150);
    // cloud cards slid across on the beats (they step and settle), clear of the moon
    const bs = beatClock.step(t, .3);
    for (let i = 0; i < 5; i++) {
      const x = ((hash(i * 3.3) * 1400 + bs * (22 + i * 9) * (i % 2 ? -1 : 1)) % 1700 + 1700) % 1700 - 300, y = [-2060, -1900, -1250, -1130, -1990][i];
      cut(cloud(x, y, 420 + hash(i) * 200, 120 + hash(i + 4) * 50, i), i % 2 ? C.plum : C.plumDeep, { sh: .7, lift: .3, alpha: .95 });
    }
    skyline(t);
    metro(t);
    g.restore();
    rain(t, 90, 31, .45, .12);
    sheet(C.goldPale, .4 * ss(25.86, 26.04, t)); // into the lamp's light, briefly (the audit: white-outs outshone the end)
  });
})();
