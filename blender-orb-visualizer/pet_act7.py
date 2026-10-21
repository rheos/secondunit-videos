# The pet, act 7 (141.5-165.85 s, frames 3396-3980): refrain 3 + outro, the real thing.
#   tools/render_lock.sh blender -b --factory-startup --python pet_act7.py -- --stills 3396,3555,3600
# Shots (song frames):
#   P1 3396-3447  low and close: he kneels and unclips the leash at 142.07 (3410); the dog bows
#   P2 3448-3554  wide over the grass: the dog's big loop, the man running after him, laughing
#   P3 3555-3732  key still E's camera: the fish ring at 148.14, the dog stops and looks, the throw, the leap at 150.0
#                 (still E exactly), then the camera rises slowly over the park 150.0-155.5
#   P4 3733-3853  on the grass: the dog's head in his lap, his hands empty; 157.09 the belly roll; 158.76 he laughs
#   P5 3854-3891  outro wide on the room (window, the sun patch on the mat); 3892-3980 key still F's camera: the flat, empty; day light keyed onto the room's lights; fade 164.85-165.85
# Lights: light_mode('park') once; the outro keys the sun and the room fills to the 'day' values (the world sky stays
# the park sky, which is what shows through the window anyway).
import os, sys, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import pet_world as W
from pet_world import R, Vector, M, MAN, DOG, vis, scene, sm, lerp, clamp
from film_kit import shot_camera, cut, key, show, sec

F0, F1, OUT = W.act_setup(7)
CUT2, CUT3, CUT4, CUT5 = 3448, sec(148.14), sec(155.56), sec(160.6)
F_UNCLIP, F_RING, F_ROLL, F_LAUGH = sec(142.07), sec(148.14), sec(157.09), sec(158.76)

# ---------------------------------------------------------------- static set-up
for ob in (W.small, W.c_leash, W.c_ball, W.blanket, W.battery_tbl): vis(ob, False)
W.pile_items(6)                                  # acts 6-7 state: the hooks empty, the pile lifted off the mat
vis(W.PILE_OBS["leash"], False); vis(W.PILE_OBS["ball"], False)   # leash and ball went to the park
for n, (dx, dy, rz) in {"shoe": (-1.05, .25, 30), "keys": (-.95, -.2, 70), "scarf": (-1.3, -.05, 95),
                        "coat": (-1.5, .3, 12)}.items():
    W.PILE_OBS[n].location = (W.MAT.x + dx, W.MAT.y + dy, W.PILE_OBS[n].location.z); W.PILE_OBS[n].rotation_euler = (0, 0, R(rz))
vis(W.PLANT, False); W.sill_plant(.65)          # stays drooped
FLOOR_TOY = W.toy("ftoy7"); FLOOR_TOY.scale = (.045,) * 3          # the toy on the cushion, screen grey
FLOOR_TOY.location = (-.55, 2.38, .56); FLOOR_TOY.rotation_euler = (R(-62), 0, R(-18))
bpy.data.objects["CL_ftoy7_lcd"].data.materials[0] = M["lcdgrey"]
SMILE = W.box("man_smile7", (.03, .14, .03), (.19, 0, .1), M["smile"], MAN["neck"])

W.light_mode("park")
sun_park = (W.sunob.data.energy, tuple(W.sunob.data.color), W.sunob.rotation_euler.copy())
sun_day_rot = Vector((4.5, -.75, -2.2)).normalized().to_track_quat('-Z', 'Y').to_euler()
FILL, WIN, DOOR = (bpy.data.objects[n].data for n in ("CL_fill", "CL_winGlow", "CL_doorFill"))

# the leash: W.c_leash hangs off the dog until 142.07, then lies on the grass at the man's knee
leash_ground = W.blocks("leashGround7", [((.6, .035, .02), (0, 0, .01)), ((.035, .4, .02), (.28, .18, .01)),
                                         ((.5, .035, .02), (.05, .36, .01))], M["leash"])
leash_ground.location = (1.75, 13.45, 0)
fly_ball = W.blocks("flyBall7", [((.13, .13, .09), (0, 0, 0)), ((.09, .09, .13), (0, 0, 0)), ((.09, .13, .09), (0, 0, 0)),
                                 ((.13, .09, .09), (0, 0, 0))], M["ball"])
