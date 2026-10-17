// Reform Party, Dali look: the Instrument People (draft 9, Mark Von Ulrich's spine). Five burners whose heads are
// instruments of knowing; the board confiscates one head per lyric and the vote gives them back. Built by b7.
// "The party is built out of what it confiscates": a recorder (science), a valve radio (the blues), a press camera (the
// press), a stage mic (questions) and a magnifying glass (facts). Same body on all five, only the head differs.
//
// Interface for the other files:
//   IP_KINDS                      the five kinds (IP_LR: the same, left to right in the file as the camera sees it)
//   ipHead(kind, x, y, pxPerMetre, t, on, o)   draws one head with its collar point at screen (x, y); on 0..1 = working
//                                 (default: the film's own state at t); o optional {blind, slats, shut, cap, droop, sil}
//   ipState(t)                    [{kind, where, u, returned, X, Z, seat, on}] where = 'owner' | 'flying' | 'board' |
//                                 'crown' | 'back' (flying home); u = flight progress; X, Z = the owner's feet (metres)
//   ipOwner(kind, t)              {X, Z, mv} where that owner stands or walks (mv 0..1 how much he is walking)
//   IP_CROWN_SEATS                which SEATS (car.js) wear the real five as crowns (the nine copies go on the others)
// Every frame is a pure function of t.

const IP_KINDS = ['RECORDER', 'RADIO', 'CAMERA', 'MIC', 'LENS'];
const IP_LR = ['LENS', 'MIC', 'CAMERA', 'RADIO', 'RECORDER']; // left to right as the camera sees the file (the recorder leads, on the right)
const IP_SASH = { RECORDER: '#b8452f', RADIO: '#43699a', CAMERA: '#34302f', MIC: '#55805a', LENS: '#dcb24c' };
const IP_OFF = { LENS: -3.4, MIC: -1.7, CAMERA: 0, RADIO: 1.7, RECORDER: 3.4 }; // along the road from the car's centre; the recorder leads
const IP_ZW = 10.5, IP_COLLAR = 1.75, IP_SUIT = '#efe9dc', IP_BOOT = '#34302f', IP_HOLE = '#1c1a1e';
const IP_CROWN_SEATS = { LENS: 1, MIC: 2, CAMERA: 3, RADIO: 4, RECORDER: 5 }; // the far row, left to right as the vote-1 camera sees it
const IP_BEAT0 = 58.18, IP_BEAT = .59978; // the song's 100 bpm grid (playa.js OCT_BEATS)
const ipBeat = (t) => (t - IP_BEAT0) / IP_BEAT;

// ---------- the clock: every hit on its word ----------
const IPT = {
  plant: L_(1).s, die: wt(1, 'can'), rec: wt(2, 'every'), want: wt(3, 'want'), blues1: wt(3, 'blues'), restrict: wt(4, 'restrict'), news1: wt(4, 'news'),
  facts1: wt(6, 'facts'), crime: wt(7, 'crime'), blues2: wt(10, 'blues'), cam: wt(11, 'news'), put: wt(19, 'put'), truth: wt(19, 'truth'), box: wt(19, 'box'),
  talk: wt(20, 'talk'), limit: wt(22, 'limit'), mic: wt(22, 'questions'), radio: wt(31, 'blues'), news3: wt(32, 'news'), facts3: wt(34, 'facts'), spin3: wt(34, 'spin'),
  vote: VOTE_LINES.map((li) => wt(li, 'vote')),
};
// each confiscation: take-off and landing (song seconds)
const IP_TAKE = {
  RECORDER: [IPT.rec, IPT.rec + .9],          // "every": off the collar and into the giant ear's drawer with the table's recorders
  CAMERA: [IPT.cam - .9, IPT.cam - .12],      // lands under the press just as the plate comes down on "news"
  LENS: [IPT.truth, IPT.truth + .5],          // "truth": into the small crate beside the hat hole
  MIC: [IPT.mic, IPT.mic + .6],               // "questions": reeled in onto the wilting boom mics
  RADIO: [IPT.radio, IPT.radio + .6],         // "blues" 3: carried up into the red drape
};
const IP_BACK_DUR = .9;
const ipBackT = (kind) => IPT.vote[0] + .1 + IP_LR.indexOf(kind) * .3; // vote 1: the crowns hop home one after another

// ---------- is the head working ----------
function ipLife(kind, t) {
  let on = 1 - ease(t, IPT.die - .02, IPT.die + .12); // "can't": all five die at once
  if (kind === 'RADIO') on = Math.max(on, .85 * ease(t, 65.4, 68.5) * (1 - ease(t, IPT.crime - .05, IPT.crime + .08))); // the sax lets the blues out for nine seconds
  if (t > IPT.facts3 - .1) on = Math.max(on, ease(t, IPT.facts3, IPT.facts3 + .3)); // as crowns they work again, for the board; and from the vote on, for their owners
  return on;
}
const ipRun = (t) => Math.min(t, IPT.die) + .05 * ease(t, IPT.die, IPT.die + .2) + Math.max(0, t - IPT.facts3 - .15); // seconds of running, for the reels

// the radio's own little blind (one blind at two sizes): canvas on "blues" 1, lifted by the sax, snapped down on "crime",
// venetian slats with the big ones on "blues" 2, kept down till the drape takes the head
function ipRadioBlind(t) {
  const b1 = IPT.blues1, b2 = IPT.blues2;
  const canvas = ease(t, b1 - .05, b1 + .5) * (1 - .92 * ease(t, 65.4, 72.5)) + .92 * ease(t, 65.4, 72.5) * ease(t, IPT.crime - .06, IPT.crime + .06);
  const slats = ease(t, b2 - .05, b2 + .85), shut = ease(t, b2 + .45, b2 + 1.35);
  return { blind: t > b2 + .9 ? 0 : canvas, slats, shut };
}

// ---------- where the owners are ----------
// All day: single file 8 m beyond the far row, at the car's speed. At dusk, as the car parks, they wait at the edge of the
// crowd left of the board (out of the drone's way down onto the board), walk into the front row just beyond the board
// for vote 1, follow the board out across the fire's side after vote 3, and frame the burning Man for vote 4.
const IP_V1 = { LENS: [279.6, 8.6], MIC: [280.9, 8.6], CAMERA: [282.2, 8.6], RADIO: [283.5, 8.6], RECORDER: [284.8, 8.6] }; // left of the Man's base in the vote-1 frame
const IP_W0 = (kind) => [IP_V1[kind][0] - 5.2, 6.4]; // where they wait while the drone comes down past x 285 (212-215)
// vote 4: a row in front of the fire, two left and three right of the Man in the vote-4 frame (camera.js b1, 249.47);
// far enough in front of the drone's push to the Man's feet (it stops at z 17) that it never reaches them
const IP_V4 = { LENS: [301.9, 25], MIC: [304.7, 25], CAMERA: [311.2, 25], RADIO: [313.9, 25], RECORDER: [316.6, 25] };
const IP_SIT = [251.0, 251.7], IP_GONE = [254.8, 256.2]; // they sit down for the fall (a real burn crowd sits), then go with the crowd
function ipOwnerAt(kind, t) {
  const off = IP_OFF[kind], v1 = IP_V1[kind], w0 = IP_W0(kind);
  const r3 = ease(t, 170.5, 177) * (1 - ease(t, 181.5, 190)); // refrain 3: they step ahead and close up, so the empty-collar row stands beside the big press on "news" (between two eggs as seen from the hole)
  if (t < 203) return [carX(t) + off * (1 - .26 * r3) + 6 * r3, IP_ZW, 0];
  const a = ease(t, 203, 211.5), b = ease(t, 214.9, 219.4);
  let X = lerp(lerp(carX(t) + off, w0[0], a), v1[0], b), Z = lerp(lerp(IP_ZW, w0[1], a), v1[1], b);
  if (t < 241) return [X, Z, 0];
  const v4 = IP_V4[kind], c = ease(t, 241.0 + IP_LR.indexOf(kind) * .1, 248.6);
  return [lerp(X, v4[0], c), lerp(Z, v4[1], c), ease(t, IP_GONE[0], IP_GONE[1])];
}
function ipOwner(kind, t) {
  const a = ipOwnerAt(kind, t); if (t < 170 || (t > 191 && t < 200)) return { X: a[0], Z: a[1], mv: 1, fade: 0 };
  const p = ipOwnerAt(kind, t - .06), q = ipOwnerAt(kind, t + .06), v = Math.hypot(q[0] - p[0], q[1] - p[1]) / .12;
  return { X: a[0], Z: a[1], mv: clamp(v / 1.4, 0, 1.3), fade: a[2] };
}

