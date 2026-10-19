# Take 05: a look test for Bob Wiseman's "10,000 Miles" in the structure of Kevin Ngo's orb film.
# One anchor never leaves the centre of the frame (Bob's rocket ship); scenes open around it as circle
# portals; on the chorus every scene comes back as a mosaic of circles that makes the Earth.
#
# This script renders the 3D parts only. tools/portals_comp.py lays the paper, rings, portals and mosaic.
#   blender -b --factory-startup --python rocket_portals.py -- --part rocket            transparent rocket, every frame
#   blender -b --factory-startup --python rocket_portals.py -- --part problems          one portal scene, its span only
#   blender -b --factory-startup --python rocket_portals.py -- --part mosaic            stills for the mosaic circles
#   blender -b --factory-startup --python rocket_portals.py -- --part problems --still 18.5   one test still
# Timing lives in portals_take05.json (song seconds). Global frame f is song time t0 + (f - 1) / fps.
import bpy, bmesh, math, json, os, sys, random
from mathutils import Vector, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
TM = json.load(open(os.path.join(HERE, "portals_take05.json")))
FPS, T0, T1 = TM["fps"], TM["t0"], TM["t1"]
W, H = TM["size"]
OUT = os.path.join(HERE, "out", "portals", "take-05")
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
PART = argv[argv.index("--part") + 1] if "--part" in argv else "rocket"
STILL = float(argv[argv.index("--still") + 1]) if "--still" in argv else None
frame_of = lambda t: int(round((t - T0) * FPS)) + 1
time_of = lambda f: T0 + (f - 1) / FPS

def smooth(x): x = max(0.0, min(1.0, x)); return x * x * (3 - 2 * x)
def ramp(t, a, b): return smooth((t - a) / (b - a)) if b > a else float(t >= a)

def hex_lin(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]

# ---------- scene ----------
scene = bpy.context.scene
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
r = scene.render
r.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items] else "BLENDER_EEVEE"
r.resolution_x, r.resolution_y, r.resolution_percentage = W, H, 100
r.fps = FPS; scene.eevee.taa_render_samples = 16
scene.view_settings.view_transform = "Standard"
r.image_settings.file_format = "PNG"

# ---------- toon material: diffuse -> shader to RGB -> three-step ramp -> emission ----------
MATS = {}
def toon(hexc, shade=.74, light=1.07, emit=None):
    key = (hexc, shade, light, emit)
    if key in MATS: return MATS[key]
    m = bpy.data.materials.new("TK_" + hexc); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); em = nt.nodes.new("ShaderNodeEmission")
    if emit is not None:
        em.inputs["Color"].default_value = (*hex_lin(hexc), 1); em.inputs["Strength"].default_value = emit
    else:
        d = nt.nodes.new("ShaderNodeBsdfDiffuse"); s2r = nt.nodes.new("ShaderNodeShaderToRGB"); cr = nt.nodes.new("ShaderNodeValToRGB")
        base = hex_lin(hexc); sh = [c * shade for c in base]; sh[2] = min(1, sh[2] * 1.18)    # shadows lean cool
        li = [min(1, c * light + .02) for c in base]
        cr.color_ramp.interpolation = "EASE"
        e = cr.color_ramp.elements; e[0].position = .18; e[0].color = (*sh, 1); e[1].position = .42; e[1].color = (*base, 1)
        e3 = e.new(.86); e3.color = (*li, 1)
        nt.links.new(d.outputs["BSDF"], s2r.inputs["Shader"]); nt.links.new(s2r.outputs["Color"], cr.inputs["Fac"])
        nt.links.new(cr.outputs["Color"], em.inputs["Color"])
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    MATS[key] = m; return m

# ---------- mesh helpers (bmesh, no bpy.ops) ----------
def obj(name, bm, mat, loc=(0, 0, 0), rot=(0, 0, 0), parent=None, smooth_faces=True):
    me = bpy.data.meshes.new("TK_" + name)
    if smooth_faces:
        for f in bm.faces: f.smooth = True
    bm.to_mesh(me); bm.free(); me.materials.append(mat)
    o = bpy.data.objects.new("TK_" + name, me); scene.collection.objects.link(o)
    o.location = loc; o.rotation_euler = rot
    if parent: o.parent = parent
    return o

