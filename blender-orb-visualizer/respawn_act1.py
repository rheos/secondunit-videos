# Respawn act 1: verse 1, the sale (song 21.0-49.29 s, frames 504-1183). STORYBOARD-respawn.md, act 1.
# 21.0-32.0 is take 07 as built (shots s1, s2a, s2b: the sale, the sword flies, a new one pops on, the smile goes
# polite on 27.56, the flat close-up). Then hero after hero until it is a queue; at 36.5 he glances across at the flower
# seller, starts his wave and stops halfway (the first doubt: his eyes get their highlight); at 44.9 he writes his own
# price on the back of the tag and on 47.24 it flips back by itself; he looks at his hands; hold on the wall sword.
#
#   tools/render_lock.sh blender -b --factory-startup --python respawn_act1.py -- --stills 520,700,880,960,1100,1170
#   tools/render_lock.sh blender -b --factory-startup --python respawn_act1.py -- --render
# Frames land in out/film/respawn/act1/frames/ (named by song frame). This file is the template for the other acts:
# build the world, key the village loops, key the cast per frame from pure functions of the frame, swap faces with
# vis(), cut shots on the line onsets, set the pixel groups, finish_steps(), run().
import bpy, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
sys.path.insert(0, HERE)
import respawn_world as RW
from respawn_world import R, ease, seg, lerp, clamp, swing, polyline, plen, angle_lerp
from film_kit import pixel_groups, sec, key, run

F0, F1 = 504, 1183
OUT = os.path.join(HERE, "out", "film", "respawn", "act1")
W = RW.build(F0, F1, OUT)
vis, pose = W.vis, W.pose
SK, F = W.keeper, W.keeper["F"]

# ---------- the village runs its loops under everything ----------
W.village_loops(F0, F1, keeper_home=False)

# ---------- heroes: the sketch's three, then four more for the queue (the same man) ----------
HEROES = W.heroes + [W.make_hero(f"heroq{i}", "#c8341e") for i in range(4)]
COUNTER_SPOT = (.8, -.95)
HT = [  # hero schedules (song frames): walk in from p0, turn to the counter, pay, item-get, walk off
    dict(f_in=504, p0=(-3.6, -1.6), arrive=568, coin=(574, 577, 587), up=588, sw=(590, 602), off=611),
    dict(f_in=620, p0=(-1.0, -1.6), arrive=645, coin=(649, 652, 661), up=662, sw=(664, 676), off=682),
    dict(f_in=689, p0=(.45, -1.45), arrive=697, coin=(700, 703, 712), up=713, sw=(715, 727), off=740),
    dict(f_in=772, p0=(-3.2, -1.6), arrive=797, coin=(801, 804, 813), up=814, sw=(816, 828), off=834),
    dict(f_in=917, p0=(-2.6, -1.6), arrive=935, coin=(938, 941, 949), up=950, sw=(952, 962), off=966),
    dict(f_in=968, p0=(-1.6, -1.6), arrive=984, coin=(987, 990, 997), up=998, sw=(1000, 1009), off=1012),
    dict(f_in=1014, p0=(-1.2, -1.6), arrive=1028, coin=(1030, 1033, 1039), up=1040, sw=(1042, 1050), off=1053),
]
for t in HT:
    t["path_in"] = [t["p0"], (.4, -1.6), COUNTER_SPOT]
    t["path_off"] = [COUNTER_SPOT, (1.4, -1.55), (60, -1.55)]
# the queue: from 1000 on, four identical heroes walk in and stand in line down the path (the line reaches past the
# frame on L3 44.26); they stay there to the end of the act
QUEUE = [(952, (-1.4, -1.6)), (966, (-2.9, -1.6)), (980, (-4.4, -1.6)), (994, (-5.9, -1.6))]
QUEUE_FROM = (-8.6, -1.6)

