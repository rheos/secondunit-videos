// Break 1, the guitar solo, 124.0-137.5. The one green line the man walked off along comes loose and is
// played by the guitar (js/banknote/solo-data.js: envelope, pitch, onsets from guitar.wav). Every note bends it,
// every attack throws a loop, the big notes bloom into guilloche figures that relax in the gaps. The security
// paper turns to linen, and at the end the line is a thread pulled taut through a hole by a needle, handing
// into the cross-stitch verse (their opening frame: hole at 650,813 px, cells 124 px, thread up-right).
const BR = (() => {
  const S = SOLO, n = S.env.length;
  const at = (arr, t) => { const f = (t - S.t0) * S.rate, i = Math.floor(f); if (i < 0) return arr[0]; if (i >= n - 1) return arr[n - 1]; return lerp(arr[i], arr[i + 1], f - i); };
  // pitch: median over +-0.12 s of voiced frames, octave jumps folded, held through rests, then smoothed
  const raw = S.midi, med = new Float32Array(n); let last = 57;
  for (let i = 0; i < n; i++) {
    const w = []; for (let k = -12; k <= 12; k++) { const v = raw[i + k]; if (v > 30) w.push(v); }
    let v = w.length >= 4 ? w.sort((a, b) => a - b)[w.length >> 1] : last;
    while (v > last + 8) v -= 12; while (v < last - 8) v += 12; med[i] = last = v;
  }
  const sm = new Float32Array(n); let a = med[0]; for (let i = 0; i < n; i++) { a += (med[i] - a) * .18; sm[i] = a; }
  const onsets = S.onsets.filter((o) => o[0] > 126.8 && o[0] < 135.5);
  const pon = []; for (let i = 3; i < n - 3; i++) { const v = S.piano[i]; if (v > .55 && v >= S.piano[i - 1] && v > S.piano[i + 1] && v - Math.min(S.piano[i - 8] ?? 0, S.piano[i - 4]) > .15) { const tk = S.t0 + i / S.rate; if (tk > 123.9 && tk < 126.9 && (!pon.length || tk - pon[pon.length - 1][0] > .14)) pon.push([tk, v]); } }
  const big = onsets.filter((o) => o[1] >= .9);
  return { at, sm, onsets, big, pon };
})();

const BRK = { snap: 126.75, go: 126.9, end: 135.45, xs: 300, H: [650, 812.8], ang: -57 * Math.PI / 180 };
function breakLine0() { const G = oneGeom(), c = camKeys(124, ONE_KEYS(G)); return { cam: c, y0: H / 2 + (G.lineY - c[1]) * c[2] }; }

// the pen: travels right (the camera follows it), height from pitch, a big loop thrown by every attack
function penAt(t, y0) {
  const tt = Math.min(t, BRK.end + .6), u = tt - BRK.go;
  const bx = BRK.xs + 300 * u;
  if (!BRK.by || BRK.byY !== y0) { BRK.byY = y0; BRK.by = []; let b = y0; for (let k = BRK.go; k < BRK.end + 1; k += 1 / 120) { const m = BR.at(BR.sm, k), ty = y0 - 160 - (m - 55) * 38; b += (clamp(ty, y0 - 750, y0 + 300) - b) * (4 / 120); BRK.by.push(b); } }
  const fi = Math.max(0, u * 120), i0 = Math.min(BRK.by.length - 2, Math.floor(fi));
  let by = lerp(BRK.by[i0], BRK.by[i0 + 1], clamp(fi - i0)); by = lerp(y0, by, ss(0, .6, u));
  let ox = 0, oy = 0;
  BR.onsets.forEach(([tk, s], i) => {
    if (tt < tk) return; const tau = tt - tk, r = 50 + 120 * s, w = Math.PI * 2 * (1.1 + .3 * s), dec = Math.exp(-tau / (.55 + .25 * s)), dir = i % 2 ? 1 : -1;
    ox += r * dec * Math.sin(w * tau); oy += dir * r * dec * (1 - Math.cos(w * tau));
  });
  const env = BR.at(SOLO.env, tt);
  oy += env * 12 * Math.sin(tt * Math.PI * 2 * 5.5);
  return [bx + ox, by + oy, env];
}
// camera on the pen: follows with a little lag, pulls wide after the biggest notes to show the figure
const BIGGEST = () => BR.big.filter((o) => o[1] >= 1.5);
function soloCam(t, y0) {
  const T1 = Math.min(t, 135.9); let cx = W / 2, cy = H / 2, z = 1;
  if (T1 > BRK.go) {
    const dt = 1 / 48; let k = BRK.go;
    for (; k <= T1; k += dt) {
      const p = penAt(k, y0); let wide = 0;
      for (const [tk] of BIGGEST()) { const a = k - tk; if (a > 0) wide = Math.max(wide, ss(0, .35, a) * (1 - ss(.9, 1.7, a))); }
      const zt = 1.25 - .68 * wide, look = 70 * (1 - wide);
      cx += (p[0] + look - cx) * Math.min(1, dt * 5.5); cy += (p[1] - cy) * Math.min(1, dt * 5); z += (zt - z) * Math.min(1, dt * 3);
    }
  }
  const b = ss(BRK.go, 127.6, t), e = eio(ramp(t, 135.25, 136.6));
  return { cx: lerp(lerp(W / 2, cx, b), W / 2, e), cy: lerp(lerp(H / 2, cy, b), H / 2, e), z: lerp(lerp(1, z, b), 1, e) };
}

