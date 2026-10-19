# Take 05: "Bad connection", a 28-second look test for Bob Wiseman's "Real Thing" (Blender 4.5 LTS, EEVEE).
#
# Resolution is distance. A grandfather on a frozen, blocky video call with his granddaughter drives across
# the country to see her, and the picture gets sharper the closer he gets: the compositor's Pixelate size is 8
# in his living room, steps 8 -> 6 -> 4 on the road, 2 at her porch and 1 (sharp) exactly on the hug.
#
#   21.00-25.84  his living room at evening; he leans to the laptop and waves at her 12x9-pixel face
#   25.84-32.04  over his shoulder: she talks, freezes on 28.72, a pixel heart pops at 29.13, he taps, no signal 31.2
#   32.04-38.20  he shuts the laptop, gets up, hat and coat off the hook, keys from the bowl, out the door (cut 35.0)
#   38.20-44.26  his teal car on the long road at dawn, telephone poles passing; pixel 8, 6 on 40.8, 4 on 43.0
#   44.26-49.29  her porch in the morning: he gets out, she runs out, the hug lands sharp on 47.24
#
#   nice -n 15 blender -b --factory-startup --python realthing_connection.py -- --stills 520,640,760,880,1000,1120
#   nice -n 15 blender -b --factory-startup --python realthing_connection.py -- --render
# Frames (named by song frame) land in out/film/take-05/frames/. Helpers: film_kit.py, canvas_kit.py.
import bpy, math, os, sys, random
from mathutils import Vector, Matrix, Euler
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
sys.path.insert(0, HERE)
from film_kit import (reset, hex_lin, mat, stripes, specks, box, blocks, disc, empty, sun, sky, film_setup, sec,
                      shot_camera, cut, key, show, person, pixel_look, run)

OUT = os.path.join(HERE, "out", "film", "take-05")
scene = reset()
film_setup(OUT, 504, 1183)
R = math.radians

# ---------- song frames ----------
F0, F1 = 504, 1183
L0, L1, L2, L3 = 620, 769, 917, 1062                     # 25.84 32.04 38.20 44.26
W_FREEZE, W_HEART, NOSIG = 689, 699, 749                 # 28.72 29.13 31.2
CUT3 = 840                                               # 35.0
HUG = 1134                                               # 47.24
PORCH = 300.0                                            # her house sits 300 m along x
ROAD = -300.0                                            # the road sits 300 m along -y

# ---------- palette ----------
P = dict(mustard="#c8922e", red="#c8341e", teal="#3f7f7c", cream="#f3ead2", lamp="#ffd98a", eve="#2f3f78",
         peach="#f6c39a", wood="#8b6a43", floor="#a07a52", ink="#1e1a14", grey="#77756f", white="#eeeae2",
         hat="#4b3426", coat="#5b4636", hair="#3a2418", skin="#efd9b9")
def Mt(n, h, j=.06, s=None, texel=.1, **kw):
    return mat(n, h, j, s if s is not None else abs(hash(n)) % 991, texel=texel, **kw)

# ---------- small helpers ----------
def kj(ob, f, deg):
    ob.rotation_euler = [R(a) for a in deg]; ob.keyframe_insert("rotation_euler", frame=f)

def pose(p, f, **kw):
    for k, v in kw.items(): kj(p[k], f, v)

SIT = dict(hipL=(0, -90, 0), hipR=(0, -90, 0), kneeL=(0, 90, 0), kneeR=(0, 90, 0))
LEGS0 = dict(hipL=(0, 0, 0), hipR=(0, 0, 0), kneeL=(0, 0, 0), kneeR=(0, 0, 0))

def step_key(owner, path, f, old, new, index=-1):
    """a value that changes on a cut: old up to f-1, new from f (no in-between frame is rendered)"""
    setattr(owner, path, old); owner.keyframe_insert(path, frame=f - 1, index=index)
    setattr(owner, path, new); owner.keyframe_insert(path, frame=f, index=index)

def img_rows(name, rows, pal):
    h, w = len(rows), len(rows[0]); assert all(len(r) == w for r in rows), name
    img = bpy.data.images.new("CL_img_" + name, w, h, alpha=False); px = []
    for y in range(h):
        for ch in rows[h - 1 - y]: px += [*hex_lin(pal[ch]), 1.0]
    img.pixels = px; img.pack(); return img

