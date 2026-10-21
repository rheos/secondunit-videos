# Respawn act 7: refrain 3 + outro, the real thing (song 141.5-165.85 s, frames 3396-3980). STORYBOARD-respawn.md, act 7.
# The climax: the sun's rim rises past the open crack (3396-3504), the two of them step through onto the real shore
# and with each step the pixels leave them (keyed pixel groups 6, 4, 2, sharp; her first, both sharp on 148.14), the
# camera arrives at the approved "cross" composition (respawn_stills.py) by 3504, a real fish jumps once in the sun
# path on 148.14 and never again, a long slow crane rises over the real shore as the sun clears the sea (148-155),
# then low on the sand the two of them sit, the flower stuck upright beside them, laugh on 157.09, quiet. Outro
# 160.6-165.85: one cut back into the game, pixelated again, fixed noon: the stall empty, the apron on its hook, a
# hero waiting at the counter, the Mayor reading, the wall sword gone and nothing in its place; the hero's head turns
# toward the edge of the map; hold (the encode fades the last second).
#
#   tools/render_lock.sh blender -b --factory-startup --python respawn_act7.py -- --stills 3396,3450,3504,3555,3650,3733,3770,3854,3940
#   tools/render_lock.sh blender -b --factory-startup --python respawn_act7.py -- --render
# Frames land in out/film/respawn/act7/frames/ (named by song frame). Structure follows respawn_act1.py: build the
# world, key the cast per frame from pure functions of the frame, swap faces with vis(), cut shots on the line onsets,
# set the pixel groups, finish_steps(), run().
import bpy, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
sys.path.insert(0, HERE)
import respawn_world as RW
from respawn_world import R, ease, seg, lerp, clamp, swing, angle_lerp
from film_kit import pixel_groups, sec, key, run

F0, F1 = 3396, 3980
OUT = os.path.join(HERE, "out", "film", "respawn", "act7")
W = RW.build(F0, F1, OUT)
vis, pose = W.vis, W.pose
K, S = W.keeper, W.seller
WX, Y5, VOIDZ, CAM5, SUNP, SUNRAD = W.WX, W.Y5, W.VOIDZ, W.CAM5, W.SUNP, W.SUNRAD
yk = Y5 + W.crack_c(.75) - .478                 # the crack's centre line at chest height; they walk either side of it
SANDZ = VOIDZ - .3                              # the real shore is a step below the grid
KLINE = (SUNP.y - CAM5.y) / (SUNP.x - CAM5.x)   # the sea's sun path lies on the CAM5 -> SUNP line (plan slope)
def line_y(x): return CAM5.y + (x - CAM5.x) * KLINE
names = lambda d: [o.name for o in [d["root"]] + list(d["root"].children_recursive) if o.type == "MESH"]

# word onsets, L11 (song seconds -> frames)
ON = dict(l11=sec(142.07), sharp=sec(148.14), fish_seen=sec(148.72), sit=sec(155.56), w2=sec(155.94),
          laugh=sec(157.09), w4=sec(157.52), w5=sec(157.92), w6=sec(158.76), outro=3854)
# 3410, 3555, 3569, 3733, 3743, 3770, 3780, 3790, 3810, 3854

# ---------- the set past the wall: the crack open, the wall and the sunrise visible, the shore fill ----------
W.crack_open(F0, 1.5)
for ob in [W.wallLo, W.wallHi, W.rimLo, W.rimHi] + W.SR: vis(ob, F0, True)
vis(W.skyEnd, F0, False); vis(W.skyWest, F0, False); vis(W.skySouth, F0, False)
W.light(F0, "void", crack=1.0)
# a warm fill from the shore so their backs read against the sun (the "cross" still's light)
fd = bpy.data.lights.new("CL_shoreFill", "POINT"); fd.energy = 700; fd.color = RW.hex_lin("#ffc48a"); fd.shadow_soft_size = 1.5
fl = bpy.data.objects.new("CL_shoreFill", fd); W.scene.collection.objects.link(fl); fl.location = (WX - 1.2, Y5 - 2.4, 3.2)
# the sun itself, as a light: a warm point out over the water that comes up with the rim (lights their fronts and the sand)
sld = bpy.data.lights.new("CL_seaLight", "POINT"); sld.color = RW.hex_lin("#ffc07a"); sld.shadow_soft_size = 2.0
seaLight = bpy.data.objects.new("CL_seaLight", sld); W.scene.collection.objects.link(seaLight); seaLight.location = (WX + 7.5, line_y(WX + 7.5), 2.6)
# a sill under the crack: the grid floor ends at WX - .1 and the sand starts at WX + .21; they cross the gap on this
RW.box("crackSill", (.42, 3.4, .3), (WX, Y5, VOIDZ - .15), RW.mat("sill", "#1a2140", .03, 45, texel=.1))

