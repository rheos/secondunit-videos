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
const POVB = [0, TOP + .14, -.05, -.45, 760], POVN = [0, TOP + .2, -.05, -.12, 820];   // refrain 3: from the driver's hole, looking up
const HEADS3 = [-.8, 1.9, -.35, .1, 1300];
const POVS = [0, TOP + .16, -.05, -.22, 700, 0], POVS2 = [0, TOP + .16, -.05, -.3, 760, .5]; // spin 3: the board whirls round the hole
const GBIG = [0, 6.0, -10, .44, 1150];
// draft 9 framings
const SPKI = [.5, 2.5, -2.0, .3, 950, .05];                                      // scientists: up out of the hat, the Instrument People beyond the far row
const FACTS1 = [3.0, 2.5, -5.6, .07, 1500, .03];                                  // facts 1: 6 m from the whiteboard
const SPIN2O = [0, 9.5, -3.4, 1.2, 1050];                                         // spin 2 overhead: the table's turn reads
const NEWS2O = [.6, 3.1, -3.2, .3, 1150];                                         // news 2: up over the press, not through its beams
const CRATES = [.9, 1.95, -1.9, .32, 1350, -.12];                                 // truth / box / talk: the nested crates beside the hat hole (b7)
const ROW14 = [0, 2.7, -10.5, .07, 1100];                                         // rehearsed: the whole row of 14, the board copies behind
const DI1 = [0, 8.5, -2.3, 1.2, 700];  // draft 12: 8.5 m on a wider lens (same framing), so the climb from the grin fits the limits                                               // Dali DI-1: the table from above reads as a mouth (eggs teeth, hat tongue)
const HIGH3 = [0, 27, -13, 1.1, 1150];                                            // facts / spin 3 from 30 m: the table's full turn, the bike lights' spiral
const SPIN3F = [1.5, 26, -12.5, 1.12, 1150, -.08];
const BOOKM = [-3.4, 1.75, -2.9, .1, 1300, -.5];     // draft 12: from in front of the near row's end, a turn the drone can make between the cue words                                 // the noir book as the chairman's mask, three-quarter on (b2)                                           // the giant gavel lands on the table


// draft 12 (Robin's notes): the grins from 2 m off the far row on a wide lens, the drone trucking along it so three
// faces are always in frame; the gag lips filling the middle of the frame on "gag"
const GRIN_A = [-1.9, 1.8, .15, .1, 800], GRIN_B = [1.1, 1.8, .15, .1, 800];
const GAGL = [.6, 2.1, -4.8, -.12, 1250, -.2];

// draft 13: the diva's plinth, car-local (rapper.js RAP reads it; camera.js loads first), and a car-relative key at
// (x, y, z) looking at her chest, or at a car-local point tgt
const RAP_AT = { lx: -2.9, lz: -3.35, chest: .85 + 1.35, head: .85 + 1.62 };
const rapCam = (x, y, z, f, tgt) => { const T = tgt || [RAP_AT.lx, RAP_AT.chest, RAP_AT.lz], dx = T[0] - x, dz = T[2] - z;
  return [x, y, z, Math.atan2(y - T[1], Math.hypot(dx, dz)), f, Math.atan2(dx, dz)]; };
