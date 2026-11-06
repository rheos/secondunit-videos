// Court-sketch vocabulary: heads, wigs, robes, gowns, tables, paper stacks, panelling, bags, crowds.
// Everything records pastel strokes onto an Sk (see pastel.js). Coordinates are canvas px at 1920x1080.

const C = {
  ink: '#1b1a1f', umber: '#4a3226', oak: '#7a5233', oakL: '#a8794c', ochre: '#c99650', oakD: '#3b271c',
  red: '#b9302a', redL: '#de6a52', redD: '#6c1813',
  gown: '#1f2026', gownL: '#5d6371',
  wig: '#ece6d5', wigS: '#9b968a', wigD: '#6d695f',
  white: '#f7f4ec', cream: '#eee2c4', paperS: '#a9a59a',
  skin: '#d9a184', skinS: '#9a5f4a', skinL: '#f3cdae',
  green: '#3e6b53', greenL: '#78a083', greenD: '#24402f',
  blue: '#3a5b8e', blueL: '#86a2cb', navy: '#26324a', teal: '#2f6f73', tealL: '#69a3a3',
  gold: '#d8b04a', goldL: '#f3dc8c', goldD: '#8a6a22', sack: '#b89c6a', sackL: '#dcc596', sackD: '#6d5838',
  grey: '#5e656e', greyL: '#a7afb7', hair: '#3a2a22', hairL: '#7c5a40', auburn: '#7a3a24', sandy: '#a9845a',
  glow: '#cfe4f2', glowB: '#7fb3db', mouth: '#6f2c27',
};

function ovalPoly(x, y, rx, ry, n = 16, rot = 0, a0 = 0, a1 = 1) {
  const p = []; for (let i = 0; i < n; i++) { const u = (a0 + (a1 - a0) * i / (a1 === 1 && a0 === 0 ? n : n - 1)) * TAU, px = Math.cos(u) * rx, py = Math.sin(u) * ry; p.push([x + px * Math.cos(rot) - py * Math.sin(rot), y + px * Math.sin(rot) + py * Math.cos(rot)]); } return p;
}
function shadeHex(col, k) { const c = hex(col), d = k > 0 ? mix(c, [255, 255, 255], k) : mix(c, [0, 0, 0], -k); return '#' + d.map(v => Math.round(v).toString(16).padStart(2, '0')).join(''); }
const rectPoly = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

// loose construction lines the artist leaves in: light, quick, overshooting
function gesture(s, pts, col = C.white, a = .32, w = 2.2) { s.line(pts, w, col, a, PASS.LINE); }

