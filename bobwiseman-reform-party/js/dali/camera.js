// Reform Party, Dali look: the camera. Draft 5: one continuous drone flight, never a cut and never a lock-off.
// ---------- projection (moved from world.js for draft 3) ----------
// Draft 3: the camera may turn left or right (C.yaw, radians, 0 = looking down +z, positive turns right).
// At yaw 0 the maths is exactly draft 2's. camAt fills C.cy / C.sy so P stays cheap.
  let C, CX, CZ, YAW, CP, SP;
  function P(X, Y, Z) { let dx = X - C.x, dz = Z - C.z; const dy = Y - C.y; if (C.sy) { const a = dx * C.cy - dz * C.sy; dz = dx * C.sy + dz * C.cy; dx = a; }
    const z = -dy * SP + dz * CP, y = dy * CP + dz * SP; return [W / 2 + C.f * dx / z, H / 2 - C.f * y / z, z, dx, y]; } // [3], [4]: camera-space x, y (for near clipping)
  function Lw(x, y, z) { const c = Math.cos(YAW), s = Math.sin(YAW); return [CX + x * c - z * s, y, CZ + x * s + z * c]; }
  const PL = (x, y, z) => { const w = Lw(x, y, z); return P(w[0], w[1], w[2]); };
  const ok = (pts) => pts.every((p) => p[2] > .08);
  function clipNear(pts, n = .1) { // cut a polygon at the near plane (only in the POV shots from the driver's hole, C.clip)
    const out = [], at = (a, b) => { const u = (n - a[2]) / (b[2] - a[2]), x = lerp(a[3], b[3], u), y = lerp(a[4], b[4], u); return [W / 2 + C.f * x / n, H / 2 - C.f * y / n, n, x, y]; };
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if (a[2] >= n) out.push(a); if ((a[2] >= n) !== (b[2] >= n)) out.push(at(a, b)); }
    return out; }
  function poly(pts, fill, stroke, lw) { if (!ok(pts)) { if (!C.clip || pts.some((p) => p.length < 5)) return; pts = clipNear(pts); if (pts.length < 3) return; } g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 1; g.stroke(); } }
  function seg(a, b, w, col) { if (a[2] < .08 || b[2] < .08) return; g.strokeStyle = col; g.lineWidth = Math.max(1, w); g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  const kAt = (p) => C.f / p[2]; // px per metre at that depth

// ---------- draft 5: the drone ----------
// Robin: always moving, zooming in and out and panning round with the important thing in frame, never stopping for
// more than a second or two, and even then floating a little in that spot.
// The framings below are pose keys [ox, oy, oz, pitch, f, yaw?] as offsets from the car (pitch > 0 looks down, yaw > 0
// turns right). KEYS says when the drone passes through each one: on its word. Between keys it flies a smooth curve
// (cubic, C1, with a limiter so it never overshoots a key), in cylinder coordinates round the car, so it swings round
// the table instead of cutting through it. On top of that, always: a slow hover (position, aim and focal length).
const orb = (deg, R, y, pitch, f, aim = 0) => { const a = deg * Math.PI / 180, ox = R * Math.cos(a), oz = R * Math.sin(a); return [ox, y, oz, pitch, f, Math.atan2(-ox, -oz) + aim]; };
const tw = (F, dx = 0, dy = 0, dz = 0, dp = 0, kf = 1, dyaw = 0) => [F[0] + dx, F[1] + dy, F[2] + dz, F[3] + dp, F[4] * kf, (F[5] || 0) + dyaw]; // a nudged copy
// draft-2 framings kept for the protected moments
const SPK = [1.2, 2.75, -3.3, .33, 1350], DRW = [-.8, 1.8, -1.6, .1, 1500], HEADS = [-.8, 1.95, -.4, .12, 1150];
const WB = [3.2, 2.1, -1.6, 0, 1400], WBM = [2.6, 2.1, -4.2, .04, 1350], TCLOSE = [1.2, 2.0, -4.0, .25, 1400];
const HOLE = [-.12, 2.05, -4.2, .13, 1500], TOPDOWN = [0, 8.5, -3.2, 1.15, 1250];
const PIE = [-.15, 2.9, -3.4, .55, 1400], BOOK = [-1.5, 2.7, -3.1, .6, 1400];
// draft 3 framings
const PUSH0 = [4, 1.4, -150, -.015, 1700], PUSH1 = [4, 1.5, -16, .03, 1250];       // intro: the car grows out of the horizon
const GAVEL = [-7.6, 1.2, -2.5, .03, 1200, .82];
const INTRO_H = [-15.5, 2.3, -7.8, .05, 1180, 1.02];                              // draft 9: where the intro glide hands over                                   // "law": low three-quarter on the chairman
const HTOP = [0, 3.9, -.3, 1.45, 1100], HTOP2 = [0, 3.6, -.9, 1.2, 1100], HIN = [0, 1.75, -.06, 1.5, 1300];          // over the hat hole, then into the hat
const SKY1 = [-3.2, 1.6, -10.5, -.2, 1050];   // draft 9: lower aim, the car fills the bottom third on "control"                                         // refrain 1 blues: low, the sky over the car
const WBF = [3.2, 2.15, -.95, 0, 1350];                                            // into the whiteboard (fills the frame)
const NEWS1 = [-1.4, 2.8, -6.8, .22, 1200];                                        // papers come down on the table
const SPIN1 = orb(-112, 11, 6.2, .5, 1150, .26), SPIN1C = [-.7, 1.15, -6, .02, 1000]; // draft 9: SPIN1C 1.5 m right, no suit hides the whiteboard // refrain 1 spin: high 3/4, then low cut-in
const TR1A = orb(-140, 7.5, .5, -.03, 950, .2), TR1B = orb(-100, 5.6, .45, -.05, 900, .12), TR1C = orb(-50, 7, .6, -.03, 950, -.2); // instrumental 1 tracking
const WBF2 = [3.2, 2.1, -.9, 0, 1400];                                             // push into the cell bars
const JAILM = [-1.52, 1.32, -2.05, -.06, 820, .3];                                         // "unveiled": table-top level on the jail model
const JAILW = [4, .4, -13, -.14, 1600];                                            // "jails": worm's-eye, cells rise behind
const WORME = orb(-155, 6.6, .3, -.36, 820, .15);                                 // refrain 2 blues: low, end-on, the chairman looms
const NEWS2 = [-1.2, .4, -5.2, -.34, 900];                                        // refrain 2 news: inside the ring, the drawer row
const HEADS2 = [-.8, 1.8, -.6, .08, 1500];  // draft 9: 20% closer                                         // grin 2: a touch lower and closer
const SPIN2A = [-1.2, .7, -5.4, -.14, 820, .18], SPIN2B = orb(-140, 7.6, .4, -.2, 880, .1); // refrain 2 spin: worm's-eye, suits whip overhead
const TR2A = orb(-40, 9.5, .45, -.03, 950, .3), TR2B = orb(-55, 6.4, .5, -.05, 900, .15); // instrumental 2: the car comes at us
const VOGUE = [-.3, 2.5, -1.6, .22, 900];                                          // vogue: over the near row onto the poses
const DIME = [-1.6, 2.5, -3.4, .55, 1400];
const POOR = [5.5, 1.5, -8, .04, 1300], POOR2 = [-.5, 1.5, -8, .04, 1300]; // draft 9: closer, held to 134.0      // the poor person on foot, the table rolls past
const ORBA1 = orb(-122, 9.5, 8, .72, 1100, .14), ORBA2 = orb(-62, 9.5, 8, .72, 1100, .14);    // bridge signature: the overhead orbit
const MICS = [-3.6, 2.3, -6.2, -.04, 1050, .12]; // draft 9: aimed at the boom-mic knot (car-local x -2.9, b3)
const TOPY = [...TOPDOWN, 0], ORBB = orb(-60, 3.4, 6.8, 1.1, 1250), ORBC = orb(-30, 4.4, 7.4, 1.0, 1200); // the chess board turns
const CHESSW = [1, 3, -8.5, .02, 1250];                                         // the giant chess pieces 20-30 m behind the car
const COPS = [1, 4.6, -26, .1, 2300];                                              // long lens: the table and the paid cops behind
const PERV1 = orb(-120, 8.5, 6.8, .62, 1100), PERV2 = orb(-75, 7.2, 4.2, .42, 1150); // "perverse": the orbit comes down onto the car
const POVB = [0, TOP + .14, .05, -.45, 760], POVN = [0, TOP + .2, .05, -.12, 820];   // refrain 3: from the driver's hole, looking up
const HEADS3 = [-.8, 1.9, -.35, .1, 1300];
const POVS = [0, TOP + .16, .05, -.22, 700, 0], POVS2 = [0, TOP + .16, .05, -.3, 760, .5]; // spin 3: the board whirls round the hole
const GBIG = [0, 6.0, -10, .44, 1150];
// draft 9 framings
const SPKI = [.5, 2.5, -2.0, .3, 950, .05];                                      // scientists: up out of the hat, the Instrument People beyond the far row
const FACTS1 = [3.0, 2.5, -5.6, .07, 1500, .03];                                  // facts 1: 6 m from the whiteboard
const SPIN2O = [0, 9.5, -3.4, 1.2, 1050];                                         // spin 2 overhead: the table's turn reads
const NEWS2O = [.6, 3.1, -3.2, .3, 1150];                                         // news 2: up over the press, not through its beams
const CRATES = [.9, 1.95, -1.9, .32, 1350, -.12];                                 // truth / box / talk: the nested crates beside the hat hole (b7)
const ROW14 = [0, 2.7, -10.5, .07, 1100];                                         // rehearsed: the whole row of 14, the board copies behind
const DI1 = [0, 13, -3.5, 1.2, 1000];                                               // Dali DI-1: the table from above reads as a mouth (eggs teeth, hat tongue)
const HIGH3 = [0, 27, -13, 1.1, 1150];                                            // facts / spin 3 from 30 m: the table's full turn, the bike lights' spiral
const SPIN3F = [1.5, 26, -12.5, 1.12, 1150, -.08];
const BOOKM = [-3.3, 1.75, -1.0, .14, 1400, -1.07];                                 // the noir book as the chairman's mask, three-quarter on (b2)                                           // the giant gavel lands on the table


// when the drone passes through each framing (song seconds), 0 to the aerial at 201
const KEYS = [
  [0, tw(INTRO_H, -30, 2, -4)],              // draft 9: the intro is a world window (WIN_DEF); these only shape the hand-over
  [8.5, tw(INTRO_H, -14, 1, -2)],
  [16.4, INTRO_H],                           // in behind the car's left rear corner
  [17.8, GAVEL],                             // the push carries on into the chairman's gavel ("law" 17.97)
  [19.3, tw(GAVEL, .6, .15, -.6, .02, 1.04, -.04)],
  [20.2, [-4.0, 2.8, -3.6, .62, 1150, .35]],  // rising over the near row...
  [21.4, HTOP],                              // 0:21: up and over the table, the hat hole below...
  [22.15, HIN],                              // ...down into the hat (it fills the frame)
  [23.5, SPKI],                             // draft 9: the Instrument People beyond the far row ("scientists")
  [24.05, SPK],                               // ...and up out of it onto the speakerphone (tape X on "can't" 24.76)
  [26.1, tw(SPK, .05, -.15, .3, .01)],
  [27.6, DRW],                               // gag (27.5), then the ear and the flying recorders
  [31.4, [-.5, 1.85, -1.5, .1, 1450, .06]],
  [34.7, [-.95, 1.75, -1.7, .09, 1500, .02]],
  [35.9, [-2.0, 2.9, -6.5, -.05, 1150]],     // up over the near row
  [37.0, SKY1],                              // control the blues
  [39.9, tw(SKY1, 2.5, .2, 6, .05, .95)],     // in toward the table under the blind (blues 39.65)
  [40.95, [2.0, 2.35, -3.9, .02, 1150]],     // 0:40.5: down out of the sky, skimming past the whiteboard: the padlock drops on the ear ("restrict" 40.91)
  [42.4, NEWS1],                             // onto the papers
  [44.4, tw(NEWS1, .1, -.1, .6, .01, 1.02)], // news 44.27
  [45.9, HTOP2],                             // 0:45.5: over the hat hole...
  [46.8, [-.4, 2.6, -.7, .55, 1120]],        // draft 9: kept .3 m clear of the tabletop on the way out
  [47.9, tw(HEADS, 0, 0, 0, 0, 1.25)],       // ...and up out of it onto the grins (grin 49.05), tighter
  [50.4, tw(HEADS, .05, -.02, .1, 0, 1.39)], // held to 50.4
  [52.5, FACTS1],                            // facts (52.39): 6 m from the whiteboard as the bars slide off
  [54.0, orb(-95, 10, 5.6, .47, 1150, .2)],
  [55.7, SPIN1C],                            // down and in: faces blur past (spin 56.2)
  [58.6, [-1.6, 1.0, -5.6, 0, 980]],
  [60.9, TR1A],                              // instrumental: low and close, swinging round the car
  [66.6, TR1B],
  [71.3, TR1C],
  [73.2, [3.6, 2.3, -3.6, .03, 1300]],       // up over the near row's end
  [74.5, WB],                                // the whiteboard: chart bars become cell bars on "crime" (75.71)
  [77.9, tw(WB, -.05, 0, .2, 0, 1.015)],     // barbed wire on "right" (78.01)
  [79.5, WBF2],                              // 1:20: into the bars...
  [80.6, TCLOSE],                            // ...and down onto the low table close-up
  [83.3, tw(TCLOSE, -.1, -.05, .25, .01, 1.015)], // soundbite teeth (82.37)
  [85.9, tw(TCLOSE, -.3, -.1, .4, -.01)],
  [86.6, [-1.52, 1.55, -3.3, 0, 900, .25]],  // in through the gap in the near row
  [87.3, tw(JAILM, -.4, .2, 0, .04)],        // draft 9: .4 m left and up so no head covers the model                             // "unveiled": table-top level as the drape lifts
  [88.9, tw(JAILM, .1, -.02, .1, -.01, 1.025)],
  [90.9, JAILW],                             // "jails" (92.32): long lens from low, the cells rise behind
  [92.6, tw(JAILW, -.4, -.02, .6, -.01, 1.015)],
  [95.0, WORME],                             // refrain 2 blues: end-on worm's-eye
  [97.2, orb(-151, 6.4, .3, -.37, 830, .15)],
  [99.3, NEWS2],                             // news into the drawer (101.77)
  [101.6, tw(NEWS2, .1, -.02, .2, -.01, 1.01)],
  [102.2, tw(NEWS2, .12, .12, .25, .08, 1.012)], // held to 102.2
  [102.75, NEWS2O],                           // draft 9: up over the press
  [103.1, WBF],                              // 1:43: through the whiteboard...
  [104.2, HEADS2],                           // ...onto the grins (106.69)
  [107.4, tw(HEADS2, .05, -.02, .1, 0, 1.025)],
  [108.75, [-1.52, 1.3, -2.3, .02, 1050]],   // out between two of the suits
  [109.8, SPIN2A],                           // refrain 2 spin: worm's-eye, suits sweep overhead (spin 114.11)
  [111.6, tw(SPIN2A, -.2, .02, -.3, .01, 1.025)],
  [113.2, SPIN2O],                           // draft 9: overhead for the spin (114.11): the table's turn reads
  [114.8, tw(SPIN2O, .2, .4, .1, 0, .97)],
  [116.5, orb(-120, 7.6, 1.2, .1, 880, .05)],
  [118.7, TR2A],                             // instrumental 2: the car comes at us, low
  [121.4, TR2B],
  [123.3, VOGUE],                            // 2:03: the track flies in onto the poses (vogue 123.54)
  [126.4, tw(VOGUE, -.02, .02, -.05, -.005, 1.005)], // vogue holds over "once upon a time" (126.52): the clock car on the right third
  [127.4, DIME],                             // the dime (127.46), the hat hole in frame for the iris into the table world
  [128.2, tw(DIME, .05, -.15, .1, .02, 1.03)],
  [130.0, POOR],                             // out of the iris (130.04) onto the poor person with the bowl
  [134.0, POOR2],                            // life's unfair: held while the table rolls on past
  [134.6, ORBA1],                            // up into the bridge's high orbit, briefly
  [135.6, CRATES],                           // draft 9: truth (135.53) into the crates, box 136.15, talk 137.33
  [137.3, tw(CRATES, .1, .02, .15, 0, 1.03)],
  [138.4, WBM],                              // (the dome window flies over these) wars (138.39): chips
  [139.3, tw(WBM, -.2, 0, -.2, .005)],
  [140.9, MICS],                            // the mics wilt on "limit" (140.3)
  [141.6, tw(MICS, .3, .1, -.1, .01, 1.01)],
  [142.7, PIE],                              // pie, blackbirds (144.55)
  [144.4, tw(PIE, 0, -.1, .15, .01, 1.015)],
  [145.3, HOLE],                             // Little Bob up through the hole (146.33)
  [146.8, tw(HOLE, 0, -.05, .2, 0, 1.015)],
  [147.6, BOOK],                             // the book (147.97)...
  [148.2, BOOKM],                            // draft 9: ...held over the chairman's egg as a mask (b2), to "look" 148.9
  [148.75, tw(BOOKM, .05, .02, .05, .01, 1.02)],
  [149.4, TOPY],                             // the match into the chess top-down (knight 149.16)
  [150.9, ORBB],                             // the board turns under us
  [152.65, CHESSW],                          // "foul" (152.82): down and back, the giant knight kicks the giant rook
  [153.6, tw(CHESSW, .2, .1, -.6, .01, .98)],
  [156.7, COPS],                             // pulling back and zooming in: the paid cops behind the table (paid 159.38)
  [159.5, tw(COPS, .2, -.2, 1.5, 0, .98)],
  [161.4, PERV1],                            // "perverse": the orbit comes down onto the car (163.34)
  [163.3, PERV2],
  [164.9, orb(-80, 6.8, 3.9, .4, 1160)],
  [166.3, ROW14],                            // rehearsed: the whole row nods as one (167.73), the board copies behind
  [168.4, tw(ROW14, .1, -.05, .6, 0, 1.02)],
  [169.8, POVB],                             // refrain 3 starts in the driver's hole, then climbs out over the city (WIN_DEF)
  [174.3, tw(POVB, 0, .01, 0, -.02, .985, .12)],
  [176.6, POVN],                             // news rains in (179.01)
  [179.3, tw(POVN, 0, 0, 0, -.02, 1.015, -.1)],
  [180.8, HEADS3],                           // grin 3 (182.78)
  [183.6, tw(HEADS3, .05, -.02, .07, 0, 1.015)],
  [184.9, DI1],                              // draft 9, Dali DI-1: up until the table reads as a mouth (b4's eye cars close in above 7 m)
  [185.7, tw(DI1, 0, -.15, .05, .01, 1.01)],
  [187.25, POVS],                             // down into the hat hole for "facts" (186.78)
  [189.6, HIGH3],                            // up to 30 m for "spin" (190.98): the table's full turn and the bike lights
  [191.2, SPIN3F],
  [193.7, GBIG],                             // up and out: the giant gavel lands on the table (195.02)
  [195.6, tw(GBIG, 0, .1, -.3, 0, .99)],
  [198.4, [5, 1.5, -36, -.12, 1300]],        // golden wide down the promenade
  [201, [6, 1.6, -40, -.13, 1300]],          // where the aerial (camera-end.js camEnd) takes off, at rest
];
// ---------- the flight ----------
// A cubic through keys with a slope limiter: C1, never overshoots a key, slope zero where a channel turns round.
function flight(keys, m0, m1) { // keys: [t, c0, c1, ...] -> f(t) giving the channels; m0 / m1: optional end slopes per channel (draft 9)
  const n = keys.length, T = keys.map((k) => k[0]), nc = keys[0].length - 1, M = [];
  for (let c = 1; c <= nc; c++) { const m = [];
    for (let i = 0; i < n; i++) { if (i === 0 && m0) { m.push(m0[c - 1]); continue; } if (i === n - 1 && m1) { m.push(m1[c - 1]); continue; }
      if (i === 0 || i === n - 1) { m.push(0); continue; } // at rest at both ends (the aerial hands over at rest)
      const dl = (keys[i][c] - keys[i - 1][c]) / (T[i] - T[i - 1]), dr = (keys[i + 1][c] - keys[i][c]) / (T[i + 1] - T[i]);
      if (dl * dr <= 0) { m.push(0); continue; }
      const v = (keys[i + 1][c] - keys[i - 1][c]) / (T[i + 1] - T[i - 1]), lim = 3 * Math.min(Math.abs(dl), Math.abs(dr)); m.push(Math.sign(v) * Math.min(Math.abs(v), lim)); }
    M.push(m); }
  return (t) => { t = clamp(t, T[0], T[n - 1]); let lo = 0, hi = n - 1; while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (T[mid] <= t) lo = mid; else hi = mid; }
    const h = T[hi] - T[lo], s = (t - T[lo]) / h, s2 = s * s, s3 = s2 * s, a = 2 * s3 - 3 * s2 + 1, b = s3 - 2 * s2 + s, c2 = -2 * s3 + 3 * s2, d = s3 - s2;
    const out = []; for (let c = 0; c < nc; c++) out.push(a * keys[lo][c + 1] + b * h * M[c][lo] + c2 * keys[hi][c + 1] + d * h * M[c][hi]); return out; };
}
const unwrap = (a, ref) => a - TAU * Math.round((a - ref) / TAU);
// before the aerial: [t, r, angle, y, pitch, yaw, ln f] in cylinder coordinates round the car
const FLY_A = flight((() => { const out = []; let th = -Math.PI / 2, yw = 0; for (const [t, F] of KEYS) { const r = Math.hypot(F[0], F[2]); th = unwrap(Math.atan2(F[2], F[0]), th); yw = unwrap(F[5] || 0, yw); out.push([t, r, th, F[1], F[3], yw, Math.log(F[4])]); } return out; })());
// after it: world metres [t, x, y, z, pitch, yaw, ln f] (camera-end.js END_KEYS)
const FLY_C = flight((() => { const out = []; let yw = 0; for (const k of END_KEYS) { yw = unwrap(k[6] || 0, yw); out.push([k[0], k[1], k[2], k[3], k[4], yw, Math.log(k[5])]); } return out; })());
// the hover: slow sums of sines, never jitter (periods 5 to 20 s)
const hov = (t, s) => .6 * Math.sin(t * (.31 + .07 * s) + s * 1.7) + .4 * Math.sin(t * (.53 + .05 * s) + s * 2.9);

