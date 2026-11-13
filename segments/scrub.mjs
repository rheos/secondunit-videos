// scrub.mjs: check that no segment carries material from a client film.
//   node segments/scrub.mjs [--lyrics <dir> ...]
// Exit 0 and "clean" when every check passes; exit 1 with every hit listed otherwise.
//
// Checks, on every file in every segments/<slug>/ (node_modules and out skipped):
//   1. names: artists, clients and their songs, and the film folders' names (taken from this repo's own top level)
//   2. paths: anything that reaches out of the segment (../), into a film folder, or at stems, footage or source audio
//   3. media: no image, audio or video file byte-identical to one in the repo outside segments/
//   4. lyrics: no run of 5 words from any lyric file under the --lyrics folders (lyrics are gitignored, so they live
//      only in local checkouts; point --lyrics at one, e.g. ~/Code/novadiem/indieagent/secondunit/mv-projects)
// The lists are deliberately blunt: a hit is for a person to look at, then either fix the segment or, if the word is
// innocent, add it to ALLOW with a reason.
import fs from 'fs'; import path from 'path'; import crypto from 'crypto'; import { fileURLToPath } from 'url';

const SEG = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.dirname(SEG);
const args = process.argv.slice(2), lyricRoots = [];
for (let i = 0; i < args.length; i++) if (args[i] === '--lyrics') lyricRoots.push(path.resolve(args[++i].replace(/^~/, process.env.HOME)));

// 1. names. Artists and clients by name, then song and film titles, then every film folder's own name.
const NAMES = [
  'bob wiseman', 'wiseman', 'hjeron', 'pnubb', 'gemma luna', 'gemmaluna', 'arowyn', 'mel muniz', 'melmuniz', "o'hara",
  'mary margaret', 'the wyrd one', 'airplane on the highway', 'travel agent', 'mind the sheep', 'dark blues', 'we got time',
  'dream of fire', 'all the trees', 'in her dream', 'satisfied mind', 'reform party', 'giulietta masina', 'me and jimi',
  "you don't love me", 'holiday tavern', 'real thing', 'clap hands', 'hasta la raiz', '10000 miles', '10,000 miles',
];
const FILM_PREFIXES = ['bobwiseman-', 'hjeron-', 'pnubb-', 'gemmaluna-', 'arowyn-', 'melmuniz-', '_hjeron-'];
const filmFolders = fs.readdirSync(ROOT).filter((d) => FILM_PREFIXES.some((p) => d.startsWith(p)));
// innocent matches: [file suffix, word, reason]
const ALLOW = [];

// 2. paths
const PATHS = [/\.\.\//, /\bsource\//, /\b_in\//, /\b(vocal|drum|bass|music)[ _-]?stems?\b/i, /\bstems?\//i, /vocals?\.wav/i, /\.(wav|mp3|m4a|flac)\b/i, /\bfootage\b/i, /\blyrics?\.js\b/i, /\bLYR\b/];

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'out' || e.name === '.DS_Store') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else files.push(p);
  }
})(SEG);
const isText = (f) => /\.(js|mjs|json|html|md|txt|yml|yaml|css|gitignore)$|\/\.gitignore$/.test(f);
const isMedia = (f) => /\.(png|jpe?g|webp|gif|mp4|mov|webm|wav|mp3|m4a|flac)$/i.test(f);
const rel = (f) => path.relative(ROOT, f);
const hits = [];
const self = fileURLToPath(import.meta.url);

for (const f of files) {
  if (f === self || path.dirname(f) === SEG && /README\.md$/.test(f)) continue; // this checker and the folder README name what they forbid
  if (!isText(f)) continue;
  const text = fs.readFileSync(f, 'utf8'), low = text.toLowerCase();
  for (const n of [...NAMES, ...filmFolders.map((d) => d.toLowerCase())]) {
    let i = low.indexOf(n);
    while (i >= 0) {
      if (!ALLOW.some(([sfx, w]) => f.endsWith(sfx) && w === n)) {
        const line = text.slice(0, i).split('\n').length;
        hits.push(`name   ${rel(f)}:${line}  "${n}"`);
      }
      i = low.indexOf(n, i + 1);
    }
  }
  text.split('\n').forEach((ln, k) => { for (const re of PATHS) if (re.test(ln) && !/^\s*(\/\/|#)\s*(scrub|not brought)/i.test(ln)) hits.push(`path   ${rel(f)}:${k + 1}  ${re}  ${ln.trim().slice(0, 100)}`); });
}

// 3. media: byte-identical to anything in the repo outside segments/ (size first, then sha256)
const segMedia = files.filter(isMedia);
if (segMedia.length) {
  const want = new Map(); for (const f of segMedia) { const s = fs.statSync(f).size; if (!want.has(s)) want.set(s, []); want.get(s).push(f); }
  const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (['node_modules', '.git', 'segments'].includes(e.name)) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && isMedia(p) && want.has(fs.statSync(p).size)) for (const f of want.get(fs.statSync(p).size)) if (sha(f) === sha(p)) hits.push(`media  ${rel(f)} is identical to ${rel(p)}`);
    }
  })(ROOT);
}

// 4. lyrics: 5-word runs from any lyric file under the --lyrics folders
const words = (s) => s.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').split(/\s+/).filter(Boolean);
const lyricFiles = [];
for (const r of lyricRoots) (function walk(d, depth) {
  if (depth > 5 || !fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (['node_modules', '.git', '.claude', 'out', 'tools', 'segments'].includes(e.name) || e.name.startsWith('_wt')) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, depth + 1);
    else if (/lyric/i.test(e.name) && /\.(txt|js|lrc|srt|json)$/.test(e.name) && !/template/i.test(e.name) && fs.statSync(p).size < 400000) lyricFiles.push(p);
  }
})(r, 0);
const shingles = new Map();
// a .js or .json lyric file is data in code: read only its string literals, or every for-loop would match
const lyricText = (f) => { const t = fs.readFileSync(f, 'utf8'); return /\.(js|json)$/.test(f) ? (t.match(/(['"`])(?:\\.|(?!\1).)*\1/g) || []).map((q) => q.slice(1, -1)).join(' \n ') : t; };
for (const f of lyricFiles) { const w = words(lyricText(f)); for (let i = 0; i + 5 <= w.length; i++) shingles.set(w.slice(i, i + 5).join(' '), f); }
if (shingles.size) for (const f of files.filter(isText)) {
  if (f === self) continue;
  const w = words(fs.readFileSync(f, 'utf8'));
  for (let i = 0; i + 5 <= w.length; i++) { const s = w.slice(i, i + 5).join(' '); if (shingles.has(s)) hits.push(`lyric  ${rel(f)}  "${s}"  (from ${shingles.get(s)})`); }
}

const segs = fs.readdirSync(SEG, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
console.log(`segments: ${segs.join(', ')}; ${files.length} files, ${segMedia.length} media; ${NAMES.length} names + ${filmFolders.length} film folders; ${lyricFiles.length} lyric files (${shingles.size} 5-word runs)`);
if (!lyricRoots.length) console.log('note: no --lyrics folder given, so the lyric check did not run');
if (hits.length) { console.log(`${hits.length} hits:\n` + [...new Set(hits)].join('\n')); process.exit(1); }
console.log('clean');
