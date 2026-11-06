"""Run the generator three times in one session; the datablock counts must stop growing after run 2.
    blender -b --factory-startup --python tools/rerun_check.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
from _common import build_scene  # noqa: E402

for run in (1, 2, 3):
    env = build_scene()
    scn = bpy.context.scene
    ad = scn.node_tree.animation_data
    energy = env["iter_fcurves"](env["CTRL"])[0]
    print(f"RUN{run}", dict(objects=len(scn.objects), meshes=len(bpy.data.meshes), materials=len(bpy.data.materials),
                            actions=len(bpy.data.actions), compositor_drivers=len(ad.drivers) if ad else 0,
                            energy_keys=len(energy.keyframe_points)))
