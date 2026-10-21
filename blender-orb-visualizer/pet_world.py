# The pet, whole song: the shared world for Bob Wiseman's "Real Thing" (165.85 s, Blender 4.5 LTS, EEVEE).
#
# Grows take 06 (realthing_pet.py, the 28 s sketch) into the film's world; STORYBOARD-pet.md (gitignored) has the
# acts. Importing this module builds the scene: take 06's room, toy, sprite frames, man and dog rigs, plus the
# park outside the window (the flat's brick front, street, pond with ducks, trees), the pile on the door mat driven
# by one table (PILE_ORDER / pile_items), the new LCD screens (egg, WALK, battery), light looks (light_mode) and
# direct pose setters (pose_man, pose_dog) for stills. The dog is 1.3x take 06's.
# Pixels live only on the toy's LCD; everything else renders sharp (no Pixelate node).
#   import pet_world as W        (from a stills or act script run by blender -b --factory-startup --python)
import bpy, math, os, sys, zlib
from mathutils import Vector, Euler, Matrix
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
sys.path.insert(0, HERE)
import canvas_kit as K
from canvas_kit import mat, box, blocks, empty, disc, hex_lin, stripes, specks
from film_kit import film_setup, sec, shot_camera, cut, key, show, const_keys, run, FPS

OUT = os.path.join(HERE, "out", "film", "pet")
F0, F1 = 0, 3980
scene = K.reset()
film_setup(OUT, F0, F1)
R = math.radians

def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def sm(a, b, t):
    x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x)
def lerp(a, b, u): return a + (b - a) * u

# ---------- palette ----------
M = {}
def mm(n, h, j=.06, texel=.05, pattern=None, emit=0.0, rough=.95):
    M[n] = mat("p6_" + n, h, j, zlib.crc32(n.encode()) % 997, texel=texel, pattern=pattern, emit=emit, rough=rough)
    return M[n]
def grid_pat(line):
    L = hex_lin(line)
    return lambda x, y, rnd: L if (x % 4 == 3 or y % 4 == 3) else None

mm("wall", "#93a57c", .05, .1); mm("cream", "#efe6cf", .03, .08); mm("door", "#e4d9bd", .04, .06)
mm("floor", "#a8774e", .05, .06, stripes("#a8774e", "#9a6943", 4)); mm("rug", "#b98f5c", .04, .07, stripes("#b98f5c", "#cdb68a", 2))
mm("rust", "#b4553b", .06, .06); mm("rust2", "#a54c34", .05, .06); mm("wood", "#5a3f2c", .06, .05)
mm("brass", "#c8922e", .03, .05, rough=.5); mm("sky", "#fff0d2", .02, .1, emit=1.6); mm("leaf", "#6d8a5a", .1, .08)
mm("curtain", "#7e9168", .05, .07); mm("pot", "#e9dcc0", .03, .05); mm("art1", "#d6a65a", .05, .05); mm("art2", "#7e9168", .04, .05)
mm("dog", "#8a5a3a", .07, .04); mm("dogear", "#6a4129", .05, .04); mm("muzzle", "#d8b47e", .05, .04); mm("ink", "#1e1a14", 0, .05)
mm("hood", "#80838a", .05, .05); mm("hood2", "#6c6f76", .04, .05); mm("jeans", "#4a6a9a", .06, .05)
mm("skin", "#e6c39e", .03, .05); mm("skin2", "#d9ad86", .03, .05); mm("hair", "#4a3424", .06, .05); mm("sock", "#5d5f66", .04, .05)
mm("shoe", "#ece5d5", .03, .05); mm("sole", "#5a4a3e", .04, .05); mm("string", "#efe6cf", .02, .05)
mm("leash", "#2f7a78", .04, .05); mm("ball", "#cfd65a", .06, .04)
mm("toy", "#f2b6c0", .035, .05); mm("toy2", "#e39aaa", .03, .05); mm("button", "#d97a8c", .03, .05)
mm("metal", "#b9b6ae", .04, .05, rough=.4); mm("lcd", "#b8c89a", .02, .0175, grid_pat("#adbd8e"), emit=.22)
mm("pix", "#2a3320", 0, .05); mm("dark", "#2e2a26", .03, .2)

def beam(name, p0, p1, w, h, material, parent=None):
    """a box of cross-section w x h running from p0 to p1 (in the parent's space)"""
    p0, p1 = Vector(p0), Vector(p1); d = p1 - p0
    ob = box(name, (w, h, d.length), (p0 + p1) / 2, material, parent)
    ob.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    return ob

def area(name, loc, target, size, energy, color=(1.0, .95, .88)):
    d = bpy.data.lights.new("CL_" + name, "AREA"); d.size = size; d.energy = energy; d.color = color
    ob = bpy.data.objects.new("CL_" + name, d); scene.collection.objects.link(ob)
    ob.location = loc; ob.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    return ob

def no_shadow(ob):
    ob.visible_shadow = False
    return ob

# =====================================================================================================
# THE ROOM (floor z = 0, back wall inner face y = 3.0, camera side open toward -y)
# =====================================================================================================
box("floor", (9.6, 8.0, .1), (0, -1.0, -.05), M["floor"])
box("ceil", (9.6, 8.0, .2), (0, -1.0, 2.9), M["cream"])
WY = 3.1
for i, (sx, sz, cx, cz) in enumerate(((1.9, 2.8, -3.85, 1.4), (1.4, .9, -2.1, .45), (1.4, .6, -2.1, 2.5),
                                      (3.35, 2.8, .275, 1.4), (.9, .7, 2.4, 2.45), (1.95, 2.8, 3.825, 1.4))):
    box(f"backwall{i}", (sx, .2, sz), (cx, WY, cz), M["wall"])
