// skins/s07.js: section 7, the seed. Its pieces are built in js/skin67.js with section 6's (skins/s06.js); this runs
// their updates: the open hand, the pinch hand and the seed, the pine.
export async function build(X) { return { update(f, jitter, cam) { X.camp.update7(f, cam, X.now.L); } }; }
