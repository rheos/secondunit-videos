// The living loop, the small figures: clay people about 100 px tall. Body and head are baked clay sprites; arms
// and legs are drawn each frame as single rolled tubes that bend through the joint (one curve per limb, never
// hinged segments), with a shadow, a body colour and a lit side, and small ball hands and bean feet.
// A pose is a set of targets (hip, feet, hands, lean, facing); knees and elbows come from two-bone IK.

import { mix, shade, rgba } from '../vendor/paper-fox/core/color.js';
import { drawSprites } from '../vendor/paper-fox/core/sprite.js';
import { LIGHT, PAL, CLAY_MAT, CLAY_EDGE, shadowBlur, clayForm, dot } from './kit.js';
import { drawSolid } from './loop-shapes.js';

const lerpN = (a, b, k) => a + (b - a) * k;

const P = PAL, TAU = Math.PI * 2;
const circle = (cx, cy, r, n = 32) => [...Array(n)].map((_, i) => [cx + Math.cos(i / n * TAU) * r, cy + Math.sin(i / n * TAU) * r]);
export const BODY = { leg1: 18, leg2: 17, arm1: 18, arm2: 18, torso: 38, head: 15, hipW: 5, shoulderW: 9 };

// two-bone IK: the middle joint for a chain from a to b with lengths l1, l2; bend +1 or -1 picks the side
export function ik2(a, b, l1, l2, bend) {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01), base = Math.atan2(dy, dx);
  const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), A = Math.acos(Math.max(-1, Math.min(1, cosA)));
  return [a[0] + Math.cos(base + bend * A) * l1, a[1] + Math.sin(base + bend * A) * l1];
}

