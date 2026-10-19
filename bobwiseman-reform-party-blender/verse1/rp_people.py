"""The Instrument People of draft 24 (js/dali/instruments.js) for verse 1, 16.70-31.66 s.

Five burners in single file 8 m beyond the far row (z 10.5), walking with the car: left to right as the camera sees
them the LENS (magnifying glass), MIC (stage-mic ball), CAMERA (folding press camera), RADIO (arched valve radio) and
RECORDER (reel-to-reel deck). Same body on all five (pale dust coveralls, boots, a coloured sash shoulder to hip); the
recorder's owner also wears the scientist's open white lab coat with a pocket and two pens.

In this window nothing is confiscated yet (the recorder goes on "every", 32.94 s). What happens: they walk on the
song's 100 bpm beat (ipBody: feet lift and sway, a small bob, arms swing), the reels turn and the dial needle
wavers while the heads work, and on "can't" (24.76 s) all five die at once: the recorder's reels stop and its red
record lamp goes out, the tape goes slack, the radio's needle drops out of the blue sector, the camera's pilot light
goes out, the mic's band light goes dark and the lens clouds over.

State comes from tools/probes/people.js (out/state/people.json). Draft (x right, y up, z away) -> Blender B().
The draft draws them front-on; here they face the board and the camera (front toward -Y).
"""
import math

import bmesh
import bpy
from mathutils import Matrix, Vector

import rp_core as K
from rp_core import B, clamp, lerp

P = K.state("people")
CUE = P[0]["cues"]
KINDS = CUE["lr"]
SASH = CUE["sash"]
COLLAR = CUE["collar"]
COL = K.collection("RP_People")
M = K.M

SUIT, BOOT, COAT, HAND = "#efe9dc", "#34302f", "#fbfbf8", "#c9b48f"


def key_hidden(ob, hidden):
    K.key_series(ob, "hide_render", [1.0 if h else 0.0 for h in hidden], interp="CONSTANT")
    K.key_series(ob, "hide_viewport", [1.0 if h else 0.0 for h in hidden], interp="CONSTANT")


def tag(ob):
    ob["rp_char"] = 1
    return ob


def glass(name, hexc, rough=0.04, alpha=1.0):
    """Clear glass (transmission) with the shared distance haze."""
    mat = bpy.data.materials.new("RP_" + name)
    mat.use_nodes = True
    n, l = mat.node_tree.nodes, mat.node_tree.links
    n.clear()
    bs = n.new("ShaderNodeBsdfPrincipled")
    bs.inputs["Base Color"].default_value = K.lin(hexc)
    bs.inputs["Roughness"].default_value = rough
    bs.inputs["Transmission Weight"].default_value = 1.0
    bs.inputs["IOR"].default_value = 1.5
    bs.inputs["Alpha"].default_value = alpha
    K.pbr_out(n, l, bs.outputs[0])
    return mat


