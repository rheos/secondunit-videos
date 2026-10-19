"""The boardroom table car (draft 24 car.js, table.js): table with the driver's hole, skirt, wheels, whiteboard,
14 egg-head suits on black office chairs (car.js seatTop/officeBase, still on the brackets and crutches), the chairman's
gavel on "law" with its stamp, shock ring and the DAY plate, the profile driver in the hole (steers, ducks), the real
car's clutter (megaphones, laptops, mugs, hoop, thermos, mirror sign), and the speakerphone whose overhang narrows into
a Dali lobe, with the mute button, the far-row suit's reach and the black smoke. Poses via state("core"), the d24
extras via state("car") (tools/probes/car.js)."""
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
        "hat": lambda: toon("FedoraFeltCrown", "#b52c22", shadow="#7e1c15", light="#d24a36"),
        "brim": lambda: toon("FedoraFeltBrim", "#8f2018", shadow="#5e130e"),
        "band": lambda: toon("FedoraBand", "#3a1410", shadow="#240b08"),
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
        "c_pan": lambda: toon("ChairSeatShell", "#0d0b0b", shadow="#070606"),
        "c_lea": lambda: toon("ChairSeatLeather", "#26211f", shadow="#141110", light="#3a3330"),
        "c_back": lambda: toon("ChairSeatBack", "#1d1a18", shadow="#0f0d0c", light="#2e2a27"),
        "c_seam": lambda: flat("ChairSeam", "#080707"),
        "c_base": lambda: toon("ChairBaseSeat", "#121113", shadow="#0a0a0b"),
        "c_lift": lambda: toon("ChairLiftChrome", "#5a5a62", shadow="#2a2a30", light="#c8c8d2"),
        "c_cast": lambda: toon("ChairCasterTyre", "#0a0a0a", shadow="#050505"),
        "pod": lambda: toon("PhonePod", "#4a4e56", shadow="#33363c"),
        "bezel": lambda: toon("PhoneBezel", "#a7acb4", shadow="#7c8088"),
        "holes": lambda: flat("PhoneHoles", "#80858d"),
        "lcd": lambda: flat("PhoneLcd", "#bcd9a4", 1.1),
        "cord": lambda: toon("PhoneCord", "#1b1c20", shadow="#111215"),
        "mutebox": lambda: toon("MuteBoxPhone", "#e8c23a", shadow="#a8861c", light="#f6d860"),
        "mutecap": lambda: toon("MuteCapPhone", "#e0291c", shadow="#9e1a12"),
        "smoke": lambda: K.soft("PhoneSmoke", "#1e1b19", 1.0),
        "wheel": lambda: toon("WheelRimPhone", "#1a181c", shadow="#0f0e10", light="#6a6670"),
        "wheelhub": lambda: toon("WheelHubChrome", "#6a6670", shadow="#3a3840", light="#b8b4bc"),
        "hoop_g": lambda: toon("HoopPlasticGreen", "#4f9e2f", shadow="#356b1f"),
        "hoop_y": lambda: toon("HoopPlasticYellow", "#dfe63c", shadow="#a3a828"),
        "laptop": lambda: toon("LaptopShell", "#b9bcc2", shadow="#6d7076", light="#d6d9de"),
        "keys": lambda: toon("LaptopKeys", "#3a3d44", shadow="#24262b"),
        "screen": lambda: flat("LaptopScreen", "#3d6ea8", 1.0),
        "mug_w": lambda: toon("MugCeramicWhite", "#f4f1ea", shadow="#c4bfb4"),
        "mug_b": lambda: toon("MugCeramicBlue", "#2f6fb5", shadow="#1f4c7d"),
        "mug_r": lambda: toon("MugCeramicRed", "#c7362b", shadow="#8a241c"),
        "coffee": lambda: toon("MugCoffee", "#3b2215", shadow="#24140c"),
        "thermos": lambda: toon("ThermosSteel", "#c4cacf", shadow="#6f777c", light="#e4eaee"),
        "thermoscap": lambda: toon("ThermosCapPlastic", "#b5352a", shadow="#8e2a21"),
        "megaphone": lambda: toon("MegaphonePlastic", "#f2f0ea", shadow="#bdb9b0"),
        "megin": lambda: toon("MegaphoneInside", "#bdb9b0", shadow="#8e8a82"),
        "megdark": lambda: toon("MegaphoneThroat", "#8e8a82", shadow="#5e5a52"),
        "grip": lambda: toon("MegaphoneGrip", "#2a2a2e", shadow="#18181b"),
        "signpole": lambda: toon("SignPoleWood", "#4a3020", shadow="#2e1d12"),
        "signframe": lambda: toon("SignFrameSteel", "#2b2b2e", shadow="#18181a"),
        "mirror": lambda: toon("MirrorChrome", "#dfe8ef", shadow="#7f8d99", light="#f4f8fb"),
        "plate": lambda: toon("DaySignPaper", "#e9dca8", shadow="#b5a878"),
        "plateink": lambda: toon("DaySignInk", "#1e1c22", shadow="#121115"),
        "platebolt": lambda: toon("DaySignBoltSteel", "#8a8478", shadow="#5a554c"),
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
    build_office_chair(b)


