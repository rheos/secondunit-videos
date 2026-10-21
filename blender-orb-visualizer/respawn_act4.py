# Respawn act 4: verse 2, walking off (song 81.5-105.8 s, frames 1956-2539). STORYBOARD-respawn.md, act 4.
# Starts where act 3 ends: the keeper in the stall, apron off and in his left hand, the picked flower in his right.
# L5 82.02 he hangs the apron on the sword hook; on 82.58 a sword pops back in front of it (the hook is a sword
# hook, whatever you hang there). L6 87.66 he walks out of the stall for good (the sketch's s3a), round to the flower
# seller, holds the flower out to her (tender); she does her wave; he lets it drop and it lies on the grass and
# stays; from 90.11 the sketch's s3b tracking shot east along the road. L7 94.44 the guard's four steps end in the
# middle of the road and four more guards step out of him, a line across it; he walks at them, and on 96.57 they
# are boards: the middle one tips as he pushes through, the others rock on their stands and turn their slits after
# him. L8 100.66 the last fence, the map-edge sign, the end of the grass (the sketch's s4a, ported): he reads the
# sign, looks down at the dark grid, steps off on 102.33 and walks on east over the void (the sketch's s4b).
#
#   tools/render_lock.sh blender -b --factory-startup --python respawn_act4.py -- --stills 1970,1985,2060,2120,2200,2316,2460,2539
#   tools/render_lock.sh blender -b --factory-startup --python respawn_act4.py -- --render
# Frames land in out/film/respawn/act4/frames/ (named by song frame). Structure follows respawn_act1.py.
# Continuity note: like the sketch (its 831/832 and 916/917 cuts), he jumps along the road on two cuts: at 2104 (from
# the stall front to the seller's stand) and at 2163 (from the stand to x = 20.9 on the east road), and at 2416 from
# x 35.7 to the last metres before the edge. Everything inside a shot is continuous.
import bpy, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
sys.path.insert(0, HERE)
import respawn_world as RW
from respawn_world import R, ease, seg, lerp, clamp, swing, polyline, plen, angle_lerp
from film_kit import pixel_groups, sec, key, run

F0, F1 = 1956, 2539
OUT = os.path.join(HERE, "out", "film", "respawn", "act4")
W = RW.build(F0, F1, OUT)
vis, pose = W.vis, W.pose
K, F = W.keeper, W.keeper["F"]
M, FS, EDGE, VOIDZ = W.M, W.FS, W.EDGE, W.VOIDZ

# ---------- the village runs its loops under everything ----------
W.village_loops(F0, F1, keeper_home=False)

# ---------- beats (song frames) ----------
HANG = 1968                                  # L5 82.02: the apron goes on the hook
POP = 1982                                   # 82.58: the sword pops back in front of it
TURN = 2010                                  # 83.74: he turns from the hook to the village
WALK1 = 2029                                 # 84.53: and walks out of the stall
C_SELL = 2104                                # L6 87.66: the seller's stand
ARRIVE = 2110                                # he stops in front of her; her wave 2110-2134
DROP = 2134                                  # the flower leaves his hand
TURN2, WALK2 = 2142, 2150                    # he turns east and goes
C_TRACK = 2163                               # 90.11: the tracking shot along the road
C_LINE = 2267                                # L7 94.44: the guard stops in the road
STEPS = (2289, 2295, 2301, 2307)             # 95.37 on: four more guards step out of him
BOARDS = 2316                                # 96.57 (2318) he walks through: they are boards
C_EDGE = 2416                                # L8 100.66: the edge
STOP_E, LOOK_E, STEP_E, LAND_E, WALK_E = 2443, 2449, 2456, 2466, 2472   # the sketch's 944/950/956/966/972, ported

