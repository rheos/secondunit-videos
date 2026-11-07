// devweb ep 6: the sound cue list. A classic script, so index.html and write-cues.mjs both read this one file.
// window.CUES(w, T, H) -> [{ k, t, d? }, ...]. w is VO.w, T the anchors, H the timeline.js exports (CARD_PLAN, ENTRIES,
// LEVER_THROWS, KNOCKS, PUFFS, BEAM, CORE_*, PLATE_HIT, TAG_SWING, MARKER, BLINKS, PROGRAMS...). Every time is read off
// the same schedule the station draws from, so a retimed anchor moves its cue with it. Where an offset below is copied
// from a station (the number is in the comment), change both.
// Two readers: sfx_earshot.py plays one take per kind it knows (tools/devweb-kit/sfx_earshot.py KIT; a kind it has no
// take for is silent), and finish.sh hands every cue but `draw` to forensics as a declared change, so a real one-frame
// event is not read as a pop. Kinds, one per kind of event:
//   rise     a program's card grows out of its box onto a rail      blip     a card lands on its queue spot (a step forward counts)
//   form     Blink's card condenses in the beam (d)                 pop      Blink's card leaves the beam (was: pushes out of its body)
//   swipe    a card goes into the slot                              knock    a plain card's entry nudges the lever against its stop
//   lift     the tab lifts the feeler (hold 19)                     puff     a puff of steam leaves the stack
//   zipdown  a result leaves the spout onto the trough (was: slides down the chute)
//   dissolve a result dissolves back into the beam (d)              beam / beamoff  the beam opens from the visor (d = how long) / closes
//   strike   the lever leaves a stop (a throw, a snap)              thud     the spring lands the lever on the old stop; the placard lands
//   drop     the placard falls onto its rods (d)                    slide    something rides in on a rail (d): the meaning (new) plate, programs 2 and 3, the bin out and in
//   unfold   a core ring unfolds (d; three, 0.1 s apart)            draw     something lights (d): the core, the bin's sweep, day 53, the tag, the new plate
//   dim      the core's glow settles to its rest, then goes out (d) up / down  the counter stands up on its shelf / lies down (d)
//   stamp    the mass moment's onset, and the 36                    riser    the counter's climb (d = its length)
//   tick     the counter, thinned to every 4th                      ding     the default tag's swing
//   whoosh   a big sheet moves (d): strip, note flight, panels      zip      the marker's run           strike  the marker stops on day 53
//   land     the note lands                                         type     a log row arrives
//   sting    the end mark                                           slam     an overlay slams (added by index.html and write-cues.mjs)
//   eye      a blink (no sound; declared for forensics)
window.CUES = function (w, T, H) {
  const out = [];
  const add = (k, t, d) => out.push(d ? { k, t, d: +d.toFixed(3) } : { k, t });
  const { CARD_PLAN, ENTRIES, STREAM, COUNT_IN, MARKER, LEVER_THROWS, KNOCKS, PUFFS, BEAM, PROGRAMS } = H;
  // cards.js's timings, copied: a Blink card gathers for 0.32 s before its release and condenses over the last 0.3; a
  // result dissolves over 0.35 after a 0.55 flight unless the row says otherwise; a beam card rides 0.9 s to its queue
  // spot, a rail card 1.25 s; a step down the line is 0.35 s and the ride in from the line 0.6 s (a step the entry would
  // interrupt is dropped, as cards.js drops it); the stream's rail cards rise in 0.9 s
  const GATHER = 0.32, CONDENSE = 0.3, DISSOLVE = 0.35, FLIGHT = 0.55, BEAM_Q = 0.9, QUEUE_RIDE = 1.25, STEP = 0.35, ENTRY = 0.6, STREAM_UP = 0.9;

  // ---- the plan's cards: out of the beam or off a box, onto the line, into the slot, home again ----
  CARD_PLAN.forEach((c) => {
    const own = c.from === "blink";
    if (own) { add("form", c.out - GATHER, CONDENSE); add("pop", c.out); } else add("rise", c.out);
    if (c.to !== "slot") add("blip", c.out + (own ? BEAM_Q : QUEUE_RIDE)); // reaches its queue spot
    (c.steps || []).forEach(([ts]) => { if (ts + STEP <= c.in - ENTRY) add("blip", ts + STEP); });
    add("swipe", c.in);
    if (c.tab) add("lift", c.in - 0.05); // machine.js feelerLift: from 0.05 s before a tabbed entry
    add("zipdown", c.result);
    if (own) add("dissolve", c.result + (c.flight ?? FLIGHT), DISSOLVE);
  });
  // the lever: a knock at every plain entry (and every third stream entry, and the 36 seating), from the one schedule
  KNOCKS.forEach(([at]) => add("knock", at));

  // ---- the mass moment, hold 13: the stream pours, the counter climbs to 36 and lands on "one" ----
  add("stamp", STREAM[0]);
  add("riser", COUNT_IN, T.one3 - COUNT_IN);
  const DUR = T.one3 - COUNT_IN;
  for (let n = 4; n < 36; n += 4) add("tick", COUNT_IN + (n / 36) * DUR); // counter.js: n lands at COUNT_IN + n/36 of the climb
  add("stamp", T.one3 + 0.24); // on the 36 seating (counter.js ROLL_LAST), in the gap after "one"
  // every entry of the stream, the way it came: the rails' cards rise 0.9 s before they enter, Blink's form 0.32 s
  // before their 0.6 s flight; each result is out 0.5 s after its entry (ENTRIES) and a beam result dissolves 0.55 s later
  ENTRIES.forEach((e) => {
    const own = e.from === "blink";
    if (own) { add("form", e.at - ENTRY - GATHER, CONDENSE); add("pop", e.at - ENTRY); } else add("rise", e.at - STREAM_UP);
    add("swipe", e.at);
    add("zipdown", e.result);
    if (own) add("dissolve", e.result + FLIGHT, DISSOLVE);
  });
  add("up", T.h13 + 0.3, 0.5); // the counter stands up on its shelf (timeline.js counterUp: 0.5 s, one overshoot)
  add("down", T.h16, 0.4); // and lies down

  // ---- the lever, the plate, the rings, the core ----
  // a swish as the lever leaves its stop (a throw, or the spring's snap back), a thunk where the spring lands it on old
  LEVER_THROWS.forEach(([a, to, d]) => { add("strike", a + 0.06); if (to === 0) add("thud", a + d); });
  add("slide", T.smarter, 0.4); // meaning (new) rides in on "smarter" (timeline.js newPlate: back over 0.4 s)
  add("slide", T.h03 + 0.2, 0.45); // and slides back off (io over 0.45 s)
  add("slide", T.july, 0.45); // for good in July
  for (let i = 0; i < 3; i++) add("unfold", T.added + 0.1 * i, 0.6); // the core's rings unfold on "added" (machine.js: 0.1 s apart, 0.6 s each)
  add("draw", H.CORE_LIT, 0.45); // the core lights: the colour beat, hold 19 (was: the right chute lights)
  add("dim", H.CORE_REST, 0.7); // and settles to its rest glow as the spring snaps the lever back
  add("dim", H.CORE_OUT, 0.7); // the rest glow goes out under the tip (hold 21)
  add("drop", H.PLATE_HIT - 0.35, 0.35); // the placard falls onto its rods (machine.js: from PLATE_HIT - 0.35)
  add("thud", H.PLATE_HIT); // and lands (hold 11)
  add("ding", H.TAG_SWING); // the default tag swings on its post (hold 07)
  add("draw", T.dflt2 - 0.1, 0.6); // the tag glows, hold 22 (machine.js tagGlow)
  add("draw", T.new2, 0.5); // meaning (new) brightens, hold 23
  PUFFS.forEach(([at]) => add("puff", at)); // steam: one per plain run, one every 0.35 s through the stream

  // ---- the beam: open while a card forms or a result dissolves, and through the stream (timeline.js BEAM) ----
  BEAM.forEach(([a, b]) => { add("beam", a, b - a); add("beamoff", b); });

  // ---- the programs, the bin, the strip, the marker, the note ----
  const [slideAt, slideD] = PROGRAMS.slideIn;
  add("slide", slideAt, slideD); add("slide", slideAt + 0.15, slideD); // programs 2 and 3 ride in (programs.js: 3 is 0.15 s behind 2)
  add("slide", T.h15, 0.45); // the errors bin tips out of the foot trunk (timeline.js binOut: softBack over 0.45; was: the tray slides in)
  add("draw", T.h15 + 1.1, 1.8); // the band of light crosses its bed once (tray.js SWEEP)
  add("slide", T.h16, 0.4); // the bin tips back
  add("whoosh", T.h16 + 0.2, 1.0); // the strip unrolls (strip.js: 1.0)
  add("zip", MARKER[0]); // the marker runs to day 53...
  add("strike", MARKER[1] - 0.22); // ...and stops on it (strip.js: RUN = MARKER span - 0.22)
  add("draw", MARKER[1], 0.5); // day 53 lights
  add("whoosh", T.h18, 1.1); // the note flies in (note.js: 1.1)
  add("land", T.h18 + 1.1); // and lands in front of Blink
  add("whoosh", T.h20 - 0.15, 0.6); // the strip rolls away (strip.js: from h20 - 0.15)

  // ---- option panels and the log ----
  add("slide", T.h24 + 0.1, 0.5); // left panel turns face-on (panels.js: 0.5)
  add("slide", T.h25 + 0.05, 0.5); // right panel turns face-on
  add("blip", T.h25 + 0.3); // "or" rises into the gap
  for (let i = 0; i < 6; i++) add("type", T.h26 + 0.35 + i * 0.36); // log.js: FIRST = h26 + 0.35, a row every 0.36 s

  // ---- the end mark ----
  add("sting", T.endIn);

  // Blink's blinks: no sound (sfx_earshot.py skips kinds it has no take for); declared so forensics reads the lid closing
  // and opening as designed changes, not pops. Close is over by +0.067 s, the eyes reopen from +0.1 s.
  (H.BLINKS || []).forEach((b) => { add("eye", b + 0.033); add("eye", b + 0.133); });
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
