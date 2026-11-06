"""Build the human-readable directing score and its implementation data."""
import html
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FPS = 24
END = 403.35675

# Proposed editorial boundaries. Vocal anchors are estimates from the existing ASR.
# Each row: start, movement, title, attention/action, result/handoff, camera, cue.
ROWS = [
    (0, 0, 'Something wants out',
     'Through the moving train window, one city window strains in its socket. Its brass hinges flex before the frame releases. Let us see the resistance and the empty opening it leaves.',
     'The escaped pane crosses our direction of travel; our gaze follows it to the neighbouring roofs. No red patch.',
     'Close view through carriage glass, then a small turn with the pane.',
     'Choose an opening instrumental attack for the final hinge release; settle briefly afterward.'),
    (6, 0, 'A whole street takes a breath',
     'The release spreads down the street. Roofs tilt, foundations stretch away from their shadows, and three buildings lift at different speeds. Small panes scatter while the buildings carry weight.',
     'The rising street exposes the waterfront beyond. This is the city doing something, with a visible destination behind it.',
     'Widen from the window to the street; retain the train sill at the bottom edge.',
     'Stagger building departures across the phrase. Loose windows can answer accents; buildings cannot flap at their speed.'),
    (15, 0, 'Leave the city behind',
     'The train rounds a bend onto the existing viaduct. The airborne buildings turn back over the city. A last roof passes overhead, revealing water and the far headland.',
     'The shoreline and suspended city diminish over our shoulder before we turn forward again. The architecture stays there for the remainder of the crossing.',
     'One motivated side glance establishes departure; match-cut forward on the passing bridge upright.',
     'Use the broad musical phrase for the turn, not continuous camera bobbing.'),
    (23, 0, 'A route to follow',
     'Low island towers stand firmly in the water. A chain of their lamps opens toward the headland, one after another. The escaped window makes one distant crossing, then exits.',
     'We can trace the viaduct all the way to the stone passage and its closed door before approaching either.',
     'Low forward POV, strong foreground crosspieces and a clear horizon.',
     'Build anticipation into the first vocal entrance; keep its principal action unused until then.'),
    (30, 1, 'The world gives an answer',
     'On the first vocal entrance, the nearest island shutters spring open. A visible wave of openings runs toward the headland; their projected rectangles meet to illuminate a previously dark branch of the route.',
     'We take the illuminated branch. The request has changed where we can go.',
     'Approach one shutter close enough to read its release, then reveal the chain and turn onto the branch.',
     'Approximate vocal anchor 0:30. One decisive opening on the entrance, then a travelling response across the phrase.'),
    (38, 1, 'Take the offered way',
     'The train wheels are never shown, but the sill, track and passing bridge joints maintain our location. Lamps recede behind us as rock walls ahead begin to lean outward.',
     'The next obstruction is already visible before it changes.',
     'Move from a brief side view of reflected lamps back to the approaching stone passage.',
     'Leave room after the response; use the instrumental gap to establish the next problem.'),
    (44.72, 1, 'Distance fails to erase it',
     'The rocks part to give us more distance. Yet the reflected city remains in the water beside us, travelling at our speed while the actual skyline falls away. The reflection is now the thing that will not leave.',
     'One dark reflection reaches the bridge; the problem has followed us without bringing the buildings physically out to sea.',
     'Glance down over the bridge edge, then forward through the widening stone opening. Show the rock faces and thickness, never an unexplained blue slit.',
     'Approximate vocal anchor 0:44.72. Let separation develop over the phrase; no blanket flashing.'),
    (53.28, 1, 'Approach the door',
     'The stone walls finish opening. The viaduct visibly reaches the tall timber door; light leaks underneath it and falls on the same rails we occupy.',
     'We arrive at an established threshold, with the route visible on both sides as it opens.',
     'Forward, close enough to see the hinges turn and the door cast a moving shadow on the deck.',
     'Anticipate the next vocal entrance with gathering light; save the opening for the entrance itself.'),
    (59.12, 1, 'Light becomes an event',
     'The door swings outward. Beyond it, a handful of loose panes rise toward the sun. Each catches a separate reflected beam; the beams strike water and bridge in sequence.',
     'A short orbit culminates in the panes opening like shutters and releasing a fan of light down the route. We pass under that fan.',
     'Cross the threshold at traveller height. Tilt enough to see the sun but retain the bridge in the lower frame.',
     'Approximate vocal anchor 0:59.12. Use a few measured attacks for the light strikes. The orbit itself lasts roughly three seconds.'),
    (66, 1, 'Pass the spectacle',
     'A sunlit pane passes close across our view; cut on its movement to light sweeping the deck beneath us. Ahead, the route enters a low causeway garden.',
     'The sun and its panes recede behind our direction of travel. We have passed the event instead of stopping to watch an endless loop.',
     'Action cut from upward glance to low forward travel, with unchanged direction and matched bridge geometry.',
     'Carry the phrase’s release into the onward movement. No new main-window appearance.'),
    (73.72, 1, 'An impossible quiet crossing',
     'At the causeway landing, road lanes curl upward into planted terraces. Abandoned traffic signals fold their heads down; their reflections become reeds. A walking-width rail route continues through the centre.',
     'The offered escape appears to work, but an unmistakably bent lamp beside the route will become our landmark.',
     'Wide landing reveal, then a passing close view of the bent lamp and its triangular shadow.',
     'Approximate vocal anchor 1:13.72. Let the road transformation finish before introducing the landmark.'),
    (84.14, 1, 'The first wrong return',
     'We travel through a shaded arch. The same bent lamp appears ahead again, this time with its shadow on the opposite side. Far above, the bridge curves back toward itself.',
     'A place that promised escape has begun returning us to a recognisable point.',
     'Cut on the arch occlusion; keep forward speed. Turn upward only after we recognise the lamp.',
     'Use the gap before the refrain for recognition and unease, not another decorative flight.'),
    (90.76, 2, 'Every exit joins the circuit',
     'Three route switches open successively ahead. We choose one; the adjacent tracks visibly braid into it. Each apparent exit becomes the same elevated loop.',
     'The route, rather than a flying object, now controls our attention and movement.',
     'Three short forward views connected by passing uprights. Each reveals new geometry rather than repeating the same lamp shot.',
     'Approximate refrain anchor 1:30.76. Give repeated vocal calls different consequences: offer, choice, closure.'),
    (103.86, 2, 'Almost out',
     'A gap in the outer rail opens onto clear water. As we turn toward it, bridge segments swing across on pivots, completing the circuit just ahead of us.',
     'We remain moving, but our movement no longer means progress.',
     'Follow the attempted turn and see the closing sections meet. Hold the completed barrier briefly.',
     'Phrase ending triggers the final joining segment; avoid timing every segment to the same pulse.'),
    (116.9, 2, 'See the trap',
     'The route banks around a central void. Across it, we see the bent lamp, the arch and the landing all connected to this single revolving structure. Below, its shadow turns in place.',
     'The repeated landmark is explained. We can now understand the circuit and the edge we must cross.',
     'A traveller’s side glance across the curve reveals the whole mechanism without leaving POV for an aerial shot.',
     'Approximate vocal anchor 1:56.90. Let the scale reveal occupy the phrase; move on once the circuit is understood.'),
    (125.76, 2, 'Follow a seam',
     'One warm rectangle beyond the outer rail appears to offer an opening. As we approach, a thin cable becomes visible above it, leading toward a pulley.',
     'The camera discovers how the invitation is being moved before it follows it further.',
     'Closer forward approach, then a short gaze along the cable to the pulley.',
     'Instrumental gap: reveal a cause, with less motion elsewhere so the thin cable is readable.'),
    (131.62, 2, 'Recognising the mechanism does not stop it',
     'The warm opening slides away on its cable whenever we advance. The route beneath us feeds through the same pulley housing; pursuit is powering the retreat.',
     'Seeing the mechanism does not release us. The opening draws us toward a service passage in the loop’s supporting structure.',
     'Alternate a close view of cable under tension with forward views that keep the opening’s distance visibly unchanged.',
     'Approximate vocal anchor 2:11.62. This is deliberate repetition twice, followed by a revealing change of angle.'),
    (146.42, 2, 'Find the support behind the promise',
     'We stop following the warm rectangle. Our gaze drops to its cable anchor as it is hauled through a service hatch. The moving route carries us through the hatch after it.',
     'The lure belongs to an occupied-looking but empty service building; its interior is established before we enter.',
     'Follow the cable downward, pass the thick hatch frame, then reveal the lit counter inside.',
     'Approximate vocal anchor 2:26.42. End the chase during this phrase; do not sustain it into the next anecdote.'),
    (160, 3, 'One setting refuses the pattern',
     'Inside, table settings slide beside the route like a dining-car service line. Every utensil aligns itself to a painted outline. At one empty setting, a fork turns sideways and slips off its mark.',
     'A pool of inspecting light stops over this small deviation. Other settings freeze.',
     'Passing side view becomes a close, still attention to the one setting. No person or poorly drawn hands.',
     'Approximate vocal anchor 2:40.00. Small, clear object action replaces large landscape movement.'),
    (174.94, 3, 'A harmless invention becomes evidence',
     'At the same setting, a bottle works its cork loose against a toothed brass table edge. The cork jumps free; wine briefly colours the glass. A mechanical ring closes around the place setting.',
     'The ring carries the setting, intact, through a glass partition. Its eccentric gesture has been reclassified as something to process.',
     'Close view of pressure and release, then widen enough to see the ring and the corridor beyond.',
     'Approximate vocal anchor 2:54.94. One release accent; let the subsequent capture interrupt the release’s pleasure.'),
    (188.78, 3, 'The route becomes compulsory',
     'The service partition slides across our route and redirects it into a tiled corridor. Doors close successively behind us; every side turning rotates shut as we approach.',
     'The track is now visibly a conveyor. We are still the traveller, but no longer choosing how or where to move.',
     'One backward glance proves the closures, then a forward view with narrowing alternatives.',
     'Approximate vocal anchor 3:08.78. Heavier closures answer selected low attacks rather than every beat.'),
    (203.4, 3, 'The machine corrects the world',
     'Rollers ahead press irregular shadows into identical rectangles. A shutter that tries to open is clamped flat; its amber colour drains as the conveyor advances. The same process approaches our carriage glass.',
     'The threat is conformity imposed on our field of view. The last loose shutter retains a small area of warm light.',
     'Close mechanical action, then return to our sill as a roller shadow crosses it. Avoid graphic treatment imagery or flashing effects.',
     'Approximate vocal anchor 3:23.40. Clamps use discrete attacks; draining colour follows the phrase slowly.'),
    (216.1, 3, 'A fault remains',
     'The loose shutter catches in a roller. Its hinge holds long enough to force the mechanism to skip one position. Daylight becomes visible through a service seam.',
     'A small failure in the system creates an actual route out, established before we take it.',
     'Close on the resisting hinge; gaze follows the seam to the open service track.',
     'Instrumental space for strain, hesitation and the click of release expressed visually only.'),
    (220.38, 4, 'Take the interruption',
     'The conveyor pauses at the first call. We continue under our own momentum into the service track; the next call sees the shutter widen the seam; the final call carries us through it.',
     'The repeated request produces a different sequence from the earlier false exits: stop, opening, passage.',
     'Forward approach through one legible aperture, with close wall occlusion and a clear exit beyond.',
     'Approximate refrain anchor 3:40.38. Check each repeated vocal entrance before locking these three actions.'),
    (234.22, 4, 'Discover the building’s other face',
     'The service track climbs beside the tiled building. We pass its back wall and see a warm projection beam escaping a roof vent. Our route runs into the beam and toward an open cinema balcony.',
     'The next location is reached along the same track, not introduced as an unrelated insert.',
     'Rise with the track; show exterior wall, beam, balcony rail and doorway in that order.',
     'Carry the release out of the refrain; widen and soften the composition before the next narrative passage.'),
    (247.32, 5, 'Our own departure is on the screen',
     'From an empty cinema balcony, we see the opening city escape projected below. On screen, the floating buildings seem effortless; scratches and the moving projector gate expose the manufactured image.',
     'The film inside the film initially offers reassurance. Our track continues beside the screen toward the projection booth.',
     'Hold long enough to recognise the reused opening image, then move laterally to reveal the screen edge and beam.',
     'Approximate vocal anchor 4:07.32. Give recognition one clear hold, then introduce the mechanism behind the picture.'),
    (262.06, 5, 'The painted rescue cannot help',
     'A golden escape stair on the screen rolls up like a painted backdrop. Behind it, real dark gears tug at the balcony track and begin drawing us toward the wall. Their shadows cross both theatre and screen.',
     'The reassuring picture has no depth; the threat occupies our actual space. We must stop waiting for the image to provide an exit.',
     'Reveal the screen’s thin edge, then follow the gear shadow to its solid source beside us.',
     'Approximate vocal anchor 4:22.06. Contrast smooth projected movement with the gear’s weight; do not introduce cartoon villains.'),
    (276.04, 5, 'A reflection moves before the machinery',
     'The projector flickers between rigid route diagrams while reflected light on the balcony rail bends freely. We follow that moving reflection toward an open window before the diagram catches up.',
     'The world’s fluid, felt movement supplies a path where the orderly image could not.',
     'Close on the rail reflection, then turn with it toward a real opening already visible at the edge of frame.',
     'Approximate vocal anchor 4:36.04. Let light lead the mechanical response, without asserting a particular instrument identity.'),
    (287.88, 5, 'Turn projected rails into a usable route',
     'The beam passes through the open window onto an existing maintenance bridge outside. As we approach, its real rails align with the projected ones. Our sill crosses into daylight.',
     'A match of image and structure lets us leave the theatre physically. The projection stops at its window; the bridge continues.',
     'Match alignment through the window, then pass the visible frame and reveal the bridge under us.',
     'Use the gap to prepare the next departure. No full-frame white wipe or unexplained teleport.'),
    (293.76, 6, 'Choose motion again',
     'A rail switch ahead is partly jammed. As the successive calls arrive, the bridge flexes, frees the switch and opens toward a wide marsh. We take that route while the theatre recedes.',
     'This departure is earned by the earlier escape and decision, not a reset to the opening city.',
     'Close switch action, forward crossing, then one broad reveal of marsh and sky. Three views across the refrain.',
     'Approximate refrain anchor 4:53.76. Place switch, release and crossing against verified repeated entrances.'),
    (311.88, 6, 'Room to breathe',
     'Water channels and long grasses open beside us. The view grows wider, but the moving reflection of the old city still passes quietly below the bridge.',
     'Relief is real without erasing what travelled with us. Introduce a small winged form ahead, resting on an iron arch.',
     'Low side-to-forward movement, less clutter and longer sight lines; keep a near rail for speed.',
     'Let the instrumental passage breathe after the dense mechanical sequences.'),
    (319.62, 6, 'Movement helps',
     'Bridge joints straighten only as we cross them; farther ahead they remain crooked. Our passage opens a temporary band of warmth through the colder marsh.',
     'The route becomes easier locally, not magically repaired to the horizon. The iron arches ahead remain unresolved.',
     'Look down at one joint changing, then forward to show the limited reach of that change.',
     'Approximate vocal anchor 5:19.62. The travelling warm band follows the phrase, not a global brightness pulse.'),
    (329.14, 6, 'The route is another enclosure',
     'The iron arches hinge inward above us, revealing themselves as a long open-ended cage. Ahead, one carefully shaped paper-like bird attempts a wing stroke but catches between the bars; its effort passes into their shadows.',
     'The obstacle is now the same structure carrying us. A close view shows exactly what prevents flight.',
     'Forward reveal of the enclosure, then a brief side view of the bird with articulated folded wings and a clear silhouette.',
     'Approximate vocal region 5:29–5:48; the first substantial bird word is estimated nearer 5:36. Verify before timing the first attempt.'),
    (341, 6, 'Make room, do not repeat the struggle',
     'One arch springs outward, but the next catches the bird’s wing. The first escaped brass window returns for a single useful action: it wedges the arch hinge open, then drops out of view.',
     'The opening motif has changed from invitation to assistance. We see the gap widening before release.',
     'Close on wing clearance and hinge; keep the bird’s body and both bars visible so the action reads.',
     'This is a proposed internal edit, not a verified lyric boundary. Locate it by playback within the phrase.'),
    (349.8, 6, 'A wing needs space',
     'The bird can finally extend both wings. Its stroke catches the air and carries it through the opened arch. Following arches uncurl, uncovering the sky rather than producing an arbitrary explosion.',
     'We pass through the same opening just after the bird. Release changes the route’s structure.',
     'One clean full silhouette at extension; then forward through the now-open arch.',
     'Approximate vocal anchor 5:49.80. Align the full extension to the phrase’s meaningful stress after listening.'),
    (355.66, 6, 'Flight dismantles the remaining bars',
     'As the bird crosses the sky, bar shadows loosen into long painted strokes. Those strokes trail behind it, break into smaller marks, and settle on the water. The bird exits; the visual rhythm belongs to the marks now.',
     'The material transition grows from the cage’s actual shadows. It gradually thins the world for the ending.',
     'Follow briefly upward, then let the bird leave and return to our route. No sustained chase or orbit.',
     'Instrumental passage: let marks answer different measured accents, with quiet spaces and no new literal lyric scene.'),
    (370.84, 7, 'The final request has no easy answer',
     'The last arches stand open, but no new destination appears. Each return of the call removes another layer of distant scenery. The route remains visible under us as the sky and water approach the same pale tone.',
     'The world opens and becomes more exposed at the same time. Do not resolve the ending into a triumphant sun or a new city.',
     'Three changing forward compositions across the refrain, moving from deep landscape to near rail and sparse horizon.',
     'Approximate vocal anchor 6:10.84. Retain performance repetitions; the printed lyric is not an edit decision list.'),
    (385.4, 7, 'The paint becomes weather',
     'The marks released from the cage settle onto the bridge. Their edges soften and lift again as pale flakes; a few remaining dark strokes show where the water and route still are.',
     'Snow emerges from an established material, and the bridge remains beneath the traveller rather than dissolving into an unexplained floating viewpoint.',
     'A close passage of flakes across the carriage sill returns us to the intimate scale of the opening.',
     'Instrumental preparation for the last line. Lower visual density instead of slowing every motion uniformly.'),
    (392.14, 7, 'Continue into uncertainty',
     'Cold air and pale flakes enter the open carriage window. Its familiar sill gives our position; beyond it, the route narrows into weather. A final warm reflection moves along the sill and disappears before the last frame.',
     'We are still travelling. The opening’s enclosed window has become an open boundary, with freedom and vulnerability present together.',
     'Hold this changed opening composition while the near rail and flakes continue moving. End with the recording, without text or an added fade in the audio.',
     'Approximate final vocal anchor 6:32.14. Resolve the warm reflection against the actual final musical decay after playback.'),
]

