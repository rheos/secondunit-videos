// Look 3: the photocopied fact sheet (the couple), song 213.458333-240.916667, frames f5123-f5782.
// Every frame: draw the master paste-up (typed copy, rub-down heading, fineliner pictures) for song time t,
// copy it G(t) times through the xerox passes, print the last copy on coloured paper and look at it.
// Pure function of t: no Math.random, no Date, nothing carried between frames.
const out = document.getElementById('c'); out.width = W; out.height = H;
const g = out.getContext('2d');
const T0 = 213.458333, T1 = 240.916667;

// ---- words and times (all from source/lines.json via gen/leaflet_lines.js) ------------------------------
const LN = {}; LINES.forEach(l => { LN[l.i] = l; });
const wAt = (i, k) => { const ws = LN[i].words; return ws[k < 0 ? ws.length + k : k]; };
const ws = (i, k) => wAt(i, k).s;
const B = {
  now: ws(87, 0), couple: ws(87, 2), england: ws(87, 4), sick: ws(88, 4),
  p2: ws(89, 0), observing: ws(89, 1), king: ws(89, 3), tickWords: LN[90].words.map(w => w.s), ticked: ws(90, 5),
  p3: ws(91, 0), went: ws(91, 2), greenpeace: ws(91, 4),
  p4: ws(92, 0), made: ws(92, 2), fact: ws(92, 4), sheet: ws(92, 5),
  p5: ws(93, 0), stood: ws(93, 2), rain: ws(93, 5),
  p6: ws(94, 0), heat: ws(94, 5),
  p7: ws(95, 0), gave: ws(95, 2), truth: ws(95, 5), and2: ws(95, 6), did: ws(95, 8), free: ws(95, 11),
  p8: ws(96, 0), pileWords: LN[96].words.map(w => w.s), quick: ws(96, 4), quietly: ws(96, 7),
  p9: ws(97, 0), parents: ws(97, 5), told: ws(98, 1), stop: ws(98, 4),
  p10: ws(99, 0), king2: ws(99, 2), lawyers: ws(99, 5), cops: ws(100, 4),
};
const UP = s => s.toUpperCase();

// ---- generations: each copy event lands a new copy, a generation further from the master ------------------
const GENS = [{ t: T0, G: 1 }, { t: B.p5, G: 2 }, { t: B.p7, G: 3 }, { t: B.p8, G: 4 }, { t: B.quick, G: 5 }, { t: B.quietly, G: 6 }, { t: B.p10, G: 7 }];
const PAPER = [null, '#efebdf', '#f5e58f', '#f3e083', '#f1dc7c', '#f4bfcc', '#f2b7c6', '#efb0c0'];  // cream, then the yellow run, then the pink run
const PASS = [null, // per copy pass: how the sheet was laid on the glass (rot rad, dx, dy, scale) and how hard the drum bit
  { rot: -.0062, dx: -10, dy: 7, sc: .955, blur: 2.0, bright: .9, con: 5, edge: 2.2, sat: 2, satR: 4, satB: .543, satC: 2.3 },
  { rot: .0085, dx: 15, dy: -8, sc: 1.0, blur: 1.15, bright: .95, con: 7, sat: 1, satR: 2.5, satB: .58, satC: 1.46 },
  { rot: -.0068, dx: -17, dy: 10, sc: 1.0, blur: 1.15, bright: .95, con: 7, sat: 1, satR: 2.5, satB: .58, satC: 1.46 },
  { rot: .0058, dx: 9, dy: 12, sc: 1.0, blur: 1.2, bright: .95, con: 7, sat: 1, satR: 2.5, satB: .58, satC: 1.46 },
  { rot: -.0095, dx: -7, dy: -13, sc: 1.0, blur: 1.2, bright: .95, con: 7, sat: 1, satR: 2.5, satB: .58, satC: 1.46 },
  { rot: .0075, dx: 14, dy: 6, sc: 1.0, blur: 1.2, bright: .95, con: 7, sat: 1, satR: 2.5, satB: .58, satC: 1.46 },
  { rot: -.0048, dx: -11, dy: -6, sc: 1.0, blur: 1.25, bright: .95, con: 7, sat: 1, satR: 2.5, satB: .58, satC: 1.46 },
];

// ---- master layout (copy pixels, SW x SH) -------------------------------------------------------------
const MAST = { x: 130, base: 222, cap: 128 };
const PB = { x: 100, y: 255, w: PBW, h: PBH };
const TW = { x: 165, y: 662, h: 420, base: 728, pitch: 104, cap: 54, right: 1850 };
let FS = 94, ADV = 56, LFS = 178; // set from measured cap heights once fonts are in
let ROWS = [];                    // typed rows: {r, line, s, words: [{w, s, e, col, dt}]}

function layoutRows(m) {
  m.font = TYPE_FONT.replace('{s}', 100); FS = Math.round(TW.cap / (m.measureText('H').actualBoundingBoxAscent / 100) * 10) / 10;
  m.font = TYPE_FONT.replace('{s}', FS); ADV = m.measureText('M').width;
  m.font = LETRA_FONT.replace('{s}', 100); LFS = Math.round(MAST.cap / (m.measureText('H').actualBoundingBoxAscent / 100));
  const maxC = Math.floor((TW.right - TW.x) / ADV);
  ROWS = []; let r = 0;
  for (const l of LINES) {
    const words = l.words.map(w => ({ w: w.w, s: w.s, e: w.e }));
    const total = words.reduce((a, w) => a + w.w.length, 0) + words.length - 1;
    let breaks = [];
    if (total > maxC) { // two rows, balanced: the break that makes the longer row shortest
      let best = null;
      for (let k = 1; k < words.length; k++) {
        const a = words.slice(0, k).reduce((s, w) => s + w.w.length, 0) + k - 1, b = total - a - 1;
        if (a <= maxC && b <= maxC && (!best || Math.max(a, b) < best[1])) best = [k, Math.max(a, b)];
      }
      breaks = [best[0]];
    }
    const parts = []; let k0 = 0; for (const k of [...breaks, words.length]) { parts.push(words.slice(k0, k)); k0 = k; }
    for (const part of parts) {
      let col = 0;
      for (const w of part) { w.col = col; col += w.w.length + 1; w.dt = Math.min(.042, .75 * (w.e - w.s) / w.w.length); }
      ROWS.push({ r: r++, line: l.i, s: part[0].s, words: part });
    }
  }
}

