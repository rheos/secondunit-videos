# Respawn act 6: the bridge and the turnaround, off-script (song 130.4-141.5 s, frames 3130-3396). STORYBOARD-respawn.md,
# act 6. The drums are out: the quietest part of the film, slow close cameras. He sits with his back to the wall beside
# the crack, afraid she is code too. Footsteps: it's the flower seller, her can still in her hand, her hat brim bent,
# out of breath (nothing in the game has ever been). Her eyes get their highlight on 130.74. She sits down beside him a
# half-beat late, sets the can on the grid, holds out her flower; he takes it; cut to her pot back in the frozen night
# village: empty, the first thing that didn't respawn. The crack flares at the flower's light; they stand, put their
# hands in it (his tremble) and pull: the turnaround (137.8-141.5) opens it wide on the real sunrise, the grid lines
# going gold out from their feet.
#
#   tools/render_lock.sh blender -b --factory-startup --python respawn_act6.py -- --stills 3130,3150,3175,3210
#   (never --render here: the acts render on Modal)
# Frames land in out/film/respawn/act6/frames/ (named by song frame). Structure follows respawn_act1.py: build the
# world, freeze the village loops, key the cast per frame from pure functions of the frame, swap faces with vis(), cut
# shots on the line onsets, set the pixel groups, finish_steps(), run().
import bpy, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
sys.path.insert(0, HERE)
import respawn_world as RW
from respawn_world import R, ease, seg, lerp, clamp, swing, polyline, plen, angle_lerp
from film_kit import pixel_groups, sec, key, run

F0, F1 = 3130, 3396
OUT = os.path.join(HERE, "out", "film", "respawn", "act6")
W = RW.build(F0, F1, OUT)
vis, pose = W.vis, W.pose
K, S = W.keeper, W.seller
VOIDZ, WX, Y5 = W.VOIDZ, W.WX, W.Y5
YK = Y5 + W.crack_c(.75) - .478          # the sketch's y beside the crack (act 5 sits him here)
YC = YK + .478                            # the crack's centre at hand height
K_SIT = (WX - .9, YK - 1.0)               # act 5's end: him, back to the wall, facing -x
S_SIT = (WX - .9, YK + .2)                # where she sits down beside him
K_PULL = (WX - .5, YC - .33)              # the two of them at the wall, hands in the crack
S_PULL = (WX - .5, YC + .40)
K_END = (WX - 1.2, YK - .5)               # act 7 starts here
S_END = (WX - 1.2, YK + .45)
HAND = (WX - .12, YC, .72)                # where the hands go in: the slit, at shoulder height

# ---------- the set: the wall, the sunrise and the void from F0; the village far behind, its sky card down ----------
vis(W.skyEnd, F0, False); vis(W.skyWest, F0, False); vis(W.skySouth, F0, False); vis(W.skyWall, F0, False)
for ob in [W.wallLo, W.wallHi, W.rimLo, W.rimHi] + W.SR: vis(ob, F0, True)
vis(W.potFlower, F0, False)               # the pot stays empty this act: the first thing that didn't respawn
# the village at night for the one cut back (act 5's look): a dark sky card where the painted one was
skyNight = W.plane("skyNight6", [(W.WEST, 40, -1.5), (W.EDGE, 40, -1.5), (W.EDGE, 40, 90), (W.WEST, 40, 90)],
                   W.grad_mat("skyNight6", [(0, "#0b1230"), (.4, "#070c22"), (1, "#04061a")], 2, 0, 60))
vis(skyNight, F0, True)
# the NPCs stand in their loop poses, frozen (one key at F0, nothing after); the seller's F0 key is re-keyed below
W.village_loops(F0, F0, keeper_home=False)
# her hat brim, bent from the fence
brim = bpy.data.objects["CL_seller_brim"]; brim.rotation_euler = (R(9), R(-6), 0); brim.keyframe_insert("rotation_euler", frame=F0)

