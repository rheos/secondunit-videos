# Shared kit for 10,000 Miles (Blender 4.5 LTS, EEVEE). Every scene builder uses these, so the film has one look:
# toon shading (diffuse > shader to RGB > three-step ramp > emission), bevelled boxes and smooth primitives built
# with bmesh, flat or graded worlds, and the same two kinds of character (the person, the boys).
#
# Song time is the clock. Global frame f = round((t - T0) * FPS) + 1 with T0 = 0 for the film.
# A scene builder animates by keying every frame of its own span with bake(frames, fn(t, f)).
import bpy, bmesh, math, random
from mathutils import Vector
Vector = Vector   # re-exported for cast.py

FPS, T0 = 24, 0.0
W, H = 1280, 720
frame_of = lambda t: int(round((t - T0) * FPS)) + 1
time_of = lambda f: T0 + (f - 1) / FPS

def smooth(x): x = max(0.0, min(1.0, x)); return x * x * (3 - 2 * x)
def ramp(t, a, b): return smooth((t - a) / (b - a)) if b > a else float(t >= a)
def pulse(t, a, b): return math.sin(math.pi * ramp(t, a, b))          # 0 -> 1 -> 0 between a and b
def lerp(a, b, u): return a + (b - a) * u

def hex_lin(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]

# The film's palette. Scenes may add their own colours, but reuse these for anything shared.
P = dict(paper="#efe8db", cobalt="#2f5fb3", coral="#e8645a", red="#d4553b", cream="#f3ead2", ink="#2b2a3a",
         flame="#ffb347", flame2="#ff7a3d", wood="#b07a4a", wood2="#8a5a36", wall="#e8d6c0", grey="#8b8d99",
         grey2="#a7a9b4", rain="#7fa8d8", green="#7fb069", green2="#4f8a5a", brown="#8a5a3a", house1="#e9b44c",
         house2="#d4553b", house3="#f3ead2", roof="#7a4b3a", sky="#cfe3ea", night="#2a2f5a", night2="#46507e",
         lamp="#ffd27a", skin="#f0c9a6", skin2="#c98d64", sweater="#3f7f7c", cat="#e48a3c", cat2="#f6d2a8",
         pot="#c8643c", leaf="#4f8a4a", sill="#f3ead2", day="#bfe0f2", neon1="#ff6fae", neon2="#6fe3ff",
         denim="#4a6fa5", jacket1="#2f2f3f", jacket2="#7a3b5a", jacket3="#c8922e", jacket4="#3f6f4f", jacket5="#5a4a8a",
         space="#141836", space2="#2a2f5a", earth="#5b9bd5", land="#7fb069")

# Everything links into one of two collections: Set (scenery) or Chars (the cast). render.py renders Chars a second
# time on a view layer where Set is holdout, so comp.py can draw each character's one outer outline from its alpha.
SET = CHARS = CUR = None
def link(o): CUR.objects.link(o)
def chars_begin():
    global CUR; CUR = CHARS
def chars_end():
    global CUR; CUR = SET

def reset_scene():
    global SET, CHARS, CUR
    sc = bpy.context.scene
    for o in list(bpy.data.objects): bpy.data.objects.remove(o)
    for c in list(bpy.data.collections):
        if c.name.startswith(("Set", "Chars")): bpy.data.collections.remove(c)
    SET = bpy.data.collections.new("Set"); CHARS = bpy.data.collections.new("Chars"); CUR = SET
    sc.collection.children.link(SET); sc.collection.children.link(CHARS)
    if "chars" in sc.view_layers: sc.view_layers.remove(sc.view_layers["chars"])
    vl = sc.view_layers.new("chars"); vl.layer_collection.children["Set"].holdout = True; vl.use = False
    r = sc.render
    r.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items] else "BLENDER_EEVEE"
    r.resolution_x, r.resolution_y, r.resolution_percentage = W, H, 100
    r.fps = FPS; sc.eevee.taa_render_samples = 16
    sc.view_settings.view_transform = "Standard"
    r.image_settings.file_format = "PNG"; r.film_transparent = False
    return sc

def scene(): return bpy.context.scene