def hero_state(i, f):
    t = HT[i]
    if f < t["f_in"] or f > t["off"] + 160: return None
    neck = (0, 0); shL = (8, 0); shR = (-6, 0); hips = (0, 0); lean = 0
    if f <= t["arrive"]:
        L = plen(t["path_in"]); dist = L * (f - t["f_in"]) / (t["arrive"] - t["f_in"])
        (x, y), yaw = polyline(t["path_in"], dist); s, bob = swing(dist)
        if dist > L - .35: yaw = angle_lerp(0, yaw, (dist - (L - .35)) / .35) if yaw != 0 else yaw
        return dict(pos=(x, y, bob), yaw=yaw, hips=(s, -s), shL=(8, -s * .5), shR=(-6, s * .8), neck=neck)
    yaw = angle_lerp(58, 112, ease(seg(f, t["arrive"], t["arrive"] + 5)))
    pos = (COUNTER_SPOT[0], COUNTER_SPOT[1], 0)
    c0, c1, c2 = t["coin"]
    fw = ease(seg(f, c0 - 4, c0)) * (1 - ease(seg(f, c1 + 2, c1 + 6)))
    shR = (-6, -78 * fw)
    if f >= t["up"]:
        shR = (-4, lerp(shR[1], -172, ease(seg(f, t["up"], t["up"] + 4))))
        neck = (-14 * ease(seg(f, t["sw"][1], t["sw"][1] + 4)), 0)
    if f < t["off"]:
        return dict(pos=pos, yaw=yaw, shL=shL, shR=shR, neck=neck, lean=-3 * ease(seg(f, t["sw"][1], t["sw"][1] + 3)))
    dist = 1.5 * (f - t["off"]) / 24
    (x, y), yawp = polyline(t["path_off"], dist); s, bob = swing(dist)
    yaw = angle_lerp(112, yawp, ease(seg(f, t["off"], t["off"] + 6)))
    return dict(pos=(x, y, bob), yaw=yaw, hips=(s, -s), shL=(8, -s * .5), shR=(-4, -172), neck=(-8, 0), lean=-3)

def queue_state(k, f):
    f_in, spot = QUEUE[k]
    if f < f_in: return None
    L = math.dist(QUEUE_FROM, spot); walk = L / 2.0 * 24
    if f < f_in + walk:
        dist = 2.0 * (f - f_in) / 24; (x, y), yaw = polyline([QUEUE_FROM, spot], dist); s, bob = swing(dist)
        return dict(pos=(x, y, bob), yaw=yaw, hips=(s, -s), shL=(8, -s * .5), shR=(-6, s * .8))
    # standing in line, a small shift of weight on a fixed count (rails)
    w = 4 * math.sin((f - f_in) / 11.0)
    return dict(pos=(spot[0], spot[1], 0), yaw=0, hips=(w, -w), shL=(8, 0), shR=(-6, 0), neck=(0, 6 * math.sin((f - f_in) / 30.0)))

# ---------- the shopkeeper's day ----------
SK_HOME = (-.6, .85)
SELLER = (W.FS[0] - .95, W.FS[1] + .05)
def keeper_state(f):
    st = dict(pos=(SK_HOME[0], SK_HOME[1], .006 * math.sin(f / 9.0)), yaw=-82, lean=0, neck=(0, 0), shL=(9, 0), shR=(-9, 0), hips=(0, 0))
    # head follows whichever hero is in play
    act = None
    for i in range(len(HT)):
        hs = hero_state(i, f)
        if hs and f <= HT[i]["off"] + 40: act = hs
    if act and f < 1078:
        dx, dy = act["pos"][0] - SK_HOME[0], act["pos"][1] - SK_HOME[1]
        st["neck"] = (0, clamp(math.degrees(math.atan2(dy, dx)) - st["yaw"], -55, 55))
    for i in range(len(HT)):
        land = HT[i]["coin"][2]
        if land <= f < land + 8: st["neck"] = (st["neck"][0] + 14 * math.sin(math.pi * (f - land) / 8), st["neck"][1])
    if 552 <= f <= 572:                                           # hero 1: a big wave
        st["shL"] = (lerp(9, 150, ease(seg(f, 552, 556))) + 18 * math.sin((f - 552) / 2.2) * (1 - seg(f, 568, 572)), 0)
        if f > 568: st["shL"] = (lerp(150, 9, ease(seg(f, 568, 572))), 0)
    if 630 <= f <= 644:                                           # hero 2: a smaller one
        u = ease(seg(f, 630, 634)) * (1 - ease(seg(f, 640, 644)))
        st["shL"] = (9 + 95 * u + 10 * math.sin((f - 630) / 2) * u, 0)
    if 689 <= f < 876:                                            # hero 3 on: he doesn't bother
        st["neck"] = (st["neck"][0] + 9, st["neck"][1]); st["lean"] = 3
        st["shL"], st["shR"] = (4, 0), (-4, 0)
    if 876 <= f < 917:                                            # 36.5: the glance across at her, the half wave
        dx, dy = SELLER[0] - SK_HOME[0], SELLER[1] - SK_HOME[1]
        want = clamp(math.degrees(math.atan2(dy, dx)) - st["yaw"], -58, 58)
        u = ease(seg(f, 876, 884)); back = ease(seg(f, 908, 916))
        st["neck"] = (4, want * u * (1 - back)); st["lean"] = 3 * (1 - u) + 3 * back
        raise_ = ease(seg(f, 884, 893)) * (1 - ease(seg(f, 899, 907)))
        st["shL"] = (4 + 76 * raise_, 0); st["shR"] = (-4, 0)
    if 917 <= f < 1078:                                           # the queue: serves without looking up
        st["neck"] = (st["neck"][0] + 6, st["neck"][1] * .6); st["lean"] = 4
        st["shL"], st["shR"] = (4, 0), (-4, 0)
    if f >= 1078:                                                 # 44.9: he turns to the wall and the tag
        u = ease(seg(f, 1078, 1088))
        st["yaw"] = angle_lerp(-82, 70, u); st["lean"] = lerp(4, 2, u); st["neck"] = (12 * u, 0)
        st["pos"] = (lerp(SK_HOME[0], .22, u), lerp(SK_HOME[1], .72, u), 0)
        reach = ease(seg(f, 1086, 1094)) * (1 - ease(seg(f, 1132, 1140)))
        st["shR"] = (-4, -108 * reach); st["shL"] = (4, -20 * reach)
        if f >= 1134:                                             # 47.24: it flips back; he looks at his hands
            v = ease(seg(f, 1140, 1152)); turn = math.sin((f - 1152) / 5.0) * (f >= 1152)
            st["yaw"] = angle_lerp(70, -30, ease(seg(f, 1138, 1150)))
            st["shL"] = (4 + 30 * turn, -92 * v); st["shR"] = (-4 - 30 * turn, -92 * v)
            st["neck"] = (lerp(12, 36, v), 0); st["lean"] = 2 + 6 * v
    return st

