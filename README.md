# Second Unit videos

Every Second Unit music video and look test, one folder each, in one repo. Each folder keeps its own
history (imported with `git subtree`) and its own `.gitignore`.

- New look test or new video: make a folder here and add `!/<folder>/` to the root `.gitignore`.
  Do not create a new GitHub repo for it.
- Never commit lyrics, an artist's audio, photos or renders. The project `.gitignore` files keep them out.
- Tools live elsewhere: `rheos/secondunit-worker` (catalogue, uploader), and the skills repos.

The old per-project repos (rheos/bobwiseman-airplane-*, rheos/hjeron-*, and so on) are archived, read only.
