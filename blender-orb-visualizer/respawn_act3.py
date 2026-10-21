# Respawn act 3: the break, testing the walls (song 68.9-81.5 s, frames 1654-1956). STORYBOARD-respawn.md, act 3.
# Harmonica solo, no words: cuts land where the lead line phrases. 68.9 he walks the last metres to the painted sky
# and knocks three times, dust falls off the paint; 71.0 he looks behind a house: a front, two props and nothing
# behind it, and over its top the Mayor's balcony from behind, a man-shaped board on a plank; 73.5 the pond: he leans
# over the fishless water from the dock's end, sits down and touches it, three square rings go out, his reflection is
# the only sharp thing in the village (doubt, then wonder on the peak at 75.0); 76.0 he walks to the flower stand and
# picks the flower; a new one grows back in two frames and she waters it (grief); 79.0 a pan across the smiling
# village, he pulls his apron off over his head and walks back into the stall holding it.
#
#   tools/render_lock.sh blender -b --factory-startup --python respawn_act3.py -- --stills 1660,1690,1720,1750,1770,1795
#   tools/render_lock.sh blender -b --factory-startup --python respawn_act3.py -- --render
# Frames land in out/film/respawn/act3/frames/ (named by song frame). Structure follows respawn_act1.py.
import bpy, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
sys.path.insert(0, HERE)
import respawn_world as RW
from respawn_world import R, ease, seg, lerp, clamp, swing, polyline, plen, angle_lerp
from film_kit import pixel_groups, sec, key, run

F0, F1 = 1654, 1956
OUT = os.path.join(HERE, "out", "film", "respawn", "act3")
W = RW.build(F0, F1, OUT)
vis, pose = W.vis, W.pose
K, F = W.keeper, W.keeper["F"]
PC, FS, M = W.PC, W.FS, W.M

# ---------- the village runs its loops under everything ----------
W.village_loops(F0, F1, keeper_home=False)
W.light(F0, "noon")

# ---------- cut points (song seconds -> frames) ----------
C_WALL, C_FACADE, C_BOARD, C_POND, C_STAND, C_CLOSE, C_PAN, C_APRON, C_STALL = 1654, 1704, 1736, 1764, 1824, 1878, 1896, 1914, 1930
KNOCKS = (1683, 1690, 1697)                                   # three knocks on the painted sky
TOUCH = 1790                                                  # his hand meets the water
PICK = 1870                                                   # the flower leaves the pot
APRON_OFF = 1930                                              # the apron is off his body

# ---------- the shopkeeper: every frame a pure function of f ----------
WALL_Y = 39.32                                                # standing here, his hand reaches the sky wall at y = 40
WALL_PATH = [(-8.0, 38.1), (-8.0, WALL_Y)]
KX, KY = PC[0] - 2.35, PC[1] + .4                             # the pond still's spot: the dock's end
STAND_PATH = [(-2.5, -4.35), (-4.7, -3.92)]
STALL_PATH = [(-1.5, .95), (0.0, .6)]

def pulse(f, k, up=2, hold=1, down=3):
    return ease(seg(f, k - up, k)) * (1 - ease(seg(f, k + hold, k + hold + down)))

