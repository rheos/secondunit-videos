# The pet, act 0 (0.0-21.0 s, frames 0-503): dawn. STORYBOARD-pet.md, act 0.
#   tools/render_lock.sh blender -b --factory-startup --python pet_act0.py -- --stills 0,120,192,300,384,503
# Shots: S0 0-131 the LCD close in the dark (egg rocks, cracks 4.8, hatches 5.2); S1 132-299 key still A's wide, the
# dawn creeps, the dog looks round and sighs; S2 300-383 the beep (12.5), the toy in his hands before his eyes open,
# the tail thumps twice; S3 384-503 he sits up into take 06's couch pose; act 1 cuts to the LCD close at 504.
import os, sys, math
_here = os.path.dirname(os.path.abspath(__file__))
_lab = "/Users/robin/Code/novadiem/indieagent/secondunit/_wt-rt-pet/blender-orb-visualizer"
sys.path.insert(0, _here if os.path.exists(os.path.join(_here, "pet_world.py")) else _lab)
import bpy
import pet_world as W
from pet_world import R, Vector, Matrix, Euler, M, MAN, DOG, small, vis, sm, lerp
from film_kit import shot_camera, cut, key, show, sec

F0, F1, OUT = W.act_setup(0)

# ---------- static set-up ----------
W.light_mode("dawn")
vis(W.c_leash, False); vis(W.c_ball, False); vis(W.battery_tbl, False); W.pile_items(0)
for n in ("hpalm-1", "hpalm1", "hthumbP-1", "hthumbP1", "hsleeve-1", "hsleeve1", "hcuff-1", "hcuff1",
          "hthigh-1", "hthigh1", "hcouch-1", "hcouch1", "hgap", "hbelly"):
    if "CL_" + n in bpy.data.objects: vis(bpy.data.objects["CL_" + n], False)   # asleep: no hands on the toy yet
for n in ("hkey", "hrim", "hfill"): bpy.data.objects["CL_" + n].data.energy = 0  # the close is dark but the LCD

# small toy (room shots): the hatched pet idles; "!" for the beep
SBANG = W.blocks("stoy_bang", W.lcd_parts(W.BANG, 2, 3), M["pix"], small)
for n, ob in W.SPR.items(): vis(ob, False)
small.parent = None

# close screens: the egg (rocks), cracked, hatched (the shell's top lifts, two feet below)
EGG_CRACK = ["..####..", ".#....#.", "#......#", "#.#.#..#", "##.#.#.#", "#......#", ".#....#.", "..####.."]
HATCH_TOP = ["..####..", ".#....#.", "#.#.#..#"]
HATCH_BOT = ["##.#.#.#", "#......#", ".#....#.", "..####.."]
H_EGG = W.HSCREENS["egg"]
H_CRACK = W.screen("hpet_eggCrack", [(EGG_CRACK, 9, 5)], W.hero)
H_HATCH = W.screen("hpet_hatch", [(HATCH_TOP, 9, 2), (["#..#", "####"], 11, 7), (HATCH_BOT, 9, 9)], W.hero)
CLOSE = {"egg": H_EGG, "crack": H_CRACK, "hatch": H_HATCH}
for n, ob in W.HSCREENS.items(): vis(ob, False)
vis(W.bang, False)

GLOW = W.lcd_glow((0, 0, 0), 0)                                     # room: the LCD's light on his face
HGLOW = W.lcd_glow(W.hp((0, -2.6, .35)), 0)                          # close: the same green on the shell
HGLOW.data.shadow_soft_size = .4

# ---------- the man ----------
LIE = dict(x=1.0, y=2.45, z=.68, pitch=-90, hd=0, pz=.55, hip=0, knee=12, lean=0, np=-8, ny=-20,
           shL=(-10, -40), shR=(10, -40), elL=-110, elR=-110, blink=.12)
LIE_HOLD = dict(LIE, shL=(-28, -95), shR=(28, -95), elL=-62, elR=-62, np=12, ny=-6)
SIT = dict(W.MAN_SIT)
Q_LIE = Matrix.Rotation(R(-90), 4, 'Y').to_quaternion()             # pose_man's root: Rz(hd) @ Ry(pitch)
Q_SIT = Matrix.Rotation(R(-90), 4, 'Z').to_quaternion()

