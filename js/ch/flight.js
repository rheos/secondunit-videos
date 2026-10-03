// js/ch/flight.js · TAKE-OFF (song 278.0 - 298.0)
// The start of Bob's long spoken passage about destiny and choice. After a whole song stuck on the
// highway, the plane is finally flying: he soars over a patchwork landscape, the highway a thin
// ribbon far below. Reflective, free, a little awed. No text on screen.
//
// LOOK: a bright plein-air / Fauvist landscape seen from above (Derain's Collioure, Matisse's
// Nice windows, Hockney's Yorkshire fields). High key, full chroma, no black anywhere: the darkest
// note is indigo, shadows go violet and ultramarine, lights go lemon. The cream ground shows
// between broad loaded strokes, which carry impasto ridges lit from the upper left.
//
// PALETTE (named pigments)
//   cream gesso ground   #f3e7c9   shows between strokes everywhere
//   titanium white warm  #fbf5e6   cloud tops, eye whites
//   cadmium lemon        #f5d93a   rapeseed fields, sun, highlights (hiTint #fbe58a)
//   cadmium yellow       #f4c534   the plane's wings and tail
//   cadmium orange       #f08a24   stubble fields, nacelle glints
//   cadmium red light    #e4502e   the plane's body
//   rose madder          #d9577a   blossom fields, cheeks, body shadow (#b23a6e)
//   cobalt violet        #8a5bb5   lavender fields; cloud undersides go lilac #b7b0de
//   ultramarine          #2a3a9e   windscreen, zenith sky, stroke shadows (shadowTint #3b3fa8)
//   cobalt blue          #2f63b8   sky, nose, belt, portholes
//   cerulean             #5aa9da   horizon sky, river
//   viridian             #1f7a5c   woods and trees, hedgerows #17594a
//   sap green            #6a9a3a   pasture
//   permanent green lt   #8cc04a   young crops
//   yellow ochre         #d9a441   wheat, tyre hubs
//   indigo               #1d2a5a   the darkest note: pupils, mouth, outlines on the ink layer
//   distance haze        #a9b9e2   aerial perspective pulls far fields toward cerulean-lilac
//
// BRUSH (Paint.present settings; base values in BRUSH, per-shot overrides in the chapter list)
//   boil 6/s         strokes re-roll slowly: calm, soaring, not jittery
//   strokeK 1.15-1.6 broad flat loaded strokes; biggest on the close-ups
//   flowK .55        low swirl; strokes follow the form (furrows, hedges, body edges) instead of eddying
//   flowBias .3-.5   flat sky takes long horizontal strokes (flowAng 0)
//   ground .62       cream ground showing through
//   gap .17          share of broad strokes left out so the ground reads between them
//   fauve .7         chroma lift, violet shadows, lemon lights, per-stroke hue scatter
//   impasto .9       ridged, bristle-grooved strokes lit from the upper left (light [-.6,-.8])
//   grain .035, vig .18, bloom .8 (1.4 for the sun shot)
//   Fine detail that must stay readable (the eyes, the mouth) goes on the unbrushed ink layer.
(() => {
  const BRUSH = { boil: 6, strokeK: 1.3, flowK: .55, flowBias: .3, flowAng: 0, ground: .62, gap: .17, fauve: .7, impasto: .9, grain: .035, vig: .18, bloom: .8 };

  // spoken cues (Whisper word starts; timing only)
  const CUE = { choices: 279.92, mechanical: 281.40, responding: 284.20, like: 286.08, story: 286.64, mean: 289.76, destiny: 291.24, real: 292.08, please: 293.64, fasten: 294.32, seat: 294.90, belts: 295.18, end: 295.6 };
  const SPEED = 1.8;                         // ground units per second under the plane
  const voc = (t) => clamp(F('voc', t, 2) * 2.2);
  const swingT = (t, k) => [Math.sin(t * 2.1 + k) * .22 + snoise(t * .7, 3 + k) * .1, Math.sin(t * 2.1 + 1.3 + k) * .22 + snoise(t * .7, 9 + k) * .1];
  const blinkAt = (t, t0, d = .16) => { const u = (t - t0) / d; return u < 0 || u > 2 ? 0 : (u < 1 ? u : 2 - u); };

  // ---------------------------------------------------------------- A · WIDE over the patchwork
  const cloudsA = makeClouds(41, 16, [-26, 26], [3.5, 6.5], [6, 90], 1.3);
  const cloudsAhi = makeClouds(43, 5, [-14, 14], [8.6, 10], [6, 30], 1.1);
  function wide(t, lt, dur) {
    const u = lt / dur;
    const roll = .035 * Math.sin(lt * .9) - .02;
    for (const g of ALL()) { g.translate(W / 2, H / 2); g.rotate(roll); g.translate(-W / 2, -H / 2); }
    view({ x: lerp(-.6, .6, ease.sine(u)), z: SPEED * (t - 278), h: lerp(7.6, 8.8, ease.sine(u)), p: lerp(.24, .285, ease.sine(u)), yaw: .04 * Math.sin(lt * .5) });
    sky();
    sun(1560, horizonY() - 150, 40);
    for (let k = 0; k < 4; k++) cumulus(160 + k * 520 + Math.sin(k * 7) * 90 - lt * 14, horizonY() - 20 - k % 2 * 30, 70 + k % 3 * 25, 50 + k, { under: '#c8c4e8' });
    fields(t);
    river();
    highway(t, { w: .11, cars: 1, jam: 1 });
    drawClouds(cloudsA, t, { wind: [.25, 0] });
    // the plane, climbing gently across the frame, eyes down on the land he used to drive
    const px = kf(t, [[278, 560], [282.07, 1160]], ease.sine), py = kf(t, [[278, 520], [282.07, 400]], ease.sine) + bob(t) * 5;
    const sc = lerp(.6, .68, u);
    const lk = kf(t, [[278, [.4, .7]], [CUE.choices - .2, [.4, .7]], [CUE.choices + .3, [.9, .25]], [281.5, [.5, .75]]]);
    planeSide(px, py, sc, -.07 + .03 * Math.sin(lt * 1.3), { t, look: lk, lid: .05 + blinkAt(t, 280.9) * .95, smile: .4, swing: swingT(t, 0) });
    drawClouds(cloudsAhi, t, { wind: [.4, 0], front: 1 });
    // a near cloud sweeps the camera at the end: the cut hides in it
    const wipe = inv(281.35, 282.07, t);
    if (wipe > 0) cumulus(lerp(2500, 900, ease.inOut(wipe)), lerp(820, 640, wipe), lerp(300, 900, ease.in(wipe)), 77, { under: '#d4cfee', front: 1 });
  }

  // ---------------------------------------------------------------- B · TOP-DOWN, the highway a thread
  const cloudsB = makeClouds(57, 12, [-14, 14], [6, 11], [40, 64], 1.0);
  function topdown(t, lt, dur) {
    const u = lt / dur, z = 46 + SPEED * .8 * lt;
    view({ x: hwX(z) + kf(lt, [[0, 1.6], [dur, -.6]], ease.sine), z, h: 13.5, p: Math.PI / 2 - .001, yaw: lerp(.25, -.12, ease.inOut(u)) });
    fields(t, { trees: 1 });
    river();
    highway(t, { w: .12, cars: 1, jam: 1, fork: 1, carK: 1.7 });
    // his tiny shadow on the fields, far below
    const sh = P3(V.x + .9, 0, V.z - .4);
    for (const g of [s]) { g.save(); g.translate(sh[0], sh[1]); g.rotate(-V.yaw); g.fillStyle = 'rgba(29,42,90,.5)'; g.fillRect(-26, -5, 52, 10); g.fillRect(-5, -16, 10, 32); g.restore(); }
    drawClouds(cloudsB, t, { wind: [0, -.25], shadows: 1, front: 1 });
    // the clouds from the wipe clearing away
    const clear = 1 - inv(282.07, 282.9, t);
    if (clear > 0) { cumulus(lerp(700, -500, 1 - clear), 540, 900 * clear + 200, 77, { under: '#d4cfee', front: 1 }); cumulus(lerp(1300, 2500, 1 - clear), 380, 700 * clear + 150, 78, { under: '#d4cfee', front: 1 }); }
    // the plane from above; on "responding" he rocks his wings
    const rock = Math.sin(inv(CUE.responding - .1, CUE.responding + 1.3, t) * TAU) * .5 * (1 - inv(CUE.responding + .8, CUE.responding + 1.3, t));
    planeTop(960 + Math.sin(lt * .8) * 30, 560 + Math.cos(lt * .6) * 16, lerp(.64, .72, u), -.04 + .03 * Math.sin(lt * .9) + rock * .08, { t, roll: Math.abs(rock) > .02 ? rock : 0, look: [.1, -.7] });
  }

  // ---------------------------------------------------------------- C · CLOSE on his face, looking down
  const cloudsC = makeClouds(61, 18, [-30, 30], [4, 8], [8, 60], 1.4);
  function closeup(t, lt, dur) {
    const u = lt / dur;
    view({ x: -lt * 3.2, z: 10, h: 9.5, p: .5, yaw: -1.45, cy: 380 });
    sky(PG.cobalt, PG.cerulean, '#f3ecc4');
    fields(t, { far: 90 });
    highway(t, { w: .1, fork: 0 });
    drawClouds(cloudsC, t, { wind: [-2.2, 0] });
    const sc = lerp(1.82, 2.08, ease.sine(u)), cx = 1060 + lt * 8, cy = 450;
    const ox = cx - 186 * sc, oy = cy + 58 * sc + bob(t) * 6;
    const lk = kf(t, [[286.07, [.25, .85]], [CUE.story, [.25, .85]], [CUE.story + .35, [.75, .35]], [288.6, [.75, .35]], [289.1, [.35, .9]]]);
    const open = kf(t, [[286.07, .0], [286.3, .22], [CUE.story - .05, .22], [CUE.story + .15, 0]]) + voc(t) * .12;
    const smile = kf(t, [[286.07, .1], [CUE.story, .1], [CUE.story + .35, .7], [289.4, .6]]);
    planeSide(ox, oy, sc, .05 + .015 * Math.sin(lt * 1.4), { t, look: lk, lid: .05 + blinkAt(t, 288.1, .14) * .95, smile, open, swing: swingT(t, 2) });
  }

  // ---------------------------------------------------------------- D · LOW ANGLE, sun through the propellers
  function lowangle(t, lt, dur) {
    const u = lt / dur, SX = 1010, SY = 330;
    s.fillStyle = vgrad(s, -100, H + 100, [[0, PG.ultra], [.4, PG.cobalt], [.8, PG.cerulean], [1, '#cfe3ee']]); s.fillRect(-500, -500, W + 1000, H + 1000);
    const flare = Math.exp(-Math.pow((t - CUE.real) / .55, 2));
    sun(SX, SY, 46, .8 + flare * .6);
    cumulus(180 - lt * 22, 980, 260, 91, { fromBelow: 1 }); cumulus(1720 + lt * 18, 1010, 300, 92, { fromBelow: 1 });
    cumulus(1650 + lt * 30, 170, 170, 93, { fromBelow: 1 }); cumulus(260 - lt * 26, 120, 150, 94, { fromBelow: 1 });
    // he passes overhead, his right propeller crossing the sun on "real"
    const sc = kf(t, [[289.47, .55], [293.5, 1.05]], ease.lin);
    const px = kf(t, [[289.47, 1500], [CUE.real, SX - 280 * .76], [293.5, 470]], ease.sine), py = kf(t, [[289.47, 930], [CUE.real, SY - 50 * .76], [293.5, 150]], ease.sine);
    const rot = kf(t, [[289.47, -.14], [293.5, .08]], ease.sine);
    const opt = { t, look: kf(t, [[289.47, [-.3, .75]], [291.6, [0, .8]], [292.6, [-.2, .55]]]), smile: .5 + flare * .25, lid: blinkAt(t, 290.6, .14), swing: swingT(t, 4).map(v => v * 1.3) };
    planeFront(px, py, sc, rot, opt);
    // light: sun hidden behind his body, glowing through the spinning prop discs
    planeFront(px, py, sc, rot, { ...opt, sil: true });
    xf(px, py, sc, rot);
    for (const m of [1, -1]) {
      const c = [px + (m * 280 * Math.cos(rot) - 50 * Math.sin(rot)) * sc, py + (m * 280 * Math.sin(rot) + 50 * Math.cos(rot)) * sc];
      const near = Math.exp(-Math.hypot(c[0] - SX, c[1] - SY) / 260);
      f.save(); f.beginPath(); f.arc(m * 280, 50, 128, 0, TAU); f.clip();
      f.globalCompositeOperation = 'lighter';
      f.fillStyle = rgrad(f, (SX - px) / sc, (SY - py) / sc, 0, 520, [[0, `rgba(255,240,190,${.75 * near + .08})`], [1, 'rgba(0,0,0,0)']]); f.fillRect(m * 280 - 130, -80, 260, 260);
      for (let i = 0; i < 3; i++) { const a = t * 40 * m + m + i * TAU / 3; f.strokeStyle = `rgba(255,250,220,${.35 * near})`; f.lineWidth = 10; f.beginPath(); f.moveTo(m * 280, 50); f.lineTo(m * 280 + Math.cos(a) * 128, 50 + Math.sin(a) * 128); f.stroke(); }
      f.restore();
    }
    unxf();
    if (flare > .02) { // a starburst where the sun breaks past the blades
      f.save(); f.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t * .2, L = (220 + 140 * (i % 2)) * flare; f.strokeStyle = `rgba(255,236,170,${.35 * flare})`; f.lineWidth = 7; f.beginPath(); f.moveTo(SX, SY); f.lineTo(SX + Math.cos(a) * L, SY + Math.sin(a) * L); f.stroke(); }
      f.restore();
    }
  }

  // ---------------------------------------------------------------- E · CABIN MOMENT: fasten your seat belts, then pull out
  const cloudsE = makeClouds(73, 22, [-40, 40], [3, 9], [10, 110], 1.5);
  function seatbelt(t, lt, dur) {
    const pull = ease.inOut(inv(CUE.end, 298, t));
    view({ x: lt * 1.6, z: 30, h: lerp(10, 15, pull), p: lerp(.16, .3, pull), yaw: -1.5, cy: lerp(560, 600, pull) });
    sky(PG.cobalt, PG.cerulean, '#f6e9b8');
    sun(330, horizonY() - 230, 36);
    fields(t);
    highway(t, { w: .1, fork: 0 });
    drawClouds(cloudsE, t, { wind: [-1.2, 0] });
    const sc = lerp(1.3, .5, pull), px = lerp(900, 1160, pull) + Math.sin(lt * .8) * 10, py = lerp(560, 380, pull) + bob(t) * 6;
    const chime = Math.max(hit(t, CUE.please, 2.2) * .8 + (t > CUE.please ? .35 : 0) * (1 - inv(296.2, 296.8, t)), hit(t, CUE.fasten, 3) * .6);
    const belt = ease.inOut(inv(CUE.fasten, CUE.belts - .05, t)), buckle = inv(CUE.belts - .05, CUE.belts + .25, t);
    const happy = inv(CUE.belts + .05, CUE.belts + .4, t);
    const lk = kf(t, [[293.5, [.6, .3]], [CUE.please + .05, [.6, .3]], [CUE.please + .3, [-.2, -.85]], [CUE.fasten + .1, [-.2, -.85]], [CUE.fasten + .4, [-.5, .85]], [CUE.belts + .3, [-.5, .85]], [CUE.belts + .7, [.8, .2]]]);
    planeSide(px, py, sc, -.05 + .02 * Math.sin(lt * 1.1) - pull * .05, { t, look: lk, chime, belt, buckle, squint: happy * .6, lid: .04, smile: .3 + happy * .6, open: hit(t, CUE.please, 5) * .25, swing: swingT(t, 6) });
    // click: a glint on the buckle
    const ck = hit(t, CUE.belts + .1, 7);
    if (ck > .02) { const bx = px + (-196 * Math.cos(-.05) + 8 * Math.sin(-.05)) * sc, by = py + (-196 * Math.sin(-.05) - 8 * Math.cos(-.05)) * sc; glow(bx, by, 120 * sc * (1 + ck), `rgba(255,248,210,${.8 * ck})`); }
  }

  chapter('flight', 278.0, 298.0, [
    [278.0, wide, { paint: { strokeK: 1.3, flowBias: .45 } }],
    [282.07, topdown, { paint: { strokeK: 1.15, flowBias: 0 } }],
    [286.07, closeup, { paint: { strokeK: 1.6, flowBias: .35 } }],
    [289.47, lowangle, { paint: { strokeK: 1.45, flowBias: .6, flowAng: -.35, bloom: 1.4 } }],
    [293.5, seatbelt, { paint: { strokeK: 1.35, flowBias: .4 } }],
  ], { paint: BRUSH });
})();
