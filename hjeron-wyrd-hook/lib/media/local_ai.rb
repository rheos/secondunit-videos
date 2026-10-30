require "json"
require "fileutils"
require_relative "shell"
require_relative "python"

module Media
  # Whisper and Demucs run on this machine for the Higgsfield provider (Higgsfield has no Demucs, and its
  # speech2text word timing is undocumented). Each runs in its own pinned `uv` environment so the project
  # venv stays light; the first call downloads the packages and model weights, later calls are cached.
  class LocalAi < Shell
    PYTHON = ENV.fetch("LOCAL_AI_PYTHON", "3.11")
    WHISPER = %w[--with faster-whisper].freeze
    # torch 2.2.2 is the last release with Intel-Mac wheels; demucs 4.1 needs a native build (sphn) that fails there.
    DEMUCS = ["--with", "torch==2.2.2", "--with", "torchaudio==2.2.2", "--with", "demucs==4.0.1", "--with", "numpy<2", "--with", "soundfile"].freeze

    def self.available? = Shell.available?("uv")

    # Fal-shaped transcript: { "text", "chunks" => [{ "text", "timestamp" => [s, e] }] }.
    def transcribe(audio, words: false, language: "en", model: "small")
      args = [audio, "--model", model, "--language", language]
      args << "--words" if words
      JSON.parse(uv(WHISPER, "local_whisper.py", *args))
    end

    # { stem => wav path } for the requested stems (vocals alone uses Demucs' faster two-stem mode).
    def stems(audio, out_dir, stems: %w[vocals], model: "htdemucs")
      FileUtils.mkdir_p(out_dir)
      JSON.parse(uv(DEMUCS, "local_demucs.py", audio, out_dir, "--model", model, "--stems", stems.join(",")))
    end

    private

    def uv(deps, script, *args)
      raise CommandError, "uv is required for local Whisper/Demucs (brew install uv)" unless self.class.available?
      run("uv", "run", "-q", "--no-project", "--python", PYTHON, *deps, "python", File.join(Python::SCRIPTS, script), *args).lines.last
    end
  end
end