// Draft 7 (Robin, after draft 6): "it really zooms around ... it would be nice if it would just glide a bit more". The
// flight above still passes every framing on its word; GLIDE low-passes it (a gaussian over the path), so the drone
// eases in and out of each framing instead of darting between them. The dives that must stay exact keep a narrow window.
const GLIDE_EXACT = [[16.6, 19.6, .3], [20.8, 24.6, .15], [46.2, 53.3, .3], [86.4, 88.2, .2], [99.0, 103.4, .25], [110.8, 115.4, .35], [36.4, 40.2, .35], [79.0, 81.2, .2], [102.3, 104.8, .2], [126.6, 131.2, .2], [131.5, 144.9, .35], [144.9, 147.4, .3], [147.4, 170.4, .35], [170.4, 196.2, .3]];
function glideSigma(t) { let s = 1.5; for (const [a, b, v] of GLIDE_EXACT) { const w = Math.min(ease(t, a - 1.2, a), 1 - ease(t, b, b + 1.2)); s = lerp(s, Math.min(s, v), clamp(w)); } return s; }
function glideA(t) {
  const sg = glideSigma(t); if (sg < .02) return FLY_A(t); const n = 12, acc = [0, 0, 0, 0, 0, 0]; let wsum = 0;
  for (let i = -n; i <= n; i++) { const d = i / n * 2.2 * sg, w = Math.exp(-.5 * (d / sg) ** 2), v = FLY_A(clamp(t + d, 0, 201)); for (let c = 0; c < 6; c++) acc[c] += w * v[c]; wsum += w; }
  return acc.map((v) => v / wsum);
}
// draft 9: the glide narrows off the aerial's landing (camEnd lands at rest on LOW)
// draft 9: the outro framings that must land (the bowl on "broke" 2, Dali's DI-3, vote 4) keep a narrow glide
const GLIDE_EXACT_C = [[232.2, 236.0, .35], [240.2, 245.2, .4], [248.9, 252.3, .45]];
function glideC(t) { let sg = t < 217 ? lerp(.02, .3, clamp((t - AIR.t1) / 1.2)) + 1.2 * ease(t, 215.7, 217) : 1.5;
  for (const [a, b, v] of GLIDE_EXACT_C) { const w = Math.min(ease(t, a - 1.2, a), 1 - ease(t, b, b + 1.2)); sg = lerp(sg, Math.min(sg, v), clamp(w)); }
  const n = 12, acc = [0, 0, 0, 0, 0, 0]; let wsum = 0;
  for (let i = -n; i <= n; i++) { const d = i / n * 2.2 * sg, w = Math.exp(-.5 * (d / sg) ** 2), v = FLY_C(clamp(t + d, AIR.t1, 268.99)); for (let c = 0; c < 6; c++) acc[c] += w * v[c]; wsum += w; }
  return acc.map((v) => v / wsum); }
