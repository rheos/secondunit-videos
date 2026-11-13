# New City look test, rebuilt in Blender 4.5 (EEVEE) from the approved three.js v2 (js/story2.js, js/ink.js,
# js/main.js), to compare the two engines on the same 19.5 s. Same song section, word onsets, CC0 models, cobalt
# palette and colour arc, motif yellow, four shots and camera paths. What changes is the engine: a real sun with
# cast shadows thresholded into three inks (Diffuse > Shader to RGB > two steps), EEVEE depth of field and motion
# blur, and the paper, weave, softness and vignette done in the compositor.
#
# All scene maths is written in three.js coordinates (y up, camera looking down -z) under one root empty turned
# +90 degrees about X, so story2.js ports line for line. Every value is a pure function of song time t; the script
# samples it per frame (plus both sides of each cut) into linear keys. The door wave runs in geometry nodes off
# Scene Time, so it is exact at every motion-blur step.
#
#   blender -b --factory-startup --python blender/newcity_blender.py -- --stills 48,150,270,400 --tag s1
#   blender -b --factory-startup --python blender/newcity_blender.py -- --save out/blender/newcity.blend
#   blender -b --factory-startup --python blender/newcity_blender.py -- --calib
#
# Options: --res 50 (percent), --samples 32, --mbsteps 2, --nomb, --nodof, --noshadow, --cal 1.0, --tag NAME.
# Words come from work/words.settled.json (gitignored; it quotes the lyric). Renders go to out/blender/ (gitignored).
import bpy, bmesh, json, math, os, sys, time
import numpy as np
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
OUT = os.path.join(PROJ, "out", "blender")
FPS = 24
F_LAST = 467                      # song frames 0..467 = 0:00.0-0:19.5, as the three.js cut
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def opt(name, default=None):
    if name in argv:
        i = argv.index(name)
        return argv[i + 1] if i + 1 < len(argv) and not argv[i + 1].startswith("--") else True
    return default

# ---------------------------------------------------------------------------------------------------------------
# small maths, as story2.js
clamp = lambda x, a=0.0, b=1.0: min(b, max(a, x))
ease = lambda x: 1 - (1 - clamp(x)) ** 3
def easeIO(x):
    x = clamp(x); return 4 * x * x * x if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
lerp = lambda a, b, k: a + (b - a) * k
def rng(seed):                                  # city.js rng, bit for bit
    s = [(seed & 0xffffffff) or 1]
    def r():
        s[0] = (s[0] * 1664525 + 1013904223) & 0xffffffff
        return s[0] / 4294967296
    return r
jround = lambda x: math.floor(x + 0.5)          # JS Math.round

WORDS = json.load(open(os.path.join(PROJ, "work", "words.settled.json")))
LINES = WORDS["lines"]
cut = lambda i: LINES[i][0]["s"] - 0.45