// ---------- heads ----------
// o: turn (-1 left .. 1 right), tilt, hair ('short'|'bob'|'curly'|'bald'|'none'), hairCol, wig ('bar'|'judge'),
//    mouth ('flat'|'open'|'down'|'o'), glasses, back (seen from behind), beard, crown
function head(s, x, y, r, o = {}) {
  const sk = o.skin || C.skin, ss = o.skinS || C.skinS, sl = o.skinL || C.skinL, turn = o.turn || 0, hc = o.hairCol || C.hair;
  s.save(); s.translate(x, y); s.rotate(o.tilt || 0);
  const rx = r * .78, ry = r;
  if (r < 24) { // a head in a crowd: a dab of skin, a dab of hair or wig, eye dots
    if (o.back) { s.stick([[-r * .5, -r * .2], [r * .5, r * .1]], r * 1.6, hc, .95); s.restore(); return; }
    s.stick([[-r * .25, -r * .35], [r * .2, r * .45]], r * 1.35, sk, .9);
    s.stick([[r * .25, -r * .2], [r * .35, r * .5]], r * .5, ss, .7);
    if (o.wig) s.stick([[-r * .75, -r * .7], [r * .75, -r * .75]], r * .85, C.wig, .95);
    else if (o.hair !== 'bald') s.stick([[-r * .75, -r * .65], [r * .7, -r * .78]], r * .75, hc, .9);
    s.line([[-r * .3 + turn * r * .3, -r * .05], [-r * .1 + turn * r * .3, -r * .05]], r * .14, C.ink, .8);
    s.line([[r * .15 + turn * r * .3, -r * .05], [r * .33 + turn * r * .3, -r * .05]], r * .14, C.ink, .8);
    s.restore(); return;
  }
  if (o.back) { // back of the head: hair mass, ear, neck shadow
    s.ground(ovalPoly(0, 0, rx, ry, 18), hc, .85);
    s.hatch(ovalPoly(0, 0, rx * 1.02, ry * 1.02), -1.3, r * .14, r * .22, hc, .95, PASS.LAYIN, .1);
    s.hatch(ovalPoly(rx * .3, ry * .25, rx * .55, ry * .6), -1.2, r * .16, r * .18, shadeHex(hc, -.35), .7, PASS.LAYIN, .05);
    s.line([[-rx * .2, -ry * .9], [-rx * .6, -ry * .3], [-rx * .7, ry * .4]], r * .05, shadeHex(hc, .3), .7, PASS.LINE);
    s.line([[rx * .1, -ry * .95], [rx * .5, -ry * .2], [rx * .55, ry * .6]], r * .05, shadeHex(hc, -.4), .6, PASS.LINE);
    s.stick([[-rx * .5, -ry * .6], [-rx * .1, -ry * .8]], r * .16, o.hairL || C.hairL, .7, PASS.LIGHT);
    s.stick([[-rx * .95, ry * .1], [-rx * 1.0, ry * .35]], r * .18, sk, .9);
    s.restore(); return;
  }
  if (o.wig === 'judge') { // full-bottomed wig: long side lobes behind the face down to the shoulders
    for (const sd of [-1, 1]) {
      const lobe = [[sd * rx * .6, -ry * .55], [sd * rx * 1.55, -ry * .2], [sd * rx * 1.85, ry * .9], [sd * rx * 1.6, ry * 1.9], [sd * rx * .7, ry * 1.85], [sd * rx * .55, ry * .6]];
      s.blob(sd * rx * 1.15, ry * .7, rx * .6, ry * 1.1, C.wigS, .5);
      s.hatch(lobe, sd * .2 + Math.PI / 2, r * .16, r * .2, C.wig, .95, PASS.LAYIN, .1);
      for (let k = 0; k < 7; k++) for (let j = 0; j < 2; j++) { // rows of curls: little c-strokes
        const cx = sd * rx * (1.0 + j * .45), cy = -ry * .05 + k * ry * .27;
        s.oval(cx, cy, r * .16, r * .11, r * .05, C.wigD, .55, PASS.LINE, sd > 0 ? .05 : .55, sd > 0 ? .55 : 1.05);
      }
    }
  }
  // face: rubbed base, laid-in colour, shadow side, light
  s.blob(0, ry * .05, rx * .85, ry * .88, sk, .3);
  s.ground(ovalPoly(0, 0, rx * .96, ry * .96, 18), sk, .8);
  s.hatch(ovalPoly(0, 0, rx, ry, 18), -1.1, r * .17, r * .26, sk, .9, PASS.LAYIN, .12);
  const sx = rx * (.2 - turn * .35);
  s.hatch([[sx, -ry * .75], [rx * 1.02, -ry * .35], [rx * .98, ry * .45], [rx * .35, ry * 1.0], [sx - rx * .15, ry * .55]], -1.1, r * .15, r * .2, ss, .7, PASS.LAYIN, .08);
  s.stick([[-rx * .55, -ry * .6], [rx * .05, -ry * .68]], r * .16, sl, .85, PASS.LIGHT);
  s.stick([[-rx * .6, ry * .02], [-rx * .35, ry * .25]], r * .13, sl, .75, PASS.LIGHT);
  if (o.beard) { s.hatch([[-rx * .85, ry * .2], [rx * .85, ry * .2], [rx * .6, ry * 1.25], [0, ry * 1.5], [-rx * .6, ry * 1.25]], 1.4, r * .14, r * .2, o.beard, .9, PASS.LAYIN, .1); }
  // features shift toward where the head turns
  const fx = turn * rx * .42, ey = -ry * .1;
  s.line([[fx - rx * .62, ey - ry * .17], [fx - rx * .4, ey - ry * .23], [fx - rx * .12, ey - ry * .18]], r * .07, o.browCol || hc, .85);
  s.line([[fx + rx * .1, ey - ry * .18], [fx + rx * .38, ey - ry * .23], [fx + rx * .58, ey - ry * .16]], r * .07, o.browCol || hc, .85);
  s.line([[fx - rx * .5, ey], [fx - rx * .22, ey - ry * .015]], r * .075, C.ink, .9);
  s.line([[fx + rx * .16, ey - ry * .015], [fx + rx * .44, ey]], r * .075, C.ink, .9);
  s.line([[fx - rx * .02, ey + ry * .02], [fx + rx * .08, ry * .3], [fx - rx * .1, ry * .36]], r * .055, ss, .9);
  s.stick([[fx + rx * .1, ry * .05], [fx + rx * .16, ry * .3]], r * .1, ss, .5, PASS.LAYIN);
  // modelling: eye sockets rubbed in, warm cheeks, a light down the nose, shadow under the jaw
  s.blob(fx - rx * .36, ey + ry * .02, rx * .2, ry * .1, ss, .35);
  s.blob(fx + rx * .3, ey + ry * .02, rx * .2, ry * .1, ss, .35);
  s.stick([[fx - rx * .62, ry * .28], [fx - rx * .4, ry * .4]], r * .14, C.redL, .32, PASS.SCUMBLE);
  s.stick([[fx + rx * .38, ry * .28], [fx + rx * .58, ry * .4]], r * .14, C.redL, .28, PASS.SCUMBLE);
  s.line([[fx - rx * .02, -ry * .02], [fx + rx * .01, ry * .22]], r * .045, sl, .8, PASS.LIGHT);
  s.blob(0, ry * 1.02, rx * .55, ry * .1, ss, .4);
  s.line([[-rx * .9, -ry * .2], [-rx * .92, ry * .2], [-rx * .6, ry * .78]], r * .035, C.umber, .45);
  const my = ry * .58;
  if (o.mouth === 'open') { s.oval(fx, my, rx * .2, ry * .1, r * .07, C.mouth, .9); s.stick([[fx - rx * .1, my], [fx + rx * .1, my]], r * .1, C.mouth, .8); }
  else if (o.mouth === 'down') s.line([[fx - rx * .26, my + ry * .05], [fx, my - ry * .01], [fx + rx * .26, my + ry * .05]], r * .06, C.mouth, .9);
  else if (o.mouth === 'o') s.oval(fx, my, rx * .1, ry * .08, r * .06, C.mouth, .9);
  else s.line([[fx - rx * .24, my], [fx + rx * .02, my + ry * .02], [fx + rx * .24, my - ry * .01]], r * .06, C.mouth, .9);
  if (o.glasses) { s.oval(fx - rx * .36, ey + ry * .02, rx * .22, ry * .12, r * .035, C.ink, .8); s.oval(fx + rx * .3, ey + ry * .02, rx * .22, ry * .12, r * .035, C.ink, .8); s.line([[fx - rx * .14, ey], [fx + rx * .08, ey]], r * .03, C.ink, .8); }
  // jaw contour on the shadow side, an ear
  s.line([[rx * .92, -ry * .25], [rx * .9, ry * .4], [rx * .4, ry * .93], [-rx * .05, ry * 1.0]], r * .05, C.umber, .55);
  if (!o.wig) s.stick([[rx * .95 - turn * rx * .2, -ry * .05], [rx * 1.02 - turn * rx * .2, ry * .25]], r * .14, sk, .9);
  // hair / wig on top
  if (o.wig === 'bar') barWig(s, rx, ry, r);
  else if (o.wig === 'judge') {
    s.hatch([[-rx * 1.15, -ry * .35], [-rx * .9, -ry * 1.05], [0, -ry * 1.32], [rx * .9, -ry * 1.05], [rx * 1.15, -ry * .35], [rx * .5, -ry * .6], [-rx * .5, -ry * .6]], .15, r * .14, r * .2, C.wig, .95, PASS.LAYIN, .1);
    for (let k = 0; k < 6; k++) s.oval(-rx * .75 + k * rx * .3, -ry * .82 + Math.abs(k - 2.5) * ry * .06, r * .14, r * .1, r * .045, C.wigS, .6, PASS.LINE, .5, 1);
    s.stick([[-rx * .6, -ry * 1.05], [rx * .1, -ry * 1.2]], r * .12, C.white, .9, PASS.LIGHT);
  } else if (o.hair === 'bob') {
    s.hatch([[-rx * 1.12, -ry * .2], [-rx * .9, -ry * 1.0], [0, -ry * 1.18], [rx * .95, -ry * .95], [rx * 1.15, -ry * .1], [rx * 1.1, ry * .7], [rx * .85, ry * .65], [rx * .8, -ry * .45], [-rx * .3, -ry * .62], [-rx * .82, -ry * .35], [-rx * .85, ry * .65], [-rx * 1.15, ry * .7]], 1.35, r * .14, r * .2, hc, .95, PASS.LAYIN, .1);
    s.stick([[-rx * .6, -ry * .85], [rx * .1, -ry * .95]], r * .13, o.hairL || C.hairL, .8, PASS.LIGHT);
  } else if (o.hair === 'curly') {
    for (let k = 0; k < 14; k++) { const u = Math.PI * (1.05 + k / 13 * .9); s.oval(Math.cos(u) * rx * 1.0, Math.sin(u) * ry * .95 - ry * .05, r * .2, r * .17, r * .1, hc, .9, PASS.LAYIN); }
    s.hatch([[-rx * 1.0, -ry * .3], [-rx * .7, -ry * 1.0], [rx * .7, -ry * 1.0], [rx * 1.0, -ry * .3], [rx * .5, -ry * .6], [-rx * .5, -ry * .6]], 1.2, r * .15, r * .22, hc, .9, PASS.LAYIN, .1);
  } else if (o.hair !== 'bald' && o.hair !== 'none') {
    s.hatch([[-rx * 1.04, -ry * .2], [-rx * .85, -ry * .95], [0, -ry * 1.15], [rx * .9, -ry * .92], [rx * 1.05, -ry * .2], [rx * .7, -ry * .55], [-rx * .5, -ry * .62]], 1.25, r * .13, r * .2, hc, .95, PASS.LAYIN, .1);
    s.stick([[-rx * .55, -ry * .9], [rx * .15, -ry * 1.0]], r * .12, o.hairL || C.hairL, .75, PASS.LIGHT);
  }
  if (o.crown) crown(s, 0, -ry * 1.0, r * .95);
  s.restore();
}
function barWig(s, rx, ry, r) {
  // barrister's short wig: a pale cap over the crown, horizontal rolls of curls over the ears
  s.hatch([[-rx * 1.1, -ry * .1], [-rx * .95, -ry * .95], [0, -ry * 1.22], [rx * .95, -ry * .95], [rx * 1.1, -ry * .1], [rx * .8, -ry * .55], [-rx * .8, -ry * .55]], .1, r * .14, r * .2, C.wig, .95, PASS.LAYIN, .08);
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) {
    const cy = -ry * .3 + k * ry * .22;
    s.stick([[sd * rx * .82, cy], [sd * rx * 1.22, cy + ry * .02]], r * .18, C.wig, .95, PASS.LAYIN);
    s.line([[sd * rx * .84, cy + ry * .09], [sd * rx * 1.22, cy + ry * .1]], r * .04, C.wigD, .7);
  }
  for (let k = 0; k < 5; k++) s.oval(-rx * .6 + k * rx * .3, -ry * .8, r * .12, r * .08, r * .035, C.wigS, .55, PASS.LINE, .5, 1);
  s.stick([[-rx * .55, -ry * 1.0], [rx * .2, -ry * 1.1]], r * .1, C.white, .9, PASS.LIGHT);
}
function crown(s, x, y, w) {
  const h = w * .7, pts = [[x - w * .55, y], [x - w * .62, y - h * .9], [x - w * .3, y - h * .45], [x, y - h * 1.1], [x + w * .3, y - h * .45], [x + w * .62, y - h * .9], [x + w * .55, y]];
  s.hatch(pts, -.3, w * .1, w * .14, C.gold, .95, PASS.LAYIN, .08);
  s.stick([[x - w * .58, y - h * .05], [x + w * .58, y - h * .05]], w * .2, C.goldD, .7, PASS.LAYIN);
  s.line(pts, w * .035, C.goldD, .8);
  s.stick([[x - w * .45, y - h * .5], [x - w * .1, y - h * .6]], w * .07, C.goldL, .9, PASS.LIGHT);
  for (const px of [-.62, 0, .62]) s.stick([[x + w * px - 2, y - h * (px ? .92 : 1.12)], [x + w * px + 2, y - h * (px ? .92 : 1.12)]], w * .1, C.red, .9, PASS.LAYIN);
}