def keeper_state(f):
    st = dict(pos=(0, 0, 0), yaw=0, lean=0, neck=(0, 0), shL=(9, 0), shR=(-9, 0), hips=(0, 0))
    if f < C_FACADE:                                          # 68.9: the last metres to the sky, then three knocks
        L = plen(WALL_PATH); dist = min(1.5 * (f - C_WALL) / 24, L)
        (x, y), _ = polyline(WALL_PATH, dist); s, bob = swing(dist)
        settle = 1 - ease(seg(f, 1670, 1676)); s *= settle; bob *= settle
        raise_ = ease(seg(f, 1674, 1680))
        knock = sum(pulse(f, k) for k in KNOCKS)
        st["pos"] = (x, y, bob); st["yaw"] = 90; st["hips"] = (s, -s)
        st["shL"] = (9, -s * .6 * (1 - raise_) - 6 * raise_)
        st["shR"] = (lerp(-9, -4, raise_), lerp(s * .6, -78, raise_) - 14 * knock)
        st["neck"] = (lerp(-18, -4, raise_), 0); st["lean"] = 2 * raise_ + 3 * knock
        return st
    if f < C_POND:                                            # 71.0: behind the house, looking at the props
        u = ease(seg(f, C_FACADE, C_POND))
        st["pos"] = (lerp(1.8, 1.6, u), lerp(7.9, 8.1, u), 0); st["yaw"] = lerp(-4, -16, u)
        st["lean"] = 8; st["neck"] = (lerp(-6, 14, ease(seg(f, 1710, 1740))), 10 * math.sin((f - C_FACADE) / 12.0))
        st["shL"] = (6, -4); st["shR"] = (-6, -10)
        return st
    if f < C_STAND:                                           # 73.5: the pond. The still's lean, then he sits and touches
        d = ease(seg(f, 1781, 1791))                           # 0 = the pond still's pose, 1 = seated on the dock's end, bent to the water
        lean = lerp(26, 58, d)
        st["pos"] = (lerp(KX, KX - .55, d), KY, lerp(.12, -.11, d)); st["yaw"] = 0; st["lean"] = lean
        st["hips"] = (-(90 - lean) * d, -(90 - lean) * d)         # legs level over the water once he sits
        dab = 5 * math.sin(2 * math.pi * seg(f, TOUCH + 2, TOUCH + 12)) * (f >= TOUCH)
        lift = ease(seg(f, 1806, 1814))
        shr = lerp(-40, 28, d) + dab
        st["shR"] = (0, lerp(shr, -4, lift)); st["shL"] = (0, lerp(-44, -20, d))
        st["neck"] = (lerp(22, 20, d) + 8 * ease(seg(f, 1800, 1812)), 0)
        return st
    if f < C_APRON:                                           # 76.0: the flower stand: walk in, reach, pick, look at it
        L = plen(STAND_PATH); dist = min(1.6 * (f - C_STAND) / 24, L)
        (x, y), hd = polyline(STAND_PATH, dist); s, bob = swing(dist)
        settle = 1 - ease(seg(f, 1854, 1860)); s *= settle; bob *= settle
        turn = ease(seg(f, 1858, 1866))
        reach = ease(seg(f, 1860, PICK)); lift = ease(seg(f, PICK + 2, PICK + 12))
        st["pos"] = (x, y, bob); st["yaw"] = angle_lerp(hd, -160, turn); st["hips"] = (s, -s)
        st["lean"] = lerp(8 * reach, 4, lift)
        st["shL"] = (9, -s * .6 * settle); st["shR"] = (lerp(-9, 0, reach), lerp(s * .6 * settle, -92 * reach, reach))
        if f >= PICK + 2:
            st["shR"] = (lerp(0, 25, lift), lerp(-92, -58, lift)); st["neck"] = (32 * lift, 0)
        if f >= C_PAN:                                        # 79.0: he looks up from the flower at the village
            v = ease(seg(f, C_PAN, C_PAN + 10))
            st["neck"] = (lerp(32, 4, v), 40 * v + 25 * math.sin((f - C_PAN) / 7.0) * v)
        return st
    if f < C_STALL:                                           # 79.75: the apron over his head
        up = ease(seg(f, C_APRON, C_APRON + 9)); tug = 6 * math.sin((f - C_APRON - 9) / 1.5) * (f > C_APRON + 9)
        st["pos"] = (STAND_PATH[-1][0], STAND_PATH[-1][1], 0); st["yaw"] = -160; st["lean"] = -4 * up
        st["shL"] = (lerp(9, 14, up), -172 * up + tug); st["shR"] = (lerp(25, -14, up), lerp(-58, -172, up) - tug)
        st["neck"] = (lerp(4, -10, up), lerp(40, 0, up))
        return st
    # 80.4: back into the stall, the apron in his left hand, the flower in his right; he turns to the hook
    L = plen(STALL_PATH); dist = min(1.7 * (f - C_STALL) / 24, L)
    (x, y), hd = polyline(STALL_PATH, dist); s, bob = swing(dist)
    settle = 1 - ease(seg(f, 1948, 1953)); s *= settle; bob *= settle
    st["pos"] = (x, y, bob); st["yaw"] = angle_lerp(hd, 70, ease(seg(f, 1949, F1))); st["hips"] = (s, -s)
    st["shL"] = (9, -s * .3 - 6); st["shR"] = (-9, s * .3 - 6); st["neck"] = (6, 0); st["lean"] = 2
    return st

for f in range(F0, F1 + 1):
    pose(K, f, **keeper_state(f))

# the fisher's line never moves while he is at the pond: hold the sit without the loop's lift for the shot
for f in range(C_POND, C_STAND):
    W.sit(W.fisher, f, (PC[0] - 2.5, PC[1] - .45, .12), 0, lean=2, neck=(8, 0), shL=(0, -20), shR=(0, -62))

