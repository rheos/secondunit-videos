# Take 07 "Respawn": a Real Thing look test (song 21.0-49.29 s, frames 504-1183), Blender 4.5 LTS, EEVEE.
#
# A voxel game village. The shopkeeper sells the same sword to hero after hero; each time it respawns on the wall.
# His smile goes flat. He looks off, steps out from behind the counter for the first time, walks past the last
# houses to the edge of the map, steps off onto the void's grid, and walks to a wall of grid with a glowing crack.
# The crack opens on a real sunrise: smooth geometry kept sharp through the pixel look by a cryptomatte list.
#
#   blender -b --factory-startup --python realthing_respawn.py -- --stills 520,640,760,880,1000,1120
#   blender -b --factory-startup --python realthing_respawn.py -- --render
# Frames land in out/film/take-07/frames/ (named by song frame). Helpers in film_kit.py and canvas_kit.py.
import bpy, bmesh, math, os, sys, random, zlib
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
sys.path.insert(0, HERE)
from canvas_kit import reset, hex_lin, tex_image, mat, specks, stripes, box, blocks, empty
from film_kit import film_setup, sec, shot_camera, cut, key, pixel_look, run

OUT = os.path.join(HERE, "out", "film", "take-07")
F0, F1 = 504, 1183
scene = reset()
film_setup(OUT, F0, F1)
R = math.radians
EDGE = 50.0                     # the map ends at x = EDGE
VOIDZ = -0.6                    # the void floor, a step below the grass
WX, Y5 = 300.0, -600.0          # the crack wall (plane x = WX), centred at y = Y5, far out in the void

def seed(s): return zlib.crc32(s.encode()) % 997
def clamp(v, a=0., b=1.): return max(a, min(b, v))
def lerp(a, b, u): return a + (b - a) * u
def ease(u): u = clamp(u); return u * u * (3 - 2 * u)
def seg(f, a, b): return clamp((f - a) / float(b - a))
def V3(a, b, u): return tuple(lerp(a[i], b[i], u) for i in range(3))

# ---------- palette ----------
M = dict(
    grass=mat("grass", "#7fa35a", .10, 2, texel=.1, pattern=specks("#93b86a", "#6b8f4a", .12)),
    dirt=mat("dirt", "#8a5a3a", .12, 3, texel=.1, pattern=specks("#8d877e", "#6b4a32", .08)),
    sand=mat("sand", "#e6c98a", .07, 4, texel=.1, pattern=specks("#d6b574", "#f0dcaa", .1)),
    red=mat("red", "#c8341e", .05, 5, texel=.05),
    awning=mat("awning", "#c8341e", 0, 6, texel=.08, pattern=stripes("#c8341e", "#f3ead2")),
    cream=mat("cream", "#f3ead2", .04, 7, texel=.05),
    wood=mat("wood", "#9a6a3e", .08, 8, texel=.06, pattern=stripes("#9a6a3e", "#8a5c34", 3)),
    wood2=mat("wood2", "#6b4a2e", .08, 9, texel=.05),
    plank=mat("plank", "#b98552", .06, 10, texel=.06, pattern=stripes("#b98552", "#a87646", 4)),
    plaster=mat("plaster", "#f3ead2", .05, 11, texel=.08),
    plaster2=mat("plaster2", "#efd8a8", .05, 12, texel=.08),
    roof=mat("roof", "#a2462e", .07, 13, texel=.08, pattern=stripes("#a2462e", "#8c3b26", 2)),
    roof2=mat("roof2", "#3f6f8f", .07, 14, texel=.08, pattern=stripes("#3f6f8f", "#355e7a", 2)),
    glass=mat("glass", "#2e3f5c", .05, 15, texel=.05),
    trunk=mat("trunk", "#8b6a43", .10, 16, texel=.06),
    leaf=mat("leaf", "#4f8a4a", .12, 17, texel=.08, pattern=specks("#6aa356", "#3f7440", .2)),
    leaf2=mat("leaf2", "#6aa356", .10, 18, texel=.08, pattern=specks("#7fb860", "#4f8a4a", .2)),
    stone=mat("stone", "#8d8a86", .10, 19, texel=.06),
    steel=mat("steel", "#d9e3ea", .03, 20, texel=.04, rough=.35),
    gold=mat("gold", "#e8b23a", .05, 21, texel=.04, rough=.4, emit=.15),
    grip=mat("grip", "#6b3f22", .05, 22, texel=.04),
    ink=mat("ink", "#1e1a14", 0, 23, texel=.04),
    flowR=mat("flowR", "#e0483a", .05, 24, texel=.05), flowY=mat("flowY", "#f2cf3a", .05, 25, texel=.05),
    flowW=mat("flowW", "#f7f3ea", .03, 26, texel=.05),
    cloudv=mat("cloudv", "#ffffff", .03, 27, texel=.1, emit=.9), cloudv2=mat("cloudv2", "#e3ecf5", .03, 28, texel=.1, emit=.9),
    spark=mat("spark", "#fff6c8", 0, 29, texel=.05, emit=3.0),
    pink=mat("pink", "#e88a86", .02, 30, texel=.04),
)

# ---------- smooth materials (the real world, and the backdrops) ----------
def new_mat(name):
    m = bpy.data.materials.new("CL_" + name); m.use_nodes = True; m.node_tree.nodes.clear(); return m, m.node_tree

def ramp_fill(ramp, stops):
    el = ramp.color_ramp.elements
    el[0].position, el[0].color = stops[0][0], (*hex_lin(stops[0][1]), 1)
    el[1].position, el[1].color = stops[-1][0], (*hex_lin(stops[-1][1]), 1)
    for p, h in stops[1:-1]:
        e = el.new(p); e.color = (*hex_lin(h), 1)

def grad_mat(name, stops, axis, lo, hi, strength=1.0, interp="EASE"):
    """unlit emission, coloured by world position along `axis` (0 x, 1 y, 2 z) from lo to hi"""
    m, nt = new_mat(name)
    out = nt.nodes.new("ShaderNodeOutputMaterial"); em = nt.nodes.new("ShaderNodeEmission")
    geo = nt.nodes.new("ShaderNodeNewGeometry"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    mr = nt.nodes.new("ShaderNodeMapRange"); rp = nt.nodes.new("ShaderNodeValToRGB")
    mr.inputs["From Min"].default_value = lo; mr.inputs["From Max"].default_value = hi
    rp.color_ramp.interpolation = interp; ramp_fill(rp, stops)
    nt.links.new(geo.outputs["Position"], sep.inputs[0]); nt.links.new(sep.outputs[axis], mr.inputs["Value"])
    nt.links.new(mr.outputs["Result"], rp.inputs["Fac"]); nt.links.new(rp.outputs["Color"], em.inputs["Color"])
    em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs[0], out.inputs["Surface"])
    return m

