# The pet, act 5 (105.8-130.4 s, frames 2539-3130): refrain 2 + turn, the search.
#   tools/render_lock.sh blender -b --factory-startup --python pet_act5.py -- --stills 2539,2700
# He stands with purpose, searches the room in one locked wide (cushion, remote, side-table drawer, hooks), the dog
# following with the leash and setting it down at his feet at every stop; the light goes from day to lamp. At the
# mat he kneels, lifts coat, scarf, keys, shoe onto the floor and finds the coin cell under the shoe (120.41). From
# 120.41 he holds key still D; frame 3130 is still D's pose exactly (act 6 starts from it).
import os, sys, math
LAB = os.path.dirname(os.path.abspath(__file__))
if not os.path.exists(os.path.join(LAB, "pet_world.py")):
    LAB = "/Users/robin/Code/novadiem/indieagent/secondunit/_wt-rt-pet/blender-orb-visualizer"
sys.path.insert(0, LAB)
import bpy
import pet_world as W
from pet_world import R, Vector, M, MAN, DOG, small, vis, scene, sm, lerp, clamp
from film_kit import shot_camera, cut, key, show, sec

F0, F1, OUT = W.act_setup(5)

# ---------------------------------------------------------------- static set-up
W.light_mode("lamp")                      # creates CL_lamp (kept, keyed from 0), then the day look on top
W.light_mode("day")
W.sunob.rotation_euler = Vector((.55, -1.0, -.72)).normalized().to_track_quat('-Z', 'Y').to_euler()
LAMP = bpy.data.objects["CL_lamp"].data
FILL = bpy.data.objects["CL_fill"].data; WIN = bpy.data.objects["CL_winGlow"].data; DOOR = bpy.data.objects["CL_doorFill"].data
BG = [n for n in scene.world.node_tree.nodes if n.type == "BACKGROUND"][0]
RAMP = [n for n in scene.world.node_tree.nodes if n.type == "VALTORGB"][0].color_ramp.elements
from canvas_kit import hex_lin
SKY_DAY = [hex_lin("#eceee6"), hex_lin("#bcd6ec")]; SKY_NIGHT = [hex_lin("#1a2236"), hex_lin("#26304a")]

W.pile_items(6)                           # leash ball shoe keys scarf coat on the mat; hooks empty
vis(W.c_leash, True); vis(W.c_ball, False); vis(W.blanket, False); vis(W.battery_tbl, False)
vis(W.PLANT, False); W.sill_plant(1.0)    # drooped since act 2
for n, ob in W.SPR.items(): vis(ob, False)
LCD = bpy.data.objects["CL_stoy_lcd"]; LCD.data.materials[0] = M["lcdgrey"]   # dead since 102.33

# local props (world helpers kept in this file)
SEAT = bpy.data.objects["CL_seatL"]; SEAT0 = SEAT.location.copy()
sock = W.box("a5_sock", (.22, .09, .05), (-.75, 2.42, .43), M["sock"])
coins = W.blocks("a5_coins", [((.05, .05, .012), (-.35, 2.35, .41)), ((.05, .05, .012), (-.28, 2.5, .41)),
                              ((.05, .05, .012), (-.5, 2.55, .41))], M["brass"])
dust = W.blocks("a5_dust", [((.08, .06, .02), (-.2, 2.6, .41)), ((.05, .05, .02), (-.62, 2.62, .41))], M["sole"])
remote = W.blocks("a5_remote", [((.06, .2, .03), (0, 0, 0)), ((.05, .06, .005), (0, -.04, -.017))], M["ink"])
REMOTE0 = Vector((1.36, 2.3, .755)); remote.location = REMOTE0
drawer = W.blocks("a5_drawer", [((.38, .04, .14), (0, -.2, 0)), ((.38, .4, .02), (0, 0, -.06)),
                                ((.02, .4, .12), (-.18, 0, 0)), ((.02, .4, .12), (.18, 0, 0))], M["wood"])
DRAWER0 = Vector((3.5, 2.6, .4)); drawer.location = DRAWER0
W.box("a5_drawerKnob", (.05, .03, .04), (0, -.235, 0), M["brass"], drawer)
floor_leash = W.blocks("a5_floorLeash", [((.45, .035, .02), (0, -.1, .01)), ((.035, .2, .02), (.22, 0, .01)),
                                         ((.03, .45, .02), (-.2, .15, .01))], M["leash"])
