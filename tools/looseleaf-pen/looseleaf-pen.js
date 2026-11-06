(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/rng.ts
  var AVALANCHE = 2654435769;
  function avalanche(h) {
    h ^= h >>> 16;
    h = Math.imul(h, 2246822507);
    h ^= h >>> 13;
    h = Math.imul(h, 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  }
  function hashSeed(s) {
    if (typeof s === "number") return (Number.isFinite(s) ? avalanche(s >>> 0) : 0) || AVALANCHE;
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return avalanche(h) || AVALANCHE;
  }
  function derive(base, name) {
    let h = (2166136261 ^ base) >>> 0;
    h = Math.imul(h, 16777619);
    for (let i = 0; i < name.length; i++) {
      h ^= name.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return avalanche(h) || AVALANCHE;
  }
  function build(base) {
    let s = base;
    let spare = null;
    const next = () => {
      s = s + 1831565813 >>> 0;
      let t = s;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
    const rng = next;
    rng.seed = base;
    rng.range = (a, b) => a + (b - a) * next();
    rng.int = (a, b) => a + Math.floor(next() * (b - a + 1));
    rng.chance = (p) => next() < p;
    rng.sign = () => next() < 0.5 ? -1 : 1;
    rng.pick = (arr) => arr[Math.floor(next() * arr.length)];
    rng.gauss = (mean = 0, sd = 1) => {
      if (spare !== null) {
        const v = spare;
        spare = null;
        return mean + sd * v;
      }
      let u = 0;
      while (u === 0) u = next();
      const r = Math.sqrt(-2 * Math.log(u));
      const a = 2 * Math.PI * next();
      spare = r * Math.sin(a);
      return mean + sd * r * Math.cos(a);
    };
    rng.fork = (name) => build(derive(base, String(name)));
    return rng;
  }
  function makeRng(seed) {
    return build(hashSeed(seed));
  }
  var clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  var smooth = (t) => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);

  // src/noise.ts
  function noise1(rng, length, wavelength) {
    const n = Math.max(6, Math.ceil(length / wavelength) + 6);
    const k = new Float64Array(n);
    for (let i = 0; i < n; i++) k[i] = rng() * 2 - 1;
    const off = rng() * wavelength;
    const maxI = n - 3;
    return (s) => {
      const u = (s + off) / wavelength;
      const fl = Math.floor(u);
      const i = Math.max(1, Math.min(maxI, fl + 1));
      const t = fl + 1 > maxI ? 1 : u - fl;
      const p0 = k[i - 1], p1 = k[i], p2 = k[i + 1], p3 = k[i + 2];
      return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
    };
  }

  // src/paint.ts
  var PAINT_KEYS = [
    "ink",
    "ink-soft",
    "ink-you",
    "pencil",
    "pencil-mark",
    "red",
    "green",
    "marker",
    "hi",
    "focus",
    "paper",
    "paper-shade",
    "slip",
    "card",
    "graph",
    "kraft",
    "check",
    "photo",
    "desk",
    "desk-deep",
    "rule-blue",
    "rule-red",
    "pad",
    "pad-rule",
    "check-rule",
    "ink-muted",
    "pencil-text",
    "orange-text",
    "hi-deep",
    "tape",
    "tape-edge",
    "tomato",
    "tangerine",
    "lemon",
    "grass",
    "teal",
    "sky",
    "grape",
    "bubblegum",
    "sticky-yellow",
    "sticky-green",
    "sticky-orange",
    "sticky-pink",
    "sticky-blue",
    "current"
  ];
  var KNOWN = new Set(PAINT_KEYS);
  function fmtUnits(k, q) {
    if (k === 0) return "0";
    const neg = k < 0;
    const a = neg ? -k : k;
    const whole = Math.floor(a / q);
    const frac = a - whole * q;
    let s = whole === 0 ? "" : String(whole);
    if (frac !== 0) {
      const digits = q === 10 ? 1 : 2;
      const f = String(frac * (10 ** digits / q)).padStart(digits, "0").replace(/0+$/, "");
      s += "." + f;
    }
    return neg ? "-" + s : s;
  }

  // src/geom.ts
  var TAU = Math.PI * 2;
  var TIERS = {
    hi: { q: 20, tol: 0.085, stepK: 1 },
    lo: { q: 10, tol: 0.16, stepK: 1.5 }
  };
  var mixPt = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  function densify(pts, step = 1.5) {
    const out = [[pts[0][0], pts[0][1]]];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const c = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
      for (let k = 1; k <= c; k++) out.push(mixPt(a, b, k / c));
    }
    return out;
  }
  function spline(pts, step = 1.5) {
    if (pts.length < 3) return densify(pts, step);
    const out = [];
    const first = pts[0], second = pts[1], last = pts[pts.length - 1], prev = pts[pts.length - 2];
    const P = [[first[0] - (second[0] - first[0]), first[1] - (second[1] - first[1])], ...pts, [last[0] + (last[0] - prev[0]), last[1] + (last[1] - prev[1])]];
    for (let i = 1; i < P.length - 2; i++) {
      const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
      const d01 = Math.max(1e-3, Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) ** 0.5);
      const d12 = Math.max(1e-3, Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) ** 0.5);
      const d23 = Math.max(1e-3, Math.hypot(p3[0] - p2[0], p3[1] - p2[1]) ** 0.5);
      const cnt = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
      const t1 = d01, t2 = d01 + d12, t3 = d01 + d12 + d23;
      for (let k = 0; k < cnt; k++) {
        const u = t1 + (t2 - t1) * (k / cnt);
        const A1 = mixPt(p0, p1, u / t1);
        const A2 = mixPt(p1, p2, (u - t1) / (t2 - t1));
        const A3 = mixPt(p2, p3, (u - t2) / (t3 - t2));
        const B1 = mixPt(A1, A2, u / t2);
        const B2 = mixPt(A2, A3, (u - t1) / (t3 - t1));
        out.push(mixPt(B1, B2, (u - t1) / (t2 - t1)));
      }
    }
    out.push([last[0], last[1]]);
    return out;
  }
  function fillet(pts, r) {
    if (pts.length < 3 || r <= 0) return pts;
    const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const a = pts[i - 1], b = pts[i], c = pts[i + 1];
      const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const l2 = Math.hypot(c[0] - b[0], c[1] - b[1]) || 1;
      const rr = Math.min(r, l1 * 0.45, l2 * 0.45);
      const p1 = [b[0] + (a[0] - b[0]) / l1 * rr, b[1] + (a[1] - b[1]) / l1 * rr];
      const p2 = [b[0] + (c[0] - b[0]) / l2 * rr, b[1] + (c[1] - b[1]) / l2 * rr];
      for (let k = 0; k <= 5; k++) {
        const t = k / 5, u = 1 - t;
        out.push([u * u * p1[0] + 2 * u * t * b[0] + t * t * p2[0], u * u * p1[1] + 2 * u * t * b[1] + t * t * p2[1]]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  function resample(P, step) {
    const cum = [0];
    for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const L = cum[cum.length - 1];
    const cnt = Math.max(2, Math.round(L / step) + 1);
    const X = new Float64Array(cnt), Y = new Float64Array(cnt), S = new Float64Array(cnt);
    let j = 0;
    for (let i = 0; i < cnt; i++) {
      const s = L * i / (cnt - 1);
      while (j < P.length - 2 && cum[j + 1] < s) j++;
      const seglen = cum[j + 1] - cum[j] || 1;
      const t = clamp((s - cum[j]) / seglen, 0, 1);
      const a = P[j], b = P[Math.min(j + 1, P.length - 1)];
      X[i] = a[0] + (b[0] - a[0]) * t;
      Y[i] = a[1] + (b[1] - a[1]) * t;
      S[i] = s;
    }
    return { X, Y, S, L };
  }
  function simplifyClosed(pts, tol) {
    const m = pts.length;
    if (m < 12 || tol <= 0) return pts;
    let far = 0, fd = -1;
    for (let i = 1; i < m; i++) {
      const d = (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2;
      if (d > fd) {
        fd = d;
        far = i;
      }
    }
    const keep = new Uint8Array(m);
    keep[0] = keep[far] = 1;
    const rec = (a, b) => {
      const len = (b - a + m) % m;
      if (len < 2) return;
      const ax = pts[a][0], ay = pts[a][1], bx = pts[b][0], by = pts[b][1];
      const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1e-9;
      let md = -1, mi = -1;
      for (let k = 1; k < len; k++) {
        const i = (a + k) % m;
        const t = Math.max(0, Math.min(1, ((pts[i][0] - ax) * dx + (pts[i][1] - ay) * dy) / l2));
        const d = Math.hypot(pts[i][0] - (ax + t * dx), pts[i][1] - (ay + t * dy));
        if (d > md) {
          md = d;
          mi = i;
        }
      }
      if (md > tol) {
        keep[mi] = 1;
        rec(a, mi);
        rec(mi, b);
      }
    };
    rec(0, far);
    rec(far, 0);
    const out = [];
    for (let i = 0; i < m; i++) if (keep[i]) out.push(pts[i]);
    return out;
  }
  var PathWriter = class {
    constructor(q) {
      __publicField(this, "d", "");
      __publicField(this, "cmd", "");
      __publicField(this, "px", 0);
      __publicField(this, "py", 0);
      __publicField(this, "sx", 0);
      __publicField(this, "sy", 0);
      __publicField(this, "lastNum", "");
      __publicField(this, "q");
      this.q = q;
    }
    u(v) {
      return Number.isFinite(v) ? Math.round(v * this.q) : 0;
    }
    num(k) {
      const s = fmtUnits(k, this.q);
      if (this.lastNum) {
        const c = s.charCodeAt(0);
        if (!(c === 45 || c === 46 && this.lastNum.includes("."))) this.d += " ";
      }
      this.d += s;
      this.lastNum = s;
    }
    letter(c) {
      if (this.cmd !== c) {
        this.d += c;
        this.cmd = c;
        this.lastNum = "";
      }
    }
    M(x, y) {
      const X = this.u(x), Y = this.u(y);
      this.d += "M";
      this.cmd = "M";
      this.lastNum = "";
      this.num(X);
      this.num(Y);
      this.px = this.sx = X;
      this.py = this.sy = Y;
      return this;
    }
    L(x, y) {
      const X = this.u(x), Y = this.u(y);
      this.letter("l");
      this.num(X - this.px);
      this.num(Y - this.py);
      this.px = X;
      this.py = Y;
      return this;
    }
    Q(cx, cy, x, y) {
      const CX = this.u(cx), CY = this.u(cy), X = this.u(x), Y = this.u(y);
      this.letter("q");
      this.num(CX - this.px);
      this.num(CY - this.py);
      this.num(X - this.px);
      this.num(Y - this.py);
      this.px = X;
      this.py = Y;
      return this;
    }
    Z() {
      this.d += "z";
      this.cmd = "z";
      this.lastNum = "";
      this.px = this.sx;
      this.py = this.sy;
      return this;
    }
  };
  function smoothClosed(pts, cfg) {
    const p = simplifyClosed(pts, cfg.tol);
    const m = p.length;
    if (m < 3) return "";
    const w = new PathWriter(cfg.q);
    w.M((p[m - 1][0] + p[0][0]) / 2, (p[m - 1][1] + p[0][1]) / 2);
    for (let i = 0; i < m; i++) {
      const a = p[i], b = p[(i + 1) % m];
      w.Q(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    }
    return w.Z().d;
  }

  // src/pens.ts
  var BASE = {
    kind: "felt",
    color: "ink",
    grain: "felt",
    cls: "std",
    W: 1.7,
    alpha: 0.92,
    wob: { amp: 0.8, wl: 80, tr: 0.16 },
    step: 1.8,
    halo: 0,
    bleed: 1,
    core: 0.3,
    pool: 1,
    feather: 0,
    skip: 0,
    swell: 0.4,
    dir: 0,
    dryAmt: 0,
    dryWl: 7,
    gaps: 0,
    dens: 0.5,
    taper: 1,
    smear: 0,
    waxy: false,
    nib: 0,
    edge: 0.2,
    wet: 0.2,
    cutK: 0.22
  };
  var felt = (color, o = {}) => ({
    ...BASE,
    kind: "felt",
    grain: "felt",
    color,
    halo: 0.14,
    bleed: 1.05,
    core: 0.36,
    pool: 1,
    feather: 0.5,
    skip: 0.3,
    swell: 0.4,
    dir: 0.06,
    dens: 0.5,
    ...o
  });
  var pencil = (color, o = {}) => ({
    ...BASE,
    kind: "pencil",
    grain: o.waxy ? "waxy" : "graphite",
    color,
    W: 1.5,
    alpha: 0.95,
    wob: { amp: 0.6, wl: 110, tr: 0.12 },
    step: 1.3,
    smear: 0.22,
    dens: 0.5,
    ...o
  });
  var marker = (color, o = {}) => ({
    ...BASE,
    kind: "marker",
    grain: "marker",
    color,
    W: 9,
    alpha: 0.62,
    nib: -0.75,
    edge: 0.3,
    wet: 0.22,
    bleed: 1,
    wob: { amp: 0.9, wl: 90, tr: 0.1 },
    step: 2.2,
    cutK: 0.22,
    ...o
  });
  var FELTS = {
    ink: felt("ink"),
    blue: felt("ink-you", { W: 1.85, alpha: 0.9, wob: { amp: 0.9, wl: 70, tr: 0.18 }, halo: 0.16, bleed: 1.2, core: 0.32, pool: 1.1, feather: 0.6, skip: 0.25 }),
    redfelt: felt("red", { W: 1.75, alpha: 0.9, halo: 0.14, bleed: 1, core: 0.32 }),
    greenfelt: felt("green", { W: 1.75, alpha: 0.9, halo: 0.14, bleed: 1, core: 0.32 }),
    focus: felt("focus", { W: 2.2, alpha: 0.95, wob: { amp: 0.9, wl: 70, tr: 0.16 }, halo: 0.16, bleed: 1.2, core: 0.3, skip: 0.15 })
  };
  var PENCILS = {
    pencil: pencil("pencil"),
    red: pencil("red", { alpha: 0.9, smear: 0.26, waxy: true }),
    green: pencil("green", { alpha: 0.9, smear: 0.26, waxy: true }),
    orange: pencil("tangerine", { alpha: 0.9, smear: 0.28, waxy: true }),
    bluepencil: pencil("ink-you", { W: 1.4, alpha: 0.88, smear: 0.26, waxy: true })
  };
  function withClass(p, cls) {
    if (p.kind === "felt") {
      return cls === "fine" ? { ...p, cls, W: p.W * 0.68, alpha: Math.min(0.96, p.alpha + 0.02), wob: { amp: p.wob.amp * 0.7, wl: p.wob.wl * 1.2, tr: p.wob.tr * 0.6 }, step: 1.6, halo: p.halo * 0.55, bleed: p.bleed * 0.6, core: p.core * 0.8, pool: p.pool * 0.7, feather: p.feather * 0.4, skip: p.skip * 0.4, swell: 0.18, dir: 0, dens: 0.3 } : { ...p, cls, W: p.W * 2, alpha: p.alpha - 0.02, wob: { amp: p.wob.amp * 1.1, wl: p.wob.wl * 1.1, tr: p.wob.tr * 0.75 }, step: 2.2, halo: p.halo * 0.85, bleed: p.bleed * 1.2, core: p.core * 1.1, pool: p.pool * 1.15, feather: p.feather * 1.1, skip: 0.15, swell: 0.8, dir: 0.38, dryAmt: 0.55, dryWl: 7, gaps: 0.5, dens: 0.8, taper: 1.6 };
    }
    return cls === "fine" ? { ...p, cls, W: p.W * 0.68, alpha: p.alpha * 0.92, smear: p.smear * 0.8, wob: { ...p.wob, amp: p.wob.amp * 0.8 }, step: 1.1 } : { ...p, cls, W: p.W * 1.9, alpha: p.alpha * 0.88, smear: p.smear * 1.4, dir: 0.14, dryAmt: 0.25, step: 1.6 };
  }
  var ACCENTS = ["tomato", "tangerine", "lemon", "grass", "teal", "sky", "grape", "bubblegum"];
  function build2() {
    const out = {};
    const base = { ...FELTS, ...PENCILS };
    for (const k of Object.keys(base)) {
      out[k] = base[k];
      out[`${k}.fine`] = withClass(base[k], "fine");
      out[`${k}.brush`] = withClass(base[k], "brush");
    }
    out.terracotta = marker("marker");
    out.hi = marker("hi", { kind: "hl", W: 14, alpha: 0.52, nib: 1.45, edge: 0.14, wet: 0.2, bleed: 0.6, wob: { amp: 0.5, wl: 160, tr: 0.05 }, step: 2.4, cutK: 0.28 });
    for (const c of ACCENTS) {
      out[`m_${c}`] = marker(c);
      out[`f_${c}`] = felt(c);
    }
    return out;
  }
  var PENS = build2();
  function pen(p, over) {
    const base = typeof p === "string" ? PENS[p] : p;
    if (!base) throw new Error(`ink: unknown pen "${String(p)}"`);
    return over ? { ...base, ...over, wob: { ...base.wob, ...over.wob } } : base;
  }

  // src/pen.ts
  var wrap = (a) => a > Math.PI ? a - TAU : a < -Math.PI ? a + TAU : a;
  var Sink = class {
    constructor(cfg) {
      __publicField(this, "bb", [Infinity, Infinity, -Infinity, -Infinity]);
      __publicField(this, "cfg");
      this.cfg = cfg;
    }
    grow(x, y) {
      const b = this.bb;
      if (x < b[0]) b[0] = x;
      if (x > b[2]) b[2] = x;
      if (y < b[1]) b[1] = y;
      if (y > b[3]) b[3] = y;
    }
    poly(pts) {
      for (const p of pts) this.grow(p[0], p[1]);
      return smoothClosed(pts, this.cfg);
    }
  };
  function blobPts(cx, cy, r, jag, rnd, nv = 10, sx = 1, sy = 1, rot = 0) {
    const pts = [];
    const a0 = rnd() * TAU;
    for (let i = 0; i < nv; i++) {
      const a = a0 + i / nv * TAU;
      const rr = r * (1 + jag * (rnd() * 2 - 1));
      const x = Math.cos(a) * rr * sx, y = Math.sin(a) * rr * sy;
      pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
    }
    return pts;
  }
  function ribbon(g, lo, ro, a, b, capS = true, capE = true) {
    const { X, Y, NX, NY, TX, TY, capN } = g;
    const pts = [];
    for (let i = a; i <= b; i++) pts.push([X[i] + NX[i] * lo[i], Y[i] + NY[i] * lo[i]]);
    if (capE) {
      const r = (lo[b] + ro[b]) / 2;
      for (let k = 1; k <= capN; k++) {
        const ph = k / (capN + 1) * Math.PI;
        const c = Math.cos(ph), s = Math.sin(ph);
        const w = c >= 0 ? lo[b] : ro[b];
        pts.push([X[b] + NX[b] * w * c + TX[b] * r * s, Y[b] + NY[b] * w * c + TY[b] * r * s]);
      }
    }
    for (let i = b; i >= a; i--) pts.push([X[i] - NX[i] * ro[i], Y[i] - NY[i] * ro[i]]);
    if (capS) {
      const r = (lo[a] + ro[a]) / 2;
      for (let k = 1; k <= capN; k++) {
        const ph = k / (capN + 1) * Math.PI;
        const c = Math.cos(ph), s = Math.sin(ph);
        const w = c >= 0 ? ro[a] : lo[a];
        pts.push([X[a] - NX[a] * w * c - TX[a] * r * s, Y[a] - NY[a] * w * c - TY[a] * r * s]);
      }
    }
    return pts;
  }
  function clampInner(g, lo, ro) {
    const { N, seg, turn } = g;
    for (let i = 0; i < N; i++) {
      const k = Math.abs(turn[i]) / (4 * seg);
      if (k < 1e-3) continue;
      const lim = 0.85 / k;
      if (turn[i] > 0) ro[i] = Math.min(ro[i], lim);
      else lo[i] = Math.min(lo[i], lim);
    }
  }
  function prepare(pts, P, rng, o, cfg) {
    let raw = 0;
    for (let i = 1; i < pts.length; i++) raw += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const step0 = Math.max(P.step * cfg.stepK * (o.simple ? 1.8 : 1), raw / 6e3);
    const dense = o.poly ? densify(o.round ? fillet(pts, o.round) : pts, step0) : spline(pts, step0);
    let L0 = 0;
    for (let i = 1; i < dense.length; i++) L0 += Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]);
    const step = L0 < 30 ? Math.max(0.7, Math.min(step0, L0 / 22)) : step0;
    const { X, Y, S, L } = resample(dense, step);
    const N = X.length;
    const rn = rng.fork("noise");
    const nLow = noise1(rn, L, P.wob.wl), nMid = noise1(rn, L, P.wob.wl * 0.3), nTr = noise1(rn, L, 4.5);
    const nW9 = noise1(rn, L, 9), nP40 = noise1(rn, L, 40), nDry = noise1(rn, L, 26), nFlow = noise1(rn, L, 18);
    const r2 = rng.fork("noise2");
    const nDens = noise1(r2, L, 55), nTooth = noise1(r2, L, P.dryWl), nGap = noise1(r2, L, 9);
    const wob = o.raw ? 0 : o.wobble ?? 1;
    if (wob > 0 && N > 2) {
      const amp = P.wob.amp * wob * clamp(L / 120, 0.2, 1.4);
      const tr = P.wob.tr * wob;
      const dx = new Float64Array(N), dy = new Float64Array(N);
      for (let i = 0; i < N; i++) {
        const a = Math.max(0, i - 1), b = Math.min(N - 1, i + 1);
        const tx = X[b] - X[a], ty = Y[b] - Y[a];
        const l = Math.hypot(tx, ty) || 1;
        const off = amp * (nLow(S[i]) + 0.3 * nMid(S[i])) + tr * nTr(S[i]);
        dx[i] = ty / l * off;
        dy[i] = -tx / l * off;
      }
      for (let i = 0; i < N; i++) {
        X[i] += dx[i];
        Y[i] += dy[i];
      }
    }
    const TX = new Float64Array(N), TY = new Float64Array(N), NX = new Float64Array(N), NY = new Float64Array(N);
    const th = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const a = Math.max(0, i - 1), b = Math.min(N - 1, i + 1);
      const tx = X[b] - X[a], ty = Y[b] - Y[a];
      const l = Math.hypot(tx, ty) || 1;
      TX[i] = tx / l;
      TY[i] = ty / l;
      NX[i] = TY[i];
      NY[i] = -TX[i];
      th[i] = Math.atan2(ty, tx);
    }
    const turn = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const a = Math.max(0, i - 2), b = Math.min(N - 1, i + 2);
      turn[i] = wrap(th[b] - th[a]) * (4 / Math.max(1, b - a));
    }
    const seg = L / (N - 1) || 1;
    const endMode = o.end ?? (rng.fork("end")() < 0.5 ? "pool" : "flick");
    const V = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const vA = Math.min(1, Math.sqrt((S[i] + 0.6) / 9));
      const vD = endMode === "flick" ? 1 : Math.min(1, Math.sqrt((L - S[i] + 0.6) / 11));
      const vC = 1 / (1 + Math.abs(turn[i]) / (4 * seg) * 5);
      V[i] = Math.min(vA, vD, vC);
    }
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 1; i < N; i++) V[i] = Math.min(V[i], V[i - 1] * 0.55 + V[i] * 0.45 + 0.08);
      for (let i = N - 2; i >= 0; i--) V[i] = Math.min(V[i], V[i + 1] * 0.55 + V[i] * 0.45 + 0.08);
    }
    const sp = o.speed ?? 1;
    for (let i = 0; i < N; i++) V[i] = clamp(V[i] * sp, 0, 1);
    const startMode = o.start ?? (rng.fork("start")() < 0.8 ? "pool" : "soft");
    return { X, Y, S, TX, TY, NX, NY, th, turn, V, L, N, seg, nW9, nP40, nDry, nFlow, nDens, nTooth, nGap, endMode, startMode, capN: o.simple ? 1 : 3 };
  }
  function runs(cut, N) {
    if (!cut) return [[0, N - 1]];
    const out = [];
    let a = -1;
    for (let i = 0; i <= N; i++) {
      const c = i === N || cut[i] === 1;
      if (!c && a < 0) a = i;
      if (c && a >= 0) {
        if (i - 1 - a >= 1) out.push([a, i - 1]);
        a = -1;
      }
    }
    return out;
  }
  function lineStroke(pts, P, rng, o, cfg, lo) {
    const g = prepare(pts, P, rng, o, cfg);
    const { X, Y, S, L, N, V, turn } = g;
    const sink = new Sink(o.simple ? { ...cfg, tol: cfg.tol * 2.2 } : cfg);
    const felt2 = P.kind === "felt";
    const W = P.W * (o.width ?? 1);
    const alpha = (o.alpha ?? 1) * P.alpha;
    const layers = [];
    const rl = rng.fork("layers");
    const hw = new Float64Array(N);
    const taper = Math.min(L * 0.35, (2.5 + 3.5 * W) * P.taper);
    const dryK = o.dry ?? 1;
    const cut = P.gaps > 0 && !o.simple ? new Uint8Array(N) : null;
    for (let i = 0; i < N; i++) {
      const toEnd = L - S[i];
      const press = o.press ? o.press(S[i] / L) : 1;
      let h;
      if (felt2) {
        h = 0.5 * W * (0.8 + P.swell * (1 - V[i])) * press * (1 + 0.1 * g.nW9(S[i])) * (1 + 0.07 * g.nP40(S[i]));
        h *= 1 + P.dir * Math.sin(g.th[i]);
        h *= 1 + 0.08 * P.dens * g.nDens(S[i]);
        h *= 1 + 0.16 * Math.exp(-S[i] / 2.5);
        if (g.endMode === "flick" && toEnd < taper) h *= 0.3 + 0.7 * Math.pow(Math.max(0, toEnd) / taper, 0.75);
        if (P.skip > 0 && V[i] > 0.9) {
          const dry = g.nDry(S[i]);
          const t = 1 - 0.55 * P.skip * dryK;
          if (dry > t) h *= Math.max(0.42, 1 - (dry - t) * 5);
        }
      } else {
        const pr = 0.86 + 0.18 * g.nP40(S[i]) + 0.1 * (1 - V[i]);
        const t0 = Math.min(0.3 * L, 5), t1 = Math.min(0.4 * L, g.endMode === "flick" ? 9 : 5);
        let e = 1;
        if (S[i] < t0) e *= 0.5 + 0.5 * (S[i] / t0);
        if (toEnd < t1) e *= 0.4 + 0.6 * (Math.max(0, toEnd) / t1);
        h = Math.max(0.15, 0.5 * W * e * pr * press * (1 + 0.1 * g.nW9(S[i])));
        h *= 1 + P.dir * Math.sin(g.th[i]);
      }
      if (P.dryAmt > 0 && V[i] > 0.55) {
        const d = g.nTooth(S[i]);
        if (d > 0.5) h *= 1 - 0.62 * P.dryAmt * dryK * smooth((d - 0.5) / 0.22);
      }
      if (cut && S[i] > 4 && toEnd > 4 && V[i] > 0.8 && g.nGap(S[i]) > 1.05 - 0.6 * P.gaps * dryK) cut[i] = 1;
      hw[i] = Math.max(0.12, h);
    }
    if (cut) {
      for (let i = 0; i < N; i++) {
        if (cut[i] !== 1) continue;
        let j = i;
        while (j < N && cut[j] === 1) j++;
        if (j - i < 3) for (let k = i; k < j; k++) cut[k] = 0;
        i = j;
      }
    }
    const mkLane = (fnL, fnR = fnL, pieces2 = [[0, N - 1]]) => {
      const l = new Float64Array(N), r = new Float64Array(N);
      for (let i = 0; i < N; i++) {
        l[i] = fnL(i);
        r[i] = fnR(i);
      }
      clampInner(g, l, r);
      let d = "";
      for (const [a, b] of pieces2) d += sink.poly(ribbon(g, l, r, a, b, true, true));
      return d;
    };
    const color = o.color ?? P.color;
    const pieces = runs(cut, N);
    const solid = o.alpha ?? 1;
    if (felt2) {
      const bleed = P.bleed;
      if (P.halo > 0 && !o.simple) {
        const nH1 = noise1(rl, L, 7), nH2 = noise1(rl, L, 7);
        let ja = 0.5, jb = 0.5;
        const A = new Float64Array(N), B = new Float64Array(N);
        for (let i = 0; i < N; i++) {
          ja = 0.5 * ja + 0.5 * rl();
          jb = 0.5 * jb + 0.5 * rl();
          const soak = 0.4 * (1 - V[i]);
          A[i] = hw[i] + bleed * (0.4 + 0.85 * Math.max(0, nH1(S[i])) + 0.4 * ja + soak);
          B[i] = hw[i] + bleed * (0.4 + 0.85 * Math.max(0, nH2(S[i])) + 0.4 * jb + soak);
        }
        layers.push({ k: "halo", d: mkLane((i) => A[i], (i) => B[i]), fill: color, op: P.halo * (lo ? 0.85 : 0.55) });
        if (!lo) {
          let jc = 0.5;
          const C = new Float64Array(N);
          for (let i = 0; i < N; i++) {
            jc = 0.4 * jc + 0.6 * rl();
            C[i] = hw[i] + bleed * (0.25 + 0.55 * jc);
          }
          layers.push({ k: "halo", d: mkLane((i) => C[i]), fill: color, op: P.halo });
          const cnt = Math.floor(L / 3.2 * P.feather * (0.6 + 0.8 * rl()));
          const hp = new PathWriter(cfg.q);
          for (let c = 0; c < cnt; c++) {
            const i = 1 + Math.floor(rl() * (N - 2));
            const side = rl() < 0.5 ? 1 : -1;
            const ang = (rl() - 0.5) * 2.2;
            const nx = g.NX[i] * side, ny = g.NY[i] * side;
            const dx = nx * Math.cos(ang) - ny * Math.sin(ang), dy = nx * Math.sin(ang) + ny * Math.cos(ang);
            const len = hw[i] + bleed * (0.5 + rl() * rl() * 1.8);
            const bx = X[i] + nx * hw[i] * 0.5, by = Y[i] + ny * hw[i] * 0.5;
            const bw = 0.22 + 0.3 * rl();
            const tx = g.TX[i] * bw, ty = g.TY[i] * bw;
            const tip = [X[i] + dx * len, Y[i] + dy * len];
            sink.grow(tip[0], tip[1]);
            hp.M(bx + tx, by + ty).L(tip[0], tip[1]).L(bx - tx, by - ty).Z();
          }
          if (hp.d) layers.push({ k: "hair", d: hp.d, fill: color, op: Math.min(1, P.halo * 1.6) });
        }
      }
      const jit = new Float64Array(N);
      for (let i = 0; i < N; i++) jit[i] = lo ? 1 : 1 + 0.07 * (rl() - 0.5);
      layers.push({ k: "body", d: mkLane((i) => hw[i] * jit[i], (i) => hw[i] * jit[N - 1 - i], pieces), fill: color, op: alpha });
      if (!o.simple) {
        const core = new Float64Array(N);
        let any = false;
        for (let i = 0; i < N; i++) {
          const dn = 1 + 0.6 * P.dens * g.nDens(S[i] + 17);
          core[i] = cut && cut[i] ? 0 : 0.72 * hw[i] * Math.max(Math.pow(1 - V[i], 1.2), 0.8 * (0.5 + 0.5 * g.nFlow(S[i])) - 0.1) * dn;
          if (core[i] > 0.18) any = true;
          else core[i] = 0;
        }
        let cd = any ? mkLane((i) => core[i]) : "";
        let pd = "";
        let hd2 = "";
        const pool = (i, k, jag) => {
          const r = hw[i] * k * P.pool;
          pd += sink.poly(blobPts(X[i], Y[i], r, jag, rl, 11));
          if (P.halo > 0 && !lo) hd2 += sink.poly(blobPts(X[i], Y[i], r + bleed * 1.5, 0.2, rl, 12));
        };
        if (g.startMode === "pool") pool(0, 1.05 + 0.25 * rl(), 0.14);
        if (g.endMode === "pool") pool(N - 1, 0.95 + 0.3 * rl(), 0.14);
        let lastPool = -9;
        for (let i = 2; i < N - 2; i++) {
          if (Math.abs(turn[i]) > 1.35 && i - lastPool > 4) {
            pool(i, 0.6 + 0.25 * Math.min(1, Math.abs(turn[i]) - 1.35), 0.14);
            lastPool = i;
          }
        }
        if (lo) {
          cd += pd;
          pd = "";
        }
        if (cd) layers.push({ k: "core", d: cd, fill: color, op: P.core * solid });
        if (hd2) layers.push({ k: "halo", d: hd2, fill: color, op: P.halo * 0.9 });
        if (pd) layers.push({ k: "pool", d: pd, fill: color, op: Math.min(1, P.core * 1.1) * solid });
      }
    } else {
      if (!o.simple) layers.push({ k: "smear", d: mkLane((i) => hw[i] * 1.2), fill: color, op: P.smear * solid });
      layers.push({ k: "body", d: mkLane((i) => hw[i] * (1 + 0.12 * (lo ? 0 : rl() - 0.5)), (i) => hw[i] * (1 + 0.12 * (lo ? 0 : rl() - 0.5)), pieces), fill: color, op: alpha });
      if (!o.simple) {
        const nc = noise1(rl, L, 40);
        layers.push({ k: "core", d: mkLane((i) => hw[i] > 0.3 ? hw[i] * 0.55 * (0.7 + 0.3 * nc(S[i] + 13)) * (1 + 0.4 * P.dens * g.nDens(S[i] + 5)) : 0), fill: color, op: alpha * 0.55 });
      }
    }
    return { kind: P.kind, layers, bbox: sink.bb, len: L, end: [X[N - 1], Y[N - 1]], start: [X[0], Y[0]] };
  }
  function markerStroke(pts, P, rng, o, cfg, lo) {
    const g = prepare(pts, P, rng, { ...o, start: o.start ?? "pool" }, cfg);
    const { X, Y, S, L, N } = g;
    const sink = new Sink(cfg);
    const W = P.W * (o.width ?? 1);
    const alpha = (o.alpha ?? 1) * P.alpha;
    const rl = rng.fork("layers");
    const hl = P.kind === "hl";
    const color = o.color ?? P.color;
    const hwA = new Float64Array(N);
    const nM = noise1(rl, L, 14), nE = noise1(rl, L, 3.5), nE2 = noise1(rl, L, 3.5);
    const taper = Math.min(0.25 * L, 0.5 * W);
    const cutLen = Math.min(W * P.cutK, L * 0.4);
    const slantA = rl() < 0.5 ? 1 : -1;
    const lo_ = new Float64Array(N), ro_ = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const ang = Math.atan2(g.TY[i], g.TX[i]);
      const chisel = hl ? 0.8 + 0.2 * Math.abs(Math.sin(ang - P.nib)) : 0.5 + 0.5 * Math.abs(Math.sin(ang - P.nib));
      let hw = 0.5 * W * chisel * (o.press ? o.press(S[i] / L) : 1) * (1 + 0.06 * nM(S[i]));
      if (g.endMode === "flick" && L - S[i] < taper) hw *= 0.6 + 0.4 * ((L - S[i]) / taper);
      hwA[i] = hw;
      let a = hw * (1 + 0.35 * P.edge * nE(S[i]) * 0.5);
      let b = hw * (1 + 0.35 * P.edge * nE2(S[i]) * 0.5);
      if (S[i] < cutLen) {
        const c = 1 - 0.6 * (1 - S[i] / cutLen);
        if (slantA > 0) a *= c;
        else b *= c;
      }
      if (L - S[i] < cutLen) {
        const c = 1 - 0.6 * (1 - (L - S[i]) / cutLen);
        if (slantA > 0) b *= c;
        else a *= c;
      }
      lo_[i] = a;
      ro_[i] = b;
    }
    const layers = [];
    const lane = (l2, r2) => {
      const a = new Float64Array(N), b = new Float64Array(N);
      for (let i = 0; i < N; i++) {
        a[i] = l2(i);
        b[i] = r2(i);
      }
      clampInner(g, a, b);
      return sink.poly(ribbon(g, a, b, 0, N - 1, false, false));
    };
    layers.push({ k: "halo", d: lane((i) => lo_[i] + P.bleed * (0.5 + 0.5 * nE(S[i] + 9)), (i) => ro_[i] + P.bleed * (0.5 + 0.5 * nE2(S[i] + 9))), fill: color, op: alpha * P.wet });
    let body = lane((i) => lo_[i], (i) => ro_[i]);
    const rw1 = hl ? 0.55 : 0.8;
    const rim = lane((i) => lo_[i], (i) => -lo_[i] + rw1 * (0.6 + 0.8 * rl())) + lane((i) => -ro_[i] + rw1 * (0.6 + 0.8 * rl()), (i) => ro_[i]);
    let rule;
    const extra = [];
    if (!hl && !lo && L > 6) {
      const nS = noise1(rl, L, 30);
      for (let s = 0; s < 2; s++) {
        const base = (rl() - 0.5) * 0.9;
        const off = (i) => hwA[i] * (base + 0.25 * nS(S[i] + s * 40));
        extra.push({ k: "streak", d: lane((i) => Math.max(0.1, 0.3 + off(i)), (i) => Math.max(0.1, 0.3 - off(i))), fill: color, op: P.edge * 0.5 });
      }
      const nGap = noise1(rl, L, 11);
      let sd = "";
      let inSlit = false, sIdx = 0;
      for (let i = 0; i < N; i++) {
        const dry = Math.max(0, nGap(S[i] + 31) - (g.V[i] > 0.8 ? 0.3 : 0.5));
        if (dry > 0.3 && !inSlit) {
          inSlit = true;
          sIdx = i;
        }
        if ((dry <= 0.3 || i === N - 1) && inSlit) {
          inSlit = false;
          if (i - sIdx > 4) {
            const off = hwA[sIdx] * (rl() - 0.5) * 0.7;
            const top = [], bot = [];
            for (let j = sIdx; j < i; j++) {
              const tt = (j - sIdx) / (i - sIdx);
              const wdt = 0.28 * Math.sin(Math.PI * tt);
              top.push([X[j] + g.NX[j] * (off + wdt), Y[j] + g.NY[j] * (off + wdt)]);
              bot.unshift([X[j] + g.NX[j] * (off - wdt), Y[j] + g.NY[j] * (off - wdt)]);
            }
            sd += smoothClosed([...top, ...bot], cfg);
          }
        }
      }
      if (sd) {
        body += sd;
        rule = "evenodd";
      }
    }
    layers.push({ k: "body", d: body, fill: color, op: alpha, rule });
    layers.push({ k: "rim", d: rim, fill: color, op: P.edge });
    layers.push(...extra);
    return { kind: P.kind, layers, bbox: sink.bb, len: L, end: [X[N - 1], Y[N - 1]], start: [X[0], Y[0]] };
  }
  function stroke(pointsIn, penIn, rng, o = {}) {
    const P = pen(penIn);
    const tier = o.tier ?? "lo";
    const cfg = TIERS[tier];
    const pts = pointsIn.filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1])).map((p) => [clamp(p[0], -1e5, 1e5), clamp(p[1], -1e5, 1e5)]);
    if (pts.length === 0) return { kind: P.kind, layers: [], bbox: [0, 0, 0, 0], len: 0, start: [0, 0], end: [0, 0] };
    if (pts.length < 2) return dot(pts[0][0], pts[0][1], P.W * 0.6, P, rng, o);
    return P.kind === "marker" || P.kind === "hl" ? markerStroke(pts, P, rng, o, cfg, tier === "lo") : lineStroke(pts, P, rng, o, cfg, tier === "lo");
  }
  function dot(cx, cy, r, penIn, rng, o = {}) {
    const P = pen(penIn);
    const tier = o.tier ?? "lo";
    const cfg = TIERS[tier];
    const sink = new Sink(cfg);
    const rl = rng.fork("dot");
    const color = o.color ?? P.color;
    const layers = [];
    const rr = r * (o.width ?? 1);
    if (P.kind === "felt") {
      if (P.halo > 0 && tier === "hi") layers.push({ k: "halo", d: sink.poly(blobPts(cx, cy, rr + P.bleed * 1.4, 0.2, rl, 12)), fill: color, op: P.halo * 0.9 });
      layers.push({ k: "body", d: sink.poly(blobPts(cx, cy, rr, 0.09, rl, 11)), fill: color, op: P.alpha * (o.alpha ?? 1) });
      layers.push({ k: "pool", d: sink.poly(blobPts(cx + rr * 0.05, cy, rr * 0.7, 0.1, rl, 9)), fill: color, op: P.core });
    } else {
      if (tier === "hi") layers.push({ k: "smear", d: sink.poly(blobPts(cx, cy, rr * 1.15, 0.1, rl, 10)), fill: color, op: P.smear || 0.2 });
      layers.push({ k: "body", d: sink.poly(blobPts(cx, cy, rr, 0.12, rl, 10)), fill: color, op: P.alpha * (o.alpha ?? 1) });
    }
    return { kind: P.kind === "hl" || P.kind === "marker" ? "felt" : P.kind, layers, bbox: sink.bb, len: 0, end: [cx, cy], start: [cx, cy] };
  }

  // src/entry.ts
  globalThis.LLPen = { stroke, dot, makeRng, pen, PENS };
})();
