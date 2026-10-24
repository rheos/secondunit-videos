# Take 03: an 8-second seamless Canvas loop for Bob Wiseman's "All The Trees" (Blender 4.5 LTS, EEVEE).
#
# The film's thesis as one object: the sun-headed man and the moon-headed woman stand apart on a floating
# island, arms raised into boughs, with the heart tree between them; under the island their roots hang down
# and knot together in gold. The island turns once in exactly 8 s, so the last frame runs into the first.
# A gold pulse runs down his roots, through the knot and up hers in 4 s, then back (8 s). Boughs and the
# cloud trumpeters rock on 2 s, the heart beats on 1 s, the sun's rays turn 45 degrees in 2 s (eight rays,
# so the head maps onto itself). Every period divides 8 s, so nothing jumps at the seam.
#
# Palette from the film's hand-coloured engraving: azure sky, ultramarine and rose robes, gamboge sun,
# sap-green leaves, tan soil, cream paper. Helpers in canvas_kit.py (the take-02 method).
#
#   blender -b --factory-startup --python canvas_trees.py -- --stills 1,49,97,145   (test stills)
#   blender -b --factory-startup --python canvas_trees.py -- --render                (all 192 frames)
# Frames land in out/canvas/take-03/frames/.
import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd())
import canvas_kit as K
from canvas_kit import FPS, SECONDS, FRAMES, mat, specks, box, empty, hex_lin
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
OUT = os.path.join(HERE, "out", "canvas", "take-03")
scene = K.reset()

def hatch(base, ink, every=3):
    """engraving hatch: every third pixel column a shade darker"""
    I = hex_lin(ink)
    return lambda x, y, rnd: I if x % every == 0 and rnd.random() < .85 else None

# ---------- palette (the film's own) ----------
M = dict(
    grass=mat("grass", "#9dbb6c", .10, 2, texel=.08, pattern=specks("#c3d68e", "#6f9a45", .12)),
    soil1=mat("soil1", "#c9a46c", .08, 3, texel=.1, pattern=specks("#9a7a52", "#efe3c6", .06)),
    soil2=mat("soil2", "#ad8152", .09, 4, texel=.1, pattern=specks("#8b6a43", "#d9c4a0", .07)),
    soil3=mat("soil3", "#8e6640", .10, 5, texel=.1, pattern=specks("#6b4c30", "#c9b48f", .08)),
    soil4=mat("soil4", "#6f4f33", .10, 6, texel=.1, pattern=specks("#53392a", "#a88f6c", .08)),
    root=mat("root", "#6b4a2e", .10, 7, texel=.05, pattern=hatch("#6b4a2e", "#4a321f")),
    wood=mat("wood", "#7a5a3a", .08, 8, texel=.05, pattern=hatch("#7a5a3a", "#55402a")),
    leaf=mat("leaf", "#6f9a45", .12, 9, texel=.06, pattern=specks("#a9c76e", "#4d7a35", .25)),
    leaf2=mat("leaf2", "#5a8a3c", .12, 10, texel=.06, pattern=specks("#8fb85c", "#3f6a2e", .25)),
    blue=mat("blue", "#2f4c93", .06, 11, texel=.05, pattern=hatch("#2f4c93", "#1f3268")),
    rose=mat("rose", "#a33b46", .06, 12, texel=.05, pattern=hatch("#a33b46", "#76252f")),
    gold=mat("gold", "#d9a535", .06, 13, texel=.05, rough=.45, emit=.15),
    goldray=mat("goldray", "#e8bb45", .04, 14, texel=.05, rough=.45, emit=.25),
    moon=mat("moon", "#c3c9d4", .05, 15, texel=.05, pattern=specks("#9aa3b4", "#e2e6ec", .15)),
    moonrim=mat("moonrim", "#7d879c", .05, 16, texel=.05),
    ink=mat("ink", "#2a1f17", 0, 17, texel=.05),
    knot=mat("knot", "#e6b63e", .05, 18, texel=.05, rough=.35, emit=.6),
    pulse=mat("pulse", "#ffd76a", 0, 19, texel=.05, emit=4.0),
    heart=mat("heart", "#b3263a", .06, 20, texel=.05, rough=.5, emit=.1),
    cloud=mat("cloud", "#f4ecd8", .04, 21, texel=.06), cloud2=mat("cloud2", "#ddd3c0", .04, 22, texel=.06),
    angelR=mat("angelR", "#b0404a", .06, 23, texel=.05), angelG=mat("angelG", "#3f7a52", .06, 24, texel=.05),
    skin=mat("skin", "#efd9b9", .03, 25, texel=.05), wing=mat("wing", "#fbf6ea", .03, 26, texel=.05),
)

