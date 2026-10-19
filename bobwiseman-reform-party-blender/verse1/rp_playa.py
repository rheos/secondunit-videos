"""The playa world of verse 1 (world.js skyAndGround/sunDisc/cracks, playa.js, car.js carInto): the sky, the sun and its
glow, the far mountains, the playa with its dried-mud cracks and cast shadows, Black Rock City's skyline band, the art on
the open playa (brcArtDraw), the 9:00/12:00/3:00/6:00 promenade lampposts,
the bike traffic with its costumed riders, and the car's dust trail and wheel tracks.

The sky, the ground's colour and the cracks are drawn the way the draft draws them: in screen space, through the
shader's Window coordinates and per-frame values keyed into one node group (RP_PlayaFrame): the horizon row, the focal
length, the sun's screen position, the sky colours. Colour maths happens on sRGB numbers, as the canvas does, and is
turned into scene-linear at the end (RP_ToLin). Per-frame lists (bikes, dust) come from tools/probes/playa.js.

Not built here: the lyric installations, elephants, the ballot/bulb installs and the four art camps along the road
(candle, eye, chair towers, lantern arch: rp_installs builds them; --playa-camps builds simpler stand-ins here, for
testing without rp_installs), dust devils, the Temple (behind the camera all verse), city lights (daylight), the
crowd, parade and flock (not on in 16.7-40.45 s), the horizon's thin dust band over the city's foot.
"""
import math
import os

import bpy
import bmesh
from mathutils import Matrix, Vector

import rp_core as K
from rp_core import B, clamp, lerp, rnd

W_, H_ = 1920.0, 1080.0
PLUM = (52, 34, 58)
S = None      # state("core")
PS = None     # state("playa")
G = None      # static lists from the probe's first frame


# =============================================================================================
# small helpers
# =============================================================================================
def proj(c, X, Y, Z):
    """Draft 5's P() for camera state c = [x, y, z, pitch, f, yaw]: [sx, sy, depth] on the 1920x1080 frame."""
    x, y, z, p, f, yw = c
    dx, dy, dz = X - x, Y - y, Z - z
    cy, sy = math.cos(yw), math.sin(yw)
    if sy:
        a = dx * cy - dz * sy
        dz = dx * sy + dz * cy
        dx = a
    sp, cp = math.sin(p), math.cos(p)
    zz = -dy * sp + dz * cp
    yy = dy * cp + dz * sp
    if abs(zz) < 1e-9:
        zz = 1e-9
    return (W_ / 2 + f * dx / zz, H_ / 2 - f * yy / zz, zz)


def srgb(h):
    h = h.lstrip("#")
    return [int(h[i:i + 2], 16) for i in (0, 2, 4)]


def mix3(a, b, u):
    return [lerp(a[i], b[i], u) for i in range(3)]


def darker(h, f):
    c = srgb(h)
    return "#%02x%02x%02x" % tuple(int(v * f) for v in c)


def mat_of(hexc, shade_u=0.42, light=None, haze=True):
    """A cel material per palette hex, shared by every playa object."""
    key = "pl_%s_%s" % (hexc, "h" if haze else "n")
    if key not in K.M:
        K.M[key] = K.toon("Pl_%s%s" % (hexc.lstrip("#"), "" if haze else "_n"), hexc, shadow=K.shade(hexc, shade_u),
                          light=light, haze=haze)
    return K.M[key]


class NT:
    """Tiny node-tree builder: values may be sockets (linked) or numbers (set)."""

    def __init__(self, tree):
        self.t, self.n, self.l = tree, tree.nodes, tree.links

    def _set(self, sock, v):
        if isinstance(v, bpy.types.NodeSocket):
            self.l.new(v, sock)
        elif v is not None:
            sock.default_value = v

    def math(self, op, a, b=None, c=None, clamp_=False):
        m = self.n.new("ShaderNodeMath")
        m.operation = op
        m.use_clamp = clamp_
        self._set(m.inputs[0], a)
        if b is not None:
            self._set(m.inputs[1], b)
        if c is not None:
            self._set(m.inputs[2], c)
        return m.outputs[0]

    def add(self, a, b):
        return self.math("ADD", a, b)

    def sub(self, a, b):
        return self.math("SUBTRACT", a, b)

    def mul(self, a, b):
        return self.math("MULTIPLY", a, b)

    def div(self, a, b):
        return self.math("DIVIDE", a, b)

    def cl(self, a):
        return self.math("MULTIPLY", a, 1.0, clamp_=True)

    def lerpf(self, a, b, u):   # a + (b - a) u
        return self.math("MULTIPLY_ADD", self.sub(b, a), u, a)

    def mixc(self, fac, a, b, blend="MIX"):
        m = self.n.new("ShaderNodeMixRGB")
        m.blend_type = blend
        self._set(m.inputs[0], fac)
        self._set(m.inputs[1], a)
        self._set(m.inputs[2], b)
        return m.outputs[0]

    def rgb(self, c):
        r = self.n.new("ShaderNodeRGB")
        r.outputs[0].default_value = tuple(c) + (1.0,) if len(c) == 3 else tuple(c)
        return r.outputs[0]

    def group(self, tree):
        g = self.n.new("ShaderNodeGroup")
        g.node_tree = tree
        return g


def s01(c):
    return tuple(v / 255.0 for v in c[:3])


# =============================================================================================
# per-frame values shared by the world and the materials: one keyed node group
# =============================================================================================
FRAME_VALS = ("HY", "Y0", "F", "YAW", "CX", "SX", "SY", "GR", "GA", "DR", "NOW")
FRAME_COLS = ("TOP", "LOW", "SUNC", "DISC")


def frame_values():
    vals = {k: [] for k in FRAME_VALS}
    cols = {k: [] for k in FRAME_COLS}
    for fi, s in enumerate(S):
        t = K.ft(fi + 1)
        c = s["cam"]
        hy = H_ / 2 - c[4] * math.tan(c[3])
        top, low = s["sky"]
        vals["HY"].append(hy)
        vals["Y0"].append(min(hy - 900, 0))
        vals["F"].append(c[4])
        vals["YAW"].append(c[5])
        vals["CX"].append(c[0])
        vals["NOW"].append(t)
        cols["TOP"].append(s01(top))
        cols["LOW"].append(s01(low))
        # sunDisc(t, hy)
        el_d = s["sunEl"]
        el = el_d * math.pi / 180
        dx, dz = s["sunDir"]
        ce, D = math.cos(el), 1e4
        sp = proj(c, c[0] - dx * ce * D, c[1] + math.sin(el) * D, c[2] - dz * ce * D)
        warm = clamp(1 - (el_d - 4) / 18)
        col = mix3([255, 242, 207], [255, 154, 82], clamp(1 - (el_d - 1) / 9))
        R = 700 + 300 * warm
        vis = not (el < -0.035 or sp[2] < 1 or sp[0] < -R or sp[0] > W_ + R or sp[1] > hy + R * 0.4 or sp[1] < -R)
        vals["SX"].append(sp[0] if vis else -9999)
        vals["SY"].append(sp[1] if vis else -9999)
        vals["GR"].append(R)
        vals["GA"].append((0.16 + 0.3 * warm) if vis else 0.0)
        vals["DR"].append((34 + 14 * warm) if vis else 0.0)
        cols["SUNC"].append(s01(col))
        cols["DISC"].append(s01(mix3(col, [255, 252, 236], 0.35 * (1 - warm))))
    return vals, cols


def frame_group():
    g = bpy.data.node_groups.get("RP_PlayaFrame")
    if g:
        return g
    g = bpy.data.node_groups.new("RP_PlayaFrame", "ShaderNodeTree")
    go = g.nodes.new("NodeGroupOutput")
    vals, cols = frame_values()
    for k in FRAME_VALS:
        g.interface.new_socket(k, in_out="OUTPUT", socket_type="NodeSocketFloat")
    for k in FRAME_COLS:
        g.interface.new_socket(k, in_out="OUTPUT", socket_type="NodeSocketColor")
    for k in FRAME_VALS:
        v = g.nodes.new("ShaderNodeValue")
        v.name = k
        g.links.new(v.outputs[0], go.inputs[k])
        K.key_series(g, 'nodes["%s"].outputs[0].default_value' % k, vals[k])
    for k in FRAME_COLS:
        r = g.nodes.new("ShaderNodeRGB")
        r.name = k
        g.links.new(r.outputs[0], go.inputs[k])
        for i in range(3):
            K.key_series(g, 'nodes["%s"].outputs[0].default_value' % k, [c[i] for c in cols[k]], index=i)
    return g