def mix(a, b, u):
    out = {}
    for k in a:
        va, vb = a[k], b.get(k, a[k])
        if va is None or vb is None: out[k] = vb
        elif isinstance(va, tuple): out[k] = tuple(lerp(x, y, u) for x, y in zip(va, vb))
        else: out[k] = lerp(va, vb, u)
    return out

def man_at(t):
    """(pose dict, root quaternion)"""
    g = sm(12.5, 12.85, t)                                          # hands to the toy, eyes still shut
    p = mix(LIE, LIE_HOLD, g)
    p["pz"] = LIE["pz"] + .012 * math.sin(2 * math.pi * t / 4.2) * (1 - g)   # sleep breath
    p["blink"] = lerp(.12, 1.0, W.sm(13.9, 14.1, t))
    u = sm(16.3, 19.6, t)                                           # he sits up
    if u <= 0: return p, Q_LIE
    q = mix(p, SIT, u)
    legs = sm(16.9, 19.9, t)
    for k in ("hip", "knee"): q[k] = lerp(p[k], SIT[k], legs)
    q["kneeR"] = None
    return q, Q_LIE.slerp(Q_SIT, u)

def toy_matrix(t):
    """the toy on his chest until 12.5, then in his hands (toy_in_hands' rule)"""
    chest = MAN["torso"].matrix_world @ Vector((0, 0, .38)) + Vector((0, 0, .2))
    m_chest = Matrix.LocRotScale(chest, Euler((R(-90), 0, R(-90))).to_quaternion(), Vector((.045,) * 3))
    g = sm(12.5, 12.8, t)
    if g <= 0: return m_chest
    hl, hr_ = MAN["handL"].matrix_world.translation, MAN["handR"].matrix_world.translation
    eye = (MAN["eyes"][0].matrix_world.translation + MAN["eyes"][1].matrix_world.translation) / 2
    mid = (hl + hr_) / 2; look = (eye - mid).normalized()
    m_hand = Matrix.LocRotScale(mid + look * .02, (-look).to_track_quat('Y', 'Z'), Vector((.045,) * 3))
    if g >= 1: return m_hand
    return Matrix.LocRotScale(m_chest.to_translation().lerp(m_hand.to_translation(), g),
                              m_chest.to_quaternion().slerp(m_hand.to_quaternion(), g), Vector((.045,) * 3))

# ---------- the dog ----------
DPOS = Vector((-2.05, 2.25)); DLIE = Vector((-2.0, 1.92))
def pulse(t, at, w=.16): return max(0.0, 1 - abs(t - at) / w)
def dog_at(t):
    p = dict(W.SIT); p["hp"] = -8
    look = sm(8.6, 9.3, t) * (1 - sm(9.9, 10.6, t))                 # looks round at him, back to the window
    p["hy"] = -62 * look; p["hp"] = lerp(-8, 6, look); p["ear"] = -10 * look
    s = sm(10.8, 12.2, t)                                           # the sigh: sinks to the floor
    lie = dict(W.LIE); lie["hp"] = 34; lie["ear"] = 18
    p = W.pmix(p, lie, s)
    pos = DPOS.lerp(DLIE, s); head = lerp(90, 80, s)
    a = sm(12.55, 12.9, t)                                          # the beep: head up, ears up, turned to him
    p["hp"] = lerp(p["hp"], 8, a); p["hy"] = lerp(p["hy"], -48, a); p["ear"] = lerp(p["ear"], -22, a)
    b = sm(16.4, 18.0, t)                                           # he sits up: the dog lifts more
    p["hp"] = lerp(p["hp"], -4, b); p["hy"] = lerp(p["hy"], -62, b)
    p["tp"] = p["tp"] + 38 * (pulse(t, 13.05) + pulse(t, 13.6))      # two thumps
    p["bz"] -= .06 * sm(11.4, 11.9, t) * (1 - sm(11.9, 12.5, t))     # one big breath out
    return pos, head, p

# ---------- light: the dawn creeps across the floor ----------
SUN0, SUN1 = Vector((.9, -1.0, -.22)), Vector((.75, -1.0, -.5))

