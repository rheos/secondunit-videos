require_relative "spec_helper"

# A stand-in for the `higgsfield` CLI: records argv, answers like the real --json output, never touches the
# network or spends credits. Shapes observed from the real CLI 1.1.25 on 2026-09-28: `upload create` ->
# {id, type, url}; `generate cost` -> {credits}; `generate create` -> ["<job id>"] (a bare list of ids);
# `generate get` -> {id, status, result_url, ...}.
class FakeHiggsfieldCli
  attr_reader :calls
  attr_writer :create_output

  def initialize(status: "completed", result_url: "https://cdn.test/hf/result.png")
    @calls, @status, @result_url, @jobs = [], status, result_url, 0
  end

  def call(argv)
    @calls << argv
    args = argv.drop(1) - ["--json"]
    case args.first(2)
    when %w[generate cost] then JSON.generate(credits: 12.5)
    when %w[generate create]
      @jobs += 1
      @create_output || JSON.generate([format("00000000-0000-0000-0000-%012d", @jobs)])
    when %w[generate wait] then @status == "completed" ? "" : raise(Higgsfield::Error, "higgsfield generate wait failed (1): job #{@status}")
    when %w[generate get] then JSON.generate(id: args[2], status: @status, result_url: @result_url)
    when %w[upload create]
      JSON.generate(id: format("aaaaaaaa-0000-0000-0000-%012d", calls.size), url: "https://cdn.test/hf/#{File.basename(args[2])}")
    else raise "unexpected higgsfield call #{argv.inspect}"
    end
  end

  def commands(verb) = calls.map { |argv| argv.drop(1) - ["--json"] }.select { |a| a.first(2) == verb.split }
end

