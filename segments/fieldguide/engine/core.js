// cleanline core: frame size, the seeded random stream, easing, and the drawing state every primitive shares.
// Classic script (no modules): films and looks call these as plain globals, and a look may replace a primitive by
// assigning to it (stroke = function ...), which every caller then picks up.
// Load order: film.config.js, cleanline/js/clock.js, the film's clock.js, then this (FPS comes from the clock).
'use strict';
const FILM_CFG = (typeof FILM === 'object' && FILM) || {};
const W = (FILM_CFG.size && FILM_CFG.size[0]) || 1920, H = (FILM_CFG.size && FILM_CFG.size[1]) || 1080;
const FPS = (typeof CLOCK === 'object' && CLOCK.fps) || FILM_CFG.fps || 24, TAU = Math.PI * 2;

// mulberry32: the one random stream. The driver reseeds R for every held drawing, so lines boil between drawings
// and hold still across the two frames of a drawing. Anything that must not boil makes its own M32(seed).
function M32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let R = M32(1);
const rnd = (a = 0, b = 1) => a + (b - a) * R(), jit = (s) => (R() - .5) * 2 * s;
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
const eo = (t) => 1 - Math.pow(1 - cl(t), 3), ex = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * cl(t)));
const eio = (t) => { t = cl(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const seg = (p, a, b) => cl((p - a) / (b - a));
const snap = (p, n) => Math.floor(p * n) / n; // stepped motion

// Drawing state, set by the driver (js/frame.js) before each drawing.
let X = null;    // the 2d context every primitive draws on (a film may point it at another canvas and back)
let FD = 0;      // the held drawing's song frame (even: drawings are held on twos)
let DSEED = 1;   // per-shot seed for dressing that must hold still across the whole shot
let TNOW = 0;    // song time of the held drawing, in seconds
let MODE = null; // the current shot's mode ('ill', 'sch', ...): which look draws it
let LW = 1;      // line weight of the current shot's look; stroke() multiplies every width by it
const flap = () => (((FD >> 1) & 1) ? 1 : 0);