box("wallL", (.2, 8.0, 2.8), (-4.7, -1.0, 1.4), M["wall"])
box("wallR1", (.2, 4.8, 2.8), (4.7, -2.6, 1.4), M["wall"])
box("wallR2", (.2, 1.7, 2.8), (4.7, 2.15, 1.4), M["wall"])
box("wallR3", (.2, 1.1, .7), (4.7, .75, 2.45), M["wall"])
box("hallFloor", (2.0, 1.4, .1), (5.7, .75, -.05), M["floor"])
box("hallWall", (.2, 2.0, 2.8), (6.7, .75, 1.4), M["door"])
box("baseboard", (9.4, .04, .12), (0, 2.98, .06), M["cream"])
# the window (left) with the morning outside it
box("winSill", (1.6, .14, .06), (-2.1, 2.95, .9), M["cream"])
for i, (sx, sz, cx, cz) in enumerate(((.08, 1.3, -2.8, 1.55), (.08, 1.3, -1.4, 1.55), (1.48, .08, -2.1, 2.2), (.05, 1.3, -2.1, 1.55), (1.4, .05, -2.1, 1.55))):
    box(f"winFrame{i}", (sx, .08, sz), (cx, 3.0, cz), M["cream"])
box("curtainL", (.32, .1, 1.9), (-3.05, 2.94, 1.6), M["curtain"]); box("curtainR", (.32, .1, 1.9), (-1.15, 2.94, 1.6), M["curtain"])
box("curtainRod", (2.6, .05, .05), (-2.1, 2.92, 2.58), M["wood"])
# the door (right of the couch)
box("doorLeaf", (.88, .06, 2.08), (2.4, 3.03, 1.04), M["door"])
for i, (z, h) in enumerate(((.55, .7), (1.5, .8))):
    box(f"doorPanel{i}", (.6, .02, h), (2.4, 2.995, z), M["cream"])
box("doorKnob", (.07, .07, .07), (2.1, 2.96, 1.0), M["brass"])
for i, (sx, sz, cx, cz) in enumerate(((.08, 2.16, 1.92, 1.08), (.08, 2.16, 2.88, 1.08), (1.04, .08, 2.4, 2.14))):
    box(f"doorTrim{i}", (sx, .06, sz), (cx, 2.97, cz), M["cream"])
box("doorMat", (.8, .45, .02), (2.4, 2.65, .01), M["rust2"])
# couch against the back wall
box("couchBase", (2.7, .8, .3), (.1, 2.55, .25), M["rust"])
for i, (x, y) in enumerate(((-1.15, 2.22), (1.35, 2.22), (-1.15, 2.88), (1.35, 2.88))):
    box(f"couchFoot{i}", (.08, .08, .1), (x, y, .05), M["wood"])
box("seatL", (1.22, .66, .1), (-.53, 2.46, .45), M["rust2"]); box("seatR", (1.22, .66, .1), (.73, 2.46, .45), M["rust2"])
box("couchBack", (2.7, .22, .62), (.1, 2.86, .71), M["rust"])
box("backCushL", (1.2, .14, .44), (-.53, 2.7, .74), M["rust2"]); box("backCushR", (1.2, .14, .44), (.73, 2.7, .74), M["rust2"])
box("armL", (.18, .8, .34), (-1.16, 2.55, .57), M["rust"]); box("armR", (.18, .8, .34), (1.36, 2.55, .57), M["rust"])
box("pillow", (.34, .14, .32), (-.85, 2.6, .66), M["cream"], rot=(0, R(8), 0))
box("rug", (3.4, 2.0, .02), (.1, 1.15, .01), M["rug"])
box("artFrame", (.84, .04, .58), (.1, 2.98, 1.72), M["wood"]); box("art1", (.74, .02, .48), (.1, 2.955, 1.72), M["art1"])
box("art2", (.3, .02, .28), (.25, 2.945, 1.65), M["art2"])
box("potB", (.32, .32, .34), (-3.6, 2.55, .17), M["pot"])
for i, (x, y, z, s) in enumerate(((-3.6, 2.55, .5, .36), (-3.7, 2.5, .72, .26), (-3.5, 2.62, .8, .22))):
    box(f"plant{i}", (s, s, s), (x, y, z), M["leaf"])
box("sideTbl", (.45, .45, .5), (3.5, 2.6, .25), M["wood"]); box("sideTop", (.5, .5, .04), (3.5, 2.6, .52), M["cream"])

# light: the morning sun only gets in through the window; a soft fill from the camera side and the window
SUN_A = Vector((.55, -1.0, -.72)); SUN_B = Vector((1.05, -1.0, -.66))
sunob = K.sun(9.0, (0, 0, 0), color=(1.0, .9, .74), angle_deg=2.5)
area("fill", (.6, -2.6, 2.6), (.6, 2.0, .5), 5.0, 420, (1.0, 1.0, 1.0))
area("winGlow", (-2.1, 2.7, 1.6), (-1.5, 0, .2), 1.4, 60, (1.0, .93, .8))
area("doorFill", (3.4, .8, 2.4), (1.8, 2.2, .3), 2.0, 70, (1.0, .95, .88))
K.sky([(.0, "#eceee6"), (1.0, "#f3f1ea")], strength=.85)
scene.view_settings.exposure = .35

# =====================================================================================================
# THE TOY (an egg with three buttons and a 26 x 18 dot LCD). Local: x right, z up, the face looks at -y.
# =====================================================================================================
CELL, LW, LH, LCD_Z = .07, 26, 18, .35

def egg_hw(z):
    c = -.2; Rr = 2.05 if z > c else 1.85
    return 1.6 * math.sqrt(max(0.0, 1 - ((z - c) / Rr) ** 2))

