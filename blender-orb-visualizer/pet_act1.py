# The pet, act 1 (song 21.0-49.3 s, frames 504-1183): verse 1. Take 06 (realthing_pet.py) ported onto pet_world.py
# and re-timed with STORYBOARD-pet.md's fixes:
#   - the 1.3x dog; each offer lands at his feet, and when he doesn't look the dog carries it to the door mat
#     (W.MAT) on screen: leash, then ball. The shoe stays at his feet; the dog lies down beside it, framed low.
#   - 44.26 he looks up, the dog lifts his head off the shoe, ears up.
#   - 47.24 he starts to stand, the dog stands too; the toy beeps NEW EGG?; he sits back down, thumb on 49.0,
#     the dog's ears drop.
# Take 06's close-ups and LCD sprite timings are kept (feed 22.75, HAPPY 24.15, sick 38.73, dead 41.44, empty 43.5).
#
# Shots (song s): 21.0 close on the toy | 25.84 wide room, dog walks in | 32.04 leash at his feet
#   | 33.05 leash to the mat, the ball to his feet | 34.65 ball to the mat, the shoe, he lies down (low, closer)
#   | 38.2 close: sick, dead, empty | 44.26 low: he looks up, dog lifts head | 47.24 he starts to stand
#   | 47.75 close: NEW EGG? | 48.4 he's back down, thumb on 49.0, ears drop.
#   tools/render_lock.sh blender -b --factory-startup --python pet_act1.py -- --stills 504,700,800
import os, sys, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pet_world as W
import bpy
from mathutils import Vector
from film_kit import shot_camera, cut, key, show, sec, FPS

F0, F1, OUT = W.act_setup(1)
R, sm, lerp, clamp = W.R, W.sm, W.lerp, W.clamp
MAN, DOG = W.MAN, W.DOG

# ---------- static set-up ----------
W.light_mode("day")
W.sunob.rotation_euler = W.SUN_A.normalized().to_track_quat('-Z', 'Y').to_euler()
W.pile_items(0)                                  # hooks full, mat empty (leash and ball are keyed below)
for ob in (W.blanket, W.battery_tbl): W.vis(ob, False)

def alerp(a, b, u):
    return a + ((b - a + 180) % 360 - 180) * u
hdg = W.heading_of

# where things go (floor plan; the man sits at (.73, 2.5) facing -y)
FEET = Vector((1.42, 1.98))         # offers land here, by his feet on the dog's side
RF = Vector((2.17, 1.55))           # the dog's spot facing him (heading 150), mouth over FEET
A0 = Vector((5.6, .8))              # in from the hall
BALL0 = Vector((3.32, 1.7))         # the ball lies on the floor by the side table
BALLST = Vector((2.52, 1.7))        # stance to pick it up (heading 0)
SHOE0 = Vector((3.58, 1.33))        # his other shoes by the side table
MATST = Vector((2.75, 1.33))        # stance to drop the ball on the mat (heading 90), and to pick the shoe (heading 0)
LEASH_ST = Vector((2.17, 1.5))      # stance to drop the leash on the mat (heading 90)
H_RF = 150.0

# =====================================================================================================
# THE DOG: a pure function of t
# =====================================================================================================
def dip(t, a, b, c, d, amt=44):
    return amt * sm(a, b, t) * (1 - sm(c, d, t))

