# The pet, whole song: six key stills from STORYBOARD-pet.md, for Robin's go before any act is built.
#   tools/render_lock.sh blender -b --factory-startup --python pet_stills.py -- --only A,B,C,D,E,F
# Stills land in out/film/pet/stills/pet-still-<id>_f<song frame>.png. Each still poses the world directly
# (pet_world.pose_man / pose_dog / pile_items / light_mode); the acts will key the same dicts.
import bpy, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pet_world as W
from pet_world import R, Vector, M, MAN, DOG, small, SPR, vis, scene

OUT = os.path.join(W.HERE, "out", "film", "pet", "stills"); os.makedirs(OUT, exist_ok=True)
scene.eevee.taa_render_samples = 64
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ONLY = argv[argv.index("--only") + 1].split(",") if "--only" in argv else list("ABCDEF")

# screens on the small toy that take 06 didn't have
S_EGG = W.screen("stoy_egg", [(W.EGG, 9, 5)], small)
S_WALK = W.screen("stoy_walk", W.WALK_SCREEN, small)
SCREENS = dict(SPR, egg=S_EGG, walk=S_WALK)
LCD = bpy.data.objects["CL_stoy_lcd"]
GLOW = W.lcd_glow((0, 0, 0), 0)
SMILE = W.box("man_smile", (.03, .14, .03), (.19, 0, .1), M["smile"], MAN["neck"])
BATT = W.blocks("battHeld", [((.1, .025, .1), (0, 0, 0))], M["cell"])
FLOOR_TOY = W.toy("ftoy"); FLOOR_TOY.scale = (.045,) * 3
PLANTS = {0.0: W.PLANT, .65: W.sill_plant(.65)}
HIDE_IN_PARK = [W.blanket]

def lcd(name, grey=False):
    for n, ob in SCREENS.items(): vis(ob, n == name)
    LCD.data.materials[0] = M["lcdgrey"] if grey else M["lcd"]

def plant(d):
    for k, ob in PLANTS.items(): vis(ob, k == d)

def sun_dir(v):
    W.sunob.rotation_euler = Vector(v).normalized().to_track_quat('-Z', 'Y').to_euler()

def lights(mode, sun=(.55, -1.0, -.72)):
    if "CL_lamp" in bpy.data.objects: bpy.data.objects.remove(bpy.data.objects["CL_lamp"])
    W.light_mode(mode)
    if mode != "park": sun_dir(sun)

def reset():
    vis(MAN["root"], True); vis(DOG["root"], True); vis(small, True); vis(FLOOR_TOY, False)
    vis(W.c_leash, False); vis(W.c_ball, False); vis(SMILE, False); vis(BATT, False); vis(W.blanket, False)
    vis(W.battery_tbl, False); W.pile_items(0); plant(0.0); lcd("idleA"); GLOW.data.energy = 0
    W.pose_man(); W.pose_dog((4.0, .9), 180, W.STAND)

def glow_at_toy(energy):
    bpy.context.view_layer.update()
    GLOW.location = small.matrix_world @ Vector((0, -2.5, .3)); GLOW.data.energy = energy

def render(sid, t):
    fr = W.sec(t); bpy.context.view_layer.update()
    scene.render.filepath = os.path.join(OUT, f"pet-still-{sid}_f{fr:05d}.png")
    bpy.ops.render.render(write_still=True)
    print(f"[pet] still {sid} at {t} s -> {scene.render.filepath}")

# A, 8.0: blue dawn. He's asleep on the couch with the toy on his chest; the dog at the window watches the park.
def still_A():
    reset(); lights("dawn", sun=(.9, -1.0, -.35))
    W.pose_man(x=1.0, y=2.45, z=.68, pitch=-90, hd=0, pz=.55, hip=0, knee=12, lean=0, np=-8, ny=-20,
               shL=(-10, -40), shR=(10, -40), elL=-110, elR=-110, blink=.12)
    chest = MAN["torso"].matrix_world @ Vector((0, 0, .38))
    small.parent = None; small.location = chest + Vector((0, 0, .2)); small.rotation_euler = (R(-90), 0, R(-90))
    lcd("egg"); glow_at_toy(4.0)
    W.pose_dog((-2.05, 2.25), 90, W.SIT, wag=0)
    DOG["neck"].rotation_euler = (0, R(-8), 0)
    W.still_camera("A", (.9, -1.1, .95), (-1.0, 2.4, 1.0), 28)
    render("A", 8.0)