for f in range(F0, F1 + 1):
    pose(SK, f, **keeper_state(f))
    for i, h in enumerate(W.heroes):
        hs = hero_state(i, f)
        for j in range(3, len(HT)):                               # the three models take the later sales in turn
            if HT[j]["f_in"] <= f and (j - 3) % 3 == i and (hs is None or f > HT[i]["off"] + 160): hs = hero_state(j, f)
        if hs and (hs["pos"][0] < 14): pose(h, f, **hs)
        else: pose(h, f, W.PARK, 0)
    for k in range(4):
        qs = queue_state(k, f)
        if qs: pose(HEROES[3 + k], f, **qs)
        else: pose(HEROES[3 + k], f, W.PARK, 0)

# she waves on cue while he looks across (the loop keys her every frame; this re-keys those frames)
W.seller_wave(884, 907)

# ---------- faces: scripted -> polite 27.56 -> flat 28.7 -> doubt + highlight 36.5 -> flat 38.2 -> doubt 47.5 ----------
W.face_default(F, F0, "scripted")
def face(f, name, hl=None):
    for n, g in F.items():
        if n == "hl": continue
        vis(g, f, n == name)
    if hl is not None: vis(F["hl"], f, hl)
face(sec(27.56), "polite"); face(689, "flat"); face(876, "doubt", hl=True); face(917, "flat"); face(1140, "doubt")

# ---------- props that fly: read the hands' world positions from the evaluated scene ----------
def hero_for(j): return W.heroes[j] if j < 3 else W.heroes[(j - 3) % 3]
COIN_SPOT = Vector((-.15, .02, 1.10 + .025))
coins = []
for j, t in enumerate(HT):
    h = hero_for(j)
    c = RW.box(f"coin{j}", (.15, .15, .05), (0, 0, -50), W.M["gold"]); coins.append(c)
    c0, c1, c2 = t["coin"]
    start = W.world_at(h["tipR"], c1)
    end = COIN_SPOT + Vector((.02 * (j % 4), -.01 * (j % 4), .05 * (j % 4)))
    vis(c, F0, False); vis(c, c0, True)
    for f in range(c0, c2 + 1):
        if f <= c1: p = W.world_at(h["tipR"], f); rot = (0, 0, 0)
        else:
            u = seg(f, c1, c2); p = start.lerp(end, u) + Vector((0, 0, .55 * math.sin(math.pi * u)))
            rot = (R(360 * u), 0, R(540 * u))
        key(c, f, loc=tuple(p), rot=rot)
    key(c, c2 + 1, loc=tuple(end), rot=(0, 0, R(15 * j)))