// ---------- the five heads (drawn in metres: origin at the collar, y up is negative) ----------
let IPS = null; // silhouette colour while a head is drawn as a silhouette
const ipc = (c) => IPS || c;
function ipRR(x, y, w, h, r, col) { g.fillStyle = ipc(col); g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); }
function ipCirc(x, y, r, col) { g.fillStyle = ipc(col); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
function ipLine(pts, w, col) { g.strokeStyle = ipc(col); g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); }

function ipRecorder(t, on) { // a reel-to-reel deck: two reels that turn while it works
  ipRR(-.1, -.12, .2, .12, .02, '#2c2a2e');
  ipRR(-.5, -.8, 1.0, .7, .05, '#8f6d48'); ipRR(-.5, -.8, 1.0, .07, .04, '#a9875e');
  g.strokeStyle = ipc('#5f452c'); g.lineWidth = .03; g.beginPath(); g.roundRect(-.5, -.8, 1.0, .7, .05); g.stroke();
  ipRR(-.4, -.32, .8, .17, .02, '#c7c1b3'); // the control panel
  for (let i = 0; i < 4; i++) ipRR(-.3 + i * .16, -.27, .11, .08, .01, i === 3 && on > .5 ? '#c8392b' : '#3a3a40');
  ipRR(-.07, -.43, .14, .09, .015, '#3a3a40'); // the tape head
  const ph = ipRun(t) * 3.4, sag = .07 * (1 - on);
  ipLine([[-.25, -.35], [-.12, -.36 + sag], [-.07, -.39], [.07, -.39], [.12, -.36 + sag], [.25, -.35]], .02, '#4a2e1c'); // the tape, slack once it stops
  for (const d of [-1, 1]) { const cx = d * .25, cy = -.63, pack = d < 0 ? .19 : .12;
    ipCirc(cx, cy, .28, '#d3d6d6'); g.strokeStyle = ipc('#8e9296'); g.lineWidth = .025; g.beginPath(); g.arc(cx, cy, .27, 0, TAU); g.stroke();
    for (let h = 0; h < 3; h++) { const a = ph + h * TAU / 3 + d; ipCirc(cx + Math.cos(a) * .16, cy + Math.sin(a) * .16, .07, '#4a2e1c'); }
    ipCirc(cx, cy, pack * .45, '#4a2e1c'); ipCirc(cx, cy, .055, '#2a2a2e'); ipCirc(cx + Math.cos(ph) * .03, cy + Math.sin(ph) * .03, .015, '#d3d6d6'); }
}
function ipRadio(t, on, o) { // an arched valve-radio cabinet with a cloth grille and one dial
  const arch = (w, y0, y1) => { g.beginPath(); g.moveTo(-w, y0); g.lineTo(-w, y1); g.arc(0, y1, w, Math.PI, TAU); g.lineTo(w, y0); g.closePath(); };
  g.fillStyle = ipc('#2c4a70'); g.fillRect(-.55, -.12, 1.1, .1);
  arch(.5, -.1, -.6); g.fillStyle = ipc('#43699a'); g.fill(); g.strokeStyle = ipc('#2c4a70'); g.lineWidth = .035; g.stroke();
  arch(.42, -.46, -.62); g.strokeStyle = ipc('#5d84b4'); g.lineWidth = .02; g.stroke();
  arch(.32, -.48, -.66); g.fillStyle = ipc('#cdb88e'); g.fill();
  if (!IPS) { g.save(); arch(.32, -.48, -.66); g.clip(); g.strokeStyle = 'rgba(120,96,60,.35)'; g.lineWidth = .012; for (let y = -1; y < -.45; y += .035) { g.beginPath(); g.moveTo(-.4, y); g.lineTo(.4, y); g.stroke(); } g.restore(); }
  for (const x of [-.16, 0, .16]) ipLine([[x, -.48], [x, -.66 - Math.sqrt(Math.max(0, .1024 - x * x))]], .035, '#2c4a70');
  // the dial: a blue sector, and a needle that drops out of it when the blues are taken
  const dc = [0, -.29]; ipCirc(dc[0], dc[1], .135, '#efe6cf'); g.strokeStyle = ipc('#c9a46a'); g.lineWidth = .025; g.beginPath(); g.arc(dc[0], dc[1], .135, 0, TAU); g.stroke();
  if (!IPS) { g.fillStyle = '#2f6fd0'; g.beginPath(); g.moveTo(dc[0], dc[1]); g.arc(dc[0], dc[1], .12, -Math.PI / 2 + .15, -Math.PI / 2 + .95); g.closePath(); g.fill(); }
  const na = -Math.PI / 2 + lerp(-1.2, .55 + .07 * Math.sin(t * 2.3), on); ipLine([dc, [dc[0] + Math.cos(na) * .12, dc[1] + Math.sin(na) * .12]], .018, '#8f1d1d');
  ipCirc(dc[0], dc[1], .02, '#2a2a2e');
  for (const d of [-1, 1]) ipCirc(d * .33, -.27, .06, '#d8cfb8');
  // the little blind over the grille, same cloth as the sky blind, or venetian slats
  const bl = o && o.blind || 0, sl = o && o.slats || 0, sh = o && o.shut || 0;
  if (bl > .01) { const y0 = -.98, y1 = lerp(y0, -.44, bl); ipRR(-.38, y0 - .04, .76, .05, .02, '#7a5f3a');
    g.fillStyle = ipc('rgb(206,188,148)'); g.fillRect(-.35, y0, .7, y1 - y0); if (!IPS) { g.fillStyle = 'rgba(110,86,52,.18)'; g.fillRect(-.12, y0, .015, y1 - y0); g.fillRect(.15, y0, .015, y1 - y0); }
    ipRR(-.36, y1 - .02, .72, .035, .01, '#8a6d44'); g.strokeStyle = ipc('#5a4a32'); g.lineWidth = .012; g.beginPath(); g.arc(.2, y1 + .05, .025, 0, TAU); g.stroke(); }
  if (sl > .01) { const N = 7, y0 = -.98, pitch = .54 / N, n = Math.min(N, Math.ceil(sl * N)); ipRR(-.38, y0 - .04, .76, .05, .02, '#8a7656');
    for (let i = 0; i < n; i++) { const yc = y0 + (i + .5) * pitch, hs = pitch * lerp(.35, 1.08, sh); g.fillStyle = ipc(i % 2 ? '#e3d8bd' : '#ece3cb'); g.fillRect(-.35, yc - hs / 2, .7, hs); if (!IPS) { g.fillStyle = 'rgba(90,76,56,.35)'; g.fillRect(-.35, yc + hs / 2 - .008, .7, .008); } } }
}
function ipCamera(t, on, o) { // a folding press camera: bellows, brass, one big lens, a flash pan on top
  ipLine([[-.34, -.76], [-.34, -.95], [-.1, -.95], [-.1, -.76]], .022, '#8d8a84'); // the sports finder's wire frame
  ipLine([[.3, -.76], [.3, -.98]], .035, '#8d8a84');
  g.fillStyle = ipc('#c9a46a'); g.beginPath(); g.moveTo(.1, -1.0); g.lineTo(.5, -1.0); g.lineTo(.45, -.95); g.lineTo(.15, -.95); g.closePath(); g.fill(); // the flash pan
  ipRR(-.44, -.78, .88, .66, .05, '#34302f'); if (!IPS) { g.fillStyle = 'rgba(255,255,255,.05)'; for (let y = -.74; y < -.15; y += .05) g.fillRect(-.42, y, .84, .012); }
  for (let i = 0; i < 3; i++) { const s = .33 - i * .045; g.strokeStyle = ipc(i % 2 ? '#4a4446' : '#1f1c1e'); g.lineWidth = .035; g.strokeRect(-s, -.45 - s, 2 * s, 2 * s); } // bellows
  g.strokeStyle = ipc('#c9a46a'); g.lineWidth = .04; g.strokeRect(-.21, -.66, .42, .42); // the front standard
  ipCirc(0, -.45, .2, '#1e1d21');
  if (o && o.cap) { ipCirc(0, -.45, .205, '#141214'); g.strokeStyle = ipc('#3a3638'); g.lineWidth = .02; g.beginPath(); g.arc(0, -.45, .15, 0, TAU); g.stroke(); }
  else { ipCirc(0, -.45, .15, '#5d7f9a'); if (!IPS) { g.strokeStyle = 'rgba(220,236,246,.55)'; g.lineWidth = .03; g.beginPath(); g.arc(0, -.45, .11, 3.6, 4.6); g.stroke(); ipCirc(.05, -.5, .025, 'rgba(240,248,255,.7)'); } }
  if (!IPS && on > .02) ipCirc(.3, -1.03, .028, `rgba(255,${150 + 60 * on | 0},60,${on})`); // the pilot light
  const pop = o && o.pop || 0; if (!IPS && pop > .01) { const r = .25 + .35 * (1 - pop), gr = g.createRadialGradient(.3, -1.05, 0, .3, -1.05, r); gr.addColorStop(0, `rgba(255,190,110,${.38 * pop})`); gr.addColorStop(1, 'rgba(255,150,70,0)');
    g.fillStyle = gr; g.fillRect(.3 - r, -1.05 - r, 2 * r, 2 * r); g.fillStyle = `rgba(150,140,130,${.5 * (1 - pop) * Math.min(1, pop * 6)})`; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(.3 + (i - 1) * .08, -1.12 - (1 - pop) * .25 - i * .03, .06 + (1 - pop) * .05, 0, TAU); g.fill(); } }
}
function ipMic(t, on, o) { // a stage-mic ball on a short handle, a dark band with a light in it
  const dr = o && o.droop || 0;
  g.fillStyle = ipc('#2a2a2e'); g.beginPath(); g.moveTo(-.07, -.02); g.lineTo(.07, -.02); g.lineTo(.12, -.3); g.lineTo(-.12, -.3); g.closePath(); g.fill();
  g.save(); g.translate(0, -.32); g.rotate(dr * 1.1); g.scale(1 + .12 * dr, 1 - .18 * dr);
  ipRR(-.2, -.07, .4, .09, .02, '#2c2c30');
  ipRR(-.17, -.04, .34, .022, .01, on > .05 ? `rgba(${lerp(80, 120, on) | 0},${lerp(84, 210, on) | 0},${lerp(90, 255, on) | 0},1)` : '#55585e');
  const cx = 0, cy = -.47, r = .42;
  if (IPS) ipCirc(cx, cy, r, '#000');
  else { const gr = g.createRadialGradient(cx - .14, cy - .16, .05, cx, cy, r); gr.addColorStop(0, '#f6f7f7'); gr.addColorStop(.6, '#d3d6d6'); gr.addColorStop(1, '#8f9396'); ipCirc(cx, cy, r, gr);
    g.save(); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.clip(); g.strokeStyle = 'rgba(110,116,122,.55)'; g.lineWidth = .014;
    for (let d = -1; d <= 1; d += .085) { g.beginPath(); g.moveTo(cx + d - .5, cy - .5); g.lineTo(cx + d + .5, cy + .5); g.moveTo(cx + d + .5, cy - .5); g.lineTo(cx + d - .5, cy + .5); g.stroke(); }
    g.restore(); g.strokeStyle = 'rgba(90,94,98,.6)'; g.lineWidth = .02; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke(); }
  g.restore();
}
function ipLens(t, on, o) { // a magnifying glass the size of a head; the glass is tinted like the sky behind it, grey once it is dead
  ipRR(-.05, -.3, .1, .3, .03, '#5a3a24'); ipRR(-.07, -.36, .14, .07, .02, '#c9a46a');
  const cy = -.74, R = .38;
  if (IPS) { g.strokeStyle = IPS; g.lineWidth = .08; g.beginPath(); g.arc(0, cy, R, 0, TAU); g.stroke(); g.fillStyle = IPS; g.globalAlpha *= .35; g.beginPath(); g.arc(0, cy, R, 0, TAU); g.fill(); g.globalAlpha /= .35; return; }
  const [top, low] = skyCols(t), sky = mix(low, top, .5), night = typeof nightAmt === 'function' ? nightAmt(t) : 0, fire = typeof fireGlow === 'function' ? fireGlow(t) : 0;
  const live = mix(sky, [255, 150, 70], clamp(fire * 1.2)), dead = [163, 166, 168];
  g.fillStyle = rgb(mix(dead, live, on), lerp(.88, .5 + .2 * night, on)); g.beginPath(); g.arc(0, cy, R, 0, TAU); g.fill();
  if (on < .95) { g.save(); g.beginPath(); g.arc(0, cy, R, 0, TAU); g.clip(); g.fillStyle = `rgba(214,216,216,${.6 * (1 - on)})`; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(-.25 + (i % 3) * .25, cy - .15 + Math.floor(i / 3) * .3, .2, .12, 0, 0, TAU); g.fill(); } g.restore(); } // the lens clouds over
  g.strokeStyle = `rgba(255,255,255,${.25 + .35 * on})`; g.lineWidth = .04; g.beginPath(); g.arc(0, cy, R * .72, 3.5, 4.5); g.stroke();
  g.strokeStyle = '#c9a46a'; g.lineWidth = .085; g.beginPath(); g.arc(0, cy, R, 0, TAU); g.stroke();
  g.strokeStyle = '#8a6a2e'; g.lineWidth = .02; g.beginPath(); g.arc(0, cy, R + .045, 0, TAU); g.stroke();
}
const IP_DRAW = { RECORDER: ipRecorder, RADIO: ipRadio, CAMERA: ipCamera, MIC: ipMic, LENS: ipLens };
function ipHeadM(kind, t, on, o) { const prev = IPS; IPS = o && o.sil || null; IP_DRAW[kind](t, on, o || {}); IPS = prev; }
function ipHead(kind, x, y, pxPerMetre, t, on, o) { // one head, collar point at screen (x, y)
  if (on == null) on = ipLife(kind, t); if (pxPerMetre < .3) return;
  g.save(); g.translate(x, y); g.scale(pxPerMetre, pxPerMetre); ipHeadM(kind, t, on, o); g.restore();
}
// what the walking head looks like today (radio blind, lens cap and so on)
function ipHeadOpts(kind, t) {
  if (kind === 'RADIO') return ipRadioBlind(t);
  if (kind === 'CAMERA') return { cap: t > IPT.restrict && t < IPT.facts3, pop: t > IPT.news1 && t < IPT.news1 + .8 ? Math.exp(-(t - IPT.news1) * 5) : 0 }; // "news": one small amber pop, and nothing comes out
  if (kind === 'MIC') return { droop: ease(t, IPT.limit, IPT.limit + .45) }; // "limit": it goes soft before it is taken
  return {};
}