def build_office_chair(b):
    """car.js seatTop + officeBase (draft 23/24): black leather executive chair, seat-local (x lateral, y to the table)."""
    M = K.M
    b.box(M["c_pan"], (0, 0.01, SEAT - 0.045), (0.5, 0.42, 0.07))
    b.box(M["c_lea"], (0, 0.01, SEAT - 0.005), (0.48, 0.4, 0.03))
    lean = math.atan2(0.08, 0.62)
    rot = Matrix.Rotation(-lean, 4, "X")
    bc = Vector((0, -0.22 - 0.04, SEAT + 0.04 + 0.29))
    b.box(M["c_back"], bc, (0.44, 0.07, 0.56), rot=rot)
    b.ellipsoid(M["c_back"], bc + rot.to_3x3() @ Vector((0, 0, 0.27)), (0.22, 0.036, 0.07), seg=20)
    for u in (0.3, 0.58):
        p = bc + rot.to_3x3() @ Vector((0, 0.037, (u - 0.47) * 0.6))
        b.rod(M["c_seam"], p + Vector((-0.19, 0, 0)), p + Vector((0.19, 0, 0)), 0.006, seg=6, caps=False)
    for x in (-0.28, 0.28):
        b.rod(M["c_base"], (x, -0.06, SEAT - 0.02), (x, -0.06, SEAT + 0.2), 0.018, seg=8, caps=False)
        b.rod(M["c_lea"], (x, -0.16, SEAT + 0.21), (x, 0.14, SEAT + 0.21), 0.035, seg=10)
    b.rod(M["c_lift"], (0, 0, SEAT - 0.08), (0, 0, 0.15), 0.0225, seg=12, caps=False)
    for j in range(5):
        a = j / 5 * 2 * math.pi + 0.3
        e = Vector((math.cos(a) * 0.27, math.sin(a) * 0.27, 0.1))
        b.rod(M["c_base"], (0, 0, 0.15), e, 0.022, 0.016, seg=8)
        b.ellipsoid(M["c_cast"], e + Vector((0, 0, -0.05)), (0.035, 0.035, 0.035), seg=10)


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


def gavel_blend(f, gv, smat):
    """Seat-local gavel matrix: lying on the table at the chairman's end (GAVEL_LIE) blended by gavelHold into the held
    swing pose (gv = shoulder, R, N), the way gavelLocal lerps its points. Draft 9+: it never leaves the table unseen."""
    t = K.ft(f)
    R0, N0 = Vector((math.cos(0.08), 0, math.sin(0.08))), Vector((0, 1, 0))
    lie = Matrix((R0, N0, R0.cross(N0))).transposed().to_4x4()
    lie.translation = Vector((-3.85, -0.62, TOP + 0.11 - C[f - 1]["sag"])) - R0 * 1.05
    lm = smat.inverted() @ lie
    hold = ease(t, W_LAW - 1.55, W_LAW - 1.25) * (1 - ease(t, W_LAW + 1.1, W_LAW + 1.45))
    if gv is None or hold <= 0:
        return lm
    shl, Rl, Nl = gv
    hm = Matrix((Rl, Nl, Rl.cross(Nl))).transposed().to_4x4()
    hm.translation = shl
    m = lm.to_quaternion().slerp(hm.to_quaternion(), hold).to_matrix().to_4x4()
    m.translation = lm.translation.lerp(hm.translation, hold)
    return m


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
                gav = (shl, Rl, Nl)
                hand = (gavel_blend(f, gav, smat) @ Vector((0.42, 0, 0))).to_3d()
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
        K.key_matrix(gav, [gavel_blend(f, pose(f)[4], smat) for f in K.FRAMES])
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
# the speakerphone (draft 24 table.js speakerphone): the triangle conference phone at PHONE, softening from
# "scientists"; only what runs over the front edge narrows into a long Dali lobe (draft 22). Its state comes from
# the draft (state("car"): melt, slump, phone centre, LEDs), the shape from the draft's own flow().
# =============================================================================================
C = K.state("car")
NA = 48
RINGS = [0.03, 0.12, 0.25, 0.4, 0.55, 0.7, 0.8, 0.88, 0.94, 0.98, 1.0]
BEND_R = 0.025
TAU = 2 * math.pi


