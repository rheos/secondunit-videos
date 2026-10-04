// dev-only figure bench: close-up, mid, full, wide, in sunset + sepia light. Not part of the video.
(() => {
  const bg = (t, warm) => { s.fillStyle = vgrad(s, -200, 2200, warm ? [[0, '#4a1210'], [.5, '#c8431b'], [1, '#ffb347']] : [[0, '#5a4632'], [.6, '#a38b6a'], [1, '#d8c6a4']]); s.fillRect(-900, -900, 3800, 3800); };
  const cu = (t) => { const h = 1500, y = 2100; frame(SC, y - h * .905 + h * .15, pick(1.6, 1.1)); bg(t, 1); glow(SC + 260, y - h * .85, 500, 'rgba(255,170,80,.3)'); wyrd(t, SC, y, h, { turn: .2, sing: 1, eye: .9, lit: .08, guitar: 'none', arms: 'down', wind: .4 }); };
  const mid = (t) => { frame(SC, 820, pick(1.3, .7)); bg(t, 0); wyrd(t, SC, 1500, 1100, { turn: -.1, sing: 1, lit: .2, wind: .5 }); };
  const full = (t) => { frame(SC, SC, pick(1, .7)); bg(t, 1); wyrd(t, SC, 1400, 820, { lit: .1, wind: .8, arms: 'out', guitar: 'none', eye: .8 }); };
  chapter('fig', 0, DUR, [[0, cu, { paint: LOOK.sunset }], [3, mid, { paint: LOOK.sepia }], [6, full, { paint: LOOK.sunset }]]);
})();