def tolin_group():
    """sRGB numbers (0..1) -> scene-linear, the exact curve above .04045."""
    g = bpy.data.node_groups.get("RP_ToLin")
    if g:
        return g
    g = bpy.data.node_groups.new("RP_ToLin", "ShaderNodeTree")
    g.interface.new_socket("Color", in_out="INPUT", socket_type="NodeSocketColor")
    g.interface.new_socket("Color", in_out="OUTPUT", socket_type="NodeSocketColor")
    gi, go = g.nodes.new("NodeGroupInput"), g.nodes.new("NodeGroupOutput")
    vm = g.nodes.new("ShaderNodeVectorMath")
    vm.operation = "MULTIPLY_ADD"
    vm.inputs[1].default_value = (1 / 1.055,) * 3
    vm.inputs[2].default_value = (0.055 / 1.055,) * 3
    gm = g.nodes.new("ShaderNodeGamma")
    gm.inputs[1].default_value = 2.4
    g.links.new(gi.outputs[0], vm.inputs[0])
    g.links.new(vm.outputs[0], gm.inputs[0])
    g.links.new(gm.outputs[0], go.inputs[0])
    return g


def screen_px(nt):
    """(x px, y px from the top) on the draft's 1920x1080 frame, from Window coordinates."""
    tc = nt.n.new("ShaderNodeTexCoord")
    sep = nt.n.new("ShaderNodeSeparateXYZ")
    nt.l.new(tc.outputs["Window"], sep.inputs[0])
    xpx = nt.mul(sep.outputs[0], W_)
    ypx = nt.mul(nt.sub(1.0, sep.outputs[1]), H_)
    return xpx, ypx


# =============================================================================================
# the sky (world shader, camera rays only)
# =============================================================================================
def mountain_image():
    im = bpy.data.images.get("RP_PlayaMountains")
    if im:
        return im
    h = G["mtn"]                          # 26 + 22 n1(41, X/300) + 10 n1(42, X/90), X = -8000..8000 step 4
    tmp = bpy.data.images.new("RP_PlayaMountainsTmp", width=len(h), height=1, float_buffer=True, alpha=False)
    tmp.colorspace_settings.name = "Non-Color"      # before the pixels (a change resets them), so save() writes raw values
    px = []
    for v in h:
        v = max(0.0, v) / 100.0
        px += [v, v, v, 1.0]
    tmp.pixels.foreach_set(px)
    # a generated image neither keeps its pixels through a colour-space change nor packs: save it, load it, pack it
    path = os.path.join(K.ROOT, "out", "state", "playa_mountains.exr")
    tmp.filepath_raw = path
    tmp.file_format = "OPEN_EXR"
    tmp.save()
    bpy.data.images.remove(tmp)
    im = bpy.data.images.load(path)
    im.name = "RP_PlayaMountains"
    im.colorspace_settings.name = "Non-Color"
    im.pack()
    return im


def build_world():
    scn = K.scn
    world = scn.world or bpy.data.worlds.new("RP_World")
    scn.world = world
    world.use_nodes = True
    wt = world.node_tree
    wt.nodes.clear()
    nt = NT(wt)
    fr = nt.group(frame_group())
    fr.name = "RP_SkyDone"            # verse1.py keeps this world
    o = fr.outputs
    xpx, ypx = screen_px(nt)
    # the gradient: top at min(hy - 900, 0), .75 mix(top, low, .55), low at the horizon
    u = nt.cl(nt.div(nt.sub(ypx, o["Y0"]), nt.sub(o["HY"], o["Y0"])))
    mid = nt.mixc(0.55, o["TOP"], o["LOW"])
    c1 = nt.mixc(nt.cl(nt.div(u, 0.75)), o["TOP"], mid)
    sky = nt.mixc(nt.cl(nt.div(nt.sub(u, 0.75), 0.25)), c1, o["LOW"])
    # the sun's glow (screen blend: ga at the centre, .45 ga at .25 R, 0 at R) and its disc
    dx, dy = nt.sub(xpx, o["SX"]), nt.sub(ypx, o["SY"])
    dist = nt.math("SQRT", nt.add(nt.mul(dx, dx), nt.mul(dy, dy)))
    rr = nt.div(dist, o["GR"])
    a1 = nt.mul(o["GA"], nt.sub(1.0, nt.mul(0.55, nt.cl(nt.div(rr, 0.25)))))
    a2 = nt.mul(nt.mul(o["GA"], 0.45), nt.sub(1.0, nt.cl(nt.div(nt.sub(rr, 0.25), 0.75))))
    inner = nt.math("LESS_THAN", rr, 0.25)
    ga = nt.lerpf(a2, a1, inner)
    sky = nt.mixc(ga, sky, o["SUNC"], blend="SCREEN")
    disc = nt.mul(nt.cl(nt.add(nt.sub(o["DR"], dist), 0.5)), 0.95)
    sky = nt.mixc(disc, sky, o["DISC"])
    # far mountains: a pale band, height h(X) metres at 2500 m, X = ((x - W/2) / f + yaw) 2500 + C.x
    X = nt.add(nt.mul(nt.add(nt.div(nt.sub(xpx, W_ / 2), o["F"]), o["YAW"]), 2500.0), o["CX"])
    uu = nt.div(nt.add(X, 8000.0), 16000.0)
    cmb = nt.n.new("ShaderNodeCombineXYZ")
    nt._set(cmb.inputs[0], uu)
    cmb.inputs[1].default_value = 0.5
    tex = nt.n.new("ShaderNodeTexImage")
    tex.image = mountain_image()
    tex.extension = "EXTEND"
    tex.interpolation = "Linear"
    nt.l.new(cmb.outputs[0], tex.inputs[0])
    hm = nt.mul(tex.outputs[0], 100.0)
    ytop = nt.sub(o["HY"], nt.div(nt.mul(nt.mul(hm, o["F"]), 1.4), 2500.0))
    mask = nt.mul(nt.cl(nt.add(nt.sub(ypx, ytop), 0.5)), nt.cl(nt.sub(nt.add(o["HY"], 1.5), ypx)))
    mcol = nt.mixc(0.55, o["LOW"], s01(srgb("#8fa3b8")) + (1.0,))
    sky = nt.mixc(nt.mul(mask, 0.9), sky, mcol)
    # below the horizon (only where no ground is drawn): the ground's horizon colour
    gh = nt.mixc(0.35, s01(G["pal"]["groundFar"]) + (1.0,), o["LOW"])
    sky = nt.mixc(nt.math("GREATER_THAN", ypx, nt.add(o["HY"], 1.0)), sky, gh)
    lin = nt.group(tolin_group())
    nt._set(lin.inputs[0], sky)
    lp = nt.n.new("ShaderNodeLightPath")
    bg_cam, bg_amb = nt.n.new("ShaderNodeBackground"), nt.n.new("ShaderNodeBackground")
    nt.l.new(lin.outputs[0], bg_cam.inputs[0])
    bg_amb.inputs[0].default_value = (1, 1, 1, 1)
    bg_amb.inputs[1].default_value = 0.25
    if K.LOOK == "pbr":       # daylight: blue sky fill strong enough that shadows read light, as on the real playa
        bg_amb.inputs[0].default_value = K.lin(K.arg("--fill", "#e4dccd"))   # warm: most daylight fill on the playa is bounce off the cream ground
        bg_amb.inputs[1].default_value = float(K.arg("--sky", 1.6))
        bg_cam.inputs[1].default_value = 2.0 ** -float(K.arg("--exposure", 0.2))   # the seen sky keeps the draft's colours
    mx, out = nt.n.new("ShaderNodeMixShader"), nt.n.new("ShaderNodeOutputWorld")
    nt.l.new(lp.outputs["Is Camera Ray"], mx.inputs[0])
    nt.l.new(bg_amb.outputs[0], mx.inputs[1])
    nt.l.new(bg_cam.outputs[0], mx.inputs[2])
    nt.l.new(mx.outputs[0], out.inputs[0])


# =============================================================================================
# the ground: the draft's screen-space gradient, cracks, and the lilac cast shadow
# =============================================================================================
SHADOW_CUT = 0.70        # Shader-to-RGB on the flat playa: sun-lit .77-.96 over this verse, in cast shadow ~.63