// when the drone passes through each framing (song seconds), 0 to the aerial at 201
const KEYS = [
  [19.3, tw(GAVEL, .6, .15, -.6, .02, 1.04, -.04)],
  [20.2, [-4.0, 2.8, -3.6, .62, 1150, .35]],  // rising over the near row...
  [21.0, tw(HTOP, 0, -.4, -.6, -.5)],        // 0:21: up over the table, the hat hole below (draft 12: no dive into the
  [21.75, SPKI],                            // hat, "scientists" 22.05 was inside it): the Instrument People beyond the far row
  [23.0, [1.1, 2.7, -3.2, .34, 1250, 0]],   // draft 13: back from the hat onto the phone as it starts to soften
  [24.05, tw(SPK, 0, .1, 0, .12)],             // on the speakerphone, aimed down so the edge it runs over stays in frame (tape X on "can't" 24.76)
  [25.2, tw(SPK, .05, .15, -.2, .26, 1.0)],  // Robin (d13): close and steady while it melts over the edge (22.4-26.0)
  [25.9, tw(SPK, .08, .1, -.3, .25, 1.0)],
  [26.85, [1.0, 2.2, -4.6, -.02, 1000, -.06]], // ...back and wider: the soft phone low in frame, the gag lips rising above it
  [27.75, GAGL],                             // gag (27.5): the lips central and close, the phone springs back below
  [29.9, tw(DRW, 0, 0, 0, -.07)],                               // then the ear and the flying recorders
  [31.4, [-.5, 1.85, -1.5, .1, 1450, .06]],
  [34.7, [-.95, 1.75, -1.7, .09, 1500, .02]],
  [35.9, [-2.0, 2.9, -6.5, -.05, 1150]],     // up over the near row
  [37.0, SKY1],                              // control the blues
  [45.9, [-.33, 3.4, -1.37, 1.0, 1180]],     // 0:45.5: over the hat hole, draft 10's flown pose (d12: eased in from the press)                             // 0:45.5: over the hat hole...
  [46.8, [-.4, 2.6, -.7, .55, 1120]],        // draft 9: kept .3 m clear of the tabletop on the way out
  [47.9, GRIN_A],                            // ...and up out of it, close on the far row, then a slow truck
  [50.4, GRIN_B],                            // across the faces through grin (49.05): Robin (d12), three faces in frame at a time
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
  [104.2, tw(GRIN_B, 0, -.05, 0, -.02)],     // ...onto the grins (106.69): close, trucking right to left across the faces
  [107.4, tw(GRIN_A, .5, -.05, 0, -.02)],
  [108.75, [-1.52, 1.3, -2.3, .02, 1050]],   // out between two of the suits
  [109.8, SPIN2A],                           // refrain 2 spin: worm's-eye, suits sweep overhead (spin 114.11)
  [111.6, tw(SPIN2A, -.2, .02, -.3, .01, 1.025)],
  [113.2, tw(SPIN2O, 0, 0, 0, -.4)],         // draft 9: overhead for the spin (114.11): the table's turn reads (d16: less steep, so the
  [114.8, tw(SPIN2O, .2, .4, .1, -.3, .97)], // Instrument People stay in the top of frame now the climb starts from above the table)
  [116.5, orb(-120, 7.6, 1.2, .1, 880, .05)],
  [118.7, TR2A],                             // instrumental 2: the car comes at us, low
  [121.4, TR2B],
  // draft 13 (Robin on d12: the diva needs real camera time): the rap is flown on her. She stands on her drawer plinth
  // behind the near row's left end (RAP_AT), and the drone hangs 2-3 m off her, cutting away only for the world
  // through the hole (127.8-130) and the poor person on "dared", then Little Bob with her beside him, then the chess.
  [122.3, rapCam(-1.5, 2.5, -5.3, 1000)],     // draft 25: already on her as she lands, so she is there on the first word (123.28)
  [123.3, rapCam(-1.3, 2.3, -5.0, 1000)],     // close on her as the rap opens (vogue 123.54), from the front right
  [125.8, rapCam(-1.1, 2.4, -5.0, 1000, [-2.1, 1.8, -2.3])],   // on her, the dime coming into the right of frame, through "once upon a time"
  [127.4, DIME],                             // the dime (127.46), the hat hole in frame for the iris into the table world
  [128.2, tw(DIME, .05, -.15, .1, .02, 1.03)],
  [130.0, POOR],                             // out of the iris (130.04) onto the poor person with the bowl ("dared" 130.16)
  [131.4, tw(POOR, -.3, 0, .1)],
  [134.0, rapCam(-1.1, 2.35, -5.2, 1000)],    // back on her, close again (vogue 134.34, truth, box, talk)
  [137.0, rapCam(-1.5, 2.3, -4.8, 1080)],
  [139.8, rapCam(-3.1, 2.5, -5.6, 1000)],     // drifting round in front of her (wars, limit)
  [142.6, rapCam(-4.4, 2.4, -5.0, 1000)],     // to her other side, close (pie 144.55)
  // draft 16 (Robin, 2:26: "the camera should be closer to little bob"): in from her front to 3 m off the hat hole, Bob
  // filling half the frame height on "little" (146.33); she has gone off the left edge. Aimed nearly as the book pin at
  // 147.5 looks, so the hand-over is a small turn
  [145.0, rapCam(-1.6, 3.0, -4.9, 1000, [-2.1, 1.9, -1.4])], // she on the left, the hat hole right of centre (pie 144.55)
  [145.85, rapCam(-.6, 2.7, -3.5, 1180, [0, 1.6, 0])],
  [146.75, rapCam(-.35, 2.45, -2.9, 1260, [0, 1.65, 0])],
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
  [180.8, GRIN_A],                           // grin 3 (182.78): close, trucking left to right across the faces
  [183.6, GRIN_B],
  [184.5, tw(GRIN_B, -.3, .6, -.6, .2, .97)], // lifting off the row, slowly at first
  [186.8, DI1],                              // draft 9, Dali DI-1: up until the table reads as a mouth (b4's eye cars close in above 7 m)
  // draft 12 (AUDIT-d10 pass 1): the dip back into the hat hole for "facts" is cut (a yo-yo); the climb is one rise
  [189.6, HIGH3],                            // up to 30 m for "spin" (190.98): the table's full turn and the bike lights
  [191.2, SPIN3F],
  [193.7, GBIG],                             // up and out: the giant gavel lands on the table (195.02)
  [195.6, tw(GBIG, 0, .1, -.3, 0, .99)],
  [198.4, [5, 1.5, -36, -.12, 1300]],        // golden wide down the promenade
  [201, [6, 1.6, -40, -.13, 1300]],          // where the aerial (camera-end.js camEnd) takes off, at rest

  [16.5, [-15.07, 2.16, -7.01, 0.05, 1181, 1.02]], // draft 10's flown pose (protected, restored in d12)
  [17.0, [-12.32, 1.77, -5.22, 0.04, 1185, 0.95]], // draft 10's flown pose (protected, restored in d12)
  [17.5, [-9.22, 1.34, -3.24, 0.03, 1194, 0.87]], // draft 10's flown pose (protected, restored in d12)
  [18.0, [-7.83, 1.18, -2.55, 0.03, 1207, 0.81]], // draft 10's flown pose (protected, restored in d12)
  [18.5, [-7.62, 1.2, -2.59, 0.03, 1226, 0.8]], // draft 10's flown pose (protected, restored in d12)
  [42.0, [-0.13, 2.56, -5.84, 0.13, 1161, 0]], // draft 10's flown pose (protected, restored in d12)
  [42.5, [-0.38, 2.67, -5.92, 0.19, 1178, 0]], // draft 10's flown pose (protected, restored in d12)
  [43.0, [-0.62, 2.76, -5.87, 0.25, 1188, 0]], // draft 10's flown pose (protected, restored in d12)
  [43.5, [-0.81, 2.84, -5.64, 0.32, 1191, 0]], // draft 10's flown pose (protected, restored in d12)
  [44.0, [-0.95, 2.91, -5.19, 0.4, 1188, 0]], // draft 10's flown pose (protected, restored in d12)
  [147.5, [-1.35, 2.49, -3.21, 0.45, 1424, -0.13]], // draft 10's flown pose (protected, restored in d12)
  [148.0, [-2.71, 2.16, -1.96, 0.31, 1404, -0.65]], // draft 10's flown pose (protected, restored in d12)
  [148.5, [-3.06, 2.22, -1.27, 0.22, 1404, -0.96]], // draft 10's flown pose (protected, restored in d12)
  [149.0, [-2.22, 4.63, -2.39, 0.57, 1348, -0.62]], // draft 10's flown pose (protected, restored in d12)
  [149.5, [-0.13, 7.62, -3.22, 1.03, 1271, -0.18]], // draft 10's flown pose (protected, restored in d12)
  [150.0, [1.06, 8.09, -3.05, 1.14, 1250, -0.2]], // draft 10's flown pose (protected, restored in d12)
  [150.5, [1.5, 7.45, -2.95, 1.12, 1250, -0.4]], // draft 10's flown pose (protected, restored in d12)
  [151.0, [1.7, 6.53, -3.25, 1.03, 1250, -0.47]], // draft 10's flown pose (protected, restored in d12)
  [151.5, [1.79, 5.31, -4.41, 0.75, 1250, -0.36]], // draft 10's flown pose (protected, restored in d12)
  [152.0, [1.53, 4.04, -6.27, 0.37, 1250, -0.18]], // draft 10's flown pose (protected, restored in d12)
  [152.5, [1.08, 3.23, -7.9, 0.1, 1249, -0.04]], // draft 10's flown pose (protected, restored in d12)
  [153.0, [0.94, 3.02, -8.7, 0.03, 1241, 0]], // draft 10's flown pose (protected, restored in d12)

  [39.50, [-0.92, 1.73, -5.07, -0.17, 1000, 0.00]], // draft 10 flown pose (protected, restored in d12)
  [40.00, [-0.22, 1.86, -4.58, -0.13, 1016, 0.00]], // draft 10 flown pose (protected, restored in d12)
  [40.50, [0.85, 2.10, -4.44, -0.06, 1077, 0.00]], // draft 10 flown pose (protected, restored in d12)
  [41.00, [0.39, 2.31, -5.32, 0.03, 1116, 0.00]], // draft 10 flown pose (protected, restored in d12)
  [41.50, [0.05, 2.43, -5.69, 0.07, 1139, 0.00]], // draft 10 flown pose (protected, restored in d12)
];
// ---------- draft 9: the drone off the leash ----------
// World-anchored windows: pose keys in world metres [t, x, y, z, pitch, f, yaw] (the shape END_KEYS uses). Draft 12: a
// window's keys replace the KEYS inside [a, b] in the one composite path (no blend). The scene builders place their
// content at the spots these keys look at.
// aimAt: a key from a camera position and the point it looks at (dp / dyaw nudge the aim off that point)
const aimAt = (t, x, y, z, tx, ty, tz, f, dp = 0, dyaw = 0) => [t, x, y, z, Math.atan2(y - ty, Math.hypot(tx - x, tz - z)) + dp, f, Math.atan2(tx - x, tz - z) + dyaw];
const WIN_DEF = [
  // intro: sunrise over the Esplanade at 9:00 on a sound camp still dancing (b8, near (-450, 30)), bikes streaming out
  // onto the playa; the drone glides about 450 m out toward the car, drops to 3 m as it crosses the open playa, and
  // comes in behind the car's left rear corner for the push into the gavel (GAVEL 17.8, protected)
  { a: 0, b: 16.0, keys: [
    aimAt(0, -492, 25, 20, -450, 0, 30, 1100, -.16),
    aimAt(2.6, -481, 23.5, 19, -445, 0, 28, 1100, -.15),
    aimAt(6.2, -392, 16, 8, -250, 0, 2, 1150, -.02),
    aimAt(10.0, -238, 8, -4, carX(10), 1.2, 0, 1200),
    aimAt(13.2, -100, 3.6, -7.5, carX(13.2), 1.1, 0, 1200),
    aimAt(15.5, -40, 2.9, -8.5, carX(15.5), 1.1, .5, 1180),
  ] },
  // instrumental 1: out to a suit on a 4 m stepladder painting a 10 x 6 m sky-blue canvas beige (b8, (78, -28)), then
  // back onto the sax rider's tracking framing by SAX_IN (65.0)
  { a: 59.9, b: 67.2, keys: [
    aimAt(62.4, 61.5, 5, -14.8, 78, 4.1, -28, 1160),
    aimAt(65.0, 58.5, 2.4, -19.5, 78, 3.6, -28, 1000),                                // the painter turns to the sax rider, who rides in in front
  ] },
  // "build more": up past the car onto the build crew at the jail cells (b8, scissor lift; JAILS base carX(92.32))
  { a: 89.6, b: 92.5, keys: [
    aimAt(90.7, 101.5, 4.6, -9.5, 99, 2.8, 27, 1650),
    aimAt(91.4, 102.8, 4.4, -10.5, 98, 2.6, 27, 1700),
  ] },
  // instrumental 2: 10 m up over the column of burners carrying a 4 m X ballot across the road at x 165 (b8): ants
  // carrying a crumb; then down onto VOGUE at 123.3
  { a: 116.8, b: 121.2, keys: [  // draft 25 (Bob: "can we see the horse woman immediately"): the window ends sooner
    aimAt(118.6, 159, 8.5, -15, 164.5, 0, -6, 1050),
    aimAt(120.4, 163.5, 10.5, -7.5, 165.2, 0, 0, 1000),
  ] },
  // refrain 3: from the driver's hole up to 25-40 m over the city for "control" (the marionette bar, b4) and "blues"
  // (the red drape across the whole horizon of camps, b4), then back down into the hole for the press (protected)
  { a: 169.9, b: 177.4, keys: [
    [170.75, carX(170.75) - .3, 2.6, -1.4, .02, 900, 0],                              // up out of the hole, level
    aimAt(171.3, carX(171.3) - 2.5, 9.5, -10.5, carX(171.3), 1.2, 0, 1000),            // "control" 171.29: the board framed from above (b4's marionette bar)
    [172.2, carX(172.2) - 3, 17, -15, .66, 1000, .165],                               // b4's pose, then on up
    aimAt(174.0, carX(174.0) - 2, 32, -12, carX(174.0) + 30, 0, 600, 950, -.02),
    aimAt(175.6, carX(175.6) - 1, 13, -9, carX(175.6), 1.2, 4, 1000, -.1),
  ] },
  // the golden wide: turning right past the Man until the Temple stands on the 12:00 horizon, framing Nakamura's sunset
  // howl (b8, burners near (285, -22) whose joined shadows draw one howling head, 196.5-200.5); hands to the aerial
  { a: 195.5, b: 201, keys: [
    [196.6, 274.0, 7.5, -9.5, .02, 950, -.25],                                        // the Man on the right, the sun sinking on the left
    [197.4, 274.0, 8.2, -8.5, .03, 950, -.42],
    [198.0, 273.9, 9.0, -7.0, .05, 950, -.68],                                        // 3:18: the sunset disc in the middle of the frame
    [199.1, 273.8, 10.0, -3.0, .22, 1000, -1.95],                                     // on round to the left, past the 9:00 city...
    aimAt(200.2, 274.2, 11.3, 0, 287.5, 0, -26.5, 1080, -.09, .12),                   // ...onto the howl, the Temple on the 12:00 horizon
    aimAt(201.0, 274.6, 11.6, .4, 288, 0, -27, 1080, -.1, .13),
  ] },
];
// ---------- draft 12: one composite path, then a two-way rate-limited follower ----------
// Robin, draft 10: "for the camera to be smoother ... lookin gat the important things on cue". Draft 10 flew the keys
// with a cubic, low-passed it, and laid the world windows over it by lerping two moving poses, which overshot and kinked.
// Now: (1) one target path. The car-relative KEYS, with each world window's keys put in place of the KEYS inside it
// (no blend), the aerial (camera-end.js camEnd) and the END_KEYS after it, all in one frame: metres from the car's x
// (the frame the check measures in). (2) A follower run forward and then backward over that path: a critically damped
// spring, so the two passes cancel each other's lag, with hard limits on speed by height, acceleration, view turn,
// turn acceleration and zoom. (3) camAt reads the result from a table (built once, a pure function of the keys).
const CAM_DT = 1 / 48, CAM_T1 = 268.99;
const qOf = (t, x, y, z) => [x - carX(Math.min(t, 238)), y, z]; // world to the path frame
const unwrap = (a, ref) => a - TAU * Math.round((a - ref) / TAU);
// a key in the path frame: { t, q: [x, y, z], p, yw, lf, w } (w: a world key, flown straight rather than round the car)
const keyRel = (t, F) => ({ t, q: [F[0], F[1], F[2]], p: F[3], yw: F[5] || 0, lf: Math.log(F[4]), w: false });
const keyWorld = (k) => ({ t: k[0], q: qOf(k[0], k[1], k[2], k[3]), p: k[4], yw: k[6] || 0, lf: Math.log(k[5]), w: true });
// A cubic through the keys, C1, with a slope limiter so it never overshoots a key. Two keys both 2.5 m or more from the
// car (and not world keys) are flown in cylinder coordinates round it, so the drone swings round the table rather than
// cutting across it; anything nearer, or in a window, is flown in straight metres (draft 10's hole keys flipped the
// cylinder angle and swung the drone half round the car). m0 / m1: optional end slopes in metres (hand-offs that move).
function pathOf(keys, m0, m1) {
  const n = keys.length; let ref = keys[0].yw; for (const k of keys) { k.yw = unwrap(k.yw, ref); ref = k.yw; }
  const far = (k) => !k.w && Math.hypot(k.q[0], k.q[2]) >= 2.5;
  const vals = (k, cyl) => cyl ? [Math.hypot(k.q[0], k.q[2]), k.q[1], Math.atan2(k.q[2], k.q[0]), k.p, k.yw, k.lf] : [k.q[0], k.q[1], k.q[2], k.p, k.yw, k.lf];
  const slope = (ya, yb, yc, ta, tb, tc) => { const dl = (yb - ya) / (tb - ta || 1), dr = (yc - yb) / (tc - tb || 1); if (dl * dr <= 0) return 0;
    const v = (yc - ya) / (tc - ta), lim = 3 * Math.min(Math.abs(dl), Math.abs(dr)); return Math.sign(v) * Math.min(Math.abs(v), lim); };
  const segs = [];
  for (let i = 0; i < n - 1; i++) {
    const cyl = far(keys[i]) && far(keys[i + 1]), ix = [Math.max(0, i - 1), i, i + 1, Math.min(n - 1, i + 2)], V = ix.map((j) => vals(keys[j], cyl)), T = ix.map((j) => keys[j].t);
    if (cyl) { V[0][2] = unwrap(V[0][2], V[1][2]); V[2][2] = unwrap(V[2][2], V[1][2]); V[3][2] = unwrap(V[3][2], V[2][2]); }
    const s0 = [], s1 = [];
    for (let c = 0; c < 6; c++) {
      s0.push(i === 0 ? (m0 && !cyl && c < 3 ? m0[c] : 0) : slope(V[0][c], V[1][c], V[2][c], T[0], T[1], T[2]));
      s1.push(i === n - 2 ? (m1 && !cyl && c < 3 ? m1[c] : 0) : slope(V[1][c], V[2][c], V[3][c], T[1], T[2], T[3])); }
    segs.push({ t0: T[1], t1: T[2], cyl, a: V[1], b: V[2], s0, s1 });
  }
  return (t) => { t = clamp(t, keys[0].t, keys[n - 1].t); let lo = 0, hi = segs.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (segs[mid].t0 <= t) lo = mid; else hi = mid - 1; }
    const S = segs[lo], h = S.t1 - S.t0, s = (t - S.t0) / h, s2 = s * s, s3 = s2 * s, A = 2 * s3 - 3 * s2 + 1, B = s3 - 2 * s2 + s, C2 = -2 * s3 + 3 * s2, D = s3 - s2;
    const o = []; for (let c = 0; c < 6; c++) o.push(A * S.a[c] + B * h * S.s0[c] + C2 * S.b[c] + D * h * S.s1[c]);
    return S.cyl ? [o[0] * Math.cos(o[2]), o[1], o[0] * Math.sin(o[2]), o[3], o[4], o[5]] : o; };
}
// the composite keys before the aerial: KEYS outside the windows, each window's own keys inside it
function camKeys1() { const out = []; for (const [t, F] of KEYS) if (!WIN_DEF.some((w) => t >= w.a && t <= w.b)) out.push(keyRel(t, F));
  for (const w of WIN_DEF) for (const k of w.keys) out.push(keyWorld(k)); return out.sort((a, b) => a.t - b.t); }
