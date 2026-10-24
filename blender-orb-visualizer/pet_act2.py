# The pet, act 2 (49.3-68.9 s, frames 1183-1654): refrain 1, the days go by.
#   tools/render_lock.sh blender -b --factory-startup --python pet_act2.py -- --stills 1183,1300,1404
# Draft 2 (Bob on d1b: "49 - 1:03 I don't get it"): one front-on wide holds the whole time-lapse, so the room never
# jumps. Five days, each shorter than the last (2.9 s down to 1.8 s): the sun patch crosses the floor from the window,
# dusk goes orange, night goes blue with only the LCD on his face; the clock over the door spins, the calendar left of
# the window drops a page every dawn (12 -> 17), the sill plant droops a step. The man never moves but for a slow
# slump. The dog does one errand a day at time-lapse speed: the shoe from his feet, then the keys, the scarf, the
# coat off the hooks, each onto the mat; he sits by the pile facing the man, his ears drop at dusk, he sleeps on the
# pile. Day five he doesn't get up. One LCD insert on the third night: the pet dies and he hatches another.
# Shots: hatch close (49.3) | the wide, a slow push (51.0) with the re-hatch insert | the shoe on the knee (63.77)
#        | HAPPY close (66.21) | the dog goes back to the mat (67.3).
import os, sys, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import pet_world as W
from pet_world import R, Vector, MAN, DOG, small, scene, lerp, clamp, blocks, M
from film_kit import shot_camera, cut, key, show, sec

F0, F1, OUT = W.act_setup(2)

def sm(a, b, t): return W.sm(a, b, t)

# ---------- the days ----------
T_WIDE, T_SNAP = 51.0, 63.77
DUR = [2.9, 2.5, 2.15, 1.95, 1.8]                  # each day shorter: the days blur together
STARTS = [T_WIDE + sum(DUR[:k]) for k in range(len(DUR))]
TL_END = STARTS[-1] + DUR[-1]                      # 62.3: 7:30 on the sixth morning, then real time again
H0, NIGHT_U = 7.5, .74                             # each day runs 7:30 -> 7:30; u < NIGHT_U is 7:30-21:30
def day_of(t):
    """(day k, u in [0, 1)) inside the time-lapse"""
    for k, (s, d) in enumerate(zip(STARTS, DUR)):
        if t < s + d: return k, max(0.0, (t - s) / d)
    return len(DUR) - 1, .9999
def hour_of_u(u):
    if u < NIGHT_U: return H0 + 14.0 * u / NIGHT_U
    return 21.5 + 10.0 * (u - NIGHT_U) / (1 - NIGHT_U)
def u_of_hour(h):
    if h < 21.5: return (h - H0) / 14.0 * NIGHT_U
    return NIGHT_U + (h - 21.5) / 10.0 * (1 - NIGHT_U)
def hours(t):
    """hours since midnight of day 0 (act 1's morning), continuous through the act"""
    if t < T_WIDE: return H0 - (T_WIDE - t) / 3600
    if t >= TL_END: return 24 * len(DUR) + H0 + (t - TL_END) / 3600
    k, u = day_of(t)
    return 24 * k + hour_of_u(u)
FLIPS = [s + u_of_hour(30.0) * d for s, d in zip(STARTS, DUR)]   # 6:00 each morning: the calendar, the plant

# ---------- static set-up ----------
W.light_mode("day")
for ob in (W.c_leash, W.c_ball, W.blanket): W.vis(ob, False)
W.pile_items(2)                                     # act 1 ends with leash + ball on the mat
for n in W.PILE_ORDER: show(W.PILE_OBS[n], F0, n in ("leash", "ball"))
for ob in (W.hook_keys, W.hook_scarf, W.hook_coat): show(ob, F0, True)

# the calendar: 12 on the pad, a page torn off at every 6:00
DAY0 = 12
for n in range(DAY0, DAY0 + len(FLIPS) + 1): show(W.cal_page(n), F0, n == DAY0)
for i, tf in enumerate(FLIPS): W.cal_flip(DAY0 + i, tf)

# the coin cell on the side table: days 0 and 1, gone from day 2's dawn
show(W.battery_tbl, F0, True); show(W.battery_tbl, sec(FLIPS[1]), False)