// the drone's own bob on top of the slow hover: a few centimetres at 1.5 to 3 s periods, so a held framing still breathes
const bob = (t, s) => .55 * Math.sin(t * (2.3 + .17 * s) + s * 2.1) + .45 * Math.sin(t * (3.7 + .11 * s) + s * .7);
// the follow point: the car, except the intro (it drives into a still frame, then the drone picks it up) and the
// last seconds before the aerial (the drone slows to a stop in the air while the car brakes)
function follow(t) { return t < 10 ? carX(14) : t < 18 ? carX(14) + 12.8 * ((t - 10) / 8) ** 3 * (1 - (t - 10) / 16) : t < 197 ? carX(t)
  : (() => { const u = (t - 197) / 4, p0 = carX(197), p1 = carX(201), h00 = 2 * u ** 3 - 3 * u * u + 1, h10 = u ** 3 - 2 * u * u + u, h01 = -2 * u ** 3 + 3 * u * u; return h00 * p0 + h10 * 4 * 1.6 + h01 * p1; })(); }
// the car-relative flight as a world pose [x, y, z, pitch, yaw, ln f] (no hover, no wobble)
function relPose(t, raw) { const [r, th, cy0, cp, cyw, lf] = raw ? FLY_A(t) : glideA(t); return [follow(t) + r * Math.cos(th), cy0, r * Math.sin(th), cp, cyw, lf]; }