// paper feed: the typed column moves up a row whenever a row past the fourth starts
function scrollPos(t) { let s = 0; for (const row of ROWS) if (row.r >= 4) s += smooth((t - (row.s - .2)) / .16); return s; }
const EARLY = .035; // a letter may land up to one frame before its onset

// key words that get a felt-marker underline (line, word index, double)
const UNDER = [[87, 4], [89, 3], [95, 5], [95, 11, true], [100, 4]];

function drawTyped(m, t) {
  const sp = scrollPos(t);
  m.save(); m.beginPath(); m.rect(0, TW.y, SW, TW.h); m.clip();
  m.textBaseline = 'alphabetic';
  for (const row of ROWS) {
    const slot = row.r - sp; if (slot < -1.05 || slot > 3.05 || t < row.s - EARLY) continue;
    const y = TW.base + slot * TW.pitch;
    for (const w of row.words) {
      for (let j = 0; j < w.w.length; j++) {
        if (t < w.s + j * w.dt - EARLY) break;
        strike(m, w.w[j], TW.x + (w.col + j) * ADV, y, FS, row.r * 101 + w.col + j);
      }
      const ui = UNDER.find(u => u[0] === row.line && LN[u[0]].words[u[1] < 0 ? LN[u[0]].words.length + u[1] : u[1]].s === w.s);
      if (ui) {
        const x0 = TW.x + w.col * ADV - 6, x1 = TW.x + (w.col + w.w.length) * ADV + 4, u = pr(t, w.s + .12, .22);
        marker(m, seg(x0, y + 16, x1, y + 12 + (rnd(row.r, 3) - .5) * 6, 10), u, 9, row.r * 7);
        if (ui[2]) marker(m, seg(x0 + 10, y + 32, x1 - 6, y + 30, 10), pr(t, w.s + .3, .2), 8, row.r * 9);
      }
    }
  }
  m.restore();
}

// ---- the picture box, panel by panel -------------------------------------------------------------------
const PANELS = [B.now, B.p2, B.p3, B.p4, B.p5, B.p7, B.p8, B.p9, B.p10];
const panelAt = t => { let i = 0; while (i + 1 < PANELS.length && PANELS[i + 1] <= t) i++; return i; };
const PIC = mkCanvas(PBW, PBH), pg = PIC.getContext('2d');

function stepCount(times, t) { let n = 0; for (const s of times) if (t >= s) n++; return n; }

function freeBurst(p, t) { // a rub-down starburst sticker, lands on the sung word and stays
  if (t < B.free - EARLY) return;
  const cx = 1640, cy = 104, R = 90, pts = [];
  for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU - Math.PI / 2, rr = i % 2 ? R * .74 : R; pts.push([cx + Math.cos(a) * rr * 1.25, cy + Math.sin(a) * rr]); }
  pen(p, pts, pr(t, B.free - EARLY, .12), 6, 77);
  const word = UP(wAt(95, 11).w), fs = 92, wd = letraWidth(p, word, fs);
  letraWord(p, word, cx - wd / 2, cy + 32, fs, t, B.free - EARLY, 0, 78, { rub: false });
}

