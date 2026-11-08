// cleanline looks: a look is one way of drawing a shot mode ('ill' paper scenes, 'sch' schematic plates, ...).
//
// A look module (cleanline/looks/<name>.js) registers itself:
//   defineLook({
//     name: 'fieldguide', mode: 'ill',        // the shot mode it draws
//     extends: 'fieldguide',                  // optional: take another look's palette, grounds and grain, not its hooks
//     palette: { ink: '#3a2617', ... },       // merged into C when the look is in use
//     lineWeight: 1,                          // stroke() multiplies every width by this on this mode's shots
//     grain: { seeds: [11, 12, 13, 14], tone: 'paper' },  // the per-frame grain overlay ('paper' | 'dark')
//     provides: { paper() {...}, stripes() {...} },        // grounds and frames films call by name; become globals
//     init(ctx, opts) {},   // once, with the film canvas; may wrap primitives (stroke = function ...)
//     pre(ctx, shot) {},    // before each drawing of a shot in this mode
//     post(ctx, shot) {},   // after it (overlays, cast shadows)
//   });
//
// The film says which looks it can be drawn in, per mode, default first (film.config.js):
//   looks: { ill: ['fieldguide', 'armink'], sch: ['blueprint'] }
// ?look=armink swaps a mode to another listed look; ?look=ill:armink,sch:blueprint names the mode outright.
// The page loads every listed look module, parents before children. opts in init() is the page's URLSearchParams,
// so a look can take its own switches (?ink=1, ?ground=plain).
'use strict';
const LOOKS = {}; // every registered look
const LOOK_FOR = {}; // mode -> the look drawing that mode on this page
const LOOK_PICK = (() => {
  const offered = (typeof FILM === 'object' && FILM && FILM.looks) || {}, pick = {};
  for (const [mode, names] of Object.entries(offered)) pick[mode] = [].concat(names)[0];
  const q = typeof location === 'object' ? new URLSearchParams(location.search).get('look') : null;
  for (const item of (q || '').split(',').filter(Boolean)) {
    const [a, b] = item.includes(':') ? item.split(':') : [null, item];
    const mode = a || Object.keys(offered).find((m) => [].concat(offered[m]).includes(b));
    if (!mode) { console.error(`look: "${b}" is not offered by this film (film.config.js looks)`); continue; }
    pick[mode] = b;
  }
  return pick;
})();

function lookChain(name) { // ancestors first
  const out = []; for (let n = name; n; n = LOOKS[n].extends) { if (!LOOKS[n]) throw new Error(`look: "${n}" not loaded (load it before ${name})`); out.unshift(LOOKS[n]); }
  return out;
}
function defineLook(def) {
  if (!def.name || !def.mode) throw new Error('look: needs a name and a mode');
  LOOKS[def.name] = def;
  if (LOOK_PICK[def.mode] !== def.name) return;
  // in use on this page: merge the palette, install the grounds, settle grain and line weight (parents first)
  const chain = lookChain(def.name), look = { name: def.name, mode: def.mode, def, lineWeight: 1, grain: null };
  for (const L of chain) {
    if (L.palette) Object.assign(C, L.palette);
    if (L.provides) for (const [k, fn] of Object.entries(L.provides)) globalThis[k] = fn;
    if (L.lineWeight !== undefined) look.lineWeight = L.lineWeight;
    if (L.grain) look.grain = L.grain;
  }
  LOOK_FOR[def.mode] = look;
}
// a film's own colours go on top of its looks' palettes
function filmPalette() { if (typeof FILM === 'object' && FILM && FILM.palette) Object.assign(C, FILM.palette); }
