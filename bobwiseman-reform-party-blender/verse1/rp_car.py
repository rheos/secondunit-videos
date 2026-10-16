"""The boardroom table car (car.js, table.js): table with the driver's hole and hat, skirt, wheels,
whiteboard with its charts, 14 egg-head suits on hop-on seats, the chairman's gavel on "law" with its
stamp and shock ring, and the speakerphone (tape X on "can't", soft-watch slump, springs back on "gag").
Poses come from draft 5's seatState() and gavelPose() via state("core")."""
import math

import bmesh
from mathutils import Matrix, Vector

import rp_core as K
from rp_core import B, TOP, TD, TL, SEAT, TORSO, clamp, lerp, ease, rnd, n1

S = K.state("core")

# song timing (source/lines.json, draft 3-5): line 0 "law", line 1 "can't", line 2 starts
L0E, W_LAW = 21.63, 17.97
L1S, L1E, W_CANT, L2S = 22.05, 27.00, 24.76, 27.50

WHEEL_R = 0.4
WHEELS = [-2.925, -0.125, 2.575]
ROW_X = [-3.6, -2.25, -0.8, 0.55, 1.9, 3.25]
SEATS = ([dict(x=x, z=2.3, r="drawer" if x == -0.8 else "b") for x in ROW_X]
         + [dict(x=x, z=-2.3, r="f") for x in ROW_X]
         + [dict(x=-5.15, z=0.0, r="chair"), dict(x=5.15, z=0.0, r="end")])
CHAIR = 12


def mats():
    M, toon, flat = K.M, K.toon, K.flat
    for k, v in {
        "top": lambda: toon("Mahogany", K.shade("#6e2c1a", 0.38), shadow="#3e170d", light="#6e2c1a", grain=(0.9, 0.14)),
        "edge": lambda: toon("TableEdge", "#3d170c", shadow="#2a0f07"),
        "skirt": lambda: toon("Skirt", "#7a1420", shadow="#4e0c16", light="#9a2230"),
        "trim": lambda: toon("Trim", "#d6a632", shadow="#9a7420", light="#f0c85a"),
        "chassis": lambda: toon("Chassis", "#1d130e", shadow="#120b08"),
        "tyre": lambda: toon("Tyre", "#211813", shadow="#15100d"),
        "chrome": lambda: toon("Chrome", "#c9c6bd", shadow="#8d887d", light="#f2f0ea"),
        "spoke": lambda: toon("Spoke", "#6f6a60", shadow="#4c4840"),
        "gold": lambda: toon("Gold", "#c9a24a", shadow="#8e6f2a", light="#ecd087"),
        "hole": lambda: flat("Hole", "#120806"),
        "hat": lambda: toon("HatCrown", "#b52c22", shadow="#7e1c15", light="#d24a36"),
        "brim": lambda: toon("HatBrim", "#8f2018", shadow="#5e130e"),
        "band": lambda: toon("HatBand", "#3a1410", shadow="#240b08"),
        "suit": lambda: toon("Suit", "#2f2f39", shadow="#212128", light="#4a4a5c"),
        "shirt": lambda: toon("Shirt", "#f4efe6", shadow="#c9bfb2", light="#ffffff"),
        "tie": lambda: toon("Tie", "#8f1d1d", shadow="#5e1212"),
        "rosette": lambda: toon("Rosette", "#d0281f", shadow="#931a14", light="#e8473a"),
        "rosette_c": lambda: toon("RosetteCentre", "#f6d8a0", shadow="#c9a870"),
        "egg": lambda: toon("Egg", "#f1e4cc", shadow="#b49a7c", light="#fffaf0"),
        "neck": lambda: toon("Neck", "#d7c3a3", shadow="#a8916f"),
        "shoe": lambda: toon("Shoe", "#141216", shadow="#0c0b0d"),
        "seat": lambda: toon("SeatPan", "#7a4e26", shadow="#3d2412", light="#97653a"),
        "seatback": lambda: toon("SeatBack", "#7b2a1c", shadow="#4e170e", light="#99402c"),
        "beam": lambda: toon("Bracket", "#4a2a14", shadow="#2e190b"),
        "crutch": lambda: toon("Crutch", "#c9a46a", shadow="#8c6f40", light="#e3c48e"),
        "pad": lambda: toon("CrutchPad", "#e9dcc2", shadow="#b3a283"),
        "drawer": lambda: toon("Drawer", "#7b5530", shadow="#4b321b", light="#9a6e42"),
        "drawer_in": lambda: flat("DrawerInside", "#2a1608"),
        "phone": lambda: toon("Phone", "#2b2d32", shadow="#1d1e22", light="#383a40"),
        "dome": lambda: toon("PhoneDome", "#363940", shadow="#2a2c31", light="#454850"),
        "grille": lambda: flat("Grille", "#16171a"),
        "led_g": lambda: flat("LedGreen", "#57e07a", 1.4),
        "led_r": lambda: flat("LedRed", "#ff3b2a", 1.4),
        "tape": lambda: toon("Tape", "#e6d7b0", shadow="#b5a57e", light="#f6ecd2"),
        "board": lambda: toon("Board", "#f4f4ee", shadow="#c9cbc6", light="#ffffff"),
        "boardframe": lambda: toon("BoardFrame", "#b8b1a2", shadow="#8a8475"),
        "easel": lambda: toon("Easel", "#6b4a2a", shadow="#43301b"),
        "bar_r": lambda: flat("BarRed", "#c7362b"),
        "bar_b": lambda: flat("BarBlue", "#2f6fb5"),
        "ink": lambda: flat("ChartInk", "#2a2a2e"),
        "gavel": lambda: toon("Gavel", "#9a5a2c", shadow="#3e1f0c", light="#b8733e"),
        "gavel_end": lambda: toon("GavelEnd", "#2e1608", shadow="#1c0d05"),
        "handle": lambda: toon("GavelHandle", "#4a2a14", shadow="#2e190b"),
        "stamp": lambda: flat("StampInk", "#b3201a"),
        "stamp_star": lambda: flat("StampStar", "#f1d9a8"),
        "shock": lambda: flat("ShockRing", "#fbf0d6"),
    }.items():
        if k not in M:
            M[k] = v()


