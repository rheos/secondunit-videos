# The pet, act 6 (130.4-141.5 s, frames 3130-3396): the bridge and turnaround, off the couch.
#   tools/render_lock.sh blender -b --factory-startup --python pet_act6.py -- --stills 3130,3200
# Opens on still D's pose. Battery down on the shoe rack 130.74, leash clipped 131.89 (whole-body wag),
# the door opens 133.46 and morning floods in, out 134.62, the door swings almost shut; the empty room,
# the toy on the cushion beeps NEW EGG?, the door clicks shut 141.0.
# Local helpers (not in pet_world): shoe rack, door hinge pivot, a leash line keyed hand-to-collar, the NEW EGG?
# screen on the small toy, world-strength keys for the night-to-morning change.
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import pet_world as W
from pet_world import R, Vector, M, MAN, DOG, small, vis, scene
from film_kit import shot_camera, cut, key, show, sec

F0, F1, OUT = W.act_setup(6)

def cl(x): return max(0.0, min(1.0, x))
def sm(a, b, t):
    u = cl((t - a) / (b - a)); return u * u * (3 - 2 * u)
def lerp(a, b, u): return a + (b - a) * u
def path(pts, t):
    """pts = [(t, (x, y)), ...], smooth between keys"""
    if t <= pts[0][0]: return Vector(pts[0][1])
    for (ta, a), (tb, b) in zip(pts, pts[1:]):
        if t <= tb: return Vector(a).lerp(Vector(b), sm(ta, tb, t))
    return Vector(pts[-1][1])

# ---------- static set-up ----------
# lamp first (adds CL_lamp), then day for the morning sky and light colours; the night end is keyed below
W.light_mode("lamp"); W.light_mode("day")
W.sunob.rotation_euler = Vector((.25, -1.0, -.42)).normalized().to_track_quat('-Z', 'Y').to_euler()   # low morning sun, in through the door
W.sunob.data.color = (1.0, .86, .64)
for o in (W.c_ball, W.blanket, W.battery_tbl): vis(o, False)
W.pile_items(2)
for n in ("coat", "scarf", "keys"):                 # act 5 lifted them off the mat onto the floor beside it
    vis(W.PILE_OBS[n], True); W.PILE_OBS[n].location.x += 1.05; W.PILE_OBS[n].location.y -= .25
vis(W.PILE_OBS["shoe"], True); W.PILE_OBS["shoe"].location.x += 1.1; W.PILE_OBS["shoe"].location.y += .1
vis(W.hook_coat, False); vis(W.hook_scarf, False); vis(W.hook_keys, False)
vis(W.PLANT, False); W.sill_plant(.65)

# shoe rack left of the door
RACK = W.blocks("shoeRack", [((.55, .28, .03), (1.5, 2.86, .32)), ((.55, .28, .03), (1.5, 2.86, .14)),
                             ((.03, .28, .33), (1.24, 2.86, .165)), ((.03, .28, .33), (1.76, 2.86, .165))], M["wood"])

# the door on a hinge at its left edge; the knob moved to the swinging edge
HINGE = W.empty("doorHinge", (1.96, 3.03, 0))
bpy.data.objects["CL_doorKnob"].location.x = 2.72
bpy.context.view_layer.update()
for n in ("CL_doorLeaf", "CL_doorPanel0", "CL_doorPanel1", "CL_doorKnob"):
    ob = bpy.data.objects.get(n)
    if ob is None: print("[act6] missing", n); continue
    mw = ob.matrix_world.copy(); ob.parent = HINGE; ob.matrix_parent_inverse = HINGE.matrix_world.inverted(); ob.matrix_world = mw

# batteries: one in his fingers (parented to the hand at D's offset), one on the rack
scene.frame_set(F0)
W.pose_man(x=1.08, y=2.3, hd=0, pz=.56, hip=-4, knee=92, lean=26, np=-10, shL=(-8, -10), shR=(6, -70), elL=-12, elR=-48)
hand = MAN["handR"].matrix_world.translation.copy()
BATT_H = W.blocks("battHeld6", [((.1, .025, .1), (0, 0, 0))], M["cell"])
BATT_H.location = hand + Vector((.07, -.09, .05)); bpy.context.view_layer.update()
mw = BATT_H.matrix_world.copy(); BATT_H.parent = MAN["handR"]; BATT_H.matrix_parent_inverse = MAN["handR"].matrix_world.inverted(); BATT_H.matrix_world = mw
BATT_R = W.blocks("battRack6", [((.07, .07, .02), (1.42, 2.82, .345))], M["cell"])