// ---------- draft 9: the drone off the leash ----------
// World-anchored windows: pose keys in world metres [t, x, y, z, pitch, f, yaw] (the shape END_KEYS uses), flown with
// the same flight() and a gaussian glide, blended in from the car-relative flight over `in` seconds and back out over
// `out`. The window's own spline starts and ends exactly on the car-relative pose, moving at its speed, so the blend
// only has to smooth the turn. in: 0 means the window owns the start (the intro); out: 0 means it owns the end (the
// golden wide hands straight to the aerial). The scene builders place their content at the spots these keys look at.
// aimAt: a key from a camera position and the point it looks at (dp / dyaw nudge the aim off that point)
const aimAt = (t, x, y, z, tx, ty, tz, f, dp = 0, dyaw = 0) => [t, x, y, z, Math.atan2(y - ty, Math.hypot(tx - x, tz - z)) + dp, f, Math.atan2(tx - x, tz - z) + dyaw];
const WIN_DEF = [
  // intro: sunrise over the Esplanade at 9:00 on a sound camp still dancing (b8, near (-450, 30)), bikes streaming out
  // onto the playa; the drone glides about 450 m out toward the car, drops to 3 m as it crosses the open playa, and
  // comes in behind the car's left rear corner for the push into the gavel (GAVEL 17.8, protected)
  { a: 0, b: 17.2, in: 0, out: 1.6, sg: .5, keys: [
    aimAt(0, -492, 25, 20, -450, 0, 30, 1100, -.16),
    aimAt(2.6, -481, 23.5, 19, -445, 0, 28, 1100, -.15),
    aimAt(6.2, -392, 16, 8, -250, 0, 2, 1150, -.02),
    aimAt(10.0, -238, 8, -4, carX(10), 1.2, 0, 1200),
    aimAt(13.2, -100, 3.6, -7.5, carX(13.2), 1.1, 0, 1200),
    aimAt(15.5, -40, 2.9, -8.5, carX(15.5), 1.1, .5, 1180),
  ] },
  // instrumental 1: out to a suit on a 4 m stepladder painting a 10 x 6 m sky-blue canvas beige (b8, (78, -28)), then
  // back onto the sax rider's tracking framing by SAX_IN (65.0)
  { a: 59.9, b: 67.2, in: .5, out: .5, sg: .35, keys: [
    aimAt(62.4, 61.5, 5, -14.8, 78, 4.1, -28, 1160),
    aimAt(65.0, 58.5, 2.4, -19.5, 78, 3.6, -28, 1000),                                // the painter turns to the sax rider, who rides in in front
  ] },
  // "build more": up past the car onto the build crew at the jail cells (b8, scissor lift; JAILS base carX(92.32))
  { a: 89.6, b: 92.5, in: .5, out: .5, sg: .3, keys: [
    aimAt(90.7, 101.5, 4.6, -9.5, 99, 2.8, 27, 1650),
    aimAt(91.4, 102.8, 4.4, -10.5, 98, 2.6, 27, 1700),
  ] },
  // instrumental 2: 10 m up over the column of burners carrying a 4 m X ballot across the road at x 165 (b8): ants
  // carrying a crumb; then down onto VOGUE at 123.3
  { a: 116.8, b: 123.3, in: .5, out: .5, sg: .4, keys: [
    aimAt(118.6, 159, 8.5, -15, 164.5, 0, -6, 1050),
    aimAt(120.4, 163.5, 10.5, -7.5, 165.2, 0, 0, 1000),
    aimAt(121.6, 163, 9.5, -4.5, 165, 0, 2.5, 1000),
  ] },
  // "wars / bets": out to the geodesic bungee-fight dome (b8, (200, -32), r 6 m), back for the mics at 140.55
  { a: 137.35, b: 141.0, in: .5, out: .5, sg: .3, keys: [
    aimAt(138.65, 191.5, 16, -34, 200, 1.5, -32, 1000),
    aimAt(139.8, 192.5, 15.4, -34.5, 200, 1.5, -32, 1020),
  ] },
  // refrain 3: from the driver's hole up to 25-40 m over the city for "control" (the marionette bar, b4) and "blues"
  // (the red drape across the whole horizon of camps, b4), then back down into the hole for the press (protected)
  { a: 169.9, b: 177.4, in: .6, out: .5, sg: .35, keys: [
    [170.75, carX(170.75) - .3, 2.6, -1.4, .02, 900, 0],                              // up out of the hole, level
    aimAt(171.3, carX(171.3) - 2.5, 9.5, -10.5, carX(171.3), 1.2, 0, 1000),            // "control" 171.29: the board framed from above (b4's marionette bar)
    [172.2, carX(172.2) - 3, 17, -15, .66, 1000, .165],                               // b4's pose, then on up
    aimAt(174.0, carX(174.0) - 2, 32, -12, carX(174.0) + 30, 0, 600, 950, -.02),
    aimAt(175.6, carX(175.6) - 1, 13, -9, carX(175.6), 1.2, 4, 1000, -.1),
  ] },
  // the golden wide: turning right past the Man until the Temple stands on the 12:00 horizon, framing Nakamura's sunset
  // howl (b8, burners near (285, -22) whose joined shadows draw one howling head, 196.5-200.5); hands to the aerial
  { a: 195.5, b: 201, in: .8, out: 0, sg: .35, keys: [
    [196.6, 274.0, 7.5, -9.5, .02, 950, -.25],                                        // the Man on the right, the sun sinking on the left
    [197.4, 274.0, 8.2, -8.5, .03, 950, -.42],
    [198.0, 273.9, 9.0, -7.0, .05, 950, -.68],                                        // 3:18: the sunset disc in the middle of the frame
    [199.1, 273.8, 10.0, -3.0, .22, 1000, -1.95],                                     // on round to the left, past the 9:00 city...
    aimAt(200.2, 274.2, 11.3, 0, 287.5, 0, -26.5, 1080, -.09, .12),                   // ...onto the howl, the Temple on the 12:00 horizon
    aimAt(201.0, 274.6, 11.6, .4, 288, 0, -27, 1080, -.1, .13),
  ] },
];
const WINS = WIN_DEF.map((w) => {
  const rows = [], slope = (t) => { const a = relPose(t - .05), b = relPose(t + .05); return a.map((v, i) => (b[i] - v) / .1); };
  if (w.in) rows.push([w.a, ...relPose(w.a)]);
  for (const k of w.keys) rows.push([k[0], k[1], k[2], k[3], k[4], k[6] || 0, Math.log(k[5])]);
  if (w.out) rows.push([w.b, ...relPose(w.b)]);
  let ref = rows[0][5]; for (const r of rows) { r[5] = unwrap(r[5], ref); ref = r[5]; }
  const fly = flight(rows, w.in ? slope(w.a) : null, w.out ? slope(w.b) : null), t0 = rows[0][0], t1 = rows[rows.length - 1][0];
  return Object.assign({}, w, { fly, t0, t1 });
});
function winPose(w, t) { // the window's own flight with its glide (a gaussian, clamped to the window)
  if (!w.sg) return w.fly(t); const n = 10, acc = [0, 0, 0, 0, 0, 0]; let ws = 0;
  for (let i = -n; i <= n; i++) { const d = i / n * 2.2 * w.sg, k = Math.exp(-.5 * (d / w.sg) ** 2), v = w.fly(clamp(t + d, w.t0, w.t1)); for (let c = 0; c < 6; c++) acc[c] += k * v[c]; ws += k; }
  return acc.map((v) => v / ws); }