// ---------- bodies ----------
// shoulders at y; w shoulder width; h down to the waist. col/colS lay-in and shadow.
function torso(s, x, y, w, h, col, colS, o = {}) {
  const lean = o.lean || 0;
  const P = [[x - w * .16, y - h * .04], [x - w * .44, y + h * .06], [x - w * .52 + lean * .3, y + h * .5], [x - w * .5 + lean, y + h], [x + w * .5 + lean, y + h], [x + w * .52 + lean * .3, y + h * .5], [x + w * .44, y + h * .06], [x + w * .16, y - h * .04]];
  s.blob(x + lean * .5, y + h * .5, w * .45, h * .5, col, .35);
  s.ground(P, col, .75);
  s.hatch(P, o.ang ?? 1.25, w * .07, w * .1, col, .9, PASS.LAYIN, .2);
  s.hatch([[x + w * .1, y], [x + w * .44, y + h * .06], [x + w * .52 + lean * .3, y + h * .5], [x + w * .5 + lean, y + h], [x + w * .15 + lean, y + h]], o.ang ?? 1.25, w * .08, w * .09, colS, .7, PASS.LAYIN, .1);
  if (o.light !== false) s.stick([[x - w * .4, y + h * .1], [x - w * .46, y + h * .55]], w * .07, o.lightCol || C.white, .45, PASS.LIGHT);
  s.line([[x - w * .2, y - h * .02], [x - w * .44, y + h * .07], [x - w * .52 + lean * .3, y + h * .55], [x - w * .5 + lean, y + h * .95]], Math.max(2, w * .018), C.ink, .7);
  s.line([[x + w * .2, y - h * .02], [x + w * .45, y + h * .08], [x + w * .53 + lean * .3, y + h * .5]], Math.max(2, w * .016), C.ink, .55);
  // fold lines
  for (let k = 0; k < (o.folds ?? 3); k++) { const fx = x + (k - 1) * w * .18 + lean * .5; s.line([[fx, y + h * .3], [fx + lean * .3 + (k - 1) * 6, y + h * .98]], Math.max(1.5, w * .012), o.foldCol || C.ink, .4); }
}
// a mitten hand (simple, correct) at x,y; ang = direction of the fingers; point: one finger out
function mitten(s, x, y, sz, ang, col = C.skin, o = {}) {
  s.save(); s.translate(x, y); s.rotate(ang);
  const P = [[0, -sz * .38], [sz * .75, -sz * .42], [sz * 1.0, -sz * .15], [sz * .95, sz * .25], [sz * .2, sz * .4], [0, sz * .35]];
  s.hatch(P, .2, sz * .18, sz * .26, col, .95, PASS.LAYIN, .05);
  if (o.point) { s.stick([[sz * .8, -sz * .25], [sz * 1.6, -sz * .3]], sz * .22, col, .95, PASS.LAYIN); s.line([[sz * .85, -sz * .38], [sz * 1.62, -sz * .4], [sz * 1.66, -sz * .22], [sz * .95, -sz * .12]], sz * .05, C.skinS, .7); }
  else s.line([[sz * .35, -sz * .32], [sz * .55, -sz * .05], [sz * .3, sz * .15]], sz * .05, C.skinS, .7); // thumb
  s.line(P.concat([P[0]]), sz * .05, C.skinS, .6);
  s.restore();
}
function bands(s, x, y, sz) { // the white tabs at a lawyer's or judge's neck
  s.hatch([[x - sz * .5, y], [x - sz * .05, y], [x - sz * .1, y + sz * 1.3], [x - sz * .45, y + sz * 1.25]], 1.5, sz * .16, sz * .22, C.white, .95, PASS.LAYIN, 0);
  s.hatch([[x + sz * .05, y], [x + sz * .5, y], [x + sz * .45, y + sz * 1.25], [x + sz * .1, y + sz * 1.3]], 1.6, sz * .16, sz * .22, C.white, .95, PASS.LAYIN, 0);
  s.line([[x, y + sz * .05], [x, y + sz * 1.25]], sz * .05, C.paperS, .7);
}