# the leash, a line from his hand to the collar, keyed per frame
LEASH = W.box("leashLine6", (1.0, .03, .03), (0, 0, 0), M["leash"])

# the small toy on the cushion (where still F finds it), NEW EGG? on its screen
small.parent = None; small.location = (-.55, 2.38, .56); small.rotation_euler = (R(-62), 0, R(-18)); small.scale = (.045,) * 3
S_NEWEGG = W.screen("stoy_newegg6", [(W.EGG, 9, 3), ([".##.", "#..#", "..#.", ".#..", "....", ".#.."], 19, 5)], small)
for ob in W.SPR.values(): vis(ob, False)
LCD = bpy.data.objects["CL_stoy_lcd"]; LCD.data.materials[0] = M["lcd"]
GLOW = W.lcd_glow((-.55, 2.2, .62), 0)

# lights keyed night -> morning
LT = {"sun": W.sunob.data, "fill": bpy.data.objects["CL_fill"].data, "win": bpy.data.objects["CL_winGlow"].data,
      "door": bpy.data.objects["CL_doorFill"].data, "lamp": bpy.data.objects["CL_lamp"].data}
NIGHT = dict(sun=.15, fill=40, win=6, door=0, lamp=260)
MORN = dict(sun=14.0, fill=300, win=55, door=160, lamp=90)
# the morning through the doorway: a warm spot outside aimed in across the floor
_sd = bpy.data.lights.new("CL_doorSun6", "SPOT"); _sd.spot_size = R(95); _sd.spot_blend = .3; _sd.color = (1.0, .84, .6); _sd.shadow_soft_size = .3
DOORSUN = bpy.data.objects.new("CL_doorSun6", _sd); scene.collection.objects.link(DOORSUN)
DOORSUN.location = (2.4, 4.2, 2.6); DOORSUN.rotation_euler = (Vector((2.3, 1.7, 0)) - DOORSUN.location).to_track_quat('-Z', 'Y').to_euler()
LT["doorsun"] = _sd; NIGHT["doorsun"] = 0; MORN["doorsun"] = 9000
BG = [n for n in scene.world.node_tree.nodes if n.type == "BACKGROUND"][0].inputs["Strength"]

# ---------- cameras ----------
T_OPEN, T_OUT, T_CLICK = 133.46, 134.62, 141.0
CAM_D = shot_camera("a6_D", (2.0, -.75, .95), (2.0, 2.3, 1.05), 28)            # still D, exactly
CAM_DOOR = shot_camera("a6_door", (3.55, -.45, 1.5), (2.25, 3.1, 1.0), 24)        # behind them, the doorway ahead past the leaf
CAM_ROOM = shot_camera("a6_room", (1.55, -.55, 1.15), (.7, 2.7, .7), 24)         # the empty room: couch, mat, door
toy = Vector(small.location)
CAM_TOY = shot_camera("a6_toy", toy + Vector((.16, -.27, .3)), toy + Vector((.01, 0, .0)), 50)
_tk = bpy.data.lights.new("CL_toyKey6", "AREA"); _tk.size = .4; _tk.color = (1, 1, 1); _tk.energy = 0
TOYKEY = bpy.data.objects.new("CL_toyKey6", _tk); scene.collection.objects.link(TOYKEY)        # neutral key, close-up only
TOYKEY.location = toy + Vector((.15, -.45, .5)); TOYKEY.rotation_euler = (toy - TOYKEY.location).to_track_quat('-Z', 'Y').to_euler()
F_DOOR, F_ROOM, F_TOY, F_ROOM2 = sec(132.6), sec(137.8), sec(138.6), sec(140.3)
cut(F0, CAM_D); cut(F_DOOR, CAM_DOOR); cut(F_ROOM, CAM_ROOM); cut(F_TOY, CAM_TOY); cut(F_ROOM2, CAM_ROOM)

