// Embeds the brand wordmark as a data URL (js/assets.js) so canvas can read its pixels from file://.
import fs from 'fs';
const png = fs.readFileSync('assets/brand/logo-wordmark.png').toString('base64');
fs.writeFileSync('js/assets.js', `window.ASSETS={wordmark:"data:image/png;base64,${png}"};\n`);
console.log('wrote js/assets.js', (png.length / 1024).toFixed(0) + 'KB');
