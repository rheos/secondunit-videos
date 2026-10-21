# The pet, act 2 (49.3-68.9 s, frames 1183-1654): refrain 1, the days go by.
#   tools/render_lock.sh blender -b --factory-startup --python pet_act2.py -- --stills 1183,1300,1404
# Shots: hatch close (49.3) | locked wide time-lapse (51.0) with three night LCD cut-ins | the shoe on the knee (63.77)
#        | HAPPY close (66.21) | the dog goes back to the mat (67.3).
# Local helpers (not in pet_world): a plant per droop step swapped with show(); a "baby" screen on the 22x hero set;
# the time-lapse light palette keyed on the light datablocks, the world ramp/strength and exposure.
import os, sys, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import pet_world as W
from pet_world import R, Vector, MAN, DOG, small, scene, lerp, clamp
from film_kit import shot_camera, cut, key, show, sec

F0, F1, OUT = W.act_setup(2)

def sm(a, b, t): return W.sm(a, b, t)

# ---------- static set-up ----------
W.light_mode("day")
for ob in (W.c_leash, W.c_ball, W.blanket): W.vis(ob, False)
W.pile_items(2)                                     # act 1 ends with leash + ball on the mat
for n in W.PILE_ORDER: show(W.PILE_OBS[n], F0, n in ("leash", "ball"))
for ob in (W.hook_keys, W.hook_scarf, W.hook_coat): show(ob, F0, True)

T0, DAY = 51.4, 2.5            # day k starts at T0 + k*DAY; still B (58.5) lands deep in day 2's night
T_WIDE, T_SNAP = 51.0, 63.77
DAYS = 5
def ph(t):
    """(day index, u in [0,1)): dawn .0-.25, day .25-.5, dusk .5-.75, night .75-1"""
    d = (t - T0) / DAY
    return math.floor(d), d - math.floor(d)

# the pile grows one thing on four of the days, at noon; the hook empties on the same frame
ADD = {"shoe": T0 + 0 * DAY + .9, "keys": T0 + 1 * DAY + .9, "scarf": T0 + 3 * DAY + .9, "coat": T0 + 4 * DAY + .9}
HOOK = {"keys": W.hook_keys, "scarf": W.hook_scarf, "coat": W.hook_coat}
for n, ts in ADD.items():
    show(W.PILE_OBS[n], sec(ts), True)
    if n in HOOK: show(HOOK[n], sec(ts), False)

# the coin cell on the side table: days 0 and 1, gone from day 2's dawn
show(W.battery_tbl, F0, True); show(W.battery_tbl, sec(T0 + 2 * DAY), False)

# the sill plant droops a step each day
W.vis(W.PLANT, False); show(W.PLANT, F0, False)
PLANTS = [W.sill_plant(d) for d in (0.0, .2, .4, .6, .8)]
for i, p in enumerate(PLANTS): show(p, F0, i == 0)
for k in range(1, DAYS):
    fr = sec(T0 + k * DAY)
    for i, p in enumerate(PLANTS): show(p, fr, i == k)

# hero close-up: a baby sprite for the first growth stage
W.HSCREENS["baby"] = W.screen("hpet_baby", [(W.WALK_PET, 9, 6)], W.hero)
show(W.bang, F0, False)

# small toy in his hands, parented to the right hand the way take 06 does
W.pose_man()
W.toy_in_hands(small)
mw = small.matrix_world.copy()
small.parent = MAN["handR"]; small.matrix_parent_inverse = MAN["handR"].matrix_world.inverted(); small.matrix_world = mw
GLOW = W.lcd_glow((0, 0, 0), 0)

# shoe2: carried in the dog's mouth, then free (on his knee, then moved to the cushion)
carried = W.shoe("act2CarryShoe", DOG["mouth"], (.04, 0, -.05), (R(90), 0, R(90)))
free = W.shoe("act2Shoe2", None, (0, 0, 0), (0, 0, 0))
T_PICK, T_KNEE, T_MOVE0, T_MOVE1 = 62.95, T_SNAP, 64.62, 65.5
show(carried, F0, False); show(carried, sec(T_PICK - .6), True); show(carried, sec(T_KNEE), False)
show(free, F0, False); show(free, sec(T_KNEE), True)
CUSHION = Vector((-.05, 2.36, .52))