def lcd_parts(rows, ox, oy, dz=0):
    parts = []
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch == "#":
                col, r_ = ox + i, oy + j + dz
                parts.append(((CELL * .86, .02, CELL * .86), ((col - LW / 2 + .5) * CELL, -.80, LCD_Z + (LH / 2 - r_ - .5) * CELL)))
    return parts

def toy(name, parent=None):
    root = empty(name, (0, 0, 0), parent)
    step = .15; shell, plate = [], []
    for k in range(26):
        zc = -2.05 + (k + .5) * step
        hw = round(egg_hw(zc) / .05) * .05
        if hw > .05: shell.append(((2 * hw, 1.2, step), (0, 0, zc)))
        if hw - .18 > .1: plate.append(((2 * (hw - .18), .12, step), (0, -.66, zc)))
    blocks(name + "_shell", shell, M["toy"], root); blocks(name + "_plate", plate, M["toy"], root)
    box(name + "_bezel", (2.06, .05, 1.5), (0, -.745, LCD_Z), M["toy2"], root)
    box(name + "_lcd", (LW * CELL, .03, LH * CELL), (0, -.775, LCD_Z), M["lcd"], root)
    for i, x in enumerate((-.68, 0, .68)):
        parts = []
        for s in range(-4, 4):
            xx = (s + .5) * .05; hh = round(math.sqrt(max(0, .2 ** 2 - xx ** 2)) / .05) * .05
            if hh > 0: parts.append(((.05, .08, 2 * hh), (x + xx, -.76, -1.12)))
        blocks(f"{name}_btn{i}", parts, M["button"], root)
    blocks(name + "_ring", [((.08, .08, .5), (-.2, 0, 2.05)), ((.08, .08, .5), (.2, 0, 2.05)), ((.48, .08, .08), (0, 0, 2.3))], M["metal"], root)
    return root

# ---------- the pet's sprite frames (16 x 16 creature at LCD col 5, row 1) ----------
IDLE_A = ["................", "...#........#...", "...##......##...", "....########....", "...#........#...",
          "..#..........#..", "..#..##..##..#..", "..#..##..##..#..", "..#..........#..", "..#...#..#...#..",
          "..#....##....#..", "...#........#...", "....########....", "....#......#....", "...##......##...", "................"]
IDLE_B = ["................", "................", "................", "..#..........#..", "..##........##..",
          "...##########...", "..#..........#..", ".#............#.", ".#...##..##...#.", ".#...##..##...#.",
          ".#............#.", ".#....#..#....#.", ".#.....##.....#.", "..############..", "..##........##..", "................"]
_EB = ["............", ".#........#.", ".##......##.", "..########..", ".#........#.", "#..........#",
       "#..##..##..#", "#..##..##..#", "#..........#", None, None, None, "..########..", "..#......#..", ".##......##.", "............"]
def eat(open_, food):
    m_open = ["#...####...#", "#...#..#...#", ".#...##...#."]; m_shut = ["#..........#", "#...####...#", ".#........#."]
    mouth = m_open if open_ else m_shut
    rows = []
    for j, r_ in enumerate(_EB):
        r_ = mouth[j - 9] if r_ is None else r_
        rows.append(r_ + food.get(j, "...."))
    return rows
EAT = [eat(True, {10: ".###", 11: ".###", 12: ".###"}), eat(False, {10: "..##", 11: ".###", 12: ".###"}),
       eat(True, {11: "..##", 12: ".###"}), eat(False, {})]
HAPPY = ["................", "...#........#...", "...##......##...", "#...########...#", ".#.#........#.#.",
         "..##........##..", "..#..#....#..#..", "..#.#.#..#.#.#..", "..#..........#..", "..#..#....#..#..",
         "..#...####...#..", "...#........#...", "....########....", "....#......#....", "...##......##...", "................"]
HEART = [".#.#.", "#####", ".###.", "..#.."]
SICK = ["................", "................", "................", "................", ".##..........##.",
        "...##########...", "..#..........#..", ".#............#.", ".#..###..###..#.", ".#............#.",
        ".#.....##.....#.", ".#....#..#....#.", "#..............#", "#..............#", ".##############.", "................"]
SKULL = [".###.", "#####", "#.#.#", ".###.", ".#.#."]
BANG = ["#", "#", "#", "#", ".", "#"]
GHOST = ["...######...", "..#......#..", ".#........#.", "#..##..##..#", "#..##..##..#", "#..........#",
         "#....##....#", "#..........#", "#..........#", ".#.##..##.#."]
FRAMES = {"idleA": [(IDLE_A, 5, 1)], "idleB": [(IDLE_B, 5, 1)], "eat0": [(EAT[0], 5, 1)], "eat1": [(EAT[1], 5, 1)],
          "eat2": [(EAT[2], 5, 1)], "eat3": [(EAT[3], 5, 1)], "happy": [(HAPPY, 5, 1), (HEART, 0, 1)],
          "sick": [(SICK, 5, 1), (SKULL, 21, 2)], "dead": [(GHOST, 7, 0)]}

def lcd_state(t):
    """(frame name or None, ghost rows below its top position, '!' lit)"""
    idle = "idleA" if int((t - 21.0) / .42) % 2 == 0 else "idleB"
    if t < 22.75: return idle, 0, False
    if t < 24.15: return "eat%d" % min(3, int((t - 22.75) / .35)), 0, False
    if t < 25.0: return "happy", 0, False
    if t < 38.73: return idle, 0, False
    if t < 41.44: return "sick", 0, (39.85 <= t and int((t - 39.85) / .21) % 2 == 0)
    if t < 43.5: return "dead", 6 - min(6, int((t - 41.44) / .3)), False
    return None, 0, False