# =============================================================================================
def build_car():
    M = K.M
    car = K.empty("Car", K.COL_CAR)
    K.CAR = car
    K.key_loc(car, [(s["car"][0], s["car"][1], 0.0) for s in S])
    K.key_series(car, "rotation_euler", [s["car"][2] for s in S], index=2)

    # table top with the driver's hole (Boolean), edge band
    b = K.Builder()
    b.box(M["top"], (0, 0, TOP - 0.11), (2 * TL, 2 * TD, 0.22))
    top = b.build("TableTop", K.COL_CAR, car, smooth=False)
    top.data.materials.append(M["edge"])
    for p in top.data.polygons:
        if abs(p.normal.z) < 0.5:
            p.material_index = 1
    cb = K.Builder()
    cb.cone(M["hole"], (0, 0, TOP), 1.0, 1.0, 1.0, seg=48, rot=Matrix.Diagonal((0.55, 0.45, 1, 1)))
    cutter = cb.build("HoleCutter", K.COL_WORLD, car, smooth=False)
    cutter.hide_render = cutter.hide_viewport = True
    bo = top.modifiers.new("Hole", "BOOLEAN")
    bo.operation, bo.object, bo.solver = "DIFFERENCE", cutter, "EXACT"

    # the gold inlay ring (one connected band so Line Art sees one shape), the dark well, the hat
    b = K.Builder()
    vi = [b.bm.verts.new((math.cos(i / 48 * 2 * math.pi) * 0.60, math.sin(i / 48 * 2 * math.pi) * 0.50, TOP + 0.002)) for i in range(48)]
    vo = [b.bm.verts.new((math.cos(i / 48 * 2 * math.pi) * 0.63, math.sin(i / 48 * 2 * math.pi) * 0.53, TOP + 0.002)) for i in range(48)]
    b._tag([b.bm.faces.new((vi[i], vi[(i + 1) % 48], vo[(i + 1) % 48], vo[i])) for i in range(48)], M["gold"])
    b.cone(M["hole"], (0, 0, TOP - 0.25), 1.0, 1.0, 0.5, seg=48, rot=Matrix.Diagonal((0.549, 0.449, 1, 1)), caps=False)
    b.disc(M["hole"], (0, 0, TOP - 0.45), 1.0, seg=48, scale=(0.55, 0.45))
    b.cone(M["brim"], (0, 0, TOP - 0.06), 0.30, 0.27, 0.025, seg=40)
    b.cone(M["hat"], (0, 0, TOP + 0.03), 0.15, 0.125, 0.17, seg=32)
    b.cone(M["band"], (0, 0, TOP - 0.025), 0.153, 0.149, 0.04, seg=32, caps=False)
    b.build("HoleAndHat", K.COL_CAR, car)

    # chassis, wheels (rolling without slipping: rotation about +Y = distance / R)
    b = K.Builder()
    b.box(M["chassis"], (0, 0, 0.47), (2 * TL * 0.9, 2 * TD * 0.86, 0.66))
    b.build("Chassis", K.COL_CAR, car, smooth=False)
    rot = Matrix.Rotation(math.pi / 2, 4, "X")
    dist = [s["car"][0] + s["car"][1] for s in S]
    for x in WHEELS:
        for z in (-1.26, 1.26):                     # inside the skirt plane (TD * .93 = 1.395)
            w = K.Builder()
            o = math.copysign(0.085, z)
            w.part(M["tyre"], bmesh.ops.create_cone, cap_ends=True, segments=40, radius1=WHEEL_R, radius2=WHEEL_R, depth=0.16, matrix=rot)
            w.part(M["chrome"], bmesh.ops.create_cone, cap_ends=True, segments=36, radius1=WHEEL_R * 0.5, radius2=WHEEL_R * 0.42,
                   depth=0.03, matrix=Matrix.Translation((0, o, 0)) @ rot)
            for sp in range(5):
                a = sp / 5 * 2 * math.pi
                w.rod(M["spoke"], (math.cos(a) * WHEEL_R * 0.1, o * 1.18, math.sin(a) * WHEEL_R * 0.1),
                      (math.cos(a) * WHEEL_R * 0.44, o * 1.18, math.sin(a) * WHEEL_R * 0.44), 0.012, seg=6)
            w.part(M["gold"], bmesh.ops.create_cone, cap_ends=True, segments=16, radius1=WHEEL_R * 0.12, radius2=WHEEL_R * 0.1,
                   depth=0.02, matrix=Matrix.Translation((0, o * 1.25, 0)) @ rot)
            wob = w.build("Wheel_%g_%g" % (x, z), K.COL_CAR, car, loc=(x, z, WHEEL_R))
            K.key_series(wob, "rotation_euler", [d / WHEEL_R for d in dist], index=1)
    return car