# ---------------------------------------------------------------------------------------------------------------
# palette. three.js r160 set each hex (sRGB -> linear, ColorManagement) and then called convertSRGBToLinear again,
# and its finish pass encodes once, so the approved cut shows lin(hex) as display values. To match what Robin
# approved, the scene-linear ink here is lin(lin(hex)); the Standard view transform encodes it to lin(hex).
ARC = [(0.0, ["#e6e5dc", "#2c5aa0", "#21252f"]), (9.0, ["#ece4cf", "#2f5c9e", "#24242c"]), (16.0, ["#f2e2ba", "#34529f", "#2a2424"])]
MOTIF = "#e9c43a"
hexrgb = lambda h: [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
s2l = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def lin2(rgb): return tuple(s2l(s2l(c)) for c in rgb)
def inks(t):
    k = 0
    while k < len(ARC) - 1 and t > ARC[k + 1][0]: k += 1
    if k == len(ARC) - 1: cols = [hexrgb(h) for h in ARC[k][1]]
    else:
        (t0, p0), (t1, p1) = ARC[k], ARC[k + 1]; u = clamp((t - t0) / (t1 - t0)); u = u * u * (3 - 2 * u)
        cols = [[lerp(a, b, u) for a, b in zip(hexrgb(x), hexrgb(y))] for x, y in zip(p0, p1)]
    # three lerps the once-linearised colours; lerping first differs by under 1/255 over these close keys
    return {"cream": lin2(cols[0]), "red": lin2(cols[1]), "black": lin2(cols[2]), "motif": lin2(hexrgb(MOTIF))}

LIGHT = Vector((-0.72, 0.55, 0.3)).normalized()   # ink.js light, three.js coords

# ---------------------------------------------------------------------------------------------------------------
# scene reset and root
def reset():
    for ob in list(bpy.data.objects): bpy.data.objects.remove(ob, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.curves, bpy.data.cameras, bpy.data.lights,
                 bpy.data.node_groups, bpy.data.actions, bpy.data.images, bpy.data.collections):
        for d in list(coll): coll.remove(d)
SC = bpy.context.scene
reset()
ROOT = bpy.data.objects.new("NC_ROOT", None); SC.collection.objects.link(ROOT)
ROOT.rotation_euler = (math.pi / 2, 0, 0)          # three (x, y, z) -> Blender (x, -z, y)
LIB = bpy.data.collections.new("NC_LIB"); SC.collection.children.link(LIB); LIB.hide_render = True

def obj(name, data=None, parent=ROOT, coll=None):
    ob = bpy.data.objects.new(name, data); (coll or SC.collection).objects.link(ob)
    ob.parent = parent; ob.rotation_mode = "ZYX"     # = three.js Euler order XYZ
    return ob

# ---------------------------------------------------------------------------------------------------------------
# geometry builder in three.js coordinates (city.js, ported)
T = lambda x, y, z: Matrix.Translation((x, y, z))
S = lambda x, y, z: Matrix.Diagonal((x, y, z, 1))
RY = lambda a: Matrix.Rotation(a, 4, "Y")
RX = lambda a: Matrix.Rotation(a, 4, "X")
class Geo:
    def __init__(s): s.bm = bmesh.new()
    def box(s, w, h, d, x, y, z, ry=0.0):       # bottom at y, as city.js box()
        bmesh.ops.create_cube(s.bm, size=1.0, matrix=T(x, y + h / 2, z) @ RY(ry) @ S(w, h, d)); return s
    def boxc(s, w, h, d, M=Matrix()):           # centred box (BoxGeometry)
        bmesh.ops.create_cube(s.bm, size=1.0, matrix=M @ S(w, h, d)); return s
    def cyl(s, r1, r2, h, M, seg=24):           # along y, centred; r1 bottom, r2 top
        bmesh.ops.create_cone(s.bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r1, radius2=r2, depth=h, matrix=M @ RX(-math.pi / 2)); return s
    def sphere(s, r, M, u=12, v=8):
        bmesh.ops.create_uvsphere(s.bm, u_segments=u, v_segments=v, radius=r, matrix=M); return s
    def beam(s, a, b, t):
        d = b - a; L = d.length; q = Vector((0, 1, 0)).rotation_difference(d.normalized()); m = (a + b) / 2
        return s.boxc(t, L, t, T(*m) @ q.to_matrix().to_4x4())
    def limb(s, a, b, r):                        # CapsuleGeometry stand-in: tube and two balls
        d = b - a; L = max(0.001, d.length); q = Vector((0, 1, 0)).rotation_difference(d.normalized()); m = (a + b) / 2
        s.cyl(r, r, L, T(*m) @ q.to_matrix().to_4x4(), seg=8); s.sphere(r, T(*a), 8, 6); s.sphere(r, T(*b), 8, 6); return s
    def plane(s, w, h):                          # PlaneGeometry: XY, facing +z
        vs = [s.bm.verts.new(p) for p in ((-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0))]
        s.bm.faces.new(vs); return s
    def mesh(s, name, mats=()):
        me = bpy.data.meshes.new(name); s.bm.to_mesh(me); s.bm.free()
        for m in mats: me.materials.append(m)
        for p in me.polygons: p.use_smooth = False
        return me

def crane(g, loads, r, x, z, s=1.0, swing=0.0):
    H = (14 + r() * 8) * s; w = 0.9 * s; t = 0.09 * s; n = jround(H / w)
    c = [(x + a * w / 2, z + b * w / 2) for a, b in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    V = lambda a, b, cc: Vector((a, b, cc))
    for cx, cz in c: g.beam(V(cx, 0, cz), V(cx, H, cz), t)
    for i in range(n):
        y0, y1 = i * w, (i + 1) * w
        for k in range(4):
            (ax, az), (bx, bz) = c[k], c[(k + 1) % 4]
            g.beam(V(ax, y0, az), V(bx, y1, bz), t * 0.7); g.beam(V(ax, y1, az), V(bx, y1, bz), t * 0.7)
    dr = V(math.cos(swing), 0, math.sin(swing)); top = V(x, H, z); up = V(0, 1, 0)
    L = (10 + r() * 6) * s; Lc = L * 0.35
    tip = top + dr * L; back = top - dr * Lc; peak = top + up * 3 * s
    g.beam(back, tip, t * 2.2); g.beam(top - up * 0.6 * s, tip, t * 1.2)
    for i in range(1, 9): g.beam(top + dr * (L * i / 8), top + dr * (L * (i - .5) / 8) - up * 0.6 * s, t)
    g.beam(top, peak, t * 1.5); g.beam(peak, tip, t * 0.6); g.beam(peak, back, t * 0.6)
    g.box(1.6 * s, 1.4 * s, 1.4 * s, back.x, back.y - 1.4 * s, back.z)
    hook = top + dr * (L * (0.55 + r() * 0.3)); drop = (5 + r() * 6) * s
    g.beam(hook, hook - up * drop, t * 0.5); g.box(0.5 * s, 0.5 * s, 0.5 * s, hook.x, hook.y - drop - 0.5 * s, hook.z)
    loads.box(2.6 * s, 1.1 * s, 1.4 * s, hook.x, hook.y - drop - 1.7 * s, hook.z)

def person(g, pose=0):
    V = lambda a, b, c: Vector((a, b, c))
    g.limb(V(-.12, .05, 0), V(-.16, .85, 0), .09); g.limb(V(.12, .05, 0), V(.14, .85, 0), .09)
    g.cyl(.17, .2, .75, T(0, 1.25, 0), seg=10); g.sphere(.15, T(0, 1.82, 0), 12, 8)
    g.limb(V(-.24, 1.55, 0), V(-.3, .95, .05), .065)
    g.limb(V(.24, 1.55, 0), V(.42, 2.3, .05) if pose else V(.3, .95, .05), .065)

# ---------------------------------------------------------------------------------------------------------------
# models: glTF import, every mesh baked and merged, back to y-up, fitted to height h, feet on 0, centred (ink.js)
M_DIR = os.path.join(PROJ, "assets", "models")
_raw = {}
def model_raw(name):
    if name in _raw: return _raw[name]
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(M_DIR, name + ".glb"))
    new = [o for o in bpy.data.objects if o not in before]
    bm = bmesh.new()
    for o in new:
        if o.type == "MESH" and not any(m.type == "ARMATURE" for m in o.modifiers):
            me = o.data.copy(); me.transform(o.matrix_world); bm.from_mesh(me); bpy.data.meshes.remove(me)
    for o in new: bpy.data.objects.remove(o, do_unlink=True)
    bmesh.ops.transform(bm, matrix=RX(-math.pi / 2), verts=bm.verts)       # Blender z-up -> three y-up
    xs = [v.co for v in bm.verts]
    lo = Vector((min(p.x for p in xs), min(p.y for p in xs), min(p.z for p in xs)))
    hi = Vector((max(p.x for p in xs), max(p.y for p in xs), max(p.z for p in xs)))
    _raw[name] = (bm, lo, hi); return _raw[name]
_geo = {}
def model_mesh(name, h, mat):
    key = (name, h, mat.name)
    if key in _geo: return _geo[key]
    bm0, lo, hi = model_raw(name); size = hi - lo; s = h / size.y
    bm = bm0.copy()
    bmesh.ops.transform(bm, matrix=S(s, s, s) @ T(-(lo.x + size.x / 2), -lo.y, -(lo.z + size.z / 2)), verts=bm.verts)
    me = bpy.data.meshes.new(f"NC_{name}_{mat.name}"); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = False; p.material_index = 0
    me.materials.append(mat)
    _geo[key] = (me, max(size.x, size.z) * s); return _geo[key]

# ---------------------------------------------------------------------------------------------------------------
# type: Anton (OFL) as flat filled meshes, cap height 1, baseline y = 0, centred on x (type.js printWord)
FONT = bpy.data.fonts.load(os.path.join(PROJ, "fonts", "Anton-Regular.ttf"))
def _text_mesh(txt, name):
    cu = bpy.data.curves.new("tmp", "FONT"); cu.body = txt; cu.font = FONT; cu.align_x = "CENTER"; cu.size = 1.0
    cu.resolution_u = 6; cu.space_character = 1.03
    o = bpy.data.objects.new("tmp", cu); SC.collection.objects.link(o)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(o.evaluated_get(dg)); me.name = name
    bpy.data.objects.remove(o, do_unlink=True); bpy.data.curves.remove(cu)
    return me
_cap = [None]
def word_mesh(txt):
    if _cap[0] is None:
        h = _text_mesh("H", "tmpH"); ys = [v.co.y for v in h.vertices]; _cap[0] = max(ys) - min(ys); bpy.data.meshes.remove(h)
    me = _text_mesh(txt.upper(), "NC_w_" + txt)
    me.transform(S(1 / _cap[0], 1 / _cap[0], 1 / _cap[0]))
    xs = [v.co.x for v in me.vertices]; w = max(xs) - min(xs)
    for p in me.polygons: p.use_smooth = False
    return me, w

# ---------------------------------------------------------------------------------------------------------------
# materials. One node group holds the four inks; the colour arc keys its RGB nodes.
INKG = bpy.data.node_groups.new("NC_INKS", "ShaderNodeTree")
gout = INKG.nodes.new("NodeGroupOutput")
INK_NODE = {}
for i, k in enumerate(("cream", "red", "black", "motif")):
    INKG.interface.new_socket(k, in_out="OUTPUT", socket_type="NodeSocketColor")
    n = INKG.nodes.new("ShaderNodeRGB"); n.name = k; n.location = (-300, -200 * i)
    INKG.links.new(n.outputs[0], gout.inputs[i]); INK_NODE[k] = n

def _sock(sockets, ident): return next(s for s in sockets if s.identifier == ident)
def _mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial"); g = nt.nodes.new("ShaderNodeGroup"); g.node_tree = INKG
    return m, nt, out, g
def flat(key):
    m, nt, out, g = _mat(f"NC_flat_{key}")
    e = nt.nodes.new("ShaderNodeEmission"); nt.links.new(g.outputs[key], e.inputs["Color"]); e.inputs["Strength"].default_value = 1
    nt.links.new(e.outputs[0], out.inputs["Surface"])
    return m
CAL = float(opt("--cal", math.pi))       # sun strength that gives Shader to RGB = 1 on a face square to the light
def ink(name, hi, mid, lo, t1=-0.05, t2=0.45, rough=0.12):
    """ink.js inkMaterial: l = light on the face (here a real sun, so cast shadows count), plus world noise,
    thresholded at t1 and t2 into lo, mid and hi."""
    m, nt, out, g = _mat(f"NC_ink_{name}"); N, L = nt.nodes, nt.links
    d = N.new("ShaderNodeBsdfDiffuse"); d.inputs["Color"].default_value = (1, 1, 1, 1); d.inputs["Roughness"].default_value = 0
    s2 = N.new("ShaderNodeShaderToRGB"); L.new(d.outputs[0], s2.inputs[0])
    bw = N.new("ShaderNodeRGBToBW"); L.new(s2.outputs["Color"], bw.inputs[0])
    geo = N.new("ShaderNodeNewGeometry")
    def noise(scale):
        n = N.new("ShaderNodeTexNoise"); n.noise_dimensions = "3D"; n.inputs["Scale"].default_value = scale
        n.inputs["Detail"].default_value = 0; n.inputs["Distortion"].default_value = 0; L.new(geo.outputs["Position"], n.inputs["Vector"]); return n
    def math_(op, a, b):
        n = N.new("ShaderNodeMath"); n.operation = op
        for i, v in enumerate((a, b)):
            if isinstance(v, (int, float)): n.inputs[i].default_value = v
            else: L.new(v, n.inputs[i])
        return n.outputs[0]
    n1 = math_("MULTIPLY", math_("SUBTRACT", noise(1.7).outputs["Fac"], .5), rough)
    n2 = math_("MULTIPLY", math_("SUBTRACT", noise(7.3).outputs["Fac"], .5), rough * .5)
    v = math_("ADD", bw.outputs[0], math_("ADD", n1, n2))
    st1, st2 = math_("GREATER_THAN", v, t1), math_("GREATER_THAN", v, t2)
    def mix(fac, a, b):
        n = N.new("ShaderNodeMix"); n.data_type = "RGBA"; L.new(fac, _sock(n.inputs, "Factor_Float"))
        L.new(a, _sock(n.inputs, "A_Color")); L.new(b, _sock(n.inputs, "B_Color")); return _sock(n.outputs, "Result_Color")
    c = mix(st2, mix(st1, g.outputs[lo], g.outputs[mid]), g.outputs[hi])
    e = N.new("ShaderNodeEmission"); L.new(c, e.inputs["Color"]); L.new(e.outputs[0], out.inputs["Surface"])
    return m

FLAT = {k: flat(k) for k in ("cream", "red", "black", "motif")}

# ---------------------------------------------------------------------------------------------------------------
# keys: every animated value is sampled from the story at these times and written as linear keys
KEYS = {}                       # (datablock, path, index) -> [(frame, value)]
FRAME = [0.0]
def rec(idb, path, val, index=None):
    if isinstance(val, (tuple, list, Vector)) or hasattr(val, "__len__"):
        for i, v in enumerate(val): KEYS.setdefault((idb, path, i), []).append((FRAME[0], float(v)))
    else: KEYS.setdefault((idb, path, index or 0), []).append((FRAME[0], float(val)))
CONST_PATHS = {"hide_render", "hide_viewport"}

def place(ob, pos=(0, 0, 0), rot=(0, 0, 0), scl=None):
    ob.location = pos; ob.rotation_euler = rot
    if scl is not None: ob.scale = scl
    return ob
def word(txt, mat, cap=1.0, stretch=1.0, parent=ROOT):
    me, w = word_mesh(txt); me.materials.append(mat)
    ob = obj(f"NC_w_{txt}", me, parent=parent); ob.scale = (cap, cap * stretch, cap)
    ob["width"] = w; return ob
def mesh_obj(name, me, parent=ROOT): return obj(name, me, parent=parent)

def points_obj(name, pts, attrs, parent=ROOT):
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(p) for p in pts], [], [])
    for an, (typ, vals) in attrs.items():
        a = me.attributes.new(an, typ, "POINT"); a.data.foreach_set("value", vals)
    return obj(name, me, parent=parent)

