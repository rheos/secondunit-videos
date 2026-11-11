# Audit: Reform Party, Dali boardroom draft 1 (ARGQD4m8DGI)

Robin's notes, 2026-10-16: on the real art car the chairs were much lower to the ground and there were more of them;
it needs more Dali things; it's sparse, and it's Burning Man, so a lot more should be going on, preferably tied to the
lyrics. Should we use three.js? Bring in the reference profiles: Terry Gilliam, Mark Von Ulrich, Joel Nakamura.

## Creative

What works (protect list): the empty Dali playa with low horizon and long hard shadows; faceless egg-head suits; the
crutches; props melting over the table edge; the blind over the blue sky on "control the blues"; the spin; the burn
outro with the table rolling into the dark; Little Bob up through the hole and past the embers.

What fails:
1. The car is wrong to the source. Seats float at shoulder height under a tall table; seven suits read as a dinner
   party, not a board. Fix: table top at 1.15 m, seats at 0.65 m (low enough to hop on and off without help, Robin), 14 suits (6 a side + one
   at each end).
2. The playa is empty for a festival. Five elephants and nothing else. No camps, no people, no art cars, no crowd at
   the burn. The burn has no witnesses, so it has no weight.
3. The lyric is acted only on the table. In wide shots nothing on the playa answers the words.
4. The climax is a small fire in the distance. It should be the biggest, brightest image of the film.

What the three profiles add (one or two moves each, kept to allegory, no real people):

| Profile | Question | Moves used |
|---|---|---|
| Gilliam | What respectable thing can be cut out, made to misbehave, turned into the next thing? The stiff thing is the board. | Crowds of copies: a column of identical suits rolls across the playa on wheels in every refrain and nods as one on "rehearsed". Stop from above, once: a giant gavel drops out of the sky at the end of the last refrain and flattens the playa into dusk. Lie about scale: chess pieces the size of art cars on "knight to queen's rook". Take the lyric literally: blackbirds fly out of the pie of lies. Wind-up chattering teeth roll by on "soundbite". |
| Von Ulrich | Give the idea a body. | Enlarge the faculty: a monumental ear on crutches stands on the playa from "every tape recorder" on; the recorders stack on its lobe. The gag becomes a mouth sculpture with a padlock on "gag order". |
| Nakamura | What if this thing had a world inside it? | Inhabit the object: tiny burners climb the line chart on the whiteboard. A route: at dusk the crowd walks a spiral procession to the Man, then rings it; on "we didn't vote" they hold up ballots, which burn and rise as embers. |

Burning Man density, all code-drawn: a ring of camps (geodesic domes, shade tents, flags), lamp posts that light at
dusk, bikes crossing (people on wheels, Gilliam's cheat), dust devils (one rises on every "spin"), more stilt
elephants, some carrying newspapers or a ballot box, newspaper tumbleweeds on "news", a soft clock art car whose face
drips and whose hands run backward on "once upon a time", fire spinners at night.

## Technical

- three.js? Not now. The renderer is already a 3D pinhole camera (`P()`): real depth order, perspective, ground
  shadows from a sun vector, and camera moves between shots. three.js would add lit volumes and real shadow maps, but
  the look is flat painted shapes with hard drawn shadows, and every figure is a 2D cut-out facing camera. Porting
  would mean rewriting every figure for little visible gain. Revisit only if we want true 3D lighting on the props.
- Cost: frames draw in ~150 ms; the density pass must stay under ~400 ms so a full local render stays under 30 min
  (or goes to cloud-render).
- Layering: the car is drawn on its own layer, graded, then composited over the burn so flames sit behind the table.
  New night emissives (lamps, spinners) go in the background emissive pass.
- Known draft-1 defects: the "truth" light read as a sun at 2:15 (smaller now, recheck); 14 s static opening (now a
  slow push past camps and bikes); riot police too small (camera closer).
- QA for draft 2: event-frame contact sheet, badframes (only the fades), flashcheck, before/after vs draft 1 on the
  protect list.