# ---------- props: the flower in HIS left hand (act 6), her can left on the grid, the flower in the sand, the fish ----------
handFlowerK = RW.blocks("handFlowerK6", [((.04, .04, .3), (0, 0, .15)), ((.14, .14, .12), (0, 0, .33)), ((.07, .07, .05), (0, 0, .4))], W.M["flowR"], K["tipL"])
handFlowerK.rotation_euler = (0, R(-60), 0)
vis(S["flower"], F0, False); vis(S["can"], F0, False)
canGrid = RW.blocks("canGrid", [((.26, .2, .24), (0, 0, .12)), ((.06, .06, .16), (-.1, 0, .31))], W.M["tin"])
canGrid.location = (WX - 2.7, yk + 1.05, VOIDZ); canGrid.rotation_euler = (0, 0, R(35))   # where she set it down, off to the side
RW.box("canGridSpout", (.3, .05, .05), (.22, 0, .2), W.M["tin"], canGrid, rot=(0, R(-25), 0))
SAND_FLOWER = (WX + 4.05, yk - .03, SANDZ)
sandFlower = RW.blocks("sandFlower", [((.04, .04, .3), (0, 0, .15)), ((.14, .14, .12), (0, 0, .33)), ((.07, .07, .05), (0, 0, .4))], W.M["flowR"])
sandFlower.location = SAND_FLOWER; vis(sandFlower, F0, False)
# he is apron-less out here (act 3 took it off, act 4 hung it on the hook); the outro shows it on the hook
for o in K["root"].children_recursive:
    if "_apron" in o.name: vis(o, F0, False)
# the real fish: smooth, warm, sharp; one parabola in the sun path, 3555-3564, then gone
fish = W.sphere("fish7", (WX + 9.0, line_y(WX + 9.0), -2), .24, W.grad_mat("fishReal", [(0, "#b84a1e"), (1, "#e8823a")], 2, -1.0, .2, strength=.55), scale=(1.6, .4, .6))
vis(fish, F0, False)
FISH = (ON["sharp"], ON["sharp"] + 11)
# the real world closes on every side: the world's sky card covers only +-44 deg from +x, so side sky planes, the sea
# and the shore carried out to the horizon (the world's own materials, reused) keep the void's background out of the
# sit and laugh shots, which look sideways
SKY_M, SEA_M, SAND_M = bpy.data.materials["CL_srSky"], bpy.data.materials["CL_srSea"], bpy.data.materials["CL_srSand"]
extra = []
for s_ in (-1, 1):
    yy = Y5 + s_ * 600
    extra.append(W.plane(f"sky7side{s_}", [(WX - 60, yy, -20), (WX + 620, yy, -20), (WX + 620, yy, 420), (WX - 60, yy, 420)], SKY_M))
    y0, y1 = (Y5 + 500, Y5 + 600) if s_ > 0 else (Y5 - 600, Y5 - 500)
    extra.append(W.plane(f"sea7side{s_}", [(WX + 5.0, y0, SANDZ), (WX + 610, y0, SANDZ), (WX + 610, y1, SANDZ), (WX + 5.0, y1, SANDZ)], SEA_M))
    y0, y1 = (Y5 + 60, Y5 + 600) if s_ > 0 else (Y5 - 600, Y5 - 60)
    extra.append(W.plane(f"sand7side{s_}", [(WX + .21, y0, SANDZ), (WX + 5.2, y0, SANDZ), (WX + 5.2, y1, SANDZ), (WX + .21, y1, SANDZ)], SAND_M))
