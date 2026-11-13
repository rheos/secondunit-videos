# New props and figures for the sections the look test didn't cover, built in code like city.js's person(): animals
# for the animals verse in two styles (A blocky, B rounded, matching the crowd figures), bare flagpoles for "let there
# be no flags" (masts only, never a flag), and printed building blocks for the choruses. Three.js coordinates
# (y up), animals face +x, feet on y = 0, about life size against the crowd figure's 1.9.
import math
from mathutils import Vector

V = lambda a, b, c: Vector((a, b, c))

# ---- A: blocky animals (boxes and beams) ------------------------------------------------------------------------------
def _legs_box(g, xs, zs, top, t):
    for x in xs:
        for z in zs: g.box(t, top, t, x, 0, z)

def ox_a(g):
    g.box(2.0, .9, .85, 0, .75, 0); _legs_box(g, (-.75, .75), (-.28, .28), .78, .2)
    g.box(.55, .5, .5, 1.2, 1.15, 0); g.box(.3, .25, .42, 1.55, 1.05, 0)
    for z in (-.18, .18): g.beam(V(1.15, 1.62, z), V(1.25, 1.85, z * 2.2), .07)
    g.beam(V(-1.0, 1.5, 0), V(-1.15, .9, 0), .06)

def horse_a(g):
    g.box(1.8, .7, .6, 0, 1.05, 0); _legs_box(g, (-.7, .7), (-.2, .2), 1.08, .16)
    g.beam(V(.85, 1.55, 0), V(1.2, 2.25, 0), .32); g.box(.62, .3, .3, 1.45, 2.05, 0)
    g.beam(V(.95, 1.8, 0), V(1.1, 2.3, 0), .08); g.beam(V(-.9, 1.6, 0), V(-1.15, 1.0, 0), .12)

def deer_a(g):
    g.box(1.3, .55, .45, 0, .95, 0); _legs_box(g, (-.5, .5), (-.15, .15), .98, .1)
    g.beam(V(.6, 1.35, 0), V(.82, 1.95, 0), .2); g.box(.42, .22, .24, 1.0, 1.85, 0)
    for z in (-.1, .1):
        b = V(.8, 2.05, z); t = V(.6, 2.6, z * 4); g.beam(b, t, .05)
        g.beam(V(.72, 2.3, z * 2.4), V(.95, 2.55, z * 3.2), .04); g.beam(V(.66, 2.45, z * 3.2), V(.45, 2.65, z * 4.5), .04)

def pig_a(g):
    g.box(1.3, .7, .75, 0, .35, 0); _legs_box(g, (-.45, .45), (-.22, .22), .38, .16)
    g.box(.4, .45, .5, .8, .5, 0); g.box(.12, .2, .26, 1.05, .55, 0)
    for z in (-.15, .15): g.box(.12, .14, .1, .72, .98, z)

def dog_a(g):
    g.box(1.0, .4, .36, 0, .5, 0); _legs_box(g, (-.38, .38), (-.12, .12), .52, .1)
    g.box(.34, .3, .3, .6, .82, 0); g.box(.22, .14, .18, .85, .82, 0)
    for z in (-.1, .1): g.box(.08, .18, .08, .56, 1.12, z)
    g.beam(V(-.5, .85, 0), V(-.75, 1.15, 0), .06)

def bird_a(g):
    g.box(.5, .3, .3, 0, .35, 0); g.box(.24, .22, .2, .3, .6, 0); g.box(.14, .05, .06, .47, .7, 0)
    g.box(.3, .06, .5, -.05, .62, 0); g.beam(V(-.25, .5, 0), V(-.5, .7, 0), .1)
    for z in (-.07, .07): g.beam(V(0, .36, z), V(0, 0, z), .03)

# ---- B: rounded animals (capsules and balls, like the crowd figures) -----------------------------------------------
def _legs_round(g, xs, zs, top, r):
    for x in xs:
        for z in zs: g.limb(V(x, top, z), V(x, .02 + r, z), r)