ground_ball = W.blocks("groundBall7", [((.13, .13, .09), (0, 0, .065)), ((.09, .09, .13), (0, 0, .065))], M["ball"])

# grass tufts: the wind runs through them as a travelling wave
rnd = random.Random(7)
TUFTS = []
while len(TUFTS) < 230:
    x, y = rnd.uniform(-13, 11), rnd.uniform(11.6, 29)
    if (Vector((x, y)) - W.POND).length < 4.1: continue
    h = rnd.uniform(.14, .3)
    parts = [((.05, .05, h), (0, 0, h / 2)), ((.05, .05, h * .7), (.07, .03, h * .35)), ((.05, .05, h * .8), (-.05, .06, h * .4))]
    ob = W.blocks(f"tuft7_{len(TUFTS)}", parts, M["grass2" if rnd.random() < .6 else "canopy2"])
    ob.location = (x, y, 0); ob.rotation_euler = (0, 0, rnd.uniform(0, 6.28)); TUFTS.append(ob)

def wind(x, y, t):
    """eased, never repeating: incommensurate waves travelling across the park, under a slow gust envelope"""
    gust = .55 + .45 * math.sin(.37 * t + .9) * math.sin(.23 * t + 2.1)
    return gust * (.6 * math.sin(1.31 * t - .33 * x - .21 * y) + .3 * math.sin(2.73 * t + .47 * y + 1.7)
                   + .18 * math.sin(.71 * t + .13 * x - .4))

# ---------------------------------------------------------------- paths (pure functions of t)
def catmull(pts, t):
    """pts = [(t, x, y)], Catmull-Rom through the points, clamped at the ends; equal neighbours = a hold"""
    if t <= pts[0][0]: return Vector(pts[0][1:])
    if t >= pts[-1][0]: return Vector(pts[-1][1:])
    i = max(k for k in range(len(pts) - 1) if pts[k][0] <= t)
    if pts[i][1:] == pts[i + 1][1:]: return Vector(pts[i][1:])
    n = len(pts) - 1
    p = [Vector(pts[min(max(j, 0), n)][1:]) for j in (i - 1, i, i + 1, i + 2)]
    u = (t - pts[i][0]) / (pts[i + 1][0] - pts[i][0])
    u2, u3 = u * u, u * u * u
    return .5 * ((2 * p[1]) + (-p[0] + p[2]) * u + (2 * p[0] - 5 * p[1] + 4 * p[2] - p[3]) * u2 + (-p[0] + 3 * p[1] - 3 * p[2] + p[3]) * u3)

DOG_PTS = [(141.5, 2.2, 14.3), (142.3, 2.2, 14.3), (142.95, .3, 15.3), (143.6, -2.4, 15.0), (144.4, -5.6, 15.6),
           (145.2, -8.0, 18.0), (146.0, -7.0, 21.3), (146.8, -3.8, 22.6), (147.5, -1.0, 21.4), (148.14, 0.0, 19.6),
           (149.1, 0.0, 19.6), (149.55, -.62, 18.75), (150.0, -1.6, 17.4), (150.5, -2.45, 16.2), (151.4, -1.7, 15.3),
           (152.4, .2, 15.05), (153.2, .3, 14.75), (155.0, .3, 14.75), (155.56, .46, 14.84), (165.9, .46, 14.84)]
MAN_PTS = [(141.5, 1.5, 13.8), (143.1, 1.5, 13.8), (143.9, .3, 14.5), (144.8, -2.2, 15.6), (145.7, -3.9, 17.5),
           (146.6, -3.2, 19.5), (147.5, -1.3, 18.8), (148.4, .5, 16.0), (149.05, 1.4, 14.6), (151.3, 1.4, 14.6),
           (153.6, 1.05, 15.55), (165.9, 1.05, 15.55)]

def dpos(t): return catmull(DOG_PTS, t)
def mpos(t): return catmull(MAN_PTS, t)
def speed(fn, t): return (fn(t + .02) - fn(t - .02)).length / .04

# headings and gait phases are integrated once over the act (deterministic tables, indexed by frame)
def ang_to(v): return math.degrees(math.atan2(v.y, v.x))
def ang_ease(a, b, u):
    d = (b - a + 180) % 360 - 180; return a + d * u
