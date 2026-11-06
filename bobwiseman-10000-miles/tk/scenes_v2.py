# Verse 2 scenes (see scenes_v1.py for the contract).
import math, random
from mathutils import Vector

R = math.radians

def _lamp(K, name, loc, h=3.3, arm=-.5):
    """A streetlamp: dark pole, a short arm, a glowing bulb under a hood. Returns the bulb."""
    P = K.P; root = K.empty(name, loc); ink = K.toon("#3a3550")
    K.cyl(name + "Base", .16, .1, .3, ink, (0, 0, .15), parent=root)
    K.cyl(name + "Pole", .06, .05, h, ink, (0, 0, h / 2), parent=root)
    K.cube(name + "Arm", (abs(arm) + .1, .06, .06), ink, (arm / 2, 0, h), parent=root)
    K.cyl(name + "Hood", .24, .06, .16, ink, (arm, 0, h - .02), parent=root)
    return K.sphere(name + "Bulb", .15, K.toon(P["lamp"], emit=2.2), (arm, 0, h - .13), (1, 1, .7), parent=root)

def _neon(K, name, kind, col, loc, mat=None):
    """A neon sign as glowing shapes on a dark board, no letters. kind 0 ring, 1 two bars, 2 arrow, 3 heart."""
    root = K.empty(name, loc); board = K.toon("#2c2840"); glow = mat or K.toon(col, emit=1.5)
    halo = K.toon(col, emit=.45)
    if kind == 0:
        K.cube(name + "Board", (.95, .08, .95), board, (0, .02, 0), parent=root)
        K.sphere(name + "Halo", .42, halo, (0, -.03, 0), (1, .08, 1), parent=root)
        K.sphere(name + "Ring", .32, glow, (0, -.06, 0), (1, .1, 1), parent=root)
        K.sphere(name + "Hole", .2, board, (0, -.09, 0), (1, .1, 1), parent=root)
    elif kind == 1:
        K.cube(name + "Board", (1.5, .08, .7), board, (0, .02, 0), parent=root)
        K.cube(name + "Halo", (1.3, .04, .52), halo, (0, -.03, 0), bevel=.4, parent=root)
        K.cube(name + "Bar1", (1.1, .06, .14), glow, (0, -.07, .1), bevel=.45, parent=root)
        K.cube(name + "Bar2", (.7, .06, .14), K.toon("#6fe3ff", emit=1.5), (-.2, -.07, -.13), bevel=.45, parent=root)
    elif kind == 2:
        K.cube(name + "Board", (1.3, .08, .62), board, (0, .02, 0), parent=root)
        K.cube(name + "Halo", (1.15, .04, .46), halo, (0, -.03, 0), bevel=.4, parent=root)
        K.cube(name + "Shaft", (.62, .06, .13), glow, (-.18, -.07, 0), bevel=.45, parent=root)
        K.cyl(name + "Head", .24, .24, .06, glow, (.24, -.07, 0), (R(90), R(90), 0), parent=root, seg=3)
    else:
        K.cube(name + "Board", (.95, .08, .9), board, (0, .02, 0), parent=root)
        K.sphere(name + "Halo", .4, halo, (0, -.03, .02), (1, .08, 1), parent=root)
        for x in (-.11, .11): K.sphere(name + f"Lobe{x}", .15, glow, (x, -.07, .08), (1, .3, 1), parent=root)
        K.cube(name + "Tip", (.3, .06, .3), glow, (0, -.07, -.06), (0, R(45), 0), bevel=.2, parent=root)
    return root