def ground_material_pbr():
    """--look pbr: lit playa. Dried-mud plates (Voronoi, ~3 m) with dark cracks that also dip, a dust-pale
    plate tone varying in big soft patches, rough dusty surface catching the real sun and shadows."""
    mat = bpy.data.materials.new("RP_PlayaGround")
    n, l = K._nodes(mat)
    near, far = s01(G["pal"]["groundNear"]), s01(G["pal"]["groundFar"])
    tc, bs, out = n.new("ShaderNodeTexCoord"), n.new("ShaderNodeBsdfPrincipled"), n.new("ShaderNodeOutputMaterial")
    vo = n.new("ShaderNodeTexVoronoi")
    vo.feature = "DISTANCE_TO_EDGE"
    vo.inputs["Scale"].default_value = 1 / 3.2
    vo.inputs["Randomness"].default_value = 0.85
    l.new(tc.outputs["Object"], vo.inputs["Vector"])
    crack = n.new("ShaderNodeMapRange")
    crack.inputs["From Min"].default_value, crack.inputs["From Max"].default_value = 0.0, 0.012
    l.new(vo.outputs["Distance"], crack.inputs["Value"])                   # 0 in a crack, 1 on a plate
    nz = n.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 0.04
    nz.inputs["Detail"].default_value = 4.0
    l.new(tc.outputs["Object"], nz.inputs["Vector"])
    tone = n.new("ShaderNodeMix")
    tone.data_type = "RGBA"
    tone.inputs["A"].default_value = K.lin_rgb([min(255, (a * 0.25 + b * 0.75) * 255 * 1.06) for a, b in zip(near, far)])
    tone.inputs["B"].default_value = K.lin_rgb([c * 255 for c in far])
    l.new(nz.outputs["Fac"], tone.inputs["Factor"])
    dark = n.new("ShaderNodeMix")
    dark.data_type = "RGBA"
    dark.inputs["B"].default_value = K.lin_rgb([c * 255 * 0.72 for c in near])
    l.new(tone.outputs["Result"], dark.inputs["A"])
    inv = n.new("ShaderNodeMath")
    inv.operation = "SUBTRACT"
    inv.inputs[0].default_value = 1.0
    l.new(crack.outputs[0], inv.inputs[1])
    l.new(inv.outputs[0], dark.inputs["Factor"])
    l.new(dark.outputs["Result"], bs.inputs["Base Color"])
    bs.inputs["Roughness"].default_value = 0.95
    fine = n.new("ShaderNodeTexNoise")
    fine.inputs["Scale"].default_value = 40.0
    fine.inputs["Detail"].default_value = 8.0
    l.new(tc.outputs["Object"], fine.inputs["Vector"])
    hsum = n.new("ShaderNodeMath")
    hsum.operation = "MULTIPLY_ADD"
    hsum.inputs[1].default_value = 0.15
    l.new(fine.outputs["Fac"], hsum.inputs[0])
    l.new(crack.outputs[0], hsum.inputs[2])
    bp = n.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = 0.35
    bp.inputs["Distance"].default_value = 0.01
    l.new(hsum.outputs[0], bp.inputs["Height"])
    l.new(bp.outputs["Normal"], bs.inputs["Normal"])
    n.remove(out)
    K.pbr_out(n, l, bs.outputs[0])
    return mat


def ground_material():
    if K.LOOK == "pbr":
        return ground_material_pbr()
    mat = bpy.data.materials.new("RP_PlayaGround")
    mat.use_nodes = True
    nt = NT(mat.node_tree)
    nt.n.clear()
    fr = nt.group(frame_group())
    o = fr.outputs
    xpx, ypx = screen_px(nt)
    gfar, gnear = s01(G["pal"]["groundFar"]) + (1.0,), s01(G["pal"]["groundNear"]) + (1.0,)
    ug = nt.cl(nt.div(nt.sub(ypx, o["HY"]), nt.sub(H_, o["HY"])))
    ghor = nt.mixc(0.35, gfar, o["LOW"])
    c1 = nt.mixc(nt.cl(nt.div(ug, 0.25)), ghor, gfar)
    base = nt.mixc(nt.cl(nt.div(nt.sub(ug, 0.25), 0.75)), c1, gnear)
    # cracks: dried-mud polygons at 3.2 m, a line clamp(f/d .03, .6, 3) px wide, alpha .5 (1 - d/100)
    tc, cam = nt.n.new("ShaderNodeTexCoord"), nt.n.new("ShaderNodeCameraData")
    vor = nt.n.new("ShaderNodeTexVoronoi")
    vor.voronoi_dimensions = "2D"
    vor.feature = "DISTANCE_TO_EDGE"
    vor.inputs["Scale"].default_value = 1 / 3.2
    vor.inputs["Randomness"].default_value = 0.75
    nt.l.new(tc.outputs["Object"], vor.inputs["Vector"])
    dist_m = nt.mul(vor.outputs["Distance"], 3.2)
    zd = cam.outputs["View Z Depth"]
    pxm = nt.div(zd, o["F"])                                     # metres per draft pixel at this depth
    wpx = nt.math("MINIMUM", nt.math("MAXIMUM", nt.mul(nt.div(o["F"], zd), 0.03), 0.6), 3.0)
    hw = nt.mul(nt.mul(wpx, 0.5), pxm)
    cover = nt.cl(nt.add(nt.div(nt.sub(hw, dist_m), pxm), 0.5))
    ca = nt.mul(nt.mul(cover, 0.5), nt.cl(nt.sub(1.0, nt.div(zd, 100.0))))
    col = nt.mixc(ca, base, s01((110, 72, 40)) + (1.0,))
    # cast shadow: the draft's rgba(52,34,58,.42) over whatever is under it
    dif, s2r = nt.n.new("ShaderNodeBsdfDiffuse"), nt.n.new("ShaderNodeShaderToRGB")
    nt.l.new(dif.outputs[0], s2r.inputs[0])
    bw = nt.n.new("ShaderNodeRGBToBW")
    nt.l.new(s2r.outputs[0], bw.inputs[0])
    sh = nt.math("LESS_THAN", bw.outputs[0], SHADOW_CUT)
    col = nt.mixc(nt.mul(sh, 0.42), col, s01(PLUM) + (1.0,))
    lin = nt.group(tolin_group())
    nt._set(lin.inputs[0], col)
    em, out = nt.n.new("ShaderNodeEmission"), nt.n.new("ShaderNodeOutputMaterial")
    nt.l.new(lin.outputs[0], em.inputs[0])
    nt.l.new(em.outputs[0], out.inputs[0])
    return mat


def build_ground():
    me = bpy.data.meshes.new("RP_PlayaGround")
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=96, radius=4200.0)
    # a finer ring of quads near the road so the shadow maps and the cracks get enough vertices nearby
    bm.to_mesh(me)
    bm.free()
    me.materials.append(ground_material())
    ob = bpy.data.objects.new("RP_PlayaGround", me)
    K.COL_PLAYA.objects.link(ob)
    ob.location = (60.0, 200.0, 0.0)
    return ob


# =============================================================================================
# Black Rock City: the skyline band (brcBill), flat cut-outs facing the drone, sRGB colour + haze toward the low sky
# =============================================================================================
REF = (3.0, -6.0)        # draft (x, z): where the drone is, on average, this verse; the cut-outs face it
K_SHADE, K_DOME, K_HEXA, K_TENT, K_RV, K_FLAG, K_TOWER, K_STAGE, K_ART, K_YURT, K_TRUCK, K_CC = range(12)


class Flat:
    """Coloured polygons in a vertical plane: (u right, v up) metres, layered toward the viewer."""

    def __init__(self):
        self.v, self.f, self.col, self.hz = [], [], [], []

    def item(self, X, Z, hz, layer_step):
        dx, dz = X - REF[0], Z - REF[1]
        n = math.hypot(dx, dz) or 1.0
        self.o = (X, Z)
        self.r = (dz / n, -dx / n)
        self.toward = (-dx / n, -dz / n)
        self.hzv = hz
        self.step = layer_step
        self.layer = 0

    def poly(self, pts, c):
        off = self.layer * self.step
        self.layer += 1
        i0 = len(self.v)
        for u, v in pts:
            X = self.o[0] + u * self.r[0] + off * self.toward[0]
            Z = self.o[1] + u * self.r[1] + off * self.toward[1]
            self.v.append(B(X, v, Z))
            self.col.append(c)
            self.hz.append(self.hzv)
        self.f.append(list(range(i0, len(self.v))))

    def rect(self, u0, v0, u1, v1, c):
        self.poly([(u0, v0), (u1, v0), (u1, v1), (u0, v1)], c)

    def arc(self, cu, cv, rx, ry, a0, a1, n, c, pie=True):
        pts = [(cu, cv)] if pie else []
        for i in range(n + 1):
            a = lerp(a0, a1, i / n)
            pts.append((cu + math.cos(a) * rx, cv + math.sin(a) * ry))
        self.poly(pts, c)

    def ring(self, cu, cv, R, w, n, c, a0=0.0, a1=2 * math.pi):
        for i in range(n):
            a, b = lerp(a0, a1, i / n), lerp(a0, a1, (i + 1) / n)
            ri, ro = R - w / 2, R + w / 2
            self.poly([(cu + math.cos(a) * ri, cv + math.sin(a) * ri), (cu + math.cos(a) * ro, cv + math.sin(a) * ro),
                       (cu + math.cos(b) * ro, cv + math.sin(b) * ro), (cu + math.cos(b) * ri, cv + math.sin(b) * ri)], c)
            self.layer -= 1
        self.layer += 1

    def seg(self, a, b, w, c):
        du, dv = b[0] - a[0], b[1] - a[1]
        n = math.hypot(du, dv) or 1.0
        nu, nv = -dv / n * w / 2, du / n * w / 2
        self.poly([(a[0] + nu, a[1] + nv), (b[0] + nu, b[1] + nv), (b[0] - nu, b[1] - nv), (a[0] - nu, a[1] - nv)], c)

    def build(self, name, mat):
        me = bpy.data.meshes.new("RP_" + name)
        me.from_pydata(self.v, [], self.f)
        me.update()
        at = me.color_attributes.new("pcol", "FLOAT_COLOR", "POINT")
        flat_c = []
        for c in self.col:
            flat_c += [c[0] / 255.0, c[1] / 255.0, c[2] / 255.0, 1.0]
        at.data.foreach_set("color", flat_c)
        hz = me.attributes.new("hz", "FLOAT", "POINT")
        hz.data.foreach_set("value", self.hz)
        me.materials.append(mat)
        ob = bpy.data.objects.new("RP_" + name, me)
        K.COL_PLAYA.objects.link(ob)
        ob.visible_shadow = False
        return ob


