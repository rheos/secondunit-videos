"""Render single frames to out/stills/fNNNN.png for a quick look.
    blender -b --factory-startup --python tools/render_stills.py -- 1,60,150,445
Then a contact sheet:
    ffmpeg -pattern_type glob -i 'out/stills/f*.png' -vf "scale=480:-1,tile=3x4:padding=4" -frames:v 1 out/contact.png
"""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
from _common import OUT, args_after_dashes, build_scene  # noqa: E402

build_scene()
scn = bpy.context.scene
scn.render.image_settings.file_format = "PNG"
arg = args_after_dashes()
frames = [int(f) for f in arg[0].split(",")] if arg else [1, 60, 150, 200, 260, 300, 365, 380, 430, 445, 470, 560]
for f in frames:
    t = time.time()
    scn.frame_set(f)
    scn.render.filepath = os.path.join(OUT, "stills", f"f{f:04d}.png")
    bpy.ops.render.render(write_still=True)
    print(f"STILL {f} {time.time() - t:.1f}s")
