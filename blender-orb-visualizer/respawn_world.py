# Respawn: the shared world for the whole-song film (plan 2, STORYBOARD-respawn.md). Blender 4.5 LTS, EEVEE.
#
# Take 07 (realthing_respawn.py) built the village, the void, the crack wall and the sunrise for a 28 s sketch in one
# script. This module is that world as functions, so eight act scripts and the stills script build the same set:
#   W = build(F0, F1)      everything hangs off the returned namespace (W.M palette, W.keeper, W.SR, W.pose ...)
# Added for the film: a west edge (the village is one tile), the pond with its fisher and fish sprite, the keeper's
# smooth reflection, the flower seller and her stand, the guard and his board doubles, the Mayor on a balcony, the
# map-edge sign, the stall shutters, the price tag, the "Continue?" prompt, the shore past the crack, and a face
# library for the two who wake. Object names stay the take-07 names where the sketch used them.
import bpy, bmesh, math, os, sys, random, zlib
from types import SimpleNamespace
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
sys.path.insert(0, HERE)
from canvas_kit import reset, hex_lin, tex_image, mat, specks, stripes, box, blocks, empty
from film_kit import film_setup, sec, shot_camera, cut, key

R = math.radians
EDGE = 50.0                     # the map ends at x = EDGE
WEST = -34.0                    # and begins at x = WEST (new: the village is one tile)
VOIDZ = -0.6                    # the void floor, a step below the grass
WX, Y5 = 300.0, -600.0          # the crack wall (plane x = WX), centred at y = Y5, far out in the void
PARK = (-300, -300, -50)

def seed(s): return zlib.crc32(s.encode()) % 997
def clamp(v, a=0., b=1.): return max(a, min(b, v))
def lerp(a, b, u): return a + (b - a) * u
def ease(u): u = clamp(u); return u * u * (3 - 2 * u)
def seg(f, a, b): return clamp((f - a) / float(b - a))
def V3(a, b, u): return tuple(lerp(a[i], b[i], u) for i in range(3))

def angle_lerp(a, b, u):
    d = (b - a + 180) % 360 - 180
    return a + d * u

def polyline(pts, dist):
    """point and heading (deg) at `dist` along a polyline"""
    for a, b in zip(pts, pts[1:]):
        L = math.dist(a, b)
        if dist <= L or b is pts[-1]:
            u = clamp(dist / L) if L else 0
            return (lerp(a[0], b[0], u), lerp(a[1], b[1], u)), math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))
        dist -= L

def plen(pts): return sum(math.dist(a, b) for a, b in zip(pts, pts[1:]))

def swing(dist, stride=1.4, amp=30.):
    w = 2 * math.pi * dist / stride; s = amp * math.sin(w)
    return s, .04 * abs(math.sin(w))