function drawPicture(t) {
  const p = pg, pi = panelAt(t);
  p.setTransform(1, 0, 0, 1, 0, 0); p.fillStyle = '#fff'; p.fillRect(0, 0, PBW, PBH);
  if (pi === 0) { // England, the couple on it; fed up
    const mp = englandPts(860, 192, 350);
    pen(p, mp, pr(t, B.now - EARLY, 1.0), 5, 11, 2.2);
    if (t > B.now + .8) { // the cut at the border, dashed
      const a = mp[mp.length - 1], b = mp[0], n = 9;
      for (let k = 0; k < n; k += 2) pen(p, seg(lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n), lerp(a[0], b[0], (k + 1) / n), lerp(a[1], b[1], (k + 1) / n), 2), 1, 4, 30 + k);
    }
    for (let k = 0; k < 7; k++) { const x = 180 + (k % 3) * 120 + (k > 3 ? 1150 : 0), y = 90 + k * 45 % 260; pen(p, quad([x, y], [x + 22, y - 14], [x + 44, y], 8).concat(quad([x + 44, y], [x + 66, y + 14], [x + 88, y], 8)), pr(t, B.now + .5 + k * .06, .2), 4, 40 + k); }
    const sick = t >= B.sick - .05;
    couple(p, { x: 830, y: 322, h: 168, mouth: sick ? 'frown' : 'line', m: { armL: [sick ? .9 : .15, sick ? 2.2 : .1] }, w: { armR: [sick ? .9 : .15, sick ? 2.2 : .1] } }, pr(t, B.couple - EARLY, .5), 101);
    if (t >= B.england - EARLY) letraWord(p, UP(wAt(87, 4).w), 1180, 300, 104, t, B.england - EARLY, .045, 55);
    if (sick) { // a scribbled black cloud over their heads
      const sc = []; for (let i = 0; i <= 26; i++) { const v = i / 26, w2 = Math.sqrt(1 - Math.pow(2 * v - 1, 2)) * 120 + 10; sc.push([830 + (i % 2 ? w2 : -w2) + (rnd(i, 9) - .5) * 20, 34 + v * 70]); } // an angry scribble cloud
      pen(p, sc, pr(t, B.sick - .05, .3), 5, 66, 1.4);
      for (const [cx2, cy2, rr] of [[760, 62, 34], [830, 46, 42], [905, 64, 32]]) pen(p, ell(cx2, cy2, rr, rr * .8, Math.PI * .9, Math.PI * 2.1), pr(t, B.sick - .05, .25), 5, 68 + cx2);
    }
  } else if (pi === 1) { // the king inside a clock face, ticking; the couple watching
    const cx = 1080, cy = 196, R = 168;
    couple(p, { x: 470, y: GY, h: 250, look: 1, mouth: 'line' }, pr(t, B.p2 - EARLY, .45), 120);
    pen(p, ell(cx, cy, R, R), pr(t, B.observing - .05, .4), 6, 121);
    pen(p, ell(cx, cy, R - 14, R - 14), pr(t, B.observing + .1, .35), 3.5, 122);
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, u = pr(t, B.observing + .35 + k * .03, .05); pen(p, seg(cx + Math.cos(a) * (R - 16), cy + Math.sin(a) * (R - 16), cx + Math.cos(a) * (R - (k % 3 ? 34 : 50)), cy + Math.sin(a) * (R - (k % 3 ? 34 : 50)), 2), u, k % 3 ? 4 : 7, 130 + k); }
    const steps = stepCount(B.tickWords, t - .0), big = t >= B.ticked ? 2 : 0;
    const tilt = steps ? (steps % 2 ? 1 : -1) * (1 - .5 * pr(t, B.tickWords[steps - 1], .15)) : 0;
    king(p, cx, cy + R * .78, R * 1.32, pr(t, B.king - EARLY, .45), 140, { tilt, armL: .9 + .25 * tilt, armR: .9 - .25 * tilt });
    if (t > B.king + .3) { // hands from the centre: the minute hand steps with every sung word, big tick on the last
      const am = -Math.PI / 2 + (steps + big) * TAU / 12, ah = -Math.PI / 2 + 1.7 + steps * .08;
      pen(p, seg(cx, cy, cx + Math.cos(am) * R * .82, cy + Math.sin(am) * R * .82, 4), 1, 6, 150, .6);
      pen(p, seg(cx, cy, cx + Math.cos(ah) * R * .5, cy + Math.sin(ah) * R * .5, 4), 1, 8, 151, .6);
      p.fillStyle = '#000'; p.beginPath(); p.arc(cx, cy, 9, 0, TAU); p.fill();
    }
    if (t >= B.ticked - EARLY) for (let k = 0; k < 3; k++) for (const sd of [-1, 1]) { // tick marks: little arcs either side
      const rr = R + 24 + k * 22; pen(p, ell(cx, cy, rr, rr, Math.PI / 2 - sd * (Math.PI / 2) - .3 - (sd > 0 ? Math.PI : 0) + .0, Math.PI / 2 - sd * (Math.PI / 2) + .3 - (sd > 0 ? Math.PI : 0)), pr(t, B.ticked + k * .05, .1), 4.5, 160 + k + sd);
    }
  } else if (pi === 2) { // a door with a sign; they walk in
    const dx0 = 1180, dw = 190, dt0 = 62;
    const wall = [[0, 40], [PBW, 40]];
    pen(p, seg(0, GY, PBW, GY, 30), pr(t, B.p3 - EARLY, .25), 5, 170);
    pen(p, poly([[dx0 - 22, GY], [dx0 - 22, dt0 - 20], [dx0 + dw + 22, dt0 - 20], [dx0 + dw + 22, GY]]), pr(t, B.p3, .3), 6, 171);
    const open = ease(t, B.greenpeace + .45, B.greenpeace + .75), dwv = dw * (1 - .7 * open);
    pen(p, poly([[dx0, GY], [dx0, dt0], [dx0 + dwv, dt0 + 18 * open], [dx0 + dwv, GY - 10 * open]], true), pr(t, B.p3 + .05, .3), 5, 172);
    if (open > .02) hatch(p, [[dx0 + dwv, dt0 + 18 * open], [dx0 + dw, dt0], [dx0 + dw, GY], [dx0 + dwv, GY - 10 * open]], .9, 9, 1, 3, 173);
    p.fillStyle = '#000'; p.beginPath(); p.arc(dx0 + dwv * .82, 220, 9, 0, TAU); if (t > B.p3 + .3) p.fill();
    for (let k = 0; k < 2; k++) pen(p, poly([[dx0 + dwv * .18, dt0 + 30 + k * 130], [dx0 + dwv * .82, dt0 + 30 + k * 130], [dx0 + dwv * .82, dt0 + 120 + k * 130], [dx0 + dwv * .18, dt0 + 120 + k * 130]], true), pr(t, B.p3 + .2 + k * .05, .2), 3.5, 174 + k);
    for (let k = 0; k < 14; k++) { const bx = 1460 + (k % 4) * 80 + (Math.floor(k / 4) % 2) * 40, by = 80 + Math.floor(k / 4) * 60; pen(p, poly([[bx, by], [bx + 70, by], [bx + 70, by + 46], [bx, by + 46]], true), pr(t, B.p3 + .2 + k * .02, .1), 3.5, 180 + k); }
    for (let k = 0; k < 8; k++) { const bx = 40 + (k % 4) * 80 + (Math.floor(k / 4) % 2) * 40, by = 90 + Math.floor(k / 4) * 60; pen(p, poly([[bx, by], [bx + 70, by], [bx + 70, by + 46], [bx, by + 46]], true), pr(t, B.p3 + .3 + k * .02, .1), 3.5, 200 + k); }
    // the sign: a board on the wall, hand-lettered with the word as sung
    const sx = 700, sy = 14, sw2 = 440, sh2 = 100;
    pen(p, poly([[sx, sy], [sx + sw2, sy - 4], [sx + sw2, sy + sh2], [sx, sy + sh2 + 3]], true), pr(t, B.p3 + .1, .25), 5, 210);
    if (t >= B.greenpeace - EARLY) {
      const word = wAt(91, 4).w; p.save(); const fs = fitText(p, word, sw2 - 50, 76, HAND_FONT); p.fillStyle = '#000'; p.textBaseline = 'alphabetic';
      let x = sx + 20; for (let i = 0; i < word.length; i++) { const cw = p.measureText(word[i]).width; if (t >= B.greenpeace - EARLY + i * .035) { p.save(); p.translate(x, sy + sh2 * .7 + (rnd(i, 4) - .5) * 5); p.rotate((rnd(i, 5) - .5) * .06); p.fillText(word[i], 0, 0); p.restore(); } x += cw; }
      p.restore();
    }
    // the couple walk in from the left
    const u = ease(t, B.went - .1, B.greenpeace + .5), x = lerp(330, 980, u) + (open > .5 ? (dx0 + 40 - 980) * ease(t, B.greenpeace + .6, B.greenpeace + 1.4) : 0);
    const walking = u > 0 && u < 1 || (t > B.greenpeace + .6);
    couple(p, { x, y: GY, h: 238, look: 1, facing: 1, m: { stride: walking ? t * 9 : 0 }, w: { stride: walking ? t * 9 + Math.PI : 0 } }, pr(t, B.p3 - EARLY, .4), 220);
  } else if (pi === 3) { // the copier: they make the fact sheet; the lid comes down on the sung word
    copier(p, 1000, GY, 1.3, pr(t, B.p4 - EARLY, .45), ease(t, B.sheet, B.sheet + .15), t > B.sheet + .12 ? .6 + .4 * Math.sin((t - B.sheet) * 40) : 0, 230);
    couple(p, { x: 520, y: GY, h: 250, look: 1, m: { armR: [1.3, .2] }, w: { holdR: true, armR: [.6, .4] } }, pr(t, B.p4 - EARLY, .4), 240);
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 241);
  } else if (pi === 4) { // the street: rain, then heat, same spot
    const heatOn = t >= B.p6;
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 250);
    pen(p, seg(0, GY - 26, PBW, GY - 26, 30), pr(t, B.p5 - EARLY, .3), 4, 251);
    for (let k = 0; k < 22; k++) { const bx = (k % 11) * 165 + (Math.floor(k / 11) % 2) * 80, by = 38 + Math.floor(k / 11) * 56; pen(p, poly([[bx, by], [bx + 150, by], [bx + 150, by + 50], [bx, by + 50]], true), pr(t, B.p5 + k * .015, .1), 3, 260 + k); }
    pen(p, seg(1480, GY, 1480, 60, 10), pr(t, B.p5 + .1, .25), 7, 290); pen(p, poly([[1440, 60], [1520, 60], [1505, 20], [1455, 20]], true), pr(t, B.p5 + .25, .15), 5, 291);
    const fan = heatOn ? Math.sin((t - B.p6) * 14) : 0;
    couple(p, { x: 820, y: GY, h: 255, mouth: heatOn && t > B.heat ? 'o' : 'line', m: { holdL: true, armL: heatOn ? [1.0, .5] : [1.15, .25], hunch: heatOn ? 0 : 1 }, w: { holdR: true, armR: heatOn ? [1.9 + .25 * fan, 1.3] : [1.15, .25], hunch: heatOn ? 0 : 1 } }, pr(t, B.p5 - EARLY, .4), 300);
    if (!heatOn) { // rain, heavier on the sung word; rings in the puddles
      const dens = lerp(.3, 1, ease(t, B.stood, B.rain)), n = 90;
      for (let i = 0; i < n * dens; i++) {
        const x = rnd(i, 1) * (PBW + 200) - 100, ph = rnd(i, 2) * 480, y = ((ph + t * 1500) % 480) - 70 + 20;
        pen(p, seg(x - y * .2, y, x - y * .2 - 9, y + 36, 2), 1, 3.5, null);
      }
      for (let i = 0; i < 7; i++) { const cyc = .6, ph = (t * 1 / cyc + rnd(i, 7)) % 1, x = 120 + rnd(i, 8) * 1560; pen(p, ell(x, GY - 10, 14 + ph * 40, 4 + ph * 9), 1, 3, null); }
    } else { // heat: a sun on the sung word, wavy air off the pavement
      const sx = 1660, sy = 100, rr = 52, u = pr(t, B.heat - EARLY, .2);
      pen(p, ell(sx, sy, rr, rr), u, 6, 310);
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU + (t - B.heat) * .6; pen(p, seg(sx + Math.cos(a) * (rr + 14), sy + Math.sin(a) * (rr + 14), sx + Math.cos(a) * (rr + 46 + (k % 2) * 16), sy + Math.sin(a) * (rr + 46 + (k % 2) * 16), 2), pr(t, B.heat + .05 + k * .015, .06), 5, 311 + k); }
      for (let k = 0; k < 6; k++) { const x = 250 + k * 250, w2 = []; for (let i = 0; i <= 14; i++) w2.push([x + Math.sin(i * .9 + t * 8 + k) * 10, GY - 40 - i * 9]); pen(p, w2, pr(t, B.p6 + .15 + k * .05, .3), 3.5, null); }
    }
  } else if (pi === 5) { // hand to hand along a row of mittens
    const xs = [190, 470, 750, 1030, 1310, 1590], passes = [B.gave, B.truth, B.and2, B.did, B.free];
    const k = stepCount(passes, t), u = k ? ease(t, passes[k - 1], passes[k - 1] + .16) : 1;
    const wy = i => 252 - (i === k ? 26 * (1 - .6 * pr(t, (passes[k - 1] || B.p7) + .16, .3)) : 0);
    for (let i = 0; i < 6; i++) { // a row of raised arms, each sleeve up from the bottom, mitten up
      const lean = (i - 2.5) * .06, wx = xs[i], y0 = wy(i), items = [], a = -Math.PI / 2 + lean, L = 78;
      const nx = -Math.sin(a), ny = Math.cos(a);
      items.push({ p: seg(wx - 34, y0 + 4, wx - 44 - lean * 200, PBH + 30, 5), w: 5 }, { p: seg(wx + 34, y0 + 4, wx + 44 - lean * 200, PBH + 30, 5), w: 5 });
      mitten(items, wx, y0, a, L / .13, 5, false, i % 2 ? 1 : -1);
      items.push({ p: seg(wx - 36, y0 + 18, wx + 36, y0 + 18, 3), w: 4 });
      drawSet(p, items, pr(t, B.p7 - EARLY + i * .05, .3), 330 + i * 9);
    }
    const ky = i => wy(i) - 100, a0 = xs[Math.max(0, k - 1)], b0 = xs[k];
    const lx = k ? lerp(a0, b0, u) : xs[0], ly = (k ? lerp(ky(k - 1), ky(k), u) : ky(0)) - Math.sin(u * Math.PI) * 60;
    if (t > B.p7 + .1) { // the leaflet, held up between mittens: a sheet with a heading bar and typed lines
      p.save(); p.translate(lx, ly); p.rotate(Math.sin(u * Math.PI) * .35 * (k % 2 ? 1 : -1));
      p.fillStyle = '#fff'; p.fillRect(-58, -76, 116, 152);
      pen(p, poly([[-58, -76], [58, -78], [58, 76], [-58, 77]], true), 1, 5, 360);
      p.fillStyle = '#000'; p.fillRect(-44, -62, 88, 22);
      for (let j = 0; j < 6; j++) pen(p, seg(-42, -22 + j * 17, 40 - (j === 5) * 30, -22 + j * 17, 3), 1, 4, 361 + j);
      p.restore();
    }
    freeBurst(p, t);
  } else if (pi === 6) { // the copier runs; the pile grows a sheet per sung word
    copier(p, 360, GY, 1.05, 1, 1, .6 + .4 * Math.sin(t * 30), 400);
    couple(p, { x: 1420, y: GY, h: 230, look: -1, m: { holdR: true, armR: [1.0, .5] }, w: { holdL: true, armL: [1.0, .5] } }, 1, 420);
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 401);
    const n = stepCount(B.pileWords, t + EARLY);
    for (let i = 0; i < n; i++) {
      const fly = pr(t, B.pileWords[i] - EARLY, .16), y = GY - 8 - i * 17, rot = (rnd(i, 3) - .5) * .12, x = 980 + (rnd(i, 4) - .5) * 40;
      const fx = lerp(560, x, fly), fy = lerp(150, y, fly) - Math.sin(fly * Math.PI) * 120;
      p.save(); p.translate(fx, fy); p.rotate(rot + (1 - fly) * 1.2);
      p.fillStyle = '#fff'; p.beginPath(); p.moveTo(-170, 0); p.lineTo(110, 0); p.lineTo(170, -22); p.lineTo(-110, -22); p.closePath(); p.fill();
      pen(p, poly([[-170, 0], [110, 0], [170, -22], [-110, -22]], true), 1, 4.5, 410 + i);
      p.restore();
    }
    freeBurst(p, t);
  } else if (pi === 7) { // the parents: told them to stop
    const told = t >= B.told - EARLY, up = ease(t, B.stop - EARLY, B.stop + .1);
    couple(p, { x: 900, y: GY, h: 200, mouth: 'line', look: 0 }, pr(t, B.p9 - EARLY, .35), 500);
    const arm = [lerp(.15, 2.55, up), lerp(.1, -.4, up), up > .5];
    person(p, { x: 400, y: GY, h: 320, woman: true, bun: true, glasses: true, cardigan: true, look: 1, mouth: told ? 'o' : 'line', armR: arm, facing: 1 }, pr(t, B.parents - EARLY, .5), 510);
    person(p, { x: 1400, y: GY, h: 335, bald: true, glasses: true, look: -1, mouth: told ? 'o' : 'line', armL: arm, facing: -1 }, pr(t, B.parents + .1, .5), 520);
    if (told) for (const [mx, sd] of [[470, 1], [1330, -1]]) for (let k = 0; k < 3; k++) pen(p, poly([[mx + sd * 10, 70 + k * 22], [mx + sd * 40, 62 + k * 26], [mx + sd * 30, 78 + k * 26], [mx + sd * 62, 70 + k * 30]]), pr(t, B.told + k * .06, .12), 4, 530 + k + sd);
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 540);
  } else { // the couple with their leaflets; the shadows come down over them (glass objects, see glassAt)
    couple(p, { x: 980, y: GY, h: 255, look: -1, mouth: t > B.cops ? 'o' : 'line', m: { holdR: true, armR: [1.2, .3] }, w: { holdL: true, armL: [1.0, .3] } }, pr(t, B.p10 - EARLY, .4), 600);
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 601);
  }
}