RING = W.ring.location.copy()
SIT_HD = -62.0
W.mm("ring7", "#f4fbff", .02, .06, emit=1.5, rough=.2); W.ring.data.materials[0] = M["ring7"]
DOG_SIT_HD = 28.0
def dog_head_raw(t, prev):
    if t < 142.3: return 215.0                                               # facing him, side-on to P1's camera
    if 148.14 <= t < 149.05: return ang_to(RING.to_2d() - dpos(t))           # stops and looks at the ring
    if t >= 153.2: return DOG_SIT_HD
    v = dpos(t + .03) - dpos(t - .03)
    return ang_to(v) if v.length > .01 else prev
def man_head_raw(t, prev):
    if t < 143.1: return 35.0
    if 149.05 <= t < 151.3: return 128.0                                       # still E's throw heading
    if t >= 153.6: return SIT_HD
    v = mpos(t + .03) - mpos(t - .03)
    return ang_to(v) if v.length > .01 else prev
DH, MH, DPH, MPH = {}, {}, {}, {}
dh, mh, dph, mph = 215.0, 35.0, 0.0, 0.0
for f in range(F0, F1 + 1):
    t = f / 24
    dh = ang_ease(dh, dog_head_raw(t, dh), .35); mh = ang_ease(mh, man_head_raw(t, mh), .3)
    if 149.9 <= t <= 150.1: dh = 235.0                                       # still E exactly
    dph += speed(dpos, t) / 24 / 1.5 * 2 * math.pi; mph += speed(mpos, t) / 24 / 1.6 * 2 * math.pi
    DH[f], MH[f], DPH[f], MPH[f] = dh, mh, dph, mph

LEAP = dict(W.STAND); LEAP.update(bp=-12, fl=-64, bl=58, hp=-18, tp=55, ear=-30)
BOW = dict(W.STAND); BOW.update(bz=.33, bp=16, fl=-40, bl=10, hp=-20, tp=60, ear=-10)
LOOK = dict(W.STAND); LOOK.update(hp=-2, ear=20, tp=20)
BACK = dict(W.LIE); BACK.update(bz=.2, fl=-120, bl=-40, hp=10, ty=10)

def dog_state(f):
    t = f / 24; pos = dpos(t); sp = speed(dpos, t); ph = DPH[f]; run = clamp(sp / 5.0)
    wag = 34 * math.sin(t * 17)
    pose = dict(W.STAND); z = 0.0; legs = None; shut = False
    if t < 142.07: pose = W.pmix(W.STAND, LOOK, sm(141.5, 141.9, t))
    elif t < 142.4: pose = W.pmix(LOOK, BOW, sm(142.07, 142.25, t))                 # the play bow
    if run > .05 and not (149.55 <= t <= 150.45):
        a = 48 * run
        legs = {"FL": a * math.sin(ph), "FR": a * math.sin(ph + .5), "BL": -a * math.sin(ph + 2.4), "BR": -a * math.sin(ph + 2.9)}
        z = .09 * run * abs(math.sin(ph)); pose = dict(pose); pose["bp"] = pose["bp"] + 6 * run * math.sin(ph + 1.2)
        pose["ear"] = -25 * run; pose["tp"] = 50
    if 148.14 <= t < 149.05:                                                      # the fish: stop, look
        pose = W.pmix(W.STAND, LOOK, sm(148.14, 148.4, t)); legs = None; z = 0; wag = 6 * math.sin(t * 9)
    if 149.55 <= t <= 150.45:                                                     # the leap, still E at 150.0
        u = (t - 149.55) / .9; z = .62 * math.sin(math.pi * u)
        pose = W.pmix(W.STAND, LEAP, math.sin(math.pi * u) ** .6); legs = None
    if t >= 153.2:                                                                # by the man; lies down for him
        pose = W.pmix(W.STAND, W.LIE, sm(154.6, 155.4, t)); legs = None; z = 0
        wag = 30 * math.sin(t * 11) * (1 - .6 * sm(155.0, 156.0, t))
    roll = 0.0
    if 155.56 <= t < 157.09:
        pose = dict(pose); pose["hp"] = 34; shut = 156.2 < t < 156.9              # head in his lap, eyes shut a moment
    if t >= 157.09:                                                               # the belly roll
        k = sm(157.09, 157.6, t); pose = W.pmix(W.LIE, BACK, k); roll = 165 * k
        legs = {n: v + 14 * math.sin(t * 7 + i) * k for i, (n, v) in enumerate((("FL", -120), ("FR", -110), ("BL", -40), ("BR", -50)))}
        wag = 20 * math.sin(t * 13)
    return pos, DH[f], pose, z, shut, wag, legs, roll