// where the golden wide leaves the drone at 201: camera-end.js starts the aerial from here
function goldEnd() { const k = WIN_DEF[WIN_DEF.length - 1].keys.slice(-1)[0]; return { x: k[1], y: k[2], z: k[3], p: k[4], yaw: k[6] || 0, f: k[5] }; }
// the limits (AUDIT-d10.md), held a little inside the check's numbers to leave room for the hover and the bob
// speed by height ramps up just above each of the check's steps (3 / 5 / 10 / 18 m/s at 2 / 5 / 15 m), where the
// higher acceleration limit already applies, so a drone coming down slows before it reaches the slower band
const camVmax = (h) => h < 2 ? 2.7 : h < 3.2 ? lerp(2.7, 4.6, smooth((h - 2) / 1.2)) : h < 5 ? 4.6 : h < 8 ? lerp(4.6, 9.3, smooth((h - 5) / 3)) : h < 15 ? 9.3 : h < 19 ? lerp(9.3, 17, smooth((h - 15) / 4)) : h < 40 ? 17 : h < 50 ? lerp(17, 17 * 1.25 ** 1.6, smooth((h - 40) / 10)) : 17 * (h / 40) ** 1.6;
const camAmax = (h) => h < 5.05 ? 2.2 : h < 40 ? 4.8 : 4.8 * (h / 40) ** 1.6;
const CAM_W = 28 * Math.PI / 180, CAM_WCUE = 10 * Math.PI / 180, CAM_WA = 50 * Math.PI / 180, CAM_Z = .21, CAM_ZA = .6;
const CAM_PIN = [[16.3, 18.6], [39.3, 44.3], [147.4, 153.1]]; // draft 12: protected spans flown on draft 10's own poses, the follower held to them
function camLimits(t, h, cues) {
  let v = camVmax(h), a = camAmax(h), w = CAM_W, pin = 0;
  for (const [pa, pb] of CAM_PIN) if (t > pa - .3 && t < pb + .3) { const k = clamp(Math.min((t - pa + .3) / .3, (pb + .3 - t) / .3)); v = Math.exp(lerp(Math.log(v), Math.log(1e4), k)); a = Math.exp(lerp(Math.log(a), Math.log(1e4), k)); w = lerp(w, 20, k); pin = Math.max(pin, k); }
  if (t < 17) { const k = clamp((17 - t) / 1.2); v = Math.exp(lerp(Math.log(v), Math.log(1e4), k)); a = Math.exp(lerp(Math.log(a), Math.log(1e4), k)); } // the protected intro glide (CAM_EXEMPT), easing into the limits by 17
  if (t > AIR.t0 && t < AIR.hold + .3) { const k = clamp(Math.min((t - AIR.t0) / .3, (AIR.hold + .3 - t) / .3)); v = Math.exp(lerp(Math.log(v), Math.log(1e4), k)); a = Math.exp(lerp(Math.log(a), Math.log(1e4), k)); } // the protected climb and map (camera-end.js)
  if (!pin) for (const c of cues) { if (t < c - .7 || t > c + 1.1) continue; // near a cue word the view holds still: under 10 deg/s from .45 s before to .55 s after
    const k = clamp(Math.min((t - (c - .65)) / .22, ((c + 1.0) - t) / .45)); w = Math.min(w, lerp(CAM_W, CAM_WCUE, k)); }
  return { v, a, w, wa: Math.exp(lerp(Math.log(CAM_WA), Math.log(200), pin)) }; }