# the can she sets down on the grid (her hand can hides at the swap); the flower once it is in his hand
can6 = RW.empty("can6", (0, 0, -50))
RW.box("can6_body", (.26, .2, .24), (0, 0, -.14), W.M["tin"], can6)
RW.box("can6_spout", (.3, .05, .05), (.22, 0, -.06), W.M["tin"], can6, rot=(0, R(-25), 0))
RW.box("can6_handle", (.06, .06, .16), (-.1, 0, .05), W.M["tin"], can6)
KF = RW.blocks("handFlowerK6", [((.04, .04, .3), (0, 0, .15)), ((.14, .14, .12), (0, 0, .33)), ((.07, .07, .05), (0, 0, .4))], W.M["flowR"], K["tipL"])
vis(can6, F0, False); vis(KF, F0, False)

# ---------- arm geometry: where a hand tip lands for a pose, and the shoulder angles that put it on a target ----------
def rot_x(v, a): c, s = math.cos(a), math.sin(a); return (v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c)
def rot_y(v, b): c, s = math.cos(b), math.sin(b); return (v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c)
def rot_z(v, g): c, s = math.cos(g), math.sin(g); return (v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2])

def hand_world(d, pos, yaw, lean, side, a, b, sit=0.):
    """world position of d's hand tip (Blender XYZ eulers: root (0, lean, yaw), shoulder (a, b, 0))"""
    H, W_ = d["H"], d["W"]; s = 1 if side == "L" else -1
    arm = rot_y(rot_x((0, 0, -.6 * H), R(a)), R(b))
    p = (arm[0], arm[1] + s * (.26 * W_ + .08), arm[2] + 1.33 * H)
    p = rot_z(rot_y(p, R(lean)), R(yaw))
    return (pos[0] + p[0], pos[1] + p[1], pos[2] - .68 * H * sit + p[2])

def flower_axis(d_yaw, lean, a, b, phi):
    """unit vector of a hand flower whose local rotation is (0, phi - b, 0): it leans phi degrees forward of vertical
    in the root's frame, whatever the arm does (ignoring the arm's sideways swing)"""
    v = rot_y((0, 0, 1), R(phi - b)); v = rot_y(rot_x(v, R(a)), R(b))
    return rot_z(rot_y(v, R(lean)), R(d_yaw))

_REACH = {}
def reach(d, pos, yaw, lean, side, target, sit=0.):
    """shoulder (x_rot, y_rot) that puts the hand tip nearest `target`; a coarse grid, then a fine one"""
    k = (d["name"], tuple(round(v, 3) for v in pos), round(yaw, 1), round(lean, 1), side, tuple(round(v, 3) for v in target), round(sit, 3))
    if k in _REACH: return _REACH[k]
    def err(a, b):
        h = hand_world(d, pos, yaw, lean, side, a, b, sit); return math.dist(h, target)
    best = min(((err(a, b), a, b) for a in range(-110, 111, 10) for b in range(-180, 41, 10)))
    e, a0, b0 = best
    best = min(((err(a, b), a, b) for a in range(a0 - 10, a0 + 11, 2) for b in range(b0 - 10, b0 + 11, 2)))
    _REACH[k] = (best[1], best[2]); return _REACH[k]

def look(pos, yaw, head_z, target, max_yaw=60.):
    """neck (pitch, yaw) that turns a head at (pos, head_z) toward target, within the neck's range"""
    dx, dy, dz = target[0] - pos[0], target[1] - pos[1], target[2] - head_z
    ny = clamp(((math.degrees(math.atan2(dy, dx)) - yaw + 180) % 360) - 180, -max_yaw, max_yaw)
    return (clamp(-math.degrees(math.atan2(dz, math.hypot(dx, dy))), -28, 32), ny)

def head_z(d, pos, sit): return pos[2] - .68 * d["H"] * sit + 1.4 * d["H"] + .2
def blend2(a, b, u): return (lerp(a[0], b[0], u), lerp(a[1], b[1], u))

