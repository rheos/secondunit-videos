// The jam's cars: early-sixties four-door saloons, painted as glossy enamel in B&W (sky reflected on the upper flanks,
// a hard horizon line, the road reflected below), chrome strips and bumpers, glass reflecting the haze, tyres in arches.

// ---------- side profile, facing right. Origin on the ground under the middle, k = px per metre. ----------
// o: v (haze 0..1), paint (0 black .. .6 pale), glass ({x, y, w, h} interior painter callback: fn(g) drawn behind the glass),
//    smoke (0..1 the inside filled with white haze), driver (0..1 a still silhouette at the wheel)
function carSide(g, x, y, k, o = {}) {
  const v = o.v || 0, P = o.paint ?? .12, H = (a) => lerp(a, .92, v), tone = (a, al = 1) => gv(H(a), al);
  g.save(); g.translate(x, y); g.scale(k, k);
  // soft shadow under the car and contact shadows under the tyres (sun high)
  g.fillStyle = gv(0, .35 * (1 - v)); ell(g, 0, -.02, 2.25, .09); g.fill();
  g.fillStyle = gv(0, .5 * (1 - v)); for (const wx of [-1.38, 1.42]) { ell(g, wx, -.01, .38, .035); g.fill(); }
  // tyres (behind the body: the arches cut over them)
  for (const wx of [-1.38, 1.42]) {
    g.fillStyle = tone(.06); ell(g, wx, -.33, .335, .33); g.fill();
    g.strokeStyle = tone(.2); g.lineWidth = .02; ell(g, wx, -.33, .29, .29); g.stroke();
    // hubcap: chrome dish with a bright crescent toward the sky and a dark centre
    g.fillStyle = radG(g, wx, -.33, .01, .2, [[0, H(.35)], [.5, H(.85)], [.8, H(.55)], [1, H(.25)]], -.04, -.06); ell(g, wx, -.33, .19, .19); g.fill();
    g.fillStyle = tone(.15); ell(g, wx, -.33, .05, .05); g.fill();
  }
  // body silhouette
  const body = () => {
    g.beginPath();
    g.moveTo(2.28, -.42); g.quadraticCurveTo(2.3, -.72, 2.12, -.78);           // nose
    g.lineTo(1.05, -.86);                                                      // bonnet
    g.quadraticCurveTo(.78, -1.32, .4, -1.4);                                  // windscreen
    g.quadraticCurveTo(-.1, -1.45, -.62, -1.4);                                // roof
    g.quadraticCurveTo(-1.0, -1.32, -1.28, -.92);                              // rear screen
    g.lineTo(-2.12, -.86); g.quadraticCurveTo(-2.3, -.84, -2.3, -.6);           // boot and tail
    g.lineTo(-2.28, -.4); g.lineTo(-1.82, -.36);
    g.arc(-1.38, -.33, .44, Math.PI * 1.06, Math.PI * 1.94, false);            // rear arch
    g.lineTo(.98, -.36);
    g.arc(1.42, -.33, .44, Math.PI * 1.06, Math.PI * 1.94, false);             // front arch
    g.lineTo(2.28, -.42); g.closePath();
  };
  body(); g.fillStyle = tone(P); g.fill();
  g.save(); body(); g.clip();
  // enamel: the sky in the upper flanks, a hard horizon reflection just under the waist, the road below
  g.fillStyle = linG(g, 0, -1.0, 0, -.36, [[0, H(P + .5)], [.32, H(P + .38)], [.36, H(P * .4)], [.6, H(P + .05)], [1, H(P + .2)]]);
  g.fillRect(-2.4, -1.0, 4.8, .7);
  // roof and bonnet tops catch the sun
  g.fillStyle = linG(g, 0, -1.46, 0, -1.3, [[0, H(.85)], [1, H(P + .1), 0]]); g.fillRect(-1, -1.5, 1.8, .2);
  g.fillStyle = linG(g, 0, -.88, 0, -.8, [[0, H(.8), .9], [1, H(P), 0]]); g.fillRect(1.0, -.9, 1.3, .1);
  g.fillStyle = linG(g, 0, -.9, 0, -.82, [[0, H(.75), .8], [1, H(P), 0]]); g.fillRect(-2.3, -.92, 1.1, .1);
  // arches darker inside the lip
  g.fillStyle = gv(0, .3 * (1 - v)); for (const wx of [-1.38, 1.42]) { ell(g, wx, -.33, .5, .5); g.fill(); }
  g.restore();
  // glass: the greenhouse, three side windows split by pillars
  const win = () => { g.beginPath(); g.moveTo(.92, -.9); g.quadraticCurveTo(.7, -1.28, .36, -1.33); g.quadraticCurveTo(-.1, -1.37, -.56, -1.33); g.quadraticCurveTo(-.9, -1.25, -1.12, -.92); g.closePath(); };
  win(); g.fillStyle = tone(.22); g.fill();
  g.save(); win(); g.clip();
  if (o.inside) o.inside(g);                                                    // his silhouette, painted behind the glass
  if (o.driver) { g.fillStyle = tone(.08, o.driver); ell(g, .25, -1.06, .11, .13); g.fill(); g.fillRect(.08, -.98, .34, .12); g.fillRect(.13, -1.24, .24, .05); ell(g, .25, -1.24, .17, .025); g.fill(); }
  if (o.smoke) { g.fillStyle = gv(H(.96), .9 * o.smoke); g.fillRect(-1.2, -1.4, 2.2, .6); }
  // reflection of the bright haze across the glass, a diagonal streak
  g.fillStyle = linG(g, 0, -1.36, 0, -.9, [[0, H(.95), .55], [.6, H(.8), .15], [1, H(.7), .05]]); g.fillRect(-1.2, -1.4, 2.2, .6);
  g.fillStyle = gv(1, .18 * (1 - v)); poly(g, [[-.2, -1.36], [.05, -1.36], [-.35, -.9], [-.6, -.9]]); g.fill();
  g.restore();
  g.fillStyle = tone(P * .6); g.fillRect(.02, -1.36, .07, .46); g.fillRect(-.66, -1.33, .06, .43);                 // B and C pillars
  g.strokeStyle = tone(.85, .8); g.lineWidth = .018; win(); g.stroke();                                            // chrome window surround
  // waist chrome strip, door shut lines, handles
  g.strokeStyle = tone(.95, .9); g.lineWidth = .025; g.beginPath(); g.moveTo(-2.25, -.66); g.lineTo(2.22, -.68); g.stroke();
  g.strokeStyle = tone(.02, .7); g.lineWidth = .012; g.beginPath(); g.moveTo(.95, -.88); g.lineTo(.98, -.38); g.moveTo(.05, -.9); g.lineTo(.05, -.38); g.moveTo(-.95, -.9); g.lineTo(-.9, -.38); g.stroke();
  g.fillStyle = tone(.9); g.fillRect(.66, -.79, .14, .025); g.fillRect(-.26, -.79, .14, .025);
  // bumpers: chrome bars, bright on top, dark under
  for (const [x0, x1] of [[2.12, 2.36], [-2.38, -2.12]]) { g.fillStyle = linG(g, 0, -.5, 0, -.38, [[0, H(1)], [.45, H(.55)], [1, H(.15)]]); g.beginPath(); g.roundRect(x0, -.5, x1 - x0, .12, .04); g.fill(); }
  // headlamp and tail lamp
  g.fillStyle = radG(g, 2.2, -.67, .005, .09, [[0, H(1)], [.6, H(.7)], [1, H(.3)]], -.02, -.02); ell(g, 2.21, -.67, .05, .085); g.fill();
  g.fillStyle = tone(.3); g.fillRect(-2.31, -.8, .06, .18);
  g.restore();
}