// Things lying on the glass of the last copy: rain on the glass, the king's and lawyers' shadows.
function glassAt(t) {
  if (t >= B.rain - EARLY && t < B.heat + .5) {
    return (A) => {
      const dry = 1 - ease(t, B.p6 + .2, B.heat + .4);
      for (let i = 0; i < 16; i++) {
        if (t < B.rain - EARLY + i * .025) continue;
        const x = 120 + rnd(i, 21) * 1760, y = 70 + rnd(i, 22) * 520, r = (14 + rnd(i, 23) * 30) * (.25 + .75 * dry);
        if (r < 5) continue;
        A.fillStyle = 'rgba(0,0,0,.55)'; A.beginPath(); A.ellipse(x, y, r, r * .92, rnd(i, 24) * 3, 0, TAU); A.fill();
        A.fillStyle = 'rgba(255,255,255,.75)'; A.beginPath(); A.ellipse(x - r * .12, y - r * .1, r * .7, r * .62, 0, 0, TAU); A.fill();
        A.fillStyle = '#000'; A.beginPath(); A.arc(x + r * .35, y + r * .4, r * .22, 0, TAU); A.fill();
      }
    };
  }
  if (t >= B.king2 - EARLY) {
    return (A) => {
      A.save(); A.beginPath(); A.rect(0, 0, SW, 632); A.clip();
      const u = easeOutBack(pr(t, B.king2 - EARLY, .32), 1.1);
      A.save(); A.translate(lerp(-520, 0, u), lerp(-260, 0, u)); kingSil(A, 400, 905, 560); A.restore();
      for (let k = 0; k < 3; k++) {
        const v = easeOutBack(pr(t, B.lawyers - EARLY + k * .09, .26), 1.2);
        A.save(); A.translate(0, lerp(420, 0, v)); lawyerSil(A, 1430 + k * 170, 690 - (k % 2) * 30, 400 - k * 10); A.restore();
      }
      A.restore();
    };
  }
  return null;
}

