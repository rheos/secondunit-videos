// draft 25 (Bob on d21: "at :37 and 1:33 and 2:52 the background vocal goes 'buh buh buh...' 11 times. is it possible
// to match it? chattering teeth?"). A Gilliam cut-out pair of wind-up chattering teeth hops up into the bottom right
// of the frame, clacks once on each of the eleven "buh"s, and hops back down out of frame (it moves in and out, never
// fades). The eleven fall on the song's eighth-note grid (100 bpm, 0.3 s), starting about 1.7 s into each "they want
// to control the blues" line. BUH.starts are the first clack of each run; nudge them here if the sync is off.
const BUH = { starts: [37.57, 95.47, 171.97], n: 11, step: .3, inT: .45, outT: .45, size: 250 };
function buhTeeth(t) {
  for (const s0 of BUH.starts) {
    const s1 = s0 + (BUH.n - 1) * BUH.step; if (t < s0 - BUH.inT - .1 || t > s1 + BUH.step + BUH.outT) continue;
    const up = ease(t, s0 - BUH.inT, s0 - .05) * (1 - ease(t, s1 + BUH.step * .6, s1 + BUH.step * .6 + BUH.outT));
    // which clack we are on, and how far through it (jaw snaps shut on the beat, springs open between)
    const u = (t - s0) / BUH.step, i = Math.floor(u), ph = u - i, live = i >= 0 && i < BUH.n;
    const open = live ? (ph < .18 ? ph / .18 * .05 : .05 + .95 * Math.sin(Math.min(1, (ph - .18) / .6) * Math.PI / 2)) : .35;
    const hop = live ? Math.max(0, Math.sin(ph * Math.PI)) * .05 : 0; // a small hop as the jaw springs open
    const S = BUH.size, x = W - S * 1.05, y = H + S * .2 - up * S * 1.25 - hop * S * .35, rot = 0;
    g.save(); g.translate(x, y); g.rotate(rot); drawWindupTeeth(S, open, t); g.restore();
  }
}
function drawWindupTeeth(S, open, t) {
  const k = S / 100; // drawn on a 100-unit box, the hinge at the back
  const gum = '#e7838d', gumD = '#b85662', tooth = '#fbf6ea', toothE = '#cfc6b4';
  // the two orange feet, under the lower jaw
  g.fillStyle = '#e8902c'; for (const fx of [-22, 18]) { g.beginPath(); g.ellipse(fx * k, 30 * k, 13 * k, 6 * k, 0, 0, TAU); g.fill(); }
  // the wind-up key at the back
  const kr = (t * 3) % TAU; g.save(); g.translate(46 * k, -4 * k); g.rotate(kr); g.fillStyle = '#c9a43a';
  g.beginPath(); g.ellipse(0, -12 * k, 6 * k, 11 * k, 0, 0, TAU); g.ellipse(0, 12 * k, 6 * k, 11 * k, 0, 0, TAU); g.fill(); g.fillRect(-2 * k, -3 * k, 10 * k, 6 * k); g.restore();
  // lower jaw: gum and a row of teeth
  const jaw = (upper, ang) => { g.save(); g.translate(40 * k, 6 * k); g.rotate(ang); g.translate(-40 * k, -6 * k);
    const dy = upper ? -1 : 1; g.fillStyle = gum; g.strokeStyle = gumD; g.lineWidth = 2.2 * k;
    g.beginPath(); g.moveTo(-44 * k, 6 * k); g.quadraticCurveTo(-46 * k, (6 + dy * 26) * k, -10 * k, (6 + dy * 28) * k); g.quadraticCurveTo(30 * k, (6 + dy * 28) * k, 44 * k, (6 + dy * 14) * k); g.lineTo(44 * k, 6 * k); g.closePath(); g.fill(); g.stroke();
    for (let j = 0; j < 7; j++) { const tx = -38 * k + j * 11 * k, h = (j === 0 ? 9 : 11) * k; g.fillStyle = tooth; g.strokeStyle = toothE; g.lineWidth = 1.4 * k;
      g.beginPath(); g.roundRect ? g.roundRect(tx, upper ? 6 * k - h : 6 * k, 10 * k, h, 3 * k) : g.rect(tx, upper ? 6 * k - h : 6 * k, 10 * k, h); g.fill(); g.stroke(); }
    g.restore(); };
  jaw(false, 0); jaw(true, open * .5); // the upper jaw hinges up at the back (front lifts), the lower jaw stays put
  // a cut-out outline round the whole toy, so it reads as a Gilliam paper cut
  g.strokeStyle = 'rgba(30,18,14,.55)'; g.lineWidth = 3 * k;
}