def gn_instancer(ob, src, rot_expr=None, pick=False):
    """Instance src (an object, or a collection with pick=True) on ob's points. Rotation (0, ry, 0) from the
    'ry' attribute, uniform scale from 'scl'. rot_expr(tree, ry_socket) may replace the y rotation."""
    ng = bpy.data.node_groups.new(ob.name + "_gn", "GeometryNodeTree")
    ng.interface.new_socket("Geometry", in_out="INPUT", socket_type="NodeSocketGeometry")
    ng.interface.new_socket("Geometry", in_out="OUTPUT", socket_type="NodeSocketGeometry")
    N, L = ng.nodes, ng.links
    gi, go = N.new("NodeGroupInput"), N.new("NodeGroupOutput")
    iop = N.new("GeometryNodeInstanceOnPoints"); L.new(gi.outputs[0], iop.inputs["Points"]); L.new(iop.outputs[0], go.inputs[0])
    if pick:
        ci = N.new("GeometryNodeCollectionInfo"); ci.inputs["Collection"].default_value = src
        ci.inputs["Separate Children"].default_value = True; ci.inputs["Reset Children"].default_value = True
        L.new(ci.outputs[0], iop.inputs["Instance"]); iop.inputs["Pick Instance"].default_value = True
        ka = N.new("GeometryNodeInputNamedAttribute"); ka.data_type = "INT"; ka.inputs["Name"].default_value = "kind"
        L.new(ka.outputs["Attribute"], iop.inputs["Instance Index"])
    else:
        oi = N.new("GeometryNodeObjectInfo"); oi.inputs["Object"].default_value = src; oi.transform_space = "ORIGINAL"
        L.new(oi.outputs["Geometry"], iop.inputs["Instance"])
    ra = N.new("GeometryNodeInputNamedAttribute"); ra.data_type = "FLOAT"; ra.inputs["Name"].default_value = "ry"
    ry = ra.outputs["Attribute"]
    if rot_expr: ry = rot_expr(ng, ry)
    cx = N.new("ShaderNodeCombineXYZ"); L.new(ry, cx.inputs["Y"]); L.new(cx.outputs[0], iop.inputs["Rotation"])
    sa = N.new("GeometryNodeInputNamedAttribute"); sa.data_type = "FLOAT"; sa.inputs["Name"].default_value = "scl"
    L.new(sa.outputs["Attribute"], iop.inputs["Scale"])
    mod = ob.modifiers.new("inst", "NODES"); mod.node_group = ng
    return ob

BUILDINGS = ["tower-slim", "tower-crown", "office-a", "office-b", "office-c", "office-d", "flats-a", "flats-b", "flats-c", "flats-d", "factory"]
_libs = {}
def building_lib(mat):
    if mat.name in _libs: return _libs[mat.name]
    c = bpy.data.collections.new("NC_LIB_" + mat.name); LIB.children.link(c)
    fps = []
    for i, b in enumerate(BUILDINGS):
        me, fp = model_mesh(b, 10, mat); o = bpy.data.objects.new(f"NC_{i:02d}_{b}_{mat.name}", me); c.objects.link(o); fps.append(fp)
    _libs[mat.name] = (c, fps); return _libs[mat.name]

