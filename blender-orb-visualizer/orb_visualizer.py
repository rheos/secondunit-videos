"""
ORB VISUALIZER  -  a 24-second stylized music-video sequence for Blender 4.5 LTS (EEVEE)

Paste into the Text Editor of a NEW file and press Run Script (or: blender -b -P orb_visualizer.py -a).
WARNING: it deletes every object in the current scene before building.

The piece is 12 bars of 4/4 at 120 BPM, in four sections:
  bars 1-3   ORBITS    the orb hovers in a gyroscope of rings and satellites at dusk
  bars 4-6   CORRIDOR  it whips through a light gate and weaves down a row of arches
  bars 7-9   PILLARS   it skims a field of pillars that ripple outward from the centre
  bars 10-12 FINALE    it arrives under a halo, a cloud of shards bursts out, it rises

How the parts fit together:
  * Every time is written in BEATS, so changing BPM re-times the whole piece.
  * One empty, "OV_Controller", carries a custom property "energy" (0..~1.6). It is keyed with a
    pulse on every beat. Drivers read it for the orb glow, the orb light, bloom strength, arch scale
    and pillar height. Replace that single curve with your song (see notes at the bottom) and the
    whole scene reacts to the music.
  * Main motion (orb, camera, lens, framing) is keyframed. Secondary motion is procedural:
    linear extrapolation for spins, Noise modifiers for drift, drivers for the ripple.
  * Look: cel shading (Diffuse > Shader to RGB > constant Color Ramp) with an inverted-hull outline,
    "Standard" view transform so palette hexes come out exact, mist-pass fog and bloom in the compositor.
"""

import bpy
import bmesh
import math
import os
import random
from mathutils import Vector

# =============================================================================================
# 1. SETTINGS  (the knobs you will most likely touch)
# =============================================================================================
FPS = 24
BPM = 120.0
BEATS_PER_BAR = 4
TOTAL_BEATS = 48                      # 12 bars -> 24 s at 120 BPM
PREVIEW = True                        # True: 50% res, 16 samples. False: 1080p, 64 samples
OUTLINES = True                       # inverted-hull ink lines (adds geometry; turn off for speed)
SEED = 7                              # change for a different scatter of satellites / shards
AUDIO_PATH = ""                       # optional song file; added to the sequencer and muxed into the MP4
BEAT_TIMES = None                     # optional [seconds, ...] or [(seconds, strength), ...] from a beat tracker

FRAMES_PER_BEAT = FPS * 60.0 / BPM
FRAME_START = 1
FRAME_END = FRAME_START + round(TOTAL_BEATS * FRAMES_PER_BEAT) - 1     # 576


def beat(n):
    """Beat number (float allowed) -> frame. Everything in this file is timed through here."""
    return min(FRAME_START + round(n * FRAMES_PER_BEAT), FRAME_END)


# Section starts, in beats. A "drop" gets a stronger energy hit, a fog swell and a palette change.
SECTIONS = [("orbits", 0), ("corridor", 12), ("pillars", 24), ("finale", 36)]
DROP_BEATS = [12, 24, 36]

random.seed(SEED)


# =============================================================================================
# 2. PALETTE  (hex is sRGB as you see it in a colour picker; nodes want scene-linear)
# =============================================================================================
def hex_to_linear(h, alpha=1.0):
    h = h.lstrip("#")
    srgb = [int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, alpha)


def mix(a, b, t):
    return tuple(x + (y - x) * t for x, y in zip(a, b))


C = {k: hex_to_linear(v) for k, v in {
    "ink": "#17122B",      # outlines, fade-to-black
    "shadow": "#2A1F4A",   # every cel shadow leans toward this violet
    "plum": "#4A2F63",
    "coral": "#F2786D",
    "peach": "#FFB38A",
    "cream": "#FFF1DC",
    "gold": "#FFD27A",
    "teal": "#3BB7B0",
    "lilac": "#9C8BD8",
}.items()}

# Fog / sky colour per section (the compositor fades distant geometry into it).
SKY = {
    "orbits": hex_to_linear("#3A2F6B"),
    "corridor": hex_to_linear("#E39A8E"),
    "pillars": hex_to_linear("#16505E"),
    "finale": hex_to_linear("#1C1535"),
}


