# Film kit: short song-timed voxel films (takes 05-08, Real Thing look tests). Builds on canvas_kit.py's boxes,
# Closest-sampled pixel textures, sky and lights, and adds what a film needs that a loop doesn't:
#   - song time: frames are numbered by song frame (24 fps), so frame f sits at f / 24 s in the song
#   - shots: one camera per shot, cut with timeline markers
#   - voxel people with pivots for a walk cycle, a sit and simple acting
#   - the pixel look in the compositor: a Pixelate node whose size can be keyed per frame (8 = chunky,
#     1 = sharp), with an optional cryptomatte list of objects that stay sharp whatever the size
# Frames render at 1280x720 so a shot can go from pixel to sharp; tools/film_encode.sh muxes the song.
import bpy, math, os, sys
from canvas_kit import (reset, hex_lin, tex_image, mat, specks, windows, stripes, box, blocks, disc, empty,
                        sun, sky, linear_keys)

FPS = 24

def film_setup(out, f0, f1, res=(1280, 720), samples=16, filter_size=.8):
    scene = bpy.context.scene; r = scene.render
    r.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items] else "BLENDER_EEVEE"
    r.resolution_x, r.resolution_y, r.resolution_percentage = res[0], res[1], 100
    r.fps = FPS; r.filter_size = filter_size
    scene.eevee.taa_render_samples = samples
    scene.view_settings.view_transform = "Standard"
    r.image_settings.file_format = "PNG"; r.image_settings.color_mode = "RGB"
    scene.frame_start, scene.frame_end = f0, f1
    os.makedirs(os.path.join(out, "frames"), exist_ok=True)
    r.filepath = os.path.join(out, "frames", "")
    for m in list(scene.timeline_markers): scene.timeline_markers.remove(m)
    return scene

def sec(s):
    """song seconds -> song frame"""
    return int(round(s * FPS))

# ---------- shots ----------
def shot_camera(name, loc, target, lens=35, sensor=24):
    scene = bpy.context.scene
    cd = bpy.data.cameras.new("CL_cam_" + name); cd.lens = lens; cd.sensor_fit = "VERTICAL"; cd.sensor_height = sensor
    cam = bpy.data.objects.new("CL_cam_" + name, cd); scene.collection.objects.link(cam)
    cam.location = loc
    tgt = empty("tgt_" + name, target)
    tr = cam.constraints.new("TRACK_TO"); tr.target = tgt; tr.track_axis = "TRACK_NEGATIVE_Z"; tr.up_axis = "UP_Y"
    cam["target"] = tgt.name
    return cam

def cut(frame, cam):
    """camera `cam` from song frame `frame` on (until the next cut)"""
    scene = bpy.context.scene
    m = scene.timeline_markers.new(cam.name, frame=frame); m.camera = cam
    if scene.camera is None or frame <= scene.frame_start: scene.camera = cam

def key(ob, frame, loc=None, rot=None, scale=None):
    if loc is not None: ob.location = loc; ob.keyframe_insert("location", frame=frame)
    if rot is not None: ob.rotation_euler = rot; ob.keyframe_insert("rotation_euler", frame=frame)
    if scale is not None: ob.scale = scale; ob.keyframe_insert("scale", frame=frame)

def show(ob, frame, visible):
    """hide/show an object (and its children) from a frame on, in render"""
    for o in [ob] + list(ob.children_recursive):
        o.hide_render = not visible; o.keyframe_insert("hide_render", frame=frame)
        o.hide_viewport = not visible; o.keyframe_insert("hide_viewport", frame=frame)

def const_keys(ob):
    for ad in [ob.animation_data] if ob.animation_data else []:
        if ad.action:
            for layer in getattr(ad.action, "layers", []):
                for strip in layer.strips:
                    for cb in strip.channelbags:
                        for fc in cb.fcurves:
                            if fc.data_path.startswith("hide"):
                                for kp in fc.keyframe_points: kp.interpolation = "CONSTANT"

# ---------- voxel people ----------
def person(name, loc, coat="#3f7f7c", trouser="#4a3b33", skin="#efd9b9", hat=None, hair=None, scale=1.0,
           height=1.0, width=1.0, skirt=False, shoes="#1e1a14", parent=None, eyes=True):
    """A voxel person about 1.75 m tall at scale 1, facing +x. Returns a dict: root, hipL/R, shL/R (pivots),
    head, and the materials. Hands hang at the shoulder pivots' -z."""
    M = lambda n, h, j=.05: mat(f"{name}_{n}", h, j, abs(hash(name + n)) % 997, texel=.05)
    root = empty(name, loc, parent); root.scale = (scale, scale, scale)
    H, Wd = height, width
    hipL = empty(name + "_hipL", (0, .1 * Wd, .72 * H), root); hipR = empty(name + "_hipR", (0, -.1 * Wd, .72 * H), root)
    for side, hip in (("L", hipL), ("R", hipR)):
        box(f"{name}_leg{side}", (.17, .17, .68 * H), (0, 0, -.34 * H), M("trouser", trouser), hip)
        box(f"{name}_shoe{side}", (.28, .19, .1), (.05, 0, -.69 * H), M("shoes", shoes, .02), hip)
    body = box(f"{name}_coat", (.46 * Wd, .4 * Wd, .66 * H), (0, 0, 1.05 * H), M("coat", coat), root)
    if skirt: box(f"{name}_skirt", (.56 * Wd, .5 * Wd, .3 * H), (0, 0, .75 * H), M("coat", coat), root)
    head = box(f"{name}_head", (.36, .34, .36), (0, 0, 1.6 * H), M("skin", skin, .02), root)
    if eyes:
        for s in (-1, 1): box(f"{name}_eye{s}", (.04, .06, .06), (.18, .075 * s, 1.63 * H), M("ink", "#1e1a14", 0), root)
    if hair: blocks(f"{name}_hair", [((.4, .38, .12), (-.01, 0, 1.8 * H)), ((.14, .38, .3), (-.13, 0, 1.68 * H))], M("hair", hair), root)
    if hat:
        box(f"{name}_brim", (.6, .55, .06), (0, 0, 1.8 * H), M("hat", hat), root)
        box(f"{name}_crown", (.38, .36, .22), (0, 0, 1.92 * H), M("hat", hat), root)
    shL = empty(name + "_shL", (0, .26 * Wd, 1.34 * H), root); shR = empty(name + "_shR", (0, -.26 * Wd, 1.34 * H), root)
    for side, sh in (("L", shL), ("R", shR)):
        box(f"{name}_arm{side}", (.15, .15, .56 * H), (0, 0, -.28 * H), M("coat", coat), sh)
        box(f"{name}_hand{side}", (.13, .13, .13), (0, 0, -.6 * H), M("skin", skin, .02), sh)
    return dict(root=root, hipL=hipL, hipR=hipR, shL=shL, shR=shR, head=head, body=body, H=H)

