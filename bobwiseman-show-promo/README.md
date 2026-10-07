# Bob Wiseman show promos (HyperFrames spike, 2026-10-07)

One 15 s vertical (1080x1920) promo template, rendered once per upcoming show.

- `promo/` is a HyperFrames project (`npx hyperframes init`, v0.8.139). `index.html` is the template.
  Show details are composition variables: `act`, `with`, `dow`, `date`, `city`, `venue`, `slug`.
- Audio: the "I'm an airplane on the highway" hook from the 2026 Airplane recording, 70.8-86.0 s,
  cut from `../bobwiseman-airplane-on-the-highway/source/airplane-2026.wav` (not in git).
- Look: riso print (Bob picked RISOGRAPH among his Airplane favourites). Pink and blue plates,
  misregistered, paper grain. The plane drives the highway, then takes off on the last "highway".
- `shows.json`: upcoming dates from bobwiseman.ca/tour-dates (page modified 2026-09-24), Oct 20 on.
  Left out: Nov 13 (no city listed). Saint John (Oct 22) and Toronto (Dec 4) say "Venue TBA".

Render and stitch:

```bash
cd promo && npx hyperframes render --batch ../shows.json --output "../renders/{slug}.mp4" --strict-variables
../stitch.sh
```

`renders/` is throwaway output.

## Leg promos (2026-10-07)

Bob is more likely to want one ad per leg of the tour than one per show. `legs.py` groups `shows.json`
into legs (same act, no more than 7 days between shows) and writes the variables for the next leg
to `next-leg.json`. A leg of one show uses the single-show template (`promo-rig/`); a longer leg uses
`promo-leg/`.

- `promo-leg/`: 29 s, the hook plus "sick of the passing lane" and "...in the sky flew". The card lists
  every show in the leg; rows share the space, so 3 shows get big rows and 11 get tight ones.
  The plane rig (from bobwiseman-airplane-type) sings with the vocal stem, watches a car overtake
  on "passing lane", and looks up at the sky on "sky flew". It never takes off.
- 9:16 delivers at 720x1280: render, then scale with `-crf 23 -maxrate 4.5M -bufsize 9M`.
- `hyperframes check` reports `text_occluded ... inside #rig` for every text block: the checker
  can't see that the canvas is transparent. Check frames by eye instead.

```bash
python3 legs.py --today 2026-10-07
cd promo-leg && npx hyperframes render --variables-file ../next-leg.json --strict-variables --output ../renders/leg/next.mp4
```

## Rebuilding the audio (not in git)

The clips come from the 2026 recording in `../bobwiseman-airplane-on-the-highway/source/airplane-2026.wav`.
`assets/voc.js` (the vocal envelope that drives the plane's mouth) is already committed.

```bash
A=../bobwiseman-airplane-on-the-highway/source/airplane-2026.wav
ffmpeg -ss 70.8 -t 15.2 -i $A -af "afade=t=in:d=0.12,afade=t=out:st=14.0:d=1.2" -ar 48000 promo/assets/airplane-hook.wav
cp promo/assets/airplane-hook.wav promo-rig/assets/
ffmpeg -ss 70.8 -t 29.0 -i $A -af "afade=t=in:d=0.12,afade=t=out:st=28.5:d=0.5" -ar 48000 promo-leg/assets/airplane-leg.wav
```