# ---------- visibility switches ----------
show(BATT_H, F0, True); show(BATT_R, F0, False)
F_BATT = sec(130.74); show(BATT_H, F_BATT, False); show(BATT_R, F_BATT, True)
F_TAKE = sec(131.3); show(W.c_leash, F0, True); show(W.c_leash, F_TAKE, False)
show(LEASH, F0, False); show(LEASH, F_TAKE, True)
F_GONE = sec(137.4)
show(LEASH, F_GONE, False)                       # man and dog walk on out of shot down the street
for ob in W.SPR.values(): show(ob, F0, False)    # the small toy sits on the cushion all act; screen empty until the beeps
show(S_NEWEGG, F0, False)
PILLOW = bpy.data.objects["CL_pillow"]                # out of the close-up only (it blurs in at the frame edge)
show(PILLOW, F0, True); show(PILLOW, F_TOY, False); show(PILLOW, F_ROOM2, True)
BEEPS = [(138.3, 138.75), (139.05, 139.5), (139.8, 140.25), (140.55, 141.0)]
for a, b in BEEPS: show(S_NEWEGG, sec(a), True); show(S_NEWEGG, sec(b), False)

# ---------- per-frame keys ----------
KNEEL = dict(x=1.08, y=2.3, hd=0, pz=.56, hip=-4, knee=92, lean=26, np=-10, shL=(-8, -10), shR=(6, -70), elL=-12, elR=-48)
STAND = dict(pz=.92, hip=0, knee=0, lean=4, np=0, shL=(-6, 0), shR=(6, 0), elL=-10, elR=-10)
MAN_PATH = [(132.5, (1.08, 2.3)), (133.2, (1.6, 2.35)), (134.95, (1.6, 2.35)), (135.35, (1.8, 1.9)), (135.75, (2.4, 2.05)),
            (136.2, (2.4, 3.0)), (137.4, (2.4, 5.6))]   # hinge side, then round the leaf tip and out through the middle
DOG_PATH = [(130.4, (2.72, 2.32)), (131.05, (1.72, 2.3)), (132.6, (1.72, 2.3)), (133.3, (2.85, 2.0)),
            (134.62, (2.85, 2.0)), (135.0, (2.45, 2.6)), (136.6, (2.4, 6.4))]
def DOOR_ANG(t):
    return 90 * sm(T_OPEN, T_OPEN + .55, t) * (1 - sm(136.5, 137.4, t)) + 9 * sm(136.5, 137.4, t) * (1 - sm(T_CLICK - .12, T_CLICK, t))

def head_along(pts, t, prev):
    d = path(pts, t + 1 / 24) - path(pts, t)
    return math.degrees(math.atan2(d.y, d.x)) if d.length > 1e-4 else prev