# ---------- the shopkeeper: every frame a pure function of f ----------
P1 = [(.25, .65), (1.9, .8), (3.1, -1.5), (-5.2, -2.6)]           # out the east side of the stall, round the front, west to her
P2 = [(-4.75, -2.5), (-5.2, -2.6)]                               # the last half metre to her stand
SELLER_YAW = -137                                                # facing her at (-6.55, -3.85)
P3 = [(-5.2, -2.6), (-3.2, -2.0), (60, -1.6)]                     # away east
X_TRACK0 = 20.9                                                  # the tracking shot: x at 2163, 1.45 m/s
X_LINE0 = X_TRACK0 + 1.45 * (C_LINE - C_TRACK) / 24               # 27.18 at 2267, then 1.38 m/s: x = 30.0 on 2316
D_LINE0 = 1.45 * (C_LINE - C_TRACK) / 24
X_EDGE0 = EDGE - .38 - 1.4 * (STOP_E - C_EDGE) / 24               # 48.045 at 2416 (the sketch's x0)

def keeper_state(f):
    st = dict(pos=(0, .6, 0), yaw=70, lean=2, neck=(6, 0), shL=(9, -6), shR=(-9, -6), hips=(0, 0))
    if f < C_SELL:                                                # in the stall: the hook, the pop, the turn, the walk out
        u = ease(seg(f, 1958, HANG))
        st["pos"] = (lerp(0, .25, u), lerp(.6, .65, u), 0); st["yaw"] = lerp(70, 20, u)
        st["neck"] = (lerp(6, -8, u), 30 * u); st["shL"] = (lerp(9, 0, u), lerp(-6, -80, u))
        if f >= HANG + 4:                                         # the apron hangs; the arm comes down
            v = ease(seg(f, HANG + 4, HANG + 12)); st["shL"] = (lerp(0, 9, v), lerp(-80, -6, v))
        if f >= POP:                                              # the flinch at the pop
            p = math.sin(math.pi * seg(f, POP, POP + 8))
            st["lean"] = 2 - 6 * p; st["neck"] = (st["neck"][0] - 6 * p, st["neck"][1])
        if f >= TURN:
            v = ease(seg(f, TURN, TURN + 12))
            st["yaw"] = lerp(20, -60, v); st["neck"] = (lerp(-8, 4, v), lerp(30, 0, v)); st["lean"] = lerp(2, 3, v)
        if f >= WALK1:
            dist = 1.6 * (f - WALK1) / 24; (x, y), hd = polyline(P1, dist); s, bob = swing(dist)
            st.update(pos=(x, y, bob), yaw=angle_lerp(-60, hd, ease(seg(f, WALK1, WALK1 + 8))), hips=(s, -s),
                      shL=(9, -s * .6), shR=(-9, s * .6), neck=(4, 0), lean=3)
        return st
    if f < C_TRACK:                                               # at her stand: the flower held out, the wave, the drop
        LB = plen(P2); dist = min(1.6 * (f - C_SELL) / 24, LB)
        (x, y), hd = polyline(P2, dist); s, bob = swing(dist)
        settle = 1 - ease(seg(f, ARRIVE - 2, ARRIVE + 3)); s *= settle; bob *= settle
        fu = ease(seg(f, ARRIVE - 2, ARRIVE + 6))
        st.update(pos=(x, y, bob), yaw=angle_lerp(hd, SELLER_YAW, fu), hips=(s, -s), lean=2 + 3 * fu, neck=(6 * fu, 0))
        offer = ease(seg(f, ARRIVE + 2, ARRIVE + 10)) * (1 - ease(seg(f, DROP, DROP + 8)))
        st["shL"] = (9, -s * .6); st["shR"] = (lerp(-9, 0, offer), lerp(s * .6, -80, offer))
        if f >= DROP + 4:                                         # he looks down at it on the grass
            v = ease(seg(f, DROP + 4, DROP + 12)); st["neck"] = (lerp(6, 24, v), 0)
        if f >= TURN2:
            v = ease(seg(f, TURN2, TURN2 + 10))
            st["yaw"] = angle_lerp(SELLER_YAW, -10, v); st["neck"] = (lerp(24, 2, v), 0); st["lean"] = lerp(5, 2, v)
        if f >= WALK2:
            d2 = 1.5 * (f - WALK2) / 24; (x, y), hd = polyline(P3, d2); s, bob = swing(d2)
            st.update(pos=(x, y, bob), yaw=angle_lerp(-10, hd, ease(seg(f, WALK2, WALK2 + 6))), hips=(s, -s),
                      shL=(9, -s * .6), shR=(-9, s * .6), neck=(2, 0), lean=2)
        return st
    if f < C_LINE:                                                # the tracking shot east along the road
        dist = 1.45 * (f - C_TRACK) / 24; s, bob = swing(dist)
        st.update(pos=(X_TRACK0 + dist, -1.5, bob), yaw=0, lean=0, hips=(s, -s), shL=(9, -s * .6), shR=(-9, s * .6),
                  neck=(0, 18 * math.sin(math.pi * seg(f, 2190, 2225))))
        return st
    if f < C_EDGE:                                                # the line: he walks at them, pushes through
        dist = 1.38 * (f - C_LINE) / 24; s, bob = swing(D_LINE0 + dist)
        push = ease(seg(f, 2310, 2316)) * (1 - ease(seg(f, 2322, 2330)))
        glance = 42 * math.sin(math.pi * seg(f, 2345, 2380))      # a look back over the shoulder at the boards
        st.update(pos=(X_LINE0 + dist, -1.5, bob), yaw=0, hips=(s, -s), shL=(lerp(9, 0, push), lerp(-s * .6, -62, push)),
                  shR=(-9, s * .6), neck=(2 * push, glance), lean=5 * push)
        return st
    # the edge (the sketch's 917-1061, ported): the last metres, the sign, the look down, the step off, the void
    st["yaw"] = 0; st["lean"] = 0; st["neck"] = (0, 0); st["shL"] = (9, 0); st["shR"] = (-9, 0)
    if f <= STOP_E:
        dist = 1.4 * (f - C_EDGE) / 24; s, bob = swing(dist)
        read = ease(seg(f, C_EDGE, C_EDGE + 8)) * (1 - ease(seg(f, C_EDGE + 16, C_EDGE + 24)))   # the sign, off to his right
        st.update(pos=(X_EDGE0 + dist, -1.5, bob), hips=(s, -s), shL=(9, -s * .6), shR=(-9, s * .6), neck=(12 * read, -48 * read))
        return st
    if f < STEP_E:                                                # he stops at the edge and looks down
        u = ease(seg(f, STOP_E, LOOK_E))
        st.update(pos=(EDGE - .38, -1.5, 0), neck=(30 * u, 0), lean=6 * u, shL=(9 + 14 * u, 0), shR=(-9 - 14 * u, 0))
        return st
    if f < LAND_E:                                                # 102.33: steps off, the little hop down
        u = seg(f, STEP_E, LAND_E)
        z = lerp(0, VOIDZ, u * u) + .16 * math.sin(math.pi * u)
        st.update(pos=(lerp(EDGE - .38, EDGE + .45, ease(u)), -1.5, z), neck=(lerp(30, 8, u), 0), lean=lerp(6, 2, u),
                  hips=(-28 * math.sin(math.pi * u), 14 * math.sin(math.pi * u)), shL=(30, -20), shR=(-30, -20))
        return st
    if f < WALK_E:                                                # lands on the grid
        u = seg(f, LAND_E, WALK_E)
        st.update(pos=(EDGE + .45, -1.5, VOIDZ), lean=8 * math.sin(math.pi * u), neck=(8 * (1 - u), 0), shL=(20, 0), shR=(-20, 0))
        return st
    dist = 1.3 * (f - WALK_E) / 24; s, bob = swing(dist)          # and walks on east, 1.3 m/s (act 5 continues this)
    st.update(pos=(EDGE + .45 + dist, -1.5, VOIDZ + bob), hips=(s, -s), shL=(9, -s * .6), shR=(-9, s * .6))
    return st

