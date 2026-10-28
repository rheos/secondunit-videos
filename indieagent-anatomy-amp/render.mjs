// Render amp.html's tour as video: frame i = __seek(i / fps), screenshotted at 1920x1080 (960x540 at 2x).
//   node render.mjs                        all frames -> out/frames, then out/amp-tour_720p.mp4
//   node render.mjs --shots 0,3.5,6.8      stills only -> out/shots/t<sec>.png
//   node render.mjs --page amp-dark.html   another page
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

function loadPlaywright() {
  // this folder, its siblings, or (from a worktree) the projects in the main mv-projects checkout
  const main = path.resolve("../../mv-projects");
  const dirs = [process.cwd(), ...fs.readdirSync("..").map((d) => path.resolve("..", d)), ...(fs.existsSync(main) ? fs.readdirSync(main).map((d) => path.join(main, d)) : [])];
  for (const d of dirs) {
    try {
      if (fs.existsSync(path.join(d, "node_modules", "playwright"))) return createRequire(path.join(d, "noop.js"))("playwright");
    } catch {}
  }
  throw new Error("no playwright in this folder or any sibling project");
}
const { chromium } = loadPlaywright();
const args = process.argv.slice(2);
const opt = (key, fallback) => {
  const i = args.indexOf("--" + key);
  return i >= 0 ? args[i + 1] : fallback;
};
const pageFile = path.resolve(opt("page", "amp.html"));
const FPS = Number(opt("fps", 24));
const shots = opt("shots", null);

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(`file://${pageFile}?still=1`);
await page.evaluate(() => window.__ready);
const duration = await page.evaluate(() => window.__duration);
const shoot = async (t, file) => {
  await page.evaluate((x) => window.__seek(x), t);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 960, height: 540 } });
};

if (shots) {
  const dir = path.resolve("out/shots");
  fs.mkdirSync(dir, { recursive: true });
  for (const t of shots.split(",").map(Number)) await shoot(t, path.join(dir, `t${t.toFixed(2)}.png`));
  console.log("shots in", dir);
} else {
  const dir = path.resolve("out/frames");
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const n = Math.round(duration * FPS);
  const t0 = Date.now();
  for (let i = 0; i < n; i++) await shoot(i / FPS, path.join(dir, String(i + 1).padStart(4, "0") + ".png"));
  console.log(`${n} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  const out = path.resolve("out/amp-tour_720p.mp4");
  execFileSync("ffmpeg", ["-nostdin", "-loglevel", "error", "-y", "-framerate", String(FPS), "-i", path.join(dir, "%04d.png"), "-vf", "scale=1280:720:flags=lanczos,format=yuv420p", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-maxrate", "4.5M", "-bufsize", "9M", "-movflags", "+faststart", "-an", out]);
  console.log("wrote", out);
}
await browser.close();
if (errors.length) console.log("PAGE ERRORS:\n" + [...new Set(errors)].join("\n"));