def dog_state(t):
    s = dict(pos=Vector(RF), z=0.0, head=H_RF, pose=dict(W.STAND), walk=0.0, period=.32, wag=(14, 2.0),
             shut=False, breathe=0.0)
    def go(a, b, t0, t1, amp=30, period=.32):
        u = clamp((t - t0) / (t1 - t0)); s["pos"] = a.lerp(b, sm(t0, t1, t) * .3 + u * .7)
        s["head"] = hdg(a, b); s["period"] = period
        s["walk"] = amp * sm(t0 - .05, t0 + .08, t) * (1 - sm(t1 - .1, t1, t))
    p = s["pose"]
    if t < 29.0:                                             # in from the hall with the leash
        if t < 26.3: s["pos"] = Vector(A0); s["head"] = hdg(A0, RF)
        else: go(A0, RF, 26.3, 29.0, 26, .5)
        s["wag"] = (18, 2.0)
    elif t < 33.05:                                          # sits facing him, tilts, drops the leash at his feet
        s["head"] = alerp(hdg(A0, RF), H_RF, sm(29.0, 29.35, t))
        p = W.pmix(W.STAND, W.SIT, sm(29.5, 29.9, t))
        p["hr"] = 14 * sm(30.9, 31.2, t) * (1 - sm(31.6, 31.9, t))
        p["hp"] += dip(t, 32.3, 32.5, 32.64, 32.84, 37)
        p["hp"] -= 14 * sm(32.84, 33.0, t)                   # looks up at him
        s["wag"] = (30, 3.0) if t < 32.3 else (8, 1.0)
    elif t < 33.82:                                          # ignored: picks it up, turns, lays it on the mat
        p = W.pmix(W.SIT, W.STAND, sm(33.05, 33.2, t))
        p["hp"] += -14 * (1 - sm(33.05, 33.15, t)) + dip(t, 33.15, 33.25, 33.3, 33.38) + dip(t, 33.55, 33.66, 33.72, 33.82)
        u = sm(33.32, 33.55, t)
        s["head"] = alerp(H_RF, 90, u); s["pos"] = RF.lerp(LEASH_ST, u)
        s["wag"] = (6, 1.0)
    elif t < 34.26:                                          # to the ball
        s["pos"] = Vector(LEASH_ST)
        if t < 33.92: s["head"] = alerp(90, hdg(LEASH_ST, BALLST), sm(33.82, 33.92, t))
        else: go(LEASH_ST, BALLST, 33.9, 34.1, 30)
        p["hp"] += dip(t, 34.08, 34.16, 34.2, 34.26)
        s["wag"] = (20, 3.0)
    elif t < 34.92:                                          # ball to his feet
        if t < 34.47: go(BALLST, RF, 34.26, 34.47, 30)
        else: s["head"] = alerp(hdg(BALLST, RF), H_RF, sm(34.45, 34.55, t))
        p["hp"] += dip(t, 34.5, 34.58, 34.62, 34.72) - 14 * sm(34.72, 34.85, t)
        s["wag"] = (22, 3.0) if t < 34.72 else (10, 1.2)
    elif t < 35.6:                                           # ignored again: ball to the mat
        p["hp"] += -14 * (1 - sm(34.92, 34.98, t)) + dip(t, 34.92, 35.0, 35.04, 35.1)
        if t < 35.1: pass
        elif t < 35.38: go(RF, MATST, 35.1, 35.38, 30)
        else: s["pos"] = Vector(MATST); s["head"] = alerp(hdg(RF, MATST), 90, sm(35.36, 35.46, t))
        p["hp"] += dip(t, 35.44, 35.52, 35.55, 35.62)
        s["wag"] = (6, 1.0)
    elif t < 36.55:                                          # the shoe, to his feet; this one he leaves there
        s["pos"] = Vector(MATST)
        if t < 35.86:
            s["head"] = alerp(90, 0, sm(35.6, 35.7, t))
            p["hp"] += dip(t, 35.7, 35.78, 35.8, 35.86)
        elif t < 36.28: go(MATST, RF, 35.86, 36.28, 26)
        else: s["pos"] = Vector(RF); s["head"] = alerp(hdg(MATST, RF), H_RF, sm(36.26, 36.34, t))
        p["hp"] += dip(t, 36.32, 36.4, 36.44, 36.55)
        s["wag"] = (16, 2.4)
    elif t < 44.9:                                           # sits, gives up, lies down beside it, sleeps
        p = W.pmix(W.STAND, W.SIT, sm(36.55, 36.85, t)); p = W.pmix(p, W.LIE, sm(37.3, 37.9, t))
        p["ear"] += 20 * sm(36.9, 37.3, t); p["hp"] += 10 * sm(37.6, 38.0, t)
        s["shut"] = t >= 38.0; s["breathe"] = sm(37.9, 38.3, t)
        s["wag"] = (lerp(14, 0, sm(36.6, 37.4, t)), 1.4)
    else:                                                    # he looks: head up, ears up; stands; ears drop
        u = sm(45.0, 45.5, t); st = sm(47.3, 47.75, t); dr = sm(49.0, 49.25, t)
        p = W.pmix(W.LIE, W.STAND, st)
        p["ear"] = lerp(lerp(35, -20, u), -22, st) + 60 * dr
        p["hp"] = lerp(lerp(40, -6, u), -12, st) + 22 * dr
        s["breathe"] = 1 - u
        s["wag"] = ((10 * u + 18 * st) * (1 - dr), 2.4)
    s["pose"] = p
    return s