# =====================================================================================================
# THE MAN (voxel, built facing +x like film_kit's people, then turned to face the camera, -y)
# =====================================================================================================
def man_rig():
    G = {}
    root = empty("man", (.73, 2.5, 0)); root.rotation_euler = (0, 0, R(-90)); G["root"] = root
    pel = empty("man_pel", (0, 0, .55), root); G["pel"] = pel
    for s, y in (("L", .11), ("R", -.11)):
        hip = empty("man_hip" + s, (0, y, 0), pel); G["hip" + s] = hip
        box("man_thigh" + s, (.2, .2, .48), (0, 0, -.22), M["jeans"], hip)
        kn = empty("man_knee" + s, (0, 0, -.46), hip); G["knee" + s] = kn
        box("man_shin" + s, (.18, .18, .42), (0, 0, -.21), M["jeans"], kn)
        box("man_sock" + s, (.27, .18, .09), (.05, 0, -.46), M["sock"], kn)
    tor = empty("man_torso", (0, 0, 0), pel); G["torso"] = tor
    box("man_hoodie", (.32, .48, .64), (0, 0, .33), M["hood"], tor)
    box("man_pocket", (.03, .32, .15), (.165, 0, .16), M["hood2"], tor)
    box("man_hoodlump", (.17, .42, .22), (-.17, 0, .63), M["hood2"], tor)
    for s in (-1, 1): box(f"man_string{s}", (.02, .025, .16), (.17, .06 * s, .5), M["string"], tor)
    nk = empty("man_neck", (.02, 0, .64), tor); G["neck"] = nk
    box("man_neckb", (.14, .16, .1), (0, 0, .03), M["skin2"], nk)
    box("man_head", (.34, .32, .36), (.02, 0, .22), M["skin"], nk)
    box("man_nose", (.04, .06, .07), (.2, 0, .18), M["skin2"], nk)
    G["eyes"] = []
    for s in (-1, 1):
        G["eyes"].append(box(f"man_eye{s}", (.03, .06, .07), (.19, .075 * s, .24), M["ink"], nk))
        box(f"man_brow{s}", (.03, .09, .025), (.19, .08 * s, .31), M["hair"], nk)
    box("man_hairTop", (.37, .35, .05), (.01, 0, .415), M["hair"], nk)
    box("man_fringe", (.05, .34, .06), (.17, 0, .38), M["hair"], nk)
    box("man_hairBack", (.1, .36, .26), (-.15, 0, .3), M["hair"], nk)
    for s, y in (("L", .3), ("R", -.3)):
        sh = empty("man_sh" + s, (0, y, .57), tor); G["sh" + s] = sh
        box("man_upper" + s, (.15, .15, .32), (0, 0, -.15), M["hood"], sh)
        el = empty("man_el" + s, (0, 0, -.3), sh); G["el" + s] = el
        box("man_fore" + s, (.14, .14, .28), (0, 0, -.14), M["hood"], el)
        box("man_cuff" + s, (.15, .15, .05), (0, 0, -.27), M["hood2"], el)
        G["hand" + s] = box("man_hand" + s, (.12, .13, .12), (0, 0, -.33), M["skin"], el)
    return G

# =====================================================================================================
# THE DOG (voxel, facing +x; root on the floor under the body)
# =====================================================================================================
def dog_rig():
    G = {}
    root = empty("dog", (4.9, .9, 0)); G["root"] = root
    body = empty("dog_body", (0, 0, .43), root); G["body"] = body
    box("dog_torso", (.62, .30, .28), (0, 0, 0), M["dog"], body)
    box("dog_chest", (.18, .32, .31), (.24, 0, .01), M["dog"], body)
    box("dog_belly", (.36, .22, .03), (.02, 0, -.14), M["muzzle"], body)
    nk = empty("dog_neck", (.30, 0, .10), body); G["neck"] = nk
    box("dog_neckb", (.16, .18, .2), (.03, 0, .06), M["dog"], nk)
    box("dog_head", (.26, .26, .24), (.13, 0, .2), M["dog"], nk)
    box("dog_muzzle", (.16, .17, .12), (.31, 0, .14), M["muzzle"], nk)
    box("dog_nose", (.05, .08, .06), (.39, 0, .18), M["ink"], nk)
    G["open"] = empty("dog_eyesOpen", (0, 0, 0), nk); G["shut"] = empty("dog_eyesShut", (0, 0, 0), nk)
    for s in (-1, 1):
        box(f"dog_eye{s}", (.03, .05, .055), (.265, .075 * s, .25), M["ink"], G["open"])
        box(f"dog_lid{s}", (.03, .065, .015), (.265, .075 * s, .235), M["ink"], G["shut"])
    G["ears"] = []
    for s in (-1, 1):
        ep = empty(f"dog_earP{s}", (.08, .135 * s, .31), nk); G["ears"].append((s, ep))
        box(f"dog_ear{s}", (.09, .05, .17), (0, .01 * s, -.08), M["dogear"], ep)
    G["mouth"] = empty("dog_mouth", (.34, 0, .07), nk)
    G["legs"] = {}
    for n, x, y in (("FL", .22, .1), ("FR", .22, -.1), ("BL", -.22, .1), ("BR", -.22, -.1)):
        lp = empty("dog_leg" + n, (x, y, -.1), body); G["legs"][n] = lp
        box("dog_legb" + n, (.09, .09, .30), (0, 0, -.15), M["dog"], lp)
        box("dog_paw" + n, (.12, .1, .05), (.02, 0, -.305), M["muzzle"], lp)
    tp = empty("dog_tailP", (-.31, 0, .09), body); G["tail"] = tp
    box("dog_tail", (.24, .06, .06), (-.12, 0, 0), M["dog"], tp)
    box("dog_tailTip", (.07, .065, .065), (-.25, 0, 0), M["muzzle"], tp)
    return G

