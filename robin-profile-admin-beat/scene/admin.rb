# Profile film, the "one administrator" beat, drawn in the native Swift renderer. Picture timed from work/voice/words.json.
# Writes work/mv/scenes/admin.json and admin.events.json.
require "json"

module Admin
  WORK = File.expand_path("../work", __dir__)
  ROOT = File.join(WORK, "mv")
  W, H = 1920, 1080
  CX, CY = W / 2.0, H / 2.0
  GRID = 24.0
  DURATION = 19.68
  NIGHT, DISC, PAPER, GOLD, HOT, COOL = "#0A0E24", "#0D1636", "#F2E8D5", "#FFC531", "#FF5A1F", "#7FD6FF"
  HAND, MONO = "BradleyHandITCTT-Bold", "AndaleMono"
  PEOPLE_X = (0...10).map { |i| 300 + i * 146.67 }
  PEOPLE_Y = 150
  BOX = [720, 410, 480, 120] # x, y, w, h of the login box
  BLOCKS = [[500, 680], [840, 680], [1180, 680]] # top-left corners, 240 x 110
  SHEET = [CX, 470]
  SHEET_SMALL = [330, 800]
  ROBIN = [120, 950]

  class Builder
    def initialize
      @n, @top, @events, @accents = [], [], [], []
      @rng = Random.new(1000)
      @words = JSON.parse(File.read(File.join(WORK, "voice", "words.json")))["words"]
    end

    def f(t) = (t * GRID + 1e-6).floor / GRID
    def w(word, nth = 0) = @words.select { |x| x["w"].downcase.delete('",.') == word }[nth]["s"]
    def event(kind, t, **kw) = @events << { kind: kind, t: t.round(4), **kw }
    def accent(t, amp) = (@accents << [t, amp]; event(:accent, t, amp: amp))
    def rnd(a, b) = a + @rng.rand * (b - a)
    def group(kids, **kw) = { type: "group", children: kids }.merge(kw)
    def text(str, font: HAND, size: 50, x: CX, y: CY, fill: PAPER, align: "center", **kw) = { type: "text", text: str, font: font, size: size, x: x, y: y, fill: fill, align: align }.merge(kw)
    def path(cmds, **kw) = { type: "path", commands: cmds }.merge(kw)
    def rect(x, y, w, h, **kw) = { type: "rect", x: x, y: y, width: w, height: h }.merge(kw)
    def glow(node, g = 7, c = 0.45) = node.merge(glow: g, glowCore: c)
    # glow whitens a filled shape, so the fill sits under a glowing outline
    def card_rect(x, y, w, h, color, radius: 10, width: 3, g: 5) = [rect(x, y, w, h, radius: radius, fill: DISC), glow(rect(x, y, w, h, radius: radius, fill: nil, stroke: color, strokeWidth: width), g, 0.3)]
    def draw_on(s, e, ease = "outCubic") = [[s, 0], [e, 1, ease]]
    def fade(a, b, from = 0, to = 1) = [[a, from], [b, to]]

    def figure(x, y, color, s, e = DURATION, pop: true, **kw)
      kids = [{ type: "circle", radius: 19, fill: nil, stroke: color, strokeWidth: 3, x: 0, y: -28 },
              path([["M", -32, 34], ["C", -30, -8, 30, -8, 32, 34]], fill: nil, stroke: color, strokeWidth: 3)]
      t = pop ? { scaleX: [[s, 0.1], [s + 0.28, 1, "outBack"]], scaleY: [[s, 0.1], [s + 0.28, 1, "outBack"]] } : {}
      glow(group(kids, x: x, y: y, start: f(s), end: e, tracks: t, **kw), 6, 0.35)
    end

    def tick(x, y, s, e, color: GOLD)
      event(:tick, s)
      glow(path([["M", x - 24, y], ["L", x - 6, y + 20], ["L", x + 28, y - 26]], fill: nil, stroke: color, strokeWidth: 7, start: f(s), end: e,
                tracks: { trimEnd: draw_on(s, s + 0.2) }))
    end

    # ------------------------------------------------------------ the plan page
    def sheet
      s = w("on")
      shrink, shrunk = w("to"), w("to") + 0.75
      pw, ph = 620, 640
      type_s, type_e = w("one", 1), w("to") - 0.05
      phrase = "one administrator"
      n = phrase.length
      adv = 44 * 0.6
      keys = [[type_s, 0.0]] + (1..n).map { |i| [type_s + (type_e - type_s) * i / n, (i.to_f / n).round(4), "hold"] }
      event(:typed, type_s, keys: (1..n).reject { |i| phrase[i - 1] == " " }.map { |i| (type_s + (type_e - type_s) * i / n).round(4) })
      rows = (0..5).map do |i|
        ls = w("an") + i * 0.2
        y = -230 + i * 70
        next nil if i == 3
        { type: "line", points: [[-250, y], [250 - (i * 37 % 110), y]], stroke: "#F2E8D588", strokeWidth: 3, start: f(ls), tracks: { trimEnd: draw_on(ls, ls + 0.22) } }
      end.compact
      kids = [rect(-pw / 2.0, -ph / 2.0, pw, ph, radius: 12, fill: DISC, stroke: PAPER, strokeWidth: 3, boil: 1.0, seed: 5, boilRate: 8)] + rows
      kids << text(phrase, font: MONO, size: 44, x: -n * adv / 2, y: -5 + 16, fill: GOLD, align: "left", start: f(type_s), reveal: keys)
      kids << rect(-n * adv / 2 - 10, 26, n * adv + 20, 4, fill: GOLD, start: f(type_e), tracks: { opacity: fade(type_e, type_e + 0.15) })
      sc = [[shrink, 1.0], [shrunk, 0.42, "inOutCubic"]]
      entry = [[s, 0.92], [s + 0.3, 1.0, "outCubic"], [shrink, 1.0], [shrunk, 0.42, "inOutCubic"]]
      @n << group(kids, start: f(s), end: DURATION,
                        tracks: { x: [[shrink, SHEET[0]], [shrunk, SHEET_SMALL[0], "inOutCubic"]], y: [[shrink, SHEET[1]], [shrunk, SHEET_SMALL[1], "inOutCubic"]],
                                  scaleX: entry, scaleY: entry, opacity: fade(s, s + 0.25) })
      event(:draw, s)
      @phrase_end = [SHEET_SMALL[0] + 0.42 * n * adv / 2 + 14, SHEET_SMALL[1] + 2]
    end

    # ------------------------------------------------------------ the believable diagram
    def people
      s = w("whole")
      PEOPLE_X.each_with_index { |x, i| @n << figure(x, PEOPLE_Y, COOL, s + i * 0.075) }
      event(:people, s)
    end

    def box_cx = BOX[0] + BOX[2] / 2.0

    def funnel
      s = w("only")
      gone_s, gone_e = w("and") - 0.15, w("and") + 0.3
      PEOPLE_X.each_with_index do |x, i|
        a = s + i * 0.05
        target_x = box_cx + (i - 4.5) * 28
        @n << glow({ type: "spline", points: [[x, PEOPLE_Y + 42], [x + (target_x - x) * 0.25, PEOPLE_Y + 150], [target_x, BOX[1] - 70], [target_x, BOX[1]]],
                     fill: nil, stroke: "#7FD6FFAA", strokeWidth: 2, start: f(a), end: gone_e,
                     tracks: { trimEnd: draw_on(a, a + 0.5), trimStart: draw_on(gone_s, gone_e, "inOutCubic") } }, 5, 0.3)
      end
    end

    def login_box
      s = w("one", 2)
      lock = w("assumption")
      gone_s, gone_e = w("and") - 0.1, w("and") + 0.32
      keep = group(card_rect(*BOX, PAPER, radius: 14, width: 3.5) + [text("one shared login", size: 52, x: box_cx, y: BOX[1] + 77, reveal: [[s, 0], [w("shared"), 0.42, "hold"], [w("login"), 1, "hold"]])],
                   start: f(s - 0.1), end: f(lock + 0.04), tracks: { opacity: fade(s - 0.1, s + 0.1) })
      @n << keep
      hot = group(card_rect(*BOX, HOT, radius: 14, width: 4, g: 8) + [text("one shared login", size: 52, x: box_cx, y: BOX[1] + 77, fill: HOT)],
                  start: f(lock), end: gone_e, x: box_cx, y: BOX[1] + BOX[3] / 2.0, anchor: [box_cx, BOX[1] + BOX[3] / 2.0],
                  tracks: { opacity: [[gone_s, 1], [gone_e, 0]], scaleX: [[gone_s, 1], [gone_e, 0.2, "inCubic"]], scaleY: [[gone_s, 1], [gone_e, 0.2, "inCubic"]] })
      @n << hot
      event(:draw, s)
    end

    def blocks
      s = w("the", 2)
      stop = w("assumption")
      BLOCKS.each_with_index do |(x, y), i|
        a = s + i * 0.08
        @n << group(card_rect(x, y, 240, 110, PAPER), start: f(a), tracks: { opacity: fade(a, a + 0.14) })
        (0..2).each { |r| @n << { type: "line", points: [[x + 34, y + 32 + r * 24], [x + 180 - r * 28, y + 32 + r * 24]], stroke: "#F2E8D566", strokeWidth: 3, start: f(a + 0.1), tracks: { opacity: fade(a + 0.1, a + 0.25) } } }
        # shared connector from the one login
        c = { type: "spline", points: [[box_cx, BOX[1] + BOX[3]], [box_cx + (x + 120 - box_cx) * 0.2, 600], [x + 120, 640], [x + 120, y]], fill: nil, stroke: "#7FD6FFAA", strokeWidth: 2,
              start: f(a), end: w("and") + 0.3, tracks: { trimEnd: draw_on(a, a + 0.32), trimStart: draw_on(w("and") - 0.15, w("and") + 0.3, "inOutCubic") } }
        @n << glow(c, 5, 0.3)
      end
      times = [w("looked"), w("perfectly"), w("reasonable")]
      out = stop + 0.3
      BLOCKS.each_with_index do |(x, y), i|
        @n << group([tick(x + 205, y + 26, times[i], out)], start: f(times[i]), end: out, tracks: { opacity: [[stop, 1], [out, 0]] })
      end
      # afterwards the same three blocks are right, on the new wiring
      BLOCKS.each_with_index { |(x, y), i| @n << tick(x + 205, y + 26, w("individual") + 0.3 + i * 0.12, DURATION) }
      event(:draw, s)
    end

    # the arrow toward implementation: stops short, then lands on "built"
    def implementation
      x0, y0 = BLOCKS[2][0] + 240, BLOCKS[2][1] + 55
      bx, by, bw, bh = 1420, 900, 430, 90
      s = w("reasonable")
      caught, built = w("caught"), w("built")
      held = 0.56
      arrow = { type: "spline", points: [[x0, y0], [x0 + 170, y0 + 25], [1670, 790], [1670, by]], fill: nil, stroke: GOLD, strokeWidth: 3, dash: [12, 10], start: f(s),
                tracks: { trimEnd: [[s, 0], [caught, held, "linear"], [built, held], [built + 0.45, 1, "outCubic"]] } }
      @n << glow(arrow, 6, 0.4)
      @n << group(card_rect(bx, by, bw, bh, PAPER) + [text("implementation", size: 46, x: bx + bw / 2.0 - 26, y: by + 60)], start: f(s), tracks: { opacity: fade(s, s + 0.2) })
      # the stop bar sits across the frozen tip; measured from the rendered arrow
      px, py = @stop_at
      bar = glow({ type: "line", points: [[px - 34, py + 22], [px + 34, py - 22]], stroke: GOLD, strokeWidth: 8, start: f(caught), end: f(built + 0.2),
                   tracks: { trimEnd: draw_on(caught, caught + 0.14), opacity: [[built, 1], [built + 0.2, 0]] } }, 8, 0.45)
      @n << bar
      event(:stop, caught)
      accent(caught, 9)
      @n << tick(bx + bw - 40, by + 44, built + 0.45, DURATION)
    end

    # the person who checks, and the reticle that leaves him
    def robin
      @n << figure(*ROBIN, GOLD, 0.15)
      event(:draw, 0.15)
    end

    def reticle
      s = w("until")
      lock = w("assumption")
      out = w("caught") + 0.5
      stops = [[s, ROBIN[0] + 40, ROBIN[1] - 60], [w("i") + 0.1, BLOCKS[0][0] + 120, BLOCKS[0][1] + 55], [w("checked"), BLOCKS[2][0] + 120, BLOCKS[2][1] + 55], [lock - 0.05, box_cx, BOX[1] + BOX[3] / 2.0]]
      x = [[s, stops[0][1]]] + stops[1..].map { |t, a, _| [t, a, "inOutCubic"] }
      y = [[s, stops[0][2]]] + stops[1..].map { |t, _, b| [t, b, "inOutCubic"] }
      @n << glow({ type: "reticle", radius: 96, color: GOLD, start: f(s), end: f(out), tracks: { x: x, y: y, rotation: [[s, 0], [lock, 2.2, "outCubic"]], opacity: [[s, 0], [s + 0.12, 1], [out - 0.4, 1], [out, 0]] } }, 7, 0.45)
      @n << glow({ type: "circle", radius: 120, fill: nil, stroke: GOLD, strokeWidth: 3, x: box_cx, y: BOX[1] + BOX[3] / 2.0, start: f(lock), end: lock + 0.8,
                   tracks: { scaleX: [[lock, 1], [lock + 0.8, 2.6, "outCubic"]], scaleY: [[lock, 1], [lock + 0.8, 2.6, "outCubic"]], opacity: [[lock, 0.9], [lock + 0.8, 0]] } }, 8, 0.45)
      # the assumption traced back to the words on the page
      px, py = @phrase_end
      @n << glow({ type: "spline", points: [[px, py], [470, 640], [620, 540], [BOX[0], BOX[1] + BOX[3] / 2.0]], fill: nil, stroke: HOT, strokeWidth: 2.5, dash: [8, 8], start: f(lock), end: w("and") + 0.3,
                   tracks: { trimEnd: draw_on(lock, lock + 0.4), opacity: [[w("and") - 0.1, 1], [w("and") + 0.3, 0]] } }, 6, 0.35)
      event(:lock, lock)
      accent(lock, 12)
    end

    # ------------------------------------------------------------ the correction
    def accounts
      built = w("and")
      card_y = 300
      bus_y = 408
      PEOPLE_X.each_with_index do |x, i|
        a = built + 0.1 + i * 0.09
        @n << figure(x, PEOPLE_Y, GOLD, a, pop: true)
        @n << glow({ type: "line", points: [[x, PEOPLE_Y + 42], [x, card_y - 28]], stroke: GOLD, strokeWidth: 3, start: f(a), tracks: { trimEnd: draw_on(a, a + 0.14) } }, 5, 0.35)
        card = card_rect(-44, -28, 88, 56, GOLD, radius: 8) + [
                { type: "circle", radius: 8, fill: GOLD, x: -22, y: 0 },
                { type: "line", points: [[-4, -7], [28, -7]], stroke: GOLD, strokeWidth: 3 }, { type: "line", points: [[-4, 8], [18, 8]], stroke: GOLD, strokeWidth: 3 }]
        @n << group(card, x: x, y: card_y, start: f(a + 0.08), tracks: { scaleX: [[a + 0.08, 0.1], [a + 0.3, 1, "outBack"]], scaleY: [[a + 0.08, 0.1], [a + 0.3, 1, "outBack"]] })
        @n << glow({ type: "line", points: [[x, card_y + 28], [x, bus_y]], stroke: "#FFC531AA", strokeWidth: 2, start: f(a + 0.15), tracks: { trimEnd: draw_on(a + 0.15, a + 0.4) } }, 4, 0.3)
        event(:card, a + 0.08)
      end
      bus = built + 0.5
      @n << glow({ type: "line", points: [[PEOPLE_X.first, bus_y], [PEOPLE_X.last, bus_y]], stroke: "#FFC531AA", strokeWidth: 2, start: f(bus), tracks: { trimEnd: draw_on(bus, bus + 0.5, "inOutCubic") } }, 4, 0.3)
      BLOCKS.each { |x, y| @n << glow({ type: "line", points: [[x + 120, bus_y], [x + 120, y]], stroke: "#FFC531AA", strokeWidth: 2, start: f(bus + 0.3), tracks: { trimEnd: draw_on(bus + 0.3, bus + 0.5) } }, 4, 0.3) }
      lab = w("individual")
      @n << rect(CX - 300, 492, 600, 92, radius: 16, fill: NIGHT, start: f(lab), tracks: { opacity: fade(lab, lab + 0.08) })
      @n << text("individual accounts", size: 66, x: CX, y: 558, fill: PAPER, start: f(lab), reveal: [[lab, 0.56], [w("accounts"), 1, "hold"]])
      # the phrase was true of one person, so it stays with one person
      ad = w("accounts") + 0.35
      @n << text("one administrator", size: 40, x: PEOPLE_X[0], y: 72, fill: GOLD, start: f(ad), tracks: { opacity: fade(ad, ad + 0.25) })
      accent(built + 0.1, 5)
    end

    # ------------------------------------------------------------ frame
    def camera(kids)
      xs, ys, ss = [[-1, CX]], [[-1, CY]], [[-1, 1.0]]
      kept = @accents.sort_by(&:first)
      kept.each do |t, amp|
        t0 = f(t)
        8.times do |j|
          a = amp * (1 - j / 8.0)**2
          xs << [t0 + j / 24.0, CX + (j == 7 ? 0 : rnd(-a, a)), "hold"]
          ys << [t0 + j / 24.0, CY + (j == 7 ? 0 : rnd(-a, a)), "hold"]
        end
      end
      drift = [[0, 1.0], [DURATION, 1.018]]
      group([group(kids, x: CX, y: CY, anchor: [CX, CY], tracks: { x: xs, y: ys })], x: CX, y: CY, anchor: [CX, CY], tracks: { scaleX: drift, scaleY: drift })
    end

    def spline_point(pts, u)
      # same centripetal-free estimate as a polyline is close enough for placing the stop bar
      lens = pts.each_cons(2).map { |a, b| Math.hypot(b[0] - a[0], b[1] - a[1]) }
      d = lens.sum * u
      pts.each_cons(2).with_index do |(a, b), i|
        return [a[0] + (b[0] - a[0]) * d / lens[i], a[1] + (b[1] - a[1]) * d / lens[i]] if d <= lens[i]
        d -= lens[i]
      end
      pts.last
    end

    def build
      @n << rect(-120, -120, W + 240, H + 240, fill: NIGHT)
      @n << { type: "grid", x: -160, y: -160, width: W + 320, height: H + 320, spacing: 64, color: "#7FD6FF12", tracks: { x: [[0, -160], [DURATION, -128]] } }
      x0, y0 = BLOCKS[2][0] + 240, BLOCKS[2][1] + 55
      @stop_at = spline_point([[x0, y0], [x0 + 170, y0 + 25], [1670, 790], [1670, 900]], 0.56)
      robin
      sheet
      people
      funnel
      blocks
      login_box
      implementation
      accounts
      reticle
      @n << rect(-120, -120, W + 240, H + 240, fill: NIGHT, start: f(DURATION - 0.5), tracks: { opacity: [[DURATION - 0.5, 0], [DURATION - 0.05, 1, "smooth"]] })
      { version: 1, background: NIGHT, fonts: %w[bradley.ttf andale-mono.ttf].map { |n| "../tools/graphics/fonts/#{n}" },
        nodes: [camera(@n)], effects: [{ name: "CIBloom", parameters: { inputRadius: 7, inputIntensity: 0.18 } }] }
    end

    def events = { duration: DURATION, events: @events.sort_by { |e| e[:t] } }
  end
end

b = Admin::Builder.new
doc = b.build
out = File.join(Admin::ROOT, "scenes", "admin.json")
File.write(out, JSON.generate(doc))
File.write(File.join(Admin::ROOT, "scenes", "admin.events.json"), JSON.pretty_generate(b.events))
puts JSON.generate(path: out, bytes: File.size(out), frames: (Admin::DURATION * Admin::GRID).round)
