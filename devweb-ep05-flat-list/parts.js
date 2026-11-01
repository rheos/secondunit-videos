// devweb ep 5, the flat list: what every station shares and nobody owns alone. The layout (world-plan.md, in world
// units), the beats on Chris's words (camera.md's prop clocks), the card face, the copy flight and a few small
// builders. Stations import from here and never from each other; world.js owns the camera and the station loop.
// Everything is a pure function of film time t.
import * as THREE from "three";
import { cl, io, r01, mix, V, rr } from "./kit/world.js";

const VO = window.VO;
export const w = (x, n) => VO.w(x, n), e = (x, n) => VO.e(x, n);

// ---------- the beats (camera.md "Clocks for the moving props"; occurrences checked against vo/words.js) ----------
export const T = {
  // I-II: the hook, the ask, the list back
  say: w("say", 1), asks: w("asks", 1), gets: w("gets", 1), back: w("back", 1),
  // III: save this
  save2: w("save", 2), this1: w("this", 1), memory1: w("memory", 1), name1: w("name", 1), first1: w("first", 1),
  memory2: w("memory", 2), takes: w("takes", 1), recent1: w("recent", 1), saved1: w("saved", 1),
  nothing1: w("nothing", 1), errors: w("errors", 1), time1: w("time", 1),
  // IV: the pulse reads first words
  why: w("why", 1), except: w("except", 1), name2: w("name", 2), far: w("far", 1),
  // V: the dive 12 -> 28
  memory4: w("memory", 4), sits2: w("sits", 2), sits3: w("sits", 3), now: w("now", 1),
  // VI: the near one
  look: w("look", 1), finds: w("finds", 1), misses: w("misses", 1), note3: w("note", 3),
  // VII: the mass moment
  problem1: w("problem", 1), problem2: w("problem", 2), anything: w("anything", 1), mostly: w("mostly", 1),
  of2: w("of", 2), tools6: w("tools", 6), makes: w("makes", 1),
  // VIII: tool 36
  nothing5: w("nothing", 5), word6: w("word", 6), build: w("build", 1), deploy: w("deploy", 1),
  // IX: the rule, the rename
  first9: w("first", 9), invoice1: w("invoice", 1), invoice2: w("invoice", 2), invoice3: w("invoice", 3),
  send3: w("send", 3), rename: w("rename", 1), write3: w("write", 3), memory10: w("memory", 10),
  // X
  first10: w("first", 10), folderE: e("folder", 2), END: VO.END,
};
T.cardsUp = T.gets + 0.1; // II: the 35 cards leave the box mouth, card k 0.06 s after card k-1
T.diveA = T.sits2 + 0.1; T.diveB = T.sits3 + 0.4; // V: the camera's dive keys (the counter and bracket ride them)
T.peel = T.mostly + 0.2; // VII: copy i departs at peel + 0.09 (i - 1)
T.c36Up = T.nothing5 + 1.2; T.c36Copy = T.deploy + 0.2 - 1.0; // VIII: card 36 rises; its copy flies 1.0 s
T.c36Down = T.first9; // IX: card 36 goes back into the box while the camera is at S4
T.rewrite = T.memory10 + 0.3; // IX: memory_write typed in; card 11's copy peels

// ---------- the layout ----------
export const CORD_Z = 1.25, CARD_Z = 1.31, FACE_Z = 1.33, COL_X = -0.45; // COL_X: the first-word column
export const MOUTH_Y = -27.2; // a card's centre when it sits inside the toolbox
export const cardY = (i) => -2.10 - 0.68 * (i - 1);
export const NAMES = [null,
  "entity_create", "entity_get", "entity_search", "entity_update", "entity_relate", "entity_relate_confirm", "entity_relate_reject",
  "chat_send", "chat_history", "summarize_and_archive", "write_memory", "memory_recent", "ticket_get", "ticket_list",
  "topic_thread_link", "ticket_create", "ticket_update", "entity_merge", "chat_search", "maintainer_list", "graph_compact",
  "ticket_close", "ticket_assign", "procedural_note_get", "topic_thread_get", "entity_delete", "procedural_note_save",
  "memory_context", "topic_thread_list", "maintainer_get", "topic_thread_summarize", "notify_owner", "memory_profile",
  "config_get", "stats_overview", "send_invoice"];
