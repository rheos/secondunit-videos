// Stills of the cast line-up, from lineup.html in headless Chrome.
//   node tools/lineup.mjs                 every deliverable still, then sheet.jpg
//   node tools/lineup.mjs hand-open ...   only the named stills (debug-2d, debug-cap, hand-top, pinch-open and seed-close are working views)
// env: OUT (folder, default ../../out/paper-world/lineup), SAMPLES (light samples a panel, default 28), SHEET=0 to skip the sheet.
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import { createRequire } from "node:module"; import { execFileSync } from "node:child_process";
const here = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const require = createRequire(path.join(here, "package.json")); const { chromium } = require("playwright");
const OUT = process.env.OUT || path.resolve(here, "../../out/paper-world/lineup"); fs.mkdirSync(OUT, { recursive: true });
const REF = path.resolve(here, "../../out/papersilhouette/check");          // test 01's stills, for the before / after pairs
const ALL = ["guard-lineup", "guard-cap-crop", "guard-small", "guard-turn", "hand-open", "hand-open-curl", "hand-pinch", "hand-before-after", "pine-stages"];
const names = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
const types = { ".html": "text/html", ".js": "text/javascript", ".jpg": "image/jpeg" };
const srv = http.createServer((q, s) => {
  const u = decodeURIComponent(q.url.split("?")[0]); if (u === "/favicon.ico") { s.writeHead(204); s.end(); return; }
  const f = u.startsWith("/_ref/") ? path.join(REF, path.basename(u)) : path.join(here, u);
  fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); } else { s.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" }); s.end(d); } });
}).listen(0);
const port = srv.address().port;
const b = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "--mute-audio"] });
const pg = await b.newPage({ viewport: { width: 720, height: 1280 } });
pg.on("pageerror", (e) => console.log("PAGEERROR", e.message, (e.stack || "").split("\n").slice(0, 4).join(" | ")));
pg.on("console", (m) => { if (["error", "warning"].includes(m.type()) && !/GPU stall/i.test(m.text())) console.log("CONSOLE", m.text().slice(0, 400)); });
await pg.goto(`http://127.0.0.1:${port}/lineup.html?still=${names[0]}&samples=${process.env.SAMPLES || 28}`);
await pg.waitForFunction("window.ready===true", null, { timeout: 240000 });
for (const [i, name] of names.entries()) {
  const t0 = Date.now();
  const d = await pg.evaluate(async ([n, first]) => { if (!first) await window.renderStill(n); return document.getElementById("c").toDataURL("image/jpeg", 0.93); }, [name, i === 0]);
  fs.writeFileSync(path.join(OUT, name + ".jpg"), Buffer.from(d.split(",")[1], "base64"));
  console.log(name + ".jpg", ((Date.now() - t0) / 1000).toFixed(1) + " s");
}
await b.close(); srv.close();
// the contact sheet: every deliverable still that exists, each fitted into a 720x1280 cell, tiled 3 wide
if (process.env.SHEET !== "0" && ALL.every((n) => fs.existsSync(path.join(OUT, n + ".jpg")))) {
  const args = ["-y", "-loglevel", "error"]; for (const n of ALL) args.push("-i", path.join(OUT, n + ".jpg"));
  const cell = ALL.map((_, i) => `[${i}:v]scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:color=0xf3e8d2,setsar=1[c${i}]`).join(";");
  args.push("-filter_complex", `${cell};${ALL.map((_, i) => `[c${i}]`).join("")}xstack=inputs=9:layout=0_0|720_0|1440_0|0_1280|720_1280|1440_1280|0_2560|720_2560|1440_2560[o]`, "-map", "[o]", "-frames:v", "1", "-q:v", "3", path.join(OUT, "sheet.jpg"));
  execFileSync("ffmpeg", args); console.log("sheet.jpg");
}
