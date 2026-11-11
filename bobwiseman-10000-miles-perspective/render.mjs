// Frames from the page in headless Chrome. FRAMES="0,100,200" or "0-299"; OUT = folder; RESUME=1 skips existing.
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import { createRequire } from "node:module";
const here = path.dirname(new URL(import.meta.url).pathname);
const require = createRequire(process.env.PW_FROM || "/Users/robin/Code/novadiem/indieagent/secondunit/_wt-atom/achbar-atom-reel/package.json");
const { chromium } = require("playwright");
const OUT = process.env.OUT || path.join(here, "out/frames"); fs.mkdirSync(OUT, { recursive: true });
const types = { ".html": "text/html", ".js": "text/javascript" };
const srv = http.createServer((q, s) => { const f = path.join(here, decodeURIComponent(q.url.split("?")[0])); fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); } else { s.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" }); s.end(d); } }); }).listen(0);
const port = srv.address().port;
const W = +(process.env.W || 1280), H = +(process.env.H || 720);
const list = (process.env.FRAMES || "0").split(",").flatMap((p) => { const m = p.split("-"); if (m.length === 1) return [+p]; const a = []; for (let i = +m[0]; i <= +m[1]; i++) a.push(i); return a; });
const b = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "--mute-audio"] });
const pg = await b.newPage({ viewport: { width: W, height: H } });
pg.on("pageerror", (e) => console.log("PAGEERROR", e.message));
pg.on("console", (m) => { if (["error", "warning"].includes(m.type()) && !/GPU stall/i.test(m.text())) console.log("CONSOLE", m.text().slice(0, 400)); });
await pg.goto(`http://127.0.0.1:${port}/index.html?w=${W}&h=${H}`);
await pg.waitForFunction("window.ready===true", null, { timeout: 180000 });
console.log("renderer", await pg.evaluate(() => { const g = document.getElementById("c").getContext("webgl2"); const e = g.getExtension("WEBGL_debug_renderer_info"); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : "?"; }));
let n = 0; const t0 = Date.now();
for (const f of list) {
  const name = path.join(OUT, `f${String(f).padStart(4, "0")}.${process.env.PNG ? "png" : "jpg"}`);
  if (process.env.RESUME && fs.existsSync(name)) continue;
  const [N, d] = await pg.evaluate(([fr, png]) => { const N = window.renderFrame(fr); return [N, document.getElementById("c").toDataURL(png ? "image/png" : "image/jpeg", 0.95)]; }, [f, !!process.env.PNG]);
  fs.writeFileSync(name, Buffer.from(d.split(",")[1], "base64")); n++;
  if (process.env.VERBOSE || n % 25 === 0) console.log(`${n}/${list.length} f${f} N=${N} ${(Date.now() - t0) / n | 0} ms/frame`);
}
console.log(`done ${n} frames ${(Date.now() - t0) / Math.max(n, 1) | 0} ms/frame`);
await b.close(); srv.close();
