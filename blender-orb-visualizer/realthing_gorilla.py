# Take 08: "The gorilla, in pixels". Real Thing look test (Blender 4.5 LTS, EEVEE), song 21.0-49.29 s.
#
# Bob's own story as the approved 2D draft tells it in verse 1 (js/gorilla/act1.js in the rt-gorilla worktree),
# rebuilt as a voxel jungle clearing with the whole frame pixelated (Pixelate size 5 throughout):
#   1 21.00-25.84  morning clearing, big tree; he sits under it, belly rumbles (23.1 23.45 23.8), looks up at the banana
#   2 25.84-28.72  the banana falls, bonks his head (26.38, as in the 2D), bounces into his hands (26.92); held up, delighted
#   3 28.72-32.04  close: he tugs at the stem three times, harder each time (29.13 30.0 30.9)
#   4 32.04-36.50  he bites it: clink, eyes cross (33.05, as in the 2D); again, harder (34.65)
#   5 36.50-38.20  he smashes it on a rock (37.05): the rock splits, the banana is fine
#   6 38.20-42.64  he wrestles it: a dust cloud of voxel puffs jittering on twos, limbs and the banana poking out
#   7 42.64-46.00  on his back, banana held up to the sky; a sigh; a leaf lands on his belly
#   8 46.00-49.30  on a branch above him a little monkey opens one with one flick (46.43) and eats it (47.24)
#
#   blender -b --factory-startup --python realthing_gorilla.py -- --stills 520,640,760,880,1000,1120
#   blender -b --factory-startup --python realthing_gorilla.py -- --render
# Frames (named by song frame) land in out/film/take-08/frames/. Every animated value is keyed on every frame
# from one function of song time, so a still and the full render agree. Switches (eye and mouth shapes, props)
# are scale keys (1 or ~0), so nothing depends on hide interpolation.
import bpy, bmesh, math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
sys.path.insert(0, HERE)
import canvas_kit as K
from canvas_kit import mat, specks, box, blocks, disc, empty, hex_lin
from film_kit import film_setup, shot_camera, cut, pixel_look, run, FPS
from mathutils import Vector, Matrix, Euler, Quaternion

OUT = os.path.join(HERE, "out", "film", "take-08")
F0, F1 = 504, 1183
scene = K.reset()
film_setup(OUT, F0, F1)

# ---------------------------------------------------------------- maths (the 2D kit's easing, in Python)
def cl(v, a=0., b=1.): return max(a, min(b, v))
def lerp(a, b, u): return a + (b - a) * u
def seg(t, a, b): return cl((t - a) / (b - a))
def eio(u): u = cl(u); return 4 * u ** 3 if u < .5 else 1 - (-2 * u + 2) ** 3 / 2
def eo(u): return 1 - (1 - cl(u)) ** 3
def ei(u): return cl(u) ** 2.2
def back(u): u = cl(u); c = 1.9; return 1 + (c + 1) * (u - 1) ** 3 + c * (u - 1) ** 2
def ring(t, f=9, d=7): return 0. if t < 0 else math.exp(-d * t) * math.cos(f * t)
def vl(a, b, u): return Vector(a).lerp(Vector(b), u)
def mtx(loc, rot=(0, 0, 0), scale=(1, 1, 1)):
    return Matrix.LocRotScale(Vector(loc), Euler([math.radians(a) for a in rot], "XYZ"), Vector(scale))
def seed(s): return sum(ord(c) * (i + 1) for i, c in enumerate(s)) % 9973
OFF = (1e-4, 1e-4, 1e-4)

def parts(name, plist, material, parent=None):
    """boxes in ONE mesh: plist = [(size, loc), (size, loc, rot_deg)] (rot about the box's own centre)"""
    me = bpy.data.meshes.new("CL_" + name); bm = bmesh.new()
    for p in plist:
        size, loc = p[0], p[1]
        R = Euler([math.radians(a) for a in p[2]], "XYZ").to_matrix().to_4x4() if len(p) > 2 and p[2] else Matrix()
        r = bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.transform(bm, matrix=Matrix.Translation(loc) @ R @ Matrix.Diagonal((*size, 1)), verts=r["verts"])
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new("CL_" + name, me); bpy.context.scene.collection.objects.link(ob)
    me.materials.append(material)
    if parent: ob.parent = parent
    return ob

def M(name, h, j=.06, texel=.05, pattern=None, emit=0., rough=.95):
    return mat(name, h, j, seed(name), texel=texel, pattern=pattern, emit=emit, rough=rough)

# ---------------------------------------------------------------- palette
FUR, FUR2, FACE, MUZ = "#3e3735", "#2e2827", "#9b8676", "#ad9787"
INK, WHITE, BAN, STEM = "#1a1412", "#fbf6ea", "#f3cf45", "#4a3a22"
m_fur = M("g_fur", FUR, .10, pattern=specks("#4a4240", "#2f2a28", .25)); m_fur2 = M("g_fur2", FUR2, .05)
m_face = M("g_face", FACE, .05); m_muz = M("g_muz", MUZ, .04); m_ink = M("ink", INK, 0); m_white = M("white", WHITE, 0)
m_mouth = M("mouth", "#5a2421", 0); m_grin = M("grin", "#7a2f2a", 0); m_sweat = M("sweat", "#bfe7f5", 0, emit=.3)
m_ban = M("banana", BAN, .04, texel=.03, pattern=specks("#d6ad2e", "#8a6a2a", .05)); m_stem = M("stem", STEM, .05)
m_flesh = M("flesh", "#f7efd0", .03)
m_monk = M("monkey", "#8a5a35", .08, pattern=specks("#9a6a42", "#74492a", .2)); m_monkc = M("monkey_cream", "#efd7b0", .04)
m_grass = M("grass", "#7fae5c", .08, texel=.1, pattern=specks("#6c9d4f", "#8fbd68", .22))
m_tuft = M("tuft", "#4c7d3a", .08); m_tuft2 = M("tuft2", "#5f9446", .08)
m_trunk = M("trunk", "#6a4b33", .10, texel=.08, pattern=specks("#56402c", "#7d5a3e", .2)); m_bark = M("bark", "#4c3424", .08, texel=.08)
m_leaf1 = M("leaf1", "#3f7a4c", .08, texel=.08); m_leaf2 = M("leaf2", "#4f8f57", .08, texel=.08); m_leaf3 = M("leaf3", "#66a865", .08, texel=.08)
m_far = M("far", "#9cc4a5", .04, texel=.15); m_mid = M("mid", "#6fa47c", .05, texel=.12); m_farthest = M("farthest", "#b9d6c0", .03, texel=.2)
m_fern = M("fern", "#3e7140", .08); m_fern2 = M("fern2", "#4d8a4c", .08); m_vine = M("vine", "#335f3b", .06)
m_rock = M("rock", "#8e8a84", .08, texel=.06); m_rock2 = M("rock2", "#a7a39c", .06, texel=.06)
m_dust = M("dust", "#efe4cc", .04, emit=.15); m_dust2 = M("dust2", "#d9cdb4", .05, emit=.1); m_dust3 = M("dust3", "#c4baa6", .05)
m_star = M("star", "#fff1a8", 0, emit=2.5); m_spark = M("spark", "#ffffff", 0, emit=4.0)
m_sun = M("sun", "#fff4cf", 0, emit=3.0); m_halo1 = M("halo1", "#fbefcc", 0, emit=1.6); m_halo2 = M("halo2", "#f6ecd0", 0, emit=1.25)
m_newleaf = M("newleaf", "#6caa58", .05)
FLOWERS = ["#f6c7d8", "#fff1a8", "#ffffff", "#f2a65a", "#cdb8ef"]

