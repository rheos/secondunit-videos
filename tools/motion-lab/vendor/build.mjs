// build.mjs · bundle Remotion's MIT helper packages into IIFE files a Canvas look loads with one <script> tag.
//
//   cd tools/motion-lab/vendor && npm install && npm run build
//
// Three bundles, each setting one window global: RPaths (@remotion/paths), RNoise (@remotion/noise),
// RShapes (@remotion/shapes, make* functions only). Versions are pinned in package.json; the entries are
// in src/. After the build the metafile is summed per package so README.md can say what came from where,
// since anything from the core remotion package is under the Remotion licence, not MIT.
import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const version = require('@remotion/paths/package.json').version;
for (const p of ['@remotion/noise', '@remotion/shapes']) {
  const v = require(`${p}/package.json`).version;
  if (v !== version) { console.error(`${p} is ${v}, @remotion/paths is ${version}: pin them to one version`); process.exit(1); }
}

// A stand-in for imports the kept code reaches only to build metadata. @remotion/shapes declares its
// React components and their Interactive schemas at module top level (spreads of Interactive.baseSchema,
// Interactive.withSchema(...) calls), so an empty stub throws at load. This one reads the names the
// package imports from each stubbed module and exports every one as a callable, spreadable nothing;
// the smoke test below proves the make* output is unaffected. Nothing from React or the remotion main
// entry ends up in the bundle.
const stub = (names, fromPkg) => ({
  name: 'stub',
  setup(b) {
    const src = fs.readFileSync(path.join(path.dirname(require.resolve(`${fromPkg}/package.json`)), require(`${fromPkg}/package.json`).module), 'utf8');
    const re = new RegExp(`^(${names.map((n) => n.replace(/[/]/g, '\\/')).join('|')})$`);
    b.onResolve({ filter: re }, (a) => ({ path: a.path, namespace: 'stub' }));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, (a) => {
      const wanted = new Set();
      for (const m of src.matchAll(new RegExp(`import\\s+([^;]*?)\\s+from\\s+["']${a.path.replace(/[/]/g, '\\/')}["']`, 'g'))) {
        const clause = m[1], braces = clause.match(/\{([^}]*)\}/);
        if (braces) for (const part of braces[1].split(',')) { const n = part.trim().split(/\s+as\s+/)[0].trim(); if (n) wanted.add(n); }
        if (/^[A-Za-z_$][\w$]*\s*(,|$)/.test(clause.trim())) wanted.add('default');
      }
      const any = 'const any = new Proxy(function () { return any; }, { get: (f, k) => (k === Symbol.toPrimitive ? () => "" : any) });';
      return { loader: 'js', contents: any + [...wanted].map((n) => (n === 'default' ? 'export default any;' : `export const ${n} = any;`)).join('') };
    });
  },
});

const bundles = [
  { name: 'paths', global: 'RPaths', pkg: '@remotion/paths', licence: 'LICENSE-paths.md' },
  // @remotion/noise imports random() from the remotion main entry, which carries React; remotion/no-react has the same random()
  { name: 'noise', global: 'RNoise', pkg: '@remotion/noise', licence: 'LICENSE-noise.md', alias: { remotion: 'remotion/no-react' } },
  { name: 'shapes', global: 'RShapes', pkg: '@remotion/shapes', licence: 'LICENSE-shapes.md', plugins: [stub(['react', 'react-dom', 'react/jsx-runtime', 'remotion'], '@remotion/shapes')] },
];

