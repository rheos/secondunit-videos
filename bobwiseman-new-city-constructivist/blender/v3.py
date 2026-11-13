# Recipe v3 of the look test (Robin, 2026-11-13: "develop the recipe more... make it more like the reference in the
# ways that it's lacking"). Exec'd into newcity_blender.py's namespace with --v3; same song section, words, cameras and
# palette as v2. What changes, from 50 reference frames sampled every 3 s:
#   1. Open paper. One bold group per frame on a diagonal; the rows of detailed CC0 buildings (their window recesses
#      broke into ink noise) give way to a few sparse constructivist silhouettes (stepped and drum towers, chimneys)
#      in two inks, far off.
#   2. Type as design: words in mixed sizes, small words reversed out of black label bars, thin rules crossing.
#   3. Depth: big out-of-focus shapes pass close to the camera; the focus is shallower.
#   4. Light: a soft pool of light on the ground behind the subject, a heavier vignette (compositor, see setup).

def tower_geo(g, r, x, z, s=1.0):
    """city.js stepTower / drumTower / chimney, as clean geometry (no windows to break into noise)"""
    k = r()
    if k < .55:
        w, d, y = (2 + r() * 2) * s, (2 + r() * 2) * s, 0
        for i in range(2 + math.floor(r() * 4)):
            h = (2 + r() * 4) * s; g.box(w, h, d, x, y, z); y += h; w *= .62 + r() * .2; d *= .62 + r() * .2
        if r() < .6: g.box(.12 * s, (3 + r() * 5) * s, .12 * s, x, y, z)
    elif k < .8:
        R, h = (1.4 + r()) * s, (4 + r() * 8) * s
        g.cyl(R, R, h, T(x, h / 2, z), seg=20); g.box(R * 3.2, .5 * s, R * .9, x, h * (.4 + r() * .4), z)
    else:
        h = (8 + r() * 10) * s; g.cyl(.5 * s, .5 * s, h, T(x, h / 2, z), seg=10); g.box(2.5 * s, 2 * s, 2.5 * s, x, 0, z)

SIL = {}
def sil_mat(ground):
    """two inks only: faces toward the light in the accent, the rest in the dark ink (no paper-ink highlights)"""
    if ground not in SIL:
        hi = {"cream": "red", "red": "black", "black": "red"}[ground]
        SIL[ground] = ink(f"sil_{ground}", hi, hi, "black", .38, .38, 0.0)
    return SIL[ground]

def skyline(name, ground, seed, x0, x1, z0, z1, n=40, scale=(3.0, 6.0), side=(-1, 1)):
    """a sparse band of silhouettes: n towers scattered over |x| in [x0, x1], z in [z1, z0]"""
    r = rng(seed); g = Geo()
    for i in range(n):
        sd = side[i % len(side)]; x = sd * lerp(x0, x1, r()); z = lerp(z0, z1, r())
        tower_geo(g, r, x, z, lerp(scale[0], scale[1], r()))
    return mesh_obj(name, g.mesh(name, [sil_mat(ground)]))

def label(w, cap, pos, rot, ink_key="cream", bar="black", pad=.35, stretch=1.0, parent=ROOT):
    """a word reversed out of a flat label bar (bar first, the word just above it)"""
    m = word(w["w"], FLAT[ink_key], parent=parent); W = m["width"] * cap
    bh = cap * stretch * (1 + 2 * pad); bw = W + cap * 2 * pad
    b = mesh_obj(f"lbl_{w['w']}", Geo().plane(bw, bh).mesh("lbl", [FLAT[bar]]), parent=parent)
    place(b, (pos[0], pos[1] - .01, pos[2]), rot); b.scale = (1, 1, 1)
    # the plane is centred; the word's baseline sits a pad above the bar's bottom edge
    off = Matrix.Rotation(rot[2], 4, "Z")
    place(m, pos, rot, (cap, cap * stretch, cap))
    m["s"] = w["s"]; m["base"] = tuple(m.scale); b["s"] = w["s"]; b["base"] = (1, 1, 1)
    return m, b

def thin_rule(name, length, width, key, pos, rot, parent=ROOT):
    return place(mesh_obj(name, Geo().plane(length, width).mesh(name, [FLAT[key]]), parent=parent), pos, rot)

def blur_slab(name, w, h, key, pos, ry=0.0):
    """a big flat shape close to the camera, so depth of field turns it into a soft blot passing through"""
    return place(mesh_obj(name, Geo().plane(w, h).mesh(name, [FLAT[key]])), pos, (0, ry, 0))
