import fs from 'fs';
const s = fs.readFileSync('js/dali/burn.js', 'utf8');
const st = JSON.parse(s.match(/^const FG_ST = (\[.*\]);$/m)[1]), tr = JSON.parse(s.match(/^const FG_TR = (\{.*\});$/m)[1]);
const F = JSON.parse(fs.readFileSync('out/foreign.json', 'utf8'));
const r1 = (v) => Math.round(v * 10) / 10;
const NS = [], NT = {};
for (const id in F) { const L = F[id], x0 = L[0][1], z0 = L[0][2], still = L.every((q) => Math.abs(q[1] - x0) < .05 && Math.abs(q[2] - z0) < .05);
  if (still) NS.push([r1(x0), r1(z0), L[0][3], L[0][0], L[L.length - 1][0], id]); else NT[id] = [L[0][3], ...L.map((q) => [q[0], r1(q[1]), r1(q[2])])]; }
// compare
const os = new Map(st.map((q) => [q[5] + '|' + q[3], q])); let same = 0, diff = [];
for (const q of NS) { const o = st.find((x) => x[5] === q[5] && x[3] === q[3]); if (o && JSON.stringify(o) === JSON.stringify(q)) same++; else diff.push(['ST', JSON.stringify(q), JSON.stringify(o)]); }
for (const q of st) if (!NS.find((x) => x[5] === q[5] && x[3] === q[3])) diff.push(['ST-old-only', JSON.stringify(q)]);
let tsame = 0; for (const id in NT) { if (JSON.stringify(NT[id]) === JSON.stringify(tr[id])) tsame++; else diff.push(['TR', id, JSON.stringify(NT[id]).slice(0, 150), JSON.stringify(tr[id] || null).slice(0, 150)]); }
for (const id in tr) if (!NT[id]) diff.push(['TR-old-only', id]);
console.log('st same', same, '/', NS.length, 'tr same', tsame, '/', Object.keys(NT).length); console.log(diff.slice(0, 30).map((d) => d.join('  ')).join('\n'), diff.length);
if (process.argv[2] === 'write') { const keep = st.filter((q) => q[4] === 999); const out = s.replace(/^const FG_ST = .*$/m, 'const FG_ST = ' + JSON.stringify([...keep, ...NS]) + ';').replace(/^const FG_TR = .*$/m, 'const FG_TR = ' + JSON.stringify(NT) + ';'); fs.writeFileSync('js/dali/burn.js', out); console.log('written'); }
