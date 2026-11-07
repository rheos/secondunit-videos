"""Shared kit for the verse 1 Blender build: frame grid, draft 3/5 helpers, palette, cel materials with
distance haze, a bmesh Builder, keying and per-frame shape-key baking, and the exported draft state.

Conventions every module follows:
- Draft coords are (x right, y up, z away from the camera at yaw 0); Blender is (x, y = draft z, z = up).
  Use B(x, y, z) to convert. Car-local things are parented to rp_core.CAR (made by rp_car).
- Frame f (1..NF) is song time ft(f) = T0 + (f - 1) / 24, the same grid as draft 3/5's render.mjs.
- Per-frame values come from state("<probe>"), a list indexed f - 1, written by tools/export_state.mjs.
- Objects and datablocks are named "RP_*". Collections: COL_CAR and COL_INST get Line Art ink,
  COL_PLAYA does not; COL_WORLD holds lights, camera, cutters.
"""
import bpy
import bmesh
import json
import math
import os
import sys
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []


def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default


FPS = 24
T0 = float(arg("--t0", 16.7))
NF = int(arg("--frames", 570))            # 16.70 .. 40.446 s
RES = tuple(int(v) for v in arg("--res", "1280x720").split("x"))


def ft(f):
    return T0 + (f - 1) / FPS


FRAMES = range(1, NF + 1)


# ---------- draft helpers (core.js), ported ----------
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def lerp(a, b, u):
    return a + (b - a) * u


def smooth(x):
    x = clamp(x)
    return x * x * (3 - 2 * x)


def ease(t, a, b):
    return smooth((t - a) / (b - a))


def lin_t(t, a, b):
    return clamp((t - a) / (b - a))


def rnd(a, b=0.0, c=0.0):
    x = math.sin(a * 127.1 + b * 311.7 + c * 74.7 + 0.37) * 43758.5453
    return x - math.floor(x)


def n1(seed, x):
    i = math.floor(x)
    f = x - i
    u = f * f * (3 - 2 * f)
    return lerp(rnd(seed, i), rnd(seed, i + 1), u) * 2 - 1


def B(x, y, z):
    """Draft (x right, y up, z away) -> Blender (x, y away, z up)."""
    return Vector((x, z, y))


# ---------- the car's dimensions (world.js, car.js) ----------
TOP, TD, TL = 1.15, 1.5, 4.4
SEAT, TORSO = 0.42, 0.78

# ---------- exported draft state ----------
_STATE = {}


def state(name):
    if name not in _STATE:
        p = os.path.join(ROOT, "out", "state", name + ".json")
        d = json.load(open(p))
        assert abs(d["t0"] - T0) < 1e-6 and len(d["f"]) >= NF, (p, d["t0"], len(d["f"]), T0, NF)
        _STATE[name] = d["f"][:NF]
    return _STATE[name]


# ---------- colour ----------
def lin(h, a=1.0):
    h = h.lstrip("#")
    s = [int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4)]
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in s) + (a,)


def lin_rgb(rgb):
    """[r, g, b] 0..255 (draft's hex()/mix() arrays) -> scene-linear RGBA."""
    return lin("#%02x%02x%02x" % tuple(int(round(clamp(c, 0, 255))) for c in rgb[:3]))


def hmix(a, b, u):
    a, b = a.lstrip("#"), b.lstrip("#")
    c = [round(lerp(int(a[i:i + 2], 16), int(b[i:i + 2], 16), u)) for i in (0, 2, 4)]
    return "#%02x%02x%02x" % tuple(c)


PLUM = "#34223a"        # draft 3's shadow colour, rgba(52,34,58,.42)


def shade(h, u=0.42):
    return hmix(h, PLUM, u)


# =============================================================================================
# keying
# =============================================================================================
def _fcurve(id_data, path, index):
    ad = id_data.animation_data or id_data.animation_data_create()
    if ad.action is None:
        ad.action = bpy.data.actions.new("RP_%s_Action" % id_data.name)
    act = ad.action
    if hasattr(act, "fcurve_ensure_for_datablock"):
        return act.fcurve_ensure_for_datablock(id_data, path, index=index)
    return act.fcurves.find(path, index=index) or act.fcurves.new(path, index=index)


def key_series(id_data, path, values, index=0, frames=None, interp="LINEAR"):
    """One key per frame (fast: foreach_set). values[i] belongs to frames[i] (default 1..NF)."""
    frames = list(frames or FRAMES)
    fc = _fcurve(id_data, path, index)
    fc.keyframe_points.clear()
    fc.keyframe_points.add(len(frames))
    co = []
    for f, v in zip(frames, values):
        co += [f, float(v)]
    fc.keyframe_points.foreach_set("co", co)
    for k in fc.keyframe_points:
        k.interpolation = interp
    fc.update()
    return fc