# B, 58.5: night in the time-lapse. The LCD lights his face; the dog sleeps on the growing pile on the mat.
def still_B():
    reset(); lights("night"); plant(.65); W.pile_items(4)
    bpy.data.objects["CL_fill"].data.energy = 150
    W.pose_man(np=26)
    W.toy_in_hands(small); lcd("idleB"); glow_at_toy(1.8)
    W.pose_dog((W.MAT.x + .05, W.MAT.y + .02), 200, W.CURL, z=.11, shut=True)
    W.still_camera("B", (3.3, .55, .55), (1.75, 2.45, .55), 26)
    render("B", 58.5)

# C, 90.0: the walk that isn't. His point of view: the WALK screen in his hands; past his knees, the real dog with the real leash.
def still_C():
    reset(); lights("day")
    W.pose_man(np=30, ny=-4)
    toy = W.toy_in_hands(small); lcd("walk"); glow_at_toy(1.0)
    W.pose_dog((.74, .72), 90, W.SIT); vis(W.c_leash, True)
    DOG["neck"].rotation_euler = (0, R(-26), R(4))
    eye = (MAN["eyes"][0].matrix_world.translation + MAN["eyes"][1].matrix_world.translation) / 2
    for ob in MAN["neck"].children_recursive: ob.hide_render = True          # his point of view
    mouth = DOG["mouth"].matrix_world.translation
    cam_at = eye + Vector((.02, .38, .42))
    n = (cam_at - toy).normalized(); up = Vector((0, -1, 0)); up = (up - n * up.dot(n)).normalized()
    yax = -n; xax = yax.cross(up)
    small.matrix_world = W.Matrix((xax, yax, up)).transposed().to_4x4() @ W.Matrix.Diagonal((.045, .045, .045, 1))
    small.location = toy
    W.still_camera("C", cam_at, toy.lerp(mouth, .4), 26)
    render("C", 90.0)

# D, 127.0: lamp light, kneeling at the mat, eye to eye with the dog, the battery between finger and thumb.
def still_D():
    reset(); lights("lamp"); W.pile_items(2)
    vis(small, False)
    W.pose_man(x=1.08, y=2.3, hd=0, pz=.56, hip=-4, knee=92, lean=26, np=-10, shL=(-8, -10), shR=(6, -70), elL=-12, elR=-48)
    W.pose_dog((2.72, 2.32), 182, W.STAND, z=.04); vis(W.c_leash, True)
    DOG["neck"].rotation_euler = (0, R(-12), 0)
    hand = MAN["handR"].matrix_world.translation
    vis(BATT, True); BATT.location = hand + Vector((.07, -.09, .05)); BATT.rotation_euler = (0, 0, 0)
    W.still_camera("D", (2.0, -.75, .95), (2.0, 2.3, 1.05), 28)
    render("D", 127.0)

# E, 150.0: the park, full sun. The dog mid-leap for the ball, the man through the throw, the flat behind.
def still_E():
    reset(); lights("park"); vis(small, False); vis(SMILE, True)
    leap = dict(W.STAND); leap.update(bp=-12, fl=-64, bl=58, hp=-18, tp=55, ear=-30)
    W.pose_dog((-1.6, 17.4), 235, leap, z=.62)
    vis(W.c_ball, True)
    W.pose_man(x=1.4, y=14.6, hd=128, pz=.92, hip=0, swL=-38, swR=34, knee=0, kneeR=55, lean=14, np=-6,
               shL=(-10, 40), shR=(14, -150), elL=-30, elR=-12)
    W.still_camera("E", (-5.0, 20.5, .45), (.8, 15.2, 1.5), 26)
    render("E", 150.0)

# F, 163.0: the flat, empty. The toy on the cushion, screen grey, in the sun patch; the mat empty.
def still_F():
    reset(); lights("day", sun=(1.7, -.75, -1.05)); vis(MAN["root"], False); vis(DOG["root"], False)
    vis(small, False); vis(FLOOR_TOY, True); vis(W.battery_tbl, True)
    FLOOR_TOY.location = (-.55, 2.38, .56); FLOOR_TOY.rotation_euler = (R(-62), 0, R(-18))
    LCD_F = bpy.data.objects["CL_ftoy_lcd"]; LCD_F.data.materials[0] = M["lcdgrey"]
    W.still_camera("F", (-.75, .7, .85), (-.25, 2.6, .6), 32)
    render("F", 163.0)

for sid in ONLY: globals()["still_" + sid]()
