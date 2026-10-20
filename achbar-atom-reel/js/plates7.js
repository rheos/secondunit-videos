// Pass 2 plates: the tapes (T), the fields (X), the day after (Y), the restart (Z). Written from the
// speculative outline (OUTLINE-speculative.md); every line on screen is sourced in BUILD-STATE.md. Pure functions
// of t. Data: js/map-data.js (US_STATES, lonlat), js/tape-data.js (TAPE_ENV, TAPE_WORDS, TAPE_T0), js/compute-data.js.
'use strict';

// ---------- T. the tapes: a 1953 photograph, a 1953 recording, synced ----------
// The film's core ask is Del Tredici's photographs brought to life in sync with his interview tapes. We cannot
// touch his; this shows the manner on public-domain material: Eisenhower's "Atoms for Peace" recording and a
// National Archives photograph. The picture breathes with the voice, the words type as they are spoken.
const TAPE = { key: 'eisenhower-un-1953', cx: 1250, cy: 470, w: 860 };
function tapeEnv(t) { if (typeof TAPE_ENV === 'undefined') return 0; const i = Math.floor((t - TAPE_T0) * 24); return i < 0 || i >= TAPE_ENV.length ? 0 : TAPE_ENV[i]; }
function reel(cx, cy, r, ang, a) {
  gc(cx, cy, r, C.white, .9 * a, 2); gc(cx, cy, r * .3, C.white, .9 * a, 1.5); gc(cx, cy, r * .62, C.lav, .35 * a, 1, [3, 6]);
  for (let i = 0; i < 3; i++) { const q = ang + i * TAU / 3; gl(cx + Math.cos(q) * r * .3, cy + Math.sin(q) * r * .3, cx + Math.cos(q) * r * .92, cy + Math.sin(q) * r * .92, C.white, .8 * a, 7); }
}
function plateT(t) {
  const t0 = PLATE.T, b = (n) => t0 + n * BEAT, tEnd = PLATE.B; schBG(); schFrame('1', '', '', C.lav);
  const env = tapeEnv(t), out = eio(pr(t, tEnd - .8, tEnd));
  // the photograph, breathing with the voice, then handed to the stamp's place
  const cx = lerp(TAPE.cx, 600, out), cy = lerp(TAPE.cy, 470, out), w = lerp(TAPE.w, 760, out);
  print(TAPE.key, cx, cy, w, { z: 1.02 + .035 * env + .03 * pr(t, t0, tEnd), mount: 12, alpha: pr(t, t0, t0 + .6) });
  if (out <= 0) { const k = pr(t, t0 + .5, t0 + .9); sight(cx - w * .12, cy - w * .14, 40 * k, t, k * (1 - pr(t, t0 + 2.2, t0 + 2.6))); }
  // the deck: two reels, the tape between them, a VU needle on the voice
  const dk = eo(pr(t, t0, t0 + .9)) * (1 - out), rx = 330, ry = 300, ang = (t - t0) * 2.4;
  if (dk > 0) {
    reel(rx, ry, 120 * dk, ang, dk); reel(rx + 310, ry, 120 * dk, ang * 1.15, dk);
    gl(rx - 20, ry + 118, rx + 330, ry + 118, C.lav, .7 * dk, 1.5); gl(rx + 60, ry + 118, rx + 60, ry + 150, C.lav, .5 * dk, 1); gl(rx + 250, ry + 118, rx + 250, ry + 150, C.lav, .5 * dk, 1);
    for (let i = 0; i < 3; i++) gc(rx + 100 + i * 55, ry + 160, 9, C.white, .8 * dk, 1.2);                       // heads
    const vx = rx + 155, vy = ry + 290; gc(vx, vy, 90, C.white, .8 * dk, 1.5, null, Math.PI, TAU); ticks(vx, vy, 84, 24, 6, C.lav, .6 * dk, 1, 6, Math.PI, TAU);
    const na = Math.PI + Math.PI * (.08 + .84 * cl(env * 1.4)); gl(vx, vy, vx + Math.cos(na) * 80, vy + Math.sin(na) * 80, C.mag, .95 * dk, 2.5);
    lab(vx, vy + 26, 'VU', C.lav, .7 * dk, 12, 'center');
    lab(rx + 155, ry - 150, 'THE TAPES', C.white, .9 * dk, 22, 'center'); lab(rx + 155, ry - 126, 'INTERVIEW REEL · 7½ IPS', C.lav, .6 * dk, 12, 'center');
    // the waveform: the last two seconds of the voice, scrolling under the deck
    const wx0 = 120, wx1 = 750, wy = 700; gl(wx0, wy, wx1, wy, C.lav, .3 * dk, 1);
    const P = []; for (let i = 0; i <= 120; i++) { const tt = t - 2 + i / 60; const e = tapeEnv(tt) * (1 + .4 * Math.sin(tt * 150 + i)); P.push([lerp(wx0, wx1, i / 120), wy - e * 70]); }
    path(P, C.cyan, 1.4, .9 * dk);
    const Q = P.map(([x, y]) => [x, 2 * wy - y]); path(Q, C.cyan, 1.4, .9 * dk);
  }
  // the words, typed as they are spoken (TAPE_WORDS: [time, word])
  if (typeof TAPE_WORDS !== 'undefined') {
    let x = 120, y = 820; const sz = 26;
    for (const [tw, word] of TAPE_WORDS) {
      if (t < tw) break;
      const ww = meas(word + ' ', { size: sz, weight: 700 });
      if (x + ww > 1800) { x = 120; y += sz * 1.5; }
      const hot = /inventiveness|death|life/i.test(word);
      txt(word, x, y, { size: sz, weight: 700, color: hot ? C.mag : C.white, alpha: cl((t - tw) * 8) * (1 - pr(t, tEnd - .25, tEnd)) }); x += ww;
    }
  }
  band(t, t0 + 1.0, tEnd - .9, '8 DECEMBER 1953 · DWIGHT EISENHOWER, “ATOMS FOR PEACE”, UN GENERAL ASSEMBLY', 'U.S. GOVERNMENT RECORDING AND PHOTOGRAPH · THE MANNER, ON PUBLIC MATERIAL: THE STILL BREATHES WITH THE VOICE, THE WORDS LAND AS THEY ARE SPOKEN');
  plateLabel(FIG.T, 'THE TAPES', '', t, t0 + .2);
}