def build(F0, F1, out, res=(1280, 720)):
    scene = reset()
    film_setup(out, F0, F1, res=res)
    W = SimpleNamespace(scene=scene, F0=F0, F1=F1, EDGE=EDGE, WEST=WEST, VOIDZ=VOIDZ, WX=WX, Y5=Y5, PARK=PARK)

    # ---------- palette (take 07) ----------
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
        # new for the film
        white=mat("white", "#fbf8f0", .01, 32, texel=.04, emit=.6),
        water=mat("water", "#3f7fa8", .06, 33, texel=.1, pattern=specks("#4f93bd", "#35709a", .15)),
        fish=mat("fish", "#f08a3a", .04, 34, texel=.04),
        purple=mat("purple", "#6a3f8a", .05, 35, texel=.05),
        green=mat("green", "#5f9e6a", .06, 36, texel=.05, pattern=stripes("#5f9e6a", "#558f5f", 3)),
        straw=mat("straw", "#e6c98a", .06, 37, texel=.05),
        tin=mat("tin", "#9aa7ad", .04, 38, texel=.04, rough=.5),
        panel=mat("panel", "#f3ead2", .02, 39, texel=.05, emit=.35),
        button=mat("button", "#4fae5a", .03, 40, texel=.05, emit=.5),
        charcoal=mat("charcoal", "#3b3630", .03, 41, texel=.04),
        board=mat("board", "#c9b48e", .05, 42, texel=.06, pattern=stripes("#c9b48e", "#b9a37c", 3)),
    )
    W.M = M

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

    def smooth_mat(name, color, rough=.6):
        """a plain shaded smooth material (the real world's solid things)"""
        m, nt = new_mat(name)
        out = nt.nodes.new("ShaderNodeOutputMaterial"); bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
        bsdf.inputs["Base Color"].default_value = (*hex_lin(color), 1); bsdf.inputs["Roughness"].default_value = rough
        nt.links.new(bsdf.outputs[0], out.inputs["Surface"])
        return m

    def grid_mat(name, cell=1.2, base="#18213f", line="#8fe3ff", strength=.75, fade=(25., 150.)):
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

    def cylinder(name, loc, radius, depth, material, parent=None, segs=48):
        me = bpy.data.meshes.new("CL_" + name); bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=radius, radius2=radius, depth=depth)
        bm.to_mesh(me); bm.free()
        for p in me.polygons: p.use_smooth = True
        ob = bpy.data.objects.new("CL_" + name, me); scene.collection.objects.link(ob); me.materials.append(material)
        ob.location = loc
        if parent: ob.parent = parent
        return ob

    W.grad_mat, W.soft_mat, W.smooth_mat, W.plane, W.sphere, W.cylinder = grad_mat, soft_mat, smooth_mat, plane, sphere, cylinder

    # ---------- visibility, keyed only where it changes ----------
    VIS = {}
    def vis(ob, f, on):
        for o in [ob] + list(ob.children_recursive):
            if VIS.get(o.name) == on: continue
            VIS[o.name] = on
            o.hide_render = not on; o.keyframe_insert("hide_render", frame=f)
            o.hide_viewport = not on; o.keyframe_insert("hide_viewport", frame=f)
    W.vis = vis

    # ==================================================================================================
    # the village: one tile from WEST to EDGE
    # ==================================================================================================
    TW = EDGE - WEST; TX = (EDGE + WEST) / 2
    # the ground, with a basin cut out under the pond (grass and the top of the dirt), the lower dirt whole
    PC = (11.0, -6.2); W.PC = PC
    HX0, HX1, HY0, HY1 = PC[0] - 5, PC[0] + 5, PC[1] - 3.5, PC[1] + 3.5
    def holed(nm, z0, z1, material):
        zc, th = (z0 + z1) / 2, z1 - z0
        blocks(nm, [((HX0 - WEST, 80, th), ((HX0 + WEST) / 2, 0, zc)), ((EDGE - HX1, 80, th), ((EDGE + HX1) / 2, 0, zc)),
                    ((HX1 - HX0, HY0 + 40, th), ((HX0 + HX1) / 2, (HY0 - 40) / 2, zc)), ((HX1 - HX0, 40 - HY1, th), ((HX0 + HX1) / 2, (HY1 + 40) / 2, zc))], material)
    holed("grassTop", -.25, 0, M["grass"])
    holed("dirtTop", -.55, -.25, M["dirt"])
    box("dirt", (TW, 80, .9), (TX, 0, -1.0), M["dirt"])
    box("path", (TW, 2.0, .2), (TX, -1.6, -.08), M["sand"])     # top at z = .02

    skyWall = plane("skyWall", [(WEST, 40, -1.5), (EDGE, 40, -1.5), (EDGE, 40, 90), (WEST, 40, 90)],
                    grad_mat("skyDay", [(0, "#d8f1ec"), (.12, "#a8dcf0"), (.35, "#6db4ea"), (1, "#3f86d8")], 2, 0, 60))
    skyEnd = plane("skyEnd", [(EDGE + .05, -90, -1.5), (EDGE + .05, 40, -1.5), (EDGE + .05, 40, 90), (EDGE + .05, -90, 90)],
                   bpy.data.materials["CL_skyDay"])
    skyWest = plane("skyWest", [(WEST - .05, 40, -1.5), (WEST - .05, -90, -1.5), (WEST - .05, -90, 90), (WEST - .05, 40, 90)],
                    bpy.data.materials["CL_skyDay"])
    skySouth = plane("skySouth", [(EDGE, -40.05, -1.5), (WEST, -40.05, -1.5), (WEST, -40.05, 90), (EDGE, -40.05, 90)],
                     bpy.data.materials["CL_skyDay"])
    W.skySouth = skySouth
    # two stage props hold the sky card up from behind (seen only from the void)
    for i, x in enumerate((WEST + 8, EDGE - 8)):
        box(f"skyProp{i}", (.5, 14, .5), (x, 47, 10), M["wood2"], rot=(R(-60), 0, 0))
    W.skyWall, W.skyEnd, W.skyWest = skyWall, skyEnd, skyWest

    def vcloud(nm, x, z, w):
        parts = [((w, 1, 1.2), (0, 0, 0)), ((w * .55, 1, .8), (-w * .12, 0, .9)), ((w * .3, 1, .6), (w * .25, 0, .7))]
        clipped = []
        for (sx, sy, sz), (lx, ly, lz) in parts:
            a, b = x + lx - sx / 2, x + lx + sx / 2
            b = min(b, EDGE); a = max(a, WEST)
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
    # the shutters (act 0): a plank that drops over the front of the stall
    shutter = blocks("shutter", [((2.9, .08, 1.6), (0, -.5, 1.9))], M["plank"]); W.shutter = shutter

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
    W.sword = sword
    WALL_SWORD = Vector((.70, 1.235, 1.06)); W.WALL_SWORD = WALL_SWORD
    W.wallSword = sword("wallSword", loc=tuple(WALL_SWORD))
    W.flySword = sword("flySword", loc=(0, 0, -50))
    # the price tag hangs off the wall sword's guard on a string; its back is blank for his charcoal number
    tag = empty("tag", (0, 0, .11), W.wallSword)
    box("tag_string", (.012, .012, .16), (.1, 0, -.08), M["ink"], tag)
    box("tag_card", (.02, .14, .1), (.1, 0, -.21), M["cream"], tag)
    box("tag_print", (.012, .08, .02), (.112, 0, -.2), M["ink"], tag)
    W.tag = tag

    # ----- houses, trees, fences, flowers -----
    def house(nm, x, y, w, d, h, wall, roof, door=True, front_only=False):
        """front_only: a facade (the front wall and the roof's front slope) held up by two props, for act 3"""
        if front_only:
            box(nm + "_walls", (w, .2, h), (x, y - d / 2 + .1, h / 2), M[wall])
            box(nm + "_roofF", (w + .4, .34, .34), (x, y - d / 2 + .1, h + .17), M[roof])
            for s in (-1, 1): box(f"{nm}_prop{s}", (.3, 2.4, .3), (x + s * w * .3, y - d / 2 + 1.3, h * .45), M["wood2"], rot=(R(-55), 0, 0))
        else:
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
              (15.8, 7.2, 3.4, 3.0, 2.5, "plaster", "roof"), (21.5, 9.8, 3.2, 2.8, 2.4, "plaster2", "roof2"),
              (-18.5, 8.6, 3.6, 3.0, 2.7, "plaster2", "roof2"), (-25.0, 7.0, 3.2, 2.8, 2.4, "plaster", "roof")]
    for i, h in enumerate(HOUSES): house(f"house{i}", *h)
    W.HOUSES = HOUSES; W.house = house

    # the Mayor's balcony on house 2, with the Mayor and his scroll
    bx, by, bw, bd, bh = HOUSES[2][:5]
    balc = empty("balcony", (bx, by - bd / 2 - .5, bh - .3))
    box("balc_floor", (2.0, 1.0, .16), (0, 0, 0), M["plank"], balc)
    for i, x in enumerate((-.95, -.48, 0, .48, .95)): box(f"balc_bar{i}", (.08, .08, .7), (x, -.46, .4), M["wood2"], balc)
    box("balc_rail", (2.0, .1, .08), (0, -.46, .78), M["wood2"], balc)
    W.balcony = balc

    def tree(nm, x, y, s=1.0):
        box(nm + "_trunk", (.36 * s, .36 * s, 1.7 * s), (x, y, .85 * s), M["trunk"])
        blocks(nm + "_crown", [((1.9 * s, 1.9 * s, 1.3 * s), (x, y, 2.25 * s)), ((1.3 * s, 1.3 * s, .8 * s), (x, y, 3.25 * s)),
                               ((.6 * s, 2.3 * s, .7 * s), (x, y, 2.1 * s)), ((2.3 * s, .6 * s, .7 * s), (x, y, 2.0 * s))], M["leaf"])
        box(nm + "_top", (.9 * s, .9 * s, .4 * s), (x + .1, y - .1, 3.75 * s), M["leaf2"])
    for i, (x, y, s) in enumerate(((-14, 4.5, 1.1), (-8.2, 3.6, .9), (1.8, 12.5, 1.2), (7.4, 4.4, 1.0), (13.2, 4.0, 1.1),
                                   (-3.2, 4.2, .8), (18.8, 4.6, 1.0), (24.6, 5.2, .9), (29.8, 3.8, .75), (36.5, 4.6, .55),
                                   (-12, -6.5, 1.0), (3.5, -8.2, 1.1), (16.5, -6.0, .9), (-21, -5.5, .9), (-28, 4.8, .8))):
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
        if x > 26 and rf.random() < .6: continue
        if 5.5 < x < 16.5 and y < -2.5: continue                          # the pond's bank
        fl[rf.choice(list(fl))].append(((.14, .14, .14), (x, y, .07)))
    for k, parts in fl.items(): blocks("flowers_" + k, parts, M[k])
    box("signPole", (.12, .12, 2.2), (-6.5, -.2, 1.1), M["wood2"])
    box("pennant", (.9, .05, .5), (-6.0, -.2, 1.9), M["awning"])

    # the map-edge sign: a post with a board, blank face, a red bar across it (the "no" every game draws)
    box("edgeSignPost", (.12, .12, 1.7), (EDGE - 1.6, -3.3, .85), M["wood2"])
    box("edgeSignBoard", (.08, 1.3, .6), (EDGE - 1.6, -3.3, 1.65), M["cream"])
    box("edgeSignBar", (.1, .9, .12), (EDGE - 1.62, -3.3, 1.65), M["red"], rot=(R(-20), 0, 0))

    # ----- the pond: a stocked blob of water south of the path, a dock, a fish sprite that laps under it -----
    pond_parts, rim_parts, bed_parts = [], [], []
    rp_ = random.Random(5)
    for gx in range(-10, 10):
        for gy in range(-7, 7):
            x, y = PC[0] + gx * .5 + .25, PC[1] + gy * .5 + .25
            r = math.hypot((gx + .5) / 8.6, (gy + .5) / 5.6) + rp_.uniform(-.04, .04)
            if r < .9:
                pond_parts.append(((.5, .5, .57), (x, y, -.265)))               # water from the bed to z = .02
                bed_parts.append(((.5, .5, .04), (x, y, -.53)))
            else: rim_parts.append(((.5, .5, .65), (x, y, -.225)))                # sand fills the rest of the basin, top .1
    blocks("pondWater", pond_parts, M["water"]); blocks("pondRim", rim_parts, M["sand"])
    blocks("pondBed", bed_parts, mat("bed", "#2b4a5c", .06, 43, texel=.1))
    # the water lets the fish and the reflection show through
    wm = M["water"]; wb = next(n for n in wm.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    wb.inputs["Alpha"].default_value = .38
    try: wm.surface_render_method = "BLENDED"
    except Exception: pass
    try: wm.blend_method = "BLEND"
    except Exception: pass
    # the dock, from the west bank
    for i in range(5): box(f"dockPlank{i}", (.45, 1.2, .1), (PC[0] - 4.4 + .5 * i, PC[1], .12), M["plank"])
    for s in (-1, 1): box(f"dockPost{s}", (.14, .14, .5), (PC[0] - 2.2, PC[1] + s * .5, -.1), M["wood2"])
    fishSprite = blocks("fish", [((.3, .12, .1), (0, 0, 0)), ((.12, .14, .16), (-.18, 0, 0))], M["fish"]); W.fish = fishSprite
    fishSprite.location = (PC[0] + 1.0, PC[1], -.14)
    floatBob = box("rodFloat", (.08, .08, .1), (PC[0] - .4, PC[1] + .25, -.01), M["red"]); W.rodFloat = floatBob

    # the flower seller's stand across the square from the stall
    FS = (-5.6, -3.9); W.FS = FS
    box("fs_table", (.9, .6, .08), (FS[0], FS[1], .78), M["plank"])
    for sx in (-.38, .38):
        for sy in (-.22, .22): box(f"fs_leg{sx}{sy}", (.08, .08, .74), (FS[0] + sx, FS[1] + sy, .37), M["wood2"])
    box("fs_pot", (.3, .3, .26), (FS[0], FS[1], .95), M["roof"])
    potFlower = blocks("potFlower", [((.05, .05, .3), (0, 0, .15)), ((.16, .16, .14), (0, 0, .34)), ((.08, .08, .06), (0, 0, .42))], M["flowR"])
    potFlower.location = (FS[0], FS[1], 1.08); W.potFlower = potFlower

    # ==================================================================================================
    # the void, the crack wall, the shore and the real sunrise (take 07, plus a sand strip)
    # ==================================================================================================
    GRID = grid_mat("grid")
    box("voidA", (WX + 200, 6000, .2), ((WX - .2 - 200) / 2, 0, VOIDZ - .1), GRID)
    box("voidB", (3000, 3000, .2), (WX + 1500, Y5 + 300 + 1500, VOIDZ - .1), GRID)

    rc = random.Random(7); CP = []; z = VOIDZ
    while z < 45: CP.append((z, rc.uniform(-.26, .26))); z += rc.uniform(.22, .55)
    def crack_c(zq):
        for (za, ca), (zb, cb) in zip(CP, CP[1:]):
            if za <= zq <= zb: return lerp(ca, cb, (zq - za) / (zb - za))
        return 0.0
    W.crack_c = crack_c
    lo_parts, hi_parts, SH, RIMC = [], [], .1, []
    for k in range(int((44 - VOIDZ) / SH)):
        zc = VOIDZ + (k + .5) * SH; c = round(crack_c(zc) / .05) * .05
        RIMC.append((zc, c))
        lo_parts.append(((.4, 50 + c, SH), (WX, Y5 - 50 + (50 + c) / 2, zc)))
        hi_parts.append(((.4, 50 - c, SH), (WX, Y5 + c + (50 - c) / 2, zc)))
    GRIDW = grid_mat("gridWall", strength=.42, fade=(20., 90.))
    W.wallLo = blocks("wallLo", lo_parts, GRIDW); W.wallHi = blocks("wallHi", hi_parts, GRIDW)
    RIM = mat("rim", "#ffc890", .04, 31, texel=.05, emit=1.6)
    W.rimLo = blocks("rimLo", [((.44, .07, SH), (WX, Y5 + c[1] - .035, c[0])) for c in RIMC], RIM)
    W.rimHi = blocks("rimHi", [((.44, .07, SH), (WX, Y5 + c[1] + .035, c[0])) for c in RIMC], RIM)

    def crack_open(f, g):
        """gap half-width g (0.06 closed, 1.5 wide open) at song frame f"""
        key(W.wallLo, f, loc=(0, -g, 0)); key(W.wallHi, f, loc=(0, g, 0))
        key(W.rimLo, f, loc=(0, -g, 0)); key(W.rimHi, f, loc=(0, g, 0))
    W.crack_open = crack_open

    CAM5 = Vector((WX - 9.3, Y5 - 1.35, 1.85)); W.CAM5 = CAM5
    SUN_D, SUN_EL, SUN_R = 560.0, 2.6, 3.0
    dirn = (Vector((WX, Y5 + .1, 0)) - Vector((CAM5.x, CAM5.y, 0))).normalized()
    sun_xy = Vector((CAM5.x, CAM5.y, 0)) + dirn * (WX + SUN_D - CAM5.x) / dirn.x
    dist = (sun_xy - Vector((CAM5.x, CAM5.y, 0))).length
    SUNP = Vector((sun_xy.x, sun_xy.y, CAM5.z + dist * math.tan(R(SUN_EL)))); W.SUNP = SUNP
    SUNRAD = dist * math.tan(R(SUN_R)); W.SUNRAD = SUNRAD
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
    SR.append(plane("sr_sea", [(WX + 5.0, Y5 - 500, VOIDZ - .3), (WX + 610, Y5 - 500, VOIDZ - .3), (WX + 610, Y5 + 500, VOIDZ - .3), (WX + 5.0, Y5 + 500, VOIDZ - .3)], sea_mat()))
    # the shore: a strip of sand from the wall to the water, graded warm toward the sun
    SR.append(plane("sr_sand", [(WX + .21, Y5 - 60, VOIDZ - .3), (WX + 5.2, Y5 - 60, VOIDZ - .3), (WX + 5.2, Y5 + 60, VOIDZ - .3), (WX + .21, Y5 + 60, VOIDZ - .3)],
                    grad_mat("srSand", [(0, "#8d6f7a"), (.5, "#c99a86"), (1, "#e8b88e")], 0, WX, WX + 5.2, strength=.9)))
    hp = CAM5 + (SUNP - CAM5) * .82
    hm = soft_mat("srHalo", [(0, "#ffd27a"), (1, "#ffb36b")], 0, 1, alpha=.5, power=2.6); hm.use_backface_culling = True
    SR.append(sphere("sr_halo", hp, SUNRAD * 3.0 * .82, hm))
    m, nt = new_mat("srSun")
    out = nt.nodes.new("ShaderNodeOutputMaterial"); em = nt.nodes.new("ShaderNodeEmission"); lw = nt.nodes.new("ShaderNodeLayerWeight")
    mx = nt.nodes.new("ShaderNodeMixRGB"); mx.inputs[1].default_value = (*hex_lin("#ffd27a"), 1); mx.inputs[2].default_value = (*hex_lin("#fff6e0"), 1)
    lw.inputs["Blend"].default_value = .35
    inv = nt.nodes.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1
    nt.links.new(lw.outputs["Facing"], inv.inputs[1]); nt.links.new(inv.outputs[0], mx.inputs["Fac"])
    nt.links.new(mx.outputs[0], em.inputs["Color"]); em.inputs["Strength"].default_value = 1.0; nt.links.new(em.outputs[0], out.inputs["Surface"])
    SR.append(sphere("sr_sun", SUNP, SUNRAD, m))
    for i, (az, el, w, h, col) in enumerate(((-4.5, 6.5, 9, 1.0, 0), (3.8, 9.0, 12, 1.3, 1), (-1.5, 12.5, 7, .9, 1), (6.5, 4.6, 6, .7, 0), (-7.5, 10.5, 8, 1.0, 1))):
        D = 430.0; a = math.atan2(dirn.y, dirn.x) + R(az)
        p = Vector((CAM5.x + D * math.cos(a), CAM5.y + D * math.sin(a), CAM5.z + D * math.tan(R(el))))
        cm = soft_mat(f"srCloud{i}", [(0, "#ffc68e" if col == 0 else "#ffb0a0"), (1, "#c98ea8")], p.z - D * math.tan(R(h)) * .8, p.z + D * math.tan(R(h)), alpha=.9, power=1.3)
        r = D * math.tan(R(w / 2))
        SR.append(sphere(f"sr_cloud{i}", p, 1.0, cm, scale=(r * .5, r, D * math.tan(R(h / 2)))))
    W.SR = SR

    # ==================================================================================================
    # posing
    # ==================================================================================================
    def pose(d, f, pos, yaw, lean=0., neck=(0., 0.), shL=(0., 0.), shR=(0., 0.), hips=(0., 0.)):
        key(d["root"], f, loc=pos, rot=(0, R(lean), R(yaw)))
        key(d["neck"], f, rot=(0, R(neck[0]), R(neck[1])))
        key(d["shL"], f, rot=(R(shL[0]), R(shL[1]), 0)); key(d["shR"], f, rot=(R(shR[0]), R(shR[1]), 0))
        key(d["hipL"], f, rot=(0, R(hips[0]), 0)); key(d["hipR"], f, rot=(0, R(hips[1]), 0))
    W.pose = pose

    def sit(d, f, pos, yaw, lean=4., neck=(0., 0.), shL=(0., -30.), shR=(0., -30.), knees=True):
        """sitting on the ground: hips folded forward, root dropped so the seat is on the floor"""
        key(d["root"], f, loc=(pos[0], pos[1], pos[2] - .68 * d["H"]), rot=(0, R(lean), R(yaw)))
        key(d["neck"], f, rot=(0, R(neck[0]), R(neck[1])))
        key(d["shL"], f, rot=(R(shL[0]), R(shL[1]), 0)); key(d["shR"], f, rot=(R(shR[0]), R(shR[1]), 0))
        a = -90 if knees else -80
        key(d["hipL"], f, rot=(0, R(a), 0)); key(d["hipR"], f, rot=(0, R(a), 0))
    W.sit = sit

    def world_at(ob, f):
        scene.frame_set(f); return ob.matrix_world.translation.copy()
    W.world_at = world_at

    def park_all(f):
        for d in [W.keeper, W.seller, W.fisher, W.mayor, W.guard] + W.heroes + W.guards: pose(d, f, PARK, 0)
        key(W.prompt, f, loc=(0, 0, -60))
    W.park_all = park_all

    # ==================================================================================================
    # people
    # ==================================================================================================
    def figure(nm, coat, trouser, skin, shoes, H=1.0, W_=1.0, head=.42, belly=0.0, skirt=False):
        Mf = lambda n, h, j=.05: mat(f"{nm}_{n}", h, j, seed(nm + n), texel=.05)
        root = empty(nm, (0, 0, -100))
        d = dict(root=root, H=H, W=W_, M=Mf, name=nm)
        for side, sy in (("L", .11 * W_), ("R", -.11 * W_)):
            hp = empty(f"{nm}_hip{side}", (0, sy, .72 * H), root)
            box(f"{nm}_leg{side}", (.19, .19, .7 * H), (0, 0, -.35 * H), Mf("trouser", trouser), hp)
            box(f"{nm}_shoe{side}", (.3, .21, .1), (.05, 0, -.67 * H), Mf("shoes", shoes, .02), hp)
            d["hip" + side] = hp
        bd, bw, bh = .36 * W_, .52 * W_, .7 * H
        d["body"] = box(f"{nm}_body", (bd, bw, bh), (0, 0, .70 * H + bh / 2), Mf("coat", coat), root)
        if belly:
            box(f"{nm}_belly", (belly + .1, bw * .86, .42 * H), (bd / 2 + belly / 2 - .05, 0, .97 * H), Mf("coat", coat), root)
        if skirt:
            box(f"{nm}_skirt", (bd + .2, bw + .18, .42 * H), (0, 0, .62 * H), Mf("coat", coat), root)
        neck = empty(f"{nm}_neck", (0, 0, 1.40 * H), root); d["neck"] = neck
        d["head"] = box(f"{nm}_head", (head, head * .96, head), (0, 0, head / 2 + .01), Mf("skin", skin, .02), neck)
        sy = bw / 2 + .08
        for side, s in (("L", 1), ("R", -1)):
            sh = empty(f"{nm}_sh{side}", (0, s * sy, 1.33 * H), root)
            box(f"{nm}_arm{side}", (.15, .15, .56 * H), (0, 0, -.28 * H), Mf("coat", coat), sh)
            box(f"{nm}_hand{side}", (.14, .14, .14), (0, 0, -.6 * H), Mf("skin", skin, .02), sh)
            d["sh" + side] = sh; d["tip" + side] = empty(f"{nm}_tip{side}", (0, 0, -.6 * H), sh)
        d["front"] = bd / 2 + belly
        d["HX"] = head / 2 + .012
        return d
    W.figure = figure

    def eyes(d, nm, z, h, w=.085, y=.095, grp=None, ink=None, hx=None):
        hx = (d["HX"] if hx is None else hx)
        g = grp or d["neck"]
        for s in (-1, 1): box(f"{nm}{s}", (.03, w, h), (hx, s * y, z), ink or M["ink"], g)
    W.eyes = eyes

    # ----- the face library: one group per face under the neck, swapped with vis(); hl = the eye highlight -----
    def make_faces(d, brow_mat, blush=True):
        nk, HX = d["neck"], d["HX"]; nm = d["name"]; F = {}
        def grp(n): g = empty(f"{nm}_{n}", (0, 0, 0), nk); F[n] = g; return g
        def brows(g, n, z=.355, tilt=0., w=.1, zin=None):
            for s in (-1, 1):
                b = box(f"{nm}_brow_{n}{s}", (.03, w, .03), (HX, s * .095, z if zin is None else (zin if s == 1 else z)), brow_mat, g)
                b.rotation_euler = (R(tilt * s), 0, 0)
        def mouth(g, n, kind, w=.1):
            if kind == "smile":
                box(f"{nm}_mouth_{n}", (.03, w, .035), (HX, 0, .08), M["ink"], g)
                for s in (-1, 1): box(f"{nm}_mouthC_{n}{s}", (.03, .04, .04), (HX, s * (w / 2 + .015), .1), M["ink"], g)
            elif kind == "line": box(f"{nm}_mouth_{n}", (.03, w, .03), (HX, 0, .085), M["ink"], g)
            elif kind == "frown":
                box(f"{nm}_mouth_{n}", (.03, w, .035), (HX, 0, .1), M["ink"], g)
                for s in (-1, 1): box(f"{nm}_mouthC_{n}{s}", (.03, .04, .04), (HX, s * (w / 2 + .015), .08), M["ink"], g)
            elif kind == "open": box(f"{nm}_mouth_{n}", (.03, .09, .1), (HX, 0, .075), M["ink"], g)
            elif kind == "laugh":
                box(f"{nm}_mouth_{n}", (.03, .16, .11), (HX, 0, .075), M["ink"], g)
                box(f"{nm}_tongue_{n}", (.032, .08, .04), (HX, 0, .04), M["pink"], g)
            elif kind == "small": box(f"{nm}_mouth_{n}", (.03, .06, .03), (HX, 0, .085), M["ink"], g)
        # scripted (take 07 "happy"): the NPC smile with the blush; polite: the corners dropped; flat: lids and a line
        g = grp("scripted"); eyes(d, f"{nm}_eye_scripted", .27, .1, grp=g); brows(g, "scripted"); mouth(g, "scripted", "smile")
        if blush:
            for s in (-1, 1): box(f"{nm}_blush{s}", (.03, .07, .05), (HX - .003, s * .15, .2), M["pink"], g)
        g = grp("polite"); eyes(d, f"{nm}_eye_polite", .27, .1, grp=g); brows(g, "polite"); mouth(g, "polite", "smile")
        g = grp("flat"); eyes(d, f"{nm}_eye_flat", .255, .04, grp=g); mouth(g, "flat", "line", .15)
        for s in (-1, 1): box(f"{nm}_lid_flat{s}", (.03, .1, .035), (HX, s * .095, .295), brow_mat, g)
        # doubt: one brow up, eyes to the side, a small mouth
        g = grp("doubt"); eyes(d, f"{nm}_eye_doubt", .265, .08, y=.075, grp=g)
        for s in (-1, 1): box(f"{nm}_pupil_doubt{s}", (.032, .035, .05), (HX + .002, s * .075 + .025, .262), M["ink"], g)
        brows(g, "doubt", z=.34, zin=.385); mouth(g, "doubt", "small")
        # fear: eyes wide, brows up and in, mouth a line
        g = grp("fear"); eyes(d, f"{nm}_eye_fear", .27, .13, w=.1, grp=g); brows(g, "fear", z=.4, tilt=18); mouth(g, "fear", "line", .08)
        # grief: eyes shut (lids only), brows up at the inner ends, frown
        g = grp("grief")
        for s in (-1, 1): box(f"{nm}_shut_grief{s}", (.03, .1, .03), (HX, s * .095, .26), M["ink"], g)
        brows(g, "grief", z=.37, tilt=-16); mouth(g, "grief", "frown")
        # wonder: eyes wide, brows high, mouth open
        g = grp("wonder"); eyes(d, f"{nm}_eye_wonder", .27, .12, w=.1, grp=g); brows(g, "wonder", z=.41); mouth(g, "wonder", "open")
        # tender: eyes soft (half lids), a small smile
        g = grp("tender"); eyes(d, f"{nm}_eye_tender", .262, .07, grp=g); brows(g, "tender", z=.345, tilt=-8); mouth(g, "tender", "smile", .08)
        for s in (-1, 1): box(f"{nm}_lid_tender{s}", (.03, .1, .025), (HX, s * .095, .305), brow_mat, g)
        # laugh: eyes shut in arcs (two short lids), the big open mouth
        g = grp("laugh")
        for s in (-1, 1):
            box(f"{nm}_arc_laugh{s}", (.03, .1, .03), (HX, s * .095, .275), M["ink"], g)
            box(f"{nm}_arcEnd_laugh{s}a", (.03, .03, .03), (HX, s * .095 - .05, .255), M["ink"], g)
            box(f"{nm}_arcEnd_laugh{s}b", (.03, .03, .03), (HX, s * .095 + .05, .255), M["ink"], g)
        brows(g, "laugh", z=.38); mouth(g, "laugh", "laugh")
        # the highlight: one white pixel at the upper outer corner of each eye, a group of its own
        g = grp("hl")
        for s in (-1, 1): box(f"{nm}_hl{s}", (.034, .03, .03), (HX + .004, s * .125, .295), M["white"], g)
        return F
    W.make_faces = make_faces

    def face_default(F, f0, on="scripted", hl=False):
        for n, g in F.items(): vis(g, f0, n == on or (n == "hl" and hl))
    W.face_default = face_default

    # ----- the shopkeeper (take 07, apron fixed: a pocket, a darker hem, straps that read) -----
    SK = figure("keeper", "#d9a23a", "#5a3f2a", "#e9b98f", "#2a1e16", H=1.0, W_=1.3, belly=.2)
    Mk = SK["M"]; nk = SK["neck"]; HX = SK["HX"]
    apron = Mk("apron", "#f6f0e2", .03); apronD = Mk("apronD", "#d9d0bb", .03)
    box("keeper_apronLow", (.05, .62, .72), (SK["front"] + .02, 0, .93), apron, SK["root"])
    box("keeper_apronHem", (.052, .62, .07), (SK["front"] + .02, 0, .6), apronD, SK["root"])
    box("keeper_apronPocket", (.054, .22, .16), (SK["front"] + .025, .12, .82), apronD, SK["root"])
    box("keeper_apronBib", (.03, .4, .2), (.18 * 1.3 + .015, 0, 1.28), apron, SK["root"])
    box("keeper_apronBack", (.36 * 1.3 + .04, .69, .06), (0, 0, 1.04), apronD, SK["root"])
    for s in (-1, 1): box(f"keeper_apronStrap{s}", (.36 * 1.3 + .03, .05, .06), (0, s * .17, 1.37), apronD, SK["root"])
    hairM = Mk("hair", "#4a2c18")
    blocks("keeper_hair", [((.44, .42, .08), (-.01, 0, .43)), ((.13, .42, .26), (-.16, 0, .3)), ((.2, .05, .16), (-.06, .205, .32)), ((.2, .05, .16), (-.06, -.205, .32))], hairM, nk)
    stache = Mk("stache", "#3b2516", .02)
    box("keeper_stache", (.04, .26, .065), (HX + .005, 0, .158), stache, nk)
    for s in (-1, 1): box(f"keeper_stacheEnd{s}", (.04, .06, .1), (HX + .005, s * .14, .13), stache, nk)
    SK["F"] = make_faces(SK, stache)
    W.keeper = SK

    # his reflection: his head drawn smooth (a sphere, with the hair, the moustache and two eyes), under the water's
    # surface, looking up. The only sharp thing in the village. root = the head's centre; the act places it under his
    # real head and pitches the neck so the face looks up and out. Names CL_refl_* go on the sharp list.
    rroot = empty("refl", (PC[0] - 1.3, PC[1], -.26))
    rskin = smooth_mat("reflSkin", "#c49a78"); rhair = smooth_mat("reflHair", "#3a2213")
    rneck = empty("refl_neck", (0, 0, 0), rroot)
    rh = sphere("refl_head", (0, 0, 0), .22, rskin); rh.parent = rneck
    rhr = sphere("refl_hair", (-.06, 0, .08), .2, rhair, scale=(1, 1.05, .75)); rhr.parent = rneck
    rst = sphere("refl_stache", (.2, 0, -.08), .07, rhair, scale=(.5, 2.0, .5)); rst.parent = rneck
    for s in (-1, 1):
        e = sphere(f"refl_eye{s}", (.2, s * .095, .05), .03, smooth_mat(f"reflEye{s}", "#1e1a14"), scale=(.4, 1, 1.3)); e.parent = rneck
        hl_ = sphere(f"refl_hl{s}", (.215, s * .115, .075), .012, smooth_mat(f"reflHl{s}", "#ffffff")); hl_.parent = rneck
    W.refl = dict(root=rroot, neck=rneck)
    W.REFL_NAMES = [o.name for o in [rroot] + list(rroot.children_recursive) if o.type == "MESH"]

    # ----- the heroes (take 07): three built here, the same hero really; acts add more with W.make_hero -----
    def make_hero(nm, plume="#c8341e"):
        h = figure(nm, "#7d8fa3", "#4c5a6a", "#efd9b9", "#3a4452", H=1.0, W_=1.05, head=.4)
        Mh = h["M"]; hn = h["neck"]
        helm = Mh("helm", "#b3c0cc", .04)
        blocks(nm + "_helmet", [((.46, .44, .14), (0, 0, .41)), ((.12, .44, .3), (-.17, 0, .26)), ((.28, .06, .2), (-.06, .21, .27)),
                                ((.28, .06, .2), (-.06, -.21, .27)), ((.05, .06, .15), (.215, 0, .24))], helm, hn)
        box(nm + "_band", (.47, .45, .04), (0, 0, .345), Mh("band", "#e8b23a", .02), hn)
        blocks(nm + "_plume", [((.08, .07, .2), (0, 0, .58)), ((.3, .07, .08), (-.12, 0, .64)), ((.08, .07, .14), (-.25, 0, .58))], Mh("plume", plume, .03), hn)
        eyes(h, nm + "_eye", .23, .085, w=.075, y=.09, hx=.21 + .012)
        box(nm + "_chest", (.04, .42, .42), (.36 * 1.05 / 2 + .02, 0, 1.12), helm, h["root"])
        shield = empty(nm + "_shield", (0, .11, -.33), h["shL"])
        box(nm + "_shieldFace", (.5, .06, .62), (0, 0, 0), Mh("shield", "#c8341e", .04), shield)
        box(nm + "_shieldRim", (.56, .04, .68), (0, -.015, 0), Mh("rim", "#e8b23a", .02), shield)
        box(nm + "_shieldBoss", (.14, .05, .14), (0, .04, 0), Mh("rim", "#e8b23a", .02), shield)
        h["sword"] = sword(nm + "_sword", h["shR"], (0, 0, -.6), (R(180), 0, 0))
        vis(h["sword"], F0, False); pose(h, F0, PARK, 0)
        return h
    W.make_hero = make_hero
    HEROES = [make_hero(f"hero{i}", plume) for i, plume in enumerate(("#c8341e", "#3f6f8f", "#e8b23a"))]
    W.heroes = HEROES

    # ----- the flower seller: green dress, straw hat, a watering can in her right hand -----
    FL = figure("seller", "#5f9e6a", "#4b7a53", "#e9c4a0", "#5a3a2a", H=.96, W_=1.0, head=.4, skirt=True)
    Mf = FL["M"]; fn = FL["neck"]
    blocks("seller_hair", [((.42, .4, .08), (-.01, 0, .41)), ((.14, .4, .34), (-.15, 0, .24)), ((.1, .12, .5), (-.12, .18, .08)), ((.1, .12, .5), (-.12, -.18, .08))], Mf("hair", "#7a4a2a"), fn)
    box("seller_brim", (.66, .62, .05), (0, 0, .44), M["straw"], fn)
    box("seller_crown", (.4, .38, .2), (0, 0, .56), M["straw"], fn)
    box("seller_band", (.42, .4, .05), (0, 0, .49), M["red"], fn)
    FL["F"] = make_faces(FL, Mf("brow", "#5a3520", .02), blush=False)
    can = empty("can", (0, 0, -.62), FL["shR"])
    box("can_body", (.26, .2, .24), (0, 0, -.14), M["tin"], can)
    box("can_spout", (.3, .05, .05), (.22, 0, -.06), M["tin"], can, rot=(0, R(-25), 0))
    box("can_handle", (.06, .06, .16), (-.1, 0, .05), M["tin"], can)
    FL["can"] = can
    # her flower, carried: a copy she can hold out (parented to her left hand tip)
    hand_flower = blocks("handFlower", [((.04, .04, .3), (0, 0, .15)), ((.14, .14, .12), (0, 0, .33)), ((.07, .07, .05), (0, 0, .4))], M["flowR"], FL["tipL"])
    hand_flower.rotation_euler = (0, R(-60), 0); FL["flower"] = hand_flower
    W.seller = FL

    # ----- the guard: full-face helmet with a slit, a spear; and his board doubles -----
    def guard(nm):
        g = figure(nm, "#6c7684", "#3f4652", "#efd9b9", "#2a2e36", H=1.02, W_=1.1, head=.4)
        Mg = g["M"]; gn = g["neck"]
        helm = Mg("helm", "#8f9ba6", .04)
        blocks(nm + "_helmet", [((.46, .44, .46), (0, 0, .22))], helm, gn)
        for s in (-1, 1): box(f"{nm}_slit{s}", (.04, .1, .035), (.22 + .012, s * .09, .27), M["ink"], gn)
        box(nm + "_crest", (.3, .06, .1), (-.05, 0, .5), Mg("crest", "#c8341e", .03), gn)
        spear = empty(nm + "_spear", (0, 0, -.6), g["shR"])
        box(nm + "_shaft", (.05, .05, 2.3), (0, 0, .55), M["wood2"], spear)
        box(nm + "_head", (.06, .05, .3), (0, 0, 1.78), M["steel"], spear)
        g["spear"] = spear
        return g
    W.guard = guard("guard")
    # four more guards for the line (act 4): the same model; `board` turns one into a cut-out on a prop stand
    W.guards = [guard(f"guard{i}") for i in range(1, 5)]
    for g in W.guards:
        st = box(g["name"] + "_stand", (1.6, .12, .12), (-.8, 0, .06), M["wood2"], g["root"], rot=(0, R(-70), 0))
        st.hide_render = True; st.hide_viewport = True; g["stand"] = st

    def board(g, f, on=True):
        """flatten a guard into a painted cut-out: x-scale near zero (he is a board), the stand shows behind him"""
        key(g["root"], f, scale=(.07 if on else 1.0, 1.0, 1.0))
        vis(g["stand"], f, on)
    W.board = board

    # ----- the fisher: sits on the dock's end with a rod; the fish sprite laps under the float -----
    FI = figure("fisher", "#3f6f8f", "#5a4a3a", "#e3bb95", "#2a1e16", H=.95, W_=1.05, head=.38)
    blocks("fisher_hat", [((.5, .48, .06), (0, 0, .4)), ((.3, .28, .16), (0, 0, .5))], FI["M"]("hat", "#6b4a2e"), FI["neck"])
    eyes(FI, "fisher_eye", .24, .07, w=.07, y=.085)
    box("fisher_mouth", (.03, .08, .03), (FI["HX"], 0, .08), M["ink"], FI["neck"])
    rod = empty("rod", (0, 0, -.6), FI["shR"])
    box("rod_shaft", (.04, .04, 1.9), (0, 0, .7), M["wood2"], rod); rod.rotation_euler = (0, R(118), 0)   # the rod points forward over the water from the lowered arm
    FI["rod"] = rod
    W.fisher = FI

    # ----- the Mayor on the balcony, reading the same scroll -----
    MY = figure("mayor", "#6a3f8a", "#3a2a4a", "#e9c4a0", "#2a1e16", H=.98, W_=1.2, head=.42, belly=.12)
    blocks("mayor_hair", [((.44, .42, .08), (-.01, 0, .43)), ((.13, .42, .2), (-.16, 0, .33))], MY["M"]("hair", "#d8d2c4"), MY["neck"])
    box("mayor_chain", (.05, .36, .06), (MY["front"] - .05, 0, 1.22), M["gold"], MY["root"])
    eyes(MY, "mayor_eye", .25, .08); box("mayor_mouth", (.03, .09, .03), (MY["HX"], 0, .08), M["ink"], MY["neck"])
    scroll = empty("scroll", (0, 0, -.55), MY["shL"])
    box("scroll_sheet", (.03, .5, .36), (.12, .3, -.05), M["cream"], scroll)
    for i in range(4): box(f"scroll_line{i}", (.035, .36, .025), (.125, .3, .08 - .07 * i), M["ink"], scroll)
    box("scroll_roll", (.07, .07, .4), (.12, .55, -.05), M["plank"], scroll)
    MY["scroll"] = scroll
    W.mayor = MY

    # ----- the bird: two blocks that cross the sky on the same path every 8 s -----
    bird = blocks("bird", [((.3, .08, .06), (0, 0, 0)), ((.1, .5, .05), (-.05, 0, .03))], M["ink"]); W.bird = bird

    # ----- the prompt: "Continue?" with one button, floating over a head; off by default -----
    prompt = empty("prompt", (0, 0, -60))
    box("prompt_panel", (.06, 1.1, .5), (0, 0, 0), M["panel"], prompt)
    box("prompt_frame", (.05, 1.18, .58), (-.01, 0, 0), M["ink"], prompt)
    for i, w in enumerate((.55, .42)): box(f"prompt_text{i}", (.07, w, .05), (.005, -.17 + .0 * i, .14 - .1 * i), M["charcoal"], prompt)
    box("prompt_qmark", (.07, .06, .1), (.005, .14, .11), M["charcoal"], prompt)
    box("prompt_button", (.07, .4, .15), (.005, .25, -.12), M["button"], prompt)
    box("prompt_btnText", (.075, .22, .04), (.01, .25, -.12), M["white"], prompt)
    W.prompt = prompt


    # ==================================================================================================
    # the loops: every NPC on rails, the same motion every period. Acts call village_loops(f0, f1) once.
    # ==================================================================================================
    LOOP = dict(guard=4.0, seller=3.0, fisher=6.0, fish=8.0, mayor=6.0, bird=8.0)
    def seller_wave(f0, f1, strength=1.0):
        """her wave on cue: the left arm up, two beats, down; the same count every time (an act keys it over the loop)"""
        for f in range(f0, f1 + 1):
            u = seg(f, f0, f1); up = ease(seg(u, 0, .25)) * (1 - ease(seg(u, .75, 1.0)))
            wag = 14 * math.sin((f - f0) / 2.0) * up
            pose(W.seller, f, (W.FS[0] - .95, W.FS[1] + .05, 0), -25 + 60 * up * strength, lean=2, neck=(4, 0), shL=(4 + 140 * up * strength + wag, 0), shR=(0, -62))
    W.seller_wave = seller_wave

    def village_loops(f0, f1, keeper_home=True):
        """key the village's background loops for [f0, f1]: the guard's four steps and back on the east road, the
        seller watering her pot, the fisher's cast, the fish sprite's lap, the Mayor's scroll, the bird. Song-timed,
        so the same frame always shows the same beat of each loop."""
        H2 = W.HOUSES[2]
        for f in range(f0, f1 + 1):
            t = f / 24.0
            # guard: 4 steps east (2 s), turn, 4 steps west
            u = (t % LOOP["guard"]) / LOOP["guard"]
            if u < .5: x, yaw, d = 26.5 + 2.8 * (u / .5), 0, 2.8 * (u / .5)
            else: x, yaw, d = 29.3 - 2.8 * ((u - .5) / .5), 180, 2.8 * ((u - .5) / .5)
            sw, bob = swing(d)
            pose(W.guard, f, (x, -1.6, bob), yaw, hips=(sw, -sw), shL=(6, -sw * .3), shR=(-8, 0))
            # seller: tips the can over the pot, then back; the same count every time
            u = (t % LOOP["seller"]) / LOOP["seller"]; tip = ease(seg(u, .1, .35)) * (1 - ease(seg(u, .7, .95)))
            pose(W.seller, f, (W.FS[0] - .95, W.FS[1] + .05, 0), -25, lean=2 + 3 * tip, neck=(8 + 8 * tip, 0), shL=(0, -8), shR=(0, -62 - 40 * tip))
            # fisher: sits on the dock's end; the rod lifts and drops once a loop, the float bobs
            u = (t % LOOP["fisher"]) / LOOP["fisher"]; lift = math.sin(math.pi * seg(u, .55, .8))
            sit(W.fisher, f, (W.PC[0] - 2.5, W.PC[1] - .45, .12), 0, lean=2, neck=(8 - 10 * lift, 0), shL=(0, -20), shR=(0, -62 + 50 * lift))
            key(W.rodFloat, f, loc=(W.PC[0] - .4, W.PC[1] + .25, -.01 + .02 * math.sin(t * 2.5)))
            # fish: one lap of an ellipse under the surface
            u = (t % LOOP["fish"]) / LOOP["fish"]; a = 2 * math.pi * u
            key(W.fish, f, loc=(W.PC[0] + 1.6 * math.cos(a), W.PC[1] + .9 * math.sin(a), -.14), rot=(0, 0, a + math.pi / 2))
            # mayor: reads, nods on the half, lifts the scroll on the whole
            u = (t % LOOP["mayor"]) / LOOP["mayor"]; nod = math.sin(math.pi * seg(u, .4, .6)); lift = math.sin(math.pi * seg(u, .85, 1.0))
            pose(W.mayor, f, (H2[0] - .2, H2[1] - H2[3] / 2 - .5, H2[4] - .22), -90, neck=(16 + 10 * nod, 0), shL=(0, -70 - 30 * lift), shR=(0, -64))
            # bird: the same arc across the square, left to right, once a loop, parked the rest of the time
            u = (t % LOOP["bird"]) / LOOP["bird"]
            if u < .45:
                v = u / .45; flap = .12 * math.sin(t * 18)
                key(W.bird, f, loc=(-20 + 44 * v, 14 - 6 * v, 9 + 1.5 * math.sin(math.pi * v) + flap), rot=(0, 0, R(-8)))
            else: key(W.bird, f, loc=PARK)
            if keeper_home:
                pose(W.keeper, f, (-.6, .85, .006 * math.sin(f / 9.0)), -82, shL=(9, 0), shR=(-9, 0))
    W.village_loops = village_loops
    W.LOOP = LOOP
    # ==================================================================================================
    # light and world: states, keyed by the acts
    # ==================================================================================================
    sd = bpy.data.lights.new("CL_sun", "SUN"); sd.angle = R(8)
    sunL = bpy.data.objects.new("CL_sun", sd); scene.collection.objects.link(sunL); sunL.rotation_euler = (R(48), R(-14), R(-32))
    spd = bpy.data.lights.new("CL_spill", "SPOT"); spd.spot_size = R(120); spd.spot_blend = .4; spd.shadow_soft_size = .05
    spd.color = hex_lin("#ffb36b")
    spill = bpy.data.objects.new("CL_spill", spd); scene.collection.objects.link(spill)
    spill.location = (WX + 2.2, Y5 + .15, 2.0)
    spill.rotation_euler = (Vector((-1, 0, -.22))).to_track_quat("-Z", "Y").to_euler()
    glw = bpy.data.lights.new("CL_glow", "POINT"); glw.color = hex_lin("#ffc48a"); glw.shadow_soft_size = .4
    glow = bpy.data.objects.new("CL_glow", glw); scene.collection.objects.link(glow); glow.location = (WX - .9, Y5, 1.4)
    wd = bpy.data.worlds.new("CL_world"); scene.world = wd; wd.use_nodes = True
    wn = wd.node_tree; wn.nodes.clear()
    wo = wn.nodes.new("ShaderNodeOutputWorld"); bg = wn.nodes.new("ShaderNodeBackground"); wn.links.new(bg.outputs[0], wo.inputs[0])
    W.sun, W.spill, W.glow, W.bg = sd, spd, glw, bg

    LIGHT = dict(
        noon=dict(sun=(3.6, "#fff4e2"), bg=("#a6cbe6", 1.0), spill=0, glow=0),
        night=dict(sun=(.5, "#8fa3d8"), bg=("#101a3a", 1.0), spill=0, glow=0),           # the game's night: one frame
        edge=dict(sun=(2.2, "#dfe6ff"), bg=("#0c1430", 1.0), spill=0, glow=0),
        void=dict(sun=(.9, "#c9d4ff"), bg=("#0c1430", 1.0), spill=1500, glow=25),
    )
    def light(f, state, crack=0.0):
        """key the lights for a state at frame f; `crack` 0..1 opens the warm light from the crack"""
        L = LIGHT[state]
        sd.energy, sd.color = L["sun"][0], hex_lin(L["sun"][1])
        sd.keyframe_insert("energy", frame=f); sd.keyframe_insert("color", frame=f)
        bg.inputs["Color"].default_value = (*hex_lin(L["bg"][0]), 1); bg.inputs["Strength"].default_value = L["bg"][1]
        bg.inputs["Color"].keyframe_insert("default_value", frame=f); bg.inputs["Strength"].keyframe_insert("default_value", frame=f)
        spd.energy = L["spill"] + 9000 * (1 - (1 - crack) ** 2) * (1 if L["spill"] else 0); spd.keyframe_insert("energy", frame=f)
        glw.energy = L["glow"] + 120 * crack * (1 if L["glow"] else 0); glw.keyframe_insert("energy", frame=f)
    W.light = light

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
    def finish_steps():
        """call once after all keys: constant interpolation on every light/world/visibility key that steps"""
        const_all(sd); const_all(wn)
        for ob in scene.objects: const_all(ob)
    W.finish_steps = finish_steps

    # ==================================================================================================
    # shots
    # ==================================================================================================
    W.SHOTS = []
    def shot(nm, f0, f1, la, lb, ta, tb, lens=35, track=None):
        if track: la, ta = track(f0)
        cam = shot_camera(nm, la, ta, lens=lens); tgt = bpy.data.objects[cam["target"]]
        for f in range(f0, f1 + 1):
            if track: l, t = track(f)
            else:
                u = ease(seg(f, f0, f1)) * .5 + seg(f, f0, f1) * .5
                l, t = V3(la, lb, u), V3(ta, tb, u)
            key(cam, f, loc=l); key(tgt, f, loc=t)
        cut(f0, cam); W.SHOTS.append((nm, f0, f1))
        return cam
    W.shot = shot

    # defaults: everything parked, the skies up, the far set hidden, the game faces on
    park_all(F0)
    vis(skyEnd, F0, True); vis(skyWest, F0, True); vis(skySouth, F0, True); vis(shutter, F0, False)
    for ob in [W.wallLo, W.wallHi, W.rimLo, W.rimHi] + SR: vis(ob, F0, False)
    vis(rroot, F0, False)
    for g in W.guards: vis(g["root"], F0, False)
    vis(W.flySword, F0, False); vis(W.wallSword, F0, True)
    for h in HEROES: vis(h["sword"], F0, False)
    face_default(SK["F"], F0, "scripted"); face_default(FL["F"], F0, "scripted")
    vis(FL["flower"], F0, False)
    light(F0, "noon")
    return W