def emit_mat(name, img, strength=1.0):
    m = bpy.data.materials.new("CL_" + name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new("ShaderNodeOutputMaterial"); e = nt.nodes.new("ShaderNodeEmission")
    e.inputs["Strength"].default_value = strength
    tc = nt.nodes.new("ShaderNodeTexCoord"); im = nt.nodes.new("ShaderNodeTexImage")
    im.image = img; im.interpolation = "Closest"; im.extension = "EXTEND"
    nt.links.new(tc.outputs["UV"], im.inputs["Vector"]); nt.links.new(im.outputs["Color"], e.inputs["Color"])
    nt.links.new(e.outputs["Emission"], o.inputs["Surface"])
    return m

def quad(name, w, h, material, loc, parent=None, rot=None):
    """a w x h plane in local YZ facing -x, UV 0..1 left to right as seen from -x"""
    me = bpy.data.meshes.new("CL_" + name)
    me.from_pydata([(0, w / 2, -h / 2), (0, -w / 2, -h / 2), (0, -w / 2, h / 2), (0, w / 2, h / 2)], [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new(name="UVMap")
    for i, c in enumerate([(0, 0), (1, 0), (1, 1), (0, 1)]): uv.data[i].uv = c
    me.materials.append(material)
    ob = bpy.data.objects.new("CL_" + name, me); scene.collection.objects.link(ob)
    ob.location = loc
    if parent: ob.parent = parent
    if rot: ob.rotation_euler = rot
    return ob

def hidden_from(ob, f0, f1=None):
    """visible only from f0 (to f1, exclusive)"""
    show(ob, F0, False); show(ob, f0, True)
    if f1 is not None: show(ob, f1, False)

def attach(ob, parent, frame):
    """parent ob to `parent` keeping its world transform as it is at `frame`"""
    scene.frame_set(frame)
    mw = ob.matrix_world.copy()
    ob.parent = parent; ob.matrix_parent_inverse = parent.matrix_world.inverted()
    ob.matrix_world = mw

def wpos(ob, frame):
    scene.frame_set(frame); return ob.matrix_world.translation.copy()

# ---------- people: film_kit person() plus a waist, knees, elbows and a neck ----------
def rig(p, name, head_scale=1.0):
    root, H = p["root"], p["H"]
    obj = lambda n: bpy.data.objects["CL_" + name + "_" + n]
    waist = empty(name + "_waist", (0, 0, .72 * H), root)
    for c in list(root.children):
        if c in (p["hipL"], p["hipR"], waist): continue
        c.parent = waist; c.location.z -= .72 * H
    head = p["head"]
    for c in list(waist.children):
        if c is head: continue
        n = c.name
        if any(t in n for t in ("_eye", "_hair", "_brim", "_crown")):
            c.parent = head; c.location = c.location - head.location
    head.scale = (head_scale,) * 3
    if head_scale != 1: head.location.z += .18 * (head_scale - 1)
    M = lambda n: bpy.data.materials["CL_" + name + "_" + n]
    for side in ("L", "R"):
        hip = p["hip" + side]
        for n in ("leg", "shoe"): bpy.data.objects.remove(obj(n + side))
        box(f"{name}_thigh{side}", (.17, .17, .37 * H), (0, 0, -.18 * H), M("trouser"), hip)
        kn = empty(f"{name}_knee{side}", (0, 0, -.36 * H), hip)
        box(f"{name}_shin{side}", (.16, .16, .34 * H), (0, 0, -.165 * H), M("trouser"), kn)
        box(f"{name}_shoe{side}", (.28, .19, .1), (.05, 0, -.33 * H), M("shoes"), kn)
        p["knee" + side] = kn
        sh = p["sh" + side]
        for n in ("arm", "hand"): bpy.data.objects.remove(obj(n + side))
        box(f"{name}_upper{side}", (.15, .15, .31 * H), (0, 0, -.15 * H), M("coat"), sh)
        el = empty(f"{name}_elbow{side}", (0, 0, -.3 * H), sh)
        box(f"{name}_fore{side}", (.14, .14, .26 * H), (0, 0, -.13 * H), M("coat"), el)
        p["hand" + side] = box(f"{name}_hand{side}", (.13, .13, .13), (0, 0, -.3 * H), M("skin"), el)
        p["el" + side] = el
    p["waist"] = waist
    return p

def grandpa(name, loc, parent=None, hat=False):
    p = person(name, loc, coat=P["mustard"], trouser=P["grey"], skin=P["skin"], hair=P["white"],
               hat=P["hat"] if hat else None, shoes="#3a2a20", parent=parent, eyes=False)
    rig(p, name)
    lens = mat(name + "_lens", "#15120e", 0, 3, texel=.05)
    for s in (-1, 1):
        box(f"{name}_lens{s}", (.04, .11, .085), (.19, .085 * s, .03), lens, p["head"])
    box(f"{name}_bridge", (.03, .06, .025), (.19, 0, .05), lens, p["head"])
    box(f"{name}_brows", (.03, .26, .03), (.185, 0, .1), mat(name + "_hair", P["white"]), p["head"])
    box(f"{name}_ears", (.08, .38, .1), (0, 0, 0), mat(name + "_skin", P["skin"]), p["head"])
    return p

def kid(name, loc, parent=None):
    p = person(name, loc, coat=P["red"], trouser="#3b3f5a", skin=P["skin"], hair=P["hair"], scale=.62,
               shoes="#2a2030", parent=parent, eyes=True)
    rig(p, name, head_scale=1.22)
    for s in (-1, 1): bpy.data.objects[f"CL_{name}_eye{s}"].scale = (1, 1.25, 1.35)
    hm = mat(name + "_hair", P["hair"]); band = mat(name + "_band", P["mustard"], 0, 5, texel=.05)
    for s in (-1, 1):
        box(f"{name}_bunch{s}", (.14, .13, .2), (-.04, .24 * s, .02), hm, p["head"])
        box(f"{name}_tie{s}", (.1, .04, .1), (-.03, .185 * s, .04), band, p["head"])
    box(f"{name}_fringe", (.06, .34, .07), (.17, 0, .14), hm, p["head"])
    box(f"{name}_mouth", (.03, .1, .035), (.18, 0, -.085), mat(name + "_mouth", "#9a3024", 0, 4, texel=.05), p["head"])
    box(f"{name}_cheeks", (.025, .26, .04), (.178, 0, -.04), mat(name + "_cheek", "#eaa28a", 0, 6, texel=.05), p["head"])
    return p

# ---------- an arm solver: brute force over shoulder XYZ and elbow Y so a hand lands on a world point ----------
def solve_arm(p, side, f, target, prev=None, ez_fixed=0.0, hand_off=.3):
    scene.frame_set(f)
    sh, el, H = p["sh" + side], p["el" + side], p["H"]
    base = sh.parent.matrix_world @ Matrix.Translation(sh.location)
    E = Matrix.Translation(el.location); hv = Vector((0, 0, -hand_off * H))
    tgt = Vector(target)
    def fk(a):
        m = base @ Euler((R(a[0]), R(a[1]), R(a[2]))).to_matrix().to_4x4() @ E @ Euler((R(ez_fixed), R(a[3]), 0)).to_matrix().to_4x4()
        return m @ hv
    def cost(a):
        c = (fk(a) - tgt).length + .0006 * (abs(a[0]) + abs(a[2])) + .0002 * abs(a[3])
        if prev: c += .0004 * sum(abs(x - y) for x, y in zip(a, prev))
        return c
    best, bc = None, 1e9
    for ax in range(-90, 91, 15):
        for ay in range(-180, 61, 15):
            for az in range(-90, 91, 15):
                for ey in range(-140, 1, 20):
                    c = cost((ax, ay, az, ey))
                    if c < bc: best, bc = (ax, ay, az, ey), c
    for stepw in ((8, 4), (3, 1)):
        w, s = stepw
        b0 = best
        for dx in range(-w, w + 1, s):
            for dy in range(-w, w + 1, s):
                for dz in range(-w, w + 1, s):
                    for de in range(-w, w + 1, s):
                        a = (b0[0] + dx, b0[1] + dy, b0[2] + dz, min(0, b0[3] + de))
                        c = cost(a)
                        if c < bc: best, bc = a, c
    return best

def reach(p, side, f, target, prev=None, **kw):
    a = solve_arm(p, side, f, target, prev, **kw)
    kj(p["sh" + side], f, (a[0], a[1], a[2])); kj(p["el" + side], f, (kw.get("ez_fixed", 0), a[3], 0))
    return a

# ---------- walking ----------
def walk(p, f0, f1, pts, z=0.0, stride=.62, amp=26, knee=38, armamp=22, bob=.035, arms=True, ease=.5, lean=4,
         yaw0=None, yaw1=None, nb=6):
    segs, L = [], 0
    for a, b in zip(pts, pts[1:]):
        l = math.dist(a, b); segs.append((a, b, l)); L += l
    def at(s):
        s = max(0.0, min(L, s))
        for i, (a, b, l) in enumerate(segs):
            if s <= l or i == len(segs) - 1:
                t = min(1, s / l) if l else 0
                return a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
            s -= l
    prev = None
    for f in range(f0, f1 + 1):
        u = (f - f0) / (f1 - f0)
        uu = (1 - ease) * u + ease * u * u * (3 - 2 * u)
        s = L * uu
        x, y = at(s)
        (xa, ya), (xb, yb) = at(s - .2), at(s + .2)
        yaw = math.atan2(yb - ya, xb - xa)
        if prev is not None:
            while yaw - prev > math.pi: yaw -= 2 * math.pi
            while yaw - prev < -math.pi: yaw += 2 * math.pi
        prev = yaw
        yk = yaw
        if yaw0 is not None and f - f0 < nb:
            w = (f - f0) / nb; w = w * w * (3 - 2 * w); yk = R(yaw0) + (yk - R(yaw0)) * w
        if yaw1 is not None and f1 - f < nb:
            w = (f1 - f) / nb; w = w * w * (3 - 2 * w); yk = R(yaw1) + (yk - R(yaw1)) * w
        env = max(0.0, min(1.0, s / .25, (L - s) / .25))
        ph = s / stride * math.pi
        sw = math.sin(ph) * env
        key(p["root"], f, loc=(x, y, z + bob * env * abs(math.sin(ph))), rot=(0, 0, yk))
        pose(p, f, hipL=(0, -amp * sw, 0), hipR=(0, amp * sw, 0),
             kneeL=(0, knee * env * max(0, math.sin(ph + .9)), 0), kneeR=(0, knee * env * max(0, -math.sin(ph + .9)), 0),
             waist=(0, lean * env, 0))
        if arms:
            pose(p, f, shL=(0, armamp * sw, 0), shR=(0, -armamp * sw, 0), elL=(0, -18, 0), elR=(0, -18, 0))
    return prev

# =====================================================================================================
# THE LIVING ROOM (shots 1-3)
# =====================================================================================================
MR = dict(
    floor=Mt("floor", P["floor"], 0, 2, texel=.1, pattern=stripes("#a07a52", "#8f6a46", 3)),
    wall=Mt("wall", P["cream"], .03, 3), ceil=Mt("ceil", "#e6dcc2", .02, 4), skirt=Mt("skirt", "#8a5a3a", .05, 5),
    rug=Mt("rug", P["red"], 0, 6, texel=.08, pattern=stripes("#c8341e", "#a82a18", 4)),
    chair=Mt("chair", "#9a4a32", .07, 7), chair2=Mt("chair2", "#84402c", .06, 8),
    wood=Mt("wood", P["wood"], .08, 9), dark=Mt("dark", "#3a2e26", .05, 10),
    shade=Mt("shade", P["lamp"], .03, 11, emit=1.6), brass=Mt("brass", "#b08a3e", .05, 12),
    lapbase=Mt("lapbase", "#a7a7ad", .03, 13), lapback=Mt("lapback", "#4a4a52", .03, 14),
    curtain=Mt("curtain", P["red"], .06, 15), frame=Mt("frame", "#f7f2e6", .02, 16),
    door=Mt("door", "#8a5a3a", .06, 17), knob=Mt("knob", "#d8b860", 0, 18),
    hat=Mt("hatH", P["hat"], .06, 19, texel=.05), coat=Mt("coatH", P["coat"], .06, 20, texel=.05),
    bowl=Mt("bowl", "#6f9aa0", .04, 21), keys=Mt("keys", "#d8c060", 0, 22, emit=.2),
    night=Mt("night", "#141c3a", 0, 23, emit=1.0, pattern=lambda x, y, r: hex_lin("#e8e4c8") if r.random() < .03 else None),
    ground=Mt("ngr", "#1d2638", .06, 24),
    win=Mt("win", P["eve"], 0, 25, texel=.07, emit=1.0,
           pattern=lambda x, y, r: hex_lin("#f2eed0") if r.random() < .03 else (hex_lin("#3b4f8a") if y < 5 else None)),
    books=Mt("books", "#7a4a3a", 0, 26, texel=.06, pattern=lambda x, y, r: hex_lin(["#c8341e", "#3f7f7c", "#c8922e", "#e9e2c8", "#5b4636"][(x // 2 + y // 6 * 3) % 5])),
)
# floor, ceiling, walls (back wall at y 2.6 with a window and the door)
box("floor", (6.2, 4.8, .1), (.3, .3, -.05), MR["floor"])
box("ceil", (6.2, 4.8, .1), (.3, .3, 2.75), MR["ceil"])
box("rug", (2.2, 1.7, .02), (-.75, .6, .01), MR["rug"])
WY = 2.7
blocks("backwall", [((1.8, .2, 2.7), (-1.9, WY, 1.35)), ((1.1, .2, 1.0), (-.45, WY, .5)), ((1.1, .2, .7), (-.45, WY, 2.35)),
                    ((1.85, .2, 2.7), (1.025, WY, 1.35)), ((.9, .2, .6), (2.4, WY, 2.4)), ((.55, .2, 2.7), (3.125, WY, 1.35))], MR["wall"])
box("leftwall", (.2, 4.8, 2.7), (-2.9, .3, 1.35), MR["wall"])
box("rightwall", (.2, 4.8, 2.7), (3.5, .3, 1.35), MR["wall"])
box("skirtB", (6.2, .04, .12), (.3, WY - .12, .06), MR["skirt"])
box("skirtL", (.04, 4.8, .12), (-2.78, .3, .06), MR["skirt"])
# window, its frame and curtains
box("window", (1.1, .02, 1.0), (-.45, WY, 1.5), MR["win"])
for i, (sz, lc) in enumerate((((1.2, .08, .08), (-.45, WY - .1, 2.04)), ((1.2, .08, .08), (-.45, WY - .1, .96)),
                              ((.08, .08, 1.0), (-1.04, WY - .1, 1.5)), ((.08, .08, 1.0), (.14, WY - .1, 1.5)), ((1.2, .06, .04), (-.45, WY - .1, 1.5)))):
    box(f"winframe{i}", sz, lc, MR["frame"])
for s in (-1, 1): box(f"curtain{s}", (.3, .06, 1.5), (-.45 + .72 * s, WY - .16, 1.45), MR["curtain"])
# bookshelf on the left wall, a framed photo of her by the window
box("shelf", (.35, 1.0, 1.7), (-2.62, 1.75, .85), MR["wood"])
box("books", (.04, .9, 1.5), (-2.43, 1.75, .9), MR["books"])
box("photoFrame", (.36, .03, .3), (-1.6, WY - .11, 1.55), MR["dark"])

# the armchair and the little desk with the laptop
GX, GY = -1.0, .6                                         # where he sits
blocks("chairSeat", [((.72, .84, .3), (GX, GY, .15)), ((.62, .62, .08), (GX + .02, GY, .33))], MR["chair"])
box("chairBack", (.18, .9, .95), (GX - .44, GY, .62), MR["chair2"])
for s in (-1, 1): box(f"chairArm{s}", (.72, .14, .3), (GX, GY + .44 * s, .45), MR["chair2"])
DX, DY = -.15, .25
box("deskTop", (.62, .8, .05), (DX, DY, .72), MR["wood"])
for sx in (-1, 1):
    for sy in (-1, 1): box(f"deskLeg{sx}{sy}", (.05, .05, .7), (DX + .27 * sx, DY + .36 * sy, .35), MR["wood"])
box("mug", (.08, .08, .1), (DX + .15, DY - .25, .795), Mt("mug", P["mustard"], .03, 30, texel=.05))
# floor lamp behind the chair
box("lampBase", (.3, .3, .04), (-1.8, 1.35, .02), MR["brass"])
box("lampPole", (.05, .05, 1.45), (-1.8, 1.35, .74), MR["brass"])
shade = blocks("lampShade", [((.42, .42, .3), (-1.8, 1.35, 1.55)), ((.34, .34, .05), (-1.8, 1.35, 1.72))], MR["shade"])
shade.visible_shadow = False

# the laptop: root on the desk, turned 30 degrees towards the camera side; the lid swings on a hinge
lap = empty("laptop", (-.3, .45, .745)); lap.rotation_euler = (0, 0, R(30))
box("lapBase", (.32, .44, .025), (0, 0, .0125), MR["lapbase"], lap)
box("lapKeys", (.18, .38, .005), (-.03, 0, .027), Mt("lapkeys", "#5a5a62", .05, 31, texel=.03), lap)
hinge = empty("lapHinge", (.15, 0, .025), lap)
box("lapLid", (.018, .44, .33), (.01, 0, .165), MR["lapback"], hinge)
lidTop = empty("lapLidTop", (-.02, -.12, .33), hinge)
SW, SH, SZ = .4, .3, .17                                   # screen size, centre height in lid space
TX = SW / 16

PAL = {".": "#9cc4d8", "H": P["hair"], "S": "#f0d2b0", "E": P["ink"], "M": "#9a3024", "D": "#4a1410",
       "C": "#e8a088", "R": P["red"], "r": "#9a2616", "G": "#6a9a5a", "P": "#b070a8", "n": "#141a28",
       "g": "#3a4258", "x": "#c8341e"}
TOP = ["................", "......HHHH......", ".....HHHHHH.....", "....HHHHHHHH....",
       ".HHHSSSSSSSSHHH.", ".HHHSESSSSESHHH.", "..H.SCSSSSCS.H.."]
LOW = ["...rRRRRRRRRr...", "..rRRRRRRRRRRr.."]
FACES = {
    "smile": TOP + ["....SMSSSSMS....", "....SSMMMMSS....", ".....SSSSSS....."] + LOW,
    "open": TOP + ["....SSSMMSSS....", "....SSSDDSSS....", ".....SSSSSS....."] + LOW,
    "mid": TOP + ["....SSSSSSSS....", "....SSSMMSSS....", ".....SSSSSS....."] + LOW,
}
def smear(rows):
    g = [list(r) for r in rows]
    sh = lambda r, k: r[:1] * k + r[:-k]
    for y in (4, 5, 6): g[y] = sh(g[y], 2)
    g[7] = sh(list(rows[5]), 3); g[8] = sh(list(rows[5]), 3); g[9] = sh(list(rows[6]), 4)
    for x, y in ((12, 7), (13, 7), (12, 8), (13, 8), (14, 8)): g[y][x] = "G"
    for x, y in ((1, 9), (2, 9), (1, 10), (2, 10), (3, 10)): g[y][x] = "P"
    for x in range(16): g[10][x] = g[9][x] if x > 8 else g[10][x]
    return ["".join(r) for r in g]
FACES["freeze"] = smear(FACES["open"])
FACES["nosig"] = ["n" * 16] * 4 + ["nnnnnnggggnnnnnn", "nnnnnngxxgnnnnnn", "nnnnnnggggnnnnnn"] + ["n" * 16] * 5
screens = {}
for i, (k, rows) in enumerate(FACES.items()):
    m = emit_mat("scr_" + k, img_rows("scr_" + k, rows, PAL), 1.0 if k != "nosig" else 1.0)
    screens[k] = quad("screen_" + k, SW, SH, m, (-.0005 - .0003 * i, 0, SZ), hinge)
# the photo on the wall is the same smile, printed
quad("photo", .3, .225, emit_mat("photo", bpy.data.images["CL_img_scr_smile"], .55), (-1.6, WY - .13, 1.55), rot=(0, 0, R(90)))

def screen_at(texc, texr):
    """lid-space point of texel (col, row) on the screen face"""
    return (-.004, SW / 2 - (texc + .5) * TX, SZ + SH / 2 - (texr + .5) * TX)

# the state of the call, switched on word onsets
SCHED = [(F0, "smile"), (540, "open"), (547, "smile"), (574, "open"), (581, "mid"), (589, "smile"), (606, "open"),
         (612, "smile"), (L0, "open"), (627, "smile"), (633, "open"), (640, "mid"), (648, "smile"), (661, "open"),
         (668, "mid"), (676, "smile"), (683, "open"), (W_FREEZE, "freeze"), (NOSIG, "nosig")]
for k, ob in screens.items():
    show(ob, F0, False)
for i, (f, k) in enumerate(SCHED):
    if i: show(screens[SCHED[i - 1][1]], f, False)
    show(screens[k], f, True)

# the pixel heart she sent that the call couldn't carry
heartM = Mt("heart", "#ff5a78", 0, 32, emit=1.6)
heart = empty("heart", screen_at(13, 1.5), hinge)
for r, row in enumerate([".X.X.", "XXXXX", ".XXX.", "..X.."]):
    for c, ch in enumerate(row):
        if ch == "X": box(f"heart{r}{c}", (.004, TX, TX), (-.003, -(c - 2) * TX, -(r - 1.5) * TX), heartM, heart)
heart.scale = (1e-3,) * 3; heart.keyframe_insert("scale", frame=W_HEART - 1)
for f, s in ((W_HEART, 1.35), (W_HEART + 2, 1.0), (W_HEART + 26, 1.0), (W_HEART + 28, 1.2), (W_HEART + 30, 1.0)):
    heart.scale = (s,) * 3; heart.keyframe_insert("scale", frame=f)
hidden_from(heart, W_HEART, NOSIG)

# the loading ring: eight dots, the bright one steps round every 3 frames
ring = empty("ring", screen_at(7.5, 5.5), hinge)
ringM = [Mt("ring0", "#ffffff", 0, 33, emit=1.4), Mt("ring1", "#c9ced8", 0, 34, emit=1.0),
         Mt("ring2", "#8d94a6", 0, 35, emit=.8), Mt("ring3", "#5a6070", 0, 36, emit=.7)]
for i in range(8):
    a = i * math.pi / 4
    box(f"ring{i}", (.004, TX, TX), (-.006, 2.6 * TX * math.cos(a), 2.6 * TX * math.sin(a)), ringM[min(i, 3)], ring)
for j, f in enumerate(range(W_FREEZE + 3, NOSIG + 1, 3)):
    kj(ring, f, (-45 * j, 0, 0))
for fc in ring.animation_data.action.layers[0].strips[0].channelbags[0].fcurves:
    for kp in fc.keyframe_points: kp.interpolation = "CONSTANT"
hidden_from(ring, W_FREEZE + 3, NOSIG)

# hooks with his hat and coat, the key bowl, the front door (opens outward on a hinge at x 2.85)
box("hookBoard", (.7, .04, .1), (.6, WY - .12, 1.78), MR["wood"])
for x in (.42, .78): box(f"peg{x}", (.04, .1, .04), (x, WY - .18, 1.76), MR["dark"])
hatHook = empty("hatHook", (.42, WY - .27, 1.66)); hatHook.rotation_euler = (R(-10), 0, R(90))
box("hatHookBrim", (.6, .55, .06), (0, 0, 0), MR["hat"], hatHook)
box("hatHookCrown", (.38, .36, .22), (0, 0, .12), MR["hat"], hatHook)
coatHook = blocks("coatHook", [((.5, .2, .9), (.78, WY - .26, 1.3)), ((.3, .22, .14), (.78, WY - .26, 1.72))], MR["coat"])
box("sideTop", (.5, .4, .04), (1.45, WY - .35, .76), MR["wood"])
for sx in (-1, 1):
    for sy in (-1, 1): box(f"sideLeg{sx}{sy}", (.04, .04, .74), (1.45 + .21 * sx, WY - .35 + .16 * sy, .37), MR["wood"])
box("bowl", (.26, .26, .07), (1.45, WY - .35, .815), MR["bowl"])
keysBowl = blocks("keysBowl", [((.07, .03, .015), (1.43, WY - .35, .86)), ((.05, .05, .015), (1.49, WY - .33, .86))], MR["keys"])
doorH = empty("doorHinge", (2.85, WY, 0))
box("door", (.9, .06, 2.08), (-.45, 0, 1.04), MR["door"], doorH)
box("doorPanel1", (.6, .07, .7), (-.45, 0, 1.5), Mt("doorp", "#7a4e32", .05, 37), doorH)
box("doorPanel2", (.6, .07, .7), (-.45, 0, .55), bpy.data.materials["CL_doorp"], doorH)
box("knob", (.06, .16, .06), (-.8, 0, 1.0), MR["knob"], doorH)
knobIn = empty("knobIn", (-.8, -.1, 1.0), doorH)
# outside the door: a night yard
box("nightGround", (6, 5, .1), (2.4, WY + 2.6, -.05), MR["ground"])
box("nightSky", (8, .1, 5), (2.4, WY + 3.6, 2.0), MR["night"])
box("gatePost", (.15, .15, 1.0), (1.6, WY + 2.2, .5), MR["dark"])

# him
G = grandpa("gpa", (GX, GY, -.30))
for k in ("brim", "crown"): pass
hatHead = blocks("hatHead", [((.6, .55, .06), (0, 0, .29)), ((.38, .36, .22), (0, 0, .4))], MR["hat"], G["head"])
hidden_from(hatHead, 850)

# ---------- lights for the room ----------
def light(name, kind, energy, loc, color, size=.5, target=None, rot=None):
    d = bpy.data.lights.new("CL_" + name, kind); d.energy = energy; d.color = color
    if kind == "AREA": d.size = size
    elif kind in ("POINT", "SPOT"): d.shadow_soft_size = size
    ob = bpy.data.objects.new("CL_" + name, d); scene.collection.objects.link(ob); ob.location = loc
    if rot: ob.rotation_euler = rot
    if target:
        t = empty(name + "_aim", target); c = ob.constraints.new("TRACK_TO"); c.target = t
        c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"
    return ob

lampL = light("lampL", "POINT", 160, (-1.8, 1.35, 1.5), (1.0, .78, .5), .15)
fillL = light("fillL", "AREA", 40, (.4, -2.6, 2.4), (1.0, .9, .8), 2.0, target=(-.4, .8, 1.0))
scrL = light("scrL", "AREA", 6, (-.55, .34, 1.0), (.75, .85, 1.0), .35, target=(-.9, .6, 1.25))
doorL = light("doorL", "POINT", 0, (1.2, 1.4, 2.3), (1.0, .82, .6), .3)       # hall ceiling light for shot 3
for ob, on in ((lampL, 160), (fillL, 40)):
    d = ob.data; step_key(d, "energy", L2, on, 0)
d = scrL.data; d.energy = 6; d.keyframe_insert("energy", frame=W_FREEZE - 1)
d.energy = 3.5; d.keyframe_insert("energy", frame=W_FREEZE); step_key(d, "energy", NOSIG, 3.5, .4); step_key(d, "energy", L1, .4, 0)
step_key(doorL.data, "energy", L1, 0, 90); step_key(doorL.data, "energy", L2, 90, 0)

# =====================================================================================================
# HIM IN THE ROOM: keys
# =====================================================================================================
REST = dict(shL=(8, -38, 0), elL=(0, -55, 0), shR=(-8, -38, 0), elR=(0, -55, 0))
key(G["root"], F0, loc=(GX, GY, -.30), rot=(0, 0, 0))
pose(G, F0, **SIT, waist=(0, 10, 0), head=(0, 6, 0), **REST)
pose(G, 540, waist=(0, 16, 0), head=(0, 4, 0), **REST)
# the wave (right arm, nearest the camera), 556-612
pose(G, 554, shR=(-8, -38, 0), elR=(0, -55, 0), shL=REST["shL"], elL=REST["elL"])
for j, f in enumerate(range(562, 606, 5)):
    pose(G, f, shR=(-14 + (14 if j % 2 else -10), -150, 0), elR=(0, -25 + (10 if j % 2 else -10), 0))
pose(G, 566, waist=(0, 20, 0), head=(0, -6, 0))
pose(G, 600, waist=(0, 18, 0), head=(0, 0, 4))
pose(G, 612, shR=REST["shR"], elR=REST["elR"])
# shot 2: watching her talk; nods on her words
pose(G, L0, waist=(0, 20, 0), head=(0, 4, 0))
for f, h in ((633, 10), (641, 2), (661, 9), (669, 2), (683, 6)):
    pose(G, f, head=(0, h, 0))
pose(G, W_FREEZE, waist=(0, 20, 0), head=(0, 4, 0))
pose(G, W_FREEZE + 8, head=(14, 2, 0))                     # puzzled tilt
pose(G, 704, waist=(0, 22, 0), head=(14, 4, 0), **{k: v for k, v in REST.items() if k.endswith("L")})
pose(G, 716, waist=(0, 34, 0), head=(4, -4, 0))
pose(G, 742, waist=(0, 34, 0), head=(2, -2, 0))
pose(G, NOSIG + 4, waist=(0, 30, 0), head=(0, 4, 0))
pose(G, 762, waist=(0, 14, 0), head=(0, 18, 0))
pose(G, L1 - 1, waist=(0, 12, 0), head=(0, 18, 0))
# shot 3a: he shuts the laptop (769-784), stands (786-796), walks to the hooks (796-834)
pose(G, L1, waist=(0, 30, 0), head=(0, 12, 0))
pose(G, 784, waist=(0, 30, 0), head=(0, 10, 0), **SIT)
key(G["root"], 786, loc=(GX, GY, -.30), rot=(0, 0, 0))
pose(G, 786, **SIT, waist=(0, 34, 0))
pose(G, 791, waist=(0, 40, 0), hipL=(0, -60, 0), hipR=(0, -60, 0), kneeL=(0, 60, 0), kneeR=(0, 60, 0), head=(0, -10, 0))
key(G["root"], 791, loc=(GX + .2, GY, -.16), rot=(0, 0, 0))
key(G["root"], 797, loc=(-.68, GY, 0), rot=(0, 0, 0))
pose(G, 797, **LEGS0, waist=(0, 6, 0), head=(0, 0, 0), shL=(0, 0, 0), shR=(0, 0, 0), elL=(0, -15, 0), elR=(0, -15, 0))
key(G["root"], 798, loc=(-.68, GY, 0), rot=(0, 0, 0))
walk(G, 798, 832, [(-.68, GY), (-.5, 1.25), (.42, 2.02)], stride=.6, ease=.4, yaw0=0, yaw1=90)
key(G["root"], 834, loc=(.42, 2.02, 0), rot=(0, 0, R(90)))
pose(G, 834, **LEGS0, waist=(0, 0, 0), head=(0, -14, 0), shL=(0, 0, 0), elL=(0, -15, 0))
key(G["root"], 866, loc=(.42, 2.02, 0), rot=(0, 0, R(90)))
# shot 3b: hat on (840-850), coat (852-862), keys (866-878), door (880-898), out (898-917)
pose(G, 850, head=(0, 0, 0)); pose(G, 852, head=(0, -12, -10))
walk(G, 866, 876, [(.42, 2.02), (1.45, 2.05)], stride=.5, arms=False, ease=.6, yaw0=90, yaw1=90, nb=4)
key(G["root"], 878, loc=(1.45, 2.05, 0), rot=(0, 0, R(90)))
pose(G, 878, **LEGS0, waist=(0, 18, 0), head=(0, 18, 0)); pose(G, 874, waist=(0, 4, 0))
key(G["root"], 880, loc=(1.45, 2.05, 0), rot=(0, 0, R(90)))
pose(G, 882, waist=(0, 2, 0), head=(0, 0, 0))
walk(G, 880, 888, [(1.45, 2.05), (2.25, 2.18)], stride=.45, arms=False, ease=.6, yaw0=90, yaw1=90, nb=3)
key(G["root"], 896, loc=(2.25, 2.18, 0), rot=(0, 0, R(90)))
pose(G, 896, **LEGS0)
walk(G, 896, 917, [(2.25, 2.18), (2.4, 2.75), (2.4, 4.1)], stride=.6, arms=False, ease=.35, yaw0=90)

# arms (keyed after the body so the solver sees the body where it is)
# closing the lid: the right hand rides the lid's top edge down
lidkeys = [(L1, 12), (772, 12), (776, -10), (780, -55), (784, -88), (L1 + 200, -88)]
for f, a in lidkeys: kj(hinge, f, (0, a, 0))
pv = None
for f in (L1, 772, 776, 780, 784):
    pv = reach(G, "R", f, wpos(lidTop, f) + Vector((0, 0, .03)), pv)
pose(G, L1, shL=(10, -40, 0), elL=(0, -60, 0))
pose(G, 786, shR=(0, -30, 0), elR=(0, -40, 0), shL=(0, -30, 0), elL=(0, -40, 0))
pose(G, 791, shR=(0, -40, 0), elR=(0, -30, 0), shL=(0, -40, 0), elL=(0, -30, 0))
# the tap on the screen, right hand, 708-742
tapPt = lambda d: hinge.matrix_world @ Vector((-.004 - d, -.03, SZ - .02))
pose(G, 706, shR=REST["shR"], elR=REST["elR"])
pv = None
for f, d in ((716, .08), (720, .05), (723, .0), (726, .04), (729, .0), (733, .05), (738, .09)):
    scene.frame_set(f); pv = reach(G, "R", f, tapPt(d), pv)
pose(G, 748, shR=REST["shR"], elR=REST["elR"])
pose(G, L1 - 1, shR=REST["shR"], elR=REST["elR"])
# the hat off the hook (834-840), onto his head (850)
pose(G, 832, shR=(0, -10, 0), elR=(0, -20, 0))
pv = reach(G, "R", 838, wpos(hatHook, 838) + Vector((0, .02, .05)))
pv = reach(G, "R", 840, wpos(hatHook, 840) + Vector((0, .02, .05)), pv)
hatHand = blocks("hatHand", [((.6, .55, .06), (0, 0, 0)), ((.38, .36, .22), (0, 0, .12))], MR["hat"])
hatHand.matrix_world = hatHook.matrix_world.copy()
attach(hatHand, G["handR"], 840)
hidden_from(hatHand, 840, 850)
show(hatHook, F0, True); show(hatHook, 840, False)
pv = reach(G, "R", 845, wpos(G["head"], 845) + Vector((.08, -.05, .38)), pv)
pv = reach(G, "R", 850, wpos(G["head"], 850) + Vector((.02, -.02, .3)), pv)
pose(G, 856, shR=(0, -10, 0), elR=(0, -20, 0))
# the coat (left hand), carried over the arm
pose(G, 852, shL=(0, 0, 0), elL=(0, -15, 0))
pvl = reach(G, "L", 860, Vector((.78, WY - .32, 1.72)))
pvl = reach(G, "L", 862, Vector((.78, WY - .3, 1.72)), pvl)
coatHand = blocks("coatHand", [((.5, .2, .9), (0, 0, 0)), ((.3, .22, .14), (0, 0, .42))], MR["coat"])
coatHand.location = (.78, WY - .26, 1.3); coatHand.rotation_euler = (0, 0, 0)
attach(coatHand, G["handL"], 862)
hidden_from(coatHand, 862)
show(coatHook, F0, True); show(coatHook, 862, False)
pose(G, 868, shL=(6, -18, 0), elL=(0, -70, 0))
pose(G, 917, shL=(6, -18, 0), elL=(0, -70, 0))
# the keys (right hand)
pose(G, 870, shR=(0, 8, 0), elR=(0, -15, 0))
pv = reach(G, "R", 876, Vector((1.45, WY - .37, .9)))
pv = reach(G, "R", 878, Vector((1.45, WY - .36, .88)), pv)
keysHand = blocks("keysHand", [((.07, .03, .015), (1.43, WY - .35, .86)), ((.05, .05, .015), (1.49, WY - .33, .86))], MR["keys"])
attach(keysHand, G["handR"], 878)
hidden_from(keysHand, 878)
show(keysBowl, F0, True); show(keysBowl, 878, False)
pose(G, 883, shR=(0, -20, 0), elR=(0, -30, 0))
# the door: right hand to the knob, door swings out 890-902
kj(doorH, F0, (0, 0, 0)); kj(doorH, 889, (0, 0, 0)); kj(doorH, 902, (0, 0, -100)); kj(doorH, F1, (0, 0, -100))
pv = None
for f in (888, 891, 894):
    pv = reach(G, "R", f, wpos(knobIn, f), pv)
pose(G, 900, shR=(0, 10, 0), elR=(0, -20, 0))
for f in range(904, 918, 3):
    sw = math.sin((f - 896) / 7.5 * math.pi)
    pose(G, f, shR=(0, -18 * sw, 0), elR=(0, -18, 0))

# =====================================================================================================
# THE ROAD (shot 4), 300 m south
# =====================================================================================================
MO = dict(
    grass=Mt("grass", "#6f9a4f", .1, 40), grass2=Mt("grass2", "#5f8a46", .1, 41), grass3=Mt("grass3", "#86a862", .08, 42),
    far=Mt("far", "#6e8f86", .06, 43), far2=Mt("far2", "#8aa59a", .05, 44),
    road=Mt("road", "#5b5a5e", .08, 45), dash=Mt("dash", "#e9e2c8", .02, 46),
    pole=Mt("pole", "#6b4a32", .08, 47), wire=Mt("wire", "#2a2622", 0, 48),
    trunk=Mt("trunk", "#7a5a3a", .1, 49), leaf=Mt("leaf", "#4f8a4a", .12, 50), leaf2=Mt("leaf2", "#3f7a44", .12, 51),
    teal=Mt("teal", P["teal"], .05, 52), cream=Mt("cream", P["cream"], .03, 53), tyre=Mt("tyre", "#26262a", .03, 54),
    chrome=Mt("chrome", "#b9bcc2", .03, 55), head=Mt("headlamp", "#fff1b8", 0, 56, emit=2.0),
    tail=Mt("taillamp", "#ff4030", 0, 57, emit=1.6), seat=Mt("seat", "#4a3426", .05, 58),
    sunD=Mt("sundisc", "#ffd9a0", 0, 59, emit=2.2),
)
box("roadGround", (240, 160, .1), (60, ROAD + 40, -.06), MO["grass"])
box("road", (240, 3.6, .04), (60, ROAD, 0), MO["road"])
for i in range(80): box(f"dash{i}", (1.4, .12, .01), (-50 + i * 3.2, ROAD, .025), MO["dash"])
rnd = random.Random(5)
for i in range(30):                                     # blocky hills, stepped
    x = -50 + i * 8 + rnd.uniform(-3, 3); y = ROAD + 22 + rnd.uniform(0, 60); w = rnd.uniform(14, 30)
    m = [MO["grass2"], MO["grass3"], MO["far"], MO["far2"]][min(3, int((y - ROAD - 22) / 16))]
    parts, z = [], 0
    for k in range(rnd.randint(3, 5)):
        h = rnd.uniform(1.6, 3.4); parts.append(((w, w * .6, h), (x, y, z + h / 2))); z += h; w *= .68
    blocks(f"hill{i}", parts, m)
for i in range(16):                                     # trees on the far verge
    x = -40 + i * 11 + rnd.uniform(-3, 3); y = ROAD + rnd.uniform(7, 14); hgt = rnd.uniform(1.4, 2.4)
    box(f"tTrunk{i}", (.35, .35, hgt), (x, y, hgt / 2), MO["trunk"])
    blocks(f"tLeaf{i}", [((2.0, 2.0, 1.2), (x, y, hgt + .5)), ((1.3, 1.3, .9), (x, y, hgt + 1.4))], MO["leaf"] if i % 2 else MO["leaf2"])
for i in range(16):                                     # telephone poles and wires
    x = -30 + i * 10
    box(f"pole{i}", (.2, .2, 6.2), (x, ROAD + 3.4, 3.1), MO["pole"])
    box(f"bar{i}", (.14, 1.5, .14), (x, ROAD + 3.4, 5.8), MO["pole"])
    for s in (-1, 1): box(f"wire{i}{s}", (10, .04, .04), (x + 5, ROAD + 3.4 + .6 * s, 5.68 - .12), MO["wire"])

def car(name, loc):
    root = empty(name, loc)
    box(name + "_body", (2.8, 1.35, .6), (0, 0, .55), MO["teal"], root)
    box(name + "_stripe", (2.82, 1.37, .07), (0, 0, .72), MO["cream"], root)
    box(name + "_hood", (.9, 1.3, .1), (.95, 0, .9), MO["teal"], root)
    for x in (.48, -1.3):
        for s in (-1, 1): box(f"{name}_pil{x}{s}", (.1, .1, .95), (x, .62 * s, 1.33), MO["teal"], root)
    box(name + "_roof", (1.95, 1.35, .1), (-.4, 0, 1.85), MO["cream"], root)
    box(name + "_back", (.08, 1.3, .95), (-1.36, 0, 1.33), MO["teal"], root)
    for x in (.95, -.95):
        for s in (-1, 1):
            box(f"{name}_wh{x}{s}", (.56, .28, .56), (x, .6 * s, .28), MO["tyre"], root)
            box(f"{name}_hub{x}{s}", (.2, .3, .2), (x, .6 * s, .28), MO["chrome"], root)
    for x in (1.44, -1.44): box(f"{name}_bump{x}", (.1, 1.42, .14), (x, 0, .36), MO["chrome"], root)
    for s in (-1, 1):
        box(f"{name}_hl{s}", (.04, .26, .16), (1.41, .45 * s, .62), MO["head"], root)
        box(f"{name}_tl{s}", (.04, .2, .14), (-1.41, .48 * s, .62), MO["tail"], root)
    box(name + "_wshield", (.03, 1.16, .8), (.5, 0, 1.3), Mt("glass", "#bfe0e4", .02, 39, emit=.15), root)
    box(name + "_door", (.9, .04, .08), (-.4, -.66, .95), MO["cream"], root)
    box(name + "_seat", (.14, .52, .65), (-.6, .3, 1.05), MO["seat"], root)
    wheel = box(name + "_steer", (.05, .32, .32), (.22, .3, 1.12), MO["tyre"], root, rot=(0, R(-25), 0))
    d = grandpa(name + "_drv", (-.3, .3, .45 - .72), parent=root, hat=True)
    for side in ("L", "R"):
        for n in ("shin", "shoe"): bpy.data.objects["CL_" + name + "_drv_" + n + side].hide_render = True
    return root, d, wheel

car1, drv1, wheel1 = car("car1", (0, ROAD - .85, 0))
CAR_X0, CAR_X1 = -6.0, 70.0
for f in (L2, L3):
    u = (f - L2) / (L3 - L2); key(car1, f, loc=(CAR_X0 + (CAR_X1 - CAR_X0) * u, ROAD - .85, 0))
for fc in car1.animation_data.action.layers[0].strips[0].channelbags[0].fcurves:
    for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
body1 = bpy.data.objects["CL_car1_body"]
for f in range(L2, L3 + 1, 4): key(body1, f, loc=(0, 0, .55 + .025 * math.sin(f * 1.7)))
pose(drv1, L2, **SIT, waist=(0, 4, 0), head=(0, 0, 0))
pose(drv1, 960, head=(0, 0, -8)); pose(drv1, 1000, head=(0, -4, 0)); pose(drv1, 1040, head=(0, 0, 6))
reach(drv1, "L", L2, wpos(wheel1, L2) + Vector((0, .12, .08)))
reach(drv1, "R", L2, wpos(wheel1, L2) + Vector((0, -.12, .08)))
# a rising sun, kept ahead of the camera so it reads as far away
sunE = empty("sunE", (0, 0, 0)); sunE.rotation_euler = (R(90), 0, 0)
disc("sunDisc", 6.0, .5, .5, MO["sunD"], sunE, step=1.0)
for f, z in ((L2, -12), (979, 6), (1032, 18), (L3, 28)):
    u = (f - L2) / (L3 - L2)
    key(sunE, f, loc=(CAR_X0 + (CAR_X1 - CAR_X0) * u + 26, ROAD + 150, z))

# =====================================================================================================
# HER HOUSE (shot 5), 300 m east
# =====================================================================================================
X = PORCH
MP = dict(
    lawn=Mt("lawn", "#7fa35a", .1, 60), house=Mt("house", "#ecd9a6", .04, 61), roof=Mt("roof", "#9a3a2a", .07, 62, texel=.08,
          pattern=stripes("#9a3a2a", "#86301f", 2)),
    porch=Mt("porch", "#b08a5e", 0, 63, texel=.08, pattern=stripes("#b08a5e", "#9c7a50", 2)), trim=Mt("trim", "#f7f2e6", .02, 64),
    pdoor=Mt("pdoor", P["teal"], .05, 65), glow=Mt("glow", "#ffd98a", .03, 66, emit=1.4), hall=Mt("hall", "#ffcf88", .04, 67, emit=.9),
    path=Mt("pathst", "#b8b0a2", .06, 68), shrub=Mt("shrub", "#4f8a4a", .12, 69), flower=Mt("flower", P["red"], .1, 70),
    mail=Mt("mailbox", P["mustard"], .04, 71),
)
box("lawn", (40, 30, .1), (X, 6, -.06), MP["lawn"])
box("road5", (60, 1.9, .04), (X, -2.6, 0), MO["road"])
for i in range(16): box(f"dash5_{i}", (1.4, .12, .01), (X - 24 + i * 3.2, -3.3, .025), MO["dash"])
# house front wall at y 1.0 with the door hole (x 0..0.8, z .5..2.5) and two windows
HY = 1.1
blocks("houseFront", [((1.6, .2, 3.0), (X - .8, HY, 1.5)), ((.8, .2, .5), (X + .4, HY, .25)), ((.8, .2, .5), (X + .4, HY, 2.75)),
                      ((3.2, .2, 3.0), (X + 2.4, HY, 1.5))], MP["house"])
box("houseBody", (5.6, 4.0, 3.0), (X + 1.2, HY + 2.1, 1.5), MP["house"])
for i, w in enumerate((6.2, 5.0, 3.6, 2.2, .9)):
    box(f"roof{i}", (w, 4.6, .45), (X + 1.2, HY + 2.1, 3.0 + .22 + .45 * i), MP["roof"])
box("chimney", (.5, .5, 1.4), (X + 2.6, HY + 2.6, 4.2), MP["roof"])
for wx in (X - .9, X + 2.2):
    box(f"hwin{wx}", (.9, .04, .8), (wx, HY - .11, 1.75), MP["glow"])
    box(f"hwinF{wx}", (1.0, .06, .08), (wx, HY - .13, 1.75), MP["trim"])
    box(f"hwinS{wx}", (1.04, .14, .08), (wx, HY - .14, 1.31), MP["trim"])
box("hallGlow", (1.0, .1, 2.2), (X + .4, HY + .5, 1.5), MP["hall"])
pdH = empty("pDoorHinge", (X + .8, HY - .05, .5))
box("pdoor", (.8, .06, 1.98), (-.4, 0, .99), MP["pdoor"], pdH)
box("pknob", (.06, .14, .06), (-.7, 0, .95), MR["knob"], pdH)
box("doorTrim", (1.0, .1, .1), (X + .4, HY - .1, 2.53), MP["trim"])
# porch, step, awning, lantern
box("porchFloor", (4.9, 1.6, .5), (X + 1.55, .3, .25), MP["porch"])
box("porchEdge", (4.9, .06, .08), (X + 1.55, -.5, .48), MP["trim"])
box("step1", (.36, 1.1, .25), (X - 1.08, .1, .125), MP["porch"])
box("awning", (1.5, .8, .1), (X + .4, .7, 2.8), MP["roof"])
for s in (-1, 1): box(f"awnBr{s}", (.06, .4, .06), (X + .4 + .65 * s, .9, 2.65), MP["trim"])
lantern = box("lantern", (.16, .12, .26), (X + 1.05, HY - .16, 2.0), MP["glow"]); lantern.visible_shadow = False
box("lanternCap", (.22, .16, .05), (X + 1.05, HY - .16, 2.16), MR["dark"])
# garden: path, shrubs, flowers, mailbox, a tree
for i in range(5): box(f"pstone{i}", (.5, .4, .04), (X - 2.6 + i * .4, -1.4 + i * .36, .02), MP["path"])
for i, (sx, sy) in enumerate(((X + 1.0, -.9), (X + 2.0, -.9), (X + 3.2, -.85), (X - 1.9, .9))):
    blocks(f"shrub{i}", [((.8, .6, .5), (sx, sy, .25)), ((.5, .4, .3), (sx, sy, .6))], MP["shrub"])
    box(f"flw{i}", (.12, .12, .1), (sx + .2, sy - .31, .45), MP["flower"])
box("mailPost", (.1, .1, 1.0), (X - 4.6, -1.4, .5), MO["pole"]); box("mailbox", (.45, .3, .3), (X - 4.6, -1.4, 1.1), MP["mail"])
box("treeT", (.4, .4, 2.6), (X - 5.5, 2.2, 1.3), MO["trunk"])
blocks("treeL", [((2.6, 2.6, 1.6), (X - 5.5, 2.2, 3.0)), ((1.8, 1.8, 1.0), (X - 5.5, 2.2, 4.2))], MO["leaf"])
box("farHedge", (40, 1.2, 1.0), (X, 7.0, .5), MO["leaf2"])

car2, drv2, wheel2 = car("car2", (X - 9.0, -2.6, 0))
key(car2, L3 - 10, loc=(X - 9.0, -2.6, 0)); key(car2, L3 + 14, loc=(X - 3.2, -2.6, 0))
pose(drv2, L3 - 10, **SIT, waist=(0, 6, 0), head=(0, 0, 0)); pose(drv2, L3 + 10, head=(0, 0, 30))
reach(drv2, "L", L3, wpos(wheel2, L3) + Vector((0, .12, .08)))
reach(drv2, "R", L3, wpos(wheel2, L3) + Vector((0, -.12, .08)))
show(drv2["root"], F0, True); show(drv2["root"], 1078, False)

# him again (out of the car) and her
G2 = grandpa("gpa2", (X - 3.0, -1.75, -.6), hat=True)
K2 = kid("kid", (X + .4, 1.6, .5))
HX = X - .84                                             # where she stands for the hug
hidden_from(G2["root"], 1078); hidden_from(K2["root"], 1086)
key(G2["root"], 1078, loc=(X - 3.0, -1.75, -.55), rot=(0, 0, R(60)))
pose(G2, 1078, hipL=(0, -50, 0), hipR=(0, -50, 0), kneeL=(0, 70, 0), kneeR=(0, 70, 0), waist=(0, 35, 0), head=(0, -10, 0),
     shL=(0, -30, 0), elL=(0, -30, 0), shR=(0, -30, 0), elR=(0, -30, 0))
key(G2["root"], 1084, loc=(X - 3.0, -1.75, 0), rot=(0, 0, R(52)))
pose(G2, 1084, **LEGS0, waist=(0, 8, 0), head=(0, -6, 0))
walk(G2, 1084, 1114, [(X - 3.0, -1.75), (X - 1.55, .2)], stride=.62, ease=.35, armamp=26, lean=8, yaw1=10)
# the step up, then the arms open
key(G2["root"], 1120, loc=(X - 1.12, .2, .25), rot=(0, 0, 0))
pose(G2, 1117, hipL=(0, -40, 0), kneeL=(0, 55, 0), hipR=(0, 8, 0), kneeR=(0, 10, 0))
pose(G2, 1121, **LEGS0, waist=(0, 10, 0), head=(0, 4, 0))
pose(G2, 1124, shL=(-35, -70, 0), elL=(0, -20, 0), shR=(35, -70, 0), elR=(0, -20, 0))
# her: door opens, she runs to the top of the step
kj(pdH, F0, (0, 0, 0)); kj(pdH, 1084, (0, 0, 0)); kj(pdH, 1091, (0, 0, 100)); kj(pdH, F1, (0, 0, 100))
key(K2["root"], 1086, loc=(X + .4, 1.6, .5), rot=(0, 0, R(-90)))
walk(K2, 1088, 1116, [(X + .4, 1.6), (X + .4, .55), (HX, -.04)], z=.5, stride=.36, amp=36, knee=55, armamp=40, bob=.05, ease=.25, lean=10)
key(K2["root"], 1120, loc=(HX, -.04, .5), rot=(0, 0, R(-148)))
pose(K2, 1120, **LEGS0, waist=(0, 6, 0), head=(0, -14, 0), shL=(-40, -80, 0), elL=(0, -10, 0), shR=(40, -80, 0), elR=(0, -10, 0))

# the hug: arms close around each other by HUG, then a slow sway
pose(G2, HUG - 2, waist=(0, 8, 0), head=(-4, 12, -28))
pose(K2, HUG - 2, waist=(0, -2, 0), head=(0, -14, 30))
gB = lambda f: wpos(G2["body"], f); kB = lambda f: wpos(K2["body"], f)
for f in (1128, HUG):
    kb, gb = kB(f), gB(f)
    pg = reach(G2, "L", f, kb + Vector((.16, .07, .04)))
    pg = reach(G2, "R", f, kb + Vector((.1, -.1, -.3)))
    reach(K2, "L", f, gb + Vector((-.06, -.24, .0)))
    reach(K2, "R", f, gb + Vector((-.06, .24, .04)))
for j, f in enumerate(range(HUG + 12, F1 + 1, 16)):
    s = 1 if j % 2 == 0 else -1
    pose(G2, f, waist=(2.5 * s, 8, 0), head=(-4 + 3 * s, 12, -28))
    pose(K2, f, waist=(2.5 * s, -2, 0), head=(0, -14, 30 - 4 * s))

# =====================================================================================================
# LIGHT, SKY, CAMERAS, PIXEL LOOK
# =====================================================================================================
SUN = sun(0, (70, 0, -40), (1.0, .9, .78), angle_deg=8)
sd = SUN.data
step_key(sd, "energy", L2, 0, .5)
sd.color = (.55, .62, 1.0); sd.keyframe_insert("color", frame=L2)
sd.energy = 2.0; sd.keyframe_insert("energy", frame=1032); sd.color = (1.0, .78, .62); sd.keyframe_insert("color", frame=1032)
sd.energy = 3.4; sd.keyframe_insert("energy", frame=L3 - 1); sd.color = (1.0, .86, .72); sd.keyframe_insert("color", frame=L3 - 1)
sd.energy = 3.0; sd.keyframe_insert("energy", frame=L3); sd.keyframe_insert("color", frame=L3)
porchL = light("porchL", "POINT", 0, (X + 1.05, HY - .35, 1.95), (1.0, .75, .45), .2)
hugL = light("hugL", "AREA", 0, (X - 2.6, -2.4, 2.6), (1.0, .82, .62), 2.5, target=(X - .95, .1, 1.3))
rimL = light("rimL", "AREA", 0, (X + .8, 1.0, 2.6), (1.0, .8, .55), 1.5, target=(X - .95, .1, 1.3))
for ob, e in ((porchL, 70), (hugL, 160), (rimL, 60)): step_key(ob.data, "energy", L3, 0, e)

world = sky([(0, "#2b3560"), (.7, "#1c2448"), (1, "#10152e")])
ramp = [n for n in world.node_tree.nodes if n.type == "VALTORGB"][0]
bg = [n for n in world.node_tree.nodes if n.type == "BACKGROUND"][0]
SKY = [(F0, ("#2b3560", "#1f2850", "#10152e")), (L2, ("#2b3560", "#1f2850", "#10152e")),
       (979, ("#c07a7a", "#7a5a80", "#26305a")), (1032, ("#f5ae84", "#eab08c", "#6a80b0")),
       (L3, ("#f8c9a0", "#f6cfa8", "#a9c6e0")), (F1, ("#f8c9a0", "#f6cfa8", "#a9c6e0"))]
for f, cols in SKY:
    for el, h in zip(ramp.color_ramp.elements, cols):
        el.color = (*hex_lin(h), 1); el.keyframe_insert("color", frame=f)
st = bg.inputs["Strength"]
st.default_value = .35; st.keyframe_insert("default_value", frame=L2 - 1)
st.default_value = .5; st.keyframe_insert("default_value", frame=L2)
st.default_value = 1.0; st.keyframe_insert("default_value", frame=L3)

def cam_move(name, f0, f1, loc0, loc1, tgt0, tgt1, lens):
    c = shot_camera(name, loc0, tgt0, lens=lens); t = bpy.data.objects[c["target"]]
    key(c, f0, loc=loc0); key(c, f1, loc=loc1); key(t, f0, loc=tgt0); key(t, f1, loc=tgt1)
    cut(f0, c); return c, t

cam_move("s1", F0, L0 - 1, (-.95, -2.75, 1.55), (-.85, -2.3, 1.45), (-.7, .55, 1.0), (-.62, .52, 1.0), 36)
cam_move("s2", L0, L1 - 1, (-1.22, -.52, 1.32), (-1.12, -.44, 1.28), (-.2, .52, .93), (-.2, .52, .92), 50)
cam_move("s3a", L1, CUT3 - 1, (.3, -3.5, 1.7), (.42, -3.2, 1.68), (-.2, 1.0, 1.0), (.05, 1.25, 1.1), 30)
cam_move("s3b", CUT3, L2 - 1, (-.35, -1.25, 1.6), (-.1, -.95, 1.6), (1.3, 2.3, 1.2), (1.8, 2.6, 1.2), 30)
c4, t4 = cam_move("s4", L2, L3 - 1, (CAR_X0 - .8, ROAD - 7.6, 1.5), (CAR_X1 + .9, ROAD - 7.0, 1.9),
                  (CAR_X0 + .3, ROAD - .85, 1.0), (CAR_X1 + .3, ROAD - .85, 1.05), 35)
for ob in (c4, t4):
    for fc in ob.animation_data.action.layers[0].strips[0].channelbags[0].fcurves:
        for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
c5, t5 = cam_move("s5", L3, HUG, (X - 1.7, -9.0, 2.5), (X - 1.0, -3.7, 1.62), (X - 1.7, -.6, 1.0), (X - .95, .1, 1.38), 35)
key(c5, F1, loc=(X - .98, -3.25, 1.58)); key(t5, F1, loc=(X - .95, .1, 1.4))

pixel_look([(F0, 8), (979, 6), (1032, 4), (L3, 2), (HUG, 1)])
scene.frame_set(F0)
run(OUT)
