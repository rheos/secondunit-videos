# Respawn act 5: refrain 2 + the turn, the construct (song 105.8-130.4 s, frames 2539-3130). STORYBOARD-respawn.md, act 5.
# He walks out on the grid, small, his shadow the only one out here. The long walk under the held voice: two wides, a
# tiny figure on endless lines. On 113.49 the camera turns back: the whole village is one tile floating in the dark, its
# painted sky a card on one side. He looks for a long moment. ~117 s night falls on the tile in one frame and the prompt
# appears over his head out here too; he holds his hand over it; on 120.41 it closes without being pressed, and he is not
# reset. He turns his back on the village and walks on. 121.98: the wall of grid with the glowing crack (the sketch's
# s5a); he walks to it, puts his hand on it, a half step back. The turn (125.5-130.4): he sits with his back to the wall,
# hands turned over in his lap, `fear`; from 127.5 the flower seller walks in from the far side, can in hand. He
# doesn't look.
#
#   tools/render_lock.sh blender -b --factory-startup --python respawn_act5.py -- --stills 2550,2724,2812,2928,3012,3130
#   tools/render_lock.sh blender -b --factory-startup --python respawn_act5.py -- --render
# Frames land in out/film/respawn/act5/frames/ (named by song frame). Structure follows respawn_act1.py (the template).
import bpy, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
sys.path.insert(0, HERE)
import respawn_world as RW
from respawn_world import R, ease, seg, lerp, clamp, swing, polyline, plen, angle_lerp
from film_kit import pixel_groups, sec, key, run

F0, F1 = 2539, 3130
OUT = os.path.join(HERE, "out", "film", "respawn", "act5")
W = RW.build(F0, F1, OUT)
vis, pose = W.vis, W.pose
SK, F = W.keeper, W.keeper["F"]
EDGE, VOIDZ, WX, Y5 = W.EDGE, W.VOIDZ, W.WX, W.Y5
YK = Y5 + W.crack_c(.75) - .478                  # the sketch's path to the crack: y of his feet at the wall
STOP = WX - .85                                  # where he stops in front of it
NIGHT = 2808                                     # ~117 s: night falls on the tile, in one frame

# ---------- the village runs its loops on the tile until its night; from then nothing is keyed (frozen) ----------
W.village_loops(F0, NIGHT, keeper_home=False)
# the camera is outside the tile the whole act: the east, west and south cards are off; the north card stays
vis(W.skyEnd, F0, False); vis(W.skyWest, F0, False); vis(W.skySouth, F0, False)

# ---------- the night on the tile: a dark copy of the sky card, and a translucent dark slab around the tile ----------
# (W.light cannot darken the tile alone: the void keeps its light, so the tile goes dark behind a shade)
skyNight = W.plane("skyNight", [(W.WEST, 40, -1.5), (EDGE, 40, -1.5), (EDGE, 40, 90), (W.WEST, 40, 90)],
                   W.grad_mat("skyNight", [(0, "#101a3a"), (1, "#06091a")], 2, 0, 60))
def shade_mat(name, color, alpha):
    m = bpy.data.materials.new("CL_" + name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); mix = nt.nodes.new("ShaderNodeMixShader")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*RW.hex_lin(color), 1); em.inputs["Strength"].default_value = 1.0
    mix.inputs["Fac"].default_value = alpha
    nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(em.outputs[0], mix.inputs[2]); nt.links.new(mix.outputs[0], out.inputs["Surface"])
    for attr, val in (("surface_render_method", "BLENDED"), ("blend_method", "BLEND"), ("use_transparent_shadow", True)):
        try: setattr(m, attr, val)
        except Exception: pass
    return m
TW, TX = EDGE - W.WEST, (EDGE + W.WEST) / 2
shade = RW.box("nightShade", (TW + .6, 80.6, 95), (TX, 0, 46), shade_mat("nightShade", "#04071a", .74))
try: shade.visible_shadow = False
except Exception: pass
vis(skyNight, F0, False); vis(shade, F0, False); vis(W.skyWall, F0, True)       # (a first key, so the hide below is a step)
vis(W.skyWall, NIGHT, False); vis(skyNight, NIGHT, True); vis(shade, NIGHT, True)

