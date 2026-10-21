# Respawn act 2: refrain 1, the first try (song 49.3-68.9 s, frames 1183-1654). STORYBOARD-respawn.md, act 2.
# 49.3: game night snaps on in one frame; every NPC freezes where it stands; the prompt "Continue?" [Yes] appears over
# his head, presses itself, closes. 51-63.8 (the held voice): he alone moves. He walks out from behind the counter and
# down the east road past the frozen guard, out of frame right, and walks straight back in from the left of the same
# locked frame; he tries again running, the same; he stops in the square among the frozen people, `fear`, the flower
# seller still holding her wave. 63.77: morning snaps back, he respawns behind the counter with the `scripted` face put
# back on (the highlight still in his eyes), the hero walks up on 64.62, the sale goes through on 66.21 and his hand,
# giving the sword, is the only slow thing in the frame. Hold on the stall with the hero walking off.
#
#   tools/render_lock.sh blender -b --factory-startup --python respawn_act2.py -- --stills 1183,1200,1250,1300,1391,1420,1460,1485,1510,1530,1575,1595,1640
#   tools/render_lock.sh blender -b --factory-startup --python respawn_act2.py -- --render
# Frames land in out/film/respawn/act2/frames/ (named by song frame). Structure follows respawn_act1.py: build the
# world, key the village loops, key the cast per frame from pure functions of the frame, swap faces with vis(), cut
# shots on the line onsets (L4: 56.77 57.91 63.77 64.62 65.00 66.21 66.72 67.12 67.94), pixel groups, finish_steps, run.
import bpy, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
sys.path.insert(0, HERE)
import respawn_world as RW
from respawn_world import R, ease, seg, lerp, clamp, swing, polyline, plen, angle_lerp
from film_kit import pixel_groups, sec, key, run
from canvas_kit import hex_lin

F0, F1 = 1183, 1654
OUT = os.path.join(HERE, "out", "film", "respawn", "act2")
W = RW.build(F0, F1, OUT)
vis, pose = W.vis, W.pose
SK, F = W.keeper, W.keeper["F"]

NIGHT, MORNING = 1183, 1530                                        # 49.3 and 63.77: the two one-frame switches
PROMPT_ON, PRESS, PROMPT_OFF = 1186, 1200, 1212

# ---------- fcurve helpers: hold a frozen pose across the night (keys only hold when nothing follows them) ----------
def fcurves_of(idb):
    ad = idb.animation_data
    if not (ad and ad.action): return []
    act = ad.action; fcs = []
    for layer in getattr(act, "layers", []):
        for strip in layer.strips:
            for cb in strip.channelbags: fcs += list(cb.fcurves)
    if not fcs and hasattr(act, "fcurves"): fcs = list(act.fcurves)
    return fcs

def hold(obs, f_from, f_to):
    """re-key every animated channel of `obs` at f_to with its value at f_from, so the pose holds between them"""
    for ob in obs:
        for fc in fcurves_of(ob):
            if fc.data_path.startswith("hide"): continue
            fc.keyframe_points.insert(f_to, fc.evaluate(f_from))

def rig_obs(d): return [d[k] for k in ("root", "neck", "shL", "shR", "hipL", "hipR")]

# ---------- the village: every loop keyed on the night frame only, held frozen to 1529, running again from 1530 ----------
W.village_loops(NIGHT, NIGHT, keeper_home=False)
# the frozen flower seller holds her wave at its top (the same count every time; this time it never comes down)
pose(W.seller, NIGHT, (W.FS[0] - .95, W.FS[1] + .05, 0), 35, lean=2, neck=(4, 0), shL=(144, 0), shR=(0, -62))
FROZEN = rig_obs(W.guard) + rig_obs(W.seller) + rig_obs(W.fisher) + rig_obs(W.mayor) + [W.fish, W.rodFloat, W.bird]
hold(FROZEN, NIGHT, MORNING - 1)
W.village_loops(MORNING, F1, keeper_home=False)