def key_dog(fr, t):
    s = dog_state(t); p = s["pose"]
    w = 2 * math.pi * t / s["period"]; sw = s["walk"] * math.sin(w)
    legs = {"FL": p["fl"] + sw, "BR": p["bl"] + sw, "FR": p["fl"] - sw, "BL": p["bl"] - sw}
    bob = .02 * abs(math.sin(w)) * (s["walk"] / 30)
    amp, f = s["wag"]
    br = 1 + .035 * s["breathe"] * math.sin(2 * math.pi * t / 2.6)
    DOG["body"].scale = (1, br, br)
    W.key_dog(fr, s["pos"], s["head"], p, z=s["z"] + bob, shut=s["shut"], wag=amp * math.sin(2 * math.pi * f * t), legs=legs)

# =====================================================================================================
# THE MAN
# =====================================================================================================
def pulse(t, at, w=.09):
    return clamp(1 - abs(t - at - .04) / w) if at - .05 <= t <= at + .13 else 0.0

def man_pose(t):
    p = dict(x=.73, y=2.5, hd=-90.0, pz=.55, hip=-90.0, knee=90.0, lean=22.0, np=20.0, ny=0.0,
             shL=(-33.0, -28.0), shR=(33.0, -28.0), elL=-92.0, elR=-92.0, blink=1.0)
    fid = 1 - sm(43.3, 43.5, t) + sm(47.75, 47.9, t)
    p["elL"] += 3 * fid * math.sin(t * 2 * math.pi * 2.3); p["elR"] += 3 * fid * math.sin(t * 2 * math.pi * 2.9 + 1)
    p["np"] += 1.5 * math.sin(t * 2 * math.pi * .4) * fid
    if 33.4 < t < 38.2: p["lean"] += 4 * sm(33.4, 34.0, t); p["ny"] = -8 * sm(33.4, 34.0, t)   # hunches away, never looks
    if t >= 44.26:
        u = sm(44.78, 45.3, t)                                   # looks up, at the dog
        p["np"] = lerp(p["np"], 6, u); p["ny"] = 34 * u; p["lean"] = lerp(22, 15, u)
        if 45.9 < t < 46.02: p["blink"] = .15
        r = .42 * sm(47.24, 47.75, t) * (1 - sm(48.4, 48.85, t))   # starts to stand ... and sits back down
        p["pz"] = lerp(.55, .97, r); p["hip"] = lerp(-90, 0, r); p["knee"] = lerp(90, 0, r)
        p["lean"] += 50 * r; p["y"] = 2.5 - .22 * r
        d = sm(47.75, 48.0, t)                                   # the beep pulls his eyes back down to the toy
        p["ny"] = lerp(p["ny"], 0, d); p["np"] = lerp(p["np"], 22, d)
        p["elR"] -= 7 * pulse(t, 49.0, .12)                       # thumb on 49.0
    return p

# =====================================================================================================
# KEY EVERY FRAME
# =====================================================================================================
def thumb_press(t, s):
    taps = [22.32, 22.6, 23.4] if s == 1 else [22.05, 24.3]
    fast = [39.0 + i * (.22 if s == 1 else .3) + (0 if s == 1 else .1) for i in range(12 if s == 1 else 8)]
    slow = [41.6 + i * .45 + (0 if s == 1 else .22) for i in range(4)]
    late = [49.0] if s == 1 else []
    v = 0.0
    for tp in taps + [x for x in fast if x < 41.3] + [x for x in slow if x < 43.3] + late:
        v = max(v, pulse(t, tp))
    return v

