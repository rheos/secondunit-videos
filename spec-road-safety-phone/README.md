# Spec: phone while driving (road-safety brief)

A 7.5 s 9:16 spec shot for an Upwork brief (Rheostream lead 585ea84a, "Animator for Road Safety Video"):
a driver looks at a phone, misses the car ahead braking, and rear-ends it. The style sample to attach to
the proposal. Every frame is inline SVG on one GSAP timeline, and every sound is synthesised in `sfx.py`.
No image, video or audio model was used.

Look: the clean vector look from `indieagent-clean-vector-test` (after Kevin Ngo's Opus UI animations,
`references/kevin-ngo`). Story moves from the Ngo profile:
- the notification is the symbol, three times at rising cost (bubble "1" as he looks down, the phone's
  "2" while the brake lights flare in the windshield, "3" over the wreck)
- the brake light's red carries the cut from the insert back to the side view (iris out, iris in)
- the story reads with the sound off

Shots: side view 0-2.0 s, insert from the driver's seat 2.0-3.6 s, side view with the crash at 4.1 s,
closing screen 6.0-7.5 s (placeholder Cyrillic line and a logo slot; the client supplies both).

Render (720x1280, the house size for 9:16):

    npx hyperframes@0.8.174 render . -q high -o out/spec_silent.mp4
    python sfx.py out/sfx.wav   # needs numpy + scipy
    ffmpeg -i out/spec_silent.mp4 -i out/sfx.wav -c:v libx264 -crf 23 -maxrate 4.5M -bufsize 9M \
      -pix_fmt yuv420p -c:a aac -b:a 192k -shortest out/road-safety-spec_720x1280.mp4