// ---------- the body: pale dust coveralls, a sash, boots; the recorder's owner also wears a lab coat ----------
let IP_PAPER = null; // the ballot's paper colour when the figure is a silhouette against the fire (lit like the crowd's ballots)
function ipBallot(x, y, rot) { const keep = IPS; if (IP_PAPER) IPS = null; g.save(); g.translate(x, y); g.rotate(rot || 0); ipRR(-.17, -.24, .34, .44, .015, IP_PAPER || '#fbf7ec');
  g.strokeStyle = ipc('rgba(30,24,30,.85)'); g.lineWidth = .02; g.strokeRect(-.11, -.16, .1, .1); g.beginPath(); g.moveTo(-.11, -.16); g.lineTo(-.01, -.06); g.moveTo(-.01, -.16); g.lineTo(-.11, -.06); g.stroke();
  g.fillStyle = ipc('rgba(30,24,30,.55)'); g.fillRect(.02, -.14, .1, .015); g.fillRect(-.11, .02, .22, .015); g.fillRect(-.11, .08, .18, .015); g.restore(); IPS = keep; }
// o: {mv, head (bool), on, hopts, hands: [[lx, ly], [rx, ry]] or null, ballots: [left, right], collarCard}
function ipBody(kind, t, o) {
  const s = Math.sin(ipBeat(t) * Math.PI), mv = o.mv || 0, bob = .035 * mv * Math.abs(s), lab = kind === 'RECORDER';
  const lift = [Math.max(0, s) * .1 * mv, Math.max(0, -s) * .1 * mv], fx = [-.13 - .05 * s * mv, .13 - .05 * s * mv], sit = o.sit || 0;
  g.translate(0, -bob);
  // legs and boots; sitting cross-legged on the playa, the knees and lap under the body
  if (sit < .5) for (let j = 0; j < 2; j++) { const d = j ? 1 : -1; ipLine([[d * .1, -.92 + sit * .7], [fx[j] + d * sit * .3, -.14 - lift[j] + bob]], .19, IP_SUIT); ipRR(fx[j] + d * sit * .3 - .1, -.16 - lift[j] + bob, .2, .16, .05, IP_BOOT); }
  else { g.fillStyle = ipc(IP_SUIT); g.beginPath(); g.ellipse(0, -.17, .46, .17, 0, 0, TAU); g.fill(); for (const d of [-1, 1]) ipRR(d * .4 - .1, -.14, .2, .13, .05, IP_BOOT); }
  g.translate(0, sit * .74);
  // torso
  g.fillStyle = ipc(IP_SUIT); g.beginPath(); g.moveTo(-.22, -.86); g.lineTo(-.25, -1.52); g.quadraticCurveTo(-.24, -1.62, -.12, -1.68); g.lineTo(.12, -1.68); g.quadraticCurveTo(.24, -1.62, .25, -1.52); g.lineTo(.22, -.86); g.closePath(); g.fill();
  if (!IPS) { g.fillStyle = 'rgba(80,60,40,.1)'; g.fillRect(.04, -1.66, .2, .8); g.fillStyle = '#c9c1b0'; g.fillRect(-.008, -1.66, .016, .74); }
  if (lab) { // the scientist's white lab coat, open down the front
    for (const d of [-1, 1]) { g.fillStyle = ipc('#fbfbf8'); g.beginPath(); g.moveTo(d * .05, -1.66); g.lineTo(d * .27, -1.6); g.lineTo(d * .37, -.46); g.lineTo(d * .06, -.46); g.lineTo(d * .07, -1.2); g.closePath(); g.fill();
      if (!IPS) { g.strokeStyle = '#9a9a96'; g.lineWidth = .015; g.stroke(); g.fillStyle = '#e4e4df'; g.beginPath(); g.moveTo(d * .05, -1.66); g.lineTo(d * .16, -1.58); g.lineTo(d * .08, -1.3); g.closePath(); g.fill(); } }
    if (!IPS) { g.strokeStyle = '#9a9a96'; g.lineWidth = .012; g.strokeRect(-.27, -1.42, .13, .12); g.fillStyle = '#2f6fb5'; g.fillRect(-.24, -1.47, .015, .1); g.fillStyle = '#c8392b'; g.fillRect(-.2, -1.46, .015, .09); }
  }
  // the sash, shoulder to hip
  g.fillStyle = ipc(IP_SASH[kind]); g.beginPath(); g.moveTo(-.24, -1.6); g.lineTo(-.12, -1.66); g.lineTo(.26, -.98); g.lineTo(.2, -.88); g.closePath(); g.fill();
  // arms: swinging while they walk, or holding ballots up
  const sw = .06 * s * mv, hands = o.hands || [[-.3 + sw, -.86], [.3 - sw, -.86]], sh = [[-.24, -1.52], [.24, -1.52]], sleeve = lab ? '#fbfbf8' : IP_SUIT;
  for (let j = 0; j < 2; j++) { const [hx, hy] = hands[j], [ax, ay] = sh[j], mx = (ax + hx) / 2 + (j ? .08 : -.08) * (hy < ay ? 1 : 0), my = (ay + hy) / 2 + .04;
    ipLine([[ax, ay], [mx, my], [hx, hy]], .12, sleeve); ipCirc(hx, hy, .065, '#c9b48f'); if (o.ballots && o.ballots[j]) ipBallot(hx + (j ? .02 : -.02), hy - .22, (j ? .12 : -.12)); }
  // the collar, and the head or the dark hole where it was
  ipRR(-.17, -1.78, .34, .08, .03, '#d9d1bf');
  if (o.head) { g.save(); g.translate(0, -IP_COLLAR - .01); ipHeadM(kind, t, o.on, Object.assign({}, o.hopts, { sil: IPS })); g.restore(); }
  else { g.fillStyle = ipc(IP_HOLE); g.beginPath(); g.ellipse(0, -1.765, .13, .035, 0, 0, TAU); g.fill(); }
  if (o.collarCard) ipBallot(0, -1.95 + .02 * Math.sin(t * 3), 0);
}

