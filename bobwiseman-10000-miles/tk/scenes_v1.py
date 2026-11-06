# Verse 1 scenes. Each build(K, span) makes one diorama in an empty Blender scene, keys every frame of its span,
# and returns the frame range. The rocket (the anchor) is composited at frame centre on top of every scene, so keep
# a clear patch of about 60 x 90 px at the centre: put faces and key action below or beside it.
import math, random
from mathutils import Vector

def launch(K, span):
    """The opener: a launch pad on a hill at dusk, its gantry still smoking. The smoke trail rises from the pad to
    frame centre, where the rocket is, so the anchor reads as the rocket that just left. Two small people wave."""
    P = K.P; K.world("#5a6aa8", "#f2b48a"); cam = K.camera(42); K.sun((30, 0, -60), 2.6)
    K.cyl("hill", 9, 7.5, 2.2, K.toon("#6f9a5a"), (0, 4, -1.6), seg=64)
    K.cyl("hill2", 14, 12, 2.0, K.toon("#557f4c"), (-6, 14, -1.9), seg=64)
    pad = K.empty("pad", (0, 0, -.5))
    K.cube("slab", (1.6, 1.6, .2), K.toon(P["grey2"]), (0, 0, 0), parent=pad)
    for i in range(6): K.cube(f"gantry{i}", (.12, .12, .5), K.toon(P["red"]), (.75, .4, .3 + i * .5), parent=pad)
    for i in range(6): K.cube(f"arm{i}", (.5, .06, .06), K.toon(P["cream"]), (.5, .4, .45 + i * .5), parent=pad)
    rng = random.Random(21); puffs = []
    TOP = 2.1                                       # the trail ends here, at frame centre, where the rocket is
    for i in range(18):
        u = i / 17
        x = .18 * math.sin(u * 5.5) * (1 - u); z = .1 + u * TOP
        puffs.append((K.sphere(f"smoke{i}", .1 + .2 * (1 - u) + rng.uniform(0, .05), K.toon("#f4ece4" if i % 2 else "#e2d8d2"), (x, 0, z)), u, x, z))
    kids = [K.person(f"kid{k}", (-1.25 + k * .45, -.6, -.45), sweater=[P["coral"], P["house1"]][k], scale=.42) for k in range(2)]
    a, b = span; frames = range(K.frame_of(a), K.frame_of(b) + 1)
    def anim(t, f):
        bloom = 1 + .45 * K.ramp(t, 10.3, 11.4)
        for o, u, x, z in puffs:
            s = bloom * (1 + .06 * math.sin(t * 2 + u * 9)) * (1 + .5 * u * K.ramp(t, a, b)); o.scale = (s, s, s)
            o.location = (x + .08 * math.sin(t * .7 + u * 4) * u, 0, z); K.key(o, "scale", f); K.key(o, "location", f)
        for k, kp in enumerate(kids):
            wave = math.radians(150) + math.radians(25) * math.sin(t * 7 + k)
            kp["armR"].rotation_euler = (0, -wave, 0); kp["head"].rotation_euler = (math.radians(-25), 0, 0)
            K.key_parts(kp, f)
        K.aim(cam, (0, -14.0, TOP + .2), (0, 0, TOP)); K.keycam(cam, f)
    K.bake(frames, anim); return frames