E_POSE = dict(x=1.4, y=14.6, hd=128, pz=.92, hip=0, swL=-38, swR=34, knee=0, kneeR=55, lean=14, np=-6,
              shL=(-10, 40), shR=(14, -150), elL=-30, elR=-12)
KNEEL = dict(pz=.56, hip=-4, knee=92, kneeR=None, lean=26, np=-10, swL=0, swR=0, shL=(-8, -50), shR=(6, -70), elL=-30, elR=-48)
STANDP = dict(pz=.92, hip=0, knee=0, kneeR=None, lean=4, np=0, swL=0, swR=0, shL=(-8, 0), shR=(8, 0), elL=-10, elR=-10)
GRASS = dict(pz=.13, hip=-90, knee=18, kneeR=None, lean=12, np=24, swL=0, swR=0, shL=(-20, -30), shR=(20, -40), elL=-50, elR=-45)

def mix_pose(a, b, u):
    out = {}
    for k in set(a) | set(b):
        va, vb = a.get(k, W.MAN_SIT[k]), b.get(k, W.MAN_SIT[k])
        if va is None or vb is None: out[k] = vb if u > .5 else va
        elif isinstance(va, tuple): out[k] = tuple(lerp(x, y, u) for x, y in zip(va, vb))
        else: out[k] = lerp(va, vb, u)
    return out

def man_state(f):
    t = f / 24; p = mpos(t); sp = speed(mpos, t); ph = MPH[f]; run = clamp(sp / 4.0)
    pose = mix_pose(KNEEL, STANDP, sm(142.6, 143.2, t))
    if t < 142.07:                                                       # the unclip: hand to the collar
        pose["shR"] = (6, -70 + 8 * math.sin(t * 9)); pose["np"] = -4
    if run > .05:
        s = run; c = math.sin(ph)
        pose.update(swL=34 * s * c, swR=-34 * s * c, knee=10 + 55 * s * max(0, -c), kneeR=10 + 55 * s * max(0, c),
                    shL=(-10, -38 * s * c), shR=(10, 38 * s * c), elL=-70 * s, elR=-70 * s, lean=4 + 12 * s)
        pose["pz"] = .92 - .03 * s + .04 * s * abs(c)
        pose["np"] = -12 * s * (.5 + .5 * math.sin(t * 6.3))                       # laughing, head back in bursts
    if 149.05 <= t < 151.3:                                                  # wind-up 149.1-149.5, whip to still E by 149.8
        ready = mix_pose(STANDP, dict(E_POSE, shR=(14, 70), elR=-60, swL=-20, swR=20, kneeR=30, lean=-4), sm(149.1, 149.5, t))
        pose = mix_pose(ready, E_POSE, sm(149.5, 149.8, t))
        pose = mix_pose(pose, STANDP, sm(150.5, 151.3, t))
    if t >= 151.3:
        walk = clamp(sp / 1.2); c = math.sin(ph)
        pose = dict(STANDP); pose.update(swL=22 * walk * c, swR=-22 * walk * c, shL=(-8, -20 * walk * c), shR=(8, 20 * walk * c))
        pose = mix_pose(pose, GRASS, sm(154.7, 155.5, t))                         # sits down on the grass
    if t >= 155.5:
        pose = dict(GRASS)
        pose["shR"] = (16, -46 + 6 * math.sin(t * 5)); pose["elR"] = -30                # hand on the dog's head / belly
        if t >= 157.09: pose["shR"] = (12, -58 + 10 * math.sin(t * 8)); pose["elR"] = -20
        lf = sm(158.76, 159.0, t) * (1 - sm(159.6, 160.2, t))
        pose["np"] = lerp(24, -14, lf); pose["lean"] = lerp(12, 0, lf)               # 158.76: he laughs
    pose.update(x=p.x, y=p.y, z=0.0, hd=MH[f], pitch=0.0)
    if 149.9 <= t <= 150.1: pose = dict(E_POSE, z=0.0, pitch=0.0)           # still E exactly
    pose["blink"] = .12 if (t % 3.7) < .1 else 1.0
    return pose

