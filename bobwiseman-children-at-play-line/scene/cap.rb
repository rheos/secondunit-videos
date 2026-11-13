# Look test: Children at Play, verse 1 (song 0:00 to 0:39), in the night-sky line look (looks/swift-line.yaml),
# drawn by makevoid's native Swift renderer. One continuous camera: the mother at the lit kitchen window, out across
# the yard as she searches, then in to the barn and up to the hay door, where two gold lights sit close together.
# No sung words on screen. Writes work/mv/scenes/cap.json and cap.events.json.
#
#   ruby scene/cap.rb
#   work/mv/tools/graphics/.build/release/mgraphics work/mv/scenes/cap.json --out out/stills --frames 937 --only 192,654,864 --supersample 2
require_relative "kit"

module Cap
  include Kit
  ROOT = File.expand_path("../work/mv", __dir__)
  DURATION = 39.0
  GRID = 24.0
  NF = (DURATION * GRID).round + 1

  # song seconds = video seconds (the test starts at 0:00); beats from BRIEF.md, snapped to the vocal stem
  LAUGH1, OUT, HEARS, LAUGH2, WALK = 1.50, 7.34, 25.39, 26.98, 33.39

  # where she walks: [start, end, from x, to x]; she is inside the kitchen until 6.9
  MOVES = [[6.0, 6.9, -2.25, 0.4], [6.9, 7.34, 0.4, 1.7], [7.34, 7.9, 1.7, 2.75], [9.0, 10.6, 2.75, 4.6],
           [13.2, 15.4, 4.6, 8.4], [18.0, 20.8, 8.4, 14.2], [WALK, 35.7, 14.2, 18.6]].freeze
  INSIDE_UNTIL = 6.95

  # where she looks: [from, to, target(t), label]
  LOOKS = [
    [7.75, 8.95, ->(t) { u = ((t - 7.75) / 1.2).clamp(0, 1); u = u * u * (3 - 2 * u); [3.45 + 1.3 * u, -0.85 + 0.3 * u] }],
    [10.75, 13.1, ->(t) { u = ((t - 10.75) / 2.35).clamp(0, 1); [5.95 + 1.4 * u, -1.35 - 0.05 * Math.sin(u * 3)] }],
    [15.55, 17.95, ->(_t) { [9.85, -0.55] }],
    [21.4, HEARS, ->(t) { u = ((t - 21.4) / 4.0).clamp(0, 1); [13.3 - 1.1 * Math.sin(u * Math::PI), -0.95 - 0.25 * Math.sin(u * Math::PI)] }],
    [LAUGH2, DURATION + 0.1, ->(_t) { BARN_DOOR }]
  ].freeze

  class Builder
    include Kit

    def initialize
      @world, @over, @top, @events = [], [], [], []
      @rng = Random.new(1939)
      camera_table
    end

    # ---------------------------------------------------------------- clock and helpers
    def f(t) = (t * GRID + 1e-6).floor / GRID
    def fi(t) = (t * GRID + 1e-6).floor.clamp(0, NF - 1)
    def smooth(u) = (u = u.clamp(0.0, 1.0); u * u * (3 - 2 * u))
    def rnd(a, b) = a + @rng.rand * (b - a)
    def event(kind, t, **kw) = @events << { kind: kind, t: t.round(4), **kw }
    def frames(s, e) = (fi([s, 0].max)..[fi(e) + 1, NF - 1].min)
    def keys(s, e, step = 1) = frames(s, e).step(step).map { |i| [(i / GRID).round(5), yield(i, i / GRID)] }
    def group(children, **kw) = { type: "group", children: children }.merge(kw)
    def path(cmds, **kw) = { type: "path", commands: cmds }.merge(kw)

    # trapezoid walk: accelerate, stride, settle
    def trap(u, a = 0.2)
      u = u.clamp(0.0, 1.0)
      v = 1 / (1 - a)
      return v * u * u / (2 * a) if u < a
      return 1 - v * (1 - u)**2 / (2 * a) if u > 1 - a
      v * (a / 2 + (u - a))
    end

    # ---------------------------------------------------------------- the mother
    def mx(t)
      x = MOVES[0][2]
      MOVES.each do |s, e, a, b|
        return x if t < s
        return a + (b - a) * trap((t - s) / (e - s)) if t < e
        x = b
      end
      x
    end

    def moving?(t) = MOVES.any? { |s, e, a, b| t > s + 0.04 && t < e - 0.04 }
    def facing(t) = (t >= 21.3 && t < LAUGH2) ? -1 : 1
    def look_at(t) = LOOKS.find { |s, e, _| t >= s && t < e }
    def eye(t) = [mx(t) + 0.05 * facing(t), -1.56]

    def pose(t)
      return :sink if t < 6.0
      if moving?(t)
        d = (mx(t) - MOVES[0][2]).abs
        return %i[walk_a pass walk_b pass][(d / 0.3).floor % 4]
      end
      return :stand if t >= HEARS && t < LAUGH2
      look_at(t) ? :look : :stand
    end

    def mother_layers
      sw = width_track(1.9)
      poses = %i[sink stand look walk_a walk_b pass]
      by_frame = (0...NF).map { |i| pose(i / GRID) }
      flip = keys(0, DURATION) { |i, t| facing(t) }
      xs = keys(0, DURATION) { |i, t| mx(t).round(4) }
      inside = poses.map do |p|
        group([path(mother(p), fill: nil, stroke: NIGHT, strokeWidth: 3, tracks: { strokeWidth: width_track(3.2) })],
              start: 0, end: f(INSIDE_UNTIL), tracks: { opacity: hold_keys(by_frame, p, 0, INSIDE_UNTIL) })
      end
      outside = poses.map do |p|
        group([path(mother(p), fill: nil, stroke: PAPER, strokeWidth: 2, tracks: { strokeWidth: sw })],
              start: f(OUT), end: DURATION + 0.1, tracks: { opacity: hold_keys(by_frame, p, OUT, DURATION + 0.1) })
      end
      @mother_inside = group(inside, tracks: { x: xs, scaleX: flip.map { |t, v| [t, v, "hold"] } })
      @mother_outside = group(outside, tracks: { x: xs, scaleX: flip.map { |t, v| [t, v, "hold"] } })
      last = nil
      (0...NF).each do |i|
        p = by_frame[i]
        event(:step, i / GRID) if %i[walk_a walk_b].include?(p) && p != last && i / GRID >= OUT
        last = p
      end
    end

    # opacity 1 on frames where the pose is p, else 0, as hard cuts
    def hold_keys(by_frame, p, s, e)
      out = []
      prev = nil
      frames(s, e).each do |i|
        v = by_frame[i] == p ? 1 : 0
        next if v == prev
        out << [(i / GRID).round(5), v, "hold"]
        prev = v
      end
      out[0] = out[0][0..1]
      out << [e, prev] if out.size == 1
      out
    end

    # ---------------------------------------------------------------- the one camera: (focus x, focus y, px per metre)
    def mxs(t) = (-6..6).sum { |k| mx(t + k * 0.1) } / 13.0

    def camera_table
      open0, open1 = [-2.25, -1.033, 147.0], [-2.25, -1.033, 152.0]
      wide = [10.8, -5.3, 56.0]
      follow = ->(t) { [mxs(t) + 3.2, -4.4, 72.0] }
      b1, b2 = [17.3, -4.3, 80.0], [17.8, -4.2, 86.0]
      near, final = [20.0, -3.25, 146.0], [20.0, -3.25, 150.0]
      ks = [[0, open0], [LAUGH1, open1], [6.7, wide], [8.9, wide], [11.2, follow], [24.8, follow], [26.9, b1], [WALK - 0.1, b2],
            [36.3, near], [DURATION + 0.5, final]]
      at = lambda do |t|
        a, b = ks.each_cons(2).find { |x, y| t <= y[0] } || ks.last(2)
        pa = a[1].respond_to?(:call) ? a[1].call(t) : a[1]
        pb = b[1].respond_to?(:call) ? b[1].call(t) : b[1]
        u = smooth((t - a[0]) / (b[0] - a[0]))
        [pa[0] + (pb[0] - pa[0]) * u, pa[1] + (pb[1] - pa[1]) * u, Math.log(pa[2]) + (Math.log(pb[2]) - Math.log(pa[2])) * u]
      end
      raw = (-12...(NF + 12)).map { |i| at.call([i / GRID, 0].max) }
      @cam = (0...NF).map do |i|
        win = raw[i, 25]
        fx = win.sum { |r| r[0] } / 25.0
        fy = win.sum { |r| r[1] } / 25.0
        lz = win.sum { |r| r[2] } / 25.0
        [fx, fy, Math.exp(lz)]
      end
    end

    def z(i) = @cam[i][2]
    def scr(wx, wy, i) = [CX + (wx - @cam[i][0]) * @cam[i][2], CY + (wy - @cam[i][1]) * @cam[i][2]]
    def width_track(px) = keys(0, DURATION, 2) { |i, _| (px / z(i)).round(5) }

    # ---------------------------------------------------------------- the world (metres, inside the camera group)
    def line(cmds, px, color = PAPER, **kw) = path(cmds, fill: nil, stroke: color, strokeWidth: px / 100.0, tracks: { strokeWidth: width_track(px) }, **kw)
    def solid(cmds, fill, px = nil, color = PAPER, **kw)
      n = path(cmds, fill: fill, stroke: px ? color : nil, strokeWidth: (px || 1) / 100.0, **kw)
      n[:tracks] = { strokeWidth: width_track(px) } if px
      n
    end

    def set
      h, wl, tr, fe, b = house, washing_line, tree, fence, barn
      w = @world
      w << path(rect(-80, 0, 120, 40), fill: EARTH)
      w << line(field_grass, 1.2, DIM)
      # barn, then the hay door's inside: dark loft, a warm glow round the two of them, bales, faint shoulders
      w << solid(b[:wall], NIGHT, 2.4)
      w << line(b[:boards], 1.0, FAINT)
      w << solid(b[:hay], LOFT)
      w << group([{ type: "circle", radius: 1.15, x: 20.0, y: -4.45, fill: nil,
                    gradient: { colors: ["#FFC5312A", "#FFC53100"], center: [0, 0], radius: 1.15 } }],
                 clip: [HAYDOOR[:x0], HAYDOOR[:y0], HAYDOOR[:x1] - HAYDOOR[:x0], HAYDOOR[:y1] - HAYDOOR[:y0]])
      w << line(b[:bales], 1.2, DIM)
      w << line(loft_shoulders, 1.5, "#F2E8D580")
      w << line(b[:hay], 2.4)
      w << line(b[:leaves], 1.4, DIM)
      w << line(b[:roof], 2.4)
      w << line(b[:louvre], 1.4)
      w << line(b[:door], 1.8)
      w << line(ladder, 1.6)
      w << line(hat, 1.6)
      w << line(shoes, 1.5)
      # fence at the field's edge, the tree and its empty swing, the washing line
      w << line(fe[:posts] + fe[:rails], 1.8)
      w << line(tr[:crown], 1.6, DIM)
      w << line(tr[:trunk] + tr[:branch], 1.8)
      sway = keys(0, DURATION, 3) { |_, t| (0.05 * Math.sin(t * 1.3) + 0.025 * Math.sin(t * 2.9 + 1)).round(4) }
      w << group([line(swing, 1.6)], x: SWING_PIVOT[0], y: SWING_PIVOT[1], tracks: { rotation: sway })
      w << line(wl[:posts] + wl[:line], 1.6)
      w << group([line(wl[:sheets], 1.6), line(wl[:pins], 1.4)],
                 x: 6.7, y: -1.98, anchor: [6.7, -1.98], tracks: { skewX: keys(0, DURATION, 3) { |_, t| (0.06 * Math.sin(t * 1.1)).round(4) } })
      # the house: lit kitchen window with her inside it, then the wall over her
      win = rect(KITCHEN[:x0], KITCHEN[:y0], KITCHEN[:x1], KITCHEN[:y1])
      w << solid(win, PAPER)
      w << @mother_inside
      w << path(h[:wall] + win + rect(1.2, -2.1, 2.2, 0), fill: NIGHT, evenOdd: true)
      w << line(h[:siding], 0.9, FAINT)
      w << line(h[:wall], 2.4)
      w << line(seg(-3.0, -1.86, -1.5, -1.86), 4.0, NIGHT)
      w << line(win, 3.0)
      w << line(seg(-3.15, -0.95, -1.35, -0.95), 2.0)
      w << line(h[:roof] + h[:chimney], 2.4)
      w << line(h[:upstairs], 1.6)
      # the doorway: dark until she opens the door at 7.0, then lamplight spills out
      w << solid(rect(1.2, -2.1, 2.2, 0), "#F2E8D5", nil, PAPER, start: f(7.0), tracks: { opacity: [[7.0, 0], [7.3, 0.85, "outCubic"]] })
      w << group([line(rect(0, -2.1, 1.0, 0) + seg(0.82, -1.05, 0.88, -1.05), 1.8)], x: 1.2, y: 0, anchor: [0, 0],
                 tracks: { scaleX: [[7.0, 1.0], [7.35, 0.18, "outCubic"]] })
      event(:door, 7.0)
      w << line(h[:porch], 1.8)
      w << line(h[:bench], 1.6)
      w << line(ground, 2.0)
      w << line(grass_ticks, 1.2, DIM)
      w << @mother_outside
    end

    def world_group
      xs = keys(0, DURATION) { |i, _| (CX - @cam[i][0] * z(i)).round(3) }
      ys = keys(0, DURATION) { |i, _| (CY - @cam[i][1] * z(i)).round(3) }
      ss = keys(0, DURATION) { |i, _| z(i).round(5) }
      group(@world, x: CX, y: CY, anchor: [0, 0], tracks: { x: xs, y: ys, scaleX: ss, scaleY: ss })
    end

    # ---------------------------------------------------------------- screen-space marks pinned to the world
    def pin_tracks(s, e, step = 1, &world_pt)
      xs = keys(s, e, step) { |i, t| scr(*world_pt.call(t), i)[0].round(2) }
      ys = keys(s, e, step) { |i, t| scr(*world_pt.call(t), i)[1].round(2) }
      { x: xs, y: ys }
    end

    # the two of them: two gold lights at standing head height, close together, swelling a little on each laugh
    def lovers
      e = DURATION + 0.1
      [[YOU_HEAD, HEAD_R[:you], 0.0], [ME_HEAD, HEAD_R[:me], 1.7]].each do |(hx, hy), r, ph|
        sway = ->(t) { [hx + 0.012 * Math.sin(t * 0.9 + ph), hy + 0.008 * Math.sin(t * 1.3 + ph)] }
        size = keys(0, e) { |i, t| ([6.0, r * z(i)].max * (1 + 0.28 * swell(t))).round(3) }
        halo = size.map { |t, v| [t, (v * 2.0).round(3)] }
        tr = pin_tracks(0, e) { |t| sway.call(t) }
        @over << group([{ type: "circle", radius: 1, fill: "#FFC53126", tracks: { scaleX: halo, scaleY: halo } },
                        { type: "circle", radius: 1, fill: GOLD, glow: 5, glowCore: 0.5, tracks: { scaleX: size, scaleY: size, glow: size.map { |t, v| [t, (13.0 / v).round(4)] } } }],
                       start: 0, end: e, tracks: tr)
      end
    end

    def swell(t) = @bursts.sum { |b, n| d = t - b; d < 0 || d > 1.6 ? 0 : [n / 7.0, 1].min * Math.exp(-d * 2.6) * smooth(d / 0.08) }.clamp(0, 1.2)

    # ---------------------------------------------------------------- laughter: hot line marks that rise from the hay door
    MARKS = [
      [["M", -9, -2], ["Q", 0, 9, 9, -2]],
      [["M", -6, -6], ["L", -3, 4], ["M", 3, -7], ["L", 6, 3]],
      [["M", -10, 4], ["C", -4, 4, -3, -8, 0, -6], ["C", 3, -4, -3, 4, 10, -1]],
      [["M", -8, 0], ["Q", -4, -7, 0, 0], ["Q", 4, 7, 8, 0]]
    ].freeze

    def make_bursts
      list = [[LAUGH1, 7], [HEARS, 4], [LAUGH2, 8], [WALK, 4], [36.0, 5], [37.4, 5]]
      # rings only where the laugh reaches her: the window at 1.5 (she doesn't hear), the fence at 25.4 and 27.0 (she does)
      @rings = { LAUGH1 => :big, HEARS => :reach, LAUGH2 => :big }
      t = 2.9
      while t < DURATION - 1
        list << [t.round(3), 2 + @rng.rand(2)] unless list.any? { |b, _| (b - t).abs < 0.6 }
        t += rnd(1.1, 1.8)
      end
      @bursts = list.sort_by(&:first)
    end

    def laughter
      @bursts.each do |t0, n|
        event(:laugh, t0, size: n)
        ring(t0, @rings[t0]) if @rings[t0]
        n.times do |k|
          s = t0 + k * 0.07
          life = rnd(6.5, 8.2)
          e = [s + life, DURATION + 0.1].min
          x0, y0 = (@rng.rand < 0.5 ? rnd(19.3, 19.6) : rnd(20.4, 20.7)), rnd(-4.7, -4.25)
          vx, vy = rnd(-0.45, -0.1), rnd(-0.78, -0.48)
          ph, wob, size = rnd(0, TAU), rnd(0.08, 0.16), rnd(0.85, 1.2)
          at = ->(tt) { u = tt - s; [x0 + vx * u + wob * Math.sin(u * 2.2 + ph), y0 + vy * u - 0.12 * smooth(u / 0.6)] }
          tr = pin_tracks(s, e) { |tt| at.call(tt) }
          tr[:rotation] = keys(s, e, 2) { |_, tt| (0.35 * Math.sin((tt - s) * 1.4 + ph)).round(3) }
          tr[:opacity] = [[s, 0], [s + 0.45, 1, "outCubic"]] + (s + life > DURATION ? [] : [[e - 2.4, 0.9], [e, 0, "inCubic"]])
          tr[:scaleX] = [[s, 0.3 * size], [s + 0.35, size, "outBack"]]
          tr[:scaleY] = tr[:scaleX]
          @over << path(MARKS[@rng.rand(MARKS.size)], fill: nil, stroke: HOT, strokeWidth: 2.3, glow: 7, glowCore: 0.45, start: f(s), end: e, tracks: tr)
        end
      end
    end

    # each laugh sends a thin hot ring out from the hay door; the big ones cross the whole farm
    def ring(t0, kind)
      rmax, dur, alpha = kind == :big ? [34.0, 2.3, 0.85] : [13.0, 1.7, 0.6]
      s, e = t0 - 0.12, t0 + dur
      rad = ->(t) { 0.35 + (rmax - 0.35) * (1 - (1 - ((t - s) / dur).clamp(0, 1))**3) }
      tr = pin_tracks(s, e) { |_| [20.0, -4.2] }
      sc = keys(s, e) { |i, t| (rad.call(t) * z(i) / 100.0).round(4) }
      tr[:scaleX] = sc
      tr[:scaleY] = sc
      tr[:strokeWidth] = sc.map { |t, v| [t, (1.7 / v).round(5)] }
      tr[:glow] = sc.map { |t, v| [t, (7.0 / v).round(5)] }
      tr[:opacity] = [[s, alpha], [e, 0, "inCubic"]]
      @over << { type: "circle", radius: 100, fill: nil, stroke: HOT, strokeWidth: 1, glow: 7, glowCore: 0.4, start: f(s), end: e, tracks: tr }
      event(:ring, t0, radius: rmax)
    end

    # ---------------------------------------------------------------- her looking: a cool sight line and a reticle
    LMAX = 2400.0

    def sight
      LOOKS.each do |s, e, target|
        e = [e, DURATION + 0.1].min
        geo = lambda do |i, t|
          ex, ey = scr(*eye(t), i)
          tx, ty = scr(*target.call(t), i)
          [ex, ey, tx, ty, Math.atan2(ty - ey, tx - ex), Math.hypot(tx - ex, ty - ey)]
        end
        tr = { x: keys(s, e) { |i, t| geo.call(i, t)[0].round(2) }, y: keys(s, e) { |i, t| geo.call(i, t)[1].round(2) },
               rotation: keys(s, e) { |i, t| geo.call(i, t)[4].round(4) }, opacity: [[s, 0], [s + 0.12, 1], [e - 0.15, 1], [e, 0]] }
        trim = keys(s, e) { |i, t| (smooth((t - s) / 0.25) * [geo.call(i, t)[5] - 26, 0].max / LMAX).round(5) }
        @over << group([{ type: "line", points: [[0, 0], [LMAX, 0]], stroke: COOL, strokeWidth: 1.7, dash: [7, 8], glow: 6, glowCore: 0.4,
                          trimStart: 12 / LMAX, tracks: { trimEnd: trim } }], start: f(s), end: e, tracks: tr)
        rt = { x: keys(s, e) { |i, t| geo.call(i, t)[2].round(2) }, y: keys(s, e) { |i, t| geo.call(i, t)[3].round(2) },
               rotation: [[s, 0], [e, 0.9 * (e - s)]], opacity: [[s + 0.15, 0], [s + 0.35, 1], [e - 0.15, 1], [e, 0]] }
        rt[:scaleX] = keys(s, e, 3) { |i, _| (z(i) / 100.0).clamp(0.5, 1.0).round(3) }
        rt[:scaleY] = rt[:scaleX]
        @over << { type: "reticle", radius: 15, color: COOL, glow: 6, glowCore: 0.4, start: f(s + 0.15), end: e, tracks: rt }
        event(:look, s)
      end
    end

    # ---------------------------------------------------------------- small labelled objects
    def label(text, at, t_in, t_out, cross: nil, dx: 44, dy: -46)
      e = [t_out, DURATION + 0.1].min
      kids = [{ type: "circle", radius: 3, fill: PAPER },
              { type: "line", points: [[0, 0], [dx * 0.86, dy * 0.86]], stroke: PAPER, strokeWidth: 1.3 },
              { type: "text", text: text, font: HAND, size: 30, x: dx + (dx.positive? ? 4 : -4), y: dy + 8, fill: PAPER, align: dx.positive? ? "left" : "right" }]
      if cross
        kids << { type: "line", points: [[-9, -9], [9, 9]], stroke: COOL, strokeWidth: 2.6, glow: 6, glowCore: 0.4, start: f(cross), tracks: { trimEnd: [[cross, 0], [cross + 0.14, 1]] } }
        kids << { type: "line", points: [[9, -9], [-9, 9]], stroke: COOL, strokeWidth: 2.6, glow: 6, glowCore: 0.4, start: f(cross + 0.12), tracks: { trimEnd: [[cross + 0.12, 0], [cross + 0.26, 1]] } }
        event(:cross, cross, what: text)
      end
      tr = pin_tracks(t_in, e) { |_| at }
      tr[:opacity] = [[t_in, 0], [t_in + 0.3, 1], [e - 0.6, 1], [e, 0]]
      @over << group(kids, start: f(t_in), end: e, tracks: tr)
    end

    def labels
      label("kitchen window", [KITCHEN[:x1], KITCHEN[:y0]], 0, 5.2)
      label("hay door", [HAYDOOR[:x1], HAYDOOR[:y0]], 3.6, DURATION + 0.1)
      label("porch", [3.3, -1.15], 7.6, WALK + 0.8, cross: 8.85, dx: 30, dy: -96)
      label("washing line", [7.75, -1.92], 10.6, WALK + 0.8, cross: 13.0, dx: 40, dy: -58)
      label("swing", [10.15, -0.55], 15.4, WALK + 0.8, cross: 17.85, dx: 40, dy: -64)
      label("field", [12.85, -1.25], 21.2, WALK + 0.8, cross: 24.9, dx: -34, dy: -104)
    end

    # ---------------------------------------------------------------- the readout: how far she is from the hay door
    def readout
      e = DURATION + 0.1
      val = ->(t) { ex, ey = eye(t); Math.hypot(HAY_C[0] - ex, HAY_C[1] - ey).round(1) }
      runs = []
      (0...NF).step(2).each do |i|
        v = val.call(i / GRID)
        runs.last && runs.last[1] == v ? nil : runs << [i / GRID, v]
      end
      runs.each_with_index do |(t, v), k|
        stop = runs[k + 1] ? runs[k + 1][0] : e
        @top << { type: "text", text: format("%.1f m", v), font: MONO, size: 58, x: 96, y: 112, align: "left", fill: PAPER, start: f(t), end: f(stop) }
      end
      @top.unshift({ type: "rect", x: 70, y: 46, width: 488, height: 138, radius: 16, fill: DISC, opacity: 0.86, start: 0, end: e })
      @top << { type: "text", text: "between her and the hay door", font: HAND, size: 34, x: 98, y: 160, align: "left", fill: PAPER, start: 0, end: e }
    end

    # ---------------------------------------------------------------- build
    def build
      make_bursts
      mother_layers
      set
      lovers
      laughter
      sight
      labels
      readout
      stars = { type: "shader", shader: "starfield", x: -120, y: -120, width: W + 240, height: H + 240, center: [CX + 120, CY + 120], seed: 7,
                colors: [PAPER, GOLD, COOL], stars: 0.55, twinkle: 0.45, pulse: 0.0, drift: 0.06, start: 0, end: DURATION + 0.1, tracks: { brightness: [[0, 0.5]] } }
      event(:section, 0, name: "kitchen")
      event(:section, OUT, name: "search")
      event(:hear, HEARS)
      event(:turn, LAUGH2)
      event(:section, WALK, name: "barn")
      event(:arrive, 35.7)
      {
        version: 1, background: NIGHT, fonts: FONTS,
        nodes: [stars, world_group] + @over + @top,
        effects: [{ name: "CIBloom", parameters: { inputRadius: 8, inputIntensity: 0.25 } }]
      }
    end

    def events = { song_start: 0.0, duration: DURATION, events: @events.sort_by { |e| e[:t] } }
  end
end

if $PROGRAM_NAME == __FILE__
  builder = Cap::Builder.new
  doc = builder.build
  out = File.join(Cap::ROOT, "scenes", "cap.json")
  File.write(out, JSON.generate(doc))
  File.write(File.join(Cap::ROOT, "scenes", "cap.events.json"), JSON.pretty_generate(builder.events))
  puts JSON.generate(path: out, mb: (File.size(out) / 1e6).round(1), frames: Cap::NF)
end
