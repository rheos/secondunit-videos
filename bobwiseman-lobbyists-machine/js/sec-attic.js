// Section 'attic': intro and verse 1. Song 0.0-19.92. Owner: b1. Block (world units): x -1100..1300, y -2800..-1500.
// Contract (BRIEF.md): the coin's last leg ends at t 19.92 at [-520, -1004] (the money bag's mouth; test 01 starts there).
// Camera holds only inside 0-19.92, released into the list section's opening hold (it rises 18.8-19.6).
(() => {
'use strict';
const T0 = 0, T1 = 19.92;
SEC.attic = { exit: { t: T1, p: [-520, -1004] } };
section({
  id: 'attic', range: [T0, T1],
  legs(add, land) { add(-1, T1, () => SEC.attic.exit.p); },
  cam(hold, t, st) {},
  parts(t) {},
  words(t) {},
});
})();
