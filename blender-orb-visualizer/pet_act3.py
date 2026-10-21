# The pet, act 3 (68.9-81.5 s, frames 1654-1956): the harmonica break, the dog's window.
#   tools/render_lock.sh blender -b --factory-startup --python pet_act3.py -- --stills 1654,1760
# Shots (song frames):
#   S1 1654-1703  low behind the dog, chin on the sill, the park through the window (kite, the other dog circling)
#   S2 1704-1751  the dog's view, longer lens: the other dog runs its circle and leaps for the ball (~72.5)
#   S3 1752-1799  back on our dog, closer: ears up, tail sweeps
#   S4 1800-1823  the pond, the dog's view: a duck lands on the harmonica peak (75.0), a long ring
#   S5 1824-1895  reverse from the sidewalk: the dog's face behind the glass, breath fog; the man's back, the green glow
#   S6 1896-1956  the room: the dog walks back and lays his chin on the man's knee; his free hand pats on the thumb beat
# Local helpers (not in pet_world): other_dog() rig, flying_duck(), the landing rings, the fog patch.
# FINAL POSE at 1956 (act 4 matches this):
#   man:  W.key_man(f, np=26, ny=0, shL=(-20, -80), elL=-50)   (everything else MAN_SIT; toy parented to handR as posed by
#         W.pose_man(np=26); W.toy_in_hands(W.small))
#   dog:  W.key_dog(f, (.84, 1.22), 90, dict(W.SIT, bp=-15, hp=25, ear=12, tp=10))   chin over his left knee (.84, 2.04, .55),
#         dog head centre (.84, 1.775, .856); his left hand rests on the dog's head
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import pet_world as W
from pet_world import R, Vector, M, MAN, DOG, vis, sm, lerp, clamp, box, blocks, empty, mm
from film_kit import shot_camera, cut, key, show, sec

F0, F1, OUT = W.act_setup(3)
scene = W.scene

# ---------- static state (act 2's end: pile of 6 on the mat, shoe2 on the cushion, plant drooped) ----------
W.light_mode("day")
vis(W.c_leash, False); vis(W.c_ball, False); vis(W.blanket, False); vis(W.battery_tbl, False)
W.pile_items(6)
vis(W.PILE_OBS["shoe2"], True)
W.PILE_OBS["shoe2"].location = (.05, 2.36, .5); W.PILE_OBS["shoe2"].rotation_euler = (0, 0, R(-35))
vis(W.PLANT, False); W.sill_plant(1.0)

# the man seated, the toy parented to his right hand (take 06)
W.pose_man(np=26)
W.toy_in_hands(W.small)
mw = W.small.matrix_world.copy()
W.small.parent = MAN["handR"]; W.small.matrix_parent_inverse = MAN["handR"].matrix_world.inverted(); W.small.matrix_world = mw
GLOW = W.lcd_glow(W.small.matrix_world @ Vector((0, -2.5, .3)), 1.2)

# ---------- park life (local) ----------
mm("dog2", "#e9e2d2", .05, .04); mm("dog2b", "#3a332c", .05, .04); mm("fog", "#f4f6f4", .02, .1, rough=.3)