// ---------- the confiscations: where each head is ----------
function ipState(t) {
  return IP_KINDS.map((kind, i) => { const [t0, t1] = IP_TAKE[kind], B = ipBackT(kind), ow = ipOwner(kind, t);
    let where = 'owner', u = 0, returned = false;
    if (t >= t0 && t < t1) { where = 'flying'; u = (t - t0) / (t1 - t0); }
    else if (t >= t1 && t < IPT.facts3) where = 'board';
    else if (t >= IPT.facts3 && t < B) where = 'crown';
    else if (t >= B && t < B + IP_BACK_DUR) { where = 'back'; u = (t - B) / IP_BACK_DUR; }
    else if (t >= B + IP_BACK_DUR) returned = true;
    return { kind, i, where, u, returned, X: ow.X, Z: ow.Z, seat: IP_CROWN_SEATS[kind], on: ipLife(kind, t) }; });
}
// arms and ballots in the burn: vote 1 the ballot at the empty collar (it is their head), then up as the head lands;
// vote 2 one hand up, vote 3 both, vote 4 both arms out at arm's length, framing the Man
function ipArms(kind, t, st) {
  const v = IPT.vote; if (t < v[0] - .5) return null;
  const B = ipBackT(kind) + IP_BACK_DUR, rest = [[-.3, -.86], [.3, -.86]], up1 = [[-.3, -.86], [.42, -2.25]], up2 = [[-.42, -2.25], [.42, -2.25]], frame = [[-.62, -2.15], [.62, -2.15]], card = [[-.13, -1.72], [.13, -1.72]];
  const L = (a, b, u) => a.map((p, j) => [lerp(p[0], b[j][0], u), lerp(p[1], b[j][1], u)]);
  let h = rest, ballots = [false, false], collarCard = false;
  const raise1 = ease(t, v[0] - .35, v[0]), lower1 = ease(t, L_(35).e + .3, L_(35).e + 1.1);
  if (t < L_(35).e + 1.1) { const headUp = ease(t, B - .15, B + .35);
    h = L(L(rest, card, raise1), up1, headUp); h = L(h, rest, lower1); collarCard = raise1 > .5 && headUp < .05 && !st.returned; ballots = [false, headUp > .3 && lower1 < .7]; }
  else if (t < v[2] - .6) { const r = ease(t, v[1] - .4, v[1]) * (1 - ease(t, 236.6, 237.4)); h = L(rest, up1, r); ballots = [false, r > .3]; }
  else if (t < v[3] - 1) { const r = ease(t, v[2] - .4, v[2]) * (1 - ease(t, L_(37).e + .3, L_(37).e + 1)); h = L(rest, up2, r); ballots = [r > .3, r > .3]; }
  else { const r = ease(t, v[3] - .5, v[3]) * (1 - ease(t, IP_SIT[0], IP_SIT[1])); h = L(rest, frame, r); ballots = [r > .3, r > .3]; }
  return { hands: h, ballots, collarCard };
}