def flow(cx, cz, sl, x, z, f=1.0):
    dx, dz = x - cx, z - cz
    front = clamp(-dz / 0.3)
    side = 1 - 0.55 * (dx / 0.4) ** 2
    nx = cx + dx * (1 + 0.25 * sl * f)
    nz = z - sl * f * (0.15 + 1.05 * front * side)
    ov = -TD - nz
    if ov <= 0:
        return nx, nz
    o2 = ov * (1 + 0.7 * sl)
    u = clamp(o2 / 0.75)
    return cx + (nx - cx) * (1 - 0.62 * u ** 1.3) + sl * (0.12 * math.sin(u * 2.4) - 0.04 * u), -TD - o2


def drape(x, z, h):
    """A point h above the soft top, bent smoothly over the front edge and hanging down it."""
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


def ph(a):
    d = ((a - 0.5 - TAU / 6) % (TAU / 3) + TAU / 3) % (TAU / 3) - TAU / 6
    return min(0.25 / math.cos(d), 0.41)


def body_h(rho):
    return 0.045 + 0.01 * (1 - rho * rho) if rho < 0.94 else (0.035 if rho < 0.99 else 0.02)


def loop_strip(b, rows, mat, close_centre=None):
    vs = [[b.bm.verts.new(p) for p in r] for r in rows]
    fs = []
    for r in range(len(vs) - 1):
        n = len(vs[r])
        for i in range(n):
            j = (i + 1) % n
            fs.append(b.bm.faces.new((vs[r][i], vs[r][j], vs[r + 1][j], vs[r + 1][i])))
    if close_centre is not None:
        c = b.bm.verts.new(close_centre)
        n = len(vs[-1])
        for i in range(n):
            fs.append(b.bm.faces.new((vs[-1][(i + 1) % n], vs[-1][i], c)))
    b._tag(fs, mat)


def phone_builder(fr):
    M = K.M
    st = C[fr - 1]
    t = K.ft(fr)
    cx, cz, sl = st["cx"], st["cz"], st["sl"]
    fl = lambda x, z, f=1.0: flow(cx, cz, sl, x, z, f)
    b = K.Builder()
    outline = [ph(i / NA * TAU) * (1 + sl * 0.06 * n1(5, i / NA * TAU * 2)) for i in range(NA)]
    rows = []
    for rho in RINGS:
        rows.append([drape(*fl(cx + math.cos(i / NA * TAU) * outline[i] * rho, cz + math.sin(i / NA * TAU) * outline[i] * rho * 0.9), body_h(rho)) for i in range(NA)])
    rows.append([drape(*fl(cx + math.cos(i / NA * TAU) * outline[i], cz + math.sin(i / NA * TAU) * outline[i] * 0.9), 0.002) for i in range(NA)])
    loop_strip(b, rows, M["phone"], close_centre=drape(*fl(cx, cz), 0.002))

    def blob(mat, x0, z0, r, h, f=1.0, n=12, rz=0.9):
        pts = [drape(*fl(x0 + math.cos(k / n * TAU) * r, z0 + math.sin(k / n * TAU) * r * rz, f), h) for k in range(n)]
        b.poly(mat, pts)

    for c in range(3):                                           # corner mic pods, an LED on each
        a = 0.5 + TAU / 6 + c * TAU / 3
        px, pz = cx + math.cos(a) * 0.3, cz + math.sin(a) * 0.3 * 0.9
        blob(M["pod"], px, pz, 0.07, 0.05, rz=1.0)
        blob(M["led_g"], px, pz, 0.028, 0.03 if st["red"] else 0.056, rz=0.9)
        blob(M["led_r"], px, pz, 0.028, 0.056 if st["red"] else 0.03, rz=0.9)
    for r, mat, h in ((0.16, M["bezel"], 0.053), (0.125, M["grille"], 0.056)):   # the speaker: pale bezel, dark grille
        blob(mat, cx, cz - sl * 0.05, r, h, f=0.5, n=28)
    for k in range(9):
        a = k / 9 * TAU
        blob(M["holes"], cx + math.cos(a) * 0.075, cz + math.sin(a) * 0.068 - sl * 0.05, 0.011, 0.058, f=0.5, n=8, rz=1.0)
    lx, lz = cx + math.cos(1.55) * 0.19, cz + math.sin(1.55) * 0.19 * 0.9          # the LCD strip on the back edge
    b.poly(M["lcd"], [drape(*fl(x, z, 0.3), 0.055) for x, z in ((lx - 0.13, lz - 0.03), (lx + 0.13, lz - 0.03), (lx + 0.13, lz + 0.03), (lx - 0.13, lz + 0.03))])
    for j in range(3):
        b.rod(M["grille"], drape(*fl(lx - 0.1 + j * 0.07, lz, 0.3), 0.058), drape(*fl(lx - 0.05 + j * 0.07, lz, 0.3), 0.058), 0.004, seg=4, caps=False)
    pts = []                                                     # the coiled cord off the back
    for i in range(91):
        u = i / 90
        bx = lerp(cx + math.cos(1.55) * 0.2, cx + 0.95, u)
        bz = lerp(cz + math.sin(1.55) * 0.2, cz + 1.05, u) + 0.25 * math.sin(u * math.pi) * (1 - u)
        w = u * 7 * TAU
        s = math.sin(u * math.pi)
        x, z = fl(bx + math.cos(w) * 0.06 * s, bz + math.sin(w) * 0.045 * s, 0.2)
        pts.append(drape(x, z, 0.012 + 0.035 * s * (0.6 + 0.4 * math.sin(w))))
    for p, q in zip(pts, pts[1:]):
        b.rod(M["cord"], p, q, 0.009, seg=6, caps=False)
    return b


