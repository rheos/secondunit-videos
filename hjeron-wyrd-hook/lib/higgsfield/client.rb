require "excon"
require "json"
require "open3"
require "logger"
require "fileutils"
require "digest"

module Higgsfield
  class Error < StandardError; end
  class JobFailed < Error; end

  # Wraps the signed-in `higgsfield` CLI, so generations spend the account's plan credits (not the separately
  # billed Cloud API). Same surface the pipeline uses on Fal::Client: run / result / upload / download.
  #   higgsfield --json generate cost <job_type> ...   -> { credits }
  #   higgsfield --json generate create <job_type> ... -> job (or [job])
  #   higgsfield generate wait <id>                    -> blocks until the job ends
  #   higgsfield --json generate get <id>              -> { id, status, result_url, ... }
  #   higgsfield --json upload create <path>           -> { id, url }
  # Media flags take an upload id or a job id, so a finished image job feeds H3 without another upload.
  # Every url this client hands out is remembered in output/higgsfield/media.json (url -> id, local path).
  class Client
    FAILED = %w[failed nsfw canceled cancelled error].freeze
    MEDIA_FLAGS = { "image_references" => "--image-references", "audio_references" => "--audio-references",
                    "video_references" => "--video-references", "start_image" => "--start-image", "end_image" => "--end-image" }.freeze
    UUID = /\A\h{8}-\h{4}-\h{4}-\h{4}-\h{12}\z/
    MEDIA_STORE = "output/higgsfield/media.json".freeze

    attr_reader :logger

    # runner: ->(argv) { stdout } for tests; defaults to running the CLI.
    def initialize(logger: Logger.new($stderr), runner: nil, timeout: ENV.fetch("HIGGSFIELD_TIMEOUT", "30m"),
                   bin: ENV.fetch("HIGGSFIELD_BIN", "higgsfield"))
      @logger, @timeout, @bin = logger, timeout, bin
      @runner = runner || method(:shell)
    end

    # Estimate, submit, wait, fetch. Returns [job_id, Fal-shaped output]. The receipt is written before waiting,
    # so an interrupted run resumes the same job instead of paying for a second one (NEW_REQUEST=1 forces one).
    def run(job_type, input)
      require_relative "../workflow/approval"
      Workflow::Approval.new.check!
      FileUtils.mkdir_p("output/requests")
      fingerprint = Digest::SHA256.hexdigest(JSON.generate(["higgsfield", job_type, input]))
      receipt = "output/requests/#{fingerprint}.json"
      File.open("#{receipt}.lock", File::CREAT | File::RDWR) do |lock|
        lock.flock(File::LOCK_EX)
        pending = "#{receipt}.pending"
        if File.exist?(receipt) && ENV["NEW_REQUEST"] != "1"
          submission = JSON.parse(File.read(receipt))
        else
          # A pending marker without a receipt means an earlier run died between `create` (charged) and writing
          # the receipt. Resubmitting would pay twice, so stop until someone checks the account's job list.
          if File.exist?(pending) && ENV["NEW_REQUEST"] != "1"
            raise Error, "an earlier #{job_type} submit may already be charged (#{pending}); check `higgsfield generate list`, " \
                         "then write its job id into #{receipt} as {\"request_id\": \"<id>\"} to resume it, or set NEW_REQUEST=1 to pay again"
          end
          args = arguments(input)
          credits = cli("generate", "cost", job_type, *args)["credits"]
          logger.info("[higgsfield] #{job_type} estimate: #{credits} credits")
          File.write(pending, JSON.generate(job_type: job_type, at: Time.now.utc.to_s))
          created = raw("--json", "generate", "create", job_type, *args)
          job_id = first_job_id(created)
          submission = { "provider" => "higgsfield", "request_id" => job_id, "job_type" => job_type, "credits_estimate" => credits }
          File.write("#{receipt}.tmp", JSON.pretty_generate(submission))
          File.rename("#{receipt}.tmp", receipt)
          File.delete(pending)
        end
        id = submission.fetch("request_id")
        logger.info("[higgsfield] #{job_type} job=#{id}; receipt=#{receipt}")
        begin
          return [id, output(wait(id))]
        rescue JobFailed
          # A failed/blocked job is not charged: archive its receipt so the next run submits afresh.
          # Timeouts keep the receipt, so a still-running paid job is resumed, never paid twice.
          FileUtils.mkdir_p("output/requests/failed")
          File.rename(receipt, "output/requests/failed/#{fingerprint}-#{id}.json")
          raise
        end
      end
    end

    # Re-fetch a finished job (rake adopt/pick).
    def result(_job_type, id) = output(finished!(cli("generate", "get", id)))

    # The job's own status decides the outcome: `wait` may exit non-zero on a failed job or a timeout.
    def wait(id)
      begin
        raw("generate", "wait", id, "--timeout", @timeout, "--quiet")
      rescue Error => e
        logger.warn("[higgsfield] wait #{id}: #{e.message.lines.first&.strip}")
      end
      finished!(cli("generate", "get", id))
    end

    # Upload a local file (cached by content); returns its hosted url, usable anywhere a step expects *_url.
    def upload(path, **)
      key = Digest::SHA256.file(path).hexdigest
      media do |store|
        hit = store["uploads"][key]
        return hit.fetch("url") if hit && ENV["REFRESH_UPLOAD"] != "1"
        up = cli("upload", "create", File.expand_path(path))
        entry = { "id" => up.fetch("id"), "url" => up.fetch("url"), "path" => File.expand_path(path) }
        store["uploads"][key] = entry
        store["urls"][entry["url"]] = entry.slice("id", "path")
        logger.info("[higgsfield] uploaded #{path} -> #{entry["url"]}")
        entry["url"]
      end
    end

    def download(url, path)
      if (local = local_file(url))
        FileUtils.cp(local, path) unless File.expand_path(local) == File.expand_path(path)
        return path
      end
      File.open(path, "wb") do |f|
        streamer = ->(chunk, _remaining, _total) { f.write(chunk) }
        resp = Excon.get(url, response_block: streamer, middlewares: Excon.defaults[:middlewares] + [Excon::Middleware::RedirectFollower])
        raise Error, "download #{url} failed (HTTP #{resp.status})" unless resp.status == 200
      end
      logger.info("[higgsfield] downloaded #{url} -> #{path}")
      path
    end

    # A local file for a url/path this client knows (upload source, local model output), downloading it if needed.
    # Local models (Whisper, Demucs) read their input through this.
    def local_path(ref)
      return local_file(ref) if local_file(ref)
      known = media { |store| store["urls"][ref] }
      return known["path"] if known && known["path"] && File.file?(known["path"])
      dest = File.expand_path("output/higgsfield/fetched/#{Digest::SHA256.hexdigest(ref)}#{File.extname(ref.split("?").first)}")
      FileUtils.mkdir_p(File.dirname(dest))
      File.file?(dest) ? dest : download(ref, dest)
    end

    # CLI flags for a model input: media values become ids (uploading local files once), scalars --key value.
    def arguments(input)
      input.flat_map do |key, value|
        key = key.to_s
        next [] if value.nil?
        if (flag = MEDIA_FLAGS[key])
          Array(value).flat_map { |ref| [flag, media_id(ref)] }
        else
          ["--#{key}", value.to_s]
        end
      end
    end

    # An id the CLI accepts for this media: a known url's upload/job id, a local file uploaded now,
    # or an unknown url fetched and uploaded.
    def media_id(ref)
      ref = ref.to_s
      return ref if ref.match?(UUID)
      unless (file = local_file(ref))
        known = media { |store| store["urls"][ref] }
        return known.fetch("id") if known&.dig("id")
        file = local_path(ref)
      end
      url = upload(file)
      media { |store| store["urls"].fetch(url).fetch("id") }
    end

    private

    # Fal-shaped output (images / video / audio all point at the one result) so steps materialize unchanged.
    def output(job)
      url = job["result_url"] || job.dig("results", 0, "url") || raise(Error, "job #{job["id"]} finished without a result_url")
      media { |store| store["urls"][url] = { "id" => job.fetch("id") } }
      { "images" => [{ "url" => url }], "video" => { "url" => url }, "audio" => { "url" => url },
        "job" => job.slice("id", "job_type", "status", "created_at") }
    end

    def finished!(job)
      state = job["status"].to_s.downcase
      raise JobFailed, "higgsfield job #{job["id"]} #{state}: #{job["error"] || job["message"]}".rstrip if FAILED.include?(state)
      raise Error, "higgsfield job #{job["id"]} still #{state} after #{@timeout}; rerun to resume it (receipt kept)" unless state == "completed"
      job
    end

    # `generate create --json` prints a list of job ids (observed 2026-09-28: ["78babdbb-..."]); an object
    # form is accepted too. Any other output raises, and the pending marker then blocks a blind resubmit.
    def first_job_id(output)
      created = JSON.parse(output)
      job = created.is_a?(Array) ? created.first : created
      job = job["job"] || job if job.is_a?(Hash)
      id = job.is_a?(Hash) ? job["id"] : job
      raise Error, "unexpected create response: #{output.to_s[0, 300]}" unless id.to_s.match?(UUID)
      id
    rescue JSON::ParserError
      raise Error, "higgsfield generate create returned non-JSON: #{output.to_s[0, 300]}"
    end

    def local_file(ref)
      path = ref.to_s.delete_prefix("file://")
      return nil if path.match?(%r{\A[a-z]+://}) || path.empty?
      File.file?(path) ? path : nil
    end

    # flock'd read-modify-write of the url/id store, shared by parallel workers.
    def media
      FileUtils.mkdir_p(File.dirname(MEDIA_STORE))
      File.open("#{MEDIA_STORE}.lock", File::CREAT | File::RDWR) do |lock|
        lock.flock(File::LOCK_EX)
        store = File.file?(MEDIA_STORE) ? JSON.parse(File.read(MEDIA_STORE)) : {}
        store["uploads"] ||= {}
        store["urls"] ||= {}
        before = JSON.generate(store)
        value = yield store
        if JSON.generate(store) != before
          File.write("#{MEDIA_STORE}.tmp", JSON.pretty_generate(store))
          File.rename("#{MEDIA_STORE}.tmp", MEDIA_STORE)
        end
        value
      end
    end

    def cli(*args)
      out = raw("--json", *args)
      JSON.parse(out)
    rescue JSON::ParserError
      raise Error, "higgsfield #{args.first(2).join(" ")} returned non-JSON: #{out.to_s[0, 300]}"
    end

    def raw(*args) = @runner.call([@bin, *args.map(&:to_s)])

    def shell(argv)
      out, err, status = Open3.capture3(*argv)
      raise Error, "#{argv.first(3).join(" ")} failed (#{status.exitstatus}): #{(err.empty? ? out : err)[-1500..] || err}" unless status.success?
      out
    end
  end
end
