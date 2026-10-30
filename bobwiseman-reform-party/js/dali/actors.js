// Reform Party, Dali look: the actor registry for the check tools (tools/check-actors.mjs). Every solid body (a
// person, bike, art car, prop that moves or appears) reports where it is each frame: ACT.note(id, X, Z, r, o) with
// o = { h: height m, a: alpha 0..1, s: scale 0..1, cover: true if it is hidden behind something while faded,
// group: lane name }. Off in renders: ACT.on is true only with ?actors=1, so the film is unchanged.
const ACT = { on: /[?&]actors=1/.test(location.search), list: [],
  note(id, X, Z, r, o) { if (!this.on) return; o = o || {}; this.list.push({ id, X, Z, r, h: o.h || 1.8, a: o.a == null ? 1 : o.a, s: o.s == null ? 1 : o.s, cover: !!o.cover, group: o.group || String(id).split(':')[0] }); },
  reset() { this.list.length = 0; } };
