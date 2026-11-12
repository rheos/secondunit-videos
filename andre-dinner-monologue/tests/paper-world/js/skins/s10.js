// skins/s10.js: the painted pieces of section 10, the bare table. STUB: it makes nothing. Its builder owns this file.
// build(X) makes the section's pieces (X is the shared kit: see the end of js/skin.js and README.md, "How to build a
// section"), registers each by name (X.reg.add) and returns update(f, jitter, cam), which is called on every frame of
// the film after the table's and the earlier sections' updates. Set every animated property of your pieces from scratch
// on every frame; outside the frames you need them, your pieces are hidden. Other sections' pieces: X.reg.get(name).
import * as S10 from "../sections/s10.js";

export async function build(X) {
  return { update(f, jitter, cam) {} };
}
