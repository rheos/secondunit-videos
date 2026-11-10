// Section 'basement': instrumental coin wash, the long chute, verse 6, the APPROVED stamp. Song 157.5-207.8. Owner: b6. Block (world units): x -1100..4300, y 4100..5600.
// Contract (BRIEF.md): the coin's first leg starts at t 157.5 at SEC.floor3 exit point; its last leg ends at t 207.8 at SEC.basement.exit.p.
// Draw nothing before t 157.5 - 0.5 (no pre-showing); keep drawing after 207.8 (the machine grows). Camera holds only inside 157.5-207.8.
(() => {
'use strict';
const T0 = 157.5, T1 = 207.8;
SEC['basement'] = { exit: { t: T1, p: [1600, 5650] } };
section({
  id: 'basement', range: [T0, T1],
  legs(add, land) { const a = SEC['floor3'].exit.p, b = SEC['basement'].exit.p; add(T0, T1, (k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]); },
  cam(hold, t, st) {},
  parts(t) {},
  words(t) {},
});
})();