# =============================================================================================
# 3. ANIMATION HELPERS  (Blender 4.4+ "slotted actions" aware)
# =============================================================================================
def ensure_fcurve(id_data, data_path, index=0):
    """Get or create an F-Curve. In 4.4+ actions have layers/slots; action.fcurves is a legacy
    shim that is gone in 5.0, so use fcurve_ensure_for_datablock when it exists."""
    ad = id_data.animation_data or id_data.animation_data_create()
    if ad.action is None:
        ad.action = bpy.data.actions.new(f"OV_{id_data.name}_Action")
    act = ad.action
    if hasattr(act, "fcurve_ensure_for_datablock"):
        return act.fcurve_ensure_for_datablock(id_data, data_path, index=index)
    return act.fcurves.find(data_path, index=index) or act.fcurves.new(data_path, index=index)


def iter_fcurves(id_data):
    """All F-Curves of an ID's active action, for both the 4.4+ layered and the legacy layout."""
    ad = id_data.animation_data
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


def key_track(target, prop, track, index=-1):
    """Key a property from a list of (beat, value). Works on objects, data, node sockets and
    nested structs alike; a socket's keys land on its node tree's action."""
    for b, value in track:
        if index >= 0:
            getattr(target, prop)[index] = value
            target.keyframe_insert(prop, index=index, frame=beat(b))
        else:
            setattr(target, prop, value)
            target.keyframe_insert(prop, frame=beat(b))


def set_interpolation(id_data, interp="BEZIER", easing="AUTO", path_prefix=""):
    for fc in iter_fcurves(id_data):
        if fc.data_path.startswith(path_prefix):
            for kp in fc.keyframe_points:
                kp.interpolation = interp
                kp.easing = easing


def spin(obj, axis_index, beats_per_turn, phase=0.0):
    """Endless constant spin from two keys + linear extrapolation (no per-frame keys)."""
    obj.rotation_euler[axis_index] = phase
    obj.keyframe_insert("rotation_euler", index=axis_index, frame=beat(0))
    obj.rotation_euler[axis_index] = phase + 2 * math.pi
    obj.keyframe_insert("rotation_euler", index=axis_index, frame=beat(beats_per_turn))
    fc = ensure_fcurve(obj, "rotation_euler", axis_index)
    for kp in fc.keyframe_points:
        kp.interpolation = "LINEAR"
    fc.extrapolation = "LINEAR"


def drift(obj, axis_index, strength, scale_beats, phase=None):
    """Organic float: one key + a Noise F-Curve modifier. Cheap and never repeats."""
    obj.keyframe_insert("location", index=axis_index, frame=FRAME_START)
    fc = ensure_fcurve(obj, "location", axis_index)
    mod = fc.modifiers.new("NOISE")
    mod.strength = strength
    mod.scale = scale_beats * FRAMES_PER_BEAT
    mod.phase = random.uniform(0, 100) if phase is None else phase


def add_driver(owner, path, expression, index=-1):
    """Driver whose expression can use `e` (controller energy) and `frame`. Only simple
    expressions (math, sin, frame) are used, so they run without 'Auto Run Python Scripts'."""
    fcs = owner.driver_add(path, index) if index >= 0 else owner.driver_add(path)
    for fc in (fcs if isinstance(fcs, list) else [fcs]):
        drv = fc.driver
        drv.type = "SCRIPTED"
        var = drv.variables.new()
        var.name = "e"
        var.type = "SINGLE_PROP"
        var.targets[0].id_type = "OBJECT"
        var.targets[0].id = CTRL
        var.targets[0].data_path = '["energy"]'
        drv.expression = expression


# =============================================================================================
# 4. SCENE RESET  (re-runnable: removes this script's datablocks, never your Text)
# =============================================================================================
scn = bpy.context.scene

for ob in list(scn.objects):
    bpy.data.objects.remove(ob, do_unlink=True)
for coll_type in (bpy.data.collections, bpy.data.meshes, bpy.data.materials, bpy.data.lights,
                  bpy.data.cameras, bpy.data.actions, bpy.data.worlds):
    for block in list(coll_type):
        if block.name.startswith("OV_"):
            coll_type.remove(block)
for act in list(bpy.data.actions):          # node-tree actions left behind by a previous run
    if act.users == 0:
        bpy.data.actions.remove(act)


def new_collection(name):
    coll = bpy.data.collections.new(f"OV_{name}")
    scn.collection.children.link(coll)
    return coll


COL_RIG = new_collection("Rig")
COL = {name: new_collection(name.capitalize()) for name, _ in SECTIONS}


# =============================================================================================
# 5. MATERIALS
# =============================================================================================
def _clear(mat):
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    return nt, nt.nodes, nt.links