# ---------- toon material ----------
MATS = {}
def toon(hexc, shade=.74, light=1.07, emit=None, gloss=False):
    """Toon material: shadows lean cool, one highlight step. emit=<strength> makes a flat glowing colour (lamps, flame, neon).
    gloss adds a small hot highlight step, the sheen of moulded plastic."""
    key = (hexc, shade, light, emit, gloss)
    if key in MATS and MATS[key].name in bpy.data.materials: return MATS[key]
    m = bpy.data.materials.new("TK_" + hexc); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); em = nt.nodes.new("ShaderNodeEmission")
    if emit is not None:
        em.inputs["Color"].default_value = (*hex_lin(hexc), 1); em.inputs["Strength"].default_value = emit
    else:
        d = nt.nodes.new("ShaderNodeBsdfDiffuse"); s2r = nt.nodes.new("ShaderNodeShaderToRGB"); cr = nt.nodes.new("ShaderNodeValToRGB")
        base = hex_lin(hexc); sh = [c * shade for c in base]; sh[2] = min(1, sh[2] * 1.18)
        li = [min(1, c * light + .02) for c in base]
        cr.color_ramp.interpolation = "EASE"
        e = cr.color_ramp.elements; e[0].position = .18; e[0].color = (*sh, 1); e[1].position = .42; e[1].color = (*base, 1)
        e3 = e.new(.86); e3.color = (*li, 1)
        if gloss:
            e4 = e.new(.95); e4.color = (*[min(1, c * 1.25 + .22) for c in base], 1)
        nt.links.new(d.outputs["BSDF"], s2r.inputs["Shader"]); nt.links.new(s2r.outputs["Color"], cr.inputs["Fac"])
        nt.links.new(cr.outputs["Color"], em.inputs["Color"])
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    MATS[key] = m; return m

# ---------- shapes (bmesh, no bpy.ops) ----------
def _obj(name, bm, mat, loc=(0, 0, 0), rot=(0, 0, 0), parent=None, smooth_faces=True):
    me = bpy.data.meshes.new("TK_" + name)
    if smooth_faces:
        for f in bm.faces: f.smooth = True
    bm.to_mesh(me); bm.free(); me.materials.append(mat)
    o = bpy.data.objects.new("TK_" + name, me); link(o)
    o.location = loc; o.rotation_euler = rot
    if parent: o.parent = parent
    return o

def cube(name, size, mat, loc=(0, 0, 0), rot=(0, 0, 0), parent=None, bevel=.12):
    """A box of size (x, y, z) centred on loc, with softly bevelled edges."""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    if bevel: bmesh.ops.bevel(bm, geom=list(bm.edges), offset=min(size) * bevel, segments=4, affect="EDGES")
    return _obj(name, bm, mat, loc, rot, parent)

def sphere(name, rad, mat, loc=(0, 0, 0), scale=(1, 1, 1), parent=None):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=rad)
    for v in bm.verts: v.co = Vector((v.co.x * scale[0], v.co.y * scale[1], v.co.z * scale[2]))
    return _obj(name, bm, mat, loc, (0, 0, 0), parent)

def cyl(name, r1, r2, depth, mat, loc=(0, 0, 0), rot=(0, 0, 0), parent=None, seg=32):
    """A cylinder or cone along z, centred on loc: r1 at the bottom, r2 at the top."""
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r1, radius2=r2, depth=depth)
    return _obj(name, bm, mat, loc, rot, parent)

def empty(name, loc=(0, 0, 0), parent=None):
    o = bpy.data.objects.new("TK_" + name, None); link(o); o.location = loc
    if parent: o.parent = parent
    return o

def world(hex_top, hex_bottom=None):
    """Flat background colour, or a gradient bottom -> top of the frame (screen space)."""
    w = bpy.data.worlds.new("TK_world"); scene().world = w; w.use_nodes = True; nt = w.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld"); bg = nt.nodes.new("ShaderNodeBackground")
    if hex_bottom:
        tc = nt.nodes.new("ShaderNodeTexCoord"); sp = nt.nodes.new("ShaderNodeSeparateXYZ"); cr = nt.nodes.new("ShaderNodeValToRGB")
        nt.links.new(tc.outputs["Window"], sp.inputs["Vector"]); nt.links.new(sp.outputs["Y"], cr.inputs["Fac"])
        cr.color_ramp.elements[0].color = (*hex_lin(hex_bottom), 1); cr.color_ramp.elements[1].color = (*hex_lin(hex_top), 1)
        nt.links.new(cr.outputs["Color"], bg.inputs["Color"])
    else:
        bg.inputs["Color"].default_value = (*hex_lin(hex_top), 1)
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    return w

def camera(lens=50, ortho=None):
    cd = bpy.data.cameras.new("TK_cam"); cd.lens = lens
    if ortho: cd.type = "ORTHO"; cd.ortho_scale = ortho
    c = bpy.data.objects.new("TK_cam", cd); SET.objects.link(c); scene().camera = c
    return c

def aim(cam, eye, target):
    cam.location = eye; d = Vector(target) - Vector(eye)
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()

def sun(rot=(52, -14, -36), energy=3.0):
    sd = bpy.data.lights.new("TK_sun", "SUN"); sd.energy = energy; sd.angle = math.radians(4)
    s = bpy.data.objects.new("TK_sun", sd); SET.objects.link(s)
    s.rotation_euler = [math.radians(a) for a in rot]
    return s

