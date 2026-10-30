// Bob's shows (read from the IndieAgent artist agent MCP into _in/shows.json, gitignored) -> data/tour.js, the only
// tour data the plate sees: nights per month and province, as a pele sankey. Booked shows only.
//   node tools/tour-data.mjs
// Links go month by month, and inside a month east to west. pele orders each column to cut crossings, and with
// the links in this order its month column comes out in calendar order (plate.js refuses to draw if it doesn't).
import fs from 'fs';

const { shows } = JSON.parse(fs.readFileSync('_in/shows.json', 'utf8'));
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const PROVINCES = { NS: 'Nova Scotia', NB: 'New Brunswick', PEI: 'Prince Edward Island', QC: 'Quebec', ON: 'Ontario', BC: 'British Columbia' };
const EAST_TO_WEST = Object.keys(PROVINCES);

const booked = shows.filter(([, status]) => status === 'booked').sort((a, b) => a[0].localeCompare(b[0]));
const months = [], counts = new Map();
for (const [date, , region] of booked) {
  if (!PROVINCES[region]) throw new Error(`no province name for ${region}`);
  const key = date.slice(0, 7);
  if (!months.includes(key)) months.push(key);
  const k = `${key}|${region}`;
  counts.set(k, (counts.get(k) || 0) + 1);
}
const links = [];
for (const m of months) for (const r of EAST_TO_WEST) { const n = counts.get(`${m}|${r}`); if (n) links.push([MONTHS[+m.slice(5) - 1], PROVINCES[r], n]); }
const total = links.reduce((s, l) => s + l[2], 0);
if (total !== booked.length) throw new Error('lost a show');
const mmd = ['sankey-beta', ...links.map((l) => l.join(','))].join('\n');
const tour = {
  source: 'IndieAgent artist agent MCP, workspace bob-wiseman, list_shows, booked shows',
  read: '2026-10-24',
  nights: total,
  first: booked[0][0], last: booked[booked.length - 1][0],
  months: months.map((m) => ({ name: MONTHS[+m.slice(5) - 1], year: +m.slice(0, 4), nights: links.filter((l) => l[0] === MONTHS[+m.slice(5) - 1]).reduce((s, l) => s + l[2], 0) })),
  links, mmd,
};
fs.writeFileSync('data/tour.js', `// Built by tools/tour-data.mjs from _in/shows.json. Counts only: no venues, cities or dates beyond the months.\nwindow.TOUR = ${JSON.stringify(tour, null, 1)};\n`);
console.log(mmd + `\n${total} nights, ${tour.first} to ${tour.last}`);
