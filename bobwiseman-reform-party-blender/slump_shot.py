"""Reform Party at Burning Man, Blender look test: the speakerphone slump.

One shot of draft 3 (rheos/secondunit-videos, branch reform-party-1, js/dali/), rebuilt in bpy for
Blender 4.5 LTS: song time 23.50-27.00 s, the held SPK framing. The speakerphone gets a tape X on
"can't" (24.76 s) and from 25.21 s slumps like a soft watch over the table's front edge.

Everything is a pure function of song time, like draft 3: the camera, the car's travel, the wheel
spin, the head bobs and the slump are computed per frame from the same formulas as camera.js,
world.js, car.js and table.js, then baked (keys, and absolute shape keys for the soft things).

    blender -b --factory-startup --python slump_shot.py                     # build only
    blender -b --factory-startup --python slump_shot.py -- --stills 1,42,84 # stills to out/stills/
    blender -b --factory-startup --python slump_shot.py -- --render         # all 84 frames to out/frames/
    blender -b --factory-startup --python slump_shot.py -- --stills 60 --grins --tag grins

Frame f (1..84) is song time T0 + (f - 1) / 24, the same grid as draft 3's render.mjs.
"""
import bpy
import bmesh
import math
import os
import sys
import time
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []


def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default


FPS = 24
T0, T1 = 23.5, 27.0
NF = round((T1 - T0) * FPS)            # 84 frames
RES = (960, 540)
SAMPLES = int(arg("--samples", 16))
LINEART = "--no-lineart" not in ARGS     # Grease Pencil Line Art ink on the car
GRINS = "--grins" in ARGS                # draft 3 has no grins in this shot (they come on line 5); for a demo still


def ft(f):
    return T0 + (f - 1) / FPS


# ---------- draft 3's helpers (core.js), ported ----------
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def lerp(a, b, u):
    return a + (b - a) * u


def smooth(x):
    x = clamp(x)
    return x * x * (3 - 2 * x)


def ease(t, a, b):
    return smooth((t - a) / (b - a))


def rnd(a, b=0.0, c=0.0):
    x = math.sin(a * 127.1 + b * 311.7 + c * 74.7 + 0.37) * 43758.5453
    return x - math.floor(x)


def n1(seed, x):
    i = math.floor(x)
    f = x - i
    u = f * f * (3 - 2 * f)
    return lerp(rnd(seed, i), rnd(seed, i + 1), u) * 2 - 1


# ---------- song timing (source/lines.json, the draft 3 contract) ----------
L1S, L1E = 22.05, 27.00      # line 1, the scientists line
W_CANT = 24.76               # the word "can't"
L2S = 27.50                  # line 2 starts (the gag line)

# ---------- the car (world.js, car.js) ----------
TOP, TD, TL = 1.15, 1.5, 4.4             # table top height, half depth, half length
SEAT = 0.42                              # hop-on seats at the hubcap line
TORSO = 0.78
WHEEL_R = 0.4
WHEELS = [-2.925, -0.125, 2.575]
ROW_X = [-3.6, -2.25, -0.8, 0.55, 1.9, 3.25]
SEATS = ([dict(x=x, z=2.3, r="drawer" if x == -0.8 else "b") for x in ROW_X]
         + [dict(x=x, z=-2.3, r="f") for x in ROW_X]
         + [dict(x=-5.15, z=0.0, r="chair"), dict(x=5.15, z=0.0, r="end")])


def car_x(t):
    return -40 + 1.6 * t


def melt(t):         # table.js: the heat softens the props through the day
    return clamp((t - 20) / 200) * 0.55 + ease(t, L1S, L1E) * 0.12


def phone_slump(t):  # table.js phoneSlump
    return ease(t, W_CANT + 0.45, L1E + 0.7) * (1 - 0.72 * ease(t, L2S + 0.3, L2S + 1))


def tape_amt(t):
    return ease(t, W_CANT - 0.05, W_CANT + 0.2) * (1 - ease(t, L2S + 0.3, L2S + 0.6))


# ---------- the camera (camera.js): SPK holds, then the move toward DRW starts at 26.9 ----------
SPK = [1.2, 2.75, -3.3, 0.62, 1400]
DRW = [-0.8, 1.8, -1.6, 0.1, 1500]


def cam_at(t):
    u = smooth((t - 26.9) / 0.9) if t >= 26.9 else 0.0
    ox, oy, oz, p, f = [lerp(a, b, u) for a, b in zip(SPK, DRW)]
    near = clamp((math.hypot(ox, oy - TOP, oz) - 0.5) / 0.7)
    x = car_x(t) + ox + 0.25 * math.sin(t * 0.23) * near
    y = oy + 0.05 * math.sin(t * 0.31) * near
    return x, y, oz, p, f        # draft coords: x right, y up, z away from the camera


def B(x, y, z):
    """Draft coords (x right, y up, z away) -> Blender (x right, y away, z up)."""
    return Vector((x, z, y))


# ---------- palette (render.js PAL and the per-prop hexes) ----------
def lin(h):
    h = h.lstrip("#")
    s = [int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4)]
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in s) + (1.0,)


def hmix(a, b, u):
    a, b = a.lstrip("#"), b.lstrip("#")
    c = [round(lerp(int(a[i:i + 2], 16), int(b[i:i + 2], 16), u)) for i in (0, 2, 4)]
    return "#%02x%02x%02x" % tuple(c)


PLUM = "#34223a"     # draft 3's shadow colour, rgba(52,34,58,.42)


def shade(h, u=0.42):
    return hmix(h, PLUM, u)


# =============================================================================================
# scene reset (only our own datablocks, so the script is re-runnable in an open file)
# =============================================================================================
scn = bpy.context.scene
for ob in list(bpy.data.objects):
    if ob.name.startswith("RP_"):
        bpy.data.objects.remove(ob, do_unlink=True)
for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.cameras, bpy.data.lights, bpy.data.actions,
             bpy.data.grease_pencils_v3, bpy.data.shape_keys):
    for d in list(coll):
        if d.name.startswith("RP_") or (coll is bpy.data.shape_keys and d.users == 0):
            try:
                coll.remove(d)
            except (TypeError, RuntimeError):
                pass
for ob in list(scn.objects):           # factory cube, light and camera
    if ob.name in ("Cube", "Light", "Camera"):
        bpy.data.objects.remove(ob, do_unlink=True)


def collection(name):
    c = bpy.data.collections.get(name) or bpy.data.collections.new(name)
    if c.name not in scn.collection.children:
        scn.collection.children.link(c)
    return c


COL_CAR = collection("RP_Car")
COL_WORLD = collection("RP_World")


