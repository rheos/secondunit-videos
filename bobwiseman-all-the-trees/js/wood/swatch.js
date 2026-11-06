function drawScene(t) {
  const ks = Object.keys(SPECIES); const cw = W / 5, ch = H / 3;
  ks.forEach((k, i) => { const x = (i % 5) * cw, y = Math.floor(i / 5) * ch;
    piece(poly([[x + 8, y + 8], [x + cw - 8, y + 8], [x + cw - 8, y + ch - 8], [x + 8, y + ch - 8]]), k, { ang: i % 2 ? .3 : 0, ox: x + cw / 2, oy: y + ch / 2 });
    g.fillStyle = '#fff'; g.font = '22px sans-serif'; g.fillText(k, x + 20, y + 40); });
}
