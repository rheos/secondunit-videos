"""The lyric installations and props of verse 1 (16.70-40.45 s), from draft 5's installs.js, playa.js and table.js.

- Dali stilt elephants (playa.js elephant(), BM_ELEPHANTS / BM_ROAD): body, head, ears, trunk, tusks, saddle cloth
  and their loads (paper stack, ballot box, banknote bundles, the soft tower). Legs, trunk and tail are baked per
  frame from the draft's own walk maths.
- The padlocked lips on a post (gagMouth, line 2), the ear on its crutch easel with the drawer in its canal, the
  filed tapes, and the four tape lines from the table to the drawer (bigEar, earTapes).
- The reel-to-reel recorders on the table that hop into the drawer torso's open drawer on "every" (tapeRecorders).
- The open-playa art pieces in shot: candle towers, the eye on its tripod (follows the car), chair towers, the
  lantern arch (bmCamp drip / eye / chairs / arch); the soft ballot box on crutches and the giant light bulb
  (bmInstall ballot / bulb, both unlit in verse 1).
- The canvas roller blind that drops over the sky on "blues" (installs.js canvasBlind): a camera-parented sheet,
  baked per frame in camera space from the draft's own screen-space edge, so it covers the sky as the draft does.

Positions, cue times and the blind's edge come from tools/probes/installs.js (out/state/installs.json).
Draft coords (x right, y up, z away) -> Blender B(x, y, z). 2D side-view figures from the draft are rebuilt facing
the draft camera's default view (their front toward -Y), with depth added.
"""
import math

import bpy
from mathutils import Matrix, Vector

import rp_core as K
from rp_core import B, TOP, clamp, lerp, ease, smooth, rnd

S = K.state("core")
I = K.state("installs")
CUE = I[0]["cues"]
LN = CUE["lines"]
EVERY, WANT, BLUES = CUE["every"], CUE["want"], CUE["blues"]
L2S, L2E = LN[2]
M = K.M


def ease_out_back(x, s=1.7):
    x = clamp(x) - 1
    return 1 + x * x * ((s + 1) * x + s)


def hold(t, a, b, c, d):
    return ease(t, a, b) * (1 - ease(t, c, d))


def tf(f):
    return K.ft(f)


# =============================================================================================
# materials
# =============================================================================================
def mats():
    T, F = K.toon, K.flat
    pal = {
        "i_skin": lambda: T("ElSkin", "#8d8178", shadow="#5f5751", light="#b9aca0"),
        "i_earin": lambda: T("ElEarIn", "#a9827a", shadow="#7a5c56"),
        "i_dark": lambda: F("InstDark", "#1c1614"),
        "i_tusk": lambda: T("ElTusk", "#efe6d0", shadow="#b9ae96"),
        "i_cloth": lambda: T("ElCloth", "#c7362b", shadow="#7e1f1a", light="#dc5a46"),
        "i_gold": lambda: T("InstGold", "#d9b45a", shadow="#8f7330", light="#f0d488"),
        "i_paperA": lambda: T("PaperA", "#ece6d6", shadow="#aaa290"),
        "i_paperB": lambda: T("PaperB", "#d9d1bd", shadow="#9c9480"),
        "i_ballot": lambda: T("Ballot", "#ece4cf", shadow="#b3a88e", light="#f7f0de"),
        "i_slot": lambda: F("BallotSlot", "#1a1a1a"),
        "i_red": lambda: F("InstRed", "#c7362b"),
        "i_cashA": lambda: T("CashA", "#b9c99a", shadow="#7e8c66"),
        "i_cashB": lambda: T("CashB", "#9fb37e", shadow="#6a7a52"),
        "i_band": lambda: T("CashBand", "#e8dcb0", shadow="#a89c74"),
        "i_tower": lambda: T("SoftTower", "#e0d0aa", shadow="#a8986f", light="#f1e4c4"),
        "i_pole": lambda: T("InstPole", "#5a4a3a", shadow="#3a2e24"),
        "i_crutch": lambda: T("InstCrutch", "#c9a46a", shadow="#8a6c40", light="#e2c48e"),
        "i_pad": lambda: T("InstPad", "#e9dcc2", shadow="#b0a286"),
        "i_band2": lambda: T("CrutchBand", "#8a6a3c", shadow="#5a4426"),
        "i_ear": lambda: T("Ear", "#e3aa8a", shadow="#b77c5e", light="#f6d7bd"),
        "i_helix": lambda: T("EarFold", "#9c5f45", shadow="#6e3f2c"),
        "i_canal": lambda: F("EarCanal", "#3a160e"),
        "i_drawer": lambda: T("EarDrawer", "#8c6338", shadow="#5a3a1c", light="#a77a48"),
        "i_drawin": lambda: F("EarDrawerIn", "#2a1608"),
        "i_lips": lambda: T("Lips", "#c0322a", shadow="#7e1c17", light="#dc5446"),
        "i_lipline": lambda: F("LipLine", "#6a1712"),
        "i_post": lambda: T("GagPost", "#6b4a2a", shadow="#45301b"),
        "i_steel": lambda: T("Shackle", "#b8b4aa", shadow="#7a766e", light="#e0ddd4"),
        "i_lock": lambda: T("Padlock", "#c9a43a", shadow="#8a6a1e", light="#f0cf6a"),
        "i_rec": lambda: T("Recorder", "#2c2c31", shadow="#1a1a1e", light="#46464e"),
        "i_reel": lambda: T("Reel", "#d8d0bc", shadow="#a39c8a"),
        "i_hub": lambda: F("ReelHub", "#5a3a24"),
        "i_ledoff": lambda: F("LedOff", "#7a1a14"),
        "i_ledon": lambda: F("LedOn", "#ff3b2a", strength=1.6, haze=False),
        "i_tape": lambda: T("TapeLine", "#3f2614", shadow="#26160b"),
        "i_candle": lambda: T("Candle", "#e8dcbc", shadow="#b4a07a", light="#f6ecd2"),
        "i_wax": lambda: T("Wax", "#efe2c2", shadow="#bfae86"),
        "i_flame": lambda: F("Flame", "#ffbe5a", strength=1.4, haze=False),
        "i_eyew": lambda: T("EyeWhite", "#e8e2d6", shadow="#b8b0a2", light="#ffffff"),
        "i_iris": lambda: T("Iris", "#2f6fb5", shadow="#234f80"),
        "i_pupil": lambda: F("Pupil", "#0e0c10"),
        "i_glint": lambda: F("Glint", "#ffffff", haze=False),
        "i_brow": lambda: F("EyeLid", "#3a2a20"),
        "i_tripod": lambda: T("Tripod", "#5a4a3a", shadow="#3a2e24"),
        "i_woodA": lambda: T("ChairWoodA", "#a8743e", shadow="#6e4a26"),
        "i_woodB": lambda: T("ChairWoodB", "#8a5a2c", shadow="#5a3a1c"),
        "i_seat": lambda: T("ChairSeat", "#5c3a1c", shadow="#3a2410"),
        "i_lantY": lambda: T("LanternY", "#e8b23a", shadow="#a87a1e"),
        "i_bulbbase": lambda: T("BulbBase", "#c8c0b0", shadow="#8a8478", light="#d8d0c0"),
        "i_filament": lambda: F("Filament", "#6a5a40"),
    }
    for k, fn in pal.items():
        if k not in M:
            M[k] = fn()
    if "i_glass" not in M:
        M["i_glass"] = glass_mat()
    if "i_canvas" not in M:
        M["i_canvas"] = canvas_mat()


def glass_mat():
    """The bulb's pale glass: a flat tint at 55% (draft rgba(214,226,232,.55)), no haze."""
    mat = bpy.data.materials.new("RP_BulbGlass")
    mat.surface_render_method = "BLENDED"
    mat.use_nodes = True
    n, l = mat.node_tree.nodes, mat.node_tree.links
    n.clear()
    em, tr, mx, out = n.new("ShaderNodeEmission"), n.new("ShaderNodeBsdfTransparent"), n.new("ShaderNodeMixShader"), n.new("ShaderNodeOutputMaterial")
    em.inputs[0].default_value = K.lin("#d6e2e8")
    mx.inputs[0].default_value = 0.55
    l.new(tr.outputs[0], mx.inputs[1])
    l.new(em.outputs[0], mx.inputs[2])
    l.new(mx.outputs[0], out.inputs[0])
    return mat