# ---------------------------------------------------------------- the clearing (static)
rnd = random.Random(8)
box("ground", (90, 90, .2), (0, 20, -.1), m_grass)
TREE = Vector((-2.9, 1.3))
box("trunk", (1.15, 1.15, 13), (TREE.x, TREE.y, 6.5), m_trunk)
parts("roots", [((1.9, .5, .3), (TREE.x, TREE.y - .2, .15)), ((.5, 1.9, .25), (TREE.x + .1, TREE.y, .12)),
                ((1.5, 1.5, .5), (TREE.x, TREE.y, .25))], m_bark)
HB_Z, HB_Y = 4.3, -.15                                    # the high branch the banana hangs from
LB_Z = 2.25                                              # the low branch the monkey sits on (shot 8), from tree 2
TREE2 = Vector((.5, 4.4)); LB_END = Vector((.5, -.9))     # tree 2 and its branch exist in shot 8 only (a cut cheat)
parts("branchHi", [((3.6, .34, .32), (-1.2, HB_Y, HB_Z)), ((1.6, .26, .26), (1.3, HB_Y, HB_Z + .08)), ((.8, .2, .2), (2.4, HB_Y, HB_Z + .2))], m_bark)
trunk2 = box("trunk2", (.9, .9, 13), (TREE2.x, TREE2.y, 6.5), m_trunk)
roots2 = parts("roots2", [((1.3, 1.3, .4), (TREE2.x, TREE2.y, .2)), ((.4, 1.6, .22), (TREE2.x - .1, TREE2.y, .11))], m_bark)
_bd = LB_END - TREE2; _ang = math.degrees(math.atan2(_bd.y, _bd.x)); _mid = (TREE2 + LB_END) / 2
branchLo = parts("branchLo", [((_bd.length, .3, .28), (_mid.x, _mid.y, LB_Z), (0, 0, _ang)),
                              ((.5, .22, .2), (LB_END.x + _bd.normalized().x * -.1, LB_END.y + _bd.normalized().y * -.1, LB_Z + .08), (0, 0, _ang))], m_bark)
for nm, ml, n, (x0, x1), (z0, z1) in (("canopyA", m_leaf1, 26, (-7.5, 2.0), (5.3, 9.5)), ("canopyB", m_leaf2, 18, (-6.5, 1.5), (5.6, 9.0)),
                                       ("canopyC", m_leaf3, 10, (-5.5, 1.0), (6.0, 8.8))):
    parts(nm, [((rnd.uniform(1.4, 2.8), rnd.uniform(1.2, 2.4), rnd.uniform(.9, 1.6)),
                (rnd.uniform(x0, x1), TREE.y + rnd.uniform(-1.6, 1.2), rnd.uniform(z0, z1))) for _ in range(n)], ml)
parts("leafHi", [((.7, .6, .45), (2.6 + rnd.uniform(-.4, .4), HB_Y + rnd.uniform(-.3, .3), HB_Z + .35 + rnd.uniform(-.1, .3))) for _ in range(6)], m_leaf2)
leafLo = parts("leafLo", [((.55, .5, .4), (LB_END.x - .25 + rnd.uniform(-.3, .3), LB_END.y - .2 + rnd.uniform(-.3, .3), LB_Z + .25 + rnd.uniform(-.1, .2))) for _ in range(4)], m_leaf3)
canopy2 = parts("canopy2", [((rnd.uniform(1.4, 2.6), rnd.uniform(1.2, 2.2), rnd.uniform(.9, 1.5)), (TREE2.x + rnd.uniform(-2.5, 2.5), TREE2.y + rnd.uniform(-1, 1.5), rnd.uniform(5.6, 9))) for _ in range(16)], m_leaf2)
parts("vines", [((.07, .07, L), (x, y, 5.6 - L / 2)) for x, y, L in ((-4.6, .3, 3.2), (-1.4, .5, 1.6), (-5.6, 1.9, 4.4), (-.4, 1.4, 2.1), (-3.6, -.6, 2.6))], m_vine)
# far jungle: three rows of canopy, lighter with distance
for nm, ml, y0, n, (h0, h1) in (("rowMid", m_mid, 13, 22, (2.5, 5.5)), ("rowFar", m_far, 21, 26, (4, 8)), ("rowFarthest", m_farthest, 32, 26, (6, 11))):
    xs = [-34 + i * 68 / n + rnd.uniform(-1, 1) for i in range(n)]
    parts(nm, [((rnd.uniform(3, 5.5), rnd.uniform(2, 4), h := rnd.uniform(h0, h1)), (x, y0 + rnd.uniform(-1.5, 1.5), h / 2)) for x in xs] +
              [((70, 3, h0 * .8), (0, y0 + 1, h0 * .4))] +
              # the same rows off to +x, for shots 7 and 8 that look down his body
              [((rnd.uniform(2, 4), rnd.uniform(3, 5.5), h := rnd.uniform(h0, h1)), (y0 + rnd.uniform(-1.5, 1.5), x, h / 2)) for x in xs] +
              [((3, 70, h0 * .8), (y0 + 1, 0, h0 * .4))], ml)
# flowers as coloured voxel dots, grass tufts
for i, c in enumerate(FLOWERS):
    parts(f"flowers{i}", [((s := rnd.uniform(.08, .13), s, s), (rnd.uniform(-7, 7), rnd.uniform(-4.5, 9), s / 2 + .02)) for _ in range(70)], M(f"flower{i}", c, 0))
for nm, ml in (("tufts", m_tuft), ("tufts2", m_tuft2)):
    pl = []
    for _ in range(170):
        x, y = rnd.uniform(-8, 8), rnd.uniform(-4.5, 10)
        for k in range(3): pl.append(((.05, .05, h := rnd.uniform(.12, .3)), (x + k * .07 - .07, y + rnd.uniform(-.03, .03), h / 2)))
    parts(nm, pl, ml)

def fern(name, x, y, size=1.0, yaw=0, ml=m_fern):
    pl = []
    for i in range(8):
        a = math.radians(-70 + i * 20); az = math.radians(yaw + (i % 2) * 24 - 12)
        for k in range(4):
            el = a * (1 + k * .35)                         # each frond droops as it goes out
            d = Vector((math.sin(el) * math.cos(az), math.sin(el) * math.sin(az) + .0, math.cos(el)))
            p = Vector((0, 0, 0))
            for kk in range(k):
                el2 = a * (1 + kk * .35); p += Vector((math.sin(el2) * math.cos(az), math.sin(el2) * math.sin(az), math.cos(el2))) * .34 * size
            c = p + d * .17 * size
            rot = Vector((0, 0, 1)).rotation_difference(d).to_euler()
            pl.append(((.2 * size * (1 - k * .18), .06 * size, .36 * size), (x + c.x, y + c.y, c.z + .05), [math.degrees(v) for v in rot]))
    return parts(name, pl, ml)