for f in range(F0, F1 + 1):
    pose(K, f, **keeper_state(f))

# she waves on cue when he holds the flower out (the loop keys her every frame; this re-keys those frames)
W.seller_wave(ARRIVE, DROP)

# ---------- faces: flat + highlight the whole act; tender for her ----------
W.face_default(F, F0, "flat", hl=True)
def face(f, name, hl=None):
    for n, g in F.items():
        if n == "hl": continue
        vis(g, f, n == name)
    if hl is not None: vis(F["hl"], f, hl)
face(C_SELL, "tender"); face(TURN2, "flat")

# ---------- the apron: off his body (act 3), a prop in his left hand, then hanging on the hook ----------
for nm in ["keeper_apronLow", "keeper_apronHem", "keeper_apronPocket", "keeper_apronBib", "keeper_apronBack", "keeper_apronStrap-1", "keeper_apronStrap1"]:
    vis(bpy.data.objects["CL_" + nm], F0, False)
APRON_PARTS = [((.05, .5, .6), (0, 0, -.3)), ((.03, .35, .18), (0, 0, .1))]
apronM = RW.mat("apronProp", "#f6f0e2", .03, 46, texel=.05)
apronProp = RW.blocks("apronProp", APRON_PARTS, apronM, K["tipL"])
vis(apronProp, F0, True); vis(apronProp, HANG + 4, False)
for f in range(F0, HANG + 5):                                     # it hangs straight down whatever the arm does
    a = keeper_state(f)["shL"]; key(apronProp, f, rot=(R(-a[0]), R(-a[1]), 0))