# the bought sword flies off the wall into the raised hand; a new one pops onto the wall at once (with the tag)
sparks = [RW.box(f"spark{k}", (.06, .06, .06), (0, 0, -50), W.M["spark"]) for k in range(8)]
for s_ in sparks: vis(s_, F0, False)
key(W.wallSword, F0, loc=tuple(W.WALL_SWORD), scale=(1, 1, 1))
for j, t in enumerate(HT):
    h = hero_for(j); a, b = t["sw"]
    vis(h["sword"], a - 1, False); vis(h["sword"], b, True); vis(h["sword"], t["off"] + 161, False)
    end = W.world_at(h["sword"], b)
    vis(W.flySword, a, True); vis(W.wallSword, a, False); key(W.wallSword, a, scale=(1, 1, 1))
    for f in range(a, b):
        u = ease(seg(f, a, b))
        p = W.WALL_SWORD.lerp(end, u) + Vector((0, 0, .7 * math.sin(math.pi * u)))
        key(W.flySword, f, loc=tuple(p), rot=(0, 0, R(360 * u)))
    vis(W.flySword, b, False); key(W.flySword, b, loc=(0, 0, -50))
    vis(W.wallSword, b + 1, True)                                  # respawn
    for k, sc in ((b, .2), (b + 1, .3), (b + 2, 1.3), (b + 3, 1.1), (b + 4, 1.0)):
        key(W.wallSword, k, scale=(sc, sc, sc))
    ctr = W.WALL_SWORD + Vector((0, -.06, .35))
    for k, s_ in enumerate(sparks):
        ang = 2 * math.pi * k / len(sparks)
        vis(s_, b + 1, True); vis(s_, b + 8, False)
        for f in range(b + 1, b + 9):
            r = .15 + .55 * seg(f, b + 1, b + 8)
            key(s_, f, loc=tuple(ctr + Vector((r * math.cos(ang), -.02, r * math.sin(ang)))), scale=[1 - .7 * seg(f, b + 1, b + 8)] * 3)

# the price tag: he turns it over on 1094, his charcoal number shows on the back, it flips itself back on 47.24 (1134)
tag = W.tag
number = RW.blocks("tag_number", [((.012, .03, .05), (-.112, -.03, -.2)), ((.012, .03, .05), (-.112, .03, -.2))], W.M["charcoal"], tag)
vis(number, F0, False); vis(number, 1100, True); vis(number, 1136, False)
for f in range(F0, F1 + 1):
    flip = ease(seg(f, 1094, 1100)) * (1 - ease(seg(f, 1134, 1138)))
    key(tag, f, rot=(0, 0, R(180 * flip)))

# ---------- light: fixed noon, the whole act ----------
W.light(F0, "noon")

# ---------- shots (cut on the line onsets); s1, s2a, s2b are take 07's ----------
shot = W.shot
shot("s1", 504, 619, (-2.1, -7.4, 2.25), (-1.6, -6.4, 2.05), (.15, 0, 1.3), (.2, 0, 1.3), 35)
shot("s2a", 620, 688, (-3.3, -6.4, 2.3), (-2.9, -5.8, 2.15), (.1, 0, 1.35), (.15, 0, 1.35), 35)
shot("s2b", 689, 768, (.1, -3.5, 1.95), (0, -3.15, 1.93), (-.2, .85, 1.62), (-.22, .85, 1.64), 50)
shot("s3", 769, 875, (-2.4, -7.2, 2.2), (-1.9, -6.6, 2.1), (.1, 0, 1.3), (.15, 0, 1.3), 35)          # hero 3's sale, the bird again
shot("s4a", 876, 891, (-3.4, -2.6, 1.62), (-3.2, -2.5, 1.6), (-.6, .85, 1.55), (-.6, .85, 1.55), 60)   # close: he turns to look at her
shot("s4b", 892, 916, (-2.7, 1.7, 1.95), (-2.6, 1.6, 1.9), (-5.3, -3.4, 1.0), (-5.4, -3.5, 1.0), 40)     # over his shoulder: she waves
shot("s5", 917, 1061, (3.4, -2.6, 1.25), (2.9, -2.9, 1.2), (-3.0, -1.6, 1.0), (-3.4, -1.6, 1.0), 35)   # the queue builds down the path
shot("s6", 1062, 1077, (-2.1, -7.4, 2.25), (-2.0, -7.3, 2.25), (.15, 0, 1.3), (.15, 0, 1.3), 35)      # L3: the line reaches past the frame
shot("s7", 1078, 1140, (2.0, .25, 1.5), (1.95, .3, 1.48), (.7, 1.235, 1.0), (.7, 1.235, 1.0), 50)        # the tag
shot("s8", 1141, 1183, (1.7, -1.7, 1.5), (1.6, -1.6, 1.45), (.2, .72, 1.2), (.2, .72, 1.15), 45)   # his hands; hold on him

pixel_groups([(F0, 6)], [])
W.finish_steps()
print("ACT1 shots:", W.SHOTS)
run(OUT)