for i, (x, y, s, yw, ml) in enumerate(((-2.5, -2.4, 1.0, 10, m_fern), (3.0, -1.0, 1.2, -15, m_fern), (3.9, .9, 1.4, 30, m_fern2),
                                        (-4.4, -.1, 1.4, 0, m_fern2), (-1.2, 2.8, 1.1, 60, m_fern), (1.9, 2.6, 1.2, -40, m_fern2),
                                        (4.9, -2.6, 1.3, 5, m_fern2), (-4.6, -2.8, 1.2, 20, m_fern))):
    fern(f"fern{i}", x, y, s, yw, ml)

# the morning sun, a stepped halo, high in the back right
for nm, r, ml, dy in (("sun", 3.0, m_sun, 0), ("halo1", 4.4, m_halo1, .5), ("halo2", 6.0, m_halo2, 1.0)):
    d = disc(nm, r, 0, .2, ml, step=.6); d.location = (26, 75 + dy, 30); d.rotation_euler = (math.radians(90), 0, math.radians(-15))
    d.visible_shadow = False

# the rock (two halves, so it can split)
ROCK = Vector((1.1, -.55, 0))
rock_root = empty("rock", ROCK); rock_root.rotation_euler = (0, 0, math.radians(25))
rockL = empty("rockL", (0, 0, 0), rock_root); rockR = empty("rockR", (0, 0, 0), rock_root)
for s, half in ((-1, rockL), (1, rockR)):
    parts(f"rock{s}", [((.48, .82, .55), (s * .25, 0, .275)), ((.4, .66, .2), (s * .21, 0, .64)), ((.26, .48, .12), (s * .14, 0, .79))], m_rock, half)
    parts(f"rockTop{s}", [((.3, .5, .05), (s * .17, -.05, .86)), ((.2, .2, .2), (s * .36, -.3, .5))], m_rock2, half)

# ---------------------------------------------------------------- the gorilla (faces -y; body origin = pelvis)
G = {}
g_root = empty("g_root"); g_body = empty("g_body", (0, 0, 0), g_root)
parts("g_torso", [((1.22, .9, .72), (0, 0, .36)), ((1.12, .84, .46), (0, .02, .88)), ((1.5, .82, .44), (0, .06, 1.18)),
                  ((1.04, .7, .26), (0, .14, 1.42))], m_fur, g_body)
parts("g_chest", [((.32, .06, .3), (s * .19, -.43, .95)) for s in (-1, 1)] + [((.62, .06, .46), (0, -.465, .42))], m_face, g_body)
g_head = empty("g_head", (0, -.14, 1.3), g_body)
parts("g_skull", [((1.04, .9, .86), (0, 0, .42)), ((.64, .6, .24), (0, .1, .94))], m_fur, g_head)
parts("g_ears", [((.07, .14, .16), (s * .54, 0, .42)) for s in (-1, 1)], m_face, g_head)
parts("g_mask", [((.78, .06, .3), (0, -.465, .42)), ((.62, .06, .3), (0, -.465, .17))], m_face, g_head)
g_brow = parts("g_brow", [((.88, .24, .15), (0, -.5, .6)), ((.24, .16, .1), (0, -.55, .54))], m_fur2, g_head)
box("g_muzzle", (.58, .3, .32), (0, -.56, .14), m_muz, g_head)
parts("g_nostrils", [((.08, .03, .06), (s * .08, -.715, .22)) for s in (-1, 1)] + [((.06, .03, .03), (0, -.715, .26))], m_ink, g_head)
g_sweat = box("g_sweat", (.08, .05, .12), (.55, -.25, .6), m_sweat, g_head)
EYE_BASE = Vector((0, -.505, .44))
g_eyes = empty("g_eyes", EYE_BASE, g_head)
EX = (-.19, .19)
def variant(name, parent, by_mat):
    e = empty(name, (0, 0, 0), parent)
    for ml, pl in by_mat: parts(name + "_" + ml.name, pl, ml, e)
    return e
EYES = {
    "open": variant("g_eyeOpen", g_eyes, [(m_ink, [((.13, .03, .13), (x, 0, 0)) for x in EX]), (m_white, [((.04, .02, .04), (x + .03, -.012, .035)) for x in EX])]),
    "happy": variant("g_eyeHappy", g_eyes, [(m_ink, [((.12, .03, .04), (x, 0, .03)) for x in EX] + [((.04, .03, .07), (x + s * .06, 0, -.01)) for x in EX for s in (-1, 1)])]),
    "cross": variant("g_eyeCross", g_eyes, [(m_white, [((.17, .025, .16), (x, 0, 0)) for x in EX]), (m_ink, [((.07, .035, .08), (x - (1 if x > 0 else -1) * .045, -.01, -.01)) for x in EX])]),
    "shut": variant("g_eyeShut", g_eyes, [(m_ink, [((.15, .03, .04), (x, 0, -.01)) for x in EX])]),
    "half": variant("g_eyeHalf", g_eyes, [(m_ink, [((.13, .03, .065), (x, 0, -.03)) for x in EX]), (m_fur2, [((.16, .035, .05), (x, -.005, .03)) for x in EX])]),
}
g_mouth = empty("g_mouth", (0, -.715, .07), g_head)
MOUTH = {
    "flat": variant("g_mFlat", g_mouth, [(m_ink, [((.24, .02, .035), (0, 0, 0))])]),
    "o": variant("g_mO", g_mouth, [(m_mouth, [((.09, .02, .1), (0, 0, -.01))])]),
    "grin": variant("g_mGrin", g_mouth, [(m_grin, [((.3, .02, .1), (0, 0, -.01))]), (m_white, [((.26, .025, .03), (0, -.002, .025))])]),
    "grit": variant("g_mGrit", g_mouth, [(m_white, [((.28, .02, .08), (0, 0, 0))]), (m_ink, [((.29, .025, .014), (0, -.002, 0))] + [((.014, .025, .085), (x, -.002, 0)) for x in (-.07, 0, .07)])]),
    "frown": variant("g_mFrown", g_mouth, [(m_ink, [((.14, .02, .035), (0, 0, .015)), ((.05, .02, .035), (-.09, 0, -.01)), ((.05, .02, .035), (.09, 0, -.01))])]),
}
SH = {"A": Vector((.78, -.02, 1.16)), "B": Vector((-.78, -.02, 1.16))}
POLE = {"A": Vector((1, .45, -.9)), "B": Vector((-1, .45, -.9))}
L1, L2 = .62, .64
ARM = {}
for s, S in SH.items():
    sh = empty("g_sh" + s, S, g_body); sh.rotation_mode = "QUATERNION"
    box("g_upper" + s, (.34, .34, .74), (0, 0, -.3), m_fur, sh)
    el = empty("g_el" + s, (0, 0, -L1), sh); el.rotation_mode = "QUATERNION"
    box("g_fore" + s, (.38, .38, .6), (0, 0, -.27), m_fur, el)
    box("g_hand" + s, (.34, .32, .26), (0, 0, -L2), m_face, el)
    ARM[s] = (sh, el)