# ---------- the light: a palette per phase, keyed on the datablocks every frame ----------
fill = bpy.data.objects["CL_fill"].data; win = bpy.data.objects["CL_winGlow"].data; door = bpy.data.objects["CL_doorFill"].data
wn = scene.world.node_tree
bg = [n for n in wn.nodes if n.type == "BACKGROUND"][0]; el = [n for n in wn.nodes if n.type == "VALTORGB"][0].color_ramp.elements
HX = lambda h: Vector(W.K.hex_lin(h))
# sun E, sun col, fill E, fill col, win E, win col, door E, sky lo, sky hi, sky strength, exposure, lcd glow, sun dir
PAL = {
    "dawn":  (2.0, (1.0, .72, .55), 120, (.85, .78, .9), 45, (1.0, .78, .65), 15, HX("#d8a890"), HX("#8aa0c8"), .55, .28, .8, (1.3, -1.0, -.25)),
    "day":   (9.0, (1.0, .9, .74), 420, (1, 1, 1), 60, (1.0, .93, .8), 70, HX("#eceee6"), HX("#bcd6ec"), .85, .35, .3, (.55, -1.0, -.72)),
    "dusk":  (3.0, (1.0, .55, .32), 140, (1.0, .75, .6), 40, (1.0, .6, .4), 20, HX("#e8955a"), HX("#5a5a8a"), .6, .3, 1.0, (-.4, -1.0, -.3)),
    "night": (.15, (.6, .7, 1.0), 150, (.55, .62, .9), 12, (.5, .6, 1.0), 0, HX("#1a2236"), HX("#26304a"), .4, .25, 3.0, (.2, -1.0, -.9)),
}
ORDER = ["dawn", "day", "dusk", "night"]
def mixv(a, b, u):
    if isinstance(a, (int, float)): return lerp(a, b, u)
    return Vector(a).lerp(Vector(b), u)
def light_at(t):
    if t < T_WIDE or t >= T_SNAP: return PAL["day"]
    if t < T0: return PAL["night"]
    k, u = ph(t)
    i = int(u * 4); v = u * 4 - i
    w = sm(.65, 1.0, v)                              # hold each look, then blend into the next
    return tuple(mixv(x, y, w) for x, y in zip(PAL[ORDER[i]], PAL[ORDER[(i + 1) % 4]]))
def key_light(fr, t):
    sE, sC, fE, fC, wE, wC, dE, lo, hi, ss, ex, ge, sd = light_at(t)
    W.sunob.data.energy = sE; W.sunob.data.color = sC
    fill.energy = fE; fill.color = fC; win.energy = wE; win.color = wC; door.energy = dE
    for d, ps in ((W.sunob.data, ("energy", "color")), (fill, ("energy", "color")), (win, ("energy", "color")), (door, ("energy",))):
        for p in ps: d.keyframe_insert(p, frame=fr)
    W.sunob.rotation_euler = Vector(sd).normalized().to_track_quat('-Z', 'Y').to_euler(); W.sunob.keyframe_insert("rotation_euler", frame=fr)
    el[0].color = (*lo, 1); el[-1].color = (*hi, 1); el[0].keyframe_insert("color", frame=fr); el[-1].keyframe_insert("color", frame=fr)
    bg.inputs["Strength"].default_value = ss; bg.inputs["Strength"].keyframe_insert("default_value", frame=fr)
    scene.view_settings.exposure = ex; scene.view_settings.keyframe_insert("exposure", frame=fr)
    return ge

# ---------- the man: time-lapse jumps between a few couch poses (he never leaves) ----------
POSES = [dict(np=20), dict(np=28, lean=26), dict(np=14, ny=-6, lean=18)]
def man_at(t):
    if T_WIDE <= t < T_SNAP:
        k, u = ph(t) if t >= T0 else (-1, .9)
        q = int(u * 4)
        if q == 3: return dict(np=26)                # night: still B's pose, hunched into the glow
        return dict(POSES[(k * 3 + q) % 3])
    p = dict(np=20)
    if T_MOVE0 - .25 <= t <= T_MOVE1 + .4:           # his left arm swipes the shoe off his knee, eyes on the toy
        u = clamp((t - (T_MOVE0 - .25)) / (T_MOVE1 + .65 - T_MOVE0))
        a = math.sin(math.pi * u)
        p.update(shL=(-33 + 30 * a, -28 - 25 * a), elL=-92 + 70 * a)
    return p

# ---------- the dog ----------
WIN = Vector((-2.05, 2.25)); MATP = Vector((W.MAT.x + .05, W.MAT.y + .02)); FEET = Vector((-.35, 1.75))
KNEE_SPOT = Vector((1.3, 1.5))
def walk_legs(t, amp=26):
    s = math.sin(2 * math.pi * t * 2.2) * amp
    return {"FL": s, "BR": s, "FR": -s, "BL": -s}