# ---------- the keeper's walk on the grid: a speed per frame, integrated once into a distance table ----------
# the phase continues act 4's (dist = 1.3 * (f - 2472) / 24 at 2539); he picks up pace into the dark, stops at 2702,
# stands looking back until 2866, then walks on toward the wall
def speed(f):
    if f < 2702: return (1.3 + .3 * ease(seg(f, 2539, 2587))) * (1 - ease(seg(f, 2690, 2702)))
    if f < 2866: return 0.0
    if f < 2928: return 1.3 * ease(seg(f, 2866, 2886))
    return 0.0
DIST = {}
_d = 1.3 * (F0 - 2472) / 24
for _f in range(F0, F1 + 2):
    DIST[_f] = _d; _d += speed(_f) / 24

def bezier(p0, p1, p2, p3, n=240):
    pts = []
    for i in range(n + 1):
        t = i / n; a, b, c, d = (1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t * t, t ** 3
        pts.append((a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]))
    return pts
# out from the edge heading +x, then a drift south-east, so the stop point sees the whole tile from its south-east corner
GRID_PATH = bezier((EDGE + 5.0, -1.5), (EDGE + 10.5, -1.5), (EDGE + 10.5, -7.0), (EDGE + 8.6, -14.0))
S_STOP = DIST[2702] - DIST[F0]
P_STOP, H_STOP = polyline(GRID_PATH, S_STOP)
_dw = Vector((WX - P_STOP[0], Y5 - P_STOP[1])).normalized()
DIR_WALL = (_dw.x, _dw.y); H_WALL = math.degrees(math.atan2(_dw.y, _dw.x))

def grid_pos(f):
    """his feet on the grid (no bob), 2539-2927"""
    if f <= 2702: return polyline(GRID_PATH, DIST[f] - DIST[F0])[0]
    d = DIST[f] - DIST[2702]
    return (P_STOP[0] + DIR_WALL[0] * d, P_STOP[1] + DIR_WALL[1] * d)

