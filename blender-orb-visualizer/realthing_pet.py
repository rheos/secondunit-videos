# Take 06: "The pet", a 28 s look test for Bob Wiseman's "Real Thing" (song 21.0-49.29 s, Blender 4.5 LTS, EEVEE).
#
# A man on his couch looks after a pixel pet on a little egg-shaped keychain toy while his real dog waits beside
# him. The pixels live only on the toy's LCD: the room, the man and the dog are voxel boxes rendered sharp (no
# Pixelate node in this take), so the contrast is device against world. The pet is built as one blocks() object
# per sprite frame, switched with show(); it eats, gets sick, dies and the LCD empties. The dog brings the leash,
# a ball, then his shoe; he never looks up. When the screen is empty he finally does, puts the toy down, stands
# and picks up the leash.
#
# Shots (song seconds): 21.0 close on the toy | 25.84 wide room, dog walks in | 32.04 leash drop (32.64)
#   | 33.05 ball (33.91) | 34.65 shoe (35.0), dog lies down | 38.2 close: sick 38.73, dead 41.44, empty 43.5
#   | 44.26 wide: he looks up, dog asleep on the pile by the door, he stands 47.24 and takes the leash.
#
#   nice -n 15 blender -b --factory-startup --python realthing_pet.py -- --stills 520,640,760,880,1000,1120
#   nice -n 15 blender -b --factory-startup --python realthing_pet.py -- --render
# Frames land in out/film/take-06/frames/, named by song frame.
import bpy, math, os, sys, zlib
from mathutils import Vector, Euler, Matrix
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
sys.path.insert(0, HERE)
import canvas_kit as K
from canvas_kit import mat, box, blocks, empty, hex_lin, stripes, specks
from film_kit import film_setup, sec, shot_camera, cut, key, show, const_keys, run, FPS

OUT = os.path.join(HERE, "out", "film", "take-06")
F0, F1 = 504, 1183
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
no_shadow(box("outside", (3.0, .05, 2.4), (-2.1, 3.9, 1.6), M["sky"]))
for i, (x, z, w) in enumerate(((-2.6, 2.0, .6), (-2.2, 2.25, .5), (-1.7, 1.9, .55))):
    box(f"treeLeaf{i}", (w, .3, .4), (x, 3.55, z), M["leaf"])
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

def dog_state(t):
    s = dict(pos=Vector((4.9, .9)), z=0.0, head=166.0, pose=dict(STAND), walk=0.0, period=.5, wag=(12, 1.6),
             shut=False, breathe=0.0)
    def go(a, b, t0, t1, period, amp):
        u = clamp((t - t0) / (t1 - t0)); s["pos"] = a.lerp(b, u); s["head"] = heading_of(a, b)
        s["walk"] = amp * (1 - sm(t1 - .12, t1, t)) * (sm(t0, t0 + .1, t) if t0 > 26 else 1); s["period"] = period
    A0 = Vector((4.9, .9))
    if t < 29.4:
        if t < 26.3: s["pos"] = A0; s["head"] = heading_of(A0, DSIT)
        else: go(A0, DSIT, 26.3, 29.4, .5, 26)
        s["wag"] = (18, 2.0)
    elif t < 32.85:
        s["pos"] = DSIT
        s["head"] = lerp(heading_of(A0, DSIT), HSIT, sm(29.4, 29.75, t))
        s["pose"] = pmix(STAND, SIT, sm(29.75, 30.2, t))
        s["pose"]["hr"] = 14 * sm(30.9, 31.2, t) * (1 - sm(31.6, 31.9, t))
        s["pose"]["hp"] += 37 * sm(32.3, 32.52, t) * (1 - sm(32.64, 32.84, t))
        s["wag"] = (30, 3.0) if t < 32.3 else (8, 1.0)
    elif t < 33.05:
        s["pos"] = DSIT; u = sm(32.85, 33.05, t)
        s["head"] = lerp(HSIT, 40, u); s["pose"] = pmix(SIT, STAND, u)
    elif t < 34.65:
        A1, A2 = Vector((3.6, .7)), Vector((3.9, 2.0))
        if t < 33.72: go(A1, DSIT, 33.05, 33.72, .3, 34)
        elif t < 34.15:
            s["pos"] = DSIT; s["head"] = lerp(heading_of(A1, DSIT), 8, sm(34.0, 34.15, t))
            s["pose"]["hp"] += 46 * sm(33.72, 33.84, t) * (1 - sm(33.91, 34.0, t))
        else: go(DSIT, A2, 34.15, 34.6, .3, 34)
        s["wag"] = (22, 3.0)
    elif t < 38.2:
        A3 = Vector((2.6, 1.78))
        if t < 34.82: go(A3, DSIT, 34.65, 34.82, .3, 30)
        else:
            s["pos"] = DSIT
            s["head"] = lerp(heading_of(A3, DSIT), HSIT, sm(35.1, 35.4, t))
            p = dict(STAND); p["hp"] += 46 * sm(34.82, 34.92, t) * (1 - sm(35.0, 35.1, t))
            p = pmix(p, SIT, sm(35.1, 35.45, t)); p = pmix(p, LIE, sm(36.9, 37.5, t))
            p["ear"] += 20 * sm(36.3, 36.8, t)
            s["pose"] = p
        s["wag"] = (lerp(26, 4, sm(36.0, 36.9, t)), lerp(3.0, 1.2, sm(36.0, 36.9, t))) if t < 37.5 else (0, 1)
    else:
        s["pos"] = PILE + Vector((.04, .06)); s["z"] = .09; s["head"] = 200
        s["pose"] = dict(CURL); s["shut"] = True; s["breathe"] = 1.0
        s["wag"] = (14 * sm(48.85, 49.0, t), 1.6)
    return s

