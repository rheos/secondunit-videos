# The whole of New City, after verse 1 (story2.js's four shots). Exec'd into newcity_blender.py's namespace with --full,
# so it uses the same helpers, inks, finish and key recording. Every sung line is printed flat on a surface and stamped
# on its vocal onset (work/sung.align.json, from tools/align_sung.py; gitignored). New figures from the signed-off
# board (2026-11-12): B rounded animals, C bare flagpoles (never a flag), D printed building blocks.
#
# Shots are pure functions of song time. Each shot registers the objects it makes; build_full() hides them outside the
# shot's window, so a shot's update(t) only keys what moves while it is on screen.
import props
props.bind(T, lambda a: Matrix.Rotation(a, 4, "Z"))

SUNG = json.load(open(os.path.join(PROJ, "work", "sung.align.json")))["sections"]
SL = [ln for sec in SUNG for ln in sec["lines"]]       # sung lines in recording order; SL[0:4] is verse 1
lcut = lambda ln: ln[0]["s"] - .45
CARD = {"cream": "red", "red": "cream", "black": "red"}          # the card's ink on each ground
ON = {"red": "cream", "cream": "black", "black": "cream"}        # the type's ink on each card
MATS = {}
def mat_on(ground):
    if ground not in MATS:
        MATS[ground] = {"cream": lambda: ink("onCream", "cream", "red", "black", .42, .96, .07),
                        "red": lambda: ink("onBlue", "cream", "black", "black", .5, .5, .06),
                        "black": lambda: ink("onDark", "cream", "red", "black", 0.0, .65, .06)}[ground]()
    return MATS[ground]
BLOCK_MAT = {}
def block_mat(ground):
    """the ground's inks with no threshold noise: big flat faces landing near a threshold would speckle"""
    if ground not in BLOCK_MAT:
        BLOCK_MAT[ground] = {"cream": lambda: ink("blockCream", "cream", "red", "black", .42, .96, 0.0),
                             "red": lambda: ink("blockBlue", "cream", "black", "black", .5, .5, 0.0),
                             "black": lambda: ink("blockDark", "cream", "red", "black", 0.0, .65, 0.0)}[ground]()
    return BLOCK_MAT[ground]
MOTIF_MAT = {}
def motif_top(ground):
    """faces toward the sky in the motif yellow, sides in the ground's inks: what is being built"""
    if ground not in MOTIF_MAT:
        lo, mid = {"cream": ("black", "red"), "red": ("black", "black"), "black": ("black", "red")}[ground]
        MOTIF_MAT[ground] = ink(f"motifTop_{ground}", "motif", mid, lo, .2, .5, 0.0)
    return MOTIF_MAT[ground]
LOADS = []
def loads_mat():
    if not LOADS: LOADS.append(ink("loadsF", "cream", "motif", "black", 0.0, .9, .05))
    return LOADS[0]
WORD_TIMES = []                                   # every stamp time, so visibility keys land exactly on it

def flat_card(name, w, d, key, pos, ry=0.0):
    return place(mesh_obj(name, Geo().plane(w, d).mesh(name, [FLAT[key]])), pos, (-math.pi / 2, 0, ry))
def flat_word(w, key, cap, pos, stretch=1.0, ry=0.0, parent=ROOT):
    m = word(w["w"], FLAT[key], parent=parent); place(m, pos, (-math.pi / 2, 0, ry), (cap, cap * stretch, cap))
    m["s"] = w["s"]; m["base"] = tuple(m.scale); WORD_TIMES.append(w["s"]); return m
def fit(m, want, maxw):
    c = min(want, maxw / m["width"]); b = m["base"]; k = c / b[0]
    m.scale = (b[0] * k, b[1] * k, b[2] * k); m["base"] = tuple(m.scale); return m

def gmath(ng, op, a, b=None):
    n = ng.nodes.new("ShaderNodeMath"); n.operation = op
    for i, v in enumerate((a, b)):
        if v is None: continue
        if isinstance(v, (int, float)): n.inputs[i].default_value = v
        else: ng.links.new(v, n.inputs[i])
    return n.outputs[0]
def gattr(ng, name):
    a = ng.nodes.new("GeometryNodeInputNamedAttribute"); a.data_type = "FLOAT"; a.inputs["Name"].default_value = name
    return a.outputs["Attribute"]
def gwave(ng, t0, speed, dur):
    """ease((t - t0 - d / speed) / dur), d a per-point attribute, t = Scene Time: exact at every motion-blur step"""
    st = ng.nodes.new("GeometryNodeInputSceneTime")
    x = gmath(ng, "DIVIDE", gmath(ng, "SUBTRACT", gmath(ng, "SUBTRACT", st.outputs["Seconds"], t0), gmath(ng, "DIVIDE", gattr(ng, "d"), speed)), dur)
    x = gmath(ng, "MINIMUM", gmath(ng, "MAXIMUM", x, 0.0), 1.0)
    return gmath(ng, "SUBTRACT", 1.0, gmath(ng, "POWER", gmath(ng, "SUBTRACT", 1.0, x), 3.0))

