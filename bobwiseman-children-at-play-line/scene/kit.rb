# Children at Play, night-sky line look: shared palette, the farm set and the people, all in metres.
# The scene (cap.rb) and the line-up (lineup.rb) both draw from here, so the cast and set are one drawing.
# Coordinates: metres, x to the right, y up is negative, ground at y = 0. A figure's feet sit at (0, 0).
require "json"

module Kit
  NIGHT, DISC, PAPER, GOLD, HOT, COOL = "#0A0E24", "#0D1636", "#F2E8D5", "#FFC531", "#FF5A1F", "#7FD6FF"
  DIM = "#F2E8D566"
  FAINT = "#F2E8D533"
  LOFT = "#04061A"
  EARTH = "#06081A"
  HAND, MONO = "BradleyHandITCTT-Bold", "AndaleMono"
  W, H = 1920, 1080
  CX, CY = W / 2.0, H / 2.0
  TAU = 2 * Math::PI
  FONTS = %w[bradley.ttf andale-mono.ttf].map { |n| "../tools/graphics/fonts/#{n}" }

  # ---------------------------------------------------------------- the farm (metres)
  KITCHEN = { x0: -3.0, x1: -1.5, y0: -2.6, y1: -1.0 }      # the lit kitchen window
  HAYDOOR = { x0: 19.2, x1: 20.8, y0: -5.25, y1: -3.0 }     # the hay door, sill 3 m up, tall enough to stand in
  HAY_C = [20.0, -3.9]
  BARN_DOOR = [22.85, -1.15]                                  # the closed barn door she stares at
  YOU_HEAD = [19.8, -4.565]                                   # 1.565 m above the loft floor: standing head height
  ME_HEAD = [20.18, -4.685]                                   # 1.685 m
  HEAD_R = { you: 0.1, me: 0.11 }

  module_function

  def circ(cx, cy, r)
    k = 0.5523 * r
    [["M", cx + r, cy], ["C", cx + r, cy + k, cx + k, cy + r, cx, cy + r], ["C", cx - k, cy + r, cx - r, cy + k, cx - r, cy],
     ["C", cx - r, cy - k, cx - k, cy - r, cx, cy - r], ["C", cx + k, cy - r, cx + r, cy - k, cx + r, cy], ["Z"]]
  end

  def rect(x0, y0, x1, y1) = [["M", x0, y0], ["L", x1, y0], ["L", x1, y1], ["L", x0, y1], ["Z"]]
  def seg(x0, y0, x1, y1) = [["M", x0, y0], ["L", x1, y1]]
  def poly(pts, close: false) = pts.each_with_index.map { |(x, y), i| [i.zero? ? "M" : "L", x, y] } + (close ? [["Z"]] : [])
  def shift(cmds, dx, dy, sx = 1.0)
    cmds.map do |c|
      next c if c[0] == "Z"
      [c[0], *c[1..].each_slice(2).flat_map { |x, y| [(x * sx + dx).round(4), (y + dy).round(4)] }]
    end
  end

  # ---------------------------------------------------------------- people: one stroke path per pose, facing right
  # The mother: about 1.65 m, hair in a bun, dress and apron, no face.
  def mother(pose)
    c = []
    c += circ(0, -1.53, 0.105)
    c += circ(0, -1.665, 0.042)
    c += seg(0, -1.425, 0, -1.38)
    c += [["M", -0.19, -1.33], ["Q", 0, -1.38, 0.19, -1.33], ["L", 0.15, -1.0], ["L", 0.31, -0.38], ["Q", 0, -0.34, -0.31, -0.38], ["L", -0.15, -1.0], ["Z"]]
    c += seg(-0.15, -1.0, 0.15, -1.0)
    c += poly([[-0.12, -0.98], [-0.17, -0.52], [0.17, -0.52], [0.12, -0.98]])
    arms = {
      stand: [[[-0.19, -1.31], [-0.25, -1.0], [-0.25, -0.72]], [[0.19, -1.31], [0.25, -1.0], [0.25, -0.72]]],
      look: [[[-0.19, -1.31], [-0.33, -1.12], [-0.15, -1.0]], [[0.19, -1.31], [0.38, -1.42], [0.1, -1.575]]],
      sink: [[[-0.19, -1.31], [-0.25, -1.06], [-0.08, -0.97]], [[0.19, -1.31], [0.25, -1.06], [0.08, -0.97]]],
      walk_a: [[[-0.19, -1.31], [-0.31, -1.03], [-0.37, -0.8]], [[0.19, -1.31], [0.23, -1.0], [0.18, -0.76]]],
      walk_b: [[[-0.19, -1.31], [-0.23, -1.0], [-0.18, -0.76]], [[0.19, -1.31], [0.31, -1.03], [0.37, -0.8]]],
      pass: [[[-0.19, -1.31], [-0.26, -1.0], [-0.27, -0.73]], [[0.19, -1.31], [0.26, -1.0], [0.27, -0.73]]]
    }
    arms.fetch(pose == :hear ? :stand : pose).each { |a| c += poly(a) }
    legs = {
      walk_a: [[-0.08, -0.37, -0.24, 0.0], [0.08, -0.37, 0.2, 0.0]],
      walk_b: [[-0.08, -0.37, -0.12, 0.0], [0.08, -0.37, 0.22, -0.13]],
      pass: [[-0.07, -0.37, -0.07, 0.0], [0.07, -0.37, 0.09, -0.06]]
    }.fetch(pose, [[-0.08, -0.37, -0.1, 0.0], [0.08, -0.37, 0.1, 0.0]])
    legs.each do |x0, y0, x1, y1|
      c += seg(x0, y0, x1, y1)
      c += seg(x1 - 0.02, y1, x1 + 0.09, y1)
    end
    c
  end

  # "you": a young adult woman, 1.68 m, long loose hair, summer dress. Her head is a gold light.
  def you_body
    c = []
    c += [["M", -0.095, -1.62], ["Q", -0.17, -1.48, -0.14, -1.3]] + [["M", 0.095, -1.62], ["Q", 0.17, -1.48, 0.14, -1.3]]
    c += seg(0, -1.465, 0, -1.4)
    c += [["M", -0.16, -1.36], ["Q", 0, -1.4, 0.16, -1.36], ["L", 0.12, -1.02], ["L", 0.26, -0.52], ["Q", 0, -0.48, -0.26, -0.52], ["L", -0.12, -1.02], ["Z"]]
    c += poly([[-0.16, -1.34], [-0.22, -1.04], [-0.22, -0.76]]) + poly([[0.16, -1.34], [0.22, -1.04], [0.22, -0.76]])
    [[-0.07, -0.5, -0.08], [0.07, -0.5, 0.08]].each { |x0, y0, x1| c += seg(x0, y0, x1, 0) + seg(x1 - 0.02, 0, x1 + 0.08, 0) }
    c
  end

  # "me": a young adult man, 1.80 m, shirt and trousers. His head is a gold light.
  def me_body
    c = []
    c += seg(0, -1.575, 0, -1.52)
    c += [["M", -0.24, -1.48], ["Q", 0, -1.53, 0.24, -1.48], ["L", 0.2, -0.92], ["L", -0.2, -0.92], ["Z"]]
    c += poly([[-0.06, -1.51], [0, -1.43], [0.06, -1.51]])
    c += seg(-0.19, -0.92, -0.18, 0) + poly([[-0.02, 0], [0, -0.78], [0.02, 0]]) + seg(0.19, -0.92, 0.18, 0)
    c += seg(-0.2, 0, -0.02, 0) + seg(0.02, 0, 0.21, 0)
    c += poly([[-0.24, -1.46], [-0.3, -1.15], [-0.3, -0.86]]) + poly([[0.24, -1.46], [0.3, -1.15], [0.3, -0.86]])
    c
  end

  # what shows of them in the hay door: two head-and-shoulders outlines, faint, under the two lights, side by side
  def bust(x, y, half, drop)
    [["M", x - half, y + drop], ["L", x - half, y + 0.3], ["Q", x - half, y + 0.17, x - 0.07, y + 0.16], ["L", x + 0.07, y + 0.16],
     ["Q", x + half, y + 0.17, x + half, y + 0.3], ["L", x + half, y + drop]]
  end

  def loft_shoulders
    yx, yy = YOU_HEAD
    mx, my = ME_HEAD
    bust(yx, yy, 0.17, 0.62) + [["M", yx - 0.095, yy - 0.05], ["Q", yx - 0.16, yy + 0.09, yx - 0.13, yy + 0.25]] +
      [["M", yx + 0.095, yy - 0.05], ["Q", yx + 0.16, yy + 0.09, yx + 0.13, yy + 0.25]] + bust(mx, my, 0.23, 0.74)
  end

  # ---------------------------------------------------------------- the set, as layers of [commands, style]
  # style: :line (paper), :detail (thinner paper), :dim, :fill_line (night fill + paper line)
  def house
    wall = poly([[-5.5, 0], [-5.5, -4.2], [-1.25, -7.4], [3.0, -4.2], [3.0, 0]], close: true)
    roof = poly([[-6.0, -3.85], [-1.25, -7.6], [3.5, -3.85]])
    chimney = poly([[-3.6, -5.9], [-3.6, -7.0], [-3.0, -7.0], [-3.0, -6.35]])
    upstairs = rect(-1.75, -5.7, -0.75, -4.7) + seg(-1.25, -5.7, -1.25, -4.7)
    door = rect(1.2, -2.1, 2.2, 0)
    porch = poly([[0.6, -2.75], [3.9, -2.75], [3.9, -2.55], [0.6, -2.55]], close: true) + seg(0.8, -2.55, 0.8, -0.35) + seg(3.7, -2.55, 3.7, -0.35) +
            seg(0.4, -0.35, 3.9, -0.35) + poly([[3.9, -0.35], [3.9, -0.2], [4.2, -0.2], [4.2, 0]])
    bench = seg(3.0, -0.8, 3.6, -0.8) + seg(3.05, -0.8, 3.05, -0.35) + seg(3.55, -0.8, 3.55, -0.35) + seg(3.0, -0.8, 3.0, -1.15)
    { wall: wall, roof: roof, chimney: chimney, upstairs: upstairs, door: door, porch: porch, bench: bench,
      siding: (1..9).flat_map { |i| y = -0.42 * i; xs = [-5.5, 3.0]; seg(xs[0], y, xs[1], y) } }
  end

  def washing_line
    posts = seg(5.0, 0, 5.0, -2.15) + seg(4.7, -2.05, 5.3, -2.05) + seg(8.4, 0, 8.4, -2.15) + seg(8.1, -2.05, 8.7, -2.05)
    line = [["M", 5.0, -2.05], ["Q", 6.7, -1.82, 8.4, -2.05]]
    sheets = [["M", 5.45, -1.98], ["L", 5.4, -0.85], ["Q", 5.9, -0.8, 6.45, -0.88], ["L", 6.5, -1.92]] +
             [["M", 6.75, -1.9], ["L", 6.78, -1.05], ["Q", 7.3, -1.0, 7.85, -1.07], ["L", 7.9, -1.96]]
    pins = [[5.5, -1.97], [6.4, -1.92], [6.8, -1.9], [7.85, -1.95]].flat_map { |x, y| seg(x, y - 0.08, x, y + 0.05) }
    { posts: posts, line: line, sheets: sheets, pins: pins }
  end

  def tree
    trunk = [["M", 11.4, 0], ["L", 11.5, -3.3], ["M", 11.8, 0], ["L", 11.7, -3.3]]
    branch = [["M", 11.5, -3.35], ["Q", 10.6, -3.5, 9.3, -3.55]]
    crown = []
    rng = Random.new(7)
    pts = (0..26).map do |i|
      a = i * TAU / 26
      r = 2.35 * (1 + 0.1 * Math.sin(5 * a) + rng.rand * 0.08)
      [11.3 + r * Math.cos(a) * 1.15, -5.3 + r * Math.sin(a) * 0.8]
    end
    pts.each_cons(2).each_with_index do |(a, b), i|
      mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
      len = Math.hypot(mx - 11.3, my + 5.3)
      crown += i.zero? ? [["M", *a]] : []
      crown << ["Q", (mx + (mx - 11.3) / len * 0.35).round(3), (my + (my + 5.3) / len * 0.35).round(3), *b]
    end
    { trunk: trunk, branch: branch, crown: crown }
  end

  # the swing hangs from the branch at (9.85, -3.52); drawn about that point so it can sway
  SWING_PIVOT = [9.85, -3.52]
  def swing = seg(-0.3, 0, -0.3, 2.95) + seg(0.3, 0, 0.3, 2.95) + rect(-0.42, 2.95, 0.42, 3.03)

  def fence
    posts = (0..4).flat_map { |i| x = 12.6 + i * 0.55; seg(x, 0, x, -1.3) }
    rails = seg(12.5, -1.1, 14.9, -1.1) + seg(12.5, -0.6, 14.9, -0.6)
    { posts: posts, rails: rails }
  end

  def field_grass(seed = 3)
    rng = Random.new(seed)
    c = []
    x = 11.9
    while x < 36
      h = 0.55 + rng.rand * 0.55
      lean = (rng.rand - 0.5) * 0.25
      c += [["M", x.round(3), 0], ["Q", (x + lean * 0.3).round(3), (-h * 0.6).round(3), (x + lean).round(3), (-h).round(3)]]
      x += 0.16 + rng.rand * 0.14
    end
    c
  end

  def barn
    wall = poly([[15.0, 0], [15.0, -5.0], [16.2, -7.4], [20.0, -8.9], [23.8, -7.4], [25.0, -5.0], [25.0, 0]], close: true)
    roof = poly([[14.7, -4.85], [16.1, -7.5], [20.0, -9.05], [23.9, -7.5], [25.3, -4.85]])
    boards = (1..19).flat_map { |i| x = 15.0 + i * 0.5; next [] if x > HAYDOOR[:x0] - 0.05 && x < HAYDOOR[:x1] + 0.05; seg(x, -0.05, x, -4.95) }
    hay = rect(HAYDOOR[:x0], HAYDOOR[:y0], HAYDOOR[:x1], HAYDOOR[:y1])
    leaves = rect(18.42, -5.23, 19.14, -3.02) + rect(20.86, -5.23, 21.58, -3.02) + seg(18.42, -3.02, 19.14, -5.23) + seg(20.86, -5.23, 21.58, -3.02)
    beam = rect(19.85, -5.45, 20.15, -5.15) + circ(20.0, -5.0, 0.09) + seg(20.0, -4.91, 20.0, -4.82)
    bales = rect(19.24, -3.36, 19.62, -3.02) + rect(20.4, -3.3, 20.76, -3.02) + seg(19.26, -3.19, 19.6, -3.19)
    door = rect(22.4, -2.15, 23.3, 0) + seg(22.4, -2.15, 23.3, 0) + circ(23.15, -1.05, 0.04)
    louvre = poly([[19.5, -6.6], [20.0, -7.0], [20.5, -6.6]], close: true)
    { wall: wall, roof: roof, boards: boards, hay: hay, leaves: leaves, beam: beam, bales: bales, door: door, louvre: louvre }
  end

  # the ladder up to the hay door, a straw hat on it, two pairs of shoes at its foot
  def ladder = seg(19.78, 0, 19.78, -3.04) + seg(20.22, 0, 20.22, -3.04) + (1..9).flat_map { |i| y = -0.3 * i; seg(19.78, y, 20.22, y) }
  def hat = shift([["M", -0.19, 0], ["L", 0.19, 0], ["M", -0.1, 0], ["Q", -0.1, -0.13, 0, -0.135], ["Q", 0.1, -0.13, 0.1, 0]], 20.33, -1.72)

  def boot(x) = shift(poly([[0, 0], [0.29, 0], [0.29, -0.05], [0.2, -0.08], [0.11, -0.09], [0.1, -0.2], [0, -0.2]], close: true), x, 0)
  def flat(x) = shift([["M", 0, 0], ["L", 0.24, 0], ["Q", 0.25, -0.045, 0.17, -0.05], ["Q", 0.08, -0.07, 0, -0.055], ["Z"]], x, 0)
  def shoes = boot(20.4) + boot(20.62) + flat(21.0) + flat(21.2)

  def ground = seg(-40, 0, 70, 0)

  def grass_ticks(seed = 5)
    rng = Random.new(seed)
    (0..160).flat_map do |i|
      x = -14 + i * 0.29 + rng.rand * 0.2
      next [] if x > 11.8 && x < 36
      h = 0.08 + rng.rand * 0.12
      seg(x.round(3), 0, (x + 0.04).round(3), (-h).round(3))
    end
  end
end