def mats():
    T, F = K.toon, K.flat
    pal = {
        "p_suit": lambda: T("IPSuitCoverall", SUIT, shadow="#b9b2a4"),
        "p_coat": lambda: T("LabCoatSuit", COAT, shadow="#c4c4bf"),
        "p_coatin": lambda: T("LabCoatLapelSuit", "#e4e4df", shadow="#aaaaa5"),
        "p_seam": lambda: T("IPSeamSuit", "#c9c1b0"),
        "p_boot": lambda: T("IPBootShoe", BOOT),
        "p_hand": lambda: T("IPHandSkin", HAND, shadow="#988664"),
        "p_collar": lambda: T("IPCollarShirt", "#d9d1bf"),
        "p_hole": lambda: F("IPHole", "#1c1a1e"),
        "p_pen_b": lambda: T("PenBluePlastic", "#2f6fb5"),
        "p_pen_r": lambda: T("PenRedPlastic", "#c8392b"),
        # recorder
        "r_case": lambda: T("RecorderCaseWood", "#8f6d48"),
        "r_lid": lambda: T("RecorderLidWood", "#a9875e"),
        "r_panel": lambda: T("RecorderPanelPlastic", "#c7c1b3"),
        "r_key": lambda: T("RecorderKeyPlastic", "#3a3a40"),
        "r_reel": lambda: T("ReelSteel", "#d3d6d6"),
        "r_tape": lambda: T("ReelTapePlastic", "#4a2e1c"),
        "r_hub": lambda: T("ReelHubPlastic", "#2a2a2e"),
        "r_red": lambda: F("RecLampOn", "#ff3a26", 6.0),
        # radio
        "a_cab": lambda: T("RadioCabinetWood", "#43699a"),
        "a_dark": lambda: T("RadioPlinthWood", "#2c4a70"),
        "a_cloth": lambda: T("RadioGrilleClothCanvas", "#cdb88e"),
        "a_bar": lambda: T("RadioBarWood", "#2c4a70"),
        "a_dial": lambda: T("RadioDialPaper", "#efe6cf"),
        "a_blue": lambda: F("RadioDialBlue", "#2f6fd0"),
        "a_ring": lambda: T("RadioDialRimGold", "#c9a46a"),
        "a_needle": lambda: T("RadioNeedlePlastic", "#8f1d1d"),
        "a_knob": lambda: T("RadioKnobPlastic", "#d8cfb8"),
        "a_glow": lambda: F("RadioDialGlow", "#ffd68c", 3.0),
        # camera
        "c_body": lambda: T("PressCamChassis", "#34302f"),
        "c_bell": lambda: T("PressCamBellowsCloth", "#1f1c1e"),
        "c_bell2": lambda: T("PressCamBellows2Cloth", "#4a4446"),
        "c_brass": lambda: T("PressCamBrassGold", "#c9a46a"),
        "c_wire": lambda: T("PressCamFinderSteel", "#8d8a84"),
        "c_barrel": lambda: T("PressCamBarrelPlastic", "#1e1d21"),
        "c_glass": lambda: glass("PressCamLensGlass", "#5d7f9a", rough=0.08),
        "c_pilot": lambda: F("PressCamPilot", "#ffc23c", 8.0),
        "c_pilotoff": lambda: T("PressCamPilotOffPlastic", "#5a4a3a"),
        # mic
        "m_dark": lambda: T("MicHandlePlastic", "#2a2a2e"),
        "m_band": lambda: T("MicBandPlastic", "#2c2c30"),
        "m_lit": lambda: F("MicBandLit", "#78d2ff", 6.0),
        "m_dead": lambda: T("MicBandDeadPlastic", "#55585e"),
        "m_ball": lambda: T("MicBallSteel", "#c9cccd"),
        "m_mesh": lambda: T("MicMeshGrille", "#8f9396"),
        # lens
        "l_handle": lambda: T("LensHandleWood", "#5a3a24"),
        "l_brass": lambda: T("LensRimGold", "#c9a46a"),
        "l_rim2": lambda: T("LensRimDarkGold", "#8a6a2e"),
        "l_glass": lambda: glass("MagnifierGlass", "#dfe9f2", rough=0.02),
        "l_cloud": lambda: T("LensCloudCeramic", "#c4c6c7"),
    }
    pal.update({"sash_" + k: (lambda k=k: T("IPSash%sBand" % k.title(), SASH[k])) for k in KINDS})
    for k, fn in pal.items():
        if k not in M:
            M[k] = fn()


def f2(x, y, d=0.0):
    """Draft head/body drawing coords (metres, y up negative) -> local Blender (x, depth, up)."""
    return Vector((x, d, -y))


def rotY(a):
    return Matrix.Rotation(a, 4, "Y")


ROTX90 = Matrix.Rotation(math.pi / 2, 4, "X")   # a disc / cylinder facing the camera (axis along Y)


def ring(b, mat, c, R, r, seg=40, rs=10):
    """A torus in the XZ plane (facing -Y) centred at c."""
    rows = []
    for j in range(rs + 1):
        a = j / rs * 2 * math.pi
        rr, dy = R + r * math.cos(a), r * math.sin(a)
        rows.append([Vector(c) + Vector((rr * math.cos(i / seg * 2 * math.pi), dy, rr * math.sin(i / seg * 2 * math.pi))) for i in range(seg + 1)])
    b.strip(mat, rows)


def part(b, name, parent, loc=(0, 0, 0), smooth=True):
    ob = b.build(name, COL, parent=parent, smooth=smooth, loc=loc)
    return tag(ob)


