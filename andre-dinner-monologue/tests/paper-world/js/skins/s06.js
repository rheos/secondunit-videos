// skins/s06.js: section 6, the camp. The code is js/skin67.js (buildCamp), which builds the pieces of sections 6 and 7
// together; this runs the camp's updates: the wall, the watchtowers, the crew and their bricks, the head.
import { buildCamp } from "../skin67.js";
export async function build(X) { X.camp = await buildCamp(X); return { update(f, jitter, cam) { X.camp.update6(f, cam, X.now.L); } }; }