# ---------- the crack: closed to the flare, then wide open on the turnaround (the sketch's ease) ----------
def gap(f):
    return .06 + (1.5 - .06) * (1 - (1 - seg(f, 3300, 3380)) ** 3)
def crack_light(f):
    """0..1 for W.light: the flare on 3240 lifts it to .35; the opening takes it to 1 by 3380"""
    c = .35 * ease(seg(f, 3240, 3246))
    return c + (1 - .35) * (1 - (1 - seg(f, 3300, 3380)) ** 3) if f >= 3300 else c
def rim_y(f, side): return YC + side * (gap(f) + .03)

# ---------- the seller: the walk in, the breath, the sit, the flower, the stand, the pull ----------
P_S = [(WX - 8.1, YK + 1.6), (WX - 3.5, YK + 1.6), (WX - 1.15, YK + .5)]
_DIST = {}
def s_dist(f):
    """metres along P_S: act 5's 1.4 m/s to 3138, then she hurries, unevenly, and stops by 3164"""
    if f <= 3138: return 1.4 * (f - 3060) / 24
    if f in _DIST: return _DIST[f]
    d = s_dist(f - 1)
    v = lerp(1.4, 2.9, ease(seg(f, 3138, 3144))) * (1 + .35 * math.sin((f - 3138) * 2 * math.pi / 9)) * (1 - ease(seg(f, 3157, 3164)))
    _DIST[f] = d + v / 24; return _DIST[f]
STOP, STOP_HD = polyline(P_S, s_dist(3164))

_BR = {}
def breath(f):
    """-1..1, her breathing: fast and deep from 3138, settling to a slow small breath that never stops"""
    if f < 3138: return 0.
    if f in _BR: return _BR[f]
    per = lerp(11., 30., ease(seg(f, 3182, 3240)))
    if f > 3138 and (f - 1) not in _BR_PH: breath(f - 1)
    ph = (0. if f == 3138 else _BR_PH[f - 1]) + 2 * math.pi / per
    _BR_PH[f] = ph
    amp = lerp(1., .28, ease(seg(f, 3182, 3236)))
    _BR[f] = amp * math.sin(ph); return _BR[f]
_BR_PH = {3137: 0.}

