# Blender entry point for 10,000 Miles. Renders the 3D layers; comp.py composites them.
#   blender -b --factory-startup --python render.py -- --part <id>             one portal scene, its span only
#   blender -b --factory-startup --python render.py -- --part <id> --still 18.5 one test still (out/stills/)
#   blender -b --factory-startup --python render.py -- --part rocket|friend    a transparent rocket layer, whole film
#   blender -b --factory-startup --python render.py -- --part mosaic [--only <id>]   nine square stills per scene
# Output: out/<part>/####.png, global frame numbers (frame 1 = song 0.0 s).
import bpy, os, sys, json, math, importlib, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from tk import kit as K
importlib.reload(K)
SCENES = {}
import tk.cast; importlib.reload(tk.cast)
for name in ("scenes_v1", "scenes_v2", "scenes_bridge"):      # a module that fails to import doesn't stop the others
    try:
        m = importlib.reload(importlib.import_module("tk." + name)); SCENES.update(m.SCENES)
    except Exception as e:
        print(f"WARNING: tk.{name} not loaded: {e!r}")

TL = json.load(open(os.path.join(HERE, "timeline.json")))
OUT = os.path.join(HERE, "out")
SPAN = {p["id"]: p["render"] for p in TL["portals"]}
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
arg = lambda k, d=None: argv[argv.index(k) + 1] if k in argv else d
PART = arg("--part", "rocket")

def rocket_layer(body=None, trim=None, seed=5):
    sc = K.reset_scene(); sc.render.film_transparent = True
    cam = K.camera(ortho=15.5); K.aim(cam, (0, -30, 0), (0, 0, 0)); K.sun((60, 0, -30), 3.2)
    K.world("#ffffff"); sc.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0
    rk, fl = K.rocket("rocket", body=body, trim=trim)
    rng = random.Random(seed); frames = range(1, K.frame_of(TL["t1"]) + 1)
    def anim(t, f):
        rk.location = (0, 0, .06 * math.sin(2 * math.pi * t / 2.4)); rk.rotation_euler = (0, math.radians(3.5) * math.sin(2 * math.pi * t / 3.1), 0)
        K.key(rk, "location", f); K.key(rk, "rotation_euler", f)
        s = .85 + .3 * rng.random(); fl.scale = (1, 1, s); K.key(fl, "scale", f)
    K.bake(frames, anim); return frames

def render_frames(frames, sub, transparent=False):
    """The scene, then (if it has characters) the same frames again on the holdout view layer, as <sub>_chars/.
    transparent=True for the rocket layers, which are composited over everything else."""
    sc = K.scene(); K.linear_all()
    sc.frame_start, sc.frame_end = frames[0], frames[-1]
    d = os.path.join(OUT, sub); os.makedirs(d, exist_ok=True)
    sc.view_layers["ViewLayer"].use = True; sc.view_layers["chars"].use = False; sc.render.film_transparent = transparent
    sc.render.filepath = os.path.join(d, ""); bpy.ops.render.render(animation=True)
    if len(K.CHARS.all_objects):
        d2 = os.path.join(OUT, sub + "_chars"); os.makedirs(d2, exist_ok=True)
        sc.view_layers["ViewLayer"].use = False; sc.view_layers["chars"].use = True; sc.render.film_transparent = True
        sc.render.filepath = os.path.join(d2, ""); bpy.ops.render.render(animation=True)

if PART in ("rocket", "friend"):
    frames = rocket_layer() if PART == "rocket" else rocket_layer(body="#5b8fd6", trim=K.P["cream"], seed=9)
    if arg("--still"):
        K.linear_all(); K.scene().frame_set(K.frame_of(float(arg("--still")))); os.makedirs(os.path.join(OUT, "stills"), exist_ok=True)
        K.scene().render.filepath = os.path.join(OUT, "stills", f"{PART}.png"); bpy.ops.render.render(write_still=True)
    else:
        render_frames(frames, PART, transparent=True)