export const DARK = new Set([10, 11, 32]); // no family (11 is the failure)
export const MEMORY = new Set([12, 28, 33]);
export const family = (i) => (DARK.has(i) || i === 36 ? null : NAMES[i].split("_")[0]);

// folders on the back wall: tab top, body top, body bottom, cols, copy slots in cord order (rows of `cols`)
export const FOLDERS = [
  ["entity", -4.94, -5.68, -6.60, 5, [1, 2, 3, 4, 5, 6, 7, 18, 26]],
  ["ticket", -6.30, -7.04, -7.96, 3, [13, 14, 16, 17, 22, 23]],
  ["memory", -7.66, -8.40, -9.00, 4, [12, 28, 33, 11]],
  ["topic", -9.30, -10.04, -10.64, 4, [15, 25, 29, 31]],
  ["chat", -10.94, -11.68, -12.28, 3, [8, 9, 19]],
  ["procedural", -12.58, -13.32, -13.92, 2, [24, 27]],
  ["maintainer", -14.22, -14.96, -15.56, 2, [20, 30]],
  ["graph", -15.86, -16.60, -17.20, 1, [21]],
  ["config", -17.50, -18.24, -18.84, 1, [34]],
  ["stats", -19.14, -19.88, -20.48, 1, [35]],
];
export const WALL_Z = -2.8, FOLDER_Z = -2.7, COPY_Z = -2.6, FOLDER_X = 4.9, FOLDER_W = 5.8;
// the landed slot of card i's copy: [x, y, folder index]
export const SLOT = {};
FOLDERS.forEach(([, , bodyTop, , cols, cards], f) => cards.forEach((i, k) => {
  const c = k % cols, r = Math.floor(k / cols);
  SLOT[i] = [2.655 + 1.09 * c, bodyTop - 0.2975 - 0.315 * r, f];
}));
export const LONE = [4.9, -24.86]; // card 36's lone copy, in the empty slot at S4
export const copyDepart = (i) => T.peel + 0.09 * (i - 1); // the mass moment's ripple, in cord order

// ---------- the copy flight (world-plan section 5): peel forward and out, then a cubic to the slot ----------
// p 0..1 over the flight; returns [x, y, z, scale]. Every control has x >= 2.6 and z falls to the slot, so the copy
// clears the card column, the toolbox and the open lid.
export function flightAt(y0, xs, ys, p, sEnd = 0.42) {
  p = io(cl(p));
  if (p < 0.3) { const k = p / 0.3; return [mix(0, 2.6, k), y0, mix(1.43, 1.9, k), mix(1, 0.55, k)]; }
  const k = (p - 0.3) / 0.7, u = 1 - k;
  const b = (a0, a1, a2, a3) => u * u * u * a0 + 3 * u * u * k * a1 + 3 * u * k * k * a2 + k * k * k * a3;
  return [b(2.6, 3.2, xs, xs), b(y0, y0, ys, ys), b(1.9, 0.6, -1.6, COPY_Z), mix(0.55, sEnd, k)];
}

