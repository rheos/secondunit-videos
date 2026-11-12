// f504-f1188 (21.0-49.5 s): boredom as brainwashing. One continuous interface in a tall frame; the shots
// are the moments a new instrument arrives. Every frame is placed from js/words.js (cue words snapped
// to onsets); the frame numbers in this comment are the snapped ones.
//   SH01 f504 STATUS   > status: types; BORED stamps in (f567); a roster of bored rows streams (f588-f647)
//   SH02 f626 LOOP     the question types in; PROCESS (f671) -> BOREDOM (f702) -> PROCESS draws itself
//   SH03 f741 SPIN     the loop turns, then spins up; A SELF- / PERPETUATING, / UNCONSCIOUS dim to 40% (f801);
//                      BRAINWASHING bar fills to 73% and keeps going (f829); WORLD TOTALITARIAN GOVERNMENT (f870-888)
//   SH04 f900 MONEY    a gauge pegs into the red (f916); DANGER pop-up with a glitch tear (f961)
//   SH05 f1002 SCAN    radar sweeps, one blip (f1039); INDIVIDUAL SURVIVAL, Wally
//   SH06 f1104 SLEEP   the screen dims to sleep mode, a breathing LED, the words sink
//   SH07 f1130 DIALOG  [ YES ] [ NO ]; NO greys out on "no" (f1169); the cursor drifts toward YES; hold to f1188
const SPAN = [21.0, 49.5];
const SHOTS = [[504, 'SH01 · STATUS'], [626, 'SH02 · LOOP'], [741, 'SH03 · SPIN'], [900, 'SH04 · MONEY'], [1002, 'SH05 · SCAN'], [1104, 'SH06 · SLEEP'], [1130, 'SH07 · DIALOG'], [1188, 'END']];
// guard: js/words.js is generated; these indexes are what the shots assume
[[0, 'Okay,'], [4, 'bored.'], [8, 'now.'], [16, 'Wally,'], [19, 'process'], [23, 'boredom'], [31, 'may'], [37, '-perpetuating,'], [38, 'unconscious'], [41, 'brainwashing'],
  [47, 'government'], [50, 'money,'], [59, 'dangerous'], [62, 'thinks?'], [71, 'survival,'], [72, 'Wally,'], [79, 'asleep,'], [83, 'asleep'], [87, 'no.']]
  .forEach(([i, w]) => { if (WORDS[i][0] !== w) console.error(`words.js index ${i} is ${WORDS[i][0]}, expected ${w}`); });

// column slots (baselines): ASIDE small italic, L1..L3 big lines, FOOT small italic
const ASIDE = 150, L1 = 250, L2 = 340, L3 = 430, FOOT = 492;
const HOLD = 36;                       // frames a line holds after its last word
const since = (f, f0) => (f - f0) / FPS;
const on = (f, f0, f1 = 1e9) => f >= f0 && f < f1;
const ramp = (f, f0) => (f >= f0 ? 1 : 0);             // a word is there on its frame (no motion, no fade-in)
const drop = (f, f1, n = 3) => 1 - inv(f1, f1 + n, f); // a line leaves over n frames

// words i0..i1 that have been spoken by frame f, as one line at (x, y); each word fades in over 2 frames
function spokenLine(f, i0, i1, x, y, o, f1 = 1e9) {
  const a0 = (o.alpha ?? 1) * drop(f, f1); if (a0 <= 0) return 0;
  let str = ''; const parts = [];
  for (let i = i0; i <= i1; i++) { if (f < wf(i)) break; parts.push([wclean(i), ramp(f, wf(i))]); }
  if (!parts.length) return 0;
  const gap = measure(' ', o); let cx = x;
  for (const [w, a] of parts) { text(w, cx, y, { ...o, alpha: a0 * a }); cx += measure(w, o) + gap; }
  return cx - x;
}
// a big word on its frame, Archivo, fit to the column; one line
function bigWord(f, str, f0, y, size, o = {}, f1 = 1e9) {
  const a = ramp(f, f0) * drop(f, f1) * (o.alpha ?? 1); if (a <= 0 || f < f0) return;
  text(str, o.x ?? M, y, { fam: FAM.g, weight: o.weight || 800, stretch: o.stretch || 'normal', size, color: o.color || C.ink, alpha: a, probe: o.probe, box: [M, y - size, COL, size * 1.3], ls: o.ls });
}

