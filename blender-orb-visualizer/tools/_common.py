"""Shared paths for the tools. Run every tool with Blender, e.g.
    blender -b --factory-startup --python tools/render_stills.py -- 1,150,445
"""
import os
import sys

TOOLS = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(TOOLS)
OUT = os.path.join(ROOT, "out")
SCRIPT = os.path.join(ROOT, "orb_visualizer.py")


def build_scene():
    """Run the generator in this Blender session, returning its globals (CTRL, iter_fcurves, ...)."""
    env = {"__name__": "__main__"}
    exec(compile(open(SCRIPT).read(), SCRIPT, "exec"), env)
    return env


def args_after_dashes():
    return sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