RSpec.describe "Higgsfield provider", :core do
  def hf_client(cli) = Higgsfield::Client.new(runner: cli, logger: Logger.new(File::NULL))

  it "is opt-in: Fal stays the default, and MV_PROVIDER or the project config selects Higgsfield" do
    with_workspace do
      ENV.delete("MV_PROVIDER")
      expect(Provider.name).to eq("fal")
      expect(Provider.resolve(Fal::Models::H3MaxImageToVideo)).to eq(Fal::Models::H3MaxImageToVideo)
      json("config/project.json", provider: "higgsfield")
      expect(Provider.name).to eq("higgsfield")
      expect(Provider.resolve(Fal::Models::H3MaxImageToVideo)).to eq(Higgsfield::Models::H3MaxImageToVideo)
      ENV["MV_PROVIDER"] = "fal"
      expect(Provider.name).to eq("fal")
      ENV["MV_PROVIDER"] = "replicate"
      expect { Provider.name }.to raise_error(ArgumentError, /fal, higgsfield/)
    end
  end

  it "never runs a paid job before plan approval" do
    with_workspace do
      cli = FakeHiggsfieldCli.new
      expect { Higgsfield::Models::GptImage25.new(client: hf_client(cli)).generate(prompt: "x") }.to raise_error(/approval missing/)
      expect(cli.calls).to be_empty
    end
  end

  it "estimates, submits once, and resumes an identical request from its receipt" do
    with_workspace do
      approve
      cli = FakeHiggsfieldCli.new
      model = Higgsfield::Models::GptImage25.new(client: hf_client(cli))
      first = model.generate(prompt: "same character on flat chroma green")
      second = model.generate(prompt: "same character on flat chroma green")
      expect(second.request_id).to eq(first.request_id)
      expect(cli.commands("generate create").size).to eq(1)
      expect(cli.commands("generate cost").size).to eq(1)
      create = cli.commands("generate create").first
      expect(create.drop(3).each_slice(2).to_h).to include("--variant" => "sunburst", "--quality" => "xhigh", "--resolution" => "2k", "--aspect_ratio" => "16:9")
      receipt = JSON.parse(File.read(Dir["output/requests/*.json"].first))
      expect(receipt).to include("provider" => "higgsfield", "credits_estimate" => 12.5)
      expect(first.output.dig("images", 0, "url")).to eq("https://cdn.test/hf/result.png")
    end
  end

  it "sends a singing clip in reference mode and a silent clip with start/end frames" do
    with_workspace do
      approve
      File.write("still.png", "png bytes")
      File.write("vocal.wav", "wav bytes")
      cli = FakeHiggsfieldCli.new(result_url: "https://cdn.test/hf/clip.mp4")
      client = hf_client(cli)
      still = client.upload("still.png")
      h3 = Higgsfield::Models::H3MaxImageToVideo.new(client: client)
      sung = h3.animate(prompt: "sing", image_url: still, end_image_url: still, target_audio_url: client.upload("vocal.wav"),
                        duration: 5.5, resolution: "1080P")
      expect(sung.input).to include(resolution: "768p", duration: 6, image_references: [still])
      expect(sung.input).not_to include(:start_image, :end_image)
      sung_args = cli.commands("generate create").last
      expect(sung_args).to include("--image-references", "--audio-references")
      expect(sung_args).not_to include("--start-image")
      # Media go by id, and the uploads are not repeated.
      expect(sung_args[sung_args.index("--image-references") + 1]).to match(Higgsfield::Client::UUID)
      expect(cli.commands("upload create").size).to eq(2)
      h3.animate(prompt: "turn", image_url: still, end_image_url: still, duration: 5)
      silent = cli.commands("generate create").last
      expect(silent).to include("--start-image", "--end-image")
      expect(silent).not_to include("--audio-references")
      expect(sung.output.dig("video", "url")).to eq("https://cdn.test/hf/clip.mp4")
    end
  end

  it "chains a finished job into the next one by job id, without a new upload" do
    with_workspace do
      approve
      cli = FakeHiggsfieldCli.new
      client = hf_client(cli)
      base = Higgsfield::Models::GptImage25.new(client: client).generate(prompt: "base")
      Higgsfield::Models::GptImage25Edit.new(client: client).edit(prompt: "new pose", image_urls: [base.output.dig("images", 0, "url")])
      edit = cli.commands("generate create").last
      expect(edit[edit.index("--image-references") + 1]).to eq(base.request_id)
      expect(cli.commands("upload create")).to be_empty
    end
  end

  it "never resubmits after a run died between a charged create and its receipt" do
    with_workspace do
      approve
      cli = FakeHiggsfieldCli.new
      cli.create_output = "Created job, see dashboard" # not the id list: the receipt cannot be written
      model = -> { Higgsfield::Models::GptImage25.new(client: hf_client(cli)).generate(prompt: "x") }
      expect { model.call }.to raise_error(Higgsfield::Error, /unexpected create response|non-JSON/)
      cli.create_output = nil
      expect { model.call }.to raise_error(Higgsfield::Error, /may already be charged/)
      expect(cli.commands("generate create").size).to eq(1)
      ENV["NEW_REQUEST"] = "1"
      expect(model.call.request_id).to match(Higgsfield::Client::UUID)
      expect(cli.commands("generate create").size).to eq(2)
    end
  end

  it "archives an uncharged failed job's receipt so a rerun submits afresh" do
    with_workspace do
      approve
      cli = FakeHiggsfieldCli.new(status: "nsfw")
      expect { Higgsfield::Models::NanoBanana2.new(client: hf_client(cli)).generate(prompt: "x") }.to raise_error(Higgsfield::JobFailed, /nsfw/)
      expect(Dir["output/requests/*.json"]).to be_empty
      expect(Dir["output/requests/failed/*.json"].size).to eq(1)
      expect { Higgsfield::Models::NanoBanana2.new(client: hf_client(cli)).generate(prompt: "x") }.to raise_error(Higgsfield::JobFailed)
      expect(cli.commands("generate create").size).to eq(2)
    end
  end

  it "keeps the receipt when a job is still running, so a rerun resumes it without paying again" do
    with_workspace do
      approve
      cli = FakeHiggsfieldCli.new(status: "in_progress")
      expect { Higgsfield::Models::NanoBanana2.new(client: hf_client(cli)).generate(prompt: "x") }.to raise_error(Higgsfield::Error, /still in_progress/)
      expect(Dir["output/requests/*.json"].size).to eq(1)
      expect { Higgsfield::Models::NanoBanana2.new(client: hf_client(cli)).generate(prompt: "x") }.to raise_error(Higgsfield::Error, /still/)
      expect(cli.commands("generate create").size).to eq(1)
    end
  end

  it "validates against a saved `model get` schema before spending anything" do
    with_workspace do
      approve
      json(Higgsfield::Schema.path("minimax_h3_max"), params: [
        { name: "prompt", required: true }, { name: "duration" }, { name: "aspect_ratio", enum: %w[auto 16:9] },
        { name: "resolution", enum: %w[480p 768p] }, { name: "start_image" }, { name: "end_image" }
      ])
      cli = FakeHiggsfieldCli.new
      h3 = Higgsfield::Models::H3MaxImageToVideo.new(client: hf_client(cli))
      expect { h3.animate(prompt: "x", image_url: "00000000-0000-0000-0000-000000000009", duration: 5, aspect_ratio: "2:1") }
        .to raise_error(ArgumentError, /aspect_ratio/)
      expect(cli.calls).to be_empty
    end
  end

  it "refuses MiniMax Music 3 with a pointer to a supplied song" do
    expect { Higgsfield::Models::Music3.new(client: double("unused")).compose(prompt: "x", lyrics: "y", duration: 5) }
      .to raise_error(Higgsfield::Error, /music_from/)
  end

  it "runs Whisper locally from an uploaded url's source file and caches the transcript" do
    with_workspace do
      File.write("song.wav", "wav bytes")
      cli = FakeHiggsfieldCli.new
      client = hf_client(cli)
      url = client.upload("song.wav")
      fake = instance_double(Media::LocalAi)
      allow(Media::LocalAi).to receive(:new).and_return(fake)
      expect(fake).to receive(:transcribe).once.with(File.expand_path("song.wav"), words: true, language: "en", model: "small")
        .and_return({ "text" => "I dream of fire", "chunks" => [{ "text" => "I", "timestamp" => [0.0, 0.3] }] })
      whisper = Higgsfield::Models::Whisper.new(client: client)
      2.times { expect(whisper.transcribe(audio_url: url, chunk_level: "word").output["text"]).to eq("I dream of fire") }
      expect(cli.commands("generate create")).to be_empty
    end
  end