cell = W.blocks("a5_cell", [((.07, .07, .02), (0, 0, 0))], M["cell"])                    # the coin cell under the shoe
batt = W.blocks("a5_battHeld", [((.1, .025, .1), (0, 0, 0))], M["cell"])                 # = pet_stills' battHeld
SHOE_SPOT = W.PILE_OBS["shoe"].location.copy()
CELL0 = Vector((SHOE_SPOT.x - .02, SHOE_SPOT.y - .03, .035))

# the toy: in his hands until 106.2, then on the right seat cushion (acts 6-7 pick it up there)
TOY_DOWN = sec(106.2)
TOY_CUSHION = (Vector((-.55, 2.38, .56)), (R(-62), 0, R(-18)))   # = pet_stills.still_F

# what he lifts off the mat, onto the floor in front of it: (name, t0, t1, floor spot, rz)
LIFT = [("coat", 114.5, 115.6, (-.3, 1.75, .025), 30), ("scarf", 115.8, 116.8, (.85, 1.45, .025), 100),
        ("keys", 117.0, 117.8, (.95, 1.75, .025), 70), ("shoe", 118.1, 119.3, (.7, 1.3, .025), 15)]
SRC = {n: (W.PILE_OBS[n].location.copy(), math.degrees(W.PILE_OBS[n].rotation_euler.z)) for n, *_ in LIFT}

# ---------------------------------------------------------------- shots
cam_wide = shot_camera("a5wide", (.7, -4.1, 1.75), (.85, 2.0, .85), lens=21)
cam_mat = shot_camera("a5mat", (1.3, -1.4, 1.5), (1.9, 2.2, 1.0), lens=24)
cam_D = shot_camera("D", (2.0, -.75, .95), (2.0, 2.3, 1.05), lens=28)          # still D's camera
cut(F0, cam_wide); cut(sec(113.49), cam_mat); cut(sec(120.41), cam_D)

# ---------------------------------------------------------------- tracks
def track(keys, t):
    """keys = [(t, (values...)), ...]: hold between keys, smoothstep through each segment"""
    if t <= keys[0][0]: return keys[0][1]
    for (ta, a), (tb, b) in zip(keys, keys[1:]):
        if t <= tb:
            u = sm(ta, tb, t); return tuple(lerp(x, y, u) for x, y in zip(a, b))
    return keys[-1][1]

def unwrap(keys, hi=2):
    out, prev = [], None
    for t, v in keys:
        v = list(v); h = v[hi]
        if prev is not None:
            while h - prev > 180: h -= 360
            while h - prev < -180: h += 360
        v[hi] = h; out.append((t, tuple(v))); prev = h
    return out

# man: (x, y, heading). Heading -90 faces the camera, 0 faces +x (the door side), 90 faces the back wall.
MAN_PATH = unwrap([(105.8, (.73, 2.5, -90)), (106.8, (.73, 2.0, -90)), (107.7, (.73, 2.0, -90)),
                   (108.3, (-.45, 1.78, 100)), (109.8, (-.45, 1.78, 100)),
                   (110.25, (1.05, 1.85, 55)), (110.95, (1.05, 1.85, 55)),
                   (111.45, (3.5, 1.9, 90)), (112.35, (3.5, 1.9, 90)),
                   (112.65, (3.35, 2.25, 95)), (113.05, (3.35, 2.25, 95)),
                   (113.49, (1.25, 2.3, 0)), (113.7, (1.25, 2.3, 0)), (114.4, (1.08, 2.3, 0))])
STILL_D = dict(x=1.08, y=2.3, hd=0, pz=.56, hip=-4, knee=92, lean=26, np=-10, shL=(-8, -10), shR=(6, -70), elL=-12, elR=-48)

def window(t, a, b, e=.2):
    return sm(a, a + e, t) * (1 - sm(b - e, b, t))

