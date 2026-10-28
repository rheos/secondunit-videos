// Stage-door amp: an Anatomy figure (wheresryan22/anatomy, MIT; kit vendored in kit/) of a small
// tweed-style combo with its chassis, valves, lead and a ticket stub, as a seek(t) page for video.
//   node build.mjs            writes amp.html (light theme)
//   node build.mjs --audit    also runs the kit's geometry audit and exits 1 on any problem
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import { tubePieces, tubeSvg } from "./kit/tube.mjs";
import * as A from "./kit/audit.mjs";
import { kitScript } from "./scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const THEME = process.argv.includes("--dark") ? "dark" : "light";

const W = 960;
const H = 540;

// World: x is the amp's depth (front grille at -40, open back at +40, facing the camera), y its width, z up.
const PLATE = { x: -62, y: -92, w: 200, d: 236, r: 8 };
const PLATE_H = 10;
const FOOT_H = 5;
const CAB = { x: -40, y: -70, w: 80, d: 140 };
const Z0 = 6; // cabinet bottom (on rubber feet)
const ZTOP = 116;
const WALL = 4;
const APRON = { x0: 36, x1: 38.5, y0: -60, y1: 60, z0: 96, z1: 111 };
const TRAY = { x0: 8, x1: 36, y0: -64, y1: 64, z0: 100, z1: 110 };
const KNOB_Z = 103.5;
const JACK = [APRON.x1, 48, KNOB_Z];
const LAMP = [APRON.x1, -50, KNOB_Z];

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [CAB.x, CAB.y, 124], [CAB.x + CAB.w, CAB.y + CAB.d, 124], [CAB.x, CAB.y + CAB.d, 124]],
  W,
  H,
  { pad: 40, azimuth: 30, elevation: 30 },
);
const V = G.viewOf(P);
const KS = G.scaleOf(P);
const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dots = (points, style) => k.dotsSvg(points, style);

// Assemblies. Values are the move at share 1. The stagger order is the order they leave in.
const PIECES = {
  lead: { name: "Lead and pedal", move: [34, 22, 0] },
  back: { name: "Back panel", move: [44, 0, 0] },
  valves: { name: "Valves", move: [32, 0, -24] },
  chassis: { name: "Chassis", move: [40, 0, 0] },
  stand: { name: "Cabinet and stand", move: [0, 0, 0] },
};
const STAGGER = ["lead", "back", "valves", "chassis", "stand"];
const SPRING = { stagger: 0.16, stiffness: 64, damping: 14.2, substeps: 4 };
const R = A.recorder(P, { order: STAGGER, spring: SPRING });
const { nameFor } = R;
const record = R.solid;

