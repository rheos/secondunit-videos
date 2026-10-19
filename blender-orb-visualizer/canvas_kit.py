# Shared kit for the 8-second Canvas loops (takes 02-04, Blender 4.5 LTS, EEVEE).
#
# Voxel boxes with 16x16 textures generated in Python, sampled Closest through box projection in world metres,
# so pixel density is the same on every box. Frames render at 180x320; tools/canvas_encode.sh scales them x4
# nearest-neighbour to 720x1280. Every datablock is named CL_..., so a take re-runs in an open file.
#
# A take script builds its world with these helpers, keys every frame of FRAMES itself (every period must
# divide 8 s), then calls linear_keys() and run(OUT).
import bpy, bmesh, math, random, sys, os
from mathutils import Vector

FPS, SECONDS = 24, 8
FRAMES = FPS * SECONDS                       # 192; frame 193 would equal frame 1
RES = (180, 320)                             # x4 nearest = 720x1280
MATS = {}

def reset():
    """Remove our own CL_ datablocks and the factory-startup cube, light and camera. Returns the scene."""
    MATS.clear()
    for coll in (bpy.data.objects, bpy.data.meshes, bpy.data.materials, bpy.data.images, bpy.data.cameras, bpy.data.lights, bpy.data.worlds, bpy.data.actions):
        for d in list(coll):
            if d.name.startswith("CL_"):
                coll.remove(d)
    for o in list(bpy.data.objects):
        if o.name in ("Cube", "Light", "Camera"):
            bpy.data.objects.remove(o)
    return bpy.context.scene

def hex_lin(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]

# ---------- pixel textures ----------
def tex_image(name, base, jitter=0.07, seed=1, pattern=None, size=16):
    img = bpy.data.images.new("CL_img_" + name, size, size, alpha=False)
    rnd = random.Random(seed); px = []
    b = hex_lin(base)
    for y in range(size):
        for x in range(size):
            c = pattern(x, y, rnd) if pattern else None
            if c is None:
                k = 1 + (rnd.random() - .5) * 2 * jitter
                c = [min(1, v * k) for v in b]
            px += [c[0], c[1], c[2], 1.0]
    img.pixels = px; img.pack()
    return img

