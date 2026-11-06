# Design: The Cold Read

Concept angle: a Bureau run drawn as a surveyor's plate, precise and calm, so the rule reads as
engineering, not hype.

## Palette (cap: these six)

| Token | Hex | Use |
|---|---|---|
| paper | `#EFE6D2` | background, text on dark |
| gold | `#A8862F` | all line work on paper |
| ink | `#1C1A17` | main text on paper, dense diagram lines |
| red | `#B3261E` | one short phrase per beat (on dark: `#D9473B` for contrast) |
| night | `#0E1220` | dark field, beat 3 only |
| gold-night | `#C9A54A` | line work on dark |

## Type

- Statements: Archivo Black, 76-96px, tracking -0.03em.
- Plate labels and inscriptions: Marcellus SC, letterspaced 0.18em.
- Annotations and node labels: IBM Plex Mono 400/700, 18-22px, letterspaced 0.12em.

## Line

2px everywhere at 1080p. Construction lines 1px dashed (6 6) at 40% opacity. Sealed walls are a
double stroke: 2px outer, 1px inner 8px in. Caps square, joins miter. Draws use power2.out or
none, never bounce.

## Frame

Plate border 1px inset 48px with registration crosshairs at the corners. Faint 60px grid at 6%.
Fixed seeded paper grain. Plate label top-left, beat title top-right. Bottom bar at y=1000:
SPEC, PLAN, BUILD, CRITIC, MERGE with a gold tick.

## Banned

Photoreal, characters, faces, hand-drawn jitter, collage, glow blooms, vignettes, gradients on
paper, emoji, bounce or elastic easing, more than one red phrase on screen.