function winBlend(t, base) { // the world windows laid over the car-relative pose
  for (const w of WINS) { if (t < w.a || t > w.b) continue;
    const k = (w.in ? smooth((t - w.a) / w.in) : 1) * (w.out ? 1 - smooth((t - (w.b - w.out)) / w.out) : 1); if (k <= 0) continue;
    const q = winPose(w, t); q[4] = unwrap(q[4], base[4]); base = base.map((v, i) => lerp(v, q[i], k)); }
  return base; }
// where the golden wide leaves the drone at 201: camera-end.js starts the aerial from here
function goldEnd() { const w = WINS[WINS.length - 1], q = winPose(w, w.b); return { x: q[0], y: q[1], z: q[2], p: q[3], yaw: q[4], f: Math.exp(q[5]) }; }
// draft 9: the roll channel (the "perverse" roll, rendered as a post pass in render.js): radians, 0 = level
function camRoll(t) { const a = wt(29, 'perverse'), b = wt(30, 'rehearsed'); if (t < a - .3 || t > b) return 0;
  return Math.PI * (smooth((t - a + .3) / 1.2) - smooth((t - b + 1.3) / 1.2)); }

function camAt(t, bare) { // bare: without the hover (for the motion check only)
  let c = typeof camEnd === 'function' ? camEnd(t) : null; // the dusk aerial over Black Rock City (camera-end.js), 201-215.2
  if (!c) {
    let x, y, z, p, yw, f;
    if (t <= 201) { [x, y, z, p, yw, f] = winBlend(t, relPose(t, bare === 'raw')); f = Math.exp(f); }
    else { const [cx, cy0, cz, cp, cyw, lf] = bare === 'raw' ? FLY_C(t) : glideC(t); x = cx; y = cy0; z = cz; p = cp; yw = cyw; f = Math.exp(lf); }
    // the old hand-held wobble, kept so the hand-overs to and from the aerial (which has it too) match exactly
    const ox = x - carX(Math.min(t, 238)), near = clamp((Math.hypot(ox, y - TOP, z - carZ(t)) - .5) / .7);
    x += .25 * Math.sin(t * .23) * near; y += .05 * Math.sin(t * .31) * near;
    c = { x, y, z, p, f, yaw: yw };
  }
  // the hover, everywhere: up to half a metre of drift (scaled with the distance to the car), a little float in the aim, the lens breathing
  const dist = Math.hypot(c.x - carX(t), c.y - 1, c.z - carZ(t)), near = clamp((Math.hypot(c.x - carX(t), c.y - TOP, c.z - carZ(t)) - .5) / .7), A = bare ? 0 : clamp(.05 * dist, .04, .45) * near;
  const clip = Math.hypot(c.x - carX(t), c.z - carZ(t)) < .6 && c.y < TOP + .6; // inside the driver's hole: clip near polygons
  const hx = A * hov(t, 1), hy = A * .6 * hov(t, 2), hz = A * hov(t, 3), ha = dist > 400 ? .3 : 1;
  const gu = t - (typeof gavelT === 'function' ? gavelT() : L_(34).e - .5), sh = gu >= 0 && gu < .4 ? (1 - gu / .4) ** 2 : 0; // the giant gavel's impact shakes the drone
  const hb = bare ? 0 : 1, yaw = c.yaw + .012 * ha * hb * hov(t, 4), p = Math.min(c.p + .008 * ha * hb * hov(t, 5), 1.565), f = c.f * (1 + .018 * hb * hov(t, 6));
  const bb = bare ? 0 : clamp(.012 * dist, .025, .09) * near; // the bob, scaled like the hover but smaller
  c = Object.assign({}, c, { x: c.x + bb * bob(t, 7), y: c.y + bb * .8 * bob(t, 8), z: c.z + bb * bob(t, 9) });
  return { x: c.x + hx + .05 * sh * Math.sin(gu * 55), y: c.y + hy + .04 * sh * Math.sin(gu * 71 + 1), z: c.z + hz, p, f, yaw, cy: Math.cos(yaw), sy: Math.sin(yaw), clip: c.clip || clip, roll: camRoll(t) };
}
