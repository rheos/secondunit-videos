# Kevin Ngo reference profile

Built 2026-10-20 (issue #271). A study of Kevin Ngo's code-drawn short films and loop GIFs,
posted on X as @kevin_t_ngo through 2026: every frame drawn by code (Canvas 2D or Blender driven
by Python), written by Claude, with scores composed in code. It exists so a video session can ask
"what would Ngo add to this shot?" and get an answer anchored to a specific film.

Why now: Robin has flagged his work three times as the bar for clean code-drawn animation ("very
clean compared to a lot of what we've been doing", 2026-10-18), we have already built two of his
surfaces, and on 2026-10-20 he asked for his newest film, the paperclip and the sticky note, to be
studied for new animation design recipes. The notes had lived only in session memory.

## Start here

- `AGENT-DIRECTION.txt`: the one-page "What would Ngo add?" pass. Give it to an agent with a shot or
  section brief. It returns the object (material, body, job), two options with anchors, a
  recommendation, and what stays.
- `STUDY-paperclip-and-sticky-note.md`: the shot list of the 2026-10-20 film (S1-S20, with the cut
  grid) and the fourteen recipes read off it (P01-P14), plus where each bears on our films.
- `STUDY-paper-boat.md`: the shot list of the 2026-10-18 paper boat film (B1-B24, hard cuts on a
  2.5 s grid), its look (flat fills with one speckle grain, ink only on the boat and the cat, mirrored
  water) and recipes P15-P22, numbered after the paperclip study's.
- `works-index.json`: the posts we have studied, K01-K16, with status IDs where recorded and the
  process facts from his own "How this was made" replies.
- `STYLE-BRIEF.txt`: the marker-and-ink-on-cream-paper surface of the paperclip film, for when the
  look is wanted as well as the thinking.

## Rights: why there are no images here

The films are his. This folder holds no frames, stills or clips, and the library card in
`references/index.html` is our own drawing of a bent paperclip and a note, not a frame. Watch the
post before building on any device; links are in `works-index.json`. Three posts (K04, K05, K07) are
subscriber-only; Robin subscribed on 2026-10-19 and they are for study only, never to be republished
or described publicly.

## Fact and inference

Fact: what a post shows, what its caption says, and what Ngo wrote in his "How this was made"
replies (K13, K14), which list every tool and source. Everything else, including every recipe and
every reading of why a device works, is our inference and is labelled so in the study. We do not
know his process for the paperclip film specifically; no process reply had been posted when it was
fetched. The code facts (K16) come from public mirrors of files he once posted, not from him directly.

## What he does, in one paragraph (inference)

One small object is the hero: a paperclip, a paper boat, a blue orb, a robot arm. It has a face of
two dots or no face at all, and it travels through a chain of concrete places built from things
everyone recognises. The film locks one look from first frame to last. Sound is a score written in
code, so the cuts sit on a grid he controls. The ending rhymes with the opening. He uses no
image or video model for the drawn films, and says so in the caption each time, which is part of
why they read as clean.

## Our use of his manner so far

| Where | What | Record |
|---|---|---|
| `mv-projects/indieagent-clean-vector-test` | The K01 clean vector look: an IndieAgent ticket stub stamped BOOKED. Robin: "the look lands" (2026-10-19). | rheos/secondunit-videos PR #232 |
| `mv-projects/bobwiseman-travel-agent` | Built from his honey-bee prompt ("Kevin Ngo manner" in its README); gaps against his bee listed in the clean-vector memory. | drafts 1-17 |
| `bobwiseman-travel-agent/js/arm.js` | The K06 robot-arm look as a switchable option (`?look=arm`). Kept for other films. | PR #239 |
| `blender-orb-visualizer` | Take 01 shares K02's premise; his version anchors every cut on the orb. | takes 01-04 |
| `secondunit/CANVAS-LOOPS-OFFER.md` | Loop mechanisms from K12 feed the Canvas loops offer. | scoping doc |

## Sources

- The posts themselves, fetched 2026-10-19 and 2026-10-20 (public ones through api.fxtwitter.com;
  subscriber ones read in the signed-in browser).
- His "How this was made" replies on K13 and K14.
- Code mirrors listed under K16.
- Session notes 2026-10-18 to 2026-10-20 (IndieAgent umbrella memory, `clean-vector-ui-anim-reference`).