def mat(name, base, jitter=0.07, seed=1, texel=0.1, pattern=None, rough=0.95, emit=0.0):
    """Principled material with a 16x16 image mapped in world metres (texel = metres per pixel), Closest."""
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new("CL_" + name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = rough
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
    s = 1 / (16 * texel); mp.inputs["Scale"].default_value = (s, s, s)
    im = nt.nodes.new("ShaderNodeTexImage"); im.image = tex_image(name, base, jitter, seed, pattern)
    im.interpolation = "Closest"; im.projection = "BOX"; im.extension = "REPEAT"
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"]); nt.links.new(mp.outputs["Vector"], im.inputs["Vector"])
    nt.links.new(im.outputs["Color"], bsdf.inputs["Base Color"])
    if emit:
        nt.links.new(im.outputs["Color"], bsdf.inputs["Emission Color"]); bsdf.inputs["Emission Strength"].default_value = emit
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    MATS[name] = m; return m

def specks(c1, c2, p):
    """dirt with stone pixels: a few pixels of c1/c2 scattered through the base"""
    A1, A2 = hex_lin(c1), hex_lin(c2)
    return lambda x, y, rnd: (A1 if rnd.random() < .6 else A2) if rnd.random() < p else None

def windows(base, lit):
    B, L, D = hex_lin(base), hex_lin(lit), hex_lin("#3b3a4a")
    def f(x, y, rnd):
        if x % 4 in (1, 2) and y % 4 in (1, 2): return L if rnd.random() < .55 else D
        return None
    return f

def stripes(c1, c2, w=2):
    A1, A2 = hex_lin(c1), hex_lin(c2)
    return lambda x, y, rnd: A1 if (x // w) % 2 == 0 else A2

# ---------- boxes ----------
def box(name, size, loc, material, parent=None, rot=None):
    me = bpy.data.meshes.new("CL_" + name); bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new("CL_" + name, me); bpy.context.scene.collection.objects.link(ob)
    ob.location = loc; me.materials.append(material)
    if rot: ob.rotation_euler = rot
    if parent: ob.parent = parent
    return ob

def empty(name, loc=(0, 0, 0), parent=None):
    ob = bpy.data.objects.new("CL_" + name, None); bpy.context.scene.collection.objects.link(ob)
    ob.location = loc
    if parent: ob.parent = parent
    return ob

# ---------- camera, light, sky ----------
def camera(loc, target, lens=50, sensor=24):
    scene = bpy.context.scene
    cd = bpy.data.cameras.new("CL_cam"); cd.lens = lens; cd.sensor_fit = "VERTICAL"; cd.sensor_height = sensor
    cam = bpy.data.objects.new("CL_cam", cd); scene.collection.objects.link(cam); scene.camera = cam
    cam.location = loc
    tgt = empty("camTarget", target)
    tr = cam.constraints.new("TRACK_TO"); tr.target = tgt; tr.track_axis = "TRACK_NEGATIVE_Z"; tr.up_axis = "UP_Y"
    return cam

def sun(energy, rot_deg, color=(1.0, .96, .9), angle_deg=6):
    d = bpy.data.lights.new("CL_sun", "SUN"); d.energy = energy; d.angle = math.radians(angle_deg); d.color = color
    ob = bpy.data.objects.new("CL_sun", d); bpy.context.scene.collection.objects.link(ob)
    ob.rotation_euler = tuple(math.radians(a) for a in rot_deg)
    return ob

def sky(stops, strength=1.0):
    """World colour graded in screen space, bottom of frame (0) to top (1), so it reads whatever the camera
    tilt. stops = [(position, hex), ...] in order."""
    world = bpy.data.worlds.new("CL_world"); bpy.context.scene.world = world; world.use_nodes = True
    wn = world.node_tree; wn.nodes.clear()
    wo = wn.nodes.new("ShaderNodeOutputWorld"); bg = wn.nodes.new("ShaderNodeBackground")
    tc = wn.nodes.new("ShaderNodeTexCoord"); sep = wn.nodes.new("ShaderNodeSeparateXYZ"); ramp = wn.nodes.new("ShaderNodeValToRGB")
    wn.links.new(tc.outputs["Window"], sep.inputs["Vector"]); wn.links.new(sep.outputs["Y"], ramp.inputs["Fac"])
    el = ramp.color_ramp.elements
    el[0].position, el[0].color = stops[0][0], (*hex_lin(stops[0][1]), 1)
    el[1].position, el[1].color = stops[-1][0], (*hex_lin(stops[-1][1]), 1)
    for p, h in stops[1:-1]:
        e = el.new(p); e.color = (*hex_lin(h), 1)
    wn.links.new(ramp.outputs["Color"], bg.inputs["Color"]); bg.inputs["Strength"].default_value = strength
    wn.links.new(bg.outputs["Background"], wo.inputs["Surface"])
    return world

# ---------- render ----------
def render_setup(out, samples=16, filter_size=0.6):
    scene = bpy.context.scene; r = scene.render
    r.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items] else "BLENDER_EEVEE"
    r.resolution_x, r.resolution_y, r.resolution_percentage = RES[0], RES[1], 100
    r.fps = FPS; r.filter_size = filter_size
    scene.eevee.taa_render_samples = samples
    scene.view_settings.view_transform = "Standard"
    r.image_settings.file_format = "PNG"; r.image_settings.color_mode = "RGB"
    scene.frame_start, scene.frame_end = 1, FRAMES
    os.makedirs(os.path.join(out, "frames"), exist_ok=True)
    r.filepath = os.path.join(out, "frames", "")

def linear_keys():
    """Every value is keyed on every frame; make the interpolation linear so nothing eases at the seam."""
    for ob in bpy.context.scene.objects:
        ad = ob.animation_data
        if ad and ad.action:
            for layer in getattr(ad.action, "layers", []):
                for strip in layer.strips:
                    for cb_ in strip.channelbags:
                        for fc in cb_.fcurves:
                            for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
            if hasattr(ad.action, "fcurves"):
                for fc in ad.action.fcurves:
                    for kp in fc.keyframe_points: kp.interpolation = "LINEAR"

def run(out):
    """-- --stills 1,49,97 renders test stills to out/stills; -- --render renders all frames to out/frames."""
    scene = bpy.context.scene; r = scene.render
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if "--stills" in argv:
        frames = [int(x) for x in argv[argv.index("--stills") + 1].split(",")]
        os.makedirs(os.path.join(out, "stills"), exist_ok=True)
        for fr in frames:
            scene.frame_set(fr); r.filepath = os.path.join(out, "stills", f"f{fr:04d}.png")
            bpy.ops.render.render(write_still=True)
        r.filepath = os.path.join(out, "frames", "")
    elif "--render" in argv:
        bpy.ops.render.render(animation=True)
