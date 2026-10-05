"""Build the Google Doc storyboard for Bob (same layout as the Airplane one: Still | Time | Lyric | What happens |
Planned | Bob's ideas), stills pulled from the rendered draft, each time linked to that second of the video.
Usage: python tools/storyboard_doc.py <draft.mp4> <youtube-url> <out.html>
Rows come from the six section builds (js/wch/w1..w6) and Bob's own storyboard numbering (his beats 1-31).
"""
import base64, html, subprocess, sys, tempfile, os

MP4, URL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]

# (time s, still at s, lyric, what happens, planned)
ROWS = [
 (0.0, 1.5, '"Life is hard, life ain\'t nice" (your 1)', 'Ellen walks an endless highway with her guitar case. Giant guitar tuning pegs line the road instead of telephone poles, strings slung between them; the sky is a worn sunburst guitar finish.', ''),
 (4.37, 7.0, '"Good luck with a career in music" (2)', 'A carnival booth: CAREER IN MUSIC. Prizes swing overhead: gramophone trophies, gold records, grocery coupons (10c OFF EGGS). Nobody running it: an empty stool, a bell, BACK IN 5 MINUTES.', ''),
 (10.0, 10.9, '"roll the dice" (3)', 'Ellen flings two huge dice across a stage past the amps and players. One lands TALENT, the other LUCK, which cracks in half.', ''),
 (11.53, 13.2, '"School bus driver" (4)', 'A night concert stage: the bus drives on and stops centre stage; its headlights swing up into the lighting rig as spotlights. Kids in striped pyjamas stare sleepily from the windows.', ''),
 (16.2, 17.6, '"for kids in their jammies" (5)', 'Down the bus aisle, the kids asleep. Dream balloons pop up on the words: a guitar, a planet, a dinosaur, dancing shoes. Ellen watches in the rear-view mirror and smiles.', ''),
 (19.6, 21.2, '"should be winning a lifetime achievement award" (6)', 'An absurd awards palace (LIFETIME ACHIEVEMENT, a house-sized gramophone on the dome). The bus pulls up; the red carpet rolls out to Ellen, then two attendants roll it back up. She rolls her eyes.', ''),
 (22.4, 23.4, '"at the Grammies" (7)', 'The doors open on a hall of gramophone trophies applauding each other. Ellen stands outside on the step holding her slide guitar.', ''),
 (24.23, 26.5, '"me and Jimi Hendrix" (8)', 'The Number 7 bus stop. You step in on "me", and Jimi fades in beside you like a ghost, fist up as if hailing the bus. Ellen waits; nobody reacts.', 'DONE (your note): you and Mr. Hendrix both in the frame.'),
 (27.9, 30.0, '"feel the same about Ellen McIlwaine" (9)', 'You and Jimi (pointing, the grinning 1968 photo) side by side, both looking her way; a giant glowing red E rises behind her; she rolls her eyes at the pair of you. ELLEN McILWAINE carves in on her name.', 'DONE (your note): both of you in the frame, Jimi smaller.'),
 (35.0, 40.5, 'instrumental (10)', 'A gigantic harmonica drops out of the sky and lands with absurd weight on the band\'s entry (0:40): the ground cracks, the fence falls over.', ''),
 (41.95, 44.4, 'instrumental (10)', 'Tiny cut-out Ellen walks in, flips the harmonica up and balances it on one fingertip like it weighs nothing.', ''),
 (45.45, 52.0, 'instrumental (10)', 'She blows one note: a stream of red hair pours out of the harmonica and keeps coming until it fills the screen.', ''),
 (56.0, 59.6, 'instrumental (10)', 'Giant scissors come down on the beats and snip it on the big hit (0:59). The cut hair drops and becomes a theatre curtain.', ''),
 (61.43, 70.0, 'instrumental (10)', 'The curtain opens: Ellen plays slide, her hair blowing flat in a hurricane while nothing else moves. Each slide move sprouts a harmonica from the ground (five of them, buzzing with the harmonica); she slides down and they sink back.', ''),
 (77.6, 79.0, '"Before Beyonce" (11)', 'Ellen walks past a gigantic Beyonce cut-out under a BEYONCE marquee.', ''),
 (80.33, 82.0, '"before the Pixies" (12)', 'Past a gigantic Pixies, the four of them, under a PIXIES marquee.', ''),
 (83.47, 85.0, '"she found her calling" (13)', 'Teenage Ellen\'s black-and-white bedroom: she holds her guitar, the cable trails to a tiny amp.', ''),
 (85.9, 89.0, '"in the 60s" (13)', 'Close on the amp: she plugs in, and on "sixties" the room explodes into op-art rings, spirals and THE SIXTIES lettering (the one place red goes beyond her hair).', ''),
 (91.37, 94.5, '"sermons about open tuning fitness" (14)', 'A church: Ellen at the pulpit (OPEN D) holding her guitar up like scripture; the six stained-glass windows light one per beat: D A D F# A D.', ''),
 (96.4, 98.4, '"plays slide guitar" (15)', 'Extreme close-up down the neck: the glass slide on the strings; the strings turn into six railway tracks.', ''),
 (99.33, 100.4, '"like none of your business" (16)', 'The slide is now a locomotive racing down the tracks; sparks become notes; Jimi hangs off the back laughing (HA!).', 'Kept (your note: you like Jimi on the train).'),
 (101.47, 104.5, '"I hope this song helps you" (26)', 'Bob puts a tiny record on a turntable; Ellen\'s school bus drives round the spinning record like driving round the world. (On the record this line comes here, not at the end of verse 3.)', 'DONE (your note): your face smaller and at the edge of the frame.'),
 (105.6, 109.5, '"remember her name, Ellen McIlwaine" (27)', 'The kids step off the bus holding letters, scrambled, then hop into place: ELLEN McILWAINE, on her name. Fireworks.', ''),
 (112.0, 112.4, 'instrumental (19)', 'An enormous black grand piano falls out of the sky and lands on the beat in an empty Victorian landscape; tiny Ellen walks toward it.', 'DONE (your note): more eye candy, earlier.'),
 (112.6, 119.0, 'instrumental (19)', 'The sky fills on the beats: a zeppelin towing ELLEN McILWAINE TONIGHT, four hot-air balloons rising, a flock of birds; a penny-farthing rider in a top hat wheels past her.', 'DONE (your note): more eye candy, earlier.'),
 (122.0, 127.6, 'instrumental (19)', 'Each piano note shoots a key up like a skyscraper until she walks through a city of piano keys; the towers start popping curios on springs: a top hat, a pocket watch, an umbrella, a birdcage with a hopping bird.', 'DONE (your note): the fun starts before the hand.'),
 (130.0, 138.5, 'instrumental (19)', 'A giant Victorian hand comes out of the clouds and plays the city: a fish in spectacles pops out, a boot, a teapot, then a tiny Ellen playing slide, then Ellens everywhere.', ''),
 (140.0, 143.5, 'instrumental (19)', 'Her hair blows sideways with no wind and stretches into a red musical staff; notes with briefcases walk along it; one trips and falls into the piano.', ''),
 (146.0, 149.6, 'instrumental (19)', 'The lid opens: inside, an enormous mouth playing harmonica. She closes it (silence), opens it (harmonica), closes, opens; shrugs and leaves it open.', ''),
 (152.9, 155.5, '"I heard about her in the 80s" (19)', 'Michael Jackson moonwalks in and dances with Ellen under a mirror ball; Cyndi Lauper slides in from the left, Bruce Springsteen from the right.', 'DONE (your note): more of the 80s.'),
 (156.4, 157.9, '"I heard about her in the 80s" (cont.)', 'Wide: the 80s line-up, nine across the floor. Madonna, Prince riding in on the purple bike, David Bowie, Boy George and David Byrne pop in on the beats, then everyone spins.', 'DONE (your note): more of the 80s.'),
 (159.47, 161.5, '"I wondered what\'s so special" (20)', 'A record store: tiny Ellen plays furiously in a listening booth; Bob peers through the glass with a magnifying glass, like at an unfamiliar species.', 'DONE (your note): you are smaller in the booth shot.'),
 (163.5, 165.0, '"about this lady" (21)', 'Close on the glass: Ellen looks straight at Bob and raises one eyebrow, still playing.', ''),
 (167.53, 170.5, '"I made no effort to inspect" (22)', 'Bob walks away; the shop stretches impossibly long behind him and Ellen shrinks to a red speck, still playing.', 'DONE (your note): you walk away as a silhouette.'),
 (172.33, 174.4, '"now all I got is the cheque" (23)', 'A big hand opens: a guest check reading AMOUNT DUE: PAY ATTENTION.', ''),
 (175.2, 176.6, '(25)', 'He tries to pay at a diner till: the cashier is Jimi, who shakes his head. NO SALE.', ''),
 (177.0, 180.5, '"I\'m ashamed I missed that train" (17)', 'The platform: the ELLEN McILWAINE train is already pulling away, Ellen playing on the back; the station clock has no hands. Bob takes his hat off.', ''),
 (185.03, 185.9, '"Ellen McIlwaine" (18)', 'The train\'s smoke writes ELLEN McILWAINE across the sky, then the harmonica wind breaks the letters apart.', ''),
 (187.0, 195.0, 'final instrumental (28)', 'Ellen alone on an enormous empty stage, no audience. She plays anyway.', 'PLANNED: her carved photo (singing at the mic with her guitar, from the picture you sent) for the stage shots.'),
 (205.23, 207.5, 'final instrumental (29)', 'Her eyeline: the dark empty house. Somebody is sitting six rows back: Jimi, small, listening.', 'DONE (your note): less Jimi: no push-in on him any more.'),
 (210.0, 213.0, 'final instrumental', 'The harmonica hurricane: Ellen twirls while she plays, hair flying, and keeps going.', 'DONE (your note): acrobatics.'),
 (220.6, 223.0, 'final instrumental', 'Cartwheels and a somersault across the stage, still playing.', 'DONE (your note): acrobatics.'),
 (225.2, 228.0, 'final instrumental (30)', 'She finishes and bows.', ''),
 (230.4, 232.0, 'final instrumental (30)', 'Jimi stands and applauds, one small figure in the whole empty house; then a wide bow from the back of the house. The guitar goes into its case.', 'DONE (your notes): less Jimi: a short, wide ovation.'),
 (240.33, 246.0, 'final instrumental (30)', 'The theatre fills: the school-bus kids, then musicians (Bob with his accordion, Beyonce, Michael Jackson, the Pixies).', ''),
 (247.0, 248.6, 'final instrumental (30)', 'Blues greats pop into the seats: Muddy Waters, Lightnin\' Hopkins, Little Richard, Janis Joplin, Chuck Berry, Sister Rosetta Tharpe, Otis Spann. Then ordinary people; a standing ovation. Ellen has already put her guitar away and walks off.', 'DONE (your note): blues artists in the seats, Otis Spann included.'),
 (262.47, 268.0, 'ending (31)', 'Dawn: Ellen drives the school bus away from the theatre (ELLEN McILWAINE on the marquee).', ''),
 (271.67, 273.5, 'ending (31)', 'The rear-view mirror: Jimi is in the last seat with his guitar. Ellen notices; small smile.', ''),
 (276.4, 277.6, 'final image (spoken lines)', 'Dawn at the roadside: you and Jimi, in silhouette, watch her bus drive into the sun. The balloons come up on the spoken lines: you, "That felt great." Jimi, "I think she would have liked that." You, "Yeah."', 'DONE (your note): the closing dialogue, now in sync with the voices on the recording.'),
]

