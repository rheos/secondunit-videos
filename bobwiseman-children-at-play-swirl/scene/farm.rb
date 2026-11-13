# Look test: Children at Play, verse 1 (song 0 to 39 s), in the painted-swirl look (looks/painted-swirl.yaml).
# Adapted from bobwiseman-swift-noimage/scene/ihd.rb. Every dash is a pure function of time and a designed field: sky
# rivers, the dusk band, a swirl round every light, the hay door's laughter. No lyric text anywhere; only beat times.
#
#   ruby scene/farm.rb                     full scene  -> work/scenes/farm.json (+ farm.events.json)
#   ruby scene/farm.rb --at 8,27.4,36      paint only near those seconds (stills; same picture, smaller JSON)
#   ruby scene/farm.rb --lineup            cast and set line-up -> work/scenes/lineup.json (render frame 876)
require "json"
require "fileutils"

module Farm
  WORK = File.expand_path("../work", __dir__)
  W, H = 1920, 1080
  CX = W / 2.0
  DURATION = 39.0
  GRID = 24.0
  STEP = 1 / 8.0 # paint redraws 8 times a second
  SPACING = 32
  TAU = 2 * Math::PI
  HZ = 770 # the flat horizon every building stands on

  NIGHT = "#0A1033"
  # coolest to warmest; a dash takes its colour from the heat where it sits (the look's nine paints)
  PAINT = %w[#121C52 #1B2F7E #2653A6 #2E8C9A #8E5AA8 #D0587A #E9743A #F6B73C #FFE9B0].freeze
  WIDTH = [6, 7, 7, 8, 8, 9, 10, 10, 11].freeze
  SILHOUETTE = "#070A1E"
  EDGE = "#222C5E"
  LAMP = "#F6B73C"
  FIREFLY = "#E4F59A"

  # the cast: one dab each, own colour, dark edge, all the same adult size
  MOTHER = "#C4B2FF" # lavender, the one cool dab in the yard
  YOU = "#FFC531"    # gold: her grown daughter
  ME = "#FF6F9C"     # rose: the daughter's lover
  DAB = 24

  # beats, song seconds (the brief's snapped times; hits.txt for the rest)
  LAUGH1 = 1.50
  MOTHER_OUT = 7.34
  HEARS = 25.39
  TURN = 26.98
  WHERE = 33.39
  # sung-word onsets that bring a firefly in (times only)
  WORD_LIGHTS = [9.64, 16.34, 17.14, 18.08, 19.21, 24.50, 25.52, 27.35, 34.57, 37.32].freeze

  # the set, one flat row on the horizon (no hills, no spire, no tree)
  HOUSE = { x0: 230, x1: 610, eave: 560, peak: [420, 430] }.freeze
  BARN = { x0: 1190, x1: 1650, eave: 520, knee: 380, peak: [1420, 300] }.freeze
  HAY = { cx: 1420, cy: 424, w: 160, h: 124 }.freeze # the hay door, high on the barn's gable
  PORCH_LAMP = [538, 690].freeze
  LOVERS = [[-38, 26, YOU, 0.0], [-6, 16, ME, 1.3]].freeze # [dx, dy from the hay door's centre, colour, sway phase]

  # where she searches: [arrive, leave, x, y]
  STOPS = [
    [MOTHER_OUT, 7.34, 465, 772],   # the door
    [8.3, 9.9, 470, 842],           # the porch
    [11.4, 13.6, 135, 868],         # the field's edge
    [15.6, 18.2, 790, 852],         # the washing line
    [19.3, 22.0, 1040, 872],        # the swing
    [23.6, WHERE, 830, 878],        # stops in the yard: hears, turns to the barn
    [35.6, DURATION + 1, 1420, 826] # below the hay door
  ].freeze

  class Builder
    def initialize(at: nil, lineup: false)
      @rng = Random.new(1957)
      @at = at
      @lineup = lineup
      @nodes, @events = [], []
      make_fireflies
      make_dashes
    end

    def f(t) = (t * GRID + 1e-6).floor / GRID
    def rnd(a, b) = a + @rng.rand * (b - a)
    def smooth(u) = (u = u.clamp(0.0, 1.0); u * u * (3 - 2 * u))
    def bump(t, s, rise, hold, fall) = smooth((t - s) / rise) * (1 - smooth((t - s - rise - hold) / fall))
    def gauss(t, c, w) = Math.exp(-((t - c) / w)**2)
    def sample(s, e, step = 1 / GRID) = (0..((e - s) / step).ceil).map { |j| t = [s + j * step, e].min; [t.round(4), yield(t)] }.uniq(&:first)
    def event(kind, t, **kw) = @events << { kind: kind, t: t.round(4), **kw }

    # ---------------------------------------------------------------- the story as numbers
    # laughter: the sky warms and swirls round the hay door; it never leaves the barn
    def laugh(t)
      drift = 0.4 * smooth((t - LAUGH1) / 1.2) + [11.2, 14.7, 18.5, 22.1].sum { |c| 0.16 * gauss(t, c, 0.9) }
      (drift + 0.62 * bump(t, LAUGH1, 0.5, 2.0, 2.6) + 0.72 * bump(t, TURN - 0.25, 0.45, 2.0, 3.0) +
       0.85 * smooth((t - WHERE) / 2.6)).clamp(0.0, 1.35)
    end

    # the end of a summer day: the band over the horizon cools as the verse goes on
    def dusk(t) = 0.44 - 0.2 * smooth(t / DURATION)

    def mother_seen(t) = smooth((t - MOTHER_OUT) / 0.5)

    def mother_pos(t)
      prev = STOPS.last
      STOPS.each_cons(2) do |a, b|
        if t < a[0]
          return [a[2], a[3]]
        elsif t <= a[1]
          return [a[2], a[3]]
        elsif t < b[0]
          u = smooth((t - a[1]) / (b[0] - a[1]))
          return [a[2] + (b[2] - a[2]) * u, a[3] + (b[3] - a[3]) * u - 10 * Math.sin(u * Math::PI)]
        end
      end
      [prev[2], prev[3]]
    end

    # she turns toward the barn on the laugh and looks there until she sets off
    def gaze(t) = smooth((t - TURN) / 0.6) * (1 - smooth((t - WHERE) / 1.0))

    def make_fireflies
      @flies = WORD_LIGHTS.each_with_index.map do |t, i|
        gap = [[30, 200], [640, 1150], [640, 1150]][i % 3] # open air between the buildings, never on a wall
        home = [rnd(*gap), rnd(610, 750)]
        { arrive: t, launch: t - rnd(1.6, 2.4), home: home, from: rnd(0, TAU), turn: rnd(0.8, 1.3) * (i.even? ? 1 : -1),
          orbit: rnd(14, 26), phase: rnd(0, TAU) }
      end
      @flies.each { |l| event(:arrive, l[:arrive]) }
    end

    def fly_pos(l, t)
      hx, hy = l[:home]
      ox = hx + l[:orbit] * Math.cos(l[:phase] + 0.6 * t)
      oy = hy + l[:orbit] * 0.6 * Math.sin(l[:phase] + 0.8 * t)
      u = smooth((t - l[:launch]) / (l[:arrive] - l[:launch]))
      far = 700 * (1 - u)
      spin = l[:turn] * (1 - u) * 2.0
      [ox + far * Math.cos(l[:from] + spin), oy + far * 0.5 * Math.sin(l[:from] + spin) - 200 * (1 - u)]
    end

    def fly_weight(l, t) = smooth((t - l[:launch]) / 1.0)

    # ---------------------------------------------------------------- the paint
    def make_dashes
      @dashes = []
      (-140..W + 140).step(SPACING) do |x|
        (-140..H + 140).step(SPACING) do |y|
          @dashes << [x + rnd(-14, 14), y + rnd(-14, 14), rnd(0, TAU), rnd(0.75, 1.25), rnd(-0.16, 0.16)]
        end
      end
    end

    def paint_window(t, stop)
      lau = laugh(t)
      band = dusk(t)
      mx, my = mother_pos(t)
      seen = mother_seen(t)
      look = gaze(t)
      gx, gy = HAY[:cx] - mx, HAY[:cy] - my
      gl = Math.sqrt(gx * gx + gy * gy)
      gx, gy = gx / gl, gy / gl
      active = @flies.filter_map { |l| w = fly_weight(l, t); [fly_pos(l, t), w] if w > 0.02 }
      lamp = smooth((t - MOTHER_OUT) / 0.35)
      buckets = Array.new(PAINT.size) { [] }
      @dashes.each do |bx, by, ph, len, tone|
        x = bx + 9 * Math.cos(ph + t * 0.9)
        y = by + 9 * Math.sin(ph + t * 0.7)
        sky = y < HZ
        if sky
          # sky rivers, as in the In Her Dream test
          a0 = 0.7 * Math.sin(x / 310.0 + y / 430.0 + t * 0.11) + 1.0 * Math.sin(y / 205.0 - x / 540.0 - t * 0.07)
          heat = 0.1 + band * Math.exp(-(HZ - y) / 230.0)
        else
          # the yard: long grass rows running along the ground
          a0 = 0.16 * Math.sin(x / 260.0 + t * 0.1) + 0.12 * Math.sin(y / 70.0 + x / 900.0)
          heat = 0.05 + 0.16 * Math.exp(-(y - HZ) / 70.0)
        end
        ux, uy = Math.cos(a0), Math.sin(a0)
        # the laughter: the hay door's swirl, widest and hottest when they laugh
        dx, dy = x - HAY[:cx], y - HAY[:cy]
        d = Math.sqrt(dx * dx + dy * dy) + 1
        swirl = (0.9 + 2.4 * lau) * Math.exp(-d / (150 + 250 * lau))
        ux += -dy / d * swirl
        uy += dx / d * swirl
        heat += (0.3 + 0.6 * lau) * Math.exp(-(d * d) / (2 * (140 + 200 * lau)**2))
        # the porch lamp, once she switches it on
        if lamp > 0
          ex, ey = x - PORCH_LAMP[0], y - PORCH_LAMP[1]
          q = ex * ex + ey * ey
          if q < 90_000
            e = Math.sqrt(q) + 1
            s = 1.2 * lamp * Math.exp(-e / 70.0)
            ux += -ey / e * s
            uy += ex / e * s
            heat += 0.3 * lamp * Math.exp(-q / 6_000.0)
          end
        end
        # her own small eddy, and on the laugh the paint round her streams toward the barn
        if seen > 0
          ex, ey = x - mx, y - my
          q = ex * ex + ey * ey
          if q < 250_000
            e = Math.sqrt(q) + 1
            s = 1.3 * seen * Math.exp(-e / 95.0) * (1 - 0.7 * look)
            ux += ey / e * s # she turns the other way from the laughter
            uy += -ex / e * s
            heat -= 0.4 * seen * Math.exp(-q / 18_000.0) # she stays in the cool: the warmth is never hers
            pull = 2.4 * look * Math.exp(-e / 230.0)
            ux += gx * pull
            uy += gy * pull
          end
        end
        active.each do |(lx, ly), w|
          ex, ey = x - lx, y - ly
          q = ex * ex + ey * ey
          next if q > 40_000
          e = Math.sqrt(q) + 1
          s = 0.8 * w * Math.exp(-e / 80.0) # a wide, gentle curl: tight ones fold the dashes into chevrons
          ux += -ey / e * s
          uy += ex / e * s
          heat += 0.18 * w * Math.exp(-q / 4_000.0)
        end
        ang = Math.atan2(uy, ux)
        level = (heat + tone + 0.05 * Math.sin(x / 90.0 + t)).clamp(0.0, 0.93)
        i = (level * PAINT.size).floor
        half = len * (12 + 10 * [heat, 1].min)
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
        stop = [t + STEP, DURATION + 0.1].min
        paint_window(t, stop) if @at.nil? || @at.any? { |a| a >= t - 1e-6 && a < stop }
        t += STEP
      end
    end

    # ---------------------------------------------------------------- the set
    def path(cmds, **kw) = { type: "path", commands: cmds }.merge(kw)
    def group(children, **kw) = { type: "group", children: children }.merge(kw)
    def flat(cmds, **kw) = path(cmds, fill: SILHOUETTE, stroke: EDGE, strokeWidth: 3, **kw)
    def line(pts, w = 6, color = SILHOUETTE) = path([["M", *pts[0]]] + pts[1..].map { |p| ["L", *p] }, fill: nil, stroke: color, strokeWidth: w)
    def lit(x, y, w, h, color, t0) = { type: "rect", x: x, y: y, width: w, height: h, fill: color, stroke: EDGE, strokeWidth: 3,
                                       start: f(t0), end: DURATION + 0.1, tracks: { opacity: [[t0, 0], [t0 + 0.35, 1]] } }

    def set
      h = HOUSE
      @nodes << flat([["M", h[:x0], HZ + 4], ["L", h[:x0], h[:eave]], ["L", *h[:peak]], ["L", h[:x1], h[:eave]], ["L", h[:x1], HZ + 4], ["Z"]])
      # porch: a flat roof on two posts
      @nodes << flat([["M", 418, 664], ["L", 572, 664], ["L", 572, 676], ["L", 418, 676], ["Z"]])
      @nodes << line([[424, 676], [424, HZ + 4]], 6)
      @nodes << line([[566, 676], [566, HZ + 4]], 6)
      @nodes << { type: "rect", x: 442, y: 682, width: 48, height: 88, fill: "#0D1236", stroke: EDGE, strokeWidth: 3 }
      # dark until she comes out; she switches the lamp on and the house lights up behind her
      [[262, 598, 52, 58], [334, 598, 52, 58], [404, 470, 32, 40]].each { |x, y, w, hh| @nodes << lit(x, y, w, hh, LAMP, MOTHER_OUT + 0.15) }
      @nodes << lit(448, 688, 36, 82, "#E9743A", MOTHER_OUT - 0.2)
      @nodes << { type: "circle", radius: 9, fill: LAMP, stroke: EDGE, strokeWidth: 3, x: PORCH_LAMP[0], y: PORCH_LAMP[1],
                  start: f(MOTHER_OUT), end: DURATION + 0.1, tracks: { opacity: [[MOTHER_OUT, 0], [MOTHER_OUT + 0.3, 1]] } }

      # washing line: two posts, a sagging line, three hanging cloths
      @nodes << line([[700, 790], [700, 650]], 7)
      @nodes << line([[930, 790], [930, 650]], 7)
      @nodes << path([["M", 700, 656], ["Q", 815, 690, 930, 656]], fill: nil, stroke: SILHOUETTE, strokeWidth: 3)
      [[728, 664, 52, 70], [796, 672, 44, 58], [856, 668, 50, 76]].each do |x, y, w, hh|
        @nodes << flat([["M", x, y], ["L", x + w, y + 1], ["L", x + w - 3, y + hh], ["L", x + 2, y + hh - 4], ["Z"]], fill: "#141C48")
      end

      # swing: an A-frame with a seat on two ropes
      @nodes << line([[972, 792], [998, 640], [1024, 792]], 7)
      @nodes << line([[1090, 792], [1116, 640], [1142, 792]], 7)
      @nodes << line([[992, 642], [1122, 642]], 8)
      @nodes << line([[1040, 642], [1040, 732]], 3)
      @nodes << line([[1072, 642], [1072, 732]], 3)
      @nodes << line([[1032, 734], [1080, 734]], 7)

      # the field's edge: a rail fence at the far left
      (0..4).each { |i| @nodes << line([[18 + i * 44, 796], [18 + i * 44, 708]], 7) }
      @nodes << line([[0, 724], [200, 724]], 5)
      @nodes << line([[0, 752], [200, 752]], 5)

      # the barn: plain gambrel, big door below, the hay door high on the gable
      b = BARN
      @nodes << flat([["M", b[:x0], HZ + 4], ["L", b[:x0], b[:eave]], ["L", b[:x0] + 60, b[:knee]], ["L", *b[:peak]],
                      ["L", b[:x1] - 60, b[:knee]], ["L", b[:x1], b[:eave]], ["L", b[:x1], HZ + 4], ["Z"]])
      @nodes << { type: "rect", x: 1350, y: 610, width: 140, height: 160, fill: "#0B1029", stroke: EDGE, strokeWidth: 3 }
      @nodes << line([[1350, 610], [1490, 770]], 3, EDGE)
      @nodes << line([[1490, 610], [1350, 770]], 3, EDGE)
    end

    # the hay door: the light the laughter comes from. Lit on the first laugh, it holds the lovers from WHERE on.
    def hay_door
      hx, hy, w, hh = HAY[:cx], HAY[:cy], HAY[:w], HAY[:h]
      lit_at = LAUGH1 - 0.1
      halo = sample(lit_at, DURATION + 0.1, 1 / 12.0) { |t| (14 + 26 * [laugh(t), 1.2].min).round(2) }
      # the warm halo round the opening (a stroke glows in its own colour); the opening drawn next knocks it out inside
      @nodes << { type: "rect", x: hx - w / 2, y: hy - hh / 2, width: w, height: hh, fill: nil, stroke: "#F6B73C", strokeWidth: 12,
                  start: f(lit_at), end: DURATION + 0.1, tracks: { glow: halo, opacity: [[lit_at, 0], [lit_at + 0.4, 1]] } }
      @nodes << { type: "rect", x: hx - w / 2, y: hy - hh / 2, width: w, height: hh, fill: "#FFE9B0", stroke: nil,
                  start: f(lit_at), end: DURATION + 0.1, tracks: { opacity: [[lit_at, 0], [lit_at + 0.4, 1]] } }
      # straw at the sill, warm
      @nodes << path([["M", hx - w / 2 + 3, hy + hh / 2 - 3], ["L", hx - w / 2 + 3, hy + hh / 2 - 22], ["Q", hx - 20, hy + hh / 2 - 34, hx + 10, hy + hh / 2 - 20],
                      ["Q", hx + 40, hy + hh / 2 - 30, hx + w / 2 - 3, hy + hh / 2 - 18], ["L", hx + w / 2 - 3, hy + hh / 2 - 3], ["Z"]],
                     fill: "#F6B73C", stroke: nil, start: f(lit_at), end: DURATION + 0.1, tracks: { opacity: [[lit_at, 0], [lit_at + 0.4, 1]] })
      # the frame of the opening, dark, over the light
      @nodes << { type: "rect", x: hx - w / 2, y: hy - hh / 2, width: w, height: hh, fill: nil, stroke: SILHOUETTE, strokeWidth: 8 }
      event(:hay_door, lit_at)
      lovers unless @lineup
    end

    # two dabs, close together, inside the hay door's glow. Never more than that.
    def lovers(t0 = WHERE)
      # overlapping, low and left of centre in the hay, at two heights, so the pair never reads as a pair of eyes
      LOVERS.each do |dx, dy, color, ph|
        y0 = HAY[:cy] + dy
        bob = sample(t0, DURATION + 0.1, 1 / 12.0) { |t| (y0 - 2.5 * [laugh(t), 1].min * Math.sin(t * 7.0 + ph)).round(1) }
        @nodes << group([{ type: "circle", radius: DAB, fill: color, stroke: NIGHT, strokeWidth: 4 }], x: HAY[:cx] + dx, y: y0, start: f(t0), end: DURATION + 0.1,
                        tracks: { y: bob, opacity: [[t0, 0], [t0 + 0.6, 1, "smooth"]] })
      end
      event(:lovers, t0)
    end

    # ---------------------------------------------------------------- lights and the mother over the paint
    def fireflies
      @flies.each do |l|
        s, e = [l[:launch], 0].max, DURATION + 0.1
        xs = sample(s, e, 1 / 12.0) { |t| fly_pos(l, t)[0].round(1) }
        ys = sample(s, e, 1 / 12.0) { |t| fly_pos(l, t)[1].round(1) }
        twinkle = sample(s, e, 1 / 12.0) { |t| (fly_weight(l, t) * (0.7 + 0.3 * Math.sin(t * 5 + l[:phase]))).round(3) }
        @nodes << group([{ type: "circle", radius: 20, fill: "#E4F59A40" }, { type: "circle", radius: 7, fill: FIREFLY, stroke: NIGHT, strokeWidth: 2 }],
                        start: f(s), end: e, tracks: { x: xs, y: ys, opacity: twinkle })
        @nodes << { type: "circle", radius: 10, fill: nil, stroke: FIREFLY, strokeWidth: 2, start: f(l[:arrive]), end: l[:arrive] + 0.8, glow: 6,
                    x: fly_pos(l, l[:arrive])[0].round(1), y: fly_pos(l, l[:arrive])[1].round(1),
                    tracks: { scaleX: [[l[:arrive], 0.6], [l[:arrive] + 0.8, 3.2, "outCubic"]], scaleY: [[l[:arrive], 0.6], [l[:arrive] + 0.8, 3.2, "outCubic"]],
                              opacity: [[l[:arrive], 0.85], [l[:arrive] + 0.8, 0]] } }
      end
    end

    def mother
      s, e = MOTHER_OUT, DURATION + 0.1
      xs = sample(s, e, 1 / 12.0) { |t| mother_pos(t)[0].round(1) }
      ys = sample(s, e, 1 / 12.0) { |t| mother_pos(t)[1].round(1) }
      ang = Math.atan2(HAY[:cy] - STOPS[5][3], HAY[:cx] - STOPS[5][2])
      # she stops on HEARS; on the laugh she leans toward the barn
      lean = sample(s, e, 1 / 12.0) { |t| (1 + 0.16 * gaze(t)).round(3) }
      thin = sample(s, e, 1 / 12.0) { |t| (1 - 0.1 * gaze(t)).round(3) }
      halo = { type: "circle", radius: 58, fill: "#C4B2FF33", x: 0, y: 0 }
      dab = { type: "circle", radius: DAB, fill: MOTHER, stroke: NIGHT, strokeWidth: 4 }
      @nodes << group([group([halo, dab], rotation: ang, tracks: { scaleX: lean, scaleY: thin })], start: f(s), end: e,
                      tracks: { x: xs, y: ys, opacity: [[s, 0], [s + 0.5, 1]] })
      event(:mother_out, MOTHER_OUT)
      event(:hears, HEARS)
      event(:turn, TURN)
      event(:where, WHERE)
    end

    def camera(children)
      sc = sample(0, DURATION + 0.1, 1 / 6.0) { |t| (1.015 + 0.03 * smooth(t / 36) + 0.025 * smooth((t - WHERE) / 5) + 0.005 * Math.sin(t * 0.5)).round(4) }
      xs = sample(0, DURATION + 0.1, 1 / 6.0) { |t| (CX + 14 * Math.sin(t * 0.37)).round(1) }
      ys = sample(0, DURATION + 0.1, 1 / 6.0) { |t| (H / 2.0 + 9 * Math.sin(t * 0.29 + 1)).round(1) }
      group(children, x: CX, y: H / 2.0, anchor: [CX, H / 2.0], tracks: { x: xs, y: ys, scaleX: sc, scaleY: sc })
    end

    def underpaint
      b = sample(0, DURATION + 0.1, 1 / 4.0) { |t| (0.08 + 0.55 * dusk(t) + 0.45 * [laugh(t), 1].min).round(3) }
      @nodes << { type: "shader", shader: "nebula", x: -120, y: -120, width: W + 240, height: H + 240, center: [HAY[:cx] + 120, HAY[:cy] + 120], radius: 1250,
                  seed: 57, detail: 1.8, swirl: 2.6, colors: ["#1A1240", "#B8486A", "#F2A23A"], filaments: 0.5, core: 0.2, stars: 0, drift: 0.1,
                  start: 0, end: DURATION + 0.1, tracks: { brightness: b } }
    end

    def build
      underpaint
      paint
      set
      hay_door
      fireflies unless @lineup
      mother unless @lineup
      @nodes << { type: "rect", x: -120, y: -120, width: W + 240, height: H + 240, fill: NIGHT, start: 0, end: 0.6,
                  tracks: { opacity: [[0, 1], [0.6, 0, "smooth"]] } } unless @lineup
      { version: 1, background: NIGHT, nodes: [@lineup ? group(@nodes) : camera(@nodes)],
        effects: [{ name: "CIBloom", parameters: { inputRadius: 12, inputIntensity: 0.3 } }] }
    end

    def events = { song_start: 0.0, duration: DURATION, events: @events.sort_by { |e| e[:t] } }
  end

  # ---------------------------------------------------------------- line-up: the cast and the set, labelled
  module Lineup
    module_function

    def text(s, x, y, size = 30, fill = "#FFE9B0", font = "Helvetica") = { type: "text", text: s, font: font, size: size, fill: fill, x: x, y: y }

    def dab(color, x, y, r, halo = nil)
      kids = []
      kids << { type: "circle", radius: r * 1.6, fill: halo } if halo
      kids << { type: "circle", radius: r, fill: color, stroke: NIGHT, strokeWidth: [4 * r / DAB, 4].max.round }
      { type: "group", x: x, y: y, children: kids }
    end

    def build(t)
      # the set panel is the real scene at t (paint, set, hay door lit), people left out, scaled into the right side
      b = Builder.new(at: [t], lineup: true)
      setdoc = b.build
      sc, px, py = 0.6, 735, 96
      panel = { type: "group", x: px, y: py, scale: sc, children: setdoc[:nodes] }
      pw, ph = W * sc, H * sc
      mask = [[-200, -200, W + 400, py + 200], [-200, py + ph, W + 400, 600], [-200, -200, px + 200, H + 400], [px + pw, -200, 600, H + 400]]
               .map { |x, y, w, h| { type: "rect", x: x, y: y, width: w, height: h, fill: NIGHT } }
      to = ->(x, y) { [px + x * sc, py + y * sc] }
      # [label, the thing it names (scene px), label centre (scene px)]; pills keep the words off the paint
      labels = [["field's edge", [100, 735], [150, 880]], ["house", [300, 700], [330, 950]], ["porch lamp", PORCH_LAMP, [560, 880]],
                ["washing line", [815, 690], [815, 950]], ["swing", [1057, 700], [1057, 880]], ["barn", [1560, 700], [1580, 950]],
                ["hay door: the laughter's light", [HAY[:cx], HAY[:cy] - HAY[:h] / 2], [HAY[:cx], 215]]].flat_map do |s, (ax, ay), (cx, cy)|
        x0, y0 = to.(ax, ay)
        lx, ly = to.(cx, cy)
        wpx = s.size * 11.5 + 22
        [{ type: "line", points: [[x0, y0], [lx, ly + (ly > y0 ? -16 : 16)]], stroke: "#FFE9B0", strokeWidth: 2 },
         { type: "circle", x: x0, y: y0, radius: 4, fill: "#FFE9B0" },
         { type: "rect", x: lx - wpx / 2, y: ly - 16, width: wpx, height: 32, radius: 16, fill: "#0A1033E6", stroke: "#FFE9B0", strokeWidth: 1.5 },
         { type: "text", text: s, font: "Helvetica-Bold", size: 20, fill: "#FFFFFF", x: lx, y: ly + 7, align: "center" }]
      end
      # where the two dabs will sit (from 33.4 s): a dotted pair of rings in the door
      rings = LOVERS.map do |dx, dy, _|
        cx, cy = to.(HAY[:cx] + dx, HAY[:cy] + dy)
        { type: "circle", x: cx, y: cy, radius: DAB * sc, fill: nil, stroke: NIGHT, strokeWidth: 2, dash: [4, 4] }
      end
      cast = [
        [MOTHER, "the mother", "lavender", "searches the yard", 250],
        [YOU, "you: her grown daughter", "gold, young adult", "only ever in the hay door", 520],
        [ME, "me: her lover", "rose, young adult", "only ever beside her", 790]
      ].flat_map do |color, name, sub, sub2, y|
        [dab(color, 160, y, DAB * 3, "#{color}2E"), dab(color, 300, y + 44, DAB), text("1:1", 289, y + 92, 16, "#8D97C9"),
         text(name, 340, y - 8, 28, "#FFE9B0", "Helvetica-Bold"), text(sub, 340, y + 24, 19, "#B9C2EE"), text(sub2, 340, y + 50, 19, "#B9C2EE")]
      end
      head = [text("Children at Play: painted swirl, cast and set", 60, 70, 34, "#FFE9B0", "Helvetica-Bold"),
              text("Each person is one dab of their own colour with a dark edge. All three dabs are the same adult size.", 60, 1000, 22, "#B9C2EE"),
              text("The lovers are only ever two dabs close together inside the hay door's glow (dotted rings), from 33.4 s.", 60, 1036, 22, "#B9C2EE"),
              text("Set at 36.5 s, people removed", px, py + ph + 34, 20, "#8D97C9")]
      { version: 1, background: NIGHT, nodes: [panel] + mask + rings + labels + cast + head,
        effects: [{ name: "CIBloom", parameters: { inputRadius: 12, inputIntensity: 0.3 } }] }
    end
  end
end

if $PROGRAM_NAME == __FILE__
  dir = File.join(Farm::WORK, "scenes")
  FileUtils.mkdir_p(dir)
  if ARGV.include?("--lineup")
    out = File.join(dir, "lineup.json")
    File.write(out, JSON.generate(Farm::Lineup.build(36.5)))
    puts JSON.generate(path: out, frame: (36.5 * Farm::GRID).round)
  else
    at = (i = ARGV.index("--at")) ? ARGV[i + 1].split(",").map(&:to_f) : nil
    builder = Farm::Builder.new(at: at)
    doc = builder.build
    name = at ? "farm-stills" : "farm"
    out = File.join(dir, "#{name}.json")
    File.write(out, JSON.generate(doc))
    File.write(File.join(dir, "#{name}.events.json"), JSON.pretty_generate(builder.events))
    puts JSON.generate(path: out, mb: (File.size(out) / 1e6).round(1), frames: at&.map { |a| (a * Farm::GRID).round })
  end
end