# ---------------------------------------------------------------------------------------------------------------
def town(K, span):
    """A night street of lit windows and neon: the camera walks along it, finds the five boys on a corner, and they strut off shoving."""
    P = K.P; K.world(P["night"], P["night2"]); cam = K.camera(35); K.sun((55, 0, -25), 1.4)
    K.cube("road", (80, 9, .2), K.toon("#3b3f66"), (0, -5.2, -.25))
    K.cube("pave", (80, 2.6, .2), K.toon("#8f8aa8"), (0, .5, -.1))
    K.cube("kerb", (80, .24, .26), K.toon("#b6b2c9"), (0, -.86, -.07))
    for i in range(30): K.cube(f"seam{i}", (.03, 2.5, .01), K.toon("#7d7896"), (-24 + i * 1.6, .5, .005), bevel=0)
    rng = random.Random(10)
    cols = ["#6a5a7a", "#55658a", "#7a5a6e", "#4f6a7a", "#806a62", "#5e5a86", "#6f7090"]
    lit, dark = K.toon(P["lamp"], emit=1.2), K.toon("#33355a")
    flick = K.toon(P["neon1"], .75, 1.07, emit=1.5)                 # its own material so it can flicker
    x, i = -22.0, 0
    while x < 14:
        if 1.7 < x < 4.6: x = 4.6                                     # the side street at the corner
        w = rng.uniform(2.5, 3.4); h = rng.uniform(4.4, 7.2); cx = x + w / 2; col = cols[i % len(cols)]
        K.cube(f"bld{i}", (w - .06, 3, h), K.toon(col, .8, 1.03), (cx, 3.3, h / 2), bevel=.02)
        K.cube(f"corn{i}", (w + .08, .32, .22), K.toon(col, .6, .9), (cx, 1.75, h), bevel=.2)
        K.cube(f"shop{i}", (w * .62, .1, 1.3), lit if rng.random() < .7 else dark, (cx - w * .1, 1.77, 1.05), bevel=.05)
        K.cube(f"door{i}", (.6, .1, 1.7), K.toon("#3a3550"), (cx + w * .33, 1.78, .85), bevel=.05)
        K.cube(f"awn{i}", (w * .7, .7, .1), K.toon([P["coral"], P["house1"], "#7fc6b6", "#b49ad8"][i % 4]), (cx - w * .1, 1.5, 1.95), (R(-18), 0, 0))
        ncol = max(2, int(w / .85))
        for row in range(int((h - 2.6) / 1.35)):
            for c in range(ncol):
                wx = cx - w / 2 + (c + .5) * w / ncol
                K.cube(f"win{i}_{row}_{c}", (.44, .1, .66), lit if rng.random() < .5 else dark, (wx, 1.77, 3.1 + row * 1.35), bevel=.06)
        kind = i % 4; ncols = [P["neon1"], P["neon2"], "#b8f06a", P["neon1"]]
        _neon(K, f"neon{i}", kind, ncols[kind], (cx + rng.uniform(-.4, .4), 1.7, 2.62), flick if i == 7 else None)
        x += w; i += 1
    _lamp(K, "lamp", (-2.5, -.55, 0), 3.4, .6)
    K.cyl("pool", 1.5, 1.5, .02, K.toon("#b7aca4", emit=1.0), (-1.9, -.1, .01), seg=48)
    bx = [-1.35, -.68, 0, .66, 1.32]; by = [.35, .05, .3, .05, .35]
    boys = [K.boy(f"boy{k}", k, (bx[k], by[k], 0)) for k in range(5)]
    # corner pose per boy: armL (x, y), armR (x, y), head turn, root turn (degrees)
    poses = [((0, 28), (0, -28), 8, 10), ((-25, 10), (0, -150), 0, -6), ((0, 26), (0, -26), 0, 0),
             ((8, 4), (8, -4), -10, 8), ((0, 72), (-20, -18), -8, -14)]
    shoves = [(71.05, 1, 2), (71.85, 3, 4), (72.55, 0, 1), (73.25, 2, 3), (73.95, 1, 2)]
    V = 1.15
    def travel(t):
        s = t - 70.42
        return 0 if s <= 0 else (V * s * s if s < .5 else V * (s - .25))
    a, b = span; frames = range(K.frame_of(a), K.frame_of(b) + 1)
    def anim(t, f):
        u = travel(t); wf = K.ramp(t, 70.25, 70.7); snap = K.ramp(t, 67.48, 67.75)
        walk_cam = K.ramp(t, 63.46, 67.4)
        cx_ = K.lerp(-11, 0, walk_cam) + u * .95
        bob = .05 * abs(math.sin(math.pi * t * 1.9)) * (K.pulse(t, 63.3, 67.6) ** .3)
        cy = -7.6 + .5 * K.ramp(t, 67.48, 68.6) - 1.1 * K.ramp(t, 70.0, 71.0)
        K.aim(cam, (cx_, cy, 2.5 + bob), (cx_, 1.0, 2.15 + bob)); K.keycam(cam, f)
        ws = 2 * math.pi * (t - 70.42) * 1.7; sw = math.sin(ws)
        for k, pp in enumerate(boys):
            (lx, ly), (rx, ry), ht, rt = poses[k]
            beat = .03 * abs(math.sin(math.pi * t * 2.05 + k * .4))
            look = R(40 if k % 2 else -40) * (1 - snap)                 # chatting with each other until the camera finds them
            # strut: walk swing with a chest-out lean back and a rolling swagger
            legs = R(30) * sw * wf; arms = R(26) * sw * wf
            al = [K.lerp(R(lx), -arms, wf), K.lerp(R(ly), R(8), wf), 0]
            ar = [K.lerp(R(rx), arms, wf), K.lerp(R(ry), R(-8), wf), 0]
            push = 0; knock = 0; back = 0
            for ts, p, q in shoves:
                if k == p: push = max(push, K.pulse(t, ts - .12, ts + .45))
                if k == q: knock = max(knock, K.pulse(t, ts + .05, ts + .75)); back = max(back, K.pulse(t, ts + .15, ts + 1.0))
            ar[0] = K.lerp(ar[0], R(-82), push); ar[1] = K.lerp(ar[1], R(-6), push)
            pp["armL"].rotation_euler = al; pp["armR"].rotation_euler = ar
            pp["legL"].rotation_euler = (legs, 0, 0); pp["legR"].rotation_euler = (-legs, 0, 0)
            pp["root"].location = (bx[k] + u + .32 * knock, K.lerp(by[k], .25, wf), beat * (1 - wf) + .035 * abs(sw) * wf)
            pp["root"].rotation_euler = (R(-7) * wf, R(6) * sw * wf + R(12) * knock, K.lerp(R(rt), R(68), wf) + R(4) * math.sin(t * 1.3 + k) * (1 - wf))
            pp["head"].rotation_euler = (R(-12) * snap + R(4) * math.sin(t * 2 + k), 0, K.lerp(look + R(ht), R(-25), wf) - R(70) * back)
            K.face(pp, brow=K.lerp(-.5, .3, knock), lids=.3 * (1 - knock), smile=K.lerp(.6, .1, knock), open_=.55 * knock, wide=1 + .3 * knock)
            K.key_parts(pp, f); K.key_face(pp, f)
        fl = 1.5 if (math.sin(t * 23) + math.sin(t * 7.3)) > -.6 else .15
        flick.node_tree.nodes["Emission"].inputs["Strength"].default_value = fl
        flick.node_tree.nodes["Emission"].inputs["Strength"].keyframe_insert("default_value", frame=f)
    K.bake(frames, anim); return frames