man_hd, dog_hd = 0.0, 182.0
for f in range(F0, F1 + 1):
    t = f / 24
    # --- the man ---
    if t < 132.5:
        p = dict(KNEEL)
        r = sm(130.4, 130.68, t) * (1 - sm(130.78, 131.0, t))          # reach back-left to the rack
        p["hd"] = 38 * r; p["shR"] = (6 - 20 * r, -70 + 10 * r)
        g = sm(131.05, 131.3, t) * (1 - sm(131.3, 131.5, t))            # take the leash from his mouth
        c = sm(131.5, 131.89, t) * (1 - sm(132.0, 132.3, t))            # down to the collar, clip
        p["shR"] = (p["shR"][0], p["shR"][1] - 10 * g - 15 * c); p["shL"] = (-8, -10 - 50 * c); p["elL"] = -12 - 30 * c
        p["np"] = -10 + 8 * c
        if t > 131.89: p["np"] += 6 * math.sin((t - 131.89) * 9) * (1 - sm(132.2, 132.5, t))   # he laughs at the wag
        man_hd = p["hd"]
        rise = sm(132.15, 132.5, t)
        for k_, v in STAND.items():
            if isinstance(v, tuple): p[k_] = tuple(lerp(a, b, rise) for a, b in zip(p[k_], v))
            else: p[k_] = lerp(p[k_], v, rise)
        W.key_man(f, **p)
    else:
        xy = path(MAN_PATH, t); moving = (path(MAN_PATH, t + 1 / 24) - xy).length > .002
        man_hd = head_along(MAN_PATH, t, man_hd) if moving else (60 if 133.2 < t < 134.95 else man_hd)
        sw = 32 * math.sin(t * 2 * math.pi * 1.7) if moving else 0
        p = dict(STAND, x=xy.x, y=xy.y, hd=man_hd, swL=sw, swR=-sw, shL=(-6, -sw * .6), shR=(6, sw * .6))
        o = sm(T_OPEN - .25, T_OPEN, t) * (1 - sm(T_OPEN + .6, T_OPEN + .9, t))   # reach for the knob, pull
        if o > 0: p["shR"] = (6, -75 * o); p["elR"] = -10; p["lean"] = 4 + 10 * o
        p["np"] = -6 * sm(T_OPEN, T_OPEN + .4, t) * (1 - sm(134.5, 134.8, t))     # squints into the light
        W.key_man(f, **p)
    # --- the dog ---
    dxy = path(DOG_PATH, t); dmov = (path(DOG_PATH, t + 1 / 24) - dxy).length > .002
    if dmov: dog_hd = head_along(DOG_PATH, t, dog_hd)
    elif 131.0 < t < 132.6: dog_hd = 180
    elif 133.3 < t < 134.62: dog_hd = 100
    pose = dict(W.STAND)
    legs = None
    if dmov:
        ph = t * 2 * math.pi * 2.6
        legs = {"FL": 28 * math.sin(ph), "BR": 28 * math.sin(ph), "FR": -28 * math.sin(ph), "BL": -28 * math.sin(ph)}
    w = sm(131.89, 132.0, t) * (1 - sm(133.0, 133.3, t))                # the whole-body wag, back to front
    wag = 18 + 40 * math.sin(t * 2 * math.pi * 4.5) * (.35 + .65 * w)
    hd = dog_hd + 9 * w * math.sin(t * 2 * math.pi * 4.5 + 1.4)
    pose["hy"] = -14 * w * math.sin(t * 2 * math.pi * 4.5 + 2.6); pose["bp"] = -4 * w
    if t < 131.3: pose["hp"] = -12
    if T_OPEN < t < T_OUT: pose["hp"] = -18; pose["ear"] = -20                # ears up at the light
    W.key_dog(f, (dxy.x, dxy.y), hd, pose, z=.04 if t < 131.0 else 0.0, wag=wag, legs=legs)
    # --- the leash: hand to collar ---
    bpy.context.view_layer.update()
    a = MAN["handR"].matrix_world.translation.copy(); b = DOG["neck"].matrix_world.translation + Vector((0, 0, -.02))
    if t < 131.89: b = DOG["mouth"].matrix_world.translation.copy()
    d = b - a; L = max(d.length, .02)
    key(LEASH, f, loc=(a + b) / 2, rot=d.to_track_quat('X', 'Z').to_euler(), scale=(L, 1, 1))
    # --- the door, the light ---
    key(HINGE, f, rot=(0, 0, R(-DOOR_ANG(t))))
    m = sm(T_OPEN, T_OPEN + .7, t)                                      # morning floods in
    ajar = DOOR_ANG(t) / 90
    for k_, d_ in LT.items():
        v = lerp(NIGHT[k_], MORN[k_], m)
        if k_ in ("door", "sun", "doorsun"): v = lerp(NIGHT[k_], MORN[k_], m * ((.35 if k_ != "doorsun" else .03) + (.65 if k_ != "doorsun" else .97) * ajar))   # less through a shut door
        d_.energy = v; d_.keyframe_insert("energy", frame=f)
    BG.default_value = lerp(.05, .85, m); BG.keyframe_insert("default_value", frame=f)
    scene.view_settings.exposure = lerp(.2, .35, m); scene.view_settings.keyframe_insert("exposure", frame=f)
    # --- the toy's beep glow ---
    on = any(a_ <= t < b_ for a_, b_ in BEEPS)
    GLOW.data.energy = 2.5 if on else 0; GLOW.data.keyframe_insert("energy", frame=f)
    _tk.energy = 7 if F_TOY <= f < F_ROOM2 else 0; _tk.keyframe_insert("energy", frame=f)

W.finish(OUT)