# the ball's flight: from his hand at 149.6 into the dog's mouth at 150.0
def world_after(fn):
    fn(); bpy.context.view_layer.update()
def pose_dog_state(s): W.pose_dog(s[0], s[1], s[2], z=s[3], legs=s[6])
REL, CATCH = sec(149.6), sec(150.0)
world_after(lambda: W.pose_man(**man_state(REL))); hand0 = MAN["handR"].matrix_world.translation.copy()
world_after(lambda: pose_dog_state(dog_state(CATCH))); mouth1 = DOG["mouth"].matrix_world.translation.copy()
DROP = sec(152.6)
world_after(lambda: pose_dog_state(dog_state(DROP))); m2 = DOG["mouth"].matrix_world.translation.copy()
ground_ball.location = (m2.x, m2.y, 0)

# ---------------------------------------------------------------- cameras
cam1 = shot_camera("a7_unclip", (.5, 15.9, .8), (1.9, 14.1, .5), lens=32)
camR = shot_camera("a7_ring", (RING.x - 1.2, RING.y - 3.6, 1.7), (RING.x, RING.y, 0), lens=40)
F_RINGOUT = F_RING + 24
cam2 = shot_camera("a7_loop", (3.6, 11.4, 1.5), (-3.0, 18.5, .7), lens=30)
cam3 = shot_camera("a7_E", (-5.0, 20.5, .45), (.8, 15.2, 1.5), lens=26)
cam4 = shot_camera("a7_grass", (2.35, 13.2, .78), (.85, 15.4, .35), lens=34)
cam5 = shot_camera("a7_F", (-.75, .7, .85), (-.25, 2.6, .6), lens=32)
cam5w = shot_camera("a7_room", (.3, -1.3, 1.35), (.3, 2.6, .7), lens=20)
CUT5B = sec(162.2)
for f, c in ((F0, cam1), (CUT2, cam2), (CUT3, camR), (F_RINGOUT, cam3), (CUT4, cam4), (CUT5, cam5w), (CUT5B, cam5)): cut(f, c)
tgt = {c.name: bpy.data.objects[c["target"]] for c in (cam2, cam3, cam4, cam5)}
E_LOC, E_TGT = Vector((-5.0, 20.5, .45)), Vector((.8, 15.2, 1.5))
UP_LOC, UP_TGT = Vector((-1.0, 24.0, 12.0)), Vector((1.0, 15.0, 0.0))

# ---------------------------------------------------------------- per-frame keys
for ob in (MAN["root"], DOG["root"], FLOOR_TOY, fly_ball, ground_ball, W.ring, leash_ground):
    show(ob, F0, ob in (MAN["root"], DOG["root"], FLOOR_TOY))
show(SMILE, F0, True); show(W.c_leash, F0, True); show(W.c_leash, F_UNCLIP, False)   # the leash hangs off his collar until 142.07
show(leash_ground, F_UNCLIP, True)
show(fly_ball, REL, True); show(fly_ball, CATCH, False); show(W.c_ball, F0, False); show(W.c_ball, CATCH, True)
show(W.c_ball, DROP, False); show(ground_ball, DROP, True)
show(W.ring, F_RING, True); show(W.ring, F_RING + 40, False)
for ob in (MAN["root"], DOG["root"], ground_ball, leash_ground): show(ob, CUT5, False)
key(W.ring, F0, scale=(.2, .2, 1))
show(W.TREES[0], F0, True); show(W.TREES[0], F_RINGOUT, False); show(W.TREES[0], CUT4, True)   # clears the canopy at the end of the rise