// ---- the master paste-up --------------------------------------------------------------------------------
const MS = mkCanvas(SW, SH), mg = MS.getContext('2d');
function drawMaster(t) {
  const m = mg; m.setTransform(1, 0, 0, 1, 0, 0); m.globalAlpha = 1; m.globalCompositeOperation = 'source-over'; m.filter = 'none';
  m.fillStyle = '#fff'; m.fillRect(0, 0, SW, SH);
  drawTyped(m, t);
  // picture box (a pasted-on panel: its own edge shows faintly on the copy), heat shimmer in the heat
  drawPicture(t);
  m.save(); m.translate(PB.x, PB.y);
  m.strokeStyle = 'rgba(0,0,0,.45)'; m.lineWidth = 1.6; m.strokeRect(-14, -12, PBW + 28, PBH + 22);
  const shim = t >= B.p6 && t < B.p7 ? .4 + .6 * ease(t, B.p6, B.heat) : 0;
  if (shim > 0) { for (let y = 0; y < PBH; y += 6) m.drawImage(PIC, 0, y, PBW, 6, Math.sin(y * .045 + t * 11) * 7 * shim, y, PBW, 6); }
  else m.drawImage(PIC, 0, 0);
  pen(m, poly([[0, 0], [PBW, 0], [PBW, PBH], [0, PBH]], true), pr(t, T0 - .1, .4), 6, 900, 1.2);
  m.restore();
  // masthead: rub-down heading on the sung words, a double rule under it
  if (t >= B.p4 - EARLY) {
    pen(m, seg(MAST.x, 240, 1880, 236, 30), pr(t, B.p4 - EARLY, .35), 5, 910); pen(m, seg(MAST.x, 248, 1880, 245, 30), pr(t, B.p4 + .05, .35), 3, 911);
    const w1 = UP(wAt(92, 4).w), w2 = UP(wAt(92, 5).w), dt = .055;
    const a = letraWord(m, w1, MAST.x, MAST.base, LFS, t, B.fact - EARLY, dt, 920);
    const x2 = a.x1 + LFS * .28; const b = letraWord(m, w2, x2, MAST.base, LFS, t, B.sheet - EARLY, dt, 930);
    // the hand with the burnisher, rubbing the letter going down
    const tEnd = B.sheet + w2.length * dt + .1;
    if (t > B.made && t < tEnd + .5) {
      let tx;
      const cur = t < B.sheet - EARLY ? a.chars[Math.min(w1.length - 1, Math.max(0, Math.floor((t - B.fact) / dt)))] : b.chars[Math.min(w2.length - 1, Math.max(0, Math.floor((t - B.sheet) / dt)))];
      tx = (cur[0] + cur[1]) / 2 + Math.sin(t * 70) * 10;
      const come = ease(t, B.made, B.fact - .05), go = ease(t, tEnd, tEnd + .4);
      const hx = lerp(2300, tx, come) + go * 900, hy = MAST.base - 50;
      m.save(); m.translate(hx, hy); // burnisher tip at (0,0); a mitten grips it; the sleeve runs up off the top of the sheet
      const wx = 150, wy2 = -70, ang = Math.atan2(-wy2, -wx), items = [];
      m.fillStyle = '#fff'; fillPoly(m, [[wx - 10, wy2 - 42], [wx + 14, wy2 + 40], [720, -10], [720, -150]]);
      items.push({ p: seg(2, 0, 88, -42, 4), w: 8, amp: .5 });
      items.push({ p: seg(wx - 10, wy2 - 42, 720, -150, 10), w: 5.5 }, { p: seg(wx + 14, wy2 + 40, 720, -10, 10), w: 5.5 });
      items.push({ p: seg(wx + 4, wy2 - 46, wx + 26, wy2 + 42, 3), w: 5 });
      mitten(items, wx, wy2, ang, 95 / .13, 5.5, false, -1);
      drawSet(m, items, 1, 940);
      m.restore();
    }
  }
}

