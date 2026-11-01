// First Night Out, scenes: the registry the scene files add to (SCENES.walk, SCENES.creek, ...), drawing one scene at
// its local time, blending two scenes' finish for a transition, and the boot for a page that shows one scene alone.
// A scene is { name, END, planes, camera(t), prepare(t), background, light, shadowAlpha, post, meta }: prepare(t) poses
// its characters for time t, post is its PD.finish settings, meta tells the transitions where its hero and its light are.
const SCENES = {};
const SCENE = (() => {
  const { clamp } = PD;
  // draw scene S at local time t; o.cam replaces its camera, the rest goes to PD.renderPlanes
  function render(ctx, S, t, o = {}) {
    S.prepare(t);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = o.background ?? S.background; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
    PD.renderPlanes(ctx, S.planes, o.cam ?? S.camera(t), t, { q: ctx.canvas.width / 1920, light: S.light, shadowAlpha: S.shadowAlpha, ...o });
  }
  // two scenes' finish settings mixed by p (paper-fox film.js blendPost): numbers lerp, grades cross through zero
  function blendPost(a, b, p) {
    const out = {};
    for (const k of ['bloom', 'threshold', 'vignette', 'grain']) out[k] = (a[k] ?? 0) + ((b[k] ?? 0) - (a[k] ?? 0)) * p;
    if (a.grade || b.grade) out.grade = p < .5 ? a.grade && { ...a.grade, amount: a.grade.amount * (1 - p * 2) } : b.grade && { ...b.grade, amount: b.grade.amount * (p * 2 - 1) };
    return out;
  }
  // a page that plays one scene: ?w= output width (1280 default), ?t= start time, ?offline for renders
  function page(name) {
    const params = new URLSearchParams(location.search);
    const OUT_W = parseInt(params.get('w') || '1280', 10), Q = OUT_W / 1920;
    const cv = document.getElementById('c'); cv.width = OUT_W; cv.height = Math.round(1080 * Q);
    const X = cv.getContext('2d'), S = SCENES[name](Q);
    const frame = (t) => { render(X, S, t); PD.finish(X, { ...S.post, frame: Math.round(t * 24) }); };
    window.__frameJPEG = (t, q = .93) => { frame(t); return cv.toDataURL('image/jpeg', q); };
    window.__ready = Promise.resolve(true);
    window.S = S;
    if (!params.has('offline')) {
      const t0 = performance.now(), start = parseFloat(params.get('t') || 0);
      (function loop() { frame((start + (performance.now() - t0) / 1000) % S.END); requestAnimationFrame(loop); })();
    }
  }
  return { render, blendPost, page, clamp };
})();
