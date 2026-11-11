# Study: the lantern-paper San Francisco film (K45)

Kevin Ngo, posted 7:25 am Sun Nov 8, 2026 (Pacific): https://x.com/kevin_t_ngo/status/2119436039488156158.
1080x1080, 37.5 s, 24 fps, with a score. Studied Nov 9, 2026 (issue rheos/secondunit-videos#463). No
frames are kept here; watch the post before building on any recipe.

## What he says (fact)

- Caption: animation by Claude Opus 5.5; "Paintings and paper textures generated with GPT Image 2.6 via
  @fal"; "All motion written in code".
- Replies: the movement is JavaScript written by Claude, "Plain js!"; the music was composed by Claude;
  he loves perfect loops and tries to make most of his animations loop.
- To LottieFiles, "is this one-shot?": no, about 15-20 prompts. One prompt had Claude give him style
  choices, shown as a board, and he picked lantern paper.
- The board (posted in that reply): "San Francisco film, style board". Three numbered styles, each with a
  name and a one-line medium: Marine Layer (gouache and pencil on fog-blue paper), Hill Press (five
  overprinted inks, slightly off register), Lantern Paper (cut and layered painted papers). Each style
  paints the same two test scenes, labelled "heights sun" and "avenues fog". Six images, one grid.

This is the first film in our index where he uses an image model. Earlier drawn films (K01-K44) said
every frame was drawn in code.

## The film (fact, read off the frames)

A small cut-paper sun lives in a painted mural in a Mission-style alley. It peels off the wall, showing
its cream paper back with a pencil guide circle, and leaves a grey blank in the mural. It crosses the
city and comes back to fill the blank.

| Time (s) | Place | What moves |
|---|---|---|
| 0-2.5 | Mural close-up, magenta wall | The sun peels away; its paper back shows; a grey disc is left |
| 2.5-4.4 | Mural, then the alley | Pull back from the blank to the alley; the sun is already off the wall |
| 4.4-8.1 | Park on a hill | A palm frond sweeps past in the foreground; the camera climbs the streetcar tracks after the sun; a streetcar comes down; kites |
| 8.1-13.8 | Garden stairs of a Victorian | Sun climbs the stairs; swallows, falling petals; fog starts to slide in at the top |
| 13.8-16.3 | Inside the fog | Torn grey paper sheets drift; a red and white striped tower leg passes diagonally |
| 16.3-18.8 | Above the fog, row houses | The sun rises over the Avenues; windows lit |
| 18.8-21.9 | Fog close-up | The sun's halo heats from cream to orange and burns a torn hole; the ocean at sunset shows through; the torn edge peels away to reveal the Avenues running to the beach |
| 21.9-25.6 | Ocean Beach at sunset | The small sun flies out over the water toward the real sun on the horizon |
| 25.6-30 | Dusk over the hills, then a lit bay window | The sun passes the tower and a lamp-lit window |
| about 30 | A big fern leaf | The leaf crosses the frame as the wipe back to the alley |
| 30-37.5 | The alley, then the mural | The sun goes up the alley and settles into its blank; the last frame matches the first |

Hard cuts at 2.5, 4.375, 8.125, 13.75, 16.25, 18.75, 21.875 and 25.625 s (ffmpeg scene detect). Every one
is a multiple of 15 frames (0.625 s). After 25.6 s the changes are wipes (leaf, camera moves), which the
detector does not catch. The score's tempo was not measured; 0.625 s is one beat at 96 bpm if that is the
tempo.

## How it seems to be built (inference)

- Each place is one large painted plate, bigger than the frame, and the camera travels across it after
  the sun. Foreground pieces (the palm frond, the fern, plants on the stairs) move faster than the plate,
  so they are separate cut-out layers.
- Small actors are sprites moved in code: the sun, gulls, swallows, kites, the streetcar, petals, wave
  strips.
- Fog is several sheets of a generated torn-paper texture, moved and opened in code. The burn-through is
  a torn-edge mask that grows from the sun.
- The sun is one sprite throughout, with a few states: flat, haloed in the fog, glowing hot.
- Plates came from GPT Image in the chosen medium. We do not know whether layers were generated
  separately or cut out of one plate.

## Recipes (L01-L08, ours to take; vocabulary only)

- **L01 Style board before plates.** Pick two test scenes that carry the film's two moods (his: a sunny
  height and a foggy street). Paint both in three named mediums, each with one line that says what the
  material is. Show the six as one board and let the client or director pick. The chosen name and line go
  into every plate prompt after that. This is our "3 looks first" offer made concrete and cheap: the
  same two scenes in each look, so the choice is about the medium, not the subject.
- **L02 The hero is lifted out of a picture.** It peels off the wall it was painted on, shows its paper
  back, leaves a blank, and comes home to fill it. The empty shape is the stakes, and the return closes a
  perfect loop.
- **L03 Show the back of the cut-out.** A cut-paper hero has a back: plain stock, a pencil guide line, a
  construction mark. One frame of it says "this is paper" better than any texture.
- **L04 Weather as torn paper.** Fog, cloud or smoke as layered torn sheets that drift past the camera,
  and the hero tears or burns a hole that reveals the next place. A transition that follows the hero
  (our transitions-follow-an-element rule), with the tear edge as the wipe.
- **L05 Follow the hero across one big plate.** Instead of cutting to a new angle, move the camera across
  a plate larger than the frame, and slide a foreground cut-out past the lens on the way in or out.
- **L06 Small thing meets its big version.** The paper sun flies to the real sun at the horizon. A scale
  rhyme as the film's high point, no words.
- **L07 Light the windows on the way home.** Day to sunset to dusk, with lit windows as the sign of
  evening, so time passes without a clock (P07 again, here with plates).
- **L08 Cut on a frame grid.** Hard cuts on multiples of 15 frames at 24 fps, wipes in between. Same
  habit as K10's 64-frame grid; with a song, use its beat grid from our clock.

## Where it bears on our work

- **The 3-looks offer and the Academy Kit.** L01 is the step most worth taking: a style board as the
  first deliverable of a music video, and as a lesson ("choose a medium before you paint"). With plates
  from Codex GPT Image it costs no credits.
- **Plate looks.** Our paper looks are drawn in code (`paper-depth`, `cutpaper`) or use generated fills
  (`scrap`). The lantern-paper film shows what painted plates add: real paper fibre, a lit painted sky,
  dense flowers, more detail than our code-drawn paper reaches. The motion is the same kind we already
  write.
- **cleanline.** Its clock, frame driver, render and check tools would carry a plate film unchanged. Its
  contract says no images, so a plate layer would be a new optional module and Robin's call. It does not
  belong in the kit until a plate look is approved.
- **Bob's films.** A journey through one town, home at the end, fits 10,000 Miles and Travel Agent's
  premise. Never his San Francisco, his mural sun, or his shot order.

## Not to copy

His composition, the sun, the mural, the San Francisco route, the shot list, the style board images and
the three style names as a set. Take the method (board, plate plus code, torn-paper weather, hero lifted
out of a picture) and build a new subject in a new place.