// ---- copies ------------------------------------------------------------------------------------------
const XG = [MS]; for (let k = 1; k <= 7; k++) XG.push(mkCanvas(SW, SH));
function genAt(t) { let G = 1, ts = T0; for (const e of GENS) if (t >= e.t - EARLY) { G = e.G; ts = e.t; } return [G, ts]; }

function makeCopies(t, f) {
  const [G] = genAt(t), pi = panelAt(t), f2 = Math.floor(f / 2);
  for (let k = 1; k <= G; k++) {
    const P = Object.assign({}, PASS[k]), last = k === G;
    if (k === 1) { P.rot += (rnd(pi, 61) - .5) * .003; P.dx += (rnd(pi, 62) - .5) * 8; P.dy += (rnd(pi, 63) - .5) * 6; } // re-laid on the glass for each new paste-up
    if (last) { P.dx += (rnd(f2, 64) - .5) * 1.4; P.dy += (rnd(f2, 65) - .5) * 1.4; P.rot += (rnd(f2, 66) - .5) * .0004; } // every copy sits a hair differently
    P.nIdx = last ? f2 % 8 : k * 3; P.nx = last ? rnd(f2, 67) * 1024 : k * 211; P.ny = last ? rnd(f2, 68) * 1024 : k * 157;
    xpass(XG[k - 1], XG[k], P, last ? glassAt(t) : null);
  }
  solidAreas(XG[G], .32, G, G * 50, G * 30);
  return G;
}

