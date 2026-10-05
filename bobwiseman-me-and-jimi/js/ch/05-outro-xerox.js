// 187.0 - 207.9  OUTRO, leg 1 (photocopy world): the train runs back through the years.
// We ride the front of the train: rails rush to a vanishing point, telegraph poles whip past on the beat,
// old flyers fly at the glass; a flap counter on the dash runs the years BACKWARDS, 1987 to 1966.
// At 207.9 (a hit) the tunnel mouth swallows the frame: toner black, the cut to the light show.
(() => {
  const K = XINK.K, Pk = XINK.P, T = (x) => onTwos(x, 12);
  const A = 187.0, B = 207.9, VX = W / 2, VY = 430;
  function rk(x, y, w, h, c) { s.fillStyle = c; s.fillRect(x, y, w, h); }
  function quad(p, c) { s.beginPath(); p.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.fillStyle = c; s.fill(); }
  function shotRide(t, l) {
    const tt = T(t), sp = 1 + inv(A, 195, t) * 2.5;
    fx({ gen: .5, bar: HIT.some((h) => t >= h && t < h + .4) ? (t - HIT.find((h) => t >= h && t < h + .4)) / .4 : -1 });
    rk(0, 0, W, H, K(.08));
    // ground and sky split at the horizon; the ground in speckled grey
    rk(0, VY, W, H - VY, K(.62));
    // the rails and sleepers, rushing toward us
    quad([[VX - 6, VY], [VX + 6, VY], [VX + 520, H], [VX - 520, H]], K(.3));
    for (let i = 0; i < 14; i++) { const z = ((i / 14) + tt * .9 * sp) % 1, y = VY + (H - VY) * z * z, w = 12 + 1040 * z * z; rk(VX - w / 2, y, w, 4 + 26 * z * z, K(.9)); }
    s.lineWidth = 10; s.strokeStyle = K(); s.beginPath(); s.moveTo(VX - 4, VY); s.lineTo(VX - 380, H); s.moveTo(VX + 4, VY); s.lineTo(VX + 380, H); s.stroke();
    // telegraph poles flick past, one per beat, alternating sides
    const bi = lastBeat(tt);
    for (let k = 0; k < 4; k++) {
      const j = bi - k, b = FEAT.beats[j]; if (b === undefined) continue; const z = clamp((tt - b) * .9 * sp); if (z >= 1) continue;
      const side = j % 2 ? 1 : -1, x = VX + side * (40 + 1500 * z * z), top = VY - 40 - 900 * z * z, bot = VY + (H - VY) * z * z + 10;
      rk(x - (3 + 30 * z), top, 6 + 60 * z, bot - top, K(.95)); rk(x - (20 + 160 * z), top + 10, 40 + 320 * z, 6 + 14 * z, K(.95));
    }
    // flyers flying at the glass
    for (let k = 0; k < 6; k++) {
      const st = A + 1 + k * 3.1, a = tt - st; if (a < 0 || a > 1.4) continue; const z = a / 1.4, x = VX + (hash(k) - .5) * 900 * z, y = VY - 100 + (hash(k + 3) - .5) * 300 * z, sz = 40 + 900 * z * z;
      s.save(); s.translate(x, y); s.rotate((hash(k + 5) - .5) * 2 * z); rk(-sz / 2, -sz * .65, sz, sz * 1.3, K(.05)); rk(-sz * .4, -sz * .5, sz * .8, sz * .2, k % 2 ? Pk(.9) : K(.9)); rk(-sz * .4, -sz * .2, sz * .8, sz * .4, K(.5)); s.restore();
    }
    // the dash: a flap counter running the years backwards
    rk(0, H - 150, W, 150, K(.95));
    const yr = Math.round(lerp(1987, 1966, ease.inOut(inv(A + .5, B - 1.5, t))));
    [...String(yr)].forEach((ch, i) => { rk(VX - 190 + i * 96, H - 132, 86, 112, K(.7)); s.font = '700 92px "Helvetica Neue"'; s.fillStyle = XINK.PAPER; s.textAlign = 'center'; s.fillText(ch, VX - 147 + i * 96, H - 42); });
    // the tunnel mouth: grows from the vanishing point, then swallows the frame on the hit
    const tun = ease.in(inv(B - 2.4, B, t));
    if (tun > 0) { const r = 30 + tun * 1400; s.fillStyle = K(); s.beginPath(); s.ellipse(VX, VY + 40 * tun, r, r * .8, 0, Math.PI, 0); s.lineTo(VX + r, VY + 40 * tun + r * .9); s.lineTo(VX - r, VY + 40 * tun + r * .9); s.closePath(); s.fill(); }
  }
  const HIT = [188.87, 190.20];
  chapter('outro-x', A, B, [[A, shotRide]]);
})();