// a barrister, head and shoulders (seated or standing); r = head radius
function barrister(s, x, y, r, o = {}) {
  const sh = y + r * 1.15;
  torso(s, x, sh, r * 3.4, r * 4.2, C.gown, '#0f0f14', { lean: o.lean || 0, lightCol: C.gownL, foldCol: C.gownL });
  s.stick([[x - r * .55, sh - r * .1], [x + r * .55, sh - r * .1]], r * .45, C.white, .95, PASS.LAYIN); // wing collar
  bands(s, x, sh + r * .1, r * .5);
  head(s, x, y, r, Object.assign({ wig: 'bar', mouth: 'down', turn: o.turn || 0, hairCol: C.wigS }, o.head || {}));
}

// the judge: full-bottomed wig, scarlet robe with a pale fur edge, white bands, black sash
function judge(s, x, y, r, o = {}) {
  const sh = y + r * 1.25;
  torso(s, x, sh, r * 4.4, r * 5.2, C.red, C.redD, { lean: o.lean || 0, lightCol: C.redL, foldCol: C.redD, folds: 4, ang: 1.3 });
  // fur edging down the front and across the shoulders
  s.stick([[x - r * 1.9, sh + r * .45], [x - r * .75, sh + r * .3], [x - r * .62, sh + r * 4.8]], r * .3, C.white, .85, PASS.LAYIN);
  s.stick([[x + r * 1.9, sh + r * .45], [x + r * .75, sh + r * .3], [x + r * .62, sh + r * 4.8]], r * .3, C.cream, .8, PASS.LAYIN);
  bands(s, x, sh + r * .1, r * .36);
  head(s, x, y, r, Object.assign({ wig: 'judge', mouth: o.mouth || 'flat', turn: o.turn || 0, glasses: o.glasses ?? true, tilt: o.tilt || 0, hairCol: C.wigS, browCol: C.grey }, o.head || {}));
}

