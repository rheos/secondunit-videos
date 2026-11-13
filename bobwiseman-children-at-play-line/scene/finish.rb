# VFX finish for verse 1, placed only from the scene's own events (work/mv/scenes/cap.events.json).
# No sound is added: the soundtrack is the song. A quiet song, so nothing hits hard.
#   ruby scene/finish.rb out/full/cap-line_clean.mp4 out/full/vfx.json
# writes the mvfx cue list; render with
#   work/mv/tools/vfx/.build/release/mvfx --in <clean.mp4> --cues <vfx.json> --out <finished.mp4>
require "json"

CUE_FPS = 24.0
events_path = File.expand_path("../work/mv/scenes/cap.events.json", __dir__)
data = JSON.parse(File.read(events_path))
events = data["events"]
duration = data["duration"]
of = ->(kind) { events.select { |e| e["kind"] == kind } }
fr = ->(t) { (t * CUE_FPS + 1e-6).floor }
cues = []
vfx = ->(fx, t, dur, **kw) { cues << { "fx" => fx, "f" => fr.(t), "dur" => dur, **kw.transform_keys(&:to_s) } }

# A big laugh carries across the farm (its ring event): the picture blooms softly as the ring passes.
of.("ring").each do |e|
  big = e["radius"] > 20
  vfx.("glow", e["t"], big ? 30 : 18, amt: big ? 0.3 : 0.18, radius: 16, pre: 4)
end

# Every laugh: a few small gold glints at the hay door, where the two of them are. Big laughs get more.
of.("laugh").each do |e|
  n = e["size"]
  next unless e["x"].between?(0.02, 0.98) && e["y"].between?(0.02, 0.98)
  vfx.("glints", e["t"], n >= 7 ? 30 : 18, x: e["x"], y: e["y"], n: n >= 7 ? 9 : [n + 1, 5].min, radius: 0.025,
                                          size: n >= 7 ? 0.45 : 0.32, color: "#FFC531", amt: n >= 7 ? 0.8 : 0.55, seed: fr.(e["t"]))
end

# She turns to the barn on the big laugh: one small push, the only accent in the verse.
of.("turn").each { |e| vfx.("punch", e["t"], 8, amt: 0.018, radius: 1) }

# The last seconds: a slow creep in on the hay door, then ease out to black.
of.("arrive").each { |e| vfx.("zoom", e["t"], fr.(duration) - fr.(e["t"]), amt: 0.02) }
vfx.("dark", duration - 0.75, 22, amt: 0.92, hold: 22, pre: 6)

out = ARGV[1] or abort "usage: ruby scene/finish.rb <clean.mp4> <vfx.json>"
list = cues.select { |c| c["f"] >= 0 }.sort_by { |c| [c["f"], c["fx"]] }
File.write(out, JSON.pretty_generate({ "cues" => list }))
puts JSON.generate(cues: list.size, out: out)