# ---------- the island: an upside-down stepped pyramid of soil, grass on top ----------
island = empty("island")
STEPS = [  # (half-width, top z, bottom z, material)
    (2.5, -.25, -.95, "soil1"), (2.1, -.95, -1.6, "soil2"), (1.6, -1.6, -2.2, "soil3"), (1.0, -2.2, -2.7, "soil4")]
box("grass", (5.2, 5.2, .25), (0, 0, -.125), M["grass"], island)
for i, (hw, zt, zb, m) in enumerate(STEPS):
    box(f"step{i}", (2 * hw, 2 * hw, zt - zb), (0, 0, (zt + zb) / 2), M[m], island)
for i, (x, y) in enumerate(((-2.1, 1.9), (1.7, 2.2), (2.2, -1.6), (-1.9, -2.15), (.6, 2.3))):   # tufts on the meadow
    box(f"tuft{i}", (.3, .3, .18), (x, y, .09), M["leaf2"], island)

# ---------- roots: voxel chains hanging under the island, all meeting in one knot ----------
KNOT = Vector((0, 0, -4.15))
ROOT_PATHS = {}
def strand(name, S, C, E, t0, t1, step=.13):
    """a root as a chain of axis-aligned boxes along a quadratic curve S -> E (control C), thickness t0 -> t1"""
    S, C, E = Vector(S), Vector(C), Vector(E)
    L = (C - S).length + (E - C).length
    n = max(3, int(L / step)); pts = []
    for i in range(n + 1):
        s = i / n
        p = (1 - s) ** 2 * S + 2 * (1 - s) * s * C + s * s * E
        th = t0 + (t1 - t0) * s
        box(f"{name}_{i:02d}", (th, th, th), tuple(p), M["root"], island)
        pts.append(p.copy())
    ROOT_PATHS[name] = pts
    return pts

def roots_from(tag, side):
    """three strands from one person: out from under the first, second and last steps, down and into the knot"""
    sx = side
    starts = [(sx * 2.3, -.7, -.95), (sx * 1.85, .9, -1.6), (sx * .75, -.35, -2.7)]
    for k, S in enumerate(starts):
        C = (S[0] * .95, S[1] * .7, KNOT.z + .35 + .25 * k)
        strand(f"root{tag}{k}", S, C, tuple(KNOT + Vector((sx * .18, 0, .05))), .26, .15)

roots_from("M", -1); roots_from("W", 1)
strand("rootH", (0, .45, -2.7), (.1, .3, -3.4), tuple(KNOT + Vector((0, 0, .18))), .2, .15)       # the heart tree's
tap = strand("tap", tuple(KNOT), (.35, .2, -5.0), (-.1, .1, -5.75), .2, .07, step=.12)              # one taproot below
for i, (r, rx, ry) in enumerate(((.5, 0, 0), (.42, 45, 0), (.42, 0, 45))):                           # the gold knot
    box(f"knot{i}", (r, r, r), tuple(KNOT), M["knot"], island, rot=(math.radians(rx), math.radians(ry), math.radians(45 * i)))
box("seed", (.16, .16, .16), tuple(tap[-1] + Vector((0, 0, -.08))), M["knot"], island)

