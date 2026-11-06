/* The film: seek(clipSeconds) is a pure function of time. Beat times are in clip seconds of the voice track;
   the word that is quoted on screen lives in work/cues.js (local, gitignored). */
const CU = window.CUES, FW = 720, FH = 1280; // 9:16 is the master frame for this film
const T = { template:87.83, land:91.55, spin0:92.2, spin1:95.9, see:96.61, ten:99.27, open:100.91, fill:102.67, turn1:103.09, turn2:105.85, tryLock:107.71, sell:109.69,
  finish:116.31, a1:120.29, a2:125.81, leave:127.0, press1:88.9, press2:133.5, a3:134.43, last:137.07, end:138.3 };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), prog = (s, a, b) => clamp((s - a)/(b - a)), lerp = (a, b, k) => a + (b - a)*k;
const smooth = k => k*k*(3 - 2*k);
const backOut = k => { const c = 1.7; const u = k - 1; return 1 + (c + 1)*u*u*u + c*u*u; };
const bounce = k => { const a = 1 - k; return k >= 1 ? 0 : -Math.abs(Math.cos(k*Math.PI*2.2))*a*a; };

// clones of the machine as sales climb. Offsets on the bench; each lands in turn.
const RACK = [98, 72], BOTTLE = [66, -8], STACK = Z1 + 7, CLONES = [[-74, 0, 0], [-74, -92, 0], [-74, 92, 0], [-74, 0, STACK], [-74, -92, STACK], [-74, 92, STACK], [-74, 0, 2*STACK]];
const tower0 = s => smooth(prog(s, T.sell, T.sell + 3))*(1 - .4*smooth(prog(s, T.a3, T.end)));
// after the tower lands every machine keeps going by itself: a click, a sweet off the tray, a bounce, a roll across the bench
const DRIPS = (() => { const out = [], g = rnd(91); CLONES.forEach((c, i) => { for (let t = 112.95 + i*.19; t < 127.2; t += .8 + g()*.5) out.push({ t, i, col:SWEETS[Math.floor(g()*SWEETS.length)], vx:9 + g()*15, vy:(g() - .5)*30 }); }); return out; })();
const cloneRot = (i, s) => DRIPS.reduce((a, d) => d.i === i ? a + smooth(prog(s, d.t - .3, d.t)) : a, 0);
function dripAt(d, s){ const [dx, dy, dz] = CLONES[d.i], u = s - d.t, x0 = dx + TRAY_X1 + .5, y0 = dy + CY + d.vy*.25, z0 = dz + TRAY_Z + 4, zg = BOARD_H + 2.8, G = 300, T_ = Math.sqrt(2*(z0 - zg)/G);
  if (u < T_) return [x0 + d.vx*u*.5, y0 + d.vy*u*.4, z0 - .5*G*u*u];
  const v = u - T_, roll = 1 - Math.exp(-v*2.4); let x = x0 + d.vx*T_*.5 + d.vx*1.2*roll, y = y0 + d.vy*T_*.4 + d.vy*1.1*roll;
  if (y > -6 && y < D + 6 && x > -5 && x < W + 18) x = x < 16 ? -5 : W + 18;
  x = Math.min(BX[1] - 6, x); y = Math.max(BY[0] + 6, Math.min(BY[1] - 6, y));
  return [x, y, zg + Math.abs(Math.sin(v*11))*7*Math.exp(-v*5)]; }
const worldShift = (dx, dy, dz = 0) => { const a = P(0, 0, 0), b = P(dx, dy, dz); return [b[0] - a[0], b[1] - a[1]]; };