STAND = dict(bz=.43, bp=0, fl=0, bl=0, hp=-8, hy=0, hr=0, tp=35, ty=0, ear=0)
SIT = dict(bz=.31, bp=-30, fl=30, bl=-60, hp=8, hy=0, hr=0, tp=8, ty=0, ear=0)
LIE = dict(bz=.16, bp=4, fl=-86, bl=-86, hp=30, hy=0, hr=0, tp=10, ty=25, ear=15)
CURL = dict(bz=.16, bp=4, fl=-86, bl=-86, hp=48, hy=70, hr=-12, tp=-5, ty=125, ear=25)
def pmix(a, b, u): return {k: lerp(a[k], b[k], u) for k in a}

DSIT = Vector((2.05, 1.7)); HSIT = 146.0
PILE = Vector((2.2, 2.35))     # S5: the pile by the door
PILE3 = Vector((1.6, 1.98))    # S3: the pile at his feet
def heading_of(a, b): d = b - a; return math.degrees(math.atan2(d.y, d.x))

# ---------- build the cast (take 06) ----------
MAN = man_rig(); DOG = dog_rig()
def shoe(name, parent=None, loc=(0, 0, 0), rot=(0, 0, 0)):
    root = empty(name, loc, parent); root.rotation_euler = rot
    box(name + "_upper", (.28, .12, .09), (0, 0, .06), M["shoe"], root)
    box(name + "_toe", (.08, .11, .05), (.15, 0, .035), M["shoe"], root)
    box(name + "_sole", (.33, .13, .03), (.02, 0, .0), M["sole"], root)
    box(name + "_stripe", (.12, .125, .025), (-.02, 0, .06), M["leash"], root)
    return root
small = toy("stoy"); small.scale = (.045, .045, .045)
SPR = {n: blocks("stoy_" + n, sum((lcd_parts(r_, ox, oy) for r_, ox, oy in parts), []), M["pix"], small) for n, parts in FRAMES.items()}
c_leash = empty("cLeash", (0, 0, 0), DOG["mouth"])
blocks("cLeashLoop", [((.035, .3, .03), (0, 0, 0)), ((.03, .03, .2), (0, .14, -.1)), ((.03, .03, .2), (0, -.14, -.1)),
                      ((.03, .3, .03), (0, 0, -.2))], M["leash"], c_leash)
blocks("cLeashTail", [((.03, .03, .5), (0, .0, -.45))], M["leash"], c_leash)
c_ball = empty("cBall", (0, 0, -.02), DOG["mouth"])
blocks("cBallB", [((.13, .13, .09), (0, 0, 0)), ((.09, .09, .13), (0, 0, 0)), ((.09, .13, .09), (0, 0, 0)), ((.13, .09, .09), (0, 0, 0))], M["ball"], c_ball)

# =====================================================================================================
# THE PET, WHOLE SONG: what the film adds to take 06 (STORYBOARD-pet.md)
# =====================================================================================================
DOG_SCALE = 1.3

def vis(ob, on):
    """static show/hide (stills); acts key the same thing with film_kit.show()"""
    for o in [ob] + list(ob.children_recursive):
        o.hide_render = not on; o.hide_viewport = not on

# ---------- outside: the building's front, the street and the park the dog watches ----------
mm("brick", "#b0674a", .06, .08, specks("#b0674a", "#9c5a40", .18)); mm("brickTrim", "#e3d5b5", .03, .06)
mm("pave", "#b9b2a4", .04, .1, stripes("#b9b2a4", "#aca596", 6)); mm("road", "#5b5a5e", .05, .1)
mm("grass", "#6f9a4e", .08, .12, specks("#6f9a4e", "#7fab58", .25)); mm("grass2", "#628a44", .07, .12)
mm("trunk", "#6a4a32", .06, .05); mm("canopy", "#4f7d3f", .09, .1, specks("#4f7d3f", "#5e8f49", .3))
mm("canopy2", "#6a9548", .09, .1); mm("water", "#5d93b0", .05, .06, rough=.15); mm("water2", "#7fb0c8", .04, .06, rough=.2)
mm("duck", "#f1ece0", .03, .05); mm("bill", "#e09a2e", .03, .05); mm("bench", "#7a5434", .05, .05)
mm("kite", "#d9443a", .03, .05); mm("glass", "#cfe3ea", .02, .1, rough=.1)
mm("lcdgrey", "#a3a79a", .02, .0175, grid_pat("#9a9e91"), emit=.0)
mm("cell", "#d8d8d2", .02, .05, rough=.3); mm("scarf", "#c8341e", .05, .05); mm("coat", "#6b4f3a", .06, .05)
mm("keys", "#d9c26a", .03, .05, rough=.3); mm("mat2", "#8a5a3e", .04, .05, stripes("#8a5a3e", "#7a4c33", 3))
mm("blanket", "#c9a46b", .05, .06, stripes("#c9a46b", "#b98f5c", 3)); mm("droop", "#8a8a52", .06, .08)
mm("smile", "#3a2a20", 0, .05)

# the flat's front (the back wall seen from the park): brick around the room's back wall, a second storey
FY = 3.3
for i, (sx, sz, cx, cz) in enumerate(((8, 6.2, -8.8, 3.1), (8, 6.2, 8.8, 3.1), (9.6, 3.4, 0, 4.5))):
    box(f"facade{i}", (sx, .2, sz), (cx, FY, cz), M["brick"])
for i, (sx, sz, cx, cz) in enumerate(((1.9, 2.8, -3.85, 1.4), (1.4, .9, -2.1, .45), (1.4, .6, -2.1, 2.5),
                                      (3.35, 2.8, .275, 1.4), (.9, .7, 2.4, 2.45), (1.95, 2.8, 3.825, 1.4))):
    box(f"facadeLow{i}", (sx, .05, sz), (cx, FY - .05, cz), M["brick"])