def gn_points(name, pts, attrs, src, pick=False, rot=None, scale=None, keep=None):
    """points + instancer like gn_instancer, plus: rot(ng, ry) -> y rotation, scale(ng, scl) -> vector,
    keep(ng) -> boolean field of points to keep (the others are deleted before instancing)"""
    ob = points_obj(name, [p[:3] for p in pts], attrs)
    gn_instancer(ob, src, rot_expr=rot, pick=pick)
    ng = ob.modifiers[0].node_group; N, L = ng.nodes, ng.links
    iop = next(n for n in N if n.type == "INSTANCE_ON_POINTS"); gi = next(n for n in N if n.type == "GROUP_INPUT")
    if scale:
        L.new(scale(ng, gattr(ng, "scl")), iop.inputs["Scale"])
    if keep:
        dg = N.new("GeometryNodeDeleteGeometry"); dg.domain = "POINT"
        L.new(gi.outputs[0], dg.inputs["Geometry"]); L.new(gmath(ng, "SUBTRACT", 1.0, keep(ng)), dg.inputs["Selection"])
        L.new(dg.outputs[0], iop.inputs["Points"])
    return ob

def pick_lib(name, meshes):
    c = bpy.data.collections.new("NC_LIB_" + name); LIB.children.link(c)
    for i, me in enumerate(meshes):
        o = bpy.data.objects.new(f"NC_{i:02d}_{name}", me); c.objects.link(o)
    return c

PERSON = {}
def person_mesh(pose, mat):
    k = (pose, mat.name)
    if k not in PERSON: g = Geo(); person(g, pose); PERSON[k] = g.mesh(f"person{pose}_{mat.name}", [mat])
    return PERSON[k]
ANIMALS = {}
def animal_lib(mat):
    if mat.name not in ANIMALS:
        ms = []
        for i, f in enumerate(props.ANIMALS["B"]):
            g = Geo(); f(g); ms.append(g.mesh(f"animal{i}_{mat.name}", [mat]))
        ANIMALS[mat.name] = pick_lib("animals_" + mat.name, ms)
    return ANIMALS[mat.name]

def crowd(name, mat, area, seed, avoid=None, pose_p=.3, thin=.12, scale=(4.2, 5.0), face=None, gap=(5.5, 7.5)):
    """two instancers (arms down, one arm raised) of the crowd figure over area (x0, x1, z0, z1)"""
    r = rng(seed); lists = [[], []]; x0, x1, z0, z1 = area; z = z0
    while z > z1:
        x = x0
        while x < x1:
            p = avoid(x, z) if avoid else 0
            if r() >= (1.0 if p is True else (p or thin)):
                pose = 1 if r() < pose_p else 0; s = lerp(scale[0], scale[1], r())
                ry = (face(x, z) if face else 0.0) + (r() - .5) * .8
                lists[pose].append((x + r() * .8, 0, z, ry, s))
            x += gap[0] + r() * 3
        z -= gap[1] + r() * 2.5
    return [instances(f"{name}{k}", person_mesh(k, mat), lists[k]) for k in (0, 1) if lists[k]]

def herd(name, mat, area, seed, avoid=None, thin=.2, scale=(4.0, 4.8), face=None, gap=(9, 9), rot=None, d_to=None):
    r = rng(seed); pts, kinds, rys, scls, ds = [], [], [], [], []; x0, x1, z0, z1 = area; z = z0
    while z > z1:
        x = x0
        while x < x1:
            skip = avoid and avoid(x, z)
            if r() >= (1.0 if skip else thin):
                k = math.floor(r() * 6); px = x + r() * 2
                pts.append((px, 0, z)); kinds.append(k); rys.append((face(px, z) if face else r() * 6.28) + (r() - .5) * .5)
                scls.append(lerp(scale[0], scale[1], r()) * (1.25 if k < 2 else 1)); ds.append(math.hypot(px - d_to[0], z - d_to[1]) if d_to else 0)
            x += gap[0] + r() * 4
        z -= gap[1] + r() * 3
    return gn_points(name, pts, {"kind": ("INT", kinds), "ry": ("FLOAT", rys), "scl": ("FLOAT", scls), "d": ("FLOAT", ds)},
                     animal_lib(mat), pick=True, rot=rot)

def ring_of_buildings(name, mat, seed, r0=80, r1=280, h=(9, 26)):
    """the city around an orbit shot: buildings in rings outside r0, so an orbiting camera never sits inside one"""
    c, fps = building_lib(mat); r = rng(seed); pts, kinds, rys, scls = [], [], [], []
    rad = r0
    while rad < r1:
        n = int(2 * math.pi * rad / 16); a0 = r() * 6.28
        for i in range(n):
            if r() < .15: continue
            a = a0 + i * 2 * math.pi / n; k = math.floor(r() * len(BUILDINGS)); H = lerp(h[0], h[1], r()) * (1.6 if fps[k] < 6 else 1)
            pts.append((math.cos(a) * rad, 0, math.sin(a) * rad)); kinds.append(k); rys.append(-a); scls.append(H / 10)
        rad += 16 + r() * 6
    ob = points_obj(name, pts, {"kind": ("INT", kinds), "ry": ("FLOAT", rys), "scl": ("FLOAT", scls)})
    return gn_instancer(ob, c, pick=True)

