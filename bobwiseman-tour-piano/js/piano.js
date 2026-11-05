/* An upright piano with Bob Wiseman's tour on the music desk. Nothing plays by itself: the viewer presses a key.
   Never a player piano (Robin, 2026-11-04): Bob is a pianist.
   x = depth (front at higher x), y = width (+y goes viewer-left), z = up. Units are cm: a 132 cm studio upright.

   How a key really makes its note, and the path drawn in see-through:
   finger -> key tips on the balance rail -> capstan at the back of the key lifts the wippen -> jack pushes the hammer butt ->
   hammer swings back on its flange and hits the string -> jack escapes, hammer falls to the check -> damper lifted off the string
   by the wippen, so it rings -> string -> bridge -> soundboard. Key up: damper back on the string. Sustain pedal: trap lever ->
   pedal rod -> damper lift rail, every damper off together.

   Parts, each held by another:
   CASE     plinth . lower cabinet . upper cabinet . lid . two cheeks . keybed . keyslip . toe blocks . legs . fallboard . music desk . casters
   BACK     five back posts . soundboard on the posts, with ribs . bridges glued to the soundboard
   PLATE    iron plate bolted through the posts: top bar with tuning pins, bottom bar with hitch pins, two side bars, a strut
   STRINGS  88 drawn, one per note: copper wound bass crossing over the steel treble, tuning pin to hitch pin
   ACTION   key levers on the balance rail . capstans . wippens . jacks . hammer rail . flange rail . hammers on shanks . dampers on wires
   PEDALS   three pedals through the bottom board . trap lever . pedal rod . damper lift rail */

const PH = 130, PW = 152, CASE_X = 40, LOW_X = 34, BED_X = 66, BED_Z = 60, KZ = 68, KX0 = 44, KX1 = 64, KY0 = 15, KY1 = 137, DIP = 1.1;
const WW = (KY1 - KY0) / 52, BLK = [1, 4, 6, 9, 11];   // black notes, counted from A
const CREAMK = '#fbf6e4', OFFKEY = '#cfc8b4', NOTE_INK = '#2a2622', PENCIL = '#4d4a48', RED = '#d8432f';
const WOODM = { l:'#d9a86c', m:'#bf8a4f', d:'#8e6236' }, IRON = { l:'#e6c76a', m:'#c9a64a', d:'#8d7030' }, COPPERM = { l:'#f0b07a', m:'#d08a52', d:'#9a5a2c' }, FELT = { l:'#fff4d6', m:'#e6dcbd', d:'#bfb390' }, FELTR = { l:'#ef6a4c', m:'#cf5038', d:'#7c2c1e' };
const BRASS = { l:'#f2d27a', m:'#d3ac4c', d:'#94752c' };
const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'], MON3 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* ---------- the keyboard: 88 notes, A0 to C8 ---------- */
const KEYS = []; { let w = 0; for (let n = 0; n < 88; n++){ const black = BLK.includes(n % 12);
    KEYS.push(black ? { n, midi:21 + n, black:true, y0:KY1 - w*WW - .62, y1:KY1 - w*WW + .62 } : { n, midi:21 + n, black:false, w, y0:KY1 - (w + 1)*WW + .06, y1:KY1 - w*WW - .06 });
    if (!black) w++; } }
const WHITES = KEYS.filter(k => !k.black);

/* ---------- one white key per show, in date order, from C1 up: the tour runs left to right along the keyboard ---------- */
const SHOW_FROM = 2;
const SHOWS = (window.TOUR || []).map((s, i) => { const [yy, mm, dd] = s[0].split('-').map(Number);
  return { i, date:s[0], yy, mm, dd, city:s[1], region:s[2], venue:s[3], status:s[4], key:WHITES[SHOW_FROM + i], whiteIdx:SHOW_FROM + i }; });
SHOWS.forEach(s => { s.key.show = s; });
const PAGES = []; for (const s of SHOWS){ const id = s.yy*100 + s.mm; let p = PAGES[PAGES.length - 1]; if (!p || p.id !== id){ p = { id, yy:s.yy, mm:s.mm, shows:[] }; PAGES.push(p); } p.shows.push(s); s.page = PAGES.length - 1; }

/* ---------- the sheet on the desk: u left to right, v bottom to top, tilted back against the upper panel ---------- */
const SH_W = 72, SH_H = 39, SH_Y1 = PW/2 + SH_W/2, SH_Z0 = 88, SH_X0 = 45.5, SH_TILT = 4/SH_H, SH_N = [1, 0, SH_TILT];
const shP = (u, v, d = 0) => [SH_X0 - v*SH_TILT + d, SH_Y1 - u, SH_Z0 + v];
const shQ = (pts, d) => pts.map(([u, v]) => shP(u, v, d));
function shText(u, v, str, size, col = NOTE_INK, weight = 700, anchor = 'middle', fam = 'ui-monospace,Menlo,monospace', style = 'normal'){
  return `<text transform="${txM(P(...shP(u, v, .05)), Dv(0, -1, 0), Dv(SH_TILT, 0, -1))}" font-size="${size}" fill="${col}" text-anchor="${anchor}" font-family="${fam}" font-weight="${weight}" font-style="${style}" letter-spacing=".02em">${str}</text>`; }