box("facadeDoorTrim", (1.2, .1, .12), (2.4, FY + .1, 2.2), M["brickTrim"])
box("facadeSill", (1.7, .2, .08), (-2.1, FY + .12, .86), M["brickTrim"])
box("winGlass", (1.4, .02, 1.35), (-2.1, 3.05, 1.55), M["glass"]).visible_shadow = False
bpy.data.objects["CL_winGlass"].hide_render = True       # glass reads as a grey sheet in EEVEE; kept for act 3's fog
for i, x in enumerate((-6.5, -9.5, 6.5, 9.5, -2.1, 2.4)):
    box(f"upWin{i}", (1.2, .06, 1.3), (x, FY + .11, 4.7), M["dark"])
    box(f"upSill{i}", (1.4, .12, .08), (x, FY + .14, 4.0), M["brickTrim"])
box("roofLine", (26, .5, .3), (0, FY, 6.25), M["brickTrim"])
box("sidewalk", (40, 2.4, .12), (0, 4.6, .04), M["pave"])
box("street", (40, 5.0, .05), (0, 8.3, .0), M["road"])
for i in range(-9, 10):
    box(f"lane{i}", (1.0, .12, .01), (i * 2.1, 8.3, .03), M["cream"])
box("curb", (40, .3, .16), (0, 10.9, .06), M["pave"])
box("park", (140, 90, .1), (0, 55.9, -.02), M["grass"])
# the pond (a stepped voxel disc) with its rim, and a few ducks
POND = Vector((4.6, 18.2))
pond = disc("pond", 3.4, .07, .04, M["water"]); pond.location = (POND.x, POND.y, 0)
rim = disc("pondRim", 3.75, .06, .03, M["pave"]); rim.location = (POND.x, POND.y, 0)
def duck(name, loc, h):
    root = empty(name, loc); root.rotation_euler = (0, 0, R(h))
    box(name + "_b", (.34, .2, .16), (0, 0, .09), M["duck"], root)
    box(name + "_h", (.13, .12, .14), (.17, 0, .22), M["duck"], root)
    box(name + "_bill", (.09, .07, .04), (.27, 0, .2), M["bill"], root)
    box(name + "_tail", (.08, .12, .06), (-.2, 0, .16), M["duck"], root)
    return root
DUCKS = [duck("duck0", (POND.x - .8, POND.y + .6, .07), 30), duck("duck1", (POND.x + .4, POND.y + 1.4, .07), 200),
         duck("duck2", (POND.x + 1.3, POND.y - .3, .07), 120)]
ring = blocks("fishRing", [((.9, .05, .01), (0, .45, 0)), ((.9, .05, .01), (0, -.45, 0)), ((.05, .9, .01), (.45, 0, 0)),
                           ((.05, .9, .01), (-.45, 0, 0))], M["water2"]); ring.location = (POND.x - 1.4, POND.y - .9, .08)
def tree(name, x, y, s=1.0, c="canopy"):
    root = empty(name, (x, y, 0)); root.scale = (s, s, s)
    box(name + "_t", (.4, .4, 2.4), (0, 0, 1.2), M["trunk"], root)
    blocks(name + "_c", [((2.4, 2.4, 1.4), (0, 0, 2.9)), ((1.8, 1.8, 1.0), (0, 0, 3.9)), ((1.4, 2.8, .9), (.2, 0, 2.6)),
                         ((2.8, 1.4, .9), (0, .2, 2.4))], M[c], root)
    return root
TREES = [tree("tree0", -6.5, 17, 1.4), tree("tree1", -10, 23, 1.6, "canopy2"), tree("tree2", 11, 21, 1.5),
         tree("tree3", 0.5, 28, 1.8, "canopy2"), tree("tree4", 9, 31, 1.7), tree("tree5", -4, 33, 1.9),
         tree("tree6", 15, 14, 1.3, "canopy2"), tree("tree7", -15, 14, 1.4),
         tree("tree8", -13, 20, 1.7), tree("tree9", -9, 27, 2.0, "canopy2"), tree("tree10", -20, 30, 2.2)]
box("parkBench", (1.6, .45, .1), (-7.5, 12.5, .45), M["bench"]); box("parkBenchBack", (1.6, .1, .45), (-7.5, 12.75, .75), M["bench"])
for i, x in enumerate((-8.1, -6.9)): box(f"parkBenchLeg{i}", (.1, .4, .45), (x, 12.5, .22), M["bench"])
kite = blocks("kite", [((.5, .05, .5), (0, 0, 0)), ((.03, .03, 1.6), (0, .02, -1.0))], M["kite"])
kite.location = (-3, 26, 7.5); kite.rotation_euler = (0, R(45), 0)

# ---------- inside additions: the bigger door mat, the coat hooks, the sill plant, the blanket ----------
bpy.data.objects["CL_doorMat"].hide_render = True
MAT = Vector((2.4, 2.35))
box("mat", (1.15, .85, .025), (MAT.x, MAT.y, .012), M["mat2"])
box("hookRail", (.9, .06, .08), (3.45, 2.97, 1.75), M["wood"])
for i, x in enumerate((3.15, 3.45, 3.75)): box(f"hook{i}", (.04, .12, .04), (x, 2.92, 1.72), M["brass"])
hook_coat = blocks("hookCoat", [((.5, .14, .9), (3.15, 2.88, 1.28)), ((.18, .12, .1), (3.15, 2.9, 1.74))], M["coat"])
hook_scarf = box("hookScarf", (.12, .08, .7), (3.45, 2.9, 1.38), M["scarf"])
hook_keys = blocks("hookKeys", [((.07, .02, .12), (3.75, 2.9, 1.6)), ((.05, .02, .09), (3.79, 2.9, 1.56))], M["keys"])
battery_tbl = blocks("tableCell", [((.07, .07, .02), (3.42, 2.55, .55))], M["cell"])
sill_pot = box("sillPot", (.18, .14, .14), (-2.45, 2.95, 1.0), M["pot"])
def sill_plant(droop):
    """droop 0 = upright, 1 = flat over the pot's rim"""
    ob = empty("sillPlant", (-2.45, 2.95, 1.07))
    m = M["leaf"] if droop < .5 else M["droop"]
    for i, (dx, h) in enumerate(((-.05, .32), (.04, .26), (.0, .38))):
        stem = box(f"sillLeaf{i}", (.06, .06, h), (dx, 0, h / 2), m, ob)
        stem.rotation_euler = (R(-70 * droop * (1 + .2 * i)), R((i - 1) * 25 * (1 + droop)), 0)
    return ob