def toon_material(name, base, shadow=None, light=None):
    """Cel shading: real lighting is measured (Diffuse > Shader to RGB) and then snapped to three
    flat palette colours by a CONSTANT colour ramp. EEVEE only."""
    mat = bpy.data.materials.new(f"OV_{name}")
    nt, n, l = _clear(mat)
    diffuse = n.new("ShaderNodeBsdfDiffuse")
    to_rgb = n.new("ShaderNodeShaderToRGB")
    ramp = n.new("ShaderNodeValToRGB")
    emit = n.new("ShaderNodeEmission")
    out = n.new("ShaderNodeOutputMaterial")
    els = ramp.color_ramp.elements
    ramp.color_ramp.interpolation = "CONSTANT"
    els[0].position, els[0].color = 0.0, shadow or mix(base, C["shadow"], 0.6)
    els[1].position, els[1].color = 0.12, base
    hi = els.new(0.55)
    hi.color = light or mix(base, C["cream"], 0.4)
    l.new(diffuse.outputs["BSDF"], to_rgb.inputs["Shader"])
    l.new(to_rgb.outputs["Color"], ramp.inputs["Fac"])
    l.new(ramp.outputs["Color"], emit.inputs["Color"])
    l.new(emit.outputs["Emission"], out.inputs["Surface"])
    for i, node in enumerate((diffuse, to_rgb, ramp, emit, out)):
        node.location = (i * 220, 0)
    return mat


def glow_material(name, color, strength):
    mat = bpy.data.materials.new(f"OV_{name}")
    nt, n, l = _clear(mat)
    emit = n.new("ShaderNodeEmission")
    out = n.new("ShaderNodeOutputMaterial")
    emit.inputs["Color"].default_value = color
    emit.inputs["Strength"].default_value = strength
    l.new(emit.outputs["Emission"], out.inputs["Surface"])
    out.location = (220, 0)
    return mat


# Outline: a flipped shell (Solidify) with backface culling, so only its silhouette rim shows.
MAT_INK = glow_material("Ink", C["ink"], 1.0)
MAT_INK.use_backface_culling = True

MAT = {
    "floor": toon_material("Floor", C["plum"], light=mix(C["plum"], C["peach"], 0.45)),   # warm pool under the orb
    "cream": toon_material("Cream", C["cream"], light=hex_to_linear("#FFFFFF")),
    "peach": toon_material("Peach", C["peach"]),
    "coral": toon_material("Coral", C["coral"]),
    "teal": toon_material("Teal", C["teal"]),
    "lilac": toon_material("Lilac", C["lilac"]),
    "plum": toon_material("Plum", hex_to_linear("#6A4A8C")),
    "orb": glow_material("Orb", C["gold"], 8.0),
    "gate": glow_material("Gate", C["peach"], 3.0),
    "trail": glow_material("OrbitTrail", C["cream"], 1.2),
    "halo": glow_material("Halo", C["gold"], 2.5),
    "sun_disc": glow_material("SunDisc", C["coral"], 1.0),
    "moon_disc": glow_material("MoonDisc", hex_to_linear("#F7D9B5"), 1.0),
}


# =============================================================================================
# 6. GEOMETRY  (bmesh + bpy.data: no bpy.ops, so no context errors and fast in loops)
# =============================================================================================
def build_mesh(name, fill, materials, smooth=True):
    me = bpy.data.meshes.new(f"OV_{name}")
    bm = bmesh.new()
    fill(bm)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    if smooth:
        me.shade_smooth()
    for m in materials:
        me.materials.append(m)
    if OUTLINES:
        me.materials.append(MAT_INK)          # slot after the surface: the outline shell's material
    return me


def torus(bm, major, minor, seg=96, ring=14):
    verts = []
    for i in range(seg):
        a = 2 * math.pi * i / seg
        for j in range(ring):
            b = 2 * math.pi * j / ring
            r = major + minor * math.cos(b)
            verts.append(bm.verts.new((r * math.cos(a), r * math.sin(a), minor * math.sin(b))))
    for i in range(seg):
        for j in range(ring):
            i2, j2 = (i + 1) % seg, (j + 1) % ring
            bm.faces.new((verts[i * ring + j], verts[i2 * ring + j],
                          verts[i2 * ring + j2], verts[i * ring + j2]))


def cylinder(bm, radius, height, seg=32):
    res = bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=radius, radius2=radius, depth=height)
    bmesh.ops.translate(bm, vec=(0, 0, height / 2), verts=res["verts"])   # base sits at z=0