function scene(st, m){
  const k = ease(st.xr || 0), bodyPts = [...on(PX(0), OUT), ...on(PX(W), OUT)];
  let s = board(BX[0], BY[0], BX[1], BY[1], BOARD_H, 12, WOOD) + sawdust();
  const top = boardTop(BX[0], BY[0], BX[1], BY[1], BOARD_H, 12);
  const items = [coasters(74, -38), holder(46, 104), cupcake(84, 34), pencil(42, -44)];
  const machineUp = st.drop < 1, dropPx = machineUp ? (1 - st.drop)*(1 - st.drop)*320*INK_K : 0;
  // the shadows first, so nothing paints over a part
  if (st.drop > 0) s += `<g opacity="${f(smooth(st.drop))}">${castShadow(bodyPts, BOARD_H, top)}</g>`;
  else s += castShadow([[stubBox.x0, stubBox.y0, stubBox.z1], [stubBox.x1, stubBox.y0, stubBox.z1], [stubBox.x1, stubBox.y1, stubBox.z1], [stubBox.x0, stubBox.y1, stubBox.z1], [stubBox.x0, stubBox.y0, stubBox.z0], [stubBox.x1, stubBox.y0, stubBox.z0], [stubBox.x1, stubBox.y1, stubBox.z0], [stubBox.x0, stubBox.y1, stubBox.z0]], BOARD_H, top);
    CLONES.forEach(([dx, dy, dz], i) => { const a = st.clones[i]; if (a <= 0) return;
    const [sx, sy] = worldShift(dx, dy, dz), up = (1 - a)*(1 - a)*240*INK_K;
    if (!dz) s += `<g opacity="${f(smooth(a))}">${castShadow(bodyPts.map(([x, y, z]) => [x + dx, y + dy, z]), BOARD_H, top)}</g>`;
    items.push({ box:[[dx, dy, BOARD_H + dz], [dx + W + 17, dy + D, Z1 + 9 + dz]], svg:`<g transform="translate(${f(sx)} ${f(sy - up)})">${closedMachine({ rot:cloneRot(i, st.t), jiggle:0, level:1, hatch:0, doses:[], t:0 })}</g>` }); });
  for (const d of DRIPS) if (st.t >= d.t){ const [x, y, z] = dripAt(d, st.t); items.push({ box:[[x - 2.8, y - 2.8, z - 2.8], [x + 2.8, y + 2.8, z + 2.8]], svg:ball(x, y, z, 2.8, d.col, .7) }); }
  if (st.cash > 0) items.push({ box:[[100, 24, BOARD_H], [132, 104, BOARD_H + 34]], svg:cashPile(116, 64, st.cash) });
  if (st.rack > 0){ const up = (1 - st.rack)*(1 - st.rack)*170*INK_K; items.push({ box:[[RACK[0] - 8, RACK[1] - 19, BOARD_H], [RACK[0] + 8, RACK[1] + 19, BOARD_H + 52]], svg:`<g transform="translate(0 ${f(-up)})">${testRack(RACK[0], RACK[1], st.rackHot, st.labFx)}</g>` }); }
  if (st.bottle > 0){ const up = (1 - st.bottle)*(1 - st.bottle)*230*INK_K + Math.abs(Math.sin(st.bottleB*9))*Math.exp(-st.bottleB*6)*26*INK_K; items.push({ box:[[BOTTLE[0] - 10, BOTTLE[1] - 10, BOARD_H], [BOTTLE[0] + 10, BOTTLE[1] + 10, BOARD_H + 44]], svg:`<g transform="translate(0 ${f(-up)})">${poisonBottle(BOTTLE[0], BOTTLE[1])}</g>` }); }
  if (st.labFx.sweet > 0 && st.labFx.sweet < 1){ const u = st.labFx.sweet, x = lerp(W + 10, RACK[0], u), y = lerp(CY, RACK[1], u), z = lerp(8, BOARD_H + 34, u) + 34*Math.sin(u*Math.PI); items.push({ box:[[x - 3, y - 3, z - 3], [x + 3, y + 3, z + 3]], svg:ball(x, y, z, 2.8, '#d8432f', .8) }); }
  // the machine itself
  let main;
  if (st.drop <= 0) main = '';
  else if (k > 0){ const tr = trayPart(), FRONT = facing([1, 0, 0]);
    const ghost = xrGhost(caseBody(st, false), '', k, OUT, 0, W, MAH);
    main = feet() + ghost + `<g opacity="${f(k)}">${mech(st)}</g>` + (FRONT ? '' : '') + tr.base + trayContents(st, false) + tr.lips + `<g opacity="${f(.55 + .45*k)}">${dial(st)}</g>` + lid(st);
  } else main = closedMachine(st);
  if (dropPx > 0) main = `<g transform="translate(0 ${f(-dropPx)})">${main}</g>`;
  if (st.drop < 1) main = stub(st) + main;
  items.push({ box:[[0, 0, BOARD_H], [W + 17, D, Z1 + 9]], svg:main });
  s += byDepth(items);
  // the puff when it lands on the stub
  if (st.puff > 0 && st.puff < 1){ const g = rnd(5); for (let i = 0; i < 26; i++){ const a = g()*2*Math.PI, d = 8 + g()*62*Math.sqrt(st.puff), z = BOARD_H + 3 + 22*st.puff*g()*(1 - st.puff)*4, x = W/2 + d*Math.cos(a), y = D/2 + d*Math.sin(a), [X, Y] = P(x, y, z), r = (1.6 + g()*2.6)*INK_K*(1 - st.puff*.5);
      s += `<circle cx="${f(X)}" cy="${f(Y)}" r="${f(r)}" fill="${i % 2 ? '#f0d9ae' : '#c9a26b'}" opacity="${f(1 - st.puff)}"/>`; } }
  // falling sweets for the hatch
  if (st.pour > 0) for (let i = 0; i < 12; i++){ const u = clamp(st.pour*2.4 - i*.11); if (u <= 0 || u >= 1) continue; const z = Z1 + 34 - u*u*(Z1 + 34 - DR_Z - 12), x = NECK_X + ((i*37) % 7) - 3, y = CY + ((i*53) % 9) - 4; s += ball(x, y, z, 3.4, SWEETS[i % SWEETS.length], .7); }
  // the labels: part names in two columns; later their words change one at a time
  const kl = prog(k, .6, .9)*st.labelK; if (kl > 0) s += `<g opacity="${f(kl)}">` + pillCols(MECH_ITEMS(st), st.flip) + '</g>';
  // the labels that spread off the machine onto the bench, and the one that comes back
  if (st.rackHot[1] > .4 && st.t < T.leave){ const [X, Y] = P(RACK[0], RACK[1] + 12, BOARD_H + 34), v = fig().viewBox.baseVal, k_ = FW/v.width; s += pill('POSITIVE', (X - v.x)*k_ - 96, (Y - v.y)*k_ + 26, true, X, Y); }
  for (const q of st.pops) s += `<g opacity="${f(q.a)}">${pill(q.text, q.px, q.py - 14*(1 - q.a), true)}</g>`;
  for (const e of st.extra) s += `<g opacity="${f(e.a)}">${onePill(e.at, e.px, e.py)}</g>`;
  return s;
}