def rows_of_buildings(name, mat, seed=1, x0=12, x1=160, z0=10, z1=-600, h=(10, 30), gap=4, parent=ROOT):
    """story2.js rowsOfBuildings, same RNG sequence, instanced with geometry nodes."""
    c, fps = building_lib(mat); r = rng(seed); pts, kinds, rys, scls = [], [], [], []
    for side in (-1, 1):
        x = x0
        while x < x1:
            fp = 0; z = z0
            while z > z1:
                k = math.floor(r() * len(BUILDINGS)); H = lerp(h[0], h[1], r()) * (1.6 if fps[k] < 6 else 1)
                s = H / 10; f = fps[k] * s
                pts.append((side * (x + f / 2), 0, z - f / 2)); kinds.append(k); rys.append(math.floor(r() * 4) * math.pi / 2); scls.append(s)
                z -= f + gap * (0.5 + r()); fp = max(fp, f)
            x += fp + gap * 2
    ob = points_obj(name, pts, {"kind": ("INT", kinds), "ry": ("FLOAT", rys), "scl": ("FLOAT", scls)}, parent)
    return gn_instancer(ob, c, pick=True)

def instances(name, me, items, parent=ROOT, rot_expr=None):
    """items: (x, y, z, ry, scale). One hidden source object, instanced on points."""
    src = bpy.data.objects.new(name + "_src", me); LIB.objects.link(src)
    ob = points_obj(name, [(x, y, z) for x, y, z, _, _ in items], {"ry": ("FLOAT", [i[3] for i in items]), "scl": ("FLOAT", [i[4] for i in items])}, parent)
    return gn_instancer(ob, src, rot_expr=rot_expr)

# ---------------------------------------------------------------------------------------------------------------
# camera
CAM = obj("NC_cam", bpy.data.cameras.new("NC_cam")); SC.camera = CAM
CAM.rotation_mode = "XYZ"
cd = CAM.data; cd.sensor_fit = "VERTICAL"; cd.sensor_height = 24.0; cd.sensor_width = 24.0 * 16 / 9
cd.clip_start = 0.5; cd.clip_end = 3000; cd.dof.use_dof = not opt("--nodof"); cd.dof.aperture_blades = 0
_prev_eul = [None]
CAM_ON = [True]                 # only the active shot writes the camera
def camera(pos, at, roll, fov, focus, aperture):
    """three.js: cam.position, lookAt(at) with up +y, rotateZ(roll); fov vertical. DOF matched to main.js:
    its CoC radius |1/focus - 1/z| * aperture * H / 2 px equals a thin lens of diameter 2 * aperture * tan(fov/2)."""
    if not CAM_ON[0]: return
    pos, at = Vector(pos), Vector(at)
    z = (pos - at).normalized(); x = Vector((0, 1, 0)).cross(z).normalized(); y = z.cross(x)
    R = Matrix((x, y, z)).transposed() @ Matrix.Rotation(roll, 3, "Z")
    e = R.to_euler("XYZ", _prev_eul[0]) if _prev_eul[0] else R.to_euler("XYZ"); _prev_eul[0] = e
    rec(CAM, "location", pos); rec(CAM, "rotation_euler", e)
    tanh = math.tan(math.radians(fov) / 2); lens = 12.0 / tanh
    rec(cd, "lens", lens); rec(cd, "dof.focus_distance", focus)
    rec(cd, "dof.aperture_fstop", (lens / 1000) / (2 * aperture * tanh) if aperture > 0 else 1000.0)

# ---------------------------------------------------------------------------------------------------------------
# the four shots (story2.js). Each appends (start time, ground ink, update(t, active)).
SHOTS = []
def vis(ob, on): rec(ob, "hide_render", 0.0 if on else 1.0); rec(ob, "hide_viewport", 0.0 if on else 1.0)
def pop_scale(ob, t, s, base):
    p = 1 + 0.12 * (1 - ease((t - s) / 0.12)); rec(ob, "scale", tuple(b * p for b in base))
def stamp(ob, t, s, active):
    vis(ob, active and t >= s - 1 / 24); pop_scale(ob, t, s, tuple(ob["base"]))

def shot_a():
    L = LINES[0]; objs = []
    on_cream = ink("onCream", "cream", "red", "black", .42, .96, .07)
    on_cream_dark = ink("onCreamDark", "red", "black", "black", .2, .55)
    s0 = L[0]["s"] - .45; v = 21; camZ0 = 16; lastS = L[-1]["s"]
    def zcam(t):
        tt = min(t, lastS); z = camZ0 - v * (tt - s0)
        return z if t <= tt else z - v * .9 * (1 - math.exp(-(t - tt) / .9))
    lead = 34; slabZ = zcam(lastS) - 46; cardW = 22
    card = mesh_obj("A_card", Geo().plane(cardW, camZ0 + 40 - slabZ).mesh("A_card", [FLAT["red"]]))
    place(card, (0, .02, (camZ0 + 40 + slabZ) / 2), (-math.pi / 2, 0, 0)); objs.append(card)
    slab = place(mesh_obj("A_slab", Geo().boxc(46, 70, 2).mesh("A_slab", [on_cream_dark])), (0, 35, slabZ - 1))
    slabFace = place(mesh_obj("A_slabface", Geo().plane(46, 70).mesh("A_slabface", [FLAT["red"]])), (0, 35, slabZ + .02))
    objs += [slab, slabFace]
    for z, a, w in ((-8, .5, 2.2), (-60, -.42, 3), (-110, .35, 1.6)):
        b = place(mesh_obj("A_bar", Geo().plane(400, w).mesh("A_bar", [FLAT["black"]])), (0, .03, z), (-math.pi / 2, 0, a))
        rl = place(mesh_obj("A_rule", Geo().plane(400, w * .12).mesh("A_rule", [FLAT["cream"]])), (0, .04, z + w * .3), (-math.pi / 2, 0, a))
        objs += [b, rl]
    words = []
    for i, w in enumerate(L):
        if i == len(L) - 1:
            m = word(w["w"], FLAT["cream"]); cap = 40 / m["width"]; m.scale = (cap, cap, cap)
            m.location = (0, 38, slabZ + .06); m["s"] = w["s"]; m["slab"] = 1; words.append(m); continue
        m = word(w["w"], FLAT["cream"], 1, 1.9); cap = min(6.2, cardW * .82 / m["width"])
        place(m, (0, .06, zcam(w["s"]) - lead), (-math.pi / 2, 0, 0), (cap, cap * 1.9, cap)); m["s"] = w["s"]; m["slab"] = 0; words.append(m)
    for i in range(1, len(words) - 1):
        if L[i]["s"] - L[i - 1]["s"] < .35:
            a, b = words[i - 1], words[i]; b.location.z = a.location.z
            wa, wb = a["width"] * a.scale.x, b["width"] * b.scale.x; tot = wa + 1.2 + wb
            a.location.x = -tot / 2 + wa / 2; b.location.x = tot / 2 - wb / 2
    for m in words: m["base"] = tuple(m.scale)
    objs += [m for m in words]
    objs.append(rows_of_buildings("A_rows", on_cream, seed=3, x0=cardW / 2 + 10, z0=camZ0 + 10, z1=-700, h=(7, 20)))
    pyl, _ = model_mesh("pylon-a", 34, on_cream); wt, _ = model_mesh("water-tower", 18, on_cream)
    objs.append(instances("A_pylons", pyl, [(x, 0, z, ry, 1) for x, z, ry in ((-cardW / 2 - 6, -70, .3), (cardW / 2 + 6, -130, -.2), (-cardW / 2 - 6, -190, .1), (cardW / 2 + 6, -250, 0))]))
    r = rng(8); items = []
    for i in range(6):
        x = (1 if i % 2 else -1) * (cardW / 2 + 5 + r() * 3); items.append((x, 0, -40 - i * 45, r() * 3, 1))
    objs.append(instances("A_watertowers", wt, items))
    rc = rng(5); cg, lg = Geo(), Geo()
    crane(cg, lg, rc, -32, slabZ + 6, 2.2, .35); crane(cg, lg, rc, 36, slabZ - 14, 2.0, 2.6)
    objs.append(mesh_obj("A_cranes", cg.mesh("A_cranes", [on_cream])))
    objs.append(mesh_obj("A_loads", lg.mesh("A_loads", [ink("loads", "cream", "motif", "black", 0.0, .9, .05)])))
    plain = [o for o in objs if o not in words]
    def update(t, active):
        for o in plain: vis(o, active)
        rise = easeIO((t - (lastS - .95)) / .95)
        sy = max(.001, rise)
        rec(slab, "scale", (1, sy, 1)); rec(slab, "location", (0, 35 * rise, slabZ - 1))
        rec(slabFace, "scale", (1, sy, 1)); rec(slabFace, "location", (0, 35 * rise, slabZ + .02))
        for m in words:
            if m["slab"]:
                rec(m, "location", (0, 38 - 70 * (1 - rise), slabZ + .06)); vis(m, active and rise > .98); continue
            k = clamp((t - m["s"]) / (2 / 24) + 1); vis(m, active and k > 0); pop_scale(m, t, m["s"], m["base"])
        z = zcam(t); up = easeIO((t - (lastS - .9)) / 1.4)
        camera((math.sin(t * .9) * 1.2, lerp(4.6, 6, up), z), (lerp(1.5, 0, up), lerp(0, 30, up), z - lerp(40, 46, up)),
               lerp(-.42, -.12, up) + math.sin(t * .7) * .03, 66, lerp(32, 46, up), 1.3)
    SHOTS.append((-1.0, "cream", update))