# =====================================================================================================
# BUILD
# =====================================================================================================
MAN = man_rig(); DOG = dog_rig()

# small toy in his hands (parented to his right hand later, once the pose is keyed)
small = toy("stoy"); small.scale = (.045, .045, .045)
s_idle = blocks("stoy_pet", lcd_parts(IDLE_A, 5, 1), M["pix"], small)

# props the dog carries (children of its mouth) and drops
mouth = DOG["mouth"]
c_leash = empty("cLeash", (0, 0, 0), mouth)
blocks("cLeashLoop", [((.035, .3, .03), (0, 0, 0)), ((.03, .03, .2), (0, .14, -.1)), ((.03, .03, .2), (0, -.14, -.1)),
                      ((.03, .3, .03), (0, 0, -.2))], M["leash"], c_leash)
blocks("cLeashClump", [((.1, .06, .08), (-.02, .18, -.24)), ((.08, .1, .06), (.02, .2, -.3))], M["leash"], c_leash)
c_ball = empty("cBall", (0, 0, -.02), mouth)
blocks("cBallB", [((.13, .13, .09), (0, 0, 0)), ((.09, .09, .13), (0, 0, 0)), ((.09, .13, .09), (0, 0, 0)), ((.13, .09, .09), (0, 0, 0))], M["ball"], c_ball)
def shoe(name, parent=None, loc=(0, 0, 0), rot=(0, 0, 0)):
    root = empty(name, loc, parent); root.rotation_euler = rot
    box(name + "_upper", (.28, .12, .09), (0, 0, .06), M["shoe"], root)
    box(name + "_toe", (.08, .11, .05), (.15, 0, .035), M["shoe"], root)
    box(name + "_sole", (.33, .13, .03), (.02, 0, .0), M["sole"], root)
    box(name + "_stripe", (.12, .125, .025), (-.02, 0, .06), M["leash"], root)
    return root
c_shoe = shoe("cShoe", mouth, (-.02, 0, -.06), (R(80), 0, R(90)))

# the pile at his feet, S3 versions (they fall from the dog's mouth)
f_leash = empty("fLeash", (0, 0, 0))
blocks("fLeashCoil", [((.42, .035, .02), (0, -.1, .01)), ((.035, .3, .02), (.2, .03, .01)), ((.38, .035, .02), (.02, .17, .01)),
                      ((.035, .22, .02), (-.18, .07, .01)), ((.2, .035, .02), (-.08, -.03, .03))], M["leash"], f_leash)