def build_phone(car):
    b = phone_builder(1)
    ob = b.build("Speakerphone", K.COL_CAR, car)
    K.bake_shapes(ob, lambda f: phone_builder(f).coords())


# ---------- the mute button on the far edge, the far-row suit's reach to it, and the smoke (draft 16-17) ----------
def build_mute(car):
    M = K.M
    bx, bz = 1.25, 1.18
    b = K.Builder()
    b.box(M["mutebox"], (bx, bz, TOP + 0.04), (0.28, 0.2, 0.08))
    b.build("MuteBox", K.COL_CAR, car, smooth=False)
    c = K.Builder()
    c.cone(M["mutecap"], (0, 0, 0.025), 0.08, 0.08, 0.05, seg=20)
    cap = c.build("MuteButton", K.COL_CAR, car, loc=(bx, bz, TOP + 0.08))
    K.key_series(cap, "location", [TOP + 0.08 - 0.035 * st["push"] for st in C], index=2)

    def arm_builder(f):
        st = C[f - 1]
        a, h = (st["arm"] if st["arm"] else [[bx, TOP + 1.0, bz + 1.0], [bx, TOP + 0.99, bz + 1.0]])
        a, h = B(*a), B(*h)
        ab = K.Builder()
        cuff = a.lerp(h, 0.86)
        ab.rod(M["suit"], a, cuff, 0.06, 0.055, seg=12)
        ab.rod(M["shirt"], cuff, a.lerp(h, 0.93), 0.05, seg=10, caps=False)
        ab.ellipsoid(M["egg"], h, (0.055, 0.05, 0.045), seg=12)
        return ab
    arm = arm_builder(1).build("MuteArm", K.COL_CAR, car)
    arm["rp_char"] = 1
    K.bake_shapes(arm, lambda f: arm_builder(f).coords())
    for k in range(3):
        K.key_series(arm, "scale", [1.0 if st["arm"] else 0.0 for st in C], index=k, interp="CONSTANT")


