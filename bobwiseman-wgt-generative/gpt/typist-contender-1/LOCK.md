# Typist, contender 1 (locked 2026-10-06)

Robin, 2026-10-06, on `typist_hero.png`: "I love this. Let's lock her in as a possible contender
for style and character." A contender, not the final look for We Got Time.

All images made with GPT Image through Codex CLI (`../gptimg`, ChatGPT plan, no credits).
Regenerate from these files only. Don't redraw her from a text description.

## Files

| File | What it is |
|---|---|
| `typist_hero.png` | **The locked frame.** Her at her desk, unfolding his paper-plane ticket. |
| `character_plate.png` | Character reference for both leads (FIG. 1 him, FIG. 2 her). Attach as image 1 for any new pose. |
| `style_hall.png` | Style reference (paint, light, palette). Attach as image 2. |
| `env_hall_ducts_tubes.png` | Environment direction after Robin's note: more ducting and brass pneumatic message tubes everywhere indoors. |
| `source_pnc_plate_f1824.jpg`, `source_pnc_hall_f0840.jpg` | The pinball-cut frames (pnc-v12, 76.0 s and 35.0 s) these were repainted from. |
| `style_source_mj08p4.jpg` | Midjourney grid 08 panel 4, the style the hall repaint took its handling from. |

## Her, as locked

Black hair up in a bun (the pinball original had a bob; the plate changed it and the hero kept
it, so the bun is now canon for this contender), rose-red collar, grey fitted uniform jacket and
skirt, dark stockings, low black heels, rosy cheeks, large dark eyes. Flat-shaded painted
illustration with soft gouache texture, cold teal light, warm desk-lamp pools.

## Recipe

New pose or scene:

    gptimg -o out.png -r character_plate.png -r style_hall.png \
      "The woman from image 1 (FIG. 2: grey uniform, rose-red collar, black hair, same face) <action
      and setting>. Paint it in the exact style, light and palette of image 2. No text anywhere."

Hero prompt, verbatim:

    The woman from image 1 (FIG. 2: grey uniform, rose-red collar, black hair, same face) sits alone
    at a steel desk under a huge ventilation duct, unfolding a paper plane made from a cream
    government form; she looks at it with quiet surprise. Rows of filing drawers behind her. Paint
    it in the exact style, light and palette of image 2. No text anywhere.

Robin's environment note (2026-10-06): the ducts are good, but pneumatic message tubes are a big
part of this world indoors, and there should be more ducting. Put both in every interior prompt.

## Open

- The seated clerks in the hall are still blank pinball heads; she has a painted face. They need to
  match before this becomes a look.
- Him (FIG. 1) has only been painted on the plate, not in a scene yet.