function put(piece, ref, svg, { bias = 0, shapes = [], name, route, chunk } = {}) {
  R.put({ piece, ride: piece, at: ref, bias, svg, move: PIECES[piece].move, shapes, name: name ?? nameFor(`${piece}.item`), route, chunk });
}
function boxAt(piece, plan, z, h, style = {}, { extra = "", inner = "", bias = 0, bevel = 0.5, steps = 3, name } = {}) {
  const id = nameFor(name ?? `${piece}.box`);
  const centre = [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2];
  put(piece, centre, S(k.slabOf(plan, z, h, P, steps, bevel), { tone: "mid", ...style, inner }) + extra, { bias, name: id, shapes: [record(A.slab(plan, z, h, { name: id }, steps))] });
  return id;
}
const plan = (x0, x1, y0, y1, r = 0.8) => ({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r });
function turned(piece, F, profile, style = {}, { extra = "", inner = "", bias = 0, name, owner, smooth } = {}) {
  const auto = smooth ?? profile.some((point) => point[2]);
  const paths = G.solidOf(profile, F, P, { smooth: auto === true ? { rows: 3 } : auto });
  const mid = (profile[0][0] + profile[profile.length - 1][0]) / 2;
  const id = nameFor(name ?? `${piece}.turned`);
  const shape = record(A.solid(F, profile, { name: id, owner, curve: auto && !auto.slope ? profile : undefined }));
  put(piece, G.add3(F.o, G.mul3(F.a, mid)), S(paths, { tone: "hi", ...style, inner }) + extra, { bias, name: id, shapes: [shape] });
  return shape;
}
function discAt(piece, F, s0, s1, r, style = {}, { extra = "", bias = 0, name, owner } = {}) {
  const id = nameFor(name ?? `${piece}.disc`);
  put(piece, G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), S(G.disc(s0, s1, r, F, P), { tone: "mid", ...style }) + extra, { bias, name: id, shapes: [record(A.disc(F, s0, s1, r, { name: id, owner }))] });
  return id;
}
// A dome of radius r and height h on a cylinder, as an analytic profile so the shading has one slope field.
// Its slope, for smooth: { slope } (the audit's wobble check fails a dome traced through typed knots).
const domeSlope = (s1, r, h) => (s) => {
  const u = (s - (s1 - h)) / h;
  return u <= 0 ? 0 : (-r * Math.min(u, 0.999)) / (h * Math.sqrt(1 - Math.min(u, 0.999) ** 2));
};
function domeProfile(s0, s1, r, h, n = 24) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = (t * Math.PI) / 2;
    out.push([s1 - h + h * Math.sin(a), r * Math.cos(a), i > 0 && i < n ? 1 : 0]);
  }
  return out;
}

