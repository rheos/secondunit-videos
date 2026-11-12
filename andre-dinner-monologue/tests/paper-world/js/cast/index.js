// The cast: a prison officer (and the citizen he is cut from), two hands, a winged pine seed and a pop-up pine.
// Every make*(THREE, paper, opts) takes the caller's paper(colour) material factory and returns a THREE.Group
// with .pose(group, params) and .group on it, so both `const g = makeX(...)` and `const { group, pose } = makeX(...)` work.
export { makeGuard, poseGuard, guardParts, capOutline, headOutline, badgeOutline, CAP, HEAD, BODY } from "./guard.js";
export { makeHandOpen, poseHandOpen, makeHandPinch, poseHandPinch, handOutline, handLoops, handPieces, handSkeleton, profileSkeleton, HAND, PROFILE } from "./hand.js";
export { makeSeed, poseSeed, seedOutline, makePine, posePine, pineOutline, PINE } from "./seed.js";
export { baseballCapOutline } from "./outlines-guard.js";