const HAND = "'Bradley Hand','Segoe Print','Comic Sans MS',cursive";
const STAFF_GAP = 1.15;

function shLine(a, b, w = .35, col = NOTE_INK){ return `<path d="${pd(shQ([a, b], .04), false)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`; }
function shCurve(pts, w = .45, col = NOTE_INK){ return `<path d="${pd(shQ(pts, .04), false)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`; }
function trebleClef(u, base){ const g = STAFF_GAP, pts = [[.3, 1.5*g], [1.1, 2*g], [1.1, 3*g], [.2, 3.3*g], [-.8, 2.4*g], [-1, 1.2*g], [0, .3*g], [1.4, .4*g], [1.8, 1.4*g], [.8, 2.5*g], [-.5, 4.1*g], [-.5, 5.2*g], [.3, 5.8*g], [.8, 4.8*g], [.3, 2*g], [.3, -.7*g], [-.4, -1.1*g], [-.9, -.7*g]];
  return shCurve(pts.map(([a, b]) => [u + a, base + b])); }
function bassClef(u, base){ const g = STAFF_GAP, pts = [[-.8, 3*g], [-.5, 3.7*g], [.5, 3.9*g], [1.3, 3.1*g], [1.1, 2*g], [-.8, .5*g]];
  return shCurve(pts.map(([a, b]) => [u + a, base + b])) + fill(pd(shQ(ellUV(u + 2, base + 3.4*g, .22, .22, 8), .04)), NOTE_INK) + fill(pd(shQ(ellUV(u + 2, base + 2.6*g, .22, .22, 8), .04)), NOTE_INK); }

/* clef and octave mark chosen so the notes sit on the staff; the pitch written is the pitch the key plays.
   A diatonic position counts lines and spaces from the staff's bottom line: E4 in treble, G2 in bass. */
function notation(list){ const mean = list.reduce((a, s) => a + s.whiteIdx, 0) / list.length, bass = mean < 23, zero = bass ? 13 : 25;
  let oct = Math.round((mean - zero - 4) / 7); oct = Math.max(-2, Math.min(2, oct));
  const mark = { [-2]:'15mb', [-1]:'8vb', 0:'', 1:'8va', 2:'15ma' }[oct];
  return { bass, mark, oct, pos:s => s.whiteIdx - zero - 7*oct }; }

function drawSystem(list, base, st){ const nt = notation(list), x0 = 7, x1 = SH_W - 4, g = STAFF_GAP; let s = '';
  for (let l = 0; l < 5; l++) s += shLine([x0 - 3.5, base + l*g], [x1, base + l*g], .22);
  s += shLine([x0 - 3.5, base], [x0 - 3.5, base + 4*g], .3) + shLine([x1, base], [x1, base + 4*g], .55);
  s += nt.bass ? bassClef(x0 - 1.1, base) : trebleClef(x0 - 1.1, base);
  if (nt.mark) s += shText(x0 - 1.4, nt.oct > 0 ? base + 6*g : base - 2.2*g, nt.mark, 1.4, NOTE_INK, 700, 'middle', "Georgia,'Times New Roman',serif", 'italic');
  const step = (x1 - x0 - 3) / list.length;
  list.forEach((show, j) => { const u = x0 + 3 + (j + .5)*step, p = nt.pos(show), v = base + p*g/2, cur = st.cur === show.i, dead = show.status === 'cancelled', col = cur ? RED : NOTE_INK;
    // ledger lines
    for (let l = -2; l >= p; l -= 2) s += shLine([u - 1.4, base + l*g/2], [u + 1.4, base + l*g/2], .22);
    for (let l = 10; l <= p; l += 2) s += shLine([u - 1.4, base + l*g/2], [u + 1.4, base + l*g/2], .22);
    // stem and head: the head is a real target too, it plays the show's key
    const up = p < 4, stem = up ? [u + .72, v + .12] : [u - .72, v - .12];
    s += shLine(stem, [stem[0], v + (up ? 3.4*g : -3.4*g)], .24, col);
    s += act('note', fill(pd(shQ(ellUV(u, v, .86, .6, 12).map(([a, b]) => [u + (a - u)*Math.cos(.32) - (b - v)*Math.sin(.32), v + (a - u)*Math.sin(.32) + (b - v)*Math.cos(.32)]), .06)), col)
      + fill(pd(shQ(rectUV(u - 2.6, v - 2.4, u + 2.6, v + 2.4), .05)), 'transparent'), `data-s="${show.i}"`);
    if (dead) s += shLine([u - 1.5, v - 1.2], [u + 1.5, v + 1.2], .4, RED) + shLine([u - 1.5, v + 1.2], [u + 1.5, v - 1.2], .4, RED);
    // the date, pencilled under the staff; the city staggers so long names don't run together
    const lowest = Math.min(base, v - 1) - 1.1, under = base - 3.1 - (j % 2 ? 1.75 : 0);
    s += shText(u, Math.min(lowest - .7, base - 1.5), show.dd, 2, cur ? RED : PENCIL, cur ? 800 : 600, 'middle', HAND);
    s += shText(u, Math.min(under - .4, lowest - 2.1 - (j % 2 ? 1.6 : 0)), show.city, 1.5, cur ? RED : PENCIL, cur ? 800 : 500, 'middle', HAND);
  });
  return s; }