def shot_b():
    L = LINES[1]; s0 = cut(1); sDoor = L[-1]["s"]; objs = []
    on_blue = ink("onBlue", "cream", "black", "black", .5, .5, .06)
    ow, oh, post, lint, D = 10, 13, 1.6, 4.6, 1.4
    gates = []
    for i, w in enumerate(L):
        if i and w["s"] - L[i - 1]["s"] < .3: gates[-1]["words"].append(i)
        else: gates.append({"s": w["s"], "words": [i]})
    V, AHEAD, BACK = 85, 28, 11
    gateZ = []
    for k, gt in enumerate(gates): gateZ.append(gateZ[k - 1] - max(18, V * (gt["s"] - gates[k - 1]["s"])) if k else -18)
    lastZ = gateZ[-1]
    keys = [(gt["s"], gateZ[k] + AHEAD - BACK) for k, gt in enumerate(gates)] + [(sDoor, lastZ + AHEAD - BACK - 9)]
    def camz(t):
        if t <= keys[0][0]: return keys[0][1] + V * (keys[0][0] - t)
        for i in range(len(keys) - 1):
            if t < keys[i + 1][0]: return lerp(keys[i][1], keys[i + 1][1], (t - keys[i][0]) / (keys[i + 1][0] - keys[i][0]))
        tl, zl = keys[-1]; return zl - V * 1.1 * (1 - math.exp(-(t - tl) / 1.1))
    frame = Geo().box(post, oh + lint, D, -(ow + post) / 2, 0, 0).box(post, oh + lint, D, (ow + post) / 2, 0, 0).box(ow + 2 * post, lint, D, 0, oh, 0)
    spots = [(0, z, 0) for z in gateZ]; r = rng(21); z = -40
    while z > -720:
        x = -280
        while x <= 280:
            if not (abs(x) < 46 and z > lastZ - 60): spots.append((x + (r() - .5) * 5, z + (r() - .5) * 6, (r() - .5) * .25))
            x += 21
        z -= 26
    objs.append(instances("B_frames", frame.mesh("B_frame", [on_blue]), [(x, 0, z, ry, 1) for x, z, ry in spots]))
    # door leaves: hinge at the post; the -z face (BoxGeometry group 5) is yellow. The swing is a pure function of
    # Scene Time in geometry nodes: a = 1.35 * ease((t - (sDoor - .05) - d / 110) / .55), d = distance to the last gate
    lw = ow / 2 - .15
    def leaf(dx):
        me = Geo().boxc(lw, oh - .2, .35, T(dx, oh / 2, 0)).mesh("B_leaf", [on_blue, FLAT["motif"]])
        for p in me.polygons: p.material_index = 1 if p.normal.z < -.9 else 0
        return me
    def swing(sign):
        def f(ng, ry):
            N, Lk = ng.nodes, ng.links
            def m(op, a, b):
                n = N.new("ShaderNodeMath"); n.operation = op
                for i, v in enumerate((a, b)):
                    if isinstance(v, (int, float)): n.inputs[i].default_value = v
                    else: Lk.new(v, n.inputs[i])
                return n.outputs[0]
            st = N.new("GeometryNodeInputSceneTime")
            da = N.new("GeometryNodeInputNamedAttribute"); da.data_type = "FLOAT"; da.inputs["Name"].default_value = "d"
            x = m("DIVIDE", m("SUBTRACT", m("SUBTRACT", st.outputs["Seconds"], sDoor - .05), m("DIVIDE", da.outputs["Attribute"], 110.0)), .55)
            x = m("MINIMUM", m("MAXIMUM", x, 0.0), 1.0)
            e = m("SUBTRACT", 1.0, m("POWER", m("SUBTRACT", 1.0, x), 3.0))
            return m("ADD", ry, m("MULTIPLY", e, 1.35 * sign))
        return f
    for name, dx, sgn in (("B_leafL", lw / 2, -1), ("B_leafR", -lw / 2, 1)):
        pts, ds = [], []
        for x, z, ry in spots:
            hx, hz = (ow / 2) * math.cos(ry), -(ow / 2) * math.sin(ry)
            pts.append((x + sgn * hx, 0, z + sgn * hz, ry, 1)); ds.append(math.hypot(x, z - lastZ))
        o = instances(name, leaf(dx), pts, rot_expr=swing(sgn))
        a = o.data.attributes.new("d", "FLOAT", "POINT"); a.data.foreach_set("value", ds); objs.append(o)
    words = [word(w["w"], FLAT["cream"]) for w in L]
    for m, w in zip(words, L): m["s"] = w["s"]
    for k, gt in enumerate(gates):
        ms = [words[i] for i in gt["words"]]; gw = .35
        tot = sum(m["width"] for m in ms) + gw * (len(ms) - 1)
        cap = min(lint * .6, (ow + 2 * post) * .84 / tot); x = -tot * cap / 2
        for m in ms:
            m.scale = (cap, cap, cap); m.location = (x + m["width"] * cap / 2, oh + lint / 2 - cap / 2, gateZ[k] + D / 2 + .05)
            x += (m["width"] + gw) * cap
    for m in words: m["base"] = tuple(m.scale)
    objs.append(rows_of_buildings("B_rows", on_blue, seed=9, x0=2, z0=-760, z1=-1300, h=(10, 26)))
    def update(t, active):
        for o in objs: vis(o, active)
        for m in words: stamp(m, t, m["s"], active)
        z = camz(t); rise = easeIO((t - (sDoor + .25)) / 2.4); k = clamp((t - s0) / (cut(2) - s0))
        camera((math.sin(t * 1.2) * .6, lerp(6.4, 34, rise), z + lerp(11, 30, rise)), (0, lerp(12.5, 0, rise), z - lerp(40, 70, rise)),
               lerp(-.3, .14, k) + math.sin(t * .8) * .03, 60, lerp(34, 75, rise), 1.1)
    SHOTS.append((s0, "red", update))

