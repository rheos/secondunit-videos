// S3 [1700,1785) "the serpent's rising / as this world dissolves": the Sky Serpent (Hjeron's S2/S5 rattlesnake,
// a sheet-bound Kling clip) rises out of the fire into the sky while the horizon breaks up into embers.
const START = 1700;
Anim.sketch({
  async load() {
    this.sky = await new Promise((r) => loadImage("/output/s03/02_kf_sky.png", r));
    this.him = await Anim.clip("back_k");
    this.serp = await Anim.clip("serpent_k");
    this.fire = await Anim.clip("fire");
  },
  draw(t, f) {
    background(0);
    const tilt = smooth(f / 85);
    cam(f, 1.0, 0, 0, 0.025, () => {
      const cv = cover(this.sky, 1.35, 0.5, lerp(0.6, 0.5, tilt));
      const [, hy] = toScreen(cv, this.sky, 0.5, 0.9);
      // the serpent: rises from behind the horizon on "serpents" (f11) through "rising" (f36), then writhes in the sky
      const rise = easeOut((f - 8) / 30);
      if (rise > 0) {
        const h = 1180, y = lerp(hy + h * 0.55, H * 0.5, rise);
        push(); drawingContext.globalAlpha = smooth(rise * 2.5);
        // Kling cuts to its reference views after frame ~33: play only its clean first 30 frames, slowed across the shot
        this.serp.draw(this.serp.frame(30 * clamp((f - 8) / 77)), W * 0.44, y, h);
        pop();
        // the ground in front of it, so it comes up from behind the horizon
        const gy = Math.min(hy + 4, H);
        push(); drawingContext.save(); drawingContext.beginPath(); drawingContext.rect(0, gy, W, H - gy); drawingContext.clip();
        cover(this.sky, 1.35, 0.5, lerp(0.6, 0.5, tilt)); drawingContext.restore(); pop();
      }
      // world dissolves from "dissolves" (73.32 s -> f60): the ground breaks up into embers from the horizon down
      const diss = smooth((f - 58) / 24);
      if (diss > 0) {
        noStroke(); fill(0);
        const r = Anim.rng(5);
        for (let i = 0; i < 260; i++) { const x = r() * W, y = hy + r() * 400; if (r() < diss) rect(x, y - 6, 40 + r() * 80, 10 + r() * 30); }
        sparks(f, W / 2, hy, { spread: 1800, rate: 10, burst: 30, speed: 7, life: 60, seed: 77 });
      }
      fireSprite(this.fire, f, W * 0.44, hy + 8, 230);
      standAt(this.him, this.him.frame(f), W * 0.8, Math.min(hy + 60, H + 40) - 40 * tilt, 600);
    });
    twoTone();
  }
});