def city_material():
    mat = bpy.data.materials.new("RP_PlayaCity")
    mat.use_nodes = True
    nt = NT(mat.node_tree)
    nt.n.clear()
    o = nt.group(frame_group()).outputs
    ac, ah = nt.n.new("ShaderNodeAttribute"), nt.n.new("ShaderNodeAttribute")
    ac.attribute_name, ah.attribute_name = "pcol", "hz"
    col = nt.mixc(ah.outputs["Fac"], ac.outputs["Color"], o["LOW"])
    lin = nt.group(tolin_group())
    nt._set(lin.inputs[0], col)
    em, out = nt.n.new("ShaderNodeEmission"), nt.n.new("ShaderNodeOutputMaterial")
    nt.l.new(lin.outputs[0], em.inputs[0])
    nt.l.new(em.outputs[0], out.inputs[0])
    return mat


def bill(fl, k, w, h, vr, c1, c2, dk, mpx):
    """brcBill in metres; mpx is metres per draft pixel at the item, for the draft's 1 px minimums (posts, flags)."""
    pw = max(0.14, mpx)
    if k == K_SHADE:
        fl.rect(-w / 2, 0, -w / 2 + pw, h, dk)
        fl.rect(w / 2 - pw, 0, w / 2, h, dk)
        if w > 5.5:
            fl.rect(-pw / 2, 0, pw / 2, h, dk)
        if vr < 2:
            fl.rect(-w / 2, h * 0.25, -w / 2 + w * (0.4 if vr else 0.7), h, c2)
        fl.rect(-w / 2 - 0.3, h + 0.35 - max(0.55, mpx), w / 2 + 0.3, h + 0.35, c1)
    elif k == K_DOME:
        r = w / 2
        fl.arc(0, 0, r, r, 0, math.pi, 10, c1)
        if r > 1.3:
            fl.arc(0, 0, r, r, 0, math.pi / 2, 5, c2)
    elif k == K_HEXA:
        fl.poly([(-w / 2, 0), (w / 2, 0), (w / 2, h * 0.62), (w * 0.22, h), (-w * 0.22, h), (-w / 2, h * 0.62)], c1)
        if w > 2:
            fl.rect(w * 0.12, 0, w * 0.5, h * 0.62, c2)
    elif k == K_TENT:
        if vr < 3:
            fl.poly([(-w / 2, 0), (w / 2, 0), (0, h)], c1)
        else:
            pts = [(-w / 2, 0)]
            for i in range(1, 8):
                s = i / 8
                pts.append((lerp(-w / 2, w / 2, s), 2 * s * (1 - s) * h * 1.6))
            pts.append((w / 2, 0))
            fl.poly(pts, c1)
    elif k == K_RV:
        fl.rect(-w / 2, h * 0.16, w / 2, h, c1)
        if w > 2:
            fl.rect(-w / 2, h * 0.5 - max(0.3, mpx), w / 2, h * 0.5, c2)
            fl.rect(-w / 2, 0, w / 2, h * 0.16, dk)
    elif k == K_TRUCK:
        fl.rect(-w / 2, h * 0.16, -w / 2 + w * 0.74, h, c1)
        fl.rect(w * 0.26, h * 0.16, w * 0.5, h * 0.62, c2)
    elif k == K_FLAG:
        fl.rect(-pw / 2, 0, pw / 2, h, dk)
        fl.rect(0, h - max(0.9, 1.5 * mpx), max(1.5, 2 * mpx), h, c1)
    elif k == K_TOWER:
        fl.rect(-w / 2, 0, -w / 2 + pw, h, dk)
        fl.rect(w / 2 - pw, 0, w / 2, h, dk)
        for j in range(1, 5):
            fl.rect(-w / 2, h * j / 5, w / 2, h * j / 5 + pw * 0.7, dk)
        fl.rect(-w * 0.45, h, w * 0.45, h + 1.4, dk)
    elif k == K_STAGE:
        fl.rect(-w / 2, 0, w / 2, h * 0.72, dk)
        pts = []
        for i in range(9):
            s = i / 8
            pts.append((lerp(-w / 2 - 0.5, w / 2 + 0.5, s), h * 0.7 + 2 * s * (1 - s) * h * 0.55))
        fl.poly(pts, c1)
    elif k == K_YURT:
        fl.rect(-w / 2, 0, w / 2, h * 0.6, c1)
        fl.poly([(-w / 2 - 0.2, h * 0.6), (w / 2 + 0.2, h * 0.6), (0, h)], c1)
    elif k == K_ART:
        if vr == 0:
            fl.poly([(-w * 0.3, 0), (w * 0.3, 0), (0, h)], c1)
            fl.poly([(0, 0), (w * 0.3, 0), (0, h)], c2)
        elif vr == 1:
            fl.ring(0, h * 0.55, h * 0.42, max(0.8, mpx), 24, c1)
            fl.rect(-w * 0.2, 0, w * 0.2, h * 0.14, dk)
        elif vr == 2:
            r = h * 0.45
            fl.ring(0, h * 0.52, r, max(0.4, mpx), 24, c1)
            for j in range(6):
                a = j / 6 * math.pi
                fl.seg((math.cos(a) * r, h * 0.52 + math.sin(a) * r), (-math.cos(a) * r, h * 0.52 - math.sin(a) * r), 0.4, c1)
                fl.layer -= 1
            fl.layer += 1
            fl.rect(-0.3, 0, 0.3, h * 0.52, dk)
        elif vr == 3:
            yy = 0
            for j in range(4):
                bw, bh = w * (0.9 - j * 0.17), h / 4.2
                sx = (1 if j % 2 else -1) * w * 0.06
                fl.rect(-bw / 2 + sx, yy, bw / 2 + sx, yy + bh, c1)
                fl.layer -= 1
                yy += bh
            fl.layer += 1
            fl.rect(w * 0.1, 0, w * 0.3, h * 0.9, c2)
        else:
            fl.rect(-w / 2 - 0.45, 0, -w / 2 + 0.45, h * 0.5, c1)
            fl.rect(w / 2 - 0.45, 0, w / 2 + 0.45, h * 0.5, c1)
            fl.ring(0, h * 0.5, w / 2, max(0.9, mpx), 12, c1, 0, math.pi)
    elif k == K_CC:
        R = w / 2
        fl.rect(-R, 0, R, 3.5, c2)
        fl.poly([(-R - 1, 3.2), (R + 1, 3.2), (R * 0.55, 8), (R * 0.14, 12.2), (0, h), (-R * 0.14, 12.2), (-R * 0.55, 8)], c1)
        fl.poly([(0, h), (R * 0.3, 3.2), (R + 1, 3.2), (R * 0.55, 8), (R * 0.14, 12.2)], c2)
        fl.rect(-0.07, h, 0.07, h + 4, dk)
        fl.rect(0, h + 2.8, 2, h + 4, srgb("#b8452f"))


def build_city():
    hzs, cols = G["brcHz"], [srgb(c) for c in G["brcCols"]]
    fl = Flat()
    n = 0
    for X, Z, ring, k, w, d, h, c, vr, tall in G["brc"]:
        if ring > 3 and not tall:
            continue                     # brcGround: rings past 3.2 + C.y / 5 are dropped unless tall (C.y < 4 here)
        hz = hzs[min(ring, len(hzs) - 1)]
        col = cols[c]
        c1, c2, dk = col, [col[0] * 0.62, col[1] * 0.6, col[2] * 0.62], [66, 52, 44]
        dist = math.hypot(X - REF[0], Z - REF[1])
        fl.item(X, Z, hz, dist / 250.0)  # a layer is pulled toward the drone a little, so overlapping parts never z-fight
        bill(fl, k, w, h, vr, c1, c2, dk, dist / 1350.0)
        n += 1
    ob = fl.build("PlayaCity", city_material())
    print("[playa] city: %d camp structures, %d faces" % (n, len(fl.f)))
    return ob


# =============================================================================================
# art on the open playa (brcArtDraw): low-poly 3D pieces in the plane facing the drone
# =============================================================================================
def facing_matrix(X, Z, s=1.0):
    """Local (u right, v up, w toward the back) -> Blender, at draft (X, 0, Z), facing REF."""
    dx, dz = X - REF[0], Z - REF[1]
    n = math.hypot(dx, dz) or 1.0
    r = Vector((dz / n, -dx / n, 0))       # Blender (x, y): draft (x, z)
    back = Vector((dx / n, dz / n, 0))
    up = Vector((0, 0, 1))
    m = Matrix((r * s, back * s, up * s)).transposed().to_4x4()
    m.translation = B(X, 0, Z)
    return m


