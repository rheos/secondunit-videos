/* The talking: bean-head cards on a canvas behind the figure. The see-through head is the door between them.
   The figure's svg is shown only inside his head (clip-path), with a ghost of the head on top; then one camera zooms
   both layers through the head until the figure fills the frame. Everything here is a pure function of s. */
const TN = window.TOON;
// d: 0 = in the room, 1 = inside the figure. g: how see-through his head is.
const DOOR = { ghost1:[88.95, 89.35], in1:[90.65, 91.2], out:[127.0, 127.62], unghost:[127.72, 128.1], ghost2:[133.55, 133.85], in2:[133.92, 134.4], phone:[129.55, 129.95], woodSays:[132.57, 133.9], out2:[141.0, 141.6], unghost2:[141.7, 142.1], stopTap:142.1 };
const doorD = s => { const a = smooth(prog(s, ...DOOR.in1)), b = smooth(prog(s, ...DOOR.out)), c = smooth(prog(s, ...DOOR.in2)); const e = smooth(prog(s, ...DOOR.out2)); return s < DOOR.out[0] ? a : s < DOOR.in2[0] ? 1 - b : c*(1 - e); };
const doorG = s => s < DOOR.out[0] ? smooth(prog(s, ...DOOR.ghost1)) : s < DOOR.ghost2[0] ? 1 - smooth(prog(s, ...DOOR.unghost)) : smooth(prog(s, ...DOOR.ghost2))*(1 - smooth(prog(s, ...DOOR.unghost2)));

const ROOMIE = { jacket:'#b5653f', pants:'#3b3f52', boots:'#4a3426', skin:TN.SKINS[1], hat:'cap', cap:'#3a2a20' };
const LISTEN = { jacket:'#3f6fb5', pants:'#3b3f52', boots:'#4a3426', skin:TN.SKINS[2], hat:'cap', cap:'#7b7468' };
const WOOD_MAN = { jacket:'#5d7a3a', pants:'#3b3f52', boots:'#4a3426', skin:TN.SKINS[0], hat:'cap', cap:'#c64f33', moustache:'#4a3426' };
const WIFE = { jacket:'#c25a7a', pants:'#3b3f52', boots:'#4a3426', skin:TN.SKINS[1], hat:'cap', cap:'#7a4a2a', dress:'#d9a441' };
const KID_A = { build:'kid', jacket:'#4f7fd0', pants:'#3b3f52', boots:'#4a3426', skin:TN.SKINS[0], hat:'cap', cap:'#c64f33' };
const KID_B = { build:'kid', jacket:'#3f9d6c', pants:'#3b3f52', boots:'#4a3426', skin:TN.SKINS[2], hat:'cap', cap:'#f4b829' };
const SEED_R = 4, CARD_W = 600, CARD_H = 1000;
const envAt = s => { const E = window.ENV; return E.v[Math.max(0, Math.min(E.v.length - 1, Math.floor((s - E.s0)*E.fps)))] || 0; };
const talkFace = s => { const v = envAt(s); return v < .22 ? 'talk0' : v < .5 ? 'talk1' : v < .78 ? 'talk2' : 'talk3'; };

const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const offR = mk(CARD_W, CARD_H), offL = mk(CARD_W, CARD_H), offW = mk(CARD_W, CARD_H);
const drawCard = (c, o, opts) => { const g = c.getContext('2d'); g.clearRect(0, 0, CARD_W, CARD_H); const p = new TN.Pen(g); TN.bodyFront(p, o, { mode:'stand', ...opts }); return c; };