def shot_c():
    L = LINES[2]; s0 = cut(2); sLast = L[-1]["s"]; objs = []
    on_dark = ink("onDark", "cream", "red", "black", 0.0, .65, .06)
    C = Vector((0, 0, -30)); BW, BH = 8, 1.4
    def bar(ang, y, ln=340, w=BW, dz=0):
        h = obj("C_bar", None); place(h, (C.x, y, C.z + dz), (0, ang, 0))
        b = place(mesh_obj("C_barbox", Geo().boxc(ln, BH, w).mesh("C_barbox", [on_dark]), parent=h), (0, BH / 2, 0))
        objs.append(b); h["top"] = BH + .02; return h
    A, B = bar(.45, 0), bar(-.62, BH)
    for ang, dz, w in ((1.2, -90, 3), (-.15, -150, 4), (.9, 40, 2.5), (-1.1, -220, 3)): bar(ang, 0, 420, w, dz)
    def along(h, m, x, z=0.0):
        m.parent = h; place(m, (x, h["top"] + .03, z), (-math.pi / 2, 0, 0)); return m
    def rule(h, mat, z, w): objs.append(along(h, mesh_obj("C_rule", Geo().plane(340, w).mesh("C_rule", [mat])), 0, z))
    rule(A, FLAT["cream"], BW * .38, .3); rule(B, FLAT["motif"], -BW * .4, .45)
    wW, wWar, wM, wL = L
    def fit(m, cap): m.scale = (cap, cap, cap); return m
    mWhere = along(A, fit(word(wW["w"], FLAT["cream"]), 5.2), -26)
    tag = obj("C_tag", None); along(A, tag, -9)
    tagCard = mesh_obj("C_tagcard", Geo().plane(13, 7.4).mesh("C_tagcard", [FLAT["cream"]]), parent=tag)
    mWar = word(wWar["w"], FLAT["black"], parent=tag); fit(mWar, 5); mWar.location = (0, -2.5, .02)
    mMeans = along(B, fit(word(wM["w"], FLAT["cream"]), 6.4), -15)
    mLess = along(B, fit(word(wL["w"], FLAT["cream"]), 6.4), 13)
    for m in (mWhere, mMeans, mLess): m.location.z += 3.2; m["base"] = tuple(m.scale)
    objs.append(rows_of_buildings("C_rows", on_dark, seed=13, x0=2, z0=-200, z1=-900, h=(8, 24)))
    def update(t, active):
        for o in objs: vis(o, active)
        stamp(mWhere, t, wW["s"], active); stamp(mMeans, t, wM["s"], active); stamp(mLess, t, wL["s"], active)
        on = active and t >= wWar["s"] - 1 / 24; vis(tagCard, on); vis(mWar, on)
        p = (1 + .12 * (1 - ease((t - wWar["s"]) / .12))) * lerp(1, .32, ease((t - (sLast - .05)) / .9)); rec(tag, "scale", (p, p, p))
        k = clamp((t - s0) / (cut(3) - s0)); th = lerp(-.42, .12, easeIO(k))
        R = lerp(50, 38, easeIO(k)); hh = lerp(30, 21, easeIO(k))
        pos = Vector((C.x + R * math.sin(th), hh, C.z + R * math.cos(th)))
        camera(pos, (C.x - 4, 0, C.z - 6), lerp(.34, .16, easeIO(k)), 52, (pos - C).length, 1.0)
    SHOTS.append((s0, "black", update))

def shot_d():
    L = LINES[3]; s0 = cut(3); objs = []
    on_cream = ink("onCreamD", "cream", "red", "black", .42, .96, .07)
    # reading order from above, far to near, growing as it comes (Robin, 2026-11-12; #504, look/new-city-more-size)
    cardZ, cardW, cardD, gapZ, stretch = -98, 176, 140, 5, 1.3
    objs.append(place(mesh_obj("D_card", Geo().plane(cardW, cardD).mesh("D_card", [FLAT["red"]])), (0, .02, cardZ), (-math.pi / 2, 0, 0)))
    wAnd, wPeople, wMore = L
    mM = word(wMore["w"], FLAT["motif"]); capM = min(56, cardW * .86 / mM["width"])
    mP = word(wPeople["w"], FLAT["motif"]); capP = min(34, cardW * .86 / mP["width"])
    mA = word(wAnd["w"], FLAT["motif"]); capA = 17
    zMore = cardZ + cardD / 2 - 6; zPeople = zMore - capM - gapZ; zAnd = zPeople - capP * stretch - gapZ    # baselines
    place(mM, (0, .06, zMore), (-math.pi / 2, 0, 0), (capM, capM, capM))
    place(mP, (0, .06, zPeople), (-math.pi / 2, 0, 0), (capP, capP * stretch, capP))
    place(mA, (0, .06, zAnd), (-math.pi / 2, 0, 0), (capA, capA * stretch * 1.15, capA))
    for m in (mP, mA, mM): m["base"] = tuple(m.scale)
    r = rng(77); lists = [[], []]; z = 12
    while z > -300:
        x = -180
        while x < 180:
            on_card = abs(x) < cardW / 2 and abs(z - cardZ) < cardD / 2     # thinned where it stands on the type
            if r() >= (.6 if on_card else .12):
                pose = 1 if r() < .3 else 0; s = 4.2 + r() * .8
                px = x + r() * .8; ry = (r() - .5) * .8; lists[pose].append((px, 0, z, ry, s))
            x += 5.5 + r() * 3
        z -= 7.5 + r() * 2.5
    for k in (0, 1):
        g = Geo(); person(g, k); objs.append(instances(f"D_crowd{k}", g.mesh(f"D_person{k}", [on_cream]), lists[k]))
    objs.append(rows_of_buildings("D_rows", on_cream, seed=17, x0=2, z0=-320, z1=-1000, h=(10, 30)))
    words = [(mA, wAnd["s"]), (mP, wPeople["s"]), (mM, wMore["s"])]
    def update(t, active):
        for o in objs: vis(o, active)
        for m, s in words: stamp(m, t, s, active)
        rise = ease((t - s0) / 3.8); drift = max(0, t - s0 - 3.8)
        pos = Vector((math.sin(t * .6) * 1.5, lerp(2.4, 96, rise) + drift * 2, lerp(16, 46, rise) + drift * 1.5))
        camera(pos, (0, lerp(3, 0, rise), lerp(-50, cardZ + 2, rise)), lerp(-.36, -.07, rise), 54,
               (pos - Vector((0, 0, cardZ))).length, lerp(1.6, .6, rise))
    SHOTS.append((s0, "cream", update))