def L(u, v, w=0.0):
    return Vector((u, w, v))


def torus(b, mat, c, e1, e2, R, r, nu=24, nv=6, a0=0.0, a1=2 * math.pi):
    c, e1, e2 = Vector(c), Vector(e1), Vector(e2)
    nrm = e1.cross(e2)
    rows = []
    for i in range(nu + 1):
        a = lerp(a0, a1, i / nu)
        d = e1 * math.cos(a) + e2 * math.sin(a)
        rows.append([c + d * (R + r * math.cos(p)) + nrm * (r * math.sin(p)) for p in [j / nv * 2 * math.pi for j in range(nv + 1)]])
    b.strip(mat, rows)


def build_art():
    wood, woodD, steel, steelD = (mat_of(h, haze=False) for h in ("#b38452", "#7a5634", "#8d8f94", "#585a60"))
    light_steel = mat_of("#c9c4b8", haze=False)
    n = 0
    for X, Z, kind, s in G["art"]:
        b = K.Builder()
        if kind == "tower":
            for sx in (-1, 1):
                for sw in (-1, 1):
                    b.rod(wood if sx < 0 else woodD, L(sx * 3.2, 0, sw * 2.4), L(sx * 1.2, 15, sw * 0.9), 0.18, seg=6, caps=False)
            for j in range(1, 6):
                y = j * 2.6
                hw = 3.2 - 2 * y / 15
                hd = 2.4 - 1.5 * y / 15
                b.box(woodD, L(0, y, -hd), (2 * hw, 0.2, 0.2))
                b.box(woodD, L(0, y, hd), (2 * hw, 0.2, 0.2))
                b.box(woodD, L(-hw, y, 0), (0.2, 2 * hd, 0.2))
                b.box(woodD, L(hw, y, 0), (0.2, 2 * hd, 0.2))
            b.box(wood, L(0, 15.25, 0), (4.4, 2.2, 0.5))
            b.cone(woodD, L(0, 16.65, 0), 2.6, 0.0, 2.3, seg=4, rot=Matrix.Rotation(math.pi / 4, 4, "Z"))
        elif kind == "sphere":
            for j in range(3):
                a = j / 3 * 2 * math.pi
                b.rod(steelD, L(math.cos(a) * 3.4, 0, math.sin(a) * 3.4), L(math.cos(a) * 0.8, 5, math.sin(a) * 0.8), 0.13, seg=6, caps=False)
            b.part(steel, bmesh.ops.create_icosphere, subdivisions=2, radius=4.2, matrix=Matrix.Translation(L(0, 8.5)))
        elif kind == "ring":
            torus(b, light_steel, L(0, 6.6), (1, 0, 0), (0, 0, 1), 6.0, 0.45, nu=32, nv=6)
            b.box(steelD, L(0, 0.45), (4.8, 1.6, 0.9))
        elif kind == "flower":
            green = mat_of("#4f6a46", haze=False)
            b.rod(green, L(0, 0), L(0.6, 4), 0.15, seg=6)
            b.rod(green, L(0.6, 4), L(0, 8.4), 0.15, seg=6)
            for j in range(8):
                a = j / 8 * 2 * math.pi + 0.2
                pm = mat_of("#d27a3c" if j % 2 else "#c8452f", haze=False)
                b.ellipsoid(pm, L(math.cos(a) * 1.8, 9 + math.sin(a) * 1.8, 0), (1.5, 0.25, 0.7), seg=10, rot=Matrix.Rotation(-a, 4, "Y"))
            b.ellipsoid(mat_of("#e8c04a", haze=False), L(0, 9, -0.1), (1.0, 0.4, 1.0), seg=12)
        elif kind == "pyramid":
            b.cone(wood, L(0, 5.5), 7.0 * math.sqrt(2), 0.0, 11.0, seg=4, rot=Matrix.Rotation(math.pi / 4, 4, "Z"))
            b.box(mat_of("#4a3626", haze=False), L(0, 1.3, -3.6), (2.8, 0.2, 2.6))
        else:            # three arches in a row
            for j in (-1, 0, 1):
                m = wood if j == 0 else woodD
                b.rod(m, L(j * 6 - 2.4, 0), L(j * 6 - 2.4, 4.5), 0.3, seg=6, caps=False)
                b.rod(m, L(j * 6 + 2.4, 0), L(j * 6 + 2.4, 4.5), 0.3, seg=6, caps=False)
                torus(b, m, L(j * 6, 4.5), (1, 0, 0), (0, 0, 1), 2.4, 0.3, nu=10, nv=5, a0=0, a1=math.pi)
        ob = b.build("PlayaArt_%s_%d" % (kind, n), K.COL_PLAYA, smooth=False)
        ob.matrix_world = facing_matrix(X, Z, s)
        n += 1


# =============================================================================================
# art camps along the road (bmCamp): chair towers, the lantern arch (and, with --playa-eye-candle, the eye and candle)
# =============================================================================================
def dali_crutch(b, a, top, w, back=0.0):
    """bmCrutch: a Dali crutch from foot a up to the fork at top (local u, v), w thick."""
    a, top = Vector(a), Vector(top)
    d = top - a
    Ln = d.length or 1.0
    nrm = Vector((-d.y / Ln, d.x / Ln))
    m = a.lerp(top, 0.62)
    cr, pad, grip = mat_of("#c9a46a"), mat_of("#e9dcc2"), mat_of("#8a6a3c")
    b.rod(cr, L(a.x, a.y, back), L(m.x, m.y, back), w / 2, seg=6)
    for sg in (1, -1):
        e = top + nrm * w * 1.6 * sg
        b.rod(cr, L(m.x, m.y, back), L(e.x, e.y, back), w * 0.35, seg=6)
    p0, p1 = top + nrm * w * 2.6, top - nrm * w * 2.6
    b.rod(pad, L(p0.x, p0.y, back), L(p1.x, p1.y, back), w * 0.7, seg=8)
    hp = a.lerp(top, 0.78)
    h0, h1 = hp + nrm * w * 1.2, hp - nrm * w * 1.2
    b.rod(grip, L(h0.x, h0.y, back), L(h1.x, h1.y, back), w * 0.4, seg=6)


def build_camps():
    if "--playa-camps" not in K.ARGS:
        return                  # rp_installs builds these four (bmCamp drip / eye / chairs / arch); this is a stand-in
    want = {"chairs", "arch", "eye", "drip"}
    n = 0
    for X, Z, kind, r, col, col2, seed in G["camps"]:
        if kind not in want:
            continue
        b = K.Builder()
        if kind == "chairs":                      # a crooked tower of boardroom chairs
            cx = cy = 0.0
            for i in range(8):
                lean = math.sin(i * 1.9 + seed) * 0.25
                s2 = 0.9 - i * 0.04
                wood = mat_of("#a8743e" if i % 2 else "#8a5a2c")
                seat = mat_of("#5c3a1c")
                rot = Matrix.Rotation(lean, 4, "Y")    # canvas rotate(lean) is clockwise on screen: +lean about +y
                base = L(cx, cy)

                def P_(u, v, w=0.0):
                    return base + rot @ L(u, v, w)
                for su in (-0.45, 0.45):
                    for sw in (-0.22, 0.22):
                        b.rod(wood, P_(su * s2, 0, sw), P_(su * s2, 0.55 * s2, sw), 0.035, seg=5, caps=False)
                b.box(seat, P_(0, 0.6 * s2), (1.1 * s2, 0.55, 0.1 * s2), rot=rot)
                b.box(wood, P_(-0.44 * s2, 1.02 * s2), (0.12 * s2, 0.5, 0.75 * s2), rot=rot)
                b.box(wood, P_(-0.225 * s2, 1.325 * s2), (0.65 * s2, 0.5, 0.15 * s2), rot=rot)
                cx += math.sin(lean) * 0.9
                cy += 1.0 * s2
            dali_crutch(b, (1.6, 0), (cx + 0.3, cy * 0.6), 0.08)
        elif kind == "arch":                      # a wooden lattice arch strung with lanterns
            wood = mat_of("#8a5a2c")
            for dx in (-1, 1):
                b.box(wood, L(dx * r, r * 0.45), (0.4, 0.4, r * 0.9))
            pts = [L(math.cos(a) * r, r * 0.9 + math.sin(a) * r * 0.55) for a in [i / 16 * math.pi for i in range(17)]]
            for p, q in zip(pts, pts[1:]):
                b.rod(wood, p, q, 0.175, seg=6)
            for i in range(7):
                a = (i + 0.5) / 7 * math.pi
                lx, ly = math.cos(a) * r * 0.85, r * 0.9 + math.sin(a) * r * 0.47 - 0.4
                b.rod(mat_of("#3a3028"), L(lx, ly + 0.4), L(lx, ly + 0.1), 0.015, seg=4, caps=False)
                b.ellipsoid(mat_of(col if i % 2 else "#e8b23a"), L(lx, ly), (0.2, 0.2, 0.28), seg=10)
        elif kind == "drip":                      # a tall candle tower melting at the top, propped
            h, w = r * 1.6, r * 0.22
            wax = mat_of("#e6dabb", light="#f6ecd2")
            b.cone(wax, L(0, h / 2), w, w * 0.9, h, seg=16)
            for i in range(5):
                dx = -w * 0.8 + i * w * 0.4
                Ld = (0.15 + 0.3 * rnd(seed, i)) * h
                b.rod(mat_of("#efe2c2"), L(dx, h, -w * 0.9), L(dx, h - Ld, -w * 0.95), w * 0.12, w * 0.07, seg=6)
            b.rod(mat_of("#2a2420"), L(0, h), L(0, h + 0.7 * w), 0.03, seg=4)
            b.ellipsoid(K.M.setdefault("pl_flame", K.flat("PlFlame", "#ffbe5a", 1.6)), L(0, h + w), (w * 0.16, w * 0.16, w * 0.32), seg=8)
            dali_crutch(b, (w * 3.2, 0), (w * 1.0, h * 0.55), 0.1)
        elif kind == "eye":                        # a giant eye on a tripod
            ey, er = r * 1.25, r * 0.42
            leg = mat_of("#5a4a3a")
            for a in (0, 2.1, 4.2):
                b.rod(leg, L(math.cos(a) * er, 0, math.sin(a) * er), L(0, ey - er * 0.6), 0.07, seg=6)
            b.ellipsoid(mat_of("#ece6da", light="#ffffff"), L(0, ey), (er, er, er), seg=24)
            b.disc(mat_of("#2f6fb5"), L(0, ey, -er * 0.995), er * 0.42, seg=20, rot=Matrix.Rotation(math.pi / 2, 4, "X"))
            b.disc(K.M.setdefault("pl_pupil", K.flat("PlPupil", "#0e0c10")), L(0, ey, -er * 1.0), er * 0.2, seg=16, rot=Matrix.Rotation(math.pi / 2, 4, "X"))
        ob = b.build("PlayaCamp_%s_%d" % (kind, n), K.COL_PLAYA, smooth=False)
        ob.location = B(X, 0, Z)
        n += 1


