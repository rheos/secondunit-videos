# Whole-song 9:16 film in the painted-swirl look, In Her Dream. The scene clock is song time.
# Usage: ruby ihd_film.rb FROM TO OUT.json  writes only the nodes alive in [FROM, TO]; render with mgraphics --from/--to.
# Word times are read from gitignored work/ihd-in/align.json by line and word index, so no lyric is quoted here.
# The reunion, 125.72 to about 163 s, keeps the maths of scene/ihd_9x16.rb, the approved test.
require "json"

module Film
  WORK = File.expand_path("../work", __dir__)
  ROOT = File.join(WORK, "ihd")
  W, H = 1080, 1920
  CX = W / 2.0
  BASE = 1700
  END_T = 300.04
  TEST0 = 125.72 # paint phase zero, so the reunion's paint matches the test
  GRID = 24.0
  STEP = 1 / 8.0
  SPACING = 32
  TAU = 2 * Math::PI
  BEAT = 60.0 / 76

  NIGHT = "#0A1033"
  PAINT = %w[#121C52 #1B2F7E #2653A6 #2E8C9A #8E5AA8 #D0587A #E9743A #F6B73C #FFE9B0].freeze
  WIDTH = [6, 7, 7, 8, 8, 9, 10, 10, 11].freeze
  LIGHTS = %w[#FF8FA3 #FF9A4D #7FE3D0 #FFF0C9 #C6A7FF #FF6F61 #9AD7FF #FFD27A].freeze
  GOLD = "#FFC531"
  STREET = "#070A1E"
  EDGE = "#222C5E"
  CREAM = "#FFE9B0"

  class Builder
    def initialize(a, b)
      @a, @b = a, b
      @rng = Random.new(1989)
      @all = JSON.parse(File.read(File.join(WORK, "ihd-in", "align.json")))["words"]
      @times = @all.map { |w| w["s"] }
      beats = JSON.parse(File.read(File.join(ROOT, "audio", "map", "beatmap.json")))["beats"]
      @bars = beats.select { |x| x["pos"].zero? }.map { |x| x["t"] + 110 - TEST0 }
      @nodes, @events = [], []
      make_houses
      make_lights
      make_dashes
      make_kids
      make_final_lights
    end

    # ------------------------------------------------------------------ small tools
    def f(t) = (t * GRID + 1e-6).floor / GRID
    def v(song) = song - TEST0
    def smooth(u) = (u = u.clamp(0.0, 1.0); u * u * (3 - 2 * u))
    def bump(t, a, b, c, d, h) = h * (smooth((t - a) / (b - a)) - smooth((t - c) / (d - c)))
    def live?(s, e) = e > @a - 0.05 && s < @b + 0.05
    def w(line, i) = @all.select { |x| x["line"] == line }.fetch(i)["s"]
    def event(kind, t, **kw) = (@events << { kind: kind, t: t.round(4), **kw })
    def group(children, **kw) = { type: "group", children: children }.merge(kw)
    def path(cmds, **kw) = { type: "path", commands: cmds }.merge(kw)
    def emit(n) = (@nodes << n if live?(n[:start] || 0, n[:end] || END_T))

    def sample(s, e, step = 1 / GRID)
      s, e = [s, @a - 1].max, [e, @b + 1].min
      return [[s.round(4), yield(s)]] if e <= s
      (0..((e - s) / step).ceil).map { |j| t = [s + j * step, e].min; [t.round(4), yield(t)] }.uniq(&:first)
    end

    def key(t, keys)
      return keys.first[1..] if t <= keys.first[0]
      return keys.last[1..] if t >= keys.last[0]
      i = keys.index { |k| k[0] > t }
      a, b = keys[i - 1], keys[i]
      u = smooth((t - a[0]) / (b[0] - a[0]))
      (1...a.size).map { |n| a[n] + (b[n] - a[n]) * u }
    end

    def ellipse(cx, cy, rx, ry, n = 36) = (0...n).map { |i| a = i * TAU / n; [i.zero? ? "M" : "L", (cx + rx * Math.cos(a)).round(1), (cy + ry * Math.sin(a)).round(1)] } + [["Z"]]

    def dab(s, e, color, r, pos, fade: nil, edge: NIGHT, halo: true, extra: [])
      return unless live?(s, e)
      xs = sample(s, e, 1 / 12.0) { |t| pos.call(t)[0].round(1) }
      ys = sample(s, e, 1 / 12.0) { |t| pos.call(t)[1].round(1) }
      fade ||= [[s, 0], [s + 0.4, 1], [e - 0.4, 1], [e, 0]]
      kids = []
      kids << { type: "circle", radius: r * 2.3, fill: "#{color}55" } if halo
      kids << { type: "circle", radius: r, fill: color, stroke: edge, strokeWidth: [r / 5.0, 3].max }
      @nodes << group(kids + extra, start: f(s), end: e, tracks: { x: xs, y: ys, opacity: fade })
    end

    def ring(t, pos, color, big: 3.6, life: 1.0, r: 20)
      return unless live?(t, t + life)
      @nodes << { type: "circle", radius: r, fill: nil, stroke: color, strokeWidth: 3, start: f(t), end: t + life, glow: 6, x: 0, y: 0,
                  tracks: { x: sample(t, t + life, 1 / 12.0) { |q| pos.call(q)[0].round(1) }, y: sample(t, t + life, 1 / 12.0) { |q| pos.call(q)[1].round(1) },
                            scaleX: [[t, 0.6], [t + life, big, "outCubic"]], scaleY: [[t, 0.6], [t + life, big, "outCubic"]], opacity: [[t, 0.9], [t + life, 0]] } }
    end

    # ------------------------------------------------------------------ the story as numbers
    STAMPS = [187.64, 188.9, 189.69, 190.48].freeze

    def warmth(t)
      test = 0.05 + 0.22 * smooth((t - 128.1) / 9) + 0.34 * smooth((t - 141.33) / 9) + 0.5 * smooth((t - 150.2) / 7) - 1.0 * smooth((t - 159.2) / 3.0)
      test += bump(t, 22, 30, 42, 46, 0.14) + bump(t, 46, 51, 54, 58, 0.16) + bump(t, 55.4, 61, 67, 74, 0.4)
      test += bump(t, 78, 84, 88, 92, 0.1) + bump(t, 93, 97, 104, 108, 0.24) + bump(t, 118, 121, 123, 125.6, 0.12)
      test += bump(t, 174.2, 178, 186, 192, 0.14) + bump(t, 187, 188.5, 191, 195, 0.14) + bump(t, 208, 212, 216, 219, 0.26)
      test += bump(t, 226.5, 229, 233, 237, 0.08)
      test += 0.28 * smooth((t - 239) / 6) + 0.3 * smooth((t - 250) / 6) + 0.72 * smooth((t - 258) / 9.1) - 1.25 * smooth((t - 268.5) / 12) - 0.05 * smooth((t - 282) / 12)
      [test, 0].max
    end

    HER = [[0, 540, 1500], [20, 540, 1250], [25, 540, 860], [45, 540, 860], [50, 540, 640], [56, 540, 800], [66, 540, 800], [76, 540, 480], [92, 540, 480],
           [96, 420, 1160], [107, 420, 1160], [111, 540, 1250], [120, 540, 1300], [125.72, 540, 1440]].freeze
    AFTER = [[163, 840, 1790], [172, 620, 1790], [207, 620, 1790], [209.2, 540, 800], [217, 540, 740], [226, 540, 740], [229, 540, 620], [237, 540, 620],
             [243, 540, 840], [270, 540, 840], [282, 540, 1040]].freeze

    def her(t)
      if t < 125.72 then key(t, HER)
      elsif t < 163
        [CX + 300 * smooth((t - 160.4) / 2.5), 1440 - 600 * smooth((t - 129.5) / 9) + 950 * smooth((t - 158.9) / 2.6)]
      else
        x, y = key(t, AFTER)
        y -= STAMPS.sum { |s| 70 * Math.sin(Math::PI * ((t - s + 0.28) / 0.56).clamp(0, 1)) }
        [x, y]
      end
    end

    def spread(t) = 1 + 0.32 * smooth((t - 150.2) / 6.7)

    # ------------------------------------------------------------------ houses
    def make_houses
      @houses = []
      hx = -140
      n = 0
      while hx < W + 1700
        wide = [190, 240, 180, 260, 210][n % 5]
        @houses << [hx, wide, 1360 + [40, 0, 62, 18, 50][n % 5]]
        hx += wide
        n += 1
      end
      win = @houses.flat_map { |x0, wide, top| [0.3, 0.7].flat_map { |u| [58, 146, 234].map { |dy| [x0 + wide * u, top + dy] } } }
      @near = win.select { |x, _| x > 60 && x < W - 60 }
      @far = win.select { |x, _| x > 1500 + 60 && x < 1500 + W - 60 }
    end

    # rise and scroll are offsets; the group sits on the road line so a height change grows from the ground
    def street_group(s, e, children, rise:, scroll: nil, tall: nil)
      tracks = { y: rise.map { |t, q, *m| [t, BASE + q, *m] } }
      tracks[:x] = scroll.map { |t, q, *m| [t, CX + q, *m] } if scroll
      tracks[:scaleY] = tall if tall
      emit(group(children, start: f(s), end: e, x: CX, y: BASE, anchor: [CX, BASE], tracks: tracks))
    end

    def roofs_and_road
      roofs = [["M", -140, BASE]]
      walls = []
      @houses.each do |x0, wide, top|
        roofs += [["L", x0, top], ["L", x0 + wide / 2, top - 96], ["L", x0 + wide, top]]
        walls += [["M", x0, top], ["L", x0, BASE]]
      end
      last = @houses.last
      roofs += [["L", last[0] + last[1], BASE], ["Z"]]
      road = [["M", -140, BASE - 6], ["L", W + 1900, BASE - 6], ["L", W + 1900, H + 240], ["L", -140, H + 240], ["Z"]]
      [path(roofs, fill: STREET, stroke: nil), path(walls, fill: nil, stroke: EDGE, strokeWidth: 3), path(road, fill: "#0D1236", stroke: nil)]
    end

    def window(x, y, color, on, off = nil)
      fade = [[on, 0], [on + 0.35, 1]]
      fade += [[off, 1], [off + 0.3, 0]] if off
      { type: "rect", x: x - 17, y: y - 23, width: 34, height: 46, fill: color, stroke: EDGE, strokeWidth: 3, tracks: { opacity: fade } }
    end

    # ------------------------------------------------------------------ the people
    def make_lights
      chorus = @times.select { |s| (137.5..145.0).cover?(s) || (150.0..157.2).cover?(s) }
      syllables = [141.7, 142.14, 153.9, 154.4].freeze
      between = @bars.map { |t| t + TEST0 }.select { |s| s > 145.2 && s < 150 }
      arrivals = ([131.94] + chorus + syllables + between).sort
      homes = @near.each_with_index.sort_by { |_, i| (i * 7) % 29 }.map(&:first)
      slots = []
      [[140, 8], [245, 12], [355, 17], [470, 22]].each { |r, n| n.times { |i| slots << [r, i * TAU / n + r * 0.01] } }
      @lights = arrivals.each_with_index.map do |t, i|
        r, a = slots[i % slots.size]
        from = @rng.rand * TAU
        launch = t - (2.2 + @rng.rand)
        turn = (0.9 + @rng.rand * 0.6) * (i.even? ? 1 : -1)
        { arrive: t, launch: launch, r: r, a: a, from: from, turn: turn, color: LIGHTS[i % LIGHTS.size], win: homes[i % homes.size], settle: 158.9 + (i % 11) * 0.16 }
      end
      event(:first_friend, 131.94)
    end

    def light_pos(l, t)
      hx, hy = her(t)
      ang = l[:a] + 0.11 * (t - TEST0)
      sp = l[:final] ? 0.9 + 0.56 * smooth((t - 249) / 18) : spread(t)
      ringx = hx + l[:r] * sp * 0.78 * Math.cos(ang)
      ringy = hy + l[:r] * sp * 1.15 * Math.sin(ang)
      u = smooth((t - l[:launch]) / (l[:arrive] - l[:launch]))
      spin = l[:turn] * (1 - u) * 2.1
      x = ringx + 900 * (1 - u) * Math.cos(l[:from] + spin)
      y = ringy + 1500 * (1 - u) * Math.sin(l[:from] + spin)
      if l[:src]
        x, y = l[:src][0] + (ringx - l[:src][0]) * u, l[:src][1] + (ringy - l[:src][1]) * u
      end
      k = smooth((t - l[:settle]) / (l[:final] ? 9.0 : 1.5))
      target = l[:win]
      [x + (target[0] - x) * k, y + (target[1] - y) * k]
    end

    def weight(l, t)
      w0 = smooth((t - l[:launch]) / 1.2)
      l[:final] ? w0 * (1 - 0.6 * smooth((t - l[:settle]) / 9)) : w0 * (1 - 0.8 * smooth((t - l[:settle]) / 1.5)) * (1 - smooth((t - 170) / 4))
    end

    def make_final_lights
      r2 = Random.new(77)
      chorus = @times.select { |s| (239.0..243.6).cover?(s) || (249.0..255.3).cover?(s) || (261.0..267.2).cover?(s) }
      between = (0..3).map { |i| 245.0 + i * BEAT } + (0..4).map { |i| 256.6 + i * BEAT } + [264.8, 265.3, 265.8]
      arrivals = (chorus + between).sort
      slots = []
      [[150, 8], [255, 12], [365, 17], [480, 22]].each { |r, n| n.times { |i| slots << [r, i * TAU / n + r * 0.013] } }
      leave = @near.each_with_index.sort_by { |_, i| (i * 11) % 29 }.map(&:first)
      @final = arrivals.each_with_index.map do |t, i|
        r, a = slots[i % slots.size]
        src = i < 12 ? leave[i] : nil
        star = [80 + r2.rand * (W - 160), 120 + r2.rand * 1250]
        { arrive: t, launch: t - (2.2 + r2.rand), r: r, a: a, from: r2.rand * TAU, turn: (0.9 + r2.rand * 0.6) * (i.even? ? 1 : -1), color: i % 9 == 8 ? "#FFFFFF" : LIGHTS[i % LIGHTS.size],
          win: star, settle: 268.6 + (i % 13) * 0.3, final: true, src: src }
      end
    end

    TABLE_C = [540, 1320].freeze
    CLOUDS = [[190, 360], [540, 230], [880, 420], [250, 1130], [810, 1180], [170, 760], [920, 800], [540, 1430]].freeze

    def make_kids
      in_at = [w(0, 4), 25.3, w(0, 6), 26.8, w(0, 8), 28.2, w(0, 9), w(0, 11)]
      @kids = (0...8).map do |i|
        a = TAU * i / 8 + 0.3
        seat = [TABLE_C[0] + 400 * Math.cos(a), TABLE_C[1] + 180 * Math.sin(a)]
        arc = (20 + i * 20) * Math::PI / 180
        smile = [540 + 380 * Math.cos(arc), 760 + 380 * Math.sin(arc)]
        cloud = CLOUDS[i]
        out = [cloud[0] + (cloud[0] - 540) * 0.5, cloud[1] + (cloud[1] - 800) * 0.35]
        near = [540 + 175 * Math.cos(a), 800 + 240 * Math.sin(a)]
        t0 = in_at[i]
        keys = [[t0 - 1.0, seat[0], H + 90], [t0, *seat], [44.9, *seat], [49.5 + i * 0.1, *smile], [55.6, *smile], [58.24 + i * 0.25, *cloud], [67.96, *cloud],
                [69.48, *out], [69.7, *out], [71.4, *near], [72.6, *near], [75.4, near[0], H + 120]]
        { color: LIGHTS[i], s: t0 - 1.0, e: 75.5, keys: keys, phase: i * 0.9 }
      end
    end

    def kid_pos(k, t)
      x, y = key(t, k[:keys])
      laugh = 12 * bump(t, 25.5, 26.5, 44, 46, 1.0) * Math.sin(t * TAU / BEAT + k[:phase]).abs
      [x, y - laugh]
    end

    # ------------------------------------------------------------------ the paint
    def make_dashes
      @dashes = []
      (-140..W + 140).step(SPACING) do |x|
        (-140..H + 140).step(SPACING) do |y|
          @dashes << [x + @rng.rand * 28 - 14, y + @rng.rand * 28 - 14, @rng.rand * TAU, 0.75 + @rng.rand * 0.5, @rng.rand * 0.4 - 0.2]
        end
      end
    end

    def active_at(t)
      out = []
      (@lights + @final).each do |l|
        next if t < l[:launch]
        q = weight(l, t)
        out << [light_pos(l, t), q, 1.5, 0.26, 72.0, 7_000.0] if q > 0.02
      end
      @kids.each do |k|
        next if t < k[:s] || t > k[:e]
        cloud = bump(t, 58.2, 60.5, 68, 70.5, 1.0)
        out << [kid_pos(k, t), 0.5 + 0.5 * cloud, 1.0 + 1.2 * cloud, 0.14 + 0.46 * cloud, 72.0 + 70 * cloud, 7_000.0 + 15_000 * cloud]
      end
      if t.between?(107.3, 116.4)
        out << [[540, 620], 1.0, 0.0, 0.34, 72.0, 60_000.0]
      end
      out
    end

    def paint_window(t, stop)
      hx, hy = her(t)
      p = t - TEST0
      warm = warmth(t)
      active = active_at(t)
      smile = bump(t, 50.3, 51.2, 54, 56, 1.0)
      smile_end = -0.2 + 3.6 * smooth((t - 50.3) / 1.3)
      buckets = Array.new(PAINT.size) { [] }
      @dashes.each do |bx, by, ph, len, tone|
        x = bx + 9 * Math.cos(ph + p * 0.9)
        y = by + 9 * Math.sin(ph + p * 0.7)
        a0 = 0.7 * Math.sin(x / 310.0 + y / 430.0 + p * 0.11) + 1.0 * Math.sin(y / 205.0 - x / 540.0 - p * 0.07)
        ux, uy = Math.cos(a0), Math.sin(a0)
        dx, dy = x - hx, y - hy
        d = Math.sqrt(dx * dx + dy * dy) + 1
        swirl = 2.6 * Math.exp(-d / (260 + 240 * warm))
        ux += -dy / d * swirl
        uy += dx / d * swirl
        heat = 0.72 * Math.exp(-(dx * dx + 0.5 * dy * dy) / (2 * (80 + 210 * warm)**2))
        active.each do |(lx, ly), q, sw, ht, rad, spread2|
          ex, ey = x - lx, y - ly
          e2 = ex * ex + ey * ey
          next if e2 > 90_000 && spread2 < 10_000
          e = Math.sqrt(e2) + 1
          s = sw * q * Math.exp(-e / rad)
          ux += -ey / e * s
          uy += ex / e * s
          heat += ht * q * Math.exp(-e2 / spread2)
        end
        if smile > 0 && y > 700
          sx, sy = x - 540, y - 760
          sr = Math.sqrt(sx * sx + sy * sy) + 1
          sa = Math.atan2(sy, sx)
          if sa.between?(0.05, smile_end.clamp(0.05, 3.09))
            band = Math.exp(-((sr - 380)**2) / 7_200.0)
            ux += -sy / sr * 4 * band * smile
            uy += sx / sr * 4 * band * smile
            heat += 0.82 * band * smile
          end
        end
        ang = Math.atan2(uy, ux)
        level = (warm * 0.36 + heat + tone + 0.06 * Math.sin(x / 90.0 + p)).clamp(0.0, 0.93)
        i = (level * PAINT.size).floor
        half = len * (13 + 9 * [heat, 1].min)
        c, s = Math.cos(ang), Math.sin(ang)
        buckets[i] << ["M", (x - c * half).round, (y - s * half).round] << ["L", (x + c * half).round, (y + s * half).round]
      end
      buckets.each_with_index do |cmds, i|
        next if cmds.empty?
        @nodes << { type: "path", commands: cmds, fill: nil, stroke: PAINT[i], strokeWidth: WIDTH[i], start: f(t), end: f(stop) }
      end
    end

    def paint
      if ENV["STILLS"] # sparse paint, only under the frames being looked at
        ENV["STILLS"].split(",").map(&:to_f).each { |q| t = (q / STEP).floor * STEP; paint_window(t, t + STEP) }
        return
      end
      return if ENV["NOPAINT"]
      t = (@a / STEP).floor * STEP
      while t < [@b, END_T].min
        paint_window(t, t + STEP)
        t += STEP
      end
    end

    # ------------------------------------------------------------------ table, cradles
    def table
      s, e = 24.0, 46.4
      return unless live?(s, e)
      rise = [[s, 800], [27.2, 0, "outCubic"], [44.9, 0], [e, 800, "smooth"]]
      kids = [path(ellipse(*TABLE_C, 330, 120), fill: STREET, stroke: EDGE, strokeWidth: 3)]
      [-260, -130, 0, 130, 260].each_with_index do |dx, i|
        at = [w(1, 3), w(1, 4)].min + i * 0.22
        y = TABLE_C[1] + (i.even? ? 34 : -34)
        kids << { type: "circle", x: TABLE_C[0] + dx, y: y, radius: 36, fill: "#FFF0C9", stroke: EDGE, strokeWidth: 3, tracks: { opacity: [[at, 0], [at + 0.25, 1]] } }
        kids << { type: "circle", x: TABLE_C[0] + dx, y: y, radius: 21, fill: %w[#E9743A #D0587A #F6B73C #7FE3D0 #FF9A4D][i], tracks: { opacity: [[at, 0], [at + 0.25, 1]] } }
      end
      @nodes << group(kids, start: f(s), end: e, tracks: { y: rise })
    end

    def cradles
      s = w(1, 5)
      e = 46.2
      return unless live?(s, e)
      [[220, 560, 0.0], [860, 470, 1.4], [560, 330, 2.6]].each_with_index do |(cx, cy, ph), i|
        at = s + i * 0.45
        arc = (0..18).map { |j| a = j * Math::PI / 18; [j.zero? ? "M" : "L", (cx + 92 * Math.cos(a)).round(1), (cy + 92 * Math.sin(a)).round(1)] } + [["Z"]]
        rock = sample(at, e, 1 / 12.0) { |t| (0.34 * Math.sin((t + ph) * TAU / (BEAT * 2))).round(3) }
        @nodes << group([path(arc, fill: "#8E5AA8", stroke: CREAM, strokeWidth: 5), { type: "circle", x: cx, y: cy + 8, radius: 26, fill: "#FFF0C9", stroke: NIGHT, strokeWidth: 4 }],
                        start: f(at), end: e, x: cx, y: cy, anchor: [cx, cy], tracks: { rotation: rock, opacity: [[at, 0], [at + 0.4, 1], [e - 1.0, 1], [e, 0]] })
        event(:arrive, at)
      end
    end

    # ------------------------------------------------------------------ diner
    def spoon_path
      bowl = ellipse(0, -200, 88, 124)
      stem = [["M", -18, -80], ["L", -14, 340], ["L", 14, 340], ["L", 18, -80], ["Z"]]
      [bowl, stem]
    end

    def diner
      s, e = 92.2, 108.4
      return unless live?(s, e)
      rise = [[s, 800], [94.8, 0, "outCubic"], [106.9, 0], [e, 800, "smooth"]]
      band = [["M", -140, 1270], ["L", W + 140, 1270], ["L", W + 140, 1340], ["L", -140, 1340], ["Z"]]
      kids = [path(band, fill: "#D0587A", stroke: CREAM, strokeWidth: 4)]
      kids << path([["M", -140, 1340], ["L", W + 140, 1340], ["L", W + 140, H + 300], ["L", -140, H + 300], ["Z"]], fill: STREET, stroke: nil)
      [200, 420, 640, 860].each do |x|
        kids << path(ellipse(x, 1486, 64, 22), fill: "#E9743A", stroke: CREAM, strokeWidth: 3)
        kids << path([["M", x - 7, 1500], ["L", x - 7, 1740], ["L", x + 7, 1740], ["L", x + 7, 1500], ["Z"]], fill: EDGE, stroke: nil)
      end
      [[w(7, 10), 220, "#F6B73C"], [w(7, 11), 620, "#7FE3D0"], [w(7, 13), 800, "#FF8FA3"], [w(7, 13) + 0.25, 960, "#C6A7FF"]].each do |at, x, c|
        kids << group([path(ellipse(x, 1254, 62, 18), fill: "#FFF0C9", stroke: EDGE, strokeWidth: 3), { type: "circle", x: x, y: 1234, radius: 24, fill: c, stroke: NIGHT, strokeWidth: 3 }], tracks: { opacity: [[at, 0], [at + 0.2, 1]] })
        event(:arrive, at)
      end
      @nodes << group(kids, start: f(s), end: e, tracks: { y: rise })
      # the sign over the counter, a neon spoon
      on = w(7, 5)
      bowl, stem = spoon_path
      flicker = [[on, 0], [on + 0.1, 1], [on + 0.2, 0.3], [on + 0.36, 1], [w(7, 7), 1], [w(7, 7) + 0.1, 0.4], [w(7, 7) + 0.24, 1], [106.8, 1], [107.8, 0]]
      @nodes << group([path(bowl, fill: "#FF8FA322", stroke: "#FF8FA3", strokeWidth: 11, glow: 22), path(stem, fill: "#FF8FA322", stroke: "#FF8FA3", strokeWidth: 9, glow: 22)],
                      start: f(on), end: 108, x: 620, y: 560, rotation: 0.5, tracks: { opacity: flicker })
      event(:flicker, on)
      doctors
    end

    def doctors
      at = w(8, 2)
      swap = w(8, 5)
      [[0, 980], [1, 1130], [2, 1280]].each do |i, tx|
        pos = lambda do |t|
          x, = key(t, [[at + i * 0.3, W + 90, 0], [at + 1.5 + i * 0.3, tx - 280, 0], [swap + 0.2, tx - 280, 0], [swap + 1.2, 590 + i * 170, 0]])
          [x, 1138 - 10 * Math.sin((t + i) * TAU / BEAT).abs]
        end
        cross = [{ type: "rect", x: -14, y: -4, width: 28, height: 8, fill: "#E5484D", tracks: { opacity: [[swap - 0.2, 1], [swap, 0]] } },
                 { type: "rect", x: -4, y: -14, width: 8, height: 28, fill: "#E5484D", tracks: { opacity: [[swap - 0.2, 1], [swap, 0]] } },
                 group([path(ellipse(0, -62, 54, 10), fill: "#DDE3F2", stroke: EDGE, strokeWidth: 3), path(ellipse(0, -74, 30, 18), fill: "#F6B73C", stroke: NIGHT, strokeWidth: 3)], tracks: { opacity: [[swap - 0.1, 0], [swap + 0.1, 1]] })]
        dab(at + i * 0.3, 107.9, "#FFFFFF", 34, pos, extra: cross)
        event(:arrive, at + i * 0.3)
      end
    end

    # ------------------------------------------------------------------ the set
    def television
      s, e = 107.4, 117.6
      return unless live?(s, e)
      off = w(9, 5)
      fade = [[s, 0], [108.2, 1], [off + 0.7, 1], [e, 0]]
      drop = [[off + 0.7, 0], [e, 500, "smooth"]]
      body = path([["M", 200, 360], ["L", 880, 360], ["L", 880, 880], ["L", 200, 880], ["Z"]], fill: STREET, stroke: "#5A6AA8", strokeWidth: 7)
      aerial = path([["M", 540, 360], ["L", 400, 180], ["M", 540, 360], ["L", 690, 170]], fill: nil, stroke: "#5A6AA8", strokeWidth: 9)
      emit(group([body, aerial], start: f(s), end: e, tracks: { opacity: fade, y: drop }))
      r = Random.new(5)
      t = s
      while t < off
        cmds = (0...90).flat_map { x = 240 + r.rand * 590; y = 400 + r.rand * 440; [["M", x.round, y.round], ["L", (x + 14 + r.rand * 26).round, y.round]] }
        hue = %w[#DDE3F2 #9AD7FF #7E8FB8][(t * 8).round % 3]
        emit(path(cmds, fill: nil, stroke: hue, strokeWidth: 5, start: f(t), end: f(t + STEP), tracks: { opacity: [[s, 0], [108.2, 1]] }))
        t += STEP
      end
      # the picture collapses to a line, then a dot
      emit({ type: "rect", x: 240, y: 615, width: 600, height: 10, fill: "#FFFFFF", start: f(off), end: off + 0.7, glow: 10, tracks: { opacity: [[off, 1], [off + 0.34, 1], [off + 0.7, 0]] } })
      crack = [["M", 540, 400], ["L", 505, 500], ["L", 590, 590], ["L", 520, 690], ["L", 575, 840]]
      emit(path(crack, fill: nil, stroke: CREAM, strokeWidth: 6, start: f(off + 0.1), end: e, tracks: { opacity: fade, y: drop }))
      event(:tv_off, off)
    end

    def talk
      s, e = 117.4, 125.7
      friend = ->(t) { [key(t, [[s, -80, 0], [118.3, 290, 0], [124.3, 290, 0], [e, -100, 0]])[0], 1290] }
      dab(s, e, "#7FE3D0", 24, friend, fade: [[s, 1], [e, 1]])
      [w(9, 8), w(9, 9), w(10, 1), w(10, 4), w(10, 7)].each_with_index do |t, i|
        i.even? ? ring(t, ->(_) { [390, 1290] }, "#7FE3D0", big: 3.0, life: 0.9) : ring(t, ->(_) { [440, 1300] }, GOLD, big: 3.0, life: 0.9)
      end
    end

    # ------------------------------------------------------------------ street scenes
    def friends_street
      s, e = 76.6, 93.0
      return unless live?(s, e)
      rise = [[s, 760], [79.4, 0, "outCubic"], [91.5, 0], [e, 760, "smooth"]]
      homes = @near.each_with_index.sort_by { |_, i| (i * 5) % 29 }.map(&:first)
      kids = roofs_and_road
      t0, t1 = w(5, 4), w(5, 12)
      homes.each_with_index { |(x, y), i| kids << window(x, y, LIGHTS[i % LIGHTS.size], t0 + (t1 - t0) * i / homes.size) }
      street_group(s, e, kids, rise: rise)
      event(:whoosh, s)
      [[w(6, 4), 250, 1300], [w(6, 5), 610, 1290], [w(6, 6), 870, 1320]].each_with_index do |(t, x, y), i|
        hop = ->(q) { [x, y - 300 * Math.sin(Math::PI * ((q - t + 0.4) / 1.5).clamp(0, 1))] }
        dab(t - 0.4, t + 1.1, LIGHTS[i + 2], 24, hop, fade: [[t - 0.4, 0], [t - 0.2, 1], [t + 0.9, 1], [t + 1.1, 0]])
        event(:arrive, t)
      end
    end

    def return_street
      s, e = 158.3, 208.8
      return unless live?(s, e)
      kids = roofs_and_road
      @lights.each do |l|
        wx, wy = l[:win]
        kids << window(wx, wy, l[:color], l[:settle] + 1.15)
      end
      look_at = 169.0
      warm = w(15, 2)
      @far.each_with_index do |(x, y), i|
        on = warm + i * 0.13
        kids << { type: "rect", x: x - 17, y: y - 23, width: 34, height: 46, fill: "#10163A", stroke: EDGE, strokeWidth: 3 }
        blink = [[look_at, 1], [warm - 0.2 + i * 0.13, 1], [on, 0]]
        shift = [[look_at - 1, -3], [look_at + 3, 3], [look_at + 3.5, -3]]
        [-8, 8].each do |dx|
          kids << { type: "circle", x: x + dx, y: y - 4, radius: 7, fill: "#F2F5FF", tracks: { opacity: blink } }
          kids << { type: "circle", x: x + dx, y: y - 4, radius: 3.2, fill: "#10163A", tracks: { x: shift.map { |t, q| [t, x + dx + q] }, opacity: blink } }
        end
        kids << window(x, y, LIGHTS[i % LIGHTS.size], on)
      end
      scroll = [[163.3, 0], [172, -1500, "smooth"]]
      rise = [[s, 760], [160.5, 0, "outCubic"], [207, 0], [e, 900, "smooth"]]
      rent = [[w(17, 4) - 0.6, 1], [w(17, 5), 1.26, "smooth"], [w(17, 6) + 0.2, 1, "smooth"]]
      street_group(s, e, kids, rise: rise, scroll: scroll, tall: rent)
      event(:settle, 158.9)
      wallet
    end

    def wallet
      s = w(16, 4)
      land = w(16, 8)
      e = land + 0.5
      return unless live?(s, e)
      body = [{ type: "rect", x: -72, y: -46, width: 144, height: 92, fill: "#D08A4E", stroke: CREAM, strokeWidth: 5 }, { type: "rect", x: 14, y: -20, width: 58, height: 40, fill: "#F6B73C", stroke: NIGHT, strokeWidth: 4 }]
      xs = sample(s, e, 1 / 12.0) { |t| (key(t, [[s, 860], [land, her(land)[0]]])[0] + 80 * Math.sin((t - s) * 2.2) * (1 - smooth((t - s) / (land - s)))).round(1) }
      ys = sample(s, e, 1 / 12.0) { |t| key(t, [[s, -60], [s + 0.7, 180], [land - 0.9, 240], [land, her(land)[1] - 40]])[0].round(1) }
      emit(group(body, start: f(s), end: e, tracks: { x: xs, y: ys, rotation: [[s, -0.5], [land, 0.4]], opacity: [[land + 0.15, 1], [e, 0]] }))
      ring(land, ->(_) { her(land) }, GOLD, big: 4.5, life: 1.0)
      event(:arrive, land)
      STAMPS.each do |t|
        ring(t + 0.26, ->(_) { [her(t)[0], BASE + 60] }, CREAM, big: 7, life: 0.9)
        event(:stamp, t + 0.26)
      end
    end

    def rift
      torn = w(17, 11)
      seam = w(17, 14)
      s, e = torn, seam + 3.4
      return unless live?(s, e)
      pts = [[640, -40], [560, 110], [660, 250], [540, 410], [640, 570], [520, 730], [620, 880], [510, 1040]]
      poly = [["M", *pts[0]]] + pts.each_cons(2).map { |_, b| ["L", b[0] - 40, b[1]] } + pts.reverse.map { |p| ["L", p[0] + 34, p[1]] } + [["Z"]]
      close = [[s, 0], [s + 0.3, 1, "outCubic"], [seam - 0.7, 1], [seam + 1.1, 0, "smooth"]]
      emit(path(poly, fill: "#04061A", stroke: "#04061A", strokeWidth: 2, start: f(s), end: seam + 1.2, x: 590, y: 0, anchor: [590, 0], tracks: { scaleX: close }))
      event(:rip, s)
      a = seam - 0.7
      span = 1.8
      steps = 22
      (0...steps).each do |i|
        u = i.fdiv(steps)
        seg = (u * (pts.size - 1)).floor
        q = u * (pts.size - 1) - seg
        x = pts[seg][0] + (pts[seg + 1][0] - pts[seg][0]) * q
        y = pts[seg][1] + (pts[seg + 1][1] - pts[seg][1]) * q
        t = a + span * u
        side = i.even? ? 1 : -1
        emit(path([["M", (x - 34 * side).round, (y - 16).round], ["L", (x + 34 * side).round, (y + 16).round]], fill: nil, stroke: GOLD, strokeWidth: 8, glow: 5, start: f(t), end: e,
                   tracks: { opacity: [[t, 0], [t + 0.06, 1], [e - 0.9, 1], [e, 0]] }))
        event(:stitch, t) if i % 3 == 0
      end
    end

    # ------------------------------------------------------------------ team
    TEAM = [[170, 1240], [340, 1120], [540, 1240], [740, 1120], [910, 1240], [170, 1500], [420, 1480], [660, 1480], [910, 1500]].freeze

    def team
      s, e = 207.6, 227.0
      return unless live?(s, e)
      same = w(18, 10)
      @puppet = TEAM.each_with_index.map do |(x, y), i|
        ->(t) do
          jerk = bump(t, 218.2, 218.9, 224.2, 225, 1.0) * 26 * Math.sin((t * 4).floor * 1.7 + i)
          free = (t > 224 ? 18 * Math.sin(t * 2 + i) : 8 * Math.sin((t + i) * TAU / BEAT))
          [x, key(t, [[s + i * 0.08, H + 90], [s + 1.7 + i * 0.08, y], [225.6, y], [228.6, H + 120]])[0] + free + jerk]
        end
      end
      @puppet.each_with_index do |pos, i|
        gold = { type: "circle", radius: 30, fill: nil, stroke: GOLD, strokeWidth: 6, tracks: { opacity: [[same + i * 0.03, 0], [same + 0.15 + i * 0.03, 1], [218, 1], [218.6, 0]] } }
        dab(s, e, LIGHTS[i % LIGHTS.size], 22, pos, extra: [gold])
      end
      ball_times = (0..9).map { |i| w(18, 5) + i * BEAT }
      order = [8, 2, 5, 1, 6, 3, 7, 0, 4, 2, 8]
      ball = lambda do |t|
        i = ball_times.index { |x| x > t }
        i = i.nil? ? ball_times.size - 1 : [i - 1, 0].max
        a, b = @puppet[order[i]].call(t), @puppet[order[i + 1]].call(t)
        u = ((t - ball_times[i]) / BEAT).clamp(0, 1)
        [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - 150 * Math.sin(Math::PI * u)]
      end
      dab(ball_times.first, ball_times.last, "#FFFFFF", 15, ball, fade: [[ball_times.first, 0], [ball_times.first + 0.1, 1], [ball_times.last - 0.2, 1], [ball_times.last, 0]], halo: false)
      ball_times.each { |t| event(:pass, t) }
      ring(w(18, 11), ->(_) { her(w(18, 11)) }, GOLD, big: 8, life: 1.2, r: 40)
      machine
    end

    def machine
      s, e = w(19, 1), 226.0
      return unless live?(s, e)
      snap = w(19, 8)
      gears = [[300, 330, 64, 1.5], [540, 300, 92, -1.0], [790, 340, 64, 1.5]].map do |x, y, r, sp|
        { type: "star", x: x, y: y, radius: r, inner: r * 0.72, rays: 10, fill: "#7E8FB8", stroke: NIGHT, strokeWidth: 4, tracks: { rotation: sample(s, e, 1 / 6.0) { |t| ((t - s) * sp).round(3) } } }
      end
      box = path([["M", 120, 180], ["L", 960, 180], ["L", 960, 480], ["L", 120, 480], ["Z"]], fill: "#232C66", stroke: "#5A6AA8", strokeWidth: 6)
      stack = path([["M", 240, 180], ["L", 240, 60], ["L", 300, 60], ["L", 300, 180], ["Z"], ["M", 780, 180], ["L", 780, 40], ["L", 840, 40], ["L", 840, 180], ["Z"]], fill: "#232C66", stroke: "#5A6AA8", strokeWidth: 6)
      drop = [[s, -700], [s + 1.3, 0, "outCubic"], [snap + 1.2, 0], [e, -800, "smooth"]]
      shake = [[snap - 0.1, 0]] + (0..10).map { |i| [snap + i * 0.12, i.even? ? 16 : -16] } + [[snap + 1.4, 0]]
      emit(group([stack, box] + gears, start: f(s), end: e, tracks: { y: drop, x: shake }))
      # strings, redrawn each paint step so they follow the puppets
      cut = TEAM.each_index.map { |i| snap + i * 0.2 }
      t = (([s, @a].max) / STEP).floor * STEP
      while t < [e, @b].min
        cmds = []
        lift = key(t, [[s, 700], [s + 1.3, 0], [snap + 1.2, 0], [e, 800]])[0]
        @puppet.each_with_index do |pos, i|
          next if t >= cut[i]
          x, y = pos.call(t)
          cmds += [["M", (x * 0.84 + 86).round, (480 - lift).round], ["L", x.round, y.round]]
        end
        @nodes << path(cmds, fill: nil, stroke: "#DDE3F2", strokeWidth: 3, start: f(t), end: f(t + STEP)) unless cmds.empty?
        t += STEP
      end
      cut.each { |c| event(:snap, c) }
    end

    # ------------------------------------------------------------------ lights stay on
    def goodnight_street
      s, e = 226.5, 249.0
      return unless live?(s, e)
      off = w(20, 3)
      back = w(20, 6)
      rise = [[s, 760], [229.2, 0, "outCubic"], [246, 0], [e, 800, "smooth"]]
      homes = @near.each_with_index.sort_by { |_, i| (i * 11) % 29 }.map(&:first)
      kids = roofs_and_road
      homes.each_with_index do |(x, y), i|
        kids << { type: "rect", x: x - 17, y: y - 23, width: 34, height: 46, fill: LIGHTS[i % LIGHTS.size], stroke: EDGE, strokeWidth: 3,
                  tracks: { opacity: [[s + 1, 1], [off + i * 0.05, 1], [off + i * 0.05 + 0.2, 0.08], [back, 0.08], [back + 0.22, 1], *(i < 12 ? [[@final[i][:launch] + 0.1, 1], [@final[i][:launch] + 0.4, 0.12]] : [])] } }
      end
      street_group(s, e, kids, rise: rise)
      event(:whoosh, s)
      ring(back, ->(_) { [540, 1500] }, CREAM, big: 11, life: 1.2, r: 40)
      event(:relight, back)
    end

    # ------------------------------------------------------------------ her and the friends on top
    def lights
      @lights.each do |l|
        s, e = [l[:launch], 0].max, l[:settle] + 1.7
        fade = [[s, 0], [s + 0.5, 1], [l[:settle] + 1.2, 1], [l[:settle] + 1.6, 0.12], [e, 0]]
        dab(s, e, l[:color], 19, ->(t) { light_pos(l, t) }, fade: fade)
        ring(l[:arrive], ->(t) { light_pos(l, t) }, l[:color])
        event(:arrive, l[:arrive])
      end
      @final.each do |l|
        s, e = l[:launch], 297.6
        dab(s, e, l[:color], 19, ->(t) { light_pos(l, t) }, fade: [[s, 0], [s + 0.5, 1], [e - 0.1, 1], [e, 1]])
        ring(l[:arrive], ->(t) { light_pos(l, t) }, l[:color])
        event(:arrive, l[:arrive])
      end
      @kids.each do |k|
        dab(k[:s], k[:e], k[:color], 20, ->(t) { kid_pos(k, t) })
        event(:arrive, k[:s] + 1.0)
      end
      size = [[0, 0.9], [128.1, 1.0], [156.9, 2.3, "smooth"], [160.0, 1.0, "smooth"], [243.37, 1.9, "smooth"], [247, 1.5, "smooth"], [255.16, 2.3, "smooth"], [258, 2.0, "smooth"], [267.1, 3.2, "smooth"], [276, 1.2, "smooth"]]
      lo, hi = [@a - 1, 0].max, [@b + 1, END_T].min
      xs = sample(lo, hi, 1 / 12.0) { |t| her(t)[0].round(1) }
      ys = sample(lo, hi, 1 / 12.0) { |t| her(t)[1].round(1) }
      @nodes << group([{ type: "circle", radius: 60, fill: "#FFC53144" }, { type: "circle", radius: 24, fill: GOLD, stroke: NIGHT, strokeWidth: 4 }], start: 0, end: END_T, tracks: { x: xs, y: ys, scaleX: size, scaleY: size })
    end

    def camera(children)
      lo, hi = [@a - 1, 0].max, [@b + 1, END_T].min
      sc = sample(lo, hi, 1 / 6.0) { |t| (1.015 + 0.05 * smooth((t - TEST0) / 33) - 0.03 * smooth((t - 163) / 8) + 0.006 * Math.sin((t - TEST0) * 0.5)).round(4) }
      xs = sample(lo, hi, 1 / 6.0) { |t| (CX + 16 * Math.sin((t - TEST0) * 0.37)).round(1) }
      ys = sample(lo, hi, 1 / 6.0) { |t| (H / 2.0 + 11 * Math.sin((t - TEST0) * 0.29 + 1)).round(1) }
      group(children, x: CX, y: H / 2.0, anchor: [CX, H / 2.0], tracks: { x: xs, y: ys, scaleX: sc, scaleY: sc })
    end

    def underpaint
      lo, hi = [@a - 1, 0].max, [@b + 1, END_T].min
      b = sample(lo, hi, 1 / 4.0) { |t| (0.06 + 0.95 * warmth(t)).round(3) }
      @nodes << { type: "shader", shader: "nebula", x: -120, y: -120, width: W + 240, height: H + 240, center: [CX + 120, 840 + 120], radius: 1400, seed: 89, detail: 1.8, swirl: 2.6,
                  colors: ["#23103F", "#C24A4A", "#F2A23A"], filaments: 0.5, core: 0.2, stars: 0, drift: 0.12, start: 0, end: END_T, tracks: { brightness: b } }
    end

    def build
      underpaint
      paint
      table
      cradles
      friends_street
      diner
      television
      talk
      return_street
      rift
      team
      goodnight_street
      lights
      @nodes << { type: "rect", x: -120, y: -120, width: W + 240, height: H + 240, fill: NIGHT, start: 0, end: END_T, tracks: { opacity: [[0, 1], [2.2, 0, "smooth"], [294, 0], [297.5, 1, "smooth"]] } }
      event(:peak, 156.9)
      event(:peak, 243.37)
      event(:peak, 255.16)
      event(:peak, 267.1)
      keep = @nodes.select { |n| (n[:start] || 0) < @b + 0.05 && (n[:end] || END_T) > @a - 0.05 }
      { version: 1, background: NIGHT, nodes: [camera(keep)], effects: [{ name: "CIBloom", parameters: { inputRadius: 12, inputIntensity: 0.3 } }] }
    end

    def events = { song_start: 0, duration: END_T, events: @events.sort_by { |e| e[:t] } }
  end
end

a, b, out = ARGV
abort "usage: ihd_film.rb FROM TO OUT.json" unless out
builder = Film::Builder.new(a.to_f, b.to_f)
doc = builder.build
File.write(out, JSON.generate(doc))
File.write(File.join(Film::ROOT, "scenes", "film.events.json"), JSON.pretty_generate(builder.events)) if ENV["EVENTS"]
puts JSON.generate(out: File.basename(out), mb: (File.size(out) / 1e6).round(1), nodes: doc[:nodes][0][:children].size)
