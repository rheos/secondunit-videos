# Dream of fire, hook: production plan (draft for approval)

## Brief and approval scope

- Song: Hjeron (The Wyrd One), "dream of fire", 97.6 s short mix, `audio/source.wav`. 24 fps.
- Scope: the hook only, frames [1554, 1902) = 64.75 s to 79.25 s, 348 frames, 14.5 s. A section run, not the whole song.
- Format: 16:9. Draft at 720p (H3 at 768P); 1080p only after sign-off.
- Cast from our sheets only. No real footage, no likeness of Hjeron's face.
- Mood: slow-burning mythic desert night. Restraint over chaos; the fire, smoke and cuts carry the energy, not busy graphics. This deliberately overrides the skill's default "chaotic viral" setting, per the brief.

### Calls and cost

| What | Calls | Price | Estimate |
|---|---|---|---|
| H3 Max image-to-video, 768P, 5 s each | 5 clips | $0.03/s (Fal pricing API, 2026-10-09) | $0.75 |
| H3 retries, at most one per clip | up to 5 | same | up to $0.75 |
| Keyframes and plates, GPT Image | 8 images + up to 6 redraws | see below | $0 via Codex |
| Stems, transcription | 0 | Demucs stems and aligned lyrics already exist | $0 |
| SFX | 0 in the draft | | $0 |

**Total cap: US$2.00 of Fal spend** (about CA$2.75), H3 only.

Images: the skill's default is Fal GPT Image 2.5 Sunburst xhigh, but Fal's pricing API lists it as "$1 per unit" with the unit undefined, so I can't quote it. I propose drawing the 8 images with GPT Image through Codex instead (the ChatGPT plan, no Fal charge). That's the same tool that made the two-tone sheets, so the line work will match. It's a model substitution, so it needs your OK. If you'd rather stay on Fal for images, I'd run one test call to learn the real price first.

Approval authorises: the 5 H3 clips plus up to 5 retries within the $2 cap, the Fal uploads they need (sheets, keyframes, vocal stem cuts), and the Codex images. Anything beyond that comes back to you.

## Creative direction

**Premise:** in the hook he names the dream. Fire, then gold, then secrets: the fire answers by raising a serpent of smoke that closes into a ring over the world. Then the flames part and the Antlered Wolf walks out of them unburnt, to sit beside him while the fire sinks to embers.

- Opening hook (S1): he's already playing by the fire, mid-phrase, on the first "I dream of fire".
- Core peak (S4): "the flames reveal". The fire splits down the middle and the wolf steps out.
- Ending (S5): the two of them seen from behind facing the embers, held on the 78.19 s downbeat. Cut to black before "will we wake up".
- Recurring motif: sparks rise on every downbeat (65.49, 67.09, 68.65 ... 78.19 s), building from a few to a storm at S4.

**Style bible**, pasted verbatim into every image prompt:

> True two-tone scratchboard engraving, after a 1930s scraperboard book illustration: pure solid black ground with the image carved out in crisp WHITE engraved lines only. Exactly two tones, no grey, no gradients, no airbrush, no soft glow, no colour. Form is built from the direction and density of the line hatching; most of the frame stays solid black; light exists only where the fire touches something, as scratched rim light. Confident, simplified strokes; silhouettes read instantly. No text, no lettering, no logos, no watermark.

Character keyframes add: "on a perfectly flat chroma green #00B140 background instead of black, the character's own black areas stay pure black, no floor, no shadow".

**Composition:** characters are generated alone on green and composited by p5 over still plates and drawn graphics. **No full-frame H3 shots.**

**Drawn in p5 (code, no generation):** the fire as engraved white flame strokes, the smoke serpent as long hatched smoke ribbons, sparks, the ember field, camera pushes, and transitions that scratch the next shot out of black. No typography anywhere (no title card).

Research notes: [RESEARCH.md](RESEARCH.md).

## Character bible

Both identities come from Robin's approved two-tone sheets, variant a (strict black and white). The fixed v2a versions are in progress; this plan uses whichever version Robin signs off.

