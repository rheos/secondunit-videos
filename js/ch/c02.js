// c02 · BOTTLE OF RAIN + CHORUS 1 (37.7 - 56.88). The approved look probe, now a chapter.
(() => {
  // ---- shots ----
  // 37.7: an arched window wrapped in ironwork tendrils; a Galle glass bottle on the sill fills with rain; vines grow
  function window_(t, lt, dur) {
    cam(540, kf(lt, [[0, 900], [dur, 1040]]), kf(lt, [[0, 1.0], [dur, 1.3]]));
    s.fillStyle = C.night; s.fillRect(-W, -H, W * 3, H * 3);
    halo(540, 520, 360, t * .05);
    // the wall: plum stucco
    shape(s, [[-200, 900], [1280, 900], [1280, 2400], [-200, 2400]], C.plum, null);
    // arched window
    const wx = 230, wy = 640, ww = 620, wh = 820;
    shape(s, [[wx, wy + wh], [wx, wy + ww / 2], ...circle(wx + ww / 2, wy + ww / 2, ww / 2).filter(([, py]) => py <= wy + ww / 2 + .1).sort((a, b) => a[0] - b[0]), [wx + ww, wy + ww / 2], [wx + ww, wy + wh]], C.amber, C.umber, 24);
    glowAt(540, wy + wh * .55, 520, 'rgba(255,190,110,.4)');
    // ironwork tendrils climbing the frame, growing through the line
    const gu = inv(0, dur, lt);
    for (const sx of [1, -1]) { const x0 = sx > 0 ? wx - 10 : wx + ww + 10; vine(s, whip([x0, wy + wh + 60], [x0 - sx * 120, wy + wh * .6], [x0 + sx * 60, wy + wh * .2], [x0 + sx * 150, wy + 40], .9, sx, 50), 26, 10, C.olive, .35 + .65 * gu);
      for (let i = 0; i < 4; i++) if (gu > .2 + i * .18) petal(s, x0 - sx * (30 + i * 10), wy + wh - i * 170, Math.PI + sx * (.6 + i * .3) - (sx > 0 ? Math.PI : 0), 80, 26, C.sage); }
    // sill and the glass bottle (Galle: tall, swelling, floral)
    shape(s, [[wx - 70, wy + wh], [wx + ww + 70, wy + wh], [wx + ww + 90, wy + wh + 60], [wx - 90, wy + wh + 60]], C.ochre, C.umber, 14);
    const bx = 600, by = wy + wh, bh = 360, fillK = kf(lt, [[0, .1], [dur - .1, .9]]);
    const bottle = [...cub([bx - 30, by - bh], [bx - 40, by - bh * .6], [bx - 120, by - bh * .45], [bx - 90, by], 20), ...cub([bx + 90, by], [bx + 120, by - bh * .45], [bx + 40, by - bh * .6], [bx + 30, by - bh], 20)];
    shape(s, bottle, C.glass, C.umber, 14);
    s.save(); P(s, bottle); s.closePath(); s.clip(); shape(s, [[bx - 200, by - bh * .9 * fillK + Math.sin(t * 6) * 6], [bx + 200, by - bh * .9 * fillK - Math.sin(t * 6) * 6], [bx + 200, by], [bx - 200, by]], C.teal, null);
    lily(s, bx, by - bh * .35, -Math.PI / 2, 90, .6, [C.rose, C.cream]); s.restore();
    glowAt(bx - 50, by - bh * .5, 60, 'rgba(220,255,240,.35)');
    rain(t, 120, 7, .55);
    border(t, gu);
  }
  // CLAP 1 (41.6): slender hands meet in front of a turning halo; lilies open around the ring on the clap
  function clap1(t, lt, dur) {
    const k = CLAPS[0], ok = ease.back(inv(k, k + .8, t));
    cam(540, kf(lt, [[0, 900], [dur, 860]]), kf(lt, [[0, 1.12], [.5, 1.0], [dur, .96]], ease.out));
    s.fillStyle = C.deep; s.fillRect(-W, -H, W * 3, H * 3);
    halo(540, 860, 520, t * .08, .25 * hit(t, k, 1.5) + .1);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t * .08, R = 560; lily(s, 540 + Math.cos(a) * R, 860 + Math.sin(a) * R, a, 120, ok * (i % 2 ? 1 : ease.back(inv(HANDS[0], HANDS[0] + .8, t))), i % 2 ? [C.cream, C.blush] : [C.gold, C.cream]); }
    clapPair(t, 540, 760, 300, k);
    glowAt(540, 1000, 300, `rgba(255,230,180,${.18 * hit(t, k, 3)})`);
    rain(t, 70, 11, .4);
    border(t, 1);
  }
  // CLAP 2 (46.0): two Guimard lily-bud lamps over the wet street; they light on the clap, the hands between them
  function clap2(t, lt, dur) {
    const k = CLAPS[1], on = clamp(inv(k - .05, k + .1, t)) * (.85 + .15 * Math.sin(t * 17));
    cam(kf(lt, [[0, 500], [dur, 580]]), 980, kf(lt, [[0, .96], [dur, 1.1]]));
    s.fillStyle = C.night; s.fillRect(-W, -H, W * 3, H * 3);
    shape(s, [[-300, 1400], [1400, 1400], [1400, 2400], [-300, 2400]], C.dusk, null);
    // reflections of the lamps in the wet street
    for (const x of [170, 910]) for (let i = 0; i < 7; i++) { s.fillStyle = on ? C.ruby : C.plum; s.fillRect(x - 40 + Math.sin(t * 3 + i) * 14, 1450 + i * 70, 80 - i * 7, 26); if (on) glowAt(x, 1450 + i * 70, 70, `rgba(255,120,60,${.25 * on})`); }
    guimard(80, 1400, 1050, 1, on, Math.sin(t * .8) * 8); guimard(1000, 1400, 1050, -1, on, -Math.sin(t * .8) * 8);
    clapPair(t, 540, 820, 240, k, { tone: C.cream });
    rain(t, 150, 13, .55);
    border(t, 1);
  }
  // CLAP 3 (50.0): a stained-glass window of irises; on each beat after the clap another pane lights
  function clap3(t, lt, dur) {
    const k = CLAPS[2];
    cam(540, 1000, kf(lt, [[0, 1.12], [dur, .97]], ease.out));
    s.fillStyle = C.plum; s.fillRect(-W, -H, W * 3, H * 3);
    const bi = lastBeat(t), b0 = lastBeat(k);
    const lights = [0, 1, 2, 3].map((i) => t >= k ? clamp(inv(FEAT.beats[b0 + i] || 0, (FEAT.beats[b0 + i] || 0) + .25, t)) * (.8 + .2 * beatPulse(t, 6)) : 0);
    glassPanel(140, 300, 800, 1500, t, lights);
    clapPair(t, 540, 1360, 190, k, { tone: C.blush });
    glowAt(540, 1500, 260, `rgba(255,230,180,${.5 * hit(t, k, 3)})`);
    border(t, 1);
  }
  // CLAP 4 (54.1): the big one: hands huge in the halo, every tendril in the frame spirals open at once
  function clap4(t, lt, dur) {
    const k = CLAPS[3], u = ease.out(inv(k - .1, k + 1.0, t));
    cam(540, 900, kf(lt, [[0, 1.0], [dur, 1.16]], ease.in));
    s.fillStyle = C.teal; s.fillRect(-W, -H, W * 3, H * 3);
    halo(540, 860, 600, -t * .1, .3 + .4 * hit(t, k, 2));
    // tendrils whip out of the ring on the clap and curl
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + .13, dir = i % 2 ? 1 : -1, R = (q) => [540 + Math.cos(a + q[1] * dir) * q[0], 860 + Math.sin(a + q[1] * dir) * q[0]];
      vine(s, whip(R([610, 0]), R([720, .12]), R([820, .32]), R([880, .5]), .8, dir, 36), 30, 12, i % 3 ? C.sage : C.gold, u); }
    clapPair(t, 540, 700, 360, k);
    glowAt(540, 900, 520, `rgba(255,225,170,${.3 * hit(t, k, 3)})`);
    rain(t, 60, 19, .35);
    border(t, 1);
  }
  chapter('c02', 37.7, 56.88, [[37.7, window_], [CLAPS[0] - .45, clap1], [CLAPS[1] - .45, clap2], [CLAPS[2] - .45, clap3], [CLAPS[3] - .45, clap4]], { fx: PAINT });
})();