# =============================================================================================
# materials: cel shading (Diffuse > Shader to RGB > CONSTANT ramp > Emission), lamps kept white
# Lamps: ambient .25, key .7 pi (no shadows, front-left), sun .9 pi (shadows, the draft's low sun behind-left).
# Measured Shader-to-RGB values (dbg pass, frame 1): flat and sun-lit .84, flat in a cast shadow .63,
# faces toward the camera ~.5, sun-lit left sides ~.95, sides turned away ~.2. Cuts at .32 and .74, so on
# flat things 'base' is the cast-shadow colour and 'light' the sun-lit one.
# =============================================================================================
def _nodes(mat):
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    return nt.nodes, nt.links


def toon(name, base, shadow=None, light=None, cuts=(0.32, 0.74), grain=None):
    """grain: (scale, strength) wave texture multiplied in, for the mahogany."""
    mat = bpy.data.materials.new("RP_" + name)
    n, l = _nodes(mat)
    dif, rgb, ramp = n.new("ShaderNodeBsdfDiffuse"), n.new("ShaderNodeShaderToRGB"), n.new("ShaderNodeValToRGB")
    emit, out = n.new("ShaderNodeEmission"), n.new("ShaderNodeOutputMaterial")
    cr = ramp.color_ramp
    cr.interpolation = "CONSTANT"
    cr.elements[0].position, cr.elements[0].color = 0.0, lin(shadow or shade(base))
    cr.elements[1].position, cr.elements[1].color = cuts[0], lin(base)
    if light:
        e = cr.elements.new(cuts[1])
        e.color = lin(light)
    l.new(dif.outputs[0], rgb.inputs[0])
    l.new(rgb.outputs[0], ramp.inputs[0])
    col = ramp.outputs[0]
    if grain:
        tc, wave, mul = n.new("ShaderNodeTexCoord"), n.new("ShaderNodeTexWave"), n.new("ShaderNodeMix")
        mul.data_type, mul.blend_type = "RGBA", "MULTIPLY"
        wave.wave_type, wave.bands_direction = "BANDS", "Y"
        wave.inputs["Scale"].default_value = grain[0]
        wave.inputs["Distortion"].default_value = 3.0
        wave.inputs["Detail"].default_value = 2.0
        rmp2 = n.new("ShaderNodeValToRGB")
        rmp2.color_ramp.elements[0].color = (1 - grain[1],) * 3 + (1,)
        rmp2.color_ramp.elements[1].color = (1, 1, 1, 1)
        l.new(tc.outputs["Object"], wave.inputs["Vector"])
        l.new(wave.outputs["Fac"], rmp2.inputs[0])
        mul.inputs["Factor"].default_value = 1.0
        l.new(col, mul.inputs["A"])
        l.new(rmp2.outputs[0], mul.inputs["B"])
        col = mul.outputs["Result"]
    l.new(col, emit.inputs[0])
    l.new(emit.outputs[0], out.inputs[0])
    return mat


def flat(name, hexc, strength=1.0):
    mat = bpy.data.materials.new("RP_" + name)
    n, l = _nodes(mat)
    e, o = n.new("ShaderNodeEmission"), n.new("ShaderNodeOutputMaterial")
    e.inputs[0].default_value = lin(hexc)
    e.inputs[1].default_value = strength
    l.new(e.outputs[0], o.inputs[0])
    return mat


def ground_material():
    """Sun-lit playa vs the draft's lilac shadow, plus the dried-mud polygons (Voronoi edges, 3.2 m cells)."""
    mat = bpy.data.materials.new("RP_Playa")
    n, l = _nodes(mat)
    dif, rgb, ramp = n.new("ShaderNodeBsdfDiffuse"), n.new("ShaderNodeShaderToRGB"), n.new("ShaderNodeValToRGB")
    lit = "#dccaa0"
    cr = ramp.color_ramp
    cr.interpolation = "CONSTANT"
    cr.elements[0].color = lin(shade(lit))
    cr.elements[1].position, cr.elements[1].color = 0.74, lin(lit)
    tc, vor, crk = n.new("ShaderNodeTexCoord"), n.new("ShaderNodeTexVoronoi"), n.new("ShaderNodeValToRGB")
    vor.feature = "DISTANCE_TO_EDGE"
    vor.inputs["Scale"].default_value = 1 / 3.2
    vor.inputs["Randomness"].default_value = 0.7
    crk.color_ramp.interpolation = "EASE"
    crk.color_ramp.elements[0].position, crk.color_ramp.elements[0].color = 0.0, (0.55, 0.42, 0.33, 1)
    crk.color_ramp.elements[1].position, crk.color_ramp.elements[1].color = 0.012, (1, 1, 1, 1)
    mul = n.new("ShaderNodeMix")
    mul.data_type, mul.blend_type = "RGBA", "MULTIPLY"
    mul.inputs["Factor"].default_value = 1.0
    emit, out = n.new("ShaderNodeEmission"), n.new("ShaderNodeOutputMaterial")
    l.new(dif.outputs[0], rgb.inputs[0])
    l.new(rgb.outputs[0], ramp.inputs[0])
    l.new(tc.outputs["Object"], vor.inputs["Vector"])
    l.new(vor.outputs["Distance"], crk.inputs[0])
    l.new(ramp.outputs[0], mul.inputs["A"])
    l.new(crk.outputs[0], mul.inputs["B"])
    l.new(mul.outputs["Result"], emit.inputs[0])
    l.new(emit.outputs[0], out.inputs[0])
    return mat


