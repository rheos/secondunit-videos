# Finishing-pass cue sheets from the scene's own picture events (see references/native-workflow.md, "Finish").
#
# Copy to <project>/scenes/finish_cues.rb. After the clean master exists:
#   ruby scenes/finish_cues.rb output/<name>_clean.mp4 [scenes/<name>.events.json]
# writes (all generated: edit this file, not them)
#   prompts/finish-sfx/sfx.yml         procedural Swift SoundSynth SFX (free, offline) mixed under the music -> <name>_clean_sfx.mp4
#   prompts/finish-vfx/cues.yml        Swift VFX over that mix, Metal shader cues included               -> <name>_clean_finished.mp4
#   prompts/finish-vfx-plain/cues.yml  the same without the shader cues (an A/B and a safer fallback)    -> <name>_clean_finished_plain.mp4
# then run sfx:gen, sfx:mix, vfx:render (VFX=finish-vfx-plain and VFX=finish-vfx).
#
# Event kinds written by scene-template.rb: section {name, big, neon}, flash, word, typed {until, keys}, accent {amp}.
# Times are video seconds. SFX `at` is where a sound starts; VFX `f`/`dur` are frames on a 24 fps cue grid at any video rate.
require "json"
require "yaml"
require "fileutils"

class FinishCues
  ROOT = File.expand_path("../work/ihd", __dir__)
  CUE_FPS = 24.0

  # Sound palette: name => SoundSynth spec (mgraphics --sfx). Several seeds per kind so repeats don't sound copy-pasted.
  SOUNDS = {
    "whoosh_a" => { "synth" => "whoosh", "duration" => 0.6, "peak" => 0.75, "from" => 300, "to" => 4200, "seed" => 1, "pan" => [-0.7, 0.7] },
    "whoosh_b" => { "synth" => "whoosh", "duration" => 0.5, "peak" => 0.8, "from" => 400, "to" => 5500, "seed" => 2, "pan" => [0.7, -0.7] },
    "riser" => { "synth" => "riser", "duration" => 1.6, "from" => 250, "to" => 6500, "seed" => 1 },
    "impact" => { "synth" => "impact", "duration" => 1.0, "freq" => 46, "seed" => 1 },
    "impact_soft" => { "synth" => "impact", "duration" => 0.6, "freq" => 72, "seed" => 2 },
    "subdrop" => { "synth" => "subdrop", "duration" => 1.6, "from" => 95, "to" => 28 },
    "type_a" => { "synth" => "type", "seed" => 1 },
    "type_b" => { "synth" => "type", "seed" => 2 },
    "type_c" => { "synth" => "type", "seed" => 3 },
    "shimmer" => { "synth" => "shimmer", "duration" => 1.4, "freq" => 1800, "seed" => 1 }
  }.freeze
  SHADERS = %w[shockwave streaks lens heat].freeze

  def initialize(clean, events_path)
    @clean = clean
    data = JSON.parse(File.read(File.expand_path(events_path, ROOT)))
    @duration = data["duration"]
    @events = data["events"]
    @sfx, @vfx = [], []
  end

  def of(kind) = @events.select { |e| e["kind"] == kind }
  def fr(t) = (t * CUE_FPS + 1e-6).floor
  def sections = of("section")
  def section_end(sec) = (sections.map { |s| s["t"] }.select { |t| t > sec["t"] }.min || @duration)

  # Seconds from a sound's start (leading silence trimmed) to its loudest moment: the sidecar sfx:gen writes, else an estimate.
  def peak(sound)
    meta = File.join(ROOT, "output", "finish-sfx", "sounds", "#{sound}.json")
    return JSON.parse(File.read(meta))["peak_at"] if File.exist?(meta)
    s = SOUNDS.fetch(sound)
    s["synth"] == "whoosh" ? s["duration"] * s["peak"] : 0.0
  end

  def sfx(sound, at, db, **kw) = (@sfx << { "at" => at.round(3), "sound" => sound, "rel_db" => db, **kw.transform_keys(&:to_s) } if at >= 0)
  def crest(sound, t, db, **kw) = sfx(sound, t - peak(sound), db, **kw)                     # loudest moment on t
  def land(sound, t, db, **kw) = sfx(sound, t - SOUNDS.fetch(sound)["duration"], db, **kw) # ends abruptly on t
  def vfx(fx, t, dur, **kw) = @vfx << { "fx" => fx, "f" => fr(t), "dur" => dur, **kw.transform_keys(&:to_s) }

  # A ballad: quiet sound under each friend arriving, nothing that hits. Each sound lands 1 frame after its event.
  # Quiet sound on the picture's own events, nothing that hits. Each sound lands 1 frame after its event.
  def sound_design
    hit = 1 / CUE_FPS
    of("arrive").each_with_index { |e, i| sfx("shimmer", e["t"] + hit, i.even? ? -25 : -27) }
    of("first_friend").each { |e| sfx("shimmer", e["t"] + hit, -21) }
    of("settle").each { |e| crest("whoosh_a", e["t"] + 1.0, -24) }
    of("whoosh").each { |e| crest("whoosh_a", e["t"] + 1.0, -25) }
    of("rip").each { |e| sfx("whoosh_b", e["t"], -24) }
    of("stamp").each { |e| sfx("impact_soft", e["t"] + hit, -23) }
    of("snap").each_with_index { |e, i| sfx(%w[type_a type_b type_c][i % 3], e["t"] + hit, -21) }
    of("stitch").each_with_index { |e, i| sfx(%w[type_b type_c][i % 2], e["t"] + hit, -28) }
    of("pass").each_with_index { |e, i| sfx(%w[type_a type_c][i % 2], e["t"] + hit, -28) }
    of("flicker").each { |e| sfx("type_c", e["t"] + hit, -26) }
    of("tv_off").each { |e| sfx("impact_soft", e["t"] + hit, -27) }
    of("relight").each { |e| sfx("shimmer", e["t"] + hit, -22) }
  end

  def picture
    of("peak").each do |e|
      vfx("glow", e["t"] - 0.8, 60, amt: e["t"] > 260 ? 0.42 : 0.3, radius: 18)
      vfx("zoom", e["t"] - 1.5, 48, amt: 0.02)
    end
  end

  def write
    sound_design
    picture
    base = File.basename(@clean, ".mp4")
    sfx_out = "output/#{base}_sfx.mp4"
    put("finish-sfx", "sfx.yml", { "source" => @clean, "out" => sfx_out, "rel_db" => -13, "peak_db" => -11, "max_gain_db" => 14,
                                   "sounds" => SOUNDS, "cues" => @sfx.sort_by { |c| c["at"] } })
    cues = @vfx.select { |c| c["f"] >= 0 }.sort_by { |c| [c["f"], c["fx"]] }
    put("finish-vfx", "cues.yml", { "source" => sfx_out, "out" => "output/#{base}_finished.mp4", "bitrate" => 15_000_000, "cues" => cues })
    put("finish-vfx-plain", "cues.yml", { "source" => sfx_out, "out" => "output/#{base}_finished_plain.mp4", "bitrate" => 15_000_000,
                                          "cues" => cues.reject { |c| SHADERS.include?(c["fx"]) } })
    { sfx: @sfx.size, vfx: @vfx.size, sfx_out: sfx_out }
  end

  private

  def put(dir, file, doc)
    path = File.join(ROOT, "prompts", dir)
    FileUtils.mkdir_p(path)
    File.write(File.join(path, file), "# generated by scenes/finish_cues.rb — edit that, not this\n" + YAML.dump(doc))
  end
end

if $PROGRAM_NAME == __FILE__
  clean = ARGV[0] or abort "usage: ruby scenes/finish_cues.rb output/<name>_clean.mp4 [scenes/<name>.events.json]"
  events = ARGV[1] || Dir[File.join(__dir__, "*.events.json")].first or abort "no scenes/*.events.json: run the scene generator first"
  puts JSON.generate(FinishCues.new(clean, events).write)
end