function sheet(st){ const pg = PAGES[st.page] || PAGES[0], paper = '#fbf7e8', edge = '#d9d2bb';
  const outer = shQ(rectUV(0, 0, SH_W, SH_H), 0); let s = '';
  // a stack of pages behind the top one: this month's score, with the rest under it
  if (vis(SH_N)){
    s += shape(shQ(rectUV(.5, -.1, SH_W + .3, SH_H - .4), -.35), edge, .7) + shape(outer, paper, 1.1);
    s += shLine([SH_W/2, 0], [SH_W/2, SH_H], .16, '#cfc7ad');
    s += shText(SH_W/2, SH_H - 3.9, `${MONTHS[pg.mm - 1]} ${pg.yy}`, 3, NOTE_INK, 800, 'middle', "Georgia,'Times New Roman',serif");
    s += shText(SH_W - 2.4, SH_H - 2.6, `${st.page + 1} / ${PAGES.length}`, 1.4, PENCIL, 600, 'end');
    s += shText(2.4, SH_H - 2.6, 'Bob Wiseman, on tour', 1.3, PENCIL, 600, 'start', "Georgia,'Times New Roman',serif", 'italic');
    const list = pg.shows;
    if (list.length <= 7) s += drawSystem(list, 17, st);
    else { const h = Math.ceil(list.length/2); s += drawSystem(list.slice(0, h), 22.5, st) + drawSystem(list.slice(h), 7.8, st); }
  } else s += shape(outer, mix(paper, '#000000', .28), 1);   // the back of the sheet, seen from behind through nothing
  return s; }

/* ---------- key positions ---------- */
function keyDown(st, n){ const e = st.e[n]; if (e == null) return 0; return e < 50 ? e/50 : e < 300 ? 1 : e < 520 ? 1 - (e - 300)/220 : 0; }
function hammerOf(st, n){ const e = st.e[n]; if (e == null) return 0; const dead = KEYS[n].show && KEYS[n].show.status === 'cancelled', top = dead ? .55 : 1;
  return top*(e < 55 ? (e/55)*(e/55) : e < 130 ? 1 - .65*(e - 55)/75 : e < 300 ? .35 : e < 520 ? .35*(1 - (e - 300)/220) : 0); }
const keyZ = (x, d) => KZ - d*DIP*(x - 42)/(KX1 - 42);

function keyboard(st, m){ const yAsc = vis([0, 1, 0]), order = yAsc ? [...KEYS].reverse() : KEYS, FRONT = vis([1, 0, 0]); let s = '';
  const one = k => { const d = keyDown(st, k.n), z0 = keyZ(KX0, d), z1 = keyZ(k.black ? 55 : KX1, d), x1 = k.black ? 55 : KX1, H0 = k.black ? 1.2 : 0, B = KZ - 2.2;
    const lit = d > .02;
    const c = k.black ? (lit ? mix(DARK.l, m.l, .55) : DARK.l) : lit ? m.l : k.show ? (k.show.status === 'cancelled' ? '#c9b7ad' : CREAMK) : OFFKEY;
    const cf = k.black ? DARK.d : mix(c, '#000000', .14), cs = k.black ? DARK.m : mix(c, '#000000', .3);
    let g = '';
    const sideY = yAsc ? k.y1 : k.y0; g += shape([[KX0, sideY, B], [x1, sideY, B], [x1, sideY, z1 + H0], [KX0, sideY, z0 + H0]], cs, .3);
    if (FRONT) g += shape(k.black ? [[x1 + .9, k.y0, z1], [x1 + .9, k.y1, z1], [x1, k.y1, z1 + H0], [x1, k.y0, z1 + H0]] : [[x1, k.y0, B], [x1, k.y1, B], [x1, k.y1, z1], [x1, k.y0, z1]], cf, .35);
    g += shape([[KX0, k.y0, z0 + H0], [x1, k.y0, z1 + H0], [x1, k.y1, z1 + H0], [KX0, k.y1, z0 + H0]], c, .35);
    return act('key', g, `data-k="${k.n}"`); };
  for (const k of order) if (!k.black) s += one(k);
  for (const k of order) if (k.black) s += one(k);
  return s; }

/* ---------- the fallboard: a slope behind the keys, with the name and the tour's months marked over their keys ---------- */
const FB0 = [KX0, KZ + .4], FB1 = [CASE_X, 79], FB_N = norm([FB0[1] - FB1[1] < 0 ? 79 - (KZ + .4) : 1, 0, KX0 - CASE_X]);
const fbP = (y, t) => [FB0[0] + (FB1[0] - FB0[0])*t + .03, y, FB0[1] + (FB1[1] - FB0[1])*t];
function fbText(y, t, str, size, col = NOTE_INK, weight = 700){ const V = [FB0[0] - FB1[0], 0, FB0[1] - FB1[1]], Lg = Math.hypot(...V), Vn = V.map(v => v/Lg);
  return `<text transform="${txM(P(...fbP(y, t)), Dv(0, -1, 0), Dv(...Vn))}" font-size="${size}" fill="${col}" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-weight="${weight}" letter-spacing=".06em">${str}</text>`; }