def other_dog():
    G = {}
    G["root"] = empty("odog", (0, 0, 0))
    G["body"] = empty("odog_body", (0, 0, .42), G["root"])
    box("odog_torso", (.6, .26, .24), (0, 0, 0), M["dog2"], G["body"])
    box("odog_patch", (.22, .27, .2), (-.1, 0, .03), M["dog2b"], G["body"])
    G["neck"] = empty("odog_neck", (.28, 0, .08), G["body"])
    box("odog_head", (.24, .22, .22), (.1, 0, .14), M["dog2"], G["neck"])
    box("odog_muz", (.14, .14, .1), (.26, 0, .09), M["dog2"], G["neck"])
    box("odog_nose", (.04, .07, .05), (.34, 0, .12), M["ink"], G["neck"])
    for s in (-1, 1): box(f"odog_ear{s}", (.08, .05, .14), (.06, .11 * s, .27), M["dog2b"], G["neck"])
    G["legs"] = {}
    for n, x, y in (("FL", .21, .09), ("FR", .21, -.09), ("BL", -.21, .09), ("BR", -.21, -.09)):
        lp = empty("odog_leg" + n, (x, y, -.08), G["body"]); G["legs"][n] = lp
        box("odog_legb" + n, (.08, .08, .3), (0, 0, -.15), M["dog2"], lp)
    G["tail"] = empty("odog_tail", (-.3, 0, .08), G["body"])
    box("odog_tailb", (.22, .05, .05), (-.11, 0, 0), M["dog2"], G["tail"])
    return G
OD = other_dog()
OBALL = blocks("oball", [((.16, .16, .12), (0, 0, 0)), ((.12, .12, .16), (0, 0, 0))], M["ball"])
RUN_C = Vector((-1.2, 15.0)); RUN_R = 2.2           # the other dog's circle, in the window's view

def flying_duck():
    d = W.duck("duckFly", (0, 0, 0), 0)
    wings = []
    for s in (-1, 1):
        p = empty(f"duckWingP{s}", (0, .1 * s, .17), d)
        box(f"duckWing{s}", (.22, .3, .03), (0, .15 * s, 0), M["duck"], p); wings.append((s, p))
    return d, wings
DFLY, DWINGS = flying_duck()
LAND = Vector((W.POND.x - 1.0, W.POND.y - .6, .07)); F_LAND = sec(75.0)
rings = [blocks(f"landRing{i}", [((1.0, .06, .01), (0, .5, 0)), ((1.0, .06, .01), (0, -.5, 0)),
                                  ((.06, 1.0, .01), (.5, 0, 0)), ((.06, 1.0, .01), (-.5, 0, 0))], M["water2"]) for i in range(2)]
for rg in rings: rg.location = (LAND.x, LAND.y, .085); rg.rotation_euler = (0, 0, R(45))

# the breath fog on the glass (the glass itself stays hidden; the fog is what shows it is there)
FOG = box("fog", (.34, .01, .2), (0, 3.02, 0), M["fog"])
try:
    fm = M["fog"]
    bsdf = [n for n in fm.node_tree.nodes if n.type == "BSDF_PRINCIPLED"][0]
    bsdf.inputs["Alpha"].default_value = .55
    fm.surface_render_method = "BLENDED"
except Exception as e:
    print("[act3] fog alpha:", e)
FOG.visible_shadow = False

# ---------- cameras ----------
WIN_DOG = Vector((-1.75, 2.12))           # our dog's spot at the window, facing +y
c1 = shot_camera("a3_s1", (-1.3, .85, 1.2), (-1.95, 6, 1.35), 30)
c2 = shot_camera("a3_s2", (-2.1, 3.45, 1.3), (RUN_C.x, RUN_C.y, .9), 45)
c3 = shot_camera("a3_s3", (-.85, 1.75, .95), (-1.75, 2.8, 1.0), 30)
c4 = shot_camera("a3_s4", (-2.1, 3.45, 1.3), (LAND.x - 1.0, LAND.y, .6), 60)
c5 = shot_camera("a3_s5", (-1.75, 4.25, 1.05), (-1.75, 2.85, .98), 42)
c6 = shot_camera("a3_s6", (2.75, .55, .72), (.8, 1.85, .72), 38)
for fr, c in ((F0, c1), (sec(71.0), c2), (sec(73.0), c3), (F_LAND, c4), (sec(76.0), c5), (sec(79.0), c6)):
    cut(fr, c)

# ---------- motion: pure functions of t ----------
CHIN_SPOT = Vector((.84, 1.22))             # dog root when its chin is on his left knee (sitting, facing +y)
T_WALK0, T_WALK1, T_SIT = 79.2, 80.6, 81.0

