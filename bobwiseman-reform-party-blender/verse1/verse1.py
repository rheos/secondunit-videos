"""Reform Party at Burning Man, Blender test 2: verse 1 (16.70-40.45 s) on draft 5's drone camera.

Blender renders draft 5's own world: tools/export_state.mjs dumps the camera, car, sun, sky and poses
per frame from the page; the modules build geometry and key it from that state.

    node tools/export_state.mjs <reform-party dir> 16.7 570 tools/probes/*.js     # once, from the folder above
    blender -b --factory-startup --python verse1/verse1.py -- --stills 1,100,300
    blender -b --factory-startup --python verse1/verse1.py -- --render [--from 1 --to 570]
    blender -b --factory-startup --python verse1/verse1.py -- --only rp_car,rp_playa --stills 40

Modules (each has build()): rp_car (table car, suits, gavel, speakerphone), rp_playa (sky, ground,
horizon, city, lamps, bikes, crowd, dust), rp_installs (the lyric installations, tape recorders, blind).
"""
import importlib
import math
import os
import sys
import time

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rp_core as K  # noqa: E402  (resets the scene on import)

MODULES = (K.arg("--only") or "rp_car,rp_playa,rp_installs,rp_people").split(",")
LINEART = "--no-lineart" not in K.ARGS and K.LOOK != "pbr"
S = K.state("core")
scn = K.scn

built = []
for name in MODULES:
    try:
        mod = importlib.import_module(name)
    except ModuleNotFoundError as e:
        print("[v1] module %s missing (%s), skipped" % (name, e))
        continue
    t0 = time.time()
    mod.build()
    built.append(name)
    print("[v1] built %s in %.1f s" % (name, time.time() - t0))

# =============================================================================================
# camera: draft 5's camAt(t), per frame. Draft focal length is px on a 1920-wide frame.
# Blender camera looks down -Z; rotation (90 deg - pitch, 0, -yaw) looks along draft (sin yaw, cos yaw).
# =============================================================================================
cd = bpy.data.cameras.new("RP_Camera")
cd.sensor_fit = "HORIZONTAL"
cd.sensor_width = 36.0
cd.clip_start = 0.03
cd.clip_end = 6000
CAM = bpy.data.objects.new("RP_Camera", cd)
K.COL_WORLD.objects.link(CAM)
scn.camera = CAM
cams = [s["cam"] for s in S]
K.key_loc(CAM, [K.B(c[0], c[1], c[2]) for c in cams])
K.key_rot(CAM, [(math.pi / 2 - c[3], 0.0, -c[5]) for c in cams])
K.key_series(cd, "lens", [c[4] / 1920 * 36.0 for c in cams])

# =============================================================================================
# light: the draft's sun (sunEl, sunDir per frame; shadows), a shadowless key that turns with the camera
# =============================================================================================
def sun_obj(name, strength, shadow):
    ld = bpy.data.lights.new("RP_" + name, "SUN")
    ld.energy, ld.angle, ld.use_shadow, ld.color = strength, 0.0, shadow, (1, 1, 1)
    ob = bpy.data.objects.new("RP_" + name, ld)
    K.COL_WORLD.objects.link(ob)
    return ob


def aim(travel_xy, el_deg):
    e = math.radians(el_deg)
    h = Vector((travel_xy[0], travel_xy[1], 0))
    h = (h.normalized() if h.length else Vector((1, 0, 0))) * math.cos(e)
    return Vector((h.x, h.y, -math.sin(e))).to_track_quat("-Z", "Y").to_euler()


PBR = K.LOOK == "pbr"
SUN = sun_obj("Sun", float(K.arg("--sun", 4.2)) if PBR else 0.9 * math.pi, True)
if PBR:
    SUN.data.angle = math.radians(0.8)          # the real sun's disc is .53 deg; a touch softer reads nicer
    SUN.data.color = (1.0, 0.95, 0.86)
prev = None
rots = []
for s in S:
    e = aim(s["sunDir"], max(s["sunEl"], 1.0))
    if prev is not None:
        e.make_compatible(prev)
    prev = e
    rots.append(e)
K.key_rot(SUN, rots)
KEY = sun_obj("Key", 0.0 if PBR else 0.7 * math.pi, False)   # pbr: sky light only, no cheat key
prev = None
rots = []
for c in cams:                 # from 35 deg left of the camera's heading, 50 deg up, travelling away from it
    yw = c[5]
    fwd = (math.sin(yw), math.cos(yw))
    left = (-math.cos(yw), math.sin(yw))
    to_light = (-fwd[0] * math.cos(0.61) + left[0] * math.sin(0.61), -fwd[1] * math.cos(0.61) + left[1] * math.sin(0.61))
    e = aim((-to_light[0], -to_light[1]), 50)
    if prev is not None:
        e.make_compatible(prev)
    prev = e
    rots.append(e)
K.key_rot(KEY, rots)