def cranes(name, mat, spots, seed):
    rc = rng(seed); cg, lg = Geo(), Geo()
    for x, z, s, sw in spots: crane(cg, lg, rc, x, z, s, sw)
    return [mesh_obj(name, cg.mesh(name, [mat])), mesh_obj(name + "_loads", lg.mesh(name + "_loads", [loads_mat()]))]

def end_shot(t0, ground, update, managed):
    SHOTS.append((t0, ground, update)); SHOT_META.append({"objs": list(REG[0]), "managed": set(managed)}); REG[0] = None

def stack_y(t, times, h):
    return sum(h * ease((t - s + .05) / .5) for s in times)

# ---- F: who can build this city: a stack of printed blocks, one dropped onto it on each word -----------------------
def shot_blocks(ln, ground, seed, yellow=0, until=None):
    REG[0] = []; t0 = lcut(ln); mat = mat_on(ground); r = rng(seed)
    bw, bh, bd = 20.0, 4.0, 10.0
    flat_card("F_card", 80, 80, {"black": "cream", "red": "cream", "cream": "red"}[ground], (0, .02, 0), r() * 1.5)
    top_ink = {"cream": "cream", "red": "black", "black": "cream"}[ground]     # the block's top face is the mid/hi ink
    blocks, words = [], []
    for i, w in enumerate(ln):
        big = w["w"] in ("build", "city")
        key = "motif" if (yellow >= 3 or (yellow >= 2 and big) or (yellow >= 1 and w["w"] == "city")) and ground != "red" else top_ink
        bm = motif_top(ground) if (yellow >= 2 and big) else block_mat(ground)
        if bm is not block_mat(ground): key = "black"         # never yellow type on a yellow top
        g = Geo(); g.box(bw * (1.15 if big else 1), bh, bd, 0, 0, 0); b = mesh_obj(f"F_block{i}", g.mesh(f"F_block{i}", [bm]))
        ry = (r() - .5) * .5 + i * .2; place(b, (0, i * bh, 0), (0, ry, 0)); b["y0"] = i * bh; b["s"] = w["s"]; b["ry"] = ry
        m = word(w["w"], FLAT[key], parent=b); fit_c = min(5.0, bw * (1.15 if big else 1) * .86 / m["width"])
        place(m, (0, bh + .03, 0), (-math.pi / 2, 0, 0), (fit_c, fit_c * 1.5, fit_c)); m["s"] = w["s"]; m["base"] = tuple(m.scale)
        m["h"] = fit_c * 1.5
        WORD_TIMES.append(w["s"]); blocks.append(b); words.append(m)
    ring_of_buildings("F_rows", mat, seed, 75, 300, (8, 24))
    cranes("F_cranes", mat, [(-50, -24, 2.4, .4 + r()), (46, 30, 2.2, 2.4 + r())], seed + 1)
    times = [w["s"] for w in ln]; th0 = r() * 6.28
    for b, m in zip(blocks, words):
        # each block lands turned to the camera (a little off square), its word centred along the long side, so the
        # stack spirals with the orbit and every word reads upright
        ry = th0 + (b["s"] - t0) * .13 + (r() - .5) * .35; b["ry"] = ry; b.rotation_euler = (0, ry, 0)
        m.rotation_euler = (-math.pi / 2, 0, 0); m.location.z = m["h"] / 2
    def update(t):
        for b, m in zip(blocks, words):
            s = b["s"]; on = t >= s - .45; vis(b, on); vis(m, on)
            fall = max(0.0, (s - t) / .45); rec(b, "location", (0, b["y0"] + 60 * fall * fall, 0))
            pop_scale(m, t, s, m["base"])
        k = clamp((t - t0) / 7.0); ys = stack_y(t, times, bh)
        th = th0 + (t - t0) * .13; R = lerp(34, 27, easeIO(k))
        pos = (R * math.sin(th), ys + lerp(12, 9, k), R * math.cos(th))
        camera(pos, (0, ys, 0), .2 * math.sin(t * .5) - .14, 56, (Vector(pos) - Vector((0, ys, 0))).length, 1.0)
    end_shot(t0, ground, update, blocks + words)