for o in extra + [canGrid]: vis(o, F0, True)          # a first key at F0: a lone later key would apply to every frame
REAL_SHARP = [o.name for o in W.SR] + [fish.name, sandFlower.name] + [o.name for o in extra]

# ---------- the sunrise: the rim rising to 3504 (the climax), clear of the sea by 155 ----------
sunOb, haloOb, seaOb = bpy.data.objects["CL_sr_sun"], bpy.data.objects["CL_sr_halo"], bpy.data.objects["CL_sr_sea"]
HALO0 = Vector(haloOb.location)
def sun_z(f):
    if f <= 3504: return SUNP.z - 1.5 * SUNRAD * (1 - ease(seg(f, F0, 3504)))
    return SUNP.z + .8 * SUNRAD * ease(seg(f, 3504, 3760))
def wave_z(f): return .024 * math.sin(f / 17.3) + .016 * math.sin(f / 9.7)       # never the same twice

# ---------- the two of them: standing in the crack mouth, then the walk through onto the sand, then the sit ----------
K_HOME = (WX - 1.2, yk - .5); S_HOME = (WX - 1.2, yk + .45)
WALK_D = 4.8                                    # from x WX - 1.2 to the sitting spot x WX + 3.6
S_GO, K_GO = 3426, 3444                         # she goes first; 1.0 m/s, slow and even
SIT0, SIT1 = 3702, 3726                         # they sit down while the crane is high (the cut at 3733 finds them sitting)
def floor_z(x): return VOIDZ - .3 * ease(seg(x, WX + .12, WX + .48))              # the small step down onto the sand
def walk_dist(raw):
    """metres along the walk after `raw` seconds at 1.0 m/s, the last half metre eased to a stop"""
    if raw <= WALK_D - .5: return max(raw, 0.)
    return WALK_D - .5 + .5 * (1 - (1 - clamp((raw - (WALK_D - .5)) / 1.0)) ** 2)

def walker(f, home, go, H, breath):
    raw = (f - go) / 24.0; d = walk_dist(raw)
    x, y = home[0] + d, home[1]
    moving = 1 - seg(raw, WALK_D - .6, WALK_D + .4)
    s, bob = swing(d); s *= moving; bob *= moving
    st = dict(pos=(x, y, floor_z(x) + bob), yaw=0, lean=1 + .5 * math.sin(f / breath), neck=(-6, 0),
              hips=(s, -s), shL=(9, -s * .6), shR=(-9, s * .6))
    if f < go: st.update(hips=(0, 0), shL=(9, 0), shR=(-9, 0))
    # the sit: knees fold forward, the seat drops to the sand, hands rest on the knees
    u = ease(seg(f, SIT0, SIT1))
    if u > 0:
        st.update(pos=(x, y, SANDZ - .68 * H * u), lean=lerp(st["lean"], 5, u), hips=(-90 * u, -90 * u),
                  shL=(lerp(9, 0, u), -34 * u), shR=(lerp(-9, 0, u), -34 * u))
    return st

def keeper_state(f):
    st = walker(f, K_HOME, K_GO, K["H"], 13.0)
    nk = -6 - 4 * ease(seg(f, 3470, 3504))                                 # his chin lifts as the sun comes up
    yaw = 0.
    if f >= FISH[0]: yaw = 16 * ease(seg(f, FISH[0], FISH[0] + 6))          # the fish
    if f >= ON["fish_seen"]: yaw = lerp(16, 42, ease(seg(f, ON["fish_seen"], ON["fish_seen"] + 14)))   # then her
    if f >= 3620: yaw = 42 * (1 - ease(seg(f, 3620, 3660)))                  # back to the sea
    if f >= ON["sit"]: yaw = 0.
    if f >= ON["laugh"]: yaw = 36 * ease(seg(f, ON["laugh"], ON["laugh"] + 8)) * (1 - ease(seg(f, 3800, 3830)))
    nk += 8 * ease(seg(f, ON["laugh"], ON["laugh"] + 5)) * (1 - ease(seg(f, ON["w5"], ON["w6"])))       # the laugh throws the head back
    st["neck"] = (nk, yaw)
    if ON["laugh"] <= f < ON["w6"]:                                        # shoulders shake on the laugh, a dying count
        sh = 7 * math.sin((f - ON["laugh"]) / 1.7) * (1 - seg(f, ON["w4"], ON["w6"]))
        st["shL"] = (st["shL"][0], st["shL"][1] + sh); st["shR"] = (st["shR"][0], st["shR"][1] - sh)
    return st

