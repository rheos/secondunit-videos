# The pet, act 4 (81.5-105.8 s, song frames 1956-2539): verse 2, the walk that isn't. STORYBOARD-pet.md act 4.
#   tools/render_lock.sh blender -b --factory-startup --python pet_act4.py -- --stills 1956,2160
# 82.02 the WALK icon (a shoe) blinks on the LCD; he presses it. 87.66 the pet walks its pixel path past a pixel tree
# and an empty pixel pond, two frames, a step counter ticking. 88.66 the real dog sits at his feet with the real
# leash, watching. 89.5 key still C (his point of view). 94.44-97.7 the dog walks laps of the rug, step for step
# with the pet; the man smiles at the screen. 100.66 the battery icon blinks; 102.33 the LCD goes grey; he shakes
# it and presses all three buttons.
# Local helpers (not in pet_world): walk_set() builds the animated WALK screens on a toy root (pet at 19 columns x 2
# frames, 4 counter digits x 10, battery icon, the menu shoe, a grey cover over the LCD); Vis keys visibility only
# on change.
import os, sys, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import pet_world as W
from pet_world import R, Vector, Matrix, M, MAN, DOG, small, sm, lerp, clamp
from film_kit import shot_camera, cut, key, show, sec

F0, F1, OUT = W.act_setup(4)
scene = W.scene

# ---------- timing (song seconds) ----------
T_ICON, T_PRESS, T_WALK = 82.02, 86.9, 87.66
T_LAP0, T_LAPS, T_LAPEND = 94.44, (95.37, 96.57, 97.7), 97.7
T_BATT, T_GREY = 100.66, 102.33
STEP = .25                                    # one pet step (and one dog footfall) every 6 frames

def steps_at(t): return max(0, int((t - T_WALK) / STEP))

# ---------- static set-up: hide what act 4 doesn't use ----------
for ob in (W.blanket, W.battery_tbl, W.c_ball): W.vis(ob, False)
W.vis(W.c_leash, True)
W.pile_items(6)
W.vis(W.PLANT, False); DROOP = W.sill_plant(1.0)
W.light_mode("day")
W.sunob.rotation_euler = Vector((.55, -1.0, -.72)).normalized().to_track_quat('-Z', 'Y').to_euler()
for n, ob in W.SPR.items(): W.vis(ob, False)
W.hero_screen(None)
SMILE = W.box("a4_smile", (.03, .14, .03), (.19, 0, .1), M["smile"], MAN["neck"])

# ---------- the animated WALK screens (one set per toy root) ----------
WALK_A = ["..#..#..", "..####..", ".#....#.", ".#.#.#.#", ".#....#.", "..####..", ".#....#."]
WALK_B = ["..#..#..", "..####..", ".#....#.", ".#.#.#.#", ".#....#.", "..####..", "..#..#.."]
BIG_SHOE = ["....####....", "....####....", "....######..", "....#######.", "############", "############"]
ARROW = ["#..", "##.", "###", "##.", "#.."]
POND_FAR = [".#.#.#.#.", "#.#.#.#.#", ".#.#.#.#."]       # three rows of water dots, nothing in them
NCOL = 19

def walk_set(root, p):
    S = {}
    sc = lambda name, parts: W.screen(f"{p}_{name}", parts, root)
    S["menu"] = sc("menu", [(BIG_SHOE, 9, 6)])
    S["arrow"] = sc("arrow", [(ARROW, 4, 6)])
    S["shoe"] = sc("shoe", [(W.SHOE_ICON, 0, 1)])
    S["batt"] = sc("batt", [(W.BATT, 0, 0)])
    S["scene"] = sc("scene", [(W.TREE_PX, 1, 8), (POND_FAR, 15, 6), (W.PATH_PX, 0, 16)])
    S["pet"] = {(c, k): sc(f"pet{c}_{k}", [(WALK_A if k == 0 else WALK_B, c, 9)]) for c in range(NCOL) for k in (0, 1)}
    S["dig"] = {(i, d): sc(f"d{i}_{d}", [(W.DIG[str(d)], 10 + 4 * i, 0)]) for i in range(4) for d in range(10)}
    S["idleA"] = sc("idleA", W.FRAMES["idleA"]); S["idleB"] = sc("idleB", W.FRAMES["idleB"])
    S["grey"] = W.box(f"{p}_grey", (W.LW * W.CELL, .03, W.LH * W.CELL), (0, -.81, W.LCD_Z), M["lcdgrey"], root)
    return S