def keeper_state(f):
    st = dict(pos=(0, 0, VOIDZ), yaw=0, lean=0, neck=(0, 0), shL=(9, 0), shR=(-9, 0), hips=(0, 0))
    breath = .4 * math.sin(f / 9.0)
    if f < 2928:
        # ----- the grid: out, the stop, the long look back, the prompt, the turn away, the walk on -----
        s_, bob = swing(DIST[f]); amp = clamp(speed(f) / 1.3)
        (x, y) = grid_pos(f)
        if f <= 2702: yaw = polyline(GRID_PATH, DIST[f] - DIST[F0])[1]
        else: yaw = angle_lerp(angle_lerp(H_STOP, 160, ease(seg(f, 2704, 2722))), H_WALL, ease(seg(f, 2850, 2868)))
        look = ease(seg(f, 2704, 2722)) * (1 - ease(seg(f, 2850, 2868)))
        st.update(pos=(x, y, VOIDZ + bob * amp), yaw=yaw, hips=(s_ * amp, -s_ * amp),
                  shL=(lerp(9, 4, look), -s_ * .6 * amp), shR=(lerp(-9, -4, look), s_ * .6 * amp),
                  neck=(6 * look, 0), lean=-2 * look + breath * (1 - amp))
        up = ease(seg(f, 2822, 2834)) * (1 - ease(seg(f, 2852, 2864)))    # the hand held over the panel; it waits
        if up > 0: st["shR"] = (lerp(st["shR"][0], -6, up), -150 * up)
        return st
    if f <= 2966:
        # ----- the sketch's 1062-1100: he walks to the crack -----
        dist = (STOP - (WX - 3.1)) * (f - 2928) / (2966 - 2928); s_, bob = swing(dist)
        st.update(pos=(WX - 3.1 + dist, YK, VOIDZ + bob), yaw=0, hips=(s_, -s_), shL=(9, -s_ * .6), shR=(-9, s_ * .6))
        return st
    if f < 3012:
        # ----- the sketch's 1101-1150: the hand on the crack (a small tremble), the half step back, the look up -----
        reach = ease(seg(f, 2967, 2975)) * (1 - ease(seg(f, 2984, 2993)))
        trem = 1.5 * (1 if (f // 2) % 2 == 0 else -1) * (1 if 2976 <= f <= 2983 else 0)
        st.update(pos=(STOP, YK, VOIDZ), yaw=0, shL=(lerp(9, 4, reach) + trem, -96 * reach), shR=(-12, 0), lean=-2 * reach,
                  neck=(-4 * reach, 0))
        if f >= 2992:
            u = seg(f, 2992, 3006); dist = .45 * ease(u); s_ = 16 * math.sin(math.pi * u); lk = ease(seg(f, 3002, 3016))
            st.update(pos=(STOP - dist, YK, VOIDZ), hips=(s_, -s_ * .6), shL=(9 + 10 * lk, 0), shR=(-9 - 10 * lk, 0),
                      neck=(-11 * lk, 0), lean=-2 * lk)
        return st
    # ----- the turn: he turns his back to the wall, a step beside the crack, sits, hands turned over in his lap -----
    turn = ease(seg(f, 3012, 3030)); step = ease(seg(f, 3016, 3036)); sitd = ease(seg(f, 3036, 3054))
    lk = ease(seg(f, 3002, 3016)) * (1 - turn)
    yaw = angle_lerp(0, 180, turn)
    x = lerp(STOP - .45, WX - .9, step); y = lerp(YK, YK - 1.0, step)
    stride = 22 * math.sin(math.pi * step)
    hip = lerp(stride, -90, sitd)
    down = ease(seg(f, 3056, 3084))                                    # the footsteps: he doesn't look
    st.update(pos=(x, y, VOIDZ - .68 * SK["H"] * sitd), yaw=yaw, hips=(hip, lerp(-stride, -90, sitd)),
              shL=(lerp(9 + 10 * lk, 0, sitd), lerp(-stride * .4, -60, sitd)), shR=(lerp(-9 - 10 * lk, 0, sitd), lerp(stride * .4, -60, sitd)),
              neck=(lerp(-11 * lk, 24 * down, sitd), 0), lean=lerp(-2 * lk, 4 + breath, sitd))
    return st

# ---------- the flower seller: frozen on the tile at its night, then walking in on the grid from 3060 ----------
SELLER_IN = 3060
def seller_state(f):
    if f < SELLER_IN: return None
    dist = 1.4 * (f - SELLER_IN) / 24; s_, bob = swing(dist)
    return dict(pos=(WX - 8.1 + dist, YK + 1.6, VOIDZ + bob), yaw=0, hips=(s_, -s_), shL=(9, -s_ * .6), shR=(-9, s_ * .6), lean=1)
# the loop's pose at the tile's night (t = 117.0 s: the can upright), held until she walks in
pose(W.seller, SELLER_IN - 1, (W.FS[0] - .95, W.FS[1] + .05, 0), -25, lean=2, neck=(8, 0), shL=(0, -8), shR=(0, -62))

for f in range(F0, F1 + 1):
    pose(SK, f, **keeper_state(f))
    ss = seller_state(f)
    if ss: pose(W.seller, f, **ss)

# ---------- faces: flat + highlight from act 4; wonder on the tile (113.49), flat as the prompt closes (120.41),
# doubt at the wall (121.98), wonder with the hand on the crack (123.48), fear for the turn (125.5) ----------
W.face_default(F, F0, "flat", hl=True)
def face(f, name, hl=None):
    for n, g in F.items():
        if n == "hl": continue
        vis(g, f, n == name)
    if hl is not None: vis(F["hl"], f, hl)
face(2724, "wonder"); face(2890, "flat"); face(2928, "doubt"); face(2964, "wonder"); face(3012, "fear")

# ---------- shots (cut on the line onsets; the turn is instrumental) ----------
shot = W.shot
def kp(f): x, y = grid_pos(f); return Vector((x, y, VOIDZ))
# w1: the sketch's s4b end framing, drifting on: he walks out on the grid, small, his shadow the only one out here
shot("w1", 2539, 2561, (EDGE - 7.6, -10.2, 8.4), (EDGE - 7.9, -10.6, 8.9), (EDGE + 10, 1, -.5), (EDGE + 10.4, .8, -.5), 24)
# w2 (106.75): from high above, the camera riding with him: a tiny figure on a lattice of lines
def track_w2(f):
    p = kp(f); u = seg(f, 2562, 2621)
    return (p.x + 8.0, p.y - 2.0, 22.0 + 2.5 * u), (p.x + 2.0, p.y - .5, VOIDZ)
shot("w2", 2562, 2621, None, None, None, None, 45, track=track_w2)
# w3 (109.24): low from just past the edge, looking out after him: the lines fade into the dark ahead
p3a, p3b = kp(2622), kp(2723)
shot("w3", 2622, 2723, (EDGE + .3, 4.5, 3.0), (EDGE + .6, 4.1, 3.3), (p3a.x, p3a.y, VOIDZ + .6), (p3b.x, p3b.y, VOIDZ + .6), 30)
# tile (113.49): the still's camera (the same framing of him, moved with his stop point), a slow pull-back to 2880
TILE_CAM0 = Vector((P_STOP[0] + 18.0, P_STOP[1] - 8.5, VOIDZ + 9.6))
TILE_TGT = Vector((P_STOP[0] - 48.5, P_STOP[1] + 23.5, VOIDZ + 1.1))
TILE_V = (TILE_TGT - TILE_CAM0).normalized()
def cam_tile(f):
    u = ease(seg(f, 2724, 2880))
    c = TILE_CAM0 - TILE_V * 9.0 * u
    return (c.x, c.y, c.z), tuple(TILE_TGT)
shot("tile", 2724, 2897, None, None, None, None, 30, track=cam_tile)
# m (120.75): a medium from ahead on his road, the dark tile behind him; he walks toward us, not reset
_pm = kp(2898); _left = (-DIR_WALL[1], DIR_WALL[0])
M_CAM = (_pm.x + DIR_WALL[0] * 7.0 + _left[0] * 1.0, _pm.y + DIR_WALL[1] * 7.0 + _left[1] * 1.0, VOIDZ + 1.7)
def track_m(f):
    p = kp(f); return M_CAM, (p.x, p.y, VOIDZ + 1.45)
shot("m", 2898, 2927, None, None, None, None, 35, track=track_m)
# s5a (121.98): the sketch's framing of the wall and the crack; he walks in to it
shot("s5a", 2928, 2963, (WX - 13, Y5 - 5.6, 2.6), (WX - 11.4, Y5 - 4.9, 2.45), (WX, Y5, 2.3), (WX, Y5, 2.2), 30)
# s5b (123.48): closer, from his left: the hand on the crack, the half step back
shot("s5b", 2964, 3011, (WX - 1.6, YK + 3.2, 1.15), (WX - 1.5, YK + 2.9, 1.1), (WX - .6, YK + .3, .95), (WX - .7, YK + .25, .92), 35)
# turn (125.5): from the wall side, looking back at him sitting beside the crack; she comes in from the far left
shot("turn", 3012, 3130, (WX - 5.2, YK - 5.0, 2.0), (WX - 3.2, YK - 3.4, 1.4), (WX - 1.8, YK + .3, .5), (WX - 2.2, YK + .2, .8), 35)

# ---------- the prompt: over his head out here too, facing the camera; it waits, and closes unpressed on 120.41 ----------
PROMPT_ON, PROMPT_OFF = 2812, 2890
key(W.prompt, PROMPT_ON - 1, loc=(0, 0, -60)); vis(W.prompt, F0, False)
for f in range(PROMPT_ON, PROMPT_OFF):
    st = keeper_state(f); fx, fy = math.cos(R(st["yaw"])), math.sin(R(st["yaw"]))
    p = (st["pos"][0] + .25 * fx, st["pos"][1] + .25 * fy, VOIDZ + 2.35)
    c = cam_tile(f)[0]
    key(W.prompt, f, loc=p, rot=(0, 0, math.atan2(c[1] - p[1], c[0] - p[0])))
vis(W.prompt, PROMPT_ON, True); vis(W.prompt, PROMPT_OFF, False); key(W.prompt, PROMPT_OFF, loc=(0, 0, -60))

# ---------- the wall: in from the s5a cut, the crack closed, the sunrise set behind it (sharp) ----------
W.crack_open(F0, .06)
for ob in [W.wallLo, W.wallHi, W.rimLo, W.rimHi] + W.SR: vis(ob, 2928, True)

# ---------- light: the edge light out on the grid (his shadow from the sun), the void's from the wall shot ----------
W.light(F0, "edge")
W.light(2928, "void", crack=0.0)

pixel_groups([(F0, 6)], [([o.name for o in W.SR], 1)])
W.finish_steps()
print("ACT5 shots:", W.SHOTS, "stop", tuple(round(v, 2) for v in P_STOP), "h_stop", round(H_STOP, 1), "h_wall", round(H_WALL, 1),
      "path", round(plen(GRID_PATH), 2), "s_stop", round(S_STOP, 2))
run(OUT)