# ---------------------------------------------------------------------------------------------------------------
def toys(K, span):
    """A toy-shop window at night: toy switchblades on hanging cards, a wind-up tin robot, a spinning top; a slow push in, everything wobbles."""
    P = K.P; K.world(P["night"], P["night2"]); cam = K.camera(50); K.sun((50, -10, -30), 2.4)
    C = Vector((0, 0, 1.2))
    K.cube("facade", (8, .3, 6), K.toon("#5a4a72"), (0, -.35, 1.2 + 3.0 + .55), bevel=0)          # above the window
    K.cube("facadeL", (3, .3, 6), K.toon("#5a4a72"), (-2.05, -.35, 1.2), bevel=0)
    K.cube("facadeR", (3, .3, 6), K.toon("#5a4a72"), (2.05, -.35, 1.2), bevel=0)
    K.cube("facadeB", (8, .3, 3), K.toon("#5a4a72"), (0, -.35, 1.2 - 1.5 - .5), bevel=0)
    fr = K.toon(P["cream"])
    for sx in (-1, 1): K.cube(f"jamb{sx}", (.14, .4, 1.3), fr, (sx * .51, -.3, 1.2))
    K.cube("head", (1.24, .4, .12), fr, (0, -.3, 1.2 + .6)); K.cube("sill", (1.4, .5, .12), fr, (0, -.32, 1.2 - .6))
    for j, (gx, gz, gw) in enumerate(((-.3, 1.5, .05), (-.2, 1.52, .022))):     # glints on the glass
        K.cube(f"glint{j}", (gw, .005, .34), K.toon("#f6f2ff", emit=1.0), (gx, -.22, gz), (0, R(38), 0), bevel=0)
    K.cube("back", (1.6, .1, 1.6), K.toon("#cdbfe6"), (0, .55, 1.2), bevel=0)
    for i in range(7): K.cube(f"stripe{i}", (.08, .02, 1.6), K.toon("#d8ccee"), (-.6 + i * .2, .49, 1.2), bevel=0)
    K.cube("shelf", (1.2, .5, .05), K.toon(P["wood"]), (0, .15, .92))
    K.cyl("rail", .012, .012, 1.1, K.toon(P["flame"]), (0, .3, 1.63), (0, R(90), 0))
    # hanging cards: a toy switchblade on each, chunky handle, blunt rounded blade
    cards = []
    specs = [(-.29, "#ff7fb6", "#fbf3e6", 18), (.29, "#a6d93a", "#fbf3e6", -16)]
    for n, (x, hcol, ccol, tilt) in enumerate(specs):
        piv = K.empty(f"card{n}", (x, .3, 1.62))
        K.cyl(f"hook{n}", .01, .01, .08, K.toon(P["grey2"]), (0, 0, -.03), parent=piv)
        K.cube(f"board{n}", (.27, .015, .4), K.toon(ccol), (0, 0, -.25), bevel=.08, parent=piv)
        K.cube(f"band{n}", (.26, .02, .07), K.toon(hcol, .8), (0, -.003, -.1), bevel=.05, parent=piv)
        K.sphere(f"hole{n}", .018, K.toon("#e0d4d8"), (0, -.012, -.09), (1, .3, 1), parent=piv)
        kn = K.empty(f"knife{n}", (0, -.02, -.29), piv); kn.rotation_euler = (0, R(tilt), 0)
        K.cube(f"handle{n}", (.08, .04, .19), K.toon(hcol), (0, 0, -.07), bevel=.45, parent=kn)
        for z in (-.14, .0): K.sphere(f"rivet{n}{z}", .014, K.toon(P["cream"]), (0, -.023, z), (1, .5, 1), parent=kn)
        hinge = K.empty(f"hinge{n}", (0, .006, .02), kn); hinge.rotation_euler = (0, R(-16), 0)   # blade flicked open at an angle
        K.cube(f"blade{n}", (.058, .022, .15), K.toon("#9fb2e6"), (.006, 0, .075), bevel=.4, parent=hinge)
        K.sphere(f"tip{n}", .029, K.toon("#9fb2e6"), (.006, 0, .15), (1, .4, 1), parent=hinge)
        K.sphere(f"pin{n}", .02, K.toon(P["cream"]), (0, -.022, .02), (1, .4, 1), parent=kn)
        cards.append((piv, n))
    # wind-up tin robot with a turning key
    rb = K.empty("robot", (-.27, .1, .945)); tin = K.toon(P["cobalt"]); tr = K.toon(P["cream"])
    K.cube("rbody", (.13, .09, .13), tin, (0, 0, .1), bevel=.15, parent=rb)
    K.cube("rband", (.135, .095, .025), K.toon(P["red"]), (0, 0, .07), bevel=.2, parent=rb)
    K.cube("rhead", (.1, .08, .08), tr, (0, 0, .21), bevel=.2, parent=rb)
    for s in (-1, 1): K.sphere(f"reye{s}", .012, K.toon(P["ink"]), (s * .023, -.04, .215), parent=rb)
    K.cyl("rant", .005, .005, .05, K.toon(P["grey"]), (0, 0, .27), parent=rb); K.sphere("rantb", .014, K.toon(P["red"], emit=1.6), (0, 0, .3), parent=rb)
    for s in (-1, 1): K.cube(f"rleg{s}", (.035, .05, .04), K.toon(P["grey"]), (s * .035, 0, .02), parent=rb)
    rarms = [K.empty(f"rarm{s}", (s * .075, 0, .15), rb) for s in (-1, 1)]
    for s, ra in zip((-1, 1), rarms): K.cube(f"rarmb{s}", (.025, .025, .08), K.toon(P["red"]), (0, 0, -.035), parent=ra)
    key = K.empty("rkey", (.085, .01, .11), rb)
    K.cyl("rkeystem", .006, .006, .04, K.toon(P["flame"]), (0, 0, 0), (0, R(90), 0), parent=key)
    for s in (-1, 1): K.sphere(f"rkeyw{s}", .022, K.toon(P["flame"]), (.025, 0, s * .02), (.3, 1, 1), parent=key)
    # spinning top with dots on its shoulder so the spin reads
    tp = K.empty("top", (.27, .1, .945)); spin = K.empty("spin", (0, 0, 0), tp)
    K.cyl("tcone", .0, .07, .07, K.toon(P["coral"]), (0, 0, .035), parent=spin)
    K.cyl("tband", .072, .072, .025, K.toon(P["cream"]), (0, 0, .08), parent=spin)
    K.cyl("tcap", .07, .03, .04, K.toon(P["cobalt"]), (0, 0, .11), parent=spin)
    K.cyl("tstem", .008, .008, .05, K.toon(P["wood2"]), (0, 0, .15), parent=spin)
    for j in range(4):
        aj = j * math.pi / 2
        K.sphere(f"tdot{j}", .013, K.toon([P["house1"], P["green"], P["house1"], P["green"]][j]), (math.cos(aj) * .073, math.sin(aj) * .073, .08), parent=spin)
    ball = K.sphere("ball", .045, K.toon("#b49ad8"), (.05, .25, .99))
    a, b = span; frames = range(K.frame_of(a), K.frame_of(b) + 1)
    def anim(t, f):
        push = K.ramp(t, 75.18, 80.8) ** .9
        eye = Vector((.05 * math.sin(t * .4), -4.6 + .9 * push, 1.2 + .03 * math.sin(t * .6)))
        K.aim(cam, eye, C + Vector((0, 0, -.02 * push))); K.keycam(cam, f)
        for piv, n in cards:
            piv.rotation_euler = (0, R(4.5) * math.sin(t * 2.1 + n * 1.7) * (1 + .5 * K.pulse(t, 75.1, 76.3)), 0); K.key(piv, "rotation_euler", f)
        w = t * 2 * math.pi * 1.6
        rb.rotation_euler = (0, R(7) * math.sin(w), R(-25) + R(10) * math.sin(w * .5)); K.key(rb, "rotation_euler", f)
        rb.location = (-.27 + .012 * math.sin(w * .5), .1, .945 + .008 * abs(math.sin(w))); K.key(rb, "location", f)
        for s, ra in zip((-1, 1), rarms): ra.rotation_euler = (R(35) * math.sin(w + (s > 0) * math.pi), 0, 0); K.key(ra, "rotation_euler", f)
        key.rotation_euler = (t * 4.0, 0, 0); K.key(key, "rotation_euler", f)
        spin.rotation_euler = (0, 0, t * 9.0); K.key(spin, "rotation_euler", f)
        tp.rotation_euler = (R(7) * math.cos(t * 3.1), R(7) * math.sin(t * 3.1), 0); K.key(tp, "rotation_euler", f)
        tp.location = (.27 + .01 * math.sin(t * 3.1), .1 + .01 * math.cos(t * 3.1), .945); K.key(tp, "location", f)
        ball.location = (.05 + .006 * math.sin(t * 5), .25, .99); ball.rotation_euler = (0, R(10) * math.sin(t * 5), 0)
        K.key(ball, "location", f); K.key(ball, "rotation_euler", f)
    K.bake(frames, anim); return frames