def canvas_mat():
    """The roller blind's canvas: colour from the mesh's 'col' attribute (the draft's top-to-hem gradient and the
    light through the weave), alpha from its 'a' channel; unlit, so it reads as the draft's flat painted sheet."""
    mat = bpy.data.materials.new("RP_BlindCanvas")
    mat.surface_render_method = "BLENDED"
    mat.use_transparency_overlap = False
    mat.use_nodes = True
    n, l = mat.node_tree.nodes, mat.node_tree.links
    n.clear()
    at = n.new("ShaderNodeVertexColor")
    at.layer_name = "col"
    em, tr, mx, out = n.new("ShaderNodeEmission"), n.new("ShaderNodeBsdfTransparent"), n.new("ShaderNodeMixShader"), n.new("ShaderNodeOutputMaterial")
    l.new(at.outputs["Color"], em.inputs[0])
    l.new(at.outputs["Alpha"], mx.inputs[0])
    l.new(tr.outputs[0], mx.inputs[1])
    l.new(em.outputs[0], mx.inputs[2])
    l.new(mx.outputs[0], out.inputs[0])
    return mat


# =============================================================================================
# pure-python primitives (so baked meshes can recompute vertex positions without bmesh)
# =============================================================================================
def tube_geo(pts, radii, seg=8, ref=(0, 1, 0), caps=True):
    """A tube through pts (Vectors) with a radius per point. ref: a direction never parallel to the tube."""
    pts = [Vector(p) for p in pts]
    if not hasattr(radii, "__len__"):
        radii = [radii] * len(pts)
    ref = Vector(ref)
    verts, faces = [], []
    n = len(pts)
    for i, p in enumerate(pts):
        a = pts[max(0, i - 1)]
        b = pts[min(n - 1, i + 1)]
        tg = b - a
        if tg.length < 1e-9:
            tg = Vector((0, 0, 1))
        tg.normalize()
        n1 = ref - tg * ref.dot(tg)
        if n1.length < 1e-6:
            n1 = tg.orthogonal()
        n1.normalize()
        n2 = tg.cross(n1)
        r = radii[i]
        for k in range(seg):
            th = k / seg * math.tau
            verts.append(p + (n1 * math.cos(th) + n2 * math.sin(th)) * r)
    for i in range(n - 1):
        for k in range(seg):
            k2 = (k + 1) % seg
            faces.append((i * seg + k, i * seg + k2, (i + 1) * seg + k2, (i + 1) * seg + k))
    if caps:
        c0 = len(verts)
        verts.append(pts[0].copy())
        verts.append(pts[-1].copy())
        for k in range(seg):
            k2 = (k + 1) % seg
            faces.append((c0, k2, k))
            faces.append((c0 + 1, (n - 1) * seg + k, (n - 1) * seg + k2))
    return verts, faces


def sphere_geo(c, r, nu=10, nv=6, rot=None):
    c = Vector(c)
    r = Vector(r) if hasattr(r, "__len__") else Vector((r, r, r))
    R = rot.to_3x3() if rot is not None else None
    verts, faces = [], []
    verts.append(Vector((0, 0, -1)))
    for j in range(1, nv):
        ph = -math.pi / 2 + j / nv * math.pi
        for k in range(nu):
            th = k / nu * math.tau
            verts.append(Vector((math.cos(ph) * math.cos(th), math.cos(ph) * math.sin(th), math.sin(ph))))
    verts.append(Vector((0, 0, 1)))
    out = []
    for v in verts:
        w = Vector((v.x * r.x, v.y * r.y, v.z * r.z))
        if R is not None:
            w = R @ w
        out.append(c + w)
    top = len(verts) - 1
    for k in range(nu):
        faces.append((0, 1 + (k + 1) % nu, 1 + k))
    for j in range(nv - 2):
        for k in range(nu):
            a = 1 + j * nu + k
            b = 1 + j * nu + (k + 1) % nu
            faces.append((a, b, b + nu, a + nu))
    base = 1 + (nv - 2) * nu
    for k in range(nu):
        faces.append((base + k, base + (k + 1) % nu, top))
    return out, faces


def add_geo(b, mat, verts, faces):
    vs = [b.bm.verts.new(v) for v in verts]
    fs = [b.bm.faces.new([vs[i] for i in f]) for f in faces]
    b._tag(fs, mat)


def baked(name, coll, parent, parts_at, frames, smooth_shade=True):
    """parts_at(f) -> [(mat, verts, faces)], same topology every frame; built once, baked per frame."""
    frames = list(frames)
    b = K.Builder()
    for mat, vs, fs in parts_at(frames[0]):
        add_geo(b, mat, vs, fs)
    ob = b.build(name, coll, parent, smooth=smooth_shade)
    K.bake_shapes(ob, lambda f: [v for _, vs, _ in parts_at(f) for v in vs], frames)
    return ob


def bez2(p0, p1, p2, u):
    a = 1 - u
    return [a * a * p0[i] + 2 * a * u * p1[i] + u * u * p2[i] for i in range(len(p0))]


def bez3(p0, p1, p2, p3, u):
    a = 1 - u
    return [a ** 3 * p0[i] + 3 * a * a * u * p1[i] + 3 * a * u * u * p2[i] + u ** 3 * p3[i] for i in range(len(p0))]


def key_hidden(ob, hidden):
    """hidden[f-1] True -> not rendered (constant keys)."""
    K.key_series(ob, "hide_render", [1.0 if h else 0.0 for h in hidden], interp="CONSTANT")
    K.key_series(ob, "hide_viewport", [1.0 if h else 0.0 for h in hidden], interp="CONSTANT")


def crutch(b, a, top, w, side=Vector((1, 0, 0))):
    """bmCrutch: a Dali crutch from foot a up to the fork at top (3D Vectors), with its padded cradle.
    side: the direction the cradle spans (perpendicular to the crutch)."""
    a, top = Vector(a), Vector(top)
    d = (top - a)
    n = side - d.normalized() * side.dot(d.normalized())
    n.normalize()
    m = a.lerp(top, 0.62)
    b.rod(M["i_crutch"], a, m, w / 2, seg=8)
    b.rod(M["i_crutch"], m, top + n * w * 1.6, w * 0.35, seg=6)
    b.rod(M["i_crutch"], m, top - n * w * 1.6, w * 0.35, seg=6)
    b.rod(M["i_pad"], top + n * w * 2.6, top - n * w * 2.6, w * 0.7, seg=10)
    hp = a.lerp(top, 0.78)
    b.rod(M["i_band2"], hp + n * w * 1.2, hp - n * w * 1.2, w * 0.4, seg=6)


# =============================================================================================
# car-local placement (parent to rp_car's empty, or fall back to world space from the core state)
# =============================================================================================
def car_world(f):
    x, z, yw = S[f - 1]["car"]
    return Matrix.Translation(B(x, 0, z)) @ Matrix.Rotation(yw, 4, "Z")


def lw_world(f, p):
    """Car-local draft (x, y, z) -> Blender world, as draft's Lw()."""
    x, z, yw = S[f - 1]["car"]
    c, s = math.cos(yw), math.sin(yw)
    return B(x + p[0] * c - p[2] * s, p[1], z + p[0] * s + p[2] * c)


# =============================================================================================
# 1. stilt elephants
# =============================================================================================
LEG_H = 0.9 + 9.6           # grow 1
HX, HYO = 2.55, 1.75        # head x, head height above the body's underside


def L3(u, v, w=0.0):
    """Elephant-local (u along its heading, v up, w depth away from camera) -> Blender local."""
    return Vector((u, w, v))


def el_walk(t, wk, ph):
    w = math.sin(t * 1.4 * wk + ph) * wk
    bob = abs(math.cos(t * 1.4 * wk + ph)) * 0.12 * wk
    return w, bob


def el_limbs(t, wk, ph):
    w, bob = el_walk(t, wk, ph)
    Bv = LEG_H + bob
    parts = []
    for hx, sw, dep in ((-1.0, -w * 1.1, 0.5), (1.85, w * 1.1, 0.5), (-1.5, w * 1.1, -0.5), (1.35, -w * 1.1, -0.5)):
        top = (hx, Bv + 0.35)
        foot = (hx + sw, 0.0)
        k1 = (lerp(top[0], foot[0], 0.38) + 0.28, lerp(top[1], foot[1], 0.36))
        k2 = (lerp(top[0], foot[0], 0.7) - 0.12, lerp(top[1], foot[1], 0.7))
        pts = [L3(hx, Bv + 0.9, dep), L3(*top, dep), L3(*k1, dep), L3(*k2, dep), L3(foot[0], 0.12, dep)]
        vs, fs = tube_geo(pts, [0.13, 0.11, 0.1, 0.085, 0.075], seg=7, ref=(0, 1, 0))
        parts.append((M["i_skin"], vs, fs))
        for kp, r in ((k1, 0.17), (k2, 0.13)):
            vs, fs = sphere_geo(L3(*kp, dep), r, 8, 5)
            parts.append((M["i_skin"], vs, fs))
        vs, fs = sphere_geo(L3(foot[0], 0.09, dep), (0.3, 0.26, 0.11), 10, 5)
        parts.append((M["i_skin"], vs, fs))
    # trunk: draft's quadratic, tip swaying with the stride
    HY = Bv + HYO
    tr = [(HX + 0.7, HY - 0.25), (HX + 1.35, HY - 1.2), (HX + 1.05, HY - 2.6 + w * 0.12)]
    pts = [L3(HX + 0.3, HY - 0.05)] + [L3(*bez2(tr[0], tr[1], tr[2], i / 8)) for i in range(9)]
    rads = [0.3] + [lerp(0.23, 0.1, i / 8) for i in range(9)]
    vs, fs = tube_geo(pts, rads, seg=8, ref=(0, 1, 0))
    parts.append((M["i_skin"], vs, fs))
    # tail and its tuft
    tl = [(-2.3, Bv + 1.55), (-2.4, Bv + 1.5), (-2.75, Bv + 0.9 + w * 0.1), (-2.7, Bv + 0.45)]
    vs, fs = tube_geo([L3(*p) for p in tl], 0.035, seg=5, ref=(0, 1, 0))
    parts.append((M["i_skin"], vs, fs))
    vs, fs = sphere_geo(L3(-2.7, Bv + 0.38), (0.09, 0.09, 0.16), 6, 4)
    parts.append((M["i_dark"], vs, fs))
    return parts