# ---------------------------------------------------------------------------------------------------------------
# sun (the one light), world, render settings
def setup_render():
    sun = bpy.data.lights.new("NC_sun", "SUN"); sun.energy = CAL; sun.angle = 0.0; sun.use_shadow = not opt("--noshadow")
    so = obj("NC_sun", sun); so.rotation_mode = "QUATERNION"; so.rotation_quaternion = LIGHT.to_track_quat("Z", "Y")
    w = bpy.data.worlds.new("NC_world"); w.use_nodes = True
    bg = next(n for n in w.node_tree.nodes if n.type == "BACKGROUND"); bg.inputs[0].default_value = (0, 0, 0, 1); bg.inputs[1].default_value = 0
    SC.world = w
    r = SC.render; r.engine = "BLENDER_EEVEE_NEXT"
    r.resolution_x, r.resolution_y = 1280, 720; r.resolution_percentage = int(opt("--res", 100))
    r.fps = FPS; r.fps_base = 1; SC.frame_start = 0; SC.frame_end = F_LAST
    r.film_transparent = True
    r.use_motion_blur = not opt("--nomb"); r.motion_blur_shutter = 0.5; r.motion_blur_position = "CENTER"
    e = SC.eevee; e.taa_render_samples = int(opt("--samples", 32)); e.bokeh_max_size = 28 * r.resolution_percentage / 100
    e.motion_blur_steps = int(opt("--mbsteps", 2)); e.motion_blur_max = 64
    e.use_shadows = True; e.shadow_ray_count = 1; e.shadow_step_count = 6
    for k in ("use_gtao", "use_raytracing"):
        if hasattr(e, k): setattr(e, k, False)
    vs = SC.view_settings; vs.view_transform = "Standard"; vs.look = "None"; vs.exposure = 0; vs.gamma = 1
    SC.display_settings.display_device = "sRGB"
    r.image_settings.file_format = "PNG"; r.image_settings.color_mode = "RGB"; r.image_settings.color_depth = "8"

# ---------------------------------------------------------------------------------------------------------------
# paper (main.js finish pass: the same hash, value noise and fbm), baked once to a float image fixed to the screen:
# R = the multiplier m, G = the lift that shows through dark ink, B = the vignette
def paper_image(W=1280, H=720):
    path = os.path.join(OUT, f"paper_{W}x{H}.exr")
    f32 = np.float32
    fract = lambda v: v - np.floor(v)
    def hsh(x, y):
        a, b, c = fract(x * f32(.1031)), fract(y * f32(.1031)), fract(x * f32(.1031))
        d = a * (b + f32(33.33)) + b * (c + f32(33.33)) + c * (a + f32(33.33)); a, b, c = a + d, b + d, c + d
        return fract((a + b) * c)
    def n2(x, y):
        ix, iy = np.floor(x), np.floor(y); fx, fy = x - ix, y - iy; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy)
        a, b, c, d = hsh(ix, iy), hsh(ix + 1, iy), hsh(ix, iy + 1), hsh(ix + 1, iy + 1)
        lo = a + (b - a) * fx; hi = c + (d - c) * fx
        return lo + (hi - lo) * fy
    def fbm(x, y):
        s = np.zeros_like(x); a = f32(.5)
        for _ in range(5): s += a * n2(x, y); x = x * f32(2.03); y = y * f32(2.03); a *= f32(.5)
        return s
    yy, xx = np.mgrid[0:H, 0:W].astype(f32); px, py = xx + f32(.5), yy + f32(.5)     # row 0 = bottom, as gl
    p_x, p_y = px / H * 720, py / H * 720; qx, qy = p_x * f32(.62), p_y; e = f32(1.2)
    hc, hx, hy = fbm(qx * .09, qy * .09), fbm((qx + e) * .09, qy * .09), fbm(qx * .09, (qy + e) * .09)
    fc, fx, fy = n2(qx * .3, qy * .3), n2((qx + e) * .3, qy * .3), n2(qx * .3, (qy + e) * .3)
    gx, gy = (hx - hc) + (fx - fc) * .35, (hy - hc) + (fy - fc) * .35
    relief = (gx * -.7 + gy * .7) / math.sqrt(.98) * 2.4
    cloud = fbm(p_x * .005, p_y * .005) - .5
    alb = (fbm(qx * .08 + 7, qy * .08 + 7) - .5) * .06
    m = 1 + relief * .42 + cloud * .07 + alb + (fbm(qx * .045 + 3, qy * .045 + 3) - .5) * .07
    lift = np.maximum(relief, 0) * .06 + np.maximum(alb, 0) * .3
    ux, uy = (px / W - .5) * (W / H), py / H - .5; Ln = np.sqrt(ux * ux + uy * uy)
    k = np.clip((Ln - .35) / (1.05 - .35), 0, 1); v = 1 - .55 * (k * k * (3 - 2 * k))
    # set the colour space before the pixels: switching it afterwards re-encoded the buffer (values came back ^1/2.2)
    img = bpy.data.images.new("NC_paper_gen", W, H, alpha=True, float_buffer=True); img.colorspace_settings.name = "Non-Color"
    rgba = np.stack([m, lift, v, np.ones_like(m)], -1).astype(np.float32)
    img.pixels.foreach_set(rgba.ravel()); img.filepath_raw = path; img.file_format = "OPEN_EXR"
    os.makedirs(OUT, exist_ok=True); img.save(); bpy.data.images.remove(img)
    img = bpy.data.images.load(path); img.name = "NC_paper"; img.colorspace_settings.name = "Non-Color"; img.pack()
    got = np.empty(W * H * 4, np.float32); img.pixels.foreach_get(got)
    assert abs(float(got[1::4].max()) - float(lift.max())) < 1e-3, "paper image was colour-converted"
    return img