def problems(K, span):
    """A desk under a paper pile and a storm cloud. The cloud swells, then the camera falls away fast and it is small."""
    P = K.P; K.world(P["wall"]); cam = K.camera(40); K.sun((50, -10, -40), 3.0)
    K.cube("floor", (40, 40, .2), K.toon("#d9c3a5"), (0, 0, -.1)); K.cube("wall", (40, .2, 20), K.toon(P["wall"]), (0, 6, 10))
    desk = K.empty("desk")
    K.cube("top", (3.0, 1.6, .12), K.toon(P["wood"]), (0, 0, .9), parent=desk)
    for sx in (-1, 1):
        for sy in (-1, 1): K.cube(f"leg{sx}{sy}", (.12, .12, .9), K.toon(P["wood2"]), (sx * 1.35, sy * .65, .45), parent=desk)
    rng = random.Random(3)
    for i in range(9):
        K.cube(f"paper{i}", (.62, .82, .025), K.toon("#fbf7ee" if i % 3 else "#f0e2b8"), (-.5 + rng.uniform(-.06, .06), rng.uniform(-.05, .05), .975 + i * .035), (0, 0, rng.uniform(-.25, .25)), parent=desk)
    for i in range(4):
        K.cube(f"bill{i}", (.5, .32, .02), K.toon("#e9e1f0" if i % 2 else "#f6d6cf"), (.55 + i * .1, -.15 + i * .08, .975 + i * .022), (0, 0, rng.uniform(-.6, .6)), parent=desk)
    K.cyl("mug", .12, .12, .26, K.toon(P["cobalt"]), (1.05, .3, 1.09), parent=desk)
    cloud = K.empty("cloud", (0, .2, 2.75))
    for i, (x, z, rr) in enumerate(((0, 0, .55), (-.55, -.1, .42), (.55, -.05, .45), (-.25, .3, .4), (.3, .28, .42), (-.95, -.2, .3), (.95, -.18, .32))):
        K.sphere(f"puff{i}", rr, K.toon(P["grey"] if i % 2 else P["grey2"]), (x, 0, z), (1, .8, .85), parent=cloud)
    drops = [K.cube(f"drop{i}", (.03, .03, .2), K.toon(P["rain"], emit=1.0), (rng.uniform(-1, 1), .2, 2), bevel=0) for i in range(26)]
    dx = [d.location.x for d in drops]; ph = [rng.random() for _ in drops]
    a, b = span; frames = range(K.frame_of(a), K.frame_of(b) + 1)
    def anim(t, f):
        big = 1 + .75 * K.ramp(t, 18.14, 19.3)
        cloud.scale = (big, big, big); K.key(cloud, "scale", f)
        cloud.location = (.03 * math.sin(t * 1.7), .2, 2.75 + .35 * (big - 1)); K.key(cloud, "location", f)
        away = K.ramp(t, 20.46, 21.5) ** .7
        eye = Vector((0, -6.4, 2.6)).lerp(Vector((0, -28, 26)), away); tgt = Vector((0, 0, 1.75)).lerp(Vector((0, 0, 1.2)), away)
        eye += Vector((.25 * math.sin(t * .6), 0, .1 * math.sin(t * .9)))
        K.aim(cam, eye, tgt); K.keycam(cam, f)
        for i, d in enumerate(drops):
            u = ((t / .55) + ph[i]) % 1
            d.location = (dx[i] * big * .95, .2, 2.75 + .35 * (big - 1) - .4 - u * 1.4); K.key(d, "location", f)
    K.bake(frames, anim); return frames

def world(K, span):
    """A little round world of houses and trees on a turning disc."""
    P = K.P; K.world(P["sky"], "#f4e3cf"); cam = K.camera(45); K.sun((55, 0, -50), 3.0)
    disc = K.empty("disc")
    K.cyl("ground", 2.2, 2.2, .5, K.toon(P["green"]), (0, 0, -.25), parent=disc, seg=64)
    K.cyl("soil", 2.21, 2.0, .7, K.toon(P["brown"]), (0, 0, -.85), parent=disc, seg=64)
    rng = random.Random(9); cols = [P["house1"], P["house2"], P["house3"], P["cream"]]
    for i in range(7):
        a = i / 7 * 2 * math.pi + .3; rr = 1.25 + rng.uniform(-.25, .25)
        h = K.empty(f"house{i}", (math.cos(a) * rr, math.sin(a) * rr, 0), disc); h.rotation_euler = (0, 0, a)
        K.cube(f"hbox{i}", (.42, .42, .42), K.toon(cols[i % 4]), (0, 0, .21), parent=h)
        K.cyl(f"roof{i}", .34, 0, .3, K.toon(P["roof"]), (0, 0, .57), (0, 0, math.pi / 4), parent=h, seg=4)
    for i in range(9):
        a = rng.uniform(0, 2 * math.pi); rr = rng.uniform(.3, 1.9)
        t_ = K.empty(f"tree{i}", (math.cos(a) * rr, math.sin(a) * rr, 0), disc)
        K.cyl(f"trunk{i}", .05, .05, .25, K.toon(P["brown"]), (0, 0, .12), parent=t_)
        K.sphere(f"crown{i}", .2, K.toon(P["green2"]), (0, 0, .38), (1, 1, 1.2), parent=t_)
    K.aim(cam, (0, -7.2, 4.4), (0, 0, .1))
    a, b = span; frames = range(K.frame_of(a), K.frame_of(b) + 1)
    def anim(t, f): disc.rotation_euler = (0, 0, math.radians(38) * (t - a)); K.key(disc, "rotation_euler", f)
    K.bake(frames, anim); return frames