HIP = {}
for s, x in (("A", .32), ("B", -.32)):
    hp = empty("g_hip" + s, (x, -.05, .12), g_body)
    box("g_leg" + s, (.4, .4, .48), (0, 0, -.2), m_fur, hp)
    box("g_foot" + s, (.42, .52, .16), (0, -.08, -.46), m_fur2, hp)
    HIP[s] = hp
g_rumble = empty("g_rumble", (0, 0, 0), g_body)
parts("g_rumbleArcs", [((.05, .05, .14), (s * .78, -.32, .45)) for s in (-1, 1)] + [((.05, .05, .07), (s * .74, -.38, z)) for s in (-1, 1) for z in (.33, .57)] +
      [((.05, .05, .2), (s * .9, -.3, .45)) for s in (-1, 1)], m_ink, g_rumble)
SIT_Z, STAND_Z = .08, .42
LIE_ROOT, LIE_ROT = Vector((-1.5, -.2, .45)), (-90, 0, -90)

def ik(S, T, l1, l2, pole):
    d = T - S; D = d.length; clamped = D > l1 + l2 - 1e-3
    D = cl(D, abs(l1 - l2) + 1e-3, l1 + l2 - 1e-3); u = d.normalized()
    a = (l1 * l1 - l2 * l2 + D * D) / (2 * D); h = math.sqrt(max(l1 * l1 - a * a, 0))
    p = pole - u * pole.dot(u)
    if p.length < 1e-5: p = Vector((0, 1, 0)) - u * u.y
    p.normalize()
    E = S + u * a + p * h; Tc = S + u * D
    down = Vector((0, 0, -1))
    d1 = (E - S).normalized()
    if d1.dot(down) < -.9999: d1 = (d1 + Vector((0, -1e-3, 0))).normalized()
    q1 = down.rotation_difference(d1)
    dl = q1.inverted() @ (Tc - E).normalized()
    q2 = down.rotation_difference(dl)
    return q1, q2, clamped

# ---------------------------------------------------------------- the banana (stem at +x, curved up at both ends)
def banana(name, parent=None):
    e = empty(name, (0, 0, 0), parent)
    # stepped, axis-aligned voxels: a smile of five boxes rising at both ends
    parts(name + "_body", [((.36, .18, .17), (0, 0, 0)), ((.2, .17, .16), (.27, 0, .045)), ((.2, .17, .16), (-.27, 0, .045)),
                           ((.14, .14, .14), (.42, 0, .12)), ((.14, .14, .14), (-.42, 0, .12))], m_ban, e)
    parts(name + "_stem", [((.16, .07, .07), (.56, 0, .2)), ((.06, .1, .1), (-.51, 0, .15))], m_stem, e)
    return e
BAN_GRIP = {"stem": Vector((.52, 0, .17)), "tip": Vector((-.4, 0, .1)), "mid": Vector((0, 0, .01))}
ban = banana("ban")
HANG_ROT = (0, -90, 0)
HANG = Vector((.3, -.32, HB_Z - .16 - .52))                # stem tip touches the branch's underside
parts("banKnot", [((.1, .1, .12), (HANG.x - .19, HANG.y, HB_Z - .17))], m_vine)

# ---------------------------------------------------------------- effects
def star(name, ml, s=1.0):
    return parts(name, [((.24 * s, .04, .06 * s), (0, 0, 0)), ((.06 * s, .04, .24 * s), (0, 0, 0)), ((.1 * s, .05, .1 * s), (0, 0, 0))], ml)
stars = [star(f"star{i}", m_star) for i in range(5)]
clink = star("clink", m_spark, 1.6)
debris = [box(f"debris{i}", (.12, .12, .12), (0, 0, 0), m_dust if i % 2 else m_rock2) for i in range(7)]
effort = parts("effort", [((.3, .04, .05), (0, 0, z)) for z in (-.14, 0, .14)], m_ink)
breath = [box(f"breath{i}", (.14 - i * .03,) * 3, (0, 0, 0), m_dust) for i in range(3)]
leaf = empty("leaf")
parts("leafBlade", [((.36, .16, .035), (0, 0, 0)), ((.22, .26, .035), (0, 0, 0)), ((.1, .03, .03), (-.23, 0, 0))], m_newleaf, leaf)
# the dust cloud: puffs and pokes, under one root
cloud = empty("cloud")
puffs = [box(f"puff{i}", (1, 1, 1), (0, 0, 0), (m_dust, m_dust2, m_dust3)[i % 3], cloud) for i in range(16)]
POKES = [(-2.6, "arm"), (-.25, "foot"), (.55, "arm"), (3.5, "foot")]
pokes = []
for i, (a0, kind) in enumerate(POKES):
    e = empty(f"poke{i}", (0, 0, 0)); e.rotation_mode = "QUATERNION"
    box(f"pokeLimb{i}", (.32, .32, .8), (0, 0, -.4), m_fur, e)
    if kind == "arm": box(f"pokeHand{i}", (.38, .36, .28), (0, 0, -.86), m_face, e)
    else: box(f"pokeFoot{i}", (.42, .16, .5), (0, 0, -.86), m_fur2, e)
    pokes.append(e)

# ---------------------------------------------------------------- the monkey (small, brown, long tail)
MKS, MKR = 1.3, -72                                        # monkey scale, and yaw: he faces shot 8's camera
MK = Vector((.55, -.22, LB_Z + .15 * MKS))
mk_root = empty("mk_root", MK); mk_root.rotation_euler = (0, 0, math.radians(MKR))
parts("mk_body", [((.36, .3, .4), (0, 0, .22)), ((.3, .26, .1), (0, 0, .44))], m_monk, mk_root)
box("mk_belly", (.22, .03, .26), (0, -.155, .2), m_monkc, mk_root)
mk_head = empty("mk_head", (0, -.02, .48), mk_root)
box("mk_skull", (.4, .32, .32), (0, 0, .16), m_monk, mk_head)
parts("mk_ears", [((.08, .06, .12), (s * .23, 0, .17)) for s in (-1, 1)], m_monkc, mk_head)
parts("mk_face", [((.28, .04, .2), (0, -.17, .13)), ((.16, .06, .08), (0, -.2, .06))], m_monkc, mk_head)
box("mk_nose", (.04, .02, .025), (0, -.235, .1), m_ink, mk_head)
MKEYES = {"open": variant("mk_eyeOpen", mk_head, [(m_ink, [((.06, .02, .07), (x, -.195, .175)) for x in (-.065, .065)])]),
          "happy": variant("mk_eyeHappy", mk_head, [(m_ink, [((.06, .02, .025), (x, -.195, .19)) for x in (-.065, .065)] +
                                                            [((.02, .02, .04), (x + s * .03, -.195, .17)) for x in (-.065, .065) for s in (-1, 1)])])}
