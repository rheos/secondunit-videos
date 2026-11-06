// 16 mm print: gate weave, faded dye (lifted blacks, warm-magenta cast, softer saturation), a little
// flicker, grain, dirt and the odd hair on the print, vignette. All seeded by the frame number.
let VIG = null;
function buildVignette() {
  const c = mkCanvas(), g = c.getContext('2d');
  const gr = g.createRadialGradient(960, 540, 420, 960, 540, 1180);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.7, 'rgba(236,226,220,1)'); gr.addColorStop(1, 'rgba(170,150,150,1)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H); VIG = c;
}
function filmPrint(out, src, t) {
  const f = FR(t);
  if (!VIG) buildVignette();
  out.setTransform(1, 0, 0, 1, 0, 0); out.globalAlpha = 1; out.globalCompositeOperation = 'source-over';
  out.fillStyle = '#1a1214'; out.fillRect(0, 0, W, H);
  // gate weave: the frame floats a pixel or two in the gate
  const wx = n1(301, f * .37) * 1.6 + (rnd(f, 11) - .5) * .7, wy = n1(302, f * .29) * 2.2 + (rnd(f, 12) - .5) * .8;
  const flick = 1 + (rnd(f, 13) - .5) * .045;
  out.filter = `saturate(.8) contrast(.9) sepia(.12) brightness(${(1.04 * flick).toFixed(3)})`;
  out.drawImage(src, -6 + wx, -5 + wy, W + 12, H + 10);
  out.filter = 'none';
  // dye fade: lifted shadows and a warm magenta cast
  out.globalCompositeOperation = 'screen'; out.fillStyle = 'rgb(34,22,28)'; out.fillRect(0, 0, W, H);
  out.globalCompositeOperation = 'soft-light'; out.fillStyle = 'rgba(196,120,110,.22)'; out.fillRect(0, 0, W, H);
  out.globalCompositeOperation = 'multiply'; out.drawImage(VIG, 0, 0);
  out.globalCompositeOperation = 'source-over';
  drawGrain(out, t, .17, 'overlay');
  // print dirt: dark specks, once in a while a hair or a short scratch. Kept off the caption strips.
  const capTop = captionTop(t) - 16;
  const nd = Math.floor(rnd(f, 21) * 4);
  for (let k = 0; k < nd; k++) {
    const x = rnd(f, 22, k) * W, y = rnd(f, 23, k) * Math.min(H, capTop), r = .8 + rnd(f, 24, k) * 2.6;
    out.fillStyle = rnd(f, 25, k) < .75 ? 'rgba(30,18,14,.75)' : 'rgba(255,250,235,.6)';
    out.beginPath(); out.ellipse(x, y, r, r * (.6 + rnd(f, 26, k) * .6), rnd(f, 27, k) * 3, 0, TAU); out.fill();
  }
  const hairOn = Math.floor(f / 3);
  if (rnd(hairOn, 31) < .07) {
    const x = rnd(hairOn, 32) * W, y = rnd(hairOn, 33) * Math.max(80, capTop - 120);
    out.strokeStyle = 'rgba(30,18,14,.55)'; out.lineWidth = 1.4; out.beginPath(); out.moveTo(x, y);
    out.bezierCurveTo(x + 30, y + 20, x - 10, y + 50, x + 24, y + 80); out.stroke();
  }
  if (rnd(f, 41) < .05) { const x = rnd(f, 42) * W; out.fillStyle = 'rgba(255,250,240,.25)'; out.fillRect(x, 0, 1.5, Math.min(H, capTop)); }
}