# ---------- per frame ----------
idle_prev = bang_prev = close_prev = "x"
for f in range(F0, F1 + 1):
    t = f / 24
    p, q = man_at(t)
    W.key_man(f, **p)
    MAN["root"].rotation_euler = q.to_euler('XYZ', MAN["root"].rotation_euler)
    MAN["root"].keyframe_insert("rotation_euler", frame=f)
    bpy.context.view_layer.update()
    small.matrix_world = toy_matrix(t)
    key(small, f, loc=small.location.copy(), rot=small.rotation_euler.copy(), scale=small.scale.copy())
    bpy.context.view_layer.update()
    GLOW.location = small.matrix_world @ Vector((0, -2.5, .3)); GLOW.data.energy = 4.0 if t >= 5.5 else 0
    GLOW.keyframe_insert("location", frame=f); GLOW.data.keyframe_insert("energy", frame=f)

    pos, head, dp = dog_at(t)
    W.key_dog(f, pos, head, dp)

    u = sm(5.5, 12.5, t)
    W.sunob.rotation_euler = SUN0.lerp(SUN1, u).normalized().to_track_quat('-Z', 'Y').to_euler()
    W.sunob.keyframe_insert("rotation_euler", frame=f)
    W.sunob.data.energy = lerp(.9, 2.2, u) if t >= 5.5 else 0.0; W.sunob.data.keyframe_insert("energy", frame=f)

    idle = "idleA" if int((t - 21.0) / .42) % 2 == 0 else "idleB"   # take 06's idle clock
    if idle != idle_prev:
        show(W.SPR["idleA"], f, idle == "idleA"); show(W.SPR["idleB"], f, idle == "idleB"); idle_prev = idle
    lit = 12.5 <= t < 14.6 and int((t - 12.5) / .21) % 2 == 0
    if lit != bang_prev: show(SBANG, f, lit); bang_prev = lit

    cs = None if t < .6 else ("egg" if t < 4.8 else ("crack" if t < 5.2 else "hatch"))
    if cs != close_prev:
        for n, ob in CLOSE.items(): show(ob, f, n == cs)
        close_prev = cs
    step = (0, 1, 0, -1)[int(t / .38) % 4]                          # the egg rocks in sprite steps
    if 3.6 <= t: step = (1, -1)[int(t / .19) % 2]                   # harder before it cracks
    key(H_EGG, f, loc=(step * W.CELL, 0, 0))
    HGLOW.data.energy = 0 if t < .6 else 35.0; HGLOW.data.keyframe_insert("energy", frame=f)
show(W.HLCD, F0, False); show(W.HLCD, sec(.6), True)               # black, then the one point of green

BG = W.scene.world.node_tree.nodes["Background"].inputs["Strength"]   # the close is dark: no sky until the wide
BG.default_value = 0.0; BG.keyframe_insert("default_value", frame=F0); BG.keyframe_insert("default_value", frame=sec(5.5) - 1)
BG.default_value = .6; BG.keyframe_insert("default_value", frame=sec(5.5))
show(W.blanket, F0, True); show(W.blanket, sec(16.0), False)       # kicked off across the cut

# ---------- cameras ----------
cS0 = shot_camera("a0_egg", W.hp((.05, -4.4, .2)), W.hp((0, 0, .35)), 50)
key(cS0, F0, loc=W.hp((.05, -4.4, .2))); key(cS0, sec(5.5) - 1, loc=W.hp((.15, -5.3, .05)))
cS1 = shot_camera("a0_dawn", (.9, -1.1, .95), (-1.0, 2.4, 1.0), 28)
key(cS1, sec(5.5), loc=(1.05, -1.3, .98)); key(cS1, sec(12.5) - 1, loc=(.8, -.85, .93))
cS2 = shot_camera("a0_beep", (.25, .3, 1.3), (-1.0, 2.3, .55), 24)
key(cS2, sec(12.5), loc=(.25, .3, 1.3)); key(cS2, sec(16.0) - 1, loc=(.2, .45, 1.27))
cS3 = shot_camera("a0_situp", (.3, -3.1, 1.7), (.5, 2.0, .85), 30)
key(cS3, sec(16.0), loc=(.2, -3.25, 1.72)); key(cS3, F1, loc=(.3, -3.0, 1.68))
for fr, c in ((F0, cS0), (sec(5.5), cS1), (sec(12.5), cS2), (sec(16.0), cS3)): cut(fr, c)

W.finish(OUT)