/* screen pixels and drawing units, for the current view */
const fig = () => document.getElementById('fig');
const toUnits = (px, py) => { const v = fig().viewBox.baseVal, k = v.width/FW; return [v.x + px*k, v.y + py*k]; };
function pill(text, px, py, on, atX, atY){ const v = fig().viewBox.baseVal, k = v.width/FW, fs = 15*k, hgt = 30*k, w = (text.length*15*.64 + 24)*k, [cx, cy] = toUnits(px, py);
  const dot = atX === undefined ? '' : `<path d="M${f(atX)} ${f(atY)}L${f(cx)} ${f(cy)}" fill="none" stroke="${INK}" stroke-width="${f(1.1*k)}"/><circle cx="${f(atX)}" cy="${f(atY)}" r="${f(2.5*k)}" fill="${INK}"/>`;
  return dot + `<rect x="${f(cx - w/2)}" y="${f(cy - hgt/2)}" width="${f(w)}" height="${f(hgt)}" rx="${f(hgt/2)}" fill="${on ? '#f4b829' : '#fff4d6'}" stroke="${INK}" stroke-width="${f(1.3*k)}"/>`
    + `<text x="${f(cx)}" y="${f(cy + fs*.36)}" font-size="${f(fs)}" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-weight="800" letter-spacing=".04em" fill="${INK}">${text}</text>`; }
function pillCols(items, flip){ let s = ''; const rows = [0, 0], order = items.map((it, i) => ({ ...it, i }));
  for (const it of order){ const [X, Y] = P(...it.at), left = it.side === 0, r = rows[it.side]++, px = left ? 102 : 618, py = (left ? 356 : 392) + r*68; const flipped = flip > it.i, text = flipped ? CU.word : it.text;
    s += pill(text, px, py, flipped || it.on, X, Y); }
  return s; }