# ---------- the queue heroes: four identical heroes in line (act 1's spots), frozen all night, gone at the reset ----------
QUEUE = [(952, (-1.4, -1.6)), (966, (-2.9, -1.6)), (980, (-4.4, -1.6)), (994, (-5.9, -1.6))]
HEROQ = [W.make_hero(f"heroq{i}", "#c8341e") for i in range(4)]
def queue_state(k, f):                                             # act 1's standing-in-line pose at frame f
    f_in, spot = QUEUE[k]
    w = 4 * math.sin((f - f_in) / 11.0)
    return dict(pos=(spot[0], spot[1], 0), yaw=0, hips=(w, -w), shL=(8, 0), shR=(-6, 0), neck=(0, 6 * math.sin((f - f_in) / 30.0)))
for k, h in enumerate(HEROQ):
    qs = queue_state(k, NIGHT)
    pose(h, NIGHT, **qs); pose(h, MORNING - 1, **qs); pose(h, MORNING, W.PARK, 0)

# ---------- the hero of the morning: walk in, pay, the sword flies to him (slowly), walk off ----------
COUNTER_SPOT = (.8, -.95)
HT = [dict(f_in=1531, p0=(-1.2, -1.6), arrive=1551, coin=(1554, 1557, 1566), up=1567, sw=(1569, 1589), off=1600)]
for t in HT:
    t["path_in"] = [t["p0"], (.4, -1.6), COUNTER_SPOT]
    t["path_off"] = [COUNTER_SPOT, (1.4, -1.55), (60, -1.55)]

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

# ---------- the shopkeeper's night: the only thing that moves ----------
SK_HOME = (-.6, .85)
P_OUT = [(.22, .72), (1.78, .68), (2.0, -1.6), (9.0, -1.6)]       # round the counter's east end, onto the path, east
XL, XR = 24.8, 33.3                                                 # the locked east-road frame: out one edge, in the other
V1 = (XR - XL) / 107.0                                              # the walk across, 1284-1391 (about 2 m/s)
X_STOP = XL + 30 * V1                                               # where he stops after the first wrap (about x 27)
V2 = (XR - X_STOP) / 36.0                                           # the run, 1440-1476 (about 4 m/s)
SQ_IN, SQ_STOP = (-.75, -2.7), (-2.4, -3.0)                         # the square: he jogs in and skids to a stop

def walk_pose(dist, w=1.0, run=False):
    """hips and arms from the distance walked; w fades the swing (stopping); run = bigger stride and amplitude"""
    s, bob = swing(dist, stride=2.0 if run else 1.4, amp=48 if run else 30)
    s *= w; bob *= w * (1.8 if run else 1.0)
    arm = .95 if run else .6
    return dict(hips=(s, -s), shL=(lerp(9, 14, w * run), -s * arm), shR=(lerp(-9, -14, w * run), s * arm), bob=bob)

