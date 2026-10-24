"""Which song frames of a pet act can see a set of wall points (draft 2: the new clock and calendar).

    blender -b --factory-startup --python tools/vis_check.py -- --act 3 [--out spans.json]

Builds the act the way cloud/modal_pet.py does (the act script with no --stills/--render), then for every frame
takes the camera bound by the timeline markers and tests sample points on each target: inside the frame and not
hidden behind other geometry (a ray cast from the camera). Prints the visible frame spans per target and writes
them as JSON, so only those spans get re-rendered.
"""
import json, os, sys, pathlib
import bpy
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

LAB = pathlib.Path(__file__).resolve().parent.parent
argv = sys.argv[sys.argv.index("--") + 1:]
act = int(argv[argv.index("--act") + 1])
out = argv[argv.index("--out") + 1] if "--out" in argv else None
sys.path.insert(0, str(LAB)); os.chdir(LAB)
sys.argv = ["blender", "--"]
src = (LAB / f"pet_act{act}.py").read_text()
exec(compile(src, f"pet_act{act}.py", "exec"), {"__name__": "__main__", "__file__": str(LAB / f"pet_act{act}.py")})

import pet_world as W
def grid(c, w, h, y):
    return [Vector((c[0] + dx * w / 2, y, c[2] + dz * h / 2)) for dx in (-1, 0, 1) for dz in (-1, 0, 1)]
TARGETS = {
    "clock": grid(W.CLOCK, .44, .44, 2.96),
    "cal": grid(W.CAL, .46, .62, 2.96),
    "calB": grid((-.85, 0, 1.74), .46, .62, 2.96),     # candidate spot over the couch, left of the picture
}
scene = bpy.context.scene
marks = sorted((m.frame, m.camera) for m in scene.timeline_markers if m.camera)
def cam_at(f):
    c = scene.camera
    for fr, cam in marks:
        if fr <= f: c = cam
    return c
spans = {k: [] for k in TARGETS}
f0, f1 = scene.frame_start, scene.frame_end
for f in range(f0, f1 + 1):
    scene.frame_set(f)
    cam = cam_at(f); dg = bpy.context.evaluated_depsgraph_get()
    eye = cam.matrix_world.translation
    for k, pts in TARGETS.items():
        seen = 0
        for p in pts:
            v = world_to_camera_view(scene, cam, p)
            if not (0 <= v.x <= 1 and 0 <= v.y <= 1 and v.z > 0): continue
            d = p - eye; L = d.length
            hit, loc, *_ = scene.ray_cast(dg, eye, d.normalized(), distance=L)
            if hit and (loc - eye).length < L - .06: continue
            seen += 1
        if seen:
            s = spans[k]
            if s and s[-1][1] == f - 1: s[-1][1] = f
            else: s.append([f, f])
for k, s in spans.items():
    n = sum(b - a + 1 for a, b in s)
    print(f"[vis] act {act} {k}: {n} frames in {len(s)} spans: {s}")
if out: pathlib.Path(out).write_text(json.dumps({"act": act, "spans": spans}))
