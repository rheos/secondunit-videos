// The Pips dance out the song. Bob (2026-10-15, on draft 8): "can they enter for the rest of the song @ 3:15 to dance
// around?" On the beat after the last refrain's heads duck out (195.37) all three drop in from the top of the frame
// and ride the camera's pull-back down to the nave floor, kicking in the air, landing one per beat (198.79, 199.48,
// 200.18) with the intro's gold sparks. Then a new move every beat or two to the end: ta-da, the Temptations walk, a
// hora line, chicken elbows, hits, a slide-and-kick line, the strut. The middle one leaps out of the top to pluck the
// last petal (205.12, pip-plucker.js) and drops back in. They dance on behind little Bob as he crosses the floor
// (outro-bob.js, he walks in front of them), tip their hats with him under the daisy (225.55), wave as the light goes
// and leap out of the top of the frame (230.72), just before the fade. They mouth along wherever the vocal stem sings.
// Draft 10 (Bob's photo, 2026-10-16: five singers in sharkskin jackets caught mid-step in one move): from the ta-da
// to the hat tip the routine is one synchronized step line in that manner, all three in unison. The key pose is
// the photo's: one knee lifted and crossing in front, weight on the back foot, both arms reaching forward and down
// with open palms. Kick-steps land that pose on the beat (the step is the half beat before it), in 4-beat phrases:
// travel right, travel left (the middle one is up plucking), double kicks, travel right, the photo held with two
// claps, travel left, a unison spin, kicks with a clap on every and, double kicks into the hat tip. The entry, the
// pluck, the hat tip with Bob, the wave and the exit are as draft 9.
// Five of them (Bob: "their differences are part of the fun"): k below is a place in the line, 0..4, left to right,
// and PIP_LINE says who stands there; the middle place (2) is the lead, who plucks the last petal. They land on the
// half beats from PF_B[5] to PF_B[7].
// Draft 11 (Bob, 2026-10-17): little Bob's walk is gone (main.js no longer draws outro-bob.js) and the singers are
// women (bridge-trio.js). The routine is unchanged: the hand to the hair at 225.58 is the old hat tip, now on its own.
// World space on the nave floor, drawn after the floor pool. Needs bridge-trio.js and pip-heads.js
// (pipSingMouth). Pure function of song time t.

// Beats from 195.37 (librosa beat track on the no_vocals stem, 86 bpm; the music's last hit is ~227.35, beats after
// it continue the grid).
const PF_B = [195.37, 196.05, 196.74, 197.42, 198.11, 198.79, 199.48, 200.18, 200.88, 201.57, 202.25, 202.90, 203.57,
  204.27, 204.96, 205.66, 206.33, 207.03, 207.73, 208.40, 209.12, 209.79, 210.49, 211.16, 211.86, 212.56, 213.23, 213.90,
  214.60, 215.30, 215.99, 216.67, 217.36, 218.06, 218.76, 219.43, 220.06, 220.78, 221.47, 222.17, 222.87, 223.54, 224.24,
  224.91, 225.58, 226.32, 227.02, 227.71, 228.40, 229.09, 229.78, 230.47, 231.16];
