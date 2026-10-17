# Audit: Reform Party draft 10 (camera, spacing, permanence, cues) -> plan for draft 11

Cue words only. Draft 10 = commit 8d11084, `out/rp_dali-v10_720p.mp4`, video time = song time. The monolith rebuild
(261e5b6, 163a855) came after this render. Audited 2026-10-16 by six cold agents, none of whom built the film:
section critics A (0:00-1:14.5), B (1:14.5-2:03.3), C (2:03.3-3:16), D (3:16-4:29), a camera operator (whole film,
with per-frame camera measurements in out/d10audit/cammotion.csv), and a continuity tracker (every recurring actor's
entrance and exit). Full reports: out/d10audit/REPORTS.md (local).

## Robin's notes (override everything)
"i want to do a full audit now to try to figure out camera speed and spacing between characters and objects.. i
don't like people going through each other and actually when you see me i don't bike off screen.. i'm just there a
moment and then blink i disappear.. i'd like a little more consistency and permance and for the camera to be
smoother ... it's just important for it to be lookin gat the important things on cue."
Also asked: the small desk art cars that roll through ("3 or 4 of them.. what's that about?"). They are draft 3's
"copies of the board" (installs.js suitColumn, a Gilliam "crowds of copies" idea), identical mini tables with
suits; they break his "art cars are one of a kind" rule and nothing in the film explains them.

## The numbers
- Camera: view turn median 5 deg/s, p95 47, max 119; speed p95 42 m/s; 22 whip ranges over 45 deg/s, 3 turn jerks,
  17 speed jumps under 40 m height. 24 key pairs are under 0.9 s apart; 29 pairs need more than 30 deg/s average.
- The draft-7 glide (low-pass) is effectively off for about 100 of the 184 s from 0:17 to 3:21 (exact spans).

## Themes (what several critics found independently)
1. **Fades instead of exits (all six).** Solid bodies appear and vanish by alpha or scale while on screen: Robin's
   chopper (61.0-64.6, fades in mid-frame and out at frame centre, its shadow a frame later), the organ cart (156.2),
   the horse bike, the whirl cars (grow from nothing, shrink to a smear: 108.5, 116.4-117.6), the giant chess pieces
   (155.3), the Instrument People (dissolve in front of the fire at 254.8), the parked dragon, galleon and octopus
   and the crowd (258-264), riders culled by rule (200, quiet-window edges), anything 3-8 m from the lens (bmFade),
   the tape recorders, the pie, the patent seal, the press, the clock car (cut at 17.0).
2. **The tabletop blinks out (A, B, C).** car.js drops the whole top when one corner crosses the near plane
   (`if (!ok(topP)) return;`): 29.2-32.7, 46.7-51.2 (through the grin), 87.0-88.7. Clip it instead.
3. **The camera flies through the board (A, B, D, cam).** Passes through or within 0.5 m of suits, chairs and the
   chart: 56.8, 86.9-88.75, 111.3-112.0 (vanes), 169.4, 214.8-215.0 (backwards over the heads), 233.7-235.6.
4. **Whips and stop-and-go (all).** Worst: the dome window flies 36 m out and back in 1.3 s each way (137.4-141.0,
   119 deg/s, empty playa on "wars"/"limit"); the hole keys flip the orbit angle 180 degrees (half-orbits at
   168.3-169.9 and 185.6-189.6); the golden-wide pan 197.7-200.2 (86 deg/s); the book cluster 146.8-149.4 (five keys
   0.6 s apart); the aerial descent spins half round in its first half and hard-lands into a dead stop at 212.6;
   up-down yo-yos (89-92.5, 134-135.6, 183.5-189.5). Causes: keys too close, window blends that lerp two moving
   poses (speed overshoot then a kink), slope zeroing at reversals and at-rest hand-offs (stop then dash).
5. **Cues missed or late (B, C, cam).** Arrival keys sit on the word, not before it: "scientists" (inside the hat),
   "control" x2, "blues" 2, "restrict" 2 and 3, "news" 2, "shamelessly" 2, "facts" 2 and 3, "limit", "mystery",
   "look", "time" (clock hidden), "broke" 2 and 3 small. 10 of 66 cue words land late.
6. **People and cars share space (A, B, C, D, cont).** The sax rider rides through the near row (71.6-72.4, he is
   camera-locked); riders through the Instrument People (74.6, 105.5); the ballot ants through the far row and the
   Instrument People (124.5-126); the clock car parked inside the hourglass; whirl cars within 1 m of the chairs
   (114-117, 191-194) on a radius that changes with the camera; teacup through the eyeball car (186.2); the octopus
   inside the burn perimeter (211); witnesses standing inside each other (235.1); fallen arm drawn over a figure
   (255). Cause: every file places actors on fixed Z lanes from carX with no shared spacing.
7. **One-frame light and colour steps (D).** The crowd switches colour to silhouette in one frame at 218.5; the
   playa goes dark brown for 5 frames at 211.3 with dark sky wedges; grade steps at 203.3 and 246.1.

## Read risk (D, outside the four themes, needs Robin)
On "joke" (223.1) the board's egg heads get tall white pointed caps with X eyes. In a political film, white cones on
white heads can read as Klan hoods. Fix: coloured or striped, shorter, tilted dunce caps with a D or a pompom.

