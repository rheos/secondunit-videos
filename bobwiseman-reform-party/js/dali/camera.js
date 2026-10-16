// Reform Party, Dali look: the shot list. Each entry moves the camera there, then holds.
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

// ---------- camera: shots as offsets from the car; each entry moves there over dur, then holds ----------
// [t, dur, ox, oy, oz, pitch, f, yaw?]. Pitch > 0 looks down. When both ends of a move carry a yaw, the camera
// swings round the car (polar) instead of sliding in a straight line, so orbits stay orbits.
// orb(): a framing on a circle round the car, aimed at its centre (plus a turn `aim`, to set the car on a third).
const orb = (deg, R, y, pitch, f, aim = 0) => { const a = deg * Math.PI / 180, ox = R * Math.cos(a), oz = R * Math.sin(a); return [ox, y, oz, pitch, f, Math.atan2(-ox, -oz) + aim]; };
// draft-2 framings kept for the protected moments
const SPK = [1.2, 2.75, -3.3, .62, 1400], DRW = [-.8, 1.8, -1.6, .1, 1500], HEADS = [-.8, 1.95, -.4, .12, 1150];
const WB = [3.2, 2.1, -1.6, 0, 1400], WBM = [2.6, 2.1, -4.2, .04, 1350], TCLOSE = [1.2, 2.0, -4.0, .25, 1400];
const HOLE = [-.12, 2.05, -4.2, .13, 1500], TOPDOWN = [0, 8.5, -3.2, 1.15, 1250];
const PIE = [-.15, 2.9, -3.4, .55, 1400], BOOK = [-1.5, 2.7, -3.1, .6, 1400];
// draft 3 framings
const PUSH0 = [4, 1.4, -150, -.015, 1700], PUSH1 = [4, 1.5, -16, .03, 1250];       // intro: the car grows out of the horizon
const GAVEL = [-7.6, 1.2, -2.5, .03, 1200, .82];                                   // "law": low three-quarter on the chairman
const HTOP = [0, 3.9, -.3, 1.45, 1100], HIN = [0, 1.75, -.06, 1.5, 1300];          // over the hat hole, then into the hat
const SKY1 = [-3.6, 1.3, -14, -.34, 1100];                                         // refrain 1 blues: low, the sky over the car
const WBF = [3.2, 2.15, -.95, 0, 1350];                                            // into the whiteboard (fills the frame)
const NEWS1 = [-1.4, 2.8, -6.8, .22, 1200];                                        // papers come down on the table
const SPIN1 = orb(-112, 11, 6.2, .5, 1150, .26), SPIN1C = [-2.2, 1.15, -6, .02, 1000]; // refrain 1 spin: high 3/4, then low cut-in
const TR1A = orb(-140, 7.5, .5, -.03, 950, .2), TR1B = orb(-100, 5.6, .45, -.05, 900, .12), TR1C = orb(-50, 7, .6, -.03, 950, -.2); // instrumental 1 tracking
const WBF2 = [3.2, 2.1, -.9, 0, 1400];                                             // push into the cell bars
const JAILM = [-.9, 1.32, -2.05, -.06, 820];                                       // "unveiled": table-top level on the jail model
const JAILW = [4, .4, -13, -.14, 1600];                                            // "jails": worm's-eye, cells rise behind
const WORME = orb(-170, 7.4, .3, -.36, 820, .15);                                 // refrain 2 blues: low, end-on, the chairman looms
const NEWS2 = [-1.2, .4, -5.2, -.34, 900];                                        // refrain 2 news: inside the ring, the drawer row
const HEADS2 = [-.8, 1.8, -.6, .08, 1250];                                         // grin 2: a touch lower and closer
const SPIN2A = [-1.2, .35, -5.4, -.2, 820], SPIN2B = orb(-160, 8, .4, -.2, 880, .1); // refrain 2 spin: worm's-eye, suits whip overhead
const TR2A = orb(-25, 10, .45, -.03, 950, .3), TR2B = orb(-55, 6.4, .5, -.05, 900, .15); // instrumental 2: the car comes at us
const VOGUE = [-.3, 2.5, -1.6, .22, 900];                                          // vogue: over the near row onto the poses
const DIME = [-1.6, 2.5, -3.4, .55, 1400];
const POOR = [5.5, 1.5, -12.5, .04, 1150], POOR2 = [1.5, 1.5, -12, .04, 1150];      // the poor person on foot, the table rolls past
const ORBA1 = orb(-122, 9.5, 8, .72, 1100, .14), ORBA2 = orb(-62, 9.5, 8, .72, 1100, .14);    // bridge signature: the overhead orbit
const MICS = [-4.5, 2.0, -6, .05, 1000];
const TOPY = [...TOPDOWN, 0], ORBB = orb(-60, 3.4, 6.8, 1.1, 1250), ORBC = orb(-30, 4.4, 7.4, 1.0, 1200); // the chess board turns
const CHESSW = [1, 3, -8.5, .02, 1250];                                         // the giant chess pieces 20-30 m behind the car
const COPS = [1, 4.6, -26, .1, 2300];                                              // long lens: the table and the paid cops behind
const PERV1 = orb(-120, 8.5, 6.8, .62, 1100), PERV2 = orb(-75, 7.2, 4.2, .42, 1150); // "perverse": the orbit comes down onto the car
const POVB = [0, TOP + .14, .05, -.45, 760], POVN = [0, TOP + .2, .05, -.12, 820];   // refrain 3: from the driver's hole, looking up
const HEADS3 = [-.8, 1.9, -.35, .1, 1300];
const POVS = [0, TOP + .16, .05, -.22, 700, 0], POVS2 = [0, TOP + .16, .05, -.3, 760, .5]; // spin 3: the board whirls round the hole
const GBIG = [0, 6.0, -10, .44, 1150];                                           // the giant gavel lands on the table