# the sill plant droops a step each morning
W.vis(W.PLANT, False); show(W.PLANT, F0, False)
PLANTS = [W.sill_plant(d) for d in (0.0, .25, .5, .75, 1.0)]
for i, p in enumerate(PLANTS): show(p, F0, i == 0)
for k in range(4):
    fr = sec(FLIPS[k])
    for i, p in enumerate(PLANTS): show(p, fr, i == k + 1)

# hero close-up: a baby sprite for the re-hatch
W.HSCREENS["baby"] = W.screen("hpet_baby", [(W.WALK_PET, 9, 6)], W.hero)
show(W.bang, F0, False)

# small toy in his hands, parented to the right hand the way take 06 does
W.pose_man()
W.toy_in_hands(small)
mw = small.matrix_world.copy()
small.parent = MAN["handR"]; small.matrix_parent_inverse = MAN["handR"].matrix_world.inverted(); small.matrix_world = mw
GLOW = W.lcd_glow((0, 0, 0), 0)

# ---------- the errands: what the dog fetches each day, from where ----------
FEET_SHOE = Vector((1.30, 2.08))                    # where act 1 left the shoe (his feet)
RF = Vector((2.17, 1.55)); H_RF = 150.0             # act 1's spot facing him; the shoe is under his mouth here
MATST = Vector((2.75, 1.33))                        # stance to drop on the mat (heading 90)
MATP = Vector((W.MAT.x + .05, W.MAT.y + .02))       # asleep on the pile
SITP = Vector((2.55, 1.55)); H_SIT = W.heading_of(SITP, Vector((.73, 2.4)))   # sits by the pile, facing him
HK = {"keys": Vector((3.75, 2.02)), "scarf": Vector((3.45, 2.02)), "coat": Vector((3.15, 2.02))}
ERRAND = {0: "shoe", 1: "keys", 2: "scarf", 3: "coat"}            # day 4: nothing left on the hooks
HOOK = {"keys": W.hook_keys, "scarf": W.hook_scarf, "coat": W.hook_coat}
mouth = DOG["mouth"]
CARRY = {"shoe": W.shoe("a2_cShoe", mouth, (.04, 0, -.05), (R(90), 0, R(90))),
         "keys": blocks("a2_cKeys", [((.03, .09, .02), (.03, 0, -.03)), ((.02, .06, .02), (.03, .05, -.06))], M["keys"], mouth),
         "scarf": blocks("a2_cScarf", [((.06, .12, .04), (.03, 0, -.02)), ((.05, .1, .45), (.03, .06, -.24))], M["scarf"], mouth),
         "coat": blocks("a2_cCoat", [((.08, .3, .1), (.03, 0, -.03)), ((.06, .42, .6), (.0, .05, -.33))], M["coat"], mouth)}
for ob in CARRY.values(): show(ob, F0, False)
floor_shoe = W.shoe("a2_fShoe", None, (FEET_SHOE.x, FEET_SHOE.y, .03), (R(78), 0, R(30)))
show(floor_shoe, F0, True)

# per-day schedule in u (fractions of the day). Day 0 starts where act 1 ended: standing at RF over the shoe.
def U(k, u): return STARTS[k] + u * DUR[k]
GRAB, DROP = {}, {}
for k, item in ERRAND.items():
    GRAB[item] = U(k, .03 if k == 0 else .33)
    DROP[item] = U(k, .27 if k == 0 else .57)
for item in ERRAND.values():
    show(CARRY[item], sec(GRAB[item]), True); show(CARRY[item], sec(DROP[item]), False)
    show(W.PILE_OBS[item], sec(DROP[item]), True)
    if item in HOOK: show(HOOK[item], sec(GRAB[item]), False)
show(floor_shoe, sec(GRAB["shoe"]), False)

# ---------- the man: he never leaves the couch; a slow slump, hunched to the glow at night ----------
def night_amt(t):
    if not (T_WIDE <= t < TL_END): return 0.0
    h = hours(t) % 24
    return sm(19.5, 21.0, h) if h >= 12 else 1 - sm(5.5, 7.0, h)