M = {
    "playa": ground_material(),
    "top": toon("Mahogany", shade("#6e2c1a", 0.38), shadow="#3e170d", light="#6e2c1a", grain=(0.9, 0.14)),
    "edge": toon("TableEdge", "#3d170c", shadow="#2a0f07"),
    "skirt": toon("Skirt", "#7a1420", shadow="#4e0c16", light="#9a2230"),
    "trim": toon("Trim", "#d6a632", shadow="#9a7420", light="#f0c85a"),
    "chassis": toon("Chassis", "#1d130e", shadow="#120b08"),
    "tyre": toon("Tyre", "#211813", shadow="#15100d"),
    "chrome": toon("Chrome", "#c9c6bd", shadow="#8d887d", light="#f2f0ea"),
    "spoke": toon("Spoke", "#6f6a60", shadow="#4c4840"),
    "gold": toon("Gold", "#c9a24a", shadow="#8e6f2a", light="#ecd087"),
    "hole": flat("Hole", "#120806"),
    "hat": toon("HatCrown", "#b52c22", shadow="#7e1c15", light="#d24a36"),
    "brim": toon("HatBrim", "#8f2018", shadow="#5e130e"),
    "band": toon("HatBand", "#3a1410", shadow="#240b08"),
    "suit": toon("Suit", "#2f2f39", shadow="#212128", light="#4a4a5c"),
    "shirt": toon("Shirt", "#f4efe6", shadow="#c9bfb2", light="#ffffff"),
    "tie": toon("Tie", "#8f1d1d", shadow="#5e1212"),
    "rosette": toon("Rosette", "#d0281f", shadow="#931a14", light="#e8473a"),
    "rosette_c": toon("RosetteCentre", "#f6d8a0", shadow="#c9a870"),
    "egg": toon("Egg", "#f1e4cc", shadow="#b49a7c", light="#fffaf0"),
    "neck": toon("Neck", "#d7c3a3", shadow="#a8916f"),
    "shoe": toon("Shoe", "#141216", shadow="#0c0b0d"),
    "seat": toon("SeatPan", "#7a4e26", shadow="#3d2412", light="#97653a"),
    "seatback": toon("SeatBack", "#7b2a1c", shadow="#4e170e", light="#99402c"),
    "beam": toon("Bracket", "#4a2a14", shadow="#2e190b"),
    "crutch": toon("Crutch", "#c9a46a", shadow="#8c6f40", light="#e3c48e"),
    "pad": toon("CrutchPad", "#e9dcc2", shadow="#b3a283"),
    "drawer": toon("Drawer", "#7b5530", shadow="#4b321b", light="#9a6e42"),
    "phone": toon("Phone", "#2b2d32", shadow="#1d1e22", light="#383a40"),
    "dome": toon("PhoneDome", "#363940", shadow="#2a2c31", light="#454850"),
    "grille": flat("Grille", "#16171a"),
    "led_g": flat("LedGreen", "#57e07a", 1.4),
    "led_r": flat("LedRed", "#ff3b2a", 1.4),
    "tape": toon("Tape", "#e6d7b0", shadow="#b5a57e", light="#f6ecd2"),
    "board": toon("Board", "#f4f4ee", shadow="#c9cbc6", light="#ffffff"),
    "boardframe": toon("BoardFrame", "#b8b1a2", shadow="#8a8475"),
    "easel": toon("Easel", "#6b4a2a", shadow="#43301b"),
    "bar_r": flat("BarRed", "#c8302a"),
    "bar_b": flat("BarBlue", "#2f5aa8"),
    "mouth": flat("Mouth", "#2b1c18"),
    "teeth": flat("Teeth", "#fbf3e3"),
}


