# Mark Von Ulrich reference collection

Downloaded 2026-10-13. Artwork is credited to Mark Von Ulrich; original rights remain with their owners. This collection is for reference.

## Start here for creative direction

Give an agent `AGENT-DIRECTION.txt` with the project brief for a quick “What would Mark add?” pass. It focuses on symbolic construction: giving ideas bodies, transferring faculties, making relationships physical, and using repeated characters to compare ideas. It includes reference anchors, levels of intervention, a response format, and review questions.

Open `director-guide.html` for illustrated examples, links to article context, a proposed directing process, and new worked concepts. The symbolic approach works in other visual media. These are explicit inferences and proposed applications, not claims to know Mark’s private thought process. Read `STYLE-BRIEF.txt` as well when the project calls for Robin’s early Mac raster treatment.

## Illustration-to-article index

Open `index.html` for the illustrated catalogue, source links, original page layouts, observed symbols, and cautious interpretations. `artwork-index.json` stores the same mapping for later code work. Every artwork has a stable U01–U13 ID. Eleven images have verified article/commission context; the two user originals remain unresolved. AI-AP submission titles and dates are not treated as independently verified printed article titles or issue dates.

## Contents and sources

- `artwork/innovate-bravely-emmett-chapman-2016.jpg`: full-size archive image; April 2016 portrait of Emmett Chapman for Progression. https://www.ai-ap.com/slideshow/AI/36/?status=selected
- `artwork/lets-get-physical-2015.jpg`: full-size archive image; July 2015 virtual-reality illustration for Playboy. https://www.ai-ap.com/slideshow/ai/35/
- `sources/think-act-23-complexity.pdf`: original 84-page magazine PDF. Credited illustrations in “Even Superheroes Need Help” (article PDF pages 14–19; opening spread 12–13; extracted reference images from 14–17) and “Keep It Simple, Smarty-Pants” (PDF pages 50–51). Extracted artwork in `artwork/`; page renders in `pages/`. Photos and decorative fragments are excluded from the artwork directory. https://www.rolandberger.com/publications/publication_pdf/roland_berger_ta_complexity_en.pdf
- `sources/surrealistic-image-manipulation-thesis.pdf`: original 92-page scanned thesis. Its plates credit Allegory (1992) and Odyssey in Digital Wonderland (1992). The scan includes captions and discussion, but the inspected illustration areas are blank; these two artworks are not available as usable images in this PDF. Context page renders: PDF pages 23 and 69. https://thesis.ncad.ie/T1192_Surrealistic%20Image%20Manipulation%20In%20The%20Field%20Of%20Visual%20Communication_NC00205923.pdf
- `contact-sheet.jpg`: overview of all 13 artwork images: two original user references, two archive images, and nine extracted magazine illustrations.
- `sources/download-manifest.json`: direct download URLs, file sizes and SHA-256 hashes.

Both original user-provided images have been added unchanged to `artwork/`: `machine elves.jpg` and `thisgoesintothis.jpg`. Neither duplicates the downloaded artwork. The old Riley portfolio was not recovered.

## Rendering target clarified by Robin

The canonical implementation brief is `STYLE-BRIEF.txt`: early color Mac raster illustration, the specified 256-color system palette, stable ordered dithering, and fine pixel edges. Preserve dense native detail and shaded interiors. ASCII rendering and chunky game-sprite pixels fail this target. The palette and animation-dither requirements are Robin’s reconstruction specification, not independently verified facts about Mark’s historical process.

## Visual notes for a future code animation

These are observations from the collected artwork, not statements by the artist.

- Strong red, yellow, green, cyan and deep blue; occasional smooth gradients inside hard-edged silhouettes.
- Figures constructed from rectangles, circles, right-angle limbs and mask-like faces.
- Radiating spikes, concentric arcs, repeating zigzags, fine grids and circuit-like lines.
- Dense detail and fine stair-step raster contours; preserve one-pixel linework and intricate patterns at the native drawing grid.
- Layered machinery, eyes, ears, hands and instruments combine into surreal characters.

A practical code approach: draw detailed geometric raster artwork, shade its interiors, and quantize it to the specified fixed 256-color Mac system palette using ordered dithering. Choose working dimensions that retain fine pixel edges and dense linework; 72 dpi alone does not set a Canvas resolution. Anchor the dither to moving objects and keep its phase deterministic. Animate layered shapes while preserving the native raster detail. See `STYLE-BRIEF.txt` for rendering and acceptance criteria.

In Robin’s July 13, 2005 correspondence, Mark described drawing in an old SuperPaint version and painting in Photoshop, embracing pixelation and often reproducing at 72 dpi. That private email is not included in this public-source reference collection.


## Biographical notes

`biography.html` contains a sourced life-and-career profile, the verified death date (February 19, 2018), and relevant connections to the symbolism study. `biography.json` records each fact with its source. Public obituaries and the artist’s private 2005 recollections are distinguished.

## Where this copy lives

This folder is the working copy for all Novadiem video work: `references/mark-von-ulrich/` in rheos/secondunit-videos (issue #123). It was copied on 2026-10-13 from `~/Documents/ChatGPT/IndieAgent/references/mark-von-ulrich/`, where the collection was built. If that folder changes again, bring the changes over and commit them here:

    rsync -a ~/Documents/ChatGPT/IndieAgent/references/mark-von-ulrich/ references/mark-von-ulrich/

The two source PDFs (43 MB) and the two thesis page renders stay out of git. Re-download the PDFs from the URLs in `sources/download-manifest.json` and check them against its SHA-256 hashes. Everything `index.html` and `director-guide.html` link to is committed.

Projects that already use it: `bobwiseman-travel-agent/MVU-DIRECTION.md` (draft 6, #112). `STUDY-travel-agent.md` here is the study behind that direction.
