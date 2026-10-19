# Clean vector look test: ticket stamp

5 s square test of the look in Kevin Ngo's Opus-coded UI animations
(https://x.com/kevin_t_ngo/status/2111974919353544757). Everything is inline SVG and one GSAP timeline;
no image or video model.

Look rules:
- one navy outline (#2A2940) at one weight, 6 px at 1080
- flat fill, one shade band along the bottom, one white highlight streak
- halftone dots only on the shade band
- soft ellipse ground shadow; pastel ground
- 4-point sparkles are the only ornament, and they rest clear of the object
- motion is springs: elastic pop-in, anticipation, squash and stretch on the hit, wobble, slow bob

The stamp ink is IndieAgent red (#C8341E), which also clears 3:1 contrast on the butter yellow.

Render: `npx hyperframes@0.8.174 render . -q high -o out/ticket-stamp_1080.mp4`, then scale to 720x720 with ffmpeg.