PLANT = sill_plant(0.0)
blanket = blocks("blanket", [((1.6, .7, .08), (-.05, 2.45, .78)), ((.2, .7, .3), (.72, 2.45, .65))], M["blanket"])

# ---------- the pile on the mat: one table for every frame of the film ----------
# Items in the order the dog brings them; pile_items(n) = the first n, each with one fixed spot on the mat.
PILE_ORDER = ["leash", "ball", "shoe", "keys", "scarf", "coat", "shoe2"]
_PILE_SPOT = {"leash": ((-.25, -.05, 0), 10), "ball": ((.35, -.22, 0), 0), "shoe": ((.05, .2, .03), -20),
              "keys": ((-.3, .22, .02), 40), "scarf": ((.0, -.05, .05), 75), "coat": ((.05, .05, .09), 8),
              "shoe2": ((.32, .12, .1), 160)}
def _pile_ob(n):
    root = empty("pile_" + n)
    if n == "leash":
        blocks("pileLeashB", [((.5, .035, .02), (0, -.12, .01)), ((.035, .34, .02), (.24, .03, .01)), ((.46, .035, .02), (.02, .19, .01)),
                              ((.035, .25, .02), (-.2, .05, .01))], M["leash"], root)
    elif n == "ball":
        blocks("pileBallB", [((.13, .13, .09), (0, 0, .065)), ((.09, .09, .13), (0, 0, .065)), ((.09, .13, .09), (0, 0, .065)),
                             ((.13, .09, .09), (0, 0, .065))], M["ball"], root)
    elif n in ("shoe", "shoe2"):
        shoe("pileShoe_" + n, root, (0, 0, 0), (R(80), 0, 0))
    elif n == "keys":
        blocks("pileKeysB", [((.09, .03, .02), (0, 0, .01)), ((.06, .02, .02), (.07, .02, .01)), ((.05, .05, .02), (-.06, 0, .01))], M["keys"], root)
    elif n == "scarf":
        blocks("pileScarfB", [((.75, .14, .05), (0, 0, .025)), ((.14, .4, .05), (.32, .12, .03))], M["scarf"], root)
    elif n == "coat":
        blocks("pileCoatB", [((.75, .5, .09), (0, 0, .045)), ((.2, .45, .07), (-.42, .05, .04)), ((.2, .4, .07), (.42, -.03, .04))], M["coat"], root)
    (dx, dy, dz), rz = _PILE_SPOT[n]
    root.location = (MAT.x + dx, MAT.y + dy, dz + .025); root.rotation_euler = (0, 0, R(rz))
    return root
PILE_OBS = {n: _pile_ob(n) for n in PILE_ORDER}
def pile_items(n):
    for i, name in enumerate(PILE_ORDER): vis(PILE_OBS[name], i < n)
    vis(hook_keys, n < 4); vis(hook_scarf, n < 5); vis(hook_coat, n < 6)
    return PILE_ORDER[:n]

# ---------- extra LCD screens (26 x 18 dots) ----------
DIG = {"0": ["###", "#.#", "#.#", "#.#", "###"], "1": [".#.", "##.", ".#.", ".#.", "###"], "2": ["###", "..#", "###", "#..", "###"],
       "3": ["###", "..#", ".##", "..#", "###"], "4": ["#.#", "#.#", "###", "..#", "..#"], "5": ["###", "#..", "###", "..#", "###"],
       "6": ["###", "#..", "###", "#.#", "###"], "7": ["###", "..#", ".#.", ".#.", ".#."], "8": ["###", "#.#", "###", "#.#", "###"],
       "9": ["###", "#.#", "###", "..#", "###"]}
def digits(s, ox, oy):
    return [(DIG[c], ox + 4 * i, oy) for i, c in enumerate(s)]
SHOE_ICON = ["..##..", "..###.", "######"]
WALK_PET = ["..#..#..", "..####..", ".#....#.", ".#.#.#.#", ".#....#.", "..####..", "..#..#.."]
TREE_PX = ["..###..", ".#####.", "#######", ".#####.", "...#...", "...#...", "...#..."]
POND_PX = [".#.#.#.#.", "#.#.#.#.#", ".#.#.#.#."]
PATH_PX = ["#" * 26]
EGG = ["..####..", ".#....#.", "#......#", "#..#...#", "#....#.#", "#......#", ".#....#.", "..####.."]
BATT = ["#####.", "#...##", "#...##", "#####."]
WALK_SCREEN = [(SHOE_ICON, 0, 0), *digits("0042", 10, 0), (TREE_PX, 1, 9), (POND_PX, 16, 13), (WALK_PET, 8, 9), (PATH_PX, 0, 16)]
def screen(name, parts, root):
    return blocks(name, sum((lcd_parts(r_, ox, oy) for r_, ox, oy in parts), []), M["pix"], root)