def man_pose(t):
    if t >= 120.41:                                     # still D, held to the end of the act
        p = dict(STILL_D)
        p["np"] = STILL_D["np"] + 4 * (1 - sm(120.41, 121.5, t))
        if 123.2 < t < 123.35: p["blink"] = .12        # one blink before the turn; dead still from 125.5
        return p
    x, y, hd = track(MAN_PATH, t)
    x2, y2, _ = track(MAN_PATH, t + 1 / 24)
    walk = clamp(math.hypot(x2 - x, y2 - y) * 24 / 1.2)
    ph = t * 2 * math.pi * 1.9; s_ = math.sin(ph)
    p = dict(x=x, y=y, hd=hd, pz=.92, hip=0, knee=max(0, 32 * walk * s_), kneeR=max(0, -32 * walk * s_), lean=4 + 6 * walk,
             np=0, ny=0, swL=28 * walk * s_, swR=-28 * walk * s_, shL=(-6, 22 * walk * s_), shR=(6, -22 * walk * s_),
             elL=-20, elR=-20, blink=1.0)
    if t < 107.0:                                       # up off the couch: sitting -> standing
        u = sm(105.85, 106.75, t); S = W.MAN_SIT
        for k in ("pz", "hip", "knee", "lean"): p[k] = lerp(S[k], p[k], u)
        p["kneeR"] = None
        for k in ("shL", "shR"): p[k] = tuple(lerp(a, b, u) for a, b in zip(S[k], p[k]))
        for k in ("elL", "elR"): p[k] = lerp(S[k], -20, u)
        p["np"] = lerp(20, 0, u)
    elif t < 107.7:                                     # looks round the room, with purpose for the first time
        p["ny"] = 45 * math.sin((t - 107.0) / .7 * 2 * math.pi); p["np"] = -6
    c = window(t, 108.3, 109.8, .3)                     # couch cushion: bends, lifts it, looks under
    if c > 0:
        p["lean"] = lerp(p["lean"], 52, c); p["hip"] = -20 * c; p["knee"] = lerp(p["knee"], 22, c); p["kneeR"] = None
        p["shL"] = (-8, -60 * c); p["shR"] = (8, -60 * c); p["elL"] = p["elR"] = lerp(-20, -30, c); p["np"] = 18 * c
    r = window(t, 110.25, 110.95, .15)                  # the remote: turns it over, looks at its back
    if r > 0:
        p["shR"] = (10, -62 * r); p["elR"] = lerp(-20, -70, r); p["np"] = 24 * r; p["ny"] = -10 * r
    d = window(t, 111.45, 112.35, .2)                   # the side-table drawer
    if d > 0:
        p["lean"] = lerp(p["lean"], 34, d); p["hip"] = -12 * d; p["knee"] = 14 * d; p["kneeR"] = None
        p["shR"] = (6, -55 * d); p["elR"] = lerp(-20, -25, d); p["np"] = 22 * d
    h = window(t, 112.65, 113.05, .12)                  # the coat hooks: empty
    if h > 0: p["np"] = -28 * h
    if t >= 113.49:                                     # the mat: kneels, then lifts things off
        k = sm(113.7, 114.4, t)
        for kk in ("pz", "hip", "knee"): p[kk] = lerp(p[kk], STILL_D[kk], k)
        p["lean"] = lerp(8, STILL_D["lean"], k)
        p["kneeR"] = None; p["swL"] = p["swR"] = 0; p["np"] = lerp(14, 22, k)
        p["shL"] = (lerp(-6, -8, k), -10 * k); p["elL"] = lerp(-20, -12, k)
        p["shR"] = (6, -30 * k); p["elR"] = -20
        reach = 0.0
        for n, a, b, dst, rz in LIFT:
            reach = max(reach, math.sin(math.pi * clamp((t - (a - .25)) / (b - a + .25))))
        if 119.3 < t < 119.65: reach = max(reach, math.sin(math.pi * clamp((t - 119.3) / .7)))
        if t > 113.9:
            p["lean"] = lerp(p["lean"], 44, reach); p["shR"] = (6, lerp(-30, -62, reach)); p["elR"] = lerp(-20, -6, reach)
            p["np"] = lerp(22, 30, reach)
        up = sm(119.6, 120.41, t)                       # the coin cell, held up between finger and thumb
        if up > 0:
            for kk in ("lean", "np", "elL", "elR"): p[kk] = lerp(p[kk], STILL_D[kk], up)
            for kk in ("shL", "shR"): p[kk] = tuple(lerp(a, b, up) for a, b in zip(p[kk], STILL_D[kk]))
    return p