const rows = [];
for (const b of bundles) {
  const out = path.join(here, `remotion-${b.name}.min.js`);
  const r = await esbuild.build({
    entryPoints: [path.join(here, 'src', `${b.name}.entry.mjs`)],
    bundle: true, minify: true, format: 'iife', globalName: b.global, target: 'es2020', platform: 'browser',
    legalComments: 'none', metafile: true, outfile: out,
    banner: { js: `/* ${b.pkg} ${version} (MIT) as window.${b.global}. Built by tools/motion-lab/vendor/build.mjs; licences beside it: ${b.licence}, LICENSE-remotion.md. */` },
    alias: b.alias, plugins: b.plugins,
  });
  // sum the output bytes per package, from the metafile
  const o = Object.values(r.metafile.outputs)[0];
  const by = {};
  for (const [file, { bytesInOutput }] of Object.entries(o.inputs)) {
    const m = file.match(/node_modules\/((?:@[^/]+\/)?[^/]+)(?:\/(dist\/esm\/no-react\.mjs))?/);
    const key = m ? (m[2] ? `${m[1]} (${m[2]})` : m[1]) : 'entry';
    by[key] = (by[key] || 0) + bytesInOutput;
  }
  const total = fs.statSync(out).size;
  rows.push({ file: path.basename(out), global: b.global, total, by });
  console.log(`${path.basename(out)}  ${(total / 1024).toFixed(1)} KB  window.${b.global}`);
  for (const [k, v] of Object.entries(by).sort((a, c) => c[1] - a[1])) console.log(`    ${(v / 1024).toFixed(1).padStart(6)} KB  ${k}`);
}
fs.writeFileSync(path.join(here, 'manifest.json'), JSON.stringify({ remotion: version, esbuild: esbuild.version, built: new Date().toLocaleDateString('en-CA'), bundles: rows }, null, 2) + '\n');

// Smoke test: every exported function runs and returns the right shape of thing.
const w = {}; globalThis.window = w;
for (const b of bundles) {
  const src = fs.readFileSync(path.join(here, `remotion-${b.name}.min.js`), 'utf8');
  new Function('window', src.replace(/^var (\w+)=/m, 'window.$1='))(w);   // the IIFE assigns var RPaths=...; hand it to our window
}
const { RPaths, RNoise, RShapes } = w;
const star = RShapes.makeStar({ innerRadius: 40, outerRadius: 100, points: 5 });
if (!/^M/.test(star.path) || !(star.width > 0)) throw new Error('makeStar');   // width is the tight box, not 2 x outerRadius
for (const f of ['makeHeart', 'makePie', 'makePolygon', 'makeCircle', 'makeRect', 'makeEllipse', 'makeTriangle', 'makeArrow', 'makeCallout', 'makeSpark']) {
  const args = { makeHeart: { height: 100 }, makePie: { radius: 50, progress: 0.3 }, makePolygon: { points: 6, radius: 50 }, makeCircle: { radius: 50 }, makeRect: { width: 10, height: 20 },
    makeEllipse: { rx: 10, ry: 20 }, makeTriangle: { length: 50, direction: 'up' }, makeArrow: {},
    makeCallout: {}, makeSpark: {} }[f];
  const s = RShapes[f](args); if (typeof s.path !== 'string' || !s.path) throw new Error(f);
}
const L = RPaths.getLength(star.path); if (!(L > 0)) throw new Error('getLength');
const pt = RPaths.getPointAtLength(star.path, L / 2), tg = RPaths.getTangentAtLength(star.path, L / 2);
if (![pt.x, pt.y, tg.x, tg.y].every(Number.isFinite)) throw new Error('point/tangent');
const ev = RPaths.evolvePath(0.5, star.path); if (typeof ev.strokeDasharray !== 'string') throw new Error('evolvePath');
const heart = RShapes.makeHeart({ height: 200 }).path;
if (!/^M/.test(RPaths.interpolatePath(0.5, star.path, heart))) throw new Error('interpolatePath');
const bb = RPaths.getBoundingBox(star.path); if (!(bb.width > 0)) throw new Error('getBoundingBox');
RPaths.cutPath(star.path, L / 3); RPaths.translatePath(star.path, 10, 10); RPaths.scalePath(star.path, 2, 2);
RPaths.warpPath(star.path, ({ x, y }) => ({ x: x + Math.sin(y / 10), y }));
const n = RNoise.noise2D('cam', 0.3, 0.7); if (!(Math.abs(n) <= 1) || n !== RNoise.noise2D('cam', 0.3, 0.7)) throw new Error('noise2D');
if (!Number.isFinite(RNoise.noise3D(7, 1, 2, 3)) || !Number.isFinite(RNoise.noise4D(7, 1, 2, 3, 4))) throw new Error('noise3D/4D');
console.log(`smoke test ok: star length ${L.toFixed(1)}, noise2D('cam', 0.3, 0.7) = ${n.toFixed(4)}`);