def cube(name, size, mat, loc=(0, 0, 0), rot=(0, 0, 0), parent=None):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    bmesh.ops.bevel(bm, geom=list(bm.edges), offset=min(size) * .12, segments=2, affect="EDGES")
    return obj(name, bm, mat, loc, rot, parent)

def sphere(name, rad, mat, loc=(0, 0, 0), scale=(1, 1, 1), parent=None):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=28, v_segments=16, radius=rad)
    for v in bm.verts: v.co = Vector((v.co.x * scale[0], v.co.y * scale[1], v.co.z * scale[2]))
    return obj(name, bm, mat, loc, (0, 0, 0), parent)

def cyl(name, r1, r2, depth, mat, loc=(0, 0, 0), rot=(0, 0, 0), parent=None, seg=32):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r1, radius2=r2, depth=depth)
    return obj(name, bm, mat, loc, rot, parent)

def empty(name, loc=(0, 0, 0), parent=None):
    o = bpy.data.objects.new("TK_" + name, None); scene.collection.objects.link(o); o.location = loc
    if parent: o.parent = parent
    return o

def world(hex_top, hex_bottom=None):
    w = bpy.data.worlds.new("TK_world"); scene.world = w; w.use_nodes = True; nt = w.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld"); bg = nt.nodes.new("ShaderNodeBackground")
    if hex_bottom:
        tc = nt.nodes.new("ShaderNodeTexCoord"); sp = nt.nodes.new("ShaderNodeSeparateXYZ"); cr = nt.nodes.new("ShaderNodeValToRGB")
        nt.links.new(tc.outputs["Window"], sp.inputs["Vector"]); nt.links.new(sp.outputs["Y"], cr.inputs["Fac"])
        cr.color_ramp.elements[0].color = (*hex_lin(hex_bottom), 1); cr.color_ramp.elements[1].color = (*hex_lin(hex_top), 1)
        nt.links.new(cr.outputs["Color"], bg.inputs["Color"])
    else:
        bg.inputs["Color"].default_value = (*hex_lin(hex_top), 1)
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])

def camera(lens=50, ortho=None):
    cd = bpy.data.cameras.new("TK_cam"); cd.lens = lens
    if ortho: cd.type = "ORTHO"; cd.ortho_scale = ortho
    c = bpy.data.objects.new("TK_cam", cd); scene.collection.objects.link(c); scene.camera = c
    return c

def aim(cam, eye, target):
    cam.location = eye; d = Vector(target) - Vector(eye)
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()

def sun(rot=(52, -14, -36), energy=3.0):
    sd = bpy.data.lights.new("TK_sun", "SUN"); sd.energy = energy; sd.angle = math.radians(4)
    s = bpy.data.objects.new("TK_sun", sd); scene.collection.objects.link(s)
    s.rotation_euler = [math.radians(a) for a in rot]
    return s

# keyframe every frame of a span from a function of song time
def bake(frames, fn):
    for f in frames:
        fn(time_of(f), f)

def key(o, path, f): o.keyframe_insert(path, frame=f)

# ---------- palette ----------
P = dict(paper="#efe8db", cobalt="#2f5fb3", red="#d4553b", cream="#f3ead2", ink="#2b2a3a", flame="#ffb347", flame2="#ff7a3d",
         wood="#b07a4a", wood2="#8a5a36", wall="#e8d6c0", grey="#8b8d99", grey2="#a7a9b4", rain="#7fa8d8", green="#7fb069",
         green2="#4f8a5a", brown="#8a5a3a", house1="#e9b44c", house2="#d4553b", house3="#f3ead2", roof="#7a4b3a", sky="#cfe3ea",
         night="#2a2f5a", night2="#46507e", lamp="#ffd27a", skin="#f0c9a6", sweater="#3f7f7c", cat="#e48a3c", cat2="#f6d2a8",
         pot="#c8643c", leaf="#4f8a4a", sill="#f3ead2", day="#bfe0f2")