f_ball = empty("fBall", (0, 0, 0))
blocks("fBallB", [((.13, .13, .09), (0, 0, .065)), ((.09, .09, .13), (0, 0, .065)), ((.09, .13, .09), (0, 0, .065)), ((.13, .09, .09), (0, 0, .065))], M["ball"], f_ball)
f_shoe = shoe("fShoe", None, (0, 0, 0), (R(78), 0, R(30)))

# the S5 pile by the door, under the sleeping dog (the leash handle is placed where his hand reaches, below)
p_ball = empty("pBall", (PILE.x + .3, PILE.y - .22, 0))
blocks("pBallB", [((.13, .13, .09), (0, 0, .065)), ((.09, .09, .13), (0, 0, .065)), ((.09, .13, .09), (0, 0, .065)), ((.13, .09, .09), (0, 0, .065))], M["ball"], p_ball)
p_coil = empty("pCoil", (PILE.x, PILE.y, 0))
blocks("pCoilB", [((.5, .035, .02), (0, -.12, .01)), ((.035, .34, .02), (.24, .03, .01)), ((.46, .035, .02), (.02, .19, .01))], M["leash"], p_coil)
p_shoe = shoe("pShoe", None, (PILE.x - .06, PILE.y + .1, .03), (R(80), 0, R(-20)))

# ---------- the close-up set: the toy at 22x in his hands over his lap, in its own closed box ----------
H = Vector((100, 0, 0)); HC = H + Vector((0, 0, 3.0)); HROT = Euler((R(-40), 0, 0))
hero = toy("htoy"); hero.location = HC; hero.rotation_euler = HROT
sprites = {n: blocks("hpet_" + n, sum((lcd_parts(r_, ox, oy) for r_, ox, oy in parts), []), M["pix"], hero) for n, parts in FRAMES.items()}
bang = blocks("hpet_bang", lcd_parts(BANG, 2, 3), M["pix"], hero)
thumbs = {}
for s in (-1, 1):                                     # s = -1 his left hand (screen left), +1 right
    blocks(f"hpalm{s}", [((.42, .9, 1.25), (1.78 * s, .1, -1.0)), ((1.1, .4, 1.4), (1.3 * s, .85, -.8))], M["skin"], hero)
    base, tip = Vector((1.55 * s, -.98, -1.8)), Vector((.72 * s, -.99, -1.17))
    piv = empty(f"hthumbP{s}", base, hero); piv.rotation_euler = (tip - base).to_track_quat('X', 'Z').to_euler()
    pr = empty(f"hthumb{s}", (0, 0, 0), piv)
    L = (tip - base).length
    box(f"hthumbB{s}", (L + .1, .36, .38), (L / 2, 0, 0), M["skin"], pr)
    box(f"hnail{s}", (.22, .02, .24), (L - .1, .19 * s, 0), M["skin2"], pr)
    thumbs[s] = pr
    beam(f"hsleeve{s}", (2.0 * s, .1, -1.6), (2.9 * s, -2.6, -4.2), 1.05, 1.05, M["hood"], hero)
    beam(f"hcuff{s}", (1.98 * s, .06, -1.55), (2.12 * s, -.3, -1.95), 1.12, 1.12, M["hood2"], hero)
for s in (-1, 1):
    box(f"hthigh{s}", (4.25, 13.0, 2.0), H + Vector((2.2 * s, 3.5, -.4)), M["jeans"])
    box(f"hcouch{s}", (4.0, 13.0, 1.6), H + Vector((6.4 * s, 3.5, -.2)), M["rust2"])
box("hgap", (.3, 13, .5), H + Vector((0, 3.5, -.6)), M["dark"])
box("hbelly", (8.0, 2.0, 5.0), H + Vector((0, -4.5, -1.0)), M["hood"])
for i, (sz, c) in enumerate((((30, 30, .5), (0, 0, -3)), ((30, 30, .5), (0, 0, 16)), ((.5, 30, 20), (-15, 0, 6)),
                             ((.5, 30, 20), (15, 0, 6)), ((30, .5, 20), (0, 15, 6)), ((30, .5, 20), (0, -15, 6)))):
    box(f"hencl{i}", sz, H + Vector(c), M["cream"])