// ---------- the card face: number strip, name in two runs (first word lights alone), two dim lines, { } ----------
// card units: 2.4 x 0.56; ppu 420 -> 1008 x 235 (copies use ppu 210)
export function drawCardFace(g, W, H, s) {
  const u = W / 2.4;
  const red = s.red || 0;
  g.fillStyle = red > 0 ? mixHex("#14243a", "#3a1714", red) : "#14243a"; g.fillRect(0, 0, W, H);
  g.strokeStyle = red > 0 ? mixHex("#4f93d6", "#e0675a", red) : "#4f93d6"; g.lineWidth = 0.025 * u; g.strokeRect(0.0125 * u, 0.0125 * u, W - 0.025 * u, H - 0.025 * u);
  g.globalAlpha = s.dark ? 0.45 : 1;
  g.fillStyle = "#6e7f93"; g.font = `600 ${0.16 * u}px 'IBM Plex Mono', monospace`; g.textBaseline = "middle";
  g.fillText(String(s.n).padStart(2, "0"), 0.06 * u, 0.2 * u);
  // name row
  const fs = 0.13 * u; g.font = `600 ${fs}px 'IBM Plex Mono', monospace`;
  const nameY = 0.16 * u, x0 = 0.42 * u;
  const drawName = (name, lit, alpha, dy, firstColor) => {
    const cut = name.indexOf("_"), fw = cut < 0 ? name : name.slice(0, cut), rest = cut < 0 ? "" : name.slice(cut);
    const fwW = g.measureText(fw).width;
    g.globalAlpha = (s.dark ? 0.45 : 1) * alpha;
    if (lit > 0) { g.fillStyle = `rgba(106,208,138,${0.22 * lit})`; g.fillRect(x0 - 0.02 * u, nameY - 0.1 * u + dy, fwW + 0.04 * u, 0.2 * u); }
    g.fillStyle = firstColor || (lit > 0.5 ? "#b9f0c9" : red > 0.5 ? "#ffb3a8" : "#a9c8ea"); g.fillText(fw, x0, nameY + dy);
    g.fillStyle = red > 0.5 ? "#ffb3a8" : "#7f9fc2"; g.fillText(rest, x0 + fwW, nameY + dy);
    return fwW + g.measureText(rest).width;
  };
  g.save(); g.beginPath(); g.rect(0.36 * u, 0.04 * u, W - 0.4 * u, 0.24 * u); g.clip();
  if (s.old != null) {
    // the rename: old name struck in red, sliding up and fading; the new one typed in below
    const k = s.slide || 0;
    const ow = drawName(s.old, 0, 1 - k, -0.2 * u * k);
    if (s.strike > 0) { g.globalAlpha = 1 - k; g.fillStyle = "#e0675a"; g.fillRect(x0, nameY - 0.01 * u - 0.2 * u * k, ow * s.strike, 0.02 * u); }
    if (s.name) drawName(s.name, s.lit, 1, 0.2 * u * (1 - k));
  } else drawName(s.name, s.lit, 1, 0, s.white && s.name.startsWith("send") ? "#ffffff" : null);
  g.restore();
  // lower row: two dim description bars and the inputs tab
  g.globalAlpha = (s.dark ? 0.45 : 1) * 0.3; g.fillStyle = "#8b949e";
  rr(g, 0.42 * u, 0.36 * u, 1.3 * u, 0.05 * u, 0.02 * u); g.fill(); rr(g, 0.42 * u, 0.44 * u, 0.88 * u, 0.05 * u, 0.02 * u); g.fill();
  g.globalAlpha = s.dark ? 0.45 : 1; g.strokeStyle = "#4f93d6"; g.lineWidth = 0.012 * u; rr(g, 1.98 * u, 0.33 * u, 0.32 * u, 0.17 * u, 0.03 * u); g.stroke();
  g.fillStyle = "#4f93d6"; g.font = `600 ${0.11 * u}px 'IBM Plex Mono', monospace`; g.textAlign = "center"; g.fillText("{ }", 2.14 * u, 0.42 * u); g.textAlign = "left";
  g.globalAlpha = 1;
}
export function mixHex(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b); return "#" + A.map((x, i) => Math.round(mix(x, B[i], cl(k))).toString(16).padStart(2, "0")).join("");
}

// a thin box whose +z face carries a canvas (material array, group 4): no decal plane to z-fight (ep 3)
export function faceBox(W, H, D, ppu, draw, edgeMat, { transparent = false } = {}) {
  const c = document.createElement("canvas"); c.width = Math.round(W * ppu); c.height = Math.round(H * ppu);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const face = new THREE.MeshBasicMaterial({ map: tex, transparent });
  const mats = [edgeMat, edgeMat, edgeMat, edgeMat, face, edgeMat];
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), mats);
  let key = null;
  return { mesh, face, set(state) { const k = JSON.stringify(state); if (k === key) return; key = k; const g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); draw(g, c.width, c.height, state); tex.needsUpdate = true; } };
}

// a value keyed on times, eased between keys: [[t, v], ...] (ep 3: ease every face value between keys)
export function track(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) { const [t0, v0] = keys[i], [t1, v1] = keys[i + 1]; if (t < t1) return mix(v0, v1, io((t - t0) / Math.max(0.001, t1 - t0))); }
    return keys[keys.length - 1][1];
  };
}
export const fadeMat = (m, a) => { m.transparent = true; m.opacity = a; m.depthWrite = a > 0.98; };
export { cl, io, r01, mix, V };
