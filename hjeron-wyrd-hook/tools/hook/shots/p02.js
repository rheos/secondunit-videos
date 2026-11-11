// P2 [1486,1554) "asking us to open our eyes": close on the veil; the one white eye opens on "eyes".
const START = 1486;
Anim.sketch({
  async load() {
    this.him = await Anim.clip("eye");
  },
  draw(t, f) {
    background(0);
    cam(f, lerp(1.04, 1.12, smooth(f / 68)), 0, 0, 0.02, () => {
      noFill(); stroke(255);
      for (let i = 0; i < 6; i++) {
        const x0 = 1500 + i * 70, ph = i * 1.9, rise = (t * 140 + i * 210) % 1500;
        strokeWeight(1.2 + (i % 3) * 0.7); beginShape();
        for (let k = 0; k <= 30; k++) { const v = k / 30; vertex(x0 + Math.sin(v * 7 + t * 1.6 + ph) * (20 + 90 * v) - v * 120, 1150 - v * 1300 + (1500 - rise) * 0.15); }
        endShape();
      }
      // the clip's eye opens near 2.3 s; "eyes" lands at 64.22 s = f55, so start the clip 0 s at f0 and let it run at 1x
      standAt(this.him, this.him.frame(f), 900, 1150, 1180);
    });
    twoTone();
  }
});