// where his head is, in card space and on screen
const HEAD_S = 1.3, ROOM_X = 272, ROOM_SOLE = 1445;
const headCard = (() => { const H = TN.headBlob(SEED_R, TN.BUILD.adult.a, 1), HH = 2*H.b, torsoBot = 975 - TN.BUILD.adult.legs*HH, chin = torsoBot - TN.BUILD.adult.torso*HH, hc = chin - H.b; return { H, hc, chin }; })();
const cardToRoom = (x, y) => [ROOM_X + (x - 300)*HEAD_S, ROOM_SOLE + (y - 975)*HEAD_S];
const HEADC = cardToRoom(300, headCard.hc);
// the head outline as the card draws it this frame: tilted about the chin, then scaled about the chin. The door's clip follows it.
const headPolyAt = (P) => { const cx = 300, cy = headCard.chin, t = P.tilt*Math.PI/180, c = Math.cos(t), n = Math.sin(t);
  return TN.blobPts(cx, headCard.hc, headCard.H, 60).map(([x, y]) => { const dx = x - cx, dy = y - cy; return cardToRoom(cx + (dx*c - dy*n)*P.sx, cy + (dx*n + dy*c)*P.sy); }); };

/* how the heads move, measured off the real thing (references/ricks-clips/STUDY-format.md "How the faces move"):
   size pulses about 2-4% wide, 4-6% tall at 1.2-2.5 Hz while talking; a line swells it and it settles in about half a second; the head tilts through a line. */
const TAU = Math.PI*2;
const talkGate = (() => { let sm = null; return s => { const E = window.ENV;
  if (!sm) sm = E.v.map((_, i) => { let t = 0, n = 0; for (let j = Math.max(0, i - 3); j <= Math.min(E.v.length - 1, i + 3); j++){ t += E.v[j]; n++; } return t/n; });
  const x = (s - E.s0)*E.fps, i = Math.max(0, Math.min(sm.length - 2, Math.floor(x))), f = Math.max(0, Math.min(1, x - i));
  return smooth(prog(lerp(sm[i], sm[i + 1], f), .12, .4)); }; })();
// stressed words: a loud onset after something quieter, at least .55 s apart
const stressKicks = (() => { let K = null; return () => { if (K) return K; const E = window.ENV; K = []; let last = -9;
  E.v.forEach((v, i) => { if (i < 3) return; const t = E.s0 + i/E.fps, m = (E.v[i - 1] + E.v[i - 2] + E.v[i - 3])/3; if (v >= .8 && v - m >= .35 && t - last >= .55){ K.push(t); last = t; } }); return K; }; })();
const hit = (s, t0, amp) => { const t = s - t0; return t < 0 || t > 1 ? 0 : amp*Math.min(1, t/.06)*Math.exp(-t/.16); };
const SWELLS = [[127.62, .18]]; // "I was like": the one big one
const headMove = (s, ph, gate) => { let k = .02*Math.sin(TAU*1.31*s + ph) + .014*Math.sin(TAU*2.17*s + 1.1 + ph*2);
  for (const t of stressKicks()) k += hit(s, t, .05);
  const tilt = 3*Math.sin(TAU*.37*s + 1 + ph) + 1.6*Math.sin(TAU*.83*s + ph*3);
  return { k:k*gate, tilt:tilt*gate }; };
const poseOf = (M, big = 0) => { const k = M.k + big; return { sx:1 + .65*k, sy:1 + k, tilt:M.tilt + big*18 }; };
const poseR = s => { const inQuote = s >= DOOR.woodSays[0] && s < DOOR.woodSays[1], gate = (inQuote || s >= 145.05 ? 0 : talkGate(s))*(1 - doorD(s));
  let big = 0; for (const [t, a] of SWELLS) big += hit(s, t, a);
  return poseOf(headMove(s, 0, gate), big); };
// the room's one light comes from the window side: each head's shadow falls on its far cheek (from under the chin it read as a beard)
const SHADE = '#5a3a7a', LIGHT_R = -25*Math.PI/180, LIGHT_L = LIGHT_R;
const shadeAt = (s, ang, ph) => ({ ang:ang + .28*Math.sin(TAU*.11*s + ph), off:.38 + .09*Math.sin(TAU*.19*s + ph*2), col:SHADE, k:.36 });