def build_smoke(car):
    """phonePuff: 30 soft charcoal puffs, each a camera-facing card (K.soft, alpha keyed through ob.color)."""
    import bpy
    M = K.M
    cams, mats_l = [], []
    for nd in M["smoke"].node_tree.nodes:             # falloff reaches zero at the card's edge (soft()'s default
        if nd.type == "MAPPING":                      # stops at half strength on a unit card), a hazy round puff
            nd.inputs["Scale"].default_value = (2.0, 2.0, 2.0)
            nd.inputs["Location"].default_value = (-1.0, -1.0, -1.0)
    for s in S:
        cw = B(s["cam"][0], s["cam"][1], s["cam"][2])
        cm = Matrix.Translation((s["car"][0], s["car"][1], 0)) @ Matrix.Rotation(s["car"][2], 4, "Z")
        cams.append(cm.inverted() @ cw)
    for i in range(30):
        b = K.Builder()
        b.strip(M["smoke"], [[(-1, -1, 0), (1, -1, 0)], [(-1, 1, 0), (1, 1, 0)]])
        b.bm.verts.new((0, 0, -1))                           # loose verts: give Generated coords a z extent so the
        b.bm.verts.new((0, 0, 1))                            # soft material's spherical falloff is round on the card
        ob = b.build("Smoke_%02d" % i, K.COL_CAR, car, smooth=False)
        ob.visible_shadow = False
        ms, al = [], []
        for f in K.FRAMES:
            p = C[f - 1]["puffs"][i]
            if p is None:
                ms.append(Matrix.Translation((0, 0, -3)) @ Matrix.Diagonal((1e-4, 1e-4, 1e-4, 1)))
                al.append(0.0)
                continue
            pos = B(p[0], p[1], p[2])
            n = (cams[f - 1] - pos).normalized()
            q = n.to_track_quat("Z", "Y").to_matrix().to_4x4()
            ms.append(Matrix.Translation(pos) @ q @ Matrix.Diagonal((p[3] * 1.6, p[3] * 1.45, 1, 1)))
            al.append(p[4])
        K.key_matrix(ob, ms)
        K.key_series(ob, "color", al, index=3)


# ---------- the driver (draft 24 driverHat): profile cut-out in the draft, here in 3D; steers, ducks into the hole ----------
DRV_X = -0.12


def build_driver(car):
    M = K.M
    rig = K.empty("DriverRig", K.COL_CAR, parent=car)
    K.key_series(rig, "location", [-0.6 * st["duck"] for st in C], index=2)
    X, sh = DRV_X, TOP + 0.1
    b = K.Builder()                                          # jacket: shoulders and back, down into the hole
    b.cone(M["suit"], (X, 0, sh - 0.32), 1.0, 1.0, 0.64, seg=24, rot=Matrix.Diagonal((0.15, 0.22, 1, 1)))
    b.ellipsoid(M["suit"], (X, 0, sh), (0.15, 0.24, 0.06), seg=20)
    b.rod(M["neck"], (X, 0, sh - 0.02), (X, 0, sh + 0.09), 0.04, seg=12)
    wx, wz = X + 0.36, sh - 0.02
    tilt = 0.42
    rim_top = lambda ang: Vector((wx, 0, wz)) + Matrix.Rotation(tilt, 3, "Y") @ Vector((0, 0.2 * math.sin(ang), 0.2 * math.cos(ang)))
    # draft 24 shows ONE arm, in profile, reaching to the tilted wheel: a jacket sleeve bent at the elbow, a shirt cuff,
    # a hand closed over the rim (the near side, -Y; the far arm is hidden behind the body)
    shl = Vector((X + 0.03, -0.2, sh - 0.04))
    el = Vector((X + 0.06, -0.26, sh - 0.27))
    hand = rim_top(-0.75)
    wr = el + (hand - el) * 0.84
    b.ellipsoid(M["suit"], shl, (0.075, 0.07, 0.08), seg=16)                  # the shoulder cap
    b.rod(M["suit"], shl, el, 0.062, 0.055, seg=14, caps=False)               # upper sleeve
    b.ellipsoid(M["suit"], el, (0.058, 0.058, 0.058), seg=14)                 # the elbow
    b.rod(M["suit"], el, wr, 0.055, 0.047, seg=14, caps=False)                # forearm sleeve
    b.rod(M["shirt"], wr, el + (hand - el) * 0.9, 0.04, 0.038, seg=12)        # the cuff
    fa = (hand - el).normalized()
    b.ellipsoid(M["egg"], hand - fa * 0.02, (0.045, 0.036, 0.04), seg=14,
                rot=fa.to_track_quat("X", "Z").to_matrix().to_4x4())           # palm over the rim
    b.ellipsoid(M["egg"], hand + Vector((0.0, 0.0, -0.035)), (0.035, 0.02, 0.018), seg=10)   # fingers under it
    b.ellipsoid(M["egg"], hand + Vector((-0.02, -0.03, 0.02)), (0.022, 0.014, 0.014), seg=8)  # the thumb
    body = b.build("DriverBody", K.COL_CAR, rig)
    hb = K.Builder()
    hb.ellipsoid(M["egg"], (0, 0, 0), (0.125, 0.125 * 0.95, 0.155), seg=32)
    head = hb.build("DriverHead", K.COL_CAR, rig, loc=(X + 0.015, 0, sh + 0.21))
    h = K.Builder()                                          # the fedora seated low on the egg, the brim dipping forward
    h.cone(M["brim"], (0, 0, 0), 0.25, 0.24, 0.022, seg=40, rot=Matrix.Diagonal((1, 0.92, 1, 1)))
    h.cone(M["hat"], (0, 0, 0.085), 0.14, 0.12, 0.17, seg=32)
    h.ellipsoid(M["hat"], (0, 0, 0.165), (0.12, 0.1, 0.03), seg=24)
    h.box(M["hat"], (0, 0, 0.172), (0.12, 0.05, 0.02))          # the pinch
    h.cone(M["band"], (0, 0, 0.03), 0.143, 0.139, 0.035, seg=32, caps=False)
    hat = h.build("DriverHat", K.COL_CAR, rig, loc=(X + 0.02, 0, sh + 0.21 + 0.12))
    hat.rotation_euler = (0, 0.08, 0)
    for o in (body, head, hat):
        o["rp_char"] = 1
    w = K.Builder()                                          # the wheel (a prop): rim, hub, three spokes, column
    rim = []
    for k in range(48):
        a = k / 48 * TAU
        rim.append(Vector((0, 0.2 * math.sin(a), 0.2 * math.cos(a))))
    for p, q in zip(rim, rim[1:] + rim[:1]):
        w.rod(M["wheel"], p, q, 0.026, seg=8, caps=False)
    w.cone(M["wheelhub"], (0, 0, 0), 0.05, 0.05, 0.04, seg=16, rot=Matrix.Rotation(math.pi / 2, 4, "Y"))
    for k in range(3):
        a = k / 3 * TAU + math.pi
        w.rod(M["wheelhub"], (0, 0, 0), (0, 0.19 * math.sin(a), 0.19 * math.cos(a)), 0.012, seg=6, caps=False)
    w.rod(M["wheel"], (0, 0, 0), (0.42, 0, 0), 0.025, seg=10, caps=False)
    wheel = w.build("SteeringWheel", K.COL_CAR, rig, loc=(wx, 0, wz))
    K.key_series(wheel, "rotation_euler", [tilt] * len(C), index=1)
    K.key_series(wheel, "rotation_euler", [st["steer"] for st in C], index=0)