area("hkey", H + Vector((-4.5, -6.5, 10.5)), HC, 6.0, 1150, (1.0, .95, .86))
area("hrim", H + Vector((5.0, 6.0, 9.0)), HC, 5.0, 600, (1.0, .9, .75))
area("hfill", H + Vector((3.0, -8.0, 4.0)), HC, 6.0, 480, (.95, .97, 1.0))

# =====================================================================================================
# ANIMATION, keyed on every song frame
# =====================================================================================================
def man_pose(t):
    p = dict(x=.73, y=2.5, hd=-90.0, pz=.55, hip=-90.0, knee=90.0, lean=22.0, np=20.0, ny=0.0,
             shL=(-33.0, -28.0), shR=(33.0, -28.0), elL=-92.0, elR=-92.0, blink=1.0, sw=0.0)
    fid = 1 - sm(43.3, 43.5, t)
    p["elL"] += 3 * fid * math.sin(t * 2 * math.pi * 2.3); p["elR"] += 3 * fid * math.sin(t * 2 * math.pi * 2.9 + 1)
    p["np"] += 1.5 * math.sin(t * 2 * math.pi * .4) * fid
    if 33.4 < t < 38.2: p["lean"] += 4 * sm(33.4, 34.0, t); p["ny"] = -8 * sm(33.4, 34.0, t)   # hunches away, never looks
    if t >= 44.26:
        u = sm(44.78, 45.3, t)
        p["np"] = lerp(p["np"], -4, u); p["ny"] = 40 * u; p["lean"] = lerp(22, 12, u)
        if 45.9 < t < 46.02: p["blink"] = .15
        v = sm(46.43, 46.85, t)                       # the toy goes down on the cushion by his right side
        p["shR"] = (lerp(33, -18, v), lerp(-28, 0, v)); p["elR"] = lerp(-92, -8, v)
        p["shL"] = (lerp(-33, -4, v), lerp(-28, -38, v)); p["elL"] = lerp(-92, -35, v)
        w = sm(47.24, 47.85, t)                       # he stands
        p["pz"] = lerp(.55, .97, w); p["hip"] = lerp(-90, 0, w); p["knee"] = lerp(90, 0, w)
        p["lean"] = lerp(p["lean"], 4, w) + 28 * math.sin(math.pi * w); p["y"] = 2.5 - .22 * w
        p["shL"] = (lerp(p["shL"][0], -4, w), lerp(p["shL"][1], -6, w)); p["elL"] = lerp(p["elL"], -10, w)
        p["shR"] = (lerp(p["shR"][0], 4, w), p["shR"][1] + 10 * math.sin(math.pi * w))
        p["np"] = lerp(p["np"], 10, w)
        st = sm(47.85, 48.35, t)                      # a step toward the pile, turning to it
        p["x"] = lerp(.73, 1.22, st); p["y"] = lerp(p["y"], 2.0, st); p["hd"] = lerp(-90, -10, st)
        p["ny"] = lerp(p["ny"], 4, st); p["sw"] = math.sin(2 * math.pi * clamp((t - 47.85) / .5)) * 24
        b = sm(48.35, 48.8, t) * (1 - .45 * sm(48.9, 49.6, t))   # crouch, reach, and start to rise with it
        p["pz"] = lerp(p["pz"], .5, b); p["hip"] = lerp(p["hip"], -60, b); p["knee"] = lerp(p["knee"], 120, b)
        p["lean"] = lerp(p["lean"], 60, b); p["np"] = lerp(p["np"], -12, b)
        p["shR"] = (lerp(p["shR"][0], -4, b), lerp(p["shR"][1], -50, b)); p["elR"] = lerp(p["elR"], -4, b)
        p["shL"] = (lerp(p["shL"][0], -6, b), lerp(p["shL"][1], -40, b)); p["elL"] = lerp(p["elL"], -15, b)
    return p