T_MOVE0, T_MOVE1 = 64.62, 65.5
def man_at(t):
    if T_WIDE <= t < T_SNAP:
        prog = sm(T_WIDE, TL_END, t); nt = night_amt(t)
        return dict(np=lerp(20, 27, max(nt, .5 * prog)), lean=lerp(22, 30, prog), ny=3 * math.sin(t * .7))
    p = dict(np=20)
    if T_MOVE0 - .25 <= t <= T_MOVE1 + .4:           # his left arm swipes the shoe off his knee, eyes on the toy
        u = clamp((t - (T_MOVE0 - .25)) / (T_MOVE1 + .65 - T_MOVE0))
        a = math.sin(math.pi * u)
        p.update(shL=(-33 + 30 * a, -28 - 25 * a), elL=-92 + 70 * a)
    return p

# ---------- the dog ----------
def walk_legs(t, amp=30, hz=4.0):
    s = math.sin(2 * math.pi * t * hz) * amp
    return {"FL": s, "BR": s, "FR": -s, "BL": -s}
def unwrap(a, ref):
    while a - ref > 180: a -= 360
    while a - ref < -180: a += 360
    return a
def hd_lerp(a, b, u): return lerp(a, unwrap(b, a), u)
REAR = dict(bz=.52, bp=-52, fl=55, bl=40, hp=-30, hy=0, hr=0, tp=45, ty=0, ear=-10)
ASLEEP = (MATP, 200, W.CURL, .11, True, 0, None)
def wait_and_sleep(u, t, frm, hd_from, u0=.6):
    """after the drop (from u0): to SITP, sit facing him; ears drop at dusk; back onto the pile at nightfall"""
    if u < .64: v = sm(u0, .64, u); return frm.lerp(SITP, v), hd_lerp(hd_from, H_SIT, v), W.STAND, 0, False, 0, walk_legs(t)
    if u < .67: return SITP, H_SIT, W.pmix(W.STAND, W.SIT, sm(.64, .67, u)), 0, False, 18 * math.sin(t * 18), None
    if u < .74:
        p = dict(W.SIT); dr = sm(.69, .72, u); p["ear"] = lerp(-15, 30, dr); p["hp"] = lerp(0, 22, dr)
        return SITP, H_SIT, p, 0, False, 14 * math.sin(t * 18) * (1 - dr), None
    hp_ = W.heading_of(SITP, MATP)
    if u < .78: v = sm(.74, .78, u); return SITP.lerp(MATP, v), hd_lerp(H_SIT, hp_, sm(0, .4, v)), W.pmix(W.SIT, W.STAND, sm(0, .3, v)), 0, False, 0, walk_legs(t)
    if u < .83: v = sm(.78, .83, u); return MATP, hd_lerp(hp_, 200, v), W.pmix(W.STAND, W.CURL, v), lerp(0, .11, v), v > .8, 0, None
    return ASLEEP
def errand_day(k, u, t):
    """the dog on day k (1-3): asleep -> to the hook -> rear up, grab -> to the mat, drop -> sits facing him -> pile"""
    item = ERRAND[k]; hk = HK[item]
    h_out = W.heading_of(MATP, hk); h_back = W.heading_of(hk, MATST)
    if u < .08: return ASLEEP
    if u < .13:
        v = sm(.08, .13, u)
        return MATP, hd_lerp(200, h_out, v), W.pmix(W.CURL, W.STAND, v), lerp(.11, 0, v), False, 0, None
    if u < .22: v = sm(.13, .22, u); return MATP.lerp(hk, v), h_out, W.STAND, 0, False, 10 * math.sin(t * 20), walk_legs(t)
    if u < .25: return hk, hd_lerp(h_out, 90, sm(.22, .25, u)), W.STAND, 0, False, 0, None
    if u < .31: return hk, 90, W.pmix(W.STAND, REAR, sm(.25, .31, u)), 0, False, 0, None
    if u < .35: return hk, 90, REAR, 0, False, 15 * math.sin(t * 25), None
    if u < .39: return hk, 90, W.pmix(REAR, W.STAND, sm(.35, .39, u)), 0, False, 0, None
    if u < .41: return hk, hd_lerp(90, h_back, sm(.39, .41, u)), W.STAND, 0, False, 0, None
    if u < .5: v = sm(.41, .5, u); return hk.lerp(MATST, v), h_back, W.STAND, 0, False, 0, walk_legs(t)
    if u < .53: return MATST, hd_lerp(h_back, 90, sm(.5, .53, u)), W.STAND, 0, False, 0, None
    if u < .6:                                       # head down: the drop
        p = dict(W.STAND); p["hp"] += 40 * math.sin(math.pi * sm(.53, .6, u))
        return MATST, 90, p, 0, False, 0, None
    return wait_and_sleep(u, t, MATST, 90)