for fr in range(F0, F1 + 1):
    t = fr / FPS
    W.key_man(fr, **man_pose(t)); key_dog(fr, t)
    for s, pr in W.thumbs.items():
        rest = R(-3 * s) * (43.5 <= t < 47.6)
        key(pr, fr, rot=(0, 0, R(15) * s * thumb_press(t, s) * (-1 if s == 1 else 1) + rest))
    key(W.hero, fr, rot=(R(-40 + .6 * math.sin(t * 1.3)), 0, R(.5 * math.sin(t * .9 + 1))))

# ---------- LCD: take 06's states, then empty, then NEW EGG? with a beep ----------
S_NEWEGG = W.screen("stoy_newegg", [(W.EGG, 9, 3), ([".##.", "#..#", "..#.", ".#..", "....", ".#.."], 19, 5)], W.small)
SMALL = dict(W.SPR, newegg=S_NEWEGG)
def lcd_state(t):
    if t < 47.6: return W.lcd_state(t)
    return "newegg", 0, (t < 48.1 and int((t - 47.6) / .15) % 2 == 0)

prev = None
for fr in range(F0, F1 + 1):
    t = fr / FPS
    stt = lcd_state(t); name, gdown, lit = stt
    if stt != prev:
        for screens in (W.HSCREENS, SMALL):
            for n, ob in screens.items():
                on = (n == name)
                if prev is None or (prev[0] == n) != on: show(ob, fr, on)
        if prev is None or prev[2] != lit: show(W.bang, fr, lit)
        if name == "dead" and (prev is None or prev[1] != gdown or prev[0] != "dead"):
            for sp in (W.HSCREENS["dead"], SMALL["dead"]):
                sp.location = (0, 0, -gdown * W.CELL); sp.keyframe_insert("location", frame=fr)
        prev = stt

# ---------- the toy in his hands (parented to his right hand, as take 06) ----------
bpy.context.scene.frame_set(sec(30.0))
W.toy_in_hands(W.small)
mw = W.small.matrix_world.copy()
W.small.parent = MAN["handR"]; W.small.matrix_parent_inverse = MAN["handR"].matrix_world.inverted()
W.small.matrix_world = mw

# ---------- the offers: carried, dropped at his feet, carried to the mat ----------
def world_at(ob, fr):
    bpy.context.scene.frame_set(fr); return ob.matrix_world.translation.copy()

def fall(ob, t_rel, t_land, end):
    """ob drops from the dog's mouth at t_rel to `end` (world) at t_land; keyed location, holds after"""
    f_rel, f_land = sec(t_rel), sec(t_land)
    m = world_at(DOG["mouth"], f_rel)
    for fr in range(f_rel, f_land + 1):
        u = (fr - f_rel) / max(1, f_land - f_rel)
        ob.location = (lerp(m.x, end.x, u), lerp(m.y, end.y, u), lerp(m.z - .05, end.z, u * u))
        ob.keyframe_insert("location", frame=fr)

def carried(ob, spans):
    """visible (in the mouth) over [(t_on, t_off), ...]"""
    show(ob, F0, False)
    for a, b in spans:
        show(ob, F0 if a is None else sec(a), True); show(ob, sec(b), False)

def on_floor(ob, spans):
    show(ob, F0, False)
    for a, b in spans:
        show(ob, F0 if a is None else sec(a), True)
        if b is not None: show(ob, sec(b), False)

# leash: in the mouth -> at his feet 32.64 -> picked up 33.28 -> on the mat 33.78
f_leash = W.empty("a1_fLeash", (0, 0, 0))
W.blocks("a1_fLeashCoil", [((.42, .035, .02), (0, -.1, .01)), ((.035, .3, .02), (.2, .03, .01)), ((.38, .035, .02), (.02, .17, .01)),
                           ((.035, .22, .02), (-.18, .07, .01)), ((.2, .035, .02), (-.08, -.03, .03))], W.M["leash"], f_leash)
P_LEASH, P_BALL = W.PILE_OBS["leash"], W.PILE_OBS["ball"]
leash_end, ball_end = P_LEASH.location.copy(), P_BALL.location.copy()
carried(W.c_leash, [(None, 32.55), (33.28, 33.7)])
on_floor(f_leash, [(32.55, 33.28)])
on_floor(P_LEASH, [(33.7, None)])
fall(f_leash, 32.55, 32.64, Vector((FEET.x, FEET.y, 0)))
fall(P_LEASH, 33.7, 33.78, leash_end)