# ---------- the skirt: pleated red panels to a hem that ripples (car.js), gold trim at the hem ----------
def build_skirt(car):
    M = K.M
    sides = [((-TL * .97, -TD * .93), (TL * .97, -TD * .93)), ((TL * .97, -TD * .93), (TL * .97, TD * .93)),
             ((TL * .97, TD * .93), (-TL * .97, TD * .93)), ((-TL * .97, TD * .93), (-TL * .97, -TD * .93))]
    SK = []
    for (x0, z0), (x1, z1) in sides:
        L = math.hypot(x1 - x0, z1 - z0)
        n = max(8, round(L / 0.06))
        nx, nz = (z1 - z0) / L, -(x1 - x0) / L
        for i in range(n):
            u = i / n
            SK.append((lerp(x0, x1, u), lerp(z0, z1, u), nx, nz, u))
    rows = [TOP - 0.2, 0.86, 0.74, None, None]

    def coords(f):
        t = K.ft(f)
        co = []
        for r, y in enumerate(rows):
            for i, (x, z, nx, nz, u) in enumerate(SK):
                pleat = 0.022 * math.sin(i * math.pi / 2) * (0.3 if r == 0 else 1.0)
                yy = y if y is not None else (0.56 + 0.045 * math.sin(u * 20 + t * 1.5) + (0.05 if r == 3 else 0.0))
                co.append(B(x + nx * pleat, yy, z + nz * pleat))
        return co

    bm = bmesh.new()
    nper = len(SK)
    vs = [bm.verts.new(c) for c in coords(1)]
    for r in range(len(rows) - 1):
        for i in range(nper):
            j = (i + 1) % nper
            f = bm.faces.new((vs[r * nper + i], vs[r * nper + j], vs[(r + 1) * nper + j], vs[(r + 1) * nper + i]))
            f.material_index = 1 if r == 3 else 0
    import bpy
    me = bpy.data.meshes.new("RP_Skirt")
    bm.to_mesh(me)
    bm.free()
    me.materials.append(M["skirt"])
    me.materials.append(M["trim"])
    me.shade_smooth()
    ob = bpy.data.objects.new("RP_Skirt", me)
    K.COL_CAR.objects.link(ob)
    ob.parent = car
    ob.modifiers.new("Both sides", "SOLIDIFY").thickness = 0.01
    K.bake_shapes(ob, coords)


# ---------- the whiteboard on its easel (table.js boardMap, charts: bars left, the line that only goes up) ----------
def build_board(car):
    M = K.M
    x0, x1, zb, y0, y1 = 2.45, 3.95, 0.25, TOP + 1.55, TOP + 0.45

    def uv(u, v, d=0.0):
        return B(lerp(x0, x1, u), lerp(y0, y1, v), zb - d)

    b = K.Builder()
    b.box(M["boardframe"], B((x0 + x1) / 2, (y0 + y1) / 2, zb + 0.02), (x1 - x0 + 0.08, 0.03, y0 - y1 + 0.1))
    b.box(M["board"], B((x0 + x1) / 2, (y0 + y1) / 2, zb), (x1 - x0, 0.03, y0 - y1))
    hs = [0.25, 0.38, 0.3, 0.5, 0.62]
    for i, h in enumerate(hs):                       # the bars wobble a little in the draft; held at t=28 here
        h = h + 0.05 * math.sin(28 * 0.7 + i)
        u = 0.08 + i * 0.085
        c = (uv(u, 0.9 - h / 2, 0.02) + uv(u + 0.06, 0.9 - h / 2, 0.02)) / 2
        b.box(M["bar_b" if i % 2 == 0 else "bar_r"], c, ((x1 - x0) * 0.06, 0.01, (y0 - y1) * h))
    w = 0.006
    b.rod(M["ink"], uv(0.56, 0.1, 0.022), uv(0.56, 0.9, 0.022), w, seg=6)
    b.rod(M["ink"], uv(0.56, 0.9, 0.022), uv(0.96, 0.9, 0.022), w, seg=6)
    pts = [(0.58, 0.8), (0.66, 0.72), (0.73, 0.76), (0.8, 0.58), (0.87, 0.5), (0.93, 0.34)]
    for (ua, va), (ub, vb) in zip(pts, pts[1:]):
        b.rod(M["bar_r"], uv(ua, va, 0.024), uv(ub, vb, 0.024), 0.011, seg=6)
    for lx, lz in ((x0 + 0.1, zb), (x1 - 0.1, zb), ((x0 + x1) / 2, zb + 0.5)):
        b.rod(M["easel"], B(lx, y0 + 0.1, zb + 0.03), B(lx, TOP, lz), 0.02, seg=8)
    b.build("Whiteboard", K.COL_CAR, car, smooth=False)