// ---------- the crowns: the five stolen heads sit on five of the suits' eggs from "facts" 3 to vote 1 ----------
function ipEgg(kind, t) { // screen point on top of that suit's egg (as car.js draws it), its px per metre, its depth
  if (typeof SEATS === 'undefined' || typeof seatState !== 'function') return null; const i = IP_CROWN_SEATS[kind], s = SEATS[i], o = seatState(s, t, i), Pz = bodyPose(s, o);
  const p = PL(Pz.bx, Pz.hy, Pz.bz); if (p[2] < .25) return null; const k = kAt(p), ry = .155 * k;
  const nod = (o.nod || 0) * .035 * k, bounce = (o.bounce || 0) * .09 * k, lid = o.lid || 0, teeth = o.teeth || 0;
  const y = p[1] - (TORSO + .19) * k + nod - bounce - ry - lid * ry * (.32 + teeth * .55) - .01 * k;
  return { x: p[0], y, k, d: p[2], flip: o.flip || 0 };
}
const IP_CROWN = .34; // metres: the stolen head shrunk to a crown

// ---------- drawing helpers for the flights ----------
function ipCollarScr(kind, t) { const ow = ipOwner(kind, t), p = P(ow.X, 0, ow.Z); if (p[2] < .3) return null; const k = kAt(p), s = Math.sin(ipBeat(t) * Math.PI);
  return { x: p[0], y: p[1] - (IP_COLLAR + .035 * ow.mv * Math.abs(s)) * k, k, d: p[2] }; }
function ipFly(a, b, u, arcM, rot) { // screen-space arc between two live points: {x, y, k, d}, arcM metres of lift at the top
  const e = u * u * (3 - 2 * u), k = lerp(a.k, b.k, e), arc = Math.min(arcM * Math.max(a.k, b.k) * .8, .5 * Math.hypot(b.x - a.x, b.y - a.y) + 60);
  return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) - Math.sin(u * Math.PI) * arc, k, d: lerp(a.d, b.d, e), rot: Math.sin(u * Math.PI) * (rot || 0) };
}
function ipDrawAt(kind, f, scale, t, on, o) { g.save(); g.translate(f.x, f.y); if (f.rot) g.rotate(f.rot); ipHead(kind, 0, 0, f.k * scale, t, on, o); g.restore(); }

// the RECORDER's target: the giant ear's drawer (installs.js), matching how bigEar draws it
function ipEarDrawer(t) {
  if (typeof EAR === 'undefined') return null; const s = EAR.s(), X = EAR.X(), Z = EAR.Z, p = P(X, 0, Z); if (p[2] < 1) return null;
  const grow = easeOutBack(clamp((t - s + .3) / 1.1)), k = kAt(p) * grow, open = hold(t, s - .1, s + .5, IPT.want - .1, IPT.want + .35);
  const cx = p[0] - .25 * k, cy = p[1] - 9 * k * .56, dx = open * 1.3 * k, dh = .62 * k;
  return { x: cx + dx, y: cy - dx * .25 + dh * .1, top: cy - dx * .25 - dh / 2, k, d: p[2] - .05, open };
}
// the CAMERA's target: the refrain-2 news press (table.js newsOne, level 2)
const IP_PRESS = { x: -1.85, z: -1.0 }; // under the left half of the plate (the press's screw is at x -1.25)
function ipPressPlate(t) { const n = IPT.cam, s = L_(11).s, up = easeOutBack(clamp((t - s - .65) / .6));
  const slam = t < n - .12 ? 0 : t < n + .05 ? ease(t, n - .12, n + .05) : 1 - .06 * Math.sin((t - n - .05) * 18) * Math.exp(-(t - n) * 6); return TOP + lerp(1.3, .08, slam) * up; }
// the MIC's target: the middle boom's furry tip (table.js micBooms), car-local
function ipBoomTip(t) { const s = L_(22).s, e = L_(22).e, lim = IPT.limit, reach = ease(t, s - .6, s + .1) * (1 - ease(t, e + .3, e + .9)), droop = ease(t, lim + .15, lim + 1.05);
  return [lerp(-9, -2.85, reach) - droop * .9, Math.max(.25, 2.15 - 2.6 * droop), -1.05, reach]; }