# the same apron, parented to nothing, flat against the back wall under the upper peg (.70, 1.24, 1.48)
apronHook = RW.blocks("apronHook", APRON_PARTS, apronM); apronHook.location = (.70, 1.21, 1.38); apronHook.rotation_euler = (0, 0, R(90))
vis(apronHook, F0, False); vis(apronHook, HANG + 4, True)
# the picked flower (act 3's) in his right hand, until he lets it go
handFlowerK = RW.blocks("handFlowerK", [((.04, .04, .3), (0, 0, .15)), ((.14, .14, .12), (0, 0, .33)), ((.07, .07, .05), (0, 0, .4))], M["flowR"], K["tipR"])
handFlowerK.rotation_euler = (0, R(-60), 0)
vis(handFlowerK, F0, True); vis(handFlowerK, DROP, False)
# the dropped flower: falls from his hand to the grass at her feet and stays there (the first thing he changed that stayed)
dropFlower = RW.blocks("dropFlower", [((.04, .04, .3), (0, 0, .15)), ((.14, .14, .12), (0, 0, .33)), ((.07, .07, .05), (0, 0, .4))], M["flowR"])
vis(dropFlower, F0, False); vis(dropFlower, DROP, True)
d0 = W.world_at(K["tipR"], DROP - 1)
DROP_AT = Vector((lerp(d0.x, -5.9, .6), lerp(d0.y, -3.3, .6), .06))
for f in range(DROP, DROP + 7):
    u = seg(f, DROP, DROP + 6)
    p = d0.lerp(DROP_AT, u); p.z = lerp(d0.z, .06, u * u)
    key(dropFlower, f, loc=tuple(p), rot=(0, R(-60 + 150 * u), R(-137 + 40 * u)))
key(dropFlower, DROP + 7, loc=tuple(DROP_AT), rot=(0, R(90), R(-97)))

# ---------- the hook: the wall sword goes under the apron, then pops back in front of it (the respawn, act 1's) ----------
SWORD_FRONT = Vector((.70, 1.15, 1.06))
key(W.wallSword, F0, loc=tuple(W.WALL_SWORD), scale=(1, 1, 1)); key(W.wallSword, POP - 1, scale=(1, 1, 1))
vis(W.wallSword, HANG + 4, False)
key(W.wallSword, HANG + 4, loc=tuple(SWORD_FRONT))
vis(W.wallSword, POP + 1, True)
for k, sc in ((POP, .2), (POP + 1, .3), (POP + 2, 1.3), (POP + 3, 1.1), (POP + 4, 1.0)):
    key(W.wallSword, k, scale=(sc, sc, sc))