# ================= parts =================
def build_rocket():
    """Bob's rocket ship: tin-toy red and cream, three fins, a porthole, a flickering flame. Visual centre at the origin."""
    r.film_transparent = True
    cam = camera(ortho=15.5); aim(cam, (0, -30, 0), (0, 0, 0))
    sun((60, 0, -30), 3.2)
    world("#ffffff"); scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = .0
    rk = empty("rocket", (0, 0, 0))
    body = cyl("body", .24, .24, .95, toon(P["red"]), (0, 0, 0), parent=rk)
    cyl("nose", .24, .0, .5, toon(P["cream"]), (0, 0, .72), parent=rk)
    cyl("band", .25, .25, .1, toon(P["cream"]), (0, 0, -.3), parent=rk)
    sphere("port", .11, toon(P["cobalt"]), (0, -.21, .12), (1, .45, 1), parent=rk)
    sphere("portRim", .14, toon(P["cream"]), (0, -.2, .12), (1, .3, 1), parent=rk)
    for k in range(3):
        a = math.radians(90 + k * 120 + 30)
        fin = cube(f"fin{k}", (.08, .3, .38), toon(P["red"], .66), (math.cos(a) * .3, math.sin(a) * .3, -.42), (0, 0, a + math.pi / 2), parent=rk)
    cyl("nozzle", .14, .18, .14, toon(P["ink"]), (0, 0, -.55), parent=rk)
    flame = empty("flameRoot", (0, 0, -.62), rk)
    f1 = cyl("flame", .14, .0, .5, toon(P["flame"], emit=2.2), (0, 0, -.25), (0, 0, 0), flame)
    f1.rotation_euler = (math.pi, 0, 0)
    f2 = cyl("flame2", .08, .0, .3, toon(P["flame2"], emit=2.6), (0, 0, -.15), (math.pi, 0, 0), flame)
    rng = random.Random(5)
    frames = range(1, frame_of(T1) + 1)
    def anim(t, f):
        rk.location = (0, 0, .06 * math.sin(2 * math.pi * t / 2.4))
        rk.rotation_euler = (0, math.radians(3.5) * math.sin(2 * math.pi * t / 3.1), 0)
        key(rk, "location", f); key(rk, "rotation_euler", f)
        s = .85 + .3 * rng.random(); flame.scale = (1, 1, s); key(flame, "scale", f)
    bake(frames, anim)
    return frames

