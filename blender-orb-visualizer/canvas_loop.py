# Take 02: an 8-second seamless Canvas loop for Bob Wiseman's "Travel Agent" (Blender 4.5 LTS, EEVEE).
#
# The traveller and his rain cloud walk on top of a little cube-shaped world. The world turns once in
# exactly 8 s, so every destination passes under him (beach, snow, city) and he arrives back at the
# travel agent: the last frame runs straight into the first. Everything else that moves has a period
# that divides 8 s (walk 1 s, cloud bob 2 s, rain 0.5 s, the corner bump 2 s), so nothing jumps at the seam.
#
# Pixel look after Kevin Ngo's Blender GIFs: rendered at 180x320, scaled 4x with nearest-neighbour by
# ffmpeg (tools/canvas_encode.sh), voxel boxes with 16-pixel textures sampled "Closest" in world units.
#
#   blender -b --factory-startup --python canvas_loop.py -- --stills 1,49,97,145   (test stills)
#   blender -b --factory-startup --python canvas_loop.py -- --render                (all 192 frames)
# Frames land in out/canvas/take-02/frames/. Re-runnable in an open file (removes only CL_ datablocks). Helpers in canvas_kit.py.
import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd())
import canvas_kit as K
from canvas_kit import FPS, SECONDS, FRAMES, mat, specks, windows, stripes, box, empty, hex_lin

A = 2.5                                      # half-size of the world cube (m)
LANE_Y = -1.05                               # the traveller's lane, in front of the props
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else os.getcwd()
OUT = os.path.join(HERE, "out", "canvas", "take-02")
scene = K.reset()

# ---------- palette (the film's own) ----------
M = dict(
    dirt=mat("dirt", "#8a5a3a", .12, 2, texel=.12, pattern=specks("#8d877e", "#6b5f55", .07)), stone=mat("stone", "#7d7468", .10, 3),
    grass=mat("grass", "#7fa35a", .10, 4), sand=mat("sand", "#e6c98a", .07, 5), snow=mat("snow", "#f2f0ea", .03, 6),
    road=mat("road", "#5b5a5e", .08, 7), sea=mat("sea", "#4f9fb0", .06, 8, rough=.3),
    brick=mat("brick", "#b4553b", .10, 9), cream=mat("cream", "#f3ead2", .04, 10), teal=mat("teal", "#3f7f7c", .06, 11),
    awning=mat("awning", "#c8341e", 0, 12, texel=.08, pattern=stripes("#c8341e", "#f3ead2")),
    glass=mat("glass", "#bfe0e4", .03, 13), trunk=mat("trunk", "#8b6a43", .10, 14), leaf=mat("leaf", "#4f8a4a", .12, 15),
    pine=mat("pine", "#2f6b4f", .10, 16), rock=mat("rock", "#8d8a86", .10, 17),
    tower1=mat("tower1", "#c98478", 0, 18, texel=.07, pattern=windows("#c98478", "#ffd77a")),
    tower2=mat("tower2", "#c8922e", 0, 19, texel=.07, pattern=windows("#c8922e", "#fff1b8")),
    tower3=mat("tower3", "#93a57c", 0, 20, texel=.07, pattern=windows("#93a57c", "#ffe9a0")),
    umbrella=mat("umbrella", "#c8341e", 0, 21, texel=.06, pattern=stripes("#d4682f", "#f7f0dd")),
    coat=mat("coat", "#3f7f7c", .06, 22, texel=.05), skin=mat("skin", "#efd9b9", .03, 23, texel=.05),
    hat=mat("hat", "#4b3426", .06, 24, texel=.05), trouser=mat("trouser", "#4a3b33", .05, 25, texel=.05),
    case=mat("case", "#8a4b2a", .08, 26, texel=.05), ink=mat("ink", "#1e1a14", 0, 27, texel=.05),
    cloud=mat("cloud", "#8d88a6", .06, 28, texel=.06), cloud2=mat("cloud2", "#a9a4c0", .05, 29, texel=.06),
    rain=mat("rain", "#6fb0e6", 0, 30, emit=.6), ochre=mat("ochre", "#c8922e", .05, 31, texel=.05),
)