// the king: fat, ermine collar, red velvet, crown, a grey beard
function king(s, x, y, r, o = {}) {
  const sh = y + r * 1.25;
  torso(s, x, sh, r * 5.0, r * 4.6, C.redD, '#3d0d0b', { lightCol: C.redL, foldCol: C.ink });
  // ermine: white with black tails
  const E = [[x - r * 2.4, sh + r * .2], [x - r * .2, sh + r * .1], [x + r * 2.4, sh + r * .2], [x + r * 2.1, sh + r * 1.3], [x, sh + r * 1.1], [x - r * 2.1, sh + r * 1.3]];
  s.hatch(E, .1, r * .2, r * .28, C.white, .95, PASS.LAYIN, .08);
  for (let k = 0; k < 9; k++) s.stick([[x - r * 1.8 + k * r * .45, sh + r * .5 + (k % 2) * r * .3], [x - r * 1.8 + k * r * .45 + 2, sh + r * .75 + (k % 2) * r * .3]], r * .1, C.ink, .9, PASS.DARK);
  head(s, x, y, r, { crown: true, beard: C.greyL, mouth: o.mouth || 'flat', turn: o.turn || 0, hair: 'short', hairCol: C.grey, skin: '#e0a48a' });
}

// an ordinary person (one of the couple): o.who = 'she' | 'he'
function person(s, x, y, r, o = {}) {
  const sh = y + r * 1.15, she = o.who === 'she';
  torso(s, x, sh, r * 3.3, r * 4, she ? C.teal : C.oakL, she ? '#1d4447' : C.umber, { lean: o.lean || 0, lightCol: she ? C.tealL : C.cream });
  if (she) s.stick([[x - r * .9, sh + r * .05], [x - r * .2, sh + r * .5], [x + r * .7, sh + r * .1], [x + r * .5, sh + r * 2.2]], r * .5, C.red, .9, PASS.LAYIN); // her scarf
  else { s.stick([[x - r * .4, sh + r * .05], [x, sh + r * .9], [x + r * .4, sh + r * .05]], r * .35, C.blueL, .85, PASS.LAYIN); } // his jumper at the open jacket
  head(s, x, y, r, she ? Object.assign({ hair: 'bob', hairCol: C.auburn, hairL: '#b0674a', mouth: o.mouth, turn: o.turn || 0, tilt: o.tilt || 0, back: o.back }, o.head || {})
    : Object.assign({ hair: 'short', hairCol: C.sandy, hairL: C.cream, glasses: true, mouth: o.mouth, turn: o.turn || 0, tilt: o.tilt || 0, back: o.back }, o.head || {}));
}