# ---- G: who can lend their hand: a crowd on a card, every arm goes up in a wave from the big word -----------------
def shot_hands(ln, ground, seed, yellow=0):
    REG[0] = []; t0 = lcut(ln); mat = mat_on(ground); r = rng(seed)
    card = CARD[ground]; key = ON[card]; hand = ln[-1]; hz = -118
    flat_card("G_card", 80, 190, card, (0, .02, -70))
    words = []
    for i, w in enumerate(ln[:-1]):
        words.append(flat_word(w, key, 5.2, (0, .06, -22 - i * 16), 1.7))
    big = flat_word(hand, "motif" if card == "red" else key, 1, (0, .06, hz))
    fit(big, 26, 70); words.append(big)
    hs = hand["s"]
    lane = lambda x, z: abs(x) < 15 and z > hz - 30
    area = (-110, 110, 30, -260)
    pts = [[], []]; rr = rng(seed + 7); z = area[2]
    while z > area[3]:
        x = area[0]
        while x < area[1]:
            if not lane(x, z) and rr() >= .1:
                s = lerp(4.2, 5.0, rr()); pts[0].append((x + rr() * .8, 0, z, (rr() - .5) * .8, s))
            x += 5.5 + rr() * 3
        z -= 7 + rr() * 2.5
    def mk(pose):
        thr = lambda ng: gmath(ng, "GREATER_THAN", gwave(ng, hs - .15, 70.0, .05), .5)
        keep = (lambda ng: gmath(ng, "SUBTRACT", 1.0, thr(ng))) if pose == 0 else thr
        src = bpy.data.objects.new(f"G_p{pose}_src", person_mesh(pose, mat)); LIB.objects.link(src)
        return gn_points(f"G_crowd{pose}", pts[0], {"ry": ("FLOAT", [p[3] for p in pts[0]]), "scl": ("FLOAT", [p[4] for p in pts[0]]),
                         "d": ("FLOAT", [math.hypot(p[0], p[2] - hz) for p in pts[0]])}, src, keep=keep)
    mk(0); mk(1)
    rows_of_buildings("G_rows", mat, seed=seed, x0=120, z0=40, z1=-600, h=(10, 26))
    def update(t):
        for m in words: stamp(m, t, m["s"], True)
        k = easeIO((t - t0) / max(1.0, hs - t0)); up = ease((t - hs) / 2.2)
        z = lerp(14, hz + 62, k)
        pos = (math.sin(t * .7) * 1.5, lerp(3.2, 7, k) + up * 30, z + up * 18)
        camera(pos, (0, lerp(1, 0, up), lerp(z - 44, hz, max(k * .4, up))), lerp(-.32, -.1, k) + .03 * math.sin(t), 62,
               (Vector(pos) - Vector((0, 0, hz))).length * lerp(.6, 1, up), 1.3)
    end_shot(t0, ground, update, words)

# ---- H: who can understand: crossing roads seen from high, the big word across a card at the junction --------------
def shot_understand(ln, ground, seed, yellow=0, until=None, outro=False):
    REG[0] = []; t0 = lcut(ln); mat = mat_on(ground); r = rng(seed)
    card = CARD[ground]; key = ON[card]
    for ang, w in ((.35, 10), (-.55, 8), (1.25, 5), (-1.3, 4)):
        g = Geo().boxc(700, 1.2, w); place(mesh_obj("H_road", g.mesh("H_road", [mat])), (0, .6, 0), (0, ang, 0))
    flat_card("H_card", 130, 46, card, (0, 1.3, 0), .35)
    big = ln[-1]; small = ln[:-1]
    words = [flat_word(w, key, 6, (-34 + i * 22, 1.36, -14), 1.0, .35) for i, w in enumerate(small)]
    for m in words: m.location = (Matrix.Rotation(.35, 4, "Y") @ Vector((-40 + 20 * words.index(m), 1.36, -15)))
    bigw = flat_word(big, "motif" if (card == "red" or yellow) else key, 1, (0, 1.36, 12), 1.0, .35); fit(bigw, 20, 100)
    bigw.location = Matrix.Rotation(.35, 4, "Y") @ Vector((0, 1.36, 14)); words.append(bigw)
    ring_of_buildings("H_rows", mat, seed, 85, 320, (10, 30))
    bs = big["s"]; end = until or (bs + 8)
    def update(t):
        for m in words: stamp(m, t, m["s"], True)
        k = easeIO((t - t0) / max(.5, bs - t0 + .6)); d = max(0.0, t - bs)
        h = lerp(150, 70, k) - min(d, 6) * 2; th = .4 + (t - t0) * .07
        if outro: h += max(0.0, t - (bs + 4)) ** 1.6 * 2.2
        pos = (math.sin(th) * lerp(8, 60, k), h, math.cos(th) * lerp(8, 60, k) + 4)
        camera(pos, (0, 0, 0), .5 * math.sin(th * .7), 50, Vector(pos).length, lerp(.6, 1.0, k))
    end_shot(t0, ground, update, words)