def add_object(name, data, coll, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), material=None,
               outline=0.0, parent=None):
    ob = bpy.data.objects.new(f"OV_{name}", data)
    coll.objects.link(ob)
    ob.location, ob.rotation_euler, ob.scale = loc, rot, scale
    if parent:
        ob.parent = parent
    if material is not None and ob.material_slots:
        # Per-object colour on a SHARED mesh: link the slot to the object, not the mesh data.
        ob.material_slots[0].link = "OBJECT"
        ob.material_slots[0].material = material
    if OUTLINES and outline > 0 and data is not None:
        sol = ob.modifiers.new("Outline", "SOLIDIFY")
        sol.thickness = outline
        sol.offset = 1.0
        sol.use_flip_normals = True
        sol.use_rim = False
        sol.material_offset = len(data.materials) - 1
    return ob


def add_empty(name, coll, loc=(0, 0, 0), parent=None, size=1.0):
    ob = add_object(name, None, coll, loc=loc, parent=parent)
    ob.empty_display_size = size
    return ob


# Shared meshes: one datablock, many objects (memory and build time stay low).
ME_ORB = build_mesh("Orb", lambda bm: bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=0.45), [MAT["orb"]])
ME_BALL = build_mesh("Ball", lambda bm: bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=16, radius=1.0), [MAT["cream"]])
ME_GEM = build_mesh("Gem", lambda bm: bmesh.ops.create_icosphere(bm, subdivisions=1, radius=1.0), [MAT["cream"]], smooth=False)
ME_PILLAR = build_mesh("Pillar", lambda bm: cylinder(bm, 0.65, 1.0), [MAT["cream"]])
ME_PILLAR.set_sharp_from_angle(angle=math.radians(35))   # 4.1+ replacement for Auto Smooth
ME_FLOOR = build_mesh("Floor", lambda bm: bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=400), [MAT["floor"]], smooth=False)
ME_DISC = build_mesh("Disc", lambda bm: bmesh.ops.create_circle(bm, cap_ends=True, segments=96, radius=1.0), [MAT["sun_disc"]], smooth=False)
ME_ARCH = build_mesh("Arch", lambda bm: torus(bm, 3.4, 0.28), [MAT["coral"]])
ME_GYRO = build_mesh("GyroRing", lambda bm: torus(bm, 1.0, 0.025, ring=8), [MAT["cream"]])
ME_GATE = build_mesh("Gate", lambda bm: torus(bm, 1.0, 0.018, seg=128, ring=8), [MAT["gate"]])


# =============================================================================================
# 7. RIG: controller, orb, light, camera
# =============================================================================================
CTRL = add_empty("Controller", COL_RIG, loc=(0, -4, 3), size=0.5)
CTRL["energy"] = 0.0
CTRL.id_properties_ui("energy").update(min=0.0, max=2.0, description="Music energy, drives glow and motion")

ORB = add_object("Orb", ME_ORB, COL_RIG)
ORB.visible_shadow = False            # the light sits inside the orb; do not let the mesh block it

orb_light = bpy.data.lights.new("OV_OrbLight", "POINT")
orb_light.color = C["gold"][:3]
orb_light.shadow_soft_size = 0.4
add_object("OrbLight", orb_light, COL_RIG, parent=ORB)

# Orb flight path as (beat, location). Gates are crossed exactly on the drops (beats 12 and 24).
ORB_PATH = [
    (0, (0, 0, 0.0)), (4, (0, 0, 0.35)), (8, (0, 0, -0.1)), (10, (0, 3, 0.2)),
    (12, (0, 20, 0.6)),                                           # gate 1
    (14, (0, 30, 0.5)), (16.5, (1.0, 42, 0.8)), (19, (-1.0, 54, 0.3)), (21.5, (0.9, 66, 0.9)),
    (24, (0, 92, 2.0)),                                           # gate 2
    (26, (-3, 103, 4.6)), (29, (2.5, 110, 5.2)), (32, (-0.5, 118, 4.7)), (34, (0, 135, 3.6)),
    (36, (0, 152, 3.0)),                                          # arrives under the halo: burst
    (42, (0, 152, 4.6)), (TOTAL_BEATS, (0, 152, 6.5)),
]
key_track(ORB, "location", ORB_PATH)        # Bezier + auto-clamped handles: smooth, no overshoot

# Glow, light and bloom all follow the same energy curve.
add_driver(MAT["orb"].node_tree.nodes["Emission"].inputs["Strength"], "default_value", "6 + 34*e")
add_driver(orb_light, "energy", "250 + 1400*e")
for m in (MAT["gate"], MAT["halo"]):
    add_driver(m.node_tree.nodes["Emission"].inputs["Strength"], "default_value", "2.5 + 5*e")

# Camera aims at a target that rides on the orb and wanders a little (Noise), like a handheld operator.
CAM_TARGET = add_empty("CamTarget", COL_RIG, parent=ORB, size=0.3)
for axis, amount in ((0, 0.35), (1, 0.2), (2, 0.25)):
    drift(CAM_TARGET, axis, amount, scale_beats=5)