sparks = [RW.box(f"spark{k}", (.06, .06, .06), (0, 0, -50), M["spark"]) for k in range(8)]
ctr = SWORD_FRONT + Vector((0, -.06, .35))
for k, s_ in enumerate(sparks):
    ang = 2 * math.pi * k / len(sparks)
    vis(s_, F0, False); vis(s_, POP + 1, True); vis(s_, POP + 8, False)
    for f in range(POP + 1, POP + 9):
        r = .15 + .55 * seg(f, POP + 1, POP + 8)
        key(s_, f, loc=tuple(ctr + Vector((r * math.cos(ang), -.02, r * math.sin(ang)))), scale=[1 - .7 * seg(f, POP + 1, POP + 8)] * 3)

# ---------- the guards: the beat guard stops in the road, four more step out of him, then they are boards ----------
G = W.guard
G["stand"] = RW.box("guard_stand", (1.6, .12, .12), (-.8, 0, .06), M["wood2"], G["root"], rot=(0, R(-70), 0))
G["stand"].hide_render = True; G["stand"].hide_viewport = True
LINE_Y = {0: -3.6, 1: -2.6, 2: -.6, 3: .4}                       # W.guards[i] -> its place; W.guard holds y -1.6
G_TAKE = 2250                                                     # the loop has him at x 28.95 walking east here
LINE = [(G, -1.6)] + [(W.guards[i], LINE_Y[i]) for i in range(4)]
for g, _ in LINE: key(g["root"], F0, scale=(1, 1, 1)); key(g["root"], BOARDS - 1, scale=(1, 1, 1))

def slit_track(gx, gy, f):
    """a board's neck yaw: the slit follows him once he is past (facing 180; a neck can turn so far)"""
    kx, ky = keeper_state(f)["pos"][:2]
    rel = (math.degrees(math.atan2(ky - gy, kx - gx)) - 180 + 180) % 360 - 180
    return clamp(rel, -34, 34) * ease(seg(f, BOARDS + 6, BOARDS + 18))

def rock(f, y):
    """a board rocks on its stand as he passes: a damped wobble, later the farther it stands from his line"""
    t = f - (BOARDS + 2 + 2.5 * abs(y + 1.5))
    return 0 if t < 0 else 4.5 * math.sin(t / 2.0) * math.exp(-t / 12.0)

def guard0_state(f):
    """W.guard from 2250: the last steps east to x 30, the stop, the turn to face him, the board, the tip"""
    x = min(28.95 + 1.4 * (f - G_TAKE) / 24, 30.0); d = 2.45 + 1.4 * (f - G_TAKE) / 24
    arrived = x >= 30.0
    s, bob = swing(d) if not arrived else (0, 0)
    yaw = angle_lerp(0, 180, ease(seg(f, 2268, 2280)))
    st = dict(pos=(x, -1.6, bob), yaw=yaw, hips=(s, -s), shL=(6, -s * .3), shR=(-8, 0), neck=(0, 0), lean=0)
    if f >= BOARDS:
        st["lean"] = -42 * ease(seg(f, BOARDS, BOARDS + 10)) + rock(f, -1.6) * .5
        st["pos"] = (30.05, -1.6, 0); st["neck"] = (0, slit_track(30.05, -1.6, f))
    return st

def guardi_state(i, f):
    """W.guards[i]: steps out of W.guard at (30, -1.6) to its place in the line; a board from 2316"""
    t0 = STEPS[i]; y1 = LINE_Y[i]
    if f < t0: return None
    u = ease(seg(f, t0, t0 + 8)); y = lerp(-1.6, y1, u)
    s = 22 * math.sin(math.pi * u) * (1 if y1 < -1.6 else -1)
    st = dict(pos=(30.0, y, .03 * math.sin(math.pi * u)), yaw=180, hips=(s, -s), shL=(6, -s * .3), shR=(-8, 0), neck=(0, 0), lean=0)
    if f >= BOARDS:
        st["lean"] = rock(f, y1); st["neck"] = (0, slit_track(30.0, y1, f))
    return st