// ---------- furniture and props ----------
// a table seen from slightly above: top from y0 (back) to y0 + d (front), front panel down to y1
function table(s, x0, x1, y0, d, y1, o = {}) {
  const top = [[x0 + d * .6, y0], [x1 - d * .6, y0], [x1, y0 + d], [x0, y0 + d]];
  s.ground(top, o.top || C.oakL, .85); s.ground(rectPoly(x0, y0 + d, x1, y1), o.front || C.oak, .85);
  s.hatch(top, .05, d * .22, d * .3, o.top || C.oakL, .9, PASS.LAYIN, .05);
  s.hatch(rectPoly(x0, y0 + d, x1, y1), 1.45, 16, 22, o.front || C.oak, .9, PASS.LAYIN, .05);
  s.hatch(rectPoly(x0 + (x1 - x0) * .55, y0 + d, x1, y1), 1.45, 18, 20, C.oakD, .5, PASS.LAYIN, .02);
  s.line([[x0, y0 + d], [x1, y0 + d]], 4, C.oakD, .85);
  s.line([[x0 - 6, y0 + d + 8], [x1 + 8, y0 + d + 6]], 3, C.ochre, .6, PASS.LIGHT);
  s.line([[x0 + d * .6, y0], [x1 - d * .6, y0]], 2.5, C.oakD, .5);
  for (let k = 1; k < 4; k++) { const px = lerp(x0, x1, k / 4); s.line([[px, y0 + d + 14], [px + 2, y1]], 2.5, C.oakD, .5); }
}
// a stack of paper (some bound in folders): front face at x..x+w, bottom y, height h (can grow)
function stack(s, x, y, w, h, o = {}) {
  if (h < 2) return;
  const dp = w * .28;
  const front = rectPoly(x, y - h, x + w, y), topF = [[x, y - h], [x + w, y - h], [x + w + dp * .5, y - h - dp * .4], [x + dp * .5, y - h - dp * .4]];
  const col = o.folder || C.white;
  s.ground(front, col, .85); s.ground(topF, C.white, .85);
  s.hatch(front, .02, Math.max(3, Math.min(9, h / 6)), 7, col, .95, PASS.LAYIN, .02);
  s.hatch(topF, .1, 5, 8, C.white, .95, PASS.LAYIN, .02);
  s.hatch([[x + w, y - h], [x + w + dp * .5, y - h - dp * .4], [x + w + dp * .5, y - dp * .4], [x + w, y]], 1.5, 6, 6, C.paperS, .8, PASS.LAYIN, 0);
  const n = Math.floor(h / 7);
  for (let k = 1; k < n; k++) s.line([[x + 2, y - k * 7 + (k % 3)], [x + w - 2, y - k * 7]], 1.4, o.folder ? C.ink : C.paperS, o.folder ? .35 : .55);
  s.line([[x, y], [x, y - h], [x + w, y - h]], 2, C.grey, .6);
}
// wood panelling between x0..x1, y0..y1 with n vertical panels: a rubbed ground, diagonal lay-in,
// panel divisions in dark conte with a light edge, a rail and a cornice
function panels(s, x0, y0, x1, y1, n, o = {}) {
  const R = rectPoly(x0, y0, x1, y1), col = o.col || C.oak;
  // rubbed in with a tissue first (soft, no grain), then a few strokes with the side of the stick
  s.smudge(R, col, o.ga ?? .55);
  s.ground(R, col, .22);
  s.hatch(R, o.ang ?? 1.48, 46, 26, col, .5, PASS.LAYIN, .35);
  s.hatch(R, (o.ang ?? 1.48) + .06, 120, 18, C.oakD, .3, PASS.LAYIN, .35);
  for (let k = 0; k <= n; k++) {
    const px = lerp(x0, x1, k / n);
    s.line([[px, y0 + 6], [px + 3, y1]], 5, C.oakD, .7, PASS.LINE);
    s.line([[px + 8, y0 + 14], [px + 9, y1 - 8]], 3, C.ochre, .5, PASS.LIGHT);
  }
  const ym = y0 + (y1 - y0) * (o.rail ?? .55);
  s.stick([[x0, ym], [x1, ym + 3]], 14, C.oakD, .6, PASS.LAYIN);
  s.line([[x0, ym - 9], [x1, ym - 6]], 3, C.ochre, .5, PASS.LIGHT);
  s.stick([[x0, y0 + 4], [x1, y0 + 6]], 18, C.oakD, .7, PASS.LAYIN);
  s.line([[x0, y0 + 16], [x1, y0 + 18]], 3, C.ochre, .5, PASS.LIGHT);
}
// a solid wooden front (bench, box, table): ground, vertical lay-in, a light top edge, panel lines
function woodFront(s, x0, y0, x1, y1, n = 4, o = {}) {
  const R = rectPoly(x0, y0, x1, y1);
  s.ground(R, o.col || C.oak, .85);
  s.hatch(R, 1.4, 16, 22, o.col || C.oak, .85, PASS.LAYIN, .05);
  s.hatch(rectPoly(lerp(x0, x1, .6), y0, x1, y1), 1.4, 20, 18, C.oakD, .45, PASS.LAYIN, .02);
  s.stick([[x0 - 4, y0 + 4], [x1 + 4, y0 + 2]], 12, o.edge || C.oakL, .95, PASS.LAYIN);
  s.line([[x0, y0 + 10], [x1, y0 + 9]], 3, C.ochre, .7, PASS.LIGHT);
  for (let k = 1; k < n; k++) { const px = lerp(x0, x1, k / n); s.line([[px, y0 + 22], [px + 2, y1]], 3.5, C.oakD, .6); }
  s.line([[x0, y0], [x0, y1]], 4, C.oakD, .6); s.line([[x1, y0], [x1, y1]], 4, C.oakD, .6);
}
// a money sack, tied at the neck, with a dollar sign drawn on
function sack(s, x, y, r, o = {}) {
  const P = [[x - r * .35, y - r * 1.25], [x + r * .35, y - r * 1.25], [x + r * .25, y - r * .9], [x + r * 1.0, y - r * .2], [x + r * .95, y + r * .65], [x, y + r * .85], [x - r * .95, y + r * .65], [x - r * 1.0, y - r * .2], [x - r * .25, y - r * .9]];
  s.blob(x, y, r * .9, r * .7, C.sackD, .4);
  s.hatch(P, 1.1, r * .2, r * .3, C.sack, .95, PASS.LAYIN, .08);
  s.hatch([[x + r * .2, y - r * .7], [x + r * 1.0, y - r * .2], [x + r * .9, y + r * .65], [x + r * .2, y + r * .8]], 1.1, r * .22, r * .25, C.sackD, .6, PASS.LAYIN, .05);
  s.stick([[x - r * .7, y - r * .3], [x - r * .5, y + r * .2]], r * .18, C.sackL, .8, PASS.LIGHT);
  s.line([[x - r * .32, y - r * .95], [x + r * .32, y - r * .95]], r * .1, C.umber, .9);
  s.line(P.concat([P[0]]), Math.max(1.5, r * .04), C.umber, .6);
  if (o.sign !== false) {
    s.line([[x + r * .22, y - r * .32], [x - r * .05, y - r * .42], [x - r * .25, y - r * .2], [x + r * .2, y + r * .05], [x + r * .2, y + r * .3], [x - r * .05, y + r * .38], [x - r * .28, y + r * .25]], r * .07, C.umber, .85);
    s.line([[x - r * .02, y - r * .55], [x + r * .02, y + r * .5]], r * .05, C.umber, .8);
  }
}
// a crowd of heads and shoulders in rows (gallery, press); filled up to fraction u (people arrive)
function crowd(s, x0, x1, y, rows, r, u = 1, seed = 1, o = {}) {
  const cols = [C.navy, C.oak, C.greenD, C.grey, '#3d5258', C.redD, C.gown, C.sackD];
  const hairs = [C.hair, C.sandy, C.auburn, C.grey, C.ink, C.hairL];
  const people = [];
  for (let row = rows - 1; row >= 0; row--) {
    const n = Math.floor((x1 - x0) / (r * 2.3));
    for (let k = 0; k < n; k++) people.push({ row, k, x: x0 + (k + .5 + (row % 2) * .5) * (x1 - x0) / (n + .5) + (rnd(seed, row, k) - .5) * r * .6, y: y - row * r * 2.2 + (rnd(seed, k, row) - .5) * r * .3, ord: rnd(seed + 9, row, k) });
  }
  const shown = people.filter(p => p.ord < u).sort((a, b) => a.row !== b.row ? b.row - a.row : a.k - b.k);
  for (const p of shown) {
    const c = cols[Math.floor(rnd(seed, p.k, p.row + 3) * cols.length)], h = hairs[Math.floor(rnd(seed, p.k + 7, p.row) * hairs.length)];
    s.stick([[p.x - r * .9, p.y + r * 1.5], [p.x + r * .9, p.y + r * 1.45]], r * 1.5, c, .9);
    head(s, p.x, p.y, r, { hairCol: h, turn: o.turn ?? (rnd(seed, p.k, 99) - .5), back: o.back });
  }
}