/* the room */
function paintRoom(g){ const ik = '#241726';
  g.fillStyle = '#e9d5ab'; g.fillRect(0, 0, FW, FH);
  // tongue-and-groove up to the rail
  g.fillStyle = '#c99a63'; g.fillRect(0, 860, FW, 420); g.strokeStyle = ik; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 860); g.lineTo(FW, 860); g.stroke();
  g.lineWidth = 2; g.strokeStyle = '#8a6238'; for (let x = 36; x < FW; x += 58){ g.beginPath(); g.moveTo(x, 868); g.lineTo(x, FH); g.stroke(); }
  // window, night out
  g.fillStyle = '#26365c'; g.strokeStyle = ik; g.lineWidth = 6; g.beginPath(); g.roundRect(420, 210, 250, 300, 8); g.fill(); g.stroke();
  g.fillStyle = '#f4e7b8'; g.beginPath(); g.arc(590, 290, 26, 0, 7); g.fill();
  g.fillStyle = '#3f5a3a'; g.beginPath(); g.moveTo(420, 510); g.lineTo(460, 430); g.lineTo(505, 490); g.lineTo(560, 410); g.lineTo(620, 480); g.lineTo(670, 440); g.lineTo(670, 510); g.closePath(); g.fill();
  g.strokeStyle = '#fff4d6'; g.lineWidth = 8; g.beginPath(); g.moveTo(545, 210); g.lineTo(545, 510); g.moveTo(420, 350); g.lineTo(670, 350); g.stroke();
  g.strokeStyle = ik; g.lineWidth = 6; g.beginPath(); g.roundRect(420, 210, 250, 300, 8); g.stroke();
  // shelf with jars, the same sweets
  g.fillStyle = '#a5683c'; g.strokeStyle = ik; g.lineWidth = 5; g.fillRect(30, 300, 150, 16); g.strokeRect(30, 300, 150, 16);
  [[56, '#d8432f'], [104, '#f4b829'], [150, '#3f9d6c']].forEach(([x, c]) => { g.fillStyle = '#dff1f5'; g.beginPath(); g.roundRect(x - 18, 252, 36, 48, 7); g.fill(); g.stroke(); g.fillStyle = c; g.beginPath(); g.arc(x, 280, 11, 0, 7); g.fill(); });
}
const roomBg = mk(FW, FH); paintRoom(roomBg.getContext('2d'));

/* the phone he holds up: the woodworker he has been watching, talking on it */
function paintPhone(g, s, k){ if (k <= 0) return; const says = s >= DOOR.woodSays[0] && s < DOOR.woodSays[1];
  const paused = s >= DOOR.stopTap, wave = says || paused ? 0 : Math.sin(s*7);
  const WP = poseOf(headMove(s, 2.1, says ? talkGate(s) : 0));
  drawCard(offW, WOOD_MAN, { expr: says ? talkFace(s) : paused ? 'neutral' : 'smile_closed', look:.2, seed:12, wave, blink: !paused && Math.floor(s*2.1) % 7 === 0, headScale:[WP.sx, WP.sy], headTilt:WP.tilt });
  const W_ = 256, H_ = 420, x = 26, y = lerp(FH + 60, 846, backOut(k));
  const big = 1 + .24*famK(s); g.save(); g.translate(x + W_/2 + 22*famK(s), y + H_/2 - 42*famK(s)); g.rotate(-.07); g.scale(big, big); g.translate(-W_/2, -H_/2);
  g.fillStyle = '#241726'; g.beginPath(); g.roundRect(-8, -8, W_ + 16, H_ + 16, 26); g.fill();
  g.save(); g.beginPath(); g.roundRect(0, 0, W_, H_, 18); g.clip();
  g.fillStyle = '#c9a26b'; g.fillRect(0, 0, W_, H_); g.fillStyle = '#e3c394'; g.fillRect(0, 0, W_, 250); g.fillStyle = '#a5683c'; g.fillRect(0, 300, W_, 120);
  g.strokeStyle = '#241726'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 300); g.lineTo(W_, 300); g.stroke();
  g.drawImage(offW, -46, -6, CARD_W*.58, CARD_H*.58);
  paintFamily(g, s);
  // a progress bar, the only thing that says this is a video
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(14, H_ - 22, W_ - 28, 7); g.fillStyle = '#d8432f'; g.fillRect(14, H_ - 22, (W_ - 28)*.62, 7);
  // he stops the video: the pause sign holds over the woodworker
  if (paused){ const q = prog(s, DOOR.stopTap, DOOR.stopTap + .12); g.globalAlpha = q; g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.arc(W_/2, 312, 44, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillRect(W_/2 - 18, 289, 12, 46); g.fillRect(W_/2 + 6, 289, 12, 46); g.globalAlpha = 1; }
  g.restore();
  // his thumb
  g.fillStyle = TN.SKINS[1]; g.strokeStyle = '#241726'; g.lineWidth = 6; g.beginPath(); g.ellipse(W_ - 2, H_*.66, 24, 40, -.25, 0, 7); g.fill(); g.stroke();
  g.restore(); }

