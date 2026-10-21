// Scenery: the stage (full bleed) and the exteriors (drawn inside the ragged paper frame).
'use strict';

// ---------- the stage ----------
// lit: 0 = night, ghost light only; 1 = show lights on. doorGap: 0..1 how far the stage door stands open.
// interiors are drawn through this camera so the objects fill the square frame
function stageCam() { X.translate(540, 540); X.scale(1.25, 1.25); X.translate(-540, -540); }
function stageScene(o = {}) {
  const lit = o.lit || 0, gap = o.doorGap || 0;
  X.fillStyle = C.paper; X.fillRect(-400, -400, W + 800, H + 800);
  // back wall is the paper. warm wash when the show lights come up
  if (lit > 0) { X.fillStyle = C.amber; X.globalAlpha = .22 * lit; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
  // valance and side curtains: vertical marker, scalloped hem
  marker(rectPts(0, 0, W, 118), C.curtain, 'v', 12, 31);
  const hem = []; for (let x = 0; x <= W; x += 60) { hem.push([x, 118]); hem.push([x + 30, 134]); } ink(hem, false, 5, C.ink, 32);
  marker(rectPts(0, 0, 112, 680), C.curtain, 'v', 12, 33); ink([[112, 0], [112, 680]], false, 5, C.ink, 34);
  marker(rectPts(968, 0, 112, 680), C.curtain, 'v', 12, 35); ink([[968, 0], [968, 680]], false, 5, C.ink, 36);
  if (lit > 0) { X.globalAlpha = .18 * lit; X.fillStyle = C.amberL; X.fillRect(0, 0, 112, 680); X.fillRect(968, 0, 112, 680); X.fillRect(0, 0, W, 118); X.globalAlpha = 1; }
  // stage door on the back wall
  const dx = 790, dy = 300, dw = 140, dh = 352;
  marker(rectPts(dx - 10, dy - 10, dw + 20, dh + 10), C.greyD, 'v', 10, 37); // frame
  if (gap > 0) { flat(rectPts(dx, dy, dw * gap * .35, dh), C.navyD); }
  const px = dx + dw * gap * .35; // door panel slides as a crude open
  marker(rectPts(px, dy, dw, dh), C.grey, 'v', 10, 38); ink(rectPts(px, dy, dw, dh), true, 5, C.ink, 39);
  ink([[px + 18, dy + 170], [px + dw - 18, dy + 170]], false, 9, C.ink, 40); ink([[px + 18, dy + 170], [px + dw - 18, dy + 170]], false, 4, C.brass, 41);
  ink(rectPts(dx - 10, dy - 10, dw + 20, dh + 10), true, 5, C.ink, 42);
  // floor: planks
  marker(rectPts(0, 640, W, 440), C.wood, 'h', 12, 43, .95, .06);
  for (let y = 640; y < 1000; y += 52) ink([[0, y], [W, y]], false, 2, C.ink, 44 + y, .35);
  ink([[0, 640], [W, 640]], false, 5, C.ink, 45);
  marker(rectPts(0, 1000, W, 80), C.ampD, 'h', 12, 46); ink([[0, 1000], [W, 1000]], false, 5, C.ink, 47);
  // ghost light: a bare bulb on a stand
  const gx = 700;
  if (!o.noGhost) {
    ellipse(gx, 660, 60, 14, C.ink, .9); ink([[gx, 655], [gx, 300]], false, 9, C.ink, 48); ink([[gx, 655], [gx, 300]], false, 3, C.grey, 49);
    const on = lit < .6; if (on) { pool(gx, 760, 250, 58, C.white, .6); glow(gx, 290, 90, C.amberL, .5); }
    X.beginPath(); X.arc(gx, 288, 24, 0, TAU); X.fillStyle = on ? C.win : C.lav; X.fill(); X.strokeStyle = C.ink; X.lineWidth = 5; X.stroke();
    ink([[gx - 22, 300], [gx - 30, 330], [gx + 30, 330], [gx + 22, 300]], false, 4, C.ink, 50);
  }
  if (lit > 0) { pool(300, 560, 380, 170, C.amberL, .5 * lit); pool(560, 600, 420, 180, C.amberL, .45 * lit); }
  amp(lit); guitar();
}
function amp(lit = 0) {
  const x = 150, y = 440, w = 240, h = 200;
  ellipse(x + w / 2, y + h + 6, w * .55, 16, C.ink, .15);
  marker(rectPts(x, y, w, h), C.ampD, 'h', 11, 51); marker(rectPts(x, y, w, 36), C.amp, 'h', 9, 52);
  marker(rectPts(x + 18, y + 52, w - 36, h - 70), C.greyD, 'v', 9, 53);
  for (let gx = x + 24; gx < x + w - 20; gx += 11) ink([[gx, y + 56], [gx, y + h - 22]], false, 2, C.ink, 54 + gx, .4);
  ink(rectPts(x + 18, y + 52, w - 36, h - 70), true, 4, C.ink, 55); ink(rectPts(x, y, w, h), true, 5, C.ink, 56); ink([[x, y + 36], [x + w, y + 36]], false, 4, C.ink, 57);
  for (let k = 0; k < 4; k++) { const kx = x + 40 + k * 34; X.beginPath(); X.arc(kx, y + 18, 8, 0, TAU); X.fillStyle = C.lav; X.fill(); X.strokeStyle = C.ink; X.lineWidth = 3; X.stroke(); ink([[kx, y + 18], [kx + 5, y + 12]], false, 2, C.ink, 58 + k); }
  // input jack socket and the pilot lamp
  X.beginPath(); X.arc(x + w - 56, y + 18, 7, 0, TAU); X.fillStyle = C.ink; X.fill();
  if (lit > 0) glow(x + w - 24, y + 18, 60, C.red, .55 * lit);
  X.beginPath(); X.arc(x + w - 24, y + 18, 7, 0, TAU); X.fillStyle = lit > 0 ? C.red : C.greyD; X.fill(); X.strokeStyle = C.ink; X.lineWidth = 3; X.stroke();
  // handle
  ink([[x + w / 2 - 40, y - 2], [x + w / 2 - 34, y - 16], [x + w / 2 + 34, y - 16], [x + w / 2 + 40, y - 2]], false, 7, C.ink, 59);
}
const GUITAR = { bx: 540, by: 560, jack: [604, 572], head: [566, 232] };
function guitar() {
  const { bx, by } = GUITAR;
  // stand
  ink([[bx - 60, 660], [bx, 470], [bx + 60, 660]], false, 6, C.ink, 60); ink([[bx - 44, 640], [bx + 44, 640]], false, 6, C.ink, 61);
  ink([[bx - 50, 636], [bx - 50, 616], [bx - 30, 616]], false, 6, C.ink, 62); ink([[bx + 50, 636], [bx + 50, 616], [bx + 30, 616]], false, 6, C.ink, 63);
  // body: two lobes, marker, a darker burst rim
  const lobe = (cy, rx, ry) => { const p = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; p.push([bx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; };
  const low = lobe(by + 20, 74, 70), up = lobe(by - 60, 58, 48);
  marker(low, C.amberD, 'd', 10, 64); marker(up, C.amberD, 'd', 10, 65);
  const lowI = lobe(by + 20, 56, 52), upI = lobe(by - 60, 42, 34); marker(lowI, C.amber, 'd', 10, 66); marker(upI, C.amber, 'd', 10, 67);
  ink(low, true, 5, C.ink, 68); ink(up, true, 5, C.ink, 69);
  X.beginPath(); X.arc(bx - 2, by - 10, 18, 0, TAU); X.fillStyle = C.ink; X.fill();
  // bridge, pickup, jack socket on the lower right
  flat(rectPts(bx - 22, by + 24, 44, 10), C.ink); flat(rectPts(bx - 26, by - 2, 52, 9), C.cableD);
  X.beginPath(); X.arc(GUITAR.jack[0], GUITAR.jack[1], 7, 0, TAU); X.fillStyle = C.ink; X.fill();
  // neck and headstock
  const nk = [[bx - 11, by - 100], [bx - 9, 250], [bx + 9, 250], [bx + 11, by - 100]]; marker(nk, C.woodD, 'v', 6, 70); ink(nk, true, 4, C.ink, 71);
  for (let y = 270; y < by - 100; y += 24) ink([[bx - 9, y], [bx + 9, y]], false, 2, C.ink, 72 + y, .6);
  for (let k = -1; k <= 1; k++) ink([[bx + k * 4, 252], [bx + k * 4 + k * 8, by + 24]], false, 1.5, C.cableL, 73 + k, .8);
  const hd = [[bx - 9, 252], [bx + 9, 252], [bx + 30, 240], [bx + 26, 214], [bx - 20, 214], [bx - 24, 240]]; marker(hd, C.woodD, 'v', 6, 74); ink(hd, true, 4, C.ink, 75);
  for (let k = 0; k < 3; k++) { X.beginPath(); X.arc(bx - 30 + k * 2, 222 + k * 9, 4, 0, TAU); X.fillStyle = C.brass; X.fill(); X.beginPath(); X.arc(bx + 34 - k * 2, 222 + k * 9, 4, 0, TAU); X.fill(); }
}

// ---------- exteriors ----------
function nightSky(y0 = 0, y1 = H, s = 80) { marker(rectPts(0, y0, W, y1 - y0), C.navy, 'v', 12, s, 1, .05); seed(s + 1); X.fillStyle = C.white; for (let i = 0; i < 40; i++) { X.globalAlpha = rnd(.3, .9); X.fillRect(rnd(0, W), rnd(y0, y1), 3, 3); } X.globalAlpha = 1; }
function alleyScene(o = {}) { // stage door at left, alley running right to a city strip, fire escape on the right wall
  nightSky(0, H, 80);
  cityStrip(380, 720, 81, C.navyD, 330, 760);
  // ground
  marker(rectPts(0, 700, W, 380), C.greyD, 'h', 12, 82, 1, .06); ink([[0, 700], [W, 700]], false, 4, C.ink, 83, .6);
  // left building with the stage door
  marker(rectPts(0, 0, 330, 720), C.navyL, 'v', 12, 84, 1, .05); flat(rectPts(0, 0, 330, 700), C.navyL, .6); ink([[330, 0], [330, 700]], false, 5, C.ink, 85);
  marker(rectPts(120, 410, 150, 292), C.grey, 'v', 10, 86); ink(rectPts(120, 410, 150, 292), true, 5, C.ink, 87);
  ink([[138, 560], [252, 560]], false, 8, C.ink, 88);
  if (o.doorGap) { flat(rectPts(120, 410, 150 * o.doorGap * .3, 292), C.amberD); }
  // lamp over the door
  glow(195, 380, 150, C.amberL, .45); ink([[160, 395], [230, 395], [195, 360], [160, 395]], true, 5, C.ink, 89); X.beginPath(); X.arc(195, 392, 10, 0, TAU); X.fillStyle = C.win; X.fill();
  // right building and fire escape
  marker(rectPts(760, 0, 320, 720), C.navyL, 'v', 12, 90, 1, .05); flat(rectPts(760, 0, 320, 700), C.navyL, .6); ink([[760, 0], [760, 700]], false, 5, C.ink, 91);
  for (let y = 140; y < 700; y += 140) { ink([[760, y], [1080, y]], false, 5, C.ink, 92 + y); ink([[770, y], [900, y - 120]], false, 4, C.ink, 93 + y); for (let x = 780; x < 1080; x += 26) ink([[x, y], [x, y - 44]], false, 2.5, C.ink, 94 + x + y, .8); ink([[760, y - 44], [1080, y - 44]], false, 3, C.ink, 95 + y); }
  // dumpster
  marker(rectPts(800, 590, 190, 112), C.green, 'h', 10, 96); ink(rectPts(800, 590, 190, 112), true, 5, C.ink, 97); ink([[790, 592], [1000, 592]], false, 6, C.ink, 98);
}
function lotScene(o = {}) { // the venue across the back, marquee bulbs, kerb, puddle
  nightSky(0, 400, 100);
  cityStrip(150, 330, 101);
  marker(rectPts(0, 330, W, 200), C.grey, 'h', 12, 102, 1, .06); ink([[0, 330], [W, 330]], false, 5, C.ink, 103);
  for (let x = 60; x < W; x += 180) { marker(rectPts(x, 380, 70, 90), C.navyD, 'v', 9, 104 + x); ink(rectPts(x, 380, 70, 90), true, 4, C.ink, 105 + x); if (o.on) { X.fillStyle = C.win; X.globalAlpha = .9 * o.on; X.fillRect(x + 6, 386, 58, 78); X.globalAlpha = 1; } }
  // marquee
  marker(rectPts(300, 250, 480, 90), C.navyD, 'h', 10, 106); ink(rectPts(300, 250, 480, 90), true, 5, C.ink, 107);
  bulbs(320, 760, 262, 16, o.on || 0, 108); bulbs(320, 760, 328, 16, o.on || 0, 109);
  if (o.on) { pool(540, 300, 360, 120, C.amberL, .5 * o.on); }
  // kerb and lot
  marker(rectPts(0, 530, W, 26), C.lav, 'h', 8, 110); ink([[0, 530], [W, 530]], false, 4, C.ink, 111); ink([[0, 556], [W, 556]], false, 4, C.ink, 112);
  marker(rectPts(0, 556, W, 524), C.greyD, 'h', 12, 113, 1, .06);
  for (let x = -200; x < W; x += 200) ink([[x, 1080], [x + 240, 560]], false, 4, C.lav, 114 + x, .45);
  // puddle with the marquee reflected
  const pd = []; for (let i = 0; i < 30; i++) { const a = i / 30 * TAU; seed(115 + i); pd.push([560 + Math.cos(a) * (250 + jit(18)), 800 + Math.sin(a) * (68 + jit(8))]); }
  marker(pd, C.navyL, 'h', 9, 116, 1, .05); ink(pd, true, 3, C.ink, 117, .5);
  if (o.on) { X.save(); poly(pd); X.clip(); X.fillStyle = C.amberL; X.globalAlpha = .7 * o.on; for (let i = 0; i < 16; i++) { const x = lerp(320, 760, i / 15); X.fillRect(x - 3, 770, 6, 60); } X.globalAlpha = 1; X.restore(); }
}
function fenceScene() { // chain-link fence filling the lower frame, a street lamp at right, towers behind
  nightSky(0, H, 120); cityStrip(600, 980, 121);
  marker(rectPts(0, 980, W, 100), C.greyD, 'h', 12, 122);
  // lamp
  glow(900, 150, 220, C.amberL, .5); ink([[900, 1000], [900, 170]], false, 10, C.ink, 123); ink([[900, 1000], [900, 170]], false, 4, C.grey, 124);
  ink([[860, 175], [940, 175], [920, 140], [880, 140]], true, 5, C.ink, 125); X.beginPath(); X.arc(900, 168, 14, 0, TAU); X.fillStyle = C.win; X.fill();
  // fence: posts and a diamond lattice
  X.save(); X.strokeStyle = C.ink; X.lineWidth = 2; X.globalAlpha = .55;
  for (let k = -1100; k < 1100; k += 34) { X.beginPath(); X.moveTo(k, 300); X.lineTo(k + 700, 1000); X.stroke(); X.beginPath(); X.moveTo(k, 1000); X.lineTo(k + 700, 300); X.stroke(); }
  X.restore();
  ink([[0, 300], [W, 300]], false, 8, C.ink, 126); for (const x of [140, 560, 980]) { ink([[x, 300], [x, 1000]], false, 9, C.ink, 127 + x); }
}
function skyScene(o = {}) { // open night sky, the marquee's glow rising from the bottom
  nightSky(0, H, 140); if (o.glow) pool(540, 1120, 700, 420, C.amberL, .6 * o.glow);
  X.beginPath(); X.arc(900, 150, 44, 0, TAU); X.fillStyle = C.white; X.fill();
}
function swingScene(o = {}) { // the alley seen low from the lot side: fire escape at right, a bulb string along the venue wall at top
  nightSky(0, H, 160); cityStrip(500, 760, 161, C.navyD, 220, 700);
  marker(rectPts(0, 760, W, 320), C.greyD, 'h', 12, 162, 1, .06); ink([[0, 760], [W, 760]], false, 4, C.ink, 163, .6);
  marker(rectPts(700, 0, 380, 760), C.navyL, 'v', 12, 164, 1, .05); flat(rectPts(700, 0, 380, 760), C.navyL, .6); ink([[700, 0], [700, 760]], false, 5, C.ink, 165);
  for (let y = 120; y < 760; y += 160) { ink([[700, y], [1080, y]], false, 5, C.ink, 166 + y); for (let x = 716; x < 1080; x += 26) ink([[x, y], [x, y - 50]], false, 2.5, C.ink, 167 + x + y, .8); ink([[700, y - 50], [1080, y - 50]], false, 3, C.ink, 168 + y); }
  marker(rectPts(0, 0, 220, 760), C.navyL, 'v', 12, 169, 1, .05); flat(rectPts(0, 0, 220, 760), C.navyL, .6); ink([[220, 0], [220, 760]], false, 5, C.ink, 170);
  // the bulb string: lights up left to right with o.on
  ink([[220, 90], [700, 60]], false, 4, C.ink, 171); bulbs(240, 680, 76, 12, o.on || 0, 172);
  if (o.on) { X.fillStyle = C.amber; X.globalAlpha = .16 * o.on; X.fillRect(0, 0, W, H); X.globalAlpha = 1; }
}
function doorScene(o = {}) { // the stage door from outside, low and close: the gap at its foot with light leaking through
  marker(rectPts(0, 700, W, 380), C.greyD, 'h', 12, 180, 1, .06);
  marker(rectPts(100, 700, 880, 60), C.lav, 'h', 9, 188); ink([[100, 760], [980, 760]], false, 4, C.ink, 189);
  if (o.leak) pool(560, 712, 480, 90, C.amberL, .95 * o.leak);
}
function doorPanel(o = {}) { // drawn after the characters so they vanish under it
  marker(rectPts(0, 0, 120, 700), C.navyL, 'v', 12, 181, 1, .05); marker(rectPts(960, 0, 120, 700), C.navyL, 'v', 12, 182, 1, .05);
  marker(rectPts(120, 0, 840, 676), C.grey, 'v', 11, 183); ink(rectPts(120, -20, 840, 696), true, 6, C.ink, 184);
  flat(rectPts(120, 676, 840, 24), C.navyD); if (o.leak) { X.fillStyle = C.amberL; X.globalAlpha = .95 * o.leak; X.fillRect(124, 680, 832, 16); X.globalAlpha = 1; }
  ink([[0, 700], [W, 700]], false, 4, C.ink, 185, .7);
  marker(rectPts(180, 300, 720, 40), C.brass, 'h', 8, 186); ink(rectPts(180, 300, 720, 40), true, 5, C.ink, 187);
}