ASLEEP = (MATP, 200, W.CURL, .11, True, 0, None)
def dog_at(t):
    """(pos, heading, pose, z, shut, wag, legs)"""
    if t < T_WIDE: return ASLEEP
    if t < T_PICK - .6:
        if t < T0: return ASLEEP
        k, u = ph(t); q = int(u * 4)
        if q in (0, 3): return ASLEEP                # dawn and night: asleep on the pile
        if k % 2 == 0: return WIN, 90, W.SIT, 0, False, 0, None      # day: at the window
        return FEET, 10, W.LIE, 0, False, 0, None                    # or at his feet
    if t < T_PICK:                                   # gets up off the pile, shoe in mouth
        u = sm(T_PICK - .6, T_PICK, t)
        return MATP, lerp(200, 215, u), W.pmix(W.CURL, W.STAND, u), lerp(.11, 0, u), False, 0, None
    hd_in = W.heading_of(MATP, KNEE_SPOT)
    if t < T_KNEE - .15:                             # carries it to the man
        u = sm(T_PICK, T_KNEE - .15, t)
        return MATP.lerp(KNEE_SPOT, u), lerp(215, hd_in + 360 * (hd_in < 0), sm(0, .3, u)), W.STAND, 0, False, 0, walk_legs(t)
    hd = W.heading_of(KNEE_SPOT, Vector((.8, 2.1))); hd += 360 * (hd < 0)
    if t < 66.51:                                    # waits, ears up; sits back when the shoe is moved
        u = sm(T_MOVE1, T_MOVE1 + .5, t)
        p = W.pmix(W.STAND, W.SIT, u); p["ear"] = lerp(-20, 15, u)
        return KNEE_SPOT, hd, p, 0, False, 18 * math.sin(t * 9) * (1 - u), None
    t2 = 66.51
    hd_out = W.heading_of(KNEE_SPOT, MATP)
    if t < t2 + 1.4:                                 # turns and walks back to the mat
        u = sm(t2, t2 + 1.4, t)
        return KNEE_SPOT.lerp(MATP, u), lerp(hd, hd_out, sm(0, .25, u)), W.pmix(W.SIT, W.STAND, sm(0, .2, u)), 0, False, 0, walk_legs(t)
    u = sm(t2 + 1.4, t2 + 2.1, t)                    # lies down on the pile
    return MATP, hd_out, W.pmix(W.STAND, W.LIE, u), lerp(0, .11, u), False, 0, None

# ---------- screens ----------
def small_screen(t):
    if t >= 66.21: return "happy"
    return "idleA" if int(t * 2) % 2 == 0 else "idleB"
NIGHTS = [(T0 + k * DAY + .8 * DAY, T0 + k * DAY + .8 * DAY + .55, s) for k, s in ((0, "baby"), (1, "idleA"), (3, "happy"))]
def hero_name(t):
    if t < 49.95: return "egg"
    if t < 50.1: return None                         # the hatch blink
    if t < T_WIDE: return "happy"
    for a, b, s in NIGHTS:
        if a <= t < b: return s
    if t >= 66.21: return "happy"
    return "idleA"

# ---------- cameras and cuts ----------
c_hatch = shot_camera("a2_hatch", W.hp((.35, -6.7, -.2)), W.hp((0, 0, -.32)), lens=50)
c_wide = shot_camera("a2_wide", (3.3, .55, .55), (1.95, 2.5, .55), lens=24)       # still B's frame opened a touch for the side table
c_night = shot_camera("a2_night", W.hp((-.25, -5.6, .25)), W.hp((0, 0, .18)), lens=55)
c_knee = shot_camera("a2_knee", (-.9, .3, .95), (1.1, 1.95, .6), lens=28)
c_happy = shot_camera("a2_happy", W.hp((.12, -6.05, -.28)), W.hp((0, 0, -.32)), lens=50)
cut(F0, c_hatch); cut(sec(T_WIDE), c_wide)
for a, b, _ in NIGHTS: cut(sec(a), c_night); cut(sec(b), c_wide)
cut(sec(T_SNAP), c_knee); cut(sec(66.21), c_happy); cut(sec(67.3), c_knee)
scene.camera = c_hatch

# ---------- per frame ----------
prev_s = prev_h = None
for f in range(F0, F1 + 1):
    t = f / 24
    W.key_man(f, **man_at(t))
    pos, hd, pose, z, shut, wag, legs = dog_at(t)
    W.key_dog(f, pos, hd, pose, z=z, shut=shut, wag=wag, legs=legs)
    ge = key_light(f, t)
    bpy.context.view_layer.update()
    GLOW.location = small.matrix_world @ Vector((0, -2.5, .3)); GLOW.data.energy = ge
    GLOW.keyframe_insert("location", frame=f); GLOW.data.keyframe_insert("energy", frame=f)
    key(W.hero, f, rot=(R(-40 + .6 * math.sin(t * 1.3)), 0, R(.5 * math.sin(t * .9 + 1))))
    pr = clamp(max(0.0, 1 - abs(t - 49.8) / .08) + max(0.0, 1 - abs(t - 66.1) / .08))
    for s, th in W.thumbs.items(): key(th, f, rot=(0, 0, R(15) * s * pr * (-1 if s == 1 else 1)))
    if t >= T_KNEE - 1 / 24:                         # shoe2 on his knee, then moved to the cushion
        on_knee = MAN["kneeL"].matrix_world.translation + Vector((-.08, .1, .1))
        if t < T_MOVE0: loc = on_knee
        elif t < T_MOVE1:
            u = sm(T_MOVE0, T_MOVE1, t); loc = on_knee.lerp(CUSHION, u); loc.z += .25 * math.sin(math.pi * u)
        else: loc = CUSHION
        key(free, f, loc=loc, rot=(0, 0, R(lerp(-60, 20, sm(T_MOVE0, T_MOVE1, t)))))
    s_ = small_screen(t)
    if s_ != prev_s:
        for n, ob in W.SPR.items(): show(ob, f, n == s_)
        prev_s = s_
    h_ = hero_name(t)
    if h_ != prev_h:
        W.hero_screen(h_, f); prev_h = h_

W.finish(OUT)