# =============================================================================================
# the promenade lampposts (playa.js lamp()): a post, a crossbar with a braced arm, the hook; empty by day
# =============================================================================================
LAMP_H, LAMP_ARM = 4.8, 4.45


def build_lamps():
    wood = mat_of("#5b4632", light="#8a6c4a")
    wire = mat_of("#2a2420")
    b = K.Builder()
    n = 0
    for X, Z, ax, az in G["lamps"]:
        if Z < -40 or math.hypot(X - REF[0], Z - REF[1]) > 1100:
            continue                       # the 12:00 promenade runs out behind the drone all verse
        P_ = lambda u, v: B(X + ax * u, v, Z + az * u)  # noqa: E731
        b.rod(wood, P_(0, 0), P_(0, LAMP_H), 0.085, 0.07, seg=6, caps=False)
        b.rod(wood, P_(-0.32, LAMP_ARM), P_(1.02, LAMP_ARM), 0.06, seg=5, caps=False)
        b.rod(wood, P_(0, LAMP_ARM - 0.6), P_(0.55, LAMP_ARM), 0.035, seg=5, caps=False)
        b.rod(wire, P_(0.92, LAMP_ARM), P_(0.92, LAMP_ARM - 0.12), 0.012, seg=4, caps=False)
        n += 1
    ob = b.build("PlayaLamps", K.COL_PLAYA, smooth=False)
    print("[playa] lamps: %d" % n)
    return ob


# =============================================================================================
# bike traffic (bmTraffic, bmRider): 22 costumed riders, side on, moving per frame
# =============================================================================================
def joint(a, b_, l1, l2, sx, sy):
    dx, dy = b_[0] - a[0], b_[1] - a[1]
    d = max(1e-4, min(math.hypot(dx, dy), l1 + l2 - 1e-4))
    th = math.atan2(dy, dx)
    A = math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1))
    p = (a[0] + l1 * math.cos(th + A), a[1] + l1 * math.sin(th + A))
    q = (a[0] + l1 * math.cos(th - A), a[1] + l1 * math.sin(th - A))
    return p if p[0] * sx + p[1] * sy > q[0] * sx + q[1] * sy else q


def build_wheel(name, r, rim_hex, parent, center):
    b = K.Builder()
    torus(b, mat_of("#1b1714"), (0, 0, 0), (1, 0, 0), (0, 0, 1), r - 0.025, 0.028, nu=20, nv=5)
    torus(b, mat_of(rim_hex), (0, 0, 0), (1, 0, 0), (0, 0, 1), r - 0.06, 0.012, nu=20, nv=4)
    for i in range(4):
        a = i * math.pi / 4
        e = Vector((math.cos(a), 0, math.sin(a))) * (r - 0.06)
        b.rod(mat_of("#5a524a"), -e, e, 0.006, seg=4, caps=False)
    b.ellipsoid(mat_of("#3a342e"), (0, 0, 0), (0.035, 0.05, 0.035), seg=8)
    ob = b.build(name, K.COL_PLAYA, parent=parent, smooth=False)
    ob.location = center
    return ob


