const SHOTS = [];
function SHOT(a, b, name, fn, opts = {}) { SHOTS.push({ a, b, name, fn, o: opts }); SHOTS.sort((x, y) => x.a - y.a); }