# ---------- the world ----------
planet = empty("planet")
box("core", (2 * A, 2 * A, 2 * A), (0, 0, 0), M["dirt"], planet)
SURF = ["grass", "sand", "snow", "road"]
faces = []
for k in range(4):
    f = empty(f"face{k}", parent=planet); f.rotation_euler = (0, math.radians(90 * k), 0)
    box(f"slab{k}", (2 * A + .02, 2 * A + .02, .22), (0, 0, A - .1), M[SURF[k]], f)
    faces.append(f)

def on(face, name, size, x, y, z0, material):
    """A box standing on a face: x along the face, y depth, z0 height of its base above the surface."""
    return box(name, size, (x, y, A + .01 + z0 + size[2] / 2), material, face)

# face 0, at the top at t = 0: the travel agent
f = faces[0]
on(f, "shop", (2.4, 1.5, 1.7), .35, .95, 0, M["brick"])
on(f, "shopWin", (1.0, .05, .7), -.15, .19, .35, M["glass"])
on(f, "shopDoor", (.45, .05, 1.0), .95, .19, 0, M["teal"])
on(f, "sign", (1.7, .1, .32), .35, .17, 1.38, M["cream"])
for i in range(6):
    on(f, f"awn{i}", (.4, .5, .12), -.65 + i * .4, .05, 1.1 - (i % 2) * .0, M["awning"])
on(f, "lampPost", (.08, .08, 2.0), -1.6, .3, 0, M["ink"])
on(f, "lamp", (.22, .22, .18), -1.6, .3, 2.0, M["ochre"])

# face 1: the beach
f = faces[1]
on(f, "seaStrip", (2 * A, 1.4, .06), 0, 1.75, 0, M["sea"])
for i in range(6):
    on(f, f"trunk{i}", (.22, .22, .32), -1.2 + i * .07, .7, i * .32, M["trunk"])
for dx, dy in ((.55, 0), (-.55, 0), (0, .5), (0, -.5), (.35, .35)):
    on(f, f"leaf{dx}{dy}", (.75 if dx else .3, .3 if dx else .75, .16), -1.2 + .35 + dx, .7 + dy, 1.9, M["leaf"])
on(f, "umbPole", (.06, .06, 1.2), 1.1, .9, 0, M["cream"])
on(f, "umbTop", (1.1, 1.1, .14), 1.1, .9, 1.2, M["umbrella"])

# face 2: the snow
f = faces[2]
for i, (w, h) in enumerate(((3.0, .7), (2.1, .6), (1.3, .55), (.6, .45))):
    on(f, f"mtn{i}", (w, 1.4, h), .3, 1.2, sum(hh for _, hh in ((3.0, .7), (2.1, .6), (1.3, .55), (.6, .45))[:i]), M["rock"] if i < 2 else M["snow"])
for j, x in enumerate((-1.7, 1.8)):
    on(f, f"pineT{j}", (.16, .16, .35), x, .45, 0, M["trunk"])
    for i, w in enumerate((.9, .65, .4)):
        on(f, f"pine{j}{i}", (w, w, .4), x, .45, .35 + i * .38, M["pine"])

# face 3: the city
f = faces[3]
for i, (x, w, h, m) in enumerate(((-1.6, .9, 2.6, "tower1"), (-.6, .8, 3.4, "tower2"), (.4, 1.0, 2.2, "tower3"), (1.5, .8, 3.0, "tower1"))):
    on(f, f"tower{i}", (w, 1.2, h), x, 1.1, 0, M[m])

# far scenery: a few still voxel clouds in the sky behind
for i, (x, z, w) in enumerate(((-4.5, 9.5, 2.2), (3.8, 11.0, 2.8), (-1.0, 12.5, 1.6))):
    box(f"farCloud{i}", (w, .8, .5), (x, 18, z), M["cloud2"])