# ---------------------------------------------------------------------------------------------------------------
def shadows(K, span):
    """A streetlamp throws the five boys' shadows huge up a brick wall; the boys stay small at the bottom, the shadows grow."""
    P = K.P; K.world(P["night"], P["night2"]); cam = K.camera(35); K.sun((60, 0, -20), 1.6)
    brick = "#c98a72"
    K.cube("wall", (30, .4, 16), K.toon(brick, .8, 1.03), (0, .2, 8), bevel=0)
    K.sphere("pool", 4.2, K.toon("#e9ad8d", .85, 1.03), (-.6, .02, 3.6), (1.15, .004, 1.25))       # the lamp's warm pool on the wall
    rng = random.Random(4)
    for i in range(70):
        bx_ = rng.uniform(-9, 9); bz = rng.randrange(1, 40) * .28
        K.cube(f"brick{i}", (.5, .03, .2), K.toon("#b8705a" if i % 3 else "#dba08a"), (bx_, -.01, bz), bevel=.1)
    K.cube("ground", (30, 8, .2), K.toon("#6d6684"), (0, -4, -.1), bevel=0)
    K.cube("kerb", (30, .3, .12), K.toon("#8a84a0"), (0, -.15, .06), bevel=0)
    _lamp(K, "lamp", (-3.1, -3.0, 0), 3.6, .55)
    sh = K.toon("#3a2c4c", emit=1.0)
    bx = [-1.9, -.95, 0, .95, 1.9]; BY = -1.4
    boys = [K.boy(f"boy{k}", k, (bx[k], BY, 0)) for k in range(5)]
    for pp in boys: K.face(pp, brow=-.5, lids=.3, smile=.6)
    def shadow(k, x):
        """A flat stretched silhouette on the wall, standing on its base at height 0; unit height about 1."""
        root = K.empty(f"sh{k}", (x, -.06, 0)); s = lambda n: f"sh{k}{n}"
        for side in (-1, 1): K.cube(s(f"leg{side}"), (.09, .01, .5), sh, (side * .06, 0, .25), (0, R(-4 * side), 0), parent=root, bevel=.3)
        K.cube(s("torso"), (.24, .01, .3), sh, (0, 0, .62), parent=root, bevel=.25)
        K.sphere(s("head"), .085, sh, (0, 0, .84), (1, .1, 1.15), parent=root)
        K.sphere(s("cap"), .09, sh, (0, 0, .9), (1, .1, .6), parent=root)
        K.cube(s("peak"), (.11, .01, .025), sh, ((1 if k % 2 else -1) * .08, 0, .88), parent=root, bevel=.3)
        if k in (1, 4):                          # one arm punched up, one on the hip
            K.cube(s("armU"), (.05, .01, .32), sh, (.15, 0, .88), (0, R(12), 0), parent=root, bevel=.3)
            K.sphere(s("fist"), .045, sh, (.18, 0, 1.04), (1, .1, 1), parent=root)
            K.cube(s("armH"), (.05, .01, .18), sh, (-.16, 0, .66), (0, R(-35), 0), parent=root, bevel=.3)
        else:                                    # both hands on hips, elbows out
            for side in (-1, 1):
                K.cube(s(f"armA{side}"), (.05, .01, .17), sh, (side * .175, 0, .69), (0, R(-45 * side), 0), parent=root, bevel=.3)
                K.cube(s(f"armB{side}"), (.05, .01, .17), sh, (side * .175, 0, .59), (0, R(45 * side), 0), parent=root, bevel=.3)
        return root
    shads = [shadow(k, bx[k] * 1.25 + .3) for k in range(5)]
    for k in range(5): K.cube(f"gsh{k}", (.36, 1.4, .01), sh, (bx[k] * 1.1 + .15, BY / 2 - .05, .006), (0, 0, R(-6 - 4 * bx[k])), bevel=0)
    a, b = span; frames = range(K.frame_of(a), K.frame_of(b) + 1)
    def anim(t, f):
        grow = K.ramp(t, 80.82, 84.3)
        K.aim(cam, (.2 + .15 * math.sin(t * .5), -19.5, 3.7 + .4 * grow), (.2, 0, 3.75 + .55 * grow)); K.keycam(cam, f)
        for k, (o, pp) in enumerate(zip(shads, boys)):
            sway = math.sin(t * 2.2 + k * 1.1)
            hgt = 5.2 * (1 + .75 * grow) * (1 + .03 * sway); wid = 3.3 * (1 + .18 * grow)
            o.scale = (wid, 1, hgt); o.rotation_euler = (0, R(5 + 3.5 * bx[k]) + R(2) * sway, 0)
            K.key(o, "scale", f); K.key(o, "rotation_euler", f)
            puff = 1 + .06 * grow
            pp["root"].scale = (puff, 1, 1); K.key(pp["root"], "scale", f)
            pp["root"].rotation_euler = (R(-5) * grow, R(3) * sway, R(6) * math.sin(t * 1.1 + k)); pp["head"].rotation_euler = (R(-14), 0, R(10) * math.sin(t * .9 + k))
            if k in (1, 4): pp["armR"].rotation_euler = (0, R(-160 + 8 * sway), 0); pp["armL"].rotation_euler = (0, R(30), 0)
            else: pp["armL"].rotation_euler = (0, R(30 + 3 * sway), 0); pp["armR"].rotation_euler = (0, R(-30 - 3 * sway), 0)
            pp["legL"].rotation_euler = (0, R(7), 0); pp["legR"].rotation_euler = (0, R(-7), 0)
            K.key_parts(pp, f)
    K.bake(frames, anim); return frames

