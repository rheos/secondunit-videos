# Phase 1 line-up still for Children at Play in the night-sky line look: the three people and the farm set, labelled.
# Draws from the same kit as the scene. Writes work/mv/scenes/lineup.json (one frame).
#
#   ruby scene/lineup.rb
#   work/mv/tools/graphics/.build/release/mgraphics work/mv/scenes/lineup.json --out out/lineup --frames 1 --only 0 --supersample 2
require_relative "kit"

module Lineup
  include Kit
  ROOT = File.expand_path("../work/mv", __dir__)

  class Builder
    include Kit

    def initialize = @nodes = []

    def group(children, **kw) = { type: "group", children: children }.merge(kw)
    def text(str, x, y, size: 26, font: HAND, fill: PAPER, align: "left") = { type: "text", text: str, font: font, size: size, x: x, y: y, fill: fill, align: align }
    # metres drawn at `s` px per metre with the feet (or world origin) at screen (x, y); strokes stay `px` wide
    def at(x, y, s, kids) = group(kids, x: x, y: y, scaleX: s, scaleY: s)
    def stroke(cmds, s, px = 2.0, color = PAPER) = { type: "path", commands: cmds, fill: nil, stroke: color, strokeWidth: px / s }
    def fill(cmds, color) = { type: "path", commands: cmds, fill: color }
    def gold_head(cx, cy, r, s) = [{ type: "circle", radius: r * 2.0, x: cx, y: cy, fill: "#FFC53126" },
                                   { type: "circle", radius: r, x: cx, y: cy, fill: GOLD, glow: 12 / s, glowCore: 0.5 }]

    # ---------------------------------------------------------------- the cast, all at one scale against a ruler
    BASE, S = 560.0, 190.0

    def ruler
      x = 150
      @nodes << { type: "line", points: [[x, BASE], [x, BASE - 2 * S]], stroke: PAPER, strokeWidth: 1.6 }
      [[0, "0"], [0.5, nil], [1.0, "1 m"], [1.5, "1.5 m"], [2.0, "2 m"]].each do |m, lab|
        y = BASE - m * S
        @nodes << { type: "line", points: [[x - (lab ? 14 : 8), y], [x, y]], stroke: PAPER, strokeWidth: 1.6 }
        @nodes << text(lab, x - 20, y + 8, size: 20, font: MONO, align: "right") if lab
      end
      [1.5, 2.0].each { |m| @nodes << { type: "line", points: [[x + 8, BASE - m * S], [1165, BASE - m * S]], stroke: FAINT, strokeWidth: 1.2, dash: [6, 10] } }
      @nodes << { type: "line", points: [[x, BASE], [1240, BASE]], stroke: PAPER, strokeWidth: 1.8 }
    end

    def cast
      # the mother, searching: hand to her brow, a cool sight line to a reticle
      @nodes << at(370, BASE, S, [stroke(mother(:look), S, 2.2)])
      ex, ey = 370 + 0.05 * S, BASE - 1.56 * S
      @nodes << { type: "line", points: [[ex + 14, ey], [ex + 170, ey + 28]], stroke: COOL, strokeWidth: 1.7, dash: [7, 8], glow: 6, glowCore: 0.4 }
      @nodes << { type: "reticle", radius: 15, color: COOL, x: ex + 192, y: ey + 32, glow: 6, glowCore: 0.4 }
      @nodes << text("the mother", 370, BASE + 40, size: 32, align: "center")
      @nodes << text("about 1.65 m, bun, apron, no face", 370, BASE + 72, size: 22, fill: DIM, align: "center")
      @nodes << text("her looking is the cool line; it never points up", 370, BASE + 98, size: 22, fill: DIM, align: "center")

      # you and me: young adults, adult height; each head is the look's one gold light that means a person
      [[790, you_body, -1.565, HEAD_R[:you], "you", "her daughter", "a young adult, 1.68 m"],
       [1040, me_body, -1.685, HEAD_R[:me], "me", "her lover", "a young adult, 1.80 m"]].each do |x, body, hy, r, name, line2, line3|
        @nodes << at(x, BASE, S, [stroke(body, S, 2.2)] + gold_head(0, hy, r, S))
        @nodes << text(name, x, BASE + 40, size: 32, align: "center")
        @nodes << text(line2, x, BASE + 72, size: 22, fill: DIM, align: "center")
        @nodes << text(line3, x, BASE + 98, size: 22, fill: DIM, align: "center")
      end
    end

    # the hay door as the payoff shows it, at the cast's scale: two lights at standing head height, two faint shapes
    def hay_inset
      x0 = 1330
      ox, oy = x0 - HAYDOOR[:x0] * S, BASE - HAYDOOR[:y1] * S
      kids = [fill(rect(HAYDOOR[:x0] - 0.85, HAYDOOR[:y0] - 0.25, HAYDOOR[:x1] + 0.85, HAYDOOR[:y1] + 0.02), NIGHT),
              stroke(rect(18.42, -5.23, 19.14, -3.02) + rect(20.86, -5.23, 21.58, -3.02), S, 1.2, DIM),
              fill(rect(HAYDOOR[:x0], HAYDOOR[:y0], HAYDOOR[:x1], HAYDOOR[:y1]), LOFT),
              stroke(barn[:bales], S, 1.2, DIM),
              stroke(loft_shoulders, S, 1.5, "#F2E8D580"),
              stroke(barn[:hay], S, 2.4)]
      kids += gold_head(*YOU_HEAD, HEAD_R[:you], S) + gold_head(*ME_HEAD, HEAD_R[:me], S)
      @nodes << at(ox, oy, S, kids)
      cx = x0 + 0.8 * S
      @nodes << text("in the hay door", cx, BASE + 40, size: 32, align: "center")
      @nodes << text("two lights, close together, at standing head height", cx, BASE + 72, size: 22, fill: DIM, align: "center")
      @nodes << text("sill 3 m up; in the film this is all we see of them", cx, BASE + 98, size: 22, fill: DIM, align: "center")
    end

    # ---------------------------------------------------------------- the set, small, with labels
    SET_S, GROUND = 34.0, 1022.0
    def sx(x) = 96 + (x + 6.0) * SET_S
    def sy(y) = GROUND + y * SET_S

    def farm
      s = SET_S
      h, wl, tr, fe, b = house, washing_line, tree, fence, barn
      k = []
      k << fill(rect(-7, 0, 36, 1.2), EARTH)
      k << stroke(field_grass, s, 1.0, DIM)
      k << { type: "path", commands: b[:wall], fill: NIGHT, stroke: PAPER, strokeWidth: 2.0 / s }
      k << stroke(b[:boards], s, 0.8, FAINT)
      k << fill(b[:hay], LOFT)
      k << stroke(b[:roof] + b[:hay] + b[:louvre] + b[:door], s, 1.8)
      k << stroke(b[:leaves], s, 1.0, DIM)
      k << stroke(ladder + hat + shoes, s, 1.3)
      k << stroke(fe[:posts] + fe[:rails], s, 1.5)
      k << stroke(tr[:crown], s, 1.3, DIM)
      k << stroke(tr[:trunk] + tr[:branch] + shift(swing, SWING_PIVOT[0], SWING_PIVOT[1]), s, 1.5)
      k << stroke(wl[:posts] + wl[:line] + wl[:sheets], s, 1.4)
      win = rect(KITCHEN[:x0], KITCHEN[:y0], KITCHEN[:x1], KITCHEN[:y1])
      k << fill(win, PAPER)
      k << stroke(shift(mother(:sink), -2.25, 0), s, 1.6, NIGHT)
      k << { type: "path", commands: h[:wall] + win, fill: NIGHT, evenOdd: true }
      k << stroke(h[:wall] + h[:roof] + h[:chimney] + h[:upstairs] + h[:door] + h[:porch] + h[:bench] + win, s, 1.8)
      k << stroke(seg(-3.0, -1.86, -1.5, -1.86), s, 2.4, NIGHT)
      k << stroke(seg(-7, 0, 36, 0), s, 1.8)
      @nodes << at(sx(0), sy(0), s, k)
      @nodes += gold_head(sx(YOU_HEAD[0]), sy(YOU_HEAD[1]), 5, 1) + gold_head(sx(ME_HEAD[0]), sy(ME_HEAD[1]), 5.5, 1)
      @nodes << text("the set: one ground line, house to barn about 25 m (the readout counts her distance to the hay door)", 96, 694, size: 24)
      under("kitchen window", -2.25, -1.0)
      under("porch", 2.5, -0.35)
      under("washing line", 6.7, -0.85)
      under("swing", 9.85, -0.5)
      under("field's edge", 13.7, -0.6)
      under("two pairs of shoes and his hat", 20.95, -0.05)
      tag("hay door", 20.8, -5.25, 40, -30)
      tag("barn door", 23.3, -2.15, 40, -30)
      tag("ladder", 20.22, -2.4, 70, -14)
    end

    # a label under the ground line, with a leader up to the thing
    def under(str, wx, wy)
      x, y = sx(wx), sy(wy)
      @nodes << { type: "circle", radius: 2.5, x: x, y: y, fill: PAPER }
      @nodes << { type: "line", points: [[x, y], [x, GROUND + 18]], stroke: PAPER, strokeWidth: 1.0, dash: [3, 4] }
      @nodes << text(str, x, GROUND + 42, size: 22, align: "center")
    end

    def tag(str, wx, wy, dx, dy)
      x, y = sx(wx), sy(wy)
      @nodes << { type: "circle", radius: 2.5, x: x, y: y, fill: PAPER }
      @nodes << { type: "line", points: [[x, y], [x + dx * 0.85, y + dy * 0.85]], stroke: PAPER, strokeWidth: 1.1 }
      @nodes << text(str, x + dx + 3, y + dy + 7, size: 22)
    end

    # ---------------------------------------------------------------- the key: what each colour means
    def key
      x, y = 1290, 760
      @nodes << text("the colours", x, y - 6, size: 30)
      rows = [
        [GOLD, "gold light: a person (only the two of them)"],
        [HOT, "hot marks: their laughter, rising from the hay door"],
        [COOL, "cool: where the mother looks, and what she rules out"],
        [PAPER, "paper lines: the world, one stroke width at every zoom"]
      ]
      rows.each_with_index do |(c, str), i|
        yy = y + 40 + i * 44
        case c
        when GOLD then @nodes += gold_head(x + 14, yy - 8, 8, 1)
        when HOT
          @nodes << { type: "path", commands: [["M", -9, -2], ["Q", 0, 9, 9, -2]], x: x + 6, y: yy - 10, fill: nil, stroke: HOT, strokeWidth: 2.3, glow: 7, glowCore: 0.45 }
          @nodes << { type: "path", commands: [["M", -6, -6], ["L", -3, 4], ["M", 3, -7], ["L", 6, 3]], x: x + 26, y: yy - 14, fill: nil, stroke: HOT, strokeWidth: 2.3, glow: 7, glowCore: 0.45 }
        when COOL
          @nodes << { type: "line", points: [[x - 4, yy - 8], [x + 20, yy - 8]], stroke: COOL, strokeWidth: 1.7, dash: [5, 5], glow: 6 }
          @nodes << { type: "line", points: [[x + 24, yy - 16], [x + 38, yy - 2]], stroke: COOL, strokeWidth: 2.4, glow: 6 }
          @nodes << { type: "line", points: [[x + 38, yy - 16], [x + 24, yy - 2]], stroke: COOL, strokeWidth: 2.4, glow: 6 }
        else
          @nodes << { type: "line", points: [[x - 4, yy - 8], [x + 38, yy - 8]], stroke: PAPER, strokeWidth: 2 }
        end
        @nodes << text(str, x + 52, yy, size: 23)
      end
    end

    def build
      @nodes << text("Children at Play, verse 1: cast and set", 96, 78, size: 40)
      @nodes << text("night-sky line look, phase 1 line-up (nothing sung appears on screen)", 98, 112, size: 22, fill: DIM)
      ruler
      cast
      hay_inset
      farm
      key
      { version: 1, background: NIGHT, fonts: FONTS, nodes: @nodes, effects: [{ name: "CIBloom", parameters: { inputRadius: 8, inputIntensity: 0.25 } }] }
    end
  end
end

if $PROGRAM_NAME == __FILE__
  doc = Lineup::Builder.new.build
  out = File.join(Lineup::ROOT, "scenes", "lineup.json")
  File.write(out, JSON.generate(doc))
  puts JSON.generate(path: out, kb: (File.size(out) / 1e3).round)
end