# ---------- draft 23-24: the everyday clutter on the real car's top, the mirror sign, the DAY plate ----------
def build_props(car):
    M = K.M
    b = K.Builder()
    hx, hz, R = -3.05, 0.05, 0.42                            # hula hoop, green and yellow bands
    for i in range(32):
        a0, a1 = i / 32 * TAU, (i + 1) / 32 * TAU
        b.rod(M["hoop_g" if i % 2 else "hoop_y"], (hx + math.cos(a0) * R, hz + math.sin(a0) * R, TOP + 0.014),
              (hx + math.cos(a1) * R, hz + math.sin(a1) * R, TOP + 0.014), 0.014, seg=8, caps=False)
    for x, z, side in ((0.55, 1.12, 1), (3.25, 1.12, 1)):    # laptops, the screen toward the far row
        b.box(M["laptop"], (x, z, TOP + 0.0125), (0.34, 0.24, 0.015))
        b.box(M["keys"], (x, z + side * 0.02, TOP + 0.021), (0.28, 0.1, 0.002))
        hinge = Vector((x, z - side * 0.12, TOP + 0.02))
        lean = 0.26
        up = Vector((0, -side * math.sin(lean), math.cos(lean)))
        rot = Matrix.Rotation(side * lean, 4, "X")
        b.box(M["laptop"], hinge + up * 0.115, (0.34, 0.012, 0.23), rot=rot)
        b.box(M["screen"], hinge + up * 0.115 + Vector((0, side * 0.0065 * math.cos(lean), 0.0065 * math.sin(lean) * side)), (0.29, 0.002, 0.19), rot=rot)
    for x, z, mk in ((-3.12, 0.72, "mug_w"), (2.5, -1.22, "mug_b"), (-1.88, -1.22, "mug_r")):   # coffee mugs
        b.cone(M[mk], (x, z, TOP + 0.05), 0.045, 0.045, 0.1, seg=20)
        b.disc(M["coffee"], (x, z, TOP + 0.092), 0.04, seg=20)
        hp = [(x + 0.045 + 0.03 * math.cos(a), z, TOP + 0.05 + 0.03 * math.sin(a)) for a in [(-1.3 + k * 0.65) for k in range(5)]]
        for p, q in zip(hp, hp[1:]):
            b.rod(M[mk], p, q, 0.008, seg=6)
    tx, tz = 3.85, -0.78                                     # thermos: steel body, red cap
    b.cone(M["thermos"], (tx, tz, TOP + 0.125), 0.055, 0.055, 0.25, seg=24)
    b.cone(M["thermoscap"], (tx, tz, TOP + 0.285), 0.055, 0.05, 0.07, seg=24)
    for x, z, hd in ((3.9, -0.85, 0.35), (2.15, 1.12, -2.6)):   # megaphones lying on the table, bell up off the top
        ca, sa = math.cos(hd), math.sin(hd)
        m0 = Vector((x - ca * 0.23, z - sa * 0.23, TOP + 0.05))
        m1 = Vector((x + ca * 0.23, z + sa * 0.23, TOP + 0.14))
        b.rod(M["megaphone"], m0, m1, 0.045, 0.14, seg=24, caps=False)
        ax = (m1 - m0).normalized()
        q = ax.to_track_quat("Z", "Y").to_matrix().to_4x4()
        b.disc(M["megin"], m1 + ax * 0.002, 0.125, seg=24, rot=q)
        b.disc(M["megdark"], m1 + ax * 0.004, 0.05, seg=16, rot=q)
        b.ellipsoid(M["megaphone"], m0, (0.045, 0.045, 0.045), seg=12)
        g0 = Vector((x - ca * 0.05, z - sa * 0.05, TOP + 0.075))
        b.rod(M["grip"], g0, g0 + Vector((0, 0, -0.07)), 0.02, seg=8)
    b.build("TableClutter", K.COL_CAR, car)

    sx, sz = 4.2, 1.33                                       # the round mirror sign on its pole, square to the car's length
    y1, R = TOP + 2.35, 0.3
    cy = y1 + R
    s = K.Builder()
    s.rod(M["signpole"], (sx, sz, TOP - 0.25), (sx, sz, y1), 0.0275, seg=10)
    s.rod(M["signframe"], (sx, sz, y1 - 0.05), (sx, sz, cy - R), 0.015, seg=8)
    ry = Matrix.Rotation(math.pi / 2, 4, "Y")
    s.cone(M["signframe"], (sx, sz, cy), R + 0.015, R + 0.015, 0.03, seg=40, rot=ry)
    s.disc(M["mirror"], (sx + 0.016, sz, cy), R, seg=40, rot=ry)
    s.disc(M["mirror"], (sx - 0.016, sz, cy), R, seg=40, rot=Matrix.Rotation(-math.pi / 2, 4, "Y"))
    s.build("MirrorSign", K.COL_CAR, car)

    build_day_plate(car)