def seller_state(f):
    st = walker(f, S_HOME, S_GO, S["H"], 11.0)
    nk = -8 - 4 * ease(seg(f, 3460, 3504))
    yaw = 0.
    if f >= FISH[0]: yaw = 12 * ease(seg(f, FISH[0], FISH[0] + 6))
    if f >= ON["fish_seen"] + 6: yaw = lerp(12, -38, ease(seg(f, ON["fish_seen"] + 6, ON["fish_seen"] + 20)))
    if f >= 3612: yaw = -38 * (1 - ease(seg(f, 3612, 3650)))
    if f >= ON["sit"]: yaw = 0.
    if f >= ON["laugh"] + 4: yaw = -32 * ease(seg(f, ON["laugh"] + 4, ON["laugh"] + 12)) * (1 - ease(seg(f, 3806, 3836)))
    nk += 6 * ease(seg(f, ON["laugh"], ON["laugh"] + 6)) * (1 - ease(seg(f, ON["w5"], ON["w6"])))
    st["neck"] = (nk, yaw)
    if ON["laugh"] <= f < ON["w6"]:
        sh = 6 * math.sin((f - ON["laugh"]) / 1.9 + .8) * (1 - seg(f, ON["w4"], ON["w6"]))
        st["shL"] = (st["shL"][0], st["shL"][1] + sh); st["shR"] = (st["shR"][0], st["shR"][1] - sh)
    return st

brim = bpy.data.objects["CL_seller_brim"]
clouds = [bpy.data.objects[f"CL_sr_cloud{i}"] for i in range(5)]
CLOUD0 = [Vector(c.location) for c in clouds]
for f in range(F0, ON["outro"]):
    pose(K, f, **keeper_state(f)); pose(S, f, **seller_state(f))
    # the real world never repeats: the flower in the wind, her brim lifting, the waves, the sun and its halo, the clouds
    t = f / 24.0
    key(handFlowerK, f, rot=(R(2.5 * math.sin(f / 9.1)), R(-60 + 4 * math.sin(f / 7.3) + 3 * math.sin(f / 11.9)), 0))
    key(sandFlower, f, rot=(R(3 * math.sin(f / 8.7 + 1)), R(2.5 * math.sin(f / 6.9) + 2 * math.sin(f / 13.1)), 0))
    key(brim, f, rot=(R(2.5 * math.sin(f / 13.7) + 1.5 * math.sin(f / 8.3)), R(1.2 * math.sin(f / 10.3) + 1.8 * math.sin(f / 6.1)), 0))
    key(seaOb, f, loc=(0, 0, wave_z(f)))
    for o in extra:
        if "sea7" in o.name: key(o, f, loc=(0, 0, wave_z(f)))
    z = sun_z(f)
    key(sunOb, f, loc=(SUNP.x, SUNP.y, z))
    hs = 1 + .32 * ease(seg(f, 3504, 3760))
    key(haloOb, f, loc=(HALO0.x, HALO0.y, HALO0.z + (z - SUNP.z) * .82), scale=(hs, hs, hs))
    for i, c in enumerate(clouds):
        key(c, f, loc=(CLOUD0[i].x, CLOUD0[i].y + (.25 + .09 * i) * (t - F0 / 24.0) * (1 if i % 2 else -1), CLOUD0[i].z))
    sld.energy = 3200 * ease(seg(f, F0, 3620)); sld.keyframe_insert("energy", frame=f)