// ---- camera: framings on the copy, cut at panel changes ----------------------------------------------------
const CAMS = [
  { t: T0, c: [1000, 625], z: [1.06, 1.09] },
  { t: B.p2, c: [1004, 628], z: [1.08, 1.1] },
  { t: B.p3, c: [992, 616], z: [1.06, 1.08] },
  { t: B.p4, c: [1000, 562], z: [.965, .975] },
  { t: B.p5, c: [1000, 598], z: [1.0, 1.05] },
  { t: B.p7, c: [1000, 595], z: [1.04, 1.0] },
  { t: B.p8, c: [1000, 562], z: [.9, .915] },
  { t: B.p9, c: [1000, 608], z: [1.03, 1.06] },
  { t: B.p10, c: [1000, 560], z: [.965, .995] },
];
function camAt(t) { const [c, , i] = shotAt(CAMS, t - EARLY * 0); const nx = (CAMS[i + 1] || { t: T1 }).t, u = smooth((t - c.t) / (nx - c.t)); return { cx: c.c[0], cy: c.c[1], z: lerp(c.z[0], c.z[1], u) }; }

// the stack under the top copy: earlier copies, each lying a bit off
const UNDER_SHEETS = [{ dx: -70, dy: 34, r: -.024 }, { dx: 62, dy: -30, r: .018 }, { dx: -34, dy: -50, r: .012 }, { dx: 80, dy: 44, r: -.015 }, { dx: -48, dy: 58, r: .026 }];

function renderFrame(t) {
  const f = Math.round(t * 24);
  buildXerox();
  drawMaster(t);
  const G = makeCopies(t, f);
  const [, tsG] = genAt(t);
  const cam = camAt(t);
  const land = 1 + .028 * (1 - smooth((t - tsG) / .12)) * (tsG > T0 ? 1 : 0);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  // the desk under the copies
  const bg = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1200); bg.addColorStop(0, '#3a3631'); bg.addColorStop(1, '#1d1b19');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.cx, -cam.cy);
  if (cam.z < .99) { // earlier copies in the pile
    const n = Math.min(G - 1, t >= B.p8 - EARLY ? 4 : 1);
    for (let j = n; j >= 1; j--) {
      const k = G - j, us = UNDER_SHEETS[(k + 7) % UNDER_SHEETS.length];
      g.save(); g.translate(SW / 2 + us.dx, SH / 2 + us.dy); g.rotate(us.r); g.translate(-SW / 2, -SH / 2);
      g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 18; g.shadowOffsetY = 4; g.fillStyle = PAPER[k]; g.fillRect(0, 0, SW, SH); g.shadowColor = 'transparent';
      printCopy(g, XG[k], PAPER[k], .05, k * 40, k * 70); g.restore();
    }
  }
  g.save(); g.translate(SW / 2, SH / 2); g.scale(land, land); g.translate(-SW / 2, -SH / 2);
  g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 22; g.shadowOffsetY = 6; g.fillStyle = PAPER[G]; g.fillRect(0, 0, SW, SH); g.shadowColor = 'transparent';
  printCopy(g, XG[G], PAPER[G], .04 + G * .012, G * 40, G * 70);
  // a staple through the pile, top left (real metal, after the stack starts)
  if (t >= B.p8 - EARLY) {
    g.save(); g.translate(70, 64); g.rotate(-.62);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-36, 3, 74, 7);
    const sg = g.createLinearGradient(0, -4, 0, 4); sg.addColorStop(0, '#d8d8d4'); sg.addColorStop(.5, '#8d8d88'); sg.addColorStop(1, '#55554f');
    g.fillStyle = sg; g.fillRect(-38, -3, 76, 6); g.restore();
  }
  if (t >= B.cops - EARLY) drawStamp(g, t);
  g.restore();
  g.restore();
  drawGrain(g, t, .05);
}