// ---------- seen from behind, slightly from above. Origin on the ground under the middle of the rear, k = px per metre. ----------
// o: v (haze), paint, head (a still passenger silhouette in the rear window: 0 none, 1 man in a hat, 2 woman), lean (-1..1 a small turn)
function carRear(g, x, y, k, o = {}) {
  const v = o.v || 0, P = o.paint ?? .12, H = (a) => lerp(a, .92, v), tone = (a, al = 1) => gv(H(a), al), sk = (o.lean || 0) * .08;
  g.save(); g.translate(x, y); g.scale(k, k);
  g.fillStyle = gv(0, .4 * (1 - v)); ell(g, 0, -.02, 1.0, .07); g.fill();
  // tyres under the bumper
  g.fillStyle = tone(.05); for (const s of [-1, 1]) { g.beginPath(); g.roundRect(s * .74 - .12, -.36, .24, .36, .05); g.fill(); }
  // lower body: rounded slab, tail fins
  const lower = () => { g.beginPath(); g.moveTo(-.86, -.3); g.lineTo(-.9, -.82); g.quadraticCurveTo(-.88, -.9, -.8, -.92); g.lineTo(.8, -.92); g.quadraticCurveTo(.88, -.9, .9, -.82); g.lineTo(.86, -.3); g.quadraticCurveTo(0, -.26, -.86, -.3); g.closePath(); };
  lower(); g.fillStyle = tone(P); g.fill();
  g.save(); lower(); g.clip();
  g.fillStyle = linG(g, 0, -.94, 0, -.3, [[0, H(P + .45)], [.3, H(P + .3)], [.34, H(P * .3)], [.7, H(P + .06)], [1, H(P + .16)]]); g.fillRect(-1, -1, 2, .75);
  g.fillStyle = linG(g, -.9, 0, .9, 0, [[0, 0, .25], [.25, 0, 0], [.75, 0, 0], [1, 0, .35]]); g.fillRect(-1, -1, 2, .75); // the corners turn away
  g.restore();
  // boot lid seen from a little above: a lit band
  g.fillStyle = linG(g, 0, -1.0, 0, -.91, [[0, H(.88)], [1, H(P + .35)]]);
  g.beginPath(); g.moveTo(-.8, -.92); g.lineTo(-.72, -1.0); g.lineTo(.72, -1.0); g.lineTo(.8, -.92); g.closePath(); g.fill();
  // cabin: rear screen in its frame, roof edge lit
  g.fillStyle = tone(P + .05); g.beginPath(); g.moveTo(-.72, -1.0); g.lineTo(-.6 + sk, -1.42); g.lineTo(.6 + sk, -1.42); g.lineTo(.72, -1.0); g.closePath(); g.fill();
  const scr = () => { g.beginPath(); g.moveTo(-.62, -1.03); g.lineTo(-.52 + sk, -1.37); g.lineTo(.52 + sk, -1.37); g.lineTo(.62, -1.03); g.closePath(); };
  scr(); g.fillStyle = tone(.3); g.fill();
  g.save(); scr(); g.clip();
  if (o.head) { // still figures inside, backs of heads
    for (const [hx, kind] of o.head === 3 ? [[-.25, 1], [.25, 2]] : [[.22, o.head]]) {
      g.fillStyle = tone(.07); ell(g, hx, -1.16, .11, .13); g.fill(); g.fillRect(hx - .2, -1.06, .4, .1);
      if (kind === 1) { g.fillRect(hx - .1, -1.33, .2, .08); ell(g, hx, -1.26, .17, .03); g.fill(); }
      else { ell(g, hx, -1.2, .14, .12); g.fill(); }
    }
  }
  g.fillStyle = linG(g, 0, -1.37, 0, -1.03, [[0, H(.95), .6], [1, H(.8), .2]]); g.fillRect(-1, -1.4, 2, .4);
  g.fillStyle = gv(1, .15 * (1 - v)); poly(g, [[-.2, -1.37], [0, -1.37], [-.3, -1.03], [-.5, -1.03]]); g.fill();
  g.restore();
  g.strokeStyle = tone(.85, .7); g.lineWidth = .02; scr(); g.stroke();
  g.fillStyle = linG(g, 0, -1.46, 0, -1.4, [[0, H(.9)], [1, H(P + .3)]]); g.beginPath(); g.moveTo(-.6 + sk, -1.42); g.quadraticCurveTo(sk, -1.48, .6 + sk, -1.42); g.closePath(); g.fill();
  // tail lamps (tall, glossy, dark in B&W), number plate (blank), bumper chrome
  for (const s of [-1, 1]) { g.fillStyle = radG(g, s * .8, -.7, .01, .14, [[0, H(.55)], [1, H(.12)]], -.02, -.05); g.beginPath(); g.roundRect(s * .8 - .06, -.86, .12, .3, .03); g.fill(); }
  g.fillStyle = tone(.8); g.fillRect(-.17, -.58, .34, .1); g.strokeStyle = tone(.3); g.lineWidth = .012; g.strokeRect(-.17, -.58, .34, .1);
  g.fillStyle = linG(g, 0, -.44, 0, -.33, [[0, H(1)], [.5, H(.55)], [1, H(.15)]]); g.beginPath(); g.roundRect(-.95, -.44, 1.9, .11, .04); g.fill();
  g.restore();
}
