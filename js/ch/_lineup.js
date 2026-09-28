// TEMPORARY look + figure lineup (not part of the video). Five 4 s shots, one per LOOK.
(() => {
  const stage = (look) => (t, lt) => {
    frame(SC, SC + pick(-60, 40), 1);
    if (look === 'ink' || look === 'cracks') { sky('#05070f', '#0d1630', '#233152', 1180); stars(t, 3, 160, -300, 2200, -300, 1150, .9); fullMoon(1300, 700, 150, .9); mesas(1180, 160, '#0a0c14', 4); ground(1180, '#141820', '#06070a'); }
    if (look === 'sepia') { sky(P.sepia1, P.sepia2, P.sepia3, 1180); mesas(1180, 140, '#6b5a44', 4); ground(1180, '#8f7a5c', '#3a2e22'); }
    if (look === 'rock') { sky('#7aa0c4', '#c9b79a', '#e8c48a', 1100); s.fillStyle = vgrad(s, 300, 1300, [[0, P.rockLit], [1, P.rock]]); s.fillRect(-600, 300, 3000, 900); mesas(1180, 100, P.rockShade, 6); ground(1180, P.sand, P.sandShade); saguaro(520, 1200, 380, '#3f4a2c', 2); }
    if (look === 'sunset') { sky(P.sunset0, P.sunset1, P.sunset3, 1180); glow(960, 1150, 700, 'rgba(255,190,90,.35)'); mesas(1180, 180, '#3a120e', 5); ground(1180, '#5a1c10', '#1a0806'); }
    if (look === 'cracks') cracks(t, 960, 1260, 900, 1, 9);
    if (look === 'rock' || look === 'ink') { ramSkull(700, 1330, 90); fireRing(t, 1250, 1330, 110, look === 'ink' ? 1 : .6); }
    if (look === 'sepia') wolfdog(t, 640, 1330, 200, { dir: 1, walk: t * .8 });
    if (look === 'sunset') smokeSerpent(t, 960, 780, 330, { ring: .8 + .2 * Math.sin(t), a: .7 });
    wyrd(t, 960, 1330, 820, { sing: 1, eye: look === 'sunset' ? 1 : 0, wind: .5, arms: look === 'sunset' ? 'out' : 'guitar', guitar: look === 'sunset' ? 'none' : 'play', lit: look === 'rock' ? .5 : .15 });
    if (look === 'ink' || look === 'cracks') sparks(t, 1250, 1300, 120, 500, 40);
  };
  chapter('lineup', 0, DUR, [[0, stage('ink'), { paint: LOOK.ink }], [4, stage('sepia'), { paint: LOOK.sepia }], [8, stage('rock'), { paint: LOOK.rock }], [12, stage('sunset'), { paint: LOOK.sunset }], [16, stage('cracks'), { paint: LOOK.cracks }], [20, stage('sunset'), { paint: LOOK.sunset }]]);
})();