# ---------- the pair (engraving people, not Bob or anyone real) ----------
ARM = 50                                                     # boughs raised 50 degrees from upright
def person(tag, x, robe, head_kind):
    p = empty(f"person{tag}", (x, -.35, 0), island)
    box(f"hem{tag}", (.9, .7, .22), (0, 0, .11), robe, p)
    box(f"girdle{tag}", (.6, .5, .07), (0, 0, 1.2), M["gold"], p)
    box(f"robe{tag}", (.66, .54, 1.0), (0, 0, .7), robe, p)
    box(f"chest{tag}", (.56, .46, .42), (0, 0, 1.4), robe, p)
    box(f"neck{tag}", (.16, .16, .14), (0, 0, 1.66), M["skin"], p)
    # arms raised into boughs: sleeve, branch, twigs, leaf clusters at the tips
    arms = []
    for s in (-1, 1):
        sh = empty(f"shoulder{tag}{s}", (s * .3, 0, 1.52), p)
        sh.rotation_euler = (0, math.radians(-s * ARM), 0)
        box(f"sleeve{tag}{s}", (.18, .18, .42), (0, 0, .21), robe, sh)
        box(f"hand{tag}{s}", (.12, .12, .1), (0, 0, .46), M["skin"], sh)
        box(f"bough{tag}{s}", (.11, .11, .8), (0, 0, .88), M["wood"], sh)
        box(f"twigA{tag}{s}", (.07, .07, .4), (s * .13, 0, 1.0), M["wood"], sh, rot=(0, math.radians(s * 40), 0))
        box(f"twigB{tag}{s}", (.07, .07, .35), (-s * .12, 0, .78), M["wood"], sh, rot=(0, math.radians(-s * 45), 0))
        for j, (lx, lz, w, m) in enumerate(((0, 1.36, .34, "leaf"), (s * .36, 1.2, .26, "leaf2"), (-s * .3, .98, .24, "leaf"), (s * .1, 1.58, .22, "leaf2"))):
            box(f"leaf{tag}{s}{j}", (w, w * .9, w * .8), (lx, 0, lz), M[m], sh)
        arms.append(sh)
    head = empty(f"head{tag}", (0, 0, 1.98), p)
    if head_kind == "sun":
        box(f"face{tag}", (.5, .32, .5), (0, 0, 0), M["gold"], head)
        box(f"faceX{tag}", (.62, .3, .36), (0, 0, 0), M["gold"], head)
        box(f"faceZ{tag}", (.36, .3, .62), (0, 0, 0), M["gold"], head)
        rays = empty(f"rays{tag}", (0, 0, 0), head)
        for k in range(8):
            a = math.radians(45 * k)
            box(f"ray{tag}{k}", (.12, .2, .26), (math.sin(a) * .5, 0, math.cos(a) * .5), M["goldray"], rays, rot=(0, a, 0))
    else:
        box(f"face{tag}", (.5, .32, .5), (0, 0, 0), M["moon"], head)
        box(f"faceX{tag}", (.62, .3, .36), (0, 0, 0), M["moon"], head)
        box(f"faceZ{tag}", (.36, .3, .62), (0, 0, 0), M["moon"], head)
        for k in range(8):                                   # a darker rim of hair round the moon face
            a = math.radians(45 * k + 22.5)
            box(f"rim{tag}{k}", (.16, .26, .16), (math.sin(a) * .4, .03, math.cos(a) * .4), M["moonrim"], head)
        rays = None
    for ex in (-.11, .11):
        box(f"eye{tag}{ex}", (.06, .04, .07), (ex, -.17, .04), M["ink"], head)
    box(f"mouth{tag}", (.14, .04, .04), (0, -.17, -.12), M["ink"], head)
    return p, arms, rays

man, armsM, raysM = person("M", -1.45, M["blue"], "sun")
woman, armsW, _ = person("W", 1.45, M["rose"], "moon")
man.rotation_euler = (0, 0, math.radians(-12)); woman.rotation_euler = (0, 0, math.radians(12))   # turned a little to each other