def el_body(b, load, ph):
    """The static part of an elephant: body barrel, head, ears, eyes, tusks, saddle cloth, the load."""
    B0 = LEG_H
    b.ellipsoid(M["i_skin"], L3(0.02, B0 + 1.33), (2.58, 1.05, 1.27), seg=20)
    b.ellipsoid(M["i_skin"], L3(-0.9, B0 + 1.15), (1.6, 0.95, 1.0), seg=14)        # a little sag under the belly
    HY = B0 + HYO
    b.ellipsoid(M["i_skin"], L3(HX, HY), (0.95, 0.85, 0.95), seg=16)
    for d in (-1, 1):
        rot = Matrix.Rotation(-0.15 * d, 4, "Y") @ Matrix.Rotation(0.25 * d, 4, "Z")
        b.ellipsoid(M["i_skin"], L3(HX - 0.45, HY - 0.05, d * 0.82), (0.72, 0.1, 1.05), seg=14, rot=rot)
        b.ellipsoid(M["i_earin"], L3(HX - 0.42, HY - 0.05, d * 0.9), (0.46, 0.05, 0.74), seg=12, rot=rot)
        b.ellipsoid(M["i_dark"], L3(HX + 0.45, HY + 0.3, d * 0.68), (0.075, 0.075, 0.075), seg=8)
        vs, fs = tube_geo([L3(HX + 0.55, HY - 0.55, d * 0.32), L3(HX + 0.95, HY - 0.75, d * 0.32), L3(HX + 1.15, HY - 0.55, d * 0.3)],
                          [0.06, 0.045, 0.02], seg=6, ref=(0, 1, 0))
        add_geo(b, M["i_tusk"], vs, fs)
    # saddle cloth draped over the barrel: x -1.35..1.35, from one flank over the back to the other
    def ring(x, phi, pad):
        a = 1.05 * math.sqrt(max(0.0, 1 - (x / 2.58) ** 2)) + pad
        h = 1.27 * math.sqrt(max(0.0, 1 - (x / 2.58) ** 2)) + pad
        return L3(x, B0 + 1.33 + h * math.cos(phi), a * math.sin(phi))
    xs = [-1.35 + i * 0.45 for i in range(7)]
    phis = [math.radians(-96 + i * 16) for i in range(13)]
    b.strip(M["i_cloth"], [[ring(x, ph_, 0.06) for x in xs] for ph_ in phis])
    for sgn in (-1, 1):
        rows = [[ring(x, sgn * math.radians(a_), 0.075) for x in xs] for a_ in (86, 100)]
        b.strip(M["i_gold"], rows if sgn > 0 else rows[::-1])
        for i in range(10):
            fx = -1.4 + i * 0.31
            p0, p1 = ring(fx, sgn * math.radians(100), 0.075), ring(fx + 0.3, sgn * math.radians(100), 0.075)
            tip = (p0 + p1) / 2 + Vector((0, 0, -0.25))
            b.poly(M["i_gold"], [p0, p1, tip] if sgn > 0 else [p1, p0, tip])
    top = B0 + 2.62
    if load == "papers":
        for i in range(9):
            b.box(M["i_paperA"] if i % 2 else M["i_paperB"], L3(math.sin(i * 2.3) * 0.2, top + i * 0.38 + 0.17), (2.2, 1.7, 0.34),
                  rot=Matrix.Rotation(0.06 * math.sin(i * 1.7), 4, "Z"))
    elif load == "ballot":
        b.box(M["i_ballot"], L3(0, top + 1.2), (2.4, 2.0, 2.4))
        b.box(M["i_slot"], L3(0, top + 2.41), (1.4, 0.25, 0.04))
        b.box(M["i_paperA"], L3(0, top + 2.75), (0.7, 0.04, 0.9))
    elif load == "cash":
        for i in range(6):
            dx = 0.06 * math.sin(i * 2.1)
            b.box(M["i_cashA"] if i % 2 else M["i_cashB"], L3(dx, top + i * 0.32 + 0.15), (2.4, 1.3, 0.3),
                  rot=Matrix.Rotation(0.05 * math.sin(i * 1.3 + 1), 4, "Z"))
            b.box(M["i_band"], L3(dx, top + i * 0.32 + 0.15), (0.4, 1.32, 0.31), rot=Matrix.Rotation(0.05 * math.sin(i * 1.3 + 1), 4, "Z"))
    else:   # the soft tower that droops at its tip, with a red pennant
        b.cone(M["i_tower"], L3(0, top + 1.8), 1.0, 0.3, 3.6, seg=18)
        vs, fs = tube_geo([L3(0, top + 3.55), L3(0.15, top + 3.85), L3(0.45, top + 3.95), L3(0.55, top + 3.82)], [0.3, 0.22, 0.14, 0.08], seg=10, ref=(0, 1, 0))
        add_geo(b, M["i_tower"], vs, fs)
        b.rod(M["i_pole"], L3(0.2, top + 3.85), L3(0.2, top + 4.8), 0.05, seg=6)
        p = [L3(0.2, top + 4.8), L3(1.1, top + 4.62), L3(0.2, top + 4.4)]
        b.poly(M["i_red"], p)
        b.poly(M["i_red"], p[::-1])


def draft_P(c, X, Y, Z):
    """camera.js P(): draft world -> [screen x, screen y, depth] for core cam state c = [x, y, z, pitch, f, yaw]."""
    dx, dz, dy = X - c[0], Z - c[2], Y - c[1]
    cy, sy = math.cos(c[5]), math.sin(c[5])
    dx, dz = dx * cy - dz * sy, dx * sy + dz * cy
    CP, SP = math.cos(c[3]), math.sin(c[3])
    z = -dy * SP + dz * CP
    y = dy * CP + dz * SP
    return 960 + c[4] * dx / max(z, 1e-3), 540 - c[4] * y / max(z, 1e-3), z


def billboard_dx(f, X, Z, h):
    """The draft draws an elephant as a flat figure scaled at its ground point, which ignores the camera's pitch; a
    true 3D body h metres up lands nearer the frame centre. Return the world-X shift that puts our body centre where
    the draft's is on screen (capped), so the frame composition matches draft 5."""
    c = S[f - 1]["cam"]
    gx, gy, gz = draft_P(c, X, 0, Z)
    if gz < 2:
        return 0.0
    want = gx
    d = 0.0
    for _ in range(3):
        sx = draft_P(c, X + d, h, Z)
        sx1 = draft_P(c, X + d + 0.5, h, Z)
        if sx[2] < 2 or sx1[2] < 2 or abs(sx1[0] - sx[0]) < 1e-6:
            return 0.0
        d += (want - sx[0]) * 0.5 / (sx1[0] - sx[0])
    return clamp(d, -8.0, 8.0)


def build_elephants():
    out = []
    n_el = len(I[0]["el"])
    for j in range(n_el):
        vis = [I[f - 1]["el"][j][7] for f in K.FRAMES]
        if not any(vis):
            continue
        X0, Z, s, ph, load, wk, d = I[0]["el"][j][:7]
        road = len(I[0]["el"][j]) > 8
        em = K.empty("Inst_Elephant_%d" % j, K.COL_INST)
        hc = (LEG_H + 1.33) * s
        K.key_loc(em, [B(I[f - 1]["el"][j][0] + billboard_dx(f, I[f - 1]["el"][j][0], Z, hc), 0, Z) for f in K.FRAMES])
        em.scale = (s * d, s, s)
        b = K.Builder()
        el_body(b, load, ph)
        body = b.build("Inst_ElephantBody_%d" % j, K.COL_INST, em)
        K.key_series(body, "location", [el_walk(tf(f), wk, ph)[1] for f in K.FRAMES], index=2)
        limbs = baked("Inst_ElephantLimbs_%d" % j, K.COL_INST, em, lambda f, wk=wk, ph=ph: el_limbs(tf(f), wk, ph), K.FRAMES)
        if road:
            on = [I[f - 1]["el"][j][8] for f in K.FRAMES]
            for ob in (body, limbs):
                key_hidden(ob, [not o for o in on])
        out.append(em)
    return out