# the fish: up out of the sun path and back in
vis(fish, FISH[0], True); vis(fish, FISH[1] + 1, False)
for f in range(FISH[0], FISH[1] + 1):
    u = seg(f, FISH[0], FISH[1]); x = WX + 8.6 + 1.4 * u
    key(fish, f, loc=(x, line_y(x) - .3, SANDZ - .05 + 1.0 * 4 * u * (1 - u)), rot=(0, R(-48 + 96 * u), R(4)))
# the flower goes into the sand on the cut to the sit (his hand flower off, the sand flower on)
vis(handFlowerK, ON["sit"], False); vis(sandFlower, ON["sit"], True)

# ---------- faces: wonder -> tender on the fish seen -> laugh 157.09 -> tender (quiet) by 3800; both highlights on ----------
def face(d, f, name, hl=None):
    for n, g in d["F"].items():
        if n == "hl": continue
        vis(g, f, n == name)
    if hl is not None: vis(d["F"]["hl"], f, hl)
for d, off in ((K, 0), (S, 3)):
    W.face_default(d["F"], F0, "wonder", hl=True)
    face(d, ON["fish_seen"] + off, "tender"); face(d, ON["laugh"] + off, "laugh"); face(d, 3800 + off, "tender")

# ==================================================================================================
# the outro: back in the game, pixelated, fixed noon. The stall empty, the apron on its hook, a hero at the counter.
# ==================================================================================================
OUTRO = ON["outro"]
W.village_loops(OUTRO, F1, keeper_home=False)
for f in range(OUTRO, F1 + 1):                   # the two who left: parked; the seller's loop re-keyed away
    pose(K, f, W.PARK, 0); pose(S, f, W.PARK, 0)
vis(W.potFlower, OUTRO, False)                   # her pot stayed empty (act 6)
vis(W.wallSword, F0, False)                      # the sword is gone and nothing pops into its place
apronHook = RW.blocks("apronHook", [((.05, .5, .6), (0, 0, -.3)), ((.03, .35, .18), (0, 0, .1))], RW.mat("apronProp", "#f6f0e2", .03, 44, texel=.05))
apronHook.location = (.70, 1.2, 1.2); apronHook.rotation_euler = (0, 0, R(90))
vis(apronHook, F0, False); vis(apronHook, OUTRO, True)
COUNTER_SPOT = (.8, -.95)
def hero_state(f):
    w = 4 * math.sin((f - OUTRO) / 11.0)                                      # the scripted shift of weight (rails)
    turn = ease(seg(f, 3900, 3940))                                           # the head turns toward the edge of the map
    return dict(pos=(COUNTER_SPOT[0], COUNTER_SPOT[1], 0), yaw=112, hips=(w, -w), shL=(8, 0), shR=(-6, 0), neck=(2 * turn, -78 * turn))
for f in range(OUTRO, F1 + 1):
    pose(W.heroes[0], f, **hero_state(f))
    for h in W.heroes[1:]: pose(h, f, W.PARK, 0)
# light and skies: noon, the sky cards back, the far set gone (the village shots see no SR)
W.light(OUTRO, "noon")
vis(W.skyEnd, OUTRO, True); vis(W.skyWest, OUTRO, True); vis(W.skySouth, OUTRO, True)
for ob in [W.wallLo, W.wallHi, W.rimLo, W.rimHi] + W.SR + extra + [fish, sandFlower, canGrid]: vis(ob, OUTRO, False)
for ld, e in ((fd, 700), (sld, 3200)):
    ld.energy = e; ld.keyframe_insert("energy", frame=OUTRO - 1); ld.energy = 0; ld.keyframe_insert("energy", frame=OUTRO)

# ==================================================================================================
# shots (cut on the line onsets)
# ==================================================================================================
shot = W.shot
def keyed_lens(cam, keys):
    for f, L in keys:
        cam.data.lens = L; cam.data.keyframe_insert("lens", frame=f)

