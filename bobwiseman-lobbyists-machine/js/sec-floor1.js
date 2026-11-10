// Section 'floor1': verse 3a, verse 3, hook 3 (the Shoveller). Song 51.9-91.0. Owner: b3. Block (world units): x 1500..4300, y -1450..1150.
// Contract (BRIEF.md): the coin's first leg starts at t 51.9 at SEC.list exit point; its last leg ends at t 91.0 at SEC.floor1.exit.p.
// Draw nothing before t 51.9 - 0.5 (no pre-showing); keep drawing after 91.0 (the machine grows). Camera holds only inside 51.9-91.0.
(() => {
'use strict';
const T0 = 51.9, T1 = 91.0;
SEC['floor1'] = { exit: { t: T1, p: [4100, 1150] } };
section({
  id: 'floor1', range: [T0, T1],
  legs(add, land) { const a = SEC['list'].exit.p, b = SEC['floor1'].exit.p; add(T0, T1, (k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]); },
  cam(hold, t, st) {},
  parts(t) {},
  words(t) {},
});
})();
