# Respawn: the four key stills of plan 2, one per run, before any act gets built (STORYBOARD-respawn.md).
#   blender -b --factory-startup --python respawn_stills.py -- --still pond|line|tile|cross
# Stills land in out/film/respawn/stills/<name>.png. Each one poses the cast for its moment, picks the light state and
# the pixel groups, and renders one frame. Nothing here is act animation; the acts re-pose from the storyboard.
import bpy, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
sys.path.insert(0, HERE)
import respawn_world as RW
from respawn_world import R, ease, seg, lerp, swing
from film_kit import pixel_groups, shot_camera, cut, key

OUT = os.path.join(HERE, "out", "film", "respawn")
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
STILL = argv[argv.index("--still") + 1] if "--still" in argv else "pond"
FRAME = dict(pond=1800, line=2316, tile=2724, cross=3504)[STILL]

W = RW.build(FRAME - 1, FRAME + 1, OUT)
f = FRAME
EDGE, WEST, VOIDZ, WX, Y5, PC = W.EDGE, W.WEST, W.VOIDZ, W.WX, W.Y5, W.PC
K, S, FI, G = W.keeper, W.seller, W.fisher, W.guard
vis, pose, sit, light = W.vis, W.pose, W.sit, W.light
names = lambda d: [o.name for o in [d["root"]] + list(d["root"].children_recursive) if o.type == "MESH"]

# the village on its loop, in every still that shows it
def village_loop():
    # the fisher on the dock's end, the Mayor reading, the seller watering, the guard on his beat
    sit(FI, f, (PC[0] - 2.5, PC[1] - .45, .12), 0, lean=2, neck=(8, 0), shL=(0, -20), shR=(0, -62))
    pose(W.mayor, f, (W.HOUSES[2][0] - .2, W.HOUSES[2][1] - W.HOUSES[2][3] / 2 - .5, W.HOUSES[2][4] - .22), -90, neck=(16, 0), shL=(0, -70), shR=(0, -64))
    pose(S, f, (W.FS[0] - .9, W.FS[1] + .1, 0), -20, lean=3, neck=(10, 0), shL=(0, -10), shR=(0, -70))
    pose(G, f, (26.5, -1.6, 0), 0, shL=(6, 0), shR=(-8, 0))
    for i in range(3): pose(W.heroes[i], f, W.PARK, 0)

if STILL == "pond":
    # act 3, ~75 s: he leans over the fishless pond from the dock; his reflection is the only sharp thing in the village
    village_loop()
    light(f, "noon")
    kx, ky = PC[0] - 2.35, PC[1] + .4
    pose(K, f, (kx, ky, .12), 0, lean=26, neck=(22, 0), shL=(0, -44), shR=(0, -40))
    W.face_default(K["F"], f, "doubt", hl=True)
    # the reflection lies on the surface as a flat image under his head: the head turned face-up, squashed onto the water
    hx, hy, _ = W.world_at(K["head"], f)
    rr = W.refl["root"]; vis(rr, f, True)
    key(rr, f, loc=(hx + .15, hy, .03), rot=(0, 0, 0), scale=(1.5, 1.5, .14))
    key(W.refl["neck"], f, rot=(0, R(-90), 0))
    cam = shot_camera("pond", (PC[0] + 1.9, PC[1] + 3.1, 2.0), (kx + .9, ky - .1, .45), lens=40); cut(f - 1, cam)
    pixel_groups([(f - 1, 6)], [(W.REFL_NAMES, 1)])

elif STILL == "line":
    # act 4, ~96.5 s: the guard line across the road turns out to be boards; he has just walked through the middle one
    village_loop()
    light(f, "noon")
    vis(W.skyEnd, f, True)
    line = [G] + W.guards
    for i, g in enumerate(line):
        y = -3.6 + 1.0 * i
        vis(g["root"], f, True)
        pose(g, f, (30.0, y, 0), 180, shL=(6, 0), shR=(-8, 0))
        if i > 0: W.board(g, f, True)
    # the one he pushed through tips away from him, down the road
    mid = line[2]; W.board(mid, f, True)
    key(mid["root"], f, loc=(30.05, -1.6, 0), rot=(0, R(-42), R(180)))
    s_, bob = swing(.9)
    pose(K, f, (30.85, -1.55, bob), 0, lean=2, neck=(-4, 0), hips=(s_, -s_), shL=(9, -s_ * .6), shR=(-9, s_ * .6))
    W.face_default(K["F"], f, "flat", hl=True)
    cam = shot_camera("line", (33.4, -6.8, 1.15), (30.3, -1.3, .9), lens=36); cut(f - 1, cam)
    pixel_groups([(f - 1, 6)], [])

elif STILL == "tile":
    # act 5, ~113.5 s: the camera turns back: the whole village is one tile on the grid, its sky a card on one side
    village_loop()
    light(f, "edge")
    vis(W.skyEnd, f, False); vis(W.skyWest, f, False)
    pose(K, f, (EDGE + 6.5, -22.5, VOIDZ), 160, lean=-2, neck=(6, 0), shL=(4, 0), shR=(-4, 0))
    W.face_default(K["F"], f, "flat", hl=True)
    cam = shot_camera("tile", (EDGE + 24.5, -31.0, 9.0), (8.0, 1.0, 0.5), lens=30); cut(f - 1, cam)
    pixel_groups([(f - 1, 6)], [])

elif STILL == "cross":
    # act 7, ~146 s: through the open crack, the two of them step onto the real shore and the pixels leave them
    light(f, "void", crack=1.0)
    vis(W.skyEnd, f, False); vis(W.skyWest, f, False)
    for ob in [W.wallLo, W.wallHi, W.rimLo, W.rimHi] + W.SR: vis(ob, f, True)
    W.crack_open(f, 1.5)
    # a warm fill from the shore so their backs read against the sun
    fd = bpy.data.lights.new("CL_shoreFill", "POINT"); fd.energy = 700; fd.color = RW.hex_lin("#ffc48a"); fd.shadow_soft_size = 1.5
    fl = bpy.data.objects.new("CL_shoreFill", fd); W.scene.collection.objects.link(fl); fl.location = (WX - 1.2, Y5 - 2.4, 3.2)
    yk = Y5 + W.crack_c(.75)
    sK, bK = swing(1.1); sS, bS = swing(.6)
    pose(K, f, (WX + 1.3, yk - .5, VOIDZ - .3 + bK), 0, lean=1, neck=(-6, 0), hips=(sK, -sK), shL=(9, -sK * .6), shR=(-9, sK * .6))
    pose(S, f, (WX + 2.1, yk + .45, VOIDZ - .3 + bS), 0, lean=1, neck=(-10, 8), hips=(sS, -sS), shL=(9, -sS * .6), shR=(-9, sS * .6))
    vis(S["flower"], f, True); vis(S["can"], f, False)
    W.face_default(K["F"], f, "wonder", hl=True); W.face_default(S["F"], f, "wonder", hl=True)
    cam = shot_camera("cross", (WX - 4.2, Y5 - 1.1, 1.75), (WX + 2.6, Y5 + .05, 1.0), lens=30); cut(f - 1, cam)
    pixel_groups([(f - 1, 6)], [([o.name for o in W.SR], 1), (names(K), 4), (names(S), 2)])

W.finish_steps()
os.makedirs(os.path.join(OUT, "stills"), exist_ok=True)
W.scene.frame_set(f)
W.scene.render.filepath = os.path.join(OUT, "stills", f"{STILL}_f{f:05d}.png")
bpy.ops.render.render(write_still=True)
print("STILL", STILL, W.scene.render.filepath)
