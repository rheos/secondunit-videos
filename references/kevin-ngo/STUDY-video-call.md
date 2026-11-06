# Study: the animated video call (Dessa demo)

Kevin Ngo, posted 2026-10-23 7:55 pm Pacific (K17 in `works-index.json`).
https://x.com/kevin_t_ngo/status/2113826699402219999
"I made an animation on top of one of Dessa's demo convos." 1920x1080, 30 fps, 2:17.6, with sound.
Dessa is Block's full-duplex speech model (block.xyz/dessa); the audio is their published demo
conversation between a person and the model, used as found.

Studied 2026-10-23 from the 720p MP4: one frame every 3 s, one a second around every camera move,
10 fps strips of both faces during speech, and scene-cut detection (ffmpeg `scene > 0.08` and
`> 0.18`, same eight cuts both times). No frames are committed here. No "how this was made" reply
had been posted when fetched.

"What happens" is read off the frames. "The recipes" is our inference about why it works.

## What happens

The whole film is one drawn call window: dark grey ground, two rounded video tiles side by side,
a name pill bottom left of each tile ("Human", "Dessa"), a speaking indicator (three bars in a blue
dot) top right of whoever talks, live captions centred under the tiles with a small grey speaker
label before each line, and a toolbar along the bottom (clock "6:15 PM | Human & Dessa", mic,
camera, captions, emoji, present, hand, more, red hang-up; info and people icons at the right).

| # | Time | Shot |
|---|---|---|
| S1 | 0:00-1.5 | Human alone in one centred tile, eyes closed, waiting. |
| S2 | 1.5-2.5 | Dessa joins: the tile splits to two-up, a "Dessa joined" toast bottom left, Human waves. |
| S3 | 2.5-12 | Two-up, small talk. Both faces act; the listener smiles and nods. |
| S4 | 12-17.1 | Slow push toward Human's tile as he gets excited about the launch; a hand comes up. Dessa's tile slides off right. |
| S5 | 17.1-19.7 | Hard cut to Dessa full frame, listening to his big news. "Whoa." Both hands up. |
| S6 | 19.7-22.7 | Two-up. Dessa's hands rise. |
| S7 | 22.7-25.0 | Dessa full frame, hands on her head: "I was so blown away." |
| S8 | 25.0-65.3 | Two-up for 40 s. Only the faces, the hands and the captions move. |
| S9 | 65.3-67.3 | Human full frame, waving it off: "No, okay, no, f*** advertising." |
| S10 | 67.3-109.7 | Two-up for 42 s. Human scratches his head, covers his mouth to cough, is told to "cuff up" his mic. |
| S11 | 109.7-111.5 | Dessa full frame, listening while he fixes the mic. |
| S12 | 111.5-131 | Two-up. |
| S13 | 131-134 | The camera trucks right across both tiles and settles on Dessa ("Oh yeah, for..."). The tiles are one strip; the move shows it. |
| S14 | 134-137.6 | End card on the call grey: both heads, "Human & Dessa", "A real conversation between a person and an AI voice, animated.", two pills ("Human a real person", "Dessa an AI voice"). |

Four hard punch-ins in 2:17, each 1.8 to 3 s, and two camera moves. Everything else is the static
two-up. Three of the five full-frame shots go to the listener, not the speaker.

Faces, from the 10 fps strips: a white disc (Human) or oval (Dessa) with a heavy, even black
outline; eyes are white circles with black dot pupils (Human's sit inside round glasses); arched
brow strokes; one mouth at a time from about five: closed line, small smile, open smile with a pink
tongue, wide open, small "o". The mouth changes roughly every 100 ms while speaking and follows the
voice's loudness more than its phonemes (reading). Blinks, eyes closed for laughs and sighs, eyes
sliding sideways, a head tilt of a few degrees, a small bob on stressed words.

Bodies: the torso is a coloured shirt between two black lines that run off the bottom of the tile;
there are no arms until a gesture needs them. Then a black mitt hand on a black line arm comes in
(wave, palms up, hands on head, hand behind the head, hand over the mouth) and leaves.

Rooms: flat vector with no outlines. Human's is warm (butter wall, window onto a blue city, a red
sun poster, a full bookshelf, a monstera). Dessa's is cool (lavender wall, fairy lights, a shelf of
books and a plant, a trailing vine, a sunset poster, a white armchair, a floor lamp). Each room is
one colour family; the characters are the only things with ink.

Captions: plain white sans on the call grey, one line per speaker, two lines stacked when they talk
over each other (it is a full-duplex demo, and the overlap is the point). In punch-ins the captions
sit over the picture, lower centre, no box.

## The recipes

Numbered so a storyboard can cite them (Ngo V01...).

**V01. The interface is the set.** A call window everyone has sat in tells the viewer "this is a
real conversation" before a word is spoken. All the realism goes into the chrome (clock, toolbar,
name pills, speaking bars, toast, captions); the drawing inside the tiles stays as simple as it
can. To use it: pick the frame the audio already lives in (a call, a voicemail, a group chat, a
radio booth) and draw that frame straight.

**V02. Real audio, drawn picture.** The sound is untouched found audio, and the animation serves
its timing: pauses, laughs, talk-over and the coughs stay in. The picture never gets ahead of the
voice. This is "the audio is the clock" with the audio someone else's real moment.

**V03. Ink on the people, none on the rooms.** Heavy even outlines only on the characters; the
rooms are flat colour with no line at all. Each speaker owns one room and one colour family (warm
for the person, cool for the AI), so a full-frame punch-in is identifiable from the wall alone.
Same rule as our `characters-not-marionettes` note (outlined figures on outline-free scenery).

**V04. Act with five parts.** Disc face, two eyes, two brows, one mouth, a tilt. Mouths cycle
from the voice level; blinks, closed-eye laughs and eye slides do the acting. The listener is
never still: the reaction is half the film.

**V05. Hands only when they have something to say.** No arms at rest; a black mitt arrives for a
wave, a shrug, hands on the head, a cough, and leaves. Because hands are rare, every one reads.

**V06. Punch in on the reaction.** Hold the two-up for 40 s at a stretch, then cut full frame for
2 to 3 s on the beat that matters, and usually to the person hearing it. A static frame makes a
single cut feel big.

**V07. Show talk-over as stacked captions.** When both speak, two caption lines, each with its
speaker label, stacked in speaking order. The overlap becomes visible.

**V08. Open on the join, close on the card.** The film starts with one person waiting alone and
the other joining (a toast, the tile split); it ends on a card that names both and says plainly
what the viewer just watched.

## Where it bears on our films

- IndieAgent: the artist agent is a voice an artist talks to. An artist on a call with their agent
  (booking a room, holding a date) is this film's shape exactly: warm room for the artist, cool
  room for the agent, the tour page as the thing the agent shows. Look test in
  `mv-projects/indieagent-call-toon` (issue #306).
- Client work: any interview, podcast or voice memo a client already has can be animated this way
  for the cost of the drawing, with no generation. Real voices, so consent is the voice owner's.
- Bob Wiseman: his phone-call and radio bits could take V01 with a different frame (a radio
  booth, a 1970s phone) rather than a video call.
- Rights: the Dessa audio and the film are theirs. Never use either in anything we publish.