MKMOUTH = {"smile": variant("mk_mSmile", mk_head, [(m_ink, [((.07, .02, .02), (0, -.235, .04)), ((.02, .02, .02), (-.045, -.235, .05)), ((.02, .02, .02), (.045, -.235, .05))])]),
           "chew": variant("mk_mChew", mk_head, [(m_ink, [((.06, .02, .035), (0, -.235, .045))])])}
MSH = {"A": Vector((.19, -.03, .36)), "B": Vector((-.19, -.03, .36))}
MPOLE = {"A": Vector((1, .3, -.6)), "B": Vector((-1, .3, -.6))}
ML1, ML2 = .17, .18
MARM = {}
for s, S in MSH.items():
    sh = empty("mk_sh" + s, S, mk_root); sh.rotation_mode = "QUATERNION"
    box("mk_up" + s, (.09, .09, .2), (0, 0, -.08), m_monk, sh)
    el = empty("mk_el" + s, (0, 0, -ML1), sh); el.rotation_mode = "QUATERNION"
    box("mk_fo" + s, (.085, .085, .18), (0, 0, -.08), m_monk, el)
    box("mk_hand" + s, (.09, .09, .08), (0, 0, -ML2), m_monkc, el)
    MARM[s] = (sh, el)
parts("mk_legs", [((.1, .1, .34), (s * .09, -.2, -.1)) for s in (-1, 1)], m_monk, mk_root)
parts("mk_feet", [((.11, .14, .06), (s * .09, -.24, -.28)) for s in (-1, 1)], m_monkc, mk_root)
tail = [box(f"mk_tail{i}", (.08, .08, .2), (0, 0, 0), m_monk, mk_root) for i in range(12)]
# the monkey's banana: peeled with one flick
pb = empty("pb")
parts("pb_base", [((.12, .12, .2), (0, 0, .1))], m_ban, pb)
box("pb_stem", (.06, .06, .07), (0, 0, -.03), m_stem, pb)
pb_top = parts("pb_top", [((.12, .12, .34), (0, 0, .37)), ((.08, .08, .08), (0, 0, .58))], m_ban, pb)
pb_flesh = empty("pb_fleshPivot", (0, 0, .2), pb)
box("pb_flesh", (.085, .085, .34), (0, 0, .17), m_flesh, pb_flesh)
flaps = []
for i in range(3):
    a = i * 120 + 30
    f = empty(f"pb_flap{i}", (.055 * math.cos(math.radians(a)), .055 * math.sin(math.radians(a)), .2), pb)
    f.rotation_euler = (0, 0, math.radians(a))
    piv = empty(f"pb_flapPiv{i}", (0, 0, 0), f)
    box(f"pb_flapBox{i}", (.035, .1, .34), (0, 0, .17), m_ban, piv)
    flaps.append(piv)
mk_spark = star("mkSpark", m_spark, 1.0)

# ---------------------------------------------------------------- cameras and light
K.sun(3.4, (52, 0, 34), color=(1.0, .95, .85), angle_deg=8)
K.sky([(0, "#f6e7bf"), (.45, "#d8ead0"), (1, "#9fcfc4")], strength=1.0)
pixel_look([(F0, 5)])
def sf(s): return int(round(s * FPS))
SHOTS = [  # (t0, t1, cam from, target from, cam to, target to, lens)
    (21.0, 25.84, (1.0, -4.9, .9), (.1, 0, 2.0), (.8, -4.3, 1.0), (.1, 0, 1.95), 26),
    (25.84, 28.72, (.9, -5.0, 1.1), (.2, 0, 1.95), (.75, -4.6, 1.15), (.25, 0, 1.85), 28),
    (28.72, 32.04, (.75, -3.8, 1.85), (.12, 0, 1.95), (.6, -3.45, 1.9), (.12, 0, 1.95), 35),
    (32.04, 36.5, (1.35, -4.4, 1.95), (.1, 0, 1.8), (1.05, -4.0, 1.95), (.08, 0, 1.82), 35),
    (36.5, 38.2, (.9, -6.4, 1.5), (.55, 0, 1.45), (.8, -6.1, 1.5), (.55, 0, 1.45), 32),
    (38.2, 42.64, (-.1, -6.0, 1.5), (-.4, 0, 1.15), (-.4, -5.5, 1.45), (-.45, 0, 1.1), 32),
    (42.64, 46.0, (-3.75, -1.1, 2.25), (-.45, -.2, .8), (-3.45, -1.0, 2.2), (-.4, -.2, .82), 30),
    (46.0, 49.3, (-4.4, -1.3, 1.85), (.15, -.2, 1.62), (-4.1, -1.2, 1.85), (.15, -.2, 1.68), 26),
]
CAMS = []
for i, (t0, t1, c0, g0, c1, g1, lens) in enumerate(SHOTS):
    cam = shot_camera(f"s{i + 1}", c0, g0, lens=lens); CAMS.append(cam)
    cut(F0 if i == 0 else sf(t0), cam)

# ---------------------------------------------------------------- per-frame state
def g_default():
    return dict(vis=True, root_loc=Vector((0, 0, 0)), root_rot=(0, 0, 0), body_loc=Vector((0, 0, SIT_Z)), body_rot=(0, 0, 0),
                body_scale=(1, 1, 1), head_rot=(0, 0, 0), head_scale=(1, 1, 1), hipA=(-90, 0, 0), hipB=(-90, 0, 0),
                handA_l=Vector((.8, -.6, .25)), handB_l=Vector((-.8, -.6, .25)), handA_w=None, handB_w=None,
                eyes="open", mouth="flat", look=(0, 0), brow=0., sweat=0., rumble=False)

def stand(P, rot=0):
    P["body_loc"] = Vector((0, 0, STAND_Z)); P["hipA"] = P["hipB"] = (0, 0, 0); P["root_rot"] = (0, 0, rot)

def lie(P):
    P["root_loc"] = LIE_ROOT.copy(); P["root_rot"] = LIE_ROT; P["body_loc"] = Vector((0, 0, 0))
    P["hipA"], P["hipB"] = (-20, 18, 0), (-20, -18, 0)
    P["head_rot"] = (18, 0, 0)                           # chin to chest: the face looks down his body, to the camera at his feet

def body_matrix(P):
    return mtx(P["root_loc"], P["root_rot"]) @ mtx(P["body_loc"], P["body_rot"], P["body_scale"])

def head_matrix(P):
    return body_matrix(P) @ mtx(g_head.location, P["head_rot"], P["head_scale"])

def ban_pt(B, which):
    return mtx(B["loc"], B["rot"]) @ BAN_GRIP[which]

def blink(t): return (t % 3.7) < .12