# s1 3396-3554: the sketch's s5b framing (through the crack, the rim rising), one continuous push that arrives at the
# approved "cross" composition on 3504 and drifts on past it; lens 35 -> 30
S5B_L, S5B_T = CAM5 + Vector((-.35, -.05, 0)), Vector((WX, Y5 + .1, 1.0))
CROSS_L, CROSS_T = Vector((WX - 4.2, Y5 - 1.1, 1.75)), Vector((WX + 2.6, Y5 + .05, 1.0))
def track1(f):
    u = ease(seg(f, F0, 3504)); v = ease(seg(f, 3504, 3554))
    l = S5B_L.lerp(CROSS_L, u) + Vector((.3, .1, -.03)) * v
    t = S5B_T.lerp(CROSS_T, u) + Vector((.6, .05, 0)) * v
    return tuple(l), tuple(t)
cam1 = shot("s1", F0, ON["sharp"] - 1, None, None, None, None, 35, track=track1)
keyed_lens(cam1, [(F0, 35), (3504, 30)])

# s2 3555-3732: the crane: from behind them, low, rising slowly over the real shore to z 6 as the sun clears the sea;
# the two of them slip out of the bottom of the frame, the sunrise fills it. Near the CAM5 -> SUNP line.
def track2(f):
    u = seg(f, ON["sharp"], ON["sit"] - 1); u = u * u * (3 - 2 * u) * .6 + u * .4
    l = (WX - .7 + 1.0 * u, Y5 + .3 - .6 * u, 1.45 + 4.6 * u)          # starts just left of the sun line: they stand right of the path
    t = (WX + 6.5 + 22 * u, Y5 - .3 + 2.9 * u, .55 - 1.0 * u)
    return l, t
shot("s2", ON["sharp"], ON["sit"] - 1, None, None, None, None, 30, track=track2)

# s3 3733-3769: low on the sand from behind-left, the two of them sitting, the flower in the sand between them, lens 40
shot("s3", ON["sit"], ON["laugh"] - 1, (WX + 1.0, yk + 1.7, -.35), (WX + 1.15, yk + 1.6, -.33), (WX + 5.5, yk + .3, -.2), (WX + 5.5, yk + .25, -.22), 32)
# s4 3770-3809: from the water, low, their faces: the laugh, the glowing crack and the dark wall behind them, lens 40
shot("s4", ON["laugh"], ON["w6"] - 1, (WX + 6.4, yk + 1.5, -.25), (WX + 6.2, yk + 1.3, -.2), (WX + 3.6, yk - .05, -.55), (WX + 3.6, yk - .05, -.5), 40)
# s5 3810-3853: the last real image: wide from the crack mouth (the gold rims at the frame's sides, the cross still's echo),
# the two of them small on the sand, the sun up, lens 26
shot("s5", ON["w6"], OUTRO - 1, (WX - 2.2, Y5 - .6, 2.4), (WX - 2.0, Y5 - .55, 2.55), (WX + 10, Y5 + .3, -.1), (WX + 11, Y5 + .35, -.15), 26)
# s6 3854-3980: act 1's s1 framing with a slow push in; hold to the end (the encode fades the last second)
shot("s6", OUTRO, F1, (-2.1, -7.4, 2.25), (-1.55, -6.45, 2.1), (.15, 0, 1.3), (.2, .05, 1.3), 35)

# ---------- the pixel look: the game at 6, the real world sharp, the two of them 6 -> 4 -> 2 -> sharp as they cross
# (her first, both sharp on 148.14), and back to 6 for the outro (the village sees no SR, so the sharp group is moot there)
pixel_groups([(F0, 6)], [(REAL_SHARP, 1),
                         (names(K), [(F0, 6), (3480, 4), (3530, 2), (ON["sharp"], 1), (OUTRO, 6)]),
                         (names(S), [(F0, 6), (3470, 4), (3515, 2), (ON["sharp"], 1), (OUTRO, 6)])])
W.finish_steps()
print("ACT7 shots:", W.SHOTS, "yk", round(yk, 3), "sun", tuple(round(v, 1) for v in SUNP), "r", round(SUNRAD, 1))
run(OUT)
