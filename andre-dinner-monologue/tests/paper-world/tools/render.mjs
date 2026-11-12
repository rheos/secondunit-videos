// render.mjs: film frames from index.html in headless Chrome (Metal). Adapted from render-frames.reference.mjs.
//   FRAMES="1800-2543" OUT=../../out/paper-world/frames node tools/render.mjs      (run from tests/paper-world/)
// FRAMES takes "a-b", "a,b,c" or "a-b:step"; RESUME=1 skips frames already on disk; N = sub-renders a frame (default 10);
// W, H default 720x1280; PNG=1 for PNG; SPEED=1 prints the camera speed table and draws nothing; PX=1 prints figure heights;
// BLOCKING=<file> writes blocking.json (for FRAMES=a-b, or the whole film) and draws nothing. SKIN=1 renders the painted cards (test 04); SKIN=1 T3=1 renders test 03 as delivered.
// CAM="px,py,pz,tx,ty,tz" overrides the camera (check stills only).
// NAMES=1 (with SKIN=1) prints the registry: every piece, its section, its kind and its setters; NAMES=2 lists the parts too.
// SECTION=NN: stop (exit 2) if that section's module or skin failed to load. A section that fails is replaced by its stub
// and the rest of the film still renders; every failure is printed as "SECTION NN FAILED".
// Several runs at once are safe: each has its own port and its own Chrome profile, and a frame is written under a
// temporary name and renamed, so a half-written file is never seen. Give each run its own OUT.
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import { createRequire } from "node:module";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const require = createRequire(process.env.PW_FROM || path.join(root, "package.json"));
const { chromium } = require("playwright");
const OUT = process.env.OUT || path.join(root, "../../out/paper-world/frames");
const types = { ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg" };
const srv = http.createServer((q, s) => { if (q.url.startsWith("/favicon")) { s.writeHead(204); s.end(); return; } const f = path.join(root, decodeURIComponent(q.url.split("?")[0])); fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); } else { s.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream", "cache-control": "no-store" }); s.end(d); } }); }).listen(0);
const port = srv.address().port;
const W = +(process.env.W || 720), H = +(process.env.H || 1280), N = +(process.env.N || 10);
const list = (process.env.FRAMES || "1800").split(",").flatMap((p) => { const [range, step] = p.split(":"), m = range.split("-"); if (m.length === 1) return [+range]; const a = []; for (let i = +m[0]; i <= +m[1]; i += +(step || 1)) a.push(i); return a; });
const b = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "--mute-audio", "--force_high_performance_gpu"] });
const pg = await b.newPage({ viewport: { width: W, height: H } });
let bad = 0;
pg.on("pageerror", (e) => { bad++; console.log("PAGEERROR", e.message); });
pg.on("console", (m) => { if (["error", "warning"].includes(m.type()) && !/GPU stall/i.test(m.text())) console.log("CONSOLE", m.text().slice(0, 600)); });
await pg.goto(`http://127.0.0.1:${port}/index.html?w=${W}&h=${H}&n=${N}&still=1${process.env.LINEUP ? "&lineup=1" : ""}${process.env.SKIN ? "&skin=1" : ""}${process.env.T3 ? "&t3=1" : ""}${process.env.CAM ? "&cam=" + process.env.CAM : ""}${process.env.NOSLOTS ? "&noslots=1" : ""}${process.env.GLASS1 ? "&glass1=1" : ""}`);
await pg.waitForFunction("window.ready===true", null, { timeout: 180000 });
const SECTION = process.env.SECTION ? +process.env.SECTION : 0, seen = new Set();
const failures = async () => { let mine = false; for (const x of await pg.evaluate(() => window.paperFailed())) { if (x.section === SECTION) mine = true; const k = x.section + x.part; if (seen.has(k)) continue; seen.add(k);
  console.log(`SECTION ${String(x.section).padStart(2, "0")} FAILED (${x.part}): ${x.error.split("\n")[0]}`); } return mine; };