// a barrister seen from behind: black gown shoulders, the wig's rows of rolls and its two little tails
function barristerBack(s, x, y, r, o = {}) {
  torso(s, x, y + r * 1.05, r * 3.2, r * 4, C.gown, '#0e0e12', { lightCol: C.gownL, folds: 2, foldCol: C.gownL });
  s.save(); s.translate(x, y); s.rotate(o.tilt || 0);
  s.ground(ovalPoly(0, -r * .1, r * .9, r * 1.0), C.wig, .9);
  s.hatch(ovalPoly(0, -r * .1, r * .9, r * 1.0), .05, r * .2, r * .26, C.wig, .95, PASS.LAYIN, .05);
  for (let k = 0; k < 4; k++) { const yy = -r * .35 + k * r * .3; s.stick([[-r * .85, yy + r * .1], [r * .85, yy + r * .1]], r * .1, C.wigS, .7, PASS.LAYIN); s.line([[-r * .86, yy], [-r * .2, yy + r * .05], [r * .86, yy]], r * .07, C.wigD, .8); }
  s.line(ovalPoly(0, -r * .1, r * .9, r * 1.0, 20).concat([[r * .9, -r * .1]]), r * .05, C.wigD, .6);
  s.stick([[-r * .5, -r * .8], [r * .3, -r * .95]], r * .16, C.white, .9, PASS.LIGHT);
  for (const sd of [-1, 1]) { s.stick([[sd * r * .25, r * .75], [sd * r * .22, r * 1.25]], r * .17, C.wig, .95); s.line([[sd * r * .25, r * 1.15], [sd * r * .2, r * 1.3]], r * .08, C.wigD, .7); }
  s.restore();
}
// an empty chair, seen from the front (green leather seat and back, wooden legs)
function chair(s, x, y, w, o = {}) {
  const h = w * 1.3;
  s.ground(rectPoly(x - w * .45, y - h, x + w * .45, y - h * .35), C.greenD, .85);
  s.hatch(rectPoly(x - w * .45, y - h, x + w * .45, y - h * .35), 1.5, w * .12, w * .16, C.green, .85);
  s.stick([[x - w * .35, y - h * .9], [x - w * .3, y - h * .45]], w * .08, C.greenL, .7, PASS.LIGHT);
  s.ground([[x - w * .55, y - h * .35], [x + w * .55, y - h * .35], [x + w * .5, y - h * .22], [x - w * .5, y - h * .22]], C.green, .9);
  s.line([[x - w * .45, y - h * 1.0], [x + w * .45, y - h * 1.0], [x + w * .45, y - h * .35]], w * .04, C.oakD, .8);
  s.line([[x - w * .45, y - h * .2], [x - w * .45, y]], w * .06, C.oakD, .9); s.line([[x + w * .45, y - h * .2], [x + w * .45, y]], w * .06, C.oakD, .9);
}
// a gavel, head centred at x,y, handle pointing along angle a
function gavel(s, x, y, sz, a) {
  s.save(); s.translate(x, y); s.rotate(a);
  s.stick([[0, 0], [sz * 1.6, 0]], sz * .16, C.oakD, .95, PASS.LAYIN);
  s.ground(rectPoly(-sz * .22, -sz * .5, sz * .22, sz * .5), C.oak, .95);
  s.hatch(rectPoly(-sz * .22, -sz * .5, sz * .22, sz * .5), 0, sz * .1, sz * .16, C.oak, .95);
  s.stick([[-sz * .12, -sz * .4], [-sz * .12, sz * .4]], sz * .06, C.oakL, .9, PASS.LIGHT);
  s.line([[-sz * .22, -sz * .5], [sz * .22, -sz * .5], [sz * .22, sz * .5], [-sz * .22, sz * .5], [-sz * .22, -sz * .5]], sz * .04, C.ink, .8);
  s.restore();
}

