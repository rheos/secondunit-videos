// 58.23 - 66.07  THE WAVE, paper theatre: Hokusai's Great Wave (Met scan, CC0, _in/paper-sources/SOURCES.md)
// cut into pieces with scissors and worked like a toy theatre. Nothing is redrawn: every piece is the print.
//   58.23  the great wave rises from below the stage on its rod; the boats rock; the sky slides
//   59.43  the wordless vocal: the wave tips forward over the boats, spray thrown off (a few drops are records)
//   61.0+  it rocks back and forth on its pivot, the foreground swell bobbing against it, the camera drifting in
const LOOK = {
  span: [58.23, 66.07],
  frag: `
uniform float flash;
void main(){
  vec3 c = texture(src, uv).rgb;
  vec2 px = uv * res;
  c *= 1. + (fbm(px * .05) - .5) * .05;
  c += (vn(px * .5 + t * 61.) - .5) * .025;
  vec2 v = uv - .5; c *= 1. - dot(v, v) * .7;
  c += flash * .4;
  o = vec4(c, 1.);
}`,
  uniforms: (t, X) => ({ flash: X.flash ?? 0 }),
};
(() => {
  const CR = 59.43, K = 3859 / 1200;                // polygons below are in 1200-wide preview units
  let IM = null; const P = {};
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };
  // scissor a polygon into a jagged cut: straight snips with small changes of angle
  function snip(pts, seed, wob = 1.2) {
    const r = rng(seed), out = [];
    pts.forEach(([x0, y0], i) => { const [x1, y1] = pts[(i + 1) % pts.length]; const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 18));
      for (let k = 0; k < n; k++) { const u = k / n, nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1, j = k ? (r() - .5) * 2 * wob : 0; out.push([lerp(x0, x1, u) + nx / L * j, lerp(y0, y1, u) + ny / L * j]); } });
    return out;
  }
  // cut a piece: polygon (preview units) -> canvas at full scan resolution with a cream paper edge; anchor in scan px
  function cut(name, poly, seed) {
    const pts = snip(poly, seed).map(([x, y]) => [x * K, y * K]);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), pad = 14;
    const x0 = Math.max(0, Math.min(...xs) - pad), y0 = Math.max(0, Math.min(...ys) - pad), x1 = Math.min(IM.width, Math.max(...xs) + pad), y1 = Math.min(IM.height, Math.max(...ys) + pad);
    const c = mk(x1 - x0, y1 - y0), g = c.getContext('2d'), path = new Path2D();
    pts.forEach(([x, y], i) => i ? path.lineTo(x - x0, y - y0) : path.moveTo(x - x0, y - y0)); path.closePath();
    g.lineJoin = 'miter'; g.lineWidth = 12; g.strokeStyle = 'rgb(240,232,214)'; g.stroke(path); g.fillStyle = 'rgb(240,232,214)'; g.fill(path);
    g.save(); g.clip(path); g.drawImage(IM, -x0, -y0); g.restore();
    P[name] = { c, x0, y0 };
  }
  // inside a piece, above-right of (xmin, ymax) in preview units, make the sky transparent: sky has r - b of
  // about 35, foam 8-19 (sampled from the scan)
  function keySky(name, xmin, ymax) {
    const p = P[name], g = p.c.getContext('2d'), d = g.getImageData(0, 0, p.c.width, p.c.height), a = d.data, w = p.c.width;
    for (let i = 0; i < a.length; i += 4) {
      const x = (i / 4) % w + p.x0, y = Math.floor(i / 4 / w) + p.y0; if (x < xmin * K || y > ymax * K) continue;
      const rb = a[i] - a[i + 2], k = clamp((rb - 22) / 8); a[i + 3] = Math.round(a[i + 3] * (1 - k));
    }
    g.putImageData(d, 0, 0);
  }
  // draw a piece where it sits in the print (scan px), moved by dx, dy, rotated by rot about pivot (scan px)
  function put(name, { dx = 0, dy = 0, rot = 0, px = 0, py = 0, sh = 1 } = {}) {
    const p = P[name]; if (!p) return;
    s.save();
    if (sh > 0) { s.shadowColor = `rgba(20,16,10,${.45 * sh})`; s.shadowBlur = 30 * sh; s.shadowOffsetX = 10 * sh; s.shadowOffsetY = 16 * sh; }
    s.translate(px + dx, py + dy); s.rotate(rot); s.translate(-px, -py);
    s.drawImage(p.c, p.x0, p.y0); s.restore();
  }
  const ready = new Promise((res) => { const im = new Image(); im.onload = () => { IM = im; res(); }; im.onerror = () => { console.error('missing assets/paper/great-wave.jpg'); res(); }; im.src = 'assets/paper/great-wave.jpg'; })
    .then(() => {
      if (!IM) return true;
      cut('wave', [[0, 300], [118, 245], [150, 160], [210, 120], [300, 90], [390, 72], [470, 78], [540, 112], [600, 160], [660, 200], [705, 245], [715, 290], [690, 330], [655, 350], [610, 345], [560, 330], [520, 360], [505, 420], [530, 480], [565, 540], [480, 560], [300, 560], [0, 575]], 11);
      // the claws: key the sky out between them (sky is yellower than foam), so the crest is cut clean
      keySky('wave', 470, 380);
      cut('swell', [[0, 610], [120, 545], [230, 500], [330, 465], [420, 445], [470, 470], [540, 520], [610, 575], [700, 610], [800, 630], [900, 590], [990, 520], [1080, 430], [1160, 350], [1200, 320], [1200, 807], [0, 807]], 12);
      cut('fuji', [[640, 612], [700, 572], [735, 545], [762, 518], [790, 540], [830, 572], [880, 600], [900, 615]], 13);
      cut('boatR', [[655, 560], [700, 590], [860, 600], [960, 540], [1040, 480], [1100, 425], [1090, 470], [1000, 560], [880, 620], [740, 612], [665, 585]], 14);
      cut('boatB', [[488, 610], [520, 640], [600, 690], [700, 720], [820, 728], [940, 700], [960, 735], [880, 770], [700, 765], [590, 730], [520, 680], [490, 640]], 15);
      cut('boatL', [[30, 380], [70, 430], [120, 490], [190, 540], [280, 560], [300, 590], [200, 590], [120, 550], [70, 480], [35, 420]], 16);
      cut('title', [[58, 52], [112, 52], [112, 232], [58, 232]], 17);
      // the sky plate: the open sky at the top right, stretched to the whole stage
      const sky = mk(1920, 1080), g = sky.getContext('2d'); g.drawImage(IM, 740 * K, 0, 460 * K, 420 * K, 0, 0, 1920, 1080); P.sky = sky;
      return true;
    });
  window.__waveReady = ready;

  function record(x, y, r, rot) {
    s.save(); s.shadowColor = 'rgba(20,16,10,.4)'; s.shadowBlur = 10; s.shadowOffsetY = 6;
    s.beginPath(); s.arc(x, y, r + 3, 0, TAU); s.fillStyle = 'rgb(240,232,214)'; s.fill(); s.restore();
    s.beginPath(); s.arc(x, y, r, 0, TAU); s.fillStyle = '#1a1716'; s.fill();
    s.strokeStyle = '#3a3532'; s.lineWidth = 1; for (let k = 1; k < 4; k++) { s.beginPath(); s.arc(x, y, r * (.45 + k * .15), 0, TAU); s.stroke(); }
    s.beginPath(); s.arc(x, y, r * .35, 0, TAU); s.fillStyle = '#b8432d'; s.fill(); s.beginPath(); s.arc(x + Math.cos(rot) * r * .15, y + Math.sin(rot) * r * .15, 2, 0, TAU); s.fillStyle = '#efe6d2'; s.fill();
  }
  function shotWave(t, l) {
    const tt = onTwos(t, 12);
    const rise = ease.out(inv(58.23, CR, tt)), tip = ease.back(inv(CR - .05, CR + .5, tt)) * (1 - smooth(inv(CR + .6, CR + 2.2, tt)));
    const rock = Math.sin((tt - CR) * 1.6) * smooth(inv(CR + 1, CR + 2.5, tt));
    // stage: the sky plate slides; the camera pushes in slowly over the shot (print px -> screen)
    s.fillStyle = '#1b1916'; s.fillRect(0, 0, W, H);
    s.save(); s.translate(-30 * inv(58.23, 66.07, t), 0); s.drawImage(P.sky, -20, 0, 1980, 1080); s.restore();
    const z = lerp(1, 1.12, ease.inOut(inv(58.23, 66.07, t)));
    s.save(); s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-W / 2, -H / 2);
    s.scale(W / IM.width, W / IM.width); s.translate(0, (H / (W / IM.width) - IM.height) / 2);
    // back to front: Fuji, the right boat, the great wave, the swell, the boats in front
    put('fuji', { sh: .6 });
    put('boatR', { rot: Math.sin(tt * 1.3) * .04, px: 880 * K, py: 560 * K, dy: Math.sin(tt * 1.3 + 1) * 18 });
    put('title', { dy: (1 - rise) * -500, sh: .8 });
    const wy = (1 - rise) * 1500;
    put('wave', { dy: wy + Math.sin(tt * 1.1) * 14, rot: -.06 * (1 - rise) + tip * .05 + rock * .025, px: 300 * K, py: 560 * K });
    put('boatL', { dy: wy * .9 + Math.sin(tt * 1.5) * 16, rot: Math.sin(tt * 1.5) * .05 - tip * .03, px: 160 * K, py: 500 * K });
    put('swell', { dy: Math.sin(tt * 1.25 + .5) * 22 + (1 - rise) * 60, rot: Math.sin(tt * 1.25) * .008, px: 600 * K, py: 807 * K });
    put('boatB', { dy: Math.sin(tt * 1.25 + 1.2) * 24, rot: Math.sin(tt * 1.25 + .4) * .045, px: 720 * K, py: 700 * K });
    // spray off the crest on the vocal, falling over the trough; a few drops are records
    const sp = inv(CR - .05, CR + 3.5, t);
    if (sp > 0 && sp < 1) for (let k = 0; k < 60; k++) {
      const ox = (560 + hash(k) * 160) * K, oy = (130 + hash(k + 1) * 120) * K, vx = (120 + hash(k + 3) * 520) * K, vy = (-90 - hash(k + 7) * 160) * K;
      const ts = sp * 3.5, x = ox + vx * ts * .35, y = oy + vy * ts * .35 + 260 * K * ts * ts * .5;
      if (k === 6 || k === 25 || k === 47) record(x, y, 46, t * 6 + k);
      else { const r = 8 + hash(k + 9) * 16; s.beginPath(); s.arc(x, y, r, 0, TAU); s.fillStyle = '#f7f4ea'; s.fill(); s.lineWidth = 3; s.strokeStyle = '#3a6a9a'; s.stroke(); }
    }
    s.restore();
  }
  chapter('paperwave', 58.23, 66.07, [[58.23, shotWave]]);
})();