# =============================================================================================
# 2. the gag: red lips with a padlock through them, on a post (gagMouth, line 2)
# =============================================================================================
def lip_pillow(b, mat, top, bot, n=22, dep=0.55, zc=0.0):
    """A puffy lip between two outline functions top(x) >= bot(x), x in -3..3, front toward -Y."""
    rings = []
    for i in range(n + 1):
        x = -3 + 6 * i / n
        yt, yb = top(x), bot(x)
        hc, hh = (yt + yb) / 2, max(0.02, (yt - yb) / 2)
        dd = dep * (0.25 + 0.75 * math.sqrt(max(0.0, 1 - (x / 3) ** 2))) * min(1.0, hh / 0.5 + 0.2)
        ring = []
        for k in range(10):
            th = k / 10 * math.tau
            ring.append(Vector((x, zc - math.sin(th) * dd, hc + math.cos(th) * hh)))
        rings.append(ring)
    b.strip(mat, [r + [r[0]] for r in rings])
    for r, flip in ((rings[0], True), (rings[-1], False)):
        b.poly(mat, r[::-1] if flip else r)


def build_gag():
    X, Z = CUE["gagX"], CUE["gagZ"]
    s = L2S
    em = K.empty("Inst_Gag", K.COL_INST)
    em.location = B(X, 0, Z)
    g = [ease_out_back(clamp((tf(f) - s + 0.2) / 0.9)) if tf(f) >= s - 0.2 else 0.0 for f in K.FRAMES]
    K.key_scale(em, [max(1e-4, v) for v in g])
    b = K.Builder()
    Y0 = 5.0
    b.rod(M["i_post"], (0, 0.3, 0), (0, 0.3, Y0 - 1.0), 0.15, seg=10)
    b.box(M["i_post"], (0, 0.3, 0.06), (0.9, 0.9, 0.12))
    up = lambda x: Y0 + (bez3((-3, 0), (-1.5, 1.6), (-0.3, 0.9), (0, 0.6), _inv(x, -3, 0))[1] if x <= 0 else
                         bez3((0, 0.6), (0.3, 0.9), (1.5, 1.6), (3, 0), _inv(x, 0, 3, rev=False))[1])
    line = lambda x: Y0 - 0.35 * (1 - (x / 3) ** 2) * 0.5
    low = lambda x: Y0 - 1.27 * (1 - (x / 3) ** 2) ** 0.8
    lip_pillow(b, M["i_lips"], up, lambda x: line(x) + 0.03, dep=0.6)
    lip_pillow(b, M["i_lips"], lambda x: line(x) - 0.03, low, dep=0.7)
    vs, fs = tube_geo([Vector((-3 + 6 * i / 16, -0.05, line(-3 + 6 * i / 16))) for i in range(17)], 0.07, seg=6, ref=(0, 1, 0))
    add_geo(b, M["i_lipline"], vs, fs)
    # the padlock through the lips: shackle arc through the mouth, the body hanging in front of the lower lip
    arc = [Vector((math.cos(a) * 0.45, -0.75, Y0 - 0.1 + math.sin(a) * 0.45)) for a in [i / 10 * math.pi for i in range(11)]]
    vs, fs = tube_geo([arc[0] + Vector((0, 0, -0.35))] + arc + [arc[-1] + Vector((0, 0, -0.35))], 0.09, seg=8, ref=(0, 1, 0))
    add_geo(b, M["i_steel"], vs, fs)
    b.box(M["i_lock"], (0, -0.8, Y0 - 0.55), (1.2, 0.36, 0.9))
    b.ellipsoid(M["i_dark"], (0, -0.99, Y0 - 0.45), (0.2, 0.03, 0.2), seg=10)
    b.box(M["i_dark"], (0, -0.99, Y0 - 0.7), (0.16, 0.02, 0.4))
    ob = b.build("Inst_GagLips", K.COL_INST, em)
    key_hidden(ob, [v <= 1e-4 for v in g])
    gs = dict(zip(K.FRAMES, g))
    shadow_stick("Inst_GagShadow", X, Z, lambda f: 6.5 * gs[f], lambda f: 4 * gs[f], lambda f: gs[f] > 1e-4)
    return em


def _inv(x, a, b_, rev=False):
    """u for a cubic whose x runs monotonically from a to b (cheap bisection on the 4 control xs)."""
    return clamp((x - a) / (b_ - a))


# =============================================================================================
# 3. the ear on its crutch easel, the drawer in its canal, the filed tapes, the tape lines
# =============================================================================================
EH = 9.0
EAR_C = Vector((-0.25, 0.56 * EH))          # canal centre, (x, height)


def ear_outline(n=16):
    segs = [((-0.4, 0.3 * EH), (-3.4, 0.45 * EH), (-3.2, 1.08 * EH), (0, EH)),
            ((0, EH), (2.6, 0.95 * EH), (2.4, 0.62 * EH), (1, 0.52 * EH)),
            ((1, 0.52 * EH), (0.2, 0.45 * EH), (1, 0.3 * EH), (-0.4, 0.3 * EH))]
    pts = []
    for sg in segs:
        for i in range(n):
            pts.append(Vector(bez3(*sg, i / n)))
    return pts


OUT = ear_outline()


def canal_r(th):
    a, bb, rot = 0.62, 0.78, -0.2
    c, s = math.cos(th - rot), math.sin(th - rot)
    return 1.0 / math.sqrt((c / a) ** 2 + (s / bb) ** 2)


# relief across the ear, from the canal rim (s 0) to the outer edge (s 1): depth toward -Y is forward
PROF = [(0.0, 0.12), (0.12, 0.08), (0.3, 0.1), (0.48, -0.32), (0.66, -0.12), (0.84, -0.52), (0.94, -0.42), (1.0, -0.12)]


def prof(s):
    for (s0, d0), (s1, d1) in zip(PROF, PROF[1:]):
        if s <= s1:
            return lerp(d0, d1, smooth((s - s0) / (s1 - s0)))
    return PROF[-1][1]


def outline_r(th):
    best, bd = None, 9
    for p in OUT:
        d = p - EAR_C
        a = math.atan2(d.y, d.x)
        e = abs((a - th + math.pi) % math.tau - math.pi)
        if e < bd:
            bd, best = e, d.length
    return best


def ear_depth_at(x, y):
    d = Vector((x, y)) - EAR_C
    th = math.atan2(d.y, d.x)
    cr, orr = canal_r(th), outline_r(th)
    s = clamp((d.length - cr) / max(0.1, orr - cr))
    return prof(s)


def build_ear_shell(b):
    rings_s = [p[0] for p in PROF]
    front = []
    for s in rings_s:
        row = []
        for p in OUT + [OUT[0]]:
            d = p - EAR_C
            th = math.atan2(d.y, d.x)
            cr = canal_r(th)
            r = lerp(cr, d.length, s)
            q = EAR_C + d.normalized() * r
            row.append(Vector((q.x, prof(s), q.y)))
        front.append(row)
    b.strip(M["i_ear"], front)
    # the back: from the edge round to a flat back plate
    back = [[Vector((v.x, 0.3, v.z)) for v in front[-1]],
            [Vector((lerp(v.x, EAR_C.x, 0.3), 0.5, lerp(v.z, EAR_C.y, 0.3))) for v in front[-1]]]
    b.strip(M["i_ear"], [front[-1], back[0], back[1]])
    cen = Vector((EAR_C.x, 0.55, EAR_C.y))
    for i in range(len(back[1]) - 1):
        b.poly(M["i_ear"], [back[1][i + 1], back[1][i], cen])
    # the canal: a dark well
    deep = Vector((EAR_C.x, 0.9, EAR_C.y))
    rim = front[0]
    for i in range(len(rim) - 1):
        b.poly(M["i_canal"], [rim[i], rim[i + 1], deep])
    # the antihelix fold (draft's brown stroke), laid on the relief
    c1 = [(-1.6, 0.5 * EH), (-2.1, 0.9 * EH), (1.6, 1.0 * EH), (1, 0.7 * EH)]
    c2 = [(1, 0.7 * EH), (0.4, 0.6 * EH), (-0.6, 0.7 * EH), (-0.3, 0.55 * EH)]
    pts = []
    for sg in (c1, c2):
        for i in range(12 if sg is c1 else 9):
            x, y = bez3(*sg, i / 12 if sg is c1 else i / 8)
            pts.append(Vector((x, ear_depth_at(x, y) - 0.1, y)))
    vs, fs = tube_geo(pts, 0.16, seg=8, ref=(0, 1, 0))
    add_geo(b, M["i_helix"], vs, fs)