MOVEMENTS = [
    ('The city lets go', '0:00–0:30', 'Release → visible departure → a route across water.'),
    ('A place that promises relief', '0:30–1:31', 'The world answers, but distance cannot shed its reflection.'),
    ('A route that will not let go', '1:31–2:40', 'False choices → recognised circuit → pursuit becomes machinery.'),
    ('Difference is processed', '2:40–3:40', 'A small deviation draws attention; the journey becomes compulsory.'),
    ('A fault makes an exit', '3:40–4:07', 'Resistance interrupts the machine and creates a physical way out.'),
    ('The picture cannot rescue us', '4:07–4:54', 'Recognise the illusion, find its edge, choose a real opening.'),
    ('Movement and room to move', '4:54–6:11', 'Relief remains partial; the route opens enough to permit flight.'),
    ('An open, uncertain ending', '6:11–6:43', 'The enclosure is gone. Exposure remains. Travel continues.'),
]

shots = []
for i, row in enumerate(ROWS):
    start, movement, title, action, consequence, camera, cue = row
    end = ROWS[i + 1][0] if i + 1 < len(ROWS) else END
    shots.append(dict(id=i + 1, start=start, end=end,
                      start_frame=round(start * FPS),
                      end_frame=round(end * FPS) if i + 1 < len(ROWS) else math.ceil(end * FPS),
                      movement=movement, title=title, action=action,
                      consequence=consequence, camera=camera, music=cue,
                      status=('covered approximately by revision 8 development study, through 3:40' if start < 220 else 'proposed; unrendered'), timing='approximate source anchors; proposed internal edits'))
