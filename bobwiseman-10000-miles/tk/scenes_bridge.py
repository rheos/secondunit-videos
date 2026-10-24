# Bridge scenes (see scenes_v1.py for the contract). The anchor rocket sits at frame centre and the blue friend
# rocket just right of it (about +92 px) through the whole bridge, so faces and action stay below or left of centre.
import math, random
import bpy, bmesh
from mathutils import Vector
from . import cast as C


def _frames(K, span):
    a, b = span; return range(K.frame_of(a), K.frame_of(b) + 1)


def _torus(K, name, R, r, mat, loc=(0, 0, 0), rot=(0, 0, 0), parent=None, seg=48, ring=12):
    """A rounded ring lying in the xz plane (its hole looks along y): porthole and hatch rims."""
    bm = bmesh.new(); grid = []
    for i in range(seg):
        a = 2 * math.pi * i / seg; row = []
        for j in range(ring):
            b = 2 * math.pi * j / ring; rr = R + r * math.cos(b)
            row.append(bm.verts.new((rr * math.cos(a), r * math.sin(b), rr * math.sin(a))))
        grid.append(row)
    for i in range(seg):
        for j in range(ring):
            bm.faces.new((grid[i][j], grid[(i + 1) % seg][j], grid[(i + 1) % seg][(j + 1) % ring], grid[i][(j + 1) % ring]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return K._obj(name, bm, mat, loc, rot, parent)


def _mix(h1, h2, u):
    c1 = [int(h1.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)]; c2 = [int(h2.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)]
    return "#" + "".join(f"{int(round(a + (b - a) * u)):02x}" for a, b in zip(c1, c2))


def _tint(K, root, hexc, u):
    """Recolour every toon mesh under root towards hexc (the soft blue cabin light on the faces)."""
    stack = [root]
    while stack:
        o = stack.pop(); stack.extend(o.children)
        if o.type in ("MESH", "CURVE") and o.data.materials:
            base = o.data.materials[0].name[3:10]
            if base.startswith("#"): o.data.materials[0] = C.flat(_mix(base, hexc, u))


def _stars(K, n, seed, centre, rad, az, el, size, hexc="#fff6dc"):
    """Little glowing dots on a far shell around centre, all in one mesh: az/el ranges in degrees, size = (min, max) radius."""
    from mathutils import Matrix
    rng = random.Random(seed); bm = bmesh.new()
    for i in range(n):
        a = math.radians(rng.uniform(*az)); e = math.radians(rng.uniform(*el)); r_ = rad * rng.uniform(.9, 1.1)
        p = (centre[0] + r_ * math.cos(e) * math.cos(a), centre[1] + r_ * math.cos(e) * math.sin(a), centre[2] + r_ * math.sin(e))
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=rng.uniform(*size), matrix=Matrix.Translation(p))
    return K._obj("stars", bm, K.toon(hexc, emit=1.6), smooth_faces=False)


def _gaze(pp, dx, f, dz=0.0):
    """Slide the eyes sideways (and up) on the face from where the cast put them: dx < 0 looks to screen left."""
    for pu in pp["pupils"]:
        if "home" not in pu: pu["home"] = tuple(pu.location)
        h = pu["home"]; pu.location = (h[0] + dx, h[1], h[2] + dz); pu.keyframe_insert("location", frame=f)


def gravity(K, span):
    """A living room at night: the person sunk deep in a couch, too heavy to lift an arm for the cup on the side table."""
    P = K.P; K.world("#5a4a6a"); cam = K.camera(36); K.sun((48, -8, 28), 2.6)
    K.cube("floor", (30, 30, .2), K.toon("#c9ad8c"), (0, 0, -.1)); K.cube("wall", (30, .2, 12), K.toon("#d8c4b4"), (0, 1.1, 6))
    K.cube("skirting", (30, .06, .14), K.toon(P["cream"]), (0, .98, .07), bevel=0)
    # the night window behind the couch, at frame centre, so the anchor rocket hangs in its sky
    K.cube("winFrame", (1.5, .12, 1.2), K.toon(P["cream"]), (0, 1.0, 1.8))
    K.cube("winSky", (1.26, .02, .98), K.toon(P["night"], emit=1.0), (0, .935, 1.8), bevel=0)
    K.cube("winBar", (.05, .03, .98), K.toon(P["cream"]), (0, .92, 1.8), bevel=0)
    K.cube("winSill", (1.7, .2, .07), K.toon(P["cream"]), (0, .9, 1.18))
    K.sphere("moon", .1, K.toon(P["cream"], emit=1.4), (.38, .925, 2.06), (1, .2, 1))
    rng = random.Random(4)
    for i in range(9):
        K.sphere(f"wstar{i}", rng.uniform(.012, .022), K.toon("#fff6dc", emit=1.6), (rng.uniform(-.58, .58), .925, rng.uniform(1.38, 2.24)), (1, .3, 1))
    for s in (-1, 1): K.cube(f"curtain{s}", (.32, .08, 1.4), K.toon(P["coral"]), (s * .9, .9, 1.74))
    K.cyl("rail", .02, .02, 2.3, K.toon(P["wood2"]), (0, .9, 2.46), (0, math.pi / 2, 0))
    # rug and couch
    K.cyl("rug", 1.5, 1.5, .02, K.toon(P["cream"]), (0, -.55, .01), seg=48).scale = (1.25, .6, 1)
    K.cyl("rug2", 1.25, 1.25, .022, K.toon(P["coral"], .8, 1.04), (0, -.55, .012), seg=48).scale = (1.25, .6, 1)
    CO = "#7d8fb8"
    K.cube("couchBase", (1.7, .85, .3), K.toon(CO), (0, .1, .27))
    for s in (-1, 1):
        K.cube(f"couchArm{s}", (.24, .9, .56), K.toon(CO), (s * .9, .1, .42))
        for sy in (-1, 1): K.cyl(f"foot{s}{sy}", .035, .03, .12, K.toon(P["wood2"]), (s * .85, .1 + sy * .35, .06))
    K.cube("couchBack", (1.7, .28, .72), K.toon(CO), (0, .45, .78))
    cush = []
    for i, x in enumerate((-.39, .39)):
        piv = K.empty(f"cushPiv{i}", (x, .02, .42))                  # scale this to squash the cushion from its base
        K.cube(f"cushion{i}", (.77, .74, .22), K.toon(_mix(CO, "#ffffff", .18)), (0, 0, .11), parent=piv)
        cush.append(piv)
    K.cube("backCush", (.72, .2, .42), K.toon(_mix(CO, "#ffffff", .18)), (.39, .3, .86), (math.radians(-8), 0, 0))
    # side table with a cup and the remote, just out of reach on the left
    K.cyl("tableTop", .23, .23, .05, K.toon(P["wood"]), (-1.2, -.08, .62))
    K.cyl("tableLeg", .04, .05, .6, K.toon(P["wood2"]), (-1.2, -.08, .31))
    K.cyl("tableFoot", .18, .18, .03, K.toon(P["wood2"]), (-1.2, -.08, .015))
    K.cyl("cup", .07, .06, .13, K.toon(P["house1"]), (-1.25, -.14, .71))
    K.cube("remote", (.07, .2, .03), K.toon(P["ink"]), (-1.1, -.02, .66), (0, 0, .4))
    # floor lamp on the right
    K.cyl("lampBase", .16, .18, .04, K.toon(P["ink"]), (1.28, .3, .02))
    K.cyl("lampPole", .02, .02, 1.5, K.toon(P["ink"]), (1.28, .3, .78))
    K.cyl("lampShade", .26, .17, .3, K.toon(P["lamp"], emit=1.25), (1.28, .3, 1.62))
    pl = bpy.data.lights.new("TK_lampLight", "POINT"); pl.energy = 45; pl.use_shadow = False
    lo = bpy.data.objects.new("TK_lampLight", pl); K.link(lo); lo.location = (1.2, -.3, 1.5)
    # the person, sunk into the left cushion, legs straight out like a doll
    pp = K.person("you", (-.4, -.16, 0))
    HIP, SH, HZ = C.PERSON["hip"], C.PERSON["shoulder"], C.PERSON["head_z"]
    puffs = [K.sphere(f"puff{s}", .16, K.toon(_mix(CO, "#ffffff", .18)), (-.4 + s * .3, -.06, .55), (1.1, 1.4, .55)) for s in (-1, 1)]
    frames = _frames(K, span)

    def anim(t, f):
        sink = .55 + .45 * K.ramp(t, 135.06, 136.6)                  # already low, then lower
        sag = K.ramp(t, 141.2, 142.6)                                  # a last slow exhale
        cush[0].scale = (1 + .06 * sink, 1, 1 - .5 * sink - .06 * sag)
        bump = K.pulse(t, 139.42, 139.9) * .12                         # the arm lands and the cushion takes it
        cush[0].scale = (cush[0].scale[0], 1, cush[0].scale[2] - bump * .4)
        cush[1].rotation_euler = (0, math.radians(7) * sink, 0)        # the other cushion tips towards the dip
        for c in cush: K.key(c, "scale", f); K.key(c, "rotation_euler", f)
        for pf in puffs:                                                # the cushion bulges up around the body
            g = .5 + .7 * sink; pf.scale = (g, g, g); K.key(pf, "scale", f)
        squash = 1 - .1 * sink - .03 * sag
        hip = K.lerp(.6, .46, sink) - .02 * sag                       # hips sit below the cushion top: sunk in
        breathe = .006 * math.sin(2 * math.pi * t / 3.4)
        lean = math.radians(14 + 8 * sink)                              # leaning back into the couch
        pp["root"].location = (-.4, -.16, hip - HIP * squash + breathe - .03 * bump)
        pp["root"].scale = (1 + .03 * sink, 1 + .03 * sink, squash)
        pp["root"].rotation_euler = (-lean, 0, 0)
        K.key(pp["root"], "scale", f)
        for s, leg in ((-1, pp["legL"]), (1, pp["legR"])):             # legs stuck straight out over the seat edge
            leg.rotation_euler = (math.radians(-96) + lean, 0, s * math.radians(6))
        drop = .06 * sink + .03 * sag                                   # shoulders drop: the arm pivots slide down
        for s, arm in ((-1, pp["armL"]), (1, pp["armR"])):
            arm.location = (s * SH[0], 0, SH[1] - drop); K.key(arm, "location", f)
        lift = K.ramp(t, 137.0, 139.1) - K.ramp(t, 139.12, 139.42)        # slow heave towards the cup, then it drops
        lift = max(0.0, lift) + .3 * K.pulse(t, 140.1, 140.9)             # one small hopeless try
        shake = math.radians(3) * math.sin(t * 38) * K.ramp(t, 137.6, 138.6) * (1 if t < 139.12 else 0)
        bounce = math.radians(6) * K.pulse(t, 139.42, 139.75)
        pp["armL"].rotation_euler = (math.radians(-10) - math.radians(34) * lift, math.radians(12) + math.radians(64) * lift + shake + bounce, 0)
        pp["armR"].rotation_euler = (math.radians(-6), math.radians(-10), 0)
        look = K.ramp(t, 136.7, 137.4) - K.ramp(t, 139.6, 140.3)       # eyes go to the cup, then back to us
        look = max(0.0, look) + .7 * K.pulse(t, 140.0, 141.1)
        pp["head"].location = (0, 0, HZ - .05 * sink - .02 * sag)
        pp["head"].rotation_euler = (lean * .7, math.radians(-5 * sink), math.radians(-30) * look)
        K.key(pp["head"], "location", f)
        strain = K.ramp(t, 137.3, 138.2) * (1 - K.ramp(t, 139.1, 139.4))
        # face: lids and a flat mouth are left alone (smile kept in .75..1), the eyes and brows do the acting
        K.face(pp, brow=.3 - .8 * strain + .3 * K.ramp(t, 139.5, 140.2), smile=.95 - .2 * strain, wide=.86 + .14 * strain)
        _gaze(pp, -.035 * look, f)
        K.key_face(pp, f); K.key_parts(pp, f)
        K.aim(cam, (.05 * math.sin(t * .4), -7.7, 2.15), (-.02, 1.0, 1.6)); K.keycam(cam, f)
    K.bake(frames, anim); return frames


def ladder(K, span):
    """Night on the launch hill: the rocket stands tall on its pad and the person climbs a ladder to its lit hatch."""
    P = K.P; K.world(P["night"], P["night2"]); cam = K.camera(40); K.sun((38, 0, -50), 2.2)
    K.cyl("hill", 11, 9, 2.0, K.toon("#4f7a5c", .7, 1.04), (0, 2, -1.0), seg=64)
    K.cyl("hill2", 26, 22, 2.0, K.toon("#3d6150", .7, 1.03), (14, 30, -2.2), seg=64)
    K.cyl("hill3", 30, 26, 2.0, K.toon("#46705a", .7, 1.03), (-26, 38, -1.9), seg=64)
    _stars(K, 900, 11, (0, 0, 0), 60, (-10, 120), (4, 60), (.09, .2))
    K.sphere("moon", 2.4, K.toon(P["cream"], emit=1.5), (20, 52, 24))
    # the pad: a slab and a round plinth with a red band
    K.cyl("slab", 2.0, 2.0, .15, K.toon(P["grey2"]), (0, 0, .075), seg=48)
    K.cyl("plinth", 1.0, 1.0, .8, K.toon(P["cream"]), (0, 0, .55), seg=48)
    K.cyl("plinthBand", 1.01, 1.01, .14, K.toon(P["red"]), (0, 0, .7), seg=48)
    SC, TOP = 2.0, .95                                              # rocket scale (about 3.2 m) and plinth top
    rk, _ = K.rocket("ship", flame=False); rk.scale = (SC, SC, SC)
    rk.location = (0, 0, TOP + .62 * SC); rk.rotation_euler = (0, 0, math.radians(30))
    # the hatch on the side facing the ladder (world -x): a warm lit opening, a cream rim, the door swung out
    hp = K.empty("hatch", (0, 0, 0), rk); hp.rotation_euler = (0, 0, math.radians(150))
    HZ_ = .04
    K.sphere("hatchHole", 1, K.toon(P["lamp"], emit=1.1), (.232, 0, HZ_), (.03, .12, .18), parent=hp)
    rim = _torus(K, "hatchRim", .125, .018, K.toon(P["cream"]), (.236, 0, HZ_), (0, 0, math.pi / 2), parent=hp); rim.scale = (1, 1, 1.45)
    K.sphere("hatchDoor", 1, K.toon(P["red"], .7), (.31, -.15, HZ_), (.1, .016, .17), parent=hp).rotation_euler = (0, 0, math.radians(30))
    # the ladder, leaning from the slab to just under the hatch
    foot = Vector((-1.6, 0, .15)); top = Vector((-.5, 0, TOP + .62 * SC + (HZ_ - .2) * SC))
    u = (top - foot).normalized(); L = (top - foot).length; lean_l = math.atan2(u.x, u.z)
    ld = K.empty("ladder", tuple(foot)); ld.rotation_euler = (0, lean_l, 0)
    for s_ in (-1, 1): K.cyl(f"rail{s_}", .03, .03, L + .1, K.toon(P["wood"]), (0, s_ * .22, L / 2), parent=ld, seg=12)
    RUNG = .22; n_r = int(L / RUNG)
    for i in range(1, n_r + 1): K.cyl(f"rung{i}", .022, .022, .44, K.toon(P["wood2"]), (0, 0, i * RUNG), (math.pi / 2, 0, 0), parent=ld, seg=10)
    nrm = Vector((-u.z, 0, u.x))                                    # off the ladder, away from the rocket
    pp = K.person("you", (0, 0, 0), scale=.72)
    frames = _frames(K, span)
    right = Vector((.8, -.6, 0)); up = Vector((0, 0, 1)); back = Vector((-.6, -.8, .14)).normalized()

    def anim(t, f):
        raw = 7 * max(0.0, min(1.0, (t - 143.8) / 3.6))                 # rungs climbed, two a second
        i = math.floor(raw); fr = raw - i
        c = min(7.0, i + K.smooth(fr * 1.25))                            # push up each rung, then settle
        feet = foot + u * (c * RUNG + .02) + nrm * .1
        lean = math.radians(16)
        pp["root"].location = tuple(feet); pp["root"].rotation_euler = (lean, 0, math.pi / 2)
        ph = raw * math.pi                                               # one left-right cycle every two rungs
        sw = math.sin(ph) * (1 if raw < 7 else 0)
        pp["armL"].rotation_euler = (math.radians(-150 - 20 * sw), 0, math.radians(-6))
        pp["armR"].rotation_euler = (math.radians(-150 + 20 * sw), 0, math.radians(6))
        pp["legL"].rotation_euler = (math.radians(-14 - 34 * max(0.0, sw)), 0, 0)
        pp["legR"].rotation_euler = (math.radians(-14 - 34 * max(0.0, -sw)), 0, 0)
        for leg, k_ in ((pp["legL"], max(0.0, sw)), (pp["legR"], max(0.0, -sw))): K.bend(leg, .5 * k_, f)
        glance = K.ramp(t, 147.25, 147.7)                                # at the hatch, a look back at us
        pp["head"].rotation_euler = (math.radians(-18) + math.radians(10) * glance, 0, math.radians(-80) * glance)
        K.face(pp, brow=.1 - .3 * glance, smile=.8 + .2 * glance, wide=1 + .15 * glance)
        K.key_face(pp, f); K.key_parts(pp, f)
        lin = foot + u * (raw * RUNG) + nrm * .1                          # the camera rides up with the climb, unstepped
        head = lin + Vector((0, 0, .95))
        tgt = head + right * 1.05 + up * .62                          # person low left, hatch clear of the anchor
        K.aim(cam, tuple(tgt + back * 9.0), tuple(tgt)); K.keycam(cam, f)
    K.bake(frames, anim); return frames


def porthole(K, span):
    """Two faces at the rocket's porthole look left, then right; then the camera pulls back and circles the rocket
    over a big Earth."""
    P = K.P; K.world(P["space"], P["space2"]); cam = K.camera(50); cam.data.clip_end = 5000; K.sun((55, 15, -35), 3.0)
    S = 6.0                                                          # rocket scale: the porthole is big enough for two
    rk, fl = K.rocket("ship"); rk.scale = (S, S, S)
    for nm in ("Port", "PortRim"): bpy.data.objects.remove(bpy.data.objects["TK_ship" + nm])
    PZ, PR = .12, .115                                               # porthole centre height and glass radius (rocket-local)
    # punch a shallow cabin into the hull; the cut faces take the cabin's soft blue
    cut = K.cyl("portCut", PR, PR, .2, K.toon("#4a5fa8", .8, 1.05), (0, -.24, PZ), (math.pi / 2, 0, 0), parent=rk)
    cut.hide_render = True; cut.display_type = "WIRE"
    mod = bpy.data.objects["TK_shipBody"].modifiers.new("port", "BOOLEAN")
    mod.operation = "DIFFERENCE"; mod.object = cut; mod.solver = "EXACT"; mod.material_mode = "TRANSFER"
    K.cyl("cabinBack", PR, PR, .004, K.toon("#3d5199", .85, 1.05), (0, -.142, PZ), (math.pi / 2, 0, 0), parent=rk)
    _torus(K, "portRim", PR + .016, .018, K.toon(P["cream"]), (0, -.243, PZ), parent=rk)
    for k in range(10):                                              # rivets round the rim
        a = 2 * math.pi * k / 10
        K.sphere(f"rivet{k}", .006, K.toon(P["cream"], .8), (math.cos(a) * (PR + .036), -.236, PZ + math.sin(a) * (PR + .036)), parent=rk)
    K.sphere("glint", .04, K.toon("#ffffff", emit=1.0), (-.062, -.258, PZ + .05), (.1, .02, .9), parent=rk).rotation_euler = (0, math.radians(-38), 0)
    K.sphere("glint2", .006, K.toon("#ffffff", emit=1.0), (-.035, -.258, PZ + .084), (.7, .2, .7), parent=rk)
    # the two inside, side by side, low in the glass, lit soft blue
    SP = .095
    rz = PZ - .07 - C.PERSON["head_z"] * SP
    you = K.person("you", (-.046, -.19, rz), parent=rk, scale=SP)
    pal = K.person("friend", (.046, -.19, rz), sweater=P["coral"], parent=rk, scale=SP)
    for q in (you, pal): _tint(K, q["root"], "#a9bfff", .2)
    # Earth below, with soft green land and a few white cloud patches, turning slowly
    ER = 280.0; ez = -370.0                                         # far below: the rocket hangs well above it
    earth = K.empty("earth", (0, 0, ez))
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=160, v_segments=80, radius=ER)
    K._obj("globe", bm, K.toon(P["earth"], .78, 1.05), parent=earth)
    rng = random.Random(17)
    for i in range(40):
        lon = rng.uniform(0, 2 * math.pi); lat = math.radians(rng.uniform(25, 88)); d = Vector((math.cos(lat) * math.cos(lon), math.cos(lat) * math.sin(lon), math.sin(lat)))
        cloud = i % 3 == 2; rr = rng.uniform(22, 50) * (.6 if cloud else 1)
        sink_ = rr * rr / (2 * ER) + .02 * rr + (-.012 * rr if cloud else 0)   # embed the patch so only a thin cap shows
        o = K.sphere(f"land{i}", 1, K.toon("#f4f6fb" if cloud else [P["land"], P["green"], "#9cc27a"][i % 3], .85, 1.03),
                     tuple(d * (ER - sink_)), (rr, rr * rng.uniform(.55, 1), sink_ + .03 * rr), parent=earth)
        o.rotation_mode = "QUATERNION"; o.rotation_quaternion = d.to_track_quat("Z", "Y")
    _stars(K, 12000, 23, (0, 0, 0), 900, (0, 360), (-90, 90), (1.2, 2.4))
    frames = _frames(K, span)
    glass = Vector((0, -.24 * S, PZ * S + .12)); centre = Vector((0, 0, .1 * S)); rng2 = random.Random(5)

    def look_at(q, t, f, lag):
        t = t - lag
        side = -K.ramp(t, 148.7, 149.4) + 2 * K.ramp(t, 150.5, 151.3) - K.ramp(t, 152.3, 152.9)   # left, right, home
        q["head"].rotation_euler = (math.radians(-4) + math.radians(3) * math.sin(t * 2.1 + lag * 9), 0, math.radians(34) * side)
        K.face(q, brow=.35, smile=.9 + .1 * K.ramp(t, 152.5, 153.0), wide=1.25 + .1 * abs(side))
        _gaze(q, .022 * side, f, dz=.004)
        K.key_face(q, f); K.key_parts(q, f)

    def anim(t, f):
        look_at(you, t, f, 0.0); look_at(pal, t, f, .14)            # the friend follows a beat behind
        flick = .85 + .3 * rng2.random(); fl.scale = (1, 1, flick); K.key(fl, "scale", f)
        earth.rotation_euler = (0, 0, math.radians(4) * (t - 147.6)); K.key(earth, "rotation_euler", f)
        out = K.ramp(t, 153.5, 156.3)                                 # the pull back, eased in and out
        dist = math.exp(K.lerp(math.log(6.0), math.log(205.0), out))
        az = math.radians(-90 + 150 * K.ramp(t, 153.5, 157.6) + 2 * math.sin(t * .5))   # circling the rocket
        el = math.radians(K.lerp(1.5, 34, out))
        tgt = glass.lerp(centre, K.ramp(t, 153.5, 154.6))
        eye = tgt + Vector((math.cos(el) * math.cos(az), math.cos(el) * math.sin(az), math.sin(el))) * dist
        if t < 153.5: eye += Vector((.08 * math.sin(t * .6), 0, .04 * math.sin(t * .9)))
        K.aim(cam, tuple(eye), tuple(tgt)); K.keycam(cam, f)
    K.bake(frames, anim); return frames


SCENES = dict(gravity=gravity, ladder=ladder, porthole=porthole)