/* the layers */
const stageC = document.querySelector('.stage');
const cardsC = mk(FW, FH), ghostC = mk(FW, FH); cardsC.id = 'cards'; ghostC.id = 'ghost';
stageC.insertBefore(cardsC, stageC.firstChild); stageC.appendChild(ghostC);
const css2 = document.createElement('style');
css2.textContent = `#cards,#ghost{position:absolute;left:0;top:0;width:720px;height:1280px;transform-origin:0 0}#cards{z-index:0}#fig{z-index:1;transform-origin:0 0}#ghost{z-index:1}#rt,#toast2,#take,#cur,#credit{z-index:3}`;
document.head.appendChild(css2);

function roomFrame(s){ const g = cardsC.getContext('2d'); g.drawImage(roomBg, 0, 0);
  const inQuote = s >= DOOR.woodSays[0] && s < DOOR.woodSays[1];
  // the listener, at the frame's right edge
  const lis = s >= 127 && s < 128.6 ? 'nervous' : s >= 120 ? 'smile' : 'smile_closed';
  drawCard(offL, LISTEN, { expr:lis, look:-.8, facing:-1, seed:9, blink: Math.floor(s*1.7) % 9 === 0, light:LIGHT_L, faceShade:shadeAt(s, LIGHT_L, 1.7), headTilt: -1.8 + 2.2*Math.sin(TAU*.23*s + .6) });
  g.drawImage(offL, 596 - 300, 1305 - 975, CARD_W, CARD_H);
  // him: a surprised beat, then talking; he stops to let the phone speak
  const shock = s >= 127.2 && s < 128.0, done = s >= 145.05, expr = shock ? 'shock' : inQuote || done ? 'smile' : talkFace(s);
  const wave = !inQuote && s < 90 ? Math.sin(s*5)*.9 : undefined;
  const PR = poseR(s);
  drawCard(offR, ROOMIE, { expr, look:.6, facing:1, seed:SEED_R, wave, blink: Math.floor(s*2.3) % 8 === 0, light:LIGHT_R, faceShade:shadeAt(s, LIGHT_R, 0), headScale:[PR.sx, PR.sy], headTilt:PR.tilt });
  g.drawImage(offR, ROOM_X - 300*HEAD_S, ROOM_SOLE - 975*HEAD_S, CARD_W*HEAD_S, CARD_H*HEAD_S);
  paintPhone(g, s, smooth(prog(s, ...DOOR.phone))*(s >= 127 ? 1 : 0));
  return g; }
