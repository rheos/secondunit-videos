// devweb ep 6: the type on top of the world. Classic script, so index.html and check-graybox.mjs both read it.
// Two clear zones, nothing else: the TOP band above the set (only while the set sits low enough; the check measures it)
// and the LOW zone right of Blink and under the sheet, centred at x 845, 390 px wide. No sticker-style quote marks.
// { lines: [[text, centre x, baseline y, size], ...], at: lands on this word, gone: fully off by this time, big: slams }
window.OVERLAYS = function (w) {
  const LOW = 845;
  const endIn = w("nothing", 3) + 0.57;
  return [
    { lines: [["BROKE NOTHING", 540, 150, 92]], at: w("broke"), gone: w("36"), big: 1 },
    { lines: [["36 OF 37", 540, 110, 84], ["ON THE DEFAULT", 540, 200, 84]], at: w("36"), gone: w("the") + 0.36 },
    { lines: [["JUL 5", 540, 125, 92]], at: w("july"), gone: w("and") },
    { lines: [["BY AUGUST", 540, 120, 92]], at: w("by"), gone: w("so") },
    { lines: [["53 DAYS", LOW, 1120, 96]], at: w("53"), gone: w("nothing", 2), big: 1 },
    { lines: [["NOTHING", LOW, 1120, 72], ["FLAGS IT", LOW, 1200, 72]], at: w("nothing", 2), gone: w("a", 3) },
    { lines: [["NO MODE KEY", 540, 140, 92]], at: w("no"), gone: w("back"), big: 1 },
    { lines: [["BACK IN JUNE", 540, 100, 84]], at: w("back"), gone: w("on", 6) },
    { lines: [["NO SEARCH ON ITS OWN", 540, 186, 70]], at: w("didn't"), gone: w("on", 6) },
    { lines: [["AUG 27", 540, 150, 92]], at: w("august", 3), gone: w("the", 14) },
    { lines: [["A WRITTEN", LOW, 1100, 64], ["RULE FOR", LOW, 1175, 64], ["THE MODEL", LOW, 1250, 64]], at: w("written"), gone: w("the", 15) },
    { lines: [["SAME DAY", 540, 150, 92]], at: w("same"), gone: w("began") + 0.42 },
    { lines: [["THE MODEL", LOW, 1520, 60], ["TOO", LOW, 1592, 60]], at: w("model", 5), gone: w("caller", 2) + 0.3 },
    { lines: [["THE DEFAULT", LOW, 1110, 58], ["IS YOUR", LOW, 1182, 58], ["ROLLOUT", LOW, 1254, 58]], at: w("the", 18), gone: w("and", 7) },
    { lines: [["SHIPPED,", LOW, 1150, 84], ["NOT ON", LOW, 1244, 84]], at: w("shipping"), gone: w("so", 3) },
    { lines: [["LOG THE", 540, 100, 84], ["RESOLVED MODE", 540, 190, 84]], at: w("log", 3), gone: w("call", 3) },
    { lines: [["SKIP THE COUNT", 540, 140, 84]], at: w("skip"), gone: w("because", 2) },
    { lines: [["BREAKS NOTHING", 540, 150, 92]], at: w("breaks"), gone: endIn, big: 1 },
  ];
};
