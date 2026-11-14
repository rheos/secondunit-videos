// Blueprint kit: shared helpers for the technical-plate explainers.
// Lifted from novadiem-cold-read's window.CR and made theme-driven. Load after GSAP, before any plate.
// Cues are written in SCORE seconds and snapped to the score's beat grid.
window.BP = (() => {
  const NS = "http://www.w3.org/2000/svg";
  let BEATS = [];

  // grid({ beats }) uses a measured grid (beats.json); grid({ bpm, offset, length }) builds a placeholder.
  function grid({ beats, bpm = 96, offset = 0, length = 120 } = {}) {
    if (beats && beats.length) {
      BEATS = beats.slice();
    } else {
      const step = 60 / bpm;
      BEATS = [];
      for (let t = offset; t <= length; t += step) BEATS.push(Number(t.toFixed(3)));
    }
    return BEATS;
  }

  const snap = (a) => (BEATS.length ? BEATS.reduce((b, x) => (Math.abs(x - a) < Math.abs(b - a) ? x : b)) : a);

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function text(str, attrs, parent) {
    const n = el("text", attrs, parent);
    n.textContent = str;
    return n;
  }
  function prime(node) {
    const len = node.getTotalLength() * 1.02;
    node.style.strokeDasharray = `${len}`;
    node.style.strokeDashoffset = `${len}`;
    return node;
  }
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  // Sound cues. Every helper below reports the event it animates, in score seconds, so a sound script can
  // voice the animation itself (tools/blueprint-kit/cues.mjs -> cues.json -> sfx.py). Cues are only data:
  // nothing here plays a sound, and a film that never collects them is unchanged.
  const CUES = [];
  const cue = (k, t, extra) => CUES.push(Object.assign({ k, t: +t.toFixed(4) }, extra || {}));
  const SVGNS = "http://www.w3.org/2000/svg";
  const isSvg = (n) => n.namespaceURI === SVGNS;

  // split an element's text into one child per character (HTML spans or SVG tspans), once.
  // HTML keeps each word in a nowrap inline-block so wrapping and flex layout still work.
  function splitChars(node) {
    if (node.__chars) return node.__chars;
    const str = node.textContent;
    node.textContent = "";
    const chars = [];
    if (isSvg(node)) {
      for (const c of str) {
        const t = document.createElementNS(SVGNS, "tspan");
        t.textContent = c;
        node.appendChild(t);
        chars.push(t);
      }
    } else {
      str.split(/( )/).forEach((w) => {
        if (w === "") return;
        if (w === " ") {
          const sp = document.createElement("span");
          sp.textContent = " ";
          sp.style.whiteSpace = "pre";
          node.appendChild(sp);
          chars.push(sp);
          return;
        }
        const word = document.createElement("span");
        word.style.display = "inline-block";
        word.style.whiteSpace = "nowrap";
        for (const c of w) {
          const s = document.createElement("span");
          s.textContent = c;
          s.style.display = "inline-block";
          word.appendChild(s);
          chars.push(s);
        }
        node.appendChild(word);
      });
    }
    node.__chars = chars;
    return chars;
  }
  const sizeOf = (node) => parseFloat(getComputedStyle(node).fontSize) || 20;

  // kit(tl, slotStart, plate): cue helpers bound to one plate's timeline. `plate` names it in the cue data.
  function kit(tl, slotStart, plate) {
    const T = (a) => snap(a) - slotStart; // score time -> plate time, on the beat
    const R = (a) => a - slotStart; // score time -> plate time, unsnapped
    const at$ = (t) => slotStart + t; // plate time -> score time, for cues
    const sfx = (k, at, extra) => cue(k, at$(at), Object.assign({ p: plate }, extra || {}));
    const draw = (node, at, dur = 0.7, ease = "power2.out", sound = true) => {
      if (sound && dur >= 0.25) sfx("pen", at, { d: dur });
      return tl.to(prime(node), { strokeDashoffset: 0, duration: dur, ease }, at);
    };
    // planned (dashed) lines can't use the dash-offset draw, so they wipe in along x instead
    const sweep = (node, at, dur = 0.7) => {
      if (dur >= 0.25) sfx("pen", at, { d: dur });
      return tl.fromTo(node, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: dur, ease: "none" }, at);
    };
    const fade = (node, at, dur = 0.4, to) => {
      const target = to !== undefined ? to : Number(node.getAttribute("opacity") || 1) || 1;
      return tl.fromTo(node, { opacity: 0 }, { opacity: target, duration: dur, ease: "power1.out" }, at);
    };
    const reveal = (node, at, dur = 0.7) =>
      tl.fromTo(node, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: dur, ease: "power2.out" }, at);
    const out = (node, at, dur = 0.45) => {
      sfx("out", at);
      return tl.to(node, { opacity: 0, duration: dur, ease: "power1.in" }, at);
    };
    const travel = (node, path, at, dur, ease = "power1.inOut") => {
      const len = path.getTotalLength();
      const p = { t: 0 };
      return tl.fromTo(
        p,
        { t: 0 },
        {
          t: 1,
          duration: dur,
          ease,
          onUpdate: () => {
            const pt = path.getPointAtLength(p.t * len);
            node.setAttribute("transform", `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)})`);
          },
        },
        at
      );
    };

    // typed(node, at, {cps, cursor}): a typewriter caption. Characters appear one by one (display, so the
    // cursor sits right after the last one typed); the cursor blinks while typing and for 0.6 s after.
    // Returns the plate time the last character lands.
    const typed = (node, at, o = {}) => {
      const cps = o.cps || 30;
      const chars = splitChars(node);
      const svg = isSvg(node);
      const shown = svg ? "inline" : "inline-block";
      const size = sizeOf(node);
      chars.forEach((c, i) => {
        const keep = c.style.display || shown;
        c.style.display = "none";
        tl.fromTo(c, { display: "none" }, { display: c.textContent === " " ? "inline" : keep, duration: 0.001, immediateRender: false }, at + i / cps);
        if (c.textContent.trim()) sfx("type", at + i / cps, { size });
      });
      const end = at + (chars.length - 1) / cps;
      if (o.cursor !== false) {
        const cur = svg ? document.createElementNS(SVGNS, "tspan") : document.createElement("span");
        cur.textContent = "_";
        if (!svg) cur.style.display = "inline-block";
        cur.style.opacity = "0";
        node.appendChild(cur);
        const stop = end + 0.6;
        for (let t = at, k = 0; t < stop; t += 0.1, k++) {
          tl.fromTo(cur, { opacity: k % 2 ? 1 : 0 }, { opacity: k % 2 ? 0 : 1, duration: 0.001, immediateRender: false }, t);
        }
        tl.fromTo(cur, { opacity: 1 }, { opacity: 0, duration: 0.001, immediateRender: false }, stop);
      }
      return end;
    };

    // slam(node, at, {stagger}): set type. Each letter drops into place from above, slightly large and
    // turned, and settles; one cue per letter. Returns the plate time the last letter lands.
    const slam = (node, at, o = {}) => {
      const stagger = o.stagger || 0.04;
      const chars = splitChars(node).filter((c) => c.textContent.trim());
      const size = sizeOf(node);
      const rise = o.rise || Math.round(size * 0.55);
      chars.forEach((c, i) => {
        const t = at + i * stagger;
        const rot = ((i * 37) % 11) - 5;
        tl.fromTo(c, { opacity: 0, y: -rise, scale: 1.3, rotation: rot }, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 0.24, ease: "back.out(1.7)" }, t);
        sfx("slam", t + 0.2, { size });
      });
      return at + (chars.length - 1) * stagger + 0.24;
    };

    // drop(node, at, {stagger}): the letters fall away in reading order (the exit that answers slam/typed).
    const drop = (node, at, o = {}) => {
      const stagger = o.stagger || 0.018;
      const chars = splitChars(node).filter((c) => c.textContent.trim());
      const size = sizeOf(node);
      chars.forEach((c, i) => {
        const rot = ((i * 53) % 25) - 12;
        tl.fromTo(c, { y: 0, opacity: 1, rotation: 0 }, { y: size * 1.2, opacity: 0, rotation: rot, duration: 0.38, ease: "power2.in", immediateRender: false }, at + i * stagger);
      });
      sfx("drop", at, { n: chars.length, d: chars.length * stagger });
      return at + chars.length * stagger + 0.38;
    };

    // stamp(node, at, {origin}): a rubber stamp or a filed card landing: big and faint to full size with a
    // small overshoot. origin is an SVG point "x y" (svgOrigin) or a CSS transform origin for HTML.
    const stamp = (node, at, o = {}) => {
      const from = { opacity: 0, scale: o.from || 1.45 };
      const to = { opacity: o.to || 1, scale: 1, duration: o.dur || 0.26, ease: "back.out(2)" };
      if (o.origin) {
        if (isSvg(node)) {
          from.svgOrigin = to.svgOrigin = o.origin;
        } else {
          from.transformOrigin = to.transformOrigin = o.origin;
        }
      }
      sfx(o.sound || "stamp", at + (o.dur || 0.26) * 0.6);
      return tl.fromTo(node, from, to, at);
    };

    // move(node, at, dur, from, to, {ease, sound}): any explicit fromTo move (x, y, scale, rotation,
    // opacity), with an optional cue ("slide", "whoosh", "card", "drawer").
    const move = (node, at, dur, from, to, o = {}) => {
      if (o.sound) sfx(o.sound, at, { d: dur });
      return tl.fromTo(node, from, Object.assign({}, to, { duration: dur, ease: o.ease || "power2.inOut" }), at);
    };

    // camera(layer, at, dur, from, to): a push-in or travel of a whole plate layer (HTML), with a soft whoosh.
    const camera = (layer, at, dur, from, to, o = {}) => {
      if (o.sound !== false) sfx("whoosh", at, { d: dur });
      return tl.fromTo(layer, Object.assign({ transformOrigin: o.origin || "960px 540px" }, from), Object.assign({ transformOrigin: o.origin || "960px 540px", duration: dur, ease: o.ease || "power2.inOut" }, to), at);
    };

    // pulse(node, at, n, gap, amount): n beat-locked swells (scale up and back), for a heart or a lamp.
    const pulse = (node, at, n, gap, amount = 0.08, o = {}) => {
      for (let i = 0; i < n; i++) {
        const t = at + i * gap;
        const org = o.origin ? (isSvg(node) ? { svgOrigin: o.origin } : { transformOrigin: o.origin }) : {};
        tl.fromTo(node, Object.assign({ scale: 1 }, org), Object.assign({ scale: 1 + amount, duration: gap * 0.25, ease: "power2.out", immediateRender: false }, org), t);
        tl.fromTo(node, Object.assign({ scale: 1 + amount }, org), Object.assign({ scale: 1, duration: gap * 0.6, ease: "power2.inOut", immediateRender: false }, org), t + gap * 0.25);
        if (o.sound) sfx(o.sound, t);
      }
    };

    return { T, R, draw, sweep, fade, reveal, out, travel, typed, slam, drop, stamp, move, camera, pulse, sfx, $: (id) => document.getElementById(id) };
  }

  // furniture(K, tl, opts): grain, grid, plate border, registration marks, the bottom progress bar
  // and the sheet counter, all drawn into the furniture plate's existing <svg id="fu-ground"> and <svg id="fu-frame">.
  //   opts.stations: [{ label, at }]  the tick moves to each station at its score time
  //   opts.sheets:   [at, at, ...]    plate start times; the counter reads NN / total
  //   opts.drawAt:   when the plate is ruled (default 0.1)
  function furniture(K, tl, opts = {}) {
    const { stations = [], sheets = [], drawAt = 0.1 } = opts;
    const ground = K.$("fu-ground");
    const frame = K.$("fu-frame");

    const rgb = (css("--grain-rgb") || "0.36 0.29 0.18").split(/\s+/).join(" ");
    const [r, g, b] = rgb.split(" ");
    const alpha = css("--grain-alpha") || "0.55";
    const defs = el("defs", {}, ground);
    const fine = el("filter", { id: "fu-grain-fine", x: 0, y: 0, width: "100%", height: "100%" }, defs);
    el("feTurbulence", { type: "fractalNoise", baseFrequency: 0.9, numOctaves: 2, seed: 7, stitchTiles: "stitch" }, fine);
    el("feColorMatrix", { type: "matrix", values: `0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  ${alpha} 0 0 0 -0.18` }, fine);
    const mottle = el("filter", { id: "fu-grain-mottle", x: 0, y: 0, width: "100%", height: "100%" }, defs);
    el("feTurbulence", { type: "fractalNoise", baseFrequency: 0.0035, numOctaves: 3, seed: 11 }, mottle);
    el("feColorMatrix", { type: "matrix", values: `0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  ${(alpha * 0.47).toFixed(3)} 0 0 0 -0.09` }, mottle);
    const pat = el("pattern", { id: "fu-grid", width: 60, height: 60, patternUnits: "userSpaceOnUse", x: 48, y: 48 }, defs);
    el("path", { d: "M60 0H0V60", fill: "none", class: "grid-line" }, pat);
    el("rect", { width: 1920, height: 1080, filter: "url(#fu-grain-mottle)" }, ground);
    el("rect", { width: 1920, height: 1080, filter: "url(#fu-grain-fine)" }, ground);
    const gridRect = el("rect", { x: 48, y: 48, width: 1824, height: 984, fill: "url(#fu-grid)" }, ground);

    const border = el("rect", { class: "ln thin line", x: 48, y: 48, width: 1824, height: 984 }, frame);
    const marks = [];
    [
      [48, 48],
      [1872, 48],
      [48, 1032],
      [1872, 1032],
    ].forEach(([x, y]) => {
      marks.push(el("circle", { class: "ln thin line", cx: x, cy: y, r: 10 }, frame));
      marks.push(el("path", { class: "ln thin line", d: `M${x - 18} ${y}H${x + 18}M${x} ${y - 18}V${y + 18}` }, frame));
    });

    tl.fromTo(gridRect, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power1.out" }, drawAt);
    K.draw(border, drawAt + 0.1, 1.4, "none");
    marks.forEach((m, i) => K.draw(m, drawAt + 0.9 + (i >> 1) * 0.12, 0.4));

    if (stations.length) {
      const X0 = 260,
        X1 = sheets.length ? 1520 : 1660; // leave room for the sheet counter
      const SX = (i) => (stations.length === 1 ? X0 : X0 + (i * (X1 - X0)) / (stations.length - 1));
      const base = el("path", { class: "ln thin ink", d: `M${X0} 985H${X1}`, opacity: 0.4 }, frame);
      const prog = el("path", { class: "ln line", d: `M${X0} 985H${X1}` }, frame);
      const tick = el("path", { d: "M-9 -14H9L0 0Z", class: "fill-line" }, frame);
      const ticks = [],
        labels = [];
      stations.forEach((s, i) => {
        ticks.push(el("path", { class: "ln thin ink", d: `M${SX(i)} 979V991` }, frame));
        labels.push(text(s.label, { class: "mono small", x: SX(i), y: 1014, "text-anchor": "middle" }, frame));
      });
      K.draw(base, drawAt + 0.8, 1.0, "none");
      ticks.forEach((t, i) => K.draw(t, drawAt + 1.2 + i * 0.12, 0.2));
      labels.forEach((t, i) => K.fade(t, drawAt + 1.3 + i * 0.12, 0.35));

      const len = prog.getTotalLength();
      prog.style.strokeDasharray = `${len}`;
      tl.set(prog, { strokeDashoffset: len }, 0);
      tl.set(tick, { x: SX(0), y: 971, opacity: 0 }, 0);
      stations.forEach((s, i) => {
        if (i === 0) {
          tl.to(tick, { opacity: 1, duration: 0.3 }, K.T(s.at));
          return;
        }
        const frac = i / (stations.length - 1);
        tl.to(prog, { strokeDashoffset: len * (1 - frac), duration: 0.6, ease: "power2.inOut" }, K.T(s.at));
        tl.to(tick, { x: SX(i), duration: 0.6, ease: "power2.inOut" }, K.T(s.at));
      });
    }

    if (sheets.length) {
      // sheet counter, bottom right: one text node per sheet, swapped with set() so it stays seek-safe
      const box = el("g", {}, frame);
      const frameRect = el("rect", { class: "ln thin line", x: 1610, y: 958, width: 230, height: 50 }, box);
      el("path", { class: "ln thin line", d: "M1690 958V1008", opacity: 0.6 }, box);
      const cap = text("SHEET", { class: "mono small", x: 1650, y: 990, "text-anchor": "middle" }, box);
      K.draw(frameRect, drawAt + 1.4, 0.6);
      K.fade(cap, drawAt + 1.6, 0.35);
      const pad = (n) => String(n).padStart(2, "0");
      const nums = sheets.map((at, i) => {
        const n = text(`${pad(i + 1)} / ${pad(sheets.length)}`, { class: "mono", x: 1765, y: 991, "text-anchor": "middle", opacity: 0 }, box);
        return n;
      });
      nums.forEach((n, i) => {
        const on = i === 0 ? drawAt + 1.7 : K.T(sheets[i]);
        tl.set(n, { opacity: 1 }, on);
        if (i + 1 < nums.length) tl.set(n, { opacity: 0 }, K.T(sheets[i + 1]));
      });
    }
  }

  return { grid, get BEATS() { return BEATS; }, get CUES() { return CUES.slice().sort((a, b) => a.t - b.t); }, snap, el, text, prime, css, kit, furniture, splitChars };
})();