WARN = {}
def state(t):
    P = g_default()
    B = dict(loc=HANG.copy(), rot=HANG_ROT, vis=True)
    E = dict(stars=[], clink=None, debris=None, effort=None, breath=None, leaf=None, cloud=None, rock_split=0., monkey=None)
    # 1 ---- the clearing; the rumble; he looks up at the banana
    if t < 25.84:
        sway = math.sin(t * 1.6) * 3
        B["rot"] = (0, -90, sway)
        rum = sum(max(0., ring(t - tt, 30, 9)) for tt in (23.1, 23.45, 23.8))
        P["body_scale"] = (1 + .05 * rum, 1 + .05 * rum, 1 - .06 * rum)
        look = eo(seg(t, 24.2, 24.8))
        P["head_rot"] = (-24 * look, 0, -8 * look)
        P["look"] = (.015 * look, .035 * look)
        P["brow"] = .03 * look
        P["eyes"] = "shut" if blink(t) else "open"
        P["mouth"] = "o" if rum > .05 else "flat"
        P["rumble"] = rum > .12
        P["handA_l"] = Vector((.8, -.62, .25 + .06 * rum)); P["handB_l"] = Vector((-.8, -.62, .25 + .06 * rum))
    # 2 ---- the fall, the bonk, the catch, held up
    elif t < 28.72:
        hit, catchT, up = 26.38, 26.92, 27.56          # he stays sitting: the fall reads longer
        top = Vector((.05, -.2, SIT_Z + 1.3 + 1.06 + .1))
        C = Vector((0, -.95, .85))
        if t < hit:
            u = ei(seg(t, 25.84, hit)); B["loc"] = vl(HANG, top, u); B["rot"] = (0, lerp(-90, -15, u), 0)
        elif t < catchT:
            u = seg(t, hit, catchT); p = vl(top, C, u); p.z = lerp(top.z, C.z, u * u) + math.sin(u * math.pi) * .55
            p.x += math.sin(u * math.pi) * .35; B["loc"] = p; B["rot"] = (0, lerp(-15, -360, u), 0)
        else:
            r = eo(seg(t, up, up + .4)); B["loc"] = vl(C, (.5, -.78, 1.95), r); B["rot"] = (lerp(0, -10, r), lerp(-360, -380, r), lerp(0, 15, r))
        bonk = max(0., ring(t - hit, 26, 8)) if t >= hit else 0.
        P["head_scale"] = (1 + .07 * bonk, 1 + .07 * bonk, 1 - .16 * bonk)
        dazed = hit <= t < hit + .35
        joy = t >= 27.9
        held = t >= catchT
        if held:
            r = eo(seg(t, up, up + .4))
            P["handA_w"] = ban_pt(B, "stem")
            P["handB_w"] = ban_pt(B, "tip").lerp(Vector((-.9, -.55, .3)), r)
            catch = max(0., ring(t - catchT, 20, 9))
            P["body_scale"] = (1 + .03 * catch, 1, 1 - .05 * catch)
            P["head_rot"] = (lerp(10, -22, r), 0, lerp(0, -16, r)); P["look"] = (lerp(0, .02, r), lerp(-.03, .03, r))
        else:
            P["handA_w"] = Vector((.44, -.95, .78)); P["handB_w"] = Vector((-.44, -.95, .78))
            P["head_rot"] = (-18 + 14 * seg(t, hit, catchT), 0, 0); P["look"] = (0, .035 - .06 * seg(t, hit, catchT))
        P["eyes"] = "shut" if dazed else ("happy" if joy else "open")
        P["mouth"] = "grit" if dazed else ("grin" if joy else "o")
        if hit <= t < hit + .7:
            a = 1 - seg(t, hit, hit + .7); hc = top + Vector((0, 0, .05))
            E["stars"] = [(hc + Vector((math.cos(i * 1.26 + t * 7) * .62, math.sin(i * 1.26 + t * 7) * .3 - .1, .05 * math.sin(i + t * 9))), a) for i in range(5)]
        if joy:
            hc = B["loc"]
            E["stars"] = [(hc + Vector((math.cos(i * 1.25) * (.45 + ((t * 1.3 + i * .2) % 1) * .35), -.25,
                                        math.sin(i * 1.25) * (.35 + ((t * 1.3 + i * .2) % 1) * .3))), 1 - ((t * 1.3 + i * .2) % 1)) for i in range(5)]
    # 3 ---- close: three tugs, harder each time
    elif t < 32.04:
        stand(P)
        tugs = [max(0., math.sin(cl((t - tt) / .45) * math.pi)) * (1 + i * .4) for i, tt in enumerate((29.13, 30.0, 30.9))]
        pull = max(tugs); strain = seg(t, 29.9, 31.2)
        B["loc"] = Vector((.04 + .07 * pull, -.95, 1.42 + .02 * pull)); B["rot"] = (0, -3 * pull, -4 * pull)
        P["handA_w"] = ban_pt(B, "stem") + Vector((.04 * pull, 0, 0)); P["handB_w"] = ban_pt(B, "tip")
        P["body_rot"] = (0, -6 * pull, 0); P["head_rot"] = (12, -4 * pull, 6 * pull)
        P["look"] = (.02, -.03); P["brow"] = -.03 * strain - .015 * pull
        P["eyes"] = "shut" if strain > .5 and pull > .2 else "open"
        P["mouth"] = "grit" if pull > .3 else "flat"
        P["sweat"] = seg(t, 31.2, 31.5)
        if pull > .4: E["effort"] = ban_pt(B, "stem") + Vector((.42, -.15, .05))
    # 4 ---- the bites: clink, eyes cross
    elif t < 36.5:
        stand(P)
        b1, b2 = 33.05, 34.65
        tm = max(eio(seg(t, 32.2, b1)) * (1 if t < b1 + .25 else 1 - eio(seg(t, b1 + .25, b1 + .6))),
                 eio(seg(t, 34.0, b2)) * (1 if t < b2 + .3 else 1 - eio(seg(t, b2 + .3, b2 + .8))))
        jolt = (max(0., ring(t - b1, 30, 8)) if t >= b1 else 0) + (max(0., ring(t - b2, 30, 7)) * 1.4 if t >= b2 else 0)
        dizzy = (b1 < t < b1 + .8) or (b2 < t < b2 + 1.1)
        side = seg(t, 35.8, 36.0)
        B["loc"] = vl((.1, -1.12, 1.2), (0, -.95, 1.76), tm) + Vector((0, -.05 * jolt, .04 * jolt)); B["rot"] = (0, 0, 0)
        P["handA_w"] = ban_pt(B, "stem"); P["handB_w"] = ban_pt(B, "tip")
        P["head_rot"] = (8 * tm - 16 * jolt, 0, 10 * jolt + 14 * side)
        P["eyes"] = "cross" if dizzy else ("half" if side > 0 else "open")
        P["look"] = (.03 * side, -.02 * (1 - side))
        P["brow"] = .03 if dizzy else -.01
        P["mouth"] = "grit" if tm > .7 else ("o" if dizzy else "flat")
        for bt, s in ((b1, 1.), (b2, 1.5)):
            if bt <= t < bt + .4: E["clink"] = (Vector((.2, -1.12, 1.92)), s * (1 - seg(t, bt, bt + .4)))
    # 5 ---- smash on the rock
    elif t < 38.2:
        stand(P, 25)
        smash = 37.05
        raise_ = eio(seg(t, 36.5, 36.95)); down = eo(seg(t, 36.95, smash))
        up_pos, rock_pos = Vector((.35, -.45, 2.2)), Vector((ROCK.x - .02, ROCK.y + .02, .95))
        p = vl((.75, -.65, 1.2), up_pos, raise_) if t < 36.95 else (vl(up_pos, rock_pos, down) if t < smash else rock_pos + Vector((0, 0, .06 * max(0., ring(t - smash, 22, 6)))))
        B["loc"] = p; B["rot"] = (0, lerp(0, -30, raise_) * (1 - down), 25)
        P["handA_w"] = ban_pt(B, "stem"); P["handB_l"] = Vector((-.85, -.45, .62))
        lean = (10 * down if t < smash else 10 + 4 * max(0., ring(t - smash, 20, 6)))
        P["body_rot"] = (lean - 6 * raise_ * (1 - down), 0, 0)
        P["head_rot"] = (-10 * raise_ * (1 - down) + 12 * down, 0, 8)
        P["eyes"] = "open" if t > smash + .2 else "shut"; P["brow"] = -.04; P["mouth"] = "grit"; P["look"] = (.02, -.02)
        if t >= smash:
            E["rock_split"] = eo(seg(t, smash, smash + .35))
            if t < smash + .55: E["debris"] = seg(t, smash, smash + .55)
    # 6 ---- the wrestle: a dust cloud on twos
    elif t < 42.64:
        f2 = math.floor(t * 12) / 12; r = random.Random(int(f2 * 1000))
        fade = 1 - seg(t, 42.2, 42.64)
        C = Vector((-.65 + math.sin(t * 1.3) * .25, -.3, 1.05 + .05 * math.sin(t * 5)))
        pf = []
        for i in range(15):
            a = i / 15 * 2 * math.pi + f2 * .4
            s = (.55 + r.random() * .4) * fade
            pf.append((C + Vector((math.cos(a) * (.85 + r.random() * .35), -.15 + r.random() * .4 - .2, math.sin(a) * (.62 + r.random() * .2))), s))
        pf.append((C + Vector((0, 0, 0)), 1.35 * fade))
        pk = []
        for i, (a0, kind) in enumerate(POKES):
            a = a0 + math.sin(f2 * 7 + a0) * .45
            d = Vector((math.cos(a), -.25 + .2 * math.sin(f2 * 5 + i), math.sin(a) * .8)).normalized()
            pk.append((C + d * (.95 + r.random() * .15), d, fade))
        ba = 1.8 + math.sin(f2 * 6) * .4
        bd = Vector((math.cos(ba), -.2, math.sin(ba) * .8)).normalized()
        B["loc"] = C + bd * (1.3 + r.random() * .1); B["rot"] = (0, -math.degrees(ba) + 90, 0); B["vis"] = fade > .5
        E["cloud"] = (pf, pk)
        E["stars"] = [(C + Vector(((r.random() - .5) * 3.4, -.7, (r.random() - .3) * 1.8)), fade * (.7 + r.random() * .5)) for i in range(4)]
        P["vis"] = t > 42.2
        lie(P)
        P["eyes"] = "half"; P["mouth"] = "frown"
        P["handA_w"] = None
        shA = body_matrix(P) @ SH["A"]
        if t > 42.2:
            B["loc"] = shA + Vector((0, -.5, 1.0)); B["rot"] = (0, 0, 90); B["vis"] = True
            P["handA_w"] = ban_pt(B, "stem")
        else:
            P["handA_l"] = Vector((.8, -.9, 1.0))
        P["handB_l"] = Vector((-.95, -.15, .7))
    # 7 / 8 ---- on his back; the sigh; the leaf; the monkey
    else:
        lie(P)
        sigh = max(0., math.sin(cl((t - 43.4) / 1.0) * math.pi)) if t < 46.0 else 0.
        P["body_scale"] = (1, 1 + .09 * sigh, 1)
        Mb = body_matrix(P)
        shA = Mb @ SH["A"]
        B["loc"] = shA + Vector((0, -.5, 1.0 + .05 * sigh)); B["rot"] = (0, 0, 90)
        P["handA_w"] = ban_pt(B, "stem"); P["handB_l"] = Vector((-.95, -.15, .7))
        P["eyes"] = "half"; P["brow"] = .03; P["mouth"] = "o" if sigh > .3 else "frown"
        if sigh > .05:
            mouth = head_matrix(P) @ Vector((0, -.72, .07))
            E["breath"] = [(mouth + Vector((.12 * i + sigh * .15, -.05, .12 + i * .16 + sigh * .25)), sigh * (1 - i * .2)) for i in range(3)]
        belly = Mb @ Vector((0, -.47, .5))
        if t >= 44.0:
            lu = seg(t, 44.0, 45.3)
            sway = math.sin(lu * 9) * (1 - lu)
            p = vl(belly + Vector((.5, -.1, 3.6)), belly + Vector((0, 0, .03)), eio(lu)) + Vector((sway * .45, 0, 0))
            E["leaf"] = (p, (0, sway * 40, 25 + sway * 20))
        if t >= 46.0:
            up = eo(seg(t, 48.0, 48.6))
            P["eyes"] = "open" if up > .5 else "half"; P["brow"] = .02; P["mouth"] = "flat"
            P["head_rot"] = (18 - 22 * up, 0, 0); P["look"] = (0, .035 * up)
            flick, bite, glance = 46.43, 47.24, 48.2
            p = back(seg(t, flick, flick + .3)) if t >= flick else 0.
            eat = eo(seg(t, bite, bite + .2)) if t >= bite else 0.
            to_mouth = eio(seg(t, 46.95, bite)) * (1 - eio(seg(t, bite + .15, bite + .5)))
            chew = (t - bite) * 16 if t > bite + .2 else 0.
            lk = eo(seg(t, glance, glance + .3))
            E["monkey"] = dict(p=p, eat=eat, to_mouth=to_mouth, chew=chew, look=lk,
                               eyes="happy" if bite < t < glance else "open", mouth="chew" if chew else "smile",
                               spark=(1 - seg(t, flick, flick + .4)) if flick <= t < flick + .4 else 0.)
    return P, B, E

