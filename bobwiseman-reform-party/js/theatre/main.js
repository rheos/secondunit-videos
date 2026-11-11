// Look D: a Victorian toy theatre. Card proscenium with a painted curtain, footlights, a chessboard stage floor, and
// every player a printed card cut-out on a wire, slid in from the wings. "It's a mystery book... knight to queen's
// rook": the party plays the chess; "every little G20 cop got paid": a row of riot-shield pawns, coins dropping in;
// "this all seems rehearsed": the curtain drops and lifts again on the same scene. "We didn't vote...": a ballot
// card flutters off stage, and little Bob, a cut-out like everyone else, drags his piano and Junos across the boards.
// Section: the end of the middle stanza (sung lines 25-30).
(() => {
  const LT = (i) => LINES[i].s, LE = (i) => LINES[i].e;
  const A = 25, B = 30, T0 = LT(A) - .8, T1 = LE(B) + 4.5;
  const out = document.getElementById('c'); out.width = W; out.height = H; const g = out.getContext('2d');
  const COL = { red: '#b3262b', gold: '#d9a63c', cream: '#f0e3c4', ink: '#1d1612', blue: '#2b4c8c', green: '#3d6b45', flesh: '#e8b98f', grey: '#8d8a86' };
  const SX0 = 300, SX1 = 1620, SY = 860, SB = 560; // stage: wings x, floor front y, back y

  function cardShape(pts, fill, seed) { // a printed card cut-out: cream border, flat colour, black key line, slight shadow
    g.save(); g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x + 8, y + 8) : g.moveTo(x + 8, y + 8)); g.closePath(); g.fill(); g.restore();
    g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath();
    g.fillStyle = COL.cream; g.fill(); g.lineWidth = 10; g.strokeStyle = COL.cream; g.stroke();
    g.fillStyle = fill; g.fill(); g.lineWidth = 3.5; g.strokeStyle = COL.ink; g.stroke();
  }
  const ring = (cx, cy, rx, ry, k = 24) => [...Array(k)].map((_, i) => { const a = i / k * TAU; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  function wire(x, y) { g.strokeStyle = COL.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (x < W / 2 ? -1 : 1) * 900, y + 60); g.stroke(); }
  function pawn(x, y, s, fill, shield) {
    g.save(); g.translate(x, y); g.scale(s, s);
    cardShape([[-50, 0], [50, 0], [40, -24], [22, -36], [16, -90], [30, -110], [0, -150], [-30, -110], [-16, -90], [-22, -36], [-40, -24]], fill, 1);
    if (shield) { cardShape([[18, -20], [70, -20], [70, -110], [18, -110]], 'rgba(170,200,230,.9)', 2); g.fillStyle = COL.ink; g.font = '700 16px Georgia'; g.fillText('G20', 26, -60); }
    g.restore();
  }
  function knight(x, y, s, fill) { g.save(); g.translate(x, y); g.scale(s, s); cardShape([[-56, 0], [56, 0], [44, -30], [30, -40], [40, -130], [20, -190], [-20, -200], [-60, -150], [-50, -130], [-14, -140], [-30, -40], [-44, -30]], fill, 3); g.fillStyle = COL.ink; g.beginPath(); g.arc(-4, -166, 6, 0, TAU); g.fill(); g.restore(); }
  function rook(x, y, s, fill) { g.save(); g.translate(x, y); g.scale(s, s); cardShape([[-54, 0], [54, 0], [44, -30], [34, -40], [34, -140], [50, -150], [50, -190], [28, -190], [28, -170], [10, -170], [10, -190], [-10, -190], [-10, -170], [-28, -170], [-28, -190], [-50, -190], [-50, -150], [-34, -140], [-34, -40], [-44, -30]], fill, 4); g.restore(); }
  function suit(x, y, s, t, seed, gesture = 0) { // a party man card: suit, rosette, round head, a crown-like party hat
    g.save(); g.translate(x, y + Math.abs(Math.sin(t * 6.6 + seed)) * -6); g.scale(s, s);
    cardShape([[-40, 0], [40, 0], [46, -130], [0, -146], [-46, -130]], COL.blue, 5);
    cardShape(ring(26, -110, 10, 10, 10), COL.red, 6);
    cardShape(ring(0, -180, 32, 34), COL.flesh, 7);
    cardShape([[-24, -208], [-30, -250], [-10, -226], [0, -260], [10, -226], [30, -250], [24, -208]], COL.gold, 8);
    g.save(); g.translate(44, -124); g.rotate(-1.2 - gesture); cardShape([[-8, 0], [8, 0], [8, 80], [-8, 80]], COL.blue, 9); g.restore();
    g.restore();
  }
  function proscenium(t, curtain) {
    g.fillStyle = '#2a1d14'; g.fillRect(0, 0, W, H); // the stage boards behind everything, so no pixel carries over
    // painted backdrop: the playa at dusk with the Man far off, as a flat
    const sky = g.createLinearGradient(0, 160, 0, SB); sky.addColorStop(0, '#e9a15a'); sky.addColorStop(1, '#f4d79b'); g.fillStyle = sky; g.fillRect(SX0, 140, SX1 - SX0, SB - 140);
    g.fillStyle = '#d7b07a'; g.fillRect(SX0, SB - 60, SX1 - SX0, 60);
    g.strokeStyle = COL.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(1180, SB - 60); g.lineTo(1180, SB - 220); g.moveTo(1150, SB - 160); g.lineTo(1180, SB - 200); g.lineTo(1210, SB - 160); g.stroke();
    // chessboard floor in perspective
    const rows = 6, cols = 10;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const y0 = lerp(SB, SY, r / rows), y1 = lerp(SB, SY, (r + 1) / rows), sp0 = lerp(.72, 1, r / rows), sp1 = lerp(.72, 1, (r + 1) / rows);
      const X = (cc, sp) => W / 2 + (lerp(SX0, SX1, cc / cols) - W / 2) * sp;
      g.fillStyle = (r + c) % 2 ? '#3a2c22' : '#e8dcc0'; g.beginPath(); g.moveTo(X(c, sp0), y0); g.lineTo(X(c + 1, sp0), y0); g.lineTo(X(c + 1, sp1), y1); g.lineTo(X(c, sp1), y1); g.closePath(); g.fill();
    }
    return curtain;
  }
  function frontOfHouse(t, drop) {
    // curtain (drop 0 = up, 1 = down), arch, footlights
    if (drop > 0) { const h = (SY - 140) * drop; g.fillStyle = COL.red; g.fillRect(SX0, 140, SX1 - SX0, h); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 6; for (let x = SX0 + 40; x < SX1; x += 70) { g.beginPath(); g.moveTo(x + Math.sin(x) * 4, 140); g.lineTo(x, 140 + h); g.stroke(); } g.fillStyle = COL.gold; g.fillRect(SX0, 140 + h - 24, SX1 - SX0, 24); }
    g.fillStyle = '#7a1418'; g.fillRect(0, 0, W, 140); g.fillRect(0, 0, SX0, H); g.fillRect(SX1, 0, W - SX1, H); g.fillRect(0, SY, W, H - SY);
    g.fillStyle = COL.gold; g.beginPath(); g.moveTo(SX0 - 30, H); g.lineTo(SX0 - 30, 170); g.quadraticCurveTo(W / 2, 40, SX1 + 30, 170); g.lineTo(SX1 + 30, H); g.lineTo(SX1, H); g.lineTo(SX1, 180); g.quadraticCurveTo(W / 2, 80, SX0, 180); g.lineTo(SX0, H); g.closePath(); g.fill();
    g.strokeStyle = COL.ink; g.lineWidth = 3; g.stroke();
    // valance swags
    g.fillStyle = COL.red; for (let i = 0; i < 6; i++) { const x0 = SX0 + i * (SX1 - SX0) / 6, x1 = x0 + (SX1 - SX0) / 6; g.beginPath(); g.moveTo(x0, 150); g.quadraticCurveTo((x0 + x1) / 2, 250, x1, 150); g.closePath(); g.fill(); g.stroke(); }
    g.fillStyle = '#3b2a1d'; g.fillRect(SX0 - 30, SY, SX1 - SX0 + 60, 36);
    for (let i = 0; i < 12; i++) { const x = SX0 + 40 + i * 110, fl = .8 + .2 * rnd(i, Math.floor(t * 10)); const gr = g.createRadialGradient(x, SY, 0, x, SY, 120); gr.addColorStop(0, `rgba(255,220,140,${.5 * fl})`); gr.addColorStop(1, 'rgba(255,220,140,0)'); g.fillStyle = gr; g.fillRect(x - 120, SY - 120, 240, 160); g.fillStyle = '#fff3c8'; g.beginPath(); g.arc(x, SY + 8, 9, 0, TAU); g.fill(); }
  }
  function sChess(t, L) { // the party plays: the knight card hops to the rook on "rook"
    const last = L.words[L.words.length - 1].s, u = ease(t, last - .5, last + .1);
    rook(1300, 780, 1, '#e8dcc0'); pawn(600, 800, .9, '#e8dcc0'); pawn(760, 760, .8, '#3a2c22');
    const kx = lerp(780, 1180, u), ky = lerp(830, 790, u) - Math.sin(u * Math.PI) * 160; knight(kx, ky, 1.05, COL.blue);
    suit(460, 860, 1.1, t, 1, Math.sin(t * 3) * .3); wire(460, 840);
  }
  function sCops(t, L) { // riot pawns in a row, a coin drops onto each shield on the beat of the sung words
    for (let i = 0; i < 7; i++) {
      const x = 440 + i * 165, y = 830; pawn(x, y, 1, '#5d6670', true);
      const w = L.words[Math.min(L.words.length - 1, i)], u = lin(t, w.s - .35, w.s);
      if (u > 0) { const cy = lerp(160, y - 160, u * u); g.fillStyle = COL.gold; g.beginPath(); g.ellipse(x, cy, 18, 18 * (u < 1 ? Math.abs(Math.cos(t * 14)) + .2 : 1), 0, 0, TAU); g.fill(); g.strokeStyle = COL.ink; g.lineWidth = 2.5; g.stroke(); }
    }
    suit(1500, 860, 1.1, t, 4, .4); wire(1500, 840);
  }
  function sRehearsed(t, L) { // the same scene again: suits bowing; the curtain drops and lifts mid-line
    for (let i = 0; i < 4; i++) { suit(600 + i * 240, 840, 1.05, t, 10 + i, Math.sin(t * 4 + i) * .5); wire(600 + i * 240, 820); }
    pawn(420, 800, .8, '#5d6670', true); pawn(1500, 800, .8, '#5d6670', true);
  }
  function sVote(t, L) { // a ballot card flutters off stage left; the suits keep dancing
    for (let i = 0; i < 3; i++) { suit(900 + i * 220, 840, 1.0, t, 20 + i, .5); wire(900 + i * 220, 820); }
    const u = lin(t, L.s, L.e + 1), bx = lerp(1300, 200, u), by = 420 + Math.sin(u * 9) * 60;
    g.save(); g.translate(bx, by); g.rotate(Math.sin(t * 5) * .6); cardShape([[-60, -40], [60, -40], [60, 40], [-60, 40]], '#ffffff', 30); g.strokeStyle = COL.ink; g.lineWidth = 3; g.strokeRect(-44, -20, 24, 24); g.beginPath(); g.moveTo(-40, -10); g.lineTo(-32, 0); g.lineTo(-18, -26); g.stroke(); g.fillStyle = COL.ink; g.fillRect(-10, -12, 56, 6); g.fillRect(-10, 6, 40, 6); g.restore();
  }
  function caption(t) { // the playbill strip under the stage, letterpress
    const L = lineAt(t, .05); if (!L || L.i < A || L.i > B || t > L.e + 1) return;
    const n = wordsShown(L, t), sz = 50, gap = sz * .27; g.font = `700 ${sz}px "Didot", "Bodoni 72", Georgia, serif`;
    const ws = L.words.map((w) => w.w), wd = ws.map((w) => g.measureText(w).width), total = wd.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
    const s = Math.min(1, (W - 300) / total); let x = (W - total * s) / 2; const y = 1000;
    g.fillStyle = COL.cream; g.fillRect(x - 30 * s, y - 62 * s, (total + 60) * s, 86 * s); g.strokeStyle = COL.ink; g.lineWidth = 3; g.strokeRect(x - 30 * s, y - 62 * s, (total + 60) * s, 86 * s);
    g.fillStyle = COL.ink;
    for (let i = 0; i < n; i++) { g.save(); g.translate(x, y); g.scale(s, s); g.fillText(ws[i], 0, 0); g.restore(); probeWord(t, L.i, i, (tt) => { const l = lineAt(tt, .05); return l === L && wordsShown(L, tt) > i; }); x += (wd[i] + gap) * s; }
  }
  function renderFrame(t) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    proscenium(t);
    const S = [{ t: -1, f: sChess, i: A + 1 }, { t: LT(A + 2) - .1, f: sCops, i: A + 3 }, { t: LT(A + 4) - .1, f: sRehearsed, i: B }];
    const [s] = shotAt(S, t); s.f(t, LINES[s.i]);
    // little Bob crosses the boards after the last line, a card cut-out on the stage floor like the rest
    LITTLE_BOB.draw(g, t, { tIn: LE(B) - .5, tOut: T1, y: 850, h: 250, x0: SX0 - 80, x1: SX1 + 600 });
    const R = LINES[B], mid = R.s + (R.e - R.s) * .45, drop = t < R.s ? 0 : Math.max(0, 1 - Math.abs(t - mid) / .7) ** .6;
    frontOfHouse(t, Math.min(1, drop * 1.2));
    // stage lighting falloff
    const v = g.createRadialGradient(W / 2, 640, 300, W / 2, 640, 1200); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
    caption(t);
    drawGrain(g, t, .1);
  }
  window.LOOK_SPAN = [T0, T1];
  startPage(out, renderFrame, T0, T1, Promise.resolve(true));
})();