# dog: (x, y, heading, sit 0..1). He follows, sits at each stop and sets the leash down at the man's feet.
DOG_PATH = unwrap([(105.8, (.74, .72, 90, 1)), (106.9, (.74, .72, 90, 1)), (107.5, (.9, 1.25, 110, 0)), (107.9, (.9, 1.25, 150, 0)),
                   (108.7, (-.15, 1.15, 125, 1)), (109.85, (-.15, 1.15, 125, 1)),
                   (110.5, (1.45, 1.3, 105, 1)), (111.05, (1.45, 1.3, 105, 1)),
                   (111.75, (3.0, 1.35, 50, 1)), (112.4, (3.0, 1.35, 50, 1)),
                   (113.25, (2.5, 2.33, 182, 0)), (114.0, (2.5, 2.33, 182, 0)), (114.6, (2.72, 2.32, 182, 0))])
DROPS = [(108.85, 109.75), (110.6, 110.95), (111.85, 112.3)]   # leash on the floor at his feet
LIE_A, LIE_B = 113.25, 113.95                                    # lying on the pile, then up to face him

def dog_pose(t):
    x, y, hd, s = track(DOG_PATH, t)
    x2, y2, _, _ = track(DOG_PATH, t + 1 / 24)
    walk = clamp(math.hypot(x2 - x, y2 - y) * 24 / 1.0)
    a = 30 * walk * math.sin(t * 2 * math.pi * 3.2)
    legs = dict(FL=a, BR=a, FR=-a, BL=-a) if walk > .05 else None
    pose = W.pmix(W.STAND, W.SIT, s); z = 0.0
    lie = sm(LIE_A - .2, LIE_A + .1, t) * (1 - sm(LIE_B, LIE_B + .45, t))
    if lie > 0:
        pose = W.pmix(pose, W.LIE, lie)
        if lie > .5: legs = None
    if t > LIE_A - .3: z = .04 * sm(LIE_A - .3, LIE_A, t)
    pose = dict(pose)
    drop = 0.0
    for a_, b_ in DROPS: drop = max(drop, sm(a_ - .15, a_, t) * (1 - sm(b_ - .1, b_ + .05, t)))
    pose["hp"] += 14 * drop
    if t >= LIE_B + .45:                                # up and facing him: still D's stand, watching his hands
        pose = dict(W.STAND); pose["hp"] = lerp(14, -12, sm(119.6, 120.41, t))
        pose["ear"] = 18 * (1 - sm(119.6, 120.2, t)); z = .04; legs = None
        if t < 114.6:
            a2 = 18 * math.sin((t - 114.0) / .6 * 2 * math.pi); legs = dict(FL=a2, BR=a2, FR=-a2, BL=-a2)
    wag = 0.0
    if t < 113.2: wag = 18 * math.sin(t * 2 * math.pi * 1.6) * (1 - s * .6)
    if 127.9 < t < 128.9: wag = 30 * math.sin((t - 127.9) * math.pi * 2)   # the tail moves once
    if t >= 120.41: hd = 182; x, y = 2.72, 2.32
    return (x, y), hd, pose, z, wag, legs

def drop_spot(a):
    (dx, dy), hd, *_ = dog_pose(a)
    h = R(hd)
    return Vector((dx + math.cos(h) * .62, dy + math.sin(h) * .62, 0))

# ---------------------------------------------------------------- per-frame keys
# light: (sun, fill, window, door, lamp, sky strength, exposure, day 1 -> 0)
LIGHT = [(105.8, (9.0, 420, 60, 70, 0, .85, .35, 1.0)), (108.5, (8.0, 380, 55, 60, 20, .8, .34, .95)),
         (116.0, (1.6, 140, 18, 10, 170, .45, .26, .45)), (121.0, (.15, 40, 6, 0, 260, .4, .2, 0.0))]
FILL_DAY, FILL_NIGHT = (1, 1, 1), (.55, .62, .9)
SUN_DAY, SUN_NIGHT = (1.0, .9, .74), (.6, .7, 1.0)

prev_vis = {}
def vis_key(ob, f, on):
    if prev_vis.get(ob.name) != on:
        show(ob, f, on); prev_vis[ob.name] = on