# ---------- the traveller (never Bob) and his cloud ----------
TS = 1.4                                     # traveller scale
trav = empty("traveller", (0, LANE_Y, A + .12)); trav.scale = (TS, TS, TS)
hipL = empty("hipL", (-.0, .1, .62), trav); hipR = empty("hipR", (0, -.1, .62), trav)
box("legL", (.16, .16, .6), (0, 0, -.3), M["trouser"], hipL); box("legR", (.16, .16, .6), (0, 0, -.3), M["trouser"], hipR)
box("shoeL", (.26, .18, .1), (.04, 0, -.6), M["ink"], hipL); box("shoeR", (.26, .18, .1), (.04, 0, -.6), M["ink"], hipR)
box("coatB", (.44, .38, .62), (0, 0, .92), M["coat"], trav)
box("coatHem", (.5, .42, .14), (0, 0, .66), M["coat"], trav)
box("head", (.34, .32, .34), (0, 0, 1.42), M["skin"], trav)
box("eye", (.04, .06, .06), (.17, -.07, 1.45), M["ink"], trav)
box("eye2", (.04, .06, .06), (.17, .07, 1.45), M["ink"], trav)
box("brim", (.62, .56, .06), (0, 0, 1.6), M["hat"], trav)
box("crown", (.36, .34, .22), (0, 0, 1.72), M["hat"], trav)
box("band", (.37, .35, .05), (0, 0, 1.65), M["ochre"], trav)
shL = empty("shoulderL", (0, .23, 1.18), trav); shR = empty("shoulderR", (0, -.23, 1.18), trav)
box("armL", (.14, .14, .52), (0, 0, -.26), M["coat"], shL); box("armR", (.14, .14, .52), (0, 0, -.26), M["coat"], shR)
box("handR", (.12, .12, .12), (0, 0, -.56), M["skin"], shR)
box("case", (.42, .14, .32), (0, -.04, -.78), M["case"], shR)
box("handle", (.16, .06, .06), (0, -.04, -.6), M["ink"], shR)

cloud = empty("cloud", (0, LANE_Y + .05, A + 3.0)); cloud.scale = (1.3, 1.3, 1.3)
for i, (x, z, w, h) in enumerate(((0, 0, 1.2, .45), (-.35, .25, .6, .4), (.3, .3, .7, .45), (.62, .05, .45, .32), (-.65, .02, .42, .3))):
    box(f"puff{i}", (w, .7, h), (x, 0, z), M["cloud"] if i == 0 else M["cloud2"], cloud)
drops = []
DROPX = [-.5, -.25, 0, .22, .45, -.38, .1, .35, -.12, .55]
for i, x in enumerate(DROPX):
    drops.append(box(f"drop{i}", (.05, .05, .16), (x, 0, 0), M["rain"], cloud))

# ---------- camera, light, world ----------
K.camera((-7.0, -23.0, 11.6), (.3, 0, 1.6), lens=50)
K.sun(3.2, (52, -18, -38))
K.sky([(.05, "#f4dfc4"), (.45, "#d9e4df"), (.95, "#7fa9c4")])
K.render_setup(OUT)

# ---------- animation: everything keyed on every frame, all periods divide 8 s ----------
def surface_height(theta):
    """Height of the world's top surface straight above its centre when the cube has turned by theta."""
    q = ((theta + math.pi / 4) % (math.pi / 2)) - math.pi / 4
    return A / math.cos(q)

for fr in range(1, FRAMES + 1):
    t = (fr - 1) / FPS                                  # 0 .. 7.958; t = 8 is t = 0 again
    u = t / SECONDS
    theta = 2 * math.pi * u
    planet.rotation_euler = (0, -theta, 0); planet.keyframe_insert("rotation_euler", frame=fr)
    h = surface_height(theta)
    w = 2 * math.pi * t / 1.0                           # walk cycle: 1 s
    bob = .045 * abs(math.sin(w))
    trav.location = (0, LANE_Y, h + .12 + bob); trav.keyframe_insert("location", frame=fr)
    trav.rotation_euler = (0, math.radians(2.5) * math.sin(w), 0); trav.keyframe_insert("rotation_euler", frame=fr)
    sw = math.radians(32) * math.sin(w)
    hipL.rotation_euler = (0, sw, 0); hipR.rotation_euler = (0, -sw, 0)
    shL.rotation_euler = (0, -sw * .8, 0); shR.rotation_euler = (0, sw * .25, 0)   # the case arm swings less
    for o in (hipL, hipR, shL, shR): o.keyframe_insert("rotation_euler", frame=fr)
    cb = .09 * math.sin(2 * math.pi * t / 2.0)          # cloud bob: 2 s
    cloud.location = (.05, LANE_Y + .05, h + 3.55 + cb); cloud.keyframe_insert("location", frame=fr)
    for i, d in enumerate(drops):                       # rain: each drop falls in 0.5 s, phases spread
        ph = ((t / .5) + i / len(drops)) % 1.0
        d.location = (DROPX[i], 0, -.25 - ph * 1.05); d.keyframe_insert("location", frame=fr)

K.linear_keys()
K.run(OUT)