# ---- E, K: blocks rising out of the ground in a wave from the centre, cranes, a high orbit (instrumentals) --------
def shot_field(t0, ground, seed, dur, built=False):
    REG[0] = []; mat = mat_on(ground); r = rng(seed)
    unit = Geo().box(1, 1, 1, 0, 0, 0)
    pts, sx, sy, sz, ds = [], [], [], [], []
    for gx in range(-14, 15):
        for gz in range(-14, 15):
            if r() < .18: continue
            x, z = gx * 18 + (r() - .5) * 4, gz * 18 + (r() - .5) * 4; d = math.hypot(x, z)
            pts.append((x, 0, z, (r() - .5) * .3, 1)); sx.append(6 + r() * 8); sz.append(6 + r() * 8)
            sy.append((4 + r() ** 2 * 34) * (1.4 if d < 60 else 1)); ds.append(d)
    src = bpy.data.objects.new("E_unit_src", unit.mesh("E_unit", [motif_top(ground) if built else mat])); LIB.objects.link(src)
    def scl(ng, s):
        c = ng.nodes.new("ShaderNodeCombineXYZ"); ng.links.new(gattr(ng, "sx"), c.inputs["X"]); ng.links.new(gattr(ng, "sz"), c.inputs["Z"])
        ng.links.new(gmath(ng, "MAXIMUM", gmath(ng, "MULTIPLY", gattr(ng, "sy"), gwave(ng, t0 + .3, 26.0, 1.6)), .01), c.inputs["Y"])
        return c.outputs[0]
    gn_points("E_blocks", pts, {"ry": ("FLOAT", [p[3] for p in pts]), "scl": ("FLOAT", [1] * len(pts)), "sx": ("FLOAT", sx),
              "sy": ("FLOAT", sy), "sz": ("FLOAT", sz), "d": ("FLOAT", ds)}, src, scale=scl)
    flat_card("E_card", 520, 520, CARD[ground], (0, .02, 0), .2)
    cranes("E_cranes", mat, [(math.cos(a) * rad, math.sin(a) * rad, 2.6, a + 1) for a, rad in ((.3, 40), (2.2, 70), (4.0, 55), (5.3, 95))], seed)
    def update(t):
        k = (t - t0) / dur; th = .9 + k * 1.1
        pos = (math.sin(th) * lerp(190, 120, easeIO(k)), lerp(120, 70, easeIO(k)), math.cos(th) * lerp(190, 120, easeIO(k)))
        camera(pos, (0, 6, 0), -.18 + .1 * math.sin(t * .4), 48, Vector(pos).length * .8, .7)
    end_shot(t0, ground, update, [])

# ---- J: the long avenue: a low flight down a street of open gates (instrumental) --------------------------------------
def shot_avenue(t0, ground, seed, dur):
    REG[0] = []; mat = mat_on(ground); v = 32.0; L0 = 20; Lz = -(v * dur + 120)
    flat_card("J_card", 26, -Lz + L0, CARD[ground], (0, .02, (L0 + Lz) / 2))
    ow, oh, post, lint, D = 10, 13, 1.6, 4.6, 1.4
    frame = Geo().box(post, oh + lint, D, -(ow + post) / 2, 0, 0).box(post, oh + lint, D, (ow + post) / 2, 0, 0).box(ow + 2 * post, lint, D, 0, oh, 0)
    gz = [-30 - 52 * i for i in range(int(-Lz / 52))]
    instances("J_gates", frame.mesh("J_frame", [mat]), [(0, 0, z, 0, 1.6) for z in gz])
    lw = ow / 2 - .15
    for name, dx, sg in (("J_leafL", lw / 2, -1), ("J_leafR", -lw / 2, 1)):
        me = Geo().boxc(lw, oh - .2, .35, T(dx, oh / 2, 0)).mesh(name, [mat, FLAT["motif"]])
        for p in me.polygons: p.material_index = 1 if p.normal.z < -.9 else 0
        instances(name, me, [(sg * (ow / 2) * 1.6, 0, z, sg * 1.35, 1.6) for z in gz])
    for i, z in enumerate(range(-60, int(Lz), -110)):
        a = (.4 if i % 2 else -.35); w = 2.4
        place(mesh_obj("J_bar", Geo().plane(400, w).mesh("J_bar", [FLAT[ON[ground] if ground != "cream" else "black"]])), (0, .03, z), (-math.pi / 2, 0, a))
    rows_of_buildings("J_rows", mat, seed=seed, x0=26, z0=L0, z1=Lz, h=(9, 26))
    pyl, _ = model_mesh("pylon-a", 34, mat)
    instances("J_pylons", pyl, [((-1) ** i * 22, 0, -90 - i * 120, .3 * i, 1) for i in range(int(-Lz / 120))])
    def update(t):
        z = 10 - v * (t - t0); h = 5.5 + 1.5 * math.sin(t * .3)
        camera((math.sin(t * .5) * 2, h, z), (0, lerp(9, 3, .5 + .5 * math.sin(t * .23)), z - 50), -.3 * math.sin(t * .21), 64, 40, 1.2)
    end_shot(t0, ground, update, [])

# ---- I: the animals verse --------------------------------------------------------------------------------------------
def shot_animals_skim(ln, ground, seed):          # let us not eat animals: a card down a field of animals, skimmed low
    REG[0] = []; t0 = lcut(ln); mat = mat_on(ground); v = 19.0; lead = 32
    zc = lambda t: 14 - v * (min(t, ln[-1]["s"]) - t0) - (v * .9 * (1 - math.exp(-(t - ln[-1]["s"]) / .9)) if t > ln[-1]["s"] else 0)
    card = CARD[ground]; key = ON[card]
    flat_card("I_card", 24, 300, card, (0, .02, -120))
    words = []
    for i, w in enumerate(ln):
        last = i == len(ln) - 1
        m = flat_word(w, "motif" if (last and card == "red") else key, 5.6 if not last else 1, (0, .06, zc(w["s"]) - lead), 1.8)
        if last: fit(m, 9, 21)
        words.append(m)
    herd("I_herd", mat, (-130, 130, 30, -320), seed, avoid=lambda x, z: abs(x) < 17, d_to=(0, 0))
    def update(t):
        for m in words: stamp(m, t, m["s"], True)
        z = zc(t); camera((math.sin(t * .8) * 1.4, 4.6, z), (1.2, 1.5, z - 42), -.36 + .03 * math.sin(t * .7), 64, 34, 1.0)
    end_shot(t0, ground, update, words)