function onePill(at, ox, oy){ const [X, Y] = P(...at), v = fig().viewBox.baseVal, k = FW/v.width; return pill(CU.word, (X - v.x)*k + ox, (Y - v.y)*k + oy, true, X, Y); }

const ui = mountFigure({ fig:'01', title:'Candy machine', turn:'full', palette:'mustard', credit:false,
  size:[120, 120, 130], center:[W/2, CY],
  state:{ xr:0, rot:0, jiggle:0, level:.55, hatch:0, pour:0, drop:0, puff:0, chalk:0, flip:0, finish:false, moving:false, locked:false, stop:0, pawl:0, doses:[], t:0, clones:CLONES.map(() => 0), extra:[], pops:[], labelK:1, hop:0, rack:0, rackHot:[0, 0, 0], labFx:{ bubble:0, bubbling:false, dropper:0, drop:-1, sweet:0 }, cash:0, bottle:0, bottleB:0 }, scene });

/* ---------- the frame: her page laid out for a 1280 x 720 film ---------- */
const svgEl = fig(), vb0 = svgEl.viewBox.baseVal, mUnits = Math.hypot(P(0, 0, Z1)[0] - P(0, 0, 0)[0], P(0, 0, Z1)[1] - P(0, 0, 0)[1]), VW = FW*mUnits/400, VH = VW*FH/FW;
const css = document.createElement('style');
css.textContent = `html,body{width:720px;height:1280px;overflow:hidden}body{padding:0;display:block;position:relative}
  *{transition:none!important;animation:none!important}
  header,#readout,.controls,.idea,.made-with{display:none!important}
  .stage{position:absolute;inset:0;max-width:none;width:720px;height:1280px}
  #fig{position:absolute;left:0;top:0;width:720px;height:1280px;max-width:none;margin:0}
  #rt{position:absolute;left:36px;right:36px;top:44px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:14px 18px;z-index:2}
  #rt .stat{background:rgba(236,233,225,.9);border-radius:10px;padding:4px 10px}
  #rt .stat .k{font:700 14px ui-monospace,Menlo,monospace;letter-spacing:.12em;color:var(--muted)}
  #rt .stat .v{font:800 42px/1.05 ui-monospace,Menlo,monospace;font-variant-numeric:tabular-nums}
  .sw2{font:600 19px/1.2 ui-monospace,Menlo,monospace;border:1.5px solid var(--ink);border-radius:999px;padding:9px 20px;background:var(--paper);color:var(--ink)}
  .sw2.on{background:var(--ink);color:var(--paper)}
  #take{position:absolute;left:50%;bottom:150px;transform:translateX(-50%);font:700 26px/1.2 ui-monospace,Menlo,monospace;border:1.5px solid var(--ink);border-radius:999px;padding:14px 34px;background:#f4b829;color:#231e16;z-index:3}
  #toast2{position:absolute;left:36px;top:210px;display:flex;align-items:center;gap:9px;font:600 21px/1.3 ui-monospace,Menlo,monospace;color:#231e16;background:#fff1bf;border:1px solid rgba(35,30,22,.28);border-radius:8px;box-shadow:0 8px 22px rgba(35,30,22,.16);padding:8px 16px 8px 11px;z-index:4;white-space:nowrap}
  #toast2::before{content:"!";flex:none;width:21px;height:21px;border-radius:50%;background:#231e16;color:#fff1bf;font:800 14px/21px ui-monospace,Menlo,monospace;text-align:center}
  #cur{position:absolute;left:0;top:0;width:26px;height:34px;z-index:5;pointer-events:none}
  #credit{position:absolute;right:30px;bottom:26px;font:600 12px ui-monospace,Menlo,monospace;letter-spacing:.1em;color:var(--muted)}`;