def seller_state(f):
    st = dict(pos=(S_SIT[0], S_SIT[1], VOIDZ), yaw=180, lean=3, neck=(6, 0), shL=(0, -60), shR=(0, -60), hips=(0, 0), sit=0., shz=0., phi=30.)
    br = breath(f); st["shz"] = .035 * br; st["lean"] += 2.5 * br
    k_head = (K_SIT[0], K_SIT[1], head_z(K, (0, 0, VOIDZ), 1.))
    if f < 3164:                                                   # the walk in: on rails to 3138, then hers
        d = s_dist(f); (x, y), hd = polyline(P_S, d); s, bob = swing(d)
        wob = ease(seg(f, 3138, 3142)) * (1 - seg(f, 3158, 3164))
        yaw = hd + 7 * math.sin((f - 3138) / 2.7) * wob
        yaw = angle_lerp(yaw, 180, ease(seg(f, 3158, 3170)))        # she turns her back to the wall as she stops
        dip = .07 * math.sin(math.pi * seg(f, 3147, 3152))         # a stumble
        st.update(pos=(x, y, VOIDZ + bob - dip), yaw=yaw, hips=(s - 12 * dip / .07, -s), shL=(9, -s * .6), shR=(-9, s * .6 - 22))
        st["lean"] += 4 + 3 * math.sin((f - 3138) / 2.3) * wob
        st["neck"] = blend2((8, 0), look((x, y), yaw, head_z(S, (0, 0, VOIDZ), 0), k_head), ease(seg(f, 3140, 3150)))
        return st
    tu = ease(seg(f, 3158, 3170)); su = ease(seg(f, 3165, 3179))   # 131.89: she sits, a half-beat late
    pos = (lerp(STOP[0], S_SIT[0], su), lerp(STOP[1], S_SIT[1], su), VOIDZ)
    st["yaw"] = angle_lerp(STOP_HD, 180, tu)
    st["sit"] = su; st["lean"] += 4 + 12 * math.sin(math.pi * su)
    shR_y = lerp(-22, -6, ease(seg(f, 3164, 3173)))               # the can goes down beside her
    shR_y = lerp(shR_y, -60, ease(seg(f, 3174, 3186)))
    out = ease(seg(f, 3164, 3173)) * (1 - ease(seg(f, 3174, 3186)))
    st["shL"] = (lerp(9, 0, su), lerp(-20, -60, ease(seg(f, 3170, 3186)))); st["shR"] = (lerp(-9, 0, su) - 42 * out, shR_y)
    st["neck"] = blend2((10, 0), look(pos, st["yaw"], head_z(S, pos, su), k_head), ease(seg(f, 3176, 3184)))
    st["yaw"] = angle_lerp(st["yaw"], 205, ease(seg(f, 3185, 3195)))  # she turns to him
    if f >= 3200:                                                  # 133.46: she holds out her flower; he takes it on 3215
        hu = ease(seg(f, 3203, 3210)); back = ease(seg(f, 3215, 3228))
        st["yaw"] = angle_lerp(205, 200, hu); st["yaw"] = angle_lerp(st["yaw"], 215, back)
        st["lean"] += 3 * hu * (1 - back); st["phi"] = 55
        a, b = reach(S, pos, st["yaw"], st["lean"], "L", FLOWER_MEET, 1.)
        st["shL"] = blend2(blend2((0, -60), (a, b), hu), (0, -60), back)
        if hu > 0 and back < 1:
            nk = look(pos, st["yaw"], head_z(S, pos, 1.), (FLOWER_MEET[0], FLOWER_MEET[1], FLOWER_MEET[2] + .15)); st["neck"] = (nk[0] * .4, nk[1])   # eyes down, not the head
        if f >= 3228: st["neck"] = look(pos, st["yaw"], head_z(S, pos, 1.), FLOWER_HELD)      # she watches it in his hand
    if f >= 3242:                                                  # the flare: she looks over her shoulder at the glow
        u = ease(seg(f, 3243, 3251)); st["yaw"] = angle_lerp(st["yaw"], 120, u); st["neck"] = blend2(st["neck"], (-8, -60), u)
    if f >= 3250:                                                  # they stand, turn to the wall, step to it
        su = 1 - ease(seg(f, 3250, 3275)); st["sit"] = su
        st["lean"] = 3 + 2.5 * br + 18 * math.sin(math.pi * su) * (f < 3275)
        st["hips"] = (0, 0); st["shL"] = (6, 14 * math.sin(math.pi * su)); st["shR"] = (-6, 14 * math.sin(math.pi * su))
        st["yaw"] = angle_lerp(120, 60, ease(seg(f, 3262, 3286)))
        st["neck"] = blend2((-8, -60), (-6, 0), ease(seg(f, 3252, 3270)))
        if f >= 3284:
            L = math.dist(S_SIT, S_PULL); d = min(L, 1.4 * (f - 3284) / 24); u = d / L; s, bob = swing(d)
            pos = (lerp(S_SIT[0], S_PULL[0], u), lerp(S_SIT[1], S_PULL[1], u), VOIDZ + bob * (d < L))
            st["hips"] = (s, -s) if d < L else (0, 0); st["shL"], st["shR"] = (9, -s * .6), (-9, s * .6)
            st["yaw"] = angle_lerp(60, -25, ease(seg(f, 3295, 3304)))
            st["neck"] = look(pos, st["yaw"], head_z(S, pos, 0), (WX, YC, .9))
        if f >= 3298:                                              # hands into the crack, the pull, the let-go
            hu = ease(seg(f, 3298, 3306)); pull = ease(seg(f, 3306, 3316)); rel = ease(seg(f, 3316, 3330))
            st["lean"] = lerp(lerp(3, 9, hu), -10, pull) * (1 - rel) + 2.5 * br
            tL = (HAND[0], rim_y(f, +1) + .02, .72); tR = (HAND[0], rim_y(f, +1) + .05, .52)
            aL, bL = reach(S, pos, st["yaw"], st["lean"], "L", tL); aR, bR = reach(S, pos, st["yaw"], st["lean"], "R", tR)
            st["shL"] = blend2(blend2((9, 0), (aL, bL), hu), (4, 0), rel); st["shR"] = blend2(blend2((-9, 0), (aR, bR), hu), (-4, 0), rel)
            st["neck"] = look(pos, st["yaw"], head_z(S, pos, 0), (WX, YC, .9 + .5 * pull))
        if f >= 3338:                                              # they step back and watch it open
            L = math.dist(S_PULL, S_END); d = min(L, .9 * (f - 3338) / 24); u = ease(d / L); s, bob = swing(d)
            pos = (lerp(S_PULL[0], S_END[0], u), lerp(S_PULL[1], S_END[1], u), VOIDZ + bob * (d < L))
            st["hips"] = (s * .6, -s * .6) if d < L else (0, 0)
            st["yaw"] = angle_lerp(-25, 0, ease(seg(f, 3340, 3362)))
            st["neck"] = look(pos, st["yaw"], head_z(S, pos, 0), (WX + 40, YC, 4 + .01 * (f - 3338)))
            st["lean"] = 1 + 2.5 * br
    st["pos"] = pos
    return st