// One pass of the follower over src (N rows of [x, y, z, pitch, yaw, ln f]) in the direction dir; returns the new rows.
// Each channel group is a two-stage follower: the velocity it asks for is the path's own velocity plus a pull toward
// the path (never more than it can brake from in time), capped by the speed limit; the drone then eases toward that
// velocity at no more than the acceleration limit. Run forward and then backward, the lags cancel.
function camPass(src, dir, cues) {
  const N = src.length / 6, out = new Float64Array(src.length), dt = CAM_DT, KP = 2.6, KV = 5, KA = 2.6, KAV = 5, KZ = 2.4;
  const i0 = dir > 0 ? 0 : N - 1, st = Array.from(src.subarray(i0 * 6, i0 * 6 + 6)), vel = [0, 0, 0, 0, 0, 0];
  const at = (i, c) => src[clamp(i, 0, N - 1) * 6 + c], dv = (i, c) => (c === 4 ? unwrap(at(i + dir, c), at(i, c)) - at(i, c) : at(i + dir, c) - at(i, c)) / dt; // the path's own velocity (in pass time)
  for (let c = 0; c < 6; c++) vel[c] = dv(i0, c);
  const lim2 = (a, v, at2, an) => { const sp = Math.hypot(...v); // clamp an acceleration: along the motion to at2, across it to an
    if (sp < 1e-6) { const m = Math.hypot(...a); if (m > at2) for (let j = 0; j < a.length; j++) a[j] *= at2 / m; return; }
    let ta = 0; for (let j = 0; j < a.length; j++) ta += a[j] * v[j] / sp; const nv = a.map((x, j) => x - ta * v[j] / sp), nm = Math.hypot(...nv);
    const tc = clamp(ta, -at2, at2), ks = nm > an ? an / nm : 1; for (let j = 0; j < a.length; j++) a[j] = tc * v[j] / sp + nv[j] * ks; };
  const cmd = (vt, err, kp, vmax, amax) => { const e = Math.hypot(...err), pull = Math.min(kp * e, Math.sqrt(2 * amax * .8 * e)), vc = vt.map((x, j) => x + (e > 1e-9 ? err[j] / e * pull : 0)), m = Math.hypot(...vc);
    return m > vmax ? vc.map((x) => x * vmax / m) : vc; };
  for (let k = 1; k < N; k++) {
    const i = dir > 0 ? k : N - 1 - k, ip = i - dir, t = i * dt, r = i * 6, L = camLimits(t, Math.max(st[1], src[r + 1]), cues);
    // position
    { const vt = [0, 1, 2].map((c) => dv(ip, c)), err = [0, 1, 2].map((c) => src[r + c] - st[c]), vc = cmd(vt, err, KP, L.v, L.a);
      // draft 12: never faster up or down than the drone can brake from before the path's lowest (highest) point in the
      // next 2 s, at the acceleration allowed down there (a fast descent into the slow low band dived into the ground)
      { let lo = Infinity, hi = -Infinity; for (let j = 0; j <= 96; j += 4) { const y = src[clamp(i + dir * j, 0, N - 1) * 6 + 1]; lo = Math.min(lo, y); hi = Math.max(hi, y); }
        const dn = Math.sqrt(2 * camAmax(lo) * .7 * Math.max(0, st[1] - lo) + .04), up = Math.sqrt(2 * camAmax(st[1]) * .7 * Math.max(0, hi - st[1]) + .04);
        if (hi < 30) { if (vc[1] < -dn) vc[1] = -dn; if (vc[1] > up) vc[1] = up; }
        // draft 16: and brake before the table floor under where the drone is now, so it never sinks under it
        const fl = src[r + 1] > 30 ? 0 : tableFloor(t, st[0] + carX(Math.min(t, 238)), st[2]) + .1, df = Math.sqrt(2 * camAmax(st[1]) * .5 * Math.max(0, st[1] - fl));
        if (fl && st[1] - fl < 1.5 && vc[1] < -df) vc[1] = -df; }
      const ac = [0, 1, 2].map((c) => (vc[c] - vel[c]) * KV); lim2(ac, [vel[0], vel[1], vel[2]], L.a, 3 * L.a);
      for (let c = 0; c < 3; c++) { vel[c] += ac[c] * dt; st[c] += vel[c] * dt; } }
    // the look direction: pitch and yaw, measured as view turn (yaw counts by cos(pitch))
    { const cp = Math.max(.08, Math.cos(st[3])), vt = [dv(ip, 3), cp * dv(ip, 4)], err = [src[r + 3] - st[3], cp * (unwrap(src[r + 4], st[4]) - st[4])], vc = cmd(vt, err, KA, L.w, L.wa);
      const vv = [vel[3], cp * vel[4]], ac = [(vc[0] - vv[0]) * KAV, (vc[1] - vv[1]) * KAV]; lim2(ac, vv, L.wa, 3 * L.wa);
      vv[0] += ac[0] * dt; vv[1] += ac[1] * dt; const wm = Math.hypot(vv[0], vv[1]); if (wm > L.w * 1.02) { vv[0] *= L.w * 1.02 / wm; vv[1] *= L.w * 1.02 / wm; }
      vel[3] = vv[0]; vel[4] = clamp(vv[1] / cp, -.9, .9); st[3] = Math.min(st[3] + vel[3] * dt, 1.565); st[4] += vel[4] * dt; }
    // zoom
    { const vc = clamp(dv(ip, 5) + clamp(KZ * (src[r + 5] - st[5]), -Math.sqrt(2 * CAM_ZA * .8 * Math.abs(src[r + 5] - st[5])), Math.sqrt(2 * CAM_ZA * .8 * Math.abs(src[r + 5] - st[5]))), -CAM_Z, CAM_Z);
      vel[5] += clamp((vc - vel[5]) * 5, -CAM_ZA, CAM_ZA) * dt; st[5] += vel[5] * dt; }
    st[1] = Math.max(st[1], .12); if (st[1] === .12 && vel[1] * dir < 0) vel[1] = 0; // never under the playa
    // high in the aerial (camEnd's own log-scale flight) the drone is the path: the follower only shapes the low ends
    // draft 18: the Temple run (camEnd's own quintic flight) is flown exactly; the follower dragged its fast rise back into the golden wide
    const ti = i * CAM_DT, hi = ti > AIR.t0 && ti < AIR.top ? 1 : smooth((src[r + 1] - 30) / 25); if (hi > 0) for (let c = 0; c < 6; c++) { const tv = c === 4 ? unwrap(src[r + c], st[c]) : src[r + c]; st[c] = lerp(st[c], tv, hi); vel[c] = lerp(vel[c], dv(i, c), hi); }
    for (let c = 0; c < 6; c++) out[i * 6 + c] = st[c];
  }
  for (let c = 0; c < 6; c++) out[i0 * 6 + c] = src[i0 * 6 + c];
  return out;
}
// draft 16: the lowest the drone may fly at world (X, Z) at song time t, so the table's underside never shows and the
// props on its top are never seen from below: TOP + .35 within 5.9 m of the car's centre (the table's corners are 4.65 m
// out, so this covers it at any turn), easing to TOP + .12 by 8.3 m and on out to 45 m; 0 inside the driver's hole.
function tableFloor(t, X, Z) { const r = Math.hypot(X - carX(t), Z - carZ(t)); if (r > 45) return 0; // round the car's centre, so the table's turns never move it
  return (TOP + .12 + .23 * (1 - smooth((r - 5.9) / 2.4))) * smooth((r - .75) / .3); }