def keeper_state(f):
    st = dict(pos=(.22, .72, 0), yaw=-30, lean=8, neck=(36, 0), shL=(4, -92), shR=(-4, -92), hips=(0, 0))
    if f < 1226:                                                   # S1: his hands, the prompt over his head, then he looks up
        turn = math.sin((f - 1152) / 5.0) * (1 - ease(seg(f, PROMPT_ON, PROMPT_ON + 8)))
        up = ease(seg(f, 1210, 1222)); drop = ease(seg(f, 1222, 1230))
        st["shL"] = (lerp(4 + 30 * turn, 9, drop), lerp(-92, 0, drop)); st["shR"] = (lerp(-4 - 30 * turn, -9, drop), lerp(-92, 0, drop))
        st["neck"] = (lerp(36, -6, up), 30 * ease(seg(f, 1212, 1220)) - 50 * ease(seg(f, 1220, 1230)))
        st["lean"] = lerp(8, 0, up)
        return st
    if f < 1284:                                                   # S2: he walks out from behind the counter, onto the path, east
        dist = 1.75 / 24 * (f - 1226)
        (x, y), hd = polyline(P_OUT, dist); w = ease(seg(f, 1226, 1234)); wp = walk_pose(dist, w)
        drop = ease(seg(f, 1222, 1230))
        return dict(pos=(x, y, wp["bob"]), yaw=angle_lerp(-30, hd, ease(seg(f, 1226, 1236))), lean=0,
                    neck=(lerp(-6, 0, w), lerp(-20, 0, w)), hips=wp["hips"],
                    shL=(lerp(lerp(4, 9, drop), wp["shL"][0], w), lerp(lerp(-92, 0, drop), wp["shL"][1], w)),
                    shR=(lerp(lerp(-4, -9, drop), wp["shR"][0], w), lerp(lerp(-92, 0, drop), wp["shR"][1], w)))
    if f < 1493:                                                   # S3: the locked wide on the east road
        if f < 1391:                                               # the walk across, out of frame right
            d = V1 * (f - 1284); x = XL + d; wp = walk_pose(d)
            return dict(pos=(x, -1.6, wp["bob"]), yaw=0, lean=1, neck=(0, 0), **{k: wp[k] for k in ("hips", "shL", "shR")})
        if f < 1426:                                               # 57.91: in from the left, the same stride; he slows and stops
            u = seg(f, 1416, 1426); d = V1 * (f - 1391) if f < 1416 else V1 * 25 + V1 * 10 * (u - u * u / 2)
            wp = walk_pose(V1 * (1391 - 1284) + d, 1 - u)
            return dict(pos=(XL + d, -1.6, wp["bob"]), yaw=0, lean=1 - u, neck=(0, 0), **{k: wp[k] for k in ("hips", "shL", "shR")})
        if f < 1440:                                               # he stands, turns, looks both ways: the guard again, the same house
            yaw = angle_lerp(0, -90, ease(seg(f, 1426, 1431))); yaw = angle_lerp(yaw, 0, ease(seg(f, 1435, 1440)))
            ny = -50 * math.sin(math.pi * seg(f, 1427, 1433)) + 50 * math.sin(math.pi * seg(f, 1432, 1438))
            return dict(pos=(X_STOP, -1.6, 0), yaw=yaw, lean=0, neck=(-4, ny), hips=(0, 0), shL=(9, 0), shR=(-9, 0))
        if f < 1476:                                               # he runs at it
            n = f - 1440; d = V2 * n * n / 12 if n <= 6 else V2 * (n - 3)
            wp = walk_pose(d, 1.0, run=True); ramp = ease(seg(f, 1440, 1446))
            return dict(pos=(X_STOP + d, -1.6, wp["bob"] * ramp), yaw=0, lean=12 * ramp, neck=(-6 * ramp, 0),
                        hips=(wp["hips"][0] * ramp, wp["hips"][1] * ramp), shL=(wp["shL"][0], wp["shL"][1] * ramp), shR=(wp["shR"][0], wp["shR"][1] * ramp))
        # in from the left again, running; he brakes and stands, `fear`
        u = seg(f, 1483, 1492); d = V2 * (f - 1476) if f < 1483 else V2 * 7 + V2 * 9 * (u - u * u / 2)
        wp = walk_pose(V2 * 36 + d, 1 - u, run=True)
        return dict(pos=(XL + d, -1.6, wp["bob"]), yaw=angle_lerp(0, -40, ease(seg(f, 1486, 1492))), lean=12 * (1 - u), neck=(-6 * (1 - u), 0),
                    **{k: wp[k] for k in ("hips", "shL", "shR")})
    if f < MORNING:                                                # S4: the square, the frozen people around him
        u = seg(f, 1493, 1515); d = .15 * 22 * (u - u * u / 2)
        L = math.dist(SQ_IN, SQ_STOP); (x, y), hd = polyline([SQ_IN, SQ_STOP], d); wp = walk_pose(d, 1 - u, run=True)
        yaw = angle_lerp(hd, -118, ease(seg(f, 1515, 1524)))
        raise_ = ease(seg(f, 1516, 1528))
        ny = -30 * math.sin(math.pi * seg(f, 1512, 1522)) + 24 * math.sin(math.pi * seg(f, 1521, 1529))
        return dict(pos=(x, y, wp["bob"]), yaw=yaw, lean=lerp(10 * (1 - u), -3, raise_), neck=(-4 * (1 - u), ny), hips=wp["hips"],
                    shL=(lerp(wp["shL"][0], 6, raise_), lerp(wp["shL"][1], -48, raise_)), shR=(lerp(wp["shR"][0], -6, raise_), lerp(wp["shR"][1], -48, raise_)))
    # 63.77 on: respawned behind the counter, the mask on; the sale, with the one slow hand
    st = dict(pos=(SK_HOME[0], SK_HOME[1], .006 * math.sin(f / 9.0)), yaw=-82, lean=0, neck=(0, 0), shL=(9, 0), shR=(-9, 0), hips=(0, 0))
    hs = hero_state(0, f)
    if hs and f <= HT[0]["off"] + 40:
        dx, dy = hs["pos"][0] - SK_HOME[0], hs["pos"][1] - SK_HOME[1]
        st["neck"] = (0, clamp(math.degrees(math.atan2(dy, dx)) - st["yaw"], -55, 55))
    land = HT[0]["coin"][2]
    if land <= f < land + 8: st["neck"] = (st["neck"][0] + 14 * math.sin(math.pi * (f - land) / 8), st["neck"][1])
    if f >= 1556:
        u = ease(seg(f, 1556, 1567))                               # he turns to the wall, slowly
        fly = ease(seg(f, 1569, 1589))                             # the hand follows the sword out, slowly
        back = ease(seg(f, 1589, 1606))                            # once it has landed he turns back to the hero
        yaw = angle_lerp(-82, 62, u); yaw = angle_lerp(yaw, -82, back)
        px = lerp(SK_HOME[0], .2, u); px = lerp(px, SK_HOME[0], back)
        py = lerp(SK_HOME[1], .75, u); py = lerp(py, SK_HOME[1], back)
        reach = ease(seg(f, 1558, 1569)); give = ease(seg(f, 1589, 1613))
        arm = lerp(0, -120, reach); arm = lerp(arm, -78, fly); arm = lerp(arm, 0, give)
        st["pos"] = (px, py, st["pos"][2]); st["yaw"] = yaw; st["shR"] = (-4, arm); st["shL"] = (6, -14 * reach * (1 - give))
        st["neck"] = (lerp(st["neck"][0], 8 + 6 * fly, u * (1 - back)), lerp(st["neck"][1], 0, u * (1 - back)))
        st["lean"] = 3 * u * (1 - give)
    return st