# the heart tree between them, growing out of the root junction
htree = empty("heartTree", (0, .55, 0), island)
box("htrunk", (.16, .16, 2.0), (0, 0, 1.0), M["wood"], htree)
box("hbranchL", (.08, .08, .5), (-.2, 0, 1.55), M["wood"], htree, rot=(0, math.radians(-40), 0))
box("hbranchR", (.08, .08, .5), (.2, 0, 1.4), M["wood"], htree, rot=(0, math.radians(40), 0))
box("hleafL", (.32, .28, .26), (-.42, 0, 1.78), M["leaf"], htree); box("hleafR", (.3, .26, .24), (.4, 0, 1.62), M["leaf2"], htree)
heart = empty("heart", (0, 0, 2.45), htree)
HP = .13                                                     # one heart pixel (m)
HEART = [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."]   # top row first
for r, row in enumerate(HEART):
    for c, ch in enumerate(row):
        if ch == "X":
            box(f"hpx{r}{c}", (HP * 1.01, HP * 1.8, HP * 1.01), ((c - 3) * HP, 0, (2.5 - r) * HP), M["heart"], heart)
ring = empty("heartRing", (0, 0, 2.45), htree)
for k in range(12):
    a = math.radians(30 * k)
    box(f"hring{k}", (.08, .08, .2), (math.sin(a) * .62, .05, math.cos(a) * .62), M["goldray"], ring, rot=(0, a, 0))

# ---------- the cloud trumpeters (the song is all brass), fixed left and right of the sky ----------
angels = []
for tag, (x, y, z), robe, s in (("L", (-2.25, 3.2, 3.95), M["angelR"], 1), ("R", (2.25, 3.2, 3.95), M["angelG"], -1)):
    c = empty(f"cloud{tag}", (x, y, z))
    for i, (px, pz, w, h) in enumerate(((0, 0, 1.4, .42), (-.45, .22, .7, .4), (.4, .24, .8, .42), (.78, .02, .5, .3), (-.82, .02, .46, .28))):
        box(f"puff{tag}{i}", (w, .8, h), (px, 0, pz), M["cloud"] if i else M["cloud2"], c)
    a = empty(f"angel{tag}", (0, 0, .3), c)
    box(f"arobe{tag}", (.34, .3, .55), (0, 0, .3), robe, a)
    box(f"ahead{tag}", (.22, .22, .22), (0, 0, .7), M["skin"], a)
    box(f"ahair{tag}", (.25, .25, .08), (0, .02, .83), M["gold"], a)
    for w in (-1, 1):
        box(f"awing{tag}{w}", (.12, .4, .45), (w * .2, .2, .45), M["wing"], a, rot=(math.radians(-25), 0, math.radians(w * 20)))
    tr = empty(f"trumpet{tag}", (s * .12, -.12, .66), a)
    box(f"tpipe{tag}", (.05, .05, .62), (0, 0, .31), M["gold"], tr)
    box(f"tbell{tag}", (.16, .16, .1), (0, 0, .64), M["gold"], tr)
    tr.rotation_euler = (0, math.radians(s * 62), 0)
    angels.append((a, tr, s))

# far scenery: a few still clouds in the sky behind
for i, (x, z, w) in enumerate(((-5.0, 6.0, 2.4), (4.6, 7.5, 2.8), (-1.5, -7.0, 2.0), (5.2, -4.2, 1.6))):
    box(f"farCloud{i}", (w, .8, .5), (x, 20, z), M["cloud"])

# ---------- camera, light, world ----------
K.camera((0, -24.0, 5.2), (0, 0, -.05), lens=47)
K.sun(3.0, (48, -14, -32), color=(1.0, .95, .86))
K.sky([(.0, "#efe4c8"), (.32, "#c9d3d1"), (.72, "#88a4c3"), (1.0, "#6f8db8")])
K.render_setup(OUT)

# ---------- animation: everything keyed on every frame, all periods divide 8 s ----------
pulse = box("pulse", (.3, .3, .3), (0, 0, 0), M["pulse"], island)
PATH = list(reversed(ROOT_PATHS["rootM1"])) + ROOT_PATHS["rootW1"]     # his middle root down, hers up
def along(path, s):
    f = s * (len(path) - 1); i = min(int(f), len(path) - 2)
    return path[i].lerp(path[i + 1], f - i)

def beat(p):
    """a heartbeat in one period: a thump and a smaller echo a quarter later"""
    d = lambda c: min(abs(p - c), 1 - abs(p - c))
    return .14 * math.exp(-(d(0) / .05) ** 2) + .08 * math.exp(-(d(.25) / .05) ** 2)

knot_bsdf = M["knot"].node_tree.nodes["Principled BSDF"]
for fr in range(1, FRAMES + 1):
    t = (fr - 1) / FPS                                    # 0 .. 7.958; t = 8 is t = 0 again
    island.rotation_euler = (0, 0, 2 * math.pi * t / SECONDS); island.keyframe_insert("rotation_euler", frame=fr)
    for k, (arms, ph) in enumerate(((armsM, 0), (armsW, .5))):          # boughs sway: 2 s
        sw = math.radians(5) * math.sin(2 * math.pi * (t / 2.0 + ph))
        for s, sh in zip((-1, 1), arms):
            sh.rotation_euler = (0, math.radians(-s * ARM) + sw, 0); sh.keyframe_insert("rotation_euler", frame=fr)
    raysM.rotation_euler = (0, math.radians(22.5) * t, 0); raysM.keyframe_insert("rotation_euler", frame=fr)   # 45 deg in 2 s
    hs = 1 + beat(t % 1.0)                                                # heart: 1 s
    heart.scale = (hs, hs, hs); heart.keyframe_insert("scale", frame=fr)
    ring.rotation_euler = (0, -math.radians(15) * t, 0); ring.keyframe_insert("rotation_euler", frame=fr)       # 30 deg in 2 s
    u = (t % 8.0) / 4.0                                                   # pulse: his roots to hers in 4 s, back in 4 s
    s = u if u <= 1 else 2 - u
    pulse.location = tuple(along(PATH, s)); pulse.keyframe_insert("location", frame=fr)
    dk = min(abs(s - .5), 1)                                              # the knot flares as the pulse passes through
    knot_bsdf.inputs["Emission Strength"].default_value = .6 + 2.4 * math.exp(-(dk / .08) ** 2)
    knot_bsdf.inputs["Emission Strength"].keyframe_insert("default_value", frame=fr)
    for a, tr, sg in angels:                                              # trumpeters rock on 2 s, horns lift on 1 s
        a.rotation_euler = (0, math.radians(7) * math.sin(2 * math.pi * t / 2.0) * sg, 0); a.keyframe_insert("rotation_euler", frame=fr)
        tr.rotation_euler = (0, math.radians(sg * (62 + 8 * math.sin(2 * math.pi * t))), 0); tr.keyframe_insert("rotation_euler", frame=fr)

K.linear_keys()
for fc in (M["knot"].node_tree.animation_data.action.fcurves if M["knot"].node_tree.animation_data else []):
    for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
K.run(OUT)