// cap: a colour for a little stepped hat, 'pom' for a bobble hat, or 'bells' for a two-pointed jester cap.
// harlequin: diamonds on the body, in that colour.
export function makeFigure(S, { name, color, cap, harlequin = null, res = 1.6 }) {
  const torso = S.sprite({ name: `${name}-torso`, x: -22, y: -50, w: 44, h: 58, res, mat: CLAY_MAT, edge: CLAY_EDGE, shadow: { blur: shadowBlur(8) }, draw(g) {
    const body = [[-12, 4], [-14, -14], [-12, -32], [-7, -40], [7, -40], [12, -32], [14, -14], [12, 4], [0, 7]];
    const path = clayForm(g, body, color, { size: 24, sheen: 0.22 });
    if (harlequin) {
      g.save(); g.clip(path);
      for (let row = 0; row < 5; row++) for (let col = -2; col <= 2; col++) {
        if ((row + col) & 1) continue;
        const cx = col * 8, cy = -36 + row * 9;
        g.fillStyle = rgba(harlequin, 0.85); g.beginPath(); g.moveTo(cx, cy - 5); g.lineTo(cx + 4, cy); g.lineTo(cx, cy + 5); g.lineTo(cx - 4, cy); g.closePath(); g.fill();
      }
      g.restore();
    } else { dot(g, 0, -24, 2.4, shade(color, -0.3)); dot(g, 0, -14, 2.4, shade(color, -0.3)); }
    clayForm(g, [[-8, -42], [8, -42], [6, -36], [-6, -36]], mix(color, '#ffffff', 0.4), { smooth: false, size: 6 });
  } });
  const hat = (g) => {
    if (cap === 'pom') { clayForm(g, [[-14, -8], [-10, -16], [0, -19], [10, -16], [14, -8]], P.butter, { size: 10 }); clayForm(g, circle(0, -21, 5, 18), P.pinkDeep, { sheen: 0.3 }); }
    else if (cap === 'bells') {
      for (const s of [-1, 1]) {
        clayForm(g, [[0, -8], [s * 13, -8], [s * 22, -26], [s * 6, -15]], s < 0 ? P.pink : P.mint, { smooth: false, size: 10 });
        clayForm(g, circle(s * 23, -28, 3.6, 16), P.butter, { sheen: 0.35 });
      }
      clayForm(g, [[-14, -10], [14, -10], [13, -6], [-13, -6]], P.lilac, { smooth: false, size: 6 });
    } else { clayForm(g, [[-13, -10], [13, -10], [13, -6], [-13, -6]], shade(cap, -0.1), { smooth: false, size: 6 }); clayForm(g, [[-9, -10], [9, -10], [7, -22], [-7, -22]], cap, { smooth: false, size: 12 }); }
  };
  const eye = (g, ex) => { g.fillStyle = P.ink; g.beginPath(); g.ellipse(ex, -2, 1.9, 2.6, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(ex - 0.6, -3, 0.7, 0, TAU); g.fill(); };
  const headBox = { x: -30, y: -40, w: 60, h: 58, res, mat: CLAY_MAT, edge: CLAY_EDGE, shadow: { blur: shadowBlur(8) } };
  // in profile (baked facing right): eyes toward the facing side, a blush, a nose bump
  const head = S.sprite({ name: `${name}-head`, ...headBox, draw(g) {
    clayForm(g, circle(0, 0, BODY.head, 36), P.bone, { sheen: 0.28 });
    eye(g, 2); eye(g, 10);
    g.fillStyle = rgba(P.pink, 0.55); g.beginPath(); g.ellipse(9, 5, 3.4, 2.2, 0, 0, TAU); g.fill();
    clayForm(g, circle(14, 1, 3, 14), P.bone, { sheen: 0.2, shadow: false });
    hat(g);
  } });
  // facing us: eyes either side of the middle, two blushes
  const front = S.sprite({ name: `${name}-front`, ...headBox, draw(g) {
    clayForm(g, circle(0, 0, BODY.head, 36), P.bone, { sheen: 0.28 });
    eye(g, -5); eye(g, 5);
    g.fillStyle = rgba(P.pink, 0.55); for (const x of [-9, 9]) { g.beginPath(); g.ellipse(x, 5, 3.2, 2, 0, 0, TAU); g.fill(); }
    clayForm(g, circle(0, 2, 2.4, 12), P.bone, { sheen: 0.2, shadow: false });
    hat(g);
  } });
  return { name, color, torso, head, front };
}

function limb(ctx, a, m, b, w, color, light = LIGHT) {
  const c = [2 * m[0] - (a[0] + b[0]) / 2, 2 * m[1] - (a[1] + b[1]) / 2];
  const path = (o = [0, 0]) => { ctx.beginPath(); ctx.moveTo(a[0] + o[0], a[1] + o[1]); ctx.quadraticCurveTo(c[0] + o[0], c[1] + o[1], b[0] + o[0], b[1] + o[1]); };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  path([3, 5]); ctx.strokeStyle = 'rgba(70,40,45,0.18)'; ctx.lineWidth = w; ctx.stroke();
  path(); ctx.strokeStyle = shade(color, -0.22); ctx.lineWidth = w; ctx.stroke();
  path(); ctx.strokeStyle = color; ctx.lineWidth = w - 2; ctx.stroke();
  path([light[0] * w * 0.22, light[1] * w * 0.22]); ctx.strokeStyle = rgba(mix(color, '#fffaf0', 0.55), 0.75); ctx.lineWidth = w * 0.38; ctx.stroke();
}
function ball(ctx, p, r, color, light = LIGHT) {
  ctx.fillStyle = 'rgba(70,40,45,0.18)'; ctx.beginPath(); ctx.arc(p[0] + 2, p[1] + 3, r, 0, TAU); ctx.fill();
  const g = ctx.createRadialGradient(p[0] + light[0] * r * 0.4, p[1] + light[1] * r * 0.4, 0, p[0], p[1], r);
  g.addColorStop(0, mix(color, '#fffaf0', 0.45)); g.addColorStop(0.6, color); g.addColorStop(1, shade(color, -0.25));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU); ctx.fill();
}
function foot(ctx, p, facing, color) {
  ctx.fillStyle = 'rgba(70,40,45,0.2)'; ctx.beginPath(); ctx.ellipse(p[0] + facing * 3 + 2, p[1] + 2, 8, 3, 0, 0, TAU); ctx.fill();
  const g = ctx.createLinearGradient(p[0], p[1] - 6, p[0], p[1] + 2);
  g.addColorStop(0, mix(color, '#fffaf0', 0.35)); g.addColorStop(1, shade(color, -0.25));
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(p[0] + facing * 3, p[1] - 3, 7.5, 4.5, 0, 0, TAU); ctx.fill();
}

