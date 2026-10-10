# Evaluated inside Pipeline; see the skill task reference. Hook [1554,1902), docs/PLAN.md.
S = [Steps::RefBase, Steps::Music, Steps::Keyframes, Steps::Clips, Steps::Overlay]
{
  "char-wolf-v1" => { steps: [Steps::RefBase] },
  "char-wyrd-v1" => { steps: [Steps::RefBase] },
  "style-s1" => { steps: [Steps::RefBase] },
  "s01" => { steps: S, import: { ref_base: "char-wyrd-v1" }, **section(1554, 80), plate: "camp", upload_music: false },
  "s02" => { steps: S, import: { ref_base: "char-wyrd-v1" }, **section(1634, 66), plate: "s01/camp", upload_music: false },
  "s03" => { steps: S, import: { ref_base: "char-wyrd-v1" }, **section(1700, 85), plate: "sky", upload_music: false },
  "s04" => { steps: S, import: { ref_base: "char-wolf-v1" }, **section(1785, 39), plate: "fire_ground", upload_music: false },
  "s05" => { steps: S, import: { ref_base: "char-wolf-v1" }, **section(1824, 78), plate: "s01/camp", upload_music: false }
}