def our_dog(t):
    pose = dict(W.STAND); pose.update(hp=-16, tp=30)
    pos, head, z, legs = WIN_DOG, 90.0, 0.0, None
    perk = sm(71.6, 72.3, t) * (1 - sm(78.6, 79.4, t))
    pose["ear"] = -28 * perk
    sweep = sm(72.0, 72.6, t) * (1 - sm(76.5, 77.5, t))
    wag = 35 * sweep * math.sin(t * 2 * math.pi * 2.6)
    pose["tp"] = 30 + 20 * sweep
    pose["hy"] = 10 * math.sin(t * .9) * (1 - sweep) - 12 * sm(73.6, 74.4, t)
    if t < T_WALK0:
        pose["bz"] += .008 * math.sin(t * 2 * math.pi * .45)          # breathing
        return pos, head, pose, z, legs, wag
    # turn in place, then walk a route along the front of the rug, then the last step in to his knee
    a = WIN_DOG; b = Vector((-.6, .8)); c = Vector((.84, .55))
    turn = sm(T_WALK0, T_WALK0 + .45, t)
    head = lerp(90, -49, turn); pos = a
    u = sm(T_WALK0 + .4, T_WALK1, t)
    if u > 0:
        if u < .5:
            k = u / .5; pos = a.lerp(b, k); head = lerp(-49, -8, sm(.6, 1, k))
        else:
            k = (u - .5) / .5; pos = b.lerp(c, k); head = lerp(-8, 90, sm(.7, 1, k))
    st = math.sin(t * 2 * math.pi * 2.2) * (1 - sm(T_WALK1 - .1, T_WALK1, t)) * sm(T_WALK0, T_WALK0 + .15, t)
    legs = {"FL": 28 * st, "BR": 28 * st, "FR": -28 * st, "BL": -28 * st}
    pose["ear"] = 0; pose["hy"] = 0; pose["hp"] = 0; wag = 10 * math.sin(t * 9)
    v = sm(T_WALK1 - .05, T_SIT, t)                                     # the last step in, chin down on the knee
    pos = pos.lerp(CHIN_SPOT, v); head = lerp(head, 90, v)
    pose = W.pmix(pose, dict(W.SIT, bp=-15, hp=25, ear=12, tp=10), v)
    if t < F1 / 24: pose["hp"] += 3 * math.sin(t * 2 * math.pi * .45) * v
    wag = wag * (1 - v) + 14 * v * math.sin(t * 2 * math.pi * 1.2)
    return pos, head, pose, z, legs, wag
def man(t):
    p = dict(np=26, ny=0.0)
    pat = sm(80.4, 80.9, t)
    if pat > 0:
        bob = .5 + .5 * math.cos(t * 2 * math.pi * 2.0)       # one pat per thumb press
        if t >= F1 / 24: bob = 0.0
        p["shL"] = (lerp(-33, -20, pat), lerp(-28, -80, pat))
        p["elL"] = lerp(-92, -50, pat) - 14 * bob * pat                 # elbow lifts the hand off the head and back
    p["blink"] = .15 if (t % 3.7) < .1 else 1.0
    return p

def other(t):
    """the other dog: its circle, the leap for the ball at 72.5, then trotting on"""
    T_LEAP = 72.5
    ph = (t - 66.0) * 1.15
    pos = RUN_C + Vector((math.cos(ph), math.sin(ph))) * RUN_R
    head = math.degrees(ph) + 90
    leap = sm(T_LEAP - .35, T_LEAP, t) * (1 - sm(T_LEAP + .05, T_LEAP + .45, t))
    z = 1.1 * leap
    st = math.sin(t * 2 * math.pi * 3.0)
    legs = {"FL": 40 * st - 50 * leap, "FR": 40 * st - 50 * leap, "BL": -40 * st + 50 * leap, "BR": -40 * st + 50 * leap}
    hx, hy = math.cos(R(head)), math.sin(R(head))
    mouth = Vector((pos.x + .55 * hx, pos.y + .55 * hy, z + .75))
    bstart = Vector((RUN_C.x - 6, RUN_C.y + 3, 1.0))
    if t < T_LEAP:
        bu = clamp((t - (T_LEAP - 1.0)) / 1.0)
        bp = bstart.lerp(mouth, bu); bp.z += 2.2 * math.sin(math.pi * bu)
    else:
        bp = mouth
    return pos, head, z, legs, -18 * leap, bp