# =============================================================================================
# heads (origin at the collar point; built in the draft's head metres)
# =============================================================================================
def head_recorder(kind, root, on, run):
    b = K.Builder()
    D = 0.36
    b.box(M["r_hub"], f2(0, -.06), (.2, .2, .12))
    b.box(M["r_case"], f2(0, -.45), (1.0, D, .7))
    b.box(M["r_lid"], f2(0, -.765), (1.02, D + .02, .07))
    b.box(M["r_panel"], f2(0, -.235, -D / 2), (.8, .03, .17))
    for i in range(3):
        b.box(M["r_key"], f2(-.245 + i * .16, -.23, -D / 2 - .02), (.11, .04, .08))
    b.box(M["r_key"], f2(0, -.385, -D / 2 - .02), (.14, .05, .09))       # the tape head
    head = part(b, "IP_%s_Head" % kind, root, loc=(0, 0, COLLAR + .01))
    # record key: red and lit while it works, dark after "can't"
    lamp = []
    for nm, mt in (("On", "r_red"), ("Off", "r_key")):
        b = K.Builder()
        b.box(M[mt], f2(.235, -.23, -D / 2 - .02), (.11, .04, .08))
        lamp.append(part(b, "IP_%s_Rec%s" % (kind, nm), head))
    key_hidden(lamp[0], [o < .5 for o in on])
    key_hidden(lamp[1], [o >= .5 for o in on])
    # the reels turn while it works (ph = ipRun * 3.4)
    for d, pack in ((-1, .19), (1, .12)):
        b = K.Builder()
        b.disc(M["r_reel"], (0, 0, 0), .28, seg=40, rot=ROTX90)
        b.cone(M["r_reel"], (0, .015, 0), .28, .28, .03, seg=40, rot=ROTX90)
        for h in range(3):
            a = h * 2 * math.pi / 3 + d
            b.cone(M["r_tape"], (math.cos(a) * .16, -.02, math.sin(a) * .16), .07, .07, .02, seg=16, rot=ROTX90)
        b.cone(M["r_tape"], (0, -.025, 0), pack * .45, pack * .45, .03, seg=24, rot=ROTX90)
        b.cone(M["r_hub"], (0, -.045, 0), .055, .055, .03, seg=16, rot=ROTX90)
        b.box(M["r_reel"], (.03, -.06, 0), (.03, .01, .015))
        reel = part(b, "IP_%s_Reel%d" % (kind, d), head, loc=f2(d * .25, -.63, -D / 2 - .03))
        K.key_series(reel, "rotation_euler", [r * 3.4 for r in run], index=1)
    # the tape between the reels, slack once it stops
    tapes = []
    for nm, sag in (("Taut", 0.0), ("Slack", .07)):
        b = K.Builder()
        pts = [(-.25, -.35), (-.12, -.36 + sag), (-.07, -.39), (.07, -.39), (.12, -.36 + sag), (.25, -.35)]
        for a, c in zip(pts, pts[1:]):
            b.rod(M["r_tape"], f2(*a, -D / 2 - .02), f2(*c, -D / 2 - .02), .01, seg=6)
        tapes.append(part(b, "IP_%s_Tape%s" % (kind, nm), head))
    key_hidden(tapes[0], [o < .5 for o in on])
    key_hidden(tapes[1], [o >= .5 for o in on])