HS = walk_set(W.hero, "a4h"); SS = walk_set(small, "a4s")

def lcd_on(t):
    """the set of screen keys lit at song time t"""
    if t >= T_GREY: return {"grey"}
    if t < T_ICON: return {"idleA" if int(t / .42) % 2 == 0 else "idleB"}
    on = set()
    if t < T_WALK:
        on.add("menu")
        if t >= T_PRESS or int((t - T_ICON) / .3) % 2 == 0: on.add("arrow")
        if T_PRESS <= t < T_PRESS + .3 and int((t - T_PRESS) / .1) % 2 == 1: on.discard("menu")
        return on
    n = steps_at(t)
    on.add("scene")
    blink = t >= T_BATT and int((t - T_BATT) / .25) % 2 == 0
    on.add("batt" if blink else "shoe")
    on.add(("pet", (n % NCOL, n % 2)))
    for i, ch in enumerate(f"{min(n, 9999):04d}"): on.add(("dig", (i, int(ch))))
    return on

_vis = {}
def vset(ob, f, on):
    if _vis.get(ob.name) != on or f == F0:
        show(ob, f, on); _vis[ob.name] = on

def key_screens(S, f, on):
    for k, v in S.items():
        if isinstance(v, dict):
            for kk, ob in v.items(): vset(ob, f, (k, kk) in on)
        else: vset(v, f, k in on)

# ---------- the man: seated, head down on the toy (still C's pose) ----------
W.pose_man(np=30, ny=-4)
TOY_HOLD = W.toy_in_hands(small)
HOLD_MW = small.matrix_world.copy()
eye = (MAN["eyes"][0].matrix_world.translation + MAN["eyes"][1].matrix_world.translation) / 2
knee = MAN["kneeL"].matrix_world.translation.copy()

# ---------- the dog: chin on knee -> sits at his feet -> laps of the rug -> sits ----------
SIT_AT = Vector((.74, .72)); A0 = R(-70)
RX, RY = .62, .34
LOOP_C = SIT_AT - Vector((RX * math.cos(A0), RY * math.sin(A0)))
CHIN = dict(W.STAND); CHIN.update(hp=34, bz=.4, ear=12, tp=10)
W.pose_dog((knee.x + .1, 1.0), 90, CHIN)
m = DOG["mouth"].matrix_world.translation.copy()
KNEE_AT = Vector((knee.x + .1, 1.0 + (knee.y - .12 - m.y)))
print(f"[act4] knee {tuple(round(v, 2) for v in knee)} mouth z {m.z:.2f} chin spot {tuple(round(v, 2) for v in KNEE_AT)}")
LOOK = dict(W.SIT); LOOK.update(hp=-26, ear=-8)        # sitting, looking up at the screen (still C)
WALK = dict(W.STAND); WALK.update(hp=-14, ear=-20, tp=40)

def lap_angle(t):
    ks = [(T_LAP0, A0)] + [(tt, A0 + 2 * math.pi * (i + 1)) for i, tt in enumerate(T_LAPS)]
    if t <= ks[0][0]: return A0
    for (ta, aa), (tb, ab) in zip(ks, ks[1:]):
        if t <= tb:
            u = (t - ta) / (tb - ta)
            if ta == T_LAP0: u = .5 * u * u * (3 - 2 * u) + .5 * u     # starts from a sit
            return lerp(aa, ab, u)
    return ks[-1][1]