assert shots[0]['start_frame'] == 0
assert all(a['end_frame'] == b['start_frame'] for a,b in zip(shots,shots[1:]))
assert all(s['end'] > s['start'] for s in shots)
assert shots[-1]['end_frame'] == 9681
data = dict(title='Travel Agent — full-song directing score', fps=FPS,
            duration=END, final_frame_exclusive=9681,
            lyric_reference='https://www.bobwiseman.ca/?p=3104',
            source_audio='../source/travel-agent.mp3',
            timing_status='Existing automatic phrase estimates, not independently confirmed by listening. Shot boundaries are editorial proposals, not verified musical accents.',
            movements=MOVEMENTS, shots=shots)
(ROOT / 'score.json').write_text(json.dumps(data, indent=2) + '\n')

def esc(value):
    return html.escape(str(value))

def clock(value):
    return f'{int(value)//60}:{int(value)%60:02d}'

cards = []
for n, (name, span, meaning) in enumerate(MOVEMENTS):
    cards.append(f'<section class="movement" id="movement-{n}"><div class="section-head"><span class="number">{n+1:02}</span><div><h2>{esc(name)}</h2><p>{esc(span)} · {esc(meaning)}</p></div></div>')
    for s in [s for s in shots if s['movement'] == n]:
        cards.append(f'''<article class="shot" id="shot-{s['id']}" data-start="{s['start']}" data-end="{s['end']}">
<div class="shot-time"><button class="listen" data-start="{s['start']}" data-end="{s['end']}" aria-label="Play passage for {esc(s['title'])}">▶ {clock(s['start'])}</button><span>to {clock(s['end'])}</span></div>
<div class="shot-body"><h3>{esc(s['title'])}</h3><p>{esc(s['action'])}</p><p class="result"><b>What changes:</b> {esc(s['consequence'])}</p>
<details><summary>Camera and music</summary><p><b>Camera:</b> {esc(s['camera'])}</p><p><b>Music:</b> {esc(s['music'])}</p><p class="frames">Source frames {s['start_frame']}–{s['end_frame']} (end exclusive), 24 fps. Proposed picture timing.</p></details></div></article>''')
    cards.append('</section>')

page = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Travel Agent — a journey that develops</title>
<style>
:root{--paper:#f4f1e8;--ink:#263841;--muted:#56666c;--line:#d7d6cb;--gold:#a06d2d;--wash:#e8ece8}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:190px}body{margin:0;background:var(--paper);color:var(--ink);font:18px/1.65 Georgia,serif}main,header,.player-inner{max-width:1040px;margin:auto;padding:0 36px}header{padding-top:64px;padding-bottom:30px}.eyebrow,nav,.status,.number,.shot-time,.frames,button,.player-label{font-family:system-ui,sans-serif}.eyebrow{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}h1{font-size:clamp(34px,5vw,57px);font-weight:normal;letter-spacing:-.035em;line-height:1.08;margin:15px 0 22px}h2{font-size:29px;line-height:1.2;margin:0 0 9px;font-weight:normal}h3{font-size:23px;line-height:1.3;margin:0 0 10px}p{margin:0 0 14px}.lead{font-size:23px;line-height:1.5;max-width:830px}.status{font-size:13px;color:var(--muted);border-left:3px solid var(--gold);padding-left:13px;margin-top:24px}.player{position:sticky;top:0;background:rgba(244,241,232,.98);border-block:1px solid var(--line);z-index:10}.player-inner{padding-top:12px;padding-bottom:12px}.player-top{display:flex;gap:20px;align-items:center}.player-label{font-size:12px;line-height:1.45;flex:1}audio{width:440px;max-width:62%;height:36px}button{cursor:pointer;color:var(--ink);border:1px solid #aeb7b7;background:transparent;padding:8px 12px;border-radius:4px;font-size:13px}button:hover,button:focus-visible{background:var(--wash);outline:2px solid var(--gold);outline-offset:2px}nav{display:flex;gap:8px;overflow:auto;margin-top:10px;font-size:12px;padding-bottom:2px}nav a{white-space:nowrap;padding:5px 9px;border:1px solid var(--line);text-decoration:none}a{color:#265e73}main{padding-bottom:70px}.overview{padding:35px 0;border-bottom:1px solid var(--line)}.overview-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px}.overview h3{font-size:21px}.overview p,.overview li{font-size:16px}.overview ul{padding-left:20px;margin-top:0}.movement{padding-top:47px}.section-head{display:flex;gap:20px;margin-bottom:12px}.section-head p{font-size:16px;color:var(--muted)}.number{font-size:13px;color:var(--gold);padding-top:7px;min-width:27px}.shot{display:grid;grid-template-columns:100px 1fr;gap:20px;padding:24px 0;border-top:1px solid var(--line);transition:background .2s}.shot.active{background:#e7ebdf;box-shadow:12px 0 #e7ebdf,-12px 0 #e7ebdf}.shot-time{padding-top:2px;font-size:12px;color:var(--muted)}.shot-time span{display:block;padding:4px 8px}.result{font-size:16px;color:#405b61}details{font-size:15px;color:var(--muted)}summary{cursor:pointer;text-decoration:underline;text-decoration-color:#b1bdbb;text-underline-offset:4px}details p:first-of-type{margin-top:14px}.frames{font-size:11px}footer{margin-top:45px;padding-top:25px;border-top:1px solid var(--line);font-size:14px;color:var(--muted)}.small{font-size:14px;color:var(--muted)}.playback-tools{display:flex;align-items:center;gap:8px;margin-top:7px}.playback-tools button{font-size:11px;padding:4px 9px}.playback-tools span{font:11px system-ui;color:var(--muted)}
@media(max-width:680px){main,header,.player-inner{padding-left:20px;padding-right:20px}header{padding-top:35px}.overview-grid{grid-template-columns:1fr;gap:8px}.shot{grid-template-columns:76px 1fr;gap:10px}.shot-time button{padding:7px}.section-head{gap:10px}.player-top{display:block}audio{width:100%;max-width:100%;margin-top:8px}.player-label{display:block}h3{font-size:21px}.lead{font-size:20px}html{scroll-padding-top:235px}}
@media print{.player,nav,.listen{display:none}header{padding-top:0}main,header{max-width:none}.shot{break-inside:avoid}.shot-time:before{content:attr(data-time)}details{display:block}body{font-size:12pt}.overview{break-after:page}h1{font-size:32pt}.shot.active{background:none;box-shadow:none}}
</style></head><body>
<header><div class="eyebrow">Travel Agent · directing score · updated 7 October 2026</div><h1>A journey that develops.</h1><p class="lead">We leave the city, discover that the route itself can trap us, and find openings through the things that try to contain us. By the end we are still moving—freer, but exposed.</p><p class="status">FULL-SONG PLAN · approximately 6:43 · rendered study through 3:40<br>The latest rendered film is revision 8, covering departure, the circular route, the lure and institutional processing. The first 90 seconds are carried forward from revision 7. Later movements remain unanimated. Vocal times below are estimates; the audio buttons let each proposal be heard in context.</p></header>
<div class="player"><div class="player-inner"><div class="player-top"><div class="player-label"><b>Original recording</b><br><span id="now">Choose a passage below, or play from the beginning.</span></div><audio id="audio" controls preload="metadata" src="../source/travel-agent.mp3"></audio></div><div class="playback-tools"><button id="follow" aria-pressed="false">Follow playback: off</button><button id="continuous">Play continuously</button><span id="playmode" role="status">Passage buttons include two seconds of lead-in and stop at the next passage.</span></div><nav>__NAV__</nav></div></div>
<main><section class="overview"><div class="overview-grid"><div><h3>Keep the world we have</h3><p>Painted indigo city, amber glass, physical depth, flapping windows, lifting buildings, water, stone passage and timber door. The camera remains the traveller. Cuts and glances change our attention while preserving where we are.</p><p>The city stays behind at the shoreline. The escaped pane leaves the frame for long stretches. It returns once to help open the cage; no red marker and no permanent guide hovering in front of us.</p></div><div><h3>What gives the journey meaning</h3><p>The route changes function: invitation, circuit, conveyor, escape path, enclosure, open road. Reflections can carry the old world after its buildings have receded. Openings only become exits when something physically makes room.</p><p>No visible traveller, titles or lyric captions. The one bird requires a convincing silhouette and wing action. If that test fails, redesign the bird before adding it to the film.</p></div></div><h3>Music directs different kinds of action</h3><p>Vocal entrances trigger decisions and consequences. Selected attacks release a hinge, meet a rail or close a clamp. Longer phrases shape weight, turns and colour. Instrumental spaces reveal mechanisms or let the paint change state. Nothing uses a universal bounce or brightness pulse.</p><p class="small">This is an original visual interpretation informed by <a href="https://www.bobwiseman.ca/?p=3104">Bob’s lyric page and account of the recording</a>. His description of inner conflict informs the arc; these particular images and staging are our proposal.</p></section>
__CARDS__
<section class="overview"><h2>Build in this order</h2><ol><li><b>Repair the opening, 0:00–1:31.</b> Remove the red patch and ocean fleet; establish the shoreline departure; give the first vocal a consequential response; shorten and pass the sun event. Preserve the existing rendering and moving POV.</li><li><b>Prove the circuit, 1:24–2:40.</b> Make a short motion test showing the bent lamp return and the side view that reveals the loop. The geography must explain the trap.</li><li><b>Extend through the machine and theatre, 2:40–4:54.</b> Block the physical route and transitions before painting extra detail. Keep the glass sill and rail geometry consistent across edits.</li><li><b>Test wing clearance, then finish, 4:54–end.</b> Establish the bird’s form, resistance and release in a close test. Carry the cage shadows into the final weather.</li><li><b>Review a rough full-song cut with sound.</b> Confirm phrase entrances, holds, repeated calls and final decay. Only then lock detailed choreography and render the full film.</li></ol><p class="small">This order is a production sequence, not another request for approval. Still images and technical audio alignment cannot establish whether the finished rhythm works.</p></section>
<footer><p>All time ranges refer to the unchanged source recording. Existing automatic transcription supplied approximate phrase anchors; it was not newly force-aligned. The plan does not assert that every instrumental gap is free of backing vocals. Internal cuts are editorial proposals.</p><p>Timing data uses the decoded analysis duration of 403.35675 seconds; the MP3 container reports approximately 402.758 seconds. Resolve that discrepancy against playback before the full export. At 24 fps the planned picture range is [0, 9681).</p><p><a href="../retry-v8-development/out/travel-agent_journey_f00000-f05280_24fps_study-v8-development.mp4">Latest rendered study — 3:40</a> · <a href="../source/transcript-review.html">Transcript comparison notes</a></p></footer></main>
<script>
const audio=document.getElementById('audio'),cards=[...document.querySelectorAll('.shot')],now=document.getElementById('now'),mode=document.getElementById('playmode');
let stopAt=null,follow=false,last=null;
function currentCard(){return cards.find(c=>audio.currentTime>=Number(c.dataset.start)&&audio.currentTime<Number(c.dataset.end));}
async function playAt(start,end){try{if(audio.readyState===0)await new Promise((resolve,reject)=>{audio.addEventListener('loadedmetadata',resolve,{once:true});audio.addEventListener('error',reject,{once:true});audio.load();});stopAt=end;audio.currentTime=Math.min(Math.max(0,start-2),Number.isFinite(audio.duration)?Math.max(0,audio.duration-.05):start);await audio.play();mode.textContent='Playing this passage with lead-in; pauses at the next boundary.';}catch(e){mode.textContent='Audio could not play. Use the recording controls or open the original audio file.';}}
document.querySelectorAll('.listen').forEach(b=>b.addEventListener('click',()=>playAt(Number(b.dataset.start),Number(b.dataset.end))));
audio.addEventListener('timeupdate',()=>{const card=currentCard();cards.forEach(c=>c.classList.toggle('active',c===card));if(card){now.textContent=card.querySelector('h3').textContent;if(follow&&last!==card)card.scrollIntoView({block:'start',behavior:'smooth'});last=card;}if(stopAt!==null&&audio.currentTime>=stopAt){audio.pause();stopAt=null;mode.textContent='Passage finished. Select the next passage or continue playing.';}});
document.getElementById('follow').addEventListener('click',e=>{follow=!follow;e.target.textContent='Follow playback: '+(follow?'on':'off');e.target.setAttribute('aria-pressed',String(follow));});
document.getElementById('continuous').addEventListener('click',async()=>{stopAt=null;mode.textContent='Continuous playback; passage boundaries will not pause the audio.';try{await audio.play();}catch(e){mode.textContent='Use the audio play control to begin.';}});
audio.addEventListener('error',()=>{mode.textContent='The local recording could not be loaded.';});
</script></body></html>'''
page = page.replace('__CARDS__', '\n'.join(cards)).replace('__NAV__', ''.join(f'<a href="#movement-{n}">{n+1:02} {esc(m[0])}</a>' for n,m in enumerate(MOVEMENTS)))
(ROOT / 'index.html').write_text(page)
print(f'Built {len(shots)} passages, {len(MOVEMENTS)} movements, {shots[-1]["end_frame"]} frames.')
