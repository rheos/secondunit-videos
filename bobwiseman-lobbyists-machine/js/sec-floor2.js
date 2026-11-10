// Section 'floor2': verse 4, hook 4 (lobbying, the knocking door). Song 91.0-116.5. Owner: b4. Block (world units): x 1500..4300, y 1350..3900, read right to left.
// Contract (BRIEF.md): the coin's first leg starts at t 91.0 at SEC.floor1 exit point; its last leg ends at t 116.5 at SEC.floor2.exit.p.
// Draw nothing before t 91.0 - 0.5 (no pre-showing); keep drawing after 116.5 (the machine grows). Camera holds only inside 91.0-116.5.
(() => {
'use strict';
const T0 = 91.0, T1 = 116.5;
SEC['floor2'] = { exit: { t: T1, p: [1400, 3700] } };
section({
  id: 'floor2', range: [T0, T1],
  legs(add, land) { const a = SEC['floor1'].exit.p, b = SEC['floor2'].exit.p; add(T0, T1, (k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]); },
  cam(hold, t, st) {},
  parts(t) {},
  words(t) {},
});
})();