document.head.appendChild(css);
const stage = document.querySelector('.stage');
const el = (t, id) => { const e = document.createElement(t); if (id) e.id = id; stage.appendChild(e); return e; };
const rt = el('div', 'rt'); rt.innerHTML = `<div class="stat" id="stP"><div class="k">PER TURN</div><div class="v" id="vP"></div></div><div class="stat"><div class="k">TURNS TODAY</div><div class="v" id="vT"></div></div><div class="stat"><div class="k">MILLION BUCKS</div><div class="v" id="vM"></div></div><div class="sw2" id="swX">See-through</div>`;
const toast2 = el('div', 'toast2'), cur = el('div', 'cur'), take = el('div', 'take'); toast2.textContent = 'Two turns a day'; take.textContent = 'Please take one';
cur.innerHTML = `<svg viewBox="0 0 26 34" width="26" height="34"><path d="M2 2L2 26L8.5 20.5L13 31L18 29L13.5 18.8L22 18.2Z" fill="#fff" stroke="#231e16" stroke-width="2" stroke-linejoin="round"/></svg>`;
el('div', 'credit').textContent = 'MADE WITH COLORFIGURES';
const vP = document.getElementById('vP'), vT = document.getElementById('vT'), vM = document.getElementById('vM'), swX = document.getElementById('swX'), stP = document.getElementById('stP');
const dialPx = () => { const [X, Y] = P(W + 5.4, CY, ROT_Z), v = svgEl.viewBox.baseVal, k = FW/v.width; return [(X - v.x)*k, (Y - v.y)*k]; };