cam_data = bpy.data.cameras.new("OV_Camera")
cam_data.clip_start, cam_data.clip_end = 0.1, 600
cam_data.dof.use_dof = True
cam_data.dof.focus_object = ORB      # focus pull follows the orb for free
cam_data.dof.aperture_fstop = 2.8
CAM = add_object("Camera", cam_data, COL_RIG)
track = CAM.constraints.new("TRACK_TO")
track.target = CAM_TARGET
track.track_axis, track.up_axis = "TRACK_NEGATIVE_Z", "UP_Y"
scn.camera = CAM

# (beat, position, focal length mm, lens shift_x). Shift puts the orb off-centre without a pan.
CAM_PATH = [
    (0, (11, -17, 5.5), 45, 0.14), (9, (5.2, -8.0, 1.6), 58, 0.10),        # slow push-in
    (11, (2.0, 4, 1.2), 40, 0.0), (12.5, (1.2, 18.5, 1.0), 32, 0.0),        # chase through gate 1
    (14, (2.2, 22, 0.0), 30, 0.0), (17, (2.6, 34, -0.8), 30, -0.08),
    (20, (-2.0, 48, 0.2), 30, 0.08), (22.5, (1.4, 62, 1.0), 30, 0.0),
    (24.5, (0.5, 89, 3.0), 30, 0.0),                                         # through gate 2
    (26, (-9, 99, 2.5), 35, 0.12), (29, (-4, 104, 12.0), 35, 0.08),          # crane up over the pillars
    (31.5, (-1, 110, 16.0), 35, 0.0), (34.5, (-1, 128, 7.0), 30, 0.0),
    (36, (3, 137, 4.0), 35, 0.10), (42, (6, 133, 3.5), 32, 0.10),           # finale: pull back wide
    (TOTAL_BEATS, (12, 124, 4.5), 24, 0.12),
]
key_track(CAM, "location", [(b, p) for b, p, _, _ in CAM_PATH])
key_track(cam_data, "lens", [(b, f) for b, _, f, _ in CAM_PATH])
key_track(cam_data, "shift_x", [(b, s) for b, _, _, s in CAM_PATH])
# Shallow focus everywhere except over the pillar field, where the ripple should read.
key_track(cam_data.dof, "aperture_fstop", [(0, 2.8), (24, 2.8), (26, 8.0), (33, 8.0), (35, 2.8)])


# =============================================================================================
# 8. ENERGY CURVE  (one F-Curve, written in bulk with foreach_set)
# =============================================================================================
def build_energy():
    if BEAT_TIMES:
        hits = [(FRAME_START + (t[0] if isinstance(t, (tuple, list)) else t) * FPS,
                 t[1] if isinstance(t, (tuple, list)) else 0.8) for t in BEAT_TIMES]
    else:
        hits = [(beat(n), 1.6 if n in DROP_BEATS else (1.0 if n % BEATS_PER_BAR == 0 else 0.5))
                for n in range(TOTAL_BEATS)]
    decay = FRAMES_PER_BEAT * 0.8
    points = []
    for f, strength in hits:
        points += [(f, strength), (f + decay, 0.0)]
    points.sort()
    fc = ensure_fcurve(CTRL, '["energy"]', 0)
    fc.keyframe_points.clear()
    fc.keyframe_points.add(len(points))
    fc.keyframe_points.foreach_set("co", [v for p in points for v in p])
    for kp in fc.keyframe_points:
        if kp.co.y > 0:                     # peak -> fast exponential decay
            kp.interpolation, kp.easing = "EXPO", "EASE_OUT"
        else:                               # rest -> short linear attack into the next hit
            kp.interpolation = "LINEAR"
    fc.update()


build_energy()


# =============================================================================================
# 9. WORLD, LIGHT, FLOOR
# =============================================================================================
world = bpy.data.worlds.new("OV_World")
scn.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Strength"].default_value = 0.5      # low ambient keeps the cel shadows readable
# Sky colour switches inside each fog swell, so the change is hidden and reads as a new place.
sky_track = [(0, SKY["orbits"])]
for (name, start), (prev, _) in zip(SECTIONS[1:], SECTIONS[:-1]):
    sky_track += [(start - 1, SKY[prev]), (start - 0.25, SKY[name])]
key_track(bg.inputs["Color"], "default_value", sky_track)

mist = world.mist_settings
mist.start, mist.depth, mist.falloff = 6.0, 70.0, "QUADRATIC"
mist_track = [(0, 70.0)]
for d in DROP_BEATS:                          # fog swells over 3 beats, clears fast on the drop
    mist_track += [(d - 3, 70.0), (d - 0.25, 9.0), (d, 9.0), (d + 1.5, 70.0)]