def build_rider(i, c):
    """bmRider at k > 15 detail, as low-poly 3D: local u along travel, v up, w toward the back (away from the camera)."""
    up = 1.0 if c["bike"] == "tall" else 0.0
    cw = c["bike"] == "clock"
    rf = 0.46 if cw else 0.34
    RW, FW = (-0.55, 0.34), ((0.72 if cw else 0.57), rf)
    BB, SEAT, HT, HB = (-0.04, 0.3 + up), (-0.2, 0.88 + up), (0.4, 0.9 + up), (0.45, 0.72 + up)
    Gp, H0 = (0.27, 1.1 + up), (-0.2, 0.98 + up)
    Sh = (H0[0] + 0.13, H0[1] + 0.56)
    HD = (Sh[0] + 0.05, Sh[1] + 0.23)
    ca = c["seed"]
    P1 = (BB[0] + math.cos(ca) * 0.17, BB[1] + math.sin(ca) * 0.17)
    P2 = (BB[0] - math.cos(ca) * 0.17, BB[1] - math.sin(ca) * 0.17)
    root = K.empty("PlayaBike_%02d" % i, K.COL_PLAYA)
    b = K.Builder()
    fc = mat_of(c["frame"])
    tube = 0.024
    for pa, pb in ((RW, (BB[0], 0.3)), ((BB[0], 0.3), (SEAT[0], 0.88)), ((SEAT[0], 0.88), RW), ((BB[0], 0.3), (HB[0], 0.72)),
                   ((HB[0], 0.72), (HT[0], 0.9)), ((HT[0], 0.9), (SEAT[0], 0.88)), ((HB[0], 0.72), FW)):
        for w in ((-0.05, 0.05) if pa in (RW, FW) or pb in (RW, FW) else (0.0,)):
            b.rod(fc, L(pa[0], pa[1], w), L(pb[0], pb[1], w), tube, seg=5, caps=False)
    if up:
        for pa, pb in (((SEAT[0], 0.88), BB), (SEAT, HT), (HT, HB), (HB, BB), (BB, SEAT)):
            b.rod(fc, L(*pa), L(*pb), tube, seg=5, caps=False)
    b.rod(mat_of("#2a2622"), L(*HT), L(HT[0] - 0.02, HT[1] + 0.16), 0.018, seg=5, caps=False)
    b.rod(mat_of("#2a2622"), L(HT[0] - 0.02, HT[1] + 0.16, 0), L(Gp[0], Gp[1], 0), 0.018, seg=5, caps=False)
    b.rod(mat_of("#2a2622"), L(Gp[0], Gp[1], -0.25), L(Gp[0], Gp[1], 0.25), 0.016, seg=5)
    b.ellipsoid(mat_of("#3a2416"), L(SEAT[0] - 0.02, SEAT[1] + 0.07), (0.14, 0.08, 0.035), seg=8)
    if c["bike"] == "snail":
        b.ellipsoid(mat_of("#b07a3a", light="#f0d9a8"), L(-0.75, 1.15 + up, 0.05), (0.66, 0.3, 0.66), seg=16)
    if c["bike"] == "fish":
        fy = 0.92 + up
        b.ellipsoid(mat_of(c["frame"], light="#f6efe0"), L(-0.1, fy), (1.15, 0.32, 0.42), seg=16)
        b.cone(mat_of(c["frame"]), L(-1.3, fy), 0.45, 0.05, 0.4, seg=6, rot=Matrix.Rotation(-math.pi / 2, 4, "Y") @ Matrix.Rotation(math.pi / 2, 4, "Z"))
        b.ellipsoid(mat_of("#fbf7ec"), L(0.82, fy + 0.08, -0.3), (0.07, 0.03, 0.07), seg=8)
    if cw:
        b.disc(mat_of("#ecdcaa", light="#fbf1d0"), L(FW[0], FW[1], -0.03), rf, seg=24, rot=Matrix.Rotation(math.pi / 2, 4, "X"))
    # legs: far and near, a fur boot or a shoe at each pedal
    legc = c["legs"]
    for P_, w, m in ((P2, 0.09, mat_of(darker(legc, 0.62))), (P1, -0.09, mat_of(legc))):
        Kn = joint(H0, P_, 0.47, 0.48, 1, 0.2)
        if c["bike"] != "fish" or w > 0:
            b.rod(m, L(H0[0], H0[1], w), L(Kn[0], Kn[1], w), 0.065, 0.055, seg=6)
            b.rod(m, L(Kn[0], Kn[1], w), L(P_[0], P_[1], w), 0.055, 0.045, seg=6)
        b.ellipsoid(mat_of(c["trim"] if c["fur"] else "#1b1714"), L(P_[0] + 0.04, P_[1], w), (0.11, 0.06, 0.065), seg=8)
    # the coat (a tapered body), its collar, arms
    coat0, coat1 = c["coat"]
    cm = mat_of(coat0, light=None)
    b.ellipsoid(cm, L((H0[0] + Sh[0]) / 2 - 0.02, (H0[1] + Sh[1]) / 2 - 0.05), (0.26, 0.2, 0.36), seg=14,
                rot=Matrix.Rotation(-0.25, 4, "Y"))
    b.ellipsoid(mat_of(c["trim"] if c["fur"] else coat1), L(Sh[0] - 0.02, Sh[1] - 0.01), (0.18, 0.17, 0.075), seg=10)
    for w, near in ((0.15, False), (-0.15, True)):
        if near and c["para"]:
            Hn = (Sh[0] + 0.14, Sh[1] + 0.32)
            E = joint(Sh, Hn, 0.3, 0.3, 1, -0.5)
            b.rod(cm, L(Sh[0], Sh[1], w), L(E[0], E[1], w), 0.05, seg=6)
            b.rod(cm, L(E[0], E[1], w), L(Hn[0], Hn[1], w), 0.045, seg=6)
            hand = Hn
        else:
            E = joint(Sh, Gp, 0.3, 0.31, 0, -1)
            am = cm if near else mat_of(coat1)
            b.rod(am, L(Sh[0], Sh[1], w), L(E[0], E[1], w), 0.05, seg=6)
            b.rod(am, L(E[0], E[1], w), L(Gp[0], Gp[1], w * 1.4), 0.045, seg=6)
            hand = (Gp[0], Gp[1])
        b.ellipsoid(mat_of(c["skin"]), L(hand[0], hand[1], w), (0.045, 0.045, 0.045), seg=8)
    # head, goggles, hat
    sk = mat_of(c["skin"])
    b.rod(sk, L(Sh[0] + 0.02, Sh[1]), L(HD[0], HD[1] - 0.05), 0.035, seg=6)
    b.ellipsoid(sk, L(*HD), (0.11, 0.105, 0.125), seg=12)
    b.box(mat_of("#2a2420"), L(HD[0] + 0.02, HD[1] + 0.015), (0.18, 0.2, 0.035))
    b.ellipsoid(mat_of(c["lens"]), L(HD[0] + 0.09, HD[1] + 0.02, -0.05), (0.03, 0.04, 0.045), seg=8)
    hat = c["hat"]
    if hat == "top":
        blk = mat_of("#1c1a1e")
        b.cone(blk, L(HD[0], HD[1] + 0.23), 0.1, 0.11, 0.3, seg=12)
        b.cone(mat_of(coat0), L(HD[0], HD[1] + 0.125), 0.103, 0.103, 0.05, seg=12)
        b.cone(blk, L(HD[0], HD[1] + 0.08), 0.19, 0.19, 0.02, seg=14)
    elif hat == "fluff":
        b.ellipsoid(mat_of(c["trim"]), L(HD[0], HD[1] + 0.1), (0.17, 0.16, 0.12), seg=10)
    elif hat == "sun":
        b.cone(mat_of("#e2c88a"), L(HD[0], HD[1] + 0.09), 0.3, 0.3, 0.02, seg=16)
        b.cone(mat_of("#d4b670"), L(HD[0], HD[1] + 0.155), 0.1, 0.08, 0.13, seg=12)
    elif hat == "bopper":
        for s2 in (-1, 1):
            tip = L(HD[0] + s2 * 0.08, HD[1] + 0.4)
            b.rod(mat_of("#2a2420"), L(HD[0] + s2 * 0.04, HD[1] + 0.1), tip, 0.008, seg=4, caps=False)
            b.ellipsoid(mat_of(c["lens"]), tip, (0.05, 0.05, 0.05), seg=8)
    if c["bike"] == "snail":
        for s2 in (0, 0.08):
            tip = L(Gp[0] + 0.12 + s2, Gp[1] + 0.42)
            b.rod(mat_of("#8a5a2a"), L(Gp[0] + 0.02, Gp[1] + 0.03), tip, 0.01, seg=4, caps=False)
            b.ellipsoid(mat_of("#e8d4b4"), tip, (0.04, 0.04, 0.04), seg=8)
    # a flag pole on the rear rack, its pennant streaming back
    fl = c.get("flag")
    if fl:
        top = fl["h"] + up
        b.rod(mat_of("#3a3028"), L(-0.6, 0.62 + up * 0.5, 0.0), L(-0.66, top), 0.015, seg=5, caps=False)
        pts_top, pts_bot = [], []
        for j in range(11):
            u = j / 10
            wv = math.sin(u * 5 + c["seed"]) * 0.1 * u
            pts_top.append(L(-0.66 - u * 1.35, top - u * 0.14 + wv, 0.0))
            pts_bot.append(L(-0.66 - u * 1.35, top - 0.52 + u * 0.38 + wv, 0.0))
        b.strip(mat_of(fl["col"]), [pts_top, pts_bot])
        b.strip(mat_of(fl["col2"]), [pts_top, [p + Vector((0, 0.002, -0.13 * (1 - j / 10 * 0.7))) for j, p in enumerate(pts_top)]])
        b.ellipsoid(mat_of("#e8c04a"), L(-0.66, top + 0.05), (0.06, 0.06, 0.06), seg=8)
    # a fringed parasol held up from the hand
    if c["para"]:
        hx, hy = Sh[0] + 0.14, Sh[1] + 0.32
        tilt = Matrix.Rotation(0.22, 4, "Y")
        base = L(hx, hy)
        b.rod(mat_of("#3a3028"), base + tilt @ L(0, -0.2), base + tilt @ L(0, 1.0 + 0.46), 0.012, seg=4, caps=False)
        cen = base + tilt @ L(0, 1.0)
        apex = base + tilt @ L(0, 1.46)
        Rp = 0.82
        for j in range(8):
            a0, a1 = j / 8 * 2 * math.pi, (j + 1) / 8 * 2 * math.pi
            q0 = cen + tilt @ Vector((math.cos(a0) * Rp, math.sin(a0) * Rp, 0))
            q1 = cen + tilt @ Vector((math.cos(a1) * Rp, math.sin(a1) * Rp, 0))
            b.poly(mat_of(c["para"][j % 2]), [apex, q0, q1])
            b.poly(mat_of(c["para"][j % 2]), [apex, q1, q0])
    body = b.build("PlayaRider_%02d" % i, K.COL_PLAYA, parent=root, smooth=False)
    wheels = [build_wheel("PlayaBikeWheelR_%02d" % i, 0.34, "#a49a8c", root, L(*RW)),
              build_wheel("PlayaBikeWheelF_%02d" % i, rf, "#b08a3a" if cw else "#a49a8c", root, L(*FW))]
    return root, body, wheels, (0.34, rf)


def build_bikes():
    bikes = G["bikes"]
    for i, bk in enumerate(bikes):
        root, body, wheels, radii = build_rider(i, bk["c"])
        locs, rots, hide, spins = [], [], [], [[], []]
        prev_d = None
        for fi in range(K.NF):
            e = PS[fi]["bk"][i]
            c = S[fi]["cam"]
            if e is None:
                locs.append(B(0, -50, 0))
                rots.append((0, 0, 0))
                hide.append(1.0)
                spins[0].append(0)
                spins[1].append(0)
                continue
            X, Z, d, sp = e
            p = proj(c, X, 0, Z)
            vis = p[2] > 6.0 and -600 < p[0] < W_ + 600     # bmFade: closer than ~5 m to the lens it fades out
            locs.append(B(X, 0, Z))
            rots.append((0, 0, 0 if d > 0 else math.pi))
            hide.append(0.0 if vis else 1.0)
            spins[0].append(sp / radii[0])
            spins[1].append(sp / radii[1])
        K.key_loc(root, locs)
        K.key_rot(root, rots)
        for ob in [body] + wheels:
            K.key_series(ob, "hide_render", hide, interp="CONSTANT")
        for w, sv in zip(wheels, spins):
            K.key_series(w, "rotation_euler", sv, index=1)
    print("[playa] bikes: %d" % len(bikes))


# =============================================================================================
# the car's dust (carInto): a fixed pool of soft billboards keyed per frame; the wheel tracks as fading ground strips
# =============================================================================================
NSLOT = 38          # AGE / dt = 4.5 / .12 slots alive at once, three puffs each