function fallboard(st, m){ const q = [fbP(8, 0), fbP(PW - 8, 0), fbP(PW - 8, 1), fbP(8, 1)]; let s = '';
  if (!vis(FB_N)) return s;
  s += shape(q, tone(FB_N, m), 1.2);
  s += fbText(PW/2, .62, 'WISEMAN', 3.2, mix(tone(FB_N, m), '#000000', .62), 800);
  // a pencil bracket over each month's keys
  PAGES.forEach((pg, i) => { const a = pg.shows[0].key, b = pg.shows[pg.shows.length - 1].key, on_ = st.page === i, col = on_ ? '#fff4d6' : mix(tone(FB_N, m), '#000000', .55), t = .14;
    const y1 = a.y1 - .1, y0 = b.y0 + .1;
    s += `<path d="${pd([fbP(y1, t - .06), fbP(y1, t), fbP(y0, t), fbP(y0, t - .06)], false)}" fill="none" stroke="${col}" stroke-width="${on_ ? .7 : .45}" stroke-linejoin="round"/>`;
    s += fbText((y0 + y1)/2, t + .22, MON3[pg.mm - 1].toUpperCase(), 1.7, col, 800); });
  return s; }

/* ---------- the closed case: convex pieces, each with its box ---------- */
function caseParts(st, m){ const items = [], put = (b, svg) => items.push({ box:b, svg }), bx = (x0, y0, z0, x1, y1, z1, mm = m, w = 1.4) => put([[x0, y0, z0], [x1, y1, z1]], box(x0, y0, z0, x1, y1, z1, mm, tone, w));
  bx(0, 0, 3, LOW_X, PW, 8, DARK);                              // plinth, on casters
  bx(0, 0, 8, LOW_X, PW, BED_Z - 4);                            // lower cabinet with its knee panel
  bx(0, 0, BED_Z - 4, CASE_X, PW, PH);                          // upper cabinet
  bx(-1, -1, PH, CASE_X + 2, PW + 1, PH + 2);                   // lid
  bx(LOW_X, 0, BED_Z - 4, BED_X, PW, BED_Z);                    // keybed
  bx(KX1 + .2, 8, BED_Z, BED_X, PW - 8, KZ - 2.4);              // keyslip
  bx(CASE_X, 8, BED_Z, KX1 + .2, PW - 8, KZ - 2.2, WOODM, .6);  // the key frame under the keys
  for (const [y0, y1] of [[8, KY0 - .1], [KY1 + .1, PW - 8]]) bx(CASE_X, y0, KZ - 2.2, KX1 + .2, y1, KZ + 1.4, m, 1);   // key blocks
  for (const [y0, y1] of [[0, 8], [PW - 8, PW]]){
    bx(LOW_X, y0, 0, 68, y1, 6);                                // toe block
    bx(58, y0 + 1.6, 6, 64, y1 - 1.6, BED_Z - 4);               // leg
    bx(CASE_X, y0, BED_Z, BED_X, y1, 80);                       // cheek
  }
  // back posts stand proud of the cabinet: seen when it turns round
  for (const y of [6, 40, 76, 112, 146]) bx(-3, y - 3, 8, 0, y + 3, PH, WOODM, 1);
  // casters at the back corners
  for (const y of [8, PW - 8]) put([[2, y - 3, 0], [8, y + 3, 3]], cylX(3, 7, y, 1.6, 1.6, RUBB, toneI, .7, 12));
  // music desk: a ledge the sheet stands on
  bx(CASE_X, PW/2 - SH_W/2 - 3, SH_Z0 - 2.2, 47, PW/2 + SH_W/2 + 3, SH_Z0, m, 1);
  return items; }
const RUBB = { l:'#4a4640', m:'#35312c', d:'#221f1b' };
function panelLines(m){ const FRONT = vis([1, 0, 0]); if (!FRONT) return '';
  let s = '';
  // the knee panel, recessed, and the upper panel's moulding
  s += `<path d="${pd(on(PX(LOW_X + .05), rrUV(12, 12, PW - 12, BED_Z - 8, 1.5, 3)))}" fill="${mix(tone([1, 0, 0], m), '#000000', .08)}" stroke="${INK}" stroke-width="1"/>`;
  s += `<path d="${pd(on(PX(CASE_X + .05), rrUV(11, 83, PW - 11, PH - 4, 1.5, 3)))}" fill="${mix(tone([1, 0, 0], m), '#000000', .05)}" stroke="${INK}" stroke-width="1"/>`;
  return s; }
function pedals(st){ const items = []; [[68, st.pedal], [76, 0], [84, 0]].forEach(([y, d], i) => { const tip = [46, y, 3.2 - 1.6*d];
    items.push({ box:[[LOW_X, y - 2, .8], [47, y + 2, 6]], svg:act(i === 0 ? 'pedal' : 'pedalOther', rod([LOW_X, y, 5.2], tip, 1.1, BRASS, toneI, .8) + box(43, y - 1.9, tip[2] - .7, 47, y + 1.9, tip[2] + .7, BRASS, toneI, .8)) }); });
  return items; }