def key_loc(ob, locs, frames=None):
    for i in range(3):
        key_series(ob, "location", [p[i] for p in locs], index=i, frames=frames)


def key_rot(ob, rots, frames=None):
    for i in range(3):
        key_series(ob, "rotation_euler", [r[i] for r in rots], index=i, frames=frames)


def key_scale(ob, scales, frames=None):
    for i in range(3):
        key_series(ob, "scale", [s[i] if hasattr(s, "__len__") else s for s in scales], index=i, frames=frames)


def key_matrix(ob, mats, frames=None):
    """Per-frame local matrices -> location / euler / scale keys (euler made continuous)."""
    locs, rots, scs, prev = [], [], [], None
    for m in mats:
        loc, q, sc = m.decompose()
        e = q.to_euler("XYZ", prev) if prev is not None else q.to_euler("XYZ")
        prev = e
        locs.append(loc)
        rots.append(e)
        scs.append(sc)
    key_loc(ob, locs, frames)
    key_rot(ob, rots, frames)
    key_scale(ob, scs, frames)


def bake_shapes(ob, coords_at, frames=None):
    """Absolute shape keys, one per baked frame, played by eval_time (a mesh cache inside the .blend).
    coords_at(f) returns vertex positions in vertex order. Outside the baked frames the first/last holds."""
    frames = list(frames or FRAMES)
    ob.shape_key_add(name="Basis", from_mix=False)
    key = ob.data.shape_keys
    key.use_relative = False
    first = None
    for k, f in enumerate(frames):
        kb = ob.shape_key_add(name="f%04d" % f, from_mix=False)
        kb.interpolation = "KEY_LINEAR"
        flat = [c for v in coords_at(f) for c in v]
        kb.data.foreach_set("co", flat)
        if first is None:
            first = flat
    key.key_blocks[0].data.foreach_set("co", first)
    f0 = frames[0]
    key_series(key, "eval_time", [10.0 * (clamp(f - f0, 0, len(frames) - 1) + 1) for f in FRAMES])


# =============================================================================================
# materials: cel shading (Diffuse > Shader to RGB > CONSTANT ramp > Emission), then distance haze
# Lamps: ambient .25, key .7 pi (no shadows, turns with the camera, from its front-left), sun .9 pi
# (shadows, the draft's sun). Shader-to-RGB values measured on take 1: flat and sun-lit .84, flat in a
# cast shadow .63, faces toward the camera ~.5, sun-lit sides ~.95, turned away ~.2. Cuts .32 and .74:
# on flat things 'base' is the cast-shadow colour and 'light' the sun-lit one.
# =============================================================================================
HAZE_NEAR, HAZE_FAR = 45.0, 1600.0       # metres; the draft whitens the playa toward its horizon


def haze_group():
    g = bpy.data.node_groups.get("RP_Haze")
    if g:
        return g
    g = bpy.data.node_groups.new("RP_Haze", "ShaderNodeTree")
    g.interface.new_socket("Color", in_out="INPUT", socket_type="NodeSocketColor")
    g.interface.new_socket("Color", in_out="OUTPUT", socket_type="NodeSocketColor")
    n, l = g.nodes, g.links
    gi, go = n.new("NodeGroupInput"), n.new("NodeGroupOutput")
    cam, mr, pw = n.new("ShaderNodeCameraData"), n.new("ShaderNodeMapRange"), n.new("ShaderNodeMath")
    mix = n.new("ShaderNodeMix")
    rgb = n.new("ShaderNodeRGB")
    rgb.name = "HazeColor"
    rgb.outputs[0].default_value = lin("#d9dccf")
    mix.data_type = "RGBA"
    mr.inputs["From Min"].default_value = HAZE_NEAR
    mr.inputs["From Max"].default_value = HAZE_FAR
    pw.operation = "POWER"
    pw.inputs[1].default_value = 0.6
    amt = n.new("ShaderNodeMath")
    amt.operation = "MULTIPLY"
    amt.name = "HazeAmount"
    amt.inputs[1].default_value = 0.85
    l.new(cam.outputs["View Distance"], mr.inputs["Value"])
    l.new(mr.outputs[0], pw.inputs[0])
    l.new(pw.outputs[0], amt.inputs[0])
    l.new(amt.outputs[0], mix.inputs["Factor"])
    l.new(gi.outputs[0], mix.inputs["A"])
    l.new(rgb.outputs[0], mix.inputs["B"])
    l.new(mix.outputs["Result"], go.inputs[0])
    return g


def _nodes(mat):
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    return nt.nodes, nt.links


