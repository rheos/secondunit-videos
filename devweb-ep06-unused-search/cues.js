// devweb ep 6: the sound cue list. A classic script, so index.html and write-cues.mjs both read this one file.
// window.CUES(w, T, H) -> [{ k, t, d? }, ...]. w is VO.w, T the anchors, H the timeline.js exports (CARD_PLAN, STREAM,
// COUNT_IN, counterN, MARKER, worldDim...). Every time is T plus the same offsets the station uses, so a retimed anchor
// moves its cue with it. Where an offset below is copied from a station (the number is in the comment), change both.
// Kinds are the KIT table in tools/devweb-kit/sfx_earshot.py, one kind per kind of event:
//   blip     a card lands in the queue            pop    Blink's own card pushes out of its body
//   swipe    a card goes into the slot (the flap) zipdown a card slides down a chute
//   stamp    the mass moment's onset, and the 36  riser  the counter's climb (d = its length)
//   tick     the counter, thinned to every 4th   thud   the description plate lands
//   ding     the default tag's swing              draw   something lights (d = its length): the right chute, day 53, tag, new setting
//   slide    something rides in on a rail (d)     whoosh a big sheet moves (d): strip, note flight, option panels
//   zip      the marker's run                     strike the marker stops on day 53
//   land     the note lands                       type   a log row arrives
//   sting    the end mark                         slam   an overlay slams (added by index.html and write-cues.mjs)
window.CUES = function (w, T, H) {
  const out = [];
  const add = (k, t, d) => out.push(d ? { k, t, d: +d.toFixed(3) } : { k, t });
  const { CARD_PLAN, STREAM, COUNT_IN, MARKER } = H;

  // ---- cards (CARD_PLAN is the one schedule; cards.js moves them, crate.js lifts the flap) ----
  CARD_PLAN.forEach(({ keys, chute }) => {
    keys.forEach((k, i) => {
      const [t0, place, d0] = k, dur = d0 || 0.35; // STEP in cards.js, also what crate.js uses for the flap
      if (place === "blink") add("pop", t0);
      else if (place[0] === "S" && i > 0) add("blip", t0 + dur); // reaches its queue spot (a step forward counts)
      else if (place === "slot") add("swipe", t0 + dur); // the flap lifts as it arrives (crate.js SLOT_IN)
    });
    add("zipdown", chute[1]); // out from under the crate, down the chute
  });

  // ---- the mass moment, hold 13: the stream pours, the counter climbs to 36 and lands on "one" ----
  add("stamp", STREAM[0]);
  add("riser", COUNT_IN, T.one3 - COUNT_IN);
  const DUR = T.one3 - COUNT_IN;
  for (let n = 4; n < 36; n += 4) add("tick", COUNT_IN + (n / 36) * DUR); // counter.js: n lands at COUNT_IN + n/36 of the climb
  add("stamp", T.one3);

  // ---- dial, tag, plate, right chute ----
  add("slide", T.smarter, 0.4); // meaning (new) rides in on "smarter" (crate.js: 0.4 s)
  add("slide", T.h03 + 0.2, 0.45); // and slides back off
  add("slide", T.july, 0.45); // for good in July
  add("slide", T.july, 0.3); // the right chute grows out under it
  add("ding", T.h07 + 0.1); // the default tag swings (crate.js: swing starts h07 + 0.1)
  add("thud", T.h11 + 0.4); // the plate lands (crate.js: hit = h11 + 0.4)
  add("draw", T.dflt2 - 0.1, 0.6); // the tag glows, hold 22
  add("draw", T.new2, 0.5); // meaning (new) brightens, hold 23
  add("draw", T.h19 + 1.0, 0.9); // the right chute lights: the colour beat, hold 19

  // ---- tray, strip, marker, note ----
  add("slide", T.h15, 0.45); // the empty tray slides in (tray.js: 0.45)
  add("whoosh", T.h16 + 0.2, 1.0); // the strip unrolls (strip.js: 1.0)
  add("zip", MARKER[0]); // the marker runs to day 53...
  add("strike", MARKER[1] - 0.22); // ...and stops on it (strip.js: RUN = MARKER span - 0.22)
  add("draw", MARKER[1], 0.5); // day 53 lights
  add("whoosh", T.h18, 1.1); // the note flies in (note.js: 1.1)
  add("land", T.h18 + 1.1); // and lands in front of Blink
  add("whoosh", T.h21, 0.6); // the strip rolls away

  // ---- option panels and the log ----
  add("slide", T.h24 + 0.1, 0.5); // left panel turns face-on (panels.js: 0.5)
  add("slide", T.h25 + 0.05, 0.5); // right panel turns face-on
  add("blip", T.h25 + 0.3); // "or" rises into the gap
  for (let i = 0; i < 6; i++) add("type", T.h26 + 0.35 + i * 0.36); // log.js: FIRST = h26 + 0.35, a row every 0.36 s

  // ---- the end mark ----
  add("sting", T.endIn);

  // one per kind within a frame: the same event written twice (queue steps that move together) collapses
  out.sort((a, b) => a.t - b.t);
  const seen = {}, kept = [];
  out.forEach((c) => {
    if (seen[c.k] !== undefined && c.t - seen[c.k] < 1 / 30 - 1e-6) return;
    seen[c.k] = c.t; kept.push(c);
  });
  kept.forEach((c) => (c.t = +c.t.toFixed(3)));
  return kept;
};
