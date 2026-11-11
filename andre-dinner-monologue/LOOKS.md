# Andre dinner monologue: looks

Source: a Facebook reel posted by Mark Joyner on 2026-11-05 (facebook.com/reel/1443352110477181), the
restaurant scene from My Dinner With Andre (1981). Robin, 2026-11-09: "grab this reel.. i want to animate
the audio." Audio pinned at `_in/andre.wav` (sha256 in `_in/andre.wav.sha256`), 198.37 s, 4761 frames at
24 fps. Timing from a local faster-whisper pass (`_in/cues.json`); there is no script sheet, so the
transcript's words are the words, checked by ear against the film.

## 1. Brief

**About.** Wally asks whether people are just bored, spoiled children playing with a plastic duck in the
bath. Andre answers for three minutes: boredom is a self-perpetuating brainwashing run by a world
government based on money; a bored person is asleep and someone asleep will not say no. A Swedish
physicist has cut out television and papers. An 84-year-old English tree man at Findhorn says New York is
a concentration camp built and guarded by its own inmates, who are proud of what they built and can no
longer see it as a prison. He puts a pine seed in Andre's hand: escape before it's too late. Andre and
Chiquita feel like Jews in Germany in the late 30s, but the whole world is going the same way. The 1960s
were the last burst of the human being; from now on, robots walking around feeling nothing, and soon
nobody will remember that life existed on the planet.

**The one image.** The prison built by its inmates, who are also its guards. Second: the seed in the hand.

**Mood and arc.** Intimate and dark at a dinner table, hypnotic, a man talking himself toward the end of
the world. Climax at the seed in the hand (138.9 to 140.5 s, "escape before it's too late"). The ending
(195 to 196.5 s, "life existed on the planet") is the biggest, emptiest image. One light arc: a lit
table, then a lit city, then one light on a dark planet, then out.

**Sections (24 fps frames, from cues.json).**

| Frames | Seconds | What is said |
|---|---|---|
| f0-f170 | 0.1-7.1 | Wally: why is that? lazy, bored? |
| f196-f463 | 8.2-19.3 | Wally: bored spoiled children, the bathtub, the plastic duck |
| f508-f1180 | 21.2-49.2 | Andre: we are bored; boredom as brainwashing; asleep will not say no |
| f1209-f1772 | 50.4-73.8 | the Swedish physicist who cut out television and papers |
| f1807-f2431 | 75.3-101.3 | the tree man at Findhorn; New Yorkers who never leave |
| f2554-f3134 | 106.4-130.6 | New York as a camp built by its inmates; guards and prisoners; lobotomized |
| f3168-f3372 | 132.0-140.5 | the pine seed; escape before it's too late |
| f3397-f3845 | 141.6-160.2 | Chiquita and I should get out; the whole world is going the same way |
| f3845-f4315 | 160.2-179.8 | the 1960s were the last burst; robots feeling nothing |
| f4315-f4715 | 179.8-196.5 | nobody left to remind them; history erased; life on the planet |