key_track(mist, "depth", mist_track)

sun_data = bpy.data.lights.new("OV_Sun", "SUN")
sun_data.energy = 2.2
sun_data.angle = math.radians(3)
sun_data.color = C["cream"][:3]
add_object("Sun", sun_data, COL_RIG, rot=(math.radians(52), 0, math.radians(-38)))

add_object("Floor", ME_FLOOR, COL_RIG, loc=(0, 80, -3))


def backdrop_disc(name, coll, loc, radius, material):
    """A big flat circle (sun, moon, halo) that always faces the camera: a classic graphic device."""
    ob = add_object(name, ME_DISC, coll, loc=loc, scale=(radius,) * 3, material=material)
    face = ob.constraints.new("DAMPED_TRACK")
    face.target, face.track_axis = CAM, "TRACK_Z"
    return ob


# =============================================================================================
# 10. SECTION A - ORBITS
# =============================================================================================
col = COL["orbits"]
backdrop_disc("SunsetDisc", col, (-18, 34, 1.5), 9, MAT["sun_disc"])

# Gyroscope: two big rings tumbling on different axes at different speeds.
for i, (radius, axis, beats_per_turn) in enumerate(((2.6, 0, 16), (3.4, 1, 24))):
    ring = add_object(f"Gyro{i}", ME_GYRO, col, scale=(radius,) * 3, outline=0.012 / radius)
    spin(ring, axis, beats_per_turn, phase=i * 0.7)

# Satellites: a pivot empty spins; its child ball rides along. rotation_mode ZXY means the spin (Z)
# happens inside the tilted plane (X), so each orbit keeps its own inclination.
for i in range(4):
    pivot = add_empty(f"Pivot{i}", col, size=0.2)
    pivot.rotation_mode = "ZXY"
    pivot.rotation_euler[0] = math.radians(random.uniform(-65, 65))
    pivot.rotation_euler[1] = math.radians(random.uniform(-20, 20))
    radius = 1.4 + i * 0.75
    spin(pivot, 2, beats_per_turn=random.choice((4, 6, 8)) * (1 if i % 2 else -1), phase=random.uniform(0, 6))
    size = random.uniform(0.12, 0.22)
    add_object(f"Satellite{i}", ME_BALL, col, loc=(radius, 0, 0), scale=(size,) * 3, parent=pivot,
               material=(MAT["teal"], MAT["coral"], MAT["cream"], MAT["lilac"])[i], outline=0.06)
    add_object(f"OrbitTrail{i}", ME_GATE, col, scale=(radius,) * 3, parent=pivot, material=MAT["trail"])

# Soft floating shapes in the distance, bobbing on Noise modifiers.
for i in range(6):
    ang = random.uniform(0.4, 2.8)
    dist = random.uniform(12, 20)
    s = random.uniform(0.6, 1.6)
    blob = add_object(f"Drifter{i}", ME_BALL, col, loc=(math.cos(ang) * dist, math.sin(ang) * dist - 2, random.uniform(-1.5, 2.5)),
                      scale=(s,) * 3, material=random.choice((MAT["peach"], MAT["lilac"], MAT["plum"])), outline=0.04 / s)
    drift(blob, 2, strength=0.8, scale_beats=8)

# Gate 1: a thin ring of light the orb and camera fly through on the first drop.
add_object("Gate1", ME_GATE, col, loc=(0, 20, 0.6), rot=(math.radians(90), 0, 0), scale=(5.5,) * 3)


# =============================================================================================
# 11. SECTION B - CORRIDOR OF ARCHES
# =============================================================================================
col = COL["corridor"]
arch_mats = (MAT["teal"], MAT["plum"], MAT["cream"])
for i in range(12):
    arch = add_object(f"Arch{i:02d}", ME_ARCH, col, loc=(0, 30 + i * 4.2, -0.6), rot=(math.radians(90), 0, 0),
                      material=arch_mats[i % 3], outline=0.05)
    add_driver(arch, "scale", "1 + 0.07*e")            # the whole corridor breathes on the beat

add_object("Gate2", ME_GATE, col, loc=(0, 92, 2.0), rot=(math.radians(90), 0, 0), scale=(6.0,) * 3)