# ---------- the keeper: afraid, then looking, taking the flower, standing, the tremble, the pull ----------
def keeper_state(f):
    st = dict(pos=(K_SIT[0], K_SIT[1], VOIDZ), yaw=180, lean=4, neck=(14, 0), shL=(0, -60), shR=(0, -60), hips=(0, 0), sit=1., shz=0., phi=30.)
    pos = st["pos"]
    ss = seller_state(f); s_head = (ss["pos"][0], ss["pos"][1], head_z(S, ss["pos"], ss["sit"]))
    st["shz"] = .006 * math.sin(f / 7.0)                           # a small still breath
    if f >= 3147:                                                  # 131.12: he lifts his head and looks at her
        u = ease(seg(f, 3147, 3156))
        st["neck"] = blend2((14, 0), look(pos, st["yaw"], head_z(K, pos, 1.), s_head), u)
        st["yaw"] = angle_lerp(180, 160, ease(seg(f, 3150, 3165)))
        st["neck"] = blend2((14, 0), look(pos, st["yaw"], head_z(K, pos, 1.), s_head), u)
    if f >= 3200:                                                  # the flower: his left hand comes up to it
        hu = ease(seg(f, 3206, 3215)); back = ease(seg(f, 3216, 3228))
        st["yaw"] = angle_lerp(160, 100, ease(seg(f, 3203, 3210))); st["yaw"] = angle_lerp(st["yaw"], 150, back)   # he turns to her
        st["lean"] = 4 + 3 * hu * (1 - back)
        a, b = reach(K, pos, st["yaw"], st["lean"], "L", FLOWER_TAKE, 1.)
        st["shL"] = blend2(blend2((0, -60), (a, b), hu), (0, -96), back)       # then he holds it up, looking at it
        nk = look(pos, st["yaw"], head_z(K, pos, 1.), (FLOWER_MEET[0], FLOWER_MEET[1], FLOWER_MEET[2] + .15)); st["neck"] = (nk[0] * .4, nk[1])
        if f >= 3222: st["neck"] = blend2(st["neck"], (18, 0), ease(seg(f, 3222, 3228)))
    if f >= 3242:                                                  # the flare: he looks over his shoulder at the glow
        u = ease(seg(f, 3243, 3251)); st["yaw"] = angle_lerp(st["yaw"], 100, u); st["neck"] = blend2(st["neck"], (-6, -55), u)
    if f >= 3250:
        su = 1 - ease(seg(f, 3250, 3275)); st["sit"] = su
        st["lean"] = 4 + 18 * math.sin(math.pi * su) * (f < 3275)
        st["shL"] = (6, -96 * su - 10 * (1 - su)); st["shR"] = (-6, 14 * math.sin(math.pi * su))   # the flower stays in his left hand
        st["yaw"] = angle_lerp(100, 70, ease(seg(f, 3262, 3286)))
        st["neck"] = blend2((-6, -55), (-6, 0), ease(seg(f, 3252, 3270)))
        if f >= 3284:
            L = math.dist(K_SIT, K_PULL); d = min(L, 1.4 * (f - 3284) / 24); u = d / L; s, bob = swing(d)
            pos = (lerp(K_SIT[0], K_PULL[0], u), lerp(K_SIT[1], K_PULL[1], u), VOIDZ + bob * (d < L))
            st["hips"] = (s, -s) if d < L else (0, 0); st["shL"], st["shR"] = (6, -10), (-9, s * .6)
            st["yaw"] = angle_lerp(70, 25, ease(seg(f, 3295, 3304)))
            st["neck"] = look(pos, st["yaw"], head_z(K, pos, 0), (WX, YC, .9))
        if f >= 3298:                                              # his right hand into the crack: the tremble, the pull
            hu = ease(seg(f, 3298, 3306)); pull = ease(seg(f, 3306, 3316)); rel = ease(seg(f, 3316, 3330))
            st["lean"] = lerp(lerp(4, 9, hu), -10, pull) * (1 - rel)
            tR = (HAND[0], rim_y(f, -1) - .02, .72)
            aR, bR = reach(K, pos, st["yaw"], st["lean"], "R", tR)
            if 3300 <= f < 3312: bR += 3 if ((f - 3300) // 2) % 2 == 0 else -3           # the 2-frame jitter, 12 frames
            st["shR"] = blend2(blend2((-9, 0), (aR, bR), hu), (-4, 0), rel); st["shL"] = (6, -10)
            st["neck"] = look(pos, st["yaw"], head_z(K, pos, 0), (WX, YC, .9 + .5 * pull))
        if f >= 3338:
            L = math.dist(K_PULL, K_END); d = min(L, .9 * (f - 3338) / 24); u = ease(d / L); s, bob = swing(d)
            pos = (lerp(K_PULL[0], K_END[0], u), lerp(K_PULL[1], K_END[1], u), VOIDZ + bob * (d < L))
            st["hips"] = (s * .6, -s * .6) if d < L else (0, 0)
            st["yaw"] = angle_lerp(25, 0, ease(seg(f, 3340, 3362)))
            st["neck"] = look(pos, st["yaw"], head_z(K, pos, 0), (WX + 40, YC, 4 + .01 * (f - 3338)))
            st["lean"] = 1
    st["pos"] = pos
    return st

# where her flower head sits when she holds it out on 3210, and where his hand closes on the stem
def _meet():
    pos = (S_SIT[0], S_SIT[1], VOIDZ); yaw = 200.; lean = 3 + 3 + 4
    probe = (K_SIT[0] - .32, lerp(S_SIT[1], K_SIT[1], .6), VOIDZ - .65 + 1.28 - .42)
    a, b = reach(S, pos, yaw, lean, "L", probe, 1.)
    tip = hand_world(S, pos, yaw, lean, "L", a, b, 1.); ax = flower_axis(yaw, lean, a, b, 55)
    return tip, tuple(tip[i] + .18 * ax[i] for i in range(3))
FLOWER_MEET, FLOWER_TAKE = _meet()
FLOWER_HELD = hand_world(K, (K_SIT[0], K_SIT[1], VOIDZ), 150, 4, "L", 0, -96, 1.)   # the flower held up in his hand after

# ---------- the gold grid: lines from their feet toward the camera, lit over the turnaround ----------
GOLD = RW.mat("gold6", "#ffd27a", .02, 61, texel=.05, emit=2.4)
GX0 = 49.9 + .0375                                                 # the void's grid lines (grid_mat, object space of voidA)
LINES_Y = [k * 1.2 + .0375 for k in range(-502, -497)]             # the five lines nearest their feet (Y5 - 1.2 .. Y5 + .45)
LINES_X = [GX0 + 1.2 * k for k in range(190, 209)]                  # from x = 277.9 to 299.5
gold_x = [RW.blocks(f"gold6_y{i}", [((14, .06, .012), (-7, 0, 0))], GOLD) for i in range(len(LINES_Y))]
gold_y = [RW.blocks(f"gold6_x{i}", [((.06, 6.0, .012), (0, 0, 0))], GOLD) for i in range(len(LINES_X))]
for i, ob in enumerate(gold_x): ob.location = (WX - 1.0, LINES_Y[i], VOIDZ + .006); vis(ob, F0, False)
for i, ob in enumerate(gold_y): ob.location = (LINES_X[i], Y5 - .73, VOIDZ + .006); vis(ob, F0, False)
def gold_len(f, y=Y5 - .73): return 14 * ease(seg(f - 7 * abs(y - (Y5 - .73)), 3330, 3392))

# ---------- the flare: a short pulse of warm light at the crack when the flower's light touches it (134.62) ----------
fd = bpy.data.lights.new("CL_flare6", "POINT"); fd.color = RW.hex_lin("#ffd9a0"); fd.shadow_soft_size = .6
flare = bpy.data.objects.new("CL_flare6", fd); W.scene.collection.objects.link(flare); flare.location = (WX - .75, YC, .9)

# ---------- key everything, every frame, from the state functions ----------
def apply(d, f, st):
    H = d["H"]; sit = st["sit"]; p = st["pos"]
    hips = (st["hips"][0] - 90 * sit, st["hips"][1] - 90 * sit)
    pose(d, f, (p[0], p[1], p[2] - .68 * H * sit), st["yaw"], st["lean"], st["neck"], st["shL"], st["shR"], hips)
    for side, s in (("L", 1), ("R", -1)):
        key(d["sh" + side], f, loc=(0, s * (.26 * d["W"] + .08), 1.33 * H + st["shz"]))

for f in range(F0, F1 + 1):
    ks, ss = keeper_state(f), seller_state(f)
    apply(K, f, ks); apply(S, f, ss)
    key(S["flower"], f, rot=(0, R(ss["phi"] - ss["shL"][1]), 0))
    key(KF, f, rot=(0, R(ks["phi"] - ks["shL"][1]), 0))
    W.crack_open(f, gap(f))
    W.light(f, "night" if 3215 <= f <= 3236 else "void", crack=crack_light(f))
    fd.energy = 260 * ease(seg(f, 3240, 3244)) * (1 - ease(seg(f, 3246, 3262))); fd.keyframe_insert("energy", frame=f)
    L = gold_len(f)
    for i, ob in enumerate(gold_x): key(ob, f, scale=(max(gold_len(f, LINES_Y[i]), .002) / 14, 1, 1))
    for i, ob in enumerate(gold_y):
        reach_x = WX - 1.0 - L; w = ease(seg(reach_x, LINES_X[i] + .3, LINES_X[i] - .9))
        key(ob, f, scale=(1, max(w, .002), 1))
for ob in gold_x + gold_y: vis(ob, 3330, True)

# the can: her hand can hides on 3173; a copy stands on the grid where her hand let it go
cp = W.world_at(S["can"], 3173); cyaw = R(seller_state(3173)["yaw"])
key(can6, F0, loc=(cp.x, cp.y, VOIDZ + .26), rot=(0, 0, cyaw))
vis(S["can"], 3173, False); vis(can6, 3173, True)
# the flower: hers shows as her hand comes up on 3200; on 3215 it is his
vis(S["flower"], 3200, True); vis(S["flower"], 3215, False); vis(KF, 3215, True)

# a check that the arm geometry here matches Blender's (printed; should be a few millimetres)
_t = seller_state(3210); _hw = hand_world(S, _t["pos"], _t["yaw"], _t["lean"], "L", _t["shL"][0], _t["shL"][1], _t["sit"])
print("ACT6 hand check", tuple(round(v, 3) for v in _hw), tuple(round(v, 3) for v in W.world_at(S["tipL"], 3210)))

# ---------- faces: every change on a word onset; his highlight all act, hers from 130.74 ----------
def face(d, f, name, hl=None):
    F = d["F"]
    for n, g in F.items():
        if n == "hl": continue
        vis(g, f, n == name)
    if hl is not None: vis(F["hl"], f, hl)
face(K, F0, "fear", hl=True); face(S, F0, "polite", hl=False)
face(S, 3138, "wonder", hl=True)          # 130.74: it's the flower seller, and she's awake
face(K, 3147, "doubt")                    # 131.12: is she real?
face(S, 3185, "tender")                   # 132.72: sat beside him, looking at him
face(K, 3203, "wonder")                   # 133.46: she holds out the flower
face(S, 3213, "wonder")                   # 133.89: he takes it
face(K, 3236, "tender"); face(S, 3236, "tender")
face(K, 3250, "wonder"); face(S, 3250, "wonder")   # the flare: they stand

# ---------- shots (cut on the line onsets); s8 is the sketch's s5b ----------
shot = W.shot
FS = W.FS
shot("s1", 3130, 3164, (WX - 3.2, YK - 3.4, 1.4), (WX - 3.0, YK - 3.3, 1.32), (WX - 2.2, YK + .2, .8), (WX - 1.7, YK - .1, .55), 35)   # footsteps: it's her
shot("s2", 3165, 3214, (WX - 4.2, YK - .5, .75), (WX - 4.0, YK - .48, .7), (WX - .9, YK - .4, .12), (WX - 1.0, YK - .4, .05), 40)   # she sits; the can; the flower
shot("s4", 3215, 3236, (FS[0] - 1.6, FS[1] - 1.5, 1.5), (FS[0] - 1.55, FS[1] - 1.45, 1.48), (FS[0], FS[1], 1.05), (FS[0], FS[1], 1.06), 50)   # the pot, empty, night
shot("s5", 3237, 3249, (WX - 3.3, YK - .9, 1.05), (WX - 3.2, YK - .88, 1.02), (WX - 1.0, YK - .45, .2), (WX - 1.0, YK - .45, .22), 40)      # tender; the flare
shot("s6", 3250, 3299, (WX - 5.2, YC - 2.2, 1.1), (WX - 4.6, YC - 1.8, 1.0), (WX - 1.0, YC - .1, .3), (WX - .7, YC, .5), 32)               # they stand and go to the crack
shot("s7", 3300, 3340, (WX - 5.2, YC - 1.1, 2.2), (WX - 5.0, YC - 1.0, 2.15), (WX - .2, YC, .65), (WX - .2, YC, .75), 32)                      # low, from behind and the side: the hands in the slit, the pull
shot("s8", 3341, 3396, tuple(W.CAM5 + Vector((-.35, -.05, 0))), tuple(W.CAM5 + Vector((.35, .05, 0))), (WX, Y5 + .1, 1.0), (WX, Y5 + .1, 1.05), 35)   # it opens wide

pixel_groups([(F0, 6)], [([o.name for o in W.SR], 1)])
W.finish_steps()
print("ACT6 shots:", W.SHOTS, "yk", round(YK, 3), "stop", tuple(round(v, 2) for v in STOP), "meet", tuple(round(v, 2) for v in FLOWER_MEET))
run(OUT)
