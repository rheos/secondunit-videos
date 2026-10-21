# Respawn act 0: the world loads (song 0.0-21.0 s, frames 0-503). STORYBOARD-respawn.md, act 0.
# 0-5.5 (harmonica alone): black, a voxel loading bar fills; then the village assembles over the dark grid, block
# groups dropping into place from above (ground, pond, houses, the balcony, trees, fences and flowers, the stall
# last), the sky wall slides in from the east like a stage flat, the three clouds and the noon light snap on.
# 5.5-12.5: fixed noon, every NPC spawns on its loop, the stall shutters down, the keeper not there yet.
# 12.5 (frame 300, the drums): the shutter flies up and the shopkeeper is standing there already, scripted face; the
# price tag swings on the wall sword. 16-21: the flower seller waves on cue, he waves back the same wave, the same
# count; the last shot drifts into act 1's s1 framing. Nobody is on the path at 503.
#
#   tools/render_lock.sh blender -b --factory-startup --python respawn_act0.py -- --stills 20,44,70,100,120,150
#   tools/render_lock.sh blender -b --factory-startup --python respawn_act0.py -- --render
# Frames land in out/film/respawn/act0/frames/ (named by song frame). Built on the act-1 template.
import bpy, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
sys.path.insert(0, HERE)
import respawn_world as RW
from respawn_world import R, ease, seg, lerp, clamp, swing, polyline, plen, angle_lerp, PARK
from film_kit import pixel_groups, sec, key, run

F0, F1 = 0, 503
OUT = os.path.join(HERE, "out", "film", "respawn", "act0")
W = RW.build(F0, F1, OUT)
vis, pose = W.vis, W.pose
SK, F = W.keeper, W.keeper["F"]

LOAD_END = 45           # the loading bar, frames 0-45 (black)
BUILT = 133             # the village is complete and its loops start (5.5 s)
SNAP = 126              # the clouds, the far sky cards and the noon light snap on
DRUMS = 300             # 12.5 s: the shutter flies up

# ==================================================================================================
# the loading screen: a black card far above the village, a voxel bar that fills with stutters
# ==================================================================================================
LZ = 300.0
black = W.grad_mat("black", [(0, "#000000"), (1, "#000000")], 2, 0, 1)
W.plane("loadCard", [(-30, 4, LZ - 30), (30, 4, LZ - 30), (30, 4, LZ + 30), (-30, 4, LZ + 30)], black)
cellM = RW.mat("loadcell", "#8fe3ff", .04, 50, texel=.03, emit=2.2)
frameM = RW.mat("loadframe", "#5a6a78", .03, 51, texel=.03, emit=.7)
labelM = RW.mat("loadlabel", "#9fb0bd", .03, 52, texel=.03, emit=.9)
BW, BH, NC = 2.0, .14, 20
for nm, size, loc in (("loadTop", (BW + .08, .04, .03), (0, 0, LZ + BH / 2 + .035)), ("loadBot", (BW + .08, .04, .03), (0, 0, LZ - BH / 2 - .035)),
                      ("loadL", (.03, .04, BH + .1), (-BW / 2 - .025, 0, LZ)), ("loadR", (.03, .04, BH + .1), (BW / 2 + .025, 0, LZ))):
    RW.box(nm, size, loc, frameM)
CELLS = []
for k in range(NC):
    x = -BW / 2 + (k + .5) * BW / NC
    CELLS.append(RW.box(f"loadCell{k}", (BW / NC - .012, .04, BH - .03), (x, 0, LZ), cellM))
# a label under the bar: three dashes of "text" and a blinking cursor block
for i, w in enumerate((.3, .18, .22)):
    RW.box(f"loadText{i}", (w, .04, .035), (-BW / 2 + .15 + i * .34, 0, LZ - .24), labelM)
cursor = RW.box("loadCursor", (.04, .04, .05), (-BW / 2 + 1.0, 0, LZ - .24), cellM)
# the fill: eight cells quick, a stall, then the rest; the same every time
CELL_AT = [6 + int(k * 1.5) for k in range(8)] + [26 + int((k - 8) * 1.2) for k in range(8, NC)]
for k, c in enumerate(CELLS):
    vis(c, F0, False); vis(c, CELL_AT[k], True); vis(c, LOAD_END + 1, False)
for ob in list(bpy.data.objects):
    if ob.name.startswith("CL_load") and not ob.name.startswith("CL_loadCell"):
        vis(ob, F0, True); vis(ob, LOAD_END + 1, False)
