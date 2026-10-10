// S5 [1824,1902) "the flame absolves" + tail: from behind, the wolf sits by him, the fire sinks to embers, scratch to black.
const START = 1824;
Anim.sketch({
  async load() {
    this.plate = await new Promise((r) => loadImage("/output/s01/02_kf_camp.png", r));
    this.him = await Anim.clip("back_late");
    this.wolf = await Anim.clip("sit_k");
  },
  draw(t, f) {
    background(0);
    const sink = smooth(f / 52); // fire to embers by the 78.19 s downbeat (f52)
    cam(f, lerp(1.06, 1.0, smooth(f / 78)), 0, 0, 0.02, () => {
      const cv = cover(this.plate, 1.0, 0.5, 0.55);
      const fx = 1500, fy = 880;
      fire(fx, fy, 300 * (1 - 0.5 * sink), 380, t, { seed: 3, n: 110, power: 1 - 0.8 * sink });
      sparks(f, fx, fy - 20, { spread: 120, rate: Math.round(4 * (1 - sink)) + 1, burst: Math.round(14 * (1 - sink)), seed: 31 });
      standAt(this.him, this.him.frame(f * 0.75), W * 0.40, H + 30, 980);
      standAt(this.wolf, this.wolf.frame(f), W * 0.58, H + 20, 520);
    });
    // ink closes back over the board: a ragged iris shrinking onto the embers, black before "will we wake up"
    const g = smooth((f - 60) / 16);
    if (g > 0) {
      const R = lerp(1400, 0, g), cx = 1180, cy = 900;
      fill(0); noStroke();
      beginShape();
      vertex(-50, -50); vertex(W + 50, -50); vertex(W + 50, H + 50); vertex(-50, H + 50); vertex(-50, -50);
      beginContour();
      for (let k = 72; k >= 0; k--) { const a = (k / 72) * Math.PI * 2, rr = R * (1 + 0.12 * (noise(k * 0.3, f * 0.05) - 0.5)); vertex(cx + Math.cos(a) * rr * 1.3, cy + Math.sin(a) * rr); }
      endContour();
      endShape(CLOSE);
      if (g >= 1) background(0);
    }
    twoTone();
  }
});