// a key below the floor is lifted onto it, still looking at the point it aimed at (at the car's distance)
function liftKey(k) { const X = k.q[0] + carX(Math.min(k.t, 238)), fl = tableFloor(k.t, X, k.q[2]) + .22; if (k.q[1] >= fl) return k;
  const D = Math.max(2, Math.hypot(X - carX(k.t), k.q[2] - carZ(k.t))), ty = k.q[1] - D * Math.tan(k.p);
  k.q[1] = fl; k.p = Math.atan2(fl - ty, D); return k; }
let CAM_TAB = null;
function camBuild() {
  const e0 = camEnd(AIR.t1 - .001), e1 = camEnd(AIR.t1 - .021), q0 = qOf(AIR.t1, e0.x, e0.y, e0.z), q1 = qOf(AIR.t1 - .02, e1.x, e1.y, e1.z); // the aerial's velocity at the hand-over
  const P1 = pathOf(camKeys1().map(liftKey)), P3 = pathOf(END_KEYS.map((k) => liftKey(keyWorld(k))), q0.map((v, j) => (v - q1[j]) / .02));
  const N = Math.ceil(CAM_T1 / CAM_DT) + 2, src = new Float64Array(N * 6);
  let ywRef = 0;
  for (let i = 0; i < N; i++) { const t = i * CAM_DT; let row;
    const e = (t > AIR.t0 && t < AIR.t1) ? camEnd(t) : null;
    if (e) row = [...qOf(t, e.x, e.y, e.z), e.p, e.yaw, Math.log(e.f)]; else row = t <= AIR.t0 ? P1(t) : P3(t);
    row[4] = unwrap(row[4], ywRef); ywRef = row[4];
    // draft 16 (Robin, 0:57 and 1:50): never below the table top anywhere it can be seen. Draft 14's floor was a box in
    // world axes (it missed the table's corners while it turns on "spin"), only near the car, and the follower and the
    // hover could still drop under it; now tableFloor (below) is round, so it covers every turn, and camAt applies it
    // again after the hover. The driver's hole shots are the only exception.
    if (!e) { const X = row[0] + carX(Math.min(t, 238)), fl = tableFloor(t, X, row[2]) + .15 * (tableFloor(t, X, row[2]) > 1); if (row[1] < fl) row[1] = fl; }
    for (let c = 0; c < 6; c++) src[i * 6 + c] = row[c]; }
  const cues = typeof CUE_TARGETS !== 'undefined' ? CUE_TARGETS.map((q) => q.t) : [];
  CAM_TAB = { N, src, out: camPass(camPass(src, 1, cues), -1, cues) };
}
// the flown pose at t (no hover): [x, y, z, pitch, yaw, f] in world metres, read from the table with a Catmull-Rom
function camPath(t, which) { if (!CAM_TAB) camBuild(); const T = which === 'target' ? CAM_TAB.src : CAM_TAB.out, N = CAM_TAB.N;
  const u = clamp(t, 0, CAM_T1) / CAM_DT, i = Math.min(Math.floor(u), N - 2), s = u - i, at = (j, c) => T[clamp(j, 0, N - 1) * 6 + c];
  const o = []; for (let c = 0; c < 6; c++) { const p0 = at(i - 1, c), p1 = at(i, c), p2 = at(i + 1, c), p3 = at(i + 2, c);
    o.push(p1 + .5 * s * (p2 - p0 + s * (2 * p0 - 5 * p1 + 4 * p2 - p3 + s * (3 * (p1 - p2) + p3 - p0)))); }
  return [o[0] + carX(Math.min(t, 238)), o[1], o[2], o[3], o[4], Math.exp(o[5])]; }