OBJ_PAPER = float(opt("--objpaper", 0.2))   # share of the paper tooth that shows on rendered objects (1 = v2 finish)
def setup_compositor():
    SC.use_nodes = True; nt = SC.node_tree
    if nt.animation_data: nt.animation_data_clear()
    for n in list(nt.nodes): nt.nodes.remove(n)
    N, L = nt.nodes, nt.links
    rl = N.new("CompositorNodeRLayers")
    tr = N.new("CompositorNodeTranslate"); tr.name = "weave"; tr.use_relative = False
    L.new(rl.outputs["Image"], tr.inputs["Image"])
    bg = N.new("CompositorNodeRGB"); bg.name = "ground"
    ao = N.new("CompositorNodeAlphaOver"); L.new(bg.outputs[0], ao.inputs[1]); L.new(tr.outputs[0], ao.inputs[2])
    bl = N.new("CompositorNodeBlur"); bl.filter_type = "GAUSS"; bl.use_relative = False; bl.size_x = bl.size_y = 1
    L.new(ao.outputs[0], bl.inputs["Image"])
    im = N.new("CompositorNodeImage"); im.image = paper_image()
    sc = N.new("CompositorNodeScale"); sc.space = "RENDER_SIZE"; sc.frame_method = "STRETCH"; L.new(im.outputs["Image"], sc.inputs["Image"])
    sp = N.new("CompositorNodeSeparateColor"); L.new(sc.outputs[0], sp.inputs[0])
    def mixrgb(op, a, b):
        n = N.new("CompositorNodeMixRGB"); n.blend_type = op; n.inputs[0].default_value = 1
        L.new(a, n.inputs[1]); L.new(b, n.inputs[2]); return n.outputs[0]
    def math_(op, a, b, cl=False):
        n = N.new("CompositorNodeMath"); n.operation = op; n.use_clamp = cl
        for i, v in enumerate((a, b)):
            if isinstance(v, (int, float)): n.inputs[i].default_value = v
            else: L.new(v, n.inputs[i])
        return n.outputs[0]
    # The paper is the backdrop, under the print (Robin, 2026-11-12, after looking at What Barry Says again: the tooth
    # sits on the ground colour, and the inked objects come away from it nearly clean). Full tooth where the render is
    # empty (alpha 0, after weave, depth of field and motion blur), OBJ_PAPER of it on the objects.
    sa = N.new("CompositorNodeSeparateColor"); L.new(tr.outputs[0], sa.inputs[0])
    k = math_("SUBTRACT", 1.0, math_("MULTIPLY", sa.outputs["Alpha"], 1.0 - OBJ_PAPER))
    m = math_("ADD", 1.0, math_("MULTIPLY", math_("SUBTRACT", sp.outputs[0], 1.0), k))
    c1 = mixrgb("MULTIPLY", bl.outputs[0], m)                                   # paper tooth on multiply
    bw = N.new("CompositorNodeRGBToBW"); L.new(c1, bw.inputs[0])
    x = math_("DIVIDE", bw.outputs[0], .25, True)
    w = math_("SUBTRACT", 1.0, math_("MULTIPLY", math_("MULTIPLY", x, x), math_("ADD", math_("MULTIPLY", x, -2.0), 3.0)))
    c2 = mixrgb("ADD", c1, math_("MULTIPLY", math_("MULTIPLY", sp.outputs[1], w), k))   # tooth through dark ground
    c3 = mixrgb("MULTIPLY", c2, sp.outputs[2])                                  # vignette
    comp = N.new("CompositorNodeComposite"); L.new(c3, comp.inputs[0])
    return tr, bg

# ---------------------------------------------------------------------------------------------------------------
def write_keys():
    for (idb, path, index), pts in KEYS.items():
        constant = path in CONST_PATHS
        if isinstance(idb, bpy.types.NodeSocket):       # sockets: key them on their tree with a full data path
            node = idb.node; coll = "outputs" if idb.is_output else "inputs"; i = list(getattr(node, coll)).index(idb)
            owner, fpath = idb.id_data, f'nodes["{node.name}"].{coll}[{i}].{path}'
            constant = node.name in ("weave", "ground")
        else: owner, fpath = idb, path
        ad = owner.animation_data or owner.animation_data_create()
        if ad.action is None: ad.action = bpy.data.actions.new(f"NC_{owner.name}")
        fc = ad.action.fcurve_ensure_for_datablock(owner, fpath, index=index)
        pts = sorted(pts); kp = fc.keyframe_points; kp.add(len(pts))
        kp.foreach_set("co", [c for p in pts for c in p])
        for k in kp: k.interpolation = "CONSTANT" if constant else "LINEAR"
        fc.update()

def build():
    t0 = time.time()
    setup_render()
    shot_a(); shot_b(); shot_c(); shot_d()
    tr, bg = setup_compositor()
    pct = SC.render.resolution_percentage / 100
    hsh = lambda n: (lambda x: x - math.floor(x))(math.sin(n * 12.9898) * 43758.5453)
    # sample times: every frame (with a margin for the shutter) plus both sides of each cut
    # quarter frames, so constant keys (visibility, ground) switch inside the shutter as three.js's sub-frames did,
    # plus both sides of every exact switch: the cuts and each word's stamp (s - 1/24; shot A uses s - 2/24)
    times = [q / (4 * FPS) for q in range(-8, 4 * F_LAST + 12)]
    for st, _, _ in SHOTS[1:]: times += [st - 1e-4, st]
    for line in LINES:
        for w in line: times += [w["s"] - d + e for d in (1 / 24, 2 / 24) for e in (-1e-4, 1e-4)]
    times.sort()
    for t in times:
        FRAME[0] = t * FPS
        cur = max(i for i, sh in enumerate(SHOTS) if t >= sh[0])
        for i, (st, ground, upd) in enumerate(SHOTS):
            CAM_ON[0] = i == cur; upd(t, i == cur)
        ik = inks(t)
        for k, n in INK_NODE.items(): rec(n.outputs[0], "default_value", ik[k] + (1,))
        rec(bg.outputs[0], "default_value", ik[SHOTS[cur][1]] + (1,))
    for f in range(-2, F_LAST + 3):           # gate weave moves the print, not the paper (constant per frame)
        FRAME[0] = f
        wx = (hsh(f) - .5) * 1.4 + math.sin(f * .37) * .5; wy = (hsh(f + 91) - .5) * 1.0 + math.sin(f * .23) * .4
        rec(tr.inputs["X"], "default_value", -wx * pct); rec(tr.inputs["Y"], "default_value", -wy * pct)
    write_keys()
    print(f"[newcity] built in {time.time() - t0:.1f} s, {len(KEYS)} animated channels")

def calib():
    """Shader to RGB of a white Diffuse on a face square to the sun, to set CAL."""
    setup_render(); SC.render.resolution_x = SC.render.resolution_y = 16; SC.render.resolution_percentage = 100
    SC.render.film_transparent = False; SC.render.use_motion_blur = False
    m, nt, out, g = _mat("calib"); d = nt.nodes.new("ShaderNodeBsdfDiffuse"); d.inputs["Color"].default_value = (1, 1, 1, 1)
    s2 = nt.nodes.new("ShaderNodeShaderToRGB"); nt.links.new(d.outputs[0], s2.inputs[0])
    e = nt.nodes.new("ShaderNodeEmission"); nt.links.new(s2.outputs[0], e.inputs[0]); nt.links.new(e.outputs[0], out.inputs[0])
    o = obj("calib", Geo().plane(50, 50).mesh("calib", [m])); o.rotation_mode = "QUATERNION"
    o.rotation_quaternion = LIGHT.to_track_quat("Z", "Y")
    camera(LIGHT * 20, (0, 0, 0), 0, 30, 20, 0)
    write_keys(); SC.frame_set(0)
    p = os.path.join(OUT, "calib.exr"); SC.render.image_settings.file_format = "OPEN_EXR"; SC.render.filepath = p
    bpy.ops.render.render(write_still=True)
    img = bpy.data.images.load(p); px = np.array(img.pixels[:]).reshape(-1, 4)
    print(f"[calib] sun energy {CAL}: Shader to RGB = {px[:, 0].mean():.4f}")

if opt("--calib"):
    calib(); sys.exit(0)
build()
if opt("--save"):
    p = opt("--save"); p = p if os.path.isabs(p) else os.path.join(PROJ, p)
    os.makedirs(os.path.dirname(p), exist_ok=True); bpy.ops.wm.save_as_mainfile(filepath=p, compress=True)
    print("[newcity] saved", p)
if opt("--stills"):
    tag = opt("--tag", "stills"); d = os.path.join(OUT, tag); os.makedirs(d, exist_ok=True)
    for f in [int(x) for x in str(opt("--stills")).split(",")]:
        SC.frame_set(f); SC.render.filepath = os.path.join(d, f"f{f:04d}.png"); t0 = time.time()
        bpy.ops.render.render(write_still=True); print(f"[newcity] f{f} {time.time() - t0:.1f} s")