for f in range(F0, F1 + 1):
    t = f / 24
    if f < CUT5:
        W.key_man(f, **man_state(f))
        pos, hd, pose, z, shut, wag, legs, roll = dog_state(f)
        W.key_dog(f, pos, hd, pose, z=z, shut=shut, wag=wag, legs=legs)
        b = DOG["body"]; b.rotation_euler.x = R(roll); b.keyframe_insert("rotation_euler", frame=f)
        if REL <= f <= CATCH:
            u = (f - REL) / (CATCH - REL); p = hand0.lerp(mouth1, u); p.z += 1.6 * math.sin(math.pi * u)
            key(fly_ball, f, loc=p)
        if F_RING <= f <= F_RING + 40:
            s = .3 + 3.4 * sm(0, 1, (f - F_RING) / 40); key(W.ring, f, scale=(s, s, 1))
        if f % 2 == 0 or f == CUT5 - 1:                                       # wind: trees, grass, ducks
            for i, tr in enumerate(W.TREES):
                w = wind(tr.location.x, tr.location.y, t)
                key(tr, f, rot=(R(1.6 * w), R(2.2 * w + .4 * math.sin(.9 * t + i)), 0))
            for tf in TUFTS:
                w = wind(tf.location.x, tf.location.y, t)
                tf.rotation_euler.x = R(14 * w); tf.rotation_euler.y = R(9 * w); tf.keyframe_insert("rotation_euler", frame=f)
            for i, dk in enumerate(W.DUCKS):
                dk.location.z = .07 + .015 * math.sin(1.7 * t + i * 2.1); dk.keyframe_insert("location", frame=f)
    # cameras
    if CUT2 <= f < CUT3:
        dp = dpos(t)
        key(tgt[cam2.name], f, loc=Vector((-3.0, 18.5, .7)).lerp(Vector((dp.x, dp.y, .6)), .7))
    if CUT3 <= f < CUT4:
        u = sm(150.0, 155.5, t)
        key(cam3, f, loc=E_LOC.lerp(UP_LOC, u)); key(tgt[cam3.name], f, loc=E_TGT.lerp(UP_TGT, u))
    if CUT4 <= f < CUT5:
        u = (f - CUT4) / (CUT5 - CUT4)
        key(cam4, f, loc=Vector((2.35, 13.2, .78)).lerp(Vector((2.1, 13.5, .72)), u))
    if f >= CUT5B:
        u = (f - CUT5B) / (F1 - CUT5B)
        key(cam5, f, loc=Vector((-.75, .7, .85)).lerp(Vector((-.6, .9, .82)), u))

# light: park to day at the outro cut, then the fade on the last second
def key_light(f, energy, color, rot, fill, win, door, expo):
    W.sunob.data.energy = energy; W.sunob.data.color = color; W.sunob.rotation_euler = rot
    W.sunob.data.keyframe_insert("energy", frame=f); W.sunob.data.keyframe_insert("color", frame=f)
    W.sunob.keyframe_insert("rotation_euler", frame=f)
    for d, e in ((FILL, fill), (WIN, win), (DOOR, door)): d.energy = e; d.keyframe_insert("energy", frame=f)
    FILL.color = (1, 1, 1); FILL.keyframe_insert("color", frame=f)
    scene.view_settings.exposure = expo; scene.view_settings.keyframe_insert("exposure", frame=f)
# the sun patch on the empty mat: the sun alone can't reach the mat through this window, so a warm, hard spot from
# the window does it, on from the outro cut
pd = bpy.data.lights.new("CL_matSun7", "SPOT"); pd.color = (1.0, .88, .66); pd.shadow_soft_size = .02
pd.spot_size = R(26); pd.spot_blend = .05
patch = bpy.data.objects.new("CL_matSun7", pd); scene.collection.objects.link(patch); patch.location = (.6, 2.95, 2.7)
patch.rotation_euler = (Vector((2.4, 2.3, 0)) - patch.location).to_track_quat('-Z', 'Y').to_euler()
for fr, e in ((F0, 0), (CUT5 - 1, 0), (CUT5, 2600)): pd.energy = e; pd.keyframe_insert("energy", frame=fr)
PARK = (sun_park[0], sun_park[1], sun_park[2], 0, 0, 0, .25)
DAY = (9.0, (1.0, .9, .74), sun_day_rot, 420, 60, 70, .35)
key_light(F0, *PARK); key_light(CUT5 - 1, *PARK); key_light(CUT5, *DAY); key_light(sec(164.85), *DAY)
key_light(F1, *DAY[:-1], -9.0)

from bpy_extras.object_utils import world_to_camera_view
if "--probe" in sys.argv:
    for fr in (3700, 3720, 3732):
        scene.frame_set(fr); scene.camera = cam3
        for tr in W.TREES:
            v = world_to_camera_view(scene, cam3, tr.matrix_world @ Vector((0, 0, 3)))
            if -.2 < v.x < 1.2 and -.2 < v.y < 1.2: print("PROBE", fr, tr.name, tuple(round(c, 2) for c in v))
W.finish(OUT)