# ---------------------------------------------------------------- keying
def kl(ob, f, v): ob.location = v; ob.keyframe_insert("location", frame=f)
def kr(ob, f, deg): ob.rotation_euler = [math.radians(a) for a in deg]; ob.keyframe_insert("rotation_euler", frame=f)
def kq(ob, f, q): ob.rotation_quaternion = q; ob.keyframe_insert("rotation_quaternion", frame=f)
def ks(ob, f, s): ob.scale = s; ob.keyframe_insert("scale", frame=f)
def kv(ob, f, on, s=1.0): ks(ob, f, (s, s, s) if on else OFF)

def shot_of(t): return max(i for i, s in enumerate(SHOTS) if t >= s[0] - 1e-6)

def apply_gorilla(f, P, t):
    kl(g_root, f, P["root_loc"]); kr(g_root, f, P["root_rot"]); kv(g_root, f, P["vis"])
    kl(g_body, f, P["body_loc"]); kr(g_body, f, P["body_rot"]); ks(g_body, f, P["body_scale"])
    kr(g_head, f, P["head_rot"]); ks(g_head, f, P["head_scale"])
    kr(HIP["A"], f, P["hipA"]); kr(HIP["B"], f, P["hipB"])
    kl(g_eyes, f, EYE_BASE + Vector((P["look"][0], 0, P["look"][1])))
    for k, ob in EYES.items(): kv(ob, f, P["eyes"] == k)
    for k, ob in MOUTH.items(): kv(ob, f, P["mouth"] == k)
    kl(g_brow, f, (0, 0, P["brow"]))
    kv(g_sweat, f, P["sweat"] > 0, max(P["sweat"], 1e-4))
    kv(g_rumble, f, P["rumble"])
    Mi = body_matrix(P).inverted()
    for s in "AB":
        T = Mi @ P["hand" + s + "_w"] if P["hand" + s + "_w"] is not None else P["hand" + s + "_l"]
        q1, q2, clamped = ik(SH[s], T, L1, L2, POLE[s])
        if clamped and P["vis"]: WARN[(shot_of(t) + 1, s)] = max(WARN.get((shot_of(t) + 1, s), 0), round((T - SH[s]).length - L1 - L2, 3))
        kq(ARM[s][0], f, q1); kq(ARM[s][1], f, q2)