def recorder_geo(b, c, sc, face=-1, spin=None, reels=True):
    """A reel-to-reel recorder in a builder: bottom centre c, scale sc, front toward face*Y."""
    c = Vector(c)
    b.box(M["i_rec"], c + Vector((0, 0, 0.1 * sc)), (0.32 * sc, 0.2 * sc, 0.2 * sc))
    if reels:
        rot = Matrix.Rotation(math.pi / 2, 4, "X")
        for d in (-1, 1):
            rc = c + Vector((d * 0.075 * sc, face * 0.103 * sc, 0.115 * sc))
            b.cone(M["i_reel"], rc, 0.062 * sc, 0.062 * sc, 0.008 * sc, seg=14, rot=rot)
            b.cone(M["i_hub"], rc + Vector((0, face * 0.006 * sc, 0)), 0.025 * sc, 0.025 * sc, 0.006 * sc, seg=8, rot=rot)
        b.box(M["i_hub"], c + Vector((0, face * 0.103 * sc, 0.053 * sc)), (0.15 * sc, 0.006 * sc, 0.008 * sc))


def build_ear():
    s = EVERY
    X, Z = CUE["earX"], CUE["earZ"]
    em = K.empty("Inst_Ear", K.COL_INST)
    em.location = B(X, 0, Z)
    g = [ease_out_back(clamp((tf(f) - s + 0.3) / 1.1)) if tf(f) >= s - 0.3 else 0.0 for f in K.FRAMES]
    K.key_scale(em, [max(1e-4, v) for v in g])
    hidden = [v <= 1e-4 for v in g]
    b = K.Builder()
    build_ear_shell(b)
    # the crutch easel: two crutches from behind the ear's plane, a third leg propping it from behind
    for d in (-1, 1):
        crutch(b, (d * 2.6, 0.45, 0), (d * 1.4, 0.45, 0.55 * EH), 0.25)
    b.rod(M["i_crutch"], (0, 3.2, 0), (0, 0.55, 0.6 * EH), 0.1, seg=8)
    # a shelf under the lobe for the filed tapes
    b.box(M["i_crutch"], (-0.1, -0.55, 2.62), (2.9, 0.6, 0.1))
    for d in (-1, 1):
        b.rod(M["i_crutch"], (d * 1.35, -0.75, 2.6), (d * 1.6, 0.45, 2.0), 0.05, seg=6)
    shell = b.build("Inst_Ear", K.COL_INST, em)
    key_hidden(shell, hidden)
    gs = dict(zip(K.FRAMES, g))
    shadow_stick("Inst_EarShadow", X, Z, lambda f: 9 * gs[f], lambda f: 3 * gs[f], lambda f: gs[f] > 1e-4)
    # the drawer in the canal: slides out toward us on "every", shuts on "want"
    d = K.Builder()
    d.box(M["i_drawer"], (0, 0, 0), (1.0, 0.1, 0.62))
    d.ellipsoid(M["i_gold"], (0, -0.06, 0), (0.08, 0.03, 0.08), seg=8)
    d.box(M["i_drawin"], (0, 0.27, -0.26), (0.92, 0.45, 0.05))
    for sx in (-1, 1):
        d.box(M["i_drawin"], (sx * 0.47, 0.27, 0), (0.05, 0.45, 0.5))
    drw = d.build("Inst_EarDrawer", K.COL_INST, em, smooth=False)
    opens = [hold(tf(f), s - 0.1, s + 0.5, WANT - 0.1, WANT + 0.35) for f in K.FRAMES]
    K.key_loc(drw, [(EAR_C.x + 0.3 * o, 0.2 - 1.3 * o, EAR_C.y + 0.1 * o) for o in opens])
    key_hidden(drw, hidden)
    # the filed tapes: one more on the shelf every 2.5/6 s after "every"
    for i in range(6):
        tb = K.Builder()
        recorder_geo(tb, (0, 0, 0), 2.1)
        rob = tb.build("Inst_EarTape_%d" % i, K.COL_INST, em, smooth=False)
        rob.location = (-0.95 + (i % 3) * 0.8, -0.6, 2.67 + (i // 3) * 0.45)
        n = [math.floor(clamp((tf(f) - s) / 2.5) * 6) for f in K.FRAMES]
        key_hidden(rob, [h or nn <= i for h, nn in zip(hidden, n)])
    return em, opens, g


def build_tape_lines(opens, grow):
    """earTapes: four brown tape lines from the board's table into the ear's drawer; snapped in when it shuts."""
    s = EVERY
    shut = WANT + 0.2
    X, Z = CUE["earX"], CUE["earZ"]
    frames = [f for f in K.FRAMES if s - 1 / 24 <= tf(f) <= shut + 0.4]
    N = 26

    def parts(f):
        t = tf(f)
        reach, suck = ease(t, s, s + 0.6), ease(t, shut - 0.1, shut + 0.35)
        o, gr = opens[f - 1], grow[f - 1]
        dst = Vector((X, Z, 0)) + gr * Vector((EAR_C.x + 0.3 * o, 0.15 - 1.3 * o, EAR_C.y + 0.1 * o))
        out = []
        for i in range(4):
            src = lw_world(f, (-2.6 + i * 1.1, TOP + 0.12, 1.0 + (i % 2) * 0.3))
            ch = dst - src
            side = ch.cross(Vector((0, 0, 1)))
            side = side.normalized() if side.length > 1e-6 else Vector((1, 0, 0))
            lift = 0.9 + 0.35 * i           # draft: 90 + 30 i px of arch at its zoom, about a metre
            pts = []
            for j in range(N + 1):
                u = lerp(suck, reach, j / N)
                p = src.lerp(dst, u)
                p.z += math.sin(u * math.pi) * lift + math.sin(u * 14 - t * 9 + i) * 0.12 * (1 - u)
                pts.append(p)
            vs, fs = tube_geo(pts, 0.03, seg=6, ref=side)
            out.append((M["i_tape"], vs, fs))
        return out

    ob = baked("Inst_TapeLines", K.COL_INST, None, parts, frames)
    win = set(frames)
    key_hidden(ob, [not (f in win and ease(tf(f), s, s + 0.6) > 0.002 and ease(tf(f), shut - 0.1, shut + 0.35) < 0.998) for f in K.FRAMES])
    return ob


# =============================================================================================
# 4. the recorders on the table, hopping into the drawer torso's open drawer (tapeRecorders)
# =============================================================================================
TAPE_AT = [(-2.05, 1.0), (-1.35, 0.75), (-0.2, 0.8), (0.35, 1.05)]


def tape_hop(t, i):
    return clamp((t - (EVERY - 0.1 + i * 0.32)) / 0.75)


def build_recorders():
    car = K.CAR
    obs = []
    for i in range(4):
        b = K.Builder()
        recorder_geo(b, (0, 0, 0), 1.0, reels=False)
        b.box(M["i_rec"], (0, 0, 0.187), (0.322, 0.202, 0.03))
        b.ellipsoid(M["i_ledoff"], (0.13, -0.101, 0.03), (0.014,) * 3, seg=8)
        ob = b.build("Inst_Recorder_%d" % i, K.COL_INST, car, smooth=False)
        ob.rotation_mode = "XYZ"
        mats_, hid, spins, blink = [], [], [], []
        ang = 0.0
        for f in K.FRAMES:
            t = tf(f)
            vis = L2S - 0.3 <= t <= L2E + 0.3
            hid.append(not vis)
            appear = ease(t, L2S - 0.3, L2S + 0.3)
            u = tape_hop(t, i)
            st = S[f - 1]["seats"][2]
            dr, bo = (st["dr"] or 0.0), st["bo"]
            tray = Vector((-0.8, 2.3 - 0.142 - 0.16 * dr + 0.06, 0.975 + 0.09 * bo + 0.03))
            rec = u == 0 and t > L2S + 0.2
            if u < 1:
                e = smooth(u)
                x, z = TAPE_AT[i]
                p0 = Vector((x, z, TOP))
                p = p0.lerp(tray, e) + Vector((0, 0, math.sin(u * math.pi) * 0.3))
                roll = math.sin(u * math.pi) * (0.35 if i % 2 else -0.35)
                sc = lerp(1.0, 0.4, e) * (1 + 0.04 * math.sin(t * 12 + i) if u == 0 else 1.0) * max(1e-3, appear)
            else:
                landed = [j for j in range(4) if tape_hop(t, j) >= 1]
                n, j = len(landed), landed.index(i)
                p = tray + Vector(((j - (n - 1) / 2) * 0.085, 0.02 * (j % 2), -0.02 * (j % 2)))
                roll, sc = 0.0, 0.4
            m = Matrix.Translation(p) @ Matrix.Rotation(roll, 4, "Y") @ Matrix.Diagonal((sc, sc, sc, 1))
            mats_.append(m if car else car_world(f) @ m)
            if rec:
                ang = t * 5 + i
            spins.append(ang)
            blink.append(not (rec and vis and math.sin(t * 9 + i) > 0))
        K.key_matrix(ob, mats_)
        key_hidden(ob, hid)
        for d in (-1, 1):
            rb = K.Builder()
            rot = Matrix.Rotation(math.pi / 2, 4, "X")
            rb.cone(M["i_reel"], (0, 0, 0), 0.062, 0.062, 0.008, seg=16, rot=rot)
            rb.cone(M["i_hub"], (0, -0.006, 0), 0.025, 0.025, 0.006, seg=8, rot=rot)
            for k in range(3):
                a = k / 3 * math.tau
                rb.box(M["i_rec"], (math.cos(a) * 0.026, -0.006, math.sin(a) * 0.026), (0.05, 0.004, 0.011),
                       rot=Matrix.Rotation(-a, 4, "Y"))
            reel = rb.build("Inst_RecReel_%d_%d" % (i, d + 1), K.COL_INST, ob, smooth=False, loc=(d * 0.075, -0.103, 0.115))
            K.key_series(reel, "rotation_euler", [-a for a in spins], index=1)
            key_hidden(reel, hid)
        lb = K.Builder()
        lb.ellipsoid(M["i_ledon"], (0, 0, 0), (0.016,) * 3, seg=8)
        led = lb.build("Inst_RecLed_%d" % i, K.COL_PLAYA, ob, loc=(0.13, -0.104, 0.03))
        key_hidden(led, [h or bl for h, bl in zip(hid, blink)])
        lt = K.Builder()
        lt.box(M["i_hub"], (0, 0, 0), (0.15, 0.006, 0.008))
        lt.build("Inst_RecTape_%d" % i, K.COL_INST, ob, smooth=False, loc=(0, -0.103, 0.053))
        obs.append(ob)
    return obs


# =============================================================================================
# 5. the open-playa art pieces (bmCamp drip / eye / chairs / arch) and the bmInstall ballot box and bulb
# =============================================================================================
def build_candle(b, r, seed):
    h, w = r * 1.6, r * 0.22
    b.cone(M["i_candle"], (0, 0, h / 2), w, w * 0.9, h, seg=20)
    for i in range(5):
        a = math.radians(-60 + i * 30) - math.pi / 2          # across the front (-Y)
        L = (0.15 + 0.3 * rnd(seed, i)) * h
        rr = w * 0.12
        pts = [Vector((math.cos(a) * w * 0.93, math.sin(a) * w * 0.93, h + 0.05)),
               Vector((math.cos(a) * w * 0.97, math.sin(a) * w * 0.97, h - L * 0.5)),
               Vector((math.cos(a) * w * 0.98, math.sin(a) * w * 0.98, h - L))]
        vs, fs = tube_geo(pts, [rr, rr * 0.9, rr * 0.7], seg=8, ref=(0, 0, 1) if False else (1, 0, 0))
        add_geo(b, M["i_wax"], vs, fs)
        b.ellipsoid(M["i_wax"], pts[-1] + Vector((0, 0, -rr * 0.6)), (rr * 1.15, rr * 1.15, rr * 1.6), seg=8)
    b.ellipsoid(M["i_wax"], (0, 0, h + 0.1 * w), (w * 1.0, w * 1.0, w * 0.3), seg=18)
    b.rod(M["i_dark"], (0, 0, h + 0.2 * w), (0, 0, h + 0.7 * w), 0.04 * w + 0.02, seg=6)
    b.ellipsoid(M["i_flame"], (0, 0, h + 1.0 * w), (w * 0.16, w * 0.16, w * 0.32), seg=10)
    crutch(b, (w * 3.2, 0.3, 0), (w * 1.0, 0.3, h * 0.55), 0.1 * r / 4)


def build_eye(r, X, Z, name):
    ey, er = r * 1.25, r * 0.42
    em = K.empty(name, K.COL_INST)
    em.location = B(X, 0, Z)
    b = K.Builder()
    hub = Vector((0, 0, ey - er * 0.6))
    for a in (math.radians(200), math.radians(-20), math.radians(90)):
        foot = Vector((math.cos(a) * er * 1.1, math.sin(a) * er * 0.9, 0))
        b.rod(M["i_tripod"], foot, hub, 0.07, seg=8)
    b.rod(M["i_tripod"], (0, 0, 0), (0, 0, ey - er), 0.06, seg=8)
    b.build(name + "Stand", K.COL_INST, em)
    eb = K.Builder()                          # the eyeball, looking down -Y; turned toward the car per frame
    eb.ellipsoid(M["i_eyew"], (0, 0, 0), (er, er, er), seg=24)
    m = Matrix.Rotation(math.pi / 2, 4, "X")
    eb.cone(M["i_iris"], (0, -er * 0.93, 0), er * 0.42, er * 0.36, er * 0.12, seg=20, rot=m)
    eb.cone(M["i_pupil"], (0, -er * 0.995, 0), er * 0.2, er * 0.18, er * 0.04, seg=16, rot=m)
    eb.ellipsoid(M["i_glint"], (-er * 0.12, -er * 1.0, er * 0.1), (er * 0.07, er * 0.02, er * 0.07), seg=8)
    ball = eb.build(name + "Ball", K.COL_INST, em, loc=(0, 0, ey))
    # the draft's eye is a billboard that always faces us, its iris sliding toward the car: face the camera, then look
    look, prev = [], None
    for f in K.FRAMES:
        c = S[f - 1]["cam"]
        d = B(c[0], c[1], c[2]) - B(X, ey, Z)
        a = math.atan2(d.x, -d.y) + math.asin(clamp((I[f - 1]["cx"] - X) / 40, -1, 1) * 0.45)
        if prev is not None:
            a = prev + (a - prev + math.pi) % math.tau - math.pi
        prev = a
        look.append(a)
    K.key_series(ball, "rotation_euler", look, index=2)
    lb = K.Builder()                          # the lid line over it
    pts = [Vector((math.cos(a) * er * 1.04, -er * 0.25, -math.sin(a) * er * 1.04)) for a in [math.pi * (1.1 + 0.8 * i / 10) for i in range(11)]]
    vs, fs = tube_geo(pts, er * 0.04, seg=6, ref=(0, 1, 0))
    add_geo(lb, M["i_brow"], vs, fs)
    lb.build(name + "Lid", K.COL_INST, em, loc=(0, 0, ey))
    return em


def build_chairs(b, r, seed, t=28.0):
    """A crooked tower of boardroom chairs (bmCamp chairs): 8 chairs, each leaning on the last."""
    base = Matrix.Identity(4)
    cx, cy = 0.0, 0.0
    for i in range(8):
        lean = math.sin(i * 1.9 + seed) * 0.25 + math.sin(t * 0.5 + seed) * 0.02 * i
        s2 = 0.9 - i * 0.04
        wood = M["i_woodA"] if i % 2 else M["i_woodB"]
        m = Matrix.Translation((cx, 0, cy)) @ Matrix.Rotation(lean, 4, "Y")
        P = lambda x, y, z: (m @ Vector((x * s2, y * s2, z * s2)))
        for lx in (-0.45, 0.45):
            for ly in (-0.35, 0.35):
                b.rod(wood, P(lx, ly, 0), P(lx, ly, 0.55), 0.035 * s2, seg=6, caps=False)
        b.box(M["i_seat"], P(0, 0, 0.6), (1.1 * s2, 0.8 * s2, 0.1 * s2), rot=m.to_3x3().to_4x4())
        for ly in (-0.35, 0.35):
            b.rod(wood, P(-0.45, ly, 0.65), P(-0.45, ly, 1.4), 0.04 * s2, seg=6, caps=False)
        b.box(wood, P(-0.45, 0, 1.32), (0.12 * s2, 0.8 * s2, 0.16 * s2), rot=m.to_3x3().to_4x4())
        cx += math.sin(lean) * 0.9
        cy += 1.0 * s2
    crutch(b, (1.6, 0, 0), (cx + 0.3, 0, cy * 0.6), 0.08)


def build_arch(b, r, col):
    for d in (-1, 1):
        b.box(M["i_woodB"], (d * r, 0, r * 0.45), (0.4, 0.4, r * 0.9))
    pts = [Vector((math.cos(a) * r, 0, r * 0.9 + math.sin(a) * r * 0.55)) for a in [i / 16 * math.pi for i in range(17)]]
    vs, fs = tube_geo(pts, 0.175, seg=8, ref=(0, 1, 0))
    add_geo(b, M["i_woodB"], vs, fs)
    for i in range(7):
        a = (i + 0.5) / 7 * math.pi
        lx, ly = math.cos(a) * r * 0.85, r * 0.9 + math.sin(a) * r * 0.47 - 0.4
        b.rod(M["i_dark"], (lx, 0, ly + 0.4), (lx, 0, ly + 0.1), 0.015, seg=4, caps=False)
        b.ellipsoid(colmat(col) if i % 2 else M["i_lantY"], (lx, 0, ly), (0.2, 0.2, 0.28), seg=10)


def colmat(hexc):
    k = "i_c" + hexc
    if k not in M:
        M[k] = K.toon("Inst" + hexc.lstrip("#"), hexc, shadow=K.shade(hexc, 0.45))
    return M[k]


def build_ballot_install(X, Z, t=20.0):
    sag = 0.5 + 0.2 * math.sin(t * 0.6)
    b = K.Builder()
    crutch(b, (-2.4, 0.2, 0), (-1.2, 0.2, 2.6), 0.08)
    crutch(b, (2.2, 0.2, 0), (1.3, 0.2, 2.2), 0.08)
    # the soft box: a full upper block that slumps at its right corner, with its lower half sagging like cloth
    rows = []
    for k in range(7):
        z = lerp(1.2, 3.55, k / 6)
        row = []
        for j in range(13):
            a = j / 12 * math.tau
            x, y = math.cos(a) * 1.65, math.sin(a) * 1.25
            x = max(-1.6, min(1.6, x * 1.25)) if abs(math.cos(a)) > 0.3 else x
            y = max(-1.2, min(1.2, y * 1.25)) if abs(math.sin(a)) > 0.3 else y
            zz = z - (sag * 0.3 * clamp(x / 1.6) * (k / 6))
            row.append(Vector((x, y, zz)))
        rows.append(row)
    b.strip(M["i_ballot"], rows)
    b.poly(M["i_ballot"], rows[-1][:-1])
    skirt = []
    for k in range(5):
        u = k / 4
        row = []
        for j in range(13):
            a = j / 12 * math.tau
            x, y = rows[0][j].x * (1 - 0.05 * u), rows[0][j].y * (1 - 0.05 * u)
            drop = u * (0.75 + sag * 0.6 * (0.5 + 0.5 * math.sin(x * 1.9 + 1.0)))
            row.append(Vector((x, y, 1.22 - drop)))
        skirt.append(row)
    b.strip(M["i_ballot"], skirt)
    b.box(M["i_slot"], (0, 0, 3.58), (1.6, 0.3, 0.06))
    b.box(M["i_paperA"], (0, 0, 3.95), (0.7, 0.05, 0.8))
    vs, fs = tube_geo([Vector((-0.25, -0.04, 3.85)), Vector((0.2, -0.04, 4.1))], 0.03, seg=5, ref=(0, 1, 0))
    add_geo(b, M["i_red"], vs, fs)
    return b.build("Inst_BallotBox", K.COL_INST, None, loc=B(X, 0, Z))


def build_bulb(X, Z):
    b = K.Builder()
    crutch(b, (-2.2, 0.2, 0), (-1.0, 0.2, 3.0), 0.09)
    crutch(b, (2.1, 0.2, 0), (1.0, 0.2, 3.1), 0.09)
    b.cone(M["i_bulbbase"], (0, 0, 2.15), 0.6, 0.7, 1.1, seg=16)
    for i in range(4):
        b.cone(M["i_band2"], (0, 0, 1.75 + i * 0.25), 0.69, 0.69, 0.05, seg=16)
    pts = [Vector(p) for p in ((-0.3, -0.05, 2.8), (-0.25, -0.05, 3.8), (-0.1, -0.05, 4.2), (0.1, -0.05, 3.9), (0.25, -0.05, 4.2), (0.3, -0.05, 3.8), (0.3, -0.05, 2.8))]
    vs, fs = tube_geo(pts, 0.04, seg=5, ref=(0, 1, 0))
    add_geo(b, M["i_filament"], vs, fs)
    solid = b.build("Inst_Bulb", K.COL_INST, None, loc=B(X, 0, Z))
    g = K.Builder()
    g.ellipsoid(M["i_glass"], (0, 0, 4.1), (1.5, 1.5, 1.5), seg=20)
    g.cone(M["i_glass"], (0, 0, 2.95), 0.7, 1.05, 0.6, seg=20)
    glass = g.build("Inst_BulbGlass", K.COL_PLAYA, None, loc=B(X, 0, Z))
    glass.visible_shadow = False
    return solid


def build_playa_art():
    seen = set()
    for f in K.FRAMES:
        seen.update(I[f - 1]["campsIn"])
    out = []
    for c in I[0]["camps"]:
        if c["i"] not in seen:
            continue
        name = "Inst_Art_%d_%s" % (c["i"], c["kind"])
        loc = B(c["X"], 0, c["Z"])
        if c["kind"] == "eye":
            out.append(build_eye(c["r"], c["X"], c["Z"], name))
            continue
        b = K.Builder()
        if c["kind"] == "drip":
            build_candle(b, c["r"], c["seed"])
        elif c["kind"] == "chairs":
            build_chairs(b, c["r"], c["seed"])
        elif c["kind"] == "arch":
            build_arch(b, c["r"], c["col"])
        out.append(b.build(name, K.COL_INST, None, loc=loc))
    vis = lambda k: any(I[f - 1]["vis"][k] for f in K.FRAMES)
    if vis("ballot"):
        out.append(build_ballot_install(CUE["ballotX"], 17))
    if vis("bulb"):
        out.append(build_bulb(CUE["bulbX"], 21))
    return out


def build_clock_car():
    """The soft clock car's first visit (installs.js clockCar, CLOCK_VISITS[0]): it ends at 17 s, inside our first 8 frames."""
    frames = [f for f in K.FRAMES if tf(f) <= 17.0]
    if not frames:
        return None
    Z = 34
    em = K.empty("Inst_ClockCar", K.COL_INST)
    K.key_loc(em, [B(I[f - 1]["cx"] + lerp(46, 4, min(tf(f), 17.0) / 17), 0, Z) for f in K.FRAMES])
    t = tf(frames[0])
    m, R, cy = lerp(0.15, 1.25, clamp(t / 130)), 2.6, 4.2
    M.setdefault("i_clockface", K.toon("ClockFace", "#e8d9a8", shadow="#b8a674", light="#f6ead0"))
    M.setdefault("i_clockrim", K.toon("ClockRim", "#b08a3a", shadow="#7a5e22"))
    M.setdefault("i_cart", K.toon("ClockCart", "#4a3a2c", shadow="#2e241a"))
    b = K.Builder()
    b.box(M["i_cart"], (0, 0, 1.0), (6.0, 1.6, 1.2))
    rot = Matrix.Rotation(math.pi / 2, 4, "X")
    for wx in (-2, 2):
        for wy in (-0.85, 0.85):
            b.cone(M["i_dark"], (wx, wy, 0.4), 0.4, 0.4, 0.16, seg=14, rot=rot)
    crutch(b, (2.6, 0.2, 1.6), (3.4, 0.2, 4.4 + m), 0.14)
    def face(a, inset=0.0):
        sag = max(0.0, math.sin(a)) * m * 2.2 * (0.5 + 0.5 * math.cos(a * 2))
        return (math.cos(a) * (R - inset), cy - (math.sin(a) * (R - inset) + sag))
    ring = [face(i / 40 * math.tau) for i in range(40)]
    front = [Vector((x, -0.25, z)) for x, z in ring]
    back = [Vector((x, 0.25, z)) for x, z in ring]
    b.poly(M["i_clockface"], front[::-1])
    b.poly(M["i_clockface"], back)
    b.strip(M["i_clockrim"], [front + [front[0]], back + [back[0]]])
    for i in range(12):
        a = i / 12 * math.tau
        x, z = math.cos(a) * R * 0.8, cy - (math.sin(a) * R * 0.8 + max(0.0, math.sin(a)) * m * 1.2)
        b.box(M["i_dark"], (x, -0.27, z), (0.16, 0.02, 0.16))
    hands = t * 0.2
    for ln, sp, w in ((1.5, 1, 0.2), (2.1, 12, 0.12)):
        a = hands * sp - math.pi / 2
        b.rod(M["i_dark"], (0, -0.3, cy), (math.cos(a) * ln, -0.3, cy - math.sin(a) * ln), w / 2, seg=6)
    ob = b.build("Inst_ClockCar", K.COL_INST, em, smooth=False)
    last = frames[-1]
    key_hidden(ob, [f > last for f in K.FRAMES])
    return ob


# =============================================================================================
# 6. the canvas roller blind on "blues" (canvasBlind): baked in camera space from the draft's own edge
# =============================================================================================
BD = 4000.0                    # metres out: behind every object and the city band, in front of the world sky (the draft draws it as part of the sky)
XS = [i * 20 for i in range(97)]


def build_blind():
    frames = [f for f in K.FRAMES if "blind" in I[f - 1]]
    rig = K.empty("Inst_BlindRig", K.COL_WORLD)
    cams = [s["cam"] for s in S]
    K.key_loc(rig, [B(c[0], c[1], c[2]) for c in cams])
    K.key_rot(rig, [(math.pi / 2 - c[3], 0.0, -c[5]) for c in cams])
    if not frames:
        return None
    ROWS = [0.0, 0.18, 0.36, 0.54, 0.7, 0.84, 0.94]      # fractions of the way down to the hem, then the hem band

    def scr(f, x, y):
        fp = S[f - 1]["cam"][4]
        return Vector(((x - 960) / fp * BD, (540 - y) / fp * BD, -BD))

    def xs_ext():
        return [-60] + XS + [1980]

    def parts(f):
        bl = I[f - 1]["blind"]
        edge = [bl["edge"][0]] + bl["edge"] + [bl["edge"][-1]]
        X = xs_ext()
        rows = []
        for v in ROWS:
            rows.append([scr(f, x, lerp(14, e, v)) for x, e in zip(X, edge)])
        rows.append([scr(f, x, e - 6) for x, e in zip(X, edge)])
        rows.append([scr(f, x, e) for x, e in zip(X, edge)])
        vs = [v for r in rows for v in r]
        nx = len(X)
        fs = [(i * nx + j, i * nx + j + 1, (i + 1) * nx + j + 1, (i + 1) * nx + j) for i in range(len(rows) - 1) for j in range(nx - 1)]
        out = [(M["i_canvas"], vs, fs)]
        for x, y, r, on in bl["tips"]:
            rr = r if on else 0.0
            ring = [scr(f, x + math.cos(k / 10 * math.tau) * rr, y + math.sin(k / 10 * math.tau) * rr) for k in range(10)]
            out.append((M["i_canvas"], [scr(f, x, y)] + ring, [(0, 1 + (k + 1) % 10, 1 + k) for k in range(10)]))
        # the roller across the top of the frame, 28 draft px deep
        fp = S[f - 1]["cam"][4]
        rad = 14 / fp * BD
        a, bb = scr(f, -80, 14), scr(f, 2000, 14)
        vs, fsr = tube_geo([a + Vector((0, 0, -0.002)), bb + Vector((0, 0, -0.002))], rad, seg=12, ref=(0, 1, 0))
        out.append((M["i_roller"], vs, fsr))
        # the pull cord, stretching as it melts, and its ring
        c = bl["cord"]
        pts = [scr(f, *bez2((c[0], c[1]), (c[2], c[3]), (c[4], c[5]), u / 8)) for u in range(9)]
        cw = 1.6 / fp * BD
        vs, fsc = tube_geo([p + Vector((0, 0, 0.004)) for p in pts], cw, seg=5, ref=(0, 0, 1))
        out.append((M["i_cord"], vs, fsc))
        ring = [scr(f, c[4] + math.sin(k / 16 * math.tau) * 13, c[6] - math.cos(k / 16 * math.tau) * c[7]) + Vector((0, 0, 0.004)) for k in range(17)]
        vs, fsc = tube_geo(ring, cw, seg=5, ref=(0, 0, 1), caps=False)
        out.append((M["i_cord"], vs, fsc))
        return out

    M.setdefault("i_roller", K.toon("BlindRoller", "#a8875a", shadow="#4b3b25", light="#c9a878", haze=False))
    M.setdefault("i_cord", K.flat("BlindCord", "#5a4a32", haze=False))
    ob = baked("Inst_Blind", K.COL_PLAYA, rig, parts, frames, smooth_shade=False)
    ob.visible_shadow = False
    # colour: the draft's vertical gradient (rgba 196,178,140,.94 -> 214,196,156,.9 -> 232,214,170,.82), light through
    # the weave every 150 px, the wet hem band darker; drip tips the hem colour; roller and cord untouched
    me = ob.data
    ca = me.color_attributes.new("col", "FLOAT_COLOR", "POINT")
    nx = len(xs_ext())
    nrow = len(ROWS) + 2
    cols = []
    X = xs_ext()
    for i in range(nrow):
        v = ROWS[i] if i < len(ROWS) else 1.0
        if v < 0.7:
            rgb, al = [lerp(a, b, v / 0.7) for a, b in zip((196, 178, 140), (214, 196, 156))], lerp(0.94, 0.9, v / 0.7)
        else:
            rgb, al = [lerp(a, b, (v - 0.7) / 0.3) for a, b in zip((214, 196, 156), (232, 214, 170))], lerp(0.9, 0.84, (v - 0.7) / 0.3)
        for x in X:
            c = list(rgb)
            if (x - 30) % 150 < 50 and i < nrow - 1:
                c = [lerp(cc, 255, 0.13) for cc in c]
            if i == nrow - 1:
                c, al2 = [lerp(cc, 120, 0.55) for cc in c], 0.92
            else:
                al2 = al
            cols.append(K.lin_rgb(c)[:3] + (al2,))
    tipc = K.lin_rgb((214, 196, 156))[:3] + (0.9,)
    rest = len(me.vertices) - len(cols)
    ntip = 13 * 11
    cols += [tipc] * ntip + [(1, 1, 1, 1)] * (rest - ntip)
    ca.data.foreach_set("color", [c for v in cols for c in v])
    key_hidden(ob, ["blind" not in I[f - 1] for f in K.FRAMES])
    return ob


# =============================================================================================
# the draft's stick shadows (world.js shadowStick): a flat plum band with round ends, from the foot
# along the sun by height x sunVec, a stylised shadow far wider than the real one Blender casts.
# =============================================================================================
_CORE = K.state("core")


def _sun_vec(f):
    c = _CORE[f - 1]
    ln = min(6.3, 1 / math.tan(math.radians(max(c["sunEl"], 1))))
    return ln * c["sunDir"][0], ln * c["sunDir"][1]


def _shadow_a(f):
    c = _CORE[f - 1]
    return (0.42 + 0.06 * c["gold"]) * clamp((c["sunEl"] + 0.6) / 4)


_STICK_MAT = None


def stick_mat():
    global _STICK_MAT
    if _STICK_MAT is None:
        mat = bpy.data.materials.new("RP_StickShadow")
        mat.use_nodes = True
        mat.surface_render_method = "BLENDED"
        n, l = mat.node_tree.nodes, mat.node_tree.links
        n.clear()
        oi, em, tr, mx, out = (n.new(t) for t in ("ShaderNodeObjectInfo", "ShaderNodeEmission", "ShaderNodeBsdfTransparent",
                                                   "ShaderNodeMixShader", "ShaderNodeOutputMaterial"))
        em.inputs[0].default_value = K.lin(K.PLUM)
        l.new(oi.outputs["Alpha"], mx.inputs[0])
        l.new(tr.outputs[0], mx.inputs[1])
        l.new(em.outputs[0], mx.inputs[2])
        l.new(mx.outputs[0], out.inputs[0])
        _STICK_MAT = mat
    return _STICK_MAT


def shadow_stick(name, X, Z, height_at, width_at, alive_at, cap=12):
    """height_at/width_at/alive_at(f): the stick's height and width in metres, and whether it shows.
    The draft strokes the shadow w metres wide ON SCREEN, so the band faces the lens; any part that would
    sit under the playa slides along its view ray to just above it (same place on screen)."""
    def verts(f):
        sx, sz = _sun_vec(f)
        h, w = height_at(f), max(width_at(f), 1e-4) / 2
        c = _CORE[f - 1]["cam"]
        eye = B(c[0], c[1], c[2])
        p, q = B(X, 0, Z), B(X + sx * h, 0, Z + sz * h)
        d = (q - p) if h > 1e-6 else Vector((1, 0, 0))
        n = (p - eye).cross(d).normalized()     # across the stroke, square to the view ray
        m = d.normalized()
        out = []
        for ctr, sgn in ((q, 1), (p, -1)):
            for i in range(cap + 1):
                u = math.pi * i / cap
                v = ctr + (n * math.cos(u) + m * math.sin(u)) * (w * sgn)    # q end: +n round past q to -n; p end back
                if v.z < 0.03 and eye.z > 0.03:
                    v = eye + (v - eye) * ((eye.z - 0.03) / (eye.z - v.z))
                out.append(v)
        return out
    b = K.Builder()
    vs = verts(K.FRAMES[0])
    add_geo(b, stick_mat(), vs, [list(range(len(vs)))])
    ob = b.build(name, K.COL_INST, None, smooth=False)
    K.bake_shapes(ob, verts)
    ob.visible_shadow = False
    K.key_series(ob, "color", [_shadow_a(f) for f in K.FRAMES], index=3)
    key_hidden(ob, [not alive_at(f) for f in K.FRAMES])
    return ob


# =============================================================================================
def build():
    mats()
    els = build_elephants()
    build_gag()
    em, opens, grow = build_ear()
    build_tape_lines(opens, grow)
    build_recorders()
    build_playa_art()
    build_clock_car()
    build_blind()
    print("[installs] %d elephants, %d objects" % (len(els), len([o for o in bpy.data.objects if o.name.startswith("RP_Inst_")])))
