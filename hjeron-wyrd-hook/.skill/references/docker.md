# Running the toolkit in Docker

`bin/mv-docker` (at the repository root) runs `scripts/mv.rb` inside the `mv-toolkit` image. That image is FOAF's base, `ruby:3.4.11-slim` (Debian 13), with ffmpeg, ImageMagick 7, Python (numpy, Pillow), uv, Node, Chromium and the Higgsfield CLI added from Debian, npm and pip packages. Use it on any machine where installing those natively is slow or unwanted. On Intel Macs, for example, Homebrew builds ImageMagick's dependency chain from source.

```sh
bin/mv-docker build                                   # docker build --pull=false: uses the local base, pulls no image
bin/mv-docker init --project /abs/project --song /abs/song.wav --prompt-file /abs/brief.md --provider higgsfield
bin/mv-docker --project /abs/project setup            # project gems + npm packages; Python is already in the image
bin/mv-docker --project /abs/project doctor
RUN=s01 bin/mv-docker --project /abs/project gen:clips
```

- **Same paths inside and out.** The skill directory and the project are mounted at their own absolute paths, so manifests, receipts and `media.json` read the same in the container and on the host. `--song` and `--prompt-file` directories are mounted read-only. Paths with spaces are refused.
- **Credentials.** The host's `~/.config/higgsfield` (the CLI login) is mounted as is, and nothing is copied into the image. `FAL_AI_API_KEY` passes through only when it is set on the host.
- **Task options** (`RUN`, `ONLY`, `FORCE`, `NOTE`, `SIZE`, `MV_PROVIDER` and the rest) pass through when set on the host.
- **Caches.** Gems, uv environments and Whisper/Demucs weights persist in the `mv-toolkit-cache` volume. The first local Whisper or Demucs run in the container downloads Linux wheels and weights once.
- **Swift VFX** (`vfx:*`) needs macOS and is not in the image. Run those tasks with the native `ruby scripts/mv.rb` on the same project.
- **Chromium** runs with `--no-sandbox` in the container only (`CHROME_NO_SANDBOX=1`, root in a container has no usable sandbox). Native runs are unchanged.
- **Node** is Debian's 20.x. The p5/puppeteer renderer and the media suite pass on it.

CI builds the same image and runs the `core` and `media` profiles inside it.