def dust_material():
    """carInto's puff: radial gradient (252,242,222,a) -> .55 (242,226,196,.6a) -> 1 (236,216,180,0); a = object alpha."""
    mat = bpy.data.materials.new("RP_PlayaDust")
    mat.surface_render_method = "BLENDED"
    mat.use_transparency_overlap = False
    mat.use_nodes = True
    nt = NT(mat.node_tree)
    nt.n.clear()
    tc = nt.n.new("ShaderNodeTexCoord")
    sep = nt.n.new("ShaderNodeSeparateXYZ")
    nt.l.new(tc.outputs["UV"], sep.inputs[0])
    ux, uy = nt.sub(nt.mul(sep.outputs[0], 2), 1), nt.sub(nt.mul(sep.outputs[1], 2), 1)
    uxr = nt.mul(ux, 1.35)          # the ellipse is 1.35 R wide, the gradient a circle of radius R
    uy2 = nt.sub(uy, 0.15)          # whose centre sits .15 R above the ellipse's
    rho = nt.math("SQRT", nt.add(nt.mul(uxr, uxr), nt.mul(uy2, uy2)))
    edge = nt.math("SQRT", nt.add(nt.mul(ux, ux), nt.mul(uy, uy)))
    inner = nt.math("LESS_THAN", rho, 0.55)
    a_in = nt.lerpf(1.0, 0.6, nt.cl(nt.div(rho, 0.55)))
    a_out = nt.lerpf(0.6, 0.0, nt.cl(nt.div(nt.sub(rho, 0.55), 0.45)))
    am = nt.mul(nt.lerpf(a_out, a_in, inner), nt.math("LESS_THAN", edge, 1.0))
    oi = nt.n.new("ShaderNodeObjectInfo")
    alpha = nt.mul(am, oi.outputs["Alpha"])
    col = nt.mixc(nt.cl(nt.div(rho, 0.55)), s01((252, 242, 222)) + (1.0,), s01((242, 226, 196)) + (1.0,))
    col = nt.mixc(nt.cl(nt.div(nt.sub(rho, 0.55), 0.45)), col, s01((236, 216, 180)) + (1.0,))
    lin = nt.group(tolin_group())
    nt._set(lin.inputs[0], col)
    em, tr, mx, out = (nt.n.new(t) for t in ("ShaderNodeEmission", "ShaderNodeBsdfTransparent", "ShaderNodeMixShader", "ShaderNodeOutputMaterial"))
    nt.l.new(lin.outputs[0], em.inputs[0])
    nt._set(mx.inputs[0], alpha)
    nt.l.new(tr.outputs[0], mx.inputs[1])
    nt.l.new(em.outputs[0], mx.inputs[2])
    nt.l.new(mx.outputs[0], out.inputs[0])
    return mat


def build_dust():
    me = bpy.data.meshes.new("RP_PlayaPuff")
    bm = bmesh.new()
    bm.loops.layers.uv.new("UVMap")
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=1.0, calc_uvs=True)   # 2 x 2 m: radius 1
    bm.to_mesh(me)
    bm.free()
    me.materials.append(dust_material())
    cams = [s["cam"] for s in S]
    crot = [(math.pi / 2 - c[3], 0.0, -c[5]) for c in cams]   # screen-aligned, as verse1.py turns the camera
    far, box = [], []
    for fi, s in enumerate(S):
        cx_, cz_ = s["car"][0], s["car"][1]
        cn = [proj(cams[fi], cx_ + u * 5.7, y, cz_ + w * 3.0) for u in (-1, 1) for w in (-1, 1) for y in (0, 2.6)]
        far.append(max(c[2] for c in cn))
        box.append((min(c[0] for c in cn), max(c[0] for c in cn), min(c[1] for c in cn), max(c[1] for c in cn)))
    pool = []
    for k in range(NSLOT * 3):
        ob = bpy.data.objects.new("RP_PlayaPuff_%03d" % k, me)
        K.COL_PLAYA.objects.link(ob)
        ob.visible_shadow = False
        ob.color = (1, 1, 1, 0)
        pool.append(([], [], []))
    for fi in range(K.NF):
        here = {}
        for n, w, X, Y, Z, r, a in PS[fi]["du"]:
            here[(n % NSLOT) * 3 + w] = (X, Y, Z, r, a)
        for k in range(NSLOT * 3):
            locs, scs, als = pool[k]
            e = here.get(k)
            if e is None:
                locs.append(locs[-1] if locs else Vector((0, 0, -50)))
                scs.append((0.0, 0.0, 0.0))
                als.append(0.0)
            else:
                X, Y, Z, r, a = e
                p = Vector(B(X, Y, Z))
                d = proj(cams[fi], X, Y, Z)[2]
                if d < 1:
                    p, r, a = locs[-1] if locs else Vector((0, 0, -50)), 0.0, 0.0   # carInto skips puffs at the lens
                elif d < far[fi]:
                    # the draft lays the car layer over all of its dust: a puff nearer than the car's far side slides
                    # back along its view ray to just behind it, scaled so it covers the same patch of the frame
                    d2 = far[fi] + 0.3 + 0.05 * d
                    eye = B(cams[fi][0], cams[fi][1], cams[fi][2])
                    sc = d2 / d
                    if p.z < eye.z:         # a downward ray: stop above the playa, or the ground hides the puff
                        sg = 0.97 * (eye.z - 0.05) / (eye.z - p.z)
                        if sg < sc:         # stuck in front of the car: keep a thin haze, not a veil over the suits
                            a *= 0.3
                        sc = max(1.0, min(sc, sg))
                    p = eye + (p - eye) * sc
                    r *= sc
                locs.append(p)
                scs.append((r * 1.35, r, 1.0))
                als.append(a * (0.55 if K.LOOK == "pbr" else 1.0))   # lit, the cards read denser than the draft's
    for k in range(NSLOT * 3):
        ob = bpy.data.objects["RP_PlayaPuff_%03d" % k]
        locs, scs, als = pool[k]
        K.key_loc(ob, locs)
        K.key_rot(ob, crot)
        K.key_scale(ob, scs)
        K.key_series(ob, "color", als, index=3)


def track_material():
    mat = bpy.data.materials.new("RP_PlayaTracks")
    mat.surface_render_method = "BLENDED"
    mat.use_nodes = True
    nt = NT(mat.node_tree)
    nt.n.clear()
    o = nt.group(frame_group()).outputs
    at = nt.n.new("ShaderNodeAttribute")
    at.attribute_name = "ts"
    age = nt.sub(o["NOW"], at.outputs["Fac"])
    chunk = nt.math("FLOOR", nt.div(age, 4.0))
    a = nt.mul(0.26, nt.sub(1.0, nt.div(chunk, 4.0)))
    a = nt.mul(a, nt.mul(nt.math("GREATER_THAN", age, -0.02), nt.math("LESS_THAN", age, 16.0)))
    lin = nt.group(tolin_group())
    nt._set(lin.inputs[0], s01((92, 58, 32)) + (1.0,))
    em, tr, mx, out = (nt.n.new(t) for t in ("ShaderNodeEmission", "ShaderNodeBsdfTransparent", "ShaderNodeMixShader", "ShaderNodeOutputMaterial"))
    nt.l.new(lin.outputs[0], em.inputs[0])
    nt._set(mx.inputs[0], a)
    nt.l.new(tr.outputs[0], mx.inputs[1])
    nt.l.new(em.outputs[0], mx.inputs[2])
    nt.l.new(mx.outputs[0], out.inputs[0])
    return mat


def car_x(t):
    return -40 + 1.6 * t        # world.js carX before 200 s (the table drives straight along +x all verse)


def build_tracks():
    lx = G["wheels"][0]
    tz = G["TD"] * 0.95
    t_a, t_b = max(0.0, K.T0 - 16.5), K.ft(K.NF) + 0.5
    n = int((t_b - t_a) / 0.25) + 1
    verts, faces, ts = [], [], []
    hw = 0.13 / 2
    for lz in (-tz, tz):
        i0 = len(verts)
        for j in range(n):
            t = t_a + j * 0.25
            X = car_x(t) + lx
            verts += [B(X, 0.006, lz - hw), B(X, 0.006, lz + hw)]
            ts += [t, t]
        for j in range(n - 1):
            a = i0 + 2 * j
            faces.append((a, a + 2, a + 3, a + 1))
    me = bpy.data.meshes.new("RP_PlayaTracks")
    me.from_pydata(verts, [], faces)
    me.update()
    at = me.attributes.new("ts", "FLOAT", "POINT")
    at.data.foreach_set("value", ts)
    me.materials.append(track_material())
    ob = bpy.data.objects.new("RP_PlayaTracks", me)
    K.COL_PLAYA.objects.link(ob)
    ob.visible_shadow = False
    return ob


# =============================================================================================
def build():
    global S, PS, G
    S = K.state("core")
    PS = K.state("playa")
    G = PS[0]
    build_world()
    build_ground()
    build_city()
    build_art()
    build_camps()
    build_lamps()
    build_bikes()
    build_dust()
    build_tracks()