// the hover: slow sums of sines, never jitter (periods 5 to 20 s)
const hov = (t, s) => .6 * Math.sin(t * (.31 + .07 * s) + s * 1.7) + .4 * Math.sin(t * (.53 + .05 * s) + s * 2.9);
// the drone's own bob on top of the slow hover: a few centimetres at 1.5 to 3 s periods, so a held framing still breathes
const bob = (t, s) => .55 * Math.sin(t * (2.3 + .17 * s) + s * 2.1) + .45 * Math.sin(t * (3.7 + .11 * s) + s * .7);
// draft 9: the roll channel (the "perverse" roll, rendered as a post pass in render.js): radians, 0 = level
function camRoll(t) { const a = wt(29, 'perverse'), b = wt(30, 'rehearsed'); if (t < a - .3 || t > b) return 0;
  return Math.PI * (smooth((t - a + .3) / 1.2) - smooth((t - b + 1.3) / 1.2)); }

function camAt(t, bare) { // bare: without the hover (scene placement reads this, and the motion check)
  const [x0, y0, z, p0, yw, f] = camPath(t);
  // the old hand-held wobble (a quarter metre over half a minute), everywhere the drone is more than a metre from the car top
  const near = clamp((Math.hypot(x0 - carX(Math.min(t, 238)), y0 - TOP, z - carZ(t)) - .5) / .7), x = x0 + .25 * Math.sin(t * .23) * near, y = y0 + .05 * Math.sin(t * .31) * near;
  let c = { x, y, z, p: p0, f, yaw: yw };
  // the hover, everywhere: up to half a metre of drift (scaled with the distance to the car), a little float in the aim, the lens breathing
  const dist = Math.hypot(c.x - carX(t), c.y - 1, c.z - carZ(t)), nr = clamp((Math.hypot(c.x - carX(t), c.y - TOP, c.z - carZ(t)) - .5) / .7), A = bare ? 0 : clamp(.05 * dist, .04, .45) * nr;
  const clip = Math.hypot(c.x - carX(t), c.z - carZ(t)) < .6 && c.y < TOP + .6; // inside the driver's hole: clip near polygons
  const hx = A * hov(t, 1), hy = A * .6 * hov(t, 2), hz = A * hov(t, 3), ha = dist > 400 ? .3 : 1;
  const gu = t - (typeof gavelT === 'function' ? gavelT() : L_(34).e - .5), sh = gu >= 0 && gu < .4 ? (1 - gu / .4) ** 2 : 0; // the giant gavel's impact shakes the drone
  const hb = bare ? 0 : 1, yaw = c.yaw + .012 * ha * hb * hov(t, 4), p = Math.min(c.p + .008 * ha * hb * hov(t, 5), 1.565), f2 = c.f * (1 + .018 * hb * hov(t, 6));
  const bb = bare ? 0 : clamp(.008 * dist, .02, .05) * nr; // the bob, scaled like the hover but smaller (draft 12: half, it shook the speed limits)
  c = Object.assign({}, c, { x: c.x + bb * bob(t, 7), y: c.y + bb * .8 * bob(t, 8), z: c.z + bb * bob(t, 9) });
  // draft 12: the jolt is a quick roll of the frame now (render.js rollFrame); moving the drone 5 cm at 9 Hz broke every acceleration limit
  // draft 16: the floor again after the follower and the hover (a soft max, so it never kinks)
  const fx = c.x + hx, fz = c.z + hz, fl = t > AIR.t0 && t < AIR.t1 ? 0 : tableFloor(t, fx, fz), fy0 = c.y + hy, fy = fl ? (fy0 + fl + Math.sqrt((fy0 - fl) ** 2 + .01)) / 2 : fy0;
  return { x: fx, y: fy, z: fz, p, f: f2, yaw, cy: Math.cos(yaw), sy: Math.sin(yaw), clip, roll: camRoll(t) + .012 * sh * Math.sin(gu * 48) };
}
// the protected intro glide flies 450 m from the sunrise camp to the car in 17 s (AUDIT-d10 "do not touch"): no speed or
// acceleration limit there (tools/check-camera.mjs reads this)
const CAM_EXEMPT = [[0, 18.6, 'SPEED,ACCEL', 'the protected intro glide into the gavel ("law"): draft 10 flown exactly'],
  [39.3, 44.3, 'SPEED,ACCEL,TURNACC', 'the protected blind, padlock and press (39.6-44.2): draft 10 flown exactly'],
  [147.4, 153.1, 'SPEED,ACCEL,TURN,TURNACC', 'the book, the chess top-down and "foul" (protected): draft 10 flown exactly']];