def shot_animals_hear(ln, ground, seed):          # let the animals hear: on the word, every animal turns to face us
    REG[0] = []; t0 = lcut(ln); mat = mat_on(ground); hs = ln[-1]["s"]
    card = CARD[ground]; key = ON[card]
    flat_card("I2_card", 110, 30, card, (0, .02, 22))
    words = [flat_word(w, key, 5.5, (-30 + i * 19, .06, 30), 1.0) for i, w in enumerate(ln[:-1])]
    big = flat_word(ln[-1], "motif" if card == "red" else key, 1, (0, .06, 18), 1.0); fit(big, 12, 60); words.append(big)
    def turn(ng, ry):
        e = gwave(ng, hs - .1, 90.0, .7)
        return gmath(ng, "ADD", ry, gmath(ng, "MULTIPLY", gmath(ng, "SUBTRACT", -math.pi / 2, ry), e))
    herd("I2_herd", mat, (-120, 120, 6, -230), seed, gap=(10, 10), rot=turn, d_to=(0, 0))
    rows_of_buildings("I2_rows", mat, seed=seed, x0=10, z0=-240, z1=-700, h=(10, 26))
    def update(t):
        for m in words: stamp(m, t, m["s"], True)
        k = easeIO((t - t0) / 4.5)
        pos = (lerp(-14, 10, k), lerp(26, 16, k), lerp(78, 58, k))
        camera(pos, (lerp(-4, 2, k), 1, lerp(0, -20, k)), lerp(.18, .06, k), 56, (Vector(pos) - Vector((0, 0, 0))).length, 1.2)
    end_shot(t0, ground, update, words)

def shot_animals_bars(ln, ground, seed):          # that the smell of human: people on one bar, animals on the other
    REG[0] = []; t0 = lcut(ln); mat = mat_on(ground); C = Vector((0, 0, -30)); BW, BH = 12, 1.4
    def bar(ang, y, w=BW):
        h = obj("I3_bar", None); place(h, (C.x, y, C.z), (0, ang, 0))
        place(mesh_obj("I3_barbox", Geo().boxc(360, BH, w).mesh("I3_barbox", [mat]), parent=h), (0, BH / 2, 0)); return h
    A, B = bar(.45, 0), bar(-.62, BH)
    words = []
    for i, w in enumerate(ln):
        m = word(w["w"], FLAT[ON[CARD[ground]] if ground == "red" else "cream"], parent=A)
        place(m, (-44 + i * 9.5 + (4 if i == len(ln) - 1 else 0), BH + .05, 4.2), (-math.pi / 2, 0, 0), (3.5, 3.5, 3.5))
        m["s"] = w["s"]; m["base"] = tuple(m.scale); WORD_TIMES.append(w["s"]); words.append(m)
    big = words[-1]; k = 7.5 / big["base"][0]; big.scale = tuple(b * k for b in big["base"]); big["base"] = tuple(big.scale)
    ppl = instances("I3_people", person_mesh(0, mat), [(-60 + i * 9, BH, -3.5, .2, 4.4) for i in range(14)]); ppl.parent = A
    # the animals stand along bar B
    pts, kinds, rys, scls = [], [], [], []
    rr = rng(seed)
    for i in range(16):
        pts.append((-70 + i * 9 + rr() * 2, 2 * BH, -3.0 + (rr() - .5) * 3)); kinds.append(math.floor(rr() * 6)); rys.append((rr() - .5) * .6); scls.append(4.2)
    hb = gn_points("I3_herd", pts, {"kind": ("INT", kinds), "ry": ("FLOAT", rys), "scl": ("FLOAT", scls)}, animal_lib(mat), pick=True); hb.parent = B
    hb.location = (0, -BH, 0)
    rows_of_buildings("I3_rows", mat, seed=seed, x0=2, z0=-200, z1=-800, h=(8, 24))
    def update(t):
        for m in words: stamp(m, t, m["s"], True)
        k = clamp((t - t0) / 4.4); th = lerp(-.5, .1, easeIO(k)); R = lerp(72, 58, easeIO(k)); hh = lerp(36, 27, easeIO(k))
        pos = Vector((C.x + R * math.sin(th), hh, C.z + R * math.cos(th)))
        camera(pos, (C.x - 6, 0, C.z - 4), lerp(.3, .14, easeIO(k)), 54, (pos - C).length, 1.0)
    end_shot(t0, ground, update, words)