def head_radio(kind, root, on, tt):
    b = K.Builder()
    D = .4
    b.box(M["a_dark"], f2(0, -.07), (1.1, D + .06, .1))
    b.box(M["a_cab"], f2(0, -.35), (1.0, D, .5))
    b.cone(M["a_cab"], f2(0, -.6), .5, .5, D, seg=48, rot=ROTX90)
    # the grille cloth: an arch inset in the front, three bars over it
    b.box(M["a_cloth"], f2(0, -.57, -D / 2), (.64, .02, .18))
    b.cone(M["a_cloth"], f2(0, -.66, -D / 2), .32, .32, .02, seg=40, rot=ROTX90)
    ring(b, M["a_bar"], f2(0, -.62, -D / 2), .42, .015, seg=48, rs=6)
    for x in (-.16, 0, .16):
        top = .66 + math.sqrt(max(0, .1024 - x * x))
        b.rod(M["a_bar"], f2(x, -.48, -D / 2 - .02), f2(x, -top + .02, -D / 2 - .02), .016, seg=6)
    # the dial and its blue sector
    b.cone(M["a_dial"], f2(0, -.29, -D / 2 - .005), .135, .135, .02, seg=32, rot=ROTX90)
    ring(b, M["a_ring"], f2(0, -.29, -D / 2 - .01), .135, .012, seg=32, rs=6)
    sec = [f2(0, -.29, -D / 2 - .02)]
    for i in range(9):
        a = -math.pi / 2 + .15 + .8 * i / 8          # canvas angle; y down
        sec.append(f2(math.cos(a) * .12, -.29 + math.sin(a) * .12, -D / 2 - .02))
    b.poly(M["a_blue"], [sec[0]] + sec[1:][::-1])
    for d in (-1, 1):
        b.cone(M["a_knob"], f2(d * .33, -.27, -D / 2 - .02), .06, .055, .05, seg=20, rot=ROTX90)
    head = part(b, "IP_%s_Head" % kind, root, loc=(0, 0, COLLAR + .01))
    # the needle: canvas angle na = -pi/2 + lerp(-1.2, .55 + .07 sin(2.3 t), on); up is -pi/2
    b = K.Builder()
    b.rod(M["a_needle"], (0, 0, 0), (0, 0, .12), .009, seg=6)
    b.cone(M["r_hub"], (0, 0, 0), .02, .02, .02, seg=12, rot=ROTX90)
    nd = part(b, "IP_%s_Needle" % kind, head, loc=f2(0, -.29, -D / 2 - .035))
    K.key_series(nd, "rotation_euler", [lerp(-1.2, .55 + .07 * math.sin(t * 2.3), o) for t, o in zip(tt, on)], index=1)
    # the valve glow behind the dial while it plays
    b = K.Builder()
    b.cone(M["a_glow"], f2(0, -.29, -D / 2 - .006), .1, .1, .006, seg=24, rot=ROTX90)
    gl = part(b, "IP_%s_Glow" % kind, head)
    key_hidden(gl, [o < .5 for o in on])


def head_camera(kind, root, on):
    b = K.Builder()
    D = .42
    b.box(M["c_body"], f2(0, -.45), (.88, D, .66))
    # bellows: three receding square frames stepping out of the front
    for i in range(3):
        s = .33 - i * .045
        b.box(M["c_bell2" if i % 2 else "c_bell"], f2(0, -.45, -D / 2 - .04 - i * .06), (2 * s, .07, 2 * s))
    # the brass front standard
    fy = -D / 2 - .2
    for (cx, cz, sx, sz) in ((0, -.66, .46, .04), (0, -.24, .46, .04), (-.21, -.45, .04, .46), (.21, -.45, .04, .46)):
        b.box(M["c_brass"], f2(cx, cz, fy), (sx, .04, sz))
    b.cone(M["c_barrel"], f2(0, -.45, fy - .05), .2, .19, .14, seg=40, rot=ROTX90)
    b.cone(M["c_glass"], f2(0, -.45, fy - .12), .15, .15, .02, seg=40, rot=ROTX90)
    ring(b, M["c_brass"], f2(0, -.45, fy - .12), .17, .012, seg=40, rs=6)
    # sports finder wire frame and the flash pan on its rod
    for a, c in (((-.34, -.76), (-.34, -.95)), ((-.34, -.95), (-.1, -.95)), ((-.1, -.95), (-.1, -.76))):
        b.rod(M["c_wire"], f2(*a, -.1), f2(*c, -.1), .011, seg=6)
    b.rod(M["c_wire"], f2(.3, -.76), f2(.3, -.97), .018, seg=8)
    b.cone(M["c_brass"], f2(.3, -.975), .2, .15, .05, seg=32)
    head = part(b, "IP_%s_Head" % kind, root, loc=(0, 0, COLLAR + .01))
    for nm, mt in (("On", "c_pilot"), ("Off", "c_pilotoff")):
        b = K.Builder()
        b.ellipsoid(M[mt], f2(.3, -1.03, 0), (.03, .03, .03), seg=12)
        p = part(b, "IP_%s_Pilot%s" % (kind, nm), head)
        key_hidden(p, [(o < .5) == (nm == "On") for o in on])


def head_mic(kind, root, on):
    b = K.Builder()
    b.cone(M["m_dark"], f2(0, -.16), .07, .12, .28, seg=24)
    b.cone(M["m_band"], f2(0, -.345), .2, .2, .09, seg=32)
    b.ellipsoid(M["m_ball"], f2(0, -.79), (.4, .4, .4), seg=40)
    head = part(b, "IP_%s_Head" % kind, root, loc=(0, 0, COLLAR + .01))
    # the grille mesh: a wireframe over the ball
    me = bpy.data.meshes.new("RP_IP_MicMesh")
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=3, radius=.42, matrix=Matrix.Translation(f2(0, -.79)))
    bm.to_mesh(me)
    bm.free()
    me.materials.append(M["m_mesh"])
    gr = tag(bpy.data.objects.new("RP_IP_%s_Grille" % kind, me))
    COL.objects.link(gr)
    gr.parent = head
    wm = gr.modifiers.new("wire", "WIREFRAME")
    wm.thickness = .012
    # the band light (the tally): lit while the mic is live
    for nm, mt in (("On", "m_lit"), ("Off", "m_dead")):
        b = K.Builder()
        b.cone(M[mt], f2(0, -.345), .202, .202, .025, seg=32)
        p = part(b, "IP_%s_Band%s" % (kind, nm), head)
        key_hidden(p, [(o < .5) == (nm == "On") for o in on])