// the woodworker's family, on the phone with him for the moment he says the words: in from the screen's right, bottom and left
const FAM = [
  { o:WIFE, seed:21, sc:.5, x0:430, y0:520, x1:218, y1:520, t:0, expr:'grin', c:mk(CARD_W, CARD_H) },
  { o:KID_B, seed:23, sc:.46, x0:-170, y0:505, x1:40, y1:505, t:.14, expr:'smile_closed', c:mk(CARD_W, CARD_H) },
  { o:KID_A, seed:22, sc:.5, x0:150, y0:1000, x1:150, y1:560, t:.07, expr:'grin', c:mk(CARD_W, CARD_H) },
];
const FAM_IN = 131.72, FAM_OUT = 132.62;
const famK = s => smooth(prog(s, FAM_IN - .05, FAM_IN + .15))*(1 - smooth(prog(s, FAM_OUT + .1, FAM_OUT + .35)));
function paintFamily(g, s){ if (s < FAM_IN || s > FAM_OUT + .4) return;
  for (const m of FAM){ const k = backOut(prog(s, FAM_IN + m.t, FAM_IN + m.t + .2))*(1 - smooth(prog(s, FAM_OUT + m.t*.5, FAM_OUT + m.t*.5 + .24)));
    drawCard(m.c, m.o, { expr:m.expr, look:0, seed:m.seed, wave:Math.sin(s*11 + m.seed) });
    const x = lerp(m.x0, m.x1, k), y = lerp(m.y0, m.y1, k); g.drawImage(m.c, x - 300*m.sc, y - 975*m.sc, CARD_W*m.sc, CARD_H*m.sc); } }
function ghostFrame(s, G){ const g = ghostC.getContext('2d'); g.clearRect(0, 0, FW, FH); if (G <= 0) return;
  const poly = headPolyAt(poseR(s));
  g.save(); g.beginPath(); poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip();
  g.globalAlpha = 1 - .8*G; g.drawImage(offR, ROOM_X - 300*HEAD_S, ROOM_SOLE - 975*HEAD_S, CARD_W*HEAD_S, CARD_H*HEAD_S); g.restore();
  g.strokeStyle = '#241726'; g.lineWidth = 6; g.beginPath(); poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.stroke(); }

const isoSeek = window.seek, S0 = .34;
window.seek = function(s){ isoSeek(s);
  const d = doorD(s), G = doorG(s), figE = document.getElementById('fig');
  if (d < 1){ roomFrame(s); ghostFrame(s, G); }
  cardsC.style.display = d < 1 ? '' : 'none'; ghostC.style.display = d < 1 ? '' : 'none';
  // one camera: zoom Z about the head, and pan the head to the frame's centre as we arrive
  const e = d*d*(3 - 2*d), Z = Math.pow(1/S0, e), panX = (FW/2 - HEADC[0])*e, panY = (FH/2 - HEADC[1])*e;
  const camT = `translate(${(HEADC[0]*(1 - Z) + panX).toFixed(2)}px,${(HEADC[1]*(1 - Z) + panY).toFixed(2)}px) scale(${Z.toFixed(4)})`;
  cardsC.style.transform = camT; ghostC.style.transform = camT;
  if (d >= 1){ figE.style.transform = ''; figE.style.clipPath = ''; figE.style.display = ''; }
  else { const sc = S0*Z, tx = HEADC[0] + panX - FW/2*sc, ty = HEADC[1] + panY - FH/2*sc;
    figE.style.display = G > 0 ? '' : 'none';
    figE.style.transform = `translate(${tx.toFixed(2)}px,${ty.toFixed(2)}px) scale(${sc.toFixed(4)})`;
    // the head, in the figure's own pixels: screen = camera(room); fig px = (screen - t)/sc
    const poly = headPolyAt(poseR(s)).map(([x, y]) => { const X = HEADC[0] + panX + (x - HEADC[0])*Z, Y = HEADC[1] + panY + (y - HEADC[1])*Z; return `${((X - tx)/sc).toFixed(1)}px ${((Y - ty)/sc).toFixed(1)}px`; });
    figE.style.clipPath = `polygon(${poly.join(',')})`; }
  // the readout belongs to the figure; only the switch stays in the room
  const showStats = d > .6; document.querySelectorAll('#rt .stat').forEach((n) => { n.style.visibility = showStats ? '' : 'hidden'; });
  document.getElementById('credit').style.color = d > .6 ? '' : '#5a4a32';
};
