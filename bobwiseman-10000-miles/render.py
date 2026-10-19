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
import tk.scenes_v1, tk.scenes_v2, tk.scenes_bridge
for m in (K, tk.scenes_v1, tk.scenes_v2, tk.scenes_bridge): importlib.reload(m)

TL = json.load(open(os.path.join(HERE, "timeline.json")))
OUT = os.path.join(HERE, "out")
SCENES = {**tk.scenes_v1.SCENES, **tk.scenes_v2.SCENES, **tk.scenes_bridge.SCENES}
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

def render_frames(frames, sub):
    sc = K.scene(); K.linear_all()
    d = os.path.join(OUT, sub); os.makedirs(d, exist_ok=True)
    sc.frame_start, sc.frame_end = frames[0], frames[-1]
    sc.render.filepath = os.path.join(d, ""); bpy.ops.render.render(animation=True)

if PART in ("rocket", "friend"):
    frames = rocket_layer() if PART == "rocket" else rocket_layer(body="#5b8fd6", trim=K.P["cream"], seed=9)
    if arg("--still"):
        K.linear_all(); K.scene().frame_set(K.frame_of(float(arg("--still")))); os.makedirs(os.path.join(OUT, "stills"), exist_ok=True)
        K.scene().render.filepath = os.path.join(OUT, "stills", f"{PART}.png"); bpy.ops.render.render(write_still=True)
    else:
        render_frames(frames, PART)
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
