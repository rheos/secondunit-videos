// Paper, table, letterpress type and printer's ornaments. All seeded; nothing changes between calls.

const PR = (() => {
  const PAPER = [234, 223, 197];
  const INK = '#18140f', RED = '#b02a1e';
  // ---------- laid rag paper tile (tileable, 1024) ----------
  const TILE = 1024;
  const paperTile = mkCanvas(TILE, TILE);
  (function () {
    const g = paperTile.getContext('2d');
    const d = g.createImageData(TILE, TILE), a = d.data;
    const R = mulberry(31);
    const lat = 16, L = new Float32Array(lat * lat), lat2 = 64, L2 = new Float32Array(lat2 * lat2);
    for (let i = 0; i < L.length; i++) L[i] = R(); for (let i = 0; i < L2.length; i++) L2[i] = R();
    const per = (T, n, x, y) => { // periodic value noise
      const fx = x * n / TILE, fy = y * n / TILE, ix = Math.floor(fx), iy = Math.floor(fy), ux = smooth(fx - ix), uy = smooth(fy - iy);
      const q = (i, j) => T[((j % n + n) % n) * n + ((i % n + n) % n)];
      return lerp(lerp(q(ix, iy), q(ix + 1, iy), ux), lerp(q(ix, iy + 1), q(ix + 1, iy + 1), ux), uy);
    };
    for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) {
      const i = (y * TILE + x) * 4;
      let v = 1 + (per(L, lat, x, y) - .5) * .07 + (per(L2, lat2, x, y) - .5) * .035;
      v -= ((y % 5) === 0 ? .022 : 0);                      // laid lines
      const cx = x % 128; v -= cx < 3 ? .035 * (1 - Math.abs(cx - 1) / 2) : 0; // chain lines
      v += (R() - .5) * .03;                                   // tooth
      a[i] = PAPER[0] * v; a[i + 1] = PAPER[1] * v; a[i + 2] = PAPER[2] * v; a[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    // fibres and a few foxing spots
    for (let k = 0; k < 900; k++) {
      const x = R() * TILE, y = R() * TILE, l = 6 + R() * 22, an = R() * TAU;
      g.strokeStyle = `rgba(${R() < .5 ? '120,100,70' : '255,250,235'},${.06 + R() * .07})`; g.lineWidth = .7;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(an) * l * .5 + (R() - .5) * 6, y + Math.sin(an) * l * .5 + (R() - .5) * 6, x + Math.cos(an) * l, y + Math.sin(an) * l); g.stroke();
    }
    for (let k = 0; k < 14; k++) {
      const x = R() * TILE, y = R() * TILE, r = 2 + R() * 9;
      const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, 'rgba(150,100,50,.16)'); rg.addColorStop(1, 'rgba(150,100,50,0)');
      g.fillStyle = rg; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
  })();

  // ---------- ink speckle tile (destination-out: where the type took no ink) ----------
  const speck = mkCanvas(512, 512);
  (function () {
    const g = speck.getContext('2d'), R = mulberry(57);
    for (let k = 0; k < 2600; k++) { g.fillStyle = `rgba(0,0,0,${.35 + R() * .6})`; const r = .4 + R() * 1.3; g.beginPath(); g.arc(R() * 512, R() * 512, r, 0, TAU); g.fill(); }
    for (let k = 0; k < 60; k++) { const x = R() * 512, y = R() * 512, r = 6 + R() * 24; const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, `rgba(0,0,0,${.18 + R() * .2})`); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  })();

  // ---------- table wood tile ----------
  const wood = mkCanvas(1024, 512);
  (function () {
    const g = wood.getContext('2d'), R = mulberry(91);
    g.fillStyle = '#2a1f17'; g.fillRect(0, 0, 1024, 512);
    for (let k = 0; k < 220; k++) { const y = R() * 512, a = .05 + R() * .12; g.strokeStyle = R() < .5 ? `rgba(10,6,3,${a})` : `rgba(90,64,40,${a * .7})`; g.lineWidth = 1 + R() * 3; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= 1024; x += 64) g.lineTo(x, y + Math.sin(x / 140 + k) * 3 + (R() - .5) * 2); g.stroke(); }
  })();

  // layer canvases (screen sized) for type
  const TL = mkCanvas(W, H), TLg = TL.getContext('2d');
  const RL = mkCanvas(W, H), RLg = RL.getContext('2d');

  function beginType() {
    for (const g of [TLg, RLg]) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, W, H); }
  }
  // compose the type layers onto the page: bite shadow, ink with speckle, red plate misregistered
  function endType(g, cam) {
    const m = new DOMMatrix([cam.s, 0, 0, cam.s, (0 - cam.x) * cam.s + W / 2, (0 - cam.y) * cam.s + H / 2]);
    for (const L of [TLg, RLg]) {
      L.setTransform(1, 0, 0, 1, 0, 0); L.globalCompositeOperation = 'destination-out';
      const pt = L.createPattern(speck, 'repeat'); pt.setTransform(m); L.fillStyle = pt; L.globalAlpha = .9; L.fillRect(0, 0, W, H);
      L.globalAlpha = 1; L.globalCompositeOperation = 'source-over';
    }
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    // the bite: type pressed into the paper leaves a faint shadow below-right
    const o = Math.max(1, 1.8 * cam.s);
    g.globalAlpha = .16; g.drawImage(TL, o, o); g.drawImage(RL, o + 3 * cam.s, o - 2 * cam.s);
    g.globalAlpha = .95; g.globalCompositeOperation = 'multiply';
    g.drawImage(RL, 3 * cam.s, -2 * cam.s);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = .96; g.drawImage(TL, 0, 0);
    g.restore();
  }

  // set a run of letterpress type; ctx already transformed to page units
  function typeText(L, txt, x, y, size, opt = {}) {
    L.font = `${opt.italic ? 'italic ' : ''}${size}px "Big Caslon"`;
    L.textBaseline = 'alphabetic'; L.textAlign = opt.align || 'left';
    L.fillStyle = opt.color || INK; L.fillText(txt, x, y);
    // ink squash: a hair of extra ink at the edges of the face
    L.strokeStyle = opt.color || INK; L.lineWidth = size * .012; L.lineJoin = 'round'; L.strokeText(txt, x, y);
  }
  function ornament(L, ch, x, y, size, opt = {}) {
    L.font = `${size}px "${opt.font || 'Hoefler Text Ornaments'}"`; L.textBaseline = 'alphabetic'; L.textAlign = opt.align || 'center';
    L.fillStyle = opt.color || INK; L.fillText(ch, x, y);
  }

  function paperPattern(g, cam) {
    const pt = g.createPattern(paperTile, 'repeat');
    pt.setTransform(new DOMMatrix([cam.s, 0, 0, cam.s, (0 - cam.x) * cam.s + W / 2, (0 - cam.y) * cam.s + H / 2]));
    return pt;
  }
  function woodPattern(g, cam) {
    const pt = g.createPattern(wood, 'repeat');
    const k = .5 + cam.s * .5;
    pt.setTransform(new DOMMatrix([k, 0, 0, k, (0 - cam.x) * cam.s * .6, (0 - cam.y) * cam.s * .6]));
    return pt;
  }
  return { PAPER, INK, RED, TL, TLg, RL, RLg, beginType, endType, typeText, ornament, paperPattern, woodPattern };
})();