## Do not touch (merged)
0:00-0:18 intro glide into the gavel ("law"); 0:24.7 tape X; 0:27.3 gag lips; 0:32.7 ear and recorders on wires;
0:39.6 blind on "blues"; 0:44.2 press on "news" (only its end is broken); 0:48.3-0:50.4 rosettes to grins; 0:52.4
chart slides off on "facts"; 1:01-1:05 the painter; the sax rider's own entrance (1:05.2) and exit (1:13.0);
1:14.5-1:24 whiteboard crime/right/soundbite; 1:27.3 the drape lift on "unveiled"; 1:31.2-1:32.5 cell towers and
stilt cells on "jails"; 1:36.9 blinds 2; 1:39.5-1:42.2 the sand whiteout and press/cage on "news"; 1:53-1:56 the
overhead spin; 1:58.6-2:01.6 the ant glide; 2:03.3-2:13 vogue, dime, iris, poor person, share, unfair (the best
camera stretch); 2:15.5-2:17.3 crates and "talk"; the dome hold itself 2:18.4-2:19.7; 2:21-2:27 mics, pie, Little
Bob; 2:29.4-2:31 chess top-down and "foul"; 2:36.7-2:47.7 cops paid, perverse roll, rehearsed; 2:50.7-3:02.8
marionette, drape, press and cage, grin; 3:09.6-3:15.6 spin from 27-30 m and the gavel; 3:18.0 sunset disc; 3:19.7
howl; 3:21-3:28 the aerial climb and city map; 3:35.2-3:40 arms up on cue and fireworks; all four votes (220.65,
230.25, 239.93, 249.47); 4:02.6-4:04.7 the 26 m grin; 4:12-4:14.3 the Man breaking on "broke"; 4:15.5-4:24.3
Little Bob's walk (the model for a physical exit); 4:24-4:29 embers to black.

## Plan in passes
- **Pass 0, the checks (tools, first):** (a) a camera check over every frame: turn rate, turn acceleration, speed
  by height, zoom rate, dead stops, and the cue check (each cue word's subject projected on screen, in frame and at
  least 8% of frame height from 0.5 s before to 0.5 s after the word); (b) an actor check: every solid actor reports
  its world X, Z, radius, alpha and scale each frame (a debug registry, off in renders); the script fails any actor
  that fades or scales while on screen and not covered, and any two bodies that overlap. Everything below must pass.
- **Pass 1, the camera rebuild (camera.js, camera-end.js):** one composite path (car-relative keys with the world
  windows substituted, no lerp of two moving poses), then a forward-backward rate-limited follower (critically damped,
  so it does not lag). Limits: view turn 30 deg/s sustained (45 for under 0.4 s on the same subject, 25 when the
  subject changes), turn acceleration 60 deg/s2, 12 deg/s from 0.4 s before to 0.5 s after each cue word; speed by
  height (under 2 m: 3 m/s; 2-5: 5; 5-15: 10; 15-40: 18; above 40 on a log scale); linear acceleration 3 m/s2 under 5
  m, 6 above; zoom 25%/s; ease 0.6 s minimum, window entry and exit 1.2 s, no dead stops, hand-offs carry velocity;
  key spacing at least max(0.9 s, angle/30 deg/s, distance/speed limit); look-at targets land 0.25-0.33 s before the
  word. Specific: the dome on a long lens instead of a 36 m flight; hole keys at z -0.05; the aerial's half turn over
  the whole descent and a moving hand-off; cut the yo-yos (ORBA1, POVS dip, the 89-92 bounce); clearance of at least
  0.6 m from every suit, chair, chart and the table plane, never backwards through the board.
- **Pass 2, permanence (all actor files):** no alpha or scale on solid bodies while on screen. Every actor enters and
  leaves by moving, from or to off frame or behind cover (Little Bob's walk is the model). Robin's chopper rides in
  past the left edge and out past the right (or behind the painter's canvas), with the drone not tracking him so he
  crosses the frame. Whirl cars drive in and out on real paths; chess pieces topple or roll off; the Instrument People
  stand and walk off; the parked art cars and the crowd stay until the black or drive off; riders leave at the wrap
  point, not by rule; colour to silhouette as a 1.5 s crossfade on the fire's light; the tabletop near-plane clipped.
- **Pass 3, spacing:** one lane per group at a time (a registry), plus a per-frame spacing pass for every body
  (people 0.5 m, bikes 1 m, cars half-length + 1 m) that parts or holds, the way the crowd already parts for the
  table. Specific: the sax rider in a world lane outside the seats; the ants cross ahead of the Instrument People;
  the clock car off the hourglass; the whirl on a fixed 12 m radius from the table edge; the octopus parked outside
  the burn ring; riders behind the Instrument People; witnesses 0.8 m apart; the fallen arm depth-sorted.
- **Pass 4, light and read risks:** the dunce caps (if Robin agrees), the one-frame grade steps (203.3, 211.3,
  246.1), the sky wedges at 211, Little Bob's shadow away from the fire.
- **Robin's call:** the copies of the board (keep as a deliberate gag and make it read, or cut).
