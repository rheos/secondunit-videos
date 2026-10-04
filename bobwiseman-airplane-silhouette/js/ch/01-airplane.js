// 71.0 - 91.0  "I'm an airplane on the highway / and I feel so strange / mnuh nuh nuh /
// I'm an airplane on the highway / and I'm sick of the passing lane"
// Silhouette cut paper after Lotte Reiniger. A stubby 1950s prop airliner, black card with lace
// cut-outs, rolls down the highway on car tyres. He reads through his cut-out eye (a pupil on a
// pin), a hinged jaw that opens with the vocal, a turning prop and spoked tyres. Puppets on twos.
//   71.00 cruise    wide, amber light box: lace trees, an onion-dome town far off, ornate poles
//   74.86 highway   low and close; foreground poles whip past; a NO PLANES sign, he looks up at it
//   77.22 strange   uneasy glances; on "strange" (78.38) the box turns violet, the man in the moon
//                   rises, the trees bloom into curls; "mnuh nuh nuh" = three doilies pop on the beats
//   80.88 passing   side on: velvet ropes, a lit red carpet, fifties cars overtaking below him
//   84.24 overhead  straight down: his wings span the lane, cars slide under his wingtip
//   86.45 sick      reverse angle, close, dusk blue: eye roll on "sick" (86.60), then a stretch limo
//                   of top hats and champagne that never ends; a sigh; the moon blinks
(() => {
  const Q = (t) => onTwos(t, 12);
  const STRANGE = 78.38, NUH = [79.13, 79.73, 80.30], LINE2 = 80.88, OVER = 84.24, SICK = 86.45;
  const V = 640;
  const tri = (x, w) => clamp(1 - Math.abs(x) / w);
  const tint = (p, k) => mixh(INK, p.bot, k);

  function base(q) {
    const blink = Math.max(...[72.5, 74.1, 76.0, 82.0, 85.1, 88.4, 90.3].map((bt) => tri(q - bt, .09)));
    return { q, open: clamp((F('voc', q, 1) - .07) / .38), bob: beatPulse(q, 7) * 7, pitch: beatPulse(q, 7) * .012, lid: blink };
  }
  // draw the plane at x,y scale k: back pass (paler), body, then anything that goes between, then the near wing
  function plane(x, y, k, st, p, o = {}) {
    const T = () => { L.translate(x, y); L.scale(o.flip ? -k : k, k); };
    sheet(tint(p, .2), () => { L.save(); T(); planeSide(st, 'back'); L.restore(); });
    sheet(mixh(p.glow, '#ffffff', .35), () => { L.save(); T(); L.translate(0, -(st.hop || 0) - (st.bob || 0)); L.translate(-170, -50); L.rotate(-(st.pitch || 0)); L.translate(170, 50); almond(EYE[0], EYE[1], EYE[2] + 2, EYE[3] + 2); L.fill(); L.restore(); });  // the glass behind the eye
    sheet(INK, () => { o.under?.(); L.save(); T(); planeSide(st, 'body'); L.restore(); });
    o.between?.();
    sheet(INK, () => { L.save(); T(); planeSide(st, 'wing'); L.restore(); }, { rim: 2.5, rimC: mixh(p.glow, '#ffffff', .3) });
  }
  function clouds(p, sc, y0, y1, seed, a = .38) {
    sheet(mixh(p.glow, '#ffffff', .4), () => row(sc, 760, (x, i, r) => cloud(x, y0 + r * (y1 - y0), 300 + r * 160, i + seed), seed), { alpha: a });
  }
  function town(sc, base, amp, seed, every = 1700) {
    hills(sc, base, amp, seed);
    row(sc, every, (x, i, r) => {
      const y = hillY(x + sc, base, amp, seed) + 14;
      for (let k = 0; k < 5; k++) { const dx = (k - 2) * 46 + (hash(i * 9 + k) - .5) * 20, hh = 50 + hash(i * 3 + k) * 60; if (k === 1 || k === 4) minaret(x + dx, y, 9, hh * 1.4); else dome(x + dx, y + 6, 40 + hh * .3, hh); }
    }, seed, 300);
  }
  function midTrees(sc, base, seed, h0, h1, spacing, bloom = 0) {
    hills(sc, base, 34, seed, 300);
    row(sc, spacing, (x, i, r) => tree(x, hillY(x + sc, base, 34, seed, 300) + 10, h0 + r * (h1 - h0), i * 13 + seed, bloom, 0), seed);
  }
  function poles(sc, y, h, spacing, seed, sag = 40) {
    let prev = null;
    row(sc, spacing, (x) => { const tips = pole(x, y, h); if (prev) wires(prev, tips, sag, Math.max(1.5, h * .005)); prev = tips; }, seed, spacing);
  }
  // NO PLANES: an ornate round sign with a little plane cut out of it, struck through
  function noPlanes(x, y, r, postTo) {
    L.fillRect(x - 5, y, 10, postTo - y);
    scallop(x, y, r * 1.12, 20, .06); hole(() => circ(x, y, r));
    L.lineWidth = r * .1; L.beginPath(); L.arc(x, y, r * .98, 0, TAU); L.stroke();
    tf(x, y, 0, r / 90, () => { fp([[60, -6], [40, -22], [-46, -16], [-64, -36], [-74, -32], [-66, 4], [40, 12]], true); fp([[12, -4], [-14, 40], [-28, 40], [-14, -4]]); circ(-24, 16, 10); circ(34, 16, 10); });
    L.save(); L.translate(x, y); L.rotate(-.7); L.fillRect(-r, -r * .07, r * 2, r * .14); L.restore();
  }

  // ---- 71.00 cruise: wide, amber ----
  function cruise(t) {
    const q = Q(t), p = PAL.amber, sc = (q - 71) * V, z = lerp(1, 1.07, ease.inOut(inv(71, 74.86, q)));
    s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-W / 2 - 20, -H / 2 + 10);
    skyBox(p, 1150, 640, 1100);
    clouds(p, sc * .05, 150, 330, 1);
    sheet(tint(p, .62), () => town(sc * .06, 770, 120, 3));
    sheet(tint(p, .36), () => midTrees(sc * .3, 846, 8, 170, 280, 330));
    sheet(tint(p, .14), () => poles(sc * .8, 866, 410, 640, 2));
    const st = base(q), lk = q < 72.94 ? [.8, 0] : q < 74.2 ? [-.15, .2] : [.9, -.1];
    st.look = lk; st.brow = [q > 72.94 && q < 74.2 ? .6 : 0, 0];
    plane(800, 860, 1.05, st, p, { under: () => {
      L.fillRect(-200, 858, W + 400, 34);
      hole(() => row(sc, 150, (x) => L.fillRect(x, 873, 70, 5), 0, 100));
      tufts(sc, 858, 16, 4);
    } });
    sheet(INK, () => { L.fillRect(-200, 968, W + 400, 200); vines(sc * 1.4, 970, 120, 6, 280); tufts(sc * 1.4, 970, 22, 7); });
  }

  // ---- 74.86 highway: low and close; poles whip past in front; the NO PLANES sign ----
  const SIGN_AT = 75.95;                 // when the sign passes over his eye
  function highway(t) {
    const q = Q(t), u = inv(74.86, 77.22, q), p = mixPal(PAL.amber, PAL.rose, ease.inOut(u * .7)), sc = (q - 71) * V;
    skyBox(p, 980, 560, 1000);
    clouds(p, sc * .07, 120, 260, 30);
    sheet(tint(p, .6), () => town(sc * .08, 840, 140, 11, 1300));
    sheet(tint(p, .34), () => midTrees(sc * .35, 930, 21, 260, 400, 420));
    const k = 1.75, px = 640, py = 1000, eye = [px + 206 * k, py - 213 * k];
    const signX = eye[0] + (SIGN_AT - q) * V * 1.1;
    sheet(tint(p, .14), () => { poles(sc * 1.1, 1004, 560, 900, 9, 60); noPlanes(signX, 300, 78, 1004); });
    const st = base(q), g = tri(q - SIGN_AT, .75);
    st.look = [lerp(.85, clamp((signX - eye[0]) / 260, -1, 1), g), lerp(.05, -1, g)];
    st.brow = [lerp(.1, 1.3, g), 0];
    if (q > SIGN_AT + .5) { const v = smooth(inv(SIGN_AT + .5, SIGN_AT + .9, q)); st.brow = [.2, 1.1 * v]; st.low = .25 * v; st.look = [lerp(st.look[0], -.6, v), lerp(st.look[1], .1, v)]; }
    plane(px, py, k, st, p, { under: () => { L.fillRect(-200, 998, W + 400, 40); hole(() => row(sc * 1.6, 200, (x) => L.fillRect(x, 1014, 90, 7), 0, 100)); tufts(sc * 1.6, 998, 22, 12); } });
    // foreground poles, rim-lit so they separate from him as they whip past
    sheet(INK, () => poles(sc * 2.6 + 700, 1120, 1020, 1900, 17, 80), { rim: 5, rimC: p.glow });
  }

  // ---- 77.22 strange: uneasy, then the light box turns violet, the moon rises, doilies pop ----
  function strange(t) {
    const q = Q(t), on = q >= STRANGE, k_ = smooth(inv(STRANGE, STRANGE + .3, q)), sc = (q - 71) * V;
    const pre = mixPal(PAL.amber, PAL.rose, .55), p = mixPal(pre, PAL.violet, k_);
    skyBox(p, 900, 600, 1000 + 300 * k_);
    if (on) {
      const mr = ease.back(inv(STRANGE, STRANGE + .7, q)), my = lerp(640, 210, mr);
      s.fillStyle = rgrad(250, my, 0, 300, [[0, p.glow + '99'], [1, p.glow + '00']]); s.fillRect(0, 0, W, H);
      const nuh = Math.max(...NUH.map((bt) => hit(q, bt, 9) * (q >= bt ? 1 : 0)));
      moon(250, my, 115, mixh(p.glow, '#ffffff', .5), tri(q - 80.6, .1), nuh);
      sheet(mixh(p.glow, '#ffffff', .4), () => { for (let i = 0; i < 14; i++) { const ap = STRANGE + .1 + i * .1; if (q < ap) continue; const r = (7 + hash(i * 3) * 9) * ease.back(inv(ap, ap + .2, q)); starP(80 + hash(i * 7 + 1) * 1760, 60 + hash(i * 11 + 2) * 380, r, 4, .3, 0); } });
    }
    clouds(p, sc * .05, 160, 320, 50, .3 * (1 - k_) + .12);
    const bloom = ease.out(inv(STRANGE, STRANGE + .7, q));
    sheet(tint(p, .6), () => town(sc * .06, 800, 120, 23));
    sheet(tint(p, .34), () => midTrees(sc * .3, 880, 31, 200, 320, 360, bloom));
    // three doilies, one per "nuh"
    sheet(INK, () => NUH.forEach((bt, i) => { if (q < bt) return; const [x, y, r] = [[1160, 250, 120], [1480, 170, 96], [1730, 330, 128]][i]; rosette(x, y, r * ease.back(inv(bt, bt + .22, q)), q * (i % 2 ? -.8 : .8) + i, 12); }));
    sheet(tint(p, .14), () => poles(sc * .8, 908, 430, 640, 41));
    const st = base(q);
    if (!on) {
      const seq = [[-.85, -.15], [.95, -.35], [-.5, .6], [.9, .2]], i = clamp(Math.floor((q - 77.22) / .3), 0, 3);
      st.look = seq[i]; st.brow = [.5, -1]; st.low = .2;
    } else {
      st.look = [.9 * Math.cos(q * 5), -.5 + .4 * Math.sin(q * 7)]; st.brow = [1.4, 0]; st.lid = 0;
      const hops = [STRANGE, ...NUH].map((bt) => q >= bt ? Math.sin(Math.PI * clamp((q - bt) / .4)) : 0);
      st.hop = 46 * Math.max(...hops); st.rudder = .2 * Math.sin(q * 20) * k_;
      const snap = Math.max(...NUH.map((bt) => q >= bt ? hit(q, bt, 7) : 0));
      if (q > 79.0) st.open = Math.max(st.open * .4, snap * .9);
      st.look = q > 79.0 ? [.2, -.9] : st.look;
    }
    const shiver = on ? 0 : snoise(q * 24, 5) * 3;
    plane(840 + shiver, 905, 1.25, st, p, { under: () => { L.fillRect(-200, 903, W + 400, 36); hole(() => row(sc, 150, (x) => L.fillRect(x, 919, 70, 5), 0, 100)); tufts(sc, 903, 18, 14); } });
    sheet(INK, () => { L.fillRect(-200, 1012, W + 400, 200); vines(sc * 1.4, 1014, 110 + 60 * bloom, 16, 300); });
    fx({ flash: on ? .42 * hit(t, STRANGE, 9) : 0 });
  }

  // ---- 80.88 passing: side on, velvet ropes, a lit red carpet, cars overtaking below him ----
  const CARS = [[81.05, 1150, 1], [81.95, 1250, 1], [82.75, 1100, 1.15], [83.55, 1300, 1]];
  function passing(t) {
    const q = Q(t), p = PAL.rose, sc = (q - 71) * V;
    skyBox(p, 1000, 520, 1000);
    clouds(p, sc * .05, 120, 280, 70);
    sheet(tint(p, .6), () => town(sc * .06, 610, 110, 61, 1400));
    sheet(tint(p, .34), () => midTrees(sc * .3, 690, 63, 170, 260, 320));
    sheet(tint(p, .14), () => poles(sc * .8, 702, 420, 620, 64, 34));
    // the passing lane: a lit red carpet on the light box
    s.fillStyle = vgrad(728, 905, [[0, '#f0a29a'], [.5, '#e0625e'], [1, '#b8343e']]); s.fillRect(-W, 728, W * 3, 182);
    const st = base(q);
    let best = null; for (const c of CARS) { const x = -420 + (q - c[0]) * c[1]; if (x > -300 && x < W + 100 && (best === null || Math.abs(x - 900) < Math.abs(best - 900))) best = x; }
    st.look = best === null ? [.7, .3] : [clamp((best - 980) / 400, -1, 1), 1]; st.brow = [.2, .7]; st.low = .15;
    plane(760, 700, 1.0, st, p, {
      under: () => {
        L.fillRect(-200, 698, W + 400, 30);
        row(sc, 250, (x) => stanchion(x, 740, 70), 0, 260);
        let prev = null; row(sc, 250, (x) => { if (prev !== null) swag([prev, 676], [x, 676], 14, 7); prev = x; }, 0, 260);
      },
      between: () => sheet(INK, () => {
        L.fillRect(-200, 905, W + 400, 300);
        hole(() => row(sc * 1.25, 34, (x) => { L.beginPath(); L.arc(x, 905, 12, 0, Math.PI); L.fill(); circ(x, 935, 4); }, 0, 60));
        for (const [t0, v, str] of CARS) { const x = -420 + (q - t0) * v; if (x > -700 && x < W + 500) tf(x, 908, 0, 1.4, () => carSide(q, str, 0, 1)); }
      }, { rim: 4, rimC: '#ffd8c8' }),
    });
  }

  // ---- 84.24 overhead: straight down; his wings span the lane; cars slide under his wingtip ----
  const TOPCARS = [[84.2, 900, 1], [85.05, 820, 1.1], [85.85, 950, 1]];
  function overhead(t) {
    const q = Q(t), p = PAL.green, sc = (q - 71) * 560;
    s.fillStyle = vgrad(0, H, [[0, mixh(p.bot, p.top, .25)], [.5, p.bot], [1, mixh(p.bot, p.top, .25)]]); s.fillRect(-W, -H, W * 3, H * 3);
    s.fillStyle = rgrad(900, 560, 0, 700, [[0, p.glow], [1, p.glow + '00']]); s.fillRect(0, 0, W, H);
    sheet(tint(p, .5), () => { L.fillRect(-200, -200, W + 400, 530); L.fillRect(-200, 880, W + 400, 400); });
    sheet(INK, () => {
      row(sc, 260, (x, i, r) => rosette(x, 150 + r * 90, 90 + r * 40, i, 10), 3);
      row(sc, 300, (x, i, r) => rosette(x, 990 + r * 50, 80 + r * 40, i * 2, 10), 9);
      // ornamental borders: the verge edge, and the carpet's two edges with stanchions and swags
      row(sc, 40, (x) => { L.beginPath(); L.arc(x, 330, 20, 0, Math.PI); L.fill(); }, 0, 60);
      L.fillRect(-200, 322, W + 400, 10);
      for (const y of [608, 872]) { L.fillRect(-200, y - 3, W + 400, 6); row(sc, 30, (x) => tf(x, y + (y < 700 ? 12 : -12), Math.PI / 4, 1, () => L.fillRect(-5, -5, 10, 10)), 0, 60); }
      let prev = null; row(sc, 170, (x) => { circ(x, 622, 11); if (prev !== null) { L.lineWidth = 6; L.beginPath(); L.moveTo(prev, 622); L.quadraticCurveTo((prev + x) / 2, 652, x, 622); L.stroke(); } prev = x; }, 0, 200);
      for (const [t0, v, str] of TOPCARS) { const x = -380 + (q - t0) * v; if (x > -600 && x < W + 400) tf(x, 752, 0, .92, () => carTop(q, str)); }
    });
    const near = TOPCARS.map((c) => -380 + (q - c[0]) * c[1]).filter((x) => x > -200 && x < W).sort((a, b) => Math.abs(a - 880) - Math.abs(b - 880))[0];
    const st = { q, look: near === undefined ? [.6, .5] : [clamp((near - 1000) / 300, -1, 1), 1], lid: base(q).lid };
    const wob = Math.sin(q * 9) * 3;
    sheet(INK, () => tf(880, 466 + wob, 0, .84, () => planeTop(st)), { rim: 6, rimC: p.glow });
  }

  // ---- 86.45 sick: reverse angle, close, dusk. eye roll; the endless limo; the sigh ----
  const LIMO_T = 86.95, LIMO_V = 640, CAR2 = [86.3, 1500];
  function sick(t) {
    const q = Q(t), u = ease.inOut(inv(86.45, 90.5, q)), p = mixPal(mixPal(PAL.rose, PAL.violet, .6), PAL.blue, u), sc = -(q - 71) * V;
    skyBox(p, 760, 480, 1000);
    const mr = ease.out(inv(87.6, 89.6, q)), my = lerp(860, 190, mr);
    s.fillStyle = rgrad(330, my, 0, 300, [[0, p.glow + '88'], [1, p.glow + '00']]); s.fillRect(0, 0, W, H);
    moon(330, my, 105, mixh(p.glow, '#ffffff', .5), tri(q - 90.35, .1), 0);
    sheet(mixh(p.glow, '#ffffff', .4), () => { for (let i = 0; i < 10; i++) { const ap = 88.6 + i * .17; if (q < ap) continue; starP(60 + hash(i * 7 + 5) * 900, 40 + hash(i * 11 + 9) * 300, (6 + hash(i) * 8) * ease.back(inv(ap, ap + .2, q)), 4, .3, 0); } });
    sheet(tint(p, .58), () => town(sc * .06, 760, 120, 77, 1200));
    sheet(tint(p, .32), () => midTrees(sc * .3, 830, 79, 220, 330, 380));
    sheet(tint(p, .14), () => poles(sc * .8, 842, 520, 760, 81, 46));
    s.fillStyle = vgrad(866, 988, [[0, mixh('#f0a29a', p.glow, .3)], [.5, mixh('#d0545a', p.bot, .35)], [1, mixh('#9a2a3a', p.top, .3)]]); s.fillRect(-W, 866, W * 3, 124);
    const st = base(q);
    st.look = [.7, .3]; st.brow = [.2, .5];
    const r = inv(86.55, 87.25, q);
    if (r > 0 && r < 1) { const th = lerp(-.3, Math.PI + .3, ease.inOut(r)); st.look = [Math.cos(th), -Math.sin(th) * 1.15]; st.lid = Math.max(st.lid, .38); st.brow = [1.2, -.4]; }
    if (q >= 87.25) { const limoFront = 2100 - (q - LIMO_T) * LIMO_V; st.look = [.15 + .25 * Math.sin((q - 87.25) * 2.2), 1.05]; st.lid = Math.max(st.lid, .34); st.brow = [0, 1.2]; }
    if (q >= 89.3) { const v = smooth(inv(89.3, 89.9, q)); st.lid = Math.max(st.lid, .5 * v); st.low = .18 * v; st.brow = [-.3 * v, -.6 * v]; st.look = [.6, .55]; st.open = Math.max(st.open, .55 * tri(q - 89.75, .45)); st.pitch -= .025 * tri(q - 89.75, .5); }
    plane(1330, 840, 2.0, st, p, {
      flip: true,
      under: () => { L.fillRect(-200, 838, W + 400, 30); hole(() => row(sc, 160, (x) => L.fillRect(x, 851, 80, 6), 0, 100)); },
      between: () => sheet(INK, () => {
        L.fillRect(-200, 986, W + 400, 300);
        hole(() => row(sc * 1.25, 34, (x) => { L.beginPath(); L.arc(x, 986, 12, 0, Math.PI); L.fill(); }, 0, 60));
        const cx = 2100 - (q - CAR2[0]) * CAR2[1]; if (cx > -500 && cx < W + 500) tf(cx, 990, 0, 1.5, () => { L.scale(-1, 1); carSide(q, 1); });
        const lx = 2100 - (q - LIMO_T) * LIMO_V; if (q > LIMO_T - .4) tf(lx, 990, 0, 1.5, () => { L.scale(-1, 1); carSide(q, 7.5); });
      }, { rim: 4, rimC: p.glow }),
    });
    // the sigh: three scalloped puffs float up from his mouth
    const mouth = [1330 - 290 * 2, 840 - 140 * 2];
    sheet(mixh(p.glow, '#ffffff', .3), () => { for (let k = 0; k < 3; k++) { const v = (q - 89.7 - k * .16) / 1.1; if (v < 0 || v >= 1) continue; alpha(1 - v, () => scallop(mouth[0] - 40 - v * 200 - k * 18, mouth[1] - v * 150 - k * 24, 24 + v * 40, 8, .16, k)); } }, { alpha: .85 });
  }

  chapter('airplane', 71.0, 91.0, [[71.0, cruise], [74.86, highway], [77.22, strange], [LINE2, passing], [OVER, overhead], [SICK, sick]]);
})();
