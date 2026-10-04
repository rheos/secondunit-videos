require "json"
require "digest"
require "fileutils"
require_relative "client"

module Higgsfield
  # Saved `higgsfield --json model get <job_type>` schemas (rake openapi:fetch with MV_PROVIDER=higgsfield),
  # used like the Fal OpenAPI specs: unknown params, enums and required params fail before any credits are spent.
  module Schema
    def self.path(job_type, dir: "specs") = File.join(dir, "higgsfield_#{job_type}.json")

    def self.fetch(job_type, runner: nil, dir: "specs")
      runner ||= ->(argv) { Open3.capture3(*argv).then { |out, err, st| st.success? ? out : raise(Error, err) } }
      spec = JSON.parse(runner.call([ENV.fetch("HIGGSFIELD_BIN", "higgsfield"), "--json", "model", "get", job_type]))
      FileUtils.mkdir_p(dir)
      File.write(path(job_type, dir: dir), JSON.pretty_generate(spec))
      spec
    end

    def self.validate!(job_type, input)
      return unless File.file?(path(job_type))
      params = JSON.parse(File.read(path(job_type))).fetch("params").to_h { |p| [p["name"], p] }
      missing = params.values.select { |p| p["required"] }.map { |p| p["name"] } - input.keys.map(&:to_s)
      raise ArgumentError, "#{job_type}: missing #{missing.join(", ")}" if missing.any?
      input.each do |key, value|
        param = params[key.to_s] or raise ArgumentError, "#{job_type}: unknown param #{key}"
        if param["enum"] && !param["enum"].include?(value)
          raise ArgumentError, "#{job_type}: #{key}=#{value.inspect} not in #{param["enum"].inspect}"
        end
      end
    end

    def self.summary(job_type)
      spec = JSON.parse(File.read(path(job_type)))
      lines = ["# #{job_type} (#{spec["display_name"]})", "## input"]
      spec.fetch("params").each do |p|
        enum = p["enum"] ? " enum=#{p["enum"].inspect}" : ""
        dflt = p["default"].nil? ? "" : " default=#{p["default"].inspect}"
        lines << "- #{p["name"]}#{p["required"] ? "*" : ""} (#{p["type"]})#{enum}#{dflt}"
      end
      Array(spec["rules"]).each { |r| lines << "rule: #{r["message"]}" }
      lines.join("\n")
    end
  end

  # Higgsfield twins of Fal::Models, one per Fal class name (Provider.resolve maps them), with the same
  # intention-revealing methods. Each translates the Fal-style arguments the steps pass into Higgsfield params.
  module Models
    class Base
      Result = Struct.new(:request_id, :input, :output, keyword_init: true)

      def self.endpoint = self::ENDPOINT
      def self.defaults = const_defined?(:DEFAULTS) ? self::DEFAULTS : {}

      attr_reader :client

      def initialize(client: Higgsfield::Client.new)
        @client = client
      end

      def call(**input)
        input = self.class.defaults.merge(input).compact
        Schema.validate!(self.class.endpoint, input)
        request_id, output = client.run(self.class.endpoint, input)
        Result.new(request_id: request_id, input: input, output: output)
      end

      private

      # Fal-only options the step passed: say which ones are dropped instead of failing or silently ignoring them.
      def drop(**opts)
        used = opts.compact
        client.logger.warn("[higgsfield] #{self.class.endpoint} ignores #{used.keys.join(", ")}") if used.any?
      end
    end

    # GPT Image 2.5 Sunburst xhigh at 2k (2688x1520 for 16:9). The Fal version's explicit pixel sizes become aspect_ratio.
    class GptImage25 < Base
      ENDPOINT = "gpt_image_2_5".freeze
      DEFAULTS = { variant: "sunburst", quality: "xhigh", resolution: "2k", background: "opaque" }.freeze

      def generate(prompt:, aspect_ratio: "16:9", seed: nil, **opts)
        drop(seed: seed, **opts)
        call(prompt: prompt, aspect_ratio: aspect_ratio)
      end
    end

    class GptImage25Edit < Base
      ENDPOINT = "gpt_image_2_5".freeze
      DEFAULTS = GptImage25::DEFAULTS

      def edit(prompt:, image_urls:, aspect_ratio: "16:9", **opts)
        drop(**opts)
        call(prompt: prompt, image_references: Array(image_urls), aspect_ratio: aspect_ratio)
      end
    end

    class NanoBanana2 < Base
      ENDPOINT = "nano_banana_flash".freeze
      DEFAULTS = { resolution: "2k" }.freeze

      def generate(prompt:, aspect_ratio: "16:9", seed: nil, **opts)
        drop(seed: seed, **opts)
        call(prompt: prompt, aspect_ratio: aspect_ratio)
      end
    end

    class NanoBanana2Edit < Base
      ENDPOINT = "nano_banana_flash".freeze
      DEFAULTS = NanoBanana2::DEFAULTS

      def edit(prompt:, image_urls:, aspect_ratio: "auto", seed: nil, **opts)
        drop(seed: seed, **opts)
        call(prompt: prompt, image_references: Array(image_urls), aspect_ratio: aspect_ratio)
      end
    end

    # MiniMax H3 Max. Higgsfield only takes audio next to *reference* media and forbids mixing references with
    # start/end frames, so a singing clip becomes image_references + audio_references (the end frame is dropped),
    # and a silent clip keeps start_image/end_image. The model tops out at 768p; a 1080P request is logged, not hidden.
    class H3MaxImageToVideo < Base
      ENDPOINT = "minimax_h3_max".freeze
      RESOLUTIONS = %w[480p 768p].freeze

      def animate(prompt:, image_url:, duration:, target_audio_url: nil, end_image_url: nil, seed: nil, resolution: nil,
                  aspect_ratio: "16:9", **opts)
        drop(seed: seed, **opts.except(:prompt_expansion_mode, :enable_safety_checker))
        media = if target_audio_url
                  client.logger.warn("[higgsfield] #{ENDPOINT}: end frame dropped; audio needs reference mode") if end_image_url
                  { image_references: [image_url], audio_references: [target_audio_url] }
                else
                  { start_image: image_url, end_image: end_image_url }
                end
        call(prompt: prompt, duration: duration.to_f.ceil, resolution: resolution_for(resolution), aspect_ratio: aspect_ratio, **media)
      end

      private

      def resolution_for(requested)
        res = requested.to_s.downcase
        return res if RESOLUTIONS.include?(res)
        client.logger.warn("[higgsfield] #{ENDPOINT} has no #{requested}; rendering 768p") unless requested.nil?
        "768p"
      end
    end

    # Short sound effects (Mirelo). Takes only prompt + duration.
    class StableAudioSfx < Base
      ENDPOINT = "mirelo_text_to_audio".freeze

      def generate(prompt:, duration: 2, seed: nil, negative_prompt: nil, **opts)
        drop(seed: seed, negative_prompt: negative_prompt, **opts.except(:output_format))
        call(prompt: prompt, duration: duration)
      end
    end

    class Music3 < Base
      ENDPOINT = "unsupported:minimax-music-3".freeze

      def compose(**)
        raise Error, "MiniMax Music 3 is not on Higgsfield. Supply the song (generation music_from:) or run this step with MV_PROVIDER=fal"
      end
    end

    # Local stand-ins (no Higgsfield job, no credits): same call shape and Fal-shaped output.
    class LocalBase < Base
      private

      def local(key)
        dir = File.expand_path("output/local")
        FileUtils.mkdir_p(dir)
        cache = File.join(dir, "#{self.class::ENDPOINT.tr(":", "_")}-#{Digest::SHA256.hexdigest(JSON.generate(key))}.json")
        return JSON.parse(File.read(cache)) if File.file?(cache)
        yield(dir).tap { |out| File.write(cache, JSON.pretty_generate(out)) }
      end
    end

    # faster-whisper on this machine. chunk_level "word" gives Fal-style word chunks { text, timestamp: [s, e] }.
    class Whisper < LocalBase
      ENDPOINT = "local:faster-whisper".freeze

      def transcribe(audio_url:, chunk_level: "segment", language: "en", **)
        path = client.local_path(audio_url)
        model = ENV.fetch("WHISPER_MODEL", "small")
        out = local([Digest::SHA256.file(path).hexdigest, chunk_level, language, model]) do
          Media::LocalAi.new.transcribe(path, words: chunk_level == "word", language: language, model: model)
        end
        Result.new(request_id: "local-whisper-#{Digest::SHA256.file(path).hexdigest[0, 12]}", input: { audio: path, chunk_level: chunk_level }, output: out)
      end
    end

    # Demucs on this machine (htdemucs; DEMUCS_MODEL=htdemucs_ft matches Fal's default at ~4x the time).
    class Demucs < LocalBase
      ENDPOINT = "local:demucs".freeze

      def separate(audio_url:, stems: %w[vocals], **)
        path = client.local_path(audio_url)
        model = ENV.fetch("DEMUCS_MODEL", "htdemucs")
        out = local([Digest::SHA256.file(path).hexdigest, stems.sort, model]) do |dir|
          files = Media::LocalAi.new.stems(path, File.join(dir, "demucs"), stems: stems, model: model)
          files.transform_values { |file| { "url" => "file://#{file}" } }
        end
        Result.new(request_id: "local-demucs-#{Digest::SHA256.file(path).hexdigest[0, 12]}", input: { audio: path, stems: stems }, output: out)
      end
    end
  end
end