// ---------- X. the fields of the bomb: where Del Tredici pointed the camera, then where the new romance is built ----------
const SITES_BOMB = [   // name, state, lon, lat, label side: sites photographed in At Work in the Fields of the Bomb (1987), from its plate list
  ['HANFORD', 'WA', -119.49, 46.55, 'l'], ['IDAHO', 'ID', -112.90, 43.50, 'l'], ['NEVADA TEST SITE', 'NV', -116.05, 37.10, 'l'],
  ['ROCKY FLATS', 'CO', -105.23, 39.89, 'r'], ['WHITE SANDS · TRINITY', 'NM', -106.48, 33.68, 'r'], ['KIRTLAND AFB', 'NM', -106.55, 35.05, 'r'],
  ['PANTEX', 'TX', -101.56, 35.31, 'r'], ['KANSAS CITY PLANT', 'MO', -94.55, 38.90, 'r'], ['MOUND', 'OH', -84.29, 39.63, 'l'],
  ['FERNALD', 'OH', -84.69, 39.30, 'l'], ['PORTSMOUTH', 'OH', -83.00, 39.00, 'r'], ['ASHTABULA', 'OH', -80.79, 41.87, 'r'],
  ['OAK RIDGE · Y-12', 'TN', -84.27, 36.01, 'r'], ['SAVANNAH RIVER', 'SC', -81.65, 33.30, 'r'], ['PINELLAS', 'FL', -82.70, 27.90, 'r'],
];
const SITES_AI = [   // name, deal, lon, lat: primary releases and trade press, see BUILD-STATE.md
  ['THREE MILE ISLAND', 'UNIT 1 TO RESTART FOR MICROSOFT · 20 SEPT 2024', -76.72, 40.15],
  ['SUSQUEHANNA', 'AMAZON DATA CENTRE CAMPUS AT THE PLANT · MARCH 2024', -76.15, 41.09],
  ['RICHLAND', 'AMAZON · FOUR X-ENERGY SMALL REACTORS · OCT 2024', -119.33, 46.47],
  ['CLINTON', 'META, 20 YEARS OF POWER · JUNE 2025', -88.84, 40.17],
  ['DUANE ARNOLD', 'RESTART FOR GOOGLE · OCT 2025', -91.78, 42.10],
];
const LA_PIN = lonlat(-106.48, 33.68);   // the Trinity pin: where the lab's iris opens

