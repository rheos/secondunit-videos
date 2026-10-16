const SHOTS = [];
function SHOT(a, b, name, fn, opts = {}) { SHOTS.push({ a, b, name, fn, o: opts }); SHOTS.sort((x, y) => x.a - y.a); }
// The sung "clap" of every "clap hands", from the vocal stem (exact). HANDS = the sung "hands".
// Draft 4: claps 8, 15 and 16 moved onto the sung onset (vocal and band stems agreed: 86.8, 188.867 and 192.933 were
// 3-5 frames early). The rest sit within about a frame of both stems.
const CLAPS = [41.6, 46.0, 50.033, 54.133, 74.433, 78.867, 83.033, 86.958, 127.967, 131.867, 135.9, 139.967, 180.633, 184.967, 189.042, 193.042];
const HANDS = CLAPS.map((k) => k + .53);
const START = 11.0, END = 197.0; // the video: before 11.0 is the previous song; 197.0 is where the song ends
// keyframes on song time with eased in-between: kf3(t, [[t0, v0], [t1, v1], ...])
const kf3 = (t, ks) => { if (t <= ks[0][0]) return ks[0][1]; for (let i = 1; i < ks.length; i++) if (t < ks[i][0]) return lerp(ks[i - 1][1], ks[i][1], eio((t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]))); return ks[ks.length - 1][1]; };
// cam(cx, cy, z, rot): world point (cx, cy) to the frame centre at zoom z
const cam = (cx, cy, z = 1, rot = 0) => { g.translate(W / 2, H / 2); g.rotate(rot); g.scale(z, z); g.translate(-cx, -cy); };