def key_man(fr, t):
    p = man_pose(t); G = MAN
    key(G["root"], fr, loc=(p["x"], p["y"], 0), rot=(0, 0, R(p["hd"])))
    key(G["pel"], fr, loc=(0, 0, p["pz"]))
    key(G["hipL"], fr, rot=(0, R(p["hip"] + p["sw"]), 0)); key(G["hipR"], fr, rot=(0, R(p["hip"] - p["sw"]), 0))
    key(G["kneeL"], fr, rot=(0, R(p["knee"]), 0)); key(G["kneeR"], fr, rot=(0, R(p["knee"]), 0))
    key(G["torso"], fr, rot=(0, R(p["lean"]), 0))
    key(G["neck"], fr, rot=(0, R(p["np"]), R(p["ny"])))
    key(G["shL"], fr, rot=(R(p["shL"][0]), R(p["shL"][1]), 0)); key(G["shR"], fr, rot=(R(p["shR"][0]), R(p["shR"][1]), 0))
    key(G["elL"], fr, rot=(0, R(p["elL"]), 0)); key(G["elR"], fr, rot=(0, R(p["elR"]), 0))
    for e in G["eyes"]: key(e, fr, scale=(1, 1, p["blink"]))

def key_dog(fr, t):
    s = dog_state(t); G = DOG; p = s["pose"]
    w = 2 * math.pi * t / s["period"]; a = s["walk"]
    bob = .018 * abs(math.sin(w)) * (a / 30)
    key(G["root"], fr, loc=(s["pos"].x, s["pos"].y, s["z"] + bob), rot=(0, 0, R(s["head"])))
    br = 1 + .035 * s["breathe"] * math.sin(2 * math.pi * t / 2.6)
    key(G["body"], fr, loc=(0, 0, p["bz"]), rot=(0, R(p["bp"]), 0), scale=(1, br, br))
    sw = R(a) * math.sin(w)
    key(G["legs"]["FL"], fr, rot=(0, R(p["fl"]) + sw, 0)); key(G["legs"]["BR"], fr, rot=(0, R(p["bl"]) + sw, 0))
    key(G["legs"]["FR"], fr, rot=(0, R(p["fl"]) - sw, 0)); key(G["legs"]["BL"], fr, rot=(0, R(p["bl"]) - sw, 0))
    key(G["neck"], fr, rot=(R(p["hr"]), R(p["hp"] + 3 * math.sin(w) * (a / 30)), R(p["hy"])))
    amp, f = s["wag"]
    key(G["tail"], fr, rot=(0, R(p["tp"]), R(p["ty"] + amp * math.sin(2 * math.pi * f * t))))
    for sg, ep in G["ears"]: key(ep, fr, rot=(R(p["ear"] * sg + 4 * math.sin(w) * (a / 30)), 0, 0))

def thumb_press(t, s):
    taps = []
    if s == 1: taps = [22.32, 22.6, 23.4]
    else: taps = [22.05, 24.3]
    fast = [39.0 + i * (.22 if s == 1 else .3) + (0 if s == 1 else .1) for i in range(12 if s == 1 else 8)]
    slow = [41.6 + i * .45 + (0 if s == 1 else .22) for i in range(4)]
    v = 0.0
    for tp in taps + [x for x in fast if x < 41.3] + [x for x in slow if x < 43.3]:
        if tp - .05 <= t <= tp + .13: v = max(v, 1 - abs(t - tp - .04) / .09)
    return clamp(v)

for fr in range(F0, F1 + 1):
    t = fr / FPS
    key_man(fr, t); key_dog(fr, t)
    for s, pr in thumbs.items():
        key(pr, fr, rot=(0, 0, R(15) * s * thumb_press(t, s) * (-1 if s == 1 else 1) + R(-3 * s) * (t >= 43.5)))
    key(hero, fr, rot=(R(-40 + .6 * math.sin(t * 1.3)), 0, R(.5 * math.sin(t * .9 + 1))))
    sunob.rotation_euler = (SUN_A if fr < 1062 else SUN_B).normalized().to_track_quat('-Z', 'Y').to_euler()
    sunob.keyframe_insert("rotation_euler", frame=fr)

