"""Render the whole piece as a 720p review MP4 into out/ (about 15 min on the M-series Mac).
    blender -b --factory-startup --python tools/render_preview.py -- take-02
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
from _common import OUT, args_after_dashes, build_scene  # noqa: E402

build_scene()
scn = bpy.context.scene
name = (args_after_dashes() or ["preview"])[0]
scn.render.resolution_x, scn.render.resolution_y, scn.render.resolution_percentage = 1280, 720, 100
scn.render.filepath = os.path.join(OUT, f"{name}_720p_")
bpy.ops.render.render(animation=True)
print("PREVIEW", scn.render.frame_path())