- **char-wyrd-v1** (from `wyrd-one-twotone-sheet-v2a.png`): tall lean figure, wide-brim hat, dense black cord-fringe veil from the brim hiding the whole face, long dark wavy hair (never dreadlocks), long shredded duster, laced boots, black Les Paul (the white antlered wolf on the headstock), beaded rosette amulet. Never a face; at most one white eye glint, only where it's planned (S2). No realistic mouth. When the guitar is on his back it hangs upside down, neck to the bottom right.
- **char-wolf-v1** (from `antlered-wolf-twotone-sheet-v2a.png`): a lean pale spirit wolf in white engraved fur, slim antlers matching the sheet, thick smoke-tipped tail, wisps of smoke at the paws. In strict two-tone its eyes are white.

Keyframes are new drawings in new poses, made with the sheet attached as the identity reference. They're never a crop of the sheet. Any identity change gets a new version (v2) and leaves accepted takes alone.

## Storyboard

Frames are song frames at 24 fps; end is exclusive. Each cut falls on a completed lyric phrase.

| Shot | Frames | Time | Lyric | Picture | Layers |
|---|---|---|---|---|---|
| S1 | 1554-1634 (80) | 64.75-68.08 | "i dream of fire, i dream of gold" | Medium-wide, 3/4 front. He plays by the campfire, head dipped toward the neck, rocking on the phrase. The fire licks up in front of him (foreground, lower left); a mesa and stars behind. Slow push in. | P1 plate, C1 sprite, p5 fire + sparks |
| S2 | 1634-1700 (66) | 68.08-70.83 | "i dream of secrets never told" | Close on the veiled head and hat brim, slightly low angle. The head turns slowly toward camera on "secrets", and one white eye glints through the cords on "never told", then the head turns away. Firelight scratches flicker on the brim. | P1 plate (blurred by scale), C2 sprite, p5 flicker |
| S3 | 1700-1785 (85) | 70.83-74.38 | "the serpent's rising / as this world dissolves" | Wide from behind and below. He stands small at the lower right, guitar on his back, looking up. A smoke serpent pours out of the fire and climbs the sky; on "dissolves" it bites its tail and closes into a ring as the horizon line breaks into drifting embers. The camera tilts up with the serpent. | P2 sky plate, P1 ground strip, C3 sprite, p5 serpent + ring + embers |
| S4 | 1785-1824 (39) | 74.38-76.00 | "the flames reveal" | Peak. Head-on into the fire, low. On "reveal" the fire splits down the middle like a curtain and the Antlered Wolf walks out toward camera, head low, smoke curling off its antlers; a burst of sparks. | P3 fire plate, C4 sprite, p5 fire split + spark burst |
| S5 | 1824-1902 (78) | 76.00-79.25 | "the flame absolves" + tail | From behind, wide. He stands to the left, the wolf sits down at his right side and turns its head up toward him. The fire in front of them sinks to embers; on the 78.19 s downbeat it's held, then it scratches to black before "will we wake up". | P1 plate, C3 sprite (late frames reused, no new clip), C5 sprite, p5 embers |

### Keyframes and plates (GPT Image, sheet attached as reference)

Each prompt = the style bible, then:

- **P1 plate, desert camp:** "Night desert plain under a dense star field, a flat-topped mesa on the left horizon, a saguaro on the right, a small cleared fire circle of stones in the lower middle ground with no fire in it, no people. 16:9." (p5 draws the fire.)
- **P2 plate, sky:** "Empty night sky over a distant desert horizon at the very bottom of the frame; long thin streaks of high cloud; a dense star field. Tall framing, 9:16 proportion, so a camera can tilt up it. No people, no serpent."
- **P3 plate, fire ground:** "Low ground-level view across desert sand toward a ring of fire stones at centre, an empty dark plain beyond, a few stars. No fire, no people. 16:9."
- **K1 (char-wyrd-v1), S1:** "The same character as the attached sheet, same design and same two-tone style. Medium-wide, three-quarter front, facing screen-left, standing, playing the Les Paul, head dipped toward the guitar neck, the veil hanging forward. Figure fills 80% of frame height, whole body from mid-thigh up inside the frame with margin around the hat and the headstock. Flat chroma green #00B140 background, no floor, no shadow."
- **K2 (char-wyrd-v1), S2:** "Same character, close-up of the head and shoulders, three-quarter, slightly low angle, head turned away to screen-left, hat brim and veil filling 60% of frame height, cords hanging straight. Whole hat inside frame. Flat chroma green, no shadow."
- **K3 (char-wyrd-v1), S3 and S5:** "Same character seen from behind, full body, standing still, head tipped up toward the sky, the Les Paul slung on his back upside down with the neck toward the bottom right. Figure fills 85% of frame height, feet inside frame. Flat chroma green, no floor, no shadow."
- **K4 (char-wolf-v1), S4:** "The same Antlered Wolf as the attached sheet, same design and style. Front view, walking straight toward camera, head slightly lowered, eyes forward, one forepaw lifted, smoke curling off the antlers and tail. Fills 75% of frame height with margin above the antler tips. Flat chroma green, no floor, no shadow."
- **K5 (char-wolf-v1), S5:** "Same Antlered Wolf seen from behind, sitting, tail curled to the left, head turned up and to the left looking at someone standing beside it. Fills 60% of frame height. Flat chroma green, no floor, no shadow."

