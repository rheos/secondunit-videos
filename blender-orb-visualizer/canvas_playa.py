# Take 04: an 8-second seamless Canvas loop for Bob Wiseman's "The Reform Party at Burning Man" (Blender 4.5, EEVEE).
#
# The boardroom art car (a table that hides the whole car, the suits holding their meeting on chairs built out
# from its edge, the driver's red hat in the hole in the middle, a whiteboard of charts) drives round the Man.
# The car holds still in frame and the playa turns under it once in exactly 8 s: the Man at the centre, the
# city arc from 2:00 to 10:00 and the Temple out at 12:00 sweep round behind, so the last frame runs into the
# first. Wheels make exactly 15 turns a loop (the distance round the circle), the suits nod on 1 s and vote on
# 2 s, dust puffs on 0.5 s. Every period divides 8 s, so nothing jumps at the seam.
#
# Allegory only: faceless egg-headed suits with rosettes, no real people, never Bob. Palette from the drawn
# film (draft 24): navy suits, cream egg heads, red table top with gold trim, mahogany, black office chairs,
# playa tan, desert blue. Helpers in canvas_kit.py (the take-02 method).
#
#   blender -b --factory-startup --python canvas_playa.py -- --stills 1,49,97,145   (test stills)
#   blender -b --factory-startup --python canvas_playa.py -- --render                (all 192 frames)
# Frames land in out/canvas/take-04/frames/.
import math, sys, os, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd())
import canvas_kit as K
from canvas_kit import FPS, SECONDS, FRAMES, mat, specks, stripes, box, empty, blocks, disc, hex_lin

HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
OUT = os.path.join(HERE, "out", "canvas", "take-04")
scene = K.reset()

R = 6.2                                      # playa radius (m)
CAR_R = 3.0                                  # the car's circle round the Man
WHEEL = .2                                   # wheel radius: 2 pi CAR_R / (2 pi WHEEL) = 15 turns a loop

def cracks(base, line, n=5, seed=3):
    """playa crust: tan plates with darker crazing between them (Voronoi edges on the wrapping 16 px tile)"""
    L = hex_lin(line); rs = random.Random(seed)
    pts = [(rs.uniform(0, 16), rs.uniform(0, 16)) for _ in range(n)]
    def f(x, y, rnd):
        d = sorted(min((x + .5 - px + ox) ** 2 + (y + .5 - py + oy) ** 2 for ox in (-16, 0, 16) for oy in (-16, 0, 16)) ** .5 for px, py in pts)
        return L if d[1] - d[0] < .9 else None
    return f

def bars(board, cols):
    """a whiteboard chart: rising bars in the bottom of the tile, white above"""
    B, C = hex_lin(board), [hex_lin(c) for c in cols]
    def f(x, y, rnd):
        k = x // 3
        if x % 3 != 2 and 2 <= y < 3 + k * 2 and k < 5: return C[k % len(C)]
        return B
    return f

# ---------- palette (the film's own) ----------
M = dict(
    playa=mat("playa", "#e2c48e", .05, 2, texel=.11, pattern=cracks("#e2c48e", "#c6a36d")),
    dust=mat("dust", "#c9a777", .07, 3, texel=.1), dust2=mat("dust2", "#a88660", .08, 4, texel=.1),
    wood=mat("wood", "#b08a5a", .08, 5, texel=.05), woodD=mat("woodD", "#7d5e3c", .08, 6, texel=.05),
    tabletop=mat("tabletop", "#b02a2c", .05, 7, texel=.05, rough=.5), goldtrim=mat("goldtrim", "#d9a93a", .04, 8, texel=.05, rough=.4),
    mahog=mat("mahog", "#5a2a1e", .07, 9, texel=.05), tyre=mat("tyre", "#2a2626", .04, 10, texel=.05),
    suit=mat("suit", "#2e3550", .05, 11, texel=.05), egg=mat("egg", "#f1ead8", .03, 12, texel=.05, rough=.6),
    tie=mat("tie", "#b3222a", 0, 13, texel=.05), shirt=mat("shirt", "#f4f1ea", .02, 14, texel=.05),
    chair=mat("chair", "#1f1f24", .04, 15, texel=.05), hat=mat("hat", "#c8261e", .04, 16, texel=.05),
    board=mat("board", "#f6f4ee", 0, 17, texel=.045, pattern=bars("#f6f4ee", ("#3b5fa8", "#c8261e", "#3b5fa8", "#d9a93a", "#c8261e"))),
    steel=mat("steel", "#8d8f96", .05, 18, texel=.05, rough=.4), phone=mat("phone", "#3a3a40", .03, 19, texel=.05),
    white=mat("white", "#f2efe6", .03, 20, texel=.08), black=mat("black", "#24222a", .04, 21, texel=.08),
    orange=mat("orange", "#e0782f", .06, 22, texel=.08), teal=mat("teal", "#3aa39a", .06, 23, texel=.08),
    purple=mat("purple", "#7d4f9c", .06, 24, texel=.08), yellow=mat("yellow", "#e8c13e", .06, 25, texel=.08),
    silver=mat("silver", "#c9ccd2", .04, 26, texel=.08, rough=.4),
    flags=mat("flags", "#c8261e", 0, 27, texel=.05, pattern=stripes("#c8261e", "#e8c13e", 2)),
    puff=mat("puff", "#e9d6b2", .04, 30, texel=.06),
)