**Limits.** Free code only, no credits. 9:16 (720x1280) draft and final (Robin's pick, 2026-11-10). No
faces: two real actors, and code can't draw faces. No footage from the film in the animation. The audio
is a copyrighted film scene; posting is Robin's call, and the transcript stays out of git.

**Real people.** Andre Gregory and Wallace Shawn, playing themselves. Never drawn. Gustav Bjornstrand and
the tree man are people Andre describes; the tree man may be drawn as a silhouette.

## 2. Shortlist

Read from the catalogue digest at origin/main 16498d4 (86 looks). Spread: line film, cut paper, type,
paper diorama.

| Look | Why it fits | Section | Cost | Code | Risk |
|---|---|---|---|---|---|
| swift-line (Night-sky line film) | One unbroken pull-back carries the arc: a lit table to a city of robots to the planet. A live readout can count memory draining to zero. Robin expected it to suit documentary. | f3840-f4728 (160.0-197.0), the 1960s to the planet | free | film-bound, `bobwiseman-swift-noimage/scene/ihd_9x16.rb`; needs the noimage renderer cloned and built (about 3 min) | the Swift renderer is two tests old; a monologue has no beat grid for the sound cues |
| papersilhouette (Coloured paper silhouettes) | Profiles dodge faces. A paper skyline rises as a camp wall, figures lay their own bricks and turn into guards, a seed lands in a paper hand. "The best one we have done." | f2548-f3384 (106.0-141.0), the camp to the seed | free | film-bound, `bobwiseman-in-her-dream/js/cut/kit.js` | In Her Dream's motifs (gold rings, the orange) must not come along; 35 s is long for a test |
| type (Kinetic typography) | A monologue is all words. "Somebody who's asleep will not say no" is a dialog box with NO greyed out. Approved look. | f504-f1188 (21.0-49.5), boredom as brainwashing | free | film-bound, `bobwiseman-airplane-type/js/` minus the plane | three minutes of text alone would wear thin; the test must prove text plus interface grammar can hold |
| Fresh: table-to-city diorama | Not in the catalogue. A cut-paper dinner table seen from above: plates, glasses and cutlery rise into a city, the cutlery stands up as a fence, tiny figures walk to the fence and turn back. Ties the dinner to the prison. | f1800-f2544 (75.0-106.0), the tree man to "I don't think it's that way at all" | free | paper-depth engine, `indieagent-paper-depth/js/paper.js` | the table-to-city turn must read in 9:16 without a face; risk of a cute diorama on a bleak speech |

Not shortlisted but read: ministry (ink and newsprint, grey bureaucracy) fits the Orwell line and would be
the fifth; wakinglife is the obvious cinematic cousin (Linklater) but needs footage to trace; woodcut's
propaganda-poster feel suits "inmates are the guards" and stays available.

## 3. Pick

Robin, 2026-11-10 (after midnight Pacific): all four, 9:16 reel. Each gets a 30 s look test on its own
section, in `tests/<slug>/`, renders in `out/`.

## 4. Test 01 notes and the direction for test 02

Robin, Nov 11 2026 (around 1 pm Pacific), on the three test 01 renders:

> the guard hat doesn't look much like a priston guard which i would expect to have a hat more like a
> police than a construction worker. also that hand the seed goes into is pretty bad.. i want this all
> to have more of a 3D world look to it.. which some of it does.. i love the 2D figures in a 3D world
> idea. develop that better.

What that means for the film:

- **The look is now flat paper figures in a real 3D paper world**, for the whole film, not one section.
  Closest catalogue relatives: drawn-playa ("People are flat profile cut-outs placed in the 3D world;
  never mix in 3D-modelled characters") and devweb-world ("One world, one continuous camera", which
  Robin called "our standard" on 2026-10-29). Working slug: `paper-world`.
- **Guard cap:** a peaked cap as police and prison officers wear, never a brimmed work cap or hard hat.
- **The hand** is redrawn from a real hand's proportions and proved on a line-up before it goes in a shot.
- test 02 redoes the camp-to-seed section (f2548-f3384) in this direction: `tests/paper-world/`, brief
  in `docs/BRIEF-test02-paper-world.md`. test 01 files stay as they are. type and table-city wait on
  how test 02 lands.

Robin, Nov 11 2026, a few minutes later: "the table city is best out of what you have done so far.. but
it doesn't have enough movment for the first part." So test 02 is the table-city section (f1800-f2544)
rebuilt as the true 3D paper world, moving from frame one; the guard cap, the hands, the seed and the
pine are proved on a line-up beside it, for the camp section in the same world.

## 5. Reference: the paper-craft storybook film

Robin, Nov 11 2026: "I was just looking at this video and i think i want to to go more or less in this
direction.. without the photo realistic human character." https://youtu.be/JLEUSKq4cX4 ("claude fable
5.2's first fable", anabology, posted Nov 10 2026, 244 s, 854x480 copy in `_in/ref-JLEUSKq4cX4/`).

What it is, read off contact sheets every 4 s (measured on the 480p copy; counts are estimates):

- **Medium:** photographed-looking paper craft. An open pop-up book on a patchwork quilt, a brass lamp
  with a fringed shade top left, a night window top right. Pages cream with a teal cloth border and
  gold-foil edges. Generated footage, not code.
- **Pop-up spreads:** card pieces standing off the page on visible tabs and folds, pale cut edges, real
  cast shadows. One spread builds cumulatively, a piece per line (sand, then a sphere, then a hall of
  folded doors, then a blue paper river, then a house over all of it).
- **Toy theatre:** a paper proscenium with red curtains and shell footlights, a teal night backdrop, a
  paper moon, stars hanging on strings.
- **Characters:** small standee figures and scallop-edged cut-out animals on tab feet, plus a
  photoreal human host. Robin does not want the human.
- **Light:** warm tungsten pools, deep shadow, blue night fill, shallow depth of field.
- **Palette:** teal and navy, cream page, gold foil, red velvet, amber light.
- **Camera and cutting:** about 43 hard cuts in 244 s (a shot every 5 to 6 s); slow push-ins and
  near-static frames inside a shot.
- **Text:** white serif captions bottom centre, with small footnotes.

What we take: the surface (photographed card, tabs, folds, cut edges), the light (one warm source, deep
shadow, shallow focus), pop-up mechanics as the way things arrive, and standee cut-outs as the cast.
What we leave: its book-on-a-quilt setting, its characters and its compositions. Our world stays the
restaurant table from table-city (Robin's favourite of test 01): the place setting pops up into the city,
the cutlery fence becomes the prison wall. Vocabulary, not a copy.

What it changes: the three.js build of the table section becomes the blocking pass (camera, timing,
staging, exported as `out/paper-world/blocking.json`). The finish needs a photoreal renderer. Target
stills in `out/paper-world/styleboard/`.

## 6. Method decision

Robin, Nov 11 2026, on how to make the look move: "what we will do is first do the whole thing with
paintied pieces and once that is all solid we will look at running it through seedance after." And on
the reference: "if you look at that video the majority of it looks like it was drawn with code. i think
this is how they likely did it." (Its credit reads "written, painted and directed by Claude Fable 5.2".)

So:

1. **The whole film is built from painted pieces moved by code.** Free: GPT Image through Codex on the
   ChatGPT plan paints each piece as a paper-craft cut-out on a transparent background, with the
   table-city target still attached as the style reference (`tests/paper-world/plates.json`,
   `paint.sh`). No credits are spent until Robin says so.
2. **The pieces stand in the 3D table world as cards.** The three.js blocking supplies the camera, the
   timing and the positions; each painted piece is a card at its real place and depth, so parallax and
   overlap are exact. Things arrive the way a pop-up arrives: a card hinges up from the cloth, a
   standee slides along a slot, a card turns to show its other side.
3. **People are standees on tabs.** They do not walk with legs; they slide along slots cut in the
   cloth, with a small wobble on twos, like toy-theatre figures. The citizens who go to the fence and
   turn back are literally on rails.
4. **Seedance comes after**, on the finished cut, section by section, once the painted film is solid.
   Estimate first and get Robin's number.

Target stills (approved as the look by Robin's choice of method): `out/paper-world/styleboard/`.