def day0(u, t):
    """from act 1's end: standing at RF over the shoe -> carries it to the mat -> waits (slower) -> pile"""
    h_go = W.heading_of(RF, MATST)
    if u < .06:
        p = dict(W.STAND); p["hp"] += 35 * math.sin(math.pi * sm(0, .06, u))
        return RF, H_RF, p, 0, False, 0, None
    if u < .1: return RF, hd_lerp(H_RF, h_go, sm(.06, .1, u)), W.STAND, 0, False, 0, None
    if u < .2: v = sm(.1, .2, u); return RF.lerp(MATST, v), h_go, W.STAND, 0, False, 12 * math.sin(t * 20), walk_legs(t)
    if u < .23: return MATST, hd_lerp(h_go, 90, sm(.2, .23, u)), W.STAND, 0, False, 0, None
    if u < .3:
        p = dict(W.STAND); p["hp"] += 40 * math.sin(math.pi * sm(.23, .3, u))
        return MATST, 90, p, 0, False, 0, None
    return wait_and_sleep(u, t, MATST, 90, u0=.3)
T_PICK, T_KNEE = 62.95, T_SNAP
KNEE_SPOT = Vector((1.3, 1.5))
def dog_at(t):
    """(pos, heading, pose, z, shut, wag, legs)"""
    if t < T_WIDE:                                   # act 1's last pose: standing at RF, ears down
        p = dict(W.STAND); p["ear"] = 38; p["hp"] = 10
        return RF, H_RF, p, 0, False, 0, None
    if t < T_PICK - .6:
        k, u = day_of(t)
        if k == 0: return day0(u, t)
        if k in ERRAND: return errand_day(k, u, t)
        if t >= STARTS[4] and .3 < u < .55:         # day 4: nothing left to bring. He lifts his head, puts it back.
            a = math.sin(math.pi * sm(.3, .55, u))
            p = dict(W.CURL); p["hp"] = lerp(48, 5, a); p["hy"] = lerp(70, 20, a)
            return MATP, 200, p, .11, False, 0, None
        return ASLEEP
    if t < T_PICK:                                   # gets up off the pile, shoe in mouth
        u = sm(T_PICK - .6, T_PICK, t)
        return MATP, lerp(200, 215, u), W.pmix(W.CURL, W.STAND, u), lerp(.11, 0, u), False, 0, None
    hd_in = W.heading_of(MATP, KNEE_SPOT)
    if t < T_KNEE - .15:                             # carries it to the man
        u = sm(T_PICK, T_KNEE - .15, t)
        return MATP.lerp(KNEE_SPOT, u), lerp(215, hd_in + 360 * (hd_in < 0), sm(0, .3, u)), W.STAND, 0, False, 0, walk_legs(t, 26, 2.2)
    hd = W.heading_of(KNEE_SPOT, Vector((.8, 2.1))); hd += 360 * (hd < 0)
    if t < 66.51:                                    # waits, ears up; sits back when the shoe is moved
        u = sm(T_MOVE1, T_MOVE1 + .5, t)
        p = W.pmix(W.STAND, W.SIT, u); p["ear"] = lerp(-20, 15, u)
        return KNEE_SPOT, hd, p, 0, False, 18 * math.sin(t * 9) * (1 - u), None
    t2 = 66.51
    hd_out = W.heading_of(KNEE_SPOT, MATP)
    if t < t2 + 1.4:                                 # turns and walks back to the mat
        u = sm(t2, t2 + 1.4, t)
        return KNEE_SPOT.lerp(MATP, u), lerp(hd, hd_out, sm(0, .25, u)), W.pmix(W.SIT, W.STAND, sm(0, .2, u)), 0, False, 0, walk_legs(t, 26, 2.2)
    u = sm(t2 + 1.4, t2 + 2.1, t)                    # lies down on the pile
    return MATP, hd_out, W.pmix(W.STAND, W.LIE, u), lerp(0, .11, u), False, 0, None