for f in range(F0, LOAD_END + 1):                       # the cursor blinks on a 12-frame count
    vis(cursor, f, (f // 6) % 2 == 0 and f < CELL_AT[-1] + 3)

# ==================================================================================================
# the village assembles: top-level set pieces drop from z + 25 on a schedule, grouped by what they are
# ==================================================================================================
HOUSE_ORDER = [7, 6, 0, 1, 2, 3, 4, 5]                  # west to east
STALL_AT = dict(counter=108, counterTop=110, backWall=111, awning=114, crate1=115, crate2=116, barrel=116, barrelBand=117,
                wallSword=118, shutter=119)
def drop_frame(n):
    """the song frame a set piece starts its drop, or None if it is not a set piece"""
    if n in ("dirt", "dirtTop", "grassTop", "path"): return dict(dirt=46, dirtTop=49, grassTop=52, path=55)[n]
    if n in ("pondBed", "pondRim", "pondWater"): return dict(pondBed=58, pondRim=60, pondWater=62)[n]
    if n.startswith("dockPlank"): return 64 + int(n[9:])
    if n.startswith("dockPost"): return 64
    if n.startswith("house"):
        i = int(n[5]); part = n.split("_", 1)[1]; base = 66 + 3 * HOUSE_ORDER.index(i)
        if part.startswith("roof"): return base + 1 + int(part[4])
        if part == "chim": return base + 5
        return base + (2 if part != "walls" else 0)
    if n == "balcony": return 92
    if n.startswith("tree"):
        i = int(n[4:].split("_")[0]); part = n.split("_", 1)[1]
        return 82 + int(1.5 * i) + dict(trunk=0, crown=1, top=2)[part]
    if n == "fence": return 102
    if n.startswith("flowers_"): return dict(flowR=104, flowY=106, flowW=108)[n[8:]]
    if n == "signPole": return 106
    if n == "pennant": return 108
    if n.startswith("edgeSign"): return dict(Post=108, Board=109, Bar=110)[n[8:]]
    if n.startswith("fs_"): return 98 + (2 if n == "fs_table" else 4 if n == "fs_pot" else 0)
    if n == "potFlower": return 104
    if n in STALL_AT: return STALL_AT[n]
    if n.startswith("post"): return 112
    if n.startswith("peg"): return 117
    return None

SKIP = ("cam_", "tgt_", "keeper", "seller", "fisher", "mayor", "guard", "hero", "refl", "prompt", "bird", "fish", "rodFloat",
        "void", "wallLo", "wallHi", "rimLo", "rimHi", "sr_", "sky", "vcloud", "flySword", "sun", "spill", "glow", "load")
DROP_D = 10
dropped = []
for ob in list(bpy.data.objects):
    if ob.parent is not None or not ob.name.startswith("CL_"): continue
    n = ob.name[3:]
    if any(n.startswith(s) for s in SKIP): continue
    d0 = drop_frame(n)
    if d0 is None:
        print("ACT0 WARNING: set piece with no drop schedule:", n); continue
    rest = ob.location.copy(); dropped.append((n, d0))
    vis(ob, F0, False); vis(ob, d0, True)
    for f in range(d0, d0 + DROP_D + 1):
        u = seg(f, d0, d0 + DROP_D)
        key(ob, f, loc=tuple(rest + Vector((0, 0, 25 * (1 - u * u)))))      # gravity: slow off the top, a hard landing
print("ACT0 dropped", len(dropped), "pieces; last lands", max(d + DROP_D for _, d in dropped))

# the sky wall slides in from the east like a stage flat, its two props with it; the far cards and the clouds snap on
SLIDE = (104, 122)
for ob in [W.skyWall] + [bpy.data.objects[f"CL_skyProp{i}"] for i in range(2)]:
    rest = ob.location.copy()
    for f in range(SLIDE[0], SLIDE[1] + 1):
        key(ob, f, loc=tuple(rest + Vector((88 * (1 - ease(seg(f, *SLIDE))), 0, 0))))
    vis(ob, F0, False); vis(ob, SLIDE[0], True)
for ob in (W.skyEnd, W.skyWest, W.skySouth): vis(ob, F0, False); vis(ob, SNAP, True)
for i in range(5):
    c = bpy.data.objects[f"CL_vcloud{i}"]; vis(c, F0, False); vis(c, SNAP, True)

# ==================================================================================================
# the loops: nothing moves until the village is built; then every NPC spawns with a 2-frame pop onto its rails
# ==================================================================================================
W.village_loops(BUILT, F1, keeper_home=False)
NPCS = [W.seller, W.fisher, W.mayor, W.guard]
for d in NPCS:
    pose(d, BUILT - 1, PARK, 0)
    vis(d["root"], F0, False); vis(d["root"], BUILT, True)
    for f, s in ((BUILT - 1, .01), (BUILT, .35), (BUILT + 1, 1.15), (BUILT + 2, 1.0)): key(d["root"], f, scale=(s, s, s))
vis(W.seller["flower"], BUILT, False)                    # the spawn showed her whole tree; the hand flower stays put away
for ob in (W.fish, W.rodFloat, W.bird):
    key(ob, F0, loc=PARK); key(ob, BUILT - 1, loc=PARK)
    vis(ob, F0, False); vis(ob, BUILT, True)
for h in W.heroes: pose(h, F1, PARK, 0)                  # nobody on the path at the hand-off

# ---------- the shopkeeper: parked until the drums, then home, then the answering wave ----------
SK_HOME = (-.6, .85)
SELLER = (W.FS[0] - .95, W.FS[1] + .05)
WAVE = (388, 424)                                        # hers is 384-420; his answers four frames later, the same count
def keeper_state(f):
    if f < DRUMS: return None
    st = dict(pos=(SK_HOME[0], SK_HOME[1], .006 * math.sin(f / 9.0)), yaw=-82, lean=0, neck=(0, 0), shL=(9, 0), shR=(-9, 0), hips=(0, 0))
    if 378 <= f <= 436:                                  # he looks across at her for the wave
        dx, dy = SELLER[0] - SK_HOME[0], SELLER[1] - SK_HOME[1]
        want = clamp(math.degrees(math.atan2(dy, dx)) - st["yaw"], -55, 55)
        u = ease(seg(f, 378, 386)) * (1 - ease(seg(f, 428, 436)))
        st["neck"] = (3 * u, want * u)
    if WAVE[0] <= f <= WAVE[1]:                          # the same wave as hers: up a quarter, two beats of wag, down a quarter
        u = seg(f, *WAVE); up = ease(seg(u, 0, .25)) * (1 - ease(seg(u, .75, 1.0)))
        wag = 14 * math.sin((f - WAVE[0]) / 2.0) * up
        st["shL"] = (9 + 141 * up + wag, 0)
    return st

for f in range(F0, F1 + 1):
    st = keeper_state(f)
    if st: pose(SK, f, **st)
    else: pose(SK, f, PARK, 0)
W.seller_wave(384, 420)

# ---------- faces: scripted all act; nobody gets the highlight ----------
W.face_default(F, F0, "scripted")
W.face_default(W.seller["F"], F0, "scripted")

# ---------- the shutter flies up on the drums; the price tag swings on the wall sword ----------
sh = W.shutter
key(sh, DRUMS - 1, loc=(0, 0, 0))
for f in range(DRUMS, DRUMS + 7): key(sh, f, loc=(0, 0, 2.6 * ease(seg(f, DRUMS, DRUMS + 6))))
vis(sh, DRUMS + 7, False)
tag = W.tag
for f in range(F0, F1 + 1):
    a = 24 * math.sin((f - DRUMS) / 2.4) * math.exp(-(f - DRUMS) / 40.0) if f >= DRUMS else 0.0
    key(tag, f, rot=(0, R(a), 0))

# ---------- light: dark while the world loads (one state), noon from the snap, fixed ----------
W.light(F0, "edge")
W.light(SNAP, "noon")

# ---------- shots ----------
shot = W.shot
shot("s0", 0, LOAD_END, (0, -3.0, LZ), (0, -3.0, LZ), (0, 0, LZ), (0, 0, LZ), 50)                        # the loading bar
shot("s1", LOAD_END + 1, BUILT - 1, (-17, -31, 13.5), (-15.5, -29.5, 12.5), (3, 3, 1), (3, 3, 1.2), 24)   # the tile assembles over the grid
shot("s2", BUILT, 176, (-9.5, -13.5, 5.2), (-9, -13, 5), (0, 3, 1.2), (0, 3, 1.2), 28)                   # noon: the square, the stall shut, everyone spawns
shot("s3", 177, 212, (3.6, -12.6, 3.1), (4.0, -12.3, 3.0), (10.5, -6.0, .2), (10.6, -6.0, .2), 35)        # the pond: the fisher casts, the fish laps
shot("s4", 213, 248, (3.0, -1.8, 1.3), (3.1, -1.9, 1.3), (4.5, 5.7, 4.4), (4.5, 5.7, 4.3), 30)            # the Mayor reads; the bird crosses above
shot("s5", 249, DRUMS - 1, (17, -4.6, 1.7), (17.6, -4.5, 1.7), (30, 2, 1.2), (30, 2, 1.2), 28)            # the guard's four steps; the map-edge sign far right
shot("s6a", DRUMS, 335, (-.2, -4.8, 1.55), (-.15, -4.6, 1.55), (0, .6, 1.45), (0, .6, 1.45), 40)          # the shutter flies up: he was always there
shot("s6b", 336, 383, (2.0, .25, 1.5), (1.95, .3, 1.48), (.7, 1.235, 1.0), (.7, 1.235, 1.0), 50)           # the tag swinging on the sword
shot("s7a", 384, 403, (-9.0, -6.8, 1.9), (-8.8, -6.65, 1.85), (-.6, .6, 1.3), (-.6, .6, 1.3), 35)          # over her shoulder: she waves on cue, he starts his
shot("s7b", 404, 440, (-1.9, -4.7, 1.6), (-1.8, -4.6, 1.6), (-.5, .6, 1.4), (-.5, .6, 1.4), 40)            # his answering wave, the same count
shot("s8", 441, F1, (-2.6, -8.0, 2.45), (-2.1, -7.4, 2.25), (.1, 0, 1.3), (.15, 0, 1.3), 35)               # drifts into act 1's s1 framing

pixel_groups([(F0, 6)], [])
W.finish_steps()
print("ACT0 shots:", W.SHOTS)
run(OUT)