def ts(t): m, s_ = divmod(t, 60); return f'{int(m)}:{s_:04.1f}'.replace('.0', '') if abs(s_ - round(s_)) < .05 else f'{int(m)}:{s_:04.1f}'
def still(t):
    f = tempfile.mktemp(suffix='.jpg')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t}', '-i', MP4, '-frames:v', '1', '-vf', 'scale=420:-1', '-q:v', '4', f], check=True)
    b = base64.b64encode(open(f, 'rb').read()).decode(); os.remove(f); return b

rows = []
for t, st, lyr, what, plan in ROWS:
    link = f'{URL}?t={int(t)}'
    rows.append(f'<tr><td><img src="data:image/jpeg;base64,{still(st)}" width="210"></td>'
                f'<td><a href="{link}">{ts(t)}</a></td><td>{html.escape(lyr)}</td><td>{html.escape(what)}</td>'
                f'<td>{html.escape(plan)}</td><td></td></tr>')
doc = f'''<html><head><meta charset="utf-8"></head><body>
<h1>Me and Jimi: storyboard (woodcut draft 6)</h1>
<p>Bob Wiseman, Me and Jimi (2026): your storyboard, all woodcut. Current draft: <a href="{URL}">{URL}</a>. Each timestamp links to that moment in the video. The numbers in brackets are your beat numbers from your notes.</p>
<p>Write your ideas straight into the last column, or anywhere you like. "DONE" marks your notes that are in this cut (from all your rounds so far); "PLANNED" notes are changes already on the list. Ellen is rounder all the way through, in every shot. New in draft 6: the piano section is busy from its first beat, and the 80s dance is a crowd (Cyndi Lauper, Springsteen, Madonna, Prince, Bowie, Boy George, David Byrne). Since draft 3: the closing lines land on the spoken words, you beside Jimi for "me and Jimi Hendrix feel the same", less Jimi in the theatre, and the closing dialogue. Photos of you at other ages are welcome whenever you have them.</p>
<p>One thing to know: on the 2026 recording you sing "I hope this song helps you remember her name" at the end of verse 2 and "I'm ashamed I missed that train" at the end of verse 3 (your notes have them the other way round), so those beats sit where the words are actually sung.</p>
<table border="1" cellpadding="6"><tr><th>Still</th><th>Time</th><th>Lyric</th><th>What happens</th><th>Planned</th><th>Bob's ideas</th></tr>
{"".join(rows)}
</table></body></html>'''
open(OUT, 'w').write(doc); print('wrote', OUT, len(ROWS), 'rows')