function plateX(t) {
  const t0 = PLATE.X, b = (n) => t0 + n * BEAT, tEnd = PLATE.C; schBG(); schFrame('4', '', '', C.lav);
  // the map, drawn in the pen, state by state
  const mk = pr(t, t0, t0 + 1.6);
  US_STATES.forEach((ring, i) => { const kk = seg(mk, (i % 17) * .03, .5 + (i % 17) * .03); strokeTo(ring.concat([ring[0]]), kk, C.lav, 1, .55, false); });
  if (mk >= 1) { for (const ring of US_STATES) iP(ring, true, C.lav, .6, .25, false, .4); }
  // the sites of the bomb, pinned on the beats
  SITES_BOMB.forEach(([name, st, lon, lat, side], i) => {
    const tp = b(3 + i * .5); if (t < tp) return;
    const [x, y] = lonlat(lon, lat), k = eo(pr(t, tp, tp + .3)), fade = 1 - .55 * pr(t, b(12), b(12) + .5);
    const hp = hexPts(x, y, 11 * k); fillP(PP(hp), C.navy); iP(hp, true, C.white, 1.3, .95 * fade, false, .3); star(x, y, 3, C.white, fade);
    const lx = x + (side === 'l' ? -26 : 26);
    lab(lx, y + 5, name, C.white, .95 * fade * k, 14, side === 'l' ? 'right' : 'left');
  });
  const h1 = 'THE FIELDS OF THE BOMB · WHERE DEL TREDICI POINTED THE CAMERA, 1980-1987';
  caption(h1, 120, 1000, t, b(2), { size: 24, weight: 700, color: C.white, alpha: 1 - pr(t, b(12) - .3, b(12)) });
  caption('AT WORK IN THE FIELDS OF THE BOMB (1987) · THE U.S. SITES IN THE BOOK’S OWN PLATE LIST (IT ALSO GOES TO JAPAN, CANADA, BRITAIN AND FRANCE)', 120, 1036, t, b(2) + .4, { size: 16, color: C.lav, cps: 150, alpha: 1 - pr(t, b(12) - .3, b(12)) });
  // then the new romance: reactors restarted and data centres, in the hot colour; the east-coast cluster gets callouts
  let col = 0;
  SITES_AI.forEach(([name, deal, lon, lat], i) => {
    const tp = b(12.5 + i * .6); if (t < tp) return;
    const [x, y] = lonlat(lon, lat), k = eo(pr(t, tp, tp + .3));
    gc(x, y, 14 * k, C.mag, .95, 2); gc(x, y, 26 * k * (1 + .15 * Math.sin(t * 6)), C.mag, .35, 1); star(x, y, 3.5, C.white, 1);
    if (x > 1000) {
      const ly = 300 + col * 78; col++;
      gl(x, y, lerp(x, 1560, k), lerp(y, ly - 8, k), C.mag, .6, 1);
      if (k >= 1) { gl(1560, ly - 8, 1600, ly - 8, C.mag, .6, 1); lab(1610, ly - 2, name, C.mag, .95, 15); lab(1610, ly + 18, deal, C.lav, .8, 11); }
    } else { lab(x + 34, y + 2, name, C.mag, .95 * k, 14); lab(x + 34, y + 20, deal, C.lav, .8 * k, 11); }
  });
  caption('AND WHERE THE NEW ROMANCE IS BEING BUILT: REACTORS RESTARTED FOR AI, DATA CENTRES ON THE SAME MAP', 120, 1000, t, b(12), { size: 24, weight: 700, color: C.mag });
  caption('CONSTELLATION · TALEN/AMAZON · AMAZON/X-ENERGY · META/CONSTELLATION · NEXTERA/GOOGLE · SEE THE RESTART, CH. 10', 120, 1036, t, b(12) + .4, { size: 16, color: C.lav, cps: 150 });
  // hand over: the Los Alamos pin is where the lab's iris opens
  if (t > tEnd - .6) { const k = pr(t, tEnd - .6, tEnd); gc(LA_PIN[0], LA_PIN[1], 11 + 30 * k, C.cyan, .9 * k, 1.5); star(LA_PIN[0], LA_PIN[1], 6, C.white, 1); }
  plateLabel(FIG.X, 'THE FIELDS', '', t, t0 + .2);
}