elif PART == "lineup":
    # the cast line-up: one row per style variant, rendered on transparent film; comp.py --lineup adds the outlines
    import tk.cast as C
    variants = dict(playmobil=dict())
    d = os.path.join(OUT, "lineup"); os.makedirs(d, exist_ok=True)
    for vname, over in variants.items():
        sc = K.reset_scene(); sc.render.film_transparent = True; sc.render.resolution_x, sc.render.resolution_y = 1920, 560; sc.eevee.taa_render_samples = 48
        cam = K.camera(ortho=8.4); K.aim(cam, (0, -30, 1.1), (0, 0, .85)); K.sun((45, -10, -35), 3.0)
        K.world("#ffffff"); sc.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0
        S = dict(C.PERSON, **over); B = [dict(C.BOY(k), **{kk: vv for kk, vv in over.items() if kk in ("head_r",)}) for k in range(5)]
        xs = [-3.3, -2.2, -1.1, 0.0, 1.1, 2.2, 3.3]
        f1 = C.figure("neutral", (xs[0], 0, 0), S); C.face(f1)
        f2 = C.figure("wave", (xs[1], 0, 0), S); C.face(f2, smile=1, brow=.2); f2["armR"].rotation_euler = (0, math.radians(-150), 0); C.bend(f2["armR"], .35)
        f3 = C.figure("sad", (xs[2], 0, 0), S); C.face(f3, brow=.5, lids=.45, smile=-.25); f3["head"].rotation_euler = (math.radians(12), 0, math.radians(-6))
        f3["armL"].rotation_euler = (math.radians(8), 0, 0); f3["armR"].rotation_euler = (math.radians(8), 0, 0)
        f4 = C.figure("walk", (xs[3], 0, 0), S); C.face(f4, smile=.6); K.walk(f4, .25, amp=30); C.bend(f4["legL"], .35); C.bend(f4["armR"], .3)
        f5 = C.figure("kid", (xs[4], 0, 0), dict(C.KID, **{kk: vv for kk, vv in over.items() if kk == "head_r"})); C.face(f5, smile=1, wide=1.2)
        f6 = C.figure("boy0", (xs[5], 0, 0), B[0]); C.face(f6, brow=-.8, lids=.45, smile=.3); f6["head"].rotation_euler = (math.radians(-6), 0, math.radians(12))
        f7 = C.figure("boy1", (xs[6], 0, 0), B[1]); C.face(f7, brow=.5, wide=1.5, open_=.8)
        for fig in (f1, f2, f3, f4, f5, f6, f7): fig["root"].rotation_euler = (0, 0, math.radians(-22))
        sc.render.filepath = os.path.join(d, vname + ".png"); bpy.ops.render.render(write_still=True)
elif PART == "mosaic":
    only = arg("--only"); d = os.path.join(OUT, "mosaic"); os.makedirs(d, exist_ok=True)
    for sid, (a, b) in SPAN.items():
        if only and sid not in only.split(","): continue
        K.reset_scene(); SCENES[sid](K, (a, b)); K.linear_all()
        sc = K.scene(); cam = sc.camera; rig = K.empty("camRig"); cam.parent = rig
        sc.render.resolution_x = sc.render.resolution_y = 480
        for k in range(9):
            t = a + (b - a) * (.12 + .76 * k / 8)
            rig.location = (math.sin(k * 2.1) * .5, 0, math.cos(k * 1.3) * .25)
            sc.frame_set(K.frame_of(t)); sc.render.filepath = os.path.join(d, f"{sid}_{k}.png"); bpy.ops.render.render(write_still=True)
else:
    K.reset_scene(); frames = SCENES[PART](K, SPAN[PART])
    if arg("--still"):
        K.linear_all(); t = float(arg("--still")); K.scene().frame_set(K.frame_of(t)); os.makedirs(os.path.join(OUT, "stills"), exist_ok=True)
        K.scene().render.filepath = os.path.join(OUT, "stills", f"{PART}_{t:.2f}.png"); bpy.ops.render.render(write_still=True)
    else:
        render_frames(frames, PART)