// pose: { hip, lean (rad, + leans toward facing), facing (1 right, -1 left), feet: [back, front], hands: [back, front],
//         headTilt, scale, turn (0 profile .. 1 facing us), sing (0..1 mouth open), shift (0..1: the head becomes a
//         faceted ball), shiftKind, armsFront (both arms drawn in front of the body) }. Everything in the plane's authored coordinates.
export function drawFigure(ctx, F, pose, env) {
  const s = pose.scale ?? 1, f = pose.facing, B = BODY, lean = pose.lean * f;
  const up = [Math.sin(lean), -Math.cos(lean)], side = [Math.cos(lean), Math.sin(lean)];
  const hip = pose.hip, neck = [hip[0] + up[0] * B.torso * s, hip[1] + up[1] * B.torso * s];
  const sh = (k) => [neck[0] + side[0] * B.shoulderW * k * s + up[0] * -5 * s, neck[1] + side[1] * B.shoulderW * k * s + up[1] * -5 * s];
  const hipAt = (k) => [hip[0] + side[0] * B.hipW * k * s, hip[1] + side[1] * B.hipW * k * s];
  // back limbs are on the side away from the viewer's facing; draw them first
  const legs = pose.feet.map((ft, i) => { const h = hipAt(i ? f : -f), bend = (pose.turn ?? 0) > 0.5 ? (ft[0] < hip[0] ? 1 : -1) : (f > 0 ? -1 : 1); return { h, k: ik2(h, ft, B.leg1 * s, B.leg2 * s, bend), ft }; });
  // a hand never leaves the arm: an out-of-reach target is pulled back to the full stretch
  const arms = pose.hands.map((target, i) => {
    const sp = sh(i ? f : -f), reach = (B.arm1 + B.arm2) * s * 0.98, dx = target[0] - sp[0], dy = target[1] - sp[1], d = Math.hypot(dx, dy);
    const hd = d > reach ? [sp[0] + dx / d * reach, sp[1] + dy / d * reach] : target;
    return { sp, e: ik2(sp, hd, B.arm1 * s, B.arm2 * s, f > 0 ? 1 : -1), hd };
  });
  const trousers = shade(F.color, -0.12);
  ctx.save();
  ctx.fillStyle = 'rgba(70,40,45,0.22)'; ctx.beginPath(); ctx.ellipse(hip[0] + 4, Math.max(...pose.feet.map((p) => p[1])) + 2, 22 * s, 5 * s, 0, 0, TAU); ctx.fill();
  limb(ctx, legs[0].h, legs[0].k, legs[0].ft, 9 * s, shade(trousers, -0.08)); foot(ctx, legs[0].ft, f, P.slateDeep);
  if (!pose.armsFront) { limb(ctx, arms[0].sp, arms[0].e, arms[0].hd, 7.5 * s, shade(F.color, -0.1)); ball(ctx, arms[0].hd, 4.4 * s, P.bone); }
  limb(ctx, legs[1].h, legs[1].k, legs[1].ft, 9 * s, trousers); foot(ctx, legs[1].ft, f, P.slateDeep);
  const bodyItems = [{ s: F.torso, x: hip[0], y: hip[1], rot: lean, sx: s, sy: s }];
  drawSprites(ctx, bodyItems, { ...env.shadow, dx: 3, dy: 5, alpha: 0.25 });
  if (pose.carry) pose.carry(arms.map((a) => a.hd));
  // facing us with both arms working in front (the chorus's crossing wave): the back arm comes in front of the body too
  if (pose.armsFront) { limb(ctx, arms[0].sp, arms[0].e, arms[0].hd, 7.5 * s, shade(F.color, -0.06)); ball(ctx, arms[0].hd, 4.4 * s, P.bone); }
  limb(ctx, arms[1].sp, arms[1].e, arms[1].hd, 7.5 * s, F.color); ball(ctx, arms[1].hd, 4.4 * s, P.bone);
  const hc = [neck[0] + up[0] * (B.head + 1) * s, neck[1] + up[1] * (B.head + 1) * s];
  const turn = pose.turn ?? 0, shift = pose.shift ?? 0, rot = lean * 0.6 + (pose.headTilt ?? 0) * f * (1 - turn);
  const hs = s * (1 - shift);
  if (hs > 0.02) {
    const heads = [];
    if (turn < 0.999) heads.push({ s: F.head, x: hc[0], y: hc[1], rot, sx: f * hs, sy: hs, alpha: 1 - turn });
    if (turn > 0.001) heads.push({ s: F.front, x: hc[0], y: hc[1], rot: rot * 0.3, sx: hs, sy: hs, alpha: turn });
    drawSprites(ctx, heads, { ...env.shadow, dx: 3, dy: 5, alpha: 0.25 });
    // singing: a round mouth that opens and closes
    if ((pose.sing ?? 0) > 0.02) {
      const mx = hc[0] + (lerpN(10, 0, turn)) * f * hs, my = hc[1] + 7 * hs, mr = 2.6 * hs * pose.sing;
      ctx.fillStyle = shade(P.pinkDeep, -0.45); ctx.beginPath(); ctx.ellipse(mx, my, mr * 0.8, mr, 0, 0, TAU); ctx.fill();
    }
  }
  // shape-shifting: the head pops into a faceted ball and back
  if (shift > 0.01) drawSolid(ctx, pose.shiftKind ?? 'ico', hc[0], hc[1], B.head * s * 1.1 * shift, [pose.shiftSpin ?? 0, 0.6, 0.2], F.color);
  ctx.restore();
  return { neck, head: hc, hands: arms.map((a) => a.hd) };
}