# ---------- the playa: a voxel disc, the Man at its centre ----------
playa = empty("playa")
disc("crust", R, 0, .22, M["playa"], playa)
disc("dustA", R - .3, -.22, .5, M["dust"], playa)
disc("dustB", R - 1.1, -.72, .45, M["dust2"], playa)
disc("dustC", R - 2.4, -1.17, .35, M["dust2"], playa)

def at_clock(hours, r):
    """a point on the playa by Black Rock City clock bearing: 12:00 points to the Temple (+y)"""
    a = math.radians(hours * 30)
    return (r * math.sin(a), r * math.cos(a))

# the Man: lanky wooden figure on a stepped base, arms down and out, legs apart, lantern head
man = empty("man", (0, 0, 0), playa)
box("base1", (1.7, 1.7, .3), (0, 0, .15), M["woodD"], man)
box("base2", (1.25, 1.25, .3), (0, 0, .45), M["wood"], man)
box("base3", (.8, .8, .25), (0, 0, .72), M["woodD"], man)
fig = empty("manFig", (0, 0, .85), man)
for s in (-1, 1):
    box(f"mleg{s}", (.1, .1, 1.1), (s * .2, 0, .52), M["wood"], fig, rot=(0, math.radians(-s * 10), 0))
    box(f"marm{s}", (.08, .08, .95), (s * .33, 0, 1.5), M["wood"], fig, rot=(0, math.radians(-s * 16), 0))
box("mhip", (.42, .1, .1), (0, 0, 1.04), M["wood"], fig)
box("mtorso", (.16, .1, .95), (0, 0, 1.5), M["wood"], fig)
box("mshoulder", (.5, .1, .1), (0, 0, 1.95), M["wood"], fig)
box("mneck", (.07, .07, .14), (0, 0, 2.06), M["wood"], fig)
box("mhead", (.22, .1, .22), (0, 0, 2.3), M["wood"], fig, rot=(0, math.radians(45), 0))
box("mhead2", (.12, .1, .5), (0, 0, 2.32), M["woodD"], fig)

# the Temple out at 12:00: the white onion-dome gateway tower with black trim
temple = empty("temple", (*at_clock(12, 5.75), 0), playa); temple.scale = (.45, .45, .45)   # small: it must never cover the car
box("tbase", (1.3, 1.0, .25), (0, 0, .125), M["black"], temple)
box("tl", (.32, .9, 1.3), (-.45, 0, .9), M["white"], temple); box("tr", (.32, .9, 1.3), (.45, 0, .9), M["white"], temple)
box("tlint", (1.25, .95, .3), (0, 0, 1.68), M["black"], temple)
box("ttower", (.9, .8, .7), (0, 0, 2.18), M["white"], temple)
for i, (w, h) in enumerate(((.95, .22), (1.05, .22), (.9, .2), (.6, .18), (.3, .16))):
    box(f"tdome{i}", (w, w, h), (0, 0, 2.64 + sum(hh for _, hh in ((.95, .22), (1.05, .22), (.9, .2), (.6, .18), (.3, .16))[:i])), M["black"] if i % 2 else M["white"], temple)
box("tspire", (.06, .06, .4), (0, 0, 3.7), M["black"], temple)

# the city arc, 2:00 to 10:00 along the rim: shade structures, tents, a dome, flags
rnd = random.Random(7)
COLS = ["orange", "teal", "purple", "yellow", "white", "silver"]
for i in range(15):
    h = 2.0 + 8.0 * (i + .5) / 15
    x, y = at_clock(h, 5.35 + rnd.uniform(-.2, .25))
    camp = empty(f"camp{i}", (x, y, 0), playa); camp.rotation_euler = (0, 0, -math.radians(h * 30))
    kind = i % 4; c = M[COLS[rnd.randrange(len(COLS))]]
    if kind == 0:                                               # shade structure on four posts
        for px in (-.35, .35):
            for py in (-.3, .3):
                box(f"post{i}{px}{py}", (.05, .05, .6), (px, py, .3), M["steel"], camp)
        box(f"shade{i}", (.9, .8, .06), (0, 0, .62), c, camp)
    elif kind == 1:                                             # a tent
        box(f"tent{i}", (.7, .55, .3), (0, 0, .15), c, camp); box(f"tentT{i}", (.45, .55, .18), (0, 0, .39), c, camp)
    elif kind == 2:                                             # a dome, stacked
        for j, w in enumerate((1.0, .86, .6)):
            box(f"dome{i}{j}", (w, w, .2), (0, 0, .1 + .2 * j), M["white"], camp)
    else:                                                       # a trailer under a flag
        box(f"trailer{i}", (.9, .4, .38), (0, 0, .24), M["silver"], camp)
        box(f"flagpole{i}", (.04, .04, 1.1), (.35, 0, .55), M["steel"], camp)
        box(f"flag{i}", (.32, .03, .2), (.53, 0, .98), M["flags"], camp)