for f in range(G_TAKE, F1 + 1):
    pose(G, f, **guard0_state(f))
for i in range(4):
    g = W.guards[i]
    vis(g["root"], STEPS[i], True)
    for f in range(STEPS[i], F1 + 1):
        pose(g, f, **guardi_state(i, f))
for g, _ in LINE: W.board(g, BOARDS, True)

# ---------- light: noon until the edge; from the first shot past the map's end, "edge", the east sky card gone ----------
W.light(F0, "noon")
W.light(C_EDGE, "edge")
vis(W.skyEnd, C_EDGE, False)
vis(W.skySouth, C_EDGE, False)                                    # the edge cameras never see south; the card's 90 m shadow would leave him black

# ---------- shots (cut on the line onsets) ----------
shot = W.shot
shot("s1", F0, POP - 1, (3.0, .3, 1.7), (2.9, .35, 1.68), (.5, .95, 1.25), (.5, .97, 1.27), 40)                # the hook: he hangs the apron
shot("s2", POP, TURN - 1, (2.0, -.25, 1.5), (1.95, -.2, 1.48), (.7, 1.22, 1.22), (.7, 1.22, 1.22), 50)            # close: the sword pops back over it
shot("s3", TURN, C_SELL - 1, (-1.2, -6.8, 2.0), (.9, -6.5, 1.95), (-.1, .5, 1.3), (2.0, .3, 1.15), 35)            # the sketch's s3a: he turns and walks out
shot("s4a", C_SELL, C_TRACK - 1, (-3.3, -5.3, 1.5), (-3.5, -5.1, 1.48), (-5.75, -3.2, 1.05), (-5.75, -3.2, 1.05), 38)  # her stand: the flower held out, the wave, the drop
def track3(f):
    x = keeper_state(f)["pos"][0]
    return (x - .2, -10.5, 1.75), (x + .2, 0, 1.15)
shot("s4b", C_TRACK, C_LINE - 1, None, None, None, None, 50, track=track3)                                        # the sketch's s3b: the tracking shot east
shot("s5a", C_LINE, 2306, (23.0, -5.2, 1.9), (23.6, -5.0, 1.85), (29.4, -1.6, 1.0), (29.6, -1.6, 1.0), 35)        # over his shoulder: the guard stops, the line steps out
shot("s5b", 2307, 2333, (33.4, -6.8, 1.15), (33.2, -6.6, 1.15), (30.3, -1.3, .9), (30.4, -1.35, .9), 36)          # the "line" still's camera: he walks through
def track5(f):
    x = keeper_state(f)["pos"][0]
    return (41.0, -5.5, 1.4), (x - 1.0, -1.6, 1.0)
shot("s5c", 2334, C_EDGE - 1, None, None, None, None, 40, track=track5)                                           # from ahead: the boards rock and turn after him
shot("s6a", C_EDGE, WALK_E, (EDGE - 2.2, -7.6, 1.45), (EDGE - 1.6, -7.1, 1.4), (EDGE + .5, 0, .35), (EDGE + .7, 0, .3), 30)   # the sketch's s4a: the sign, the edge, the step
shot("s6b", WALK_E + 1, F1, (EDGE - 7, -9.5, 7.0), (EDGE - 7.6, -10.2, 8.4), (EDGE + 9, 1, -.3), (EDGE + 10, 1, -.5), 24)      # the sketch's s4b: high wide, out onto the grid

pixel_groups([(F0, 6)], [])
W.finish_steps()
print("ACT4 shots:", W.SHOTS)
print("ACT4 end state:", keeper_state(F1))
run(OUT)
