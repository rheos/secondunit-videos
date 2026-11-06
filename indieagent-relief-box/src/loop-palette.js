// The living loop's palette, set before any of its modules builds a colour (loop.js imports this first). Robin,
// 2026-10-25: "maybe i might want to bring in an orange.. some orange to replace the pink". With ?pal=orange the
// pink family becomes a soft orange family; the relief-box film shares kit.js's PAL and keeps its pinks, since this
// only runs in the loop's page.
import { PAL } from './kit.js';

const ORANGE = { pink: '#f6b27e', pinkDeep: '#e3874f', blush: '#fad8bd' };
export const LOOP_PAL = typeof location !== 'undefined' && new URLSearchParams(location.search).get('pal') === 'orange' ? 'orange' : 'pink';
if (LOOP_PAL === 'orange') Object.assign(PAL, ORANGE);