// table.js (b3, draft 9) ties the boom mics in a knot at micKnot() and they hang about .6 m below it: the MIC head hangs
// there with them; without micKnot (the old booms) it hangs from the middle boom's tip. [x, y, z car-local, presence 0..1]
function ipMicTarget(t) {
  if (typeof micKnot === 'function') { const k = micKnot(t), e = L_(22).e; if (k) return [k[0], k[1] - .62, k[2], 1 - ease(t, e + .3, e + .9)]; }
  const [bx, by, bz, reach] = ipBoomTip(t); return [bx, Math.max(.45, by - .25), bz, reach];
}
// the LENS's crates: three, nested, beside the hat hole
const IP_CRATE = { x: 1.0, z: .4, sizes: [.5, .8, 1.2] };
function ipCrateDrop(j, t) { // 0 up in the air .. 1 landed, for the two bigger crates that drop over the small one
  const at = IPT.box + j * .3; return t < at - .35 ? 0 : t < at ? ((t - at + .35) / .35) ** 2 : 1; }
function ipCrates(t) {
  const t0 = IPT.put - .1, t9 = IPT.talk + 1.7; if (t < t0 || t > t9 + .7) return; const al = ease(t, t0, t0 + .25), sink = ease(t, t9, t9 + .7); // sunk into the table before the mics and the pie
  const { x: cx, z: cz } = IP_CRATE, wood = '#cdb88e', edge = '#8f6d48';
  const face = (pts, col) => poly(pts.map((q) => PL(...q)), col, edge, Math.max(1, .012 * kAt(PL(cx, TOP, cz))));
  const boxAt = (s, y0, hgt, open, lidA) => { const a = s / 2, x0 = cx - a, x1 = cx + a, z0 = cz - a, z1 = cz + a, y1 = y0 + hgt;
    // seen from the camera's side: back and inner walls first when open
    const camLocal = (() => { const dx = C.x - CX, dz = C.z - CZ, c = Math.cos(-YAW), sn = Math.sin(-YAW); return [dx * c - dz * sn, dx * sn + dz * c]; })();
    const walls = [[[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], z1, 'z', 1], [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], z0, 'z', -1],
      [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], x0, 'x', -1], [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], x1, 'x', 1]];
    const facing = (w) => (w[5] === 'x' ? camLocal[0] - w[4] : camLocal[1] - w[4]) * w[6] > 0;
    return { back: () => { if (open) poly([[x0, y0 + .01, z0], [x1, y0 + .01, z0], [x1, y0 + .01, z1], [x0, y0 + .01, z1]].map((q) => PL(...q)), '#7a6240'); for (const w of walls) if (!facing(w)) face(w.slice(0, 4), '#b9a274'); },
      front: () => { for (const w of walls) if (facing(w)) face(w.slice(0, 4), w[5] === 'x' ? '#bba57a' : wood);
        if (!open) face([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], '#dccaa0');
        else if (lidA != null) { const ca = Math.cos(lidA), sa = Math.sin(lidA); face([[x0, y1, z1], [x1, y1, z1], [x1, y1 + s * sa, z1 - s * ca], [x0, y1 + s * sa, z1 - s * ca]], '#d8c69c'); } } };
  };
  g.save(); g.globalAlpha = al;
  const y0 = TOP - sink * 1.3, s0 = IP_CRATE.sizes[0], lid = lerp(Math.PI * .62, 0, ease(t, IPT.box - .12, IPT.box)); // the small crate's lid slams on "box"
  const inner = boxAt(s0, y0, s0 * .8, true, lid);
  inner.back();
  // the lens head drops in on "truth"
  const [ta, tb] = IP_TAKE.LENS;
  if (t >= ta && lid > .25) { const c = PL(cx, y0 + .04, cz), u = clamp((t - ta) / (tb - ta)); if (c[2] > .2) {
      const start = ipCollarScr('LENS', t), end = { x: c[0], y: c[1], k: kAt(c), d: c[2] }, f = u < 1 && start ? ipFly(start, end, u, 2.2, .6) : Object.assign(end, { rot: 0 });
      g.save(); if (u >= 1) { const rim = PL(cx, y0 + s0 * .8, cz - s0 / 2); g.beginPath(); g.rect(-W, -H, 3 * W, rim[1] + H); g.clip(); }
      ipDrawAt('LENS', f, lerp(1, .42, smooth(u)), t, ipLife('LENS', t)); g.restore(); } }
  inner.front();
  for (let j = 1; j < 3; j++) { const d = ipCrateDrop(j, t); if (d <= 0) continue; const s = IP_CRATE.sizes[j], h = s * .8, yb = y0 + (1 - d) * 2.6 + (d >= 1 ? .03 * Math.abs(Math.sin((t - IPT.box - j * .3) * 16)) * Math.exp(-(t - IPT.box - j * .3) * 7) : 0);
    const b = boxAt(s, yb, h, false); b.back(); b.front(); }
  // "talk": two strips of tape slap an X across the outer crate, the same tape as the speakerphone's
  const tp = ease(t, IPT.talk - .05, IPT.talk + .12); if (tp > 0 && ipCrateDrop(2, t) >= 1) { const s = IP_CRATE.sizes[2], a = s / 2 * .9, hh = s * .8, yt = y0 + hh + .012;
    // on whichever face the camera sees best: the lid, or the side toward the camera
    const area = (q) => { const r = q.map((v) => PL(...v)); if (!ok(r)) return 0; let A = 0; for (let i = 0; i < 4; i++) { const u = r[i], v = r[(i + 1) % 4]; A += u[0] * v[1] - v[0] * u[1]; } return Math.abs(A) / 2; };
    const lc = (() => { const dx = C.x - CX, dz = C.z - CZ, c = Math.cos(-YAW), sn = Math.sin(-YAW); return [dx * c - dz * sn, dx * sn + dz * c]; })();
    const sx = Math.abs(lc[0] - cx) > Math.abs(lc[1] - cz) ? Math.sign(lc[0] - cx) : 0, sz = sx ? 0 : Math.sign(lc[1] - cz), half = s / 2 + .012;
    const side = (u, v) => sx ? [cx + sx * half, y0 + hh / 2 + v * hh / 2 * .9, cz + u * a] : [cx + u * a, y0 + hh / 2 + v * hh / 2 * .9, cz + sz * half];
    const topA = area([[cx - a, yt, cz - a], [cx + a, yt, cz - a], [cx + a, yt, cz + a], [cx - a, yt, cz + a]]), sideA = area([side(-1, -1), side(1, -1), side(1, 1), side(-1, 1)]);
    for (const d of [1, -1]) { const q0 = topA >= sideA ? [cx - a * tp, yt, cz - d * a * tp] : side(-tp, -d * tp), q1 = topA >= sideA ? [cx + a * tp, yt, cz + d * a * tp] : side(tp, d * tp);
      const p0 = PL(...q0), p1 = PL(...q1); seg(p0, p1, .13 * kAt(p0), '#e6d7b0'); } }
  g.restore();
}

