# Look test: makevoid's native Swift renderer on Bob Wiseman's 10,000 Miles, bars 11-27.
# Writes work/mv/scenes/miles.json and miles.events.json. Lyric words come only from work/cues.json (gitignored).
require "json"

module Miles
  HERE = __dir__
  WORK = File.expand_path("../work", HERE)
  ROOT = File.join(WORK, "mv")
  W, H = 1920, 1080
  CX, CY = W / 2.0, H / 2.0
  CY0 = CY - 30
  SONG_START = 26.6007
  DURATION = 35.9
  GRID = 24.0
  EARTH = 1.4e6 # world units; window is 900 wide at zoom 1

  NIGHT, DISC, PAPER, GOLD, HOT, COOL = "#0A0E24", "#0D1636", "#F2E8D5", "#FFC531", "#FF5A1F", "#7FD6FF"
  HAND, IMPACT, MONO = "BradleyHandITCTT-Bold", "Impact", "AndaleMono"
  TAU = 2 * Math::PI

  class Builder
    def initialize
      @nodes, @top, @events, @accents = [], [], [], []
      @rng = Random.new(10_000)
      map = File.join(ROOT, "audio", "map")
      @beats = JSON.parse(File.read(File.join(map, "beatmap.json")))["beats"].map { |x| [x["t"] - SONG_START, x["bar"], x["pos"]] }
      @hits = JSON.parse(File.read(File.join(map, "hits.json")))
      @lines = JSON.parse(File.read(File.join(WORK, "cues.json")))["lines"]
    end

    # ---------------------------------------------------------------- clock
    def f(t) = (t * GRID + 1e-6).floor / GRID
    def v(song) = song - SONG_START
    def word(line, i) = @lines[line]["words"][i]
    def wt(line, i) = v(word(line, i)["s"])
    def wtext(line, i) = word(line, i)["w"]
    def bar(n) = @beats.find { |t, b, p| b == n && p.zero? }[0]
    def kicks(a, b) = @hits["kick"].map { |x| [x["t"] - SONG_START, x["s"]] }.select { |t, s| t >= a && t < b && s > 0.5 }.map(&:first)
    def rnd(a, b) = a + @rng.rand * (b - a)
    def event(kind, t, **kw) = @events << { kind: kind, t: t.round(4), **kw }
    def accent(t, amp) = (@accents << [t, amp]; event(:accent, t, amp: amp))
    def smooth(u) = (u = u.clamp(0.0, 1.0); u * u * (3 - 2 * u))
    def sample(s, e, step = 1 / GRID)
      (0..((e - s) / step).ceil).map { |j| t = [s + j * step, e].min; [t.round(4), yield(t)] }.uniq(&:first)
    end

    # ---------------------------------------------------------------- the one camera: log zoom through keys, then eased by averaging
    def zoom_keys
      @zoom_keys ||= [[0.0, 1.0], [v(27.3), 0.92], [v(28.2), 0.22], [v(29.26), 0.022], [v(30.42), 0.0012], [v(31.37), 0.00052], [v(33.2), 0.0003],
                      [v(43.8), 0.0003], [v(44.9), 2.14e-4], [v(55.0), 1.86e-4], [v(56.0), 7e-6], [DURATION + 1, 7e-6]]
    end

    def raw_log_zoom(t)
      k = zoom_keys
      return Math.log(k[0][1]) if t <= k[0][0]
      a, b = k.each_cons(2).find { |x, y| t <= y[0] } || [k[-2], k[-1]]
      Math.log(a[1]) + (t - a[0]) / (b[0] - a[0]) * (Math.log(b[1]) - Math.log(a[1]))
    end

    def z(t) = Math.exp((-4..4).sum { |i| raw_log_zoom(t + i * 0.05) } / 9.0)
    def r_px(t) = z(t) * EARTH

    def cx(t) = CX + 340 * (smooth((t - v(33.8)) / 1.8) - smooth((t - v(43.2)) / 1.0))
    def spin(t) = 1.0 * smooth((t - v(33.4)) / (v(56.0) - v(33.4))) * 1.0 + 0.0

    # ---------------------------------------------------------------- nodes
    def group(children, **kw) = { type: "group", children: children }.merge(kw)
    def text(str, font: HAND, size: 64, x: CX, y: CY, fill: PAPER, align: "center", **kw) = { type: "text", text: str, font: font, size: size, x: x, y: y, fill: fill, align: align }.merge(kw)
    def full(fill, s, e, **kw) = { type: "rect", x: -120, y: -120, width: W + 240, height: H + 240, fill: fill, start: f(s), end: f(e) }.merge(kw)
    def path(cmds, **kw) = { type: "path", commands: cmds }.merge(kw)
    def ring(t, r:, to:, color:, width: 2, dur: 0.7, x:, y:)
      { type: "circle", radius: r, fill: nil, stroke: color, strokeWidth: width, x: x, y: y, start: f(t), end: t + dur, glow: 8, glowCore: 0.5,
        tracks: { scaleX: [[t, 1], [t + dur, to, "outCubic"]], scaleY: [[t, 1], [t + dur, to, "outCubic"]], opacity: [[t, 0.9], [t + dur, 0]] } }
    end

    # stroke held at `px` on screen while the parent group is scaled by zoom(t)
    def px_width(px, s, e) = sample(s, e, 1 / 8.0) { |t| (px / z(t)).round(3) }

    # ---------------------------------------------------------------- world layers, centred on the window
    def world
      e_world = v(32.2)
      zs = sample(0, e_world) { |t| z(t).round(8) }
      kids = []

      # town grid: streets from far away
      town = []
      (-22..22).each { |i| x = i * 16_000; town += [["M", x, -352_000], ["L", x, 352_000], ["M", -352_000, x], ["L", 352_000, x]] }
      kids << path(town, stroke: "#7FD6FF66", fill: nil, strokeWidth: 1, start: 0, end: f(e_world),
                         tracks: { strokeWidth: px_width(1.0, 0, e_world), opacity: sample(0, e_world, 1 / 8.0) { |t| (smooth((0.03 - z(t)) / 0.02) * (1 - smooth((0.0011 - z(t)) / 0.0006))).round(3) } })

      # the street: rows of dark houses
      houses, panes = [], []
      (-9..9).each do |row|
        (-18..18).each do |k|
          next if row.zero? && k.zero?
          hx, hy = k * 3800.0, row * 7600.0
          houses += [["M", hx - 1600, hy + 1600], ["L", hx - 1600, hy - 1200], ["L", hx, hy - 2700], ["L", hx + 1600, hy - 1200], ["L", hx + 1600, hy + 1600], ["Z"]]
          panes += [["M", hx - 450, hy - 320], ["L", hx + 450, hy - 320], ["L", hx + 450, hy + 320], ["L", hx - 450, hy + 320], ["Z"]]
        end
      end
      fade_street = sample(0, e_world, 1 / 8.0) { |t| (1 - smooth((0.024 - z(t)) / 0.012)).round(3) }
      kids << path(houses, stroke: PAPER, fill: nil, strokeWidth: 2, start: 0, end: f(e_world), tracks: { strokeWidth: px_width(1.6, 0, e_world), opacity: fade_street })
      kids << path(panes, stroke: "#F2E8D555", fill: nil, strokeWidth: 1, start: 0, end: f(e_world), tracks: { strokeWidth: px_width(1.0, 0, e_world), opacity: fade_street })

      # this house, drawn over the street
      wall = [["M", -1600, 1600], ["L", -1600, -1200], ["L", 0, -2700], ["L", 1600, -1200], ["L", 1600, 1600], ["Z"]]
      kids << path(wall, fill: NIGHT, stroke: PAPER, strokeWidth: 3, start: 0, end: f(v(30.2)), tracks: { strokeWidth: px_width(2.6, 0, v(30.2)) })

      # the window and the smile
      win = []
      win << { type: "rect", x: -450, y: -320, width: 900, height: 640, fill: GOLD }
      win << { type: "circle", radius: 34, fill: NIGHT, x: -130, y: -70 }
      win << { type: "circle", radius: 34, fill: NIGHT, x: 130, y: -70 }
      win << path([["M", -120, 80], ["Q", 0, 150, 120, 80]], fill: nil, stroke: NIGHT, strokeWidth: 14)
      win << { type: "rect", x: -450, y: -320, width: 900, height: 640, fill: nil, stroke: PAPER, strokeWidth: 12 }
      kids << group(win, start: 0, end: f(v(30.2)))

      @nodes << group(kids, x: CX, y: CY0, anchor: [0, 0], start: 0, end: f(e_world), tracks: { scaleX: zs, scaleY: zs })
    end

    # ---------------------------------------------------------------- the globe, in screen space so lines stay thin
    def earth_alpha(t) = 1 - smooth((z(t) - 0.0017) / 0.0015)

    def globe
      s, e = v(29.6), v(56.3)
      rs = sample(s, e) { |t| (r_px(t) / 1000.0).round(5) }
      xs = sample(s, e) { |t| cx(t).round(2) }
      alpha = sample(s, e, 1 / 8.0) { |t| earth_alpha(t).round(3) }
      w = ->(px) { sample(s, e, 1 / 8.0) { |t| (px / (r_px(t) / 1000.0)).round(3) } }
      kids = []
      kids << { type: "circle", radius: 1000, fill: DISC, stroke: COOL, strokeWidth: 2, tracks: { strokeWidth: w.(2.2) } }
      (-2..2).each do |i|
        y = i * 300.0
        half = Math.sqrt(1000.0**2 - y**2)
        kids << { type: "line", points: [[-half, y], [half, y]], stroke: "#7FD6FF55", strokeWidth: 1, tracks: { strokeWidth: w.(1.1) } }
      end
      6.times do |i|
        sx = sample(s, e, 1 / 12.0) { |t| [Math.cos(i * Math::PI / 6 + spin(t)).abs, 0.002].max.round(4) }
        kids << { type: "circle", radius: 1000, fill: nil, stroke: "#7FD6FF55", strokeWidth: 1, tracks: { scaleX: sx, strokeWidth: w.(1.1) } }
      end
      @nodes << group(kids, y: CY0, anchor: [0, 0], start: f(s), end: f(e), tracks: { x: xs, scaleX: rs, scaleY: rs, opacity: alpha })
      land(s, e)
    end

    # stippled coasts on the turning globe
    def land(s, e)
      blobs = [[0.55, 0.9, 0.34], [0.35, -0.9, 0.42], [-0.45, 1.5, 0.28], [-0.35, -1.7, 0.36], [0.2, 2.6, 0.3], [-0.7, 0.2, 0.2]]
      dots = []
      blobs.each do |lat0, lon0, rad|
        wob = [rnd(0.1, 0.3), rnd(0, TAU), rnd(0.05, 0.2), rnd(0, TAU)]
        34.times do |i|
          a = i * TAU / 34
          r = rad * (1 + wob[0] * Math.sin(3 * a + wob[1]) + wob[2] * Math.sin(5 * a + wob[3]))
          lat, lon = lat0 + r * Math.sin(a), lon0 + r * Math.cos(a) / [Math.cos(lat0), 0.4].max
          px = ->(t) { cx(t) + r_px(t) * Math.cos(lat) * Math.sin(lon + spin(t)) }
          py = ->(t) { CY0 - r_px(t) * Math.sin(lat) }
          op = ->(t) { Math.cos(lon + spin(t)) > 0.03 ? (0.75 * earth_alpha(t)).round(3) : 0 }
          dots << { type: "circle", radius: 1.9, fill: PAPER, start: f(s), end: f(e),
                    tracks: { x: sample(s, e, 1 / 6.0) { |t| px.(t).round(1) }, y: sample(s, e, 1 / 6.0) { |t| py.(t).round(1) }, opacity: sample(s, e, 1 / 6.0) { |t| op.(t) } } }
        end
      end
      @nodes << group(dots, start: f(s), end: f(e))
    end

    # the window seen from orbit: one gold dot that rides the globe
    def home_dot
      s, e = v(29.5), v(56.3)
      hx = ->(t) { cx(t) + r_px(t) * Math.sin(spin(t)) }
      @nodes << { type: "circle", radius: 6, fill: GOLD, glow: 10, glowCore: 0.5, start: f(s), end: f(e),
                  tracks: { x: sample(s, e) { |t| hx.(t).round(2) }, y: sample(s, e) { |_t| CY0.round(2) }, opacity: [[s, 0], [s + 0.5, 1]] } }
      @home_x = hx
    end

    # search reticle that can't find it, then does
    def reticle
      t0, there = wt(5, 0), wt(5, 5)
      stops = [[t0, 240, -170], [wt(5, 1) + 0.15, -300, 120], [wt(5, 3), 150, 260], [there - 0.1, 0, 0]]
      xk = [[t0, CX + stops[0][1]]] + stops[1..].map { |t, x, _| [t, CX + x, "inOutCubic"] }
      yk = [[t0, CY0 + stops[0][2]]] + stops[1..].map { |t, _, y| [t, CY0 + y, "inOutCubic"] }
      e = v(35.4)
      @nodes << { type: "reticle", radius: 70, color: COOL, start: f(t0), end: f(e), glow: 6, glowCore: 0.4,
                  tracks: { x: xk, y: yk, opacity: [[t0, 0], [t0 + 0.2, 1], [e - 0.6, 1], [e, 0]], rotation: [[t0, 0], [there, 1.6, "outCubic"]] } }
      @nodes << ring(there, r: 12, to: 7, color: GOLD, x: CX, y: CY0, dur: 0.9)
      event(:lock, there)
    end

    # zero-g checklist
    def checklist
      s = v(35.2)
      care = wt(6, 7)
      e = v(44.7)
      kids = [{ type: "rect", x: -210, y: -270, width: 420, height: 540, radius: 18, fill: DISC, stroke: PAPER, strokeWidth: 3, boil: 1.3, seed: 4, boilRate: 8 },
              { type: "rect", x: -70, y: -292, width: 140, height: 46, radius: 8, fill: HOT, stroke: PAPER, strokeWidth: 2.5, boil: 1.0, seed: 5, boilRate: 8 }]
      [[0, wt(6, 2), wtext(6, 2)], [1, wt(6, 5), wtext(6, 5)]].each do |row, t, label|
        y = -110 + row * 170
        kids << { type: "rect", x: -150, y: y - 38, width: 76, height: 76, fill: nil, stroke: PAPER, strokeWidth: 4, boil: 1.3, seed: 8 + row, boilRate: 8 }
        kids << path([["M", -138, y], ["L", -116, y + 28], ["L", -68, y - 50]], fill: nil, stroke: GOLD, strokeWidth: 9, start: f(t), glow: 8, glowCore: 0.4, tracks: { trimEnd: [[t, 0], [t + 0.22, 1, "outCubic"]] })
        kids << text(label, size: 72, x: -46, y: y + 24, align: "left")
        event(:tick, t)
      end
      @nodes << group(kids, start: f(s), end: f(e),
                            tracks: { x: [[s, -280], [s + 1.1, 370, "outCubic"], [care, 360], [e, -340, "inCubic"]],
                                      y: sample(s, e, 1 / 6.0) { |t| (CY0 - 10 + 14 * Math.sin((t - s) * 1.1) + 260 * smooth((t - care) / (e - care))).round(1) },
                                      rotation: [[s, -0.28], [s + 1.1, -0.05, "outCubic"], [care, 0.04], [e, 0.9, "inCubic"]] })
      event(:drift, care)
    end

    # ---------------------------------------------------------------- rocket
    def rocket_pos(t)
      a = -2.4 + 0.42 * [t - v(35.4), 0].max + 0.32 * smooth((t - v(44.9)) / 2.0) * [t - v(44.9), 0].max
      rr = r_px(t) + 150
      ox = cx(t) + rr * Math.cos(a)
      oy = CY0 + rr * 0.72 * Math.sin(a)
      rot = Math.atan2(rr * 0.72 * Math.cos(a), -rr * Math.sin(a)) + Math::PI / 2
      k = smooth((t - v(55.0)) / 1.3)
      close = smooth((t - v(56.0)) / 2.4)
      s = 1.0 + close * 5.2
      target_y = CY0 - 70 * (1 - close) + 46 * s
      [ox + (CX - ox) * k, oy + (target_y - oy) * k, wrap(rot) * (1 - k), s]
    end

    def wrap(a) = (a + Math::PI) % TAU - Math::PI

    def rocket
      s, e = v(35.4), DURATION
      body = [["M", 0, -190], ["C", 80, -120, 92, 10, 72, 130], ["L", -72, 130], ["C", -92, 10, -80, -120, 0, -190], ["Z"]]
      kids = []
      flame = 3.times.map do |i|
        keys = sample(s, e, 1 / 12.0) { |t| (t * 12).floor % 3 == i ? 1 : 0 }.map { |t, o| [t, o, "hold"] }
        len = [70, 104, 86][i]
        { type: "polygon", points: [[-36, 134], [36, 134], [rnd(-8, 8), 134 + len]], fill: i == 1 ? GOLD : HOT, tracks: { opacity: keys } }
      end
      kids.concat flame
      kids << { type: "polygon", points: [[-70, 60], [-128, 150], [-64, 128]], fill: HOT, stroke: PAPER, strokeWidth: 3, boil: 1.0, seed: 21, boilRate: 8 }
      kids << { type: "polygon", points: [[70, 60], [128, 150], [64, 128]], fill: HOT, stroke: PAPER, strokeWidth: 3, boil: 1.0, seed: 22, boilRate: 8 }
      kids << path(body, fill: DISC, stroke: PAPER, strokeWidth: 3.5, boil: 1.0, seed: 23, boilRate: 8)
      kids << { type: "circle", radius: 48, fill: GOLD, stroke: PAPER, strokeWidth: 4, x: 0, y: -46 }
      kids << { type: "circle", radius: 5.2, fill: NIGHT, x: -15, y: -56 }
      kids << { type: "circle", radius: 5.2, fill: NIGHT, x: 15, y: -56 }
      kids << path([["M", -14, -34], ["Q", 0, -24, 14, -34]], fill: nil, stroke: NIGHT, strokeWidth: 2.4)
      samples = sample(s, e) { |t| rocket_pos(t) }
      @rocket_node = group(kids, start: f(s), end: e,
                                 tracks: { x: [[s, -300]] + samples.select { |t, _| t >= s + 1.2 }.map { |t, p| [t, p[0].round(2)] }.then { |a| a[0] << "outCubic"; a },
                                           y: [[s, 1250]] + samples.select { |t, _| t >= s + 1.2 }.map { |t, p| [t, p[1].round(2)] }.then { |a| a[0] << "outCubic"; a },
                                           rotation: [[s, 0.9]] + samples.select { |t, _| t >= s + 1.2 }.map { |t, p| [t, p[2].round(4)] },
                                           scaleX: samples.map { |t, p| [t, p[3].round(4)] }, scaleY: samples.map { |t, p| [t, p[3].round(4)] } })
    end

    def trail
      s, e = v(44.0), v(55.0)
      pts = sample(s, e, 1 / 6.0) { |t| rocket_pos(t)[0..1].map { |x| x.round(1) } }.map(&:last)
      @nodes << { type: "spline", points: pts, fill: nil, stroke: GOLD, strokeWidth: 2, dash: [10, 12], glow: 7, glowCore: 0.5, start: f(s), end: f(v(56.0)),
                  tracks: { trimEnd: [[s, 0], [e, 1]], opacity: [[v(55.0), 1], [v(56.0), 0]] } }
    end

    # ---------------------------------------------------------------- big words
    def slam(str, t, stop, size:, fill: PAPER, echo: HOT, x: CX, y: CY0)
      base = y + size * 0.4
      kids = 4.downto(1).map do |i|
        text(str, font: IMPACT, size: size, x: x, y: base + 0.09 * size * i, fill: nil, outline: echo, outlineWidth: [size / 90.0, 2].max, opacity: (1 - i / 5.0) * 0.9, start: f(t + i / GRID))
      end
      hit = group(kids + [text(str, font: IMPACT, size: size, x: x, y: base, fill: fill)], start: f(t), end: f(stop), x: x, y: y, anchor: [x, y], entrance: "slam")
      push = [[f(t), 1.0], [f(stop), 1.05]]
      @nodes << group([hit], start: f(t), end: f(stop), x: x, y: y, anchor: [x, y], tracks: { scaleX: push, scaleY: push })
      event(:word, t, word: str)
    end

    def chorus
      ten, mil, up = wt(7, 2), wt(7, 3), wt(7, 4)
      slam(wtext(7, 2), ten, mil, size: 330)
      slam(wtext(7, 3).delete(",").upcase, mil, up, size: 340, fill: GOLD, echo: PAPER)
      accent(ten, 26)
      accent(mil, 18)
      # UP rises for the whole held note
      in_t = wt(7, 5)
      @nodes << text(wtext(7, 4).upcase, font: IMPACT, size: 300, x: CX, y: 0, fill: PAPER, start: f(up), end: f(in_t + 0.3),
                                         tracks: { y: [[up, CY0 + 340], [in_t, CY0 - 60, "outCubic"], [in_t + 0.3, -60, "inCubic"]], opacity: [[in_t, 1], [in_t + 0.3, 0]] })
      accent(up, 14)
      event(:word, up, word: "up")
      # the rest of the line goes round the world
      sky_end = v(54.7)
      phrase = (5..7).map { |i| wtext(7, i).upcase }.join(" ")
      ring_r = ->(t) { r_px(t) + 36 }
      @nodes << { type: "textpath", text: "#{phrase}  ·  " * 3, font: IMPACT, size: 62, radius: ring_r.(v(52.0)).round(1), fill: GOLD, tracking: 3, x: CX, y: CY0,
                  start: f(in_t), end: f(sky_end), tracks: { offset: [[in_t, 0], [sky_end, 430]], opacity: [[in_t, 0], [in_t + 0.25, 1], [sky_end - 0.4, 1], [sky_end, 0]] } }
      kicks(ten, v(55.0)).each { |t| @nodes << ring(t, r: r_px(t) + 4, to: 1.7, color: COOL, x: CX, y: CY0, dur: 0.9, width: 2) }
      (19..24).each { |n| t = bar(n); @nodes << ring(t, r: r_px(t) + 4, to: 2.1, color: GOLD, x: CX, y: CY0, dur: 1.2, width: 1.5); accent(t, 8) if t > up }
    end

    # ---------------------------------------------------------------- the tear
    def tear
      have, cry = wt(8, 5), wt(8, 7)
      s_close = 1.0 + 5.2
      ex = CX - 15 * s_close
      ey = CY0 + 46 * s_close + (-56 + 16) * s_close
      e = DURATION
      shape = [["M", 0, -26], ["C", 16, -4, 20, 12, 0, 22], ["C", -20, 12, -16, -4, 0, -26], ["Z"]]
      xk = sample(cry, e, 1 / 12.0) { |t| (ex - 120 * (t - cry) + 26 * Math.sin((t - cry) * 2.3)).round(1) }
      yk = sample(cry, e, 1 / 12.0) { |t| (ey - 330 * smooth((t - cry) / 2.1)).round(1) }
      @nodes << path(shape, fill: COOL, stroke: NIGHT, strokeWidth: 2.5, start: f(have), end: e,
                            tracks: { x: [[have, ex]] + xk, y: [[have, ey - 8], [cry, ey, "inOutCubic"]] + yk[1..],
                                      scaleX: [[have, 0.05], [cry, 1.8, "outCubic"]], scaleY: [[have, 0.05], [cry, 1.8, "outCubic"]],
                                      rotation: sample(cry, e, 1 / 12.0) { |t| (-0.45 * (t - cry)).round(3) }.unshift([have, 0]).uniq(&:first) })
      event(:tear, cry)
    end

    # ---------------------------------------------------------------- hud and lyric lines, outside the camera
    def comma(n) = n.to_s.reverse.scan(/\d{1,3}/).join(",").reverse

    def odometer
      steps = sample(v(27.3), v(30.42), 1 / 12.0) { |t| (1000 * smooth((t - v(27.3)) / (v(30.42) - v(27.3)))**1.7).round }
      steps += [[v(30.46), 1000]]
      steps += sample(v(43.8), v(44.9), 1 / 12.0) { |t| (1000 + 9000 * smooth((t - v(43.8)) / 1.1)).round }
      steps << [v(44.95), 10_000]
      steps.each_cons(2) do |(t, n), (t2, _)|
        @top << text(comma(n), font: MONO, size: 58, x: 96, y: 104, align: "left", fill: n >= 10_000 ? GOLD : PAPER, start: f(t), end: f(t2))
      end
      @top << text(comma(10_000), font: MONO, size: 58, x: 96, y: 104, align: "left", fill: GOLD, start: f(steps.last[0]), end: f(v(61.6)))
      word_miles = @lines[4]["words"][3]["w"]
      @top << text(word_miles, font: HAND, size: 40, x: 96, y: 156, align: "left", fill: PAPER, start: f(v(27.3)), end: f(v(61.6)))
      event(:count, v(27.3), until: v(30.42))
      event(:count, v(43.8), until: v(44.9))
    end

    def lyric(line, from_i, to_i, stop, y: H - 74, size: 66, plate: false)
      words = @lines[line]["words"][from_i..to_i]
      str = words.map { |x| x["w"] }.join(" ")
      adv = JSON.parse(File.read(File.join(WORK, "hand-widths.json")))
      width = ->(z) { z.chars.sum { |c| adv.fetch(c, 0.5) } }
      full = width.(str)
      keys = []
      prefix = ""
      words.each do |x|
        prefix += (prefix.empty? ? "" : " ") + x["w"]
        # the gap after a word stays hidden; a little over the word's end so its last stroke is whole
        keys << [v(x["s"]), [(width.(prefix) + 0.09) / full, 1.0].min.round(4), "hold"]
      end
      first = keys[0][0]
      keys[0] = [first, keys[0][1]]
      if plate
        wide = full * size + 56
        @top << { type: "rect", x: CX - wide / 2, y: y - size * 0.82, width: wide, height: size * 1.16, radius: 18, fill: DISC, opacity: 0.86, start: f(first), end: f(stop) }
      end
      @top << text(str, size: size, x: CX, y: y, start: f(first), end: f(stop), reveal: keys)
    end

    def lyrics
      lyric(4, 0, 7, wt(5, 0))
      lyric(5, 0, 5, wt(5, 5) + 2.2)
      lyric(6, 0, 7, wt(6, 7) + 1.5)
      lyric(7, 0, 1, wt(7, 3))
      lyric(8, 0, 2, wt(8, 3), plate: true)
      lyric(8, 3, 7, v(62.1), plate: true)
    end

    def camera(children)
      xs, ys, ss = [[-1, CX]], [[-1, CY]], [[-1, 1.0]]
      kept = @accents.sort_by(&:first).each_with_object([]) { |h, out| out << h if out.empty? || h[0] >= out.last[0] + 8 / 24.0 }
      kept.each do |t, amp|
        t0 = f(t)
        8.times do |j|
          a = amp * (1 - j / 8.0)**2
          xs << [t0 + j / 24.0, CX + (j == 7 ? 0 : rnd(-a, a)), "hold"]
          ys << [t0 + j / 24.0, CY + (j == 7 ? 0 : rnd(-a, a)), "hold"]
        end
        ss << [t0, 1.0, "hold"] if t0 > ss.last[0]
        ss << [t0 + 0.01, 1.0 + amp / 600.0, "hold"]
        ss << [t0 + 6 / 24.0, 1.0, "outCubic"]
      end
      group(children, x: CX, y: CY, anchor: [CX, CY], tracks: { x: xs, y: ys, scaleX: ss, scaleY: ss })
    end

    def beat_phase(times) = times.each_cons(2).flat_map { |a, b| [[a, 0], [b - 0.001, 1]] }

    def build
      @nodes << full(NIGHT, 0, DURATION)
      beats = @beats.map(&:first).select { |t| t >= v(29.0) && t <= DURATION + 0.5 }
      @nodes << { type: "shader", shader: "starfield", x: -120, y: -120, width: W + 240, height: H + 240, center: [CX + 120, CY + 120], seed: 11,
                  colors: [PAPER, GOLD, COOL], stars: 0.85, twinkle: 0.5, pulse: 0.55, drift: 0.25, start: f(v(29.0)), end: DURATION,
                  tracks: { beat: beat_phase(beats), brightness: [[v(29.0), 0], [v(31.0), 0.85, "smooth"]] } }
      world
      globe
      home_dot
      reticle
      checklist
      trail
      rocket
      @nodes << @rocket_node
      chorus
      tear
      odometer
      lyrics
      @nodes << full(NIGHT, DURATION - 0.7, DURATION, tracks: { opacity: [[DURATION - 0.7, 0], [DURATION - 0.05, 1, "smooth"]] })
      event(:section, 0, name: "pullback")
      event(:section, v(35.2), name: "checklist")
      event(:section, wt(7, 2), name: "chorus", big: true, neon: true)
      event(:section, wt(8, 2), name: "porthole")
      {
        version: 1, background: NIGHT,
        fonts: %w[bradley.ttf impact.ttf andale-mono.ttf].map { |n| "../tools/graphics/fonts/#{n}" },
        nodes: [camera(@nodes)] + @top,
        effects: [{ name: "CIBloom", parameters: { inputRadius: 8, inputIntensity: 0.25 } }]
      }
    end

    def events = { song_start: SONG_START, duration: DURATION, events: @events.sort_by { |e| e[:t] } }
  end
end

builder = Miles::Builder.new
doc = builder.build
out = File.join(Miles::ROOT, "scenes", "miles.json")
File.write(out, JSON.generate(doc))
File.write(File.join(Miles::ROOT, "scenes", "miles.events.json"), JSON.pretty_generate(builder.events))
puts JSON.generate(path: out, bytes: File.size(out), frames: (Miles::DURATION * Miles::GRID).round)