def window(K, span):
    """One lit window at night, the person with a small smile. The camera drifts in, then pulls away as the portal closes."""
    P = K.P; K.world(P["night"], P["night2"]); cam = K.camera(50); K.sun((40, 0, 30), .6)
    K.cube("wall", (12, .4, 9), K.toon("#6a5a7a", .8, 1.03), (0, .2, 1.0))
    K.cube("frame", (1.9, .2, 1.5), K.toon(P["cream"]), (0, -.05, 1.25))
    K.cube("glow", (1.6, .02, 1.22), K.toon(P["lamp"], emit=1.3), (0, -.17, 1.25), bevel=0)
    K.cube("sill", (2.2, .6, .1), K.toon(P["cream"]), (0, -.3, .45))
    K.cube("mullion", (.06, .02, 1.22), K.toon(P["cream"]), (0, -.19, 1.25), bevel=0)
    pp = K.person("you", (.35, -.35, -.2))
    a, b = span; frames = range(K.frame_of(a), K.frame_of(b) + 1)
    def anim(t, f):
        push = K.ramp(t, 25.4, 31.2) * .35; away = K.ramp(t, 31.26, 33.0) ** .8
        eye = Vector((-.3, -6.0 + 2.2 * push, 1.35)).lerp(Vector((-.6, -26, 4.5)), away)
        K.aim(cam, eye, (.2, 0, 1.78)); K.keycam(cam, f)
        pp["root"].rotation_euler = (0, 0, math.radians(6) * math.sin(t * .8)); K.key_parts(pp, f)
    K.bake(frames, anim); return frames

def cat(K, span):
    """A cat on a sunny sill turns away, then yawns half back at us."""
    P = K.P; K.world(P["day"], "#f7ead6"); cam = K.camera(50); K.sun((50, -10, -30), 3.2)
    K.cube("wall", (12, .4, 9), K.toon(P["wall"]), (0, .6, 0)); K.cube("sill", (3.4, .9, .14), K.toon(P["sill"]), (0, 0, 0))
    K.cyl("pot", .2, .15, .32, K.toon(P["pot"]), (-1.0, .05, .23))
    for i in range(5):
        a = i / 5 * 2 * math.pi
        K.sphere(f"leaf{i}", .13, K.toon(P["leaf"]), (-1.0 + math.cos(a) * .12, .05 + math.sin(a) * .05, .5 + i * .03), (1, .6, 1.5))
    c = K.empty("cat", (.25, 0, .07))
    K.sphere("body", .38, K.toon(P["cat"]), (0, 0, .3), (1.25, .8, .78), parent=c)
    head = K.empty("headRoot", (-.42, -.05, .62), c)
    K.sphere("head", .25, K.toon(P["cat"]), (0, 0, 0), (1, .95, .9), parent=head)
    K.sphere("muzzle", .12, K.toon(P["cat2"]), (0, -.19, -.05), (1.2, .6, .8), parent=head)
    for x in (-.14, .14): K.cyl(f"ear{x}", .09, 0, .18, K.toon(P["cat"]), (x, 0, .22), (0, x * .8, 0), parent=head, seg=4)
    eyes = [K.sphere(f"eye{x}", .035, K.toon(P["ink"]), (x, -.22, .06), parent=head) for x in (-.08, .08)]
    mouth = K.sphere("mouth", .045, K.toon("#7a2e3a"), (0, -.24, -.08), (1, .3, .2), parent=head)
    tail = [K.sphere(f"tail{i}", .07, K.toon(P["cat"]), (.45 + i * .1, .05, .2 + i * .05), parent=c) for i in range(6)]
    a, b = span; frames = range(K.frame_of(a), K.frame_of(b) + 1)
    def anim(t, f):
        turn = K.ramp(t, 39.92, 40.6) - .55 * K.ramp(t, 41.2, 41.6)
        head.rotation_euler = (0, 0, math.radians(-75) * turn + math.radians(4) * math.sin(t * 1.3)); K.key(head, "rotation_euler", f)
        yawn = K.pulse(t, 41.6, 42.7)
        mouth.scale = (1, .3, .2 + 1.6 * yawn); K.key(mouth, "scale", f)
        for e in eyes: e.scale = (1, 1, 1 - .85 * yawn); K.key(e, "scale", f)
        for i, s_ in enumerate(tail):
            s_.location = (.45 + i * .1, .05, .2 + i * .05 + .06 * math.sin(t * 2.2 - i * .6) * (i / 5)); K.key(s_, "location", f)
        K.aim(cam, (-.4 + .12 * math.sin(t * .5), -5.6, 1.3), (-.15, 0, 1.0)); K.keycam(cam, f)
    K.bake(frames, anim); return frames

SCENES = dict(launch=launch, problems=problems, world=world, window=window, cat=cat)
