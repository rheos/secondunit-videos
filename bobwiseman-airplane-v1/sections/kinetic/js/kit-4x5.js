// 4:5 additions to the kit (kinetic-4x5.html only; the 16:9 master never loads this file).
// The 16:9 paper sheet is 1520 x 1010 and the tech log is laid out across it in four columns; neither fits an
// 864-wide frame, so the portrait page gets its own sheet (776 x 1000, sheet-local coordinates 0..776, 0..1000)
// and a log that stacks each entry: date, then the defect, then the engineer's action underneath.
const KIT45 = (() => {
  const SW = 776, SH = 1000;
  // cream sheet, centred, same shake / tilt / slow push-in as KIT.paper; fn draws in sheet coordinates
  function paper(t, lt, fn, o = {}) {
    fill('#141210'); fx({ paper: 1 });
    withT(() => {
      const sh = o.shake || 0, z = 1 + lt * (o.zoom ?? .008);
      s.translate(W / 2 + snoise(t * 50, 5) * sh, H / 2 + snoise(t * 50, 6) * sh); s.rotate(o.rot ?? -.012); s.scale(z, z);
      frect(-SW / 2 + 10, -SH / 2 + 14, SW, SH, 'rgba(0,0,0,.5)'); frect(-SW / 2, -SH / 2, SW, SH, C.paper);
      s.translate(-SW / 2, -SH / 2); fn();
    });
  }
  // the technical log, portrait. Entry k sits at y = LOG.top + k * LOG.rowH (baseline of its date / defect line);
  // live(y) gets the y of the next free entry, where the shot writes the new defect word by word.
  const LOG = { x0: 36, x1: SW - 36, dateX: 36, defX: 150, maxX: SW - 96, actX: 150, signX: SW - 92, top: 236, rowH: 118 };
  function logPage(t, rowsDone, live) {
    const ink = C.pencil, grey = '#6b6357', rule = '#b9ae98', blue = '#2b3a6b';
    frect(LOG.x0, 40, 236, 70, ink); text('TECH LOG', LOG.x0 + 118, 89, { fam: FAM.g, weight: 900, size: 42, color: C.paper, align: 'center' });
    const tsz = fitSize('AIRCRAFT TECHNICAL LOG', LOG.x1 - (LOG.x0 + 258), 32, { fam: FAM.g, weight: 800 });
    text('AIRCRAFT TECHNICAL LOG', LOG.x0 + 258, 72, { fam: FAM.g, weight: 800, size: tsz, color: ink });
    text('AOH-1953 · SHEET 7', LOG.x0 + 258, 104, { fam: FAM.g, weight: 800, size: tsz * .8, color: ink });
    text('Defects reported by crew · Action taken by engineer', LOG.x0, 142, { size: 14, color: grey });
    line([[LOG.x0, 158], [LOG.x1, 158]], ink, 3);
    text('DATE', LOG.dateX, 186, { size: 14, color: grey, ls: 2 }); text('DEFECT / ACTION', LOG.defX, 186, { size: 14, color: grey, ls: 2 });
    text('SIGN', LOG.x1, 186, { size: 14, color: grey, ls: 2, align: 'right' });
    line([[LOG.defX - 14, 166], [LOG.defX - 14, SH - 40]], rule, 1.5);
    for (let y = LOG.top - 38; y < SH - 40; y += LOG.rowH) line([[LOG.x0, y], [LOG.x1, y]], rule, 1.5);
    rowsDone.forEach(([d, def, act], i) => {
      const y = LOG.top + i * LOG.rowH;
      text(d, LOG.dateX, y, { size: 18, color: ink });
      const dsz = Math.min(22, fitSize(def, LOG.maxX - LOG.defX, 22)); text(def, LOG.defX, y, { size: dsz, color: ink });
      text(act, LOG.actX, y + 40, { size: 19, color: blue });
      s.beginPath(); for (let j = 0; j <= 30; j++) { const u = j / 30; s.lineTo(LOG.signX + 6 + u * 50, y + 34 - 9 * Math.sin(u * 12 + i)); } s.lineWidth = 2; s.strokeStyle = blue; s.stroke();
    });
    if (live) live(LOG.top + rowsDone.length * LOG.rowH);
  }
  return { SW, SH, LOG, paper, logPage };
})();