function bench(m){ const X0 = 88, X1 = 112, Y0 = PW/2 - 26, Y1 = PW/2 + 26, items = [];
  for (const x of [X0 + 3, X1 - 3]) for (const y of [Y0 + 3, Y1 - 3]) items.push({ box:[[x - 1.5, y - 1.5, 0], [x + 1.5, y + 1.5, 44]], svg:box(x - 1.5, y - 1.5, 0, x + 1.5, y + 1.5, 44, DARK, toneI, .9) });
  items.push({ box:[[X0, Y0, 44], [X1, Y1, 50]], svg:box(X0, Y0, 44, X1, Y1, 47, DARK, toneI, 1.1) + box(X0 + .5, Y0 + .5, 47, X1 - .5, Y1 - .5, 50, FELTR, toneI, 1.2) });
  return items; }

/* ---------- see-through: the real action, per note ---------- */
const NY = n => KY1 - (n + .5)*(KY1 - KY0)/88;
const STR_X = 9.5, BUTT = [16, 94], SHANK = 19.5, STRIKE_Z = 94 + 19.2;
const lineP = (pts, col, w) => `<path d="${pd(pts, false)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
function mech(st){ const parts = [], put = (b, svg) => parts.push({ box:b, svg }), asc = vis([0, 1, 0]), idx = [...KEYS.keys()]; if (asc) idx.reverse();
  const now = performance.now()/1000;
  // back: soundboard with its ribs, bridges on it
  { let s = box(3, 8, 12, 5, PW - 8, PH - 4, WOODM, toneI, 1); for (let i = 0; i < 9; i++){ const y = 16 + i*15; s += lineP([[5.05, y, 14], [5.05, y + 8, PH - 6]], mix(WOODM.m, '#000000', .3), .7); }
    put([[3, 8, 12], [5, PW - 8, PH - 4]], vis([1, 0, 0]) ? s : `<g opacity=".22">${s}</g>`); }
  put([[5, 28, 18], [7, 130, 110]], box(5, 90, 18, 7, 96, 60, WOODM, toneI, .7) + rod([6, 26, 30], [6, 86, 74], 1.1, WOODM, toneI, .7));
  // the iron plate, four bars and a strut
  { let s = box(7, 8, 116, 8.6, PW - 8, PH - 3, IRON, toneI, 1) + box(7, 8, 12, 8.6, PW - 8, 21, IRON, toneI, 1) + box(7, 8, 12, 8.6, 14, PH - 3, IRON, toneI, 1) + box(7, PW - 14, 12, 8.6, PW - 8, PH - 3, IRON, toneI, 1) + rod([7.8, 92, 20], [7.8, 100, 118], .9, IRON, toneI, .7);
    put([[7, 8, 12], [8.6, PW - 8, PH - 3]], s); }
  // strings: tuning pin at the top, hitch pin at the bottom, bass crossing over the treble
  { let s = ''; for (const n of idx){ const yh = NY(n), bass = n < 22, top = yh + (bass ? -2 : 1.5), bot = yh + (bass ? -28 : 7), r = st.r[n], lit = r > .02;
      const col = lit ? '#ff6a2a' : bass ? COPPERM.m : '#a9b1b4', w = bass ? .55 + (22 - n)*.018 : .32, mid = yh + (top - yh)*.1 + (lit ? r*1.3*Math.sin(now*60 + n) : 0), xx = bass ? STR_X + .5 : STR_X;
      s += lineP([[xx, top, 123], [xx, mid, STRIKE_Z - 40], [xx, bot, 16]], col, lit ? w + .3 : w);
      s += fill(pd(on(PX(8.65), ellUV(top, 123, .3, .3, 6))), '#6d6a64'); }
    put([[STR_X - .4, 8, 14], [STR_X + 1, PW - 8, 125]], s); }
  // dampers: felt on the string, on a wire down to the action. Top 18 notes ring undamped, as on a real piano
  { let s = ''; for (const n of idx){ if (n >= 70) continue; const y = NY(n), lift = Math.max(keyDown(st, n), st.pedal), x0 = STR_X + 1 + lift*2.4, z0 = 118;
      s += lineP([[x0 + 1.2, y, z0], [x0 + 1.2 + 2, y, 98]], '#8d8a80', .25) + box(x0, y - .32, z0 - 1, x0 + 2.2, y + .32, z0 + 1.4, DARK, toneI, .25); }
    put([[STR_X + 1, 12, 96], [STR_X + 7, PW - 12, 120]], s); }
  // hammers on shanks. They swing back to the string; the one you played shows red
  { let s = ''; for (const n of idx){ const y = NY(n), h = hammerOf(st, n), a = (15 - 31*h)*Math.PI/180, ax = BUTT[0] + SHANK*Math.sin(a), az = BUTT[1] + SHANK*Math.cos(a), lit = h > .02, mm = lit ? FELTR : FELT, tz = n < 22 ? 1.7 : 1.15;
      s += lineP([[BUTT[0], y, BUTT[1]], [ax, y, az]], lit ? RED : '#c79a5e', .34);
      s += box(ax - 1.8, y - .32, az - tz, ax + 1.5, y + .32, az + tz, mm, toneI, .25); }
    put([[8, 12, 92], [24, PW - 12, 118]], s); }
  // the rails
  put([[14, KY0 - 2, 90], [18, KY1 + 2, 95]], rod([16, KY0 - 2, 92.5], [16, KY1 + 2, 92.5], 1.5, WOODM, toneI, .9));
  put([[19, KY0 - 2, 94], [22, KY1 + 2, 97]], rod([20.5, KY0 - 2, 95.5], [20.5, KY1 + 2, 95.5], .9, METAL, toneI, .7));
  put([[14, KY0 - 2, 97.5], [17, KY1 + 2, 100]], rod([15.5, KY0 - 2, 98.5 + st.pedal*.6], [15.5, KY1 + 2, 98.5 + st.pedal*.6], .55, st.pedal > .1 ? COPPERM : METAL, toneI, .6));
  // wippens and jacks: lifted by the capstan at the back of each key lever
  { let s = ''; for (const n of idx){ const k = KEYS[n], y = NY(n), d = keyDown(st, n), lift = d*2.2, lit = d > .02, col = lit ? RED : '#9c9587';
      s += lineP([[24, y, 69.5 + lift], [24, y, 86 + lift], [18, y, 92 + lift*.4]], col, .28); }
    put([[17, 12, 69], [25, PW - 12, 94]], s); }
  // key levers, tipping on the balance rail: the visible key is the front of one of these
  { let s = ''; for (const n of idx){ const k = KEYS[n], cy = (k.y0 + k.y1)/2, y = NY(n), d = keyDown(st, n), zb = KZ - .6 + d*2.2*.5, lit = d > .02;
      s += lineP([[KX0, cy, KZ - .7 - d*.1], [24, y, zb]], lit ? RED : '#c8ba92', lit ? .6 : .34); }
    put([[24, 12, 66], [KX0, PW - 12, 70]], s); }
  put([[41, KY0 - 2, 62], [43, KY1 + 2, 66.6]], box(41, KY0 - 2, 62, 43, KY1 + 2, 66.6, DARK, toneI, .8));
  put([[22, KY0 - 2, 62], [46, KY1 + 2, 65]], box(22, KY0 - 2, 62, 46, KY1 + 2, 64, WOODM, toneI, .7));
  // the sustain pedal's trap lever and rod
  { const y = 68, d = st.pedal, col = d > .1 ? '#ff6a2a' : '#7c8389';
    parts.push({ box:[[20, y - 2, 4], [LOW_X, y + 2, 99]], svg:lineP([[LOW_X, y, 5.2], [20, y, 8 + d*2.4]], INK, 2.1) + lineP([[LOW_X, y, 5.2], [20, y, 8 + d*2.4]], col, 1.2) + lineP([[20, y, 8 + d*2.4], [20, y, 62]], INK, 1.4) + lineP([[20, y, 8 + d*2.4], [20, y, 62]], col, .7) + lineP([[20, y, 66], [15.5, y, 98.5 + d*.6]], INK, 1.2) + lineP([[20, y, 66], [15.5, y, 98.5 + d*.6]], col, .6) }); }
  const last = st.last != null ? st.last : 40, ly = NY(last), lh = hammerOf(st, last), la = (15 - 31*lh)*Math.PI/180, sounding = st.r[last] > .03;
  MECH_ITEMS = [
    { at:[BUTT[0] + SHANK*Math.sin(la), ly, BUTT[1] + SHANK*Math.cos(la)], text:'HAMMER', on:lh > .02 },
    { at:[STR_X, ly, 60], text:'STRING', on:sounding },
    { at:[STR_X + 2, ly + 4, 118], text:'DAMPER', on:keyDown(st, last) > .02 || st.pedal > .1 },
    { at:[24, ly, 78], text:'WIPPEN', on:keyDown(st, last) > .02 },
    { at:[34, ly, KZ - .5], text:'KEY LEVER', on:keyDown(st, last) > .02 },
    { at:[42, KY0 - 2, 65], text:'BALANCE RAIL', on:false },
    { at:[7.8, 128, 124], text:'TUNING PINS', on:false },
    { at:[8, PW - 10, 60], text:'IRON PLATE', on:false },
    { at:[5, 34, 30], text:'SOUNDBOARD', on:sounding },
    { at:[20, 68, 40], text:'PEDAL ROD', on:st.pedal > .1 } ];
  return byDepth(parts); }
let MECH_ITEMS = [];

/* ---------- the scene ---------- */
function scene(st, m){ const k = ease(st.xr || 0), FRONT = vis([1, 0, 0]);
  const outline = [[0, 0, 0], [68, 0, 0], [68, PW, 0], [0, PW, 0], [0, 0, PH + 2], [CASE_X, 0, PH + 2], [CASE_X, PW, PH + 2], [0, PW, PH + 2]];
  let s = castShadow(outline);
  const ks = keyboard(st, m), fb = fallboard(st, m), sh = sheet(st), panels = panelLines(m);
  const shell = caseParts(st, m), pedalItems = pedals(st);
  const benchItems = bench(m);
  const fbItem = { box:[[CASE_X, 8, KZ], [KX0, PW - 8, 79]], svg:fb };
  const sheetItem = { box:[[CASE_X + .5, SH_Y1 - SH_W, SH_Z0], [SH_X0 + .2, SH_Y1, SH_Z0 + SH_H]], svg:sh };
  if (k <= 0){
    const keysItem = { box:[[KX0, KY0, KZ - 2.4], [KX1 + .9, KY1, KZ + 1.3]], svg:ks };
    s += byDepth([...shell, { box:[[CASE_X, 11, 83], [CASE_X + .06, PW - 11, PH - 4]], svg:panels }, fbItem, sheetItem, keysItem, ...pedalItems, ...benchItems]);
    return s; }
  // see-through: case and sheet go to ghosts, the action is drawn solid over them, the keys stay real
  const ghost = byDepth([...shell, fbItem, sheetItem, ...benchItems]);
  s += `<g opacity="${f(1 - .68*k)}">${ghost}</g>`;
  const inside = `<g opacity="${f(k)}">${mech(st)}</g>`;
  s += FRONT ? inside + ks + byDepth(pedalItems) : byDepth(pedalItems) + ks + inside;
  if (k > .6) s += xrCallouts(MECH_ITEMS, [0, 68, 0, PW, 0, PH]);
  return s; }

/* ---------- sound: built only on a press, so the page is silent until someone plays ---------- */
let AC = null, MASTER = null;
function audio(){ if (!AC){ AC = new (window.AudioContext || window.webkitAudioContext)(); MASTER = AC.createDynamicsCompressor(); const g = AC.createGain(); g.gain.value = .75; MASTER.connect(g); g.connect(AC.destination); } if (AC.state === 'suspended') AC.resume(); return AC; }
const VOICES = new Map();
function thump(ctx, t, level, freq){ const n = Math.floor(ctx.sampleRate*.05), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random()*2 - 1)*(1 - i/n);
  const src = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), g = ctx.createGain(); src.buffer = buf; lp.type = 'lowpass'; lp.frequency.value = freq; g.gain.value = level; src.connect(lp); lp.connect(g); g.connect(MASTER); src.start(t); }
function playNote(midi, dead){ const ctx = audio(), t = ctx.currentTime + .004;
  if (dead){ thump(ctx, t, .5, 300); return; }
  const f0 = 440*Math.pow(2, (midi - 69)/12), bright = Math.max(.15, Math.min(1, (midi - 24)/60)), decay = Math.max(.9, 7.5 - (midi - 24)*.095), out = ctx.createGain(), lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(Math.min(11000, f0*7 + 1400), t); lp.frequency.exponentialRampToValueAtTime(Math.min(5000, f0*2.5 + 500), t + decay*.5);
  out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(.62, t + .004); out.gain.exponentialRampToValueAtTime(.3, t + .25); out.gain.exponentialRampToValueAtTime(.002, t + decay);
  out.connect(lp); lp.connect(MASTER);
  const B = .00012*Math.pow(2, (midi - 60)/24), oscs = [];
  // three slightly detuned strings per note, partials stretched by the string's stiffness
  for (const det of [-.00028, 0, .00034]) for (let p = 1; p <= 7; p++){ const fr = f0*p*Math.sqrt(1 + B*p*p)*(1 + det); if (fr > 15000) continue;
    const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = fr; g.gain.setValueAtTime(Math.pow(p, -1.15)*(p === 1 ? 1 : .35 + .65*bright)/3, t); if (p > 1) g.gain.exponentialRampToValueAtTime(.0005, t + decay/Math.pow(p, .6)); o.connect(g); g.connect(out); o.start(t); o.stop(t + decay + .1); oscs.push(o); }
  thump(ctx, t, .12 + .1*bright, 900 + f0);
  VOICES.set(midi, out); return out; }
function damp(midi){ const out = VOICES.get(midi); if (!out || !AC) return; const t = AC.currentTime; out.gain.cancelScheduledValues(t); out.gain.setTargetAtTime(.0001, t, .16); VOICES.delete(midi); }

/* ---------- playing ---------- */
let ui, loopOn = false;
const HOLD_RELEASE = 300;
function runLoop(){ if (loopOn) return; loopOn = true;
  ui.animate(dt => { const st = ui.st, ms = dt*1000; let busy = false;
    for (let n = 0; n < 88; n++){
      if (st.e[n] != null){ const before = st.e[n]; st.e[n] += ms; if (st.held === n && st.e[n] > HOLD_RELEASE - 1) st.e[n] = HOLD_RELEASE - 1; if (before < HOLD_RELEASE && st.e[n] >= HOLD_RELEASE && !st.pedal) { damp(KEYS[n].midi); st.dampT[n] = 1; } if (st.e[n] >= 520) st.e[n] = null; else busy = true; }
      if (st.r[n] > 0){ const fall = st.pedal || st.e[n] != null && st.e[n] < HOLD_RELEASE || !st.dampT[n] ? .55 : 6; st.r[n] = Math.max(0, st.r[n] - dt*fall*st.r[n] - dt*.02); if (st.r[n] > .02) busy = true; else st.r[n] = 0; }
    }
    loopOn = busy; return busy; }); }
function pressKey(st, n){ const k = KEYS[n], dead = k.show && k.show.status === 'cancelled';
  st.e[n] = 0; st.dampT[n] = 0; st.last = n; if (!dead) st.r[n] = 1;
  playNote(k.midi, dead);
  if (k.show){ st.cur = k.show.i; st.page = k.show.page; st.off = false; } else { st.off = true; }
  runLoop(); }
function setPedal(st, on_){ st.pedal = on_ ? 1 : 0; if (!on_) for (const k of KEYS) if (st.e[k.n] == null || st.e[k.n] >= HOLD_RELEASE){ damp(k.midi); st.dampT[k.n] = 1; } runLoop(); }
function nextShow(st){ const i = (st.cur + 1) % SHOWS.length; pressKey(st, SHOWS[i].key.n); }

const shortDate = s => `${MON3[s.mm - 1]} ${s.dd}, ${s.yy}`;

ui = mountFigure({
  fig:'01', turn:'full', title:'Tour dates, for piano', size:[114, PW, PH + 2], center:[38, PW/2], palette:'tomato',
  state:{ xr:0, e:new Array(88).fill(null), r:new Array(88).fill(0), dampT:new Array(88).fill(0), cur:-1, page:0, pedal:0, off:false, last:null, held:null },
  scene,
  stats: st => { if (st.off) return [{ label:'This key', value:'Day off', small:true }];
    if (st.cur < 0) return [{ label:'Booked', value:`${SHOWS.length} shows`, small:true }];
    const s = SHOWS[st.cur], where = s.venue ? `${s.venue}` : `${s.region}`;
    return [{ label:s.status === 'cancelled' ? 'Cancelled' : shortDate(s), value:s.city, small:true }, { label:where, value:s.venue ? s.region : 'Venue to come', small:true }]; },
  buttons:[
    { label:'Next show', onClick:(st) => nextShow(st) },
    { label:'Turn the page', choices: st => PAGES.map((p, i) => ({ label:`${MON3[p.mm - 1]} ${p.yy}`, current:st.page === i, onClick:(s) => { s.page = i; } })) },
    { label:'Sustain pedal', onClick:(st) => setPedal(st, !st.pedal) },
  ],
  acts:{ key:(st, el) => { pressKey(st, +el.dataset.k); st.held = +el.dataset.k; }, note:(st, el) => { const n = SHOWS[+el.dataset.s].key.n; pressKey(st, n); st.held = n; }, pedal:(st) => setPedal(st, !st.pedal), pedalOther:() => {} },
  params:(st, q) => {
    if (q.has('page')) st.page = +q.get('page');
    if (q.has('hit')){ const n = +q.get('hit'); st.e[n] = 56; st.r[n] = 1; st.last = n; if (KEYS[n].show){ st.cur = KEYS[n].show.i; st.page = KEYS[n].show.page; } }
    if (q.has('cancel')) for (const s of SHOWS) if (s.city === q.get('cancel')) s.status = 'cancelled';
    if (q.get('pedal') === '1') st.pedal = 1;
  },
});
addEventListener('pointerup', () => { ui.st.held = null; }); addEventListener('pointercancel', () => { ui.st.held = null; });
xrMount(() => ui, () => '');

/* ---------- framing: a bigger stage than the engine's default, and turned closer to the front, so the keys can be played ---------- */
const VIEW_YAW = 20, VIEW_PITCH = 26;
{ const style = document.createElement('style'); style.textContent = '.stage,#fig,header,.controls,.made-with{max-width:1180px!important}@media (max-width:560px){.stats{flex-wrap:wrap;gap:4px 14px}.stat.small .v{font-size:16px!important}}'; document.head.appendChild(style);
  const svg = document.getElementById('fig'), q = new URLSearchParams(location.search);
  setCam(VIEW_YAW, VIEW_PITCH); OX = OY = 0;
  const pts = []; for (const x of [-3, 114]) for (const y of [0, PW]) for (const z of [0, PH + 2]) pts.push(P(x, y, z));
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), bw = Math.max(...xs) - Math.min(...xs), bh = Math.max(...ys) - Math.min(...ys);
  const A = innerWidth < 560 ? .95 : .62, vbW = Math.max(bw/.86, bh/.94/A), vbH = vbW*A;
  OX = (vbW - bw)/2 - Math.min(...xs); OY = (vbH - bh)*.5 - Math.min(...ys);
  svg.setAttribute('viewBox', `0 0 ${f(vbW)} ${f(vbH)}`);
  INK_K = vbW/INK_REF_VB; document.getElementById('fdefs').innerHTML = filterFor(INK_K); bakeNoise(svg);
  if (q.has('yaw') || q.has('pitch')) setCam(+(q.get('yaw') ?? VIEW_YAW), +(q.get('pitch') ?? VIEW_PITCH));
  document.getElementById('vreset').onclick = () => ui.camTo(VIEW_YAW, VIEW_PITCH);
  svg.parentElement.addEventListener('dblclick', e => { if (!e.target.closest('[data-act]')) { e.stopPropagation(); ui.camTo(VIEW_YAW, VIEW_PITCH); } }, true);
  ui.render(); }