def build_problems():
    """Look at your problems now: a desk under a paper pile and a storm cloud. Once so big (the cloud swells), now so
    small (the camera falls away fast, the way a rocket leaves)."""
    world(P["wall"])
    cam = camera(40); sun((50, -10, -40), 3.0)
    cube("floor", (40, 40, .2), toon("#d9c3a5"), (0, 0, -.1))
    cube("wall", (40, .2, 20), toon(P["wall"]), (0, 6, 10))
    desk = empty("desk", (0, 0, 0))
    cube("top", (3.0, 1.6, .12), toon(P["wood"]), (0, 0, .9), parent=desk)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cube(f"leg{sx}{sy}", (.12, .12, .9), toon(P["wood2"]), (sx * 1.35, sy * .65, .45), parent=desk)
    rng = random.Random(3)
    for i in range(9):
        cube(f"paper{i}", (.62, .82, .025), toon("#fbf7ee" if i % 3 else "#f0e2b8"), (-.5 + rng.uniform(-.06, .06), rng.uniform(-.05, .05), .975 + i * .035),
             (0, 0, rng.uniform(-.25, .25)), parent=desk)
    for i in range(4):
        cube(f"bill{i}", (.5, .32, .02), toon("#e9e1f0" if i % 2 else "#f6d6cf"), (.55 + i * .1, -.15 + i * .08, .975 + i * .022), (0, 0, rng.uniform(-.6, .6)), parent=desk)
    cyl("mug", .12, .12, .26, toon(P["cobalt"]), (1.05, .3, 1.09), parent=desk)
    cloud = empty("cloud", (0, .2, 2.75))
    for i, (x, z, rr) in enumerate(((0, 0, .55), (-.55, -.1, .42), (.55, -.05, .45), (-.25, .3, .4), (.3, .28, .42), (-.95, -.2, .3), (.95, -.18, .32))):
        sphere(f"puff{i}", rr, toon(P["grey"] if i % 2 else P["grey2"]), (x, 0, z), (1, .8, .85), parent=cloud)
    drops = [cube(f"drop{i}", (.03, .03, .2), toon(P["rain"], emit=1.0), (rng.uniform(-1, 1), .2, 2), parent=None) for i in range(26)]
    dx = [d.location.x for d in drops]; ph = [rng.random() for _ in drops]
    a, b = TM["portals"][0]["render"]; frames = range(frame_of(a), frame_of(b) + 1)
    def anim(t, f):
        big = 1 + .75 * ramp(t, 18.14, 19.3)
        cloud.scale = (big, big, big); key(cloud, "scale", f)
        cloud.location = (.03 * math.sin(t * 1.7), .2, 2.75 + .35 * (big - 1)); key(cloud, "location", f)
        away = ramp(t, 20.46, 21.5) ** .7                         # now so small: the camera falls away
        eye = Vector((0, -6.4, 2.6)).lerp(Vector((.0, -28, 26)), away); tgt = Vector((0, 0, 1.75)).lerp(Vector((0, 0, 1.2)), away)
        eye += Vector((.25 * math.sin(t * .6), 0, .1 * math.sin(t * .9)))
        aim(cam, eye, tgt); key(cam, "location", f); key(cam, "rotation_euler", f)
        for i, d in enumerate(drops):
            u = ((t / .55) + ph[i]) % 1
            d.location = (dx[i] * big * .95, .2, 2.75 + .35 * (big - 1) - .4 - u * 1.4); key(d, "location", f)
    bake(frames, anim)
    return frames

def build_world():
    """And the world still turns somehow: a little round world of houses and trees on a turning disc."""
    world(P["sky"], "#f4e3cf")
    cam = camera(45); sun((55, 0, -50), 3.0)
    disc = empty("disc", (0, 0, 0))
    cyl("ground", 2.2, 2.2, .5, toon(P["green"]), (0, 0, -.25), parent=disc, seg=64)
    cyl("soil", 2.21, 2.0, .7, toon(P["brown"]), (0, 0, -.85), parent=disc, seg=64)
    rng = random.Random(9)
    cols = [P["house1"], P["house2"], P["house3"], P["cream"]]
    for i in range(7):
        a = i / 7 * 2 * math.pi + .3; rr = 1.25 + rng.uniform(-.25, .25)
        h = empty(f"house{i}", (math.cos(a) * rr, math.sin(a) * rr, 0), disc); h.rotation_euler = (0, 0, a)
        cube(f"hbox{i}", (.42, .42, .42), toon(cols[i % 4]), (0, 0, .21), parent=h)
        cyl(f"roof{i}", .34, 0, .3, toon(P["roof"]), (0, 0, .57), (0, 0, math.pi / 4), parent=h, seg=4)
    for i in range(9):
        a = rng.uniform(0, 2 * math.pi); rr = rng.uniform(.3, 1.9)
        t_ = empty(f"tree{i}", (math.cos(a) * rr, math.sin(a) * rr, 0), disc)
        cyl(f"trunk{i}", .05, .05, .25, toon(P["brown"]), (0, 0, .12), parent=t_)
        sphere(f"crown{i}", .2, toon(P["green2"]), (0, 0, .38), (1, 1, 1.2), parent=t_)
    aim(cam, (0, -7.2, 4.4), (0, 0, .1))
    a, b = TM["portals"][1]["render"]; frames = range(frame_of(a), frame_of(b) + 1)
    def anim(t, f):
        disc.rotation_euler = (0, 0, math.radians(38) * (t - a)); key(disc, "rotation_euler", f)
    bake(frames, anim)
    return frames