// ---------- the scene hook: the five on foot, and the heads that fly to things in the world ----------
function ipFrontNeeded(X, Z) { return P(X, 0, Z)[2] < P(CX, 0, CZ)[2] - 1.5; } // nearer the camera than the board: drawn over the car layer
// after vote 3 they stand between us and the fire: silhouettes with a firelit rim, like the crowd in front of it
// (burn.js ballotEmbers), but their instruments glow: the dial, the mic's band, the pilot light, and the fire in the lens
const ipSilAmt = (t) => ease(t, 241.2, 244.2);
function ipSilhouette(kind, t, o, p, k, al) {
  const glow = typeof fireGlow === 'function' ? fireGlow(t) : .6, rimA = .35 + .55 * glow, lt = clamp(.45 + glow * .7 - 20 / 120);
  IP_PAPER = rgb(mix([96, 86, 110], [255, 234, 196], lt));
  g.save(); g.globalAlpha = al; g.globalCompositeOperation = 'lighter'; g.translate(p[0] + .03 * k, p[1] - .05 * k); g.scale(k, k); IPS = `rgba(255,140,60,${rimA})`; ipBody(kind, t, o); g.restore();
  g.save(); g.globalAlpha = al; g.translate(p[0], p[1]); g.scale(k, k); IPS = '#1d1520'; ipBody(kind, t, o); IPS = null;
  if (o.head) { g.translate(0, (o.sit || 0) * .74 - IP_COLLAR - .01); g.globalCompositeOperation = 'lighter'; const on = o.on;
    const dot = (x, y, r, col, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
    if (kind === 'LENS') { g.fillStyle = `rgba(255,140,60,${.45 * glow + .15})`; g.beginPath(); g.arc(0, -.74, .34, 0, TAU); g.fill(); dot(-.08, -.82, .2, '255,210,140', .5 * glow); }
    if (kind === 'RADIO') { dot(0, -.29, .2, '90,150,255', .75 * on); g.fillStyle = `rgba(255,214,140,${.6 * on})`; g.beginPath(); g.arc(0, -.29, .1, 0, TAU); g.fill(); }
    if (kind === 'MIC') { g.fillStyle = `rgba(120,200,255,${.85 * on})`; g.fillRect(-.17, -.345, .34, .024); dot(0, -.335, .22, '120,200,255', .35 * on); }
    if (kind === 'CAMERA') { dot(.3, -1.03, .07, '255,190,90', .8 * on); dot(0, -.45, .16, '120,170,220', .35 * on); }
    if (kind === 'RECORDER') { dot(.17, -.23, .1, '255,70,50', .9 * on); for (const d of [-1, 1]) { g.strokeStyle = `rgba(255,170,100,${.4 * on})`; g.lineWidth = .025; g.beginPath(); g.arc(d * .25, -.63, .2, 0, TAU); g.stroke(); } } }
  g.restore(); IP_PAPER = null;
}
function ipWalker(kind, t, st) {
  const ow = ipOwner(kind, t), p = P(ow.X, 0, ow.Z); if (p[2] < 1.2) return null; const k = kAt(p); if (k < .6) return null;
  if (p[0] < -4 * k || p[0] > W + 4 * k || p[1] < -.5 * k || p[1] > H + 4 * k) return null;
  const head = st.where === 'owner', ar = ipArms(kind, t, st);
  const o = { mv: ow.mv, head, on: st.on, hopts: ipHeadOpts(kind, t), hands: ar && ar.hands, ballots: ar && ar.ballots, collarCard: ar && ar.collarCard, sit: ease(t, IP_SIT[0], IP_SIT[1]) };
  const al = 1 - (ow.fade || 0), su = ipSilAmt(t);
  return { z: p[2], draw: () => { if (al * (1 - su) <= .01) return; g.save(); g.globalAlpha = al * (1 - su); g.translate(p[0], p[1]); g.scale(k, k); ipBody(kind, t, o); g.restore(); },
    sil: () => { if (al * su <= .01) return; ipSilhouette(kind, t, o, p, k, al * su); },
    shadow: () => shadowStick(ow.X, 0, head ? 2.75 : 1.8, ow.Z, .5, t), X: ow.X, Z: ow.Z };
}
function instrumentsInto(t, list) {
  const sts = ipState(t);
  for (const st of sts) { const w = ipWalker(st.kind, t, st); if (!w) continue; if ((t < 218 && ipFrontNeeded(w.X, w.Z)) || t >= 241) list.push({ z: w.z, draw: () => {}, shadow: w.shadow }); else list.push(w); }
  // the recorder hops into the giant ear's drawer and sinks into it as it shuts
  const R = sts[IP_KINDS.indexOf('RECORDER')], [r0, r1] = IP_TAKE.RECORDER;
  if (t >= r0 && t < IPT.want + .4) { const dr = ipEarDrawer(t), a = ipCollarScr('RECORDER', t); if (dr) {
    if (t < r1 && a) { const f = ipFly(a, dr, (t - r0) / (r1 - r0), 6, .5); list.push({ z: Math.min(f.d, dr.d), draw: () => ipDrawAt('RECORDER', f, lerp(1, .6, smooth((t - r0) / (r1 - r0))), t, R.on) }); }
    else if (t >= r1 && dr.open > .05) list.push({ z: dr.d, draw: () => { g.save(); g.beginPath(); g.rect(-W, -H, 3 * W, dr.top + H); g.clip(); const hk = dr.k * .6;
      ipHead('RECORDER', dr.x, dr.top + (.25 + (1 - dr.open) * .7) * hk, hk, t, R.on); g.restore(); } }); } }
  // the radio is carried up into the red drape on "blues" 3 and rolled away in its folds (only where the drape is: it hangs in the sky)
  const [d0, d9] = IP_TAKE.RADIO, b = IPT.radio;
  if (t >= d0 && t < b + 3.05) { const a = ipCollarScr('RADIO', t), hy = H / 2 - C.f * Math.tan(C.p), maxY = Math.min(Math.min(hy, H) + 6, 975), vis = clamp((hy - 60) / 120);
    const drop = ease(t, b - .05, b + .6), slide = ease(t, b + 1.75, b + 3.0), D = maxY * .84 * drop;
    const tgt = { x: W * .42, y: 30 + D * .42, k: 120, d: 9e3 };
    const u = clamp((t - d0) / (d9 - d0)), f = a && u < 1 ? ipFly(a, tgt, u, 1.5, 1.2) : Object.assign({}, tgt, { rot: (t - d9) * .8 });
    const sl2 = slide * slide; let x = f.x, y = f.y; { const cr = Math.cos(sl2 * .5), sr = Math.sin(sl2 * .5), lx = x - W + sl2 * W * .25, ly = y + sl2 * maxY * .9; x = W + lx * cr - ly * sr; y = lx * sr + ly * cr; } // ride the drape's slide
    const fold = smooth((u - .5) / .5), z = u > .55 ? 9e3 : f.d, al = u < .5 ? 1 : vis;
    if (al > .01) list.push({ z, draw: () => { g.save(); g.globalAlpha = al; g.translate(x, y); g.rotate(f.rot + sl2 * .5); const o = ipRadioBlind(t);
      ipHead('RADIO', 0, 0, f.k, t, 0, o); if (fold > 0) { g.globalAlpha = al * .5 * fold; ipHead('RADIO', 0, 0, f.k, t, 0, Object.assign({}, o, { sil: '#5a0c12' })); } g.restore(); } }); }
}

// the suits nearer the camera than something we draw on the front layer hide it: their rough silhouettes (body, egg,
// chair and legs down to the sand) are cut out of that item, so a head landing behind a suit's back stays behind it
function ipSeatShapes(t) {
  if (typeof SEATS === 'undefined' || typeof seatState !== 'function') return [];
  return SEATS.map((s, i) => { const o = seatState(s, t, i), Pz = bodyPose(s, o), p = PL(Pz.bx, Pz.hy, Pz.bz); if (p[2] < .25) return null; const k = kAt(p), gp = PL(Pz.bx, 0, Pz.bz), lift = o.lift || 0;
    return { d: p[2], cut: () => { const x = p[0], y = p[1] - (o.bounce || 0) * .09 * k, ey = y - (TORSO + .19) * k; g.beginPath();
      g.moveTo(x - .27 * k, y + .04 * k); g.lineTo(x - .29 * k, y - (TORSO - .02) * k); g.lineTo(x - .05 * k, y - (TORSO + .06) * k); g.lineTo(x + .05 * k, y - (TORSO + .06) * k); g.lineTo(x + .29 * k, y - (TORSO - .02) * k); g.lineTo(x + .27 * k, y + .04 * k); g.closePath(); g.fill();
      g.beginPath(); g.ellipse(x, ey, .135 * k, .165 * k, 0, 0, TAU); g.fill();
      if (gp[2] > .25) g.fillRect(x - .26 * k, y, .52 * k, Math.max(0, gp[1] - y));
      if (lift > .3) { g.fillRect(x + .12 * k, y - (TORSO + .8) * k * lift, .18 * k, .8 * k * lift); if (o.arms === 'vote2') g.fillRect(x - .3 * k, y - (TORSO + .8) * k * lift, .18 * k, .8 * k * lift); } } }; }).filter(Boolean);
}
// ---------- the front hook: things on or over the table, drawn on a layer of our own and graded like the car ----------
const IPF = mkCanvas(), ipf = IPF.getContext('2d'), IPM = mkCanvas(), ipm = IPM.getContext('2d');
function instrumentsFront(t) {
  const items = [], sts = ipState(t);
  // walkers on the camera's side of the board (daytime only; at the burn they stay behind it)
  if (t < 218) for (const st of sts) { const w = ipWalker(st.kind, t, st); if (w && ipFrontNeeded(w.X, w.Z)) items.push({ d: w.z, draw: w.draw }); }
  // from vote 3 on they are in front of the fire: drawn after it, hidden where the departing board is nearer than they are
  const carD = P(CX, TOP, CZ)[2];
  if (t >= 241) for (const st of sts) { const w = ipWalker(st.kind, t, st); if (!w) continue; const behind = carD < w.z - 2;
    items.push({ d: w.z, draw: w.draw, car: behind }); items.push({ d: w.z, draw: w.sil, car: behind, post: true }); }
  // CAMERA: into the news press; the plate comes down on it on "news" and squeezes it flat
  { const [c0, c1] = IP_TAKE.CAMERA, end = L_(12).s + .3; if (t >= c0 && t < end) { const plateY = ipPressPlate(t), pc = PL(IP_PRESS.x, TOP + .1, IP_PRESS.z); if (pc[2] > .2) {
    const u = clamp((t - c0) / (c1 - c0)), a = ipCollarScr('CAMERA', t), e = { x: pc[0], y: pc[1], k: kAt(pc), d: pc[2] }, f = u < 1 && a ? ipFly(a, e, u, 2.5, -.5) : Object.assign(e, { rot: 0 });
    const al = 1 - ease(t, L_(12).s - .2, L_(12).s + .3), sq = clamp((plateY - TOP - .1) / .5);
    items.push({ d: f.d, draw: () => { g.globalAlpha = al; if (u >= 1) { const pb = PL(IP_PRESS.x, plateY, IP_PRESS.z); g.beginPath(); g.rect(-W, pb[1], 3 * W, 2 * H); g.clip(); }
      g.translate(f.x, f.y); g.scale(1 + .5 * (1 - sq), u >= 1 ? Math.max(.08, sq) : 1); ipDrawAt('CAMERA', { x: 0, y: 0, k: f.k, rot: f.rot }, lerp(1, .5, smooth(u)), t, ipLife('CAMERA', t), { cap: true }); } }); } } }
  // LENS: the three nested crates beside the hat hole
  if (t > IPT.put - .2 && t < IPT.talk + 2.5) items.push({ d: PL(IP_CRATE.x, TOP, IP_CRATE.z)[2], draw: () => ipCrates(t) });
  // MIC: it goes soft on "limit", then is reeled in onto the wilting booms on "questions" and dragged off with them
  { const [m0, m1] = IP_TAKE.MIC, e9 = L_(22).e + .9; if (t >= m0 && t < e9) { const [bx, by, bz, reach] = ipMicTarget(t), tip = PL(bx, by, bz); if (tip[2] > .2 && reach > .02) {
    const u = clamp((t - m0) / (m1 - m0)), a = ipCollarScr('MIC', t), e = { x: tip[0], y: tip[1], k: kAt(tip), d: tip[2] }, f = u < 1 && a ? ipFly(a, e, u, 2, .9) : Object.assign(e, { rot: .5 });
    items.push({ d: f.d, draw: () => { g.globalAlpha = clamp(reach); ipDrawAt('MIC', f, lerp(1, .55, smooth(u)), t, 0, { droop: 1 }); } }); } } }
  // the crowns: the real five on five eggs, lit and working, from "facts" 3 to the vote; then they hop home
  for (const st of sts) { if (st.where !== 'crown' && st.where !== 'back') continue; const eg = ipEgg(st.kind, t); if (!eg) continue;
    const pop = easeOutBack(clamp((t - IPT.facts3 - IP_LR.indexOf(st.kind) * .07) / .35));
    if (st.where === 'crown') { if (pop <= 0) continue; items.push({ d: eg.d, draw: () => { g.translate(eg.x, eg.y); g.rotate(Math.sin(t * 1.3 + st.i) * .06); ipHead(st.kind, 0, 0, eg.k * IP_CROWN * pop, t, st.on); } }); }
    else { const a = { x: eg.x, y: eg.y, k: eg.k * IP_CROWN, d: eg.d }, b = ipCollarScr(st.kind, t); if (!b) continue; const f = ipFly(a, b, st.u, 1.4, .8);
      items.push({ d: f.d, draw: () => ipDrawAt(st.kind, f, 1, t, st.on) }); } }
  if (!items.length) return;
  const keep = g; g = ipf; ipf.setTransform(1, 0, 0, 1, 0, 0); ipf.globalCompositeOperation = 'source-over'; ipf.globalAlpha = 1; ipf.clearRect(0, 0, W, H);
  const seats = ipSeatShapes(t);
  const drawItem = (it) => { const near = it.car ? [] : seats.filter((s) => s.d < it.d - .25);
    if (!near.length && !it.car) { g.save(); it.draw(); g.restore(); return; }
    g = ipm; ipm.setTransform(1, 0, 0, 1, 0, 0); ipm.globalCompositeOperation = 'source-over'; ipm.globalAlpha = 1; ipm.clearRect(0, 0, W, H); g.save(); it.draw(); g.restore();
    ipm.globalCompositeOperation = 'destination-out'; ipm.fillStyle = '#000'; for (const s of near) s.cut(); if (it.car) ipm.drawImage(CARC, 0, 0); ipm.globalCompositeOperation = 'source-over';
    g = ipf; ipf.drawImage(IPM, 0, 0); };
  for (const it of items) if (!it.post) drawItem(it);
  ipm.setTransform(1, 0, 0, 1, 0, 0); ipm.clearRect(0, 0, W, H); ipm.drawImage(IPF, 0, 0); grade(t, true);
  ipf.globalCompositeOperation = 'destination-in'; ipf.drawImage(IPM, 0, 0); ipf.globalCompositeOperation = 'source-over';
  for (const it of items) if (it.post) drawItem(it); // silhouettes: after the grade, like the crowd's
  g = keep; g.drawImage(IPF, 0, 0);
}