# haze colour follows the draft's low sky colour (dawn amber to midday white-blue across the verse)
for i in range(3):                 # node-group sockets are keyed on the group (an ID), by data path
    K.key_series(K.haze_group(), 'nodes["HazeColor"].outputs[0].default_value', [K.lin_rgb([K.lerp(a, b, 0.45) for a, b in zip(s["sky"][1], (226, 210, 180))])[i] for s in S], index=i)

# world: ambient for the lighting; what the camera sees of the sky is rp_playa's job (a flat fallback here)
world = scn.world or bpy.data.worlds.new("RP_World")
scn.world = world
world.use_nodes = True
if not world.node_tree.nodes.get("RP_SkyDone"):
    wn, wl = world.node_tree.nodes, world.node_tree.links
    wn.clear()
    lp, bg_cam, bg_amb = wn.new("ShaderNodeLightPath"), wn.new("ShaderNodeBackground"), wn.new("ShaderNodeBackground")
    wmix, wout = wn.new("ShaderNodeMixShader"), wn.new("ShaderNodeOutputWorld")
    bg_cam.inputs[0].default_value = K.lin("#7fa3cf")
    bg_amb.inputs[0].default_value = K.lin("#a9c3e6") if PBR else (1, 1, 1, 1)
    bg_amb.inputs[1].default_value = float(K.arg("--sky", 1.1)) if PBR else 0.25
    wl.new(lp.outputs["Is Camera Ray"], wmix.inputs[0])
    wl.new(bg_amb.outputs[0], wmix.inputs[1])
    wl.new(bg_cam.outputs[0], wmix.inputs[2])
    wl.new(wmix.outputs[0], wout.inputs[0])

# =============================================================================================
# characters: --chars cutout turns every object tagged rp_char into a lit paper cut-out. The camera sees a
# copy squashed toward the lens (geometry nodes: each vertex pulled onto the plane through the object's
# origin square to the camera ray, depth kept at CUT_DEPTH); the 3D original stays for the sun only, so the
# shadows keep a real silhouette. --chars 3d leaves them as built.
# =============================================================================================
CUT_DEPTH = float(K.arg("--cut-depth", 0.04))


def flatten_group():
    """Each vertex p slides along its own camera ray onto the plane square to (centre -> lens) that sits at
    CUT_DEPTH of its original depth from the part's centre: same place on screen, nearly no thickness."""
    g = bpy.data.node_groups.new("RP_Flatten", "GeometryNodeTree")
    g.interface.new_socket("Geometry", in_out="INPUT", socket_type="NodeSocketGeometry")
    g.interface.new_socket("Centre", in_out="INPUT", socket_type="NodeSocketVector")
    g.interface.new_socket("Geometry", in_out="OUTPUT", socket_type="NodeSocketGeometry")
    n, l = g.nodes, g.links
    gi, go = n.new("NodeGroupInput"), n.new("NodeGroupOutput")
    oi = n.new("GeometryNodeObjectInfo")
    oi.transform_space = "RELATIVE"
    oi.inputs["Object"].default_value = CAM
    pos, setp = n.new("GeometryNodeInputPosition"), n.new("GeometryNodeSetPosition")

    def vm(op, a, b=None, out=0):
        m = n.new("ShaderNodeVectorMath")
        m.operation = op
        l.new(a, m.inputs[0])
        if b is not None:
            l.new(b, m.inputs[1])
        return m.outputs[out]

    def fm(op, a, b):
        m = n.new("ShaderNodeMath")
        m.operation = op
        for i, x in enumerate((a, b)):
            if isinstance(x, float):
                m.inputs[i].default_value = x
            else:
                l.new(x, m.inputs[i])
        return m.outputs[0]

    cam = oi.outputs["Location"]
    c = gi.outputs["Centre"]
    v = vm("NORMALIZE", vm("SUBTRACT", cam, c))                       # centre -> lens
    pc = vm("SUBTRACT", pos.outputs[0], c)                             # p relative to the centre
    cc = vm("SUBTRACT", cam, c)                                        # lens relative to the centre
    dp = vm("DOT_PRODUCT", pc, v, out="Value")                         # p's depth toward the lens
    dc = vm("DOT_PRODUCT", cc, v, out="Value")
    ray = vm("SUBTRACT", pc, cc)                                       # lens -> p
    dr = vm("DOT_PRODUCT", ray, v, out="Value")
    t = fm("DIVIDE", fm("SUBTRACT", fm("MULTIPLY", dp, CUT_DEPTH), dc), dr)
    sc = n.new("ShaderNodeVectorMath")
    sc.operation = "SCALE"
    l.new(ray, sc.inputs[0])
    l.new(t, sc.inputs["Scale"])
    q = vm("ADD", vm("ADD", cc, sc.outputs[0]), c)                     # back to object space
    l.new(gi.outputs["Geometry"], setp.inputs["Geometry"])
    l.new(q, setp.inputs["Position"])
    l.new(setp.outputs[0], go.inputs[0])
    return g