def ox_b(g):
    g.limb(V(-.65, 1.08, 0), V(.65, 1.08, 0), .44); _legs_round(g, (-.62, .62), (-.24, .24), .9, .1)
    g.sphere(.3, _T(1.15, 1.25, 0)); g.sphere(.2, _T(1.38, 1.1, 0))
    for z in (-.18, .18): g.limb(V(1.12, 1.48, z), V(1.2, 1.7, z * 2.3), .045)
    g.limb(V(-1.05, 1.25, 0), V(-1.2, .8, 0), .04)

def horse_b(g):
    g.limb(V(-.6, 1.3, 0), V(.6, 1.3, 0), .33); _legs_round(g, (-.58, .58), (-.17, .17), 1.15, .08)
    g.limb(V(.75, 1.55, 0), V(1.05, 2.15, 0), .16); g.limb(V(1.05, 2.15, 0), V(1.45, 2.0, 0), .13)
    g.limb(V(-.9, 1.5, 0), V(-1.1, .95, 0), .07)

def deer_b(g):
    g.limb(V(-.42, 1.15, 0), V(.42, 1.15, 0), .25); _legs_round(g, (-.4, .4), (-.13, .13), 1.0, .055)
    g.limb(V(.5, 1.32, 0), V(.72, 1.85, 0), .1); g.limb(V(.72, 1.85, 0), V(1.0, 1.8, 0), .09)
    for z in (-.08, .08):
        g.limb(V(.72, 1.95, z), V(.55, 2.45, z * 4), .025); g.limb(V(.64, 2.2, z * 2.5), V(.88, 2.4, z * 3.4), .022)
        g.limb(V(.6, 2.35, z * 3.4), V(.42, 2.55, z * 4.6), .022)

def pig_b(g):
    g.limb(V(-.42, .7, 0), V(.42, .7, 0), .36); _legs_round(g, (-.36, .36), (-.18, .18), .45, .08)
    g.sphere(.26, _T(.82, .78, 0)); g.cyl(.11, .11, .14, _T(1.07, .74, 0) @ _RZ(math.pi / 2), seg=10)
    for z in (-.14, .14): g.sphere(.07, _T(.8, 1.03, z), 6, 4)

def dog_b(g):
    g.limb(V(-.32, .72, 0), V(.32, .72, 0), .19); _legs_round(g, (-.3, .3), (-.1, .1), .62, .05)
    g.sphere(.17, _T(.58, .98, 0)); g.limb(V(.68, .95, 0), V(.85, .92, 0), .08)
    for z in (-.09, .09): g.limb(V(.52, 1.12, z), V(.5, 1.28, z), .04)
    g.limb(V(-.45, .85, 0), V(-.68, 1.12, 0), .04)

def bird_b(g):
    g.sphere(.2, _T(0, .42, 0)); g.sphere(.12, _T(.2, .62, 0)); g.limb(V(.3, .64, 0), V(.42, .62, 0), .03)
    g.limb(V(-.18, .48, 0), V(-.42, .62, 0), .06)
    for z in (-.06, .06): g.limb(V(0, .26, z), V(0, .02, z), .02)

# ---- C: a bare flagpole (no flag, ever): mast, ball finial, truck, halyard, cleat, base ---------------------------------
def flagpole(g, h=14.0):
    g.cyl(.14, .07, h, _T(0, h / 2, 0), seg=12); g.sphere(.22, _T(0, h + .18, 0), 10, 6)
    g.box(.8, .5, .8, 0, 0, 0); g.box(.06, .35, .06, .12, 1.4, 0)
    g.beam(V(.09, 1.5, 0), V(.09, h - .1, 0), .015); g.beam(V(.12, 1.5, .03), V(.12, h - .1, .03), .015)

# ---- D: building blocks (a word is printed on the top face of each) -------------------------------------------------
def block(g, w=6.0, h=2.4, d=3.0):
    g.box(w, h, d, 0, 0, 0)

ANIMALS = {"A": [ox_a, horse_a, deer_a, pig_a, dog_a, bird_a], "B": [ox_b, horse_b, deer_b, pig_b, dog_b, bird_b]}

# matrices (filled in by the caller so this module needs no bpy)
_T = _RZ = None
def bind(T, RZ):
    global _T, _RZ
    _T, _RZ = T, RZ
