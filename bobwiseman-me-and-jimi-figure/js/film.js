/* The film: seek(songSeconds) is a pure function of time, so frames can be drawn in any order. Words are read from
   work/cues.js (local, gitignored); this file names the beats by time and quotes no lyric. */
const CU = window.CUES, LN = CU.lines, wordT = (l, w) => LN[l].words[w].t;
const T = { heard:wordT(0, 1), turn0:wordT(1, 0), turn1:wordT(3, 1) - .2, stare0:wordT(3, 1), inspect:wordT(3, 5), yrs0:wordT(3, 5) + .55, yrs1:wordT(4, 0),
  chq0:wordT(4, 2), chq:wordT(4, 6), ashamed:wordT(5, 1), missed:wordT(5, 3), train:wordT(5, 5), name:wordT(6, 0), hit:187.01 };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), prog = (s, a, b) => clamp((s - a)/(b - a)), lerp = (a, b, k) => a + (b - a)*k;
const smooth = k => k*k*(3 - 2*k);
const YEAR0 = 1986, YEAR1 = 2026;

function scene(st, m){
  const k = ease(st.xr || 0), pts = [...on(PX(0), OUT), ...on(PX(W), OUT)];
  let s = board(BX[0], BY[0], BX[1], BY[1], BOARD_H, 10, WOOD);
  const top = boardTop(BX[0], BY[0], BX[1], BY[1], BOARD_H, 10);
  s += castShadow([...pts, [1, 1, COVER], [W - 1, 1, COVER], [1, D - 1, COVER], [W - 1, D - 1, COVER]], BOARD_H, top);
  s += castShadow([[46, -62, 28], [66, -62, 28], [66, -30, 28], [46, -30, 28], [46, -62, BOARD_H], [66, -62, BOARD_H], [66, -30, BOARD_H], [46, -30, BOARD_H]], BOARD_H, top);
  s += rails();
  // mains lead: out of the back, over the board to the plug. The plug lies by the power strip until the end.
  const plug = [lerp(-28, -28, st.plug), lerp(46, 31, smooth(st.plug))], lead = [[0, 20, PZ0 + 7], [-4, 21, BOARD_H + 2], [-9, 26, BOARD_H + .7], [-30, 34, BOARD_H + .7], [-38, plug[1] + 14, BOARD_H + .7], [plug[0] - 2, plug[1] + 9, BOARD_H + .7]];
  const ld = pd(lead, false);
  s += `<path d="${ld}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="${ld}" fill="none" stroke="#4d4840" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += box(-34, 4, BOARD_H, -22, 30, BOARD_H + 5, CERAMIC, toneI, 1) + shape([[-31, 26.5, BOARD_H + 5.05], [-25, 26.5, BOARD_H + 5.05], [-25, 22, BOARD_H + 5.05], [-31, 22, BOARD_H + 5.05]], RECESS, .6);
  s += shape(on(PX(-21.9), ellUV(10, BOARD_H + 2.5, 1, 1, 8)), st.power > .5 ? '#ff5b3a' : '#7b3a2c', .4);
  s += box(plug[0] - 3.5, plug[1] - 1, BOARD_H, plug[0] + 3.5, plug[1] + 8, BOARD_H + 4.5, DARK, toneI, .8);

  // the player as one solid, sorted against what stands round it
  const FARCOVER = cover(st, true), COVERTOP = cover(st, false);
  const arm = armParts(st), plat = platter(st);
  plat.svg = `<g opacity="${f(1 - .36*k)}">${plat.svg}</g>`;
  const deck = byDepth([plat, ...arm]);
  const hinge = [18, D - 18].map(y => ({ box:[[-2, y - 5, PZ1 - 3], [2, y + 5, PZ1 + 3]], svg:box(-2, y - 5, PZ1 - 3, 2, y + 5, PZ1 + 3, DARK, toneI, .7) }));
  let body = plinth(st, m);
  let inner = '';
  if (k > 0) inner = xrGhost(body, '', k, OUT, 0, W, m) + `<g opacity="${f(k)}">${mech(st)}</g>`; else inner = body;
  const glass = st.dust >= 0 ? `<g opacity="${f(1 - .86*k)}">` : '<g>';
  const backH = byDepth(hinge.filter(() => !facing([-1,0,0])));
  const frontH = facing([-1,0,0]) ? byDepth(hinge) : '';
  const player = feet() + backH + inner + frontH + glass + FARCOVER + '</g>' + deck + glass + COVERTOP + '</g>';

  // radio: a little transistor set on the near side, with its aerial up
  const rx0 = 46, rx1 = 66, ry0 = -62, ry1 = -30, rz1 = BOARD_H + 26;
  let radio = box(rx0, ry0, BOARD_H, rx1, ry1, rz1, { l:'#93d3b0', m:'#71b693', d:'#2d5a49' }, toneI, 1.4);
  if (facing([1,0,0])){ let g = ''; for (let i = 0; i < 6; i++) g += pd([[rx1 + .1, ry0 + 15, BOARD_H + 5 + i*3], [rx1 + .1, ry1 - 4, BOARD_H + 5 + i*3]], false);
    radio += `<path d="${g}" fill="none" stroke="${INK}" stroke-width=".8"/>` + cylX(rx1, rx1 + 2, ry0 + 8, BOARD_H + 18, 4, CERAMIC, toneI, .8, 16) + cylX(rx1, rx1 + 2, ry0 + 8, BOARD_H + 7, 2.6, DARK, toneI, .7, 12); }
  radio += rod([rx0 + 5, ry0 + 4, rz1], [rx0 + 5 - 10*st.aerial, ry0 + 4 + 8*st.aerial, rz1 + 34], .7, METAL, toneI, .6);

  const items = [ { box:[[-2, -2, BOARD_H], [W + 3, D + 2, COVER]], svg:player }, { box:[[rx0, ry0, BOARD_H], [rx1 + 2, ry1, rz1 + 34]], svg:radio }, ...trainParts(st.train) ];
  // the cheque: feeds out of the slot in the front and hangs over the board, over the track
  if (st.chq > 0){ const y0 = 25, y1 = 87, x0 = W, x1 = W + 1 + 30*st.chq, z = PZ0 + 13.6, droop = 2.2*st.chq;
    const sheet = [[x0, y0, z], [x1, y0, z - droop], [x1, y1, z - droop], [x0, y1, z]];
    let c = shape(sheet, '#fbf3d6', 1.1);
    // the printing appears as the paper comes out: rows are fixed on the sheet, the slot hides what is still inside
    const uX = (W + 1 + 30) - x1;
    const row = (d, str, size, col = INK, weight = 800) => { const x = x1 - d; if (x < x0 + 1.5) return ''; const o = P(x, (y0 + y1)/2, z - droop*(x - x0)/(x1 - x0) + .1);
      return `<text transform="${txM(o, Dv(0, -1, 0), Dv(1, 0, 0))}" font-size="${size}" fill="${col}" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-weight="${weight}" letter-spacing=".03em">${str}</text>`; };
    c += row(22.5, 'CHEQUE', 4.4, RED) + row(14.5, 'AMOUNT DUE: PAY ATTENTION', 3.1) + row(6.5, 'MEMO: ME AND JIMI', 3.1, '#6b5f4a', 700);
    items.push({ box:[[x0 + .1, y0, z - droop - .2], [x1, y1, z + .2]], svg:c });
  }
  // radio: rings of sound while it speaks
  s += byDepth(items);
  if (st.waves > 0 && facing([1,0,0])){ const [X, Y] = P(rx1, ry0 + 8, BOARD_H + 18); let w = '';
    for (let i = 0; i < 3; i++){ const ph = (st.wavePh + i/3) % 1, r = (8 + 26*ph)*INK_K; w += `<path d="M${f(X + r*.72)} ${f(Y - r*.62)}A${f(r)} ${f(r)} 0 0 1 ${f(X + r*.86)} ${f(Y + r*.45)}" fill="none" stroke="${INK}" stroke-width="${f(1.5*st.waves)}" opacity="${f(st.waves*(1 - ph))}" stroke-linecap="round"/>`; }
    s += w; }

  // labels: pills on the parts, lit while they matter
  if (st.tagPlug > 0 && !k) s += `<g opacity="${f(st.tagPlug)}">${tag([plug[0], plug[1] + 2, BOARD_H + 4.5], facing([1,0,0]) ? -46 : 46, -36, 'NOT PLUGGED IN', true)}</g>`;
  if (k > .6){ const pz = PZ1 + 5.4;
    s += `<g opacity="${f(prog(k, .6, .9))}">` + filmLabels(MECH_ITEMS) + nameLeader([PLAT[0], PLAT[1], pz]) + '</g>'; }
  return s;
}

// screen px <-> drawing units for the current view (the viewBox is set before the scene is drawn)
const toUnits = (px, py) => { const v = document.getElementById('fig').viewBox.baseVal, k = v.width/1280; return [v.x + px*k, v.y + py*k]; };
function filmLabels(items){ const k = document.getElementById('fig').viewBox.baseVal.width/1280, fs = 14*k, hgt = 27*k; let s = '';
  const placed = items.map(it => { const [X, Y] = P(...it.at); return { ...it, X, Y }; }).sort((a, b) => a.X - b.X), half = Math.ceil(placed.length/2);
  const cols = [[placed.slice(0, half), 290, 138], [placed.slice(half), 1132, 268]];
  for (const [col, px, top] of cols){ col.sort((a, b) => a.Y - b.Y);
    col.forEach((c, i) => { const w = (c.text.length*14*.62 + 22)*k, [cx0, cy] = toUnits(px, top + i*37), left = px < 640, cx = left ? cx0 + w/2 : cx0, ex = left ? cx0 + w : cx0 - w/2 + 0;
      const rc = left ? cx0 + w/2 : cx0;
      s += `<g class="tag${c.on ? ' on' : ''}"><path d="M${f(c.X)} ${f(c.Y)}L${f(left ? cx0 + w : cx0 - w/2)} ${f(cy)}" fill="none" stroke="${INK}" stroke-width="1"/><circle cx="${f(c.X)}" cy="${f(c.Y)}" r="${f(2.4*k)}" fill="${INK}"/>`
        + `<rect x="${f(rc - w/2)}" y="${f(cy - hgt/2)}" width="${f(w)}" height="${f(hgt)}" rx="${f(hgt/2)}" fill="${c.on ? '#f4b829' : '#fff4d6'}" stroke="${INK}" stroke-width="1.3"/>`
        + `<text x="${f(rc)}" y="${f(cy + fs*.36)}" font-size="${f(fs)}" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-weight="800" letter-spacing=".04em" fill="${INK}">${c.text}</text></g>`; }); }
  return s; }
function nameLeader(at){ const r = pills[pills.length - 1].getBoundingClientRect(), [ax, ay] = toUnits(r.right, r.top + r.height/2), [X, Y] = P(...at), k = INK_K;
  return `<path d="M${f(ax)} ${f(ay)}L${f(X)} ${f(Y)}" fill="none" stroke="${INK}" stroke-width="${f(1.6*k)}"/><circle cx="${f(X)}" cy="${f(Y)}" r="${f(2.6*k)}" fill="${INK}"/>`; }

const ui = mountFigure({ fig:'01', title:'Record player', turn:'full', palette:'mustard', credit:false,
  size:[BX[1] - BX[0], BY[1] - BY[0], 70], center:[(BX[0] + BX[1])/2, (BY[0] + BY[1])/2],
  state:{ train:-300, power:0, spin:0, arm:0, lift:1, dust:0, chq:0, plug:0, xr:0, waves:0, wavePh:0, aerial:1, tagPlug:0, labelLit:0, nameTxt:'' }, scene });

/* ---------- the frame: the figure's page laid out for a 1280 x 720 film ---------- */
const svgEl = document.getElementById('fig'), vb0 = svgEl.viewBox.baseVal, VH = vb0.height, VW = VH*16/9, VX0 = vb0.width/2 - VW*.565, VY0 = vb0.y - VH*.135;
const css = document.createElement('style');
css.textContent = `html,body{width:1280px;height:720px;overflow:hidden}body{padding:0;display:block;position:relative}
  *{transition:none!important;animation:none!important}
  header,#readout,.controls,.idea,.made-with{display:none!important}
  .stage{position:absolute;inset:0;max-width:none;width:1280px;height:720px}
  #fig{position:absolute;left:0;top:0;width:1280px;height:720px;max-width:none;margin:0}
  #btns{position:absolute;left:34px;top:34px;display:flex;flex-direction:column;align-items:flex-start;gap:11px;z-index:2}
  .ly{font:600 17px/1.2 ui-monospace,Menlo,monospace;color:var(--ink);border:1.5px solid var(--ink);border-radius:999px;padding:7px 16px;white-space:nowrap;background:var(--paper)}
  .ly.name{font-size:26px;padding:10px 22px;font-weight:800}
  #rt{position:absolute;right:34px;top:30px;display:flex;flex-direction:column;align-items:flex-end;gap:12px;z-index:2;text-align:right}
  #rt .stat .k{font:700 12.5px ui-monospace,Menlo,monospace;letter-spacing:.12em;color:var(--muted)}
  #rt .stat .v{font:800 40px/1.05 ui-monospace,Menlo,monospace;font-variant-numeric:tabular-nums}
  .sw2{font:600 15px/1.2 ui-monospace,Menlo,monospace;border:1.5px solid var(--ink);border-radius:999px;padding:6px 15px;background:var(--paper);color:var(--ink)}
  .sw2.on{background:var(--ink);color:var(--paper)}
  #toast2{position:absolute;left:50%;top:40px;transform:translateX(-50%);display:flex;align-items:center;gap:9px;font:600 16px/1.3 ui-monospace,Menlo,monospace;color:#231e16;background:#fff1bf;border:1px solid rgba(35,30,22,.28);border-radius:8px;box-shadow:0 8px 22px rgba(35,30,22,.16);padding:8px 16px 8px 11px;z-index:4;white-space:nowrap}
  #toast2::before{content:"!";flex:none;width:21px;height:21px;border-radius:50%;background:#231e16;color:#fff1bf;font:800 14px/21px ui-monospace,Menlo,monospace;text-align:center}
  #cur{position:absolute;left:0;top:0;width:26px;height:34px;z-index:5;pointer-events:none}
  #credit{position:absolute;right:22px;bottom:14px;font:600 11px ui-monospace,Menlo,monospace;letter-spacing:.1em;color:var(--muted)}`;
document.head.appendChild(css);
const stage = document.querySelector('.stage');
const el = (tag_, id, cls = '') => { const e = document.createElement(tag_); if (id) e.id = id; e.className = cls; stage.appendChild(e); return e; };
const btnsEl = el('div', 'btns');
const pills = LN.map((l, i) => { const p = document.createElement('div'); p.className = 'ly' + (i === LN.length - 1 ? ' name' : ''); p.textContent = l.text; btnsEl.appendChild(p); return p; });
const rt = el('div', 'rt'); rt.innerHTML = `<div class="stat"><div class="k">YEAR</div><div class="v" id="vY"></div></div><div class="stat"><div class="k">TIMES PLAYED</div><div class="v" id="vP"></div></div><div class="sw2" id="swX">See-through</div>`;
const toast2 = el('div', 'toast2'), cur = el('div', 'cur'); toast2.textContent = 'That train has left';
cur.innerHTML = `<svg viewBox="0 0 26 34" width="26" height="34"><path d="M2 2L2 26L8.5 20.5L13 31L18 29L13.5 18.8L22 18.2Z" fill="#fff" stroke="#231e16" stroke-width="2" stroke-linejoin="round"/></svg>`;
el('div', 'credit').textContent = 'MADE WITH COLORFIGURES';
const vY = document.getElementById('vY'), vP = document.getElementById('vP'), swX = document.getElementById('swX');

function linePct(i, s){ const ws = LN[i].words; let done = 0, tot = LN[i].text.length;
  for (let j = 0; j < ws.length; j++){ const a = ws[j].t, b = Math.min(ws[j + 1] ? ws[j + 1].t : a + .55, a + .55), n = ws[j].w.length + (j < ws.length - 1 ? 1 : 0);
    done += n*prog(s, a, b); }
  return 100*done/tot; }
const NAME_T = () => LN[LN.length - 1].text.toUpperCase();

window.seek = function(s){
  const st = ui.st;
  // the train lets go of the loop as "train" is sung; it has been going round all along, nobody looking
  const v = 44, leave = T.missed - .1;
  st.train = s < leave ? v*(s - leave) : v*(s - leave)*(1 + .35*(s - leave));
  // the camera: a slow drift, one full walk round the outside on the second line, a push in on the cheque
  const walk = smooth(prog(s, T.turn0, T.turn1)), drift = 4.5*Math.sin((s - 152)*.34);
  const yaw = YAW0 + 360*walk + drift, pitch = PITCH0 + 2.2*Math.sin((s - 152)*.21) + 6*Math.sin(Math.PI*walk);
  setCam(yaw, pitch);
  st.waves = prog(s, T.heard - .9, T.heard - .2)*(1 - prog(s, wordT(0, 6) + .9, wordT(0, 6) + 1.6));
  st.wavePh = ((s - 152)*.9) % 1;
  st.aerial = 1;
  st.tagPlug = prog(s, wordT(2, 0) - 1.2, wordT(2, 0) - .7)*(1 - prog(s, T.turn1 - .5, T.turn1));
  st.dust = smooth(prog(s, T.yrs0, T.yrs1));
  const chqK = prog(s, T.chq0, T.chq); st.chq = s >= T.chq ? 1 : chqK*chqK;
  st.xr = prog(s, T.name - .35, T.name + .35); st.nameTxt = NAME_T();
  st.plug = prog(s, T.hit - .9, T.hit - .05);
  st.power = s >= T.hit - .05 ? 1 : 0;
  const pl = prog(s, T.hit, T.hit + 1.2);
  st.spin = Math.max(0, s - T.hit)*3.5*(1 - .5*(1 - pl));
  st.arm = smooth(prog(s, T.hit - .05, T.hit + .55)); st.lift = 1 - smooth(prog(s, T.hit + .55, T.hit + .95));
  st.labelLit = prog(s, wordT(6, 1), wordT(6, 1) + .4);
  // the words live on the buttons: each fills as it is sung, then stays pressed
  pills.forEach((p, i) => { const t0 = LN[i].words[0].t, name = i === LN.length - 1, sh = s >= t0 - .35;
    const gone = !name && s >= T.name - .5; p.style.display = sh && !gone ? '' : 'none';
    const pct = linePct(i, s), acc = '#f4b829';
    p.style.background = `linear-gradient(90deg,${acc} ${pct.toFixed(2)}%,var(--paper) ${pct.toFixed(2)}%)`;
    p.style.opacity = sh ? (name ? 1 : (s > LN[i].words[LN[i].words.length - 1].t + 1.2 ? .62 : 1)) : 0; });
  // the view
  const pull = 1 + .5*smooth(prog(s, T.chq0, T.chq - .1))*(1 - smooth(prog(s, T.chq + .55, T.ashamed - .9)));
  const [fx, fy] = P(W + 14, 56, PZ0 + 6), vw = VW/pull, vh = VH/pull, vx = VX0 + (fx - VX0 - (fx - VX0)/pull)*1 + 0, vy = VY0 + (fy - VY0 - (fy - VY0)/pull);
  svgEl.setAttribute('viewBox', `${vx.toFixed(2)} ${vy.toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}`);
  ui.render();
  const yr = s < T.yrs0 ? YEAR0 : Math.round(lerp(YEAR0, YEAR1, smooth(prog(s, T.yrs0, T.yrs1))));
  vY.textContent = yr; vP.textContent = s >= T.hit + .95 ? '1' : '0';
  swX.classList.toggle('on', s >= T.name - .35);
  // the pointer: comes to the See-through switch on "inspect" and leaves without pressing; comes back too late
  const sr = swX.getBoundingClientRect(), hx = sr.left + sr.width/2 - 8, hy = sr.top + sr.height/2 - 2;
  let cx = 1400, cy = 620, show = 0;
  const a1 = wordT(3, 2), a2 = T.inspect, a3 = T.inspect + .9;
  if (s >= a1 - .3 && s < a3 + .5){ const inn = smooth(prog(s, a1 - .3, a2 - .4)), out = smooth(prog(s, a3 - .15, a3 + .5)); cx = lerp(1320, hx, inn); cy = lerp(620, hy, inn); cx = lerp(cx, 1330, out); cy = lerp(cy, 470, out); show = 1; }
  const b1 = T.name - 1.2, b2 = T.name - .42;
  if (s >= b1 && s < T.name + .75){ const inn = smooth(prog(s, b1, b2)), out = smooth(prog(s, T.name + .1, T.name + .75)); cx = lerp(1320, hx, inn); cy = lerp(560, hy, inn); cx = lerp(cx, 1330, out); cy = lerp(cy, 470, out); show = 1; }
  // it goes for the train on "missed", and gets there as the last car clears
  const c1 = T.missed - 1.3, c2 = leave + 1.12, [tx_, ty_] = P(X1 - LR + 10, Y0, BOARD_H + 6), vbn = svgEl.viewBox.baseVal, mx = (tx_ - vbn.x)*1280/vbn.width, my = (ty_ - vbn.y)*1280/vbn.width;
  if (s >= c1 && s < T.train + 1.3){ const inn = smooth(prog(s, c1, c2)), out = smooth(prog(s, T.train + .75, T.train + 1.3)); cx = lerp(1320, mx, inn); cy = lerp(690, my, inn); cx = lerp(cx, 1330, out); cy = lerp(cy, 690, out); show = 1; }
  cur.style.display = show ? '' : 'none'; cur.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px) scale(${s >= b2 - .03 && s < b2 + .14 ? .86 : 1})`;
  // the notice, her own "you can't do that yet" toast
  const tn = prog(s, T.train, T.train + .2)*(1 - prog(s, T.name - .7, T.name - .4)); toast2.style.display = tn > 0 ? '' : 'none'; toast2.style.opacity = tn.toFixed(2);
};
window.setup = async () => { await new Promise(r => setTimeout(r, 1200)); window.seek(CU.s0); await document.fonts.ready; };