def build_day_plate(car):
    """car.js dayPlate: a cream DAY plate drops onto the skirt at the chairman's end on "law", bounces, swings, stays."""
    M = K.M
    x, z0, z1, y0, y1 = -TL * 0.97 - 0.012, -0.98, -0.6, 0.68, 0.87
    zc = (z0 + z1) / 2
    piv = K.empty("DayPlatePivot", K.COL_CAR, loc=(x, zc, y1), parent=car)
    b = K.Builder()
    b.box(M["plate"], (0, 0, -(y1 - y0) / 2), (0.012, z1 - z0, y1 - y0))
    b.box(M["plateink"], (-0.0065, 0, -(y1 - y0) / 2), (0.001, (z1 - z0) * 0.94, (y1 - y0) * 0.88))
    b.box(M["plate"], (-0.007, 0, -(y1 - y0) / 2), (0.001, (z1 - z0) * 0.9, (y1 - y0) * 0.8))
    for zz in (-0.8 * (z1 - z0) / 2, 0.8 * (z1 - z0) / 2):
        b.ellipsoid(M["platebolt"], (-0.008, zz, -0.035), (0.006, 0.01, 0.01), seg=8)
    b.build("DayPlate", K.COL_CAR, piv, smooth=False)
    # the lettering as geometry (no system font on the render boxes): a bold serif DAY, draft's 36px Georgia on a
    # 100 x 50 plate. u reads left to right (-Y on the plate's face), v up; baseline 41/50 down, cap height ~25/50.
    k_ = (y1 - y0) / 50.0
    vb, vt = -(y1 - y0) + 9 * k_, -(y1 - y0) + 9 * k_ + 25 * k_
    xf = -0.0078
    L = K.Builder()

    def stroke(u0, v0, u1, v1, w):
        du, dv = u1 - u0, v1 - v0
        ln = math.hypot(du, dv)
        rot = Matrix.Rotation(math.atan2(dv, -du), 4, "X")
        L.box(M["plateink"], (xf, -(u0 + u1) / 2, (v0 + v1) / 2), (0.003, ln, w), rot=rot)

    TH, TN, SW = 5.6 * k_, 1.9 * k_, 1.6 * k_                # thick stroke, hairline, serif thickness
    hgt = vt - vb
    def serif(u, v, wd):
        stroke(u - wd / 2, v, u + wd / 2, v, SW)
    # D
    u0 = -37 * k_
    stroke(u0, vb, u0, vt, TH)
    serif(u0 + 1 * k_, vb + SW / 2, 10 * k_); serif(u0 + 1 * k_, vt - SW / 2, 10 * k_)
    cu_, rv, ru = vb + hgt / 2, hgt / 2 - TN / 2, 13 * k_
    pts = [(u0 + 2 * k_ + ru * math.sin(a), cu_ + rv * math.cos(a)) for a in [i_ / 12 * math.pi for i_ in range(13)]]
    for j_, (pa, pb) in enumerate(zip(pts, pts[1:])):
        w_ = TN + (TH - TN) * math.sin((j_ + 0.5) / 12 * math.pi) ** 2
        stroke(pa[0], pa[1], pb[0], pb[1], w_)
    # A
    ua = 0.0
    stroke(ua - 1 * k_, vt, ua - 13 * k_, vb, TN)
    stroke(ua + 1 * k_, vt, ua + 13 * k_, vb, TH)
    stroke(ua - 7.5 * k_, vb + 8 * k_, ua + 7.5 * k_, vb + 8 * k_, TN)
    serif(ua - 13 * k_, vb + SW / 2, 9 * k_); serif(ua + 13.5 * k_, vb + SW / 2, 10 * k_)
    # Y
    uy, vm = 33 * k_, vb + 11 * k_
    stroke(uy - 12 * k_, vt, uy, vm, TH)
    stroke(uy + 12 * k_, vt, uy, vm, TN)
    stroke(uy, vm, uy, vb, TH)
    serif(uy, vb + SW / 2, 12 * k_); serif(uy - 12 * k_, vt - SW / 2, 10 * k_); serif(uy + 12 * k_, vt - SW / 2, 9 * k_)
    L.build("DayLetters", K.COL_CAR, piv, smooth=False)
    vis = [1.0 if st["plate"] else 0.0 for st in C]
    K.key_series(piv, "location", [y1 + (st["plate"][0] if st["plate"] else 0.7) - st["sag"] for st in C], index=2)
    K.key_series(piv, "rotation_euler", [(-st["plate"][1] if st["plate"] else 0.0) for st in C], index=0)
    for k in range(3):
        K.key_series(piv, "scale", vis, index=k, interp="CONSTANT")


