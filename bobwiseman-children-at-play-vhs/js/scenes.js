// scenes.js · the scene contract for the camcorder stage (stage 1), and the camera kit every scene shares.
//
// A scene is one take or run of takes on the family tape. It registers itself with SCENE.add({...}):
//   id            short name, also the page param: home.html?scene=<id> draws only this scene (for stills)
//   t0, t1        song seconds, [t0, t1). Scenes tile the song with no gaps. A record-restart tear plays on t0.
//   takes         optional extra in-scene record restarts (song seconds), each tears for four frames too
//   stamp(t)      { date: 'AUG.17 1991', time: '5:41PM' } burned into the picture, or null for no stamp
//   camera(t)     { cx, cy, z, roll, focus } in the scene's world units (the 960x720 frame at z = 1); use CAMKIT
//   bg(g, t)      the lit world behind and under the shapes, drawn through the camera transform
//   shadows(g, t) optional: solid black shapes, composited soft at 34% (long shadows, cast light)
//   shapes(g, t)  every back-lit dark shape (people, furniture against the light): one colour family, rim-lit after
//   over(g, t)    optional: world-space things drawn after the rim pass (light through a window, dust in a beam)
//   light         { rim, glow, glowBlur, rimW, sunDir } for the rim pass; glowBlur and rimW are scaled by zoom
//   source(t)     optional: { x, y, r, a } the bright thing in frame (sun, window, lamp) in world units: it blooms
//                 and drives the auto-iris
//   grade         optional: { bright, contrast, sat } base exposure for the scene (default 1, 1.05, 1.04)
//   exposure(cam, s)  optional: replaces the default auto-iris; s = source on screen or null
// Everything must be pure in t: the same t draws the same frame, in any order.
(function () {
  const list = [];
  const SCENE = {
    add(s) { list.push(s); list.sort((a, b) => a.t0 - b.t0); },
    at(t) { for (let i = list.length - 1; i >= 0; i--) if (t >= list[i].t0) return list[i]; return list[0]; },
    all: () => list.slice(),
    get: (id) => list.find((s) => s.id === id),
  };
  const smooth = (x) => x * x * x * (x * (x * 6 - 15) + 10);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  // Pose keys [t, cx, cy, z]: each segment eases in and out (smootherstep).
  function keyed(keys, t) {
    if (t <= keys[0][0]) return keys[0].slice(1);
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t < b[0]) { const k = smooth((t - a[0]) / (b[0] - a[0])); return a.slice(1).map((v, j) => v + (b[j + 1] - v) * k); }
    }
    return keys[keys.length - 1].slice(1);
  }
  // Scalar keys [t, v] with a smoothstep between: focus hunts, exposure.
  function lin(keys, t) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t < b[0]) { const k = (t - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * k * k * (3 - 2 * k); }
    }
    return keys[keys.length - 1][1];
  }
  // The hand that holds the camcorder: never still. amount 1 = handheld adult, 2 = a kid holding it,
  // 0.15 = set down on a counter (only the motor and a floor that creaks).
  function hand(t, seed = 0, amount = 1) {
    const o = seed * 17.3;
    const x = 3.4 * Math.sin(0.83 * t + 1 + o) + 2.1 * Math.sin(1.97 * t + 0.4 + o) + 0.9 * Math.sin(4.7 * t + 2 + o) + 0.35 * Math.sin(11.3 * t + o);
    const y = 2.6 * Math.sin(0.71 * t + 2.2 + o) + 1.5 * Math.sin(2.31 * t + 1.1 + o) + 0.7 * Math.sin(5.3 * t + 0.3 + o) + 0.3 * Math.sin(12.1 * t + 1 + o);
    const roll = 0.0085 * Math.sin(0.62 * t + o) + 0.004 * Math.sin(1.83 * t + 0.7 + o);
    return { x: x * amount, y: y * amount, roll: roll * amount };
  }
  // A whole camera from keys: cam(t) = keyed pose + hand + focus keys.
  function rig(keys, focusKeys, seed, amount = 1, rollBias = 0) {
    return (t) => {
      const [cx, cy, z] = keyed(keys, t), h = hand(t, seed, amount);
      return { cx: cx + h.x, cy: cy + h.y, z, roll: h.roll + rollBias, focus: focusKeys ? lin(focusKeys, t) : 0 };
    };
  }
  window.SCENE = SCENE;
  window.CAMKIT = { keyed, lin, hand, rig, smooth, clamp };
})();
