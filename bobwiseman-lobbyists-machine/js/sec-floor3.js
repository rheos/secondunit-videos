// Section 'floor3': verse 5 (dividends, every fool, the scat line). Song 116.5-157.5. Owner: b5. Block (world units): x -1100..1300, y 1350..3900, read right to left.
// Contract (BRIEF.md): the coin's first leg starts at t 116.5 at SEC.floor2 exit point; its last leg ends at t 157.5 at SEC.floor3.exit.p.
// Draw nothing before t 116.5 - 0.5 (no pre-showing); keep drawing after 157.5 (the machine grows). Camera holds only inside 116.5-157.5.
(() => {
'use strict';
const T0 = 116.5, T1 = 157.5;
SEC['floor3'] = { exit: { t: T1, p: [-950, 3850] } };
section({
  id: 'floor3', range: [T0, T1],
  legs(add, land) { const a = SEC['floor2'].exit.p, b = SEC['floor3'].exit.p; add(T0, T1, (k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]); },
  cam(hold, t, st) {},
  parts(t) {},
  words(t) {},
});
})();
