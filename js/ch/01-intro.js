// 0.0 - 13.0  the chant, then the quiet before "put on hold".
// Outside the Ministry at dawn: a grey slab grown over with ducts, a painted sky on a billboard in front
// of the real grey one. Each chanted "we got" lights a floor. Then the title, typed on a form.
(() => {
  const CHANT = [0.0, 1.84, 3.32, 4.78]; // each "we" of the opening chant (vocal stem)
  const TX = W / 2, BASE = 930;

  // the tower, front on and symmetrical. lit = how many floors (from the bottom) have their lights on
  function tower(t, lit) {
    const tw = 700, th = 700, x0 = TX - tw / 2, y0 = BASE - th;
    shape([[x0, BASE], [x0 + tw, BASE], [x0 + tw, y0], [x0, y0]], '#6d716c', 3);
    hatch([[x0 + tw * .72, BASE], [x0 + tw, BASE], [x0 + tw, y0], [x0 + tw * .72, y0]], .95, 10, 1.4, .5);
    // the crown: a stepped top with a clock that has no hands
    shape([[TX - 180, y0], [TX + 180, y0], [TX + 120, y0 - 110], [TX - 120, y0 - 110]], '#5f635e', 3);
    s.beginPath(); s.arc(TX, y0 - 40, 46, 0, TAU); s.fillStyle = CREAM; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke();
    dot(TX, y0 - 40, 5, INK);
    // floors of windows: 9 floors x 12
    const rowsN = 9, colsN = 12, wx = (tw - 80) / colsN, wy = (th - 220) / rowsN; // 9 floors
    for (let r = 0; r < rowsN; r++) for (let c = 0; c < colsN; c++) {
      const x = x0 + 40 + c * wx + 8, y = BASE - 180 - (r + 1) * wy + 10, on = r < lit[0] || (r === lit[0] && c / colsN < lit[1]);
      shape([[x, y], [x + wx - 16, y], [x + wx - 16, y + wy - 24], [x, y + wy - 24]], on ? AMBER : '#3b3e3b', 1.6);
      if (on) { s.globalAlpha = .25; dot(x + (wx - 16) / 2, y + (wy - 24) / 2, wx * .7, AMBER); s.globalAlpha = 1; }
    }
    // the door: revolving, dark, at the foot
    shape([[TX - 90, BASE], [TX + 90, BASE], [TX + 90, BASE - 160], [TX - 90, BASE - 160]], '#2c2e2b', 3);
    const rv = t * .9; for (let i = 0; i < 3; i++) { const a = rv + i * TAU / 3; ink([[TX, BASE - 150], [TX, BASE - 10]], 2); ink([[TX + Math.cos(a) * 80, BASE - 150], [TX + Math.cos(a) * 80, BASE - 10]], 3); }
    text('MINISTRY', TX, BASE - 178, 34, { font: 'sign', color: CREAM, spacing: 14, max: 300 });
    // ducts climbing the face like ivy: fat ribbed tubes that wander up from the ground
    for (let d = 0; d < 5; d++) {
      if (d === 2) continue; // keep the door and the name clear
      const sx = x0 - 60 + d * (tw + 120) / 4, pts = [];
      for (let i = 0; i <= 30; i++) { const u = i / 30, y = BASE - u * (th + 60); pts.push([sx + Math.sin(u * 5 + d * 1.7) * 70 + snoise(u * 3 + t * .05, d) * 20, y]); }
      line(pts, INK, 40 - d % 2 * 12); line(pts, d % 2 ? STEEL_D : STEEL, 34 - d % 2 * 12);
      for (let i = 1; i < 30; i += 2) { const [px, py] = pts[i]; ink([[px - 20 + d % 2 * 6, py], [px + 20 - d % 2 * 6, py]], 2); }
      if (window.PNC_ON) line(pts.map(([px, py]) => [px - 9 + d % 2 * 3, py]), 'rgba(255,250,235,.5)', 6 - d % 2 * 2);   // chrome highlight
    }
  }
  // the billboard's painted sky, the only blue: a lie standing in front of the real grey sky
  function billboard(t, x, y, w, h) {
    ink([[x + w * .2, y + h], [x + w * .2, BASE]], 8); ink([[x + w * .8, y + h], [x + w * .8, BASE]], 8);
    for (let i = 0; i < 6; i++) ink([[x + w * .2, y + h + i * 40], [x + w * .8, y + h + 20 + i * 40]], 2);
    s.fillStyle = vgrad(y, y + h, [[0, SKY_T], [1, SKY_B]]); s.fillRect(x, y, w, h);
    withT(() => { s.beginPath(); s.rect(x, y, w, h); s.clip(); cloud(x + w * .3 + t * 6, y + h * .55, 46, 3); cloud(x + w * .78 - t * 3, y + h * .35, 32, 8); });
    s.lineWidth = 6; s.strokeStyle = INK; s.strokeRect(x, y, w, h);
    shape([[x, y + h - 54], [x + w, y + h - 54], [x + w, y + h], [x, y + h]], CREAM, 3);
    text('THE SKY. NOW AVAILABLE.', x + w / 2, y + h - 16, 32, { font: 'sign', spacing: 4, max: w - 30 });
  }

  function exterior(t, lt) {
    const z = kf(t, [[0, 1], [6.8, 1.16]], ease.sine);
    withT(() => {
      s.translate(TX, BASE - 80); s.scale(z, z); s.translate(-TX, -(BASE - 80));
      s.fillStyle = vgrad(0, BASE, [[0, '#8a8d88'], [1, '#b9b6a5']]); s.fillRect(-200, -400, W + 400, BASE + 400);
      // low city blocks either side, each with its own duct
      for (let i = 0; i < 9; i++) { const bx = i * 240 - 120, bh = 160 + hash(i * 7) * 260; if (Math.abs(bx + 100 - TX) < 480) continue;
        shape([[bx, BASE], [bx + 210, BASE], [bx + 210, BASE - bh], [bx, BASE - bh]], i % 2 ? '#7d807a' : '#73766f', 2.5);
        for (let r = 0; r < bh / 50 - 1; r++) for (let c = 0; c < 4; c++) shape([[bx + 20 + c * 48, BASE - bh + 24 + r * 50], [bx + 50 + c * 48, BASE - bh + 24 + r * 50], [bx + 50 + c * 48, BASE - bh + 52 + r * 50], [bx + 20 + c * 48, BASE - bh + 52 + r * 50]], '#4a4d49', 1.2); }
      // floors light one by one through each "we got"
      let lit = [0, 0];
      for (let i = 0; i < CHANT.length; i++) if (t >= CHANT[i]) lit = [i * 2, 0];
      const lastI = CHANT.filter((c) => t >= c).length - 1;
      if (lastI >= 0) { const k = inv(CHANT[lastI], CHANT[lastI] + 1.2, t); lit = [lastI * 2 + Math.floor(k * 2), (k * 2) % 1]; }
      if (t > CHANT[3] + 1.2) lit = [8 + Math.floor(inv(6.3, 6.8, t)), 0];
      tower(t, lit);
      billboard(t, 1300, 360, 520, 300);
      shape([[-200, BASE], [W + 200, BASE], [W + 200, H + 400], [-200, H + 400]], '#9d9a87', 3);
      for (let i = -10; i < 20; i++) ink([[TX + i * 120, BASE], [TX + i * 420, H + 300]], 1.4);
    });
  }

  // 6.8: the title, typed on a form on a desk, under a desk lamp
  function title(t, lt) {
    fill('#5d5a4c');
    s.globalAlpha = .3; for (let i = 0; i < 30; i++) ink([[0, i * 40 + 10], [W, i * 40 - 30]], 1.2); s.globalAlpha = 1;
    s.globalAlpha = .45; dot(W / 2, 470, 760, '#d8cfae'); s.globalAlpha = 1;
    const slide = ease.out(inv(6.8, 7.6, t));
    const typed = Math.floor(Math.max(0, t - 7.9) * 9);
    withT(() => {
      s.translate(W / 2 - 420, 140 + (1 - slide) * 900); s.rotate(-.02);
      form(0, 0, 840, ['WE GOT TIME', '', 'BOB WISEMAN'], { typed, title: 'FORM WGT-89  /  REQUEST FOR TIME', size: 58, h: 640 });
      text('APPLICANT', 840 - 40, 590, 20, { font: 'sign', align: 'right', alpha: .6 });
    });
    stamp(t, 11.3, W / 2 + 110, 640, 'RECEIVED', { size: 70, rot: -.14 });
    // the pneumatic tube's mouth at the top edge: a canister arrives as the stamp lands
    shape([[1450, -20], [1610, -20], [1600, 90], [1460, 90]], STEEL, 3);
    const c = ease.back(inv(11.6, 12.3, t)); if (t > 11.6) shape([[1490, 40 + c * 120], [1570, 40 + c * 120], [1570, 120 + c * 120], [1490, 120 + c * 120]], BRASS, 2.5);
  }

  chapter('intro', 0.0, 13.0, [[0.0, exterior], [6.8, title]]);
})();