# =============================================================================================
# the suits (car.js seatGeom, bodyPose, legPts/kneeIK, suit, egg, rosette, gavelProp)
# Seat frame: x lateral (fwd x up), y toward the table, z up.
# =============================================================================================
def knee_ik(h, f, bend):
    a, b_ = 0.42, 0.56
    d = f - h
    L = d.length
    if L >= a + b_ - 1e-3:
        return h + d * (a / (a + b_))
    u = d / L
    al = (a * a - b_ * b_ + L * L) / (2 * L)
    hh = math.sqrt(max(0.0, a * a - al * al))
    p = bend - u * bend.dot(u)
    p = p.normalized() if p.length > 1e-6 else Vector((0, 0, 1))
    return h + u * al + p * hh


def seat_matrix(s):
    fwd = Vector((0, -math.copysign(1, s["z"]), 0)) if s["z"] else Vector((-math.copysign(1, s["x"]), 0, 0))
    up = Vector((0, 0, 1))
    m = Matrix((fwd.cross(up), fwd, up)).transposed().to_4x4()
    m.translation = Vector((s["x"], s["z"], 0))
    return m


def build_seat(b, s):
    M = K.M
    gap = abs(s["z"]) - TD if s["z"] else abs(s["x"]) - TL
    by = SEAT - 0.05
    A, Bp, Cp = (0, gap + 0.02, TOP - 0.24), (0, 0.08, by), (0, gap + 0.2, by)
    b.rod(M["beam"], Cp, Bp, 0.045, seg=10)
    b.rod(M["beam"], A, Bp, 0.04, seg=10)
    b.rod(M["beam"], A, Cp, 0.03, seg=10)
    for p in (A, Bp):
        b.ellipsoid(M["gold"], p, (0.045,) * 3, seg=10)
    ca, cb, sc = Vector((0.2, -0.15, by - 0.02)), Vector((0.42, -0.42, 0.0)), 0.5
    b.rod(M["crutch"], ca, cb, 0.022, seg=8)
    fm = ca + Vector((0, 0, -0.3 * sc))
    b.rod(M["crutch"], fm, ca + Vector((-0.18 * sc, 0, -0.1 * sc)), 0.016, seg=6)
    b.rod(M["crutch"], fm, ca + Vector((0.18 * sc, 0, -0.1 * sc)), 0.016, seg=6)
    b.rod(M["pad"], ca + Vector((-0.22 * sc, 0, 0)), ca + Vector((0.22 * sc, 0, 0)), 0.035, seg=10)
    b.box(M["seat"], (0, 0, SEAT - 0.035), (0.5, 0.4, 0.07))
    b.box(M["seatback"], (0, -0.22, SEAT + 0.145), (0.46, 0.04, 0.25), rot=Matrix.Rotation(-0.16, 4, "X"))
    for j in range(4):
        b.ellipsoid(M["gold"], (-0.15 + j * 0.1, -0.245, SEAT + 0.23), (0.018,) * 3, seg=8)


def body_pose(stand):
    """bodyPose(): hips (y, height) and the two feet, seated -> stood up beside the seat."""
    hy, hipy = lerp(SEAT + 0.03, 0.93, stand), lerp(0.0, 0.18, stand)
    feet = [Vector((d * lerp(0.26, 0.14, stand), lerp(0.36, 0.28, stand), 0.03)) for d in (-1, 1)]
    return hipy, hy, feet


def build_legs(b, hipy, hy, feet):
    sw = 1.25 * (1 - clamp((hy - SEAT - 0.03) / 0.45)) + 0.15
    knees = []
    for d, f in zip((-1, 1), feet):
        h = Vector((d * 0.1, hipy - 0.02, hy))
        kn = knee_ik(h, f, Vector((d * sw, 0.3, 1.0)))
        b.rod(K.M["suit"], h, kn, 0.085, 0.075)
        b.rod(K.M["suit"], kn, f + Vector((0, 0, 0.06)), 0.07, 0.06)
        b.ellipsoid(K.M["shoe"], f + Vector((0, 0.05, 0.03)), (0.055, 0.11, 0.045), seg=12)
        knees.append(kn)
    return knees


