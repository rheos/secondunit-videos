// draft 25 (Bob on d21: "at :37 and 1:33 and 2:52 the background vocal goes 'buh buh buh...' 11 times. is it possible
// to match it? chattering teeth?"). A Gilliam cut-out pair of wind-up chattering teeth hops up into the bottom right
// of the frame, chatters through each run of "buh"s, and hops back down out of frame (it moves in and out, never fades).
// draft 28 (Robin): the runs go on to about 0:55, 1:53 and 3:00.
// draft 29 (Bob on d28: the teeth "don't get close enough to the B", they "move slower than does buh buh buh", and
// "they need to have lips touching"): the toy now has lips, and every clack comes from a syllable onset found in the
// backing vocal (js/dali/buh-onsets.js, made by tools/buh_onsets.py), not a fixed 0.3 s grid. Each "b" is acted like
// All The Trees' trumpeters acted each note: the lips press shut just BEFORE the onset (a b is a closed-lip stop, the
// sound is the lips parting), the toy squashes down on the press, then pops open and hops on the syllable.
const BUH = { inT: .45, outT: .45, size: 250, runGap: 1.2 };
// the onset times, grouped into runs (a gap over runGap seconds starts a new run)
const BUH_RUNS = (() => {
  const ons = (typeof BUH_ONSETS !== 'undefined' ? BUH_ONSETS : []).slice().sort((a, b) => a - b), runs = [];
  for (const o of ons) { const r = runs[runs.length - 1]; if (r && o - r[r.length - 1] <= BUH.runGap) r.push(o); else runs.push([o]); }
  return runs;
})();
// the mouth at time t inside one run: open 0..1 (0 = lips touching), press 0..1 (lips squeezed on a b), pop 0..1 (just
// released, drives the hop)
function buhMouth(run, t) {
  const n = run.length; let i = 0; while (i < n && run[i] <= t) i++; // run[i] = next onset, run[i-1] = the last one
  const next = i < n ? run[i] : Infinity, prev = i > 0 ? run[i - 1] : -Infinity;
  if (!isFinite(prev)) return { open: 0, press: t >= next - .12 ? 1 : .5, pop: 0 }; // waiting, lips shut, for the first b
  const since = t - prev, pop = Math.max(0, 1 - since / .14);
  if (!isFinite(next)) return { open: 0, press: 0, pop, oo: bowO(since, Infinity) }; // the run's last b is a bow too
  const g = next - prev, shut = Math.min(.07, Math.max(.043, g * .3)); // at least one 24 fps frame shut before each b
  if (t >= next - shut) return { open: 0, press: 1, pop };
  // draft 31: between phrases (Bob: "the buh buh buh finishes each time prior to the chatter") the last b of the phrase
  // pops open once and the lips close and rest, still, until the next phrase's first b
  // draft 35 (Bob, note 56: "is it possible for the last moment each time to mouth an "o" instead of just chattering?
  // Because it is saying buh buh bow"): the phrase's last b opens into a round "o" for the sung bow, then the lips close
  // and rest. Lined up on their last onset, the 12 long phrases in the vocal stem swell to a peak about 0.25 s after it
  // and are back to baseline by about 0.5 s; the short groups' swell lasts about 0.3 s. So the o holds BOW.hold s, and
  // always closes BOW.clear s before the next phrase starts (0.3 s on the short groups, whose gaps are 0.45 s).
  if (g > .4) return { open: 0, press: 0, pop, oo: bowO(since, g) };
  const rest = g - shut, rise = Math.min(.03, rest * .3), fall = Math.min(.05, rest * .4), amp = Math.min(1, Math.max(.85, g / .2));
  let open = amp * Math.min(1, since / rise);
  const fs = next - shut - fall; if (t > fs) open *= 1 - smooth01((t - fs) / fall);
  return { open, press: 0, pop };
}
const BOW = { rise: .07, hold: .45, clear: .15, fall: .12 };
// the o's size over time after the phrase's last onset: pops round fast, holds through the swell, closes before the next b
function bowO(since, gapToNext) {
  const d = Math.min(BOW.hold, gapToNext - BOW.clear), fall = Math.min(BOW.fall, d * .4);
  if (since >= d) return 0; const up = smooth01(since / BOW.rise), down = since > d - fall ? 1 - smooth01((since - (d - fall)) / fall) : 1;
  return up * down;
}
function smooth01(x) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); }
function buhTeeth(t) {
  BUH_RUNS.forEach(run => {
    const s0 = run[0], s1 = run[run.length - 1]; if (t < s0 - BUH.inT - .2 || t > s1 + BOW.hold + BUH.outT) return;
    const up = ease(t, s0 - BUH.inT - .15, s0 - .15) * (1 - ease(t, s1 + BOW.hold, s1 + BOW.hold + BUH.outT)); // hops out after the last bow
    const m = buhMouth(run, t), S = BUH.size;
    const hop = Math.sin(Math.min(1, (1 - m.pop)) * Math.PI) * (m.pop > 0 ? 1 : 0) * .06; // a small hop as each b pops
    const x = W - S * 1.05, y = H + S * .2 - up * S * 1.25 - hop * S;
    const oo = m.oo || 0; // the o pushes the toy a little taller and narrower, like lips pushed forward
    g.save(); g.translate(x, y + S * .3); g.scale(1 + .035 * m.press - .03 * oo, 1 - .05 * m.press + .02 * oo); g.translate(0, -S * .3);
    drawWindupTeeth(S, m.open, m.press, t, oo); g.restore();
  });
}
function drawWindupTeeth(S, open, press, t, oo = 0) {
  const k = S / 100; // drawn on a 100-unit box, the mouth line at y = 6
  const gum = '#e7838d', gumD = '#b85662', tooth = '#fbf6ea', toothE = '#cfc6b4', lip = '#d2343f', lipD = '#8e1a24', ink = '#2a1712';
  // oo 0..1: the "o" (draft 35). The jaws part by up to 18 units and both lips close round a round hole in the middle: each
  // lip's inner edge is half an ellipse (rx 1.05, ry 0.75 of the gap) and the lips meet at the corners, so the teeth only
  // show as a sliver at the top and bottom of the hole. wO snaps the shape to round early; the size follows oo.
  const wO = smooth01(Math.min(1, oo * 3)), gapO = oo * 18 * k;
  const Y0 = 6 * k, gap = open * 24 * k * (1 - wO) + gapO * wO, roll = open * 7 * k * (1 - wO); // roll: how far each lip curls back off the teeth
  const rxO = 1.05 * gapO / k, ryO = .75 * gapO; // the o's hole, rx in drawing units along the lip, ry in pixels
  // one outer outline round the whole toy (stroke every part thick first, then fill over it, so no seams show)
  const feet = () => { for (const fx of [-22, 18]) { g.beginPath(); g.ellipse(fx * k, 32 * k, 13 * k, 6 * k, 0, 0, TAU); g.fill(); g.stroke(); } };
  const kr = (t * 3) % TAU;
  const key = () => { g.save(); g.translate(48 * k, -2 * k - gap / 2); g.rotate(kr);
    g.beginPath(); g.ellipse(0, -12 * k, 6 * k, 11 * k, 0, 0, TAU); g.ellipse(0, 12 * k, 6 * k, 11 * k, 0, 0, TAU); g.fill(); g.stroke(); g.fillRect(-2 * k, -3 * k, 10 * k, 6 * k); g.restore(); };
  // a jaw's gum, from the mouth line outward (dy = -1 up for the upper jaw, 1 down for the lower)
  const gumPath = dy => { g.beginPath(); g.moveTo(-46 * k, Y0); g.quadraticCurveTo(-48 * k, Y0 + dy * 26 * k, -10 * k, Y0 + dy * 28 * k);
    g.quadraticCurveTo(32 * k, Y0 + dy * 28 * k, 46 * k, Y0 + dy * 14 * k); g.lineTo(46 * k, Y0); g.closePath(); };
  // a lip: a band along the mouth line whose inner edge curls back by `roll` (0 = the edge sits on the mouth line);
  // pressed lips bulge a little thicker. The upper lip has a cupid's bow.
  const lipPath = (dy, upper) => { const th = (10 + 2 * press + 3 * wO) * k, r = roll, n = 28; g.beginPath();
    // the inner edge's offset from the mouth line (outward from this jaw's side); the o mixes in -gap/2 at the corners
    // (the lips cross the gap and meet) and an ellipse in the middle
    const inner = (u, c) => { const xu = -47 + 94 * u, e = rxO > .01 ? Math.sqrt(Math.max(0, 1 - Math.pow(xu / rxO, 2))) : 0; return r * c * (1 - wO) + (-gap / 2 + ryO * e) * wO; };
    for (let j = 0; j <= n; j++) { const u = j / n, x = (-47 + 94 * u) * k, c = 1 - Math.pow(2 * u - 1, 2); g[j ? 'lineTo' : 'moveTo'](x, Y0 + dy * inner(u, c)); }
    for (let j = n; j >= 0; j--) { const u = j / n, x = (-47 + 94 * u) * k, c = 1 - Math.pow(2 * u - 1, 2), bow = upper ? -Math.max(0, 1 - Math.abs(u - .5) / .09) * 3 * k : 0;
      g.lineTo(x, Y0 + dy * (r * c * (1 - wO) + .35 * ryO * c * wO + th * (.55 + .45 * Math.sqrt(c))) + bow * -dy); } // in the o the outer edge stays where shut lips have it (so the teeth stay covered), with a gentle pucker
    g.closePath(); };
  const jawAt = (dy, f) => { g.save(); if (dy < 0) g.translate(0, -gap); f(); g.restore(); };
  g.lineJoin = 'round'; g.lineCap = 'round';
  // outline pass
  g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 7 * k;
  feet(); key(); for (const dy of [1, -1]) jawAt(dy, () => { gumPath(dy); g.fill(); g.stroke(); lipPath(dy, dy < 0); g.fill(); g.stroke(); });
  // fill pass
  g.lineWidth = 1.6 * k; g.fillStyle = '#e8902c'; g.strokeStyle = 'rgba(0,0,0,0)'; feet();
  g.fillStyle = '#c9a43a'; key();
  if (gap > .5) { // the dark mouth and a tongue in the gap
    g.fillStyle = '#3a0f14'; g.beginPath(); g.ellipse(0, Y0 - gap / 2, 44 * k, gap / 2 + roll + 2 * k, 0, 0, TAU); g.fill();
    g.fillStyle = '#d4566a'; g.beginPath(); g.ellipse(0, Y0 - 1 * k, 24 * k, Math.min(gap / 2, 8 * k), 0, Math.PI, TAU); g.fill(); }
  for (const dy of [1, -1]) jawAt(dy, () => {
    g.fillStyle = gum; gumPath(dy); g.fill(); g.strokeStyle = gumD; g.lineWidth = 1.6 * k; g.stroke();
    for (let j = 0; j < 7; j++) { const tx = -38 * k + j * 11 * k, h = (j === 0 || j === 6 ? 7 : 10) * k; g.fillStyle = tooth; g.strokeStyle = toothE; g.lineWidth = 1.4 * k;
      g.beginPath(); const ty = dy < 0 ? Y0 - h : Y0; g.roundRect ? g.roundRect(tx, ty, 10 * k, h, 3 * k) : g.rect(tx, ty, 10 * k, h); g.fill(); g.stroke(); }
    g.fillStyle = lip; lipPath(dy, dy < 0); g.fill(); g.strokeStyle = lipD; g.lineWidth = 1.4 * k; g.stroke();
    g.strokeStyle = 'rgba(255,235,235,.55)'; g.lineWidth = 2 * k; g.beginPath(); // a highlight on each lip
    const hl = roll + (-gap / 2 + ryO) * wO; g.moveTo(-18 * k, Y0 + dy * (hl + 5 * k)); g.quadraticCurveTo(0, Y0 + dy * (hl + 7 * k), 18 * k, Y0 + dy * (hl + 5 * k)); g.stroke(); });
  if (open < .02) { g.strokeStyle = lipD; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(-44 * k, Y0); g.quadraticCurveTo(0, Y0 + 1.5 * k, 44 * k, Y0); g.stroke(); } // lips meeting
}
