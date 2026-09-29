// Lyric layer for The Wyrd One, "dream of fire" (9:16, 1080x1920, t = song seconds).
// prep_lyrics.py fills CUES from the lyric sheet + stem-checked timings and writes work/lyrics.js.
// Look: bone-cream Newsreader Italic, like a title card burned into old film. Each word surfaces on
// its sung onset, warms to ember while it is held, then settles. Lower third only: the veil and the
// figure stay clear. No grain here; the cut already carries his.
const CUES = /*CUES*/[];

const W = 1080, H = 1920, MAXW = 900;
const BONE = [239, 226, 196], EMBER = [255, 178, 102];

Anim.sketch({
  async load() {
    this.f = await Anim.fonts({ serif: "Newsreader-Italic.ttf" });
  },

  layout(cue, size) {
    textFont(this.f.serif); textSize(size);
    const space = size * 0.27;
    const ws = cue.words.map((word) => ({ ...word, ww: textWidth(word.w) }));
    const width = (r) => r.reduce((a, x) => a + x.ww, 0) + space * (r.length - 1);
    let rows = [ws];
    if (width(ws) > MAXW) {
      // two rows, broken where the widths balance best; a comma or a repeated "i" opening wins ties
      let best = 1, score = Infinity;
      for (let k = 1; k < ws.length; k++) {
        const a = width(ws.slice(0, k)), b = width(ws.slice(k));
        if (Math.max(a, b) > MAXW) continue;
        const s = Math.abs(a - b) - (/,$/.test(ws[k - 1].w) ? 400 : 0) - (ws[k].w.toLowerCase() === "i" ? 300 : 0);
        if (s < score) { score = s; best = k; }
      }
      rows = [ws.slice(0, best), ws.slice(best)];
    }
    return rows.map((r) => {
      const total = r.reduce((a, x) => a + x.ww, 0) + space * (r.length - 1);
      let x = (W - total) / 2;
      return r.map((x0) => { const p = { ...x0, x }; x += x0.ww + space; return p; });
    });
  },

  draw(t) {
    clear();
    // the newest line that has started wins, so a fading line never overlaps the next one
    const cue = CUES.filter((c) => t >= c.s - 0.1).at(-1);
    if (cue && t >= cue.out + 0.35) return;
    if (!cue) return;
    const size = cue.hook ? 100 : 76, lead = size * 1.12;
    const rows = this.layout(cue, size);
    const base = cue.hook ? 1540 : 1600 - (rows.length - 1) * lead;
    const lineAlpha = Anim.envelope(t, cue.s - 0.1, cue.out + 0.35, 0.08, 0.35);
    // old-film exposure flicker, deterministic in t
    const flicker = 0.94 + 0.06 * Math.sin(t * 37.1) * Math.sin(t * 11.3 + 1.7);

    // soft smoke-dark smudge behind the line so bone type reads on bright sepia; it fades with the line
    const top = base - size, bottom = base + (rows.length - 1) * lead + size * 0.4;
    const ctx0 = drawingContext;
    const g = ctx0.createRadialGradient(W / 2, (top + bottom) / 2, 10, W / 2, (top + bottom) / 2, 560);
    g.addColorStop(0, `rgba(14,6,2,${0.5 * lineAlpha})`); g.addColorStop(1, "rgba(14,6,2,0)");
    ctx0.save(); ctx0.translate(0, (top + bottom) / 2); ctx0.scale(1, (bottom - top + 160) / 1120);
    ctx0.translate(0, -(top + bottom) / 2); ctx0.fillStyle = g; ctx0.fillRect(0, top - 400, W, bottom - top + 800); ctx0.restore();

    textFont(this.f.serif); textSize(size); textAlign(LEFT, BASELINE); noStroke();
    rows.forEach((row, ri) => row.forEach((wd) => {
      const a = Anim.progress(t, wd.s - 0.05, 0.22, Anim.ease.outCubic) * lineAlpha * flicker;
      if (a <= 0.001) return;
      const y = base + ri * lead + (1 - Anim.progress(t, wd.s - 0.05, 0.3, Anim.ease.outCubic)) * 14;
      // warm while sung, cool back to bone over 0.5 s after the word ends
      const heat = t < wd.s ? 0 : t <= wd.e ? 1 : 1 - Anim.progress(t, wd.e, 0.5);
      const c = BONE.map((b, k) => b + (EMBER[k] - b) * heat);
      const ctx = drawingContext;
      ctx.save();
      ctx.shadowColor = `rgba(18,8,3,${0.95 * a})`; ctx.shadowBlur = size * 0.3; ctx.shadowOffsetY = 3;
      fill(c[0], c[1], c[2], 255 * a); text(wd.w, wd.x, y); text(wd.w, wd.x, y);
      if (heat > 0) {
        ctx.shadowColor = `rgba(255,120,40,${0.55 * heat * a})`; ctx.shadowBlur = size * 0.6; ctx.shadowOffsetY = 0;
        fill(c[0], c[1], c[2], 110 * heat * a); text(wd.w, wd.x, y);
      }
      ctx.restore();
    }));
  }
});