def dog_at(t):
    """pos, heading, pose, wag, legs, bob"""
    ph = (t - T_WALK) / STEP * math.pi                 # one pet step = half a leg cycle: step for step
    if t < 82.6:                                        # chin on the knee, tail low and slow
        return KNEE_AT, 90, CHIN, 8 * math.sin(t * 3), None, 0
    if t < 84.2:                                        # backs off and sits at his feet
        u = sm(82.6, 84.0, t); s_ = sm(83.4, 84.2, t)
        pos = KNEE_AT.lerp(SIT_AT, u); pose = W.pmix(CHIN, LOOK, s_)
        sw = 22 * math.sin(t * 14) * (1 - sm(83.6, 84.2, t))
        return pos, 90, pose, 0, dict(FL=pose["fl"] + sw, FR=pose["fl"] - sw, BL=pose["bl"] - sw, BR=pose["bl"] + sw), 0
    if t < T_LAP0 - .25:                                # sits, leash in mouth, watching the screen; tilts at the walk
        pose = dict(LOOK)
        pose["hr"] = 10 * sm(T_WALK + .3, T_WALK + .8, t) * (1 - sm(91.5, 92.3, t))
        pose["ear"] = -8 - 18 * sm(T_WALK + .3, T_WALK + .6, t)
        return SIT_AT, 90, pose, 6 * math.sin(t * 5) * sm(T_WALK, T_WALK + 1, t), None, 0
    if t < T_LAPEND + .6:                               # up and round the rug
        a = lap_angle(t); u_up = sm(T_LAP0 - .25, T_LAP0 + .1, t); u_dn = sm(T_LAPEND, T_LAPEND + .6, t)
        pos = LOOP_C + Vector((RX * math.cos(a), RY * math.sin(a)))
        tang = Vector((-RX * math.sin(a), RY * math.cos(a)))
        hd = math.degrees(math.atan2(tang.y, tang.x))
        hd_t = hd + 360 * round((math.degrees(a) + 90 - hd) / 360)      # unwrapped across the laps
        head = lerp(lerp(90, hd_t, u_up), 90 + 360 * 3, u_dn)
        pose = W.pmix(W.pmix(LOOK, WALK, u_up), LOOK, u_dn)
        amp = 30 * u_up * (1 - u_dn); sw = amp * math.sin(ph)
        legs = dict(FL=pose["fl"] + sw, BR=pose["bl"] + sw, FR=pose["fl"] - sw, BL=pose["bl"] - sw)
        bob = .02 * abs(math.sin(ph)) * (amp / 30)
        return pos, head, pose, 35 * math.sin(t * 18) * u_up * (1 - u_dn), legs, bob
    pose = dict(LOOK); pose["ear"] = -8 + 20 * sm(T_GREY, T_GREY + .5, t)      # ears drop when the screen dies
    pose["hr"] = 12 * sm(T_GREY + .4, T_GREY + 1.0, t)
    wag = 10 * math.sin(t * 6) * (1 - sm(T_BATT, T_GREY, t))
    return SIT_AT, 90 + 360 * 3, pose, wag, None, 0

# ---------- cameras and cuts ----------
CUTS = {}
def cam(name, f, loc, target, lens):
    c = shot_camera(name, loc, target, lens=lens); cut(f, c); CUTS[name] = f; return c