### H3 clips (Fal `minimax/h3-max/image-to-video`, 768P, 5 s, prompt expansion off)

Every prompt ends with: "Locked camera, no camera movement, no zoom, the whole figure stays inside the frame, perfectly flat chroma green #00B140 throughout, no shadows on the background, no floor, no text, no extra characters, preserve the exact two-tone white-line-on-black scratchboard style, no grey, no colour, the face is never shown."

- **C1 (K1, S1),** vocal stem from 64.75 s (local 0.00), 5 s: "Same veiled guitarist plays the Les Paul to the vocal phrase 'i dream of fire, i dream of gold': strumming hand moves on the beat, head rocks forward on 'fire' and lifts on 'gold', shoulders sway, the cord veil swings with the head, the coat hem stirs."
- **C2 (K2, S2),** vocal stem from 68.08 s (local 3.33), 5 s: "Same veiled head, close. On 'i dream of secrets' the head turns slowly from screen-left toward camera; on 'never told' a single small white eye glint shows through the cords for half a second, then the head turns away again. Cords sway, hat brim tilts slightly. No mouth."
- **C3 (K3, S3 and S5),** no audio, 5 s: "Same figure from behind stands still, looking up at the sky; head tilts slowly further up, the coat's shredded hem and hair lift in a rising wind, the guitar on his back sways slightly. In the last two seconds he lowers his head and stands quietly."
- **C4 (K4, S4),** no audio, 5 s: "Same Antlered Wolf walks steadily straight toward camera, head low, eyes forward, smoke streaming back off the antlers and tail; it stops close to camera and lifts its head. The figure stays inside the frame."
- **C5 (K5, S5),** no audio, 5 s: "Same Antlered Wolf seen from behind, sitting; it shifts its weight, curls its tail around its paws and turns its head up to the left as if looking at a companion, then holds still. Smoke drifts off the antlers."

### Placement and motion (p5)

- S1: P1 at 1.0 scale, slow push to 1.08; C1 centred at x 0.58, feet below frame; fire at x 0.32 in the foreground.
- S2: P1 at 2.2 scale, softened by scale; C2 at x 0.55.
- S3: P2 tilts up 35% across the shot; C3 at x 0.78, small (45% of frame height); the serpent path is a cubic curve from the fire (x 0.5, y 0.85) to a ring centred at (0.5, 0.25), closing on frame 1745 ("dissolves").
- S4: P3 static; fire split on frame 1785, wolf C4 from frame 1787, spark burst on frame 1801 (downbeat).
- S5: P1; C3 frames 72-120 at x 0.40; C5 at x 0.58; fire to embers across 1824-1876; hold, then scratch to black over frames 1890-1902.
- Every cut is a hard cut; transitions are only S5's scratch to black.

### SFX and VFX

None in the draft. Swift VFX (grain-free light bloom on the fire) is an option after sign-off.

## Production waves

1. Pilot (2): K1 + C1 (opening) and K4 + C4 (peak). I review the keyframes before animating them.
2. Next (3-4): K2/C2, K3/C3, K5/C5, plates P1-P3.
3. Assembly: p5 sketch per shot, then concatenate against the unbroken song and check the frame count (348).

## Review and delivery

Check: identity against the sheet at full size on every frame (veil tips dark, no face, guitar orientation on his back, the wolf's antlers matching the sheet), alpha edges, no grey creeping into the two-tone, head phrasing against the vocal at normal speed, frame count. Deliver `output/hook_draft_720p.mp4` (clean), the contact sheet and this plan.
