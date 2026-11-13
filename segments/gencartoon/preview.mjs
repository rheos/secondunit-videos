// Serve this folder on localhost and print the address of the live page (it loops the 15 s; click or space pauses).
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
http.createServer((req, res) => {
  const f = path.join(HERE, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(HERE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(Number(process.env.PORT || 4377), '127.0.0.1', function () { console.log(`open http://127.0.0.1:${this.address().port}/segment.html`); });
