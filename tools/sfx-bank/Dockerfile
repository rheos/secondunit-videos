# earshot 0.4.0 (MIT, Leon Lin, github.com/Leonxlnx/earshot) in a container.
#
# Why Docker: earshot needs PyTorch 2.6 or newer, and PyTorch stopped shipping Intel-Mac wheels after 2.2.2,
# so `pip install earshot` fails on Robin's Intel Mac. The CPU-only Linux wheel in this image runs fine.
# The sound bank (`earshot sfx ...`) renders from code with no models, so no `doctor --fetch` is needed for it.
#
# Build context is a clone of earshot, not this repo:
#   git clone https://github.com/Leonxlnx/earshot ~/src/earshot
#   docker build -f tools/sfx-bank/Dockerfile -t earshot:0.4.0 ~/src/earshot
FROM python:3.11-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg libsndfile1 && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
COPY . /earshot
RUN pip install --no-cache-dir -e "/earshot[mcp]"
ENV EARSHOT_HOME=/cache EARSHOT_THREADS=4
WORKDIR /work
ENTRYPOINT ["earshot"]