def soft_mat(name, stops, lo, hi, alpha=1.0, power=1.6, strength=1.0):
    """an unlit, soft-edged blob: emission graded on world z, alpha falling off toward the silhouette"""
    m, nt = new_mat(name)
    try: m.surface_render_method = "BLENDED"
    except Exception: pass
    try: m.blend_method = "BLEND"
    except Exception: pass
    out = nt.nodes.new("ShaderNodeOutputMaterial"); em = nt.nodes.new("ShaderNodeEmission")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mix = nt.nodes.new("ShaderNodeMixShader")
    geo = nt.nodes.new("ShaderNodeNewGeometry"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    mr = nt.nodes.new("ShaderNodeMapRange"); rp = nt.nodes.new("ShaderNodeValToRGB")
    mr.inputs["From Min"].default_value = lo; mr.inputs["From Max"].default_value = hi
    rp.color_ramp.interpolation = "EASE"; ramp_fill(rp, stops)
    lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = .5
    inv = nt.nodes.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0
    pw = nt.nodes.new("ShaderNodeMath"); pw.operation = "POWER"; pw.inputs[1].default_value = power
    mul = nt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; mul.inputs[1].default_value = alpha
    nt.links.new(geo.outputs["Position"], sep.inputs[0]); nt.links.new(sep.outputs[2], mr.inputs["Value"])
    nt.links.new(mr.outputs["Result"], rp.inputs["Fac"]); nt.links.new(rp.outputs["Color"], em.inputs["Color"])
    em.inputs["Strength"].default_value = strength
    nt.links.new(lw.outputs["Facing"], inv.inputs[1]); nt.links.new(inv.outputs[0], pw.inputs[0])
    nt.links.new(pw.outputs[0], mul.inputs[0]); nt.links.new(mul.outputs[0], mix.inputs["Fac"])
    nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(em.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    return m

def grid_mat(name, cell=1.2, base="#18213f", line="#8fe3ff", strength=.75, fade=(25., 150.)):
    """the void: a dark navy surface with 1-pixel pale lines every `cell` metres (16 px image, Closest), the
    lines emitting low and fading out with camera depth so the floor dissolves into the dark"""
    img = bpy.data.images.new("CL_img_" + name, 16, 16, alpha=False)
    img.pixels = [v for y in range(16) for x in range(16) for v in ((1., 1., 1., 1.) if (x == 0 or y == 0) else (0., 0., 0., 1.))]
    img.pack()
    m, nt = new_mat(name)
    out = nt.nodes.new("ShaderNodeOutputMaterial"); bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = .9
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
    s = 1 / cell; mp.inputs["Scale"].default_value = (s, s, s)
    im = nt.nodes.new("ShaderNodeTexImage"); im.image = img; im.interpolation = "Closest"; im.projection = "BOX"; im.extension = "REPEAT"
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"]); nt.links.new(mp.outputs["Vector"], im.inputs["Vector"])
    mixc = nt.nodes.new("ShaderNodeMixRGB"); mixc.inputs[1].default_value = (*hex_lin(base), 1)
    mixc.inputs[2].default_value = (*[c * .45 for c in hex_lin(line)], 1)
    nt.links.new(im.outputs["Color"], mixc.inputs["Fac"]); nt.links.new(mixc.outputs[0], bsdf.inputs["Base Color"])
    bsdf.inputs["Emission Color"].default_value = (*hex_lin(line), 1)
    cam = nt.nodes.new("ShaderNodeCameraData"); mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = fade[0]; mr.inputs["From Max"].default_value = fade[1]
    mr.inputs["To Min"].default_value = strength; mr.inputs["To Max"].default_value = 0.0
    nt.links.new(cam.outputs["View Z Depth"], mr.inputs["Value"])
    sep = nt.nodes.new("ShaderNodeSeparateColor"); nt.links.new(im.outputs["Color"], sep.inputs[0])
    mul = nt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY"
    nt.links.new(sep.outputs[0], mul.inputs[0]); nt.links.new(mr.outputs["Result"], mul.inputs[1])
    nt.links.new(mul.outputs[0], bsdf.inputs["Emission Strength"])
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return m

def plane(name, corners, material):
    """a single quad with its vertices in world space (object at the origin), so world-position shaders work"""
    me = bpy.data.meshes.new("CL_" + name); me.from_pydata([Vector(c) for c in corners], [], [(0, 1, 2, 3)])
    ob = bpy.data.objects.new("CL_" + name, me); scene.collection.objects.link(ob); me.materials.append(material)
    return ob

def sphere(name, loc, radius, material, scale=(1, 1, 1), segs=64):
    me = bpy.data.meshes.new("CL_" + name); bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=segs // 2, radius=radius)
    bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    ob = bpy.data.objects.new("CL_" + name, me); scene.collection.objects.link(ob); me.materials.append(material)
    ob.location = loc; ob.scale = scale
    return ob

# ---------- visibility, keyed only where it changes ----------
VIS = {}
def vis(ob, f, on):
    for o in [ob] + list(ob.children_recursive):
        if VIS.get(o.name) == on: continue
        VIS[o.name] = on
        o.hide_render = not on; o.keyframe_insert("hide_render", frame=f)
        o.hide_viewport = not on; o.keyframe_insert("hide_viewport", frame=f)

# ======================================================================================================
# the village
# ======================================================================================================
box("grassTop", (EDGE + 90, 120, .25), ((EDGE - 90) / 2, -20, -.125), M["grass"])
box("dirt", (EDGE + 90, 120, 1.2), ((EDGE - 90) / 2, -20, -.85), M["dirt"])
box("path", (EDGE + 90, 2.0, .2), ((EDGE - 90) / 2, -1.6, -.08), M["sand"])     # top at z = .02

# the sky is a painted wall that ends where the map ends
plane("skyWall", [(-90, 40, -1.5), (EDGE, 40, -1.5), (EDGE, 40, 90), (-90, 40, 90)],
      grad_mat("skyDay", [(0, "#d8f1ec"), (.12, "#a8dcf0"), (.35, "#6db4ea"), (1, "#3f86d8")], 2, 0, 60))
# and while we are inside the village, its east side is painted too (taken away for the edge shots)
skyEnd = plane("skyEnd", [(EDGE + .05, -90, -1.5), (EDGE + .05, 40, -1.5), (EDGE + .05, 40, 90), (EDGE + .05, -90, 90)],
               bpy.data.materials["CL_skyDay"])
def vcloud(nm, x, z, w):
    parts = [((w, 1, 1.2), (0, 0, 0)), ((w * .55, 1, .8), (-w * .12, 0, .9)), ((w * .3, 1, .6), (w * .25, 0, .7))]
    clipped = []
    for (sx, sy, sz), (lx, ly, lz) in parts:
        a, b = x + lx - sx / 2, x + lx + sx / 2
        b = min(b, EDGE)                                    # a cloud cut clean off by the end of the map
        if b > a: clipped.append(((b - a, sy, sz), ((a + b) / 2, 38.5, z + lz)))
    blocks(nm, clipped, M["cloudv"])
for i, (x, z, w) in enumerate(((-14, 13, 7), (2, 16, 9), (18, 12, 6), (33, 15, 8), (47.5, 11, 7))):
    vcloud(f"vcloud{i}", x, z, w)

# ----- the stall -----
box("counter", (2.4, .8, 1.0), (0, 0, .5), M["wood"])
box("counterTop", (2.6, .95, .1), (0, 0, 1.05), M["plank"])               # top surface z = 1.10
box("backWall", (2.7, .1, 1.95), (0, 1.32, 1.0), M["plank"])
for sx in (-1.4, 1.4):
    for sy in (-.45, 1.32):
        box(f"post{sx}{sy}", (.14, .14, 2.55), (sx, sy, 1.275), M["wood2"])
aw = empty("awning", (0, .43, 2.6)); aw.rotation_euler = (R(-12), 0, 0)
box("awnTop", (3.1, 2.3, .1), (0, 0, 0), M["awning"], aw)
for i in range(8):
    box(f"awnScal{i}", (.3875, .06, .22 if i % 2 == 0 else .16), (-1.55 + .19375 + i * .3875, -1.15, -.13), M["red"] if i % 2 == 0 else M["cream"], aw)
box("crate1", (.7, .7, .7), (-2.0, .3, .35), M["plank"]); box("crate2", (.55, .55, .55), (-2.05, .35, .975), M["wood"])
box("barrel", (.6, .6, .85), (-2.2, -.45, .425), M["wood2"]); box("barrelBand", (.64, .64, .08), (-2.2, -.45, .55), M["stone"])
for k, sy in enumerate((.98, 1.48)):
    box(f"peg{k}", (.06, .08, .06), (.70, 1.24, sy), M["ink"])

# ----- swords: grip at the root, blade up its +z -----
def sword(nm, parent=None, loc=(0, 0, 0), rot=None):
    r = empty(nm, loc, parent)
    if rot: r.rotation_euler = rot
    box(nm + "_pommel", (.08, .08, .06), (0, 0, -.11), M["gold"], r)
    box(nm + "_grip", (.05, .05, .18), (0, 0, 0), M["grip"], r)
    box(nm + "_guard", (.28, .06, .05), (0, 0, .11), M["gold"], r)
    box(nm + "_blade", (.075, .03, .64), (0, 0, .45), M["steel"], r)
    box(nm + "_tip", (.04, .03, .06), (0, 0, .8), M["steel"], r)
    return r
WALL_SWORD = Vector((.70, 1.235, 1.06))
wallSword = sword("wallSword", loc=tuple(WALL_SWORD))
flySword = sword("flySword", loc=(0, 0, -50))

# ----- houses, trees, fences, flowers -----
def house(nm, x, y, w, d, h, wall, roof, door=True):
    box(nm + "_walls", (w, d, h), (x, y, h / 2), M[wall])
    for i in range(4):
        box(f"{nm}_roof{i}", (w + .4, (d + .5) * (1 - i / 4.2), .34), (x, y, h + .17 + .34 * i), M[roof])
    box(nm + "_chim", (.4, .4, 1.0), (x + w * .28, y + d * .15, h + 1.0), M["stone"])
    fy = y - d / 2 - .03
    if door: box(nm + "_door", (.62, .06, 1.15), (x - w * .18, fy, .575), M["wood2"])
    for wx_ in ((x + w * .22,) if door else (x - w * .2, x + w * .2)):
        box(nm + f"_winF{wx_:.1f}", (.66, .05, .66), (wx_, fy, h * .55), M["cream"])
        box(nm + f"_win{wx_:.1f}", (.46, .06, .46), (wx_, fy - .01, h * .55), M["glass"])
HOUSES = [(-11, 7.5, 4.0, 3.2, 2.6, "plaster", "roof"), (-5.6, 9.5, 3.6, 3.0, 3.0, "plaster2", "roof2"),
          (4.6, 7.8, 3.8, 3.2, 2.8, "plaster2", "roof"), (10.2, 10.5, 4.2, 3.4, 3.2, "plaster", "roof2"),
          (15.8, 7.2, 3.4, 3.0, 2.5, "plaster", "roof"), (21.5, 9.8, 3.2, 2.8, 2.4, "plaster2", "roof2")]
for i, h in enumerate(HOUSES): house(f"house{i}", *h)
def tree(nm, x, y, s=1.0):
    box(nm + "_trunk", (.36 * s, .36 * s, 1.7 * s), (x, y, .85 * s), M["trunk"])
    blocks(nm + "_crown", [((1.9 * s, 1.9 * s, 1.3 * s), (x, y, 2.25 * s)), ((1.3 * s, 1.3 * s, .8 * s), (x, y, 3.25 * s)),
                           ((.6 * s, 2.3 * s, .7 * s), (x, y, 2.1 * s)), ((2.3 * s, .6 * s, .7 * s), (x, y, 2.0 * s))], M["leaf"])
    box(nm + "_top", (.9 * s, .9 * s, .4 * s), (x + .1, y - .1, 3.75 * s), M["leaf2"])
for i, (x, y, s) in enumerate(((-14, 4.5, 1.1), (-8.2, 3.6, .9), (1.8, 12.5, 1.2), (7.4, 4.4, 1.0), (13.2, 4.0, 1.1),
                               (-3.2, 4.2, .8), (18.8, 4.6, 1.0), (24.6, 5.2, .9), (29.8, 3.8, .75), (36.5, 4.6, .55),
                               (-12, -6.5, 1.0), (9, -7.5, 1.1), (16, -6.0, .9))):
    tree(f"tree{i}", x, y, s)
fence = []
for x in [3.0 + 1.2 * i for i in range(11)] + [17.0, 18.2, 19.4, 23.0, 24.2, 30.0]:
    fence.append(((.12, .12, .8), (x, -.4, .4)))
for x0, x1 in ((3.0, 15.0), (17.0, 19.4), (23.0, 24.2)):
    fence.append(((x1 - x0, .06, .1), ((x0 + x1) / 2, -.4, .62))); fence.append(((x1 - x0, .06, .1), ((x0 + x1) / 2, -.4, .32)))
blocks("fence", fence, M["wood2"])
rf = random.Random(11); fl = {"flowR": [], "flowY": [], "flowW": []}
for i in range(140):
    x = rf.uniform(-16, 42); y = rf.choice([rf.uniform(-4.6, -2.9), rf.uniform(-.1, 6)])
    if -2.3 < x < 2.3 and -1 < y < 2: continue
    if x > 26 and rf.random() < .6: continue                       # the meadow thins out toward the edge
    fl[rf.choice(list(fl))].append(((.14, .14, .14), (x, y, .07)))
for k, parts in fl.items(): blocks("flowers_" + k, parts, M[k])
box("signPole", (.12, .12, 2.2), (-6.5, -.2, 1.1), M["wood2"])
box("pennant", (.9, .05, .5), (-6.0, -.2, 1.9), M["awning"])

# ======================================================================================================
# the void and the crack wall
# ======================================================================================================
GRID = grid_mat("grid")
box("voidA", (WX + 100, 6000, .2), ((WX - .2 - 100) / 2, 0, VOIDZ - .1), GRID)
box("voidB", (3000, 3000, .2), (WX + 1500, Y5 + 300 + 1500, VOIDZ - .1), GRID)

rc = random.Random(7); CP = []; z = VOIDZ
while z < 45: CP.append((z, rc.uniform(-.26, .26))); z += rc.uniform(.22, .55)
def crack_c(zq):
    for (za, ca), (zb, cb) in zip(CP, CP[1:]):
        if za <= zq <= zb: return lerp(ca, cb, (zq - za) / (zb - za))
    return 0.0
lo_parts, hi_parts, SH, RIMC = [], [], .1, []
for k in range(int((44 - VOIDZ) / SH)):
    zc = VOIDZ + (k + .5) * SH; c = round(crack_c(zc) / .05) * .05
    RIMC.append((zc, c))
    lo_parts.append(((.4, 50 + c, SH), (WX, Y5 - 50 + (50 + c) / 2, zc)))
    hi_parts.append(((.4, 50 - c, SH), (WX, Y5 + c + (50 - c) / 2, zc)))
GRIDW = grid_mat("gridWall", strength=.42, fade=(20., 90.))
wallLo = blocks("wallLo", lo_parts, GRIDW); wallHi = blocks("wallHi", hi_parts, GRIDW)
RIM = mat("rim", "#ffc890", .04, 31, texel=.05, emit=1.6)
rimLo = blocks("rimLo", [((.44, .07, SH), (WX, Y5 + c[1] - .035, c[0])) for c in RIMC], RIM)
rimHi = blocks("rimHi", [((.44, .07, SH), (WX, Y5 + c[1] + .035, c[0])) for c in RIMC], RIM)

# ---------- the real sunrise (smooth, kept sharp) ----------
CAM5 = Vector((WX - 9.3, Y5 - 1.35, 1.85))          # the last shot's camera, middle of its move
SUN_D, SUN_EL, SUN_R = 560.0, 2.6, 3.0             # distance behind the wall, elevation and radius (degrees)
dirn = (Vector((WX, Y5 + .1, 0)) - Vector((CAM5.x, CAM5.y, 0))).normalized()
sun_xy = Vector((CAM5.x, CAM5.y, 0)) + dirn * (WX + SUN_D - CAM5.x) / dirn.x
dist = (sun_xy - Vector((CAM5.x, CAM5.y, 0))).length
SUNP = Vector((sun_xy.x, sun_xy.y, CAM5.z + dist * math.tan(R(SUN_EL))))
SUNRAD = dist * math.tan(R(SUN_R))
SR = []
SR.append(plane("sr_sky", [(WX + 620, Y5 - 600, -20), (WX + 620, Y5 + 600, -20), (WX + 620, Y5 + 600, 420), (WX + 620, Y5 - 600, 420)],
                grad_mat("srSky", [(0, "#ffd88a"), (.05, "#ffb36b"), (.16, "#f39a7f"), (.34, "#d7848f"), (.6, "#a87a9c"), (1, "#6f6a98")], 2, VOIDZ, 200)))
def sea_mat():
    m, nt = new_mat("srSea")
    out = nt.nodes.new("ShaderNodeOutputMaterial"); em = nt.nodes.new("ShaderNodeEmission")
    geo = nt.nodes.new("ShaderNodeNewGeometry"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(geo.outputs["Position"], sep.inputs[0])
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = WX; mr.inputs["From Max"].default_value = WX + 600
    rp = nt.nodes.new("ShaderNodeValToRGB"); rp.color_ramp.interpolation = "EASE"
    ramp_fill(rp, [(0, "#3b3a68"), (.25, "#5d4a78"), (.55, "#a8667f"), (.85, "#e8957a"), (1, "#ffc48a")])
    nt.links.new(sep.outputs[0], mr.inputs["Value"]); nt.links.new(mr.outputs["Result"], rp.inputs["Fac"])
    # the sun's path on the water: distance from the camera-sun line in plan, widening with distance
    k = (SUNP.y - CAM5.y) / (SUNP.x - CAM5.x)
    def M_(op, a=None, b=None):
        n = nt.nodes.new("ShaderNodeMath"); n.operation = op
        for i, v in enumerate((a, b)):
            if v is None: continue
            if isinstance(v, (int, float)): n.inputs[i].default_value = v
            else: nt.links.new(v, n.inputs[i])
        return n.outputs[0]
    dx = M_("SUBTRACT", sep.outputs[0], CAM5.x)
    liney = M_("ADD", M_("MULTIPLY", dx, k), CAM5.y)
    d = M_("ABSOLUTE", M_("SUBTRACT", sep.outputs[1], liney))
    w = M_("ADD", M_("MULTIPLY", dx, .035), .2)
    g = M_("POWER", M_("SUBTRACT", 1.0, M_("MINIMUM", M_("DIVIDE", d, w), 1.0)), 2.0)
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = .25; nz.inputs["Detail"].default_value = 1.0
    nt.links.new(geo.outputs["Position"], nz.inputs["Vector"])
    shimmer = M_("ADD", M_("MULTIPLY", nz.outputs["Fac"], .9), .35)
    gfac = M_("MINIMUM", M_("MULTIPLY", g, shimmer), 1.0)
    mix = nt.nodes.new("ShaderNodeMixRGB"); mix.inputs[2].default_value = (*hex_lin("#ffd98e"), 1)
    nt.links.new(gfac, mix.inputs["Fac"]); nt.links.new(rp.outputs["Color"], mix.inputs[1])
    nt.links.new(mix.outputs[0], em.inputs["Color"]); nt.links.new(em.outputs[0], out.inputs["Surface"])
    return m
SR.append(plane("sr_sea", [(WX + .21, Y5 - 500, VOIDZ - .3), (WX + 610, Y5 - 500, VOIDZ - .3), (WX + 610, Y5 + 500, VOIDZ - .3), (WX + .21, Y5 + 500, VOIDZ - .3)], sea_mat()))
hp = CAM5 + (SUNP - CAM5) * .82                        # the halo sits nearer than the sun, clear of the sky wall
hm = soft_mat("srHalo", [(0, "#ffd27a"), (1, "#ffb36b")], 0, 1, alpha=.5, power=2.6); hm.use_backface_culling = True
SR.append(sphere("sr_halo", hp, SUNRAD * 3.0 * .82, hm))
m, nt = new_mat("srSun")
out = nt.nodes.new("ShaderNodeOutputMaterial"); em = nt.nodes.new("ShaderNodeEmission"); lw = nt.nodes.new("ShaderNodeLayerWeight")
mx = nt.nodes.new("ShaderNodeMixRGB"); mx.inputs[1].default_value = (*hex_lin("#ffd27a"), 1); mx.inputs[2].default_value = (*hex_lin("#fff6e0"), 1)
lw.inputs["Blend"].default_value = .35
nt.links.new(lw.outputs["Facing"], mx.inputs["Fac"]); inv = nt.nodes.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1
nt.links.new(lw.outputs["Facing"], inv.inputs[1]); nt.links.new(inv.outputs[0], mx.inputs["Fac"])
nt.links.new(mx.outputs[0], em.inputs["Color"]); em.inputs["Strength"].default_value = 1.0; nt.links.new(em.outputs[0], out.inputs["Surface"])
SR.append(sphere("sr_sun", SUNP, SUNRAD, m))
for i, (az, el, w, h, col) in enumerate(((-4.5, 6.5, 9, 1.0, 0), (3.8, 9.0, 12, 1.3, 1), (-1.5, 12.5, 7, .9, 1), (6.5, 4.6, 6, .7, 0), (-7.5, 10.5, 8, 1.0, 1))):
    D = 430.0; a = math.atan2(dirn.y, dirn.x) + R(az)
    p = Vector((CAM5.x + D * math.cos(a), CAM5.y + D * math.sin(a), CAM5.z + D * math.tan(R(el))))
    cm = soft_mat(f"srCloud{i}", [(0, "#ffc68e" if col == 0 else "#ffb0a0"), (1, "#c98ea8")], p.z - D * math.tan(R(h)) * .8, p.z + D * math.tan(R(h)), alpha=.9, power=1.3)
    r = D * math.tan(R(w / 2))
    SR.append(sphere(f"sr_cloud{i}", p, 1.0, cm, scale=(r * .5, r, D * math.tan(R(h / 2)))))

# ======================================================================================================
# people
# ======================================================================================================
def figure(nm, coat, trouser, skin, shoes, H=1.0, W=1.0, head=.42, belly=0.0):
    Mf = lambda n, h, j=.05: mat(f"{nm}_{n}", h, j, seed(nm + n), texel=.05)
    root = empty(nm, (0, 0, -100))
    d = dict(root=root, H=H, W=W, M=Mf)
    for side, sy in (("L", .11 * W), ("R", -.11 * W)):
        hp = empty(f"{nm}_hip{side}", (0, sy, .72 * H), root)
        box(f"{nm}_leg{side}", (.19, .19, .7 * H), (0, 0, -.35 * H), Mf("trouser", trouser), hp)
        box(f"{nm}_shoe{side}", (.3, .21, .1), (.05, 0, -.67 * H), Mf("shoes", shoes, .02), hp)
        d["hip" + side] = hp
    bd, bw, bh = .36 * W, .52 * W, .7 * H
    d["body"] = box(f"{nm}_body", (bd, bw, bh), (0, 0, .70 * H + bh / 2), Mf("coat", coat), root)
    if belly:
        box(f"{nm}_belly", (belly + .1, bw * .86, .42 * H), (bd / 2 + belly / 2 - .05, 0, .97 * H), Mf("coat", coat), root)
    neck = empty(f"{nm}_neck", (0, 0, 1.40 * H), root); d["neck"] = neck
    d["head"] = box(f"{nm}_head", (head, head * .96, head), (0, 0, head / 2 + .01), Mf("skin", skin, .02), neck)
    sy = bw / 2 + .08
    for side, s in (("L", 1), ("R", -1)):
        sh = empty(f"{nm}_sh{side}", (0, s * sy, 1.33 * H), root)
        box(f"{nm}_arm{side}", (.15, .15, .56 * H), (0, 0, -.28 * H), Mf("coat", coat), sh)
        box(f"{nm}_hand{side}", (.14, .14, .14), (0, 0, -.6 * H), Mf("skin", skin, .02), sh)
        d["sh" + side] = sh; d["tip" + side] = empty(f"{nm}_tip{side}", (0, 0, -.6 * H), sh)
    d["front"] = bd / 2 + belly
    return d

def eyes(d, nm, z, h, w=.085, y=.095, grp=None, ink=None):
    hx = .21 + .012
    g = grp or d["neck"]
    for s in (-1, 1): box(f"{nm}{s}", (.03, w, h), (hx, s * y, z), ink or M["ink"], g)

# ----- the shopkeeper -----
SK = figure("keeper", "#d9a23a", "#5a3f2a", "#e9b98f", "#2a1e16", H=1.0, W=1.3, belly=.2)
Mk = SK["M"]; nk = SK["neck"]; HX = .222
apron = Mk("apron", "#f6f0e2", .03)
box("keeper_apronLow", (.05, .62, .72), (SK["front"] + .02, 0, .93), apron, SK["root"])
box("keeper_apronBib", (.03, .4, .2), (.18 * 1.3 + .015, 0, 1.28), apron, SK["root"])
box("keeper_apronBack", (.36 * 1.3 + .04, .69, .06), (0, 0, 1.04), apron, SK["root"])           # the strings, seen from behind
for s in (-1, 1): box(f"keeper_apronStrap{s}", (.36 * 1.3 + .03, .05, .06), (0, s * .17, 1.37), apron, SK["root"])
hairM = Mk("hair", "#4a2c18")
blocks("keeper_hair", [((.44, .42, .08), (-.01, 0, .43)), ((.13, .42, .26), (-.16, 0, .3)), ((.2, .05, .16), (-.06, .205, .32)), ((.2, .05, .16), (-.06, -.205, .32))], hairM, nk)
stache = Mk("stache", "#3b2516", .02)
box("keeper_stache", (.04, .26, .065), (HX + .005, 0, .158), stache, nk)
for s in (-1, 1): box(f"keeper_stacheEnd{s}", (.04, .06, .1), (HX + .005, s * .14, .13), stache, nk)
happy = empty("keeper_happy", (0, 0, 0), nk); polite = empty("keeper_polite", (0, 0, 0), nk); flat = empty("keeper_flat", (0, 0, 0), nk)
for g in (happy, polite):
    eyes(SK, f"keeper_eye_{g.name[-5:]}", .27, .1, grp=g)
    for s in (-1, 1): box(f"keeper_brow_{g.name[-5:]}{s}", (.03, .1, .03), (HX, s * .095, .355), stache, g)
    box(f"keeper_mouth_{g.name[-5:]}", (.03, .1, .035), (HX, 0, .08), M["ink"], g)
    for s in (-1, 1): box(f"keeper_mouthC_{g.name[-5:]}{s}", (.03, .04, .04), (HX, s * .065, .1), M["ink"], g)
for s in (-1, 1): box(f"keeper_blush{s}", (.03, .07, .05), (HX - .003, s * .15, .2), M["pink"], happy)
eyes(SK, "keeper_eye_flat", .255, .04, grp=flat)
for s in (-1, 1): box(f"keeper_lid{s}", (.03, .1, .035), (HX, s * .095, .295), stache, flat)
box("keeper_mouth_flat", (.03, .15, .03), (HX, 0, .085), M["ink"], flat)

# ----- three heroes, the same hero really -----
HEROES = []
for i, plume in enumerate(("#c8341e", "#3f6f8f", "#e8b23a")):
    nm = f"hero{i}"
    h = figure(nm, "#7d8fa3", "#4c5a6a", "#efd9b9", "#3a4452", H=1.0, W=1.05, head=.4)
    Mh = h["M"]; hn = h["neck"]
    helm = Mh("helm", "#b3c0cc", .04)
    blocks(nm + "_helmet", [((.46, .44, .14), (0, 0, .41)), ((.12, .44, .3), (-.17, 0, .26)), ((.28, .06, .2), (-.06, .21, .27)),
                            ((.28, .06, .2), (-.06, -.21, .27)), ((.05, .06, .15), (.215, 0, .24))], helm, hn)
    box(nm + "_band", (.47, .45, .04), (0, 0, .345), Mh("band", "#e8b23a", .02), hn)
    blocks(nm + "_plume", [((.08, .07, .2), (0, 0, .58)), ((.3, .07, .08), (-.12, 0, .64)), ((.08, .07, .14), (-.25, 0, .58))], Mh("plume", plume, .03), hn)
    eyes(h, nm + "_eye", .23, .085, w=.075, y=.09)
    box(nm + "_chest", (.04, .42, .42), (.36 * 1.05 / 2 + .02, 0, 1.12), helm, h["root"])
    shield = empty(nm + "_shield", (0, .11, -.33), h["shL"])
    box(nm + "_shieldFace", (.5, .06, .62), (0, 0, 0), Mh("shield", "#c8341e", .04), shield)
    box(nm + "_shieldRim", (.56, .04, .68), (0, -.015, 0), Mh("rim", "#e8b23a", .02), shield)
    box(nm + "_shieldBoss", (.14, .05, .14), (0, .04, 0), Mh("rim", "#e8b23a", .02), shield)
    h["sword"] = sword(nm + "_sword", h["shR"], (0, 0, -.6), (R(180), 0, 0))   # grip in the hand, blade along the arm
    HEROES.append(h)

# ======================================================================================================
# animation
# ======================================================================================================
def pose(d, f, pos, yaw, lean=0., neck=(0., 0.), shL=(0., 0.), shR=(0., 0.), hips=(0., 0.)):
    key(d["root"], f, loc=pos, rot=(0, R(lean), R(yaw)))
    key(d["neck"], f, rot=(0, R(neck[0]), R(neck[1])))
    key(d["shL"], f, rot=(R(shL[0]), R(shL[1]), 0)); key(d["shR"], f, rot=(R(shR[0]), R(shR[1]), 0))
    key(d["hipL"], f, rot=(0, R(hips[0]), 0)); key(d["hipR"], f, rot=(0, R(hips[1]), 0))

def swing(dist, stride=1.4, amp=30.):
    w = 2 * math.pi * dist / stride; s = amp * math.sin(w)
    return s, .04 * abs(math.sin(w))

def polyline(pts, dist):
    """point and heading (deg) at `dist` along a polyline"""
    for a, b in zip(pts, pts[1:]):
        L = math.dist(a, b)
        if dist <= L or b is pts[-1]:
            u = clamp(dist / L) if L else 0
            return (lerp(a[0], b[0], u), lerp(a[1], b[1], u)), math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))
        dist -= L

def plen(pts): return sum(math.dist(a, b) for a, b in zip(pts, pts[1:]))

def angle_lerp(a, b, u):
    d = (b - a + 180) % 360 - 180
    return a + d * u

COUNTER_SPOT = (.8, -.95)
HT = [  # hero schedules (song frames): walk in from p0, turn to the counter, pay, item-get, walk off
    dict(f_in=504, p0=(-3.6, -1.6), arrive=568, coin=(574, 577, 587), up=588, sw=(590, 602), off=611),
    dict(f_in=620, p0=(-1.0, -1.6), arrive=645, coin=(649, 652, 661), up=662, sw=(664, 676), off=682),
    dict(f_in=689, p0=(.45, -1.45), arrive=697, coin=(700, 703, 712), up=713, sw=(715, 727), off=740),
]
for h, t in zip(HEROES, HT):
    t["path_in"] = [t["p0"], (.4, -1.6), COUNTER_SPOT]
    t["path_off"] = [COUNTER_SPOT, (1.4, -1.55), (60, -1.55)]

def hero_state(i, f):
    t = HT[i]
    if f < t["f_in"] or f > t["off"] + 160: return None
    neck = (0, 0); shL = (8, 0); shR = (-6, 0); hips = (0, 0); lean = 0
    if f <= t["arrive"]:
        L = plen(t["path_in"]); dist = L * (f - t["f_in"]) / (t["arrive"] - t["f_in"])
        (x, y), yaw = polyline(t["path_in"], dist); s, bob = swing(dist)
        if dist > L - .35: yaw = angle_lerp(0, yaw, (dist - (L - .35)) / .35) if yaw != 0 else yaw
        return dict(pos=(x, y, bob), yaw=yaw, hips=(s, -s), shL=(8, -s * .5), shR=(-6, s * .8), neck=neck)
    yaw = angle_lerp(58, 112, ease(seg(f, t["arrive"], t["arrive"] + 5)))
    pos = (COUNTER_SPOT[0], COUNTER_SPOT[1], 0)
    c0, c1, c2 = t["coin"]
    fw = ease(seg(f, c0 - 4, c0)) * (1 - ease(seg(f, c1 + 2, c1 + 6)))
    shR = (-6, -78 * fw)
    if f >= t["up"]:
        shR = (-4, lerp(shR[1], -172, ease(seg(f, t["up"], t["up"] + 4))))
        neck = (-14 * ease(seg(f, t["sw"][1], t["sw"][1] + 4)), 0)
    if f < t["off"]:
        return dict(pos=pos, yaw=yaw, shL=shL, shR=shR, neck=neck, lean=-3 * ease(seg(f, t["sw"][1], t["sw"][1] + 3)))
    dist = 1.5 * (f - t["off"]) / 24
    (x, y), yawp = polyline(t["path_off"], dist); s, bob = swing(dist)
    yaw = angle_lerp(112, yawp, ease(seg(f, t["off"], t["off"] + 6)))
    return dict(pos=(x, y, bob), yaw=yaw, hips=(s, -s), shL=(8, -s * .5), shR=(-4, -172), neck=(-8, 0), lean=-3)

# ----- the shopkeeper's day -----
SK_HOME = (-.6, .85)
S3A_PATH = [SK_HOME, (1.75, .85), (4.2, -1.3), (60, -1.3)]
S3A_WALK = 791
def keeper_state(f):
    st = dict(pos=(SK_HOME[0], SK_HOME[1], .006 * math.sin(f / 9.0)), yaw=-82, lean=0, neck=(0, 0), shL=(9, 0), shR=(-9, 0), hips=(0, 0))
    if f < 769:
        # head follows whichever hero is in play
        act = None
        for i in range(3):
            hs = hero_state(i, f)
            if hs and f <= HT[i]["off"] + 40: act = hs
        if act:
            dx, dy = act["pos"][0] - SK_HOME[0], act["pos"][1] - SK_HOME[1]
            st["neck"] = (0, clamp(math.degrees(math.atan2(dy, dx)) - st["yaw"], -55, 55))
        for i in range(3):
            land = HT[i]["coin"][2]
            if land <= f < land + 8: st["neck"] = (st["neck"][0] + 14 * math.sin(math.pi * (f - land) / 8), st["neck"][1])
        if 552 <= f <= 572:                                           # hero 1: a big wave
            st["shL"] = (lerp(9, 150, ease(seg(f, 552, 556))) + 18 * math.sin((f - 552) / 2.2) * (1 - seg(f, 568, 572)), 0)
            if f > 568: st["shL"] = (lerp(150, 9, ease(seg(f, 568, 572))), 0)
        if 630 <= f <= 644:                                           # hero 2: a smaller one
            u = ease(seg(f, 630, 634)) * (1 - ease(seg(f, 640, 644)))
            st["shL"] = (9 + 95 * u + 10 * math.sin((f - 630) / 2) * u, 0)
        if f >= 689:                                                  # hero 3: he doesn't bother
            st["neck"] = (st["neck"][0] + 9, st["neck"][1]); st["lean"] = 3
            st["shL"], st["shR"] = (4, 0), (-4, 0)
        return st
    if f < 832:
        st["neck"] = (6 * (1 - seg(f, 769, 778)), 0); st["lean"] = 3 * (1 - seg(f, 769, 778))
        nyaw = 72 * ease(seg(f, 783, 790))                            # 32.64: he looks off to screen right
        byaw = lerp(-82, 0, ease(seg(f, 789, 795)))                   # 33.05: and turns that way
        st["yaw"] = byaw; st["neck"] = (st["neck"][0], max(0, nyaw - (byaw + 82)))
        if f >= S3A_WALK:
            dist = 1.75 * (f - S3A_WALK) / 24; s, bob = swing(dist)
            (x, y), yawp = polyline(S3A_PATH, dist)
            st["pos"] = (x, y, bob); st["hips"] = (s, -s); st["yaw"] = -41 * ease(clamp((dist - 2.0) / .6))
            st["shL"], st["shR"] = (9, -s * .6), (-9, s * .6)
        return st
    if f < 917:
        dist = 1.45 * (f - 832) / 24; s, bob = swing(dist)
        st.update(pos=(18.0 + dist, -1.5, bob), yaw=0, hips=(s, -s), shL=(9, -s * .6), shR=(-9, s * .6))
        st["neck"] = (0, 18 * math.sin(math.pi * seg(f, 862, 896)))   # a glance back up the valley
        return st
    if f < 980:
        x0 = EDGE - .38 - 1.4 * (944 - 917) / 24
        if f <= 944:
            dist = 1.4 * (f - 917) / 24; s, bob = swing(dist)
            st.update(pos=(x0 + dist, -1.5, bob), yaw=0, hips=(s, -s), shL=(9, -s * .6), shR=(-9, s * .6))
            return st
        st.update(yaw=0)
        if f < 956:                                                    # he stops at the edge and looks down
            u = ease(seg(f, 944, 950))
            st.update(pos=(EDGE - .38, -1.5, 0), neck=(30 * u, 0), lean=6 * u, shL=(9 + 14 * u, 0), shR=(-9 - 14 * u, 0))
            return st
        if f < 966:                                                    # 39.85: steps off
            u = seg(f, 956, 966)
            z = lerp(0, VOIDZ, u * u) + .16 * math.sin(math.pi * u)
            st.update(pos=(lerp(EDGE - .38, EDGE + .45, ease(u)), -1.5, z), neck=(lerp(30, 8, u), 0), lean=lerp(6, 2, u),
                      hips=(-28 * math.sin(math.pi * u), 14 * math.sin(math.pi * u)), shL=(30, -20), shR=(-30, -20))
            return st
        u = seg(f, 966, 972)
        if f < 972:
            st.update(pos=(EDGE + .45, -1.5, VOIDZ), lean=8 * math.sin(math.pi * u), neck=(8 * (1 - u), 0), shL=(20, 0), shR=(-20, 0))
            return st
        dist = 1.3 * (f - 972) / 24; s, bob = swing(dist)
        st.update(pos=(EDGE + .45 + dist, -1.5, VOIDZ + bob), hips=(s, -s), shL=(9, -s * .6), shR=(-9, s * .6))
        return st
    if f < 1062:
        dist = 1.45 * (f - 980) / 24; s, bob = swing(dist)
        st.update(pos=(EDGE + .9 + dist, -1.5 + .1 * dist, VOIDZ + bob), yaw=4, hips=(s, -s), shL=(9, -s * .6), shR=(-9, s * .6),
                  neck=(0, -14 * math.sin(math.pi * seg(f, 1000, 1040))))
        return st
    # the wall: he walks to the crack and puts his hand on it
    yk = Y5 + crack_c(.75) - .418 - .06
    stop = WX - .85
    if f <= 1100:
        dist = (stop - (WX - 3.1)) * (f - 1062) / (1100 - 1062); s, bob = swing(dist)
        st.update(pos=(WX - 3.1 + dist, yk, VOIDZ + bob), yaw=0, hips=(s, -s), shL=(9, -s * .6), shR=(-9, s * .6))
        return st
    reach = ease(seg(f, 1101, 1109)) * (1 - ease(seg(f, 1118, 1127)))
    st.update(pos=(stop, yk, VOIDZ), yaw=0, shL=(lerp(9, 4, reach), -96 * reach), shR=(-12, 0), lean=-2 * reach,
              neck=(-4 * reach, 0))
    if f >= 1126:                                                       # a half step back, then he looks
        u = seg(f, 1126, 1140); dist = .45 * ease(u); s = 16 * math.sin(math.pi * u)
        st.update(pos=(stop - dist, yk, VOIDZ), hips=(s, -s * .6), shL=(9 + 10 * ease(seg(f, 1136, 1150)), 0), shR=(-9 - 10 * ease(seg(f, 1136, 1150)), 0),
                  neck=(-11 * ease(seg(f, 1136, 1150)), 0), lean=-2 * ease(seg(f, 1136, 1150)))
    return st

PARK = (-300, -300, -50)
for f in range(F0, F1 + 1):
    pose(SK, f, **keeper_state(f))
    for i, h in enumerate(HEROES):
        hs = hero_state(i, f)
        if hs and (hs["pos"][0] < 14): pose(h, f, **hs)
        else: pose(h, f, PARK, 0)

# ----- face swaps, carried swords -----
vis(happy, F0, True); vis(polite, F0, False); vis(flat, F0, False)
vis(happy, sec(27.56), False); vis(polite, sec(27.56), True)
vis(polite, 689, False); vis(flat, 689, True)
for h, t in zip(HEROES, HT):
    vis(h["sword"], F0, False); vis(h["sword"], t["sw"][1], True)

# ----- props that fly: read the hands' world positions from the evaluated scene -----
def world(ob, f):
    scene.frame_set(f); return ob.matrix_world.translation.copy()
COIN_SPOT = Vector((-.15, .02, 1.10 + .025))
coins = []
for i, (h, t) in enumerate(zip(HEROES, HT)):
    c = box(f"coin{i}", (.15, .15, .05), (0, 0, -50), M["gold"])
    coins.append(c)
    c0, c1, c2 = t["coin"]
    start = world(h["tipR"], c1)
    end = COIN_SPOT + Vector((.02 * i, -.01 * i, .05 * i))
    vis(c, F0, False); vis(c, c0, True)
    for f in range(c0, c2 + 1):
        if f <= c1:
            p = world(h["tipR"], f); rot = (0, 0, 0)
        else:
            u = seg(f, c1, c2); p = start.lerp(end, u) + Vector((0, 0, .55 * math.sin(math.pi * u)))
            rot = (R(360 * u), 0, R(540 * u))
        key(c, f, loc=tuple(p), rot=rot)
    key(c, c2 + 1, loc=tuple(end), rot=(0, 0, R(15 * i)))

# the bought sword flies off the wall into the raised hand; a new one pops onto the wall at once
sparks = [box(f"spark{k}", (.06, .06, .06), (0, 0, -50), M["spark"]) for k in range(8)]
for s in sparks: vis(s, F0, False)
vis(flySword, F0, False); vis(wallSword, F0, True)
key(wallSword, F0, loc=tuple(WALL_SWORD), scale=(1, 1, 1))
for i, (h, t) in enumerate(zip(HEROES, HT)):
    a, b = t["sw"]
    end = world(h["sword"], b)
    vis(flySword, a, True); vis(wallSword, a, False); key(wallSword, a, scale=(1, 1, 1))
    for f in range(a, b):
        u = ease(seg(f, a, b))
        p = WALL_SWORD.lerp(end, u) + Vector((0, 0, .7 * math.sin(math.pi * u)))
        key(flySword, f, loc=tuple(p), rot=(0, 0, R(360 * u)))
    vis(flySword, b, False)
    key(flySword, b, loc=(0, 0, -50))
    vis(wallSword, b + 1, True)                                  # respawn
    for k, sc in ((b, .2), (b + 1, .3), (b + 2, 1.3), (b + 3, 1.1), (b + 4, 1.0)):
        key(wallSword, k, scale=(sc, sc, sc))
    ctr = WALL_SWORD + Vector((0, -.06, .35))
    for k, s in enumerate(sparks):
        ang = 2 * math.pi * k / len(sparks)
        vis(s, b + 1, True); vis(s, b + 8, False)
        for f in range(b + 1, b + 9):
            r = .15 + .55 * seg(f, b + 1, b + 8)
            key(s, f, loc=tuple(ctr + Vector((r * math.cos(ang), -.02, r * math.sin(ang)))), scale=[1 - .7 * seg(f, b + 1, b + 8)] * 3)

# ----- the crack opens -----
for f in range(F0, F1 + 1):
    g = .06 + (1.5 - .06) * (1 - (1 - seg(f, 1114, 1162)) ** 3)
    key(wallLo, f, loc=(0, -g, 0)); key(wallHi, f, loc=(0, g, 0))
    key(rimLo, f, loc=(0, -g, 0)); key(rimHi, f, loc=(0, g, 0))
vis(skyEnd, F0, True); vis(skyEnd, 917, False)
for ob in [wallLo, wallHi, rimLo, rimHi] + SR:
    vis(ob, F0, False); vis(ob, 1062, True)

# ======================================================================================================
# light and world
# ======================================================================================================
sd = bpy.data.lights.new("CL_sun", "SUN"); sd.angle = R(8)
sunL = bpy.data.objects.new("CL_sun", sd); scene.collection.objects.link(sunL); sunL.rotation_euler = (R(48), R(-14), R(-32))
for f, e, c in ((F0, 3.6, "#fff4e2"), (917, 2.2, "#dfe6ff"), (1062, .9, "#c9d4ff")):
    sd.energy = e; sd.color = hex_lin(c); sd.keyframe_insert("energy", frame=f); sd.keyframe_insert("color", frame=f)

spd = bpy.data.lights.new("CL_spill", "SPOT"); spd.spot_size = R(120); spd.spot_blend = .4; spd.shadow_soft_size = .05
spd.color = hex_lin("#ffb36b")
spill = bpy.data.objects.new("CL_spill", spd); scene.collection.objects.link(spill)
spill.location = (WX + 2.2, Y5 + .15, 2.0)
spill.rotation_euler = (Vector((-1, 0, -.22))).to_track_quat("-Z", "Y").to_euler()
glw = bpy.data.lights.new("CL_glow", "POINT"); glw.color = hex_lin("#ffc48a"); glw.shadow_soft_size = .4
glow = bpy.data.objects.new("CL_glow", glw); scene.collection.objects.link(glow); glow.location = (WX - .9, Y5, 1.4)
for f in range(F0, F1 + 1):
    o = seg(f, 1114, 1162)
    spd.energy = 0 if f < 1062 else 1500 + 9000 * (1 - (1 - o) ** 2); spd.keyframe_insert("energy", frame=f)
    glw.energy = 0 if f < 1062 else 25 + 6 * math.sin(f / 3.0) + 120 * o; glw.keyframe_insert("energy", frame=f)

world = bpy.data.worlds.new("CL_world"); scene.world = world; world.use_nodes = True
wn = world.node_tree; wn.nodes.clear()
wo = wn.nodes.new("ShaderNodeOutputWorld"); bg = wn.nodes.new("ShaderNodeBackground"); wn.links.new(bg.outputs[0], wo.inputs[0])
for f, c, s in ((F0, "#a6cbe6", 1.0), (917, "#0c1430", 1.0)):
    bg.inputs["Color"].default_value = (*hex_lin(c), 1); bg.inputs["Strength"].default_value = s
    bg.inputs["Color"].keyframe_insert("default_value", frame=f)

# constant interpolation on every light/world/visibility key that steps
def const_all(idblock, prefix=("energy", "color", "nodes", "hide")):
    ad = idblock.animation_data
    if not (ad and ad.action): return
    fcs = []
    for layer in getattr(ad.action, "layers", []):
        for strip in layer.strips:
            for cb in strip.channelbags: fcs += list(cb.fcurves)
    for fc in fcs:
        if fc.data_path.startswith(prefix):
            for kp in fc.keyframe_points: kp.interpolation = "CONSTANT"
const_all(sd); const_all(wn)
for ob in scene.objects: const_all(ob)

# ======================================================================================================
# shots (cut on the line onsets)
# ======================================================================================================
SHOTS = []
def shot(nm, f0, f1, la, lb, ta, tb, lens=35, track=None):
    if track: la, ta = track(f0)
    cam = shot_camera(nm, la, ta, lens=lens); tgt = bpy.data.objects[cam["target"]]
    for f in range(f0, f1 + 1):
        if track: l, t = track(f)
        else:
            u = ease(seg(f, f0, f1)) * .5 + seg(f, f0, f1) * .5
            l, t = V3(la, lb, u), V3(ta, tb, u)
        key(cam, f, loc=l); key(tgt, f, loc=t)
    cut(f0, cam); SHOTS.append((nm, f0, f1))
    return cam
shot("s1", 504, 619, (-2.1, -7.4, 2.25), (-1.6, -6.4, 2.05), (.15, 0, 1.3), (.2, 0, 1.3), 35)
shot("s2a", 620, 688, (-3.3, -6.4, 2.3), (-2.9, -5.8, 2.15), (.1, 0, 1.35), (.15, 0, 1.35), 35)
shot("s2b", 689, 768, (.1, -3.5, 1.95), (0, -3.15, 1.93), (-.2, .85, 1.62), (-.22, .85, 1.64), 50)
shot("s3a", 769, 831, (-1.2, -6.8, 2.0), (.9, -6.5, 1.95), (-.1, .5, 1.3), (2.0, .3, 1.15), 35)
def track3(f):
    x = keeper_state(f)["pos"][0]
    return (x - .2, -10.5, 1.75), (x + .2, 0, 1.15)
shot("s3b", 832, 916, None, None, (0, 0, 0), None, 50, track=track3)
shot("s4a", 917, 979, (EDGE - 2.2, -7.6, 1.45), (EDGE - 1.6, -7.1, 1.4), (EDGE + .5, 0, .35), (EDGE + .7, 0, .3), 30)
shot("s4b", 980, 1061, (EDGE - 7, -9.5, 7.0), (EDGE - 7.6, -10.2, 8.4), (EDGE + 9, 1, -.3), (EDGE + 10, 1, -.5), 24)
shot("s5a", 1062, 1113, (WX - 13, Y5 - 5.6, 2.6), (WX - 11.4, Y5 - 4.9, 2.45), (WX, Y5, 2.3), (WX, Y5, 2.2), 30)
shot("s5b", 1114, 1183, tuple(CAM5 + Vector((-.35, -.05, 0))), tuple(CAM5 + Vector((.35, .05, 0))), (WX, Y5 + .1, 1.0), (WX, Y5 + .1, 1.05), 35)

pixel_look([(F0, 6)], sharp=[o.name for o in SR])
print("TAKE07 shots:", SHOTS, "sun", tuple(round(v, 1) for v in SUNP), "r", round(SUNRAD, 1))
run(OUT)