def _finish(mat, n, l, col):
    hz = n.new("ShaderNodeGroup")
    hz.node_tree = haze_group()
    emit, out = n.new("ShaderNodeEmission"), n.new("ShaderNodeOutputMaterial")
    l.new(col, hz.inputs[0])
    l.new(hz.outputs[0], emit.inputs[0])
    l.new(emit.outputs[0], out.inputs[0])
    return mat


def toon(name, base, shadow=None, light=None, cuts=(0.32, 0.74), grain=None, haze=True):
    """base/shadow/light are sRGB hex. grain: (scale, strength) wave texture multiplied in."""
    mat = bpy.data.materials.new("RP_" + name)
    n, l = _nodes(mat)
    dif, rgb, ramp = n.new("ShaderNodeBsdfDiffuse"), n.new("ShaderNodeShaderToRGB"), n.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.interpolation = "CONSTANT"
    cr.elements[0].position, cr.elements[0].color = 0.0, lin(shadow or shade(base))
    cr.elements[1].position, cr.elements[1].color = cuts[0], lin(base)
    if light:
        cr.elements.new(cuts[1]).color = lin(light)
    l.new(dif.outputs[0], rgb.inputs[0])
    l.new(rgb.outputs[0], ramp.inputs[0])
    col = ramp.outputs[0]
    if grain:
        tc, wave, mul, r2 = n.new("ShaderNodeTexCoord"), n.new("ShaderNodeTexWave"), n.new("ShaderNodeMix"), n.new("ShaderNodeValToRGB")
        mul.data_type, mul.blend_type = "RGBA", "MULTIPLY"
        wave.wave_type, wave.bands_direction = "BANDS", "Y"
        wave.inputs["Scale"].default_value = grain[0]
        wave.inputs["Distortion"].default_value = 3.0
        wave.inputs["Detail"].default_value = 2.0
        r2.color_ramp.elements[0].color = (1 - grain[1],) * 3 + (1,)
        l.new(tc.outputs["Object"], wave.inputs["Vector"])
        l.new(wave.outputs["Fac"], r2.inputs[0])
        mul.inputs["Factor"].default_value = 1.0
        l.new(col, mul.inputs["A"])
        l.new(r2.outputs[0], mul.inputs["B"])
        col = mul.outputs["Result"]
    if not haze:
        emit, out = n.new("ShaderNodeEmission"), n.new("ShaderNodeOutputMaterial")
        l.new(col, emit.inputs[0])
        l.new(emit.outputs[0], out.inputs[0])
        return mat
    return _finish(mat, n, l, col)


def flat(name, hexc, strength=1.0, haze=True):
    """Unlit colour (LEDs, ink-flat props). strength > 1 glows."""
    mat = bpy.data.materials.new("RP_" + name)
    n, l = _nodes(mat)
    rgb = n.new("ShaderNodeRGB")
    rgb.outputs[0].default_value = lin(hexc)
    if haze and strength == 1.0:
        return _finish(mat, n, l, rgb.outputs[0])
    e, o = n.new("ShaderNodeEmission"), n.new("ShaderNodeOutputMaterial")
    l.new(rgb.outputs[0], e.inputs[0])
    e.inputs[1].default_value = strength
    l.new(e.outputs[0], o.inputs[0])
    return mat


def soft(name, hexc, alpha=1.0):
    """A soft, see-through flat colour (dust, glow, haze cards): object colour alpha multiplies it,
    so key ob.color[3] per frame to fade an object. Uses Object Info > Alpha."""
    mat = bpy.data.materials.new("RP_" + name)
    mat.surface_render_method = "BLENDED"
    mat.use_transparency_overlap = False
    n, l = _nodes(mat)
    oi, tc, grad, rmp = n.new("ShaderNodeObjectInfo"), n.new("ShaderNodeTexCoord"), n.new("ShaderNodeTexGradient"), n.new("ShaderNodeValToRGB")
    grad.gradient_type = "SPHERICAL"
    mapn = n.new("ShaderNodeMapping")
    mapn.inputs["Scale"].default_value = (1.0, 1.0, 1.0)
    l.new(tc.outputs["Generated"], mapn.inputs["Vector"])
    mapn.inputs["Location"].default_value = (-0.5, -0.5, -0.5)
    l.new(mapn.outputs[0], grad.inputs["Vector"])
    rmp.color_ramp.interpolation = "EASE"
    rmp.color_ramp.elements[0].color = (0, 0, 0, 1)
    rmp.color_ramp.elements[1].position, rmp.color_ramp.elements[1].color = 0.55, (1, 1, 1, 1)
    l.new(grad.outputs["Fac"], rmp.inputs[0])
    mul, mul2 = n.new("ShaderNodeMath"), n.new("ShaderNodeMath")
    mul.operation = mul2.operation = "MULTIPLY"
    l.new(rmp.outputs[0], mul.inputs[0])
    l.new(oi.outputs["Alpha"], mul.inputs[1])
    mul2.inputs[1].default_value = alpha
    l.new(mul.outputs[0], mul2.inputs[0])
    tr, em, mx, out = n.new("ShaderNodeBsdfTransparent"), n.new("ShaderNodeEmission"), n.new("ShaderNodeMixShader"), n.new("ShaderNodeOutputMaterial")
    em.inputs[0].default_value = lin(hexc)
    l.new(mul2.outputs[0], mx.inputs[0])
    l.new(tr.outputs[0], mx.inputs[1])
    l.new(em.outputs[0], mx.inputs[2])
    l.new(mx.outputs[0], out.inputs[0])
    return mat