def shot_rising_card(ln, ground, seed, mixed=False, prefix="D2"):
    """the verse-ending device Robin picked for verse 1: the line stacked far to near as a rising scale in the motif
    yellow on a deep card, a crowd (and here animals) standing around and thinned on the type"""
    REG[0] = []; t0 = lcut(ln); mat = mat_on(ground)
    cardZ, cardW, cardD, gapZ, stretch = -98, 176, 150, 5, 1.3
    flat_card(f"{prefix}_card", cardW, cardD, CARD[ground], (0, .02, cardZ))
    ws = list(ln); n = len(ws); caps = [lerp(14, 54, (i / (n - 1)) ** 1.4) for i in range(n)]
    z = cardZ + cardD / 2 - 6; words = []
    for i in range(n - 1, -1, -1):
        m = word(ws[i]["w"], FLAT["motif" if CARD[ground] == "red" else "black"]); c = min(caps[i], cardW * .86 / m["width"])
        st = stretch if i < n - 1 else 1.0
        place(m, (0, .06, z), (-math.pi / 2, 0, 0), (c, c * st, c)); z -= c * st + gapZ
        m["s"] = ws[i]["s"]; m["base"] = tuple(m.scale); WORD_TIMES.append(ws[i]["s"]); words.append(m)
    on_card = lambda x, z: abs(x) < cardW / 2 and abs(z - cardZ) < cardD / 2
    crowd(f"{prefix}_crowd", mat, (-180, 180, 12, -300), seed, avoid=lambda x, z: .6 if on_card(x, z) else 0, thin=.12)
    if mixed: herd(f"{prefix}_herd", mat, (-170, 170, 6, -290), seed + 3, avoid=on_card, thin=.55, gap=(16, 16))
    rows_of_buildings(f"{prefix}_rows", mat, seed=seed, x0=2, z0=-320, z1=-1000, h=(10, 30))
    def update(t):
        for m in words: stamp(m, t, m["s"], True)
        rise = ease((t - t0) / 3.8); drift = max(0, t - t0 - 3.8)
        pos = Vector((math.sin(t * .6) * 1.5, lerp(2.4, 100, rise) + drift * 2, lerp(16, 50, rise) + drift * 1.5))
        camera(pos, (0, lerp(3, 0, rise), lerp(-50, cardZ + 2, rise)), lerp(-.36, -.07, rise), 54, (pos - Vector((0, 0, cardZ))).length, lerp(1.6, .6, rise))
    end_shot(t0, ground, update, words)

# ---- L: the flags verse: bare flagpoles, never a flag ------------------------------------------------------------------
POLE = {}
def pole_mesh(mat):
    if mat.name not in POLE: g = Geo(); props.flagpole(g, 14.0); POLE[mat.name] = g.mesh("pole_" + mat.name, [mat])
    return POLE[mat.name]

def shot_poles_skim(ln, ground, seed):            # let there be no flags: an avenue of bare masts, the line down its card
    REG[0] = []; t0 = lcut(ln); mat = mat_on(ground); v = 17.0; lead = 30
    zc = lambda t: 14 - v * (min(t, ln[-1]["s"]) - t0) - (v * .9 * (1 - math.exp(-(t - ln[-1]["s"]) / .9)) if t > ln[-1]["s"] else 0)
    card = CARD[ground]; key = ON[card]
    flat_card("L_card", 22, 320, card, (0, .02, -130))
    words = []
    for i, w in enumerate(ln):
        last = i == len(ln) - 1; m = flat_word(w, key, 5.6, (0, .06, zc(w["s"]) - lead), 1.8)
        if last: fit(m, 9, 20)
        words.append(m)
    items = []
    for side in (-1, 1):
        for row in range(6):
            for i in range(40): items.append((side * (16 + row * 9), 0, 20 - i * 10 - row * 3, 0, 1.0 + row * .08))
    instances("L_poles", pole_mesh(mat), items)
    rows_of_buildings("L_rows", mat, seed=seed, x0=75, z0=20, z1=-600, h=(10, 26))
    def update(t):
        for m in words: stamp(m, t, m["s"], True)
        z = zc(t); camera((math.sin(t * .8), 3.8, z), (1.0, 4.5, z - 40), -.34 + .03 * math.sin(t * .7), 66, 32, 1.3)
    end_shot(t0, ground, update, words)

def shot_poles_field(ln, ground, seed):           # to make us pretend: the masts from above, slowly turning
    REG[0] = []; t0 = lcut(ln); mat = mat_on(ground); r = rng(seed)
    card = CARD[ground]; key = ON[card]
    flat_card("L2_card", 120, 34, card, (0, .02, 0), -.3)
    words = []
    for i, w in enumerate(ln):
        m = flat_word(w, key, 8 if i == len(ln) - 1 else 6, (0, .06, 0), 1.0, -.3); words.append(m)
    xs = [-48, -22, 4, 34]
    for i, m in enumerate(words): m.location = Matrix.Rotation(-.3, 4, "Y") @ Vector((xs[i] if i < 4 else 0, .06, 6))
    if words: fit(words[-1], 9, 46)
    items = [(gx * 11 + (r() - .5) * 2, 0, gz * 11 + (r() - .5) * 2, 0, 1.0) for gx in range(-16, 17) for gz in range(-16, 17)
             if not (abs(gx) < 7 and abs(gz) < 3)]
    instances("L2_poles", pole_mesh(mat), items)
    def update(t):
        for m in words: stamp(m, t, m["s"], True)
        k = (t - t0) / 4.6; th = -.6 + k * .5
        pos = (math.sin(th) * 30, lerp(95, 70, easeIO(k)), math.cos(th) * 30 + 10)
        camera(pos, (0, 0, 0), th * .8, 52, Vector(pos).length, .9)
    end_shot(t0, ground, update, words)