// a big engraved bloom: line figure drawn on in the note's time, a hatched fill engraved with it, then folded away
function bloom(t, i, tk, s, cx, cy, R, D2W, gap) {
  const age = t - tk, dur = clamp(gap, .3, .65), prog = eo(age / dur), fold = ss(.95, 1.65, age), pr = prog * (1 - fold);
  if (pr <= 0) return;
  const kind = i % 3, spin = (i % 2 ? 1 : -1) * age * .35, Rz = R * (1 - .25 * fold);
  // hatched fill (real engraving through the tone pass), revealed as a growing pie behind the drawing pen
  const pie = new Path2D(); pie.moveTo(cx, cy); pie.arc(cx, cy, Rz * 1.05, spin - Math.PI / 2, spin - Math.PI / 2 + Math.PI * 2 * pr); pie.closePath();
  const fill = new Path2D();
  if (kind === 0) { // petals
    const m = 6 + (i % 3) * 2; for (let q = 0; q <= 240; q++) { const a = q / 240 * Math.PI * 2, r = Rz * (.42 + .38 * Math.pow(Math.abs(Math.cos(a * m / 2)), .8)); const x = cx + Math.cos(a + spin) * r, y = cy + Math.sin(a + spin) * r; q ? fill.lineTo(x, y) : fill.moveTo(x, y); } fill.closePath();
    fill.moveTo(cx + Rz * .16, cy); fill.arc(cx, cy, Rz * .16, 0, Math.PI * 2, true);
  } else if (kind === 1) { // ring
    fill.arc(cx, cy, Rz * .8, 0, Math.PI * 2); fill.moveTo(cx + Rz * .5, cy); fill.arc(cx, cy, Rz * .5, 0, Math.PI * 2, true);
  } else { // lens pair
    for (const e of [-1, 1]) { const p = new Path2D(); fill.ellipse(cx + e * Rz * .3, cy, Rz * .55, Rz * .28, e * .6 + spin, 0, Math.PI * 2); }
  }
  const pw = D2W(pie), fw = D2W(fill);
  clipT(pw, () => T(fw, (c) => grey(.5), (i * 37 + spin * 57) % 180, 1));
  over((c) => {
    c.save(); c.setTransform(...K.dcam); c.globalAlpha = 1;
    c.translate(cx, cy); c.rotate(spin);
    if (kind === 0) rosette(c, 0, 0, Rz, { n: 30, k: 9 + (i % 4) * 2, inner: .4, m: 4, prog: pr, lw: 1.5, pts: 700 });
    else if (kind === 1) { c.strokeStyle = inkA(.9); c.lineWidth = 1.5; const M = Math.round(900 * pr); for (let r = 0; r < 3; r++) { c.beginPath(); const RR = Rz * .7, rr = RR * (.26 + .03 * r), d = RR * .7; for (let j = 0; j <= M; j++) { const th = j / 900 * Math.PI * 2 * 7; const x = (RR - rr) * Math.cos(th) + d * Math.cos((RR - rr) / rr * th), y = (RR - rr) * Math.sin(th) - d * Math.sin((RR - rr) / rr * th); j ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } }
    else { c.strokeStyle = inkA(.9); c.lineWidth = 1.5; const A = 3 + (i % 2), B = 2 + (i % 2), M = Math.round(700 * pr); for (let r = 0; r < 14; r++) { c.beginPath(); for (let j = 0; j <= M; j++) { const th = j / 700 * Math.PI * 2; const x = Rz * Math.sin(A * th + r * .11), y = Rz * .85 * Math.sin(B * th + r * .05); j ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } }
    c.restore();
  });
}

function breakShot(t) {
  K.period = 3.6;
  const { cam, y0 } = breakLine0(), vcx = cam[0] + (t - 124) * 6, vcy = cam[1], vs = cam[2];
  const linA = ss(128.6, 135.2, t), INKG = [24, 66, 52], THR = [74, 140, 60];
  // piano opening: unchanged, in screen space on the verse's camera
  if (t < BRK.go + .05) {
    setCam(vcx, vcy, vs);
    screen((c) => {
      const sn = ramp(t, BRK.snap, BRK.go + .05);
      c.strokeStyle = inkA(.9); c.lineCap = 'round'; c.lineWidth = 2.6 * cam[2];
      c.beginPath();
      const xe = lerp(W + 60, BRK.xs, eo(sn));
      for (let x = -80; x <= xe; x += 6) {
        const pe = BR.at(SOLO.piano, t - Math.max(0, x) / 1500), ge = BR.at(SOLO.env, t - Math.max(0, x) / 1500);
        let y = y0 + (pe * 40 + ge * 40) * Math.sin(x / 64 - t * 7) * ss(124, 124.6, t);
        if (sn > 0 && x > BRK.xs) { const q = (x - BRK.xs) / Math.max(1, xe - BRK.xs); y -= sn * 140 * q * q; }
        x > -80 ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.stroke();
      BR.pon.forEach(([tk, v], i) => {
        if (t < tk) return; const age = t - tk, x = 160 + (tk - 124) * 560 + (i % 2) * 40, y = y0 - 30 - age * 60 - (i % 3) * 25;
        c.save(); c.globalAlpha = Math.exp(-age / 1.6) * (1 - sn); c.translate(x, y); c.rotate(age * .8 * (i % 2 ? 1 : -1));
        rosette(c, 0, 0, 30 + 40 * v * (.6 + .4 * Math.exp(-age)), { n: 12, k: 5 + (i % 4), inner: .3, prog: eo(age / .35), lw: 1, pts: 300 }); c.restore();
      });
    });
    return;
  }
  // the solo: drawing space = screen space of the opening; the camera rides the pen
  const sc = soloCam(t, y0);
  setCam(vcx + (sc.cx - W / 2) / vs, vcy + (sc.cy - H / 2) / vs, vs * sc.z);
  K.dcam = [sc.z, 0, 0, sc.z, W / 2 - sc.cx * sc.z, H / 2 - sc.cy * sc.z];
  const D2W = (p) => xf(p, vcx - W / 2 / vs, vcy - H / 2 / vs, 1 / vs);
  // linen comes up through the paper, registered to the cross-stitch opening at the end
  if (linA > 0) under((c) => { c.setTransform(...K.dcam); c.globalAlpha = linA; const k = 124 / 128; c.translate(30, 68.8 - 124); c.scale(k, k); c.fillStyle = c.createPattern(XS.FAB[128], 'repeat'); const ix = (sc.cx - W / 2 / sc.z - 300) / k, iy = (sc.cy - H / 2 / sc.z - 300) / k; c.fillRect(ix - 200, iy - 200, (W / sc.z + 800) / k, (H / sc.z + 800) / k); c.globalAlpha = 1; });
  // trail samples (with time stamps so old marks can clear)
  const pts = [[-80, y0, .15, BRK.go - 2], [BRK.xs, y0, .15, BRK.go - .5]];
  for (let k = BRK.go; k <= Math.min(t, BRK.end + .6); k += 1 / 90) { const p = penAt(k, y0); p.push(k); pts.push(p); }
  const pen = pts[pts.length - 1];
  const [hx, hy] = BRK.H, dx = Math.cos(BRK.ang), dy = Math.sin(BRK.ang);
  const pull = eio(ramp(t, 135.45, 136.95)), slide = eio(ramp(t, 136.85, 137.45)), thick = ss(135.9, 136.9, t);
  const lenA = Math.hypot(hx + 80, hy - y0), lenB = 1300, Ltot = lenA + lenB;
  const F = (u) => { const d = u * Ltot; return d < lenA ? [lerp(-80, hx, d / lenA), lerp(y0, hy, d / lenA)] : [hx + dx * (d - lenA), hy + dy * (d - lenA)]; };
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const tot = cum[cum.length - 1] || 1;
  const P = pts.map((p, i) => { const f = pull > 0 ? F(cum[i] / tot) : p; const age = t - p[3], a = Math.max(1 - ss(2.6, 4.2, age), pull); return [lerp(p[0], f[0], pull), lerp(p[1], f[1], pull), p[2], a]; });
  // blooms on the big notes
  BR.big.forEach(([tk, s], i) => {
    if (t < tk || t > tk + 1.7 || pull >= 1) return;
    const nxt = BR.onsets.find((o) => o[0] > tk + .05), gap = nxt ? nxt[0] - tk : .6;
    const [px, py] = penAt(tk + .05, y0), side = i % 2 ? 1 : -1, R = (190 + 110 * s) * (1 - pull);
    bloom(t, i, tk, s, px + 120 + (i % 2) * R * .5, py + side * (R * .45), R, D2W, gap);
  });
  over((c) => {
    c.save(); c.setTransform(...K.dcam);
    const cut = slide * lenA;
    const vis = []; for (let i = 0; i < P.length; i++) { const d = cum[i] / tot * Ltot; if (pull < 1 || d >= cut) vis.push(P[i]); }
    if (cut > 0 && pull >= 1) vis.unshift([...F(cut / Ltot), 0, 1]);
    const col = [lerp(INKG[0], THR[0], thick), lerp(INKG[1], THR[1], thick), lerp(INKG[2], THR[2], thick)];
    const wTh = 24 * thick;
    c.lineCap = 'round'; c.lineJoin = 'round';
    if (thick > 0) { c.strokeStyle = `rgba(40,30,15,${.18 * thick})`; c.lineWidth = wTh; c.beginPath(); vis.forEach(([x, y], i) => i ? c.lineTo(x + 7, y + 11) : c.moveTo(x + 7, y + 11)); c.stroke(); }
    for (let i = 1; i < vis.length; i++) {
      const a = vis[i][3]; if (a <= .01) continue;
      const w = lerp((4 + 12 * (vis[i][2] || 0)) / Math.max(.7, sc.z) * 1.0, wTh, thick);
      c.strokeStyle = `rgba(${col[0] * .75},${col[1] * .75},${col[2] * .75},${.97 * a})`; c.lineWidth = w + (thick > 0 ? 3 : 0);
      c.beginPath(); c.moveTo(vis[i - 1][0], vis[i - 1][1]); c.lineTo(vis[i][0], vis[i][1]); c.stroke();
    }
    if (thick > 0) {
      c.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${thick})`; c.lineWidth = wTh - 3; c.beginPath(); vis.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
      c.setLineDash([2.5, 9]); c.lineDashOffset = -slide * 300; c.strokeStyle = `rgba(30,70,28,${.7 * thick})`; c.lineWidth = wTh - 6; c.beginPath(); vis.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.setLineDash([]);
      c.strokeStyle = `rgba(200,235,170,${.35 * thick})`; c.lineWidth = 3; c.beginPath(); vis.forEach(([x, y], i) => i ? c.lineTo(x - 5, y - 4) : c.moveTo(x - 5, y - 4)); c.stroke();
    }
    // the playing tip: a burin point that flares on each note
    if (pull < .5 && t < BRK.end + .6) { const env = BR.at(SOLO.env, t); c.fillStyle = inkA(.95); c.beginPath(); c.arc(pen[0], pen[1], 4 + env * 9, 0, Math.PI * 2); c.fill(); }
    c.restore();
  });
  screen((c) => {
    const nd = eio(ramp(t, 136.3, 137.45));
    if (nd > 0) {
      const tipX = 740 + dx * (1 - nd) * 900, tipY = 772 + dy * (1 - nd) * 900;
      c.save(); c.translate(tipX, tipY); c.rotate(BRK.ang);
      c.fillStyle = 'rgba(30,20,10,.22)'; c.beginPath(); c.moveTo(60, 40); c.lineTo(260, 20 + 40); c.lineTo(2000, 26 + 40); c.lineTo(2000, -26 + 40); c.lineTo(260, -20 + 40); c.closePath(); c.fill();
      const g = c.createLinearGradient(0, -26, 0, 26); g.addColorStop(0, '#5e6266'); g.addColorStop(.3, '#f4f6f8'); g.addColorStop(.55, '#a9adb2'); g.addColorStop(1, '#3d4044');
      c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.lineTo(260, -26); c.lineTo(2000, -27); c.lineTo(2000, 27); c.lineTo(260, 26); c.closePath(); c.fill();
      c.restore();
    }
  });
}
