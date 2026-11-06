// Copies the two third-party pieces the diagram layer needs into vendor/, as plain scripts a page can load
// with <script src> from file:// (no bundler, no modules):
//   pele.global.js  window.pele  (MIT, obsidianmd/pele; its own browser build, copied unchanged)
//   hershey.js      window.HERSHEY  (A. V. Hershey's 1967 letters, public domain, as packaged by hersheytext, MIT)
// Run after changing either version in package.json: npm install && npm run vendor
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const mod = (p) => path.join(here, '..', 'node_modules', p);
const pkg = (name) => JSON.parse(fs.readFileSync(mod(`${name}/package.json`), 'utf8')).version;

fs.copyFileSync(mod('pele/dist/pele.global.js'), path.join(here, 'pele.global.js'));

// Only the faces the plates letter in: Serif (timesr) for names, Serif italic (timesi) for notes.
// Glyphs are SVG path data in Hershey units, y down, cap top at y=1 and baseline at y=22; the advance is 2*o.
// chars[i] is character code 33 + i; the space is not in the data.
const all = JSON.parse(fs.readFileSync(mod('hersheytext/hersheytext.json'), 'utf8'));
const faces = { serif: 'timesr', italic: 'timesi' };
const out = {};
for (const [k, src] of Object.entries(faces)) out[k] = { source: src, name: all[src].name, chars: all[src].chars.map((c) => [c.d, c.o]) };
fs.writeFileSync(path.join(here, 'hershey.js'),
  `/* Hershey letters (A. V. Hershey, 1967; public domain) as packaged by hersheytext ${pkg('hersheytext')}` +
  ` (MIT, Copyright (c) 2014 James T; see LICENSE-hersheytext.md). Built by vendor/build.mjs. */\n` +
  `window.HERSHEY = ${JSON.stringify(out)};\n`);

fs.writeFileSync(path.join(here, 'LICENSE-pele.md'),
  `# pele ${pkg('pele')}\n\nhttps://github.com/obsidianmd/pele, copied unchanged as \`pele.global.js\`.\n\n\`\`\`\n` +
  fs.readFileSync(mod('pele/LICENSE'), 'utf8').trim() + '\n```\n');
fs.writeFileSync(path.join(here, 'LICENSE-hersheytext.md'),
  `# hersheytext ${pkg('hersheytext')}\n\nhttps://github.com/techninja/hersheytext. \`hershey.js\` holds two of its faces.\n` +
  `The Hershey font data is public domain (the package's README: "JSON data Public Domain, All other code MIT Licensed").\n` +
  `The packaging is MIT:\n\n\`\`\`\n` + fs.readFileSync(mod('hersheytext/LICENSE'), 'utf8').trim() + '\n```\n');
console.log(`vendor: pele ${pkg('pele')}, hersheytext ${pkg('hersheytext')} (${Object.values(faces).join(', ')})`);