# ---------- LCD visibility ----------
prev = None
for fr in range(F0, F1 + 1):
    t = fr / FPS
    name, gdown, lit = lcd_state(t)
    stt = (name, gdown, lit)
    if stt != prev:
        for n, ob in sprites.items():
            vis = (n == name)
            if prev is None or (prev[0] == n) != vis: show(ob, fr, vis)
        if prev is None or prev[2] != lit: show(bang, fr, lit)
        if name == "dead" and (prev is None or prev[1] != gdown or prev[0] != "dead"):
            sprites["dead"].location = (0, 0, -gdown * CELL); sprites["dead"].keyframe_insert("location", frame=fr)
        prev = stt
show(s_idle, F0, True); show(s_idle, sec(43.5), False)

# ---------- props: carried, dropped, and the S5 pile ----------
def world_at(ob, fr):
    scene.frame_set(fr); return ob.matrix_world.translation.copy()

def drop(floor_ob, carried, t_rel, t_land, spot, z_end=0.0):
    f_rel, f_land = sec(t_rel), sec(t_land)
    m = world_at(DOG["mouth"], f_rel)
    end = Vector((spot.x, spot.y, z_end))
    show(carried, f_rel, False)
    show(floor_ob, F0, False); show(floor_ob, f_rel, True); show(floor_ob, sec(38.2), False)
    for fr in range(f_rel, f_land + 1):
        u = (fr - f_rel) / max(1, f_land - f_rel)
        floor_ob.location = (lerp(m.x, end.x, u), lerp(m.y, end.y, u), lerp(m.z - .05, end.z, u * u))
        floor_ob.keyframe_insert("location", frame=fr)
    print(f"[take-06] drop {floor_ob.name} at {end.x:.2f},{end.y:.2f} (frame {f_land})")
    return end

show(c_leash, F0, True)
show(c_ball, F0, False); show(c_ball, sec(33.05), True)
show(c_shoe, F0, False); show(c_shoe, sec(34.65), True)
drop(f_leash, c_leash, 32.55, 32.64, PILE3)
drop(f_ball, c_ball, 33.85, 33.91, PILE3 + Vector((.14, -.14)))
drop(f_shoe, c_shoe, 34.93, 35.0, PILE3 + Vector((-.06, .1)), .03)

# the small toy: in his hands, set down on the cushion at 46.85
F_HOLD, F_DOWN = sec(30.0), sec(46.85)
scene.frame_set(F_HOLD)
hl, hr_ = MAN["handL"].matrix_world.translation.copy(), MAN["handR"].matrix_world.translation.copy()
eye = (MAN["eyes"][0].matrix_world.translation + MAN["eyes"][1].matrix_world.translation) / 2
mid = (hl + hr_) / 2
look = (eye - mid).normalized()
q = (-look).to_track_quat('Y', 'Z')                     # the toy's -y face looks at his eyes
small.matrix_world = Matrix.LocRotScale(mid + look * .02, q, Vector((.045, .045, .045)))
print(f"[take-06] hands L {tuple(round(v, 3) for v in hl)} R {tuple(round(v, 3) for v in hr_)} apart {(hl - hr_).length:.3f}")
bpy.context.view_layer.update()
mw = small.matrix_world.copy()
small.parent = MAN["handR"]; small.matrix_parent_inverse = MAN["handR"].matrix_world.inverted()
small.matrix_world = mw
down_pos = world_at(MAN["handR"], F_DOWN)
couch_toy = toy("ctoy"); couch_toy.scale = (.045, .045, .045)
couch_toy.location = (down_pos.x, down_pos.y, .5 + .03); couch_toy.rotation_euler = (R(-90), 0, R(-70))
print(f"[take-06] toy set down at {tuple(round(v, 3) for v in down_pos)}")
show(small, F0, True); show(small, F_DOWN, False); show(couch_toy, F0, False); show(couch_toy, F_DOWN, True)