def walk_pose(p, frame, t, period=1.0, amp=30, arm=.8, bob=.04):
    """key a walk cycle pose at song frame `frame`; t = seconds into the walk. Returns the bob height."""
    w = 2 * math.pi * t / period; s = math.radians(amp) * math.sin(w)
    key(p["hipL"], frame, rot=(0, s, 0)); key(p["hipR"], frame, rot=(0, -s, 0))
    key(p["shL"], frame, rot=(0, -s * arm, 0)); key(p["shR"], frame, rot=(0, s * arm, 0))
    return bob * abs(math.sin(w))

def stand_pose(p, frame, armL=0, armR=0):
    for k in ("hipL", "hipR"): key(p[k], frame, rot=(0, 0, 0))
    key(p["shL"], frame, rot=(0, math.radians(armL), 0)); key(p["shR"], frame, rot=(0, math.radians(armR), 0))

def sit_pose(p, frame, armL=-40, armR=-40):
    for k in ("hipL", "hipR"): key(p[k], frame, rot=(0, math.radians(-90), 0))
    key(p["shL"], frame, rot=(0, math.radians(armL), 0)); key(p["shR"], frame, rot=(0, math.radians(armR), 0))

# ---------- the pixel look ----------
def pixel_look(size_keys, sharp=()):
    """Compositor: render -> Pixelate (Size keyed per frame from size_keys = [(frame, size), ...], 1 = sharp)
    -> composite. Objects named in `sharp` stay unpixelated (cryptomatte matte over the pixelated image)."""
    scene = bpy.context.scene; scene.use_nodes = True; nt = scene.node_tree
    nt.animation_data_clear(); nt.nodes.clear()
    rl = nt.nodes.new("CompositorNodeRLayers"); comp = nt.nodes.new("CompositorNodeComposite")
    px = nt.nodes.new("CompositorNodePixelate"); px.name = "CL_pixelate"
    nt.links.new(rl.outputs["Image"], px.inputs["Color"])
    sock = px.inputs["Size"]
    for f, s in size_keys:
        sock.default_value = s; sock.keyframe_insert("default_value", frame=f)
    if nt.animation_data and nt.animation_data.action:
        act = nt.animation_data.action
        fcs = []
        for layer in getattr(act, "layers", []):
            for strip in layer.strips:
                for cb in strip.channelbags: fcs += list(cb.fcurves)
        if hasattr(act, "fcurves"): fcs += list(act.fcurves)
        for fc in fcs:
            for kp in fc.keyframe_points: kp.interpolation = "CONSTANT"    # resolution steps, never smears
    last = px
    if sharp:
        scene.view_layers[0].use_pass_cryptomatte_object = True
        cm = nt.nodes.new("CompositorNodeCryptomatteV2"); cm.source = "RENDER"; cm.scene = scene
        cm.matte_id = ",".join("CL_" + n if not n.startswith("CL_") else n for n in sharp)
        mix = nt.nodes.new("CompositorNodeMixRGB")
        nt.links.new(rl.outputs["Image"], cm.inputs["Image"])
        nt.links.new(cm.outputs["Matte"], mix.inputs["Fac"])
        nt.links.new(px.outputs["Color"], mix.inputs[1]); nt.links.new(rl.outputs["Image"], mix.inputs[2])
        last = mix
    nt.links.new(last.outputs[0], comp.inputs["Image"])
    return px

def run(out):
    """-- --stills 600,700 renders test stills to out/stills; -- --render renders the whole frame range."""
    scene = bpy.context.scene; r = scene.render
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if "--stills" in argv:
        frames = [int(x) for x in argv[argv.index("--stills") + 1].split(",")]
        os.makedirs(os.path.join(out, "stills"), exist_ok=True)
        for fr in frames:
            scene.frame_set(fr); r.filepath = os.path.join(out, "stills", f"f{fr:05d}.png")
            bpy.ops.render.render(write_still=True)
        r.filepath = os.path.join(out, "frames", "")
    elif "--render" in argv:
        bpy.ops.render.render(animation=True)
