// Look 5 (school): 1970s educational cartoon, song 123.125-165.083333 (f2955-f3961).
// Every time here is read from source/lines.json (via gen/lines.js); nothing is retyped.
const T0 = 123.125, T1 = 165.083333;
const LN = {}; for (const l of SC_LINES) LN[l.i] = l;
const WS = (li, k) => LN[li].words[k].s;
// A line stays readable until the next line starts or 1.2 s after its last word ends, whichever is later.
function readUntil(li) { const l = LN[li], nx = LN[li + 1]; const last = l.words[l.words.length - 1]; return Math.max(nx ? nx.s : -1, last.e + 1.2); }

// limited animation: drawings change on 2s, counted from the cue (so a pose lands on the cue frame)
const ON2 = 1 / 12;
function since(t, cue, step = ON2) { const x = t - cue; return x < -1e-6 ? -1 : Math.floor(x / step + 1e-6) * step; }
// on-2s clock for idle cycles
const q2 = (t) => Math.floor(t * 12 + 1e-6) / 12;
const q3 = (t) => Math.floor(t * 8 + 1e-6) / 8;
const FR = (t) => Math.round(t * 24);
// which of the three boil drawings (ink lines are redrawn every 2 frames, cycling three drawings)
const boilOf = (t) => Math.floor(FR(t) / 2) % 3;

const B = {
  // 50 (line index in lines.json)
  and50: WS(50, 0), theres50: WS(50, 1), tons: WS(50, 2), of50: WS(50, 3), ink: WS(50, 4),
  // 51 (line index in lines.json)
  thats: WS(51, 0), going: WS(51, 1), to51: WS(51, 2), waste: WS(51, 3),
  // 52 (line index in lines.json)
  at: WS(52, 0), publishing: WS(52, 2), house: WS(52, 3), where: WS(52, 4), order: WS(52, 6), placed: WS(52, 8),
  // 53 (line index in lines.json)
  by: WS(53, 0), man: WS(53, 2), with53: WS(53, 3), fist: WS(53, 5), and53: WS(53, 6), wallet: WS(53, 8), so: WS(53, 9), big: WS(53, 10),
  // 54 (line index in lines.json)
  that54: WS(54, 0), on54: WS(54, 1), wheels: WS(54, 2), came: WS(54, 4), with54: WS(54, 5), adjustable: WS(54, 7), lid: WS(54, 8),
  // 55 (line index in lines.json)
  not: WS(55, 0), couple1: WS(55, 2), hundred: WS(55, 3), but: WS(55, 4), couple2: WS(55, 6), million: WS(55, 7), stacks: WS(55, 8),
  // 56 (line index in lines.json)
  and56: WS(56, 0), title: WS(56, 2), book56: WS(56, 5),
  // 57 (line index in lines.json)
  was57: WS(57, 0), nutritional: WS(57, 1), facts: WS(57, 2),
  // 58 (line index in lines.json)
  and58: WS(58, 0), hired: WS(58, 2), doctor: WS(58, 4), with58: WS(58, 5), phd: WS(58, 7),
  // 59 (line index in lines.json)
  and59: WS(59, 0), he: WS(59, 1), wrote: WS(59, 2), intro: WS(59, 4), and59b: WS(59, 5), book59: WS(59, 7), free: WS(59, 9),
  // 60 (line index in lines.json)
  it60: WS(60, 0), said: WS(60, 1), lettuce: WS(60, 3), bun: WS(60, 6), health: WS(60, 9), no: WS(60, 11), joke: WS(60, 12),
  // 61 (line index in lines.json)
  you: WS(61, 0), drink: WS(61, 2), water1: WS(61, 3), theres61: WS(61, 5), water2: WS(61, 6), in61: WS(61, 7), coke: WS(61, 8),
  // 62 (line index in lines.json)
  and62: WS(62, 0), people: WS(62, 2), felt: WS(62, 3), good: WS(62, 4),
  // 63 (line index in lines.json)
  if63: WS(63, 0), print: WS(63, 3), legit: WS(63, 5),
  // 64 (line index in lines.json)
  and64: WS(64, 0), ordered: WS(64, 2), more: WS(64, 3), fries: WS(64, 4), and64b: WS(64, 5), never: WS(64, 7), did: WS(64, 8), tip: WS(64, 9),
};
// scenes (one location per stretch, moving forward)
B.irisEnd = T0 + 0.5;               // the iris opens on the ink yard
B.panDrain = B.thats - 0.08;        // pan right along the street to the drain
B.panHouse = B.at - 0.30;           // pan on to the publishing house
B.tiltUp = B.stacks - 0.04;         // the stacks shoot up; the camera tilts up with them
B.classroom = B.was57;              // cut: the book lands on the teacher's desk
B.page = B.said;                    // cut: into the open book, the page fills the frame
B.counter = B.and62;                // cut: the lunch counter