CHAR_OBS = [o for o in bpy.data.objects if o.get("rp_char")]
if K.CHARS == "cutout" and CHAR_OBS:
    fg = flatten_group()
    for o in CHAR_OBS:
        if o.type != "MESH":
            continue
        c = o.copy()                                   # shares mesh, shape keys, keyed action and parent
        for coll in o.users_collection:
            coll.objects.link(c)
        c.name = o.name + "_Cut"
        md = c.modifiers.new("RP_Flatten", "NODES")
        md.node_group = fg
        vs = o.data.vertices
        ctr = sum((v.co for v in vs), Vector()) / max(1, len(vs))
        for item in fg.interface.items_tree:
            if item.name == "Centre":
                md[item.identifier] = ctr
        c.visible_shadow = False
        o.visible_camera = False
    print("[v1] cutout: %d character parts flattened toward the lens" % len(CHAR_OBS))
else:
    print("[v1] characters: 3d (%d parts)" % len(CHAR_OBS))

# =============================================================================================
# ink: Grease Pencil Line Art over the car and the installations
# =============================================================================================
if LINEART:
    for coll, nm in ((K.COL_CAR, "RP_LineArtCar"), (K.COL_INST, "RP_LineArtInst")):
        if not coll.all_objects:
            continue
        bpy.ops.object.grease_pencil_add(type="LINEART_SCENE")
        gp = bpy.context.active_object
        gp.name = nm
        for c in gp.users_collection:
            c.objects.unlink(gp)
        K.COL_WORLD.objects.link(gp)
        la = gp.modifiers[0]
        la.source_type, la.source_collection = "COLLECTION", coll
        la.use_crease, la.crease_threshold, la.use_intersection = True, math.radians(140), False
        la.radius = float(K.arg("--ink", 0.006))
        la.opacity = 0.85
        mat = la.target_material or (gp.data.materials[0] if gp.data.materials else None)
        if mat and mat.grease_pencil:
            mat.grease_pencil.color = K.lin("#2a140c")

# =============================================================================================
# render
# =============================================================================================
engines = {e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items}
scn.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"
scn.eevee.taa_render_samples = int(K.arg("--samples", 16))
scn.view_settings.view_transform = "AgX" if PBR else "Standard"
scn.view_settings.look = "AgX - Punchy" if PBR else "None"     # keeps the draft's reds and blues saturated
scn.view_settings.exposure = float(K.arg("--exposure", 0.35)) if PBR else 0.0
if PBR:
    ee = scn.eevee
    for a, v in (("use_shadows", True), ("shadow_ray_count", 2), ("shadow_step_count", 8), ("use_raytracing", True),
                 ("fast_gi_method", "GLOBAL_ILLUMINATION"), ("use_fast_gi", True), ("fast_gi_distance", 6.0),
                 ("shadow_resolution_scale", 1.0)):
        if hasattr(ee, a):
            try:
                setattr(ee, a, v)
            except Exception as e:
                print("[v1] eevee", a, e)
    # haze lives in the materials (rp_core.pbr_out): a mist pass tiles over the screen-space sky
scn.render.resolution_x, scn.render.resolution_y = K.RES
scn.render.resolution_percentage = 100
scn.render.fps = K.FPS
scn.frame_start = int(K.arg("--from", 1))
scn.frame_end = int(K.arg("--to", K.NF))
scn.render.image_settings.file_format = "PNG"
scn.render.image_settings.color_mode = "RGB"
print("[v1] %s; %d frames from %.2f s; %d objects" % (",".join(built), K.NF, K.T0, len([o for o in bpy.data.objects if o.name.startswith("RP_")])))

out = os.path.join(K.ROOT, "out", K.arg("--out", "v1"))
stills = K.arg("--stills")
if stills:
    os.makedirs(os.path.join(out, "stills"), exist_ok=True)
    tag = K.arg("--tag", "")
    for fs in stills.split(","):
        f = int(fs)
        scn.frame_set(f)
        scn.render.filepath = os.path.join(out, "stills", "f%04d%s.png" % (f, ("_" + tag) if tag else ""))
        t0 = time.time()
        bpy.ops.render.render(write_still=True)
        print("[v1] still f%04d (t=%.3f) %.1f s" % (f, K.ft(f), time.time() - t0))
if "--render" in K.ARGS:
    os.makedirs(os.path.join(out, "frames"), exist_ok=True)
    scn.render.filepath = os.path.join(out, "frames", "f_")
    t0 = time.time()
    bpy.ops.render.render(animation=True)
    n = scn.frame_end - scn.frame_start + 1
    print("[v1] rendered %d frames in %.0f s (%.2f s/frame)" % (n, time.time() - t0, (time.time() - t0) / n))
if K.arg("--save"):
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(K.ROOT, K.arg("--save")))