function drawFrame(t) {
  const f = FR(t);
  fill(C.bg);
  const sleep = inv(1104, 1128, f);         // SH06: the screen goes to sleep
  const code = SHOTS.filter(([f0]) => f >= f0).pop()[1];
  let readout = ['STATUS', '—', false];

  // ---- content layer: one slow push across the section (1.0 -> 1.035), plus the stamp's jolt
  const jolt = f < 567 ? 0 : f < 569 ? 8 : 8 * (1 - spring(since(f, 569), .6, 4));
  const sink = 44 * ease.inOutSine(inv(1104, 1140, f));           // SH06: the words sink
  s.save();
  const cz = 1 + .035 * inv(504, 1188, f); s.translate(360, 640); s.scale(cz, cz); s.translate(-360, -640 + jolt);

  // ================= SH01 STATUS f504-f628 =================
  if (on(f, 504, 632)) {
    const a = drop(f, 628);
    // prompt line
    const prompt = typed('status:', t, fs(506), 28);
    const pw = text('> ' + prompt, M, ASIDE, { size: 30, color: C.hot, weight: 700, alpha: a });
    if (f < 567 && blink(t)) frect(M + pw + 8, ASIDE - 24, 14, 28, C.hot);
    // the spoken answer, in the serif
    spokenLine(f, 0, 1, M, L1, { fam: FAM.s, italic: true, size: 52, color: C.ink, alpha: a });
    bigWord(f, 'WE ARE', wf(2), L2, 56, { weight: 700, stretch: 'expanded', alpha: a, ls: 2 });
    // the rubber stamp: scale 1.3 -> 1.0 in 5 frames, 2-frame hold on impact, then the layer's jolt settles
    if (f >= 562) {
      const p = ease.in(inv(562, 567, f)), sc = lerp(1.3, 1, p), al = f >= 567 ? .96 : .55 * p;
      const str = 'BORED', o = { fam: FAM.g, weight: 900, stretch: 'expanded', ls: 4 }, sz = fitSize(str, COL - 70, 150, o);
      const tw = measure(str, { ...o, size: sz }), bx = M + 8, by = L3 + 46, bw = tw + 52, bh = sz * .78 + 44;
      withT(() => {
        s.translate(bx + bw / 2, by - bh / 2); s.rotate(-.035); s.scale(sc, sc); s.translate(-bx - bw / 2, -by + bh / 2);
        s.globalAlpha = al * a;
        rect(bx, by - bh, bw, bh, C.hot, 5); rect(bx + 10, by - bh + 10, bw - 20, bh - 20, C.hot, 1.5);
        text(str, bx + 26, by - 22, { ...o, size: sz, color: C.hot, probe: 'stamp', box: [bx, by - bh, bw, bh], margin: 6 });
        // worn rubber: seeded holes
        s.fillStyle = C.bg; for (let i = 0; i < 160; i++) { const h1 = hash(i * 97 + 11), h2 = hash(i * 193 + 5), h3 = hash(i * 31 + 2); s.fillRect(bx + h1 * bw, by - bh + h2 * bh, 1 + h3 * 5, 1 + hash(i * 7) * 3); }
        s.globalAlpha = 1;
      });
      readout = ['STATUS', 'BORED', true];
    }
  }
  // the roster of bored rows: panel at "We're" (f588), rows one by one on "all", streaming on "bored", full speed on "now"
  if (on(f, wf(5), 654)) {
    const p = spring(since(f, wf(5)), .78, 2.4), q = inv(647, 653, f);
    const x = PX, y = 648, w = PW, h = 464, rh = 34;
    const scroll = integ(t, [[fs(wf(7)), 0], [fs(wf(8)), 520], [fs(640), 1100], [fs(660), 1400]]);
    const done = panelBox(x, y, w, h, p, q);
    const first = Math.max(0, Math.floor(scroll / rh) - 1);
    let n = 0;
    for (let i = first; i < first + 18; i++) {
      const yy = y + 36 + i * rh - scroll;
      if (yy > y + h + 10) break;
      if (i < 4 && f < 593 + 3 * i) break;
      n = i + 1;
      text(String(i + 1).padStart(4, '0'), x + 24, yy, { size: 22, color: C.dim });
      text('bored', x + 110, yy, { size: 24, color: C.ink, weight: 700 });
    }
    done();
    if (n > 0) readout = ['STATUS', `BORED ×${String(n).padStart(4, '0')}`, true];
  }

  // ================= SH02 LOOP f626-f741 =================
  if (on(f, wf(10), 745)) {
    const a = drop(f, 741);
    // the question, two lines in the serif: "has it ever occurred" / "to you, Wally,"
    spokenLine(f, 10, 13, M, ASIDE, { fam: FAM.s, italic: true, size: 40, color: C.ink, alpha: a });
    spokenLine(f, 14, 16, M, ASIDE + 48, { fam: FAM.s, italic: true, size: 40, color: C.ink, alpha: a });
  }
  if (on(f, wf(24), 772)) spokenLine(f, 24, 30, M, FOOT - 16, { fam: FAM.s, italic: true, size: 40, color: C.dim, alpha: drop(f, 768) });
  // the loop diagram: PROCESS -> BOREDOM -> PROCESS; draws itself f671-f725, turns from f741, spins up through SH03
  if (on(f, wf(19), 906)) {
    const cx = 360, cy = 858, R = 148, q = inv(900, 906, f);
    const omega = integ(t, [[fs(741), 0], [fs(760), .45], [fs(801), 1.6], [fs(829), 2.6], [fs(860), 3.2]]); // revolutions
    const rate = kf(t, [[fs(741), 0], [fs(760), .45], [fs(801), 1.6], [fs(829), 2.6], [fs(860), 3.2]], (x) => x); // rev/s
    const th = omega * TAU;
    const pR = ease.outQuint(inv(wf(19), wf(23), f)), pL = ease.outQuint(inv(wf(23), wf(29), f));
    const arc = (a0, a1, p, rot, al) => {
      if (p <= 0) return; const a1p = a0 + (a1 - a0) * p;
      s.globalAlpha = al; s.beginPath(); s.arc(cx, cy, R, a0 + rot, a1p + rot); s.lineWidth = 3; s.strokeStyle = C.hot; s.lineCap = 'round'; s.stroke();
      const ex = cx + Math.cos(a1p + rot) * R, ey = cy + Math.sin(a1p + rot) * R; arrowHead(ex, ey, a1p + rot + Math.PI / 2, 16 * p, C.hot); s.globalAlpha = 1;
    };
    const dA = 1 - ease.in(q);
    withT(() => {
      s.globalAlpha = dA;
      // ring (faint) then the two arcs, with ghost copies when it spins
      s.beginPath(); s.arc(cx, cy, R, 0, TAU); s.lineWidth = 1; s.strokeStyle = C.faint; s.stroke();
      const ghosts = rate > .5 ? 6 : 0;
      for (let k = ghosts; k >= 0; k--) {
        const rot = th - k * rate * TAU * (1 / 60), al = k ? .28 * (1 - k / (ghosts + 1)) : 1;
        arc(-1.08, 1.08, pR, rot, al * dA); arc(Math.PI - 1.08, Math.PI + 1.08, pL, rot, al * dA);
      }
      // the boxes stay upright
      const box = (str, y, f0, probe) => {
        if (f < f0) return; const bw = 250, bh = 54, al = ramp(f, f0) * dA;
        s.globalAlpha = al; frect(cx - bw / 2, y - bh / 2, bw, bh, C.panel); rect(cx - bw / 2, y - bh / 2, bw, bh, C.ink, 2);
        text(str, cx, y + 13, { fam: FAM.g, weight: 800, size: 34, color: C.ink, align: 'center', ls: 2, probe, box: [cx - bw / 2, y - bh / 2, bw, bh], margin: 6 }); s.globalAlpha = 1;
      };
      box('PROCESS', cy - R, wf(19), 'process'); box('BOREDOM', cy + R, wf(23), 'boredom');
      if (f >= wf(21) && f < 741) text(wclean(21), cx + R + 14, cy + 8, { size: 16, color: C.hot, alpha: ramp(f, wf(21)) * drop(f, 737), ls: 2 });
    });
    if (f < 741) readout = ['PROCESS', f >= wf(23) ? 'BOREDOM' : '—', false];
    else readout = ['PROCESS', `${rate.toFixed(2)} REV/S`, rate > 1.5];
  }

  // ================= SH03 SPIN f741-f900 =================
  if (on(f, wf(36), 860)) {
    // the longest line of the section, split, never below 56 px; dims to 40% on "unconscious"
    const o = { fam: FAM.g, weight: 800 }, sz = Math.max(56, Math.min(fitSize('A SELF-', COL, 84, o), fitSize('PERPETUATING,', COL, 84, o), fitSize('UNCONSCIOUS', COL, 84, o)));
    const dimA = lerp(1, .4, inv(wf(38) + 2, wf(38) + 14, f)), a = dimA * drop(f, 856);
    bigWord(f, 'A SELF-', wf(36), L1, sz, { alpha: a, probe: 'l1' });
    bigWord(f, 'PERPETUATING,', wf(37), L2, sz, { alpha: a, probe: 'l2' });
    bigWord(f, 'UNCONSCIOUS', wf(38), L3, sz, { alpha: a, probe: 'l3' });
    spokenLine(f, 39, 40, M, FOOT, { fam: FAM.s, italic: true, size: 40, color: C.ink, alpha: a });
    PROBE.value('dim', dimA);
  }
  // BRAINWASHING progress bar: fills to 73% in a second, then keeps going
  if (on(f, wf(41), 906)) {
    const p = spring(since(f, wf(41)), .78, 2.4), q = inv(900, 906, f);
    const x = PX, y = 1052, w = PW, h = 68;
    const t0 = fs(wf(41)), v = Math.min(.999, kf(t, [[t0, 0], [t0 + 1, .73]], ease.outQuint) + (t > t0 + 1 ? .011 * (t - t0 - 1) : 0));
    const done = panelBox(x, y, w, h, p, q);
    text('BRAINWASHING', x + 16, y + 28, { size: 15, weight: 700, color: C.ink, ls: 3 });
    text(`${(v * 100).toFixed(0)}%`, x + w - 16, y + 28, { size: 15, weight: 700, color: C.hot, align: 'right' });
    rect(x + 16, y + 42, w - 32, 12, C.dim, 1); frect(x + 17, y + 43, (w - 34) * v, 10, C.hot);
    done();
    readout = ['BRAINWASHING', `${(v * 100).toFixed(1)}%`, true];
  }
  if (on(f, wf(42), 934)) {
    const a = drop(f, 930);
    spokenLine(f, 42, 44, M, ASIDE, { fam: FAM.s, italic: true, size: 40, color: C.dim, alpha: a });
    bigWord(f, 'WORLD', wf(45), L1, 84, { alpha: a, stretch: 'expanded', probe: 'world' });
    bigWord(f, 'TOTALITARIAN', wf(46), L2, 84, { alpha: a, probe: 'totalitarian' });
    bigWord(f, 'GOVERNMENT', wf(47), L3, 84, { alpha: a, probe: 'government' });
  }

  // ================= SH04 MONEY f900-f1002 =================
  if (on(f, wf(48), 1010)) {
    const p = spring(since(f, wf(48)), .78, 2.4), q = inv(1002, 1008, f);
    const x = PX, y = 700, w = PW, h = 400, cx = 360, cy = y + 300, R = 215, a0 = Math.PI * 1.1, a1 = Math.PI * 1.9;
    const fp = wf(50) - 2, peg = f >= fp; // the swing starts 2 frames early so the needle meets the peg on the onset
    let v = kf(t, [[fs(wf(48)), .08], [fs(fp) - .05, .38]], ease.out);
    if (peg) v = Math.min(1, .38 + .62 * spring(since(f, fp), .5, 3.2) * 1.08) - (f > fp + 6 ? .006 + .006 * snoise(t * 30, 3) : 0);
    PROBE.edge('peg', v >= .995, f > fp && Math.min(1, .38 + .62 * spring(since(f - 1, fp), .5, 3.2) * 1.08) >= .995);
    const done = panelBox(x, y, w, h, p, q);
    text('MONEY', cx, y + 40, { size: 15, weight: 700, color: C.ink, ls: 4, align: 'center' });
    s.beginPath(); s.arc(cx, cy, R, a0, a1); s.lineWidth = 2; s.strokeStyle = C.dim; s.stroke();
    s.beginPath(); s.arc(cx, cy, R - 16, lerp(a0, a1, .82), a1); s.lineWidth = 26; s.strokeStyle = C.hot; s.stroke();
    for (let k = 0; k <= 20; k++) {
      const ang = lerp(a0, a1, k / 20), r0 = R - (k % 5 ? 40 : 56);
      line([[cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0], [cx + Math.cos(ang) * (R - 32), cy + Math.sin(ang) * (R - 32)]], k >= 17 ? C.hot : C.ink, k % 5 ? 1.5 : 3);
    }
    const na = lerp(a0, a1, v);
    line([[cx - Math.cos(na) * 26, cy - Math.sin(na) * 26], [cx + Math.cos(na) * (R - 24), cy + Math.sin(na) * (R - 24)]], C.hot, 5);
    dot(cx, cy, 14, C.panel); s.beginPath(); s.arc(cx, cy, 14, 0, TAU); s.lineWidth = 2; s.strokeStyle = C.ink; s.stroke();
    text(`${(v * 100).toFixed(0)}%`, cx, cy + 70, { fam: FAM.g, weight: 700, size: 44, color: v > .82 ? C.hot : C.ink, align: 'center' });
    done();
    readout = ['MONEY', v > .82 ? `${(v * 100).toFixed(0)}% ▲` : `${(v * 100).toFixed(0)}%`, v > .82];
  }
  if (on(f, wf(51), 1006)) spokenLine(f, 51, 58, M, ASIDE, { fam: FAM.s, italic: true, size: 40, color: C.ink, alpha: drop(f, 1002) });
  // DANGER pop-up on "dangerous", with the section's one glitch tear
  if (on(f, wf(59) - 3, 1026)) {
    const f0 = wf(59) - 3, p = spring(since(f, f0), .7, 3), q = inv(1021, 1025, f); // opens over 3 frames, full on the onset
    const x = PX, y = 300, w = PW, h = 220;
    withT(() => {
      s.translate(x + w / 2, y + h / 2); const sc = lerp(.6, 1, p) * (1 - ease.in(q) * .4); s.scale(sc, sc); s.translate(-x - w / 2, -y - h / 2); s.globalAlpha = clamp(p * 2.5) * (1 - q);
      frect(x, y, w, h, C.bg); rect(x, y, w, h, C.hot, 3); frect(x, y, w, 46, C.hot);
      text('DANGER', x + 18, y + 32, { size: 20, weight: 700, color: C.bg, ls: 3 }); text('×', x + w - 22, y + 33, { size: 26, weight: 700, color: C.bg, align: 'center' });
      text('DANGER:', x + 24, y + 110, { size: 28, weight: 700, color: C.hot });
      const cx2 = x + 24 + measure('DANGER: ', { size: 28, weight: 700 });
      text('higher', cx2, y + 110, { size: 28, color: C.ink, probe: 'danger', box: [x, y + 60, w, 70] });
      spokenLine(f, 60, 62, x + 24, y + 156, { size: 28, color: C.ink });
      rect(x + w - 124, y + h - 56, 100, 36, C.ink, 1.5); text('OK', x + w - 74, y + h - 32, { size: 16, weight: 700, color: C.ink, align: 'center' });
    });
    fx({ glitch: .85 * hit(t, fs(wf(59)), 7) });
    readout = ['DANGER', f >= wf(62) ? '> 1 THINKS' : 'HIGHER', true];
  }

  // ================= SH05 SCAN f1002-f1104 =================
  if (on(f, wf(64), 1130)) {
    const p = spring(since(f, wf(64)), .78, 2.4), q = inv(1122, 1129, f), x = PX, y = 660 + sink * .5, w = PW, h = 450, cx = 360, cy = y + 232, R = 196;
    const sweep = since(f, wf(64)) * TAU / 2.2, blipA = since(wf(71), wf(64)) * TAU / 2.2, blipR = 118;
    const al = (1 - sleep * .8);
    const done = panelBox(x, y, w, h, p, q);
    s.globalAlpha = al * (1 - ease.in(q));
    for (let r = R / 4; r <= R; r += R / 4) { s.beginPath(); s.arc(cx, cy, r, 0, TAU); s.lineWidth = r === R ? 2 : 1; s.strokeStyle = r === R ? C.ink : C.faint; s.stroke(); }
    line([[cx - R, cy], [cx + R, cy]], C.faint, 1); line([[cx, cy - R], [cx, cy + R]], C.faint, 1);
    for (let d = 0; d < 360; d += 15) { const ang = d * Math.PI / 180; line([[cx + Math.cos(ang) * (R - 8), cy + Math.sin(ang) * (R - 8)], [cx + Math.cos(ang) * R, cy + Math.sin(ang) * R]], C.dim, 1.5); }
    withT(() => {
      s.beginPath(); s.arc(cx, cy, R - 1, 0, TAU); s.clip();
      for (let j = 0; j < 36; j++) { const ang = sweep - j * .026; s.globalAlpha = al * (1 - j / 36) * .45; line([[cx, cy], [cx + Math.cos(ang) * R, cy + Math.sin(ang) * R]], C.hot, 3); }
      s.globalAlpha = al; line([[cx, cy], [cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R]], C.hot, 2.5);
      if (f >= wf(71)) {
        const age = ((sweep - blipA) % TAU + TAU) % TAU / (TAU / 2.2), b = Math.exp(-age * 1.1);
        const bx = cx + Math.cos(blipA) * blipR, by = cy + Math.sin(blipA) * blipR;
        s.globalAlpha = al * (.15 + .85 * b); dot(bx, by, 7, C.ink); s.globalAlpha = al * b * .6; s.beginPath(); s.arc(bx, by, 7 + age * 30, 0, TAU); s.lineWidth = 1.5; s.strokeStyle = C.ink; s.stroke();
        PROBE.edge('blip', f >= wf(71), f - 1 >= wf(71));
      }
    });
    s.globalAlpha = 1; done();
    if (f < 1104) readout = ['INDIVIDUAL', f >= wf(71) ? '×1' : '×0', f >= wf(71)];
  }
  if (on(f, wf(64), 1070)) spokenLine(f, 64, 69, M, ASIDE, { fam: FAM.s, italic: true, size: 40, color: C.ink, alpha: drop(f, 1066) });
  if (on(f, wf(70), 1106)) {
    const a = drop(f, 1102, 2);
    bigWord(f, 'INDIVIDUAL', wf(70), L1, 84, { alpha: a, probe: 'individual' });
    bigWord(f, 'SURVIVAL,', wf(71), L2, 84, { alpha: a, stretch: 'expanded', probe: 'survival' });
    if (f >= wf(72)) text(wtx(72), M, L3 + 8, { fam: FAM.s, italic: true, size: 84, color: C.hot, alpha: a * ramp(f, wf(72)), probe: 'wally', box: [M, L3 - 84, COL, 110] });
  }

  // ================= SH06 SLEEP f1104-f1140 =================
  if (on(f, wf(73), 1144)) {
    const a = drop(f, 1134, 8);
    withT(() => { s.translate(0, sink); spokenLine(f, 73, 77, M, ASIDE, { fam: FAM.s, italic: true, size: 40, color: C.ink, alpha: a }); });
  }
  if (on(f, wf(79), 1146)) withT(() => { s.translate(0, sink); bigWord(f, 'ASLEEP', wf(79), L2 + 20, 120, { stretch: 'expanded', alpha: drop(f, 1136, 8), probe: 'asleep', ls: 2 }); });
  s.restore(); // end of the content layer

  // ================= chrome, then sleep mode, then what wakes on top of it
  if (f >= 1104) readout = ['ASLEEP', f >= wf(87) ? 'NO ×' : f >= wf(80) ? 'YES / NO' : '●', f >= wf(87)];
  if (sleep > 0) {
    // sleep mode: the interface dims under a 2D veil; the paper tape, the LED and the dialog sit on top of it
    frect(0, 0, W, H, `rgba(10,9,8,${(.62 * sleep).toFixed(3)})`);
  }
  chrome(t, f, code, readout, { alpha: 1 - sleep * .4 });
  if (sleep > 0) {
    // a breathing LED, slow, above the readout strip
    const br = .12 + .88 * (.5 - .5 * Math.cos(TAU * since(f, 1104) / 2.6));
    dot(360, 1118, 5, C.hot); s.globalAlpha = br; dot(360, 1118, 7, C.hot); s.globalAlpha = 1;
    PROBE.value('led', br);
  }
  // ================= SH07 DIALOG f1130-f1188
  if (f >= wf(80)) {
    const f0 = wf(80), p = spring(since(f, f0), .78, 2.6), x = PX, y = 540, w = PW, h = 300;
    withT(() => {
      s.translate(x + w / 2, y + h / 2); const sc = lerp(.9, 1, p); s.scale(sc, sc); s.translate(-x - w / 2, -y - h / 2); s.globalAlpha = clamp(p * 2.5);
      frect(x, y, w, h, '#1d1b18'); rect(x, y, w, h, C.ink, 2); frect(x, y, w, 36, '#2a2723'); line([[x, y + 36], [x + w, y + 36]], C.ink, 1);
      for (let i = 0; i < 3; i++) { s.beginPath(); s.arc(x + 20 + i * 22, y + 18, 6, 0, TAU); s.lineWidth = 1.5; s.strokeStyle = C.ink; s.stroke(); }
      spokenLine(f, 81, 83, x + 28, y + 98, { size: 28, color: C.ink });
      spokenLine(f, 84, 86, x + 28, y + 140, { size: 28, color: C.ink });
      const no = f >= wf(87);
      const btn = (bx, label, grey, probe) => {
        const c = grey ? C.ghost : C.ink; rect(bx, y + 212, 220, 56, c, 2);
        text(`[ ${label} ]`, bx + 110, y + 248, { size: 24, weight: 700, color: c, align: 'center', probe, box: [bx, y + 212, 220, 56], margin: 6 });
        if (grey) line([[bx + 8, y + 240], [bx + 212, y + 240]], c, 2);
      };
      btn(x + 40, 'YES', false, 'yes'); btn(x + w - 260, 'NO', no, 'no');
      PROBE.edge('no-greyed', no, f - 1 >= wf(87));
    });
    // the cursor drifts toward YES from "no" to the end
    const u = ease.inOutSine(inv(wf(87), 1188, f));
    const cxp = lerp(610, x + 40 + 118, u), cyp = lerp(1010, y + 212 + 22, u);
    cursor(cxp, cyp, C.ink);
    PROBE.box(s, 'cursor', cxp, cyp, 20, 36, { keep: true });
  }
}