def build_window():
    """At a thousand miles from your loneliest smile: one lit window at night, someone with a small smile.
    You can't even tell it's there: the camera pulls away as the portal closes."""
    world(P["night"], P["night2"])
    cam = camera(50); sun((40, 0, 30), .6)
    cube("wall", (12, .4, 9), toon("#6a5a7a", .8, 1.03), (0, .2, 1.0))
    cube("frame", (1.9, .2, 1.5), toon(P["cream"]), (0, -.05, 1.25))
    cube("glow", (1.6, .02, 1.22), toon(P["lamp"], emit=1.3), (0, -.17, 1.25))
    cube("sill", (2.2, .6, .1), toon(P["cream"]), (0, -.3, .45))
    cube("mullion", (.06, .02, 1.22), toon(P["cream"]), (0, -.19, 1.25))
    p = empty("person", (.35, -.35, .45))
    cyl("torso", .3, .26, .55, toon(P["sweater"]), (0, 0, .27), parent=p)
    sphere("head", .24, toon(P["skin"]), (0, -.02, .78), parent=p)
    for x in (-.08, .08): sphere(f"eye{x}", .025, toon(P["ink"]), (x, -.22, .82), parent=p)
    sphere("smile", .05, toon(P["ink"]), (0, -.225, .7), (1.3, .25, .22), parent=p)      # a small smile, barely there
    rng = random.Random(4)
    for i in range(30):
        sphere(f"star{i}", .03, toon("#fff3c4", emit=1.5), (rng.uniform(-6, 6), 1, rng.uniform(3.6, 5.6)))
    a, b = TM["portals"][2]["render"]; frames = range(frame_of(a), frame_of(b) + 1)
    def anim(t, f):
        push = ramp(t, 25.4, 31.2) * .35
        away = ramp(t, 31.26, 33.0) ** .8
        eye = Vector((-.3, -6.0 + 2.2 * push, 1.35)).lerp(Vector((-.6, -26, 4.5)), away)
        aim(cam, eye, (.2, 0, 1.15)); key(cam, "location", f); key(cam, "rotation_euler", f)
        p.rotation_euler = (0, 0, math.radians(6) * math.sin(t * .8)); key(p, "rotation_euler", f)
    bake(frames, anim)
    return frames

def build_cat():
    """Maybe you will, maybe you won't even care: a cat on a sunny sill turns away and yawns."""
    world(P["day"], "#f7ead6")
    cam = camera(50); sun((50, -10, -30), 3.2)
    cube("wall", (12, .4, 9), toon(P["wall"]), (0, .6, 0))
    cube("sill", (3.4, .9, .14), toon(P["sill"]), (0, 0, .0))
    cyl("pot", .2, .15, .32, toon(P["pot"]), (-1.0, .05, .23))
    for i in range(5):
        a = i / 5 * 2 * math.pi
        sphere(f"leaf{i}", .13, toon(P["leaf"]), (-1.0 + math.cos(a) * .12, .05 + math.sin(a) * .05, .5 + i * .03), (1, .6, 1.5))
    cat = empty("cat", (.25, 0, .07))
    sphere("body", .38, toon(P["cat"]), (0, 0, .3), (1.25, .8, .78), parent=cat)
    head = empty("headRoot", (-.42, -.05, .62), cat)
    sphere("head", .25, toon(P["cat"]), (0, 0, 0), (1, .95, .9), parent=head)
    sphere("muzzle", .12, toon(P["cat2"]), (0, -.19, -.05), (1.2, .6, .8), parent=head)
    for x in (-.14, .14):
        cyl(f"ear{x}", .09, 0, .18, toon(P["cat"]), (x, 0, .22), (0, x * .8, 0), parent=head, seg=4)
    eyes = [sphere(f"eye{x}", .035, toon(P["ink"]), (x, -.22, .06), parent=head) for x in (-.08, .08)]
    mouth = sphere("mouth", .045, toon("#7a2e3a"), (0, -.24, -.08), (1, .3, .2), parent=head)
    tail = [sphere(f"tail{i}", .07, toon(P["cat"]), (.45 + i * .1, .05, .2 + i * .05)) for i in range(6)]
    for s_ in tail: s_.parent = cat
    aim(cam, (-.4, -5.6, 1.3), (-.15, 0, .45))
    a, b = TM["portals"][3]["render"]; frames = range(frame_of(a), frame_of(b) + 1)
    def anim(t, f):
        turn = ramp(t, 39.92, 40.6) - .55 * ramp(t, 41.2, 41.6)   # won't: the head turns away, then half back to yawn at us
        head.rotation_euler = (0, 0, math.radians(-75) * turn + math.radians(4) * math.sin(t * 1.3)); key(head, "rotation_euler", f)
        yawn = math.sin(math.pi * ramp(t, 41.6, 42.7))             # even care: a yawn
        mouth.scale = (1, .3, .2 + 1.6 * yawn); key(mouth, "scale", f)
        for e in eyes: e.scale = (1, 1, 1 - .85 * max(yawn, .0)); key(e, "scale", f)
        for i, s_ in enumerate(tail):
            s_.location = (.45 + i * .1, .05, .2 + i * .05 + .06 * math.sin(t * 2.2 - i * .6) * (i / 5)); key(s_, "location", f)
        aim(cam, (-.4 + .12 * math.sin(t * .5), -5.6, 1.3), (-.15, 0, .45)); key(cam, "location", f); key(cam, "rotation_euler", f)
    bake(frames, anim)
    return frames