# =============================================================================================
# 12. SECTION C - RIPPLING PILLAR FIELD
# =============================================================================================
col = COL["pillars"]
center = Vector((0, 110))
for ix in range(9):
    for iy in range(9):
        p = center + Vector(((ix - 4) * 2.0, (iy - 4) * 2.0))
        d = (p - center).length
        pillar = add_object(f"Pillar{ix}{iy}", ME_PILLAR, col, loc=(p.x, p.y, -3),
                            material=MAT["coral"] if (ix + iy) % 2 else MAT["cream"], outline=0.05)
        # Radial ripple out from the centre, kicked higher by the energy. Height stays below the orb.
        add_driver(pillar, "scale", f"2.0 + 1.3*sin(frame*0.13 - {d * 0.55:.3f}) + 1.6*e", index=2)

backdrop_disc("MoonDisc", col, (26, 150, 26), 7, MAT["moon_disc"])


# =============================================================================================
# 13. SECTION D - HALO AND SHARD BURST
# =============================================================================================
col = COL["finale"]
burst_beat = DROP_BEATS[2]
halo = add_object("Halo", ME_GATE, col, loc=(0, 158, 6), rot=(math.radians(90), 0, 0), scale=(7.0,) * 3,
                  material=MAT["halo"])
spin(halo, 1, beats_per_turn=32)
backdrop_disc("FinaleDisc", col, (-6, 176, 9), 8, MAT["sun_disc"])

# All shards are children of one empty. Keying that empty's scale animates 90 objects with 3 curves:
# at scale 0.02 they hide inside the orb, then explode out on the drop.
burst = add_empty("BurstCenter", col, loc=(0, 152, 3.0), size=0.5)
key_track(burst, "scale", [(0, (0.02,) * 3), (burst_beat - 0.05, (0.02,) * 3),
                           (burst_beat + 2, (6.0,) * 3), (TOTAL_BEATS, (8.5,) * 3)])
set_interpolation(burst, "LINEAR", path_prefix="scale")
fc_scale = [fc for fc in iter_fcurves(burst) if fc.data_path == "scale"]
for fc in fc_scale:                                    # the explosive segment gets an expo ease-out
    for kp in fc.keyframe_points:
        if abs(kp.co.x - beat(burst_beat - 0.05)) < 0.5:
            kp.interpolation, kp.easing = "EXPO", "EASE_OUT"
spin(burst, 2, beats_per_turn=40)

golden = math.pi * (3 - math.sqrt(5))
shard_mats = (MAT["peach"], MAT["coral"], MAT["teal"], MAT["cream"])
for i in range(90):                                    # Fibonacci sphere: even spread, no clumps
    y = 1 - 2 * (i + 0.5) / 90
    r = math.sqrt(1 - y * y)
    direction = Vector((math.cos(golden * i) * r, y, math.sin(golden * i) * r))
    pos = direction * random.uniform(0.7, 1.3)
    s = random.uniform(0.025, 0.06)
    shard = add_object(f"Shard{i:02d}", ME_GEM, col, loc=pos, scale=(s,) * 3, parent=burst,
                       rot=[random.uniform(0, math.tau) for _ in range(3)], material=shard_mats[i % 4], outline=0.06)

for i in range(5):                                     # a few big slow drifters for depth
    ang = random.uniform(0, math.tau)
    s = random.uniform(0.8, 1.8)
    blob = add_object(f"FinaleDrifter{i}", ME_GEM, col,
                      loc=(math.cos(ang) * 14, 158 + math.sin(ang) * 10, random.uniform(0, 9)),
                      scale=(s,) * 3, material=random.choice((MAT["lilac"], MAT["plum"])), outline=0.04 / s)
    drift(blob, 2, strength=1.0, scale_beats=10)
    spin(blob, 2, beats_per_turn=random.choice((24, 32, 48)))


# =============================================================================================
# 14. RENDER SETTINGS
# =============================================================================================
engines = {e.identifier for e in scn.render.bl_rna.properties["engine"].enum_items}
scn.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"   # 4.2-4.5 vs 5.x
scn.frame_start, scn.frame_end = FRAME_START, FRAME_END
scn.render.fps, scn.render.fps_base = FPS, 1.0
scn.render.resolution_x, scn.render.resolution_y = 1920, 1080
scn.render.resolution_percentage = 50 if PREVIEW else 100
scn.eevee.taa_render_samples = 16 if PREVIEW else 64
scn.eevee.use_raytracing = False         # flat shading gains nothing from screen-space rays
scn.eevee.use_shadows = True
scn.render.use_motion_blur = True        # 4.2+: lives on render, not eevee
scn.render.motion_blur_shutter = 0.5
scn.view_settings.view_transform = "Standard"   # exact palette colours (AgX would desaturate them)
scn.view_settings.look = "None"
scn.view_layers[0].use_pass_mist = True