window.seek = function(s){
  const st = ui.st;
  st.t = s;
  // the camera: slow drift, one full walk round the machine, then a push in while it opens
  const walk = smooth(prog(s, T.spin0, T.spin1)), drift = 4*Math.sin((s - 87)*.31);
  const crane = smooth(prog(s, 113.3, 115.2))*(1 - smooth(prog(s, 118.4, 120.2))), orbit = smooth(prog(s, 113.3, 119.9)), after = prog(s, 120, 121.2)*(1 - prog(s, 126.2, 127));
  setCam(YAW0 + 360*walk + drift + 360*orbit + 13*Math.sin((s - 120)*1.05)*after, PITCH0 + 1.8*Math.sin((s - 87)*.19) + 7*crane + 3.5*Math.sin((s - 120)*.8)*after);
  st.labelK = (1 - smooth(prog(s, 112.9, 113.4))) + smooth(prog(s, 119.6, 120.1));
  const popA = (a, b) => prog(s, a, a + .1)*(1 - prog(s, b, b + .2));
  st.pops = [{ text:'FOOD SAFE FINISH', px:360, py:300, a:popA(T.finish, 118.5) }, ...CU.blah.map((t, i) => ({ text:CU.blahWord, px:[210, 500, 340][i], py:[370, 440, 510][i], a:popA(t, 118.6) }))].filter(q => q.a > 0);
  const ph = s >= T.a1 && s < T.leave ? (s - T.a1) % .58 : 9; st.hop = 2*Math.exp(-ph*8)*Math.abs(Math.sin(ph*26));
  st.rack = prog(s, CU.test - .3, CU.test) ; st.rackHot = [0, .1, .2].map(d => smooth(prog(s, T.a2 + d, T.a2 + d + .25)));
  // the test, quickly: a sweet goes in, the dropper comes down and drips, it bubbles, then the answer
  const dT = s - (CU.test + .55);
  st.labFx = { sweet:prog(s, CU.test, CU.test + .42), bubbling:s >= CU.test + .42 && s < T.a2 + 1.2, bubble:(s*1.7) % 1, dropper:smooth(prog(s, CU.test + .35, CU.test + .6))*(1 - smooth(prog(s, T.a2 - .12, T.a2 + .1))), drop:dT > 0 && s < T.a2 ? (dT % .28)/.28 : -1 };
  // the money: bundles land as sales climb, and are gone almost as soon as he says the word
  const cashK = prog(s, T.sell + .1, T.a1 - .4); st.cash = Math.round(36*cashK*(1 - smooth(prog(s, T.a1 + .1, T.a1 + .9))));
  st.bottle = prog(s, T.a1 - .3, T.a1); st.bottleB = Math.max(0, s - T.a1);
  st.chalk = smooth(prog(s, T.template, T.template + 1.2));
  st.drop = s < T.land - .42 ? 0 : prog(s, T.land - .42, T.land);
  if (s >= T.land - .42 && s < T.land) st.drop = Math.max(.01, st.drop);
  st.puff = s >= T.land ? prog(s, T.land, T.land + .8) : 0;
  st.xr = (prog(s, T.see, T.see + .6))*(1 - prog(s, T.leave - .5, T.leave));
  // fill: hatch lifts on the word, the sweets pour, the level rises
  const up = smooth(prog(s, T.open - .1, T.open + .35)), dn = smooth(prog(s, T.fill + .05, T.fill + .4));
  st.hatch = up*(1 - dn); st.pour = prog(s, T.open + .3, T.fill + .2);
  st.level = lerp(.55, 1, smooth(prog(s, T.open + .55, T.fill + .3)));
  // the dial: a quarter turn on each word, a jiggle when it locks, one last click by itself at the end
  const q = (a, d = .45) => smooth(prog(s, a, a + d));
  st.rot = q(T.turn1) + q(T.turn2) + q(T.last, .3);
  const jg = prog(s, T.tryLock + .45, T.tryLock + 1.15); st.jiggle = jg > 0 && jg < 1 ? .12*Math.sin(jg*Math.PI*6)*(1 - jg) : 0;
  st.moving = (s >= T.turn1 && s < T.turn1 + 1.2) || (s >= T.turn2 && s < T.turn2 + 1.2);
  st.locked = s >= T.tryLock + .4 && s < T.tryLock + 1.8;
  st.stop = prog(s, T.turn2 + .3, T.turn2 + .5);
  const clickPh = t => { const u = prog(s, t, t + .45); return u > 0 && u < 1 ? Math.abs(Math.sin(u*Math.PI*3)) : 0; }; st.pawl = clickPh(T.turn1) + clickPh(T.turn2) + clickPh(T.last);
  st.doses = [{ t0:T.turn1 + .28, n:10, base:0 }, { t0:T.turn2 + .28, n:10, base:10 }, { t0:T.last + .2, n:1, base:20 }];
  st.finish = s >= T.finish && s < T.a1 - .5;
  // sales: the machines land, the number climbs and then stops dead
  st.clones = CLONES.map((_, i) => prog(s, T.sell + i*.42, T.sell + i*.42 + .42));
  // the part names turn into one word, one at a time, and the word jumps off the machine
  st.flip = s < T.a1 ? 0 : s >= T.leave ? 0 : Math.min(9, 1 + Math.floor((s - T.a1)/.58));
  const X = (a, b) => prog(s, a, a + .12)*(1 - prog(s, T.leave - .4, T.leave))*(b ?? 1);
  st.extra = [];
  const add = (t0, at, px, py) => { const a = X(t0); if (a > 0) st.extra.push({ a, at, px, py }); };
  add(T.a2, [84, 34, BOARD_H + 19], 30, 66); add(T.a2 + .35, [74, -38, BOARD_H + 13], 20, 74); add(T.a2 + .7, [46, 104, BOARD_H + 22], -20, 74); add(T.a2 + 1.1, [CLONES[6][0] + W, CLONES[6][1] + D/2, CLONES[6][2] + 70], 130, -20); add(T.a2 + 1.5, [CLONES[5][0] + W, CLONES[5][1] + D/2, CLONES[5][2] + 70], -96, -40);
  const lb = prog(s, T.a3, T.a3 + .12); if (lb > 0) st.extra.push({ a:lb, at:[W + .3, CY - 12, DR_Z + 8], px:110, py:-96 });
  // the view
  const inK = smooth(prog(s, T.see - .3, T.see + 1.0))*(1 - smooth(prog(s, T.sell - .3, T.sell + 1.2))), endK = smooth(prog(s, T.a3 + .6, T.end));
  const rkK = smooth(prog(s, CU.test - .35, CU.test + .1))*(1 - smooth(prog(s, T.a2 + .8, T.a2 + 1.5)));
  const crK = smooth(prog(s, 113.3, 115.2))*(1 - smooth(prog(s, 118.4, 120.2))), arK = smooth(prog(s, 120, 121.8))*(1 - smooth(prog(s, 124.6, 126.8)));
  const pull = (1 + .26*inK + .1*endK - .18*tower0(s) - .2*crK + .3*arK + .35*rkK + .02*Math.sin(s*1.3)) + .22*smooth(prog(s, T.template, T.land - .5))*(1 - smooth(prog(s, T.land, T.land + .5)));
  const [fx, fy] = P(lerp(W/2 - 74*crK, RACK[0], .72*rkK), lerp(CY, RACK[1], .72*rkK), lerp(60 + 112*crK, 28, .72*rkK)), tower = smooth(prog(s, T.sell, T.sell + 3)), vw = VW/pull, vh = VH/pull, vx = fx - vw/2, vy = fy - vh*(.5 + .1*tower);
  svgEl.setAttribute('viewBox', `${vx.toFixed(2)} ${vy.toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}`);
  ui.render();
  // the readout
  stP.style.display = s >= T.ten ? '' : 'none'; vP.textContent = '10';
  const turns = (s >= T.turn1 + .25 ? 1 : 0) + (s >= T.turn2 + .25 ? 1 : 0); vT.textContent = `${turns}/2`;
  const mk = prog(s, T.sell, T.a1); vM.textContent = (mk*mk*.0031).toFixed(4);
  swX.classList.toggle('on', (s >= T.press1 && s < T.land) || (s >= T.see && s < 127.7) || s >= T.press2 && s < T.a3 - .1 || s >= 141 && s < 142);
  // the pointer: See-through, the dial twice, a third try, then See-through off
  const sr = swX.getBoundingClientRect(), hx = sr.left + sr.width/2 - 8, hy = sr.top + sr.height/2 - 2, [dx, dy] = dialPx(), ptr = [dx + 6, dy + 2];
  const path = [[T.see - .9, 780, 420], [T.see - .08, hx, hy], [T.see + .5, hx, hy], [T.turn1 - .7, 780, 820], [T.turn1 - .02, ...ptr], [T.turn1 + .5, ...ptr], [T.turn2 - .02, ...ptr], [T.turn2 + .5, ...ptr], [T.tryLock + .4, ...ptr], [T.tryLock + 1.3, ...ptr], [T.tryLock + 2, 780, 860]];
  const toSwitch = (t) => [[t - .75, 780, 300], [t - .02, hx, hy], [t + .3, hx, hy], [t + .85, 790, 300]];
  path.unshift(...toSwitch(T.press1)); const later = toSwitch(T.press2);
  let cx = 800, cy = 800, show = 0;
  for (let i = 0; i < path.length - 1; i++){ const [a, ax, ay] = path[i], [b, bx, by] = path[i + 1]; if (s >= a && s < b){ const u = smooth(prog(s, a, b)); cx = lerp(ax, bx, u); cy = lerp(ay, by, u); show = 1; } }
  for (let i = 0; i < later.length - 1; i++){ const [a, ax, ay] = later[i], [b, bx, by] = later[i + 1]; if (s >= a && s < b){ const u = smooth(prog(s, a, b)); cx = lerp(ax, bx, u); cy = lerp(ay, by, u); show = 1; } }
  const press = (s >= T.see - .08 && s < T.see + .08) || (s >= T.press1 - .02 && s < T.press1 + .14) || (s >= T.press2 - .02 && s < T.press2 + .14) || (s >= T.turn1 && s < T.turn1 + .45) || (s >= T.turn2 && s < T.turn2 + .45);
  cur.style.display = show ? '' : 'none'; cur.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px) scale(${press ? .86 : 1})`;
  const tn = prog(s, T.tryLock + .45, T.tryLock + .6)*(1 - prog(s, T.tryLock + 2, T.tryLock + 2.3)); toast2.style.display = tn > 0 ? '' : 'none'; toast2.style.opacity = tn.toFixed(2);
  take.style.display = s >= T.last + .65 && s < 141 ? '' : 'none'; take.style.transform = `translateX(-50%) scale(${(1 + .07*Math.sin((s - T.last)*6.5)).toFixed(3)})`;
};
window.setup = async () => { await new Promise(r => setTimeout(r, 900)); window.seek(CU.s0); await document.fonts.ready; };
