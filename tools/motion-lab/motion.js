// motion.js · shared motion numbers and the audit probe for code-drawn looks. Load it with a plain
// <script src> before the look's own code; everything lives on the global ML.
//
// Numbers, not adjectives: a spring is a damping ratio and a speed in Hz, an ease is a named
// cubic-bezier. Every function here is a pure function of time, so any frame renders on its own.
//
// The probe records what a frame drew (screen-space boxes, text inside its container, events) for
// tools/motion-lab/audit.mjs. Every probe call is a no-op unless an audit is running.
(() => {
  // Cubic-bezier easing, solved for x by Newton steps with a bisection fallback (same curve as CSS).
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (u) => ((ax * u + bx) * u + cx) * u, Y = (u) => ((ay * u + by) * u + cy) * u;
    const dX = (u) => (3 * ax * u + 2 * bx) * u + cx;
    return (x) => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let u = x;
      for (let i = 0; i < 8; i++) { const e = X(u) - x, d = dX(u); if (Math.abs(e) < 1e-6) return Y(u); if (Math.abs(d) < 1e-6) break; u -= e / d; }
      let lo = 0, hi = 1; u = x;
      for (let i = 0; i < 30; i++) { const v = X(u); if (Math.abs(v - x) < 1e-6) break; if (v < x) lo = u; else hi = u; u = (lo + hi) / 2; }
      return Y(u);
    };
  }

  // Enter with ease-out, exit with ease-in (and 40 to 50% shorter), cross the screen with ease-in-out.
  // Linear only for rotation, progress bars and the phase of a loop. Values: easings.net (Sitnik).
  const EASE = {
    outExpo: bezier(0.16, 1, 0.3, 1),       // text and logo reveals
    outQuint: bezier(0.22, 1, 0.36, 1),     // premium entrances
    inOutQuart: bezier(0.76, 0, 0.24, 1),   // moves and camera pushes
    inExpo: bezier(0.7, 0, 0.84, 0),        // fast exits
    outBack: bezier(0.34, 1.56, 0.64, 1),   // a playful pop with overshoot
    inOutSine: bezier(0.37, 0, 0.63, 1),    // ambient drift, the softest camera moves
  };

  // A spring from 0 to 1 as a pure function of time, no simulation.
  // zeta (damping ratio): 1 never bounces, 0.7 to 0.85 premium, 0.4 to 0.6 playful, under 0.3 cartoon.
  // hz: how fast it moves. Position and size may bounce; opacity and colour never should.
  function spring(t, zeta = 0.7, hz = 2) {
    if (t <= 0) return 0;
    const w = 2 * Math.PI * hz;
    if (zeta >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
    const wd = w * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta * w / wd) * Math.sin(wd * t));
  }
  // Translate any library's spring knobs (stiffness k, damping d, mass m) into a damping ratio.
  // Remotion's default (100, 10, 1) is 0.5; react-spring's (170, 26, 1) is 1.0.
  const dampingRatio = (k, d, m = 1) => d / (2 * Math.sqrt(k * m));

  // Loops: drive everything from phase = frame / N with whole cycles, render frames 0 to N-1 only.
  const loopPhase = (t, period) => ((t % period) + period) % period / period;
  // Song frame of time t, and the exact time of the frame before it (24 fps grid unless told otherwise).
  const frameOf = (t, fps = 24) => Math.round(t * fps);
  const prevT = (t, fps = 24) => (Math.round(t * fps) - 1) / fps;

  // Starting numbers (seconds). Feedback 0.1 to 0.2, UI moves 0.2 to 0.5, hero reveals 0.6 to 0.9.
  // Stagger: start the next element when the previous is 30 to 50% done.
  const DUR = { feedback: 0.15, move: 0.4, hero: 0.75, exit: 0.24 };
  const STAGGER = { letter: 1 / 24, word: 0.09, item: 0.06 };
  // On-screen text holds at least 0.3 s per word plus 0.5 s before it moves.
  const readHold = (text) => 0.3 * String(text).trim().split(/\s+/).length + 0.5;

  // ---- probe --------------------------------------------------------------------------------------
  const on = () => typeof window !== 'undefined' && Array.isArray(window.__probeLog);
  const rec = (r) => { if (on()) window.__probeLog.push(r); };
  // Axis-aligned screen box of a local rect drawn through context g's current transform.
  function screenBox(g, x, y, w, h) {
    const m = g.getTransform();
    const pts = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].map(([px, py]) => [m.a * px + m.c * py + m.e, m.b * px + m.d * py + m.f]);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }
  const size = (g) => [g.canvas.width, g.canvas.height];
  const extra = (g, o) => ({
    keep: !!o.keep, margin: o.margin ?? null,
    container: o.inScreen ? [o.inScreen[0], o.inScreen[1], o.inScreen[0] + o.inScreen[2], o.inScreen[1] + o.inScreen[3]] : o.in ? screenBox(g, ...o.in) : null,
  });

  const probe = {
    get on() { return on(); },
    // Options for box and text:
    //   keep: true       it must stay inside the frame's safe area
    //   in: [x, y, w, h]  the container it must fit inside, in the same local coordinates
    //   inScreen: [...]  the container in canvas pixels instead (when the container was drawn
    //                    under a different transform)
    //   margin: px       the margin inside the container, in canvas pixels (default: the audit's --margin)
    box(g, name, x, y, w, h, o = {}) {
      if (on()) rec({ kind: 'box', name, box: screenBox(g, x, y, w, h), frame: size(g), ...extra(g, o) });
    },
    // Text drawn with g's current font, alignment and baseline at (x, y). The sixth argument is either
    // the container as [x, y, w, h] in local coordinates or the options. Call it next to the fillText.
    text(g, name, str, x, y, container, o = {}) {
      if (!on()) return;
      if (container && !Array.isArray(container)) { o = container; container = null; } // text(g, name, str, x, y, { keep })
      const m = g.measureText(str);
      const box = screenBox(g, x - m.actualBoundingBoxLeft, y - m.actualBoundingBoxAscent,
        m.actualBoundingBoxLeft + m.actualBoundingBoxRight, m.actualBoundingBoxAscent + m.actualBoundingBoxDescent);
      rec({ kind: 'text', name, str, box, frame: size(g), ...extra(g, container ? { ...o, in: container } : o) });
    },
    // Something that happens on this frame (a landing, a cut, a label lighting). Call it on the frame only.
    event(name) { rec({ kind: 'event', name }); },
    // Fire an event from the geometry, not from the time the code meant: pass the condition now and one
    // frame earlier, e.g. edge('land', y(t) >= floor - 0.5, y(ML.prevT(t)) >= floor - 0.5).
    // Use prevT, not t - 1/fps (that lands a hair before a whole frame and fires twice), and give
    // contact half a pixel of slack.
    edge(name, now, before) { if (now && !before) rec({ kind: 'event', name }); },
    // Any number worth checking (a scale, an opacity, a beat offset).
    value(name, v) { rec({ kind: 'value', name, v }); },
  };

  window.ML = { bezier, EASE, spring, dampingRatio, loopPhase, frameOf, prevT, DUR, STAGGER, readHold, probe, screenBox };
})();
