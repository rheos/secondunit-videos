// First Night Out, the film sequencer: scenes joined by transitions, laid out as a plan. Every frame a pure function of t.
//   plan: [{ scene, from, dur }, { tr, dur, o }, { scene, from, dur }, ...]
// A scene item plays its scene from local time `from` for `dur` seconds. A transition between two scene items takes its
// own `dur`: scene A keeps running past the end of its item, scene B starts at its own `from` when the transition starts
// and carries on into its item, so nothing freezes. The first scene can open with the cut-outs settling onto their
// stands (intro seconds); the film can close into the dark (outro seconds).
const FILM = (() => {
  const { clamp } = PD;
  function make(Q, plan, { intro = 0, outro = 0 } = {}) {
    const scenes = {};
    for (const it of plan) if (it.scene && !scenes[it.scene]) scenes[it.scene] = SCENES[it.scene](Q);
    const segs = []; let t = 0;
    for (let i = 0; i < plan.length; i++) {
      const it = plan[i], prev = plan[i - 1];
      if (it.scene) segs.push({ kind: 'scene', S: scenes[it.scene], t0: t, t1: t + it.dur, local0: it.from + (prev && prev.tr ? prev.dur : 0) });
      else segs.push({ kind: 'tr', name: it.tr, o: it.o, t0: t, t1: t + it.dur, dur: it.dur, A: plan[i - 1], B: plan[i + 1] });
      t += it.dur;
    }
    for (const sg of segs) if (sg.kind === 'tr') {
      const a = segs[segs.indexOf(sg) - 1], b = segs[segs.indexOf(sg) + 1];
      sg.SA = a.S; sg.SB = b.S; sg.aEnd = a.local0 + (a.t1 - a.t0); sg.bFrom = sg.B.from;
    }
    const END = t;
    function frame(ctx, t) {
      t = clamp(t, 0, END - 1e-6);
      const sg = segs.find((s) => t < s.t1) || segs[segs.length - 1];
      let post;
      if (sg.kind === 'scene') {
        const lt = sg.local0 + (t - sg.t0);
        if (sg === segs[0] && t < intro) TRANS.intro(ctx, sg.S, lt, t / intro); else SCENE.render(ctx, sg.S, lt);
        post = sg.S.post;
      } else {
        const p = (t - sg.t0) / sg.dur;
        TRANS.run(sg.name, ctx, { A: sg.SA, B: sg.SB, tA: sg.aEnd + (t - sg.t0), tB: sg.bFrom + (t - sg.t0), p, o: sg.o, Q });
        post = SCENE.blendPost(sg.SA.post, sg.SB.post, TRANS.EZ.smooth(p));
      }
      PD.finish(ctx, { ...post, frame: Math.round(t * 24) });
      const k = outro ? clamp((t - (END - outro)) / outro) : 0;
      if (k > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = TRANS.EZ.smooth(k) * .96; ctx.fillStyle = '#05060f'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
      return sg;
    }
    return { END, frame, segs, scenes };
  }
  // a page that plays a film plan: ?w= output width (1280 default), ?t= start time, ?offline for renders
  function page(plan, opts) {
    const params = new URLSearchParams(location.search);
    const OUT_W = parseInt(params.get('w') || '1280', 10), Q = OUT_W / 1920;
    const cv = document.getElementById('c'); cv.width = OUT_W; cv.height = Math.round(1080 * Q);
    const X = cv.getContext('2d'), film = make(Q, plan, opts);
    window.__frameJPEG = (t, q = .93) => { film.frame(X, t); return cv.toDataURL('image/jpeg', q); };
    window.__ready = Promise.resolve(true);
    window.REEL = film;
    if (!params.has('offline')) {
      const t0 = performance.now(), start = parseFloat(params.get('t') || 0);
      (function loop() { film.frame(X, (start + (performance.now() - t0) / 1000) % film.END); requestAnimationFrame(loop); })();
    }
  }
  return { make, page };
})();