// The red rubber stamp on the top copy: the king's seal, a crown in a double ring, inked unevenly.
const STAMP = mkCanvas(300, 300);
let stampMade = false;
function makeStamp() {
  const s = STAMP.getContext('2d'), c = 150; s.clearRect(0, 0, 300, 300);
  s.strokeStyle = s.fillStyle = '#000';
  s.lineWidth = 14; s.beginPath(); s.arc(c, c, 128, 0, TAU); s.stroke();
  s.lineWidth = 6; s.beginPath(); s.arc(c, c, 104, 0, TAU); s.stroke();
  s.beginPath(); s.moveTo(c - 62, c + 40); s.lineTo(c - 62, c - 30); s.lineTo(c - 31, c + 5); s.lineTo(c, c - 52); s.lineTo(c + 31, c + 5); s.lineTo(c + 62, c - 30); s.lineTo(c + 62, c + 40); s.closePath(); s.fill();
  s.fillRect(c - 66, c + 50, 132, 16);
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; s.beginPath(); s.arc(c + Math.cos(a) * 116, c + Math.sin(a) * 116, 4, 0, TAU); s.fill(); }
  // uneven ink: knock out specks and a dry side
  s.globalCompositeOperation = 'destination-out'; const R = mulberry(8080);
  for (let i = 0; i < 900; i++) { const a = R() * TAU, rr = R() * 140; s.globalAlpha = .4 + R() * .6; s.beginPath(); s.arc(c + Math.cos(a) * rr, c + Math.sin(a) * rr, .8 + R() * 2.4, 0, TAU); s.fill(); }
  const dg = s.createLinearGradient(0, 0, 300, 300); dg.addColorStop(0, 'rgba(0,0,0,0)'); dg.addColorStop(.75, 'rgba(0,0,0,0)'); dg.addColorStop(1, 'rgba(0,0,0,.65)');
  s.globalAlpha = 1; s.fillStyle = dg; s.fillRect(0, 0, 300, 300);
  s.globalCompositeOperation = 'source-in'; s.fillStyle = '#c4161c'; s.fillRect(0, 0, 300, 300);
  stampMade = true;
}
function drawStamp(g, t) {
  if (!stampMade) makeStamp();
  const u = pr(t, B.cops - EARLY, .09), sc = lerp(1.35, 1, u), al = u <= 0 ? 0 : .88;
  g.save(); g.translate(1700, 170); g.rotate(-.21); g.scale(sc, sc);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = al; g.drawImage(STAMP, -150, -150); g.restore();
}

const READY = (async () => {
  try { await Promise.all([document.fonts.load('100px "LetraBC"'), document.fonts.load('100px "Courier New"'), document.fonts.load('64px "Marker Felt"')]); } catch (e) { }
  layoutRows(mkCanvas(10, 10).getContext('2d'));
  buildXerox();
  return true;
})();
// Caption audit (debug only, draws nothing): for every frame, every line that must be readable (from its first
// onset to the later of the next line's start and 1.2 s after its last word) must sit whole inside the text window
// and inside the frame, with cap height >= 44 px. Returns violations and the smallest cap seen.
window.__audit = () => {
  const bad = [], C = [SW / 2, SH / 2]; let minCap = 1e9, minMargin = 1e9;
  const need = LINES.map((l, i) => [l.words[0].s - EARLY, Math.min(T1, Math.max(i + 1 < LINES.length ? LINES[i + 1].s : T1, l.words[l.words.length - 1].e + 1.2))]);
  const n = Math.round((T1 - T0) * 24);
  for (let fi = 0; fi < n; fi++) {
    const t = T0 + fi / 24, [G, tsG] = genAt(t), pi = panelAt(t), cam = camAt(t), sp = scrollPos(t);
    const land = 1 + .028 * (1 - smooth((t - tsG) / .12)) * (tsG > T0 ? 1 : 0);
    const map = (x, y) => { for (let k = 1; k <= G; k++) { const P = Object.assign({}, PASS[k]); if (k === 1) { P.rot += (rnd(pi, 61) - .5) * .003; P.dx += (rnd(pi, 62) - .5) * 8; P.dy += (rnd(pi, 63) - .5) * 6; }
        const ux = (x - C[0]) * P.sc, uy = (y - C[1]) * P.sc; x = C[0] + P.dx + ux * Math.cos(P.rot) - uy * Math.sin(P.rot); y = C[1] + P.dy + ux * Math.sin(P.rot) + uy * Math.cos(P.rot); }
      x = (x - C[0]) * land + C[0]; y = (y - C[1]) * land + C[1]; return [(x - cam.cx) * cam.z + W / 2, (y - cam.cy) * cam.z + H / 2]; };
    let sc = land * cam.z; for (let k = 1; k <= G; k++) sc *= PASS[k].sc; minCap = Math.min(minCap, TW.cap * sc);
    LINES.forEach((l, li) => {
      if (t < need[li][0] || t > need[li][1]) return;
      for (const row of ROWS.filter(r => r.line === l.i && t >= r.s - EARLY)) {
        const slot = row.r - sp, y = TW.base + slot * TW.pitch, last = row.words[row.words.length - 1], x1 = TW.x + (last.col + last.w.length) * ADV;
        if (slot < -.001 || slot > 3.001) { bad.push({ t: +t.toFixed(3), line: l.i, row: row.r, why: 'scrolled out', slot: +slot.toFixed(2) }); continue; }
        for (const [px, py] of [[TW.x, y - TW.cap - 6], [x1, y - TW.cap - 6], [TW.x, y + FS * .24], [x1, y + FS * .24]]) {
          const [sx, sy] = map(px, py), m = Math.min(sx, W - sx, sy, H - sy); minMargin = Math.min(minMargin, m);
          if (m < 10) bad.push({ t: +t.toFixed(3), line: l.i, row: row.r, why: 'off frame', sx: Math.round(sx), sy: Math.round(sy) });
        }
      }
    });
  }
  return { bad: bad.slice(0, 30), nBad: bad.length, minCap: +minCap.toFixed(1), minMargin: Math.round(minMargin) };
};
window.__rows = () => ROWS.map(r => ({ r: r.r, line: r.line, s: r.s, text: r.words.map(w => w.w).join(' '), FS, ADV }));
startPage(out, renderFrame, T0, T1, READY);
