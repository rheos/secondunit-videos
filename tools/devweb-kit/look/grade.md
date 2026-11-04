# Look bible: grade

Measured 2026-11-02 by the look-bible run (`20261102-devweb-look-bible`). References: cinetic's four example films
(quire, kiln, ledgerly, halden). Ours: episode 1 draft 6 (Robin's approved oner) and episode 5 finish d2. All luma is
Y' (gamma-encoded, BT.709 weights) in 0-255 code values; contrast ratios are WCAG ratios on linear luminance.

The palette is fixed. Two of cinetic's four films are light-ground (ledgerly, halden) and one is a cream card on a
dark ground (quire), so the film that grades like ours is **kiln** (a dark field, 25 s). Kiln is the bar in every
recipe below; the other three back up the one rule they all share (one accent hue, everything else neutral).

## 1. Verdict: the biggest gaps

1. **Colour is always on in ours; cinetic spends it in one beat.** Share of the frame that is saturated (chroma
   >= 60), median frame: kiln 0.0 %, quire 0.2 %, ledgerly 0.5 %, halden 0.1 %; ours ep 1 6.2 %, ep 5 7.1 %.
   Chroma p90: cinetic 4-11, ours 25 (ep 1) and 47 (ep 5). Kiln's one colour beat (the red wall, 4-6 s) reaches
   35.8 % saturated over 2 s, then drops back to 0-1.7 %. Ep 5 sits at 2.4-14.1 % (6 s blocks) for all 130 s.
2. **Ep 5 has no white top.** Brightest 1 % of the frame (p99, median frame): kiln 241, ep 1 236, ep 5 191. Full
   frame contrast range (p99 vs p1): kiln 17.5:1, ep 1 16.2:1, ep 5 10.4:1. Text on its own panel, spot check on one
   frame each: kiln's subject card 14.4:1; ep 5's subject card 8.3:1 and an idle card 2.9:1.
3. **Ep 5's light barely changes across 130 s.** Mean Y' (1 s smoothed) range: kiln 43.9 in 25 s, ep 1 55.4 in 45 s,
   ep 5 33.1 in 130 s. 95th-percentile change of mean Y' per second: kiln 36.6, ep 1 30.1, ep 5 9.8. Kiln has one
   peak at 2.7x its base (49.2 vs about 18) and ends back at base; ep 5's highest 6 s block is 1.7x its lowest
   working block (46.4 vs 28.0). Ep 1 already has the shape (peaks of 66.3 at 18 s and 75.5 at 38 s, the mass moment).
4. **Ours glows; cinetic never does.** Halo past bright edges (median Y' of a ring at a distance, above ground, as a
   share of the emitter's own lift): kiln 0.000 at 4-8 px, 8-16 px and 16-32 px; ep 1 0.067 / 0.050 / 0.006;
   ep 5 0.095 / 0.073 / 0.050. Cinetic's light comes from value contrast, not bloom.
5. **Ep 5's field is lifted off the background.** Share of the frame darker than Y' 20 (our bg `#0d1117` is
   Y' 16.6): kiln 71.1 %, ep 1 48.1 %, ep 5 14.4 %. Ep 5's commonest colour is `#101822` (the shaft walls), not the
   bg. Kiln's ground is Y' 12.3, flat from centre to border.

## 2. Method

- `RUN_DIR/look/grade/measure.py <video> <fps> <out> [mask_rows]`: frames piped from ffmpeg (BT.709 tv range to
  full-range RGB), every statistic per frame, then the median over frames. Per-frame rows in `<name>.csv`, summary
  in `<name>.json`. `run_all.sh` reruns everything.
- Frames measured: quire 120 (10 fps), kiln 150 (6 fps), ledgerly 100 (10 fps), halden 60 (10 fps), ep 1 181
  (4 fps), ep 5 259 (2 fps). 870 frames in all.
- Captions: ours were measured again with the caption band (rows 1700-1920) removed (`*_m` columns). The numbers
  move by 1-4 code values and no conclusion changes, so the tables give the full frame. Cinetic's type is its
  design, not a burned caption, and was left in.
- Ground: the frame's commonest colour (RGB quantised to 4 levels). Figure ("ink"): every pixel 40+ code values
  off the ground. Emitters for the glow test: Y' >= 200, or Y' >= 150 with chroma >= 40, dark-ground frames only.
- Vignette: median Y' of flat ground pixels (low gradient, within 40 of the ground) in the centre quarter vs the
  outer 12 % border, and top 15 % vs bottom 15 %.
- `curves.py`: light per 2 s (6 s for ep 5) and `curves.png`, one strip per video. `table.py` prints `table.txt`.
- `toonbands.py`: Blink's rendered toon bands (body-green pixels, 15 frames of ep 1 and ep 5).
- Eye checks: `sheet_ours_vs_cinetic.jpg` (ours on top, cinetic below, one height) and
  `crop_glow_ep05_t64_vs_kiln_t18.png` (ep 5's lit card next to kiln's subject card at the same scale). Both
  confirm the numbers: kiln's card is a grey fill, white type and a hairline, with nothing soft round it; ep 5's
  cards are all saturated blue with soft halos, and the subject is only somewhat brighter than its neighbours.
- **Saturation note.** The brief asks for saturation p90. HSV saturation is misleading on dark grounds: our own bg
  `#0d1117` has HSV S 0.43, so ours read 0.46 and 0.64 mostly because of the bg. Chroma (max - min channel, in code
  values) is the fair number and the recipes use it.
- Only four grade references exist (cinetic's films). The look-bible done criterion asks for ten; the corespear
  and Jam With AI shorts were added for pacing only and were not measured here.

## 3. Tables

Median over the sampled frames unless marked.

| | quire | kiln | ledgerly | halden | **ep 1 d6** | **ep 5 d2** |
|---|---|---|---|---|---|---|
| ground | cream card on `#1a191e` | dark `#0e0c0a` | light `#e0ebe2` | light `#f7f9fe` | dark `#11151b` | dark `#101822` |
| luma p5 | 25.6 | 12.3 | 215.8 | 245.3 | 15.6 | 15.6 |
| luma median | 244.7 | 12.3 | 233.2 | 245.3 | 21.6 | 23.0 |
| luma p95 | 244.7 | 46.5 | 255 | 245.3 | 184.2 | 116.0 |
| luma p99 | 248.5 | 241.2 | 255 | 245.3 | 235.6 | 191.1 |
| mean luma | 150.7 | 21.9 | 233.9 | 242.8 | 38.4 | 36.3 |
| near-black, Y' < 32 | 41.6 % | 77.1 % | 0.9 % | 0.0 % | 83.1 % | 73.0 % |
| near-black, Y' < 20 | 0.1 % | 71.1 % | 0.6 % | 0.0 % | 48.1 % | 14.4 % |
| frame at the ground colour | 51.9 % | 69.6 % | 48.4 % | 98.7 % | 54.9 % | 48.6 % |
| figure ("ink") share | 43.4 % | 4.5 % | 3.0 % | 1.2 % | 11.5 % | 11.7 % |
| figure median Y' | 25.6 | 121.2 | 90.2 | 35.3 | 178.9 | 102.3 |
| figure vs ground | 15.8:1 | 4.5:1 | 5.6:1 | 14.9:1 | 8.8:1 | 3.1:1 |
| p99 vs p1 | 16.6:1 | 17.5:1 | 14.4:1 | 13.9:1 | 16.2:1 | 10.4:1 |
| HSV saturation p90 | 0.17 | 0.29 | 0.05 | 0.02 | 0.46 | 0.64 |
| chroma p90 | 10 | 4 | 11 | 6 | 25 | 47 |
| chroma p99 | 12 | 6 | 27 | 8 | 113 | 118 |
| saturated share (chroma >= 60) | 0.2 % | 0.0 % | 0.5 % | 0.1 % | 6.2 % | 7.1 % |
| saturated share, p90 frame | 0.8 % | 4.4 % | 0.9 % | 0.6 % | 20.7 % | 13.5 % |
| saturated share, max frame | 6.5 % | 48.9 % | 1.3 % | 1.0 % | 34.8 % | 18.5 % |
| accent hues (chroma >= 60) | blue only | red only | blue only | teal only | green, blue, amber, red | blue, green, amber, red |
| shadow colour (darkest 10 %) | `#1a191e`, chroma 5 | `#0e0c0a`, chroma 4, hue 30 | n/a (light) | n/a (light) | `#0c1016`, chroma 10, hue 216 | `#0c1017`, chroma 10, hue 216 |
| highlight colour (top 1 %) | `#ffffff`, chroma 2 | `#f4f2f0`, chroma 4 | `#ffffff`, chroma 0 | `#f7f9fe` | `#ebf0f4`, chroma 15 | `#edf1f7`, chroma 21 |
| emitter share (dark ground) | n/a | 1.7 % | n/a | n/a | 7.2 % | 1.9 % |
| glow at 4-8 px | n/a | 0.000 | n/a | n/a | 0.067 | 0.095 |
| glow at 8-16 px | n/a | 0.000 | n/a | n/a | 0.050 | 0.073 |
| glow at 16-32 px | n/a | 0.000 | n/a | n/a | 0.006 | 0.050 |
| ground centre vs border (Y') | flat | 12.3 vs 12.3 | 255 vs 233 (card) | flat | 21.6 vs 18.6 | 23.0 vs 22.6 |
| ground top vs bottom 15 % (Y') | flat | 12.3 vs 14.2 | flat | flat | 18.6 vs 16.6 | 23.0 vs 16.6 |

Light across the piece:

| | quire | kiln | ledgerly | halden | **ep 1** | **ep 5** |
|---|---|---|---|---|---|---|
| mean Y' min to max (per sample) | 142.6-239.6 | 13.0-64.6 | 232.2-236.7 | 241.8-245.1 | 23.0-80.0 | 21.0-54.2 |
| range of 1 s smoothed mean Y' | 94.5 | 43.9 | 3.6 | 2.4 | 55.4 | 33.1 |
| std of mean Y' over time | 40.1 | 10.0 | 1.3 | 1.0 | 14.1 | 6.9 |
| change of mean Y' per s, p95 | 51.3 | 36.6 | 8.3 | 6.6 | 30.1 | 9.8 |
| mean Y', first 10 % vs last 10 % | 162 to 235 | 19.9 to 19.2 | 233 to 234 | 245 to 243 | 38.7 to 35.5 | 29.8 to 35.1 |

Kiln's light, per 2 s (mean Y' / p99 / saturated share): 0 s 17.9 / 229 / 0.0 %; 2 s 26.7 / 194 / 5.9 %;
**4 s 49.2 / 211 / 35.8 %** (the red wall, the problem); 6-10 s 26-30 / 134-242 / 0.5-1.7 %; 12-24 s 16-28 /
127-242 / 0-1.1 % (the dark field with one white headline and one card, the answer). Ep 5 per 6 s stays between
28.0 and 46.4 mean, 158-228 p99 and 2.4-14.1 % saturated until the end card. Quire's one change is the push into a
close-up of its cream card at 8 s (mean 145 to 224).

Blink's toon bands as rendered (ep 1, 15 frames, 1.1 M body pixels): bands at Y' 183 (lit, the peak), 163 and
115-122 (shadow); median 180, p10 118, p90 185. Half of Blink sits in the lit band. Cinetic is flat 2D and has no
shaded object, so there is no reference number for this; it is recorded so a later change can be checked against it.

## 4. Recipe in our stack

Everything below uses the four palette hues and the bg as they are. "Dim" means the same hue mixed toward the bg
`#0d1117`; no new hue enters.

1. **A colour budget per frame** (`world.js`, crew-production-design and crew-dp mode files).
   - Add `dim(hex, k) = mixHex(hex, "#0d1117", k)` to `world.js` beside `mix`. Idle stations draw their fills at
     `dim(hue, 0.8)` and rims at `dim(hue, 0.6)`; only the beat's subject uses the full hue.
   - Ep 5's column: `drawBoard` in `stations/column.js` gives every idle card the full `#4f93d6` rim and a `#14243a`
     fill. Idle rim `dim("#4f93d6", 0.6)`, idle fill `dim("#4f93d6", 0.85)`; the spot card keeps `#4f93d6` easing to white.
   - Target, measured with `measure.py`: saturated share (chroma >= 60) at most 2 % of the frame on a median frame,
     chroma p90 at most 15. One colour beat per film may reach 25-35 % for at most 2 s (kiln: 35.8 % at 4-6 s),
     and it belongs to the failure (red) or the mass moment.
2. **A white top on the subject** (panel draws in each station, `blink3d.js` eye material, crew-dp).
   - Every beat's subject carries one element at Y' >= 235: the white request card, the subject's text in
     `#ffffff`, the halo core. Target p99 >= 235 on 80 % of frames (kiln 241, ep 1 236, ep 5 191).
   - Subject text against its own fill at least 12:1 (kiln 14.4:1); idle text at most 3:1 (ep 5's idle card measured 2.9:1, so
     idle text is already there; the subject is what falls short). Highlights stay neutral: white cards and text at chroma <= 5, so the hottest
     pixel is white, not mint.
3. **One light curve per film, keyed to the story** (the short's world file, using `r01`/`io` from `world.js`; a
   `lightAt(t)` helper next to `cameraPath`).
   - Base: mean Y' 18-28 with one white subject. Peak: the failure beat at 2.5x base mean (kiln 49.2 vs about 18),
     built from content (a mass of red or a field of lit objects filling 30-50 % of the frame), not from pushing the
     lights. Resolve: back to base for the answer, and the film ends at base (kiln 19.9 at the start, 19.2 at the end).
   - Target: range of 1 s smoothed mean Y' at least 40 over the film, and p95 change per second at least 30 Y'/s
     (kiln 36.6, ep 1 30.1, ep 5 9.8). Ep 1's two peaks are the model; ep 5 needs its peak placed on the miss.
4. **Glow as an event, never a state** (`stations/*.js` additive sprites; add the rule to the kit README).
   - At rest an additive glow sprite's opacity is at most 0.03, and nothing glows that is not the beat's subject.
     Ep 5's column: the first-word glow floor `lit * 0.1` in `ga` goes to `lit * 0.02`; the lane's
     `opacity = 0.1 * fade` goes to `0.04 * fade`.
   - A bloom on the beat word is fine: peak within 0.06 s, decay to rest within 0.5 s (`bloom(dt, 0.3)` in
     column.js already has the shape). Target on a rest frame: glow at 4-8 px <= 0.02 and at 16-32 px 0.00
     (kiln 0.000; ep 5 0.095 and 0.050 now).
5. **Keep the field at the bg** (`world.js` `stage()` and each short's set pieces).
   - Large set pieces (ep 5's shaft walls, floors, backboards) use a toon colour within 6 code values of `#0d1117`,
     or `dim(hue, 0.9)`. Do not lower the stage lights to get there: Blink's lit band (Y' 183) comes from the
     current sun 2.4 and ambient 0.9 and Robin approved that Blink.
   - Target: at least 55 % of the frame below Y' 20 on a median frame (kiln 71.1 %, ep 1 48.1 %, ep 5 14.4 %).
   - No vignette is needed: kiln's ground is 12.3 in the centre and 12.3 at the border. Keep the existing caption
     gradient at the foot.
6. **Leave alone:** the bg's blue-black (hue 216, chroma 10) against kiln's neutral black (chroma 4). It is our
   palette and is not up for matching.

## 5. Top five changes, ranked by visual impact

1. Dim every idle station to `dim(hue, 0.6-0.85)` so saturated pixels fall from 6-7 % of the frame to under 2 %,
   with full colour only on the subject (cinetic 0.0-0.5 %).
2. Give each beat's subject a white top (p99 >= 235, text 12:1 on its fill); ep 5 sits at p99 191 and 8.3:1.
3. Place one light and colour peak on the failure beat (2.5x base mean, 30-50 % of frame) and return to base for the
   answer; ep 5's light changes at 9.8 Y'/s at p95 against kiln's 36.6.
4. Cut rest glow to opacity <= 0.03 and keep bloom as a 0.5 s event (glow at 4-8 px from 0.067-0.095 to <= 0.02).
5. Bring large set pieces back to the bg so 55 % or more of the frame sits below Y' 20 (ep 5 14.4 %, kiln 71.1 %).

Cross-check with `look/depth.md`: its finding that cinetic's subject is a small area in an empty, dimmed field
(attention area 0.16 of the frame vs ours 0.31-0.52) is the same fact seen from the grade side. Changes 1 and 5
here are how that dimmed field is made.