for f in range(F0, F1 + 1):
    pose(SK, f, **keeper_state(f))
    hs = hero_state(0, f)
    if hs and hs["pos"][0] < 14: pose(W.heroes[0], f, **hs)
    else: pose(W.heroes[0], f, W.PARK, 0)

# his respawn at 63.77: the pop the sword gets (2-frame scale-in), one ring of sparks round him
key(SK["root"], MORNING - 1, scale=(1, 1, 1))
for k, sc in ((MORNING, .25), (MORNING + 1, .4), (MORNING + 2, 1.25), (MORNING + 3, 1.08), (MORNING + 4, 1.0)):
    key(SK["root"], k, scale=(sc, sc, sc))

# ---------- faces: doubt + highlight (on for the rest of the film) -> wonder -> doubt -> wonder -> doubt -> fear -> scripted ----------
W.face_default(F, F0, "doubt", hl=True)
def face(f, name, hl=None):
    for n, g in F.items():
        if n == "hl": continue
        vis(g, f, n == name)
    if hl is not None: vis(F["hl"], f, hl)
face(1212, "wonder"); face(1228, "doubt"); face(1426, "wonder"); face(1440, "doubt"); face(1483, "fear"); face(MORNING, "scripted")

# ---------- the prompt: "Continue?" [Yes] over his head; it presses itself; it closes ----------
prompt = W.prompt; button = bpy.data.objects["CL_prompt_button"]
PROMPT_AT = (.42, .55, 2.2)
CAM1 = (2.9, -1.15, 1.7)
prompt_yaw = math.atan2(CAM1[1] - PROMPT_AT[1], CAM1[0] - PROMPT_AT[0])  # its +x face (the text side) toward the camera
vis(prompt, F0, False); vis(prompt, PROMPT_ON, True); vis(prompt, PROMPT_OFF, False)
key(prompt, PROMPT_ON, loc=PROMPT_AT, rot=(0, 0, prompt_yaw), scale=(.3, .3, .3))
key(prompt, PROMPT_ON + 1, scale=(1.12, 1.12, 1.12)); key(prompt, PROMPT_ON + 2, scale=(1, 1, 1))
key(prompt, PROMPT_OFF - 1, loc=PROMPT_AT, rot=(0, 0, prompt_yaw), scale=(1, 1, 1))
key(prompt, PROMPT_OFF, loc=(0, 0, -60), scale=(.3, .3, .3))
key(button, PRESS - 1, scale=(1, 1, 1)); key(button, PRESS, scale=(.85, .85, .85))
key(button, PRESS + 2, scale=(.85, .85, .85)); key(button, PRESS + 3, scale=(1, 1, 1))