if (await failures() && SECTION) { console.log(`section ${SECTION} did not load: stopping`); await b.close(); srv.close(); process.exit(2); }
if (process.env.NAMES) {
  const rows = await pg.evaluate(() => window.paperNames()), parts = +process.env.NAMES > 1;
  for (const s of await pg.evaluate(() => window.paperSections())) console.log(`section ${String(s.n).padStart(2)}  f${s.F0}-f${s.F1}  ${s.stub ? "FELL BACK TO ITS STUB" : `${s.cues} cues, ${s.beats} beats`}`);
  for (const r of rows) if (parts || r.kind !== "part") console.log(`${String(r.section).padStart(2)}  ${r.kind.padEnd(8)} ${r.name.padEnd(30)} ${r.kind === "part" ? "(part of " + r.of + ")" : r.set.join(", ")}`);
  console.log(`${rows.filter((r) => r.kind !== "part").length} pieces, ${rows.filter((r) => r.kind === "part").length} parts`);
} else if (process.env.BLOCKING) {
  const json = await pg.evaluate(([a, b]) => window.exportBlocking(a, b), process.env.FRAMES ? [list[0], list[list.length - 1] + 1] : [undefined, undefined]);      // FRAMES=a-b exports that range; without it, the whole film so far
  fs.mkdirSync(path.dirname(process.env.BLOCKING), { recursive: true }); fs.writeFileSync(process.env.BLOCKING, json);
  const o = JSON.parse(json); console.log(`blocking: ${Object.keys(o.objects).length} objects, ${o.camera.frames.length} camera frames, ${(json.length / 1e6).toFixed(1)} MB -> ${process.env.BLOCKING}`);
} else if (process.env.SPEED) {
  // the camera path: cm a frame, degrees a frame of the view direction, and any dead stop or jump
  const cams = await pg.evaluate((fs) => fs.map((f) => window.camInfo(f)), list);
  const dir = (c) => { const d = c.T.map((v, i) => v - c.P[i]), l = Math.hypot(...d); return d.map((v) => v / l); };
  let minV = 1e9, maxV = 0, maxA = 0, flags = [], rows = [];
  for (let i = 1; i < cams.length; i++) {
    const a = cams[i - 1], c = cams[i], v = Math.hypot(...c.P.map((x, k) => x - a.P[k])), da = dir(a), dc = dir(c), ang = Math.acos(Math.min(1, da[0] * dc[0] + da[1] * dc[1] + da[2] * dc[2])) * 180 / Math.PI;
    const dist = Math.hypot(...c.T.map((x, k) => x - c.P[k])), dDist = dist - Math.hypot(...a.T.map((x, k) => x - a.P[k]));
    const pv = rows.length ? rows[rows.length - 1].v : v, acc = v - pv;
    rows.push({ f: c.f, v, ang, acc, y: c.P[1], dist });
    minV = Math.min(minV, v); maxV = Math.max(maxV, v); maxA = Math.max(maxA, Math.abs(acc));
    if (v < 0.05) flags.push(`f${c.f} slow ${v.toFixed(3)} cm/frame`);
    if (Math.abs(acc) > Math.max(0.35, 0.3 * pv)) flags.push(`f${c.f} jump: speed ${pv.toFixed(2)} -> ${v.toFixed(2)}`);
    if (v < 0.02 && Math.abs(dDist) > 0.05) flags.push(`f${c.f} zoom-only`);
  }
  for (const r of rows) if ((r.f - list[0]) % (+process.env.SPEED > 1 ? +process.env.SPEED : 12) === 0) console.log(`f${r.f}  ${r.v.toFixed(3)} cm/f  turn ${r.ang.toFixed(2)} deg/f  height ${r.y.toFixed(1)}  to target ${r.dist.toFixed(1)}  ${"#".repeat(Math.min(60, Math.round(r.v * 12)))}`);
  console.log(`camera speed: min ${minV.toFixed(3)}  max ${maxV.toFixed(2)} cm/frame; largest change ${maxA.toFixed(3)} cm/frame^2; ${flags.length ? "FLAGS:\n" + flags.join("\n") : "no dead stops, no jumps"}`);
} else if (process.env.PX) {
  for (const f of list) console.log(`f${f}`, JSON.stringify(await pg.evaluate((f) => window.figurePx(f), f)));
} else {
  fs.mkdirSync(OUT, { recursive: true });
  console.log("renderer", await pg.evaluate(() => { const g = document.getElementById("c").getContext("webgl2"); const e = g.getExtension("WEBGL_debug_renderer_info"); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : "?"; }));
  let n = 0; const t0 = Date.now();
  for (const f of list) {
    const name = path.join(OUT, `f${String(f).padStart(4, "0")}.${process.env.PNG ? "png" : "jpg"}`);
    if (process.env.RESUME && fs.existsSync(name)) continue;
    const d = await pg.evaluate(([fr, png]) => { window.renderFrame(fr); return document.getElementById("c").toDataURL(png ? "image/png" : "image/jpeg", 0.95); }, [f, !!process.env.PNG]);
    fs.writeFileSync(name + ".part", Buffer.from(d.split(",")[1], "base64")); fs.renameSync(name + ".part", name); n++;
    if (process.env.VERBOSE || n % 25 === 0) console.log(`${n}/${list.length} f${f} ${(Date.now() - t0) / n | 0} ms/frame`);
  }
  console.log(`done ${n} frames ${(Date.now() - t0) / Math.max(n, 1) | 0} ms/frame`);
}
const mine = await failures();
await b.close(); srv.close();
if (bad) process.exit(1);
if (mine && SECTION) process.exit(2);
