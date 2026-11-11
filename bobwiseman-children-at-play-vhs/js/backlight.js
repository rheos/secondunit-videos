// backlight.js · composite a layer of dark silhouettes as if the low sun were behind them:
// a warm halo around every outline, a bright rim on the top and sun-side edges, the dark shape on top.
// Layers are full-frame canvases; everything here is pure (depends only on its inputs).
(function () {
  const pool = new Map();
  function scratch(key, w, h) {
    let c = pool.get(key);
    if (!c || c.width !== w || c.height !== h) { c = document.createElement('canvas'); c.width = w; c.height = h; pool.set(key, c); }
    return c;
  }
  function tint(src, color, key) {
    const c = scratch(key, src.width, src.height), g = c.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, c.width, c.height); g.drawImage(src, 0, 0);
    g.globalCompositeOperation = 'source-in'; g.fillStyle = color; g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = 'source-over';
    return c;
  }
  // o: { rim, glow, glowBlur, rimW, sunDir:[x,y] (unit vector from shape toward the sun, screen space), strength }
  function composite(dst, layer, o) {
    const k = o.strength == null ? 1 : o.strength;
    const rim = tint(layer, o.rim, 'rim');
    dst.save();
    dst.setTransform(1, 0, 0, 1, 0, 0);
    if (k > 0) {
      dst.globalAlpha = 0.85 * k;
      dst.shadowColor = o.glow; dst.shadowBlur = o.glowBlur;
      dst.drawImage(rim, 0, 0);
      dst.shadowBlur = 0; dst.shadowColor = 'transparent';
      dst.globalAlpha = k;
      const r = o.rimW, sd = o.sunDir || [0, -1];
      dst.drawImage(rim, sd[0] * r, sd[1] * r);
      dst.drawImage(rim, sd[0] * r * 0.5 - sd[1] * r * 0.35, sd[1] * r * 0.5 + sd[0] * r * 0.35);
      dst.drawImage(rim, sd[0] * r * 0.5 + sd[1] * r * 0.35, sd[1] * r * 0.5 - sd[0] * r * 0.35);
    }
    dst.globalAlpha = 1;
    dst.drawImage(layer, 0, 0);
    dst.restore();
  }
  window.BACKLIGHT = { composite, scratch };
})();