F_ICON = sec(T_ICON); F_DOGCUT = sec(88.66); F_POV = sec(89.5); F_LAPS = sec(T_LAP0); F_CLOSE2 = sec(98.0)
c_knee = cam("a4_knee", F0, (2.75, 1.45, .8), (.85, 1.7, .68), 30)
c_menu = cam("a4_menu", F_ICON, W.hp((.35, -6.9, -.05)), W.hp((0, 0, -.05)), 50)
key(c_menu, F_ICON, loc=W.hp((.35, -6.9, -.05))); key(c_menu, F_DOGCUT - 1, loc=W.hp((.2, -6.3, -.05)))
c_dog = cam("a4_dog", F_DOGCUT, (2.7, .8, .55), (.75, 1.15, .7), 28)
# still C: his point of view over the toy, down past his knees to the dog
cam_at = eye + Vector((.02, .38, .42))
n_ = (cam_at - TOY_HOLD).normalized(); up = Vector((0, -1, 0)); up = (up - n_ * up.dot(n_)).normalized()
yax = -n_; xax = yax.cross(up)
POV_MW = Matrix((xax, yax, up)).transposed().to_4x4() @ Matrix.Diagonal((.045, .045, .045, 1))
POV_MW.translation = TOY_HOLD
W.pose_dog(SIT_AT, 90, LOOK); mouth = DOG["mouth"].matrix_world.translation.copy()
c_pov = cam("a4_pov", F_POV, cam_at, TOY_HOLD.lerp(mouth, .4), 26)
c_wide = cam("a4_laps", F_LAPS, (-.9, -2.4, 1.55), (.55, 1.25, .5), 27)
c_close = cam("a4_close", F_CLOSE2, W.hp((-.25, -6.4, .05)), W.hp((0, 0, -.1)), 50)
key(c_close, F_CLOSE2, loc=W.hp((-.25, -6.4, .05))); key(c_close, F1, loc=W.hp((-.05, -5.7, 0)))

NECK_KIDS = list(MAN["neck"].children_recursive)
GLOW = W.lcd_glow((0, 0, 0), 0)

def thumb(t, s):
    taps = [T_PRESS] if s == 1 else []
    taps += [103.55 + i * .28 + (0 if s == 1 else .14) for i in range(7)]
    v = 0.0
    for tp in taps:
        if tp - .05 <= t <= tp + .13: v = max(v, 1 - abs(t - tp - .04) / .09)
    return clamp(v)

# ---------- per frame ----------
for f in range(F0, F1 + 1):
    t = f / 24
    np_ = 30 - 6 * sm(T_GREY, T_GREY + .4, t)
    W.key_man(f, np=np_, ny=-4, blink=.15 if (f % 97) < 3 else 1.0)
    pov = F_POV <= f < F_LAPS
    for ob in NECK_KIDS: vset(ob, f, not pov and (ob is not SMILE or 95.0 <= t < T_GREY))
    small.matrix_world = POV_MW if pov else HOLD_MW
    small.keyframe_insert("location", frame=f); small.keyframe_insert("rotation_euler", frame=f); small.keyframe_insert("scale", frame=f)
    pos, head, pose, wag, legs, bob = dog_at(t)
    W.key_dog(f, pos, head, pose, z=bob, wag=wag, legs=legs)
    on = lcd_on(t)
    key_screens(HS, f, on); key_screens(SS, f, on)
    sh = sm(T_GREY + .25, T_GREY + .4, t) * (1 - sm(103.3, 103.45, t))
    key(W.hero, f, loc=W.HC + Vector((.25 * sh * math.sin(t * 55), 0, .12 * sh * math.sin(t * 47 + 1))),
        rot=(R(-40 + .6 * math.sin(t * 1.3) + 6 * sh * math.sin(t * 50)), 0, R(.5 * math.sin(t * .9 + 1) + 5 * sh * math.sin(t * 43))))
    for s, pr in W.thumbs.items():
        key(pr, f, rot=(0, 0, R(15) * s * thumb(t, s) * (-1 if s == 1 else 1)))
    GLOW.location = TOY_HOLD + (eye - TOY_HOLD).normalized() * .12
    GLOW.data.energy = 0 if t >= T_GREY else 1.0
    GLOW.keyframe_insert("location", frame=f); GLOW.data.keyframe_insert("energy", frame=f)

print("[act4] cuts: " + ", ".join(f"{n} {fr}" for n, fr in CUTS.items()))
W.finish(OUT)