def shot_two_crowds(ln, ground, seed, cross=False):   # that we are different / than the other men: two crowds face off
    REG[0] = []; t0 = lcut(ln); mat = mat_on(ground)
    g = Geo().boxc(400, 1.2, 10); place(mesh_obj("L3_bar", g.mesh("L3_bar", [mat])), (0, .6, 0))
    words = []
    for i, w in enumerate(ln):
        last = i == len(ln) - 1
        m = word(w["w"], FLAT[{"cream": "cream", "red": "black", "black": "cream"}[ground]])
        if cross:
            c = 4.6 if not last else 6.4; place(m, (-34 + i * 13 + (5 if last else 0), 1.25, 2.6), (-math.pi / 2, 0, 0), (c, c, c))
        else:   # read down the bar from a camera at its end, stretched like verse 1's street words
            c = min(4.2 if not last else 6, 8.6 / m["width"])
            place(m, (-52 + i * 15 + (4 if last else 0), 1.25, 0), (-math.pi / 2, 0, -math.pi / 2), (c, c * 1.8, c))
        m["s"] = w["s"]; m["base"] = tuple(m.scale); WORD_TIMES.append(w["s"]); words.append(m)
    crowd("L3_near", mat, (-150, 150, 60, 9), seed, face=lambda x, z: math.pi, gap=(5.5, 6.5))
    crowd("L3_far", mat, (-150, 150, -9, -60), seed, face=lambda x, z: 0.0, gap=(5.5, 6.5))
    rows_of_buildings("L3_rows", mat, seed=seed, x0=2, z0=-90, z1=-700, h=(10, 26))
    def update(t):
        for m in words: stamp(m, t, m["s"], True)
        k = easeIO((t - t0) / 4.2)
        if cross:
            pos = Vector((lerp(-60, 30, k), lerp(9, 34, k), lerp(26, -30, k)))
            camera(pos, (lerp(-10, 10, k), 0, lerp(0, -8, k)), lerp(.2, -.25, k), 58, (pos - Vector((0, 0, 0))).length, 1.1)
        else:
            pos = Vector((-84 + 18 * k, 7.5, 6 + 2 * k))
            camera(pos, (pos.x + 40, 1.2, 0), -.3, 60, 34, .9)
    end_shot(t0, ground, update, words)

# ---------------------------------------------------------------------------------------------------------------------
def build_song_shots():
    """after shot_a..shot_d (verse 1). Grounds flip at every cut: cream, cobalt, charcoal."""
    shot_field(21.0, "red", 101, lcut(SL[4]) - 21.0)
    shot_blocks(SL[4], "black", 11, yellow=0)
    shot_hands(SL[5], "cream", 12)
    shot_blocks(SL[6], "red", 13, yellow=1)
    shot_understand(SL[7], "black", 14, until=lcut(SL[8]))
    shot_animals_skim(SL[8], "cream", 21)
    shot_animals_hear(SL[9], "red", 22)
    shot_animals_bars(SL[10], "black", 23)
    shot_rising_card(SL[11], "cream", 24, mixed=True, prefix="I4")
    shot_blocks(SL[12], "red", 31, yellow=1)
    shot_hands(SL[13], "black", 32)
    shot_blocks(SL[14], "cream", 33, yellow=2)
    shot_understand(SL[15], "red", 34, until=112.0)
    shot_avenue(112.0, "cream", 41, lcut(SL[16]) - 112.0)
    shot_hands(SL[16], "black", 51)
    shot_blocks(SL[17], "red", 52, yellow=2)
    shot_blocks(SL[18], "cream", 53, yellow=2)
    shot_blocks(SL[19], "black", 54, yellow=3)
    shot_blocks(SL[20], "red", 55, yellow=3)
    shot_field(154.5, "cream", 102, lcut(SL[21]) - 154.5, built=True)
    shot_poles_skim(SL[21], "red", 61)
    shot_poles_field(SL[22], "cream", 62)
    shot_two_crowds(SL[23], "black", 63)
    shot_two_crowds(SL[24], "red", 64, cross=True)
    shot_blocks(SL[25], "cream", 71, yellow=3)
    shot_hands(SL[26], "red", 72)
    shot_blocks(SL[27], "black", 73, yellow=3)
    shot_understand(SL[28], "cream", 74, yellow=1, until=F_LAST / FPS + 1, outro=True)