BUILD = dict(rocket=build_rocket, problems=build_problems, world=build_world, window=build_window, cat=build_cat)

def linear_all():
    for o in scene.objects:
        ad = o.animation_data
        if not (ad and ad.action): continue
        for layer in getattr(ad.action, "layers", []):
            for st in layer.strips:
                for cb in st.channelbags:
                    for fc in cb.fcurves:
                        for kp in fc.keyframe_points: kp.interpolation = "LINEAR"

if PART == "mosaic":
    # stills for the mosaic: every scene seen from nine framings at a moment from its span
    os.makedirs(os.path.join(OUT, "mosaic"), exist_ok=True)
    picks = dict(problems=[14.5, 16.0, 17.5, 18.8, 19.6, 20.2, 15.2, 16.8, 19.0], world=[22.8, 23.3, 23.8, 24.3, 24.8, 22.6, 23.6, 24.1, 25.0],
                 window=[26.0, 27.0, 28.0, 29.0, 30.0, 30.8, 26.5, 28.5, 29.5], cat=[37.0, 38.0, 39.0, 40.4, 41.0, 42.0, 42.3, 37.5, 39.5])
    for sid, times in picks.items():
        for o in list(bpy.data.objects): bpy.data.objects.remove(o)
        r.film_transparent = False
        BUILD[sid](); linear_all()
        cam = scene.camera; rig = empty("camRig"); cam.parent = rig          # offsets ride on the rig, keys stay on the camera
        r.resolution_x, r.resolution_y = 480, 480
        for k, t in enumerate(times):
            rig.location = (math.sin(k) * .6, 0, math.cos(k * 1.3) * .3)
            scene.frame_set(frame_of(t))
            r.filepath = os.path.join(OUT, "mosaic", f"{sid}_{k}.png"); bpy.ops.render.render(write_still=True)
else:
    frames = BUILD[PART](); linear_all()
    sub = os.path.join(OUT, PART); os.makedirs(sub, exist_ok=True)
    if STILL is not None:
        scene.frame_set(frame_of(STILL)); r.filepath = os.path.join(OUT, "stills", f"{PART}_{STILL:.2f}.png")
        os.makedirs(os.path.dirname(r.filepath), exist_ok=True); bpy.ops.render.render(write_still=True)
    else:
        scene.frame_start, scene.frame_end = frames[0], frames[-1]
        r.filepath = os.path.join(sub, ""); bpy.ops.render.render(animation=True)