def build_sparks(car):
    """table.js phonePuff: a 0.55 s fizz of nine sparks off the phone before the smoke (PUFF.t = "can" - .12)."""
    M = K.M
    if "spark" not in M:
        M["spark"] = K.flat("PhoneSpark", "#ffcf6a", 4.0)
    for i in range(9):
        b = K.Builder()
        b.ellipsoid(M["spark"], (0, 0, 0), (0.018, 0.018, 0.018), seg=8)
        sp = b.build("Spark_%d" % i, K.COL_CAR, car)
        a, v = rnd(i, 81) * TAU, 0.5 + 0.7 * rnd(i, 82)
        locs, scs = [], []
        for f in K.FRAMES:
            st = C[f - 1]
            u = K.ft(f) - (st["wt"]["can"] - 0.12) - i * 0.03
            on = 0 <= u <= 0.35
            uu = clamp(u, 0, 0.35)
            base = Vector((st["cx"], st["cz"] - 0.08, TOP + 0.12 + st["sl"] * 0.02))
            locs.append(base + Vector((math.cos(a) * v * uu, 0, abs(math.sin(a)) * v * uu - 1.6 * uu * uu)))
            scs.append((1 - uu / 0.35) * 0.7 + 0.3 if on else 0.0)
        K.key_loc(sp, locs)
        for k in range(3):
            K.key_series(sp, "scale", scs, index=k, interp="CONSTANT")


def tag_characters():
    for o in K.COL_CAR.objects:
        n = o.name
        if n.startswith(("RP_Legs_", "RP_Upper_", "RP_Head_", "RP_Chairman", "RP_Drawer", "RP_Driver", "RP_MuteArm")) and o.type == "MESH":
            o["rp_char"] = 1


def build():
    mats()
    car = build_car()
    build_skirt(car)
    build_board(car)
    build_suits(car)
    build_law_marks(car)
    build_phone(car)
    build_mute(car)
    build_smoke(car)
    build_sparks(car)
    build_driver(car)
    build_props(car)
    tag_characters()
