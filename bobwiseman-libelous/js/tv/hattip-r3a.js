// Bob's note on the TV-news version (rheos/secondunit-videos#164, 2026-10-15): the shareholders' greeting
// ("with a shareholders greeting", 26.4-28.4 s) should be a hat tip, like the woodcut version's.
// Loaded after r3a-film.js; nothing in the r3a files is edited: this wraps r3aTvFilmMeeting.
// The woodcut gesture (drawShareholder in js/woodcut/figures.js, blockHall in js/woodcut/blocks.js): a hand takes
// the hat by the brim, lifts it well clear of the head and tilts it toward the speaker, the head dips, and the
// hat goes back down; up in 0.16 s, held, down from 0.75 to 1.0 s, in the same wave as before (front row first).
// In the TV shot the lower two rows' hats sit behind the bench in front of them, so the lifted hat, the hand and
// the arm are drawn after the whole hall, clipped to just above that bench: the arm comes up from behind it.
const HT_COAT = '#1c1a22', HT_SKIN = '#f0c8a0';
function htLift(t, tw) { // the woodcut envelope: up fast, held, down
  if (t < tw) return 0;
  return smooth((t - tw) / .16) * (1 - smooth((t - tw - .75) / .25));
}
// the shareholder's head with its hat in hand (lift > 0): the face as in r3aTvTopHat, and the hat left to the overlay
function htHead(g, x, y, s, bow, smile) {
  g.save(); g.translate(x, y + bow * 10); g.scale(s, s);
  g.beginPath(); g.ellipse(0, 0, 26, 28, 0, 0, TAU); r3aTvCel(g, '#f0c8a0', 3.5);
  for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 9, -3, 3.5, 0, TAU); g.fillStyle = r3aTvNK; g.fill(); }
  g.strokeStyle = r3aTvNK; g.lineWidth = 3;
  if (smile > 0) { g.beginPath(); g.arc(0, 8, 9 + smile * 3, .15 * Math.PI, .85 * Math.PI); g.lineWidth = 3.5; g.stroke(); }
  else { g.beginPath(); g.moveTo(-7, 12); g.lineTo(7, 12); g.stroke(); }
  g.restore();
}
// the hand and the lifted hat, tilted toward the speaker (left): a white glove holds the brim's left end, as the
// woodcut's mitten does, with no arm (the shareholders have no bodies above their benches)
function htTip(g, x, y, s, L, bow) {
  const a = -L * .5, px = -4, py = -22 - L * 44; // hat pivot: the brim's centre, lifted
  g.save(); g.translate(x, y + bow * 10); g.scale(s, s);
  g.translate(px, py); g.rotate(a);
  g.beginPath(); g.roundRect(-34, -4, 68, 8, 4); r3aTvCel(g, '#1c1a22', 3);
  g.beginPath(); g.rect(-20, -44, 40, 42); r3aTvCel(g, '#1c1a22', 3);
  g.fillStyle = '#7a1e28'; g.fillRect(-20, -12, 40, 7);
  mitten(g, -36, 4, 11, -.5);
  g.restore();
}
// the wave: top row first (the one row seen whole, so the tips land on "shareholders"), left to right, then the
// middle and bottom rows; the woodcut's wave also starts with its most visible row
const htWave = (idx) => { const r = 2 - Math.floor(idx / 5), k = idx % 5; return r * 5 + k; };
const htMeetingKept = r3aTvFilmMeeting, htTopHatKept = r3aTvTopHat;
r3aTvFilmMeeting = function (g, t) {
  const C = r3aTvC;
  let n = 0, row = -1, tips = [];
  // a row's raised hats are drawn once the kept shot has drawn that row and its bench, before the next row up: so
  // the benches and heads in front of them cover them as they cover the hats at rest. Clipped above the row's
  // own bench, which the hats rise from behind.
  const flush = () => {
    for (const p of tips) {
      g.save(); g.beginPath(); g.rect(0, 0, 960, p.y + 32); g.clip();
      htTip(g, p.x, p.y, p.s, p.L, p.L * .8);
      g.restore();
    }
    tips = [];
  };
  // the kept shot draws its 15 shareholders bottom row first (idx = (2 - r) * 5 + k), so the n-th call is idx n;
  // its lift is replaced by the woodcut envelope on the new wave order
  r3aTvTopHat = function (g2, x, y, s, lift, bow, smile) {
    const idx = n++, r = 2 - Math.floor(idx / 5);
    if (r !== row) { flush(); row = r; }
    const L = htLift(t, C.share6 + htWave(idx) * 0.074);
    if (L <= 0) return htTopHatKept(g2, x, y, s, 0, 0, smile);
    htHead(g2, x, y, s, L * .8, smile);
    tips.push({ x, y, s, L });
  };
  try { htMeetingKept(g, t); } finally { r3aTvTopHat = htTopHatKept; }
  flush();
};
