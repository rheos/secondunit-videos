"""loopnoise.py: noise that loops exactly, for Blender Canvas loops. The Python twin of loopnoise.js.

The trick is Leon Lin's, from lumenshaders (MIT, Copyright (c) 2026 Leonxlnx, LICENSE-lumenshaders.md): the
noise lookup travels a closed circle of radius R at angle 2*pi*phase, so phase 1 is the same point as
phase 0 and the last frame of the loop runs into the first.

mathutils.noise only has 3D noise (noise, fractal, turbulence all take a 3D vector), so the circle cannot sit
in two spare dimensions the way it does in loopnoise.js and loopnoise.glsl. What this does instead:

  loop_noise1(phase, R, seed)        noise(sx + R cos a, sy + R sin a, sz)
      One drifting value. The lookup point walks a closed circle through 3D noise, and nothing is lost:
      for a single value (camera wobble, a light's strength, a cloud's height) this is as good as 4D.
  loop_noise2(x, y, phase, R, seed)  noise(x + R cos a, y, sz + R sin a)
      A field over (x, y). One circle axis is a field axis (x), so the field slides back and forth in x by
      up to R while the other axis (z) changes its shape. With the circle in (x, y) as the brief sketch had
      it, the whole field would just slide round a circle and never change shape; with this it morphs as
      well, but some slide is left. Keep R small against the feature size (R 0.3 on features ~1 unit wide)
      if the slide shows. If you need a field that morphs with no slide at all, use the Noise Texture node
      in 4D mode with W keyed from the same circle, or loopnoise.glsl in a compositor/HyperFrames pass.

Both loop exactly whatever R is. Values are in about -1..1 (Blender's original Perlin basis).

Use in a canvas_loop.py-style script (frames 1..FRAMES rendered, frame FRAMES+1 would equal frame 1):

    import sys; sys.path.insert(0, "<repo>/tools/canvas-loop")
    from loopnoise import key_loop_drift
    key_loop_drift(cam, "location", 0, amp=0.04, frames=192, radius=0.6, seed=1, base=cam.location.x)
    key_loop_drift(cam, "location", 2, amp=0.03, frames=192, radius=0.6, seed=2, base=cam.location.z)
"""
import math
from mathutils import Vector, noise

TAU = 2 * math.pi


def _seed_point(seed):
    # a fixed, far-apart spot in noise space per seed, so seeds give unrelated noise
    s = float(seed)
    return 37.13 * s + 11.7, -19.31 * s + 5.3, 23.77 * s - 7.9


def phase_of_frame(frame, frames, first=1):
    """Frame number -> phase in [0, 1). first..first+frames-1 is one loop."""
    return ((frame - first) % frames) / frames


def loop_noise1(phase, radius=1.0, seed=0, basis="PERLIN_ORIGINAL"):
    """One value that loops, -1..1."""
    a = TAU * phase
    sx, sy, sz = _seed_point(seed)
    return noise.noise(Vector((sx + radius * math.cos(a), sy + radius * math.sin(a), sz)), noise_basis=basis)


def loop_noise2(x, y, phase, radius=1.0, seed=0, basis="PERLIN_ORIGINAL"):
    """A field over (x, y) that loops, -1..1. See the module notes for the slide trade-off."""
    a = TAU * phase
    sx, sy, sz = _seed_point(seed)
    return noise.noise(Vector((sx + x + radius * math.cos(a), sy + y, sz + radius * math.sin(a))), noise_basis=basis)


def loop_fbm1(phase, radius=1.0, seed=0, octaves=3, gain=0.5):
    """Fractal sum of loop_noise1: a wobble with finer jitter on top. Each octave doubles the circle too."""
    a = TAU * phase
    sx, sy, sz = _seed_point(seed)
    total, amp, norm, f = 0.0, 1.0, 0.0, 1.0
    for o in range(octaves):
        p = Vector((f * (sx + radius * math.cos(a)) + 31.7 * o, f * (sy + radius * math.sin(a)) - 17.3 * o, f * sz))
        total += amp * noise.noise(p)
        norm += amp
        amp *= gain
        f *= 2.0
    return total / norm


def key_loop_drift(obj, data_path, index, amp, frames, radius=0.6, seed=0, base=0.0, first=1, octaves=1):
    """Key obj.<data_path>[index] = base + amp * loop noise on every frame first..first+frames-1.

    Keys every frame (as canvas_loop.py does), so interpolation never matters and the value at frame
    first+frames would equal the value at frame first. Returns the list of values keyed.
    """
    vals = []
    for i in range(frames):
        ph = i / frames
        n = loop_noise1(ph, radius, seed) if octaves == 1 else loop_fbm1(ph, radius, seed, octaves)
        v = base + amp * n
        getattr(obj, data_path)[index] = v
        obj.keyframe_insert(data_path=data_path, index=index, frame=first + i)
        vals.append(v)
    return vals