const PF = {
  in: PF_B[0], land: [PF_B[5], (PF_B[5] + PF_B[6]) / 2, PF_B[6], (PF_B[6] + PF_B[7]) / 2, PF_B[7]],
  pluck: [PF_B[13], PF_B[16]], // the middle Pip goes up to pluck petal 27 (205.12) and lands back on PF_B[16]
  leap: PF_B[51] + .25,        // and they all go up and out
  y: 2780,                     // world y of their feet: behind little Bob's line (2900), in front of the wall (2560)
  x: 1700, gap: 470,           // the middle singer's world x, and the spacing (screen ~890 px and ~165 px at rest)
  s: 1.1,                      // stage units -> world units (~300 px tall at the resting camera; Bob is ~380)
  sing: [[195.3, 211.2], [214.5, 217.5]], // the vocal stem's last held phrase and the tail
};
const PF_POSE = {
  fall: { ...POSE.vee, lL: [-.1, .25], lR: [.12, -.2], dip: 0 },
  land: { L: [-1.25, -1.0], R: [1.25, 1.0], lL: [-.55, .35], lR: [.55, -.35], x: 0, lean: 0, tilt: .08, dip: 64 },
  ready: { ...POSE.idle, dip: 8 },
  prep: { L: [-.6, -.2], R: [.6, .2], lL: [-.45, .3], lR: [.45, -.3], x: 0, lean: 0, tilt: .1, dip: 50 },
  leap: { ...POSE.vee, lL: [-.05, -.02], lR: [.3, 1.2], dip: 0 },
  scissA: { L: [-2.1, -2.3], R: [1.6, 1.2], lL: [-.9, -.4], lR: [.35, .9], x: 0, lean: .06, tilt: .1, dip: 0 },
  scissB: { L: [-1.6, -1.2], R: [2.1, 2.3], lL: [-.35, -.9], lR: [.9, .4], x: 0, lean: -.06, tilt: -.1, dip: 0 },
  strutA: { L: [-1.5, -2.1], R: [.55, 1.1], lL: [-.04, -.02], lR: [1.25, -.1], x: 0, lean: -.08, tilt: -.1, dip: 4 },
  strutB: { L: [-.55, -1.1], R: [1.5, 2.1], lL: [-1.25, .1], lR: [.04, .02], x: 0, lean: .08, tilt: .1, dip: 4 },
  wave: { L: [-.22, .95], R: [2.5, 2.2], lL: [-.05, -.02], lR: [.05, .02], x: 0, lean: -.05, tilt: -.1, dip: 6 },
};
// The photo's step (draft 10). KEY_R: the screen-right knee up and across, weight back on the left foot, both arms
// reaching forward and down; KEY_L is its mirror. KICK2 is the second, higher kick of a double; STEP is the half beat
// between, both feet down, knees giving; CLAP brings the hands together in front of the chest.
const pfMirror = mirrorPose; // bridge-trio.js
const PF_STEP = { KEY_R: { L: [-.72, -.32], R: [.42, -.2], lL: [-.05, .05], lR: [-.8, .82], x: -16, lean: -.05, tilt: -.1, dip: 8, palm: 1 },
  KICK2_R: { L: [-.85, -.45], R: [.55, -.3], lL: [-.06, .06], lR: [-1.05, .9], x: -20, lean: -.08, tilt: -.14, dip: 4, palm: 1 },
  STEP: { L: [-.16, -.02], R: [.16, .02], lL: [-.1, -.03], lR: [.1, .03], x: 0, lean: 0, tilt: 0, dip: 24 },
  CLAP: { L: [-.3, 1.42], R: [.3, -1.42], lL: [-.07, -.02], lR: [.07, .02], x: 0, lean: 0, tilt: .06, dip: 12 } };