// Where things are in frame (for the other builders; local = table coords, x along the table, z toward the far row):
//  17-20.4 GAVEL: chairman (local x -5.15) on the left third, table receding right. 22.2 the hat fills the frame.
//  40.4-41 the whiteboard fills the frame. 41-45 NEWS1: front edge of the table across the lower half.
//  59-72 tracking, low (0.5 m) and close, swinging from behind-left to front-right; the near row is 3-6 m away.
//  79.6-84.4 TCLOSE (draft 2's low table close-up): speakerphone centre, whiteboard on the right edge.
//  79.6-86.2 TCLOSE holds (the draped model sits left of centre); 86.2-89.5 JAILM: table-top level, the jail model (local x -1.8..0) fills the middle. 89.5-93.6 JAILW: long lens
//  from low in front; frame covers about local x -9..+17 at 30-50 m behind the car (cells closer than 25 m read bigger).
//  93.5-98 WORME: end-on worm's-eye from beyond the left end. 98-102.6 NEWS2: worm's-eye from the front, near row looms.
//  108.5-116.8 spin 2 worm's-eye. 117-121.7 the car comes at a low camera from front-right.
//  128.4-133.9 POOR: the poor person at about 7 m right of the car, 5.5 m in front of it, on the right third.
//  133.9-137.3 and 150.5-152.2, 154-155.6 and 160.4-163.9: the bridge's high orbit (horizon above frame).
//  152.2-154 CHESSW: low front, the giant pieces about 22-32 m behind the car in the middle of the frame.
//  155.6-160.4 COPS: long lens from 26 m, table in the lower middle, the playa 16-20 m behind it in the upper half.
//  169.6-175.8, 175.8-180, 185.2-192.3: POV from the driver's hole at table-top height (near polygons are clipped).
//  192.3-196 GBIG: high three-quarter, table in the middle half; the gavel should land at local x 0 to read big.
const SH = [
  [0, 0, ...PUSH0],
  [0, 16.7, ...PUSH1],                     // one slow push: the car from the horizon to mid-frame
  [16.7, 1.0, ...GAVEL],                   // ...and the push carries on into the chairman's gavel ("law" 17.97)
  [20.5, 1.0, ...HTOP],                    // 0:21 match: rise over the table, the hat hole below
  [21.5, .7, ...HIN],                      // drop into the hat (it fills the frame)
  [22.2, 1.3, ...SPK],                     // pull up out of it onto the speakerphone (tape X on "can't")
  [L_(2).s - .6, .9, ...DRW],              // gag, the ear
  [L_(3).s - .4, 1.2, ...SKY1],            // control the blues
  [40.35, .7, ...WBF],                     // 0:40.5 match: out of the sky, into the whiteboard
  [41.05, 1.0, ...NEWS1],                  // pull back off the board onto the papers
  [44.95, .6, ...HTOP],                    // 0:45.5 match: up over the hat hole...
  [45.55, 1.0, ...HEADS],                  // ...and out of it, tilting up onto the grins
  [50.45, 1.7, ...SPIN1],                  // 0:50.5: widen from the grin into the spin
  [54.7, .9, ...SPIN1C],                   // cut in mid-spin: faces blur past
  [59.2, 1.6, ...TR1A],                    // instrumental: low and close, tracking the car
  [60.8, 5.8, ...TR1B],
  [66.6, 5.2, ...TR1C],
  [72.0, 2.5, ...WB],                      // the whiteboard (crime: chart bars become cell bars)
  [79.0, .55, ...WBF2],                    // 1:20 match: push into the bars...
  [79.55, .9, ...TCLOSE],                  // ...and down onto the low table close-up (soundbite)
  [wt(9, 'unveiled') - 1.1, 1.1, ...JAILM], // "unveiled": push down to table-top level as the cloth lifts
  [wt(9, 'build') - .5, 1.4, ...JAILW],    // "jails": worm's-eye, the cells shoot up
  [L_(10).s - .3, 1.3, ...WORME],          // refrain 2 blues: end-on worm's-eye
  [L_(11).s - .25, 1.0, ...NEWS2],         // news into the drawer
  [102.6, .5, ...WBF],                     // 1:43 match: push through the whiteboard...
  [103.1, 1.0, ...HEADS2],                 // ...slide off it onto the grins
  [L_(13).s - .3, 1.3, ...SPIN2A],         // refrain 2 spin: worm's-eye
  [112.4, 1.6, ...SPIN2B],
  [116.9, 1.8, ...TR2A],                   // instrumental 2: the car comes at us, low
  [118.7, 3.0, ...TR2B],
  [121.7, 1.5, ...VOGUE],                  // 2:03 vogue arrival: the track pushes in onto the poses
  [126.75, .45, ...DIME],                  // the dime (vogue holds over "once upon a time": the clock car on the right third)
  [128.4, 1.1, ...POOR],                   // the poor person with the bowl
  [131.3, 2.6, ...POOR2],                  // life's unfair: the table rolls on past
  [133.9, 1.0, ...ORBA1],                  // bridge signature: the high orbit (vogue 2, truth into the box)
  [134.9, 2.3, ...ORBA2],
  [L_(21).s - .4, .5, ...WBM],             // wars: chips
  [L_(22).s - .3, .5, ...MICS],            // the mics wilt on "limit"
  [L_(23).s - .25, .45, ...PIE],           // pie, blackbirds
  [L_(24).s - .2, .45, ...HOLE],           // little big guy
  [L_(25).s - .2, .45, ...BOOK],           // the book
  [L_(26).s - .3, .5, ...TOPY],            // the match into the chess top-down (hat hole as a square)
  [150.5, 1.7, ...ORBB],                   // the board turns under us
  [152.2, .45, ...CHESSW],                 // "foul": down and back, the giant knight kicks the giant rook
  [154.0, 1.6, ...ORBC],                   // back up to the orbit
  [L_(28).s - .3, 1.0, ...COPS],           // the paid cops behind the table
  [L_(29).s - .3, 1.2, ...PERV1],          // "perverse": back up to the orbit...
  [161.9, 2.0, ...PERV2],                  // ...which comes down onto the car for the word
  [L_(30).s - .3, .6, ...HEADS],           // rehearsed: the row nods as one
  [L_(31).s - .5, 1.1, ...POVB],           // refrain 3, from the driver's hole: the sky and the blind
  [L_(32).s - .3, .8, ...POVN],            // news rains in
  [L_(33).s - .3, .7, ...HEADS3],          // grin 3
  [L_(34).s - .3, .9, ...POVS],            // spin 3: the board whirls round the hole
  [189.0, 2.0, ...POVS2],
  [192.3, 1.5, ...GBIG],                   // up and out: the giant gavel lands on the table (~195)
  ...shotsEnd(),
];
function camAt(t) {
  { const ce = typeof camEnd === 'function' ? camEnd(t) : null; if (ce) return ce; } // the dusk aerial over Black Rock City (camera-end.js)
  let i = 0; while (i + 1 < SH.length && SH[i + 1][0] <= t) i++;
  const e = SH[i], p = SH[Math.max(0, i - 1)], u = e[1] > 0 ? smooth((t - e[0]) / e[1]) : 1;
  const v = [2, 3, 4, 5, 6].map((k) => lerp(p[k], e[k], u));
  if (p.length > 7 && e.length > 7) { // swing round the car
    const r0 = Math.hypot(p[2], p[4]), r1 = Math.hypot(e[2], e[4]), a0 = Math.atan2(p[4], p[2]); let da = Math.atan2(e[4], e[2]) - a0;
    da -= TAU * Math.round(da / TAU); const r = lerp(r0, r1, u), a = a0 + da * u; v[0] = r * Math.cos(a); v[2] = r * Math.sin(a);
  }
  const yw = lerp(p[7] || 0, e[7] || 0, u);
  // the intro's car drives into a still frame; from 10 s the camera eases into following it (no jolt at 14 s)
  const follow = t < 10 ? carX(14) : t < 18 ? carX(14) + 12.8 * ((t - 10) / 8) ** 3 * (1 - (t - 10) / 16) : carX(Math.min(t, 238));
  const near = clamp((Math.hypot(v[0], v[1] - TOP, v[2]) - .5) / .7), clip = Math.hypot(v[0], v[2]) < .5 && v[1] < TOP + .6; // no drift right up against the hat or inside the hole
  const gu = t - (typeof gavelT === 'function' ? gavelT() : L_(34).e - .5), sh = gu >= 0 && gu < .4 ? (1 - gu / .4) ** 2 : 0; // the giant gavel's impact shakes the camera
  return { x: follow + v[0] + .25 * Math.sin(t * .23) * near + .05 * sh * Math.sin(gu * 55), y: v[1] + .05 * Math.sin(t * .31) * near + .04 * sh * Math.sin(gu * 71 + 1), z: v[2], p: v[3], f: v[4], yaw: yw, cy: Math.cos(yw), sy: Math.sin(yw), clip };
}