def build_upper(b, s, hipy, hy, knees, hand_r=None):
    """Torso, shirt/tie/rosette (or the drawers), arms, neck. hand_r: the right hand's seat-local
    position when it holds the gavel. Returns the shoulder height."""
    M = K.M
    sh = hy + TORSO
    b.cone(M["suit"], (0, hipy, hy + TORSO / 2), 1.0, 1.0, TORSO, seg=24, rot=Matrix.Diagonal((0.23, 0.14, 1, 1)))
    b.ellipsoid(M["suit"], (0, hipy, sh - 0.02), (0.27, 0.15, 0.08), seg=20)
    b.ellipsoid(M["suit"], (0, hipy, hy), (0.23, 0.15, 0.06), seg=20)
    fy = hipy + 0.142
    if s["r"] == "drawer":
        for i in (0, 2):                                  # the middle drawer is its own object (it slides out)
            dz = sh - (0.08 + i * 0.125) - 0.05
            b.box(M["drawer"], (0, fy, dz), (0.26, 0.03, 0.1))
            b.ellipsoid(M["gold"], (0, fy + 0.02, dz), (0.016,) * 3, seg=8)
        b.box(M["drawer_in"], (0, fy - 0.02, sh - 0.255), (0.24, 0.02, 0.09))
    else:
        b.poly(M["shirt"], [(-0.08, fy, sh - 0.01), (0.0, fy + 0.012, sh - 0.31), (0.08, fy, sh - 0.01)])
        b.poly(M["tie"], [(-0.02, fy + 0.006, sh - 0.03), (0.02, fy + 0.006, sh - 0.03), (0.03, fy + 0.014, sh - 0.25),
                          (0.0, fy + 0.016, sh - 0.29), (-0.03, fy + 0.014, sh - 0.25)])
        rot = Matrix.Rotation(-math.pi / 2, 4, "X")
        rc = Vector((0.15, fy + 0.012, sh - 0.12))
        b.disc(M["rosette"], rc, 0.05, seg=24, rot=rot)
        b.disc(M["rosette_c"], rc + Vector((0, 0.004, 0)), 0.018, seg=16, rot=rot)
        b.poly(M["rosette"], [(rc.x - 0.02, rc.y - 0.001, rc.z), (rc.x - 0.035, rc.y - 0.001, rc.z - 0.1), (rc.x - 0.008, rc.y - 0.001, rc.z - 0.085)])
        b.poly(M["rosette"], [(rc.x + 0.008, rc.y - 0.001, rc.z), (rc.x + 0.018, rc.y - 0.001, rc.z - 0.105), (rc.x + 0.04, rc.y - 0.001, rc.z - 0.09)])
    for d, kn in zip((-1, 1), knees):
        shp = Vector((d * 0.25, hipy, sh - 0.06))
        if d == 1 and hand_r is not None:
            hand = hand_r
            elbow = (shp + hand) / 2 + Vector((0.04, 0, -0.03))
        else:
            hand = kn + Vector((0, -0.04, 0.07))
            elbow = Vector((d * 0.29, hipy + 0.02, lerp(shp.z, hand.z, 0.55)))
        b.rod(M["suit"], shp, elbow, 0.068, 0.06)
        b.rod(M["suit"], elbow, hand, 0.06, 0.05)
        b.ellipsoid(M["egg"], hand, (0.05, 0.055, 0.045), seg=12)
    b.rod(M["neck"], (0, hipy, sh - 0.06), (0, hipy, sh + 0.04), 0.045, seg=12)
    return sh


def build_head(i, parent):
    b = K.Builder()
    b.ellipsoid(K.M["egg"], (0, 0, 0), (0.125, 0.125 * 0.95, 0.155), seg=32)
    return b.build("Head_%d" % i, K.COL_CAR, parent)


# ---------- the gavel (gavelPose / gavelProp): a barrel mallet swung in a plane turned 45 deg ----------
HX, HZ = math.sqrt(0.5), -math.sqrt(0.5)


def gavel_axes(th):
    d0, d1 = math.cos(th), math.sin(th)
    R = Vector((HX * d0, HZ * d0, d1))           # Blender car-local: (draft x, draft z, draft y)
    N = Vector((HX * -d1, HZ * -d1, d0))
    return R, N