# shoe2: carried in the dog's mouth, then free (on his knee, then moved to the cushion)
carried = W.shoe("act2CarryShoe", DOG["mouth"], (.04, 0, -.05), (R(90), 0, R(90)))
free = W.shoe("act2Shoe2", None, (0, 0, 0), (0, 0, 0))
show(carried, F0, False); show(carried, sec(T_PICK - .6), True); show(carried, sec(T_KNEE), False)
show(free, F0, False); show(free, sec(T_KNEE), True)
CUSHION = Vector((-.05, 2.36, .52))

# ---------- the light: a palette per hour, keyed on the datablocks every frame ----------
fill = bpy.data.objects["CL_fill"].data; win = bpy.data.objects["CL_winGlow"].data; door = bpy.data.objects["CL_doorFill"].data
wn = scene.world.node_tree
bg = [n for n in wn.nodes if n.type == "BACKGROUND"][0]; el = [n for n in wn.nodes if n.type == "VALTORGB"][0].color_ramp.elements
HX = lambda h: Vector(W.K.hex_lin(h))
# sun E, sun col, fill E, fill col, win E, win col, door E, sky lo, sky hi, sky strength, exposure, lcd glow
PAL = {
    "dawn":  (4.0, (1.0, .7, .5), 110, (.85, .78, .9), 45, (1.0, .78, .65), 15, HX("#e0a888"), HX("#8aa0c8"), .55, .28, .8),
    "day":   (14.0, (1.0, .9, .74), 380, (1, 1, 1), 60, (1.0, .93, .8), 70, HX("#eceee6"), HX("#bcd6ec"), .85, .35, .3),
    "dusk":  (5.0, (1.0, .5, .25), 130, (1.0, .72, .55), 40, (1.0, .55, .35), 20, HX("#f09050"), HX("#5a5a8a"), .6, .3, 1.0),
    "night": (.0, (.6, .7, 1.0), 110, (.5, .58, .9), 14, (.5, .6, 1.0), 0, HX("#1c2640"), HX("#28345a"), .4, .24, 4.0),
}
STOPS = [(0, "night"), (4.8, "night"), (6.4, "dawn"), (8.6, "day"), (16.6, "day"), (18.6, "dusk"), (20.4, "night"), (24, "night")]
def mixv(a, b, u):
    if isinstance(a, (int, float)): return lerp(a, b, u)
    return Vector(a).lerp(Vector(b), u)
def light_at(t):
    if t < T_WIDE or t >= TL_END: return PAL["day"]
    h = hours(t) % 24
    for (h0, a), (h1, b) in zip(STOPS, STOPS[1:]):
        if h0 <= h < h1:
            w = sm(0, 1, (h - h0) / (h1 - h0))
            return tuple(mixv(x, y, w) for x, y in zip(PAL[a], PAL[b]))
    return PAL["night"]
def sun_dir(t):
    """the sun crosses the window left to right through the day, so its patch walks the floor"""
    if t < T_WIDE or t >= TL_END: return Vector((.55, -1.0, -.72))
    v = clamp((hours(t) % 24 - 6.0) / 13.5)
    a = R(lerp(-55, 55, v)); e = R(20 + 35 * math.sin(math.pi * v))
    return Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), -math.sin(e)))
def key_light(fr, t):
    sE, sC, fE, fC, wE, wC, dE, lo, hi, ss, ex, ge = light_at(t)
    W.sunob.data.energy = sE; W.sunob.data.color = sC
    fill.energy = fE; fill.color = fC; win.energy = wE; win.color = wC; door.energy = dE
    for d, ps in ((W.sunob.data, ("energy", "color")), (fill, ("energy", "color")), (win, ("energy", "color")), (door, ("energy",))):
        for p in ps: d.keyframe_insert(p, frame=fr)
    W.sunob.rotation_euler = sun_dir(t).normalized().to_track_quat('-Z', 'Y').to_euler(); W.sunob.keyframe_insert("rotation_euler", frame=fr)
    el[0].color = (*lo, 1); el[-1].color = (*hi, 1); el[0].keyframe_insert("color", frame=fr); el[-1].keyframe_insert("color", frame=fr)
    bg.inputs["Strength"].default_value = ss; bg.inputs["Strength"].keyframe_insert("default_value", frame=fr)
    scene.view_settings.exposure = ex; scene.view_settings.keyframe_insert("exposure", frame=fr)
    return ge