# ---------- faces: scripted (act 2's end) -> flat 1660 -> doubt 1704 -> wonder 75.0 -> grief 1884 -> flat 1914 ----------
W.face_default(F, F0, "scripted", hl=True)
def face(f, name, hl=None):
    for n, g in F.items():
        if n == "hl": continue
        vis(g, f, n == name)
    if hl is not None: vis(F["hl"], f, hl)
face(1660, "flat"); face(C_FACADE, "doubt"); face(sec(75.0), "wonder"); face(1884, "grief"); face(C_APRON, "flat")

# ---------- the sky wall: dust off the paint on each knock, keyed with ease, lands on the grass ----------
dustM = RW.mat("paintDust", "#e8d6a8", .06, 44, texel=.05)
DUST = [(KNOCKS[0], -.28, 1.62), (KNOCKS[0], .12, 1.48), (KNOCKS[0], -.05, 1.9),
        (KNOCKS[1], .3, 1.55), (KNOCKS[1], -.18, 1.72), (KNOCKS[1], .05, 1.35),
        (KNOCKS[2], -.34, 1.44), (KNOCKS[2], .22, 1.8), (KNOCKS[2], -.12, 1.58)]
for i, (kf, dx, z0) in enumerate(DUST):
    sz = .06 + .02 * (i % 3)
    d = RW.box(f"dust{i}", (sz, sz, sz), (0, 0, -50), dustM)
    vis(d, F0, False); vis(d, kf + 1, True)
    yl = 39.5 - .25 * ((i * 7) % 3) / 2
    for f in range(kf + 1, kf + 16):
        u = seg(f, kf + 1, kf + 13)
        z = z0 - (z0 - .04) * u * u
        key(d, f, loc=(-8.0 + dx, lerp(39.9, yl, ease(u)), max(z, .04)), rot=(0, 0, R(90 * u * (1 + i % 2))))
    key(d, kf + 16, loc=(-8.0 + dx, yl, .04))

# ---------- the facade: house 2 becomes a front held up by two props, for the shots behind it ----------
H2 = W.HOUSES[2]
house2 = [o for o in bpy.data.objects if o.name.startswith("CL_house2_")]
W.house("facade2", *H2[:5], H2[5], H2[6], door=True, front_only=True)
facade = [o for o in bpy.data.objects if o.name.startswith("CL_facade2_")]
for o in house2: vis(o, F0, True); vis(o, C_FACADE, False); vis(o, C_POND, True)
for o in facade: vis(o, F0, False); vis(o, C_FACADE, True); vis(o, C_POND, False)
# the Mayor from behind: his figure off, a man-shaped board on a strut in his coat colour, on the balcony plank
MAYOR_AT = (H2[0] - .2, H2[1] - H2[3] / 2 - .5, H2[4] - .22)
mb = RW.empty("mayorBoard", MAYOR_AT)
RW.blocks("mayorBoard_cut", [((.06, .6, 1.1), (0, 0, .55)), ((.06, .42, .42), (0, 0, 1.32)), ((.06, .14, .18), (0, 0, 1.08))], M["purple"], mb)
RW.box("mayorBoard_strut", (.1, .1, .8), (0, .28, .28), M["wood2"], mb, rot=(R(45), 0, 0))
vis(W.mayor["root"], F0, True); vis(W.mayor["root"], C_BOARD, False); vis(W.mayor["root"], C_POND, True)
vis(mb, F0, False); vis(mb, C_BOARD, True); vis(mb, C_POND, False)

# ---------- the pond: his sharp reflection tracks his head; three square rings go out from his hand ----------
rr = W.refl["root"]
vis(rr, F0, False); vis(rr, C_POND, True); vis(rr, C_STAND, False)
for f in range(C_POND, C_STAND):
    hx, hy, _ = W.world_at(K["head"], f)
    key(rr, f, loc=(hx + .15, hy, .03), rot=(0, 0, 0), scale=(1.5, 1.5, .14))
key(W.refl["neck"], F0, rot=(0, R(-90), 0))
ringM = RW.mat("ring", "#9ed0e8", .03, 45, texel=.05, emit=.3)
tx, ty, _ = W.world_at(K["tipR"], TOUCH)
RING = [((1.06, .06, .03), (0, .5, 0)), ((1.06, .06, .03), (0, -.5, 0)), ((.06, 1.06, .03), (.5, 0, 0)), ((.06, 1.06, .03), (-.5, 0, 0))]
for i in range(3):
    rg = RW.blocks(f"ring{i}", RING, ringM); rg.location = (tx, ty, .045)
    t0 = TOUCH + 6 * i; t1 = t0 + 24
    vis(rg, F0, False); vis(rg, t0, True); vis(rg, t1, False)
    for f in range(t0, t1 + 1):
        u = seg(f, t0, t1); s_ = .15 + 2.3 * math.sqrt(u)
        key(rg, f, scale=(s_, s_, 1))