def build_suits(car):
    M = K.M
    law_win = [f for f in K.FRAMES if K.ft(f) < W_LAW + 2.05]       # the chairman moves only around "law"
    heads = []
    for i, s in enumerate(SEATS):
        smat = seat_matrix(s)
        holder = K.empty("Seat_%d" % i, K.COL_CAR, parent=car)
        holder.matrix_basis = smat
        b = K.Builder()
        build_seat(b, s)
        b.build("SeatGear_%d" % i, K.COL_CAR, holder)
        seated = body_pose(0.0)
        if i != CHAIR:
            b = K.Builder()
            knees = build_legs(b, seated[0], seated[1], seated[2])
            b.build("Legs_%d" % i, K.COL_CAR, holder)
            b = K.Builder()
            sh = build_upper(b, s, seated[0], seated[1], knees)
            upper = b.build("Upper_%d" % i, K.COL_CAR, holder)
            if s["r"] == "drawer":
                d = K.Builder()
                d.box(M["drawer"], (0, 0, 0), (0.26, 0.03, 0.1))
                d.ellipsoid(M["gold"], (0, 0.02, 0), (0.016,) * 3, seg=8)
                drw = d.build("Drawer", K.COL_CAR, upper, loc=(0, 0.142, sh - 0.255))
                K.key_series(drw, "location", [0.142 + 0.16 * (st["seats"][i]["dr"] or 0) for st in S], index=1)
            K.key_series(upper, "location", [0.09 * st["seats"][i]["bo"] for st in S], index=2)
            head = build_head(i, upper)
            K.key_series(head, "location", [sh + 0.19 - 0.035 * st["seats"][i]["nod"] for st in S], index=2)
            K.key_series(head, "rotation_euler", [0.12 * st["seats"][i]["nod"] for st in S], index=0)
            continue

        # the chairman: hops off his seat and slams the gavel on "law"; body baked per frame round the word
        def pose(f):
            st = S[f - 1]["seats"][i]
            hipy, hy, feet = body_pose(st["st"])
            hand = None
            gav = None
            if st["arms"] == "gavel":
                shl = Vector((0.2, hipy, hy + TORSO - 0.06))          # gavelProp's shoulder: sp(..., 0, .2, hy + TORSO - .06)
                R, N = gavel_axes(S[f - 1]["gavel"])
                Rl, Nl = smat.to_3x3().inverted() @ R, smat.to_3x3().inverted() @ N
                hand = shl + Rl * 0.42
                gav = (shl, Rl, Nl)
            return hipy, hy, feet, hand, gav

        def chair_coords(f):
            hipy, hy, feet, hand, _ = pose(f)
            b = K.Builder()
            knees = build_legs(b, hipy, hy, feet)
            build_upper(b, s, hipy, hy, knees, hand_r=hand if hand is not None else None)
            return b.coords()

        # topology must not depend on the pose: build_upper with a gavel hand has the same parts as without
        b = K.Builder()
        hipy, hy, feet, hand, _ = pose(1)
        knees = build_legs(b, hipy, hy, feet)
        build_upper(b, s, hipy, hy, knees, hand_r=hand)
        body = b.build("Chairman", K.COL_CAR, holder)
        K.bake_shapes(body, chair_coords, frames=law_win)
        head = build_head(i, holder)
        hl = []
        for f in K.FRAMES:
            hipy, hy, _, _, _ = pose(f)
            st = S[f - 1]["seats"][i]
            hl.append((0, hipy, hy + TORSO + 0.19 - 0.035 * st["nod"]))
        K.key_loc(head, hl)
        K.key_series(head, "rotation_euler", [0.12 * st["seats"][i]["nod"] for st in S], index=0)

        # the gavel: handle .36-.98 m out along R, a barrel head .5 long, r .11 at R = 1.05 along N
        g = K.Builder()
        g.rod(M["handle"], (0.36, 0, 0), (0.984, 0, 0), 0.028, seg=10)
        g.cone(M["gavel"], (1.05, 0, 0), 0.11, 0.11, 0.5, seg=24, rot=Matrix.Rotation(math.pi / 2, 4, "X"), caps=False)
        g.disc(M["gavel_end"], (1.05, -0.25, 0), 0.11, seg=24, rot=Matrix.Rotation(math.pi / 2, 4, "X"))
        g.disc(M["gavel_end"], (1.05, 0.25, 0), 0.11, seg=24, rot=Matrix.Rotation(-math.pi / 2, 4, "X"))
        for fy_ in (-0.17, 0.17):
            g.cone(M["gold"], (1.05, fy_, 0), 0.116, 0.116, 0.02, seg=24, rot=Matrix.Rotation(math.pi / 2, 4, "X"), caps=False)
        gav = g.build("Gavel", K.COL_CAR, holder)
        # after the blow the striking end (-N, the bottom) spreads like a soft rubber stamp (draft: sq = 1 + .55 soft)
        gav.shape_key_add(name="Basis", from_mix=False)
        kb = gav.shape_key_add(name="Soft", from_mix=False)
        for v, kv in zip(gav.data.vertices, kb.data):
            p = v.co
            if p.x > 0.9:
                u = clamp(-p.y / 0.25)
                c = Vector((1.05, p.y, 0))
                kv.co = c + (p - c) * (1 + 0.55 * u) + Vector((0, -0.04 * u, 0))
        softv = [ease(K.ft(f), W_LAW + 0.04, W_LAW + 0.9) * (1 - ease(K.ft(f), W_LAW + 1.6, W_LAW + 2.4)) for f in K.FRAMES]
        K.key_series(gav.data.shape_keys, 'key_blocks["Soft"].value', softv)
        mats_, vis = [], []
        last = None
        for f in K.FRAMES:
            _, _, _, _, gv = pose(f)
            if gv is not None:
                shl, Rl, Nl = gv
                W = Rl.cross(Nl)
                m = Matrix((Rl, Nl, W)).transposed().to_4x4()
                m.translation = shl
                last = m
            mats_.append(last if last is not None else Matrix.Identity(4))
            vis.append(1.0 if gv is not None else 0.0)
        first = next(m for m in mats_ if m is not None)
        K.key_matrix(gav, [m if v else first for m, v in zip(mats_, vis)])
        for k in range(3):
            K.key_series(gav, "scale", vis, index=k, interp="CONSTANT")
        heads.append(head)
    return heads