def apply_effects(f, B, E, t):
    kl(ban, f, B["loc"]); kr(ban, f, B["rot"]); kv(ban, f, B["vis"])
    for i, st in enumerate(stars):
        if i < len(E["stars"]):
            p, a = E["stars"][i]; kl(st, f, p); kv(st, f, a > .05, max(a, 1e-4)); kr(st, f, (0, (t * 200 + i * 40) % 90, 0))
        else: kv(st, f, False)
    if E["clink"]:
        p, s = E["clink"]; kl(clink, f, p); kv(clink, f, True, s); kr(clink, f, (0, 45 * s, 0))
    else: kv(clink, f, False)
    kr(rockL, f, (0, -15 * E["rock_split"], 0)); kl(rockL, f, (-.3 * E["rock_split"], 0, 0))
    kr(rockR, f, (0, 15 * E["rock_split"], 0)); kl(rockR, f, (.3 * E["rock_split"], 0, 0))
    for i, d in enumerate(debris):
        if E["debris"] is not None:
            u = E["debris"]; a = i / len(debris) * math.pi + .2
            p = ROCK + Vector((math.cos(a) * (.3 + 1.4 * u), -.3, .9 + math.sin(a) * 1.1 * u - 1.2 * u * u))
            kl(d, f, p); kv(d, f, True, 1 - u * .6); kr(d, f, (u * 300 + i * 40, u * 200, 0))
        else: kv(d, f, False)
    if E["effort"] is not None: kl(effort, f, E["effort"]); kv(effort, f, True)
    else: kv(effort, f, False)
    for i, b in enumerate(breath):
        if E["breath"]: p, a = E["breath"][i]; kl(b, f, p); kv(b, f, a > .05, max(a, 1e-4))
        else: kv(b, f, False)
    if E["leaf"]: kl(leaf, f, E["leaf"][0]); kr(leaf, f, E["leaf"][1]); kv(leaf, f, True)
    else: kv(leaf, f, False)
    # the cloud
    if E["cloud"]:
        pf, pk = E["cloud"]; kv(cloud, f, True)
        for i, pu in enumerate(puffs): kl(pu, f, pf[i][0]); ks(pu, f, (pf[i][1],) * 3)
        for i, (p, d, a) in enumerate(pk):
            kl(pokes[i], f, p); kq(pokes[i], f, Vector((0, 0, -1)).rotation_difference(d)); kv(pokes[i], f, a > .3)
    else:
        kv(cloud, f, False)
        for pk_ in pokes: kv(pk_, f, False)
    # the monkey
    m = E["monkey"]
    kv(mk_root, f, m is not None, MKS); kv(pb, f, m is not None, .62 * MKS)
    if m is None:
        kv(mk_spark, f, False); return
    kr(mk_head, f, (22 * m["look"] + (3 * math.sin(m["chew"]) if m["chew"] else 0), 0, -8 * m["look"]))
    for k, ob in MKEYES.items(): kv(ob, f, m["eyes"] == k)
    for k, ob in MKMOUTH.items(): kv(ob, f, m["mouth"] == k)
    hold_l = vl((.03, -.3, .06), (0, -.26, .2), m["to_mouth"]); hold = mtx(MK, (0, 0, MKR), (MKS,) * 3) @ hold_l
    kl(pb, f, hold); kr(pb, f, (0, 0, MKR))
    kv(pb_top, f, m["p"] <= 0); kv(pb_flesh, f, m["p"] > 0)
    ks(pb_flesh, f, (1, 1, max(1e-4, 1 - .5 * m["eat"])))
    for fl in flaps: kr(fl, f, (0, 135 * m["p"] if m["p"] > 0 else 0, 0)); kv(fl, f, True)
    for s in "AB":
        T = hold_l + Vector(((.05 if s == "A" else -.05), -.02, .04))
        q1, q2, _ = ik(MSH[s], T, ML1, ML2, MPOLE[s]); kq(MARM[s][0], f, q1); kq(MARM[s][1], f, q2)
    for i, tb in enumerate(tail):
        u = i / (len(tail) - 1); sw = math.sin(t * 2.2 - u * 3) * .12 * u
        if u < .75: p = Vector((-.1 - .12 * u + sw, .2, .05 - .85 * u))
        else:
            c = (u - .75) / .25 * math.pi * 1.2
            p = Vector((-.19 + sw + .2 - .2 * math.cos(c), .2, -.59 - .2 * math.sin(c)))
        kl(tb, f, p)
    if m["spark"] > 0: kl(mk_spark, f, hold + Vector((.0, -.15, .55))); kv(mk_spark, f, True, m["spark"]); kr(mk_spark, f, (0, 45 * m["spark"], 0))
    else: kv(mk_spark, f, False)

def apply_set(f, t):
    on = t >= 46.0 - 1e-6                                 # the monkey's branch is only in shot 8
    for ob in (branchLo, leafLo, trunk2, roots2, canopy2): kv(ob, f, on)

def apply_camera(f, t):
    i = shot_of(t); t0, t1, c0, g0, c1, g1, lens = SHOTS[i]
    u = eio(seg(t, t0, t1)); cam = CAMS[i]
    kl(cam, f, vl(c0, c1, u)); kl(bpy.data.objects[cam["target"]], f, vl(g0, g1, u))

for f in range(F0, F1 + 1):
    t = f / FPS
    P, B, E = state(t)
    apply_gorilla(f, P, t); apply_effects(f, B, E, t); apply_set(f, t); apply_camera(f, t)
if WARN: print("IK out of reach in shots:", WARN)
run(OUT)