# ---------- the flower stand: the pick, the regrowth, the flower in his hand ----------
handFlowerK = RW.blocks("handFlowerK", [((.04, .04, .3), (0, 0, .15)), ((.14, .14, .12), (0, 0, .33)), ((.07, .07, .05), (0, 0, .4))], M["flowR"], K["tipR"])
handFlowerK.rotation_euler = (0, R(60), 0)
vis(handFlowerK, F0, False); vis(handFlowerK, PICK, True)
vis(W.potFlower, F0, True); vis(W.potFlower, PICK, False); vis(W.potFlower, PICK + 1, True)
print("ACT3 pick: tipR", tuple(round(v, 2) for v in W.world_at(K["tipR"], PICK)), "pot flower", tuple(round(v, 2) for v in W.potFlower.location))
for fr, sc in ((F0, 1.0), (PICK - 1, 1.0), (PICK + 1, .1), (PICK + 3, 1.2), (PICK + 5, 1.0)):
    key(W.potFlower, fr, scale=(sc, sc, sc))

# ---------- the apron: off his body at 1930, a prop in his left hand ----------
APRON_PARTS = ["keeper_apronLow", "keeper_apronHem", "keeper_apronPocket", "keeper_apronBib", "keeper_apronBack", "keeper_apronStrap-1", "keeper_apronStrap1"]
for nm in APRON_PARTS:
    o = bpy.data.objects["CL_" + nm]; vis(o, F0, True); vis(o, APRON_OFF, False)
apronProp = RW.blocks("apronProp", [((.05, .5, .6), (0, 0, -.3)), ((.03, .35, .18), (0, 0, .1))], RW.mat("apronProp", "#f6f0e2", .03, 46, texel=.05), K["tipL"])
vis(apronProp, F0, False); vis(apronProp, APRON_OFF, True)

# ---------- shots (cut where the harmonica phrases) ----------
shot = W.shot
shot("s1", C_WALL, C_FACADE - 1, (-2.6, 39.25, 1.35), (-3.0, 39.2, 1.35), (-7.8, 39.3, 1.35), (-7.9, 39.35, 1.35), 35)    # the painted sky, the knock
shot("s2a", C_FACADE, C_BOARD - 1, (7.6, 10.6, 1.8), (7.3, 10.3, 1.75), (4.3, 7.4, 1.3), (4.2, 7.4, 1.3), 32)        # a front and nothing behind it
shot("s2b", C_BOARD, C_POND - 1, (2.6, 9.8, 4.4), (2.9, 9.4, 4.3), (4.5, 5.8, 3.1), (4.5, 5.9, 3.1), 40)            # the balcony from behind: a board
shot("s3", C_POND, C_STAND - 1, (PC[0] + 1.9, PC[1] + 3.1, 2.0), (PC[0] + 1.55, PC[1] + 2.75, 1.85),
     (KX + .9, KY - .1, .45), (KX + .75, KY - .05, .4), 40)                                                          # the pond: the sharp reflection
shot("s4a", C_STAND, C_CLOSE - 1, (-8.1, -6.7, 1.7), (-7.8, -6.5, 1.65), (-5.0, -3.9, 1.05), (-4.9, -3.9, 1.1), 35)  # the stand: the pick, the regrowth
shot("s4b", C_CLOSE, C_PAN - 1, (-6.4, -5.5, 1.55), (-6.3, -5.4, 1.55), (-4.6, -3.95, 1.35), (-4.6, -3.95, 1.35), 50) # close: the flower in his hand, grief
def pan(f):
    u = ease(seg(f, C_PAN, C_APRON - 1))
    return (-4.4, -4.6, 1.55), RW.V3((4.4, 5.7, 3.4), (8.6, -6.4, .5), u)
shot("s5a", C_PAN, C_APRON - 1, None, None, None, None, 30, track=pan)                                               # his look across the smiling village
shot("s5b", C_APRON, C_STALL - 1, (-2.5, -6.1, 1.7), (-2.6, -6.0, 1.7), (-4.5, -3.9, 1.3), (-4.5, -3.9, 1.35), 40)  # the apron over his head
shot("s5c", C_STALL, F1, (.3, -3.2, 1.7), (.3, -3.2, 1.7), (.0, .6, 1.3), (.0, .6, 1.3), 45)                         # over the counter: back in the stall

pixel_groups([(F0, 6)], [(W.REFL_NAMES, 1)])
W.finish_steps()
print("ACT3 shots:", W.SHOTS)
run(OUT)