# =============================================================================================
# geometry: one bmesh per object, parts appended with a material slot each
# =============================================================================================
class Builder:
    def __init__(self):
        self.bm = bmesh.new()
        self.mats = []

    def _slot(self, mat):
        if mat not in self.mats:
            self.mats.append(mat)
        return self.mats.index(mat)

    def _tag(self, faces, mat):
        i = self._slot(mat)
        for f in faces:
            f.material_index = i

    def part(self, mat, fn, **kw):
        res = fn(self.bm, **kw)        # bmesh.ops.create_* return their verts; tag the faces they span
        self._tag({f for v in res["verts"] for f in v.link_faces}, mat)

    def box(self, mat, c, size, rot=None):
        m = Matrix.Translation(Vector(c)) @ (rot or Matrix.Identity(4)) @ Matrix.Diagonal((*size, 1))
        self.part(mat, bmesh.ops.create_cube, size=1.0, matrix=m)

    def ellipsoid(self, mat, c, r, seg=24, rot=None):
        m = Matrix.Translation(Vector(c)) @ (rot or Matrix.Identity(4)) @ Matrix.Diagonal((*r, 1))
        self.part(mat, bmesh.ops.create_uvsphere, u_segments=seg, v_segments=max(8, seg // 2), radius=1.0, matrix=m)

    def rod(self, mat, a, b, r1, r2=None, seg=12):
        a, b = Vector(a), Vector(b)
        d = b - a
        if d.length < 1e-6:
            return
        q = d.normalized().to_track_quat("Z", "Y").to_matrix().to_4x4()
        m = Matrix.Translation((a + b) / 2) @ q
        self.part(mat, bmesh.ops.create_cone, cap_ends=True, segments=seg, radius1=r1,
                  radius2=r2 if r2 is not None else r1, depth=d.length, matrix=m)
        self.ellipsoid(mat, a, (r1, r1, r1), seg=seg)            # round joints
        self.ellipsoid(mat, b, ((r2 or r1),) * 3, seg=seg)

    def disc(self, mat, c, r, seg=24, rot=None, scale=(1, 1)):
        m = Matrix.Translation(Vector(c)) @ (rot or Matrix.Identity(4)) @ Matrix.Diagonal((scale[0], scale[1], 1, 1))
        self.part(mat, bmesh.ops.create_circle, cap_ends=True, segments=seg, radius=r, matrix=m)

    def poly(self, mat, pts):
        vs = [self.bm.verts.new(Vector(p)) for p in pts]
        self._tag([self.bm.faces.new(vs)], mat)

    def build(self, name, coll, parent=None, smooth=True, loc=(0, 0, 0)):
        me = bpy.data.meshes.new("RP_" + name)
        bmesh.ops.recalc_face_normals(self.bm, faces=self.bm.faces)
        self.bm.to_mesh(me)
        self.bm.free()
        for m in self.mats:
            me.materials.append(m)
        if smooth:
            me.shade_smooth()
        ob = bpy.data.objects.new("RP_" + name, me)
        coll.objects.link(ob)
        ob.location = loc
        if parent:
            ob.parent = parent
        return ob


def empty(name, coll, loc=(0, 0, 0), parent=None):
    ob = bpy.data.objects.new("RP_" + name, None)
    coll.objects.link(ob)
    ob.location = loc
    if parent:
        ob.parent = parent
    return ob


def key_linear(ob, path, pairs, index=-1):
    for f, v in pairs:
        if index < 0:
            setattr(ob, path, v)
        else:
            getattr(ob, path)[index] = v
        ob.keyframe_insert(path, index=index, frame=f)
    ad = ob.animation_data
    for fc in fcurves(ad):
        for k in fc.keyframe_points:
            k.interpolation = "LINEAR"


def fcurves(ad):
    if not ad or not ad.action:
        return []
    act = ad.action
    if hasattr(act, "layers") and act.layers:
        out = []
        for layer in act.layers:
            for strip in layer.strips:
                bag = strip.channelbag(ad.action_slot)
                if bag:
                    out.extend(bag.fcurves)
        return out
    return list(act.fcurves)


def bake_shapes(ob, coords_at):
    """Absolute shape keys, one per frame, played by eval_time = 10 * frame (a mesh cache in the .blend).
    coords_at(t) returns the object's vertex positions in vertex order."""
    ob.shape_key_add(name="Basis", from_mix=False)
    key = ob.data.shape_keys
    key.use_relative = False
    for f in range(1, NF + 1):
        kb = ob.shape_key_add(name="f%03d" % f, from_mix=False)
        kb.interpolation = "KEY_LINEAR"
        co = coords_at(ft(f))
        flatco = [c for v in co for c in v]
        kb.data.foreach_set("co", flatco)
    ob.data.shape_keys.key_blocks[0].data.foreach_set("co", [c for v in coords_at(ft(1)) for c in v])
    key_linear(key, "eval_time", [(1, 10.0), (NF, 10.0 * NF)])


# =============================================================================================
# the car: an empty driven along +x at 1.6 m/s; everything on it is in car-local Blender coords
# =============================================================================================
CAR = empty("Car", COL_CAR)
key_linear(CAR, "location", [(1, car_x(ft(1))), (NF, car_x(ft(NF)))], index=0)

# --- table top with the driver's hole (Boolean), its edge band, the gold inlay ring ---
b = Builder()
b.box(M["top"], (0, 0, TOP - 0.11), (2 * TL, 2 * TD, 0.22))
top = b.build("TableTop", COL_CAR, CAR, smooth=False)
for p in top.data.polygons:                                   # the sides take the dark edge colour
    if abs(p.normal.z) < 0.5:
        p.material_index = 1
top.data.materials.append(M["edge"])
cut_b = Builder()
cut_b.part(M["hole"], bmesh.ops.create_cone, cap_ends=True, segments=48, radius1=1.0, radius2=1.0, depth=1.0,
           matrix=Matrix.Translation((0, 0, TOP)) @ Matrix.Diagonal((0.55, 0.45, 1, 1)))
cutter = cut_b.build("HoleCutter", COL_WORLD, CAR, smooth=False)
cutter.hide_render = True
cutter.hide_viewport = True
bo = top.modifiers.new("Hole", "BOOLEAN")
bo.operation, bo.object, bo.solver = "DIFFERENCE", cutter, "EXACT"

b = Builder()
ring_o, ring_i = [], []
for i in range(48):                                           # the gold inlay: a flat ring .62/.52 -> .58/.48
    a = i / 48 * 2 * math.pi
    ring_o.append((math.cos(a) * 0.63, math.sin(a) * 0.53, TOP + 0.002))
    ring_i.append((math.cos(a) * 0.60, math.sin(a) * 0.50, TOP + 0.002))
vi = [b.bm.verts.new(p) for p in ring_i]                      # one connected ring, so Line Art sees one band
vo = [b.bm.verts.new(p) for p in ring_o]
b._tag([b.bm.faces.new((vi[i], vi[(i + 1) % 48], vo[(i + 1) % 48], vo[i])) for i in range(48)], M["gold"])
# the hole's dark well, and the driver's red hat sitting in it
b.part(M["hole"], bmesh.ops.create_cone, cap_ends=False, segments=48, radius1=1.0, radius2=1.0, depth=0.5,
       matrix=Matrix.Translation((0, 0, TOP - 0.25)) @ Matrix.Diagonal((0.549, 0.449, 1, 1)))
b.disc(M["hole"], (0, 0, TOP - 0.45), 1.0, seg=48, scale=(0.55, 0.45))
b.part(M["brim"], bmesh.ops.create_cone, cap_ends=True, segments=40, radius1=0.30, radius2=0.27, depth=0.025,
       matrix=Matrix.Translation((0, 0, TOP - 0.06)))
b.part(M["hat"], bmesh.ops.create_cone, cap_ends=True, segments=32, radius1=0.15, radius2=0.125, depth=0.17,
       matrix=Matrix.Translation((0, 0, TOP + 0.03)))
b.part(M["band"], bmesh.ops.create_cone, cap_ends=False, segments=32, radius1=0.153, radius2=0.149, depth=0.04,
       matrix=Matrix.Translation((0, 0, TOP - 0.025)))
b.build("HoleAndHat", COL_CAR, CAR)

# --- chassis, wheels ---
b = Builder()
b.box(M["chassis"], (0, 0, 0.47), (2 * TL * 0.9, 2 * TD * 0.86, 0.66))
b.build("Chassis", COL_CAR, CAR, smooth=False)
WHEEL_OBS = []
for x in WHEELS:
    for z in (-1.26, 1.26):                                   # inside the skirt plane (TD * .93 = 1.395)
        w = Builder()
        rot = Matrix.Rotation(math.pi / 2, 4, "X")
        w.part(M["tyre"], bmesh.ops.create_cone, cap_ends=True, segments=40, radius1=WHEEL_R, radius2=WHEEL_R,
               depth=0.16, matrix=rot)
        o = math.copysign(0.085, z)                            # hub face on the outside
        w.part(M["chrome"], bmesh.ops.create_cone, cap_ends=True, segments=36, radius1=WHEEL_R * 0.5,
               radius2=WHEEL_R * 0.42, depth=0.03, matrix=Matrix.Translation((0, o, 0)) @ rot)
        for s in range(5):
            a = s / 5 * 2 * math.pi
            p0 = (math.cos(a) * WHEEL_R * 0.1, o * 1.18, math.sin(a) * WHEEL_R * 0.1)
            p1 = (math.cos(a) * WHEEL_R * 0.44, o * 1.18, math.sin(a) * WHEEL_R * 0.44)
            w.rod(M["spoke"], p0, p1, 0.012, seg=6)
        w.part(M["gold"], bmesh.ops.create_cone, cap_ends=True, segments=16, radius1=WHEEL_R * 0.12,
               radius2=WHEEL_R * 0.1, depth=0.02, matrix=Matrix.Translation((0, o * 1.25, 0)) @ rot)
        wob = w.build("Wheel_%g_%g" % (x, z), COL_CAR, CAR, loc=(x, z, WHEEL_R))
        WHEEL_OBS.append(wob)
        # rolling without slipping along +x: rotation about +Y = distance / R
        key_linear(wob, "rotation_euler", [(1, car_x(ft(1)) / WHEEL_R), (NF, car_x(ft(NF)) / WHEEL_R)], index=1)


# --- the skirt: four pleated red panels to a hem that ripples (car.js hem), gold trim at the hem ---
def skirt_points():
    """Perimeter samples at .97 TL x .93 TD, with a pleat in/out offset; returns [(x, z, nx, nz, u)]."""
    pts = []
    sides = [((-TL * .97, -TD * .93), (TL * .97, -TD * .93)), ((TL * .97, -TD * .93), (TL * .97, TD * .93)),
             ((TL * .97, TD * .93), (-TL * .97, TD * .93)), ((-TL * .97, TD * .93), (-TL * .97, -TD * .93))]
    for (x0, z0), (x1, z1) in sides:
        L = math.hypot(x1 - x0, z1 - z0)
        n = max(8, round(L / 0.06))
        nx, nz = (z1 - z0) / L, -(x1 - x0) / L                  # outward normal (perimeter runs CCW from above)
        for i in range(n):
            u = i / n
            pts.append((lerp(x0, x1, u), lerp(z0, z1, u), nx, nz, u))
    return pts


SK = skirt_points()
SK_ROWS = [TOP - 0.2, 0.86, 0.74, None, None]               # None: the hem and the trim's lower edge (per frame)


def hem(u, t):
    return 0.56 + 0.045 * math.sin(u * 20 + t * 1.5)


def skirt_coords(t):
    co = []
    for r, y in enumerate(SK_ROWS):
        for i, (x, z, nx, nz, u) in enumerate(SK):
            pleat = 0.022 * math.sin(i * math.pi / 2) * (0.3 if r == 0 else 1.0)   # folds deepen toward the hem
            yy = y if y is not None else (hem(u, t) + (0.05 if r == 3 else 0.0))
            co.append(B(x + nx * pleat, yy, z + nz * pleat))
    return co


bm = bmesh.new()
nper = len(SK)
vs = [bm.verts.new(c) for c in skirt_coords(ft(1))]
for r in range(len(SK_ROWS) - 1):
    for i in range(nper):
        j = (i + 1) % nper
        f = bm.faces.new((vs[r * nper + i], vs[r * nper + j], vs[(r + 1) * nper + j], vs[(r + 1) * nper + i]))
        f.material_index = 1 if r == 3 else 0
me = bpy.data.meshes.new("RP_Skirt")
bm.to_mesh(me)
bm.free()
me.materials.append(M["skirt"])
me.materials.append(M["trim"])
me.shade_smooth()
skirt = bpy.data.objects.new("RP_Skirt", me)
COL_CAR.objects.link(skirt)
skirt.parent = CAR
skirt.modifiers.new("Both sides", "SOLIDIFY").thickness = 0.01
bake_shapes(skirt, skirt_coords)

# --- the whiteboard on its easel at the right end (table.js boardMap), chart bars on it ---
b = Builder()
x0, x1, zb, y0, y1 = 2.45, 3.95, 0.25, TOP + 1.55, TOP + 0.45
b.box(M["boardframe"], B((x0 + x1) / 2, (y0 + y1) / 2, zb + 0.02), (x1 - x0 + 0.08, 0.03, y0 - y1 + 0.1))
b.box(M["board"], B((x0 + x1) / 2, (y0 + y1) / 2, zb - 0.0), (x1 - x0, 0.03, y0 - y1))
for k, (hgt, mat) in enumerate([(0.55, "bar_b"), (0.75, "bar_r"), (0.62, "bar_b"), (0.9, "bar_r"), (0.7, "bar_b")]):
    bx = lerp(x0 + 0.18, x1 - 0.18, k / 4)
    b.box(M[mat], B(bx, y1 + 0.08 + hgt * 0.4, zb - 0.02), (0.16, 0.012, hgt * 0.8))       # bars rise off the bottom edge
for lx, lz in ((x0 + 0.1, zb), (x1 - 0.1, zb), ((x0 + x1) / 2, zb + 0.5)):
    b.rod(M["easel"], B(lx, y0 + 0.1, zb + 0.03), B(lx, TOP, lz), 0.02, seg=8)
b.build("Whiteboard", COL_CAR, CAR, smooth=False)


# =============================================================================================
# the suits on their hop-on seats (car.js seatGeom, bodyPose, kneeIK, suit, egg, rosette)
# Built in a seat frame: x lateral, y toward the table, z up; then placed with a rotation.
# =============================================================================================
def knee_ik(h, f, bend):
    a, b_ = 0.42, 0.56
    d = f - h
    L = d.length
    if L >= a + b_ - 1e-3:
        return h + d * (a / (a + b_))
    u = d / L
    al = (a * a - b_ * b_ + L * L) / (2 * L)
    hh = math.sqrt(max(0.0, a * a - al * al))
    p = bend - u * bend.dot(u)
    p = p.normalized() if p.length > 1e-6 else Vector((0, 0, 1))
    return h + u * al + p * hh


def seat_matrix(s):
    if s["z"]:
        fwd = Vector((0, -math.copysign(1, s["z"]), 0))
    else:
        fwd = Vector((-math.copysign(1, s["x"]), 0, 0))
    up = Vector((0, 0, 1))
    side = fwd.cross(up)
    m = Matrix((side, fwd, up)).transposed().to_4x4()
    m.translation = Vector((s["x"], s["z"], 0))
    return m


def build_seat(b, s):
    gap = abs(s["z"]) - TD if s["z"] else abs(s["x"]) - TL
    by = SEAT - 0.05
    A, Bp, Cp = (0, gap + 0.02, TOP - 0.24), (0, 0.08, by), (0, gap + 0.2, by)
    b.rod(M["beam"], Cp, Bp, 0.045, seg=10)
    b.rod(M["beam"], A, Bp, 0.04, seg=10)
    b.rod(M["beam"], A, Cp, 0.03, seg=10)
    for p in (A, Bp):
        b.ellipsoid(M["gold"], p, (0.045,) * 3, seg=10)
    # the Dali crutch propping the seat: pole, fork, padded crosspiece
    ca, cb, sc = Vector((0.2, -0.15, by - 0.02)), Vector((0.42, -0.42, 0.0)), 0.5
    b.rod(M["crutch"], ca, cb, 0.022, seg=8)
    fm = ca + Vector((0, 0, -0.3 * sc))
    b.rod(M["crutch"], fm, ca + Vector((-0.18 * sc, 0, -0.1 * sc)), 0.016, seg=6)
    b.rod(M["crutch"], fm, ca + Vector((0.18 * sc, 0, -0.1 * sc)), 0.016, seg=6)
    b.rod(M["pad"], ca + Vector((-0.22 * sc, 0, 0)), ca + Vector((0.22 * sc, 0, 0)), 0.035, seg=10)
    # the low seat pan and its short leather back with gold studs
    b.box(M["seat"], (0, 0, SEAT - 0.035), (0.5, 0.4, 0.07))
    b.box(M["seatback"], (0, -0.22, SEAT + 0.145), (0.46, 0.04, 0.25),
          rot=Matrix.Rotation(-0.16, 4, "X"))
    for j in range(4):
        b.ellipsoid(M["gold"], (-0.15 + j * 0.1, -0.245, SEAT + 0.23), (0.018,) * 3, seg=8)


def build_body(b, s):
    hip = SEAT + 0.03
    sh = hip + TORSO
    # legs: knees up, feet on the sand (bodyPose seated, legPts)
    sw = 1.25 + 0.15
    for d in (-1, 1):
        h = Vector((d * 0.1, -0.02, hip))
        f = Vector((d * 0.26, 0.36, 0.03))
        kn = knee_ik(h, f, Vector((d * sw, 0.3, 1.0)))
        b.rod(M["suit"], h, kn, 0.085, 0.075)
        b.rod(M["suit"], kn, f + Vector((0, 0, 0.06)), 0.07, 0.06)
        b.ellipsoid(M["shoe"], f + Vector((0, 0.05, 0.03)), (0.055, 0.11, 0.045), seg=12)
        if d == 1:
            knee_r = kn
        else:
            knee_l = kn
    # torso: an elliptical, slightly flared jacket; rounded shoulders
    b.part(M["suit"], bmesh.ops.create_cone, cap_ends=True, segments=24, radius1=1.0, radius2=1.0, depth=TORSO,
           matrix=Matrix.Translation((0, 0, hip + TORSO / 2)) @ Matrix.Diagonal((0.23, 0.14, 1, 1)))
    b.ellipsoid(M["suit"], (0, 0, sh - 0.02), (0.27, 0.15, 0.08), seg=20)
    b.ellipsoid(M["suit"], (0, 0, hip), (0.23, 0.15, 0.06), seg=20)
    is_drawer = s["r"] == "drawer"
    fy = 0.142                                            # just proud of the jacket front
    if is_drawer:
        for i in range(3):
            dz = sh - (0.08 + i * 0.125) - 0.05
            b.box(M["drawer"], (0, fy, dz), (0.26, 0.03, 0.1))
            b.ellipsoid(M["gold"], (0, fy + 0.02, dz), (0.016,) * 3, seg=8)
    else:
        b.poly(M["shirt"], [(-0.08, fy, sh - 0.01), (0.0, fy + 0.012, sh - 0.31), (0.08, fy, sh - 0.01)])
        b.poly(M["tie"], [(-0.02, fy + 0.006, sh - 0.03), (0.02, fy + 0.006, sh - 0.03), (0.03, fy + 0.014, sh - 0.25),
                          (0.0, fy + 0.016, sh - 0.29), (-0.03, fy + 0.014, sh - 0.25)])
        # the rosette on the lapel: 12 petals round a cream button, two ribbon tails
        rot = Matrix.Rotation(-math.pi / 2, 4, "X")
        rc = Vector((0.15, fy + 0.012, sh - 0.12))
        b.disc(M["rosette"], rc, 0.05, seg=24, rot=rot)
        b.disc(M["rosette_c"], rc + Vector((0, 0.004, 0)), 0.018, seg=16, rot=rot)
        b.poly(M["rosette"], [(rc.x - 0.02, rc.y - 0.001, rc.z), (rc.x - 0.035, rc.y - 0.001, rc.z - 0.1), (rc.x - 0.008, rc.y - 0.001, rc.z - 0.085)])
        b.poly(M["rosette"], [(rc.x + 0.008, rc.y - 0.001, rc.z), (rc.x + 0.018, rc.y - 0.001, rc.z - 0.105), (rc.x + 0.04, rc.y - 0.001, rc.z - 0.09)])
    # arms resting, hands on the knees
    for d, kn in ((-1, knee_l), (1, knee_r)):
        shp = Vector((d * 0.25, 0.0, sh - 0.06))
        hand = kn + Vector((0, -0.04, 0.07))
        elbow = Vector((d * 0.29, 0.02, lerp(shp.z, hand.z, 0.55)))
        b.rod(M["suit"], shp, elbow, 0.068, 0.06)
        b.rod(M["suit"], elbow, hand, 0.06, 0.05)
        b.ellipsoid(M["egg"], hand, (0.05, 0.055, 0.045), seg=12)
    b.rod(M["neck"], (0, 0, sh - 0.06), (0, 0, sh + 0.04), 0.045, seg=12)
    return sh


def build_head(s, i, parent, sh):
    """The egg head on its own object (it bobs); a grin card hugging its front (hidden in this shot)."""
    b = Builder()
    rx, ry = 0.125, 0.155
    b.ellipsoid(M["egg"], (0, 0, 0), (rx, rx * 0.95, ry), seg=32)
    head = b.build("Head_%d" % i, COL_CAR, parent, loc=(0, 0, sh + 0.19))
    g = Builder()
    for part, (w, h0, h1, mat, y_off) in enumerate([(0.62, 0.3, 0.58, "mouth", 0.004), (0.55, 0.3, 0.4, "teeth", 0.006)]):
        pts = []
        for k in range(17):             # lower half-ellipse in the head's front, wrapped onto the egg
            a = math.pi * k / 16
            xx = math.cos(a) * rx * w
            zz = -ry * 0.3 - math.sin(a) * ry * (h1 - h0) * (1.0 if mat == "mouth" else 0.35)
            yy = rx * 0.95 * math.sqrt(max(0.0, 1 - (xx / rx) ** 2 - (zz / ry) ** 2)) + y_off
            pts.append((xx, yy, zz))
        g.poly(M[mat], pts)
    grin = g.build("Grin_%d" % i, COL_CAR, head, smooth=False)
    grin.scale = (1, 1, 1) if GRINS else (0, 0, 0)
    return head


SUITS = []
for i, s in enumerate(SEATS):
    b = Builder()
    build_seat(b, s)
    sh = build_body(b, s)
    body = b.build("Suit_%d" % i, COL_CAR, CAR)
    body.matrix_parent_inverse = Matrix.Identity(4)
    body.matrix_basis = seat_matrix(s)
    head = build_head(s, i, body, sh)
    SUITS.append((s, i, head))
    # o.nod = sin(t * 1.3 + i * 1.7) * .3; draft 3 bobs the head .035 m per unit, here a bob plus a small tilt
    for f in range(1, NF + 1):
        t = ft(f)
        nod = math.sin(t * 1.3 + i * 1.7) * 0.3
        head.location.z = sh + 0.19 - nod * 0.035
        head.rotation_euler.x = nod * 0.12
        head.keyframe_insert("location", index=2, frame=f)
        head.keyframe_insert("rotation_euler", index=0, frame=f)


# =============================================================================================
# the speakerphone (table.js speakerphone): a soft watch, baked per frame from the draft's own maths
# flow() pulls the front toward the table edge, drape() folds whatever passes the edge down its face.
# =============================================================================================
CX = 1.2
NA = 48
RINGS = [0.03, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.78, 0.85, 0.9, 0.94, 0.97, 1.0]


def ph_state(t):
    m, sl = melt(t), phone_slump(t)
    return dict(sl=sl, cz=-0.95 - m * 0.75, tape=tape_amt(t), red=W_CANT < t < L2S + 0.5)


def flow(st, x, z, f=1.0):
    cz, sl = st["cz"], st["sl"]
    dx, dz = x - CX, z - cz
    front = clamp(-dz / 0.3)
    side = 1 - 0.55 * (dx / 0.4) ** 2
    return CX + dx * (1 + 0.2 * sl * f), z - sl * f * (0.12 + 0.78 * front * side)


BEND_R = 0.025
DOME = (0.03, 0.25, 0.5, 0.75, 1.0)


def drape(x, z, h):
    """A point h above the table top at (x, z): flat on the top, folded round the front edge past it."""
    if z >= -TD:
        return B(x, TOP + h, z)
    d = -TD - z
    yc = TOP - BEND_R
    th = d / (BEND_R + 0.02)
    rr = BEND_R + h
    if th <= math.pi / 2:
        return B(x, yc + rr * math.cos(th), -TD - rr * math.sin(th))
    rem = d - (math.pi / 2) * (BEND_R + 0.02)
    return B(x, yc - rem * 1.05, -TD - rr)


def body_r(a, sl):
    return 0.34 * (1 + 0.14 * math.cos(3 * a)) * (1 + sl * 0.06 * n1(5, a * 2))


def body_h(rho):
    if rho <= 0.9:
        return 0.04 + 0.008 * (1 - (rho / 0.9) ** 2)
    if rho <= 0.97:
        return 0.034
    return 0.018


PARTS = []      # (kind, params) in vertex order, rebuilt identically for every frame


def phone_coords(t):
    st = ph_state(t)
    sl, cz = st["sl"], st["cz"]
    co = []

    def body_pt(a, rho, h, scale=1.0, f=1.0, dz=0.0):
        r = body_r(a, sl) * rho
        x0, z0 = CX + math.cos(a + 0.5) * r, cz + math.sin(a + 0.5) * r * 0.9
        x, z = flow(st, x0, z0, f)
        if scale != 1.0:
            x, z = CX + (x - CX) * scale, cz + (z - cz) * scale - dz
        return drape(x, z, h)

    # body: top polar grid + rim + skirt down to the table
    for rho in RINGS:
        for i in range(NA):
            co.append(body_pt(i / NA * 2 * math.pi, rho, body_h(rho)))
    for i in range(NA):
        co.append(body_pt(i / NA * 2 * math.pi, 1.0, 0.002))
    co.append(body_pt(0.0, 0.0, 0.002))                       # bottom centre
    # the raised dome: the flowed outline scaled .55 toward the centre (the draft's second poly)
    for rho in DOME:
        for i in range(NA):
            co.append(body_pt(i / NA * 2 * math.pi, rho, 0.052 + 0.006 * (1 - rho * rho), scale=0.55, dz=sl * 0.05))
    # grille holes: 9 dots at r .1, flowed at half strength
    for k in range(9):
        a = k / 9 * 2 * math.pi
        x, z = flow(st, CX + math.cos(a) * 0.1, cz + math.sin(a) * 0.09, 0.5)
        for j in range(8):
            b_ = j / 8 * 2 * math.pi
            co.append(drape(x + math.cos(b_) * 0.013, z + math.sin(b_) * 0.012, 0.0595))
    # LEDs: green while it may speak, red under the tape (the unused set sinks into the body)
    for col in ("g", "r"):
        on = st["red"] == (col == "r")
        for k in range(3):
            a = k / 3 * 2 * math.pi + 0.5
            x, z = flow(st, CX + math.cos(a) * 0.3 * 0.8, cz + math.sin(a) * 0.3 * 0.72)
            for j in range(8):
                b_ = j / 8 * 2 * math.pi
                co.append(drape(x + math.cos(b_) * 0.022, z + math.sin(b_) * 0.02, 0.046 if on else 0.01))
    # the tape X: two strips that stretch out from the centre on "can't"
    tp = st["tape"]
    for d in (1, -1):
        p0 = flow(st, CX - 0.3 * tp, cz - 0.25 * d * tp, 0.35)
        p1 = flow(st, CX + 0.3 * tp, cz + 0.25 * d * tp, 0.35)
        dx, dz = p1[0] - p0[0], p1[1] - p0[1]
        L = math.hypot(dx, dz) or 1.0
        nx, nz = -dz / L * 0.045 * min(1.0, tp * 4), dx / L * 0.045 * min(1.0, tp * 4)
        for k in range(9):
            u = k / 8
            x, z = lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u)
            hh = 0.064 + 0.006 * math.sin(u * math.pi) + (0.004 if d < 0 else 0)
            co.append(drape(x - nx, z - nz, hh))
            co.append(drape(x + nx, z + nz, hh))
    # drips off the front edge (4 of them), each a tapered tear: 8-ring cone + tip
    for i in range(4):
        x = CX - 0.2 + i * 0.13
        ov = -TD - flow(st, x, cz - 0.3)[1]
        ln = sl * (0.1 + 0.2 * rnd(i, 61)) * (1 + 0.15 * math.sin(t * 2 + i)) if ov > 0.03 else 0.0
        ytop = TOP + 0.04 - ov * 1.05 + 0.03
        top_y = min(ytop, TOP - 0.05)
        for k, (yy, rr) in enumerate([(top_y + 0.02, 0.035), (top_y - ln * 0.5, 0.024), (top_y - ln, 0.03 if ln else 0.0)]):
            for j in range(8):
                b_ = j / 8 * 2 * math.pi
                rr2 = rr if ln else 0.0
                co.append(B(x + math.cos(b_) * rr2, yy, -TD - BEND_R - 0.012 + math.sin(b_) * rr2 * 0.6))
        co.append(B(x, top_y - ln - (0.03 if ln else 0.0), -TD - BEND_R - 0.012))
    return co


def build_phone():
    bm = bmesh.new()
    vs = [bm.verts.new(c) for c in phone_coords(ft(1))]
    mats = [M["phone"], M["dome"], M["grille"], M["led_g"], M["led_r"], M["tape"]]

    def face(idx, mi):
        f = bm.faces.new([vs[k] for k in idx])
        f.material_index = mi

    nr = len(RINGS)
    base = 0
    for r in range(nr - 1):
        for i in range(NA):
            j = (i + 1) % NA
            face([base + r * NA + i, base + r * NA + j, base + (r + 1) * NA + j, base + (r + 1) * NA + i], 0)
    rim = base + nr * NA
    for i in range(NA):
        j = (i + 1) % NA
        face([base + (nr - 1) * NA + i, base + (nr - 1) * NA + j, rim + j, rim + i], 0)
    bc = rim + NA
    for i in range(NA):
        face([rim + (i + 1) % NA, rim + i, bc], 0)
    d0 = bc + 1                                                 # dome: 3 rings
    for r in range(len(DOME) - 1):
        for i in range(NA):
            j = (i + 1) % NA
            face([d0 + r * NA + i, d0 + r * NA + j, d0 + (r + 1) * NA + j, d0 + (r + 1) * NA + i], 1)
    k0 = d0 + len(DOME) * NA
    for k in range(9):
        face(list(range(k0 + k * 8, k0 + k * 8 + 8)), 2)
    l0 = k0 + 72
    for c in range(2):
        for k in range(3):
            face(list(range(l0 + (c * 3 + k) * 8, l0 + (c * 3 + k) * 8 + 8)), 3 + c)
    t0 = l0 + 48
    for d in range(2):
        s0 = t0 + d * 18
        for k in range(8):
            face([s0 + 2 * k, s0 + 2 * k + 2, s0 + 2 * k + 3, s0 + 2 * k + 1], 5)
    r0 = t0 + 36
    for i in range(4):
        s0 = r0 + i * 25
        for ring in range(2):
            for j in range(8):
                jj = (j + 1) % 8
                face([s0 + ring * 8 + j, s0 + ring * 8 + jj, s0 + (ring + 1) * 8 + jj, s0 + (ring + 1) * 8 + j], 0)
        for j in range(8):
            face([s0 + 16 + j, s0 + 16 + (j + 1) % 8, s0 + 24], 0)
    assert len(vs) == r0 + 100, len(vs)
    me = bpy.data.meshes.new("RP_Speakerphone")
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    me.shade_smooth()
    ob = bpy.data.objects.new("RP_Speakerphone", me)
    COL_CAR.objects.link(ob)
    ob.parent = CAR
    bake_shapes(ob, phone_coords)
    ss = ob.modifiers.new("Soft", "SUBSURF")
    ss.levels, ss.render_levels = 1, 1
    return ob


PHONE = build_phone()

# =============================================================================================
# the playa, the light, the camera
# =============================================================================================
b = Builder()
b.part(M["playa"], bmesh.ops.create_grid, x_segments=1, y_segments=1, size=300)
b.build("Playa", COL_WORLD, smooth=False)


def sun(name, el_deg, travel_xy, strength, shadow):
    """travel_xy: the light's horizontal travel direction on the ground (draft sunDir -> Blender x, y)."""
    ld = bpy.data.lights.new("RP_" + name, "SUN")
    ld.energy = strength
    ld.angle = 0.0                    # crisp cel edges
    ld.use_shadow = shadow
    ld.color = (1, 1, 1)
    ob = bpy.data.objects.new("RP_" + name, ld)
    COL_WORLD.objects.link(ob)
    e = math.radians(el_deg)
    h = Vector((travel_xy[0], travel_xy[1], 0)).normalized() * math.cos(e)
    d = Vector((h.x, h.y, -math.sin(e)))
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    return ob


# draft 3 at 0:25: sun elevation ~17 deg (SUN_EL), shadows run toward +x and toward the camera (sunDir .78, -.62)
SUN_EL_25 = 11 + (25 - 16) / (40 - 16) * (27 - 11)
sun("Sun", SUN_EL_25, (0.78, -0.62), 0.9 * math.pi, True)
sun("Key", 50, (0.574, 0.819), 0.7 * math.pi, False)        # from front-left, above the camera

world = scn.world or bpy.data.worlds.new("RP_World")
scn.world = world
world.use_nodes = True
wn, wl = world.node_tree.nodes, world.node_tree.links
wn.clear()
lp, bg_cam, bg_amb = wn.new("ShaderNodeLightPath"), wn.new("ShaderNodeBackground"), wn.new("ShaderNodeBackground")
wmix, wout = wn.new("ShaderNodeMixShader"), wn.new("ShaderNodeOutputWorld")
bg_cam.inputs[0].default_value = lin("#bfd6e2")
bg_amb.inputs[0].default_value = (1, 1, 1, 1)
bg_amb.inputs[1].default_value = 0.25
wl.new(lp.outputs["Is Camera Ray"], wmix.inputs[0])
wl.new(bg_amb.outputs[0], wmix.inputs[1])
wl.new(bg_cam.outputs[0], wmix.inputs[2])
wl.new(wmix.outputs[0], wout.inputs[0])

cd = bpy.data.cameras.new("RP_Camera")
cd.sensor_fit = "HORIZONTAL"
cd.sensor_width = 36.0
cd.clip_start = 0.05
cd.clip_end = 600
CAM = bpy.data.objects.new("RP_Camera", cd)
COL_WORLD.objects.link(CAM)
scn.camera = CAM
for f in range(1, NF + 1):
    x, y, z, p, fpx = cam_at(ft(f))
    CAM.location = B(x, y, z)
    CAM.rotation_euler = (math.pi / 2 - p, 0, 0)
    cd.lens = fpx / 1920 * 36.0                         # draft f is px on a 1920-wide frame
    CAM.keyframe_insert("location", frame=f)
    CAM.keyframe_insert("rotation_euler", frame=f)
    cd.keyframe_insert("lens", frame=f)

# =============================================================================================
# ink: Grease Pencil Line Art over the car (contours + creases), a warm dark brown
# =============================================================================================
if LINEART:
    bpy.ops.object.grease_pencil_add(type="LINEART_SCENE")
    gp = bpy.context.active_object
    gp.name = "RP_LineArt"
    for c in gp.users_collection:
        c.objects.unlink(gp)
    COL_WORLD.objects.link(gp)
    la = gp.modifiers[0]
    la.source_type = "COLLECTION"
    la.source_collection = COL_CAR
    la.use_crease = True
    la.crease_threshold = math.radians(140)
    la.use_intersection = False
    la.radius = float(arg("--ink", 0.006))         # metres; ~2.5 px wide at 960 from 3.5 m
    la.opacity = 0.85
    mat = la.target_material or (gp.data.materials[0] if gp.data.materials else None)
    if mat and mat.grease_pencil:
        mat.grease_pencil.color = lin("#2a140c")

# =============================================================================================
# render settings
# =============================================================================================
scn.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in {e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items} else "BLENDER_EEVEE"
scn.eevee.taa_render_samples = SAMPLES
scn.eevee.shadow_resolution_scale = 1.0
scn.view_settings.view_transform = "Standard"
scn.view_settings.look = "None"
scn.render.resolution_x, scn.render.resolution_y = RES
scn.render.resolution_percentage = 100
scn.render.fps = FPS
scn.frame_start, scn.frame_end = 1, NF
scn.render.film_transparent = False
scn.render.image_settings.file_format = "PNG"
scn.render.image_settings.color_mode = "RGB"

print("[rp] built %d frames, song %.2f-%.2f s, %d objects" % (NF, T0, T1, len([o for o in bpy.data.objects if o.name.startswith('RP_')])))

stills = arg("--stills")
tag = arg("--tag", "")
if stills:
    os.makedirs(os.path.join(HERE, "out", "stills"), exist_ok=True)
    for fs in stills.split(","):
        f = int(fs)
        scn.frame_set(f)
        scn.render.filepath = os.path.join(HERE, "out", "stills", "f%03d%s.png" % (f, ("_" + tag) if tag else ""))
        t0 = time.time()
        bpy.ops.render.render(write_still=True)
        print("[rp] still f%03d (t=%.3f) %.1f s" % (f, ft(f), time.time() - t0))
if "--render" in ARGS:
    os.makedirs(os.path.join(HERE, "out", "frames"), exist_ok=True)
    scn.render.filepath = os.path.join(HERE, "out", "frames", "f_")
    t0 = time.time()
    bpy.ops.render.render(animation=True)
    dt = time.time() - t0
    print("[rp] rendered %d frames in %.0f s (%.1f s/frame)" % (NF, dt, dt / NF))
if arg("--save"):
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, arg("--save")))