def head_lens(kind, root, on):
    b = K.Builder()
    b.cone(M["l_handle"], f2(0, -.15), .05, .045, .3, seg=16)
    b.cone(M["l_brass"], f2(0, -.33), .07, .07, .07, seg=20)
    ring(b, M["l_brass"], f2(0, -.74), .38, .045, seg=56, rs=12)
    ring(b, M["l_rim2"], f2(0, -.74, -.03), .425, .012, seg=56, rs=6)
    b.cone(M["l_glass"], f2(0, -.74), .37, .37, .04, seg=56, rot=ROTX90)
    head = part(b, "IP_%s_Head" % kind, root, loc=(0, 0, COLLAR + .01))
    # "can't": the lens clouds over (draft: grey ellipses fill the glass)
    b = K.Builder()
    b.cone(M["l_cloud"], f2(0, -.74, -.024), .36, .36, .006, seg=56, rot=ROTX90)
    for i in range(6):
        b.ellipsoid(M["l_cloud"], f2(-.2 + (i % 3) * .2, -.74 - .13 + (i // 3) * .26, -.03), (.13, .015, .08), seg=12)
    cl = part(b, "IP_%s_Cloud" % kind, head)
    key_hidden(cl, [o >= .5 for o in on])


# =============================================================================================
# the body (ipBody): legs, boots, torso, sash, lab coat, arms, collar
# =============================================================================================
def body(kind, root, frames):
    lab = kind == "RECORDER"
    b = K.Builder()
    # torso: a tapered column from the hips to the shoulders
    rows = []
    for z, w, d in ((.86, .22, .15), (1.2, .235, .16), (1.52, .25, .16), (1.62, .22, .15), (1.68, .12, .12)):
        rows.append([Vector((w * math.cos(a), d * math.sin(a), z)) for a in [i / 24 * 2 * math.pi for i in range(25)]])
    b.strip(M["p_suit"], rows)
    b.disc(M["p_suit"], (0, 0, .86), .22, seg=24, scale=(1, .68))
    b.disc(M["p_suit"], (0, 0, 1.68), .12, seg=24)
    b.box(M["p_seam"], (0, -.162, 1.29), (.016, .01, .74))
    if lab:  # the open white lab coat, longer than the coveralls, with lapels, a pocket and two pens
        for d in (-1, 1):
            b.poly(M["p_coat"], [Vector((d * .05, -.18, 1.66)), Vector((d * .07, -.18, 1.2)), Vector((d * .06, -.2, .46)),
                                 Vector((d * .37, -.2, .46)), Vector((d * .27, -.18, 1.6))][::(1 if d > 0 else -1)])
            b.poly(M["p_coat"], [Vector((d * .27, -.17, 1.6)), Vector((d * .37, -.19, .46)), Vector((d * .37, .17, .46)), Vector((d * .27, .16, 1.6))][::(1 if d < 0 else -1)])
            b.poly(M["p_coatin"], [Vector((d * .05, -.19, 1.66)), Vector((d * .08, -.19, 1.3)), Vector((d * .16, -.19, 1.58))][::(1 if d > 0 else -1)])
        b.poly(M["p_coat"], [Vector((-.37, .17, .46)), Vector((.37, .17, .46)), Vector((.27, .16, 1.6)), Vector((-.27, .16, 1.6))])
        b.box(M["p_coatin"], (-.205, -.205, 1.36), (.13, .01, .12))
        b.box(M["p_pen_b"], (-.232, -.212, 1.42), (.015, .012, .1))
        b.box(M["p_pen_r"], (-.192, -.212, 1.415), (.015, .012, .09))
    # the sash, shoulder to hip, on the front (and round the back over the shoulder)
    sa = M["sash_" + kind]
    fy = -.2 if lab else -.17
    b.poly(sa, [Vector((-.24, fy, 1.6)), Vector((.2, fy, .88)), Vector((.26, fy, .98)), Vector((-.12, fy, 1.66))])
    b.poly(sa, [Vector((-.12, .17, 1.66)), Vector((.26, .17, .98)), Vector((.2, .17, .88)), Vector((-.24, .17, 1.6))])
    b.box(sa, (-.2, 0, 1.64), (.1, .34, .05))
    b.cone(M["p_collar"], (0, 0, 1.74), .17, .15, .08, seg=24)
    b.disc(M["p_hole"], (0, 0, 1.781), .13, seg=24, scale=(1, .6))
    part(b, "IP_%s_Body" % kind, root)

    # legs: pivot at the hip, swing toward the foot (fx, lift), boots follow the feet
    sleeve = M["p_coat"] if lab else M["p_suit"]
    legs, boots, arms = [], [], []
    for j, d in enumerate((-1, 1)):
        b = K.Builder()
        b.rod(M["p_suit"], (0, 0, 0), (0, 0, -.78), .095, .09, seg=14)
        legs.append(part(b, "IP_%s_Leg%d" % (kind, j), root, loc=(d * .1, 0, .92)))
        b = K.Builder()
        b.box(M["p_boot"], (0, -.04, .08), (.2, .3, .16))
        b.ellipsoid(M["p_boot"], (0, -.17, .07), (.1, .08, .07), seg=12)
        boots.append(part(b, "IP_%s_Boot%d" % (kind, j), root))
        b = K.Builder()
        b.rod(sleeve, (0, 0, 0), (0, 0, -.62), .06, .055, seg=12)
        b.ellipsoid(M["p_hand"], (0, 0, -.66), (.065, .065, .065), seg=12)
        arms.append(part(b, "IP_%s_Arm%d" % (kind, j), root, loc=(d * .27, 0, 1.52)))
    legrot, legsc, bootloc, armrot = [[], []], [[], []], [[], []], [[], []]
    for fr in frames:
        s, mv = fr["s"], fr["p"][kind]["mv"]
        bob = .035 * mv * abs(s)
        lift = [max(0, s) * .1 * mv, max(0, -s) * .1 * mv]
        fx = [-.13 - .05 * s * mv, .13 - .05 * s * mv]
        sw = .06 * s * mv
        for j, d in enumerate((-1, 1)):
            hip = Vector((d * .1, 0, .92))
            foot = Vector((fx[j], 0, .14 + lift[j] - bob))
            v = foot - hip
            # sway in the screen plane, plus a stride (a step forward for the lifted foot, a slight sideways walk)
            legrot[j].append((-.35 * lift[j] / .1 * (1 if j else 1), math.atan2(v.x, -v.z) * -1, 0))
            legsc[j].append((1, 1, v.length / .78))
            bootloc[j].append((foot.x, -math.sin(.35 * lift[j] / .1) * v.length, foot.z - .14 + v.length * (1 - math.cos(.35 * lift[j] / .1))))
            hand = Vector((d * .3 - d * sw, 0, .86))
            armrot[j].append((d * .25 * s * mv, -math.atan2(hand.x - d * .27, -(hand.z - 1.52)), 0))
    for j in range(2):
        K.key_rot(legs[j], legrot[j])
        K.key_scale(legs[j], legsc[j])
        K.key_loc(boots[j], bootloc[j])
        K.key_rot(arms[j], armrot[j])


HEADS = {"RECORDER": head_recorder, "RADIO": head_radio, "CAMERA": head_camera, "MIC": head_mic, "LENS": head_lens}


def build():
    mats()
    frames = P
    tt = [K.ft(f) for f in K.FRAMES]
    run = [fr["run"] for fr in frames]
    for kind in KINDS:
        root = K.empty("IP_" + kind, COL)
        locs = []
        for fr in frames:
            p = fr["p"][kind]
            bob = .035 * p["mv"] * abs(fr["s"])
            locs.append(B(p["X"], bob, p["Z"]))
        K.key_loc(root, locs)
        body(kind, root, frames)
        on = [fr["p"][kind]["on"] for fr in frames]
        fn = HEADS[kind]
        if kind == "RECORDER":
            fn(kind, root, on, run)
        elif kind == "RADIO":
            fn(kind, root, on, tt)
        else:
            fn(kind, root, on)
        # whole figure hidden while far off frame is not needed: they are in shot for the whole window
