// TEST, song 71.0 - 81.0: "I'm an airplane on the highway / and I feel so strange / mnuh nuh nuh".
// Sleeve collage + metamorphosis (Robin, 2026-10-03: "the sleeve collage does.. and the metamorphosis is
// pretty cool"). The generated plane (H3, keyed) is pasted in as a cut-out over a Midjourney collage plate;
// on "strange" the whole world melts and flows into a second, stranger collage, then congeals.
(() => {
  const T0 = 71.0, STRANGE = 77.2, SETTLE = 79.1;
  const img = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('missing ' + src)); i.src = src; });
  const A = {}, FR = [];
  window.__assets = (async () => {
    A.a = await img('assets/plate-a.png'); A.b = await img('assets/plate-b.png');
    const jobs = []; for (let i = 0; i < 240; i++) jobs.push(img(`assets/plane/${String(i).padStart(4, '0')}.png`).then((im) => { FR[i] = im; }));
    await Promise.all(jobs); return true;
  })();

  // draw a plate filling the frame, melted: vertical strips sag and swing (drips), rows slide (flow).
  // m 0..1 is how far gone it is; ph is the phase so it keeps moving.
  function melted(im, m, ph, alpha = 1, pan = 0) {
    const k = Math.max(W / im.width, H / im.height) * 1.08, iw = im.width * k, ih = im.height * k, ox = (W - iw) / 2 - pan, oy = (H - ih) / 2;
    s.save(); s.globalAlpha = alpha;
    if (m <= .001) { s.drawImage(im, ox, oy, iw, ih); s.restore(); return; }
    const sw = 5;
    for (let x = 0; x < W; x += sw) {
      const drip = (Math.sin(x * .011 + ph * 1.7) * .5 + Math.sin(x * .027 - ph * 2.3) * .3 + noise1(x * .02 + ph, 3) * .4) * 90 * m;
      const swing = Math.sin(x * .006 + ph) * 40 * m;
      const sx = (x - ox + swing) / k, sh = im.height;
      const stretch = 1 + .25 * m * (.5 + .5 * Math.sin(x * .009 + ph * 1.3));
      s.drawImage(im, sx, 0, sw / k + .5, sh, x, oy + drip - (stretch - 1) * ih * .3, sw + .5, ih * stretch);
    }
    s.restore();
  }

  function shot(t, lt) {
    const m = smooth(inv(STRANGE - .1, STRANGE + 1.0, t)) * (1 - smooth(inv(SETTLE, SETTLE + 1.3, t)) * .75);
    const toB = smooth(inv(STRANGE + .3, STRANGE + 1.5, t));
    const ph = t * 1.4;
    fx({ melt: m });
    fill('#1c1a17');
    melted(A.a, m * (1 - toB * .5), ph, 1, lt * 22);
    if (toB > 0) melted(A.b, m * (1 - toB) + .25 * m, ph + 2, toB, lt * 14);
    // the plane, pasted on: white scissor rim, a hard paper shadow, bobbing on the beat
    const f = clamp(Math.floor((t - T0) * 24), 0, 239), pl = FR[f];
    const bob = Math.abs(Math.sin((t - T0) * Math.PI / .557)) * 8;
    const wob = m * Math.sin(t * 6) * .06;
    const ph2 = 1 + m * .06 * Math.sin(t * 4);
    const hh = H * .62, ww = hh * pl.width / pl.height;
    withT(() => {
      s.translate(W * .55, H * .9 - bob); s.rotate(wob); s.scale(ph2, 2 - ph2);
      s.filter = 'drop-shadow(10px 14px 0 rgba(20,14,10,.55))';
      s.drawImage(pl, -ww / 2, -hh, ww, hh);
      s.filter = 'drop-shadow(0 0 0 #fff) drop-shadow(3px 0 0 #f3eee2) drop-shadow(-3px 0 0 #f3eee2) drop-shadow(0 3px 0 #f3eee2) drop-shadow(0 -3px 0 #f3eee2)';
      s.drawImage(pl, -ww / 2, -hh, ww, hh);
      s.filter = 'none';
    });
  }
  chapter('collage', 71.0, 81.0, [[71.0, shot]]);
})();