# ---------- the stamp's red ink mark and the shock ring of the blow (lawMarks) ----------
def build_law_marks(car):
    M = K.M
    hx, hz = -4.25, -0.92
    b = K.Builder()
    vi = [b.bm.verts.new((hx + math.cos(i / 30 * 2 * math.pi) * 0.28, hz + math.sin(i / 30 * 2 * math.pi) * 0.27, TOP + 0.004)) for i in range(30)]
    vo = [b.bm.verts.new((hx + math.cos(i / 30 * 2 * math.pi) * 0.32, hz + math.sin(i / 30 * 2 * math.pi) * 0.29, TOP + 0.004)) for i in range(30)]
    b._tag([b.bm.faces.new((vi[i], vi[(i + 1) % 30], vo[(i + 1) % 30], vo[i])) for i in range(30)], M["stamp"])
    b.disc(M["stamp"], (hx, hz, TOP + 0.004), 0.19, seg=30, scale=(1, 0.9))
    star = [(hx + math.cos(i / 10 * 2 * math.pi) * (0.06 if i % 2 else 0.14), hz + math.sin(i / 10 * 2 * math.pi) * (0.06 if i % 2 else 0.14) * 0.9, TOP + 0.005) for i in range(10)]
    b.poly(M["stamp_star"], star)
    mark = b.build("LawMark", K.COL_CAR, car, smooth=False)
    a = [ease(K.ft(f), W_LAW + 0.7, W_LAW + 0.95) * (1 - ease(K.ft(f), L0E + 0.8, L0E + 2.2)) for f in K.FRAMES]
    # fade by sinking the mark below the table top (no alpha needed on a flat decal)
    K.key_series(mark, "location", [0.0 if v > 0.5 else -0.02 for v in a], index=2, interp="CONSTANT")
    r = K.Builder()
    vi = [r.bm.verts.new((math.cos(i / 40 * 2 * math.pi) * 0.96, math.sin(i / 40 * 2 * math.pi) * 0.9 * 0.96, 0)) for i in range(40)]
    vo = [r.bm.verts.new((math.cos(i / 40 * 2 * math.pi), math.sin(i / 40 * 2 * math.pi) * 0.9, 0)) for i in range(40)]
    r._tag([r.bm.faces.new((vi[i], vi[(i + 1) % 40], vo[(i + 1) % 40], vo[i])) for i in range(40)], M["shock"])
    ring = r.build("ShockRing", K.COL_PLAYA, car, smooth=False, loc=(hx, hz, TOP + 0.006))
    sc = []
    for f in K.FRAMES:
        u = (K.ft(f) - W_LAW) / 0.55
        sc.append(0.3 + u * 1.6 if 0 <= u < 1 else 0.0)
    for k in range(2):
        K.key_series(ring, "scale", sc, index=k)
    K.key_series(ring, "scale", [1.0 if v else 0.0 for v in sc], index=2, interp="CONSTANT")


# =============================================================================================
# the speakerphone (table.js speakerphone): a soft watch, baked per frame from the draft's own maths
# =============================================================================================
CX = 1.2
NA = 48
RINGS = [0.03, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.78, 0.85, 0.9, 0.94, 0.97, 1.0]
DOME = (0.03, 0.25, 0.5, 0.75, 1.0)
BEND_R = 0.025


def melt(t):
    return clamp((t - 20) / 200) * 0.55 + ease(t, L1S, L1E) * 0.12


def phone_slump(t):
    return ease(t, W_CANT + 0.45, L1E + 0.7) * (1 - 0.72 * ease(t, L2S + 0.3, L2S + 1))


def tape_amt(t):
    return ease(t, W_CANT - 0.05, W_CANT + 0.2) * (1 - ease(t, L2S + 0.3, L2S + 0.6))


def flow(st, x, z, f=1.0):
    cz, sl = st["cz"], st["sl"]
    dx, dz = x - CX, z - cz
    front = clamp(-dz / 0.3)
    side = 1 - 0.55 * (dx / 0.4) ** 2
    return CX + dx * (1 + 0.2 * sl * f), z - sl * f * (0.12 + 0.78 * front * side)


def drape(x, z, h):
    if z >= -TD:
        return B(x, TOP + h, z)
    d = -TD - z
    yc = TOP - BEND_R
    th = d / (BEND_R + 0.02)
    rr = BEND_R + h
    if th <= math.pi / 2:
        return B(x, yc + rr * math.cos(th), -TD - rr * math.sin(th))
    rem = d - (math.pi / 2) * (BEND_R + 0.02)
    return B(x, yc - rem * 1.05, -TD - rr)


def body_h(rho):
    if rho <= 0.9:
        return 0.04 + 0.008 * (1 - (rho / 0.9) ** 2)
    return 0.034 if rho <= 0.97 else 0.018


