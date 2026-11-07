# Look test: a painted night sky on makevoid's native Swift renderer, In Her Dream, song 125.72-162.9 s.
# Thousands of brush dashes follow a designed swirl field round the lights. No lyric words on screen; only word times are read.
require "json"

module IHD
  WORK = File.expand_path("../work", __dir__)
  ROOT = File.join(WORK, "ihd")
  W, H = 1920, 1080
  CX = W / 2.0
  SONG_START = 125.72
  DURATION = 37.18
  GRID = 24.0
  STEP = 1 / 8.0 # paint redraws 8 times a second
  SPACING = 32
  TAU = 2 * Math::PI

  NIGHT = "#0A1033"
  # coolest to warmest; a dash takes its colour from the heat where it sits
  PAINT = %w[#121C52 #1B2F7E #2653A6 #2E8C9A #8E5AA8 #D0587A #E9743A #F6B73C #FFE9B0].freeze
  WIDTH = [6, 7, 7, 8, 8, 9, 10, 10, 11].freeze
  LIGHTS = %w[#FF8FA3 #FF9A4D #7FE3D0 #FFF0C9 #C6A7FF #FF6F61 #9AD7FF #FFD27A].freeze
  GOLD = "#FFC531"
  STREET = "#070A1E"

  class Builder
    def initialize
      @rng = Random.new(1989)
      @times = JSON.parse(File.read(File.join(WORK, "ihd-in", "align.json")))["words"].map { |w| w["s"] }
      beats = JSON.parse(File.read(File.join(ROOT, "audio", "map", "beatmap.json")))["beats"]
      @bars = beats.select { |b| b["pos"].zero? }.map { |b| b["t"] + 110 - SONG_START }
      @nodes, @events = [], []
      make_lights
      make_dashes
    end

    def f(t) = (t * GRID + 1e-6).floor / GRID
    def v(song) = song - SONG_START
    def rnd(a, b) = a + @rng.rand * (b - a)
    def smooth(u) = (u = u.clamp(0.0, 1.0); u * u * (3 - 2 * u))
    def sample(s, e, step = 1 / GRID) = (0..((e - s) / step).ceil).map { |j| t = [s + j * step, e].min; [t.round(4), yield(t)] }.uniq(&:first)
    def event(kind, t, **kw) = @events << { kind: kind, t: t.round(4), **kw }

    # ---------------------------------------------------------------- the story as numbers
    PEAK = 156.9
    def warmth(t) = 0.05 + 0.22 * smooth((t - v(128.1)) / 9) + 0.34 * smooth((t - v(141.33)) / 9) + 0.5 * smooth((t - v(150.2)) / 7) - 1.0 * smooth((t - v(159.2)) / 3.0)
    def her_y(t) = 810 - 290 * smooth((t - v(129.5)) / 9) + 480 * smooth((t - v(158.9)) / 2.6)
    def her_x(t) = CX + 330 * smooth((t - v(160.4)) / 2.5)
    def spread(t) = 1 + 0.32 * smooth((t - v(150.2)) / 6.7)

    def make_lights
      chorus = @times.select { |s| (137.5..145.0).cover?(s) || (150.0..157.2).cover?(s) }
      syllables = [141.7, 142.14, 153.9, 154.4].freeze
      between = @bars.map { |t| t + SONG_START }.select { |s| s > 145.2 && s < 150 }
      arrivals = ([131.94] + chorus + syllables + between).sort.map { |s| v(s) }
      @houses = []
      hx = -140
      n = 0
      while hx < W + 140
        wide = [230, 290, 210, 320, 250][n % 5]
        @houses << [hx, wide, 800 + [40, 0, 62, 18, 50][n % 5]]
        hx += wide
        n += 1
      end
      homes = @houses.flat_map do |x0, wide, top|
        [0.3, 0.7].flat_map { |u| [[x0 + wide * u, top + 58], [x0 + wide * u, top + 146]] }
      end.select { |x, _| x > 60 && x < W - 60 }.each_with_index.sort_by { |_, i| (i * 7) % 29 }.map(&:first)
      slots = []
      [[140, 8], [245, 12], [355, 17], [470, 22]].each do |r, n|
        n.times { |i| slots << [r, i * TAU / n + r * 0.01] }
      end
      @lights = arrivals.each_with_index.map do |t, i|
        r, a = slots[i % slots.size]
        from = rnd(0, TAU)
        { arrive: t, launch: t - rnd(2.2, 3.2), r: r, a: a, from: from, turn: rnd(0.9, 1.5) * (i.even? ? 1 : -1), color: LIGHTS[i % LIGHTS.size],
          win: homes[i % homes.size], settle: v(158.9) + (i % 11) * 0.16 }
      end
      event(:first_friend, v(131.94))
    end

    def light_pos(l, t)
      hx, hy = her_x(t), her_y(t)
      ang = l[:a] + 0.11 * t
      ringx = hx + l[:r] * spread(t) * Math.cos(ang)
      ringy = hy + l[:r] * spread(t) * 0.86 * Math.sin(ang)
      u = smooth((t - l[:launch]) / (l[:arrive] - l[:launch]))
      spin = l[:turn] * (1 - u) * 2.1
      far = 1300 * (1 - u)
      x = ringx + far * Math.cos(l[:from] + spin)
      y = ringy + far * 0.8 * Math.sin(l[:from] + spin)
      k = smooth((t - l[:settle]) / 1.5)
      [x + (l[:win][0] - x) * k, y + (l[:win][1] - y) * k]
    end

    def weight(l, t) = smooth((t - l[:launch]) / 1.2) * (1 - 0.8 * smooth((t - l[:settle]) / 1.5))

    # ---------------------------------------------------------------- the paint
    def make_dashes
      @dashes = []
      (-140..W + 140).step(SPACING) do |x|
        (-140..H + 140).step(SPACING) do |y|
          @dashes << [x + rnd(-14, 14), y + rnd(-14, 14), rnd(0, TAU), rnd(0.75, 1.25), rnd(-0.2, 0.2)]
        end
      end
    end

    def paint_window(t, stop)
      hx, hy = her_x(t), her_y(t)
      warm = warmth(t)
      active = @lights.filter_map { |l| w = weight(l, t); [light_pos(l, t), w] if w > 0.02 }
      buckets = Array.new(PAINT.size) { [] }
      @dashes.each do |bx, by, ph, len, tone|
        x = bx + 9 * Math.cos(ph + t * 0.9)
        y = by + 9 * Math.sin(ph + t * 0.7)
        # sky rivers
        a0 = 0.7 * Math.sin(x / 310.0 + y / 430.0 + t * 0.11) + 1.0 * Math.sin(y / 205.0 - x / 540.0 - t * 0.07)
        ux, uy = Math.cos(a0), Math.sin(a0)
        # every light bends the paint round itself; her pull is widest
        dx, dy = x - hx, y - hy
        d = Math.sqrt(dx * dx + dy * dy) + 1
        swirl = 2.6 * Math.exp(-d / (260 + 240 * warm))
        ux += -dy / d * swirl
        uy += dx / d * swirl
        heat = 0.72 * Math.exp(-(d * d) / (2 * (80 + 210 * warm)**2))
        active.each do |(lx, ly), w|
          ex, ey = x - lx, y - ly
          q = ex * ex + ey * ey
          next if q > 90_000
          e = Math.sqrt(q) + 1
          s = 1.5 * w * Math.exp(-e / 72.0)
          ux += -ey / e * s
          uy += ex / e * s
          heat += 0.26 * w * Math.exp(-q / 7_000.0)
        end
        ang = Math.atan2(uy, ux)
        level = (warm * 0.36 + heat + tone + 0.06 * Math.sin(x / 90.0 + t)).clamp(0.0, 0.93)
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
      t = 0.0
      while t < DURATION
        paint_window(t, [t + STEP, DURATION + 0.1].min)
        t += STEP
      end
    end

    # ---------------------------------------------------------------- lights over the paint
    def lights
      @lights.each do |l|
        s, e = l[:launch], DURATION + 0.1
        s = [s, 0].max
        xs = sample(s, e, 1 / 12.0) { |t| light_pos(l, t)[0].round(1) }
        ys = sample(s, e, 1 / 12.0) { |t| light_pos(l, t)[1].round(1) }
        fade = [[s, 0], [s + 0.5, 1], [l[:settle] + 1.2, 1], [l[:settle] + 1.6, 0.12]]
        @nodes << group([{ type: "circle", radius: 44, fill: "#{l[:color]}55" }, { type: "circle", radius: 19, fill: l[:color], stroke: NIGHT, strokeWidth: 4 }],
                        start: f(s), end: e, tracks: { x: xs, y: ys, opacity: fade })
        @nodes << { type: "circle", radius: 20, fill: nil, stroke: l[:color], strokeWidth: 3, start: f(l[:arrive]), end: l[:arrive] + 1.0, glow: 6,
                    x: 0, y: 0, tracks: { x: sample(l[:arrive], l[:arrive] + 1.0, 1 / 12.0) { |t| light_pos(l, t)[0].round(1) },
                                          y: sample(l[:arrive], l[:arrive] + 1.0, 1 / 12.0) { |t| light_pos(l, t)[1].round(1) },
                                          scaleX: [[l[:arrive], 0.6], [l[:arrive] + 1.0, 3.6, "outCubic"]], scaleY: [[l[:arrive], 0.6], [l[:arrive] + 1.0, 3.6, "outCubic"]],
                                          opacity: [[l[:arrive], 0.9], [l[:arrive] + 1.0, 0]] } }
        event(:arrive, l[:arrive])
      end
      xs = sample(0, DURATION + 0.1, 1 / 12.0) { |t| her_x(t).round(1) }
      ys = sample(0, DURATION + 0.1, 1 / 12.0) { |t| her_y(t).round(1) }
      size = [[0, 0.9], [v(128.1), 1.0], [v(PEAK), 2.3, "smooth"], [v(160.0), 1.0, "smooth"]]
      @nodes << group([{ type: "circle", radius: 60, fill: "#FFC53144" }, { type: "circle", radius: 24, fill: GOLD, stroke: NIGHT, strokeWidth: 4 }],
                      start: 0, end: DURATION + 0.1, tracks: { x: xs, y: ys, scaleX: size, scaleY: size })
    end

    def group(children, **kw) = { type: "group", children: children }.merge(kw)

    # the street the lights come home to: the same friends, just down the road
    def street
      s, e = v(158.6), DURATION + 0.1
      roofs = [["M", -140, 1240]]
      walls = []
      @houses.each do |x0, wide, top|
        roofs += [["L", x0, top], ["L", x0 + wide / 2, top - 96], ["L", x0 + wide, top]]
        walls += [["M", x0, top], ["L", x0, 1240]]
      end
      roofs += [["L", W + 140, 1240], ["Z"]]
      rise = [[s, 300], [v(160.8), 0, "outCubic"]]
      @nodes << path(roofs, fill: STREET, stroke: nil, start: f(s), end: e, tracks: { y: rise })
      @nodes << path(walls, fill: nil, stroke: "#222C5E", strokeWidth: 3, start: f(s), end: e, tracks: { y: rise })
      @lights.each do |l|
        wx, wy = l[:win]
        t = l[:settle] + 1.15
        next if t >= DURATION
        @nodes << { type: "rect", x: wx - 17, y: wy - 23, width: 34, height: 46, fill: l[:color], stroke: "#222C5E", strokeWidth: 3, start: f(t), end: e,
                    tracks: { opacity: [[t, 0], [t + 0.35, 1]] } }
      end
    end

    def path(cmds, **kw) = { type: "path", commands: cmds }.merge(kw)

    def camera(children)
      sc = sample(0, DURATION + 0.1, 1 / 6.0) { |t| (1.015 + 0.05 * smooth(t / 33) + 0.006 * Math.sin(t * 0.5)).round(4) }
      xs = sample(0, DURATION + 0.1, 1 / 6.0) { |t| (CX + 16 * Math.sin(t * 0.37)).round(1) }
      ys = sample(0, DURATION + 0.1, 1 / 6.0) { |t| (H / 2.0 + 11 * Math.sin(t * 0.29 + 1)).round(1) }
      group(children, x: CX, y: H / 2.0, anchor: [CX, H / 2.0], tracks: { x: xs, y: ys, scaleX: sc, scaleY: sc })
    end

    def underpaint
      b = sample(0, DURATION + 0.1, 1 / 4.0) { |t| (0.06 + 0.95 * [warmth(t), 0].max).round(3) }
      @nodes << { type: "shader", shader: "nebula", x: -120, y: -120, width: W + 240, height: H + 240, center: [CX + 120, 520 + 120], radius: 1150, seed: 89, detail: 1.8, swirl: 2.6,
                  colors: ["#23103F", "#C24A4A", "#F2A23A"], filaments: 0.5, core: 0.2, stars: 0, drift: 0.12, start: 0, end: DURATION + 0.1, tracks: { brightness: b } }
    end

    def build
      underpaint
      paint
      street
      lights
      @nodes << { type: "rect", x: -120, y: -120, width: W + 240, height: H + 240, fill: NIGHT, start: f(DURATION - 0.8), end: DURATION + 0.1,
                  tracks: { opacity: [[DURATION - 0.8, 0], [DURATION - 0.05, 1, "smooth"]] } }
      event(:peak, v(PEAK))
      event(:settle, v(158.9))
      { version: 1, background: NIGHT, nodes: [camera(@nodes)], effects: [{ name: "CIBloom", parameters: { inputRadius: 12, inputIntensity: 0.3 } }] }
    end

    def events = { song_start: SONG_START, duration: DURATION, events: @events.sort_by { |e| e[:t] } }
  end
end

builder = IHD::Builder.new
doc = builder.build
out = File.join(IHD::ROOT, "scenes", "ihd.json")
File.write(out, JSON.generate(doc))
File.write(File.join(IHD::ROOT, "scenes", "ihd.events.json"), JSON.pretty_generate(builder.events))
puts JSON.generate(path: out, mb: (File.size(out) / 1e6).round(1), lights: builder.events[:events].count { |e| e[:kind] == :arrive })