def bake(frames, fn):
    for f in frames: fn(time_of(f), f)

def key(o, path, f): o.keyframe_insert(path, frame=f)

def keycam(cam, f): key(cam, "location", f); key(cam, "rotation_euler", f)

def linear_all():
    for o in scene().objects:
        ad = o.animation_data
        if not (ad and ad.action): continue
        for layer in getattr(ad.action, "layers", []):
            for st in layer.strips:
                for cb in st.channelbags:
                    for fc in cb.fcurves:
                        for kp in fc.keyframe_points: kp.interpolation = "LINEAR"

# ---------- the cast (tk/cast.py builds them; these keep the old call signatures) ----------
def person(name, loc=(0, 0, 0), sweater=None, parent=None, scale=1.0):
    """The person the song talks to. See cast.PERSON and the parts list in cast.py."""
    from . import cast
    return cast.figure(name, loc, dict(cast.PERSON, top=sweater or P["sweater"]), parent, scale)

def boy(name, k, loc=(0, 0, 0), parent=None):
    """One of the group of boys, k = 0..4 (jacket and cap colours by k)."""
    from . import cast
    return cast.figure(name, loc, cast.BOY(k), parent)

def kid(name, loc=(0, 0, 0), sweater=None, parent=None):
    from . import cast
    return cast.figure(name, loc, dict(cast.KID, top=sweater or P["coral"]), parent)

def face(parts, **kw):
    """Set an expression: brow (-1 angry .. +1 sad), lids (0 open .. 1 closed), smile (+1 .. -1), open_ (0 .. 1), wide."""
    from . import cast
    cast.face(parts, **kw)

def bend(piv, x, f=None):
    """Curl a limb as one smooth curve (0 straight .. 1 a quarter turn forward); keys it when f is given."""
    from . import cast
    cast.bend(piv, x, f)

def walk(parts, t, speed=1.0, amp=28):
    """Swing legs and arms for a walk cycle (1 s per stride at speed 1). Call inside a bake fn, then key the pivots."""
    w = 2 * math.pi * t * speed; s = math.radians(amp) * math.sin(w)
    parts["legL"].rotation_euler = (s, 0, 0); parts["legR"].rotation_euler = (-s, 0, 0)
    parts["armL"].rotation_euler = (-s * .8, 0, 0); parts["armR"].rotation_euler = (s * .8, 0, 0)

def key_parts(parts, f, names=("root", "head", "armL", "armR", "legL", "legR")):
    for n in names:
        o = parts[n]; key(o, "rotation_euler", f)
        if n == "root": key(o, "location", f)

def key_face(parts, f):
    for b in parts["brows"]: key(b, "rotation_euler", f)
    for o in parts["lids"] + parts["eyes"] + [parts["mouthOpen"]]: key(o, "scale", f)
    key(parts["mouth"], "rotation_euler", f); key(parts["mouth"], "scale", f)

def rocket(name="rocket", loc=(0, 0, 0), body=None, trim=None, parent=None, flame=True):
    """Bob's rocket ship: a tin toy, red and cream by default, three fins, a porthole, a flame. About 1.6 m tall,
    visual centre at loc. Returns (root, flame_root)."""
    rk = empty(name, loc, parent)
    b = toon(body or P["red"]); tr = toon(trim or P["cream"])
    cyl(name + "Body", .24, .24, .95, b, (0, 0, 0), parent=rk)
    cyl(name + "Nose", .24, .0, .5, tr, (0, 0, .72), parent=rk)
    cyl(name + "Band", .25, .25, .1, tr, (0, 0, -.3), parent=rk)
    sphere(name + "Port", .11, toon(P["cobalt"]), (0, -.21, .12), (1, .45, 1), parent=rk)
    sphere(name + "PortRim", .14, tr, (0, -.2, .12), (1, .3, 1), parent=rk)
    for k, deg in enumerate((210, 330, 90)):
        a = math.radians(deg)
        cube(name + f"Fin{k}", (.26, .05, .42), toon(body or P["red"], .66), (math.cos(a) * .34, math.sin(a) * .34, -.4), (0, 0, a), parent=rk)
    cyl(name + "Nozzle", .14, .18, .14, toon(P["ink"]), (0, 0, -.55), parent=rk)
    fl = None
    if flame:
        fl = empty(name + "FlameRoot", (0, 0, -.62), rk)
        cyl(name + "Flame", .14, .0, .5, toon(P["flame"], emit=2.2), (0, 0, -.25), (math.pi, 0, 0), fl)
        cyl(name + "Flame2", .08, .0, .3, toon(P["flame2"], emit=2.6), (0, 0, -.15), (math.pi, 0, 0), fl)
    return rk, fl