// ---------- draft 12: what each sung cue word looks at ----------
// One entry per cue word the draft-10 audit names: the word's start (song s) and the world point of the thing that acts
// it, so tools/check-camera.mjs can hold the drone to it: on screen, 8% clear of the edges, from .5 s before to .5 s
// after, with the view turning under 12 deg/s. camLimits (above) holds the turn under 10 deg/s round each of these.
// at(t) runs with C, CX, CZ, YAW set for t, so Lw(car-local) follows the table; W(...) is a world point.
const cueAt = (li, w, at) => ({ t: wt(li, w), w, at });
const cueLw = (x, y, z) => () => Lw(x, y, z), cueW = (X, Y, Z) => () => [X, Y, Z];
const cueHead = (i, dy = 0) => (t) => { const h = typeof suitHeadLocal === 'function' ? suitHeadLocal(i, t) : [-5.15, 1.42, 0]; return Lw(h[0], h[1] + dy, h[2]); };
const cueRap = (t) => Lw(RAP_AT.lx, RAP_AT.head, RAP_AT.lz); // draft 13: the diva's head (the rap's main subject)
const cuePoor = (t) => [carX(Math.min(t, wt(18, 'unfair') + .15)) + 6.15, 1.4, -3.0]; // playa.js bmPoorInto: she walks with the table, then stops
const cueFar = (li, w, D = 300) => { let p = null; return () => p || (p = (() => { const c = camAt(wt(li, w), true); return [c.x + Math.sin(c.yaw) * D, 4, c.z + Math.cos(c.yaw) * D]; })()); }; // a horizon-wide drape
const CUE_TARGETS = [
  cueAt(0, 'law', () => { const a = typeof LAW_AT === 'function' ? LAW_AT() : [-3.9, -.6]; return Lw(a[0], TOP + .11, a[1]); }), // the gavel head on the table
  cueAt(1, 'scientists', cueLw(0, 2.0, 10.5)),                 // the Instrument People beyond the far row
  cueAt(1, "can't", cueLw(1.0, 1.45, -.75)),                    // draft 16: the puff of smoke off the speakerphone
  cueAt(2, 'gag', () => { const q = typeof gagWhere === 'function' ? gagWhere() : { X: 0, Z: 0 }; return [q.X, 5.6, q.Z]; }), // the 12 m lips on their pole
  cueAt(2, 'every', cueLw(-.81, 1.27, .9)),                    // the tape recorders lifting on their wires
  cueAt(3, 'control', cueLw(0, 1.6, 0)),                       // (nothing acts it) the board
  cueAt(3, 'blues', cueLw(0, 1.6, 0)),                         // the blind drops over the board (screen space)
  cueAt(4, 'restrict', cueW(26.45, 4.7, 24)),                  // the padlock on the ear's hasp
  cueAt(4, 'news', cueLw(-1.25, 1.9, -1.0)),                   // the press
  cueAt(5, 'shamelessly', cueLw(-.15, 1.1, 2.3)),              // the prize rosettes on the far row
  cueAt(5, 'grin', cueLw(-.15, 1.42, 2.3)),                    // the grins
  cueAt(6, 'facts', cueLw(3.2, 2.15, .25)),                    // the chart slides off the whiteboard
  cueAt(6, 'spin', cueLw(3.2, 2.15, .25)),                     // the whiteboard turns twice
  cueAt(7, 'crime', cueLw(2.83, 2.15, .25)),                   // chart bars to cell bars
  cueAt(7, 'right', cueLw(3.2, 2.15, .25)),                    // barbed wire
  cueAt(8, 'soundbite', cueLw(1.2, TOP + .1, -1.05)),          // the teeth hop out of the speakerphone
  cueAt(9, 'unveiled', cueLw(-1.0, 1.45, .8)),                 // the drape lifts off the jail model
  cueAt(9, 'build', cueW(103.7, 3.0, 25.3)),                   // the build crew's scissor lift
  cueAt(9, 'jails', cueW(110.9, 8.6, 15.2)),                   // the stilt cells rise behind the car
  cueAt(10, 'control', cueLw(-5.15, 1.42, 0)),                 // (nothing acts it) the chairman's egg, end-on
  cueAt(10, 'blues', cueLw(1.7, 2.0, 10.5)),                   // the blinds; the radio head's slats
  cueAt(11, 'restrict', cueLw(-1.25, 1.9, -1.0)),              // the press lid
  cueAt(11, 'news', cueLw(-1.25, 1.9, -1.0)),                  // the press, the camera head under it
  cueAt(12, 'shamelessly', cueLw(-.15, 1.42, 2.3)),            // (nothing acts it) the far row
  cueAt(12, 'grin', cueLw(-.15, 1.42, 2.3)),                   // every lid flips
  cueAt(13, 'facts', cueLw(2.85, 2.19, .22)),                  // the cell bars pop off the board
  cueAt(13, 'spin', cueLw(0, 1.2, 0)),                         // the table turns
  cueAt(14, 'vogue', cueRap),                                  // draft 13: the diva opens the rap
  cueAt(15, 'time', cueRap),                                   // draft 13: on her (the clock car is no longer visited)
  cueAt(15, 'dime', cueLw(-1.55, 1.45, -.75)),                 // the dime flips
  cueAt(17, 'poor', cuePoor),                                  // the poor person with the bowl
  cueAt(17, 'share', cuePoor),
  cueAt(18, 'unfair', cueRap),                                 // draft 13: back on the diva
  cueAt(19, 'vogue', cueRap),                                  // draft 13: the diva, close
  cueAt(19, 'truth', cueRap),
  cueAt(21, 'wars', cueRap),                                   // draft 13: the dome window is cut; on the diva
  cueAt(22, 'limit', cueRap),
  cueAt(23, 'pie', cueRap),
  cueAt(24, 'little', cueLw(0, 1.3, 0)),                       // Little Bob up through the hole
  cueAt(25, 'mystery', cueHead(12)),                           // the noir book as the chairman's mask
  cueAt(25, 'look', cueHead(12)),
  cueAt(26, 'knight', cueLw(-.4, TOP + .3, 0)),                // the chess top-down
  cueAt(27, 'foul', cueW(206.5, 3, 22.3)),                     // the giant knight kicks the rook
  cueAt(28, 'cop', cueLw(0, 1.9, 7.3)),                        // the paid cops behind the table
  cueAt(28, 'paid', cueLw(0, 2.99, 7.3)),
  cueAt(29, 'perverse', cueLw(0, 1.0, 0)),                     // the board flips on its seats
  cueAt(30, 'rehearsed', cueLw(-.15, 1.42, -2.3)),             // the row nods as one
  cueAt(31, 'control', (t) => { const m = typeof mariState === 'function' ? mariState(t) : null; return Lw(0, m ? m.y : 9.5, 0); }), // the marionette bar
  cueAt(31, 'blues', cueFar(31, 'blues')),                     // the red drape over the horizon
  cueAt(32, 'restrict', cueW(246.42, 3.7, 14)),                // (the big press rises at 176.7)
  cueAt(32, 'news', cueW(246.42, 3.7, 14)),                    // the big press with its chain and padlock
  cueAt(33, 'shamelessly', cueLw(-.15, 1.42, 2.3)),
  cueAt(33, 'grin', cueLw(-.15, 1.55, 2.3)),                   // the lids open, the teeth climb out
  cueAt(34, 'facts', cueLw(.5, 1.8, 2.3)),                     // the stolen heads become crowns
  cueAt(34, 'spin', cueLw(0, 1.2, 0)),                         // the table's full turn from 30 m
  { t: 215.99, w: 'arms up', at: cueW(300, 19.7, 45) },        // the burning Man's arms go up
  cueAt(35, 'vote', cueW(284.8, 1.4, 0)),                      // vote 1: the ballots onto the stack
  cueAt(35, 'joke', cueW(284.65, 1.72, 2.3)),                  // the dunce caps
  cueAt(36, 'vote', cueW(284.8, 1.9, 0)),                      // vote 2: hands up
  cueAt(36, 'broke', cueW(277.3, .6, 6.46)),                   // broke 2: the poor woman's bowl
  cueAt(37, 'vote', cueLw(0, 2.4, 0)),                         // vote 3: standing on the chairs
  cueAt(37, 'broke', cueW(300, 1.85, 12)),                     // broke 3: the ballot grin from 26 m
  cueAt(38, 'vote', cueLw(0, 2.6, 0)),                         // vote 4: up on the soft table
  cueAt(38, 'broke', cueW(300, 14, 45)),                       // broke 4: the Man breaks
];