PF_STEP.KEY_L = pfMirror(PF_STEP.KEY_R); PF_STEP.KICK2_L = pfMirror(PF_STEP.KICK2_R);
// Travel: the line moves PF_TRAVEL world units sideways on each travelling beat, in the step into the kick.
const PF_TRAVEL = 70, PF_MOVES = [...[9, 10, 11, 12, 21, 22, 23, 24].map((i) => [i, 1]), ...[13, 14, 15, 16, 29, 30, 31, 32].map((i) => [i, -1])];
function pfTravel(t) { let x = 0; for (const [i, d] of PF_MOVES) x += d * PF_TRAVEL * ease(t, PF_B[i] - (PF_B[i + 1] - PF_B[i]) / 2, PF_B[i]); return x; }
// [start, length, delay between singers]: the entry spin ripples down the line, the routine's spins are in unison
const PF_SPINS = [[PF_B[2], .55, .12], [PF_B[35], .5, 0], [PF_B[44] + .15, .55, 0]];
const PF_ROLLS = [[PF_B[3], PF_B[4]]];
const PF_CHICK = [];
function pfKeys(k) {
  const b = PF_B, h = (i) => (b[i + 1] - b[i]) / 2, K = [];
  const add = (t, P, d = .12) => K.push([t, P, d]);
  add(PF.in - .01, PF_POSE.fall, .01);
  add(b[1], PF_POSE.scissA); add(b[1] + h(1), PF_POSE.scissB, .1); add(b[2] + .1, POSE.wide, .2); // the spin in the air
  add(b[3], POSE.roll); add(b[4], PF_POSE.fall, .2);
  add(PF.land[k], PF_POSE.land, .06); add(PF.land[k] + .32, PF_POSE.ready, .2);
  const T = FINAL[1], S = PF_STEP, kick = (i, P) => { add(b[i], P, .14); add(b[i] + h(i), S.STEP, .14); };
  add(b[8] + .02, T, .26);                                                   // ta-da, all three the same
  [9, 10, 11, 12].forEach((i, j) => kick(i, j % 2 ? S.KEY_L : S.KEY_R));      // kick-steps travelling right
  [13, 14, 15, 16].forEach((i, j) => kick(i, j % 2 ? S.KEY_L : S.KEY_R));     // and back left
  for (const [i, K1, K2] of [[17, S.KEY_R, S.KICK2_R], [19, S.KEY_L, S.KICK2_L]]) { // double kicks in place
    add(b[i], K1, .14); add(b[i] + h(i), K2, .12); add(b[i + 1], S.STEP, .16);
  }
  [21, 22, 23, 24].forEach((i, j) => kick(i, j % 2 ? S.KEY_L : S.KEY_R));     // travelling right
  for (const [i, K] of [[25, S.KEY_L], [27, S.KEY_R]]) {                      // the photo, held, and two claps
    add(b[i], K, .14); add(b[i + 1], S.CLAP, .1); add(b[i + 1] + h(i + 1) * .5, S.STEP, .08); add(b[i + 1] + h(i + 1), S.CLAP, .1);
  }
  [29, 30, 31, 32].forEach((i, j) => kick(i, j % 2 ? S.KEY_L : S.KEY_R));     // travelling left
  add(b[33], S.KEY_R, .14); add(b[33] + h(33), S.STEP, .14); add(b[34], S.KEY_L, .14);
  add(b[35] + .1, POSE.wide, .2); add(b[36], S.KEY_R, .14);                   // the spin (PF_SPINS), out into the photo
  for (const i of [37, 38, 39, 40]) { add(b[i], i % 2 ? S.KEY_L : S.KEY_R, .14); add(b[i] + h(i), S.CLAP, .1); } // a clap on every and
  add(b[41], S.KEY_L, .14); add(b[41] + h(41), S.KICK2_L, .12); add(b[42], S.STEP, .16); add(b[42] + h(42), S.KEY_R, .14); add(b[43], S.STEP, .16);
  add(PF_B[44] - .13, POSE6.salute, .12); add(PF_B[44], POSE6.flick, .1); add(226.68, PF_POSE.ready, .2); // with Bob's hat
  for (const i of [46, 47, 48]) kick(i, i % 2 ? S.KEY_L : S.KEY_R);           // three more kick-steps
  add(b[49], PF_POSE.wave, .16); add(b[50] + .02, T, .26);                  // a wave as the light goes, a last ta-da
  add(PF.leap - .3, PF_POSE.prep, .14); add(PF.leap + .04, PF_POSE.leap, .12);
  if (k === 2) { // up to the daisy and back: crouch on the beat before, gone on PF.pluck[0], falling back in to PF.pluck[1]
    const r = K.filter(([t]) => t < PF.pluck[0] - .3 || t > PF.pluck[1] + .4); // he is back in step on b[17]
    r.push([PF.pluck[0] - .3, PF_POSE.prep, .14], [PF.pluck[0] + .04, PF_POSE.leap, .12], [PF.pluck[1] - .58, PF_POSE.fall, .05],
      [PF.pluck[1], PF_POSE.land, .06], [PF.pluck[1] + .3, PF_POSE.ready, .16]);
    return r.sort((a, c) => a[0] - c[0]);
  }
  return K.sort((a, c) => a[0] - c[0]);
}
const PF_KEYS = [0, 1, 2, 3, 4].map(pfKeys);
function pfKeyed(k, t) {
  const K = PF_KEYS[k];
  let i = 0; while (i + 1 < K.length && K[i + 1][0] - K[i + 1][2] <= t) i++;
  if (i === 0) return K[0][1];
  const [ta, P, d] = K[i], u = easeOutBack(clamp((t - (ta - d)) / d), 1.2);
  return mixPose(K[i - 1][1], P, u);
}
function pfBeat(t) { let n = 0; while (n + 2 < PF_B.length && PF_B[n + 1] <= t) n++; return { n, f: clamp((t - PF_B[n]) / (PF_B[n + 1] - PF_B[n])) }; }
const pfEnv = (a, b, t) => ease(t, a - .05, a + .03) * (1 - ease(t, b - .05, b + .03));
function pfPose(k, t) {
  let P = pfKeyed(k, t);
  for (const [a, b] of PF_ROLLS) { // hand rolls: forearms circling each other in front of the belt, two turns a beat
    const w = pfEnv(a, b, t); if (w <= 0) continue;
    const ph = TAU * (t - a) / (PIP_HEAD_BEAT / 2), s1 = Math.sin(ph), c1 = Math.cos(ph);
    const L = [-.42 + .2 * s1, 1.5 + .5 * c1], R = [.42 + .2 * s1, -1.5 + .5 * c1];
    P = { ...P, L: P.L.map((v, i) => lerp(v, L[i], w)), R: P.R.map((v, i) => lerp(v, R[i], w)) };
  }
  for (const [a0, b] of PF_CHICK) { // chicken elbows: four flaps a beat, knees bouncing with them
    const a = a0, w = pfEnv(a, b, t); if (w <= 0) continue;
    const f = .5 + .5 * Math.sin(TAU * (t - a) / (PIP_HEAD_BEAT / 4) - Math.PI / 2);
    P = { ...P, L: [P.L[0] - .5 * f * w, P.L[1]], R: [P.R[0] + .5 * f * w, P.R[1]], dip: P.dip + 12 * f * w, tilt: P.tilt + .1 * Math.sin(TAU * (t - a) / (PIP_HEAD_BEAT / 2)) * w };
  }
  { const w = pfEnv(PF_B[49], PF_B[50], t); // the wave: the raised forearm swings
    if (w > 0) P = { ...P, R: [P.R[0], P.R[1] + .45 * Math.sin(TAU * (t - PF_B[49]) / (PIP_HEAD_BEAT / 2)) * w] }; }
  const sing = PF.sing.some(([a, b]) => t >= a && t < b);
  const tada = (t >= PF_B[8] && t < PF_B[9]) || (t >= PF_B[50] && t < PF.leap - .3) // grins on the ta-das
    || (t >= PF_B[25] && t < PF_B[26]) || (t >= PF_B[27] && t < PF_B[28]);        // and on the held photo poses
  return { ...P, mouth: sing ? pipSingMouth(t) : tada ? .4 : .08 };
}
function pfActive(t) { return t >= PF.in && t < PF.leap + 1.2; }
// Feet: screen y while they come down with the pull-back (camera at t), world lift on the floor.
// In the air they keep their landing size on screen (grow), so the pull-back does not make them shrink.
function pfAir(k, t) { // 0 on the floor; otherwise which flight: 1 = the entry, 2 = the middle one's pluck, 3 = the exit
  if (t < PF.land[k]) return 1;
  if (k === 2 && t > PF.pluck[0] && t < PF.pluck[1]) return 2;
  if (t > PF.leap + k * .08) return 3;
  return 0;
}
function pfFeetSY(k, t, cam) { // screen y of his feet during the entry (cam: the camera at t)
  const fl = H / 2 + (PF.y - cam.y) * cam.s, a = PF.in + k * .12, L = PF.land[k];
  let sy = lerp(-80, .5 * H + 25 * k, 1 - Math.pow(1 - lin(t, a, a + .55), 2));   // in from the top
  sy += .08 * H * ease(t, a + .6, L - .5);                                          // drifting down
  { const { n, f } = pfBeat(t); if (n >= 1 && t < L - .5) sy -= 22 * Math.sin(Math.PI * f); } // a kick up on each beat
  const u = lin(t, L - .5, L); return lerp(sy, fl, u * u);                         // and down onto the floor
}
function pfLift(k, t, cam) {
  const air = pfAir(k, t);
  if (air === 1) return PF.y - (cam.y + (pfFeetSY(k, t, cam) - H / 2) / cam.s);
  if (air === 2) { // up out of the top, then falling back in from above
    const a = PF.pluck[0], b = PF.pluck[1], top = (PF.y - (cam.y - H / 2 / cam.s)) + 900;
    if (t < a + .5) { const u = (t - a) / .5; return top * u * u * u + 260 * u; }
    if (t > b - .55) { const u = lin(t, b - .55, b); return top * (1 - u * u); }
    return top;
  }
  if (air === 3) { const u = (t - PF.leap - k * .08) / .5; return (1.5 * H * u * u * u + 300 * u) / cam.s; }
  return 0;
}
function drawFinalePips(g, t, cam, tod) {
  if (!pfActive(t)) return;
  const s = cam.s, L = .35 + .65 * tod.I, br = L * (tod.col[0] + tod.col[1] + tod.col[2]) / 765;
  for (let k = 0; k < 5; k++) {
    if (t < PF.in + k * .12) continue;
    const S = SINGERS[PIP_LINE[k]], air = pfAir(k, t), lift = pfLift(k, t, cam);
    const grow = air === 1 ? camAt(PF.land[k]).s / s : 1;
    const wx = PF.x + pfTravel(t) + (k - 2) * PF.gap * (air === 1 ? lerp(.55, 1, ease(t, PF.land[k] - .6, PF.land[k])) : 1);
    g.save(); g.setTransform(s, 0, 0, s, W / 2 - cam.x * s, H / 2 - cam.y * s);
    g.translate(wx, PF.y); g.scale(PF.s, PF.s); g.translate(-S.x, -TRIO_FLOOR_Y);
    const near = clamp(1 - lift / 700);
    if (near > 0) { // contact shadow
      g.save(); g.translate(S.x, TRIO_FLOOR_Y + 10); g.scale(.6 + .4 * near, .18 * (.6 + .4 * near));
      const rg = g.createRadialGradient(0, 0, 0, 0, 0, 160); rg.addColorStop(0, `rgba(0,0,0,${.45 * near})`); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg; g.fillRect(-160, -160, 320, 320); g.restore();
    }
    for (const ld of k === 2 ? [PF.land[k], PF.pluck[1]] : [PF.land[k]]) { // landing: a ring of gold sparks at his feet
      const dl = t - ld; if (dl <= 0 || dl >= .45) continue;
      const u = dl / .45;
      g.save(); g.translate(S.x, TRIO_FLOOR_Y); g.strokeStyle = `rgba(255,224,140,${(1 - u) * br})`; g.lineWidth = 7; g.lineCap = 'round';
      for (let q = 0; q < 7; q++) {
        const a = Math.PI + (q + .5) / 7 * Math.PI, r0 = 90 + 160 * u, r1 = r0 + 50 * (1 - u);
        g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0 * .45); g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1 * .45); g.stroke();
      }
      g.restore();
    }
    g.translate(0, -lift / PF.s);
    if (grow !== 1) { g.translate(S.x, TRIO_FLOOR_Y); g.scale(grow, grow); g.translate(-S.x, -TRIO_FLOOR_Y); }
    const spU = PF_SPINS.reduce((u, [a, d, q]) => u + ease(t, a + k * q, a + k * q + d), 0), cs = Math.cos(spU * TAU);
    g.translate(S.x, 0); g.scale(Math.max(.12, Math.abs(cs)) * Math.sign(cs || 1), 1); g.translate(-S.x, 0);
    if (br < .985) g.filter = `brightness(${br.toFixed(3)})`;
    drawSinger(g, S, PIP_LINE[k], t, pfPose(k, t));
    g.restore();
  }
}
