// COPY of js/tarot/main.js for texture capture only: camera override, no vignette when overridden.
// Table, dealing, camera, frame assembly. Every frame is a pure function of song time t.
const out = document.getElementById('c'); out.width = W; out.height = H;
const octx = out.getContext('2d');
const LC = mkCanvas(), LL = mkCanvas();
PR.c = LC.getContext('2d'); PR.l = LL.getContext('2d');
buildTextures();
const PAT = {
  stock: octx.createPattern(STOCK, 'repeat'), cloth: octx.createPattern(CLOTH, 'repeat'),
  mottle: PR.c.createPattern(MOTTLE, 'repeat'), tooth: PR.l.createPattern(TOOTH, 'repeat'),
};

// ---------- the deal ----------
const CS = 0.36; // card units -> table units
const REST = [[-580, -30, -.02], [-290, -30, .015], [0, -30, -.012], [290, -30, .02], [580, -30, -.015]];
const DEAL = [[213.0, 213.85], [215.0, 215.75], [224.8, 225.6], [225.5, 226.3], [241.4, 242.15]];
const FLIP = [[214.2, 214.85], [222.15, 222.7], [226.95, 227.55], [235.06, 235.6], [244.0, 245.4]];
const DECK = [-860, 330, .12];
function cardState(i, t) {
  if (t < DEAL[i][0]) return null;
  const u = ease(t, DEAL[i][0], DEAL[i][1]), r = REST[i];
  const f = i === 4 ? smooth(smooth(lin(t, FLIP[i][0], FLIP[i][1]))) : ease(t, FLIP[i][0], FLIP[i][1]);
  const liftF = (i === 4 ? .16 : .06) * Math.sin(Math.PI * f);
  return {
    x: lerp(DECK[0], r[0], u), y: lerp(DECK[1], r[1], u) - 60 * Math.sin(Math.PI * u) * 0, rot: lerp(DECK[2], r[2], u) + .5 * Math.sin(Math.PI * u) * (i % 2 ? -1 : 1),
    lift: 1 + .05 * Math.sin(Math.PI * u) + liftF, fx: Math.max(.02, Math.abs(Math.cos(Math.PI * f))), face: f >= .5,
  };
}

// ---------- camera ----------
const Wk = (t, x, y, vh) => ({ t, x, y, vh });
const Ck = (t, card, cx, cy, vh) => ({ t, card, cx, cy, vh });
const CAM = [
  Wk(213.0, -150, -20, 1500), Wk(214.2, -430, -30, 1150),
  Ck(215.4, 0, 350, 600, 1350), Ck(217.3, 0, 350, 560, 820), Ck(221.9, 0, 350, 600, 900),
  Ck(221.95, 0, 350, 600, 900), Ck(222.2, 0, 350, 600, 900),
  Ck(222.2001, 1, 350, 600, 1360), Ck(224.1, 1, 350, 600, 1210),
  Wk(225.9, -150, -30, 1250), Wk(226.6, -110, -30, 1180),
  Ck(227.9, 2, 350, 620, 1100), Ck(229.0, 2, 250, 660, 820), Ck(230.6, 2, 230, 660, 800), Ck(231.7, 2, 470, 660, 820),
  Ck(233.8, 2, 420, 650, 860), Ck(235.04, 2, 360, 640, 900),
  Ck(235.0401, 3, 350, 600, 1360), Ck(236.4, 3, 300, 640, 860), Ck(238.0, 3, 470, 630, 860), Ck(239.8, 3, 700, 630, 900),
  Wk(241.4, 180, -30, 1300), Wk(242.32, 300, -30, 1250),
  Ck(242.3201, 4, 350, 640, 1750), Ck(244.0, 4, 350, 620, 1600), Ck(245.4, 4, 350, 610, 1480), Ck(247.5, 4, 350, 610, 1380),
  Ck(249.6, 4, 260, 640, 920), Ck(252.3, 4, 320, 620, 900), Ck(254.0, 4, 430, 560, 780), Ck(257.8, 4, 460, 600, 800),
  Ck(259.6, 4, 430, 640, 840), Ck(263.4, 4, 380, 420, 900), Ck(264.8, 4, 350, 330, 820), Ck(266.8, 4, 350, 360, 860),
  Ck(269.2, 4, 350, 600, 1500), Wk(271.8, 0, -30, 1450), Wk(273.2, 0, -30, 1420),
];
function keyWorld(k) {
  if (k.card == null) return { x: k.x, y: k.y, lz: Math.log(H / k.vh), r: 0 };
  const R = REST[k.card], c = Math.cos(R[2]), s = Math.sin(R[2]), lx = (k.cx - 350) * CS, ly = (k.cy - 600) * CS;
  return { x: R[0] + c * lx - s * ly, y: R[1] + s * lx + c * ly, lz: Math.log(H / (k.vh * CS)), r: R[2] };
}
const CAMW = CAM.map(keyWorld);
function camAt(t) {
  if (window.CAMOVR) return window.CAMOVR;
  let i = CAM.findIndex((k) => k.t > t); if (i < 0) i = CAM.length - 1; if (i === 0) i = 1;
  const k0 = CAM[i - 1], k1 = CAM[i], a = CAMW[i - 1], b = CAMW[i];
  const u = smooth((t - k0.t) / (k1.t - k0.t));
  const focus = k0.card != null && k1.card != null ? (u < .5 ? k0.card : k1.card) : (k0.card != null ? k0.card : k1.card);
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: Math.exp(lerp(a.lz, b.lz, u)), r: lerp(a.r, b.r, u), focus };
}