# ball: on the floor by the side table -> to his feet 34.66 -> picked up 35.0 -> on the mat 35.58
def ball(name):
    root = W.empty(name)
    W.blocks(name + "B", [((.13, .13, .09), (0, 0, .065)), ((.09, .09, .13), (0, 0, .065)), ((.09, .13, .09), (0, 0, .065)),
                          ((.13, .09, .09), (0, 0, .065))], W.M["ball"], root)
    return root
b0 = ball("a1_ball0"); b0.location = (BALL0.x, BALL0.y, 0)
f_ball = ball("a1_fBall")
on_floor(b0, [(None, 34.17)])
carried(W.c_ball, [(34.17, 34.58), (35.0, 35.52)])
on_floor(f_ball, [(34.58, 35.0)])
on_floor(P_BALL, [(35.52, None)])
fall(f_ball, 34.58, 34.66, Vector((FEET.x + .2, FEET.y - .16, 0)))
fall(P_BALL, 35.52, 35.58, ball_end)

# shoe: by the side table -> to his feet 36.47, where it stays (act 2 carries it to the mat)
s0 = W.shoe("a1_shoe0", None, (SHOE0.x, SHOE0.y, 0), (0, 0, R(-30)))
c_shoe = W.shoe("a1_cShoe", DOG["mouth"], (-.02, 0, -.06), (R(80), 0, R(90)))
f_shoe = W.shoe("a1_fShoe", None, (0, 0, 0), (R(78), 0, R(30)))
on_floor(s0, [(None, 35.78)])
carried(c_shoe, [(35.78, 36.4)])
on_floor(f_shoe, [(36.4, None)])
fall(f_shoe, 36.4, 36.47, Vector((FEET.x - .12, FEET.y + .1, .03)))

# =====================================================================================================
# CAMERAS AND CUTS
# =====================================================================================================
def cam(name, a, b, target, lens, f0, f1, tgt_b=None):
    c = shot_camera(name, a, target, lens=lens)
    key(c, f0, loc=a); key(c, f1, loc=b)
    tg = bpy.data.objects[c["target"]]
    if tgt_b is not None: key(tg, f0, loc=target); key(tg, f1, loc=tgt_b)
    return c

hp = W.hp
S = [sec(x) for x in (21.0, 25.84, 32.04, 33.05, 34.65, 38.2, 44.26, 47.24, 47.75, 48.4)] + [F1 + 1]
shots = [
    cam("a1_toy", hp((.35, -6.7, -.2)), hp((.12, -6.05, -.28)), hp((0, 0, -.32)), 50, S[0], S[1] - 1),
    cam("a1_room", (.6, -3.6, 1.7), (.75, -3.1, 1.6), (1.1, 1.9, .8), 28, S[1], S[2] - 1),
    cam("a1_leash", (.55, -1.0, 1.05), (.65, -.8, 1.0), (1.55, 1.95, .6), 32, S[2], S[3] - 1),
    cam("a1_ball", (.2, -.9, .75), (.3, -.75, .72), (2.3, 1.9, .4), 26, S[3], S[4] - 1),
    cam("a1_shoe", (.6, -.7, .62), (.75, .3, .36), (2.2, 1.8, .4), 26, S[4], S[5] - 1, (1.65, 1.9, .45)),
    cam("a1_sick", hp((-.25, -5.6, .25)), hp((-.05, -4.95, .25)), hp((0, 0, .18)), 55, S[5], S[6] - 1),
    cam("a1_look", (-.1, .6, .55), (0, .75, .55), (1.35, 2.15, .9), 20, S[6], S[7] - 1),
    cam("a1_rise", (2.6, -.9, .9), (2.55, -.8, .92), (1.1, 2.1, .85), 27, S[7], S[8] - 1),
    cam("a1_newegg", hp((.35, -6.7, -.2)), hp((.2, -6.2, -.25)), hp((0, 0, -.32)), 50, S[8], S[9] - 1),
    cam("a1_down", (.05, .8, .55), (.1, .9, .55), (1.4, 2.15, .9), 21, S[9], S[10] - 1),
]
for f, c in zip(S[:-1], shots): cut(f, c)

W.finish(OUT)
