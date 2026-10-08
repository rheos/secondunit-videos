#!/bin/zsh
# repaint each c7 layout frame in Hjeron's scratchboard style with the locked character (Codex GPT Image)
cd "$(dirname "$0")"
while IFS=$'\t' read -r num fn tt desc; do
  out="c7_${num}_${fn}_v1.png"; [[ -f $out ]] && continue
  lay="layout/t_$(printf '%06.2f' $tt).jpg"
  cat > meta_$num.txt <<META
Use your image_generation tool exactly once, with the three attached images as references (in the order given below). Pass the image prompt below VERBATIM, do not rewrite or embellish it. Then copy the generated file into the current folder as $out. Do nothing else.

IMAGE PROMPT:
Repaint the first attached image, a storyboard frame from a music video, as a finished illustration. Keep its composition, camera angle, framing and where everything sits. Output a tall portrait image.

The scene: $desc

The man is The Wyrd One, drawn exactly as in the second attached image, the locked character sheet: a wide black hat with a braided rope band and a low domed crown, the brim drooping at the sides; a veil of fine strings hanging from the brim over his whole face, so his face is never visible; his own long dark wavy hair (never dreadlocks; from behind you see only hair, no strings); a long open dark leather duster over a vest with a shredded ankle-length hem; a round green beaded rosette amulet with a fringe; a black Les Paul with cream binding. Redraw him with natural proportions as on the sheet; ignore the simple shapes of the figure in the storyboard frame.

The medium: match the third attached image exactly. Two-tone scratchboard, pure white scraped lines and fine stippling on solid black, no grey shading, every tone built from parallel scratches and dots; the figure mostly a black silhouette lit by a hard rim of light. Do not copy the third image's composition.

No text, no letters, no labels, no signature anywhere.
META
  codex exec -s workspace-write --skip-git-repo-check --image=$lay --image=ref_sheet.png --image=ref_style.png - < meta_$num.txt > log_$num.txt 2>&1
  [[ -f $out ]] && echo "DONE $out" || echo "FAIL $num $(tail -2 log_$num.txt | tr '\n' ' ')"
done < shots.tsv
echo ALLDONE