// a fat hand coming down from above and closing on something: back of the hand, four curled fingers, a thumb
function grabHand(s, x, y, sz, col = C.skin) {
  s.save(); s.translate(x, y);
  const back = [[-sz * .55, -sz * .9], [sz * .55, -sz * .9], [sz * .62, -sz * .05], [-sz * .62, -sz * .05]];
  s.ground(back, col, .95); s.hatch(back, -1.2, sz * .12, sz * .16, col, .9);
  s.hatch([[sz * .1, -sz * .9], [sz * .55, -sz * .9], [sz * .62, -sz * .05], [sz * .15, -sz * .05]], -1.2, sz * .13, sz * .14, C.skinS, .55);
  for (let k = 0; k < 4; k++) { // fingers, side by side, curled down over the coins
    const fx = -sz * .45 + k * sz * .3;
    s.stick([[fx, -sz * .1], [fx + sz * .02, sz * .32]], sz * .27, col, .95);
    s.line([[fx - sz * .14, -sz * .06], [fx - sz * .13, sz * .3], [fx, sz * .42], [fx + sz * .14, sz * .3]], sz * .025, C.skinS, .8);
    s.stick([[fx - sz * .05, sz * .02], [fx - sz * .04, sz * .2]], sz * .06, C.skinL, .7, PASS.LIGHT);
  }
  s.stick([[-sz * .6, -sz * .5], [-sz * .82, -sz * .1], [-sz * .7, sz * .12]], sz * .24, col, .95); // thumb
  s.line([[-sz * .72, -sz * .55], [-sz * .95, -sz * .1], [-sz * .78, sz * .2]], sz * .025, C.skinS, .8);
  s.restore();
}