// ---------- drawing ----------
function cardMatrix(CM, st) {
  return CM.translate(st.x, st.y).rotate(st.rot * 180 / Math.PI).scale(CS * st.fx * st.lift, CS * st.lift).translate(-350, -600);
}
function rr(g, x, y, w, h, r) { g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function bboxOf(M, open) {
  if (open > 0) return [0, 0, W, H];
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of [[-20, -20], [720, -20], [720, 1220], [-20, 1220]]) { const p = M.transformPoint(new DOMPoint(x, y)); x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  x0 = Math.max(0, Math.floor(x0) - 4); y0 = Math.max(0, Math.floor(y0) - 4); x1 = Math.min(W, Math.ceil(x1) + 4); y1 = Math.min(H, Math.ceil(y1) + 4);
  return x1 <= x0 || y1 <= y0 ? null : [x0, y0, x1 - x0, y1 - y0];
}
function drawFrameAndBanners(card, a) {
  if (a <= .01) return;
  PR.c.globalAlpha = PR.l.globalAlpha = a;
  part(I, rectP(60, 46, 580, 96), { fill: 'white', line: 5, seed: 1301, smooth: false, step: 24, famp: 1 });
  part(I, rectP(60, 1043, 580, 110), { fill: 'white', line: 5, seed: 1302, smooth: false, step: 24, famp: 1 });
  part(I, rectP(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0), { line: 6, seed: 1303, smooth: false, step: 24 });
  part(I, rectP(24, 22, 652, 1156), { line: 4, seed: 1304, smooth: false, step: 30 });
  part(I, rectP(36, 34, 628, 1132), { line: 2.4, seed: 1305, smooth: false, step: 30 });
  for (const [x, y] of [[36, 34], [664, 34], [36, 1166], [664, 1166]]) part(I, circ(x, y, 9, 8), { fill: 'red', line: 2.4, seed: 1306 + x + y });
  if (card.num) ptext(card.num, 350, 94, 580, 96, 1310);
  else for (const x of [300, 350, 400]) part(I, circ(x, 94, 7, 8), { fill: 'red', line: 2.4, seed: 1311 + x }); // the Fool has no number
  ptext(card.title, 350, 1098, 580, 110, 1320);
  PR.c.globalAlpha = PR.l.globalAlpha = 1;
}
function drawCard(card, st, CM, t, open) {
  const M = cardMatrix(CM, st), bb = bboxOf(M, open); if (!bb) return;
  const g = octx;
  // shadow on the cloth (grows when the card is lifted)
  const lift = st.lift - 1, sh = CM.translate(st.x + 10 + 160 * lift, st.y + 14 + 220 * lift).rotate(st.rot * 180 / Math.PI).scale(CS * st.fx, CS).translate(-350, -600);
  g.setTransform(sh); g.fillStyle = `rgba(5,12,8,${.32 - lift * .6})`;
  for (const e of [0, 10, 22]) { g.beginPath(); rr(g, -e, -e, 700 + 2 * e, 1200 + 2 * e, 30 + e); g.fill(); }
  // card stock (and, when opening, the paper the picture spills onto)
  g.setTransform(M); g.beginPath(); rr(g, 0, 0, 700, 1200, 30);
  const e = open > 0 ? Math.pow(open, 1.6) * 3000 : 0;
  if (open > 0) g.rect(WIN.x0 - e, WIN.y0 - e, WIN.x1 - WIN.x0 + 2 * e, WIN.y1 - WIN.y0 + 2 * e);
  PAT.stock.setTransform(new DOMMatrix().scale(1.5)); g.fillStyle = PAT.stock; g.fill('nonzero');
  g.save(); g.beginPath(); rr(g, 0, 0, 700, 1200, 30); g.clip(); g.globalAlpha = 1 - open;
  g.strokeStyle = 'rgba(140,90,40,.22)'; g.lineWidth = 46; g.beginPath(); rr(g, 0, 0, 700, 1200, 30); g.stroke();
  g.strokeStyle = 'rgba(120,75,30,.25)'; g.lineWidth = 12; g.beginPath(); rr(g, 0, 0, 700, 1200, 30); g.stroke();
  g.restore();
  // print: colour stencils and key block on their own layers
  const C = PR.c, L = PR.l;
  for (const x of [C, L]) { x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(...bb); x.setTransform(M); }
  PR.off = card ? card.off : { red: [3, -3], blue: [-3, 3], yellow: [2, 3] };
  if (card) {
    for (const x of [C, L]) { x.save(); x.beginPath(); x.rect(WIN.x0 - e, WIN.y0 - e, WIN.x1 - WIN.x0 + 2 * e, WIN.y1 - WIN.y0 + 2 * e); x.clip(); }
    try { card.scene(t); } catch (err) { console.error(err); }
    C.restore(); L.restore();
    drawFrameAndBanners(card, 1 - open);
  } else drawBack();
  // ink starvation and paper tooth, in card space so they scale with the card
  for (const [x, p] of [[C, PAT.mottle], [L, PAT.tooth]]) {
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.beginPath(); x.rect(...bb); x.clip(); x.setTransform(M);
    p.setTransform(new DOMMatrix().scale(1)); x.globalCompositeOperation = 'destination-out'; x.fillStyle = p;
    x.fillRect(-4000, -4000, 8700, 9200); x.restore();
  }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply';
  g.drawImage(LC, bb[0], bb[1], bb[2], bb[3], bb[0], bb[1], bb[2], bb[3]);
  g.globalAlpha = .96; g.drawImage(LL, bb[0], bb[1], bb[2], bb[3], bb[0], bb[1], bb[2], bb[3]);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

function drawTable(CM, t) {
  const g = octx; g.setTransform(CM);
  const inv = CM.inverse(), c0 = inv.transformPoint(new DOMPoint(0, 0)), c1 = inv.transformPoint(new DOMPoint(W, H));
  const c2 = inv.transformPoint(new DOMPoint(W, 0)), c3 = inv.transformPoint(new DOMPoint(0, H));
  const xs = [c0.x, c1.x, c2.x, c3.x], ys = [c0.y, c1.y, c2.y, c3.y];
  const bx = Math.min(...xs) - 10, by = Math.min(...ys) - 10, bw = Math.max(...xs) - bx + 20, bh = Math.max(...ys) - by + 20;
  PAT.cloth.setTransform(new DOMMatrix().scale(1.4)); g.fillStyle = PAT.cloth; g.fillRect(bx, by, bw, bh);
  // soft folds in the cloth
  for (const [x, y, a, w] of [[-700, 200, .4, 260], [500, -400, -.3, 320], [900, 380, .2, 200]]) {
    const gr = g.createLinearGradient(x - w * Math.cos(a), y - w * Math.sin(a), x + w * Math.cos(a), y + w * Math.sin(a));
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.45, 'rgba(255,255,230,.05)'); gr.addColorStop(.55, 'rgba(0,0,0,.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(bx, by, bw, bh);
  }
  // a lamp pool over the spread
  const rg = g.createRadialGradient(0, -30, 150, 0, -30, 1500);
  rg.addColorStop(0, 'rgba(255,225,160,.10)'); rg.addColorStop(.55, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,.5)');
  g.fillStyle = rg; g.fillRect(bx, by, bw, bh);
  // starlight spills onto the cloth around THE STAR at the end
  const sl = ease(t, 266.6, 270.5) * .55;
  if (sl > 0) {
    g.globalCompositeOperation = 'screen';
    const sg = g.createRadialGradient(REST[4][0], REST[4][1], 120, REST[4][0], REST[4][1], 620);
    sg.addColorStop(0, `rgba(255,214,120,${sl})`); sg.addColorStop(1, 'rgba(255,214,120,0)');
    g.fillStyle = sg; g.fillRect(bx, by, bw, bh); g.globalCompositeOperation = 'source-over';
  }
}
function drawDeck(CM, t) {
  const left = 12 - DEAL.filter((d) => t >= d[0]).length, g = octx;
  for (let k = 0; k < left; k++) {
    const st = { x: DECK[0] - k * 1.6, y: DECK[1] - k * 2.2, rot: DECK[2], lift: 1, fx: 1, face: false };
    if (k < left - 1) {
      const M = cardMatrix(CM, st); g.setTransform(M);
      g.fillStyle = k === 0 ? 'rgba(5,12,8,.35)' : '#d9c9a2'; g.beginPath(); rr(g, k === 0 ? 20 : 0, k === 0 ? 28 : 0, 700, 1200, 30); g.fill();
      g.strokeStyle = 'rgba(60,40,20,.55)'; g.lineWidth = 5; g.stroke();
    } else drawCard(null, st, CM, t, 0);
  }
}

function renderFrame(t) {
  const cam = camAt(t);
  const CM = new DOMMatrix().translate(W / 2, H / 2).scale(cam.z).rotate(-cam.r * 180 / Math.PI).translate(-cam.x, -cam.y);
  octx.setTransform(1, 0, 0, 1, 0, 0); octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1;
  drawTable(CM, t);
  drawDeck(CM, t);
  const vhCard = H / cam.z / CS;
  const open = smooth((1150 - vhCard) / 250);
  const order = [0, 1, 2, 3, 4].filter((i) => i !== cam.focus || open <= 0);
  if (cam.focus != null && open > 0) order.push(cam.focus);
  // a card still travelling from the deck rides on top
  order.sort((a, b) => (a === cam.focus && open > 0 ? 1 : 0) - (b === cam.focus && open > 0 ? 1 : 0) || (t < DEAL[a][1]) - (t < DEAL[b][1]));
  for (const i of order) {
    const st = cardState(i, t); if (!st) continue;
    drawCard(st.face ? CARDS[i] : null, st, CM, t, i === cam.focus ? open : 0);
  }
  // an old-print vignette over everything
  const g = octx; g.setTransform(1, 0, 0, 1, 0, 0);
  const vg = g.createRadialGradient(W / 2, H / 2, H * .5, W / 2, H / 2, W * .65);
  if (!window.CAMOVR) { vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(25,15,5,.28)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); }
}

const params = new URLSearchParams(location.search);
window.__frameJPEG = (t, q = .93) => { renderFrame(t); return out.toDataURL('image/jpeg', q); };
window.__ready = (async () => { try { await document.fonts.load(`64px ${FONT}`); } catch (e) {} return true; })();

if (!params.has('offline')) {
  const audio = document.getElementById('a');
  const T0 = parseFloat(params.get('a') || 213), T1 = parseFloat(params.get('b') || 273);
  audio.currentTime = params.has('t') ? parseFloat(params.get('t')) : T0;
  (function loop() { let t = audio.currentTime || T0; if (t >= T1) { audio.currentTime = T0; t = T0; } renderFrame(t); requestAnimationFrame(loop); })();
  const toggle = () => audio.paused ? audio.play() : audio.pause();
  out.onclick = toggle;
  window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } });
}