M = {}          # the shared palette; modules add their own with M.setdefault(key, toon(...))


# =============================================================================================
# geometry
# =============================================================================================
class Builder:
    """Parts appended into one bmesh, a material slot each. Topology depends only on the calls made,
    never on positions, so a builder run per frame with a pose gives bake_shapes() matching vertices."""

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

    def rod(self, mat, a, b, r1, r2=None, seg=12, caps=True):
        a, b = Vector(a), Vector(b)
        d = b - a
        if d.length < 1e-6:
            d = Vector((0, 0, 1e-4))
            b = a + d
        q = d.normalized().to_track_quat("Z", "Y").to_matrix().to_4x4()
        m = Matrix.Translation((a + b) / 2) @ q
        self.part(mat, bmesh.ops.create_cone, cap_ends=True, segments=seg, radius1=r1,
                  radius2=r2 if r2 is not None else r1, depth=d.length, matrix=m)
        if caps:
            self.ellipsoid(mat, a, (r1, r1, r1), seg=seg)
            self.ellipsoid(mat, b, ((r2 if r2 is not None else r1),) * 3, seg=seg)

    def cone(self, mat, c, r1, r2, depth, seg=24, rot=None, caps=True):
        m = Matrix.Translation(Vector(c)) @ (rot or Matrix.Identity(4))
        self.part(mat, bmesh.ops.create_cone, cap_ends=caps, segments=seg, radius1=r1, radius2=r2, depth=depth, matrix=m)

    def disc(self, mat, c, r, seg=24, rot=None, scale=(1, 1)):
        m = Matrix.Translation(Vector(c)) @ (rot or Matrix.Identity(4)) @ Matrix.Diagonal((scale[0], scale[1], 1, 1))
        self.part(mat, bmesh.ops.create_circle, cap_ends=True, segments=seg, radius=r, matrix=m)

    def poly(self, mat, pts):
        vs = [self.bm.verts.new(Vector(p)) for p in pts]
        self._tag([self.bm.faces.new(vs)], mat)

    def strip(self, mat, rows):
        """A quad strip/grid from rows of points (all rows the same length)."""
        vs = [[self.bm.verts.new(Vector(p)) for p in r] for r in rows]
        fs = []
        for i in range(len(vs) - 1):
            for j in range(len(vs[i]) - 1):
                fs.append(self.bm.faces.new((vs[i][j], vs[i][j + 1], vs[i + 1][j + 1], vs[i + 1][j])))
        self._tag(fs, mat)

    def coords(self):
        """Vertex positions (for bake_shapes from a builder run per frame); frees the bmesh."""
        out = [v.co.copy() for v in self.bm.verts]
        self.bm.free()
        return out

    def build(self, name, coll, parent=None, smooth=True, loc=(0, 0, 0)):
        me = bpy.data.meshes.new("RP_" + name)
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


# =============================================================================================
# scene reset and collections (only our own datablocks; re-runnable in an open file)
# =============================================================================================
scn = bpy.context.scene


def reset():
    for ob in list(bpy.data.objects):
        if ob.name.startswith("RP_") or ob.name in ("Cube", "Light", "Camera"):
            bpy.data.objects.remove(ob, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.cameras, bpy.data.lights, bpy.data.actions,
                 bpy.data.grease_pencils_v3, bpy.data.node_groups, bpy.data.curves):
        for d in list(coll):
            if d.name.startswith("RP_"):
                coll.remove(d)
    for d in list(bpy.data.shape_keys):
        if d.users == 0:
            try:
                bpy.data.shape_keys.remove(d)
            except (AttributeError, RuntimeError):
                pass


def collection(name):
    c = bpy.data.collections.get(name) or bpy.data.collections.new(name)
    if c.name not in scn.collection.children:
        scn.collection.children.link(c)
    return c


reset()
COL_CAR = collection("RP_Car")
COL_INST = collection("RP_Installs")
COL_PLAYA = collection("RP_Playa")
COL_WORLD = collection("RP_World")
CAR = None          # set by rp_car.build()
