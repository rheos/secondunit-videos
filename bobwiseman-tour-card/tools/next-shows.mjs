// next-shows.mjs · the shows on the card, from the tour DB snapshot.
//   node tools/next-shows.mjs [--from 2026-11-12] [--to 2026-12-31] [--max 5]
// Reads _in/shows.json (gitignored: the IndieAgent artist agent MCP's list_shows for workspace bob-wiseman, saved
// as { shows: [...] }) and writes data/shows.js with booked shows only, and only what Bob's public tour page shows:
// date, venue, city, region, billing. Fees, contacts and holds never leave _in/.
// data/extra.json adds what the DB doesn't hold but his public page does (Toronto Dec 4 is "Bob solo", no venue).
import fs from 'fs';

const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const today = new Date().toISOString().slice(0, 10);
const from = opt('--from', today), to = opt('--to', '9999-12-31'), max = Number(opt('--max', 5));
const src = JSON.parse(fs.readFileSync('_in/shows.json', 'utf8'));
const extra = fs.existsSync('data/extra.json') ? JSON.parse(fs.readFileSync('data/extra.json', 'utf8')) : {};
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const shows = src.shows
  .filter((s) => s.status === 'booked' && s.date >= from && s.date <= to && s.city)
  .sort((a, b) => a.date.localeCompare(b.date))
  .slice(0, max)
  .map((s) => {
    const d = new Date(s.date + 'T12:00:00Z'), x = extra[s.date] || {};
    return {
      date: s.date, dow: DOW[d.getUTCDay()], day: d.getUTCDate(), mon: MON[d.getUTCMonth()],
      venue: x.venue ?? s.venue ?? null, city: s.city, region: s.region || '', billing: x.billing ?? s.billing ?? null,
    };
  });
if (!shows.length) throw new Error(`no booked shows between ${from} and ${to}`);
const out = { source: src.source || 'list_shows', from, to, shows };
fs.mkdirSync('data', { recursive: true });
fs.writeFileSync('data/shows.js', `// Built by tools/next-shows.mjs from _in/shows.json. Public fields only.\nwindow.SHOWS = ${JSON.stringify(out, null, 1)};\n`);
console.log(shows.map((s) => `${s.date} ${s.city} ${s.venue || ''}`).join('\n'));
