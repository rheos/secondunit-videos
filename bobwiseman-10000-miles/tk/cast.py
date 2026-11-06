# The cast, after the house rule "characters, not marionettes" (Robin, 2026-10-19, on Kevin Ngo's One Ring hobbits):
# big round head, small flat body, tube limbs that bend in one smooth curve, big flat feet, a face that does the acting
# (eyes, brows, lids, mouth), almost no shading. The one thick outer outline is NOT built here: characters go into
# the Chars collection, render.py renders them on a holdout view layer, and comp.py draws the outline from their alpha.
#
# figure() takes a style dict, so the person, the boys and the kids are the same builder with different numbers.
# Parts returned (pose them, then K.key_parts / K.key_face):
#   root, head, armL, armR, legL, legR (pivot empties: rotate to swing a limb; bend(limb, x) curls the tube),
#   eyes (white ovals; scale up = wide), pupils, lids (scale z 0..1 = closed..open), brows (rotate z: inner end
#   down = angry, up = sad), mouth (smile tube; rotate y by pi = frown), mouthOpen (dark oval, scale 0 = shut),
#   hair or cap.
import math
import bpy
from mathutils import Vector
from . import kit as K

INK = "#2b2420"      # the figures' dark line colour (brows, eye dots, mouth)

# Playmobil manner (Robin, 2026-10-19): dot eyes, the small smile, snap-on hair with a flat fringe, a neck peg, a
# trapezoid torso with a belt, mitt hands, square feet, glossy plastic, bright colours. Row 1 proportions (big head).
PERSON = dict(head_r=.30, head_z=1.32, body=(.30, .17, .34, .86), limb_r=.066, arm_len=.50, leg_len=.52, hip=.58,
              shoulder=(.255, 1.03), foot=(.28, .2, .11), hair="#7a4a2a", skin="#f3cfa8", top="#2e9c93",
              legs="#3a6ed0", shoes="#2b2a3a", belt="#2b2a3a", brow_w=.11, eye_r=.072, eye_dx=.115, cap=None)
KID = dict(PERSON, head_r=.26, head_z=1.04, body=(.24, .14, .26, .68), arm_len=.38, leg_len=.38, hip=.44,
           shoulder=(.2, .8), foot=(.22, .16, .09), hair="#2b2a3a", top="#e8645a")
JACKETS = ["#2b2a3a", "#c0392b", "#e0a020", "#2e8b57", "#6a4fcf"]    # the boys' jackets, toy-bright
CAPS = ["#d4553b", "#2f5fb3", "#2b2a3a", "#4f8a5a", "#f3ead2"]      # cap colours, never hair-like
def BOY(k):
    """One of the group of boys: lankier, cap peak forward, jacket colour by k, no cheeks."""
    return dict(PERSON, head_r=.27, head_z=1.42, body=(.26, .16, .38, .92), arm_len=.56, leg_len=.6, hip=.64,
                shoulder=(.235, 1.11), foot=(.3, .21, .11), hair=None, cap=CAPS[k % 5], top=JACKETS[k % 5],
                skin="#f3cfa8" if k % 2 == 0 else "#c98d64", eye_r=.062, eye_dx=.1)

def flat(hexc): return K.toon(hexc, shade=.8, light=1.05, gloss=True)     # moulded plastic: little shading, a sheen

def dome(name, r, mat, loc, scale, parent, front=.44, side=-.02, back=-1.0):
    """A snap-on hair piece: a sphere with its underside removed along a smooth curved hairline, not a plane and
    not a staircase. The hairline height (in head radii) is front at the forehead, side at the temples and back at
    the nape, blended smoothly around the head; every vertex on the edge is moved onto that curve, so the edge
    is one arc. (Robin, 2026-10-19: an arc that follows where the tips of the blocks would have been.)"""
    import bmesh
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=96, v_segments=48, radius=r)
    def hline(x, y):
        u = (math.atan2(math.hypot(x, 0), 1) * 0 + math.acos(max(-1.0, min(1.0, -y / max(1e-9, math.hypot(x, y)))))) / math.pi   # 0 front .. 1 back
        return r * (front * (2 * u - 1) * (u - 1) + side * 4 * u * (1 - u) + back * u * (2 * u - 1))
    below = {v: v.co.z < hline(v.co.x, v.co.y) for v in bm.verts}
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if all(below[v] for v in f.verts)], context="FACES")
    for v in bm.verts:
        if below.get(v):                                   # a vertex just under the line: slide it up onto the line, on the sphere
            z = hline(v.co.x, v.co.y); rr = math.sqrt(max(0.0, r * r - z * z)); a = math.atan2(v.co.y, v.co.x)
            v.co = Vector((rr * math.cos(a), rr * math.sin(a), z))
    for v in bm.verts: v.co = Vector((v.co.x * scale[0], v.co.y * scale[1], v.co.z * scale[2]))
    return K._obj(name, bm, mat, loc, (0, 0, 0), parent)