// ---------- Y. the day after: a 1983 living room, the broadcast, the diary ----------
function plateY(t) {
  const t0 = PLATE.Y, b = (n) => t0 + n * BEAT, tEnd = PLATE.E;
  X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
  // the scope's tube is a television now: a cabinet draws around the same glass
  const cab = eo(pr(t, t0, t0 + .8));
  X.save(); X.globalAlpha = cab; X.fillStyle = '#2a211a'; X.beginPath(); X.roundRect(TB.cx - TB.w / 2 - 90, TB.cy - TB.h / 2 - 70, TB.w + 180, TB.h + 150, 28); X.fill();
  X.strokeStyle = 'rgba(255,255,255,.12)'; X.lineWidth = 2; X.stroke(); X.fillStyle = '#1a1512'; X.fillRect(TB.cx - TB.w / 2 - 60, TB.cy + TB.h / 2 + 10, TB.w + 120, 50);
  for (let i = 0; i < 4; i++) { X.beginPath(); X.arc(TB.cx + TB.w / 2 - 60 - i * 70, TB.cy + TB.h / 2 + 35, 12, 0, TAU); X.fillStyle = '#5a4a3a'; X.fill(); }   // knobs
  X.restore();
  tube(TB.cx, TB.cy, TB.w, TB.h, 1, { bezel: false });
  X.save(); X.beginPath(); X.roundRect(TB.cx - TB.w / 2, TB.cy - TB.h / 2, TB.w, TB.h, 46); X.clip();
  // the broadcast: a slate, then the number, then the station interrupts itself, then the diary
  const ph = t < b(5) ? 0 : t < b(11) ? 1 : t < b(13) ? 2 : 3;
  if (ph === 0) {
    ptxt('ABC · SUNDAY 20 NOVEMBER 1983 · 8 PM', TB.cx, TB.cy - 150, { size: 30, align: 'center', c: PH.g, alpha: pr(t, t0 + .3, t0 + .6) });
    ptxt('THE DAY AFTER', TB.cx, TB.cy - 30, { fam: FT.d, size: 120, weight: 900, align: 'center', c: PH.g, alpha: pr(t, t0 + .6, t0 + .9), blur: 26 });
    ptxt('DIRECTED BY NICHOLAS MEYER', TB.cx, TB.cy + 60, { size: 26, align: 'center', c: PH.g, alpha: pr(t, t0 + .9, t0 + 1.2) });
  } else if (ph === 1) {
    ptxt(fmt(1e8 * eo(pr(t, b(5), b(6.5)))), TB.cx, TB.cy - 20, { fam: FT.d, size: 160, weight: 900, align: 'center', c: PH.g, blur: 30 });
    ptxt('VIEWERS, ONE NIGHT', TB.cx, TB.cy + 80, { size: 34, align: 'center', c: PH.a, alpha: pr(t, b(6.5), b(7)) });
    ptxt('NIELSEN: A 46 RATING, A 62 SHARE, MORE THAN 100 MILLION PEOPLE', TB.cx, TB.cy + 140, { size: 22, align: 'center', c: PH.a, alpha: .8 * pr(t, b(7), b(7.5)), blur: 8 });
  } else if (ph === 2) {
    // MC09: the broadcaster interrupts itself
    X.fillStyle = '#efe5cd'; X.fillRect(TB.cx - TB.w / 2, TB.cy - TB.h / 2, TB.w, TB.h);
    txt('WE’LL BE RIGHT BACK', TB.cx, TB.cy - 30, { fam: FT.d, size: 96, weight: 900, color: '#a8553a', align: 'center' });
    txt('AFTER THESE MESSAGES', TB.cx, TB.cy + 60, { fam: FT.d, size: 44, weight: 400, color: '#3a2617', align: 'center' });
    X.globalAlpha = .18; X.fillStyle = '#000'; for (let y = TB.cy - TB.h / 2; y < TB.cy + TB.h / 2; y += 3) X.fillRect(TB.cx - TB.w / 2, y, TB.w, 1.5); X.globalAlpha = 1;
  } else {
    const off = pr(t, tEnd - .5, tEnd);
    ptxt('PRESIDENT REAGAN’S DIARY, 10 OCTOBER 1983, AFTER A SCREENING:', TB.cx, TB.cy - 170, { size: 24, align: 'center', c: PH.a, alpha: (1 - off) * pr(t, b(13), b(13.4)) });
    ptxt('“VERY EFFECTIVE & LEFT ME', TB.cx, TB.cy - 50, { fam: FT.d, size: 72, weight: 900, align: 'center', c: PH.g, alpha: (1 - off) * pr(t, b(13.5), b(13.8)), blur: 20 });
    ptxt('GREATLY DEPRESSED”', TB.cx, TB.cy + 50, { fam: FT.d, size: 72, weight: 900, align: 'center', c: PH.g, alpha: (1 - off) * pr(t, b(14), b(14.3)), blur: 20 });
    ptxt('HIS NEXT LINE: DO ALL WE CAN TO SEE THERE IS NEVER A NUCLEAR WAR · REAGAN FOUNDATION TRANSCRIPTION', TB.cx, TB.cy + 150, { size: 20, align: 'center', c: PH.a, alpha: .85 * (1 - off) * pr(t, b(15), b(15.4)), blur: 8 });
    if (off > 0) { X.fillStyle = '#000'; X.globalAlpha = off; X.fillRect(TB.cx - TB.w / 2, TB.cy - TB.h / 2, TB.w, TB.h); X.globalAlpha = 1; beamDot(TB.cx, TB.cy, 6 * (1 - off) + 2, 1); }
  }
  X.restore();
  // static between the phases
  for (const edge of [b(5), b(11), b(13)]) { const s = Math.abs(t - edge); if (s < .1) { X.save(); X.beginPath(); X.roundRect(TB.cx - TB.w / 2, TB.cy - TB.h / 2, TB.w, TB.h, 46); X.clip(); const r0 = M32(Math.floor(t * 24)); X.globalAlpha = .5 * (1 - s / .1); for (let i = 0; i < 1400; i++) { X.fillStyle = r0() < .5 ? '#fff' : '#000'; X.fillRect(TB.cx - TB.w / 2 + r0() * TB.w, TB.cy - TB.h / 2 + r0() * TB.h, 6, 2); } X.restore(); } }
  tubeGlass(TB.cx, TB.cy, TB.w, TB.h, t);
  // the room, in the glow: a lamp and the back of a sofa, in blueprint lines over the black
  X.save(); X.globalAlpha = .55 * cab; X.strokeStyle = C.lav; X.lineWidth = 1.2;
  X.beginPath(); X.moveTo(0, 1010); X.lineTo(W, 1010); X.stroke();                                      // floor
  X.beginPath(); X.moveTo(80, 1010); X.lineTo(80, 700); X.lineTo(60, 700); X.lineTo(120, 560); X.lineTo(200, 560); X.lineTo(260, 700); X.lineTo(80, 700); X.stroke();   // lamp
  X.beginPath(); X.roundRect(560, 960, 800, 120, 30); X.stroke(); X.beginPath(); X.roundRect(600, 985, 330, 60, 14); X.stroke(); X.beginPath(); X.roundRect(990, 985, 330, 60, 14); X.stroke();   // sofa back
  X.restore();
}

