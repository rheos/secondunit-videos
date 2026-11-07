# Sound and VFX cues for test 02, read from the picture events in scenes/adminb.events.json, so a re-time moves them too.
# ruby scene/finish_cues_b.rb output/adminb_clean.mp4 scenes/adminb.events.json
require_relative "finish_cues"

class FinishCuesB < FinishCues
  HIT = 1 / CUE_FPS

  def sound_design
    of("draw").each { |e| crest("whoosh_a", e["t"] + 0.4, -24) }
    of("lock_small").each { |e| sfx("type_a", e["t"] + HIT, -22); sfx("shimmer", e["t"] + HIT, -30) }
    of("scan").each { |e| crest("whoosh_a", e["t"] + 0.9, -15); sfx("shimmer", e["t"] + 0.5, -24) }
    of("typed").each do |e|
      last = -1
      e["keys"].each_with_index do |k, j|
        next if k - last < 0.055
        sfx(%w[type_a type_b type_c][j % 3], k, -22)
        last = k
      end
    end
    of("fall").each { |e| crest("whoosh_b", e["t"] + 0.5, -13) }
    of("burst").each { |e| crest("whoosh_a", e["t"] + 0.3, -20) }
    of("thud").each { |e| sfx("impact_soft", e["t"] + HIT, -16) }
    of("thud").last(1).each { |e| sfx("subdrop", e["t"] + HIT, -20) }
    of("tick").each { |e| sfx("type_a", e["t"] + HIT, -22); sfx("type_b", e["t"] + HIT + 0.05, -24) }
    of("dive").each { |e| land("riser", e["until"], -12); crest("whoosh_b", e["until"] - 0.25, -14) }
    of("lock").each { |e| sfx("impact", e["t"] + HIT, -10); sfx("subdrop", e["t"] + HIT, -13); sfx("shimmer", e["t"] + HIT, -22) }
    of("spread").each { |e| crest("whoosh_a", e["t"] + 0.6, -17) }
    of("stop").each { |e| sfx("impact", e["t"] + HIT, -9); sfx("impact_soft", e["t"] + HIT, -14) }
    of("shatter").each { |e| sfx("shimmer", e["t"] + HIT, -18); crest("whoosh_b", e["t"] + 0.2, -19) }
    of("card").each_with_index { |e, i| sfx(%w[type_a type_b type_c][i % 3], e["t"] + HIT, -20) }
    of("build").each { |e| crest("whoosh_a", e["t"] + 0.7, -17); sfx("shimmer", e["t"] + 1.1, -20) }
    of("word").each { |e| sfx("impact_soft", e["t"] + HIT, -16) }
  end

  def picture
    of("scan").each { |e| vfx("streaks", e["t"], fr(e["until"]) - fr(e["t"]), amt: 0.6, fade: 6) }
    of("lock").each do |e|
      vfx("rgb", e["t"], 6, amt: 0.007)
      vfx("shockwave", e["t"], 14, amt: 0.9, x: 0.5, y: 0.5, radius: 0.5)
      vfx("lens", e["t"], 10, amt: 0.1)
    end
    of("stop").each do |e|
      vfx("rgb", e["t"], 5, amt: 0.006)
      vfx("shockwave", e["t"], 12, amt: 0.6, x: 0.5, y: 0.5, radius: 0.6)
    end
    of("word").each_with_index { |e, i| vfx("stretch", e["t"], 5, amt: 0.07, angle: i.even? ? 0 : 90) }
    of("build").each { |e| vfx("streaks", e["t"], fr(@duration - 0.6) - fr(e["t"]), amt: 0.55, fade: 10) }
  end
end

clean = ARGV[0] or abort "usage: ruby scene/finish_cues_b.rb output/<name>_clean.mp4 scenes/<name>.events.json"
puts JSON.generate(FinishCuesB.new(clean, ARGV[1]).write)