def tube(name, pts, rad, mat, parent):
    """A tube along a Bezier through pts (local to parent), one smooth curve. Returns the object; its curve
    data holds the points, so bend() can re-key them."""
    cu = bpy.data.curves.new("TK_" + name, "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = rad
    cu.bevel_resolution = 8; cu.fill_mode = "FULL"; cu.use_fill_caps = True
    sp = cu.splines.new("BEZIER"); sp.bezier_points.add(len(pts) - 1)
    for p, c in zip(sp.bezier_points, pts):
        p.co = c; p.handle_left_type = p.handle_right_type = "AUTO"
    cu.materials.append(mat)
    o = bpy.data.objects.new("TK_" + name, cu); K.link(o); o.parent = parent
    return o

def limb(name, length, rad, mat, parent, loc, knee=(0, -.07), end_mat=None, end_r=None, foot=None):
    """A limb hanging from a pivot empty at loc: a tube with a gentle built-in bend (the knee or elbow), ending
    in a hand sphere or a big flat foot. Rotate the pivot to swing it; bend(limb, x) curls it further."""
    piv = K.empty(name + "Piv", loc, parent)
    mid = (knee[0] * length, knee[1] * length, -length * .5)
    t = tube(name, [(0, 0, 0), mid, (0, 0, -length)], rad, mat, piv)
    piv["len"] = length; piv["tube"] = t.name
    if foot:
        K.cube(name + "Foot", foot, end_mat, (0, -foot[1] * .22, -length - foot[2] * .2), parent=piv, bevel=.22)
    else:
        K.cyl(name + "Hand", end_r, end_r * .92, end_r * 1.9, end_mat, (0, 0, -length - end_r * .5), parent=piv, seg=32)
    return piv

def bend(piv, x, f=None):
    """Curl a limb: x = 0 straight, 1 = the far end swings forward (toward -y) by about a quarter turn, as one smooth
    curve. Keys the curve points when f is given."""
    t = bpy.data.objects[piv["tube"]]; cu = t.data; L = piv["len"]
    sp = cu.splines[0]; a = x * math.pi / 2
    sp.bezier_points[1].co = (0, -L * .5 * math.sin(a * .55) - .07 * L, -L * .5 * math.cos(a * .55))
    sp.bezier_points[2].co = (0, -L * math.sin(a), -L * math.cos(a))
    end = [c for c in t.parent.children if c.name.endswith(("Hand", "Foot"))]
    for e in end: e.location = (0, e.location.y if "Foot" in e.name else 0, 0); e.location = Vector(sp.bezier_points[2].co) + Vector((0, -.05 if "Foot" in e.name else 0, 0))
    if f is not None:
        cu.keyframe_insert("splines[0].bezier_points[1].co", frame=f); cu.keyframe_insert("splines[0].bezier_points[2].co", frame=f)
        for e in end: K.key(e, "location", f)

def figure(name, loc=(0, 0, 0), S=PERSON, parent=None, scale=1.0):
    K.chars_begin()
    try:
        root = K.empty(name, loc, parent); root.scale = (scale, scale, scale)
        skin, top, ink = flat(S["skin"]), flat(S["top"]), flat(INK)
        bx, by, bz, bzc = S["body"]
        # legs, big flat feet
        legL = limb(name + "LegL", S["leg_len"], S["limb_r"] * 1.45, flat(S["legs"]), root, (-.11, 0, S["hip"]), knee=(0, -.02), end_mat=flat(S["shoes"]), foot=S["foot"])
        legR = limb(name + "LegR", S["leg_len"], S["limb_r"] * 1.45, flat(S["legs"]), root, (.11, 0, S["hip"]), knee=(0, -.02), end_mat=flat(S["shoes"]), foot=S["foot"])
        # the torso: a trapezoid, shoulders wider than the waist, flattened front to back, a belt at the waist
        body = K.cyl(name + "Body", bx * .74, bx, bz * 1.5, top, (0, 0, bzc), parent=root, seg=72); body.scale = (1, by / bx * 1.15, 1)
        K.sphere(name + "Yoke", 1, top, (0, 0, bzc + bz * .62), (bx, by * 1.15, bz * .36), parent=root)      # rounded shoulders
        belt = K.cyl(name + "Belt", bx * .78, bx * .76, .05, flat(S["belt"]), (0, 0, bzc - bz * .7), parent=root, seg=72); belt.scale = (1, by / bx * 1.15, 1)
        # a neck peg, then the head: a squat rounded shape
        K.cyl(name + "Neck", .07, .07, .16, skin, (0, 0, S["head_z"] - S["head_r"] * .9), parent=root, seg=32)
        head = K.empty(name + "Head", (0, 0, S["head_z"]), root)
        r = S["head_r"]
        K.sphere(name + "Skull", r, skin, (0, 0, 0), (1, .94, .9), parent=head)
        # the face, on the front (-y) of the head
        fy = -r * .9; ex, er = S["eye_dx"], S["eye_r"]
        # dot eyes (no whites), as on the toy; lids are skin-coloured and hidden until an expression closes the eyes
        eyes = [K.sphere(name + f"Eye{s}", er * .55, ink, (s * ex, fy - er * .15, r * .08), (1, .5, 1), parent=head) for s in (-1, 1)]
        pupils = eyes
        # lids hang from the top of the eye, just in front of the eyeball; scale z 0 = open, 1.2 = closed
        lids = [K.sphere(name + f"Lid{s}", er * .66, skin, (s * ex, fy - er * .45, r * .08 + er * .55), (1.05, .3, 1.2), parent=head) for s in (-1, 1)]
        for l in lids: l.scale = (1.05, .3, .0001)
        brows = [K.cube(name + f"Brow{s}", (S["brow_w"], .025, .026), ink, (s * ex, fy - er * .3, r * .08 + er * .95), parent=head, bevel=.3) for s in (-1, 1)]
        # the mouth tube's origin is the mouth itself, so scaling it (smile strength) keeps it in place
        mouth = tube(name + "Mouth", [(-.075 * r / .3, 0, r * .035), (0, -.015, -r * .035), (.075 * r / .3, 0, r * .035)], .0095, ink, head)
        mouth.location = (0, fy - .02, -r * .375)
        mouthOpen = K.sphere(name + "MouthOpen", r * .15, flat("#7a2e3a"), (0, fy - .02, -r * .38), (1, .3, 1), parent=head); mouthOpen.scale = (0.0001, .3, 0.0001)
        hair = cap = None
        if S["hair"]:
            # snap-on hair: a dome with a straight-cut fringe block, like the toy's
            hc = flat(S["hair"])
            hair = dome(name + "Hair", r * 1.09, hc, (0, r * .02, r * .06), (1, .97, .92), head)   # the cut is the fringe
        if S["cap"]:
            # a baseball cap: a skullcap dome high on the head (brows stay clear) and a peak out front
            cc = flat(S["cap"]); cap = K.empty(name + "Cap", (0, 0, r * .88), head)
            K.sphere(name + "CapDome", r * 1.06, cc, (0, 0, 0), (1, 1, .42), parent=cap)
            K.sphere(name + "CapBand", r * 1.07, cc, (0, 0, -r * .3), (1, 1, .12), parent=cap)
            K.cube(name + "Peak", (r * 1.1, r * .95, .05), cc, (0, -r * 1.3, -r * .33), parent=cap, bevel=.3)
        # arms
        sx, sz = S["shoulder"]
        armL = limb(name + "ArmL", S["arm_len"], S["limb_r"], top, root, (-sx, 0, sz), knee=(-.04, -.1), end_mat=skin, end_r=S["limb_r"] * 1.3)
        armR = limb(name + "ArmR", S["arm_len"], S["limb_r"], top, root, (sx, 0, sz), knee=(.04, -.1), end_mat=skin, end_r=S["limb_r"] * 1.3)
        return dict(root=root, head=head, armL=armL, armR=armR, legL=legL, legR=legR, eyes=eyes, pupils=pupils, lids=lids,
                    brows=brows, mouth=mouth, mouthOpen=mouthOpen, hair=hair, cap=cap)
    finally:
        K.chars_end()

# ---------- expressions: set, then K.key_face(parts, f) ----------
def face(parts, brow=0.0, lids=0.0, smile=1.0, open_=0.0, wide=1.0):
    """brow: -1 angry (inner ends down) .. +1 sad (inner ends up); lids: 0 open .. 1 closed; smile: +1 smile, -1 frown,
    0 flat; open_: 0 shut .. 1 wide open; wide: eye size factor (1.6 = eyes wide).
    Sad reads best as lids=.45, brow=.5, smile=-.25 (a small downturn); a full frown with high brows reads as a
    face turned upside down (Robin, 2026-10-19)."""
    for s, b in zip((-1, 1), parts["brows"]): b.rotation_euler = (0, s * .4 * brow, 0)      # +brow: inner ends up (sad)
    for l in parts["lids"]: l.scale = (1.05, .45, max(.0001, 1.2 * lids))
    for e in parts["eyes"]: e.scale = (wide, .5, wide)
    m = parts["mouth"]; m.rotation_euler = (0, math.pi if smile < 0 else 0, 0); m.scale = (1, 1, max(.08, abs(smile)))
    if smile < 0: m.scale = (.8, 1, max(.08, abs(smile) * .6))                      # a downturn stays small
    o = parts["mouthOpen"]; o.scale = (max(.0001, open_), .3, max(.0001, open_ * 1.3))