# ---------------------------------------------------------------------------------------------------------------
def eyes(K, span):
    """Close on three of the boys side by side, brows cocky and eyes half-lidded; then they glance up at the sky."""
    P = K.P; K.world(P["night"], P["night2"]); cam = K.camera(70); K.sun((45, 0, -30), 2.6)
    K.cube("wall", (10, .3, 8), K.toon("#4a4466"), (0, 2.5, 2), bevel=0)
    _neon(K, "neonA", 0, P["neon1"], (-1.25, 2.3, 2.25)); _neon(K, "neonB", 1, P["neon2"], (1.35, 2.3, 2.1))
    xs, ys, zs, ks = [-.52, 0, .52], [0, -.14, 0], [0, -.3, 0], [1, 2, 3]
    gang = [K.boy(f"face{j}", ks[j], (xs[j], ys[j], zs[j])) for j in range(3)]
    p0 = [[p.location.copy() for p in bb["pupils"]] for bb in gang]
    b0 = [[q.location.copy() for q in bb["brows"]] for bb in gang]
    a, b = span; frames = range(K.frame_of(a), K.frame_of(b) + 1)
    def anim(t, f):
        up = K.ramp(t, 87.5, 87.85)
        K.aim(cam, (.02 * math.sin(t * .5), -8.6 + .3 * K.ramp(t, 84.2, 89.9), 1.6), (0, 0, 1.57)); K.keycam(cam, f)
        for j, bb in enumerate(gang):
            nod = R(3) * math.sin(t * 2.05 * math.pi / 2 + j)
            bb["head"].rotation_euler = (R(-5) + nod - R(17) * up, R(5) * (1 - j), R(12) * (1 - j) * (1 - .4 * up) + R(3) * math.sin(t * .7 + j))
            bb["root"].location = (xs[j] + .01 * math.sin(t * 1.3 + j), ys[j], zs[j] + .008 * math.sin(t * 2 + j))
            K.key_parts(bb, f, ("root", "head"))
            K.face(bb, brow=K.lerp(-.6, .1, up), lids=K.lerp(.62, 0, up), smile=K.lerp(.6, .25, up), wide=1 + .12 * up)
            lift = K.pulse(t, 85.0 + j * .75, 86.1 + j * .75)          # one cocky brow lift each, in turn
            for s, q, q0 in zip((-1, 1), bb["brows"], b0[j]):
                cocky = lift * (s == 1)
                q.location = q0 + Vector((0, 0, .035 * cocky + .035 * up)); q.rotation_euler.y += -s * R(22) * cocky
                K.key(q, "location", f)
            for pu, pu0 in zip(bb["pupils"], p0[j]):
                pu.location = pu0 + Vector((.006 * math.sin(t * .8 + j), 0, -.012 * (1 - up) + .014 * up)); K.key(pu, "location", f)
            K.key_face(bb, f)
    K.bake(frames, anim); return frames