def phone_coords(fr):
    t = K.ft(fr)
    st = dict(sl=phone_slump(t), cz=-0.95 - melt(t) * 0.75, tape=tape_amt(t), red=W_CANT < t < L2S + 0.5)
    sl, cz = st["sl"], st["cz"]
    co = []

    def body_pt(a, rho, h, scale=1.0, dz=0.0):
        r = 0.34 * (1 + 0.14 * math.cos(3 * a)) * (1 + sl * 0.06 * n1(5, a * 2)) * rho
        x, z = flow(st, CX + math.cos(a + 0.5) * r, cz + math.sin(a + 0.5) * r * 0.9)
        if scale != 1.0:
            x, z = CX + (x - CX) * scale, cz + (z - cz) * scale - dz
        return drape(x, z, h)

    for rho in RINGS:
        for i in range(NA):
            co.append(body_pt(i / NA * 2 * math.pi, rho, body_h(rho)))
    for i in range(NA):
        co.append(body_pt(i / NA * 2 * math.pi, 1.0, 0.002))
    co.append(body_pt(0.0, 0.0, 0.002))
    for rho in DOME:
        for i in range(NA):
            co.append(body_pt(i / NA * 2 * math.pi, rho, 0.052 + 0.006 * (1 - rho * rho), scale=0.55, dz=sl * 0.05))
    for k in range(9):
        a = k / 9 * 2 * math.pi
        x, z = flow(st, CX + math.cos(a) * 0.1, cz + math.sin(a) * 0.09, 0.5)
        for j in range(8):
            b_ = j / 8 * 2 * math.pi
            co.append(drape(x + math.cos(b_) * 0.013, z + math.sin(b_) * 0.012, 0.0595))
    for col in ("g", "r"):
        on = st["red"] == (col == "r")
        for k in range(3):
            a = k / 3 * 2 * math.pi + 0.5
            x, z = flow(st, CX + math.cos(a) * 0.24, cz + math.sin(a) * 0.216)
            for j in range(8):
                b_ = j / 8 * 2 * math.pi
                co.append(drape(x + math.cos(b_) * 0.022, z + math.sin(b_) * 0.02, 0.046 if on else 0.01))
    tp = st["tape"]
    for d in (1, -1):
        p0 = flow(st, CX - 0.3 * tp, cz - 0.25 * d * tp, 0.35)
        p1 = flow(st, CX + 0.3 * tp, cz + 0.25 * d * tp, 0.35)
        dx, dz = p1[0] - p0[0], p1[1] - p0[1]
        L = math.hypot(dx, dz) or 1.0
        nx, nz = -dz / L * 0.045 * min(1.0, tp * 4), dx / L * 0.045 * min(1.0, tp * 4)
        for k in range(9):
            u = k / 8
            x, z = lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u)
            hh = 0.064 + 0.006 * math.sin(u * math.pi) + (0.004 if d < 0 else 0)
            co.append(drape(x - nx, z - nz, hh))
            co.append(drape(x + nx, z + nz, hh))
    for i in range(4):
        x = CX - 0.2 + i * 0.13
        ov = -TD - flow(st, x, cz - 0.3)[1]
        ln = sl * (0.1 + 0.2 * rnd(i, 61)) * (1 + 0.15 * math.sin(t * 2 + i)) if ov > 0.03 else 0.0
        top_y = min(TOP + 0.04 - ov * 1.05 + 0.03, TOP - 0.05)
        for yy, rr in [(top_y + 0.02, 0.035), (top_y - ln * 0.5, 0.024), (top_y - ln, 0.03)]:
            for j in range(8):
                b_ = j / 8 * 2 * math.pi
                rr2 = rr if ln else 0.0
                co.append(B(x + math.cos(b_) * rr2, yy, -TD - BEND_R - 0.012 + math.sin(b_) * rr2 * 0.6))
        co.append(B(x, top_y - ln - (0.03 if ln else 0.0), -TD - BEND_R - 0.012))
    return co


def build_phone(car):
    import bpy
    M = K.M
    bm = bmesh.new()
    vs = [bm.verts.new(c) for c in phone_coords(1)]
    mats = [M["phone"], M["dome"], M["grille"], M["led_g"], M["led_r"], M["tape"]]

    def face(idx, mi):
        bm.faces.new([vs[k] for k in idx]).material_index = mi

    nr = len(RINGS)
    for r in range(nr - 1):
        for i in range(NA):
            j = (i + 1) % NA
            face([r * NA + i, r * NA + j, (r + 1) * NA + j, (r + 1) * NA + i], 0)
    rim = nr * NA
    for i in range(NA):
        j = (i + 1) % NA
        face([(nr - 1) * NA + i, (nr - 1) * NA + j, rim + j, rim + i], 0)
    bc = rim + NA
    for i in range(NA):
        face([rim + (i + 1) % NA, rim + i, bc], 0)
    d0 = bc + 1
    for r in range(len(DOME) - 1):
        for i in range(NA):
            j = (i + 1) % NA
            face([d0 + r * NA + i, d0 + r * NA + j, d0 + (r + 1) * NA + j, d0 + (r + 1) * NA + i], 1)
    k0 = d0 + len(DOME) * NA
    for k in range(9):
        face(list(range(k0 + k * 8, k0 + k * 8 + 8)), 2)
    l0 = k0 + 72
    for c in range(2):
        for k in range(3):
            face(list(range(l0 + (c * 3 + k) * 8, l0 + (c * 3 + k) * 8 + 8)), 3 + c)
    t0 = l0 + 48
    for d in range(2):
        s0 = t0 + d * 18
        for k in range(8):
            face([s0 + 2 * k, s0 + 2 * k + 2, s0 + 2 * k + 3, s0 + 2 * k + 1], 5)
    r0 = t0 + 36
    for i in range(4):
        s0 = r0 + i * 25
        for ring in range(2):
            for j in range(8):
                jj = (j + 1) % 8
                face([s0 + ring * 8 + j, s0 + ring * 8 + jj, s0 + (ring + 1) * 8 + jj, s0 + (ring + 1) * 8 + j], 0)
        for j in range(8):
            face([s0 + 16 + j, s0 + 16 + (j + 1) % 8, s0 + 24], 0)
    assert len(vs) == r0 + 100, len(vs)
    me = bpy.data.meshes.new("RP_Speakerphone")
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    me.shade_smooth()
    ob = bpy.data.objects.new("RP_Speakerphone", me)
    K.COL_CAR.objects.link(ob)
    ob.parent = car
    K.bake_shapes(ob, phone_coords)
    ss = ob.modifiers.new("Soft", "SUBSURF")
    ss.levels = ss.render_levels = 1


def build():
    mats()
    car = build_car()
    build_skirt(car)
    build_board(car)
    build_suits(car)
    build_law_marks(car)
    build_phone(car)
