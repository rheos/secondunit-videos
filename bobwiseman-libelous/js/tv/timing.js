// Look 2 (tv): song-time clock for the window 95.916667-123.125 (f2302-f2955).
// Every time here is read from source/lines.json (via gen/lines.js); nothing is retyped.
const T0 = 95.916667, T1 = 123.125;
const LN = {}; for (const l of TV_LINES) LN[l.i] = l;
const WS = (li, k) => LN[li].words[k].s;
// A line stays readable until the next line starts or 1.2 s after its last word ends, whichever is later.
function readUntil(li) { const l = LN[li], nx = LN[li + 1]; const last = l.words[l.words.length - 1]; return Math.max(nx ? nx.s : 1e9, last.e + 1.2); }
const B = {
  on: 95.96,                                   // power on: the dot
  rapunzel: WS(41, 0), tower: WS(41, 4),
  will: WS(42, 0), let_: WS(42, 2), hair: WS(42, 4), down: WS(42, 5),
  the43: WS(43, 0), tv: WS(43, 1), show: WS(43, 2), stopped: WS(43, 4), by: WS(43, 5), ad: WS(43, 7), clown: WS(43, 10),
  telling: WS(44, 0), kids: WS(44, 1), normal: WS(44, 5), eat: WS(44, 8), little: WS(44, 10), meat: WS(44, 11),
  inA: WS(45, 0), store: WS(45, 2), brightly: WS(45, 5), coloured: WS(45, 6), swivel: WS(45, 7), seat: WS(45, 8),
  tell: WS(46, 0), mama1: WS(46, 2), mama2: WS(46, 3), now: WS(46, 4), and46: WS(46, 5), daddy1: WS(46, 7), daddy2: WS(46, 8), too: WS(46, 9),
  ifYou: WS(47, 0), childrens: WS(47, 4), party: WS(47, 5), this47: WS(47, 6), youve: WS(47, 9), do_: WS(47, 12),
  and48: WS(48, 0), gold: WS(48, 2), king: WS(48, 5), spent: WS(48, 6), doing: WS(48, 8), trick: WS(48, 10),
  brought: WS(49, 0), back: WS(49, 1), thirty: WS(49, 2), times: WS(49, 3), his: WS(49, 4), investment: WS(49, 5), quick: WS(49, 6),
};
B.rollEnd = B.stopped + 0.42;       // the vertical hold slips on "stopped" and catches again
B.card = B.stopped + 0.17;          // the station card replaces the show mid-roll
B.adStart = B.by - 0.04;            // the commercial starts on "by"
B.bandIn = B.telling - 0.36;        // the sing-along band slides up before the jingle's first word
B.party = WS(47, 0);
B.bandOut = readUntil(47) + 0.04;   // the band leaves with the ad's last scene
B.endCard = B.bandOut;
B.pullBack = LN[48].s;              // camera pulls back to the living room
B.coinsIn = B.bandOut + 0.08;       // the king's gold flies into the set (spent on the trick)
B.counter = B.brought;              // the investment counter
// Camera: world -> frame. z = zoom, (x, y) = world point at frame centre.
const CAM = [
  { t: T0, x: 820, y: 560, z: 0.86 },
  { t: B.rapunzel - 0.06, x: 722, y: 455, z: 1.52 },
  { t: B.adStart, x: 722, y: 455, z: 1.56 },
  { t: B.pullBack, x: 722, y: 455, z: 1.64 },
  { t: B.pullBack + 0.75, x: 860, y: 515, z: 1.36 },
  { t: T1, x: 860, y: 515, z: 1.33 },
];
function cameraAt(t) {
  let i = 0; while (i + 1 < CAM.length - 1 && CAM[i + 1].t <= t) i++;
  const a = CAM[i], b = CAM[i + 1];
  // moves between keys: the push-in and pull-back are eased, the creeps are linear
  const u = (i === 0 || i === 3) ? smooth(clamp((t - a.t) / (b.t - a.t))) : clamp((t - a.t) / (b.t - a.t));
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u) };
}