// ---- Static base: a stage-riser plate on feet, drawn in the back layer and recorded as ground. ----
const back = [];
back.push(`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`);
for (const [x, y] of k.corners(PLATE, 22).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) {
  back.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
  back.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
}
back.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
back.push(Ln(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
const plateScrews = k.corners(PLATE, 10);
back.push(Ln(plateScrews.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
back.push(Dots(plateScrews.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
// ruler strip along the near (+x) edge, and a label plate
const strip = { x: PLATE.x + PLATE.w - 15, y: PLATE.y + 14, w: 7, d: PLATE.d - 28, r: 1 };
back.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
const ticks = k.topTicks(strip.y + 4, strip.y + strip.d - 4, 4, 5, strip.x + 0.8, 0.6, [2, 3.6], P, "y");
back.push(Ln(ticks.minor, { tone: "lo" }), Ln(ticks.major, { tone: "mid" }));
const labelPlate = { x: -54, y: PLATE.y + 10, w: 30, d: 14, r: 1.2 };
back.push(S(k.slabOf(labelPlate, 0, 0.8, P, 4), { tone: "lo" }));
back.push(Ln(k.planOutline(k.insetPlan(labelPlate, 1.6), 0.8, P), { tone: "faint" }));
back.push(Ln([[4, 22], [7, 18], [10, 20]].map(([dy, len]) => k.lineOnTop([labelPlate.x + 4, labelPlate.y + dy], [labelPlate.x + 4 + len, labelPlate.y + dy], 0.8, P)).join(""), { tone: "lo", free: true }));
record(A.slab(PLATE, -PLATE_H, PLATE_H, { name: "stand.plate", ground: true }));

// ---- Cabinet (stand): feet, bottom, sides, top, baffle, speaker, cleats, handle. ----
const ampFeet = k.corners({ x: CAB.x, y: CAB.y, w: CAB.w, d: CAB.d, r: 0 }, 9);
ampFeet.forEach(([x, y]) => {
  const id = nameFor("stand.foot");
  put("stand", [x, y, Z0 / 2], S(k.cylinder(x, y, 4.2, 0, Z0, P, 24), { tone: "lo" }), { name: id, shapes: [record(A.cylinder(x, y, 4.2, 0, Z0, { name: id }))] });
});
const seam = (pl, z, steps = 3) => Ln(k.sideSeam(pl, z, P, steps), { tone: "faint" });
const bottomPlan = plan(CAB.x, CAB.x + CAB.w, CAB.y, CAB.y + CAB.d, 1.5);
boxAt("stand", bottomPlan, Z0, WALL, { tone: "mid" }, { name: "stand.bottom", bevel: 0.6 });
boxAt("stand", plan(CAB.x, CAB.x + WALL, CAB.y + WALL, CAB.y + CAB.d - WALL, 0.5), Z0 + WALL, ZTOP - WALL - Z0 - WALL, { tone: "lo" }, { name: "stand.baffle" });
const sidePlanL = plan(CAB.x, CAB.x + CAB.w, CAB.y, CAB.y + WALL, 1.2);
const sidePlanR = plan(CAB.x, CAB.x + CAB.w, CAB.y + CAB.d - WALL, CAB.y + CAB.d, 1.2);
boxAt("stand", sidePlanL, Z0 + WALL, ZTOP - WALL - Z0 - WALL, { tone: "mid" }, { name: "stand.side-far" });
boxAt("stand", sidePlanR, Z0 + WALL, ZTOP - WALL - Z0 - WALL, { tone: "mid" }, { name: "stand.side-near", inner: [30, 60, 90].map((z) => seam(sidePlanR, z)).join("") });
const topPlan = plan(CAB.x, CAB.x + CAB.w, CAB.y, CAB.y + CAB.d, 1.5);
boxAt("stand", topPlan, ZTOP - WALL, WALL, { tone: "mid" }, { name: "stand.top", bevel: 0.8, extra: Ln(k.planOutline(k.insetPlan(topPlan, 4), ZTOP, P), { tone: "faint" }) });
// handle: two end blocks and a strap
for (const y of [-26, 22]) boxAt("stand", plan(-4, 4, y, y + 4, 0.8), ZTOP, 3, { tone: "lo" }, { name: "stand.handle-end" });
boxAt("stand", plan(-2.6, 2.6, -24, 24, 1.2), ZTOP + 3, 2, { tone: "lo" }, { name: "stand.handle", extra: Dots([at([0, -24, ZTOP + 5]), at([0, 24, ZTOP + 5])], { size: 0.45 }) });
// cleats carrying the chassis tray
for (const [y0, y1] of [[CAB.y + WALL, CAB.y + WALL + 4], [CAB.y + CAB.d - WALL - 4, CAB.y + CAB.d - WALL]]) boxAt("stand", plan(TRAY.x0, APRON.x0, y0, y1, 0.4), 96, 4, { tone: "lo" }, { name: "stand.cleat" });
// speaker on the baffle: basket rim and magnet, turned along +x
const SPK = G.frameOf([CAB.x + WALL, 0, 52], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
turned("stand", SPK, [[0, 30], [2.4, 30], [2.4, 24], [4, 22], [4, 0]], { tone: "lo" }, { name: "stand.speaker-rim", extra: Dots(G.dotsOf(SPK, 2.4, 27.2, 8, P, { all: true }), { size: 0.4 }) });
turned("stand", SPK, [[4, 11], [16, 11], [17, 10], [17, 0]], { tone: "mid" }, { name: "stand.magnet", inner: Ln(G.arcOf(SPK, 10, 11, P), { tone: "faint" }) });

// ---- Back panel: the lower half of the back, four screws. ----
const BACK_PLAN = plan(APRON.x0 + 1, APRON.x1 + 1.5, CAB.y + WALL + 0.2, CAB.y + CAB.d - WALL - 0.2, 0.6);
const backScrews = [[-58, 15], [58, 15], [-58, 52], [58, 52]].map(([y, z]) => at([BACK_PLAN.x + BACK_PLAN.w, y, z]));
const ventSlots = [-36, -18, 0, 18, 36]
  .map((y) => {
    const xf = BACK_PLAN.x + BACK_PLAN.w;
    const pts = [[y - 3, 22], [y + 3, 22], [y + 3, 46], [y - 3, 46]].map(([yy, zz]) => at([xf, yy, zz]));
    return `M${pts.map((p) => p.map((v) => v.toFixed(2)).join(" ")).join("L")}Z`;
  })
  .join("");
boxAt("back", BACK_PLAN, Z0 + WALL, 58 - Z0 - WALL, { tone: "mid" }, { name: "back.panel", bevel: 0.4, extra: Ln(ventSlots, { tone: "lo" }) + Dots(backScrews, { size: 0.5 }) });

// ---- Chassis: tray, apron, sockets, transformer, knobs, switch, jack, pilot lamp. ----
boxAt("chassis", plan(TRAY.x0, TRAY.x1, TRAY.y0, TRAY.y1, 0.6), TRAY.z0, TRAY.z1 - TRAY.z0, { tone: "hi" }, { name: "chassis.tray", bevel: 0.4 });
const apronPlan = plan(APRON.x0, APRON.x1, APRON.y0, APRON.y1, 0.4);
const apronScrews = [[-56, 99], [56, 99], [-56, 108], [56, 108]].map(([y, z]) => at([APRON.x1, y, z]));
boxAt("chassis", apronPlan, APRON.z0, APRON.z1 - APRON.z0, { tone: "hi" }, { name: "chassis.apron", extra: Dots(apronScrews, { size: 0.45 }) });
// transformer hanging under the tray: frame plus lamination stack
boxAt("chassis", plan(12, 30, 30, 54, 0.6), 84, 16, { tone: "mid" }, { name: "chassis.transformer", inner: [88, 92, 96].map((z) => seam(plan(12, 30, 30, 54, 0.6), z)).join("") });
// valve sockets on the tray's underside, and the valves (their own assembly) hanging from them
const DOWN = (x, y, z) => G.frameOf([x, y, z], [0, 0, -1], [1, 0, 0], [0, -1, 0]);
const VALVES = [
  { y: -30, r: 6, len: 34, name: "6V6" },
  { y: -8, r: 4, len: 26, name: "12AX7" },
  { y: 12, r: 4, len: 26, name: "12AX7" },
];
const HEAT = [];
for (const v of VALVES) {
  const F = DOWN(22, v.y, TRAY.z0);
  discAt("chassis", F, 0, 1.5, v.r + 1.6, { tone: "lo" }, { name: "chassis.socket" });
  const base = 5;
  const profile = [[1.5, v.r * 0.82], [1.5 + base, v.r * 0.82], [1.5 + base, v.r], ...domeProfile(1.5 + base, 1.5 + v.len, v.r, v.r * 0.9)];
  const slope = domeSlope(1.5 + v.len, v.r, v.r * 0.9);
  // heater glow: a warm core drawn inside the glass, faded in by the page
  const core = at(G.pointOf(F, 1.5 + base + (v.len - base) * 0.42, 0, 0));
  const rx = v.r * KS * 0.55;
  const ry = (v.len - base) * KS * 0.22;
  const heat = `<ellipse class="amp-heat" cx="${core[0].toFixed(2)}" cy="${core[1].toFixed(2)}" rx="${rx.toFixed(2)}" ry="${ry.toFixed(2)}"/>`;
  const getter = [0.3, 0.7].map((t) => G.arcOf(F, 1.5 + base + (v.len - base) * t, v.r, P)).join("");
  turned("valves", F, profile, { tone: "hi" }, { name: `valves.${v.name}`, smooth: { slope }, extra: heat, inner: Ln(getter, { tone: "faint" }) });
  HEAT.push(core);
}
// controls on the apron, turned along +x
const OUT = (y, z) => G.frameOf([APRON.x1, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
const KNOBS = [-22, -2, 18];
for (const y of KNOBS) {
  const F = OUT(y, KNOB_Z);
  const id = nameFor("chassis.knob");
  const skirt = [[0, 5.6], [1.2, 5.6], [1.2, 4.2], [6.5, 3.8], [6.5, 0]];
  turned("chassis", F, skirt, { tone: "mid" }, {
    name: id,
    extra: Ln(G.circleOf(F, 6.5, 2.4, P, 20), { tone: "faint" }) + Ln(k.segment(G.pointOf(F, 6.5, 0.6, Math.PI / 2), G.pointOf(F, 6.5, 3.4, Math.PI / 2), P), { tone: "hi", free: "end" }),
  });
}
// toggle switch: a hex bush and a bat
const TOG = OUT(-36, KNOB_Z);
discAt("chassis", TOG, 0, 1.8, 3.2, { tone: "mid" }, { name: "chassis.toggle-bush" });
turned("chassis", TOG, [[1.8, 1.2], [8, 0.9], [8.6, 1.3, 1], [9.2, 0]], { tone: "hi" }, { name: "chassis.toggle-bat" });
// input jack: nut and sleeve
const JF = G.frameOf(JACK, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
turned("chassis", JF, [[0, 4.6], [2.2, 4.6], [2.2, 3.2], [4, 3.2], [4, 0]], { tone: "mid" }, { name: "chassis.jack", extra: Ln(G.circleOf(JF, 4, 2, P, 20), { tone: "faint" }) });
// pilot lamp: chrome bezel and a domed jewel, the one lit part
const LF = G.frameOf(LAMP, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
turned("chassis", LF, [[0, 4.4], [2.6, 4.4], [2.6, 0]], { tone: "mid" }, { name: "chassis.lamp-bezel" });
turned("chassis", LF, domeProfile(2.6, 6.4, 3.3, 3.8), { tone: "hi", lit: true }, { name: "chassis.lamp-jewel", smooth: { slope: domeSlope(6.4, 3.3, 3.8) } });

// ---- Lead: plug, cable and a stompbox on the riser. ----
const PLUG = G.frameOf([JACK[0] + 4, JACK[1], JACK[2]], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
turned("lead", PLUG, [[0, 2.9], [1, 2.9], [1, 3.7], [12, 3.7], [12, 3.1], [16, 2.6], [20, 1.9], [20, 0]], { tone: "hi" }, {
  name: "lead.plug",
  inner: Ln([4, 8].map((s) => G.arcOf(PLUG, s, 3.7, P)).join(""), { tone: "faint" }),
});
const PEDAL = plan(58, 84, 86, 112, 1.6);
const PEDAL_H = 12;
boxAt("lead", PEDAL, 0, PEDAL_H, { tone: "mid" }, { name: "lead.pedal", bevel: 0.6, extra: Ln(k.planOutline(k.insetPlan(PEDAL, 2.4), PEDAL_H, P, 3), { tone: "faint" }) });
const FS = G.frameOf([66, 103, PEDAL_H], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
turned("lead", FS, [[0, 4.2], [1.6, 4.2], [1.6, 2.6], [5, 2.6], [5, 0]], { tone: "mid" }, { name: "lead.footswitch" });
const PK = G.frameOf([76, 94, PEDAL_H], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
turned("lead", PK, [[0, 3.2], [3.4, 3.2], [3.4, 0]], { tone: "mid" }, { name: "lead.pedal-knob", extra: Ln(k.lineOnTop([76, 94], [78.6, 94], PEDAL_H + 3.4, P), { tone: "hi", free: "end" }) });
const PJ = G.frameOf([71, PEDAL.y, 4.5], [0, -1, 0], [1, 0, 0], [0, 0, 1]);
turned("lead", PJ, [[0, 3.6], [2, 3.6], [2, 0]], { tone: "mid" }, { name: "lead.pedal-jack" });
// the cable: off the plug's strain relief, out, down the back, along the riser, into the pedal jack
const CABLE_R = 1.3;
const start = G.pointOf(PLUG, 20, 0, 0);
const end = G.pointOf(PJ, 2, 0, 0);
const route = G.fillet([start, [70, JACK[1], JACK[2]], [70, JACK[1], end[2]], [70, end[1] - 10, end[2]], end], 5, 12, { P, tube: CABLE_R });
R.route("lead.cable", route, CABLE_R, { piece: "lead", move: PIECES.lead.move, ride: "lead", limp: true, rims: [CABLE_R, CABLE_R] });
tubePieces(route, CABLE_R, P, { maxLength: 14, spacing: 1 }).forEach((part, index) =>
  put("lead", part.mid, tubeSvg(part, { tone: "mid" }), { bias: 0.1, name: `lead.cable:${index}`, route: "lead.cable", chunk: index, shapes: [A.tube(part.points, part.radii)] }),
);

// ---- Ticket stub clipped to the near side. ----
const TK = { x0: -28, x1: 6, z0: 60, z1: 104, y0: CAB.y + CAB.d, y1: CAB.y + CAB.d + 0.8 };
const tkPlan = plan(TK.x0, TK.x1, TK.y0, TK.y1, 0.3);
const tkFace = TK.y1;
const perf = [];
for (let x = TK.x0 + 1.5; x <= TK.x1 - 1.4; x += 2.2) perf.push(at([x, tkFace, 72]));
const rules = [[96, 26], [91, 18], [86, 22], [66, 12]].map(([z, len]) => k.segment([TK.x0 + 4, tkFace, z], [TK.x0 + 4 + len, tkFace, z], P)).join("");
const label = k.faceTextSvg(k.sideMatrix([TK.x0 + 4, tkFace], 78, P, "left"), "ADMIT ONE", { size: 3.4, tone: "mid" });
boxAt("stand", tkPlan, TK.z0, TK.z1 - TK.z0, { tone: "hi" }, { name: "stand.ticket", bevel: 0, extra: Dots(perf, { size: 0.42, tone: "lo" }) + Ln(rules, { tone: "lo", free: true }) + label });
const clipPlan = plan(-16, -2, TK.y1, TK.y1 + 2.6, 0.6);
boxAt("stand", clipPlan, 98, 14, { tone: "lo" }, { name: "stand.clip", inner: seam(clipPlan, 105) });

// ---- Settle the painter's keys from true depth, then write the page. ----
A.settle(R, P);
R.items.sort((a, b) => a.key - b.key);
const groups = R.items.map((item, index) => {
  const [mx, my, mz] = item.move;
  return `<g class="it" data-piece="${item.piece}" data-k="${item.key.toFixed(3)}" data-m="${mx.toFixed(2)},${my.toFixed(2)},${mz.toFixed(2)}" data-i="${index}">${item.svg}</g>`;
});

const unit = (vector) => {
  const o = at([0, 0, 0]);
  const p = at(vector);
  return [p[0] - o[0], p[1] - o[1]];
};
const lampAt = at(G.pointOf(LF, 6.4, 0, 0));
const DATA = { V, EX: unit([1, 0, 0]), EY: unit([0, 1, 0]), EZ: unit([0, 0, 1]), stagger: STAGGER, spring: SPRING, pieces: Object.keys(PIECES) };

const LABEL =
  "A small tweed-style guitar amp on a stage riser, seen from the open back: chassis with three knobs, a toggle, an input jack and a pilot lamp, three valves hanging from the tray, a lead from a stompbox, and a ticket stub clipped to the side.";
const figure = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${LABEL}">
<defs><radialGradient id="glow"><stop offset="0" stop-color="#fff6dc" stop-opacity="1"/><stop offset=".28" stop-color="#ffc061" stop-opacity=".85"/><stop offset=".62" stop-color="#ff9a2e" stop-opacity=".28"/><stop offset="1" stop-color="#ff9a2e" stop-opacity="0"/></radialGradient></defs>
<g class="amp-back">${back.join("")}</g><g class="amp-items">${groups.join("")}</g>
<circle class="amp-glow" cx="${lampAt[0].toFixed(2)}" cy="${lampAt[1].toFixed(2)}" r="${(12 * KS).toFixed(2)}" fill="url(#glow)"/></svg>`;

const CSS = `
html,body{margin:0;background:var(--anatomy-card)}
.iso-page{width:960px;margin:0}
.amp{width:960px;height:540px;box-sizing:border-box;padding:0;margin:0;position:relative}
.amp .iso-plate-corners{z-index:2}
.amp .iso-plate{height:540px;box-sizing:border-box;padding:0;box-shadow:none}
.amp .iso-svg{display:block;width:960px;height:540px}
.amp .iso-plate-corners{inset:22px 26px}
.amp .iso-plate-corner{font-size:12px}
.amp-heat{fill:#ff9a2e;opacity:calc(var(--heat,0) * .55);mix-blend-mode:multiply}
.amp-glow{opacity:var(--lamp,0);mix-blend-mode:multiply;pointer-events:none}
.it[data-piece="chassis"] [data-lit] .iso-top{fill:color-mix(in srgb,#ffb347 calc(var(--lamp,0) * 70%),var(--anatomy-top))}
`;
const corners = `<div class="iso-plate-corners" aria-hidden="true"><span class="iso-plate-corner" data-corner="fig">Fig 1</span><span class="iso-plate-corner" data-corner="title">Stage-door amp</span><span class="iso-plate-corner" data-corner="hint">plug in · power · take apart</span><span class="iso-plate-corner" data-corner="readout" data-readout>unplugged · cold</span></div>`;
const body = `<style>${CSS}</style><figure class="iso-figure amp"><div class="iso-plate">${corners}${figure}</div></figure>`;

// The tour as a pure function of time: events are fixed, springs are integrated from t = 0 at 240 Hz.
const LIVE = `
const D = ${JSON.stringify(DATA)};
const items = document.querySelector(".amp-items");
const svgRoot = document.querySelector(".iso-svg");
const readout = document.querySelector("[data-readout]");
const nodes = [...items.querySelectorAll(".it")].map((el) => {
  const m = el.dataset.m.split(",").map(Number);
  return { el, piece: el.dataset.piece, key: Number(el.dataset.k), m, lift: m[0] * D.V[0] + m[1] * D.V[1] + m[2] * D.V[2], shown: "" };
});
let order = nodes.map((_, i) => i);
const EVENTS = [
  { at: 1.2, set: { lead: 0 } },          // plug in
  { at: 4.7, apart: true },               // pull the lead, back off, valves out, chassis out
  { at: 8.1, apart: false },              // fold back up, lead last
];
const LAMP = [[2.7, 4.3], [10.6, 99]];   // pilot lamp on spans
const END = 12;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function sharesAt(t) {
  const st = Object.fromEntries(D.pieces.map((id) => [id, { x: id === "lead" ? 1 : 0, v: 0, target: id === "lead" ? 1 : 0, pending: null }]));
  const dt = 1 / 240;
  let clock = 0, next = 0;
  const steps = Math.round(t / dt);
  for (let n = 0; n <= steps; n++) {
    while (next < EVENTS.length && EVENTS[next].at <= clock + 1e-9) {
      const e = EVENTS[next++];
      if (e.set) for (const [id, v] of Object.entries(e.set)) { st[id].target = v; st[id].pending = null; }
      else {
        const goal = e.apart ? 1 : 0; let i = 0;
        for (const id of e.apart ? D.stagger : [...D.stagger].reverse()) {
          if (st[id].target === goal) st[id].pending = null;
          else st[id].pending = { value: goal, at: clock + i++ * D.spring.stagger };
        }
      }
    }
    if (n === steps) break;
    for (const id of D.pieces) {
      const s = st[id];
      if (s.pending && clock >= s.pending.at - 1e-9) { s.target = s.pending.value; s.pending = null; }
      for (let j = 0; j < D.spring.substeps; j++) {
        const h = dt / D.spring.substeps;
        s.v += ((s.target - s.x) * D.spring.stiffness - s.v * D.spring.damping) * h;
        s.x += s.v * h;
      }
      if (Math.abs(s.target - s.x) < 2e-4 && Math.abs(s.v) < 2e-4) { s.x = s.target; s.v = 0; }
    }
    clock += dt;
  }
  return st;
}
function lampAt(t) {
  let v = 0;
  for (const [on, off] of LAMP) v = Math.max(v, smooth(on, on + 0.18, t) * (1 - smooth(off, off + 0.35, t)));
  return v;
}
function heatAt(t) {
  let v = 0;
  for (const [on, off] of LAMP) v = Math.max(v, smooth(on + 0.2, on + 1.6, t) * (1 - smooth(off, off + 0.9, t)));
  return v;
}
function say(st, t) {
  const moving = D.pieces.some((id) => st[id].x !== st[id].target || st[id].pending);
  const allOut = D.stagger.slice(0, 4).every((id) => st[id].x === 1);
  let text;
  if (allOut) text = "apart · 4 assemblies";
  else if (moving && t > 8) text = "closing up";
  else if (moving && t > 4.6) text = "taking apart";
  else if (st.lead.x > 0.98) text = "unplugged · cold";
  else if (st.lead.x > 0.02) text = "plugging in";
  else if (lampAt(t) > 0.5) text = "on · one 6V6 · 5 W";
  else text = "plugged in · cold";
  if (readout.textContent !== text) readout.textContent = text;
}
function seek(t) {
  t = Math.max(0, Math.min(END, t));
  const st = sharesAt(t);
  for (const node of nodes) {
    const share = st[node.piece].x;
    const tx = (D.EX[0] * node.m[0] + D.EY[0] * node.m[1] + D.EZ[0] * node.m[2]) * share;
    const ty = (D.EX[1] * node.m[0] + D.EY[1] * node.m[1] + D.EZ[1] * node.m[2]) * share;
    const text = share === 0 ? "" : "translate(" + tx.toFixed(2) + " " + ty.toFixed(2) + ")";
    if (text !== node.shown) { node.shown = text; if (text) node.el.setAttribute("transform", text); else node.el.removeAttribute("transform"); }
  }
  const next = nodes.map((_, i) => i).sort((a, b) => nodes[a].key + nodes[a].lift * st[nodes[a].piece].x - (nodes[b].key + nodes[b].lift * st[nodes[b].piece].x));
  if (next.some((i, j) => i !== order[j])) { const f = document.createDocumentFragment(); for (const i of next) f.appendChild(nodes[i].el); items.appendChild(f); order = next; }
  const lamp = lampAt(t);
  svgRoot.style.setProperty("--lamp", lamp.toFixed(3));
  svgRoot.style.setProperty("--heat", heatAt(t).toFixed(3));
  // the glow rides with the chassis
  const c = st.chassis.x * 40;
  document.querySelector(".amp-glow").setAttribute("transform", c ? "translate(" + (D.EX[0] * c).toFixed(2) + " " + (D.EX[1] * c).toFixed(2) + ")" : "");
  say(st, t);
  return t;
}
window.__duration = END;
window.__seek = (t) => { window.__hold = true; return seek(t); };
window.__ready = Promise.resolve(true);
const q = new URLSearchParams(location.search);
if (q.has("t")) seek(Number(q.get("t")));
else if (!q.has("still")) {
  // in a browser, play the tour on the wall clock (the render never uses this)
  const t0 = performance.now();
  const loop = (now) => { if (!window.__hold) seek(((now - t0) / 1000) % END); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
} else seek(0);
`;

const page = k.pageHtml({ title: "Stage-door amp", theme: THEME, body, script: kitScript() + LIVE, width: 960 });
const outName = THEME === "dark" ? "amp-dark.html" : "amp.html";
writeFileSync(join(HERE, outName), page);
console.log("wrote", outName, `${(page.length / 1024).toFixed(0)} KB`, `${R.items.length} items`, `${R.solids.length} solids`);

A.auditOrExit(R, P, { crowd: [] });