# the S5 leash: from under the sleeping dog to the handle, which lies where his left hand reaches at 48.8
F_GRAB = sec(48.8)
grab = world_at(MAN["handR"], F_GRAB)
gz = max(.04, grab.z - .07)
print(f"[take-06] hand reaches {tuple(round(v, 3) for v in grab)}")
anchor = Vector((PILE.x - .18, PILE.y - .18, .03))
s5_leash = empty("s5Leash")
handle = Vector((grab.x, grab.y, gz))
blocks("s5Handle", [((.3, .035, .03), (handle.x, handle.y + .06, gz)), ((.3, .035, .03), (handle.x, handle.y - .06, gz)),
                    ((.035, .15, .03), (handle.x + .15, handle.y, gz)), ((.035, .15, .03), (handle.x - .15, handle.y, gz))], M["leash"], s5_leash)
beam("s5Strap", (handle.x + .15, handle.y, gz), anchor, .035, .02, M["leash"], s5_leash)
under = Vector((handle.x, handle.y, 0))
if gz > .06:                                         # something under the handle so it never floats: his other shoe
    shoe("s5Shoe", s5_leash, (handle.x, handle.y, 0), (0, 0, R(30)))
held = empty("heldLeash", (0, 0, -.07), MAN["handR"])
blocks("heldHandle", [((.035, .3, .03), (0, 0, 0)), ((.03, .03, .16), (0, .14, -.07)), ((.03, .03, .16), (0, -.14, -.07))], M["leash"], held)
strap = box("heldStrap", (.035, .4, .02), (0, .2, 0), M["leash"])
me = strap.data
for v in me.vertices: v.co.y += .2                   # origin at one end, so Stretch To pulls it to the anchor
strap.location = (0, 0, 0); strap.parent = held
anc = empty("leashAnchor", anchor)
st = strap.constraints.new("STRETCH_TO"); st.target = anc; st.rest_length = .4; st.volume = "NO_VOLUME"; st.keep_axis = "PLANE_Z"
for ob, v0 in ((p_ball, False), (p_coil, False), (p_shoe, False), (s5_leash, False)):
    show(ob, F0, False); show(ob, 1062, True)
show(s5_leash, F_GRAB, False); show(held, F0, False); show(held, F_GRAB, True)
show(DOG["shut"], F0, False); show(DOG["shut"], sec(38.2), True)
show(DOG["open"], F0, True); show(DOG["open"], sec(38.2), False)

# =====================================================================================================
# CAMERAS AND CUTS
# =====================================================================================================
def hp(v): return HC + HROT.to_matrix() @ Vector(v)
def cam(name, a, b, target, lens, f0, f1, tgt_b=None):
    c = shot_camera(name, a, target, lens=lens)
    key(c, f0, loc=a); key(c, f1, loc=b)
    tg = bpy.data.objects[c["target"]]
    if tgt_b is not None: key(tg, f0, loc=target); key(tg, f1, loc=tgt_b)
    return c

S = [sec(x) for x in (21.0, 25.84, 32.04, 33.05, 34.65, 38.2, 44.26)] + [F1 + 1]
c1 = cam("s1_toy", hp((.35, -6.7, -.2)), hp((.12, -6.05, -.28)), hp((0, 0, -.32)), 50, S[0], S[1] - 1)
c2 = cam("s2_room", (.3, -3.3, 1.75), (.45, -2.8, 1.65), (.7, 1.9, .85), 30, S[1], S[2] - 1)
c3 = cam("s3a_leash", (.55, -1.0, 1.15), (.65, -.75, 1.1), (1.45, 1.95, .75), 33, S[2], S[3] - 1)
c4 = cam("s3b_ball", (-.5, 0, .85), (-.35, .18, .82), (1.9, 1.85, .45), 30, S[3], S[4] - 1)
c5 = cam("s3c_shoe", (.95, -.25, .38), (1.02, -.02, .36), (1.7, 1.9, .42), 28, S[4], S[5] - 1)
c6 = cam("s4_toy", hp((-.25, -5.6, .25)), hp((-.05, -4.95, .25)), hp((0, 0, .18)), 55, S[5], S[6] - 1)
c7 = cam("s5_room", (-.25, -1.45, 1.45), (-.05, -1.1, 1.4), (1.5, 2.1, .92), 27, S[6], S[7] - 1)
for f, c in zip(S[:-1], (c1, c2, c3, c4, c5, c6, c7)): cut(f, c)

for ob in scene.objects: const_keys(ob)
scene.frame_set(F0)
run(OUT)