# ---------- the clock: true time outside the time-lapse; inside it, the minute hand at a quarter of true speed ----------
SPIN = 4.0
H_TL0, H_TL1 = hours(T_WIDE), hours(TL_END)
def minute_turns(t):
    h = hours(t)
    if h <= H_TL0: return h
    if h <= H_TL1: return H_TL0 + (h - H_TL0) / SPIN
    return H_TL0 + (H_TL1 - H_TL0) / SPIN + (h - H_TL1)

# ---------- screens ----------
def small_screen(t):
    if t >= 66.21: return "happy"
    return "idleA" if int(t * 2) % 2 == 0 else "idleB"
T_INS = STARTS[2] + .77 * DUR[2]                    # the third night: the pet dies, a new egg, a new pet
INS = [(0.0, "dead"), (.32, "egg"), (.62, None), (.66, "baby"), (.95, "end")]
def hero_name(t):
    if t < 49.95: return "egg"
    if t < 50.1: return None                         # the hatch blink
    if t < T_WIDE: return "happy"
    if T_INS <= t < T_INS + INS[-1][0]:
        cur = None
        for a, s in INS:
            if t - T_INS >= a: cur = s
        return cur
    if t >= 66.21: return "happy"
    return "idleA"
PRESS = [49.8, 66.1, T_INS + .3, T_INS + .6]

# ---------- cameras and cuts ----------
WIDE_A = (Vector((.75, -3.05, 1.62)), Vector((.75, 2.6, 1.08)))
WIDE_B = (Vector((.8, -2.5, 1.5)), Vector((.85, 2.6, 1.02)))
c_hatch = shot_camera("a2_hatch", W.hp((.35, -6.7, -.2)), W.hp((0, 0, -.32)), lens=50)
c_wide = shot_camera("a2_wide", WIDE_A[0], WIDE_A[1], lens=27)
w_tgt = bpy.data.objects[c_wide["target"]]
c_ins = shot_camera("a2_ins", W.hp((-.25, -5.6, .25)), W.hp((0, 0, .18)), lens=55)
c_knee = shot_camera("a2_knee", (-.9, .3, .95), (1.1, 1.95, .6), lens=28)
c_happy = shot_camera("a2_happy", W.hp((.12, -6.05, -.28)), W.hp((0, 0, -.32)), lens=50)
cut(F0, c_hatch); cut(sec(T_WIDE), c_wide)
cut(sec(T_INS), c_ins); cut(sec(T_INS + INS[-1][0]), c_wide)
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
    u = sm(T_WIDE, T_SNAP, t)                        # the slow push across the whole time-lapse
    key(c_wide, f, loc=WIDE_A[0].lerp(WIDE_B[0], u)); key(w_tgt, f, loc=WIDE_A[1].lerp(WIDE_B[1], u))
    key(W.clock_h, f, rot=(0, R(30 * hours(t)), 0)); key(W.clock_m, f, rot=(0, R(360 * minute_turns(t)), 0))
    bpy.context.view_layer.update()
    GLOW.location = small.matrix_world @ Vector((0, -2.5, .3)); GLOW.data.energy = ge
    GLOW.keyframe_insert("location", frame=f); GLOW.data.keyframe_insert("energy", frame=f)
    key(W.hero, f, rot=(R(-40 + .6 * math.sin(t * 1.3)), 0, R(.5 * math.sin(t * .9 + 1))))
    pr = clamp(sum(max(0.0, 1 - abs(t - p) / .08) for p in PRESS))
    for s, th in W.thumbs.items(): key(th, f, rot=(0, 0, R(15) * s * pr * (-1 if s == 1 else 1)))
    if t >= T_KNEE - 1 / 24:                         # shoe2 on his knee, then moved to the cushion
        on_knee = MAN["kneeL"].matrix_world.translation + Vector((-.08, .1, .1))
        if t < T_MOVE0: loc = on_knee
        elif t < T_MOVE1:
            v = sm(T_MOVE0, T_MOVE1, t); loc = on_knee.lerp(CUSHION, v); loc.z += .25 * math.sin(math.pi * v)
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