# ---------------------------------------------------------------------------------------------------------------
def cabin(K, span):
    """Inside the rocket's cabin: the five boys crammed round the porthole looking down at a tiny Earth; their eyes go wide."""
    P = K.P; K.world("#2a2f5a"); cam = K.camera(40); K.sun((40, 10, -20), 2.6)
    ZP, RAD = 1.5, 2.6
    panel = K.toon("#e6ede6", .82, 1.03); rib = K.toon(P["red"]); bolt = K.toon(P["grey2"])
    for n, deg in enumerate(range(25, 160, 10)):                    # the round cabin wall, panels on an arc
        an = R(deg); px, py = RAD * math.cos(an), -RAD + RAD * math.sin(an)
        K.cube(f"panel{n}", (.48, .1, 6), panel, (px, py + .05, 1.5), (0, 0, an - R(90)), bevel=0)
        if deg + 5 in (40, 60, 120, 140):
            ex, ey_ = (RAD - .06) * math.cos(an + R(5)), -RAD + (RAD - .06) * math.sin(an + R(5))
            K.cube(f"rib{n}", (.08, .08, 6), rib, (ex, ey_, 1.5), (0, 0, an - R(90)), bevel=.2)
            for z in range(-2, 9): K.sphere(f"bolt{n}_{z}", .022, bolt, (ex * .985, ey_ - .05, .4 * z), (1, .5, 1))
    K.cube("band", (2.9, .06, .14), K.toon(P["red"]), (0, -.07, ZP + 1.05), bevel=0)
    K.cube("band2", (2.9, .06, .07), K.toon(P["cream"]), (0, -.07, ZP + .95), bevel=0)
    for sx in (-1.15, 1.15): K.sphere(f"light{sx}", .1, K.toon(P["lamp"], emit=1.8), (sx, -.15, ZP + 1.3), (1, .5, .7))
    # the porthole: cream rim with bolts, dark blue glass, a few stars, a tiny Earth low in the glass
    rot = (R(90), 0, 0)
    K.cyl("rim", .52, .52, .1, K.toon(P["cream"]), (0, -.08, ZP), rot, seg=64)
    K.cyl("lip", .435, .435, .1, K.toon("#c9bfa6"), (0, -.1, ZP), rot, seg=64)
    K.cyl("glass", .4, .4, .1, K.toon("#1d2a6a", emit=1.0), (0, -.11, ZP), rot, seg=64)
    for j in range(10):
        aj = j / 10 * 2 * math.pi; K.sphere(f"rbolt{j}", .025, bolt, (math.cos(aj) * .475, -.135, ZP + math.sin(aj) * .475), (1, .5, 1))
    rng = random.Random(7)
    for j in range(14):
        rr, aj = .36 * math.sqrt(rng.random()), rng.uniform(0, 2 * math.pi)
        K.sphere(f"star{j}", .007 + .006 * rng.random(), K.toon(P["cream"], emit=1.4), (rr * math.cos(aj), -.165, ZP + .08 + rr * math.sin(aj) * .8), (1, .3, 1))
    earth = K.empty("earth", (.05, -.17, ZP - .17))
    K.sphere("atmo", .095, K.toon("#9fd0f0", emit=.9), (0, .01, 0), (1, .2, 1), parent=earth)
    K.sphere("globe", .08, K.toon(P["earth"], emit=1.0), (0, 0, 0), (1, .3, 1), parent=earth)
    for j, (lx, lz, ls) in enumerate(((-.025, .02, .032), (.03, -.015, .026), (.005, .045, .018), (-.01, -.045, .016))):
        K.sphere(f"land{j}", ls, K.toon(P["land"], emit=1.0), (lx, -.022, lz), (1.3, .25, 1), parent=earth)
    # the five boys crammed round the glass: root (x, y, z), body turn, head turn, head tilt (degrees)
    lay = [(-.76, -.45, ZP + .35 - 1.4, 20, 30, 12), (.76, -.45, ZP + .33 - 1.4, -20, -30, 12),
           (-.64, -.7, ZP - .45 - 1.4, 15, 26, 8), (.64, -.7, ZP - .43 - 1.4, -15, -26, 8), (0, -.95, ZP - .66 - 1.4, 0, 0, -14)]
    gang = [(K.boy(f"crew{k}", k, L[:3]), L) for k, L in enumerate(lay)]
    p0 = [[p.location.copy() for p in bb["pupils"]] for bb, _ in gang]
    b0 = [[q.location.copy() for q in bb["brows"]] for bb, _ in gang]
    a, b = span; frames = range(K.frame_of(a), K.frame_of(b) + 1)
    def anim(t, f):
        wow = K.ramp(t, 94.0, 96.5) ** .7
        K.aim(cam, (.04 * math.sin(t * .45), -7.7, ZP + .3), (0, 0, ZP + .3)); K.keycam(cam, f)
        s_ = 1 - .35 * K.ramp(t, 94.0, 97.0); earth.scale = (s_, s_, s_)
        earth.rotation_euler = (0, R(8) * math.sin(t * .4), 0); K.key(earth, "scale", f); K.key(earth, "rotation_euler", f)
        for k, (bb, (x, y, z, bt, ht, tl)) in enumerate(gang):
            jos = math.sin(t * 2.6 + k * 1.9) * (1 - wow)               # jostling for the glass until the view hits them
            bb["root"].location = (x + .025 * jos, y, z + .015 * math.sin(t * 3.1 + k)); bb["root"].rotation_euler = (0, R(3) * jos, R(bt))
            bb["head"].rotation_euler = (R(tl) - R(12) * wow, R(4) * jos, R(ht) * (1 - .3 * wow))
            side = -1 if x < -.1 else (1 if x > .1 else 0)
            if side:                                                   # the near hand up on the rim
                near, far = (bb["armR"], bb["armL"]) if side < 0 else (bb["armL"], bb["armR"])
                near.rotation_euler = (R(115), R(40 * side), 0); far.rotation_euler = (R(-10), R(15 * side), 0)
            else:
                bb["armL"].rotation_euler = (R(120), R(25), 0); bb["armR"].rotation_euler = (R(120), R(-25), 0)
            K.key_parts(bb, f)
            K.face(bb, brow=K.lerp(-.35, .35, wow), lids=K.lerp(.3, 0, wow), smile=K.lerp(.5, 0, wow), open_=K.lerp(0, 1.25, wow), wide=K.lerp(1, 1.6, wow))
            for q, q0 in zip(bb["brows"], b0[k]): q.location = q0 + Vector((0, 0, .045 * wow)); K.key(q, "location", f)
            for pu, pu0 in zip(bb["pupils"], p0[k]): pu.location = pu0 + Vector((-.016 * side * (1 - .5 * wow), -.01 * wow, (-.016 if side else .02) * (1 - wow))); K.key(pu, "location", f)
            K.key_face(bb, f)
    K.bake(frames, anim); return frames

SCENES = dict(town=town, toys=toys, shadows=shadows, eyes=eyes, cabin=cabin)
