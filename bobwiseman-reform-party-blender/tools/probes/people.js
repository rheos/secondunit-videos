// the Instrument People (instruments.js) for rp_people: each owner's feet, walk amount, head life, the gait beat and the recorder's reel phase
(t) => {
  const o = { s: Math.sin(ipBeat(t) * Math.PI), run: ipRun(t), p: {} };
  if (t < 16.701) o.cues = { die: IPT.die, kinds: IP_KINDS, lr: IP_LR, sash: IP_SASH, collar: IP_COLLAR, zw: IP_ZW };
  for (const st of ipState(t)) { const ow = ipOwner(st.kind, t);
    o.p[st.kind] = { X: +ow.X.toFixed(4), Z: +ow.Z.toFixed(4), mv: +ow.mv.toFixed(3), on: +st.on.toFixed(4), where: st.where, h: ipHeadOpts(st.kind, t) }; }
  return o;
}