# ---------- props that fly: coins, the wall sword (a 20-frame flight this time), the respawn pop with sparks ----------
h = W.heroes[0]
COIN_SPOT = Vector((-.15, .02, 1.10 + .025))
for j, t in enumerate(HT):
    c = RW.box(f"coin{j}", (.15, .15, .05), (0, 0, -50), W.M["gold"])
    c0, c1, c2 = t["coin"]
    start = W.world_at(h["tipR"], c1); end = COIN_SPOT
    vis(c, F0, False); vis(c, c0, True)
    for f in range(c0, c2 + 1):
        if f <= c1: p = W.world_at(h["tipR"], f); rot = (0, 0, 0)
        else:
            u = seg(f, c1, c2); p = start.lerp(end, u) + Vector((0, 0, .55 * math.sin(math.pi * u)))
            rot = (R(360 * u), 0, R(540 * u))
        key(c, f, loc=tuple(p), rot=rot)
    key(c, c2 + 1, loc=tuple(end), rot=(0, 0, R(15 * j)))

sparks = [RW.box(f"spark{k}", (.06, .06, .06), (0, 0, -50), W.M["spark"]) for k in range(8)]
for s_ in sparks: vis(s_, F0, False)
key(W.wallSword, F0, loc=tuple(W.WALL_SWORD), scale=(1, 1, 1))
for j, t in enumerate(HT):
    a, b = t["sw"]
    vis(h["sword"], a - 1, False); vis(h["sword"], b, True); vis(h["sword"], t["off"] + 161, False)
    end = W.world_at(h["sword"], b)
    vis(W.flySword, a, True); vis(W.wallSword, a, False); key(W.wallSword, a, scale=(1, 1, 1))
    for f in range(a, b):
        u = ease(seg(f, a, b))
        p = W.WALL_SWORD.lerp(end, u) + Vector((0, 0, .3 * math.sin(math.pi * u)))   # a gentler lob than act 1's: it is handed
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

# the keeper's own respawn ring, round his chest, the same sparks
ksparks = [RW.box(f"kspark{k}", (.07, .07, .07), (0, 0, -50), W.M["spark"]) for k in range(8)]
kc = Vector((SK_HOME[0], SK_HOME[1] - .3, 1.25))
for k, s_ in enumerate(ksparks):
    ang = 2 * math.pi * k / len(ksparks)
    vis(s_, F0, False); vis(s_, MORNING + 1, True); vis(s_, MORNING + 9, False)
    for f in range(MORNING + 1, MORNING + 10):
        r = .3 + .75 * seg(f, MORNING + 1, MORNING + 9)
        key(s_, f, loc=tuple(kc + Vector((r * math.cos(ang), 0, r * math.sin(ang)))), scale=[1 - .7 * seg(f, MORNING + 1, MORNING + 9)] * 3)

