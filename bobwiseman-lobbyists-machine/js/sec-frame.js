// Section 'frame': the growing jukebox (pull-backs at 115.4 and 166-182) and the outro, seven dives. Song 207.8-268.6. Owner: b7. Block (world units): the jukebox around everything, x -1300..4500, y -3000..5900.
// Contract (BRIEF.md): the coin's first leg starts at t 207.8 at SEC.basement exit point; its last leg ends at t 268.6 at SEC.frame.exit.p.
// Draw nothing before t 207.8 - 0.5 (no pre-showing); keep drawing after 268.6 (the machine grows). Camera holds only inside 207.8-268.6.
(() => {
'use strict';
const T0 = 207.8, T1 = 268.6;
SEC['frame'] = { exit: { t: T1, p: [1600, 5650] } };
section({
  id: 'frame', range: [T0, T1],
  legs(add, land) { const a = SEC['basement'].exit.p, b = SEC['frame'].exit.p; add(T0, T1, (k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]); },
  cam(hold, t, st) {},
  parts(t) {},
  words(t) {},
});
})();