end

RSpec.describe "Higgsfield provider in the pipeline", :media do
  def hf_client(cli) = Higgsfield::Client.new(runner: cli, logger: Logger.new(File::NULL))

  it "routes the Clips step's H3 call through the Higgsfield twin, with the vocal stem in reference mode" do
    image = character(file("identity.png"), width: 1920, height: 1080)
    song = tone(duration: 5)
    movie = video(file("animation.mp4"), audio: song, seconds: 5)
    run = "hf-clips-#{Process.pid}"
    stub_const("Pipeline::GENERATIONS", { run => { steps: [Pipeline::Steps::Clips], **Pipeline.section(0, 24) } })
    project = Pipeline::Project.new(run)
    prompt_dir = File.join(RT, "prompts", run); FileUtils.mkdir_p(prompt_dir)
    File.write(File.join(prompt_dir, "04_clips.yml"), YAML.dump([{ "name" => "sing", "image" => "ref_base", "seconds" => 5, "key" => "green",
                                                                   "audio" => song, "audio_at" => 0, "frames" => 24, "prompt" => "sing" }]))
    cli = FakeHiggsfieldCli.new(result_url: "https://cdn.test/hf/clip.mp4")
    ENV["MV_PROVIDER"] = "higgsfield"
    with_workspace do
      approve
      client = hf_client(cli)
      allow(client).to receive(:download) { |_url, path| FileUtils.cp(movie, path); path }
      project.record(:ref_base, path: image, url: client.upload(image))
      Pipeline::Steps::Clips.new(project: project, client: client).run!
    end
    create = cli.commands("generate create").last
    expect(create[2]).to eq("minimax_h3_max")
    expect(create).to include("--image-references", "--audio-references", "768p")
    expect(project[:clips]["items"]["sing"]["frames"]).to eq(24)
  end
end