for f in range(F0, F1 + 1):
    t = f / 24
    sun_e, fill_e, win_e, door_e, lamp_e, bg_s, expo, day = track(LIGHT, t)
    W.sunob.data.energy = sun_e; W.sunob.data.keyframe_insert("energy", frame=f)
    W.sunob.data.color = tuple(lerp(b, a, day) for a, b in zip(SUN_DAY, SUN_NIGHT)); W.sunob.data.keyframe_insert("color", frame=f)
    FILL.energy = fill_e; FILL.keyframe_insert("energy", frame=f)
    FILL.color = tuple(lerp(b, a, day) for a, b in zip(FILL_DAY, FILL_NIGHT)); FILL.keyframe_insert("color", frame=f)
    WIN.energy = win_e; WIN.keyframe_insert("energy", frame=f)
    DOOR.energy = door_e; DOOR.keyframe_insert("energy", frame=f)
    LAMP.energy = lamp_e; LAMP.keyframe_insert("energy", frame=f)
    BG.inputs["Strength"].default_value = bg_s; BG.inputs["Strength"].keyframe_insert("default_value", frame=f)
    for i, el in enumerate(RAMP):
        el.color = (*[lerp(b, a, day) for a, b in zip(SKY_DAY[i], SKY_NIGHT[i])], 1); el.keyframe_insert("color", frame=f)
    scene.view_settings.exposure = expo; scene.view_settings.keyframe_insert("exposure", frame=f)

    W.key_man(f, **man_pose(t))
    hand = MAN["handR"].matrix_world.translation.copy()

    if f < TOY_DOWN: W.toy_in_hands(small)
    else:
        cu0 = sm(108.45, 108.75, t) * (1 - sm(109.45, 109.75, t))      # rides the left cushion when he lifts it
        small.parent = None; small.location = TOY_CUSHION[0] + Vector((0, -.12 * cu0, .28 * cu0)); small.rotation_euler = TOY_CUSHION[1]; small.scale = (.045,) * 3
    key(small, f, loc=small.location.copy(), rot=small.rotation_euler.copy(), scale=small.scale.copy())

    pos, hd, pose, z, wag, legs = dog_pose(t)
    W.key_dog(f, pos, hd, pose, z=z, wag=wag, legs=legs)
    down = None
    for a_, b_ in DROPS:
        if a_ <= t < b_: down = a_
    vis_key(W.c_leash, f, down is None)
    vis_key(floor_leash, f, down is not None)
    sp = drop_spot(down if down is not None else DROPS[0][0])
    key(floor_leash, f, loc=sp, rot=(0, 0, R(hd + 90)))

    cu = sm(108.45, 108.75, t) * (1 - sm(109.45, 109.75, t))
    key(SEAT, f, loc=SEAT0 + Vector((0, -.12 * cu, .28 * cu)), rot=(R(-38 * cu), 0, 0))
    rr = sm(110.2, 110.4, t) * (1 - sm(110.85, 111.0, t))
    key(remote, f, loc=REMOTE0.lerp(hand + Vector((0, 0, .02)), rr), rot=(R(180 * sm(110.4, 110.7, t) * rr), 0, R(-20 * rr)))
    dr = sm(111.5, 111.75, t) * (1 - sm(112.1, 112.35, t))
    key(drawer, f, loc=DRAWER0 + Vector((0, -.3 * dr, 0)))

    for n, a_, b_, dst, rz in LIFT:
        u = sm(a_, b_, t); src, rz0 = SRC[n]
        loc = src.lerp(Vector(dst), u) + Vector((0, 0, .5 * math.sin(math.pi * u)))
        key(W.PILE_OBS[n], f, loc=loc, rot=(0, 0, R(lerp(rz0, rz, u))))

    vis_key(cell, f, t < 119.6)
    vis_key(batt, f, t >= 119.6)
    key(cell, f, loc=CELL0)
    held = hand + Vector((.07, -.09, .05))               # still D: hand + (.07, -.09, .05), no rotation
    key(batt, f, loc=CELL0.lerp(held, sm(119.6, 120.1, t)) if t < 120.1 else held, rot=(0, 0, 0))

W.finish(OUT)