scn.render.image_settings.file_format = "FFMPEG"
scn.render.ffmpeg.format = "MPEG4"
scn.render.ffmpeg.codec = "H264"
scn.render.ffmpeg.constant_rate_factor = "HIGH"
out_dir = "//renders/" if bpy.data.filepath else os.path.join(os.path.expanduser("~"), "orb_visualizer") + os.sep
scn.render.filepath = out_dir + "orb_visualizer_"

if AUDIO_PATH:
    path = bpy.path.abspath(AUDIO_PATH)
    if os.path.exists(path):
        seq = scn.sequence_editor_create()
        strips = seq.strips if hasattr(seq, "strips") else seq.sequences      # renamed in 4.4
        for s in [s for s in strips if s.name.startswith("OV_")]:
            strips.remove(s)
        strips.new_sound("OV_Song", path, channel=1, frame_start=FRAME_START)
        scn.render.ffmpeg.audio_codec = "AAC"
        scn.sync_mode = "AUDIO_SYNC"            # viewport playback stays locked to the song
    else:
        print(f"[orb] AUDIO_PATH not found: {path}")


# =============================================================================================
# 15. COMPOSITOR: mist fog > bloom > slight chromatic fringe > fade in/out
# =============================================================================================
scn.use_nodes = True                          # 5.0 replaces this with scene.compositing_node_group
tree = scn.node_tree
tree.animation_data_clear()                   # drop keys/drivers from a previous run
tree.nodes.clear()
N, L = tree.nodes, tree.links
rl = N.new("CompositorNodeRLayers")
fog_col = N.new("CompositorNodeRGB")
fog = N.new("CompositorNodeMixRGB")
glare = N.new("CompositorNodeGlare")
lens = N.new("CompositorNodeLensdist")
fade = N.new("CompositorNodeMixRGB")
comp = N.new("CompositorNodeComposite")
viewer = N.new("CompositorNodeViewer")

L.new(rl.outputs["Mist"], fog.inputs["Fac"])
L.new(rl.outputs["Image"], fog.inputs[1])
L.new(fog_col.outputs[0], fog.inputs[2])
L.new(fog.outputs[0], glare.inputs["Image"])
L.new(glare.outputs[0], lens.inputs["Image"])
L.new(lens.outputs[0], fade.inputs[2])
fade.inputs[1].default_value = C["ink"]
L.new(fade.outputs[0], comp.inputs["Image"])
L.new(fade.outputs[0], viewer.inputs["Image"])

# Fog colour follows the sky keys (same beats).
key_track(fog_col.outputs[0], "default_value", sky_track)

glare.glare_type = "BLOOM"                    # 4.5: the rest of the options are input sockets
glare.inputs["Threshold"].default_value = 1.0  # only emission above white blooms, toon colours stay crisp
glare.inputs["Size"].default_value = 0.75
add_driver(glare.inputs["Strength"], "default_value", "0.7 + 0.9*e")
lens.inputs["Dispersion"].default_value = 0.012

key_track(fade.inputs["Fac"], "default_value", [(0, 0.0), (1.5, 1.0), (TOTAL_BEATS - 2, 1.0), (TOTAL_BEATS, 0.0)])

for i, node in enumerate((rl, fog, glare, lens, fade, comp)):
    node.location = (i * 260, 0)
fog_col.location, viewer.location = (0, -300), (5 * 260, -220)


# =============================================================================================
# 16. VIEWPORT (only when run from the UI): look through the camera in Rendered mode
# =============================================================================================
if bpy.context.screen:
    for area in bpy.context.screen.areas:
        if area.type == "VIEW_3D":
            space = area.spaces.active
            space.shading.type = "RENDERED"
            space.shading.use_compositor = "ALWAYS"
            space.region_3d.view_perspective = "CAMERA"

scn.frame_set(FRAME_START)
print(f"[orb] built {FRAME_END - FRAME_START + 1} frames at {FPS} fps, {BPM} BPM -> {scn.render.filepath}")

# =============================================================================================
# MAKING IT REACT TO A SONG
#  A) Bake the audio into the energy curve: select OV_Controller, Graph Editor, select the "energy"
#     channel, delete its keys, then Channel > Bake Sound to F-Curves (try 20-200 Hz for kick drums).
#     Every driver above follows automatically. Add a Smooth/Envelope modifier if it is too jumpy.
#  B) Or run a beat tracker outside Blender (librosa.beat.beat_track -> times in seconds) and paste
#     the list into BEAT_TIMES. Set BPM to the song tempo so section timing lines up too.
#  C) Set AUDIO_PATH so the song plays in the viewport (AUDIO_SYNC) and lands in the MP4.
# =============================================================================================
