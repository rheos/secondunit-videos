require "json"

# Which generation backend the pipeline talks to. Fal is the default and unchanged; Higgsfield runs the
# same steps on the signed-in `higgsfield` CLI (plan credits), with Whisper and Demucs run locally.
# Chosen by MV_PROVIDER, else config/project.json "provider", else "fal".
module Provider
  NAMES = %w[fal higgsfield].freeze

  def self.name(env = ENV, root: Dir.pwd)
    chosen = env["MV_PROVIDER"].to_s.strip
    chosen = project_setting(root) if chosen.empty?
    chosen = "fal" if chosen.to_s.empty?
    raise ArgumentError, "MV_PROVIDER must be one of #{NAMES.join(", ")} (got #{chosen.inspect})" unless NAMES.include?(chosen)
    chosen
  end

  def self.higgsfield? = name == "higgsfield"

  def self.client
    higgsfield? ? Higgsfield::Client.new : Fal::Client.new
  end

  # The model class to call for a step's Fal model: itself on Fal, its same-named twin under Higgsfield.
  def self.resolve(fal_model)
    return fal_model unless higgsfield?
    Higgsfield::Models.const_get(fal_model.name.split("::").last, false)
  rescue NameError
    raise ArgumentError, "#{fal_model.name} has no Higgsfield equivalent; use MV_PROVIDER=fal for this step"
  end

  def self.project_setting(root = Dir.pwd)
    path = File.join(root, "config", "project.json")
    File.file?(path) ? JSON.parse(File.read(path))["provider"] : nil
  rescue JSON::ParserError
    nil
  end
end
