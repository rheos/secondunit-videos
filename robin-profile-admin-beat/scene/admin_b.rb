# Test 02 of the "one administrator" beat: the same voice take, drawn as one huge plan under one flying camera.
# Picture timed from work/voice/words.json. Writes work/mv/scenes/adminb.json and adminb.events.json.
#
# Colour is the story: cool = the plan, gold = Robin and what is right, hot = the wrong assumption, paper = the build closing in.
require "json"

module AdminB
  WORK = File.expand_path("../work", __dir__)
  ROOT = File.join(WORK, "mv")
  W, H = 1920, 1080
  CX, CY = W / 2.0, H / 2.0
  GRID = 24.0
  DURATION = 19.68
  NIGHT, DISC, PAPER, GOLD, HOT, COOL = "#0A0E24", "#0D1636", "#F2E8D5", "#FFC531", "#FF5A1F", "#7FD6FF"
  HAND, IMPACT, MONO = "BradleyHandITCTT-Bold", "Impact", "AndaleMono"
  TAU = 2 * Math::PI
  RINGS = [[330, 8], [560, 14], [800, 22], [1060, 32], [1330, 44]].freeze # radius, modules
  USER_ROWS = [[1620, 150], [1700, 170], [1780, 190]].freeze
  SECTORS = 12
  FIG = [-2800, 900].freeze
  NODE_R = 170
  BUILD_STOP = 1500.0
  BARRIER = 1460.0

  class Builder
    def initialize
      @n, @top, @events, @accents = [], [], [], []
      @rng = Random.new(1000)
      @words = JSON.parse(File.read(File.join(WORK, "voice", "pro-01.words.json")))["words"]
    end

    # ---------------------------------------------------------------- clock and helpers
    def f(t) = (t * GRID + 1e-6).floor / GRID
    def w(word, nth = 0) = @words.select { |x| x["w"].downcase.delete('",.') == word }[nth]["s"]
    def event(kind, t, **kw) = @events << { kind: kind, t: t.round(4), **kw }
    def accent(t, amp) = (@accents << [t, amp]; event(:accent, t, amp: amp))
    def rnd(a, b) = a + @rng.rand * (b - a)
    def smooth(u) = (u = u.clamp(0.0, 1.0); u * u * (3 - 2 * u))
    def sample(s, e, step = 1 / GRID) = (0..((e - s) / step).ceil).map { |j| t = [s + j * step, e].min; [t.round(4), yield(t)] }.uniq(&:first)
    def group(kids, **kw) = { type: "group", children: kids }.merge(kw)
    def path(cmds, **kw) = { type: "path", commands: cmds, fill: nil }.merge(kw)
    def text(str, font: HAND, size: 50, x: CX, y: CY, fill: PAPER, align: "center", **kw) = { type: "text", text: str, font: font, size: size, x: x, y: y, fill: fill, align: align }.merge(kw)
    def fade(a, b, from = 0, to = 1) = [[a, from], [b, to]]
    def polar(r, a) = [r * Math.cos(a), r * Math.sin(a)]

    # ---------------------------------------------------------------- the one camera
    def cam_keys
      @cam_keys ||= begin
        whole_s, whole_e = w("to"), w("only")
        [[0.0, 2.6, FIG[0], FIG[1] + 30], [w("on") - 0.1, 2.25, FIG[0], FIG[1] + 30], [w("an") - 0.2, 0.42, -1500, 700], [w("took") + 0.1, 0.95, 0, 0],
         [whole_s, 1.14, 0, 0], [whole_e, 0.27, 0, 0], [w("the", 2), 0.31, 0, 0], [w("until") - 0.15, 0.29, 0, 0],
         [w("assumption") - 0.02, 1.55, 0, 0], [w("assumption") + 0.14, 1.55, 0, 0], [w("caught") - 0.1, 0.29, 0, 0], [w("and"), 0.3, 0, 0],
         [w("accounts") - 0.2, 0.235, 0, 260], [DURATION + 1, 0.22, 0, 300]]
      end
    end

    def cam_rot(t)
      dive, lock = w("until") - 0.15, w("assumption")
      0.05 * smooth(t / 10.0) + 0.3 * smooth((t - dive) / (lock - dive)) - 0.27 * smooth((t - lock - 0.14) / 1.0) + 0.04 * smooth((t - 15.9) / 3.5)
    end

    def cam(t)
      k = cam_keys
      return k[0][1..] if t <= k[0][0]
      a, b = k.each_cons(2).find { |_, y| t <= y[0] } || [k[-2], k[-1]]
      u = smooth((t - a[0]) / (b[0] - a[0]))
      [Math.exp(Math.log(a[1]) + u * (Math.log(b[1]) - Math.log(a[1]))), a[2] + u * (b[2] - a[2]), a[3] + u * (b[3] - a[3])]
    end

    def z(t) = cam(t)[0] * (1 + 0.006 * Math.sin(t * 1.3))

    # where a world point lands on screen at time t, for type and the reticle that must not tilt or scale
    def proj(wx, wy, t)
      s, fx, fy = z(t), *cam(t)[1..]
      r = cam_rot(t)
      dx, dy = (wx - fx) * s, (wy - fy) * s
      [CX + dx * Math.cos(r) - dy * Math.sin(r), CY + dx * Math.sin(r) + dy * Math.cos(r)]
    end

    # stroke held at `px` on screen while the world scales under it
    def px(val)
      @px ||= {}
      @px[val] ||= sample(0, DURATION, 1 / 8.0) { |t| (val / z(t)).round(3) }
    end

    # ---------------------------------------------------------------- the plan's geometry, bucketed so colour can travel through it
    def bucket_new = Hash.new { |h, k| h[k] = [] }
    def rect_cmds(r, a, ht, hr)
      c, s = Math.cos(a), Math.sin(a)
      corners = [[-hr, -ht], [hr, -ht], [hr, ht], [-hr, ht]].map { |dr, dt| [(r + dr) * c - dt * s, (r + dr) * s + dt * c] }
      [["M", *corners[0]], ["L", *corners[1]], ["L", *corners[2]], ["L", *corners[3]], ["Z"]]
    end

    def geometry
      @modules = []
      @wires = bucket_new
      @outlines = bucket_new
      @greek = bucket_new
      RINGS.each_with_index do |(r, n), ri|
        hr = 54 + r * 0.018
        inner = ri.zero? ? NODE_R : RINGS[ri - 1][0] + 54 + RINGS[ri - 1][0] * 0.018
        n.times do |i|
          a = (i + 0.5 * (ri % 2)) * TAU / n - Math::PI / 2
          sec = ((a % TAU) / TAU * SECTORS).floor % SECTORS
          ht = 0.34 * TAU * r / n
          ht = [ht, 92].min
          @modules << { r: r, a: a, ri: ri, sec: sec }
          @outlines[[ri, sec]] += rect_cmds(r, a, ht, hr)
          [-0.45, 0, 0.45].each_with_index do |o, j|
            tan = o * ht
            len = hr * (0.72 - j * 0.14)
            c, s = Math.cos(a), Math.sin(a)
            p1 = [(r - len) * c - tan * s, (r - len) * s + tan * c]
            p2 = [(r + len) * c - tan * s, (r + len) * s + tan * c]
            @greek[[ri, sec]] += [["M", *p1], ["L", *p2]]
          end
          # parents and parallel traces: radial, then an arc along a routing channel, then radial again
          parent_n = ri.zero? ? 8 : RINGS[ri - 1][1]
          parent_a = ri.zero? ? a : ((a + Math::PI / 2) / TAU * parent_n).round * TAU / parent_n - Math::PI / 2 + (ri.odd? ? 0 : 0.5 * TAU / parent_n)
          [-1, 0, 1].each do |tr|
            off = tr * 0.2 * ht / r
            mid = inner + (r - hr - inner) * (0.5 + tr * 0.22)
            a2 = parent_a + tr * 0.012
            cmds = [["M", *polar(r - hr, a + off)], ["L", *polar(mid, a + off)]]
            5.times { |q| cmds << ["L", *polar(mid, a + off + (a2 - a - off) * (q + 1) / 5.0)] }
            cmds << ["L", *polar(inner, a2)]
            @wires[[ri, sec]] += cmds
          end
          # a pad on each outer corner of every module
        end
        # routing channel the traces run along
        mid = inner + (r - hr - inner) * 0.5
        @channels ||= []
        cmds = [["M", *polar(mid, 0)]]
        (1..96).each { |q| cmds << ["L", *polar(mid, q * TAU / 96)] }
        @channels += cmds + [["Z"]]
      end
      @users = []
      USER_ROWS.each do |r, n|
        n.times do |i|
          a = (i + (r % 3) * 0.2) * TAU / n - Math::PI / 2
          @users << { r: r, a: a, sec: ((a % TAU) / TAU * 24).floor % 24 }
        end
      end
    end

    def user_cmds(u, s = 13.0)
      x, y = polar(u[:r], u[:a])
      head = (0..8).map { |i| [i.zero? ? "M" : "L", x + s * 0.55 * Math.cos(i * TAU / 8), y - s * 1.0 + s * 0.55 * Math.sin(i * TAU / 8)] }
      head + [["M", x - s, y + s], ["Q", x, y - s * 0.6, x + s, y + s]]
    end

    def hot_t(r, sec) = w("assumption") + 0.1 + r / 1450.0 + 0.05 * Math.sin(sec * 2.4)
    def gold_t(r) = w("built") + (BUILD_STOP - r) / 1370.0 * 1.24

    # ---------------------------------------------------------------- the plan itself, all there from the first frame, under a cover the beam pulls away
    def plan
      s = w("an")
      cool = "#7FD6FF"
      @n << path(@channels, stroke: "#7FD6FF33", strokeWidth: 1, tracks: { strokeWidth: px(0.9) })
      @wires.each { |_, cmds| @n << path(cmds, stroke: "#7FD6FF88", strokeWidth: 1, tracks: { strokeWidth: px(1.0) }) }
      @outlines.each { |_, cmds| @n << path(cmds, fill: DISC, stroke: cool, strokeWidth: 1, tracks: { strokeWidth: px(1.5) }) }
      @greek.each { |_, cmds| @n << path(cmds, stroke: "#F2E8D566", strokeWidth: 1, tracks: { strokeWidth: px(1.0) }) }
      @n << path(@users.flat_map { |u| user_cmds(u) }, stroke: COOL, strokeWidth: 1, tracks: { strokeWidth: px(1.2) })
      @n << { type: "circle", radius: NODE_R, fill: DISC, stroke: COOL, strokeWidth: 2, tracks: { strokeWidth: px(2) } }
      # the cover, then the beam on its edge
      x0, x1 = -3500.0, 3500.0
      e = s + 1.72
      beam_x = [[s, x0], [e, x1, "inOutCubic"]]
      @n << { type: "rect", x: 0, y: -5000, width: 12_000, height: 10_000, fill: NIGHT, start: 0, end: f(e + 0.1), tracks: { x: beam_x } }
      trail_x = [[s, x0 - 720], [e, x1 - 720, "inOutCubic"]]
      trail = { type: "rect", x: 0, y: -5000, width: 720, height: 10_000, gradient: { colors: ["#7FD6FF00", "#7FD6FF2A"], from: [0, 0], to: [720, 0] }, start: f(s), end: f(e + 0.1), tracks: { x: trail_x } }
      @n << trail
      @n << { type: "line", points: [[0, -5000], [0, 5000]], stroke: PAPER, strokeWidth: 3, glow: 10, glowCore: 0.6, start: f(s), end: f(e + 0.1), tracks: { x: beam_x, strokeWidth: px(3) } }
      event(:scan, s, until: e)
    end

    def blueprint
      # the drawing sheet of the project, on "one project"
      s = w("project") - 0.2
      x, y, sw, sh = -3050, -1500, 6100, 3000
      @n << { type: "rect", x: x, y: y, width: sw, height: sh, fill: nil, stroke: "#F2E8D5AA", strokeWidth: 2, start: f(s), tracks: { strokeWidth: px(1.6), trimEnd: [[s, 0], [s + 0.8, 1, "inOutCubic"]] } }
      strength = [[0, 0.0], [w("only"), 0.02], [w("login"), 0.78, "inOutCubic"], [w("the", 2), 0.12, "outCubic"], [w("until"), 0.12], [w("assumption"), 0.55, "inCubic"], [w("and"), 0.5], [w("and") + 0.5, 0.0, "outCubic"]]
      twist = [[0, 0.0], [w("only"), 0.0], [w("login"), 0.7, "inOutCubic"], [w("the", 2), 0.0, "outCubic"]]
      @n << { type: "warpgrid", x: -4600, y: -2800, width: 9200, height: 5600, spacing: 200, color: "#7FD6FF26", strokeWidth: 1, falloff: 1300, center: [4600, 2800], resolution: 50,
              tracks: { strength: strength, twist: twist, strokeWidth: px(1.0) } }
      event(:draw, s)
    end

    # ---------------------------------------------------------------- every person, one door
    def starburst
      s = w("only")
      all_s, all_e = w("one", 2), w("the", 2)
      lines = bucket_new
      @users.each { |u| lines[u[:sec]] += [["M", *polar(u[:r] - 18, u[:a])], ["L", 0, 0]] }
      lines.each do |sec, cmds|
        a = s + sec * 0.03
        @n << path(cmds, stroke: "#7FD6FF", strokeWidth: 1, dash: [46, 54], start: f(a), end: f(w("and") + 0.3),
                         tracks: { strokeWidth: px(1.1), dashPhase: [[a, 0], [DURATION, 3000]], opacity: [[a, 0], [a + 0.3, 0.75], [all_e, 0.75], [all_e + 0.5, 0.18], [w("and"), 0.18], [w("and") + 0.3, 0]] })
        hot = cmds.each_slice(2).flat_map { |m, l| pt = [m[1], m[2]]; len = Math.hypot(*pt); [["M", *pt.map { |v| v * BARRIER / len }], l] }
        t = hot_t(700, sec)
        @n << path(hot, stroke: HOT, strokeWidth: 1, start: f(t), end: f(w("and") + 0.4), tracks: { strokeWidth: px(1.3), opacity: [[t, 0], [t + 0.2, 0.7], [w("and"), 0.7], [w("and") + 0.4, 0]] })
      end
      event(:burst, s)
      [all_s, w("shared"), w("login")].each_with_index { |t, i| @n << ring(t, 0, 0, NODE_R, 4 + i * 2, COOL, 0.8); event(:thud, t) }
    end

    def ring(t, x, y, r, to, color, dur = 0.8, width = 2)
      { type: "circle", radius: r, fill: nil, stroke: color, strokeWidth: width, x: x, y: y, start: f(t), end: f(t + dur), glow: 8, glowCore: 0.45,
        tracks: { scaleX: [[t, 1], [t + dur, to, "outCubic"]], scaleY: [[t, 1], [t + dur, to, "outCubic"]], opacity: [[t, 0.95], [t + dur, 0]],
                  strokeWidth: sample(t, t + dur, 1 / 12.0) { |q| (width / z(q) / (1 + (to - 1) * smooth((q - t) / dur))).round(3) } } }
    end

    def node
      s, lock, go, gone = w("one", 2), w("assumption"), w("and"), w("and") + 0.32
      key = [{ type: "circle", radius: 26, fill: PAPER, y: -24 }, { type: "polygon", points: [[-12, -14], [12, -14], [22, 42], [-22, 42]], fill: PAPER }]
      pop = [[s, 1], [s + 0.2, 1.7, "outBack"], [w("the", 2), 1.0, "smooth"]]
      @n << group([{ type: "circle", radius: NODE_R, fill: DISC }, { type: "circle", radius: NODE_R, fill: nil, stroke: PAPER, strokeWidth: 3, glow: 7, glowCore: 0.35, tracks: { strokeWidth: px(3) } }] + key, start: f(s), end: f(lock),
                  tracks: { scaleX: pop, scaleY: pop })
      hot_key = [{ type: "circle", radius: 26, fill: HOT, y: -24 }, { type: "polygon", points: [[-12, -14], [12, -14], [22, 42], [-22, 42]], fill: HOT }]
      out = [[go, 1], [gone, 0.1, "inCubic"]]
      @n << group([{ type: "circle", radius: NODE_R, fill: DISC }, { type: "circle", radius: NODE_R, fill: nil, stroke: HOT, strokeWidth: 4, glow: 10, glowCore: 0.4, tracks: { strokeWidth: px(4) } }] + hot_key, start: f(lock), end: f(gone),
                  tracks: { scaleX: out, scaleY: out })
      @n << ring(lock, 0, 0, NODE_R, 7, HOT, 1.0, 4)
      @n << ring(lock + 0.1, 0, 0, NODE_R, 11, GOLD, 1.1, 3)
      # the door breaks into sparks that carry out along the old wires
      38.times do |i|
        a = rnd(0, TAU)
        d = rnd(500, 1400)
        life = rnd(0.7, 1.2)
        @n << { type: "polygon", points: [[-16, -9], [18, 0], [-10, 12]], fill: GOLD, start: f(go + 0.2), end: f(go + 0.2 + life),
                tracks: { x: [[go + 0.2, 0], [go + 0.2 + life, d * Math.cos(a), "outCubic"]], y: [[go + 0.2, 0], [go + 0.2 + life, d * Math.sin(a), "outCubic"]], rotation: [[go + 0.2, a], [go + 0.2 + life, a + rnd(-5, 5)]], opacity: [[go + 0.2 + life * 0.6, 1], [go + 0.2 + life, 0]] } }
      end
      event(:shatter, go + 0.2)
    end

    # ---------------------------------------------------------------- it all looks fine
    def tick_cmds(m)
      x, y = polar(m[:r], m[:a])
      [["M", x - 26, y], ["L", x - 7, y + 22], ["L", x + 30, y - 28]]
    end

    def ticks
      groups = @modules.group_by { |m| [m[:ri], m[:sec]] }
      starts = [w("looked"), w("looked"), w("perfectly"), w("perfectly"), w("reasonable")]
      groups.each do |(ri, sec), mods|
        cmds = mods.flat_map { |m| tick_cmds(m) }
        s = starts[ri] + sec * 0.024 + (ri.odd? ? 0.12 : 0)
        t_hot = hot_t(mods[0][:r], sec)
        @n << path(cmds, stroke: GOLD, strokeWidth: 3, start: f(s), end: f(t_hot + 0.05), tracks: { strokeWidth: px(2.4) })
        event(:tick, s) if sec % 3 == 0
        back = gold_t(mods[0][:r]) + 0.25 + sec * 0.012
        @n << path(cmds, stroke: GOLD, strokeWidth: 3, start: f(back), tracks: { strokeWidth: px(2.6) })
      end
    end

    # ---------------------------------------------------------------- the wrong assumption spreads, and the right thing replaces it
    def overlays
      go = w("and")
      out = go + 0.4
      @wires.each do |(ri, sec), cmds|
        r = RINGS[ri][0]
        t = hot_t(r, sec)
        @n << path(cmds, stroke: HOT, strokeWidth: 1, start: f(t), end: f(out), tracks: { strokeWidth: px(1.6), opacity: [[t, 0], [t + 0.08, 1], [go, 1], [out, 0]] })
        g = gold_t(r)
        @n << path(cmds, stroke: "#FFC531BB", strokeWidth: 1, start: f(g), tracks: { strokeWidth: px(1.4), opacity: [[g, 0], [g + 0.14, 1]] })
      end
      @outlines.each do |(ri, sec), cmds|
        r = RINGS[ri][0]
        t = hot_t(r, sec)
        @n << path(cmds, fill: "#FF5A1F30", stroke: HOT, strokeWidth: 1, start: f(t), end: f(out), tracks: { strokeWidth: px(2.0), opacity: [[t, 0], [t + 0.08, 1], [go, 1], [out, 0]] })
        g = gold_t(r)
        @n << path(cmds, fill: "#FFC53124", stroke: GOLD, strokeWidth: 1, start: f(g), tracks: { strokeWidth: px(2.0), opacity: [[g, 0], [g + 0.14, 1]] })
      end
      event(:spread, w("assumption") + 0.1)
    end

    # each person gets their own account: a card and their own line, in a sweep round the whole ring
    def accounts
      s, e = w("and") + 0.04, w("individual") + 0.5
      by = @users.group_by { |u| u[:sec] }
      by.each do |sec, us|
        t = s + (e - s) * sec / 24.0
        cmds = us.flat_map { |u| user_cmds(u) }
        lines = us.flat_map { |u| [["M", *polar(u[:r] - 18, u[:a])], ["L", *polar(BUILD_STOP, u[:a])]] }
        cards = us.flat_map { |u| rect_cmds(u[:r] + 26, u[:a], 13, 8) }
        pop_s = [[t, 0.985], [t + 0.2, 1, "outBack"]]
        @n << group([path(cmds, stroke: GOLD, strokeWidth: 2, tracks: { strokeWidth: px(1.6) }), path(lines, stroke: "#FFC531CC", strokeWidth: 1, tracks: { strokeWidth: px(1.2) }), path(cards, fill: GOLD, stroke: nil)],
                    start: f(t), tracks: { opacity: fade(t, t + 0.1), scaleX: pop_s, scaleY: pop_s })
        event(:card, t)
      end
      bus = w("built")
      @n << { type: "circle", radius: BUILD_STOP, fill: nil, stroke: "#FFC531", strokeWidth: 2, start: f(bus), tracks: { strokeWidth: px(2), trimEnd: [[bus, 0], [bus + 0.7, 1, "inOutCubic"]] } }
      @n << { type: "circle", radius: NODE_R, fill: nil, stroke: "#FFC531", strokeWidth: 2, start: f(gold_t(NODE_R)), tracks: { strokeWidth: px(2), opacity: fade(gold_t(NODE_R), gold_t(NODE_R) + 0.2) } }
    end

    # ---------------------------------------------------------------- the build closing in, with its name on it
    def build_r(t)
      from, stop_t = w("the", 2), w("caught")
      run, land = w("built"), w("built") + 1.24
      return 3400.0 - (3400 - BUILD_STOP) * ((t - from) / (stop_t - from)).clamp(0, 1) if t <= run
      BUILD_STOP - (BUILD_STOP - NODE_R) * ((t - run) / (land - run)).clamp(0, 1)
    end

    def build_front
      s, e = w("the", 2), w("built") + 1.3
      rad = sample(s, e, 1 / 24.0) { |t| (build_r(t) / 1000.0).round(4) }
      @n << { type: "circle", radius: 1000, fill: nil, stroke: PAPER, strokeWidth: 3, dash: [34, 24], start: f(s), end: f(e), glow: 6, glowCore: 0.5,
              tracks: { scaleX: rad, scaleY: rad, strokeWidth: sample(s, e, 1 / 12.0) { |t| (2.4 / z(t) / (build_r(t) / 1000.0)).round(3) }, opacity: [[s, 0], [s + 0.4, 1], [e - 0.2, 1], [e, 0]] } }
      8.times do |i|
        a0 = i * TAU / 8 + 0.3
        pos = ->(t) { proj(*polar(build_r(t) + 95, a0 + (t - s) * 0.03), t) }
        rot = lambda do |t|
          a = a0 + (t - s) * 0.03 + cam_rot(t)
          r = a + Math::PI / 2
          Math.sin(a) > 0 ? r + Math::PI : r
        end
        @top << text("IMPLEMENTATION", font: MONO, size: 30, x: 0, y: 0, fill: PAPER, start: f(s), end: f(w("built") + 0.5),
                     tracks: { x: sample(s, w("built") + 0.5, 1 / 12.0) { |t| pos.(t)[0].round(1) }, y: sample(s, w("built") + 0.5, 1 / 12.0) { |t| pos.(t)[1].round(1) },
                               rotation: sample(s, w("built") + 0.5, 1 / 12.0) { |t| rot.(t).round(3) }, opacity: [[s, 0], [s + 0.4, 1], [w("built"), 1], [w("built") + 0.5, 0]] })
      end
      event(:front, s)
      event(:build, w("built"))
    end

    def barrier
      t, go = w("caught"), w("and")
      slam = [[t, 1.1], [t + 0.12, 1, "outCubic"]]
      @n << { type: "circle", radius: BARRIER, fill: nil, stroke: GOLD, strokeWidth: 8, start: f(t), end: f(go + 0.4), glow: 10, glowCore: 0.5,
              tracks: { strokeWidth: px(5), scaleX: slam, scaleY: slam, opacity: [[go, 1], [go + 0.4, 0]] } }
      @n << ring(t, 0, 0, BARRIER, 1.22, GOLD, 0.7, 4)
      accent(t, 30)
      event(:stop, t)
    end

    # ---------------------------------------------------------------- Robin, and his attention
    def figure
      kids = [{ type: "circle", radius: 34, fill: DISC, stroke: GOLD, strokeWidth: 4, x: 0, y: -68, tracks: { strokeWidth: px(3.2) } },
              path([["M", -62, 72], ["C", -58, -22, 58, -22, 62, 72]], stroke: GOLD, strokeWidth: 4, tracks: { strokeWidth: px(3.2) })]
      @n << group(kids, x: FIG[0], y: FIG[1], glow: 7, glowCore: 0.4)
    end

    def head_at(t) = proj(FIG[0], FIG[1] - 68, t)

    def attention
      # he looks for himself, right from the first line
      s0, e0 = 0.25, w("on") + 0.1
      dec = w("decisions")
      @top << { type: "reticle", radius: 150, color: GOLD, start: f(s0), end: f(e0), glow: 7, glowCore: 0.45,
                tracks: { x: sample(s0, e0, 1 / 12.0) { |t| head_at(t)[0].round(1) }, y: sample(s0, e0, 1 / 12.0) { |t| head_at(t)[1].round(1) }, rotation: [[s0, 0], [dec, 1.4, "outCubic"]],
                          opacity: [[s0, 0], [s0 + 0.2, 1], [e0 - 0.3, 1], [e0, 0]], scaleX: [[s0, 1.6], [dec, 1, "outCubic"]], scaleY: [[s0, 1.6], [dec, 1, "outCubic"]] } }
      event(:lock_small, dec)

      # the check, flown: figure to a module to a module to the door
      s, lock = w("until"), w("assumption")
      m1 = @modules.select { |m| m[:ri] == 3 }.min_by { |m| Math.hypot(*(polar(m[:r], m[:a]).zip(FIG).map { |p, q| p - q })) }
      m2 = @modules.select { |m| m[:ri] == 1 }.min_by { |m| Math.hypot(*(polar(m[:r], m[:a]).zip(polar(m1[:r], m1[:a] + 0.5)).map { |p, q| p - q })) }
      stops = [[s, *FIG], [w("i"), *polar(m1[:r], m1[:a])], [w("checked"), *polar(m2[:r], m2[:a])], [lock - 0.03, 0, 0]]
      wx = lambda do |t|
        a, b = stops.each_cons(2).find { |_, y| t <= y[0] } || [stops[-2], stops[-1]]
        u = smooth((t - a[0]) / (b[0] - a[0]))
        [a[1] + u * (b[1] - a[1]), a[2] + u * (b[2] - a[2])]
      end
      e = lock + 0.55
      @top << { type: "reticle", radius: 120, color: GOLD, start: f(s), end: f(e), glow: 8, glowCore: 0.5,
                tracks: { x: sample(s, e) { |t| proj(*wx.(t), t)[0].round(1) }, y: sample(s, e) { |t| proj(*wx.(t), t)[1].round(1) }, rotation: [[s, 0], [lock, 2.4, "outCubic"]],
                          opacity: [[s, 0], [s + 0.08, 1], [e - 0.3, 1], [e, 0]] } }
      pts = stops.map { |_, x, y| [x, y] }
      @n << { type: "spline", points: pts, fill: nil, stroke: GOLD, strokeWidth: 3, start: f(s), end: f(w("caught")), glow: 7, glowCore: 0.5,
              tracks: { strokeWidth: px(2.4), trimEnd: [[s, 0], [lock, 1, "inOutCubic"]], opacity: [[w("assumption") + 0.6, 1], [w("caught"), 0]] } }
      event(:dive, s, until: lock)
      event(:lock, lock)
      accent(lock, 26)
    end

    # ---------------------------------------------------------------- words, outside the camera
    def plate(x, y, w_, h_, s, e, op: 0.86, **kw)
      { type: "rect", x: x, y: y, width: w_, height: h_, radius: 14, fill: NIGHT, opacity: op, start: f(s), end: f(e) }.merge(kw)
    end

    def words
      # opening line under the figure
      a = w("still")
      line = "still making the decisions"
      keys = [[a, 6.0 / line.length], [w("making"), 13.0 / line.length, "hold"], [w("the"), 17.0 / line.length, "hold"], [w("decisions"), 1.0, "hold"]]
      gone = w("on") + 0.1
      @top << group([text(line, size: 92, y: 960, start: f(a), reveal: keys)], start: f(a), end: f(gone), tracks: { opacity: [[gone - 0.25, 1], [gone, 0]] })

      # the typed phrase
      type_s, type_e = w("one", 1), w("to") - 0.05
      phrase = "one administrator"
      n = phrase.length
      size = 96
      adv = size * 0.6
      tkeys = [[type_s, 0.0]] + (1..n).map { |i| [type_s + (type_e - type_s) * i / n, (i.to_f / n).round(4), "hold"] }
      event(:typed, type_s, keys: (1..n).reject { |i| phrase[i - 1] == " " }.map { |i| (type_s + (type_e - type_s) * i / n).round(4) })
      fall_s, fall_e = w("to"), w("whole")
      shrink = [[fall_s, 1], [fall_e, 0.04, "inCubic"]]
      wide = n * adv + 100
      @top << group([plate(CX - wide / 2, CY - 92, wide, 184, type_s, fall_e, op: 0.92, stroke: GOLD, strokeWidth: 3),
                     text(phrase, font: MONO, size: size, x: CX - n * adv / 2, y: CY + 32, fill: GOLD, align: "left", start: f(type_s), reveal: tkeys)],
                    start: f(type_s), end: f(fall_e), x: CX, y: CY, anchor: [CX, CY], tracks: { scaleX: shrink, scaleY: shrink })
      event(:fall, fall_s)

      # the bad reading, stated
      s1, s2, s3 = w("one", 2), w("shared"), w("login")
      str = "ONE SHARED LOGIN"
      @top << plate(CX - 620, 868, 1240, 168, s1, w("the", 2))
      @top << text(str, font: IMPACT, size: 130, y: 1002, reveal: [[s1, 3.0 / str.size], [s2, 10.0 / str.size, "hold"], [s3, 1.0, "hold"]], start: f(s1), end: f(w("the", 2)))
      accent(s3, 12)

      # the door's own label, when the camera arrives at it
      d, lock = w("checked"), w("assumption")
      c = ->(t) { proj(0, 0, t) }
      lab_e = lock + 0.42
      @top << group([text("one shared login", size: 46, x: 0, y: 178, fill: PAPER, start: f(d), end: f(lock)), text("one shared login", size: 46, x: 0, y: 178, fill: HOT, start: f(lock), end: f(lab_e))],
                    start: f(d), end: f(lab_e), tracks: { x: sample(d, lab_e) { |t| c.(t)[0].round(1) }, y: sample(d, lab_e) { |t| c.(t)[1].round(1) }, opacity: [[d, 0], [d + 0.12, 1], [lab_e - 0.14, 1], [lab_e, 0]] })

      # caught
      t, go = w("caught"), w("and")
      hit = [[t, 1.4], [t + 0.14, 1, "outCubic"], [go, 1.04]]
      echoes = 3.downto(1).map { |i| text("CAUGHT", font: IMPACT, size: 190, y: CY + 40 + 16 * i, fill: nil, outline: GOLD, outlineWidth: 2.2, opacity: (1 - i / 4.0) * 0.8, start: f(t + i / GRID)) }
      @top << group([plate(CX - 345, CY - 130, 690, 300, t, go + 0.12, op: 0.92)] + echoes + [text("CAUGHT", font: IMPACT, size: 190, y: CY + 40, fill: GOLD), text("before implementation", size: 56, y: CY + 138, reveal: [[w("before"), 7.0 / 21], [w("implementation"), 1.0, "hold"]], start: f(w("before")))],
                    start: f(t), end: f(go + 0.12), x: CX, y: CY, anchor: [CX, CY], tracks: { scaleX: hit, scaleY: hit, opacity: [[go - 0.04, 1], [go + 0.12, 0]] })
      event(:word, t)

      # the fix, stated, and held
      i1, i2 = w("individual"), w("accounts")
      end_str = "INDIVIDUAL ACCOUNTS"
      @top << plate(CX - 700, 868, 1400, 168, i1, DURATION)
      @top << text(end_str, font: IMPACT, size: 130, y: 1002, fill: GOLD, reveal: [[i1, 11.0 / end_str.size], [i2, 1.0, "hold"]], start: f(i1))
      accent(i1, 8)
      event(:word, i1)

      # the phrase was true of one person, so it ends up with one person
      ad = i2 + 0.5
      @top << text("one administrator", size: 44, x: 0, y: 0, fill: GOLD, start: f(ad),
                   tracks: { x: sample(ad, DURATION, 1 / 6.0) { |q| (proj(*FIG, q)[0] + 10).round(1) }, y: sample(ad, DURATION, 1 / 6.0) { |q| (proj(*FIG, q)[1] - 56).round(1) }, opacity: fade(ad, ad + 0.3) })
      event(:label, ad)
    end

    # ---------------------------------------------------------------- frame
    def camera(world)
      s, e = 0, DURATION
      tr = group(world, tracks: { x: sample(s, e) { |t| (-cam(t)[1]).round(2) }, y: sample(s, e) { |t| (-cam(t)[2]).round(2) } })
      zs = sample(s, e) { |t| z(t).round(5) }
      group([tr], x: CX, y: CY, anchor: [0, 0], tracks: { scaleX: zs, scaleY: zs, rotation: sample(s, e) { |t| cam_rot(t).round(4) } })
    end

    def shake(kids)
      xs, ys = [[-1, CX]], [[-1, CY]]
      kept = @accents.sort_by(&:first).each_with_object([]) { |h, out| out << h if out.empty? || h[0] >= out.last[0] + 8 / 24.0 }
      kept.each do |t, amp|
        t0 = f(t)
        8.times do |j|
          a = amp * (1 - j / 8.0)**2
          xs << [t0 + j / 24.0, CX + (j == 7 ? 0 : rnd(-a, a)), "hold"]
          ys << [t0 + j / 24.0, CY + (j == 7 ? 0 : rnd(-a, a)), "hold"]
        end
      end
      group(kids, x: CX, y: CY, anchor: [CX, CY], tracks: { x: xs, y: ys })
    end

    def build
      geometry
      plan
      blueprint
      overlays
      starburst
      ticks
      accounts
      build_front
      barrier
      node
      attention
      figure
      words
      fin = { type: "rect", x: -120, y: -120, width: W + 240, height: H + 240, fill: NIGHT, start: f(DURATION - 0.45), tracks: { opacity: [[DURATION - 0.45, 0], [DURATION - 0.05, 1, "smooth"]] } }
      { version: 1, background: NIGHT, fonts: %w[bradley.ttf impact.ttf andale-mono.ttf].map { |n| "../tools/graphics/fonts/#{n}" },
        nodes: [shake([camera(@n)] + @top), fin], effects: [{ name: "CIBloom", parameters: { inputRadius: 8, inputIntensity: 0.25 } }] }
    end

    def events = { duration: DURATION, events: @events.sort_by { |e| e[:t] } }
  end
end

b = AdminB::Builder.new
doc = b.build
out = File.join(AdminB::ROOT, "scenes", "adminb.json")
File.write(out, JSON.generate(doc))
File.write(File.join(AdminB::ROOT, "scenes", "adminb.events.json"), JSON.pretty_generate(b.events))
puts JSON.generate(path: out, bytes: File.size(out), frames: (AdminB::DURATION * AdminB::GRID).round)