def duck_fly(t):
    """in from up left, gliding down, wings beating; lands on 75.0 then floats"""
    tl = 75.0; u = clamp((t - (tl - 2.2)) / 2.2)
    start = LAND + Vector((-6.0, 3.5, 3.5))
    if t < tl:
        p = start.lerp(LAND, u); p.z = lerp(start.z, LAND.z, u ** 1.6)
        flap = 55 * math.sin(t * 2 * math.pi * 4.0) * (1 - sm(.85, 1.0, u)) + 40 * sm(.85, 1.0, u)
    else:
        p = LAND + Vector((.35 * (t - tl) / 4, 0, 0)); flap = 40 * (1 - sm(tl, tl + .5, t))
    return p, flap

# ---------- key every frame ----------
show(GLOW, F0, True)
idle = ["idleA", "idleB"]
for n in W.SPR: show(W.SPR[n], F0, n == "idleA")
cur = "idleA"
for f in range(F0, F1 + 1):
    t = f / 24
    pos, head, pose, z, legs, wag = our_dog(t)
    W.key_dog(f, pos, head, pose, z=z, wag=wag, legs=legs)
    W.key_man(f, **man(t))
    scr = idle[int(t * 2) % 2]
    if scr != cur: show(W.SPR[scr], f, True); show(W.SPR[cur], f, False); cur = scr
    op, oh, oz, ol, opitch, bp = other(t)
    key(OD["root"], f, loc=(op.x, op.y, oz), rot=(0, 0, R(oh)), scale=(1.2, 1.2, 1.2))
    key(OD["body"], f, rot=(0, R(opitch), 0))
    for n, lp in OD["legs"].items(): key(lp, f, rot=(0, R(ol[n]), 0))
    key(OD["tail"], f, rot=(0, R(-30), R(25 * math.sin(t * 14))))
    key(OBALL, f, loc=bp)
    key(W.kite, f, loc=(-3 + .4 * math.sin(t * .8), 26, 7.5 + .5 * math.sin(t * 1.3)),
        rot=(R(8 * math.sin(t * 1.7)), R(45 + 10 * math.sin(t * 1.1)), 0))
    dp, flap = duck_fly(t)
    key(DFLY, f, loc=dp, rot=(0, 0, R(-30)))
    for s, wp in DWINGS: key(wp, f, rot=(R(flap * s), 0, 0))
    for i, rg in enumerate(rings):
        a = t - 75.0 - .45 * i
        s = .1 + 3.0 * clamp(a / 3.0) if 0 < a < 3.0 else .001
        key(rg, f, scale=(s, s, 1))
    br = .5 + .5 * math.sin(t * 2 * math.pi * .45)                       # breath fog grows on each breath out
    key(FOG, f, loc=(WIN_DOG.x + .05, 3.12, .86), scale=(1.1 + .6 * br, 1, 1.0 + .5 * br))
    GLOW.data.energy = 25.0 if 76.0 <= t < 79.0 else 1.2; GLOW.data.keyframe_insert("energy", frame=f)
FACE = W.lcd_glow((WIN_DOG.x + .35, 2.75, .95), 0); FACE.data.energy = 40; show(FACE, F0, False); show(FACE, sec(76.0), True); show(FACE, sec(79.0), False)
show(FOG, F0, False); show(FOG, sec(76.0), True); show(FOG, sec(79.0), False)

W.finish(OUT)
