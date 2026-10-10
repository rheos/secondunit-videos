// S3 [1700,1785) "the serpent's rising / as this world dissolves": tilt up with a smoke serpent that closes into a ring.
const START = 1700;
function serpentPath(u, t) {
  // u 0..0.55: rises from the fire in an S; 0.55..1: one full turn of a ring above
  if (u < 0.55) {
    const v = u / 0.55;
    return [W / 2 + Math.sin(v * Math.PI * 2.2 + t * 1.5) * 170 * (0.3 + v), lerp(H * 0.95, H * 0.62, v)];
  }
  const v = (u - 0.55) / 0.45, a = Math.PI / 2 - v * Math.PI * 2, R = 300;
  return [W / 2 + Math.cos(a) * R * 1.25, H * 0.33 + Math.sin(a) * R * 0.95 + (1 - v) * 0];
}
function serpent(p, t, f) {
  const n = 220, upto = Math.floor(n * p);
  if (upto < 3) return;
  const pts = [];
  for (let i = 0; i <= upto; i++) {
    const u = i / n, [x, y] = serpentPath(u, t);
    pts.push([x + Math.sin(u * 26 - t * 5) * 8, y]);
  }
  const widthAt = (i) => {
    const u = i / n, body = lerp(16, 52, smooth(u * 1.8)) * (1 - 0.35 * smooth((u - 0.8) / 0.2));
    const nearHead = upto - i; return body * (nearHead < 10 ? 0.75 + 0.025 * nearHead : 1);
  };
  const normal = (i) => {
    const [x0, y0] = pts[Math.max(0, i - 1)], [x1, y1] = pts[Math.min(pts.length - 1, i + 1)];
    const L = Math.hypot(x1 - x0, y1 - y0) || 1; return [-(y1 - y0) / L, (x1 - x0) / L];
  };
  // black underlay so the body reads against the stars
  noFill(); stroke(0);
  for (let i = 1; i < pts.length; i++) { strokeWeight(widthAt(i) * 2.1); line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]); }
  // body: parallel smoke strands, heavier at the edges, each with its own drift
  const strands = 11;
  for (let k = 0; k < strands; k++) {
    const o = (k / (strands - 1)) * 2 - 1, edge = Math.abs(o) > 0.85;
    stroke(255); strokeWeight(edge ? 3 : 1.3);
    beginShape();
    for (let i = 0; i < pts.length; i++) {
      const [nx, ny] = normal(i), wv = widthAt(i) * (o + Math.sin(i * 0.21 + k * 1.3 - t * 4) * 0.08);
      vertex(pts[i][0] + nx * wv, pts[i][1] + ny * wv);
    }
    endShape();
  }
  // scales: short engraved arcs across the back every few steps
  stroke(255); strokeWeight(1.8);
  for (let i = 6; i < pts.length - 8; i += 5) {
    const [nx, ny] = normal(i), w = widthAt(i) * 0.8, [x, y] = pts[i], [tx, ty] = [ny, -nx];
    bezier(x + nx * w, y + ny * w, x + nx * w * 0.3 + tx * 10, y + ny * w * 0.3 + ty * 10, x - nx * w * 0.3 + tx * 10, y - ny * w * 0.3 + ty * 10, x - nx * w, y - ny * w);
  }
  // smoke peeling off: long curling wisps from the back
  strokeWeight(1.3);
  for (let i = 12; i < pts.length; i += 14) {
    const [nx, ny] = normal(i), [x, y] = pts[i], sw = Math.sin(t * 2.5 + i);
    beginShape();
    for (let k = 0; k <= 12; k++) { const v = k / 12; vertex(x + nx * (widthAt(i) + v * 120) + sw * 40 * v * v, y + ny * (widthAt(i) + v * 120) - v * 90); }
    endShape();
  }
  // head: an engraved wedge with a white eye and an open jaw, at the leading end
  const [hx, hy] = pts[pts.length - 1], [px, py] = pts[Math.max(0, pts.length - 5)];
  push(); translate(hx, hy); rotate(Math.atan2(hy - py, hx - px));
  const s = 1.6; scale(s);
  fill(0); stroke(255); strokeWeight(2.6 / s);
  beginShape(); vertex(-26, -30); vertex(30, -24); vertex(64, -6); vertex(40, 2); vertex(70, 16); vertex(30, 22); vertex(-26, 30); endShape(CLOSE);
  strokeWeight(1.2 / s);
  for (let k = -20; k <= 20; k += 6) line(-22, k, 22, k * 0.7);
  noStroke(); fill(255); ellipse(28, -12, 11, 7); fill(0); ellipse(29, -12, 3, 6);
  stroke(255); strokeWeight(1.6 / s); noFill();
  line(64, -6, 82, -12); line(82, -12, 92, -20); line(82, -12, 92, -4);
  pop();
}
Anim.sketch({
  async load() {
    this.sky = await new Promise((r) => loadImage("/output/s03/02_kf_sky.png", r));
    this.him = await Anim.clip("back_k");
  },
  draw(t, f) {
    background(0);
    // tilt up: the horizon starts at the bottom third and sinks out of frame
    const tilt = smooth(f / 85);
    cam(f, 1.0, 0, 0, 0.025, () => {
      const cv = cover(this.sky, 1.35, 0.5, lerp(0.6, 0.5, tilt));
      const [, hy] = toScreen(cv, this.sky, 0.5, 0.9);
      // world dissolves from "dissolves" (73.32 s -> f60): the ground breaks up into embers from the horizon down
      const diss = smooth((f - 58) / 24);
      if (diss > 0) {
        noStroke(); fill(0);
        const r = Anim.rng(5);
        for (let i = 0; i < 260; i++) { const x = r() * W, y = hy + r() * 400; if (r() < diss) rect(x, y - 6, 40 + r() * 80, 10 + r() * 30); }
        sparks(f, W / 2, hy, { spread: 1800, rate: 10, burst: 30, speed: 7, life: 60, seed: 77 });
      }
      fire(W / 2, hy + 10, 120, 150, t, { seed: 5, n: 7 });
      // serpent: appears on "serpents" (f11), climbs through "rising" (f36), closes its ring on "dissolves" (f62)
      const p = f < 11 ? 0 : f < 45 ? lerp(0, 0.6, easeOut((f - 11) / 34)) : lerp(0.6, 1, smooth((f - 45) / 17));
      push(); translate(0, lerp(0, 220, tilt) - 120); serpent(p, t, f); pop();
      standAt(this.him, this.him.frame(f), W * 0.8, Math.min(hy + 60, H + 40) - 40 * tilt, 600);
    });
    twoTone();
  }
});