# lamp posts on the Esplanade, inside the arc
for i in range(9):
    h = 2.5 + 7.0 * i / 8
    x, y = at_clock(h, 4.45)
    box(f"lamp{i}", (.05, .05, .7), (x, y, .35), M["woodD"], playa)
    box(f"lampTop{i}", (.12, .12, .1), (x, y, .73), M["yellow"], playa)

# far scenery: a few still clouds behind
for i, (x, z, w) in enumerate(((-5.5, 9.0, 2.6), (4.8, 10.5, 3.0), (-1.0, 12.0, 1.8))):
    box(f"farCloud{i}", (w, .8, .5), (x, 22, z), M["white"])

# ---------- the boardroom art car: held in frame on its circle, facing the way the ground carries it ----------
car = empty("car", (0, -CAR_R, 0)); car.rotation_euler = (0, 0, math.radians(180))   # its forward (+x) points left
wheels = []
for wx in (-.95, .95):
    for wy in (-.55, .55):
        w = empty(f"wheel{wx}{wy}", (wx, wy, WHEEL), car)
        box(f"tyreA{wx}{wy}", (2 * WHEEL, .16, 2 * WHEEL * .42), (0, 0, 0), M["tyre"], w)
        box(f"tyreB{wx}{wy}", (2 * WHEEL * .42, .16, 2 * WHEEL), (0, 0, 0), M["tyre"], w)
        box(f"tyreC{wx}{wy}", (2 * WHEEL * .78, .16, 2 * WHEEL * .78), (0, 0, 0), M["tyre"], w, rot=(0, math.radians(45), 0))
        box(f"hub{wx}{wy}", (.12, .18, .12), (0, 0, 0), M["goldtrim"], w, rot=(0, math.radians(45), 0))
        wheels.append(w)
box("chassis", (2.3, 1.0, .25), (0, 0, .42), M["tyre"], car)
box("apron", (2.9, 1.5, .34), (0, 0, .78), M["mahog"], car)          # the table's skirt hides the car
box("trimF", (2.92, 1.52, .05), (0, 0, .97), M["goldtrim"], car)
box("tabletop", (3.1, 1.7, .1), (0, 0, 1.04), M["tabletop"], car)
box("hole", (.42, .42, .11), (0, 0, 1.045), M["tyre"], car)           # the driver's hole
hat = empty("driverHat", (0, 0, 1.12), car)
box("brim", (.4, .4, .04), (0, 0, 0), M["hat"], hat); box("crown", (.24, .22, .14), (0, 0, .09), M["hat"], hat)
box("hatband", (.25, .23, .03), (0, 0, .04), M["chair"], hat)
# whiteboard on the front end, speakerphone, laptops, mugs
box("bleg1", (.04, .04, .55), (.9, 0, 1.36), M["steel"], car); box("bleg2", (.04, .04, .55), (1.5, 0, 1.36), M["steel"], car)
box("board", (.78, .05, .52), (1.2, 0, 1.78), M["board"], car, rot=(math.radians(-8), 0, 0))   # faces the near side
box("phone", (.2, .2, .05), (.45, 0, 1.115), M["phone"], car); box("phoneTop", (.1, .1, .04), (.45, 0, 1.15), M["steel"], car)
for i, (lx, ly) in enumerate(((-.7, -.5), (-.1, .52), (.75, -.5))):
    box(f"laptop{i}", (.22, .16, .02), (lx, ly, 1.1), M["steel"], car)
    box(f"screen{i}", (.22, .02, .16), (lx, ly + (.08 if ly > 0 else -.08), 1.18), M["phone"], car)
for i, (lx, ly) in enumerate(((-.4, -.48), (.2, .5), (1.0, .45))):
    box(f"mug{i}", (.06, .06, .08), (lx, ly, 1.13), M["white"], car)