// ---------- Z. the restart: Three Mile Island, back on for AI ----------
const TMI = { key: 'tmi', cx: 960, cy: 470, w: 1300 };
function plateZ(t) {
  const t0 = PLATE.Z, b = (n) => t0 + n * BEAT, tEnd = PLATE.P; schBG(); schFrame('10', '', '', C.lav);
  const open = eo(pr(t, t0, t0 + .9)), shut = eio(pr(t, tEnd - .55, tEnd));
  const ix = 960, iy = lerp(444, TMI.cy, open), ir = lerp(8, 1400, open) * (1 - shut) + 2 * shut;
  const z = lerp(1, 1.06, pr(t, t0, tEnd)), dim = lerp(1, .35, eio(pr(t, b(8) - .2, b(8) + .3)));
  X.save(); X.beginPath(); X.arc(ix, lerp(iy, 540, shut), Math.max(0, ir), 0, TAU); X.clip();
  print(TMI.key, TMI.cx, TMI.cy, TMI.w, { z, mount: 10, alpha: dim });
  if (open >= 1 && t < b(8)) { const p = printPt(TMI.key, TMI.cx, TMI.cy, TMI.w, .5, .5, { z }); sight(p[0], p[1], 70, t, pr(t, t0 + .9, t0 + 1.2)); }
  if (t >= b(8)) {
    X.globalAlpha = .9 * pr(t, b(8) - .15, b(8)); X.fillStyle = C.navy; X.fillRect(0, 300, W, 420); X.globalAlpha = 1;
    const hs = fit('RESTARTING FOR AI', 1500, 170, { fam: FT.d, weight: 900, stretch: 'semi-condensed' });
    kin('RESTARTING FOR AI', 960, 470, t, b(8), { size: hs, weight: 900, stretch: 'semi-condensed', align: 'center', hot: [0, 10, C.mag], stag: .03 });
    const c1 = '20 SEPTEMBER 2024 · CONSTELLATION: UNIT 1, OFF SINCE 2019, TO RETURN AS THE CRANE CLEAN ENERGY CENTER, ABOUT 835 MW · 20 YEARS OF POWER TO MICROSOFT’S DATA CENTRES';
    caption(c1, 960 - meas(c1, { size: 18 }) / 2, 560, t, b(9), { size: 18, color: C.white, cps: 220 });
    const c2 = 'UNIT 2 WAS THE 1979 ACCIDENT. DEL TREDICI’S SECOND BOOK WAS THE PEOPLE OF THREE MILE ISLAND (1980).';
    caption(c2, 960 - meas(c2, { size: 18 }) / 2, 600, t, b(10), { size: 18, color: C.lav, cps: 220 });
  }
  X.restore();
  gc(ix, lerp(iy, 540, shut), ir, C.cyan, .8, 1.5);
  if (t >= b(11) && shut < 1) {
    const rows = [['AMAZON', 'A DATA CENTRE CAMPUS AT THE SUSQUEHANNA PLANT, PENNSYLVANIA', 'MARCH 2024'], ['GOOGLE', 'UP TO 500 MW OF SMALL REACTORS FROM KAIROS POWER', 'OCTOBER 2024'], ['META', 'A CALL FOR 1 TO 4 GW OF NUCLEAR POWER; CLINTON, ILLINOIS, SIGNED', 'DEC 2024 · JUNE 2025']];
    rows.forEach((r, i) => { const tr = b(11 + i * .8); if (t < tr) return; const y = 790 + i * 44, a = (1 - shut) * pr(t, tr, tr + .2); gl(300, y + 14, lerp(300, 1620, eo(pr(t, tr, tr + .3))), y + 14, C.lav, .4, 1); lab(300, y + 6, r[0], C.mag, a, 18); caption(r[1], 470, y + 6, t, tr + .1, { size: 17, color: C.white, cps: 200, alpha: a }); lab(1620, y + 6, r[2], C.lav, a, 15, 'right'); });
  }
  band(t, t0 + 1.0, b(7) + .6, 'THREE MILE ISLAND, PENNSYLVANIA · THE NEW ROMANCE NEEDS POWER: THE REACTORS THE LAST ONE LEFT BEHIND', 'CDC PHOTOGRAPH · THE UN INTERVIEWEE WHO REFUSED MARK OVER GENERATIVE AI CITED URANIUM DEMAND; THIS IS WHAT SHE MEANT');
  if (shut > .8) star(960, 540, 6, C.white, 1);
  plateLabel(FIG.Z, 'THE RESTART', '', t, t0 + .2);
}