# ---------- light: night in one frame on 49.3, noon back in one frame on 63.77 ----------
W.light(NIGHT, "night"); W.light(MORNING, "noon")
# the world's night preset (sun .5, world #101a3a) renders near black; this act keys a moonlit night over it (same frame)
W.sun.energy, W.sun.color = 1.5, hex_lin("#9fb0e0")
W.sun.keyframe_insert("energy", frame=NIGHT); W.sun.keyframe_insert("color", frame=NIGHT)
W.bg.inputs["Color"].default_value = (*hex_lin("#34467a"), 1); W.bg.inputs["Strength"].default_value = 1.6
W.bg.inputs["Color"].keyframe_insert("default_value", frame=NIGHT); W.bg.inputs["Strength"].keyframe_insert("default_value", frame=NIGHT)
# the painted sky and its clouds are emissive cards, so the night switch dims them too (same two frames, stepped)
def key_emission(matname, f, val):
    m = bpy.data.materials[matname]
    for n in m.node_tree.nodes:
        if n.type == "EMISSION": s_ = n.inputs["Strength"]
        elif n.type == "BSDF_PRINCIPLED": s_ = n.inputs["Emission Strength"]
        else: continue
        s_.default_value = val; s_.keyframe_insert("default_value", frame=f)
SKY_DIM = {"CL_skyDay": (1.0, .28), "CL_cloudv": (.9, .22), "CL_cloudv2": (.9, .22)}
for nm, (day, night) in SKY_DIM.items():
    key_emission(nm, F0, night); key_emission(nm, MORNING, day)
    for fc in fcurves_of(bpy.data.materials[nm].node_tree):
        for kp in fc.keyframe_points: kp.interpolation = "CONSTANT"

# ---------- shots ----------
shot = W.shot
shot("s1", 1183, 1221, CAM1, (2.8, -1.2, 1.72), (.35, .55, 1.55), (.35, .55, 1.52), 35)                  # his hands; the prompt over his head
shot("s2", 1222, 1283, (-.6, -7.6, 2.2), (.5, -7.3, 2.1), (.9, -.2, 1.25), (2.3, -1.0, 1.1), 35)     # he walks out of the stall, past the frozen queue
shot("s3", 1284, 1492, (29.0, -7.4, 2.1), (29.0, -7.4, 2.1), (29.0, -1.3, 1.05), (29.0, -1.3, 1.05), 35)  # locked: the east road, the frozen guard
shot("s4", 1493, 1529, (0.0, -8.6, 1.9), (-.3, -8.0, 1.85), (-3.6, -2.8, 1.1), (-3.4, -2.9, 1.1), 26)  # the square, the frozen people, `fear`
shot("s5", 1530, 1550, (-2.1, -7.4, 2.25), (-2.0, -7.3, 2.25), (.15, 0, 1.3), (.15, 0, 1.3), 35)       # 63.77: morning; he is back; the hero walks up
shot("s6", 1551, 1559, (.1, -3.5, 1.95), (0, -3.15, 1.93), (-.2, .85, 1.62), (-.22, .85, 1.64), 50)   # 64.62: the mask, the highlight under it
shot("s7", 1560, 1588, (2.5, -.6, 1.9), (2.4, -.65, 1.88), (.6, .6, 1.5), (.55, .55, 1.5), 30)         # 65.00: the wall, the slow hand, the sword leaves
shot("s8", 1589, 1610, (-3.3, -6.4, 2.3), (-2.9, -5.8, 2.15), (.1, 0, 1.35), (.15, 0, 1.35), 35)       # 66.21: the sale goes through
shot("s9", 1611, 1630, (-1.9, -2.6, 1.6), (-1.8, -2.5, 1.58), (-.4, .5, 1.15), (-.35, .5, 1.15), 45)   # 67.12: his hand comes back down, the coins; the hero goes
shot("s10", 1631, 1654, (-2.1, -7.4, 2.25), (-2.1, -7.4, 2.25), (.15, 0, 1.3), (.15, 0, 1.3), 35)      # 67.94: the wide; the hero walks off east

pixel_groups([(F0, 6)], [])
W.finish_steps()
print("ACT2 shots:", W.SHOTS)
run(OUT)