# the board: faceless egg-headed suits on black office chairs built out from the table edge
suits = []
SEATS = [(x, s) for s in (-1, 1) for x in (-1.05, -.35, .35, 1.0 if s > 0 else .95)] + [(-1.75, 0)]
for i, (sx, side) in enumerate(SEATS):
    if side:
        seat = empty(f"seat{i}", (sx, side * 1.12, 0), car); seat.rotation_euler = (0, 0, math.radians(0 if side < 0 else 180))   # each suit faces the table (+y)
    else:
        seat = empty(f"seat{i}", (sx, 0, 0), car); seat.rotation_euler = (0, 0, math.radians(-90))   # the chair at the back end
    box(f"arm{i}", (.06, .3, .05), (0, .18, .8), M["steel"], seat)  # bracket from the table edge
    box(f"seatpan{i}", (.34, .34, .07), (0, 0, .76), M["chair"], seat)
    box(f"seatback{i}", (.34, .06, .42), (0, -.18, 1.0), M["chair"], seat)
    body = empty(f"suit{i}", (0, 0, .8), seat)
    box(f"thighs{i}", (.28, .3, .12), (0, .07, .05), M["suit"], body)
    box(f"shins{i}", (.26, .1, .32), (0, .2, -.14), M["suit"], body)
    box(f"shoes{i}", (.26, .16, .06), (0, .25, -.31), M["chair"], body)
    box(f"torso{i}", (.32, .22, .4), (0, -.04, .3), M["suit"], body)
    box(f"shirt{i}", (.1, .02, .26), (0, .075, .36), M["shirt"], body)
    box(f"tie{i}", (.04, .03, .2), (0, .085, .34), M["tie"], body)
    box(f"rosette{i}", (.07, .03, .07), (.1, .075, .42), M["tie"], body)
    head = empty(f"head{i}", (0, -.04, .64), body)
    box(f"egg{i}", (.2, .2, .28), (0, 0, 0), M["egg"], head); box(f"eggT{i}", (.14, .14, .08), (0, 0, .17), M["egg"], head)
    sh = empty(f"vote{i}", (.18, -.02, .46), body)                # the voting arm
    box(f"varm{i}", (.08, .08, .32), (0, 0, -.14), M["suit"], sh); box(f"vhand{i}", (.07, .07, .07), (0, 0, -.33), M["egg"], sh)
    suits.append((head, sh, i))

# dust kicked up behind the car (its back end is +x on screen)
puffs = []
for i in range(6):
    p = box(f"puff{i}", (.28, .28, .22), (0, 0, 0), M["puff"], car); puffs.append(p)

# ---------- camera, light, world ----------
K.camera((-1.0, -14.5, 12.5), (0, -1.1, .4), lens=44)
K.sun(3.4, (56, 0, -55), color=(1.0, .94, .84))
K.sky([(.0, "#e9d4b0"), (.35, "#c9d4dc"), (.7, "#86b0d8"), (1.0, "#5e93cc")])
K.render_setup(OUT)

# ---------- animation: everything keyed on every frame, all periods divide 8 s ----------
for fr in range(1, FRAMES + 1):
    t = (fr - 1) / FPS                                    # 0 .. 7.958; t = 8 is t = 0 again
    playa.rotation_euler = (0, 0, 2 * math.pi * t / SECONDS); playa.keyframe_insert("rotation_euler", frame=fr)
    spin = 15 * 2 * math.pi * t / SECONDS                 # 15 wheel turns a loop
    for w in wheels:
        w.rotation_euler = (0, spin, 0); w.keyframe_insert("rotation_euler", frame=fr)
    car.location = (0, -CAR_R, .025 * abs(math.sin(2 * math.pi * t / .5))); car.keyframe_insert("location", frame=fr)   # rattle: 0.5 s
    hat.rotation_euler = (0, 0, math.radians(20) * math.sin(2 * math.pi * t / 4.0)); hat.keyframe_insert("rotation_euler", frame=fr)  # he looks about: 4 s
    for head, sh, i in suits:
        ph = i / len(suits)
        head.rotation_euler = (-math.radians(10) * max(0, math.sin(2 * math.pi * (t + ph))), 0, 0); head.keyframe_insert("rotation_euler", frame=fr)  # nod: 1 s
        v = max(0, math.sin(2 * math.pi * (t / 2.0 + (i % 3) / 3)))                # vote: 2 s, a third of the board at a time
        sh.rotation_euler = (math.radians(160) * v ** .5, 0, 0); sh.keyframe_insert("rotation_euler", frame=fr)
    for i, p in enumerate(puffs):                         # each puff lives 0.5 s, drifting back and up, shrinking
        u = ((t / .5) + i / len(puffs)) % 1.0
        side = .45 if i % 2 else -.45
        p.location = (-1.55 - u * 1.3, side, .25 + u * .35); p.keyframe_insert("location", frame=fr)
        k = max(.05, 1.15 - u)
        p.scale = (k, k, k); p.keyframe_insert("scale", frame=fr)

K.linear_keys()
K.run(OUT)