# ---------- lights: one call per look ----------
LCD_GLOW = None
def light_mode(mode):
    """dawn | day | night | lamp | park; also the room's fill lights"""
    global LCD_GLOW
    fill = bpy.data.objects["CL_fill"].data; win = bpy.data.objects["CL_winGlow"].data; door = bpy.data.objects["CL_doorFill"].data
    if mode == "dawn":
        sunob.data.energy = 1.6; sunob.data.color = (.75, .82, 1.0); fill.energy = 90; fill.color = (.7, .78, 1.0)
        win.energy = 40; win.color = (.75, .85, 1.0); door.energy = 0
        K.sky([(0, "#8aa0c8"), (1, "#c9c2d6")], strength=.6); scene.view_settings.exposure = .3
    elif mode == "day":
        sunob.data.energy = 9.0; sunob.data.color = (1.0, .9, .74); fill.energy = 420; fill.color = (1, 1, 1)
        win.energy = 60; win.color = (1.0, .93, .8); door.energy = 70
        K.sky([(0, "#eceee6"), (1, "#bcd6ec")], strength=.85); scene.view_settings.exposure = .35
    elif mode in ("night", "lamp"):
        sunob.data.energy = .15; sunob.data.color = (.6, .7, 1.0); fill.energy = 18 if mode == "night" else 40
        fill.color = (.55, .62, .9); win.energy = 6; win.color = (.5, .6, 1.0); door.energy = 0
        K.sky([(0, "#1a2236"), (1, "#26304a")], strength=.4); scene.view_settings.exposure = .2
        if mode == "lamp": area("lamp", (3.4, 1.6, 2.2), (2.2, 2.4, .2), 1.2, 260, (1.0, .78, .5))
    elif mode == "park":
        sunob.data.energy = 7.5; sunob.data.color = (1.0, .94, .82); fill.energy = 0; win.energy = 0; door.energy = 0
        sunob.rotation_euler = Vector((.35, -1.0, -.85)).normalized().to_track_quat('-Z', 'Y').to_euler()
        K.sky([(0, "#d9ecf5"), (.5, "#a9d0ea"), (1, "#6fa8d6")], strength=1.0); scene.view_settings.exposure = .25
    return mode

def lcd_glow(at, energy=6.0):
    d = bpy.data.lights.new("CL_lcdGlow", "POINT"); d.energy = energy; d.color = (.7, 1.0, .55); d.shadow_soft_size = .05
    ob = bpy.data.objects.new("CL_lcdGlow", d); scene.collection.objects.link(ob); ob.location = at
    return ob

# ---------- the man, posed directly (the acts key the same dicts) ----------
MAN_SIT = dict(x=.73, y=2.5, z=0.0, hd=-90.0, pitch=0.0, pz=.55, hip=-90.0, knee=90.0, lean=22.0, np=20.0, ny=0.0,
               shL=(-33.0, -28.0), shR=(33.0, -28.0), elL=-92.0, elR=-92.0, blink=1.0, swL=0.0, swR=0.0, kneeR=None)
def pose_man(**kw):
    p = dict(MAN_SIT); p.update(kw); G = MAN
    G["root"].location = (p["x"], p["y"], p["z"]); G["root"].rotation_euler = (0, R(p["pitch"]), R(p["hd"]))
    G["pel"].location = (0, 0, p["pz"])
    G["hipL"].rotation_euler = (0, R(p["hip"] + p["swL"]), 0); G["hipR"].rotation_euler = (0, R(p["hip"] + p["swR"]), 0)
    G["kneeL"].rotation_euler = (0, R(p["knee"]), 0); G["kneeR"].rotation_euler = (0, R(p["kneeR"] if p["kneeR"] is not None else p["knee"]), 0)
    G["torso"].rotation_euler = (0, R(p["lean"]), 0); G["neck"].rotation_euler = (0, R(p["np"]), R(p["ny"]))
    G["shL"].rotation_euler = (R(p["shL"][0]), R(p["shL"][1]), 0); G["shR"].rotation_euler = (R(p["shR"][0]), R(p["shR"][1]), 0)
    G["elL"].rotation_euler = (0, R(p["elL"]), 0); G["elR"].rotation_euler = (0, R(p["elR"]), 0)
    for e in G["eyes"]: e.scale = (1, 1, p["blink"])
    bpy.context.view_layer.update()
    return p

def pose_dog(pos, head, pose, z=0.0, shut=False, wag=0.0, legs=None):
    G = DOG; p = dict(pose)
    G["root"].location = (pos[0], pos[1], z); G["root"].rotation_euler = (0, 0, R(head)); G["root"].scale = (DOG_SCALE,) * 3
    G["body"].location = (0, 0, p["bz"]); G["body"].rotation_euler = (0, R(p["bp"]), 0)
    lg = legs or {}
    for n, base in (("FL", p["fl"]), ("FR", p["fl"]), ("BL", p["bl"]), ("BR", p["bl"])):
        G["legs"][n].rotation_euler = (0, R(lg.get(n, base)), 0)
    G["neck"].rotation_euler = (R(p["hr"]), R(p["hp"]), R(p["hy"]))
    G["tail"].rotation_euler = (0, R(p["tp"]), R(p["ty"] + wag))
    for sg, ep in G["ears"]: ep.rotation_euler = (R(p["ear"] * sg), 0, 0)
    vis(G["open"], not shut); vis(G["shut"], shut)
    bpy.context.view_layer.update()

def toy_in_hands(toy_ob, scale=.045):
    hl, hr_ = MAN["handL"].matrix_world.translation, MAN["handR"].matrix_world.translation
    eye = (MAN["eyes"][0].matrix_world.translation + MAN["eyes"][1].matrix_world.translation) / 2
    mid = (hl + hr_) / 2; look = (eye - mid).normalized()
    toy_ob.parent = None
    toy_ob.matrix_world = Matrix.LocRotScale(mid + look * .02, (-look).to_track_quat('Y', 'Z'), Vector((scale,) * 3))
    bpy.context.view_layer.update()
    return mid

def still_camera(name, loc, target, lens):
    c = shot_camera(name, loc, target, lens=lens); scene.camera = c
    return c
